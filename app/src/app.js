// ESPECTRO — controlador de la app (un solo archivo empaquetado).
import {
  SITUATIONS, REACTIONS, DIMENSIONS, DIMENSION_PHRASES,
  scoreAnswers, selectArchetype, buildNarrative, makeCodigo, shuffledOptions,
} from './content.js';
import { renderSpectrum, primaryDimOf, visualParams } from './visual.js';
import { NostrClient, createIdentity, importIdentity } from './client.js';
import {
  RELAYS_DEFAULT, buildSpectrumEvent, parseSpectrumEvent,
  buildEchoEvent, fetchEchoes, fetchSpectrum,
  publishAs, ephemeralIdentity, encodeSpectrumRef, decodeSpectrumRef,
} from './ecos.js';

// Plantilla de pantallas (inyectada por boot()).
const TEMPLATE = `

  <!-- INICIO -->
  <section id="pantalla-inicio" class="pantalla centro">
    <div class="marca">Espectro</div>
    <h1>Descubre tu Espectro.</h1>
    <p class="sub">8 situaciones. Ninguna respuesta correcta. Al final, un retrato vivo de cómo procesas el mundo — que se enriquece cada vez que alguien reacciona a él.</p>
    <button class="boton" id="btn-empezar">Revelar mi espectro</button>
    <div class="aviso">Sin registro · ~4 minutos · Gratis</div>
    <div class="pasos">
      <div class="paso-item"><div class="num">1</div><div><b>Responde</b><br><span class="sub">8 situaciones ambiguas, una por pantalla.</span></div></div>
      <div class="paso-item"><div class="num">2</div><div><b>Recibe</b><br><span class="sub">Tu espectro: imagen + narrativa únicas.</span></div></div>
      <div class="paso-item"><div class="num">3</div><div><b>Comparte</b><br><span class="sub">Cada reacción deja un eco anónimo que hace crecer tu resultado.</span></div></div>
    </div>
    <div class="tarjeta">
      <b>¿Tienes un código de espectro?</b>
      <p class="sub">Pégalo aquí para ver el espectro de alguien y dejar tu eco.</p>
      <input class="texto" id="input-codigo" placeholder="naddr1…" autocomplete="off">
      <button class="boton secundario pequeno" id="btn-ver-codigo">Ver espectro</button>
    </div>
    <div><span class="enlace" id="link-mios">Mis espectros</span></div>
    <div class="estado-relay" id="estado-relay"></div>
  </section>

  <!-- QUIZ -->
  <section id="pantalla-quiz" class="pantalla" hidden>
    <div class="paso" id="quiz-paso">1 / 8</div>
    <div class="progreso"><div id="quiz-barra" style="width:0%"></div></div>
    <div class="tarjeta">
      <h2 id="quiz-titulo"></h2>
      <p class="escena" id="quiz-escena"></p>
      <p class="pregunta" id="quiz-pregunta"></p>
      <div id="quiz-opciones"></div>
    </div>
  </section>

  <!-- REVELANDO -->
  <section id="pantalla-revelando" class="pantalla revelando" hidden>
    <div class="marca">Espectro</div>
    <h2>Tejiendo tu espectro<span class="puntos"></span></h2>
    <p class="sub" id="revelando-frase">Leyendo entre tus respuestas…</p>
  </section>

  <!-- RESULTADO -->
  <section id="pantalla-resultado" class="pantalla" hidden>
    <div class="marca centro">Tu espectro</div>
    <div id="resultado-visual"></div>
    <h2 class="arquetipo-nombre centro" id="resultado-nombre"></h2>
    <p class="arquetipo-epiteto centro" id="resultado-epiteto"></p>
    <div class="dimensiones" id="resultado-dims"></div>
    <div class="tarjeta">
      <div class="bloque"><h3>Cómo procesas el mundo</h3><p id="narrativa-1"></p></div>
      <div class="bloque"><h3>Tu tensión viva</h3><p id="narrativa-2"></p></div>
      <div class="bloque"><h3>Lo que tus ecos revelan</h3><p id="narrativa-3"></p></div>
    </div>
    <div class="tarjeta">
      <b>Comparte tu espectro</b>
      <p class="sub">Quien abra tu código verá tu espectro y podrá dejar un eco anónimo. Cada eco lo hace crecer.</p>
      <div class="codigo-caja">
        <div class="codigo" id="codigo-compartir"></div>
        <button class="boton pequeno" id="btn-copiar">Copiar</button>
      </div>
      <button class="boton secundario pequeno" id="btn-whatsapp">Compartir por WhatsApp</button>
      <button class="boton secundario pequeno" id="btn-ver-ecos">Actualizar ecos</button>
    </div>
    <div class="tarjeta" id="caja-ecos" hidden>
      <b>Ecos recibidos</b>
      <div class="eco-contador" id="ecos-contador"></div>
      <div id="ecos-textos"></div>
    </div>
    <div class="centro"><button class="boton secundario" id="btn-otro">Revelar otro espectro</button></div>
    <p class="aviso centro">Tu espectro no es un diagnóstico. Es una huella de <i>este momento</i> de tu vida.</p>
  </section>

  <!-- PÚBLICA (espectro ajeno) -->
  <section id="pantalla-publica" class="pantalla" hidden>
    <div class="marca centro">Espectro</div>
    <div id="publica-visual"></div>
    <h2 class="arquetipo-nombre centro" id="publica-nombre"></h2>
    <p class="arquetipo-epiteto centro" id="publica-epiteto"></p>
    <p class="sub centro" id="publica-huella" style="font-style:italic"></p>
    <div class="tarjeta">
      <b>Este es el espectro de alguien. Míralo un momento…</b>
      <p class="sub">¿Qué te provoca? Tu eco es anónimo y hará crecer su espectro.</p>
      <div class="reacciones" id="eco-reacciones"></div>
      <textarea class="texto" id="eco-texto" maxlength="140" placeholder="Déjale una resonancia anónima… (opcional)"></textarea>
      <button class="boton" id="btn-enviar-eco" disabled>Dejar mi eco</button>
      <p class="sub" id="eco-estado"></p>
    </div>
    <div class="centro">
      <button class="boton secundario" id="btn-yo-tambien">Revelar mi propio espectro</button>
    </div>
  </section>

  <!-- MIS ESPECTROS -->
  <section id="pantalla-mios" class="pantalla" hidden>
    <div class="marca">Espectro</div>
    <h2>Mis espectros</h2>
    <div class="lista-espectros" id="lista-mios"></div>
    <div class="centro"><button class="boton secundario" id="btn-volver-inicio">Volver</button></div>
  </section>

`;

