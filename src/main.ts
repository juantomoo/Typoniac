/**
 * Typoniac — OSU! Light Edition
 * Orquestador principal con Welcome Splash, Modo Tutorial, Botón de Inicio,
 * Modal de Calibración de Dificultad, Tolerancia Rítmica Benévola y Debug Tester.
 */

import { AudioEngine } from './core/AudioEngine';
import { RhythmEngine } from './core/RhythmEngine';
import { AdaptiveLogic } from './core/AdaptiveLogic';
import { HygieneTimer } from './core/HygieneTimer';
import { GameState, FadeMode } from './state/GameState';
import { CanvasRenderer } from './rendering/CanvasRenderer';
import { HUD } from './ui/HUD';
import { SongSelect } from './ui/SongSelect';
import { PauseModal } from './ui/PauseModal';
import { WelcomeSplash } from './ui/WelcomeSplash';
import { TutorialModal } from './ui/TutorialModal';
import { DebugTester } from './ui/DebugTester';
import { SettingsModal } from './ui/SettingsModal';
import { ResultsModal } from './ui/ResultsModal';
import { DifficultyManager, DifficultySettings } from './config/difficulty';
import { CURATED_TRACKS, BeatmapData } from './config/songs';
import { THEME } from './config/theme';

class TyponiacGame {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private audioEngine: AudioEngine;
  private rhythmEngine: RhythmEngine;
  private adaptiveLogic: AdaptiveLogic;
  private hygieneTimer: HygieneTimer;
  private gameState: GameState;
  private difficultyManager: DifficultyManager;

  private hud: HUD;
  private songSelect: SongSelect;
  private pauseModal: PauseModal;
  private welcomeSplash: WelcomeSplash;
  private tutorialModal: TutorialModal;
  private debugTester: DebugTester;
  private settingsModal: SettingsModal;
  private resultsModal: ResultsModal;

  private progressBarFill: HTMLElement | null = null;
  private isRunning: boolean = false;
  private isTutorialActive: boolean = false;
  private isSongCompleted: boolean = false;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.renderer = new CanvasRenderer(this.canvas);
    this.audioEngine = new AudioEngine();
    this.rhythmEngine = new RhythmEngine();
    this.adaptiveLogic = new AdaptiveLogic();
    this.gameState = new GameState();
    this.debugTester = new DebugTester();
    this.difficultyManager = new DifficultyManager();

    // Captura de barra de progreso
    this.progressBarFill = document.getElementById('song-progress-fill');

    // Modales y HUD
    this.pauseModal = new PauseModal(() => this.resumeFromHygienePause());
    this.hygieneTimer = new HygieneTimer(() => this.triggerHygienePause());

    this.resultsModal = new ResultsModal({
      onReplay: () => {
        if (this.gameState.currentTrack) {
          this.loadAndStartTrack(this.gameState.currentTrack);
        }
      },
      onNextSong: () => {
        const cur = this.gameState.currentTrack;
        const curIdx = cur ? CURATED_TRACKS.findIndex(t => t.id === cur.id) : 0;
        const nextIdx = (curIdx + 1) % CURATED_TRACKS.length;
        this.loadAndStartTrack(CURATED_TRACKS[nextIdx]);
      },
      onChangeDifficulty: (preset) => {
        this.difficultyManager.applyPreset(preset);
        if (this.gameState.currentTrack) {
          this.loadAndStartTrack(this.gameState.currentTrack);
        }
      },
      onReturnToHome: () => {
        this.returnToHome();
      }
    });

    this.hud = new HUD({
      onSelectFadeMode: (mode: FadeMode) => this.gameState.setFadeMode(mode),
      onOpenSongSelect: () => this.songSelect.show(),
      onReturnToHome: () => this.returnToHome(),
      onOpenSettings: () => this.settingsModal.show()
    });

    this.songSelect = new SongSelect((track: BeatmapData) => this.loadAndStartTrack(track));

    this.settingsModal = new SettingsModal(this.difficultyManager, {
      onSettingsChanged: (settings: DifficultySettings) => {
        this.audioEngine.setMusicVolume(settings.musicVolume);
        this.audioEngine.setSfxVolume(settings.sfxVolume);
      },
      onTestSound: () => {
        this.audioEngine.init();
        this.audioEngine.playKeyChime(3, true);
      }
    });

