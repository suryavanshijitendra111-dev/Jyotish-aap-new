import { MasterKundliData } from '../../types/kundli';
import { RuleEngine } from '../../types/systemRegistry';

export interface VargaPlanet {
  planet: string;
  [key: string]: any;
}

export interface VargaAnalysisResult {
  status: 'AVAILABLE' | 'NOT_AVAILABLE';
  planets: VargaPlanet[];
  ascendantVargas: Record<string, number | null>;
}

export class VargaEngine implements RuleEngine<VargaAnalysisResult> {
  // D2 - Hora (Wealth & Assets)
  static getD2Sign(longitude: number, isOddSign: boolean): number {
    const degreeInSign = longitude % 30;
    if (isOddSign) {
      return degreeInSign < 15 ? 5 : 4; // Sun (Leo) / Moon (Cancer)
    } else {
      return degreeInSign < 15 ? 4 : 5; // Moon (Cancer) / Sun (Leo)
    }
  }

  // D3 - Drekkana (Siblings & Vitality)
  static getD3Sign(longitude: number): number {
    const sign = Math.floor(longitude / 30) + 1;
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 3 / 30), 2);
    if (part === 0) return sign;
    if (part === 1) return ((sign + 4 - 1) % 12) + 1;
    return ((sign + 8 - 1) % 12) + 1;
  }

  // D4 - Chaturthamsha (Fixed Assets & Fortune)
  static getD4Sign(longitude: number): number {
    const sign = Math.floor(longitude / 30) + 1;
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 4 / 30), 3);
    if (part === 0) return sign;
    if (part === 1) return ((sign + 3 - 1) % 12) + 1;
    if (part === 2) return ((sign + 6 - 1) % 12) + 1;
    return ((sign + 9 - 1) % 12) + 1;
  }

  // D7 - Saptamsha (Progeny & Children)
  static getD7Sign(longitude: number, isOddSign: boolean): number {
    const sign = Math.floor(longitude / 30) + 1;
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 7 / 30), 6);
    if (isOddSign) {
      return ((sign + part - 1) % 12) + 1;
    } else {
      return ((sign + 6 + part - 1) % 12) + 1;
    }
  }

  // D9 - Navamsha (Dharma, Spouse & Inner Strength)
  static getD9Sign(longitude: number): number {
    const degreeInSign = longitude % 30;
    const sign = Math.floor(longitude / 30) + 1;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 9 / 30), 8);
    const triplicity = (sign - 1) % 4; // 0=Fire(1), 1=Earth(10), 2=Air(7), 3=Water(4)
    const startSigns = [1, 10, 7, 4];
    const startSign = startSigns[triplicity];
    return ((startSign + part - 1) % 12) + 1;
  }

  // D10 - Dasamsha (Career & Status)
  static getD10Sign(longitude: number, isOddSign: boolean): number {
    const sign = Math.floor(longitude / 30) + 1;
    const degreeInSign = longitude % 30;
    const dasamshaIndex = Math.min(Math.floor((degreeInSign + 1e-10) * 10 / 30), 9);
    if (isOddSign) {
      return ((sign + dasamshaIndex - 1) % 12) + 1;
    } else {
      return ((sign + 8 + dasamshaIndex - 1) % 12) + 1;
    }
  }

  // D12 - Dwadashamsha (Parents & Lineage)
  static getD12Sign(longitude: number): number {
    const sign = Math.floor(longitude / 30) + 1;
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 12 / 30), 11);
    return ((sign + part - 1) % 12) + 1;
  }

  // D16 - Shodashamsha (Vehicles, Pleasures & Travel)
  // BPHS Ch. 6, Shloka 15-16: Chara -> Aries (1), Sthira -> Leo (5), Dwiswabhava -> Sagittarius (9)
  static getD16Sign(longitude: number): number {
    const sign = Math.floor(longitude / 30) + 1;
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 16 / 30), 15);
    const rashiNature = (sign - 1) % 3; // 0 = Chara, 1 = Sthira, 2 = Dwiswabhava
    const startSign = rashiNature === 0 ? 1 : rashiNature === 1 ? 5 : 9;
    return ((startSign + part - 1) % 12) + 1;
  }

  // D20 - Vimshamsha (Spiritual Progress & Worship)
  // BPHS Ch. 6, Shloka 17-19: Chara -> Aries (1), Sthira -> Sagittarius (9), Dwiswabhava -> Leo (5)
  static getD20Sign(longitude: number): number {
    const sign = Math.floor(longitude / 30) + 1;
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 20 / 30), 19);
    const rashiNature = (sign - 1) % 3; // 0 = Chara, 1 = Sthira, 2 = Dwiswabhava
    const startSign = rashiNature === 0 ? 1 : rashiNature === 1 ? 9 : 5;
    return ((startSign + part - 1) % 12) + 1;
  }

  // D24 - Chaturvimshamsha / Siddhamsha (Higher Education & Intellect)
  // BPHS Ch. 6, Shloka 20: Odd signs -> Leo (5), Even signs -> Kanya (6) as specified
  static getD24Sign(longitude: number, isOddSign: boolean): number {
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 24 / 30), 23);
    const startSign = isOddSign ? 5 : 6;
    return ((startSign + part - 1) % 12) + 1;
  }

  // D27 - Saptavimshamsha / Bhamsha (Strength, Vitality & Nakshatra Padas)
  // BPHS Ch. 6, Shloka 22-23: Fire -> Aries (1), Earth -> Cancer (4), Air -> Libra (7), Water -> Capricorn (10)
  static getD27Sign(longitude: number): number {
    const sign = Math.floor(longitude / 30) + 1;
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 27 / 30), 26);
    const triplicity = (sign - 1) % 4; // 0 = Fire, 1 = Earth, 2 = Air, 3 = Water
    const startSign = (triplicity * 3) + 1;
    return ((startSign + part - 1) % 12) + 1;
  }

  // D30 - Trimshamsha (Misfortunes, Evils & Obstacles)
  static getD30Sign(longitude: number, isOddSign: boolean): number {
    const degreeInSign = longitude % 30;
    if (isOddSign) {
      if (degreeInSign < 5) return 1; // Mars
      if (degreeInSign < 10) return 11; // Saturn
      if (degreeInSign < 18) return 9; // Jupiter
      if (degreeInSign < 25) return 3; // Mercury
      return 7; // Venus
    } else {
      if (degreeInSign < 5) return 2; // Venus
      if (degreeInSign < 12) return 6; // Mercury
      if (degreeInSign < 20) return 12; // Jupiter
      if (degreeInSign < 25) return 10; // Saturn
      return 8; // Mars
    }
  }

  // D40 - Khavedamsha (Auspicious & Inauspicious Events, Maternal Lineage)
  // BPHS Ch. 6, Shloka 24-25: Odd signs -> Aries (1), Even signs -> Libra (7)
  static getD40Sign(longitude: number, isOddSign: boolean): number {
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 40 / 30), 39);
    const startSign = isOddSign ? 1 : 7;
    return ((startSign + part - 1) % 12) + 1;
  }

  // D45 - Akshavedamsha (General Indications & Character, Paternal Legacy)
  // BPHS Ch. 6, Shloka 26-27: Chara -> Aries (1), Sthira -> Leo (5), Dwiswabhava -> Sagittarius (9)
  static getD45Sign(longitude: number): number {
    const sign = Math.floor(longitude / 30) + 1;
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 45 / 30), 44);
    const rashiNature = (sign - 1) % 3; // 0 = Chara, 1 = Sthira, 2 = Dwiswabhava
    const startSign = rashiNature === 0 ? 1 : rashiNature === 1 ? 5 : 9;
    return ((startSign + part - 1) % 12) + 1;
  }

  // D60 - Shashtiamsha (Past Life Karma & Root Destiny)
  static getD60Sign(longitude: number): number {
    const sign = Math.floor(longitude / 30) + 1;
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * 60 / 30), 59);
    return ((sign + part - 1) % 12) + 1;
  }

  // Generic harmonic Varga calculation for any division N from 1 to 145
  static getGenericVargaSign(longitude: number, n: number): number {
    if (n <= 1) return Math.floor(longitude / 30) + 1;
    const sign = Math.floor(longitude / 30); // 0-11
    const degreeInSign = longitude % 30;
    const part = Math.min(Math.floor((degreeInSign + 1e-10) * n / 30), n - 1);
    const totalPart = sign * n + part;
    return (totalPart % 12) + 1;
  }

  // Universal helper to get Varga Sign for any varga key and longitude (D1 to D145)
  static getVargaSign(vKey: string, longitude: number): number {
    const isOdd = (Math.floor(longitude / 30) + 1) % 2 !== 0;
    const upper = vKey.toUpperCase();
    if (upper.startsWith('D')) {
      const n = parseInt(upper.substring(1));
      if (!isNaN(n) && n >= 1 && n <= 145) {
        switch (n) {
          case 1: return Math.floor(longitude / 30) + 1;
          case 2: return VargaEngine.getD2Sign(longitude, isOdd);
          case 3: return VargaEngine.getD3Sign(longitude);
          case 4: return VargaEngine.getD4Sign(longitude);
          case 7: return VargaEngine.getD7Sign(longitude, isOdd);
          case 9: return VargaEngine.getD9Sign(longitude);
          case 10: return VargaEngine.getD10Sign(longitude, isOdd);
          case 12: return VargaEngine.getD12Sign(longitude);
          case 16: return VargaEngine.getD16Sign(longitude);
          case 20: return VargaEngine.getD20Sign(longitude);
          case 24: return VargaEngine.getD24Sign(longitude, isOdd);
          case 27: return VargaEngine.getD27Sign(longitude);
          case 30: return VargaEngine.getD30Sign(longitude, isOdd);
          case 40: return VargaEngine.getD40Sign(longitude, isOdd);
          case 45: return VargaEngine.getD45Sign(longitude);
          case 60: return VargaEngine.getD60Sign(longitude);
          default: return VargaEngine.getGenericVargaSign(longitude, n);
        }
      }
    }
    return VargaEngine.getD9Sign(longitude);
  }

  evaluate(data: MasterKundliData): VargaAnalysisResult {
    const planets: VargaPlanet[] = [];
    const validPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    
    for (const p of validPlanets) {
      const pd = data.planets[p];
      if (pd) {
        const pLong = pd.siderealLongitude ?? (pd.rashi != null ? (pd.rashi - 1) * 30 + (pd.degree || 0) : null);
        if (pLong != null) {
          const planetObj: VargaPlanet = { planet: p };
          for (let n = 1; n <= 145; n++) {
            planetObj[`d${n}Sign`] = VargaEngine.getVargaSign(`D${n}`, pLong);
          }
          planets.push(planetObj);
        }
      }
    }

    const ascendantVargas: Record<string, number | null> = {};
    const lagnaLong = data.lagna?.siderealLongitude ?? (data.lagna?.rashi != null ? (data.lagna.rashi - 1) * 30 + (data.lagna.degree || 0) : null);
    if (lagnaLong != null) {
      for (let n = 1; n <= 145; n++) {
        ascendantVargas[`D${n}`] = VargaEngine.getVargaSign(`D${n}`, lagnaLong);
      }
    }

    return {
      status: 'AVAILABLE',
      planets,
      ascendantVargas
    };
  }
}
