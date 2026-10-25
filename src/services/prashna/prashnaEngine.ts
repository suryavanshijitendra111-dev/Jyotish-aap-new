import { 
  PrashnaContext, 
  PrashnaKundliData, 
  PrashnaPlanet, 
  PrashnaSignificators, 
  PrashnaHistoryItem,
  PrashnaTraditionalAnalysis,
  PrashnaTajikYogaAnalysis,
  TajikAspectType,
  TajikYogaName,
  TajikPlanetOrbInfo,
  MasterKundliData 
} from '../../types/kundli';
import { getPrashnaModeConfig } from '../../data/prashnaModes';

// Traditional Parashari Rashi Rulers (1 to 12)
export const RASHI_LORDS: Record<number, string> = {
  1: 'Mars',
  2: 'Venus',
  3: 'Mercury',
  4: 'Moon',
  5: 'Sun',
  6: 'Mercury',
  7: 'Venus',
  8: 'Mars',
  9: 'Jupiter',
  10: 'Saturn',
  11: 'Saturn',
  12: 'Jupiter'
};

export const RASHI_HINDI_NAMES: Record<number, string> = {
  1: 'मेष (Aries)',
  2: 'वृषभ (Taurus)',
  3: 'मिथुन (Gemini)',
  4: 'कर्क (Cancer)',
  5: 'सिंह (Leo)',
  6: 'कन्या (Virgo)',
  7: 'तुला (Libra)',
  8: 'वृश्चिक (Scorpio)',
  9: 'धनु (Sagittarius)',
  10: 'मकर (Capricorn)',
  11: 'कुंभ (Aquarius)',
  12: 'मीन (Pisces)'
};

export const PLANET_HINDI_NAMES: Record<string, string> = {
  Sun: 'सूर्य (Sun)',
  Moon: 'चंद्र (Moon)',
  Mars: 'मंगल (Mars)',
  Mercury: 'बुध (Mercury)',
  Jupiter: 'गुरु (Jupiter)',
  Venus: 'शुक्र (Venus)',
  Saturn: 'शनि (Saturn)',
  Rahu: 'राहु (Rahu)',
  Ketu: 'केतु (Ketu)'
};

const RASHI_NAME_TO_NUMBER: Record<string, number> = {
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4,
  Leo: 5, Virgo: 6, Libra: 7, Scorpio: 8,
  Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12
};

const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", 
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", 
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", 
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", 
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

function formatNakshatra(nak: any): string {
  if (typeof nak === 'number') {
    return NAKSHATRA_NAMES[nak - 1] || NAKSHATRA_NAMES[nak] || `Nakshatra ${nak}`;
  }
  return typeof nak === 'string' && nak ? nak : 'Unavailable';
}

// Classical Direction Mapping based on Rashi Elements
const RASHI_TO_DIRECTION: Record<number, { direction: 'East' | 'South' | 'West' | 'North'; hindi: string }> = {
  1: { direction: 'East', hindi: 'पूर्व दिशा (East)' },
  5: { direction: 'East', hindi: 'पूर्व दिशा (East)' },
  9: { direction: 'East', hindi: 'पूर्व दिशा (East)' },
  2: { direction: 'South', hindi: 'दक्षिण दिशा (South)' },
  6: { direction: 'South', hindi: 'दक्षिण दिशा (South)' },
  10: { direction: 'South', hindi: 'दक्षिण दिशा (South)' },
  3: { direction: 'West', hindi: 'पश्चिम दिशा (West)' },
  7: { direction: 'West', hindi: 'पश्चिम दिशा (West)' },
  11: { direction: 'West', hindi: 'पश्चिम दिशा (West)' },
  4: { direction: 'North', hindi: 'उत्तर दिशा (North)' },
  8: { direction: 'North', hindi: 'उत्तर दिशा (North)' },
  12: { direction: 'North', hindi: 'उत्तर दिशा (North)' }
};

// Classical Sign Nature (Char / Sthir / Dvisvabhava)
const RASHI_TO_NATURE: Record<number, { nature: 'Movable (Chara)' | 'Fixed (Sthira)' | 'Dual (Dvisvabhava)'; hindi: string; implication: string }> = {
  1: { nature: 'Movable (Chara)', hindi: 'चर राशि (Chara)', implication: 'गतिशीलता, स्थान परिवर्तन अथवा त्वरित परिणाम का संकेत।' },
  4: { nature: 'Movable (Chara)', hindi: 'चर राशि (Chara)', implication: 'गतिशीलता, स्थान परिवर्तन अथवा त्वरित परिणाम का संकेत।' },
  7: { nature: 'Movable (Chara)', hindi: 'चर राशि (Chara)', implication: 'गतिशीलता, स्थान परिवर्तन अथवा त्वरित परिणाम का संकेत।' },
  10: { nature: 'Movable (Chara)', hindi: 'चर राशि (Chara)', implication: 'गतिशीलता, स्थान परिवर्तन अथवा त्वरित परिणाम का संकेत।' },
  2: { nature: 'Fixed (Sthira)', hindi: 'स्थिर राशि (Sthira)', implication: 'मूल स्थान के निकट, परिसर के भीतर, अलमारी या स्थिर स्थान में बने रहने का संकेत।' },
  5: { nature: 'Fixed (Sthira)', hindi: 'स्थिर राशि (Sthira)', implication: 'मूल स्थान के निकट, परिसर के भीतर, अलमारी या स्थिर स्थान में बने रहने का संकेत।' },
  8: { nature: 'Fixed (Sthira)', hindi: 'स्थिर राशि (Sthira)', implication: 'मूल स्थान के निकट, परिसर के भीतर, अलमारी या स्थिर स्थान में बने रहने का संकेत।' },
  11: { nature: 'Fixed (Sthira)', hindi: 'स्थिर राशि (Sthira)', implication: 'मूल स्थान के निकट, परिसर के भीतर, अलमारी या स्थिर स्थान में बने रहने का संकेत।' },
  3: { nature: 'Dual (Dvisvabhava)', hindi: 'द्विस्वभाव राशि (Dvisvabhava)', implication: 'मध्यवर्ती दूरी, प्रवेश द्वार, खिड़की अथवा आवागमन के मार्ग के समीप।' },
  6: { nature: 'Dual (Dvisvabhava)', hindi: 'द्विस्वभाव राशि (Dvisvabhava)', implication: 'मध्यवर्ती दूरी, प्रवेश द्वार, खिड़की अथवा आवागमन के मार्ग के समीप।' },
  9: { nature: 'Dual (Dvisvabhava)', hindi: 'द्विस्वभाव राशि (Dvisvabhava)', implication: 'मध्यवर्ती दूरी, प्रवेश द्वार, खिड़की अथवा आवागमन के मार्ग के समीप।' },
  12: { nature: 'Dual (Dvisvabhava)', hindi: 'द्विस्वभाव राशि (Dvisvabhava)', implication: 'मध्यवर्ती दूरी, प्रवेश द्वार, खिड़की अथवा आवागमन के मार्ग के समीप।' }
};

