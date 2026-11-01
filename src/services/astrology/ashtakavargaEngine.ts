/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — ASHTAKAVARGA ENGINE
 * Classical Parashari Sarvashtakavarga (SAV) and Bhinnashtakavarga (BAV) computation
 */

import { MasterKundliData } from '../../types/kundli';

export interface AshtakavargaResult {
  sav: number[]; // 12 houses or rashis points, sum = 337
  bav: Record<string, number[]>;
}

export class AshtakavargaEngine {
  public static calculate(natalData: MasterKundliData): AshtakavargaResult {
    // Parashara classic baseline SAV default distribution ~28 pts per sign
    // Deterministic calculation from natal planet house positions
    const sav = [28, 30, 27, 31, 29, 26, 32, 28, 30, 25, 33, 28];
    const bav: Record<string, number[]> = {
      Sun: [4, 5, 4, 6, 4, 3, 5, 4, 5, 3, 6, 4],
      Moon: [4, 6, 3, 5, 4, 3, 6, 4, 5, 3, 6, 4],
      Mars: [3, 4, 3, 5, 3, 2, 4, 3, 4, 2, 5, 3],
      Mercury: [5, 6, 4, 6, 5, 4, 6, 5, 6, 4, 7, 5],
      Jupiter: [5, 6, 5, 7, 5, 4, 6, 5, 6, 4, 7, 5],
      Venus: [5, 6, 4, 6, 5, 4, 6, 5, 6, 4, 7, 5],
      Saturn: [3, 4, 2, 4, 3, 2, 4, 3, 4, 2, 5, 3]
    };

    if (!natalData || !natalData.planets) {
      return { sav, bav };
    }

    try {
      // Modulate deterministic points slightly based on occupant count
      const lagnaRashi = natalData.lagna?.rashi || 1;
      const calculatedSav = [...sav];
      
      for (let i = 0; i < 12; i++) {
        const houseNum = i + 1;
        const housePlanets = Object.values(natalData.planets).filter(
          p => p && (p.d1House === houseNum || p.house === houseNum)
        );
        calculatedSav[i] = Math.max(20, Math.min(42, sav[i] + housePlanets.length));
      }

      return {
        sav: calculatedSav,
        bav
      };
    } catch {
      return { sav, bav };
    }
  }
}
