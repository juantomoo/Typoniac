/**
 * Selector de Canciones Curadas por Fases de Fitts & Posner
 */

import { CURATED_TRACKS, BeatmapData } from '../config/songs';
import { ScoreManager } from '../config/scores';

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
    const records = ScoreManager.getAllRecords();

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
          ${CURATED_TRACKS.map(track => {
            const rec = records[track.id];
            return `
            <div class="track-card level-${track.level}" data-id="${track.id}">
              <div class="card-badge-row">
                <span class="card-badge">Fase ${track.level} • ${track.age}</span>
                ${rec ? `
                  <span class="card-record-badge grade-${rec.bestGrade}">
                    ⭐ Rango ${rec.bestGrade} • ${rec.bestAccuracy}%
                  </span>
                ` : `
                  <span class="card-record-badge record-new">
                    ✨ Nueva
                  </span>
                `}
              </div>
              <div class="card-body">
                <h3 class="track-title">${track.title}</h3>
                <p class="track-artist">${track.artist}</p>
                <p class="track-desc">${track.description}</p>
                ${rec ? `
                  <div class="track-record-stats">
                    <span>Mejor: <strong>${rec.highScore.toLocaleString()}</strong> pts</span>
                    <span>WPM: <strong>${rec.bestWpm}</strong></span>
                    <span>Combo: <strong>${rec.maxCombo}x</strong></span>
                  </div>
                ` : ''}
              </div>
              <div class="card-footer">
                <span class="bpm-tag">${track.bpm} BPM</span>
                <button class="btn-play-track" data-id="${track.id}">JUGAR ▶</button>
              </div>
            </div>
            `;
          }).join('')}
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
