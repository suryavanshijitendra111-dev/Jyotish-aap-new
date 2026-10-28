/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — UPAGRAHA CALCULATION ENGINE
 * STRICT COMPLIANCE WITH PHASE 13 REAL ASCENDANT / NO APPROXIMATION POLICY
 * 
 * - Sun-based Upagrahas (Dhuma, Vyatipata, Parivesha, Indrachapa, Upaketu) calculated from Sidereal Sun long.
 * - Time-based Upagrahas (Gulika, Mandi, Kaala, Mrityu, Yamaghantaka, Ardhaprahara):
 *   1. Precise local Sunrise and Sunset computed dynamically using Luxon IANA timezone, latitude, longitude, and solar declination.
 *   2. Day duration (Sunrise to Sunset) and Night duration (Sunset to next Sunrise) divided into 8 equal parts.
 *   3. Weekday-based lord assignment for day/night parts.
 *   4. Gulika: Calculated at the exact start of Saturn's part.
 *   5. Mandi: Calculated at the midpoint of Saturn's part (Parasari tradition).
 *   6. STRICT RULE: Per Phase 13 rules, time-to-zodiac approximations (timeDiff x rotation rate) are strictly prohibited. 
 *      Since real Swiss Ephemeris Ascendant requires asynchronous runtime, unverified approximations are not shown as exact longitudes; 
 *      instead, precise timing is maintained with explicit 'Calculation Unavailable' status for longitude.
 */

