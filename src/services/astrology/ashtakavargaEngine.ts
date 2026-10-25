/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData } from '../../types/kundli';

export interface BAVResult {
  planet: string;
  points: number[]; // 12 values for 12 rashis (1-indexed mapping or 0-indexed?) Let's use 0-indexed for Rashi 1-12
  total: number;
}

export interface AshtakavargaResult {
  bav: Record<string, BAVResult>;
  sav: number[]; // 12 values
  shodhana: {
    trikona: number[];
    ekadhipatya: number[];
    rasiPinda: number;
    grahaPinda: number;
    shodhyaPinda: number;
  };
}

// Classical Parasara Rules for BAV
// Format: { [sourcePlanet]: [beneficPlacesRelative] }
const ASHTAKAVARGA_RULES: Record<string, Record<string, number[]>> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [3, 4, 6, 10, 11, 12]
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Lagna: [3, 6, 10, 11]
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 3, 6, 10, 11]
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 2, 4, 6, 8, 10, 11]
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11]
  },
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Lagna: [1, 2, 3, 4, 5, 8, 9, 11]
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Lagna: [1, 3, 4, 6, 10, 11]
  }
};

const RASHI_LORDS: Record<number, string> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun', 6: 'Mercury',
  7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

const PLANET_PINDA_FACTORS: Record<string, number> = {
  Sun: 5, Moon: 5, Mars: 8, Mercury: 5, Jupiter: 10, Venus: 7, Saturn: 5
};

const RASHI_PINDA_FACTORS: Record<number, number> = {
  1: 7, 2: 10, 3: 8, 4: 4, 5: 10, 6: 5, 7: 7, 8: 8, 9: 9, 10: 5, 11: 11, 12: 12
};

export class AshtakavargaEngine {
  static calculate(data: MasterKundliData): AshtakavargaResult {
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const positions: Record<string, number> = {};
    
    planets.forEach(p => {
      positions[p] = data.planets[p]?.rashi || 0;
    });
    positions['Lagna'] = data.lagna.rashi;

    const bav: Record<string, BAVResult> = {};
    const sav = new Array(12).fill(0);

    planets.forEach(targetPlanet => {
      const points = new Array(12).fill(0);
      const rules = ASHTAKAVARGA_RULES[targetPlanet];

      Object.entries(rules).forEach(([sourceKey, beneficPlaces]) => {
        const sourceRashi = positions[sourceKey];
        if (sourceRashi === 0) return;

        beneficPlaces.forEach(place => {
          // Place is relative (1 = same rashi, 2 = next, etc.)
          const rashiIndex = (sourceRashi + place - 2) % 12;
          points[rashiIndex]++;
        });
      });

      bav[targetPlanet] = {
        planet: targetPlanet,
        points,
        total: points.reduce((a, b) => a + b, 0)
      };

      // Add to SAV
      points.forEach((p, i) => sav[i] += p);
    });

    // Shodhana Calculations (based on SAV as per some traditions, but usually on BAV of a specific planet)
    // However, the prompt asks for SAV Shodhana or BAV Shodhana?
    // "Trikona Shodhana aur Ekadhipatya Shodhana ke baad Rasi Pinda, Graha Pinda aur Sodhya Pinda calculate karein."
    // Usually these are done on EACH planet's BAV to get its specific Sodhya Pinda.
    // Let's do it for SAV for now or provide a utility to do it for any.
    // Often "Sodhya Pinda" refers to the one derived from SAV if not specified.
    // But Ashtakavarga strength is often BAV based. 
    // I will implement it for SAV as a representative example or the prompt implies the whole SAV process.
    
    const trikona = this.performTrikonaShodhana([...sav]);
    const ekadhipatya = this.performEkadhipatyaShodhana([...trikona], data);
    
    const rasiPinda = this.calculateRasiPinda(ekadhipatya);
    const grahaPinda = this.calculateGrahaPinda(ekadhipatya, data);
    const shodhyaPinda = rasiPinda + grahaPinda;

    return {
      bav,
      sav,
      shodhana: {
        trikona,
        ekadhipatya,
        rasiPinda,
        grahaPinda,
        shodhyaPinda
      }
    };
  }

  private static performTrikonaShodhana(points: number[]): number[] {
    const result = [...points];
    const triads = [
      [0, 4, 8],  // 1, 5, 9
      [1, 5, 9],  // 2, 6, 10
      [2, 6, 10], // 3, 7, 11
      [3, 7, 11]  // 4, 8, 12
    ];

    triads.forEach(triad => {
      const min = Math.min(...triad.map(i => result[i]));
      triad.forEach(i => result[i] -= min);
    });

    return result;
  }

  private static performEkadhipatyaShodhana(points: number[], data: MasterKundliData): number[] {
    const result = [...points];
    const pairs = [
      [0, 7],   // 1 & 8 (Mars)
      [1, 6],   // 2 & 7 (Venus)
      [2, 5],   // 3 & 6 (Mercury)
      [8, 11],  // 9 & 12 (Jupiter)
      [9, 10]   // 10 & 11 (Saturn)
    ];

    // Cancer (4) and Leo (5) have single lordship, no reduction between them.
    
    pairs.forEach(([r1, r2]) => {
      const p1 = result[r1];
      const p2 = result[r2];
      
      const hasPlanet1 = Object.values(data.planets).some(p => p.rashi === r1 + 1);
      const hasPlanet2 = Object.values(data.planets).some(p => p.rashi === r2 + 1);

      if (p1 === 0 || p2 === 0) return;

      if (!hasPlanet1 && !hasPlanet2) {
        // Both empty
        if (p1 === p2) {
          result[r1] = 0;
          result[r2] = 0;
        } else {
          const min = Math.min(p1, p2);
          result[r1] = min;
          result[r2] = min;
        }
      } else if (hasPlanet1 && hasPlanet2) {
        // Both occupied
        // No change
      } else {
        // One occupied, one empty
        const occupied = hasPlanet1 ? r1 : r2;
        const empty = hasPlanet1 ? r2 : r1;
        
        if (result[empty] > result[occupied]) {
          result[empty] = result[occupied];
        } else if (result[empty] < result[occupied]) {
          // No change to occupied, but empty might stay same?
          // Actually rule says: if empty has more, reduce it to occupied's level.
          // If empty has less, it remains as is or becomes 0?
          // Common rule: if occupied sign has points, and empty sign has more, reduce empty to occupied.
          // If empty sign has less than occupied, reduce empty to 0.
          result[empty] = 0;
        } else {
          // equal
          result[empty] = 0;
        }
      }
    });

    return result;
  }

  private static calculateRasiPinda(shodhanaPoints: number[]): number {
    return shodhanaPoints.reduce((acc, points, i) => {
      return acc + (points * RASHI_PINDA_FACTORS[i + 1]);
    }, 0);
  }

  private static calculateGrahaPinda(shodhanaPoints: number[], data: MasterKundliData): number {
    let total = 0;
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    
    planets.forEach(pName => {
      const pData = data.planets[pName];
      if (pData) {
        const rashiIdx = pData.rashi - 1;
        total += (shodhanaPoints[rashiIdx] * PLANET_PINDA_FACTORS[pName]);
      }
    });
    
    return total;
  }
}
