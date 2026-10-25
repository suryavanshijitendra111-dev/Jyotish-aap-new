import { MasterKundliData } from '../../types/kundli';
import { RuleEngine } from '../../types/systemRegistry';

export interface LalKitabAnalysisResult {
  status: 'AVAILABLE' | 'NOT_AVAILABLE';
  message?: string;
  planetsInFixedHouses: { planet: string; fixedHouse: number; rashi: number }[];
}

export class LalKitabEngine implements RuleEngine<LalKitabAnalysisResult> {
  evaluate(data: MasterKundliData): LalKitabAnalysisResult {
    const planetsInFixedHouses = [];
    const validPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    
    let hasData = false;
    for (const p of validPlanets) {
      const pd = data.planets[p];
      if (pd && pd.rashi != null) {
        hasData = true;
        planetsInFixedHouses.push({
          planet: p,
          fixedHouse: pd.rashi, // In Lal Kitab, Aries (1) is always House 1. So sign = house.
          rashi: pd.rashi
        });
      }
    }
    
    if (!hasData) {
      return { status: 'NOT_AVAILABLE', message: 'NOT AVAILABLE IN CURRENT CALCULATION DATASET', planetsInFixedHouses: [] };
    }

    return {
      status: 'AVAILABLE',
      planetsInFixedHouses
    };
  }
}
