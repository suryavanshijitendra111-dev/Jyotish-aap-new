/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION SESSION ENGINE & DETERMINISTIC STATE MACHINE
 * PHASE 1.14D: PURE MONOTONIC CLOCK TIMER & STATE TRANSITION ENGINE
 * 
 * STRICT INVARIANTS:
 * - Deterministic, monotonic time tracking: elapsed time is computed mathematically from
 *   timestamps (currentTime - startTime - accumulatedPausedTime), NEVER tick accumulation.
 * - Framework-independent, pure TypeScript: zero React, zero DOM, zero LocalStorage, zero audio, zero network, zero AI.
 * - Injectable clock abstraction for 100% deterministic, sleep-free testability.
 * - Immutable-style serializable snapshots.
 * - Isolated, fault-tolerant subscriber notification (failing listeners cannot crash engine).
 * - Terminal states (COMPLETED, CANCELLED, INTERRUPTED) are strictly non-resumable.
 */

import {
  SessionStatus,
  SessionPhase,
  SessionDurationSeconds,
  ALLOWED_SESSION_DURATIONS
} from '../../types/meditation/meditationTypes';
import { PracticeDefinition, PracticeId } from '../../types/meditation/practiceCatalogTypes';
import { PracticeCatalogService } from './practiceCatalogService';

// -------------------------------------------------------------
// 1. CLOCK ABSTRACTION
// -------------------------------------------------------------

export interface SessionClock {
  /**
   * Returns monotonic current timestamp in milliseconds.
   */
  now(): number;
}

export class DefaultSessionClock implements SessionClock {
  public now(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    return Date.now();
  }
}

// -------------------------------------------------------------
// 2. ERROR CODES & ENGINE RESULT
// -------------------------------------------------------------

export type SessionErrorCode =
  | 'INVALID_PRACTICE_ID'
  | 'INVALID_DURATION'
  | 'MISSING_PRACTICE_DEFINITION'
  | 'PRACTICE_DURATION_MISMATCH'
  | 'INVALID_STATE_TRANSITION'
  | 'SESSION_ALREADY_TERMINAL'
  | 'SESSION_NOT_ACTIVE'
  | 'SESSION_NOT_PAUSED'
  | 'INVALID_PHASE_CONFIGURATION';

export interface SessionEngineResult<T = void> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: SessionErrorCode;
    readonly message: string;
  };
}

// -------------------------------------------------------------
// 3. SESSION SNAPSHOT CONTRACT
// -------------------------------------------------------------

export interface SessionSnapshot {
  readonly sessionId: string;
  readonly practiceId: PracticeId;
  readonly status: SessionStatus;
  readonly currentPhase: SessionPhase;
  readonly targetDurationSeconds: SessionDurationSeconds;
  readonly elapsedSeconds: number;
  readonly remainingSeconds: number;
  readonly progressRatio: number;
  readonly preparingRemainingSeconds: number;
  readonly startedAt: string; // ISO 8601
  readonly pausedAt?: string;
  readonly completedAt?: string;
  readonly cancelledAt?: string;
  readonly interruptedAt?: string;
}

// -------------------------------------------------------------
// 4. CREATION OPTIONS
// -------------------------------------------------------------

export interface CreateSessionOptions {
  readonly practice: PracticeDefinition;
  readonly targetDurationSeconds: SessionDurationSeconds;
  readonly clock?: SessionClock;
  readonly preparationDurationSeconds?: number; // default: 3
  readonly autoTick?: boolean; // if true, uses interval for background notification
  readonly tickIntervalMs?: number; // default: 250ms
}

// -------------------------------------------------------------
// 5. SESSION ENGINE IMPLEMENTATION
// -------------------------------------------------------------

export class SessionEngine {
  private readonly sessionId: string;
  private readonly practice: PracticeDefinition;
  private readonly targetDurationSeconds: SessionDurationSeconds;
  private readonly clock: SessionClock;
  private readonly preparationDurationMs: number;

  private status: SessionStatus = 'IDLE';
  private currentPhase: SessionPhase = 'SETTLE';

  // Timestamps in milliseconds from clock.now()
  private prepareStartTimeMs: number | null = null;
  private activeStartTimeMs: number | null = null;
  private pauseStartTimeMs: number | null = null;
  private accumulatedPausedDurationMs: number = 0;
  private previousActiveStatus: 'ACTIVE' | 'SILENCE' = 'ACTIVE';

  // Practice vs. Silence boundaries in seconds
  private practiceDurationSeconds: number;
  private silenceDurationSeconds: number;

