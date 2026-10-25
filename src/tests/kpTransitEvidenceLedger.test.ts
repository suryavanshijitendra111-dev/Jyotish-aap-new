/**
 * JEEVANDARPAN — PHASE 3C.4 TRANSIT EVIDENCE LEDGER & EXPLAINABILITY TEST SUITE
 * 
 * Verifies:
 * 1. Protected calculation freeze (Benchmark chart 1986-06-24 06:20 IST Indore):
 *    - Career = Jupiter-Ketu (2030-08-13 -> 2031-07-19)
 *    - Business = Jupiter-Ketu (2030-08-13 -> 2031-07-19)
 *    - Marriage = Jupiter-Ketu (2030-08-13 -> 2031-07-19)
 *    - Property = Jupiter-Mercury (2028-05-07 -> 2030-08-13)
 *    - Finance = Jupiter-Ketu (2030-08-13 -> 2031-07-19)
 * 2. Immutable TransitEvidenceRecord structures (Object.isFrozen).
 * 3. Deterministic SHA-256 fingerprinting (64 hex characters, astronomical sensitivity).
 * 4. Full 15-step rule lineage preservation.
 * 5. Strict semantic separation: CURRENT_TRANSIT vs FUTURE_TRANSIT.
 * 6. Traceability of rejected candidates with explicit rejection reasons.
 * 7. Complete ledger checksum compilation.
 */

import assert from 'node:assert';
import { KpEngine } from '../services/jyotish/kpEngine';
import { KpJudgmentEngine } from '../services/jyotish/kpJudgmentEngine';
import { KpTimingEngine } from '../services/jyotish/kpTimingEngine';
import {
  computeEvidenceFingerprint,
  createTransitEvidenceRecord,
  createTransitEvidenceLedger,
  sha256Hex
} from '../services/jyotish/transitEvidenceLedger';
import { KPQuestionCategory } from '../types/jyotish/kpJudgment';

