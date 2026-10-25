/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MANGAL DOSHA (भौम / मांगलिक विचार)
 * PHASE 1.13C-1: TYPE DEFINITIONS
 * 
 * Strongly-typed contracts for deterministic Mangal Dosha analysis,
 * secondary traditional indicators, and shastric cancellation rules.
 */

export type MangalDoshaStatus = 'PRESENT' | 'NOT_PRESENT' | 'INSUFFICIENT_DATA';
export type IndicatorPresence = 'PRESENT' | 'NOT_PRESENT' | 'UNKNOWN';

export interface MangalCancellationRule {
  ruleId: string;
  name: string;
  nameHindi: string;
  triggered: boolean;
  explanation: string;
  explanationHindi: string;
  tradition: string;
  confidence: 'CONFIDENT_CLASSICAL' | 'TRADITIONAL_SCHOOL';
}

export interface MangalIndicatorDetail {
  referencePoint: 'Lagna' | 'Moon' | 'Venus';
  traditionLabel: string;
  traditionLabelHindi: string;
  isPrimary: boolean;
  status: IndicatorPresence;
  houseFromReference: number | null; // 1-12
  isMangalHouse: boolean;
  description: string;
  descriptionHindi: string;
}

export interface MangalCalculatedFacts {
  lagnaSign: number | null; // 1-12
  lagnaSignName: string | null;
  marsSign: number | null; // 1-12
  marsSignName: string | null;
  marsHouseFromLagna: number | null; // 1-12
  marsDegree: number | null;
  marsLongitude: number | null;
  moonSign: number | null;
  moonHouseFromLagna: number | null;
  venusSign: number | null;
  venusHouseFromLagna: number | null;
  jupiterHouseFromLagna: number | null;
  jupiterSign: number | null;
}

export interface MangalDoshaAnalysisResult {
  doshaId: 'MANGAL_DOSHA';
  status: MangalDoshaStatus;
  primaryStandard: {
    referencePoint: 'Lagna';
    traditionTitle: string;
    traditionTitleHindi: string;
    sourceText: string;
    evaluatedHouses: number[]; // [1, 4, 7, 8, 12]
  };
  primaryHouseFromLagna: number | null;
  primaryIndication: IndicatorPresence;
  moonIndicator: MangalIndicatorDetail;
  venusIndicator: MangalIndicatorDetail;
  cancellationChecks: MangalCancellationRule[];
  mitigated: boolean;
  activeCancellationsCount: number;
  ruleLineage: string[];
  calculatedFacts: MangalCalculatedFacts;
  disclaimer: {
    en: string;
    hi: string;
  };
}
