import { MasterKundliData } from '../../types/kundli';
import { RuleEngine } from '../../types/systemRegistry';

export interface VargaPlanet {
  planet: string;
  d1Sign?: number;
  d2Sign: number;
  d3Sign: number;
  d4Sign: number;
  d7Sign: number;
  d9Sign: number;
  d10Sign: number;
  d12Sign: number;
  d16Sign: number;
  d20Sign: number;
  d24Sign: number;
  d27Sign: number;
  d30Sign: number;
  d40Sign: number;
  d45Sign: number;
  d60Sign: number;
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

  // Universal helper to get Varga Sign for any varga key and longitude
  static getVargaSign(vKey: string, longitude: number): number {
    const isOdd = (Math.floor(longitude / 30) + 1) % 2 !== 0;
    switch (vKey) {
      case 'D1': return Math.floor(longitude / 30) + 1;
      case 'D2': return VargaEngine.getD2Sign(longitude, isOdd);
      case 'D3': return VargaEngine.getD3Sign(longitude);
      case 'D4': return VargaEngine.getD4Sign(longitude);
      case 'D7': return VargaEngine.getD7Sign(longitude, isOdd);
      case 'D9': return VargaEngine.getD9Sign(longitude);
      case 'D10': return VargaEngine.getD10Sign(longitude, isOdd);
      case 'D12': return VargaEngine.getD12Sign(longitude);
      case 'D16': return VargaEngine.getD16Sign(longitude);
      case 'D20': return VargaEngine.getD20Sign(longitude);
      case 'D24': return VargaEngine.getD24Sign(longitude, isOdd);
      case 'D27': return VargaEngine.getD27Sign(longitude);
      case 'D30': return VargaEngine.getD30Sign(longitude, isOdd);
      case 'D40': return VargaEngine.getD40Sign(longitude, isOdd);
      case 'D45': return VargaEngine.getD45Sign(longitude);
      case 'D60': return VargaEngine.getD60Sign(longitude);
      default: return VargaEngine.getD9Sign(longitude);
    }
  }

  evaluate(data: MasterKundliData): VargaAnalysisResult {
    const planets: VargaPlanet[] = [];
    const validPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    
    for (const p of validPlanets) {
      const pd = data.planets[p];
      if (pd) {
        const pLong = pd.siderealLongitude ?? (pd.rashi != null ? (pd.rashi - 1) * 30 + (pd.degree || 0) : null);
        if (pLong != null) {
          const isOdd = (Math.floor(pLong / 30) + 1) % 2 !== 0;
          planets.push({
            planet: p,
            d1Sign: Math.floor(pLong / 30) + 1,
            d2Sign: VargaEngine.getD2Sign(pLong, isOdd),
            d3Sign: VargaEngine.getD3Sign(pLong),
            d4Sign: VargaEngine.getD4Sign(pLong),
            d7Sign: VargaEngine.getD7Sign(pLong, isOdd),
            d9Sign: VargaEngine.getD9Sign(pLong),
            d10Sign: VargaEngine.getD10Sign(pLong, isOdd),
            d12Sign: VargaEngine.getD12Sign(pLong),
            d16Sign: VargaEngine.getD16Sign(pLong),
            d20Sign: VargaEngine.getD20Sign(pLong),
            d24Sign: VargaEngine.getD24Sign(pLong, isOdd),
            d27Sign: VargaEngine.getD27Sign(pLong),
            d30Sign: VargaEngine.getD30Sign(pLong, isOdd),
            d40Sign: VargaEngine.getD40Sign(pLong, isOdd),
            d45Sign: VargaEngine.getD45Sign(pLong),
            d60Sign: VargaEngine.getD60Sign(pLong)
          });
        }
      }
    }

    const ascendantVargas: Record<string, number | null> = {
      D1: null, D2: null, D3: null, D4: null, D7: null, D9: null, D10: null, D12: null,
      D16: null, D20: null, D24: null, D27: null, D30: null, D40: null, D45: null, D60: null
    };

    const lagnaLong = data.lagna?.siderealLongitude ?? (data.lagna?.rashi != null ? (data.lagna.rashi - 1) * 30 + (data.lagna.degree || 0) : null);
    if (lagnaLong != null) {
      const isOdd = (Math.floor(lagnaLong / 30) + 1) % 2 !== 0;
      ascendantVargas.D1 = Math.floor(lagnaLong / 30) + 1;
      ascendantVargas.D2 = VargaEngine.getD2Sign(lagnaLong, isOdd);
      ascendantVargas.D3 = VargaEngine.getD3Sign(lagnaLong);
      ascendantVargas.D4 = VargaEngine.getD4Sign(lagnaLong);
      ascendantVargas.D7 = VargaEngine.getD7Sign(lagnaLong, isOdd);
      ascendantVargas.D9 = VargaEngine.getD9Sign(lagnaLong);
      ascendantVargas.D10 = VargaEngine.getD10Sign(lagnaLong, isOdd);
      ascendantVargas.D12 = VargaEngine.getD12Sign(lagnaLong);
      ascendantVargas.D16 = VargaEngine.getD16Sign(lagnaLong);
      ascendantVargas.D20 = VargaEngine.getD20Sign(lagnaLong);
      ascendantVargas.D24 = VargaEngine.getD24Sign(lagnaLong, isOdd);
      ascendantVargas.D27 = VargaEngine.getD27Sign(lagnaLong);
      ascendantVargas.D30 = VargaEngine.getD30Sign(lagnaLong, isOdd);
      ascendantVargas.D40 = VargaEngine.getD40Sign(lagnaLong, isOdd);
      ascendantVargas.D45 = VargaEngine.getD45Sign(lagnaLong);
      ascendantVargas.D60 = VargaEngine.getD60Sign(lagnaLong);
    }

    return {
      status: 'AVAILABLE',
      planets,
      ascendantVargas
    };
  }
}
