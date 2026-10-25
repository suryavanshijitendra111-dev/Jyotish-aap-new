/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MUHURAT SERVICE
 * PHASE 1.12: CORE ORCHESTRATION SERVICE
 * 
 * Evaluates, scores, and aggregates auspicious Vedic Muhurat windows
 * across user-selected date ranges and locations.
 */

import {
  MuhuratQuery,
  MuhuratCalculationResult,
  MuhuratWindow
} from '../../types/muhurat/muhuratTypes';
import { MuhuratPanchangCalculator } from './muhuratPanchangCalculator';
import { MuhuratRulesEngine, MUHURAT_CATEGORIES } from './muhuratRulesEngine';

export class MuhuratService {
  /**
   * Helper to format a Date as YYYY-MM-DD
   */
  public static formatDateIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Generates a date range array of YYYY-MM-DD strings
   */
  public static getDateListInRange(startDateStr: string, endDateStr: string, maxDays = 30): string[] {
    const dates: string[] = [];
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    // Safety guard against infinite loops
    let current = new Date(start);
    let count = 0;
    while (current <= end && count < maxDays) {
      dates.push(this.formatDateIso(current));
      current.setDate(current.getDate() + 1);
      count++;
    }

    return dates;
  }

  /**
   * Main calculation entry point
   */
  public static async calculateMuhurat(query: MuhuratQuery): Promise<MuhuratCalculationResult> {
    const categoryConfig = MUHURAT_CATEGORIES[query.category] || MUHURAT_CATEGORIES.sarva_karya;
    const dateList = this.getDateListInRange(query.startDate, query.endDate);

    const allWindows: MuhuratWindow[] = [];

    // Evaluate Panchang and Muhurat for each date in range
    for (const dateStr of dateList) {
      const panchang = MuhuratPanchangCalculator.calculateDayPanchang(
        dateStr,
        query.latitude,
        query.longitude,
        query.locationName,
        query.timezone
      );

      const dayWindows = MuhuratRulesEngine.evaluateDayForCategory(panchang, query.category);
      allWindows.push(...dayWindows);
    }

    // Filter by requested suitability if provided
    let filteredWindows = allWindows;
    if (query.filterSuitability === 'EXCELLENT_ONLY') {
      filteredWindows = allWindows.filter(w => w.suitability === 'EXCELLENT');
    } else if (query.filterSuitability === 'GOOD_AND_ABOVE') {
      filteredWindows = allWindows.filter(w => w.suitability === 'EXCELLENT' || w.suitability === 'GOOD');
    }

    // Sort: Chronological by date, then descending by score
    filteredWindows.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return b.score - a.score;
    });

    const excellentCount = allWindows.filter(w => w.suitability === 'EXCELLENT').length;
    const goodCount = allWindows.filter(w => w.suitability === 'GOOD').length;
    const moderateCount = allWindows.filter(w => w.suitability === 'MODERATE').length;
    const avoidCount = allWindows.filter(w => w.suitability === 'AVOID').length;

    // Determine overall best window
    const eligibleBest = allWindows.filter(w => w.suitability === 'EXCELLENT' || w.suitability === 'GOOD');
    eligibleBest.sort((a, b) => b.score - a.score);
    const bestWindow = eligibleBest[0] || null;

    const safetyNoticeHindi =
      'मुहूर्त पारंपरिक वैदिक ज्योतिषीय सिद्धांतों पर आधारित खगोलीय समय-संकेत है। इसे किसी निश्चित सफलता, सांसारिक लाभ अथवा दैवीय गारंटी के रूप में न लें। अपने विवेक, धर्म और निष्ठापूर्ण कर्म को सदैव सर्वोच्च प्राथमिकता दें।';

    return {
      query,
      generatedTimestamp: new Date().toISOString(),
      totalWindowsFound: filteredWindows.length,
      excellentCount,
      goodCount,
      moderateCount,
      avoidCount,
      windows: filteredWindows,
      bestWindow,
      categoryGuidanceHindi: categoryConfig.descriptionHindi,
      safetyNoticeHindi,
      calculationEngine: 'JeevanDarpan Vedic Muhurat Engine (Swiss Ephemeris Standard)'
    };
  }
}
