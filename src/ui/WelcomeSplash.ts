/**
 * Pantalla de Splash y Menú Principal de Bienvenida
 * Estética cristalina "OSU! Light", amigable y sin prisa motora.
 * Incluye accesos directos al Tutorial, Canciones y Calibración de Dificultad.
 */

import { BeatmapData, CURATED_TRACKS } from '../config/songs';

export interface SplashActions {
  onStartTutorial: () => void;
  onSelectSong: (track: BeatmapData) => void;
  onOpenSongCatalog: () => void;
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
    this.overlay.classList.remove('hidden');
  }

  public hide(): void {
    this.overlay.classList.add('hidden');
  }

  private render(): void {
    const firstTrack = CURATED_TRACKS[0];

    this.overlay.innerHTML = `
      <div class="modal-card splash-card">
        <header class="splash-hero">
          <div class="hero-badge">✨ EDICIÓN INFANTIL • OSU! LIGHT</div>
          <h1 class="splash-logo">TYPONIAC</h1>
          <p class="splash-tagline">
            Mecanografía Rítmica al Tacto para Niños de 5 a 10 Años
          </p>
          <p class="splash-subtext">
            Transforma tus dedos en pequeños bailarines. Aprende a escribir sin mirar el teclado mientras tocas música cristalina al compás.
          </p>
        </header>

        <div class="splash-options">
          <!-- Opción 1: Tutorial Guiado -->
          <div class="splash-card-opt opt-tutorial" id="btn-splash-tutorial">
            <div class="opt-icon">🎓</div>
            <div class="opt-content">
              <h3>Modo Tutorial: La Casa Base</h3>
              <p>Aprende paso a paso dónde colocar tus dedos en las teclas F y J sin límite de tiempo.</p>
              <span class="opt-badge">Recomendado para empezar</span>
            </div>
          </div>

          <!-- Opción 2: Primera Canción Nivel 1 -->
          <div class="splash-card-opt opt-play" id="btn-splash-first-song">
            <div class="opt-icon">🎵</div>
            <div class="opt-content">
              <h3>Nivel 1: Subwoofer Lullaby</h3>
              <p>Música suave de Minecraft a 70 BPM. Curva lenta y guiada para la Hilera Central.</p>
              <span class="opt-badge badge-green">Fase Cognitiva (5-7 años)</span>
            </div>
          </div>

          <!-- Opción 3: Catálogo Completo -->
          <div class="splash-card-opt opt-levels" id="btn-splash-all-songs">
            <div class="opt-icon">📑</div>
            <div class="opt-content">
              <h3>Elegir Canción y Niveles</h3>
              <p>Explora pistas de Mario 64, Ghibli Totoro, Viva La Vida, Undertale y Daft Punk.</p>
              <span class="opt-badge badge-blue">Niveles 1, 2 y 3</span>
            </div>
          </div>
        </div>

        <div class="splash-sub-actions">
          <button id="btn-splash-settings" class="btn-glass btn-settings-wide">
            ⚙️ Calibrar Dificultad, Tolerancia Rítmica y Sonido
          </button>
        </div>

        <footer class="splash-footer">
          <span class="footer-tip">💡 <strong>Consejo Neuropedagógico:</strong> Mantén tus dedos relajados sobre la fila central (A-S-D-F y J-K-L-Ñ).</span>
        </footer>
      </div>
    `;

    // Listeners
    const btnTut = this.overlay.querySelector('#btn-splash-tutorial');
    if (btnTut) {
      btnTut.addEventListener('click', () => {
        this.hide();
        this.actions.onStartTutorial();
      });
    }

    const btnPlay = this.overlay.querySelector('#btn-splash-first-song');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        this.hide();
        this.actions.onSelectSong(firstTrack);
      });
    }

    const btnAll = this.overlay.querySelector('#btn-splash-all-songs');
    if (btnAll) {
      btnAll.addEventListener('click', () => {
        this.hide();
        this.actions.onOpenSongCatalog();
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
