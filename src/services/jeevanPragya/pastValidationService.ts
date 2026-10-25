/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — JEEVAN PRAGYA MARGDARSHAN
 * PHASE 1.3A: PAST VALIDATION PERSISTENCE SERVICE
 * 
 * Scoped storage repository for user validation feedback on past timeline cards.
 * 
 * Strict Guarantees:
 * 1. Storage key: "jeevandarpan_past_validation_feedback"
 * 2. Strict Profile Isolation: every record contains profileId + timelineItemId.
 * 3. Persisted selections: ONLY 'MATCH' | 'PARTIAL' | 'NO_MATCH'.
 * 4. Update Invariance: updating a card modifies existing record; no duplicates.
 * 5. Complete Privacy: local storage only, zero network dispatch, zero AI calls.
 * 6. Calculation Immutability: strictly decoupled from all Jyotish engines.
 */

import { BirthProfile } from '../../types/kundli';
import { 
  PastValidationFeedback, 
  ValidationSelection 
} from '../../types/jeevanPragya/jeevanPragyaTypes';

export const PAST_VALIDATION_STORAGE_KEY = 'jeevandarpan_past_validation_feedback';

// In-memory fallback if localStorage is unavailable (e.g., in node/unit tests)
let memoryStore: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // fallback to memory
  }
  return memoryStore[key] || null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (e) {
    // fallback to memory
  }
  memoryStore[key] = value;
}

export class PastValidationService {
  /**
   * Generates a stable canonical identifier for a BirthProfile.
   * If profile has an explicit id, uses it; otherwise builds a deterministic slug.
   */
  public static getProfileId(profile: BirthProfile | null | undefined): string {
    if (!profile) return 'anonymous_profile';
    if ((profile as any).id && typeof (profile as any).id === 'string' && (profile as any).id.trim()) {
      return (profile as any).id.trim();
    }
    const cleanName = (profile.name || 'unnamed').trim().toLowerCase().replace(/\s+/g, '_');
    const cleanDob = (profile.dob || '').trim().replace(/\s+/g, '_');
    const cleanTime = (profile.time || '').trim().replace(/\s+/g, '_');
    const cleanPlace = (profile.place || '').trim().toLowerCase().replace(/\s+/g, '_');
    return `prof_${cleanName}_${cleanDob}_${cleanTime}_${cleanPlace}`;
  }

  /**
   * Loads all feedback records currently in storage.
   */
  public static getAllFeedback(): PastValidationFeedback[] {
    const raw = getStorageItem(PAST_VALIDATION_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse past validation feedback storage:', e);
    }
    return [];
  }

  /**
   * Loads feedback strictly filtered by profileId.
   * Returns a dictionary indexed by timelineItemId.
   */
  public static getFeedbackForProfile(profileId: string): Record<string, PastValidationFeedback> {
    if (!profileId) return {};
    const all = this.getAllFeedback();
    const profileRecords = all.filter(r => r.profileId === profileId);
    const map: Record<string, PastValidationFeedback> = {};
    profileRecords.forEach(r => {
      map[r.timelineItemId] = r;
    });
    return map;
  }

  /**
   * Saves or updates a validation feedback record for a specific profile and timelineItem.
   * Selection must be exactly 'MATCH' | 'PARTIAL' | 'NO_MATCH'.
   */
  public static saveFeedback(
    profileId: string,
    timelineItemId: string,
    selection: ValidationSelection,
    optionalNote?: string,
    selectedThemes?: string[],
    language: string = 'hi'
  ): PastValidationFeedback {
    if (!profileId || !timelineItemId) {
      throw new Error('profileId and timelineItemId are required for past validation persistence');
    }

    const all = this.getAllFeedback();
    const existingIndex = all.findIndex(
      r => r.profileId === profileId && r.timelineItemId === timelineItemId
    );

    const nowIso = new Date().toISOString();
    let updatedRecord: PastValidationFeedback;

    if (existingIndex >= 0) {
      // Update existing record
      const existing = all[existingIndex];
      updatedRecord = {
        ...existing,
        selection,
        optionalNote: optionalNote !== undefined ? optionalNote : existing.optionalNote,
        selectedThemes: selectedThemes !== undefined ? selectedThemes : existing.selectedThemes,
        language
      };
      all[existingIndex] = updatedRecord;
    } else {
      // Create new record
      updatedRecord = {
        id: `val_${profileId}_${timelineItemId}_${Date.now()}`,
        profileId,
        timelineItemId,
        selection,
        optionalNote: optionalNote || '',
        selectedThemes: selectedThemes || [],
        createdAt: nowIso,
        language
      };
      all.push(updatedRecord);
    }

    setStorageItem(PAST_VALIDATION_STORAGE_KEY, JSON.stringify(all));
    return updatedRecord;
  }

  /**
   * Updates only the optional note for an existing or new validation record.
   */
  public static updateNote(
    profileId: string,
    timelineItemId: string,
    optionalNote: string,
    language: string = 'hi'
  ): PastValidationFeedback {
    const all = this.getAllFeedback();
    const existingIndex = all.findIndex(
      r => r.profileId === profileId && r.timelineItemId === timelineItemId
    );

    const nowIso = new Date().toISOString();
    let record: PastValidationFeedback;

    if (existingIndex >= 0) {
      record = {
        ...all[existingIndex],
        optionalNote,
        language
      };
      all[existingIndex] = record;
    } else {
      // If note saved before selecting a choice, default to MATCH
      record = {
        id: `val_${profileId}_${timelineItemId}_${Date.now()}`,
        profileId,
        timelineItemId,
        selection: 'MATCH',
        optionalNote,
        selectedThemes: [],
        createdAt: nowIso,
        language
      };
      all.push(record);
    }

    setStorageItem(PAST_VALIDATION_STORAGE_KEY, JSON.stringify(all));
    return record;
  }

  /**
   * Clears feedback for testing/benchmarking purposes only.
   */
  public static clearMemoryStore(): void {
    memoryStore = {};
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(PAST_VALIDATION_STORAGE_KEY);
      }
    } catch (e) {
      // ignore
    }
  }
}
