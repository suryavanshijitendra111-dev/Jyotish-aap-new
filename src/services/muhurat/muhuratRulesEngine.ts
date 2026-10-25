/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MUHURAT MODULE
 * PHASE 1.12: CLASSICAL SHASTRA RULES ENGINE
 * 
 * Rules engine covering 10 classical Vedic Muhurat categories grounded
 * in Muhurat Chintamani, Muhurat Martand, and Brihat Samhita.
 */

import {
  MuhuratCategoryKey,
  MuhuratCategoryConfig,
  DayPanchangData,
  ChoghadiyaSlot,
  MuhuratWindow,
  MuhuratSuitability
} from '../../types/muhurat/muhuratTypes';

export const MUHURAT_CATEGORIES: Record<MuhuratCategoryKey, MuhuratCategoryConfig> = {
  marriage: {
    key: 'marriage',
    titleHindi: 'विवाह मुहूर्त',
    titleEnglish: 'Marriage Ceremony',
    iconName: 'Heart',
    descriptionHindi: 'पाणिग्रहण संस्कार, वर-वधू का दाम्पत्य गठबंधन एवं मांगलिक फेरे।',
    descriptionEnglish: 'Sacred wedding ceremony and auspicious conjugal union.',
    classicalSources: ['मुहूर्त चिंतामणि • विवाह प्रकरण', 'बृहत्पाराशर होराशास्त्र • संस्कार विचार']
  },
  griha_pravesh: {
    key: 'griha_pravesh',
    titleHindi: 'गृह प्रवेश',
    titleEnglish: 'Housewarming / Griha Pravesh',
    iconName: 'Home',
    descriptionHindi: 'नूतन अथवा जीर्णोद्धार भवन में शुभ प्रवेश, वास्तु पूजन एवं कलश स्थापना।',
    descriptionEnglish: 'Auspicious entry into a new or renovated residence with Vastu puja.',
    classicalSources: ['मुहूर्त चिंतामणि • वास्तु प्रकरण', 'मुहूर्त मार्तण्ड • गृहप्रवेश विधान']
  },
  bhumi_pujan: {
    key: 'bhumi_pujan',
    titleHindi: 'गृह निर्माण / भूमि पूजन',
    titleEnglish: 'Foundation & Bhumi Pujan',
    iconName: 'Hammer',
    descriptionHindi: 'भवन की नींव, शिलान्यास, भूमि पूजन एवं निर्माण कार्य आरंभ।',
    descriptionEnglish: 'Auspicious foundation laying and land consecration for construction.',
    classicalSources: ['वराहमिहिर बृहत्संहिता • वास्तुकला', 'मुहूर्त चिंतामणि • शिलान्यास']
  },
  vehicle_purchase: {
    key: 'vehicle_purchase',
    titleHindi: 'वाहन खरीद',
    titleEnglish: 'Vehicle Purchase',
    iconName: 'Car',
    descriptionHindi: 'कार, दोपहिया अथवा व्यावसायिक वाहन क्रय, प्रथम चालन व पूजन।',
    descriptionEnglish: 'Auspicious timing for buying and delivering automobiles.',
    classicalSources: ['मुहूर्त मार्तण्ड • यान-वाहन क्रय', 'ज्योतिष कल्पतरु • चर कार्य']
  },
  business_start: {
    key: 'business_start',
    titleHindi: 'व्यापार / दुकान / ऑफिस शुरुआत',
    titleEnglish: 'Business & Office Opening',
    iconName: 'Briefcase',
    descriptionHindi: 'नवीन प्रतिष्ठान, दुकान, कंपनी का उद्घाटन, बहीखाता आरंभ एवं वाणिज्य।',
    descriptionEnglish: 'Inauguration of commercial enterprise, shop, or new office venture.',
    classicalSources: ['मुहूर्त चिंतामणि • वाणिज्य प्रकरण', 'नारद संहिता • व्यापारारंभ']
  },
  namkaran: {
    key: 'namkaran',
    titleHindi: 'नामकरण संस्कार',
    titleEnglish: 'Naming Ceremony (Namkaran)',
    iconName: 'Baby',
    descriptionHindi: 'नवजात शिशु का वैदिक नामकरण, चंद्र-नक्षत्र सम्मत नामाक्षर चयन।',
    descriptionEnglish: 'Sacred naming ceremony based on birth star and lunar dignity.',
    classicalSources: ['पारस्कर गृह्यसूत्र • नामकरण संस्कार', 'मुहूर्त चिंतामणि • बाल संस्कार']
  },
  annaprashan: {
    key: 'annaprashan',
    titleHindi: 'अन्नप्राशन',
    titleEnglish: 'First Solid Feeding (Annaprashan)',
    iconName: 'Utensils',
    descriptionHindi: 'शिशु को प्रथम बार अन्न व खीर का सात्विक आहार अर्पण।',
    descriptionEnglish: 'Auspicious first grain-feeding ceremony for a child.',
    classicalSources: ['अश्वलायन गृह्यसूत्र • अन्नप्राशन', 'मुहूर्त मार्तण्ड • संस्कार']
  },
  upanayana: {
    key: 'upanayana',
    titleHindi: 'उपनयन / विद्यारंभ',
    titleEnglish: 'Sacred Thread & Education Initiation',
    iconName: 'GraduationCap',
    descriptionHindi: 'यज्ञोपवीत धारण, गायत्री दीक्षा, गुरु-आशीर्वाद अथवा अक्षरारंभ।',
    descriptionEnglish: 'Sacred thread investiture and formal commencement of learning.',
    classicalSources: ['मनुस्मृति • उपनयन विधि', 'मुहूर्त चिंतामणि • विद्यारंभ प्रकरण']
  },
  travel_journey: {
    key: 'travel_journey',
    titleHindi: 'यात्रा आरंभ',
    titleEnglish: 'Travel & Journey Commencement',
    iconName: 'Compass',
    descriptionHindi: 'तीर्थ यात्रा, विदेश गमन, लंबी व्यावसायिक यात्रा का प्रथम प्रस्थान।',
    descriptionEnglish: 'Auspicious departure for pilgrimages and long-distance travel.',
    classicalSources: ['मुहूर्त चिंतामणि • यात्रा प्रकरण', 'वराहमिहिर • दिशा शूल विचार']
  },
  sarva_karya: {
    key: 'sarva_karya',
    titleHindi: 'सामान्य शुभ कार्य',
    titleEnglish: 'General Auspicious Activities',
    iconName: 'Sparkles',
    descriptionHindi: 'साधारण मांगलिक कर्म, समझौता, नवीन वस्त्र-आभूषण धारण व सद्प्रयास।',
    descriptionEnglish: 'General favorable timings for constructive life activities.',
    classicalSources: ['मुहूर्त मार्तण्ड • सर्वकार्य सिद्धि', 'पाराशर सिद्धांत']
  }
};

