/**
 * Configuración de Dificultad, Tolerancia Rítmica y Calibración
 * Valores neuropedagógicos adaptados para niños de 5 a 10 años y principiantes.
 */

export type DifficultyPreset = 'beginner' | 'normal' | 'expert';

export interface DifficultySettings {
  preset: DifficultyPreset;
  approachTime: number;       // Tiempo en segundos desde que aparece la nota hasta la línea de impacto
  windowPerfect: number;      // Segundos (ej. 0.065 = ±65ms)
  windowGreat: number;        // Segundos (ej. 0.130 = ±130ms)
  windowGood: number;         // Segundos (ej. 0.220 = ±220ms) - Nivel benévolo para evitar frustración
  windowMiss: number;         // Límite máximo antes de considerar omisión (ej. 0.350s)
  audioOffsetMs: number;      // Calibración manual de latencia de hardware (-100ms a +100ms)
  musicVolume: number;        // 0.0 a 1.0
  sfxVolume: number;          // 0.0 a 1.0
}

export const PRESET_CONFIGS: Record<DifficultyPreset, Omit<DifficultySettings, 'preset' | 'audioOffsetMs' | 'musicVolume' | 'sfxVolume'>> = {
  // 🟢 Niños y Principiantes (Recomendado por defecto para 5 a 10 años)
  beginner: {
    approachTime: 2.5,        // 2.5 segundos: tiempo generoso para ver la nota y ubicar el dedo
    windowPerfect: 0.065,     // ±65 ms (Tolerancia amigable y gratificante)
    windowGreat: 0.130,       // ±130 ms
    windowGood: 0.220,        // ±220 ms
    windowMiss: 0.350         // 350 ms antes de descartar
  },

  // 🟡 Intermedio / Jóvenes
  normal: {
    approachTime: 1.9,        // 1.9 segundos
    windowPerfect: 0.045,     // ±45 ms
    windowGreat: 0.090,       // ±90 ms
    windowGood: 0.160,        // ±160 ms
    windowMiss: 0.250
  },

  // 🔴 Desafío Rítmico Avanzado
  expert: {
    approachTime: 1.4,        // 1.4 segundos
    windowPerfect: 0.025,     // ±25 ms
    windowGreat: 0.050,       // ±50 ms
    windowGood: 0.090,        // ±90 ms
    windowMiss: 0.160
  }
};

const STORAGE_KEY = 'typoniac_difficulty_settings';

export class DifficultyManager {
  private current: DifficultySettings;

  constructor() {
    this.current = this.loadSettings();
  }

  public getSettings(): DifficultySettings {
    return this.current;
  }

  public applyPreset(preset: DifficultyPreset): void {
    const config = PRESET_CONFIGS[preset];
    this.current = {
      ...this.current,
      preset,
      ...config
    };
    this.saveSettings();
  }

  public updateCustom(partial: Partial<DifficultySettings>): void {
    this.current = {
      ...this.current,
      ...partial
    };
    this.saveSettings();
  }

  private loadSettings(): DifficultySettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Usar predeterminado si falla el storage
    }

    // Predeterminado: Modo Principiante / Niños
    return {
      preset: 'beginner',
      audioOffsetMs: 0,
      musicVolume: 0.7,
      sfxVolume: 0.85,
      ...PRESET_CONFIGS.beginner
    };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.current));
    } catch {
      // Ignorar fallos de cuota
    }
  }
}
