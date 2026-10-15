/**
 * Monitor de Diagnóstico y Debug Tester Permanente
 * Arquitectura de alto rendimiento: DOM estático con actualización directa de nodos de texto.
 */

import { AudioEngine } from '../core/AudioEngine';
import { RhythmEngine, HitResult } from '../core/RhythmEngine';
import { GameState } from '../state/GameState';

export class DebugTester {
  private container: HTMLDivElement;
  private isVisible: boolean = true;
  public isBotEnabled: boolean = false;
  private botAccuracyMode: 'perfect' | 'humanized' = 'perfect';

  private fps: number = 60;
  private frameCount: number = 0;
  private lastFpsUpdate: number = performance.now();

  private logEntries: { time: string; char: string; judgment: string; deltaMs: number; valid: boolean }[] = [];
  private lastHit: HitResult | null = null;

  // Referencias directas al DOM
  private elFps!: HTMLElement;
  private elClock!: HTMLElement;
  private elWpm!: HTMLElement;
  private elAccuracy!: HTMLElement;
  private elStdDev!: HTMLElement;
  private elErrors!: HTMLElement;
  private elLastHit!: HTMLElement;
  private elLogList!: HTMLElement;
  private elModeTag!: HTMLElement;
  private btnBot!: HTMLButtonElement;
  private lastBotStepTime: number = 0;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'debug-tester-overlay';
    this.container.className = 'debug-tester';
    document.body.appendChild(this.container);

    this.buildStaticDom();

