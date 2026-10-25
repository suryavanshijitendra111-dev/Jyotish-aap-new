/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PITRISHAPA / ANCESTRAL LINEAGE ANALYSIS (पितृशाप एवं पितृ विचार)
 * PHASE 1.13C-3: TYPE DEFINITIONS
 * 
 * Strongly-typed contracts for deterministic Parashari Pitrishapa analysis,
 * independent evidence channels (Sun, 9th house, 9th lord, progeny context),
 * and classical Jupiter mitigations.
 * 
 * STRICT INVARIANTS:
 * - Narrow classical framework: derived from Parashari Purva Janma Shapa.
 * - Zero generalized fear-based claims (no poverty, no curses, no doomed fate).
 * - Distinct evidence channels; zero artificial numerical scoring.
 */

export type PitrishapaStatus = 'PRESENT' | 'NOT_PRESENT' | 'INSUFFICIENT_DATA';
export type ChannelAfflictionStatus = 'PRESENT' | 'NOT_PRESENT' | 'INSUFFICIENT_DATA';

export interface PitrishapaEvidenceItem {
  ruleId: string;
  ruleName: string;
  ruleNameHindi: string;
  triggered: boolean;
  channel: 'SUN' | 'NINTH_HOUSE' | 'NINTH_LORD' | 'PROGENY_CONTEXT';
  primaryTarget: string;
  afflictingPlanet: string;
  house: number | null;
  rashi: number | null;
  rashiName: string | null;
  degree: number | null;
  tradition: string;
  confidence: 'CONFIDENT_CLASSICAL' | 'TRADITIONAL_SCHOOL';
  calculatedFact: string;
  calculatedFactHindi: string;
  traditionalInterpretation: string;
  traditionalInterpretationHindi: string;
}

export interface PitrishapaMitigationItem {
  ruleId: string;
  name: string;
  nameHindi: string;
  triggered: boolean;
  mitigatingPlanet: 'Jupiter';
  target: 'Sun' | '9th House' | '9th Lord';
  mechanism: 'Conjunction' | 'Aspect';
  explanation: string;
  explanationHindi: string;
  tradition: string;
  confidence: 'CONFIDENT_CLASSICAL' | 'TRADITIONAL_SCHOOL';
}

export interface PitrishapaRuleLineage {
  ruleId: string;
  ruleName: string;
  sourceFamily: string;
  classicalStatus: 'ATTESTED_CLASSICAL_FRAMEWORK_WITH_NARROW_SCOPE';
  tradition: string;
  scope: string;
  confidence: 'HIGH' | 'MODERATE';
  explanation: string;
}

export interface PitrishapaCalculatedFacts {
  sunHouse: number | null;
  sunSign: number | null;
  sunDegree: number | null;
  ninthHouseRashi: number | null;
  ninthHouseLord: string | null;
  ninthHouseLordHouse: number | null;
  ninthHousePlanets: string[];
  rahuHouse: number | null;
  ketuHouse: number | null;
  saturnHouse: number | null;
  jupiterHouse: number | null;
}

export interface PitrishapaAnalysisResult {
  doshaId: 'PITRISHAPA_ANALYSIS';
  status: PitrishapaStatus;
  classicalStatus: 'ATTESTED_CLASSICAL_FRAMEWORK_WITH_NARROW_SCOPE';
  tradition: string;
  channelStatus: {
    sunAffliction: ChannelAfflictionStatus;
    ninthHouseAffliction: ChannelAfflictionStatus;
    ninthLordAffliction: ChannelAfflictionStatus;
    progenyAffliction: ChannelAfflictionStatus;
  };
  sunEvidence: PitrishapaEvidenceItem[];
  ninthHouseEvidence: PitrishapaEvidenceItem[];
  ninthLordEvidence: PitrishapaEvidenceItem[];
  progenyRelatedEvidence: PitrishapaEvidenceItem[];
  mitigationChecks: PitrishapaMitigationItem[];
  mitigated: boolean;
  activeMitigationsCount: number;
  ruleLineage: PitrishapaRuleLineage[];
  calculatedFacts: PitrishapaCalculatedFacts;
  disclaimer: {
    en: string;
    hi: string;
  };
}