  // Wall-clock ISO timestamps for snapshot logging
  private isoStartedAt: string = '';
  private isoPausedAt?: string;
  private isoCompletedAt?: string;
  private isoCancelledAt?: string;
  private isoInterruptedAt?: string;

  // Listeners
  private listeners: Set<(snapshot: SessionSnapshot) => void> = new Set();
  private timerHandle: any = null;

  constructor(options: CreateSessionOptions) {
    this.sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.practice = options.practice;
    this.targetDurationSeconds = options.targetDurationSeconds;
    this.clock = options.clock ?? new DefaultSessionClock();
    this.preparationDurationMs = Math.max(0, (options.preparationDurationSeconds ?? 3)) * 1000;

    // Calculate silence and active practice boundaries
    const silenceConfig = this.practice.phases.find(p => p.phase === 'SILENCE');
    if (silenceConfig && silenceConfig.durationSeconds > 0) {
      const scale = this.targetDurationSeconds / this.practice.defaultDurationSeconds;
      this.silenceDurationSeconds = Math.min(
        this.targetDurationSeconds,
        Math.max(0, Math.round(silenceConfig.durationSeconds * scale))
      );
      this.practiceDurationSeconds = this.targetDurationSeconds - this.silenceDurationSeconds;
    } else {
      this.silenceDurationSeconds = 0;
      this.practiceDurationSeconds = this.targetDurationSeconds;
    }

    if (options.autoTick) {
      const interval = options.tickIntervalMs ?? 250;
      this.timerHandle = setInterval(() => {
        this.tick();
      }, interval);
    }
  }

  /**
   * Factory method to create a validated session engine instance.
   */
  public static createSession(options: CreateSessionOptions): SessionEngineResult<SessionEngine> {
    if (!options.practice) {
      return {
        success: false,
        error: {
          code: 'MISSING_PRACTICE_DEFINITION',
          message: 'Practice definition must be provided.'
        }
      };
    }

    if (!PracticeCatalogService.isPracticeIdValid(options.practice.practiceId)) {
      return {
        success: false,
        error: {
          code: 'INVALID_PRACTICE_ID',
          message: `Unknown or unapproved practiceId: ${String(options.practice.practiceId)}`
        }
      };
    }

    if (
      typeof options.targetDurationSeconds !== 'number' ||
      !ALLOWED_SESSION_DURATIONS.includes(options.targetDurationSeconds)
    ) {
      return {
        success: false,
        error: {
          code: 'INVALID_DURATION',
          message: `Duration ${options.targetDurationSeconds} is invalid. Allowed: ${ALLOWED_SESSION_DURATIONS.join(', ')}`
        }
      };
    }

    if (!options.practice.allowedDurations.includes(options.targetDurationSeconds)) {
      return {
        success: false,
        error: {
          code: 'PRACTICE_DURATION_MISMATCH',
          message: `Practice ${options.practice.practiceId} does not allow duration ${options.targetDurationSeconds}`
        }
      };
    }

    const engine = new SessionEngine(options);
    return {
      success: true,
      data: engine
    };
  }

  /**
   * Starts session lifecycle from IDLE to PREPARING.
   */
  public start(): SessionEngineResult {
    if (this.isTerminal()) {
      return {
        success: false,
        error: {
          code: 'SESSION_ALREADY_TERMINAL',
          message: 'Cannot start a terminal session.'
        }
      };
    }

    if (this.status !== 'IDLE') {
      return {
        success: false,
        error: {
          code: 'INVALID_STATE_TRANSITION',
          message: `Cannot start session from status '${this.status}'`
        }
      };
    }

    const now = this.clock.now();
    this.status = 'PREPARING';
    this.currentPhase = 'SETTLE';
    this.prepareStartTimeMs = now;
    this.isoStartedAt = new Date().toISOString();

    // If preparation duration is 0, transition immediately to ACTIVE
    if (this.preparationDurationMs === 0) {
      this.status = 'ACTIVE';
      this.currentPhase = 'PRACTICE';
      this.activeStartTimeMs = now;
    }

    this.notifyListeners();
    return { success: true };
  }

