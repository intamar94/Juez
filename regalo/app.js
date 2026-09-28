import { CATEGORIAS, IDEAS, INTERESES } from './catalogo.js';
import {
  categoria, codificarLista, decodificarLista, EDADES, enlaceBusqueda, PLAZOS, recomendar,
  RELACIONES, textoPrecio,
} from './recomendador.js';

const $ = (id) => document.getElementById(id);
const CLAVE_LISTA = 'acierto.lista';
const POR_PAGINA = 12;

const PRESUPUESTOS = { 10: 'Hasta 10 €', 20: '20 €', 50: '50 €', 100: '100 €', '': 'Sin límite' };
const TIPOS = {
  objeto: '🎁 Objeto', consumible: '🍯 Se gasta', experiencia: '🎟️ Plan',
  digital: '📲 Digital', tiempo: '💛 Tu tiempo',
};

let categoriaActiva = null;
let visibles = POR_PAGINA;
let guardadas = cargarLista();

function el(etiqueta, props = {}, ...hijos) {
  const nodo = Object.assign(document.createElement(etiqueta), props);
  nodo.append(...hijos.filter((h) => h != null));
  return nodo;
}

function chips(contenedor, nombre, opciones, tipo = 'radio') {
  for (const [valor, texto] of Object.entries(opciones)) {
    const input = el('input', { type: tipo, name: nombre, value: valor });
    contenedor.append(el('label', {}, input, el('span', { textContent: texto })));
  }
}

function iniciar() {
  const desdeUrl = decodificarLista(new URLSearchParams(location.search).get('lista'));
  if (desdeUrl.length) {
    guardadas = [...new Set([...guardadas, ...desdeUrl])];
    guardarLista();
  }

  pintarCategorias();
  chips($('relacion'), 'relacion', RELACIONES);
  chips($('edad'), 'edad', EDADES);
  chips($('presupuesto'), 'presupuesto', PRESUPUESTOS);
  chips($('plazo'), 'plazo', { hoy: 'Hoy o mañana', dias: 'En unos días', semana: 'Tengo tiempo' });
  chips($('intereses'), 'interes', INTERESES, 'checkbox');

  // Los radios se pueden desmarcar volviendo a pulsarlos: todo es opcional.
  $('test').addEventListener('click', (e) => {
    const input = e.target.closest('label')?.querySelector('input[type="radio"]');
    if (!input || e.target !== input) return;
    if (input.dataset.marcado === '1') {
      input.checked = false;
      input.dataset.marcado = '';
      actualizar();
    } else {
      for (const r of document.getElementsByName(input.name)) r.dataset.marcado = '';
      input.dataset.marcado = '1';
    }
  });
  $('test').addEventListener('change', () => { visibles = POR_PAGINA; actualizar(); });
  $('test').addEventListener('submit', (e) => e.preventDefault());
  $('limpiar').addEventListener('click', () => {
    $('test').reset();
    for (const r of $('test').querySelectorAll('input')) r.dataset.marcado = '';
    elegirCategoria(null);
  });
  $('ver-mas').addEventListener('click', () => { visibles += POR_PAGINA; actualizar(); });
  $('compartir').addEventListener('click', compartir);

  actualizar();
  pintarGuardadas();
}

function pintarCategorias() {
  const cont = $('lista-categorias');
  cont.replaceChildren();
  for (const c of CATEGORIAS) {
    const n = IDEAS.filter((i) => i.categorias.includes(c.id)).length;
    const boton = el('button', { type: 'button', className: 'categoria' },
      el('span', { className: 'emoji', textContent: c.emoji }),
      el('h3', { textContent: c.nombre }),
      el('p', { textContent: c.lema }),
      el('small', { textContent: `${n} ideas →` }),
    );
    boton.dataset.color = c.color;
    boton.setAttribute('aria-pressed', String(categoriaActiva === c.id));
    boton.addEventListener('click', () => {
      elegirCategoria(categoriaActiva === c.id ? null : c.id);
      $('buscar').scrollIntoView();
    });
    cont.append(boton);
  }
}

function elegirCategoria(id) {
  categoriaActiva = id;
  visibles = POR_PAGINA;
  pintarCategorias();
  actualizar();
}

