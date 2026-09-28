# Nido

Corral modular para bebés que se adapta al espacio de la casa y crece con el niño.

Los paneles de madera giran libremente alrededor de postes redondos, así que el corral
toma la forma que pida el espacio: curvas contra la pared, rincones redondeados, islas o
hexágonos. Se arma sin herramientas y cada adaptación (puerta, espejo, luz, pizarra, bordes
con forma) es un panel que se cambia por otro sacando el poste.

## Qué hay en este repositorio

| Carpeta | Contenido |
|---|---|
| [`cad/`](cad/) | Modelos paramétricos en OpenSCAD: paneles con distintos bordes y tipos (DXF para CNC), anillos de unión, tapas, caja de luz y vista de ensamble |
| [`configurador/`](configurador/) | Web para diseñar el corral de forma libre arrastrando los postes: plano, ángulos, avisos de seguridad, lista de piezas y costo |
| [`docs/`](docs/) | Concepto, lo que dicen las reseñas del mercado, requisitos de seguridad, hoja de ruta y [plan hasta la primera venta](docs/plan-lanzamiento.md) |

## Empezar

**Piezas 3D** (requiere [OpenSCAD](https://openscad.org)):

```bash
./cad/exportar.sh        # genera STL y DXF en cad/stl/
```

**Configurador** (requiere Node 20+ solo para las pruebas):

```bash
cd configurador
npm test                 # pruebas de la lógica de diseño
npm start                # abre http://localhost:5173
```

## Cómo está pensado el sistema

- **Paneles** de triplex de 18 mm en 30, 60 y 80 cm (entre ejes de poste), cortados en CNC.
  Barrotes con 50 mm de separación y 65 cm de alto.
- **Postes** de madera de Ø40 mm. El panel gira alrededor del poste a 2 mm de distancia,
  a cualquier ángulo.
- **Uniones**: 4 por panel, a alturas distintas en cada extremo para que dos paneles no
  choquen. Hay tres variantes en prueba: anillo impreso, correa de cinta y abrazadera de ferretería.
- **Anclaje a pared** con abrazaderas de tubo en los extremos de un corral abierto.

Más detalle en [`docs/concepto.md`](docs/concepto.md). Para fabricar el prototipo, ver
[`docs/fabricacion.md`](docs/fabricacion.md).
