/**
 * JEEVANDARPAN — TRANSIT EVIDENCE LEDGER SERVICE (PHASE 3C.4)
 * 
 * Provides deterministic SHA-256 fingerprinting, immutable record creation,
 * rule lineage tracing, and ledger compilation for astronomical transit evidence.
 * 
 * STRICT INTEGRITY:
 * - Deterministic SHA-256 hash derived exclusively from astronomical & KP calculation parameters.
 * - Immutable data structures (Object.freeze).
 * - No AI modifications.
 */

import {
  TransitEvidenceRecord,
  TransitEvidenceLedger,
  TransitEvidenceClassification,
  TransitEvidenceResult,
  TransitEvidenceStatus,
  TransitPrecision,
  TransitRejectionReason,
  TransitRuleLineage
} from '../../types/jyotish/transitEvidence';

/**
 * Standard isomorphic SHA-256 hash function.
 * Works seamlessly in both Node.js server and client browser runtimes.
 */
export function sha256Hex(str: string): string {
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      // Use Node's native crypto for maximum speed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const crypto = require('node:crypto');
      return crypto.createHash('sha256').update(str).digest('hex');
    } catch {
      // fallback to pure JS if require fails
    }
  }

  // Pure JavaScript SHA-256 implementation for isomorphic zero-dependency safety
  return pureJsSha256(str);
}

function pureJsSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, number> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const s0 = i >= 16 ? rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3) : 0;
      const s1 = i >= 16 ? rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10) : 0;

      const val = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      w[i] = val;

      const s1Hash = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1Hash + ch + k[i] + val) | 0;
      const s0Hash = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0Hash + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Computes deterministic fingerprint for an astronomical transit evidence record.
 */
export function computeEvidenceFingerprint(params: {
  classification: TransitEvidenceClassification;
  category: string;
  windowId: string;
  transitPlanet: string;
  evaluationTimestamp: string;
  boundaryTimestamp?: string;
  exactLongitude: number;
  sign: string;
  degreeInSign: number;
  nakshatra: number;
  pada: number;
  motion: string;
  transitHouse: number;
  kpRuleId: string;
  targetHouseMatch: number[];
  adverseHouseMatch: number[];
  result: TransitEvidenceResult;
  rejectionReason?: TransitRejectionReason;
}): string {
  const canonicalString = [
    params.classification,
    params.category,
    params.windowId,
    params.transitPlanet,
    params.evaluationTimestamp,
    params.boundaryTimestamp || 'none',
    params.exactLongitude.toFixed(4),
    params.sign,
    params.degreeInSign.toFixed(2),
    params.nakshatra,
    params.pada,
    params.motion,
    params.transitHouse,
    params.kpRuleId,
    params.targetHouseMatch.join(','),
    params.adverseHouseMatch.join(','),
    params.result,
    params.rejectionReason || 'none'
  ].join('|');

  return sha256Hex(canonicalString);
}

/**
 * Creates an immutable TransitEvidenceRecord with calculation provenance & rule lineage.
 */
