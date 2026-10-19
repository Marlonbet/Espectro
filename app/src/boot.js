// ESPECTRO loader: arranca la versión incluida al instante (offline-first)
// y en segundo plano busca una versión más nueva vía proxies de GitHub.
//
// Cómo se actualiza (v1.2.1+): descarga el texto con fetch, VERIFICA que
// sea código válido y recién entonces lo ejecuta como script en línea.
// Así un proxy que devuelva basura (página de error, challenge) se
// descarta en silencio, y si algo falla de verdad el error sale con su
// mensaje real (nunca más el "Script error" enmascarado).
// Diagnóstico: window.__espectroUpdateLog (ver en consola).
(function () {
  var BUNDLED_VERSION = '__BUNDLED_VERSION__';
  var PROXIES = [
    'https://gh-proxy.com/',
    'https://ghproxy.com/',
    'https://hub.gitmirror.com/',
  ];
  var LIVE_BASE = 'https://raw.githubusercontent.com/Marlonbet/Espectro/main/app/live/';
  var log = (window.__espectroUpdateLog = []);

  function note(msg) {
    try { log.push(new Date().toISOString().slice(11, 19) + ' ' + msg); } catch (e) {}
  }

  function cmp(a, b) {
    var pa = String(a).split('.').map(Number);
    var pb = String(b).split('.').map(Number);
    for (var i = 0; i < 3; i++) {
      var d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d > 0 ? 1 : -1;
    }
    return 0;
  }

  function fetchText(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
      if (typeof fetch === 'undefined') { reject(new Error('sin fetch')); return; }
      var ctrl;
      try { ctrl = new AbortController(); } catch (e) { reject(e); return; }
      var timer = setTimeout(function () {
        try { ctrl.abort(); } catch (e) {}
        reject(new Error('timeout'));
      }, timeoutMs);
      fetch(url, { signal: ctrl.signal }).then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        return res.text();
      }).then(function (t) { clearTimeout(timer); resolve(t); })
        .catch(function (e) { clearTimeout(timer); reject(e); });
    });
  }

  function validVersionText(t) {
    var m = /^\s*window\.__ESPECTRO_REMOTE_VERSION\s*=\s*"(\d+\.\d+\.\d+)"\s*;\s*$/.exec(t || '');
    return m ? m[1] : null;
  }

  function validLiveText(t) {
    return typeof t === 'string' && t.length > 50000 &&
      t.indexOf('__espectroApp') !== -1 &&
      t.charAt(0) !== '<' && t.indexOf('<!DOCTYPE') === -1 && t.indexOf('<html') === -1;
  }

  function runInline(code) {
    var s = document.createElement('script');
    s.textContent = code;
    document.head.appendChild(s);
    s.parentNode.removeChild(s);
  }

  function start() {
    var fallback = window.__espectroApp;
    if (!fallback || !fallback.boot) { note('sin app incluida'); return; }
    fallback.boot();

    // Chequeo de actualización en segundo plano: nunca bloquea la UI y
    // solo toma el control en la pantalla de inicio (no interrumpe un quiz).
    (async function () {
      var bust = 'v=' + Date.now();
      for (var i = 0; i < PROXIES.length; i++) {
        var base = PROXIES[i] + LIVE_BASE;
        try {
          note('probando ' + PROXIES[i]);
          var remote = validVersionText(await fetchText(base + 'version.js?' + bust, 7000));
          if (!remote) { note('version.js inválido, siguiente proxy'); continue; }
          note('remoto=' + remote + ' local=' + BUNDLED_VERSION);
          if (cmp(remote, BUNDLED_VERSION) <= 0) { note('al día'); return; }
          var liveText = await fetchText(base + 'espectro-live.js?' + bust, 30000);
          if (!validLiveText(liveText)) { note('live inválido, siguiente proxy'); continue; }
          runInline(liveText);
          var live = window.__espectroApp;
          var inicio = document.getElementById('pantalla-inicio');
          if (live && live !== fallback && live.version === remote && live.boot && inicio && !inicio.hidden) {
            note('takeover a ' + remote);
            fallback.dispose();
            live.boot();
          } else {
            note('live cargado pero no tomó el control');
          }
          return;
        } catch (e) { note('falló: ' + (e && e.message)); }
      }
      note('sin actualización');
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
