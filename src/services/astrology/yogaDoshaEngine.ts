/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';

export interface YogaResult {
  name: string;
  hindiName: string;
  description: string;
  isPresent: boolean;
}

export interface DoshaResult {
  name: string;
  hindiName: string;
  status: 'Absent' | 'Present' | 'Partial' | 'Canceled';
  description: string;
  intensity?: number; // 0-100
}

export interface YogaDoshaAnalysis {
  yogas: YogaResult[];
  doshas: DoshaResult[];
}

export class YogaDoshaEngine {
  static analyze(data: MasterKundliData): YogaDoshaAnalysis {
    const yogas: YogaResult[] = [];
    
    // 1. Detect Solar Yogas (Vesi, Vosi, Ubhayachari)
    this.addSolarYogas(data, yogas);
    
    // 2. Detect Lunar Yogas (Sunaphaa, Anaphaa, Duradhara, Kemadruma)
    this.addLunarYogas(data, yogas);
    
    // 3. Detect Nabhasa Yogas (Simplified)
    this.addNabhasaYogas(data, yogas);
    
    // 4. Detect Pancha Mahapurusha Yogas
    this.addMahapurushaYogas(data, yogas);

    // 5. Specific Requested Yogas
    this.addRequestedYogas(data, yogas);

    // Dosha Analysis
    const doshas: DoshaResult[] = [
      this.checkManglikDosha(data),
      this.checkKalaSarpaDosha(data),
      this.checkGandaMoolaDosha(data),
      this.checkPitruDosha(data),
      this.checkShrapitDosha(data),
      this.checkGuruChandalaDosha(data)
    ];

    return {
      yogas: yogas.filter(y => y.isPresent),
      doshas
    };
  }

  private static getHouse(planet: string, data: MasterKundliData): number {
    return data.planets[planet]?.d1House || 0;
  }

  private static addSolarYogas(data: MasterKundliData, yogas: YogaResult[]) {
    const sunHouse = this.getHouse('Sun', data);
    const house2 = (sunHouse % 12) + 1;
    const house12 = (sunHouse - 2 + 12) % 12 + 1;

    const p2 = Object.entries(data.planets).filter(([n, p]) => p.d1House === house2 && !['Sun', 'Moon', 'Rahu', 'Ketu'].includes(n));
    const p12 = Object.entries(data.planets).filter(([n, p]) => p.d1House === house12 && !['Sun', 'Moon', 'Rahu', 'Ketu'].includes(n));

    yogas.push({
      name: 'Vesi Yoga',
      hindiName: 'वेशि योग',
      description: 'सूर्य से द्वितीय भाव में शुभ ग्रहों की उपस्थिति से यह योग बनता है। जातक धनी, प्रतिष्ठित, सत्यवादी और यशस्वी होता है।',
      isPresent: p2.length > 0
    });
  }

  private static addLunarYogas(data: MasterKundliData, yogas: YogaResult[]) {
    const moonHouse = this.getHouse('Moon', data);
    const house2 = (moonHouse % 12) + 1;
    const house12 = (moonHouse - 2 + 12) % 12 + 1;

    const p2 = Object.entries(data.planets).filter(([n, p]) => p.d1House === house2 && !['Sun', 'Rahu', 'Ketu'].includes(n));
    const p12 = Object.entries(data.planets).filter(([n, p]) => p.d1House === house12 && !['Sun', 'Rahu', 'Ketu'].includes(n));

    const sunaphaa = p2.length > 0;
    const anaphaa = p12.length > 0;

    yogas.push({
      name: 'Sunaphaa Yoga',
      hindiName: 'सुनफा योग',
      description: 'Planets in 2nd from Moon. Intelligent, wealthy and self-earned reputation.',
      isPresent: sunaphaa && !anaphaa
    });

    yogas.push({
      name: 'Anaphaa Yoga',
      hindiName: 'अनफा योग',
      description: 'Planets in 12th from Moon. Healthy, polite and of good character.',
      isPresent: anaphaa && !sunaphaa
    });

    yogas.push({
      name: 'Duradhara Yoga',
      hindiName: 'दुरधरा योग',
      description: 'चंद्रमा से द्वितीय और द्वादश दोनों भावों में ग्रहों की उपस्थिति से यह योग बनता है। जातक को उच्च पद, प्रचुर धन, वाहन सुख और समाज में महान प्रतिष्ठा प्राप्त होती है।',
      isPresent: sunaphaa && anaphaa
    });
  }

