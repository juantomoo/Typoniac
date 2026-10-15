/**
 * Renderizador Principal de Canvas a 120 FPS
 * Orquesta fondos anti-estrés, línea de ejecución rítmica, notas, manos holográficas,
 * aviso visual de preparación para niños y los pulsos cromáticos periféricos en Modo Ciego.
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
    // Espaciado ergonómico optimizado
    const hitLineY = Math.max(220, h * 0.36);
    const keyboardBaseY = Math.max(340, h * 0.52);

    // 3. Aviso Visual de Preparación para Niños (Cuenta Regresiva de Entrada)
    if (masterTime < 4.8 && gameState.currentTrack) {
      this.renderPrepBanner(ctx, centerX, hitLineY - 70, masterTime);
    }

    // 4. Línea de Impacto Rítmico (Beatline)
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

    // 5. Determinar la Próxima Nota para iluminar el dedo en tiempo real
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

    // 6. Renderizar Notas Rítmicas OSU! Light
    this.noteRenderer.render(ctx, gameState.activeNotes, masterTime, centerX, hitLineY, 900);

    // 7. Renderizar Manos Holográficas y Teclado Virtual con Atenuación Visual
    this.handGuide.render(
      ctx,
      centerX,
      keyboardBaseY,
      gameState.visualFadeOpacity,
      targetFinger,
      targetKey,
      performance.now() / 1000
    );

    // 8. Texto Flotante de Juicio (PERFECT / GREAT / MISS)
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

  private renderPrepBanner(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number): void {
    ctx.save();
    ctx.textAlign = 'center';

    let countText = '3';
    if (time > 1.5 && time <= 3.0) countText = '2';
    if (time > 3.0 && time <= 4.2) countText = '1';
    if (time > 4.2) countText = '¡A TOCAR!';

    // Fondo pastilla translúcida
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = THEME.primaryCyan;
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 194, 224, 0.2)';
    ctx.shadowBlur = 16;

    const w = 460;
    const h = 75;
    const x = cx - w / 2;
    const y = cy - h / 2;

    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 20);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#64748B';
    ctx.font = '700 12px "Outfit", system-ui, sans-serif';
    ctx.fillText('COLOCA TUS DEDOS ÍNDICES EN F Y J', cx, cy - 10);

    ctx.fillStyle = THEME.primaryCyan;
    ctx.font = '900 24px "Outfit", system-ui, sans-serif';
    ctx.fillText(countText, cx, cy + 20);

    ctx.restore();
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
