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
  remedy?: string;
}

export interface YogaDoshaAnalysis {
  yogas: YogaResult[];
  doshas: DoshaResult[];
}

export class YogaDoshaEngine {
  static analyze(data: MasterKundliData): YogaDoshaAnalysis {
    const yogas: YogaResult[] = [];
    
    // 1. Pancha Mahapurusha Yogas
    this.addMahapurushaYogas(data, yogas);

    // 2. Raja Yogas (Kendra-Trikona connection)
    this.addRajaYogas(data, yogas);

    // 3. Dhana Yogas (2, 5, 9, 11 lords connection)
    this.addDhanaYogas(data, yogas);

    // 4. Gajakesari, Budhaditya, Chandra-Mangal Yogas
    this.addConjunctionAspectYogas(data, yogas);

    // 5. Lunar & Solar Yogas
    this.addSolarYogas(data, yogas);
    this.addLunarYogas(data, yogas);

    // Dosha Analysis
    const doshas: DoshaResult[] = [
      this.checkManglikDosha(data),
      this.checkKalaSarpaDosha(data),
      this.checkSadeSatiDhaiya(data),
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

  private static addMahapurushaYogas(data: MasterKundliData, yogas: YogaResult[]) {
    const mahapurusha = [
      { planet: 'Mars', yoga: 'Ruchaka Yoga', r: 'रुचक योग', desc: 'Mars is placed in a Kendra (1, 4, 7, 10) in its Own or Exalted sign (Aries, Scorpio, Capricorn). Grants exceptional courage, leadership, and physical prowess.' },
      { planet: 'Mercury', yoga: 'Bhadra Yoga', r: 'भद्र योग', desc: 'Mercury is placed in a Kendra in Gemini or Virgo. Grants sharp intellect, eloquence, business genius, and administrative acumen.' },
      { planet: 'Jupiter', yoga: 'Hamsa Yoga', r: 'हंस योग', desc: 'Jupiter is placed in a Kendra in Cancer, Sagittarius, or Pisces. Grants supreme wisdom, spiritual purity, noble character, and respect in society.' },
      { planet: 'Venus', yoga: 'Malavya Yoga', r: 'मालव्य योग', desc: 'Venus is placed in a Kendra in Taurus, Libra, or Pisces. Grants refined artistic tastes, luxurious comforts, marital harmony, and charm.' },
      { planet: 'Saturn', yoga: 'Sasa Yoga', r: 'शश योग', desc: 'Saturn is placed in a Kendra in Libra, Capricorn, or Aquarius. Grants immense discipline, authority, political or administrative success, and longevity.' }
    ];

    mahapurusha.forEach(m => {
      const p = data.planets[m.planet];
      if (p && [1, 4, 7, 10].includes(p.d1House) && (p.dignity === 'OwnHouse' || p.dignity === 'Exalted')) {
        yogas.push({
          name: m.yoga,
          hindiName: m.r,
          description: m.desc,
          isPresent: true
        });
      }
    });
  }

  private static addRajaYogas(data: MasterKundliData, yogas: YogaResult[]) {
    const kendraLords = [1, 4, 7, 10].map(h => data.d1Chart[h]?.signLord);
    const trikonaLords = [1, 5, 9].map(h => data.d1Chart[h]?.signLord);

    const hasRajaYoga = kendraLords.some(kl => trikonaLords.includes(kl) && kl !== data.d1Chart[1]?.signLord);
    const hasConjunction = [1, 4, 5, 7, 9, 10].some(h => {
      const occupants = Object.values(data.planets).filter(p => p.d1House === h).map(p => p.name);
      return occupants.length >= 2 && occupants.some(o => kendraLords.includes(o)) && occupants.some(o => trikonaLords.includes(o));
    });

    yogas.push({
      name: 'Raja Yoga',
      hindiName: 'राज योग (केंद्र-त्रिकोण संबंध)',
      description: 'केंद्र (1, 4, 7, 10) और त्रिकोण (1, 5, 9) के स्वामियों के मध्य युति या संबंध से राज योग बनता है। यह जातक को उच्च पद, अधिकार, मान-सम्मान और जीवन में अपार सफलता प्रदान करता है।',
      isPresent: hasRajaYoga || hasConjunction
    });
  }

  private static addDhanaYogas(data: MasterKundliData, yogas: YogaResult[]) {
    const lord2 = data.d1Chart[2]?.signLord;
    const lord11 = data.d1Chart[11]?.signLord;
    const house2 = this.getHouse(lord2, data);
    const house11 = this.getHouse(lord11, data);

    const isDhana = [2, 5, 9, 11].includes(house2) || [2, 5, 9, 11].includes(house11) || house2 === house11;

    yogas.push({
      name: 'Dhana Yoga',
      hindiName: 'धन योग',
      description: 'द्वितीय और एकादश भावों के स्वामियों का शुभ स्थानों (2, 5, 9, 11) में स्थित होना या परस्पर संबंध धन योग का निर्माण करता है। इससे जातक को निरंतर आर्थिक समृद्धि और धन लाभ प्राप्त होता है।',
      isPresent: isDhana
    });
  }

  private static addConjunctionAspectYogas(data: MasterKundliData, yogas: YogaResult[]) {
    const jupiterHouse = this.getHouse('Jupiter', data);
    const moonHouse = this.getHouse('Moon', data);
    const isGajakesari = Math.abs(jupiterHouse - moonHouse) % 3 === 0 || jupiterHouse === moonHouse || [1, 4, 7, 10].includes((Math.abs(jupiterHouse - moonHouse) % 12) + 1);

    yogas.push({
      name: 'Gajakesari Yoga',
      hindiName: 'गजकेसरी योग',
      description: 'चंद्रमा से केंद्र में गुरु की स्थिति होने पर गजकेसरी योग बनता है। यह योग जातक को बुद्धिमान, ख्याति प्राप्त, शत्रुओं पर विजयी और जीवन में उच्च प्रतिष्ठा प्रदान करता है।',
      isPresent: isGajakesari
    });

    const sunHouse = this.getHouse('Sun', data);
    const mercuryHouse = this.getHouse('Mercury', data);
    const isBudhaditya = sunHouse === mercuryHouse;

    yogas.push({
      name: 'Budhaditya Yoga',
      hindiName: 'बुधदित्य योग',
      description: 'सूर्य और बुध की युति से बुधदित्य योग बनता है। जातक तीव्र बुद्धि, उत्कृष्ट वक्ता, तार्किक और उच्च शिक्षा या कला में निपुण होता है।',
      isPresent: isBudhaditya
    });

    const marsHouse = this.getHouse('Mars', data);
    const isChandraMangal = moonHouse === marsHouse;

    yogas.push({
      name: 'Chandra-Mangal Yoga',
      hindiName: 'चंद्र-मंगल योग',
      description: 'चंद्रमा और मंगल की युति या दृष्टि से यह योग बनता है। जातक अपने परिश्रम से संपत्ति अर्जित करने वाला, साहसी और व्यवसाय में विशेष उन्नति करने वाला होता है।',
      isPresent: isChandraMangal
    });
  }

  private static addSolarYogas(data: MasterKundliData, yogas: YogaResult[]) {
    const sunHouse = this.getHouse('Sun', data);
    const house2 = (sunHouse % 12) + 1;
    const p2 = Object.entries(data.planets).filter(([n, p]) => p.d1House === house2 && !['Sun', 'Moon', 'Rahu', 'Ketu'].includes(n));

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
      description: 'चंद्रमा से दूसरे भाव में ग्रह होने पर सुनफा योग बनता है। जातक अपने पुरुषार्थ से धन कमाने वाला, बुद्धिमान और ख्याति प्राप्त होता है।',
      isPresent: sunaphaa && !anaphaa
    });

    yogas.push({
      name: 'Anaphaa Yoga',
      hindiName: 'अनफा योग',
      description: 'चंद्रमा से बारहवें भाव में ग्रह होने पर अनफा योग बनता है। जातक स्वस्थ, शिष्ट, अच्छे चरित्र वाला और सम्मानित होता है।',
      isPresent: anaphaa && !sunaphaa
    });

    yogas.push({
      name: 'Duradhara Yoga',
      hindiName: 'दुरधरा योग',
      description: 'चंद्रमा से द्वितीय और द्वादश दोनों भावों में ग्रहों की उपस्थिति से यह योग बनता है। जातक को उच्च पद, प्रचुर धन, वाहन सुख और समाज में महान प्रतिष्ठा प्राप्त होती है।',
      isPresent: sunaphaa && anaphaa
    });
  }

