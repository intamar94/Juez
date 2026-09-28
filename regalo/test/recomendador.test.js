import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIAS, IDEAS, INTERESES } from '../catalogo.js';
import { codificarLista, decodificarLista, PLAZOS, recomendar, textoPrecio } from '../recomendador.js';

test('el catálogo es coherente', () => {
  const ids = new Set();
  const cats = new Set(CATEGORIAS.map((c) => c.id));
  for (const idea of IDEAS) {
    assert.ok(!ids.has(idea.id), `id repetido ${idea.id}`);
    ids.add(idea.id);
    assert.ok(idea.porque.length > 20, `${idea.id} sin explicación`);
    assert.ok(idea.precio[0] <= idea.precio[1], `${idea.id} precio invertido`);
    assert.ok(PLAZOS[idea.plazo], `${idea.id} plazo ${idea.plazo}`);
    assert.ok(idea.categorias.length > 0, `${idea.id} sin categoría`);
    for (const c of idea.categorias) assert.ok(cats.has(c), `${idea.id}: categoría ${c}`);
    for (const i of idea.intereses) assert.ok(INTERESES[i], `${idea.id}: interés ${i}`);
  }
});

test('cada categoría tiene al menos cuatro ideas', () => {
  for (const c of CATEGORIAS) {
    const n = IDEAS.filter((i) => i.categorias.includes(c.id)).length;
    assert.ok(n >= 4, `${c.id} tiene ${n}`);
  }
});

test('"Menos de 20 €" solo contiene ideas que caben en 20 €', () => {
  for (const r of recomendar({ categoria: 'poco-dinero' })) {
    assert.ok(r.idea.precio[0] <= 20, r.idea.id);
  }
});

test('"Para ya mismo" solo contiene ideas para hoy', () => {
  for (const idea of IDEAS.filter((i) => i.categorias.includes('ultima-hora'))) {
    assert.equal(idea.plazo, 'hoy', idea.id);
  }
});

test('"Lo tiene todo" no propone objetos', () => {
  for (const idea of IDEAS.filter((i) => i.categorias.includes('lo-tiene-todo'))) {
    assert.notEqual(idea.tipo, 'objeto', idea.id);
  }
});

test('el presupuesto descarta lo que no cabe', () => {
  const r = recomendar({ presupuesto: 10 });
  assert.ok(r.length > 0);
  for (const { idea } of r) assert.ok(idea.precio[0] <= 10, idea.id);
});

test('con prisa solo salen ideas que llegan', () => {
  for (const { idea } of recomendar({ plazo: 'hoy' })) assert.equal(idea.plazo, 'hoy');
  const dias = recomendar({ plazo: 'dias' }).map((r) => r.idea.plazo);
  assert.ok(!dias.includes('semana'));
});

test('sin más cosas descarta objetos', () => {
  for (const { idea } of recomendar({ sinCosas: true })) assert.notEqual(idea.tipo, 'objeto');
});

test('los intereses mandan en el orden', () => {
  const [primera] = recomendar({ intereses: ['cafe'] });
  assert.ok(primera.idea.intereses.includes('cafe'));
  assert.match(primera.motivos[0], /café/);
});

test('las ideas de niños solo salen para niños, y al revés', () => {
  const nino = recomendar({ edad: 'nino' });
  assert.ok(nino.some((r) => r.idea.id === 'construccion'));
  assert.ok(!nino.some((r) => r.idea.id === 'cata-vinos'));
  assert.ok(!recomendar({ edad: 'adulto' }).some((r) => r.idea.id === 'construccion'));
});

test('en el trabajo no se propone nada íntimo', () => {
  const r = recomendar({ relacion: 'trabajo' });
  assert.ok(r.length > 0);
  for (const { idea } of r) {
    assert.ok(!idea.categorias.includes('con-historia'), idea.id);
    assert.ok(!idea.relaciones || idea.relaciones.includes('trabajo'), idea.id);
  }
  assert.ok(r[0].idea.categorias.includes('compromiso'));
});

test('textoPrecio', () => {
  assert.equal(textoPrecio([0, 0]), 'Gratis');
  assert.equal(textoPrecio([15, 30]), '15–30 €');
});

test('la lista compartida ignora ids desconocidos y repetidos', () => {
  const texto = codificarLista(['vinilo', 'escapada']);
  assert.deepEqual(decodificarLista(texto), ['vinilo', 'escapada']);
  assert.deepEqual(decodificarLista('vinilo.nada.vinilo'), ['vinilo']);
  assert.deepEqual(decodificarLista(''), []);
});
