/**
 * Motor de Escritura Zen Cosy (Fundamentado en Cero Estrés)
 * Maneja la escritura fluida de citas y fábulas, cálculo de WPM en tiempo real y lectura anticipatoria.
 */

import { ZenTextItem } from '../config/zenTexts';
import { GameState } from '../state/GameState';

export interface ZenStepResult {
  isCorrect: boolean;
  isTextCompleted: boolean;
  expectedChar: string;
  actualKey: string;
  cursor: number;
  totalLength: number;
  progressPct: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  elapsedSeconds: number;
}

export class ZenEngine {
  private startTime: number = 0;
  private hasStarted: boolean = false;

  public startText(_textItem: ZenTextItem): void {
    this.startTime = 0;
    this.hasStarted = false;
  }

  public evaluateInput(
    key: string,
    textItem: ZenTextItem,
    gameState: GameState
  ): ZenStepResult {
    if (!this.hasStarted) {
      this.startTime = performance.now();
      this.hasStarted = true;
      gameState.startTime = this.startTime;
    }

    const expected = textItem.text[gameState.zenCursor] || '';
    const isCorrect = key === expected;

    gameState.totalKeystrokes++;

    if (isCorrect) {
      gameState.zenCursor++;
      gameState.correctKeystrokes++;
      gameState.combo++;
      if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo;
      gameState.score += 50 + (gameState.combo * 2);
    } else {
      gameState.zenErrors++;
      gameState.uniqueErrors++;
      gameState.combo = 0;
      // En modo Zen, permitimos avanzar si el usuario presiona espacio o corregir
    }

    const isTextCompleted = gameState.zenCursor >= textItem.text.length;

    const elapsedMinutes = Math.max(0.01, (performance.now() - this.startTime) / 60000);
    const grossWpm = Math.round((gameState.correctKeystrokes / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round(grossWpm - (gameState.zenErrors / elapsedMinutes)));
    const accuracy = Math.min(100, Math.round((gameState.correctKeystrokes / gameState.totalKeystrokes) * 100));
    const progressPct = Math.min(100, Math.round((gameState.zenCursor / textItem.text.length) * 100));

    return {
      isCorrect,
      isTextCompleted,
      expectedChar: expected,
      actualKey: key,
      cursor: gameState.zenCursor,
      totalLength: textItem.text.length,
      progressPct,
      grossWpm,
      netWpm,
      accuracy,
      elapsedSeconds: Math.round((performance.now() - this.startTime) / 1000)
    };
  }

  public getElapsedSeconds(): number {
    if (!this.hasStarted || this.startTime === 0) return 0;
    return Math.round((performance.now() - this.startTime) / 1000);
  }

  public updateTime(gameState: GameState): void {
    if (this.hasStarted && this.startTime > 0) {
      const elapsedMinutes = Math.max(0.01, (performance.now() - this.startTime) / 60000);
      gameState.zenTimeElapsed = (performance.now() - this.startTime) / 1000;
      const grossWpm = Math.round((gameState.correctKeystrokes / 5) / elapsedMinutes);
      gameState.zenWpm = Math.max(0, Math.round(grossWpm - (gameState.zenErrors / elapsedMinutes)));
      if (gameState.totalKeystrokes > 0) {
        gameState.zenAccuracy = Math.min(100, Math.round((gameState.correctKeystrokes / gameState.totalKeystrokes) * 100));
      }
    }
  }
}
