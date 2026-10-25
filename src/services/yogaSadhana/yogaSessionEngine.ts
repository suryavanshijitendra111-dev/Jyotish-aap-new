/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA SESSION ENGINE CORE
 * PHASE 1.15F-A: DETERMINISTIC, PURE TIME-AND-STATE ENGINE
 * 
 * STRICT INVARIANTS:
 * - Domain-isolated from Meditation (zero Meditation imports, zero shared types).
 * - Time and lifecycle state machine only: ZERO breathing ticks, ZERO Kumbhaka, ZERO ratios.
 * - Monotonic elapsed-time calculation: elapsedActive = now - activeStart - accumulatedPaused.
 * - Pure TypeScript: zero React, zero DOM, zero persistent storage, zero audio, zero network, zero AI.
 * - Preparation duration is exactly 3 seconds; excluded from practice duration.
 * - YogaCatalogService is the sole authority for allowed durations and practice validity.
 */

import { YogaPracticeDefinition, YogaPracticeId } from '../../types/yogaSadhana/yogaCatalogTypes';
import {
  YogaSessionStatus,
  YogaSessionSnapshot,
  YogaSessionResult,
  YogaSessionClock
} from '../../types/yogaSadhana/yogaSessionTypes';
import { YogaCatalogService } from './yogaCatalogService';

export class DefaultYogaSessionClock implements YogaSessionClock {
  public now(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    return Date.now();
  }
}

export interface CreateYogaSessionOptions {
  readonly practiceId: string;
  readonly targetDurationSeconds: number;
  readonly clock?: YogaSessionClock;
  readonly autoTick?: boolean;
  readonly tickIntervalMs?: number;
}

export class YogaSessionEngine {
  private static sessionCounter = 0;

  private readonly sessionId: string;
  private readonly practice: YogaPracticeDefinition;
  private readonly targetDurationSeconds: number;
  private readonly clock: YogaSessionClock;
  private readonly autoTick: boolean;
  private readonly tickIntervalMs: number;

  private status: YogaSessionStatus = 'IDLE';

  // Monotonic timestamps in ms from this.clock.now()
  private preparationStartTimeMs: number | null = null;
  private activeStartTimeMs: number | null = null;
  private pauseStartTimeMs: number | null = null;
  private accumulatedPausedDurationMs: number = 0;

  // Wall-clock ISO timestamps for snapshot reporting
  private readonly isoStartedAt: string;
  private isoPreparationStartedAt?: string;
  private isoActiveStartedAt?: string;
  private isoPausedAt?: string;
  private isoCompletedAt?: string;
  private isoCancelledAt?: string;

  // Subscribers & Interval handle
  private readonly listeners: Set<(snapshot: YogaSessionSnapshot) => void> = new Set();
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  /**
   * Factory method to safely create a YogaSessionEngine instance with catalog validation.
   */
  public static create(options: CreateYogaSessionOptions): YogaSessionResult<YogaSessionEngine> {
    const practice = YogaCatalogService.getPracticeById(options.practiceId);
    if (!practice) {
      return {
        success: false,
        error: {
          code: 'INVALID_PRACTICE_ID',
          message: `Practice ID "${options.practiceId}" is invalid or not in catalog.`
        }
      };
    }

    if (!practice.allowedDurationsSeconds.includes(options.targetDurationSeconds)) {
      return {
        success: false,
        error: {
          code: 'INVALID_DURATION',
          message: `Target duration ${options.targetDurationSeconds}s is not permitted for practice "${practice.id}". Allowed durations: [${practice.allowedDurationsSeconds.join(', ')}].`
        }
      };
    }

    const engine = new YogaSessionEngine(
      practice,
      options.targetDurationSeconds,
      options.clock ?? new DefaultYogaSessionClock(),
      options.autoTick ?? true,
      options.tickIntervalMs ?? 250
    );

    return {
      success: true,
      data: engine
    };
  }

  private constructor(
    practice: YogaPracticeDefinition,
    targetDurationSeconds: number,
    clock: YogaSessionClock,
    autoTick: boolean,
    tickIntervalMs: number
  ) {
    YogaSessionEngine.sessionCounter += 1;
    this.sessionId = `yoga_ses_${Date.now().toString(36)}_${YogaSessionEngine.sessionCounter}_${Math.random().toString(36).substring(2, 7)}`;
    this.practice = practice;
    this.targetDurationSeconds = targetDurationSeconds;
    this.clock = clock;
    this.autoTick = autoTick;
    this.tickIntervalMs = tickIntervalMs;
    this.isoStartedAt = new Date().toISOString();
  }

