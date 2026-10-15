/**
 * Modal de Selección de Etapas de Progresión de Teclas (Escuela de Teclas)
 * Permite a niños y educadores seleccionar lecciones organizadas por hileras anatómicas.
 */

import { PROGRESSION_STAGES, ProgressionStage } from '../config/progressionStages';

export class ProgressionModal {
  private overlay: HTMLDivElement;
  private onSelectStage: (stage: ProgressionStage) => void;

  constructor(onSelectStage: (stage: ProgressionStage) => void) {
    this.onSelectStage = onSelectStage;

    this.overlay = document.createElement('div');
    this.overlay.id = 'progression-select-modal';
    this.overlay.className = 'modal-backdrop hidden';
    document.body.appendChild(this.overlay);
  }

  public show(): void {
    this.overlay.classList.remove('hidden');
    this.render();
  }

  public hide(): void {
    this.overlay.classList.add('hidden');
  }

  private render(): void {
    // Agrupar por nivel
    const levels = [1, 2, 3, 4, 5] as const;

    this.overlay.innerHTML = `
      <div class="modal-card modal-wide">
        <header class="modal-header">
          <div class="header-titles">
            <h1 class="logo-title">ESCUELA DE TECLAS</h1>
            <p class="logo-sub">Progresión Paso a Paso Sin Música • Fundamentada en la Ley de Fitts</p>
          </div>
          <button id="btn-close-progression" class="btn-close">✕</button>
        </header>

        <div class="progression-levels-container">
          ${levels.map(lvl => {
            const stages = PROGRESSION_STAGES.filter(s => s.level === lvl);
            return `
              <div class="prog-level-group">
                <div class="prog-level-header">
                  <h3>${stages[0]?.levelTitle || `Nivel ${lvl}`}</h3>
                  <span class="prog-level-count">${stages.length} lecciones</span>
                </div>
                <div class="prog-stage-grid">
                  ${stages.map(st => `
                    <div class="prog-stage-card" data-id="${st.id}">
                      <div class="st-top">
                        <span class="st-num">Lección ${st.stageNumber}</span>
                        <div class="st-keys">
                          ${st.newKeys.map(k => `<span class="st-key-badge">${k.toUpperCase()}</span>`).join('')}
                        </div>
                      </div>
                      <h4 class="st-title">${st.title}</h4>
                      <p class="st-desc">${st.description}</p>
                      <button class="btn-start-stage" data-id="${st.id}">PRACTICAR ▶</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.overlay.querySelector('#btn-close-progression')?.addEventListener('click', () => {
      this.hide();
    });

    const playBtns = this.overlay.querySelectorAll('.btn-start-stage');
    playBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const stage = PROGRESSION_STAGES.find(s => s.id === id);
        if (stage) {
          this.hide();
          this.onSelectStage(stage);
        }
      });
    });
  }
}
