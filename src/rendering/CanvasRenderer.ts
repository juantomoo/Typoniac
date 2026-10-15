/**
 * Renderizador Principal de Canvas a 120 FPS
 * Orquesta fondos anti-estrés, línea de ejecución rítmica, notas, manos holográficas
 * y los pulsos cromáticos periféricos en Modo Ciego.
 */

import { THEME } from '../config/theme';
import { NoteRenderer } from './NoteRenderer';
import { HandGuide } from './HandGuide';
import { GameState } from '../state/GameState';
import { KEY_MAP_BY_CHAR } from '../config/keymap';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private noteRenderer: NoteRenderer;
  private handGuide: HandGuide;

  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

  // Feedback de juicio visual flotante
  private floatingJudgment: { text: string; color: string; alpha: number; y: number } | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.noteRenderer = new NoteRenderer();
    this.handGuide = new HandGuide();
    this.handleResize();
  }

  public handleResize(): void {
    this.dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  public render(gameState: GameState, masterTime: number): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Limpieza con Fondo Pastel Neutro Anti-Estrés ("OSU! Light")
    ctx.fillStyle = THEME.bgCanvas;
    ctx.fillRect(0, 0, w, h);

    // 2. Pulso Cromático Periférico ante Errores en Modo Ciego (0% Opacidad)
    if (gameState.lastErrorFingerColor && performance.now() - gameState.lastErrorTimestamp < 350) {
      const errorProgress = (performance.now() - gameState.lastErrorTimestamp) / 350;
      const alpha = (1 - errorProgress) * 0.45;
      ctx.save();
      ctx.strokeStyle = gameState.lastErrorFingerColor;
      ctx.lineWidth = 16;
      ctx.globalAlpha = alpha;
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.restore();
    }

    const centerX = w / 2;
    const hitLineY = h * 0.42; // Línea de ejecución rítmica
    const keyboardBaseY = h * 0.62;

    // 3. Línea de Impacto Rítmico (Beatline)
    ctx.save();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 480, hitLineY);
    ctx.lineTo(centerX + 480, hitLineY);
    ctx.stroke();

    // Marcadores de diana de impacto en cada columna
    for (let c = 0; c < 10; c++) {
      const targetX = centerX - 450 + (c * 90) + 40;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetX, hitLineY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // 4. Determinar la Próxima Nota para iluminar el dedo en tiempo real
    const upcoming = gameState.activeNotes.find(n => n.time >= masterTime && n.time <= masterTime + 1.2);
    let targetFinger: string | null = null;
    let targetKey: string | null = null;

    if (upcoming) {
      targetKey = upcoming.char;
      const keyMeta = KEY_MAP_BY_CHAR[upcoming.char.toLowerCase()];
      if (keyMeta) {
        targetFinger = keyMeta.finger;
        gameState.targetFinger = keyMeta.finger;
        gameState.targetFingerColor = keyMeta.color;
      }
    }

    // 5. Renderizar Notas Rítmicas OSU! Light
    this.noteRenderer.render(ctx, gameState.activeNotes, masterTime, centerX, hitLineY, 900);

    // 6. Renderizar Manos Holográficas y Teclado Virtual con Atenuación Visual
    this.handGuide.render(
      ctx,
      centerX,
      keyboardBaseY,
      gameState.visualFadeOpacity,
      targetFinger,
      targetKey,
      performance.now() / 1000
    );

    // 7. Texto Flotante de Juicio (PERFECT / GREAT / MISS)
    if (this.floatingJudgment) {
      ctx.save();
      ctx.fillStyle = this.floatingJudgment.color;
      ctx.globalAlpha = this.floatingJudgment.alpha;
      ctx.font = '800 28px "Outfit", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.floatingJudgment.text, centerX, this.floatingJudgment.y);
      ctx.restore();

      this.floatingJudgment.alpha -= 0.035;
      this.floatingJudgment.y -= 1;
      if (this.floatingJudgment.alpha <= 0) {
        this.floatingJudgment = null;
      }
    }
  }

  public showJudgment(text: string, color: string, hitLineX: number, hitLineY: number): void {
    this.floatingJudgment = {
      text,
      color,
      alpha: 1.0,
      y: hitLineY - 20
    };
    this.noteRenderer.spawnBurst(hitLineX, hitLineY, color, text === 'PERFECT' ? 18 : 8);
  }
}
