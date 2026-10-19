// E2E de cuentas en jsdom con relay simulado:
// registro → reclamo publicado → salir → entrar → contraseña incorrecta.
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
    if (!ev.tags.some((t) => t[0] === letter && f[k].includes(t[1]))) return false;
  }
  return true;
}

async function boot() {
  const events = [];
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.__events = events;
      class MockWS {
        constructor() { setTimeout(() => this.onopen && this.onopen(), 0); }
        send(data) {
          const msg = JSON.parse(data);
          if (msg[0] === 'EVENT') {
            events.push(msg[1]);
            setTimeout(() => this.onmessage && this.onmessage({ data: JSON.stringify(['OK', msg[1].id, true]) }), 0);
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
  const document = window.document;
  await new Promise((r) => setTimeout(r, 800)); // boot del loader + fallback
  return { window, document, events, dom };
}

async function waitFor(fn, ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const v = fn();
    if (v) return v;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('timeout');
}
const visible = (doc, id) => { const el = doc.getElementById(id); return el && !el.hidden; };
const text = (doc, id) => doc.getElementById(id).textContent;

async function register(document, user, pass) {
  document.getElementById('link-cuenta').click();
  await waitFor(() => visible(document, 'pantalla-cuenta'));
  document.getElementById('cuenta-usuario').value = user;
  document.getElementById('cuenta-pass').value = pass;
  document.getElementById('cuenta-pass2').value = pass;
  document.getElementById('btn-cuenta-ok').click();
}

async function login(document, user, pass) {
  document.getElementById('link-cuenta').click();
  await waitFor(() => visible(document, 'pantalla-cuenta'));
  document.getElementById('link-cuenta-modo').click(); // cambiar a entrar
  document.getElementById('cuenta-usuario').value = user;
  document.getElementById('cuenta-pass').value = pass;
  document.getElementById('btn-cuenta-ok').click();
}

test('registro: crea cuenta, publica reclamo y muestra sesión', async () => {
  const { document, events, dom } = await boot();
  assert.ok(text(document, 'caja-sesion').includes('Crear cuenta'));

  await register(document, 'testuser', 'secreto123');
  await waitFor(() => text(document, 'caja-sesion').includes('Hola, testuser'), 25000);

  const perfil = events.find((e) => e.kind === 30078 && e.tags.some((t) => t[0] === 'd' && t[1] === 'espectro:perfil:testuser'));
  assert.ok(perfil, 'reclamo de usuario publicado');
  const body = JSON.parse(perfil.content);
  assert.equal(body.username, 'testuser');
  dom.window.close();
});

test('registro duplicado con otra clave es rechazado', async () => {
  const { document, events, dom } = await boot();
  await register(document, 'duplicado', 'secreto123');
  await waitFor(() => text(document, 'caja-sesion').includes('Hola, duplicado'), 25000);
  const claimPubkey = events.find((e) => e.tags.some((t) => t[0] === 'd' && t[1] === 'espectro:perfil:duplicado')).pubkey;

  // salir y reintentar registrar el mismo usuario (derivará otra clave)
  document.getElementById('link-salir').click();
  await waitFor(() => text(document, 'caja-sesion').includes('Crear cuenta'));
  await register(document, 'duplicado', 'otra-clave-distinta');
  await waitFor(() => text(document, 'cuenta-error').includes('ya existe'), 25000);
  // no se publicó un segundo reclamo válido distinto
  const claims = events.filter((e) => e.tags.some((t) => t[0] === 'd' && t[1] === 'espectro:perfil:duplicado'));
  assert.ok(claims.every((c) => c.pubkey === claimPubkey));
  dom.window.close();
});

test('login: entrar con credenciales correctas e incorrectas', async () => {
  const { document, dom } = await boot();
  await register(document, 'viajero2', 'clave-secreta-1');
  await waitFor(() => text(document, 'caja-sesion').includes('Hola, viajero2'), 25000);

  document.getElementById('link-salir').click();
  await waitFor(() => text(document, 'caja-sesion').includes('Crear cuenta'));

  await login(document, 'viajero2', 'clave-equivocada');
  await waitFor(() => text(document, 'cuenta-error').includes('no es correcta'), 25000);

  await login(document, 'viajero2', 'clave-secreta-1');
  await waitFor(() => text(document, 'caja-sesion').includes('Hola, viajero2'), 25000);
  dom.window.close();
});

test('login: usuario inexistente avisa', async () => {
  const { document, dom } = await boot();
  await login(document, 'nadie-existe', 'cualquier-clave-1');
  await waitFor(() => text(document, 'cuenta-error').includes('no existe'), 25000);
  dom.window.close();
});
