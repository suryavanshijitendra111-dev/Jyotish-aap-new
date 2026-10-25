/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Procedural Web Audio API Soundscape for 3D Digital Life House.
 * Zero external audio files required — hermetic, zero-latency, compliant with browser autoplay.
 */
class DigitalHouseAudioService {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isMuted: boolean = false;
  private volume: number = 0.4;
  private isPlayingDrone: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Starts a rich Vedic cosmic harmonic drone (~136.1 Hz Om fundamental).
   */
  public startAmbientDrone() {
    if (this.isPlayingDrone) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.droneGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 3.0);
      this.droneGain.connect(this.masterGain);

      // Lowpass filter for warm temple ambience
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, this.ctx.currentTime);
      filter.connect(this.droneGain);

      // Fundamental frequency: 136.1 Hz (Sacred Om / Year frequency)
      const baseFreq = 136.1;
      const harmonics = [1, 2, 3.01, 4];
      const gains = [0.18, 0.08, 0.04, 0.02];

      this.oscillators = [];
      harmonics.forEach((h, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * h, this.ctx.currentTime);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(gains[idx] || 0.05, this.ctx.currentTime);
        osc.connect(subGain);
        subGain.connect(filter);
        osc.start();
        this.oscillators.push(osc);
      });

      this.isPlayingDrone = true;
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public stopAmbientDrone() {
    if (!this.isPlayingDrone || !this.ctx || !this.droneGain) return;
    try {
      this.droneGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);
      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try { osc.stop(); osc.disconnect(); } catch {}
        });
        this.oscillators = [];
        this.isPlayingDrone = false;
      }, 1600);
    } catch {
      this.isPlayingDrone = false;
    }
  }

  /**
   * Plays a resonant Vedic brass temple chime / bell.
   */
  public playTempleChime(freq = 540) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const chimeGain = this.ctx.createGain();
      chimeGain.gain.setValueAtTime(0.3, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
      chimeGain.connect(this.masterGain);

      const partials = [1, 1.48, 2.01, 2.97];
      partials.forEach(p => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * p, now);
        osc.connect(chimeGain);
        osc.start(now);
        osc.stop(now + 3.5);
      });
    } catch {}
  }

  /**
   * Sound effect for Diya lamps igniting.
   */
  public playLampIgniteSound(pitch = 1) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(1200 * pitch, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  /**
   * Sound effect for Grand Double Doors opening.
   */
  public playDoorsOpenSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Low resonant rumble / brass hinge creak
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.linearRampToValueAtTime(85, now + 2.5);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.linearRampToValueAtTime(450, now + 2.5);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.6);

      // Flanked by a resonant bell chime at the moment doors part
      setTimeout(() => {
        this.playTempleChime(432);
      }, 500);
    } catch {}
  }

  /**
   * Sound effect for entering Past World (अतीत):
   * Deep, warm, contemplative ancient temple gong with soft resonant undertones (396 Hz).
   */
  public playPastAtmosphereSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
      gain.connect(this.masterGain);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.connect(gain);

      // Warm ancient harmonics: 198Hz fundamental + 396Hz octave
      [198, 396, 594].forEach(f => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(filter);
        osc.start(now);
        osc.stop(now + 3.8);
      });
    } catch {}
  }

  /**
   * Sound effect for entering Present World (वर्तमान):
   * Radiant, vibrant morning dawn chime with clear resonant harmonics (528 Hz).
   */
  public playPresentAtmosphereSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      gain.connect(this.masterGain);

      [528, 792, 1056].forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.04);
        osc.connect(gain);
        osc.start(now + i * 0.04);
        osc.stop(now + 3.2);
      });
    } catch {}
  }

  /**
   * Sound effect for entering Future World (भविष्य):
   * Ethereal, expansive celestial horizon chime with crystalline high partials (741 Hz).
   */
  public playFutureAtmosphereSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
      gain.connect(this.masterGain);

      [432, 648, 864, 1296].forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.06);
        osc.connect(gain);
        osc.start(now + i * 0.06);
        osc.stop(now + 4.2);
      });
    } catch {}
  }

  /**
   * Sound effect for crossing architectural threshold (Entrance or Exit).
   */
  public playThresholdCrossingSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      gain.connect(this.masterGain);

      // Deep gong step chime
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(216, now);
      osc.frequency.exponentialRampToValueAtTime(432, now + 0.35);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 1.8);
    } catch {}
  }

  /**
   * Sound effect for exiting the palace to exterior grounds.
   */
  public playPalaceExitSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Resonant outward bell
      this.playTempleChime(360);
    } catch {}
  }
}

export const houseAudioService = new DigitalHouseAudioService();
