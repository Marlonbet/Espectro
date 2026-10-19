// ESPECTRO — contenido psicológico, scoring y narrativa.
// Derivado de ~/workspace/espectro/fase-1-contenido.md. Sin dependencias.

export const DIMENSIONS = [
  { id: 'd1', nombre: 'Control · Incertidumbre', polo0: 'Control', polo100: 'Incertidumbre' },
  { id: 'd2', nombre: 'Proyección · Observación', polo0: 'Proyección', polo100: 'Observación' },
  { id: 'd3', nombre: 'Coraza · Vulnerabilidad', polo0: 'Coraza', polo100: 'Vulnerabilidad' },
  { id: 'd4', nombre: 'Pragmatismo · Significado', polo0: 'Pragmatismo', polo100: 'Significado' },
  { id: 'd5', nombre: 'Yo · Otro', polo0: 'Yo', polo100: 'Otro' },
];

export const DIMENSION_COLORS = {
  d1: '#5b9dff', d2: '#a678ff', d3: '#ff6b81', d4: '#f2b544', d5: '#3ddc97',
};

// Frases cortas por polo, para la narrativa (bloque 2 y barras del resultado).
export const DIMENSION_PHRASES = {
  d1: { baja: 'necesitas cauces predecibles', alta: 'toleras lo abierto y lo impredecible' },
  d2: { baja: 'tu mente completa los huecos con historias', alta: 'observas antes de interpretar' },
  d3: { baja: 'tu coraza ante el juicio es sólida', alta: 'eres sensible al rechazo' },
  d4: { baja: 'vas a lo útil y concreto', alta: 'buscas significado en casi todo' },
  d5: { baja: 'tu centro está en ti mismo', alta: 'vives orientado a los demás' },
};

// Sentencias de inyección según la dimensión primaria (bloque 1).
const PRIMARY_SENTENCES = {
  d1: { baja: 'Necesitas que las cosas tengan un cauce predecible, y trabajas para construirlo.', alta: 'La incertidumbre no te paraliza: la usas como materia prima.' },
  d2: { baja: 'Tu mente completa los huecos con historias: a veces acierta de lleno, a veces se adelanta.', alta: 'Antes de interpretar, registras. Tu primera lealtad es con lo que hay.' },
  d3: { baja: 'El juicio ajeno te resbala más que a la mayoría: tu coraza es real.', alta: 'Eres permeable a la mirada ajena: lo que otros piensan de ti te atraviesa de verdad.' },
  d4: { baja: 'Vas a lo concreto: lo que sirve, lo que funciona, lo que está aquí.', alta: 'Buscas la capa de abajo: para ti, casi todo significa algo más.' },
  d5: { baja: 'Tu brújula apunta hacia adentro: primero tu centro, después el resto.', alta: 'Tu brújula apunta a los demás: su estado te importa tanto como el tuyo.' },
};

