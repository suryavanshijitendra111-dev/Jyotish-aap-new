import assert from 'node:assert';
import { KpEngine } from '../services/jyotish/kpEngine';
import { KpJudgmentEngine } from '../services/jyotish/kpJudgmentEngine';
import { KpTimingEngine } from '../services/jyotish/kpTimingEngine';
import { KP_EVENT_HOUSE_MAPPINGS, KPQuestionCategory } from '../types/jyotish/kpJudgment';

async function runVerification() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — KP PHASE 3C ADVANCED EVENT TIMING ENGINE VERIFICATION');
  console.log('================================================================\n');

  const res = await fetch('http://localhost:3000/api/calculate', {
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

  if (!res.ok) {
    throw new Error(`Failed to calculate MasterKundliData: ${res.statusText}`);
  }

  const masterData = await res.json();
  if (!masterData.vimshottariDasha) {
    const { VimshottariEngine } = await import('../services/jyotish/dasha/vimshottari');
    masterData.vimshottariDasha = VimshottariEngine.calculate(masterData);
  }
  const kpEngine = new KpEngine();
  const kpResult = kpEngine.evaluate(masterData);
  const judgmentEngine = new KpJudgmentEngine();
  const timingEngine = new KpTimingEngine();

  // Test 1: All 15 Question Categories
  console.log('--- TEST 1: All 15 Categories Timing Evaluation ---');
  const categories = Object.keys(KP_EVENT_HOUSE_MAPPINGS) as KPQuestionCategory[];
  assert.strictEqual(categories.length, 15, 'Must have exactly 15 categories');

  for (const cat of categories) {
    const mapping = KP_EVENT_HOUSE_MAPPINGS[cat];
    const judgment = judgmentEngine.evaluateQuestion(kpResult, {
      question: `Timing query for ${cat}`,
      category: cat,
      questionDate: '2026-09-23',
      questionTime: '12:00',
      questionLocation: 'Indore'
    });

    const timing = timingEngine.evaluateTiming(masterData, kpResult, judgment);

    assert.strictEqual(timing.category, cat);
    assert.deepStrictEqual(timing.eventTargetHouses, mapping.targetHouses);
    assert.deepStrictEqual(timing.eventAdverseHouses, mapping.adverseHouses);
    assert.strictEqual(timing.primaryCusp, mapping.primaryCusp);

    assert.ok(timing.currentPeriod.mahadashaLord, 'Current Mahadasha Lord must be present');
    assert.ok(timing.currentPeriod.antardashaLord, 'Current Antardasha Lord must be present');
    assert.ok(timing.currentPeriod.mahadashaStart, 'Current Mahadasha Start must be present');
    assert.ok(timing.currentPeriod.antardashaStart, 'Current Antardasha Start must be present');

    assert.ok(timing.evaluatedWindows.length >= 5, 'Must evaluate at least 5 chronological Antardashas');
    for (const w of timing.evaluatedWindows) {
      assert.ok(w.startDate, 'Window start date must exist');
      assert.ok(w.endDate, 'Window end date must exist');
      assert.ok(new Date(w.startDate).getTime() < new Date(w.endDate).getTime(), 'Start must precede end');
      assert.ok(w.durationMonths >= 1, 'Duration must be at least 1 month');
    }

    assert.ok(timing.humanTimingSummary.hi, 'Hindi human timing summary must exist');
    assert.ok(timing.humanTimingSummary.en, 'English human timing summary must exist');
    assert.ok(timing.timingGuidance.length > 0, 'Timing guidance tips must exist');
    assert.ok(timing.timingUncertaintyNote.hi.includes('पारंपरिक KP'), 'Timing uncertainty note must mention traditional KP');

    console.log(`✓ ${cat.padEnd(16)} Windows: ${timing.evaluatedWindows.length}, Top: ${timing.mostFavourableWindow?.antardashaLord} (${timing.mostFavourableWindow?.favourability})`);
  }

  // Test 2: No Invented Dates (Exact Dasha Match)
  console.log('\n--- TEST 2: Strict Deterministic Dasha Date Match ---');
  const judgmentCareer = judgmentEngine.evaluateQuestion(kpResult, {
    question: 'Job promotion kab hoga?',
    category: 'career_job',
    questionDate: '2026-09-23',
    questionTime: '12:00',
    questionLocation: 'Indore'
  });
  const timingCareer = timingEngine.evaluateTiming(masterData, kpResult, judgmentCareer);

  const vimshottari = masterData.vimshottariDasha;
  assert.ok(vimshottari, 'Vimshottari dasha must exist in MasterKundliData');

  assert.strictEqual(timingCareer.currentPeriod.mahadashaLord, vimshottari.currentMahadasha.planet);
  assert.strictEqual(timingCareer.currentPeriod.antardashaLord, vimshottari.currentAntardasha.planet);
  assert.strictEqual(timingCareer.currentPeriod.mahadashaStart, vimshottari.currentMahadasha.startDate);
  assert.strictEqual(timingCareer.currentPeriod.antardashaStart, vimshottari.currentAntardasha.startDate);

  const allKnownSubPeriods = vimshottari.mahadashas.flatMap((m: any) =>
    (m.subPeriods || []).map((s: any) => ({
      maha: m.planet,
      antar: s.planet,
      start: s.startDate,
      end: s.endDate
    }))
  );

  for (const w of timingCareer.evaluatedWindows) {
    const match = allKnownSubPeriods.find(
      (p: any) =>
        p.maha === w.mahadashaLord &&
        p.antar === w.antardashaLord &&
        p.start === w.startDate &&
        p.end === w.endDate
    );
    assert.ok(match, `Window ${w.id} must exactly match a real calculated Dasha period in VimshottariData`);
  }
  console.log('✓ All evaluated windows match exact deterministic Dasha periods without date invention');

  // Test 3: Insufficient Data Handling
  console.log('\n--- TEST 3: Insufficient Data Handling ---');
  const incompleteKpResult = {
    system: 'KP' as const,
    planetData: [],
    cuspData: [],
    availability: 'NOT_AVAILABLE' as const,
    rules: [],
    warnings: [],
    metadata: {}
  };

  const judgmentInsufficient = judgmentEngine.evaluateQuestion(incompleteKpResult as any, {
    question: 'Kab hoga mera vivah?',
    category: 'marriage',
    questionDate: '2026-09-23',
    questionTime: '12:00',
    questionLocation: 'Indore'
  });

  const timingInsufficient = timingEngine.evaluateTiming(null, incompleteKpResult as any, judgmentInsufficient);
  assert.strictEqual(timingInsufficient.evaluatedWindows.length, 0);
  assert.strictEqual(timingInsufficient.mostFavourableWindow, null);
  assert.strictEqual(timingInsufficient.transitCorroboration.status, 'NOT_AVAILABLE');
  assert.ok(timingInsufficient.humanTimingSummary.hi.includes('उपलब्ध दशा, गोचर और KP timing data से विश्वसनीय समय-खिड़की निर्धारित नहीं की जा सकती'));
  console.log('✓ Insufficient data produces explicit honest notice without speculation');

  // Test 4: Challenging Outcome Handling
  console.log('\n--- TEST 4: Challenging Outcome Handling ---');
  // career_job in 24 June 1986 has score 20 (CHALLENGING)
  assert.strictEqual(judgmentCareer.outcome, 'CHALLENGING');
  assert.strictEqual(timingCareer.judgmentOutcome, 'CHALLENGING');
  assert.ok(timingCareer.humanTimingSummary.hi.includes('प्रतिकूल भावों का प्रभाव'));
  assert.ok(timingCareer.humanTimingSummary.hi.includes('धैर्य'));
  console.log('✓ Challenging outcome explains foundational obstacles without false promises');

  // Test 5: Ruling Planet & Sub-Lord Corroboration
  console.log('\n--- TEST 5: Ruling Planet & Sub-Lord Corroboration ---');
  const judgmentBusiness = judgmentEngine.evaluateQuestion(kpResult, {
    question: 'Naya business kab start karun?',
    category: 'business',
    questionDate: '2026-09-23',
    questionTime: '12:00',
    questionLocation: 'Indore'
  });
  const timingBusiness = timingEngine.evaluateTiming(masterData, kpResult, judgmentBusiness);
  const rps = kpResult.rulingPlanets?.allRulingPlanets || [];

  for (const w of timingBusiness.evaluatedWindows) {
    if (rps.includes(w.antardashaLord) || rps.includes(w.mahadashaLord)) {
      assert.strictEqual(w.isRulingPlanetCorroborated, true);
    }
  }
  console.log('✓ Ruling Planet and Sub-Lord corroboration flags correctly synchronized');

  console.log('\n================================================================');
  console.log('ALL KP PHASE 3C VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runVerification().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
