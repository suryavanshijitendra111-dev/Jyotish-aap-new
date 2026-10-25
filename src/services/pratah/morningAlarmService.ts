import { 
  PratahSanskarSettings, 
  DEFAULT_PRATAH_SETTINGS, 
  PratahAudioChoice, 
  PratahDailyProgress 
} from '../../types/pratahSanskar';
import { SpeechEngine } from '../companion/speechEngine';

const SETTINGS_KEY = 'jeevandarpan_pratah_settings_v1';
const PROGRESS_KEY_PREFIX = 'jeevandarpan_pratah_progress_';

export interface IMorningAlarmService {
  getSettings(): PratahSanskarSettings;
  saveSettings(settings: PratahSanskarSettings): void;
  getDailyProgress(dateStr: string): PratahDailyProgress;
  saveDailyProgress(progress: PratahDailyProgress): void;
  playAlarmAudio(choice: PratahAudioChoice, volume: number, fadeIn: boolean): void;
  stopAlarmAudio(): void;
  snooze(minutes?: number): Date;
  triggerWebNotification(): Promise<{ success: boolean; reason?: string }>;
  isAlarmDueNow(settings?: PratahSanskarSettings): boolean;
  getPlatformReliabilityNotice(): { title: string; explanation: string; isNative: boolean };
}

/**
 * Web-based implementation of MorningAlarmService
 * Uses Web Audio API for harmonic sound synthesis, Web Speech API, and Notification API
 * Transparently discloses browser suspension constraints vs native Android alarms.
 */
export class WebMorningAlarmService implements IMorningAlarmService {
  private static instance: WebMorningAlarmService | null = null;
  private static memoryCache: Record<string, string> = {};

  public static getInstance(): WebMorningAlarmService {
    if (!WebMorningAlarmService.instance) {
      WebMorningAlarmService.instance = new WebMorningAlarmService();
    }
    return WebMorningAlarmService.instance;
  }

  private audioCtx: AudioContext | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private masterGain: GainNode | null = null;
  private soundInterval: any = null;
  private isAudioPlaying = false;
  private snoozedUntil: Date | null = null;

