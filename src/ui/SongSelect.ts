/**
 * Selector de Canciones Curadas por Fases de Fitts & Posner
 */

import { CURATED_TRACKS, BeatmapData } from '../config/songs';

export class SongSelect {
  private overlay: HTMLDivElement;
  private onSelectTrack: (track: BeatmapData) => void;

  constructor(onSelectTrack: (track: BeatmapData) => void) {
    this.onSelectTrack = onSelectTrack;

    this.overlay = document.createElement('div');
    this.overlay.id = 'song-select-modal';
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
      <div class="modal-card">
        <header class="modal-header">
          <div class="header-titles">
            <h1 class="logo-title">TYPONIAC</h1>
            <p class="logo-sub">Mecanografía Rítmica Cristalina • OSU! Light Edition</p>
          </div>
          <button id="btn-close-modal" class="btn-close">✕</button>
        </header>

        <div class="track-grid">
          ${CURATED_TRACKS.map(track => `
            <div class="track-card level-${track.level}" data-id="${track.id}">
              <div class="card-badge">Fase ${track.level} • ${track.age}</div>
              <div class="card-body">
                <h3 class="track-title">${track.title}</h3>
                <p class="track-artist">${track.artist}</p>
                <p class="track-desc">${track.description}</p>
              </div>
              <div class="card-footer">
                <span class="bpm-tag">${track.bpm} BPM</span>
                <button class="btn-play-track" data-id="${track.id}">JUGAR ▶</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const closeBtn = this.overlay.querySelector('#btn-close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    const playBtns = this.overlay.querySelectorAll('.btn-play-track');
    playBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const track = CURATED_TRACKS.find(t => t.id === id);
        if (track) {
          this.hide();
          this.onSelectTrack(track);
        }
      });
    });
  }
}
