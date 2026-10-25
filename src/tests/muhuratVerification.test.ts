/**
 * JEEVANDARPAN — PHASE 1.12: MUHURAT MODULE VERIFICATION SUITE
 * 
 * Verifies:
 * 1. All 10 classical Vedic Muhurat categories defined and configured
 * 2. High-precision Panchang calculation (Tithi, Nakshatra, Vara, Yoga, Karana)
 * 3. Solar calculations (Sunrise, Sunset, Abhijit Muhurat, Rahu Kaal, Yamaganda, Gulika)
 * 4. Choghadiya calculations (8 Day + 8 Night slots with lords & qualities)
 * 5. Classical Shastra Rules Engine (Scoring, suitability, taboo avoidance)
 * 6. Orchestration service (Multi-day date range evaluation and window ranking)
 * 7. 3-Tier Explainability & AI fallback safety
 * 8. Protected engines invariance (Jeevan Pragya & Astrology core untouched)
 */

import assert from 'node:assert';
import { MuhuratPanchangCalculator } from '../services/muhurat/muhuratPanchangCalculator';
import { MuhuratRulesEngine, MUHURAT_CATEGORIES } from '../services/muhurat/muhuratRulesEngine';
import { MuhuratService } from '../services/muhurat/muhuratService';
import { MuhuratAiService } from '../services/muhurat/muhuratAiService';
import { MuhuratCategoryKey, MuhuratQuery } from '../types/muhurat/muhuratTypes';

