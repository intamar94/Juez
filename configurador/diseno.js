// Lógica del configurador de Nido (sin DOM, para poder probarla con `node --test`).
// Medidas en milímetros. Debe coincidir con cad/nido.scad.
//
// El corral es una cadena de paneles unidos por postes redondos. Cada panel gira
// libremente alrededor del poste, así que su dirección (rumbo, en grados) es libre.

export const SISTEMA = {
  modulos: [300, 600, 800], // distancia entre ejes de poste
  bordeEje: 22, // del eje del poste al canto del panel
  anguloMin: 60, // ángulo interior mínimo entre dos paneles (si no, chocan las uniones)
  toleranciaCierre: 40, // si el último poste queda a menos de esto del primero, el corral se cierra
  toleranciaPared: 80, // distancia máxima de un extremo anclado a la pared
};

// Precios de referencia en pesos colombianos (COP) para el prototipo.
// Sustituir por cotizaciones reales (ver docs/plan-lanzamiento.md, paso 3).
export const PRECIOS = {
  panel: { 300: 45000, 600: 75000, 800: 95000 },
  bordeConForma: 10000,
  poste: 18000,
  tapa: 6000,
  relleno: 4000,
  abrazaderaPared: 9000,
  perno: 1500,
  inserto: 1500,
};

export const BORDES = {
  recto: 'Recto',
  olas: 'Olas',
  montanas: 'Montañas',
  nubes: 'Nubes',
};

// Tipos de panel. Todo lo que no es "barrotes" es una adaptación que se vende aparte.
export const TIPOS = {
  barrotes: { nombre: 'Barrotes', extra: 0, desde: 0, hasta: 96 },
  puerta: { nombre: 'Puerta con cierre', extra: 60000, desde: 0, hasta: 96, modulos: [800] },
  espejo: { nombre: 'Ventana con espejo', extra: 45000, desde: 0, hasta: 18, modulos: [600, 800] },
  luz: { nombre: 'Ventana con luz', extra: 85000, desde: 0, hasta: 72, modulos: [600, 800] },
  colores: { nombre: 'Ventana de colores', extra: 35000, desde: 6, hasta: 36, modulos: [600, 800] },
  pizarra: { nombre: 'Pizarra', extra: 25000, desde: 18, hasta: 96, modulos: [600, 800] },
};

export const UNIONES = {
  anillo: { nombre: 'Anillo impreso', precio: 7000, pernos: 1, insertos: 0 },
  correa: { nombre: 'Correa de cinta', precio: 5000, pernos: 1, insertos: 0 },
  abrazadera: { nombre: 'Abrazadera de ferretería', precio: 9000, pernos: 0, insertos: 1 },
};

export function tiposParaEdad(meses) {
  return Object.entries(TIPOS)
    .filter(([id, t]) => id !== 'barrotes' && meses >= t.desde && meses <= t.hasta)
    .map(([id]) => id);
}

export function tipoValido(tipo, modulo) {
  const t = TIPOS[tipo];
  return !!t && (!t.modulos || t.modulos.includes(modulo));
}

const rad = (g) => (g * Math.PI) / 180;
const grados = (r) => (r * 180) / Math.PI;

