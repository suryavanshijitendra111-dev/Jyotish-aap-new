/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION AUDIO CONTROLLER
 * PHASE 1.14F: PROCEDURAL AMBIENT SOUND, OPTIONAL BELLS & VOICE GUIDANCE
 * 
 * STRICT INVARIANTS:
 * - 100% Client-side procedural Web Audio and Web Speech API.
 * - Zero network audio files (no MP3/WAV/remote URLs).
 * - Zero LocalStorage / SessionStorage / IndexedDB / persistence.
 * - Zero AI / Gemini calls.
 * - Reuses existing singletons: houseAudioService and SpeechEngine.
 * - Audio is completely optional: failure or autoplay blocking NEVER crashes SessionEngine.
 */

import { SessionStatus, SessionPhase } from '../../types/meditation/meditationTypes';
import { PracticeDefinition } from '../../types/meditation/practiceCatalogTypes';
import { houseAudioService } from '../digitalHouse/audioService';
import { SpeechEngine } from '../companion/speechEngine';

export type MeditationAudioMode = 'VOICE_AND_AMBIENT' | 'AMBIENT_ONLY' | 'SILENT';

export interface AudioControllerOptions {
  initialMode?: MeditationAudioMode;
  language?: 'hi' | 'en';
  onAutoplayBlocked?: (message: string) => void;
}

export class MeditationAudioController {
  private mode: MeditationAudioMode = 'VOICE_AND_AMBIENT';
  private language: 'hi' | 'en' = 'hi';
  private isMuted: boolean = false;
  private isAmbientPlaying: boolean = false;
  private onAutoplayBlocked?: (message: string) => void;

  // Track spoken cues to avoid repeating the same cue multiple times during a single phase
  private spokenPhases: Set<SessionPhase> = new Set();
  private prevStatus: SessionStatus = 'IDLE';
  private prevPhase: SessionPhase | null = null;

  constructor(options?: AudioControllerOptions) {
    if (options?.initialMode) {
      this.mode = options.initialMode;
    }
    if (options?.language) {
      this.language = options.language;
    }
    this.onAutoplayBlocked = options?.onAutoplayBlocked;
  }

  public getMode(): MeditationAudioMode {
    return this.mode;
  }

  public setMode(mode: MeditationAudioMode): void {
    this.mode = mode;
    if (mode === 'SILENT') {
      this.stopAll();
    } else if (mode === 'AMBIENT_ONLY') {
      this.stopVoice();
    }
  }

  public getLanguage(): 'hi' | 'en' {
    return this.language;
  }

