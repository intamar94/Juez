// POST /api/comprar { ideaId, comprador } — empieza un pedido y pide precio a la tienda.
import { dependencias, iniciar } from '../servidor/pedidos.js';
import { leerJson, manejar } from '../servidor/http.js';

export const POST = manejar(async (request) => iniciar(await leerJson(request), dependencias()));
