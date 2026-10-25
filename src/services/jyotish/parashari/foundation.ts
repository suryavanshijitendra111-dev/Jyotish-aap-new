import { MasterKundliData } from '../../../types/kundli';
import { 
  ParashariFoundationResult, 
  ParashariHouseData, 
  ParashariPlanetData, 
  ParashariAspectData 
} from '../../../types/parashari';

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

function getDignity(planetName: string, rashi: number): 'Own Sign' | 'Exalted' | 'Debilitated' | 'Neutral/Other' {
  switch (planetName) {
    case 'Sun':
      if (rashi === 5) return 'Own Sign';
      if (rashi === 1) return 'Exalted';
      if (rashi === 7) return 'Debilitated';
      return 'Neutral/Other';
    case 'Moon':
      if (rashi === 4) return 'Own Sign';
      if (rashi === 2) return 'Exalted';
      if (rashi === 8) return 'Debilitated';
      return 'Neutral/Other';
    case 'Mars':
      if (rashi === 1 || rashi === 8) return 'Own Sign';
      if (rashi === 10) return 'Exalted';
      if (rashi === 4) return 'Debilitated';
      return 'Neutral/Other';
    case 'Mercury':
      if (rashi === 3 || rashi === 6) return rashi === 6 ? 'Exalted' : 'Own Sign'; // For Mercury, Virgo is both Exalted and Moolatrikona/Own, but we'll return Exalted if it's 6, wait - user just specified "Own Sign" or "Exalted". Let's give precedence to Exalted if 6. 
      // Actually, standard says Virgo is Exalted (and Own). Let's return Exalted for 6.
      if (rashi === 12) return 'Debilitated';
      return 'Neutral/Other';
    case 'Jupiter':
      if (rashi === 9 || rashi === 12) return 'Own Sign';
      if (rashi === 4) return 'Exalted';
      if (rashi === 10) return 'Debilitated';
      return 'Neutral/Other';
    case 'Venus':
      if (rashi === 2 || rashi === 7) return 'Own Sign';
      if (rashi === 12) return 'Exalted';
      if (rashi === 6) return 'Debilitated';
      return 'Neutral/Other';
    case 'Saturn':
      if (rashi === 10 || rashi === 11) return 'Own Sign';
      if (rashi === 7) return 'Exalted';
      if (rashi === 1) return 'Debilitated';
      return 'Neutral/Other';
    default:
      // Rahu/Ketu - Neutral/Other as per instruction not to mix
      return 'Neutral/Other';
  }
}

export class FoundationCalculator {
  static calculate(data: MasterKundliData): ParashariFoundationResult {
    const houses: Record<number, ParashariHouseData> = {};
    const planets: Record<string, ParashariPlanetData> = {};

    // 1. Calculate Houses
    for (let i = 1; i <= 12; i++) {
      const d1 = data.d1Chart[i];
      houses[i] = {
        houseNumber: i,
        rashi: d1.rashi,
        rashiName: d1.rashiName,
        signLord: d1.signLord,
        isKendra: [1, 4, 7, 10].includes(i),
        isTrikona: [1, 5, 9].includes(i),
        isDusthana: [6, 8, 12].includes(i),
        planetsOccupying: [...d1.planetsOccupying]
      };
    }

    // 2. Initialize Planets
    PLANETS.forEach(name => {
      const p = data.planets[name];
      if (!p) return;
      
      let dignity = getDignity(name, p.rashi);
      // for Mercury, if rashi is 6, we'll assign Exalted, though it's also Own Sign. 
      // The rules test "Exalted" or "OwnSign", so either is fine. 
      
      planets[name] = {
        name,
        house: p.d1House,
        rashi: p.rashi,
        rashiName: p.rashiName,
        dignity,
        conjunctions: [],
        aspectsGiven: [],
        aspectsReceived: []
      };
    });

    // 3. Conjunctions & Aspects
    PLANETS.forEach(name => {
      const p = planets[name];
      if (!p) return;

      // Conjunctions
      p.conjunctions = houses[p.house].planetsOccupying.filter(other => other !== name);

      // Aspects Given
      const aspectsGiven: ParashariAspectData[] = [];
      const addAspect = (value: number, type: 'Full' | 'Special') => {
        const aspectedHouse = ((p.house + value - 2) % 12) + 1;
        aspectsGiven.push({
          aspectingPlanet: name,
          aspectedHouse,
          aspectType: type,
          aspectValue: value
        });
      };

      if (name !== 'Rahu' && name !== 'Ketu') {
        // Standard 7th aspect for true planets
        addAspect(7, 'Full');
      }

      // Special Aspects
      if (name === 'Mars') {
        addAspect(4, 'Special');
        addAspect(8, 'Special');
      } else if (name === 'Jupiter') {
        addAspect(5, 'Special');
        addAspect(9, 'Special');
      } else if (name === 'Saturn') {
        addAspect(3, 'Special');
        addAspect(10, 'Special');
      }
      
      p.aspectsGiven = aspectsGiven;
    });

    // 4. Aspects Received
    PLANETS.forEach(name => {
      const p = planets[name];
      if (!p) return;

      PLANETS.forEach(otherName => {
        if (name === otherName) return;
        const otherP = planets[otherName];
        if (!otherP) return;

        otherP.aspectsGiven.forEach(aspect => {
          if (aspect.aspectedHouse === p.house) {
            p.aspectsReceived.push(aspect);
          }
        });
      });
    });

    return { houses, planets };
  }
}
