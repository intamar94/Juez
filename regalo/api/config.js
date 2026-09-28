// GET /api/config — qué puede hacer la página en producción: cobrar con Stripe o en modo demo, y qué ideas
// se pueden comprar dentro.
import { dependencias, ideasComprables } from '../servidor/pedidos.js';
import { PAISES_ENVIO } from '../servidor/config.js';
import { manejar } from '../servidor/http.js';

export const GET = manejar(async () => {
  const { cfg, entorno, stripe } = dependencias();
  return {
    pago: stripe ? 'stripe' : 'demo',
    stripePublica: cfg.stripe?.publica ?? null,
    entorno,
    paisesEnvio: PAISES_ENVIO,
    comprables: ideasComprables(entorno),
  };
});