const $ = (id) => document.getElementById(id);
const LS_ID = 'espectro_nsec';
const LS_MIOS = 'espectro_mios';
const LS_RELAYS = 'espectro_relays';
const LS_PEND = 'espectro_pendientes';

const store = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

let client = null;
let identity = null;
let quiz = null;
let currentSpectrum = null; // {codigo, ownerPubkey, arquetipo, dims, narrativa, respuestas, eventId}
let echoReaction = null;
let statusTimer = null;

function show(id) {
  for (const s of document.querySelectorAll('.pantalla')) s.hidden = s.id !== id;
  window.scrollTo(0, 0);
}

function setAccent(dims) {
  const prim = primaryDimOf(dims);
  const colors = { d1: '#5b9dff', d2: '#a678ff', d3: '#ff6b81', d4: '#f2b544', d5: '#3ddc97' };
  document.documentElement.style.setProperty('--acento', colors[prim]);
}

// ---------- Identidad y red ----------

function ensureIdentity() {
  const nsec = store.get(LS_ID, null);
  if (nsec) { try { identity = importIdentity(nsec); return; } catch {} }
  identity = createIdentity('viajero');
  store.set(LS_ID, identity.nsec);
}

function getRelays() {
  const r = store.get(LS_RELAYS, null);
  return Array.isArray(r) && r.length ? r : RELAYS_DEFAULT.slice();
}

function initClient() {
  client = new NostrClient({
    relays: getRelays(),
    secretKey: identity.sk,
    onRelayStatus: renderRelayStatus,
  });
  client.connect();
}

function renderRelayStatus() {
  const el = $('estado-relay');
  if (!el) return;
  const relays = getRelays();
  el.innerHTML = relays.map((u) => {
    const st = client ? client.status(u) : 'down';
    const cls = st === 'open' ? 'ok' : st === 'connecting' ? 'mid' : 'down';
    const host = u.replace('wss://', '');
    return `<span style="margin-right:10px"><span class="dot ${cls}"></span>${host}</span>`;
  }).join('');
}

