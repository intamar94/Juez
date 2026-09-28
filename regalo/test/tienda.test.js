import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIAS, IDEAS, INTERESES } from '../catalogo.js';
import { AFILIADOS, bandera, MONEDAS, NOMBRE_TIENDA, PAISES, paisDelIdioma } from '../paises.js';
import {
  enlaceCompra, ideasDe, nivel, PLAZOS, precioLocal, redondear, slug, sorpresa, textoCompra, textoNivel,
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

test('cada país tiene tienda y moneda válidas', () => {
  for (const [codigo, p] of Object.entries(PAISES)) {
    assert.ok(NOMBRE_TIENDA[p.tienda], `${codigo}: tienda ${p.tienda}`);
    assert.ok(MONEDAS.includes(p.moneda), `${codigo}: moneda ${p.moneda}`);
    if (p.tienda !== 'google') assert.ok(p.dominio, `${codigo} sin dominio`);
    assert.doesNotThrow(() => new Intl.NumberFormat(`es-${codigo}`, { style: 'currency', currency: p.moneda }));
  }
});

test('el enlace de compra depende del país', () => {
  const termo = IDEAS.find((i) => i.id === 'botella-termo');
  assert.equal(enlaceCompra(termo, 'MX'), 'https://listado.mercadolibre.com.mx/termo-acero-inoxidable');
  assert.equal(textoCompra(termo, 'MX'), 'Comprar en Mercado Libre');
  assert.match(enlaceCompra(termo, 'ES'), /^https:\/\/www\.amazon\.es\/s\?k=termo/);
  assert.match(enlaceCompra(termo, 'CR'), /tbm=shop&gl=cr/);
  assert.equal(textoCompra(termo, 'CR'), 'Comprar');
  const spa = IDEAS.find((i) => i.id === 'spa-masaje');
  assert.match(decodeURIComponent(enlaceCompra(spa, 'CO')), /gl=co.*Colombia$/);
});

test('el afiliado de Amazon solo se añade si está configurado', () => {
  const termo = IDEAS.find((i) => i.id === 'botella-termo');
  assert.ok(!enlaceCompra(termo, 'US').includes('tag='));
  AFILIADOS.amazon = 'acierto-20';
  try {
    assert.ok(enlaceCompra(termo, 'US').endsWith('&tag=acierto-20'));
  } finally {
    AFILIADOS.amazon = '';
  }
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
