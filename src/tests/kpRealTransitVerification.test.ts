import assert from 'node:assert';
import { KpEngine } from '../services/jyotish/kpEngine';
import { KpJudgmentEngine } from '../services/jyotish/kpJudgmentEngine';
import { KpTimingEngine } from '../services/jyotish/kpTimingEngine';
import { TransitEngine } from '../services/jyotish/transitEngine';
import { KPQuestionCategory } from '../types/jyotish/kpJudgment';

async function runTransitVerification() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 3C.1 REAL TRANSIT DATA LAYER FORENSIC VERIFICATION');
  console.log('================================================================\n');

  // Calculate standard birth chart
  const res = await fetch('http://localhost:3000/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dob: '1995-10-25',
      time: '14:30:00',
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
  const kpEngine = new KpEngine();
  const judgmentEngine = new KpJudgmentEngine();
  const timingEngine = new KpTimingEngine();
  const transitEngine = new TransitEngine();

  const kpResult = kpEngine.evaluate(masterData);

  // -------------------------------------------------------------
  // TEST 1: Real Astronomical Transit Planetary Positions via Swiss Ephemeris
  // -------------------------------------------------------------
  console.log('--- TEST 1: Swiss Ephemeris Real Transit Coordinates ---');
  const transitRes = await transitEngine.calculateTransit({
    date: '2026-09-24',
    time: '12:00:00',
    latitude: 22.7196,
    longitude: 75.8577,
    timezone: 'Asia/Kolkata',
    ayanamsa: 'Lahiri'
  }, masterData);

  assert.strictEqual(transitRes.status, 'AVAILABLE', 'Status must be AVAILABLE');
  assert.strictEqual(transitRes.ephemerisSource, 'Swiss Ephemeris', 'Ephemeris source must be Swiss Ephemeris');
  assert.ok(transitRes.transits && transitRes.transits.length === 9, 'Must calculate all 9 Vedic planets');

  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  for (const name of planetNames) {
    const p = transitRes.transitPlanets?.[name];
    assert.ok(p, `Planet ${name} must be calculated`);
    assert.strictEqual(p.planet, name);
    assert.ok(p.exactLongitude >= 0 && p.exactLongitude < 360, `${name} longitude must be 0-360`);
    assert.ok(p.sign, `${name} sign must exist`);
    assert.ok(p.degree >= 0 && p.degree < 30, `${name} degree must be 0-30`);
    assert.ok(p.nakshatra >= 1 && p.nakshatra <= 27, `${name} nakshatra must be 1-27`);
    assert.ok(p.pada >= 1 && p.pada <= 4, `${name} pada must be 1-4`);
    assert.ok(['Direct', 'Retrograde'].includes(p.motionStatus), `${name} motionStatus must be Direct or Retrograde`);
    assert.strictEqual(p.ephemerisSource, 'Swiss Ephemeris');
    assert.ok(p.calculationTimestamp, 'Calculation timestamp must be recorded');
    assert.ok(p.transitHouseFromLagna >= 1 && p.transitHouseFromLagna <= 12, 'Transit house must be 1-12');

    console.log(`✓ ${name.padEnd(8)}: ${p.exactLongitude.toFixed(4).padStart(8)}° (${p.sign.padEnd(11)} ${p.degree.toFixed(2).padStart(5)}°) | Nak: ${p.nakshatraName.padEnd(16)} (${p.pada}) | ${p.motionStatus.padEnd(10)} | H${p.transitHouseFromLagna}`);
  }

  // -------------------------------------------------------------
  // TEST 2: Deterministic Verification (Two consecutive calculations must match exactly)
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Deterministic Invariance (Zero drift) ---');
  const transitRes2 = await transitEngine.calculateTransit({
    date: '2026-09-24',
    time: '12:00:00',
    latitude: 22.7196,
    longitude: 75.8577,
    timezone: 'Asia/Kolkata',
    ayanamsa: 'Lahiri'
  }, masterData);

  for (const name of planetNames) {
    const p1 = transitRes.transitPlanets![name];
    const p2 = transitRes2.transitPlanets![name];
    assert.strictEqual(p1.exactLongitude, p2.exactLongitude, `${name} longitude must be identical`);
    assert.strictEqual(p1.degree, p2.degree, `${name} degree must be identical`);
    assert.strictEqual(p1.nakshatra, p2.nakshatra, `${name} nakshatra must be identical`);
  }
  console.log('✓ Deterministic invariance confirmed across multiple runs.');

  // -------------------------------------------------------------
  // TEST 3: Trace for all 5 Live Questions
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Forensic Trace for All 5 Live Questions ---');

  const testQuestions: Array<{
    category: KPQuestionCategory;
    question: string;
    expectedPrimaryCusp: number;
    expectedTargetHouses: number[];
  }> = [
    {
      category: 'career_job',
      question: 'मेरी job में प्रगति कब आएगी?',
      expectedPrimaryCusp: 10,
      expectedTargetHouses: [2, 6, 10, 11]
    },
    {
      category: 'business',
      question: 'मेरा business कब बेहतर होगा?',
      expectedPrimaryCusp: 7,
      expectedTargetHouses: [2, 7, 10, 11]
    },
    {
      category: 'marriage',
      question: 'मेरी शादी कब होगी?',
      expectedPrimaryCusp: 7,
      expectedTargetHouses: [2, 7, 11]
    },
    {
      category: 'property',
      question: 'घर बनाने/खरीदने का समय कब बनता है?',
      expectedPrimaryCusp: 4,
      expectedTargetHouses: [4, 11]
    },
    {
      category: 'finance_income',
      question: 'मेरी income कब सुधर सकती है?',
      expectedPrimaryCusp: 2,
      expectedTargetHouses: [2, 6, 10, 11]
    }
  ];

  for (const tq of testQuestions) {
    const judgment = judgmentEngine.evaluateQuestion(kpResult, {
      question: tq.question,
      category: tq.category,
      questionDate: '2026-09-24',
      questionTime: '12:00:00',
      questionLocation: 'Indore'
    });

    const timing = await timingEngine.evaluateTimingAsync(masterData, kpResult, judgment, {
      date: '2026-09-24',
      time: '12:00:00'
    });

    assert.strictEqual(timing.category, tq.category);
    assert.strictEqual(timing.primaryCusp, tq.expectedPrimaryCusp);
    assert.deepStrictEqual(timing.eventTargetHouses, tq.expectedTargetHouses);

    // Verify Transit Corroboration is Real
    const tc = timing.transitCorroboration;
    assert.strictEqual(tc.status, 'AVAILABLE', 'Transit status must be AVAILABLE');
    assert.strictEqual(tc.ephemerisSource, 'Swiss Ephemeris', 'Ephemeris source must be Swiss Ephemeris');
    assert.ok(tc.actualTransitPlanets && tc.actualTransitPlanets.length === 9, 'Must include all 9 actual transit planets');
    assert.ok(typeof tc.isCorroborated === 'boolean', 'isCorroborated must be boolean');
    assert.ok(tc.description.hi.includes('वास्तविक गोचर गणना (स्विस एफिमेरिस)'), 'Description must cite real Swiss Ephemeris calculation');

    // Verify Evidence Layers on Top Window
    const best = timing.mostFavourableWindow;
    assert.ok(best, 'Most favourable window must exist');
    assert.ok(best.evidenceLayers, 'Evidence layers must exist on window');
    assert.ok(best.evidenceLayers.dashaEvidence, 'Dasha evidence must exist');
    assert.ok(best.evidenceLayers.kpSignificatorEvidence, 'KP Significator evidence must exist');
    assert.ok(best.evidenceLayers.cuspSubLordEvidence, 'Cusp Sub-Lord evidence must exist');
    assert.ok(best.evidenceLayers.rulingPlanetCorroboration, 'RP corroboration must exist');
    assert.ok(best.evidenceLayers.actualTransitEvidence, 'Actual transit evidence must exist');
    assert.strictEqual(best.evidenceLayers.actualTransitEvidence.status, 'AVAILABLE');

    console.log(`✓ [${tq.category.toUpperCase()}]`);
    console.log(`   Question: "${tq.question}"`);
    console.log(`   Target Houses: [${tq.expectedTargetHouses.join(', ')}]`);
    console.log(`   Top Window: ${best.mahadashaLord}-${best.antardashaLord} (${best.formattedStart.en} to ${best.formattedEnd.en})`);
    console.log(`   Transit Corroboration: ${tc.isCorroborated ? 'YES' : 'PENDING'} (Active: ${tc.transitSignificatorPlanets.join(', ') || 'None'})`);
    console.log(`   Source: ${tc.ephemerisSource} | Actual Planets: ${tc.actualTransitPlanets.length}\n`);
  }

  // -------------------------------------------------------------
  // TEST 4: No Fallback Fabrication when Ephemeris Data is Unavailable
  // -------------------------------------------------------------
  console.log('--- TEST 4: No Fallback Fabrication when Data is Unavailable ---');
  const dummyJudgment = judgmentEngine.evaluateQuestion(kpResult, {
    question: 'Dummy check for unavailable transit',
    category: 'career_job',
    questionDate: '2026-09-24',
    questionTime: '12:00:00',
    questionLocation: 'Indore'
  });

  // Evaluate with null masterData and forced unavailable transit
  const unavailTiming = timingEngine.evaluateTiming(null, kpResult, dummyJudgment, {
    status: 'NOT_AVAILABLE'
  });

  assert.strictEqual(unavailTiming.transitCorroboration.status, 'NOT_AVAILABLE');
  assert.strictEqual(unavailTiming.transitCorroboration.isCorroborated, false);
  assert.strictEqual(
    unavailTiming.transitCorroboration.description.hi,
    'वर्तमान गोचर डेटा उपलब्ध नहीं है, इसलिए वास्तविक गोचर समर्थन की पुष्टि नहीं की जा सकती।'
  );
  assert.ok(unavailTiming.transitCorroboration.classicalRuleNote, 'Must provide traditional rule note');
  assert.strictEqual(
    unavailTiming.transitCorroboration.classicalRuleNote.label.hi,
    'परंपरागत नियम-आधारित संकेत'
  );
  assert.ok(
    !unavailTiming.transitCorroboration.description.hi.includes('DERIVED_CORROBORATION'),
    'Must NOT fabricate DERIVED_CORROBORATION as transit status'
  );
  console.log('✓ Truthful unavailable transit handling verified. No fabricated corroboration.');

  console.log('\n================================================================');
  console.log('ALL PHASE 3C.1 REAL TRANSIT DATA LAYER TESTS PASSED!');
  console.log('================================================================');
}

runTransitVerification().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
