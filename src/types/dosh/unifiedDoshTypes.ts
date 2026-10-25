/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — UNIFIED DOSH SUBSYSTEM (एकीकृत दोष विश्लेषण अनुबंध)
 * PHASE 1.13E: UNIFIED TYPES & CONTRACT DEFINITIONS
 * 
 * Strongly typed normalized envelope for all seven deterministic Dosh engines:
 * 1. Mangal Dosha (भौम / मांगलिक विचार)
 * 2. Kala Sarpa Tradition (कालसर्प परंपरा)
 * 3. Pitrishapa / Pitru Analysis (पितृशाप एवं पितृ विचार)
 * 4. Guru Chandal Analysis (गुरु चाण्डाल विचार)
 * 5. Grahan Vichar (ग्रहण विचार)
 * 6. Kemadruma Yoga & Bhanga (केमद्रुम योग एवं भंग)
 * 7. Shani Sade Sati & Dhaiyya (शनि साढ़ेसाती एवं ढैया)
 * 
 * STRICT INVARIANTS:
 * - Retains full engine-specific result details without destructive flattening.
 * - Zero severity scoring, zero ranking, zero percentage danger.
 * - Explicit source lineage and classical status distinction.
 * - Deterministic, stateless, pure TypeScript contracts.
 */

import { MangalDoshaAnalysisResult } from './mangalTypes';
import { KalaSarpaAnalysisResult } from './kalaSarpaTypes';
import { PitrishapaAnalysisResult } from './pitrishapaTypes';
import { GuruChandalResult } from './guruChandalTypes';
import { GrahanResult } from './grahanTypes';
import { KemadrumaResult } from './kemadrumaTypes';
import { ShaniTransitAnalysisResult } from './shaniTransitTypes';

export type UnifiedDoshId =
  | 'MANGAL_DOSHA'
  | 'KALA_SARPA_TRADITION'
  | 'PITRISHAPA_ANALYSIS'
  | 'GURU_CHANDAL_ANALYSIS'
  | 'GRAHAN_VICHAR'
  | 'KEMADRUMA_ANALYSIS'
  | 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS';

export type UnifiedDoshStatus =
  | 'PRESENT'
  | 'NOT_PRESENT'
  | 'INSUFFICIENT_DATA'
  | 'DATA_CONFLICT'
  | 'SPECIAL_CASE';

export type ClassicalStatus =
  | 'ATTESTED_CLASSICAL_FRAMEWORK'
  | 'TRADITIONAL_LATER_PRACTITIONER'
  | 'NARROW_CLASSICAL_FRAMEWORK'
  | 'TRADITIONAL_INTERPRETATION'
  | 'UNKNOWN_OR_NOT_UNIVERSAL';

export interface UnifiedEvidenceRecord {
  evidenceId?: string;
  source: string;
  provenance: string;
  fingerprint?: string;
  channel?: string;
  target?: string;
  ruleId?: string;
  description?: string;
  descriptionHindi?: string;
}

export type DoshEngineSpecificDetails =
  | MangalDoshaAnalysisResult
  | KalaSarpaAnalysisResult
  | PitrishapaAnalysisResult
  | GuruChandalResult
  | GrahanResult
  | KemadrumaResult
  | ShaniTransitAnalysisResult;

export interface UnifiedDoshResult<T extends DoshEngineSpecificDetails = DoshEngineSpecificDetails> {
  doshId: UnifiedDoshId;
  title: string;
  titleHindi: string;
  status: UnifiedDoshStatus;
  traditionalScope: string;
  traditionLineage: string;
  classicalStatus: ClassicalStatus;
  primaryIndication: {
    en: string;
    hi: string;
  };
  summaryIndication: {
    en: string;
    hi: string;
  };
  evidenceRecords: UnifiedEvidenceRecord[];
  disclaimer: {
    en: string;
    hi: string;
  };
  engineVersion: string;
  calculatedAt: string;
  engineSpecificDetails: T;
}

export interface UnifiedDoshAnalysisCollection {
  profileId?: string;
  calculatedAt: string;
  results: UnifiedDoshResult[];
  metadata: {
    totalEnginesEvaluated: number;
    executionOrder: UnifiedDoshId[];
    isDeterministic: boolean;
  };
}
