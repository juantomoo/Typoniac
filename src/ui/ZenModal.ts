/**
 * Modal de Selección de Textos Cosy y Relajantes (Modo Zen)
 * Textos literarios, fábulas y naturaleza para escribir a ritmo propio sin penalizaciones.
 */

import { ZEN_TEXTS, ZenTextItem } from '../config/zenTexts';

export class ZenModal {
  private overlay: HTMLDivElement;
  private onSelectText: (textItem: ZenTextItem) => void;

  constructor(onSelectText: (textItem: ZenTextItem) => void) {
    this.onSelectText = onSelectText;

    this.overlay = document.createElement('div');
    this.overlay.id = 'zen-select-modal';
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
    this.overlay.innerHTML = `
      <div class="modal-card modal-wide zen-select-card">
        <header class="modal-header">
          <div class="header-titles">
            <h1 class="logo-title">ESCRITURA ZEN COSY</h1>
            <p class="logo-sub">Textos Literarios, Fábulas y Naturaleza • Sin Tiempo Límite ni Penalizaciones</p>
          </div>
          <button id="btn-close-zen" class="btn-close">✕</button>
        </header>

        <div class="zen-text-grid">
          ${ZEN_TEXTS.map(item => `
            <div class="zen-card" style="border-left: 4px solid ${item.calmPalette.accent}">
              <div class="zen-card-header">
                <span class="zen-cat-badge">${item.categoryTitle}</span>
                <span class="zen-words-count">${item.wordCount} palabras</span>
              </div>
              <h3 class="zen-title">${item.title}</h3>
              <p class="zen-author">por ${item.author}</p>
              <p class="zen-preview">${item.text.substring(0, 110)}...</p>
              <div class="zen-card-footer">
                <button class="btn-start-zen" data-id="${item.id}" style="background: ${item.calmPalette.accent}">
                  ESCRIBIR CON CALMA ▶
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.overlay.querySelector('#btn-close-zen')?.addEventListener('click', () => {
      this.hide();
    });

    const playBtns = this.overlay.querySelectorAll('.btn-start-zen');
    playBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const textItem = ZEN_TEXTS.find(t => t.id === id);
        if (textItem) {
          this.hide();
          this.onSelectText(textItem);
        }
      });
    });
  }
}
