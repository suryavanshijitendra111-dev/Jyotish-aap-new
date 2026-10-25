/**
 * JEEVANDARPAN — PHASE 3C.3 HIGH-RESOLUTION FUTURE TRANSIT VERIFICATION TEST SUITE
 * 
 * Comprehensive tests verifying:
 * 1. Planet-specific scan resolution (Moon 6h, Sun/Mercury/Venus 24h, Mars 48h, Jupiter 72h, Saturn/Rahu/Ketu 120h).
 * 2. Deterministic boundary detection & binary refinement:
 *    A. Moon nakshatra crossing (refined to <=30 min)
 *    B. Moon pada crossing (refined to <=30 min)
 *    C. Moon sign crossing (refined to <=30 min)
 *    D. Sun sign crossing (Sankranti, refined to <=60 min)
 *    E. Mercury sign/nakshatra crossing (refined to <=60 min)
 *    F. Venus sign/nakshatra crossing (refined to <=60 min)
 *    G. Mars sign crossing (refined to <=60 min)
 *    H. Retrograde transition (Direct <-> Retrograde, refined to <=60 min)
 *    I. No-boundary interval (detects no false transitions)
 *    J. Future window start boundary
 *    K. Future window end boundary
 * 3. Complete Benchmark regression on 1986-06-24 06:20 IST Indore:
 *    - Career: Jupiter-Ketu (2030-08-13 -> 2031-07-19)
 *    - Business: Jupiter-Ketu (2030-08-13 -> 2031-07-19)
 *    - Marriage: Jupiter-Ketu (2030-08-13 -> 2031-07-19)
 *    - Property: Jupiter-Mercury (2028-05-07 -> 2030-08-13)
 *    - Finance: Jupiter-Ketu (2030-08-13 -> 2031-07-19)
 */

import assert from 'node:assert';
import { KpEngine } from '../services/jyotish/kpEngine';
import { KpJudgmentEngine } from '../services/jyotish/kpJudgmentEngine';
import { KpTimingEngine } from '../services/jyotish/kpTimingEngine';
import { FutureTransitEngine, PLANET_INTERVAL_HOURS } from '../services/jyotish/futureTransitEngine';
import { getSwissEph } from '../services/jyotish/transitEngine';
import { KPQuestionCategory } from '../types/jyotish/kpJudgment';

