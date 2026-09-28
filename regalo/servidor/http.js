// Utilidades para las funciones de /api (formato Web estándar: Request → Response).
import { ErrorCliente } from './pedidos.js';

export function json(datos, estado = 200) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function leerJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ErrorCliente('Petición no válida');
  }
}

/** Envuelve un manejador: errores del cliente → 400 con detalle; el resto → 500 genérico. */
export function manejar(fn) {
  return async (request) => {
    try {
      return json(await fn(request));
    } catch (error) {
      if (error instanceof ErrorCliente) return json({ error: error.message, campos: error.campos }, 400);
      console.error(error);
      return json({ error: 'Algo falló de nuestro lado. Inténtalo de nuevo en un momento.' }, 500);
    }
  };
}

export function parametro(request, nombre) {
  const valor = new URL(request.url).searchParams.get(nombre);
  if (!valor) throw new ErrorCliente(`Falta ${nombre}`);
  return valor;
}
