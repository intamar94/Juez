import { CATEGORIAS, IDEAS } from './catalogo.js';
import { AMAZON, MERCADOLIBRE } from './afiliados.js';
import { NOMBRE_TIENDA, PAIS_POR_DEFECTO, PAISES } from './paises.js';

export const PLAZOS = {
  hoy: 'Lo tienes hoy',
  dias: 'Llega en 2–3 días',
  semana: 'Necesita una semana',
};

/** Niveles de precio: se muestran cuando no hay tasa de cambio para la moneda elegida. */
export const NIVELES = {
  bajo: { simbolo: '$', texto: 'Económico', hasta: 20 },
  medio: { simbolo: '$$', texto: 'Intermedio', hasta: 60 },
  alto: { simbolo: '$$$', texto: 'Especial', hasta: Infinity },
};

/** El nivel lo marca la versión más barata que ya vale la pena regalar. */
export function nivel(idea) {
  return Object.keys(NIVELES).find((n) => idea.precio[0] <= NIVELES[n].hasta);
}

export function textoNivel(idea) {
  if (idea.precio[1] === 0) return 'Gratis';
  const n = NIVELES[nivel(idea)];
  return `${n.simbolo} · ${n.texto}`;
}

/** «Termo de acero» → «termo-de-acero», como los listados de Mercado Libre. */
export function slug(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function esPlan(idea) {
  return idea.tipo === 'experiencia' || idea.tipo === 'tiempo';
}

/** Enlace con comisión para esa idea en esa tienda, o null si no hay cuenta de afiliado. */
function enlaceAfiliado(idea, tienda, codigo) {
  if (tienda.tienda === 'amazon') {
    const etiqueta = AMAZON[tienda.dominio];
    return etiqueta ? `${enlaceNormal(idea, tienda, codigo)}&tag=${encodeURIComponent(etiqueta)}` : null;
  }
  if (tienda.tienda === 'mercadolibre') return MERCADOLIBRE[codigo]?.[idea.id] ?? null;
  return null;
}

function enlaceNormal(idea, tienda, codigo) {
  const q = idea.busqueda;
  if (tienda.tienda === 'mercadolibre') return `https://listado.mercadolibre.${tienda.dominio}/${slug(q)}`;
  if (tienda.tienda === 'amazon') {
    // amazon.com se abre en español; los demás Amazon ya están en español.
    const idioma = tienda.dominio === 'com' ? '&language=es_US' : '';
    return `https://www.amazon.${tienda.dominio}/s?k=${encodeURIComponent(q)}${idioma}`;
  }
  return `https://www.google.com/search?tbm=shop&gl=${codigo.toLowerCase()}&hl=es&q=${encodeURIComponent(q)}`;
}

/**
 * Dónde se compra una idea en un país: la primera tienda donde tengas cuenta de afiliado
 * y, si no hay ninguna, la primera de la lista. Devuelve { tienda, url, comision }.
 */
export function dondeComprar(idea, codigo = PAIS_POR_DEFECTO) {
  const pais = PAISES[codigo] ? codigo : PAIS_POR_DEFECTO;
  const { tiendas } = PAISES[pais];
  for (const tienda of tiendas) {
    const url = enlaceAfiliado(idea, tienda, pais);
    if (url) return { tienda: tienda.tienda, url, comision: true };
  }
  return { tienda: tiendas[0].tienda, url: enlaceNormal(idea, tiendas[0], pais), comision: false };
}

/**
 * A dónde lleva el botón. Los productos van a la tienda elegida por `dondeComprar`; los planes
 * abren una búsqueda en ese país para reservarlos.
 */
export function enlaceCompra(idea, codigo = PAIS_POR_DEFECTO) {
  if (!esPlan(idea)) return dondeComprar(idea, codigo).url;
  const pais = PAISES[codigo] ? codigo : PAIS_POR_DEFECTO;
  const q = idea.tipo === 'experiencia' ? `${idea.busqueda} ${PAISES[pais].nombre}` : idea.busqueda;
  return `https://www.google.com/search?gl=${pais.toLowerCase()}&hl=es&q=${encodeURIComponent(q)}`;
}

export function textoCompra(idea, codigo = PAIS_POR_DEFECTO) {
  if (idea.tipo === 'experiencia') return 'Reservar';
  if (idea.tipo === 'tiempo') return 'Ver cómo';
  const tienda = NOMBRE_TIENDA[dondeComprar(idea, codigo).tienda];
  return tienda === 'tiendas' ? 'Comprar' : `Comprar en ${tienda}`;
}

/** Redondea a dos cifras significativas: 14.873 → 15.000. */
export function redondear(n) {
  if (n <= 0) return 0;
  const paso = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / paso) * paso;
}

/**
 * Precio aproximado en la moneda elegida a partir del precio de referencia en dólares.
 * `tasas` son unidades de moneda por dólar ({ ARS: 1200, … }). Sin tasa, devuelve null.
 * El formato sigue las costumbres del país («$ 25.000» en Argentina, «US$20» en Perú…).
 */
export function precioLocal(idea, moneda, tasas, codigoPais = PAIS_POR_DEFECTO) {
  if (idea.precio[1] === 0) return 'Gratis';
  const tasa = moneda === 'USD' ? 1 : tasas?.[moneda];
  if (!tasa) return null;
  const formato = new Intl.NumberFormat(`es-${codigoPais}`, { style: 'currency', currency: moneda, maximumFractionDigits: 0 });
  const [min, max] = idea.precio.map((p) => redondear(p * tasa));
  return min === max ? `≈ ${formato.format(min)}` : `≈ ${formato.format(min)} – ${formato.format(max)}`;
}

export function categoria(id) {
  return CATEGORIAS.find((c) => c.id === id) ?? null;
}

/** Ideas de una categoría (o todas), de un nivel de precio si se pide, de más barata a más cara. */
export function ideasDe(idCategoria, { nivel: soloNivel = null } = {}, ideas = IDEAS) {
  return ideas
    .filter((i) => !idCategoria || i.categorias.includes(idCategoria))
    .filter((i) => !soloNivel || nivel(i) === soloNivel)
    .sort((a, b) => a.precio[0] - b.precio[0] || a.precio[1] - b.precio[1]);
}

/** Una idea al azar, distinta de la anterior si se puede. */
export function sorpresa(anterior = null, azar = Math.random, ideas = IDEAS) {
  const opciones = ideas.length > 1 ? ideas.filter((i) => i.id !== anterior) : ideas;
  return opciones[Math.floor(azar() * opciones.length)];
}

/** ¿Hay alguna cuenta de afiliado configurada? Sirve para mostrar el aviso legal. */
export function hayAfiliados() {
  return Object.values(AMAZON).some(Boolean)
    || Object.values(MERCADOLIBRE).some((enlaces) => Object.keys(enlaces).length > 0);
}