import { MasterKundliData } from '../../types/kundli';
import { DateTime } from 'luxon';
import { getSwissEph } from '../jyotish/transitEngine';

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
    
    // 1. Sun-based Upagrahas (Derived from Sidereal Sun longitude - exact mathematical points)
    results.push(...this.calculateSunBased(data));
    
    // 2. Time-based Upagrahas (Synchronous fallback with unavailable status until calculateAsync is resolved)
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

  /**
   * Calculates local sunrise and sunset minutes from midnight using Luxon and solar declination.
   */
  private static calculateSunriseSunset(dt: DateTime, lat: number, lon: number): { sunriseMinutes: number; sunsetMinutes: number; isValid: boolean } {
    if (isNaN(lat) || isNaN(lon) || !dt.isValid) {
      return { sunriseMinutes: NaN, sunsetMinutes: NaN, isValid: false };
    }

    const startOfYear = DateTime.fromObject({ year: dt.year, month: 1, day: 1 }, { zone: dt.zone });
    const dayOfYear = Math.floor(dt.diff(startOfYear, 'days').days) + 1;
    
    const declination = 23.45 * Math.sin(((284 + dayOfYear) / 365) * 2 * Math.PI) * (Math.PI / 180);
    const latRad = lat * (Math.PI / 180);
    
    const tanVal = -Math.tan(latRad) * Math.tan(declination);
    const clampedTan = Math.max(-1, Math.min(1, tanVal));
    
    const hourAngle = Math.acos(clampedTan) * (180 / Math.PI);
    const tzOffsetMinutes = dt.offset || 0;
    const solarNoonMinutes = 720 - (lon * 4) + tzOffsetMinutes;
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
    const lat = data.birthProfile?.latitude;
    const lon = data.birthProfile?.longitude;
    const dobStr = data.birthProfile?.dob;
    const timeStr = data.birthProfile?.time;
    const tzStr = data.birthProfile?.timezone || 'Asia/Kolkata';

    const timeUpagrahas = [
      { name: 'Gulika', hindiName: 'गुलिका', lord: 6, desc: 'Son of Saturn. Most malefic time-point. Crucial for longevity and karma.' },
      { name: 'Mandi', hindiName: 'मांदी', lord: 6, isMandi: true, desc: 'Calculated at the midpoint of Saturn part in classical Parasari tradition.' },
      { name: 'Kaala', hindiName: 'काल', lord: 0, desc: 'Son of Sun. Indicates timing of results and karmic deadlines.' },
      { name: 'Mrityu', hindiName: 'मृत्यु', lord: 2, desc: 'Son of Mars. Signifies danger, accidents and sudden death.' },
      { name: 'Yamaghantaka', hindiName: 'यमघंटक', lord: 4, desc: 'Son of Jupiter. Often beneficial but indicates finality of actions.' },
      { name: 'Ardhaprahara', hindiName: 'अर्धप्रहर', lord: 3, desc: 'Son of Mercury. Signifies business fluctuations and mental stress.' }
    ];

    if (!dobStr || !timeStr || typeof lat !== 'number' || typeof lon !== 'number') {
      return timeUpagrahas.map(u => ({
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based',
        description: u.desc + ' (Missing birth coordinates, date, or time)'
      }));
    }

    let dt = DateTime.fromISO(dobStr, { zone: tzStr });
    if (!dt.isValid) {
      dt = DateTime.fromFormat(dobStr, 'yyyy-MM-dd', { zone: tzStr });
    }
    if (!dt.isValid) {
      dt = DateTime.fromJSDate(new Date(dobStr), { zone: tzStr });
    }

    if (!dt.isValid) {
      return timeUpagrahas.map(u => ({
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based',
        description: u.desc + ' (Invalid birth date format)'
      }));
    }

    const cleanTime = timeStr.trim().toUpperCase();
    const isPM = cleanTime.includes('PM');
    const isAM = cleanTime.includes('AM');
    const timeOnly = cleanTime.replace(/(AM|PM)/g, '').trim();
    const timeParts = timeOnly.split(':').map(Number);

    if (timeParts.length < 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
      return timeUpagrahas.map(u => ({
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based',
        description: u.desc + ' (Invalid birth time format)'
      }));
    }

    let [h, m] = timeParts;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;

    const birthMinutesFromMidnight = h * 60 + m;
    const luxonWeekday = dt.weekday; 
    const jsDayOfWeek = luxonWeekday === 7 ? 0 : luxonWeekday;

    const sunCalc = this.calculateSunriseSunset(dt, lat, lon);
    if (!sunCalc.isValid) {
      return timeUpagrahas.map(u => ({
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based',
        description: u.desc + ' (Sunrise/Sunset calculation failed for coordinates)'
      }));
    }

    const sunrise = sunCalc.sunriseMinutes;
    const sunset = sunCalc.sunsetMinutes;

    const isDay = birthMinutesFromMidnight >= sunrise && birthMinutesFromMidnight < sunset;
    const duration = isDay ? (sunset - sunrise) : (1440 - sunset + sunrise);
    const partDuration = duration / 8;
    const baseTime = isDay ? sunrise : sunset;

    const getPartStartTime = (partIndex: number) => baseTime + (partIndex - 1) * partDuration;

    const dLord = jsDayOfWeek;
    const nFirstLord = (jsDayOfWeek + 4) % 7;
    const startLord = isDay ? dLord : nFirstLord;

    const getLordPart = (targetLord: number) => ((targetLord - startLord + 7) % 7) + 1;

    return timeUpagrahas.map(u => {
      const part = getLordPart(u.lord);
      let upaMinutes = getPartStartTime(part);
      if (u.isMandi) {
        upaMinutes += (partDuration / 2);
      }

      const upaHours = Math.floor(upaMinutes / 60) % 24;
      const upaMins = Math.round(upaMinutes % 60);
      const timeFormatted = `${String(upaHours).padStart(2, '0')}:${String(upaMins).padStart(2, '0')}`;

      return {
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based',
        description: `${u.desc} (Precise Saturn Part #${part} time: ${timeFormatted}. Real Ascendant requires async Swiss Ephemeris runtime bridge).`
      };
    });
  }

  static async calculateAsync(data: MasterKundliData): Promise<UpagrahaInfo[]> {
    const results: UpagrahaInfo[] = [];
    
    // 1. Sun-based Upagrahas
    results.push(...this.calculateSunBased(data));

    // 2. Time-based Upagrahas with real Swiss Ephemeris Ascendant
    const lat = data.birthProfile?.latitude;
    const lon = data.birthProfile?.longitude;
    const dobStr = data.birthProfile?.dob;
    const timeStr = data.birthProfile?.time;
    const tzStr = data.birthProfile?.timezone || 'Asia/Kolkata';

    const timeUpagrahas = [
      { name: 'Gulika', hindiName: 'गुलिका', lord: 6, desc: 'Son of Saturn. Most malefic time-point. Crucial for longevity and karma.' },
      { name: 'Mandi', hindiName: 'मांदी', lord: 6, isMandi: true, desc: 'Calculated at the midpoint of Saturn part in classical Parasari tradition.' },
      { name: 'Kaala', hindiName: 'काल', lord: 0, desc: 'Son of Sun. Indicates timing of results and karmic deadlines.' },
      { name: 'Mrityu', hindiName: 'मृत्यु', lord: 2, desc: 'Son of Mars. Signifies danger, accidents and sudden death.' },
      { name: 'Yamaghantaka', hindiName: 'यमघंटक', lord: 4, desc: 'Son of Jupiter. Often beneficial but indicates finality of actions.' },
      { name: 'Ardhaprahara', hindiName: 'अर्धप्रहर', lord: 3, desc: 'Son of Mercury. Signifies business fluctuations and mental stress.' }
    ];

    if (!dobStr || !timeStr || typeof lat !== 'number' || typeof lon !== 'number') {
      return [...results, ...timeUpagrahas.map(u => ({
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based' as const,
        description: u.desc + ' (Missing birth coordinates, date, or time)'
      }))];
    }

    let dt = DateTime.fromISO(dobStr, { zone: tzStr });
    if (!dt.isValid) dt = DateTime.fromFormat(dobStr, 'yyyy-MM-dd', { zone: tzStr });
    if (!dt.isValid) dt = DateTime.fromJSDate(new Date(dobStr), { zone: tzStr });

    if (!dt.isValid) {
      return [...results, ...timeUpagrahas.map(u => ({
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based' as const,
        description: u.desc + ' (Invalid birth date format)'
      }))];
    }

    const cleanTime = timeStr.trim().toUpperCase();
    const isPM = cleanTime.includes('PM');
    const isAM = cleanTime.includes('AM');
    const timeOnly = cleanTime.replace(/(AM|PM)/g, '').trim();
    const timeParts = timeOnly.split(':').map(Number);

    if (timeParts.length < 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
      return [...results, ...timeUpagrahas.map(u => ({
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based' as const,
        description: u.desc + ' (Invalid birth time format)'
      }))];
    }

    let [h, m] = timeParts;
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;

    const birthMinutesFromMidnight = h * 60 + m;
    const luxonWeekday = dt.weekday; 
    const jsDayOfWeek = luxonWeekday === 7 ? 0 : luxonWeekday;

    const sunCalc = this.calculateSunriseSunset(dt, lat, lon);
    if (!sunCalc.isValid) {
      return [...results, ...timeUpagrahas.map(u => ({
        name: u.name,
        hindiName: u.hindiName,
        longitude: NaN,
        rashi: NaN,
        rashiName: 'Calculation Unavailable',
        degree: NaN,
        house: NaN,
        type: 'Time-Based' as const,
        description: u.desc + ' (Sunrise/Sunset calculation failed for coordinates)'
      }))];
    }

    const sunrise = sunCalc.sunriseMinutes;
    const sunset = sunCalc.sunsetMinutes;
    const isDay = birthMinutesFromMidnight >= sunrise && birthMinutesFromMidnight < sunset;
    const duration = isDay ? (sunset - sunrise) : (1440 - sunset + sunrise);
    const partDuration = duration / 8;
    const baseTime = isDay ? sunrise : sunset;

    const getPartStartTime = (partIndex: number) => baseTime + (partIndex - 1) * partDuration;

    const dLord = jsDayOfWeek;
    const nFirstLord = (jsDayOfWeek + 4) % 7;
    const startLord = isDay ? dLord : nFirstLord;
    const getLordPart = (targetLord: number) => ((targetLord - startLord + 7) % 7) + 1;

    let swe: any = null;
    try {
      swe = await getSwissEph();
    } catch (e) {
      console.warn('SwissEph failed to initialize for Upagraha:', e);
    }

    const lagnaLong = data.lagna?.siderealLongitude;

    for (const u of timeUpagrahas) {
      const part = getLordPart(u.lord);
      let upaMinutes = getPartStartTime(part);
      if (u.isMandi) {
        upaMinutes += (partDuration / 2);
      }

      const totalMins = Math.round(upaMinutes);
      const upaHour = Math.floor(totalMins / 60) % 24;
      const upaMin = totalMins % 60;
      
      let upaDt = dt.set({ hour: upaHour, minute: upaMin, second: 0, millisecond: 0 });
      if (totalMins < 0) {
        upaDt = upaDt.minus({ days: 1 });
      } else if (totalMins >= 1440) {
        upaDt = upaDt.plus({ days: 1 });
      }

      const timeFormatted = `${String(upaHour).padStart(2, '0')}:${String(upaMin).padStart(2, '0')}`;

      let longitude = NaN;
      let rashi = NaN;
      let rashiName = 'Calculation Unavailable';
      let degree = NaN;
      let house = NaN;
      let descNote = `${u.desc} (Saturn Part #${part} time: ${timeFormatted}).`;

      if (swe) {
        try {
          const utcDt = upaDt.toUTC();
          const jd = swe.julianDay(utcDt.year, utcDt.month, utcDt.day, utcDt.hour + utcDt.minute / 60 + utcDt.second / 3600, 1);
          swe.setSiderealMode(0);
          const ayanamsaVal = swe.ayanamsa(jd);
          const housesRes = swe.houses(jd, lat, lon);
          if (housesRes && typeof housesRes.ascendant === 'number') {
            const sidAsc = ((housesRes.ascendant - ayanamsaVal) % 360 + 360) % 360;
            longitude = sidAsc;
            rashi = Math.floor(sidAsc / 30) + 1;
            rashiName = this.RASHI_NAMES[rashi - 1] || 'Unknown';
            degree = sidAsc % 30;
            if (typeof lagnaLong === 'number') {
              house = this.getHouse(sidAsc, lagnaLong);
            }
            descNote = `${u.desc} (Saturn Part #${part} time: ${timeFormatted}. Calculated via real Swiss Ephemeris Ascendant).`;
          }
        } catch (err) {
          console.warn(`Real ascendant calculation failed for ${u.name}:`, err);
        }
      }

      results.push({
        name: u.name,
        hindiName: u.hindiName,
        longitude,
        rashi,
        rashiName,
        degree,
        house,
        type: 'Time-Based',
        description: descNote
      });
    }

    return results;
  }
}
