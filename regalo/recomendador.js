import { CATEGORIAS, IDEAS, INTERESES } from './catalogo.js';

export const PLAZOS = {
  hoy: { orden: 0, texto: 'Para hoy' },
  dias: { orden: 1, texto: 'En 2–3 días' },
  semana: { orden: 2, texto: 'Con una semana' },
};

export const EDADES = {
  nino: 'Niño o niña',
  joven: 'Adolescente o joven',
  adulto: 'Adulto',
  mayor: 'Persona mayor',
};

export const RELACIONES = {
  pareja: 'Mi pareja',
  familia: 'Familia',
  amistad: 'Amistad',
  trabajo: 'Trabajo o compromiso',
};

const EDADES_POR_DEFECTO = ['joven', 'adulto', 'mayor'];

/** La idea cabe en el presupuesto si su versión más barata no lo supera. */
export function cabeEnPresupuesto(idea, presupuesto) {
  return presupuesto == null || idea.precio[0] <= presupuesto;
}

/** La idea llega a tiempo si su plazo no es más lento que el que queda. */
export function llegaATiempo(idea, plazo) {
  return plazo == null || PLAZOS[idea.plazo].orden <= PLAZOS[plazo].orden;
}

export function encajaEdad(idea, edad) {
  return edad == null || (idea.edades ?? EDADES_POR_DEFECTO).includes(edad);
}

export function encajaRelacion(idea, relacion) {
  return relacion == null || idea.relaciones == null || idea.relaciones.includes(relacion);
}

/**
 * Filtra y ordena ideas según lo que sabemos de la persona.
 *
 * criterios:
 *   presupuesto  euros máximos (null = sin límite)
 *   plazo        'hoy' | 'dias' | 'semana' (null = sin prisa)
 *   edad, relacion
 *   intereses    lista de ids de INTERESES
 *   sinCosas     true si no quiere más objetos en casa
 *   categoria    id de CATEGORIAS para acotar la búsqueda
 *
 * Devuelve [{ idea, puntos, motivos }] de mejor a peor.
 */
export function recomendar(criterios = {}, ideas = IDEAS) {
  const {
    presupuesto = null, plazo = null, edad = null, relacion = null,
    intereses = [], sinCosas = false, categoria = null,
  } = criterios;

  const resultado = [];
  for (const idea of ideas) {
    if (categoria && !idea.categorias.includes(categoria)) continue;
    if (!cabeEnPresupuesto(idea, presupuesto)) continue;
    if (!llegaATiempo(idea, plazo)) continue;
    if (!encajaEdad(idea, edad)) continue;
    if (!encajaRelacion(idea, relacion)) continue;
    if (sinCosas && idea.tipo === 'objeto') continue;
    // Con un compañero de trabajo, lo íntimo incomoda.
    if (relacion === 'trabajo' && idea.categorias.includes('con-historia')) continue;

    const motivos = [];
    let puntos = 0;

    const comunes = idea.intereses.filter((i) => intereses.includes(i));
    if (comunes.length) {
      puntos += 3 * comunes.length;
      motivos.push(`Le gusta: ${comunes.map((i) => INTERESES[i].replace(/^\S+\s/, '').toLowerCase()).join(', ')}`);
    } else if (idea.intereses.length === 0) {
      // Las ideas universales valen para cualquiera, pero no deben tapar a las específicas.
      puntos += 1;
    } else if (intereses.length) {
      puntos -= 1;
    }

    if (sinCosas && idea.tipo !== 'objeto') {
      puntos += 2;
      motivos.push('No ocupa sitio');
    }
    if (plazo === 'hoy' && idea.plazo === 'hoy') motivos.push('Lo tienes hoy');
    if (relacion === 'trabajo' && idea.categorias.includes('compromiso')) {
      puntos += 2;
      motivos.push('Apropiado para el trabajo');
    }
    if (relacion === 'pareja' && idea.categorias.includes('con-historia')) {
      puntos += 1;
      motivos.push('Personal');
    }

    // Preferimos lo que aprovecha el presupuesto sin pasarse: el tope de la idea cerca del presupuesto.
    if (presupuesto != null && presupuesto > 0) {
      const aprovecha = Math.min(idea.precio[1], presupuesto) / presupuesto;
      puntos += aprovecha;
    }

    resultado.push({ idea, puntos, motivos });
  }

  return resultado.sort((a, b) => b.puntos - a.puntos || a.idea.precio[0] - b.idea.precio[0]);
}

export function categoria(id) {
  return CATEGORIAS.find((c) => c.id === id) ?? null;
}

export function textoPrecio([min, max]) {
  if (max === 0) return 'Gratis';
  if (min === max) return `${min} €`;
  return `${min}–${max} €`;
}

/** Enlace de búsqueda neutral (sin afiliados): el usuario elige la tienda. */
export function enlaceBusqueda(idea) {
  return `https://www.google.com/search?q=${encodeURIComponent(idea.busqueda)}`;
}

/** Codifica la lista guardada para compartirla por URL, y la recupera. */
export function codificarLista(ids) {
  return ids.join('.');
}

export function decodificarLista(texto, ideas = IDEAS) {
  if (!texto) return [];
  const validos = new Set(ideas.map((i) => i.id));
  return [...new Set(texto.split('.'))].filter((id) => validos.has(id));
}
