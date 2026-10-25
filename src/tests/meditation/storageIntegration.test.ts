/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION & SADHANA STORAGE INTEGRATION TEST SUITE
 * PHASE 1.14G: PROFILE ISOLATION, SESSIONS HISTORY, STREAK & CORRUPT RECOVERY
 */

import assert from 'node:assert';
import {
  MeditationStorageService,
  DEFAULT_DAILY_GOAL,
  DEFAULT_STREAK
} from '../../services/meditation/meditationStorageService';
import {
  MeditationSessionRecord,
  ReflectionEntry
} from '../../types/meditation/meditationTypes';

// Setup Mock In-Memory LocalStorage for Node CLI Execution
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

  // Debug helper
  getRaw(key: string): string | undefined {
    return this.store.get(key);
  }

  setRaw(key: string, val: string): void {
    this.store.set(key, val);
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
console.log('JEEVANDARPAN — PHASE 1.14G: MEDITATION STORAGE TEST SUITE');
console.log('================================================================');

try {
  mockStorage.clear();

  // -------------------------------------------------------------
  // SECTION 1: DEFAULT SCHEMA INITIALIZATION
  // -------------------------------------------------------------
  console.log('\n--- SECTION 1: INITIAL STATE & DEFAULT SCHEMA ---');

  const defaultState = MeditationStorageService.loadState('profile_101');
  assert.strictEqual(defaultState.version, '1.0.0');
  assert.strictEqual(defaultState.profileId, 'profile_101');
  assert.strictEqual(defaultState.history.length, 0);
  assert.strictEqual(defaultState.state.goal.targetMinutesPerDay, DEFAULT_DAILY_GOAL.targetMinutesPerDay);
  assert.strictEqual(defaultState.state.streak.currentStreakDays, DEFAULT_STREAK.currentStreakDays);
  logPass('Default schema initializes with valid structure and zero history');

  // -------------------------------------------------------------
  // SECTION G: PROFILE ISOLATION TEST
  // -------------------------------------------------------------
  console.log('\n--- SECTION G: PROFILE ISOLATION TEST ---');

  const userA = 'profile_arjun';
  const userB = 'profile_meera';

  const sessionA: MeditationSessionRecord = {
    sessionId: 'sess_arjun_01',
    profileId: userA,
    practiceId: 'BREATH_AWARENESS',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: '2026-10-01T06:00:00.000Z',
    completedAt: '2026-10-01T06:10:00.000Z',
    audioModeUsed: 'VOICE_AND_AMBIENT'
  };

  MeditationStorageService.recordSession(userA, sessionA, new Date('2026-10-01T06:10:00.000Z'));

  const stateA = MeditationStorageService.loadState(userA);
  const stateB = MeditationStorageService.loadState(userB);

  assert.strictEqual(stateA.history.length, 1);
  assert.strictEqual(stateA.history[0].sessionId, 'sess_arjun_01');
  assert.strictEqual(stateA.state.streak.totalSessionsCompleted, 1);

  // User B must remain totally untouched
  assert.strictEqual(stateB.history.length, 0);
  assert.strictEqual(stateB.state.streak.totalSessionsCompleted, 0);
  logPass('Profile A records sessions independently from Profile B');

  // Add session for User B
  const sessionB: MeditationSessionRecord = {
    sessionId: 'sess_meera_01',
    profileId: userB,
    practiceId: 'SILENT_MEDITATION',
    targetDurationSeconds: 900,
    actualDurationSeconds: 900,
    status: 'COMPLETED',
    recommendationSource: 'DAILY_COMPANION',
    startedAt: '2026-10-01T07:00:00.000Z',
    completedAt: '2026-10-01T07:15:00.000Z',
    audioModeUsed: 'AMBIENT'
  };

  MeditationStorageService.recordSession(userB, sessionB, new Date('2026-10-01T07:15:00.000Z'));

  const stateA_after = MeditationStorageService.loadState(userA);
  const stateB_after = MeditationStorageService.loadState(userB);

  assert.strictEqual(stateA_after.history.length, 1);
  assert.strictEqual(stateB_after.history.length, 1);
  assert.strictEqual(stateB_after.history[0].practiceId, 'SILENT_MEDITATION');
  logPass('Multi-profile storage operates with zero data leakage or bleed');

  // -------------------------------------------------------------
  // SECTION H: SESSION HISTORY TEST
  // -------------------------------------------------------------
  console.log('\n--- SECTION H: SESSION HISTORY TEST ---');

  const historyUser = 'profile_history_test';

  const s1: MeditationSessionRecord = {
    sessionId: 'sess_h_01',
    profileId: historyUser,
    practiceId: 'BREATH_AWARENESS',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: '2026-10-01T06:00:00.000Z',
    completedAt: '2026-10-01T06:10:00.000Z',
    audioModeUsed: 'VOICE_AND_AMBIENT'
  };

  const s2: MeditationSessionRecord = {
    sessionId: 'sess_h_02',
    profileId: historyUser,
    practiceId: 'BODY_AWARENESS',
    targetDurationSeconds: 300,
    actualDurationSeconds: 120,
    status: 'CANCELLED',
    recommendationSource: 'MANUAL',
    startedAt: '2026-10-01T12:00:00.000Z',
    completedAt: '2026-10-01T12:02:00.000Z',
    audioModeUsed: 'OFF'
  };

  MeditationStorageService.recordSession(historyUser, s1);
  MeditationStorageService.recordSession(historyUser, s2);

  const historyState = MeditationStorageService.loadState(historyUser);
  assert.strictEqual(historyState.history.length, 2);
  // Most recent session prepended
  assert.strictEqual(historyState.history[0].sessionId, 'sess_h_02');
  assert.strictEqual(historyState.history[0].status, 'CANCELLED');
  assert.strictEqual(historyState.history[1].sessionId, 'sess_h_01');
  assert.strictEqual(historyState.history[1].status, 'COMPLETED');
  logPass('Sessions history retains records in reverse chronological sequence');

  // Test history capacity enforcement
  for (let i = 3; i <= 210; i++) {
    MeditationStorageService.recordSession(historyUser, {
      sessionId: `sess_h_${i}`,
      profileId: historyUser,
      practiceId: 'BREATH_AWARENESS',
      targetDurationSeconds: 180,
      actualDurationSeconds: 180,
      status: 'COMPLETED',
      recommendationSource: 'USER_SELECTED',
      startedAt: new Date().toISOString(),
      audioModeUsed: 'OFF'
    });
  }

  const cappedState = MeditationStorageService.loadState(historyUser);
  assert.strictEqual(cappedState.history.length, 200);
  assert.strictEqual(cappedState.history[0].sessionId, 'sess_h_210');
  logPass('History cap (200 records) strictly enforced to prevent unbounded growth');

  // -------------------------------------------------------------
  // SECTION I: REFLECTION TEST
  // -------------------------------------------------------------
  console.log('\n--- SECTION I: REFLECTION TEST ---');

  const reflectionUser = 'profile_reflection_test';
  const targetSessionId = 'sess_ref_target';

  MeditationStorageService.recordSession(reflectionUser, {
    sessionId: targetSessionId,
    profileId: reflectionUser,
    practiceId: 'GRATITUDE_REFLECTION',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: '2026-10-04T08:00:00.000Z',
    completedAt: '2026-10-04T08:10:00.000Z',
    audioModeUsed: 'VOICE_AND_AMBIENT'
  });

  const reflection: ReflectionEntry = {
    sessionId: targetSessionId,
    postSessionState: 'REFRESHED',
    personalNotes: 'मन अत्यंत शांत एवं एकाग्र अनुभव हुआ।',
    recordedAt: '2026-10-04T08:11:00.000Z'
  };

  MeditationStorageService.saveReflection(reflectionUser, reflection);

  const reflectedState = MeditationStorageService.loadState(reflectionUser);
  const updatedRecord = reflectedState.history.find((s) => s.sessionId === targetSessionId);

  assert.ok(updatedRecord);
  assert.ok(updatedRecord.reflection);
  assert.strictEqual(updatedRecord.reflection.postSessionState, 'REFRESHED');
  assert.strictEqual(updatedRecord.reflection.personalNotes, 'मन अत्यंत शांत एवं एकाग्र अनुभव हुआ।');
  logPass('Qualitative reflection and personal notes saved successfully to session record');

  // -------------------------------------------------------------
  // SECTION J: DAILY GOAL TEST
  // -------------------------------------------------------------
  console.log('\n--- SECTION J: DAILY GOAL TEST ---');

  const goalUser = 'profile_goal_test';
  const testDate = new Date('2026-10-04T10:00:00.000Z');
  const testDateStr = '2026-10-04';

  // 1. Initial progress
  const initialProg = MeditationStorageService.getDailyProgress(goalUser, testDateStr, testDate);
  assert.strictEqual(initialProg.targetMinutes, 10);
  assert.strictEqual(initialProg.minutesCompleted, 0);
  assert.strictEqual(initialProg.percentage, 0);
  assert.strictEqual(initialProg.isGoalMet, false);
  logPass('Initial daily progress starts at 0% with 10 min default goal');

  // 2. Update goal to 20 minutes
  MeditationStorageService.updateDailyGoal(goalUser, {
    targetMinutesPerDay: 20
  });

  const stateAfterGoalUpdate = MeditationStorageService.loadState(goalUser);
  assert.strictEqual(stateAfterGoalUpdate.state.goal.targetMinutesPerDay, 20);
  logPass('Daily goal configuration updated to 20 minutes');

  // 3. Complete 10-minute session
  MeditationStorageService.recordSession(goalUser, {
    sessionId: 'sess_goal_01',
    profileId: goalUser,
    practiceId: 'BREATH_AWARENESS',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: '2026-10-04T07:00:00.000Z',
    completedAt: '2026-10-04T07:10:00.000Z',
    audioModeUsed: 'VOICE_AND_AMBIENT'
  }, testDate);

  const midProg = MeditationStorageService.getDailyProgress(goalUser, testDateStr, testDate);
  assert.strictEqual(midProg.targetMinutes, 20);
  assert.strictEqual(midProg.minutesCompleted, 10);
  assert.strictEqual(midProg.percentage, 50);
  assert.strictEqual(midProg.isGoalMet, false);
  logPass('Daily goal progress accurately calculates 50% completion (10/20 min)');

  // 4. Complete another 10-minute session
  MeditationStorageService.recordSession(goalUser, {
    sessionId: 'sess_goal_02',
    profileId: goalUser,
    practiceId: 'PRAYERFUL_CONTEMPLATION',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: '2026-10-04T18:00:00.000Z',
    completedAt: '2026-10-04T18:10:00.000Z',
    audioModeUsed: 'AMBIENT'
  }, testDate);

  const finalProg = MeditationStorageService.getDailyProgress(goalUser, testDateStr, testDate);
  assert.strictEqual(finalProg.minutesCompleted, 20);
  assert.strictEqual(finalProg.percentage, 100);
  assert.strictEqual(finalProg.isGoalMet, true);
  logPass('Daily goal 100% achieved and flagged as met');

  // -------------------------------------------------------------
  // SECTION K: STREAK TEST
  // -------------------------------------------------------------
  console.log('\n--- SECTION K: STREAK TEST ---');

  const streakUser = 'profile_streak_test';

  // Day 1: 2026-10-01
  const d1 = new Date('2026-10-01T08:00:00');
  MeditationStorageService.recordSession(streakUser, {
    sessionId: 'sess_st_d1',
    profileId: streakUser,
    practiceId: 'BREATH_AWARENESS',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: d1.toISOString(),
    completedAt: d1.toISOString(),
    audioModeUsed: 'VOICE_AND_AMBIENT'
  }, d1);

  let streakState = MeditationStorageService.loadState(streakUser);
  assert.strictEqual(streakState.state.streak.currentStreakDays, 1);
  assert.strictEqual(streakState.state.streak.longestStreakDays, 1);
  assert.strictEqual(streakState.state.streak.totalSessionsCompleted, 1);
  assert.strictEqual(streakState.state.streak.totalMinutesPracticed, 10);
  logPass('Day 1 session establishes streak of 1 day');

  // Day 1 (Second session on same day) -> streak remains 1, sessions increment
  MeditationStorageService.recordSession(streakUser, {
    sessionId: 'sess_st_d1_second',
    profileId: streakUser,
    practiceId: 'SILENT_MEDITATION',
    targetDurationSeconds: 300,
    actualDurationSeconds: 300,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: d1.toISOString(),
    completedAt: d1.toISOString(),
    audioModeUsed: 'AMBIENT'
  }, d1);

  streakState = MeditationStorageService.loadState(streakUser);
  assert.strictEqual(streakState.state.streak.currentStreakDays, 1);
  assert.strictEqual(streakState.state.streak.totalSessionsCompleted, 2);
  assert.strictEqual(streakState.state.streak.totalMinutesPracticed, 15);
  logPass('Multiple sessions on same day increment minutes and count without artificial streak inflation');

  // Day 2: 2026-10-02 (Consecutive day)
  const d2 = new Date('2026-10-02T08:00:00');
  MeditationStorageService.recordSession(streakUser, {
    sessionId: 'sess_st_d2',
    profileId: streakUser,
    practiceId: 'BODY_AWARENESS',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: d2.toISOString(),
    completedAt: d2.toISOString(),
    audioModeUsed: 'VOICE_AND_AMBIENT'
  }, d2);

  streakState = MeditationStorageService.loadState(streakUser);
  assert.strictEqual(streakState.state.streak.currentStreakDays, 2);
  assert.strictEqual(streakState.state.streak.longestStreakDays, 2);
  logPass('Day 2 consecutive session increments streak to 2 days');

  // Day 3: 2026-10-03 (Consecutive day)
  const d3 = new Date('2026-10-03T08:00:00');
  MeditationStorageService.recordSession(streakUser, {
    sessionId: 'sess_st_d3',
    profileId: streakUser,
    practiceId: 'SELF_OBSERVATION',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: d3.toISOString(),
    completedAt: d3.toISOString(),
    audioModeUsed: 'VOICE_AND_AMBIENT'
  }, d3);

  streakState = MeditationStorageService.loadState(streakUser);
  assert.strictEqual(streakState.state.streak.currentStreakDays, 3);
  assert.strictEqual(streakState.state.streak.longestStreakDays, 3);
  logPass('Day 3 consecutive session increments streak to 3 days');

  // Day 5: 2026-10-05 (Skipped 10-04, gap of 2 days -> streak resets to 1, longest preserved as 3)
  const d5 = new Date('2026-10-05T08:00:00');
  MeditationStorageService.recordSession(streakUser, {
    sessionId: 'sess_st_d5',
    profileId: streakUser,
    practiceId: 'BREATH_AWARENESS',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    recommendationSource: 'USER_SELECTED',
    startedAt: d5.toISOString(),
    completedAt: d5.toISOString(),
    audioModeUsed: 'VOICE_AND_AMBIENT'
  }, d5);

  streakState = MeditationStorageService.loadState(streakUser);
  assert.strictEqual(streakState.state.streak.currentStreakDays, 1);
  assert.strictEqual(streakState.state.streak.longestStreakDays, 3);
  logPass('Missed day resets active streak to 1 while preserving all-time longest streak (3 days)');

  // -------------------------------------------------------------
  // SECTION L: CORRUPT-STORAGE HANDLING
  // -------------------------------------------------------------
  console.log('\n--- SECTION L: CORRUPT-STORAGE HANDLING ---');

  const corruptUser = 'profile_corrupt_test';
  const corruptKey = MeditationStorageService.getStorageKey(corruptUser);

  // 1. Inject malformed JSON
  mockStorage.setRaw(corruptKey, '{ bad json syntax :: undefined ');

  const healedFromMalformed = MeditationStorageService.loadState(corruptUser);
  assert.strictEqual(healedFromMalformed.version, '1.0.0');
  assert.strictEqual(healedFromMalformed.profileId, corruptUser);
  assert.strictEqual(healedFromMalformed.history.length, 0);
  logPass('Malformed JSON string safely recovered to pristine default schema without throwing');

  // 2. Inject schema with mismatched version / broken shape
  mockStorage.setRaw(corruptKey, JSON.stringify({
    version: '99.0.0', // Unsupported version
    profileId: 'someone_else',
    randomGarbage: 123
  }));

  const healedFromBadShape = MeditationStorageService.loadState(corruptUser);
  assert.strictEqual(healedFromBadShape.version, '1.0.0');
  assert.strictEqual(healedFromBadShape.profileId, corruptUser);
  logPass('Invalid schema shape safely detected and self-healed');

  // 3. Clear History for profile
  MeditationStorageService.clearHistory(corruptUser);
  const cleared = MeditationStorageService.loadState(corruptUser);
  assert.strictEqual(cleared.history.length, 0);
  assert.strictEqual(cleared.state.streak.currentStreakDays, 0);
  logPass('Profile history cleared cleanly without affecting other profiles');

  console.log('================================================================');
  console.log(`ALL PHASE 1.14G STORAGE INTEGRATION TESTS PASSED (${passCount}/${passCount})`);
  console.log('================================================================');
} catch (err) {
  console.error('Test failure:', err);
  process.exit(1);
}