// Diferencia de rumbo normalizada a (-180, 180].
export function giro(rumboA, rumboB) {
  let d = (((rumboB - rumboA) % 360) + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}

// Posiciones de los postes a partir del inicio y de los rumbos de cada panel.
export function postes(inicio, tramos) {
  const pts = [inicio];
  for (const t of tramos) {
    const [x, y] = pts[pts.length - 1];
    pts.push([x + t.modulo * Math.cos(rad(t.rumbo)), y + t.modulo * Math.sin(rad(t.rumbo))]);
  }
  return pts;
}

// Rumbo para que el panel que sale de `desde` apunte hacia `hacia`.
export function rumboHacia(desde, hacia) {
  return grados(Math.atan2(hacia[1] - desde[1], hacia[0] - desde[0]));
}

function areaPoligono(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2;
}

function distanciaPared([x, y], hab) {
  return Math.min(x, y, hab.ancho - x, hab.fondo - y);
}

// Calcula el corral completo: postes, ángulos, avisos, lista de piezas y costos.
export function disenar({ inicio, tramos, union = 'anillo', anclado = true, habitacion }) {
  const n = tramos.length;
  const pts = postes(inicio, tramos);
  const hueco = n >= 3 ? Math.hypot(pts[n][0] - pts[0][0], pts[n][1] - pts[0][1]) : Infinity;
  const cerrado = hueco <= SISTEMA.toleranciaCierre;
  const nPostes = cerrado ? n : n + 1;
  const avisos = [];

  // Ángulo interior en cada poste compartido por dos paneles.
  const angulos = [];
  for (let i = 1; i < n; i++) {
    angulos.push({ poste: i, angulo: Math.round(180 - Math.abs(giro(tramos[i - 1].rumbo, tramos[i].rumbo))) });
  }
  if (cerrado) {
    angulos.push({ poste: 0, angulo: Math.round(180 - Math.abs(giro(tramos[n - 1].rumbo, tramos[0].rumbo))) });
  }
  const agudos = angulos.filter((a) => a.angulo < SISTEMA.anguloMin);
  if (agudos.length) {
    avisos.push(`${agudos.length === 1 ? 'Un ángulo es' : `${agudos.length} ángulos son`} menor de ${SISTEMA.anguloMin}°: las uniones de los paneles chocarían.`);
  }

  tramos.forEach((t, i) => {
    if (!tipoValido(t.tipo, t.modulo)) {
      avisos.push(`El panel ${i + 1} (${TIPOS[t.tipo]?.nombre ?? t.tipo}) no existe en ${t.modulo / 10} cm.`);
    }
  });

  if (habitacion) {
    const fuera = pts.some(([x, y]) => x < -1 || y < -1 || x > habitacion.ancho + 1 || y > habitacion.fondo + 1);
    if (fuera) avisos.push('Parte del corral queda fuera de la habitación.');
    if (!cerrado && anclado && n > 0) {
      const lejos = [pts[0], pts[n]].some((p) => distanciaPared(p, habitacion) > SISTEMA.toleranciaPared);
      if (lejos) avisos.push('Un extremo no llega a la pared: acércalo o cierra el corral.');
    }
  }
  if (!cerrado && !anclado) avisos.push('Un corral abierto tiene que ir anclado a la pared o cerrarse.');
  if (!cerrado && hueco < 300) avisos.push(`Faltan ${Math.round(hueco / 10)} cm para cerrar el corral.`);

  // Lista de piezas
  const piezas = [];
  const agregar = (nombre, cantidad, precio, extra = {}) => {
    if (cantidad > 0) piezas.push({ nombre, cantidad, precio, ...extra });
  };

  const grupos = new Map();
  for (const t of tramos) {
    const clave = `${t.modulo}|${t.tipo}|${t.borde}`;
    grupos.set(clave, (grupos.get(clave) || 0) + 1);
  }
  for (const [clave, cantidad] of grupos) {
    const [modulo, tipo, borde] = clave.split('|');
    const precio = PRECIOS.panel[modulo] + (TIPOS[tipo]?.extra ?? 0) + (borde === 'recto' ? 0 : PRECIOS.bordeConForma);
    const forma = borde === 'recto' ? '' : `, borde de ${BORDES[borde].toLowerCase()}`;
    agregar(`Panel ${modulo / 10} cm · ${TIPOS[tipo]?.nombre ?? tipo}${forma}`, cantidad, precio, { adaptacion: tipo !== 'barrotes' });
  }

  const u = UNIONES[union];
  const nUniones = 4 * n;
  agregar('Poste Ø40 mm × 67 cm', nPostes, PRECIOS.poste);
  agregar(`${u.nombre} (4 por panel)`, nUniones, u.precio, { impresa: union === 'anillo' ? 'anillo' : null });
  agregar('Relleno para poste de extremo (tubo PVC 1½")', cerrado ? 0 : 4, PRECIOS.relleno);
  agregar('Abrazadera de pared para tubo de 40 mm', !cerrado && anclado ? 4 : 0, PRECIOS.abrazaderaPared);
  agregar('Tapa de poste (impresa)', nPostes, PRECIOS.tapa, { impresa: 'tapa' });
  agregar('Perno de coche M6 × 40 con tuerca ciega', nUniones * u.pernos, PRECIOS.perno);
  agregar('Tuerca de inserción M8 para madera', nUniones * u.insertos, PRECIOS.inserto);

  const HORAS = { anillo: 1.5, tapa: 1.5 };
  const horasImpresion = piezas.reduce((s, p) => s + (p.impresa ? HORAS[p.impresa] * p.cantidad : 0), 0);
  const total = piezas.reduce((s, p) => s + p.cantidad * p.precio, 0);
  const adaptaciones = piezas.filter((p) => p.adaptacion).reduce((s, p) => s + p.cantidad, 0);

  return {
    postes: pts,
    cerrado,
    hueco,
    angulos,
    avisos,
    piezas,
    total,
    horasImpresion,
    adaptaciones,
    nPostes,
    largo: tramos.reduce((s, t) => s + t.modulo, 0),
    // un corral abierto se cierra contra la pared, que une sus dos extremos
    area: n >= 2 ? areaPoligono(cerrado ? pts.slice(0, n) : pts) / 1e6 : 0,
  };
}

// Diseños de ejemplo. Habitación con la pared principal arriba (y = 0) y la izquierda en x = 0.
const P = (modulo, rumbo, tipo = 'barrotes', borde = 'recto') => ({ modulo, rumbo, tipo, borde });

export const EJEMPLOS = {
  curva: {
    nombre: 'Curva contra la pared',
    inicio: [700, 20],
    anclado: true,
    tramos: [
      P(600, 90, 'barrotes', 'olas'),
      P(300, 60),
      P(300, 30),
      P(800, 0, 'puerta'),
      P(600, 0, 'espejo'),
      P(300, -30),
      P(300, -60),
      P(600, -90, 'barrotes', 'olas'),
    ],
  },
  rincon: {
    nombre: 'Rincón redondeado',
    inicio: [20, 1330],
    anclado: true,
    tramos: [
      P(800, 0, 'puerta'),
      P(300, -30, 'barrotes', 'nubes'),
      P(300, -60, 'barrotes', 'nubes'),
      P(600, -90, 'luz'),
      P(300, -90),
    ],
  },
  isla: {
    nombre: 'Isla rectangular',
    inicio: [1000, 900],
    anclado: false,
    tramos: [P(800, 0, 'puerta'), P(600, 90), P(800, 180, 'espejo'), P(600, 270)],
  },
  hexagono: {
    nombre: 'Hexágono',
    inicio: [1200, 700],
    anclado: false,
    tramos: [0, 60, 120, 180, 240, 300].map((r, i) => P(800, r, i === 0 ? 'puerta' : 'barrotes', i === 0 ? 'recto' : 'montanas')),
  },
};
