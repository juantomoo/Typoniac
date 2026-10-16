/**
 * Interfaz de Usuario de Alta Fidelidad (HUD)
 * Arquitectura de alto rendimiento: DOM estático con actualización directa de nodos de texto.
 */

import { GameState, FadeMode, GameModeType } from '../state/GameState';
import { HygieneTimer } from '../core/HygieneTimer';

export interface HUDCallbacks {
  onSelectFadeMode: (mode: FadeMode) => void;
  onOpenSongSelect: () => void;
  onOpenProgressionSelect?: () => void;
  onOpenZenSelect?: () => void;
  onReturnToHome: () => void;
  onOpenSettings: () => void;
  onPauseGame: () => void;
}

export class HUD {
  private container: HTMLDivElement;
  private callbacks: HUDCallbacks;
  private lastTrackId: string | null = null;
  private currentMode: GameModeType = 'rhythm';

  // Nodos DOM estáticos
  private elModeIcon!: HTMLElement;
  private elSongTitle!: HTMLElement;
  private elSongSub!: HTMLElement;
  private elPhaseBadge!: HTMLElement;
  private elStat1Lbl!: HTMLElement;
  private elStat2Lbl!: HTMLElement;
  private elStat3Lbl!: HTMLElement;
  private elStat4Lbl!: HTMLElement;
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

          <button id="btn-song-select" class="btn-glass" title="Cambiar Canción o Lección">
            <span class="icon" id="hud-mode-icon">🎵</span>
            <div class="song-meta">
              <span id="hud-song-title" class="song-title">Cargando...</span>
              <span id="hud-song-sub" class="song-sub">-- BPM</span>
            </div>
          </button>

          <div id="hud-phase-badge" class="phase-badge phase-1">Nivel 1</div>
        </div>

        <div class="hud-center">
          <div class="stat-pill">
            <span class="stat-label" id="hud-stat1-lbl">WPM</span>
            <span id="hud-wpm-val" class="stat-val">0</span>
            <span id="hud-wpm-sub" class="stat-sub">(0 brutas)</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label" id="hud-stat2-lbl">PRECISIÓN</span>
            <span id="hud-acc-val" class="stat-val">100%</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label" id="hud-stat3-lbl">COMBO</span>
            <span id="hud-combo-val" class="stat-val val-cyan">0x</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label" id="hud-stat4-lbl">ESTABILIDAD σL</span>
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

    this.elModeIcon = this.container.querySelector('#hud-mode-icon')!;
    this.elSongTitle = this.container.querySelector('#hud-song-title')!;
    this.elSongSub = this.container.querySelector('#hud-song-sub')!;
    this.elPhaseBadge = this.container.querySelector('#hud-phase-badge')!;
    this.elStat1Lbl = this.container.querySelector('#hud-stat1-lbl')!;
    this.elStat2Lbl = this.container.querySelector('#hud-stat2-lbl')!;
    this.elStat3Lbl = this.container.querySelector('#hud-stat3-lbl')!;
    this.elStat4Lbl = this.container.querySelector('#hud-stat4-lbl')!;
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
    if (btnSelect) {
      btnSelect.addEventListener('click', () => {
        if (this.currentMode === 'progression') {
          if (this.callbacks.onOpenProgressionSelect) {
            this.callbacks.onOpenProgressionSelect();
          } else {
            this.callbacks.onOpenSongSelect();
          }
        } else if (this.currentMode === 'zen') {
          if (this.callbacks.onOpenZenSelect) {
            this.callbacks.onOpenZenSelect();
          } else {
            this.callbacks.onOpenSongSelect();
          }
        } else {
          this.callbacks.onOpenSongSelect();
        }
      });
    }

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
    const isPlaying = gameState.currentTrack !== null ||
                      gameState.currentProgressionStage !== null ||
                      gameState.currentZenText !== null;

