/**
 * Centralized Varga Chart Speaks Service (वर्ग कुंडली वाणी सेवा)
 * 
 * Generates verified first-person natural spoken scripts for:
 * 1. Planets in any Shodashavarga Divisional Chart (D9, D10, D2, D3, D4, D7, D12, D30, D60)
 * 2. Houses in any Shodashavarga Divisional Chart (both occupied and empty houses)
 * 
 * Reuses SpeechEngine, existing localized astrology helpers, and pure Devanagari Hindi
 * narration without fabricated or synthetic data.
 */

import { LanguageCode } from '../../i18n/types';
import {
  getLocalizedPlanet,
  getLocalizedHouse,
  getLocalizedRashi,
  getLocalizedNakshatra
} from '../../i18n/astrology';

export interface VargaSpeaksScript {
  title: string;
  spokenText: string;
  sentences: string[];
  facts: Record<string, string>;
}

// Classical Rashi Lordship Mapping in Vedic Astrology
export const VARGA_RASHI_LORDS: Record<number, string> = {
  1: 'Mars',      // Aries / मेष -> मंगल
  2: 'Venus',     // Taurus / वृषभ -> शुक्र
  3: 'Mercury',   // Gemini / मिथुन -> बुध
  4: 'Moon',      // Cancer / कर्क -> चंद्र
  5: 'Sun',       // Leo / सिंह -> सूर्य
  6: 'Mercury',   // Virgo / कन्या -> बुध
  7: 'Venus',     // Libra / तुला -> शुक्र
  8: 'Mars',      // Scorpio / वृश्चिक -> मंगल
  9: 'Jupiter',   // Sagittarius / धनु -> गुरु
  10: 'Saturn',   // Capricorn / मकर -> शनि
  11: 'Saturn',   // Aquarius / कुंभ -> शनि
  12: 'Jupiter'   // Pisces / मीन -> गुरु
};

export const RASHI_NAMES_LIST = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Traditional House Classifications
export function getHouseClassification(houseNum: number, language: LanguageCode = 'hi'): {
  name: string;
  description: string;
} {
  const isHindi = language === 'hi' || (language as string) === 'Hindi' || language === 'sa';

  if ([1, 4, 7, 10].includes(houseNum)) {
    return {
      name: isHindi ? 'केंद्र भाव (Kendra)' : 'Kendra (Angular House)',
      description: isHindi
        ? 'यह कुंडली के आधार स्तंभों में से एक महत्वपूर्ण केंद्र भाव है जो स्थिरता और शक्ति प्रदान करता है।'
        : 'This is one of the four cornerstone Kendra houses representing strength, stability and action.'
    };
  }

  if ([1, 5, 9].includes(houseNum)) {
    return {
      name: isHindi ? 'त्रिकोण भाव (Trikona)' : 'Trikona (Trine House)',
      description: isHindi
        ? 'यह अत्यंत शुभ धर्म त्रिकोण भाव है जो पूर्व पुण्य, बुद्धि और ईश्वरीय कृपा का द्योतक है।'
        : 'This is a highly auspicious Trikona house representing past merits, intellect and divine grace.'
    };
  }

  if ([3, 6, 10, 11].includes(houseNum)) {
    return {
      name: isHindi ? 'उपचय भाव (Upachaya)' : 'Upachaya (Growth House)',
      description: isHindi
        ? 'यह उपचय भाव है जो निरंतर प्रयास, विकास और समय के साथ प्रगति को दर्शाता है।'
        : 'This is an Upachaya house representing continuous effort, steady growth and elevation over time.'
    };
  }

  if ([6, 8, 12].includes(houseNum)) {
    return {
      name: isHindi ? 'त्रिक भाव (Dusthana)' : 'Dusthana (Trika House)',
      description: isHindi
        ? 'यह त्रिक भाव है जो आत्म-साधना, चुनौतियों, शोध और प्रारब्ध के कर्म बंधनों से संबंधित है।'
        : 'This is a Dusthana house representing challenges, deeper research, endurance and karmic transformation.'
    };
  }

  return {
    name: isHindi ? 'पणफर भाव (Panaphara)' : 'Succedent House',
    description: isHindi
      ? 'यह धन, कुटुंब और जीवन के संसाधनों के संतुलन का भाव है।'
      : 'This is a house governing resources, family and sustaining values.'
  };
}

