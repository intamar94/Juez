import { CATEGORIAS, IDEAS } from './catalogo.js';
import { AFILIADOS, NOMBRE_TIENDA, PAIS_POR_DEFECTO, PAISES } from './paises.js';

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

const ENLACES = {
  mercadolibre: (q, p) => `https://listado.mercadolibre.${p.dominio}/${slug(q)}`,
  amazon: (q, p) => {
    const url = `https://www.amazon.${p.dominio}/s?k=${encodeURIComponent(q)}`;
    return AFILIADOS.amazon ? `${url}&tag=${encodeURIComponent(AFILIADOS.amazon)}` : url;
  },
  google: (q, _p, codigo) =>
    `https://www.google.com/search?tbm=shop&gl=${codigo.toLowerCase()}&hl=es&q=${encodeURIComponent(q)}`,
};

function esPlan(idea) {
  return idea.tipo === 'experiencia' || idea.tipo === 'tiempo';
}

/**
 * A dónde lleva el botón. Los productos van a la tienda del país (Mercado Libre, Amazon o
 * Google Shopping); los planes abren una búsqueda en ese país para reservarlos.
 */
export function enlaceCompra(idea, codigo = PAIS_POR_DEFECTO) {
  const pais = PAISES[codigo] ?? PAISES[PAIS_POR_DEFECTO];
  if (esPlan(idea)) {
    const q = idea.tipo === 'experiencia' ? `${idea.busqueda} ${pais.nombre}` : idea.busqueda;
    return `https://www.google.com/search?gl=${codigo.toLowerCase()}&hl=es&q=${encodeURIComponent(q)}`;
  }
  return ENLACES[pais.tienda](idea.busqueda, pais, codigo);
}

export function textoCompra(idea, codigo = PAIS_POR_DEFECTO) {
  if (idea.tipo === 'experiencia') return 'Reservar';
  if (idea.tipo === 'tiempo') return 'Ver cómo';
  const tienda = NOMBRE_TIENDA[(PAISES[codigo] ?? PAISES[PAIS_POR_DEFECTO]).tienda];
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