  /**
   * Pauses an active session. Freezes effective elapsed time.
   */
  public pause(): SessionEngineResult {
    if (this.isTerminal()) {
      return {
        success: false,
        error: {
          code: 'SESSION_ALREADY_TERMINAL',
          message: 'Cannot pause a terminal session.'
        }
      };
    }

    if (this.status !== 'ACTIVE' && this.status !== 'SILENCE') {
      return {
        success: false,
        error: {
          code: 'SESSION_NOT_ACTIVE',
          message: `Cannot pause session in status '${this.status}'. Must be ACTIVE or SILENCE.`
        }
      };
    }

    const now = this.clock.now();
    this.previousActiveStatus = this.status;
    this.status = 'PAUSED';
    this.pauseStartTimeMs = now;
    this.isoPausedAt = new Date().toISOString();

    this.notifyListeners();
    return { success: true };
  }

  /**
   * Resumes a paused session. Accurately records pause duration to guarantee zero-drift.
   */
  public resume(): SessionEngineResult {
    if (this.isTerminal()) {
      return {
        success: false,
        error: {
          code: 'SESSION_ALREADY_TERMINAL',
          message: 'Cannot resume a terminal session.'
        }
      };
    }

    if (this.status !== 'PAUSED') {
      return {
        success: false,
        error: {
          code: 'SESSION_NOT_PAUSED',
          message: `Cannot resume session in status '${this.status}'. Session must be PAUSED.`
        }
      };
    }

    const now = this.clock.now();
    if (this.pauseStartTimeMs !== null) {
      this.accumulatedPausedDurationMs += (now - this.pauseStartTimeMs);
      this.pauseStartTimeMs = null;
    }

    this.status = this.previousActiveStatus;
    this.isoPausedAt = undefined;

    this.notifyListeners();
    return { success: true };
  }

  /**
   * Cancels session cleanly without guilt or error. Enters terminal CANCELLED state.
   */
  public cancel(): SessionEngineResult {
    if (this.isTerminal()) {
      return {
        success: false,
        error: {
          code: 'SESSION_ALREADY_TERMINAL',
          message: 'Session is already in a terminal state.'
        }
      };
    }

    this.stopInternalTimer();
    this.status = 'CANCELLED';
    this.isoCancelledAt = new Date().toISOString();

    this.notifyListeners();
    return { success: true };
  }

  /**
   * Interrupts session due to system, unmount, or lifecycle reasons. Enters terminal INTERRUPTED state.
   */
  public interrupt(): SessionEngineResult {
    if (this.isTerminal()) {
      return {
        success: false,
        error: {
          code: 'SESSION_ALREADY_TERMINAL',
          message: 'Session is already in a terminal state.'
        }
      };
    }

    this.stopInternalTimer();
    this.status = 'INTERRUPTED';
    this.isoInterruptedAt = new Date().toISOString();

    this.notifyListeners();
    return { success: true };
  }

  /**
   * Evaluates time thresholds monotonically and advances state machine.
   * Emits snapshot to subscribers.
   */
  public tick(): SessionSnapshot {
    if (this.isTerminal()) {
      return this.getSessionSnapshot();
    }

    const now = this.clock.now();

    // 1. Advance from PREPARING to ACTIVE
    if (this.status === 'PREPARING' && this.prepareStartTimeMs !== null) {
      const elapsedPrep = now - this.prepareStartTimeMs;
      if (elapsedPrep >= this.preparationDurationMs) {
        this.status = 'ACTIVE';
        this.currentPhase = 'PRACTICE';
        this.activeStartTimeMs = this.prepareStartTimeMs + this.preparationDurationMs;
      }
    }

    // 2. Evaluate ACTIVE / SILENCE progress monotonically
    if (this.status === 'ACTIVE' || this.status === 'SILENCE') {
      const elapsedSeconds = this.calculateAuthoritativeElapsedSeconds(now);

      // Check transition to SILENCE
      if (this.status === 'ACTIVE' && elapsedSeconds >= this.practiceDurationSeconds) {
        if (this.silenceDurationSeconds > 0) {
          this.status = 'SILENCE';
          this.currentPhase = 'SILENCE';
        } else {
          this.completeSession();
          return this.getSessionSnapshot();
        }
      }

      // Check transition to COMPLETED
      if (elapsedSeconds >= this.targetDurationSeconds) {
        this.completeSession();
        return this.getSessionSnapshot();
      }

      // Update fine-grained phase if in ACTIVE
      if (this.status === 'ACTIVE') {
        this.currentPhase = this.resolveActivePhase(elapsedSeconds);
      }
    }

    this.notifyListeners();
    return this.getSessionSnapshot();
  }

  public getStatus(): SessionStatus {
    return this.status;
  }

  public getElapsedSeconds(): number {
    return this.calculateAuthoritativeElapsedSeconds(this.clock.now());
  }

