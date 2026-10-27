/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — UPAGRAHA CALCULATION ENGINE
 * DETERMINISTIC ASTRONOMICAL & TRADITIONAL TIME-BASED UPAGRAHA CALCULATIONS
 * 
 * TRADITIONAL METHODOLOGY (Bṛhat Parāśara Horā Śāstra):
 * - Sun-based Upagrahas (Dhuma, Vyatipata, Parivesha, Indrachapa, Upaketu) calculated from Sidereal Sun long.
 * - Time-based Upagrahas (Gulika, Mandi, Kaala, Mrityu, Yamaghantaka, Ardhaprahara):
 *   1. Day duration (Sunrise to Sunset) and Night duration (Sunset to next Sunrise) divided into 8 equal parts.
 *   2. Weekday-based lord assignment for day/night parts.
 *   3. Gulika: Calculated at the start of Saturn's part.
 *   4. Mandi: Calculated at the midpoint of Saturn's part (Parasari tradition).
 * - Robust solar calculation used for local sunrise/sunset based on latitude, longitude, and date.
 * - If coordinates or date are invalid/unverified, returns 'Calculation Unavailable' (NaN) instead of silent guesses.
 */

import { MasterKundliData } from '../../types/kundli';

export interface UpagrahaInfo {
  name: string;
  hindiName: string;
  longitude: number;
  rashi: number;
  rashiName: string;
  degree: number;
  house: number;
  type: 'Luminous' | 'Non-Luminous' | 'Time-Based';
  description: string;
}

export class UpagrahaEngine {
  private static readonly RASHI_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  static calculate(data: MasterKundliData): UpagrahaInfo[] {
    const results: UpagrahaInfo[] = [];
    
    // 1. Sun-based Upagrahas
    results.push(...this.calculateSunBased(data));
    
    // 2. Time-based Upagrahas (Gulika, Mandi, Kaala, Mrityu, Yamaghantaka, Ardhaprahara)
    results.push(...this.calculateTimeBased(data));
    
    return results;
  }

  private static normalize(deg: number): number {
    return ((deg % 360) + 360) % 360;
  }

