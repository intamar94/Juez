# Fabricación del prototipo

Prototipo del paso 1 del [plan](plan-lanzamiento.md): corral **contra una pared** con tres
paneles (60 + 80 + 60 cm), dos postes en las esquinas y los extremos anclados a la pared.

```
 pared ══════════════════════════════════════
       ▣                                  ▣      ▣ anclaje (2 por extremo)
       │ 60                            60 │      ● poste con 2 nodos de 90°
       │                                  │
       ●────────────── 80 ────────────────●
```

Genera todos los archivos con `./cad/exportar.sh`; quedan en `cad/stl/`.

## 1. Paneles: taller de corte CNC

**Qué pedir:** corte CNC con router sobre contrachapado, a partir de archivos DXF.

| | |
|---|---|
| Archivos | `panel_600.dxf` × 2, `panel_800.dxf` × 1 (medidas en milímetros, escala 1:1) |
| Material | Contrachapado (triplex) de abedul o de pino de buena calidad, **18 mm**, emisiones E1 o menores |
| Herramienta | Fresa de 6 mm; los huecos tienen esquinas con radio de 10 mm |
| Agujeros | Los de Ø6,5 mm mejor **taladrados**, no fresados |
| Cantos | Redondear con fresa de canto de 3 mm por las dos caras, incluidos los huecos |
| Acabado | Lijar a grano 180 y sellador más laca **al agua, aptos para juguetes** (o entregar crudo y lo terminas tú) |
| Tolerancia | ±0,5 mm en el ancho y en los huecos |

**Cómo encontrar un taller en Colombia:**
- Busca "corte CNC router madera" o "corte láser y CNC" más el nombre de tu ciudad. Muchos
  depósitos de madera también cortan triplex y lo venden cortado.
- Los FabLab y los laboratorios de fabricación de universidades suelen cortar para externos.
- Pide cotización a 2 o 3 talleres con esta tabla y los DXF adjuntos. Pregunta el precio del
  material, el corte, el redondeo de cantos y el acabado por separado.

## 2. Piezas impresas: servicio de impresión 3D

**Qué pedir:** impresión FDM en PETG (no PLA) de los STL.

| Archivo | Cantidad | Peso aprox. | Para qué |
|---|---|---|---|
| `nodo_90.stl` | 4 | 120 g | 2 por poste, arriba y abajo |
| `anclaje.stl` | 4 | 57 g | 2 por cada extremo contra la pared |
| `tapa_cupula.stl` | 2 | 30 g | Remate del poste |
| `tapa_hoja.stl`, `tapa_estrella.stl` | 1 de cada una | 15–40 g | Para elegir el estilo |

Total: unos 830 g de PETG y unas 38 horas de impresión.

**Parámetros que hay que pedir:**
- PETG, capa de 0,2 mm, **4 perímetros**, 30 % de relleno (gyroid o cúbico)
- Nodos y anclajes **de pie** (tal como salen del archivo), sin soportes
- Tapas **boca abajo** (la cúpula sobre la cama)
- Un color para todas las piezas; blanco, gris o madera combinan con el triplex

**Cómo encontrar un servicio:** busca "impresión 3D PETG" en tu ciudad o en Mercado Libre.
Envía la tabla y los STL y pide el precio por pieza. Pide primero **un solo nodo de prueba**
para comprobar el encaje con el poste y el panel antes de encargar el resto.

## 3. Lista de compras (ferretería y maderera)

| Artículo | Cantidad | Nota |
|---|---|---|
| Varilla redonda de madera de Ø40 mm | 2 × 67 cm | Se vende como pasamanos o barandal redondo; si no hay de 40 mm, un tornero la hace |
| Perno de coche (cabeza redonda) M6 × 40 mm | 12 | La cabeza lisa va **hacia dentro** del corral |
| Tuerca ciega (de copa) M6 | 12 | Va por fuera del corral |
| Arandela M6 | 12 | Debajo de la tuerca |
| Tornillo para madera 3,5 × 25 mm | 4 | Fija cada nodo al poste |
| Tornillo avellanado 5 × 40 mm con chazo | 8 | Fija los anclajes a la pared |
| Paño antideslizante adhesivo | 1 | Debajo de nodos y anclajes inferiores |

## 4. Armado y pruebas

1. Ensarta 2 nodos en cada poste: uno a ras del suelo y otro a 58 cm (arriba queda a 65 cm).
2. Mete los paneles en las ranuras; el canto debe tocar el poste.
3. Pasa los pernos por el nodo y el panel y aprieta con la tuerca ciega.
4. Atornilla cada nodo al poste por el agujero de 3,5 mm.
5. Presenta los anclajes contra la pared, marca, taladra y atorníllalos.
6. Pon las tapas.

**Anota en cada prueba si pasa o falla y con qué medida:**

- [ ] El panel entra en la ranura con la mano, sin forzar y sin juego visible (holgura de 0,4 mm)
- [ ] El poste entra en el nodo sin forzar y no gira después de atornillarlo
- [ ] Entre el canto del panel y el poste no cabe un dedo (hueco menor de 5 mm)
- [ ] Empujar el riel superior con ~10 kg hacia fuera: el corral no se mueve ni se deforma
- [ ] Tirar de un panel hacia arriba con fuerza: no sale
- [ ] Ningún canto, tornillo o tuerca raspa al pasar la mano por dentro
- [ ] Tiempo de armado de una persona sola: ______ minutos

Con estos resultados se ajusta `cad/nido.scad` (holgura, pared del nodo, largo del brazo)
y se imprime la versión 2.