  /**
   * Starts the session: transitions from IDLE to PREPARING (3 seconds settle period).
   */
  public start(): YogaSessionResult {
    if (this.status === 'COMPLETED' || this.status === 'CANCELLED') {
      return {
        success: false,
        error: {
          code: 'SESSION_ALREADY_TERMINAL',
          message: `Session is already in terminal state "${this.status}".`
        }
      };
    }

    if (this.status !== 'IDLE') {
      return {
        success: false,
        error: {
          code: 'INVALID_STATE_TRANSITION',
          message: `Cannot start session from state "${this.status}".`
        }
      };
    }

    this.status = 'PREPARING';
    this.preparationStartTimeMs = this.clock.now();
    this.isoPreparationStartedAt = new Date().toISOString();

    if (this.autoTick) {
      this.startTimer();
    }

    this.notifySubscribers();
    return { success: true };
  }

  /**
   * Pauses an ACTIVE session. Freezes elapsed time calculation.
   */
  public pause(): YogaSessionResult {
    if (this.status === 'COMPLETED' || this.status === 'CANCELLED') {
      return {
        success: false,
        error: {
          code: 'SESSION_ALREADY_TERMINAL',
          message: `Session is already in terminal state "${this.status}".`
        }
      };
    }

    if (this.status === 'PAUSED') {
      return {
        success: false,
        error: {
          code: 'INVALID_STATE_TRANSITION',
          message: 'Session is already paused.'
        }
      };
    }

    if (this.status !== 'ACTIVE') {
      return {
        success: false,
        error: {
          code: 'SESSION_NOT_ACTIVE',
          message: `Cannot pause session that is in state "${this.status}".`
        }
      };
    }

    this.status = 'PAUSED';
    this.pauseStartTimeMs = this.clock.now();
    this.isoPausedAt = new Date().toISOString();

    this.notifySubscribers();
    return { success: true };
  }

  /**
   * Resumes a PAUSED session. Preserves previous active elapsed time without drift.
   */
  public resume(): YogaSessionResult {
    if (this.status === 'COMPLETED' || this.status === 'CANCELLED') {
      return {
        success: false,
        error: {
          code: 'SESSION_ALREADY_TERMINAL',
          message: `Session is already in terminal state "${this.status}".`
        }
      };
    }

    if (this.status !== 'PAUSED') {
      return {
        success: false,
        error: {
          code: 'SESSION_NOT_PAUSED',
          message: `Cannot resume session that is in state "${this.status}".`
        }
      };
    }

    if (this.pauseStartTimeMs !== null) {
      const pausedDurationMs = Math.max(0, this.clock.now() - this.pauseStartTimeMs);
      this.accumulatedPausedDurationMs += pausedDurationMs;
      this.pauseStartTimeMs = null;
    }

    this.status = 'ACTIVE';
    this.notifySubscribers();
    return { success: true };
  }

  /**
   * Cancels the session from PREPARING, ACTIVE, or PAUSED. Strictly terminal.
   */
  public cancel(): YogaSessionResult {
    if (this.status === 'COMPLETED' || this.status === 'CANCELLED') {
      return {
        success: false,
        error: {
          code: 'SESSION_ALREADY_TERMINAL',
          message: `Session is already in terminal state "${this.status}".`
        }
      };
    }

    if (this.status === 'IDLE') {
      return {
        success: false,
        error: {
          code: 'INVALID_STATE_TRANSITION',
          message: 'Cannot cancel an IDLE session before it has started.'
        }
      };
    }

    this.status = 'CANCELLED';
    this.isoCancelledAt = new Date().toISOString();
    this.stopTimer();
    this.notifySubscribers();
    return { success: true };
  }

