// ESPECTRO loader: arranca la versión incluida al instante (offline-first)
// y en segundo plano busca una versión más nueva vía proxies de GitHub.
// Si la hay, la carga y toma el control. El archivo descargado no necesita
// re-descargarse: las mejoras llegan solas.
(function () {
  var BUNDLED_VERSION = '__BUNDLED_VERSION__';
  var PROXIES = [
    'https://gh-proxy.com/',
    'https://ghproxy.com/',
    'https://hub.gitmirror.com/',
  ];
  var LIVE_BASE = 'https://raw.githubusercontent.com/Marlonbet/Espectro/main/app/live/';

  function cmp(a, b) {
    var pa = String(a).split('.').map(Number);
    var pb = String(b).split('.').map(Number);
    for (var i = 0; i < 3; i++) {
      var d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d > 0 ? 1 : -1;
    }
    return 0;
  }

  function loadScript(src, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      var done = false;
      var timer = setTimeout(function () { finish(new Error('timeout')); }, timeoutMs);
      function finish(err) {
        if (done) return; done = true;
        clearTimeout(timer);
        if (s.parentNode) s.parentNode.removeChild(s);
        if (err) reject(err); else resolve();
      }
      s.onload = function () { finish(); };
      s.onerror = function () { finish(new Error('load error')); };
      s.src = src;
      document.head.appendChild(s);
    });
  }

  function start() {
    var fallback = window.__espectroApp;
    if (!fallback || !fallback.boot) return;
    fallback.boot();

    // Chequeo de actualización en segundo plano: nunca bloquea la UI.
    // Solo toma el control si el usuario está en la pantalla de inicio
    // (no interrumpe un quiz a medias).
    (async function () {
      var cacheBust = 'v=' + Date.now();
      for (var i = 0; i < PROXIES.length; i++) {
        var base = PROXIES[i] + LIVE_BASE;
        try {
          window.__ESPECTRO_REMOTE_VERSION = null;
          await loadScript(base + 'version.js?' + cacheBust, 7000);
          var remote = window.__ESPECTRO_REMOTE_VERSION;
          window.__ESPECTRO_REMOTE_VERSION = null;
          if (remote && cmp(remote, BUNDLED_VERSION) > 0) {
            await loadScript(base + 'espectro-live.js?' + cacheBust, 30000);
            var live = window.__espectroApp;
            var inicio = document.getElementById('pantalla-inicio');
            if (live && live !== fallback && live.version === remote && live.boot && inicio && !inicio.hidden) {
              fallback.dispose();
              live.boot();
            }
          }
          return; // chequeo completado
        } catch (e) { /* probar siguiente proxy */ }
      }
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
