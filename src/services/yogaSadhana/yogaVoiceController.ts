/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA VOICE CONTROLLER
 * PHASE 1.15F-D: VOICE GUIDANCE FOR YOGA PRACTICES
 * 
 * STRICT INVARIANTS:
 * - Reuses centralized SpeechEngine (zero duplicate SpeechSynthesis implementations).
 * - Exact static catalog Hindi text (zero AI-generated text, zero cloud TTS).
 * - Step-by-step atomic delivery: stops previous speech before speaking next step.
 * - Non-overlapping speech: stop() invoked on navigation, replay, pause, cancel, exit.
 * - Resilient failure containment: browser audio errors leave UI and session 100% usable.
 * - Zero timing authority: does not accumulate timers; YogaSessionEngine remains sole timing authority.
 */

import { SpeechEngine, SpeechState } from '../companion/speechEngine';

export type YogaVoiceGender = 'female' | 'male';

export interface YogaVoiceState {
  readonly isMuted: boolean;
  readonly isSpeaking: boolean;
  readonly currentSpokenText: string | null;
  readonly voiceGender: YogaVoiceGender;
  readonly isExactGenderMatch: boolean;
  readonly detectedVoiceGender: 'female' | 'male' | 'unknown';
  readonly hasGenuineFemaleVoice: boolean;
  readonly hasGenuineMaleVoice: boolean;
}

const STORAGE_YOGA_VOICE_GENDER_KEY = 'jeevandarpan_yoga_voice_gender';

export class YogaVoiceController {
  private static isMuted = false;
  private static activeText: string | null = null;
  private static isSpeaking = false;
  // Initialize persistent voice gender choice (defaults to female, reloads saved choice from session/device)
  private static voiceGender: YogaVoiceGender = (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_YOGA_VOICE_GENDER_KEY);
        if (saved === 'male' || saved === 'female') return saved;
      } catch (_) {}
    }
    return 'female';
  })();
  private static listeners: Set<(state: YogaVoiceState) => void> = new Set();

  static {
    // When browser finishes populating voices asynchronously, re-notify subscribers
    SpeechEngine.onVoicesChanged(() => {
      this.notifyListeners();
    });
  }

  /**
   * Speaks a specific Yoga instruction step in Hindi.
   * Cancels any previously ongoing speech first to strictly prevent overlapping audio.
   */
  public static speakStep(stepHindiText: string, onEnded?: () => void): boolean {
    // If muted, record text state for visual highlight but do not produce audio
    if (this.isMuted) {
      this.activeText = stepHindiText;
      this.isSpeaking = false;
      this.notifyListeners();
      return true;
    }

    if (!stepHindiText || !stepHindiText.trim()) {
      return false;
    }

    this.activeText = stepHindiText;
    this.isSpeaking = true;
    this.notifyListeners();

    try {
      const ok = SpeechEngine.speak(
        stepHindiText,
        'hi',
        (state: SpeechState) => {
          this.isSpeaking = state === 'playing';
          this.notifyListeners();
          if (state === 'stopped' && onEnded) {
            onEnded();
          }
        },
        {
          rate: 0.80, // Calm, steady cadence suited for yogic instruction
          // If female voice requested and authentic female voice is present, use clear yogini pitch (1.08).
          // If no genuine female voice exists on device, do NOT distort male fallback voice with high pitch; use natural Guru pitch (0.90).
          pitch: this.voiceGender === 'female' 
            ? (SpeechEngine.resolveVoiceWithMetadata('hi', 'female').hasGenuineFemaleVoice ? 1.08 : 0.90)
            : 0.88,
          preferredGender: this.voiceGender,
          profile: 'default'
        }
      );

      if (!ok) {
        this.isSpeaking = false;
        this.notifyListeners();
      }
      return ok;
    } catch (err) {
      console.warn('[YogaVoiceController] Speech synthesis error. Falling back gracefully to visual text.', err);
      this.isSpeaking = false;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Immediately stops any active speech.
   */
  public static stop(): void {
    try {
      SpeechEngine.stop();
    } catch (_) {
      // Ignored
    }
    this.isSpeaking = false;
    this.notifyListeners();
  }

  /**
   * Replays the current or provided step instruction.
   */
  public static replay(stepHindiText?: string): void {
    const textToSpeak = stepHindiText || this.activeText;
    if (textToSpeak) {
      this.stop();
      this.speakStep(textToSpeak);
    }
  }

  /**
   * Toggles mute state. If muted while speaking, stops speech immediately.
   */
  public static toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    this.notifyListeners();
    return this.isMuted;
  }

  /**
   * Sets explicit mute state.
   */
  public static setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stop();
    }
    this.notifyListeners();
  }

  /**
   * Returns current mute status.
   */
  public static getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Returns current voice gender ('female' | 'male').
   */
  public static getVoiceGender(): YogaVoiceGender {
    return this.voiceGender;
  }

  /**
   * Sets voice gender with persistence.
   */
  public static setVoiceGender(gender: YogaVoiceGender): void {
    this.voiceGender = gender;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_YOGA_VOICE_GENDER_KEY, gender);
      } catch (_) {}
    }
    this.notifyListeners();
  }

  /**
   * Toggles voice gender between 'female' and 'male' with persistence.
   */
  public static toggleVoiceGender(): YogaVoiceGender {
    this.voiceGender = this.voiceGender === 'female' ? 'male' : 'female';
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_YOGA_VOICE_GENDER_KEY, this.voiceGender);
      } catch (_) {}
    }
    this.notifyListeners();
    return this.voiceGender;
  }

  /**
   * Returns complete voice snapshot with honest voice diagnostic metadata.
   */
  public static getState(): YogaVoiceState {
    const meta = SpeechEngine.resolveVoiceWithMetadata('hi', this.voiceGender, 'default');
    return {
      isMuted: this.isMuted,
      isSpeaking: this.isSpeaking,
      currentSpokenText: this.activeText,
      voiceGender: this.voiceGender,
      isExactGenderMatch: meta.isExactGenderMatch,
      detectedVoiceGender: meta.detectedVoiceGender,
      hasGenuineFemaleVoice: meta.hasGenuineFemaleVoice,
      hasGenuineMaleVoice: meta.hasGenuineMaleVoice
    };
  }

  /**
   * Subscribes to voice state changes.
   */
  public static subscribe(listener: (state: YogaVoiceState) => void): () => void {
    this.listeners.add(listener);
    try {
      listener(this.getState());
    } catch (_) {}

    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (_) {}
    }
  }
}
