/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PROFILE SERVICE FOUNDATION
 * PHASE A: IMMUTABLE MASTER PROFILE, FAMILY MEMBERS & DETERMINISTIC STORAGE
 */

import { FamilyMemberProfile, ProfileOperationResult } from '../../types/profile/profileTypes';

export const MASTER_STORAGE_KEY = 'jeevandarpan_master_profile';
export const FAMILY_STORAGE_KEY = 'jeevandarpan_family_profiles';
export const ACTIVE_STORAGE_KEY = 'jeevandarpan_active_profile_id';
export const PROFILES_UPDATED_EVENT = 'jeevandarpan_profiles_updated';
export const ACTIVE_PROFILE_CHANGED_EVENT = 'jeevandarpan_active_profile_changed';

export const DEFAULT_MASTER_PROFILE: FamilyMemberProfile = {
  id: 'master',
  name: 'जितेन्द्र सूर्यवंशी',
  gender: 'MALE',
  relationship: 'SELF',
  isMaster: true,
  dob: '24 June 1986',
  time: '06:20 AM',
  place: 'Indore, MP',
  latitude: 22.7196,
  longitude: 75.8577,
  timezone: 'Asia/Kolkata',
  mobileNumber: '9826012345',
  mobileNumbers: ['9826012345'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

// In-memory fallback stores when localStorage is restricted or quota exceeded
let memoryMaster: FamilyMemberProfile | null = null;
let memoryFamily: FamilyMemberProfile[] | null = null;
let memoryActiveId: string = 'master';
let quarantineCounter = 0;

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (err) {
    // LocalStorage inaccessible
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch (err) {
    // QuotaExceeded or security error - fallback active
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (err) {
    // ignored
  }
}

function dispatchChange() {
  try {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent(PROFILES_UPDATED_EVENT));
      window.dispatchEvent(new CustomEvent(ACTIVE_PROFILE_CHANGED_EVENT));
    }
  } catch {}
}

export class ProfileService {
  public static clearMemoryFallback(): void {
    memoryMaster = null;
    memoryFamily = null;
    memoryActiveId = 'master';
  }

  public static quarantineCorruptData(corruptRaw: string, source: string): string {
    quarantineCounter++;
    const key = `jeevandarpan_corrupt_${source}_${Date.now()}_${quarantineCounter}`;
    safeSetItem(key, corruptRaw);
    return key;
  }

  public static getMasterProfile(): FamilyMemberProfile {
    if (memoryMaster) return { ...memoryMaster };

    const raw = safeGetItem(MASTER_STORAGE_KEY);
    if (!raw) {
      const def = { ...DEFAULT_MASTER_PROFILE };
      safeSetItem(MASTER_STORAGE_KEY, JSON.stringify(def));
      memoryMaster = { ...def };
      return def;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const master: FamilyMemberProfile = {
          ...DEFAULT_MASTER_PROFILE,
          ...parsed,
          id: 'master',
          isMaster: true,
          relationship: 'SELF'
        };
        memoryMaster = master;
        return master;
      }
    } catch (err) {
      this.quarantineCorruptData(raw, 'master');
    }

    const def = { ...DEFAULT_MASTER_PROFILE };
    safeSetItem(MASTER_STORAGE_KEY, JSON.stringify(def));
    memoryMaster = { ...def };
    return def;
  }

  public static saveMasterProfile(updates: Partial<FamilyMemberProfile>): ProfileOperationResult<FamilyMemberProfile> {
    const current = this.getMasterProfile();
    const updated: FamilyMemberProfile = {
      ...current,
      ...updates,
      id: 'master', // Strictly immutable
      isMaster: true,
      relationship: 'SELF',
      updatedAt: new Date().toISOString()
    };

    memoryMaster = updated;
    safeSetItem(MASTER_STORAGE_KEY, JSON.stringify(updated));
    dispatchChange();

    return {
      success: true,
      data: updated,
      code: 'SUCCESS'
    };
  }

  public static getFamilyProfiles(): FamilyMemberProfile[] {
    if (memoryFamily) return [...memoryFamily];

    const raw = safeGetItem(FAMILY_STORAGE_KEY);
    if (!raw) {
      memoryFamily = [];
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Disambiguate and ensure deterministic IDs
        const seenIds = new Set<string>();
        const nameCount: Record<string, number> = {};

        const cleaned: FamilyMemberProfile[] = parsed.map((m: any, index: number) => {
          let memberId = m.id;
          const cleanName = (m.name || 'member').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
          nameCount[cleanName] = (nameCount[cleanName] || 0) + 1;

          if (!memberId || typeof memberId !== 'string' || memberId === 'master' || seenIds.has(memberId)) {
            const count = nameCount[cleanName];
            memberId = count > 1 
              ? `fam_${cleanName}_${count}` 
              : `fam_${cleanName}_${index + 1}`;
          }

          // Ensure uniqueness
          while (seenIds.has(memberId)) {
            memberId = `${memberId}_dup`;
          }
          seenIds.add(memberId);

          return {
            id: memberId,
            name: m.name || 'Family Member',
            gender: m.gender || 'MALE',
            relationship: m.relationship || 'OTHER',
            dob: m.dob || '',
            time: m.time || '12:00 PM',
            place: m.place || '',
            latitude: typeof m.latitude === 'number' ? m.latitude : 22.7196,
            longitude: typeof m.longitude === 'number' ? m.longitude : 75.8577,
            timezone: m.timezone || 'Asia/Kolkata',
            mobileNumber: m.mobileNumber,
            mobileNumbers: m.mobileNumbers || (m.mobileNumber ? [m.mobileNumber] : []),
            isMaster: false,
            createdAt: m.createdAt || new Date().toISOString(),
            updatedAt: m.updatedAt || new Date().toISOString()
          };
        });

        // Persist clean normalized array
        safeSetItem(FAMILY_STORAGE_KEY, JSON.stringify(cleaned));
        memoryFamily = cleaned;
        return cleaned;
      }
    } catch (err) {
      this.quarantineCorruptData(raw, 'family');
    }

    memoryFamily = [];
    return [];
  }

  public static saveFamilyMember(member: Partial<FamilyMemberProfile>): ProfileOperationResult<FamilyMemberProfile> {
    const list = this.getFamilyProfiles();

    let targetId = member.id;
    const isNew = !targetId || targetId === 'new';

    if (isNew) {
      const cleanName = (member.name || 'member').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      targetId = `fam_${cleanName}_${Date.now()}`;
    }

    const updatedMember: FamilyMemberProfile = {
      id: targetId!,
      name: member.name || 'Family Member',
      gender: member.gender || 'MALE',
      relationship: member.relationship || 'OTHER',
      dob: member.dob || '',
      time: member.time || '12:00 PM',
      place: member.place || '',
      latitude: typeof member.latitude === 'number' ? member.latitude : 22.7196,
      longitude: typeof member.longitude === 'number' ? member.longitude : 75.8577,
      timezone: member.timezone || 'Asia/Kolkata',
      mobileNumber: member.mobileNumber,
      mobileNumbers: member.mobileNumbers || (member.mobileNumber ? [member.mobileNumber] : []),
      isMaster: false,
      createdAt: member.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingIdx = list.findIndex(m => m.id === targetId);
    let newList: FamilyMemberProfile[];
    if (existingIdx >= 0) {
      newList = [...list];
      newList[existingIdx] = updatedMember;
    } else {
      newList = [...list, updatedMember];
    }

    memoryFamily = newList;
    safeSetItem(FAMILY_STORAGE_KEY, JSON.stringify(newList));
    dispatchChange();

    return {
      success: true,
      data: updatedMember,
      code: 'SUCCESS'
    };
  }

  public static deleteFamilyMember(id: string): ProfileOperationResult<boolean> {
    if (id === 'master') {
      return {
        success: false,
        code: 'MASTER_CANNOT_BE_DELETED',
        error: 'Master profile cannot be deleted'
      };
    }

    const list = this.getFamilyProfiles();
    const filtered = list.filter(m => m.id !== id);

    memoryFamily = filtered;
    safeSetItem(FAMILY_STORAGE_KEY, JSON.stringify(filtered));

    // If currently active was deleted, reset to master
    if (this.getActiveProfileId() === id) {
      this.setActiveProfileId('master');
    }

    dispatchChange();

    return {
      success: true,
      data: true,
      code: 'SUCCESS'
    };
  }

  public static getActiveProfileId(): string {
    const raw = safeGetItem(ACTIVE_STORAGE_KEY) || memoryActiveId;
    if (raw === 'master') return 'master';

    // Verify it exists in family list
    const family = this.getFamilyProfiles();
    if (family.some(m => m.id === raw)) {
      return raw;
    }

    // Default to master
    return 'master';
  }

  public static getActiveProfile(): FamilyMemberProfile {
    const activeId = this.getActiveProfileId();
    if (activeId === 'master') {
      return this.getMasterProfile();
    }
    const family = this.getFamilyProfiles();
    const found = family.find(m => m.id === activeId);
    return found || this.getMasterProfile();
  }

  public static setActiveProfileId(id: string): boolean {
    if (id === 'master') {
      memoryActiveId = 'master';
      safeSetItem(ACTIVE_STORAGE_KEY, 'master');
      dispatchChange();
      return true;
    }

    const family = this.getFamilyProfiles();
    const exists = family.some(m => m.id === id);
    if (!exists) {
      memoryActiveId = 'master';
      safeSetItem(ACTIVE_STORAGE_KEY, 'master');
      dispatchChange();
      return false;
    }

    memoryActiveId = id;
    safeSetItem(ACTIVE_STORAGE_KEY, id);
    dispatchChange();
    return true;
  }

  public static getAllProfiles(): FamilyMemberProfile[] {
    return [this.getMasterProfile(), ...this.getFamilyProfiles()];
  }
}