// Classical Element & Environmental Clues
const RASHI_TO_ELEMENT: Record<number, { element: 'Agni (Fire)' | 'Prithvi (Earth)' | 'Vayu (Air)' | 'Jala (Water)'; hindi: string; clues: string }> = {
  1: { element: 'Agni (Fire)', hindi: 'अग्नि तत्व (Agni)', clues: 'रसोईघर, विद्युत उपकरण, ताप स्रोत, ऊंचे स्थान, प्रकाशयुक्त कोने अथवा पूजा स्थान।' },
  5: { element: 'Agni (Fire)', hindi: 'अग्नि तत्व (Agni)', clues: 'रसोईघर, विद्युत उपकरण, ताप स्रोत, ऊंचे स्थान, प्रकाशयुक्त कोने अथवा पूजा स्थान।' },
  9: { element: 'Agni (Fire)', hindi: 'अग्नि तत्व (Agni)', clues: 'रसोईघर, विद्युत उपकरण, ताप स्रोत, ऊंचे स्थान, प्रकाशयुक्त कोने अथवा पूजा स्थान।' },
  2: { element: 'Prithvi (Earth)', hindi: 'पृथ्वी तत्व (Prithvi)', clues: 'भूमि तल, फर्श, दराज, तिजोरी, भारी लकड़ी का फर्नीचर, बगीचा अथवा बंद कमरा।' },
  6: { element: 'Prithvi (Earth)', hindi: 'पृथ्वी तत्व (Prithvi)', clues: 'भूमि तल, फर्श, दराज, तिजोरी, भारी लकड़ी का फर्नीचर, बगीचा अथवा बंद कमरा।' },
  10: { element: 'Prithvi (Earth)', hindi: 'पृथ्वी तत्व (Prithvi)', clues: 'भूमि तल, फर्श, दराज, तिजोरी, भारी लकड़ी का फर्नीचर, बगीचा अथवा बंद कमरा।' },
  3: { element: 'Vayu (Air)', hindi: 'वायु तत्व (Vayu)', clues: 'खिड़की, झरोखा, बालकनी, हवादार कोना, टांगने का स्थान, अलमारी का ऊपरी भाग या डिजिटल फाइल।' },
  7: { element: 'Vayu (Air)', hindi: 'वायु तत्व (Vayu)', clues: 'खिड़की, झरोखा, बालकनी, हवादार कोना, टांगने का स्थान, अलमारी का ऊपरी भाग या डिजिटल फाइल।' },
  11: { element: 'Vayu (Air)', hindi: 'वायु तत्व (Vayu)', clues: 'खिड़की, झरोखा, बालकनी, हवादार कोना, टांगने का स्थान, अलमारी का ऊपरी भाग या डिजिटल फाइल।' },
  4: { element: 'Jala (Water)', hindi: 'जल तत्व (Jala)', clues: 'स्नानगृह, जल शोधक (RO), टंकी, वॉशिंग मशीन, नम स्थान अथवा बर्तन रखने की जगह।' },
  8: { element: 'Jala (Water)', hindi: 'जल तत्व (Jala)', clues: 'स्नानगृह, जल शोधक (RO), टंकी, वॉशिंग मशीन, नम स्थान अथवा बर्तन रखने की जगह।' },
  12: { element: 'Jala (Water)', hindi: 'जल तत्व (Jala)', clues: 'स्नानगृह, जल शोधक (RO), टंकी, वॉशिंग मशीन, नम स्थान अथवा बर्तन रखने की जगह।' }
};

// ==========================================
// शास्त्रीय ताजिक नीलकण्ठी: दीप्तांश एवं योग गणना
// ==========================================

/**
 * Classical Tajik Deeptamsha (Planetary Orbs of Light in degrees)
 * Source: Tajik Neelakanthi & Classical Horary Astrology
 */
export const TAJIK_DEEPTAMSHA: Record<string, number> = {
  Sun: 15,
  Moon: 12,
  Mars: 8,
  Mercury: 7,
  Jupiter: 9,
  Venus: 7,
  Saturn: 9
};

/**
 * Classical Planetary Speed Ranking (Lower number = Higher velocity)
 * Moon is fastest, Saturn is slowest
 */
export const PLANET_SPEED_RANK: Record<string, number> = {
  Moon: 1,    // Chandra: ~13.18°/day
  Mercury: 2, // Budha: ~1.38°/day
  Venus: 3,   // Shukra: ~1.20°/day
  Sun: 4,     // Surya: ~0.98°/day
  Mars: 5,    // Mangala: ~0.52°/day
  Jupiter: 6, // Guru: ~0.08°/day
  Saturn: 7   // Shani: ~0.03°/day
};

/**
 * Evaluate Classical Tajik Aspect between two house positions (1-12)
 */
export function getTajikAspect(house1: number, house2: number): { 
  type: TajikAspectType; 
  hindiName: string; 
  englishName: string;
  isDirectAspect: boolean;
  quality: 'Harmonious' | 'Inimical' | 'Neutral';
} {
  const diff = Math.abs(house1 - house2);
  const distance = Math.min(diff, 12 - diff) + 1; // 1 to 7

  if (house1 === house2) {
    return {
      type: 'Conjunction',
      hindiName: 'युति संबंध (0° - एक ही भाव में प्रत्यक्ष संयोग)',
      englishName: 'Conjunction (0°)',
      isDirectAspect: true,
      quality: 'Neutral'
    };
  }

  if (distance === 7) {
    return {
      type: 'Opposition',
      hindiName: 'समसप्तक प्रत्यक्ष शत्रु दृष्टि (180° - 7वां भाव)',
      englishName: 'Opposition (180°)',
      isDirectAspect: true,
      quality: 'Inimical'
    };
  }

  if (distance === 5) {
    return {
      type: 'Trine',
      hindiName: 'त्रिकोण प्रत्यक्ष मित्र दृष्टि (120° - 5वां/9वां भाव)',
      englishName: 'Trine (120°)',
      isDirectAspect: true,
      quality: 'Harmonious'
    };
  }

  if (distance === 3) {
    return {
      type: 'Sextile',
      hindiName: 'गुप्त मित्र दृष्टि (60° - 3रा/11वां भाव)',
      englishName: 'Sextile (60°)',
      isDirectAspect: true,
      quality: 'Harmonious'
    };
  }

  if (distance === 4) {
    return {
      type: 'Square',
      hindiName: 'केन्द्र गुप्त शत्रु दृष्टि (90° - 4था/10वां भाव)',
      englishName: 'Square (90°)',
      isDirectAspect: true,
      quality: 'Inimical'
    };
  }

  return {
    type: 'None',
    hindiName: 'दृष्टिहीन स्थिति (2/12 या 6/8 - अनाफशता/अदृष्टि)',
    englishName: 'No Aspect (Inconjunct 2/12 or 6/8)',
    isDirectAspect: false,
    quality: 'Neutral'
  };
}

/**
 * Check pair relationship under Tajik rules (Orb, Speed, Applying/Separating)
 */
