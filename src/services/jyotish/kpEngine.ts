import { MasterKundliData } from '../../types/kundli';
import { RuleEngine } from '../../types/systemRegistry';

export interface KPPlanetData {
  planet: string;
  longitude: number;
  degree: number;
  rashi: number;
  rashiLord: string;
  nakshatra: number;
  nakshatraLord: string;
  nakshatraNumber: number;
  nakshatraProgress: number;
  subLord: string;
  subSubLord: string | null;
  retrograde: boolean;
  combust: boolean;
  house: number;
  status: string;
}

export interface KPCuspData {
  house: number;
  cuspLongitude: number;
  degree: number;
  rashi: number;
  rashiLord: string;
  nakshatra: number;
  nakshatraLord: string;
  subLord: string;
  subSubLord: string | null;
  status: string;
}

export interface KPPlanetSignificator {
  planet: string;
  levelA: number[]; // Houses occupied by planet's Star Lord
  levelB: number[]; // House occupied by planet itself
  levelC: number[]; // Houses owned by planet's Star Lord
  levelD: number[]; // Houses owned by planet itself
  allSignifiedHouses: number[]; // Deduplicated sorted list of all signified houses
}

export interface KPHouseSignificator {
  house: number;
  levelA: string[]; // Planets in the star of occupants
  levelB: string[]; // Occupants of the house
  levelC: string[]; // Planets in the star of house lord
  levelD: string[]; // House lord
  allSignificatorPlanets: string[]; // Deduplicated list of planets
}

export interface KPSignificators {
  byPlanet: Record<string, KPPlanetSignificator>;
  byHouse: Record<number, KPHouseSignificator>;
}

export interface KPLagnaRP {
  signLord: string;
  starLord: string;
  subLord: string;
  longitude: number;
  degree: number;
  rashi: number;
  nakshatra: number;
}

export interface KPMoonRP {
  signLord: string;
  starLord: string;
  subLord: string;
  longitude: number;
  degree: number;
  rashi: number;
  nakshatra: number;
}

export interface KPDayLordRP {
  dayLord: string;
  dayName: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  dateString: string;
  timeString?: string;
}

export interface KPRulingPlanetItem {
  planet: string;
  source: 'LAGNA' | 'MOON' | 'DAY';
  role: 'SIGN_LORD' | 'STAR_LORD' | 'SUB_LORD' | 'DAY_LORD';
  label: string; // e.g. "Moon Star Lord", "Lagna Sign Lord"
  priority: number; // 1 (highest) to 7
  isRetrograde: boolean;
  starLord?: string;
  isStarLordRetrograde?: boolean;
}

export interface KPNodeRepresentation {
  node: 'Rahu' | 'Ketu';
  signLord: string;
  starLord: string;
  subLord?: string;
  conjoinedPlanets: string[];
  representsRulingPlanet: boolean;
  representedPlanets: string[];
}

export interface KPRulingPlanets {
  lagna: KPLagnaRP;
  moon: KPMoonRP;
  dayLord: KPDayLordRP;
  primaryList: string[]; // 5 Classic primary RPs: [Moon Star, Moon Sign, Lagna Star, Lagna Sign, Day Lord]
  allRulingPlanets: string[]; // Full deduplicated list including sub-lords & represented nodes
  details: KPRulingPlanetItem[];
  nodeRepresentations: KPNodeRepresentation[];
  status: 'CALCULATED' | 'PARTIAL';
}

export interface KPAnalysisResult {
  system: 'KP';
  planetData: KPPlanetData[];
  cuspData: KPCuspData[];
  significators?: KPSignificators;
  rulingPlanets?: KPRulingPlanets;
  rules: any[];
  availability: 'AVAILABLE' | 'NOT_AVAILABLE' | 'PARTIAL';
  warnings: string[];
  metadata: any;
}

const RASHI_LORDS: Record<number, string> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 
  5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars', 
  9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

const VIMSHOTTARI_LORDS = [
  { lord: 'Ketu', years: 7 },
  { lord: 'Venus', years: 20 },
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 10 },
  { lord: 'Mars', years: 7 },
  { lord: 'Rahu', years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn', years: 19 },
  { lord: 'Mercury', years: 17 }
];
const NAK_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

