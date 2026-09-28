import { CATEGORIAS, IDEAS } from './catalogo.js';
import { bandera, MONEDAS, nombreMoneda, PAISES, paisDelIdioma } from './paises.js';
import {
  categoria, dondeComprar, enlaceCompra, hayAfiliados, ideasDe, NIVELES, PLAZOS, precioLocal, sorpresa, textoCompra, textoNivel,
} from './tienda.js';

const $ = (id) => document.getElementById(id);

const FILTROS = [[null, 'Todo'], ...Object.entries(NIVELES).map(([id, n]) => [id, `${n.simbolo} ${n.texto}`])];
const TIPOS = {
  objeto: '🎁 Regalo', consumible: '🍯 Se disfruta y se acaba', experiencia: '🎟️ Plan',
  digital: '📲 Digital', tiempo: '💛 Hecho por ti',
};

const CLAVE_REGION = 'acierto.region';
const CLAVE_TASAS = 'acierto.tasas';
const TASAS_URL = 'https://open.er-api.com/v6/latest/USD';
const TASAS_VIGENCIA_MS = 12 * 60 * 60 * 1000;

let filtroNivel = null;
let ultimaSorpresa = null;
let region = leer(CLAVE_REGION);
let tasas = leer(CLAVE_TASAS)?.rates ?? null;

function el(etiqueta, props = {}, ...hijos) {
  const nodo = Object.assign(document.createElement(etiqueta), props);
  nodo.append(...hijos.filter((h) => h != null));
  return nodo;
}

function conColor(nodo, color) {
  nodo.dataset.color = color;
  return nodo;
}

function iniciar() {
  pintarCategorias();
  prepararRegion();
  $('aviso-afiliados').hidden = !hayAfiliados();
  $('sorprendeme').addEventListener('click', abrirSorpresa);
  $('otra-sorpresa').addEventListener('click', pintarSorpresa);
  $('cerrar-sorpresa').addEventListener('click', () => $('dialogo-sorpresa').close());
  $('dialogo-sorpresa').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.close();
  });
  addEventListener('hashchange', () => mostrar(true));
  mostrar(false);
  cargarTasas();
}

// — País y moneda —

function prepararRegion() {
  const pais = $('pais');
  const moneda = $('moneda');
  for (const [codigo, p] of Object.entries(PAISES)) pais.append(new Option(`${bandera(codigo)} ${p.nombre}`, codigo));
  for (const m of MONEDAS) moneda.append(new Option(`${m} · ${nombreMoneda(m)}`, m));
  // Al cambiar de país se propone su moneda; el usuario puede elegir otra.
  pais.addEventListener('change', () => { moneda.value = PAISES[pais.value].moneda; });
  $('region').addEventListener('click', abrirRegion);
  // La primera vez hay que elegir: Escape no cierra la ventana hasta tener país y moneda.
  $('dialogo-region').addEventListener('cancel', (e) => { if (!region) e.preventDefault(); });
  $('form-region').addEventListener('submit', () => {
    region = { pais: pais.value, moneda: moneda.value };
    guardar(CLAVE_REGION, region);
    pintarRegion();
    repintar();
  });
  if (region && PAISES[region.pais] && MONEDAS.includes(region.moneda)) {
    pintarRegion();
  } else {
    region = null;
    abrirRegion();
  }
}

function regionActual() {
  if (region) return region;
  const pais = paisDelIdioma(navigator.languages ?? [navigator.language]);
  return { pais, moneda: PAISES[pais].moneda };
}

function abrirRegion() {
  const r = regionActual();
  $('pais').value = r.pais;
  $('moneda').value = r.moneda;
  $('dialogo-region').showModal();
}

function pintarRegion() {
  const r = regionActual();
  $('region').textContent = `${bandera(r.pais)} ${r.moneda}`;
  $('region').setAttribute('aria-label', `País: ${PAISES[r.pais].nombre}. Moneda: ${r.moneda}. Cambiar`);
}

async function cargarTasas() {
  const guardadas = leer(CLAVE_TASAS);
  if (guardadas && Date.now() - guardadas.fecha < TASAS_VIGENCIA_MS) return;
  try {
    const respuesta = await fetch(TASAS_URL);
    const datos = await respuesta.json();
    if (datos.result !== 'success') return;
    tasas = datos.rates;
    guardar(CLAVE_TASAS, { fecha: Date.now(), rates: tasas });
    repintar();
  } catch {
    // Sin conexión con el servicio de cambio: se muestran los niveles ($, $$, $$$).
  }
}

