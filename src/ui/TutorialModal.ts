/**
 * Interfaz Visual del Modo Tutorial Paso a Paso
 */

import { TUTORIAL_STEPS, TutorialStep } from '../config/tutorial';

export class TutorialModal {
  private overlay: HTMLDivElement;
  private currentStepIndex: number = 0;
  private onCompleteTutorial: () => void;
  private onKeyHitSuccess: (step: TutorialStep) => void;

  constructor(
    onCompleteTutorial: () => void,
    onKeyHitSuccess: (step: TutorialStep) => void
  ) {
    this.onCompleteTutorial = onCompleteTutorial;
    this.onKeyHitSuccess = onKeyHitSuccess;

    this.overlay = document.createElement('div');
    this.overlay.id = 'tutorial-modal';
    this.overlay.className = 'modal-backdrop hidden';
    document.body.appendChild(this.overlay);
  }

  public start(): void {
    this.currentStepIndex = 0;
    this.overlay.classList.remove('hidden');
    this.render();
  }

  public hide(): void {
    this.overlay.classList.add('hidden');
  }

  public getCurrentStep(): TutorialStep | null {
    if (this.currentStepIndex >= TUTORIAL_STEPS.length) return null;
    return TUTORIAL_STEPS[this.currentStepIndex];
  }

  public handleKeyPress(key: string): boolean {
    if (this.overlay.classList.contains('hidden')) return false;

    const currentStep = this.getCurrentStep();
    if (!currentStep) return false;

    if (key.toLowerCase() === currentStep.targetKey.toLowerCase()) {
      this.onKeyHitSuccess(currentStep);
      this.showStepSuccess();
      return true;
    }
    return false;
  }

  private showStepSuccess(): void {
    const keyBox = this.overlay.querySelector('.tut-target-key');
    if (keyBox) {
      keyBox.classList.add('tut-key-success');
    }

    setTimeout(() => {
      this.currentStepIndex++;
      if (this.currentStepIndex >= TUTORIAL_STEPS.length) {
        this.renderCompletion();
      } else {
        this.render();
      }
    }, 600);
  }

  private render(): void {
    const step = TUTORIAL_STEPS[this.currentStepIndex];

    this.overlay.innerHTML = `
      <div class="modal-card tut-card">
        <header class="modal-header">
          <div class="tut-progress">Paso ${step.id} de ${TUTORIAL_STEPS.length}</div>
          <button id="btn-tut-close" class="btn-close">✕</button>
        </header>

        <div class="tut-body">
          <h2 class="tut-title">${step.title}</h2>
          <p class="tut-inst">${step.instruction}</p>

          <div class="tut-key-display">
            <div class="tut-target-key" style="border-color: ${step.color}; color: ${step.color}">
              ${step.targetKey === ' ' ? 'ESPACIO' : step.targetKey.toUpperCase()}
            </div>
            <div class="tut-finger-badge" style="background-color: ${step.color}">
              ${step.fingerHand} • ${step.expectedFinger}
            </div>
          </div>

          <p class="tut-hint">👇 ${step.hint}</p>
        </div>
      </div>
    `;

    const closeBtn = this.overlay.querySelector('#btn-tut-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
  }

  private renderCompletion(): void {
    this.overlay.innerHTML = `
      <div class="modal-card tut-card tut-card-complete">
        <div class="tut-trophy">🌟</div>
        <h2 class="tut-title">¡Misión Cumplida!</h2>
        <p class="tut-inst">
          Tus dedos ya conocen la Casa Base (F y J). Tu cerebro ya está preparado para sentir el ritmo de la música.
        </p>

        <button id="btn-start-game-after-tut" class="btn-primary-glow">
          ¡Comenzar Nivel 1: Subwoofer Lullaby! 🚀
        </button>
      </div>
    `;

    const btnStart = this.overlay.querySelector('#btn-start-game-after-tut');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.hide();
        this.onCompleteTutorial();
      });
    }
  }
}
