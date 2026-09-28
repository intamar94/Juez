# Comprar sin salir de Acierto

Objetivo: que el usuario pague en nuestra página y, por detrás, el pedido se haga solo en la
tienda donde está el producto.

## Cómo funciona

```
Usuario ──paga──▶ Acierto (checkout propio) ──▶ Servidor de Acierto ──pedido──▶ Tienda de origen
                        │                            │                              │
                   pasarela de pago            guarda el pedido,               envía al usuario
                (Stripe, Mercado Pago)       lanza la compra y sigue           y devuelve número
                                               el envío                         de seguimiento
```

1. **Catálogo con productos concretos.** Hoy cada idea abre una búsqueda. Para comprar
   dentro hace falta un producto exacto por idea y país (tienda, identificador, precio,
   stock), actualizado a diario.
2. **Checkout propio.** Dirección de envío y pago con una pasarela local (Mercado Pago en
   Latinoamérica, Stripe en EE. UU. y España). Se cobra el precio de la tienda + envío +
   impuestos + nuestro margen.
3. **Pedido automático.** Al confirmarse el pago, el servidor hace el pedido en la tienda de
   origen con la dirección del usuario, por API o por un intermediario que lo automatiza.
4. **Seguimiento.** Se guarda el número de seguimiento de la tienda y se avisa al usuario por
   correo o WhatsApp.

Esto exige un **servidor** (la web actual es estática), una **base de datos de pedidos** y ser
**vendedor**: Acierto pasa a ser responsable de devoluciones, garantías, facturas y quejas.

## Opciones para el paso 3

| Opción | Qué hace | Dónde sirve | Límites |
|---|---|---|---|
| **Rye** (Universal Checkout API) | Convierte la URL de cualquier producto de Amazon, Shopify y otras tiendas en un pedido hecho | Solo envíos a EE. UU. | No sirve para Latinoamérica ni España por ahora |
| **Violet** | Un solo checkout conectado a miles de tiendas Shopify, WooCommerce, Magento… | Tiendas que se dan de alta con Violet | La tienda tiene que aceptar vender a través de ti |
| **Protocolos de compra con IA** (UCP de Google y Shopify, ACP de OpenAI y Stripe) | Estándares para que una app compre en tiendas que los adoptan | Tiendas adheridas, sobre todo en EE. UU. | Todavía en despliegue; hay que integrarse como plataforma |
| **Acuerdos directos con tiendas locales** | La tienda te da su API o te manda los pedidos por correo o panel | Cualquier país | Hay que negociar tienda por tienda |
| **Compra automática con un robot de navegador** | Un script entra en la tienda y compra con tu cuenta | Técnicamente, cualquiera | Suele violar los términos de Amazon y Mercado Libre, que pueden bloquear la cuenta; frágil ante cambios de la web |

Mercado Libre y Amazon **no ofrecen una API para comprar en nombre de terceros**: sus APIs son
para vendedores y afiliados. En Latinoamérica, hoy, la vía realista para cobrar dentro es
trabajar con tiendas que acepten (acuerdos directos o Violet) o vender tú como tienda.

## Plan por fases

1. **Ahora: enlaces de afiliado por país.** El usuario compra en la tienda y Acierto cobra
   comisión. Mercado Libre paga hasta un 15 % según la categoría y cuenta cualquier compra
   hecha tras entrar por tu enlace. Amazon tiene su propio programa. No hay que gestionar
   pagos ni devoluciones. En Amazon basta con poner tu etiqueta en `AFILIADOS` (`paises.js`);
   en Mercado Libre los enlaces de afiliado se generan en su panel, así que habría que guardar
   un enlace generado por idea y país en el catálogo.
2. **Siguiente: compra dentro en EE. UU.** Con Rye se puede tener checkout propio para envíos
   a EE. UU. y validar si la gente compra más sin salir de la página.
3. **Después: tiendas aliadas en Latinoamérica.** Cerrar acuerdos con tiendas de regalos,
   experiencias (spas, talleres, catas) y tiendas Shopify locales; cobrar con Mercado Pago y
   pasarles los pedidos. Las experiencias son lo más fácil: un código o un bono por correo,
   sin envío físico.

## Fuentes

- [Rye: Universal Checkout API](https://rye.com/products/universal-checkout-api) y [preguntas frecuentes (envíos solo a EE. UU.)](https://docs.rye.com/faq)
- [Violet: Unified Checkout API](https://violet.io/)
- [Universal Commerce Protocol — Google Developers](https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/)
- [Agentic Commerce Protocol — Stripe](https://stripe.com/blog/developing-an-open-standard-for-agentic-commerce)
- [Programa de afiliados de Mercado Libre](https://www.mercadolibre.com.mx/l/afiliados)
