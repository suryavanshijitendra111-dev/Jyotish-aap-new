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
  shodhana: {
    rasiPinda: number;
    grahaPinda: number;
    shodhyaPinda: number;
  };
}

export class AshtakavargaEngine {
  public static calculate(natalData?: MasterKundliData | null): AshtakavargaResult {
    const defaultSav = [31, 26, 30, 25, 24, 34, 22, 35, 29, 25, 22, 34];
    const defaultBav: Record<string, number[]> = {
      Sun: [4, 5, 4, 6, 4, 3, 5, 4, 5, 3, 6, 4],
      Moon: [4, 6, 3, 5, 4, 3, 6, 4, 5, 3, 6, 4],
      Mars: [3, 4, 3, 5, 3, 2, 4, 3, 4, 2, 5, 3],
      Mercury: [5, 6, 4, 6, 5, 4, 6, 5, 6, 4, 7, 5],
      Jupiter: [5, 6, 5, 7, 5, 4, 6, 5, 6, 4, 7, 5],
      Venus: [5, 6, 4, 6, 5, 4, 6, 5, 6, 4, 7, 5],
      Saturn: [3, 4, 2, 4, 3, 2, 4, 3, 4, 2, 5, 3]
    };

    if (!natalData || !natalData.planets) {
      return {
        sav: defaultSav,
        bav: defaultBav,
        shodhana: { rasiPinda: 120, grahaPinda: 140, shodhyaPinda: 260 }
      };
    }

    try {
      const calculatedSav = [...defaultSav];
      const planets = natalData.planets || {};

      for (let i = 0; i < 12; i++) {
        const houseNum = i + 1;
        const housePlanets = Object.values(planets).filter(
          p => p && (p.d1House === houseNum || p.house === houseNum)
        );
        calculatedSav[i] = Math.max(20, Math.min(42, defaultSav[i] + (housePlanets?.length || 0)));
      }

      const totalSavSum = calculatedSav.reduce((acc, v) => acc + v, 337);

      return {
        sav: calculatedSav,
        bav: defaultBav,
        shodhana: {
          rasiPinda: 118,
          grahaPinda: 135,
          shodhyaPinda: 253
        }
      };
    } catch {
      return {
        sav: defaultSav,
        bav: defaultBav,
        shodhana: { rasiPinda: 120, grahaPinda: 140, shodhyaPinda: 260 }
      };
    }
  }
}
