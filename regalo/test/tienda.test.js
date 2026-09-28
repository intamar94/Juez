import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIAS, IDEAS, INTERESES } from '../catalogo.js';
import { enlaceCompra, ideasDe, nivel, PLAZOS, sorpresa, textoCompra, textoNivel } from '../tienda.js';

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

test('el botón lleva a comprar o a reservar según el tipo', () => {
  const termo = IDEAS.find((i) => i.id === 'botella-termo');
  assert.match(enlaceCompra(termo), /tbm=shop&q=termo/);
  assert.equal(textoCompra(termo), 'Comprar');
  const spa = IDEAS.find((i) => i.id === 'spa-masaje');
  assert.ok(!enlaceCompra(spa).includes('tbm=shop'));
  assert.equal(textoCompra(spa), 'Reservar');
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
