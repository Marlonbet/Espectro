// Tests del sistema psicológico: invariantes fuertes, sin red.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SITUATIONS, ARCHETYPES, REACTIONS,
  scoreAnswers, selectArchetype, buildNarrative, makeCodigo, shuffledOptions,
} from '../src/content.js';

test('8 situaciones con 4 opciones y pesos válidos', () => {
  assert.equal(SITUATIONS.length, 8);
  const dims = ['d1', 'd2', 'd3', 'd4', 'd5'];
  for (const s of SITUATIONS) {
    assert.equal(s.opciones.length, 4, s.titulo);
    assert.ok(s.escena.length > 20 && s.escena.length <= 400);
    for (const o of s.opciones) {
      for (const k of Object.keys(o.pesos)) {
        assert.ok(dims.includes(k), 'dimensión válida');
        assert.ok(Math.abs(o.pesos[k]) <= 2, 'peso en rango');
      }
      assert.ok(o.texto.length > 5);
    }
  }
});

test('scoreAnswers: las 65536 combinaciones dan dims enteros en [0,100]', () => {
  // 4^8 = 65536: fuerza bruta completa, corre en ms.
  const answers = [0, 0, 0, 0, 0, 0, 0, 0];
  let n = 0;
  const seen = new Set();
  while (true) {
    const dims = scoreAnswers(answers);
    for (const d of ['d1', 'd2', 'd3', 'd4', 'd5']) {
      assert.ok(Number.isInteger(dims[d]), `entero ${d}`);
      assert.ok(dims[d] >= 0 && dims[d] <= 100, `rango ${d}=${dims[d]}`);
    }
    seen.add(JSON.stringify(dims));
    n++;
    let i = 0;
    while (i < 8 && ++answers[i] > 3) { answers[i] = 0; i++; }
    if (i === 8) break;
  }
  assert.equal(n, 65536);
  assert.ok(seen.size > 100, 'suficiente variedad de resultados');
});

test('scoreAnswers rechaza entradas inválidas', () => {
  assert.throws(() => scoreAnswers([0, 1, 2]));
  assert.throws(() => scoreAnswers([0, 0, 0, 0, 0, 0, 0, 9]));
});

test('normalización: fórmula verificada a mano en un caso', () => {
  // Respuestas [1,0,0,0,0,0,0,0] → d1: S1B(+2) S4A(+2) S5A(+1) S6A(+1) S8A(-2) = 4.
  // maxPossible[d1] = 2+1+2+2+1+2+1+2 = 13 → 50 + (4/13)*50 = 65.38 → 65
  const dims = scoreAnswers([1, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(dims.d1, 65);
});

test('selectArchetype: equilibrio total → El Umbral', () => {
  const arch = selectArchetype({ d1: 50, d2: 52, d3: 48, d4: 51, d5: 49 });
  assert.equal(arch.id, 'el-umbral');
});

test('selectArchetype: devuelve un arquetipo válido y es determinista', () => {
  const dims = scoreAnswers([0, 1, 2, 3, 0, 1, 2, 3]);
  const a1 = selectArchetype(dims);
  const a2 = selectArchetype(dims);
  assert.ok(ARCHETYPES.includes(a1));
  assert.equal(a1.id, a2.id);
});

test('buildNarrative: 3 bloques + huella personalizada', () => {
  const dims = scoreAnswers([3, 3, 3, 3, 3, 3, 3, 3]);
  const arch = selectArchetype(dims);
  const n0 = buildNarrative(dims, arch, null);
  assert.ok(n0.bloque1.length > 60 && n0.bloque2.length > 40);
  assert.ok(n0.bloque3.includes('recién nacido'));
  assert.ok(n0.huella.includes(arch.nombre));
  assert.ok(n0.huella.includes('espectro'));
  const n1 = buildNarrative(dims, arch, { total: 7, counts: { espejo: 5 }, dominante: 'espejo', texts: [] });
  assert.ok(n1.bloque3.includes('7 ecos'));
  assert.ok(!n1.bloque3.includes('recién nacido'));
});

test('makeCodigo: formato y unicidad', () => {
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const c = makeCodigo('umbral');
    assert.match(c, /^umbral-[a-z2-9]{6}$/);
    seen.add(c);
  }
  assert.equal(seen.size, 200);
});

test('shuffledOptions: permutación determinista por semilla', () => {
  const a = shuffledOptions(0, 12345);
  const b = shuffledOptions(0, 12345);
  const c = shuffledOptions(0, 99999);
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort((x, y) => x - y), [0, 1, 2, 3]);
  assert.notDeepEqual(a, c);
});

test('REACTIONS: 4 reacciones + texto libre documentado', () => {
  assert.equal(REACTIONS.length, 4);
  for (const r of REACTIONS) assert.ok(r.id && r.emoji && r.texto && r.eco);
});
