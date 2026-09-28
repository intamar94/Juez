import {
  BORDES, disenar, EJEMPLOS, giro, postes, rumboHacia, SISTEMA, TIPOS, tiposParaEdad, tipoValido, UNIONES,
} from './diseno.js';

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });
const PASO_GIRO = 5; // al arrastrar, el rumbo se ajusta de 5 en 5 grados

const estado = { inicio: [0, 0], tramos: [], anclado: true };

function cargarEjemplo(id) {
  const ej = EJEMPLOS[id];
  estado.inicio = [...ej.inicio];
  estado.tramos = ej.tramos.map((t) => ({ ...t }));
  estado.anclado = ej.anclado;
  $('anclado').checked = ej.anclado;
  pintarTramos();
  actualizar();
}

function opcion(valor, texto, elegido) {
  return new Option(texto, valor, false, valor === elegido);
}

// Lista de paneles en el formulario.
function pintarTramos() {
  const cont = $('tramos');
  cont.replaceChildren(
    ...estado.tramos.map((t, i) => {
      const fila = document.createElement('div');
      fila.className = 'tramo';
      fila.dataset.i = i;

      const n = document.createElement('span');
      n.className = 'n';
      n.textContent = i + 1;

      const mod = document.createElement('select');
      mod.className = 'mod';
      mod.id = `mod-${i}`;
      mod.setAttribute('aria-label', `Tamaño del panel ${i + 1}`);
      mod.append(...SISTEMA.modulos.map((m) => opcion(String(m), `${m / 10} cm`, String(t.modulo))));

      const tipo = document.createElement('select');
      tipo.className = 'tipo';
      tipo.id = `tipo-${i}`;
      tipo.setAttribute('aria-label', `Tipo del panel ${i + 1}`);
      tipo.append(...Object.entries(TIPOS).map(([id, def]) => {
        const o = opcion(id, def.nombre, t.tipo);
        o.disabled = !tipoValido(id, t.modulo);
        return o;
      }));

      const g = document.createElement('input');
      g.type = 'number';
      g.className = 'giro';
      g.id = `giro-${i}`;
      g.step = 5;
      g.setAttribute('aria-label', i === 0 ? 'Dirección del primer panel' : `Giro del panel ${i + 1}`);
      g.title = i === 0 ? 'Dirección del primer panel (grados)' : 'Giro respecto al panel anterior (grados)';
      g.value = Math.round(i === 0 ? t.rumbo : giro(estado.tramos[i - 1].rumbo, t.rumbo));

      const borde = document.createElement('select');
      borde.className = 'borde';
      borde.id = `borde-${i}`;
      borde.setAttribute('aria-label', `Borde superior del panel ${i + 1}`);
      borde.append(...Object.entries(BORDES).map(([id, nombre]) => opcion(id, `Borde ${nombre.toLowerCase()}`, t.borde)));

      const quitar = document.createElement('button');
      quitar.type = 'button';
      quitar.className = 'quitar';
      quitar.textContent = '✕';
      quitar.setAttribute('aria-label', `Quitar el panel ${i + 1}`);

      fila.append(n, mod, tipo, g, quitar, borde);
      return fila;
    }),
  );
}

function sincronizarGiros() {
  estado.tramos.forEach((t, i) => {
    const g = $(`giro-${i}`);
    if (g && document.activeElement !== g) {
      g.value = Math.round(i === 0 ? t.rumbo : giro(estado.tramos[i - 1].rumbo, t.rumbo));
    }
  });
}

function onFormulario(e) {
  const fila = e.target.closest('.tramo');
  if (fila) {
    const i = Number(fila.dataset.i);
    const t = estado.tramos[i];
    if (e.target.classList.contains('mod')) {
      t.modulo = Number(e.target.value);
      if (!tipoValido(t.tipo, t.modulo)) t.tipo = 'barrotes';
      pintarTramos();
    } else if (e.target.classList.contains('tipo')) {
      t.tipo = e.target.value;
    } else if (e.target.classList.contains('borde')) {
      t.borde = e.target.value;
    } else if (e.target.classList.contains('giro')) {
      const valor = Number(e.target.value) || 0;
      const actual = i === 0 ? t.rumbo : giro(estado.tramos[i - 1].rumbo, t.rumbo);
      const delta = valor - actual;
      // girar este panel arrastra a todos los siguientes
      for (let k = i; k < estado.tramos.length; k++) estado.tramos[k].rumbo += delta;
    }
  }
  if (e.target.id === 'anclado') estado.anclado = e.target.checked;
  if (e.target.id === 'edad') pintarRecomendadas();
  actualizar();
}

