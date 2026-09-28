// Lógica del configurador de Nido (sin DOM, para poder probarla con `node --test`).
// Medidas en milímetros. Debe coincidir con cad/nido.scad.

export const SISTEMA = {
  anchosPanel: [400, 600, 800],
  posteDiam: 40,
  anclajeGrosor: 6,
  anchoPuerta: 800,
};

// Estimaciones de costo y tiempo por pieza (USD, horas de impresión, gramos de PETG).
// Son valores de partida para el prototipo; ajústalos con cotizaciones reales.
export const COSTOS = {
  panel: { 400: 28, 600: 38, 800: 48 },
  puerta: 75,
  poste: 12,
  pernoM6: 0.6,
  filamentoPorKg: 25,
  impresas: {
    nodo: { gramos: 60, horas: 3.5 },
    anclaje: { gramos: 40, horas: 2.5 },
    tapa: { gramos: 15, horas: 1 },
  },
};

// Diferencia máxima aceptable entre el largo pedido y el real de un lado (mm).
export const TOLERANCIA_LADO = 60;

export const FORMAS = {
  rectangulo: 'Rectángulo (4 lados)',
  pared: 'Contra una pared (3 lados)',
  esquina: 'En una esquina (2 lados)',
  L: 'En forma de L',
  hexagono: 'Hexágono',
};

// Módulos por edad (meses). Todos usan el enganche universal.
export const MODULOS = [
  { id: 'espejo', nombre: 'Panel espejo irrompible', desde: 0, hasta: 12, precio: 22 },
  { id: 'texturas', nombre: 'Panel sensorial de texturas', desde: 0, hasta: 18, precio: 18 },
  { id: 'luz', nombre: 'Luz nocturna cálida (USB, sin pilas)', desde: 0, hasta: 60, precio: 29 },
  { id: 'barra', nombre: 'Barra para pararse', desde: 6, hasta: 24, precio: 20 },
  { id: 'engranajes', nombre: 'Panel de engranajes', desde: 9, hasta: 36, precio: 24 },
  { id: 'abaco', nombre: 'Ábaco de colores', desde: 12, hasta: 36, precio: 19 },
  { id: 'luces-armables', nombre: 'Luces armables (piezas que encienden al conectarlas)', desde: 18, hasta: 72, precio: 45 },
  { id: 'pizarra', nombre: 'Tablero para dibujar', desde: 18, hasta: 72, precio: 26 },
  { id: 'estante', nombre: 'Estante bajo para libros', desde: 24, hasta: 96, precio: 32 },
];

export function modulosParaEdad(meses) {
  return MODULOS.filter((m) => meses >= m.desde && meses <= m.hasta);
}

// Vértices de la forma. `cerrada` indica si el último vértice se une con el primero;
// si no, los extremos van anclados a la pared.
export function vertices(forma, ancho, fondo) {
  const A = ancho;
  const F = fondo;
  switch (forma) {
    case 'rectangulo':
      return { puntos: [[0, 0], [A, 0], [A, F], [0, F]], cerrada: true };
    case 'pared':
      return { puntos: [[0, 0], [0, F], [A, F], [A, 0]], cerrada: false };
    case 'esquina':
      // la esquina de la habitación (0,0) cierra el área junto con las dos paredes
      return { puntos: [[0, F], [A, F], [A, 0]], cerrada: false, cierre: [[0, 0]] };
    case 'L':
      return {
        puntos: [[0, 0], [A, 0], [A, F / 2], [A / 2, F / 2], [A / 2, F], [0, F]],
        cerrada: true,
      };
    case 'hexagono': {
      const r = A / 2;
      const puntos = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        puntos.push([r + r * Math.cos(a), r * Math.sin(Math.PI / 3) + r * Math.sin(a)]);
      }
      return { puntos, cerrada: true };
    }
    default:
      throw new Error(`Forma desconocida: ${forma}`);
  }
}

// Longitud real de un lado con esta combinación de paneles.
// Cada panel va entre dos postes; en un extremo con pared hay un anclaje en vez de poste.
function largoReal(paneles, extremosPared) {
  const { posteDiam, anclajeGrosor } = SISTEMA;
  const suma = paneles.reduce((a, b) => a + b, 0);
  const postesIntermedios = paneles.length - 1;
  const extremos = (2 - extremosPared) * (posteDiam / 2) + extremosPared * anclajeGrosor;
  return suma + postesIntermedios * posteDiam + extremos;
}

