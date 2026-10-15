/**
 * Temporizador de Higiene Digital (15 minutos)
 * Previene la fatiga neuromuscular de muñecas en niños y consolida la memoria motora procedimental.
 */

export type PauseCallback = () => void;

export class HygieneTimer {
  private readonly SESSION_DURATION_SEC = 15 * 60; // 15 minutos en segundos
  private elapsedSeconds = 0;
  private intervalId: number | null = null;
  private onTriggerPause: PauseCallback | null = null;
  private isPaused = false;

  constructor(onTriggerPause: PauseCallback) {
    this.onTriggerPause = onTriggerPause;
  }

  public start(): void {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => {
      if (this.isPaused) return;
      this.elapsedSeconds++;

      if (this.elapsedSeconds >= this.SESSION_DURATION_SEC) {
        this.elapsedSeconds = 0;
        if (this.onTriggerPause) {
          this.onTriggerPause();
        }
      }
    }, 1000);
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public reset(): void {
    this.elapsedSeconds = 0;
  }

  public getRemainingSeconds(): number {
    return Math.max(0, this.SESSION_DURATION_SEC - this.elapsedSeconds);
  }

  public getFormattedRemaining(): string {
    const rem = this.getRemainingSeconds();
    const mins = Math.floor(rem / 60);
    const secs = rem % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
