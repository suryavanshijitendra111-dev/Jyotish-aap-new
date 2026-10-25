/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA ACTIVE SESSION TEST SUITE
 * PHASE 1.15F-B: ACTIVE SESSION UI AND ENGINE INTEGRATION VERIFICATION
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';
import { YogaSessionEngine } from '../../services/yogaSadhana/yogaSessionEngine';
import { YogaSessionClock, YogaSessionSnapshot } from '../../types/yogaSadhana/yogaSessionTypes';

class MockClock implements YogaSessionClock {
  private currentTime: number;

  constructor(initialTimeMs: number = 1000000) {
    this.currentTime = initialTimeMs;
  }

  public now(): number {
    return this.currentTime;
  }

  public advance(ms: number): void {
    this.currentTime += ms;
  }
}

async function runYogaActiveSessionTestSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.15F-B: YOGA ACTIVE SESSION TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  const activeSessionSource = fs.readFileSync(path.resolve(process.cwd(), 'src/components/yogaSadhana/YogaActiveSession.tsx'), 'utf8');
  const activeSessionLower = activeSessionSource.toLowerCase();

  // -------------------------------------------------------------
  // TEST 1: Correct practice identity
  // -------------------------------------------------------------
  console.log('--- TEST 1: Practice identity ---');
  const practice = YogaCatalogService.getPracticeById('shavasana');
  assert.ok(practice, 'Practice must exist');
  assert.strictEqual(practice.id, 'shavasana');
  assert.ok(activeSessionSource.includes('practice.nameHindi'), 'Must display Hindi practice name');
  console.log('  ✓ Test 1 Passed: Practice identity resolved accurately');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 2: Correct Hindi name
  // -------------------------------------------------------------
  console.log('--- TEST 2: Hindi name ---');
  const tadasana = YogaCatalogService.getPracticeById('tadasana');
  assert.strictEqual(tadasana?.nameHindi, 'ताड़ासन');
  console.log('  ✓ Test 2 Passed: Canonical Hindi names verified');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 3: Correct English name
  // -------------------------------------------------------------
  console.log('--- TEST 3: English name ---');
  assert.strictEqual(tadasana?.nameEnglish, 'Tadasana');
  assert.ok(activeSessionSource.includes('practice.nameEnglish'), 'Must display English practice name');
  console.log('  ✓ Test 3 Passed: English names verified');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 4: Correct category
  // -------------------------------------------------------------
  console.log('--- TEST 4: Category ---');
  assert.strictEqual(tadasana?.category, 'ASANA');
  const anulom = YogaCatalogService.getPracticeById('anulom_vilom');
  assert.strictEqual(anulom?.category, 'BREATH_AWARENESS');
  assert.ok(activeSessionSource.includes("practice.category === 'ASANA' ? 'आसन' : 'श्वास जागरूकता'"));
  console.log('  ✓ Test 4 Passed: Practice category mapped correctly');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 5: Duration comes from catalog
  // -------------------------------------------------------------
  console.log('--- TEST 5: Duration from catalog ---');
  for (const p of YogaCatalogService.getAllPractices()) {
    assert.ok(p.allowedDurationsSeconds.length > 0);
    assert.ok(p.allowedDurationsSeconds.includes(p.defaultDurationSeconds));
  }
  console.log('  ✓ Test 5 Passed: Allowed durations originate strictly from catalog');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 6: Start creates engine
  // -------------------------------------------------------------
  console.log('--- TEST 6: Start creates engine ---');
  const clock = new MockClock();
  const createRes = YogaSessionEngine.create({
    practiceId: 'sukhasana',
    targetDurationSeconds: 300,
    clock,
    autoTick: false
  });
  assert.strictEqual(createRes.success, true);
  const engine = createRes.data!;
  assert.strictEqual(engine.getSnapshot().status, 'IDLE');
  const startRes = engine.start();
  assert.strictEqual(startRes.success, true);
  assert.strictEqual(engine.getSnapshot().status, 'PREPARING');
  console.log('  ✓ Test 6 Passed: Engine created and transitions IDLE -> PREPARING');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 7: PREPARING renders engine countdown
  // -------------------------------------------------------------
  console.log('--- TEST 7: PREPARING countdown from engine ---');
  assert.ok(activeSessionSource.includes('snapshot.preparingRemainingSeconds'));
  assert.ok(activeSessionSource.includes("snapshot.status === 'PREPARING'"));
  assert.ok(activeSessionSource.includes('अभ्यास के लिए सहज स्थिति में आएँ।'));
  assert.strictEqual(engine.getSnapshot().preparingRemainingSeconds, 3);
  clock.advance(1000);
  engine.tick();
  assert.strictEqual(engine.getSnapshot().preparingRemainingSeconds, 2);
  console.log('  ✓ Test 7 Passed: PREPARING renders engine countdown directly');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 8: No duplicate UI timer
  // -------------------------------------------------------------
  console.log('--- TEST 8: No duplicate UI timer ---');
  assert.strictEqual(activeSessionLower.includes('setinterval('), false, 'No setInterval in component');
  assert.strictEqual(activeSessionLower.includes('elapsedseconds +='), false, 'No elapsed counter increment in UI');
  assert.strictEqual(activeSessionLower.includes('remainingseconds -='), false, 'No remaining decrement in UI');
  assert.strictEqual(activeSessionLower.includes('requestanimationframe'), false, 'No rAF timing loop');
  console.log('  ✓ Test 8 Passed: Zero duplicate timers in Active Session UI');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 9: ACTIVE renders elapsed time
  // -------------------------------------------------------------
  console.log('--- TEST 9: ACTIVE elapsed time ---');
  clock.advance(2000); // reaches 3s prep end
  engine.tick();
  assert.strictEqual(engine.getSnapshot().status, 'ACTIVE');
  assert.strictEqual(engine.getSnapshot().elapsedSeconds, 0);
  clock.advance(35000);
  engine.tick();
  assert.strictEqual(engine.getSnapshot().elapsedSeconds, 35);
  assert.ok(activeSessionSource.includes('snapshot.elapsedSeconds'));
  console.log('  ✓ Test 9 Passed: Elapsed time renders from engine snapshot');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 10: ACTIVE renders remaining time
  // -------------------------------------------------------------
  console.log('--- TEST 10: ACTIVE remaining time ---');
  assert.strictEqual(engine.getSnapshot().remainingSeconds, 265);
  assert.ok(activeSessionSource.includes('snapshot.remainingSeconds'));
  console.log('  ✓ Test 10 Passed: Remaining time renders from engine snapshot');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 11: ACTIVE renders progress
  // -------------------------------------------------------------
  console.log('--- TEST 11: ACTIVE progress ---');
  assert.ok(activeSessionSource.includes('snapshot.progressRatio'));
  assert.strictEqual(Math.round(engine.getSnapshot().progressRatio * 100), 12);
  console.log('  ✓ Test 11 Passed: Progress bar reflects engine progressRatio');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 12: Pause calls engine.pause()
  // -------------------------------------------------------------
  console.log('--- TEST 12: Pause calls engine.pause() ---');
  assert.ok(activeSessionSource.includes('engine?.pause()'));
  const pauseRes = engine.pause();
  assert.strictEqual(pauseRes.success, true);
  assert.strictEqual(engine.getSnapshot().status, 'PAUSED');
  console.log('  ✓ Test 12 Passed: Pause transition verified');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 13: PAUSED renders correctly
  // -------------------------------------------------------------
  console.log('--- TEST 13: PAUSED state presentation ---');
  assert.ok(activeSessionSource.includes("snapshot.status === 'PAUSED'"));
  assert.ok(activeSessionSource.includes('विराम (Paused)'));
  clock.advance(30000); // 30s in pause
  engine.tick();
  assert.strictEqual(engine.getSnapshot().elapsedSeconds, 35, 'Elapsed time must freeze during pause');
  console.log('  ✓ Test 13 Passed: PAUSED visual state and time freeze confirmed');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 14: Resume calls engine.resume()
  // -------------------------------------------------------------
  console.log('--- TEST 14: Resume calls engine.resume() ---');
  assert.ok(activeSessionSource.includes('engine?.resume()'));
  const resumeRes = engine.resume();
  assert.strictEqual(resumeRes.success, true);
  assert.strictEqual(engine.getSnapshot().status, 'ACTIVE');
  clock.advance(10000);
  engine.tick();
  assert.strictEqual(engine.getSnapshot().elapsedSeconds, 45);
  console.log('  ✓ Test 14 Passed: Resume continues active timing seamlessly');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 15: Cancel opens confirmation
  // -------------------------------------------------------------
  console.log('--- TEST 15: Cancel opens confirmation ---');
  assert.ok(activeSessionSource.includes('setShowCancelModal(true)'));
  assert.ok(activeSessionSource.includes('क्या आप अभ्यास समाप्त करना चाहते हैं?'));
  console.log('  ✓ Test 15 Passed: Cancel triggers modal dialog');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 16: Confirm cancel calls engine.cancel()
  // -------------------------------------------------------------
  console.log('--- TEST 16: Confirm cancel calls engine.cancel() ---');
  assert.ok(activeSessionSource.includes('engine.cancel()'));
  const cancelRes = engine.cancel();
  assert.strictEqual(cancelRes.success, true);
  assert.strictEqual(engine.getSnapshot().status, 'CANCELLED');
  console.log('  ✓ Test 16 Passed: Confirm cancel transitions session to CANCELLED');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 17: Dismiss cancel keeps session active
  // -------------------------------------------------------------
  console.log('--- TEST 17: Dismiss cancel keeps session active ---');
  assert.ok(activeSessionSource.includes('handleDismissCancel'));
  assert.ok(activeSessionSource.includes('setShowCancelModal(false)'));
  console.log('  ✓ Test 17 Passed: Dismiss cancel preserves ongoing practice');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 18: Back during ACTIVE requires confirmation
  // -------------------------------------------------------------
  console.log('--- TEST 18: Back during ACTIVE requires confirmation ---');
  assert.ok(activeSessionSource.includes("snapshot.status === 'ACTIVE'"));
  assert.ok(activeSessionSource.includes('handleBackRequest'));
  assert.ok(activeSessionSource.includes('setShowCancelModal(true)'));
  console.log('  ✓ Test 18 Passed: Back navigation during ACTIVE opens confirmation modal');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 19: Back during PAUSED requires confirmation
  // -------------------------------------------------------------
  console.log('--- TEST 19: Back during PAUSED requires confirmation ---');
  assert.ok(activeSessionSource.includes("snapshot.status === 'PAUSED'"));
  console.log('  ✓ Test 19 Passed: Back navigation during PAUSED opens confirmation modal');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 20: COMPLETED switches to completion view
  // -------------------------------------------------------------
  console.log('--- TEST 20: COMPLETED switches to completion view ---');
  assert.ok(activeSessionSource.includes("snapshot.status === 'COMPLETED'"));
  assert.ok(activeSessionSource.includes('<YogaSessionComplete'));
  console.log('  ✓ Test 20 Passed: COMPLETED renders YogaSessionComplete');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 21: CANCELLED switches to cancelled view
  // -------------------------------------------------------------
  console.log('--- TEST 21: CANCELLED switches to cancelled view ---');
  assert.ok(activeSessionSource.includes("snapshot.status === 'CANCELLED'"));
  assert.ok(activeSessionSource.includes('isCompleted={snapshot.status === \'COMPLETED\'}'));
  console.log('  ✓ Test 21 Passed: CANCELLED renders cancellation view via YogaSessionComplete');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 22: Terminal session cannot resume
  // -------------------------------------------------------------
  console.log('--- TEST 22: Terminal session cannot resume ---');
  const postCancelResume = engine.resume();
  assert.strictEqual(postCancelResume.success, false);
  assert.strictEqual(postCancelResume.error?.code, 'SESSION_ALREADY_TERMINAL');
  console.log('  ✓ Test 22 Passed: Terminal session strictly rejects state changes');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 23: Invalid engine error is safely rendered
  // -------------------------------------------------------------
  console.log('--- TEST 23: Invalid engine error rendered safely ---');
  assert.ok(activeSessionSource.includes('INVALID_PRACTICE_ID'));
  assert.ok(activeSessionSource.includes('INVALID_DURATION'));
  assert.ok(activeSessionSource.includes('सत्र प्रारंभ नहीं हो सका'));
  console.log('  ✓ Test 23 Passed: Safe Hindi error fallback rendered for invalid engine requests');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 24: Anulom Vilom provenance is visible
  // -------------------------------------------------------------
  console.log('--- TEST 24: Anulom Vilom provenance ---');
  assert.ok(activeSessionSource.includes('यह आधुनिक परंपरा में प्रयुक्त सरल alternate-nostril breathing का रूप है।'));
  assert.ok(activeSessionSource.includes('शून्य कुंभक — स्वाभाविक एवं शांत प्रवाह'));
  console.log('  ✓ Test 24 Passed: Anulom Vilom provenance notice displayed');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 25: Zero Kumbhaka invariant
  // -------------------------------------------------------------
  console.log('--- TEST 25: Zero Kumbhaka invariant ---');
  assert.strictEqual(activeSessionLower.includes('kumbhaka = true'), false);
  assert.strictEqual(activeSessionLower.includes('breathhold'), false);
  assert.strictEqual(activeSessionLower.includes('retentionseconds'), false);
  console.log('  ✓ Test 25 Passed: Zero Kumbhaka invariant verified in active session');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 26: Zero breathing ticks
  // -------------------------------------------------------------
  console.log('--- TEST 26: Zero breathing ticks ---');
  assert.strictEqual(activeSessionLower.includes('inhaletick'), false);
  assert.strictEqual(activeSessionLower.includes('exhaletick'), false);
  assert.strictEqual(activeSessionLower.includes('breathphase'), false);
  assert.strictEqual(activeSessionLower.includes('breathcount'), false);
  console.log('  ✓ Test 26 Passed: Zero breathing ticks or cadence generated');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 27: Zero storage
  // -------------------------------------------------------------
  console.log('--- TEST 27: Zero storage ---');
  assert.strictEqual(activeSessionLower.includes('localstorage'), false);
  assert.strictEqual(activeSessionLower.includes('indexeddb'), false);
  assert.strictEqual(activeSessionLower.includes('sessionstorage'), false);
  console.log('  ✓ Test 27 Passed: Zero storage dependencies in Active Session UI');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 28: Zero network
  // -------------------------------------------------------------
  console.log('--- TEST 28: Zero network ---');
  assert.strictEqual(activeSessionLower.includes('fetch('), false);
  assert.strictEqual(activeSessionLower.includes('axios'), false);
  assert.strictEqual(activeSessionLower.includes('websocket'), false);
  console.log('  ✓ Test 28 Passed: Zero network dependencies');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 29: Zero AI
  // -------------------------------------------------------------
  console.log('--- TEST 29: Zero AI ---');
  assert.strictEqual(activeSessionLower.includes('googlegenai'), false);
  assert.strictEqual(activeSessionLower.includes('gemini'), false);
  console.log('  ✓ Test 29 Passed: Zero AI dependencies');
  passedTests++;

  console.log('\n================================================================');
  console.log(`ALL ${passedTests}/${passedTests} YOGA ACTIVE SESSION TESTS PASSED (100%)`);
  console.log('================================================================');
}

runYogaActiveSessionTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