export const SITUATIONS = [
  {
    id: 1, titulo: 'El mensaje sin respuesta',
    escena: 'Enviaste un mensaje importante a alguien que te importa. Pasaron tres horas. Aparece el doble check: lo leyó. No responde.',
    pregunta: '¿Qué pasa dentro de ti?',
    opciones: [
      { texto: 'Relees tu mensaje buscando qué hiciste mal', pesos: { d1: -2, d2: -1, d3: 2 } },
      { texto: 'Asumes que está ocupado y sigues con tu día', pesos: { d1: 2, d3: -2 } },
      { texto: 'Te dices que no significa nada, aunque una parte de ti no te cree', pesos: { d2: -1, d3: 1, d4: 1 } },
      { texto: 'Le escribes algo casual, como quien no quiere, para ver si responde', pesos: { d1: -1, d3: 1, d5: 2 } },
    ],
  },
  {
    id: 2, titulo: 'La habitación vacía',
    escena: 'Entras a una casa desconocida. Al fondo, una habitación vacía con una sola silla en el centro. Luz tenue. Nadie a la vista.',
    pregunta: '¿Qué es lo primero que te atraviesa?',
    opciones: [
      { texto: 'Imaginas quién estuvo aquí y por qué dejó la silla así', pesos: { d2: -2, d4: 2 } },
      { texto: 'Una silla. Una habitación. Nada más que registrar', pesos: { d2: 2, d4: -2 } },
      { texto: 'Una inquietud sorda: ¿por qué una sola silla?', pesos: { d1: -1, d3: 1, d4: 1 } },
      { texto: 'Te sientas, a ver qué se siente desde ahí', pesos: { d1: 1, d5: -1 } },
    ],
  },
  {
    id: 3, titulo: 'El cumplido ambiguo',
    escena: 'Un colega, en tono neutro, te dice: «qué interesante tu forma de trabajar». Ni sonrisa ni ironía claras. Sigue caminando.',
    pregunta: '¿Cómo lo recibes?',
    opciones: [
      { texto: 'Lo escuchas como una crítica disfrazada', pesos: { d2: -2, d3: 2 } },
      { texto: 'Lo tomas como un cumplido y sigues con lo tuyo', pesos: { d2: 1, d3: -1 } },
      { texto: 'Te acompaña el resto del día, dándole vueltas', pesos: { d1: -2, d3: 1 } },
      { texto: 'La próxima vez que lo veas le preguntas qué quiso decir', pesos: { d1: 1, d2: 1, d5: 1 } },
    ],
  },
  {
    id: 4, titulo: 'La bifurcación',
    escena: 'Caminas por un bosque al atardecer. El sendero se divide en dos y ambos se pierden entre los árboles. Sin mapa, sin señal, la luz cayendo.',
    pregunta: '¿Qué haces?',
    opciones: [
      { texto: 'Eliges un camino y avanzas sin mirar atrás', pesos: { d1: 2, d4: -1 } },
      { texto: 'Te detienes: tiene que haber una forma de saber cuál es el correcto', pesos: { d1: -2, d2: 1 } },
      { texto: 'Sientes que el lugar te está diciendo algo; escuchas antes de decidir', pesos: { d1: 1, d4: 2 } },
      { texto: 'Regresas al tramo conocido y buscas otra ruta', pesos: { d1: -1, d3: 1, d4: -1 } },
    ],
  },
  {
    id: 5, titulo: 'La fiesta',
    escena: 'Llegas a una reunión donde no conoces a nadie. Los grupos ya están formados, se ríen, se tocan el hombro. Nadie te ha visto entrar.',
    pregunta: '¿Qué haces?',
    opciones: [
      { texto: 'Te acercas al grupo más cercano y te presentas', pesos: { d1: 1, d3: -1, d5: 2 } },
      { texto: 'Observas desde un borde hasta entender la dinámica', pesos: { d1: -1, d2: 2 } },
      { texto: 'Sientes que sobras y valoras seriamente irte', pesos: { d2: -1, d3: 2 } },
      { texto: 'Buscas a la otra persona que está sola y hablas con ella', pesos: { d4: 1, d5: 2 } },
    ],
  },
  {
    id: 6, titulo: 'La carta sin remitente',
    escena: 'Al llegar a casa encuentras un sobre cerrado con tu nombre escrito a mano. Sin remitente. Alguien lo dejó en tu puerta.',
    pregunta: '¿Qué haces?',
    opciones: [
      { texto: 'La abres en el acto', pesos: { d1: 1, d4: -1 } },
      { texto: 'La dejas cerrada un tiempo; el misterio también es una respuesta', pesos: { d1: 2, d4: 2 } },
      { texto: 'Antes de abrirla ya imaginaste diez contenidos posibles', pesos: { d1: -1, d2: -2 } },
      { texto: 'Lo primero que piensas es quién sabe dónde vives', pesos: { d1: -1, d2: -1, d3: 1 } },
    ],
  },
  {
    id: 7, titulo: 'La verdad que duele',
    escena: 'Alguien a quien admiras te dice algo sobre ti que duele… y que podría ser verdad. Lo dice sin crueldad, pero lo dice.',
    pregunta: '¿Qué pesa más en ti?',
    opciones: [
      { texto: 'Que venga de esa persona', pesos: { d3: 2, d5: 1 } },
      { texto: 'Si es verdad o no, venga de quien venga', pesos: { d2: 2, d4: -1 } },
      { texto: 'Por qué lo dice ahora y con qué intención', pesos: { d1: -1, d2: -1 } },
      { texto: 'Qué revela de ti eso que no habías visto', pesos: { d4: 2, d5: -2 } },
    ],
  },
  {
    id: 8, titulo: 'La pregunta de la noche',
    escena: 'Es de noche. Estás a solas, todo en silencio. De pronto aparece esta pregunta, nítida: «¿qué parte de ti aún no ha sido vista por nadie?»',
    pregunta: '¿Qué haces con ella?',
    opciones: [
      { texto: 'La apartas; hay habitaciones que es mejor no abrir de noche', pesos: { d1: -2, d4: -1 } },
      { texto: 'Te quedas con ella un rato, sin prisa por responder', pesos: { d1: 2, d4: 2 } },
      { texto: 'Un nudo en el estómago: ¿y si alguien llegara a verla?', pesos: { d3: 2 } },
      { texto: 'La conviertes en algo: la escribes, la dibujas, la cuentas', pesos: { d2: -1, d4: 1, d5: 1 } },
    ],
  },
];

