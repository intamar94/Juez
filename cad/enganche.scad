// Enganche universal: la interfaz común de TODOS los módulos (luces, juegos, espejo...).
// Cuelga sobre el riel superior de cualquier panel y se fija con un tornillo
// que solo un adulto puede soltar. Un módulo nuevo solo tiene que atornillarse
// a la placa frontal (patrón de 4 tornillos M3 de 40 × 20 mm).

include <nido.scad>

patron_m3  = [40, 20];   // separación horizontal × vertical
enganche_pared = 4;

module enganche() {
    g = panel_grosor + 2 * holgura;
    t = enganche_pared;
    difference() {
        // U invertida sobre el riel
        translate([-(g / 2 + t), 0, -enganche_prof])
            cube([g + 2 * t, enganche_ancho, enganche_prof + t]);
        translate([-g / 2, -1, -enganche_prof - 1])
            cube([g, enganche_ancho + 2, enganche_prof + 1]);
        // tornillo de sujeción por el lado exterior del corral (x negativo = fuera)
        translate([-(g / 2 + t + 1), enganche_ancho / 2, -enganche_prof / 2])
            rotate([0, 90, 0]) cylinder(d = 3.4, h = t + 2);
        // patrón M3 en la cara interior: agujeros para insertos térmicos M3
        // (el módulo se atornilla desde dentro de su caja, así el niño no ve tornillos)
        for (dy = [-1, 1], dz = [0, 1])
            translate([g / 2 - 1, enganche_ancho / 2 + dy * patron_m3[0] / 2,
                       -enganche_prof + 8 + dz * patron_m3[1]])
                rotate([0, 90, 0]) cylinder(d = 4.0, h = t + 2);
    }
}

enganche();
