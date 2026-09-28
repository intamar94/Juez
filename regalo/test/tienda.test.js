import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIAS, IDEAS, INTERESES } from '../catalogo.js';
import { AMAZON, MERCADOLIBRE } from '../afiliados.js';
import { bandera, MONEDAS, NOMBRE_TIENDA, PAISES, paisDelIdioma } from '../paises.js';
import {
  dondeComprar, enlaceCompra, hayAfiliados, ideasDe, nivel, PLAZOS, precioLocal, redondear, slug, sorpresa, textoCompra, textoNivel,
} from '../tienda.js';

test('el catálogo es coherente', () => {
  const ids = new Set();
  const cats = new Set(CATEGORIAS.map((c) => c.id));
  for (const idea of IDEAS) {
    assert.ok(!ids.has(idea.id), `id repetido ${idea.id}`);
    ids.add(idea.id);
    assert.ok(idea.porque.length > 20, `${idea.id} sin explicación`);
    assert.ok(idea.precio[0] <= idea.precio[1], `${idea.id} precio invertido`);
    assert.ok(PLAZOS[idea.plazo], `${idea.id} plazo ${idea.plazo}`);
    assert.ok(idea.busqueda, `${idea.id} sin búsqueda`);
    assert.ok(idea.categorias.length > 0, `${idea.id} sin categoría`);
    for (const c of idea.categorias) assert.ok(cats.has(c), `${idea.id}: categoría ${c}`);
    for (const i of idea.intereses) assert.ok(INTERESES[i], `${idea.id}: interés ${i}`);
  }
});

test('cada categoría tiene al menos cuatro ideas', () => {
  for (const c of CATEGORIAS) {
    const n = ideasDe(c.id).length;
    assert.ok(n >= 4, `${c.id} tiene ${n}`);
  }
});

test('las categorías cumplen lo que prometen', () => {
  for (const i of ideasDe('poco-dinero')) assert.equal(nivel(i), 'bajo', i.id);
  for (const i of ideasDe('ultima-hora')) assert.equal(i.plazo, 'hoy', i.id);
  for (const i of ideasDe('lo-tiene-todo')) assert.notEqual(i.tipo, 'objeto', i.id);
  for (const i of ideasDe('peques')) assert.ok(i.edades?.includes('nino'), i.id);
  for (const i of ideasDe('compromiso')) assert.ok(!i.categorias.includes('con-historia'), i.id);
});

test('lo de niños solo aparece en categorías aptas', () => {
  for (const i of IDEAS.filter((i) => i.edades?.length === 1 && i.edades[0] === 'nino')) {
    assert.ok(i.categorias.includes('peques'), i.id);
    assert.ok(!i.categorias.includes('su-obsesion') && !i.categorias.includes('experiencias'), i.id);
  }
});

test('ideasDe filtra por nivel y ordena de barata a cara', () => {
  const r = ideasDe(null, { nivel: 'medio' });
  assert.ok(r.length > 0);
  for (const i of r) assert.equal(nivel(i), 'medio', i.id);
  for (let k = 1; k < r.length; k++) assert.ok(r[k - 1].precio[0] <= r[k].precio[0]);
});

test('cada categoría con filtro tiene algo en cada nivel o casi', () => {
  for (const c of ['lo-tiene-todo', 'experiencias', 'su-obsesion']) {
    for (const n of ['bajo', 'medio']) assert.ok(ideasDe(c, { nivel: n }).length > 0, `${c} ${n}`);
  }
});

test('los planes se reservan y lo hecho a mano se explica', () => {
  assert.equal(textoCompra(IDEAS.find((i) => i.id === 'spa-masaje')), 'Reservar');
  assert.equal(textoCompra(IDEAS.find((i) => i.id === 'cupones-tiempo')), 'Ver cómo');
});

test('los textos no usan moneda ni expresiones de un solo país', () => {
  const textos = JSON.stringify([CATEGORIAS, IDEAS]);
  assert.ok(!/€|\beuros?\b/i.test(textos), 'moneda');
  // Límites con \p{L}: \b no reconoce la ñ ni las tildes como letras.
  const local = /(?<!\p{L})(vosotros|vuestr\p{L}*|os|juntáis|móvil|coche|friki|bote|cuñad\p{L}*|zapatillas|trastos|mola)(?!\p{L})/iu;
  assert.ok(!local.test(textos), textos.match(local)?.[0]);
});

test('textoNivel', () => {
  assert.equal(textoNivel({ precio: [0, 0] }), 'Gratis');
  assert.equal(textoNivel({ precio: [15, 30] }), '$ · Económico');
  assert.equal(textoNivel({ precio: [40, 120] }), '$$ · Intermedio');
  assert.equal(textoNivel({ precio: [90, 300] }), '$$$ · Especial');
});

test('sorpresa no repite la anterior', () => {
  const a = sorpresa(null, () => 0);
  const b = sorpresa(a.id, () => 0);
  assert.notEqual(a.id, b.id);
});

