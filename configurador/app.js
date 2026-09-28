import { disenar, FORMAS, MODULOS, modulosParaEdad, SISTEMA, TOLERANCIA_LADO } from './diseno.js';

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const usd = new Intl.NumberFormat('es', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('es', { maximumFractionDigits: 1 });

let seleccion = new Set();

function iniciar() {
  const forma = $('forma');
  for (const [valor, texto] of Object.entries(FORMAS)) {
    forma.append(new Option(texto, valor, false, valor === 'pared'));
  }
  seleccionarPorEdad();
  $('form').addEventListener('input', (e) => {
    if (e.target.id === 'edad') seleccionarPorEdad();
    if (e.target.name === 'modulo') {
      e.target.checked ? seleccion.add(e.target.value) : seleccion.delete(e.target.value);
    }
    actualizar();
  });
  $('form').addEventListener('submit', (e) => e.preventDefault());
  actualizar();
}

function seleccionarPorEdad() {
  const edad = Number($('edad').value) || 0;
  const recomendados = new Set(modulosParaEdad(edad).map((m) => m.id));
  seleccion = new Set(recomendados);
  const cont = $('modulos');
  cont.replaceChildren(
    ...MODULOS.map((m) => {
      const label = document.createElement('label');
      label.className = 'check' + (recomendados.has(m.id) ? ' modulo-recomendado' : '');
      label.htmlFor = `mod-${m.id}`;
      const input = document.createElement('input');
      Object.assign(input, { type: 'checkbox', id: `mod-${m.id}`, name: 'modulo', value: m.id });
      input.checked = recomendados.has(m.id);
      const texto = document.createElement('span');
      const edadTxt = recomendados.has(m.id) ? 'Recomendado para su edad' : `De ${m.desde} a ${m.hasta} meses`;
      texto.innerHTML = `${m.nombre}<small>${edadTxt} · ${usd.format(m.precio)}</small>`;
      label.append(input, texto);
      return label;
    }),
  );
}

// Posición del corral dentro de la habitación según la forma.
function desplazamiento(forma) {
  if (forma === 'esquina') return [0, 0];
  if (forma === 'pared') return [400, 0];
  return [400, 400];
}

function dentro([x, y], poli) {
  let c = false;
  for (let i = 0, j = poli.length - 1; i < poli.length; j = i++) {
    const [xi, yi] = poli[i];
    const [xj, yj] = poli[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function el(tipo, attrs = {}, padre) {
  const e = document.createElementNS(NS, tipo);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (padre) padre.append(e);
  return e;
}

function dibujar(d, habAncho, habFondo) {
  const svg = $('svg');
  svg.replaceChildren();
  const m = 250;
  svg.setAttribute('viewBox', `${-m} ${-m} ${habAncho + 2 * m} ${habFondo + 2 * m}`);

  el('rect', { x: 0, y: 0, width: habAncho, height: habFondo, class: 'hab' }, svg);

  const [ox, oy] = desplazamiento(d.forma);
  const g = el('g', { transform: `translate(${ox} ${oy})` }, svg);

  const contorno = d.forma === 'esquina' ? [...d.puntos, [0, 0]] : d.puntos;
  el('polygon', { points: contorno.map((p) => p.join(',')).join(' '), class: 'area' }, g);

  const postes = [];
  d.lados.forEach((lado, i) => {
    const [px, py] = lado.desde;
    const [qx, qy] = lado.hasta;
    const ux = (qx - px) / lado.largo;
    const uy = (qy - py) / lado.largo;
    const inicioPared = !d.cerrada && i === 0;
    let s = inicioPared ? SISTEMA.anclajeGrosor : SISTEMA.posteDiam / 2;
    if (!inicioPared) postes.push([px, py]);

    // normal hacia dentro del corral
    let nx = -uy;
    let ny = ux;
    const medio = [px + ux * lado.largo / 2 + nx * 60, py + uy * lado.largo / 2 + ny * 60];
    if (!dentro(medio, contorno)) { nx = -nx; ny = -ny; }

    const puertaK = i === d.ladoPuerta ? lado.paneles.indexOf(SISTEMA.anchoPuerta) : -1;
    lado.paneles.forEach((w, k) => {
      const a = [px + ux * s, py + uy * s];
      const b = [px + ux * (s + w), py + uy * (s + w)];
      if (k === puertaK) {
        // puerta cerrada sobre el lado + arco de apertura hacia fuera del corral
        const r = w;
        const abierto = [a[0] - nx * r, a[1] - ny * r];
        const barrido = ux * ny - uy * nx > 0 ? 0 : 1;
        el('path', { d: `M${b[0]},${b[1]} A${r},${r} 0 0 ${barrido} ${abierto[0]},${abierto[1]}`, class: 'barrido' }, g);
        el('line', { x1: a[0], y1: a[1], x2: abierto[0], y2: abierto[1], class: 'barrido' }, g);
        el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'puerta' }, g);
      } else {
        el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'panel' }, g);
      }
      s += w;
      if (k < lado.paneles.length - 1) {
        s += SISTEMA.posteDiam / 2;
        postes.push([px + ux * s, py + uy * s]);
        s += SISTEMA.posteDiam / 2;
      }
    });

    if (!d.cerrada && i === 0) el('rect', anclaje(px, py), g);
    if (!d.cerrada && i === d.lados.length - 1) el('rect', anclaje(qx, qy), g);

    // cota del lado, por fuera
    const vertical = Math.abs(ux) < 0.5;
    const sep = vertical ? 90 : 170;
    const t = el('text', {
      x: px + ux * lado.largo / 2 - nx * sep,
      y: py + uy * lado.largo / 2 - ny * sep + 40,
      class: 'cota',
    }, g);
    if (vertical) t.style.textAnchor = nx > 0 ? 'end' : 'start';
    t.textContent = `${num.format(lado.largoReal / 10)} cm`;
  });

  for (const [x, y] of postes) el('circle', { cx: x, cy: y, r: 38, class: 'poste' }, g);

  function anclaje(x, y) {
    return { x: x - 45, y: y - 45, width: 90, height: 90, rx: 12, class: 'anclaje' };
  }

  // ¿cabe en la habitación?
  const xs = contorno.map((p) => p[0] + ox);
  const ys = contorno.map((p) => p[1] + oy);
  return Math.max(...xs) <= habAncho && Math.max(...ys) <= habFondo;
}

