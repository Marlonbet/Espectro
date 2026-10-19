// Tests del actualizador v1.2.1 (fetch + validar + ejecutar en línea):
// - takeover con versión remota mayor
// - basura del proxy se descarta en silencio (adiós "Script error")
// - sin red: la app sigue con su versión incluida
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const HTML = readFileSync(new URL('../dist/espectro.html', import.meta.url), 'utf8');

function bootWithFetch(fetchStub) {
  const calls = [];
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.__fetchCalls = calls;
      window.fetch = async (url, opts) => {
        calls.push(String(url));
        return fetchStub(String(url));
      };
      window.WebSocket = class MockWS {
        constructor() { setTimeout(() => this.onopen && this.onopen(), 0); }
        send() {} close() {}
      };
    },
  });
  return { dom, window: dom.window, document: dom.window.document, calls };
}

const okResp = (text) => ({ ok: true, text: async () => text });
const liveStub = (version) =>
  '/*' + 'x'.repeat(51000) + '*/\n' +
  `window.__espectroApp={version:${JSON.stringify(version)},` +
  `boot:function(){window.__takeover=true;},dispose:function(){window.__disposed=true;}};`;

async function waitFor(fn, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (fn()) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('timeout');
}

test('takeover: versión remota mayor ejecuta el live validado', async () => {
  const { window, document, calls, dom } = bootWithFetch(async (url) => {
    if (url.includes('version.js')) return okResp('window.__ESPECTRO_REMOTE_VERSION="9.9.9";');
    if (url.includes('espectro-live.js')) return okResp(liveStub('9.9.9'));
    throw new Error('404');
  });
  await waitFor(() => window.__takeover === true);
  const log = window.__espectroUpdateLog.join('\n');
  assert.ok(log.includes('takeover a 9.9.9'), 'log diagnóstico: ' + log);
  assert.ok(calls.some((u) => u.includes('version.js')));
  dom.window.close();
});

test('basura del proxy (HTML en vez de JS) se descarta sin "Script error"', async () => {
  const { window, document, dom } = bootWithFetch(async () => okResp('<html><body>proxy error</body></html>'));
  await new Promise((r) => setTimeout(r, 1500));
  // la app incluida sigue funcionando: landing visible, sin takeover
  assert.ok(!document.getElementById('pantalla-inicio').hidden);
  assert.equal(window.__takeover, undefined);
  const log = window.__espectroUpdateLog.join('\n');
  assert.ok(log.includes('inválido'), 'log diagnóstico: ' + log);
  // ningún error enmascarado: el fallback sigue siendo la app real
  assert.ok(window.__espectroApp && window.__espectroApp.version === '1.2.1');
  dom.window.close();
});

test('sin red: la app arranca con su versión incluida', async () => {
  const { window, document, dom } = bootWithFetch(async () => { throw new Error('network down'); });
  await new Promise((r) => setTimeout(r, 1500));
  assert.ok(!document.getElementById('pantalla-inicio').hidden);
  assert.ok(document.getElementById('btn-empezar'), 'botón presente');
  const log = window.__espectroUpdateLog.join('\n');
  assert.ok(log.includes('sin actualización'), 'log diagnóstico: ' + log);
  dom.window.close();
});

test('versión remota igual: no descarga el live', async () => {
  const { window, dom } = bootWithFetch(async (url) => {
    if (url.includes('version.js')) return okResp('window.__ESPECTRO_REMOTE_VERSION="1.2.1";');
    throw new Error('no debería pedir el live: ' + url);
  });
  await new Promise((r) => setTimeout(r, 1500));
  const log = window.__espectroUpdateLog.join('\n');
  assert.ok(log.includes('al día'), 'log diagnóstico: ' + log);
  dom.window.close();
});
