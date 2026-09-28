// Producto concreto que se compra para cada idea cuando el cliente paga en Acierto.
//
// La compra automática necesita la URL exacta de un producto (Amazon, una tienda Shopify u
// otra que Rye soporte), no una búsqueda. Añade aquí la que elijas para cada idea, con el id
// de catalogo.js. Las ideas sin producto siguen mostrando el enlace a la tienda.
//
//   'botella-termo': 'https://www.amazon.com/dp/XXXXXXXXXX',

export const PRODUCTOS = {
};

/** Producto de la tienda de pruebas de Rye: en modo pruebas vale para cualquier idea. */
export const PRODUCTO_PRUEBA = 'https://rye-test-store.myshopify.com/products/product-published-to-rye-channel';

export function productoPara(idea, entorno) {
  if (idea.tipo === 'experiencia' || idea.tipo === 'tiempo') return null;
  return PRODUCTOS[idea.id] ?? (entorno === 'production' ? null : PRODUCTO_PRUEBA);
}