// Elige la combinación de paneles que más se acerca al largo pedido
// (a igualdad, la que usa menos paneles).
export function llenarLado(largo, extremosPared = 0, anchos = SISTEMA.anchosPanel) {
  let mejor = null;
  const ordenados = [...anchos].sort((a, b) => b - a);
  const maxPaneles = Math.ceil(largo / Math.min(...anchos)) + 1;

  function probar(actual, desde) {
    if (actual.length > 0) {
      const real = largoReal(actual, extremosPared);
      const error = Math.abs(real - largo);
      if (
        !mejor ||
        error < mejor.error - 0.5 ||
        (Math.abs(error - mejor.error) <= 0.5 && actual.length < mejor.paneles.length)
      ) {
        mejor = { paneles: [...actual], largoReal: real, error };
      }
    }
    if (actual.length >= maxPaneles) return;
    for (let i = desde; i < ordenados.length; i++) {
      actual.push(ordenados[i]);
      probar(actual, i);
      actual.pop();
    }
  }

  probar([], 0);
  return mejor;
}

function anguloInterior(prev, actual, sig, antihorario) {
  const a1 = Math.atan2(prev[1] - actual[1], prev[0] - actual[0]);
  const a2 = Math.atan2(sig[1] - actual[1], sig[0] - actual[0]);
  let ang = ((a2 - a1) * 180) / Math.PI;
  ang = ((ang % 360) + 360) % 360;
  return Math.round(antihorario ? 360 - ang : ang);
}

