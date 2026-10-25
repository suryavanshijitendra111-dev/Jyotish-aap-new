/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA CATALOG DOMAIN TYPES
 * PHASE 1.15D: STATIC, DETERMINISTIC, HUMAN-AUDITED CATALOG FOUNDATION
 * 
 * STRICT INVARIANTS:
 * - Version: 1.0.0
 * - Exactly 4 foundation entries (Shavasana, Sukhasana, Tadasana, Anulom Vilom).
 * - aiGenerated: false (strictly static, deterministic, human-audited).
 * - medicalClaim: false (no medical cures, disease treatments, or clinical promises).
 * - jyotishDependency: false (completely isolated from horoscopes, planets, doshas).
 * - requiresKumbhaka: false (strictly ZERO breath retention).
 * - requiresBreathRetention: false (strictly ZERO breath retention).
 * - requiresRapidBreathing: false (zero hyperventilation, zero Kapalabhati/Bhastrika).
 * - requiresForcefulBreathing: false (natural, unforced breathing).
 * - requiresBandhas: false (zero locks).
 * - requiresInversion: false (zero headstands/shoulderstands).
 */

export const YOGA_CATALOG_VERSION = '1.0.0' as const;
export type YogaCatalogVersion = typeof YOGA_CATALOG_VERSION;

export type YogaPracticeId =
  | 'shavasana'
  | 'sukhasana'
  | 'tadasana'
  | 'anulom_vilom';

export type YogaPracticeCategory =
  | 'ASANA'
  | 'BREATH_AWARENESS';

export type YogaPracticeDifficulty =
  | 'BEGINNER';

export type YogaSourceClassification =
  | 'CLASSICAL'
  | 'TRADITIONAL'
  | 'LATER_TRADITION'
  | 'MODERN_ADAPTATION';

export type YogaSafetyLevel =
  | 'LOW_RISK_CANDIDATE';

export interface YogaPracticeDefinition {
  readonly id: YogaPracticeId;
  readonly nameHindi: string;
  readonly nameEnglish: string;
  readonly category: YogaPracticeCategory;
  readonly difficulty: YogaPracticeDifficulty;
  readonly safetyLevel: YogaSafetyLevel;
  readonly sourceClassification: YogaSourceClassification;
  readonly sourceCitation: string;
  readonly isModernAdaptation: boolean;
  
  // Editorial and instruction copy
  readonly techniqueSummaryHindi: string;
  readonly techniqueSummaryEnglish: string;
  readonly instructionsHindi: readonly string[];
  readonly instructionsEnglish: readonly string[];
  readonly modificationGuidanceHindi: string;
  readonly modificationGuidanceEnglish: string;
  readonly safetyNoticeHindi: string;
  readonly safetyNoticeEnglish: string;
  readonly contraindicationsHindi: readonly string[];
  readonly contraindicationsEnglish: readonly string[];

  // Duration configuration
  readonly defaultDurationSeconds: number;
  readonly allowedDurationsSeconds: readonly number[];

  // Mandatory Safety & Architecture Invariants
  readonly aiGenerated: false;
  readonly humanAudited: true;
  readonly sourceReviewed: true;
  readonly medicalClaim: false;
  readonly jyotishDependency: false;
  readonly requiresKumbhaka: false;
  readonly requiresBreathRetention: false;
  readonly requiresRapidBreathing: false;
  readonly requiresForcefulBreathing: false;
  readonly requiresBandhas: false;
  readonly requiresInversion: false;
}

export interface YogaCatalogValidationResult {
  readonly isValid: boolean;
  readonly catalogVersion: string;
  readonly practiceCount: number;
  readonly errors: readonly string[];
}
