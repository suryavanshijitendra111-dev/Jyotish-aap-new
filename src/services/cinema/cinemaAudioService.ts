/**
 * Celestial Ambient Sound Service (आकाशीय नाद सेवा)
 * 
 * Uses Web Audio API to synthesize subtle cosmic ambient drone frequencies
 * tuned to each of the 9 Navagrahas.
 * 
 * Safe, zero-asset, non-intrusive (calibrated whisper volume ~0.04-0.05),
 * designed to complement without overpowering the spoken voice.
 */

class CinemaAudioService {
  private audioCtx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private currentPlanet: string | null = null;

  private initContext() {
    if (this.audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Web Audio not supported in this environment', e);
    }
  }

  /**
   * Plays the ambient celestial drone for the selected planet
   */
  public playPlanetAmbient(planetKey: string, baseFrequency: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    // If already playing this planet, return
    if (this.isPlaying && this.currentPlanet === planetKey) return;

    // Stop current sound smoothly
    this.stopAmbient(true);

    try {
      const now = this.audioCtx.currentTime;

      // Master Gain (whisper level so speech is crystal clear)
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.0001, now);
      this.gainNode.gain.linearRampToValueAtTime(0.045, now + 1.8);

      // Lowpass Filter for soft cosmic warmth
      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(450, now);
      this.filterNode.Q.setValueAtTime(1.5, now);

      // Primary Oscillator (Fundamental planetary frequency)
      this.osc1 = this.audioCtx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(baseFrequency, now);

      // Secondary Oscillator (Harmonic overtone for richness, slightly detuned)
      this.osc2 = this.audioCtx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(baseFrequency * 1.5, now); // Perfect fifth harmonic
      this.osc2.detune.setValueAtTime(4, now); // Gentle slow beating shimmer

      const osc2Gain = this.audioCtx.createGain();
      osc2Gain.gain.setValueAtTime(0.3, now);

      this.osc1.connect(this.filterNode);
      this.osc2.connect(osc2Gain);
      osc2Gain.connect(this.filterNode);

      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.osc1.start(now);
      this.osc2.start(now);

      this.isPlaying = true;
      this.currentPlanet = planetKey;
    } catch (err) {
      console.warn('Cinema audio start failed', err);
    }
  }

  /**
   * Smoothly fades out and stops the ambient drone
   */
  public stopAmbient(immediate = false) {
    if (!this.audioCtx || !this.gainNode) {
      this.isPlaying = false;
      this.currentPlanet = null;
      return;
    }

    try {
      const now = this.audioCtx.currentTime;
      if (immediate) {
        this.gainNode.gain.setValueAtTime(0.0001, now);
        this.osc1?.stop();
        this.osc2?.stop();
        this.osc1?.disconnect();
        this.osc2?.disconnect();
        this.osc1 = null;
        this.osc2 = null;
        this.gainNode = null;
        this.filterNode = null;
      } else {
        this.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.8);
        setTimeout(() => {
          this.osc1?.stop();
          this.osc2?.stop();
          this.osc1?.disconnect();
          this.osc2?.disconnect();
          this.osc1 = null;
          this.osc2 = null;
          this.gainNode = null;
          this.filterNode = null;
        }, 850);
      }
    } catch (e) {
      // ignore
    }

    this.isPlaying = false;
    this.currentPlanet = null;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbient(true);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const cinemaAudio = new CinemaAudioService();
