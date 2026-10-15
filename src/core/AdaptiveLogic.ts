/**
 * Lógica Adaptativa Basada en las Fases de Fitts & Posner y TeclaMágica
 * Algoritmo de ponderación dinámica: P(k) = w1 * E_k + w2 * (L_k / L_avg)
 */

export interface KeyStats {
  attempts: number;
  errors: number;
  totalLatency: number;
}

export class AdaptiveLogic {
  private keyStatsMap: Map<string, KeyStats> = new Map();
  private readonly w1 = 0.7; // Mayor peso al control de errores biomecánicos
  private readonly w2 = 0.3; // Menor peso a la velocidad relativa

  public recordKeystroke(key: string, isError: boolean, latencyMs: number): void {
    const k = key.toLowerCase();
    const stats = this.keyStatsMap.get(k) || { attempts: 0, errors: 0, totalLatency: 0 };
    stats.attempts++;
    if (isError) stats.errors++;
    stats.totalLatency += latencyMs;
    this.keyStatsMap.set(k, stats);
  }

  public getGlobalAverageLatency(): number {
    let totalAttempts = 0;
    let sumLatency = 0;
    for (const stats of this.keyStatsMap.values()) {
      totalAttempts += stats.attempts;
      sumLatency += stats.totalLatency;
    }
    return totalAttempts > 0 ? sumLatency / totalAttempts : 400;
  }

  /**
   * Prioridad de repetición pedagógica para la tecla k
   */
  public getKeyPriority(key: string): number {
    const k = key.toLowerCase();
    const stats = this.keyStatsMap.get(k);
    if (!stats || stats.attempts === 0) return 1.0;

    const errorRate = stats.errors / stats.attempts;
    const avgKeyLatency = stats.totalLatency / stats.attempts;
    const globalAvg = this.getGlobalAverageLatency();

    return (this.w1 * errorRate) + (this.w2 * (avgKeyLatency / globalAvg));
  }

  /**
   * Criterio de estabilidad para avanzar de nivel (TeclaMágica):
   * Precisión >= 95% y desviación estándar de latencia < 150 ms
   */
  public isReadyForProgression(accuracy: number, stdDevLatency: number): boolean {
    return accuracy >= 95 && stdDevLatency > 0 && stdDevLatency < 150;
  }
}
