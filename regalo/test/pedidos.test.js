import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { config, precioFinal } from '../servidor/config.js';
import {
  alPagar, cotizacion, ErrorCliente, estado, ideasComprables, iniciar, pagar, validarComprador,
} from '../servidor/pedidos.js';
import { clienteRye } from '../servidor/rye.js';
import { ryeSimulado } from '../servidor/simulado.js';
import { verificarWebhook } from '../servidor/stripe.js';
import { PRODUCTO_PRUEBA } from '../productos.js';

const comprador = {
  firstName: 'Ana', lastName: 'Pérez', email: 'ana@example.com', phone: '(212) 555-0100',
  address1: '123 Main St', city: 'New York', province: 'ny', postalCode: '10001', country: 'us',
};
const margen = { porcentaje: 15, fijoCentavos: 100 };

function stripeFalso() {
  const llamadas = { pagos: [], reembolsos: [] };
  return {
    llamadas,
    async crearPago(datos) {
      llamadas.pagos.push(datos);
      return { id: 'pi_1', client_secret: 'pi_1_secret' };
    },
    async reembolsar(id) {
      llamadas.reembolsos.push(id);
      return { id: 're_1' };
    },
  };
}

function deps(extra = {}) {
  return { cfg: { margen }, entorno: 'demo', rye: ryeSimulado(), stripe: null, ...extra };
}

test('sin claves todo queda en modo demo', () => {
  const cfg = config({});
  assert.equal(cfg.rye, null);
  assert.equal(cfg.stripe, null);
  assert.deepEqual(cfg.margen, margen);
  assert.equal(config({ RYE_API_KEY: 'k', RYE_ENTORNO: 'production' }).rye.base, 'https://api.rye.com/api/v1');
  assert.equal(config({ RYE_API_KEY: 'k' }).rye.base, 'https://staging.api.rye.com/api/v1');
  assert.equal(config({ MARGEN_PORCENTAJE: '-3' }).margen.porcentaje, 15);
});

test('el margen se suma al total de la tienda y cubre la comisión de Stripe', () => {
  assert.deepEqual(precioFinal(3308, margen), { servicio: 597, total: 3905 });
  for (const tienda of [500, 2000, 10000, 50000]) {
    const { total, servicio } = precioFinal(tienda, margen);
    const comisionStripe = Math.ceil(total * 0.029 + 30);
    assert.ok(servicio > comisionStripe, `margen ${servicio} no cubre Stripe ${comisionStripe} en ${tienda}`);
  }
});

test('validarComprador normaliza y exige los datos de envío', () => {
  const b = validarComprador(comprador);
  assert.equal(b.province, 'NY');
  assert.equal(b.country, 'US');
  assert.equal(b.phone, '2125550100');
  assert.throws(() => validarComprador({ ...comprador, country: 'MX' }), (e) => Boolean(e.campos.country));
  assert.throws(() => validarComprador({ ...comprador, postalCode: '1000' }), (e) => Boolean(e.campos.postalCode));
  assert.throws(() => validarComprador({ ...comprador, province: 'New York' }), (e) => Boolean(e.campos.province));
  assert.throws(() => validarComprador({ ...comprador, email: 'ana' }), (e) => Boolean(e.campos.email));
  assert.throws(() => validarComprador({}), (e) => e instanceof ErrorCliente && Object.keys(e.campos).length === 9);
});

test('en demo se pueden comprar los productos, no los planes', () => {
  const ids = ideasComprables('demo');
  assert.ok(ids.includes('botella-termo'));
  assert.ok(!ids.includes('spa-masaje'));
  assert.deepEqual(ideasComprables('production'), []);
});

test('flujo completo en demo: cotizar, pagar y comprar', async () => {
  const d = deps();
  const { pedido } = await iniciar({ ideaId: 'botella-termo', comprador }, d);
  assert.deepEqual(await cotizacion(pedido, d), { estado: 'buscando' });
  const c = await cotizacion(pedido, d);
  assert.equal(c.estado, 'lista');
  assert.equal(c.total, 3905);
  assert.equal(c.producto + c.envio + c.impuestos + c.servicio, c.total);

  const p = await pagar(pedido, d);
  assert.equal(p.modo, 'demo');
  assert.deepEqual(await alPagar({ ryeId: pedido, pagoId: null, pagado: null }, d), { estado: 'comprando' });
  // Repetir el aviso de pago no hace un segundo pedido.
  assert.deepEqual(await alPagar({ ryeId: pedido, pagoId: null, pagado: null }, d), { estado: 'comprando' });
  const e = await estado(pedido, d);
  assert.equal(e.estado, 'completed');
  assert.equal(e.texto, 'Pedido hecho');
  assert.ok(!('buyer' in e), 'el estado público no expone datos personales');
});

test('con Stripe, el cobro lo calcula el servidor y lleva el pedido en metadata', async () => {
  const stripe = stripeFalso();
  const d = deps({ stripe });
  const { pedido } = await iniciar({ ideaId: 'botella-termo', comprador }, d);
  await cotizacion(pedido, d);
  const p = await pagar(pedido, d);
  assert.equal(p.clientSecret, 'pi_1_secret');
  const [pago] = stripe.llamadas.pagos;
  assert.equal(pago.centavos, 3905);
  assert.equal(pago.moneda, 'USD');
  assert.equal(pago.metadata.rye_intent, pedido);
  assert.equal(pago.idempotencia, `pago-${pedido}`);
});

