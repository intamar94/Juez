import { CATEGORIAS } from './catalogo.js';
import { categoria, enlaceCompra, ideasDe, NIVELES, PLAZOS, sorpresa, textoCompra, textoNivel } from './tienda.js';

const $ = (id) => document.getElementById(id);

const FILTROS = [[null, 'Todo'], ...Object.entries(NIVELES).map(([id, n]) => [id, `${n.simbolo} ${n.texto}`])];
const TIPOS = {
  objeto: '🎁 Regalo', consumible: '🍯 Se disfruta y se acaba', experiencia: '🎟️ Plan',
  digital: '📲 Digital', tiempo: '💛 Hecho por ti',
};

let filtroNivel = null;
let ultimaSorpresa = null;

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
  $('sorprendeme').addEventListener('click', abrirSorpresa);
  $('otra-sorpresa').addEventListener('click', pintarSorpresa);
  $('cerrar-sorpresa').addEventListener('click', () => $('dialogo-sorpresa').close());
  $('dialogo-sorpresa').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.close();
  });
  addEventListener('hashchange', () => mostrar(true));
  mostrar(false);
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
  return el('article', { className: 'idea' },
    el('div', { className: 'arriba' },
      el('span', { textContent: TIPOS[idea.tipo] }),
      el('span', { textContent: `🚚 ${PLAZOS[idea.plazo]}` }),
    ),
    el('h3', { textContent: idea.nombre }),
    el('p', { textContent: idea.porque }),
    el('span', { className: 'precio', textContent: textoNivel(idea) }),
    el('a', {
      className: 'comprar', href: enlaceCompra(idea), target: '_blank', rel: 'noopener',
      textContent: `${textoCompra(idea)} →`,
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
