/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA STORAGE TEST SUITE
 * PHASE 1.15F-C: PROFILE ISOLATION, LOCAL PERSISTENCE, LIMITS & CORRUPT RECOVERY
 */

import assert from 'node:assert';
import {
  YogaStorageService,
  MAX_HISTORY_RECORDS
} from '../../services/yogaSadhana/yogaStorageService';
import {
  YogaSessionRecord
} from '../../types/yogaSadhana/yogaStorageTypes';

// Setup Mock In-Memory LocalStorage for Node CLI Execution
class MockLocalStorage {
  private store: Map<string, string> = new Map();
  public throwOnSet = false;

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (this.throwOnSet) {
      throw new Error('QuotaExceededError: LocalStorage limit reached');
    }
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.throwOnSet = false;
  }

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
console.log('JEEVANDARPAN — PHASE 1.15F-C: YOGA STORAGE AUDITED TEST SUITE');
console.log('================================================================');

try {
  mockStorage.clear();

  // -------------------------------------------------------------
  // TEST 1: Default schema initialization for authorized partition
  // -------------------------------------------------------------
  console.log('\n--- TEST 1: Default schema initialization ---');
  const defaultState = YogaStorageService.loadState('profile_101');
  assert.strictEqual(defaultState.version, '1.0.0');
  assert.strictEqual(defaultState.profileId, 'profile_101');
  assert.strictEqual(defaultState.history.length, 0);
  assert.strictEqual(MAX_HISTORY_RECORDS, 200);
  logPass('Default schema initializes with valid structure and zero history (cap = 200)');

  // -------------------------------------------------------------
  // TEST 2: Multi-profile isolation
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Multi-profile isolation ---');
  const userA = 'profile_arjun';
  const userB = 'profile_meera';

  const sessionA: YogaSessionRecord = {
    sessionId: 'sess_arjun_01',
    profileId: userA,
    practiceId: 'shavasana',
    targetDurationSeconds: 300,
    actualDurationSeconds: 300,
    status: 'COMPLETED',
    startedAt: '2026-10-01T06:00:00.000Z',
    completedAt: '2026-10-01T06:05:00.000Z'
  };

  const resA = YogaStorageService.recordSession(userA, sessionA);
  assert.strictEqual(resA.success, true);
  assert.strictEqual(resA.persistenceStatus, 'PERSISTED');

  const stateA = YogaStorageService.loadState(userA);
  const stateB = YogaStorageService.loadState(userB);

  assert.strictEqual(stateA.history.length, 1);
  assert.strictEqual(stateA.history[0].sessionId, 'sess_arjun_01');

  // User B must remain completely clean with zero records
  assert.strictEqual(stateB.history.length, 0);
  logPass('Profiles are strictly isolated; data does not bleed across profiles');

  // -------------------------------------------------------------
  // TEST 3: Null and unidentified profile isolation (Master partition protection)
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Null and unidentified profile isolation ---');
  // Attempt to write without verified identity
  const unauthSession: YogaSessionRecord = {
    sessionId: 'sess_unauth_01',
    profileId: 'unidentified',
    practiceId: 'tadasana',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    startedAt: '2026-10-01T08:00:00.000Z'
  };

  const nullResult = YogaStorageService.recordSession(null, unauthSession, false);
  assert.strictEqual(nullResult.success, false);
  assert.strictEqual(nullResult.persistenceStatus, 'IDENTITY_DENIED');

  const undefinedResult = YogaStorageService.recordSession(undefined, unauthSession, false);
  assert.strictEqual(undefinedResult.success, false);
  assert.strictEqual(undefinedResult.persistenceStatus, 'IDENTITY_DENIED');

  const emptyResult = YogaStorageService.recordSession('   ', unauthSession, false);
  assert.strictEqual(emptyResult.success, false);
  assert.strictEqual(emptyResult.persistenceStatus, 'IDENTITY_DENIED');

  // Verify that master 'default' partition has zero records
  const masterCheck = YogaStorageService.loadState(null, false);
  assert.strictEqual(masterCheck.profileId, 'unidentified');
  assert.strictEqual(masterCheck.history.length, 0);
  assert.strictEqual(mockStorage.getItem('jeevandarpan_yoga_v1_default'), null);
  logPass('Unidentified and null profiles are strictly blocked from writing to or reading default master partition');

  // -------------------------------------------------------------
  // TEST 4: Explicit master profile authorization for 'default' partition
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Explicit master authorization ---');
  const masterSession: YogaSessionRecord = {
    sessionId: 'sess_master_01',
    profileId: 'default',
    practiceId: 'sukhasana',
    targetDurationSeconds: 600,
    actualDurationSeconds: 600,
    status: 'COMPLETED',
    startedAt: '2026-10-01T09:00:00.000Z'
  };

  const masterResult = YogaStorageService.recordSession(null, masterSession, true);
  assert.strictEqual(masterResult.success, true);
  assert.strictEqual(masterResult.persistenceStatus, 'PERSISTED');

  const masterState = YogaStorageService.loadState(null, true);
  assert.strictEqual(masterState.profileId, 'default');
  assert.strictEqual(masterState.history.length, 1);
  assert.strictEqual(masterState.history[0].sessionId, 'sess_master_01');
  logPass('Master profile explicitly authorized writes and reads to default partition');

  // -------------------------------------------------------------
  // TEST 5: Service-level duplicate session prevention
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Duplicate session prevention ---');
  // Attempt to record the same session ID again
  const dupResult = YogaStorageService.recordSession(null, masterSession, true);
  assert.strictEqual(dupResult.success, true); // Safe idempotent handling
  const masterStateAfterDup = YogaStorageService.loadState(null, true);
  assert.strictEqual(masterStateAfterDup.history.length, 1); // Length did NOT increase!
  logPass('Duplicate session ID idempotently ignored without duplicate entry creation');

  // -------------------------------------------------------------
  // TEST 6: Maximum 200 records boundary & deterministic newest-retention
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Maximum 200 records boundary & newest-retention ---');
  const capProfile = 'profile_cap_200';
  for (let i = 1; i <= 215; i++) {
    const res = YogaStorageService.recordSession(capProfile, {
      sessionId: `cap_sess_${i}`,
      profileId: capProfile,
      practiceId: 'shavasana',
      targetDurationSeconds: 300,
      actualDurationSeconds: 300,
      status: 'COMPLETED',
      startedAt: new Date(2026, 0, 1, 0, i, 0).toISOString()
    });
    assert.strictEqual(res.success, true);
  }

  const capState = YogaStorageService.loadState(capProfile);
  assert.strictEqual(capState.history.length, 200, `Expected exactly 200 records, got ${capState.history.length}`);
  // Most recent session must be cap_sess_215
  assert.strictEqual(capState.history[0].sessionId, 'cap_sess_215');
  // Oldest kept session must be cap_sess_16 (215 - 200 + 1)
  assert.strictEqual(capState.history[199].sessionId, 'cap_sess_16');
  logPass('History deterministically retains newest 200 records and discards oldest beyond 200');

  // -------------------------------------------------------------
  // TEST 7: Completed and cancelled session records accurate representation
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Completed and cancelled session records ---');
  const cancelSession: YogaSessionRecord = {
    sessionId: 'sess_arjun_cancelled',
    profileId: userA,
    practiceId: 'anulom_vilom',
    targetDurationSeconds: 600,
    actualDurationSeconds: 154,
    status: 'CANCELLED',
    startedAt: '2026-10-02T06:00:00.000Z'
  };
  YogaStorageService.recordSession(userA, cancelSession);
  const userAState = YogaStorageService.loadState(userA);
  assert.strictEqual(userAState.history.length, 2);
  assert.strictEqual(userAState.history[0].sessionId, 'sess_arjun_cancelled');
  assert.strictEqual(userAState.history[0].status, 'CANCELLED');
  assert.strictEqual(userAState.history[0].actualDurationSeconds, 154);
  logPass('Completed and cancelled sessions accurately recorded with actual duration');

  // -------------------------------------------------------------
  // TEST 8: Storage write exception & honest persistence status
  // -------------------------------------------------------------
  console.log('\n--- TEST 8: Honest persistence status on storage failure ---');
  mockStorage.throwOnSet = true;
  const excProfile = 'profile_exc_test';
  const excSession: YogaSessionRecord = {
    sessionId: 'sess_exc_01',
    profileId: excProfile,
    practiceId: 'tadasana',
    targetDurationSeconds: 300,
    actualDurationSeconds: 300,
    status: 'COMPLETED',
    startedAt: '2026-10-03T06:00:00.000Z'
  };

  const excResult = YogaStorageService.recordSession(excProfile, excSession);
  assert.strictEqual(excResult.success, true); // Session practice does NOT crash
  assert.strictEqual(excResult.persistenceStatus, 'MEMORY_ONLY'); // Honest reporting!
  mockStorage.throwOnSet = false;
  logPass('LocalStorage failure reports MEMORY_ONLY honestly without interrupting session');

  // -------------------------------------------------------------
  // TEST 9: Malformed JSON and invalid schema healing
  // -------------------------------------------------------------
  console.log('\n--- TEST 9: Malformed JSON and invalid schema healing ---');
  const corruptProfile = 'profile_corrupt';
  const corruptKey = YogaStorageService.getStorageKey(corruptProfile)!;

  // 9a: Malformed JSON
  mockStorage.setRaw(corruptKey, '{ broken json string: 123');
  const healed1 = YogaStorageService.loadState(corruptProfile);
  assert.strictEqual(healed1.version, '1.0.0');
  assert.strictEqual(healed1.profileId, corruptProfile);
  assert.strictEqual(healed1.history.length, 0);

  // 9b: Invalid schema
  mockStorage.setRaw(corruptKey, JSON.stringify({ version: '2.0.0', data: 'junk' }));
  const healed2 = YogaStorageService.loadState(corruptProfile);
  assert.strictEqual(healed2.version, '1.0.0');
  assert.strictEqual(healed2.history.length, 0);
  logPass('Malformed JSON and invalid schema self-heal without exceptions');

  // -------------------------------------------------------------
  // TEST 10: Complete isolation from Meditation storage keys
  // -------------------------------------------------------------
  console.log('\n--- TEST 10: Isolation from Meditation keys ---');
  const yogaKey = YogaStorageService.getStorageKey('test_user')!;
  assert.ok(yogaKey.startsWith('jeevandarpan_yoga_v1_'));
  assert.strictEqual(yogaKey.includes('meditation'), false);
  logPass('Yoga storage namespace is strictly isolated from Meditation');

  console.log('\n================================================================');
  console.log(`ALL ${passCount}/10 YOGA STORAGE AUDITED TESTS PASSED (100%)`);
  console.log('================================================================');
} catch (err) {
  console.error('Test failed:', err);
  process.exit(1);
}