    this.tutorialModal = new TutorialModal(
      () => {
        this.isTutorialActive = false;
        this.loadAndStartTrack(CURATED_TRACKS[0]);
      },
      (step) => {
        const col = step.targetKey === 'f' ? 3 : (step.targetKey === 'j' ? 6 : 4);
        this.audioEngine.playKeyChime(col, true);
      }
    );

    this.welcomeSplash = new WelcomeSplash({
      onStartTutorial: () => {
        this.audioEngine.init();
        this.isTutorialActive = true;
        this.tutorialModal.start();
      },
      onSelectSong: (track: BeatmapData) => {
        this.audioEngine.init();
        this.loadAndStartTrack(track);
      },
      onOpenSongCatalog: () => {
        this.audioEngine.init();
        this.songSelect.show();
      },
      onOpenSettings: () => {
        this.audioEngine.init();
        this.settingsModal.show();
      }
    });

    // Aplicar volúmenes iniciales guardados
    const initialSettings = this.difficultyManager.getSettings();
    this.audioEngine.setMusicVolume(initialSettings.musicVolume);
    this.audioEngine.setSfxVolume(initialSettings.sfxVolume);

    this.setupListeners();
  }

  public init(): void {
    (window as any).__typoniacGame = this;
    this.welcomeSplash.show();
    this.isRunning = true;
    requestAnimationFrame(() => this.gameLoop());
  }

  public triggerSongCompletion(): void {
    if (!this.gameState.currentTrack) return;
    this.isSongCompleted = true;
    this.audioEngine.stop();
    if (this.progressBarFill) {
      this.progressBarFill.style.width = '100%';
    }
    const stdDev = this.rhythmEngine.getLatencyStdDev();
    this.resultsModal.show(this.gameState, this.gameState.currentTrack, stdDev);
  }

  public returnToHome(): void {
    this.audioEngine.stop();
    this.resultsModal.hide();
    this.isSongCompleted = false;
    this.gameState.currentTrack = null;
    if (this.progressBarFill) {
      this.progressBarFill.style.width = '0%';
    }
    this.welcomeSplash.show();
  }

  public async loadAndStartTrack(track: BeatmapData): Promise<void> {
    this.audioEngine.init();
    this.audioEngine.stop();
    this.resultsModal.hide();
    this.isSongCompleted = false;
    if (this.progressBarFill) {
      this.progressBarFill.style.width = '0%';
    }
    this.gameState.reset(track);

    this.hygieneTimer.start();
    await this.audioEngine.loadAudio(track.audioUrl);
    this.audioEngine.play(0, track.bpm);
  }

  private setupListeners(): void {
    window.addEventListener('resize', () => {
      this.renderer.handleResize();
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.settingsModal.show();
        return;
      }
      if (e.repeat) return;

      if (this.isTutorialActive) {
        if (this.tutorialModal.handleKeyPress(e.key)) {
          return;
        }
      }

      this.handleKeystroke(e.key, e.code);
    });
  }

  private handleKeystroke(key: string, code: string): void {
    if (!this.isRunning || !this.gameState.currentTrack) return;

    const masterTime = this.audioEngine.getMasterTime();
    const settings = this.difficultyManager.getSettings();

    const hitResult = this.rhythmEngine.evaluateHit(
      key,
      code,
      masterTime,
      this.gameState.activeNotes,
      settings
    );

    if (!hitResult) return;

    this.debugTester.recordHit(hitResult);

    const colIndex = hitResult.keyInfo ? hitResult.keyInfo.colIndex : 4;
    const isPerfect = hitResult.judgment === 'PERFECT';

    // 1. Feedback Sonoro Inmediato (<8 ms)
    if (hitResult.judgment !== 'MISS') {
      this.audioEngine.playKeyChime(colIndex, isPerfect);
    } else {
      this.audioEngine.playSoftMiss();
    }

    // 2. Registro de Estado y Lógica Adaptativa
    const errorColor = hitResult.keyInfo ? hitResult.keyInfo.color : THEME.coralRed;
    this.gameState.registerHit(hitResult.judgment, errorColor);
    this.adaptiveLogic.recordKeystroke(key, hitResult.judgment === 'MISS', Math.abs(hitResult.deltaMs));

    // 3. Feedback Visual Flotante y Partículas
    const centerX = window.innerWidth / 2;
    const hitLineY = Math.max(220, window.innerHeight * 0.36);
    const hitLineX = centerX - 450 + (colIndex * 90) + 40;

    let judgmentColor = THEME.perfect;
    if (hitResult.judgment === 'GREAT') judgmentColor = THEME.great;
    if (hitResult.judgment === 'GOOD') judgmentColor = THEME.warmYellow;
    if (hitResult.judgment === 'MISS') judgmentColor = THEME.miss;

    this.renderer.showJudgment(hitResult.judgment, judgmentColor, hitLineX, hitLineY);

    // 4. Remover nota juzgada
    if (hitResult.noteId !== 'none') {
      const idx = this.gameState.activeNotes.findIndex(n => n.id === hitResult.noteId);
      if (idx !== -1) {
        this.gameState.activeNotes.splice(idx, 1);
      }
    }
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const masterTime = this.audioEngine.getMasterTime();
    const settings = this.difficultyManager.getSettings();

    // 1. Modo Bot / Autoplay para pruebas automatizadas
    if (this.debugTester.isBotEnabled && this.gameState.currentTrack) {
      const botKey = this.debugTester.getBotAction(this.gameState.activeNotes, masterTime);
      if (botKey) {
        this.handleKeystroke(botKey, botKey === ' ' ? 'Space' : `Key${botKey.toUpperCase()}`);
      }
    }

    // 2. Limpiar notas pasadas de tiempo según la tolerancia configurada
    if (this.gameState.currentTrack) {
      for (let i = this.gameState.activeNotes.length - 1; i >= 0; i--) {
        const note = this.gameState.activeNotes[i];
        if (masterTime - note.time > settings.windowMiss) {
          this.gameState.registerHit('MISS');
          this.audioEngine.playSoftMiss();
          this.debugTester.recordHit({
            noteId: note.id,
            char: note.char,
            judgment: 'MISS',
            deltaMs: (masterTime - note.time) * 1000,
            expectedFinger: 'tiempo agotado',
            isBiomechanicallyValid: false
          });
          this.gameState.activeNotes.splice(i, 1);
        }
      }
    }

    // 3. Render de Canvas a 120 FPS con approachTime elástico
    this.renderer.render(this.gameState, masterTime, settings.approachTime);

    // 4. Actualización de Barra de Progreso Sutil
    if (this.gameState.currentTrack && this.progressBarFill) {
      const pct = Math.min(100, Math.max(0, (masterTime / this.gameState.currentTrack.duration) * 100));
      this.progressBarFill.style.width = `${pct}%`;
    }

    // 5. Actualización de HUD y Debug Tester
    const stdDev = this.rhythmEngine.getLatencyStdDev();
    this.hud.update(this.gameState, this.hygieneTimer, stdDev);
    this.debugTester.update(this.audioEngine, this.rhythmEngine, this.gameState);

    // 6. Detección de Fin de Canción y Lanzamiento de ResultsModal
    if (this.gameState.currentTrack && !this.isSongCompleted) {
      const track = this.gameState.currentTrack;
      const isFinishedByTime = masterTime >= track.duration;
      const lastNoteTime = track.notes.length > 0 ? track.notes[track.notes.length - 1].time : 0;
      const isFinishedByNotes = this.gameState.activeNotes.length === 0 && masterTime > (lastNoteTime + 2.0);

      if (isFinishedByTime || isFinishedByNotes) {
        this.triggerSongCompletion();
      }
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  private triggerHygienePause(): void {
    this.audioEngine.stop();
    this.pauseModal.show();
  }

  private resumeFromHygienePause(): void {
    if (this.gameState.currentTrack) {
      this.audioEngine.play(0, this.gameState.currentTrack.bpm);
    }
  }
}

// Iniciar aplicación asegurando ejecución inmediata si el DOM ya cargó
function bootstrap(): void {
  const game = new TyponiacGame();
  game.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
