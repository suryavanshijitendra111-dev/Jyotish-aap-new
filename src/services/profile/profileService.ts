/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — CENTRALIZED PROFILE SERVICE
 * PHASE A: PROFILE SERVICE FOUNDATION & DATA INTEGRITY
 * 
 * INVARIANTS:
 * 1. Master Profile permanent ID is strictly 'master'. Master can NEVER be deleted.
 * 2. Deterministic Legacy Migration: Unidentified legacy records receive stable slugs.
 *    Existing IDs are strictly preserved and never mutated (Idempotency).
 * 3. Zero Merge / Overwrite on ID collision: Conflicting incoming records are disambiguated.
 * 4. Corrupt JSON Quarantine Safety: Corrupt data is quarantined in unique keys without overwriting.
 * 5. Mutual Verification: Active Profile ID is always validated against existing profiles;
 *    falls back to 'master' if missing or inconsistent.
 * 6. Local-First & In-Memory Fallback: Operates seamlessly under SSR, incognito, or QuotaExceededError.
 */

import {
  FamilyMemberProfile,
  ProfileOperationResult
} from '../../types/profile/profileTypes';

export const MASTER_STORAGE_KEY = 'jeevandarpan_master_profile';
export const FAMILY_STORAGE_KEY = 'jeevandarpan_family_profiles';
export const ACTIVE_STORAGE_KEY = 'jeevandarpan_active_profile_id';
export const PROFILES_UPDATED_EVENT = 'jeevandarpan_profiles_updated';
export const ACTIVE_PROFILE_CHANGED_EVENT = 'jeevandarpan_active_profile_changed';

