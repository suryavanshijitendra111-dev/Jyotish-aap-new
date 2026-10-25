/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION SETTINGS, SANKALPA & SAFE PURGE TEST SUITE
 * PHASE 1.14H: PRACTICE GOALS, REMINDERS, SANKALPA & NON-DESTRUCTIVE PURGE
 */

import assert from 'node:assert';
import {
  MeditationStorageService,
  DEFAULT_DAILY_GOAL
} from '../../services/meditation/meditationStorageService';

// Mock LocalStorage
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

  has(key: string): boolean {
    return this.store.has(key);
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
console.log('JEEVANDARPAN — PHASE 1.14H: MEDITATION SETTINGS & SANKALPA TESTS');
console.log('================================================================');

try {
  mockStorage.clear();

  // -------------------------------------------------------------
  // 1. DAILY GOAL SETTINGS & DEFAULTS
  // -------------------------------------------------------------
  console.log('\n--- 1. DAILY GOAL SETTINGS & DEFAULTS ---');

  const testUser = 'user_settings_101';
  const initialSchema = MeditationStorageService.loadState(testUser);

  assert.strictEqual(initialSchema.state.goal.targetMinutesPerDay, 10);
  assert.strictEqual(initialSchema.state.goal.reminderEnabled, false);
  assert.strictEqual(initialSchema.state.goal.preferredReminderTime, '06:30');
  logPass('Default daily goal = 10 minutes with reminder disabled');

  // Update target minutes to 25
  MeditationStorageService.updateDailyGoal(testUser, {
    targetMinutesPerDay: 25
  });

  const updatedSchema = MeditationStorageService.loadState(testUser);
  assert.strictEqual(updatedSchema.state.goal.targetMinutesPerDay, 25);
  logPass('Daily goal updated to 25 minutes');

  // Reload verification
  const reloaded = MeditationStorageService.loadState(testUser);
  assert.strictEqual(reloaded.state.goal.targetMinutesPerDay, 25);
  logPass('Goal configuration persists accurately after reload');

  // -------------------------------------------------------------
  // 2. REMINDER CONFIGURATION & PERSISTENCE
  // -------------------------------------------------------------
  console.log('\n--- 2. REMINDER CONFIGURATION & PERSISTENCE ---');

  MeditationStorageService.updateDailyGoal(testUser, {
    reminderEnabled: true,
    preferredReminderTime: '05:45',
    reminderMessage: 'प्रातः आत्म-साधना का पावन समय'
  });

  const reminderSchema = MeditationStorageService.loadState(testUser);
  assert.strictEqual(reminderSchema.state.goal.reminderEnabled, true);
  assert.strictEqual(reminderSchema.state.goal.preferredReminderTime, '05:45');
  assert.strictEqual(reminderSchema.state.goal.reminderMessage, 'प्रातः आत्म-साधना का पावन समय');
  logPass('Reminder toggle, preferred time, and custom message persist correctly');

  // Disable reminder
  MeditationStorageService.updateDailyGoal(testUser, {
    reminderEnabled: false
  });
  const disabledReminder = MeditationStorageService.loadState(testUser);
  assert.strictEqual(disabledReminder.state.goal.reminderEnabled, false);
  assert.strictEqual(disabledReminder.state.goal.preferredReminderTime, '05:45'); // preserved
  logPass('Reminder can be cleanly disabled without losing preferred time configuration');

  // -------------------------------------------------------------
  // 3. SANKALPA MANAGEMENT & PROFILE ISOLATION
  // -------------------------------------------------------------
  console.log('\n--- 3. SANKALPA MANAGEMENT & PROFILE ISOLATION ---');

  const userA = 'user_sankalpa_arjun';
  const userB = 'user_sankalpa_meera';

  // Initially undefined
  assert.strictEqual(MeditationStorageService.loadState(userA).state.activeSankalpa, undefined);
  assert.strictEqual(MeditationStorageService.loadState(userB).state.activeSankalpa, undefined);

  // Set Sankalpa for User A
  const sankalpaA = 'मैं प्रतिदिन शांत मन से 10 मिनट श्वास का साक्षी रहूँगा।';
  MeditationStorageService.setSankalpa(userA, sankalpaA);

  const stateA = MeditationStorageService.loadState(userA);
  const stateB = MeditationStorageService.loadState(userB);

  assert.strictEqual(stateA.state.activeSankalpa, sankalpaA);
  assert.strictEqual(stateB.state.activeSankalpa, undefined);
  logPass('User A sets Sankalpa; User B remains completely untouched');

  // Update Sankalpa for User A
  const updatedSankalpaA = 'सर्वे भवन्तु सुखिनः — समस्त चराचर का मंगल हो।';
  MeditationStorageService.setSankalpa(userA, updatedSankalpaA);
  assert.strictEqual(MeditationStorageService.loadState(userA).state.activeSankalpa, updatedSankalpaA);
  logPass('Sankalpa updated successfully');

  // User B sets independent Sankalpa
  const sankalpaB = 'मैं अपनी चित्तवृत्तियों का शांत अवलोकन करूँगा।';
  MeditationStorageService.setSankalpa(userB, sankalpaB);
  assert.strictEqual(MeditationStorageService.loadState(userB).state.activeSankalpa, sankalpaB);
  assert.strictEqual(MeditationStorageService.loadState(userA).state.activeSankalpa, updatedSankalpaA);
  logPass('Independent Sankalpas verified across multiple profiles');

  // Clear Sankalpa for User A
  MeditationStorageService.clearSankalpa(userA);
  assert.strictEqual(MeditationStorageService.loadState(userA).state.activeSankalpa, undefined);
  assert.strictEqual(MeditationStorageService.loadState(userB).state.activeSankalpa, sankalpaB);
  logPass('Clearing User A Sankalpa does not affect User B');

  // -------------------------------------------------------------
  // 4. SAFE MEDITATION DATA PURGE
  // -------------------------------------------------------------
  console.log('\n--- 4. SAFE MEDITATION DATA PURGE ---');

  const purgeUser = 'user_purge_test';

  // Simulate existing other modules in localStorage
  mockStorage.setItem('jeevandarpan_master_profile', JSON.stringify({ name: 'Master User', id: '123' }));
  mockStorage.setItem('jeevandarpan_daily_reports', JSON.stringify([{ date: '2026-10-04', score: 85 }]));
  mockStorage.setItem('jeevandarpan_user_wellness', JSON.stringify({ mood: 'good' }));

  // Seed meditation data for purgeUser
  MeditationStorageService.recordSession(purgeUser, {
    sessionId: 'purge_sess_1',
    profileId: purgeUser,
    practiceId: 'BREATH_AWARENESS',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: '2026-10-04T07:00:00.000Z',
    audioModeUsed: 'OFF'
  });
  MeditationStorageService.setSankalpa(purgeUser, 'सत्यमेव जयते');

  const beforePurge = MeditationStorageService.loadState(purgeUser);
  assert.strictEqual(beforePurge.history.length, 1);
  assert.strictEqual(beforePurge.state.streak.currentStreakDays, 1);
  assert.strictEqual(beforePurge.state.activeSankalpa, 'सत्यमेव जयते');

  // Execute safe clear
  MeditationStorageService.clearMeditationData(purgeUser);

  const afterPurge = MeditationStorageService.loadState(purgeUser);
  assert.strictEqual(afterPurge.history.length, 0);
  assert.strictEqual(afterPurge.state.streak.currentStreakDays, 0);
  assert.strictEqual(afterPurge.state.activeSankalpa, undefined);
  logPass('Meditation data purged and restored to clean default state');

  // Verify other modules were completely untouched
  assert.ok(mockStorage.has('jeevandarpan_master_profile'));
  assert.ok(mockStorage.has('jeevandarpan_daily_reports'));
  assert.ok(mockStorage.has('jeevandarpan_user_wellness'));
  assert.strictEqual(
    JSON.parse(mockStorage.getItem('jeevandarpan_master_profile')!).name,
    'Master User'
  );
  logPass('Other system storage keys (masterProfile, dailyReports, wellness) strictly preserved');

  console.log('================================================================');
  console.log(`ALL SETTINGS, SANKALPA & PURGE TESTS PASSED (${passCount}/${passCount})`);
  console.log('================================================================');
} catch (err) {
  console.error('Test failure:', err);
  process.exit(1);
}