function evaluatePairTajikDetails(
  p1: PrashnaPlanet,
  p2: PrashnaPlanet
) {
  const aspect = getTajikAspect(p1.house, p2.house);
  const d1 = TAJIK_DEEPTAMSHA[p1.planet] ?? 9;
  const d2 = TAJIK_DEEPTAMSHA[p2.planet] ?? 9;
  const combinedOrbLimit = (d1 + d2) / 2;
  const degreeDiff = Math.abs(p1.degree - p2.degree);
  const isWithinOrb = aspect.type !== 'None' && degreeDiff <= combinedOrbLimit;

  const rank1 = PLANET_SPEED_RANK[p1.planet] ?? 5;
  const rank2 = PLANET_SPEED_RANK[p2.planet] ?? 5;

  let fasterPlanet: PrashnaPlanet;
  let slowerPlanet: PrashnaPlanet;

  if (rank1 < rank2) {
    fasterPlanet = p1;
    slowerPlanet = p2;
  } else if (rank2 < rank1) {
    fasterPlanet = p2;
    slowerPlanet = p1;
  } else {
    fasterPlanet = p1.degree < p2.degree ? p1 : p2;
    slowerPlanet = p1.degree < p2.degree ? p2 : p1;
  }

  // Applying / Separating calculation:
  // Under direct motion, faster planet with lower degree approaches slower planet = Applying (इत्थशाल)
  let isApplying = false;
  if (!fasterPlanet.isRetrograde && !slowerPlanet.isRetrograde) {
    isApplying = fasterPlanet.degree < slowerPlanet.degree;
  } else if (fasterPlanet.isRetrograde && !slowerPlanet.isRetrograde) {
    isApplying = fasterPlanet.degree > slowerPlanet.degree;
  } else if (!fasterPlanet.isRetrograde && slowerPlanet.isRetrograde) {
    isApplying = fasterPlanet.degree < slowerPlanet.degree || (fasterPlanet.degree > slowerPlanet.degree && degreeDiff <= 2.0);
  } else {
    isApplying = fasterPlanet.degree > slowerPlanet.degree;
  }

  return {
    aspect,
    d1,
    d2,
    combinedOrbLimit,
    degreeDiff,
    isWithinOrb,
    fasterPlanet,
    slowerPlanet,
    isApplying
  };
}

/**
 * Comprehensive Classical Tajik Yoga Engine:
 * Evaluates Ithasala, Ishrafa, Nakta, Yamaya, and Kambool Yogas
 */
