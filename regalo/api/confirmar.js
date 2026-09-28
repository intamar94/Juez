// POST /api/confirmar { pedido, pago } — la página avisa de que el pago terminó. El servidor lo
// comprueba con Stripe (nunca se fía de la página) y hace la compra en la tienda. El webhook de
// Stripe hace lo mismo como respaldo; las dos vías son idempotentes.
import { alPagar, dependencias, ErrorCliente } from '../servidor/pedidos.js';
import { leerJson, manejar } from '../servidor/http.js';

export const POST = manejar(async (request) => {
  const { pedido, pago } = await leerJson(request);
  const deps = dependencias();
  if (!deps.stripe) return alPagar({ ryeId: String(pedido ?? ''), pagoId: null, pagado: null }, deps);

  const intento = await deps.stripe.obtenerPago(String(pago ?? ''));
  if (intento.metadata?.rye_intent !== pedido) throw new ErrorCliente('El pago no corresponde a este pedido');
  if (intento.status !== 'succeeded') throw new ErrorCliente('El pago aún no se ha completado');
  return alPagar({ ryeId: pedido, pagoId: intento.id, pagado: intento.amount_received }, deps);
});
