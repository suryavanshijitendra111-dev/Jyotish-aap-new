/**
 * JEEVANDARPAN — PHASE 1.13C-1: MANGAL DOSHA ENGINE TEST SUITE
 * 
 * Verifies:
 * TEST 1: Mars in 1st from Lagna -> primary PRESENT
 * TEST 2: Mars in 4th from Lagna -> primary PRESENT
 * TEST 3: Mars in 7th from Lagna -> primary PRESENT
 * TEST 4: Mars in 8th from Lagna -> primary PRESENT
 * TEST 5: Mars in 12th from Lagna -> primary PRESENT
 * TEST 6: Mars in non-Mangal houses (2, 3, 5, 6, 9, 10, 11) -> primary NOT_PRESENT
 * TEST 7: Moon secondary indicator independent of Lagna result
 * TEST 8: Venus secondary indicator independent of Lagna result
 * TEST 9: Primary indication + valid Bhanga -> indication remains PRESENT, mitigated = true
 * TEST 10: Missing required data -> INSUFFICIENT_DATA, no crash
 * TEST 11: No severity score generated (no mild/moderate/full numerical tier)
 * TEST 12: Immutability: input MasterKundliData values are not mutated
 * TEST 13: Protected benchmarks in Jeevan Pragya remain 100% untouched
 */

import assert from 'node:assert';
import { MangalDoshaEngine } from '../services/dosh/mangalDoshaEngine';
import { MasterKundliData, PlanetData } from '../types/kundli';

function createMockKundliData(overrides: {
  marsHouse?: number;
  marsRashi?: number;
  lagnaRashi?: number;
  moonHouse?: number;
  moonRashi?: number;
  venusHouse?: number;
  venusRashi?: number;
  jupiterHouse?: number;
  jupiterRashi?: number;
}): MasterKundliData {
  const lagnaRashi = overrides.lagnaRashi ?? 1; // Aries
  const marsHouse = overrides.marsHouse ?? 1;
  const marsRashi = overrides.marsRashi ?? 1;
  const moonHouse = overrides.moonHouse ?? 2;
  const moonRashi = overrides.moonRashi ?? 2;
  const venusHouse = overrides.venusHouse ?? 3;
  const venusRashi = overrides.venusRashi ?? 3;
  const jupiterHouse = overrides.jupiterHouse ?? 10;
  const jupiterRashi = overrides.jupiterRashi ?? 10;

  const makePlanet = (name: string, house: number, rashi: number): PlanetData => ({
    name,
    tropicalLongitude: 0,
    siderealLongitude: (rashi - 1) * 30 + 15,
    degree: 15,
    rashi,
    rashiName: `Rashi-${rashi}`,
    nakshatra: 1,
    pada: 1,
    latitude: 0,
    motionStatus: 'Direct',
    isRetrograde: false,
    isCombust: false,
    dignity: 'None',
    d1House: house,
    calculationSource: 'SwissEphemerisMock'
  });

  return {
    birthProfile: {
      name: 'Test Native',
      dob: '1986-06-24',
      time: '06:20',
      place: 'Indore, MP',
      latitude: 22.7196,
      longitude: 75.8577,
      timezone: 'Asia/Kolkata'
    },
    metadata: {
      engine: 'SwissEph',
      ephemerisVersion: '2.10',
      ayanamsa: 'Lahiri',
      ayanamsaValue: 23.65,
      nodeType: 'Mean',
      houseSystem: 'WholeSign',
      timestamp: '2026-10-02T00:00:00Z',
      inputTimezone: 'Asia/Kolkata'
    },
    ayanamsa: 'Lahiri',
    lagna: makePlanet('Lagna', 1, lagnaRashi),
    planets: {
      Mars: makePlanet('Mars', marsHouse, marsRashi),
      Moon: makePlanet('Moon', moonHouse, moonRashi),
      Venus: makePlanet('Venus', venusHouse, venusRashi),
      Jupiter: makePlanet('Jupiter', jupiterHouse, jupiterRashi)
    },
    d1Chart: {},
    bhavaChart: {},
    vimshottariDasha: null,
    warnings: []
  };
}

