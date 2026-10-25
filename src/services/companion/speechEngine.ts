/**
 * Centralized Spiritual & Astronomical Speech Engine (वाक् शक्ति इंजन)
 * 
 * Provides dynamic mature/authoritative male Hindi voice selection,
 * intelligent sentence-by-sentence paused speech queue,
 * calibrated spiritual rate (0.76) & pitch (0.84),
 * and speed controls across all 13 supported languages.
 */

import { guardianMonitor } from '../guardian/guardianMonitor';

export type SpeechState = 'playing' | 'paused' | 'stopped';
export type SpeechSpeedPreset = 'slow' | 'normal' | 'fast';
export type VoiceProfileType = 'planet' | 'bhava' | 'default';

export interface SpeechOptions {
  profile?: VoiceProfileType;
  planetKey?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  speedPreset?: SpeechSpeedPreset;
  preferredGender?: 'male' | 'female';
  onStateChange?: (state: SpeechState) => void;
  onSentenceChange?: (currentSentence: number, totalSentences: number, text: string) => void;
}

export const TTS_BCP47_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  as: 'as-IN',
  sa: 'sa-IN',
  Hindi: 'hi-IN',
  English: 'en-IN',
  Marathi: 'mr-IN',
  Gujarati: 'gu-IN',
  Bengali: 'bn-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Punjabi: 'pa-IN',
  Odia: 'or-IN',
  Assamese: 'as-IN',
  Sanskrit: 'sa-IN',
  'हिन्दी': 'hi-IN',
  'मराठी': 'mr-IN',
  'ગુજરાતી': 'gu-IN',
  'বাংলা': 'bn-IN',
  'தமிழ்': 'ta-IN',
  'తెలుగు': 'te-IN',
  'ಕನ್ನಡ': 'kn-IN',
  'മലയാളം': 'ml-IN',
  'ਪੰਜਾਬੀ': 'pa-IN',
  'ଓଡ଼ିଆ': 'or-IN',
  'অসমীয়া': 'as-IN',
  'संस्कृतम्': 'sa-IN'
};

const SPEED_PRESET_RATES: Record<SpeechSpeedPreset, number> = {
  slow: 0.76,    // धीमी (गंभीर, स्पष्ट, स्थिर - Default for Hindi spiritual narrator)
  normal: 0.92,  // सामान्य
  fast: 1.05     // तेज़
};

const STORAGE_SPEED_KEY = 'jeevandarpan_tts_speed';

export class SpeechEngine {
  private static activeUtterance: SpeechSynthesisUtterance | null = null;
  private static stateListener: ((state: SpeechState) => void) | null = null;
  private static currentSentences: string[] = [];
  private static currentSentenceIndex: number = 0;
  private static pauseTimeoutId: any = null;
  private static isPausedState: boolean = false;
  private static currentLanguage: string = 'hi';
  private static currentOptions: SpeechOptions = {};
  private static cachedVoices: SpeechSynthesisVoice[] = [];

  private static voiceChangeListeners: Set<() => void> = new Set();

