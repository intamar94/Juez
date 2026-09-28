import { CATEGORIAS, IDEAS } from './catalogo.js';

export const PLAZOS = {
  hoy: 'Lo tienes hoy',
  dias: 'Llega en 2–3 días',
  semana: 'Necesita una semana',
};

/** Niveles de precio: sin moneda, para que sirvan en cualquier país. */
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

/**
 * A dónde lleva el botón de compra. Los productos abren Google Shopping, que enseña tiendas del
 * país de quien visita; los planes y los regalos de tiempo abren una búsqueda normal para
 * reservarlos o prepararlos. Para vender en una tienda concreta, cambia `productos`
 * (por ejemplo, Amazon: `https://www.amazon.com/s?k=${q}&tag=TU-ETIQUETA`).
 */
export const TIENDA = {
  productos: (q) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`,
  buscador: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
};

export function enlaceCompra(idea) {
  const planes = idea.tipo === 'experiencia' || idea.tipo === 'tiempo';
  return (planes ? TIENDA.buscador : TIENDA.productos)(idea.busqueda);
}

export function textoCompra(idea) {
  if (idea.tipo === 'experiencia') return 'Reservar';
  if (idea.tipo === 'tiempo') return 'Ver cómo';
  return 'Comprar';
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
