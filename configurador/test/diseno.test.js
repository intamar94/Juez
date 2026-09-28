import { test } from 'node:test';
import assert from 'node:assert/strict';
import { disenar, EJEMPLOS, giro, postes, rumboHacia, tiposParaEdad, tipoValido, SISTEMA } from '../diseno.js';

const HAB = { ancho: 4000, fondo: 3500 };
const P = (modulo, rumbo, tipo = 'barrotes', borde = 'recto') => ({ modulo, rumbo, tipo, borde });
const cuenta = (d, prefijo) => d.piezas.filter((p) => p.nombre.startsWith(prefijo)).reduce((s, p) => s + p.cantidad, 0);

test('giro normaliza la diferencia de rumbo', () => {
  assert.equal(giro(0, 90), 90);
  assert.equal(giro(350, 10), 20);
  assert.equal(giro(10, 350), -20);
  assert.equal(giro(0, 180), 180);
});

test('los postes siguen los rumbos de cada panel', () => {
  const pts = postes([0, 0], [P(600, 0), P(300, 90)]);
  assert.deepEqual(pts.map(([x, y]) => [Math.round(x), Math.round(y)]), [[0, 0], [600, 0], [600, 300]]);
  assert.equal(Math.round(rumboHacia([0, 0], [0, 10])), 90);
});

test('un rectángulo se cierra solo: 4 postes, sin rellenos ni anclajes', () => {
  const d = disenar({ ...EJEMPLOS.isla, habitacion: HAB });
  assert.equal(d.cerrado, true);
  assert.equal(d.nPostes, 4);
  assert.deepEqual(d.angulos.map((a) => a.angulo), [90, 90, 90, 90]);
  assert.equal(cuenta(d, 'Relleno'), 0);
  assert.equal(cuenta(d, 'Abrazadera de pared'), 0);
  assert.ok(Math.abs(d.area - 0.48) < 1e-6);
  assert.deepEqual(d.avisos, []);
});

test('el hexágono de ejemplo cierra con ángulos de 120°', () => {
  const d = disenar({ ...EJEMPLOS.hexagono, habitacion: HAB });
  assert.equal(d.cerrado, true);
  assert.ok(d.angulos.every((a) => a.angulo === 120));
});

test('la curva contra la pared: abierta, anclada y sin avisos', () => {
  const d = disenar({ ...EJEMPLOS.curva, habitacion: HAB });
  assert.equal(d.cerrado, false);
  assert.equal(d.nPostes, 9);
  assert.equal(cuenta(d, 'Relleno'), 4);
  assert.equal(cuenta(d, 'Abrazadera de pared'), 4);
  assert.deepEqual(d.avisos, []);
});

test('todos los ejemplos se pueden armar sin avisos', () => {
  for (const [id, ej] of Object.entries(EJEMPLOS)) {
    assert.deepEqual(disenar({ ...ej, habitacion: HAB }).avisos, [], id);
  }
});

test('avisa si dos paneles quedan a menos de 60°', () => {
  const d = disenar({ inicio: [500, 20], tramos: [P(600, 90), P(600, -45)], habitacion: HAB });
  assert.ok(d.angulos[0].angulo < SISTEMA.anguloMin);
  assert.ok(d.avisos.some((a) => a.includes('chocarían')));
});

test('avisa si un extremo anclado no llega a la pared', () => {
  const d = disenar({ inicio: [500, 20], tramos: [P(600, 90), P(600, 0)], anclado: true, habitacion: HAB });
  assert.ok(d.avisos.some((a) => a.includes('no llega a la pared')));
});

test('cuatro uniones por panel y pernos según el tipo de unión', () => {
  const base = { inicio: [500, 20], tramos: [P(600, 90), P(800, 0), P(600, -90)], habitacion: HAB };
  const anillo = disenar({ ...base, union: 'anillo' });
  const abrazadera = disenar({ ...base, union: 'abrazadera' });
  assert.equal(cuenta(anillo, 'Anillo impreso'), 12);
  assert.equal(cuenta(anillo, 'Perno'), 12);
  assert.equal(cuenta(abrazadera, 'Perno'), 0);
  assert.equal(cuenta(abrazadera, 'Tuerca de inserción'), 12);
});

test('las adaptaciones se cuentan y respetan su tamaño', () => {
  const d = disenar({ ...EJEMPLOS.curva, habitacion: HAB });
  assert.equal(d.adaptaciones, 2); // puerta y espejo
  assert.equal(tipoValido('puerta', 600), false);
  assert.equal(tipoValido('espejo', 300), false);
  const mal = disenar({ inicio: [500, 20], tramos: [P(300, 90, 'espejo')], habitacion: HAB });
  assert.ok(mal.avisos.some((a) => a.includes('no existe en 30 cm')));
});

test('adaptaciones recomendadas según la edad', () => {
  assert.ok(tiposParaEdad(3).includes('espejo'));
  assert.ok(!tiposParaEdad(3).includes('pizarra'));
  assert.ok(tiposParaEdad(24).includes('pizarra'));
  assert.ok(!tiposParaEdad(24).includes('espejo'));
});
