/**
 * Modal de Calibración de Dificultad, Tolerancia Rítmica y Audio
 * Permite adaptar la tolerancia temporal y velocidad de notas a cada usuario.
 */

import { DifficultyManager, DifficultyPreset, DifficultySettings } from '../config/difficulty';

export interface SettingsModalCallbacks {
  onSettingsChanged: (settings: DifficultySettings) => void;
  onTestSound: () => void;
}

export class SettingsModal {
  private overlay: HTMLDivElement;
  private manager: DifficultyManager;
  private callbacks: SettingsModalCallbacks;

  constructor(manager: DifficultyManager, callbacks: SettingsModalCallbacks) {
    this.manager = manager;
    this.callbacks = callbacks;

    this.overlay = document.createElement('div');
    this.overlay.id = 'settings-modal';
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
    const s = this.manager.getSettings();

    this.overlay.innerHTML = `
      <div class="modal-card settings-card">
        <header class="modal-header">
          <div class="header-titles">
            <h2 class="settings-title">⚙️ Calibración de Dificultad y Ritmo</h2>
            <p class="settings-sub">Ajusta la tolerancia de tiempo y la velocidad según el ritmo de cada usuario.</p>
          </div>
          <button id="btn-close-settings" class="btn-close">✕</button>
        </header>

        <div class="settings-body">
          <!-- 1. Presets de Dificultad -->
          <div class="setting-group">
            <label class="setting-group-title">🎯 Preset de Dificultad</label>
            <div class="preset-buttons">
              <button class="preset-btn ${s.preset === 'beginner' ? 'active' : ''}" data-preset="beginner">
                <span class="preset-icon">🟢</span>
                <span class="preset-name">Niños / Principiante</span>
                <span class="preset-desc">Tiempo de reacción lento (2.5s) y ventanas amplias (±65ms).</span>
              </button>
              <button class="preset-btn ${s.preset === 'normal' ? 'active' : ''}" data-preset="normal">
                <span class="preset-icon">🟡</span>
                <span class="preset-name">Intermedio</span>
                <span class="preset-desc">Tiempo de reacción medio (1.9s) y ventanas normales (±45ms).</span>
              </button>
              <button class="preset-btn ${s.preset === 'expert' ? 'active' : ''}" data-preset="expert">
                <span class="preset-icon">🔴</span>
                <span class="preset-name">Desafío</span>
                <span class="preset-desc">Para mecanógrafos expertos (1.4s) y ventanas estrictas (±25ms).</span>
              </button>
            </div>
          </div>

          <!-- 2. Ajustes Manuales Precisos -->
          <div class="setting-group">
            <label class="setting-group-title">⏱️ Tiempo de Aproximación Visual (Velocidad de Notas)</label>
            <div class="slider-row">
              <input type="range" id="slider-approach" min="1.4" max="3.0" step="0.1" value="${s.approachTime}">
              <span id="val-approach" class="slider-val">${s.approachTime.toFixed(1)} segundos</span>
            </div>
            <p class="slider-hint">Define cuánto tiempo tarda la nota desde que aparece arriba hasta que toca la línea.</p>
          </div>

          <!-- 3. Calibración de Latencia de Audio (Offset) -->
          <div class="setting-group">
            <label class="setting-group-title">🎧 Calibración de Latencia de Audio (Offset)</label>
            <div class="slider-row">
              <input type="range" id="slider-offset" min="-100" max="100" step="5" value="${s.audioOffsetMs}">
              <span id="val-offset" class="slider-val">${s.audioOffsetMs > 0 ? '+' : ''}${s.audioOffsetMs} ms</span>
              <button id="btn-test-sound" class="btn-sm-glass">Probar Sonido 🔔</button>
            </div>
            <p class="slider-hint">Compensa el retardo de altavoces Bluetooth o monitores externos.</p>
          </div>

          <!-- 4. Volúmenes -->
          <div class="setting-grid-2">
            <div class="setting-group">
              <label class="setting-group-title">🎵 Volumen Música</label>
              <input type="range" id="slider-vol-music" min="0" max="1" step="0.05" value="${s.musicVolume}">
            </div>
            <div class="setting-group">
              <label class="setting-group-title">🔔 Volumen Teclas</label>
              <input type="range" id="slider-vol-sfx" min="0" max="1" step="0.05" value="${s.sfxVolume}">
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button id="btn-save-settings" class="btn-primary-glow">Guardar y Aplicar</button>
        </footer>
      </div>
    `;

    // Listeners
    const closeBtn = this.overlay.querySelector('#btn-close-settings');
    if (closeBtn) closeBtn.addEventListener('click', () => this.hide());

    const saveBtn = this.overlay.querySelector('#btn-save-settings');
    if (saveBtn) saveBtn.addEventListener('click', () => this.hide());

    // Botones de presets
    const presetBtns = this.overlay.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = (e.currentTarget as HTMLElement).getAttribute('data-preset') as DifficultyPreset;
        this.manager.applyPreset(preset);
        this.callbacks.onSettingsChanged(this.manager.getSettings());
        this.render();
      });
    });

    // Slider approach time
    const sliderApproach = this.overlay.querySelector('#slider-approach') as HTMLInputElement;
    const valApproach = this.overlay.querySelector('#val-approach') as HTMLElement;
    if (sliderApproach) {
      sliderApproach.addEventListener('input', () => {
        const val = parseFloat(sliderApproach.value);
        valApproach.textContent = `${val.toFixed(1)} segundos`;
        this.manager.updateCustom({ approachTime: val });
        this.callbacks.onSettingsChanged(this.manager.getSettings());
      });
    }

    // Slider offset
    const sliderOffset = this.overlay.querySelector('#slider-offset') as HTMLInputElement;
    const valOffset = this.overlay.querySelector('#val-offset') as HTMLElement;
    if (sliderOffset) {
      sliderOffset.addEventListener('input', () => {
        const val = parseInt(sliderOffset.value, 10);
        valOffset.textContent = `${val > 0 ? '+' : ''}${val} ms`;
        this.manager.updateCustom({ audioOffsetMs: val });
        this.callbacks.onSettingsChanged(this.manager.getSettings());
      });
    }

    // Botón test sound
    const btnTest = this.overlay.querySelector('#btn-test-sound');
    if (btnTest) {
      btnTest.addEventListener('click', () => this.callbacks.onTestSound());
    }

    // Sliders de volumen
    const sliderVolMusic = this.overlay.querySelector('#slider-vol-music') as HTMLInputElement;
    if (sliderVolMusic) {
      sliderVolMusic.addEventListener('input', () => {
        const val = parseFloat(sliderVolMusic.value);
        this.manager.updateCustom({ musicVolume: val });
        this.callbacks.onSettingsChanged(this.manager.getSettings());
      });
    }

    const sliderVolSfx = this.overlay.querySelector('#slider-vol-sfx') as HTMLInputElement;
    if (sliderVolSfx) {
      sliderVolSfx.addEventListener('input', () => {
        const val = parseFloat(sliderVolSfx.value);
        this.manager.updateCustom({ sfxVolume: val });
        this.callbacks.onSettingsChanged(this.manager.getSettings());
      });
    }
  }
}
