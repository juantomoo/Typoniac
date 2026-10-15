/**
 * Proyección Holográfica de Manos y Guía Dactilar
 * Muestra siluetas bimanuales ergonómicas translúcidas, iluminación dinámica de dedos,
 * anclajes táctiles en F y J, y atenuación visual progresiva (Fade-Out: 100% -> 50% -> 0%).
 */

import { KEYBOARD_LAYOUT, FINGER_COLORS, KeyBioInfo, FingerName } from '../config/keymap';

export class HandGuide {
  private keyPositions: Map<string, { x: number; y: number; w: number; h: number; info: KeyBioInfo }> = new Map();

  public calculateLayout(centerX: number, startY: number): void {
    this.keyPositions.clear();
    const keyWidth = 40;
    const keyHeight = 40;
    const keyGap = 5;

    // Distribución por hileras estándar
    const rows = ['number', 'top', 'home', 'bottom', 'space'] as const;
    const rowOffsets = [0, 16, 24, 32, 110];

    rows.forEach((rowName, rIndex) => {
      const keysInRow = KEYBOARD_LAYOUT.filter(k => k.row === rowName);
      const rowWidth = keysInRow.length * (keyWidth + keyGap);
      const rowStartX = centerX - (rowWidth / 2) + rowOffsets[rIndex];
      const rowY = startY + (rIndex * (keyHeight + keyGap));

      keysInRow.forEach((k, kIndex) => {
        let w = keyWidth;
        if (k.row === 'space') {
          w = 200; // Barra espaciadora amplia
        }
        const x = rowStartX + (kIndex * (keyWidth + keyGap));
        this.keyPositions.set(k.code, { x, y: rowY, w, h: keyHeight, info: k });
      });
    });
  }

  public render(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    baseY: number,
    fadeOpacity: number,
    targetFinger: string | null,
    targetKey: string | null,
    activeAnchorPulse: number
  ): void {
    if (fadeOpacity <= 0.05) return;

    this.calculateLayout(centerX, baseY);

    ctx.save();
    ctx.globalAlpha = fadeOpacity;

    // 1. Render de las Teclas Virtuales
    for (const [, pos] of this.keyPositions) {
      const isTarget = targetKey && pos.info.key.toLowerCase() === targetKey.toLowerCase();
      const isAnchor = pos.info.isAnchor;

      // Fondo de la tecla
      ctx.fillStyle = isTarget ? pos.info.color : '#FFFFFF';
      ctx.strokeStyle = pos.info.color;
      ctx.lineWidth = isTarget ? 3 : 1.5;

      // Sombra suave
      ctx.shadowColor = isTarget ? pos.info.color : 'rgba(0, 0, 0, 0.04)';
      ctx.shadowBlur = isTarget ? 16 : 4;

      this.roundRect(ctx, pos.x, pos.y, pos.w, pos.h, 8);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Anclaje táctil en F y J (Pulso continuo de referencia visual)
      if (isAnchor) {
        ctx.strokeStyle = isTarget ? '#FFFFFF' : pos.info.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const pulseRadius = 5 + Math.sin(activeAnchorPulse * 4) * 2;
        ctx.arc(pos.x + pos.w / 2, pos.y + pos.h - 8, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Si estamos en Nivel 1 (100%), mostramos las letras. En Nivel 2 (50%), solo los bloques cromáticos
      if (fadeOpacity > 0.6) {
        ctx.fillStyle = isTarget ? '#FFFFFF' : '#1E293B';
        ctx.font = '600 14px "Outfit", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pos.info.display, pos.x + pos.w / 2, pos.y + pos.h / 2);
      }
    }

    // 2. Render de Silueta Holográfica de Manos Flotantes (Totalmente despejadas bajo la barra espaciadora)
    this.renderHolographicHands(ctx, centerX, baseY + 295, targetFinger, fadeOpacity);

    ctx.restore();
  }

  private renderHolographicHands(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    handsY: number,
    targetFinger: string | null,
    fadeOpacity: number
  ): void {
    const handSpread = 150;
    const fingersLeft: { name: FingerName; x: number; y: number; r: number }[] = [
      { name: 'left-pinky',  x: centerX - handSpread - 85, y: handsY - 30, r: 13 },
      { name: 'left-ring',   x: centerX - handSpread - 50, y: handsY - 50, r: 14 },
      { name: 'left-middle', x: centerX - handSpread - 15, y: handsY - 60, r: 15 },
      { name: 'left-index',  x: centerX - handSpread + 20, y: handsY - 40, r: 14 },
      { name: 'thumbs',      x: centerX - handSpread + 50, y: handsY + 10,  r: 15 }
    ];

    const fingersRight: { name: FingerName; x: number; y: number; r: number }[] = [
      { name: 'thumbs',       x: centerX + handSpread - 50, y: handsY + 10,  r: 15 },
      { name: 'right-index',  x: centerX + handSpread - 20, y: handsY - 40, r: 14 },
      { name: 'right-middle', x: centerX + handSpread + 15, y: handsY - 60, r: 15 },
      { name: 'right-ring',   x: centerX + handSpread + 50, y: handsY - 50, r: 14 },
      { name: 'right-pinky',  x: centerX + handSpread + 85, y: handsY - 30, r: 13 }
    ];

    // Siluetas de palmas translúcidas
    ctx.save();
    ctx.fillStyle = 'rgba(241, 245, 249, 0.45)';
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
    ctx.lineWidth = 2;

    // Palma Izquierda
    this.roundRect(ctx, centerX - handSpread - 75, handsY - 5, 105, 70, 22);
    ctx.fill();
    ctx.stroke();

    // Palma Derecha
    this.roundRect(ctx, centerX + handSpread - 30, handsY - 5, 105, 70, 22);
    ctx.fill();
    ctx.stroke();

    // Render de Dedos con Iluminación Dinámica
    const allFingers = [...fingersLeft, ...fingersRight];
    for (const f of allFingers) {
      const isTarget = targetFinger === f.name;
      const fingerMeta = FINGER_COLORS[f.name];

      ctx.fillStyle = isTarget ? fingerMeta.color : '#FFFFFF';
      ctx.strokeStyle = fingerMeta.color;
      ctx.lineWidth = isTarget ? 3.5 : 2;

      if (isTarget) {
        ctx.shadowColor = fingerMeta.color;
        ctx.shadowBlur = 18;
      }

      ctx.beginPath();
      ctx.arc(f.x, f.y, isTarget ? f.r * 1.25 : f.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Etiqueta del dedo
      if (fadeOpacity > 0.6) {
        ctx.fillStyle = isTarget ? '#FFFFFF' : '#64748B';
        ctx.font = '600 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fingerMeta.hand, f.x, f.y);
      }
    }

    ctx.restore();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
