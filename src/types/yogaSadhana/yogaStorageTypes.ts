/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA STORAGE DOMAIN TYPES
 * PHASE 1.15F-C: PROFILE-ISOLATED, PRIVACY-FIRST LOCAL PERSISTENCE TYPES
 * 
 * STRICT INVARIANTS:
 * - Domain-isolated from Meditation (zero Meditation imports, zero shared types).
 * - Version: 1.0.0
 * - 100% Client-side local storage / in-memory fallback.
 * - Profile isolation: profileId partition prevents cross-profile data leaks.
 * - History capped at MAX_HISTORY_RECORDS (exactly 200).
 * - Self-healing corrupt storage recovery: invalid JSON or schema errors never throw.
 * - Zero streak state, zero daily goals, zero audio settings, zero purge controls.
 * - Zero audio, zero network, zero remote telemetry, zero AI / Gemini dependencies.
 * - Zero medical diagnosis, zero clinical cures.
 */

import { YogaPracticeId } from './yogaCatalogTypes';
import { YogaSessionStatus } from './yogaSessionTypes';

export const YOGA_STORAGE_VERSION = '1.0.0' as const;
export type YogaStorageVersion = typeof YOGA_STORAGE_VERSION;

/**
 * Persisted record of a single completed or cancelled Yoga session.
 */
export interface YogaSessionRecord {
  readonly sessionId: string;
  readonly profileId: string;
  readonly practiceId: YogaPracticeId;
  readonly targetDurationSeconds: number;
  readonly actualDurationSeconds: number;
  readonly status: YogaSessionStatus; // COMPLETED or CANCELLED
  readonly startedAt: string; // ISO 8601 string
  readonly completedAt?: string; // ISO 8601 string
}

/**
 * Full schema stored in localStorage under 'jeevandarpan_yoga_v1_{profileId}'.
 */
export interface YogaStorageSchema {
  readonly version: YogaStorageVersion;
  readonly profileId: string;
  readonly history: readonly YogaSessionRecord[];
  readonly lastUpdated: string; // ISO 8601
}

/**
 * Storage save outcome indicating persistence status honestly.
 */
export type YogaStoragePersistenceStatus =
  | 'PERSISTED'       // Written to window.localStorage successfully
  | 'MEMORY_ONLY'     // Stored only in-memory (e.g., localStorage threw QuotaExceeded or restricted)
  | 'IDENTITY_DENIED'; // Profile unverified or rejected; persistence skipped to prevent partition corruption

export interface YogaStorageSaveResult {
  readonly success: boolean;
  readonly persistenceStatus: YogaStoragePersistenceStatus;
  readonly message?: string;
}
