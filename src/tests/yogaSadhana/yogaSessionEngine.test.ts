/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA SESSION ENGINE TEST SUITE
 * PHASE 1.15F-A: STRICT DETERMINISTIC CORE ENGINE VERIFICATION
 */

import assert from 'node:assert';
import { YogaSessionEngine, createYogaSession } from '../../services/yogaSadhana/yogaSessionEngine';
import { YogaSessionClock, YogaSessionSnapshot } from '../../types/yogaSadhana/yogaSessionTypes';

class TestClock implements YogaSessionClock {
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

async function runYogaSessionEngineTestSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.15F-A: YOGA SESSION ENGINE TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;

  // -------------------------------------------------------------
  // TEST 1: Initial state = IDLE
  // -------------------------------------------------------------
  console.log('--- TEST 1: Initial state = IDLE ---');
  const clock1 = new TestClock();
  const res1 = YogaSessionEngine.create({
    practiceId: 'shavasana',
    targetDurationSeconds: 300,
    clock: clock1,
    autoTick: false
  });
  assert.strictEqual(res1.success, true);
  const engine1 = res1.data!;
  const snap1 = engine1.getSnapshot();
  assert.strictEqual(snap1.status, 'IDLE');
  assert.strictEqual(snap1.elapsedSeconds, 0);
  assert.strictEqual(snap1.remainingSeconds, 300);
  assert.strictEqual(snap1.progressRatio, 0);
  console.log('  ✓ Test 1 Passed: Initial session state is strictly IDLE');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 2: Valid start -> PREPARING
  // -------------------------------------------------------------
  console.log('--- TEST 2: Valid start -> PREPARING ---');
  const startRes = engine1.start();
  assert.strictEqual(startRes.success, true);
  const snap2 = engine1.getSnapshot();
  assert.strictEqual(snap2.status, 'PREPARING');
  assert.strictEqual(snap2.preparingRemainingSeconds, 3);
  assert.strictEqual(snap2.elapsedSeconds, 0);
  assert.strictEqual(snap2.remainingSeconds, 300);
  console.log('  ✓ Test 2 Passed: Starting transition sets state to PREPARING with 3s countdown');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 3: PREPARING -> ACTIVE after 3 seconds
  // -------------------------------------------------------------
  console.log('--- TEST 3: PREPARING -> ACTIVE after 3 seconds ---');
  clock1.advance(1000);
  engine1.tick();
  assert.strictEqual(engine1.getSnapshot().status, 'PREPARING');
  assert.strictEqual(engine1.getSnapshot().preparingRemainingSeconds, 2);

