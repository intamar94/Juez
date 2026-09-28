#!/usr/bin/env bash
# Genera todos los archivos de fabricación en cad/stl/ (STL para imprimir, DXF para CNC).
# Requiere OpenSCAD: https://openscad.org
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p stl

panel() {  # panel <modulo> <tipo> <borde>
  openscad -q -D "modulo=$1" -D "tipo=\"$2\"" -D "borde=\"$3\"" -o "stl/panel_$1_$2_$3.dxf" panel.scad
}
for m in 300 600 800; do panel "$m" barrotes recto; done
for b in olas montanas nubes; do panel 600 barrotes "$b"; done
panel 300 barrotes nubes
panel 600 macizo recto
panel 800 ventana recto

openscad -q -D 'tipo="anillo"'  -o stl/anillo.stl   anillo.scad
openscad -q -D 'tipo="relleno"' -o stl/relleno.stl  anillo.scad
for e in cupula hoja estrella; do
  openscad -q -D "estilo=\"$e\"" -o "stl/tapa_$e.stl" tapa.scad
done
openscad -q -o stl/luz_caja.stl modulo_luz.scad
echo "Listo: $(ls stl | wc -l) archivos en cad/stl/"
