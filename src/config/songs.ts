/**
 * Catálogo de Canciones y Beatmaps Neuropedagógicos
 * Organizados por niveles de Fitts & Posner y rangos etarios.
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

// Generador de secuencias rítmicas pedagógicas por fase
function generatePedagogicalNotes(bpm: number, duration: number, level: 1 | 2 | 3): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const beatInterval = 60 / bpm;
  let currentTime = 2.0; // 2 segundos de preparación visual
  let noteIndex = 0;

  // Pools de caracteres según la etapa de Fitts & Posner
  // Nivel 1: Hilera Guía central y sílabas sencillas
  // Nivel 2: Incorporación de hileras superior e inferior, mayúsculas y palabras
  // Nivel 3: Teclado completo, ráfagas rítmicas, números y puntuación

  let cadenceDivisor = 1; // 1 = cada tiempo (negra), 0.5 = corchea

  if (level === 1) {
    cadenceDivisor = 1; // 1 pulsación por compás/tiempo
  } else if (level === 2) {
    cadenceDivisor = 0.5; // Mayor densidad rítmica
  } else {
    cadenceDivisor = 0.5;
  }

  // Patrones silábicos y de bigramas comunes para consolidar memoria procedimental
  const syllablesL1 = ['fa', 'da', 'la', 'ja', 'ka', 'sa', 'da', 'fa', 'la'];
  const wordsL2 = ['de', 'en', 'el', 'la', 'un', 'se', 'por', 'con', 'para', 'casa', 'sol', 'luz'];
  const sentencesL3 = ['escribe', 'rapido', 'ritmo', 'musica', 'juego', 'teclas', 'sonido', 'dedos'];

  while (currentTime < duration - 2.0) {
    
    if (level === 1) {
      // Alternancia simétrica bimanual para niños de 5-7 años
      const syl = syllablesL1[noteIndex % syllablesL1.length];
      for (const ch of syl) {
        notes.push({
          id: `note_${noteIndex++}`,
          char: ch,
          time: currentTime,
          type: 'circle'
        });
        currentTime += beatInterval;
      }
      // Pulgar en espacio para descanso rítmico
      notes.push({
        id: `note_${noteIndex++}`,
        char: ' ',
        time: currentTime,
        type: 'circle'
      });
      currentTime += beatInterval * 1.5;
    } else if (level === 2) {
      // Bigramas e hileras combinadas
      const w = wordsL2[noteIndex % wordsL2.length];
      for (const ch of w) {
        notes.push({
          id: `note_${noteIndex++}`,
          char: ch,
          time: currentTime,
          type: 'circle'
        });
        currentTime += beatInterval * cadenceDivisor;
      }
      notes.push({
        id: `note_${noteIndex++}`,
        char: ' ',
        time: currentTime,
        type: 'circle'
      });
      currentTime += beatInterval;
    } else {
      // Ráfagas y fluidez para 9-10 años
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
        currentTime += beatInterval * (isSlider ? 2.5 : cadenceDivisor);
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
  // FASE COGNITIVA (5-7 AÑOS)
  {
    id: 'c418_subwoofer',
    title: 'Subwoofer Lullaby',
    artist: 'C418 (Minecraft)',
    bpm: 70,
    level: 1,
    age: '5-7 años',
    description: 'Fase Cognitiva - Hilera Guía y anclajes F y J a 70 BPM',
    audioUrl: './audio/c418_subwoofer.mp3',
    offset: 0.2,
    notes: generatePedagogicalNotes(70, 75, 1)
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
    notes: generatePedagogicalNotes(80, 75, 1)
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
    notes: generatePedagogicalNotes(90, 75, 2)
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
    notes: generatePedagogicalNotes(98, 75, 2)
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
    notes: generatePedagogicalNotes(110, 75, 3)
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
    notes: generatePedagogicalNotes(123, 75, 3)
  }
];
