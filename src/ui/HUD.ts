/**
 * Interfaz de Usuario de Alta Fidelidad (HUD)
 * Muestra métricas en tiempo real: WPM Bruto/Neto, Precisión %, Combo,
 * Selector de Atenuación Visual (100%, 50%, 0%) y Temporizador de Higiene Digital.
 */

import { GameState, FadeMode } from '../state/GameState';
import { HygieneTimer } from '../core/HygieneTimer';

export class HUD {
  private container: HTMLDivElement;
  private onSelectFadeMode: (mode: FadeMode) => void;
  private onOpenSongSelect: () => void;

  constructor(
    onSelectFadeMode: (mode: FadeMode) => void,
    onOpenSongSelect: () => void
  ) {
    this.onSelectFadeMode = onSelectFadeMode;
    this.onOpenSongSelect = onOpenSongSelect;

    this.container = document.createElement('div');
    this.container.id = 'hud-overlay';
    this.container.className = 'hud-container';
    document.body.appendChild(this.container);
  }

  public update(gameState: GameState, hygieneTimer: HygieneTimer, latencyStdDev: number): void {
    const track = gameState.currentTrack;
    if (!track) {
      this.container.innerHTML = '';
      return;
    }

    const netWpm = gameState.getNetWpm();
    const grossWpm = gameState.getGrossWpm();
    const accuracy = gameState.getAccuracy();
    const hygieneTime = hygieneTimer.getFormattedRemaining();

    this.container.innerHTML = `
      <header class="hud-header">
        <div class="hud-left">
          <button id="btn-song-select" class="btn-glass" title="Cambiar Canción">
            <span class="icon">🎵</span>
            <div class="song-meta">
              <span class="song-title">${track.title}</span>
              <span class="song-sub">${track.artist} • ${track.bpm} BPM</span>
            </div>
          </button>
          <div class="phase-badge phase-${track.level}">
            Nivel ${track.level} • ${track.age}
          </div>
        </div>

        <div class="hud-center">
          <div class="stat-pill">
            <span class="stat-label">WPM</span>
            <span class="stat-val ${netWpm >= 20 ? 'val-high' : ''}">${netWpm}</span>
            <span class="stat-sub">(${grossWpm} brutas)</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">PRECISIÓN</span>
            <span class="stat-val ${accuracy >= 92 ? 'val-high' : ''}">${accuracy}%</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">COMBO</span>
            <span class="stat-val val-cyan">${gameState.combo}x</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">ESTABILIDAD σL</span>
            <span class="stat-val">${Math.round(latencyStdDev)} ms</span>
          </div>
        </div>

        <div class="hud-right">
          <!-- Selector de Atenuación Visual Progresiva -->
          <div class="fade-selector" title="Atenuación Visual (Fitts & Posner)">
            <button class="fade-btn ${gameState.visualFadeOpacity === 1.0 ? 'active' : ''}" data-fade="1.0">
              100%
            </button>
            <button class="fade-btn ${gameState.visualFadeOpacity === 0.5 ? 'active' : ''}" data-fade="0.5">
              50%
            </button>
            <button class="fade-btn ${gameState.visualFadeOpacity === 0.0 ? 'active' : ''}" data-fade="0.0">
              Modo Ciego
            </button>
          </div>

          <!-- Higiene Digital -->
          <div class="hygiene-pill" title="Pausa activa sugerida cada 15 min">
            <span class="hygiene-icon">⏳</span>
            <span class="hygiene-val">${hygieneTime}</span>
          </div>
        </div>
      </header>
    `;

    // Event listeners
    const btnSelect = this.container.querySelector('#btn-song-select');
    if (btnSelect) {
      btnSelect.addEventListener('click', () => this.onOpenSongSelect());
    }

    const fadeBtns = this.container.querySelectorAll('.fade-btn');
    fadeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = parseFloat((e.currentTarget as HTMLElement).getAttribute('data-fade') || '1.0') as FadeMode;
        this.onSelectFadeMode(val);
      });
    });
  }
}
