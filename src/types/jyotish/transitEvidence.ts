/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — TRANSIT EVIDENCE CONTRACTS
 */

export type TransitPrecision = 'EXACT' | 'APPROXIMATE' | 'HOURLY' | 'DAILY' | string;
export type TransitEvidenceClassification = 'PRIMARY_SUPPORT' | 'SECONDARY_SUPPORT' | 'NEUTRAL' | 'OBSTRUCTIVE' | string;
export type TransitEvidenceResult = 'CORROBORATED' | 'REJECTED' | 'INCONCLUSIVE' | string;
export type TransitEvidenceStatus = 'VERIFIED' | 'REJECTED' | 'PENDING' | string;
export type TransitRejectionReason = 
  | 'ADVERSE_HOUSE_TRIGGER' 
  | 'NO_SIGNIFICATOR_OVERLAP' 
  | 'DASHA_LORD_CONFLICT' 
  | 'ORB_OUT_OF_BOUNDS' 
  | 'RETROGRADE_INCOMPATIBILITY'
  | 'NONE'
  | string;

export interface TransitRuleLineage {
  primaryRule: string;
  sourceText?: string;
  slokaReference?: string;
  conditionDescription?: string;
  [key: string]: any;
}

export interface TransitEvidenceRecord {
  id: string;
  transitPlanet: string;
  boundaryTimestamp: string;
  eventType: string;
  exactLongitude: number;
  sign: string;
  hindiSign: string;
  degreeInSign: number;
  nakshatra: number;
  nakshatraName: string;
  pada: number;
  nakshatraLord: string;
  motion: string;
  transitHouse: number;
  ayanamsaMode: string;
  ayanamsaValue: number;
  swissEphSource: string;
  ephemerisMethod: string;
  calculationTimestamp: string;
  evaluationTimestamp?: string;
  timezone: string;
  targetHouses: number[];
  adverseHouses: number[];
  natalSignificatorRelationship: string;
  dashaLordRelationship: string;
  antardashaLordRelationship: string;
  cuspSubLordRelationship: string;
  rulingPlanetRelationship: string;
  targetHouseMatch: number[];
  adverseHouseMatch: number[];
  kpRuleId: string;
  result: TransitEvidenceResult;
  rejectionReason: TransitRejectionReason;
  precision: TransitPrecision;
  status: TransitEvidenceStatus;
  ruleLineage: TransitRuleLineage;
  evidenceFingerprint: string;
  [key: string]: any;
}

export interface TransitEvidenceLedger {
  windowId: string;
  category: string;
  mahadashaLord: string;
  antardashaLord: string;
  windowStart: string;
  windowEnd: string;
  totalEvaluatedCount: number;
  verifiedCount: number;
  rejectedCandidateCount: number;
  status: TransitEvidenceStatus;
  verifiedEvidence: readonly TransitEvidenceRecord[];
  rejectedEvidence: readonly TransitEvidenceRecord[];
  ledgerFingerprint: string;
  generatedAt: string;
  provenance: {
    source: string;
    engine: string;
    astronomicalEngine: string;
    ayanamsa: string;
    ephemerisMethod: string;
    ruleId: string;
    [key: string]: any;
  };
  [key: string]: any;
}
