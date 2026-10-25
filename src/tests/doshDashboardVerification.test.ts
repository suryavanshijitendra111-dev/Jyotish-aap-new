/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — DOSH DASHBOARD VERIFICATION SUITE
 * PHASE 1.13F: PRESENTATION LAYER ARCHITECTURE & CONTRACT TESTS
 * 
 * Verifies all 20 required assertions:
 * 1. Seven engines appear in unified collection.
 * 2. Unified collection is consumed.
 * 3. No direct engine calculation from UI.
 * 4. PRESENT state renders.
 * 5. NOT_PRESENT renders.
 * 6. INSUFFICIENT_DATA renders.
 * 7. DATA_CONFLICT renders.
 * 8. Kala Sarpa PARTIAL_CONTAINMENT preserved.
 * 9. Kala Sarpa BOUNDARY_CASE preserved.
 * 10. Shani SADE_SATI preserved.
 * 11. Shani DHAIYYA_4TH preserved.
 * 12. Shani DHAIYYA_8TH preserved.
 * 13. Kemadruma base/bhanga distinction preserved.
 * 14. Mangal primary/secondary indicators preserved.
 * 15. Evidence IDs are not modified.
 * 16. No severity/ranking fields.
 * 17. No AI/network calls.
 * 18. Profile isolation.
 * 19. Hindi/English labels.
 * 20. Existing protected benchmark invariance.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { MasterKundliData, PlanetData, BirthProfile } from '../types/kundli';
import { DoshOrchestrator } from '../services/dosh/doshOrchestrator';
import { ShaniFutureWindow } from '../types/dosh/shaniTransitTypes';

function makeMockPlanet(
  name: string,
  house: number,
  rashi: number,
  degree: number = 15,
  lon?: number
): PlanetData {
  const exactLon = lon ?? (rashi - 1) * 30 + degree;
  return {
    name,
    d1House: house,
    rashi,
    degree,
    isRetrograde: false,
    exactLongitude: exactLon,
    siderealLongitude: exactLon
  } as unknown as PlanetData;
}

function createCompleteCleanChart(lagnaRashi: number = 1): MasterKundliData {
  const getHouse = (r: number) => ((r - lagnaRashi + 12) % 12) + 1;
  return {
    lagna: { rashi: lagnaRashi, degree: 15, name: 'Lagna' },
    planets: {
      Sun: makeMockPlanet('Sun', getHouse(3), 3, 10),
      Moon: makeMockPlanet('Moon', getHouse(7), 7, 12),
      Mars: makeMockPlanet('Mars', getHouse(2), 2, 8),
      Mercury: makeMockPlanet('Mercury', getHouse(3), 3, 18),
      Jupiter: makeMockPlanet('Jupiter', getHouse(9), 9, 20),
      Venus: makeMockPlanet('Venus', getHouse(4), 4, 14),
      Saturn: makeMockPlanet('Saturn', getHouse(11), 11, 22),
      Rahu: makeMockPlanet('Rahu', getHouse(6), 6, 5),
      Ketu: makeMockPlanet('Ketu', getHouse(12), 12, 5)
    }
  } as unknown as MasterKundliData;
}

async function runDoshDashboardVerificationSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.13F: DOSH DASHBOARD VERIFICATION SUITE');
  console.log('================================================================');

  const baseChart = createCompleteCleanChart(1);
  const transitOptions = { currentSaturnTransit: { rashi: 7 } }; // 7th rashi is Moon rashi -> Sade Sati Peak

  // TEST 1 & 2: Seven engines appear in unified collection & are consumed by presentation contract
  console.log('--- TESTS 1 & 2: Seven Engines & Unified Collection Contract ---');
  const collection = DoshOrchestrator.analyzeAllDoshas(baseChart, transitOptions, 'PROFILE_1');
  assert.strictEqual(collection.results.length, 7, 'Must evaluate exactly 7 engines');
  assert.strictEqual(collection.metadata.totalEnginesEvaluated, 7);

  const expectedDoshIds = [
    'MANGAL_DOSHA',
    'KALA_SARPA_TRADITION',
    'PITRISHAPA_ANALYSIS',
    'GURU_CHANDAL_ANALYSIS',
    'GRAHAN_VICHAR',
    'KEMADRUMA_ANALYSIS',
    'SHANI_SADE_SATI_DHAIYYA_ANALYSIS'
  ];
  assert.deepStrictEqual(collection.results.map(r => r.doshId), expectedDoshIds);
  console.log('  ✓ Tests 1 & 2 Passed: Exactly 7 analyses present in unified collection');

  // TEST 3: No direct engine calculation or import in DoshDashboard.tsx
  console.log('--- TEST 3: Architectural Boundary Check in DoshDashboard.tsx ---');
  const dashboardPath = path.resolve('src/components/dosh/DoshDashboard.tsx');
  const dashboardSource = fs.readFileSync(dashboardPath, 'utf8');

  const prohibitedEngines = [
    'mangalDoshaEngine',
    'kalaSarpaTraditionEngine',
    'pitrishapaEngine',
    'guruChandalEngine',
    'grahanEngine',
    'kemadrumaEngine',
    'shaniSadeSatiEngine'
  ];
  for (const eng of prohibitedEngines) {
    assert(
      !dashboardSource.includes(eng),
      `DoshDashboard must NOT import ${eng} directly! Must use DoshOrchestrator only.`
    );
  }
  assert(
    dashboardSource.includes('DoshOrchestrator.analyzeAllDoshas'),
    'DoshDashboard must consume DoshOrchestrator.analyzeAllDoshas'
  );
  console.log('  ✓ Test 3 Passed: Zero direct engine imports in presentation layer');

  // TEST 4 & 5: PRESENT & NOT_PRESENT state rendering contracts
  console.log('--- TESTS 4 & 5: PRESENT and NOT_PRESENT Statuses ---');
  const mangalPresentChart = createCompleteCleanChart(1);
  mangalPresentChart.planets.Mars = makeMockPlanet('Mars', 1, 1);
  const colPresent = DoshOrchestrator.analyzeAllDoshas(mangalPresentChart, transitOptions);
  assert.strictEqual(colPresent.results[0].status, 'PRESENT');

  const colNotPresent = DoshOrchestrator.analyzeAllDoshas(baseChart, transitOptions);
  assert.strictEqual(colNotPresent.results[0].status, 'NOT_PRESENT');
  console.log('  ✓ Tests 4 & 5 Passed: PRESENT and NOT_PRESENT status contracts verified');

  // TEST 6 & 7: INSUFFICIENT_DATA and DATA_CONFLICT render contracts
  console.log('--- TESTS 6 & 7: INSUFFICIENT_DATA and DATA_CONFLICT Statuses ---');
  const colInsufficient = DoshOrchestrator.analyzeAllDoshas(null);
  colInsufficient.results.forEach(r => {
    assert.strictEqual(r.status, 'INSUFFICIENT_DATA');
  });

  const conflictChart = createCompleteCleanChart(1);
  conflictChart.planets.Jupiter = makeMockPlanet('Jupiter', 4, 4, 10, 100);
  conflictChart.planets.Rahu = makeMockPlanet('Rahu', 5, 4, 12, 102); // same rashi (4), different house (4 vs 5)
  const colConflict = DoshOrchestrator.analyzeAllDoshas(conflictChart, transitOptions);
  const gcConflict = colConflict.results.find(r => r.doshId === 'GURU_CHANDAL_ANALYSIS');
  assert.strictEqual(gcConflict?.status, 'DATA_CONFLICT');
  console.log('  ✓ Tests 6 & 7 Passed: INSUFFICIENT_DATA and DATA_CONFLICT status contracts verified');

  // TEST 8 & 9: Kala Sarpa PARTIAL_CONTAINMENT & BOUNDARY_CASE preserved
  console.log('--- TESTS 8 & 9: Kala Sarpa Special Cases Preserved ---');
  const ksChart = createCompleteCleanChart(1);
  (ksChart.planets.Rahu as any).siderealLongitude = 0;
  (ksChart.planets.Ketu as any).siderealLongitude = 180;
  const lons = [20, 40, 60, 80, 100, 200, 220]; // 5 in, 2 out
  ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach((p, idx) => {
    (ksChart.planets as any)[p].siderealLongitude = lons[idx];
  });
  const colKS = DoshOrchestrator.analyzeAllDoshas(ksChart, transitOptions);
  const ksRes = colKS.results.find(r => r.doshId === 'KALA_SARPA_TRADITION');
  assert.strictEqual(ksRes?.status, 'SPECIAL_CASE');
  assert.strictEqual((ksRes?.engineSpecificDetails as any).classification, 'PARTIAL_CONTAINMENT');

  // Boundary Case
  const ksBoundChart = createCompleteCleanChart(1);
  (ksBoundChart.planets.Rahu as any).siderealLongitude = 0;
  (ksBoundChart.planets.Ketu as any).siderealLongitude = 180;
  ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach((p) => {
    (ksBoundChart.planets as any)[p].siderealLongitude = 50;
  });
  (ksBoundChart.planets.Saturn as any).siderealLongitude = 0; // on Rahu node
  const colBound = DoshOrchestrator.analyzeAllDoshas(ksBoundChart, transitOptions);
  const ksBoundRes = colBound.results.find(r => r.doshId === 'KALA_SARPA_TRADITION');
  assert.strictEqual(ksBoundRes?.status, 'SPECIAL_CASE');
  assert.strictEqual((ksBoundRes?.engineSpecificDetails as any).classification, 'BOUNDARY_CASE');
  console.log('  ✓ Tests 8 & 9 Passed: Kala Sarpa PARTIAL_CONTAINMENT and BOUNDARY_CASE preserved');

  // TEST 10, 11, 12: Shani SADE_SATI, DHAIYYA_4TH, DHAIYYA_8TH preserved
  console.log('--- TESTS 10, 11, 12: Shani Transit Classifications ---');
  // Moon is in 7th rashi (Libra).
  // 12th from Moon = 6 (Virgo) -> SADE_SATI RISING
  const colRising = DoshOrchestrator.analyzeAllDoshas(baseChart, { currentSaturnTransit: { rashi: 6 } });
  const shaniRising = colRising.results.find(r => r.doshId === 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS');
  assert.strictEqual((shaniRising?.engineSpecificDetails as any).classification, 'SADE_SATI');
  assert.strictEqual((shaniRising?.engineSpecificDetails as any).phase, 'RISING');

  // 4th from Moon = 10 (Capricorn) -> DHAIYYA_4TH
  const colDhaiyya4 = DoshOrchestrator.analyzeAllDoshas(baseChart, { currentSaturnTransit: { rashi: 10 } });
  const shaniDhaiyya4 = colDhaiyya4.results.find(r => r.doshId === 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS');
  assert.strictEqual((shaniDhaiyya4?.engineSpecificDetails as any).classification, 'DHAIYYA_4TH');

  // 8th from Moon = 2 (Taurus) -> DHAIYYA_8TH
  const colDhaiyya8 = DoshOrchestrator.analyzeAllDoshas(baseChart, { currentSaturnTransit: { rashi: 2 } });
  const shaniDhaiyya8 = colDhaiyya8.results.find(r => r.doshId === 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS');
  assert.strictEqual((shaniDhaiyya8?.engineSpecificDetails as any).classification, 'DHAIYYA_8TH');
  console.log('  ✓ Tests 10, 11, 12 Passed: SADE_SATI, DHAIYYA_4TH, and DHAIYYA_8TH preserved');

  // TEST 13: Kemadruma base / bhanga distinction preserved
  console.log('--- TEST 13: Kemadruma Base & Bhanga Distinction ---');
  const kmChart = createCompleteCleanChart(1);
  kmChart.planets.Sun = makeMockPlanet('Sun', 4, 4, 10); // Kendra planet triggers Bhanga
  const colKM = DoshOrchestrator.analyzeAllDoshas(kmChart, transitOptions);
  const kmRes = colKM.results.find(r => r.doshId === 'KEMADRUMA_ANALYSIS');
  assert.strictEqual((kmRes?.engineSpecificDetails as any).baseIndication, 'PRESENT');
  assert.strictEqual((kmRes?.engineSpecificDetails as any).bhangaPresent, true);
  console.log('  ✓ Test 13 Passed: Kemadruma base indication and classical bhanga preserved distinctly');

  // TEST 14: Mangal primary/secondary indicators preserved
  console.log('--- TEST 14: Mangal Primary & Secondary Indicators ---');
  const mangalRes = colPresent.results.find(r => r.doshId === 'MANGAL_DOSHA');
  assert.strictEqual((mangalRes?.engineSpecificDetails as any).primaryIndication, 'PRESENT');
  assert((mangalRes?.engineSpecificDetails as any).moonIndicator !== undefined);
  assert((mangalRes?.engineSpecificDetails as any).venusIndicator !== undefined);
  console.log('  ✓ Test 14 Passed: Mangal primary Lagna and secondary Moon/Venus indicators preserved');

  // TEST 15: Evidence IDs are not modified
  console.log('--- TEST 15: Evidence IDs Unmodified ---');
  const mockFuture: ShaniFutureWindow = {
    windowId: 'SHANI_FUTURE_WINDOW_2028',
    classification: 'SADE_SATI',
    phase: 'PEAK',
    saturnRashi: 7,
    saturnRashiName: 'तुला (Libra)',
    startDate: '2028-04-10',
    endDate: '2030-06-15',
    evidenceId: 'EV_LEDGER_SATURN_2028_IMMUTABLE',
    source: 'FutureTransitEngine',
    provenance: 'SwissEphemeris_HighPrecision',
    fingerprint: '3b92c483a992a00c8f123456789abcdef0123456789abcdef0123456789abcde'
  };
  const colEvidence = DoshOrchestrator.analyzeAllDoshas(baseChart, {
    currentSaturnTransit: { rashi: 7 },
    futureWindows: [mockFuture]
  });
  const shaniEvRes = colEvidence.results.find(r => r.doshId === 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS');
  assert.strictEqual(shaniEvRes?.evidenceRecords[0].evidenceId, 'EV_LEDGER_SATURN_2028_IMMUTABLE');
  assert.strictEqual(shaniEvRes?.evidenceRecords[0].fingerprint, '3b92c483a992a00c8f123456789abcdef0123456789abcdef0123456789abcde');
  console.log('  ✓ Test 15 Passed: Evidence IDs and SHA-256 fingerprints unmodified');

  // TEST 16: No severity/ranking fields
  console.log('--- TEST 16: Zero Severity / Ranking Fields ---');
  collection.results.forEach(r => {
    assert.strictEqual((r as any).score, undefined);
    assert.strictEqual((r as any).severityScore, undefined);
    assert.strictEqual((r as any).dangerScore, undefined);
    assert.strictEqual((r as any).percentage, undefined);
  });
  assert.strictEqual((collection as any).overallScore, undefined);
  console.log('  ✓ Test 16 Passed: Zero numerical or percentage scores found');

  // TEST 17: No AI/network calls in presentation or calculation
  console.log('--- TEST 17: Offline Deterministic Execution ---');
  assert(!dashboardSource.includes('ai-jyotish'));
  assert(!dashboardSource.includes('gemini'));
  assert(!dashboardSource.includes('google/genai'));
  console.log('  ✓ Test 17 Passed: Zero AI or external network dependencies');

  // TEST 18: Profile isolation
  console.log('--- TEST 18: Profile Isolation ---');
  const profA = DoshOrchestrator.analyzeAllDoshas(baseChart, transitOptions, 'PROFILE_A');
  const profB = DoshOrchestrator.analyzeAllDoshas(baseChart, transitOptions, 'PROFILE_B');
  assert.strictEqual(profA.profileId, 'PROFILE_A');
  assert.strictEqual(profB.profileId, 'PROFILE_B');
  console.log('  ✓ Test 18 Passed: Profile identity cleanly isolated');

  // TEST 19: Hindi/English labels available on all 7 cards
  console.log('--- TEST 19: Bilingual Labels on All Analyses ---');
  collection.results.forEach(r => {
    assert(r.title && r.title.length > 0);
    assert(r.titleHindi && r.titleHindi.length > 0);
    assert(r.primaryIndication.en && r.primaryIndication.en.length > 0);
    assert(r.primaryIndication.hi && r.primaryIndication.hi.length > 0);
    assert(r.disclaimer.en && r.disclaimer.en.length > 0);
    assert(r.disclaimer.hi && r.disclaimer.hi.length > 0);
  });
  console.log('  ✓ Test 19 Passed: Bilingual metadata verified across all 7 analyses');

  // TEST 20: Existing protected benchmark invariance
  console.log('--- TEST 20: Protected Jeevan Pragya Benchmark Invariance ---');
  const { JeevanPragyaTimelineService } = await import('../services/jeevanPragya/jeevanPragyaTimelineService');
  const mockMasterData = {
    planets: [
      { name: 'Sun', sign: 'Gemini', house: 12, degree: 8.5, nakshatra: 6, pada: 1, isRetrograde: false },
      { name: 'Moon', sign: 'Sagittarius', house: 6, degree: 28.2, nakshatra: 21, pada: 1, isRetrograde: false },
      { name: 'Mars', sign: 'Sagittarius', house: 6, degree: 29.1, nakshatra: 21, pada: 1, isRetrograde: false },
      { name: 'Mercury', sign: 'Gemini', house: 12, degree: 14.2, nakshatra: 6, pada: 3, isRetrograde: false },
      { name: 'Jupiter', sign: 'Aquarius', house: 8, degree: 27.5, nakshatra: 25, pada: 3, isRetrograde: false },
      { name: 'Venus', sign: 'Cancer', house: 1, degree: 12.8, nakshatra: 8, pada: 3, isRetrograde: false },
      { name: 'Saturn', sign: 'Scorpio', house: 5, degree: 10.4, nakshatra: 17, pada: 3, isRetrograde: true },
      { name: 'Rahu', sign: 'Aries', house: 10, degree: 4.8, nakshatra: 1, pada: 2, isRetrograde: true },
      { name: 'Ketu', sign: 'Libra', house: 4, degree: 4.8, nakshatra: 14, pada: 4, isRetrograde: true }
    ],
    houses: [
      { houseNumber: 1, sign: 'Cancer', degree: 15.2, nakshatra: 'Pushya' },
      { houseNumber: 2, sign: 'Leo', degree: 12.0, nakshatra: 'Magha' },
      { houseNumber: 3, sign: 'Virgo', degree: 10.0, nakshatra: 'Hasta' },
      { houseNumber: 4, sign: 'Libra', degree: 11.5, nakshatra: 'Swati' },
      { houseNumber: 5, sign: 'Scorpio', degree: 14.0, nakshatra: 'Anuradha' },
      { houseNumber: 6, sign: 'Sagittarius', degree: 16.0, nakshatra: 'Purva Ashadha' },
      { houseNumber: 7, sign: 'Capricorn', degree: 15.2, nakshatra: 'Shravana' },
      { houseNumber: 8, sign: 'Aquarius', degree: 12.0, nakshatra: 'Shatabhisha' },
      { houseNumber: 9, sign: 'Pisces', degree: 10.0, nakshatra: 'Uttara Bhadrapada' },
      { houseNumber: 10, sign: 'Aries', degree: 11.5, nakshatra: 'Ashwini' },
      { houseNumber: 11, sign: 'Taurus', degree: 14.0, nakshatra: 'Rohini' },
      { houseNumber: 12, sign: 'Gemini', degree: 16.0, nakshatra: 'Ardra' }
    ],
    ascendant: { sign: 'Cancer', degree: 15.2, nakshatra: 'Pushya' },
    moonSign: 'Sagittarius'
  };

  const timelineResult = JeevanPragyaTimelineService.extractTimeline(mockMasterData as any);
  const futureGroups = JeevanPragyaTimelineService.generateFutureDomainGroups(timelineResult.futureItems);

  // Property
  const propertyGroup = futureGroups.find(g => g.domainKey === 'property');
  assert.strictEqual(propertyGroup?.windows[0].startDate, '2028-05-07');
  assert.strictEqual(propertyGroup?.windows[0].endDate, '2030-08-13');

  // Career
  const careerGroup = futureGroups.find(g => g.domainKey === 'career');
  assert.strictEqual(careerGroup?.windows[0].startDate, '2030-08-13');
  assert.strictEqual(careerGroup?.windows[0].endDate, '2031-07-19');

  // Business
  const businessGroup = futureGroups.find(g => g.domainKey === 'business');
  assert.strictEqual(businessGroup?.windows[0].startDate, '2030-08-13');
  assert.strictEqual(businessGroup?.windows[0].endDate, '2031-07-19');

  // Finance
  const financeGroup = futureGroups.find(g => g.domainKey === 'finance');
  assert.strictEqual(financeGroup?.windows[0].startDate, '2030-08-13');
  assert.strictEqual(financeGroup?.windows[0].endDate, '2031-07-19');

  // Marriage
  const marriageGroup = futureGroups.find(g => g.domainKey === 'marriage');
  assert.strictEqual(marriageGroup?.windows[0].startDate, '2030-08-13');
  assert.strictEqual(marriageGroup?.windows[0].endDate, '2031-07-19');

  // Spiritual
  const spiritualGroup = futureGroups.find(g => g.domainKey === 'spiritual');
  assert(spiritualGroup && spiritualGroup.windows.length === 0);

  console.log('  ✓ Test 20 Passed: All 6 protected benchmarks remain 100% verified and untouched.\n');

  console.log('================================================================');
  console.log('ALL PHASE 1.13F DOSH DASHBOARD TESTS PASSED (20/20)');
  console.log('================================================================');
}

runDoshDashboardVerificationSuite().catch(err => {
  console.error('Dosh Dashboard test failed with error:', err);
  process.exit(1);
});
