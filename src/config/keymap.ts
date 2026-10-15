/**
 * Mapeo Biomecánico Estricto y Asignación Dactilar
 * Basado en las directrices de TeclaMágica y desarrollo neuromuscular infantil.
 */

export type FingerName = 
  | 'left-pinky' 
  | 'left-ring' 
  | 'left-middle' 
  | 'left-index' 
  | 'thumbs' 
  | 'right-index' 
  | 'right-middle' 
  | 'right-ring' 
  | 'right-pinky';

export interface KeyBioInfo {
  key: string;              // Carácter o símbolo
  display: string;          // Etiqueta visual
  code: string;             // Event.code estándar de teclado
  finger: FingerName;
  hand: 'left' | 'right' | 'both';
  color: string;            // Color del código dactilar
  row: 'number' | 'top' | 'home' | 'bottom' | 'space';
  isAnchor?: boolean;       // Teclas F y J con relieve físico
  colIndex: number;         // Índice de columna anatómica (0 a 9)
}

export const FINGER_COLORS: Record<FingerName, { color: string; label: string; hand: string }> = {
  'left-pinky':   { color: '#FF6B8B', label: 'Meñique Izq.', hand: 'Izq' },
  'left-ring':    { color: '#20C997', label: 'Anular Izq.',  hand: 'Izq' },
  'left-middle':  { color: '#00C2E0', label: 'Mayor Izq.',   hand: 'Izq' },
  'left-index':   { color: '#FF5252', label: 'Índice Izq.',  hand: 'Izq' },
  'thumbs':       { color: '#64748B', label: 'Pulgares',     hand: 'Ambas' },
  'right-index':  { color: '#3B82F6', label: 'Índice Der.',  hand: 'Der' },
  'right-middle': { color: '#FFC107', label: 'Mayor Der.',   hand: 'Der' },
  'right-ring':   { color: '#FB8C00', label: 'Anular Der.',  hand: 'Der' },
  'right-pinky':  { color: '#9C27B0', label: 'Meñique Der.', hand: 'Der' }
};