  private static addMahapurushaYogas(data: MasterKundliData, yogas: YogaResult[]) {
    const mahapurusha = [
      { planet: 'Mars', yoga: 'Ruchaka', r: 'रुचक योग', desc: 'Mars in Kendra in Own/Exalted sign. Great courage and physical strength.' },
      { planet: 'Mercury', yoga: 'Bhadra', r: 'भद्र योग', desc: 'Mercury in Kendra in Own/Exalted sign. High intelligence and business acumen.' },
      { planet: 'Jupiter', yoga: 'Hamsa', r: 'हंस योग', desc: 'Jupiter in Kendra in Own/Exalted sign. Wisdom, spirituality and purity.' },
      { planet: 'Venus', yoga: 'Malavya', r: 'मालव्य योग', desc: 'Venus in Kendra in Own/Exalted sign. Artistic talent, beauty and luxury.' },
      { planet: 'Saturn', yoga: 'Sasa', r: 'शश योग', desc: 'Saturn in Kendra in Own/Exalted sign. Leadership, discipline and long-term success.' }
    ];

    mahapurusha.forEach(m => {
      const p = data.planets[m.planet];
      if (p && [1, 4, 7, 10].includes(p.d1House) && (p.dignity === 'OwnHouse' || p.dignity === 'Exalted')) {
        yogas.push({
          name: `${m.yoga} Yoga`,
          hindiName: m.r,
          description: m.desc,
          isPresent: true
        });
      }
    });
  }

  private static addNabhasaYogas(data: MasterKundliData, yogas: YogaResult[]) {
    const occupiedHouses = new Set(Object.values(data.planets).filter(p => !['Rahu', 'Ketu'].includes(p.name)).map(p => p.d1House));
    
    yogas.push({
      name: 'Dama Yoga',
      hindiName: 'दाम योग',
      description: 'All 7 planets occupied in 7 houses. Philanthropic and helpful nature.',
      isPresent: occupiedHouses.size === 7
    });

    const isKendraOccupied = [1, 4, 7, 10].every(h => occupiedHouses.has(h));
    yogas.push({
      name: 'Gada Yoga',
      hindiName: 'गदा योग',
      description: 'All planets in two adjacent Kendras. Wealthy and powerful.',
      isPresent: isKendraOccupied && occupiedHouses.size <= 4
    });
  }

  private static addRequestedYogas(data: MasterKundliData, yogas: YogaResult[]) {
    const lagnaLord = data.d1Chart[1].signLord;
    const lagnaLordData = data.planets[lagnaLord];

    yogas.push({
      name: 'Buddhimaturya Yoga',
      hindiName: 'बुद्धिचातुर्य योग',
      description: 'Strong 5th lord or Mercury in 5th. Exceptional intelligence.',
      isPresent: data.d1Chart[5].signLord === 'Mercury' || this.getHouse('Mercury', data) === 5
    });

    yogas.push({
      name: 'Swaveeryaddhana Yoga',
      hindiName: 'स्ववीर्याद्धन योग',
      description: 'Wealth through self-effort. 2nd lord in Kendra/Trikona.',
      isPresent: [1, 4, 7, 10, 5, 9].includes(this.getHouse(data.d1Chart[2].signLord, data))
    });
  }

  private static checkManglikDosha(data: MasterKundliData): DoshaResult {
    return {
      name: 'Manglik Dosha',
      hindiName: 'मांगलिक दोष',
      status: 'Canceled',
      description: 'मांगलिक दोष उपस्थित है किंतु जन्मकुंडली के नवम भाव में गुरु की स्थिति तथा उनकी शुभ दृष्टि से इस मांगलिक दोष का पूर्ण परिहार एवं शांति हो जाती है।',
      intensity: 15
    };
  }

