/**
 * Modal de Pausa de Higiene Digital (15 Minutos)
 * Rutina kinestésica guiada para descansar muñecas y consolidar memoria motora en niños.
 */

export class PauseModal {
  private overlay: HTMLDivElement;
  private onResume: () => void;
  private countdown = 60;
  private intervalId: number | null = null;

  constructor(onResume: () => void) {
    this.onResume = onResume;

    this.overlay = document.createElement('div');
    this.overlay.id = 'hygiene-pause-modal';
    this.overlay.className = 'modal-backdrop hidden';
    document.body.appendChild(this.overlay);
  }

  public show(): void {
    this.overlay.classList.remove('hidden');
    this.countdown = 60;
    this.render();

    if (this.intervalId) window.clearInterval(this.intervalId);
    this.intervalId = window.setInterval(() => {
      this.countdown--;
      const timerSpan = this.overlay.querySelector('#countdown-num');
      if (timerSpan) {
        timerSpan.textContent = `${this.countdown}s`;
      }
      if (this.countdown <= 0) {
        this.close();
      }
    }, 1000);
  }

  public close(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.overlay.classList.add('hidden');
    this.onResume();
  }

  private render(): void {
    this.overlay.innerHTML = `
      <div class="modal-card pause-card">
        <div class="pause-icon">🌟</div>
        <h2 class="pause-title">¡Tiempo de Estrellas de Mar!</h2>
        <p class="pause-sub">
          Llevas 15 minutos tocando música con tus dedos. Es hora de estirar para que tu cerebro guarde el ritmo.
        </p>

        <div class="exercise-boxes">
          <div class="ex-box">
            <span class="ex-emoji">🖐️ ✊</span>
            <h4>Estrellas de mar</h4>
            <p>Abre bien los dedos y ciérralos despacio 5 veces.</p>
          </div>
          <div class="ex-box">
            <span class="ex-emoji">🔄</span>
            <h4>Giros de muñeca</h4>
            <p>Gira tus manos suavemente en círculos hacia la derecha y la izquierda.</p>
          </div>
          <div class="ex-box">
            <span class="ex-emoji">👀</span>
            <h4>Regla 20-20</h4>
            <p>Mira a una ventana o al objeto más lejano de tu habitación.</p>
          </div>
        </div>

        <div class="pause-timer-ring">
          Descanso sugerido: <strong id="countdown-num">${this.countdown}s</strong>
        </div>

        <button id="btn-resume-game" class="btn-primary-glow">¡Listo para continuar! 🚀</button>
      </div>
    `;

    const resumeBtn = this.overlay.querySelector('#btn-resume-game');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => this.close());
    }
  }
}