    // Atajo F3 para alternar visibilidad
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F3') {
        e.preventDefault();
        this.toggleVisibility();
      }
    });
  }

  private buildStaticDom(): void {
    this.container.innerHTML = `
      <div class="dbg-header">
        <div class="dbg-header-left">
          <span class="dbg-title">🛠️ DEBUG MONITOR</span>
          <span id="dbg-mode-tag" class="dbg-mode-tag">RITMO</span>
        </div>
        <div class="dbg-controls">
          <button id="dbg-btn-reset" class="dbg-btn" title="Reiniciar estadísticas">🔄 Reset</button>
          <button id="dbg-btn-bot" class="dbg-btn">🤖 BOT: OFF</button>
          <button id="dbg-btn-hide" class="dbg-btn-icon" title="Ocultar (F3)">✕</button>
        </div>
      </div>

      <div class="dbg-grid">
        <div class="dbg-metric">
          <span class="dbg-label">FPS CANVAS</span>
          <span id="dbg-fps" class="dbg-val c-good">60 FPS</span>
        </div>
        <div class="dbg-metric">
          <span class="dbg-label">AUDIO CLOCK</span>
          <span id="dbg-clock" class="dbg-val">0.000s</span>
        </div>
        <div class="dbg-metric">
          <span class="dbg-label">WPM (NETO / BRUTO)</span>
          <span id="dbg-wpm" class="dbg-val">0 / 0</span>
        </div>
        <div class="dbg-metric">
          <span class="dbg-label">PRECISIÓN</span>
          <span id="dbg-acc" class="dbg-val">100%</span>
        </div>
        <div class="dbg-metric">
          <span class="dbg-label">ESTABILIDAD σL</span>
          <span id="dbg-std" class="dbg-val">0 ms</span>
        </div>
        <div class="dbg-metric">
          <span class="dbg-label">ERRORES / TOTAL</span>
          <span id="dbg-err" class="dbg-val">0 / 0</span>
        </div>
      </div>

      <div class="dbg-section">
        <span class="dbg-label">ÚLTIMO IMPACTO:</span>
        <div id="dbg-lasthit" class="dbg-hit-row">Esperando tecla...</div>
      </div>

      <div class="dbg-section">
        <span class="dbg-label">REGISTRO DE LATENCIAS (ÚLTIMAS 8 TECLAS):</span>
        <div id="dbg-logs" class="dbg-log-list"></div>
      </div>
    `;

    this.elFps = this.container.querySelector('#dbg-fps')!;
    this.elClock = this.container.querySelector('#dbg-clock')!;
    this.elWpm = this.container.querySelector('#dbg-wpm')!;
    this.elAccuracy = this.container.querySelector('#dbg-acc')!;
    this.elStdDev = this.container.querySelector('#dbg-std')!;
    this.elErrors = this.container.querySelector('#dbg-err')!;
    this.elLastHit = this.container.querySelector('#dbg-lasthit')!;
    this.elLogList = this.container.querySelector('#dbg-logs')!;
    this.elModeTag = this.container.querySelector('#dbg-mode-tag')!;
    this.btnBot = this.container.querySelector('#dbg-btn-bot')!;

    const btnReset = this.container.querySelector('#dbg-btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.resetLogsAndStats();
      });
    }

    this.btnBot.addEventListener('click', () => {
      if (!this.isBotEnabled) {
        this.isBotEnabled = true;
        this.botAccuracyMode = 'perfect';
      } else if (this.botAccuracyMode === 'perfect') {
        this.botAccuracyMode = 'humanized';
      } else {
        this.isBotEnabled = false;
      }
      this.updateBotButtonState();
    });

    const btnHide = this.container.querySelector('#dbg-btn-hide');
    if (btnHide) {
      btnHide.addEventListener('click', () => this.toggleVisibility());
    }
  }

  public resetLogsAndStats(): void {
    this.logEntries = [];
    this.lastHit = null;
    this.elLogList.innerHTML = '';
    this.elLastHit.innerHTML = 'Esperando tecla...';
  }

  private updateBotButtonState(): void {
    if (this.isBotEnabled) {
      this.btnBot.textContent = `🤖 BOT: ON (${this.botAccuracyMode})`;
      this.btnBot.className = 'dbg-btn dbg-btn-active';
    } else {
      this.btnBot.textContent = '🤖 BOT: OFF';
      this.btnBot.className = 'dbg-btn';
    }
  }

  public toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
  }

  public recordHit(hit: HitResult): void {
    this.lastHit = hit;
    const now = new Date();
    const timeStr = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    this.logEntries.unshift({
      time: timeStr,
      char: hit.char === ' ' ? 'ESP' : hit.char.toUpperCase(),
      judgment: hit.judgment,
      deltaMs: Math.round(hit.deltaMs),
      valid: hit.isBiomechanicallyValid
    });

    if (this.logEntries.length > 8) {
      this.logEntries.pop();
    }

    // Render de los logs únicamente al recibir un nuevo hit
    this.elLogList.innerHTML = this.logEntries.map(e => `
      <div class="dbg-log-item">
        <span class="dbg-log-time">${e.time}</span>
        <span class="dbg-log-char">[${e.char}]</span>
        <span class="badge-${e.judgment.toLowerCase()}">${e.judgment}</span>
        <span class="dbg-log-delta">${e.deltaMs > 0 ? '+' : ''}${e.deltaMs}ms</span>
        <span class="dbg-log-valid">${e.valid ? '✓' : '⚠️ Asim.'}</span>
      </div>
    `).join('');
  }

  public update(
    audioEngine: AudioEngine,
    rhythmEngine: RhythmEngine,
    gameState: GameState
  ): void {
    // Cálculo de FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      this.elFps.textContent = `${this.fps} FPS`;
      this.elFps.className = `dbg-val ${this.fps >= 55 ? 'c-good' : 'c-warn'}`;
    }

    if (!this.isVisible) return;

    // Actualizar Tag de Modo
    if (this.elModeTag) {
      this.elModeTag.textContent = gameState.gameMode.toUpperCase();
      this.elModeTag.className = `dbg-mode-tag tag-${gameState.gameMode}`;
    }

    if (gameState.gameMode === 'rhythm') {
      const masterTime = audioEngine.getMasterTime();
      const stdDev = Math.round(rhythmEngine.getLatencyStdDev());
      const grossWpm = gameState.getGrossWpm();
      const netWpm = gameState.getNetWpm();
      const accuracy = gameState.getAccuracy();

      this.elClock.textContent = `${masterTime.toFixed(3)}s`;
      this.elWpm.textContent = `${netWpm} / ${grossWpm}`;
      this.elAccuracy.textContent = `${accuracy}%`;
      this.elStdDev.textContent = `${stdDev} ms`;
      this.elErrors.textContent = `${gameState.uniqueErrors} / ${gameState.totalKeystrokes}`;
    } else if (gameState.gameMode === 'progression') {
      this.elClock.textContent = 'En vivo';
      this.elWpm.textContent = '-';
      this.elAccuracy.textContent = `${gameState.progressionAccuracy}%`;
      this.elStdDev.textContent = `${gameState.progressionJitter} ms`;
      const total = gameState.progressionCorrect + gameState.progressionMistakes;
      this.elErrors.textContent = `${gameState.progressionMistakes} / ${total}`;
    } else if (gameState.gameMode === 'zen') {
      this.elClock.textContent = `${Math.floor(gameState.zenTimeElapsed)}s`;
      this.elWpm.textContent = `${gameState.zenWpm} WPM`;
      this.elAccuracy.textContent = `${gameState.zenAccuracy}%`;
      this.elStdDev.textContent = 'Zen';
      this.elErrors.textContent = `${gameState.zenMistakes} / ${gameState.zenKeystrokes}`;
    }

    if (this.lastHit) {
      this.elLastHit.innerHTML = `
        <span class="badge-${this.lastHit.judgment.toLowerCase()}">${this.lastHit.judgment}</span>
        ${Math.round(this.lastHit.deltaMs)}ms (Dedo: ${this.lastHit.expectedFinger})
      `;
    }
  }

  public getBotAction(activeNotes: { id: string; char: string; time: number }[], masterTime: number): string | null {
    if (!this.isBotEnabled || activeNotes.length === 0) return null;

    for (const note of activeNotes) {
      const diff = masterTime - note.time;
      if (this.botAccuracyMode === 'perfect') {
        if (Math.abs(diff) <= 0.035) {
          return note.char;
        }
      } else {
        if (diff >= -0.020 && diff <= 0.025) {
          if (Math.random() > 0.08) {
            return note.char;
          }
        }
      }
    }
    return null;
  }

  public getBotProgressionAction(sequence: string, cursor: number): string | null {
    if (!this.isBotEnabled || cursor >= sequence.length) return null;
    const now = performance.now();
    const interval = this.botAccuracyMode === 'perfect' ? 180 : 320 + Math.random() * 80;
    if (now - this.lastBotStepTime > interval) {
      this.lastBotStepTime = now;
      if (this.botAccuracyMode === 'humanized' && Math.random() < 0.06) {
        return 'x';
      }
      return sequence[cursor];
    }
    return null;
  }

  public getBotZenAction(text: string, cursor: number): string | null {
    if (!this.isBotEnabled || cursor >= text.length) return null;
    const now = performance.now();
    const interval = this.botAccuracyMode === 'perfect' ? 140 : 250 + Math.random() * 90;
    if (now - this.lastBotStepTime > interval) {
      this.lastBotStepTime = now;
      if (this.botAccuracyMode === 'humanized' && Math.random() < 0.04) {
        return 'e';
      }
      return text[cursor];
    }
    return null;
  }
}
