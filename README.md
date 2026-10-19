# ESPECTRO

Huella psicológica viva: 8 situaciones ambiguas → tu Espectro (visual +
narrativa únicos) → enlace compartible → ecos anónimos que lo enriquecen.

## Publicar una actualización (la app se actualiza sola)

El archivo descargable (`app/dist/espectro.html`) es un *loader*: trae la
app incluida (funciona sin conexión) y en segundo plano busca una versión
más nueva en `app/live/` vía proxy de GitHub. Si la hay, la carga y toma el
control sin que el usuario descargue nada.

1. Haz tus cambios en `app/src/`.
2. Sube la versión en `app/package.json` (ej. `1.1.0` → `1.2.0`).
3. `cd app && npm run build && npm test`
4. Sube a GitHub (rama `main`): cambian `app/live/` y `app/dist/`.
5. Listo: al abrir la app con conexión, el loader compara
   `app/live/version.js` con su versión y actualiza solo.

Sin conexión, la app sigue funcionando con su versión incluida.

## Cuentas (v1.2.0): usuario + contraseña, sin servidor

- El usuario se registra con **usuario + contraseña** (mín. 8 caracteres).
  La contraseña deriva la clave Nostr con scrypt (`espectro:v1:` + usuario
  como salt): la misma cuenta → la misma identidad en cualquier
  dispositivo, sin copiar claves de 63 caracteres y sin que la contraseña
  salga nunca del teléfono.
- El nombre se reclama publicando un evento de perfil
  (`30078:espectro:perfil:<usuario>`); el reclamo más antiguo gana.
- Entrar = derivar la clave y comprobar que coincide con el reclamo
  publicado. Contraseña incorrecta → la clave no coincide → rechazo.
- "Mis espectros" tiene **Sincronizar desde la red**: recupera tus
  espectros publicados en otro dispositivo.
- Límites honestos: **no hay recuperación de contraseña** (nadie la
  guarda). Usuario de invitado sigue existiendo sin cuenta.

## Estado del proyecto

- [x] **Fase 1 (contenido)** — 2026-10-19: 8 situaciones definitivas,
      sistema de puntuación (5 dimensiones, normalización 0–100),
      7 arquetipos, plantillas narrativas, parámetros visuales,
      diseño de ecos y esquema de datos. Ver `fase-1-contenido.md`.
- [x] **Fase 1–2 (MVP construido)** — 2026-10-19: app completa en
      `app/dist/espectro.html` (un solo archivo, 140 KB, cero
      dependencias externas; se abre con `file://`).
      - Flujo: landing → 8 situaciones → revelado → resultado
        (visual SVG generativo determinista + 3 bloques narrativos +
        barras de dimensiones) → código `naddr` para compartir.
      - Ecos: evento Nostr kind 30078 (espectro, replaceable) + ecos
        kind 1 con clave efímera (anonimato por diseño); vista pública
        con caja de ecos; "Mis espectros" local; reintento de
        publicación pendiente sin conexión.
      - Tests: 28/28 (scoring con fuerza bruta 4^8=65536 combinaciones,
        visual, eventos Nostr, y e2e en jsdom con relay simulado:
        quiz→resultado→vista pública→eco).
- [x] **v1.1.0 — auto-actualización** — 2026-10-19: `dist/espectro.html`
      es ahora un loader (144 KB): app incluida como fallback offline +
      chequeo en segundo plano de `app/live/version.js` vía proxies
      gh-proxy; si hay versión más nueva, carga `app/live/espectro-live.js`
      y toma el control sin re-descargar. 32/32 tests.
- [x] **Repo público** — 2026-10-19: https://github.com/Marlonbet/Espectro
      (rama `main`). Distribución a Cuba vía proxies gh-proxy.
- [x] **Relays validados** — 2026-10-19: el usuario reportó que todos los
      relays Nostr conectan desde Cuba sin VPN. La parte "viva" funciona.

## Decisiones registradas

- 2026-10-19: el brief proponía Next.js + Supabase + Vercel, pero son
  empresas de EE.UU. y las sanciones endurecidas el 2026-09-30 lo hacen
  apuesta débil desde Cuba. Decisión del usuario: repo público en GitHub +
  app como un solo archivo HTML (distribuida vía proxies gh-proxy) + ecos
  anónimos sobre Nostr. Supabase/Vercel descartados para el MVP.
- Contenido y scoring son agnósticos del stack: sirven para cualquier
  backend (Supabase, Nostr, SQLite propio).

## Archivos

- `fase-1-contenido.md` — documento maestro: situaciones, scoring,
  arquetipos, narrativa, visual, ecos, esquema de datos, copy.
