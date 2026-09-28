// Anclaje a pared o mueble: sustituye al poste en el extremo que toca la pared.
// Se atornilla a la pared (2 tornillos + taco) y recibe el canto de un panel.
// Usar dos por extremo (abajo y arriba), igual que los nodos.
//
//   openscad -o anclaje.stl anclaje.scad

include <nido.scad>

placa_ancho  = 70;
placa_grosor = 6;
tornillo     = 5;   // tornillo de 4–5 mm con cabeza avellanada

brazo_ancho = panel_grosor + 2 * holgura + 2 * nodo_pared;

module anclaje() {
    difference() {
        union() {
            // placa contra la pared (plano XZ en y=0)
            translate([-placa_ancho / 2, 0, 0]) cube([placa_ancho, placa_grosor, nodo_alto]);
            // brazo perpendicular a la pared
            translate([-brazo_ancho / 2, 0, 0]) cube([brazo_ancho, placa_grosor + nodo_brazo, nodo_alto]);
        }
        // ranura del panel
        translate([-(panel_grosor / 2 + holgura), placa_grosor, -1])
            cube([panel_grosor + 2 * holgura, nodo_brazo + 1, nodo_alto + 2]);
        // perno del panel
        translate([0, placa_grosor + panel_lateral / 2, perno_z])
            rotate([0, 90, 0]) cylinder(d = perno_diam, h = brazo_ancho + 2, center = true);
        // tornillos avellanados a la pared
        for (x = [-1, 1] * (placa_ancho / 2 - 10))
            translate([x, -1, nodo_alto / 2]) rotate([-90, 0, 0]) {
                cylinder(d = tornillo, h = placa_grosor + 2);
                cylinder(d1 = tornillo * 2, d2 = tornillo, h = tornillo / 2 + 1);
            }
    }
}

anclaje();
