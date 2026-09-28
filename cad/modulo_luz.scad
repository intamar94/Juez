// Módulo de luz: caja que se atornilla por FUERA de un panel tipo "ventana".
// Desde dentro del corral solo se ve el acrílico opal de la ventana.
// Alimentación USB 5 V con el cable por fuera. Sin pilas.
//
//   openscad -o luz_caja.stl modulo_luz.scad
//
// El difusor es una lámina de acrílico opal de 3 mm (ventana + 20 mm por lado),
// cortada en láser o CNC, que queda apretada entre la caja y el panel.

include <nido.scad>

ventana = [100, 130];        // coincide con panel.scad
ala     = 20;                // cuánto sobresale la brida alrededor de la ventana
fondo   = 30;
pared   = 2.4;
radio   = 8;
acrilico = 3;

externo = [ventana[0] + 2 * ala, ventana[1] + 2 * ala];

module rect_redondeado(tam, r, h) {
    linear_extrude(h) offset(r = r) offset(delta = -r) square(tam, center = true);
}

module caja() {
    difference() {
        union() {
            rect_redondeado(externo, radio, pared);                         // brida
            rect_redondeado(ventana + [2 * pared, 2 * pared], radio, fondo); // cuerpo
        }
        // cavidad abierta hacia el panel, con asiento para el acrílico
        translate([0, 0, -1]) rect_redondeado(ventana, radio - pared, fondo - pared + 1);
        translate([0, 0, -1]) rect_redondeado(ventana + [2 * ala - 8, 2 * ala - 8], radio, acrilico + 1);
        // tornillos para madera 3,5 × 25 mm a través de la brida y el acrílico
        for (x = [-1, 1], y = [-1, 1])
            translate([x * (externo[0] / 2 - ala / 2), y * (externo[1] / 2 - ala / 2), -1])
                cylinder(d = 3.8, h = pared + 2);
        // salida del cable
        translate([0, ventana[1] / 2 - 1, fondo - pared - 6])
            rotate([-90, 0, 0]) cylinder(d = 6, h = pared + 2);
    }
}

caja();
