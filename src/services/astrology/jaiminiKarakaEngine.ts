import { MasterKundliData, PlanetData } from '../../types/kundli';
import { VargaEngine } from '../jyotish/vargaEngine';

export type CharaKarakaType = 'AK' | 'AmK' | 'BK' | 'MK' | 'PiK' | 'PK' | 'GK' | 'DK';

export interface CharaKarakaInfo {
  type: CharaKarakaType;
  fullName: string;
  planet: string;
  degree: number;
  sign: number;
  signName: string;
}

export interface JaiminiAnalysisResult {
  charaKarakas7: CharaKarakaInfo[];
  charaKarakas8: CharaKarakaInfo[];
  karakamshaLagna: {
    rashi: number;
    rashiName: string;
    atmakaraka: string;
  };
  karakamshaResults: string[];
}

export class JaiminiKarakaEngine {
  private static readonly KARAKA_NAMES: Record<CharaKarakaType, string> = {
    AK: 'Atmakaraka (Self/Soul)',
    AmK: 'Amatyakaraka (Career/Advisor)',
    BK: 'Bhratrikaraka (Siblings/Guru)',
    MK: 'Matrikaraka (Mother/Home)',
    PiK: 'Pitrikaraka (Father)',
    PK: 'Putrakaraka (Children/Creativity)',
    GK: 'Gnatikaraka (Enemies/Relatives)',
    DK: 'Darakaraka (Spouse/Partners)'
  };

  private static readonly RASHI_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  static calculate(data: MasterKundliData): JaiminiAnalysisResult {
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];
    const planetDataList = planets.map(p => ({ name: p, data: data.planets[p] })).filter(p => p.data);

    // 7 Karakas (Excluding Rahu)
    const sorted7 = [...planetDataList]
      .filter(p => p.name !== 'Rahu')
      .sort((a, b) => {
        const degA = a.data!.degree;
        const degB = b.data!.degree;
        return degB - degA; // Descending order
      });

    // 8 Karakas (Including Rahu)
    // Rahu's degree is often reversed in Jaimini (30 - degree) as it moves retrograde, 
    // but many traditions just use the direct degree. Jagannatha Hora uses (30 - degree) for Rahu.
    const sorted8 = [...planetDataList]
      .map(p => {
        let effectiveDegree = p.data!.degree;
        if (p.name === 'Rahu') {
          effectiveDegree = 30 - p.data!.degree;
        }
        return { ...p, effectiveDegree };
      })
      .sort((a, b) => b.effectiveDegree - a.effectiveDegree);

    const karakas7: CharaKarakaInfo[] = this.mapToKarakas(sorted7, 7);
    const karakas8: CharaKarakaInfo[] = this.mapToKarakas(sorted8, 8);

    // Atmakaraka (AK) is the first in sorted list
    const ak7 = sorted7[0];
    const ak8 = sorted8[0];
    
    // Karakamsha: AK's position in D9
    // We'll use AK from 8-karaka system as primary if available, else 7
    const primaryAK = ak8 || ak7;
    const akLong = primaryAK.data!.siderealLongitude || (primaryAK.data!.rashi - 1) * 30 + primaryAK.data!.degree;
    const d9Sign = VargaEngine.getD9Sign(akLong);

    return {
      charaKarakas7: karakas7,
      charaKarakas8: karakas8,
      karakamshaLagna: {
        rashi: d9Sign,
        rashiName: this.RASHI_NAMES[d9Sign - 1],
        atmakaraka: primaryAK.name
      },
      karakamshaResults: this.getKarakamshaInterpretations(d9Sign, primaryAK.name)
    };
  }

  private static mapToKarakas(sorted: any[], count: number): CharaKarakaInfo[] {
    const types7: CharaKarakaType[] = ['AK', 'AmK', 'BK', 'MK', 'PK', 'GK', 'DK'];
    const types8: CharaKarakaType[] = ['AK', 'AmK', 'BK', 'MK', 'PiK', 'PK', 'GK', 'DK'];
    const types = count === 7 ? types7 : types8;

    return sorted.slice(0, count).map((p, index) => ({
      type: types[index],
      fullName: this.KARAKA_NAMES[types[index]],
      planet: p.name,
      degree: p.data.degree,
      sign: p.data.rashi,
      signName: p.data.rashiName
    }));
  }

  private static getKarakamshaInterpretations(rashi: number, ak: string): string[] {
    const results: string[] = [];
    results.push(`Your Karakamsha Lagna is ${this.RASHI_NAMES[rashi - 1]}, as your Atmakaraka (${ak}) is placed here in the Navamsha (D9) chart.`);
    
    // Brief classical results based on Karakamsha Sign
    const signResults: Record<number, string> = {
      1: 'Aries Karakamsha: Tendency towards leadership, but may face challenges from rats or cats (classical symbolism). High energy and pioneering spirit.',
      2: 'Taurus Karakamsha: Focus on happiness through domestic comforts, vehicles, and assets. Deep appreciation for beauty and stability.',
      3: 'Gemini Karakamsha: Propensity for skin issues or digestive sensitivities. Gifted in communication, arts, or trade.',
      4: 'Cancer Karakamsha: Water-related career or interests. Deeply emotional and intuitive nature. Potential success in shipping or marine areas.',
      5: 'Leo Karakamsha: Fear or challenges related to dogs or wild animals. Strong sense of self-respect and leadership qualities.',
      6: 'Virgo Karakamsha: Similar to Gemini, but with a more analytical or service-oriented focus. Skill in crafts and meticulous work.',
      7: 'Libra Karakamsha: Interest in trade, business, and diplomacy. Balance and harmony are key soul lessons.',
      8: 'Scorpio Karakamsha: Interest in occult, research, or investigative fields. Vulnerability to reptiles or sudden transformations.',
      9: 'Sagittarius Karakamsha: Higher learning, philosophy, and long-distance travel. A soul seeking truth and wisdom.',
      10: 'Capricorn Karakamsha: Success in administration, construction, or organizational fields. Disciplined and hardworking soul.',
      11: 'Aquarius Karakamsha: Philanthropic interests, innovation, and social networks. Interest in charitable works.',
      12: 'Pisces Karakamsha: Deep spirituality, liberation (Moksha) tendencies, and artistic creativity. Connection to the divine.'
    };

    if (signResults[rashi]) results.push(signResults[rashi]);
    results.push("The position of planets from Karakamsha determines the soul's desires and professional path in this lifetime.");
    
    return results;
  }
}
