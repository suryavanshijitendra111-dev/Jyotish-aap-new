/**
 * JEEVANDARPAN — PERMANENT TRANSIT EVIDENCE LEDGER DATA MODEL (PHASE 3C.4)
 * 
 * Defines immutable, strongly-typed structures for astronomical transit evidence records,
 * deterministic SHA-256 fingerprinting, rule lineage tracing, and technical ledgering.
 * 
 * STRICT INTEGRITY CONSTRAINTS:
 * - Evidence records are frozen and immutable once created
 * - AI must NEVER become the source of astronomical truth
 * - Deterministic SHA-256 hash computed strictly from astronomical calculation fields (no UI text in hash)
 * - Strict separation: CURRENT_TRANSIT vs FUTURE_TRANSIT
 * - Preserves both verified and rejected candidate evidence for full forensic transparency
 */

export type TransitEvidenceClassification = 'CURRENT_TRANSIT' | 'FUTURE_TRANSIT';

export type TransitEvidenceResult = 'QUALIFIED' | 'REJECTED' | 'UNRESOLVED';

export type TransitEvidenceStatus = 'VERIFIED' | 'REJECTED' | 'UNAVAILABLE' | 'CALCULATION_ERROR';

export type TransitPrecision = 'Exact' | '≤30 min' | '≤60 min' | 'EVENT_TIME_UNRESOLVED';

export type TransitRejectionReason =
  | 'TARGET_HOUSE_NOT_MATCHED'
  | 'ADVERSE_HOUSE_MATCH'
  | 'NO_DASHA_LINK'
  | 'NO_ANTARDASHA_LINK'
  | 'NO_KP_RELATIONSHIP'
  | 'EVENT_TIME_UNRESOLVED'
  | 'CALCULATION_ERROR';

/**
 * Complete unbroken rule lineage tracing how the astronomical state led to the qualification/rejection.
 */
export interface TransitRuleLineage {
  futureTimestamp: string;
  transitPlanet: string;
  swissEphLongitude: number;
  siderealSign: string;
  degreeInSign: number;
  nakshatra: number;
  nakshatraName: string;
  pada: number;
  nakshatraLord: string;
  transitHouse: number;
  natalSignificators: number[];
  dashaLordRelationship: string;
  antardashaLordRelationship: string;
  cuspSubLordRelationship: string;
  targetHouseMatch: number[];
  adverseHouseMatch: number[];
  kpRuleId: string;
  finalResult: TransitEvidenceResult;
  explanation: {
    hi: string;
    en: string;
  };
}

/**
 * Immutable Single Astronomical Transit Evidence Record.
 */
export interface TransitEvidenceRecord {
  evidenceId: string;
  profileId?: string;
  category: string;
  windowId: string;
  mahadashaLord: string;
  antardashaLord: string;
  windowStart: string;
  windowEnd: string;

  classification: TransitEvidenceClassification;

  transitPlanet: string;
  hindiName: string;
  evaluationTimestamp: string;
  boundaryTimestamp?: string;
  eventType?: string;

  exactLongitude: number;
  sign: string;
  hindiSign: string;
  degreeInSign: number;
  nakshatra: number;
  nakshatraName: string;
  pada: number;
  nakshatraLord: string;
  motion: 'Direct' | 'Retrograde';
  transitHouse: number;

  ayanamsaMode: string;
  ayanamsaValue?: number;
  swissEphSource: string;
  ephemerisMethod: string;
  calculationTimestamp: string;
  timezone: string;

  targetHouses: number[];
  adverseHouses: number[];

  natalSignificatorRelationship: string;
  dashaLordRelationship: string;
  antardashaLordRelationship: string;
  cuspSubLordRelationship: string;
  rulingPlanetRelationship?: string;

  targetHouseMatch: number[];
  adverseHouseMatch: number[];

  kpRuleId: string;
  result: TransitEvidenceResult;
  rejectionReason?: TransitRejectionReason;
  precision: TransitPrecision;
  status: TransitEvidenceStatus;

  ruleLineage: TransitRuleLineage;

  /**
   * Deterministic SHA-256 fingerprint computed strictly from astronomical calculation fields.
   */
  evidenceFingerprint: string;
}

/**
 * Full Permanent Evidence Ledger for a Timing Window.
 */
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
  };
}
