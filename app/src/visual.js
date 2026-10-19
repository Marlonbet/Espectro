// ESPECTRO — visualización generativa determinista (SVG).
// Mismo espectro (dimensiones + código) → misma imagen base.
// Más ecos → más anillos. Sin dependencias.

import { DIMENSION_COLORS } from './content.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// Curva suave cerrada a través de puntos (Catmull-Rom → Bézier).
function smoothClosedPath(pts) {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i];
    const p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

export function primaryDimOf(dims) {
  let best = 'd1', dev = -1;
  for (const k of Object.keys(dims)) {
    const d = Math.abs(dims[k] - 50);
    if (d > dev) { dev = d; best = k; }
  }
  return best;
}

// Parámetros derivados (exportados para tests).
export function visualParams(dims, ecos) {
  const prim = primaryDimOf(dims);
  return {
    color: DIMENSION_COLORS[prim],
    capas: 2 + Math.round((dims.d4 / 100) * 3),          // 2..5
    particulas: Math.round((dims.d3 / 100) * 48),        // 0..48
    simetria: 1 - dims.d1 / 100,                          // control → simétrico
    turbulencia: 0.08 + (dims.d1 / 100) * 0.30,          // incertidumbre → orgánico
    anillos: Math.min(ecos, 10),
    anillosExtra: Math.max(0, ecos - 10),
  };
}

export function renderSpectrum(dims, codigo, ecos = 0) {
  const P = visualParams(dims, ecos);
  const rnd = mulberry32(hashStr(JSON.stringify(dims) + '|' + codigo));
  const uid = 'e' + hashStr(codigo).toString(36);
  const C = 200, N = 72;
  let svg = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Espectro">`;
  svg += `<defs><radialGradient id="${uid}g" cx="50%" cy="42%" r="65%">` +
    `<stop offset="0%" stop-color="${rgba(P.color, 0.95)}"/>` +
    `<stop offset="55%" stop-color="${rgba(P.color, 0.38)}"/>` +
    `<stop offset="100%" stop-color="${rgba(P.color, 0.02)}"/></radialGradient></defs>`;
  svg += `<rect width="400" height="400" fill="#07080d"/>`;

  const parts = [`<g class="espectro-pulse">`];
  // Capas concéntricas: de afuera hacia adentro.
  for (let l = P.capas - 1; l >= 0; l--) {
    const R = 150 - l * 30 - rnd() * 8;
    const harm = [];
    for (let k = 0; k < 4; k++) {
      harm.push({
        f: 2 + Math.floor(rnd() * 6),
        pc: rnd() * Math.PI * 2,
        ps: rnd() * Math.PI * 2,
        a: (0.25 + rnd() * 0.75) * P.turbulencia,
      });
    }
    const pts = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2;
      let m = 0;
      for (const h of harm) {
        m += h.a * (P.simetria * Math.cos(h.f * th + h.pc) + (1 - P.simetria) * Math.sin(h.f * th + h.ps));
      }
      const r = R * (1 + m / 4);
      pts.push([C + r * Math.cos(th), C + r * Math.sin(th)]);
    }
    const op = l === 0 ? 0.9 : 0.28 - l * 0.04;
    parts.push(`<path d="${smoothClosedPath(pts)}" fill="${l === 0 ? `url(#${uid}g)` : rgba(P.color, Math.max(0.08, op))}" stroke="${rgba(P.color, 0.5)}" stroke-width="1"/>`);
  }
  // Partículas (vulnerabilidad).
  for (let i = 0; i < P.particulas; i++) {
    const th = rnd() * Math.PI * 2;
    const r = 40 + rnd() * 150;
    const x = C + r * Math.cos(th), y = C + r * Math.sin(th);
    const s = 1 + rnd() * 2.4;
    parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}" fill="${rgba(P.color, 0.25 + rnd() * 0.55)}"/>`);
  }
  // Núcleo.
  parts.push(`<circle cx="${C}" cy="${C}" r="10" fill="${rgba('#ffffff', 0.85)}"/>`);
  parts.push(`<circle cx="${C}" cy="${C}" r="22" fill="none" stroke="${rgba(P.color, 0.7)}" stroke-width="1.5"/>`);
  parts.push(`</g>`);
  // Anillos de eco (fuera del pulso para que no respiren).
  for (let i = 0; i < P.anillos; i++) {
    const r = 168 + i * 9;
    parts.push(`<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${rgba(P.color, 0.35)}" stroke-width="1" stroke-dasharray="3 7"/>`);
  }
  if (P.anillosExtra > 0) {
    parts.push(`<text x="${C}" y="392" text-anchor="middle" fill="${rgba('#ffffff', 0.55)}" font-size="13" font-family="system-ui">+${P.anillosExtra} ecos</text>`);
  }
  svg += parts.join('');
  svg += `</svg>`;
  return svg;
}
