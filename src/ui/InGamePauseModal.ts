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

  public isOpen(): boolean {
    return !this.overlay.classList.contains('hidden');
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

    let badgeText = '⏸️ JUEGO EN PAUSA';
    let titleText = 'Actividad en Pausa';
    let subText = '';
    let stat1Lbl = 'PUNTOS';
    let stat1Val = gameState.score.toLocaleString();
    let stat2Lbl = 'PRECISIÓN';
    let stat2Val = `${acc}%`;
    let stat3Lbl = 'COMBO';
    let stat3Val = `${gameState.combo}x`;
    let stat4Lbl = 'WPM NETO';
    let stat4Val = `${netWpm}`;
    let restartBtnText = '🔁 Reiniciar Canción';
    let resumeBtnText = '▶️ Continuar Jugando';

    if (gameState.gameMode === 'progression' && gameState.currentProgressionStage) {
      const stage = gameState.currentProgressionStage;
      badgeText = '⏸️ LECCIÓN EN PAUSA';
      titleText = stage.title;
      subText = `${stage.levelTitle} • Etapa ${stage.stageNumber}`;
      stat1Lbl = 'PROGRESO';
      stat1Val = `${gameState.progressionCursor} / ${stage.practiceSequence.length}`;
      stat2Lbl = 'PRECISIÓN';
      stat2Val = `${gameState.progressionAccuracy}%`;
      stat3Lbl = 'RACHA';
      stat3Val = `${gameState.combo}x`;
      stat4Lbl = 'JITTER';
      stat4Val = `${gameState.progressionJitter} ms`;
      restartBtnText = '🔁 Reiniciar Lección';
      resumeBtnText = '▶️ Continuar Lección';
    } else if (gameState.gameMode === 'zen' && gameState.currentZenText) {
      const zen = gameState.currentZenText;
      badgeText = '⏸️ LECTURA EN PAUSA';
      titleText = zen.title;
      subText = `${zen.author} • ${zen.categoryTitle}`;
      stat1Lbl = 'PROGRESO';
      stat1Val = `${gameState.zenCursor} / ${zen.text.length}`;
      stat2Lbl = 'PRECISIÓN';
      stat2Val = `${gameState.zenAccuracy}%`;
      stat3Lbl = 'WPM';
      stat3Val = `${gameState.zenWpm}`;
      stat4Lbl = 'TIEMPO';
      stat4Val = `${Math.floor(gameState.zenTimeElapsed)}s`;
      restartBtnText = '🔁 Reiniciar Lectura';
      resumeBtnText = '▶️ Continuar Escritura';
    } else if (track) {
      badgeText = '⏸️ JUEGO EN PAUSA';
      titleText = track.title;
      subText = `${track.artist} • ${track.bpm} BPM`;
      stat1Lbl = 'PUNTOS';
      stat1Val = gameState.score.toLocaleString();
      stat2Lbl = 'PRECISIÓN';
      stat2Val = `${acc}%`;
      stat3Lbl = 'COMBO';
      stat3Val = `${gameState.combo}x`;
      stat4Lbl = 'WPM NETO';
      stat4Val = `${netWpm}`;
      restartBtnText = '🔁 Reiniciar Canción';
      resumeBtnText = '▶️ Continuar Tocando';
    }

    this.overlay.innerHTML = `
      <div class="modal-card pause-ingame-card">
        <header class="pause-header">
          <div class="pause-badge">${badgeText}</div>
          <h2 class="pause-track-title">${titleText}</h2>
          <p class="pause-track-sub">${subText}</p>
        </header>

        <!-- Resumen Rápido de Estado -->
        <div class="pause-live-stats">
          <div class="p-stat">
            <span class="p-lbl">${stat1Lbl}</span>
            <span class="p-val">${stat1Val}</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">${stat2Lbl}</span>
            <span class="p-val val-cyan">${stat2Val}</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">${stat3Lbl}</span>
            <span class="p-val">${stat3Val}</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">${stat4Lbl}</span>
            <span class="p-val">${stat4Val}</span>
          </div>
        </div>

        <div class="pause-actions">
          <button id="btn-pause-resume" class="btn-primary-glow btn-wide">
            ${resumeBtnText}
          </button>
          <button id="btn-pause-restart" class="btn-glass btn-wide">
            ${restartBtnText}
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