export function evaluateTajikYogas(
  planetsRecord: Record<string, PrashnaPlanet>,
  lagnaLordName: string,
  karyeshLordName: string
): PrashnaTajikYogaAnalysis {
  const p1 = planetsRecord[lagnaLordName];
  const p2 = planetsRecord[karyeshLordName];
  const moon = planetsRecord['Moon'];

  // Default fallback if significators missing
  if (!p1 || !p2) {
    const defaultOrbInfo: TajikPlanetOrbInfo = {
      planet: lagnaLordName || 'Mars',
      hindiName: PLANET_HINDI_NAMES[lagnaLordName] || lagnaLordName || 'मंगल',
      deeptamsha: 8,
      degreeInSign: 0,
      house: 1,
      speedRank: 5,
      isFaster: false,
      isRetrograde: false
    };
    return {
      lagnesh: defaultOrbInfo,
      karyesh: { ...defaultOrbInfo, planet: karyeshLordName, hindiName: karyeshLordName },
      aspectType: 'None',
      aspectNameHindi: 'दृष्टिहीन स्थिति',
      combinedDeeptamshaLimit: 8,
      actualDegreeDiff: 0,
      isWithinOrb: false,
      isApplying: false,
      activeYoga: 'None',
      yogaNameHindi: 'स्वतंत्र स्थिति (नो ताजिक योग)',
      yogaCategory: 'Neutral (तटस्थ)',
      classicalRule: 'ताजिक नीलकण्ठी: ग्रहों की स्थिति अप्राप्य होने पर सामान्य फलादेश।',
      interpretationHindi: 'ग्रहों की दीप्तांश गणना उपलब्ध नहीं है।',
      interpretationEnglish: 'Planetary orb analysis unavailable.'
    };
  }

  const pair = evaluatePairTajikDetails(p1, p2);
  const rank1 = PLANET_SPEED_RANK[p1.planet] ?? 5;
  const rank2 = PLANET_SPEED_RANK[p2.planet] ?? 5;

  const lagneshOrbInfo: TajikPlanetOrbInfo = {
    planet: p1.planet,
    hindiName: p1.hindiName,
    deeptamsha: pair.d1,
    degreeInSign: p1.degree,
    house: p1.house,
    speedRank: rank1,
    isFaster: pair.fasterPlanet.planet === p1.planet,
    isRetrograde: p1.isRetrograde
  };

  const karyeshOrbInfo: TajikPlanetOrbInfo = {
    planet: p2.planet,
    hindiName: p2.hindiName,
    deeptamsha: pair.d2,
    degreeInSign: p2.degree,
    house: p2.house,
    speedRank: rank2,
    isFaster: pair.fasterPlanet.planet === p2.planet,
    isRetrograde: p2.isRetrograde
  };

  // 1. Check Kambool Yoga (कम्बूल योग)
  // Condition: Primary Ithasala exists between L and K, AND Moon also forms Ithasala with either L or K
  if (pair.isWithinOrb && pair.isApplying && moon) {
    const moonWithL = evaluatePairTajikDetails(moon, p1);
    const moonWithK = evaluatePairTajikDetails(moon, p2);

    const moonApplying = (moonWithL.isWithinOrb && moonWithL.isApplying) || (moonWithK.isWithinOrb && moonWithK.isApplying);

    if (moonApplying) {
      let subType = 'Madhyama Kambool (मध्यम कम्बूल योग)';
      let category: 'Fulfillment (सिद्धि)' = 'Fulfillment (सिद्धि)';
      if (moon.sign === 'Taurus' || moon.sign === 'Cancer' || moon.dignity === 'Exalted' || moon.dignity === 'OwnHouse') {
        subType = 'Uttama Kambool (उत्तम कम्बूल योग - सर्वोत्तम कार्य सिद्धि)';
      } else if (moon.sign === 'Scorpio' || moon.dignity === 'Debilitated') {
        subType = 'Heena Kambool (अधम कम्बूल योग - विलंब के बाद सिद्धि)';
      }

      return {
        lagnesh: lagneshOrbInfo,
        karyesh: karyeshOrbInfo,
        aspectType: pair.aspect.type,
        aspectNameHindi: pair.aspect.hindiName,
        combinedDeeptamshaLimit: pair.combinedOrbLimit,
        actualDegreeDiff: pair.degreeDiff,
        isWithinOrb: true,
        isApplying: true,
        activeYoga: 'Kambool',
        yogaNameHindi: 'कम्बूल योग (Kambool Yoga)',
        yogaCategory: category,
        subType,
        mediatorPlanet: {
          planet: 'Moon',
          hindiName: 'चंद्रमा (Moon)',
          role: 'Kambool Moon (कम्बूल चंद्रमा)',
          house: moon.house,
          description: `चंद्रमा भाव ${moon.house} में स्थित होकर इत्थशाल को राजयोग समतुल्य शक्ति प्रदान कर रहा है।`
        },
        classicalRule: 'ताजिक नीलकण्ठी: "इत्थशालं गते चन्द्रे लग्नेशे कार्यपे तथा। कम्बूलयोगो विज्ञेयो नृपकार्यार्थसाधकः॥"',
        interpretationHindi: `लग्न स्वामी (${p1.hindiName}) और कार्य स्वामी (${p2.hindiName}) के मध्य दीप्तांश ${pair.combinedOrbLimit.toFixed(1)}° के भीतर पूर्ण इत्थशाल है, तथा चंद्रमा भी इस योग को पोषित कर रहा है। यह अत्यंत शक्तिशाली 'कम्बूल योग' है, जो निश्चित एवं निर्विवाद कार्य सिद्धि का द्योतक है।`,
        interpretationEnglish: `A high-potency Kambool Yoga is formed: Lagna lord (${p1.planet}) and Karya lord (${p2.planet}) are in applying aspect within orb limit of ${pair.combinedOrbLimit.toFixed(1)}°, with the Moon actively reinforcing the bond.`
      };
    }
  }

  // 2. Check Ithasala Yoga (इत्थशाल / मुथशिला योग)
  // Condition: Aspect exists, within combined Deeptamsha limit, faster planet applying to slower
  if (pair.isWithinOrb && pair.isApplying) {
    const isPoorna = pair.degreeDiff <= 1.0;
    const subType = isPoorna
      ? 'Poorna Ithasala (पूर्ण इत्थशाल योग - 1° के भीतर त्वरित फल)'
      : 'Vartamana Ithasala (वर्तमान इत्थशाल योग - सक्रिय सिद्धि)';

    return {
      lagnesh: lagneshOrbInfo,
      karyesh: karyeshOrbInfo,
      aspectType: pair.aspect.type,
      aspectNameHindi: pair.aspect.hindiName,
      combinedDeeptamshaLimit: pair.combinedOrbLimit,
      actualDegreeDiff: pair.degreeDiff,
      isWithinOrb: true,
      isApplying: true,
      activeYoga: 'Ithasala',
      yogaNameHindi: 'इत्थशाल योग (Ithasala / Muthashila)',
      yogaCategory: 'Fulfillment (सिद्धि)',
      subType,
      classicalRule: 'ताजिक नीलकण्ठी: "अल्पांशको यदा शीघ्रः परभागगतं गुरुम्। पश्येद् दीप्तांशके योग इत्थशालः प्रकीर्तितः॥"',
      interpretationHindi: `शीघ्रगामी ग्रह (${pair.fasterPlanet.hindiName}, ${pair.fasterPlanet.degree.toFixed(2)}°) मंदगामी ग्रह (${pair.slowerPlanet.hindiName}, ${pair.slowerPlanet.degree.toFixed(2)}°) की ओर बढ़ रहा है। दोनों के बीच अंतर ${pair.degreeDiff.toFixed(2)}° है जो संयुक्त दीप्तांश सीमा ${pair.combinedOrbLimit.toFixed(1)}° के पूर्णतः भीतर है। यह शास्त्रीय 'इत्थशाल योग' है, जो प्रश्न कार्य के सफल होने का स्पष्ट प्रमाण है।`,
      interpretationEnglish: `Applying Ithasala Yoga formed: The faster planet (${pair.fasterPlanet.planet}) at ${pair.fasterPlanet.degree.toFixed(2)}° is applying to the slower planet (${pair.slowerPlanet.planet}) at ${pair.slowerPlanet.degree.toFixed(2)}° within the combined orb limit of ${pair.combinedOrbLimit.toFixed(1)}°. Work will be accomplished.`
    };
  }

  // 3. Check Ishrafa Yoga (ईशराफ / मुसरिफ योग)
  // Condition: Aspect exists, within orb, but faster planet has passed slower (Separating)
  if (pair.isWithinOrb && !pair.isApplying) {
    return {
      lagnesh: lagneshOrbInfo,
      karyesh: karyeshOrbInfo,
      aspectType: pair.aspect.type,
      aspectNameHindi: pair.aspect.hindiName,
      combinedDeeptamshaLimit: pair.combinedOrbLimit,
      actualDegreeDiff: pair.degreeDiff,
      isWithinOrb: true,
      isApplying: false,
      activeYoga: 'Ishrafa',
      yogaNameHindi: 'ईशराफ योग (Ishrafa / Musaripha)',
      yogaCategory: 'Impediment (बाधा/हानि)',
      subType: 'Ishrafa Yoga (पृथक्करण/विलंब योग)',
      classicalRule: 'ताजिक नीलकण्ठी: "शीघ्रोऽधिकोंऽशैर्मन्दोऽल्पैः पश्यतो यदि वा न वा। मुसरिफाख्यः स विज्ञेयो नाशकृत् सर्वकर्मणाम्॥"',
      interpretationHindi: `शीघ्रगामी ग्रह (${pair.fasterPlanet.hindiName}, ${pair.fasterPlanet.degree.toFixed(2)}°) मंदगामी ग्रह (${pair.slowerPlanet.hindiName}, ${pair.slowerPlanet.degree.toFixed(2)}°) को पार कर आगे निकल चुका है (विमुख/Separating)। यह 'ईशराफ योग' कहलाता है, जो यह दर्शाता है कि अनुकूल अवसर निकल चुका है अथवा कार्य में विलंब व बाधाएं आएंगी।`,
      interpretationEnglish: `Separating Ishrafa Yoga: The faster planet (${pair.fasterPlanet.planet}) has crossed the slower planet (${pair.slowerPlanet.planet}) by ${pair.degreeDiff.toFixed(2)}°. Opportunity has passed or outcomes face substantial delay.`
    };
  }

  // 4. Check Nakta Yoga (नक्त योग - Mediation by a faster intermediary)
  // When no direct Ithasala between L and K, but a third faster planet transfers light
  const fasterCandidates = ['Moon', 'Mercury', 'Venus', 'Sun'].filter(cand => {
    if (cand === p1.planet || cand === p2.planet) return false;
    const candRank = PLANET_SPEED_RANK[cand] ?? 5;
    return candRank < rank1 && candRank < rank2;
  });

  for (const candName of fasterCandidates) {
    const candPlanet = planetsRecord[candName];
    if (!candPlanet) continue;

    const candWithL = evaluatePairTajikDetails(candPlanet, p1);
    const candWithK = evaluatePairTajikDetails(candPlanet, p2);

    if (candWithL.isWithinOrb && candWithK.isWithinOrb && (candWithL.isApplying || candWithK.isApplying)) {
      return {
        lagnesh: lagneshOrbInfo,
        karyesh: karyeshOrbInfo,
        aspectType: pair.aspect.type,
        aspectNameHindi: pair.aspect.hindiName,
        combinedDeeptamshaLimit: pair.combinedOrbLimit,
        actualDegreeDiff: pair.degreeDiff,
        isWithinOrb: false,
        isApplying: false,
        activeYoga: 'Nakta',
        yogaNameHindi: 'नक्त योग (Nakta Yoga - मध्यस्थ योग)',
        yogaCategory: 'Mediated (मध्यस्थ)',
        subType: 'Nakta Yoga (दूत/मध्यस्थ के माध्यम से सिद्धि)',
        mediatorPlanet: {
          planet: candPlanet.planet,
          hindiName: candPlanet.hindiName,
          role: 'Fast Messenger (शीघ्रगामी नक्त मध्यस्थ)',
          house: candPlanet.house,
          description: `${candPlanet.hindiName} भाव ${candPlanet.house} से दोनों प्रमुख ग्रहों के बीच प्रकाश/तेज का हस्तांतरण कर रहा है।`
        },
        classicalRule: 'ताजिक नीलकण्ठी: "यदा न पश्यतो लग्नेशकार्याधिपौ परस्परम्। तयोर्मध्ये स्थितः शीघ्रो नक्तयोगः प्रकीर्तितः॥"',
        interpretationHindi: `लग्नेश (${p1.hindiName}) और कार्येश (${p2.hindiName}) के मध्य सीधा संबंध न होने पर भी शीघ्रगामी ग्रह ${candPlanet.hindiName} दोनों को दीप्तांश सीमा में देख रहा है। यह शास्त्रीय 'नक्त योग' है—कार्य स्वयं के प्रयास से नहीं, अपितु किसी तीसरे व्यक्ति, मित्र या मध्यस्थ की सहायता से संपन्न होगा।`,
        interpretationEnglish: `Nakta Yoga formed: No direct aspect between significators, but faster mediator planet (${candPlanet.planet}) transfers light between them within combined orbs. Success is achieved via an intermediary or third party.`
      };
    }
  }

  // 5. Check Yamaya Yoga (यामया योग - Mediation by a slower authority/superior)
  // When no direct Ithasala, but both L and K apply to a slower third planet
  const slowerCandidates = ['Saturn', 'Jupiter', 'Mars'].filter(cand => {
    if (cand === p1.planet || cand === p2.planet) return false;
    const candRank = PLANET_SPEED_RANK[cand] ?? 5;
    return candRank > rank1 && candRank > rank2;
  });

  for (const candName of slowerCandidates) {
    const candPlanet = planetsRecord[candName];
    if (!candPlanet) continue;

    const lWithCand = evaluatePairTajikDetails(p1, candPlanet);
    const kWithCand = evaluatePairTajikDetails(p2, candPlanet);

    if (lWithCand.isWithinOrb && kWithCand.isWithinOrb && lWithCand.isApplying && kWithCand.isApplying) {
      return {
        lagnesh: lagneshOrbInfo,
        karyesh: karyeshOrbInfo,
        aspectType: pair.aspect.type,
        aspectNameHindi: pair.aspect.hindiName,
        combinedDeeptamshaLimit: pair.combinedOrbLimit,
        actualDegreeDiff: pair.degreeDiff,
        isWithinOrb: false,
        isApplying: false,
        activeYoga: 'Yamaya',
        yogaNameHindi: 'यामया योग (Yamaya Yoga - गुरु/अधिकारी योग)',
        yogaCategory: 'Mediated (मध्यस्थ)',
        subType: 'Yamaya Yoga (वरिष्ठ अधिकारी/न्यायाधीश द्वारा सिद्धि)',
        mediatorPlanet: {
          planet: candPlanet.planet,
          hindiName: candPlanet.hindiName,
          role: 'Heavy Authority (गुरु यामया मध्यस्थ)',
          house: candPlanet.house,
          description: `${candPlanet.hindiName} भाव ${candPlanet.house} में दोनों ग्रहों की रश्मियों को ग्रहण कर रहा है।`
        },
        classicalRule: 'ताजिक नीलकण्ठी: "लग्नेशकार्याधिपती यदान्यं मन्दं प्रपश्येतामुभौ प्रवृत्तौ। यामयाभिधानः स शुभप्रदः स्यात्॥"',
        interpretationHindi: `लग्नेश (${p1.hindiName}) और कार्येश (${p2.hindiName}) दोनों मिलकर मंदगामी गुरु ग्रह ${candPlanet.hindiName} को दीप्तांश सीमा में देख रहे हैं। यह 'यामया योग' है—वरिष्ठ अधिकारी, पिता, संरक्षक या न्यायिक सत्ता के हस्तक्षेप से कार्य में सफलता मिलेगी।`,
        interpretationEnglish: `Yamaya Yoga formed: Both primary significators apply their light to a slower planet (${candPlanet.planet}). Success will be secured through an authority figure, elder, or patron.`
      };
    }
  }

  // 6. Default: No Tajik Yoga
  return {
    lagnesh: lagneshOrbInfo,
    karyesh: karyeshOrbInfo,
    aspectType: pair.aspect.type,
    aspectNameHindi: pair.aspect.hindiName,
    combinedDeeptamshaLimit: pair.combinedOrbLimit,
    actualDegreeDiff: pair.degreeDiff,
    isWithinOrb: pair.isWithinOrb,
    isApplying: pair.isApplying,
    activeYoga: 'None',
    yogaNameHindi: 'स्वतंत्र स्थिति (नो ताजिक योग)',
    yogaCategory: 'Neutral (तटस्थ)',
    subType: pair.aspect.type === 'None' ? 'अदृष्टि (Inconjunct)' : 'दीप्तांश बाह्य (Beyond Orb)',
    classicalRule: 'ताजिक नीलकण्ठी: दीप्तांश सीमा के अभाव अथवा दृष्टि के बिना ताजिक योग का निर्माण नहीं होता।',
    interpretationHindi: `लग्नेश (${p1.hindiName}) और कार्येश (${p2.hindiName}) के मध्य ताजिक दीप्तांश (${pair.combinedOrbLimit.toFixed(1)}°) के भीतर कोई सक्रिय योग (इत्थशाल/नक्त/यामया) निर्मित नहीं हो रहा है। परिणाम सामान्य पुरुषार्थ एवं तात्कालिक परिस्थितियों पर निर्भर करेगा।`,
    interpretationEnglish: `No active Tajik Yoga between Lagna lord (${p1.planet}) and Karya lord (${p2.planet}) within the allowable orb limit of ${pair.combinedOrbLimit.toFixed(1)}°. Outcome rests on general effort and circumstantial developments.`
  };
}