export class MuhuratRulesEngine {
  /**
   * Helper to determine time overlap between two HH:mm ranges
   */
  public static hasTimeOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string
  ): boolean {
    const parse = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const sA = parse(startA);
    const eA = parse(endA);
    const sB = parse(startB);
    const eB = parse(endB);

    // Normal daytime intervals
    if (eA > sA && eB > sB) {
      return Math.max(sA, sB) < Math.min(eA, eB);
    }
    return false;
  }

  /**
   * Evaluates Muhurat windows for a specific day and category
   */
  public static evaluateDayForCategory(
    panchang: DayPanchangData,
    categoryKey: MuhuratCategoryKey
  ): MuhuratWindow[] {
    const windows: MuhuratWindow[] = [];
    const catConfig = MUHURAT_CATEGORIES[categoryKey] || MUHURAT_CATEGORIES.sarva_karya;

    // Check day slots (Choghadiyas)
    panchang.choghadiyasDay.forEach((slot, idx) => {
      const evaluation = this.evaluateSlot(panchang, slot, categoryKey, catConfig, idx);
      if (evaluation) {
        windows.push(evaluation);
      }
    });

    // Check special Abhijit Muhurat if not already covered
    const abhijitWindow = this.evaluateAbhijitMuhurat(panchang, categoryKey, catConfig);
    if (abhijitWindow) {
      // Check if an existing slot completely duplicates Abhijit
      const duplicate = windows.find(w => w.startTime === abhijitWindow.startTime && w.endTime === abhijitWindow.endTime);
      if (!duplicate) {
        windows.push(abhijitWindow);
      }
    }

    return windows;
  }

  /**
   * Evaluates a single Choghadiya slot under classical rules
   */
  private static evaluateSlot(
    panchang: DayPanchangData,
    slot: ChoghadiyaSlot,
    category: MuhuratCategoryKey,
    catConfig: MuhuratCategoryConfig,
    slotIndex: number
  ): MuhuratWindow | null {
    let score = 50;
    const reasons: string[] = [];
    const cautions: string[] = [];
    const rulesApplied: string[] = [...catConfig.classicalSources];

    const tithi = panchang.tithi;
    const nakshatra = panchang.nakshatra;
    const yoga = panchang.yoga;
    const karana = panchang.karana;
    const vara = panchang.vara;
    const solarTimes = panchang.solarTimes;

    // 1. Choghadiya Suitability Base Points
    if (slot.name === 'Amrit') {
      score += 25;
      reasons.push('अमृत चौघड़िया: अमृत तुल्य उत्तम फल प्रदायक एवं सर्वकार्य सिद्धि।');
    } else if (slot.name === 'Shubh') {
      score += 22;
      reasons.push('शुभ चौघड़िया: गुरु द्वारा शासित, मांगलिक व धार्मिक कार्यों हेतु श्रेष्ठ।');
    } else if (slot.name === 'Labh') {
      score += 18;
      reasons.push('लाभ चौघड़िया: बुध द्वारा शासित, व्यापार, अर्थ एवं नवीन उपक्रम हेतु उत्तम।');
    } else if (slot.name === 'Char') {
      if (category === 'vehicle_purchase' || category === 'travel_journey') {
        score += 20;
        reasons.push('चर चौघड़िया: गतिशीलता, यात्रा एवं वाहन क्रय हेतु विशेष ग्राह्य।');
      } else {
        score += 8;
        reasons.push('चर चौघड़िया: सामान्य गतिशील कार्य हेतु मध्यम फलदायी।');
      }
    } else if (slot.name === 'Rog' || slot.name === 'Kaal' || slot.name === 'Udveg') {
      score -= 30;
      cautions.push(`${slot.nameHindi} चौघड़िया: शास्त्रों में अशुभ माना गया है, मांगलिक कार्य टालें।`);
    }

    // 2. Tithi Evaluation
    const tithiInPaksha = tithi.number <= 15 ? tithi.number : tithi.number - 15;
    if (tithi.isRikta) {
      score -= 25;
      cautions.push(`रिक्ता तिथि (${tithi.nameHindi}): चतुर्थी/नवमी/चतुर्दशी में मांगलिक कर्म वर्जित माने गए हैं।`);
      rulesApplied.push('मुहूर्त चिंतामणि • रिक्ता तिथि त्याग नियम');
    } else if (tithi.isAmavasya) {
      score -= 30;
      cautions.push('अमावस्या तिथि: केवल पितृ कार्य एवं ध्यान हेतु, सांसारिक शुभ आरंभ त्याज्य।');
    } else if (tithiInPaksha === 2 || tithiInPaksha === 3 || tithiInPaksha === 5 || tithiInPaksha === 7 || tithiInPaksha === 10 || tithiInPaksha === 11 || tithiInPaksha === 13) {
      score += 15;
      reasons.push(`शुभ तिथि (${tithi.nameHindi}): शास्त्र सम्मत शुभ तिथि का उत्तम प्रभाव।`);
    }

    // 3. Nakshatra Evaluation by Category
    const nakCat = nakshatra.category;
    if (category === 'marriage') {
      const marriageNaks = [4, 5, 10, 12, 13, 14, 15, 17, 19, 21, 26, 27]; // Rohini, Mrig, Magha, Uttara Ph, Hasta, Chitra, Swati, Anuradha, Mula, Uttara Ashadha, Uttara Bh, Revati
      if (marriageNaks.includes(nakshatra.number)) {
        score += 20;
        reasons.push(`विवाह अनुकूल नक्षत्र (${nakshatra.nameHindi}): पाणिग्रहण संस्कार हेतु शास्त्रोक्त संस्तुति।`);
      } else if (nakCat === 'Ugra' || nakCat === 'Teekshna') {
        score -= 20;
        cautions.push(`क्रूर/तीक्ष्ण नक्षत्र (${nakshatra.nameHindi}): विवाह कर्म में संयम अपेक्षित।`);
      }
    } else if (category === 'griha_pravesh' || category === 'bhumi_pujan') {
      if (nakCat === 'Sthira') {
        score += 22;
        reasons.push(`स्थिर नक्षत्र (${nakshatra.nameHindi}): गृह निर्माण एवं गृह प्रवेश में स्थायित्व व सुख शांति प्रदायक।`);
        rulesApplied.push('वास्तु चिंतामणि • स्थिर नक्षत्र (ध्रुव संज्ञक) विधान');
      } else if (nakCat === 'Mridu') {
        score += 16;
        reasons.push(`मृदु नक्षत्र (${nakshatra.nameHindi}): वास्तु शांति एवं सद्भाव हेतु उत्तम।`);
      } else if (nakCat === 'Ugra' || nakCat === 'Teekshna') {
        score -= 25;
        cautions.push(`अस्थिर/तीक्ष्ण नक्षत्र (${nakshatra.nameHindi}): गृह कार्य हेतु त्याज्य।`);
      }
    } else if (category === 'vehicle_purchase' || category === 'travel_journey') {
      if (nakCat === 'Chara' || nakCat === 'Kshipra') {
        score += 20;
        reasons.push(`चर/क्षिप्र नक्षत्र (${nakshatra.nameHindi}): गतिशीलता, वाहन चालन एवं यात्रा हेतु विशेष फलदायी।`);
      }
    } else if (category === 'business_start') {
      if (nakCat === 'Sthira' || nakCat === 'Kshipra' || nakCat === 'Chara') {
        score += 18;
        reasons.push(`वाणिज्य अनुकूल नक्षत्र (${nakshatra.nameHindi}): व्यावसायिक विस्तार एवं त्वरित सफलता का योग।`);
      }
    } else {
      // General auspicious nakshatra evaluation
      if (nakCat === 'Sthira' || nakCat === 'Mridu' || nakCat === 'Kshipra') {
        score += 12;
        reasons.push(`सौम्य नक्षत्र (${nakshatra.nameHindi}): कार्य संपादन हेतु अनुकूल।`);
      }
    }

    // 4. Weekday Evaluation
    if (category === 'marriage' || category === 'griha_pravesh') {
      if (vara.dayIndex === 2) { // Tuesday
        score -= 20;
        cautions.push('मंगलवार: विवाह एवं गृह प्रवेश हेतु पारंपरिक रूप से त्याज्य।');
      } else if (vara.dayIndex === 1 || vara.dayIndex === 3 || vara.dayIndex === 4 || vara.dayIndex === 5) {
        score += 10;
        reasons.push(`शुभ वार (${vara.nameHindi}): चंद्र, बुध, गुरु अथवा शुक्र शासित दिन मांगलिक कार्य हेतु श्रेष्ठ।`);
      }
    } else if (category === 'business_start') {
      if (vara.dayIndex === 3 || vara.dayIndex === 4 || vara.dayIndex === 5) { // Wed, Thu, Fri
        score += 12;
        reasons.push(`व्यापार अनुकूल वार (${vara.nameHindi}): बुध/गुरु/शुक्र की ऊर्जा वाणिज्य के लिए श्रेयस्कर।`);
      }
    }

    // 5. Yoga Evaluation
    if (!yoga.isAuspicious) {
      score -= 22;
      cautions.push(`अशुभ योग (${yoga.nameHindi}): ${yoga.qualityHindi}।`);
      rulesApplied.push('नारद संहिता • कुयोग वर्जन नियम');
    } else {
      score += 10;
      reasons.push(`शुभ योग (${yoga.nameHindi}): ${yoga.qualityHindi}।`);
    }

    // 6. Karana & Bhadra (Vishti) Evaluation
    if (karana.isBhadra) {
      score -= 35;
      cautions.push('भद्रा (विष्टि करण): भद्रा मुख में समस्त मांगलिक कार्य शास्त्रों में पूर्णतः निषिद्ध हैं।');
      rulesApplied.push('मुहूर्त मार्तण्ड • भद्रा त्याग विधान');
    } else {
      score += 5;
    }

    // 7. Rahu Kaal Conflict Check
    const hasRahuOverlap = this.hasTimeOverlap(
      slot.startTime,
      slot.endTime,
      solarTimes.rahuKaalStart,
      solarTimes.rahuKaalEnd
    );

    if (hasRahuOverlap) {
      score -= 35;
      cautions.push(`राहुकाल संयोग (${solarTimes.rahuKaalStart} - ${solarTimes.rahuKaalEnd}): इस समयावधि में नया कार्य आरंभ न करें।`);
      rulesApplied.push('वराहमिहिर • राहुकाल वर्जन');
    } else {
      reasons.push('राहुकाल से पूर्णतः मुक्त समय।');
    }

    // 8. Normalization & Suitability Assignment
    const finalScore = Math.max(10, Math.min(98, score));
    let suitability: MuhuratSuitability = 'MODERATE';
    let suitabilityHindi = 'मध्यम (Moderate)';
    let suitabilityEnglish = 'Moderate Window';

    if (finalScore >= 78 && !hasRahuOverlap && !karana.isBhadra && !tithi.isRikta) {
      suitability = 'EXCELLENT';
      suitabilityHindi = 'अति शुभ (Highly Auspicious)';
      suitabilityEnglish = 'Highly Auspicious';
    } else if (finalScore >= 60 && !hasRahuOverlap && !karana.isBhadra) {
      suitability = 'GOOD';
      suitabilityHindi = 'शुभ (Auspicious)';
      suitabilityEnglish = 'Auspicious';
    } else if (finalScore < 45 || hasRahuOverlap || karana.isBhadra) {
      suitability = 'AVOID';
      suitabilityHindi = 'वर्ज्य / अनुपयुक्त (Inauspicious)';
      suitabilityEnglish = 'Inauspicious / Avoid';
    }

    const startH = Number(slot.startTime.split(':')[0]);
    const startM = Number(slot.startTime.split(':')[1]);
    const endH = Number(slot.endTime.split(':')[0]);
    const endM = Number(slot.endTime.split(':')[1]);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    return {
      id: `MUH-${category}-${panchang.date}-${slot.startTime.replace(':', '')}`,
      category,
      categoryTitleHindi: catConfig.titleHindi,
      categoryTitleEnglish: catConfig.titleEnglish,
      date: panchang.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      durationFormatted: `लगभग ${Math.round(durationMinutes / 60 * 10) / 10} घंटे (${durationMinutes} मिनट)`,
      suitability,
      suitabilityHindi,
      suitabilityEnglish,
      score: finalScore,
      panchang,
      activeChoghadiya: slot,
      isAbhijitMuhurat: false,
      hasRahuKaalConflict: hasRahuOverlap,
      hasBhadraConflict: karana.isBhadra,
      rulesApplied: Array.from(new Set(rulesApplied)),
      reasonsHindi: reasons,
      cautionsHindi: cautions,
      recommendedActionHindi: suitability === 'EXCELLENT' || suitability === 'GOOD'
        ? `${catConfig.titleHindi} हेतु संकल्प, पूजा अथवा मुख्य कार्य इस समयावधि में आरंभ करें।`
        : 'महत्वपूर्ण नवीन कार्य टालें, केवल नित्य अथवा आवश्यक कार्य करें।',
      calculationSource: panchang.calculationSource,
      calculationTimestamp: new Date().toISOString()
    };
  }

  /**
   * Special evaluation for midday Abhijit Muhurat
   */
  private static evaluateAbhijitMuhurat(
    panchang: DayPanchangData,
    category: MuhuratCategoryKey,
    catConfig: MuhuratCategoryConfig
  ): MuhuratWindow | null {
    const solarTimes = panchang.solarTimes;
    const vara = panchang.vara;

    // Abhijit Muhurat is universally auspicious, EXCEPT on Wednesday where it has a traditional dosha
    const isWednesday = vara.dayIndex === 3;
    let score = isWednesday ? 45 : 88;
    const reasons: string[] = [];
    const cautions: string[] = [];
    const rulesApplied: string[] = ['वराहमिहिर संहिता • अभिजित मुहूर्त विधान', ...catConfig.classicalSources];

    if (isWednesday) {
      cautions.push('बुधवार को अभिजित मुहूर्त में विशेष कार्य त्याज्य माना गया है।');
    } else {
      reasons.push('अभिजित मुहूर्त: भगवान विष्णु द्वारा रक्षित, समस्त ग्रह दोषों का शमन करने वाला परम कल्याणकारी काल।');
      reasons.push(`मध्याह्न काल: ${solarTimes.abhijitStart} से ${solarTimes.abhijitEnd} तक।`);
    }

    // Check Rahu Kaal overlap
    const hasRahuOverlap = this.hasTimeOverlap(
      solarTimes.abhijitStart,
      solarTimes.abhijitEnd,
      solarTimes.rahuKaalStart,
      solarTimes.rahuKaalEnd
    );

    if (hasRahuOverlap) {
      score -= 30;
      cautions.push('राहुकाल संयोग के कारण अभिजित की शुभता प्रभावित।');
    }

    const suitability: MuhuratSuitability = score >= 75 && !hasRahuOverlap ? 'EXCELLENT' : (score >= 55 ? 'GOOD' : 'MODERATE');

    const abhijitSlot: ChoghadiyaSlot = {
      name: 'Amrit',
      nameHindi: 'अभिजित (परम शुभ)',
      periodType: 'Day',
      startTime: solarTimes.abhijitStart,
      endTime: solarTimes.abhijitEnd,
      rulingPlanet: 'Sun',
      rulingPlanetHindi: 'भगवान सूर्यनारायण',
      suitability: 'EXCELLENT',
      significanceHindi: 'समस्त शुभ कार्यों हेतु शास्त्रोक्त सर्वश्रेष्ठ मध्याह्न मुहूर्त'
    };

    return {
      id: `MUH-ABHIJIT-${category}-${panchang.date}-${solarTimes.abhijitStart.replace(':', '')}`,
      category,
      categoryTitleHindi: catConfig.titleHindi,
      categoryTitleEnglish: catConfig.titleEnglish,
      date: panchang.date,
      startTime: solarTimes.abhijitStart,
      endTime: solarTimes.abhijitEnd,
      durationFormatted: 'लगभग 48 मिनट (अभिजित काल)',
      suitability,
      suitabilityHindi: suitability === 'EXCELLENT' ? 'अति शुभ (अभिजित मुहूर्त)' : 'शुभ काल',
      suitabilityEnglish: 'Auspicious (Abhijit)',
      score,
      panchang,
      activeChoghadiya: abhijitSlot,
      isAbhijitMuhurat: true,
      hasRahuKaalConflict: hasRahuOverlap,
      hasBhadraConflict: panchang.karana.isBhadra,
      rulesApplied: Array.from(new Set(rulesApplied)),
      reasonsHindi: reasons,
      cautionsHindi: cautions,
      recommendedActionHindi: 'इस परम कल्याणकारी समय में कार्य का शुभारंभ, पूजन एवं मुख्य संकल्प श्रेष्ठ फल देता है।',
      calculationSource: panchang.calculationSource,
      calculationTimestamp: new Date().toISOString()
    };
  }
}