export class KpEngine implements RuleEngine<KPAnalysisResult> {
  evaluate(data: MasterKundliData): KPAnalysisResult {
    const planetData: KPPlanetData[] = [];
    const cuspData: KPCuspData[] = [];
    const warnings: string[] = [];

    // 1. Calculate 12 KP Cusps using MasterKundliData.bhavaChart (Placidus)
    if (data.bhavaChart) {
      for (let h = 1; h <= 12; h++) {
        const bhava = data.bhavaChart[h];
        if (bhava && bhava.cuspLongitude != null) {
          const norm = ((bhava.cuspLongitude % 360) + 360) % 360;
          const degree = norm % 30;
          const rashi = bhava.rashi || (Math.floor(norm / 30) + 1);
          const rashiLord = bhava.signLord || RASHI_LORDS[rashi] || 'Unknown';
          const nakNumber = Math.floor(norm / (360 / 27)) + 1;
          const nakLord = NAK_LORDS[(nakNumber - 1) % 9];
          const subLord = this.calculateSubLord(norm, nakLord);

          cuspData.push({
            house: h,
            cuspLongitude: norm,
            degree,
            rashi,
            rashiLord,
            nakshatra: nakNumber,
            nakshatraLord: nakLord,
            subLord,
            subSubLord: null,
            status: 'CALCULATED'
          });
        }
      }
    }

    if (cuspData.length < 12) {
      warnings.push("Exact Placidus cusp data is incomplete in bhavaChart.");
    }

    // 2. Calculate Planetary KP Data and Placidus House Occupancy
    const validPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    
    for (const p of validPlanets) {
      const pd = data.planets[p];
      if (pd && pd.siderealLongitude != null && pd.rashi != null) {
        const nakNumber = pd.nakshatra || Math.floor(pd.siderealLongitude / (360 / 27)) + 1;
        const nakLord = NAK_LORDS[(nakNumber - 1) % 9];
        const subLord = this.calculateSubLord(pd.siderealLongitude, nakLord);
        const kpHouse = this.getKpHouse(pd.siderealLongitude, cuspData);

        planetData.push({
          planet: p,
          longitude: pd.siderealLongitude,
          degree: pd.degree ?? (pd.siderealLongitude % 30),
          rashi: pd.rashi,
          rashiLord: RASHI_LORDS[pd.rashi],
          nakshatra: pd.nakshatra || nakNumber,
          nakshatraLord: nakLord,
          nakshatraNumber: nakNumber,
          nakshatraProgress: pd.pada || 1,
          subLord: subLord,
          subSubLord: null,
          retrograde: pd.isRetrograde || false,
          combust: pd.isCombust || false,
          house: kpHouse,
          status: 'CALCULATED'
        });
      }
    }

    // 3. Calculate 4-Fold KP Significators (Levels A, B, C, D)
    let significators: KPSignificators | undefined;
    if (cuspData.length === 12 && planetData.length > 0) {
      significators = this.calculateSignificators(planetData, cuspData);
    }

    // 4. Calculate KP Ruling Planets (RP)
    const rulingPlanets = this.calculateRulingPlanets(data, planetData, cuspData);

    return {
      system: 'KP',
      planetData,
      cuspData,
      significators,
      rulingPlanets,
      rules: significators ? Object.values(significators.byPlanet) : [],
      availability: 'PARTIAL',
      warnings,
      metadata: { engineVersion: '3.0.0-phase3a' }
    };
  }

  private getKpHouse(longitude: number, cusps: KPCuspData[]): number {
    if (cusps.length < 12) return 1;
    const norm = ((longitude % 360) + 360) % 360;
    for (let i = 0; i < 12; i++) {
      const currentCusp = cusps[i].cuspLongitude;
      const nextCusp = cusps[(i + 1) % 12].cuspLongitude;
      if (nextCusp > currentCusp) {
        if (norm >= currentCusp && norm < nextCusp) {
          return cusps[i].house;
        }
      } else {
        // Wraparound across 0° Aries
        if (norm >= currentCusp || norm < nextCusp) {
          return cusps[i].house;
        }
      }
    }
    return 1;
  }

