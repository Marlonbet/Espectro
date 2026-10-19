// Tests del sistema de auto-actualización: version.js, bundle live,
// y ciclo boot → dispose → boot (takeover).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const ROOT = new URL('..', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

function mockWindow() {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    beforeParse(window) {
      window.WebSocket = class MockWS {
        constructor() { setTimeout(() => this.onopen && this.onopen(), 0); }
        send() {} close() {}
      };
    },
  });
  return dom;
}

test('version.js publica la versión remota', () => {
  const dom = mockWindow();
  dom.window.eval(read('live/version.js'));
  const v = dom.window.__ESPECTRO_REMOTE_VERSION;
  assert.match(v, /^\d+\.\d+\.\d+$/);
  const pkg = JSON.parse(read('package.json'));
  assert.equal(v, pkg.version);
  dom.window.close();
});

test('bundle live: expone boot/dispose/version y arranca', () => {
  const dom = mockWindow();
  const { window } = dom;
  window.eval(read('live/espectro-live.js'));
  const app = window.__espectroApp;
  assert.ok(app && typeof app.boot === 'function' && typeof app.dispose === 'function');
  assert.match(app.version, /^\d+\.\d+\.\d+$/);
  app.boot();
  assert.ok(window.document.getElementById('btn-empezar'), 'landing renderizada');
  assert.ok(window.document.getElementById('quiz-titulo'), 'quiz en template');
  dom.window.close();
});

test('takeover: dispose → boot re-arranca limpio', () => {
  const dom = mockWindow();
  const { window } = dom;
  const document = window.document;
  window.eval(read('live/espectro-live.js'));
  const app = window.__espectroApp;
  app.boot();
  document.getElementById('btn-empezar').click();
  assert.ok(!document.getElementById('pantalla-quiz').hidden, 'quiz visible');
  // simula la llegada de una versión live: dispose + boot
  app.dispose();
  app.boot();
  assert.ok(!document.getElementById('pantalla-inicio').hidden, 'vuelve al inicio limpio');
  document.getElementById('btn-empezar').click();
  assert.ok(!document.getElementById('pantalla-quiz').hidden, 'quiz re-arranca');
  assert.equal(document.querySelectorAll('#quiz-opciones .opcion').length, 4);
  dom.window.close();
});

test('loader dist: incluye fallback + boot con la versión', () => {
  const html = read('dist/espectro.html');
  const pkg = JSON.parse(read('package.json'));
  assert.ok(html.includes('gh-proxy.com'), 'lista de proxies en el boot');
  assert.ok(html.includes('espectro-live.js'), 'referencia al bundle live');
  assert.ok(html.includes('__espectroApp'), 'handle de la app');
  // sin placeholders sin reemplazar
  assert.ok(!html.includes('__APP_VERSION__'));
  assert.ok(!html.includes('__BUNDLED_VERSION__'));
  // el fallback lleva la versión
  assert.ok(html.includes(`version:"${pkg.version}"`) || html.includes(`"${pkg.version}"`));
});