export const DEFAULT_MASTER_PROFILE: FamilyMemberProfile = {
  id: 'master',
  name: 'Jitendra Suryavanshi',
  dob: '24 June 1986',
  time: '06:20 AM',
  place: 'Indore, MP',
  latitude: 22.7196,
  longitude: 75.8577,
  timezone: 'Asia/Kolkata',
  gender: 'MALE',
  relationship: 'SELF',
  isMaster: true,
  mobileNumber: '',
  mobileNumbers: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

export class ProfileService {
  private static memoryFallback: Map<string, string> = new Map();

  // ---------------------------------------------------------------------------
  // Low-Level Storage Access with In-Memory Fallback
  // ---------------------------------------------------------------------------

  public static getStorageItem(key: string): string | null {
    if (typeof localStorage === 'undefined') {
      return this.memoryFallback.get(key) || null;
    }
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
      return this.memoryFallback.get(key) || null;
    } catch {
      return this.memoryFallback.get(key) || null;
    }
  }

  public static setStorageItem(key: string, value: string): boolean {
    let success = false;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
        success = true;
      } catch (err) {
        console.warn(`[ProfileService] localStorage write failed for key "${key}", using memory fallback:`, err);
      }
    }
    this.memoryFallback.set(key, value);
    return success;
  }

  public static removeStorageItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {
        // Fallback
      }
    }
    this.memoryFallback.delete(key);
  }

  public static clearMemoryFallback(): void {
    this.memoryFallback.clear();
  }

  // ---------------------------------------------------------------------------
  // Corrupt Data Quarantine (Collision-Free)
  // ---------------------------------------------------------------------------

  public static quarantineCorruptData(rawCorrupt: string, prefix = 'profile'): string {
    let counter = 1;
    let quarantineKey = `jeevandarpan_corrupt_${prefix}_${Date.now()}_${counter}`;
    
    // Ensure the quarantine key does NOT overwrite any existing record
    while (this.getStorageItem(quarantineKey) !== null) {
      counter++;
      quarantineKey = `jeevandarpan_corrupt_${prefix}_${Date.now()}_${counter}`;
    }

    this.setStorageItem(quarantineKey, rawCorrupt);
    console.warn(`[ProfileService] Corrupt storage data quarantined safely to key "${quarantineKey}"`);
    return quarantineKey;
  }

  // ---------------------------------------------------------------------------
  // Deterministic Legacy Identifier Generation
  // ---------------------------------------------------------------------------

  public static generateDeterministicFamilyId(
    raw: Partial<FamilyMemberProfile>,
    existingIds: Set<string>
  ): string {
    const cleanName = (raw.name || 'member').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanDob = (raw.dob || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanTime = (raw.time || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanPlace = (raw.place || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

    let base = `fam_${cleanName}`;
    if (cleanDob) base += `_${cleanDob}`;
    if (cleanTime) base += `_${cleanTime}`;
    if (cleanPlace) base += `_${cleanPlace}`;

    base = base.replace(/_+/g, '_').replace(/_$/, '');
    if (!base || base === 'fam') base = 'fam_member';

    let candidate = base;
    let counter = 2;
    while (existingIds.has(candidate)) {
      candidate = `${base}_${counter}`;
      counter++;
    }
    existingIds.add(candidate);
    return candidate;
  }

  // ---------------------------------------------------------------------------
  // Master Profile Operations
  // ---------------------------------------------------------------------------

  public static getMasterProfile(): FamilyMemberProfile {
    const raw = this.getStorageItem(MASTER_STORAGE_KEY);
    if (!raw) {
      // Return and persist default master profile
      this.setStorageItem(MASTER_STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_PROFILE));
      return { ...DEFAULT_MASTER_PROFILE };
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        this.quarantineCorruptData(raw, 'master');
        this.setStorageItem(MASTER_STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_PROFILE));
        return { ...DEFAULT_MASTER_PROFILE };
      }

      // Ensure Master Profile integrity & normalization
      const normalized: FamilyMemberProfile = {
        ...DEFAULT_MASTER_PROFILE,
        ...parsed,
        id: 'master',
        relationship: 'SELF',
        isMaster: true,
        // Preserve arrays and coordinates
        mobileNumber: typeof parsed.mobileNumber === 'string' ? parsed.mobileNumber : DEFAULT_MASTER_PROFILE.mobileNumber,
        mobileNumbers: Array.isArray(parsed.mobileNumbers) ? parsed.mobileNumbers : (DEFAULT_MASTER_PROFILE.mobileNumbers || []),
        latitude: typeof parsed.latitude === 'number' ? parsed.latitude : DEFAULT_MASTER_PROFILE.latitude,
        longitude: typeof parsed.longitude === 'number' ? parsed.longitude : DEFAULT_MASTER_PROFILE.longitude,
        timezone: parsed.timezone || DEFAULT_MASTER_PROFILE.timezone,
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };

      return normalized;
    } catch {
      this.quarantineCorruptData(raw, 'master');
      this.setStorageItem(MASTER_STORAGE_KEY, JSON.stringify(DEFAULT_MASTER_PROFILE));
      return { ...DEFAULT_MASTER_PROFILE };
    }
  }

  public static saveMasterProfile(
    profile: Partial<FamilyMemberProfile>
  ): ProfileOperationResult<FamilyMemberProfile> {
    const current = this.getMasterProfile();
    const updated: FamilyMemberProfile = {
      ...current,
      ...profile,
      id: 'master', // Enforce Master ID immutability
      isMaster: true,
      relationship: 'SELF',
      updatedAt: new Date().toISOString()
    };

    try {
      this.setStorageItem(MASTER_STORAGE_KEY, JSON.stringify(updated));
      this.dispatchProfilesUpdated();
      return { success: true, data: updated, code: 'SUCCESS' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to save master profile', code: 'STORAGE_QUOTA_EXCEEDED' };
    }
  }

  // ---------------------------------------------------------------------------
  // Family Profiles Operations (CRUD & Migration)
  // ---------------------------------------------------------------------------

  public static getFamilyProfiles(): FamilyMemberProfile[] {
    const raw = this.getStorageItem(FAMILY_STORAGE_KEY);
    if (!raw) return [];

    let parsedList: any[];
    try {
      parsedList = JSON.parse(raw);
      if (!Array.isArray(parsedList)) {
        this.quarantineCorruptData(raw, 'family');
        this.setStorageItem(FAMILY_STORAGE_KEY, JSON.stringify([]));
        return [];
      }
    } catch {
      this.quarantineCorruptData(raw, 'family');
      this.setStorageItem(FAMILY_STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    // Deterministic Migration & Disambiguation Pass
    const existingIds = new Set<string>(['master']);
    let migrationNeeded = false;

    const migratedProfiles: FamilyMemberProfile[] = [];

    for (const item of parsedList) {
      if (!item || typeof item !== 'object') continue;

      let memberId = item.id;
      // Rule 1: Existing valid ID is preserved strictly (Idempotency)
      if (typeof memberId === 'string' && memberId.trim() !== '') {
        memberId = memberId.trim();
        // Rule 2: Collision check — never overwrite or merge, disambiguate duplicate IDs
        if (existingIds.has(memberId)) {
          let counter = 2;
          let uniqueCandidate = `${memberId}_dup${counter}`;
          while (existingIds.has(uniqueCandidate)) {
            counter++;
            uniqueCandidate = `${memberId}_dup${counter}`;
          }
          memberId = uniqueCandidate;
          migrationNeeded = true;
        }
        existingIds.add(memberId);
      } else {
        // Missing ID -> Generate deterministic ID
        memberId = this.generateDeterministicFamilyId(item, existingIds);
        migrationNeeded = true;
      }

      const normalizedMember: FamilyMemberProfile = {
        name: item.name || 'Family Member',
        dob: item.dob || '',
        time: item.time || '',
        place: item.place || '',
        latitude: typeof item.latitude === 'number' ? item.latitude : 0,
        longitude: typeof item.longitude === 'number' ? item.longitude : 0,
        timezone: item.timezone || 'Asia/Kolkata',
        gender: (['MALE', 'FEMALE', 'OTHER'].includes(item.gender) ? item.gender : 'OTHER') as any,
        relationship: (['SELF', 'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'].includes(item.relationship) ? item.relationship : 'OTHER') as any,
        mobileNumber: item.mobileNumber || '',
        mobileNumbers: Array.isArray(item.mobileNumbers) ? item.mobileNumbers : [],
        isMaster: false,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        ...item, // Retain any custom fields safely
        id: memberId
      };

      migratedProfiles.push(normalizedMember);
    }

    if (migrationNeeded) {
      this.setStorageItem(FAMILY_STORAGE_KEY, JSON.stringify(migratedProfiles));
    }

    return migratedProfiles;
  }

  public static saveFamilyMember(
    member: Partial<FamilyMemberProfile>
  ): ProfileOperationResult<FamilyMemberProfile> {
    if (!member.name || !member.name.trim()) {
      return { success: false, error: 'Name is required', code: 'VALIDATION_FAILED' };
    }

    // Invariant: Master ID is reserved
    if (member.id === 'master') {
      return { success: false, error: 'Master profile cannot be saved as a family member', code: 'VALIDATION_FAILED' };
    }

    const currentList = this.getFamilyProfiles();
    const existingIds = new Set<string>(['master', ...currentList.map(m => m.id)]);

    let targetId = member.id;
    const isNew = !targetId || !currentList.some(m => m.id === targetId);

    if (isNew) {
      if (!targetId || targetId.trim() === '') {
        targetId = this.generateDeterministicFamilyId(member, existingIds);
      } else if (existingIds.has(targetId)) {
        let counter = 2;
        let altId = `${targetId}_${counter}`;
        while (existingIds.has(altId)) {
          counter++;
          altId = `${targetId}_${counter}`;
        }
        targetId = altId;
      }
    }

    const now = new Date().toISOString();
    const fullProfile: FamilyMemberProfile = {
      name: member.name.trim(),
      dob: member.dob || '',
      time: member.time || '',
      place: member.place || '',
      latitude: typeof member.latitude === 'number' ? member.latitude : 0,
      longitude: typeof member.longitude === 'number' ? member.longitude : 0,
      timezone: member.timezone || 'Asia/Kolkata',
      gender: member.gender || 'OTHER',
      relationship: member.relationship || 'OTHER',
      mobileNumbers: Array.isArray(member.mobileNumbers) ? member.mobileNumbers : [],
      isMaster: false,
      createdAt: member.createdAt || now,
      updatedAt: now,
      ...member,
      id: targetId!
    };

    const updatedList = isNew
      ? [...currentList, fullProfile]
      : currentList.map(m => (m.id === targetId ? fullProfile : m));

    this.setStorageItem(FAMILY_STORAGE_KEY, JSON.stringify(updatedList));
    this.dispatchProfilesUpdated();

    return { success: true, data: fullProfile, code: 'SUCCESS' };
  }

  public static deleteFamilyMember(id: string): ProfileOperationResult<null> {
    // Invariant: Master profile can NEVER be deleted
    if (id === 'master') {
      return {
        success: false,
        error: 'Master profile cannot be deleted under any circumstances',
        code: 'MASTER_CANNOT_BE_DELETED'
      };
    }

    const currentList = this.getFamilyProfiles();
    const target = currentList.find(m => m.id === id);
    if (!target) {
      return { success: false, error: 'Profile not found', code: 'PROFILE_NOT_FOUND' };
    }

    const filtered = currentList.filter(m => m.id !== id);
    this.setStorageItem(FAMILY_STORAGE_KEY, JSON.stringify(filtered));

    // If currently active profile is the deleted one, switch safely to 'master'
    const activeId = this.getActiveProfileId();
    if (activeId === id) {
      this.setActiveProfileId('master');
    }

    this.dispatchProfilesUpdated();
    return { success: true, data: null, code: 'SUCCESS' };
  }

  // ---------------------------------------------------------------------------
  // Active Profile Selection with Mutual Verification
  // ---------------------------------------------------------------------------

  public static getActiveProfileId(): string {
    const rawCandidate = this.getStorageItem(ACTIVE_STORAGE_KEY);
    const master = this.getMasterProfile();
    const family = this.getFamilyProfiles();

    const validIds = new Set<string>(['master', master.id, ...family.map(f => f.id)]);

    if (rawCandidate && validIds.has(rawCandidate.trim())) {
      return rawCandidate.trim();
    }

    // Unsynced or invalid candidate -> Safe fallback to 'master'
    if (rawCandidate !== 'master') {
      this.setStorageItem(ACTIVE_STORAGE_KEY, 'master');
    }
    return 'master';
  }

  public static setActiveProfileId(id: string): boolean {
    const master = this.getMasterProfile();
    const family = this.getFamilyProfiles();
    const validIds = new Set<string>(['master', master.id, ...family.map(f => f.id)]);

    const targetId = id.trim();
    if (!validIds.has(targetId)) {
      console.warn(`[ProfileService] Attempted to set active profile to invalid ID "${id}". Falling back to 'master'.`);
      this.setStorageItem(ACTIVE_STORAGE_KEY, 'master');
      this.dispatchActiveProfileChanged('master');
      return false;
    }

    this.setStorageItem(ACTIVE_STORAGE_KEY, targetId);
    this.dispatchActiveProfileChanged(targetId);
    return true;
  }

  public static getActiveProfile(): FamilyMemberProfile {
    const activeId = this.getActiveProfileId();
    if (activeId === 'master') {
      return this.getMasterProfile();
    }

    const family = this.getFamilyProfiles();
    const match = family.find(f => f.id === activeId);
    if (match) return match;

    // Safety fallback
    this.setActiveProfileId('master');
    return this.getMasterProfile();
  }

  public static getAllProfiles(): FamilyMemberProfile[] {
    const master = this.getMasterProfile();
    const family = this.getFamilyProfiles();
    return [master, ...family];
  }

  // ---------------------------------------------------------------------------
  // Event Emitters
  // ---------------------------------------------------------------------------

  private static dispatchProfilesUpdated(): void {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent(PROFILES_UPDATED_EVENT));
      } catch {
        // Continue
      }
    }
  }

  private static dispatchActiveProfileChanged(activeId: string): void {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent(ACTIVE_PROFILE_CHANGED_EVENT, { detail: { activeId } })
        );
      } catch {
        // Continue
      }
    }
  }
}