export const REACTIONS = [
  { id: 'espejo', emoji: '🪞', texto: 'Me veo en esto', eco: 'que se ven reflejados en él' },
  { id: 'inquieta', emoji: '🌊', texto: 'Me inquieta', eco: 'una inquietud fértil' },
  { id: 'calma', emoji: '🕯️', texto: 'Me da calma', eco: 'calma' },
  { id: 'saber-mas', emoji: '❓', texto: 'Quiero saber más', eco: 'curiosidad por saber más' },
];

// ---------- Scoring ----------

// answers: array de 8 índices (0-3), uno por situación en orden.
export function scoreAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== SITUATIONS.length) {
    throw new Error('Se esperaban ' + SITUATIONS.length + ' respuestas.');
  }
  const sums = { d1: 0, d2: 0, d3: 0, d4: 0, d5: 0 };
  const maxPossible = { d1: 0, d2: 0, d3: 0, d4: 0, d5: 0 };
  SITUATIONS.forEach((sit, i) => {
    const opt = sit.opciones[answers[i]];
    if (!opt) throw new Error('Respuesta inválida en situación ' + sit.id);
    for (const dim of Object.keys(sums)) {
      sums[dim] += opt.pesos[dim] || 0;
      const m = Math.max(...sit.opciones.map((o) => Math.abs(o.pesos[dim] || 0)));
      maxPossible[dim] += m;
    }
  });
  const dims = {};
  for (const dim of Object.keys(sums)) {
    dims[dim] = Math.round(50 + (sums[dim] / maxPossible[dim]) * 50);
  }
  return dims;
}

export const ARCHETYPES = [
  {
    id: 'el-faro', nombre: 'El Faro', slug: 'faro',
    epiteto: 'Ve lo que otros no ven, y lo señala en silencio.',
    afinidad: { d2: 2, d4: 2, d1: 1 },
    bloque1: 'Tu mente no se apura ante lo ambiguo: lo observa. Donde otros rellenan los huecos con historias, tú registras primero lo que hay, y solo después interpretas. Esa paciencia perceptiva te da una claridad poco común: ves patrones donde otros ven ruido.',
  },
  {
    id: 'el-espejo', nombre: 'El Espejo', slug: 'espejo',
    epiteto: 'Siente a los demás dentro de sí antes de entenderlos.',
    afinidad: { d2: -2, d3: 2, d5: 1 },
    bloque1: 'Sientes a los demás dentro de ti antes de entenderlos. Una frase neutra puede resonarte el día entero, no por debilidad, sino porque tu sistema emocional es un instrumento fino: capta matices que otros ni registran.',
  },
  {
    id: 'el-nomada', nombre: 'El Nómada', slug: 'nomada',
    epiteto: 'Avanza ligero; el camino se inventa al andarlo.',
    afinidad: { d1: 2, d4: -1, d5: -1 },
    bloque1: 'Avanzas ligero. Frente a lo incierto no te paralizas ni lo sobrepiensas: eliges un camino y lo caminas, sabiendo que el mapa se dibuja al andar. Tu relación con lo desconocido es de las más sanas que hay: curiosidad sin angustia.',
  },
  {
    id: 'el-guardian', nombre: 'El Guardián', slug: 'guardian',
    epiteto: 'Sostiene a los suyos; el control es su forma de cuidar.',
    afinidad: { d1: -2, d5: 2, d3: 1 },
    bloque1: 'Tu forma de cuidar es sostener. Necesitas que las cosas tengan un cauce —no por rigidez, sino porque cuando todo está en su lugar puedes ocuparte de los tuyos. Eres la persona que otros buscan cuando el mundo se tambalea.',
  },
  {
    id: 'el-cartografo', nombre: 'El Cartógrafo', slug: 'cartografo',
    epiteto: 'Mapea antes de pisar; nada lo toma por sorpresa dos veces.',
    afinidad: { d1: -2, d2: 2, d4: -1 },
    bloque1: 'Nada te toma por sorpresa dos veces. Observas, registras, mapeas: tu mente construye modelos del mundo para moverse con precisión. Donde otros improvisan, tú ya habías previsto tres escenarios.',
  },
  {
    id: 'la-marea', nombre: 'La Marea', slug: 'marea',
    epiteto: 'Se mueve con los otros; su orilla cambia cada día.',
    afinidad: { d5: 2, d3: 1, d1: 1 },
    bloque1: 'Te mueves con los otros. Tu atención apunta naturalmente hacia afuera: cómo están, qué necesitan, qué sienten. Tu orilla cambia cada día según quién se acerque, y eso no es inestabilidad: es tu forma de pertenecer.',
  },
  {
    id: 'el-umbral', nombre: 'El Umbral', slug: 'umbral',
    epiteto: 'Habita lo no resuelto sin necesidad de cruzarlo.',
    afinidad: { d3: 2, d4: 2, d1: 1 },
    bloque1: 'Habitas lo no resuelto sin necesidad de cruzarlo. Las preguntas grandes no te exigen respuesta inmediata: puedes quedarte con ellas, darles vueltas, dejar que maduren. Pocos toleran ese umbral; tú vives en él.',
  },
];

