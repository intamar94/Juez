#!/usr/bin/env bash
# Genera todos los archivos de fabricación en cad/stl/ (STL para imprimir, DXF para CNC).
# Requiere OpenSCAD: https://openscad.org
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p stl

for a in 90 120 135 180 270; do
  openscad -q -D "angulos=[0,$a]" -o "stl/nodo_$a.stl" nodo.scad
done
openscad -q -D 'angulos=[0,90,180]' -o stl/nodo_T.stl nodo.scad
openscad -q -o stl/anclaje.stl anclaje.scad
for e in cupula hoja estrella; do
  openscad -q -D "estilo=\"$e\"" -o "stl/tapa_$e.stl" tapa.scad
done
openscad -q -o stl/enganche.stl enganche.scad
openscad -q -D 'parte="caja"' -o stl/luz_caja.stl modulo_luz.scad
openscad -q -D 'parte="difusor"' -o stl/luz_difusor.stl modulo_luz.scad
for w in 400 600 800; do
  openscad -q -D "ancho=$w" -o "stl/panel_$w.dxf" panel.scad
done
echo "Listo: $(ls stl | wc -l) archivos en cad/stl/"