// Traditional Varga Spiritual/Astronomical Significance
export const VARGA_SIGNIFICANCE_SPEECH: Record<string, { hi: string; en: string }> = {
  D9: {
    hi: 'नवांश कुंडली जातक के सूक्ष्म धर्म, आंतरिक आत्मबल, भाग्य और दांपत्य जीवन का मुख्य आधार है।',
    en: 'Navamsha is the definitive divisional chart for inner strength, dharma, fortune and marital harmony.'
  },
  D10: {
    hi: 'दशमांश कुंडली आजीविका, करियर, व्यावसायिक प्रतिष्ठा और समाज में कर्म क्षेत्र को दिशा देती है।',
    en: 'Dasamsha governs profession, career milestones, executive leadership and social status.'
  },
  D2: {
    hi: 'होरा चक्र वित्तीय समृद्धि, संपत्ति संग्रह और जीवन में आर्थिक स्थिरता का द्योतक है।',
    en: 'Hora is the divisional chart for financial prosperity, assets accumulation and wealth.'
  },
  D3: {
    hi: 'द्रेष्काण चक्र पराक्रम, बंधु-बांधवों, छोटे भाई-बहनों और कार्य में ऊर्जा का प्रतिनिधित्व करता है।',
    en: 'Drekkana reflects inherent courage, vitality, sibling relations and dynamic action.'
  },
  D4: {
    hi: 'चतुर्थांश चक्र स्थायी संपदा, भूमि, भवन और अंतःसुख का विश्लेषण करता है।',
    en: 'Chaturthamsha maps fixed assets, home, land, conveyances and inner emotional fulfillment.'
  },
  D7: {
    hi: 'सप्तांश चक्र संतान सुख, कुल वृद्धि और रचनात्मक क्षमता का कारक है।',
    en: 'Saptamsha governs progeny, lineage expansion, children and deep creative expressions.'
  },
  D12: {
    hi: 'द्वादशांश चक्र माता-पिता के सुख, कुल परंपरा और पूर्वजों के आशीर्वाद का विश्लेषण करता है।',
    en: 'Dwadashamsha illuminates parental heritage, ancestral roots and generational blessings.'
  },
  D30: {
    hi: 'त्रिंशांश चक्र जीवन में आने वाली अचानक बाधाओं, अरिष्ट और स्वास्थ्य चुनौतियों से सतर्कता का सूक्ष्म चक्र है।',
    en: 'Trimshamsha is consulted to identify sudden adversities, obstacles and protective remedies.'
  },
  D60: {
    hi: 'षष्ट्यंश चक्र पूर्व जन्म के संचित कर्मों, सूक्ष्म प्रारब्ध और जीवन के गहनतम रहस्यों को प्रकट करता है।',
    en: 'Shashtiamsha is the ultimate Parashari microscopic chart revealing past life karma and deep destiny.'
  }
};

