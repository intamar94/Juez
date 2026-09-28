// El proceso completo de una compra dentro de Acierto:
//
//   1. iniciar     el cliente elige una idea y pone la dirección de envío → se pide a Rye
//                  precio, envío e impuestos del producto en la tienda de origen
//   2. cotizacion  cuando Rye tiene la oferta, se suma el margen de Acierto
//   3. pagar       se crea el cobro en Stripe por ese total (el cliente paga en la página)
//   4. alPagar     Stripe confirma el pago (webhook) → se confirma la compra en Rye, que paga
//                  con el saldo prepago de Acierto y hace el pedido en la tienda.
//                  Si la tienda falla, se reembolsa al cliente automáticamente.
//   5. estado      seguimiento del pedido y del envío
//
// Las dependencias (Rye, Stripe) se inyectan para poder probarlo sin red.

import { IDEAS } from '../catalogo.js';
import { productoPara } from '../productos.js';
import { clienteRye } from './rye.js';
import { ryeSimulado } from './simulado.js';
import { clienteStripe } from './stripe.js';
import { config, PAISES_ENVIO, precioFinal } from './config.js';

const simulado = ryeSimulado();

export function dependencias(cfg = config()) {
  return {
    cfg,
    entorno: cfg.rye?.entorno ?? 'demo',
    rye: cfg.rye ? clienteRye(cfg.rye) : simulado,
    stripe: cfg.stripe ? clienteStripe(cfg.stripe) : null,
  };
}

export class ErrorCliente extends Error {
  constructor(mensaje, campos = {}) {
    super(mensaje);
    this.campos = campos;
  }
}

const CAMPOS = {
  firstName: 'Nombre', lastName: 'Apellido', email: 'Correo', phone: 'Teléfono',
  address1: 'Dirección', city: 'Ciudad', province: 'Estado', postalCode: 'Código postal', country: 'País',
};

/** Valida y normaliza la dirección de envío. Lanza ErrorCliente con los campos que fallan. */
export function validarComprador(datos = {}) {
  const limpio = {};
  const errores = {};
  for (const campo of [...Object.keys(CAMPOS), 'address2']) {
    const valor = String(datos[campo] ?? '').trim().slice(0, 255);
    if (valor) limpio[campo] = valor;
    else if (campo !== 'address2') errores[campo] = `Falta ${CAMPOS[campo].toLowerCase()}`;
  }
  if (limpio.country) limpio.country = limpio.country.toUpperCase();
  if (limpio.country && !PAISES_ENVIO.includes(limpio.country)) {
    errores.country = 'Por ahora solo enviamos a Estados Unidos';
  }
  if (limpio.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(limpio.email)) errores.email = 'Correo no válido';
  if (limpio.phone) {
    limpio.phone = limpio.phone.replace(/[^\d+]/g, '');
    if (limpio.phone.replace(/\D/g, '').length < 10) errores.phone = 'Teléfono no válido';
  }
  if (limpio.country === 'US') {
    if (limpio.postalCode && !/^\d{5}(-\d{4})?$/.test(limpio.postalCode)) errores.postalCode = 'Código postal no válido (5 dígitos)';
    if (limpio.province) {
      limpio.province = limpio.province.toUpperCase();
      if (!/^[A-Z]{2}$/.test(limpio.province)) errores.province = 'Usa la abreviatura de 2 letras (NY, CA, TX…)';
    }
  }
  if (Object.keys(errores).length) throw new ErrorCliente('Revisa los datos de envío', errores);
  return limpio;
}

/** Ideas que se pueden comprar dentro de Acierto en este entorno. */
export function ideasComprables(entorno) {
  return IDEAS.filter((i) => productoPara(i, entorno)).map((i) => i.id);
}

export async function iniciar({ ideaId, comprador }, { rye, entorno }) {
  const idea = IDEAS.find((i) => i.id === ideaId);
  if (!idea) throw new ErrorCliente('Esa idea no existe');
  const productUrl = productoPara(idea, entorno);
  if (!productUrl) throw new ErrorCliente('Esta idea todavía no se puede comprar aquí');
  const buyer = validarComprador(comprador);
  const intento = await rye.crear({ productUrl, buyer, referenceId: `acierto-${idea.id}-${Date.now()}` });
  return { pedido: intento.id };
}

