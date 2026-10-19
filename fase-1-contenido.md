# ESPECTRO — Fase 1: Contenido y sistema psicológico

Documento maestro del diseño psicológico del producto. Todo el frontend, el
scoring y la narrativa se derivan de aquí. Última actualización: 2026-10-19.

---

## 1. Las 5 dimensiones

Cada dimensión se puntúa de 0 a 100. 50 = punto medio. Ningún polo es
"mejor" que otro: el copy del resultado debe evitar juicios de valor y
hablar de *cómo* procesa la persona, no de *cuánto vale*.

| ID | Dimensión | Polo 0 | Polo 100 | Qué mide |
|----|-----------|--------|----------|----------|
| D1 | Control → Incertidumbre | Necesita controlar, predecir, cerrar | Tolera y habita lo abierto | Relación con lo impredecible |
| D2 | Proyección → Observación | Lee intenciones, completa huecos | Registra lo que hay, suspende juicio | Dónde pone la mente ante lo ambiguo |
| D3 | Vulnerabilidad | Blindado ante el rechazo | Altamente sensible al rechazo | Permeabilidad emocional al otro |
| D4 | Pragmatismo → Significado | Va a lo útil y concreto | Busca capas, símbolos, sentido | Dónde encuentra valor |
| D5 | Yo → Otro | Orientado a sí mismo | Orientado a los demás | Hacia dónde apunta la atención |

Regla de oro del copy: describir, no diagnosticar. "Tiendes a..." sí;
"Eres una persona ansiosa" no.

---

## 2. Las 8 situaciones definitivas

Formato de cada situación: escena vívida en segunda persona (máx. 60
palabras), una pregunta directa y 4 respuestas. Cada respuesta lleva un
vector de pesos (-2 a +2 por dimensión tocada). Las opciones están
ordenadas de forma rotada en la UI para no sesgar por posición.

### S1 — El mensaje sin respuesta
> Enviaste un mensaje importante a alguien que te importa. Pasaron tres
> horas. Aparece el doble check: lo leyó. No responde.
>
> **¿Qué pasa dentro de ti?**

- A. Relees tu mensaje buscando qué hiciste mal → D1 −2, D2 −1, D3 +2
- B. Asumes que está ocupado y sigues con tu día → D1 +2, D3 −2
- C. Te dices que no significa nada, aunque una parte de ti no te cree → D3 +1, D2 −1, D4 +1
- D. Le escribes algo casual, como quien no quiere, para ver si responde → D1 −1, D5 +2, D3 +1

### S2 — La habitación vacía
> Entras a una casa desconocida. Al fondo, una habitación vacía con una
> sola silla en el centro. Luz tenue. Nadie a la vista.
>
> **¿Qué es lo primero que te atraviesa?**

- A. Imaginas quién estuvo aquí y por qué dejó la silla así → D2 −2, D4 +2
- B. Una silla. Una habitación. Nada más que registrar → D2 +2, D4 −2
- C. Una inquietud sorda: ¿por qué una sola silla? → D1 −1, D3 +1, D4 +1
- D. Te sientas, a ver qué se siente desde ahí → D1 +1, D5 −1

### S3 — El cumplido ambiguo
> Un colega, en tono neutro, te dice: *"qué interesante tu forma de trabajar"*.
> Ni sonrisa ni ironía claras. Sigue caminando.
>
> **¿Cómo lo recibes?**

- A. Lo escuchas como una crítica disfrazada → D2 −2, D3 +2
- B. Lo tomas como un cumplido y sigues con lo tuyo → D3 −1, D2 +1
- C. Te acompaña el resto del día, dándole vueltas → D1 −2, D3 +1
- D. La próxima vez que lo veas le preguntas qué quiso decir → D1 +1, D5 +1, D2 +1

### S4 — La bifurcación
> Caminas por un bosque al atardecer. El sendero se divide en dos y ambos
> se pierden entre los árboles. Sin mapa, sin señal, la luz cayendo.
>
> **¿Qué haces?**