  private calculateSignificators(planetData: KPPlanetData[], cuspData: KPCuspData[]): KPSignificators {
    // Maps for fast lookup
    const planetOccupiedHouse: Record<string, number> = {};
    const occupantsOfHouse: Record<number, string[]> = {};
    const housesOwnedByPlanet: Record<string, number[]> = {};
    const houseLordOfCusp: Record<number, string> = {};
    const planetStarLord: Record<string, string> = {};

    for (let h = 1; h <= 12; h++) {
      occupantsOfHouse[h] = [];
    }

    for (const p of planetData) {
      planetOccupiedHouse[p.planet] = p.house;
      planetStarLord[p.planet] = p.nakshatraLord;
      if (occupantsOfHouse[p.house]) {
        occupantsOfHouse[p.house].push(p.planet);
      }
    }

    for (const c of cuspData) {
      houseLordOfCusp[c.house] = c.rashiLord;
      if (!housesOwnedByPlanet[c.rashiLord]) {
        housesOwnedByPlanet[c.rashiLord] = [];
      }
      housesOwnedByPlanet[c.rashiLord].push(c.house);
    }

    // 1. Calculate Significators By Planet
    const byPlanet: Record<string, KPPlanetSignificator> = {};
    for (const p of planetData) {
      const starLord = p.nakshatraLord;
      
      // Level A: House occupied by Planet's Star Lord
      const levelA: number[] = planetOccupiedHouse[starLord] ? [planetOccupiedHouse[starLord]] : [];

      // Level B: House occupied by Planet itself
      const levelB: number[] = planetOccupiedHouse[p.planet] ? [planetOccupiedHouse[p.planet]] : [];

      // Level C: Houses owned by Planet's Star Lord
      const levelC: number[] = housesOwnedByPlanet[starLord] ? [...housesOwnedByPlanet[starLord]] : [];

      // Level D: Houses owned by Planet itself
      const levelD: number[] = housesOwnedByPlanet[p.planet] ? [...housesOwnedByPlanet[p.planet]] : [];

      const allSignifiedHouses = Array.from(new Set([...levelA, ...levelB, ...levelC, ...levelD])).sort((a, b) => a - b);

      byPlanet[p.planet] = {
        planet: p.planet,
        levelA,
        levelB,
        levelC,
        levelD,
        allSignifiedHouses
      };
    }

    // 2. Calculate Significators By House
    const byHouse: Record<number, KPHouseSignificator> = {};
    for (let h = 1; h <= 12; h++) {
      const occupants = occupantsOfHouse[h] || [];
      const houseLord = houseLordOfCusp[h] || 'Unknown';

      // Level A: Planets in the Star of the occupants of House H
      const levelA: string[] = [];
      for (const p of planetData) {
        if (occupants.includes(p.nakshatraLord)) {
          levelA.push(p.planet);
        }
      }

      // Level B: Occupants of House H
      const levelB: string[] = [...occupants];

      // Level C: Planets in the Star of the House Lord of House H
      const levelC: string[] = [];
      for (const p of planetData) {
        if (p.nakshatraLord === houseLord) {
          levelC.push(p.planet);
        }
      }

      // Level D: House Lord of House H
      const levelD: string[] = houseLord !== 'Unknown' ? [houseLord] : [];

      const allSignificatorPlanets = Array.from(new Set([...levelA, ...levelB, ...levelC, ...levelD]));

      byHouse[h] = {
        house: h,
        levelA,
        levelB,
        levelC,
        levelD,
        allSignificatorPlanets
      };
    }

    return {
      byPlanet,
      byHouse
    };
  }

  private calculateSubLord(longitude: number, nakLordName: string): string {
    const nakLengthDeg = 13 + 1/3; // 13.333333
    const startDegOfNak = Math.floor(longitude / nakLengthDeg) * nakLengthDeg;
    let degInNak = longitude - startDegOfNak;
    
    const startIndex = VIMSHOTTARI_LORDS.findIndex(v => v.lord === nakLordName);
    if (startIndex === -1) return 'Unknown';

    for (let i = 0; i < 9; i++) {
      const idx = (startIndex + i) % 9;
      const lordInfo = VIMSHOTTARI_LORDS[idx];
      const lordArc = (lordInfo.years / 120) * nakLengthDeg;
      
      if (degInNak <= lordArc + 0.0001) { // Floating point safety
        return lordInfo.lord;
      }
      degInNak -= lordArc;
    }
    return VIMSHOTTARI_LORDS[(startIndex + 8) % 9].lord; // Fallback to last
  }

