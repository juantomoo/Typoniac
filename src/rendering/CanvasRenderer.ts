/**
 * Renderizador Principal de Canvas a 120 FPS
 * Orquesta fondos anti-estrés, línea de ejecución rítmica, notas, manos holográficas,
 * aviso visual de preparación para niños y los pulsos cromáticos periféricos en Modo Ciego.
 */

import { THEME } from '../config/theme';
import { NoteRenderer } from './NoteRenderer';
import { HandGuide } from './HandGuide';
import { GameState } from '../state/GameState';
import { KEY_MAP_BY_CHAR, KeyBioInfo, FINGER_COLORS } from '../config/keymap';
import { ProgressionStage } from '../config/progressionStages';
import { ZenTextItem } from '../config/zenTexts';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private noteRenderer: NoteRenderer;
  private handGuide: HandGuide;

  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;

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

  public render(gameState: GameState, masterTime: number, approachTime: number = 2.5): void {
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
    const hitLineY = Math.max(220, h * 0.36);
    const keyboardBaseY = Math.max(340, h * 0.52);

    let targetFinger: string | null = null;
    let targetKey: string | null = null;

    // =========================================================================
    // MODO 1: RÍTMICO MUSICAL (OSU! LIGHT)
    // =========================================================================
    if (gameState.gameMode === 'rhythm') {
      // Aviso Visual de Preparación para Niños (Cuenta Regresiva de Entrada)
      if (masterTime < 4.8 && gameState.currentTrack) {
        this.renderPrepBanner(ctx, centerX, hitLineY - 70, masterTime);
      }

      // Línea de Impacto Rítmico (Beatline)
      ctx.save();
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 480, hitLineY);
      ctx.lineTo(centerX + 480, hitLineY);
      ctx.stroke();

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

      // Determinar la Próxima Nota para iluminar el dedo en tiempo real
      const upcoming = gameState.activeNotes.find(n => n.time >= masterTime && n.time <= masterTime + approachTime);
      if (upcoming) {
        targetKey = upcoming.char;
        const keyMeta = KEY_MAP_BY_CHAR[upcoming.char.toLowerCase()];
        if (keyMeta) {
          targetFinger = keyMeta.finger;
          gameState.targetFinger = keyMeta.finger;
          gameState.targetFingerColor = keyMeta.color;
        }
      }

      // Renderizar Notas Rítmicas OSU! Light
      this.noteRenderer.render(ctx, gameState.activeNotes, masterTime, centerX, hitLineY, 900, approachTime);
    }

    // =========================================================================
    // MODO 2: PROGRESIÓN NO MUSICAL DE TECLAS (ESCUELA DE TECLAS)
    // =========================================================================
    else if (gameState.gameMode === 'progression' && gameState.currentProgressionStage) {
      const stage = gameState.currentProgressionStage;
      const expectedChar = stage.practiceSequence[gameState.progressionCursor] || '';
      targetKey = expectedChar;

      const keyMeta = KEY_MAP_BY_CHAR[expectedChar.toLowerCase()];
      if (keyMeta) {
        targetFinger = keyMeta.finger;
        gameState.targetFinger = keyMeta.finger;
        gameState.targetFingerColor = keyMeta.color;
      }

      this.renderProgressionDisplay(ctx, centerX, Math.min(230, h * 0.28), stage, gameState, expectedChar, keyMeta);
    }

    // =========================================================================
    // MODO 3: ESCRITURA ZEN COSY (TEXTOS Y FÁBULAS)
    // =========================================================================
    else if (gameState.gameMode === 'zen' && gameState.currentZenText) {
      const zenItem = gameState.currentZenText;
      const expectedChar = zenItem.text[gameState.zenCursor] || '';
      targetKey = expectedChar;

      const keyMeta = KEY_MAP_BY_CHAR[expectedChar.toLowerCase()];
      if (keyMeta) {
        targetFinger = keyMeta.finger;
        gameState.targetFinger = keyMeta.finger;
        gameState.targetFingerColor = keyMeta.color;
      }

      this.renderZenDisplay(ctx, centerX, Math.min(230, h * 0.28), zenItem, gameState);
    }

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

    // 8. Texto Flotante de Juicio (PERFECT / GREAT / GOOD / MISS)
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

  private renderProgressionDisplay(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    stage: ProgressionStage,
    gameState: GameState,
    expectedChar: string,
    keyMeta?: KeyBioInfo
  ): void {
    ctx.save();

    const cardW = Math.min(840, this.width - 40);
    const cardH = 175;
    const x = cx - cardW / 2;
    const y = cy - cardH / 2;

    // Tarjeta Traslúcida Suave
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.05)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 20);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Encabezado: Nivel y Título
    ctx.fillStyle = THEME.primaryCyan;
    ctx.font = '800 13px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`NIVEL ${stage.level}: ${stage.title.toUpperCase()}`, x + 24, y + 28);

    // Métricas en Vivo: Precisión y Jitter
    ctx.fillStyle = '#64748B';
    ctx.font = '600 12px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(
      `Precisión: ${gameState.progressionAccuracy}%  |  Jitter: ${gameState.progressionJitter} ms`,
      x + cardW - 24,
      y + 28
    );

    // Barra de Progreso Superior en la Tarjeta
    const barW = cardW - 48;
    const progress = Math.min(1, gameState.progressionCursor / Math.max(1, stage.practiceSequence.length));
    ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x + 24, y + 38, barW, 6, 3);
    ctx.fill();

    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(x + 24, y + 38, barW * progress, 6, 3);
    ctx.fill();

    // Cinta de Caracteres en Secuencia
    const seqY = y + 90;
    const charSpacing = 34;

    // 1. Caracteres Anteriores (Completados)
    ctx.textAlign = 'right';
    ctx.font = '700 20px "Outfit", system-ui, sans-serif';
    ctx.fillStyle = '#10B981';
    const pastChars = stage.practiceSequence.slice(Math.max(0, gameState.progressionCursor - 5), gameState.progressionCursor);
    let pastX = cx - 45;
    for (let i = pastChars.length - 1; i >= 0; i--) {
      const ch = pastChars[i] === ' ' ? '␣' : pastChars[i].toUpperCase();
      ctx.fillText(ch, pastX, seqY + 6);
      pastX -= charSpacing;
    }

    // 2. Carácter Actual (Enfocado con Borde Cromático y Resplandor)
    const boxSize = 54;
    const boxX = cx - boxSize / 2;
    const boxY = seqY - boxSize / 2;
    const fingerColor = keyMeta?.color || THEME.primaryCyan;

    ctx.save();
    ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
    ctx.strokeStyle = fingerColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = fingerColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxSize, boxSize, 14);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    if (expectedChar === ' ') {
      ctx.font = '800 13px "Outfit", system-ui, sans-serif';
      ctx.fillText('ESPACIO', cx, seqY + 5);
    } else {
      ctx.font = '900 28px "Outfit", system-ui, sans-serif';
      ctx.fillText(expectedChar.toUpperCase(), cx, seqY + 9);
    }

    // Indicador del Dedo Recomendado bajo la Tecla
    ctx.save();
    ctx.fillStyle = fingerColor;
    ctx.font = '700 11px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    const fingerLabel = keyMeta ? `${(FINGER_COLORS[keyMeta.finger]?.label || 'DEDO').toUpperCase()} (${keyMeta.hand === 'left' ? 'IZQ' : 'DER'})` : 'PULGAR';
    ctx.fillText(fingerLabel, cx, seqY + 44);
    ctx.restore();

    // 3. Caracteres Siguientes
    ctx.textAlign = 'left';
    ctx.font = '600 20px "Outfit", system-ui, sans-serif';
    ctx.fillStyle = '#94A3B8';
    const futureChars = stage.practiceSequence.slice(gameState.progressionCursor + 1, gameState.progressionCursor + 9);
    let futureX = cx + 45;
    for (let i = 0; i < futureChars.length; i++) {
      const ch = futureChars[i] === ' ' ? '␣' : futureChars[i].toUpperCase();
      ctx.fillText(ch, futureX, seqY + 6);
      futureX += charSpacing;
    }

    ctx.restore();
  }

  private renderZenDisplay(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    zenItem: ZenTextItem,
    gameState: GameState
  ): void {
    ctx.save();

    const cardW = Math.min(880, this.width - 40);
    const cardH = 185;
    const x = cx - cardW / 2;
    const y = cy - cardH / 2;

    // Tarjeta Suave Estilo Lectura Cosy
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.05)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 20);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Encabezado: Categoría y Título
    ctx.fillStyle = zenItem.calmPalette.accent;
    ctx.font = '800 13px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${zenItem.categoryTitle.toUpperCase()} • "${zenItem.title}"`, x + 24, y + 28);

    // Métricas en Vivo de Velocidad y Precisión
    const progressPct = Math.round((gameState.zenCursor / Math.max(1, zenItem.text.length)) * 100);
    ctx.fillStyle = '#64748B';
    ctx.font = '600 12px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(
      `${gameState.zenWpm} WPM  •  ${gameState.zenAccuracy}% Precisión  •  ${progressPct}%`,
      x + cardW - 24,
      y + 28
    );

    // Barra de Progreso Fina
    const barW = cardW - 48;
    const progress = Math.min(1, gameState.zenCursor / Math.max(1, zenItem.text.length));
    ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x + 24, y + 38, barW, 5, 2.5);
    ctx.fill();

    ctx.fillStyle = zenItem.calmPalette.accent;
    ctx.beginPath();
    ctx.roundRect(x + 24, y + 38, barW * progress, 5, 2.5);
    ctx.fill();

    // Ventana de Texto (Look-Ahead Dinámico de Lectura)
    const seqY = y + 92;
    const beforeText = zenItem.text.slice(Math.max(0, gameState.zenCursor - 24), gameState.zenCursor);
    const currentChar = zenItem.text[gameState.zenCursor] || '';
    const afterText = zenItem.text.slice(gameState.zenCursor + 1, gameState.zenCursor + 28);

    // 1. Texto Escrito (Esmeralda Suave)
    ctx.textAlign = 'right';
    ctx.font = '600 22px "Outfit", system-ui, sans-serif';
    ctx.fillStyle = '#0D9488';
    ctx.fillText(beforeText, cx - 18, seqY + 6);

    // 2. Carácter Actual con Resaltado Ciano
    ctx.save();
    ctx.fillStyle = 'rgba(0, 194, 224, 0.15)';
    ctx.strokeStyle = THEME.primaryCyan;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 15, seqY - 22, 30, 36, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.font = '800 22px "Outfit", system-ui, sans-serif';
    ctx.fillText(currentChar === ' ' ? '␣' : currentChar, cx, seqY + 6);

    // 3. Texto Pendiente (Gris Pizarra Neutro)
    ctx.textAlign = 'left';
    ctx.font = '500 22px "Outfit", system-ui, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(afterText, cx + 18, seqY + 6);

    // Autor y Pie de Página Cosy
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 12px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`— ${zenItem.author}  •  Respira hondo y escribe a tu propio ritmo`, cx, y + 155);

    ctx.restore();
  }
}