- A. Eliges un camino y avanzas sin mirar atrás → D1 +2, D4 −1
- B. Te detienes: tiene que haber una forma de saber cuál es el correcto → D1 −2, D2 +1
- C. Sientes que el lugar te está diciendo algo; escuchas antes de decidir → D4 +2, D1 +1
- D. Regresas al tramo conocido y buscas otra ruta → D1 −1, D4 −1, D3 +1

### S5 — La fiesta
> Llegas a una reunión donde no conoces a nadie. Los grupos ya están
> formados, se ríen, se tocan el hombro. Nadie te ha visto entrar.
>
> **¿Qué haces?**

- A. Te acercas al grupo más cercano y te presentas → D5 +2, D3 −1, D1 +1
- B. Observas desde un borde hasta entender la dinámica → D2 +2, D1 −1
- C. Sientes que sobras y valoras seriamente irte → D3 +2, D2 −1
- D. Buscas a la otra persona que está sola y hablas con ella → D5 +2, D4 +1

### S6 — La carta sin remitente
> Al llegar a casa encuentras un sobre cerrado con tu nombre escrito a
> mano. Sin remitente. Alguien lo dejó en tu puerta.
>
> **¿Qué haces?**

- A. La abres en el acto → D1 +1, D4 −1
- B. La dejas cerrada un tiempo; el misterio también es una respuesta → D4 +2, D1 +2
- C. Antes de abrirla ya imaginaste diez contenidos posibles → D2 −2, D1 −1
- D. Lo primero que piensas es quién sabe dónde vives → D3 +1, D1 −1, D2 −1

### S7 — La verdad que duele
> Alguien a quien admiras te dice algo sobre ti que duele... y que podría
> ser verdad. Lo dice sin crueldad, pero lo dice.
>
> **¿Qué pesa más en ti?**

- A. Que venga de esa persona → D3 +2, D5 +1
- B. Si es verdad o no, venga de quien venga → D2 +2, D4 −1
- C. Por qué lo dice ahora y con qué intención → D2 −1, D1 −1
- D. Qué revela de ti eso que no habías visto → D5 −2, D4 +2

### S8 — La pregunta de la noche
> Es de noche. Estás a solas, todo en silencio. De pronto aparece esta
> pregunta, nítida: *"¿qué parte de ti aún no ha sido vista por nadie?"*
>
> **¿Qué haces con ella?**

- A. La apartas; hay habitaciones que es mejor no abrir de noche → D1 −2, D4 −1
- B. Te quedas con ella un rato, sin prisa por responder → D1 +2, D4 +2
- C. Un nudo en el estómago: ¿y si alguien llegara a verla? → D3 +2
- D. La conviertes en algo: la escribes, la dibujas, la cuentas → D5 +1, D4 +1, D2 −1

---

## 3. Sistema de puntuación

### 3.1 Cálculo por dimensión
1. Cada respuesta suma sus pesos al acumulador de cada dimensión.
2. Normalización: `score = 50 + (suma / maxPosible) * 50`, donde
   `maxPosible` = suma de los |pesos| máximos por pregunta para esa
   dimensión (se calcula del propio cuestionario, no a mano).
3. Redondear a entero. Rango final 0–100.

### 3.2 Selección del arquetipo
Cada arquetipo tiene pesos sobre dimensiones (ver §4). Se calcula
`afin = Σ peso_i × (dim_i − 50) / 50` y se elige el máximo. En empate,
gana el de mayor "rareza" (orden definido en §4: el último de la lista
gana empates, para que los resultados se sientan menos genéricos).

### 3.3 Dimensiones dominantes para la narrativa
- **Primaria**: dimensión con mayor |score − 50|.
- **Tensión viva**: el par de dimensiones con mayor distancia entre sí
  en direcciones opuestas respecto a 50 (p. ej. D1=82 y D3=18) — este
  contraste es el material del segundo bloque narrativo.
- Si todas las dimensiones están entre 40–60 → arquetipo "El Umbral"
  forzado con narrativa de equilibrio (ver §4).

---

## 4. Los 7 arquetipos

Cada uno: nombre, epíteto de una línea, pesos de afinidad y tono narrativo.

1. **El Faro** — *"Ve lo que otros no ven, y lo señala en silencio."*
   Pesos: D2 +2, D4 +2, D1 +1. Tono: sereno, preciso.
