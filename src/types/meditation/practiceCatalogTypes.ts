/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION PRACTICE CATALOG TYPES
 */

import { SessionDurationSeconds } from './meditationTypes';

export type PracticeId =
  | 'BREATH_AWARENESS'
  | 'SILENT_MEDITATION'
  | 'BODY_AWARENESS'
  | 'GRATITUDE_REFLECTION'
  | 'SELF_OBSERVATION'
  | 'PRAYERFUL_CONTEMPLATION';

export interface PracticeDefinition {
  practiceId: PracticeId;
  titleHindi: string;
  titleEnglish: string;
  descriptionHindi: string;
  descriptionEnglish: string;
  defaultDurationSeconds: SessionDurationSeconds;
  allowedDurations: SessionDurationSeconds[];
  medicalClaim: false;
  jyotishDependency: false;
  isOfflineAvailable: boolean;
  instructionsHindi: string[];
  instructionsEnglish: string[];
  contraindicationsHindi: string[];
  contraindicationsEnglish: string[];
  safetyNoticeHindi: string;
  safetyNoticeEnglish: string;
  iconName: string;
}
