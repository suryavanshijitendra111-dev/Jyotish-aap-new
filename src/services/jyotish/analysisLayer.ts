import { ParashariYogaEngine } from './parashariYogaEngine';
import { MasterKundliData } from '../../types/kundli';
import { ChartAnalysisResult, PlanetAnalysisData, HouseAnalysisData, AspectAnalysis, ConjunctionAnalysis, AuditResult } from '../../types/analysis';

const RASHI_LORDS: Record<number, string> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 
  5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars', 
  9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

const NAKSHATRA_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];


// -----------------------------------------------------
// Relationship Data
// -----------------------------------------------------
const NATURAL_RELATIONSHIPS: Record<string, { friends: string[], enemies: string[], neutral: string[] }> = {
  'Sun': { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn', 'Rahu', 'Ketu'], neutral: ['Mercury'] },
  'Moon': { friends: ['Sun', 'Mercury'], enemies: ['Rahu', 'Ketu'], neutral: ['Mars', 'Jupiter', 'Venus', 'Saturn'] },
  'Mars': { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury', 'Rahu'], neutral: ['Venus', 'Saturn', 'Ketu'] },
  'Mercury': { friends: ['Sun', 'Venus'], enemies: ['Moon'], neutral: ['Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'] },
  'Jupiter': { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'], neutral: ['Saturn', 'Rahu', 'Ketu'] },
  'Venus': { friends: ['Mercury', 'Saturn', 'Rahu'], enemies: ['Sun', 'Moon'], neutral: ['Mars', 'Jupiter', 'Ketu'] },
  'Saturn': { friends: ['Mercury', 'Venus', 'Rahu'], enemies: ['Sun', 'Moon', 'Mars', 'Ketu'], neutral: ['Jupiter'] },
  'Rahu': { friends: ['Venus', 'Saturn'], enemies: ['Sun', 'Moon', 'Mars'], neutral: ['Mercury', 'Jupiter', 'Ketu'] },
  'Ketu': { friends: ['Mars', 'Venus'], enemies: ['Sun', 'Moon', 'Saturn'], neutral: ['Mercury', 'Jupiter', 'Rahu'] }
};

function getTemporaryRelationship(house1: number, house2: number): string {
  if (house1 === house2) return 'Enemy'; // Same house
  const diff = ((house2 - house1 + 12) % 12);
  // Diff 1 = 2nd house from house1, etc.
  // Friends are in 2, 3, 4, 10, 11, 12 from the planet
  // Enemies are in 1, 5, 6, 7, 8, 9 from the planet
  const friendOffsets = [1, 2, 3, 9, 10, 11]; // 0-indexed differences for 2, 3, 4, 10, 11, 12
  return friendOffsets.includes(diff) ? 'Friend' : 'Enemy';
}

function getCompoundRelationship(natural: string, temporary: string): string {
  if (natural === 'Friend' && temporary === 'Friend') return 'Great Friend';
  if (natural === 'Enemy' && temporary === 'Enemy') return 'Great Enemy';
  if ((natural === 'Friend' && temporary === 'Enemy') || (natural === 'Enemy' && temporary === 'Friend')) return 'Neutral';
  if (natural === 'Neutral') {
    return temporary === 'Friend' ? 'Friend' : 'Enemy';
  }
  return 'Neutral';
}

const DIGNITY_RULES: Record<string, { exalt: number, deb: number, moola: number[], own: number[] }> = {
  'Sun': { exalt: 1, deb: 7, moola: [5], own: [5] },
  'Moon': { exalt: 2, deb: 8, moola: [2], own: [4] },
  'Mars': { exalt: 10, deb: 4, moola: [1], own: [1, 8] },
  'Mercury': { exalt: 6, deb: 12, moola: [6], own: [3, 6] },
  'Jupiter': { exalt: 4, deb: 10, moola: [9], own: [9, 12] },
  'Venus': { exalt: 12, deb: 6, moola: [7], own: [2, 7] },
  'Saturn': { exalt: 7, deb: 1, moola: [11], own: [10, 11] },
  'Rahu': { exalt: 3, deb: 9, moola: [], own: [] },
  'Ketu': { exalt: 9, deb: 3, moola: [], own: [] }
};

export function analyzeChart(masterData: MasterKundliData): ChartAnalysisResult {
  const planets: Record<string, PlanetAnalysisData> = {};
  const houses: Record<number, HouseAnalysisData> = {};
  const aspects: AspectAnalysis[] = [];
  const conjunctions: ConjunctionAnalysis[] = [];

  const ENGINE_VERSION = "1.0.0";
  const MASTER_VERSION = masterData.metadata?.timestamp || "Unknown";

  const allPlanetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  // 1. Calculate Aspects (Configurable Parashari Aspect Engine)
  allPlanetNames.forEach(pName => {
    const pData = masterData.planets[pName];
    if (!pData || pData.d1House == null) return;
    
    const h = pData.d1House;
    
    const addAspect = (type: number, ruleId: string) => {
      const targetHouse = ((h + type - 2) % 12) + 1;
      const targetPlanets = allPlanetNames.filter(tp => masterData.planets[tp]?.d1House === targetHouse);
      aspects.push({
        sourcePlanet: pName,
        targetHouse,
        targetPlanets,
        aspectType: type,
        ruleId,
        system: "Parashari"
      });
    };

    // Standard 7th aspect for classical planets
    if (pName !== 'Rahu' && pName !== 'Ketu') {
       addAspect(7, `ASPECT_7TH_${pName.toUpperCase()}`);
    }

    // Special aspects
    if (pName === 'Mars') {
      addAspect(4, 'ASPECT_MARS_4TH');
      addAspect(8, 'ASPECT_MARS_8TH');
    } else if (pName === 'Jupiter') {
      addAspect(5, 'ASPECT_JUPITER_5TH');
      addAspect(9, 'ASPECT_JUPITER_9TH');
    } else if (pName === 'Saturn') {
      addAspect(3, 'ASPECT_SATURN_3RD');
      addAspect(10, 'ASPECT_SATURN_10TH');
    }
    
    // Rahu/Ketu typically have 5, 7, 9 aspects in many traditions
    if (pName === 'Rahu' || pName === 'Ketu') {
      addAspect(5, `ASPECT_${pName.toUpperCase()}_5TH`);
      addAspect(7, `ASPECT_${pName.toUpperCase()}_7TH`);
      addAspect(9, `ASPECT_${pName.toUpperCase()}_9TH`);
    }
  });

  // 2. Calculate Conjunctions
  for (let i = 0; i < allPlanetNames.length; i++) {
    for (let j = i + 1; j < allPlanetNames.length; j++) {
      const pA = masterData.planets[allPlanetNames[i]];
      const pB = masterData.planets[allPlanetNames[j]];
      
      if (pA && pB && pA.d1House != null && pB.d1House != null && pA.d1House === pB.d1House) {
        let degreeSeparation = 0;
        if (pA.siderealLongitude != null && pB.siderealLongitude != null) {
          degreeSeparation = Math.abs(pA.siderealLongitude - pB.siderealLongitude);
          if (degreeSeparation > 180) degreeSeparation = 360 - degreeSeparation;
        }
        conjunctions.push({
          planetA: pA.name,
          planetB: pB.name,
          house: pA.d1House,
          rashi: pA.rashi,
          degreeSeparation,
          ruleId: `CONJ_${pA.name.toUpperCase()}_${pB.name.toUpperCase()}`
        });
      }
    }
  }

  // 3. Populate Planet Analysis
  allPlanetNames.forEach(pName => {
    const pData = masterData.planets[pName];
    if (!pData) return;

    let d = null;
    let m = null;
    let s = null;
    if (pData.degree != null) {
       d = Math.floor(pData.degree);
       const minFloat = (pData.degree - d) * 60;
       m = Math.floor(minFloat);
       s = Math.round((minFloat - m) * 60);
    }
    
    const rashiLord = pData.rashi ? RASHI_LORDS[pData.rashi] : 'Unknown';
    const nakLord = pData.nakshatra ? NAKSHATRA_LORDS[(pData.nakshatra - 1) % 9] : 'Unknown';
    const nakName = pData.nakshatra ? NAKSHATRA_NAMES[pData.nakshatra - 1] : 'Unknown';
    
    // Nakshatra calculations
    let nakStartDeg = null;
    let nakEndDeg = null;
    let nakProgress = null;
    if (pData.nakshatra && pData.siderealLongitude != null) {
      nakStartDeg = (pData.nakshatra - 1) * (360 / 27);
      nakEndDeg = pData.nakshatra * (360 / 27);
      const passed = pData.siderealLongitude - nakStartDeg;
      nakProgress = (passed / (360 / 27)) * 100;
    }

    const ownSign = rashiLord === pName;
    
    // Detailed Dignity
    let dignityStr = pData.dignity || 'Unknown';
    let exalted = false;
    let debilitated = false;
    let vargottama = false;
    
    const rules = DIGNITY_RULES[pName];
    if (rules && pData.rashi != null) {
      if (pData.rashi === rules.exalt) { dignityStr = 'Exalted'; exalted = true; }
      else if (pData.rashi === rules.deb) { dignityStr = 'Debilitated'; debilitated = true; }
      else if (rules.moola.includes(pData.rashi)) { dignityStr = 'Moolatrikona'; }
      else if (rules.own.includes(pData.rashi)) { dignityStr = 'Own Sign'; }
      else {
        // Evaluate friend/enemy/neutral sign based on Rashi Lord natural relationship
        const naturalRel = NATURAL_RELATIONSHIPS[pName];
        if (naturalRel) {
          if (naturalRel.friends.includes(rashiLord)) dignityStr = 'Friendly Sign';
          else if (naturalRel.enemies.includes(rashiLord)) dignityStr = 'Enemy Sign';
          else if (naturalRel.neutral.includes(rashiLord)) dignityStr = 'Neutral Sign';
        }
      }
    }

    // Relationships
    const natRels: any[] = [];
    const tempRels: any[] = [];
    const compRels: any[] = [];
    
    allPlanetNames.forEach(otherPlanet => {
      if (otherPlanet === pName) return;
      const otherData = masterData.planets[otherPlanet];
      if (!otherData || pData.d1House == null || otherData.d1House == null) return;
      
      const natGroup = NATURAL_RELATIONSHIPS[pName];
      let nat = 'Neutral';
      if (natGroup) {
        if (natGroup.friends.includes(otherPlanet)) nat = 'Friend';
        if (natGroup.enemies.includes(otherPlanet)) nat = 'Enemy';
      }
      
      const temp = getTemporaryRelationship(pData.d1House, otherData.d1House);
      const comp = getCompoundRelationship(nat, temp);
      
      natRels.push({ planet: otherPlanet, status: nat });
      tempRels.push({ planet: otherPlanet, status: temp });
      compRels.push({ planet: otherPlanet, status: comp });
    });

    const pAspectsGiven = aspects.filter(a => a.sourcePlanet === pName);
    const pAspectsReceived = aspects.filter(a => a.targetPlanets.includes(pName));
    const pConjs = conjunctions.filter(c => c.planetA === pName || c.planetB === pName);

    const audit: AuditResult = {
      ruleId: `PLANET_ANALYSIS_${pName.toUpperCase()}`,
      system: 'JyotishCore',
      input: `MasterKundliData.planets.${pName}`,
      conditions: [
        { name: 'Data Extracted', passed: true },
        { name: 'Rashi Lord Bound', passed: rashiLord !== 'Unknown' },
        { name: 'Nakshatra Lord Bound', passed: nakLord !== 'Unknown' }
      ],
      result: 'Analyzed',
      engineVersion: ENGINE_VERSION,
      masterDataVersion: MASTER_VERSION,
      isVerified: true
    };

    planets[pName] = {
      planet: pName,
      tropicalLongitude: pData.tropicalLongitude ?? null,
      siderealLongitude: pData.siderealLongitude ?? null,
      degree: pData.degree ?? null,
      minutes: m,
      seconds: s,
      rashi: pData.rashi ?? null,
      rashiName: pData.rashiName ?? null,
      rashiLord,
      house: pData.d1House ?? null,
      nakshatra: pData.nakshatra ?? null,
      nakshatraName: nakName,
      nakshatraLord: nakLord,
      nakshatraStartDeg: nakStartDeg,
      nakshatraEndDeg: nakEndDeg,
      nakshatraProgressPercent: nakProgress,
      pada: pData.pada ?? null,
      isRetrograde: pData.isRetrograde || false,
      isCombust: pData.isCombust || false,
      dignity: dignityStr,
      ownSign,
      exalted,
      debilitated,
      vargottama,
      conjunctions: pConjs,
      aspectsGiven: pAspectsGiven,
      aspectsReceived: pAspectsReceived,
      naturalRelationships: natRels,
      temporaryRelationships: tempRels,
      compoundRelationships: compRels,
      currentMahadasha: masterData.vimshottariDasha?.currentMahadasha?.planet || null,
      currentAntardasha: masterData.vimshottariDasha?.currentAntardasha?.planet || null,
      calculationSource: pData.calculationSource || 'Unknown',
      audit
    };
  });

  // 4. Populate House Analysis
  for (let i = 1; i <= 12; i++) {
    const hData = masterData.d1Chart?.[i];
    if (!hData) continue;
    
    const rashiLord = RASHI_LORDS[hData.rashi] || 'Unknown';
    const hAspectsReceived = aspects.filter(a => a.targetHouse === i);
    
    const audit: AuditResult = {
      ruleId: `HOUSE_ANALYSIS_${i}`,
      system: 'JyotishCore',
      input: `MasterKundliData.d1Chart[${i}]`,
      conditions: [
        { name: 'House Data Valid', passed: true },
        { name: 'Sign Lord Bound', passed: rashiLord !== 'Unknown' }
      ],
      result: 'Analyzed',
      engineVersion: ENGINE_VERSION,
      masterDataVersion: MASTER_VERSION,
      isVerified: true
    };

    houses[i] = {
      houseNumber: i,
      rashi: hData.rashi,
      rashiName: hData.rashiName,
      rashiLord,
      occupyingPlanets: hData.planetsOccupying || [],
      aspectsReceived: hAspectsReceived,
      calculatedMarkers: [], // e.g. Lagna
      audit
    };
    
    if (masterData.lagna?.d1House === i) {
       houses[i].calculatedMarkers.push('Lagna');
    }
  }

  const yogas = ParashariYogaEngine.evaluate(masterData);

  return {
    planets,
    houses,
    aspects,
    conjunctions,
    yogas
  };
}