2. **El Espejo** — *"Siente a los demás dentro de sí antes de entenderlos."*
   Pesos: D2 −2, D3 +2, D5 +1. Tono: íntimo, cuidadoso.
3. **El Nómada** — *"Avanza ligero; el camino se inventa al andarlo."*
   Pesos: D1 +2, D4 −1, D5 −1. Tono: directo, aireado.
4. **El Guardián** — *"Sostiene a los suyos; el control es su forma de cuidar."*
   Pesos: D1 −2, D5 +2, D3 +1. Tono: cálido, firme.
5. **El Cartógrafo** — *"Mapea antes de pisar; nada lo toma por sorpresa dos veces."*
   Pesos: D1 −2, D2 +2, D4 −1. Tono: estructurado, honesto.
6. **La Marea** — *"Se mueve con los otros; su orilla cambia cada día."*
   Pesos: D5 +2, D3 +1, D1 +1. Tono: fluido, empático.
7. **El Umbral** — *"Habita lo no resuelto sin necesidad de cruzarlo."*
   Pesos: D3 +2, D4 +2, D1 +1. Tono: poético, pausado. (También se asigna
   por equilibrio total, §3.3.)

---

## 5. Narrativa del resultado

Tres bloques + huella. Longitud total: 180–240 palabras. Nunca genérico:
cada bloque inserta al menos 2 datos derivados de las dimensiones reales.

**Bloque 1 — "Cómo procesas el mundo"** (70–90 palabras)
Plantilla según arquetipo + dimensión primaria. Ejemplo (Faro):
> "Tu mente no descansa ante lo ambiguo: lo *observa*. Donde otros
> completan huecos con historias, tú registras primero lo que hay..."

**Bloque 2 — "Tu tensión viva"** (60–80 palabras)
Nombra el contraste real entre las dos dimensiones más extremas.
Ejemplo (D1 alto + D3 alto):
> "...y sin embargo, esa misma apertura convive con una sensibilidad
> fina al rechazo. Toleras no saber a dónde va el camino, pero no toleras
> igual no saber qué piensa de ti quien camina a tu lado."

