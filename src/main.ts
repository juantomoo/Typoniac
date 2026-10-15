/**
 * Typoniac — OSU! Light Edition
 * Punto de entrada principal y orquestador del ciclo de juego rítmico.
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

  private hud: HUD;
  private songSelect: SongSelect;
  private pauseModal: PauseModal;

  private isRunning: boolean = false;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.renderer = new CanvasRenderer(this.canvas);
    this.audioEngine = new AudioEngine();
    this.rhythmEngine = new RhythmEngine();
    this.adaptiveLogic = new AdaptiveLogic();
    this.gameState = new GameState();

    // Modales y HUD
    this.pauseModal = new PauseModal(() => this.resumeFromHygienePause());
    this.hygieneTimer = new HygieneTimer(() => this.triggerHygienePause());

    this.hud = new HUD(
      (mode: FadeMode) => this.gameState.setFadeMode(mode),
      () => this.songSelect.show()
    );

    this.songSelect = new SongSelect((track: BeatmapData) => this.loadAndStartTrack(track));

    this.setupListeners();
  }

  public async start(): Promise<void> {
    // Iniciar con la primera canción de la Fase Cognitiva (C418 Subwoofer Lullaby a 70 BPM)
    const initialTrack = CURATED_TRACKS[0];
    await this.loadAndStartTrack(initialTrack);

    this.isRunning = true;
    this.hygieneTimer.start();
    requestAnimationFrame(() => this.gameLoop());
  }

  private async loadAndStartTrack(track: BeatmapData): Promise<void> {
    this.audioEngine.stop();
    this.gameState.reset(track);

    // Intentar cargar la pista descargada de yt-dlp (o activar generador procedural de síntesis)
    await this.audioEngine.loadAudio(track.audioUrl);
    this.audioEngine.play(0, track.bpm);
  }

  private setupListeners(): void {
    window.addEventListener('resize', () => {
      this.renderer.handleResize();
    });

    // Escucha de teclado físico sin latencia
    window.addEventListener('keydown', (e) => {
      // Prevenir scroll en barra espaciadora
      if (e.code === 'Space') {
        e.preventDefault();
      }

      if (e.repeat) return; // Evitar repetición automática del sistema operativo

      this.handleKeystroke(e.key, e.code);
    });
  }

  private handleKeystroke(key: string, code: string): void {
    if (!this.isRunning) return;

    const masterTime = this.audioEngine.getMasterTime();
    const hitResult = this.rhythmEngine.evaluateHit(
      key,
      code,
      masterTime,
      this.gameState.activeNotes
    );

    if (!hitResult) return;

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
    const hitLineY = window.innerHeight * 0.42;
    const hitLineX = centerX - 450 + (colIndex * 90) + 40;

    let judgmentColor = THEME.perfect;
    if (hitResult.judgment === 'GREAT') judgmentColor = THEME.great;
    if (hitResult.judgment === 'MISS') judgmentColor = THEME.miss;

    this.renderer.showJudgment(hitResult.judgment, judgmentColor, hitLineX, hitLineY);

    // 4. Remover nota juzgada de las notas activas
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

    // Limpiar notas que ya pasaron de la ventana temporal (> 0.08s tarde)
    for (let i = this.gameState.activeNotes.length - 1; i >= 0; i--) {
      const note = this.gameState.activeNotes[i];
      if (masterTime - note.time > 0.08) {
        this.gameState.registerHit('MISS');
        this.audioEngine.playSoftMiss();
        this.gameState.activeNotes.splice(i, 1);
      }
    }

    // Render de Canvas a 120 FPS
    this.renderer.render(this.gameState, masterTime);

    // Actualización de HUD
    const stdDev = this.rhythmEngine.getLatencyStdDev();
    this.hud.update(this.gameState, this.hygieneTimer, stdDev);

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

// Iniciar aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  const game = new TyponiacGame();
  game.start().catch(console.error);
});