function onClick(e) {
  const quitar = e.target.closest('.quitar');
  if (quitar) {
    estado.tramos.splice(Number(quitar.closest('.tramo').dataset.i), 1);
    pintarTramos();
    actualizar();
  }
}

function agregarPanel() {
  const ultimo = estado.tramos[estado.tramos.length - 1];
  estado.tramos.push({ modulo: 600, rumbo: ultimo ? ultimo.rumbo : 0, tipo: 'barrotes', borde: 'recto' });
  pintarTramos();
  actualizar();
}

function pintarRecomendadas() {
  const edad = Number($('edad').value) || 0;
  const ids = tiposParaEdad(edad).filter((id) => id !== 'puerta');
  $('recomendadas').replaceChildren(
    ...ids.map((id) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = `${TIPOS[id].nombre} · +${cop.format(TIPOS[id].extra)}`;
      return chip;
    }),
  );
}

// ---------- plano ----------

function el(tipo, attrs, padre) {
  const e = document.createElementNS(NS, tipo);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (padre) padre.append(e);
  return e;
}

function habitacion() {
  const cm = (id) => Math.max(100, Number($(id).value) || 0) * 10;
  return { ancho: cm('habAncho'), fondo: cm('habFondo') };
}

function dibujar(d, hab) {
  const svg = $('svg');
  svg.replaceChildren();
  const m = 220;
  svg.setAttribute('viewBox', `${-m} ${-m} ${hab.ancho + 2 * m} ${hab.fondo + 2 * m}`);
  el('rect', { x: 0, y: 0, width: hab.ancho, height: hab.fondo, class: 'hab' }, svg);

  const pts = d.postes;
  const n = estado.tramos.length;
  if (n >= 2) el('polygon', { points: (d.cerrado ? pts.slice(0, n) : pts).map((p) => p.join(',')).join(' '), class: 'area' }, svg);

  estado.tramos.forEach((t, i) => {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const ux = (bx - ax) / t.modulo;
    const uy = (by - ay) / t.modulo;
    const e = SISTEMA.bordeEje;
    const clase = t.tipo === 'puerta' ? 'panel puerta' : t.tipo === 'barrotes' ? 'panel' : 'panel adaptacion';
    el('line', { x1: ax + ux * e, y1: ay + uy * e, x2: bx - ux * e, y2: by - uy * e, class: clase }, svg);
    const txt = el('text', { x: (ax + bx) / 2 - uy * 120, y: (ay + by) / 2 + ux * 120 + 35, class: 'etiqueta' }, svg);
    txt.textContent = i + 1;
  });

  if (!d.cerrado && n >= 3 && d.hueco < 600) {
    el('line', { x1: pts[n][0], y1: pts[n][1], x2: pts[0][0], y2: pts[0][1], class: 'cierre' }, svg);
  }

  for (const a of d.angulos) {
    const [x, y] = pts[a.poste];
    const t = el('text', { x, y: y - 70, class: a.angulo < SISTEMA.anguloMin ? 'angulo mal' : 'angulo' }, svg);
    t.textContent = `${a.angulo}°`;
  }

  if (!d.cerrado && estado.anclado && n > 0) {
    for (const [x, y] of [pts[0], pts[n]]) el('rect', { x: x - 50, y: y - 50, width: 100, height: 100, rx: 14, class: 'anclaje' }, svg);
  }

  const visibles = d.cerrado ? pts.slice(0, n) : pts;
  visibles.forEach(([x, y], k) => {
    el('circle', { cx: x, cy: y, r: 40, class: 'poste', 'data-k': k }, svg);
    el('circle', { cx: x, cy: y, r: 110, class: 'agarre', 'data-k': k }, svg);
  });
}