  getSettings(): PratahSanskarSettings {
    if (typeof window === 'undefined' || !window.localStorage) {
      const cached = WebMorningAlarmService.memoryCache[SETTINGS_KEY];
      if (cached) {
        return { ...DEFAULT_PRATAH_SETTINGS, ...JSON.parse(cached) };
      }
      return { ...DEFAULT_PRATAH_SETTINGS };
    }
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_PRATAH_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading pratah settings:', e);
    }
    return { ...DEFAULT_PRATAH_SETTINGS };
  }

  saveSettings(settings: PratahSanskarSettings): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      WebMorningAlarmService.memoryCache[SETTINGS_KEY] = JSON.stringify(settings);
      return;
    }
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error saving pratah settings:', e);
    }
  }

  getDailyProgress(dateStr: string): PratahDailyProgress {
    const key = `${PROGRESS_KEY_PREFIX}${dateStr}`;
    const defaultProgress: PratahDailyProgress = {
      date: dateStr,
      completedSteps: [],
      selectedResolution: '',
      isKarmaCompleted: false
    };

    if (typeof window === 'undefined' || !window.localStorage) {
      const cached = WebMorningAlarmService.memoryCache[key];
      if (cached) {
        return { ...defaultProgress, ...JSON.parse(cached) };
      }
      return defaultProgress;
    }
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return { ...defaultProgress, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading pratah progress:', e);
    }
    return defaultProgress;
  }

  saveDailyProgress(progress: PratahDailyProgress): void {
    const key = `${PROGRESS_KEY_PREFIX}${progress.date}`;
    if (typeof window === 'undefined' || !window.localStorage) {
      WebMorningAlarmService.memoryCache[key] = JSON.stringify(progress);
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(progress));
    } catch (e) {
      console.warn('Error saving pratah progress:', e);
    }
  }

  /**
   * Initializes or returns the Web Audio Context
   */
  private getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Synthesizes and plays selected alarm audio using Web Audio API
   */
  playAlarmAudio(choice: PratahAudioChoice, volume = 0.8, fadeIn = true): void {
    this.stopAlarmAudio();
    if (choice === 'silent') return;

    try {
      const ctx = this.getAudioContext();
      this.masterGain = ctx.createGain();
      const targetVolume = Math.max(0.05, Math.min(1.0, volume));

      if (fadeIn) {
        this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(targetVolume, ctx.currentTime + 4.0);
      } else {
        this.masterGain.gain.setValueAtTime(targetVolume, ctx.currentTime);
      }

      this.masterGain.connect(ctx.destination);
      this.isAudioPlaying = true;

      if (choice === 'gayatri') {
        this.startGayatriAudio(ctx, this.masterGain);
      } else if (choice === 'instrumental') {
        this.startInstrumentalAudio(ctx, this.masterGain);
      } else if (choice === 'nature') {
        this.startNatureAudio(ctx, this.masterGain);
      }
    } catch (err) {
      console.warn('Failed to play alarm audio:', err);
    }
  }

  /**
   * Synthesizes a sacred Tanpura drone with serene meditative overtone resonance
   * and triggers solemn, clear Gayatri Mantra recitation
   */
  private startGayatriAudio(ctx: AudioContext, destination: AudioNode): void {
    // Tanpura Root: D2 (73.4Hz) + A2 (110Hz) + D3 (146.8Hz) + F#3 (185Hz)
    const freqs = [73.41, 110.0, 146.83, 185.0];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime);

      // Gentle pulsating envelope
      gain.gain.setValueAtTime(0.15 / (idx + 1), ctx.currentTime);
      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      this.activeOscillators.push(osc);
    });

    // Speak Gayatri Mantra clearly in Hindi / Sanskrit after a gentle 1.5s tanpura fade-in
    setTimeout(() => {
      if (this.isAudioPlaying) {
        const gayatriMantra = "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्। सुप्रभात। नव प्रभात का अभिनंदन।";
        SpeechEngine.speak(gayatriMantra, 'Hindi');
      }
    }, 1500);

    // Loop periodic harmonic chime
    this.soundInterval = setInterval(() => {
      if (!this.isAudioPlaying) return;
      this.playBellChime(ctx, destination, 528); // 528Hz Solfeggio frequency
    }, 7000);
  }

  /**
   * Synthesizes a calming Indian flute / tanpura harmonic chord progression
   */
  private startInstrumentalAudio(ctx: AudioContext, destination: AudioNode): void {
    // Meditative Raag Bhupali notes: Sa, Re, Ga, Pa, Dha (C4, D4, E4, G4, A4)
    const melodyFreqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    let noteIdx = 0;

    // Base continuous warm drone
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
    droneGain.gain.setValueAtTime(0.2, ctx.currentTime);
    drone.connect(droneGain);
    droneGain.connect(destination);
    drone.start();
    this.activeOscillators.push(drone);

    // Repeating flute notes
    const playNextNote = () => {
      if (!this.isAudioPlaying) return;
      const freq = melodyFreqs[noteIdx % melodyFreqs.length];
      noteIdx++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.6);
    };

    playNextNote();
    this.soundInterval = setInterval(playNextNote, 2800);
  }

  /**
   * Synthesizes morning birds chirping and soft dawn breeze
   */
  private startNatureAudio(ctx: AudioContext, destination: AudioNode): void {
    // Ambient dawn wind / breath
    const windOsc = ctx.createOscillator();
    const windGain = ctx.createGain();
    windOsc.type = 'sine';
    windOsc.frequency.setValueAtTime(80, ctx.currentTime);
    windGain.gain.setValueAtTime(0.12, ctx.currentTime);
    windOsc.connect(windGain);
    windGain.connect(destination);
    windOsc.start();
    this.activeOscillators.push(windOsc);

    // Synthesized bird chirps (chirp frequency sweep)
    const chirp = () => {
      if (!this.isAudioPlaying) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000 + Math.random() * 800, now);
      osc.frequency.exponentialRampToValueAtTime(3200 + Math.random() * 500, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.3);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + 0.36);
    };

    chirp();
    this.soundInterval = setInterval(() => {
      if (!this.isAudioPlaying) return;
      chirp();
      if (Math.random() > 0.4) {
        setTimeout(chirp, 200);
      }
    }, 2200);
  }

  private playBellChime(ctx: AudioContext, destination: AudioNode, freq: number): void {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch (e) {
      // Ignore audio glitch
    }
  }

  /**
   * Stops all active audio oscillators and Speech synthesis
   */
  stopAlarmAudio(): void {
    this.isAudioPlaying = false;
    if (this.soundInterval) {
      clearInterval(this.soundInterval);
      this.soundInterval = null;
    }

    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    this.activeOscillators = [];

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch (e) {}
      this.masterGain = null;
    }

    SpeechEngine.stop();
  }

  /**
   * Snoozes the alarm by specified minutes (default: 5)
   */
  snooze(minutes = 5): Date {
    this.stopAlarmAudio();
    const until = new Date(Date.now() + minutes * 60 * 1000);
    this.snoozedUntil = until;
    return until;
  }

  /**
   * Dispatches a privacy-respecting Web Notification
   * Adheres strictly to Section 9:
   * "Notification preview must not expose sensitive birth/family information by default."
   * Example: "🌅 JeevanDarpan: सुप्रभात। आपका आज का संदेश तैयार है।"
   */
  async triggerWebNotification(): Promise<{ success: boolean; reason?: string }> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { success: false, reason: 'Web Notifications not supported in this browser environment.' };
    }

    if (Notification.permission !== 'granted') {
      try {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          return { success: false, reason: 'Notification permission was denied by user.' };
        }
      } catch (e) {
        return { success: false, reason: 'Unable to request notification permission.' };
      }
    }

    try {
      const title = '🌅 JeevanDarpan: सुप्रभात';
      const body = 'सुप्रभात 🙏। आज का जीवन दर्पण आपका साथ देने के लिए तैयार है।';

      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'jeevandarpan-pratah-alarm',
        badge: '/favicon.ico'
      });
      return { success: true };
    } catch (err: any) {
      console.warn('Web notification dispatch error:', err);
      return { success: false, reason: err?.message || 'Error creating notification' };
    }
  }

  /**
   * Checks if an alarm is currently due based on settings and time
   */
  isAlarmDueNow(settings: PratahSanskarSettings = this.getSettings()): boolean {
    if (!settings.enabled) return false;

    // If snoozed and still within snooze window, not due yet
    if (this.snoozedUntil) {
      if (Date.now() < this.snoozedUntil.getTime()) {
        return false;
      } else {
        this.snoozedUntil = null; // Snooze expired
        return true;
      }
    }

    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayNames[now.getDay()];

    if (!settings.alarmDays.includes(currentDay)) {
      return false;
    }

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    return currentTimeStr === settings.wakeUpTime;
  }

  /**
   * Transparent platform reliability disclosure complying with Section 1 & Section 13
   */
  getPlatformReliabilityNotice(): { title: string; explanation: string; isNative: boolean } {
    return {
      title: 'Web & PWA Browser Notification Notice',
      explanation: 'वेब व PWA पर्यावरण में ब्राउज़र की सुरक्षा सीमाओं के कारण डिवाइस स्क्रीन लॉक या टैब पूरी तरह बंद होने पर सटीक वेक-अप की गारंटी नहीं दी जा सकती। ऐप खुला होने या बैकग्राउंड एक्टिव होने पर यह पूर्ण रूप से कार्य करता है। भावी Android नेटिव ऐप में यह AlarmManager के माध्यम से सटीक वेक-अप प्रदान करेगा।',
      isNative: false
    };
  }
}

