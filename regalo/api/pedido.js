// GET /api/pedido?pedido=… — estado del pedido y seguimiento del envío.
import { dependencias, estado } from '../servidor/pedidos.js';
import { manejar, parametro } from '../servidor/http.js';

export const GET = manejar(async (request) => estado(parametro(request, 'pedido'), dependencias()));