// Publica un espectro; si no hay red, queda en cola pendiente.
async function publishSpectrum(data) {
  const template = buildSpectrumEvent(data);
  try {
    const { event } = await client.publish(template, { timeoutMs: 15000 });
    return { ok: true, eventId: event.id };
  } catch (e) {
    const pend = store.get(LS_PEND, []);
    pend.push({ ...data, intentos: 0 });
    store.set(LS_PEND, pend);
    return { ok: false, error: String(e.message || e) };
  }
}

async function retryPending() {
  const pend = store.get(LS_PEND, []);
  if (!pend.length) return;
  const rest = [];
  for (const p of pend) {
    try {
      const { event } = await client.publish(buildSpectrumEvent(p), { timeoutMs: 12000 });
      // actualiza el eventId en "mis espectros"
      const mios = store.get(LS_MIOS, []);
      const m = mios.find((x) => x.codigo === p.codigo);
      if (m) { m.eventId = event.id; store.set(LS_MIOS, mios); }
    } catch { rest.push(p); }
  }
  store.set(LS_PEND, rest);
}

// ---------- Quiz ----------

function startQuiz() {
  ensureIdentity();
  quiz = { idx: 0, answers: [], seed: (Date.now() ^ (Math.random() * 1e9)) >>> 0, orders: [] };
  renderQuestion();
  show('pantalla-quiz');
}

function renderQuestion() {
  const i = quiz.idx;
  const sit = SITUATIONS[i];
  const order = shuffledOptions(i, quiz.seed + i * 7919);
  quiz.orders[i] = order;
  $('quiz-paso').textContent = `${i + 1} / ${SITUATIONS.length}`;
  $('quiz-barra').style.width = `${(i / SITUATIONS.length) * 100}%`;
  $('quiz-titulo').textContent = sit.titulo;
  $('quiz-escena').textContent = sit.escena;
  $('quiz-pregunta').textContent = sit.pregunta;
  const box = $('quiz-opciones');
  box.innerHTML = '';
  order.forEach((origIdx) => {
    const b = document.createElement('button');
    b.className = 'opcion';
    b.textContent = sit.opciones[origIdx].texto;
    b.onclick = () => answerQuestion(origIdx);
    box.appendChild(b);
  });
}