  static {
    // Warm up voice cache if available in browser
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
        for (const cb of this.voiceChangeListeners) {
          try {
            cb();
          } catch (_) {}
        }
      };
    }
  }

  /**
   * Subscribes to browser voiceschanged event to reactively update UI when voices load asynchronously.
   */
  static onVoicesChanged(listener: () => void): () => void {
    this.voiceChangeListeners.add(listener);
    return () => {
      this.voiceChangeListeners.delete(listener);
    };
  }

  /**
   * Retrieves saved speed preset or defaults to 'slow' (0.76 rate)
   */
  static getSpeedPreset(): SpeechSpeedPreset {
    if (typeof window === 'undefined') return 'slow';
    try {
      const val = localStorage.getItem(STORAGE_SPEED_KEY);
      if (val === 'slow' || val === 'normal' || val === 'fast') {
        return val;
      }
    } catch (_) {}
    return 'slow';
  }

  /**
   * Sets and persists speed preset
   */
  static setSpeedPreset(preset: SpeechSpeedPreset): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_SPEED_KEY, preset);
    } catch (_) {}
  }

  /**
   * Returns normalized BCP-47 locale code for a given language name or code
   */
  static getLocaleForLanguage(language: string = 'hi'): string {
    if (!language) return 'hi-IN';
    const trimmed = language.trim();
    if (TTS_BCP47_MAP[trimmed]) return TTS_BCP47_MAP[trimmed];
    const lower = trimmed.toLowerCase();
    if (TTS_BCP47_MAP[lower]) return TTS_BCP47_MAP[lower];
    if (trimmed.includes('-')) return trimmed;
    return 'hi-IN';
  }

  /**
   * Gets cached or fresh synthesis voices from browser
   */
  static getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices && this.cachedVoices.length > 0) {
      return this.cachedVoices;
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    this.cachedVoices = window.speechSynthesis.getVoices();
    return this.cachedVoices;
  }

  /**
   * Cleans text and normalizes astronomical terms for natural speech
   */
  static cleanText(rawText: string, language: string = 'hi'): string {
    if (!rawText) return '';

    let cleaned = rawText
      .replace(/\*\*/g, '')
      .replace(/#/g, '')
      .replace(/_/g, '')
      .replace(/\[.*?\]/g, '') // remove markdown brackets
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // remove emojis
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    // Spoken Hindi natural normalization:
    const isHindi = language === 'hi' || language === 'Hindi' || language === 'हिन्दी' || language === 'sa' || language === 'Sanskrit';
    if (isHindi) {
      // Degree normalization: 10.02° -> 10.02 अंश, 10° 12' 30" -> 10 अंश 12 कला 30 विकला
      cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\s*°\s*(\d+)\s*'\s*(\d+)\s*"/g, '$1 अंश $2 कला $3 विकला');
      cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\s*°\s*(\d+)\s*'/g, '$1 अंश $2 कला');
      cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\s*°/g, '$1 अंश');
      cleaned = cleaned.replace(/(\d+)\s*'/g, '$1 कला');
      cleaned = cleaned.replace(/(\d+)\s*"/g, '$1 विकला');

      // Convert common raw English technical strings if leaked
      cleaned = cleaned
        .replace(/\bHouse 1\b/gi, 'प्रथम भाव')
        .replace(/\bHouse 2\b/gi, 'द्वितीय भाव')
        .replace(/\bHouse 3\b/gi, 'तृतीय भाव')
        .replace(/\bHouse 4\b/gi, 'चतुर्थ भाव')
        .replace(/\bHouse 5\b/gi, 'पंचम भाव')
        .replace(/\bHouse 6\b/gi, 'षष्ठ भाव')
        .replace(/\bHouse 7\b/gi, 'सप्तम भाव')
        .replace(/\bHouse 8\b/gi, 'अष्टम भाव')
        .replace(/\bHouse 9\b/gi, 'नवम भाव')
        .replace(/\bHouse 10\b/gi, 'दशम भाव')
        .replace(/\bHouse 11\b/gi, 'एकादश भाव')
        .replace(/\bHouse 12\b/gi, 'द्वादश भाव')
        .replace(/\b1st House\b/gi, 'प्रथम भाव')
        .replace(/\b2nd House\b/gi, 'द्वितीय भाव')
        .replace(/\b3rd House\b/gi, 'तृतीय भाव')
        .replace(/\b4th House\b/gi, 'चतुर्थ भाव')
        .replace(/\b5th House\b/gi, 'पंचम भाव')
        .replace(/\b6th House\b/gi, 'षष्ठ भाव')
        .replace(/\b7th House\b/gi, 'सप्तम भाव')
        .replace(/\b8th House\b/gi, 'अष्टम भाव')
        .replace(/\b9th House\b/gi, 'नवम भाव')
        .replace(/\b10th House\b/gi, 'दशम भाव')
        .replace(/\b11th House\b/gi, 'एकादश भाव')
        .replace(/\b12th House\b/gi, 'द्वादश भाव')
        .replace(/\bSun\b/g, 'सूर्य')
        .replace(/\bMoon\b/g, 'चंद्र')
        .replace(/\bMars\b/g, 'मंगल')
        .replace(/\bMercury\b/g, 'बुध')
        .replace(/\bJupiter\b/g, 'गुरु')
        .replace(/\bVenus\b/g, 'शुक्र')
        .replace(/\bSaturn\b/g, 'शनि')
        .replace(/\bRahu\b/g, 'राहु')
        .replace(/\bKetu\b/g, 'केतु')
        .replace(/\bAscendant\b/gi, 'लग्न')
        .replace(/\bPlanet Speaks\b/gi, 'ग्रह वाणी')
        .replace(/\bSystem\b/gi, 'पद्धति')
        .replace(/\bEngine\b/gi, 'इंजन')
        .replace(/\bAspect\b/gi, 'दृष्टि')
        .replace(/\bConjunction\b/gi, 'युति')
        .replace(/\bRetrograde\b/gi, 'वक्री')
        .replace(/\bDirect\b/gi, 'मार्गी')
        .replace(/\bPrimary Focus\b/gi, 'मुख्य लक्ष्य')
        .replace(/\bSelf-Observation\b/gi, 'आत्म-निरीक्षण')
        .replace(/\bDaily Companion\b/gi, 'दैनिक जीवन दर्पण')
        .replace(/\bPratah Sanskar\b/gi, 'प्रातः संस्कार')
        .replace(/\bPrashna Shastra\b/gi, 'प्रश्न शास्त्र')
        .replace(/\bAI Jyotish\b/gi, 'एआई ज्योतिष');
    } else {
      // English degree normalization
      cleaned = cleaned.replace(/(\d+(?:\.\d+)?)°/g, '$1 degrees');
    }

    return cleaned.replace(/\s+/g, ' ').trim();
  }

  /**
   * Intelligently segments text into spoken sentences using punctuation boundaries
   * (Purna viram '।', period '.', question mark '?', exclamation '!', newlines, semicolons)
   */
  static segmentIntoSentences(text: string): string[] {
    if (!text) return [];

    // Split on sentence terminators
    const rawParts = text.split(/(?<=[।\.!\?\n;])\s+/);
    const result: string[] = [];

    for (const part of rawParts) {
      const trimmed = part.trim();
      if (trimmed.length > 0) {
        // If a sentence is very long (> 180 chars) without punctuation, split on commas or clauses
        if (trimmed.length > 180 && trimmed.includes(',')) {
          const subParts = trimmed.split(/,\s+/);
          for (const sp of subParts) {
            if (sp.trim()) result.push(sp.trim());
          }
        } else {
          result.push(trimmed);
        }
      }
    }

    return result.length > 0 ? result : [text.trim()];
  }


  /**
   * Classifies the actual gender of a voice based on standard browser voice naming conventions,
   * BCP-47 locale subtags, and known Android/iOS/Windows/Chrome voice identifiers.
   */
  static classifyVoiceGender(voice: SpeechSynthesisVoice | null | undefined): 'female' | 'male' | 'unknown' {
    if (!voice) return 'unknown';
    const nameLower = voice.name.toLowerCase();

    // 1. Explicit female keywords and known Hindi female voice tokens
    const femaleKeywords = [
      'female', 'woman', 'girl', 'zira', 'kavya', 'priya', 'neerja',
      'swara', 'kalpana', 'geeta', 'shruti', 'sita', 'ananya', 'heera',
      'veena', 'sunita', 'lekha', 'aditi', 'raveena', 'radha', 'shanti', 'pooja',
      'hi-in-x-cfh', 'hi-in-x-hie', 'hi-in-x-hia', 'hi-in-wls',
      'female_1', 'female_2', 'female_3'
    ];
    if (femaleKeywords.some(kw => nameLower.includes(kw))) {
      return 'female';
    }

    // 2. Explicit male keywords and known Hindi male voice tokens
    const maleKeywords = [
      'male', 'man', 'hemant', 'madhav', 'rohit', 'anil', 'rishi',
      'david', 'george', 'mark', 'pradeep', 'amit', 'rajesh',
      'hi-in-x-cmh', 'hi-in-x-hid', 'hi-in-x-hic',
      'male_1', 'male_2', 'male_3'
    ];
    if (maleKeywords.some(kw => {
      if (kw === 'man') return /\bman\b/.test(nameLower) && !nameLower.includes('woman');
      return nameLower.includes(kw);
    })) {
      return 'male';
    }

    // 3. Known system voices
    // In Android Speech Services by Google, 'Google हिन्दी' is an acoustic male baritone voice.
    if (nameLower.includes('google') && (nameLower.includes('हिन्दी') || nameLower.includes('hindi'))) {
      return 'male';
    }

    return 'unknown';
  }

  /**
   * Resolves voice matching with full forensic metadata:
   * checks if a genuine female/male voice is truly available or if a fallback voice is being used.
   */
  static resolveVoiceWithMetadata(
    language: string = 'hi',
    preferredGender: 'male' | 'female' = 'male',
    profile: VoiceProfileType = 'default'
  ): {
    voice: SpeechSynthesisVoice | null;
    isExactGenderMatch: boolean;
    detectedVoiceGender: 'female' | 'male' | 'unknown';
    hasGenuineFemaleVoice: boolean;
    hasGenuineMaleVoice: boolean;
    candidateCount: number;
  } {
    let voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) {
      return {
        voice: null,
        isExactGenderMatch: false,
        detectedVoiceGender: 'unknown',
        hasGenuineFemaleVoice: false,
        hasGenuineMaleVoice: false,
        candidateCount: 0
      };
    }

    const targetLang = TTS_BCP47_MAP[language] || (language.includes('-') ? language : 'hi-IN');
    const langPrefix = targetLang.split('-')[0].toLowerCase();

    let candidates = voices.filter(v => v.lang.toLowerCase() === targetLang.toLowerCase());
    if (candidates.length === 0) {
      candidates = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
    }
    if (candidates.length === 0 && (language === 'sa' || targetLang === 'sa-IN')) {
      candidates = voices.filter(v => v.lang.toLowerCase().startsWith('hi'));
    }
    if (candidates.length === 0) {
      candidates = voices.filter(v => v.lang.toLowerCase().includes('in')) || voices;
    }

    if (candidates.length === 0) {
      return {
        voice: null,
        isExactGenderMatch: false,
        detectedVoiceGender: 'unknown',
        hasGenuineFemaleVoice: false,
        hasGenuineMaleVoice: false,
        candidateCount: 0
      };
    }

    const hasGenuineFemaleVoice = candidates.some(v => this.classifyVoiceGender(v) === 'female');
    const hasGenuineMaleVoice = candidates.some(v => this.classifyVoiceGender(v) === 'male');

    if (preferredGender === 'female') {
      const genuineFemale = candidates.find(v => this.classifyVoiceGender(v) === 'female');
      if (genuineFemale) {
        return {
          voice: genuineFemale,
          isExactGenderMatch: true,
          detectedVoiceGender: 'female',
          hasGenuineFemaleVoice: true,
          hasGenuineMaleVoice,
          candidateCount: candidates.length
        };
      }

      // No authentic female voice found in candidate list.
      // Use best available candidate as explicit fallback without falsely claiming it is female.
      const fallbackVoice = candidates.find(v => this.classifyVoiceGender(v) === 'male') || candidates[0];
      return {
        voice: fallbackVoice,
        isExactGenderMatch: false,
        detectedVoiceGender: this.classifyVoiceGender(fallbackVoice),
        hasGenuineFemaleVoice: false,
        hasGenuineMaleVoice,
        candidateCount: candidates.length
      };
    } else {
      // preferredGender === 'male' or profile === 'planet'
      const genuineMale = candidates.find(v => this.classifyVoiceGender(v) === 'male');
      if (genuineMale) {
        return {
          voice: genuineMale,
          isExactGenderMatch: true,
          detectedVoiceGender: 'male',
          hasGenuineFemaleVoice,
          hasGenuineMaleVoice: true,
          candidateCount: candidates.length
        };
      }

      const nonFemale = candidates.find(v => this.classifyVoiceGender(v) !== 'female');
      const fallbackVoice = nonFemale || candidates[0];
      return {
        voice: fallbackVoice,
        isExactGenderMatch: this.classifyVoiceGender(fallbackVoice) === 'male',
        detectedVoiceGender: this.classifyVoiceGender(fallbackVoice),
        hasGenuineFemaleVoice,
        hasGenuineMaleVoice: false,
        candidateCount: candidates.length
      };
    }
  }

  /**
   * Selects the highest quality voice for Hindi or regional languages.
   * If profile is 'planet': prioritizes deep, mature, resonant male voice.
   * If profile is 'bhava': prioritizes calm, explanatory neutral voice if distinct voice is available.
   * Safe fallback: if only one voice exists, gracefully uses it with profile acoustic calibration.
   */
  static selectBestVoice(
    language: string, 
    preferredGender: 'male' | 'female' = 'male',
    profile: VoiceProfileType = 'default'
  ): SpeechSynthesisVoice | null {
    const resolution = this.resolveVoiceWithMetadata(language, preferredGender, profile);
    return resolution.voice;
  }

  /**
   * Speaks the provided text using sentence-by-sentence paused scheduling.
   * Gives natural spiritual cadence (धीमी, गंभीर, स्पष्ट, स्थिर, आत्मविश्वासी, प्रभावशाली).
   * 
   * Supports both:
   * speak(text, language, options)
   * speak(text, language, onStateChange, options)
   */
  static speak(
    text: string, 
    language: string = 'hi',
    optionsOrCallback?: SpeechOptions | ((state: SpeechState) => void),
    options?: SpeechOptions
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    // Clean up any ongoing speech
    this.stop();

    let onStateChange: ((state: SpeechState) => void) | null = null;
    let finalOptions: SpeechOptions = {};

    if (typeof optionsOrCallback === 'function') {
      onStateChange = optionsOrCallback;
      finalOptions = options || {};
    } else if (optionsOrCallback && typeof optionsOrCallback === 'object') {
      finalOptions = optionsOrCallback;
      onStateChange = finalOptions.onStateChange || null;
    }

    this.stateListener = onStateChange;
    this.currentLanguage = language;
    this.currentOptions = finalOptions;
    this.isPausedState = false;

    const cleaned = this.cleanText(text, language);
    if (!cleaned) return false;

    // Segment into sentences for pause-aware narration
    const sentences = this.segmentIntoSentences(cleaned);
    if (sentences.length === 0) return false;

    this.currentSentences = sentences;
    this.currentSentenceIndex = 0;

    this.notifyState('playing');
    this.speakCurrentSentence();

    return true;
  }

  /**
   * Internal worker: speaks the current sentence in the queue,
   * then waits a calibrated profile-specific natural pause before starting next sentence.
   */
  private static speakCurrentSentence(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.currentSentenceIndex >= this.currentSentences.length) {
      // Completed all sentences
      this.activeUtterance = null;
      this.notifyState('stopped');
      return;
    }

    const sentenceText = this.currentSentences[this.currentSentenceIndex];
    const utterance = new SpeechSynthesisUtterance(sentenceText);
    this.activeUtterance = utterance;

    const targetLang = TTS_BCP47_MAP[this.currentLanguage] || (this.currentLanguage.includes('-') ? this.currentLanguage : 'hi-IN');
    utterance.lang = targetLang;

    const profile = this.currentOptions.profile || 'default';

    // Voice Selection (respecting profile and preferred gender)
    const targetGender = this.currentOptions.preferredGender || (profile === 'planet' ? 'male' : 'male');
    const selectedVoice = this.selectBestVoice(
      this.currentLanguage, 
      targetGender,
      profile
    );
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Rate selection: calibrated per profile
    // Planet Voice: deep, resonant, slower, confident (~0.74-0.78 base)
    // Bhava Voice: calm, explanatory, neutral (~0.80-0.84 base)
    const preset = this.currentOptions.speedPreset || this.getSpeedPreset();
    let defaultRate: number;
    if (profile === 'bhava') {
      defaultRate = preset === 'slow' ? 0.80 : preset === 'fast' ? 1.02 : 0.82;
    } else if (profile === 'planet') {
      defaultRate = preset === 'slow' ? 0.74 : preset === 'fast' ? 0.96 : 0.76;
      // Per-planet voice character calibration (keeping understandable Hindi)
      const pKey = this.currentOptions.planetKey;
      if (pKey === 'Sun') defaultRate += 0.0;
      else if (pKey === 'Moon') defaultRate += 0.04;
      else if (pKey === 'Mars') defaultRate += 0.06;
      else if (pKey === 'Mercury') defaultRate += 0.08;
      else if (pKey === 'Jupiter') defaultRate -= 0.04;
      else if (pKey === 'Venus') defaultRate += 0.02;
      else if (pKey === 'Saturn') defaultRate -= 0.06;
      else if (pKey === 'Rahu') defaultRate += 0.02;
      else if (pKey === 'Ketu') defaultRate -= 0.02;
    } else {
      defaultRate = SPEED_PRESET_RATES[preset] || 0.76;
    }
    utterance.rate = this.currentOptions.rate != null ? this.currentOptions.rate : defaultRate;

    // Pitch selection:
    // Planet Voice: deep, resonant (0.80–0.86, default 0.82 for Hindi, 0.85 for others)
    // Bhava Voice: calm, explanatory (0.92–0.96, default 0.94 for Hindi, 0.95 for others)
    // Female Voice: clear, serene, soothing (1.06–1.12, default 1.08 for Hindi)
    const isHindi = this.currentLanguage === 'hi' || this.currentLanguage === 'Hindi' || this.currentLanguage === 'sa';
    let defaultPitch: number;
    if (this.currentOptions.preferredGender === 'female') {
      const meta = this.resolveVoiceWithMetadata(this.currentLanguage, 'female', profile);
      // If authentic female voice is present, use clear female pitch (1.08 for Hindi); otherwise keep natural male pitch (0.90)
      defaultPitch = meta.hasGenuineFemaleVoice ? (isHindi ? 1.08 : 1.10) : 0.90;
    } else if (profile === 'bhava') {
      defaultPitch = isHindi ? 0.94 : 0.95;
    } else if (profile === 'planet') {
      defaultPitch = isHindi ? 0.82 : 0.85;
      // Per-planet pitch character
      const pKey = this.currentOptions.planetKey;
      if (pKey === 'Sun') defaultPitch -= 0.02;
      else if (pKey === 'Moon') defaultPitch += 0.07;
      else if (pKey === 'Mars') defaultPitch -= 0.01;
      else if (pKey === 'Mercury') defaultPitch += 0.08;
      else if (pKey === 'Jupiter') defaultPitch -= 0.05;
      else if (pKey === 'Venus') defaultPitch += 0.05;
      else if (pKey === 'Saturn') defaultPitch -= 0.07;
      else if (pKey === 'Rahu') defaultPitch -= 0.03;
      else if (pKey === 'Ketu') defaultPitch += 0.02;
    } else {
      defaultPitch = isHindi ? 0.84 : 0.90;
    }
    utterance.pitch = this.currentOptions.pitch != null ? this.currentOptions.pitch : defaultPitch;
    utterance.volume = this.currentOptions.volume != null ? this.currentOptions.volume : 1.0;

    if (this.currentOptions.onSentenceChange) {
      this.currentOptions.onSentenceChange(
        this.currentSentenceIndex + 1,
        this.currentSentences.length,
        sentenceText
      );
    }

    utterance.onend = () => {
      this.activeUtterance = null;
      this.currentSentenceIndex++;

      if (this.currentSentenceIndex < this.currentSentences.length && !this.isPausedState) {
        // Natural pause between sentences:
        // Planet: ~380ms (slightly longer, gambhira, confident cadence)
        // Bhava: ~240ms (natural teaching pauses, calm explanatory)
        let pauseDuration = profile === 'bhava' ? 240 : profile === 'planet' ? 380 : 300;
        if (profile === 'planet' && this.currentOptions.planetKey) {
          const pKey = this.currentOptions.planetKey;
          if (pKey === 'Jupiter' || pKey === 'Saturn') pauseDuration = 480;
          else if (pKey === 'Mercury') pauseDuration = 270;
          else if (pKey === 'Mars') pauseDuration = 320;
          else if (pKey === 'Moon' || pKey === 'Venus') pauseDuration = 340;
        }
        this.pauseTimeoutId = setTimeout(() => {
          this.pauseTimeoutId = null;
          if (!this.isPausedState) {
            this.speakCurrentSentence();
          }
        }, pauseDuration);
      } else {
        this.notifyState('stopped');
      }
    };

    utterance.onerror = (e) => {
      // Ignore cancellation events which happen on stop()
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      console.warn('Speech synthesis error on sentence:', e);
      guardianMonitor.recordIncident({
        category: 'TTS',
        message: `Speech synthesis failed with error: ${e.error || 'voice_synthesis_error'}`,
        module: 'PlanetSpeaksVoiceEngine',
        errorCode: 'TTS_SERVICE_ERROR',
        suggestedAction: 'Voice Engine की जाँच करें।',
      });
      this.activeUtterance = null;
      this.notifyState('stopped');
    };

    utterance.onpause = () => {
      this.isPausedState = true;
      this.notifyState('paused');
    };

    utterance.onresume = () => {
      this.isPausedState = false;
      this.notifyState('playing');
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stops current playback, clears queued sentences & pauses
   */
  static stop(): void {
    if (this.pauseTimeoutId) {
      clearTimeout(this.pauseTimeoutId);
      this.pauseTimeoutId = null;
    }

    this.currentSentences = [];
    this.currentSentenceIndex = 0;
    this.isPausedState = false;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
      this.notifyState('stopped');
    }
  }

  /**
   * Pauses current playback
   */
  static pause(): void {
    if (this.pauseTimeoutId) {
      clearTimeout(this.pauseTimeoutId);
      this.pauseTimeoutId = null;
    }
    this.isPausedState = true;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.notifyState('paused');
    }
  }

  /**
   * Resumes paused playback
   */
  static resume(): void {
    this.isPausedState = false;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.notifyState('playing');
      } else if (this.activeUtterance == null && this.currentSentenceIndex < this.currentSentences.length) {
        this.notifyState('playing');
        this.speakCurrentSentence();
      }
    }
  }

  /**
   * Checks if audio is currently speaking
   */
  static isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking;
  }

  /**
   * Returns current speech state
   */
  static getState(): SpeechState {
    if (this.isPausedState) return 'paused';
    if (this.isSpeaking()) return 'playing';
    return 'stopped';
  }

  private static notifyState(state: SpeechState): void {
    if (this.stateListener) {
      this.stateListener(state);
    }
  }
}