// Arrastrar un poste: el primero mueve todo; los demás giran el panel que llega a ellos.
let arrastre = null;

function puntoSvg(e) {
  const svg = $('svg');
  const p = svg.createSVGPoint();
  p.x = e.clientX;
  p.y = e.clientY;
  const q = p.matrixTransform(svg.getScreenCTM().inverse());
  return [q.x, q.y];
}

function onPointerDown(e) {
  const k = e.target.dataset?.k;
  if (k === undefined) return;
  arrastre = { k: Number(k), origen: puntoSvg(e), inicio: [...estado.inicio] };
  $('svg').setPointerCapture(e.pointerId);
  e.preventDefault();
}

function onPointerMove(e) {
  if (!arrastre) return;
  const p = puntoSvg(e);
  if (arrastre.k === 0) {
    estado.inicio = [
      Math.round(arrastre.inicio[0] + p[0] - arrastre.origen[0]),
      Math.round(arrastre.inicio[1] + p[1] - arrastre.origen[1]),
    ];
  } else {
    const i = arrastre.k - 1;
    const pts = postes(estado.inicio, estado.tramos);
    const libre = e.shiftKey;
    const r = rumboHacia(pts[i], p);
    estado.tramos[i].rumbo = libre ? Math.round(r) : Math.round(r / PASO_GIRO) * PASO_GIRO;
  }
  sincronizarGiros();
  actualizar();
}

function onPointerUp() {
  arrastre = null;
}

// ---------- resultados ----------

function actualizar() {
  const hab = habitacion();
  const d = disenar({
    inicio: estado.inicio,
    tramos: estado.tramos,
    union: $('union').value,
    anclado: estado.anclado,
    habitacion: hab,
  });
  dibujar(d, hab);

  $('cifras').innerHTML = [
    [num.format(d.area), 'm² de juego'],
    [estado.tramos.length, `paneles · ${d.adaptaciones} adaptaciones`],
    [`${num.format(d.largo / 1000)} m`, d.cerrado ? 'de perímetro, cerrado' : 'de largo, abierto'],
    [`${Math.round(d.horasImpresion)} h`, 'de impresión 3D'],
    [cop.format(d.total), 'total estimado'],
  ].map(([v, t]) => `<div class="cifra"><b>${v}</b><span>${t}</span></div>`).join('');

  $('aviso').hidden = d.avisos.length === 0;
  $('aviso').innerHTML = d.avisos.length ? `<ul>${d.avisos.map((a) => `<li>${a}</li>`).join('')}</ul>` : '';

  $('piezas').innerHTML = d.piezas.map((p) => `
    <tr${p.adaptacion ? ' class="adaptacion"' : ''}><td>${p.nombre}</td><td class="num">${p.cantidad}</td>
    <td class="num">${cop.format(p.precio)}</td><td class="num">${cop.format(p.cantidad * p.precio)}</td></tr>`).join('');
  $('total').textContent = cop.format(d.total);
}

function iniciar() {
  $('ejemplos').append(...Object.entries(EJEMPLOS).map(([id, ej]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = ej.nombre;
    b.addEventListener('click', () => cargarEjemplo(id));
    return b;
  }));
  $('union').append(...Object.entries(UNIONES).map(([id, u]) => opcion(id, `${u.nombre} · ${cop.format(u.precio)}`, 'anillo')));

  const form = $('form');
  form.addEventListener('input', onFormulario);
  form.addEventListener('click', onClick);
  form.addEventListener('submit', (e) => e.preventDefault());
  $('agregar').addEventListener('click', agregarPanel);

  const svg = $('svg');
  svg.addEventListener('pointerdown', onPointerDown);
  svg.addEventListener('pointermove', onPointerMove);
  svg.addEventListener('pointerup', onPointerUp);
  svg.addEventListener('pointercancel', onPointerUp);

  pintarRecomendadas();
  cargarEjemplo('curva');
}

iniciar();