  public setLanguage(lang: 'hi' | 'en'): void {
    this.language = lang;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAll();
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopAll();
    }
  }

  /**
   * Responds to SessionEngine state & phase transitions.
   * Completely decoupled and failure-isolated: errors never propagate up.
   */
  public handleSessionStateChange(
    status: SessionStatus,
    currentPhase: SessionPhase,
    practice?: PracticeDefinition,
    customCueText?: string
  ): void {
    try {
      if (this.isMuted || this.mode === 'SILENT') {
        return;
      }

      // 1. Session Terminal States
      if (status === 'CANCELLED' || status === 'INTERRUPTED') {
        this.stopAll();
        return;
      }

      if (status === 'COMPLETED') {
        this.handleCompletion(customCueText);
        return;
      }

      // 2. Pause & Resume Handling
      if (status === 'PAUSED') {
        this.pause();
        return;
      }

      if (this.prevStatus === 'PAUSED' && (status === 'ACTIVE' || status === 'SILENCE')) {
        this.resume();
      }

      // 3. Preparation Phase
      if (status === 'PREPARING' && this.prevStatus !== 'PREPARING') {
        this.handlePreparation(customCueText);
      }

      // 4. Transition into ACTIVE from PREPARING or IDLE
      if (status === 'ACTIVE' && (this.prevStatus === 'PREPARING' || this.prevStatus === 'IDLE')) {
        this.handleActiveEntry(practice, customCueText);
      }

      // 5. Phase Transition within ACTIVE or SILENCE
      if (currentPhase !== this.prevPhase) {
        this.handlePhaseChange(currentPhase, customCueText);
      }

      this.prevStatus = status;
      this.prevPhase = currentPhase;
    } catch (err: unknown) {
      this.handleAudioError(err);
    }
  }

  /**
   * Plays a single gentle temple chime (432 Hz).
   */
  public playChime(frequency: number = 432): void {
    if (this.isMuted || this.mode === 'SILENT') return;
    try {
      houseAudioService.playTempleChime(frequency);
    } catch (err: unknown) {
      this.handleAudioError(err);
    }
  }

  /**
   * Speaks a short calm meditation cue via SpeechEngine.
   */
  public speakCue(text: string): void {
    if (this.isMuted || this.mode === 'SILENT' || this.mode === 'AMBIENT_ONLY') return;
    if (!text || typeof text !== 'string') return;

    try {
      SpeechEngine.speak(text, this.language, {
        rate: 0.76,
        pitch: 0.84,
        volume: 0.9
      });
    } catch (err: unknown) {
      this.handleAudioError(err);
    }
  }

  /**
   * Pauses ambient drone and ongoing voice guidance.
   */
  public pause(): void {
    try {
      if (this.isAmbientPlaying) {
        houseAudioService.stopAmbientDrone();
        this.isAmbientPlaying = false;
      }
      SpeechEngine.pause();
    } catch (err: unknown) {
      this.handleAudioError(err);
    }
  }

  /**
   * Resumes ambient drone and voice guidance.
   */
  public resume(): void {
    if (this.isMuted || this.mode === 'SILENT') return;
    try {
      if (!this.isAmbientPlaying) {
        houseAudioService.setVolume(0.22);
        houseAudioService.startAmbientDrone();
        this.isAmbientPlaying = true;
      }
      if (this.mode === 'VOICE_AND_AMBIENT') {
        SpeechEngine.resume();
      }
    } catch (err: unknown) {
      this.handleAudioError(err);
    }
  }

  /**
   * Immediately stops all meditation audio and releases resources.
   */
  public stopAll(): void {
    try {
      if (this.isAmbientPlaying) {
        houseAudioService.stopAmbientDrone();
        this.isAmbientPlaying = false;
      }
      SpeechEngine.stop();
    } catch (err: unknown) {
      // Swallowed safely
    }
  }

  public stopVoice(): void {
    try {
      SpeechEngine.stop();
    } catch (err: unknown) {
      // Swallowed safely
    }
  }

  public cleanup(): void {
    this.stopAll();
    this.spokenPhases.clear();
    this.prevStatus = 'IDLE';
    this.prevPhase = null;
  }

  // -------------------------------------------------------------
  // PRIVATE HANDLERS
  // -------------------------------------------------------------

  private handlePreparation(cueText?: string): void {
    if (cueText) {
      this.speakCue(cueText);
    }
  }

  private handleActiveEntry(_practice?: PracticeDefinition, cueText?: string): void {
    // 1. Play gentle transition bell
    this.playChime(432);

    // 2. Start subtle Om drone
    this.startAmbient();

    // 3. Spoken cue if provided
    if (cueText && !this.spokenPhases.has('PRACTICE')) {
      this.spokenPhases.add('PRACTICE');
      this.speakCue(cueText);
    }
  }

  private handlePhaseChange(phase: SessionPhase, cueText?: string): void {
    if (phase === 'SILENCE') {
      this.playChime(432);
      if (cueText && !this.spokenPhases.has('SILENCE')) {
        this.spokenPhases.add('SILENCE');
        this.speakCue(cueText);
      }
    } else if (phase === 'PRACTICE') {
      if (cueText && !this.spokenPhases.has('PRACTICE')) {
        this.spokenPhases.add('PRACTICE');
        this.speakCue(cueText);
      }
    }
  }

  private handleCompletion(cueText?: string): void {
    this.stopAll();
    this.playChime(432);
    if (cueText) {
      this.speakCue(cueText);
    }
  }

  private startAmbient(): void {
    if (this.isMuted || this.mode === 'SILENT') return;
    try {
      houseAudioService.setVolume(0.22);
      houseAudioService.startAmbientDrone();
      this.isAmbientPlaying = true;
    } catch (err: unknown) {
      this.handleAudioError(err);
    }
  }

  private handleAudioError(err: unknown): void {
    const isAutoplay =
      err instanceof Error &&
      (err.name === 'NotAllowedError' || err.message.toLowerCase().includes('autoplay'));

    if (isAutoplay && this.onAutoplayBlocked) {
      this.onAutoplayBlocked('ध्वनि शुरू नहीं हो सकी। अभ्यास बिना ध्वनि के जारी रहेगा।');
    }
  }
}
