// Cliente mínimo de Stripe por REST (sin SDK): cobrar, reembolsar y verificar webhooks.
import { createHmac, timingSafeEqual } from 'node:crypto';

export function clienteStripe({ secreta }, pedir = fetch) {
  async function llamar(metodo, ruta, campos, cabeceras = {}) {
    const respuesta = await pedir(`https://api.stripe.com/v1${ruta}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${secreta}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...cabeceras,
      },
      body: campos ? new URLSearchParams(campos).toString() : undefined,
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error?.message ?? `Stripe respondió ${respuesta.status}`);
    return datos;
  }

  return {
    /**
     * PaymentIntent para cobrar en la página con el Payment Element. La clave de idempotencia
     * evita cobrar dos veces el mismo pedido si el cliente reintenta.
     */
    crearPago: ({ centavos, moneda, email, metadata, idempotencia }) => {
      const campos = {
        amount: String(centavos),
        currency: moneda.toLowerCase(),
        'automatic_payment_methods[enabled]': 'true',
        receipt_email: email,
      };
      for (const [k, v] of Object.entries(metadata)) campos[`metadata[${k}]`] = v;
      return llamar('POST', '/payment_intents', campos, idempotencia ? { 'Idempotency-Key': idempotencia } : {});
    },
    obtenerPago: (id) => llamar('GET', `/payment_intents/${encodeURIComponent(id)}`),
    reembolsar: (idPago) => llamar('POST', '/refunds', { payment_intent: idPago }, { 'Idempotency-Key': `reembolso-${idPago}` }),
  };
}

/**
 * Verifica la cabecera Stripe-Signature («t=…,v1=…») sobre el cuerpo crudo del webhook.
 * Devuelve el evento o lanza un error. Tolerancia de 5 minutos contra repeticiones.
 */
export function verificarWebhook(cuerpo, cabecera, secreto, ahora = Date.now()) {
  const partes = Object.fromEntries((cabecera ?? '').split(',').map((p) => p.split('=')));
  const firmas = (cabecera ?? '').split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  const t = Number(partes.t);
  if (!t || !firmas.length) throw new Error('Firma de Stripe ausente');
  if (Math.abs(ahora / 1000 - t) > 300) throw new Error('Firma de Stripe caducada');
  const esperada = createHmac('sha256', secreto).update(`${t}.${cuerpo}`).digest('hex');
  const ok = firmas.some((f) => f.length === esperada.length && timingSafeEqual(Buffer.from(f), Buffer.from(esperada)));
  if (!ok) throw new Error('Firma de Stripe no válida');
  return JSON.parse(cuerpo);
}
