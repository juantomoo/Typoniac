/**
 * Interfaz de Usuario de Alta Fidelidad (HUD)
 * Arquitectura de alto rendimiento: DOM estático con actualización directa de nodos de texto.
 */

import { GameState, FadeMode } from '../state/GameState';
import { HygieneTimer } from '../core/HygieneTimer';

export interface HUDCallbacks {
  onSelectFadeMode: (mode: FadeMode) => void;
  onOpenSongSelect: () => void;
  onReturnToHome: () => void;
  onOpenSettings: () => void;
  onPauseGame: () => void;
}

export class HUD {
  private container: HTMLDivElement;
  private callbacks: HUDCallbacks;
  private lastTrackId: string | null = null;

  // Nodos DOM estáticos
  private elSongTitle!: HTMLElement;
  private elSongSub!: HTMLElement;
  private elPhaseBadge!: HTMLElement;
  private elWpmVal!: HTMLElement;
  private elWpmSub!: HTMLElement;
  private elAccuracyVal!: HTMLElement;
  private elComboVal!: HTMLElement;
  private elStdDevVal!: HTMLElement;
  private elHygieneVal!: HTMLElement;
  private fadeBtns: NodeListOf<HTMLButtonElement> | null = null;

  constructor(callbacks: HUDCallbacks) {
    this.callbacks = callbacks;

    this.container = document.createElement('div');
    this.container.id = 'hud-overlay';
    this.container.className = 'hud-container';
    document.body.appendChild(this.container);

    this.buildStaticDom();
  }

  private buildStaticDom(): void {
    this.container.innerHTML = `
      <header class="hud-header">
        <div class="hud-left">
          <button id="btn-hud-home" class="btn-glass btn-home" title="Volver al Menú Principal">
            <span class="icon">🏠</span>
            <span class="btn-text">Inicio</span>
          </button>

          <button id="btn-song-select" class="btn-glass" title="Cambiar Canción">
            <span class="icon">🎵</span>
            <div class="song-meta">
              <span id="hud-song-title" class="song-title">Cargando...</span>
              <span id="hud-song-sub" class="song-sub">-- BPM</span>
            </div>
          </button>

          <div id="hud-phase-badge" class="phase-badge phase-1">Nivel 1</div>
        </div>

        <div class="hud-center">
          <div class="stat-pill">
            <span class="stat-label">WPM</span>
            <span id="hud-wpm-val" class="stat-val">0</span>
            <span id="hud-wpm-sub" class="stat-sub">(0 brutas)</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">PRECISIÓN</span>
            <span id="hud-acc-val" class="stat-val">100%</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">COMBO</span>
            <span id="hud-combo-val" class="stat-val val-cyan">0x</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">ESTABILIDAD σL</span>
            <span id="hud-std-val" class="stat-val">0 ms</span>
          </div>
        </div>

        <div class="hud-right">
          <button id="btn-hud-pause" class="btn-glass btn-icon-only" title="Pausar Partida (Esc)">
            ⏸️
          </button>

          <button id="btn-hud-settings" class="btn-glass btn-icon-only" title="Ajustes y Calibración de Dificultad">
            ⚙️
          </button>

          <div class="fade-selector" title="Atenuación Visual (Fitts & Posner)">
            <button class="fade-btn active" data-fade="1.0">100%</button>
            <button class="fade-btn" data-fade="0.5">50%</button>
            <button class="fade-btn" data-fade="0.0">Modo Ciego</button>
          </div>

          <div class="hygiene-pill" title="Pausa activa sugerida cada 15 min">
            <span class="hygiene-icon">⏳</span>
            <span id="hud-hygiene-val" class="hygiene-val">15:00</span>
          </div>
        </div>
      </header>
    `;

    this.elSongTitle = this.container.querySelector('#hud-song-title')!;
    this.elSongSub = this.container.querySelector('#hud-song-sub')!;
    this.elPhaseBadge = this.container.querySelector('#hud-phase-badge')!;
    this.elWpmVal = this.container.querySelector('#hud-wpm-val')!;
    this.elWpmSub = this.container.querySelector('#hud-wpm-sub')!;
    this.elAccuracyVal = this.container.querySelector('#hud-acc-val')!;
    this.elComboVal = this.container.querySelector('#hud-combo-val')!;
    this.elStdDevVal = this.container.querySelector('#hud-std-val')!;
    this.elHygieneVal = this.container.querySelector('#hud-hygiene-val')!;
    this.fadeBtns = this.container.querySelectorAll('.fade-btn');

    // Listeners permanentes
    const btnHome = this.container.querySelector('#btn-hud-home');
    if (btnHome) btnHome.addEventListener('click', () => this.callbacks.onReturnToHome());

    const btnSelect = this.container.querySelector('#btn-song-select');
    if (btnSelect) btnSelect.addEventListener('click', () => this.callbacks.onOpenSongSelect());

    const btnPause = this.container.querySelector('#btn-hud-pause');
    if (btnPause) btnPause.addEventListener('click', () => this.callbacks.onPauseGame());

    const btnSettings = this.container.querySelector('#btn-hud-settings');
    if (btnSettings) btnSettings.addEventListener('click', () => this.callbacks.onOpenSettings());

    this.fadeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = parseFloat((e.currentTarget as HTMLElement).getAttribute('data-fade') || '1.0') as FadeMode;
        this.callbacks.onSelectFadeMode(val);
        this.updateFadeButtons(val);
      });
    });
  }

  private updateFadeButtons(currentMode: FadeMode): void {
    if (!this.fadeBtns) return;
    this.fadeBtns.forEach(btn => {
      const mode = parseFloat(btn.getAttribute('data-fade') || '1.0');
      if (mode === currentMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  public update(gameState: GameState, hygieneTimer: HygieneTimer, latencyStdDev: number): void {
    const track = gameState.currentTrack;
    if (!track) {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'block';

    // Actualizar metadatos de pista solo al cambiar
    if (this.lastTrackId !== track.id) {
      this.lastTrackId = track.id;
      this.elSongTitle.textContent = track.title;
      this.elSongSub.textContent = `${track.artist} • ${track.bpm} BPM`;
      this.elPhaseBadge.textContent = `Nivel ${track.level} • ${track.age}`;
      this.elPhaseBadge.className = `phase-badge phase-${track.level}`;
    }

    const netWpm = gameState.getNetWpm();
    const grossWpm = gameState.getGrossWpm();
    const accuracy = gameState.getAccuracy();

    this.elWpmVal.textContent = netWpm.toString();
    this.elWpmVal.className = `stat-val ${netWpm >= 20 ? 'val-high' : ''}`;
    this.elWpmSub.textContent = `(${grossWpm} brutas)`;

    this.elAccuracyVal.textContent = `${accuracy}%`;
    this.elAccuracyVal.className = `stat-val ${accuracy >= 90 ? 'val-high' : ''}`;

    this.elComboVal.textContent = `${gameState.combo}x`;
    this.elStdDevVal.textContent = `${Math.round(latencyStdDev)} ms`;
    this.elHygieneVal.textContent = hygieneTimer.getFormattedRemaining();

    this.updateFadeButtons(gameState.visualFadeOpacity);
  }
}
