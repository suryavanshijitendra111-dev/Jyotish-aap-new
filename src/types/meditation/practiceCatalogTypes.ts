/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PRACTICE CATALOG TYPES & SAFETY CONTRACTS
 * PHASE 1.14C: IMMUTABLE PRACTICE DEFINITION CONTRACT
 * 
 * STRICT INVARIANTS:
 * - medicalClaim MUST be typed as false (no medical treatment or clinical cure claims).
 * - jyotishDependency MUST be typed as false (independent from astrological calculations).
 * - requiresBreathControl MUST be typed as false (no retention, kumbhaka, or hypoxia).
 * - requiresPhysicalMovement MUST be typed as false (pure seated or stillness contemplation).
 */

import { SessionDurationSeconds, SessionPhaseConfig } from './meditationTypes';

export type PracticeId =
  | 'BREATH_AWARENESS'
  | 'SILENT_MEDITATION'
  | 'BODY_AWARENESS'
  | 'GRATITUDE_REFLECTION'
  | 'SELF_OBSERVATION'
  | 'PRAYERFUL_CONTEMPLATION';

export type PracticeCategory =
  | 'BREATH_AWARENESS'
  | 'SILENT_MEDITATION'
  | 'BODY_AWARENESS'
  | 'GRATITUDE_REFLECTION'
  | 'SELF_OBSERVATION'
  | 'PRAYERFUL_CONTEMPLATION';

export type PracticeDifficulty =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'OPEN_TO_ALL';

export type SafetyLevel =
  | 'LOW_RISK'
  | 'GENERAL_WELLNESS'
  | 'SPECIAL_CAUTION';

export interface PracticeDefinition {
  readonly practiceId: PracticeId;
  readonly category: PracticeCategory;
  readonly difficulty: PracticeDifficulty;
  readonly defaultDurationSeconds: SessionDurationSeconds;
  readonly allowedDurations: readonly SessionDurationSeconds[];
  readonly safetyLevel: SafetyLevel;
  readonly voiceGuidanceSupported: boolean;
  readonly ambientAudioSupported: boolean;
  readonly requiresTimer: boolean;
  readonly requiresBreathControl: false;
  readonly requiresPhysicalMovement: false;
  readonly spiritualContent: boolean;
  readonly medicalClaim: false;
  readonly jyotishDependency: false;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly instructionsKey: string;
  readonly safetyNoticeKey: string;
  readonly phases: readonly SessionPhaseConfig[];
}
