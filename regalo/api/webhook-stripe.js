// POST /api/webhook-stripe — Stripe avisa de que un pago se completó. Configúralo en el panel de
// Stripe con el evento payment_intent.succeeded y guarda su secreto en STRIPE_WEBHOOK_SECRET.
import { alPagar, dependencias } from '../servidor/pedidos.js';
import { verificarWebhook } from '../servidor/stripe.js';
import { json } from '../servidor/http.js';

export async function POST(request) {
  const deps = dependencias();
  if (!deps.cfg.stripe?.webhook) return json({ error: 'Webhook no configurado' }, 404);
  let evento;
  try {
    evento = verificarWebhook(await request.text(), request.headers.get('stripe-signature'), deps.cfg.stripe.webhook);
  } catch (error) {
    return json({ error: error.message }, 400);
  }
  if (evento.type !== 'payment_intent.succeeded') return json({ recibido: true });
  const pago = evento.data.object;
  if (!pago.metadata?.rye_intent) return json({ recibido: true });
  try {
    const resultado = await alPagar({ ryeId: pago.metadata.rye_intent, pagoId: pago.id, pagado: pago.amount_received }, deps);
    return json(resultado);
  } catch (error) {
    console.error(error);
    // 500 hace que Stripe reintente más tarde.
    return json({ error: 'Reintentar' }, 500);
  }
}
