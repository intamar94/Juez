// POST /api/stripe-webhook — respaldo del pago: Stripe confirma el PaymentIntent
// aunque el navegador se cierre o no vuelva a Acierto. Nunca confiamos en datos enviados por el cliente.
import { alPagar, dependencias } from '../servidor/pedidos.js';
import { verificarWebhook } from '../servidor/stripe.js';

export const POST = async (request) => {
  const deps = dependencias();
  if (!deps.stripe?.cfg?.webhook) return new Response('Webhook no configurado', { status: 503 });

  try {
    const cuerpo = await request.text();
    const firma = request.headers.get('stripe-signature') ?? '';
    const evento = verificarWebhook(cuerpo, firma, deps.stripe.cfg.webhook);

    if (evento.type === 'payment_intent.succeeded') {
      const intento = evento.data?.object;
      const pedido = intento?.metadata?.rye_intent;
      if (pedido) await alPagar({ ryeId: pedido, pagoId: intento.id, pagado: intento.amount_received }, deps);
    }

    return new Response(JSON.stringify({ recibido: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    console.error(error);
    return new Response('Webhook inválido', { status: 400 });
  }
};
