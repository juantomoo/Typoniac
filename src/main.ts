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
import { InGamePauseModal } from './ui/InGamePauseModal';
import { DifficultyManager, DifficultySettings } from './config/difficulty';
import { CURATED_TRACKS, BeatmapData } from './config/songs';
import { THEME } from './config/theme';
import { ProgressionEngine } from './core/ProgressionEngine';
import { ZenEngine } from './core/ZenEngine';
import { ProgressionModal } from './ui/ProgressionModal';
import { ZenModal } from './ui/ZenModal';
import { ProgressionStage } from './config/progressionStages';
import { ZenTextItem } from './config/zenTexts';
import { KEY_MAP_BY_CHAR, FINGER_COLORS } from './config/keymap';

class TyponiacGame {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private audioEngine: AudioEngine;
  private rhythmEngine: RhythmEngine;
  private adaptiveLogic: AdaptiveLogic;
  private hygieneTimer: HygieneTimer;
  private gameState: GameState;
  private difficultyManager: DifficultyManager;
  private progressionEngine: ProgressionEngine;
  private zenEngine: ZenEngine;

  private hud: HUD;
  private songSelect: SongSelect;
  private pauseModal: PauseModal;
  private inGamePauseModal: InGamePauseModal;
  private welcomeSplash: WelcomeSplash;
  private tutorialModal: TutorialModal;
  private debugTester: DebugTester;
  private settingsModal: SettingsModal;
  private resultsModal: ResultsModal;
  private progressionModal: ProgressionModal;
  private zenModal: ZenModal;

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

    this.inGamePauseModal = new InGamePauseModal({
      onResume: () => {
        if (this.gameState.gameMode === 'rhythm' && this.gameState.currentTrack) {
          this.audioEngine.resume(this.gameState.currentTrack.bpm);
        }
      },
      onRestart: () => {
        if (this.gameState.gameMode === 'rhythm' && this.gameState.currentTrack) {
          this.loadAndStartTrack(this.gameState.currentTrack);
        } else if (this.gameState.gameMode === 'progression' && this.gameState.currentProgressionStage) {
          this.loadAndStartProgression(this.gameState.currentProgressionStage);
        } else if (this.gameState.gameMode === 'zen' && this.gameState.currentZenText) {
          this.loadAndStartZen(this.gameState.currentZenText);
        }
      },
      onOpenSettings: () => {
        this.settingsModal.show();
      },
      onReturnToHome: () => {
        this.returnToHome();
      }
    });

