import { test } from 'node:test';
import assert from 'node:assert/strict';
import { disenar, llenarLado, modulosParaEdad, SISTEMA } from '../diseno.js';

test('llenarLado se acerca al largo pedido', () => {
  const r = llenarLado(1500);
  assert.ok(r.error <= 60, `error ${r.error}`);
  const total = r.paneles.reduce((a, b) => a + b, 0) + r.paneles.length * SISTEMA.posteDiam;
  assert.equal(r.largoReal, total);
});

test('llenarLado prefiere menos paneles a igual error', () => {
  // 800 + 40 = 840 exacto con un solo panel
  assert.deepEqual(llenarLado(840).paneles, [800]);
});

test('rectángulo: 4 esquinas de 90° y sin anclajes', () => {
  const d = disenar({ forma: 'rectangulo', ancho: 1600, fondo: 1200, puerta: false });
  assert.equal(d.nodos[90], 4);
  assert.equal(d.anclajes, 0);
  assert.equal(d.lados.length, 4);
  assert.ok(Math.abs(d.area - 1.92) < 1e-9);
});

test('forma L tiene una esquina entrante de 270°', () => {
  const d = disenar({ forma: 'L', ancho: 2000, fondo: 2000, puerta: false });
  assert.equal(d.nodos[270], 1);
  assert.equal(d.nodos[90], 5);
  assert.ok(Math.abs(d.area - 3) < 1e-9);
});

test('hexágono: 6 nodos de 120°', () => {
  const d = disenar({ forma: 'hexagono', ancho: 1700, fondo: 0, puerta: false });
  assert.equal(d.nodos[120], 6);
});

test('contra la pared: 3 lados, 2 esquinas y 2 anclajes', () => {
  const d = disenar({ forma: 'pared', ancho: 1800, fondo: 1200, puerta: false });
  assert.equal(d.lados.length, 3);
  assert.equal(d.nodos[90], 2);
  assert.equal(d.anclajes, 2);
  assert.ok(Math.abs(d.area - 2.16) < 1e-9);
});

test('en una esquina: 2 lados y el área incluye la esquina de la habitación', () => {
  const d = disenar({ forma: 'esquina', ancho: 1500, fondo: 1500, puerta: false });
  assert.equal(d.lados.length, 2);
  assert.equal(d.nodos[90], 1);
  assert.ok(Math.abs(d.area - 2.25) < 1e-9);
});

test('la puerta sustituye exactamente un panel', () => {
  const sin = disenar({ forma: 'rectangulo', ancho: 1600, fondo: 1200, puerta: false });
  const con = disenar({ forma: 'rectangulo', ancho: 1600, fondo: 1200, puerta: true });
  const cuenta = (d) => d.lados.reduce((s, l) => s + l.paneles.length, 0);
  const puertas = con.piezas.find((p) => p.nombre.startsWith('Panel puerta'));
  assert.equal(puertas.cantidad, 1);
  assert.ok(cuenta(con) >= cuenta(sin));
});

test('cada poste lleva 2 nodos y una tapa', () => {
  const d = disenar({ forma: 'rectangulo', ancho: 2000, fondo: 1500 });
  const nodos = d.piezas.filter((p) => p.nombre.startsWith('Nodo')).reduce((s, p) => s + p.cantidad, 0);
  const tapas = d.piezas.find((p) => p.nombre.startsWith('Tapa')).cantidad;
  assert.equal(nodos, d.postes * 2);
  assert.equal(tapas, d.postes);
  assert.ok(d.total > 0 && d.horasImpresion > 0);
});

test('módulos recomendados según la edad', () => {
  const bebe = modulosParaEdad(3).map((m) => m.id);
  const nino = modulosParaEdad(30).map((m) => m.id);
  assert.ok(bebe.includes('espejo') && !bebe.includes('estante'));
  assert.ok(nino.includes('luces-armables') && !nino.includes('espejo'));
});
