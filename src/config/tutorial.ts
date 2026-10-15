/**
 * Especificación del Modo Tutorial Interactivo Paso a Paso
 * Diseñado para niños de 5 a 10 años sin experiencia previa en mecanografía.
 */

export interface TutorialStep {
  id: number;
  title: string;
  instruction: string;
  targetKey: string;
  expectedFinger: string;
  fingerHand: string;
  color: string;
  hint: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'Paso 1: La Casa Base y la Tecla F',
    instruction: 'Busca con la yema de tu dedo índice izquierdo la tecla F. ¡Tiene una pequeña rayita o relieve en relieve!',
    targetKey: 'f',
    expectedFinger: 'Índice Izquierdo',
    fingerHand: 'Mano Izquierda',
    color: '#FF5252',
    hint: 'Coloca tu índice izquierdo sobre la F y presiónala.'
  },
  {
    id: 2,
    title: 'Paso 2: La Casa Base y la Tecla J',
    instruction: 'Ahora busca con tu dedo índice derecho la tecla J. ¡También tiene su propia rayita de anclaje!',
    targetKey: 'j',
    expectedFinger: 'Índice Derecho',
    fingerHand: 'Mano Derecha',
    color: '#3B82F6',
    hint: 'Coloca tu índice derecho sobre la J y presiónala.'
  },
  {
    id: 3,
    title: 'Paso 3: El Anillo de Ritmo (OSU!)',
    instruction: 'Mira el aro que se va encogiendo hacia la nota. Cuando el aro toque el borde blanco, presiona la tecla.',
    targetKey: 'f',
    expectedFinger: 'Índice Izquierdo',
    fingerHand: 'Mano Izquierda',
    color: '#FF5252',
    hint: 'Espera a que el aro concéntrico se cierre sobre la F.'
  },
  {
    id: 4,
    title: 'Paso 4: Alternancia de Manos',
    instruction: '¡Excelente! Ahora tocaremos alternando: primero la F con la izquierda, luego la J con la derecha.',
    targetKey: 'j',
    expectedFinger: 'Índice Derecho',
    fingerHand: 'Mano Derecha',
    color: '#3B82F6',
    hint: 'Pulsa J al compás del sonido.'
  },
  {
    id: 5,
    title: 'Paso 5: La Barra Espaciadora con los Pulgares',
    instruction: 'Tus dedos pulgares reposan siempre sobre la barra larga de abajo. ¡Púlsala para dar ritmo!',
    targetKey: ' ',
    expectedFinger: 'Pulgares',
    fingerHand: 'Ambas Manos',
    color: '#64748B',
    hint: 'Presiona la Barra Espaciadora con cualquiera de tus pulgares.'
  }
];
