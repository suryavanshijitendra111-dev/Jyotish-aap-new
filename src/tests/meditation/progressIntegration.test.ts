/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION LONG-TERM PROGRESS & CALENDAR TEST SUITE
 * PHASE 1.14H: PROGRESS HORIZONS (7D, 30D, 90D, ALL) & PRACTICE CALENDAR
 */

import assert from 'node:assert';
import {
  MeditationStorageService
} from '../../services/meditation/meditationStorageService';
import { MeditationSessionRecord } from '../../types/meditation/meditationTypes';

class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const mockStorage = new MockLocalStorage();
(globalThis as any).window = {
  localStorage: mockStorage
};

let passCount = 0;
function logPass(msg: string) {
  passCount++;
  console.log(`  ✓ Passed: ${msg}`);
}

console.log('================================================================');
console.log('JEEVANDARPAN — PHASE 1.14H: PROGRESS & CALENDAR TEST SUITE');
console.log('================================================================');

try {
  mockStorage.clear();

  const progressUser = 'user_progress_horizons';
  const refDate = new Date('2026-10-10T12:00:00.000Z'); // Fixed test baseline

  // Helper to make an ISO timestamp for N days before reference
  const makeDate = (daysAgo: number, timeStr = '07:00:00'): string => {
    const d = new Date(refDate);
    d.setUTCDate(d.getUTCDate() - daysAgo);
    const datePart = d.toISOString().split('T')[0];
    return `${datePart}T${timeStr}.000Z`;
  };

  // Seed sessions across the timeline:
  // - Day 0 (today: 2026-10-10): 10 min session (Goal met!)
  // - Day 2 (2026-10-08): 5 min session (Partial practice)
  // - Day 5 (2026-10-05): 20 min session (Goal met!)
  // - Day 20 (2026-09-20): 15 min session (Goal met!)
  // - Day 45 (2026-08-26): 30 min session (Goal met!)
  // - Day 120 (2026-06-12): 10 min session (Goal met!)

  const sessionsToSeed: MeditationSessionRecord[] = [
    {
      sessionId: 'sess_d0',
      profileId: progressUser,
      practiceId: 'BREATH_AWARENESS',
      targetDurationSeconds: 600,
      actualDurationSeconds: 600, // 10 min
      status: 'COMPLETED',
      recommendationSource: 'USER_SELECTED',
      startedAt: makeDate(0),
      completedAt: makeDate(0, '07:10:00'),
      audioModeUsed: 'VOICE_AND_AMBIENT'
    },
    {
      sessionId: 'sess_d2',
      profileId: progressUser,
      practiceId: 'SILENT_MEDITATION',
      targetDurationSeconds: 300,
      actualDurationSeconds: 300, // 5 min
      status: 'COMPLETED',
      recommendationSource: 'USER_SELECTED',
      startedAt: makeDate(2),
      completedAt: makeDate(2, '07:05:00'),
      audioModeUsed: 'AMBIENT'
    },
    {
      sessionId: 'sess_d5',
      profileId: progressUser,
      practiceId: 'BODY_AWARENESS',
      targetDurationSeconds: 1200,
      actualDurationSeconds: 1200, // 20 min
      status: 'COMPLETED',
      recommendationSource: 'USER_SELECTED',
      startedAt: makeDate(5),
      completedAt: makeDate(5, '07:20:00'),
      audioModeUsed: 'VOICE_AND_AMBIENT'
    },
    {
      sessionId: 'sess_d20',
      profileId: progressUser,
      practiceId: 'GRATITUDE_REFLECTION',
      targetDurationSeconds: 900,
      actualDurationSeconds: 900, // 15 min
      status: 'COMPLETED',
      recommendationSource: 'USER_SELECTED',
      startedAt: makeDate(20),
      completedAt: makeDate(20, '07:15:00'),
      audioModeUsed: 'VOICE_AND_AMBIENT'
    },
    {
      sessionId: 'sess_d45',
      profileId: progressUser,
      practiceId: 'SELF_OBSERVATION',
      targetDurationSeconds: 1800,
      actualDurationSeconds: 1800, // 30 min
      status: 'COMPLETED',
      recommendationSource: 'USER_SELECTED',
      startedAt: makeDate(45),
      completedAt: makeDate(45, '07:30:00'),
      audioModeUsed: 'VOICE_AND_AMBIENT'
    },
    {
      sessionId: 'sess_d120',
      profileId: progressUser,
      practiceId: 'PRAYERFUL_CONTEMPLATION',
      targetDurationSeconds: 600,
      actualDurationSeconds: 600, // 10 min
      status: 'COMPLETED',
      recommendationSource: 'USER_SELECTED',
      startedAt: makeDate(120),
      completedAt: makeDate(120, '07:10:00'),
      audioModeUsed: 'VOICE_AND_AMBIENT'
    }
  ];

  // Record all seeded sessions
  for (const s of sessionsToSeed) {
    MeditationStorageService.recordSession(progressUser, s, new Date(s.startedAt));
  }

  // -------------------------------------------------------------
  // 1. 7-DAY PROGRESS HORIZON
  // -------------------------------------------------------------
  console.log('\n--- 1. 7-DAY PROGRESS HORIZON ---');

  const stats7D = MeditationStorageService.getProgressStats(progressUser, '7D', refDate);
  // Included in 7D (Days 0, 2, 5):
  // Sessions: 3
  // Total Minutes: 10 + 5 + 20 = 35 min
  // Avg Duration: Math.round(35 / 3) = 12 min
  // Days goal met (target = 10 min): Day 0 (10m) and Day 5 (20m) = 2 days
  // Goal completion rate: (2 / 7) * 100 = 29%
  assert.strictEqual(stats7D.range, '7D');
  assert.strictEqual(stats7D.totalSessions, 3);
  assert.strictEqual(stats7D.totalMinutes, 35);
  assert.strictEqual(stats7D.avgDurationMinutes, 12);
  assert.strictEqual(stats7D.daysPracticedCount, 3);
  assert.strictEqual(stats7D.daysGoalMetCount, 2);
  assert.strictEqual(stats7D.goalCompletionRate, 29);
  logPass('7-Day horizon accurately calculates sessions, minutes, average, and goal completion rate');

  // -------------------------------------------------------------
  // 2. 30-DAY PROGRESS HORIZON
  // -------------------------------------------------------------
  console.log('\n--- 2. 30-DAY PROGRESS HORIZON ---');

  const stats30D = MeditationStorageService.getProgressStats(progressUser, '30D', refDate);
  // Included in 30D (Days 0, 2, 5, 20):
  // Sessions: 4
  // Total Minutes: 10 + 5 + 20 + 15 = 50 min
  // Avg Duration: Math.round(50 / 4) = 13 min
  // Days goal met: Days 0, 5, 20 = 3 days
  // Goal completion rate: (3 / 30) * 100 = 10%
  assert.strictEqual(stats30D.range, '30D');
  assert.strictEqual(stats30D.totalSessions, 4);
  assert.strictEqual(stats30D.totalMinutes, 50);
  assert.strictEqual(stats30D.avgDurationMinutes, 13);
  assert.strictEqual(stats30D.daysPracticedCount, 4);
  assert.strictEqual(stats30D.daysGoalMetCount, 3);
  assert.strictEqual(stats30D.goalCompletionRate, 10);
  logPass('30-Day horizon correctly captures 4 sessions totaling 50 minutes');

  // -------------------------------------------------------------
  // 3. 90-DAY PROGRESS HORIZON
  // -------------------------------------------------------------
  console.log('\n--- 3. 90-DAY PROGRESS HORIZON ---');

  const stats90D = MeditationStorageService.getProgressStats(progressUser, '90D', refDate);
  // Included in 90D (Days 0, 2, 5, 20, 45):
  // Sessions: 5
  // Total Minutes: 50 + 30 = 80 min
  assert.strictEqual(stats90D.range, '90D');
  assert.strictEqual(stats90D.totalSessions, 5);
  assert.strictEqual(stats90D.totalMinutes, 80);
  assert.strictEqual(stats90D.daysGoalMetCount, 4);
  logPass('90-Day horizon accurately includes 5 sessions totaling 80 minutes');

  // -------------------------------------------------------------
  // 4. ALL-TIME PROGRESS HORIZON
  // -------------------------------------------------------------
  console.log('\n--- 4. ALL-TIME PROGRESS HORIZON ---');

  const statsAll = MeditationStorageService.getProgressStats(progressUser, 'ALL', refDate);
  // All 6 sessions:
  // Total Minutes: 80 + 10 = 90 min
  assert.strictEqual(statsAll.range, 'ALL');
  assert.strictEqual(statsAll.totalSessions, 6);
  assert.strictEqual(statsAll.totalMinutes, 90);
  assert.strictEqual(statsAll.avgDurationMinutes, 15);
  logPass('All-time calculation aggregates full history (6 sessions, 90 minutes)');

  // -------------------------------------------------------------
  // 5. STREAK CALENDAR DAY-LEVEL STATUSES
  // -------------------------------------------------------------
  console.log('\n--- 5. STREAK CALENDAR DAY-LEVEL STATUSES ---');

  // Year 2026, Month 9 (October, 0-indexed)
  const calendarDays = MeditationStorageService.getMonthCalendarData(progressUser, 2026, 9, refDate);

  // October has 31 days
  assert.strictEqual(calendarDays.length, 31);
  logPass('Calendar generates exactly 31 day cells for October 2026');

  // Day 10 (Oct 10, today): Goal met (10 min)
  const day10 = calendarDays.find((d) => d.dayNumber === 10);
  assert.ok(day10);
  assert.strictEqual(day10.isToday, true);
  assert.strictEqual(day10.isFuture, false);
  assert.strictEqual(day10.minutesPracticed, 10);
  assert.strictEqual(day10.status, 'GOAL_MET');
  logPass('Day 10 (Today) classified as GOAL_MET with 10 minutes');

  // Day 8 (Oct 8, 2 days ago): Partial (5 min < 10 min goal)
  const day8 = calendarDays.find((d) => d.dayNumber === 8);
  assert.ok(day8);
  assert.strictEqual(day8.minutesPracticed, 5);
  assert.strictEqual(day8.status, 'PARTIAL');
  logPass('Day 8 classified as PARTIAL (5 min practiced vs 10 min target)');

  // Day 5 (Oct 5, 5 days ago): Goal met (20 min >= 10 min target)
  const day5 = calendarDays.find((d) => d.dayNumber === 5);
  assert.ok(day5);
  assert.strictEqual(day5.minutesPracticed, 20);
  assert.strictEqual(day5.status, 'GOAL_MET');
  logPass('Day 5 classified as GOAL_MET (20 min practiced)');

  // Day 7 (Oct 7): No practice in past -> MISSED
  const day7 = calendarDays.find((d) => d.dayNumber === 7);
  assert.ok(day7);
  assert.strictEqual(day7.minutesPracticed, 0);
  assert.strictEqual(day7.status, 'MISSED');
  logPass('Day 7 (unpracticed past day) classified as MISSED');

  // Day 25 (Oct 25): Future day -> FUTURE
  const day25 = calendarDays.find((d) => d.dayNumber === 25);
  assert.ok(day25);
  assert.strictEqual(day25.isFuture, true);
  assert.strictEqual(day25.status, 'FUTURE');
  logPass('Day 25 (future day) classified as FUTURE');

  console.log('================================================================');
  console.log(`ALL PROGRESS & CALENDAR TESTS PASSED (${passCount}/${passCount})`);
  console.log('================================================================');
} catch (err) {
  console.error('Test failure:', err);
  process.exit(1);
}