export function selectArchetype(dims) {
  const vals = Object.values(dims);
  const equilibrado = vals.every((v) => v >= 40 && v <= 60);
  if (equilibrado) return ARCHETYPES[ARCHETYPES.length - 1]; // El Umbral
  let best = null, bestScore = -Infinity;
  for (const arch of ARCHETYPES) {
    let s = 0;
    for (const [dim, w] of Object.entries(arch.afinidad)) {
      s += w * ((dims[dim] - 50) / 50);
    }
    if (s >= bestScore) { bestScore = s; best = arch; } // >= : en empate gana el más raro
  }
  return best;
}

function primaryDimension(dims) {
  let best = 'd1', bestDev = -1;
  for (const dim of Object.keys(dims)) {
    const dev = Math.abs(dims[dim] - 50);
    if (dev > bestDev) { bestDev = dev; best = dim; }
  }
  return best;
}

export function buildNarrative(dims, arquetipo, ecosSummary) {
  const prim = primaryDimension(dims);
  const polo = dims[prim] >= 50 ? 'alta' : 'baja';
  const bloque1 = arquetipo.bloque1 + ' ' + PRIMARY_SENTENCES[prim][polo];

  // Tensión viva: dimensiones más alta y más baja.
  const sorted = Object.entries(dims).sort((a, b) => b[1] - a[1]);
  const [topDim, topVal] = sorted[0];
  const [lowDim, lowVal] = sorted[sorted.length - 1];
  let bloque2;
  if (topVal - lowVal >= 24 && topDim !== lowDim) {
    bloque2 = `Y sin embargo, en ti conviven dos fuerzas en tensión: ${DIMENSION_PHRASES[topDim].alta}, pero al mismo tiempo ${DIMENSION_PHRASES[lowDim].baja}. Esa fricción no es un defecto: es tu zona viva, el lugar donde más estás creciendo ahora mismo.`;
  } else {
    bloque2 = 'Tus dimensiones están en un equilibrio poco común: ninguna tira con violencia hacia un extremo. Eso te da una estabilidad extraña, casi elástica: te adaptas sin romperte.';
  }

  let bloque3;
  const n = ecosSummary ? ecosSummary.total : 0;
  if (!n) {
    bloque3 = 'Tu espectro está recién nacido. Compártelo: cada persona que reaccione dejará un eco anónimo, y este texto cambiará con lo que el mundo vea en ti. Vuelve en unos días: habrá crecido.';
  } else {
    const dom = ecosSummary.dominante;
    const reaccion = REACTIONS.find((r) => r.id === dom);
    bloque3 = `Quienes han mirado tu espectro sienten sobre todo ${reaccion ? reaccion.eco : 'algo difícil de nombrar'}. ${n} ${n === 1 ? 'eco' : 'ecos'} y contando: tu huella se vuelve más nítida cuanto más la miran.`;
  }

  const huella = `Soy ${arquetipo.nombre}: ${arquetipo.epiteto} ¿Cuál es tu espectro?`;
  return { bloque1, bloque2, bloque3, huella };
}

export function makeCodigo(slug) {
  const abc = 'abcdefghijkmnopqrstuvwxyz23456789';
  const b = new Uint8Array(6);
  crypto.getRandomValues(b);
  let s = '';
  for (const x of b) s += abc[x % abc.length];
  return `${slug}-${s}`;
}

// Ordena las opciones de cada situación con una semilla (reproducible).
export function shuffledOptions(sitIndex, seed) {
  const n = SITUATIONS[sitIndex].opciones.length;
  const order = [...Array(n).keys()];
  let s = seed >>> 0 || 1;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
