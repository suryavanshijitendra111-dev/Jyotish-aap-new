import { ParashariFoundationResult, YogaResult } from '../../../types/parashari';

export class YogaCalculator {
  static calculate(foundation: ParashariFoundationResult): YogaResult[] {
    const results: YogaResult[] = [];

    // Helper for Pancha Mahapurusha Yogas
    const checkMahapurusha = (
      id: string, 
      yogaName: string, 
      planetName: string, 
      explanation: string
    ): YogaResult => {
      const p = foundation.planets[planetName];
      if (!p) {
        return {
          id, name: yogaName, category: 'Pancha Mahapurusha', status: false,
          planetsInvolved: [planetName], housesInvolved: [], signsInvolved: [],
          conditions: ['Planet exists', 'Planet in Kendra', 'Planet OwnSign or Exalted'],
          satisfiedConditions: [], failedConditions: ['Planet exists'],
          strength: 'Not Evaluated', calculationSource: 'Parashari Foundation Engine v1.0',
          explanationKey: explanation
        };
      }

      const h = foundation.houses[p.house];
      
      const c1 = `${planetName} exists`;
      const c2 = `${planetName} in Kendra (1, 4, 7, 10)`;
      const c3 = `${planetName} is Own Sign or Exalted`;

      const satisfied: string[] = [c1];
      const failed: string[] = [];

      if (h.isKendra) satisfied.push(c2); else failed.push(c2);
      if (p.dignity === 'Own Sign' || p.dignity === 'Exalted') satisfied.push(c3); else failed.push(c3);

      const status = failed.length === 0;

      return {
        id,
        name: yogaName,
        category: 'Pancha Mahapurusha',
        status,
        planetsInvolved: [planetName],
        housesInvolved: [p.house],
        signsInvolved: [p.rashi],
        conditions: [c1, c2, c3],
        satisfiedConditions: satisfied,
        failedConditions: failed,
        strength: 'Not Evaluated',
        calculationSource: 'Parashari Foundation Engine v1.0',
        explanationKey: explanation
      };
    };

    results.push(checkMahapurusha('PMY-01', 'Hamsa Yoga', 'Jupiter', 'Jupiter in a Kendra in its own or exalted sign.'));
    results.push(checkMahapurusha('PMY-02', 'Bhadra Yoga', 'Mercury', 'Mercury in a Kendra in its own or exalted sign.'));
    results.push(checkMahapurusha('PMY-03', 'Malavya Yoga', 'Venus', 'Venus in a Kendra in its own or exalted sign.'));
    results.push(checkMahapurusha('PMY-04', 'Ruchaka Yoga', 'Mars', 'Mars in a Kendra in its own or exalted sign.'));
    results.push(checkMahapurusha('PMY-05', 'Shasha Yoga', 'Saturn', 'Saturn in a Kendra in its own or exalted sign.'));

    return results;
  }
}