  private calculateRulingPlanets(
    data: MasterKundliData,
    planetData: KPPlanetData[],
    cuspData: KPCuspData[]
  ): KPRulingPlanets {
    const lagna = this.calculateLagnaRP(data, cuspData);
    const moon = this.calculateMoonRP(data, planetData);
    const dayLord = this.calculateDayLord(data);

    const getRetrograde = (pName: string): boolean => {
      const p = planetData.find(x => x.planet === pName);
      return p ? p.retrograde : false;
    };

    const getStarLord = (pName: string): string | undefined => {
      const p = planetData.find(x => x.planet === pName);
      return p ? p.nakshatraLord : undefined;
    };

    // KP 7-Fold Hierarchy Details
    const details: KPRulingPlanetItem[] = [
      {
        planet: moon.starLord,
        source: 'MOON',
        role: 'STAR_LORD',
        label: 'Moon Star Lord',
        priority: 1,
        isRetrograde: getRetrograde(moon.starLord),
        starLord: getStarLord(moon.starLord),
        isStarLordRetrograde: getRetrograde(getStarLord(moon.starLord) || '')
      },
      {
        planet: moon.signLord,
        source: 'MOON',
        role: 'SIGN_LORD',
        label: 'Moon Sign Lord',
        priority: 2,
        isRetrograde: getRetrograde(moon.signLord),
        starLord: getStarLord(moon.signLord),
        isStarLordRetrograde: getRetrograde(getStarLord(moon.signLord) || '')
      },
      {
        planet: lagna.starLord,
        source: 'LAGNA',
        role: 'STAR_LORD',
        label: 'Lagna Star Lord',
        priority: 3,
        isRetrograde: getRetrograde(lagna.starLord),
        starLord: getStarLord(lagna.starLord),
        isStarLordRetrograde: getRetrograde(getStarLord(lagna.starLord) || '')
      },
      {
        planet: lagna.signLord,
        source: 'LAGNA',
        role: 'SIGN_LORD',
        label: 'Lagna Sign Lord',
        priority: 4,
        isRetrograde: getRetrograde(lagna.signLord),
        starLord: getStarLord(lagna.signLord),
        isStarLordRetrograde: getRetrograde(getStarLord(lagna.signLord) || '')
      },
      {
        planet: dayLord.dayLord,
        source: 'DAY',
        role: 'DAY_LORD',
        label: 'Day Lord',
        priority: 5,
        isRetrograde: getRetrograde(dayLord.dayLord),
        starLord: getStarLord(dayLord.dayLord),
        isStarLordRetrograde: getRetrograde(getStarLord(dayLord.dayLord) || '')
      },
      {
        planet: lagna.subLord,
        source: 'LAGNA',
        role: 'SUB_LORD',
        label: 'Lagna Sub Lord',
        priority: 6,
        isRetrograde: getRetrograde(lagna.subLord),
        starLord: getStarLord(lagna.subLord),
        isStarLordRetrograde: getRetrograde(getStarLord(lagna.subLord) || '')
      },
      {
        planet: moon.subLord,
        source: 'MOON',
        role: 'SUB_LORD',
        label: 'Moon Sub Lord',
        priority: 7,
        isRetrograde: getRetrograde(moon.subLord),
        starLord: getStarLord(moon.subLord),
        isStarLordRetrograde: getRetrograde(getStarLord(moon.subLord) || '')
      }
    ];

    // Primary 5 Ruling Planets (Classic KP Hierarchy)
    const primaryList = Array.from(new Set([
      moon.starLord,
      moon.signLord,
      lagna.starLord,
      lagna.signLord,
      dayLord.dayLord
    ])).filter(p => p && p !== 'Unknown');

    // Nodal Representatives (Rahu / Ketu)
    const nodeRepresentations = this.calculateNodeRepresentations(data, planetData, primaryList);

    // Active nodes that represent any primary ruling planet
    const activeNodes = nodeRepresentations
      .filter(n => n.representsRulingPlanet)
      .map(n => n.node);

    // Deduplicated list of all ruling planets including sub-lords and node agents
    const allRulingPlanets = Array.from(new Set([
      ...primaryList,
      lagna.subLord,
      moon.subLord,
      ...activeNodes
    ])).filter(p => p && p !== 'Unknown');

    return {
      lagna,
      moon,
      dayLord,
      primaryList,
      allRulingPlanets,
      details,
      nodeRepresentations,
      status: 'CALCULATED'
    };
  }

  private calculateLagnaRP(data: MasterKundliData, cusps: KPCuspData[]): KPLagnaRP {
    const c1 = cusps.find(c => c.house === 1);
    if (c1) {
      return {
        signLord: c1.rashiLord,
        starLord: c1.nakshatraLord,
        subLord: c1.subLord,
        longitude: c1.cuspLongitude,
        degree: c1.degree,
        rashi: c1.rashi,
        nakshatra: c1.nakshatra
      };
    }

    const lagna = data.lagna;
    const long = lagna?.siderealLongitude ?? 0;
    const norm = ((long % 360) + 360) % 360;
    const rashi = lagna?.rashi || (Math.floor(norm / 30) + 1);
    const signLord = lagna?.signLord || RASHI_LORDS[rashi] || 'Unknown';
    const nakNumber = lagna?.nakshatra || (Math.floor(norm / (360 / 27)) + 1);
    const starLord = lagna?.nakshatraLord || NAK_LORDS[(nakNumber - 1) % 9];
    const subLord = this.calculateSubLord(norm, starLord);

    return {
      signLord,
      starLord,
      subLord,
      longitude: norm,
      degree: lagna?.degree ?? (norm % 30),
      rashi,
      nakshatra: nakNumber
    };
  }

