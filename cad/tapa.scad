// Tapa decorativa para la punta del poste: redondeada, sin cantos vivos.
// La forma se puede personalizar (estilo = "cupula" | "hoja" | "estrella").
//
//   openscad -D 'estilo="hoja"' -o tapa_hoja.stl tapa.scad

include <nido.scad>

estilo = "cupula";

encaje = 20;   // cuánto entra en el poste
pared  = 3;

module cuerpo_tapa() {
    r = poste_diam / 2 + pared;
    if (estilo == "estrella") {
        linear_extrude(12, scale = 0.6)
            offset(r = 2) offset(delta = -2)
                polygon([for (i = [0 : 9]) let (rr = i % 2 ? r * 0.8 : r)
                         [rr * cos(i * 36), rr * sin(i * 36)]]);
    } else if (estilo == "hoja") {
        scale([1, 1, 1.4]) difference() {
            sphere(r = r);
            translate([0, 0, -r]) cube(2 * r, center = true);
        }
    } else {
        difference() {
            sphere(r = r);
            translate([0, 0, -r]) cube(2 * r, center = true);
        }
    }
}

module tapa() {
    difference() {
        union() {
            translate([0, 0, encaje]) cuerpo_tapa();
            cylinder(r = poste_diam / 2 + pared, h = encaje);
        }
        translate([0, 0, -1]) cylinder(d = poste_diam + 2 * holgura, h = encaje + 1);
    }
}

tapa();
