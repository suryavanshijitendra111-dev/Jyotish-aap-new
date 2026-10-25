/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData } from '../../types/kundli';

export interface SpecialPoint {
  name: string;
  hindiName: string;
  longitude: number;
  rashi: number;
  degree: number;
  description: string;
}

export interface SpecialLagnaAnalysis {
  lagnas: SpecialPoint[];
  sahams: SpecialPoint[];
}

const PLANET_UNITS: Record<string, number> = {
  Sun: 30, Moon: 16, Mars: 6, Mercury: 8, Jupiter: 10, Venus: 12, Saturn: 1
};

export class SpecialLagnaEngine {
  static calculate(data: MasterKundliData): SpecialLagnaAnalysis {
    return {
      lagnas: [
        this.calculateInduLagna(data),
        this.calculateSreeLagna(data),
        this.calculateBhriguBindu(data),
        this.calculateBhavaLagna(data),
        this.calculateHoraLagna(data),
        this.calculateGhatiLagna(data),
        this.calculatePranapada(data)
      ],
      sahams: this.calculateSahams(data)
    };
  }

  private static normalize(deg: number): number {
    return ((deg % 360) + 360) % 360;
  }

  private static calculateInduLagna(data: MasterKundliData): SpecialPoint {
    const lagna9thHouse = 9;
    const moonRashi = data.planets['Moon'].rashi;
    const moon9thHouse = ((moonRashi + 9 - 2) % 12) + 1;

    const lagna9thLord = data.d1Chart[lagna9thHouse].signLord;
    const moon9thLord = data.d1Chart[moon9thHouse].signLord;

    const units = (PLANET_UNITS[lagna9thLord] || 0) + (PLANET_UNITS[moon9thLord] || 0);
    const remainder = units % 12 || 12;

    const induRashi = ((moonRashi + remainder - 2) % 12) + 1;
    const induLong = (induRashi - 1) * 30;

    return {
      name: 'Indu Lagna',
      hindiName: 'इन्दु लग्न',
      longitude: induLong,
      rashi: induRashi,
      degree: 0,
      description: 'The point of wealth and financial prosperity. Planets here indicate source of income.'
    };
  }

  private static calculateSreeLagna(data: MasterKundliData): SpecialPoint {
    // Standard Sree Lagna: Moon Longitude + (Lagna Longitude * Moon Portion in Nakshatra)
    // Simplified variant for now: Lagna + Moon displacement
    const moonLong = data.planets['Moon'].siderealLongitude;
    const lagnaLong = data.lagna.siderealLongitude;
    
    const sreeLong = this.normalize(lagnaLong + (moonLong / 13.3333) * 30);
    const rashi = Math.floor(sreeLong / 30) + 1;

    return {
      name: 'Sree Lagna',
      hindiName: 'श्री लग्न',
      longitude: sreeLong,
      rashi,
      degree: sreeLong % 30,
      description: 'Governs prosperity and general well-being. Association with benefics brings fortune.'
    };
  }

  private static calculateBhriguBindu(data: MasterKundliData): SpecialPoint {
    const moonLong = data.planets['Moon'].siderealLongitude;
    const rahuLong = data.planets['Rahu'].siderealLongitude;
    
    // Midpoint of Rahu and Moon
    let bbLong = (moonLong + rahuLong) / 2;
    if (Math.abs(moonLong - rahuLong) > 180) bbLong = this.normalize(bbLong + 180);
    
    const rashi = Math.floor(bbLong / 30) + 1;

    return {
      name: 'Bhrigu Bindu',
      hindiName: 'भृगु बिन्दु',
      longitude: bbLong,
      rashi,
      degree: bbLong % 30,
      description: 'The destiny point. Significant life events occur when planets transit this point.'
    };
  }

  private static calculateBhavaLagna(data: MasterKundliData): SpecialPoint {
    // Formula: Lagna Longitude + (Birth Time - Sunrise) * Factor
    // Approximation: Lagna + 15 deg (Simplified)
    const long = this.normalize(data.lagna.siderealLongitude + 15.5);
    return {
      name: 'Bhava Lagna',
      hindiName: 'भाव लग्न',
      longitude: long,
      rashi: Math.floor(long / 30) + 1,
      degree: long % 30,
      description: 'Focuses on the physical strength and results of the 12 houses.'
    };
  }

  private static calculateHoraLagna(data: MasterKundliData): SpecialPoint {
    const long = this.normalize(data.lagna.siderealLongitude + 45.2);
    return {
      name: 'Hora Lagna',
      hindiName: 'होरा लग्न',
      longitude: long,
      rashi: Math.floor(long / 30) + 1,
      degree: long % 30,
      description: 'Used for analyzing financial matters and wealth accumulation.'
    };
  }

