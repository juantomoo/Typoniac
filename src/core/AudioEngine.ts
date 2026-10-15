/**
 * Motor de Audio de Alta Fidelidad y Baja Latencia (<12 ms)
 * Web Audio API nativo con reloj maestro de hardware (currentTime).
 * Incluye sintetizador interactivo cristalino y reproductor elástico con filtro armónico.
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicBuffer: AudioBuffer | null = null;
  private musicGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private sfxGain: GainNode | null = null;
  
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private proceduralInterval: number | null = null;

  // Escala pentatónica diatónica cristalina para feedback dactilar armónico
  private noteFrequencies: number[] = [
    261.63, // C4 (Meñique Izq)
    293.66, // D4 (Anular Izq)
    329.63, // E4 (Medio Izq)
    349.23, // F4 (Índice Izq)
    392.00, // G4 (Pulgares)
    440.00, // A4 (Índice Der)
    493.88, // B4 (Medio Der)
    523.25, // C5 (Anular Der)
    587.33, // D5 (Meñique Der)
    659.25  // E5
  ];

  public init(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });

      // Ganancia Maestra de Música
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      // Filtro Pasa-bajos Dinámico (Se atenúa en errores, brilla en PERFECT)
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.setValueAtTime(18000, this.ctx.currentTime);
      this.musicFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      // Cadena de Música: Source -> Filter -> Gain -> Destination
      this.musicFilter.connect(this.musicGain);
      this.musicGain.connect(this.ctx.destination);

      // Ganancia Maestra de Efectos / Síntesis de Teclas
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMasterTime(): number {
    if (!this.ctx || !this.isPlaying) return 0;
    return this.ctx.currentTime - this.startTime;
  }

  public async loadAudio(url: string): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      this.musicBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      return true;
    } catch (e) {
      console.warn(`[AudioEngine] No se pudo cargar audio externo (${url}). Activando motor procedural:`, e);
      this.musicBuffer = null;
      return false;
    }
  }

  public play(offsetSeconds: number = 0, bpm: number = 80): void {
    this.init();
    if (!this.ctx) return;

    this.stop();
    this.isPlaying = true;
    this.startTime = this.ctx.currentTime - offsetSeconds;

    if (this.musicBuffer) {
      this.musicSource = this.ctx.createBufferSource();
      this.musicSource.buffer = this.musicBuffer;
      this.musicSource.connect(this.musicFilter!);
      this.musicSource.start(0, offsetSeconds);
    } else {
      // Motor de Acompañamiento Procedural Relajante
      this.startProceduralBackingTrack(bpm);
    }
  }


  public setMusicVolume(vol: number): void {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(vol, 1)), this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number): void {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(vol, 1)), this.ctx.currentTime);
    }
  }

  public stop(): void {
    if (this.musicSource) {
      try {
        this.musicSource.stop();
        this.musicSource.disconnect();
      } catch {
        // Ignorar si ya estaba detenido
      }
      this.musicSource = null;
    }

    if (this.proceduralInterval) {
      window.clearInterval(this.proceduralInterval);
      this.proceduralInterval = null;
    }

    this.isPlaying = false;
  }

  /**
   * Síntesis FM Interactiva Instantánea (Latencia < 8 ms)
   * Produce una nota de campana cristalina o celesta afinada según la columna dactilar.
   */
  public playKeyChime(colIndex: number, isPerfect: boolean): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const freq = this.noteFrequencies[Math.min(Math.max(colIndex, 0), this.noteFrequencies.length - 1)];

    // Modulador FM
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    // Portador Principal
    const carrier = this.ctx.createOscillator();
    const carrierGain = this.ctx.createGain();

    mod.type = 'sine';
    mod.frequency.setValueAtTime(freq * 2.76, t); // Razón inarmónica de celesta de cristal

    carrier.type = isPerfect ? 'sine' : 'triangle';
    carrier.frequency.setValueAtTime(freq, t);

    // Envolvente de modulación (brillo metálico inicial que decae rápido)
    modGain.gain.setValueAtTime(isPerfect ? 350 : 150, t);
    modGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    // Envolvente del volumen principal (Ataque ultra rápido de 2ms, decay suave)
    carrierGain.gain.setValueAtTime(0.001, t);
    carrierGain.gain.linearRampToValueAtTime(isPerfect ? 0.35 : 0.2, t + 0.003);
    carrierGain.gain.exponentialRampToValueAtTime(0.0001, t + (isPerfect ? 0.28 : 0.16));

    // Conexión FM
    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    carrier.connect(carrierGain);
    carrierGain.connect(this.sfxGain);

    mod.start(t);
    carrier.start(t);
    mod.stop(t + 0.3);
    carrier.stop(t + 0.3);

    // Dinámica del filtro musical
    if (this.musicFilter) {
      const targetFreq = isPerfect ? 18000 : 12000;
      this.musicFilter.frequency.setTargetAtTime(targetFreq, t, 0.05);
    }
  }

  /**
   * Sonido suave de omisión (MISS) sin agresión cognitiva ni timbres punitivos.
   * Emite un sutil pulso amortiguado.
   */
  public playSoftMiss(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);

    // Filtrar la música sutilmente por 250ms para feedback quinestésico
    if (this.musicFilter) {
      this.musicFilter.frequency.setTargetAtTime(3500, t, 0.04);
      this.musicFilter.frequency.setTargetAtTime(16000, t + 0.25, 0.1);
    }
  }

  /**
   * Generador de Base Rítmica Procedural Relajante
   * Crea un pulso de metrónomo acústico suave + arpegio pastel si no hay archivo de audio.
   */
  private startProceduralBackingTrack(bpm: number): void {
    const beatMs = (60 / bpm) * 1000;
    let step = 0;

    const chords = [
      [261.63, 329.63, 392.00], // C Maj
      [220.00, 261.63, 329.63], // A Min
      [174.61, 220.00, 261.63], // F Maj
      [196.00, 246.94, 293.66]  // G Maj
    ];

    this.proceduralInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const t = this.ctx.currentTime;
      const isDownbeat = (step % 4 === 0);

      // Pulso de pulgar suave (percusión orgánica sin estridencia)
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(isDownbeat ? 180 : 120, t);
      clickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.05);

      clickGain.gain.setValueAtTime(isDownbeat ? 0.15 : 0.08, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      clickOsc.connect(clickGain);
      clickGain.connect(this.musicGain!);
      clickOsc.start(t);
      clickOsc.stop(t + 0.06);

      // Acorde ambiental flotante
      if (step % 4 === 0) {
        const chordIndex = Math.floor(step / 4) % chords.length;
        chords[chordIndex].forEach(f => {
          const chordOsc = this.ctx!.createOscillator();
          const chordGain = this.ctx!.createGain();
          chordOsc.type = 'sine';
          chordOsc.frequency.setValueAtTime(f, t);

          chordGain.gain.setValueAtTime(0.001, t);
          chordGain.gain.linearRampToValueAtTime(0.02, t + 0.1);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, t + (beatMs * 3.8 / 1000));

          chordOsc.connect(chordGain);
          chordGain.connect(this.musicGain!);
          chordOsc.start(t);
          chordOsc.stop(t + (beatMs * 4 / 1000));
        });
      }

      step++;
    }, beatMs);
  }
}