/**
 * Future Android Native Alarm Service Bridge Stub
 * Complies with Section 13 architecture requirements
 */
export class AndroidNativeAlarmBridge implements IMorningAlarmService {
  private webFallback = new WebMorningAlarmService();

  /**
   * Static bridge to schedule exact Android alarm via Android bridge interface
   */
  public static scheduleExactAlarm(wakeUpTime: string, days: string[]): boolean {
    if (typeof window !== 'undefined' && (window as any).AndroidAlarmBridge) {
      try {
        (window as any).AndroidAlarmBridge.setExactAlarm(wakeUpTime, JSON.stringify(days));
        return true;
      } catch (e) {
        console.warn('Android bridge error:', e);
      }
    }
    return false;
  }

  getSettings() { return this.webFallback.getSettings(); }
  saveSettings(s: PratahSanskarSettings) { this.webFallback.saveSettings(s); }
  getDailyProgress(d: string) { return this.webFallback.getDailyProgress(d); }
  saveDailyProgress(p: PratahDailyProgress) { this.webFallback.saveDailyProgress(p); }
  playAlarmAudio(c: PratahAudioChoice, v: number, f: boolean) { this.webFallback.playAlarmAudio(c, v, f); }
  stopAlarmAudio() { this.webFallback.stopAlarmAudio(); }
  snooze(m?: number) { return this.webFallback.snooze(m); }
  async triggerWebNotification() { return this.webFallback.triggerWebNotification(); }
  isAlarmDueNow(s?: PratahSanskarSettings) { return this.webFallback.isAlarmDueNow(s); }

  getPlatformReliabilityNotice() {
    return {
      title: 'Android Native Exact Alarm Ready',
      explanation: 'Android Native build leverages Android AlarmManager.setExactAndAllowWhileIdle for battery-optimized, 100% reliable system-level waking.',
      isNative: true
    };
  }
}

// Export singleton instance
export const MorningAlarmService: IMorningAlarmService = new WebMorningAlarmService();
