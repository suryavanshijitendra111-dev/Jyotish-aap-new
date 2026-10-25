/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PROFILE BACKUP, RESTORE & ROLLBACK INTEGRATION TESTS
 * PHASE A: BACKUP VALIDATION, MUTUAL VERIFICATION & ROLLBACK RECOVERY
 */

import assert from 'node:assert';
import { BackupService } from '../../services/backup/backupService';
import { RestoreService } from '../../services/backup/restoreService';
import { RollbackService } from '../../services/backup/rollbackService';
import { BackupStorageService } from '../../services/backup/backupStorageService';
import { BackupValidationService } from '../../services/backup/backupValidationService';
import {
  ProfileService,
  MASTER_STORAGE_KEY,
  FAMILY_STORAGE_KEY,
  ACTIVE_STORAGE_KEY
} from '../../services/profile/profileService';
import { BackupManifest } from '../../types/backup';

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

async function runTests() {
  let passCount = 0;
  function logPass(msg: string) {
    passCount++;
    console.log(`  ✓ Passed: ${msg}`);
  }

  console.log('================================================================');
  console.log('JEEVANDARPAN — PROFILE BACKUP, RESTORE & ROLLBACK INTEGRATION TEST SUITE');
  console.log('================================================================');

  // ---------------------------------------------------------------------------
  // TEST 1: Backup Creation Captures Active Profile ID
  // ---------------------------------------------------------------------------
  mockStorage.clear();
  ProfileService.clearMemoryFallback();

  // Setup state: Master + 1 Member, with Member active
  ProfileService.getMasterProfile();
  const fam1 = ProfileService.saveFamilyMember({
    name: 'Ananya Suryavanshi',
    dob: '05 May 2015',
    relationship: 'CHILD'
  }).data!;

  ProfileService.setActiveProfileId(fam1.id);
  assert.strictEqual(mockStorage.getItem(ACTIVE_STORAGE_KEY), fam1.id);

  const manifest = BackupService.createFullBackup('Test Backup Active Member');
  assert.strictEqual(manifest.payload.activeProfileId, fam1.id, 'Payload must capture active profile ID');
  assert.ok(manifest.payload.familyProfiles?.some(p => (p as any).id === fam1.id), 'Family profile must be included');
  logPass('Test 1: Full backup successfully captures activeProfileId and family profile data');

  // Helper to build a valid BackupManifest
  function makeValidManifest(id: string, label: string, payload: any): BackupManifest {
    return {
      schemaVersion: '1.0.0',
      backupVersion: '2026.09.v1',
      id,
      createdAt: new Date().toISOString(),
      appIdentifier: 'JeevanDarpan-Private-Family-Edition',
      label,
      backupType: 'FULL',
      checksum: BackupValidationService.calculateChecksum(payload),
      sizeBytes: JSON.stringify(payload).length,
      metadata: {
        deviceLanguage: 'hi',
        appVersion: '1.0',
        recordCounts: { reports: 0, prashna: 0, reflections: 0, sensitivities: 0, settings: 0, profiles: 2 }
      },
      exclusions: {
        sensitiveCredentialsExcluded: true,
        excludedKeys: [],
        noticeEn: 'Safe',
        noticeHi: 'सुरक्षित'
      },
      payload
    };
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Legacy Backup Restore (Without activeProfileId) Safely Defaults to 'master'
  // ---------------------------------------------------------------------------
  const legacyPayload = {
    masterProfile: {
      name: 'Jitendra Suryavanshi',
      dob: '24 June 1986',
      time: '06:20 AM',
      place: 'Indore, MP',
      latitude: 22.7196,
      longitude: 75.8577,
      timezone: 'Asia/Kolkata'
    },
    familyProfiles: [
      {
        id: 'fam_legacy_member',
        name: 'Legacy Member',
        dob: '1995-01-01',
        time: '12:00 PM',
        place: 'Indore, MP',
        latitude: 22.7196,
        longitude: 75.8577,
        timezone: 'Asia/Kolkata',
        relationship: 'SIBLING',
        gender: 'MALE'
      }
    ]
    // Notice: activeProfileId is undefined
  };

  const legacyManifest = makeValidManifest('bkp_legacy_test', 'Old Backup Without Active ID', legacyPayload);

  // Reset storage and restore legacy manifest
  mockStorage.clear();
  const restoreResult1 = await RestoreService.executeRestore(legacyManifest, {
    restoreMasterProfile: true,
    restoreFamilyProfiles: true,
    restoreJournalAndWellness: false,
    restoreReportCards: false,
    restorePrashnaHistory: false,
    restoreSettings: false,
    restoreOwnerConfig: false,
    createPreRestoreRollback: false
  });

  assert.strictEqual(restoreResult1.success, true);
  assert.strictEqual(mockStorage.getItem(ACTIVE_STORAGE_KEY), 'master', 'Legacy restore must safely default active profile to "master"');
  assert.strictEqual(ProfileService.getActiveProfileId(), 'master');
  logPass('Test 2: Legacy backup lacking activeProfileId restores smoothly with fallback to "master"');

  // ---------------------------------------------------------------------------
  // TEST 3: Inconsistent / Invalid activeProfileId Falls Back Safely to 'master'
  // ---------------------------------------------------------------------------
  const inconsistentPayload = {
    ...legacyPayload,
    activeProfileId: 'ghost_non_existent_profile_id_999' // Inconsistent ID!
  };
  const inconsistentManifest = makeValidManifest('bkp_inconsistent_test', 'Inconsistent Active ID', inconsistentPayload);

  mockStorage.clear();
  const restoreResult2 = await RestoreService.executeRestore(inconsistentManifest, {
    restoreMasterProfile: true,
    restoreFamilyProfiles: true,
    restoreJournalAndWellness: false,
    restoreReportCards: false,
    restorePrashnaHistory: false,
    restoreSettings: false,
    restoreOwnerConfig: false,
    createPreRestoreRollback: false
  });

  assert.strictEqual(restoreResult2.success, true);
  assert.strictEqual(mockStorage.getItem(ACTIVE_STORAGE_KEY), 'master', 'Inconsistent activeProfileId must be caught and set to "master"');
  assert.strictEqual(ProfileService.getActiveProfileId(), 'master');
  logPass('Test 3: Inconsistent/ghost activeProfileId is safely caught by mutual verification and falls back to "master"');

  // ---------------------------------------------------------------------------
  // TEST 4: Valid Family Active Profile ID Restored Perfectly
  // ---------------------------------------------------------------------------
  const validFamilyPayload = {
    ...legacyPayload,
    activeProfileId: 'fam_legacy_member' // Matches one of the family members!
  };
  const validFamilyManifest = makeValidManifest('bkp_valid_family_test', 'Valid Family Active ID', validFamilyPayload);

  mockStorage.clear();
  const restoreResult3 = await RestoreService.executeRestore(validFamilyManifest, {
    restoreMasterProfile: true,
    restoreFamilyProfiles: true,
    restoreJournalAndWellness: false,
    restoreReportCards: false,
    restorePrashnaHistory: false,
    restoreSettings: false,
    restoreOwnerConfig: false,
    createPreRestoreRollback: false
  });

  assert.strictEqual(restoreResult3.success, true);
  assert.strictEqual(mockStorage.getItem(ACTIVE_STORAGE_KEY), 'fam_legacy_member', 'Valid family active profile ID must be restored');
  assert.strictEqual(ProfileService.getActiveProfileId(), 'fam_legacy_member');
  assert.strictEqual(ProfileService.getActiveProfile().name, 'Legacy Member');
  logPass('Test 4: Valid family member activeProfileId is restored and activated correctly');

  // ---------------------------------------------------------------------------
  // TEST 5: Rollback Snapshot Recovers Previous Active Profile State
  // ---------------------------------------------------------------------------
  // 1. Initial State: active profile is 'master'
  mockStorage.clear();
  ProfileService.clearMemoryFallback();
  ProfileService.getMasterProfile();
  const preSnapshotMember = ProfileService.saveFamilyMember({
    name: 'Pre Snapshot Member',
    dob: '2001-01-01'
  }).data!;
  ProfileService.setActiveProfileId('master');

  // 2. Capture a rollback snapshot before doing changes
  const snapshotManifest = BackupService.createFullBackup('Pre State Snapshot');
  const rollbackSnapshot = {
    id: 'rb_snapshot_1',
    timestamp: Date.now(),
    label: 'Auto Snapshot',
    targetBackupId: 'dummy',
    previousStateBackup: snapshotManifest
  };
  BackupStorageService.saveRollbackSnapshot(rollbackSnapshot);

  // 3. Now change state: switch active profile to family member
  ProfileService.setActiveProfileId(preSnapshotMember.id);
  assert.strictEqual(ProfileService.getActiveProfileId(), preSnapshotMember.id);

  // 4. Apply rollback
  const rollbackResult = await RollbackService.executeRollback('rb_snapshot_1');
  assert.strictEqual(rollbackResult.success, true);
  assert.strictEqual(ProfileService.getActiveProfileId(), 'master', 'Rollback must accurately restore previous active profile state ("master")');
  logPass('Test 5: Rollback snapshot accurately restores previous active profile state');

  // ---------------------------------------------------------------------------
  // TEST 6: Failed Restore Aborts Gracefully Leaving Existing Storage Untouched
  // ---------------------------------------------------------------------------
  // Setup known existing storage state
  mockStorage.clear();
  ProfileService.clearMemoryFallback();
  ProfileService.saveMasterProfile({ name: 'Preserved Master Name' });
  ProfileService.saveFamilyMember({ name: 'Preserved Member' });
  const preMasterVal = mockStorage.getItem(MASTER_STORAGE_KEY);
  const preFamilyVal = mockStorage.getItem(FAMILY_STORAGE_KEY);

  // Attempt to restore corrupt/invalid manifest (missing exclusions, wrong appIdentifier)
  const invalidManifest: any = {
    id: 'corrupt_manifest',
    appIdentifier: 'WRONG_APP_ID',
    schemaVersion: '1.0.0',
    payload: null
  };

  const failedRestoreResult = await RestoreService.executeRestore(invalidManifest, {
    restoreMasterProfile: true,
    restoreFamilyProfiles: true,
    restoreJournalAndWellness: false,
    restoreReportCards: false,
    restorePrashnaHistory: false,
    restoreSettings: false,
    restoreOwnerConfig: false,
    createPreRestoreRollback: false
  });

  assert.strictEqual(failedRestoreResult.success, false, 'Corrupt restore must fail');
  assert.strictEqual(mockStorage.getItem(MASTER_STORAGE_KEY), preMasterVal, 'Existing master profile in storage must remain 100% untouched');
  assert.strictEqual(mockStorage.getItem(FAMILY_STORAGE_KEY), preFamilyVal, 'Existing family profiles in storage must remain 100% untouched');
  logPass('Test 6: Failed restore cleanly aborts and leaves existing storage data completely untouched');

  console.log('================================================================');
  console.log(`ALL ${passCount} BACKUP & RESTORE INTEGRATION TESTS PASSED!`);
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('Backup Integration Test Failure:', err);
  process.exit(1);
});