  /**
   * Internal or manual tick to evaluate time progress and state boundaries.
   */
  public tick(): void {
    if (this.status === 'COMPLETED' || this.status === 'CANCELLED' || this.status === 'IDLE') {
      return;
    }

    const now = this.clock.now();

    // 1. Check PREPARING -> ACTIVE transition (exactly 3 seconds)
    if (this.status === 'PREPARING') {
      if (this.preparationStartTimeMs !== null) {
        const prepElapsedMs = now - this.preparationStartTimeMs;
        if (prepElapsedMs >= 3000) {
          this.status = 'ACTIVE';
          // Align activeStartTime to the exact moment preparation ended
          this.activeStartTimeMs = this.preparationStartTimeMs + 3000;
          this.isoActiveStartedAt = new Date().toISOString();
          this.notifySubscribers();
        } else {
          this.notifySubscribers();
        }
      }
      return;
    }

    // 2. Check ACTIVE -> COMPLETED transition
    if (this.status === 'ACTIVE') {
      if (this.activeStartTimeMs !== null) {
        const activeElapsedMs = Math.max(0, now - this.activeStartTimeMs - this.accumulatedPausedDurationMs);
        const activeElapsedSec = Math.floor(activeElapsedMs / 1000);

        if (activeElapsedSec >= this.targetDurationSeconds) {
          this.status = 'COMPLETED';
          this.isoCompletedAt = new Date().toISOString();
          this.stopTimer();
          this.notifySubscribers();
        } else {
          this.notifySubscribers();
        }
      }
    }
  }

  /**
   * Generates a frozen, immutable snapshot of the current session state.
   */
  public getSnapshot(): YogaSessionSnapshot {
    const now = this.clock.now();
    let elapsedSeconds = 0;
    let preparingRemainingSeconds = 0;

    if (this.status === 'PREPARING' && this.preparationStartTimeMs !== null) {
      const prepElapsedMs = Math.max(0, now - this.preparationStartTimeMs);
      preparingRemainingSeconds = Math.max(0, Math.ceil((3000 - prepElapsedMs) / 1000));
    } else if (this.status === 'ACTIVE' || this.status === 'PAUSED' || this.status === 'COMPLETED') {
      if (this.activeStartTimeMs !== null) {
        const currentReferenceMs = this.status === 'PAUSED' && this.pauseStartTimeMs !== null
          ? this.pauseStartTimeMs
          : now;

        const activeElapsedMs = Math.max(0, currentReferenceMs - this.activeStartTimeMs - this.accumulatedPausedDurationMs);
        elapsedSeconds = Math.min(this.targetDurationSeconds, Math.floor(activeElapsedMs / 1000));
      }
    }

    const remainingSeconds = Math.max(0, this.targetDurationSeconds - elapsedSeconds);
    const progressRatio = this.targetDurationSeconds > 0
      ? Math.min(1, Math.max(0, elapsedSeconds / this.targetDurationSeconds))
      : 0;

    return Object.freeze({
      sessionId: this.sessionId,
      practiceId: this.practice.id as YogaPracticeId,
      targetDurationSeconds: this.targetDurationSeconds,
      status: this.status,
      elapsedSeconds,
      remainingSeconds,
      progressRatio,
      preparingRemainingSeconds,
      startedAt: this.isoStartedAt,
      preparationStartedAt: this.isoPreparationStartedAt,
      activeStartedAt: this.isoActiveStartedAt,
      pausedAt: this.isoPausedAt,
      completedAt: this.isoCompletedAt,
      cancelledAt: this.isoCancelledAt
    });
  }

  /**
   * Subscribes a listener to receive session snapshot updates.
   * Returns an unsubscribe callback.
   */
  public subscribe(listener: (snapshot: YogaSessionSnapshot) => void): () => void {
    this.listeners.add(listener);
    // Deliver immediate initial snapshot upon subscription
    try {
      listener(this.getSnapshot());
    } catch {
      // Listener exceptions isolated
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Cleanly destroys and cleans up all interval resources.
   */
  public destroy(): void {
    this.stopTimer();
    this.listeners.clear();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerHandle = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
  }

  private stopTimer(): void {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  private notifySubscribers(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch {
        // Individual listener errors are isolated to prevent engine failure
      }
    }
  }
}

/**
 * Functional creation entry point conforming to the project public API standard.
 */
export function createYogaSession(options: CreateYogaSessionOptions): YogaSessionResult<YogaSessionEngine> {
  return YogaSessionEngine.create(options);
}
