/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA LOCAL STORAGE SERVICE
 * PHASE 1.15F-C: PROFILE-ISOLATED, PRIVACY-FIRST, LOCAL PERSISTENCE
 * 
 * STRICT INVARIANTS:
 * - Domain-isolated from Meditation (zero Meditation imports, zero shared keys).
 * - Prefix: 'jeevandarpan_yoga_v1_'
 * - 100% Client-side local storage (localStorage with honest memory fallback).
 * - Multi-profile partition: profileId strictly isolates records.
 * - History capped at MAX_HISTORY_RECORDS (exactly 200).
 * - Deterministically retains newest 200 records.
 * - Profile identity gate:
 *     - Only explicit master confirmation OR valid explicit stable profileId allowed.
 *     - Missing, null, empty, or unidentified profiles are DENIED write/read access to 'default'.
 *     - Denied identity does NOT crash session, but skips persistence cleanly.
 * - Service-level deduplication:
 *     - A session ID cannot be recorded more than once per profile.
 * - Honest persistence reporting:
 *     - Distinguishes 'PERSISTED' vs 'MEMORY_ONLY' vs 'IDENTITY_DENIED'.
 * - Zero streak logic, zero streak state, zero daily goals, zero purge/deletion controls.
 */

import {
  YogaStorageSchema,
  YogaSessionRecord,
  YogaStorageSaveResult,
  YOGA_STORAGE_VERSION
} from '../../types/yogaSadhana/yogaStorageTypes';

const STORAGE_PREFIX = 'jeevandarpan_yoga_v1_';
export const MAX_HISTORY_RECORDS = 200;

export class YogaStorageService {
  private static memoryFallback: Map<string, string> = new Map();

