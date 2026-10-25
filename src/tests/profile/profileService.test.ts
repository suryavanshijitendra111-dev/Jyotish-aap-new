/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PROFILE SERVICE UNIT & INTEGRATION TEST SUITE
 * PHASE A: FOUNDATION, DETERMINISTIC MIGRATION & RECOVERY
 */

import assert from 'node:assert';
import {
  ProfileService,
  MASTER_STORAGE_KEY,
  FAMILY_STORAGE_KEY,
  ACTIVE_STORAGE_KEY,
  DEFAULT_MASTER_PROFILE
} from '../../services/profile/profileService';
import { FamilyMemberProfile } from '../../types/profile/profileTypes';

// Mock localStorage for Node.js environment
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

  getAllKeys(): string[] {
    return Array.from(this.store.keys());
  }
}

const mockStorage = new MockLocalStorage();
(globalThis as any).localStorage = mockStorage;
(globalThis as any).window = {
  dispatchEvent: () => true
};

let passCount = 0;
function logPass(msg: string) {
  passCount++;
  console.log(`  ✓ Passed: ${msg}`);
}

console.log('================================================================');
console.log('JEEVANDARPAN — PROFILE SERVICE FOUNDATION TEST SUITE');
console.log('================================================================');

try {
  // ---------------------------------------------------------------------------
  // TEST 1: Default Master Profile Loading on Clean Storage
  // ---------------------------------------------------------------------------
  mockStorage.clear();
  ProfileService.clearMemoryFallback();

  const master = ProfileService.getMasterProfile();
  assert.strictEqual(master.id, 'master', 'Master ID must be strictly "master"');
  assert.strictEqual(master.name, DEFAULT_MASTER_PROFILE.name, 'Master name must match default');
  assert.strictEqual(master.isMaster, true, 'isMaster must be true');
  assert.strictEqual(master.relationship, 'SELF', 'Relationship must be SELF');
  assert.strictEqual(mockStorage.getItem(MASTER_STORAGE_KEY) !== null, true, 'Master must be persisted to storage');
  logPass('Test 1: Default Master Profile loads and persists correctly on clean storage');

  // ---------------------------------------------------------------------------
  // TEST 2: Master Profile Update & Immutability of ID
  // ---------------------------------------------------------------------------
  const updateResult = ProfileService.saveMasterProfile({
    id: 'hacked_id' as any, // Malicious attempt to change master ID
    place: 'Bhopal, MP',
    mobileNumbers: ['9826011111']
  });
  assert.strictEqual(updateResult.success, true);
  assert.strictEqual(updateResult.data?.id, 'master', 'Master ID must remain "master" even if payload had another ID');
  assert.strictEqual(updateResult.data?.place, 'Bhopal, MP');
  assert.deepStrictEqual(updateResult.data?.mobileNumbers, ['9826011111']);

  const refreshedMaster = ProfileService.getMasterProfile();
  assert.strictEqual(refreshedMaster.place, 'Bhopal, MP');
  assert.strictEqual(refreshedMaster.id, 'master');
  logPass('Test 2: Master Profile update succeeds while strictly preserving "master" ID');

  // ---------------------------------------------------------------------------
  // TEST 3: Master Profile Deletion Denial
  // ---------------------------------------------------------------------------
  const delMasterResult = ProfileService.deleteFamilyMember('master');
  assert.strictEqual(delMasterResult.success, false, 'Master deletion must return failure');
  assert.strictEqual(delMasterResult.code, 'MASTER_CANNOT_BE_DELETED');
  assert.strictEqual(ProfileService.getMasterProfile().id, 'master', 'Master profile must still exist');
  logPass('Test 3: Master Profile deletion is strictly prevented with MASTER_CANNOT_BE_DELETED');

  // ---------------------------------------------------------------------------
  // TEST 4: Adding Family Member with Multi-Mobile Numbers
  // ---------------------------------------------------------------------------
  const memberA = ProfileService.saveFamilyMember({
    name: 'Aarav Suryavanshi',
    dob: '15 August 2012',
    time: '10:30 AM',
    place: 'Indore, MP',
    latitude: 22.7196,
    longitude: 75.8577,
    timezone: 'Asia/Kolkata',
    gender: 'MALE',
    relationship: 'CHILD',
    mobileNumbers: ['9826099999', '9425088888']
  });

  assert.strictEqual(memberA.success, true);
  assert.ok(memberA.data?.id.startsWith('fam_'), 'Family member ID must start with "fam_"');
  assert.strictEqual(memberA.data?.name, 'Aarav Suryavanshi');
  assert.strictEqual(memberA.data?.relationship, 'CHILD');
  assert.strictEqual(memberA.data?.mobileNumbers?.length, 2);

  const familyList = ProfileService.getFamilyProfiles();
  assert.strictEqual(familyList.length, 1);
  assert.strictEqual(familyList[0].id, memberA.data?.id);
  logPass('Test 4: Family member successfully added with multiple mobile numbers and relation');

  // ---------------------------------------------------------------------------
  // TEST 5: Deterministic Legacy Migration (Identical IDs across repeated runs)
  // ---------------------------------------------------------------------------
  const legacyListRaw = [
    {
      name: 'Priya Suryavanshi',
      dob: '10 March 1988',
      time: '04:15 PM',
      place: 'Ujjain, MP',
      latitude: 23.1765,
      longitude: 75.7885,
      timezone: 'Asia/Kolkata'
      // Notice: NO ID, NO relationship, NO gender
    },
    {
      name: 'Priya Suryavanshi', // Identical name & DOB
      dob: '10 March 1988',
      time: '04:15 PM',
      place: 'Ujjain, MP',
      latitude: 23.1765,
      longitude: 75.7885,
      timezone: 'Asia/Kolkata'
      // Duplicate record test
    }
  ];

  mockStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(legacyListRaw));

  // Run 1 of migration
  const migratedRun1 = ProfileService.getFamilyProfiles();
  assert.strictEqual(migratedRun1.length, 2);
  const id1_first = migratedRun1[0].id;
  const id2_first = migratedRun1[1].id;

  assert.notStrictEqual(id1_first, id2_first, 'Duplicate input members must receive distinct IDs');
  assert.ok(id1_first.startsWith('fam_priya_suryavanshi'));
  assert.ok(id2_first.includes('_2') || id2_first.includes('dup') || id2_first !== id1_first);

  // Run 2 of migration: Must be strictly IDEMPOTENT (no ID mutation)
  const migratedRun2 = ProfileService.getFamilyProfiles();
  assert.strictEqual(migratedRun2[0].id, id1_first, 'Member 1 ID must remain completely identical across re-runs');
  assert.strictEqual(migratedRun2[1].id, id2_first, 'Member 2 ID must remain completely identical across re-runs');
  logPass('Test 5: Legacy profiles receive deterministic, distinct IDs and remain strictly idempotent');

  // ---------------------------------------------------------------------------
  // TEST 6: ID Collision & Overwrite Prevention (Zero Merge)
  // ---------------------------------------------------------------------------
  // Injected data with artificial ID collision
  const collidingData = [
    { id: 'fam_fixed_id', name: 'Member Alpha', dob: '1990-01-01' },
    { id: 'fam_fixed_id', name: 'Member Beta', dob: '1992-02-02' } // Colliding ID
  ];
  mockStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(collidingData));

  const resolvedCollisions = ProfileService.getFamilyProfiles();
  assert.strictEqual(resolvedCollisions.length, 2, 'No colliding member may be dropped or merged');
  assert.strictEqual(resolvedCollisions[0].name, 'Member Alpha');
  assert.strictEqual(resolvedCollisions[1].name, 'Member Beta');
  assert.notStrictEqual(resolvedCollisions[0].id, resolvedCollisions[1].id, 'Collision must be disambiguated');
  logPass('Test 6: Storage ID collision is disambiguated without merging or dropping records');

  // ---------------------------------------------------------------------------
  // TEST 7: Corrupt JSON Quarantine Safety (Unique Keys, Zero Overwrite)
  // ---------------------------------------------------------------------------
  const corruptRaw1 = '{ invalid JSON 1 ...';
  const corruptRaw2 = '{ invalid JSON 2 ...';

  const qKey1 = ProfileService.quarantineCorruptData(corruptRaw1, 'test');
  const qKey2 = ProfileService.quarantineCorruptData(corruptRaw2, 'test');

  assert.notStrictEqual(qKey1, qKey2, 'Quarantine keys must be unique');
  assert.strictEqual(mockStorage.getItem(qKey1), corruptRaw1, 'Original corrupt payload 1 must be preserved');
  assert.strictEqual(mockStorage.getItem(qKey2), corruptRaw2, 'Original corrupt payload 2 must be preserved');

  // Now inject corrupt JSON directly into Master Storage key
  mockStorage.setItem(MASTER_STORAGE_KEY, 'CORRUPTED_MASTER_PAYLOAD');
  const recoveredMaster = ProfileService.getMasterProfile();
  assert.strictEqual(recoveredMaster.id, 'master', 'Corrupt master storage safely recovers to default master');
  
  // Verify that the corrupt master payload was quarantined
  const allKeys = mockStorage.getAllKeys();
  const quarantinedMaster = allKeys.find(k => k.startsWith('jeevandarpan_corrupt_master_'));
  assert.ok(quarantinedMaster, 'Corrupt master payload must be quarantined');
  assert.strictEqual(mockStorage.getItem(quarantinedMaster!), 'CORRUPTED_MASTER_PAYLOAD');
  logPass('Test 7: Corrupt JSON is safely quarantined with zero collision or data loss');

  // ---------------------------------------------------------------------------
  // TEST 8: Active Profile Selection & Mutual Verification
  // ---------------------------------------------------------------------------
  // Setup: Master and 1 valid family member
  mockStorage.clear();
  ProfileService.clearMemoryFallback();
  ProfileService.getMasterProfile(); // resets master
  const validMember = ProfileService.saveFamilyMember({
    name: 'Rohan Suryavanshi',
    dob: '01 Jan 2000'
  }).data!;

  // 1. Initial active profile is 'master'
  assert.strictEqual(ProfileService.getActiveProfileId(), 'master');
  assert.strictEqual(ProfileService.getActiveProfile().id, 'master');

  // 2. Switch to valid family member
  const switchSuccess = ProfileService.setActiveProfileId(validMember.id);
  assert.strictEqual(switchSuccess, true);
  assert.strictEqual(ProfileService.getActiveProfileId(), validMember.id);
  assert.strictEqual(ProfileService.getActiveProfile().name, 'Rohan Suryavanshi');

  // 3. Attempt to switch to invalid/phantom ID
  const invalidSwitch = ProfileService.setActiveProfileId('phantom_unknown_id');
  assert.strictEqual(invalidSwitch, false);
  assert.strictEqual(ProfileService.getActiveProfileId(), 'master', 'Must fallback to "master" on invalid ID');
  assert.strictEqual(ProfileService.getActiveProfile().id, 'master');

  // 4. Deleting currently active member must switch active back to 'master'
  ProfileService.setActiveProfileId(validMember.id);
  assert.strictEqual(ProfileService.getActiveProfileId(), validMember.id);

  ProfileService.deleteFamilyMember(validMember.id);
  assert.strictEqual(ProfileService.getActiveProfileId(), 'master', 'Must revert to master when active member is deleted');
  logPass('Test 8: Active profile switching and mutual verification safely guard profile selection');

  // ---------------------------------------------------------------------------
  // TEST 9: In-Memory Fallback When LocalStorage Throws (QuotaExceededError Simulation)
  // ---------------------------------------------------------------------------
  (globalThis as any).localStorage = {
    getItem: () => { throw new Error('SecurityError: Access Denied in Sandbox'); },
    setItem: () => { throw new Error('QuotaExceededError: LocalStorage Full'); },
    removeItem: () => { throw new Error('SecurityError'); }
  };

  ProfileService.clearMemoryFallback();
  const memMaster = ProfileService.getMasterProfile();
  assert.strictEqual(memMaster.id, 'master', 'In-memory fallback operates seamlessly on storage error');

  const memMember = ProfileService.saveFamilyMember({
    name: 'Memory Member',
    dob: '2020-01-01'
  });
  assert.strictEqual(memMember.success, true);
  assert.strictEqual(ProfileService.getFamilyProfiles().length, 1);
  assert.strictEqual(ProfileService.getFamilyProfiles()[0].name, 'Memory Member');
  logPass('Test 9: In-memory fallback handles LocalStorage security and QuotaExceeded errors smoothly');

  console.log('================================================================');
  console.log(`ALL ${passCount} PROFILE SERVICE TESTS PASSED PERFECTLY!`);
  console.log('================================================================');
} catch (err) {
  console.error('Test Suite Failure:', err);
  process.exit(1);
}
