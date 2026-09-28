// Configuración del servidor, leída de variables de entorno en cada llamada (así las pruebas
// pueden cambiarlas). Sin claves, todo funciona en modo demo: pedidos y pagos simulados.

export function config(env = process.env) {
  const entornoRye = env.RYE_ENTORNO === 'production' ? 'production' : 'staging';
  return {
    rye: env.RYE_API_KEY
      ? {
        clave: env.RYE_API_KEY,
        entorno: entornoRye,
        base: entornoRye === 'production' ? 'https://api.rye.com/api/v1' : 'https://staging.api.rye.com/api/v1',
      }
      : null,
    stripe: env.STRIPE_SECRET_KEY
      ? { secreta: env.STRIPE_SECRET_KEY, publica: env.STRIPE_PUBLISHABLE_KEY ?? '', webhook: env.STRIPE_WEBHOOK_SECRET ?? '' }
      : null,
    margen: {
      porcentaje: numero(env.MARGEN_PORCENTAJE, 15),
      fijoCentavos: numero(env.MARGEN_FIJO_CENTAVOS, 100),
    },
  };
}

function numero(valor, porDefecto) {
  const n = Number(valor);
  return valor != null && valor !== '' && Number.isFinite(n) && n >= 0 ? n : porDefecto;
}

/** Países a los que se puede enviar con compra automática (Rye solo envía a EE. UU.). */
export const PAISES_ENVIO = ['US'];

/**
 * Lo que se cobra al cliente: el total de la tienda (producto + envío + impuestos) más el
 * margen de Acierto, que debe cubrir la comisión de Stripe (~2,9 % + 0,30 USD) y dejar ganancia.
 */
export function precioFinal(totalTiendaCentavos, margen) {
  const servicio = Math.ceil(totalTiendaCentavos * margen.porcentaje / 100 + margen.fijoCentavos);
  return { servicio, total: totalTiendaCentavos + servicio };
}
