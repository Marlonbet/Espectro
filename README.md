# ESPECTRO

Huella psicológica viva: 8 situaciones ambiguas → tu Espectro (visual +
narrativa únicos) → enlace compartible → ecos anónimos que lo enriquecen.

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
- [ ] **Publicar en GitHub** — bloqueado: la sesión de GitHub del usuario
      expiró; crear el repo `Marlonbet/Espectro` requiere su login
      (la API devuelve 403).
- [ ] **Probar relays desde Cuba** — pendiente del usuario: la parte
      "viva" (publicar/recibir ecos) necesita al menos un relay Nostr
      alcanzable sin VPN (misma prueba pendiente que ChatApp Nostr).

## Decisiones registradas

- 2026-10-19: el brief propone Next.js + Supabase + Vercel, pero son
  empresas de EE.UU. y las sanciones endurecidas el 2026-09-30 lo hacen
  apuesta débil desde Cuba (mismo patrón que Render/Railway/Firebase:
  probable necesidad de VPN incluso para el propio creador). Decisión
  pendiente del usuario antes de crear el repo.
- Contenido y scoring son agnósticos del stack: sirven para cualquier
  backend (Supabase, Nostr, SQLite propio).

## Archivos

- `fase-1-contenido.md` — documento maestro: situaciones, scoring,
  arquetipos, narrativa, visual, ecos, esquema de datos, copy.