function areaFirmada(puntos) {
  let s = 0;
  for (let i = 0; i < puntos.length; i++) {
    const [x1, y1] = puntos[i];
    const [x2, y2] = puntos[(i + 1) % puntos.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}

// Calcula el diseño completo: lados, nodos, lista de piezas y costos.
export function disenar({ forma, ancho, fondo, puerta = true, modulos = [] }) {
  const { puntos, cerrada, cierre = [] } = vertices(forma, ancho, fondo);
  const n = puntos.length;
  const nLados = cerrada ? n : n - 1;
  // en las formas abiertas, la pared (y la esquina, si la hay) cierra el polígono
  const contorno = [...puntos, ...cierre];
  const area = Math.abs(areaFirmada(contorno)) / 1e6;
  const antihorario = areaFirmada(contorno) > 0;

  const lados = [];
  for (let i = 0; i < nLados; i++) {
    const p = puntos[i];
    const q = puntos[(i + 1) % n];
    const largo = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const extremosPared = cerrada ? 0 : (i === 0 ? 1 : 0) + (i === nLados - 1 ? 1 : 0);
    lados.push({ desde: p, hasta: q, largo, extremosPared, ...llenarLado(largo, extremosPared) });
  }

  // La puerta sustituye un panel de 800 en el lado más largo que lo tenga.
  let ladoPuerta = -1;
  if (puerta) {
    let mejorLargo = -1;
    lados.forEach((l, i) => {
      if (l.paneles.includes(SISTEMA.anchoPuerta) && l.largo > mejorLargo) {
        mejorLargo = l.largo;
        ladoPuerta = i;
      }
    });
    if (ladoPuerta === -1) {
      // Ningún lado trae un panel de 800: probar a meterlo en el lado más largo,
      // solo o seguido de otros paneles. Si así el lado queda descuadrado, no hay puerta.
      const i = lados.reduce((m, l, k) => (l.largo > lados[m].largo ? k : m), 0);
      const { largo, extremosPared } = lados[i];
      const candidatos = [[SISTEMA.anchoPuerta]];
      const resto = largo - SISTEMA.anchoPuerta - SISTEMA.posteDiam;
      if (resto > 0) candidatos.push([SISTEMA.anchoPuerta, ...llenarLado(resto, extremosPared).paneles]);
      const mejor = candidatos
        .map((paneles) => {
          const real = largoReal(paneles, extremosPared);
          return { paneles, largoReal: real, error: Math.abs(real - largo) };
        })
        .sort((a, b) => a.error - b.error)[0];
      if (mejor.error <= TOLERANCIA_LADO) {
        lados[i] = { ...lados[i], ...mejor };
        ladoPuerta = i;
      }
    }
  }
  const puertaNoCabe = puerta && ladoPuerta === -1;

  // Nodos: uno por vértice con poste, más uno de 180° entre paneles de un mismo lado.
  const nodos = {};
  const sumarNodo = (angulo, cantidad = 1) => {
    nodos[angulo] = (nodos[angulo] || 0) + cantidad;
  };
  for (let i = 0; i < n; i++) {
    const esExtremoPared = !cerrada && (i === 0 || i === n - 1);
    if (esExtremoPared) continue;
    const prev = puntos[(i - 1 + n) % n];
    const sig = puntos[(i + 1) % n];
    sumarNodo(anguloInterior(prev, puntos[i], sig, antihorario));
  }
  lados.forEach((l) => sumarNodo(180, l.paneles.length - 1));

  const postes = Object.values(nodos).reduce((a, b) => a + b, 0);
  const anclajes = cerrada ? 0 : 2;

  const paneles = {};
  lados.forEach((l, i) => {
    l.paneles.forEach((w, k) => {
      const esPuerta = i === ladoPuerta && k === l.paneles.indexOf(SISTEMA.anchoPuerta);
      const clave = esPuerta ? 'puerta' : String(w);
      paneles[clave] = (paneles[clave] || 0) + 1;
    });
  });

  const piezas = [];
  for (const w of SISTEMA.anchosPanel) {
    if (paneles[w]) {
      piezas.push({ nombre: `Panel ${w / 10} cm (CNC)`, cantidad: paneles[w], precio: COSTOS.panel[w] });
    }
  }
  if (paneles.puerta) {
    piezas.push({ nombre: 'Panel puerta 80 cm con cierre', cantidad: paneles.puerta, precio: COSTOS.puerta });
  }
  piezas.push({ nombre: `Poste Ø${SISTEMA.posteDiam} mm`, cantidad: postes, precio: COSTOS.poste });

  const { impresas, filamentoPorKg } = COSTOS;
  const precioImpresa = (tipo) => (impresas[tipo].gramos / 1000) * filamentoPorKg;
  let horas = 0;
  let gramos = 0;
  for (const [angulo, cant] of Object.entries(nodos).sort((a, b) => a[0] - b[0])) {
    piezas.push({
      nombre: `Nodo ${angulo}° (impreso, 2 por poste)`,
      cantidad: cant * 2,
      precio: precioImpresa('nodo'),
      impresa: 'nodo',
    });
  }
  if (anclajes) {
    piezas.push({
      nombre: 'Anclaje a pared (impreso, 2 por extremo)',
      cantidad: anclajes * 2,
      precio: precioImpresa('anclaje'),
      impresa: 'anclaje',
    });
  }
  piezas.push({ nombre: 'Tapa decorativa (impresa)', cantidad: postes, precio: precioImpresa('tapa'), impresa: 'tapa' });

  const totalPaneles = Object.values(paneles).reduce((a, b) => a + b, 0);
  const pernos = totalPaneles * 4;
  piezas.push({ nombre: 'Perno M6 con tuerca ciega', cantidad: pernos, precio: COSTOS.pernoM6 });

  for (const p of piezas) {
    if (p.impresa) {
      horas += impresas[p.impresa].horas * p.cantidad;
      gramos += impresas[p.impresa].gramos * p.cantidad;
    }
  }

  const elegidos = MODULOS.filter((m) => modulos.includes(m.id));
  for (const m of elegidos) {
    piezas.push({ nombre: `Módulo: ${m.nombre}`, cantidad: 1, precio: m.precio });
  }

  const total = piezas.reduce((s, p) => s + p.cantidad * p.precio, 0);
  const errorMax = Math.max(...lados.map((l) => l.error));

  return {
    forma,
    cerrada,
    puntos,
    lados,
    ladoPuerta,
    puertaNoCabe,
    nodos,
    postes,
    anclajes,
    piezas,
    area,
    horasImpresion: horas,
    gramosFilamento: gramos,
    total,
    errorMax,
  };
}
