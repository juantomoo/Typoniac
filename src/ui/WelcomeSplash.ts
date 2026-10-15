/**
 * Pantalla de Splash y Menú Principal de Bienvenida
 * Estética cristalina "OSU! Light", amigable y sin prisa motora.
 * Incluye accesos directos al Tutorial, Canciones y Calibración de Dificultad.
 */

import { BeatmapData } from '../config/songs';

export interface SplashActions {
  onStartTutorial: () => void;
  onSelectSong: (track: BeatmapData) => void;
  onOpenSongCatalog: () => void;
  onOpenProgressionCatalog: () => void;
  onOpenZenCatalog: () => void;
  onOpenSettings: () => void;
}

export class WelcomeSplash {
  private overlay: HTMLDivElement;
  private actions: SplashActions;

  constructor(actions: SplashActions) {
    this.actions = actions;

    this.overlay = document.createElement('div');
    this.overlay.id = 'welcome-splash-modal';
    this.overlay.className = 'modal-backdrop';
    document.body.appendChild(this.overlay);

    this.render();
  }

  public show(): void {
    this.render();
    this.overlay.classList.remove('hidden');
  }

  public hide(): void {
    this.overlay.classList.add('hidden');
  }

  private render(): void {
    this.overlay.innerHTML = `
      <div class="modal-card splash-card">
        <header class="splash-hero">
          <div class="hero-badge">✨ EDICIÓN MULTI-MODO • OSU! LIGHT & ZEN</div>
          <h1 class="splash-logo">TYPONIAC</h1>
          <p class="splash-tagline">
            Mecanografía al Tacto para Niños y Creadores
          </p>
          <p class="splash-subtext">
            Aprende a escribir con fluidez, sin mirar el teclado y sin estrés sensorial. Elige tu modo de juego favorito:
          </p>
        </header>

        <div class="splash-options splash-three-modes">
          <!-- Modo 1: Escuela de Teclas (Progresiones no musicales) -->
          <div class="splash-card-opt opt-progression" id="btn-splash-progression">
            <div class="opt-icon">⌨️</div>
            <div class="opt-content">
              <h3>Escuela de Teclas</h3>
              <p>Progresiones paso a paso sin música. De F y J a todas las letras, mayúsculas y números.</p>
              <span class="opt-badge badge-green">20 Etapas • 5 Niveles Guiados</span>
            </div>
          </div>

          <!-- Modo 2: Aventura Rítmica Musical (OSU! Light) -->
          <div class="splash-card-opt opt-play" id="btn-splash-rhythm">
            <div class="opt-icon">🎵</div>
            <div class="opt-content">
              <h3>Aventura Rítmica</h3>
              <p>Música cristalina sincronizada con tus pulsaciones. Minecraft, Totoro, Mario y más.</p>
              <span class="opt-badge badge-blue">Estilo OSU! Light • 6 Canciones</span>
            </div>
          </div>

          <!-- Modo 3: Escritura Zen Cosy (Textos y Fábulas) -->
          <div class="splash-card-opt opt-zen" id="btn-splash-zen">
            <div class="opt-icon">🍃</div>
            <div class="opt-content">
              <h3>Escritura Zen Cosy</h3>
              <p>Palabras, cuentos del Principito, fábulas y bosques andinos. Escribe en calma evaluando tu velocidad.</p>
              <span class="opt-badge badge-zen">Cero Estrés • WPM & Precisión</span>
            </div>
          </div>
        </div>

        <div class="splash-sub-actions">
          <button id="btn-splash-tutorial" class="btn-glass">
            🎓 Tutorial Casa Base (F / J)
          </button>
          <button id="btn-splash-settings" class="btn-glass">
            ⚙️ Calibrar Dificultad y Sonido
          </button>
        </div>

        <footer class="splash-footer">
          <span class="footer-tip">💡 <strong>Consejo Neuropedagógico:</strong> Coloca tus índices en los relieves de F y J para orientar tus manos sin mirar.</span>
        </footer>
      </div>
    `;

    // Listeners
    const btnProg = this.overlay.querySelector('#btn-splash-progression');
    if (btnProg) {
      btnProg.addEventListener('click', () => {
        this.hide();
        this.actions.onOpenProgressionCatalog();
      });
    }

    const btnRhythm = this.overlay.querySelector('#btn-splash-rhythm');
    if (btnRhythm) {
      btnRhythm.addEventListener('click', () => {
        this.hide();
        this.actions.onOpenSongCatalog();
      });
    }

    const btnZen = this.overlay.querySelector('#btn-splash-zen');
    if (btnZen) {
      btnZen.addEventListener('click', () => {
        this.hide();
        this.actions.onOpenZenCatalog();
      });
    }

    const btnTut = this.overlay.querySelector('#btn-splash-tutorial');
    if (btnTut) {
      btnTut.addEventListener('click', () => {
        this.hide();
        this.actions.onStartTutorial();
      });
    }

    const btnSettings = this.overlay.querySelector('#btn-splash-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        this.actions.onOpenSettings();
      });
    }
  }
}
