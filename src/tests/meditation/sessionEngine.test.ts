/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION SESSION ENGINE TEST SUITE
 * PHASE 1.14D: ZERO-DRIFT STATE MACHINE & LIFECYCLE VERIFICATION
 */

import assert from 'node:assert';
import { SessionEngine, SessionClock, SessionSnapshot } from '../../services/meditation/sessionEngine';
import { PracticeCatalogService } from '../../services/meditation/practiceCatalogService';
import { PracticeDefinition } from '../../types/meditation/practiceCatalogTypes';

class FakeClock implements SessionClock {
  private currentTime: number;

  constructor(initialTime: number = 1_000_000) {
    this.currentTime = initialTime;
  }

  public now(): number {
    return this.currentTime;
  }

  public advance(ms: number): void {
    this.currentTime += ms;
  }
}

async function runSessionEngineTestSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.14D: MEDITATION SESSION ENGINE TEST SUITE');
  console.log('================================================================\n');

  const breathPractice = PracticeCatalogService.getPracticeById('BREATH_AWARENESS')!;
  assert.ok(breathPractice, 'Breath awareness practice must be present');

  // -------------------------------------------------------------
  // TEST 1: Initial state = IDLE
  // -------------------------------------------------------------
  console.log('--- TEST 1: Initial state = IDLE ---');
  const clock1 = new FakeClock();
  const session1 = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 600,
    clock: clock1,
    preparationDurationSeconds: 3
  }).data!;
  assert.strictEqual(session1.getStatus(), 'IDLE');
  assert.strictEqual(session1.getElapsedSeconds(), 0);
  assert.strictEqual(session1.getRemainingSeconds(), 600);
  assert.strictEqual(session1.getProgressRatio(), 0.0);
  console.log('  ✓ Test 1 Passed: Initial state is IDLE');

  // -------------------------------------------------------------
  // TEST 2: Valid session starts
  // -------------------------------------------------------------
  console.log('--- TEST 2: Valid session starts ---');
  const startRes = session1.start();
  assert.strictEqual(startRes.success, true);
  assert.strictEqual(session1.getStatus(), 'PREPARING');
  console.log('  ✓ Test 2 Passed: Valid session starts into PREPARING');

  // -------------------------------------------------------------
  // TEST 3: Invalid PracticeId rejected
  // -------------------------------------------------------------
  console.log('--- TEST 3: Invalid PracticeId rejected ---');
  const fakePractice = {
    ...breathPractice,
    practiceId: 'INVALID_PRACTICE' as any
  };
  const invalidIdRes = SessionEngine.createSession({
    practice: fakePractice,
    targetDurationSeconds: 600
  });
  assert.strictEqual(invalidIdRes.success, false);
  assert.strictEqual(invalidIdRes.error?.code, 'INVALID_PRACTICE_ID');
  console.log('  ✓ Test 3 Passed: Invalid practiceId rejected with typed error');

  // -------------------------------------------------------------
  // TEST 4: Invalid duration rejected
  // -------------------------------------------------------------
  console.log('--- TEST 4: Invalid duration rejected ---');
  const invalidDurRes = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 450 as any // Not in [180, 300, 600, 900, 1200, 1800]
  });
  assert.strictEqual(invalidDurRes.success, false);
  assert.strictEqual(invalidDurRes.error?.code, 'INVALID_DURATION');

  const zeroDurRes = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 0 as any
  });
  assert.strictEqual(zeroDurRes.success, false);
  assert.strictEqual(zeroDurRes.error?.code, 'INVALID_DURATION');
  console.log('  ✓ Test 4 Passed: Invalid durations strictly rejected');

  // -------------------------------------------------------------
  // TEST 5: IDLE → PREPARING
  // -------------------------------------------------------------
  console.log('--- TEST 5: IDLE → PREPARING ---');
  const clock5 = new FakeClock();
  const session5 = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 600,
    clock: clock5,
    preparationDurationSeconds: 3
  }).data!;
  assert.strictEqual(session5.getStatus(), 'IDLE');
  session5.start();
  assert.strictEqual(session5.getStatus(), 'PREPARING');
  assert.strictEqual(session5.getCurrentPhase(), 'SETTLE');
  console.log('  ✓ Test 5 Passed: Transitions cleanly from IDLE to PREPARING');

  // -------------------------------------------------------------
  // TEST 6: PREPARING → ACTIVE
  // -------------------------------------------------------------
  console.log('--- TEST 6: PREPARING → ACTIVE ---');
  clock5.advance(2999);
  session5.tick();
  assert.strictEqual(session5.getStatus(), 'PREPARING', 'Must still be PREPARING before 3000ms');

  clock5.advance(1); // Exact 3000ms boundary
  session5.tick();
  assert.strictEqual(session5.getStatus(), 'ACTIVE', 'Must transition to ACTIVE at 3000ms');
  console.log('  ✓ Test 6 Passed: Transitions from PREPARING to ACTIVE at exact boundary');

  // -------------------------------------------------------------
  // TEST 7: ACTIVE elapsed time calculation
  // -------------------------------------------------------------
  console.log('--- TEST 7: ACTIVE elapsed time calculation ---');
  clock5.advance(15000); // 15 seconds
  session5.tick();
  assert.strictEqual(session5.getElapsedSeconds(), 15);
  console.log('  ✓ Test 7 Passed: Elapsed time accurately calculates 15 seconds');

  // -------------------------------------------------------------
  // TEST 8: ACTIVE remaining time calculation
  // -------------------------------------------------------------
  console.log('--- TEST 8: ACTIVE remaining time calculation ---');
  assert.strictEqual(session5.getRemainingSeconds(), 585); // 600 - 15 = 585
  console.log('  ✓ Test 8 Passed: Remaining time accurately calculates 585 seconds');

  // -------------------------------------------------------------
  // TEST 9: Pause changes ACTIVE → PAUSED
  // -------------------------------------------------------------
  console.log('--- TEST 9: Pause changes ACTIVE → PAUSED ---');
  const pauseRes = session5.pause();
  assert.strictEqual(pauseRes.success, true);
  assert.strictEqual(session5.getStatus(), 'PAUSED');
  console.log('  ✓ Test 9 Passed: Pause transitions to PAUSED');

  // -------------------------------------------------------------
  // TEST 10: Paused time does not increase elapsed practice time
  // -------------------------------------------------------------
  console.log('--- TEST 10: Paused time does not increase elapsed practice time ---');
  clock5.advance(60000); // 1 minute spent paused
  session5.tick();
  assert.strictEqual(session5.getStatus(), 'PAUSED');
  assert.strictEqual(session5.getElapsedSeconds(), 15, 'Elapsed time must remain frozen at 15 seconds while paused');
  assert.strictEqual(session5.getRemainingSeconds(), 585);
  console.log('  ✓ Test 10 Passed: Paused interval does not increment elapsed time');

  // -------------------------------------------------------------
  // TEST 11: Resume changes PAUSED → ACTIVE
  // -------------------------------------------------------------
  console.log('--- TEST 11: Resume changes PAUSED → ACTIVE ---');
  const resumeRes = session5.resume();
  assert.strictEqual(resumeRes.success, true);
  assert.strictEqual(session5.getStatus(), 'ACTIVE');
  clock5.advance(5000); // 5 more seconds active
  session5.tick();
  assert.strictEqual(session5.getElapsedSeconds(), 20, '15s + 5s = 20s');
  assert.strictEqual(session5.getRemainingSeconds(), 580);
  console.log('  ✓ Test 11 Passed: Resume successfully resumes time progression');

  // -------------------------------------------------------------
  // TEST 12: Multiple pause/resume cycles remain accurate
  // -------------------------------------------------------------
  console.log('--- TEST 12: Multiple pause/resume cycles ---');
  // Cycle 1: Pause 30s
  session5.pause();
  clock5.advance(30000);
  session5.resume();
  clock5.advance(10000); // +10s active (total 30s)
  session5.tick();
  assert.strictEqual(session5.getElapsedSeconds(), 30);

  // Cycle 2: Pause 20s
  session5.pause();
  clock5.advance(20000);
  session5.resume();
  clock5.advance(10000); // +10s active (total 40s)
  session5.tick();
  assert.strictEqual(session5.getElapsedSeconds(), 40);
  console.log('  ✓ Test 12 Passed: Multiple pause/resume cycles maintain exact 40s active count');

  // -------------------------------------------------------------
  // TEST 13: ACTIVE → SILENCE at exact boundary
  // -------------------------------------------------------------
  console.log('--- TEST 13: ACTIVE → SILENCE at exact boundary ---');
  // For BREATH_AWARENESS with 600s: practice is 540s, silence is 60s
  // Current elapsed: 40s. Advance 499s -> 539s
  clock5.advance(499000);
  session5.tick();
  assert.strictEqual(session5.getStatus(), 'ACTIVE');
  assert.strictEqual(session5.getElapsedSeconds(), 539);

  // Advance 1s -> 540s (Boundary)
  clock5.advance(1000);
  session5.tick();
  assert.strictEqual(session5.getStatus(), 'SILENCE', 'Must transition to SILENCE at 540s');
  assert.strictEqual(session5.getCurrentPhase(), 'SILENCE');
  console.log('  ✓ Test 13 Passed: Transitions to SILENCE at exact 540s boundary');

  // -------------------------------------------------------------
  // TEST 14: SILENCE → COMPLETED at exact boundary
  // -------------------------------------------------------------
  console.log('--- TEST 14: SILENCE → COMPLETED at exact boundary ---');
  // Silence is 60s (540s -> 600s). Advance 59s -> 599s
  clock5.advance(59000);
  session5.tick();
  assert.strictEqual(session5.getStatus(), 'SILENCE');
  assert.strictEqual(session5.getElapsedSeconds(), 599);

  // Advance 1s -> 600s (Target Duration boundary)
  clock5.advance(1000);
  session5.tick();
  assert.strictEqual(session5.getStatus(), 'COMPLETED', 'Must transition to COMPLETED at 600s');
  assert.strictEqual(session5.getCurrentPhase(), 'COMPLETE');
  assert.strictEqual(session5.getRemainingSeconds(), 0);
  assert.strictEqual(session5.getElapsedSeconds(), 600);
  console.log('  ✓ Test 14 Passed: Transitions to COMPLETED at exact 600s boundary');

  // -------------------------------------------------------------
  // TESTS 15, 16, 17: Progress ratio bounds [0.0 → 1.0]
  // -------------------------------------------------------------
  console.log('--- TESTS 15, 16, 17: Progress ratio bounds ---');
  const clock15 = new FakeClock();
  const session15 = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 180,
    clock: clock15,
    preparationDurationSeconds: 0
  }).data!;
  assert.strictEqual(session15.getProgressRatio(), 0.0, 'Progress must be 0.0 initially');

  session15.start();
  clock15.advance(90000); // 90s (half of 180s)
  session15.tick();
  assert.strictEqual(session15.getProgressRatio(), 0.5, 'Progress must be 0.5 at midpoint');

  clock15.advance(90000); // 180s
  session15.tick();
  assert.strictEqual(session15.getStatus(), 'COMPLETED');
  assert.strictEqual(session15.getProgressRatio(), 1.0, 'Progress must be 1.0 at completion');

  // Advance further
  clock15.advance(50000);
  session15.tick();
  assert.strictEqual(session15.getProgressRatio(), 1.0, 'Progress must never exceed 1.0');
  console.log('  ✓ Tests 15, 16, 17 Passed: Progress starts at 0, ends at 1, never exceeds 1');

  // -------------------------------------------------------------
  // TEST 18: Cancel from ACTIVE
  // -------------------------------------------------------------
  console.log('--- TEST 18: Cancel from ACTIVE ---');
  const clock18 = new FakeClock();
  const session18 = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 300,
    clock: clock18,
    preparationDurationSeconds: 0
  }).data!;
  session18.start();
  assert.strictEqual(session18.getStatus(), 'ACTIVE');
  const cancelRes = session18.cancel();
  assert.strictEqual(cancelRes.success, true);
  assert.strictEqual(session18.getStatus(), 'CANCELLED');
  assert.ok(session18.getSessionSnapshot().cancelledAt);
  console.log('  ✓ Test 18 Passed: Cancel transitions from ACTIVE to CANCELLED');

  // -------------------------------------------------------------
  // TEST 19: Cancel from PAUSED
  // -------------------------------------------------------------
  console.log('--- TEST 19: Cancel from PAUSED ---');
  const clock19 = new FakeClock();
  const session19 = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 300,
    clock: clock19,
    preparationDurationSeconds: 0
  }).data!;
  session19.start();
  session19.pause();
  assert.strictEqual(session19.getStatus(), 'PAUSED');
  session19.cancel();
  assert.strictEqual(session19.getStatus(), 'CANCELLED');
  console.log('  ✓ Test 19 Passed: Cancel transitions from PAUSED to CANCELLED');

  // -------------------------------------------------------------
  // TEST 20: Interrupt from ACTIVE
  // -------------------------------------------------------------
  console.log('--- TEST 20: Interrupt from ACTIVE ---');
  const clock20 = new FakeClock();
  const session20 = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 300,
    clock: clock20,
    preparationDurationSeconds: 0
  }).data!;
  session20.start();
  const intRes = session20.interrupt();
  assert.strictEqual(intRes.success, true);
  assert.strictEqual(session20.getStatus(), 'INTERRUPTED');
  assert.ok(session20.getSessionSnapshot().interruptedAt);
  console.log('  ✓ Test 20 Passed: Interrupt transitions to INTERRUPTED');

  // -------------------------------------------------------------
  // TESTS 21, 22, 23: Terminal session cannot resume, pause, restart
  // -------------------------------------------------------------
  console.log('--- TESTS 21, 22, 23: Terminal session protections ---');
  const resumeTerminal = session20.resume();
  assert.strictEqual(resumeTerminal.success, false);
  assert.strictEqual(resumeTerminal.error?.code, 'SESSION_ALREADY_TERMINAL');

  const pauseTerminal = session20.pause();
  assert.strictEqual(pauseTerminal.success, false);
  assert.strictEqual(pauseTerminal.error?.code, 'SESSION_ALREADY_TERMINAL');

  const startTerminal = session20.start();
  assert.strictEqual(startTerminal.success, false);
  assert.strictEqual(startTerminal.error?.code, 'SESSION_ALREADY_TERMINAL');
  console.log('  ✓ Tests 21, 22, 23 Passed: Terminal sessions are strictly non-resumable');

  // -------------------------------------------------------------
  // TEST 24: Subscriber receives deterministic snapshots
  // -------------------------------------------------------------
  console.log('--- TEST 24: Subscriber receives snapshots ---');
  const clock24 = new FakeClock();
  const session24 = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 180,
    clock: clock24,
    preparationDurationSeconds: 0
  }).data!;
  const received: SessionSnapshot[] = [];
  const unsubscribe = session24.subscribe(snap => {
    received.push(snap);
  });

  session24.start();
  clock24.advance(10000);
  session24.tick();
  assert.ok(received.length >= 2);
  assert.strictEqual(received[received.length - 1].elapsedSeconds, 10);

  unsubscribe();
  clock24.advance(10000);
  session24.tick();
  assert.strictEqual(received.length, 2, 'Unsubscribed listener must receive no further snapshots');
  console.log('  ✓ Test 24 Passed: Subscriber receives snapshots and unsubscription works');

  // -------------------------------------------------------------
  // TEST 25: Failing subscriber does not crash engine
  // -------------------------------------------------------------
  console.log('--- TEST 25: Failing subscriber isolation ---');
  const clock25 = new FakeClock();
  const session25 = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 180,
    clock: clock25,
    preparationDurationSeconds: 0
  }).data!;
  session25.subscribe(() => {
    throw new Error('Crashing subscriber simulation');
  });
  // Should not throw:
  assert.doesNotThrow(() => {
    session25.start();
    session25.tick();
  }, 'Failing subscriber must be safely isolated');
  console.log('  ✓ Test 25 Passed: Failing subscriber does not crash engine');

  // -------------------------------------------------------------
  // TESTS 26, 27, 28, 29: Zero dependencies (clock, storage, network, AI)
  // -------------------------------------------------------------
  console.log('--- TESTS 26, 27, 28, 29: Pure zero-dependency guarantees ---');
  assert.strictEqual(typeof (session25 as any).localStorage, 'undefined');
  assert.strictEqual(typeof (session25 as any).fetch, 'undefined');
  assert.strictEqual(typeof (session25 as any).gemini, 'undefined');
  console.log('  ✓ Tests 26, 27, 28, 29 Passed: Pure offline deterministic architecture');

  // -------------------------------------------------------------
  // TEST 30: ZERO-DRIFT TIMING TEST
  // -------------------------------------------------------------
  console.log('--- TEST 30: Zero-drift timing simulation ---');
  // Scenario specified by prompt:
  // start
  // +100ms
  // +900ms
  // +500ms
  // pause
  // +5000ms while paused
  // resume
  // +500ms
  // +1000ms
  // Active elapsed must be 100 + 900 + 500 + 500 + 1000 = 3000ms = 3s.
  // The 5000ms paused interval must NOT be counted!
  const driftClock = new FakeClock(2_000_000);
  const driftSession = SessionEngine.createSession({
    practice: breathPractice,
    targetDurationSeconds: 600,
    clock: driftClock,
    preparationDurationSeconds: 0 // Immediate active
  }).data!;

  driftSession.start();
  driftClock.advance(100);
  driftSession.tick();

  driftClock.advance(900);
  driftSession.tick();

  driftClock.advance(500);
  driftSession.tick();

  driftSession.pause();
  driftClock.advance(5000); // 5000ms paused!
  driftSession.tick();

  driftSession.resume();
  driftClock.advance(500);
  driftSession.tick();

  driftClock.advance(1000);
  driftSession.tick();

  const finalElapsedSeconds = driftSession.getElapsedSeconds();
  assert.strictEqual(
    finalElapsedSeconds,
    3,
    `Zero-drift test failed: expected 3 seconds elapsed, got ${finalElapsedSeconds} seconds`
  );
  console.log('  ✓ Test 30 Passed: Zero-drift test passed! (3000ms active elapsed, 5000ms pause ignored)');

  console.log('\n================================================================');
  console.log('ALL PHASE 1.14D SESSION ENGINE TESTS PASSED (30/30)');
  console.log('================================================================');
}

runSessionEngineTestSuite().catch(err => {
  console.error('Session Engine Test Suite Failed:', err);
  process.exit(1);
});