export class VargaSpeaksService {
  /**
   * Generates pure first-person spoken script for a planet in a divisional chart.
   */
  static generatePlanetScript(
    planetName: string,
    vargaKey: string,
    vargaNameHi: string,
    vargaNameEn: string,
    houseNum: number,
    rashiNum: number,
    masterData: any,
    language: LanguageCode = 'hi'
  ): VargaSpeaksScript {
    const isHindi = language === 'hi' || (language as string) === 'Hindi' || language === 'sa';
    const localizedPlanet = getLocalizedPlanet(planetName, language);
    const rashiName = RASHI_NAMES_LIST[rashiNum - 1] || 'Aries';
    const localizedRashi = getLocalizedRashi(rashiName, language);
    const houseObj = getLocalizedHouse(houseNum, language);
    const localizedHouse = houseObj.full || houseObj.label;

    const rashiLordKey = VARGA_RASHI_LORDS[rashiNum] || 'Mars';
    const localizedLord = getLocalizedPlanet(rashiLordKey, language);

    // Extract genuine planetary facts from masterData
    const pMaster = masterData?.planets?.[planetName];
    const isRetro = Boolean(pMaster?.isRetrograde);
    const nakName = pMaster?.nakshatraName;
    const localizedNak = nakName ? getLocalizedNakshatra(nakName, language) : '';
    const padaNum = pMaster?.pada;
    const degVal = pMaster?.degree;

    let degStr = '';
    if (degVal != null && !isNaN(degVal)) {
      const d = Math.floor(degVal);
      const m = Math.floor((degVal - d) * 60);
      degStr = isHindi ? `${d} अंश ${m} कला` : `${d}° ${m}'`;
    }

    const sigObj = VARGA_SIGNIFICANCE_SPEECH[vargaKey] || {
      hi: `${vargaNameHi} वैदिक ज्योतिष का प्रामाणिक सूक्ष्म वर्ग चक्र है।`,
      en: `${vargaNameEn} is a classic Parashari harmonic divisional chart.`
    };

    const sentences: string[] = [];

    if (isHindi) {
      sentences.push(`मैं ${localizedPlanet} हूँ।`);
      sentences.push(`आपकी ${vargaNameHi} में मैं ${localizedHouse} में, ${localizedRashi} राशि में स्थित हूँ।`);
      sentences.push(`इस राशि के स्वामी ${localizedLord} हैं।`);
      sentences.push(isRetro ? 'इस समय मेरी चाल वक्री है।' : 'मेरी चाल मार्गी है।');

      if (degStr) {
        sentences.push(`जन्म लग्न चक्र में मेरा अंश ${degStr} है।`);
      }
      if (localizedNak) {
        sentences.push(`मेरा नक्षत्र ${localizedNak}${padaNum ? ` के ${padaNum} चरण` : ''} है।`);
      }

      sentences.push(sigObj.hi);
      sentences.push('यह इस वर्ग चक्र में मेरी प्रामाणिक और शुद्ध गणितीय स्थिति है।');
    } else {
      sentences.push(`I am ${localizedPlanet}.`);
      sentences.push(`In your ${vargaNameEn} divisional chart, I reside in the ${localizedHouse}, in the sign of ${localizedRashi}.`);
      sentences.push(`This sign is ruled by ${localizedLord}.`);
      sentences.push(isRetro ? 'My current celestial motion is Retrograde.' : 'My motion is Direct.');

      if (degStr) {
        sentences.push(`My longitude in the natal chart is ${degStr}.`);
      }
      if (localizedNak) {
        sentences.push(`My nakshatra placement is ${localizedNak}${padaNum ? ` (Pada ${padaNum})` : ''}.`);
      }

      sentences.push(sigObj.en);
      sentences.push('This represents my verified astronomical placement in this divisional chart.');
    }

    const spokenText = sentences.join(' ');

    return {
      title: `${localizedPlanet} - ${isHindi ? vargaNameHi : vargaNameEn}`,
      spokenText,
      sentences,
      facts: {
        planet: localizedPlanet,
        varga: isHindi ? vargaNameHi : vargaNameEn,
        house: localizedHouse,
        rashi: localizedRashi,
        rashiLord: localizedLord,
        motion: isRetro ? (isHindi ? 'वक्री (Retrograde)' : 'Retrograde') : (isHindi ? 'मार्गी (Direct)' : 'Direct'),
        degree: degStr || 'N/A',
        nakshatra: localizedNak ? `${localizedNak}${padaNum ? ` (${padaNum})` : ''}` : 'N/A',
        source: isHindi ? 'प्रामाणिक वर्ग गणना (VargaEngine)' : 'Verified VargaEngine Calculations'
      }
    };
  }

