/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA SESSION ENGINE DOMAIN TYPES
 * PHASE 1.15F-A: DETERMINISTIC, PURE TIME-AND-STATE ENGINE TYPES
 * 
 * STRICT INVARIANTS:
 * - Domain-isolated from Meditation types.
 * - Time/lifecycle model only (zero breathing ticks, zero Kumbhaka, zero breath ratios).
 * - Zero audio, zero storage, zero AI, zero network.
 */

import { YogaPracticeId } from './yogaCatalogTypes';

export type YogaSessionStatus =
  | 'IDLE'
  | 'PREPARING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export type YogaSessionErrorCode =
  | 'INVALID_PRACTICE_ID'
  | 'INVALID_DURATION'
  | 'INVALID_STATE_TRANSITION'
  | 'SESSION_ALREADY_TERMINAL'
  | 'SESSION_NOT_PAUSED'
  | 'SESSION_NOT_ACTIVE';

export interface YogaSessionError {
  readonly code: YogaSessionErrorCode;
  readonly message: string;
}

export interface YogaSessionResult<T = void> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: YogaSessionError;
}

export interface YogaSessionSnapshot {
  readonly sessionId: string;
  readonly practiceId: YogaPracticeId;
  readonly targetDurationSeconds: number;
  readonly status: YogaSessionStatus;
  readonly elapsedSeconds: number;
  readonly remainingSeconds: number;
  readonly progressRatio: number;
  readonly preparingRemainingSeconds: number;
  readonly startedAt: string; // ISO 8601
  readonly preparationStartedAt?: string;
  readonly activeStartedAt?: string;
  readonly pausedAt?: string;
  readonly completedAt?: string;
  readonly cancelledAt?: string;
}

export interface YogaSessionClock {
  /**
   * Monotonic current timestamp in milliseconds.
   */
  now(): number;
}
