// Muestra, país por país, dónde lleva el botón de compra y si cobras comisión.
//   npm run comisiones
import { IDEAS } from '../catalogo.js';
import { NOMBRE_TIENDA, PAISES } from '../paises.js';
import { dondeComprar } from '../tienda.js';

const productos = IDEAS.filter((i) => i.tipo !== 'experiencia' && i.tipo !== 'tiempo');
let conComision = 0;

for (const [codigo, pais] of Object.entries(PAISES)) {
  const destinos = productos.map((i) => dondeComprar(i, codigo));
  const cobran = destinos.filter((d) => d.comision).length;
  const tiendas = [...new Set(destinos.map((d) => NOMBRE_TIENDA[d.tienda]))].join(' + ');
  if (cobran) conComision++;
  const marca = cobran === productos.length ? '✅' : cobran ? '🟡' : '⚪';
  console.log(`${marca} ${pais.nombre.padEnd(22)} ${String(cobran).padStart(2)}/${productos.length} ideas con comisión · ${tiendas}`);
}

console.log(`\n${conComision} de ${Object.keys(PAISES).length} países con alguna comisión. Rellena afiliados.js para sumar más.`);