**Bloque 3 — "Lo que tus ecos revelan"** (40–70 palabras)
Con 0 ecos: invita a compartir ("Tu espectro está recién nacido...").
Con N ecos: resume la reacción dominante ("La mayoría de quienes lo
miraron sintieron...") — esto hace que *volver* tenga valor.

**La huella** (1 línea, para compartir):
> "Soy **El Umbral**: habito lo no resuelto. ¿Cuál es tu espectro?"

---

## 6. Parámetros visuales (el espectro "vivo")

Visualización abstracta generada por código (SVG/canvas), determinista a
partir de los scores + número de ecos. Mismo espectro → misma base;
más ecos → más vida.

| Parámetro | Derivado de | Efecto |
|-----------|-------------|--------|
| Tono base (hue) | Dimensión primaria | D1 azul · D2 violeta · D3 coral · D4 dorado · D5 verde |
| Simetría | D1 (control→simétrico) | Formas geométricas vs orgánicas |
| Turbulencia / ruido | Inverso de D1 | Bordes suaves vs agitados |
| Densidad de partículas | D3 (vulnerabilidad) | Más partículas = más permeable |
| Capas concéntricas | D4 (significado) | Más capas = más profundidad |
| Pulso / animación | Fijo, sutil | Siempre "respira" (sensación de vivo) |
| Anillos de eco | Nº de ecos | Cada eco agrega un anillo tenue |
| Brillo de ecos | Sentimiento agregado | Cálido si los ecos son positivos |

La imagen debe ser lo bastante bella para querer compartirla y lo bastante
abstracta para no "explicar" a la persona (misterio = compartible).

---

## 7. Sistema de ecos

### 7.1 Qué puede hacer un visitante
Al abrir un enlace ajeno ve: el visual del espectro, el arquetipo y la
huella del dueño (NO sus respuestas ni sus scores). Debajo, una invitación:

> "Este es el espectro de alguien. Míralo un momento... ¿qué te provoca?"

Reacciones de un toque (máx. fricción cero):
- 🪞 "Me veo en esto"
- 🌊 "Me inquieta"
- 🕯️ "Me da calma"
- ❓ "Quiero saber más"

Más un campo opcional de texto libre (140 caracteres): "Déjale una
resonancia anónima..." El dueño nunca ve quién fue: solo agregados.

### 7.2 Qué ve el dueño
- Contador de ecos + distribución por tipo de reacción.
- Nube de las resonancias de texto (anónimas, moderación básica
  anti-insultos por lista + reporte).
- El bloque 3 de su narrativa se reescribe con el sentimiento dominante.
- Su visual gana un anillo por eco (ver §6): *volver a mirar* es la
  retención del producto.

### 7.3 Antifraude mínimo (MVP)
Un eco por espectro y día desde el mismo navegador (huella ligera en
localStorage + límite por IP en backend). Sin cuentas, sin captchas.

---

## 8. Esquema de datos (lógico, agnóstico del backend)

```
espectros
  id            uuid pk
  codigo        text unique        -- slug público, ej. "umbral-8f3k2n"
  creado_en     timestamptz
  respuestas    jsonb             -- [ {situacion: 1, opcion: "B"}, ... ]
  dimensiones   jsonb             -- { d1: 72, d2: 41, ... }
  arquetipo     text              -- "el-umbral"
  narrativa     jsonb             -- { bloque1, bloque2, bloque3, huella }
  visual        jsonb             -- parámetros de §6
  ecos_count    int default 0

ecos
  id            uuid pk
  espectro_id   uuid fk → espectros
  tipo          text              -- espejo | inquieta | calma | saber-mas | texto
  contenido     text nullable     -- solo si tipo = texto (máx 140)
  creado_en     timestamptz
  ip_hash       text              -- antifraude, no reversible a IP

guardados      (fase 2+, opcional)
  id            uuid pk
  espectro_id   uuid fk
  user_id       uuid nullable     -- auth opcional; null = solo local
```

Índices: `espectros(codigo)`, `ecos(espectro_id, creado_en)`.
Retención: sin borrado en MVP.

---

## 9. Copy de la landing (borrador)

**H1:** "Descubre tu Espectro."
**Sub:** "8 situaciones. Ninguna respuesta correcta. Al final, un retrato
vivo de cómo procesas el mundo — que se enriquece cada vez que alguien
reacciona a él."
**CTA:** "Revelar mi espectro" (sin registro, ~4 minutos)
**Prueba social futura:** "12.408 espectros revelados · 31.902 ecos"

Sección "cómo funciona" en 3 pasos:
1. **Responde** — 8 situaciones ambiguas, una por pantalla.
2. **Recibe** — tu espectro: imagen + narrativa únicas.
3. **Comparte** — cada persona que reacciona deja un eco anónimo que hace
   crecer tu resultado.

Cierre: "Tu espectro no es un diagnóstico. Es una huella de *este momento*
de tu vida. Vuelve cuando quieras; habrá cambiado."

---

## 10. Notas de implementación

- Orden de las 8 situaciones: fijo en MVP (S1→S8, de lo cotidiano a lo
  existencial: curva emocional ascendente). A/B de orden en Fase 4.
- Opciones rotadas aleatoriamente por sesión (seed guardado para
  reproducibilidad del resultado).
- Todo el scoring ocurre en cliente en MVP (rápido, sin backend); el
  backend solo persiste. La narrativa se compone con plantillas + datos
  reales (§5). IA generativa: Fase 4, opcional, solo para enriquecer el
  bloque 1 con más variación.
- Accesibilidad: contraste AA en tema oscuro, tamaño de toque ≥ 44px,
  navegación por teclado en las opciones.
- Idioma: español en MVP. Estructura de copy preparada para i18n
  (claves, no strings hardcodeados en componentes).
- **Decisión de stack pendiente** (2026-10-19): el brief propone
  Next.js + Supabase + Vercel. Riesgo Cuba (sanciones EE.UU. endurecidas
  2026-09-30): verificar alcance o adaptar a alternativa sin VPN
  (frontend estático + Nostr para ecos, patrón ya probado en ChatApp).