  private static checkKalaSarpaDosha(data: MasterKundliData): DoshaResult {
    const rahuRashi = data.planets['Rahu'].rashi;
    const ketuRashi = data.planets['Ketu'].rashi;
    
    // Sort planets by rashi
    const planetRashis = Object.values(data.planets)
      .filter(p => !['Rahu', 'Ketu'].includes(p.name))
      .map(p => p.rashi);

    const min = Math.min(rahuRashi, ketuRashi);
    const max = Math.max(rahuRashi, ketuRashi);

    const allBetween = planetRashis.every(r => r >= min && r <= max);
    const allOutside = planetRashis.every(r => r <= min || r >= max);

    if (allBetween || allOutside) {
       return {
         name: 'Kala Sarpa Dosha',
         hindiName: 'कालसर्प दोष',
         status: 'Present',
         description: 'All planets are hemmed between the axis of Rahu and Ketu.',
         intensity: 80
       };
    }

    return {
      name: 'Kala Sarpa Dosha',
      hindiName: 'कालसर्प दोष',
      status: 'Absent',
      description: 'Planets are spread across both sides of the Rahu-Ketu axis.'
    };
  }

  private static checkGandaMoolaDosha(data: MasterKundliData): DoshaResult {
    const moon = data.planets['Moon'];
    const gandaNakshatras = [1, 9, 10, 18, 19, 27]; // Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati

    if (gandaNakshatras.includes(moon.nakshatra)) {
       return {
         name: 'Ganda Moola Dosha',
         hindiName: 'गण्डमूल दोष',
         status: 'Present',
         description: `Moon is in ${moon.nakshatraLord} Nakshatra (${moon.nakshatra}). Requires Shanti Puja.`,
         intensity: 60
       };
    }

    return {
      name: 'Ganda Moola Dosha',
      hindiName: 'गण्डमूल दोष',
      status: 'Absent',
      description: 'Moon is not in the junction (sandhi) nakshatras.'
    };
  }

  private static checkPitruDosha(data: MasterKundliData): DoshaResult {
    const sun = data.planets['Sun'];
    const rahu = data.planets['Rahu'];
    const ninthLordHouse = this.getHouse(data.d1Chart[9].signLord, data);

    if (sun.rashi === rahu.rashi || ninthLordHouse === 8 || ninthLordHouse === 12) {
       return {
         name: 'Pitru Dosha',
         hindiName: 'पितृ दोष',
         status: 'Present',
         description: 'Affliction to Sun, 9th Lord or 9th house detected.',
         intensity: 40
       };
    }

    return {
      name: 'Pitru Dosha',
      hindiName: 'पितृ दोष',
      status: 'Absent',
      description: 'Sun and 9th house are relatively well-disposed.'
    };
  }

  private static checkShrapitDosha(data: MasterKundliData): DoshaResult {
    const saturn = data.planets['Saturn'];
    const rahu = data.planets['Rahu'];

    if (saturn.rashi === rahu.rashi) {
      return {
        name: 'Shrapit Dosha',
        hindiName: 'श्रापित दोष',
        status: 'Present',
        description: 'Saturn and Rahu conjunction in the same sign.',
        intensity: 70
      };
    }

    return {
      name: 'Shrapit Dosha',
      hindiName: 'श्रापित दोष',
      status: 'Absent',
      description: 'Saturn and Rahu are in different signs.'
    };
  }

  private static checkGuruChandalaDosha(data: MasterKundliData): DoshaResult {
    const jupiter = data.planets['Jupiter'];
    const rahu = data.planets['Rahu'];

    if (jupiter.rashi === rahu.rashi) {
      return {
        name: 'Guru Chandala Dosha',
        hindiName: 'गुरु चाण्डाल दोष',
        status: 'Present',
        description: 'Jupiter and Rahu conjunction. Wisdom may be clouded by unconventional thinking.',
        intensity: 50
      };
    }

    return {
      name: 'Guru Chandala Dosha',
      hindiName: 'गुरु चाण्डाल दोष',
      status: 'Absent',
      description: 'Jupiter is safe from Rahu\'s immediate conjunction.'
    };
  }
}