  private static checkManglikDosha(data: MasterKundliData): DoshaResult {
    const marsHouse = this.getHouse('Mars', data);
    const isManglikPosition = [1, 4, 7, 8, 12].includes(marsHouse);
    const jupiterHouse = this.getHouse('Jupiter', data);
    const isCanceled = [1, 4, 7, 10].includes(jupiterHouse) || [1, 5, 9].includes(jupiterHouse);

    let status: 'Absent' | 'Present' | 'Partial' | 'Canceled' = 'Absent';
    if (isManglikPosition) {
      status = isCanceled ? 'Canceled' : 'Present';
    } else {
      status = 'Absent';
    }

    return {
      name: 'Manglik Dosha',
      hindiName: 'मांगलिक दोष',
      status,
      description: isManglikPosition 
        ? (isCanceled 
            ? 'मंगल 1, 4, 7, 8 या 12 भाव में स्थित है किंतु गुरु की केंद्र/त्रिकोण में स्थिति के कारण इस मांगलिक दोष का शास्त्रीय परिहार (शांति) हो गया है।' 
            : 'मंगल लग्न से 1, 4, 7, 8 या 12वें भाव में स्थित है। वैवाहिक जीवन में सामंजस्य हेतु मंगलिक विचार आवश्यक है।')
        : 'मंगल दोष उपस्थित नहीं है (लग्न दृष्टि से सुरक्षित)।',
      intensity: isManglikPosition ? (isCanceled ? 20 : 65) : 0,
      remedy: 'प्रति मंगलवार हनुमान चालीसा का पाठ, सुंदरकांड पाठ तथा भात पूजा (उज्जैन) या कुंभ विवाह।'
    };
  }

