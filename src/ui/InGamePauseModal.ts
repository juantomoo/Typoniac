/**
 * Modal de Pausa en Partida (In-Game Pause)
 * Permite pausar el ritmo sin estrés motor, revisar estadísticas actuales,
 * calibrar volumen/dificultad o reiniciar la pista.
 */

import { BeatmapData } from '../config/songs';
import { GameState } from '../state/GameState';

export interface InGamePauseActions {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onReturnToHome: () => void;
}

export class InGamePauseModal {
  private overlay: HTMLDivElement;
  private actions: InGamePauseActions;

  constructor(actions: InGamePauseActions) {
    this.actions = actions;

    this.overlay = document.createElement('div');
    this.overlay.id = 'ingame-pause-modal';
    this.overlay.className = 'modal-backdrop hidden';
    document.body.appendChild(this.overlay);
  }

  public show(track: BeatmapData | null, gameState: GameState): void {
    this.render(track, gameState);
    this.overlay.classList.remove('hidden');
  }

  public hide(): void {
    this.overlay.classList.add('hidden');
  }

  private render(track: BeatmapData | null, gameState: GameState): void {
    const acc = gameState.getAccuracy();
    const netWpm = gameState.getNetWpm();

    this.overlay.innerHTML = `
      <div class="modal-card pause-ingame-card">
        <header class="pause-header">
          <div class="pause-badge">⏸️ JUEGO EN PAUSA</div>
          <h2 class="pause-track-title">${track ? track.title : 'Canción en Pausa'}</h2>
          <p class="pause-track-sub">${track ? `${track.artist} • ${track.bpm} BPM` : ''}</p>
        </header>

        <!-- Resumen Rápido de Estado -->
        <div class="pause-live-stats">
          <div class="p-stat">
            <span class="p-lbl">PUNTOS</span>
            <span class="p-val">${gameState.score.toLocaleString()}</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">PRECISIÓN</span>
            <span class="p-val val-cyan">${acc}%</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">COMBO</span>
            <span class="p-val">${gameState.combo}x</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">WPM NETO</span>
            <span class="p-val">${netWpm}</span>
          </div>
        </div>

        <div class="pause-actions">
          <button id="btn-pause-resume" class="btn-primary-glow btn-wide">
            ▶️ Continuar Tocando
          </button>
          <button id="btn-pause-restart" class="btn-glass btn-wide">
            🔁 Reiniciar Canción
          </button>
          <button id="btn-pause-settings" class="btn-glass btn-wide">
            ⚙️ Ajustes y Dificultad
          </button>
          <button id="btn-pause-home" class="btn-glass btn-wide btn-home">
            🏠 Volver al Menú Principal
          </button>
        </div>

        <footer class="pause-tip">
          <p>💡 <em>Tip neuropedagógico: Si sientes tensión en tus muñecas, suelta los hombros y respira profundamente antes de continuar.</em></p>
        </footer>
      </div>
    `;

    this.overlay.querySelector('#btn-pause-resume')?.addEventListener('click', () => {
      this.hide();
      this.actions.onResume();
    });

    this.overlay.querySelector('#btn-pause-restart')?.addEventListener('click', () => {
      this.hide();
      this.actions.onRestart();
    });

    this.overlay.querySelector('#btn-pause-settings')?.addEventListener('click', () => {
      this.actions.onOpenSettings();
    });

    this.overlay.querySelector('#btn-pause-home')?.addEventListener('click', () => {
      this.hide();
      this.actions.onReturnToHome();
    });
  }
}
