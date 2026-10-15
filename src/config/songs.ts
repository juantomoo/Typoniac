/**
 * Catálogo de Canciones y Beatmaps Neuropedagógicos
 * Curva de aprendizaje gradual adaptada por estadios motores de Fitts & Posner.
 */

export interface NoteEvent {
  id: string;
  char: string;         // Carácter a presionar
  time: number;         // Tiempo en segundos dentro de la pista
  duration?: number;    // Duración para notas sostenidas (sliders)
  type: 'circle' | 'slider';
  finger?: string;      // Asignación biomecánica esperada
}

export interface BeatmapData {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  level: 1 | 2 | 3;
  age: string;
  description: string;
  audioUrl: string;
  offset: number;       // Offset en segundos para sincronización
  duration: number;     // Duración total en segundos
  notes: NoteEvent[];
}

/**
 * Generador Ultra-Gradual para Fase Cognitiva (5-7 años)
 * Sincronizado matemáticamente a los pulsos (beats) y compases de la pista musical.
 */
function generateLevel1GentleNotes(bpm: number, duration: number, offset: number): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const beat = 60 / bpm; // Duración de 1 negra
  let id = 0;

  // Compás de preparación inicial (~4 segundos para acomodar postura y escuchar el pulso)
  let currentBeat = Math.ceil(4.0 / beat);

  // 1. Fase de Entrada Suave (4s a 25s): Notas individuales en blancas (cada 2 o 4 tiempos)
  while ((offset + currentBeat * beat) < Math.min(25.0, duration - 4.0)) {
    const t = Number((offset + currentBeat * beat).toFixed(3));
    const char = (id % 2 === 0) ? 'f' : 'j';
    notes.push({ id: `l1_${id++}`, char, time: t, type: 'circle' });
    currentBeat += 3; // Espaciado benevolente
  }

  // 2. Fase de Doble Toque y Dedos Mayores (25s a 60s)
  const patternL1 = ['f', 'f', 'j', 'j', 'd', 'd', 'k', 'k'];
  let patIdx = 0;
  while ((offset + currentBeat * beat) < Math.min(60.0, duration - 4.0)) {
    const t1 = Number((offset + currentBeat * beat).toFixed(3));
    const ch = patternL1[patIdx % patternL1.length];
    notes.push({ id: `l1_${id++}`, char: ch, time: t1, type: 'circle' });
    currentBeat += 1;

    // Segundo toque del par
    const t2 = Number((offset + currentBeat * beat).toFixed(3));
    notes.push({ id: `l1_${id++}`, char: ch, time: t2, type: 'circle' });
    currentBeat += 3; // Pausa de respiración de 3 tiempos
    patIdx++;
  }

  // 3. Fase de Alternancia y Espacio (60s a 100s)
  const altPattern = ['f', 'j', ' ', 'd', 'k', ' '];
  let altIdx = 0;
  while ((offset + currentBeat * beat) < Math.min(100.0, duration - 4.0)) {
    const ch = altPattern[altIdx % altPattern.length];
    const t = Number((offset + currentBeat * beat).toFixed(3));
    notes.push({ id: `l1_${id++}`, char: ch, time: t, type: 'circle' });
    currentBeat += (ch === ' ' ? 3 : 2);
    altIdx++;
  }

  // 4. Sílabas sencillas de 2 letras y palabras cortas (100s hasta el final)
  const syllables = ['fa', 'ja', 'da', 'la', 'sa', 'sol', 'sal', 'dos', 'pan', 'mar'];
  let sylIdx = 0;
  while ((offset + currentBeat * beat) < duration - 4.0) {
    const word = syllables[sylIdx % syllables.length];
    sylIdx++;

    for (const ch of word) {
      if ((offset + currentBeat * beat) >= duration - 4.0) break;
      const t = Number((offset + currentBeat * beat).toFixed(3));
      notes.push({ id: `l1_${id++}`, char: ch, time: t, type: 'circle' });
      currentBeat += 1;
    }

    // Barra espaciadora al terminar la palabra
    if ((offset + currentBeat * beat) < duration - 4.0) {
      const tSpace = Number((offset + currentBeat * beat).toFixed(3));
      notes.push({ id: `l1_${id++}`, char: ' ', time: tSpace, type: 'circle' });
      currentBeat += 3; // 3 pulsos para leer la siguiente palabra sin prisa
    }
  }

  return notes;
}

/**
 * Generador para Fase Asociativa (7-9 años)
 * Palabras de la hilera guía y superior coordinadas métricamente con el compás.
 */
function generateLevel2Notes(bpm: number, duration: number, offset: number): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const beat = 60 / bpm;
  let id = 0;
  let currentBeat = Math.ceil(3.5 / beat);

  const wordBank = [
    'sol', 'luz', 'rio', 'mar', 'paz', 'casa', 'flor', 'cielo',
    'aire', 'vida', 'verde', 'cantar', 'arbol', 'hoja', 'tierra', 'amigo'
  ];
  let wordIdx = 0;

  while ((offset + currentBeat * beat) < duration - 4.0) {
    const word = wordBank[wordIdx % wordBank.length];
    wordIdx++;

    for (let i = 0; i < word.length; i++) {
      if ((offset + currentBeat * beat) >= duration - 3.5) break;
      const t = Number((offset + currentBeat * beat).toFixed(3));
      notes.push({
        id: `l2_${id++}`,
        char: word[i],
        time: t,
        type: 'circle'
      });
      currentBeat += 1; // Pulso de negra
    }

    // Espacio entre palabras
    if ((offset + currentBeat * beat) < duration - 3.5) {
      const tSpace = Number((offset + currentBeat * beat).toFixed(3));
      notes.push({
        id: `l2_${id++}`,
        char: ' ',
        time: tSpace,
        type: 'circle'
      });
      currentBeat += 2; // Pausa de 2 pulsos
    }
  }

  return notes;
}

