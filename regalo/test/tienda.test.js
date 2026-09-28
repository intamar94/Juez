import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIAS, IDEAS, INTERESES } from '../catalogo.js';
import { enlaceCompra, ideasDe, PLAZOS, sorpresa, TIENDA, textoCompra, textoPrecio } from '../tienda.js';

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
  for (const i of ideasDe('poco-dinero')) assert.ok(i.precio[0] <= 20, i.id);
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

test('ideasDe filtra por presupuesto y ordena de barata a cara', () => {
  const r = ideasDe(null, { presupuesto: 30 });
  assert.ok(r.length > 0);
  for (const i of r) assert.ok(i.precio[0] <= 30, i.id);
  for (let k = 1; k < r.length; k++) assert.ok(r[k - 1].precio[0] <= r[k].precio[0]);
});

test('el botón lleva a comprar o a reservar según el tipo', () => {
  const termo = IDEAS.find((i) => i.id === 'botella-termo');
  assert.match(enlaceCompra(termo), /^https:\/\/www\.amazon\.es\/s\?k=termo/);
  assert.equal(textoCompra(termo), 'Comprar');
  const spa = IDEAS.find((i) => i.id === 'spa-masaje');
  assert.match(enlaceCompra(spa), /google\.com\/search/);
  assert.equal(textoCompra(spa), 'Reservar');
});

test('la etiqueta de afiliado se añade solo si está configurada', () => {
  const termo = IDEAS.find((i) => i.id === 'botella-termo');
  assert.ok(!enlaceCompra(termo).includes('tag='));
  TIENDA.etiquetaAfiliado = 'acierto-21';
  try {
    assert.ok(enlaceCompra(termo).endsWith('&tag=acierto-21'));
  } finally {
    TIENDA.etiquetaAfiliado = '';
  }
});

test('sorpresa no repite la anterior', () => {
  const a = sorpresa(null, () => 0);
  const b = sorpresa(a.id, () => 0);
  assert.notEqual(a.id, b.id);
});

test('textoPrecio', () => {
  assert.equal(textoPrecio([0, 0]), 'Gratis');
  assert.equal(textoPrecio([15, 30]), '15–30 €');
});
