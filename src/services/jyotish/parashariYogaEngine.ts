import { MasterKundliData } from '../../types/kundli';
import { YogaResult, YogaCondition } from '../../types/yoga';

const RASHI_LORDS: Record<number, string> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 
  5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars', 
  9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DHANA = [2, 5, 9, 11];

const DIGNITY = {
  'Sun': { own: [5], exalt: 1 },
  'Moon': { own: [4], exalt: 2 },
  'Mars': { own: [1, 8], exalt: 10 },
  'Mercury': { own: [3, 6], exalt: 6 },
  'Jupiter': { own: [9, 12], exalt: 4 },
  'Venus': { own: [2, 7], exalt: 12 },
  'Saturn': { own: [10, 11], exalt: 7 }
};

export class ParashariYogaEngine {
  static evaluate(data: MasterKundliData): YogaResult[] {
    const yogas: YogaResult[] = [];
    yogas.push(...this.checkMahaPurusha(data));
    yogas.push(this.checkGajaKesari(data));
    yogas.push(...this.checkRajaYogas(data));
    yogas.push(...this.checkDhanaYogas(data));
    yogas.push(...this.checkVipreetRajYogas(data));
    yogas.push(...this.checkNeechaBhanga(data));
    return yogas;
  }

  private static checkMahaPurusha(data: MasterKundliData): YogaResult[] {
    const results: YogaResult[] = [];
    const mpConfigs = [
      { p: 'Mars', name: 'Ruchaka Yoga', id: 'YOGA_MP_RUCHAKA' },
      { p: 'Mercury', name: 'Bhadra Yoga', id: 'YOGA_MP_BHADRA' },
      { p: 'Jupiter', name: 'Hamsa Yoga', id: 'YOGA_MP_HAMSA' },
      { p: 'Venus', name: 'Malavya Yoga', id: 'YOGA_MP_MALAVYA' },
      { p: 'Saturn', name: 'Shasha Yoga', id: 'YOGA_MP_SHASHA' }
    ];

    for (const cfg of mpConfigs) {
      const planet = data.planets[cfg.p];
      if (!planet || planet.d1House == null || planet.rashi == null) continue;

      const rules = DIGNITY[cfg.p as keyof typeof DIGNITY];
      if (!rules) continue;
      
      const isKendra = KENDRA.includes(planet.d1House);
      const isOwn = rules.own.includes(planet.rashi);
      const isExalted = planet.rashi === rules.exalt;

      const conditions: YogaCondition[] = [
        { name: `Planet ${cfg.p} must be in Kendra (1, 4, 7, 10)`, passed: isKendra },
        { name: `Planet ${cfg.p} must be in Own Sign or Exalted`, passed: (isOwn || isExalted) }
      ];

      const passedAll = conditions.every(c => c.passed);

      results.push({
        id: cfg.id,
        name: cfg.name,
        system: 'Parashari',
        status: passedAll ? 'VERIFIED' : 'NOT_VERIFIED',
        planets: [cfg.p],
        houses: [planet.d1House],
        conditions,
        ruleId: cfg.id,
        explanationKey: 'MAHA_PURUSHA_EXPL'
      });
    }
    return results;
  }

  private static checkGajaKesari(data: MasterKundliData): YogaResult {
    const moon = data.planets['Moon'];
    const jup = data.planets['Jupiter'];
    
    let passed = false;
    let conditions: YogaCondition[] = [];
    
    if (moon?.d1House != null && jup?.d1House != null) {
      const relHouse = ((jup.d1House - moon.d1House + 12) % 12) + 1;
      const isKendra = KENDRA.includes(relHouse);
      passed = isKendra;
      conditions = [
        { name: `Moon and Jupiter must be present in chart`, passed: true },
        { name: `Jupiter (H\${jup.d1House}) must be in Kendra (1,4,7,10) from Moon (H\${moon.d1House}). Relative house is \${relHouse}.`, passed: isKendra }
      ];
    } else {
      conditions = [{ name: 'Moon and Jupiter positions available', passed: false }];
    }

    return {
      id: 'YOGA_GAJA_KESARI',
      name: 'Gaja Kesari Yoga',
      system: 'Parashari',
      status: passed ? 'VERIFIED' : 'NOT_VERIFIED',
      planets: ['Moon', 'Jupiter'],
      houses: [moon?.d1House || 0, jup?.d1House || 0],
      conditions,
      ruleId: 'YOGA_GAJA_KESARI',
      explanationKey: 'GAJA_KESARI_EXPL'
    };
  }

