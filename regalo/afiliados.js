// Tus cuentas de afiliado. Es lo único que hay que rellenar para cobrar comisión.
//
// La web elige sola, en cada país, la primera tienda donde tengas cuenta; si no tienes
// ninguna, el botón lleva igual a la tienda, solo que sin comisión.

/**
 * Amazon Afiliados: una etiqueta por cada Amazon (se ve en tu panel, termina en -20 o -21).
 *   com     → amazon.com: Estados Unidos, Puerto Rico y, con envío internacional, el resto
 *   es      → amazon.es: España
 *   com.mx  → amazon.com.mx: México
 * La etiqueta se añade a cualquier enlace, así que con ponerla aquí todas las ideas cobran.
 */
export const AMAZON = {
  com: '',
  es: '',
  'com.mx': '',
};

/**
 * Mercado Libre Afiliados (México, Chile y Argentina). Sus enlaces no llevan un código fijo:
 * se generan en tu panel o con la barra de afiliados desde cada página. Pega aquí el enlace
 * generado para cada idea (el id de catalogo.js) en cada país donde quieras cobrar.
 *
 *   MX: { 'botella-termo': 'https://mercadolibre.com/sec/xxxxxxx' },
 */
export const MERCADOLIBRE = {
  MX: {},
  CL: {},
  AR: {},
};