  private static checkKalaSarpaDosha(data: MasterKundliData): DoshaResult {
    const rahuRashi = data.planets['Rahu']?.rashi || 1;
    const ketuRashi = data.planets['Ketu']?.rashi || 7;
    
    const planetRashis = Object.values(data.planets)
      .filter(p => !['Rahu', 'Ketu'].includes(p.name))
      .map(p => p.rashi);

    const min = Math.min(rahuRashi, ketuRashi);
    const max = Math.max(rahuRashi, ketuRashi);

    const allBetween = planetRashis.every(r => r >= min && r <= max);
    const allOutside = planetRashis.every(r => r <= min || r >= max);

    const isPresent = allBetween || allOutside;

    return {
      name: 'Kala Sarpa Dosha',
      hindiName: 'कालसर्प दोष',
      status: isPresent ? 'Present' : 'Absent',
      description: isPresent 
        ? 'सभी सातों ग्रह राहु-केतु के एक ही ओर अक्ष में केंद्रित हैं, जिससे कालसर्प योग बनता है। जीवन में संघर्ष के पश्चात सफलता मिलती है।' 
        : 'ग्रह राहु-केतु अक्ष के दोनों ओर वितरित हैं। कालसर्प दोष नहीं है।',
      intensity: isPresent ? 75 : 0,
      remedy: 'महामृत्युंजय मंत्र का नित्य जप, नागपंचमी पर कालसर्प शांति पूजा तथा त्र्यंबकेश्वर में अनुष्ठान।'
    };
  }

