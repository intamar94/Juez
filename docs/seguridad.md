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
| Separación entre barrotes: 45–65 mm (EN), ≤ 60 mm (ASTM) | 50 mm | `cad/nido.scad` (`panel_hueco`, con `assert`) |
| Altura del corral | 650 mm | `panel_alto` |
| Sin huecos entre paneles | El canto del panel toca el poste dentro del nodo | `cad/nodo.scad` |
| Sin huecos de 7–12 mm accesibles (dedos) | Agujeros de perno ocupados por pernos M6 con tuerca ciega | `cad/panel.scad` |
| Sin cantos vivos | Nodos redondeados, tapas en cúpula | `cad/nodo.scad`, `cad/tapa.scad` |
| La abrazadera no tapa los huecos | `nodo_alto` menor que los rieles | `assert` en `cad/nido.scad` |
| Estabilidad | Anclaje a pared en formas abiertas | `cad/anclaje.scad` |

## Módulos y electrónica

- Nada de piezas que quepan en el cilindro de piezas pequeñas (Ø31,7 mm).
- **Sin pilas de botón.** Los módulos de luz van por USB 5 V con el cable hacia fuera del corral.
- Tornillos solo por el lado de fuera o dentro de cajas cerradas con tornillo.
- Módulos fijados con herramienta: el niño no los puede soltar.
- **Ningún módulo puede servir de escalón.** Todo lo que se monte por dentro (barra,
  estante, caja de luz) se revisa como posible apoyo para trepar y salirse del corral.
  Hay que probarlo con cada módulo.

## Tornillería

- Pernos de coche con la cabeza redonda **hacia dentro** del corral y la tuerca ciega por fuera.
- Los tornillos que fijan nodos y módulos quedan del lado de fuera.

## Materiales

- Impresión en PETG (no PLA: es frágil y se deforma con el calor). Buscar filamento con
  certificación para juguetes o contacto con alimentos.
- Contrachapado de abedul con emisiones E1 o menores y acabado al agua apto para juguetes.

## Por hacer antes de vender

- [ ] Ensayos internos con el prototipo ([`docs/fabricacion.md`](fabricacion.md), sección 4).
- [ ] Diseñar la puerta con cierre de doble acción.
- [ ] Cotizar la certificación con 2 o 3 laboratorios y confirmar qué norma aplica.
- [ ] Confirmar los requisitos legales para vender en Colombia (SIC).