export class PrashnaEngine {
  private static STORAGE_KEY = 'prashna_history_v1';

  /**
   * Determine query domain & Karya Bhava (Significator House) from the question text (fallback)
   */
  public static detectQuestionCategory(question: string): { category: string; karyaBhava: number } {
    const q = question.toLowerCase();

    // Lost / Stolen
    if (q.includes('खो') || q.includes('चोरी') || q.includes('lost') || q.includes('stolen') || q.includes('missing')) {
      return { category: 'खोई / चोरी वस्तु (Lost or Stolen)', karyaBhava: 2 };
    }

    // Health
    if (q.includes('स्वास्थ्य') || q.includes('बीमार') || q.includes('रोग') || q.includes('इलाज') || 
        q.includes('health') || q.includes('disease') || q.includes('illness') || q.includes('recovery')) {
      return { category: 'स्वास्थ्य एवं आरोग्य (Health & Recovery)', karyaBhava: 1 };
    }

    // Career / Business / Job / Promotion / Work
    if (q.includes('नौकरी') || q.includes('काम') || q.includes('व्यापार') || q.includes('व्यवसाय') || 
        q.includes('पदोन्नति') || q.includes('कार्य') || q.includes('job') || q.includes('career') || 
        q.includes('business') || q.includes('work') || q.includes('promotion') || q.includes('interview')) {
      return { category: 'कार्य एवं व्यवसाय (Career & Work)', karyaBhava: 10 };
    }

    // Wealth / Money / Gains / Financial Success
    if (q.includes('धन') || q.includes('पैसा') || q.includes('रुपया') || q.includes('लाभ') || 
        q.includes('मुनाफा') || q.includes('money') || q.includes('wealth') || q.includes('profit') || 
        q.includes('financial') || q.includes('gain')) {
      return { category: 'धन एवं लाभ (Wealth & Gains)', karyaBhava: 11 };
    }

    // Marriage / Love / Relationship
    if (q.includes('विवाह') || q.includes('शादी') || q.includes('रिश्ता') || q.includes('साझेदारी') || 
        q.includes('marriage') || q.includes('partner') || q.includes('wedding') || q.includes('love') || 
        q.includes('spouse') || q.includes('relationship')) {
      return { category: 'विवाह एवं संबंध (Marriage & Partnership)', karyaBhava: 7 };
    }

    // Property / Home / Vehicle / Land
    if (q.includes('मकान') || q.includes('घर') || q.includes('जमीन') || q.includes('गाड़ी') || 
        q.includes('सम्पत्ति') || q.includes('house') || q.includes('home') || q.includes('property') || 
        q.includes('vehicle') || q.includes('car') || q.includes('land')) {
      return { category: 'भूमि, भवन व वाहन (Property & Vehicle)', karyaBhava: 4 };
    }

    // Education / Exams / Children
    if (q.includes('परीक्षा') || q.includes('शिक्षा') || q.includes('संतान') || q.includes('पढ़ाई') || 
        q.includes('exam') || q.includes('education') || q.includes('study') || q.includes('child')) {
      return { category: 'शिक्षा एवं संतान (Education & Offspring)', karyaBhava: 5 };
    }

    // Foreign / Travel / Long Journey
    if (q.includes('यात्रा') || q.includes('विदेश') || q.includes('travel') || q.includes('journey') || 
        q.includes('foreign') || q.includes('abroad') || q.includes('visa')) {
      return { category: 'यात्रा एवं विदेश (Travel & Abroad)', karyaBhava: 9 };
    }

    // Default: General Accomplishment / Wish Fulfillment
    return { category: 'सामान्य प्रश्न (General Inquiry)', karyaBhava: 1 };
  }

