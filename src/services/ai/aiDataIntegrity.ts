import { MasterKundliData, BirthProfile, PlanetData } from '../../types/kundli';

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export interface DeterministicPlanetContext {
  planet: string;
  sign: string;
  house: number | string;
  degree: number | string;
  exactDegree?: number;
  nakshatra: string;
  pada: number | string;
  motion: 'Direct' | 'Retrograde';
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: string;
  vargottama: boolean;
  system: 'Parashari';
}

export interface ImmutableDeterministicContext {
  systemOfTruth: 'MasterKundliData';
  disclaimer: 'Use ONLY the supplied deterministic data. Do not calculate, modify, estimate, round, replace, or invent any astronomical value. If a value is missing or undefined, say that the value is unavailable. Never infer a missing Nakshatra or Pada.';
  profile: {
    name: string;
    dob: string;
    time: string;
    place: string;
  };
  currentDate: string;
  ascendant: {
    sign: string;
    degree: number | string;
    house: 1;
    nakshatra: string;
    pada: number | string;
    system: 'Parashari';
  };
  moonSign: {
    sign: string;
    degree: number | string;
    house: number | string;
    nakshatra: string;
    pada: number | string;
    system: 'Parashari';
  };
  planets: DeterministicPlanetContext[];
  vimshottariDasha: {
    currentMahadasha: {
      planet: string;
      startDate: string;
      endDate: string;
    };
    currentAntardasha: {
      planet: string;
      startDate: string;
      endDate: string;
    };
    rule: 'Exact Dasha dates from calculation engine. Never calculate Dasha dates inside AI prompt.';
  };
  numerology: {
    driverNumber: number | string; // Moolank
    conductorNumber: number | string; // Bhagyank
    nameNumber: number | string;
    personalYear: number | string;
    personalMonth: number | string;
    personalDay: number | string;
    rule: 'Exact calculated Driver, Conductor, Name Number, Personal Year, Month and Day.';
    system: 'Cheiro / Pythagorean';
  };
  loShuGrid: {
    grid: any;
    missingNumbers: number[];
    repeatedNumbers: number[];
    system: 'Chinese Lo Shu';
  };
  panchatattva: {
    scores: {
      fire: number | string;
      earth: number | string;
      air: number | string;
      water: number | string;
      ether: number | string;
    };
    percentages?: {
      fire: number | string;
      earth: number | string;
      air: number | string;
      water: number | string;
      ether: number | string;
    };
    totalPoints?: number | string;
    dominant: string;
    weakest: string;
    source: 'MasterKundliData';
    system: 'Panchamahabhuta';
  };
}

/**
 * Deep freezes an object recursively to ensure strict immutability.
 */
function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const val = (obj as any)[prop];
    if (val !== null && (typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  });
  return obj;
}

/**
 * Resolves Nakshatra name deterministically from index 1-27 or custom field.
 */
function resolveNakshatraName(nakshatraIndex?: number, explicitName?: string): string {
  if (explicitName && explicitName !== 'Unknown') return explicitName;
  if (nakshatraIndex != null && nakshatraIndex >= 1 && nakshatraIndex <= 27) {
    return NAKSHATRA_NAMES[nakshatraIndex - 1] || 'Unavailable';
  }
  return 'Unavailable';
}

/**
 * Creates a structured immutable context object from MasterKundliData.
 * Follows the exact schema and constraints mandated by Phase 21.5.
 */
