import { MasterKundliData } from '../../../types/kundli';
import { HouseAnalysisResult } from '../../../types/parashari';
import { ParashariRules } from '../parashariRules';
import { LordshipCalculator } from './lordship';
import { DignityCalculator } from './dignity';

export class HouseAnalyzer {
  static analyzeAll(data: MasterKundliData): Record<number, HouseAnalysisResult> {
    const results: Record<number, HouseAnalysisResult> = {};
    const aspects = ParashariRules.calculateAspects(data);
    const dignities = DignityCalculator.calculateAll(data);

    for (let i = 1; i <= 12; i++) {
      const house = data.d1Chart[i];
      const signLord = house.signLord;
      
      const aspectsReceived = aspects
        .filter(a => a.targetHouse === i)
        .map(a => a.sourcePlanet);

      const lordPlacement = LordshipCalculator.getLordPlacement(data, i);
      let lordState = 'Unknown';
      if (lordPlacement) {
         lordState = dignities[signLord] || 'Neutral';
      }

      results[i] = {
        houseNumber: i,
        sign: house.rashi,
        signLord,
        occupants: [...house.planetsOccupying],
        aspectsReceived: [...new Set(aspectsReceived)], // Unique
        houseLordPlacement: lordPlacement ? {
          house: lordPlacement.house,
          sign: lordPlacement.sign,
          state: lordState
        } : { house: 0, sign: 0, state: 'Unknown' }
      };
    }

    return results;
  }
}
