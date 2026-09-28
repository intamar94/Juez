// Anillo impreso: abraza el poste y se fija al panel con un perno M6.
// Van 4 por panel (2 por extremo). Gira libre alrededor del poste.
//
//   tipo = "anillo"    anillo con horquilla que abraza el panel (~30 g)
//   tipo = "relleno"   anillo suelto para las alturas vacías del poste en los extremos
//                      de un corral abierto (también sirve un trozo de tubo PVC de 1½")
//
// Imprimir en PETG, de pie, sin soportes, 4 perímetros y 30 % de relleno.
//   openscad -D 'tipo="anillo"' -o anillo.stl anillo.scad

include <nido.scad>

tipo = "anillo";

pared   = 3.5;
r_int   = poste_diam / 2 + holgura;
r_ext   = union_env_r - 1.5;    // + 1,5 del redondeo = union_env_r: 3 mm hasta el fondo de la muesca
ranura  = panel_grosor + 2 * holgura;
largo   = perno_eje + 10;          // hasta dónde llega la horquilla desde el eje

assert(muesca_eje - (r_ext + 1.5) < 5, "entre el anillo y la muesca deben quedar menos de 5 mm");

module horquilla() {
    translate([0, -(ranura / 2 + pared), 0])
        cube([largo, ranura + 2 * pared, union_alto]);
}

module anillo() {
    difference() {
        redondear() union() {
            cylinder(r = r_ext, h = union_alto);
            if (tipo == "anillo") horquilla();
        }
        translate([0, 0, -1]) cylinder(r = r_int, h = union_alto + 2);
        if (tipo == "anillo") {
            // ranura del panel: empieza en el fondo de la muesca
            translate([muesca_eje - 1, -ranura / 2, -1]) cube([largo, ranura, union_alto + 2]);
            // perno
            translate([perno_eje, 0, union_alto / 2]) rotate([90, 0, 0])
                cylinder(d = perno_diam, h = ranura + 2 * pared + 2, center = true);
        }
    }
}

// Redondea las aristas exteriores (r = 1,5 mm) sin cambiar el alto total.
module redondear() {
    minkowski() {
        translate([0, 0, 1.5]) scale([1, 1, (union_alto - 3) / union_alto]) children();
        sphere(r = 1.5, $fn = 16);
    }
}

anillo();