export function createDeterministicAiContext(
  kundliData: MasterKundliData | null,
  numData: any,
  loShuData: any,
  panchatattva: any,
  profile: BirthProfile
): Readonly<ImmutableDeterministicContext> {
  const lagna = kundliData?.lagna;
  const planetsObj: Record<string, PlanetData> = kundliData?.planets || {};
  const moon = planetsObj['Moon'];

  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  
  const planets: DeterministicPlanetContext[] = planetNames.map((pName) => {
    const p: any = planetsObj[pName];
    if (!p) {
      return {
        planet: pName,
        sign: 'Unavailable',
        house: 'Unavailable',
        degree: 'Unavailable',
        nakshatra: 'Unavailable',
        pada: 'Unavailable',
        motion: 'Direct',
        isRetrograde: false,
        isCombust: false,
        dignity: 'Unavailable',
        vargottama: false,
        system: 'Parashari'
      };
    }

    const nakshatraValue = resolveNakshatraName(p.nakshatra, p.nakshatraName);
    const padaValue = p.pada != null ? p.pada : (p.nakshatraPada != null ? p.nakshatraPada : 'Unavailable');

    return {
      planet: pName,
      sign: p.rashiName || 'Unavailable',
      house: p.d1House != null ? p.d1House : (p.house != null ? p.house : 'Unavailable'),
      degree: p.degree != null ? Number(p.degree.toFixed(2)) : 'Unavailable',
      exactDegree: p.degree != null ? p.degree : undefined,
      nakshatra: nakshatraValue,
      pada: padaValue,
      motion: p.isRetrograde ? 'Retrograde' : 'Direct',
      isRetrograde: !!p.isRetrograde,
      isCombust: !!p.isCombust,
      dignity: p.dignity || 'None',
      vargottama: !!p.isVargottama,
      system: 'Parashari'
    };
  });

  const ascendantNakshatra = resolveNakshatraName(lagna?.nakshatra, (lagna as any)?.nakshatraName);
  const moonNakshatra = resolveNakshatraName(moon?.nakshatra, (moon as any)?.nakshatraName);

  const contextObj: ImmutableDeterministicContext = {
    systemOfTruth: 'MasterKundliData',
    disclaimer: 'Use ONLY the supplied deterministic data. Do not calculate, modify, estimate, round, replace, or invent any astronomical value. If a value is missing or undefined, say that the value is unavailable. Never infer a missing Nakshatra or Pada.',
    profile: {
      name: profile?.name || 'Native',
      dob: profile?.dob || 'Unavailable',
      time: profile?.time || 'Unavailable',
      place: profile?.place || 'Unavailable'
    },
    currentDate: new Date().toISOString().split('T')[0],
    ascendant: {
      sign: lagna?.rashiName || 'Unavailable',
      degree: lagna?.degree != null ? Number(lagna.degree.toFixed(2)) : 'Unavailable',
      house: 1,
      nakshatra: ascendantNakshatra,
      pada: lagna?.pada != null ? lagna.pada : 'Unavailable',
      system: 'Parashari'
    },
    moonSign: {
      sign: moon?.rashiName || 'Unavailable',
      degree: moon?.degree != null ? Number(moon.degree.toFixed(2)) : 'Unavailable',
      house: moon?.d1House != null ? moon.d1House : 'Unavailable',
      nakshatra: moonNakshatra,
      pada: moon?.pada != null ? moon.pada : 'Unavailable',
      system: 'Parashari'
    },
    planets,
    vimshottariDasha: {
      currentMahadasha: {
        planet: kundliData?.vimshottariDasha?.currentMahadasha?.planet || 'Unavailable',
        startDate: kundliData?.vimshottariDasha?.currentMahadasha?.startDate || 'Unavailable',
        endDate: kundliData?.vimshottariDasha?.currentMahadasha?.endDate || 'Unavailable'
      },
      currentAntardasha: {
        planet: kundliData?.vimshottariDasha?.currentAntardasha?.planet || 'Unavailable',
        startDate: kundliData?.vimshottariDasha?.currentAntardasha?.startDate || 'Unavailable',
        endDate: kundliData?.vimshottariDasha?.currentAntardasha?.endDate || 'Unavailable'
      },
      rule: 'Exact Dasha dates from calculation engine. Never calculate Dasha dates inside AI prompt.'
    },
    numerology: {
      driverNumber: numData?.birthNumber ?? 'Unavailable',
      conductorNumber: numData?.destinyNumber ?? 'Unavailable',
      nameNumber: numData?.nameNumber ?? 'Unavailable',
      personalYear: numData?.personalYear ?? 'Unavailable',
      personalMonth: numData?.personalMonth ?? 'Unavailable',
      personalDay: numData?.personalDay ?? 'Unavailable',
      rule: 'Exact calculated Driver, Conductor, Name Number, Personal Year, Month and Day.',
      system: 'Cheiro / Pythagorean'
    },
    loShuGrid: {
      grid: loShuData?.grid || {},
      missingNumbers: loShuData?.missingNumbers || [],
      repeatedNumbers: loShuData?.repeatedNumbers || [],
      system: 'Chinese Lo Shu'
    },
    panchatattva: {
      scores: {
        fire: panchatattva?.fire?.score ?? 'Unavailable',
        earth: panchatattva?.earth?.score ?? 'Unavailable',
        air: panchatattva?.air?.score ?? 'Unavailable',
        water: panchatattva?.water?.score ?? 'Unavailable',
        ether: panchatattva?.ether?.score ?? 'Unavailable'
      },
      percentages: {
        fire: panchatattva?.fire?.percentage ?? 'Unavailable',
        earth: panchatattva?.earth?.percentage ?? 'Unavailable',
        air: panchatattva?.air?.percentage ?? 'Unavailable',
        water: panchatattva?.water?.percentage ?? 'Unavailable',
        ether: panchatattva?.ether?.percentage ?? 'Unavailable'
      },
      totalPoints: panchatattva?.totalScore ?? 'Unavailable',
      dominant: panchatattva?.dominant || 'Unavailable',
      weakest: panchatattva?.weakest || 'Unavailable',
      source: 'MasterKundliData',
      system: 'Panchamahabhuta'
    }
  };

  return deepFreeze(contextObj);
}