/**
 * Generador para Fase Autónoma (9-10 años)
 * Mecanografía a ciegas, n-gramas rápidos y notas sostenidas (sliders).
 */
function generateLevel3Notes(bpm: number, duration: number, offset: number): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const beat = 60 / bpm;
  let id = 0;
  let currentBeat = Math.ceil(3.0 / beat);

  const phraseBank = [
    'escribe con ritmo', 'musica en tus dedos', 'pulso constante',
    'vuela sobre las teclas', 'memoria motora activa', 'precision cristalina',
    'fluidez mecanografica', 'sin mirar el teclado', 'armonia y velocidad'
  ];
  let phraseIdx = 0;

  while ((offset + currentBeat * beat) < duration - 4.0) {
    const phrase = phraseBank[phraseIdx % phraseBank.length];
    phraseIdx++;

    for (let i = 0; i < phrase.length; i++) {
      if ((offset + currentBeat * beat) >= duration - 3.0) break;
      const ch = phrase[i];
      const isSlider = (ch === 'o' || ch === 'a' || ch === 'e') && (i % 6 === 0);
      const t = Number((offset + currentBeat * beat).toFixed(3));

      notes.push({
        id: `l3_${id++}`,
        char: ch,
        time: t,
        duration: isSlider ? Number((beat * 2).toFixed(3)) : undefined,
        type: isSlider ? 'slider' : 'circle'
      });

      currentBeat += isSlider ? 2 : 1;
    }

    // Descanso rítmico entre frases
    currentBeat += 2;
  }

  return notes;
}

export const CURATED_TRACKS: BeatmapData[] = [
  // FASE COGNITIVA (5-7 AÑOS) — Curva Suave
  {
    id: 'c418_subwoofer',
    title: 'Subwoofer Lullaby',
    artist: 'C418 (Minecraft)',
    bpm: 70,
    level: 1,
    age: '5-7 años',
    description: 'Fase Cognitiva - Curva ultra-lenta, anclajes F y J a 70 BPM',
    audioUrl: './audio/c418_subwoofer.mp3',
    offset: 1.2,
    duration: 208.7,
    notes: generateLevel1GentleNotes(70, 208.7, 1.2)
  },
  {
    id: 'mario_dire_docks',
    title: 'Dire, Dire Docks',
    artist: 'Koji Kondo (Super Mario 64)',
    bpm: 80,
    level: 1,
    age: '5-7 años',
    description: 'Fase Cognitiva - Arpegios de relajación sensorial a 80 BPM',
    audioUrl: './audio/mario_dire_docks.mp3',
    offset: 0.05,
    duration: 188.0,
    notes: generateLevel1GentleNotes(80, 188.0, 0.05)
  },

  // FASE ASOCIATIVA (7-9 AÑOS)
  {
    id: 'totoro_theme',
    title: 'My Neighbor Totoro',
    artist: 'Joe Hisaishi (Studio Ghibli)',
    bpm: 116,
    level: 2,
    age: '7-9 años',
    description: 'Fase Asociativa - Hilera superior y coordinación bimanual a 116 BPM',
    audioUrl: './audio/totoro_theme.mp3',
    offset: 0.1,
    duration: 248.2,
    notes: generateLevel2Notes(116, 248.2, 0.1)
  },
  {
    id: 'viva_la_vida',
    title: 'Viva La Vida',
    artist: 'Coldplay (Strings)',
    bpm: 138,
    level: 2,
    age: '7-9 años',
    description: 'Fase Asociativa - Cuerdas rítmicas y fluidez motora a 138 BPM',
    audioUrl: './audio/viva_la_vida.mp3',
    offset: 0.25,
    duration: 172.4,
    notes: generateLevel2Notes(138, 172.4, 0.25)
  },

  // FASE AUTÓNOMA (9-10 AÑOS)
  {
    id: 'undertale_once',
    title: 'Once Upon a Time',
    artist: 'Toby Fox (Undertale)',
    bpm: 120,
    level: 3,
    age: '9-10 años',
    description: 'Fase Autónoma - Mecanografía a ciegas y precisión métrica a 120 BPM',
    audioUrl: './audio/undertale_once.mp3',
    offset: 0.08,
    duration: 93.0,
    notes: generateLevel3Notes(120, 93.0, 0.08)
  },
  {
    id: 'harder_better',
    title: 'Harder, Better, Faster, Stronger',
    artist: 'Daft Punk',
    bpm: 123,
    level: 3,
    age: '9-10 años',
    description: 'Fase Autónoma - Ráfagas rítmicas de n-gramas a 123 BPM',
    audioUrl: './audio/harder_better.mp3',
    offset: 0.15,
    duration: 224.5,
    notes: generateLevel3Notes(123, 224.5, 0.15)
  }
];