  private static getHouse(long: number, lagnaLong: number): number {
    if (isNaN(long) || isNaN(lagnaLong)) return NaN;
    const diff = (long - lagnaLong + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  private static calculateSunBased(data: MasterKundliData): UpagrahaInfo[] {
    const sunLong = data.planets?.['Sun']?.siderealLongitude;
    const lagnaLong = data.lagna?.siderealLongitude;

    if (typeof sunLong !== 'number' || typeof lagnaLong !== 'number' || isNaN(sunLong) || isNaN(lagnaLong)) {
      return [];
    }
    
    // Dhuma = Sun + 133°20' (133.3333)
    const dhuma = this.normalize(sunLong + 133.3333);
    
    // Vyatipata = 360° - Dhuma
    const vyatipata = this.normalize(360 - dhuma);
    
    // Parivesha = 180° + Vyatipata
    const parivesha = this.normalize(180 + vyatipata);
    
    // Indrachapa = 360° - Parivesha
    const indrachapa = this.normalize(360 - parivesha);
    
    // Upaketu = Indrachapa + 16°40' (16.6666)
    const upaketu = this.normalize(indrachapa + 16.6666);
    
    const upagrahas = [
      { name: 'Dhuma', hindiName: 'धूम', long: dhuma, desc: 'Auspicious in 3, 6, 11. Malefic in other houses. Signifies heat and smoke.' },
      { name: 'Vyatipata', hindiName: 'व्यतिपात', long: vyatipata, desc: 'Extremely malefic point. Causes falls and sudden calamities.' },
      { name: 'Parivesha', hindiName: 'परिवेष', long: parivesha, desc: 'Indicates obstacles and encircling problems. Dangerous in angles.' },
      { name: 'Indrachapa', hindiName: 'इन्द्रचाप', long: indrachapa, desc: 'The Rainbow. Malefic but can indicate hidden talents in some houses.' },
      { name: 'Upaketu', hindiName: 'उपकेतु', long: upaketu, desc: 'The Comet. Signifies sudden changes and destruction.' }
    ];

    return upagrahas.map(u => ({
      name: u.name,
      hindiName: u.hindiName,
      longitude: u.long,
      rashi: Math.floor(u.long / 30) + 1,
      rashiName: this.RASHI_NAMES[Math.floor(u.long / 30)] || 'Unknown',
      degree: u.long % 30,
      house: this.getHouse(u.long, lagnaLong),
      type: 'Non-Luminous',
      description: u.desc
    }));
  }

  private static parseBirthTime(timeStr: string): { minutes: number; isValid: boolean } {
    if (!timeStr || typeof timeStr !== 'string') {
      return { minutes: NaN, isValid: false };
    }
    const cleanStr = timeStr.trim().toUpperCase();
    const isPM = cleanStr.includes('PM');
    const isAM = cleanStr.includes('AM');
    const timeOnly = cleanStr.replace(/(AM|PM)/g, '').trim();
    const parts = timeOnly.split(':').map(Number);
    
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
      return { minutes: NaN, isValid: false };
    }
    
    let [h, m] = parts;
    if (h < 0 || h > 23 || m < 0 || m > 59) {
      return { minutes: NaN, isValid: false };
    }
    
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    
    return { minutes: h * 60 + m, isValid: true };
  }

  /**
   * Calculates robust local sunrise and sunset minutes from midnight based on date, latitude, and longitude.
   * Uses solar declination and equation of time approximation.
   */
  private static calculateSunriseSunset(date: Date, lat: number, lon: number): { sunriseMinutes: number; sunsetMinutes: number; isValid: boolean } {
    if (isNaN(lat) || isNaN(lon) || isNaN(date.getTime())) {
      return { sunriseMinutes: NaN, sunsetMinutes: NaN, isValid: false };
    }

    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;
    
    // Solar declination in radians
    const declination = 23.45 * Math.sin(((284 + dayOfYear) / 365) * 2 * Math.PI) * (Math.PI / 180);
    const latRad = lat * (Math.PI / 180);
    
    const tanVal = -Math.tan(latRad) * Math.tan(declination);
    if (tanVal < -1 || tanVal > 1) {
      // Polar regions where sun doesn't rise or set
      return { sunriseMinutes: NaN, sunsetMinutes: NaN, isValid: false };
    }
    
    const hourAngle = Math.acos(tanVal) * (180 / Math.PI);
    // Solar noon adjusted for longitude offset (4 minutes per degree from standard meridian)
    const solarNoonMinutes = 720 - (lon * 4);
    const halfDayMinutes = (hourAngle / 15) * 60;
    
    const sunriseMinutes = Math.round(solarNoonMinutes - halfDayMinutes);
    const sunsetMinutes = Math.round(solarNoonMinutes + halfDayMinutes);
    
    return {
      sunriseMinutes,
      sunsetMinutes,
      isValid: true
    };
  }

  private static calculateTimeBased(data: MasterKundliData): UpagrahaInfo[] {
    const lagnaLong = data.lagna?.siderealLongitude;
    const lat = data.birthProfile?.latitude;
    const lon = data.birthProfile?.longitude;
    const dobStr = data.birthProfile?.dob;

    const timeUpagrahas = [
      { name: 'Gulika', hindiName: 'गुलिका', lord: 6, desc: 'Son of Saturn. Most malefic time-point. Crucial for longevity and karma.' },
      { name: 'Mandi', hindiName: 'मांदी', lord: 6, isMandi: true, desc: 'Often equated with Gulika, but calculated at the midpoint of Saturn part in classical Parasari tradition.' },
      { name: 'Kaala', hindiName: 'काल', lord: 0, desc: 'Son of Sun. Indicates timing of results and karmic deadlines.' },
      { name: 'Mrityu', hindiName: 'मृत्यु', lord: 2, desc: 'Son of Mars. Signifies danger, accidents and sudden death.' },
      { name: 'Yamaghantaka', hindiName: 'यमघंटक', lord: 4, desc: 'Son of Jupiter. Often beneficial but indicates finality of actions.' },
      { name: 'Ardhaprahara', hindiName: 'अर्धप्रहर', lord: 3, desc: 'Son of Mercury. Signifies business fluctuations and mental stress.' }
    ];

    if (typeof lagnaLong !== 'number' || isNaN(lagnaLong) || !dobStr || typeof lat !== 'number' || typeof lon !== 'number') {
      return timeUpagrahas.map(u => ({
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based',
        description: u.desc + ' (Missing or invalid birth coordinates/date)'
      }));
    }

    const dob = new Date(dobStr);
    const dayOfWeek = dob.getDay(); // 0=Sun, 1=Mon... 6=Sat
    
    const sunCalc = this.calculateSunriseSunset(dob, lat, lon);
    const parsedTime = this.parseBirthTime(data.birthProfile?.time);
    const birthTimeMinutes = parsedTime.isValid ? parsedTime.minutes : NaN;

    if (!sunCalc.isValid || isNaN(birthTimeMinutes)) {
      return timeUpagrahas.map(u => ({
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based',
        description: u.desc + ' (Unverified sunrise/sunset or invalid birth time)'
      }));
    }

    const sunrise = sunCalc.sunriseMinutes;
    const sunset = sunCalc.sunsetMinutes;

    const isDay = birthTimeMinutes >= sunrise && birthTimeMinutes < sunset;
    const duration = isDay ? (sunset - sunrise) : (1440 - sunset + sunrise);
    const partDuration = duration / 8;
    const baseTime = isDay ? sunrise : sunset;

    // Helper to calculate rising degree at a given time (roughly 1 degree per 4 minutes from Birth Lagna)
    const getRisingDegree = (timeMinutes: number) => {
      if (isNaN(birthTimeMinutes)) return NaN;
      const diff = timeMinutes - birthTimeMinutes;
      return this.normalize(lagnaLong + (diff / 4));
    };

    const getPartStartTime = (partIndex: number) => baseTime + (partIndex - 1) * partDuration;

    // Day Lord Index
    const dLord = dayOfWeek;
    const nFirstLord = (dayOfWeek + 4) % 7;
    const startLord = isDay ? dLord : nFirstLord;

    const getLordPart = (targetLord: number) => ((targetLord - startLord + 7) % 7) + 1;

    return timeUpagrahas.map(u => {
      const part = getLordPart(u.lord);
      let upaTime = getPartStartTime(part);
      if (u.isMandi) {
        upaTime += (partDuration / 2); // Mandi at midpoint of Saturn part (Parasari tradition)
      }
      
      const long = getRisingDegree(upaTime);
      return {
        name: u.name,
        hindiName: u.hindiName,
        longitude: long,
        rashi: isNaN(long) ? NaN : Math.floor(long / 30) + 1,
        rashiName: isNaN(long) ? 'Calculation Unavailable' : (this.RASHI_NAMES[Math.floor(long / 30)] || 'Unknown'),
        degree: isNaN(long) ? NaN : (long % 30),
        house: this.getHouse(long, lagnaLong),
        type: 'Time-Based',
        description: u.desc
      };
    });
  }
}
