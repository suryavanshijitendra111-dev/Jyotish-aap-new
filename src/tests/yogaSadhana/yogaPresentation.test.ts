/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA PRESENTATION TEST SUITE
 * PHASE 1.15E: STRICT PRESENTATION & NAVIGATION VERIFICATION
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';

async function runYogaPresentationTestSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.15E: YOGA PRESENTATION & UI TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;

  // -------------------------------------------------------------
  // TEST 1: Yoga card in Dashboard.tsx isLive === true and navigates to 'yoga'
  // -------------------------------------------------------------
  console.log('--- TEST 1: Dashboard Yoga card configuration ---');
  const dashboardSource = fs.readFileSync(path.resolve(process.cwd(), 'src/components/Dashboard.tsx'), 'utf8');
  assert.ok(
    dashboardSource.includes("id: 'yoga'") &&
    dashboardSource.includes("isLive: true") &&
    dashboardSource.includes("action: () => navigate('yoga')"),
    'Dashboard Yoga card must be activated with isLive: true and navigate("yoga")'
  );
  console.log('  ✓ Test 1 Passed: Dashboard Yoga card is live and wired to navigate("yoga")');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 2: App.tsx routes 'yoga' to YogaDashboard
  // -------------------------------------------------------------
  console.log('--- TEST 2: App.tsx routing integration ---');
  const appSource = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  assert.ok(
    appSource.includes("import YogaDashboard from './components/yogaSadhana/YogaDashboard';") ||
    appSource.includes('import YogaDashboard from "./components/yogaSadhana/YogaDashboard";'),
    'App.tsx must import YogaDashboard'
  );
  assert.ok(
    appSource.includes("case 'yoga':") && appSource.includes('<YogaDashboard'),
    'App.tsx switch must handle case "yoga" and render YogaDashboard'
  );
  console.log('  ✓ Test 2 Passed: App.tsx cleanly routes "yoga" view to YogaDashboard');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 3: Yoga Catalog renders exactly 4 practices
  // -------------------------------------------------------------
  console.log('--- TEST 3: Exact 4 practices available to UI ---');
  const practices = YogaCatalogService.getAllPractices();
  assert.strictEqual(practices.length, 4, `Yoga catalog must have 4 practices, got ${practices.length}`);
  console.log('  ✓ Test 3 Passed: Exactly 4 practices available for UI rendering');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 4: All 4 canonical names appear in catalog and components
  // -------------------------------------------------------------
  console.log('--- TEST 4: All 4 canonical practice names appear ---');
  const expectedPractices = [
    { id: 'shavasana', hindi: 'शवासन', english: 'Shavasana' },
    { id: 'sukhasana', hindi: 'सुखासन', english: 'Sukhasana' },
    { id: 'tadasana', hindi: 'ताड़ासन', english: 'Tadasana' },
    { id: 'anulom_vilom', hindi: 'अनुलोम विलोम', english: 'Anulom Vilom' }
  ];
  for (const exp of expectedPractices) {
    const p = YogaCatalogService.getPracticeById(exp.id);
    assert.ok(p, `Practice ${exp.id} must exist in catalog`);
    assert.strictEqual(p.nameHindi, exp.hindi, `Hindi name mismatch for ${exp.id}`);
    assert.strictEqual(p.nameEnglish, exp.english, `English name mismatch for ${exp.id}`);
  }
  console.log('  ✓ Test 4 Passed: All 4 canonical Hindi and English names confirmed');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 5: No excluded practices appear in UI source
  // -------------------------------------------------------------
  console.log('--- TEST 5: Excluded practices barred from presentation ---');
  const yogaDashboardCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/yogaSadhana/YogaDashboard.tsx'), 'utf8');
  const yogaDetailCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/yogaSadhana/YogaPracticeDetail.tsx'), 'utf8');
  const combinedUiCode = (yogaDashboardCode + yogaDetailCode).toLowerCase();

  const barredPractices = [
    'vajrasana',
    'dandasana',
    'marjaryasana',
    'bitilasana',
    'nadi_shodhana',
    'bhramari',
    'kapalabhati',
    'bhastrika',
    'kumbhaka',
    'bandha',
    'mudra'
  ];

  for (const barred of barredPractices) {
    assert.strictEqual(
      combinedUiCode.includes(`'${barred}'`) || combinedUiCode.includes(`"${barred}"`),
      false,
      `Barred practice '${barred}' must not be declared in presentation layer`
    );
  }
  console.log('  ✓ Test 5 Passed: Zero excluded practices exist in presentation layer');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 6: Detail component reads directly from catalog
  // -------------------------------------------------------------
  console.log('--- TEST 6: Detail component reads directly from YogaCatalogService ---');
  assert.ok(
    yogaDetailCode.includes('YogaCatalogService.getPracticeById(practiceId)'),
    'Detail component must read practice definition directly from YogaCatalogService'
  );
  console.log('  ✓ Test 6 Passed: Direct catalog service binding verified');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 7: Anulom Vilom displays modern adaptation notice
  // -------------------------------------------------------------
  console.log('--- TEST 7: Anulom Vilom modern adaptation notice in UI ---');
  assert.ok(
    yogaDetailCode.includes('यह आधुनिक परंपरा में प्रयुक्त सरल alternate-nostril breathing का रूप है।') ||
    yogaDetailCode.includes('alternate-nostril breathing'),
    'Anulom Vilom must display the approved modern adaptation provenance notice'
  );
  assert.ok(
    yogaDetailCode.includes('शून्य कुंभक'),
    'Anulom Vilom must explicitly highlight zero Kumbhaka'
  );
  console.log('  ✓ Test 7 Passed: Anulom Vilom modern adaptation and zero-Kumbhaka notices verified');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 8: Zero session engine, timer, countdown in presentation
  // -------------------------------------------------------------
  console.log('--- TEST 8: Zero session engine / timer in UI ---');
  assert.strictEqual(combinedUiCode.includes('sessionengine'), false, 'SessionEngine must not be referenced in Yoga UI');
  assert.strictEqual(combinedUiCode.includes('setinterval'), false, 'setInterval timer must not exist in Yoga UI');
  assert.strictEqual(combinedUiCode.includes('startsession'), false, 'startSession must not exist in Yoga UI');
  assert.strictEqual(combinedUiCode.includes('countdown'), false, 'countdown must not exist in Yoga UI');
  console.log('  ✓ Test 8 Passed: Strictly zero session engine / timer logic in UI');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 9: Zero audio controls / Web Audio in presentation
  // -------------------------------------------------------------
  console.log('--- TEST 9: Zero audio controls / Web Audio in UI ---');
  assert.strictEqual(combinedUiCode.includes('audiocontext'), false, 'AudioContext must not exist in Yoga UI');
  assert.strictEqual(combinedUiCode.includes('speechengine'), false, 'SpeechEngine must not exist in Yoga UI');
  assert.strictEqual(combinedUiCode.includes('speechsynthesis'), false, 'SpeechSynthesis must not exist in Yoga UI');
  assert.strictEqual(combinedUiCode.includes('<audio'), false, '<audio> tags must not exist in Yoga UI');
  console.log('  ✓ Test 9 Passed: Strictly zero audio / voice controls in UI');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 10: Zero AI / network calls in presentation
  // -------------------------------------------------------------
  console.log('--- TEST 10: Zero AI / network calls in UI ---');
  assert.strictEqual(combinedUiCode.includes('googlegenai'), false, 'GoogleGenAI must not exist in Yoga UI');
  assert.strictEqual(combinedUiCode.includes('gemini'), false, 'Gemini must not exist in Yoga UI');
  assert.strictEqual(combinedUiCode.includes('fetch('), false, 'fetch() must not exist in Yoga UI');
  assert.strictEqual(combinedUiCode.includes('axios'), false, 'axios must not exist in Yoga UI');
  console.log('  ✓ Test 10 Passed: Zero AI and network dependencies in Yoga UI');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 11: Invalid practice ID shows safe fallback
  // -------------------------------------------------------------
  console.log('--- TEST 11: Invalid practice ID fallback ---');
  assert.ok(
    yogaDetailCode.includes('यह योग अभ्यास उपलब्ध नहीं है।'),
    'Detail component must display safe not-found message for invalid practiceId'
  );
  assert.ok(
    yogaDetailCode.includes('onClick={onBack}'),
    'Detail component must provide onBack fallback when practice is not found'
  );
  console.log('  ✓ Test 11 Passed: Safe fallback with back action confirmed for invalid IDs');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 12: Meditation remains completely unaffected
  // -------------------------------------------------------------
  console.log('--- TEST 12: Meditation isolation verification ---');
  const meditationDashboardCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/meditation/MeditationDashboard.tsx'), 'utf8');
  assert.strictEqual(
    meditationDashboardCode.includes('yogaSadhana'),
    false,
    'MeditationDashboard must NOT import or depend on yogaSadhana'
  );
  console.log('  ✓ Test 12 Passed: Meditation remains 100% isolated and unaffected');
  passedTests++;

  console.log('\n================================================================');
  console.log(`ALL ${passedTests}/${passedTests} YOGA PRESENTATION TESTS PASSED (100%)`);
  console.log('================================================================');
}

runYogaPresentationTestSuite().catch((err) => {
  console.error('Presentation test suite failed:', err);
  process.exit(1);
});