async function runMangalDoshaSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.13C-1: MANGAL DOSHA ENGINE TEST SUITE');
  console.log('================================================================\n');

  // TEST 1: Mars in 1st from Lagna -> primary PRESENT
  console.log('--- TEST 1: Mars in 1st from Lagna ---');
  const d1 = createMockKundliData({ marsHouse: 1, marsRashi: 2 }); // Taurus (avoid aries bhanga to test pure detection)
  const res1 = MangalDoshaEngine.analyze(d1);
  assert.strictEqual(res1.status, 'PRESENT', 'Status must be PRESENT for Mars in 1st');
  assert.strictEqual(res1.primaryIndication, 'PRESENT', 'Primary indication must be PRESENT');
  assert.strictEqual(res1.primaryHouseFromLagna, 1, 'Primary house must be 1');
  console.log('  ✓ Test 1 Passed: Mars in 1st house correctly identified as PRESENT');

  // TEST 2: Mars in 4th from Lagna -> primary PRESENT
  console.log('--- TEST 2: Mars in 4th from Lagna ---');
  const d2 = createMockKundliData({ marsHouse: 4, marsRashi: 2 });
  const res2 = MangalDoshaEngine.analyze(d2);
  assert.strictEqual(res2.status, 'PRESENT', 'Status must be PRESENT for Mars in 4th');
  assert.strictEqual(res2.primaryIndication, 'PRESENT');
  assert.strictEqual(res2.primaryHouseFromLagna, 4);
  console.log('  ✓ Test 2 Passed: Mars in 4th house correctly identified as PRESENT');

  // TEST 3: Mars in 7th from Lagna -> primary PRESENT
  console.log('--- TEST 3: Mars in 7th from Lagna ---');
  const d3 = createMockKundliData({ marsHouse: 7, marsRashi: 2 });
  const res3 = MangalDoshaEngine.analyze(d3);
  assert.strictEqual(res3.status, 'PRESENT', 'Status must be PRESENT for Mars in 7th');
  assert.strictEqual(res3.primaryIndication, 'PRESENT');
  assert.strictEqual(res3.primaryHouseFromLagna, 7);
  console.log('  ✓ Test 3 Passed: Mars in 7th house correctly identified as PRESENT');

  // TEST 4: Mars in 8th from Lagna -> primary PRESENT
  console.log('--- TEST 4: Mars in 8th from Lagna ---');
  const d4 = createMockKundliData({ marsHouse: 8, marsRashi: 2 });
  const res4 = MangalDoshaEngine.analyze(d4);
  assert.strictEqual(res4.status, 'PRESENT', 'Status must be PRESENT for Mars in 8th');
  assert.strictEqual(res4.primaryIndication, 'PRESENT');
  assert.strictEqual(res4.primaryHouseFromLagna, 8);
  console.log('  ✓ Test 4 Passed: Mars in 8th house correctly identified as PRESENT');

  // TEST 5: Mars in 12th from Lagna -> primary PRESENT
  console.log('--- TEST 5: Mars in 12th from Lagna ---');
  const d5 = createMockKundliData({ marsHouse: 12, marsRashi: 2 });
  const res5 = MangalDoshaEngine.analyze(d5);
  assert.strictEqual(res5.status, 'PRESENT', 'Status must be PRESENT for Mars in 12th');
  assert.strictEqual(res5.primaryIndication, 'PRESENT');
  assert.strictEqual(res5.primaryHouseFromLagna, 12);
  console.log('  ✓ Test 5 Passed: Mars in 12th house correctly identified as PRESENT');

  // TEST 6: Mars in non-Mangal houses -> primary NOT_PRESENT
  console.log('--- TEST 6: Mars in non-Mangal houses (2, 3, 5, 6, 9, 10, 11) ---');
  const nonMangalHouses = [2, 3, 5, 6, 9, 10, 11];
  for (const h of nonMangalHouses) {
    const d = createMockKundliData({ marsHouse: h });
    const res = MangalDoshaEngine.analyze(d);
    assert.strictEqual(res.status, 'NOT_PRESENT', `House ${h} must be NOT_PRESENT`);
    assert.strictEqual(res.primaryIndication, 'NOT_PRESENT', `House ${h} primary indication must be NOT_PRESENT`);
    assert.strictEqual(res.primaryHouseFromLagna, h);
  }
  console.log('  ✓ Test 6 Passed: All non-Mangal houses correctly evaluated as NOT_PRESENT');

  // TEST 7: Moon secondary indicator independent of Lagna result
  console.log('--- TEST 7: Moon Secondary Indicator Independence ---');
  // Mars in house 3 from Lagna (NOT_PRESENT for Lagna), but Moon in house 12 from Lagna.
  // Relative house of Mars from Moon: ((3 - 12 + 12) % 12) + 1 = 4 (4th from Moon -> PRESENT for Moon!)
  const d7 = createMockKundliData({ marsHouse: 3, moonHouse: 12 });
  const res7 = MangalDoshaEngine.analyze(d7);
  assert.strictEqual(res7.primaryIndication, 'NOT_PRESENT', 'Primary Lagna must remain NOT_PRESENT');
  assert.strictEqual(res7.moonIndicator.status, 'PRESENT', 'Secondary Moon indicator must be PRESENT');
  assert.strictEqual(res7.moonIndicator.houseFromReference, 4, 'Mars must be 4th from Moon');
  assert.strictEqual(res7.moonIndicator.isMangalHouse, true);
  console.log('  ✓ Test 7 Passed: Moon secondary indicator operates independently of Lagna');

  // TEST 8: Venus secondary indicator independent of Lagna result
  console.log('--- TEST 8: Venus Secondary Indicator Independence ---');
  // Mars in house 5 from Lagna (NOT_PRESENT for Lagna), Venus in house 11 from Lagna.
  // Relative house of Mars from Venus: ((5 - 11 + 12) % 12) + 1 = 7 (7th from Venus -> PRESENT for Venus!)
  const d8 = createMockKundliData({ marsHouse: 5, venusHouse: 11 });
  const res8 = MangalDoshaEngine.analyze(d8);
  assert.strictEqual(res8.primaryIndication, 'NOT_PRESENT', 'Primary Lagna must remain NOT_PRESENT');
  assert.strictEqual(res8.venusIndicator.status, 'PRESENT', 'Secondary Venus indicator must be PRESENT');
  assert.strictEqual(res8.venusIndicator.houseFromReference, 7, 'Mars must be 7th from Venus');
  console.log('  ✓ Test 8 Passed: Venus secondary indicator operates independently of Lagna');

  // TEST 9: Primary indication + valid Bhanga -> indication remains PRESENT, mitigated = true
  console.log('--- TEST 9: Primary Indication + Classical Bhanga ---');
  // Mars in 1st house in Aries (Mars in own fire sign) -> Primary PRESENT, Bhanga Triggered, mitigated = true
  const d9 = createMockKundliData({ marsHouse: 1, marsRashi: 1 });
  const res9 = MangalDoshaEngine.analyze(d9);
  assert.strictEqual(res9.primaryIndication, 'PRESENT', 'Primary indication must NOT be erased');
  assert.strictEqual(res9.mitigated, true, 'Mitigated must be true due to Aries 1st Bhanga');
  const ariesRule = res9.cancellationChecks.find(c => c.ruleId === 'BHANGA_MARS_ARIES_1');
  assert(ariesRule && ariesRule.triggered, 'Aries in 1st rule must be triggered');

  // Also test Jupiter aspect cancellation: Mars in 7th house (Capricorn, but let's test Cancer rashi=4), Jupiter in 11th house.
  // Jupiter in 11th casts 9th aspect on 7th house: ((7 - 11 + 12) % 12) + 1 = 9th aspect!
  const d9b = createMockKundliData({ marsHouse: 7, marsRashi: 4, jupiterHouse: 11 });
  const res9b = MangalDoshaEngine.analyze(d9b);
  assert.strictEqual(res9b.primaryIndication, 'PRESENT');
  assert.strictEqual(res9b.mitigated, true, 'Mitigated must be true due to Jupiter 9th aspect');
  const jupRule = res9b.cancellationChecks.find(c => c.ruleId === 'BHANGA_JUPITER_ASPECT_CONJUNCTION');
  assert(jupRule && jupRule.triggered, 'Jupiter aspect cancellation must trigger');
  console.log('  ✓ Test 9 Passed: Bhanga sets mitigated = true while preserving primary calculation');

  // TEST 10: Missing required data -> INSUFFICIENT_DATA, no crash
  console.log('--- TEST 10: Missing / Incomplete Data Resilience ---');
  const resNull = MangalDoshaEngine.analyze(null);
  assert.strictEqual(resNull.status, 'INSUFFICIENT_DATA');
  assert.strictEqual(resNull.primaryIndication, 'UNKNOWN');

  const resEmpty = MangalDoshaEngine.analyze({} as any);
  assert.strictEqual(resEmpty.status, 'INSUFFICIENT_DATA');

  const dNoMars = createMockKundliData({ marsHouse: 1 });
  delete (dNoMars.planets as any).Mars;
  delete (dNoMars.planets as any).mars;
  const resNoMars = MangalDoshaEngine.analyze(dNoMars);
  assert.strictEqual(resNoMars.status, 'INSUFFICIENT_DATA');
  assert.strictEqual(resNoMars.primaryIndication, 'UNKNOWN');
  console.log('  ✓ Test 10 Passed: Safe INSUFFICIENT_DATA returned without throwing errors');

  // TEST 11: No severity score generated
  console.log('--- TEST 11: Verification of Zero Severity Scoring ---');
  const d11 = createMockKundliData({ marsHouse: 1, moonHouse: 10, venusHouse: 7 }); // Mars in 1st from Lagna, 4th from Moon, 7th from Venus
  const res11 = MangalDoshaEngine.analyze(d11);
  assert.strictEqual((res11 as any).severityScore, undefined, 'No severityScore property allowed');
  assert.strictEqual((res11 as any).severityLevel, undefined, 'No severityLevel property allowed');
  assert.strictEqual((res11 as any).score, undefined, 'No score property allowed');
  console.log('  ✓ Test 11 Passed: Zero numerical or mild/moderate/full severity score generated');

  // TEST 12: Immutability: input MasterKundliData values are not mutated
  console.log('--- TEST 12: Pure Immutability Check ---');
  const originalData = createMockKundliData({ marsHouse: 7, marsRashi: 10 });
  const frozenSnapshot = JSON.stringify(originalData);
  MangalDoshaEngine.analyze(originalData);
  const afterSnapshot = JSON.stringify(originalData);
  assert.strictEqual(frozenSnapshot, afterSnapshot, 'Input MasterKundliData must be strictly immutable');
  console.log('  ✓ Test 12 Passed: Input data remains 100% untouched and unmutated');

  // TEST 13: Protected benchmarks in Jeevan Pragya remain 100% untouched
  console.log('--- TEST 13: Protected Jeevan Pragya Benchmarks Invariance ---');
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

  const marriageGroup = futureGroups.find(g => g.domainKey === 'marriage');
  assert(marriageGroup && marriageGroup.windows.length > 0);
  assert.strictEqual(marriageGroup.windows[0].startDate, '2030-08-13');
  assert.strictEqual(marriageGroup.windows[0].endDate, '2031-07-19');

  const spiritualGroup = futureGroups.find(g => g.domainKey === 'spiritual');
  assert(spiritualGroup && spiritualGroup.windows.length === 0, 'Spiritual must be 0 windows');

  const propertyGroup = futureGroups.find(g => g.domainKey === 'property');
  assert.strictEqual(propertyGroup?.windows[0].startDate, '2028-05-07');
  assert.strictEqual(propertyGroup?.windows[0].endDate, '2030-08-13');

  console.log('  ✓ Marriage benchmark: Jupiter-Ketu (2030-08-13 → 2031-07-19) [VERIFIED]');
  console.log('  ✓ Spiritual benchmark: 0 verified windows (Honest Empty State) [VERIFIED]');
  console.log('  ✓ Property benchmark: Jupiter-Mercury (2028-05-07 → 2030-08-13) [VERIFIED]');
  console.log('  ✓ Test 13 Passed: All protected benchmarks remain 100% intact.\n');

  console.log('================================================================');
  console.log('ALL PHASE 1.13C-1 MANGAL DOSHA TESTS PASSED (13/13)');
  console.log('================================================================');
}

runMangalDoshaSuite().catch(err => {
  console.error('Mangal Dosha test failed with error:', err);
  process.exit(1);
});
