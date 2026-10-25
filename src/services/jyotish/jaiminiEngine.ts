import { VargaEngine } from './vargaEngine';
import { MasterKundliData } from '../../types/kundli';
import { RuleEngine } from '../../types/systemRegistry';

export interface CharaKaraka {
  planet: string;
  karaka: string;
  longitudeInSign: number;
}

export interface JaiminiAspect {
  sourceSign: number;
  targetSign: number;
  sourcePlanets: string[];
  targetPlanets: string[];
  ruleId: string;
  system: 'JAIMINI';
}

export interface JaiminiAnalysisResult {
  status: 'AVAILABLE' | 'NOT_AVAILABLE';
  message?: string;
  charaKarakas: CharaKaraka[];
  rashiDrishti: JaiminiAspect[];
  arudhas: { name: string; house: number; sign: number }[];
  karakamshaSign: number | null;
}

const RASHI_DRISHTI_MAP: Record<number, number[]> = {
  1: [5, 8, 11], 2: [4, 7, 10], 3: [6, 9, 12],
  4: [8, 11, 2], 5: [7, 10, 1], 6: [9, 12, 3],
  7: [11, 2, 5], 8: [10, 1, 4], 9: [12, 3, 6],
  10: [2, 5, 8], 11: [1, 4, 7], 12: [3, 6, 9]
};

export class JaiminiEngine implements RuleEngine<JaiminiAnalysisResult> {
  evaluate(data: MasterKundliData): JaiminiAnalysisResult {
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const validPlanets = planets.filter(p => data.planets[p] && data.planets[p].degree != null);
    
    if (validPlanets.length !== 7) {
      return { status: 'NOT_AVAILABLE', message: 'NOT AVAILABLE IN CURRENT CALCULATION DATASET', charaKarakas: [], rashiDrishti: [], arudhas: [], karakamshaSign: null };
    }

    // 1. Chara Karakas
    const karakaNames = ['Atmakaraka (AK)', 'Amatyakaraka (AmK)', 'Bhratrikaraka (BK)', 'Matrikaraka (MK)', 'Putrakaraka (PiK)', 'Gnatikaraka (GK)', 'Darakaraka (DK)'];
    
    const pDegs = validPlanets.map(p => {
      const deg = data.planets[p].degree as number;
      // In Jaimini, longitude in sign is strictly deg % 30.
      const degInSign = deg % 30;
      return { planet: p, longitudeInSign: degInSign };
    });

    pDegs.sort((a, b) => b.longitudeInSign - a.longitudeInSign);

    const charaKarakas: CharaKaraka[] = pDegs.map((p, i) => ({
      planet: p.planet,
      karaka: karakaNames[i],
      longitudeInSign: p.longitudeInSign
    }));

    // 2. Rashi Drishti (Jaimini Aspects)
    const rashiDrishti: JaiminiAspect[] = [];
    const signToPlanets: Record<number, string[]> = { 1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[], 8:[], 9:[], 10:[], 11:[], 12:[] };
    
    const allPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    for (const p of allPlanets) {
      const pd = data.planets[p];
      if (pd && pd.rashi != null) {
        signToPlanets[pd.rashi].push(p);
      }
    }

    for (let i = 1; i <= 12; i++) {
      const targetSigns = RASHI_DRISHTI_MAP[i];
      if (!targetSigns) continue;
      
      for (const t of targetSigns) {
        rashiDrishti.push({
          sourceSign: i,
          targetSign: t,
          sourcePlanets: signToPlanets[i],
          targetPlanets: signToPlanets[t],
          ruleId: `JAIMINI_RASHI_DRISHTI_${i}_TO_${t}`,
          system: 'JAIMINI'
        });
      }
    }

    
    const RASHI_LORDS: Record<number, string> = {
      1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 
      5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars', 
      9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
    };
    
    function getArudha(houseNum: number): number | null {
      const hData = data.d1Chart[houseNum];
      if (!hData) return null;
      const sign = hData.rashi;
      const lordName = RASHI_LORDS[sign];
      const lordPlanet = data.planets[lordName];
      if (!lordPlanet || lordPlanet.d1House == null) return null;
      
      const lordHouse = lordPlanet.d1House;
      const distance = (lordHouse - houseNum + 12) % 12; 
      let arudhaHouse = (lordHouse + distance - 1) % 12 + 1;
      
      // Jaimini Arudha Exceptions
      if (arudhaHouse === houseNum) {
        arudhaHouse = (houseNum + 9) % 12 + 1; // 10th
      } else if (arudhaHouse === (houseNum + 6 - 1) % 12 + 1) { // 7th
        arudhaHouse = (houseNum + 3) % 12 + 1; // 4th
      }
      
      return arudhaHouse;
    }

    const arudhas = [];
    const alHouse = getArudha(1);
    if (alHouse !== null) {
       const sign = data.d1Chart[alHouse]?.rashi;
       if (sign) arudhas.push({ name: 'Arudha Lagna (AL)', house: alHouse, sign });
    }
    const ulHouse = getArudha(12);
    if (ulHouse !== null) {
       const sign = data.d1Chart[ulHouse]?.rashi;
       if (sign) arudhas.push({ name: 'Upapada Lagna (UL)', house: ulHouse, sign });
    }

    // Karakamsha (D9 sign of Atmakaraka)
    let karakamshaSign = null;
    const ak = charaKarakas.find(ck => ck.karaka === 'Atmakaraka (AK)');
    if (ak && data.planets[ak.planet] && data.planets[ak.planet].siderealLongitude != null) {
      karakamshaSign = VargaEngine.getD9Sign(data.planets[ak.planet].siderealLongitude as number);
    }

    return {
      status: 'AVAILABLE',
      charaKarakas,
      rashiDrishti,
      arudhas,
      karakamshaSign
    };
  }
}