    if (!isPlaying) {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'block';
    this.currentMode = gameState.gameMode;

    if (gameState.gameMode === 'rhythm' && gameState.currentTrack) {
      const track = gameState.currentTrack;
      if (this.lastTrackId !== track.id) {
        this.lastTrackId = track.id;
        this.elModeIcon.textContent = '🎵';
        this.elSongTitle.textContent = track.title;
        this.elSongSub.textContent = `${track.artist} • ${track.bpm} BPM`;
        this.elPhaseBadge.textContent = `Nivel ${track.level} • ${track.age}`;
        this.elPhaseBadge.className = `phase-badge phase-${track.level}`;
        this.elStat1Lbl.textContent = 'WPM';
        this.elStat2Lbl.textContent = 'PRECISIÓN';
        this.elStat3Lbl.textContent = 'COMBO';
        this.elStat4Lbl.textContent = 'ESTABILIDAD σL';
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
    } else if (gameState.gameMode === 'progression' && gameState.currentProgressionStage) {
      const stage = gameState.currentProgressionStage;
      if (this.lastTrackId !== stage.id) {
        this.lastTrackId = stage.id;
        this.elModeIcon.textContent = '⌨️';
        this.elSongTitle.textContent = stage.title;
        this.elSongSub.textContent = `${stage.levelTitle} • Teclas: ${stage.newKeys.map(k => k.toUpperCase()).join(' ')}`;
        this.elPhaseBadge.textContent = `Lección ${stage.stageNumber}/20`;
        this.elPhaseBadge.className = 'phase-badge phase-1';
        this.elStat1Lbl.textContent = 'PROGRESO';
        this.elStat2Lbl.textContent = 'PRECISIÓN';
        this.elStat3Lbl.textContent = 'RACHA';
        this.elStat4Lbl.textContent = 'JITTER σL';
      }

      this.elWpmVal.textContent = `${gameState.progressionCursor}/${stage.practiceSequence.length}`;
      this.elWpmVal.className = 'stat-val';
      this.elWpmSub.textContent = '(teclas)';
      this.elAccuracyVal.textContent = `${gameState.progressionAccuracy}%`;
      this.elAccuracyVal.className = `stat-val ${gameState.progressionAccuracy >= 95 ? 'val-high' : ''}`;
      this.elComboVal.textContent = `${gameState.combo}x`;
      this.elStdDevVal.textContent = `${gameState.progressionJitter} ms`;
    } else if (gameState.gameMode === 'zen' && gameState.currentZenText) {
      const zenItem = gameState.currentZenText;
      if (this.lastTrackId !== zenItem.id) {
        this.lastTrackId = zenItem.id;
        this.elModeIcon.textContent = '🍃';
        this.elSongTitle.textContent = zenItem.title;
        this.elSongSub.textContent = `por ${zenItem.author} • ${zenItem.wordCount} palabras`;
        this.elPhaseBadge.textContent = zenItem.categoryTitle;
        this.elPhaseBadge.className = 'phase-badge phase-zen';
        this.elStat1Lbl.textContent = 'WPM NETO';
        this.elStat2Lbl.textContent = 'PRECISIÓN';
        this.elStat3Lbl.textContent = 'PROGRESO';
        this.elStat4Lbl.textContent = 'TIEMPO';
      }

      const progressPct = Math.round((gameState.zenCursor / Math.max(1, zenItem.text.length)) * 100);
      this.elWpmVal.textContent = gameState.zenWpm.toString();
      this.elWpmVal.className = `stat-val ${gameState.zenWpm >= 30 ? 'val-high' : ''}`;
      this.elWpmSub.textContent = `(${Math.round(gameState.correctKeystrokes / 5)} pal)`;
      this.elAccuracyVal.textContent = `${gameState.zenAccuracy}%`;
      this.elAccuracyVal.className = `stat-val ${gameState.zenAccuracy >= 90 ? 'val-high' : ''}`;
      this.elComboVal.textContent = `${progressPct}%`;
      this.elStdDevVal.textContent = `${Math.floor(gameState.zenTimeElapsed)}s`;
    }

    this.elHygieneVal.textContent = hygieneTimer.getFormattedRemaining();
    this.updateFadeButtons(gameState.visualFadeOpacity);
  }
}
