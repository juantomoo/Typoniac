/**
 * Renderizador de Notas Rítmicas "OSU! Light Edition"
 * Círculos de impacto cromáticos, approach rings concéntricos y pistas de flujo.
 */

import { NoteEvent } from '../config/songs';
import { KEY_MAP_BY_CHAR } from '../config/keymap';
import { THEME } from '../config/theme';

export interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

export class NoteRenderer {
  private particles: BurstParticle[] = [];
  private readonly APPROACH_TIME = 1.2; // Segundos antes del impacto donde la nota aparece

  public render(
    ctx: CanvasRenderingContext2D,
    activeNotes: NoteEvent[],
    currentTime: number,
    hitLineX: number,
    hitLineY: number,
    laneWidth: number
  ): void {
    const visibleNotes = activeNotes.filter(
      n => n.time >= currentTime - 0.1 && n.time <= currentTime + this.APPROACH_TIME
    );

    // 1. Render de pistas de flujo (Flow tracks / sliders)
    for (const note of visibleNotes) {
      if (note.type === 'slider' && note.duration) {
        this.renderSliderTrack(ctx, note, currentTime, hitLineX, hitLineY, laneWidth);
      }
    }

    // 2. Render de círculos de impacto y approach rings
    for (const note of visibleNotes) {
      this.renderImpactCircle(ctx, note, currentTime, hitLineX, hitLineY, laneWidth);
    }

    // 3. Partículas de impacto
    this.updateAndRenderParticles(ctx);
  }

  private renderImpactCircle(
    ctx: CanvasRenderingContext2D,
    note: NoteEvent,
    currentTime: number,
    hitLineX: number,
    hitLineY: number,
    laneWidth: number
  ): void {
    const timeDelta = note.time - currentTime; // > 0 en el futuro, = 0 en el hit
    const progress = 1 - (timeDelta / this.APPROACH_TIME); // 0 cuando aparece, 1 en el hit
    
    // Mapeo horizontal de carril según la columna biomecánica
    const keyInfo = KEY_MAP_BY_CHAR[note.char.toLowerCase()];
    const colIndex = keyInfo ? keyInfo.colIndex : 4;
    const noteX = hitLineX - 450 + (colIndex * (laneWidth / 10)) + 40;
    
    // Movimiento vertical descendente hacia la línea de impacto
    const startY = hitLineY - 260;
    const currentY = startY + (progress * 260);

    const color = keyInfo ? keyInfo.color : THEME.primaryCyan;
    const radius = 28;

    ctx.save();

    // Línea guía sutil (flow guide)
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(noteX, startY);
    ctx.lineTo(noteX, hitLineY);
    ctx.stroke();

    // Aro de aproximación concéntrico (Approach Ring estilo OSU!)
    if (timeDelta > 0) {
      const ringScale = 1 + (timeDelta / this.APPROACH_TIME) * 1.8;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.min(1, progress * 1.5);
      ctx.beginPath();
      ctx.arc(noteX, currentY, radius * ringScale, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Núcleo del Círculo de Impacto
    ctx.globalAlpha = 1.0;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    // Fondo blanco cristalino con borde cromático grueso
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(noteX, currentY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Letra central nítida de alto contraste
    ctx.fillStyle = '#1E293B';
    ctx.font = '700 22px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(note.char === ' ' ? '␣' : note.char.toUpperCase(), noteX, currentY + 1);

    ctx.restore();
  }

  private renderSliderTrack(
    ctx: CanvasRenderingContext2D,
    note: NoteEvent,
    currentTime: number,
    hitLineX: number,
    hitLineY: number,
    laneWidth: number
  ): void {
    const keyInfo = KEY_MAP_BY_CHAR[note.char.toLowerCase()];
    const colIndex = keyInfo ? keyInfo.colIndex : 4;
    const noteX = hitLineX - 450 + (colIndex * (laneWidth / 10)) + 40;
    const color = keyInfo ? keyInfo.color : THEME.primaryCyan;

    const startProgress = 1 - ((note.time - currentTime) / this.APPROACH_TIME);
    const endProgress = 1 - (((note.time + (note.duration || 0)) - currentTime) / this.APPROACH_TIME);

    const startY = (hitLineY - 260) + (startProgress * 260);
    const endY = (hitLineY - 260) + (endProgress * 260);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(noteX, Math.min(startY, hitLineY));
    ctx.lineTo(noteX, Math.max(endY, hitLineY - 260));
    ctx.stroke();
    ctx.restore();
  }

  public spawnBurst(x: number, y: number, color: string, count: number = 14): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.2);
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        color,
        size: 3 + Math.random() * 3
      });
    }
  }

  private updateAndRenderParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