  private static getAspects(planetName: string, house: number): number[] {
    const aspects = [7]; // standard 7th for all
    if (planetName === 'Mars') return [4, 7, 8];
    if (planetName === 'Jupiter') return [5, 7, 9];
    if (planetName === 'Saturn') return [3, 7, 10];
    if (planetName === 'Rahu' || planetName === 'Ketu') return [5, 7, 9];
    return aspects;
  }

  private static getTargetHouses(planetName: string, currentHouse: number): number[] {
    const types = this.getAspects(planetName, currentHouse);
    return types.map(aspect => ((currentHouse + aspect - 2) % 12) + 1);
  }

  private static evaluateRelationship(p1: any, p2: any): string | null {
    if (p1.name === p2.name) return null;
    if (p1.d1House == null || p2.d1House == null) return null;

    // 1. Conjunction
    if (p1.d1House === p2.d1House) return 'Conjunction';

    // 2. Exchange (Parivartana)
    const p1SignLord = RASHI_LORDS[p1.rashi];
    const p2SignLord = RASHI_LORDS[p2.rashi];
    if (p1SignLord === p2.name && p2SignLord === p1.name) return 'Exchange (Parivartana)';

    // 3. Mutual Aspect
    const p1Aspects = this.getTargetHouses(p1.name, p1.d1House);
    const p2Aspects = this.getTargetHouses(p2.name, p2.d1House);
    if (p1Aspects.includes(p2.d1House) && p2Aspects.includes(p1.d1House)) return 'Mutual Aspect';

    return null;
  }

  private static getLordOfHouse(house: number, data: MasterKundliData): string | null {
    const hData = data.d1Chart[house];
    if (!hData) return null;
    return RASHI_LORDS[hData.rashi];
  }

  private static checkRajaYogas(data: MasterKundliData): YogaResult[] {
    const results: YogaResult[] = [];
    let count = 1;

    for (const kHouse of KENDRA) {
      for (const tHouse of TRIKONA) {
        if (kHouse === tHouse) continue; // Same house doesn't create Raja Yoga purely by itself in this simplified framework

        const kLord = this.getLordOfHouse(kHouse, data);
        const tLord = this.getLordOfHouse(tHouse, data);

        if (!kLord || !tLord || kLord === tLord) continue;

        const pK = data.planets[kLord];
        const pT = data.planets[tLord];
        if (!pK || !pT) continue;

        const rel = this.evaluateRelationship(pK, pT);
        if (rel) {
          results.push({
            id: `YOGA_RAJA_${count}`,
            name: `Raja Yoga (Kendra H${kHouse} & Trikona H${tHouse})`,
            system: 'Parashari',
            status: 'VERIFIED',
            planets: [pK.name, pT.name],
            houses: [pK.d1House, pT.d1House],
            conditions: [
              { name: `Identified Kendra House ${kHouse} Lord: ${pK.name}`, passed: true },
              { name: `Identified Trikona House ${tHouse} Lord: ${pT.name}`, passed: true },
              { name: `Relationship established: ${rel}`, passed: true }
            ],
            ruleId: `YOGA_RAJA_K${kHouse}_T${tHouse}`,
            explanationKey: 'RAJA_YOGA_EXPL'
          });
          count++;
        }
      }
    }
    return results;
  }

  private static checkDhanaYogas(data: MasterKundliData): YogaResult[] {
    const results: YogaResult[] = [];
    let count = 1;

    for (let i = 0; i < DHANA.length; i++) {
      for (let j = i + 1; j < DHANA.length; j++) {
        const h1 = DHANA[i];
        const h2 = DHANA[j];
        
        const l1 = this.getLordOfHouse(h1, data);
        const l2 = this.getLordOfHouse(h2, data);

        if (!l1 || !l2 || l1 === l2) continue;

        const p1 = data.planets[l1];
        const p2 = data.planets[l2];
        if (!p1 || !p2) continue;

        const rel = this.evaluateRelationship(p1, p2);
        if (rel) {
          results.push({
            id: `YOGA_DHANA_${count}`,
            name: `Dhana Yoga (Wealth Houses H${h1} & H${h2})`,
            system: 'Parashari',
            status: 'VERIFIED',
            planets: [p1.name, p2.name],
            houses: [p1.d1House, p2.d1House],
            conditions: [
              { name: `Identified Wealth House ${h1} Lord: ${p1.name}`, passed: true },
              { name: `Identified Wealth House ${h2} Lord: ${p2.name}`, passed: true },
              { name: `Relationship established: ${rel}`, passed: true }
            ],
            ruleId: `YOGA_DHANA_H${h1}_H${h2}`,
            explanationKey: 'DHANA_YOGA_EXPL'
          });
          count++;
        }
      }
    }
    return results;
  }

