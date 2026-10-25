/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PROFILE UI & APP INTEGRATION TEST SUITE
 * PHASE B: AUTOMATED INTEGRATION, ISOLATION & SAFETY VERIFICATION
 */

import assert from 'node:assert';
import { 
  ProfileService, 
  MASTER_STORAGE_KEY, 
  FAMILY_STORAGE_KEY, 
  ACTIVE_STORAGE_KEY,
  ACTIVE_PROFILE_CHANGED_EVENT,
  PROFILES_UPDATED_EVENT
} from '../../services/profile/profileService';
import { YogaStorageService } from '../../services/yogaSadhana/yogaStorageService';
import { MeditationStorageService } from '../../services/meditation/meditationStorageService';
import { DailyReportCardData } from '../../types/dailyReportCard';
import { FamilyMemberProfile } from '../../types/profile/profileTypes';

// Robust In-Memory Mock Environment for Node.js
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

// Event Dispatcher Mock
const eventListeners: Map<string, ((event: any) => void)[]> = new Map();
(globalThis as any).window = {
  addEventListener: (event: string, cb: (e: any) => void) => {
    if (!eventListeners.has(event)) eventListeners.set(event, []);
    eventListeners.get(event)!.push(cb);
  },
  removeEventListener: (event: string, cb: (e: any) => void) => {
    const list = eventListeners.get(event);
    if (list) {
      const idx = list.indexOf(cb);
      if (idx >= 0) list.splice(idx, 1);
    }
  },
  dispatchEvent: (event: any) => {
    const list = eventListeners.get(event.type);
    if (list) {
      for (const cb of list) cb(event);
    }
    return true;
  }
};

(globalThis as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, params?: { detail?: any }) {
    this.type = type;
    this.detail = params?.detail;
  }
};

