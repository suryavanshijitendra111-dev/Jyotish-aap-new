/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION & SADHANA DOMAIN TYPES
 * PHASE 1.14C: STRONG TYPING, LIFECYCLE & SAFETY CONTRACTS
 * 
 * STRICT INVARIANTS:
 * - Independent from Dosh calculations, planetary positions, or predictions.
 * - Zero medical diagnosis, clinical anxiety/depression classification, or cure claims.
 * - Non-commercial: zero gemstones, paid rituals, or fee-based guru services.
 * - Fully local-first and offline-compatible.
 */

// -------------------------------------------------------------
// 1. DURATION & TIMING TOKENS
// -------------------------------------------------------------

export type SessionDurationSeconds = 180 | 300 | 600 | 900 | 1200 | 1800; // 3, 5, 10, 15, 20, 30 min

export const ALLOWED_SESSION_DURATIONS: readonly SessionDurationSeconds[] = [
  180, 300, 600, 900, 1200, 1800
] as const;

export const DEFAULT_SESSION_DURATION: SessionDurationSeconds = 600; // 10 minutes

// -------------------------------------------------------------
// 2. AUDIO & VOICE MODES
// -------------------------------------------------------------

export type AudioMode = 'OFF' | 'VOICE_ONLY' | 'AMBIENT' | 'VOICE_AND_AMBIENT';

export type AmbientSoundscape = 'SILENT' | 'OM_DRONE_136HZ' | 'TIBETAN_BOWL' | 'TEMPLE_BELL';

export type VoiceMode = 'OFF' | 'GUIDED_CUES' | 'INTERVAL_BELLS_ONLY';

export type LanguageCode = 'hi' | 'en';

export interface SessionAudioSettings {
  readonly audioMode: AudioMode;
  readonly ambientSoundscape: AmbientSoundscape;
  readonly ambientVolume: number; // 0.0 to 1.0
  readonly voiceEnabled: boolean;
  readonly voiceSpeedPreset: 'slow' | 'normal' | 'fast';
  readonly languageCode: LanguageCode;
}

// -------------------------------------------------------------
// 3. SESSION LIFECYCLE & PHASES
// -------------------------------------------------------------

export type SessionStatus =
  | 'IDLE'
  | 'PREPARING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SILENCE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'INTERRUPTED';

export type SessionPhase =
  | 'INTRO'        // Brief voice grounding cue
  | 'SETTLE'       // Posture & stillness settle
  | 'PRACTICE'     // Core guided cues or breathing intervals
  | 'SILENCE'      // Deep quiet observation
  | 'REFLECTION'   // Post-session qualitative check-in
  | 'COMPLETE';    // Final sound cue & completion log

export interface SessionPhaseConfig {
  readonly phase: SessionPhase;
  readonly durationSeconds: number;
  readonly voiceCueKey?: string;
  readonly bellAtStart?: boolean;
}

// -------------------------------------------------------------
// 4. QUALITATIVE EVALUATION & REFLECTION
// -------------------------------------------------------------

export type QualitativeState =
  | 'CALM'
  | 'REFRESHED'
  | 'CENTERED'
  | 'NEUTRAL'
  | 'RESTLESS'
  | 'TIRED'
  | 'OTHER';

export interface ReflectionEntry {
  readonly sessionId: string;
  readonly postSessionState: QualitativeState;
  readonly personalNotes?: string;
  readonly recordedAt: string; // ISO 8601
}

// -------------------------------------------------------------
// 5. RECOMMENDATION & SESSIONS
// -------------------------------------------------------------

export type RecommendationSource =
  | 'USER_SELECTED'
  | 'DAILY_COMPANION'
  | 'PRATAH_SANSKAR'
  | 'MANUAL';

export interface MeditationSessionRecord {
  readonly sessionId: string;
  readonly profileId: string;
  readonly practiceId: string;
  readonly targetDurationSeconds: number;
  readonly actualDurationSeconds: number;
  readonly status: SessionStatus;
  readonly recommendationSource: RecommendationSource;
  readonly startedAt: string; // ISO 8601
  readonly completedAt?: string; // ISO 8601
  readonly reflection?: ReflectionEntry;
  readonly sankalpaText?: string;
  readonly audioModeUsed: AudioMode;
}

// -------------------------------------------------------------
// 6. PROGRESS, DAILY GOAL & STREAK
// -------------------------------------------------------------

export interface DailyGoalConfig {
  readonly targetMinutesPerDay: number; // e.g. 10
  readonly reminderEnabled: boolean;
  readonly preferredReminderTime?: string; // "06:30"
  readonly reminderMessage?: string;
}

export interface MeditationStreak {
  readonly currentStreakDays: number;
  readonly longestStreakDays: number;
  readonly lastPracticedDate: string; // "YYYY-MM-DD"
  readonly totalSessionsCompleted: number;
  readonly totalMinutesPracticed: number;
}

export interface MeditationUserProfileState {
  readonly profileId: string;
  readonly goal: DailyGoalConfig;
  readonly streak: MeditationStreak;
  readonly preferredAudio: SessionAudioSettings;
  readonly defaultPracticeId: string;
  readonly activeSankalpa?: string;
}

// -------------------------------------------------------------
// 7. PERSISTENCE SCHEMA (LOCAL-FIRST)
// -------------------------------------------------------------

export interface MeditationStorageSchema {
  readonly version: '1.0.0';
  readonly profileId: string;
  readonly state: MeditationUserProfileState;
  readonly history: readonly MeditationSessionRecord[];
  readonly lastUpdated: string; // ISO 8601
}
