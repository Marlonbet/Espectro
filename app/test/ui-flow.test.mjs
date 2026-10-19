// Test e2e del flujo completo en jsdom con un relay Nostr simulado:
// landing → 8 preguntas → resultado → publicar → vista pública → eco.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const HTML = readFileSync(new URL('../dist/espectro.html', import.meta.url), 'utf8');

function matchFilter(f, ev) {
  if (f.kinds && !f.kinds.includes(ev.kind)) return false;
  if (f.authors && !f.authors.includes(ev.pubkey)) return false;
  for (const k of Object.keys(f)) {
    if (!k.startsWith('#')) continue;
    const letter = k.slice(1);
    const vals = f[k];
    if (!ev.tags.some((t) => t[0] === letter && vals.includes(t[1]))) return false;
  }
  return true;
}

async function boot() {
  const events = [];
  const alerts = [];
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.alert = (m) => alerts.push(String(m));
      window.__events = events;
      window.__alerts = alerts;
      class MockWS {
        constructor(url) {
          this.url = url;
          setTimeout(() => this.onopen && this.onopen(), 0);
        }
        send(data) {
          const msg = JSON.parse(data);
          if (msg[0] === 'EVENT') {
            const ev = msg[1];
            events.push(ev);
            setTimeout(() => this.onmessage && this.onmessage({ data: JSON.stringify(['OK', ev.id, true]) }), 0);
          } else if (msg[0] === 'REQ') {
            const [, subId, ...filters] = msg;
            setTimeout(() => {
              for (const ev of events) {
                if (filters.some((f) => matchFilter(f, ev))) {
                  this.onmessage({ data: JSON.stringify(['EVENT', subId, ev]) });
                }
              }
              this.onmessage({ data: JSON.stringify(['EOSE', subId]) });
            }, 0);
          }
        }
        close() {}
      }
      window.WebSocket = MockWS;
    },
  });
  const { window } = dom;
  await new Promise((r) => {
    if (window.document.readyState === 'complete') r();
    else window.addEventListener('load', r);
    setTimeout(r, 3000);
  });
  // deja que init() corra
  await new Promise((r) => setTimeout(r, 300));
  return { window, document: window.document, events, alerts, dom };
}

async function waitFor(fn, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const v = fn();
    if (v) return v;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('timeout esperando condición');
}

const visible = (doc, id) => {
  const el = doc.getElementById(id);
  return el && !el.hidden;
};

test('flujo completo: quiz → resultado con espectro publicado', async () => {
  const { document, events, alerts, dom } = await boot();
  assert.ok(visible(document, 'pantalla-inicio'));

  document.getElementById('btn-empezar').click();
  assert.ok(visible(document, 'pantalla-quiz'));

  for (let q = 0; q < 8; q++) {
    const opts = await waitFor(() => {
      const b = document.querySelectorAll('#quiz-opciones .opcion');
      return b.length === 4 ? b : null;
    });
    assert.equal(document.getElementById('quiz-paso').textContent, `${q + 1} / 8`);
    opts[q % 4].click(); // varía las respuestas
  }

  await waitFor(() => visible(document, 'pantalla-resultado'));
  const nombre = document.getElementById('resultado-nombre').textContent;
  assert.ok(nombre.length > 2, 'arquetipo con nombre');
  assert.ok(document.getElementById('narrativa-1').textContent.length > 60);
  assert.ok(document.getElementById('narrativa-2').textContent.length > 40);
  assert.ok(document.getElementById('narrativa-3').textContent.length > 40);
  assert.ok(document.querySelector('#resultado-visual svg'), 'visual SVG renderizado');
  assert.equal(document.querySelectorAll('#resultado-dims .dimension').length, 5);
  const codigo = document.getElementById('codigo-compartir').textContent;
  assert.ok(codigo.startsWith('naddr1'), 'código para compartir generado');
  assert.equal(alerts.length, 0, 'sin errores: ' + alerts.join(';'));

  // el evento del espectro llegó al relay simulado
  await waitFor(() => events.some((e) => e.kind === 30078));
  dom.window.close();
});

test('vista pública: ver espectro ajeno y dejar eco anónimo', async () => {
  const { document, window, events, alerts, dom } = await boot();

  // primero creo un espectro como dueño
  document.getElementById('btn-empezar').click();
  for (let q = 0; q < 8; q++) {
    const opts = await waitFor(() => {
      const b = document.querySelectorAll('#quiz-opciones .opcion');
      return b.length === 4 ? b : null;
    });
    opts[0].click();
  }
  await waitFor(() => visible(document, 'pantalla-resultado'));
  const codigo = document.getElementById('codigo-compartir').textContent;
  await waitFor(() => events.some((e) => e.kind === 30078));

  // ahora como visitante: pego el código
  document.getElementById('input-codigo').value = codigo;
  document.getElementById('btn-ver-codigo').click();
  await waitFor(() => visible(document, 'pantalla-publica'));
  assert.ok(document.querySelector('#publica-visual svg'));
  assert.ok(document.getElementById('publica-nombre').textContent.length > 2);

  // elijo reacción y envío eco
  const reacciones = document.querySelectorAll('#eco-reacciones .reaccion');
  assert.equal(reacciones.length, 4);
  reacciones[0].click();
  document.getElementById('eco-texto').value = 'esto me llegó hondo';
  assert.equal(document.getElementById('btn-enviar-eco').disabled, false);
  document.getElementById('btn-enviar-eco').click();
  await waitFor(() => events.some((e) => e.kind === 1));
  await waitFor(() => document.getElementById('btn-enviar-eco').textContent.includes('Eco enviado'));
  assert.equal(alerts.length, 0, 'sin errores: ' + alerts.join(';'));

  // el eco referencia al espectro y es anónimo (clave efímera ≠ dueño)
  const eco = events.find((e) => e.kind === 1);
  const spec = events.find((e) => e.kind === 30078);
  assert.ok(eco.tags.some((t) => t[0] === 'a' && t[1].includes(spec.pubkey)));
  assert.notEqual(eco.pubkey, spec.pubkey);
  const body = JSON.parse(eco.content);
  assert.equal(body.reaccion, 'espejo');
  assert.equal(body.texto, 'esto me llegó hondo');
  dom.window.close();
});

test('mis espectros: el espectro queda guardado localmente', async () => {
  const { document, dom } = await boot();
  document.getElementById('btn-empezar').click();
  for (let q = 0; q < 8; q++) {
    const opts = await waitFor(() => {
      const b = document.querySelectorAll('#quiz-opciones .opcion');
      return b.length === 4 ? b : null;
    });
    opts[1].click();
  }
  await waitFor(() => visible(document, 'pantalla-resultado'));
  document.getElementById('link-mios').click();
  await waitFor(() => visible(document, 'pantalla-mios'));
  const items = document.querySelectorAll('#lista-mios .item');
  assert.equal(items.length, 1);
  assert.ok(items[0].querySelector('svg'), 'mini visual en la lista');
  dom.window.close();
});