function repintar() {
  mostrar(false);
  if ($('dialogo-sorpresa').open && ultimaSorpresa) {
    $('idea-sorpresa').replaceChildren(tarjeta(IDEAS.find((i) => i.id === ultimaSorpresa)));
  }
}

function leer(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave));
  } catch {
    return null;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento (modo privado): vale solo para esta visita.
  }
}

/** El hash #c/<id> abre una categoría: así cada categoría tiene su enlace para compartir. */
function categoriaDelHash() {
  const m = location.hash.match(/^#c\/([\w-]+)$/);
  return m ? categoria(m[1]) : null;
}

function pintarCategorias() {
  const cont = $('lista-categorias');
  for (const c of CATEGORIAS) {
    const tarjeta = el('a', { className: 'categoria', href: `#c/${c.id}` },
      el('span', { className: 'emoji', textContent: c.emoji }),
      el('h3', { textContent: c.nombre }),
      el('p', { textContent: c.lema }),
      el('small', { textContent: `${ideasDe(c.id).length} ideas →` }),
    );
    cont.append(conColor(tarjeta, c.color));
  }
}

function mostrar(desplazar) {
  const c = categoriaDelHash();
  $('ideas').hidden = !c;
  if (!c) return;
  filtroNivel = null;
  pintarOtras(c);
  pintarCategoria(c);
  if (desplazar) $('ideas').scrollIntoView();
}

function pintarOtras(actual) {
  const nav = $('otras');
  nav.replaceChildren();
  for (const c of CATEGORIAS) {
    const b = el('button', { type: 'button', textContent: `${c.emoji} ${c.nombre}` });
    if (c.id === actual.id) b.setAttribute('aria-current', 'true');
    b.addEventListener('click', () => { location.hash = `c/${c.id}`; });
    nav.append(conColor(b, c.color));
  }
  nav.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
}

function pintarCategoria(c) {
  const cabeza = $('cabeza-cat');
  cabeza.replaceChildren(
    el('span', { className: 'emoji', textContent: c.emoji }),
    el('h2', { textContent: c.nombre }),
    el('p', { textContent: c.lema }),
  );
  conColor(cabeza, c.color);

  // En la categoría barata el filtro de precio sobra.
  if (c.id !== 'poco-dinero') {
    const chips = el('div', { className: 'chips' });
    for (const [valor, texto] of FILTROS) {
      const b = el('button', { type: 'button', textContent: texto });
      b.setAttribute('aria-pressed', String(filtroNivel === valor));
      b.addEventListener('click', () => { filtroNivel = valor; pintarCategoria(c); });
      chips.append(b);
    }
    cabeza.append(chips);
  }

  const cont = $('resultados');
  const ideas = ideasDe(c.id, { nivel: filtroNivel });
  cont.replaceChildren(...ideas.map(tarjeta));
  if (!ideas.length) {
    cont.append(el('div', { className: 'vacio', textContent: 'Nada en este nivel de precio aquí. Prueba con otro.' }));
  }
}

function tarjeta(idea) {
  const { pais, moneda } = regionActual();
  const precio = precioLocal(idea, moneda, tasas, pais) ?? textoNivel(idea);
  const esProducto = idea.tipo !== 'experiencia' && idea.tipo !== 'tiempo';
  const patrocinado = esProducto && dondeComprar(idea, pais).comision;
  return el('article', { className: 'idea' },
    el('div', { className: 'arriba' },
      el('span', { textContent: TIPOS[idea.tipo] }),
      el('span', { textContent: `🚚 ${PLAZOS[idea.plazo]}` }),
    ),
    el('h3', { textContent: idea.nombre }),
    el('p', { textContent: idea.porque }),
    el('span', { className: 'precio', textContent: precio }),
    el('a', {
      className: 'comprar', href: enlaceCompra(idea, pais), target: '_blank', rel: patrocinado ? 'sponsored noopener' : 'noopener',
      textContent: textoCompra(idea, pais),
    }),
  );
}

function abrirSorpresa() {
  pintarSorpresa();
  $('dialogo-sorpresa').showModal();
}

function pintarSorpresa() {
  const idea = sorpresa(ultimaSorpresa);
  ultimaSorpresa = idea.id;
  $('idea-sorpresa').replaceChildren(tarjeta(idea));
}

iniciar();
