// Compra dentro de Acierto: datos de envío → precio real → pago en la página → pedido.
// Habla con /api. Si no hay servidor (hosting estático), la página sigue con los enlaces a tienda.

const $ = (id) => document.getElementById(id);

const ESTADOS_EEUU = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', DC: 'Distrito de Columbia', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawái', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky',
  LA: 'Luisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Míchigan', MN: 'Minnesota',
  MS: 'Misisipi', MO: 'Misuri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'Nuevo Hampshire',
  NJ: 'Nueva Jersey', NM: 'Nuevo México', NY: 'Nueva York', NC: 'Carolina del Norte',
  ND: 'Dakota del Norte', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregón', PA: 'Pensilvania',
  RI: 'Rhode Island', SC: 'Carolina del Sur', SD: 'Dakota del Sur', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'Virginia Occidental',
  WI: 'Wisconsin', WY: 'Wyoming',
};

let ajustes = null;
let contexto = null;
let stripe = null;
let elementos = null;
let actual = null; // { idea, pedido, cotizacion }

/** Pide al servidor qué se puede comprar. Devuelve false si no hay servidor. */
export async function iniciarCheckout(ctx) {
  contexto = ctx;
  try {
    const r = await fetch('/api/config');
    if (!r.ok) return false;
    ajustes = await r.json();
  } catch {
    return false;
  }
  const estado = $('co-province');
  for (const [codigo, nombre] of Object.entries(ESTADOS_EEUU)) estado.append(new Option(`${nombre} (${codigo})`, codigo));
  $('co-form').addEventListener('submit', enviarDatos);
  $('co-pagar').addEventListener('click', pagar);
  $('co-volver').addEventListener('click', () => paso('datos'));
  $('co-cerrar').addEventListener('click', () => $('dialogo-compra').close());
  $('dialogo-compra').addEventListener('close', () => {
    if (location.hash.startsWith('#pedido/')) history.replaceState(null, '', location.pathname);
  });
  addEventListener('hashchange', abrirSeguimientoDelHash);
  abrirSeguimientoDelHash();
  return true;
}

export function sePuedeComprar(idea, pais = null) {
  if (!ajustes?.comprables.includes(idea.id)) return false;
  if (pais && Array.isArray(ajustes.paisesEnvio) && !ajustes.paisesEnvio.includes(pais)) return false;
  return true;
}

export function abrirCheckout(idea) {
  actual = { idea };
  $('co-producto').textContent = idea.nombre;
  $('co-demo').hidden = ajustes.pago !== 'demo';
  limpiarErrores();
  paso('datos');
  $('dialogo-compra').showModal();
}

function paso(nombre) {
  for (const p of document.querySelectorAll('#dialogo-compra [data-paso]')) p.hidden = p.dataset.paso !== nombre;
}

function limpiarErrores() {
  for (const e of document.querySelectorAll('#co-form .error')) e.textContent = '';
  $('co-error').textContent = '';
}

async function enviarDatos(e) {
  e.preventDefault();
  limpiarErrores();
  const comprador = Object.fromEntries(new FormData($('co-form')));
  comprador.country = contexto?.()?.pais ?? 'US';
  const boton = $('co-continuar');
  boton.disabled = true;
  try {
    const { pedido } = await api('/api/comprar', { ideaId: actual.idea.id, comprador });
    actual.pedido = pedido;
    paso('buscando');
    actual.cotizacion = await esperarCotizacion(pedido);
    mostrarResumen();
  } catch (error) {
    paso('datos');
    mostrarError(error);
  } finally {
    boton.disabled = false;
  }
}

async function esperarCotizacion(pedido) {
  const limite = Date.now() + 120_000;
  while (Date.now() < limite) {
    const c = await api(`/api/cotizacion?pedido=${encodeURIComponent(pedido)}`);
    if (c.estado === 'lista') return c;
    if (c.estado === 'fallo') throw new Error(c.motivo);
    await espera(2000);
  }
  throw new Error('La tienda está tardando demasiado. Inténtalo de nuevo en un momento.');
}

function mostrarResumen() {
  const c = actual.cotizacion;
  const filas = [['Producto', c.producto], ['Envío', c.envio], ['Impuestos', c.impuestos]];
  if (c.descuento) filas.push(['Descuento', -c.descuento]);
  filas.push(['Servicio Acierto', c.servicio]);
  $('co-desglose').replaceChildren(...filas.map(([t, v]) => fila(t, dinero(v, c.moneda))));
  $('co-total').textContent = dinero(c.total, c.moneda);
  $('co-total-local').textContent = aproximadoLocal(c.total, c.moneda);
  $('co-pagar').textContent = `Pagar ${dinero(c.total, c.moneda)}${ajustes.pago === 'demo' ? ' (demo)' : ''}`;
  $('co-pago').replaceChildren();
  paso('resumen');
  if (ajustes.pago === 'stripe') montarStripe().catch(mostrarError);
}

