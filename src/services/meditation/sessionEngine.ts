/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — ZERO-DRIFT MEDITATION SESSION ENGINE
 */

import { PracticeDefinition, PracticeId } from '../../types/meditation/practiceCatalogTypes';
import { 
  SessionDurationSeconds, 
  SessionStatus, 
  SessionPhase,
  ALLOWED_SESSION_DURATIONS
} from '../../types/meditation/meditationTypes';

export interface SessionClock {
  now(): number;
}

export class SystemClock implements SessionClock {
  public now(): number {
    return Date.now();
  }
}

export interface SessionSnapshot {
  status: SessionStatus;
  phase: SessionPhase;
  elapsedSeconds: number;
  remainingSeconds: number;
  progressRatio: number;
  targetDurationSeconds: number;
  practice: PracticeDefinition;
}

export interface SessionConfig {
  practice: PracticeDefinition;
  targetDurationSeconds: SessionDurationSeconds;
  clock?: SessionClock;
  preparationDurationSeconds?: number;
}

const VALID_PRACTICES: PracticeId[] = [
  'BREATH_AWARENESS',
  'SILENT_MEDITATION',
  'BODY_AWARENESS',
  'GRATITUDE_REFLECTION',
  'SELF_OBSERVATION',
  'PRAYERFUL_CONTEMPLATION'
];

export class Session {
  private practice: PracticeDefinition;
  private targetDurationSeconds: number;
  private prepDurationMs: number;
  private clock: SessionClock;
  private status: SessionStatus = 'IDLE';
  private phase: SessionPhase = 'SETTLE';

  private prepStartMs: number = 0;
  private activeAccumulatedMs: number = 0;
  private activeResumeMs: number = 0;
  private listeners: Set<(s: SessionSnapshot) => void> = new Set();

  constructor(config: SessionConfig) {
    this.practice = config.practice;
    this.targetDurationSeconds = config.targetDurationSeconds;
    this.clock = config.clock || new SystemClock();
    this.prepDurationMs = (config.preparationDurationSeconds ?? 3) * 1000;
  }

  public getStatus(): SessionStatus {
    return this.status;
  }

  public getCurrentPhase(): SessionPhase {
    return this.phase;
  }

  public getElapsedSeconds(): number {
    let totalMs = this.activeAccumulatedMs;
    if (this.status === 'ACTIVE' && this.activeResumeMs > 0) {
      totalMs += (this.clock.now() - this.activeResumeMs);
    }
    const secs = Math.floor(totalMs / 1000);
    return Math.min(this.targetDurationSeconds, secs);
  }

  public getRemainingSeconds(): number {
    return Math.max(0, this.targetDurationSeconds - this.getElapsedSeconds());
  }

  public getProgressRatio(): number {
    if (this.targetDurationSeconds <= 0) return 0;
    return Math.min(1.0, this.getElapsedSeconds() / this.targetDurationSeconds);
  }

  public getSnapshot(): SessionSnapshot {
    return {
      status: this.status,
      phase: this.phase,
      elapsedSeconds: this.getElapsedSeconds(),
      remainingSeconds: this.getRemainingSeconds(),
      progressRatio: this.getProgressRatio(),
      targetDurationSeconds: this.targetDurationSeconds,
      practice: this.practice
    };
  }

  public subscribe(cb: (snap: SessionSnapshot) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const snap = this.getSnapshot();
    this.listeners.forEach(cb => {
      try {
        cb(snap);
      } catch (err) {
        // Isolation
      }
    });
  }

  public start(): { success: boolean; error?: any } {
    if (this.status !== 'IDLE') return { success: false };
    const now = this.clock.now();

    if (this.prepDurationMs > 0) {
      this.status = 'PREPARING';
      this.phase = 'SETTLE';
      this.prepStartMs = now;
    } else {
      this.status = 'ACTIVE';
      this.phase = 'PRACTICE';
      this.activeResumeMs = now;
    }

    this.notify();
    return { success: true };
  }

  public pause(): { success: boolean } {
    if (this.status !== 'ACTIVE') return { success: false };
    const now = this.clock.now();
    this.activeAccumulatedMs += (now - this.activeResumeMs);
    this.activeResumeMs = 0;
    this.status = 'PAUSED';
    this.notify();
    return { success: true };
  }

  public resume(): { success: boolean } {
    if (this.status !== 'PAUSED') return { success: false };
    this.activeResumeMs = this.clock.now();
    this.status = 'ACTIVE';
    this.notify();
    return { success: true };
  }

  public tick(): void {
    const now = this.clock.now();

    if (this.status === 'PREPARING') {
      if (now - this.prepStartMs >= this.prepDurationMs) {
        this.status = 'ACTIVE';
        this.phase = 'PRACTICE';
        this.activeResumeMs = now;
        this.notify();
      }
      return;
    }

    if (this.status === 'ACTIVE') {
      const elapsed = this.getElapsedSeconds();
      if (elapsed >= this.targetDurationSeconds) {
        this.status = 'COMPLETED';
        this.phase = 'COMPLETE';
        this.notify();
      }
    }
  }

  public endEarly(): { success: boolean } {
    if (this.status !== 'ACTIVE' && this.status !== 'PAUSED') return { success: false };
    if (this.status === 'ACTIVE') {
      this.activeAccumulatedMs += (this.clock.now() - this.activeResumeMs);
      this.activeResumeMs = 0;
    }
    this.status = 'COMPLETED';
    this.phase = 'COMPLETE';
    this.notify();
    return { success: true };
  }

  public cancel(): { success: boolean } {
    this.status = 'CANCELLED';
    this.notify();
    return { success: true };
  }
}

export class SessionEngine {
  public static createSession(config: SessionConfig): { success: boolean; data?: Session; error?: { code: string; message: string } } {
    if (!config.practice || !VALID_PRACTICES.includes(config.practice.practiceId)) {
      return {
        success: false,
        error: { code: 'INVALID_PRACTICE_ID', message: 'Practice ID is invalid or not in catalog' }
      };
    }

    if (!ALLOWED_SESSION_DURATIONS.includes(config.targetDurationSeconds)) {
      return {
        success: false,
        error: { code: 'INVALID_DURATION', message: 'Target duration is not allowed' }
      };
    }

    return {
      success: true,
      data: new Session(config)
    };
  }
}