  private static checkSadeSatiDhaiya(data: MasterKundliData): DoshaResult {
    const saturnHouse = this.getHouse('Saturn', data);
    const moonHouse = this.getHouse('Moon', data);
    const diff = (saturnHouse - moonHouse + 12) % 12;

    let status: 'Absent' | 'Present' | 'Partial' = 'Absent';
    let desc = 'वर्तमान में शनि की साढ़े साती या ढैया का प्रभाव नहीं है।';

    if ([11, 0, 1].includes(diff)) {
      status = 'Present';
      desc = 'वर्तमान में शनि की साढ़े साती का प्रभाव चल रहा है (चंद्र राशि से 12वें, 1st या 2nd भाव में शनि गोचर)।';
    } else if ([3, 7].includes(diff)) {
      status = 'Partial';
      desc = 'वर्तमान में शनि की ढैया का प्रभाव चल रहा है (चंद्र राशि से 4थे या 8वें भाव में शनि गोचर)।';
    }

    return {
      name: 'Sade Sati / Dhaiya',
      hindiName: 'साढ़े साती / ढैया',
      status,
      description: desc,
      intensity: status === 'Present' ? 70 : (status === 'Partial' ? 45 : 0),
      remedy: 'शनिवार को सरसों के तेल का दीपक, हनुमान जी की उपासना और पीपल सेवा।'
    };
  }

  private static checkPitruDosha(data: MasterKundliData): DoshaResult {
    const sun = data.planets['Sun'];
    const rahu = data.planets['Rahu'];
    const isAfflicted = sun?.rashi === rahu?.rashi;

    return {
      name: 'Pitru Dosha',
      hindiName: 'पितृ दोष',
      status: isAfflicted ? 'Present' : 'Absent',
      description: isAfflicted ? 'सूर्य और राहु की युति से पितृ दोष बनता है। पितरों के निमित्त श्रद्धा और तर्पण आवश्यक है।' : 'सूर्य और 9वें भाव पर किसी प्रकार का तीव्र पितृ श्राप नहीं है।',
      intensity: isAfflicted ? 50 : 0,
      remedy: 'अमावस्या को पिंडदान, तर्पण तथा ब्राह्मण भोजन।'
    };
  }

  private static checkShrapitDosha(data: MasterKundliData): DoshaResult {
    const saturn = data.planets['Saturn'];
    const rahu = data.planets['Rahu'];
    const isAfflicted = saturn?.rashi === rahu?.rashi;

    return {
      name: 'Shrapit Dosha',
      hindiName: 'श्रापित दोष',
      status: isAfflicted ? 'Present' : 'Absent',
      description: isAfflicted ? 'शनि और राहु की युति से श्रापित दोष बनता है। कार्यों में विलंब और बाधाएं आ सकती हैं।' : 'शनि और राहु अलग-अलग राशियों में हैं। श्रापित दोष नहीं है।',
      intensity: isAfflicted ? 60 : 0,
      remedy: 'रुद्राभिषेक और शनिवार को शनि मंत्र का जप।'
    };
  }

  private static checkGuruChandalaDosha(data: MasterKundliData): DoshaResult {
    const jupiter = data.planets['Jupiter'];
    const rahu = data.planets['Rahu'];
    const isAfflicted = jupiter?.rashi === rahu?.rashi;

    return {
      name: 'Guru Chandala Dosha',
      hindiName: 'गुरु चाण्डाल योग',
      status: isAfflicted ? 'Present' : 'Absent',
      description: isAfflicted ? 'गुरु और राहु की युति से गुरु चाण्डाल योग बनता है। निर्णय लेने में विवेक और बड़ों का मार्गदर्शन आवश्यक है।' : 'गुरु राहु के प्रभाव से मुक्त हैं.',
      intensity: isAfflicted ? 55 : 0,
      remedy: 'गुरुवार का व्रत, पीली वस्तुओं का दान और विष्णु सहस्रनाम पाठ।'
    };
  }
}
