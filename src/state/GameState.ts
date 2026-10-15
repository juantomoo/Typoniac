/**
 * Estado Reactivo del Juego y Métricas de Rendimiento Mecanográfico
 * Soporta juicios PERFECT, GREAT, GOOD y MISS sin penalizaciones estresantes.
 */

import { BeatmapData, NoteEvent } from '../config/songs';
import { JudgmentType } from '../core/RhythmEngine';

export type FadeMode = 1.0 | 0.5 | 0.0;

export class GameState {
  public currentTrack: BeatmapData | null = null;
  public activeNotes: NoteEvent[] = [];
  public judgedNoteIds: Set<string> = new Set();

  public score: number = 0;
  public combo: number = 0;
  public maxCombo: number = 0;

  public perfectCount: number = 0;
  public greatCount: number = 0;
  public goodCount: number = 0;
  public missCount: number = 0;

  public totalKeystrokes: number = 0;
  public correctKeystrokes: number = 0;
  public uniqueErrors: number = 0;
  public startTime: number = 0;

  public visualFadeOpacity: FadeMode = 1.0;
  public lastErrorFingerColor: string | null = null;
  public lastErrorTimestamp: number = 0;

  public targetFinger: string | null = null;
  public targetFingerColor: string | null = null;

  public reset(track: BeatmapData): void {
    this.currentTrack = track;
    this.activeNotes = [...track.notes];
    this.judgedNoteIds.clear();

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;

    this.perfectCount = 0;
    this.greatCount = 0;
    this.goodCount = 0;
    this.missCount = 0;

    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.uniqueErrors = 0;
    this.startTime = performance.now();

    this.lastErrorFingerColor = null;
    this.lastErrorTimestamp = 0;
    this.targetFinger = null;
    this.targetFingerColor = null;
  }

  public registerHit(judgment: JudgmentType, errorFingerColor?: string): void {
    this.totalKeystrokes++;

    if (judgment === 'PERFECT') {
      this.perfectCount++;
      this.correctKeystrokes++;
      this.combo++;
      this.score += 300 + Math.min(this.combo * 10, 500);
    } else if (judgment === 'GREAT') {
      this.greatCount++;
      this.correctKeystrokes++;
      this.combo++;
      this.score += 150 + Math.min(this.combo * 5, 200);
    } else if (judgment === 'GOOD') {
      this.goodCount++;
      this.correctKeystrokes++;
      this.combo++; // El nivel GOOD mantiene el combo vivo para motivar al niño
      this.score += 80;
    } else {
      this.missCount++;
      this.uniqueErrors++;
      this.combo = 0;

      if (errorFingerColor) {
        this.lastErrorFingerColor = errorFingerColor;
        this.lastErrorTimestamp = performance.now();
      }
    }

    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
  }

  public getElapsedMinutes(): number {
    if (this.startTime === 0) return 0.01;
    return Math.max(0.01, (performance.now() - this.startTime) / 60000);
  }

  public getGrossWpm(): number {
    const minutes = this.getElapsedMinutes();
    return Math.round((this.totalKeystrokes / 5) / minutes);
  }

  public getNetWpm(): number {
    const minutes = this.getElapsedMinutes();
    const gross = (this.totalKeystrokes / 5) / minutes;
    const penalty = this.uniqueErrors / minutes;
    return Math.max(0, Math.round(gross - penalty));
  }

  public getAccuracy(): number {
    if (this.totalKeystrokes === 0) return 100;
    return Math.min(100, Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100));
  }

  public setFadeMode(mode: FadeMode): void {
    this.visualFadeOpacity = mode;
  }
}