    this.hud = new HUD({
      onSelectFadeMode: (mode: FadeMode) => this.gameState.setFadeMode(mode),
      onOpenSongSelect: () => this.songSelect.show(),
      onOpenProgressionSelect: () => this.progressionModal.show(),
      onOpenZenSelect: () => this.zenModal.show(),
      onReturnToHome: () => this.returnToHome(),
      onOpenSettings: () => this.settingsModal.show(),
      onPauseGame: () => this.togglePause()
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

    this.progressionEngine = new ProgressionEngine();
    this.zenEngine = new ZenEngine();

    this.progressionModal = new ProgressionModal((stage) => {
      this.loadAndStartProgression(stage);
    });

    this.zenModal = new ZenModal((textItem) => {
      this.loadAndStartZen(textItem);
    });

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
      onOpenProgressionCatalog: () => {
        this.audioEngine.init();
        this.progressionModal.show();
      },
      onOpenZenCatalog: () => {
        this.audioEngine.init();
        this.zenModal.show();
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
    this.inGamePauseModal.hide();
    this.isSongCompleted = false;
    this.gameState.currentTrack = null;
    this.gameState.currentProgressionStage = null;
    this.gameState.currentZenText = null;
    this.gameState.gameMode = 'rhythm';
    if (this.progressBarFill) {
      this.progressBarFill.style.width = '0%';
    }
    this.welcomeSplash.show();
  }

  public async loadAndStartTrack(track: BeatmapData): Promise<void> {
    this.audioEngine.init();
    this.audioEngine.stop();
    this.resultsModal.hide();
    this.inGamePauseModal.hide();
    this.isSongCompleted = false;
    if (this.progressBarFill) {
      this.progressBarFill.style.width = '0%';
    }
    this.gameState.reset(track);

    this.hygieneTimer.start();
    await this.audioEngine.loadAudio(track.audioUrl);
    this.audioEngine.play(0, track.bpm);
  }

  public loadAndStartProgression(stage: ProgressionStage): void {
    this.audioEngine.init();
    this.audioEngine.stop();
    this.resultsModal.hide();
    this.inGamePauseModal.hide();
    this.isSongCompleted = false;
    if (this.progressBarFill) {
      this.progressBarFill.style.width = '0%';
    }
    this.gameState.resetProgression(stage);
    this.progressionEngine.startStage(stage);
  }

  public loadAndStartZen(zenItem: ZenTextItem): void {
    this.audioEngine.init();
    this.audioEngine.stop();
    this.resultsModal.hide();
    this.inGamePauseModal.hide();
    this.isSongCompleted = false;
    if (this.progressBarFill) {
      this.progressBarFill.style.width = '0%';
    }
    this.gameState.resetZen(zenItem);
    this.zenEngine.startText(zenItem);
  }

  public togglePause(): void {
    const isPlaying =
      (this.gameState.gameMode === 'rhythm' && this.gameState.currentTrack !== null && !this.isSongCompleted) ||
      (this.gameState.gameMode === 'progression' && this.gameState.currentProgressionStage !== null) ||
      (this.gameState.gameMode === 'zen' && this.gameState.currentZenText !== null);

    if (!isPlaying) return;

    if (this.inGamePauseModal.isOpen()) {
      this.inGamePauseModal.hide();
      if (this.gameState.gameMode === 'rhythm' && this.gameState.currentTrack) {
        this.audioEngine.resume(this.gameState.currentTrack.bpm);
      }
    } else {
      if (this.gameState.gameMode === 'rhythm') {
        this.audioEngine.pause();
      }
      this.inGamePauseModal.show(this.gameState.currentTrack, this.gameState);
    }
  }

  private setupListeners(): void {
    window.addEventListener('resize', () => {
      this.renderer.handleResize();
    });

    const IGNORED_KEYS = new Set([
      'Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock',
      'Tab', 'Dead', 'ContextMenu',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'PageUp', 'PageDown', 'Insert',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'NumLock', 'ScrollLock', 'Pause', 'AudioVolumeMute', 'AudioVolumeDown', 'AudioVolumeUp'
    ]);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        const isPlaying =
          (this.gameState.gameMode === 'rhythm' && this.gameState.currentTrack !== null && !this.isSongCompleted) ||
          (this.gameState.gameMode === 'progression' && this.gameState.currentProgressionStage !== null) ||
          (this.gameState.gameMode === 'zen' && this.gameState.currentZenText !== null);

        if (isPlaying) {
          this.togglePause();
        } else {
          this.settingsModal.show();
        }
        return;
      }

      if (this.inGamePauseModal.isOpen()) {
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (this.gameState.gameMode === 'zen') {
          if (this.zenEngine.handleBackspace(this.gameState)) {
            if (this.progressBarFill && this.gameState.currentZenText) {
              const pct = (this.gameState.zenCursor / this.gameState.currentZenText.text.length) * 100;
              this.progressBarFill.style.width = `${pct}%`;
            }
          }
        } else if (this.gameState.gameMode === 'progression') {
          if (this.gameState.progressionCursor > 0) {
            this.gameState.progressionCursor--;
            if (this.progressBarFill && this.gameState.currentProgressionStage) {
              const pct = (this.gameState.progressionCursor / this.gameState.currentProgressionStage.practiceSequence.length) * 100;
              this.progressBarFill.style.width = `${pct}%`;
            }
          }
        }
        return;
      }

      if (IGNORED_KEYS.has(e.key)) {
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
    if (!this.isRunning) return;

    // =========================================================================
    // MODO 1: PROGRESIÓN NO MUSICAL (ESCUELA DE TECLAS)
    // =========================================================================
    if (this.gameState.gameMode === 'progression') {
      const stage = this.gameState.currentProgressionStage;
      if (!stage) return;
      const expected = stage.practiceSequence[this.gameState.progressionCursor];
      if (!expected) return;

      const result = this.progressionEngine.evaluateInput(key, stage, this.gameState);
      const meta = KEY_MAP_BY_CHAR[expected.toLowerCase()];
      const colIndex = meta ? meta.colIndex : 4;
      const fingerName = meta ? (FINGER_COLORS[meta.finger]?.label || 'Dedo') : 'Dedo';

      if (result.isCorrect) {
        this.audioEngine.playKeyChime(colIndex, true);
        this.debugTester.recordHit({
          noteId: `prog_${this.gameState.progressionCursor}`,
          char: expected,
          judgment: 'PERFECT',
          deltaMs: result.deltaMs,
          expectedFinger: fingerName,
          isBiomechanicallyValid: true
        });
      } else {
        this.audioEngine.playSoftMiss();
        this.debugTester.recordHit({
          noteId: `prog_${this.gameState.progressionCursor}`,
          char: key,
          judgment: 'MISS',
          deltaMs: result.deltaMs,
          expectedFinger: fingerName,
          isBiomechanicallyValid: false
        });
      }

      const evalData = this.progressionEngine.evaluateStageCompletion(stage, this.gameState);
      this.gameState.progressionAccuracy = evalData.accuracy;
      this.gameState.progressionJitter = Math.round(evalData.stdDevLatency);
      this.gameState.progressionCorrect = this.gameState.correctKeystrokes;
      this.gameState.progressionMistakes = this.gameState.uniqueErrors;

      const centerX = window.innerWidth / 2;
      const hitLineY = Math.min(230, window.innerHeight * 0.28);
      this.renderer.showJudgment(
        result.isCorrect ? 'PERFECT' : 'MISS',
        result.isCorrect ? THEME.perfect : THEME.coralRed,
        centerX,
        hitLineY
      );

      if (this.progressBarFill) {
        const pct = (this.gameState.progressionCursor / stage.practiceSequence.length) * 100;
        this.progressBarFill.style.width = `${pct}%`;
      }

      if (result.isStageCompleted) {
        this.audioEngine.playComboMilestone(50);
        setTimeout(() => {
          alert(`🎉 ¡Etapa completada!\n\nPrecisión: ${this.gameState.progressionAccuracy}%\nJitter: ${this.gameState.progressionJitter} ms\n\n${evalData.passed ? '¡Excelente! Has dominado esta lección de acuerdo a los estándares pedagógicos (≥95%).' : 'Buen intento. Practica una vez más para alcanzar el 95% de precisión.'}`);
          this.returnToHome();
        }, 200);
      }
      return;
    }

    // =========================================================================
    // MODO 2: ESCRITURA ZEN COSY (TEXTOS Y FÁBULAS)
    // =========================================================================
    if (this.gameState.gameMode === 'zen') {
      const zenItem = this.gameState.currentZenText;
      if (!zenItem) return;
      const expected = zenItem.text[this.gameState.zenCursor];
      if (!expected) return;

      const result = this.zenEngine.evaluateInput(key, zenItem, this.gameState);
      const meta = KEY_MAP_BY_CHAR[expected.toLowerCase()];
      const colIndex = meta ? meta.colIndex : 4;
      const fingerName = meta ? (FINGER_COLORS[meta.finger]?.label || 'Dedo') : 'Dedo';

      this.gameState.zenWpm = result.netWpm;
      this.gameState.zenAccuracy = result.accuracy;
      this.gameState.zenTimeElapsed = result.elapsedSeconds;
      this.gameState.zenKeystrokes = this.gameState.totalKeystrokes;
      this.gameState.zenMistakes = this.gameState.zenErrors;
      this.gameState.zenCorrect = this.gameState.correctKeystrokes;

      if (result.isCorrect) {
        this.audioEngine.playKeyChime(colIndex, false);
        this.debugTester.recordHit({
          noteId: `zen_${this.gameState.zenCursor}`,
          char: expected,
          judgment: 'GREAT',
          deltaMs: 0,
          expectedFinger: fingerName,
          isBiomechanicallyValid: true
        });
      } else {
        this.audioEngine.playSoftMiss();
        this.debugTester.recordHit({
          noteId: `zen_${this.gameState.zenCursor}`,
          char: key,
          judgment: 'MISS',
          deltaMs: 0,
          expectedFinger: fingerName,
          isBiomechanicallyValid: false
        });
      }

      if (this.progressBarFill) {
        const pct = (this.gameState.zenCursor / zenItem.text.length) * 100;
        this.progressBarFill.style.width = `${pct}%`;
      }

      if (result.isTextCompleted) {
        this.audioEngine.playComboMilestone(50);
        setTimeout(() => {
          alert(`🍃 ¡Lectura completada con serenidad!\n\nVelocidad: ${this.gameState.zenWpm} WPM\nPrecisión: ${this.gameState.zenAccuracy}%\nTiempo: ${Math.floor(this.gameState.zenTimeElapsed)} segundos`);
          this.returnToHome();
        }, 200);
      }
      return;
    }

    // =========================================================================
    // MODO 3: AVENTURA RÍTMICA MUSICAL (OSU! LIGHT)
    // =========================================================================
    if (!this.gameState.currentTrack || this.audioEngine.getIsPaused()) return;

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

    // 3. Recompensa auditiva de racha (Combo Milestones: 10x, 25x, 50x, 75x...)
    if (this.gameState.combo > 0 && (this.gameState.combo === 10 || this.gameState.combo % 25 === 0)) {
      this.audioEngine.playComboMilestone(this.gameState.combo);
    }

    // 4. Feedback Visual Flotante y Partículas
    const centerX = window.innerWidth / 2;
    const hitLineY = Math.max(220, window.innerHeight * 0.36);
    const hitLineX = centerX - 450 + (colIndex * 90) + 40;

    let judgmentColor = THEME.perfect;
    if (hitResult.judgment === 'GREAT') judgmentColor = THEME.great;
    if (hitResult.judgment === 'GOOD') judgmentColor = THEME.warmYellow;
    if (hitResult.judgment === 'MISS') judgmentColor = THEME.miss;

    this.renderer.showJudgment(hitResult.judgment, judgmentColor, hitLineX, hitLineY);

    // 5. Remover nota juzgada
    if (hitResult.noteId !== 'none') {
      const idx = this.gameState.activeNotes.findIndex(n => n.id === hitResult.noteId);
      if (idx !== -1) {
        this.gameState.activeNotes.splice(idx, 1);
      }
    }
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    // Si el juego está en pausa, mantener bucle sin avanzar notas ni tiempo
    if (this.inGamePauseModal.isOpen() || this.audioEngine.getIsPaused()) {
      requestAnimationFrame(() => this.gameLoop());
      return;
    }

    const masterTime = this.audioEngine.getMasterTime();
    const settings = this.difficultyManager.getSettings();

    // 1. Modo Bot / Autoplay para pruebas automatizadas
    if (this.debugTester.isBotEnabled) {
      if (this.gameState.gameMode === 'rhythm' && this.gameState.currentTrack) {
        const botKey = this.debugTester.getBotAction(this.gameState.activeNotes, masterTime);
        if (botKey) {
          this.handleKeystroke(botKey, botKey === ' ' ? 'Space' : `Key${botKey.toUpperCase()}`);
        }
      } else if (this.gameState.gameMode === 'progression' && this.gameState.currentProgressionStage) {
        const botKey = this.debugTester.getBotProgressionAction(
          this.gameState.currentProgressionStage.practiceSequence,
          this.gameState.progressionCursor
        );
        if (botKey) {
          this.handleKeystroke(botKey, botKey === ' ' ? 'Space' : `Key${botKey.toUpperCase()}`);
        }
      } else if (this.gameState.gameMode === 'zen' && this.gameState.currentZenText) {
        const botKey = this.debugTester.getBotZenAction(
          this.gameState.currentZenText.text,
          this.gameState.zenCursor
        );
        if (botKey) {
          this.handleKeystroke(botKey, botKey === ' ' ? 'Space' : `Key${botKey.toUpperCase()}`);
        }
      }
    }

    // Actualizar tiempo transcurrido en modo Zen
    if (this.gameState.gameMode === 'zen') {
      this.zenEngine.updateTime(this.gameState);
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