export async function cotizacion(id, { rye, cfg }) {
  const intento = await rye.obtener(id);
  if (intento.state === 'retrieving_offer') return { estado: 'buscando' };
  if (intento.state === 'failed') return { estado: 'fallo', motivo: motivoFallo(intento.failureReason) };
  if (intento.state !== 'awaiting_confirmation') return { estado: 'en-curso' };
  return { estado: 'lista', ...desglose(intento.offer.cost, cfg.margen) };
}

function desglose(cost, margen) {
  const moneda = cost.total.currencyCode;
  const { servicio, total } = precioFinal(cost.total.amountSubunits, margen);
  return {
    moneda,
    producto: cost.subtotal.amountSubunits,
    envio: cost.shipping?.amountSubunits ?? 0,
    impuestos: cost.tax?.amountSubunits ?? 0,
    descuento: cost.discount?.amountSubunits ?? 0,
    servicio,
    total,
  };
}

/** Crea el cobro. El total se calcula en el servidor: nunca se confía en el que envía la página. */
export async function pagar(id, { rye, stripe, cfg }) {
  const intento = await rye.obtener(id);
  if (intento.state !== 'awaiting_confirmation') throw new ErrorCliente('Este pedido ya no se puede pagar; vuelve a empezar');
  const d = desglose(intento.offer.cost, cfg.margen);
  if (!stripe) return { modo: 'demo', ...d };
  const pago = await stripe.crearPago({
    centavos: d.total,
    moneda: d.moneda,
    email: intento.buyer.email,
    metadata: { rye_intent: id, total_tienda: String(intento.offer.cost.total.amountSubunits) },
    idempotencia: `pago-${id}`,
  });
  return { modo: 'stripe', clientSecret: pago.client_secret, ...d };
}

/**
 * El cliente ya pagó: se hace la compra en la tienda. Es idempotente (Stripe puede repetir el
 * webhook) y reembolsa si la tienda no puede completar el pedido.
 */
export async function alPagar({ ryeId, pagoId, pagado }, { rye, stripe, cfg }) {
  const intento = await rye.obtener(ryeId);
  if (['completed', 'placing_order', 'requires_action'].includes(intento.state)) return { estado: 'comprando' };

  const reembolsar = async (motivo) => {
    if (stripe && pagoId) await stripe.reembolsar(pagoId);
    return { estado: 'reembolsado', motivo };
  };

  if (intento.state !== 'awaiting_confirmation') return reembolsar(motivoFallo(intento.failureReason));
  const esperado = precioFinal(intento.offer.cost.total.amountSubunits, cfg.margen).total;
  if (pagado != null && pagado < esperado) return reembolsar('El importe pagado no coincide con el pedido');

  try {
    await rye.confirmar(ryeId);
    return { estado: 'comprando' };
  } catch (error) {
    if (error.nombre === 'InvalidCheckoutIntentStateError') {
      const actual = await rye.obtener(ryeId);
      if (['completed', 'placing_order', 'requires_action'].includes(actual.state)) return { estado: 'comprando' };
    }
    return reembolsar('La tienda no pudo completar el pedido');
  }
}

const ESTADOS = {
  retrieving_offer: 'Buscando el mejor precio',
  awaiting_confirmation: 'Esperando el pago',
  requires_action: 'Procesando el pedido',
  placing_order: 'Haciendo el pedido en la tienda',
  completed: 'Pedido hecho',
  failed: 'No se pudo completar',
};

/** Estado público del pedido: sin datos personales, solo el progreso y el seguimiento. */
export async function estado(id, { rye }) {
  const intento = await rye.obtener(id);
  const respuesta = { estado: intento.state, texto: ESTADOS[intento.state] ?? intento.state };
  if (intento.state === 'failed') respuesta.motivo = motivoFallo(intento.failureReason);
  if (intento.state === 'completed') {
    const { data = [] } = await rye.envios(id).catch(() => ({}));
    respuesta.envios = data.map((e) => ({
      estado: e.status, seguimiento: e.tracking?.number ?? null, url: e.tracking?.url ?? null,
    }));
  }
  return respuesta;
}

const MOTIVOS = {
  product_out_of_stock: 'El producto está agotado',
  insufficient_stock: 'No hay stock suficiente',
  product_not_found: 'El producto ya no está disponible',
  checkout_intent_expired: 'La cotización caducó; vuelve a empezar',
  payment_failed: 'El pago a la tienda falló',
  unsupported_store_no_guest_checkout: 'Esta tienda no permite comprar así',
};

function motivoFallo(fallo) {
  return MOTIVOS[fallo?.code] ?? 'La tienda no pudo procesar el pedido';
}
