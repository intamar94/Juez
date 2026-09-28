import { CATEGORIAS, IDEAS } from './catalogo.js';

export const PLAZOS = {
  hoy: 'Lo tienes hoy',
  dias: 'Llega en 2–3 días',
  semana: 'Necesita una semana',
};

/**
 * A dónde lleva el botón de compra según el tipo de regalo. Los objetos, lo que se gasta y
 * lo digital se compran en Amazon; los planes y los regalos de tiempo abren una búsqueda para
 * reservar o prepararlo. Cambia aquí la tienda o añade tu código de afiliado.
 */
export const TIENDA = {
  etiquetaAfiliado: '',
  amazon: (q) => `https://www.amazon.es/s?k=${encodeURIComponent(q)}`,
  buscador: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
};

const DONDE = {
  objeto: 'amazon', consumible: 'amazon', digital: 'amazon',
  experiencia: 'buscador', tiempo: 'buscador',
};

export function enlaceCompra(idea) {
  if (DONDE[idea.tipo] === 'buscador') return TIENDA.buscador(idea.busqueda);
  const url = TIENDA.amazon(idea.busqueda);
  return TIENDA.etiquetaAfiliado ? `${url}&tag=${encodeURIComponent(TIENDA.etiquetaAfiliado)}` : url;
}

export function textoCompra(idea) {
  if (idea.tipo === 'experiencia') return 'Reservar';
  if (idea.tipo === 'tiempo') return 'Ver cómo';
  return 'Comprar';
}

export function categoria(id) {
  return CATEGORIAS.find((c) => c.id === id) ?? null;
}

/** Ideas de una categoría (o todas), dentro del presupuesto, de más barata a más cara. */
export function ideasDe(idCategoria, { presupuesto = null } = {}, ideas = IDEAS) {
  return ideas
    .filter((i) => !idCategoria || i.categorias.includes(idCategoria))
    .filter((i) => presupuesto == null || i.precio[0] <= presupuesto)
    .sort((a, b) => a.precio[0] - b.precio[0] || a.precio[1] - b.precio[1]);
}

/** Una idea al azar, distinta de la anterior si se puede. */
export function sorpresa(anterior = null, azar = Math.random, ideas = IDEAS) {
  const opciones = ideas.length > 1 ? ideas.filter((i) => i.id !== anterior) : ideas;
  return opciones[Math.floor(azar() * opciones.length)];
}

export function textoPrecio([min, max]) {
  if (max === 0) return 'Gratis';
  if (min === max) return `${min} €`;
  return `${min}–${max} €`;
}