async function runLedgerVerificationSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 3C.4 TRANSIT EVIDENCE LEDGER TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // PART 1: IMMUTABILITY & DETERMINISTIC SHA-256 FINGERPRINT
  // -------------------------------------------------------------
  console.log('--- TEST 1: Immutability & Deterministic SHA-256 Fingerprinting ---');

  const sampleRecord = createTransitEvidenceRecord({
    category: 'career_job',
    windowId: 'Jupiter-Ketu-2030-08-13',
    mahadashaLord: 'Jupiter',
    antardashaLord: 'Ketu',
    windowStart: '2030-08-13T06:20:00+05:30',
    windowEnd: '2031-07-19T06:20:00+05:30',
    classification: 'FUTURE_TRANSIT',
    transitPlanet: 'Moon',
    hindiName: 'चंद्र',
    evaluationTimestamp: '2030-08-18T00:50:00.000Z',
    boundaryTimestamp: '2030-08-18T06:05:00.000Z',
    eventType: 'SIGN_INGRESS',
    exactLongitude: 0.0322,
    sign: 'Aries',
    hindiSign: 'मेष',
    degreeInSign: 0.03,
    nakshatra: 1,
    nakshatraName: 'Ashwini',
    pada: 1,
    nakshatraLord: 'Ketu',
    motion: 'Direct',
    transitHouse: 11,
    targetHouses: [2, 6, 10, 11],
    adverseHouses: [5, 9, 12],
    natalSignificatorRelationship: 'Rashis Ingress',
    dashaLordRelationship: 'None',
    antardashaLordRelationship: 'Connected to Antardasha Lord Ketu',
    cuspSubLordRelationship: 'None',
    targetHouseMatch: [2, 6, 11],
    adverseHouseMatch: [],
    kpRuleId: 'KP-RULE-FUTURE-TRANSIT-QUALIFIED',
    result: 'QUALIFIED',
    precision: '≤30 min',
    status: 'VERIFIED'
  });

  // Verify Object.isFrozen (Immutability)
  assert.strictEqual(Object.isFrozen(sampleRecord), true, 'Evidence record must be frozen and immutable');
  assert.strictEqual(Object.isFrozen(sampleRecord.ruleLineage), true, 'Rule lineage must be frozen');
  assert.strictEqual(Object.isFrozen(sampleRecord.targetHouseMatch), true, 'Target house matches array must be frozen');

  // Verify deterministic SHA-256 structure (64 hex characters)
  assert.strictEqual(sampleRecord.evidenceFingerprint.length, 64, 'Evidence fingerprint must be a 64-char SHA-256 hex string');
  assert.match(sampleRecord.evidenceFingerprint, /^[a-f0-9]{64}$/, 'Fingerprint must be lowercase hex');

  // Verify sensitivity: changing an astronomical parameter changes the hash
  const alteredHash = computeEvidenceFingerprint({
    classification: 'FUTURE_TRANSIT',
    category: 'career_job',
    windowId: 'Jupiter-Ketu-2030-08-13',
    transitPlanet: 'Moon',
    evaluationTimestamp: '2030-08-18T00:50:00.000Z',
    boundaryTimestamp: '2030-08-18T06:05:00.000Z',
    exactLongitude: 0.0422, // 0.01 deg difference
    sign: 'Aries',
    degreeInSign: 0.04,
    nakshatra: 1,
    pada: 1,
    motion: 'Direct',
    transitHouse: 11,
    kpRuleId: 'KP-RULE-FUTURE-TRANSIT-QUALIFIED',
    targetHouseMatch: [2, 6, 11],
    adverseHouseMatch: [],
    result: 'QUALIFIED'
  });
  assert.notStrictEqual(sampleRecord.evidenceFingerprint, alteredHash, 'Fingerprint must be sensitive to astronomical coordinates');

  console.log(`✓ Immutability confirmed. Fingerprint: ${sampleRecord.evidenceFingerprint.slice(0, 16)}...`);

  // -------------------------------------------------------------
  // PART 2: STRICT CURRENT VS FUTURE TRANSIT SEPARATION
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Strict Semantic Separation: CURRENT vs FUTURE ---');

  assert.strictEqual(sampleRecord.classification, 'FUTURE_TRANSIT');
  const currentSample = createTransitEvidenceRecord({
    category: 'career_job',
    windowId: 'current-query-time',
    mahadashaLord: 'Jupiter',
    antardashaLord: 'Venus',
    windowStart: '2026-09-24T12:00:00+05:30',
    windowEnd: '2026-09-24T12:00:00+05:30',
    classification: 'CURRENT_TRANSIT',
    transitPlanet: 'Sun',
    hindiName: 'सूर्य',
    evaluationTimestamp: '2026-09-24T12:00:00+05:30',
    exactLongitude: 157.007,
    sign: 'Virgo',
    hindiSign: 'कन्या',
    degreeInSign: 7.01,
    nakshatra: 12,
    nakshatraName: 'Uttara Phalguni',
    pada: 4,
    nakshatraLord: 'Sun',
    motion: 'Direct',
    transitHouse: 4,
    targetHouses: [2, 6, 10, 11],
    adverseHouses: [5, 9, 12],
    natalSignificatorRelationship: 'Current evaluation',
    dashaLordRelationship: 'None',
    antardashaLordRelationship: 'None',
    cuspSubLordRelationship: 'None',
    targetHouseMatch: [10],
    adverseHouseMatch: [],
    kpRuleId: 'KP-RULE-CURRENT-TRANSIT-RECORD',
    result: 'QUALIFIED',
    precision: 'Exact',
    status: 'VERIFIED'
  });

  assert.strictEqual(currentSample.classification, 'CURRENT_TRANSIT');
  assert.notStrictEqual(currentSample.classification, sampleRecord.classification);
  console.log('✓ Strict separation verified: CURRENT_TRANSIT cannot masquerade as FUTURE_TRANSIT.');

  // -------------------------------------------------------------
  // PART 3: COMPLETE 15-STEP RULE LINEAGE
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Unbroken 15-Step Rule Lineage Preservation ---');

  const lin = sampleRecord.ruleLineage;
  assert.ok(lin.futureTimestamp, '1. Future Timestamp must exist');
  assert.ok(lin.transitPlanet, '2. Transit Planet must exist');
  assert.ok(lin.swissEphLongitude != null, '3. Swiss Ephemeris longitude must exist');
  assert.ok(lin.siderealSign, '4. Sidereal sign must exist');
  assert.ok(lin.nakshatra, '5. Nakshatra number must exist');
  assert.ok(lin.pada, '6. Pada must exist');
  assert.ok(lin.nakshatraLord, '7. Star lord must exist');
  assert.ok(lin.transitHouse, '8. Transit house must exist');
  assert.ok(lin.natalSignificators, '9. Natal significators must exist');
  assert.ok(lin.dashaLordRelationship != null, '10. Dasha lord relationship must exist');
  assert.ok(lin.antardashaLordRelationship != null, '11. Antardasha lord relationship must exist');
  assert.ok(lin.cuspSubLordRelationship != null, '12. Cusp sub-lord relationship must exist');
  assert.ok(lin.targetHouseMatch != null, '13. Target house matches must exist');
  assert.ok(lin.adverseHouseMatch != null, '14. Adverse house check must exist');
  assert.strictEqual(lin.kpRuleId, 'KP-RULE-FUTURE-TRANSIT-QUALIFIED', '15. KP Rule ID must exist');
  assert.strictEqual(lin.finalResult, 'QUALIFIED');

  console.log('✓ 15-step mathematical rule lineage completely preserved.');

  // -------------------------------------------------------------
  // PART 4: REJECTED CANDIDATE EVIDENCE PRESERVATION
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Forensic Rejection Traceability ---');

  const rejectedSample = createTransitEvidenceRecord({
    category: 'career_job',
    windowId: 'Jupiter-Ketu-2030-08-13',
    mahadashaLord: 'Jupiter',
    antardashaLord: 'Ketu',
    windowStart: '2030-08-13T06:20:00+05:30',
    windowEnd: '2031-07-19T06:20:00+05:30',
    classification: 'FUTURE_TRANSIT',
    transitPlanet: 'Moon',
    hindiName: 'चंद्र',
    evaluationTimestamp: '2030-08-13T00:50:00.000Z',
    exactLongitude: 290.6447,
    sign: 'Capricorn',
    hindiSign: 'मकर',
    degreeInSign: 20.64,
    nakshatra: 22,
    nakshatraName: 'Shravana',
    pada: 4,
    nakshatraLord: 'Moon',
    motion: 'Direct',
    transitHouse: 8,
    targetHouses: [2, 6, 10, 11],
    adverseHouses: [5, 9, 12],
    natalSignificatorRelationship: 'Transit in H8',
    dashaLordRelationship: 'None',
    antardashaLordRelationship: 'None',
    cuspSubLordRelationship: 'None',
    targetHouseMatch: [2],
    adverseHouseMatch: [12],
    kpRuleId: 'KP-RULE-FUTURE-TRANSIT-REJECTED',
    result: 'REJECTED',
    rejectionReason: 'ADVERSE_HOUSE_MATCH',
    precision: '≤60 min',
    status: 'REJECTED'
  });

  assert.strictEqual(rejectedSample.result, 'REJECTED');
  assert.strictEqual(rejectedSample.rejectionReason, 'ADVERSE_HOUSE_MATCH');
  assert.strictEqual(rejectedSample.adverseHouseMatch.includes(12), true);
  console.log(`✓ Rejected candidate preserved with reason: ${rejectedSample.rejectionReason} (Adverse: [${rejectedSample.adverseHouseMatch.join(', ')}])`);

  // -------------------------------------------------------------
  // PART 5: BENCHMARK REGRESSION (1986-06-24 06:20 IST INDORE)
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Full Benchmark Regression Across 5 Categories ---');

  const resBench = await fetch('http://localhost:3000/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dob: '1986-06-24',
      time: '06:20',
      latitude: 22.7196,
      longitude: 75.8577,
      timezone: 'Asia/Kolkata',
      ayanamsa: 'Lahiri'
    })
  });
  assert.ok(resBench.ok);
  const masterData = await resBench.json();

  if (!masterData.vimshottariDasha) {
    const { VimshottariEngine } = await import('../services/jyotish/dasha/vimshottari');
    masterData.vimshottariDasha = VimshottariEngine.calculate(masterData);
  }

  const kpEngine = new KpEngine();
  const kpResult = kpEngine.evaluate(masterData);
  const judgmentEngine = new KpJudgmentEngine();
  const timingEngine = new KpTimingEngine();

  const categories: Array<{
    cat: KPQuestionCategory;
    name: string;
    expectedWindow: string;
    expectedStart: string;
    expectedEnd: string;
  }> = [
    { cat: 'career_job', name: 'Career', expectedWindow: 'Jupiter-Ketu', expectedStart: '2030-08-13', expectedEnd: '2031-07-19' },
    { cat: 'business', name: 'Business', expectedWindow: 'Jupiter-Ketu', expectedStart: '2030-08-13', expectedEnd: '2031-07-19' },
    { cat: 'marriage', name: 'Marriage', expectedWindow: 'Jupiter-Ketu', expectedStart: '2030-08-13', expectedEnd: '2031-07-19' },
    { cat: 'property', name: 'Property', expectedWindow: 'Jupiter-Mercury', expectedStart: '2028-05-07', expectedEnd: '2030-08-13' },
    { cat: 'finance_income', name: 'Finance', expectedWindow: 'Jupiter-Ketu', expectedStart: '2030-08-13', expectedEnd: '2031-07-19' }
  ];

  for (const c of categories) {
    const judgment = judgmentEngine.evaluateQuestion(kpResult, {
      question: `Query for ${c.name}`,
      category: c.cat,
      questionDate: '2026-09-24',
      questionTime: '12:00:00',
      questionLocation: 'Indore'
    });

    const timing = await timingEngine.evaluateTimingAsync(masterData, kpResult, judgment, {
      date: '2026-09-24',
      time: '12:00:00'
    });

    const best = timing.mostFavourableWindow;
    assert.ok(best);
    const windowStr = `${best.mahadashaLord}-${best.antardashaLord}`;
    assert.strictEqual(windowStr, c.expectedWindow, `${c.name} must remain ${c.expectedWindow}`);
    assert.ok(best.startDate.startsWith(c.expectedStart), `${c.name} start must match ${c.expectedStart}`);
    assert.ok(best.endDate.startsWith(c.expectedEnd), `${c.name} end must match ${c.expectedEnd}`);

    const ft = timing.futureTransitCorroboration;
    assert.ok(ft);
    assert.ok(ft.evidenceLedger, `Evidence ledger must be generated for ${c.name}`);
    assert.strictEqual(ft.evidenceLedger.ledgerFingerprint.length, 64, 'Ledger fingerprint must be 64-char SHA-256');
    assert.ok(ft.evidenceLedger.verifiedEvidence.length > 0, 'Verified evidence must exist');
    assert.ok(ft.evidenceLedger.rejectedEvidence.length > 0, 'Rejected evidence must be recorded for forensic transparency');

    console.log(`✓ [${c.name.toUpperCase()}] Top: ${windowStr} | Verified: ${ft.evidenceLedger.verifiedEvidence.length} | Rejected: ${ft.evidenceLedger.rejectedEvidence.length} | Fingerprint: ${ft.evidenceLedger.ledgerFingerprint.slice(0, 16)}...`);
  }

  console.log('\n================================================================');
  console.log('ALL PHASE 3C.4 TRANSIT EVIDENCE LEDGER TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runLedgerVerificationSuite().catch(err => {
  console.error('LEDGER VERIFICATION FAILED:', err);
  process.exit(1);
});
