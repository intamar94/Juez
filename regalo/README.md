# Acierto

Web para encontrar el regalo perfecto en dos clics: eliges una categoría, eliges un regalo y el
botón te lleva a la tienda con la búsqueda hecha. Sin registro y sin preguntas.

Las categorías se organizan por situación y con nombre propio: **Misión imposible** (lo tiene
todo), **Salvavidas de último minuto**, **Caprichos que nunca se compraría**, **Menos cosas, más
planes**, **Lagrimita garantizada**, **Fan nivel experto**, **Quedar bien gastando poco**,
**Entre todos**, **Amigo secreto** y **Modo niños**. Cada una tiene su enlace
(`#c/lo-tiene-todo`) para compartirla, y el botón **🎲 Sorpréndeme** da una idea al azar.

Los textos están en español neutro y los precios se muestran por nivel ($ económico,
$$ intermedio, $$$ especial) en lugar de en una moneda, para que la web sirva en cualquier país.

```bash
npm test     # pruebas del catálogo y de los enlaces de compra
npm start    # abre http://localhost:5174
```

Es HTML y JavaScript sin dependencias ni compilación: se publica tal cual en cualquier hosting
estático (Vercel, Netlify, GitHub Pages).

| Archivo | Qué hace |
|---|---|
| `catalogo.js` | Categorías y las ideas, cada una con su «por qué acierta», precio y plazo |
| `tienda.js` | Niveles de precio y a dónde lleva cada botón (Google Shopping para productos, búsqueda para planes) |
| `app.js` / `index.html` | Portada de categorías, vista de cada categoría y «Sorpréndeme» |

Para vender a través de una tienda concreta o con código de afiliado, cambia `TIENDA.productos` en
`tienda.js`.

## Qué existe ya

| Tipo | Ejemplos | Problema |
|---|---|---|
| Tiendas con catálogo por categorías | Curiosite, Regalador, Amiregalo, Wanapix | Solo enseñan lo que venden; categorías por «para él / para ella» |
| Test o chat con IA | GiftList Genie, GiftX, Pickify, MyMap | Muchos dan ideas genéricas; los mejores enlazan a productos reales y listas compartibles |
| Guías de regalos en medios | Revistas, blogs, influencers | Repiten los mismos productos y viven de comisiones de afiliado; no se sabe qué está probado |

## Qué necesita la gente de verdad

De los estudios de psicología del regalo y de lo que se repite en foros:

1. **Lo pedido gana.** Quien recibe valora más lo que pidió y lo considera igual de pensado;
   quien regala lo subestima (Gino y Flynn).
2. **Uso a largo plazo, no el «¡oh!» al abrirlo.** Quien regala piensa en el momento del
   intercambio; quien recibe, en la utilidad (Galak, Givi y Williams). → Cada idea explica su uso.
3. **Versátil antes que hiperpersonalizado.** Los regalos muy personalizados se usan menos de
   lo que el que regala cree. → Categoría «La versión buena» de lo que ya usa.
4. **Quien «lo tiene todo» no quiere más cosas.** En foros se repite: comida buena, cosas que
   se gastan, experiencias y «la versión mejor» de lo cotidiano. → «Misión imposible» no
   incluye objetos.
5. **La prisa manda.** Buena parte de las búsquedas son de última hora. →
   «Salvavidas de último minuto» solo tiene ideas que se consiguen hoy, y cada tarjeta dice el plazo.
6. **Llegar tarde perjudica menos de lo que se cree** (Haltman, 2025).
7. **Desconfianza hacia lo patrocinado.** → Cada idea explica por qué acierta en vez de empujar
   un producto concreto.
8. **Fricción.** Los tests largos cansan: aquí no hay preguntas, solo categorías y un botón de
   compra.

## Siguientes pasos

- Enlazar productos concretos por idea (curados a mano o con una API de tienda) manteniendo
  la etiqueta de patrocinado visible si se monetiza.
- Enlaces directos a tiendas de experiencias (cajas regalo, entradas) en lugar de la búsqueda.
- Traer ideas de la comunidad con votos de «lo regalé y acerté».

## Fuentes

- [Giver–receiver asymmetries in gift preferences](https://www.researchgate.net/publication/7840993_Giver-receiver_asymmetries_in_gift_preferences)
- [Why Certain Gifts Are Great to Give but Not to Get — Galak, Givi y Williams](https://journals.sagepub.com/doi/full/10.1177/0963721416656937)
- [Want to give a good gift? Think past the “big reveal” — ScienceDaily](https://www.sciencedaily.com/releases/2016/12/161206142647.htm)
- [Gifting errors — Carnegie Mellon University](https://www.cmu.edu/piper/news/archives/2016/december/gifting-errors.html)
- [Gift givers overestimate the harm of late gifts — Haltman, 2025](https://myscp.onlinelibrary.wiley.com/doi/10.1002/jcpy.1446)
- [How Psychology Can Help You Choose a Great Gift — Greater Good](https://greatergood.berkeley.edu/article/item/how_psychology_can_help_you_choose_a_great_gift)
- [Best Free Gift Finder Tools 2026 — GiftList](https://giftlist.com/blog/best-free-gift-finder-tools-compared-2025-giftlist-genie-vs-4-alternatives)
- [Best AI Gift Finders 2026 — GiftX](https://giftx.tech/blog/best-ai-gift-finders-2026)
- [How the Internet Broke Gift Guides — Amy Odell](https://amyodell.substack.com/p/how-the-internet-broke-gift-guides)
- [Curiosite](https://www.curiosite.es/), [Regalador](https://regalador.com/es/regalos/originales/), [Amiregalo](https://www.amiregalo.es/regalos-originales.html)
- [Best gifts for people who have everything — Tom's Guide](https://tomsguide.com/tech/best-gifts-for-people-who-have-everything)
