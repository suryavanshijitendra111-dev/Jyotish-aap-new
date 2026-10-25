/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION & SADHANA LOCAL STORAGE SERVICE
 * PHASE 1.14G: PROFILE-ISOLATED, PRIVACY-FIRST, LOCAL-FIRST PERSISTENCE
 * 
 * STRICT INVARIANTS:
 * - 100% Client-side local storage (localStorage / in-memory fallback).
 * - Zero network, zero remote telemetry, zero third-party tracking.
 * - Zero AI / Gemini dependencies.
 * - Zero Jyotish calculations or astrological dependencies.
 * - Strict multi-profile isolation: profileId partition prevents data bleeding.
 * - Self-healing corrupt storage recovery: invalid JSON or schema errors never throw or crash.
 */

import {
  MeditationStorageSchema,
  MeditationUserProfileState,
  MeditationSessionRecord,
  ReflectionEntry,
  DailyGoalConfig,
  MeditationStreak,
  SessionAudioSettings
} from '../../types/meditation/meditationTypes';

const STORAGE_PREFIX = 'jeevandarpan_meditation_v1_';
const MAX_HISTORY_RECORDS = 200;

export const DEFAULT_AUDIO_SETTINGS: SessionAudioSettings = {
  audioMode: 'VOICE_AND_AMBIENT',
  ambientSoundscape: 'OM_DRONE_136HZ',
  ambientVolume: 0.22,
  voiceEnabled: true,
  voiceSpeedPreset: 'normal',
  languageCode: 'hi'
};

export const DEFAULT_DAILY_GOAL: DailyGoalConfig = {
  targetMinutesPerDay: 10,
  reminderEnabled: false,
  preferredReminderTime: '06:30'
};

export const DEFAULT_STREAK: MeditationStreak = {
  currentStreakDays: 0,
  longestStreakDays: 0,
  lastPracticedDate: '',
  totalSessionsCompleted: 0,
  totalMinutesPracticed: 0
};

export class MeditationStorageService {
  private static memoryFallback: Map<string, string> = new Map();

