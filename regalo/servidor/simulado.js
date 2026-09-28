// Rye simulado para el modo demo y las pruebas: misma interfaz que clienteRye, sin red.
// La oferta está lista a la segunda consulta y el pedido se completa al confirmar.

export function ryeSimulado() {
  const intentos = new Map();
  let siguiente = 1;

  return {
    async crear({ productUrl, buyer, referenceId }) {
      const id = `ci_demo_${siguiente++}`;
      const intento = { id, productUrl, buyer, referenceId, quantity: 1, state: 'retrieving_offer', consultas: 0 };
      intentos.set(id, intento);
      return publico(intento);
    },
    async obtener(id) {
      const intento = intentos.get(id);
      if (!intento) throw Object.assign(new Error('No existe'), { estado: 404 });
      if (intento.state === 'retrieving_offer' && ++intento.consultas >= 2) {
        intento.state = 'awaiting_confirmation';
        intento.offer = {
          cost: {
            subtotal: usd(2499), shipping: usd(599), tax: usd(210), total: usd(3308),
          },
          shipping: { availableOptions: [] },
        };
      }
      return publico(intento);
    },
    async confirmar(id) {
      const intento = intentos.get(id);
      if (intento?.state !== 'awaiting_confirmation') {
        throw Object.assign(new Error('Estado no válido'), { estado: 400, nombre: 'InvalidCheckoutIntentStateError' });
      }
      intento.state = 'completed';
      intento.orderId = `pedido_demo_${id}`;
      return publico(intento);
    },
    async envios() {
      return { data: [] };
    },
  };
}

const usd = (amountSubunits) => ({ currencyCode: 'USD', amountSubunits });
const publico = ({ consultas, ...resto }) => structuredClone(resto);
