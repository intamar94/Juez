# Seguridad

Es lo que más puede frenar el proyecto: se diseña desde el principio para cumplir la
norma y se certifica con un laboratorio antes de vender.

## Normas

Qué norma aplica depende de cómo clasifique el laboratorio el producto. Un corral de
paneles **sin piso** puede considerarse corral o **recinto expandible**, así que hay que
preguntarlo al cotizar.

- **EN 12227** (Europa): corrales para uso doméstico.
- **ASTM F406** (EE. UU.): corrales y cunas no de tamaño completo.
- **ASTM F1004** (EE. UU.): puertas de seguridad y recintos expandibles. Es la que suele
  aplicarse a los corrales de paneles sin piso.
- **EN 71 / ASTM F963 / NTC-ISO 8124**: seguridad de juguetes. Aplica a los módulos de juego.

### Colombia (primer mercado)

- El Estatuto del Consumidor (Ley 1480 de 2011) hace responsable al productor de la
  seguridad del producto. La Superintendencia de Industria y Comercio (SIC) vigila su
  cumplimiento.
- Por confirmar con un abogado o con la SIC:
  - si hay un reglamento técnico obligatorio para corrales o para juguetes (los módulos);
  - qué certificado de conformidad exigen para vender.
- Hacer los ensayos en un **laboratorio acreditado por ONAC** con la norma de referencia
  que indiquen (EN o ASTM). Así el mismo informe sirve para exportar después.

## Requisitos que ya fija el diseño

| Requisito | Valor en Nido | Dónde |
|---|---|---|
| Separación entre barrotes: 45–65 mm (EN), ≤ 60 mm (ASTM) | 50 mm | `panel_hueco` en `cad/nido.scad`, con `assert` |
| Altura del corral | 615–650 mm según la forma del borde | `panel_alto`, `panel_bajo` |
| Sin huecos para dedos entre panel y poste (el panel gira) | 2 mm, igual a cualquier ángulo porque el poste es redondo | `borde_eje`, con `assert` |
| Sin huecos para dedos alrededor de las uniones | 3 mm entre la unión y la muesca; 3 mm entre uniones | `muesca_eje`, `union_sep`, con `assert` |
| Las uniones de dos paneles no chocan | Alturas distintas en los extremos A y B; ángulo mínimo de 60° | `bandas_A`, `bandas_B`; el configurador avisa |
| Sin cantos vivos | Cantos del triplex redondeados, anillos redondeados, tapas en cúpula | `docs/fabricacion.md`, `cad/anillo.scad` |
| Estabilidad | Corral cerrado, o abierto con los extremos anclados a la pared | El configurador avisa |

### Riesgos que hay que medir con el prototipo

- **Un corral de bisagras libres puede deformarse** si el niño empuja fuerte. Hay que medir
  cuánto se mueve. Si es demasiado, se añade un tornillo de traba en la unión que fije el
  ángulo una vez elegido.
- **Correa:** la cinta puede estirarse o cortarse. Hay que probar que aguanta tirones y
  mordiscos, y que el perno no la rasga.
- **Abrazadera de ferretería:** comprobar que el espárrago no se afloja con el uso.

## Adaptaciones (paneles especiales) y electrónica

- Nada de piezas que quepan en el cilindro de piezas pequeñas (Ø31,7 mm).
- Espejo, acrílicos y luz se montan **por fuera** del panel, tras una ventana. Desde dentro
  no hay tornillos ni bordes.
- Espejo de **acrílico**, nunca de vidrio.
- **Sin pilas de botón.** La luz va por USB 5 V con el cable por fuera del corral.
- **Ninguna adaptación puede servir de escalón** para trepar y salirse. Hay que probarlo con
  cada una (estantes y barras, sobre todo).

## Tornillería

- Pernos de coche con la cabeza redonda **hacia dentro** del corral y la tuerca ciega por fuera.
- Tornillos de adaptaciones y anclajes, siempre del lado de fuera.

## Materiales

- Impresión en PETG (no PLA: es frágil y se deforma con el calor). Buscar filamento con
  certificación para juguetes o contacto con alimentos.
- Contrachapado de abedul con emisiones E1 o menores y acabado al agua apto para juguetes.

## Por hacer antes de vender

- [ ] Ensayos internos con el prototipo ([`docs/fabricacion.md`](fabricacion.md), sección 5).
- [ ] Diseñar la puerta con cierre de doble acción.
- [ ] Cotizar la certificación con 2 o 3 laboratorios y confirmar qué norma aplica.
- [ ] Confirmar los requisitos legales para vender en Colombia (SIC).