  /**
   * Execute real deterministic Horary astronomical calculation
   */
  public static async calculatePrashnaChart(context: PrashnaContext): Promise<PrashnaKundliData> {
    const payload = {
      dob: context.formattedDate,
      time: context.formattedTime,
      latitude: context.latitude,
      longitude: context.longitude,
      timezone: context.timezone,
      ayanamsa: context.ayanamsa || 'Lahiri'
    };

    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Calculation unavailable');
    }

    const masterData: MasterKundliData = await response.json();
    if (!masterData || !masterData.lagna || !masterData.planets) {
      throw new Error('Calculation unavailable: Incomplete astronomical data received.');
    }

    // Ascendant (Prashna Lagna)
    const lagnaSign = masterData.lagna.rashiName || 'Aries';
    const lagnaRashiNum = masterData.lagna.rashi || RASHI_NAME_TO_NUMBER[lagnaSign] || 1;
    const lagnaLord = RASHI_LORDS[lagnaRashiNum] || 'Mars';

    // Build Prashna Planets map
    const planetsRecord: Record<string, PrashnaPlanet> = {};
    const planetKeys = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    planetKeys.forEach(pKey => {
      const p = masterData.planets[pKey];
      if (p) {
        const signName = p.rashiName || 'Aries';
        const rashiNum = p.rashi || RASHI_NAME_TO_NUMBER[signName] || 1;
        planetsRecord[pKey] = {
          planet: pKey,
          hindiName: PLANET_HINDI_NAMES[pKey] || pKey,
          sign: signName,
          hindiSign: RASHI_HINDI_NAMES[rashiNum] || signName,
          rashiNumber: rashiNum,
          house: p.d1House || 1,
          degree: p.degree,
          formattedDegree: `${p.degree.toFixed(2)}°`,
          nakshatra: formatNakshatra(p.nakshatra),
          pada: p.pada || 1,
          motion: p.motionStatus || (p.isRetrograde ? 'Retrograde' : 'Direct'),
          isRetrograde: !!p.isRetrograde,
          isCombust: !!p.isCombust,
          lordOfHouses: [],
          dignity: p.dignity || 'Neutral'
        };
      }
    });

    // Determine Mode & Karya Bhava
    const selectedMode = context.mode || 'general';
    const modeConfig = getPrashnaModeConfig(selectedMode);
    const karyaBhava = modeConfig.primaryHouse || 1;
    const category = `${modeConfig.labelHindi}`;

    // Karyesh Lord determination
    const karyaHouseData = masterData.d1Chart[karyaBhava];
    const karyaRashiNum = karyaHouseData ? karyaHouseData.rashi || 1 : 1;
    const karyeshLordName = RASHI_LORDS[karyaRashiNum] || 'Mars';
    const karyeshPlanet = planetsRecord[karyeshLordName];
    const lagnaLordPlanet = planetsRecord[lagnaLord];
    const moonPlanet = planetsRecord['Moon'];

    // Relational Analysis between Lagnesh and Karyesh
    let lagneshKaryeshRelation = 'Independent Placements (स्वतंत्र स्थिति)';
    let karyaSiddhiPotential: 'Favorable' | 'Moderate' | 'Challenging' = 'Moderate';
    let karyaSiddhiReason = '';

    if (lagnaLordPlanet && karyeshPlanet) {
      if (lagnaLordPlanet.house === karyeshPlanet.house) {
        lagneshKaryeshRelation = 'Conjunction (युति संबंध - एक ही भाव में)';
        karyaSiddhiPotential = 'Favorable';
        karyaSiddhiReason = `लग्नेश (${lagnaLord}) और कार्येश (${karyeshLordName}) भाव ${lagnaLordPlanet.house} में एक साथ स्थित हैं, जो कार्य सिद्धि का प्रबल संकेत है।`;
      } else {
        const diff = Math.abs(lagnaLordPlanet.house - karyeshPlanet.house);
        const distance = Math.min(diff, 12 - diff) + 1; // distance counting

        if (diff === 6) {
          lagneshKaryeshRelation = 'Mutual Aspect (समसप्तक दृष्टि संबंध)';
          karyaSiddhiPotential = 'Favorable';
          karyaSiddhiReason = `लग्नेश (${lagnaLord}) और कार्येश (${karyeshLordName}) एक-दूसरे को पूर्ण दृष्टि से देख रहे हैं।`;
        } else if (distance === 5 || distance === 9 || diff === 4 || diff === 8) {
          lagneshKaryeshRelation = 'Trine Auspicious (नवम-पंचम त्रिकोण संबंध)';
          karyaSiddhiPotential = 'Favorable';
          karyaSiddhiReason = `लग्नेश और कार्येश के बीच 5-9 का शुभ त्रिकोण संबंध निर्मित हो रहा है।`;
        } else if (distance === 3 || distance === 11 || diff === 2 || diff === 10) {
          lagneshKaryeshRelation = 'Friendly Growth (3-11 उपचय लाभ संबंध)';
          karyaSiddhiPotential = 'Favorable';
          karyaSiddhiReason = `लग्नेश और कार्येश 3-11 के मैत्रीपूर्ण संबंध में हैं, जो पुरुषार्थ से सफलता दर्शाता है।`;
        } else if (distance === 6 || distance === 8) {
          lagneshKaryeshRelation = 'Shadashtak Tension (6-8 षडाष्टक स्थिति)';
          karyaSiddhiPotential = 'Challenging';
          karyaSiddhiReason = `लग्नेश और कार्येश के बीच 6-8 का संबंध है, जो अप्रत्याशित बाधाओं और विलंब की ओर संकेत करता है।`;
        } else if (distance === 2 || distance === 12) {
          lagneshKaryeshRelation = 'Dvidvadash (2-12 व्यय/धन संबंध)';
          karyaSiddhiPotential = 'Moderate';
          karyaSiddhiReason = `लग्नेश और कार्येश 2-12 की स्थिति में हैं, जिसमें अत्यधिक श्रम एवं व्यय के बाद परिणाम संभव हैं।`;
        } else {
          lagneshKaryeshRelation = `House Placement (${lagnaLordPlanet.house} & ${karyeshPlanet.house})`;
          karyaSiddhiPotential = 'Moderate';
          karyaSiddhiReason = `लग्नेश भाव ${lagnaLordPlanet.house} और कार्येश भाव ${karyeshPlanet.house} में स्थित हैं।`;
        }
      }
    }

