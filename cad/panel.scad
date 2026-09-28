// Panel para cortar en CNC (triplex de 18 mm).
//
//   modulo = 300 | 600 | 800     distancia entre ejes de poste
//   tipo   = "barrotes"          panel normal con huecos verticales
//            "macizo"            sin huecos (pizarra, texturas)
//            "ventana"           con ventana central para espejo, acrílico de color o luz
//   borde  = "recto" | "olas" | "montanas" | "nubes"   forma del borde superior
//   union  = "perno" | "abrazadera"   con "perno" lleva los agujeros para anillo impreso o correa
//
// Exportar a DXF:  openscad -D modulo=600 -D 'borde="olas"' -o panel.dxf panel.scad
// Vista 3D:        openscad -D en_3d=true panel.scad

include <nido.scad>

modulo = 600;
tipo   = "barrotes";
borde  = "recto";
union  = "perno";
en_3d  = false;

ventana = [100, 130];   // ancho × alto de la ventana (coincide con modulo_luz.scad)
ventana_z = 300;        // altura del centro de la ventana

// Altura del borde superior en x (0..w).
function alto_borde(x, w) =
    let (a = (panel_alto - panel_bajo) / 2, medio = panel_bajo + a, t = x / w)
    borde == "olas"     ? medio + a * cos(360 * t * max(1, round(w / 300))) :
    // picos en triángulo
    borde == "montanas" ? let (n = max(1, round(w / 400)), k = t * n - floor(t * n))
                          panel_bajo + (panel_alto - panel_bajo) * (1 - abs(2 * k - 1)) :
    // semicírculos seguidos
    borde == "nubes"    ? let (n = max(2, round(w / 150)), k = t * n - floor(t * n))
                          panel_bajo + (panel_alto - panel_bajo) * sqrt(max(0, 1 - pow(2 * k - 1, 2))) :
    panel_alto;

module contorno(w) {
    pasos = 60;
    arriba = [for (i = [pasos : -1 : 0]) let (x = w * i / pasos) [x, alto_borde(x, w)]];
    d = muesca_eje - borde_eje;   // profundidad de la muesca
    m0 = muescas[0];
    m1 = muescas[1];
    derecho = [[w, 0], [w, m0[0]], [w - d, m0[0]], [w - d, m0[1]], [w, m0[1]],
               [w, m1[0]], [w - d, m1[0]], [w - d, m1[1]], [w, m1[1]]];
    izquierdo = [[0, m1[1]], [d, m1[1]], [d, m1[0]], [0, m1[0]],
                 [0, m0[1]], [d, m0[1]], [d, m0[0]], [0, m0[0]], [0, 0]];
    // redondea esquinas convexas (r 3) y cóncavas (r 3,2: fresa de 6 mm)
    offset(r = 3) offset(delta = -3) offset(r = -3.2) offset(delta = 3.2)
        polygon(concat(derecho, arriba, izquierdo));
}

module hueco(w, h, r) {
    offset(r = r) offset(delta = -r) square([w, h]);
}

module panel_2d(m) {
    w = panel_ancho(m);
    difference() {
        contorno(w);

        if (tipo == "barrotes") {
            n = panel_n_huecos(w);
            b = panel_barra(w);
            assert(n >= 2 && b >= panel_barra_min, str("panel demasiado angosto: ", w, " mm"));
            for (i = [0 : n - 1])
                translate([panel_lateral + i * (panel_hueco + b), riel_inf])
                    hueco(panel_hueco, hueco_tope - riel_inf, 10);
        }
        if (tipo == "ventana") {
            assert(w >= ventana[0] + 2 * panel_lateral, "panel demasiado angosto para ventana");
            translate([w / 2 - ventana[0] / 2, ventana_z - ventana[1] / 2])
                hueco(ventana[0], ventana[1], 12);
        }

        // un perno por unión: extremo izquierdo = A, extremo derecho = B
        if (union == "perno") {
            x = perno_eje - borde_eje;
            for (z = bandas_A) translate([x, z + union_alto / 2]) circle(d = perno_diam);
            for (z = bandas_B) translate([w - x, z + union_alto / 2]) circle(d = perno_diam);
        }
    }
}

if (en_3d) linear_extrude(panel_grosor) panel_2d(modulo);
else panel_2d(modulo);
