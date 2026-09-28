// Nodo: abrazadera impresa que une el poste con 1–4 paneles.
// Se usan dos por poste (abajo y arriba). Imprimir en PETG de pie, sin soportes,
// 4 perímetros y 30 % de relleno (~120 g y ~5,5 h cada uno).
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
        redondear_aristas() union() {
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

// Redondea todas las aristas exteriores (r = 1,5 mm) para que no haya cantos vivos.
// La escala en z compensa la altura que añade minkowski.
module redondear_aristas() {
    minkowski() {
        translate([0, 0, 1.5]) scale([1, 1, (nodo_alto - 3) / nodo_alto]) children();
        sphere(r = 1.5, $fn = 16);
    }
}

nodo(angulos);