  public getRemainingSeconds(): number {
    if (this.status === 'IDLE' || this.status === 'PREPARING') {
      return this.targetDurationSeconds;
    }
    if (this.status === 'COMPLETED') {
      return 0;
    }
    const elapsed = this.getElapsedSeconds();
    return Math.max(0, this.targetDurationSeconds - elapsed);
  }

  public getCurrentPhase(): SessionPhase {
    return this.currentPhase;
  }

  public getProgressRatio(): number {
    if (this.status === 'IDLE' || this.status === 'PREPARING') {
      return 0.0;
    }
    if (this.status === 'COMPLETED') {
      return 1.0;
    }
    const elapsed = this.getElapsedSeconds();
    const ratio = elapsed / this.targetDurationSeconds;
    return Math.min(1.0, Math.max(0.0, Number(ratio.toFixed(4))));
  }

  /**
   * Returns immutable, serializable session snapshot.
   */
  public getSessionSnapshot(): SessionSnapshot {
    const elapsed = this.getElapsedSeconds();
    const remaining = this.getRemainingSeconds();
    const progress = this.getProgressRatio();

    let prepRemaining = 0;
    if (this.status === 'PREPARING' && this.prepareStartTimeMs !== null) {
      const elapsedPrep = this.clock.now() - this.prepareStartTimeMs;
      prepRemaining = Math.max(0, Math.ceil((this.preparationDurationMs - elapsedPrep) / 1000));
    }

    return Object.freeze({
      sessionId: this.sessionId,
      practiceId: this.practice.practiceId,
      status: this.status,
      currentPhase: this.currentPhase,
      targetDurationSeconds: this.targetDurationSeconds,
      elapsedSeconds: elapsed,
      remainingSeconds: remaining,
      progressRatio: progress,
      preparingRemainingSeconds: prepRemaining,
      startedAt: this.isoStartedAt,
      pausedAt: this.isoPausedAt,
      completedAt: this.isoCompletedAt,
      cancelledAt: this.isoCancelledAt,
      interruptedAt: this.isoInterruptedAt
    });
  }

  public subscribe(listener: (snapshot: SessionSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.unsubscribe(listener);
  }

  public unsubscribe(listener: (snapshot: SessionSnapshot) => void): void {
    this.listeners.delete(listener);
  }

  public destroy(): void {
    this.stopInternalTimer();
    this.listeners.clear();
  }

  // -------------------------------------------------------------
  // PRIVATE HELPER METHODS
  // -------------------------------------------------------------

  private isTerminal(): boolean {
    return this.status === 'COMPLETED' || this.status === 'CANCELLED' || this.status === 'INTERRUPTED';
  }

  private completeSession(): void {
    this.stopInternalTimer();
    this.status = 'COMPLETED';
    this.currentPhase = 'COMPLETE';
    this.isoCompletedAt = new Date().toISOString();
    this.notifyListeners();
  }

  private stopInternalTimer(): void {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  /**
   * Authoritative, zero-drift elapsed time derived mathematically from timestamps.
   */
  private calculateAuthoritativeElapsedSeconds(now: number): number {
    if (this.status === 'IDLE' || this.status === 'PREPARING' || this.activeStartTimeMs === null) {
      return 0;
    }

    if (this.status === 'COMPLETED') {
      return this.targetDurationSeconds;
    }

    let effectiveElapsedMs = 0;
    if (this.status === 'PAUSED' && this.pauseStartTimeMs !== null) {
      effectiveElapsedMs = (this.pauseStartTimeMs - this.activeStartTimeMs) - this.accumulatedPausedDurationMs;
    } else {
      effectiveElapsedMs = (now - this.activeStartTimeMs) - this.accumulatedPausedDurationMs;
    }

    const elapsedSeconds = Math.floor(Math.max(0, effectiveElapsedMs) / 1000);
    return Math.min(this.targetDurationSeconds, elapsedSeconds);
  }

  private resolveActivePhase(elapsedSeconds: number): SessionPhase {
    let accumulated = 0;
    for (const phaseConfig of this.practice.phases) {
      if (phaseConfig.phase === 'COMPLETE') continue;
      accumulated += phaseConfig.durationSeconds;
      if (elapsedSeconds < accumulated) {
        return phaseConfig.phase;
      }
    }
    return 'PRACTICE';
  }

  private notifyListeners(): void {
    if (this.listeners.size === 0) return;
    const snapshot = this.getSessionSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        // Failing subscriber must never crash session engine
      }
    }
  }
}
