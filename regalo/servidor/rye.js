// Cliente mínimo de la API de Rye (Checkout Intents v1): compra en la tienda de origen.
// Referencia: SDK oficial rye-com/checkout-intents-python.
//   crear → la API busca precio, envío e impuestos (estado retrieving_offer)
//   obtener → cuando está listo, estado awaiting_confirmation con `offer.cost`
//   confirmar → paga desde el saldo prepago de Acierto (drawdown) y hace el pedido

export function clienteRye({ clave, base }, pedir = fetch) {
  async function llamar(metodo, ruta, cuerpo) {
    const respuesta = await pedir(`${base}${ruta}`, {
      method: metodo,
      headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      const error = new Error(datos.message ?? `Rye respondió ${respuesta.status}`);
      error.estado = respuesta.status;
      error.nombre = datos.name;
      throw error;
    }
    return datos;
  }

  return {
    crear: ({ productUrl, buyer, referenceId }) =>
      llamar('POST', '/checkout-intents', { productUrl, buyer, quantity: 1, referenceId }),
    obtener: (id) => llamar('GET', `/checkout-intents/${encodeURIComponent(id)}`),
    confirmar: (id) =>
      llamar('POST', `/checkout-intents/${encodeURIComponent(id)}/confirm`, { paymentMethod: { type: 'drawdown' } }),
    envios: (id) => llamar('GET', `/checkout-intents/${encodeURIComponent(id)}/shipments`),
  };
}
