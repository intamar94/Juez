// Módulo de luz: caja que se atornilla al enganche universal.
// Alimentación USB 5 V por cable que sale hacia FUERA del corral.
// Sin pilas: nada de pilas de botón al alcance del niño.
//
//   openscad -D 'parte="caja"'    -o luz_caja.stl    modulo_luz.scad
//   openscad -D 'parte="difusor"' -o luz_difusor.stl modulo_luz.scad   (PETG natural, 1 mm)

include <nido.scad>

parte = "caja";

caja     = [100, 30, 130];   // ancho (y), fondo (x), alto (z)
pared    = 2.4;
radio    = 6;
patron   = [40, 20];         // debe coincidir con enganche.scad
difusor_grosor = 1.0;

module redondeado(tam, r) {
    hull() for (y = [r, tam[0] - r], z = [r, tam[2] - r])
        translate([0, y, z]) rotate([0, 90, 0]) cylinder(r = r, h = tam[1]);
}

module caja() {
    difference() {
        redondeado(caja, radio);
        // cavidad abierta hacia el interior del corral (x positivo)
        translate([pared, pared, pared])
            redondeado([caja[0] - 2 * pared, caja[1], caja[2] - 2 * pared], radio - pared);
        // tornillos al enganche (arriba, alineados con sus insertos)
        for (dy = [-1, 1], dz = [0, 1])
            translate([-1, caja[0] / 2 + dy * patron[0] / 2, caja[2] - 12 - dz * patron[1]])
                rotate([0, 90, 0]) cylinder(d = 3.4, h = pared + 2);
        // salida del cable USB por la parte superior trasera
        translate([pared + 3, caja[0] / 2 - 3, caja[2] - pared - 1]) cube([5, 6, pared + 2]);
    }
    // postes para atornillar el difusor (tornillos M2.5 autorroscantes)
    for (y = [12, caja[0] - 12], z = [12, caja[2] - 12])
        translate([pared, y, z]) rotate([0, 90, 0]) difference() {
            cylinder(d = 7, h = caja[1] - pared - difusor_grosor);
            cylinder(d = 2.2, h = caja[1]);
        }
}

module difusor() {
    difference() {
        redondeado([caja[0], difusor_grosor, caja[2]], radio);
        for (y = [12, caja[0] - 12], z = [12, caja[2] - 12])
            translate([-1, y, z]) rotate([0, 90, 0]) cylinder(d = 2.8, h = 3);
    }
}

if (parte == "caja") caja();
else difusor();