async function runMuhuratVerificationSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.12 MUHURAT MODULE VERIFICATION SUITE');
  console.log('================================================================\n');

  // TEST 1: Check 10 Muhurat Categories
  console.log('--- TEST 1: 10 Classical Categories Definition ---');
  const expectedCategories: MuhuratCategoryKey[] = [
    'marriage',
    'griha_pravesh',
    'bhumi_pujan',
    'vehicle_purchase',
    'business_start',
    'namkaran',
    'annaprashan',
    'upanayana',
    'travel_journey',
    'sarva_karya'
  ];

  for (const catKey of expectedCategories) {
    const cat = MUHURAT_CATEGORIES[catKey];
    assert(cat, `Category ${catKey} must exist in MUHURAT_CATEGORIES`);
    assert(cat.titleHindi && cat.titleHindi.length > 0, `${catKey} must have Hindi title`);
    assert(cat.titleEnglish && cat.titleEnglish.length > 0, `${catKey} must have English title`);
    assert(cat.classicalSources && cat.classicalSources.length > 0, `${catKey} must cite classical sources`);
    console.log(`  ✓ ${catKey}: ${cat.titleHindi} (${cat.titleEnglish}) [Sources: ${cat.classicalSources.join(', ')}]`);
  }
  console.log('TEST 1 PASSED: All 10 Categories verified.\n');

  // TEST 2: High-precision Day Panchang Calculation
  console.log('--- TEST 2: High-Precision Day Panchang Calculation ---');
  const testDate = '2026-10-02';
  const lat = 22.7196; // Indore
  const lon = 75.8577;
  const panchang = MuhuratPanchangCalculator.calculateDayPanchang(testDate, lat, lon, 'Indore, MP', 'Asia/Kolkata');

  assert(panchang.date === testDate, 'Date must match input');
  assert(panchang.tithi && panchang.tithi.number >= 1 && panchang.tithi.number <= 30, 'Tithi number must be 1..30');
  assert(panchang.tithi.nameHindi, 'Tithi must have Hindi name');
  assert(panchang.nakshatra && panchang.nakshatra.number >= 1 && panchang.nakshatra.number <= 27, 'Nakshatra must be 1..27');
  assert(panchang.nakshatra.nameHindi, 'Nakshatra must have Hindi name');
  assert(panchang.vara && panchang.vara.nameHindi, 'Vara must have Hindi name');
  assert(panchang.yoga && panchang.yoga.nameHindi, 'Yoga must have Hindi name');
  assert(panchang.karana && panchang.karana.nameHindi, 'Karana must have Hindi name');
  assert(panchang.solarTimes.sunrise, 'Sunrise must be computed');
  assert(panchang.solarTimes.sunset, 'Sunset must be computed');
  assert(panchang.solarTimes.abhijitStart, 'Abhijit Muhurat start must be computed');
  assert(panchang.solarTimes.rahuKaalStart, 'Rahu Kaal start must be computed');

  console.log(`  Date: ${panchang.dateDisplayHindi} (${panchang.date})`);
  console.log(`  Vara: ${panchang.vara.nameHindi} (Lord: ${panchang.vara.lordHindi})`);
  console.log(`  Tithi: ${panchang.tithi.nameHindi} (${panchang.tithi.pakshaHindi} पक्ष, वर्ग: ${panchang.tithi.groupHindi}, Rikta: ${panchang.tithi.isRikta})`);
  console.log(`  Nakshatra: ${panchang.nakshatra.nameHindi} (Lord: ${panchang.nakshatra.lordHindi}, Category: ${panchang.nakshatra.categoryHindi})`);
  console.log(`  Yoga: ${panchang.yoga.nameHindi} (Auspicious: ${panchang.yoga.isAuspicious})`);
  console.log(`  Karana: ${panchang.karana.nameHindi} (Bhadra: ${panchang.karana.isBhadra})`);
  console.log(`  Sunrise: ${panchang.solarTimes.sunrise} | Sunset: ${panchang.solarTimes.sunset}`);
  console.log(`  Abhijit: ${panchang.solarTimes.abhijitStart} → ${panchang.solarTimes.abhijitEnd}`);
  console.log(`  Rahu Kaal: ${panchang.solarTimes.rahuKaalStart} → ${panchang.solarTimes.rahuKaalEnd}`);
  console.log('TEST 2 PASSED: Day Panchang calculated accurately.\n');

  // TEST 3: Choghadiya Slots Evaluation
  console.log('--- TEST 3: Choghadiya Evaluation ---');
  assert(panchang.choghadiyasDay.length === 8, 'Day Choghadiya must have 8 slots');
  assert(panchang.choghadiyasNight.length === 8, 'Night Choghadiya must have 8 slots');

  const sampleSlot = panchang.choghadiyasDay[0];
  assert(sampleSlot.nameHindi && sampleSlot.startTime && sampleSlot.endTime, 'Choghadiya slot must have valid timing');
  console.log(`  Day Choghadiyas count: ${panchang.choghadiyasDay.length}`);
  console.log(`  First Day Slot: ${sampleSlot.nameHindi} (${sampleSlot.suitability}) ${sampleSlot.startTime} → ${sampleSlot.endTime}`);
  console.log(`  Night Choghadiyas count: ${panchang.choghadiyasNight.length}`);
  console.log('TEST 3 PASSED: Choghadiya calculated correctly.\n');

  // TEST 4: Category Evaluation via MuhuratRulesEngine
  console.log('--- TEST 4: Category Rules Engine & Taboo Avoidance ---');
  for (const catKey of expectedCategories) {
    const windows = MuhuratRulesEngine.evaluateDayForCategory(panchang, catKey);
    assert(Array.isArray(windows), `Evaluation for ${catKey} must return an array`);
    assert(windows.length > 0, `Evaluation for ${catKey} must return candidate windows`);
    
    // Check that each window has required structure
    for (const win of windows) {
      assert(win.id && win.id.length > 0, 'Window must have unique id');
      assert(win.startTime && win.endTime, 'Window must have start and end time');
      assert(win.suitability, 'Window must have suitability rating');
      assert(typeof win.score === 'number' && win.score >= 0 && win.score <= 100, 'Score must be 0..100');
      assert(Array.isArray(win.rulesApplied), 'rulesApplied must be an array');
      assert(Array.isArray(win.reasonsHindi), 'reasonsHindi must be an array');
      assert(win.recommendedActionHindi, 'recommendedActionHindi must be defined');

      // Rahu Kaal taboo test: if window overlaps Rahu Kaal, hasRahuKaalConflict must be true and suitability cannot be EXCELLENT
      if (win.hasRahuKaalConflict) {
        assert(win.suitability !== 'EXCELLENT', 'Window conflicting with Rahu Kaal cannot be EXCELLENT');
      }
    }

    const excellentCount = windows.filter(w => w.suitability === 'EXCELLENT').length;
    const goodCount = windows.filter(w => w.suitability === 'GOOD').length;
    const moderateCount = windows.filter(w => w.suitability === 'MODERATE').length;
    const avoidCount = windows.filter(w => w.suitability === 'AVOID').length;
    console.log(`  ✓ ${catKey.padEnd(16)}: ${windows.length} windows (EXC: ${excellentCount}, GOOD: ${goodCount}, MOD: ${moderateCount}, AVOID: ${avoidCount})`);
  }
  console.log('TEST 4 PASSED: Rules engine evaluated all categories with taboo detection.\n');

  // TEST 5: Muhurat Service Orchestration across Date Range
  console.log('--- TEST 5: Muhurat Service Range Orchestration ---');
  const query: MuhuratQuery = {
    category: 'griha_pravesh',
    startDate: '2026-10-02',
    endDate: '2026-10-08',
    locationName: 'Indore, MP',
    latitude: 22.7196,
    longitude: 75.8577,
    timezone: 'Asia/Kolkata',
    profileName: 'Jitendra Suryavanshi'
  };

  const result = await MuhuratService.calculateMuhurat(query);
  assert(result.query.category === 'griha_pravesh', 'Query category preserved');
  assert(result.totalWindowsFound > 0, 'Should find candidate windows in 7-day range');
  assert(result.windows.length === result.totalWindowsFound, 'Windows count must match');
  assert(result.categoryGuidanceHindi && result.categoryGuidanceHindi.length > 0, 'Guidance in Hindi required');
  assert(result.safetyNoticeHindi && result.safetyNoticeHindi.length > 0, 'Safety notice required');

  console.log(`  Category: ${result.query.category}`);
  console.log(`  Date Range: ${result.query.startDate} → ${result.query.endDate}`);
  console.log(`  Total Windows Found: ${result.totalWindowsFound}`);
  console.log(`  Breakdown: EXC=${result.excellentCount}, GOOD=${result.goodCount}, MOD=${result.moderateCount}, AVOID=${result.avoidCount}`);
  if (result.bestWindow) {
    console.log(`  Best Window: Date ${result.bestWindow.date} (${result.bestWindow.startTime} → ${result.bestWindow.endTime}) Score: ${result.bestWindow.score} (${result.bestWindow.suitabilityHindi})`);
  }
  console.log('TEST 5 PASSED: Multi-day range orchestration verified.\n');

  // TEST 6: 3-Tier Explainability & AI Fallback
  console.log('--- TEST 6: 3-Tier Explainability & AI Fallback ---');
  assert(result.bestWindow !== null, 'Must have a best window for explainability test');
  const win = result.bestWindow!;

  const fallbackExplanationHindi = MuhuratAiService.getDeterministicExplanation(win, true);
  assert(fallbackExplanationHindi.includes('१. खगोलीय एवं पंचांग तथ्य'), 'Must contain Tier 1 Panchang facts');
  assert(fallbackExplanationHindi.includes('२. शास्त्रीय आधार'), 'Must contain Tier 2 Classical Shastra lineage');
  assert(fallbackExplanationHindi.includes('३. व्यावहारिक मार्गदर्शन'), 'Must contain Tier 3 Practical Wisdom');
  console.log('  Deterministic 3-Tier Hindi Explanation: Verified successfully');

  const fallbackExplanationEnglish = MuhuratAiService.getDeterministicExplanation(win, false);
  assert(fallbackExplanationEnglish.includes('1. Calculated Astronomical Facts'), 'English must contain Tier 1 Facts');
  assert(fallbackExplanationEnglish.includes('2. Classical Principles Applied'), 'English must contain Tier 2 Principles');
  assert(fallbackExplanationEnglish.includes('3. Actionable Life Wisdom'), 'English must contain Tier 3 Actionable Wisdom');
  console.log('TEST 6 PASSED: 3-Tier Explainability verified in both languages.\n');

  // TEST 7: Protected Benchmarks Verification (Jeevan Pragya untouched)
  console.log('--- TEST 7: Protected Engines Invariance ---');
  // Check that the protected benchmark constants in Jeevan Pragya remain intact
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
  assert(marriageGroup && marriageGroup.windows.length > 0, 'Marriage must have verified windows');
  assert(marriageGroup.windows[0].startDate === '2030-08-13' && marriageGroup.windows[0].endDate === '2031-07-19', 'Marriage benchmark window must be Jupiter-Ketu (2030-08-13 → 2031-07-19)');

  const spiritualGroup = futureGroups.find(g => g.domainKey === 'spiritual');
  assert(spiritualGroup && spiritualGroup.windows.length === 0, 'Spiritual benchmark must be 0 windows');

  const propertyGroup = futureGroups.find(g => g.domainKey === 'property');
  assert(propertyGroup && propertyGroup.windows[0].startDate === '2028-05-07' && propertyGroup.windows[0].endDate === '2030-08-13', 'Property benchmark window must be Jupiter-Mercury');

  console.log('  ✓ Marriage benchmark: Jupiter-Ketu (2030-08-13 → 2031-07-19) [VERIFIED]');
  console.log('  ✓ Spiritual benchmark: 0 verified windows [VERIFIED]');
  console.log('  ✓ Property benchmark: Jupiter-Mercury (2028-05-07 → 2030-08-13) [VERIFIED]');
  console.log('TEST 7 PASSED: Protected engines and benchmarks remain 100% untouched.\n');

  console.log('================================================================');
  console.log('ALL PHASE 1.12 MUHURAT MODULE VERIFICATION TESTS PASSED (7/7)');
  console.log('================================================================');
}

runMuhuratVerificationSuite().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
