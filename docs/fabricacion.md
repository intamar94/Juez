# Fabricación del prototipo

Prototipo del paso 1 del [plan](plan-lanzamiento.md): una **curva contra la pared** con
5 paneles y 6 postes, que sirve también para comparar los **tres tipos de unión**.

```
 pared ════════════════════════════════════════════════
        ▣                                          ▣     ▣ poste de extremo con abrazadera de pared
        │ 1 (60, olas)                 5 (60, olas)│     ● poste
        ●                                          ●     A anillo impreso
     A   ╲ 2 (30, nubes)          4 (30, nubes)  ╱  A    C correa de cinta
          ●────────── 3 (80, espejo) ──────────●         F abrazadera de ferretería
          C                                    F
```

- Postes 1, 2, 5 y 6: **anillos impresos**
- Poste 3 (entre los paneles 2 y 3): **correas**
- Poste 4 (entre los paneles 3 y 4): **abrazaderas de ferretería**

Genera todos los archivos con `./cad/exportar.sh`; quedan en `cad/stl/`.

## 1. Paneles: taller de corte CNC

**Qué pedir:** corte CNC con router sobre triplex, a partir de archivos DXF.

| Archivo | Cantidad |
|---|---|
| `panel_600_barrotes_olas.dxf` | 2 |
| `panel_300_barrotes_nubes.dxf` | 2 |
| `panel_800_ventana_recto.dxf` | 1 |

Caben en **una lámina** de 1,22 × 2,44 m (todos miden 65 cm de alto).

| | |
|---|---|
| Material | Triplex (contrachapado) de abedul o de pino de buena calidad, **18 mm**, emisiones E1 o menores |
| Herramienta | Fresa de 6 mm; las esquinas interiores tienen radio de 3,2 mm o más |
| Agujeros | Los de Ø6,5 mm, mejor **taladrados** que fresados |
| Cantos | Redondear con fresa de canto de 3 mm por las dos caras, incluidos huecos y muescas |
| Acabado | Lijar a grano 180, sellador y laca **al agua, aptos para juguetes** (o entregar crudo) |
| Tolerancia | ±0,5 mm |

**Cómo encontrar un taller en Colombia:**
- Busca "corte CNC router madera" o "corte láser y CNC" y tu ciudad. Muchos depósitos de
  madera cortan triplex y lo venden ya cortado.
- Los FabLab y laboratorios de fabricación de universidades suelen cortar para externos.
- Pide cotización a 2 o 3 talleres con esta tabla y los DXF. Pregunta el precio del
  material, el corte, el redondeo de cantos y el acabado por separado.

## 2. Piezas impresas: servicio de impresión 3D

| Archivo | Cantidad | Peso aprox. |
|---|---|---|
| `anillo.stl` | 12 | 30 g |
| `tapa_cupula.stl` (o `tapa_hoja` / `tapa_estrella`) | 6 | 30 g |

Total: unos 550 g de PETG y unas 27 horas de impresión.

- PETG (no PLA), capa de 0,2 mm, **4 perímetros**, 30 % de relleno
- Anillos **de pie**, tal como salen del archivo, sin soportes. Tapas **boca abajo**
- Pide primero **un solo anillo de prueba** y comprueba que gira suave en el poste y que el
  panel entra en la horquilla antes de encargar el resto

Busca "impresión 3D PETG" en tu ciudad o en Mercado Libre y pide el precio por pieza.

## 3. Lista de compras (ferretería y maderera)

| Artículo | Cantidad | Para qué |
|---|---|---|
| Varilla redonda de madera de Ø40 mm | 6 × 67 cm | Postes (se vende como pasamanos o barandal redondo; si no, un tornero la hace) |
| Perno de coche M6 × 40 mm + tuerca ciega + arandela | 16 | Anillos (12) y correas (4). Cabeza lisa **hacia dentro** del corral |
| Abrazadera de pared para tubo de 40 mm | 4 | Postes de los extremos contra la pared (2 por poste) |
| Tubo PVC de 1½" | 4 trozos de 3 cm | Rellenos para las alturas vacías de los postes de extremo |
| Cinta de poliéster o nailon de 25 mm | 1,5 m | Correas (4 trozos de unos 30 cm; quemar las puntas) |
| Arandela ancha M6 | 4 | Para que el perno no rasgue la correa |
| Abrazadera de tubo de 40 mm con caucho y espárrago M8 | 4 | Uniones de ferretería |
| Tuerca de inserción M8 para madera | 4 | Donde se enrosca el espárrago, en el canto del panel |
| Acrílico espejo de 3 mm, 14 × 17 cm | 1 | Ventana del panel 3 (se atornilla por fuera) |
| Tornillo para madera 3,5 × 16 mm | 4 | Fija el espejo |
| Paño antideslizante adhesivo | 1 | Debajo de los postes |

## 4. Montaje

Los paneles tienen un extremo **A** (izquierdo, agujeros más bajos) y un extremo **B**
(derecho). En cada poste se juntan el B de un panel y el A del siguiente: así sus uniones
quedan a distinta altura y no chocan.

**Anillo impreso:** mete la horquilla en la muesca del panel, pasa el perno y aprieta.
Luego ensarta el poste de arriba abajo por los cuatro anillos de ese poste.

**Correa:** rodea el poste con la cinta, junta las dos puntas a cada lado del panel y
atraviesa cinta, panel y cinta con el perno y la arandela ancha. Tensa antes de apretar.

**Abrazadera de ferretería:** taladra un agujero de 10 mm y 25 mm de fondo en el centro
del canto del panel, a la altura de la unión (fondo de la muesca). Enrosca la tuerca de
inserción, luego el espárrago de la abrazadera, y cierra la abrazadera alrededor del poste.

**Extremos contra la pared:** pon los dos rellenos de PVC en las alturas vacías del poste
y fíjalo a la pared con dos abrazaderas de pared.

Por último, coloca las tapas.

## 5. Pruebas

Anota en cada una si pasa o falla y con qué medida:

- [ ] Cada panel gira suave alrededor del poste y se queda en el ángulo que lo dejas
- [ ] Entre el canto del panel y el poste, y alrededor de las uniones, no cabe un dedo (hueco menor de 5 mm)
- [ ] Empujar el borde superior con ~10 kg hacia fuera: el corral no se desplaza ni se deforma
- [ ] Tirar de un panel hacia arriba con fuerza: no se suelta
- [ ] Ningún canto, tornillo o tuerca raspa al pasar la mano por dentro
- [ ] Cambiar un panel por otro (sacar poste, cambiar, volver a meter): ______ minutos
- [ ] Armar todo una persona sola: ______ minutos

**Comparación de uniones** (puntúa de 1 a 5):

| | Anillo impreso | Correa | Abrazadera |
|---|---|---|---|
| Rigidez | | | |
| Facilidad de montaje | | | |
| Aspecto | | | |
| Costo por unión | | | |

Con estos resultados eliges la unión definitiva y se ajusta `cad/nido.scad`.