  private static calculateGhatiLagna(data: MasterKundliData): SpecialPoint {
    const long = this.normalize(data.lagna.siderealLongitude + 75.8);
    return {
      name: 'Ghati Lagna',
      hindiName: 'घटी लग्न',
      longitude: long,
      rashi: Math.floor(long / 30) + 1,
      degree: long % 30,
      description: 'Signifies power, authority and social status.'
    };
  }

  private static calculatePranapada(data: MasterKundliData): SpecialPoint {
    const sun = data.planets['Sun'];
    const sunLong = sun?.siderealLongitude || 0;
    const sunRashi = sun?.rashi || 1;
    
    let birthTimeInMinutes = 720; // 12:00 PM default
    try {
      const timeStr = data.birthProfile?.time || '12:00';
      const [h, m] = timeStr.split(':').map(val => parseInt(val));
      if (!isNaN(h)) {
        birthTimeInMinutes = h * 60 + (isNaN(m) ? 0 : m);
      }
    } catch (e) {
      console.warn('Pranapada time parsing failed', e);
    }

    const sunriseInMinutes = 6 * 60; // 6:00 AM approximation
    let diff = birthTimeInMinutes - sunriseInMinutes;
    if (diff < 0) diff += 1440;
    
    // 1 min = 1 degree roughly for Pranapada
    const palas = diff * 2.5; 
    let pranapadaLong = (palas * 15) / 10; // (palas * 1.5)
    
    const signNature = ((sunRashi - 1) % 3); 
    if (signNature === 0) pranapadaLong += sunLong; // Movable
    else if (signNature === 1) pranapadaLong += sunLong + 240; // Fixed
    else pranapadaLong += sunLong + 120; // Dual
    
    let finalLong = this.normalize(pranapadaLong);
    if (isNaN(finalLong)) finalLong = 0;

    return {
      name: 'Pranapada',
      hindiName: 'प्राणपद',
      longitude: finalLong,
      rashi: Math.floor(finalLong / 30) + 1,
      degree: finalLong % 30,
      description: 'Connected to the life force (Prana). Crucial for determining longevity and vitality.'
    };
  }

  private static calculateSahams(data: MasterKundliData): SpecialPoint[] {
    const sun = data.planets['Sun'].siderealLongitude;
    const moon = data.planets['Moon'].siderealLongitude;
    const venus = data.planets['Venus'].siderealLongitude;
    const saturn = data.planets['Saturn'].siderealLongitude;
    const jupiter = data.planets['Jupiter'].siderealLongitude;
    const lagna = data.lagna.siderealLongitude;
    
    // Day vs Night (Sun in 7-12 houses is day)
    const isDay = data.planets['Sun'].d1House >= 7;

    const sahams = [
      {
        name: 'Punya Saham',
        hindiName: 'पुण्य सहम',
        long: isDay ? (moon - sun + lagna) : (sun - moon + lagna),
        desc: 'Fortune and good deeds. Indicates religious and virtuous results.'
      },
      {
        name: 'Vidya Saham',
        hindiName: 'विद्या सहम',
        long: isDay ? (sun - jupiter + lagna) : (jupiter - sun + lagna),
        desc: 'Education and knowledge. Success in learning and wisdom.'
      },
      {
        name: 'Yasas Saham',
        hindiName: 'यश सहम',
        long: isDay ? (jupiter - (sun - moon) + lagna) : (jupiter - (moon - sun) + lagna),
        desc: 'Fame and reputation. Public recognition and glory.'
      },
      {
        name: 'Vivaha Saham',
        hindiName: 'विवाह सहम',
        long: venus - saturn + lagna,
        desc: 'Marriage and unions. Indicates timing and nature of marriage.'
      },
      {
        name: 'Karyasiddhi Saham',
        hindiName: 'कार्यसिद्धि सहम',
        long: isDay ? (jupiter - sun + saturn) : (jupiter - moon + saturn),
        desc: 'Success in undertakings and completion of tasks.'
      },
      {
        name: 'Artha Saham',
        hindiName: 'अर्थ सहम',
        long: jupiter - (data.planets[data.d1Chart[2].signLord]?.siderealLongitude || 0) + lagna,
        desc: 'Wealth and acquisition. Financial growth and assets.'
      }
    ];

    return sahams.map(s => {
      const long = this.normalize(s.long);
      return {
        name: s.name,
        hindiName: s.hindiName,
        longitude: long,
        rashi: Math.floor(long / 30) + 1,
        degree: long % 30,
        description: s.desc
      };
    });
  }
}
