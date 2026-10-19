// ESPECTRO — espectros y ecos sobre Nostr.
// - Espectro: evento parameterized replaceable kind 30078, firmadopor la
//   clave del dueño. Referencia estable: "espectro:<codigo>".
// - Eco: evento kind 1 que referencia al espectro vía tag "a". Firmado con
//   clave efímera (una por eco) → anonimato por diseño.
// Sin dependencias salvo nostr-tools y client.js.

import { nip19, generateSecretKey, getPublicKey } from 'nostr-tools';

export const KIND_SPECTRUM = 30078;
export const KIND_ECHO = 1;

export const RELAYS_DEFAULT = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'wss://relay.primal.net',
  'wss://nostr-pub.wellorder.net',
];

const tagD = (codigo) => `espectro:${codigo}`;
export const spectrumAddr = (ownerPubkey, codigo) =>
  `${KIND_SPECTRUM}:${ownerPubkey}:${tagD(codigo)}`;

export function buildSpectrumEvent({ codigo, arquetipo, dims, narrativa, respuestas }) {
  return {
    kind: KIND_SPECTRUM,
    tags: [['d', tagD(codigo)], ['t', 'espectro']],
    content: JSON.stringify({
      v: 1, codigo,
      arquetipo: arquetipo.id,
      nombre: arquetipo.nombre,
      epiteto: arquetipo.epiteto,
      dims, narrativa, respuestas,
      creado: Date.now(),
    }),
  };
}

export function parseSpectrumEvent(ev) {
  if (!ev || ev.kind !== KIND_SPECTRUM) return null;
  const d = (ev.tags.find((t) => t[0] === 'd') || [])[1] || '';
  const m = d.match(/^espectro:(.+)$/);
  if (!m) return null;
  let body;
  try { body = JSON.parse(ev.content); } catch { return null; }
  if (!body || body.v !== 1 || !body.dims || !body.narrativa) return null;
  return { ...body, codigo: m[1], ownerPubkey: ev.pubkey, eventId: ev.id };
}

export function buildEchoEvent({ ownerPubkey, codigo, reaccion, texto }) {
  return {
    kind: KIND_ECHO,
    tags: [['a', spectrumAddr(ownerPubkey, codigo)], ['t', 'espectro-eco']],
    content: JSON.stringify({
      v: 1, reaccion,
      texto: (texto || '').trim().slice(0, 140),
      creado: Date.now(),
    }),
  };
}

// Moderación mínima: lista corta, ampliable.
const BLOCKED = ['puta', 'puto', 'mierda', 'cabrón', 'cabron', 'imbécil', 'imbecil', 'estúpido', 'estupido', 'odio'];

export function parseEchoEvent(ev, ownerPubkey, codigo) {
  if (!ev || ev.kind !== KIND_ECHO) return null;
  const a = (ev.tags.find((t) => t[0] === 'a') || [])[1] || '';
  if (a !== spectrumAddr(ownerPubkey, codigo)) return null;
  let body;
  try { body = JSON.parse(ev.content); } catch { return null; }
  if (!body || body.v !== 1 || !body.reaccion) return null;
  const texto = (body.texto || '').trim().slice(0, 140);
  const low = texto.toLowerCase();
  if (texto && BLOCKED.some((w) => low.includes(w))) return null;
  return { reaccion: body.reaccion, texto, pubkey: ev.pubkey, created_at: ev.created_at, id: ev.id };
}

// Agrega ecos: 1 por pubkey (se queda el más reciente), sin duplicados.
export function aggregateEchoes(parsed) {
  const byPub = new Map();
  for (const e of parsed) {
    const cur = byPub.get(e.pubkey);
    if (!cur || e.created_at > cur.created_at) byPub.set(e.pubkey, e);
  }
  const counts = {};
  const texts = [];
  for (const e of byPub.values()) {
    counts[e.reaccion] = (counts[e.reaccion] || 0) + 1;
    if (e.texto) texts.push(e.texto);
  }
  const total = byPub.size;
  let dominante = null, best = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (v > best && k !== 'texto') { best = v; dominante = k; }
  }
  return { total, counts, texts: texts.slice(0, 30), dominante };
}

export async function fetchEchoes(client, ownerPubkey, codigo) {
  const out = [];
  const sub = client.subscribe(
    [{ kinds: [KIND_ECHO], '#a': [spectrumAddr(ownerPubkey, codigo)], limit: 200 }],
    (ev) => {
      const p = parseEchoEvent(ev, ownerPubkey, codigo);
      if (p) out.push(p);
    }
  );
  await sub.eose();
  sub.unsub();
  return aggregateEchoes(out);
}

export async function fetchSpectrum(client, ownerPubkey, codigo) {
  return new Promise((resolve) => {
    let best = null;
    const sub = client.subscribe(
      [{ kinds: [KIND_SPECTRUM], authors: [ownerPubkey], '#d': [tagD(codigo)], limit: 1 }],
      (ev) => {
        const p = parseSpectrumEvent(ev);
        if (p && (!best || ev.created_at > best.created_at)) best = { ...p, created_at: ev.created_at };
      }
    );
    sub.eose().then(() => { sub.unsub(); resolve(best); });
  });
}

// Publica firmando con una clave distinta a la del cliente (ecos anónimos).
// finalizeEvent es síncrono dentro de publish(), así que el swap es seguro.
export function publishAs(client, sk, template, opts) {
  const prev = client.sk;
  client.sk = sk;
  try { return client.publish(template, opts); }
  finally { client.sk = prev; }
}

export function ephemeralIdentity() {
  const sk = generateSecretKey();
  return { sk, pubkey: getPublicKey(sk) };
}

export function encodeSpectrumRef(ownerPubkey, codigo) {
  return nip19.naddrEncode({ kind: KIND_SPECTRUM, pubkey: ownerPubkey, identifier: tagD(codigo) });
}

export function decodeSpectrumRef(ref) {
  const { type, data } = nip19.decode(ref.trim());
  if (type !== 'naddr' || data.kind !== KIND_SPECTRUM) {
    throw new Error('Ese código no es un espectro válido.');
  }
  const m = (data.identifier || '').match(/^espectro:(.+)$/);
  if (!m) throw new Error('Ese código no es un espectro válido.');
  return { ownerPubkey: data.pubkey, codigo: m[1] };
}
