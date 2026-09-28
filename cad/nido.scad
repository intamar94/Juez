// Nido — parámetros compartidos del sistema modular.
// Todas las medidas en milímetros. Cambia aquí y se actualizan todas las piezas.
//
// Referencias de seguridad (ver docs/seguridad.md):
//   EN 12227  → separación entre barrotes 45–65 mm, altura interior ≥ 600 mm
//   ASTM F406 → separación máxima 60 mm (2 3/8")
//   Huecos de 7–12 mm atrapan dedos: evitarlos en cualquier pieza accesible.

$fn = 64;

// --- Panel (madera contrachapada cortada con CNC) ---
panel_grosor    = 18;   // contrachapado de abedul 18 mm
panel_alto      = 650;
panel_anchos    = [400, 600, 800];
panel_hueco     = 50;   // separación entre barrotes (cumple EN 12227 y ASTM F406)
panel_barra_min = 35;   // barrote mínimo; el real se reparte según el ancho
panel_barra_obj = 40;   // barrote objetivo
panel_lateral   = 45;   // montante del borde (aquí va el perno de unión)
panel_riel_inf  = 80;
panel_riel_sup  = 90;
panel_radio     = 10;   // esquinas redondeadas de los huecos

// --- Poste (varilla de madera comprada, altura completa) ---
poste_diam = 40;
poste_alto = panel_alto + 10;

// --- Nodo / abrazadera impresa (2 por poste: arriba y abajo) ---
holgura      = 0.4;   // tolerancia de impresión FDM
nodo_alto    = 70;    // debe ser < riel inferior para no tapar los huecos
nodo_pared   = 5;
nodo_brazo   = 50;    // cuánto abraza el brazo al panel
perno_diam   = 6.5;   // perno M6 con tuerca ciega
perno_z      = nodo_alto / 2;

// --- Enganche universal de módulos (cuelga del riel superior) ---
enganche_ancho = 60;
enganche_prof  = 40;   // cuánto baja por cada cara del riel

assert(panel_hueco >= 45 && panel_hueco <= 60,
       "panel_hueco fuera del rango seguro (45–60 mm)");
assert(nodo_alto < panel_riel_inf && nodo_alto < panel_riel_sup,
       "la abrazadera taparía los huecos del panel");

// Número de huecos y ancho real de barrote para un panel de ancho w.
function panel_n_huecos(w) =
    round((w - 2 * panel_lateral + panel_barra_obj) / (panel_hueco + panel_barra_obj));
function panel_barra(w) =
    let (n = panel_n_huecos(w))
    (w - 2 * panel_lateral - n * panel_hueco) / (n - 1);