    // Evaluate Classical Tajik Yogas (Ithasala, Ishrafa, Nakta, Yamaya, Kambool)
    const tajikAnalysis = evaluateTajikYogas(planetsRecord, lagnaLord, karyeshLordName);

    // If a definitive Tajik yoga is formed, integrate its classical outcome
    if (tajikAnalysis.activeYoga === 'Kambool' || tajikAnalysis.activeYoga === 'Ithasala') {
      karyaSiddhiPotential = 'Favorable';
      lagneshKaryeshRelation = `${tajikAnalysis.yogaNameHindi} [${tajikAnalysis.aspectNameHindi}]`;
      karyaSiddhiReason = `${tajikAnalysis.interpretationHindi} ${karyaSiddhiReason}`.trim();
    } else if (tajikAnalysis.activeYoga === 'Nakta' || tajikAnalysis.activeYoga === 'Yamaya') {
      karyaSiddhiPotential = 'Favorable';
      lagneshKaryeshRelation = `${tajikAnalysis.yogaNameHindi} [${tajikAnalysis.mediatorPlanet?.hindiName || ''} मध्यस्थ]`;
      karyaSiddhiReason = `${tajikAnalysis.interpretationHindi} ${karyaSiddhiReason}`.trim();
    } else if (tajikAnalysis.activeYoga === 'Ishrafa') {
      karyaSiddhiPotential = 'Challenging';
      lagneshKaryeshRelation = `${tajikAnalysis.yogaNameHindi} [पृथक्करण दृष्टि]`;
      karyaSiddhiReason = `${tajikAnalysis.interpretationHindi} ${karyaSiddhiReason}`.trim();
    }

    // Moon check: If Moon is in 6, 8, or 12, indicate caution
    if (moonPlanet && [6, 8, 12].includes(moonPlanet.house)) {
      if (karyaSiddhiPotential === 'Favorable' && tajikAnalysis.activeYoga !== 'Kambool') {
        karyaSiddhiPotential = 'Moderate';
      }
      karyaSiddhiReason += ` चंद्रमा भाव ${moonPlanet.house} में होने से मानसिक असमंजस अथवा चिंता बनी रह सकती है।`;
    }

    // Benefics in Kendra boost
    const beneficsInKendra = ['Jupiter', 'Venus', 'Mercury'].filter(b => {
      const bp = planetsRecord[b];
      return bp && [1, 4, 7, 10].includes(bp.house);
    });

    if (beneficsInKendra.length > 0 && karyaSiddhiPotential !== 'Challenging') {
      karyaSiddhiReason += ` केंद्र भाव में शुभ ग्रह (${beneficsInKendra.join(', ')}) की उपस्थिति से सहायता प्राप्त होगी।`;
    }

    // Compute Traditional Direction, Sign Nature, and Element
    const dirInfo = RASHI_TO_DIRECTION[lagnaRashiNum] || { direction: 'North', hindi: 'उत्तर दिशा (North)' };
    const moonDirInfo = moonPlanet ? RASHI_TO_DIRECTION[moonPlanet.rashiNumber] : dirInfo;
    const natureInfo = RASHI_TO_NATURE[lagnaRashiNum] || { nature: 'Fixed (Sthira)', hindi: 'स्थिर राशि (Sthira)', implication: 'स्थिरता एवं मूल स्थान के समीप उपस्थिति।' };
    const elementInfo = RASHI_TO_ELEMENT[lagnaRashiNum] || { element: 'Prithvi (Earth)', hindi: 'पृथ्वी तत्व (Prithvi)', clues: 'भूमि तल अथवा बंद कमरा।' };

    // Mode-specific recovery / outcome timing
    let recoveryProbability: 'High' | 'Moderate' | 'Low / Delayed' = 
      karyaSiddhiPotential === 'Favorable' ? 'High' : karyaSiddhiPotential === 'Moderate' ? 'Moderate' : 'Low / Delayed';
    let traditionalTiming = '';
    let timingCondition = '';

    if (selectedMode === 'lost_object') {
      const secondHouseLord = masterData.d1Chart[2]?.signLord;
      const secondLordPlanet = planetsRecord[secondHouseLord || ''];
      const isRecoverable = (secondLordPlanet && [1, 2, 4, 5, 9, 10, 11].includes(secondLordPlanet.house)) || 
                            (moonPlanet && [1, 4, 5, 9, 10, 11].includes(moonPlanet.house));

      if (isRecoverable) {
        recoveryProbability = 'High';
        traditionalTiming = natureInfo.nature === 'Movable (Chara)' 
          ? 'शीघ्र — कुछ घंटों से 1-3 दिनों के भीतर (Quick — Few hours to 3 days)' 
          : natureInfo.nature === 'Fixed (Sthira)' 
          ? 'धैर्यपूर्वक खोजने पर मूल स्थान के निकट (Near original spot with persistent search)' 
          : 'आने-जाने के मार्ग अथवा मध्यवर्ती स्थान पर 3-7 दिनों में (3-7 days in transit/entry area)';
        timingCondition = `द्वितीयेश (${secondHouseLord}) व चंद्रमा अनुकूल भाव में स्थित हैं, जो वस्तु प्राप्ति की प्रबल आशा दर्शाते हैं।`;
      } else {
        recoveryProbability = 'Low / Delayed';
        traditionalTiming = 'विलंब अथवा अतिरिक्त सघन प्रयास आवश्यक (Delayed / extensive search required)';
        timingCondition = 'द्वितीयेश अथवा चंद्रमा 6/8/12 भाव से संबंधित हैं, जिससे वस्तु छिप जाने या ढूंढने में बाधा का योग है।';
      }
    } else if (selectedMode === 'stolen_object') {
      const seventhLord = masterData.d1Chart[7]?.signLord;
      const seventhPlanet = planetsRecord[seventhLord || ''];
      if (seventhPlanet && [1, 2, 10, 11].includes(seventhPlanet.house)) {
        recoveryProbability = 'Moderate';
        traditionalTiming = 'प्रशासनिक / कानूनी प्रयासों से सुराग संभव (Lead possible through official inquiry)';
        timingCondition = 'सप्तमेश दृश्य भावों में है, जिससे वस्तु का पता चलने की संभावना निर्मित होती है।';
      } else {
        recoveryProbability = 'Low / Delayed';
        traditionalTiming = 'अप्रत्यक्ष अथवा दूर जाने का योग (Displaced or concealed)';
        timingCondition = 'सप्तम भाव अथवा अष्टम भाव पर क्रूर ग्रहों का प्रभाव अधिक है।';
      }
    } else if (selectedMode === 'yes_no') {
      traditionalTiming = karyaSiddhiPotential === 'Favorable' ? 'सकारात्मक परिणाम अनुकूल समय पर' : 'सतर्कता एवं पुनर्विचार वांछनीय';
      timingCondition = karyaSiddhiReason;
    } else {
      traditionalTiming = natureInfo.nature === 'Movable (Chara)' ? 'शीघ्र (Few days to weeks)' : natureInfo.nature === 'Fixed (Sthira)' ? 'स्थिर व धीमी गति से (Steady / gradual)' : 'मध्यम समयावधि में (Moderate period)';
      timingCondition = karyaSiddhiReason;
    }