  /**
   * Generates profile-isolated storage key.
   */
  public static getStorageKey(profileId?: string): string {
    const safeId = (profileId || 'default').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${STORAGE_PREFIX}${safeId}`;
  }

  /**
   * Helper: Formats a Date object to YYYY-MM-DD in local time.
   */
  public static formatDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper: Computes yesterday's date string YYYY-MM-DD relative to a given date.
   */
  public static getYesterdayDateString(referenceDate: Date = new Date()): string {
    const prev = new Date(referenceDate);
    prev.setDate(prev.getDate() - 1);
    return this.formatDateString(prev);
  }

  /**
   * Creates an empty, pristine default schema for a profile.
   */
  public static createDefaultSchema(profileId: string = 'default'): MeditationStorageSchema {
    const safeId = profileId || 'default';
    const profileState: MeditationUserProfileState = {
      profileId: safeId,
      goal: { ...DEFAULT_DAILY_GOAL },
      streak: { ...DEFAULT_STREAK },
      preferredAudio: { ...DEFAULT_AUDIO_SETTINGS },
      defaultPracticeId: 'BREATH_AWARENESS'
    };

    return {
      version: '1.0.0',
      profileId: safeId,
      state: profileState,
      history: [],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Loads profile storage state. Recovers safely from corruption or absence.
   */
  public static loadState(profileId: string = 'default'): MeditationStorageSchema {
    const key = this.getStorageKey(profileId);
    let raw: string | null = null;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        raw = window.localStorage.getItem(key);
      }
    } catch {
      // LocalStorage access restricted (e.g. private browsing mode)
      raw = this.memoryFallback.get(key) || null;
    }

    if (!raw) {
      raw = this.memoryFallback.get(key) || null;
    }

    if (!raw) {
      return this.createDefaultSchema(profileId);
    }

    try {
      const parsed = JSON.parse(raw);
      if (!this.isValidSchema(parsed, profileId)) {
        console.warn(`[MeditationStorageService] Corrupt schema detected for profile "${profileId}". Healing with fresh state.`);
        const healed = this.createDefaultSchema(profileId);
        this.saveState(profileId, healed);
        return healed;
      }
      return parsed as MeditationStorageSchema;
    } catch {
      console.warn(`[MeditationStorageService] Malformed JSON in storage for profile "${profileId}". Resetting.`);
      const healed = this.createDefaultSchema(profileId);
      this.saveState(profileId, healed);
      return healed;
    }
  }

  /**
   * Persists storage state with graceful error containment.
   */
  public static saveState(profileId: string, schema: MeditationStorageSchema): boolean {
    const key = this.getStorageKey(profileId);
    const updatedSchema: MeditationStorageSchema = {
      ...schema,
      profileId: profileId || 'default',
      lastUpdated: new Date().toISOString()
    };

    const payload = JSON.stringify(updatedSchema);

    // Always maintain memory fallback
    this.memoryFallback.set(key, payload);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, payload);
        return true;
      }
      return true;
    } catch (err: unknown) {
      console.warn('[MeditationStorageService] Failed to write localStorage. Retained in memory.', err);
      return true; // Graceful containment: app keeps functioning
    }
  }

  /**
   * Records a new session (completed, interrupted, or cancelled).
   * Automatically computes and updates streak, total minutes, and daily goal progress.
   */
  public static recordSession(
    profileId: string = 'default',
    session: MeditationSessionRecord,
    referenceDate: Date = new Date()
  ): MeditationStorageSchema {
    const current = this.loadState(profileId);

    // 1. Prepend to history, enforced cap
    const updatedHistory = [session, ...current.history].slice(0, MAX_HISTORY_RECORDS);

    // 2. Calculate updated streak if COMPLETED
    let updatedStreak: MeditationStreak = { ...current.state.streak };

    if (session.status === 'COMPLETED') {
      const todayStr = this.formatDateString(referenceDate);
      const yesterdayStr = this.getYesterdayDateString(referenceDate);
      const sessionMinutes = Math.max(1, Math.round(session.actualDurationSeconds / 60));

      const lastDate = updatedStreak.lastPracticedDate;

      let newCurrentStreak = updatedStreak.currentStreakDays;

      if (!lastDate) {
        // First practice ever
        newCurrentStreak = 1;
      } else if (lastDate === todayStr) {
        // Already practiced today, keep current streak count
        newCurrentStreak = Math.max(1, updatedStreak.currentStreakDays);
      } else if (lastDate === yesterdayStr) {
        // Practiced yesterday, consecutive streak continues
        newCurrentStreak = updatedStreak.currentStreakDays + 1;
      } else {
        // Broken streak, reset to 1
        newCurrentStreak = 1;
      }

      const newLongestStreak = Math.max(updatedStreak.longestStreakDays, newCurrentStreak);

      updatedStreak = {
        currentStreakDays: newCurrentStreak,
        longestStreakDays: newLongestStreak,
        lastPracticedDate: todayStr,
        totalSessionsCompleted: updatedStreak.totalSessionsCompleted + 1,
        totalMinutesPracticed: updatedStreak.totalMinutesPracticed + sessionMinutes
      };
    }

    const updatedState: MeditationUserProfileState = {
      ...current.state,
      streak: updatedStreak
    };

    const nextSchema: MeditationStorageSchema = {
      ...current,
      state: updatedState,
      history: updatedHistory
    };

    this.saveState(profileId, nextSchema);
    return nextSchema;
  }

  /**
   * Saves or updates post-session qualitative reflection and personal notes.
   */
  public static saveReflection(
    profileId: string = 'default',
    reflection: ReflectionEntry
  ): MeditationStorageSchema {
    const current = this.loadState(profileId);

    let found = false;
    const updatedHistory = current.history.map((rec) => {
      if (rec.sessionId === reflection.sessionId) {
        found = true;
        return {
          ...rec,
          reflection
        };
      }
      return rec;
    });

    if (!found) {
      console.warn(`[MeditationStorageService] Session "${reflection.sessionId}" not found in history for reflection.`);
    }

    const nextSchema: MeditationStorageSchema = {
      ...current,
      history: updatedHistory
    };

    this.saveState(profileId, nextSchema);
    return nextSchema;
  }

  /**
   * Updates user's daily practice goal configuration.
   */
  public static updateDailyGoal(
    profileId: string = 'default',
    goalUpdate: Partial<DailyGoalConfig>
  ): MeditationStorageSchema {
    const current = this.loadState(profileId);

    const updatedGoal: DailyGoalConfig = {
      ...current.state.goal,
      ...goalUpdate,
      targetMinutesPerDay: Math.max(1, Math.min(120, goalUpdate.targetMinutesPerDay ?? current.state.goal.targetMinutesPerDay))
    };

    const nextSchema: MeditationStorageSchema = {
      ...current,
      state: {
        ...current.state,
        goal: updatedGoal
      }
    };

    this.saveState(profileId, nextSchema);
    return nextSchema;
  }

  /**
   * Calculates progress toward the daily goal for a given day (defaults to today).
   */
  public static getDailyProgress(
    profileId: string = 'default',
    dateStr?: string,
    referenceDate: Date = new Date()
  ): {
    targetMinutes: number;
    minutesCompleted: number;
    percentage: number;
    isGoalMet: boolean;
  } {
    const current = this.loadState(profileId);
    const targetDateStr = dateStr || this.formatDateString(referenceDate);
    const targetMinutes = current.state.goal.targetMinutesPerDay || 10;

    let minutesCompleted = 0;

    for (const record of current.history) {
      if (record.status !== 'COMPLETED') continue;

      const recordDate = record.completedAt
        ? record.completedAt.split('T')[0]
        : record.startedAt.split('T')[0];

      if (recordDate === targetDateStr) {
        minutesCompleted += Math.round(record.actualDurationSeconds / 60);
      }
    }

    const percentage = targetMinutes > 0
      ? Math.min(100, Math.round((minutesCompleted / targetMinutes) * 100))
      : 100;

    return {
      targetMinutes,
      minutesCompleted,
      percentage,
      isGoalMet: minutesCompleted >= targetMinutes
    };
  }

  /**
   * Returns current active streak status for presentation, accounting for lapsed days.
   */
  public static getActiveStreak(
    profileId: string = 'default',
    referenceDate: Date = new Date()
  ): MeditationStreak {
    const current = this.loadState(profileId);
    const streak = current.state.streak;

    if (!streak.lastPracticedDate) {
      return streak;
    }

    const todayStr = this.formatDateString(referenceDate);
    const yesterdayStr = this.getYesterdayDateString(referenceDate);

    // If last practiced before yesterday, the current active streak is 0 for today
    if (streak.lastPracticedDate !== todayStr && streak.lastPracticedDate !== yesterdayStr) {
      return {
        ...streak,
        currentStreakDays: 0
      };
    }

    return streak;
  }

  /**
   * Sets or updates active Sankalpa for the profile.
   */
  public static setSankalpa(
    profileId: string = 'default',
    sankalpaText: string
  ): MeditationStorageSchema {
    const current = this.loadState(profileId);
    const trimmed = sankalpaText.trim();

    const nextSchema: MeditationStorageSchema = {
      ...current,
      state: {
        ...current.state,
        activeSankalpa: trimmed || undefined
      }
    };

    this.saveState(profileId, nextSchema);
    return nextSchema;
  }

  /**
   * Clears the active Sankalpa for the profile.
   */
  public static clearSankalpa(profileId: string = 'default'): MeditationStorageSchema {
    const current = this.loadState(profileId);

    const nextSchema: MeditationStorageSchema = {
      ...current,
      state: {
        ...current.state,
        activeSankalpa: undefined
      }
    };

    this.saveState(profileId, nextSchema);
    return nextSchema;
  }

  /**
   * Computes long-term progress stats over 7D, 30D, 90D or ALL time.
   */
  public static getProgressStats(
    profileId: string = 'default',
    range: '7D' | '30D' | '90D' | 'ALL' = '30D',
    referenceDate: Date = new Date()
  ): {
    range: '7D' | '30D' | '90D' | 'ALL';
    totalSessions: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    avgDurationMinutes: number;
    goalCompletionRate: number;
    daysPracticedCount: number;
    daysGoalMetCount: number;
    totalDaysInRange: number;
  } {
    const current = this.loadState(profileId);
    const activeStreak = this.getActiveStreak(profileId, referenceDate);
    const targetMinutes = current.state.goal.targetMinutesPerDay || 10;

    let cutoffDate: Date | null = null;
    let daysCount = 30;

    if (range === '7D') {
      daysCount = 7;
      cutoffDate = new Date(referenceDate);
      cutoffDate.setDate(cutoffDate.getDate() - 6);
      cutoffDate.setHours(0, 0, 0, 0);
    } else if (range === '30D') {
      daysCount = 30;
      cutoffDate = new Date(referenceDate);
      cutoffDate.setDate(cutoffDate.getDate() - 29);
      cutoffDate.setHours(0, 0, 0, 0);
    } else if (range === '90D') {
      daysCount = 90;
      cutoffDate = new Date(referenceDate);
      cutoffDate.setDate(cutoffDate.getDate() - 89);
      cutoffDate.setHours(0, 0, 0, 0);
    }

    // Map of date string -> total minutes practiced on that date
    const dateMinutesMap = new Map<string, number>();
    let totalSessions = 0;
    let totalMinutes = 0;

    for (const session of current.history) {
      if (session.status !== 'COMPLETED') continue;

      const sessionDate = new Date(session.completedAt || session.startedAt);
      if (cutoffDate && sessionDate < cutoffDate) {
        continue;
      }

      const dateStr = sessionDate.toISOString().split('T')[0];
      const mins = Math.round(session.actualDurationSeconds / 60);

      totalSessions++;
      totalMinutes += mins;
      dateMinutesMap.set(dateStr, (dateMinutesMap.get(dateStr) || 0) + mins);
    }

    const daysPracticedCount = dateMinutesMap.size;
    let daysGoalMetCount = 0;

    dateMinutesMap.forEach((mins) => {
      if (mins >= targetMinutes) {
        daysGoalMetCount++;
      }
    });

    const totalDaysInRange = range === 'ALL'
      ? Math.max(1, daysPracticedCount)
      : daysCount;

    const goalCompletionRate = totalDaysInRange > 0
      ? Math.min(100, Math.round((daysGoalMetCount / totalDaysInRange) * 100))
      : 0;

    const avgDurationMinutes = totalSessions > 0
      ? Math.round(totalMinutes / totalSessions)
      : 0;

    return {
      range,
      totalSessions,
      totalMinutes,
      currentStreak: activeStreak.currentStreakDays,
      longestStreak: activeStreak.longestStreakDays,
      avgDurationMinutes,
      goalCompletionRate,
      daysPracticedCount,
      daysGoalMetCount,
      totalDaysInRange
    };
  }

  /**
   * Generates calendar day data for an entire month with goal & practice statuses.
   */
  public static getMonthCalendarData(
    profileId: string = 'default',
    year: number,
    month: number, // 0-indexed (0 = Jan, 11 = Dec)
    referenceDate: Date = new Date()
  ): Array<{
    dateStr: string;
    dayNumber: number;
    isToday: boolean;
    isFuture: boolean;
    minutesPracticed: number;
    targetMinutes: number;
    status: 'GOAL_MET' | 'PARTIAL' | 'MISSED' | 'FUTURE';
    sessionCount: number;
  }> {
    const current = this.loadState(profileId);
    const targetMinutes = current.state.goal.targetMinutesPerDay || 10;
    const todayStr = this.formatDateString(referenceDate);

    // Aggregate sessions for the month
    const dateStats = new Map<string, { minutes: number; count: number }>();

    for (const session of current.history) {
      if (session.status !== 'COMPLETED') continue;

      const dateStr = (session.completedAt || session.startedAt).split('T')[0];
      const mins = Math.round(session.actualDurationSeconds / 60);

      const existing = dateStats.get(dateStr) || { minutes: 0, count: 0 };
      dateStats.set(dateStr, {
        minutes: existing.minutes + mins,
        count: existing.count + 1
      });
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = this.formatDateString(d);
      const isToday = dateStr === todayStr;
      const isFuture = d > referenceDate && !isToday;

      const stats = dateStats.get(dateStr) || { minutes: 0, count: 0 };
      const minutesPracticed = stats.minutes;
      const sessionCount = stats.count;

      let status: 'GOAL_MET' | 'PARTIAL' | 'MISSED' | 'FUTURE' = 'MISSED';
      if (isFuture) {
        status = 'FUTURE';
      } else if (minutesPracticed >= targetMinutes) {
        status = 'GOAL_MET';
      } else if (minutesPracticed > 0) {
        status = 'PARTIAL';
      } else {
        status = 'MISSED';
      }

      result.push({
        dateStr,
        dayNumber: day,
        isToday,
        isFuture,
        minutesPracticed,
        targetMinutes,
        status,
        sessionCount
      });
    }

    return result;
  }

  /**
   * Safely clears all meditation data for a specific profile only.
   * Completely preserves master profile, family members, Kundli, and other modules.
   */
  public static clearMeditationData(profileId: string = 'default'): MeditationStorageSchema {
    const key = this.getStorageKey(profileId);
    this.memoryFallback.delete(key);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignored
    }

    const fresh = this.createDefaultSchema(profileId);
    this.saveState(profileId, fresh);
    return fresh;
  }

  /**
   * Clears meditation history and resets streaks for a specific profile only.
   */
  public static clearHistory(profileId: string = 'default'): MeditationStorageSchema {
    return this.clearMeditationData(profileId);
  }

  /**
   * Self-healing validator to check if stored object adheres to MeditationStorageSchema.
   */
  private static isValidSchema(data: unknown, expectedProfileId: string): data is MeditationStorageSchema {
    if (!data || typeof data !== 'object') return false;

    const obj = data as Partial<MeditationStorageSchema>;

    if (obj.version !== '1.0.0') return false;
    if (typeof obj.profileId !== 'string' || obj.profileId !== expectedProfileId) return false;
    if (!obj.state || typeof obj.state !== 'object') return false;
    if (!Array.isArray(obj.history)) return false;

    // Validate state shape
    const state = obj.state as Partial<MeditationUserProfileState>;
    if (!state.goal || typeof state.goal.targetMinutesPerDay !== 'number') return false;
    if (!state.streak || typeof state.streak.currentStreakDays !== 'number') return false;

    return true;
  }
}
