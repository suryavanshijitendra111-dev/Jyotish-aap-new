/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — CONTROLLED REMEDY SUBSYSTEM (वैदिक उपाय एवं आध्यात्मिक मार्गदर्शन अनुबंध)
 * PHASE 1.13H: STRONGLY TYPED REMEDY & SOURCE BOUNDARY CONTRACTS
 * 
 * STRICT INVARIANTS:
 * - Read-only with respect to Dosh calculations.
 * - Zero backward mutation of MasterKundliData or UnifiedDoshResult.
 * - Source-verified traditional taxonomy: CLASSICAL, TRADITIONAL, LATER_PRACTITIONER,
 *   REGIONAL_CUSTOM, MODERN_ESOTERIC, SOURCE_UNVERIFIED only.
 * - Critical evidence separation: sourceContainsPractice vs. doshSpecificSupport.
 * - Zero commercialization: no gemstones, no paid rituals, no affiliate links.
 * - Zero fear-mongering, zero fatalistic or guaranteed claims.
 * - Language-independent IDs (remedyId, targetDosh).
 */

import { UnifiedDoshId, UnifiedDoshStatus } from './unifiedDoshTypes';

/**
 * Frozen allowed classifications per Phase 1.13H Part 1.
 * Combinations like CLASSICAL_TRADITIONAL or CLASSICAL_SATTVIC are strictly forbidden.
 */
export type RemedySourceClassification =
  | 'CLASSICAL'
  | 'TRADITIONAL'
  | 'LATER_PRACTITIONER'
  | 'REGIONAL_CUSTOM'
  | 'MODERN_ESOTERIC'
  | 'SOURCE_UNVERIFIED';

/**
 * Explicit textual connection to the specific Dosh.
 * Must NOT be assumed merely because the practice is traditional.
 */
export type DoshSpecificSupport =
  | 'YES'
  | 'NO'
  | 'UNCERTAIN';

/**
 * Source citation verification status.
 */
export type VerificationStatus =
  | 'VERIFIED'
  | 'SOURCE_UNVERIFIED';

/**
 * Deterministic eligibility rule tokens.
 */
export type RemedyEligibilityRule =
  | 'ELIGIBLE_IF_STATUS_PRESENT'
  | 'ELIGIBLE_IF_STATUS_PRESENT_AND_NO_BHANGA'
  | 'ELIGIBLE_IF_FULL_CONTAINMENT_ONLY'
  | 'ELIGIBLE_ONLY_IF_BASE_PRESENT_AND_BHANGA_IS_FALSE'
  | 'ELIGIBLE_IF_SADE_SATI_OR_DHAIYYA_ACTIVE';

/**
 * Functional category of the remedial or spiritual practice.
 */
export type RemedyCategory =
  | 'MANTRA_JAPA'
  | 'DAAN_CHARITY'
  | 'SEVA_SERVICE'
  | 'VRATA_DISCIPLINE'
  | 'SVADHYAYA'
  | 'MEDITATION'
  | 'TRADITIONAL_ROUTINE';

/**
 * Nature of the practice: corrective rule vs. optional devotional practice vs. horoscope matching rule.
 */
export type RemedyNature =
  | 'CORRECTIVE'
  | 'OPTIONAL_SPIRITUAL_PRACTICE'
  | 'MATCHING_GUIDELINE';

/**
 * Complete strongly-typed contract for an approved traditional remedy record.
 */
export interface RemedyItem {
  readonly remedyId: string;
  readonly targetDosh: UnifiedDoshId;
  readonly category: RemedyCategory;
  readonly nature: RemedyNature;
  readonly titleHi: string;
  readonly titleEn: string;
  readonly practiceHi: string;
  readonly practiceEn: string;
  readonly instructionHi: string;
  readonly instructionEn: string;
  readonly sourceName: string;
  readonly edition: string;
  readonly reference: string;
  readonly sourceClassification: RemedySourceClassification;
  readonly sourceContainsPractice: boolean;
  readonly doshSpecificSupport: DoshSpecificSupport;
  readonly verificationStatus: VerificationStatus;
  readonly eligibilityRule: RemedyEligibilityRule;
  readonly safetyNoteHi: string;
  readonly safetyNoteEn: string;
  readonly languageStatus: 'BILINGUAL_VERIFIED';
  readonly canonicalDevanagari?: string;
  readonly iastText?: string;
  readonly mantraMeaningHi?: string;
  readonly mantraMeaningEn?: string;
  readonly displayNotesHi?: string;
  readonly displayNotesEn?: string;
}

/**
 * Result of evaluating remedies for a specific Dosh.
 */
export interface DoshRemedyEvaluation {
  readonly doshId: UnifiedDoshId;
  readonly doshStatus: UnifiedDoshStatus;
  readonly hasBhanga: boolean;
  readonly isRemedyRequired: boolean;
  readonly bhangaNoticeHi?: string;
  readonly bhangaNoticeEn?: string;
  readonly guidanceNoticeHi: string;
  readonly guidanceNoticeEn: string;
  readonly eligibleRemedies: RemedyItem[];
}
