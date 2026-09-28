// Nido — parámetros compartidos del sistema de bisagra libre.
// Todas las medidas en milímetros. Cambia aquí y se actualizan todas las piezas.
//
// Idea: cada panel gira libremente alrededor de un poste redondo, así el corral
// toma cualquier ángulo y se adapta al lugar. Cada extremo del panel lleva dos
// uniones (abajo y arriba) que abrazan el poste. Los extremos izquierdo (A) y
// derecho (B) usan alturas distintas para que dos paneles no choquen en el poste.
//
//        vista de frente, extremo de un panel junto al poste
//
//        │█│   ┌──────────   ← panel
//        │█│ ══╡ B alto      ← unión del panel vecino (su extremo B)
//        │█│ ══╡ A alto      ← unión de este panel (extremo A)
//        │█│   │             ← muesca: el panel se retira para dejar sitio a las
//        │█│   │               uniones; fuera de ella queda a 2 mm del poste
//        │█│ ══╡ B bajo
//        │█│ ══╡ A bajo
//        │█│   └──────────
//       poste
//
// Seguridad (ver docs/seguridad.md):
//   separación entre barrotes 45–60 mm; huecos accesibles < 5 mm.

$fn = 64;

// --- Panel (triplex cortado en CNC) ---
panel_grosor = 18;
panel_alto   = 650;          // punto más alto del borde superior
panel_bajo   = 615;          // punto más bajo del borde superior cuando tiene forma
modulos      = [300, 600, 800];   // distancia entre ejes de poste
holgura      = 0.4;          // tolerancia de impresión y de ajuste

// Barrotes
panel_hueco     = 50;
panel_lateral   = 35;        // montante junto a cada extremo
panel_barra_min = 35;
riel_inf        = 120;       // los huecos empiezan aquí...
hueco_tope      = 520;       // ...y terminan aquí, por debajo de las uniones altas

// --- Poste (varilla redonda de madera) ---
poste_diam  = 40;
tapa_encaje = 20;
poste_alto  = panel_alto + tapa_encaje;

// --- Unión panel–poste ---
borde_eje   = 22;            // del eje del poste al canto del panel (2 mm de hueco)
union_alto  = 30;            // alto de cada unión (anillo, correa o abrazadera)
union_sep   = 3;             // separación vertical entre uniones
union_env_r = 26;            // radio máximo que puede ocupar una unión
muesca_eje  = union_env_r + 3;  // del eje al fondo de la muesca
perno_eje   = 45;            // del eje del poste al perno que fija la unión
perno_diam  = 6.5;           // perno M6

// Altura de la base de cada unión, medida desde el suelo.
z_A_bajo = 40;
z_B_bajo = z_A_bajo + union_alto + union_sep;
z_A_alto = 540;
z_B_alto = z_A_alto + union_alto + union_sep;
bandas_A = [z_A_bajo, z_A_alto];
bandas_B = [z_B_bajo, z_B_alto];

// Muescas: cubren las dos uniones de cada par, con union_sep de margen.
muescas = [[z_A_bajo - union_sep, z_B_bajo + union_alto + union_sep],
           [z_A_alto - union_sep, z_B_alto + union_alto + union_sep]];

function panel_ancho(m) = m - 2 * borde_eje;

// Número de huecos y ancho real de barrote para un panel de ancho físico w.
function panel_n_huecos(w) =
    floor((w - 2 * panel_lateral + panel_barra_min) / (panel_hueco + panel_barra_min));
function panel_barra(w) =
    let (n = panel_n_huecos(w))
    n > 1 ? (w - 2 * panel_lateral - n * panel_hueco) / (n - 1) : 0;

assert(panel_hueco >= 45 && panel_hueco <= 60,
       "panel_hueco fuera del rango seguro (45–60 mm)");
assert(borde_eje - poste_diam / 2 < 5,
       "el hueco entre poste y panel debe ser menor de 5 mm");
assert(muesca_eje - union_env_r < 5 && union_sep < 5,
       "los huecos alrededor de las uniones deben ser menores de 5 mm");
assert(hueco_tope < muescas[1][0] && riel_inf > muescas[0][1],
       "los huecos de los barrotes no pueden cruzar las muescas");
assert(muescas[1][1] < panel_bajo, "las uniones altas deben quedar dentro del panel");