  private static checkVipreetRajYogas(data: MasterKundliData): YogaResult[] {
    const results: YogaResult[] = [];
    const dusthanas = [6, 8, 12];
    
    const yogaNames: Record<number, string> = {
      6: 'Harsha Yoga (Vipreet Raj)',
      8: 'Sarala Yoga (Vipreet Raj)',
      12: 'Vimala Yoga (Vipreet Raj)'
    };

    for (const h of dusthanas) {
      const lordName = this.getLordOfHouse(h, data);
      if (!lordName) continue;
      const lord = data.planets[lordName];
      if (!lord || lord.d1House == null) continue;

      const isDusthana = dusthanas.includes(lord.d1House);
      
      results.push({
        id: `YOGA_VIPREET_${h}`,
        name: yogaNames[h],
        system: 'Parashari',
        status: isDusthana ? 'VERIFIED' : 'NOT_VERIFIED',
        planets: [lordName],
        houses: [lord.d1House],
        conditions: [
          { name: `Lord of Dusthana House ${h} is ${lordName}`, passed: true },
          { name: `${lordName} must be placed in a Dusthana (6, 8, or 12). Current House: ${lord.d1House}`, passed: isDusthana }
        ],
        ruleId: `YOGA_VIPREET_H${h}`,
        explanationKey: 'VIPREET_RAJ_EXPL'
      });
    }

    return results;
  }

  private static checkNeechaBhanga(data: MasterKundliData): YogaResult[] {
    const results: YogaResult[] = [];
    
    const DEBILITATION: Record<string, number> = {
      'Sun': 7, 'Moon': 8, 'Mars': 4, 'Mercury': 12, 'Jupiter': 10, 'Venus': 6, 'Saturn': 1
    };

    const EXALTATION: Record<string, number> = {
      'Sun': 1, 'Moon': 2, 'Mars': 10, 'Mercury': 6, 'Jupiter': 4, 'Venus': 12, 'Saturn': 7
    };

    const moon = data.planets['Moon'];

    for (const pName of Object.keys(DEBILITATION)) {
      const planet = data.planets[pName];
      if (!planet || planet.rashi == null || planet.d1House == null) continue;

      const isDebilitated = planet.rashi === DEBILITATION[pName];
      if (!isDebilitated) continue; // Only check Neecha Bhanga for debilitated planets

      const debilSignLordName = RASHI_LORDS[DEBILITATION[pName]];
      const exaltSignLordName = RASHI_LORDS[EXALTATION[pName]];

      const dLord = data.planets[debilSignLordName];
      const eLord = data.planets[exaltSignLordName];

      const conditions: YogaCondition[] = [];
      let cancelled = false;

      conditions.push({ name: `${pName} is debilitated in sign ${planet.rashi}`, passed: true });

      // Condition 1: Debilitation lord in Kendra from Lagna
      if (dLord && dLord.d1House != null) {
        const pass = KENDRA.includes(dLord.d1House);
        conditions.push({ name: `Debilitation Sign Lord (${debilSignLordName}) in Kendra from Lagna`, passed: pass });
        if (pass) cancelled = true;
      }

      // Condition 2: Exaltation lord in Kendra from Lagna
      if (eLord && eLord.d1House != null) {
        const pass = KENDRA.includes(eLord.d1House);
        conditions.push({ name: `Exaltation Sign Lord (${exaltSignLordName}) in Kendra from Lagna`, passed: pass });
        if (pass) cancelled = true;
      }

      // Condition 3 & 4: From Moon
      if (moon && moon.d1House != null) {
        if (dLord && dLord.d1House != null) {
          const relMoonD = ((dLord.d1House - moon.d1House + 12) % 12) + 1;
          const pass = KENDRA.includes(relMoonD);
          conditions.push({ name: `Debilitation Sign Lord (${debilSignLordName}) in Kendra from Moon`, passed: pass });
          if (pass) cancelled = true;
        }
        if (eLord && eLord.d1House != null) {
          const relMoonE = ((eLord.d1House - moon.d1House + 12) % 12) + 1;
          const pass = KENDRA.includes(relMoonE);
          conditions.push({ name: `Exaltation Sign Lord (${exaltSignLordName}) in Kendra from Moon`, passed: pass });
          if (pass) cancelled = true;
        }
      }

      results.push({
        id: `YOGA_NEECHA_BHANGA_${pName}`,
        name: `Neecha Bhanga Raj Yoga (${pName})`,
        system: 'Parashari',
        status: cancelled ? 'VERIFIED' : 'NOT_VERIFIED',
        planets: [pName],
        houses: [planet.d1House],
        conditions,
        ruleId: `YOGA_NEECHA_BHANGA_${pName}`,
        explanationKey: 'NEECHA_BHANGA_EXPL'
      });
    }

    return results;
  }
}
