# Plan hasta la primera venta

Meta: que una familia pague por un kit Nido y lo reciba en casa, de forma legal y segura.
Duración estimada: 14–16 semanas. El camino crítico es la **certificación de seguridad**:
un producto para bebés no se puede vender sin ella, así que todo lo demás se organiza
para que, cuando llegue el certificado, la tienda y los primeros pedidos ya estén listos.

```
Semana        1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16
1 Prototipo   ████████████
2 Seguridad           ████████████████████████████████████████
3 Costos              ████████████
4 Empresa             ████████████████
5 Tienda                          ████████████
6 Pilotos                         ████████████████
7 Preventa                                ████████████████████████
8 Venta                                                   ████████████████
```

## 1. Prototipo físico (semanas 1–4)

Objetivo: un corral contra la pared armado y probado en casa.

Todo lo que hay que pedir y comprar está en [`docs/fabricacion.md`](fabricacion.md).

- [ ] Encargar **un solo nodo de 90°** de prueba y comprobar el encaje con el poste y un trozo de triplex de 18 mm
- [ ] Encargar el resto de las piezas impresas: 4 nodos de 90°, 4 anclajes y las tapas
- [ ] Cotizar y cortar 3 paneles (2 × 60 cm y 1 × 80 cm) en un taller CNC
- [ ] Comprar 2 postes de Ø40 mm × 67 cm, los pernos de coche M6 × 40 con tuerca ciega y los tornillos de pared
- [ ] Armar y medir: holgura del panel en el nodo, que el poste no gire y que no queden huecos
- [ ] Hacer las pruebas de `docs/fabricacion.md` (sección 4)
- [ ] Anotar qué falla y ajustar `cad/nido.scad` (holgura, grosor de pared, largo del brazo)

**Resultado:** fotos, lista de ajustes y segunda versión de las piezas.

## 2. Seguridad y certificación (semanas 3–12)

- [ ] Diseñar la puerta con cierre de doble acción
- [ ] Hacer los ensayos de `docs/seguridad.md` con el prototipo v2
- [ ] Pedir cotización a 2–3 laboratorios acreditados por ONAC y confirmar qué norma aplica (EN 12227, ASTM F406 o F1004)
- [ ] Enviar muestras y corregir lo que pida el laboratorio

**Resultado:** informe de ensayo aprobado.

## 3. Costos reales y precio (semanas 3–5)

- [ ] Cotizar el corte CNC, la madera, el acabado, el filamento, los herrajes, el empaque y el envío
- [ ] Poner los costos reales en `configurador/diseno.js`
- [ ] Fijar el precio: margen bruto del 50 % o más sobre el costo del kit
- [ ] Decidir quién imprime: impresora propia o granja de impresión

**Resultado:** hoja de costos y precio de lanzamiento.

## 4. Empresa y aspectos legales (semanas 3–7)

- [ ] Constituir una SAS en la Cámara de Comercio y sacar el RUT (o registrarte como persona natural comerciante)
- [ ] Habilitar la facturación electrónica ante la DIAN
- [ ] Buscar y registrar la marca "Nido" en la SIC (o elegir otro nombre si está tomada)
- [ ] Contratar un seguro de responsabilidad civil por producto
- [ ] Redactar términos de venta, garantía, devoluciones e instrucciones de uso con advertencias

**Resultado:** ya se puede facturar y vender legalmente.

## 5. Tienda en línea (semanas 5–8)

- [ ] Convertir el configurador en tienda: diseño, carrito y pago
- [ ] Conectar una pasarela de pago colombiana (Wompi, Mercado Pago o ePayco)
- [ ] Página de inicio con fotos reales del prototipo y lista de espera
- [ ] Publicar en un dominio propio

**Resultado:** tienda funcionando en modo preventa.

## 6. Familias piloto (semanas 5–9)

- [ ] Prestar 3–5 kits (no venderlos antes de certificar) con un acuerdo de prueba firmado
- [ ] Recoger opiniones sobre armado, estabilidad y estética, además de fotos y testimonios
- [ ] Ajustar el diseño y las instrucciones

**Resultado:** testimonios reales y un diseño validado en casas de verdad.

## 7. Preventa (semanas 7–12)

- [ ] Abrir la lista de espera: redes sociales, grupos de padres, tiendas de bebé y decoración
- [ ] Contenido: armado en video, antes y después de la habitación, módulos por edad
- [ ] Preventa con anticipo y entrega prometida después de la certificación

**Resultado:** primeros pedidos pagados.

## 8. Fabricación, entrega y primera venta (semanas 11–16)

- [ ] Producir el primer lote (5–10 kits)
- [ ] Empaque, manual de armado ilustrado y etiqueta de advertencias
- [ ] Enviar, llamar a los 7 días y pedir una reseña

**Resultado:** primera venta completa, con una familia satisfecha que la recomienda.
