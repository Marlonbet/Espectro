// Tests del visual generativo: determinismo y parámetros.
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSpectrum, visualParams, primaryDimOf } from '../src/visual.js';
import { scoreAnswers } from '../src/content.js';

const DIMS = { d1: 72, d2: 41, d3: 63, d4: 80, d5: 35 };

test('determinista: mismos inputs → mismo SVG', () => {
  const a = renderSpectrum(DIMS, 'umbral-abc123', 3);
  const b = renderSpectrum(DIMS, 'umbral-abc123', 3);
  assert.equal(a, b);
});

test('distinto código → distinto SVG', () => {
  const a = renderSpectrum(DIMS, 'umbral-abc123', 0);
  const b = renderSpectrum(DIMS, 'umbral-xyz789', 0);
  assert.notEqual(a, b);
});

test('anillos de eco: uno por eco, tope en 10', () => {
  const count = (svg) => (svg.match(/stroke-dasharray="3 7"/g) || []).length;
  assert.equal(count(renderSpectrum(DIMS, 'c1', 0)), 0);
  assert.equal(count(renderSpectrum(DIMS, 'c1', 4)), 4);
  assert.equal(count(renderSpectrum(DIMS, 'c1', 25)), 10);
  assert.ok(renderSpectrum(DIMS, 'c1', 25).includes('+15 ecos'));
});

test('SVG válido y con pulso', () => {
  const svg = renderSpectrum(DIMS, 'c1', 2);
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.trimEnd().endsWith('</svg>'));
  assert.ok(svg.includes('espectro-pulse'));
});

test('visualParams en rangos esperados', () => {
  const p = visualParams(DIMS, 5);
  assert.ok(['#5b9dff', '#a678ff', '#ff6b81', '#f2b544', '#3ddc97'].includes(p.color));
  assert.ok(p.capas >= 2 && p.capas <= 5);
  assert.ok(p.particulas >= 0 && p.particulas <= 48);
  assert.ok(p.simetria >= 0 && p.simetria <= 1);
  assert.equal(p.anillos, 5);
  assert.equal(p.anillosExtra, 0);
});

test('dimensión primaria: la más extrema manda el color', () => {
  assert.equal(primaryDimOf({ d1: 90, d2: 50, d3: 50, d4: 50, d5: 50 }), 'd1');
  assert.equal(primaryDimOf({ d1: 50, d2: 50, d3: 10, d4: 50, d5: 50 }), 'd3');
});

test('integración: scoring real → visual estable', () => {
  const dims = scoreAnswers([0, 1, 2, 3, 0, 1, 2, 3]);
  const svg = renderSpectrum(dims, 'faro-q7w2e9', 1);
  assert.ok(svg.includes('<svg'));
});