function answerQuestion(origIdx) {
  quiz.answers[quiz.idx] = origIdx;
  if (quiz.idx < SITUATIONS.length - 1) {
    quiz.idx++;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

const FRASES_REVELANDO = [
  'Leyendo entre tus respuestas…',
  'Buscando tus patrones…',
  'Mezclando tus colores…',
  'Escuchando tus ecos futuros…',
];

async function finishQuiz() {
  show('pantalla-revelando');
  let fi = 0;
  const fraseTimer = setInterval(() => {
    $('revelando-frase').textContent = FRASES_REVELANDO[++fi % FRASES_REVELANDO.length];
  }, 900);

  const dims = scoreAnswers(quiz.answers);
  const arquetipo = selectArchetype(dims);
  const codigo = makeCodigo(arquetipo.slug);
  const narrativa = buildNarrative(dims, arquetipo, null);
  const data = {
    codigo, ownerPubkey: identity.pubkey,
    arquetipo: { id: arquetipo.id, nombre: arquetipo.nombre, epiteto: arquetipo.epiteto, slug: arquetipo.slug },
    dims, narrativa, respuestas: quiz.answers,
  };
  const pub = await publishSpectrum(data);
  clearInterval(fraseTimer);
  data.eventId = pub.ok ? pub.eventId : null;
  data.publicado = pub.ok;
  if (!pub.ok) data.avisoRed = true;

  const mios = store.get(LS_MIOS, []);
  mios.unshift({ ...data, creado: Date.now() });
  store.set(LS_MIOS, mios.slice(0, 20));
  renderResult(data, 0, null);
  show('pantalla-resultado');
}

// ---------- Resultado (dueño) ----------

function renderDimBars(dims) {
  $('resultado-dims').innerHTML = DIMENSIONS.map((d) => {
    const v = dims[d.id];
    return `<div class="dimension"><div class="etiqueta"><span>${d.polo0}</span><span>${d.nombre}</span><span>${d.polo100}</span></div>` +
      `<div class="barra"><div class="medio"></div><div class="relleno" style="left:${Math.min(v, 50)}%;width:${Math.abs(v - 50)}%"></div></div></div>`;
  }).join('');
}

function renderResult(data, ecosCount, ecosSummary) {
  currentSpectrum = data;
  setAccent(data.dims);
  $('resultado-visual').innerHTML = `<div class="espectro-visual">${renderSpectrum(data.dims, data.codigo, ecosCount)}</div>`;
  $('resultado-nombre').textContent = data.arquetipo.nombre;
  $('resultado-epiteto').textContent = data.arquetipo.epiteto;
  renderDimBars(data.dims);
  const narrativa = ecosSummary ? buildNarrative(data.dims, data.arquetipo, ecosSummary) : data.narrativa;
  $('narrativa-1').textContent = narrativa.bloque1;
  $('narrativa-2').textContent = narrativa.bloque2;
  $('narrativa-3').textContent = narrativa.bloque3;
  const ref = encodeSpectrumRef(data.ownerPubkey, data.codigo);
  $('codigo-compartir').textContent = ref;
  $('caja-ecos').hidden = true;
  if (data.avisoRed) {
    $('narrativa-3').textContent += ' (Tu espectro se publicará solo cuando tengas conexión a la red.)';
  }
}

async function refreshEchoes() {
  if (!currentSpectrum) return;
  const btn = $('btn-ver-ecos');
  btn.disabled = true;
  btn.textContent = 'Buscando ecos…';
  try {
    const summary = await fetchEchoes(client, currentSpectrum.ownerPubkey, currentSpectrum.codigo);
    renderResult({ ...currentSpectrum, narrativa: currentSpectrum.narrativa }, summary.total, summary);
    if (summary.total > 0) {
      $('caja-ecos').hidden = false;
      $('ecos-contador').innerHTML = REACTIONS.map((r) =>
        `<span>${r.emoji} ${summary.counts[r.id] || 0}</span>`).join('') +
        `<span>💬 ${summary.counts['texto'] || 0}</span>`;
      $('ecos-textos').innerHTML = summary.texts.map((t) =>
        `<div class="eco">“${escapeHtml(t)}”</div>`).join('');
    }
    show('pantalla-resultado');
  } catch (e) {
    btn.textContent = 'Sin conexión — reintenta';
  }
  btn.disabled = false;
  btn.textContent = 'Actualizar ecos';
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function shareText() {
  const d = currentSpectrum;
  return `Mi Espectro es *${d.arquetipo.nombre}*: ${d.arquetipo.epiteto}\n\nMíralo y déjame un eco anónimo con este código en la app Espectro:\n${encodeSpectrumRef(d.ownerPubkey, d.codigo)}`;
}

async function copyCode() {
  const t = $('codigo-compartir').textContent;
  try { await navigator.clipboard.writeText(t); $('btn-copiar').textContent = '¡Copiado!'; }
  catch {
    const ta = document.createElement('textarea');
    ta.value = t; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); $('btn-copiar').textContent = '¡Copiado!'; } catch {}
    ta.remove();
  }
  setTimeout(() => { $('btn-copiar').textContent = 'Copiar'; }, 2000);
}

// ---------- Vista pública (espectro ajeno) ----------

async function openPublic(ref) {
  let decoded;
  try { decoded = decodeSpectrumRef(ref); }
  catch { alert('Ese código no parece un espectro válido.'); return; }
  show('pantalla-revelando');
  $('revelando-frase').textContent = 'Buscando el espectro en la red…';
  try {
    const spec = await fetchSpectrum(client, decoded.ownerPubkey, decoded.codigo);
    if (!spec) throw new Error('no encontrado');
    const summary = await fetchEchoes(client, decoded.ownerPubkey, decoded.codigo).catch(() => ({ total: 0, counts: {}, texts: [], dominante: null }));
    setAccent(spec.dims);
    $('publica-visual').innerHTML = `<div class="espectro-visual">${renderSpectrum(spec.dims, spec.codigo, summary.total)}</div>`;
    $('publica-nombre').textContent = spec.nombre;
    $('publica-epiteto').textContent = spec.epiteto;
    const narr = spec.narrativa;
    $('publica-huella').textContent = `“${narr.huella}”`;
    currentSpectrum = { codigo: spec.codigo, ownerPubkey: decoded.ownerPubkey };
    echoReaction = null;
    renderReactions();
    $('eco-texto').value = '';
    $('eco-estado').textContent = '';
    $('btn-enviar-eco').disabled = true;
    show('pantalla-publica');
  } catch {
    alert('No se encontró ese espectro en la red. Revisa el código o tu conexión.');
    show('pantalla-inicio');
  }
}

function renderReactions() {
  const box = $('eco-reacciones');
  box.innerHTML = '';
  for (const r of REACTIONS) {
    const b = document.createElement('button');
    b.className = 'reaccion' + (echoReaction === r.id ? ' elegida' : '');
    b.innerHTML = `<span class="emoji">${r.emoji}</span>${r.texto}`;
    b.onclick = () => { echoReaction = r.id; renderReactions(); $('btn-enviar-eco').disabled = false; };
    box.appendChild(b);
  }
}

async function sendEcho() {
  if (!echoReaction || !currentSpectrum) return;
  const btn = $('btn-enviar-eco');
  btn.disabled = true;
  btn.textContent = 'Enviando eco…';
  const texto = $('eco-texto').value.trim().slice(0, 140);
  const eph = ephemeralIdentity(); // anonimato: clave de un solo uso
  try {
    await publishAs(client, eph.sk, buildEchoEvent({
      ownerPubkey: currentSpectrum.ownerPubkey,
      codigo: currentSpectrum.codigo,
      reaccion: echoReaction,
      texto,
    }), { timeoutMs: 15000 });
    $('eco-estado').textContent = 'Tu eco ya es parte de ese espectro. Gracias por mirar.';
    btn.textContent = 'Eco enviado ✓';
  } catch {
    $('eco-estado').textContent = 'Sin conexión a la red. Reintenta en un momento.';
    btn.disabled = false;
    btn.textContent = 'Dejar mi eco';
  }
}

// ---------- Mis espectros ----------

function renderMine() {
  const mios = store.get(LS_MIOS, []);
  const box = $('lista-mios');
  if (!mios.length) {
    box.innerHTML = '<p class="sub">Aún no tienes espectros. Revela el primero.</p>';
  } else {
    box.innerHTML = '';
    mios.forEach((m, i) => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div class="mini">${renderSpectrum(m.dims, m.codigo, 0)}</div>` +
        `<div class="info"><b>${escapeHtml(m.arquetipo.nombre)}</b>` +
        `<span>${new Date(m.creado).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · ${m.publicado === false ? 'solo local' : 'en la red'}</span></div>`;
      div.onclick = () => {
        currentSpectrum = m;
        renderResult(m, 0, null);
        show('pantalla-resultado');
      };
      box.appendChild(div);
    });
  }
  show('pantalla-mios');
}

// ---------- Init ----------

function init() {
  ensureIdentity();
  initClient();
  renderRelayStatus();
  if (statusTimer) clearInterval(statusTimer);
  statusTimer = setInterval(renderRelayStatus, 5000);
  retryPending();

  $('btn-empezar').onclick = startQuiz;
  $('btn-ver-codigo').onclick = () => {
    const v = $('input-codigo').value.trim();
    if (v) openPublic(v);
  };
  $('link-mios').onclick = renderMine;
  $('btn-volver-inicio').onclick = () => show('pantalla-inicio');
  $('btn-otro').onclick = startQuiz;
  $('btn-yo-tambien').onclick = () => show('pantalla-inicio');
  $('btn-copiar').onclick = copyCode;
  $('btn-whatsapp').onclick = () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(shareText()), '_blank');
  };
  $('btn-ver-ecos').onclick = refreshEchoes;
  $('btn-enviar-eco').onclick = sendEcho;

  const h = location.hash.match(/#s=(.+)/);
  if (h) { try { openPublic(decodeURIComponent(h[1])); return; } catch {} }
  show('pantalla-inicio');
}

const VERSION = '__APP_VERSION__';

function boot() {
  const appEl = document.getElementById('app');
  if (!appEl) return;
  // Estado limpio: permite re-arranque (takeover de versión live).
  quiz = null; currentSpectrum = null; echoReaction = null;
  appEl.innerHTML = TEMPLATE;
  init();
}

function dispose() {
  if (statusTimer) { clearInterval(statusTimer); statusTimer = null; }
  if (client) { try { client.close(); } catch {} client = null; }
}

// El loader y el bundle live usan este handle (el live lo sobrescribe).
window.__espectroApp = { boot, dispose, version: VERSION };