function actualizar() {
  const cm = (id) => Math.max(0, Number($(id).value) || 0) * 10;
  const habAncho = cm('habAncho');
  const habFondo = cm('habFondo');
  const forma = $('forma').value;
  $('fondo').disabled = forma === 'hexagono';

  const d = disenar({
    forma,
    ancho: cm('ancho'),
    fondo: cm('fondo'),
    puerta: $('puerta').checked,
    modulos: [...seleccion],
  });

  const cabe = dibujar(d, habAncho, habFondo);

  const totalPaneles = d.lados.reduce((s, l) => s + l.paneles.length, 0);
  $('cifras').innerHTML = [
    [num.format(d.area), 'm² de juego'],
    [totalPaneles, 'paneles'],
    [d.postes, 'postes'],
    [`${Math.round(d.horasImpresion)} h`, `de impresión · ${num.format(d.gramosFilamento / 1000)} kg PETG`],
    [usd.format(d.total), 'total estimado'],
  ].map(([v, t]) => `<div class="cifra"><b>${v}</b><span>${t}</span></div>`).join('');

  const avisos = [];
  if (!cabe) avisos.push('El corral no cabe en la habitación con estas medidas.');
  if (d.errorMax > TOLERANCIA_LADO) avisos.push(`Algún lado no cuadra con los paneles estándar (hasta ${Math.round(d.errorMax / 10)} cm de diferencia). Revisa la tabla de lados.`);
  if (d.puertaNoCabe) avisos.push('Ningún lado es lo bastante largo para la puerta de 80 cm: agranda un lado o quita la puerta.');
  if (d.area < 1) avisos.push('Menos de 1 m²: el bebé tendrá poco espacio para gatear.');
  $('aviso').hidden = avisos.length === 0;
  $('aviso').textContent = avisos.join(' ');

  $('piezas').innerHTML = d.piezas.map((p) => `
    <tr><td>${p.nombre}</td><td class="num">${p.cantidad}</td>
    <td class="num">${usd.format(p.precio)}</td><td class="num">${usd.format(p.cantidad * p.precio)}</td></tr>`).join('');
  $('total').textContent = usd.format(d.total);

  $('lados').innerHTML = d.lados.map((l, i) => `
    <tr><td>${i + 1}</td><td>${l.paneles.map((w, k) => (i === d.ladoPuerta && k === l.paneles.indexOf(SISTEMA.anchoPuerta) ? 'puerta' : w / 10)).join(' + ')}</td>
    <td class="num">${num.format(l.largo / 10)} cm</td><td class="num">${num.format(l.largoReal / 10)} cm</td></tr>`).join('');
}

iniciar();