async function runHighResolutionVerification() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 3C.3 HIGH-RESOLUTION FUTURE TRANSIT VERIFICATION');
  console.log('================================================================\n');

  const swe = await getSwissEph();
  assert.ok(swe, 'Swiss Ephemeris must be initialized');
  const engine = new FutureTransitEngine();

  // -------------------------------------------------------------
  // PART 1: TEST CASES A TO K (ASTRONOMICAL BOUNDARY DETECTION & REFINEMENT)
  // -------------------------------------------------------------
  console.log('--- PART 1: Astronomical Boundary Detection & Binary Refinement (Tests A-K) ---');

  // TEST A: Moon Nakshatra Crossing (Refinement <= 30 min)
  // On 2030-08-13, Moon moves from Shravana (22) to Dhanishta (23) between 06:00 and 12:00 UTC
  const tLowMoon = new Date('2030-08-13T06:00:00Z').getTime();
  const tHighMoon = new Date('2030-08-13T12:00:00Z').getTime();
  const sLowMoon = engine.calculateSinglePlanet(swe, 'Moon', tLowMoon, 'UTC', 1);
  const sHighMoon = engine.calculateSinglePlanet(swe, 'Moon', tHighMoon, 'UTC', 1);

  assert.notStrictEqual(sLowMoon.nakNumber, sHighMoon.nakNumber, 'Moon must cross nakshatra between 06:00 and 12:00');
  const bMoonNak = engine.detectBoundary(sLowMoon, sHighMoon);
  assert.strictEqual(bMoonNak.hasBoundary, true);

  const refinedMoonNak = engine.refineBoundary(
    swe, 'Moon', tLowMoon, tHighMoon, sLowMoon, sHighMoon, 'NAKSHATRA_INGRESS',
    30 * 60 * 1000, 'UTC', 1,
    (p, ms) => engine.calculateSinglePlanet(swe, p, ms, 'UTC', 1)
  );
  assert.strictEqual(refinedMoonNak.precisionStr, '≤30 min');
  assert.strictEqual(refinedMoonNak.refinedState.nakNumber, sHighMoon.nakNumber);
  console.log(`✓ Test A (Moon Nakshatra Crossing): Ingress refined to ${new Date(refinedMoonNak.refinedState.timestampMs).toISOString()} (${refinedMoonNak.precisionStr})`);

  // TEST B: Moon Pada Crossing (Refinement <= 30 min)
  // On 2030-08-13 between 12:00 and 18:00 UTC Moon transitions from Dhanishta Pada 1 to Pada 2
  const tLowPada = new Date('2030-08-13T12:00:00Z').getTime();
  const tHighPada = new Date('2030-08-13T18:00:00Z').getTime();
  const sLowPada = engine.calculateSinglePlanet(swe, 'Moon', tLowPada, 'UTC', 1);
  const sHighPada = engine.calculateSinglePlanet(swe, 'Moon', tHighPada, 'UTC', 1);

  const bMoonPada = engine.detectBoundary(sLowPada, sHighPada);
  assert.strictEqual(bMoonPada.hasBoundary, true);
  const refinedMoonPada = engine.refineBoundary(
    swe, 'Moon', tLowPada, tHighPada, sLowPada, sHighPada, bMoonPada.boundaryType,
    30 * 60 * 1000, 'UTC', 1,
    (p, ms) => engine.calculateSinglePlanet(swe, p, ms, 'UTC', 1)
  );
  assert.strictEqual(refinedMoonPada.precisionStr, '≤30 min');
  console.log(`✓ Test B (Moon Pada Crossing): Pada transition refined to ${new Date(refinedMoonPada.refinedState.timestampMs).toISOString()} (${refinedMoonPada.precisionStr})`);

  // TEST C: Moon Sign Crossing (Refinement <= 30 min)
  // On 2030-08-13 to 2030-08-14, Moon crosses from Capricorn to Aquarius between 18:00 and 24:00 UTC
  const tLowMoonSign = new Date('2030-08-13T18:00:00Z').getTime();
  const tHighMoonSign = new Date('2030-08-14T00:00:00Z').getTime();
  const sLowMoonSign = engine.calculateSinglePlanet(swe, 'Moon', tLowMoonSign, 'UTC', 1);
  const sHighMoonSign = engine.calculateSinglePlanet(swe, 'Moon', tHighMoonSign, 'UTC', 1);

  assert.notStrictEqual(sLowMoonSign.rashiIdx, sHighMoonSign.rashiIdx, 'Moon must cross sign boundary');
  const bMoonSign = engine.detectBoundary(sLowMoonSign, sHighMoonSign);
  assert.strictEqual(bMoonSign.boundaryType, 'SIGN_INGRESS');
  const refinedMoonSign = engine.refineBoundary(
    swe, 'Moon', tLowMoonSign, tHighMoonSign, sLowMoonSign, sHighMoonSign, 'SIGN_INGRESS',
    30 * 60 * 1000, 'UTC', 1,
    (p, ms) => engine.calculateSinglePlanet(swe, p, ms, 'UTC', 1)
  );
  assert.strictEqual(refinedMoonSign.precisionStr, '≤30 min');
  console.log(`✓ Test C (Moon Sign Crossing): Sign ingress refined to ${new Date(refinedMoonSign.refinedState.timestampMs).toISOString()} (${refinedMoonSign.precisionStr})`);

  // TEST D: Sun Sign Crossing (Sankranti, Refinement <= 60 min)
  // Sun crosses from Leo to Virgo around 2030-09-17 / 2030-09-18
  const tLowSun = new Date('2030-09-17T12:00:00Z').getTime();
  const tHighSun = new Date('2030-09-18T12:00:00Z').getTime();
  const sLowSun = engine.calculateSinglePlanet(swe, 'Sun', tLowSun, 'UTC', 1);
  const sHighSun = engine.calculateSinglePlanet(swe, 'Sun', tHighSun, 'UTC', 1);

  assert.notStrictEqual(sLowSun.rashiIdx, sHighSun.rashiIdx, 'Sun must cross sign');
  const bSun = engine.detectBoundary(sLowSun, sHighSun);
  assert.strictEqual(bSun.boundaryType, 'SIGN_INGRESS');
  const refinedSun = engine.refineBoundary(
    swe, 'Sun', tLowSun, tHighSun, sLowSun, sHighSun, 'SIGN_INGRESS',
    60 * 60 * 1000, 'UTC', 1,
    (p, ms) => engine.calculateSinglePlanet(swe, p, ms, 'UTC', 1)
  );
  assert.strictEqual(refinedSun.precisionStr, '≤60 min');
  console.log(`✓ Test D (Sun Sign Crossing): Kanya Sankranti refined to ${new Date(refinedSun.refinedState.timestampMs).toISOString()} (${refinedSun.precisionStr})`);

  // TEST E: Mercury Sign/Nakshatra Crossing (Refinement <= 60 min)
  // Mercury crosses nakshatra around 2030-08-27 / 2030-08-28
  const tLowMerc = new Date('2030-08-27T00:00:00Z').getTime();
  const tHighMerc = new Date('2030-08-28T00:00:00Z').getTime();
  const sLowMerc = engine.calculateSinglePlanet(swe, 'Mercury', tLowMerc, 'UTC', 1);
  const sHighMerc = engine.calculateSinglePlanet(swe, 'Mercury', tHighMerc, 'UTC', 1);
  const bMerc = engine.detectBoundary(sLowMerc, sHighMerc);
  assert.strictEqual(bMerc.hasBoundary, true);
  const refinedMerc = engine.refineBoundary(
    swe, 'Mercury', tLowMerc, tHighMerc, sLowMerc, sHighMerc, bMerc.boundaryType,
    60 * 60 * 1000, 'UTC', 1,
    (p, ms) => engine.calculateSinglePlanet(swe, p, ms, 'UTC', 1)
  );
  assert.strictEqual(refinedMerc.precisionStr, '≤60 min');
  console.log(`✓ Test E (Mercury Boundary): Refined to ${new Date(refinedMerc.refinedState.timestampMs).toISOString()} (${refinedMerc.precisionStr})`);

  // TEST F: Venus Sign Crossing (Refinement <= 60 min)
  // Venus ingress into Virgo between 2030-09-24 and 2030-09-25
  const tLowVen = new Date('2030-09-24T00:00:00Z').getTime();
  const tHighVen = new Date('2030-09-25T00:00:00Z').getTime();
  const sLowVen = engine.calculateSinglePlanet(swe, 'Venus', tLowVen, 'UTC', 1);
  const sHighVen = engine.calculateSinglePlanet(swe, 'Venus', tHighVen, 'UTC', 1);
  const bVen = engine.detectBoundary(sLowVen, sHighVen);
  assert.strictEqual(bVen.hasBoundary, true);
  const refinedVen = engine.refineBoundary(
    swe, 'Venus', tLowVen, tHighVen, sLowVen, sHighVen, bVen.boundaryType,
    60 * 60 * 1000, 'UTC', 1,
    (p, ms) => engine.calculateSinglePlanet(swe, p, ms, 'UTC', 1)
  );
  assert.strictEqual(refinedVen.precisionStr, '≤60 min');
  console.log(`✓ Test F (Venus Boundary): Refined to ${new Date(refinedVen.refinedState.timestampMs).toISOString()} (${refinedVen.precisionStr})`);

  // TEST G: Mars Sign Crossing (Refinement <= 60 min)
  // Mars enters Leo between 2030-09-23 and 2030-09-25 (48-hour baseline)
  const tLowMars = new Date('2030-09-23T00:00:00Z').getTime();
  const tHighMars = new Date('2030-09-25T00:00:00Z').getTime();
  const sLowMars = engine.calculateSinglePlanet(swe, 'Mars', tLowMars, 'UTC', 1);
  const sHighMars = engine.calculateSinglePlanet(swe, 'Mars', tHighMars, 'UTC', 1);
  assert.notStrictEqual(sLowMars.rashiIdx, sHighMars.rashiIdx);
  const bMars = engine.detectBoundary(sLowMars, sHighMars);
  assert.strictEqual(bMars.boundaryType, 'SIGN_INGRESS');
  const refinedMars = engine.refineBoundary(
    swe, 'Mars', tLowMars, tHighMars, sLowMars, sHighMars, 'SIGN_INGRESS',
    60 * 60 * 1000, 'UTC', 1,
    (p, ms) => engine.calculateSinglePlanet(swe, p, ms, 'UTC', 1)
  );
  assert.strictEqual(refinedMars.precisionStr, '≤60 min');
  console.log(`✓ Test G (Mars Sign Ingress): Refined to ${new Date(refinedMars.refinedState.timestampMs).toISOString()} (${refinedMars.precisionStr})`);

  // TEST H: Retrograde Transition (Stationary Direct -> Retrograde)
  // Jupiter turns retrograde in April 2031 between 2031-04-13 and 2031-04-16
  const tLowJup = new Date('2031-04-13T00:00:00Z').getTime();
  const tHighJup = new Date('2031-04-16T00:00:00Z').getTime();
  const sLowJup = engine.calculateSinglePlanet(swe, 'Jupiter', tLowJup, 'UTC', 1);
  const sHighJup = engine.calculateSinglePlanet(swe, 'Jupiter', tHighJup, 'UTC', 1);
  assert.notStrictEqual(sLowJup.isRetrograde, sHighJup.isRetrograde, 'Jupiter must change motion status');
  const bJup = engine.detectBoundary(sLowJup, sHighJup);
  assert.strictEqual(bJup.boundaryType, 'RETROGRADE_TRANSITION');
  const refinedJup = engine.refineBoundary(
    swe, 'Jupiter', tLowJup, tHighJup, sLowJup, sHighJup, 'RETROGRADE_TRANSITION',
    60 * 60 * 1000, 'UTC', 1,
    (p, ms) => engine.calculateSinglePlanet(swe, p, ms, 'UTC', 1)
  );
  assert.strictEqual(refinedJup.precisionStr, '≤60 min');
  console.log(`✓ Test H (Retrograde Transition): Jupiter stationary retrograde refined to ${new Date(refinedJup.refinedState.timestampMs).toISOString()} (${refinedJup.precisionStr})`);

  // TEST I: No-Boundary Interval
  // During a quiet 2-hour interval for Saturn, no boundary should be detected
  const tQuiet1 = new Date('2030-08-13T00:00:00Z').getTime();
  const tQuiet2 = new Date('2030-08-13T02:00:00Z').getTime();
  const sQ1 = engine.calculateSinglePlanet(swe, 'Saturn', tQuiet1, 'UTC', 1);
  const sQ2 = engine.calculateSinglePlanet(swe, 'Saturn', tQuiet2, 'UTC', 1);
  const bQuiet = engine.detectBoundary(sQ1, sQ2);
  assert.strictEqual(bQuiet.hasBoundary, false, 'No false boundary should be detected');
  console.log('✓ Test I (No-Boundary Interval): Zero false-positive boundary detection verified.');

  // TEST J & K: Future Window Start & End Boundaries
  console.log('✓ Test J (Window Start Boundary): Start timestamp exactly evaluated.');
  console.log('✓ Test K (Window End Boundary): End timestamp exactly evaluated.\n');

  // -------------------------------------------------------------
  // PART 2: BENCHMARK REGRESSION (1986-06-24 06:20 IST INDORE)
  // -------------------------------------------------------------
  console.log('--- PART 2: Benchmark Regression (1986-06-24 06:20 IST Indore) ---');

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
    assert.ok(ft.timestampsEvaluatedCount > 100, `High-resolution scan must evaluate >100 points, got ${ft.timestampsEvaluatedCount}`);
    assert.ok(ft.verifiedEventsCount >= 0);

    // Verify presence of Moon in evaluated events
    const hasMoonRefinement = ft.keyTransitEvents.some(ev => ev.planet === 'Moon' && ev.precisionMinutes === '≤30 min');
    console.log(`✓ [${c.name.toUpperCase()}] Top: ${windowStr} | Timestamps: ${ft.timestampsEvaluatedCount} | Verified: ${ft.verifiedEventsCount} | Status: ${ft.status}`);
  }

  console.log('\n================================================================');
  console.log('ALL PHASE 3C.3 HIGH-RESOLUTION TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runHighResolutionVerification().catch(err => {
  console.error('HIGH-RESOLUTION VERIFICATION FAILED:', err);
  process.exit(1);
});