    // Two-Option Comparative Analysis
    let twoOptionAnalysis = undefined;
    if (selectedMode === 'two_option') {
      const optA = context.supportingDetails?.optionA || 'विकल्प A (Option A)';
      const optB = context.supportingDetails?.optionB || 'विकल्प B (Option B)';
      
      const houseALord = lagnaLord;
      const planetA = planetsRecord[houseALord];
      const houseBLord = masterData.d1Chart[7]?.signLord || 'Venus';
      const planetB = planetsRecord[houseBLord];

      const evalA = `विकल्प A प्रथम भाव (लग्न) व लग्नेश (${houseALord}) से संबंधित है, जो भाव ${planetA?.house || 1} में स्थित होकर प्रच्छक की स्व-प्रेरणा एवं नियंत्रण को दर्शाता है।`;
      const evalB = `विकल्प B सप्तम भाव व उसके स्वामी (${houseBLord}) से संबंधित है, जो भाव ${planetB?.house || 7} में स्थित होकर बाहरी परिस्थितियों व सहयोगियों की भूमिका को दर्शाता है।`;

      twoOptionAnalysis = {
        optionA: {
          label: optA,
          associatedHouse: 1,
          houseLord: houseALord,
          lordDignity: planetA?.dignity || 'Neutral',
          evaluation: evalA
        },
        optionB: {
          label: optB,
          associatedHouse: 7,
          houseLord: houseBLord,
          lordDignity: planetB?.dignity || 'Neutral',
          evaluation: evalB
        },
        comparisonSummary: `दोनों विकल्पों का शास्त्रीय अध्ययन यह दर्शाता है कि ${optA} में आपके अपने पुरुषार्थ की प्रमुखता रहेगी, जबकि ${optB} बाहरी कारकों व साझेदारी के समर्थन पर अधिक निर्भर रहेगा। किसी विकल्प को पूर्णतः श्रेष्ठ या हीन नहीं माना जा सकता; अंतिम चयन आपकी प्राथमिकताओं पर आधारित होना चाहिए।`
      };
    }

    // Cautions and Disclaimers
    const cautionsAndDisclaimers: string[] = [];
    if (modeConfig.disclaimer) {
      cautionsAndDisclaimers.push(modeConfig.disclaimer);
    }
    cautionsAndDisclaimers.push('प्रश्न शास्त्र क्षणिक खगोलीय ऊर्जा एवं संभावनाओं का दर्पण है। यह अटल नियति का दावा नहीं करता; विवेक एवं पुरुषार्थ (Righteous Effort) ही परिणाम को वास्तविक रूप देते हैं।');

    const traditionalAnalysis: PrashnaTraditionalAnalysis = {
      mode: selectedMode,
      modeLabel: modeConfig.labelHindi,
      modeCategory: modeConfig.category,
      primaryHouse: modeConfig.primaryHouse,
      secondaryHouses: modeConfig.secondaryHouses,
      primarySignificator: modeConfig.primarySignificator,
      secondarySignificators: modeConfig.secondarySignificators,
      directionIndicator: {
        direction: dirInfo.direction,
        hindiDirection: dirInfo.hindi,
        basis: `लग्न राशि ${lagnaSign} (${dirInfo.hindi}) एवं चंद्र राशि ${moonPlanet?.sign || ''} (${moonDirInfo?.hindi}) का शास्त्रीय संयोजन`
      },
      signNatureIndicator: {
        nature: natureInfo.nature,
        hindiNature: natureInfo.hindi,
        implication: natureInfo.implication
      },
      elementIndicator: {
        element: elementInfo.element,
        hindiElement: elementInfo.hindi,
        locationClues: elementInfo.clues
      },
      recoveryOrOutcomeTiming: {
        probability: recoveryProbability,
        traditionalTimingEstimate: traditionalTiming,
        astrologicalCondition: timingCondition
      },
      twoOptionAnalysis,
      cautionsAndDisclaimers
    };

    const significators: PrashnaSignificators = {
      lagnaLord: {
        planet: lagnaLord,
        house: lagnaLordPlanet?.house || 1,
        sign: lagnaLordPlanet?.sign || lagnaSign,
        dignity: lagnaLordPlanet?.dignity || 'Neutral'
      },
      moon: {
        sign: moonPlanet?.sign || 'Unavailable',
        house: moonPlanet?.house || 1,
        nakshatra: moonPlanet?.nakshatra || 'Unavailable',
        pada: moonPlanet?.pada || 1,
        dignity: moonPlanet?.dignity || 'Neutral'
      },
      questionCategory: category,
      karyaBhava,
      karyeshLord: {
        house: karyaBhava,
        lord: karyeshLordName,
        sign: karyeshPlanet?.sign || 'Unavailable',
        currentHouse: karyeshPlanet?.house || karyaBhava,
        dignity: karyeshPlanet?.dignity || 'Neutral'
      },
      lagneshKaryeshRelation,
      karyaSiddhiPotential,
      karyaSiddhiReason: karyaSiddhiReason.trim(),
      tajikYogaName: tajikAnalysis.activeYoga,
      tajikRelationHindi: tajikAnalysis.yogaNameHindi
    };

    const prashnaId = `prashna_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    return {
      prashnaId,
      mode: selectedMode,
      context,
      ascendant: {
        sign: lagnaSign,
        hindiSign: RASHI_HINDI_NAMES[lagnaRashiNum] || lagnaSign,
        rashiNumber: lagnaRashiNum,
        degree: masterData.lagna.degree,
        formattedDegree: `${masterData.lagna.degree.toFixed(2)}°`,
        nakshatra: formatNakshatra(masterData.lagna.nakshatra),
        pada: masterData.lagna.pada || 1,
        lord: lagnaLord
      },
      planets: planetsRecord,
      d1Chart: masterData.d1Chart,
      bhavaChart: masterData.bhavaChart,
      significators,
      traditionalAnalysis,
      tajikAnalysis,
      calculationVersion: 'Prashna_SwissEph_Lahiri_v2.0_Tajik',
      source: 'PrashnaCalculationEngine',
      timestamp: new Date().toISOString(),
      warnings: masterData.warnings || []
    };
  }

  /**
   * Question History Management partitioned by profileId (Family privacy)
   */
  public static getHistory(profileId?: string): PrashnaHistoryItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const list: PrashnaHistoryItem[] = Array.isArray(parsed) ? parsed : [];
      if (profileId) {
        return list.filter(item => !item.profileId || item.profileId === profileId);
      }
      return list;
    } catch (e) {
      console.error('Failed to load Prashna history:', e);
      return [];
    }
  }

  public static saveHistoryItem(item: PrashnaHistoryItem): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const list: PrashnaHistoryItem[] = raw ? JSON.parse(raw) : [];
      // Keep most recent 50 items
      const updated = [item, ...list.filter(h => h.id !== item.id)].slice(0, 50);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save Prashna history item:', e);
    }
  }

  public static deleteHistoryItem(id: string): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const list: PrashnaHistoryItem[] = raw ? JSON.parse(raw) : [];
      const updated = list.filter(h => h.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete Prashna history item:', e);
    }
  }

  public static clearHistory(profileId?: string): void {
    try {
      if (!profileId) {
        localStorage.removeItem(this.STORAGE_KEY);
        return;
      }
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const list: PrashnaHistoryItem[] = raw ? JSON.parse(raw) : [];
      const updated = list.filter(h => h.profileId && h.profileId !== profileId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to clear Prashna history for profile:', e);
    }
  }
}
