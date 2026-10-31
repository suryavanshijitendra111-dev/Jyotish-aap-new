/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData } from '../../types/kundli';

export type LongevityCategory = 'Alpayu (Short Life)' | 'Madhyayu (Middle Life)' | 'Deerghayu (Long Life)';

export interface ArgalaDetail {
  house: number;
  argalaFrom: number[]; // Houses providing argala
  obstructedBy: number[]; // Houses obstructing
  activeArgalas: { house: number; planet: string; type: string }[];
  blockedArgalas: { house: number; planet: string; blockedBy: string }[];
}

export interface LongevityResult {
  category: LongevityCategory;
  range: string;
  pairs: {
    pair: string;
    result: string;
  }[];
  explanation: string;
}

export interface LongevityArgalaResult {
  longevity: LongevityResult;
  argala: ArgalaDetail[];
}

export class LongevityArgalaEngine {
  static calculate(data: MasterKundliData): LongevityArgalaResult {
    return {
      longevity: this.calculateLongevity(data),
      argala: this.calculateArgala(data)
    };
  }

  private static calculateLongevity(data: MasterKundliData): LongevityResult {
    // Jaimini Three Pairs Method
    // Pair 1: Lagna Lord & 8th Lord
    // Pair 2: Moon & Saturn
    // Pair 3: Lagna & Hora Lagna (Simplified: using 0 for HL if not calc)
    
    const lagnaRashi = data.lagna.rashi;
    const eighthHouse = ((lagnaRashi + 8 - 2) % 12) + 1;
    const lagnaLord = data.d1Chart[1].signLord;
    const eighthLord = data.d1Chart[eighthHouse].signLord;
    
    const llRashi = data.planets[lagnaLord]?.rashi || 1;
    const elRashi = data.planets[eighthLord]?.rashi || 1;
    const moonRashi = data.planets['Moon']?.rashi || 1;
    const saturnRashi = data.planets['Saturn']?.rashi || 1;
    
    // Using a placeholder for Hora Lagna (HL) as 1 for now if missing
    const hlRashi = 1; 

    const getNature = (rashi: number) => {
      const n = (rashi - 1) % 3;
      if (n === 0) return 'Movable';
      if (n === 1) return 'Fixed';
      return 'Dual';
    };

    const getResult = (n1: string, n2: string): LongevityCategory => {
      if (n1 === 'Movable' && n2 === 'Movable') return 'Deerghayu (Long Life)';
      if (n1 === 'Fixed' && n2 === 'Fixed') return 'Deerghayu (Long Life)';
      if (n1 === 'Dual' && n2 === 'Dual') return 'Deerghayu (Long Life)';
      
      if (n1 === 'Movable' && n2 === 'Fixed') return 'Alpayu (Short Life)';
      if (n1 === 'Fixed' && n2 === 'Movable') return 'Alpayu (Short Life)';
      
      return 'Madhyayu (Middle Life)';
    };

    const res1 = getResult(getNature(llRashi), getNature(elRashi));
    const res2 = getResult(getNature(moonRashi), getNature(saturnRashi));
    const res3 = getResult(getNature(lagnaRashi), getNature(hlRashi));

    // Majority Rule
    const counts: Record<string, number> = {
      'Alpayu (Short Life)': 0,
      'Madhyayu (Middle Life)': 0,
      'Deerghayu (Long Life)': 0
    };
    counts[res1]++;
    counts[res2]++;
    counts[res3]++;

    let finalCategory: LongevityCategory = 'Madhyayu (Middle Life)';
    if (counts['Deerghayu (Long Life)'] >= 2) finalCategory = 'Deerghayu (Long Life)';
    else if (counts['Alpayu (Short Life)'] >= 2) finalCategory = 'Alpayu (Short Life)';
    else if (res3 === 'Deerghayu (Long Life)' && counts['Deerghayu (Long Life)'] === 1) {
        // Special rule: if Lagna-HL pair gives Deerghayu, it's strong
        finalCategory = 'Deerghayu (Long Life)';
    }

    const jupiterHouse = data.planets['Jupiter']?.d1House || data.planets['jupiter']?.d1House;
    const saturnHouse = data.planets['Saturn']?.d1House || data.planets['saturn']?.d1House;
    let kakshyaVriddhiApplied = false;
    if (jupiterHouse === 9 && saturnHouse === 6) {
      finalCategory = 'Deerghayu (Long Life)';
      kakshyaVriddhiApplied = true;
    }

    const range = kakshyaVriddhiApplied ? '70-108+ Years (कक्षा वृद्धि नियम)' : finalCategory.includes('Short') ? '0-36 Years' : finalCategory.includes('Middle') ? '36-72 Years' : '72-108+ Years';
    const explanation = kakshyaVriddhiApplied
      ? "कक्षा वृद्धि नियम (Kakshya Vriddhi Rule) के अनुसार: नवम भाव में गुरु और छठे भाव में शनि की उपस्थिति से अल्पायु का परिहार होकर दीर्घायु / मध्यायु (70+ years) सुनिश्चित होती है।"
      : "Calculated using Jaimini's Method of Three Pairs based on the nature of signs (Movable/Fixed/Dual).";

    return {
      category: finalCategory,
      range,
      pairs: [
        { pair: 'Lagna Lord & 8th Lord', result: res1 },
        { pair: 'Moon & Saturn', result: res2 },
        { pair: 'Lagna & Hora Lagna', result: res3 }
      ],
      explanation
    };
  }

  private static calculateArgala(data: MasterKundliData): ArgalaDetail[] {
    const argalas: ArgalaDetail[] = [];
    
    for (let house = 1; house <= 12; house++) {
      const active: { house: number; planet: string; type: string }[] = [];
      const blocked: { house: number; planet: string; blockedBy: string }[] = [];

      // Primary Argala: 2, 4, 11
      // Obstruction (Virodha): 12, 10, 3
      const rules = [
        { arg: 2, vir: 12, type: 'Primary' },
        { arg: 4, vir: 10, type: 'Primary' },
        { arg: 11, vir: 3, type: 'Primary' },
        { arg: 5, vir: 9, type: 'Secondary' } // Secondary
      ];

      rules.forEach(rule => {
        const argHouse = ((house + rule.arg - 2) % 12) + 1;
        const virHouse = ((house + rule.vir - 2) % 12) + 1;

        const argPlanets = data.d1Chart[argHouse].planetsOccupying;
        const virPlanets = data.d1Chart[virHouse].planetsOccupying;

        argPlanets.forEach(ap => {
          if (virPlanets.length === 0) {
            active.push({ house: argHouse, planet: ap, type: rule.type });
          } else {
            // Exceptions: Ketu's argala is counted opposite, etc. (Simplified for now)
            blocked.push({ house: argHouse, planet: ap, blockedBy: virPlanets.join(', ') });
          }
        });
      });

      argalas.push({
        house,
        argalaFrom: [2, 4, 11, 5],
        obstructedBy: [12, 10, 3, 9],
        activeArgalas: active,
        blockedArgalas: blocked
      });
    }

    return argalas;
  }
}