  /**
   * Validates profile ID and returns safe partition identifier.
   * Rejects null, undefined, empty, or invalid profile tokens.
   */
  public static resolveProfilePartition(profileId: string | null | undefined, isMasterProfile = false): string | null {
    if (isMasterProfile) {
      return 'default';
    }

    if (!profileId || typeof profileId !== 'string') {
      return null;
    }

    const trimmed = profileId.trim();
    if (!trimmed) {
      return null;
    }

    // Explicit master request must be verified by flag
    if (trimmed === 'default' && !isMasterProfile) {
      return null;
    }

    return trimmed.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Generates profile-isolated storage key.
   * Returns null if profile identity cannot be resolved.
   */
  public static getStorageKey(profileId: string | null | undefined, isMasterProfile = false): string | null {
    const partition = this.resolveProfilePartition(profileId, isMasterProfile);
    if (!partition) {
      return null;
    }
    return `${STORAGE_PREFIX}${partition}`;
  }

  /**
   * Creates an empty, pristine default schema for a profile partition.
   */
  public static createDefaultSchema(partition: string): YogaStorageSchema {
    return {
      version: YOGA_STORAGE_VERSION,
      profileId: partition,
      history: [],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Loads profile storage state. Recovers safely from corruption or absence.
   * Returns empty default schema if identity is unverified.
   */
  public static loadState(profileId: string | null | undefined, isMasterProfile = false): YogaStorageSchema {
    const partition = this.resolveProfilePartition(profileId, isMasterProfile);
    if (!partition) {
      // Unverified profile returns empty in-memory schema; does NOT touch 'default'
      return this.createDefaultSchema('unidentified');
    }

    const key = `${STORAGE_PREFIX}${partition}`;
    let raw: string | null = null;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        raw = window.localStorage.getItem(key);
      }
    } catch {
      raw = this.memoryFallback.get(key) || null;
    }

    if (!raw) {
      raw = this.memoryFallback.get(key) || null;
    }

    if (!raw) {
      return this.createDefaultSchema(partition);
    }

    try {
      const parsed = JSON.parse(raw);
      if (!this.isValidSchema(parsed, partition)) {
        console.warn(`[YogaStorageService] Corrupt schema detected for profile "${partition}". Healing with fresh state.`);
        const healed = this.createDefaultSchema(partition);
        this.saveState(partition, healed);
        return healed;
      }
      return parsed as YogaStorageSchema;
    } catch {
      console.warn(`[YogaStorageService] Malformed JSON in storage for profile "${partition}". Resetting.`);
      const healed = this.createDefaultSchema(partition);
      this.saveState(partition, healed);
      return healed;
    }
  }

  /**
   * Persists storage state with honest reporting of storage outcome.
   */
  public static saveState(partition: string, schema: YogaStorageSchema): YogaStorageSaveResult {
    if (!partition || partition === 'unidentified') {
      return {
        success: false,
        persistenceStatus: 'IDENTITY_DENIED',
        message: 'Identity unverified; persistence denied.'
      };
    }

    const key = `${STORAGE_PREFIX}${partition}`;
    const updatedSchema: YogaStorageSchema = {
      ...schema,
      profileId: partition,
      lastUpdated: new Date().toISOString()
    };

    const payload = JSON.stringify(updatedSchema);

    // Maintain memory fallback
    this.memoryFallback.set(key, payload);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, payload);
        return {
          success: true,
          persistenceStatus: 'PERSISTED'
        };
      }
      return {
        success: true,
        persistenceStatus: 'MEMORY_ONLY',
        message: 'Window localStorage unavailable; saved to memory fallback.'
      };
    } catch (err: unknown) {
      console.warn('[YogaStorageService] Failed to write to localStorage. Saved in memory fallback.', err);
      return {
        success: true,
        persistenceStatus: 'MEMORY_ONLY',
        message: 'LocalStorage quota or permission error; saved in memory fallback.'
      };
    }
  }

  /**
   * Records a new session (completed or cancelled).
   * Enforces:
   * 1. Identity validation (rejects unidentified profiles from writing to master 'default').
   * 2. Service-level deduplication: same sessionId will not be recorded twice.
   * 3. Deterministic newest-record retention (strictly capped at MAX_HISTORY_RECORDS = 200).
   */
  public static recordSession(
    profileId: string | null | undefined,
    session: YogaSessionRecord,
    isMasterProfile = false
  ): YogaStorageSaveResult {
    const partition = this.resolveProfilePartition(profileId, isMasterProfile);
    if (!partition) {
      console.warn('[YogaStorageService] Cannot record session: Profile identity unverified. Practice continues uninterrupted.');
      return {
        success: false,
        persistenceStatus: 'IDENTITY_DENIED',
        message: 'Profile identity unverified; session persistence skipped.'
      };
    }

    const current = this.loadState(partition, partition === 'default');

    // Service-level deduplication: Check if session ID already exists in history
    const existingIndex = current.history.findIndex((rec) => rec.sessionId === session.sessionId);
    if (existingIndex !== -1) {
      // Session already recorded; return success idempotently
      return {
        success: true,
        persistenceStatus: 'PERSISTED',
        message: 'Session already recorded.'
      };
    }

    // Prepend session to history and enforce 200 limit (deterministically retaining newest 200)
    const updatedHistory = [session, ...current.history].slice(0, MAX_HISTORY_RECORDS);

    const nextSchema: YogaStorageSchema = {
      ...current,
      profileId: partition,
      history: updatedHistory,
      lastUpdated: new Date().toISOString()
    };

    return this.saveState(partition, nextSchema);
  }

  /**
   * Self-healing validator to check if stored object adheres to YogaStorageSchema.
   */
  private static isValidSchema(data: unknown, expectedPartition: string): data is YogaStorageSchema {
    if (!data || typeof data !== 'object') return false;

    const obj = data as Partial<YogaStorageSchema>;

    if (obj.version !== YOGA_STORAGE_VERSION) return false;
    if (typeof obj.profileId !== 'string' || obj.profileId !== expectedPartition) return false;
    if (!Array.isArray(obj.history)) return false;

    // Validate that history records have required structure
    for (const rec of obj.history) {
      if (!rec || typeof rec !== 'object') return false;
      if (typeof rec.sessionId !== 'string') return false;
      if (typeof rec.practiceId !== 'string') return false;
      if (typeof rec.targetDurationSeconds !== 'number') return false;
      if (typeof rec.actualDurationSeconds !== 'number') return false;
      if (rec.status !== 'COMPLETED' && rec.status !== 'CANCELLED') return false;
      if (typeof rec.startedAt !== 'string') return false;
    }

    return true;
  }
}
