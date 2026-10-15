/**
 * Modal de Resultados y Fin de Canción (Results Screen)
 * Muestra el rango de maestría (S, A, B, C, D), métricas finales,
 * desglose de juicios y opciones para repetir, cambiar dificultad o avanzar.
 */

import { GameState } from '../state/GameState';
import { BeatmapData } from '../config/songs';
import { DifficultyPreset } from '../config/difficulty';
import { ScoreManager } from '../config/scores';

export interface ResultsActions {
  onReplay: () => void;
  onNextSong: () => void;
  onChangeDifficulty: (preset: DifficultyPreset) => void;
  onReturnToHome: () => void;
}

export class ResultsModal {
  private overlay: HTMLDivElement;
  private actions: ResultsActions;

  constructor(actions: ResultsActions) {
    this.actions = actions;

    this.overlay = document.createElement('div');
    this.overlay.id = 'results-modal';
    this.overlay.className = 'modal-backdrop hidden';
    document.body.appendChild(this.overlay);
  }

  public show(gameState: GameState, track: BeatmapData, stdDevLatency: number): void {
    this.overlay.classList.remove('hidden');
    this.render(gameState, track, stdDevLatency);
  }

  public hide(): void {
    this.overlay.classList.add('hidden');
  }

  private calculateGrade(acc: number): { grade: string; color: string; desc: string } {
    if (acc >= 95) return { grade: 'S', color: '#10B981', desc: '¡Maestría Rítmica Sobresaliente!' };
    if (acc >= 90) return { grade: 'A', color: '#00C2E0', desc: '¡Excelente coordinación dactilar!' };
    if (acc >= 80) return { grade: 'B', color: '#3B82F6', desc: '¡Muy buen ritmo y memoria motora!' };
    if (acc >= 70) return { grade: 'C', color: '#F59E0B', desc: '¡Buen intento! Continúa practicando.' };
    return { grade: 'D', color: '#EF4444', desc: '¡Sigue entrenando la Casa Base!' };
  }

  private render(gameState: GameState, track: BeatmapData, stdDevLatency: number): void {
    const acc = gameState.getAccuracy();
    const netWpm = gameState.getNetWpm();
    const grossWpm = gameState.getGrossWpm();
    const gradeInfo = this.calculateGrade(acc);

    const recordResult = ScoreManager.saveResult(
      track.id,
      gameState.score,
      acc,
      gameState.maxCombo,
      netWpm,
      gradeInfo.grade as 'S' | 'A' | 'B' | 'C' | 'D'
    );

    this.overlay.innerHTML = `
      <div class="modal-card results-card">
        ${recordResult.isNewHighScore ? `
          <div class="new-record-pill">
            ✨ ¡NUEVO RÉCORD PERSONAL! ✨
          </div>
        ` : ''}
        <header class="results-header">
          <div class="grade-badge" style="border-color: ${gradeInfo.color}; color: ${gradeInfo.color}">
            ${gradeInfo.grade}
          </div>
          <div class="results-titles">
            <h2 class="results-song">${track.title}</h2>
            <p class="results-artist">${track.artist} • ${track.bpm} BPM</p>
            <p class="results-praise" style="color: ${gradeInfo.color}">${gradeInfo.desc}</p>
          </div>
        </header>

        <!-- Métricas Principales -->
        <div class="results-stats-grid">
          <div class="r-stat-box">
            <span class="r-label">PUNTUACIÓN</span>
            <span class="r-val val-score">${gameState.score.toLocaleString()}</span>
          </div>
          <div class="r-stat-box">
            <span class="r-label">PRECISIÓN</span>
            <span class="r-val" style="color: ${gradeInfo.color}">${acc}%</span>
          </div>
          <div class="r-stat-box">
            <span class="r-label">WPM NETO</span>
            <span class="r-val">${netWpm} <small>(${grossWpm} brutas)</small></span>
          </div>
          <div class="r-stat-box">
            <span class="r-label">COMBO MÁXIMO</span>
            <span class="r-val val-cyan">${gameState.maxCombo}x</span>
          </div>
        </div>

        <!-- Desglose de Juicios Rítmicos -->
        <div class="results-breakdown">
          <div class="b-item b-perfect">
            <span class="b-dot"></span>
            <span class="b-name">PERFECT</span>
            <span class="b-num">${gameState.perfectCount}</span>
          </div>
          <div class="b-item b-great">
            <span class="b-dot"></span>
            <span class="b-name">GREAT</span>
            <span class="b-num">${gameState.greatCount}</span>
          </div>
          <div class="b-item b-good">
            <span class="b-dot"></span>
            <span class="b-name">GOOD</span>
            <span class="b-num">${gameState.goodCount}</span>
          </div>
          <div class="b-item b-miss">
            <span class="b-dot"></span>
            <span class="b-name">MISS</span>
            <span class="b-num">${gameState.missCount}</span>
          </div>
        </div>

        <!-- Diagnóstico Neuropedagógico -->
        <div class="results-diagnosis">
          <span class="d-icon">🧠</span>
          <p class="d-text">
            <strong>Estabilidad Motora (σL): ${Math.round(stdDevLatency)} ms</strong> — 
            ${stdDevLatency < 150 
              ? 'Tus movimientos están automatizados en los ganglios basales sin vacilación.' 
              : 'Continúa practicando con el metrónomo para reducir la variación en cada tecla.'}
          </p>
        </div>

        <!-- Acciones: Repetir, Dificultad, Siguiente, Inicio -->
        <footer class="results-actions">
          <button id="btn-res-replay" class="btn-primary-glow">
            🔁 Repetir Canción
          </button>
          <button id="btn-res-next" class="btn-glass">
            ⏭️ Siguiente Canción
          </button>
          <div class="diff-quick-select">
            <span class="diff-q-label">Dificultad:</span>
            <button class="btn-diff-mini" data-preset="beginner">🟢 Niños</button>
            <button class="btn-diff-mini" data-preset="normal">🟡 Intermedio</button>
            <button class="btn-diff-mini" data-preset="expert">🔴 Desafío</button>
          </div>
          <button id="btn-res-home" class="btn-glass btn-home">
            🏠 Menú Principal
          </button>
        </footer>
      </div>
    `;

    // Listeners
    const btnReplay = this.overlay.querySelector('#btn-res-replay');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        this.hide();
        this.actions.onReplay();
      });
    }

    const btnNext = this.overlay.querySelector('#btn-res-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.hide();
        this.actions.onNextSong();
      });
    }

    const btnHome = this.overlay.querySelector('#btn-res-home');
    if (btnHome) {
      btnHome.addEventListener('click', () => {
        this.hide();
        this.actions.onReturnToHome();
      });
    }

    const diffBtns = this.overlay.querySelectorAll('.btn-diff-mini');
    diffBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const p = (e.currentTarget as HTMLElement).getAttribute('data-preset') as DifficultyPreset;
        this.hide();
        this.actions.onChangeDifficulty(p);
      });
    });
  }
}