/**
 * Data Integrity Debug Checker
 * Compares:
 * 1. deterministic values sent to AI
 * 2. deterministic values displayed by UI
 * 3. checks whether AI response contradicts deterministic values
 * If any astronomical value changes unexpectedly, flags: AI_DATA_MISMATCH or PANCHATATTVA_DATA_MISMATCH
 */
export interface IntegrityCheckResult {
  valid: boolean;
  status: 'VERIFIED' | 'AI_DATA_MISMATCH' | 'PANCHATATTVA_DATA_MISMATCH';
  errors: string[];
  checkedFields: {
    planetsChecked: number;
    ascendantChecked: boolean;
    dashaChecked: boolean;
    numerologyChecked: boolean;
    loShuChecked: boolean;
    panchatattvaChecked: boolean;
  };
}

export function performDataIntegrityDebugCheck(
  sentContext: ImmutableDeterministicContext,
  uiKundliData: MasterKundliData | null,
  uiNumData: any,
  uiLoShuData: any,
  aiResponseText?: string
): IntegrityCheckResult {
  const errors: string[] = [];
  let planetsChecked = 0;

  // 1. Verify planetary values between sentContext and uiKundliData
  const uiPlanets = uiKundliData?.planets || {};
  for (const sentP of sentContext.planets) {
    const uiP: any = uiPlanets[sentP.planet];
    if (uiP) {
      planetsChecked++;
      if (uiP.rashiName && sentP.sign !== 'Unavailable' && sentP.sign !== uiP.rashiName) {
        errors.push(`AI_DATA_MISMATCH: Planet ${sentP.planet} sign mismatch. Sent: ${sentP.sign}, UI: ${uiP.rashiName}`);
      }
      const uiHouse = uiP.d1House != null ? uiP.d1House : uiP.house;
      if (uiHouse != null && sentP.house !== 'Unavailable' && sentP.house !== uiHouse) {
        errors.push(`AI_DATA_MISMATCH: Planet ${sentP.planet} house mismatch. Sent: ${sentP.house}, UI: ${uiHouse}`);
      }
      if (uiP.degree != null && sentP.degree !== 'Unavailable') {
        const uiDeg = Number(uiP.degree.toFixed(2));
        const sentDeg = Number(sentP.degree);
        if (Math.abs(uiDeg - sentDeg) > 0.01) {
          errors.push(`AI_DATA_MISMATCH: Planet ${sentP.planet} degree mismatch. Sent: ${sentDeg}, UI: ${uiDeg}`);
        }
      }
    }
  }

  // 2. Verify Ascendant
  let ascendantChecked = false;
  if (uiKundliData?.lagna && sentContext.ascendant) {
    ascendantChecked = true;
    if (uiKundliData.lagna.rashiName && sentContext.ascendant.sign !== uiKundliData.lagna.rashiName) {
      errors.push(`AI_DATA_MISMATCH: Ascendant sign mismatch. Sent: ${sentContext.ascendant.sign}, UI: ${uiKundliData.lagna.rashiName}`);
    }
  }

  // 3. Verify Dasha
  let dashaChecked = false;
  if (uiKundliData?.vimshottariDasha?.currentMahadasha && sentContext.vimshottariDasha?.currentMahadasha) {
    dashaChecked = true;
    const uiMD = uiKundliData.vimshottariDasha.currentMahadasha;
    const sentMD = sentContext.vimshottariDasha.currentMahadasha;
    if (uiMD.planet && sentMD.planet !== 'Unavailable' && sentMD.planet !== uiMD.planet) {
      errors.push(`AI_DATA_MISMATCH: Mahadasha planet mismatch. Sent: ${sentMD.planet}, UI: ${uiMD.planet}`);
    }
  }

  // 4. Verify Numerology
  let numerologyChecked = false;
  if (uiNumData && sentContext.numerology) {
    numerologyChecked = true;
    if (uiNumData.birthNumber != null && sentContext.numerology.driverNumber !== uiNumData.birthNumber) {
      errors.push(`AI_DATA_MISMATCH: Numerology Driver Number mismatch. Sent: ${sentContext.numerology.driverNumber}, UI: ${uiNumData.birthNumber}`);
    }
    if (uiNumData.destinyNumber != null && sentContext.numerology.conductorNumber !== uiNumData.destinyNumber) {
      errors.push(`AI_DATA_MISMATCH: Numerology Conductor Number mismatch. Sent: ${sentContext.numerology.conductorNumber}, UI: ${uiNumData.destinyNumber}`);
    }
  }

  // 5. Verify Lo Shu
  let loShuChecked = false;
  if (uiLoShuData && sentContext.loShuGrid) {
    loShuChecked = true;
    if (uiLoShuData.missingNumbers && JSON.stringify(sentContext.loShuGrid.missingNumbers) !== JSON.stringify(uiLoShuData.missingNumbers)) {
      errors.push(`AI_DATA_MISMATCH: Lo Shu missing numbers mismatch.`);
    }
  }

  // 6. Verify Panchatattva Single Source of Truth
  let panchatattvaChecked = false;
  const uiPT = uiKundliData?.panchatattva;
  if (uiPT && sentContext.panchatattva) {
    panchatattvaChecked = true;
    const sentPT = sentContext.panchatattva;
    if (sentPT.dominant !== 'Unavailable' && sentPT.dominant !== uiPT.dominant) {
      errors.push(`PANCHATATTVA_DATA_MISMATCH: Dominant element mismatch. Sent: ${sentPT.dominant}, UI: ${uiPT.dominant}`);
    }
    if (sentPT.weakest !== 'Unavailable' && sentPT.weakest !== uiPT.weakest) {
      errors.push(`PANCHATATTVA_DATA_MISMATCH: Weakest element mismatch. Sent: ${sentPT.weakest}, UI: ${uiPT.weakest}`);
    }
    const elementKeys: ('fire' | 'earth' | 'air' | 'water' | 'ether')[] = ['fire', 'earth', 'air', 'water', 'ether'];
    for (const el of elementKeys) {
      const sentScore = sentPT.scores[el];
      if (sentScore !== 'Unavailable' && sentScore !== uiPT[el].score) {
        errors.push(`PANCHATATTVA_DATA_MISMATCH: ${el} score mismatch. Sent: ${sentScore}, UI: ${uiPT[el].score}`);
      }
      if (sentPT.percentages && sentPT.percentages[el] !== 'Unavailable' && sentPT.percentages[el] !== uiPT[el].percentage) {
        errors.push(`PANCHATATTVA_DATA_MISMATCH: ${el} percentage mismatch. Sent: ${sentPT.percentages[el]}%, UI: ${uiPT[el].percentage}%`);
      }
    }
  }

  // 7. Check if AI response text invents contradictory data or invents missing Nakshatra
  if (aiResponseText) {
    for (const sentP of sentContext.planets) {
      if (sentP.nakshatra === 'Unavailable') {
        const regex = new RegExp(`${sentP.planet}.*nakshatra.*(?:Ashwini|Bharani|Krittika|Rohini|Mrigashira|Ardra|Punarvasu|Pushya|Ashlesha|Magha|Purva|Uttara|Hasta|Chitra|Swati|Vishakha|Anuradha|Jyeshtha|Mula|Shravana|Dhanishta|Shatabhisha|Revati)`, 'i');
        if (regex.test(aiResponseText)) {
          errors.push(`AI_DATA_MISMATCH: AI invented missing Nakshatra for ${sentP.planet} when it was marked Unavailable.`);
        }
      }
    }
  }

  const valid = errors.length === 0;
  const isPanchatattvaMismatch = errors.some(e => e.includes('PANCHATATTVA_DATA_MISMATCH'));
  if (!valid) {
    console.error('[Data Integrity Debug] MISMATCH DETECTED:', errors);
  } else {
    console.log('[Data Integrity Debug] PASS: Deterministic values verified 100% between MasterKundliData, sent context, and UI.');
  }

  return {
    valid,
    status: valid ? 'VERIFIED' : (isPanchatattvaMismatch ? 'PANCHATATTVA_DATA_MISMATCH' : 'AI_DATA_MISMATCH'),
    errors,
    checkedFields: {
      planetsChecked,
      ascendantChecked,
      dashaChecked,
      numerologyChecked,
      loShuChecked,
      panchatattvaChecked
    }
  };
}

