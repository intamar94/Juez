# Seguridad

Es lo que más puede frenar el proyecto: se diseña desde el principio para cumplir la
norma y se certifica con un laboratorio antes de vender.

## Normas

- **EN 12227** (Europa): corrales para uso doméstico.
- **ASTM F406** (EE. UU.): corrales y cunas no de tamaño completo; exigida por la CPSC.
- **EN 71 / ASTM F963**: seguridad de juguetes, aplica a los módulos de juego.
- En Latinoamérica, revisar la regulación local de cada país; la mayoría remite a normas
  EN o ASTM.

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

## Materiales

- Impresión en PETG (no PLA: es frágil y se deforma con el calor). Buscar filamento con
  certificación para juguetes o contacto con alimentos.
- Contrachapado de abedul con emisiones E1 o menores y acabado al agua apto para juguetes.

## Por hacer antes de vender

- [ ] Ensayos internos: estabilidad, carga sobre el riel superior, fuerza de extracción del nodo.
- [ ] Diseñar la puerta con cierre de doble acción.
- [ ] Cotizar certificación EN 12227 / ASTM F406 con un laboratorio.