  clock1.advance(2000); // reaches 3000ms
  engine1.tick();
  const snap3 = engine1.getSnapshot();
  assert.strictEqual(snap3.status, 'ACTIVE');
  assert.strictEqual(snap3.preparingRemainingSeconds, 0);
  console.log('  ✓ Test 3 Passed: Transitions to ACTIVE after exactly 3 seconds');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 4: Preparation time excluded from target practice duration
  // -------------------------------------------------------------
  console.log('--- TEST 4: Preparation time excluded from practice duration ---');
  // Immediately upon entering ACTIVE, elapsed practice time must be 0
  assert.strictEqual(snap3.elapsedSeconds, 0);
  assert.strictEqual(snap3.remainingSeconds, 300);
  console.log('  ✓ Test 4 Passed: Preparation time does not count toward practice duration');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 5: ACTIVE elapsed-time calculation
  // -------------------------------------------------------------
  console.log('--- TEST 5: ACTIVE elapsed-time calculation ---');
  clock1.advance(45000); // 45 seconds of active practice
  engine1.tick();
  const snap5 = engine1.getSnapshot();
  assert.strictEqual(snap5.elapsedSeconds, 45);
  assert.strictEqual(snap5.remainingSeconds, 255);
  assert.strictEqual(snap5.progressRatio, 45 / 300);
  console.log('  ✓ Test 5 Passed: Active elapsed time accurately derived from timestamps');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 6: Pause from ACTIVE
  // -------------------------------------------------------------
  console.log('--- TEST 6: Pause from ACTIVE ---');
  const pauseRes = engine1.pause();
  assert.strictEqual(pauseRes.success, true);
  const snap6 = engine1.getSnapshot();
  assert.strictEqual(snap6.status, 'PAUSED');
  assert.strictEqual(snap6.elapsedSeconds, 45);
  console.log('  ✓ Test 6 Passed: Pause transitions to PAUSED cleanly');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 7: Elapsed time freezes while PAUSED
  // -------------------------------------------------------------
  console.log('--- TEST 7: Elapsed time freezes while PAUSED ---');
  clock1.advance(30000); // 30 seconds elapse while paused
  engine1.tick();
  const snap7 = engine1.getSnapshot();
  assert.strictEqual(snap7.status, 'PAUSED');
  assert.strictEqual(snap7.elapsedSeconds, 45, 'Elapsed seconds must remain frozen while paused');
  console.log('  ✓ Test 7 Passed: Elapsed practice duration freezes completely during pause');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 8: Resume from PAUSED
  // -------------------------------------------------------------
  console.log('--- TEST 8: Resume from PAUSED ---');
  const resumeRes = engine1.resume();
  assert.strictEqual(resumeRes.success, true);
  const snap8 = engine1.getSnapshot();
  assert.strictEqual(snap8.status, 'ACTIVE');
  assert.strictEqual(snap8.elapsedSeconds, 45);
  console.log('  ✓ Test 8 Passed: Resume transitions back to ACTIVE cleanly');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 9: Paused duration excluded from future elapsed time
  // -------------------------------------------------------------
  console.log('--- TEST 9: Paused duration excluded ---');
  clock1.advance(15000); // 15 more active seconds
  engine1.tick();
  const snap9 = engine1.getSnapshot();
  // Total real time elapsed = 3s prep + 45s active + 30s paused + 15s active = 93s
  // But active practice time = 45s + 15s = 60s
  assert.strictEqual(snap9.elapsedSeconds, 60);
  assert.strictEqual(snap9.remainingSeconds, 240);
  console.log('  ✓ Test 9 Passed: Paused interval strictly excluded from practice time');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 10: Completion when elapsedSeconds >= targetDurationSeconds
  // -------------------------------------------------------------
  console.log('--- TEST 10: Completion when elapsedSeconds >= targetDurationSeconds ---');
  clock1.advance(240000); // 240 more seconds (total active = 300s)
  engine1.tick();
  const snap10 = engine1.getSnapshot();
  assert.strictEqual(snap10.status, 'COMPLETED');
  assert.strictEqual(snap10.elapsedSeconds, 300);
  assert.strictEqual(snap10.remainingSeconds, 0);
  assert.strictEqual(snap10.progressRatio, 1);
  console.log('  ✓ Test 10 Passed: Deterministically transitions to COMPLETED at target duration');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 11: Completion despite delayed timer callback (e.g., wake at 304s)
  // -------------------------------------------------------------
  console.log('--- TEST 11: Completion despite delayed callback ---');
  const clock11 = new TestClock();
  const engine11 = YogaSessionEngine.create({
    practiceId: 'sukhasana',
    targetDurationSeconds: 180,
    clock: clock11,
    autoTick: false
  }).data!;
  engine11.start();
  clock11.advance(3000); // finish prep
  engine11.tick();
  assert.strictEqual(engine11.getSnapshot().status, 'ACTIVE');
  // Browser sleeps and wakes up 195 seconds later (15s past target 180s)
  clock11.advance(195000);
  engine11.tick();
  const snap11 = engine11.getSnapshot();
  assert.strictEqual(snap11.status, 'COMPLETED');
  assert.strictEqual(snap11.elapsedSeconds, 180, 'Elapsed seconds clamps cleanly to target duration');
  assert.strictEqual(snap11.remainingSeconds, 0);
  console.log('  ✓ Test 11 Passed: Handles throttled/delayed timer callbacks without failure');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 12: Cancel during PREPARING
  // -------------------------------------------------------------
  console.log('--- TEST 12: Cancel during PREPARING ---');
  const clock12 = new TestClock();
  const engine12 = YogaSessionEngine.create({
    practiceId: 'tadasana',
    targetDurationSeconds: 180,
    clock: clock12,
    autoTick: false
  }).data!;
  engine12.start();
  assert.strictEqual(engine12.getSnapshot().status, 'PREPARING');
  const cancelPrep = engine12.cancel();
  assert.strictEqual(cancelPrep.success, true);
  assert.strictEqual(engine12.getSnapshot().status, 'CANCELLED');
  console.log('  ✓ Test 12 Passed: Cancel during PREPARING cleanly transitions to CANCELLED');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 13: Cancel during ACTIVE
  // -------------------------------------------------------------
  console.log('--- TEST 13: Cancel during ACTIVE ---');
  const clock13 = new TestClock();
  const engine13 = YogaSessionEngine.create({
    practiceId: 'tadasana',
    targetDurationSeconds: 180,
    clock: clock13,
    autoTick: false
  }).data!;
  engine13.start();
  clock13.advance(3000);
  engine13.tick();
  assert.strictEqual(engine13.getSnapshot().status, 'ACTIVE');
  const cancelActive = engine13.cancel();
  assert.strictEqual(cancelActive.success, true);
  assert.strictEqual(engine13.getSnapshot().status, 'CANCELLED');
  console.log('  ✓ Test 13 Passed: Cancel during ACTIVE transitions to CANCELLED');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 14: Cancel during PAUSED
  // -------------------------------------------------------------
  console.log('--- TEST 14: Cancel during PAUSED ---');
  const clock14 = new TestClock();
  const engine14 = YogaSessionEngine.create({
    practiceId: 'anulom_vilom',
    targetDurationSeconds: 300,
    clock: clock14,
    autoTick: false
  }).data!;
  engine14.start();
  clock14.advance(3000);
  engine14.tick();
  engine14.pause();
  assert.strictEqual(engine14.getSnapshot().status, 'PAUSED');
  const cancelPaused = engine14.cancel();
  assert.strictEqual(cancelPaused.success, true);
  assert.strictEqual(engine14.getSnapshot().status, 'CANCELLED');
  console.log('  ✓ Test 14 Passed: Cancel during PAUSED transitions to CANCELLED');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 15: Terminal COMPLETED cannot resume or restart
  // -------------------------------------------------------------
  console.log('--- TEST 15: Terminal COMPLETED cannot resume or restart ---');
  const startAfterComplete = engine10_attempt(engine1);
  assert.strictEqual(startAfterComplete.startResult.success, false);
  assert.strictEqual(startAfterComplete.startResult.error?.code, 'SESSION_ALREADY_TERMINAL');
  assert.strictEqual(startAfterComplete.resumeResult.success, false);
  assert.strictEqual(startAfterComplete.resumeResult.error?.code, 'SESSION_ALREADY_TERMINAL');
  console.log('  ✓ Test 15 Passed: COMPLETED state is strictly terminal and non-resumable');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 16: Terminal CANCELLED cannot resume or restart
  // -------------------------------------------------------------
  console.log('--- TEST 16: Terminal CANCELLED cannot resume or restart ---');
  const resumeCancelled = engine14.resume();
  assert.strictEqual(resumeCancelled.success, false);
  assert.strictEqual(resumeCancelled.error?.code, 'SESSION_ALREADY_TERMINAL');
  const startCancelled = engine14.start();
  assert.strictEqual(startCancelled.success, false);
  assert.strictEqual(startCancelled.error?.code, 'SESSION_ALREADY_TERMINAL');
  console.log('  ✓ Test 16 Passed: CANCELLED state is strictly terminal');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 17: Invalid practice ID rejected
  // -------------------------------------------------------------
  console.log('--- TEST 17: Invalid practice ID rejected ---');
  const invalidIdRes = createYogaSession({
    practiceId: 'non_existent_practice',
    targetDurationSeconds: 300
  });
  assert.strictEqual(invalidIdRes.success, false);
  assert.strictEqual(invalidIdRes.error?.code, 'INVALID_PRACTICE_ID');
  console.log('  ✓ Test 17 Passed: Invalid practice ID rejected with INVALID_PRACTICE_ID');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 18: Invalid duration rejected
  // -------------------------------------------------------------
  console.log('--- TEST 18: Invalid duration rejected ---');
  const invalidDurRes = createYogaSession({
    practiceId: 'tadasana',
    targetDurationSeconds: 9999 // not in allowedDurationsSeconds [180, 300]
  });
  assert.strictEqual(invalidDurRes.success, false);
  assert.strictEqual(invalidDurRes.error?.code, 'INVALID_DURATION');
  console.log('  ✓ Test 18 Passed: Unapproved duration rejected with INVALID_DURATION');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 19: Unsupported duration rejected for specific practice
  // -------------------------------------------------------------
  console.log('--- TEST 19: Unsupported duration for specific practice ---');
  // Tadasana allows [180, 300] but does NOT allow 600s
  const tadasana600 = createYogaSession({
    practiceId: 'tadasana',
    targetDurationSeconds: 600
  });
  assert.strictEqual(tadasana600.success, false);
  assert.strictEqual(tadasana600.error?.code, 'INVALID_DURATION');
  console.log('  ✓ Test 19 Passed: Practice-specific duration enforcement verified');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 20: Invalid state transitions rejected
  // -------------------------------------------------------------
  console.log('--- TEST 20: Invalid state transitions rejected ---');
  const clock20 = new TestClock();
  const engine20 = YogaSessionEngine.create({
    practiceId: 'shavasana',
    targetDurationSeconds: 300,
    clock: clock20,
    autoTick: false
  }).data!;
  // Pause while IDLE
  const pauseIdle = engine20.pause();
  assert.strictEqual(pauseIdle.success, false);
  assert.strictEqual(pauseIdle.error?.code, 'SESSION_NOT_ACTIVE');
  // Resume while IDLE
  const resumeIdle = engine20.resume();
  assert.strictEqual(resumeIdle.success, false);
  assert.strictEqual(resumeIdle.error?.code, 'SESSION_NOT_PAUSED');
  // Cancel while IDLE
  const cancelIdle = engine20.cancel();
  assert.strictEqual(cancelIdle.success, false);
  assert.strictEqual(cancelIdle.error?.code, 'INVALID_STATE_TRANSITION');
  console.log('  ✓ Test 20 Passed: Out-of-order state transitions strictly rejected');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 21: Multiple subscribers receive snapshots
  // -------------------------------------------------------------
  console.log('--- TEST 21: Multiple subscribers receive snapshots ---');
  const clock21 = new TestClock();
  const engine21 = YogaSessionEngine.create({
    practiceId: 'anulom_vilom',
    targetDurationSeconds: 300,
    clock: clock21,
    autoTick: false
  }).data!;
  let sub1Count = 0;
  let sub2Count = 0;
  engine21.subscribe(() => { sub1Count++; });
  engine21.subscribe(() => { sub2Count++; });
  engine21.start();
  assert.ok(sub1Count >= 2, 'Subscriber 1 must receive initial and transition snapshots');
  assert.ok(sub2Count >= 2, 'Subscriber 2 must receive initial and transition snapshots');
  console.log('  ✓ Test 21 Passed: Multi-subscriber dispatch confirmed');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 22: Unsubscribe works cleanly
  // -------------------------------------------------------------
  console.log('--- TEST 22: Unsubscribe works cleanly ---');
  let sub3Count = 0;
  const unsub3 = engine21.subscribe(() => { sub3Count++; });
  const countBeforeUnsub = sub3Count;
  unsub3();
  clock21.advance(3000);
  engine21.tick();
  assert.strictEqual(sub3Count, countBeforeUnsub, 'Unsubscribed listener must receive no further snapshots');
  console.log('  ✓ Test 22 Passed: Unsubscribe terminates listener dispatch');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 23: Listener exception does not break engine
  // -------------------------------------------------------------
  console.log('--- TEST 23: Listener exception isolation ---');
  let healthySubReceived = false;
  engine21.subscribe(() => {
    throw new Error('Exploding subscriber!');
  });
  engine21.subscribe(() => {
    healthySubReceived = true;
  });
  assert.doesNotThrow(() => {
    engine21.pause();
  }, 'Failing subscriber must not crash the engine');
  assert.strictEqual(healthySubReceived, true, 'Healthy subscriber still receives snapshot despite peer error');
  console.log('  ✓ Test 23 Passed: Listener exceptions isolated gracefully');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 24: Timer cleanup after COMPLETED
  // -------------------------------------------------------------
  console.log('--- TEST 24: Timer cleanup after COMPLETED ---');
  const clock24 = new TestClock();
  const engine24 = YogaSessionEngine.create({
    practiceId: 'shavasana',
    targetDurationSeconds: 180,
    clock: clock24,
    autoTick: true,
    tickIntervalMs: 50
  }).data!;
  engine24.start();
  clock24.advance(3000);
  engine24.tick();
  clock24.advance(180000);
  engine24.tick();
  assert.strictEqual(engine24.getSnapshot().status, 'COMPLETED');
  // Access private timerHandle to confirm it was cleared
  assert.strictEqual((engine24 as any).timerHandle, null, 'Timer handle must be cleared on completion');
  console.log('  ✓ Test 24 Passed: Interval timer cleaned up upon COMPLETED');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 25: Timer cleanup after CANCELLED
  // -------------------------------------------------------------
  console.log('--- TEST 25: Timer cleanup after CANCELLED ---');
  const clock25 = new TestClock();
  const engine25 = YogaSessionEngine.create({
    practiceId: 'sukhasana',
    targetDurationSeconds: 180,
    clock: clock25,
    autoTick: true,
    tickIntervalMs: 50
  }).data!;
  engine25.start();
  engine25.cancel();
  assert.strictEqual(engine25.getSnapshot().status, 'CANCELLED');
  assert.strictEqual((engine25 as any).timerHandle, null, 'Timer handle must be cleared on cancellation');
  console.log('  ✓ Test 25 Passed: Interval timer cleaned up upon CANCELLED');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 26: Zero storage calls (localStorage / IndexedDB)
  // -------------------------------------------------------------
  console.log('--- TEST 26: Zero storage dependencies ---');
  const fs = await import('node:fs');
  const path = await import('node:path');
  const engineSource = fs.readFileSync(path.resolve(process.cwd(), 'src/services/yogaSadhana/yogaSessionEngine.ts'), 'utf8');
  assert.strictEqual(engineSource.includes('localStorage'), false, 'localStorage must not exist in session engine');
  assert.strictEqual(engineSource.includes('sessionStorage'), false, 'sessionStorage must not exist in session engine');
  assert.strictEqual(engineSource.includes('indexedDB'), false, 'indexedDB must not exist in session engine');
  console.log('  ✓ Test 26 Passed: Zero storage calls confirmed');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 27: Zero network calls
  // -------------------------------------------------------------
  console.log('--- TEST 27: Zero network calls ---');
  assert.strictEqual(engineSource.includes('fetch('), false, 'fetch() must not exist in session engine');
  assert.strictEqual(engineSource.includes('axios'), false, 'axios must not exist in session engine');
  assert.strictEqual(engineSource.includes('WebSocket'), false, 'WebSocket must not exist in session engine');
  console.log('  ✓ Test 27 Passed: Zero network calls confirmed');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 28: Zero AI calls
  // -------------------------------------------------------------
  console.log('--- TEST 28: Zero AI calls ---');
  assert.strictEqual(engineSource.includes('@google/genai'), false, '@google/genai must not exist in session engine');
  assert.strictEqual(engineSource.includes('Gemini'), false, 'Gemini must not exist in session engine');
  console.log('  ✓ Test 28 Passed: Zero AI calls confirmed');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 29: Anulom Vilom does not generate breathing ticks
  // -------------------------------------------------------------
  console.log('--- TEST 29: Anulom Vilom does not generate breathing ticks ---');
  assert.strictEqual(engineSource.includes('inhale'), false, 'Inhale cycles must not exist in session engine');
  assert.strictEqual(engineSource.includes('exhale'), false, 'Exhale cycles must not exist in session engine');
  assert.strictEqual(engineSource.includes('breathCount'), false, 'Breath count must not exist in session engine');
  console.log('  ✓ Test 29 Passed: Engine tracks overall session duration only, zero breathing ticks');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 30: Zero-Kumbhaka invariant intact
  // -------------------------------------------------------------
  console.log('--- TEST 30: Zero-Kumbhaka invariant ---');
  assert.strictEqual(engineSource.includes('kumbhaka'), false, 'Kumbhaka must never be referenced in session engine');
  assert.strictEqual(engineSource.includes('retention'), false, 'Breath retention must never be referenced');
  console.log('  ✓ Test 30 Passed: Zero-Kumbhaka invariant preserved');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 31: Background/delayed callback timing mathematically correct
  // -------------------------------------------------------------
  console.log('--- TEST 31: Background/delayed callback timing accuracy ---');
  const clock31 = new TestClock();
  const engine31 = YogaSessionEngine.create({
    practiceId: 'anulom_vilom',
    targetDurationSeconds: 600,
    clock: clock31,
    autoTick: false
  }).data!;
  engine31.start();
  clock31.advance(3000);
  engine31.tick();
  // Simulate phone lock for 250 seconds with 0 ticks in between
  clock31.advance(250000);
  engine31.tick();
  const snap31 = engine31.getSnapshot();
  assert.strictEqual(snap31.elapsedSeconds, 250);
  assert.strictEqual(snap31.remainingSeconds, 350);
  console.log('  ✓ Test 31 Passed: Monotonic clock ensures exact wall-clock elapsed time without tick dependence');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 32: Multiple sessions are isolated
  // -------------------------------------------------------------
  console.log('--- TEST 32: Multiple sessions are isolated ---');
  const clockA = new TestClock(100);
  const clockB = new TestClock(500);
  const sessA = YogaSessionEngine.create({ practiceId: 'shavasana', targetDurationSeconds: 180, clock: clockA, autoTick: false }).data!;
  const sessB = YogaSessionEngine.create({ practiceId: 'tadasana', targetDurationSeconds: 300, clock: clockB, autoTick: false }).data!;
  sessA.start();
  assert.strictEqual(sessA.getSnapshot().status, 'PREPARING');
  assert.strictEqual(sessB.getSnapshot().status, 'IDLE');
  console.log('  ✓ Test 32 Passed: Independent session instances do not bleed state');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 33: Session IDs are unique
  // -------------------------------------------------------------
  console.log('--- TEST 33: Session ID uniqueness ---');
  const idSet = new Set<string>();
  for (let i = 0; i < 50; i++) {
    const s = YogaSessionEngine.create({ practiceId: 'shavasana', targetDurationSeconds: 180, autoTick: false }).data!;
    const id = s.getSnapshot().sessionId;
    assert.strictEqual(idSet.has(id), false, `Duplicate session ID: ${id}`);
    idSet.add(id);
  }
  assert.strictEqual(idSet.size, 50);
  console.log('  ✓ Test 33 Passed: Unique local session IDs verified across 50 instances');
  passedTests++;

  console.log('\n================================================================');
  console.log(`ALL ${passedTests}/${passedTests} YOGA SESSION ENGINE TESTS PASSED (100%)`);
  console.log('================================================================');
}

function engine10_attempt(engine: YogaSessionEngine) {
  return {
    startResult: engine.start(),
    resumeResult: engine.resume()
  };
}

runYogaSessionEngineTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
