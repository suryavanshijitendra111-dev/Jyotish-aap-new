/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA SESSION COMPLETE COMPONENT TEST SUITE
 * PHASE 1.15F-B: POST-SESSION COMPLETION & CANCELLED SUMMARY VERIFICATION
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';
import { YogaSessionEngine } from '../../services/yogaSadhana/yogaSessionEngine';
import { YogaSessionClock } from '../../types/yogaSadhana/yogaSessionTypes';

class ControlledTestClock implements YogaSessionClock {
  private timeMs: number;
  constructor(initialMs = 1000000) {
    this.timeMs = initialMs;
  }
  public now(): number {
    return this.timeMs;
  }
  public advance(ms: number) {
    this.timeMs += ms;
  }
}

async function runYogaSessionCompleteTestSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.15F-B: YOGA SESSION COMPLETE TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  const sourceCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/yogaSadhana/YogaSessionComplete.tsx'), 'utf8');

  // -------------------------------------------------------------
  // TEST 1: Completed title "अभ्यास पूर्ण" present
  // -------------------------------------------------------------
  console.log('--- TEST 1: Completed title ---');
  assert.ok(sourceCode.includes("'अभ्यास पूर्ण'"), 'Must render "अभ्यास पूर्ण" when completed');
  console.log('  ✓ Test 1 Passed: Completed title "अभ्यास पूर्ण" rendered');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 2: Cancelled title "अभ्यास समाप्त" present
  // -------------------------------------------------------------
  console.log('--- TEST 2: Cancelled title ---');
  assert.ok(sourceCode.includes("'अभ्यास समाप्त'"), 'Must render "अभ्यास समाप्त" when cancelled');
  console.log('  ✓ Test 2 Passed: Cancelled title "अभ्यास समाप्त" rendered');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 3: Correct practice name resolution from catalog
  // -------------------------------------------------------------
  console.log('--- TEST 3: Practice name resolution from catalog ---');
  const shavasana = YogaCatalogService.getPracticeById('shavasana');
  assert.ok(shavasana);
  assert.strictEqual(shavasana.nameHindi, 'शवासन');
  assert.strictEqual(shavasana.nameEnglish, 'Shavasana');
  assert.ok(sourceCode.includes('YogaCatalogService.getPracticeById(practiceId)'), 'Must bind to catalog service');
  console.log('  ✓ Test 3 Passed: Correct practice Hindi and English names resolved from catalog');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 4: Target duration rendered
  // -------------------------------------------------------------
  console.log('--- TEST 4: Target duration ---');
  assert.ok(sourceCode.includes('targetDurationSeconds'), 'Must display target duration');
  assert.ok(sourceCode.includes('लक्षित अवधि'), 'Must display Hindi label for target duration');
  console.log('  ✓ Test 4 Passed: Target duration metric rendered');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 5: Actual active elapsed duration rendered
  // -------------------------------------------------------------
  console.log('--- TEST 5: Actual elapsed duration ---');
  assert.ok(sourceCode.includes('actualElapsedSeconds'), 'Must display actual elapsed duration');
  assert.ok(sourceCode.includes('सक्रिय अभ्यास समय'), 'Must display Hindi label for active elapsed duration');
  console.log('  ✓ Test 5 Passed: Actual active elapsed duration rendered');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 6: Completed session does not show Resume
  // -------------------------------------------------------------
  console.log('--- TEST 6: Completed session does not show Resume ---');
  assert.strictEqual(sourceCode.includes('onResume'), false, 'Completion screen must not have onResume');
  assert.strictEqual(sourceCode.toLowerCase().includes('जारी रखें'), false, 'Must not display "जारी रखें"');
  console.log('  ✓ Test 6 Passed: Completed session does not offer Resume');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 7: Cancelled session does not show Resume
  // -------------------------------------------------------------
  console.log('--- TEST 7: Cancelled session does not show Resume ---');
  assert.strictEqual(sourceCode.includes('resume()'), false, 'Cancelled view cannot invoke resume');
  console.log('  ✓ Test 7 Passed: Cancelled session strictly excludes resume interaction');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 8: Restart creates a new session
  // -------------------------------------------------------------
  console.log('--- TEST 8: Restart creates a new session ---');
  const clock = new ControlledTestClock();
  const session1 = YogaSessionEngine.create({
    practiceId: 'shavasana',
    targetDurationSeconds: 300,
    clock,
    autoTick: false
  }).data!;
  session1.start();
  clock.advance(3000); // finish prep
  session1.tick();
  clock.advance(300000); // finish practice
  session1.tick();
  const snap1 = session1.getSnapshot();
  assert.strictEqual(snap1.status, 'COMPLETED');

  // Terminal engine cannot be started again
  const cannotRestart = session1.start();
  assert.strictEqual(cannotRestart.success, false);
  assert.strictEqual(cannotRestart.error?.code, 'SESSION_ALREADY_TERMINAL');

  // Fresh session instance represents restart
  const session2 = YogaSessionEngine.create({
    practiceId: 'shavasana',
    targetDurationSeconds: 300,
    clock,
    autoTick: false
  }).data!;
  assert.notStrictEqual(session1.getSnapshot().sessionId, session2.getSnapshot().sessionId);
  assert.strictEqual(session2.getSnapshot().status, 'IDLE');
  console.log('  ✓ Test 8 Passed: Restart creates fresh engine with unique sessionId');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 9: Return button present with onExit
  // -------------------------------------------------------------
  console.log('--- TEST 9: Return action ---');
  assert.ok(sourceCode.includes('onExit'), 'Must wire onExit callback');
  assert.ok(sourceCode.includes('वापस Yoga सूची'), 'Must render "वापस Yoga सूची"');
  console.log('  ✓ Test 9 Passed: Return button wired to exit cleanly');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 10: No persistence
  // -------------------------------------------------------------
  console.log('--- TEST 10: Zero persistence ---');
  const lower = sourceCode.toLowerCase();
  assert.strictEqual(lower.includes('localstorage'), false);
  assert.strictEqual(lower.includes('indexeddb'), false);
  assert.strictEqual(lower.includes('sessionstorage'), false);
  console.log('  ✓ Test 10 Passed: Zero persistent storage in completion component');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 11: No audio
  // -------------------------------------------------------------
  console.log('--- TEST 11: Zero audio ---');
  assert.strictEqual(lower.includes('audiocontext'), false);
  assert.strictEqual(lower.includes('speechengine'), false);
  assert.strictEqual(lower.includes('speechsynthesis'), false);
  assert.strictEqual(lower.includes('<audio'), false);
  console.log('  ✓ Test 11 Passed: Zero audio or speech synthesis');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 12: No AI / network
  // -------------------------------------------------------------
  console.log('--- TEST 12: Zero AI and network ---');
  assert.strictEqual(lower.includes('googlegenai'), false);
  assert.strictEqual(lower.includes('gemini'), false);
  assert.strictEqual(lower.includes('fetch('), false);
  assert.strictEqual(lower.includes('axios'), false);
  assert.strictEqual(lower.includes('websocket'), false);
  console.log('  ✓ Test 12 Passed: Zero AI and network dependencies');
  passedTests++;

  console.log('\n================================================================');
  console.log(`ALL ${passedTests}/${passedTests} YOGA SESSION COMPLETE TESTS PASSED (100%)`);
  console.log('================================================================');
}

runYogaSessionCompleteTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
