// Tests de la capa de ecos: eventos, agregación y referencias. Sin red.
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSecretKey, getPublicKey } from 'nostr-tools';
import {
  KIND_SPECTRUM, KIND_ECHO,
  buildSpectrumEvent, parseSpectrumEvent,
  buildEchoEvent, parseEchoEvent,
  aggregateEchoes, encodeSpectrumRef, decodeSpectrumRef,
  spectrumAddr,
} from '../src/ecos.js';

const skOwner = generateSecretKey();
const ownerPubkey = getPublicKey(skOwner);
const CODIGO = 'umbral-abc123';

function fakeSigned(template, pubkey, id) {
  return { ...template, pubkey, id: id || 'e'.repeat(64), sig: 's'.repeat(128), created_at: 1700000000 };
}

const SPECTRUM_DATA = {
  codigo: CODIGO,
  arquetipo: { id: 'el-umbral', nombre: 'El Umbral', epiteto: 'Habita lo no resuelto.', slug: 'umbral' },
  dims: { d1: 60, d2: 55, d3: 70, d4: 75, d5: 45 },
  narrativa: { bloque1: 'b1', bloque2: 'b2', bloque3: 'b3', huella: 'Soy El Umbral' },
  respuestas: [0, 1, 2, 3, 0, 1, 2, 3],
};

test('espectro: build → parse roundtrip', () => {
  const t = buildSpectrumEvent(SPECTRUM_DATA);
  assert.equal(t.kind, KIND_SPECTRUM);
  assert.deepEqual(t.tags[0], ['d', `espectro:${CODIGO}`]);
  const ev = fakeSigned(t, ownerPubkey);
  const p = parseSpectrumEvent(ev);
  assert.ok(p);
  assert.equal(p.codigo, CODIGO);
  assert.equal(p.ownerPubkey, ownerPubkey);
  assert.equal(p.nombre, 'El Umbral');
  assert.deepEqual(p.dims, SPECTRUM_DATA.dims);
});

test('espectro: rechaza eventos que no son espectros', () => {
  assert.equal(parseSpectrumEvent(fakeSigned({ kind: 1, tags: [], content: '{}' }, ownerPubkey)), null);
  assert.equal(parseSpectrumEvent(fakeSigned(
    { kind: KIND_SPECTRUM, tags: [['d', 'otra-cosa']], content: '{}' }, ownerPubkey)), null);
  assert.equal(parseSpectrumEvent(fakeSigned(
    { kind: KIND_SPECTRUM, tags: [['d', `espectro:${CODIGO}`]], content: 'no-json' }, ownerPubkey)), null);
});

test('eco: build → parse roundtrip', () => {
  const t = buildEchoEvent({ ownerPubkey, codigo: CODIGO, reaccion: 'espejo', texto: 'me llegó' });
  assert.equal(t.kind, KIND_ECHO);
  assert.deepEqual(t.tags[0], ['a', spectrumAddr(ownerPubkey, CODIGO)]);
  const ev = fakeSigned(t, 'f'.repeat(64), 'a'.repeat(64));
  const p = parseEchoEvent(ev, ownerPubkey, CODIGO);
  assert.ok(p);
  assert.equal(p.reaccion, 'espejo');
  assert.equal(p.texto, 'me llegó');
});

test('eco: rechaza dirección ajena y texto bloqueado', () => {
  const t = buildEchoEvent({ ownerPubkey, codigo: 'otro-xxxxxx', reaccion: 'calma', texto: '' });
  const ev = fakeSigned(t, 'f'.repeat(64));
  assert.equal(parseEchoEvent(ev, ownerPubkey, CODIGO), null);

  const t2 = buildEchoEvent({ ownerPubkey, codigo: CODIGO, reaccion: 'texto', texto: 'eres un imbécil' });
  const ev2 = fakeSigned(t2, 'f'.repeat(64));
  assert.equal(parseEchoEvent(ev2, ownerPubkey, CODIGO), null);
});

test('eco: texto se recorta a 140 caracteres', () => {
  const t = buildEchoEvent({ ownerPubkey, codigo: CODIGO, reaccion: 'texto', texto: 'x'.repeat(500) });
  const body = JSON.parse(t.content);
  assert.equal(body.texto.length, 140);
});

test('aggregateEchoes: 1 por pubkey (el más reciente), sin duplicados', () => {
  const agg = aggregateEchoes([
    { reaccion: 'espejo', texto: '', pubkey: 'a', created_at: 100, id: '1' },
    { reaccion: 'calma', texto: 'hola', pubkey: 'a', created_at: 200, id: '2' },
    { reaccion: 'espejo', texto: '', pubkey: 'b', created_at: 150, id: '3' },
    { reaccion: 'espejo', texto: '', pubkey: 'b', created_at: 150, id: '3' },
  ]);
  assert.equal(agg.total, 2);
  assert.equal(agg.counts.calma, 1);
  assert.equal(agg.counts.espejo, 1);
  assert.deepEqual(agg.texts, ['hola']);
  assert.equal(agg.dominante, 'calma'); // empate → el primero con max
});

test('naddr: encode → decode roundtrip', () => {
  const ref = encodeSpectrumRef(ownerPubkey, CODIGO);
  assert.ok(ref.startsWith('naddr1'));
  const d = decodeSpectrumRef(ref);
  assert.equal(d.ownerPubkey, ownerPubkey);
  assert.equal(d.codigo, CODIGO);
});

test('naddr: rechaza referencias inválidas', () => {
  assert.throws(() => decodeSpectrumRef('naddr1xyz'));
  assert.throws(() => decodeSpectrumRef('npub1' + '0'.repeat(10)));
});
