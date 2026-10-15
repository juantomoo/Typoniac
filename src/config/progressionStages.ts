/**
 * Etapas y Progresiones No Musicales de Teclas (Fundamentadas en NotebookLM)
 * Basadas en la Ley de Fitts, Teoría de la Carga Cognitiva y el Modelo de Fitts & Posner.
 */

export interface ProgressionStage {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  levelTitle: string;
  stageNumber: number;
  title: string;
  description: string;
  targetKeys: string[];
  newKeys: string[];
  practiceSequence: string; // Secuencia de ejercicios de caracteres y palabras
  minAccuracy: number;      // NotebookLM: >= 95%
  maxStdDevMs: number;      // NotebookLM: < 150 ms
}

export const PROGRESSION_STAGES: ProgressionStage[] = [
  // =========================================================================
  // NIVEL 1: FILA GUÍA / CASA BASE (ANCLAJES PROPIOCEPTIVOS)
  // =========================================================================
  {
    id: 'stage_1_1',
    level: 1,
    levelTitle: 'Nivel 1: Casa Base',
    stageNumber: 1,
    title: 'Anclaje Táctil F y J',
    description: 'Encuentra las pequeñas marcas en relieve de las teclas F y J con tus dedos índices.',
    targetKeys: ['f', 'j', ' '],
    newKeys: ['f', 'j'],
    practiceSequence: 'f j f j ff jj f j f j ff jj f f j j fj jf f j',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_1_2',
    level: 1,
    levelTitle: 'Nivel 1: Casa Base',
    stageNumber: 2,
    title: 'Dedos Medios D y K',
    description: 'Extiende suavemente tus dedos medios sobre las teclas D (izquierda) y K (derecha).',
    targetKeys: ['f', 'j', 'd', 'k', ' '],
    newKeys: ['d', 'k'],
    practiceSequence: 'd k d k dd kk fd jk dk kd f d j k dd kk fd jk',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_1_3',
    level: 1,
    levelTitle: 'Nivel 1: Casa Base',
    stageNumber: 3,
    title: 'Dedos Anulares S y L',
    description: 'Apoya tus dedos anulares en S (izquierda) y L (derecha) sin levantar las manos.',
    targetKeys: ['f', 'j', 'd', 'k', 's', 'l', ' '],
    newKeys: ['s', 'l'],
    practiceSequence: 's l s l ss ll sd lk fs jl sl ls s d f j k l',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_1_4',
    level: 1,
    levelTitle: 'Nivel 1: Casa Base',
    stageNumber: 4,
    title: 'Meñiques A y Ñ',
    description: 'Completa la fila guía con tus dedos meñiques en A (izquierda) y Ñ (derecha).',
    targetKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ñ', ' '],
    newKeys: ['a', 'ñ'],
    practiceSequence: 'a ñ a ñ aa ññ as lñ da kñ fa jñ asdf jklñ',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_1_5',
    level: 1,
    levelTitle: 'Nivel 1: Casa Base',
    stageNumber: 5,
    title: 'Extensiones Centrales G y H',
    description: 'Estira ligeramente el índice izquierdo a G y el índice derecho a H, volviendo a F y J.',
    targetKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ', ' '],
    newKeys: ['g', 'h'],
    practiceSequence: 'f g f j h j fg jh gh hg fg hj da ha gas fas ha',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_1_6',
    level: 1,
    levelTitle: 'Nivel 1: Casa Base',
    stageNumber: 6,
    title: 'Palabras y Sílabas de Casa Base',
    description: 'Forma palabras reales significativas utilizando únicamente la hilera central.',
    targetKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ', ' '],
    newKeys: [],
    practiceSequence: 'fa da la sal sol ala gas faja gasa sala pala gala dallas',
    minAccuracy: 95,
    maxStdDevMs: 150
  },

  // =========================================================================
  // NIVEL 2: HILERA SUPERIOR (LEY DE FITTS & SEPARACIÓN E/I)
  // =========================================================================
  {
    id: 'stage_2_1',
    level: 2,
    levelTitle: 'Nivel 2: Hilera Superior',
    stageNumber: 7,
    title: 'Vocal E y Consonante R (Mano Izquierda)',
    description: 'Regla del cuaderno: Introducimos primero la E y R con mano izquierda para evitar confusión con la I.',
    targetKeys: ['e', 'r', 'f', 'd', 's', 'a', ' '],
    newKeys: ['e', 'r'],
    practiceSequence: 'd e d f r f de fr er re red sed res ser era rea dar',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_2_2',
    level: 2,
    levelTitle: 'Nivel 2: Hilera Superior',
    stageNumber: 8,
    title: 'Vocales U e I (Mano Derecha)',
    description: 'Ahora sube con el índice derecho a U y con el dedo medio a I.',
    targetKeys: ['u', 'i', 'j', 'k', ' '],
    newKeys: ['u', 'i'],
    practiceSequence: 'j u j k i k ju ki ui iu sur luz mil rio flor luis',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_2_3',
    level: 2,
    levelTitle: 'Nivel 2: Hilera Superior',
    stageNumber: 9,
    title: 'Extensiones T e Y',
    description: 'Alcanza con los dedos índices hacia arriba: T con izquierdo e Y con derecho.',
    targetKeys: ['t', 'y', 'f', 'j', ' '],
    newKeys: ['t', 'y'],
    practiceSequence: 'f t f j y j ft jy ty yt tu ya rey ley rio te ti tuyo',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_2_4',
    level: 2,
    levelTitle: 'Nivel 2: Hilera Superior',
    stageNumber: 10,
    title: 'Anulares W y O',
    description: 'Mueve los anulares hacia arriba: W con el izquierdo y O con el derecho.',
    targetKeys: ['w', 'o', 's', 'l', ' '],
    newKeys: ['w', 'o'],
    practiceSequence: 's w s l o l sw lo wo ow sol oso dos oro flor ola rojo',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_2_5',
    level: 2,
    levelTitle: 'Nivel 2: Hilera Superior',
    stageNumber: 11,
    title: 'Meñiques Q y P',
    description: 'Extiende los meñiques hacia los extremos superiores: Q (izq.) y P (der.).',
    targetKeys: ['q', 'p', 'a', 'ñ', ' '],
    newKeys: ['q', 'p'],
    practiceSequence: 'a q a ñ p ñ aq ñp qp pq que paz pan paso queso paño',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_2_6',
    level: 2,
    levelTitle: 'Nivel 2: Hilera Superior',
    stageNumber: 12,
    title: 'N-gramas y Palabras de Dos Hileras',
    description: 'Automatiza bigramas y trigramas frecuentes (es, en, por, del, que, ion).',
    targetKeys: ['a', 'e', 'i', 'o', 'u', ' '],
    newKeys: [],
    practiceSequence: 'es en por del que cielo verde tiempo fruta puerto tierra ritmo',
    minAccuracy: 95,
    maxStdDevMs: 150
  },

  // =========================================================================
  // NIVEL 3: HILERA INFERIOR (FLEXIÓN Y COORDINACIÓN)
  // =========================================================================
  {
    id: 'stage_3_1',
    level: 3,
    levelTitle: 'Nivel 3: Hilera Inferior',
    stageNumber: 13,
    title: 'Índices Inferiores V y M',
    description: 'Baja los índices suavemente: V con la mano izquierda y M con la derecha.',
    targetKeys: ['v', 'm', 'f', 'j', ' '],
    newKeys: ['v', 'm'],
    practiceSequence: 'f v f j m j fv jm vm mv ver mar voy mio vaso mesa voz',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_3_2',
    level: 3,
    levelTitle: 'Nivel 3: Hilera Inferior',
    stageNumber: 14,
    title: 'Extensiones B y N',
    description: 'Baja y estira levemente: B con índice izquierdo y N con índice derecho.',
    targetKeys: ['b', 'n', ' '],
    newKeys: ['b', 'n'],
    practiceSequence: 'f b f j n j fb jn bn nb bien nube bosque nido luna barco',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_3_3',
    level: 3,
    levelTitle: 'Nivel 3: Hilera Inferior',
    stageNumber: 15,
    title: 'Dedos Medios C y Coma (,)',
    description: 'Flexiona los dedos medios: C con el izquierdo y coma (,) con el derecho.',
    targetKeys: ['c', ',', ' '],
    newKeys: ['c', ','],
    practiceSequence: 'd c d k , k dc k, sol, rio, flor, casa, cielo, canto,',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_3_4',
    level: 3,
    levelTitle: 'Nivel 3: Hilera Inferior',
    stageNumber: 16,
    title: 'Anulares X y Punto (.)',
    description: 'Flexiona los anulares: X con la mano izquierda y punto (.) con la derecha.',
    targetKeys: ['x', '.', ' '],
    newKeys: ['x', '.'],
    practiceSequence: 's x s l . l sx l. exito. taxi. fenix. paz. sol. luz.',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_3_5',
    level: 3,
    levelTitle: 'Nivel 3: Hilera Inferior',
    stageNumber: 17,
    title: 'Meñiques Z y Guion (-)',
    description: 'Baja los meñiques: Z con la izquierda y guion (-) con la derecha.',
    targetKeys: ['z', '-', ' '],
    newKeys: ['z', '-'],
    practiceSequence: 'a z a ñ - ñ az ñ- pez luz voz azul feliz-dia sol-mar',
    minAccuracy: 95,
    maxStdDevMs: 150
  },

  // =========================================================================
  // NIVEL 4: MAYÚSCULAS Y SIGNOS (ALTERNANCIA BIMANUAL SHIFT)
  // =========================================================================
  {
    id: 'stage_4_1',
    level: 4,
    levelTitle: 'Nivel 4: Mayúsculas y Signos',
    stageNumber: 18,
    title: 'Mayúsculas Cruzadas con Shift',
    description: 'Si la letra es de mano izquierda, presiona Shift derecho con el meñique. Y viceversa.',
    targetKeys: ['Shift', ' '],
    newKeys: ['Shift'],
    practiceSequence: 'Ana Juan Leo Mario Sofia David Diana Pedro Colombia Barichara',
    minAccuracy: 95,
    maxStdDevMs: 150
  },
  {
    id: 'stage_4_2',
    level: 4,
    levelTitle: 'Nivel 4: Mayúsculas y Signos',
    stageNumber: 19,
    title: 'Interrogación y Exclamación',
    description: 'Escribe oraciones cortas con signos de puntuación y entonación.',
    targetKeys: ['¿', '?', '¡', '!', ' '],
    newKeys: ['¿', '?', '¡', '!'],
    practiceSequence: '¡Hola! ¿Como estas? ¡Que lindo dia! ¿Vamos a jugar? ¡Si!',
    minAccuracy: 95,
    maxStdDevMs: 150
  },

  // =========================================================================
  // NIVEL 5: HILERA NUMÉRICA (1 A 0)
  // =========================================================================
  {
    id: 'stage_5_1',
    level: 5,
    levelTitle: 'Nivel 5: Números',
    stageNumber: 20,
    title: 'Hilera Numérica Superior',
    description: 'Extiende verticalmente cada dedo a su número correspondiente: 1 a 5 (izq) y 6 a 0 (der).',
    targetKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ' '],
    newKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    practiceSequence: '1 2 3 4 5 6 7 8 9 0 12 34 56 78 90 2026 100 365 24 7',
    minAccuracy: 95,
    maxStdDevMs: 150
  }
];
