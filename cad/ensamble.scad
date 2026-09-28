// Vista de dos paneles unidos en un poste a un ángulo cualquiera.
// Solo para revisar el diseño; no se fabrica.
//   openscad -D angulo=135 ensamble.scad

include <nido.scad>
use <panel.scad>
use <anillo.scad>

angulo = 140;   // ángulo interior entre los dos paneles

module panel3d(m) {
    color("burlywood") rotate([90, 0, 0]) translate([0, 0, -panel_grosor / 2])
        linear_extrude(panel_grosor) panel_2d(m);
}

// poste
color("saddlebrown") cylinder(d = poste_diam, h = poste_alto);
// panel izquierdo: su extremo B llega al poste
translate([-(borde_eje + panel_ancho(600)), 0, 0]) panel3d(600);
for (z = bandas_B) rotate([0, 0, 180]) translate([0, 0, z]) color("white") anillo();
// panel derecho: su extremo A sale del poste
rotate([0, 0, 180 - angulo]) {
    translate([borde_eje, 0, 0]) panel3d(600);
    for (z = bandas_A) translate([0, 0, z]) color("white") anillo();
}
