/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION PROFILE ISOLATION VERIFICATION SUITE
 * PHASE 1.14H: CROSS-PROFILE LEAKAGE PREVENTION & ISOLATED DATA PURGE
 */

import assert from 'node:assert';
import {
  MeditationStorageService
} from '../../services/meditation/meditationStorageService';
import { MeditationSessionRecord } from '../../types/meditation/meditationTypes';

class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const mockStorage = new MockLocalStorage();
(globalThis as any).window = {
  localStorage: mockStorage
};

let passCount = 0;
function logPass(msg: string) {
  passCount++;
  console.log(`  ✓ Passed: ${msg}`);
}

console.log('================================================================');
console.log('JEEVANDARPAN — PHASE 1.14H: PROFILE ISOLATION TEST SUITE');
console.log('================================================================');

try {
  mockStorage.clear();

  const userA = 'profile_alpha_acharya';
  const userB = 'profile_beta_brahmachari';

  // 1. Initial State: Both are empty
  const stateA_init = MeditationStorageService.loadState(userA);
  const stateB_init = MeditationStorageService.loadState(userB);

  assert.strictEqual(stateA_init.history.length, 0);
  assert.strictEqual(stateB_init.history.length, 0);
  assert.strictEqual(stateA_init.state.streak.currentStreakDays, 0);
  assert.strictEqual(stateB_init.state.streak.currentStreakDays, 0);
  logPass('Both Profile A and Profile B initialize in clean default state');

  // 2. Modify Profile A: Set Goal, Sankalpa, and Record Completed Session
  MeditationStorageService.updateDailyGoal(userA, {
    targetMinutesPerDay: 30,
    reminderEnabled: true,
    preferredReminderTime: '05:00',
    reminderMessage: 'आचार्य का ध्यान समय'
  });

  MeditationStorageService.setSankalpa(userA, 'नित्य प्राणायाम एवं आत्म-साधना।');

  const sessA: MeditationSessionRecord = {
    sessionId: 'sess_alpha_1',
    profileId: userA,
    practiceId: 'BREATH_AWARENESS',
    targetDurationSeconds: 1800,
    actualDurationSeconds: 1800,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: '2026-10-04T05:00:00.000Z',
    completedAt: '2026-10-04T05:30:00.000Z',
    audioModeUsed: 'VOICE_AND_AMBIENT'
  };
  MeditationStorageService.recordSession(userA, sessA);

  MeditationStorageService.saveReflection(userA, {
    sessionId: 'sess_alpha_1',
    postSessionState: 'CENTERED',
    personalNotes: 'अनुभूति: चित्त शांत रहा।',
    recordedAt: '2026-10-04T05:31:00.000Z'
  });

  // 3. Verify Profile B remains COMPLETELY empty and default
  const stateB_check1 = MeditationStorageService.loadState(userB);
  assert.strictEqual(stateB_check1.history.length, 0);
  assert.strictEqual(stateB_check1.state.goal.targetMinutesPerDay, 10); // default
  assert.strictEqual(stateB_check1.state.goal.reminderEnabled, false);
  assert.strictEqual(stateB_check1.state.activeSankalpa, undefined);
  assert.strictEqual(stateB_check1.state.streak.currentStreakDays, 0);
  assert.strictEqual(stateB_check1.state.streak.totalMinutesPracticed, 0);
  logPass('Profile A extensively populated; Profile B confirmed 100% empty and invariant');

  // 4. Modify Profile B: Set distinct Goal, Sankalpa, and Record 2 Short Sessions
  MeditationStorageService.updateDailyGoal(userB, {
    targetMinutesPerDay: 15,
    reminderEnabled: false,
    preferredReminderTime: '21:00'
  });

  MeditationStorageService.setSankalpa(userB, 'सांध्य मौन विश्रांति।');

  const sessB1: MeditationSessionRecord = {
    sessionId: 'sess_beta_1',
    profileId: userB,
    practiceId: 'SILENT_MEDITATION',
    targetDurationSeconds: 900,
    actualDurationSeconds: 900,
    status: 'COMPLETED',
    recommendationSource: 'MANUAL',
    startedAt: '2026-10-04T21:00:00.000Z',
    completedAt: '2026-10-04T21:15:00.000Z',
    audioModeUsed: 'AMBIENT'
  };
  MeditationStorageService.recordSession(userB, sessB1);

  // 5. Verify Profile A remains COMPLETELY unchanged after modifying B
  const stateA_check2 = MeditationStorageService.loadState(userA);
  assert.strictEqual(stateA_check2.history.length, 1);
  assert.strictEqual(stateA_check2.state.goal.targetMinutesPerDay, 30);
  assert.strictEqual(stateA_check2.state.goal.reminderEnabled, true);
  assert.strictEqual(stateA_check2.state.activeSankalpa, 'नित्य प्राणायाम एवं आत्म-साधना।');
  assert.strictEqual(stateA_check2.history[0].reflection?.postSessionState, 'CENTERED');
  assert.strictEqual(stateA_check2.state.streak.totalMinutesPracticed, 30);
  logPass('Profile B populated; Profile A verified completely unaffected');

  // 6. Safe Data Clear on Profile A
  MeditationStorageService.clearMeditationData(userA);

  const stateA_cleared = MeditationStorageService.loadState(userA);
  const stateB_afterClearA = MeditationStorageService.loadState(userB);

  // Profile A is reset
  assert.strictEqual(stateA_cleared.history.length, 0);
  assert.strictEqual(stateA_cleared.state.streak.currentStreakDays, 0);
  assert.strictEqual(stateA_cleared.state.activeSankalpa, undefined);
  assert.strictEqual(stateA_cleared.state.goal.targetMinutesPerDay, 10);

  // Profile B is still intact!
  assert.strictEqual(stateB_afterClearA.history.length, 1);
  assert.strictEqual(stateB_afterClearA.state.goal.targetMinutesPerDay, 15);
  assert.strictEqual(stateB_afterClearA.state.activeSankalpa, 'सांध्य मौन विश्रांति।');
  assert.strictEqual(stateB_afterClearA.history[0].sessionId, 'sess_beta_1');
  logPass('Clearing Profile A data leaves Profile B completely intact and undamaged');

  console.log('================================================================');
  console.log(`ALL PROFILE ISOLATION TESTS PASSED (${passCount}/${passCount})`);
  console.log('================================================================');
} catch (err) {
  console.error('Test failure:', err);
  process.exit(1);
}
