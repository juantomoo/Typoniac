/**
 * Motor Rítmico y Clasificador Biomecánico
 * Ventanas de precisión: PERFECT (±15ms), GREAT (±30ms), MISS (>30ms).
 * Detección de asimetría dactilar anti-"hunt and peck" (Ley de Fitts).
 */

import { NoteEvent } from '../config/songs';
import { KEY_MAP_BY_CHAR, KEY_MAP_BY_CODE, KeyBioInfo } from '../config/keymap';

export type JudgmentType = 'PERFECT' | 'GREAT' | 'MISS';

export interface HitResult {
  noteId: string;
  char: string;
  judgment: JudgmentType;
  deltaMs: number;
  expectedFinger: string;
  keyInfo?: KeyBioInfo;
  isBiomechanicallyValid: boolean;
}

export class RhythmEngine {
  // Ventanas de tiempo en segundos
  private readonly WINDOW_PERFECT = 0.015; // ±15 ms
  private readonly WINDOW_GREAT = 0.030;   // ±30 ms
  private readonly WINDOW_MISS = 0.080;    // Ventana máxima antes de descartar

  // Registro de latencias recientes para cálculo de cadencia y estabilidad (Fitts & Posner)
  private recentLatencies: number[] = [];
  private lastHitTimestamp: number = 0;
  private lastColumnIndex: number = 4; // Inicio en reposo

  public evaluateHit(
    pressedChar: string,
    eventCode: string,
    currentTime: number,
    activeNotes: NoteEvent[]
  ): HitResult | null {
    if (activeNotes.length === 0) return null;

    // Buscar la nota más próxima en el tiempo para el carácter presionado
    const normalizedKey = pressedChar.toLowerCase();
    const keyInfo = KEY_MAP_BY_CHAR[normalizedKey] || KEY_MAP_BY_CODE[eventCode];

    let candidateIndex = -1;
    let minTimeDiff = Infinity;

    for (let i = 0; i < activeNotes.length; i++) {
      const note = activeNotes[i];
      const diff = Math.abs(currentTime - note.time);

      if (diff <= this.WINDOW_MISS) {
        if (note.char.toLowerCase() === normalizedKey) {
          if (diff < minTimeDiff) {
            minTimeDiff = diff;
            candidateIndex = i;
          }
        }
      }
    }

    const nowMs = performance.now();
    const iki = this.lastHitTimestamp > 0 ? nowMs - this.lastHitTimestamp : 100;
    this.lastHitTimestamp = nowMs;

    if (candidateIndex === -1) {
      // Pulsación en destiempo o tecla equivocada
      this.recentLatencies.push(this.WINDOW_MISS * 1000);
      if (this.recentLatencies.length > 50) this.recentLatencies.shift();

      return {
        noteId: 'none',
        char: pressedChar,
        judgment: 'MISS',
        deltaMs: 999,
        expectedFinger: keyInfo ? keyInfo.finger : 'unknown',
        keyInfo,
        isBiomechanicallyValid: false
      };
    }

    const matchedNote = activeNotes[candidateIndex];
    const rawDelta = currentTime - matchedNote.time;
    const absDelta = Math.abs(rawDelta);
    const deltaMs = rawDelta * 1000;

    // Clasificación de juicio rítmico
    let judgment: JudgmentType = 'MISS';
    if (absDelta <= this.WINDOW_PERFECT) {
      judgment = 'PERFECT';
    } else if (absDelta <= this.WINDOW_GREAT) {
      judgment = 'GREAT';
    }

    // Detección Biomecánica Anti-Trampa (Ley de Fitts y Asimetría Temporal):
    // Si la tecla actual está en columnas lejanas (meñiques o anulares col 0, 1, 8, 9)
    // y el IKI es sospechosamente asimétrico en ráfagas de alta cadencia.
    let isBiomechanicallyValid = true;
    if (keyInfo) {
      const currentCol = keyInfo.colIndex;
      const colDistance = Math.abs(currentCol - this.lastColumnIndex);

      // Si hay un salto grande de columnas (ej. meñique a índice) pero el IKI es mayor a 250ms
      // en pasajes de stream beats, se detecta el arrastre manual con índices.
      if (colDistance >= 3 && iki > 280 && absDelta > this.WINDOW_PERFECT) {
        // Alerta de asimetría motora: degradar de GREAT a MISS para romper el mal hábito motor
        if (judgment === 'GREAT') {
          judgment = 'MISS';
          isBiomechanicallyValid = false;
        }
      }
      this.lastColumnIndex = currentCol;
    }

    this.recentLatencies.push(deltaMs);
    if (this.recentLatencies.length > 50) this.recentLatencies.shift();

    return {
      noteId: matchedNote.id,
      char: matchedNote.char,
      judgment,
      deltaMs,
      expectedFinger: keyInfo ? keyInfo.finger : 'unknown',
      keyInfo,
      isBiomechanicallyValid
    };
  }

  /**
   * Cálculo de la Desviación Estándar de la Latencia (\sigma_L)
   * Indicador del cuaderno TeclaMágica: \sigma_L < 150 ms garantiza automatización motora.
   */
  public getLatencyStdDev(): number {
    if (this.recentLatencies.length < 5) return 0;
    const mean = this.recentLatencies.reduce((a, b) => a + b, 0) / this.recentLatencies.length;
    const variance = this.recentLatencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.recentLatencies.length;
    return Math.sqrt(variance);
  }
}
