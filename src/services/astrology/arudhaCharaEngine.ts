/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData } from '../../types/kundli';

export interface ArudhaPada {
  houseNumber: number; // 1-12
  padaNumber: number; // 1-12 (The house index where pada falls)
  label: string; // A1, A2, AL...
  rashiName: string;
}

export interface CharaDashaPeriod {
  sign: string;
  signIndex: number; // 1-12
  duration: number; // Years
  startDate: Date;
  endDate: Date;
}

export interface ArudhaCharaResult {
  arudhaPadas: ArudhaPada[];
  charaDasha: {
    sequence: CharaDashaPeriod[];
    current: CharaDashaPeriod | null;
  };
}

export class ArudhaCharaEngine {
  static calculate(data: MasterKundliData): ArudhaCharaResult {
    return {
      arudhaPadas: this.calculateArudhaPadas(data),
      charaDasha: this.calculateCharaDasha(data)
    };
  }

  private static calculateArudhaPadas(data: MasterKundliData): ArudhaPada[] {
    const padas: ArudhaPada[] = [];
    const rashiNames = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    for (let h = 1; h <= 12; h++) {
      const houseSign = data.d1Chart[h].rashi;
      const lordName = data.d1Chart[h].signLord;
      const lordPlanet = data.planets[lordName];
      
      if (!lordPlanet) continue;

      const lordHouse = lordPlanet.d1House; // 1-indexed from Lagna
      
      // Distance from House to Lord
      let dist = lordHouse - h;
      if (dist < 0) dist += 12;
      dist += 1; // 1-based distance

      // Arudha is 'dist' houses from Lord
      let padaHouse = (lordHouse + dist - 2) % 12 + 1;

      // Exceptions (Jagannatha Hora / Jaimini standard)
      // Rule: If Pada is in the house itself or 7th from it, move 10 or 4 houses.
      // Standard correction: 
      // If pada is H1, Arudha is 10th from H1 (H10)
      // If pada is H7, Arudha is 4th from H1 (H4)
      if (padaHouse === h) {
        padaHouse = (h + 10 - 2) % 12 + 1;
      } else {
        const seventhFromH = (h + 7 - 2) % 12 + 1;
        if (padaHouse === seventhFromH) {
          padaHouse = (h + 4 - 2) % 12 + 1;
        }
      }

      const label = h === 1 ? 'AL' : h === 12 ? 'UL' : `A${h}`;
      
      padas.push({
        houseNumber: h,
        padaNumber: padaHouse,
        label,
        rashiName: rashiNames[data.d1Chart[padaHouse].rashi - 1]
      });
    }

    return padas;
  }

  private static calculateCharaDasha(data: MasterKundliData): { sequence: CharaDashaPeriod[]; current: CharaDashaPeriod | null } {
    const lagnaRashi = data.lagna.rashi; // 1-12
    const sequence: CharaDashaPeriod[] = [];
    const rashiNames = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    // Direction logic (Jagannatha Hora / standard Chara Dasha)
    // Signs 1, 2, 3, 7, 8, 9 are usually Direct
    // Signs 4, 5, 6, 10, 11, 12 are usually Reverse
    const isDirectLagna = [1, 2, 3, 7, 8, 9].includes(lagnaRashi);
    
    let currentRashi = lagnaRashi;
    let startDate = new Date(data.birthProfile.dob + 'T' + data.birthProfile.time);
    if (isNaN(startDate.getTime())) {
        startDate = new Date(); // Fallback
    }

    for (let i = 0; i < 12; i++) {
      const signIdx = currentRashi;
      const duration = this.calculateCharaYears(signIdx, data);
      
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + duration);

      sequence.push({
        sign: rashiNames[signIdx - 1],
        signIndex: signIdx,
        duration,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });

      startDate = new Date(endDate);

      // Move to next sign in sequence
      if (isDirectLagna) {
        currentRashi = (currentRashi % 12) + 1;
      } else {
        currentRashi = currentRashi - 1;
        if (currentRashi < 1) currentRashi = 12;
      }
    }

    const now = new Date();
    const current = sequence.find(p => now >= p.startDate && now < p.endDate) || null;

    return { sequence, current };
  }

  private static calculateCharaYears(signIdx: number, data: MasterKundliData): number {
    // 1-indexed Rashi
    const signLordName = this.getSignLord(signIdx);
    const lordPlanet = data.planets[signLordName];
    if (!lordPlanet) return 0;

    const lordHouse = lordPlanet.d1House; // Position in D1 chart (1-12 from Lagna)
    // We need position relative to the sign itself
    // First find which house corresponds to the sign signIdx
    let signHouse = 0;
    for(let h=1; h<=12; h++) {
        if(data.d1Chart[h].rashi === signIdx) {
            signHouse = h;
            break;
        }
    }

    if (signHouse === 0) return 0;

    // Direction for counting years (Savya/Apasavya)
    // Rule: Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius are Savya (Forward)
    // Cancer, Leo, Virgo, Capricorn, Aquarius, Pisces are Apasavya (Backward)
    const isSavya = [1, 2, 3, 7, 8, 9].includes(signIdx);

    let years = 0;
    if (isSavya) {
      years = (lordHouse - signHouse + 12) % 12;
    } else {
      years = (signHouse - lordHouse + 12) % 12;
    }

    // Standard Jaimini correction: if years is 0, it becomes 12.
    // Note: Some schools do years+1 or years-1. Standard JH Chara Dasha is Count - 1.
    // If lord is in sign, distance is 1. 1-1 = 0 -> 12 years.
    if (years === 0) years = 12;

    return years;
  }

  private static getSignLord(signIdx: number): string {
    const lords = [
      'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
      'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
    ];
    // Simplifying Scorpio/Aquarius to single lords for consistent basic logic
    return lords[signIdx - 1];
  }
}
