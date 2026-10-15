/**
 * Gestor de Puntuaciones y Récords Locales (Self-Determination Theory - Competencia)
 * Guarda las mejores marcas de cada canción en LocalStorage para motivar el progreso infantil.
 */

export interface TrackRecord {
  trackId: string;
  highScore: number;
  bestAccuracy: number;
  maxCombo: number;
  bestWpm: number;
  bestGrade: 'S' | 'A' | 'B' | 'C' | 'D';
  playedCount: number;
  lastPlayed: number;
}

const STORAGE_KEY = 'typoniac_records_v1';

export class ScoreManager {
  private static records: Record<string, TrackRecord> | null = null;

  private static load(): Record<string, TrackRecord> {
    if (this.records) return this.records;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.records = raw ? JSON.parse(raw) : {};
    } catch {
      this.records = {};
    }
    return this.records!;
  }

  public static getRecord(trackId: string): TrackRecord | null {
    const all = this.load();
    return all[trackId] || null;
  }

  public static getAllRecords(): Record<string, TrackRecord> {
    return this.load();
  }

  public static saveResult(
    trackId: string,
    score: number,
    accuracy: number,
    combo: number,
    wpm: number,
    grade: 'S' | 'A' | 'B' | 'C' | 'D'
  ): { isNewHighScore: boolean; isNewBestGrade: boolean } {
    const all = this.load();
    const existing = all[trackId];

    let isNewHighScore = false;
    let isNewBestGrade = false;

    const gradeOrder: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };

    if (!existing) {
      isNewHighScore = true;
      isNewBestGrade = true;
      all[trackId] = {
        trackId,
        highScore: score,
        bestAccuracy: accuracy,
        maxCombo: combo,
        bestWpm: wpm,
        bestGrade: grade,
        playedCount: 1,
        lastPlayed: Date.now()
      };
    } else {
      isNewHighScore = score > existing.highScore;
      isNewBestGrade = (gradeOrder[grade] || 0) > (gradeOrder[existing.bestGrade] || 0);

      all[trackId] = {
        trackId,
        highScore: Math.max(existing.highScore, score),
        bestAccuracy: Math.max(existing.bestAccuracy, accuracy),
        maxCombo: Math.max(existing.maxCombo, combo),
        bestWpm: Math.max(existing.bestWpm, wpm),
        bestGrade: isNewBestGrade ? grade : existing.bestGrade,
        playedCount: existing.playedCount + 1,
        lastPlayed: Date.now()
      };
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn('[ScoreManager] Error al guardar récord en localStorage:', e);
    }

    return { isNewHighScore, isNewBestGrade };
  }
}
