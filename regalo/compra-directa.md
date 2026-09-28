# Comprar sin salir de Acierto

El cliente pone la dirección de envío, ve el precio final y paga en la página. Por detrás, el
servidor hace el pedido en la tienda donde está el producto y le envía el regalo directamente.

## Cómo funciona

```
 Página                       Servidor (/api)                      Servicios
 ──────                       ───────────────                      ─────────
 Dirección de envío  ──▶  /api/comprar     ──crea pedido──▶  Rye: busca precio, envío e
                                                              impuestos en la tienda
 «Buscando precio…»  ──▶  /api/cotizacion  ◀──oferta──────  (Amazon, Shopify y otras)
 Precio final + margen
 Tarjeta (Stripe)    ──▶  /api/pagar       ──cobro─────────▶ Stripe: el cliente te paga a ti
 Pago hecho          ──▶  /api/confirmar   ──comprueba pago─▶ Stripe
                          (y /api/webhook-stripe de respaldo)
                                           ──confirma──────▶ Rye: paga con tu saldo prepago
                                                              y hace el pedido en la tienda
 Seguimiento         ──▶  /api/pedido      ◀──estado/envío── Rye
```

- **Tú cobras primero.** El cliente paga a tu cuenta de Stripe el total de la tienda más tu
  margen (`MARGEN_PORCENTAJE` + `MARGEN_FIJO_CENTAVOS`). Rye cobra el pedido de tu saldo
  prepago en Rye (modo *drawdown*), así que la diferencia es tu ganancia.
- **El precio lo calcula el servidor**, nunca la página, y se comprueba otra vez al confirmar.
- **Si la tienda falla** (agotado, cotización caducada, error), el cliente recibe el reembolso
  automáticamente.
- **Sin base de datos:** el pedido vive en Rye y el pago en Stripe, enlazados por el número de
  pedido que va en los metadatos del cobro.
- **Sin claves funciona en modo demo:** pedidos y pagos simulados de principio a fin.

## Qué hace falta para vender de verdad

No hay forma de cobrar tarjetas sin una cuenta de pagos verificada; es obligatorio por ley.
Todo es en línea:

1. **Stripe** ([dashboard.stripe.com](https://dashboard.stripe.com/register)): cuenta con
   identidad y cuenta bancaria. Copia las claves en `STRIPE_SECRET_KEY` y
   `STRIPE_PUBLISHABLE_KEY`, y crea un webhook a `https://TU-DOMINIO/api/webhook-stripe`
   con el evento `payment_intent.succeeded` (su secreto va en `STRIPE_WEBHOOK_SECRET`).
2. **Rye** ([console.rye.com](https://console.rye.com)): clave de API en `RYE_API_KEY`.
   Empieza con `RYE_ENTORNO=staging` (pedidos de prueba, sin compras reales); cuando funcione,
   pasa a `production` y recarga el saldo prepago en su consola.
3. **Productos:** en `productos.js`, la URL exacta del producto que se compra para cada idea.
   En pruebas, todas usan el producto de la tienda de pruebas de Rye.
4. **Publicar en Vercel** con la carpeta `regalo/` como raíz y esas variables en
   *Settings → Environment Variables* (ver `.env.example`).

## Límites que hay que conocer

- **Solo envía a Estados Unidos.** Rye no envía fuera de EE. UU. todavía. El cliente puede
  pagar desde cualquier país, pero el regalo tiene que ir a una dirección de EE. UU. Para
  enviar a Latinoamérica o España no encontré ningún servicio que compre automáticamente;
  habría que añadir otro proveedor en `servidor/` o tiendas aliadas.
- **Eres el vendedor.** Devoluciones, quejas, contracargos e impuestos sobre tu margen son
  tuyos. Deja claras las condiciones de venta y de devolución en la web antes de abrir.
- **Los precios cambian.** La cotización es del momento; si caduca antes de pagar, se pide otra.
- **Stripe cobra ~2,9 % + 0,30 USD por pago**: el margen por defecto (15 % + 1 USD) lo cubre.

## Fuentes

- SDK oficial de Rye: [rye-com/checkout-intents-python](https://github.com/rye-com/checkout-intents-python) (API y flujo de dos fases)
- [Rye: Universal Checkout API](https://rye.com/products/universal-checkout-api) y [preguntas frecuentes (envíos solo a EE. UU.)](https://docs.rye.com/faq)
- [Stripe Payment Element](https://docs.stripe.com/payments/payment-element) y [firmas de webhooks](https://docs.stripe.com/webhooks/signature)