  /**
   * Generates pure first-person spoken script for a house in a divisional chart.
   * Handles both occupied and completely empty houses.
   */
  static generateHouseScript(
    houseNum: number,
    vargaKey: string,
    vargaNameHi: string,
    vargaNameEn: string,
    rashiNum: number,
    occupyingPlanets: string[],
    language: LanguageCode = 'hi'
  ): VargaSpeaksScript {
    const isHindi = language === 'hi' || (language as string) === 'Hindi' || language === 'sa';
    const houseObj = getLocalizedHouse(houseNum, language);
    const localizedHouse = houseObj.full || houseObj.label;
    const rashiName = RASHI_NAMES_LIST[rashiNum - 1] || 'Aries';
    const localizedRashi = getLocalizedRashi(rashiName, language);
    const rashiLordKey = VARGA_RASHI_LORDS[rashiNum] || 'Mars';
    const localizedLord = getLocalizedPlanet(rashiLordKey, language);

    const classification = getHouseClassification(houseNum, language);
    const isEmpty = !occupyingPlanets || occupyingPlanets.length === 0;

    const sigObj = VARGA_SIGNIFICANCE_SPEECH[vargaKey] || {
      hi: `${vargaNameHi} सूक्ष्म फल विचार का विशिष्ट चक्र है।`,
      en: `${vargaNameEn} provides detailed insight into this domain of life.`
    };

    const sentences: string[] = [];

    if (isHindi) {
      sentences.push(`यह ${vargaNameHi} का ${localizedHouse} है।`);
      sentences.push(`इस भाव में ${localizedRashi} राशि उदित है, जिसके स्वामी ग्रह ${localizedLord} हैं।`);
      sentences.push(`पारंपरिक रूप से यह ${classification.name} है। ${classification.description}`);

      if (isEmpty) {
        sentences.push('वर्तमान में यह भाव रिक्त है, इसमें कोई भी ग्रह स्थित नहीं है।');
        sentences.push(`वैदिक वर्ग ज्योतिष के अनुसार, रिक्त भाव का संपूर्ण फल इसके भावाधिपति ${localizedLord} की स्थिति, बल और दृष्टि से संचालित होता है।`);
      } else {
        const localizedOccupants = occupyingPlanets.map(p => getLocalizedPlanet(p, language));
        sentences.push(`इस भाव में ${localizedOccupants.join(' तथा ')} विराजमान हैं, जो इस वर्ग चक्र के इस भाव को सक्रिय करते हैं।`);
      }

      sentences.push(sigObj.hi);
      sentences.push('यह विश्लेषण प्रामाणिक वैदिक वर्ग गणना पर आधारित है।');
    } else {
      sentences.push(`This is the ${localizedHouse} of the ${vargaNameEn} chart.`);
      sentences.push(`The sign of this house is ${localizedRashi}, ruled by ${localizedLord}.`);
      sentences.push(`Traditionally, this is classified as a ${classification.name}. ${classification.description}`);

      if (isEmpty) {
        sentences.push('This house is currently empty, with no occupying planets.');
        sentences.push(`In Vedic divisional astrology, an empty house operates under the stewardship of its sign lord ${localizedLord}.`);
      } else {
        const localizedOccupants = occupyingPlanets.map(p => getLocalizedPlanet(p, language));
        sentences.push(`This house is occupied by ${localizedOccupants.join(' and ')}, channeling their influences into this divisional domain.`);
      }

      sentences.push(sigObj.en);
      sentences.push('This analysis is based on verified classical Parashari calculations.');
    }

    const spokenText = sentences.join(' ');

    return {
      title: `${localizedHouse} - ${isHindi ? vargaNameHi : vargaNameEn}`,
      spokenText,
      sentences,
      facts: {
        varga: isHindi ? vargaNameHi : vargaNameEn,
        house: localizedHouse,
        houseNum: String(houseNum),
        rashi: localizedRashi,
        rashiLord: localizedLord,
        classification: classification.name,
        occupancy: isEmpty ? (isHindi ? 'रिक्त भाव (Empty)' : 'Empty House') : occupyingPlanets.join(', '),
        source: isHindi ? 'प्रामाणिक वर्ग गणना (VargaEngine)' : 'Verified VargaEngine Calculations'
      }
    };
  }
}