async function montarStripe() {
  const { clientSecret } = await api('/api/pagar', { pedido: actual.pedido });
  if (!stripe) {
    await cargarScript('https://js.stripe.com/v3/');
    stripe = window.Stripe(ajustes.stripePublica, { locale: 'es' });
  }
  elementos = stripe.elements({ clientSecret, appearance: { theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'stripe' } });
  elementos.create('payment').mount('#co-pago');
}

async function pagar() {
  const boton = $('co-pagar');
  boton.disabled = true;
  $('co-error').textContent = '';
  try {
    let pago = null;
    if (ajustes.pago === 'stripe') {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements: elementos,
        confirmParams: { return_url: `${location.origin}${location.pathname}#pedido/${actual.pedido}` },
        redirect: 'if_required',
      });
      if (error) throw new Error(error.message);
      pago = paymentIntent.id;
    } else {
      await api('/api/pagar', { pedido: actual.pedido });
    }
    const r = await api('/api/confirmar', { pedido: actual.pedido, pago });
    if (r.estado === 'reembolsado') throw new Error(`${r.motivo}. Te devolvimos el dinero.`);
    guardarPedido(actual.pedido, actual.idea.nombre);
    location.hash = `pedido/${actual.pedido}`;
  } catch (error) {
    mostrarError(error);
  } finally {
    boton.disabled = false;
  }
}

// — Seguimiento —

async function abrirSeguimientoDelHash() {
  const m = location.hash.match(/^#pedido\/([\w-]+)$/);
  if (!m) return;
  const pedido = m[1];
  const dialogo = $('dialogo-compra');
  if (!dialogo.open) dialogo.showModal();
  paso('listo');
  $('co-numero').textContent = pedido;
  $('co-producto').textContent = pedidosGuardados()[pedido] ?? 'Tu regalo';
  // Vuelta de una verificación del banco: Stripe añade el pago a la URL.
  const pago = new URLSearchParams(location.search).get('payment_intent');
  if (pago) {
    history.replaceState(null, '', `${location.pathname}${location.hash}`);
    await api('/api/confirmar', { pedido, pago }).catch(mostrarError);
  }
  for (let i = 0; i < 30 && location.hash === `#pedido/${pedido}`; i++) {
    try {
      const e = await api(`/api/pedido?pedido=${encodeURIComponent(pedido)}`);
      $('co-estado').textContent = e.motivo ? `${e.texto}: ${e.motivo}` : e.texto;
      $('co-envios').replaceChildren(...(e.envios ?? []).map((s) => {
        const li = document.createElement('li');
        li.textContent = `Envío: ${s.estado}${s.seguimiento ? ` · seguimiento ${s.seguimiento}` : ''}`;
        return li;
      }));
      if (e.estado === 'completed' || e.estado === 'failed') break;
    } catch {
      $('co-estado').textContent = 'No pudimos consultar el pedido ahora. Guarda este enlace y vuelve más tarde.';
      break;
    }
    await espera(3000);
  }
}

function guardarPedido(id, nombre) {
  try {
    localStorage.setItem('acierto.pedidos', JSON.stringify({ ...pedidosGuardados(), [id]: nombre }));
  } catch {
    // Sin almacenamiento: el enlace #pedido/<id> sigue sirviendo.
  }
}

function pedidosGuardados() {
  try {
    return JSON.parse(localStorage.getItem('acierto.pedidos')) ?? {};
  } catch {
    return {};
  }
}

// — Utilidades —

async function api(ruta, cuerpo) {
  const r = await fetch(ruta, cuerpo
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) }
    : undefined);
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(datos.error ?? 'No se pudo conectar'), { campos: datos.campos });
  return datos;
}

function mostrarError(error) {
  $('co-error').textContent = error.message;
  for (const [campo, mensaje] of Object.entries(error.campos ?? {})) {
    const hueco = document.querySelector(`#co-form [data-error="${campo}"]`);
    if (hueco) hueco.textContent = mensaje;
  }
}

function fila(texto, valor) {
  const d = document.createElement('div');
  d.append(Object.assign(document.createElement('span'), { textContent: texto }),
    Object.assign(document.createElement('span'), { textContent: valor }));
  return d;
}

function dinero(centavos, moneda) {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: moneda }).format(centavos / 100);
}

function aproximadoLocal(centavos, moneda) {
  const { pais, moneda: local, tasas } = contexto();
  if (local === moneda || !tasas?.[local]) return '';
  const valor = (centavos / 100) * tasas[local];
  const texto = new Intl.NumberFormat(`es-${pais}`, { style: 'currency', currency: local, maximumFractionDigits: 0 }).format(valor);
  return `≈ ${texto}. Tu banco hace la conversión al pagar.`;
}

function cargarScript(src) {
  return new Promise((resolver, rechazar) => {
    const s = Object.assign(document.createElement('script'), { src, onload: resolver, onerror: () => rechazar(new Error('No se pudo cargar el pago')) });
    document.head.append(s);
  });
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
