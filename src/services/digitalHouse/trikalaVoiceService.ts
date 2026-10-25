/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PHASE 4.1B: TRIKALA VOICE SERVICE (TTS)
 * Provides calm, mature Hindi voice prompts when entering Trikala Windows.
 */

import { TrikalaWindowId } from '../../types/digitalHouse';

const TRIKALA_VOICE_PROMPTS: Record<TrikalaWindowId, string> = {
  window_past: 'आइए, जीवन के पीछे दिखाई देने वाले पारंपरिक संकेतों को समझें।',
  window_present: 'आइए देखें, इस समय आपके जीवन में कौन-से विषय सक्रिय हैं।',
  window_future: 'आइए देखें, आगे कौन-सी समय-खिड़कियाँ महत्वपूर्ण दिखाई देती हैं।'
};

class TrikalaVoiceService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public speakWindowPrompt(windowId: TrikalaWindowId, soundMuted: boolean = false): void {
    if (soundMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const text = TRIKALA_VOICE_PROMPTS[windowId];
    if (!text) return;

    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.88; // Slow, calm pacing
      utterance.pitch = 0.95; // Warm, mature tone
      utterance.volume = 0.85;

      // Select Hindi voice if available
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.lang === 'hi_IN' || v.name.includes('Hindi'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Trikala Voice TTS notice:', e);
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
  }
}

export const trikalaVoiceService = new TrikalaVoiceService();
