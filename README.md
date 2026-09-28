# Nido

Corral modular para bebés que se adapta al espacio de la casa y crece con el niño.

Con unas pocas piezas estándar (paneles, postes, nodos de unión y anclajes a pared) se arma
un corral de cualquier forma: rectángulo, contra una pared, en una esquina, en L o en
hexágono. Sobre ese sistema se enganchan módulos según la edad (espejo, texturas, luces,
juegos, estantes) y, cuando el niño crece, las mismas piezas se reconfiguran como divisor
de ambientes o rincón de lectura.

## Qué hay en este repositorio

| Carpeta | Contenido |
|---|---|
| [`cad/`](cad/) | Modelos paramétricos en OpenSCAD: nodos, anclajes, tapas, enganche de módulos, módulo de luz y paneles (DXF para CNC) |
| [`configurador/`](configurador/) | Web para diseñar el corral según el espacio: plano, lista de piezas, costo y horas de impresión |
| [`regalo/`](regalo/) | **Acierto**: web para encontrar el regalo perfecto por categorías y con un test rápido |
| [`docs/`](docs/) | Concepto, lo que dicen las reseñas del mercado, requisitos de seguridad y hoja de ruta |

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

- **Paneles** de contrachapado de 18 mm en 40, 60 y 80 cm, cortados en CNC. Barrotes con
  50 mm de separación y 65 cm de alto.
- **Postes** de madera de Ø40 mm a altura completa, para que no queden huecos entre paneles.
- **Nodos impresos** (dos por poste) que fijan los paneles con pernos M6 al ángulo que haga
  falta: 90°, 120°, 135°, 180°, 270° o en T.
- **Anclajes a pared**: el corral se vuelve parte de la habitación y no se puede empujar.
- **Enganche universal** sobre el riel superior: cualquier módulo nuevo se atornilla a él.

Más detalle en [`docs/concepto.md`](docs/concepto.md).
