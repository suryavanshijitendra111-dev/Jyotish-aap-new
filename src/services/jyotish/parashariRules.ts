import { MasterKundliData } from '../../types/kundli';
import { AspectData, ConjunctionPair, DignityData } from '../../types/jyotish';

export class ParashariRules {
  
  /**
   * Universal 7th Aspect for all.
   * Mars: 4, 7, 8
   * Jupiter: 5, 7, 9
   * Saturn: 3, 7, 10
   */
  static getAspectTypes(planetName: string): number[] {
    const baseAspects = [7];
    switch (planetName) {
      case 'Mars': return [4, 7, 8];
      case 'Jupiter': return [5, 7, 9];
      case 'Saturn': return [3, 7, 10];
      case 'Rahu': return [5, 7, 9]; // Common traditional inclusion for nodes
      case 'Ketu': return [5, 7, 9]; // Common traditional inclusion for nodes
      default: return baseAspects; // Sun, Moon, Mercury, Venus
    }
  }

  static calculateAspects(data: MasterKundliData): AspectData[] {
    const aspects: AspectData[] = [];
    
    for (const [planetName, pData] of Object.entries(data.planets)) {
      const types = this.getAspectTypes(planetName);
      const currentHouse = pData.d1House;
      const currentSign = pData.rashi;
      
      for (const aspect of types) {
        // Calculate target house (1-12)
        const targetHouse = ((currentHouse + aspect - 2) % 12) + 1;
        // Calculate target sign (1-12)
        const targetSign = ((currentSign + aspect - 2) % 12) + 1;
        
        // Find planets occupying target house
        const targetPlanets = data.d1Chart[targetHouse]?.planetsOccupying || [];
        
        aspects.push({
          sourcePlanet: planetName,
          targetHouse,
          targetSign,
          targetPlanets,
          aspectType: aspect,
          aspectStrength: 'Full',
          sourceLongitude: pData.siderealLongitude,
          ruleSource: 'Parashari'
        });
      }
    }
    
    return aspects;
  }

  static detectConjunctions(data: MasterKundliData): ConjunctionPair[] {
    const conjunctions: ConjunctionPair[] = [];
    const planetsList = Object.values(data.planets);

    // Compare every planet with every other planet (unique pairs)
    for (let i = 0; i < planetsList.length; i++) {
      for (let j = i + 1; j < planetsList.length; j++) {
        const p1 = planetsList[i];
        const p2 = planetsList[j];

        if (p1.d1House === p2.d1House && p1.rashi === p2.rashi) {
          // Calculate shortest angular separation
          let separation = Math.abs(p1.siderealLongitude - p2.siderealLongitude);
          if (separation > 180) {
            separation = 360 - separation;
          }

          conjunctions.push({
            planet1: p1.name,
            planet2: p2.name,
            house: p1.d1House,
            sign: p1.rashi,
            separationDegrees: separation,
            exactLongitude1: p1.siderealLongitude,
            exactLongitude2: p2.siderealLongitude,
            ruleSource: 'Parashari'
          });
        }
      }
    }

    return conjunctions;
  }

  static calculateDignity(data: MasterKundliData): DignityData[] {
    const dignities: DignityData[] = [];
    
    const dignityRules: Record<string, { exalt: number, deb: number, own: number[] }> = {
      'Sun': { exalt: 1, deb: 7, own: [5] },
      'Moon': { exalt: 2, deb: 8, own: [4] },
      'Mars': { exalt: 10, deb: 4, own: [1, 8] },
      'Mercury': { exalt: 6, deb: 12, own: [3, 6] },
      'Jupiter': { exalt: 4, deb: 10, own: [9, 12] },
      'Venus': { exalt: 12, deb: 6, own: [2, 7] },
      'Saturn': { exalt: 7, deb: 1, own: [10, 11] },
      'Rahu': { exalt: 3, deb: 9, own: [] }, // Gemini exaltation is common
      'Ketu': { exalt: 9, deb: 3, own: [] }
    };

    for (const [planetName, pData] of Object.entries(data.planets)) {
      const rules = dignityRules[planetName];
      let status: DignityData['status'] = 'None';
      
      if (rules) {
        if (pData.rashi === rules.exalt) status = 'Exalted';
        else if (pData.rashi === rules.deb) status = 'Debilitated';
        else if (rules.own.includes(pData.rashi)) status = 'OwnSign';
      }

      // Further neutral/friendly/enemy can be added later
      
      dignities.push({
        planet: planetName,
        sign: pData.rashi,
        status,
        ruleSource: 'Parashari'
      });
    }

    return dignities;
  }
}
