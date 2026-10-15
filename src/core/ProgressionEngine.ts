/**
 * Motor de Progresión No Musical de Teclas (Fundamentado en NotebookLM)
 * Maneja el aprendizaje paso a paso sin presión de reloj, evaluando precisión y estabilidad motora (σL).
 */

import { ProgressionStage } from '../config/progressionStages';
import { GameState } from '../state/GameState';
import { KEY_MAP_BY_CHAR } from '../config/keymap';

export interface ProgressionStepResult {
  isCorrect: boolean;
  isStageCompleted: boolean;
  expectedChar: string;
  actualKey: string;
  cursor: number;
  totalLength: number;
  deltaMs: number;
  targetFinger?: string;
  targetFingerColor?: string;
}

export interface ProgressionStageEvaluation {
  stage: ProgressionStage;
  passed: boolean;
  accuracy: number;
  stdDevLatency: number;
  netWpm: number;
  totalErrors: number;
}

export class ProgressionEngine {
  private lastKeystrokeTime: number = 0;
  private latencies: number[] = [];

  public startStage(_stage: ProgressionStage): void {
    this.lastKeystrokeTime = performance.now();
    this.latencies = [];
  }

  public getExpectedChar(stage: ProgressionStage, cursor: number): string {
    if (cursor < stage.practiceSequence.length) {
      return stage.practiceSequence[cursor];
    }
    return '';
  }

  public evaluateInput(
    key: string,
    stage: ProgressionStage,
    gameState: GameState
  ): ProgressionStepResult {
    const now = performance.now();
    const deltaMs = this.lastKeystrokeTime > 0 ? (now - this.lastKeystrokeTime) : 100;
    this.lastKeystrokeTime = now;

    if (deltaMs < 4000) {
      this.latencies.push(deltaMs);
      if (this.latencies.length > 50) this.latencies.shift();
    }

    const expected = this.getExpectedChar(stage, gameState.progressionCursor);
    const isCorrect = key.toLowerCase() === expected.toLowerCase() || (expected === ' ' && key === ' ');

    const keyMeta = KEY_MAP_BY_CHAR[expected.toLowerCase()];

    if (isCorrect) {
      gameState.progressionCursor++;
      gameState.correctKeystrokes++;
      gameState.totalKeystrokes++;
      gameState.combo++;
      if (gameState.combo > gameState.maxCombo) gameState.maxCombo = gameState.combo;
      gameState.score += 100 + (gameState.combo * 5);
      gameState.perfectCount++;
    } else {
      gameState.totalKeystrokes++;
      gameState.uniqueErrors++;
      gameState.combo = 0;
      gameState.missCount++;
    }

    const isStageCompleted = gameState.progressionCursor >= stage.practiceSequence.length;

    // Próxima tecla para iluminación dactilar
    const nextExpected = this.getExpectedChar(stage, gameState.progressionCursor);
    const nextKeyMeta = KEY_MAP_BY_CHAR[nextExpected.toLowerCase()];
    if (nextKeyMeta) {
      gameState.targetFinger = nextKeyMeta.finger;
      gameState.targetFingerColor = nextKeyMeta.color;
    }

    return {
      isCorrect,
      isStageCompleted,
      expectedChar: expected,
      actualKey: key,
      cursor: gameState.progressionCursor,
      totalLength: stage.practiceSequence.length,
      deltaMs,
      targetFinger: keyMeta ? keyMeta.finger : undefined,
      targetFingerColor: keyMeta ? keyMeta.color : undefined
    };
  }

  public getLatencyStdDev(): number {
    if (this.latencies.length < 2) return 0;
    const mean = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
    const variance = this.latencies.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (this.latencies.length - 1);
    return Math.sqrt(variance);
  }

  public evaluateStageCompletion(
    stage: ProgressionStage,
    gameState: GameState
  ): ProgressionStageEvaluation {
    const accuracy = gameState.getAccuracy();
    const stdDev = this.getLatencyStdDev();
    const netWpm = gameState.getNetWpm();

    // Criterios objetivos de NotebookLM: Precisión >= 95% y σL < 150 ms
    const passed = accuracy >= stage.minAccuracy && stdDev <= stage.maxStdDevMs;

    return {
      stage,
      passed,
      accuracy,
      stdDevLatency: stdDev,
      netWpm,
      totalErrors: gameState.uniqueErrors
    };
  }
}