function leerCriterios() {
  const form = new FormData($('test'));
  const presupuesto = form.get('presupuesto');
  return {
    relacion: form.get('relacion') || null,
    edad: form.get('edad') || null,
    presupuesto: presupuesto ? Number(presupuesto) : null,
    plazo: form.get('plazo') || null,
    intereses: form.getAll('interes'),
    sinCosas: $('sin-cosas').checked,
    categoria: categoriaActiva,
  };
}

function actualizar() {
  const resultados = recomendar(leerCriterios());
  const estado = $('estado');
  estado.replaceChildren(el('span', {}, el('b', { textContent: String(resultados.length) }),
    resultados.length === 1 ? ' idea encaja' : ' ideas encajan'));
  if (categoriaActiva) {
    const c = categoria(categoriaActiva);
    const quitar = el('button', { type: 'button', className: 'filtro-cat', textContent: `${c.emoji} ${c.nombre} ✕` });
    quitar.setAttribute('aria-label', `Quitar categoría ${c.nombre}`);
    quitar.addEventListener('click', () => elegirCategoria(null));
    estado.append(quitar);
  }

  const cont = $('resultados');
  cont.replaceChildren();
  if (!resultados.length) {
    cont.append(el('div', { className: 'vacio' },
      el('p', { textContent: 'Nada encaja con todo a la vez. Prueba a subir el presupuesto, darte más plazo o quitar la categoría.' })));
  }
  for (const r of resultados.slice(0, visibles)) cont.append(tarjeta(r.idea, r.motivos));
  $('ver-mas').hidden = resultados.length <= visibles;
}

function tarjeta(idea, motivos = []) {
  const guardada = guardadas.includes(idea.id);
  const corazon = el('button', { type: 'button', className: 'icono', textContent: guardada ? '♥ Guardada' : '♡ Guardar' });
  corazon.setAttribute('aria-pressed', String(guardada));
  corazon.addEventListener('click', () => alternarGuardada(idea.id));

  return el('article', { className: 'idea' },
    el('span', { className: 'tipo', textContent: TIPOS[idea.tipo] }),
    el('h3', { textContent: idea.nombre }),
    el('p', { textContent: idea.porque }),
    el('div', { className: 'etiquetas' },
      ...motivos.map((m) => el('span', { className: 'etiqueta motivo', textContent: `✓ ${m}` })),
      el('span', { className: 'etiqueta', textContent: `🚚 ${PLAZOS[idea.plazo].texto}` }),
    ),
    el('div', { className: 'pie-idea' },
      el('span', { className: 'precio', textContent: textoPrecio(idea.precio) }),
      corazon,
      el('a', { className: 'icono', href: enlaceBusqueda(idea), target: '_blank', rel: 'noopener', textContent: 'Buscar ↗' }),
    ),
  );
}

function alternarGuardada(id) {
  guardadas = guardadas.includes(id) ? guardadas.filter((g) => g !== id) : [...guardadas, id];
  guardarLista();
  actualizar();
  pintarGuardadas();
}

function pintarGuardadas() {
  const cont = $('guardadas');
  cont.replaceChildren();
  const ideas = guardadas.map((id) => IDEAS.find((i) => i.id === id)).filter(Boolean);
  if (!ideas.length) {
    cont.append(el('div', { className: 'vacio' }, el('p', { textContent: 'Pulsa ♡ en cualquier idea para guardarla aquí.' })));
  }
  for (const idea of ideas) cont.append(tarjeta(idea));
  $('compartir').hidden = !ideas.length;
  $('contador-lista').textContent = ideas.length ? String(ideas.length) : '';
}

async function compartir() {
  const url = new URL(location.href);
  url.search = `?lista=${codificarLista(guardadas)}`;
  url.hash = 'lista-guardada';
  try {
    await navigator.clipboard.writeText(url.href);
    avisar('Enlace copiado. Quien lo abra verá tu lista.');
  } catch {
    prompt('Copia este enlace:', url.href);
  }
}

function avisar(texto) {
  const aviso = $('aviso');
  aviso.textContent = texto;
  aviso.classList.add('visible');
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => aviso.classList.remove('visible'), 2500);
}

function cargarLista() {
  try {
    return decodificarLista(localStorage.getItem(CLAVE_LISTA));
  } catch {
    return [];
  }
}

function guardarLista() {
  try {
    localStorage.setItem(CLAVE_LISTA, codificarLista(guardadas));
  } catch {
    // Sin almacenamiento (modo privado): la lista vive solo en esta visita.
  }
}

iniciar();