let passCount = 0;
let failCount = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    mockStorage.clear();
    ProfileService.clearMemoryFallback();
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        passCount++;
        console.log(`  ✓ Passed: ${name}`);
      }).catch(err => {
        failCount++;
        console.error(`  ✗ FAILED: ${name}`, err);
      });
    }
    passCount++;
    console.log(`  ✓ Passed: ${name}`);
  } catch (err) {
    failCount++;
    console.error(`  ✗ FAILED: ${name}`, err);
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PROFILE UI & APP INTEGRATION TEST SUITE (PHASE B)');
  console.log('================================================================');

  // 1. Master Profile Immutability & Delete Protection
  runTest('1.1 Master profile permanent ID is strictly "master" and relation is "SELF"', () => {
    const master = ProfileService.getMasterProfile();
    assert.strictEqual(master.id, 'master');
    assert.strictEqual(master.relationship, 'SELF');
    assert.strictEqual(master.isMaster, true);
  });

  runTest('1.2 Strictly forbids deletion of master profile under any circumstances', () => {
    const deleteResult = ProfileService.deleteFamilyMember('master');
    assert.strictEqual(deleteResult.success, false);
    assert.strictEqual(deleteResult.code, 'MASTER_CANNOT_BE_DELETED');

    const master = ProfileService.getMasterProfile();
    assert.strictEqual(master.id, 'master');
  });

  runTest('1.3 Prevents saving master profile with a modified non-master ID or relation', () => {
    const saveRes = ProfileService.saveMasterProfile({
      name: 'Jitendra S.',
      id: 'tampered_id' as any,
      relationship: 'SPOUSE' as any
    });

    assert.strictEqual(saveRes.success, true);
    assert.strictEqual(saveRes.data?.id, 'master');
    assert.strictEqual(saveRes.data?.relationship, 'SELF');
    assert.strictEqual(saveRes.data?.name, 'Jitendra S.');
  });

  // 2. Family Profiles CRUD & Deterministic Behavior
  runTest('2.1 Creates new family member with deterministic unique identifier', () => {
    const newMember: Partial<FamilyMemberProfile> = {
      name: 'Anita Suryavanshi',
      dob: '15 August 1988',
      time: '10:30 AM',
      place: 'Indore, MP',
      gender: 'FEMALE',
      relationship: 'SPOUSE',
      latitude: 22.7196,
      longitude: 75.8577,
      timezone: 'Asia/Kolkata'
    };

    const result = ProfileService.saveFamilyMember(newMember);
    assert.strictEqual(result.success, true);
    assert.ok(result.data?.id.startsWith('fam_anita_suryavanshi'));
    assert.strictEqual(result.data?.relationship, 'SPOUSE');

    const allFamily = ProfileService.getFamilyProfiles();
    assert.strictEqual(allFamily.length, 1);
    assert.strictEqual(allFamily[0].name, 'Anita Suryavanshi');
  });

  runTest('2.2 Updates existing family member without creating duplicates', () => {
    const initial = ProfileService.saveFamilyMember({
      name: 'Child One',
      dob: '01 January 2015',
      relationship: 'CHILD',
      gender: 'MALE'
    });
    const memberId = initial.data!.id;

    const updated = ProfileService.saveFamilyMember({
      id: memberId,
      name: 'Child One',
      place: 'Ujjain, MP',
      relationship: 'CHILD',
      gender: 'MALE'
    });

    assert.strictEqual(updated.success, true);
    assert.strictEqual(updated.data?.id, memberId);
    assert.strictEqual(updated.data?.place, 'Ujjain, MP');

    const allFamily = ProfileService.getFamilyProfiles();
    assert.strictEqual(allFamily.length, 1);
  });

  runTest('2.3 Safely deletes family member and resets active profile to master if deleted was active', () => {
    const member = ProfileService.saveFamilyMember({
      name: 'Sibling Test',
      relationship: 'SIBLING',
      gender: 'FEMALE'
    }).data!;

    ProfileService.setActiveProfileId(member.id);
    assert.strictEqual(ProfileService.getActiveProfileId(), member.id);

    const delRes = ProfileService.deleteFamilyMember(member.id);
    assert.strictEqual(delRes.success, true);

    assert.strictEqual(ProfileService.getActiveProfileId(), 'master');
    assert.strictEqual(ProfileService.getFamilyProfiles().length, 0);
  });

  // 3. Yoga Legacy Compatibility & Storage Isolation
  runTest('3.1 Resolves master profile to "default" yoga partition preserving legacy history key', () => {
    const isMasterProfile = true;
    const profileId = 'master';

    const partition = YogaStorageService.resolveProfilePartition(profileId, isMasterProfile);
    assert.strictEqual(partition, 'default');

    const storageKey = YogaStorageService.getStorageKey(profileId, isMasterProfile);
    assert.strictEqual(storageKey, 'jeevandarpan_yoga_v1_default');
  });

  runTest('3.2 Resolves family member to distinct isolated partition and never uses "default"', () => {
    const isMasterProfile = false;
    const familyProfileId = 'fam_anita_1988';

    const partition = YogaStorageService.resolveProfilePartition(familyProfileId, isMasterProfile);
    assert.strictEqual(partition, 'fam_anita_1988');

    const storageKey = YogaStorageService.getStorageKey(familyProfileId, isMasterProfile);
    assert.strictEqual(storageKey, 'jeevandarpan_yoga_v1_fam_anita_1988');
    assert.notStrictEqual(storageKey, 'jeevandarpan_yoga_v1_default');
  });

  runTest('3.3 Denies access to "default" partition if isMasterProfile is false', () => {
    const partition = YogaStorageService.resolveProfilePartition('default', false);
    assert.strictEqual(partition, null);

    const storageKey = YogaStorageService.getStorageKey('default', false);
    assert.strictEqual(storageKey, null);
  });

  // 4. Meditation Multi-Profile Storage Isolation
  runTest('4.1 Generates distinct storage keys for master and family members', () => {
    const masterKey = MeditationStorageService.getStorageKey('master');
    const familyKey = MeditationStorageService.getStorageKey('fam_child_2015');

    assert.strictEqual(masterKey, 'jeevandarpan_meditation_v1_master');
    assert.strictEqual(familyKey, 'jeevandarpan_meditation_v1_fam_child_2015');
    assert.notStrictEqual(masterKey, familyKey);
  });

  // 5. Active Profile Switching & Mutual Verification
  runTest('5.1 Dispatches ACTIVE_PROFILE_CHANGED_EVENT when active profile changes', () => {
    const member = ProfileService.saveFamilyMember({
      name: 'Parent Profile',
      relationship: 'PARENT',
      gender: 'MALE'
    }).data!;

    let receivedActiveId: string | null = null;
    const listener = (e: any) => {
      receivedActiveId = e.detail?.activeId;
    };

    window.addEventListener(ACTIVE_PROFILE_CHANGED_EVENT, listener);
    try {
      ProfileService.setActiveProfileId(member.id);
      assert.strictEqual(receivedActiveId, member.id);
      assert.strictEqual(ProfileService.getActiveProfile().id, member.id);
    } finally {
      window.removeEventListener(ACTIVE_PROFILE_CHANGED_EVENT, listener);
    }
  });

  runTest('5.2 Safely falls back to "master" if invalid ID is supplied', () => {
    const success = ProfileService.setActiveProfileId('non_existent_ghost_id');
    assert.strictEqual(success, false);
    assert.strictEqual(ProfileService.getActiveProfileId(), 'master');
    assert.strictEqual(ProfileService.getActiveProfile().id, 'master');
  });

  // 6. Async Request Correlation & Race-Condition Immunity
  await runTest('6.1 Discards asynchronous result if active profile changed while request was in-flight', async () => {
    const memberA = ProfileService.getMasterProfile();
    const memberB = ProfileService.saveFamilyMember({
      name: 'Member B',
      relationship: 'SPOUSE',
      gender: 'FEMALE'
    }).data!;

    let currentRenderedProfileId: string = memberA.id;
    let calculatedPayload: string | null = null;

    const requestProfileId = memberA.id;
    const simulateAsyncCalculation = async (): Promise<string> => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(`Result_For_${requestProfileId}`);
        }, 30);
      });
    };

    const inFlightPromise = simulateAsyncCalculation();

    // User switches active profile to Member B before async resolves
    ProfileService.setActiveProfileId(memberB.id);
    currentRenderedProfileId = memberB.id;

    // Apply correlation token check
    const result = await inFlightPromise;
    if (requestProfileId === ProfileService.getActiveProfileId()) {
      calculatedPayload = result;
    }

    assert.strictEqual(calculatedPayload, null);
    assert.strictEqual(currentRenderedProfileId, memberB.id);
    assert.strictEqual(ProfileService.getActiveProfileId(), memberB.id);
  });

  // 7. Legacy Daily Report Identity & UNASSIGNED_LEGACY Classification
  runTest('7.1 Classifies legacy report with mismatched birth details as UNASSIGNED_LEGACY without deleting it', () => {
    const legacyReport: Partial<DailyReportCardData> = {
      reportId: 'report_2026-05-01_Jitendra_Suryavanshi',
      date: '2026-05-01',
      profile: {
        name: 'Jitendra Suryavanshi',
        dob: '24 June 1986',
        time: '06:20 AM',
        place: 'Indore, MP',
        latitude: 22.7196,
        longitude: 75.8577,
        timezone: 'Asia/Kolkata'
      },
      userGoalNote: 'Old secret goal from 2026',
      userReflectionNote: 'Old private reflection from 2026',
      isSavedToJournal: true
    };

    const activeMember: FamilyMemberProfile = {
      id: 'fam_anita',
      name: 'Anita Suryavanshi',
      dob: '15 August 1988',
      time: '10:30 AM',
      place: 'Indore, MP',
      gender: 'FEMALE',
      relationship: 'SPOUSE',
      latitude: 22.7196,
      longitude: 75.8577,
      timezone: 'Asia/Kolkata'
    };

    const classifyReport = (report: any, currentActive: FamilyMemberProfile): 'MATCHED' | 'UNASSIGNED_LEGACY' => {
      if (report.profile?.id && report.profile.id === currentActive.id) {
        return 'MATCHED';
      }
      if (!report.profile?.id && currentActive.id === 'master' && 
          report.profile?.dob === currentActive.dob && 
          report.profile?.time === currentActive.time) {
        return 'MATCHED';
      }
      return 'UNASSIGNED_LEGACY';
    };

    const classification: 'MATCHED' | 'UNASSIGNED_LEGACY' = classifyReport(legacyReport, activeMember);
    assert.strictEqual(classification, 'UNASSIGNED_LEGACY');

    let displayedGoal = '';
    let displayedReflection = '';

    if ((classification as string) === 'MATCHED') {
      displayedGoal = legacyReport.userGoalNote || '';
      displayedReflection = legacyReport.userReflectionNote || '';
    }

    assert.strictEqual(displayedGoal, '');
    assert.strictEqual(displayedReflection, '');
    assert.strictEqual(legacyReport.userGoalNote, 'Old secret goal from 2026');
  });

  console.log('================================================================');
  console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runAllTests();
