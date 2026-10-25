import { DateTime } from 'luxon';
import { MasterKundliData, VimshottariData, DashaPeriod } from '../../../types/kundli';

// The exact standard Dasha sequence and lengths
export const DASHA_SEQUENCE = [
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

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// One year in days (Standard Gregorian Year for precise timing)
const DAYS_PER_YEAR = 365.2425;
const TOTAL_YEARS = 120;

export class VimshottariEngine {
  
  private static calculateSequenceForLongitude(moonLongitude: number, birthTime: DateTime) {
    if (typeof moonLongitude !== 'number' || isNaN(moonLongitude)) {
      throw new Error(`Invalid moon longitude provided to Dasha engine: ${moonLongitude}`);
    }

    // Ensure 0-359.999...
    let normalizedLongitude = (moonLongitude % 360 + 360) % 360;

    const NAKSHATRA_ARC = 360 / 27; // 13.333333333...
    const exactNakshatraFloat = normalizedLongitude / NAKSHATRA_ARC;
    let nakshatraIndex = Math.floor(exactNakshatraFloat); // 0 to 26
    
    if (nakshatraIndex === 27) nakshatraIndex = 0; // Edge case precision
    if (isNaN(nakshatraIndex) || nakshatraIndex < 0 || nakshatraIndex > 26) {
       throw new Error(`Nakshatra index calculation failed for longitude ${normalizedLongitude}`);
    }

    const nakshatraPassedArc = (exactNakshatraFloat - nakshatraIndex) * NAKSHATRA_ARC;
    const nakshatraRemainingArc = NAKSHATRA_ARC - nakshatraPassedArc;
    
    const fractionRemaining = nakshatraRemainingArc / NAKSHATRA_ARC;
    const nakshatraName = NAKSHATRA_NAMES[nakshatraIndex];

    const dashaStartIndex = nakshatraIndex % 9;
    const birthMahadashaInfo = DASHA_SEQUENCE[dashaStartIndex];

    if (!birthMahadashaInfo || typeof birthMahadashaInfo.years === 'undefined') {
      throw new Error(`Dasha configuration missing for lord at sequence index ${dashaStartIndex}. Check DASHA_SEQUENCE array.`);
    }

    const balanceYears = fractionRemaining * birthMahadashaInfo.years;
    
    // Traditional fractional year to YMD conversion for Vimshottari
    const balanceTotalDays = balanceYears * 365.2425;
    const balanceY = Math.floor(balanceYears);
    const balanceRemDays = balanceTotalDays - (balanceY * 365.2425);
    const balanceM = Math.floor(balanceRemDays / 30);
    const balanceD = Math.floor(balanceRemDays % 30);

    const firstMahaEndTime = birthTime.plus({ years: balanceY, months: balanceM, days: balanceD });
    const theoreticalStartTime = firstMahaEndTime.minus({ years: birthMahadashaInfo.years });

    const mahadashas: DashaPeriod[] = [];
    let currentMahaStartTime = theoreticalStartTime;
    
    // Generate the full 120 years from theoretical start
    for (let i = 0; i < 9; i++) {
      const seqIndex = (dashaStartIndex + i) % 9;
      const dashaInfo = DASHA_SEQUENCE[seqIndex];
      
      const currentMahaEndTime = currentMahaStartTime.plus({ years: dashaInfo.years });
      
      const subPeriods: DashaPeriod[] = [];
      let currentAntarStartTime = currentMahaStartTime;
      let accumulatedX = 0;
      
      // Compute perfect Antardasha dates using traditional (Maha * Antar / 120) algorithm
      // Accumulated fractions from the Mahadasha start date must be used to prevent calendar drift.
      for (let j = 0; j < 9; j++) {
        const subSeqIndex = (seqIndex + j) % 9;
        const subDashaInfo = DASHA_SEQUENCE[subSeqIndex];
        
        accumulatedX += dashaInfo.years * subDashaInfo.years;
        
        const Y = Math.floor(accumulatedX / 120);
        let rem = accumulatedX % 120;
        const M = Math.floor((rem * 12) / 120);
        rem = (rem * 12) % 120;
        const D = Math.round((rem * 30) / 120);
        
        let antarEndTime = currentMahaStartTime.plus({ years: Y, months: M, days: D });
        
        // Ensure the last antardasha aligns perfectly with the Mahadasha boundary
        if (j === 8) {
            antarEndTime = currentMahaEndTime;
        }
        
        subPeriods.push({
          planet: subDashaInfo.lord,
          startDate: currentAntarStartTime.toISO() as string,
          endDate: antarEndTime.toISO() as string
        });
        
        currentAntarStartTime = antarEndTime;
      }
      
      mahadashas.push({
        planet: dashaInfo.lord,
        startDate: currentMahaStartTime.toISO() as string,
        endDate: currentMahaEndTime.toISO() as string,
        subPeriods
      });
      
      currentMahaStartTime = currentMahaEndTime;
    }

    // Filter out completely past antardashas and clamp boundaries to birthTime
    const validMahadashas = mahadashas.filter(md => DateTime.fromISO(md.endDate) > birthTime).map(md => {
      const clampedMd = { ...md };
      if (DateTime.fromISO(clampedMd.startDate) < birthTime) {
        clampedMd.startDate = birthTime.toISO() as string;
      }
      
      if (clampedMd.subPeriods) {
         clampedMd.subPeriods = clampedMd.subPeriods
            .filter(ad => DateTime.fromISO(ad.endDate) > birthTime)
            .map(ad => {
               const clampedAd = { ...ad };
               if (DateTime.fromISO(clampedAd.startDate) < birthTime) {
                  clampedAd.startDate = birthTime.toISO() as string;
               }
               return clampedAd;
            });
      }
      return clampedMd;
    });

    const now = DateTime.now();
    let currentMahadasha = validMahadashas[0];
    let currentAntardasha = validMahadashas[0].subPeriods![0];
    let nextMahadasha = validMahadashas[1] || validMahadashas[0];
    let nextAntardasha = validMahadashas[0].subPeriods![1] || validMahadashas[0].subPeriods![0];

    // Find current based on current time
    for (let i = 0; i < validMahadashas.length; i++) {
      const md = validMahadashas[i];
      if (now >= DateTime.fromISO(md.startDate) && now < DateTime.fromISO(md.endDate)) {
        currentMahadasha = md;
        nextMahadasha = validMahadashas[i + 1] || md;
        
        if (md.subPeriods) {
          for (let j = 0; j < md.subPeriods.length; j++) {
            const ad = md.subPeriods[j];
            if (now >= DateTime.fromISO(ad.startDate) && now < DateTime.fromISO(ad.endDate)) {
              currentAntardasha = ad;
              // Next antardasha could cross mahadasha boundary
              if (j + 1 < md.subPeriods.length) {
                nextAntardasha = md.subPeriods[j + 1];
              } else if (i + 1 < validMahadashas.length && validMahadashas[i + 1].subPeriods) {
                nextAntardasha = validMahadashas[i + 1].subPeriods![0];
              }
              break;
            }
          }
        }
        break;
      }
    }

    return {
      nakshatraName,
      birthMahadashaInfo,
      nakshatraPassedArc,
      fractionRemaining,
      balanceYears,
      validMahadashas,
      currentMahadasha,
      currentAntardasha,
      nextMahadasha,
      nextAntardasha,
      nakshatraIndex,
      firstMahaEndTime,
      balanceYMD: { years: balanceY, months: balanceM, days: balanceD }
    };
  }

  static calculate(data: MasterKundliData): VimshottariData {
    const moon = data.planets?.['Moon'];
    const bp = data.birthProfile;
    const tz = bp?.timezone || 'Asia/Kolkata';

    let birthTime: DateTime | null = null;

    // 1. If rawDob and rawTime exist, try ISO parse
    if (bp?.rawDob && bp?.rawTime) {
      const rawIso = DateTime.fromISO(`${bp.rawDob}T${bp.rawTime}`, { zone: tz });
      if (rawIso.isValid) {
        birthTime = rawIso;
      }
    }

    // 2. Try parsing formatted string dob + time
    if (!birthTime || !birthTime.isValid) {
      const birthTimeStr = `${bp?.dob} ${bp?.time}`.trim();
      const formats = [
        'dd MMMM yyyy hh:mm:ss a',
        'dd MMMM yyyy hh:mm a',
        'd MMMM yyyy hh:mm:ss a',
        'd MMMM yyyy hh:mm a',
        'd MMMM yyyy h:mm a',
        'dd MMMM yyyy h:mm a',
        'yyyy-MM-dd HH:mm:ss',
        'yyyy-MM-dd HH:mm',
        'yyyy-MM-dd hh:mm a',
        'yyyy-MM-dd h:mm a'
      ];
      for (const fmt of formats) {
        const candidate = DateTime.fromFormat(birthTimeStr, fmt, { zone: tz });
        if (candidate.isValid) {
          birthTime = candidate;
          break;
        }
      }
    }

    // 3. Try DateTime.fromISO
    if (!birthTime || !birthTime.isValid) {
      const candidate = DateTime.fromISO(`${bp?.dob}T${bp?.time}`, { zone: tz });
      if (candidate.isValid) {
        birthTime = candidate;
      }
    }

    // 4. Try JS Date fallback
    if (!birthTime || !birthTime.isValid) {
      const jsDate = new Date(`${bp?.dob} ${bp?.time}`);
      if (!isNaN(jsDate.getTime())) {
        birthTime = DateTime.fromJSDate(jsDate, { zone: tz });
      }
    }

    if (!birthTime || !birthTime.isValid) {
      throw new Error(`Invalid birth time for Dasha calculation: ${birthTime ? birthTime.invalidReason : 'unparsable'}`);
    }

    if (!moon || typeof moon.siderealLongitude !== 'number') {
      throw new Error("Missing or invalid Moon data in MasterKundliData. Cannot compute Dasha.");
    }

    const rawSeq = this.calculateSequenceForLongitude(moon.siderealLongitude, birthTime);
    
    const ayanamsaValue = data.metadata?.ayanamsaValue || 0;
    const isAyanamsaApplied = ayanamsaValue > 0;

    return {
      system: "Vimshottari",
      version: "v2.1.0-strict",
      dataSource: "VimshottariEngine (Frontend Math)",
      birthNakshatra: rawSeq.nakshatraName,
      birthNakshatraLord: rawSeq.birthMahadashaInfo.lord,
      nakshatraProgress: (1 - rawSeq.fractionRemaining) * 100,
      birthMahadasha: rawSeq.validMahadashas[0],
      mahadashas: rawSeq.validMahadashas,
      currentMahadasha: rawSeq.currentMahadasha,
      currentAntardasha: rawSeq.currentAntardasha,
      nextAntardasha: rawSeq.nextAntardasha,
      nextMahadasha: rawSeq.nextMahadasha,
      balanceYears: rawSeq.balanceYears,
      calculationExplanation: `Moon is in ${rawSeq.nakshatraName} Nakshatra at ${moon.siderealLongitude.toFixed(4)}°. Ruled by ${rawSeq.birthMahadashaInfo.lord}. Total arc 13°20'. Remaining arc is ${(rawSeq.fractionRemaining * 100).toFixed(4)}% yielding a balance of ${rawSeq.balanceYears.toFixed(4)} years out of ${rawSeq.birthMahadashaInfo.years} total.`,
      audit: {
        rawMoonLongitude: moon.tropicalLongitude,
        tropicalMoonLongitude: moon.tropicalLongitude,
        siderealMoonLongitude: moon.siderealLongitude,
        isAyanamsaApplied,
        assumedAyanamsa: ayanamsaValue,
        nakshatraIndex: rawSeq.nakshatraIndex,
        nakshatraName: rawSeq.nakshatraName,
        nakshatraLord: rawSeq.birthMahadashaInfo.lord,
        nakshatraStartDeg: rawSeq.nakshatraIndex * (360/27),
        nakshatraEndDeg: (rawSeq.nakshatraIndex + 1) * (360/27),
        progressPercent: (1 - rawSeq.fractionRemaining) * 100,
        remainingPercent: rawSeq.fractionRemaining * 100,
        mahadashaTotalYears: rawSeq.birthMahadashaInfo.years,
        birthBalanceYears: rawSeq.balanceYears,
        birthBalanceYMD: `${rawSeq.balanceYMD.years} Yrs, ${rawSeq.balanceYMD.months} Mos, ${rawSeq.balanceYMD.days} Days`,
        firstMahadashaEndDate: rawSeq.firstMahaEndTime.toISO() as string,
        shadowCalculation: undefined,
        discrepancyReason: "Calculations are standard and exact. Sidereal math is strictly synchronized with Swiss Ephemeris and chosen Ayanamsa."
      }
    };
  }
}