test('si se pagó menos de lo debido, se reembolsa y no se compra', async () => {
  const stripe = stripeFalso();
  const d = deps({ stripe });
  const { pedido } = await iniciar({ ideaId: 'botella-termo', comprador }, d);
  await cotizacion(pedido, d);
  const r = await alPagar({ ryeId: pedido, pagoId: 'pi_1', pagado: 100 }, d);
  assert.equal(r.estado, 'reembolsado');
  assert.deepEqual(stripe.llamadas.reembolsos, ['pi_1']);
  assert.equal((await estado(pedido, d)).estado, 'awaiting_confirmation');
});

test('si la tienda falla al confirmar, se reembolsa al cliente', async () => {
  const stripe = stripeFalso();
  const rye = ryeSimulado();
  rye.confirmar = async () => { throw Object.assign(new Error('boom'), { estado: 500 }); };
  const d = deps({ stripe, rye });
  const { pedido } = await iniciar({ ideaId: 'botella-termo', comprador }, d);
  await cotizacion(pedido, d);
  const r = await alPagar({ ryeId: pedido, pagoId: 'pi_9', pagado: 3905 }, d);
  assert.equal(r.estado, 'reembolsado');
  assert.deepEqual(stripe.llamadas.reembolsos, ['pi_9']);
});

test('no se puede pagar un pedido que aún no tiene precio', async () => {
  const d = deps();
  const { pedido } = await iniciar({ ideaId: 'botella-termo', comprador }, d);
  await assert.rejects(pagar(pedido, d), ErrorCliente);
});

test('ideas sin producto y planes no se pueden comprar dentro', async () => {
  await assert.rejects(iniciar({ ideaId: 'spa-masaje', comprador }, deps()), /todavía no se puede/);
  await assert.rejects(iniciar({ ideaId: 'nada', comprador }, deps()), /no existe/);
  await assert.rejects(iniciar({ ideaId: 'botella-termo', comprador }, deps({ entorno: 'production' })), /todavía no se puede/);
});

test('el cliente de Rye usa la API documentada', async () => {
  const llamadas = [];
  const pedir = async (url, opciones) => {
    llamadas.push({ url, ...opciones, body: opciones.body && JSON.parse(opciones.body) });
    return new Response(JSON.stringify({ id: 'ci_1', state: 'retrieving_offer' }), { status: 201 });
  };
  const rye = clienteRye({ clave: 'KEY', base: 'https://staging.api.rye.com/api/v1' }, pedir);
  await rye.crear({ productUrl: PRODUCTO_PRUEBA, buyer: { firstName: 'A' }, referenceId: 'r1' });
  await rye.confirmar('ci_1');
  assert.equal(llamadas[0].url, 'https://staging.api.rye.com/api/v1/checkout-intents');
  assert.equal(llamadas[0].headers.Authorization, 'Bearer KEY');
  assert.deepEqual(llamadas[0].body, { productUrl: PRODUCTO_PRUEBA, buyer: { firstName: 'A' }, quantity: 1, referenceId: 'r1' });
  assert.equal(llamadas[1].url, 'https://staging.api.rye.com/api/v1/checkout-intents/ci_1/confirm');
  assert.deepEqual(llamadas[1].body, { paymentMethod: { type: 'drawdown' } });
});

test('los errores de Rye llevan el nombre para detectar estados inválidos', async () => {
  const pedir = async () => new Response(JSON.stringify({ name: 'InvalidCheckoutIntentStateError', message: 'x' }), { status: 400 });
  const rye = clienteRye({ clave: 'K', base: 'https://x' }, pedir);
  await assert.rejects(rye.confirmar('ci_1'), (e) => e.nombre === 'InvalidCheckoutIntentStateError' && e.estado === 400);
});

test('verificarWebhook acepta firmas válidas y rechaza el resto', () => {
  const secreto = 'whsec_test';
  const cuerpo = JSON.stringify({ type: 'payment_intent.succeeded' });
  const t = 1_700_000_000;
  const firma = createHmac('sha256', secreto).update(`${t}.${cuerpo}`).digest('hex');
  const ahora = t * 1000;
  assert.equal(verificarWebhook(cuerpo, `t=${t},v1=${firma}`, secreto, ahora).type, 'payment_intent.succeeded');
  assert.throws(() => verificarWebhook(cuerpo, `t=${t},v1=${'0'.repeat(64)}`, secreto, ahora), /no válida/);
  assert.throws(() => verificarWebhook(`${cuerpo} `, `t=${t},v1=${firma}`, secreto, ahora), /no válida/);
  assert.throws(() => verificarWebhook(cuerpo, `t=${t},v1=${firma}`, secreto, ahora + 10 * 60_000), /caducada/);
  assert.throws(() => verificarWebhook(cuerpo, undefined, secreto, ahora), /ausente/);
});

test('el demo sobrevive a otra instancia sin memoria del pedido', async () => {
  const a = deps();
  const { pedido } = await iniciar({ ideaId: 'botella-termo', comprador }, a);
  const b = deps(); // otra instancia: simulador vacío
  assert.equal((await cotizacion(pedido, b)).estado, 'lista');
  assert.deepEqual(await alPagar({ ryeId: pedido, pagoId: null, pagado: null }, deps()), { estado: 'comprando' });
});
