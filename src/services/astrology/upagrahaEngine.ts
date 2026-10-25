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
    const diff = (long - lagnaLong + 360) % 360;
    return Math.floor(diff / 30) + 1;
  }

  private static calculateSunBased(data: MasterKundliData): UpagrahaInfo[] {
    const sunLong = data.planets['Sun'].siderealLongitude;
    const lagnaLong = data.lagna.siderealLongitude;
    
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
      rashiName: this.RASHI_NAMES[Math.floor(u.long / 30)],
      degree: u.long % 30,
      house: this.getHouse(u.long, lagnaLong),
      type: 'Non-Luminous',
      description: u.desc
    }));
  }

  private static calculateTimeBased(data: MasterKundliData): UpagrahaInfo[] {
    const lagnaLong = data.lagna.siderealLongitude;
    const dob = new Date(data.birthProfile.dob);
    const dayOfWeek = dob.getDay(); // 0=Sun, 1=Mon... 6=Sat
    
    // We need Sunrise/Sunset. Fallback to 6 AM/6 PM if not available.
    // In a real app, these should be in metadata.
    let sunrise = 6 * 60; // 6:00 AM
    let sunset = 18 * 60; // 6:00 PM
    
    let birthTimeMinutes = 720;
    try {
      const [h, m] = data.birthProfile.time.split(':').map(Number);
      birthTimeMinutes = h * 60 + m;
    } catch (e) {}

    const isDay = birthTimeMinutes >= sunrise && birthTimeMinutes < sunset;
    const duration = isDay ? (sunset - sunrise) : (1440 - sunset + sunrise);
    const partDuration = duration / 8;
    const baseTime = isDay ? sunrise : sunset;

    // Helper to calculate rising degree at a given time
    // Roughly 1 degree per 4 minutes from Birth Lagna
    const getRisingDegree = (timeMinutes: number) => {
      const diff = timeMinutes - birthTimeMinutes;
      return this.normalize(lagnaLong + (diff / 4));
    };

    const getPartStartTime = (partIndex: number) => baseTime + (partIndex - 1) * partDuration;

    // Lords and their respective parts for Gulika, Kaala, Mrityu, Yamaghantaka, Ardhaprahara
    // Day Lord Index
    const dLord = dayOfWeek;
    const nFirstLord = (dayOfWeek + 4) % 7;
    const startLord = isDay ? dLord : nFirstLord;

    const getLordPart = (targetLord: number) => ((targetLord - startLord + 7) % 7) + 1;

    // Saturn -> Gulika
    // Sun -> Kaala
    // Mars -> Mrityu
    // Jupiter -> Yamaghantaka
    // Mercury -> Ardhaprahara
    
    const timeUpagrahas = [
      { name: 'Gulika', hindiName: 'गुलिका', lord: 6, desc: 'Son of Saturn. Most malefic time-point. Crucial for longevity and karma.' },
      { name: 'Mandi', hindiName: 'मांदी', lord: 6, isMandi: true, desc: 'Often equated with Gulika, but calculated at the end of Saturn part in some traditions.' },
      { name: 'Kaala', hindiName: 'काल', lord: 0, desc: 'Son of Sun. Indicates timing of results and karmic deadlines.' },
      { name: 'Mrityu', hindiName: 'मृत्यु', lord: 2, desc: 'Son of Mars. Signifies danger, accidents and sudden death.' },
      { name: 'Yamaghantaka', hindiName: 'यमघंटक', lord: 4, desc: 'Son of Jupiter. Often beneficial but indicates finality of actions.' },
      { name: 'Ardhaprahara', hindiName: 'अर्धप्रहर', lord: 3, desc: 'Son of Mercury. Signifies business fluctuations and mental stress.' }
    ];

    return timeUpagrahas.map(u => {
      const part = getLordPart(u.lord);
      let upaTime = getPartStartTime(part);
      if (u.isMandi) upaTime += (partDuration / 2); // Mandi is often midpoint or end; let's use midpoint for distinction
      
      const long = getRisingDegree(upaTime);
      return {
        name: u.name,
        hindiName: u.hindiName,
        longitude: long,
        rashi: Math.floor(long / 30) + 1,
        rashiName: this.RASHI_NAMES[Math.floor(long / 30)],
        degree: long % 30,
        house: this.getHouse(long, lagnaLong),
        type: 'Time-Based',
        description: u.desc
      };
    });
  }
}