  private calculateMoonRP(data: MasterKundliData, planets: KPPlanetData[]): KPMoonRP {
    const moonKp = planets.find(p => p.planet === 'Moon');
    if (moonKp) {
      return {
        signLord: moonKp.rashiLord,
        starLord: moonKp.nakshatraLord,
        subLord: moonKp.subLord,
        longitude: moonKp.longitude,
        degree: moonKp.degree,
        rashi: moonKp.rashi,
        nakshatra: moonKp.nakshatra
      };
    }

    const moon = data.planets?.['Moon'];
    const long = moon?.siderealLongitude ?? 0;
    const norm = ((long % 360) + 360) % 360;
    const rashi = moon?.rashi || (Math.floor(norm / 30) + 1);
    const signLord = moon?.signLord || RASHI_LORDS[rashi] || 'Unknown';
    const nakNumber = moon?.nakshatra || (Math.floor(norm / (360 / 27)) + 1);
    const starLord = moon?.nakshatraLord || NAK_LORDS[(nakNumber - 1) % 9];
    const subLord = this.calculateSubLord(norm, starLord);

    return {
      signLord,
      starLord,
      subLord,
      longitude: norm,
      degree: moon?.degree ?? (norm % 30),
      rashi,
      nakshatra: nakNumber
    };
  }

  private calculateDayLord(data: MasterKundliData): KPDayLordRP {
    const DAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let dayIndex = 0;
    let dateString = data.birthProfile?.dob || '';
    const timeString = data.birthProfile?.time || '';

    if (data.birthProfile?.dob) {
      const dobStr = data.birthProfile.dob.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) {
        const [year, month, day] = dobStr.split('-').map(Number);
        const localDate = new Date(year, month - 1, day, 12, 0, 0);
        dayIndex = localDate.getDay();
      } else {
        const parsed = new Date(dobStr);
        if (!isNaN(parsed.getTime())) {
          dayIndex = parsed.getDay();
        }
      }
    } else if (data.metadata?.birthUtcTime) {
      try {
        const utcDate = new Date(data.metadata.birthUtcTime);
        if (!isNaN(utcDate.getTime())) {
          const tz = data.birthProfile?.timezone || data.metadata?.inputTimezone;
          if (tz) {
            const formatter = new Intl.DateTimeFormat('en-US', {
              timeZone: tz,
              weekday: 'long'
            });
            const weekdayStr = formatter.format(utcDate);
            const foundIdx = DAY_NAMES.findIndex(d => d.toLowerCase() === weekdayStr.toLowerCase());
            if (foundIdx !== -1) {
              dayIndex = foundIdx;
            }
          } else {
            dayIndex = utcDate.getUTCDay();
          }
          dateString = data.metadata.birthUtcTime.split('T')[0];
        }
      } catch {
        // Fallback default
      }
    }

    return {
      dayLord: DAY_LORDS[dayIndex],
      dayName: DAY_NAMES[dayIndex],
      dayIndex,
      dateString,
      timeString
    };
  }

  private calculateNodeRepresentations(
    data: MasterKundliData,
    planetData: KPPlanetData[],
    primaryRPs: string[]
  ): KPNodeRepresentation[] {
    const nodes: ('Rahu' | 'Ketu')[] = ['Rahu', 'Ketu'];
    const results: KPNodeRepresentation[] = [];

    for (const node of nodes) {
      const nodeKp = planetData.find(p => p.planet === node);
      const nodeRaw = data.planets?.[node];
      const rashi = nodeKp?.rashi ?? nodeRaw?.rashi ?? 1;
      const signLord = nodeKp?.rashiLord ?? RASHI_LORDS[rashi] ?? 'Unknown';
      const starLord = nodeKp?.nakshatraLord ?? 'Unknown';
      const subLord = nodeKp?.subLord;

      const conjoinedPlanets: string[] = [];
      for (const p of planetData) {
        if (p.planet !== node && p.rashi === rashi && !['Rahu', 'Ketu'].includes(p.planet)) {
          conjoinedPlanets.push(p.planet);
        }
      }

      const representedPlanets = Array.from(new Set([signLord, ...conjoinedPlanets])).filter(p => p && p !== 'Unknown');
      const representsRulingPlanet = representedPlanets.some(p => primaryRPs.includes(p)) || primaryRPs.includes(starLord);

      results.push({
        node,
        signLord,
        starLord,
        subLord,
        conjoinedPlanets,
        representsRulingPlanet,
        representedPlanets
      });
    }

    return results;
  }
}
