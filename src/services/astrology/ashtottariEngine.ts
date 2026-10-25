import { MasterKundliData } from '../../types/kundli';

export interface AshtottariDasha {
  planet: string;
  hindiName: string;
  duration: number;
  start: Date;
  end: Date;
  antardashas?: AshtottariDasha[];
}

export interface AshtottariResult {
  dashas: AshtottariDasha[];
  currentMD: AshtottariDasha;
  currentAD: AshtottariDasha;
  isApplicable: boolean;
  applicabilityReason: string;
}

export class AshtottariEngine {
  private static PLANET_ORDER = [
    { name: 'Sun', hindi: 'सूर्य', years: 6 },
    { name: 'Moon', hindi: 'चंद्र', years: 15 },
    { name: 'Mars', hindi: 'मंगल', years: 8 },
    { name: 'Mercury', hindi: 'बुध', years: 17 },
    { name: 'Saturn', hindi: 'शनि', years: 10 },
    { name: 'Jupiter', hindi: 'गुरु', years: 19 },
    { name: 'Rahu', hindi: 'राहु', years: 12 },
    { name: 'Venus', hindi: 'शुक्र', years: 21 }
  ];

  // Krittikadi Nakshatra mapping for Ashtottari
  // Mapping of Moon Nakshatra Index (1-27) to Planet Order Index (0-7)
  // Standard: 3 nakshatras for some, 4 for others. Total 28 including Abhijit.
  // We use 27 but adjust for the logic.
  private static NAKSHATRA_TO_PLANET: number[] = [
    7, 7, 7, // 1-3: Ashwini, Bharani, Krittika -> Venus (but usually starting Krittikadi means 3 is start)
  ];

  static calculate(data: MasterKundliData): AshtottariResult {
    const moonNakIdx = data.planets['Moon'].nakshatra; // 1-27
    const moonLong = data.planets['Moon'].siderealLongitude % 360;
    
    // Krittikadi Logic (Starting from Krittika = 3)
    // 3,4,5,6 -> Sun
    // 7,8,9 -> Moon
    // 10,11,12,13 -> Mars
    // 14,15,16 -> Mercury
    // 17,18,19,20 -> Saturn
    // 21,22,23 -> Jupiter (22.5 is Abhijit, handled by range)
    // 24,25,26,27 -> Rahu
    // 28(1), 2(2), 3(3) -> Venus
    
    // Simpler 27-nakshatra based mapping for Ashtottari (Standard Krittikadi)
    let planetIndex = 0;
    if (moonNakIdx >= 3 && moonNakIdx <= 6) planetIndex = 0; // Sun
    else if (moonNakIdx >= 7 && moonNakIdx <= 9) planetIndex = 1; // Moon
    else if (moonNakIdx >= 10 && moonNakIdx <= 13) planetIndex = 2; // Mars
    else if (moonNakIdx >= 14 && moonNakIdx <= 16) planetIndex = 3; // Mercury
    else if (moonNakIdx >= 17 && moonNakIdx <= 20) planetIndex = 4; // Saturn
    else if (moonNakIdx >= 21 && moonNakIdx <= 23) planetIndex = 5; // Jupiter
    else if (moonNakIdx >= 24 && moonNakIdx <= 27) planetIndex = 6; // Rahu
    else planetIndex = 7; // Venus (Ashwini, Bharani)

    // Remainder calculation
    const naksInGroup = (planetIndex % 2 === 0) ? 4 : 3;
    const nakSize = 360 / 27;
    const totalSpanInGroup = nakSize * naksInGroup;
    
    const nakOffsets = [2, 6, 9, 13, 16, 20, 23, 27]; // Cumulative nak counts from Krittika (normalized)
    
    const birthTime = new Date(data.birthProfile.dob).getTime();
    const oneYear = 365.2425 * 24 * 60 * 60 * 1000;
    
    // Balance calculation
    const distanceInNak = moonLong % nakSize;
    const distanceTraversedInGroup = ((moonNakIdx - (planetIndex === 0 ? 3 : (planetIndex === 7 ? -2 : nakOffsets[planetIndex-1] + 3)) + 27) % 27) * nakSize + distanceInNak;
    const fractionTraversed = distanceTraversedInGroup / totalSpanInGroup;
    
    const planet = this.PLANET_ORDER[planetIndex];
    const balanceYears = planet.years * (1 - fractionTraversed);
    
    const dashas: AshtottariDasha[] = [];
    let currentStart = birthTime - (planet.years - balanceYears) * oneYear;

    for (let i = 0; i < 8; i++) {
      const idx = (planetIndex + i) % 8;
      const p = this.PLANET_ORDER[idx];
      const duration = p.years * oneYear;
      const end = currentStart + duration;
      
      const md: AshtottariDasha = {
        planet: p.name,
        hindiName: p.hindi,
        duration: p.years,
        start: new Date(currentStart),
        end: new Date(end),
        antardashas: this.calculateAntardashas(p, currentStart)
      };
      
      dashas.push(md);
      currentStart = end;
    }

    const now = new Date().getTime();
    const currentMD = dashas.find(d => now >= d.start.getTime() && now < d.end.getTime()) || dashas[0];
    const currentAD = currentMD.antardashas?.find(a => now >= a.start.getTime() && now < a.end.getTime()) || currentMD.antardashas![0];

    const applicability = this.checkApplicability(data);

    return {
      dashas,
      currentMD,
      currentAD,
      isApplicable: applicability.isApplicable,
      applicabilityReason: applicability.reason
    };
  }

  private static calculateAntardashas(md: any, mdStart: number): AshtottariDasha[] {
    const ads: AshtottariDasha[] = [];
    let currentStart = mdStart;

    for (let i = 0; i < 8; i++) {
      const idx = (this.PLANET_ORDER.findIndex(p => p.name === md.name) + i) % 8;
      const p = this.PLANET_ORDER[idx];
      // Formula: (MD Years * AD Years) / 108
      const adDurationYears = (md.years * p.years) / 108;
      const durationMs = adDurationYears * 365.2425 * 24 * 60 * 60 * 1000;
      const end = currentStart + durationMs;

      ads.push({
        planet: p.name,
        hindiName: p.hindi,
        duration: adDurationYears,
        start: new Date(currentStart),
        end: new Date(end)
      });
      currentStart = end;
    }
    return ads;
  }

  private static checkApplicability(data: MasterKundliData): { isApplicable: boolean, reason: string } {
    // 1. Rahu in Kendra/Trikona from Lagna Lord
    // Find Lagna Lord from first house
    const firstHouse = data.d1Chart[1];
    const lagnaLord = firstHouse.signLord;
    const lagnaLordHouse = data.planets[lagnaLord].d1House;
    const rahuHouse = data.planets['Rahu'].d1House;
    
    // Distance from Lagna Lord
    const distFromLL = (rahuHouse - lagnaLordHouse + 12) % 12 + 1;
    const isKendraTrikona = [1, 4, 5, 7, 9, 10].includes(distFromLL);
    
    if (isKendraTrikona) {
      return { isApplicable: true, reason: "Rahu is in Kendra/Trikona from Lagna Lord." };
    }

    return { 
      isApplicable: false, 
      reason: "Standard applicability conditions (Rahu placement) not fully met, but calculated for reference." 
    };
  }
}
