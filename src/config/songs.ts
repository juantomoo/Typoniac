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
  notes: NoteEvent[];
}

/**
 * Generador Ultra-Gradual para Fase Cognitiva (5-7 años)
 * 5 segundos de preparación auditiva/postural, espaciado amplio inicial y chunking progresivo.
 */
function generateLevel1GentleNotes(bpm: number, duration: number): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const beat = 60 / bpm; // ~0.857s a 70 BPM
  let id = 0;

  // 1. Fase de Entrada Suave (5s a 15s): Notas individuales espaciadas (F y J únicamente)
  notes.push({ id: `n_${id++}`, char: 'f', time: 5.0, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'j', time: 8.0, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'f', time: 11.0, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'j', time: 14.0, type: 'circle' });

  // 2. Fase de Doble Pulso (16s a 25s): Dos toques por mano
  notes.push({ id: `n_${id++}`, char: 'f', time: 17.5, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'f', time: 19.5, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'j', time: 22.0, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'j', time: 24.0, type: 'circle' });

  // 3. Fase de Alternancia y Espacio (26s a 35s)
  notes.push({ id: `n_${id++}`, char: 'f', time: 27.0, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'j', time: 29.0, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: ' ', time: 31.0, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'j', time: 33.0, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'f', time: 35.0, type: 'circle' });

  // 4. Incorporación de Dedos Mayores D y K (37s a 50s)
  notes.push({ id: `n_${id++}`, char: 'd', time: 38.0, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'f', time: 40.0, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'k', time: 42.5, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: 'j', time: 44.5, type: 'circle' });
  notes.push({ id: `n_${id++}`, char: ' ', time: 46.5, type: 'circle' });

  // 5. Sílabas Simples de Dos Letras al Compás (50s en adelante)
  const syllables = [
    { text: 'fa', start: 50.0 },
    { text: 'ja', start: 54.0 },
    { text: 'da', start: 58.0 },
    { text: 'la', start: 62.0 },
    { text: 'sol', start: 66.0 }
  ];

  for (const s of syllables) {
    if (s.start + 3 > duration) break;
    let t = s.start;
    for (const ch of s.text) {
      notes.push({ id: `n_${id++}`, char: ch, time: t, type: 'circle' });
      t += beat;
    }
    // Pulso en espacio
    notes.push({ id: `n_${id++}`, char: ' ', time: t + beat, type: 'circle' });
  }

  return notes;
}

// Generador de secuencias rítmicas para niveles 2 y 3
function generateAdvancedNotes(bpm: number, duration: number, level: 2 | 3): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const beatInterval = 60 / bpm;
  let currentTime = 4.0;
  let noteIndex = 0;

  const wordsL2 = ['de', 'en', 'el', 'la', 'un', 'se', 'por', 'con', 'para', 'casa', 'sol', 'luz'];
  const sentencesL3 = ['escribe', 'rapido', 'ritmo', 'musica', 'juego', 'teclas', 'sonido', 'dedos'];

  while (currentTime < duration - 2.0) {
    if (level === 2) {
      const w = wordsL2[noteIndex % wordsL2.length];
      for (const ch of w) {
        notes.push({
          id: `note_${noteIndex++}`,
          char: ch,
          time: currentTime,
          type: 'circle'
        });
        currentTime += beatInterval;
      }
      notes.push({
        id: `note_${noteIndex++}`,
        char: ' ',
        time: currentTime,
        type: 'circle'
      });
      currentTime += beatInterval * 1.5;
    } else {
      const w = sentencesL3[noteIndex % sentencesL3.length];
      for (let i = 0; i < w.length; i++) {
        const isSlider = (i === w.length - 1 && noteIndex % 3 === 0);
        notes.push({
          id: `note_${noteIndex++}`,
          char: w[i],
          time: currentTime,
          duration: isSlider ? beatInterval * 2 : undefined,
          type: isSlider ? 'slider' : 'circle'
        });
        currentTime += beatInterval * (isSlider ? 2.5 : 0.5);
      }
      notes.push({
        id: `note_${noteIndex++}`,
        char: ' ',
        time: currentTime,
        type: 'circle'
      });
      currentTime += beatInterval;
    }
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
    offset: 0.2,
    notes: generateLevel1GentleNotes(70, 75)
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
    offset: 0.1,
    notes: generateLevel1GentleNotes(80, 75)
  },

  // FASE ASOCIATIVA (7-9 AÑOS)
  {
    id: 'totoro_theme',
    title: 'My Neighbor Totoro',
    artist: 'Joe Hisaishi (Studio Ghibli)',
    bpm: 90,
    level: 2,
    age: '7-9 años',
    description: 'Fase Asociativa - Hilera superior y coordinación bimanual a 90 BPM',
    audioUrl: './audio/totoro_theme.mp3',
    offset: 0.15,
    notes: generateAdvancedNotes(90, 75, 2)
  },
  {
    id: 'viva_la_vida',
    title: 'Viva La Vida',
    artist: 'Coldplay (Strings)',
    bpm: 98,
    level: 2,
    age: '7-9 años',
    description: 'Fase Asociativa - Hilera inferior y fluidez rítmica a 98 BPM',
    audioUrl: './audio/viva_la_vida.mp3',
    offset: 0.2,
    notes: generateAdvancedNotes(98, 75, 2)
  },

  // FASE AUTÓNOMA (9-10 AÑOS)
  {
    id: 'undertale_once',
    title: 'Once Upon a Time',
    artist: 'Toby Fox (Undertale)',
    bpm: 110,
    level: 3,
    age: '9-10 años',
    description: 'Fase Autónoma - Mecanografía a ciegas y precisión métrica a 110 BPM',
    audioUrl: './audio/undertale_once.mp3',
    offset: 0.1,
    notes: generateAdvancedNotes(110, 75, 3)
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
    offset: 0.25,
    notes: generateAdvancedNotes(123, 75, 3)
  }
];
