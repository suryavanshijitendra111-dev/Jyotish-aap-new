/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PITRISHAPA DOSHA TYPES
 */

export type PitrishapaStatus = 'AFFLICTION_PRESENT' | 'MITIGATED' | 'NOT_PRESENT' | 'INSUFFICIENT_DATA' | string;
export type ChannelAfflictionStatus = 'PRESENT' | 'NOT_PRESENT' | 'INSUFFICIENT_DATA' | string;

export interface PitrishapaEvidenceItem {
  id: string;
  source: string;
  descriptionHindi: string;
  descriptionEnglish: string;
  severity?: string;
  [key: string]: any;
}

export interface PitrishapaMitigationItem {
  ruleId: string;
  nameHindi: string;
  nameEnglish: string;
  conditionMet: boolean;
  explanationHindi: string;
  explanationEnglish: string;
  [key: string]: any;
}

export interface PitrishapaRuleLineage {
  canonicalSource: string;
  sloka?: string;
  principleHindi: string;
  principleEnglish: string;
  [key: string]: any;
}

export interface PitrishapaCalculatedFacts {
  sunHouse?: number | null;
  sunSign?: string | null;
  ninthLord?: string | null;
  ninthLordHouse?: number | null;
  fifthLord?: string | null;
  fifthLordHouse?: number | null;
  [key: string]: any;
}

export interface PitrishapaAnalysisResult {
  doshaId: string;
  status: PitrishapaStatus;
  classicalStatus: string;
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
  [key: string]: any;
}
