/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION STORAGE SERVICE (PER-PROFILE ISOLATION)
 */

import { 
  MeditationSessionRecord, 
  MeditationState, 
  MeditationDailyGoal,
  MeditationReflection
} from '../../types/meditation/meditationTypes';

const PREFIX = 'jeevandarpan_meditation_';

function getStorageKey(profileId: string): string {
  return `${PREFIX}${profileId || 'default'}`;
}

function safeGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {}
  return null;
}

function safeSet(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch {}
}

function safeRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {}
}

export interface StoredProfileMeditationData {
  history: MeditationSessionRecord[];
  state: {
    activeSankalpa?: string;
    goal: MeditationDailyGoal;
    streak: {
      currentStreakDays: number;
      longestStreakDays: number;
      totalMinutesPracticed: number;
      lastCompletedDate?: string;
    };
    preferredAudioMode?: string;
  };
}

export class MeditationStorageService {
  private static defaultState(): StoredProfileMeditationData {
    return {
      history: [],
      state: {
        activeSankalpa: undefined,
        goal: {
          targetMinutesPerDay: 10,
          reminderEnabled: false,
          preferredReminderTime: '06:00',
          reminderMessage: 'प्रातः ध्यान समय'
        },
        streak: {
          currentStreakDays: 0,
          longestStreakDays: 0,
          totalMinutesPracticed: 0,
          lastCompletedDate: undefined
        }
      }
    };
  }

  public static loadState(profileId: string): StoredProfileMeditationData {
    const raw = safeGet(getStorageKey(profileId));
    if (!raw) return this.defaultState();

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          history: Array.isArray(parsed.history) ? parsed.history : [],
          state: {
            ...this.defaultState().state,
            ...parsed.state,
            goal: { ...this.defaultState().state.goal, ...parsed.state?.goal },
            streak: { ...this.defaultState().state.streak, ...parsed.state?.streak }
          }
        };
      }
    } catch {}

    return this.defaultState();
  }

  public static saveState(profileId: string, data: StoredProfileMeditationData): void {
    safeSet(getStorageKey(profileId), JSON.stringify(data));
  }

  public static updateDailyGoal(profileId: string, goal: Partial<MeditationDailyGoal>): void {
    const current = this.loadState(profileId);
    current.state.goal = { ...current.state.goal, ...goal };
    this.saveState(profileId, current);
  }

  public static setSankalpa(profileId: string, sankalpa: string): void {
    const current = this.loadState(profileId);
    current.state.activeSankalpa = sankalpa;
    this.saveState(profileId, current);
  }

  public static recordSession(profileId: string, session: MeditationSessionRecord): void {
    const current = this.loadState(profileId);
    current.history.unshift(session);

    if (session.status === 'COMPLETED') {
      const addedMinutes = Math.round((session.actualDurationSeconds || session.targetDurationSeconds) / 60);
      current.state.streak.totalMinutesPracticed += addedMinutes;
      current.state.streak.currentStreakDays = Math.max(1, current.state.streak.currentStreakDays + 1);
      current.state.streak.longestStreakDays = Math.max(current.state.streak.longestStreakDays, current.state.streak.currentStreakDays);
      current.state.streak.lastCompletedDate = new Date().toISOString();
    }

    this.saveState(profileId, current);
  }

  public static saveReflection(profileId: string, reflection: { sessionId: string; postSessionState: any; personalNotes?: string; recordedAt?: string }): void {
    const current = this.loadState(profileId);
    const session = current.history.find(s => s.sessionId === reflection.sessionId);
    if (session) {
      session.reflection = {
        postSessionState: reflection.postSessionState,
        personalNotes: reflection.personalNotes,
        recordedAt: reflection.recordedAt || new Date().toISOString()
      };
      this.saveState(profileId, current);
    }
  }

  public static clearMeditationData(profileId: string): void {
    safeRemove(getStorageKey(profileId));
  }
}
