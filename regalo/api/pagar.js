// POST /api/pagar { pedido } — crea el cobro en Stripe (o devuelve modo demo).
import { dependencias, pagar } from '../servidor/pedidos.js';
import { leerJson, manejar } from '../servidor/http.js';

export const POST = manejar(async (request) => {
  const { pedido } = await leerJson(request);
  return pagar(String(pedido ?? ''), dependencias());
});
