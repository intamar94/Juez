// Países, su moneda por defecto y la tienda donde se compra en cada uno.
//
// tienda:
//   'mercadolibre'  listado de Mercado Libre del país (dominio = sufijo tras «mercadolibre.»)
//   'amazon'        Amazon del país (dominio = sufijo tras «amazon.»)
//   'google'        Google Shopping con las tiendas de ese país
// Cambia aquí la tienda de un país o añade tu código de afiliado en `AFILIADOS`.

export const PAISES = {
  AR: { nombre: 'Argentina', moneda: 'ARS', tienda: 'mercadolibre', dominio: 'com.ar' },
  BO: { nombre: 'Bolivia', moneda: 'BOB', tienda: 'google' },
  CL: { nombre: 'Chile', moneda: 'CLP', tienda: 'mercadolibre', dominio: 'cl' },
  CO: { nombre: 'Colombia', moneda: 'COP', tienda: 'mercadolibre', dominio: 'com.co' },
  CR: { nombre: 'Costa Rica', moneda: 'CRC', tienda: 'google' },
  EC: { nombre: 'Ecuador', moneda: 'USD', tienda: 'mercadolibre', dominio: 'com.ec' },
  SV: { nombre: 'El Salvador', moneda: 'USD', tienda: 'google' },
  ES: { nombre: 'España', moneda: 'EUR', tienda: 'amazon', dominio: 'es' },
  US: { nombre: 'Estados Unidos', moneda: 'USD', tienda: 'amazon', dominio: 'com' },
  GT: { nombre: 'Guatemala', moneda: 'GTQ', tienda: 'google' },
  HN: { nombre: 'Honduras', moneda: 'HNL', tienda: 'google' },
  MX: { nombre: 'México', moneda: 'MXN', tienda: 'mercadolibre', dominio: 'com.mx' },
  NI: { nombre: 'Nicaragua', moneda: 'NIO', tienda: 'google' },
  PA: { nombre: 'Panamá', moneda: 'USD', tienda: 'google' },
  PY: { nombre: 'Paraguay', moneda: 'PYG', tienda: 'google' },
  PE: { nombre: 'Perú', moneda: 'PEN', tienda: 'mercadolibre', dominio: 'com.pe' },
  PR: { nombre: 'Puerto Rico', moneda: 'USD', tienda: 'amazon', dominio: 'com' },
  DO: { nombre: 'República Dominicana', moneda: 'DOP', tienda: 'google' },
  UY: { nombre: 'Uruguay', moneda: 'UYU', tienda: 'mercadolibre', dominio: 'com.uy' },
  VE: { nombre: 'Venezuela', moneda: 'USD', tienda: 'google' },
};

export const PAIS_POR_DEFECTO = 'US';

/** Códigos de afiliado por tienda. Vacío = enlace normal. */
export const AFILIADOS = {
  amazon: '',
};

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