export const KEYBOARD_LAYOUT: KeyBioInfo[] = [
  // Hilera de Números (Row 0)
  { key: '1', display: '1', code: 'Digit1', finger: 'left-pinky',   hand: 'left',  color: '#FF6B8B', row: 'number', colIndex: 0 },
  { key: '2', display: '2', code: 'Digit2', finger: 'left-ring',    hand: 'left',  color: '#20C997', row: 'number', colIndex: 1 },
  { key: '3', display: '3', code: 'Digit3', finger: 'left-middle',  hand: 'left',  color: '#00C2E0', row: 'number', colIndex: 2 },
  { key: '4', display: '4', code: 'Digit4', finger: 'left-index',   hand: 'left',  color: '#FF5252', row: 'number', colIndex: 3 },
  { key: '5', display: '5', code: 'Digit5', finger: 'left-index',   hand: 'left',  color: '#FF5252', row: 'number', colIndex: 3 },
  { key: '6', display: '6', code: 'Digit6', finger: 'right-index',  hand: 'right', color: '#3B82F6', row: 'number', colIndex: 6 },
  { key: '7', display: '7', code: 'Digit7', finger: 'right-index',  hand: 'right', color: '#3B82F6', row: 'number', colIndex: 6 },
  { key: '8', display: '8', code: 'Digit8', finger: 'right-middle', hand: 'right', color: '#FFC107', row: 'number', colIndex: 7 },
  { key: '9', display: '9', code: 'Digit9', finger: 'right-ring',   hand: 'right', color: '#FB8C00', row: 'number', colIndex: 8 },
  { key: '0', display: '0', code: 'Digit0', finger: 'right-pinky',  hand: 'right', color: '#9C27B0', row: 'number', colIndex: 9 },

  // Hilera Superior (Row 1)
  { key: 'q', display: 'Q', code: 'KeyQ', finger: 'left-pinky',   hand: 'left',  color: '#FF6B8B', row: 'top', colIndex: 0 },
  { key: 'w', display: 'W', code: 'KeyW', finger: 'left-ring',    hand: 'left',  color: '#20C997', row: 'top', colIndex: 1 },
  { key: 'e', display: 'E', code: 'KeyE', finger: 'left-middle',  hand: 'left',  color: '#00C2E0', row: 'top', colIndex: 2 },
  { key: 'r', display: 'R', code: 'KeyR', finger: 'left-index',   hand: 'left',  color: '#FF5252', row: 'top', colIndex: 3 },
  { key: 't', display: 'T', code: 'KeyT', finger: 'left-index',   hand: 'left',  color: '#FF5252', row: 'top', colIndex: 3 },
  { key: 'y', display: 'Y', code: 'KeyY', finger: 'right-index',  hand: 'right', color: '#3B82F6', row: 'top', colIndex: 6 },
  { key: 'u', display: 'U', code: 'KeyU', finger: 'right-index',  hand: 'right', color: '#3B82F6', row: 'top', colIndex: 6 },
  { key: 'i', display: 'I', code: 'KeyI', finger: 'right-middle', hand: 'right', color: '#FFC107', row: 'top', colIndex: 7 },
  { key: 'o', display: 'O', code: 'KeyO', finger: 'right-ring',   hand: 'right', color: '#FB8C00', row: 'top', colIndex: 8 },
  { key: 'p', display: 'P', code: 'KeyP', finger: 'right-pinky',  hand: 'right', color: '#9C27B0', row: 'top', colIndex: 9 },

  // Hilera Guía (Row 2 - Home Row)
  { key: 'a', display: 'A', code: 'KeyA', finger: 'left-pinky',   hand: 'left',  color: '#FF6B8B', row: 'home', colIndex: 0 },
  { key: 's', display: 'S', code: 'KeyS', finger: 'left-ring',    hand: 'left',  color: '#20C997', row: 'home', colIndex: 1 },
  { key: 'd', display: 'D', code: 'KeyD', finger: 'left-middle',  hand: 'left',  color: '#00C2E0', row: 'home', colIndex: 2 },
  { key: 'f', display: 'F', code: 'KeyF', finger: 'left-index',   hand: 'left',  color: '#FF5252', row: 'home', isAnchor: true, colIndex: 3 },
  { key: 'g', display: 'G', code: 'KeyG', finger: 'left-index',   hand: 'left',  color: '#FF5252', row: 'home', colIndex: 3 },
  { key: 'h', display: 'H', code: 'KeyH', finger: 'right-index',  hand: 'right', color: '#3B82F6', row: 'home', colIndex: 6 },
  { key: 'j', display: 'J', code: 'KeyJ', finger: 'right-index',  hand: 'right', color: '#3B82F6', row: 'home', isAnchor: true, colIndex: 6 },
  { key: 'k', display: 'K', code: 'KeyK', finger: 'right-middle', hand: 'right', color: '#FFC107', row: 'home', colIndex: 7 },
  { key: 'l', display: 'L', code: 'KeyL', finger: 'right-ring',   hand: 'right', color: '#FB8C00', row: 'home', colIndex: 8 },
  { key: 'ñ', display: 'Ñ', code: 'Semicolon', finger: 'right-pinky', hand: 'right', color: '#9C27B0', row: 'home', colIndex: 9 },

  // Hilera Inferior (Row 3)
  { key: 'z', display: 'Z', code: 'KeyZ', finger: 'left-pinky',   hand: 'left',  color: '#FF6B8B', row: 'bottom', colIndex: 0 },
  { key: 'x', display: 'X', code: 'KeyX', finger: 'left-ring',    hand: 'left',  color: '#20C997', row: 'bottom', colIndex: 1 },
  { key: 'c', display: 'C', code: 'KeyC', finger: 'left-middle',  hand: 'left',  color: '#00C2E0', row: 'bottom', colIndex: 2 },
  { key: 'v', display: 'V', code: 'KeyV', finger: 'left-index',   hand: 'left',  color: '#FF5252', row: 'bottom', colIndex: 3 },
  { key: 'b', display: 'B', code: 'KeyB', finger: 'left-index',   hand: 'left',  color: '#FF5252', row: 'bottom', colIndex: 3 },
  { key: 'n', display: 'N', code: 'KeyN', finger: 'right-index',  hand: 'right', color: '#3B82F6', row: 'bottom', colIndex: 6 },
  { key: 'm', display: 'M', code: 'KeyM', finger: 'right-index',  hand: 'right', color: '#3B82F6', row: 'bottom', colIndex: 6 },
  { key: ',', display: ',', code: 'Comma', finger: 'right-middle', hand: 'right', color: '#FFC107', row: 'bottom', colIndex: 7 },
  { key: '.', display: '.', code: 'Period', finger: 'right-ring',  hand: 'right', color: '#FB8C00', row: 'bottom', colIndex: 8 },

  // Barra Espaciadora (Row 4)
  { key: ' ', display: 'ESPACIO', code: 'Space', finger: 'thumbs', hand: 'both', color: '#64748B', row: 'space', colIndex: 4 }
];

// Mapa rápido por carácter en minúscula
export const KEY_MAP_BY_CHAR: Record<string, KeyBioInfo> = {};
// Mapa rápido por Event.code
export const KEY_MAP_BY_CODE: Record<string, KeyBioInfo> = {};

KEYBOARD_LAYOUT.forEach(k => {
  KEY_MAP_BY_CHAR[k.key.toLowerCase()] = k;
  KEY_MAP_BY_CODE[k.code] = k;
});
