// Tests del sistema de cuentas: normalización, KDF y reclamos. Sin red.
import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublicKey } from 'nostr-tools';
import {
  normalizeUsername, validatePassword, deriveSecretKey,
  buildProfileEvent, parseProfileEvent, pickEarliestClaim,
  verifyCredentials, perfilTag,
} from '../src/cuentas.js';

test('normalizeUsername: minúsculas, recorte y validación', () => {
  assert.equal(normalizeUsername('  Marlon_99 '), 'marlon_99');
  assert.equal(normalizeUsername('ana.luna-7'), 'ana.luna-7');
  assert.throws(() => normalizeUsername('ab'), /3 y 20|3-20|entre 3/);
  assert.throws(() => normalizeUsername('con espacios'));
  assert.throws(() => normalizeUsername('m@l!'));
  assert.throws(() => normalizeUsername('a'.repeat(21)));
  assert.throws(() => normalizeUsername(''));
});

test('validatePassword: mínimo 8 caracteres', () => {
  assert.throws(() => validatePassword('corta'));
  assert.throws(() => validatePassword(''));
  validatePassword('12345678');
  validatePassword('una frase larga y segura');
});

test('deriveSecretKey: determinista y sensible a usuario+contraseña', async () => {
  const a1 = await deriveSecretKey('marlon', 'secreto123');
  const a2 = await deriveSecretKey('marlon', 'secreto123');
  const b = await deriveSecretKey('marlon', 'otro-secreto');
  const c = await deriveSecretKey('ana', 'secreto123');
  assert.deepEqual(Buffer.from(a1), Buffer.from(a2));
  assert.notDeepEqual(Buffer.from(a1), Buffer.from(b));
  assert.notDeepEqual(Buffer.from(a1), Buffer.from(c));
  assert.equal(a1.length, 32);
  // clave válida secp256k1
  const pub = getPublicKey(a1);
  assert.match(pub, /^[0-9a-f]{64}$/);
});

test('perfil: build → parse roundtrip', () => {
  const t = buildProfileEvent('marlon');
  assert.equal(t.kind, 30078);
  assert.deepEqual(t.tags[0], ['d', perfilTag('marlon')]);
  const ev = { ...t, pubkey: 'f'.repeat(64), id: 'e'.repeat(64), created_at: 1700000000 };
  const p = parseProfileEvent(ev);
  assert.ok(p);
  assert.equal(p.username, 'marlon');
  assert.equal(p.pubkey, 'f'.repeat(64));
});

test('perfil: rechaza eventos ajenos', () => {
  assert.equal(parseProfileEvent({ kind: 1, tags: [], content: '{}' }), null);
  assert.equal(parseProfileEvent({ kind: 30078, tags: [['d', 'espectro:x']], content: '{}', pubkey: 'a', created_at: 1 }), null);
});

test('pickEarliestClaim: gana el reclamo más antiguo', () => {
  const claims = [
    { username: 'marlon', pubkey: 'b', created_at: 200 },
    { username: 'marlon', pubkey: 'a', created_at: 100 },
    { username: 'marlon', pubkey: 'c', created_at: 300 },
  ];
  assert.equal(pickEarliestClaim(claims).pubkey, 'a');
  assert.equal(pickEarliestClaim([]), null);
});

test('verifyCredentials: la clave derivada debe coincidir con el reclamo', () => {
  const claim = { username: 'marlon', pubkey: 'a'.repeat(64), created_at: 1 };
  assert.ok(verifyCredentials('a'.repeat(64), claim));
  assert.ok(!verifyCredentials('b'.repeat(64), claim));
  assert.ok(!verifyCredentials('a'.repeat(64), null));
});
