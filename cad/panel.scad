// Panel calado para cortar en CNC (contrachapado de 18 mm).
// Exportar a DXF:  openscad -D ancho=600 -o panel_600.dxf panel.scad
// Vista 3D:        openscad -D ancho=600 -D en_3d=true panel.scad

include <nido.scad>

ancho = 600;
en_3d = false;

module hueco_redondeado(w, h, r) {
    offset(r = r) offset(delta = -r) square([w, h]);
}

module panel_2d(w) {
    n = panel_n_huecos(w);
    b = panel_barra(w);
    assert(b >= panel_barra_min, str("barrote demasiado delgado: ", b, " mm"));

    difference() {
        hueco_redondeado(w, panel_alto, 6);

        // huecos verticales entre barrotes
        for (i = [0 : n - 1])
            translate([panel_lateral + i * (panel_hueco + b), panel_riel_inf])
                hueco_redondeado(panel_hueco,
                                 panel_alto - panel_riel_inf - panel_riel_sup,
                                 panel_radio);

        // agujeros de perno en los montantes, a la altura de cada abrazadera
        for (x = [panel_lateral / 2, w - panel_lateral / 2])
            for (z = [perno_z, panel_alto - perno_z])
                translate([x, z]) circle(d = perno_diam);
    }
}

if (en_3d) linear_extrude(panel_grosor) panel_2d(ancho);
else panel_2d(ancho);