test('cada país tiene tiendas y moneda válidas', () => {
  for (const [codigo, p] of Object.entries(PAISES)) {
    assert.ok(p.tiendas.length > 0, `${codigo} sin tiendas`);
    for (const t of p.tiendas) {
      assert.ok(NOMBRE_TIENDA[t.tienda], `${codigo}: tienda ${t.tienda}`);
      if (t.tienda !== 'google') assert.ok(t.dominio, `${codigo} sin dominio`);
      if (t.tienda === 'amazon') assert.ok(t.dominio in AMAZON, `${codigo}: amazon.${t.dominio} sin hueco en afiliados.js`);
    }
    assert.ok(MONEDAS.includes(p.moneda), `${codigo}: moneda ${p.moneda}`);
    assert.doesNotThrow(() => new Intl.NumberFormat(`es-${codigo}`, { style: 'currency', currency: p.moneda }));
  }
});

const termo = IDEAS.find((i) => i.id === 'botella-termo');

/** Rellena afiliados.js durante una prueba y lo deja como estaba. */
function conAfiliados(amazon, ml, fn) {
  const antes = { amazon: { ...AMAZON }, ml: structuredClone(MERCADOLIBRE) };
  Object.assign(AMAZON, amazon);
  for (const [pais, enlaces] of Object.entries(ml)) MERCADOLIBRE[pais] = { ...MERCADOLIBRE[pais], ...enlaces };
  try {
    fn();
  } finally {
    Object.assign(AMAZON, antes.amazon);
    for (const pais of Object.keys(MERCADOLIBRE)) MERCADOLIBRE[pais] = antes.ml[pais];
  }
}

test('sin afiliados, el botón va a la primera tienda del país sin comisión', () => {
  assert.deepEqual(dondeComprar(termo, 'MX'),
    { tienda: 'mercadolibre', url: 'https://listado.mercadolibre.com.mx/termo-acero-inoxidable', comision: false });
  assert.equal(textoCompra(termo, 'MX'), 'Comprar en Mercado Libre');
  assert.match(enlaceCompra(termo, 'ES'), /^https:\/\/www\.amazon\.es\/s\?k=termo/);
  assert.match(enlaceCompra(termo, 'CR'), /tbm=shop&gl=cr/);
  assert.equal(textoCompra(termo, 'CR'), 'Comprar');
  assert.ok(!enlaceCompra(termo, 'US').includes('tag='));
  assert.ok(!hayAfiliados());
});

test('con etiqueta de Amazon, cobran también los países que no tienen otra cuenta', () => {
  conAfiliados({ com: 'acierto-20' }, {}, () => {
    assert.ok(enlaceCompra(termo, 'US').endsWith('&tag=acierto-20'));
    const cr = dondeComprar(termo, 'CR');
    assert.equal(cr.tienda, 'amazon');
    assert.ok(cr.comision);
    assert.equal(textoCompra(termo, 'CR'), 'Comprar en Amazon');
    // España usa su propio Amazon: la etiqueta de amazon.com no vale allí.
    assert.equal(dondeComprar(termo, 'ES').comision, false);
    // México prueba Mercado Libre y amazon.com.mx antes de caer en amazon.com.
    assert.match(enlaceCompra(termo, 'MX'), /amazon\.com\/s\?.*language=es_US&tag=acierto-20$/);
    assert.ok(hayAfiliados());
  });
});

test('Mercado Libre con enlace de afiliado gana a Amazon, idea por idea', () => {
  const enlace = 'https://mercadolibre.com/sec/abc123';
  conAfiliados({ 'com.mx': 'acierto-mx-20' }, { MX: { 'botella-termo': enlace } }, () => {
    assert.equal(enlaceCompra(termo, 'MX'), enlace);
    const toalla = IDEAS.find((i) => i.id === 'toalla-grande');
    assert.match(enlaceCompra(toalla, 'MX'), /amazon\.com\.mx.*tag=acierto-mx-20/);
  });
});

test('los planes se reservan en el país, no en una tienda', () => {
  const spa = IDEAS.find((i) => i.id === 'spa-masaje');
  assert.match(decodeURIComponent(enlaceCompra(spa, 'CO')), /gl=co.*Colombia$/);
});

test('slug quita tildes y espacios', () => {
  assert.equal(slug('Kit limpieza ¡Sneakers! de España'), 'kit-limpieza-sneakers-de-espana');
});

test('precio local: convierte, redondea y cae a null sin tasa', () => {
  const termo = IDEAS.find((i) => i.id === 'botella-termo'); // 20–45 de referencia
  assert.equal(redondear(14873), 15000);
  assert.equal(redondear(37), 37);
  const ars = precioLocal(termo, 'ARS', { ARS: 1234 }, 'AR');
  assert.match(ars, /25\.000/);
  assert.match(ars, /56\.000/);
  assert.match(precioLocal(termo, 'USD', null, 'US'), /20.*45/);
  assert.equal(precioLocal(termo, 'EUR', {}, 'ES'), null);
  assert.equal(precioLocal({ precio: [0, 0] }, 'MXN', null, 'MX'), 'Gratis');
});

test('el país se adivina por el idioma del navegador', () => {
  assert.equal(paisDelIdioma(['es-AR', 'es']), 'AR');
  assert.equal(paisDelIdioma(['en', 'es-419']), 'US');
  assert.equal(bandera('MX'), '🇲🇽');
});
