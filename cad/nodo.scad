// Nodo: abrazadera impresa que une el poste con 1–4 paneles.
// Se usan dos por poste (abajo y arriba). Imprimir en PETG, 4 perímetros, 30 % relleno.
//
//   angulos = [0, 90]        esquina de rectángulo
//   angulos = [0, 120]       esquina de hexágono
//   angulos = [0, 180]       continuación en línea recta
//   angulos = [0, 90, 180]   unión en T (para dividir espacios)
//   angulos = [0, 270]       esquina entrante (forma en L)
//
//   openscad -D 'angulos=[0,120]' -o nodo_120.stl nodo.scad

include <nido.scad>

angulos = [0, 90];

nodo_radio_ext = poste_diam / 2 + nodo_pared;
brazo_ancho    = panel_grosor + 2 * holgura + 2 * nodo_pared;

module brazo() {
    // cuerpo del brazo: arranca en el centro del poste
    translate([0, -brazo_ancho / 2, 0])
        cube([poste_diam / 2 + nodo_brazo, brazo_ancho, nodo_alto]);
}

module ranura_brazo() {
    // ranura donde entra el panel: su canto toca el poste (sin hueco para dedos)
    translate([poste_diam / 2 - 1, -(panel_grosor / 2 + holgura), -1])
        cube([nodo_brazo + 2, panel_grosor + 2 * holgura, nodo_alto + 2]);
    // perno pasante a mitad del montante del panel
    translate([poste_diam / 2 + panel_lateral / 2, 0, perno_z])
        rotate([90, 0, 0]) cylinder(d = perno_diam, h = brazo_ancho + 2, center = true);
}

module nodo(angs) {
    difference() {
        hull_redondeado() union() {
            cylinder(r = nodo_radio_ext, h = nodo_alto);
            for (a = angs) rotate([0, 0, a]) brazo();
        }
        // poste pasante
        translate([0, 0, -1]) cylinder(d = poste_diam + 2 * holgura, h = nodo_alto + 2);
        for (a = angs) rotate([0, 0, a]) ranura_brazo();
        // tornillo de fijación al poste (entre los dos primeros brazos)
        rotate([0, 0, (angs[0] + angs[1]) / 2 + 180])
            translate([0, 0, nodo_alto / 2]) rotate([0, 90, 0])
                cylinder(d = 3.5, h = nodo_radio_ext + 1);
    }
}

// Suaviza aristas verticales para que no haya cantos vivos.
module hull_redondeado() {
    minkowski() {
        translate([0, 0, 1.5]) resize_z() children();
        sphere(r = 1.5, $fn = 16);
    }
}
module resize_z() {
    // compensa la altura que añade minkowski
    scale([1, 1, (nodo_alto - 3) / nodo_alto]) children();
}

nodo(angulos);