export function createTransitEvidenceRecord(params: {
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

  ayanamsaMode?: string;
  ayanamsaValue?: number;
  swissEphSource?: string;
  ephemerisMethod?: string;
  calculationTimestamp?: string;
  timezone?: string;

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

  lineageExplanation?: { hi: string; en: string };
}): Readonly<TransitEvidenceRecord> {
  const ayanamsaMode = params.ayanamsaMode || 'Lahiri';
  const swissEphSource = params.swissEphSource || 'Swiss Ephemeris';
  const ephemerisMethod = params.ephemerisMethod || 'Moshier / Swiss Ephemeris Standard';
  const calculationTimestamp = params.calculationTimestamp || new Date().toISOString();
  const timezone = params.timezone || 'Asia/Kolkata';

  const evidenceId = `EVID-${params.classification.slice(0, 3)}-${params.transitPlanet}-${params.evaluationTimestamp.slice(0, 10)}-${Math.abs(Math.round(params.exactLongitude * 100))}`;

  const fingerprint = computeEvidenceFingerprint({
    classification: params.classification,
    category: params.category,
    windowId: params.windowId,
    transitPlanet: params.transitPlanet,
    evaluationTimestamp: params.evaluationTimestamp,
    boundaryTimestamp: params.boundaryTimestamp,
    exactLongitude: params.exactLongitude,
    sign: params.sign,
    degreeInSign: params.degreeInSign,
    nakshatra: params.nakshatra,
    pada: params.pada,
    motion: params.motion,
    transitHouse: params.transitHouse,
    kpRuleId: params.kpRuleId,
    targetHouseMatch: params.targetHouseMatch,
    adverseHouseMatch: params.adverseHouseMatch,
    result: params.result,
    rejectionReason: params.rejectionReason
  });

  const ruleLineage: TransitRuleLineage = Object.freeze({
    futureTimestamp: params.boundaryTimestamp || params.evaluationTimestamp,
    transitPlanet: params.transitPlanet,
    swissEphLongitude: params.exactLongitude,
    siderealSign: params.sign,
    degreeInSign: params.degreeInSign,
    nakshatra: params.nakshatra,
    nakshatraName: params.nakshatraName,
    pada: params.pada,
    nakshatraLord: params.nakshatraLord,
    transitHouse: params.transitHouse,
    natalSignificators: params.targetHouseMatch,
    dashaLordRelationship: params.dashaLordRelationship,
    antardashaLordRelationship: params.antardashaLordRelationship,
    cuspSubLordRelationship: params.cuspSubLordRelationship,
    targetHouseMatch: params.targetHouseMatch,
    adverseHouseMatch: params.adverseHouseMatch,
    kpRuleId: params.kpRuleId,
    finalResult: params.result,
    explanation: params.lineageExplanation || {
      hi: `${params.transitPlanet} गोचर भाव ${params.transitHouse} में स्थित होकर नक्षत्र ${params.nakshatraName} (स्वामी: ${params.nakshatraLord}) के माध्यम से लक्ष्य भाव [${params.targetHouseMatch.join(', ')}] को सक्रिय करता है।`,
      en: `${params.transitPlanet} transiting house ${params.transitHouse} via star ${params.nakshatraName} (lord: ${params.nakshatraLord}) activates target house(s) [${params.targetHouseMatch.join(', ')}].`
    }
  });

  const record: TransitEvidenceRecord = {
    evidenceId,
    profileId: params.profileId,
    category: params.category,
    windowId: params.windowId,
    mahadashaLord: params.mahadashaLord,
    antardashaLord: params.antardashaLord,
    windowStart: params.windowStart,
    windowEnd: params.windowEnd,
    classification: params.classification,

    transitPlanet: params.transitPlanet,
    hindiName: params.hindiName,
    evaluationTimestamp: params.evaluationTimestamp,
    boundaryTimestamp: params.boundaryTimestamp,
    eventType: params.eventType,

    exactLongitude: params.exactLongitude,
    sign: params.sign,
    hindiSign: params.hindiSign,
    degreeInSign: params.degreeInSign,
    nakshatra: params.nakshatra,
    nakshatraName: params.nakshatraName,
    pada: params.pada,
    nakshatraLord: params.nakshatraLord,
    motion: params.motion,
    transitHouse: params.transitHouse,

    ayanamsaMode,
    ayanamsaValue: params.ayanamsaValue,
    swissEphSource,
    ephemerisMethod,
    calculationTimestamp,
    timezone,

    targetHouses: Object.freeze([...params.targetHouses]) as any,
    adverseHouses: Object.freeze([...params.adverseHouses]) as any,

    natalSignificatorRelationship: params.natalSignificatorRelationship,
    dashaLordRelationship: params.dashaLordRelationship,
    antardashaLordRelationship: params.antardashaLordRelationship,
    cuspSubLordRelationship: params.cuspSubLordRelationship,
    rulingPlanetRelationship: params.rulingPlanetRelationship,

    targetHouseMatch: Object.freeze([...params.targetHouseMatch]) as any,
    adverseHouseMatch: Object.freeze([...params.adverseHouseMatch]) as any,

    kpRuleId: params.kpRuleId,
    result: params.result,
    rejectionReason: params.rejectionReason,
    precision: params.precision,
    status: params.status,

    ruleLineage,
    evidenceFingerprint: fingerprint
  };

  return Object.freeze(record);
}

/**
 * Creates an immutable TransitEvidenceLedger from evaluated evidence records.
 */
export function createTransitEvidenceLedger(params: {
  windowId: string;
  category: string;
  mahadashaLord: string;
  antardashaLord: string;
  windowStart: string;
  windowEnd: string;
  totalEvaluatedCount: number;
  verifiedEvidence: TransitEvidenceRecord[];
  rejectedEvidence: TransitEvidenceRecord[];
  status: TransitEvidenceStatus;
}): Readonly<TransitEvidenceLedger> {
  const verifiedHashes = params.verifiedEvidence.map(e => e.evidenceFingerprint).join(';');
  const rejectedHashes = params.rejectedEvidence.map(e => e.evidenceFingerprint).join(';');
  const combinedData = `${params.windowId}|${params.category}|${params.windowStart}|${params.windowEnd}|${params.status}|${verifiedHashes}|${rejectedHashes}`;
  const ledgerFingerprint = sha256Hex(combinedData);

  const ledger: TransitEvidenceLedger = {
    windowId: params.windowId,
    category: params.category,
    mahadashaLord: params.mahadashaLord,
    antardashaLord: params.antardashaLord,
    windowStart: params.windowStart,
    windowEnd: params.windowEnd,
    totalEvaluatedCount: params.totalEvaluatedCount,
    verifiedCount: params.verifiedEvidence.length,
    rejectedCandidateCount: params.rejectedEvidence.length,
    status: params.status,
    verifiedEvidence: Object.freeze([...params.verifiedEvidence]),
    rejectedEvidence: Object.freeze([...params.rejectedEvidence]),
    ledgerFingerprint,
    generatedAt: new Date().toISOString(),
    provenance: Object.freeze({
      source: 'Swiss Ephemeris',
      engine: 'FutureTransitEngine',
      astronomicalEngine: 'TransitEngine',
      ayanamsa: 'Lahiri',
      ephemerisMethod: 'High-Precision Deterministic Binary Refinement',
      ruleId: 'KP-TRANSIT-CORROBORATION-4FOLD'
    })
  };

  return Object.freeze(ledger);
}
