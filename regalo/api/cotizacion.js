// GET /api/cotizacion?pedido=… — precio final (tienda + envío + impuestos + servicio) cuando está listo.
import { cotizacion, dependencias } from '../servidor/pedidos.js';
import { manejar, parametro } from '../servidor/http.js';

export const GET = manejar(async (request) => cotizacion(parametro(request, 'pedido'), dependencias()));
