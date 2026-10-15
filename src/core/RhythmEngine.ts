/**
 * Motor Rítmico y Clasificador Biomecánico Adaptable
 * Niveles de juicio: PERFECT, GREAT, GOOD (benévolo para niños) y MISS.
 * Calibración dinámica de dificultad y compensación de offset de audio.
 */

import { NoteEvent } from '../config/songs';
import { KEY_MAP_BY_CHAR, KEY_MAP_BY_CODE, KeyBioInfo } from '../config/keymap';
import { DifficultySettings } from '../config/difficulty';

export type JudgmentType = 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';

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
  private recentLatencies: number[] = [];
  private lastHitTimestamp: number = 0;
  private lastColumnIndex: number = 4;

  public evaluateHit(
    pressedChar: string,
    eventCode: string,
    currentTime: number,
    activeNotes: NoteEvent[],
    settings: DifficultySettings
  ): HitResult | null {
    if (activeNotes.length === 0) return null;

    const normalizedKey = pressedChar.toLowerCase();
    const keyInfo = KEY_MAP_BY_CHAR[normalizedKey] || KEY_MAP_BY_CODE[eventCode];

    // Aplicar compensación de offset de audio
    const effectiveTime = currentTime - (settings.audioOffsetMs / 1000);

    let candidateIndex = -1;
    let minTimeDiff = Infinity;

    for (let i = 0; i < activeNotes.length; i++) {
      const note = activeNotes[i];
      const diff = Math.abs(effectiveTime - note.time);

      if (diff <= settings.windowMiss) {
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
      this.recentLatencies.push(settings.windowMiss * 1000);
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
    const rawDelta = effectiveTime - matchedNote.time;
    const absDelta = Math.abs(rawDelta);
    const deltaMs = rawDelta * 1000;

    // Clasificación de juicio rítmico con 4 niveles adaptativos
    let judgment: JudgmentType = 'MISS';
    if (absDelta <= settings.windowPerfect) {
      judgment = 'PERFECT';
    } else if (absDelta <= settings.windowGreat) {
      judgment = 'GREAT';
    } else if (absDelta <= settings.windowGood) {
      judgment = 'GOOD';
    }

    // Detección biomecánica de arrastre manual
    let isBiomechanicallyValid = true;
    if (keyInfo) {
      const currentCol = keyInfo.colIndex;
      const colDistance = Math.abs(currentCol - this.lastColumnIndex);

      if (colDistance >= 3 && iki > 320 && absDelta > settings.windowPerfect) {
        if (judgment === 'GREAT') judgment = 'GOOD';
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

  public getLatencyStdDev(): number {
    if (this.recentLatencies.length < 5) return 0;
    const mean = this.recentLatencies.reduce((a, b) => a + b, 0) / this.recentLatencies.length;
    const variance = this.recentLatencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.recentLatencies.length;
    return Math.sqrt(variance);
  }
}
