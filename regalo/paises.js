// Países, su moneda por defecto y las tiendas donde se compra en cada uno.
//
// `tiendas` va por orden de preferencia: el botón usa la primera donde tengas cuenta de
// afiliado (afiliados.js) y, si no tienes ninguna, la primera de la lista.
//   'mercadolibre'  listado de Mercado Libre del país (dominio = sufijo tras «mercadolibre.»)
//   'amazon'        Amazon (dominio = sufijo tras «amazon.»; amazon.com envía a casi toda América)
//   'google'        Google Shopping con las tiendas de ese país

export const PAISES = {
  AR: { nombre: 'Argentina', moneda: 'ARS', tiendas: [{ tienda: 'mercadolibre', dominio: 'com.ar' }, { tienda: 'amazon', dominio: 'com' }] },
  BO: { nombre: 'Bolivia', moneda: 'BOB', tiendas: [{ tienda: 'google' }, { tienda: 'amazon', dominio: 'com' }] },
  CL: { nombre: 'Chile', moneda: 'CLP', tiendas: [{ tienda: 'mercadolibre', dominio: 'cl' }, { tienda: 'amazon', dominio: 'com' }] },
  CO: { nombre: 'Colombia', moneda: 'COP', tiendas: [{ tienda: 'mercadolibre', dominio: 'com.co' }, { tienda: 'amazon', dominio: 'com' }] },
  CR: { nombre: 'Costa Rica', moneda: 'CRC', tiendas: [{ tienda: 'google' }, { tienda: 'amazon', dominio: 'com' }] },
  EC: { nombre: 'Ecuador', moneda: 'USD', tiendas: [{ tienda: 'mercadolibre', dominio: 'com.ec' }, { tienda: 'amazon', dominio: 'com' }] },
  SV: { nombre: 'El Salvador', moneda: 'USD', tiendas: [{ tienda: 'google' }, { tienda: 'amazon', dominio: 'com' }] },
  ES: { nombre: 'España', moneda: 'EUR', tiendas: [{ tienda: 'amazon', dominio: 'es' }] },
  US: { nombre: 'Estados Unidos', moneda: 'USD', tiendas: [{ tienda: 'amazon', dominio: 'com' }] },
  GT: { nombre: 'Guatemala', moneda: 'GTQ', tiendas: [{ tienda: 'google' }, { tienda: 'amazon', dominio: 'com' }] },
  HN: { nombre: 'Honduras', moneda: 'HNL', tiendas: [{ tienda: 'google' }, { tienda: 'amazon', dominio: 'com' }] },
  MX: { nombre: 'México', moneda: 'MXN', tiendas: [{ tienda: 'mercadolibre', dominio: 'com.mx' }, { tienda: 'amazon', dominio: 'com.mx' }, { tienda: 'amazon', dominio: 'com' }] },
  NI: { nombre: 'Nicaragua', moneda: 'NIO', tiendas: [{ tienda: 'google' }, { tienda: 'amazon', dominio: 'com' }] },
  PA: { nombre: 'Panamá', moneda: 'USD', tiendas: [{ tienda: 'google' }, { tienda: 'amazon', dominio: 'com' }] },
  PY: { nombre: 'Paraguay', moneda: 'PYG', tiendas: [{ tienda: 'google' }, { tienda: 'amazon', dominio: 'com' }] },
  PE: { nombre: 'Perú', moneda: 'PEN', tiendas: [{ tienda: 'mercadolibre', dominio: 'com.pe' }, { tienda: 'amazon', dominio: 'com' }] },
  PR: { nombre: 'Puerto Rico', moneda: 'USD', tiendas: [{ tienda: 'amazon', dominio: 'com' }] },
  DO: { nombre: 'República Dominicana', moneda: 'DOP', tiendas: [{ tienda: 'google' }, { tienda: 'amazon', dominio: 'com' }] },
  UY: { nombre: 'Uruguay', moneda: 'UYU', tiendas: [{ tienda: 'mercadolibre', dominio: 'com.uy' }, { tienda: 'amazon', dominio: 'com' }] },
  VE: { nombre: 'Venezuela', moneda: 'USD', tiendas: [{ tienda: 'google' }, { tienda: 'amazon', dominio: 'com' }] },
};

export const PAIS_POR_DEFECTO = 'US';

export const NOMBRE_TIENDA = {
  mercadolibre: 'Mercado Libre',
  amazon: 'Amazon',
  google: 'tiendas',
};

/** Monedas que se pueden elegir: las de los países y las de referencia. */
export const MONEDAS = [...new Set([...Object.values(PAISES).map((p) => p.moneda), 'USD', 'EUR'])].sort();

/** 🇦🇷 a partir de «AR». */
export function bandera(codigo) {
  return String.fromCodePoint(...[...codigo].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Adivina el país por el idioma del navegador (es-AR → AR). */
export function paisDelIdioma(idiomas = []) {
  for (const idioma of idiomas) {
    const region = idioma.split('-')[1]?.toUpperCase();
    if (region && PAISES[region]) return region;
  }
  return PAIS_POR_DEFECTO;
}

/** Nombre legible de una moneda («peso argentino»). */
export function nombreMoneda(codigo) {
  try {
    return new Intl.DisplayNames(['es'], { type: 'currency' }).of(codigo);
  } catch {
    return codigo;
  }
}
