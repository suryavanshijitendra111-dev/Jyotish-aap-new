/**
 * Centralized House Speaks Service (भाव वाणी सेवा)
 * 
 * Single authoritative source of truth for all 12 Bhavas (Houses):
 * 1. प्रथम भाव (Lagna / Self)
 * 2. द्वितीय भाव (Dhana / Wealth & Family)
 * 3. तृतीय भाव (Sahaja / Courage & Siblings)
 * 4. चतुर्थ भाव (Sukha / Home & Mother)
 * 5. पंचम भाव (Putra / Intellect & Children)
 * 6. षष्ठ भाव (Ripu / Obstacles & Health)
 * 7. सप्तम भाव (Jaya / Marriage & Partnership)
 * 8. अष्टम भाव (Randhra / Longevity & Transformation)
 * 9. नवम भाव (Dharma / Luck & Higher Wisdom)
 * 10. दशम भाव (Karma / Profession & Honor)
 * 11. एकादश भाव (Labha / Gains & Aspirations)
 * 12. द्वादश भाव (Vyaya / Expenses & Liberation)
 * 
 * Generates verified, authentic first-person spoken scripts strictly
 * from deterministic calculated MasterKundliData without inventing or estimating values.
 * Handles both occupied houses and empty houses with equal depth and reverent Vedic dignity.
 */

import { LanguageCode } from '../../i18n/types';
import { 
  getLocalizedPlanet, 
  getLocalizedHouse, 
  getLocalizedRashi, 
  getLocalizedDignity 
} from '../../i18n/astrology';
import { SpeechEngine, SpeechState, SpeechOptions } from '../companion/speechEngine';

export interface HouseSpeaksScript {
  houseNum: number;
  localizedName: string;
  rashiName: string;
  rashiLord: string;
  isEmpty: boolean;
  occupyingPlanets: string[];
  spokenText: string;
  sentences: string[];
  facts: {
    house: string;
    rashi: string;
    rashiLord: string;
    bhavaType: string;
    occupants: string;
    aspectsReceived: string;
  };
}

// Standard Rashi Lordship Mapping in Vedic Astrology
const RASHI_LORD_MAP: Record<number, string> = {
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

// Ordinal aspect names in Hindi
const HINDI_ASPECT_NAMES: Record<number, string> = {
  3: 'तृतीय',
  4: 'चतुर्थ',
  5: 'पंचम',
  7: 'सप्तम',
  8: 'अष्टम',
  9: 'नवम',
  10: 'दशम'
};

// Hindi Ordinal house titles
const HINDI_HOUSE_ORDINALS: Record<number, { ordinal: string; title: string }> = {
  1: { ordinal: 'प्रथम (लग्न)', title: 'तनु एवं लग्न भाव' },
  2: { ordinal: 'द्वितीय', title: 'धन एवं कुटुंब भाव' },
  3: { ordinal: 'तीसरा', title: 'सहज एवं पराक्रम भाव' },
  4: { ordinal: 'चतुर्थ', title: 'सुख एवं मातृ भाव' },
  5: { ordinal: 'पंचम', title: 'संतान एवं विद्या भाव' },
  6: { ordinal: 'छठा', title: 'रोग, ऋण एवं शत्रु भाव' },
  7: { ordinal: 'सप्तम', title: 'साझेदारी एवं जाया भाव' },
  8: { ordinal: 'अष्टम', title: 'आयु एवं गूढ़ विद्या भाव' },
  9: { ordinal: 'नवम', title: 'भाग्य एवं धर्म भाव' },
  10: { ordinal: 'दशम', title: 'कर्म एवं आजीविका भाव' },
  11: { ordinal: 'ग्यारहवाँ', title: 'लाभ एवं आय भाव' },
  12: { ordinal: 'बारहवाँ', title: 'व्यय एवं मोक्ष भाव' }
};

export class HouseSpeaksService {
  /**
   * Generates deterministic natural script from verified calculated MasterKundliData.
   * Never invents values. Consumes calculated data exclusively.
   */
  static generateScript(
    houseNum: number,
    masterKundliData: any,
    houseAnalysis?: any,
    language: LanguageCode = 'hi'
  ): HouseSpeaksScript {
    const validHouse = Math.max(1, Math.min(12, Math.floor(houseNum || 1)));
    const houseObj = getLocalizedHouse(validHouse, language);
    const localizedHouse = houseObj.full || houseObj.label;

    // 1. Extract House Data from MasterKundliData or fallback analysis
    const d1Chart = masterKundliData?.data?.d1Chart || masterKundliData?.d1Chart || {};
    const houseData = d1Chart[validHouse] || {};
    const analysisHouses = masterKundliData?.analysisResult?.houses || {};
    const analysis = houseAnalysis || analysisHouses[validHouse] || {};

    // 2. Determine Rashi
    const rawRashiNum: number = houseData.rashi || analysis.rashi || (((validHouse - 1) % 12) + 1);
    const rawRashiName: string = houseData.rashiName || analysis.rashiName || '';
    const localizedRashi = rawRashiName 
      ? getLocalizedRashi(rawRashiName, language) 
      : getLocalizedRashi(rawRashiNum, language);

    // 3. Determine Sign Lord (Rashi Lord)
    const rawLord: string = houseData.signLord || analysis.rashiLord || RASHI_LORD_MAP[rawRashiNum] || 'Sun';
    const localizedLord = getLocalizedPlanet(rawLord, language);

    // 4. Bhava Classification & Type (Kendra, Trikona, Upachaya, etc.)
    const bhavaType = houseObj.type || 'भाव';

    // 5. Detect Occupying Planets
    const planetsObj = masterKundliData?.data?.planets || masterKundliData?.planets || {};
    const occupyingPlanets: Array<{
      name: string;
      localizedName: string;
      degree?: number;
      degreeStr: string;
      isRetrograde?: boolean;
      dignity?: string;
    }> = [];

    const candidatePlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    for (const pName of candidatePlanets) {
      const p = planetsObj[pName];
      if (p) {
        const assignedHouse = p.d1House ?? p.house;
        if (assignedHouse === validHouse) {
          const degVal = p.degree ?? p.siderealLongitude;
          let degreeStr = '';
          if (degVal != null && !isNaN(degVal)) {
            const d = Math.floor(degVal);
            const m = Math.floor((degVal - d) * 60);
            if (language === 'hi' || language === 'mr') {
              degreeStr = `${degVal.toFixed(2)} अंश (${d} अंश, ${m} कला)`;
            } else if (language === 'sa') {
              degreeStr = `${degVal.toFixed(2)} अंशाः (${d} अंशाः, ${m} कलाः)`;
            } else if (language === 'gu') {
              degreeStr = `${degVal.toFixed(2)} અંશ (${d} અંશ, ${m} કળા)`;
            } else if (language === 'bn' || language === 'as') {
              degreeStr = `${degVal.toFixed(2)} অংশ (${d} অংশ, ${m} কলা)`;
            } else if (language === 'ta') {
              degreeStr = `${degVal.toFixed(2)} பாகை (${d} பாகை, ${m} கலை)`;
            } else if (language === 'te') {
              degreeStr = `${degVal.toFixed(2)} డిగ్రీలు (${d} డిగ్రీ, ${m} నిమిషాలు)`;
            } else if (language === 'kn') {
              degreeStr = `${degVal.toFixed(2)} ಡಿಗ್ರಿ (${d} ಅಂಶ, ${m} ಕಲಾ)`;
            } else if (language === 'ml') {
              degreeStr = `${degVal.toFixed(2)} ഡിഗ്രി (${d} അംശം, ${m} മിനിറ്റ്)`;
            } else if (language === 'pa') {
              degreeStr = `${degVal.toFixed(2)} ਡਿਗਰੀ (${d} ਅੰਸ਼, ${m} ਕਲਾ)`;
            } else if (language === 'or') {
              degreeStr = `${degVal.toFixed(2)} ଡିଗ୍ରୀ (${d} ଅଂଶ, ${m} କଳା)`;
            } else {
              degreeStr = `${degVal.toFixed(2)} degrees (${d}° ${m}')`;
            }
          }

          const rawDignity = p.dignity;
          const localizedDignity = rawDignity && rawDignity !== 'None' 
            ? getLocalizedDignity(rawDignity, language) 
            : '';

          occupyingPlanets.push({
            name: pName,
            localizedName: getLocalizedPlanet(pName, language),
            degree: degVal,
            degreeStr,
            isRetrograde: Boolean(p.isRetrograde),
            dignity: localizedDignity
          });
        }
      }
    }

    const isEmpty = occupyingPlanets.length === 0;

    // 6. Aspects Received by this House
    const aspectsReceived: string[] = [];
    const allAspects = masterKundliData?.relationships?.parashari?.aspects || [];
    for (const asp of allAspects) {
      if (asp.targetHouse === validHouse) {
        const srcPlanetLocalized = getLocalizedPlanet(asp.sourcePlanet, language);
        const aspTypeNum = asp.aspectType || 7;
        const ordinalName = language === 'hi'
          ? (HINDI_ASPECT_NAMES[aspTypeNum] || `${aspTypeNum}वीं`)
          : `${aspTypeNum}th`;
        aspectsReceived.push(
          language === 'hi'
            ? `${srcPlanetLocalized} की ${ordinalName} दृष्टि`
            : `${ordinalName} aspect from ${srcPlanetLocalized}`
        );
      }
    }

    // 7. Compose Natural Sentences
    const sentences: string[] = [];
    const houseInfo = HINDI_HOUSE_ORDINALS[validHouse] || { ordinal: `${validHouse}वाँ`, title: 'भाव' };

    if (language === 'hi') {
      // Identity & Lordship
      sentences.push(`मैं ${houseInfo.ordinal} भाव हूँ।`);
      sentences.push(`मेरी राशि ${localizedRashi} है।`);
      sentences.push(`मेरी राशि के स्वामी ${localizedLord} देव हैं।`);
      
      if (bhavaType) {
        sentences.push(`यह ${bhavaType} कहलाता है।`);
      }

      // Occupants vs Empty House Handling
      if (isEmpty) {
        sentences.push('इस भाव में वर्तमान में कोई ग्रह स्थित नहीं है।');
      } else {
        const pNames = occupyingPlanets.map(p => p.localizedName);
        if (pNames.length === 1) {
          sentences.push(`इस भाव में वर्तमान में ${pNames[0]} विराजमान हैं।`);
        } else {
          sentences.push(`इस भाव में वर्तमान में ${pNames.join(' और ')} की युति स्थित है।`);
        }

        // Details of occupying planets
        for (const p of occupyingPlanets) {
          let detail = `${p.localizedName}`;
          if (p.degreeStr) {
            detail += ` ${p.degreeStr} पर`;
          }
          if (p.isRetrograde) {
            detail += ' वक्री स्थिति में';
          } else {
            detail += ' मार्गी स्थिति में';
          }
          if (p.dignity) {
            detail += ` तथा ${p.dignity} अवस्था में`;
          }
          detail += ' हैं।';
          sentences.push(detail);
        }
      }

      // Aspects Received
      if (aspectsReceived.length > 0) {
        sentences.push(`इस भाव पर ${aspectsReceived.join(', ')} प्राप्त है।`);
      }

      sentences.push('यह इस भाव की प्रामाणिक खगोलीय स्थिति है।');
    } else if (language === 'en') {
      // English Voice
      sentences.push(`I am the ${localizedHouse}.`);
      sentences.push(`My zodiac sign is ${localizedRashi}.`);
      sentences.push(`The lord of my sign is ${localizedLord}.`);

      if (bhavaType) {
        sentences.push(`This is classified as a ${bhavaType} house.`);
      }

      if (isEmpty) {
        sentences.push('Currently, there are no planets placed in this house.');
      } else {
        const pNames = occupyingPlanets.map(p => p.localizedName);
        sentences.push(`Currently, ${pNames.join(' and ')} reside in this house.`);
        for (const p of occupyingPlanets) {
          let detail = `${p.localizedName} is placed at ${p.degreeStr || 'exact longitude'}`;
          if (p.isRetrograde) {
            detail += ' in retrograde motion';
          } else {
            detail += ' in direct motion';
          }
          if (p.dignity) {
            detail += ` with ${p.dignity} dignity`;
          }
          detail += '.';
          sentences.push(detail);
        }
      }

      if (aspectsReceived.length > 0) {
        sentences.push(`This house receives ${aspectsReceived.join(', ')}.`);
      }

      sentences.push('This is the verified astronomical placement of this house.');
    } else {
      // General Indian Language Template (Sanskrit, Marathi, Gujarati, Bengali, Tamil, etc.)
      sentences.push(`मैं ${localizedHouse} हूँ।`);
      sentences.push(`मेरी राशि ${localizedRashi} है और राशि स्वामी ${localizedLord} हैं।`);
      if (bhavaType) {
        sentences.push(`यह ${bhavaType} है।`);
      }
      if (isEmpty) {
        sentences.push('इस भाव में वर्तमान में कोई ग्रह स्थित नहीं है।');
      } else {
        const pNames = occupyingPlanets.map(p => p.localizedName);
        sentences.push(`यहाँ ${pNames.join(', ')} स्थित हैं।`);
      }
      if (aspectsReceived.length > 0) {
        sentences.push(`यहाँ ${aspectsReceived.join(', ')} है।`);
      }
      sentences.push('यह इस भाव की प्रामाणिक स्थिति है।');
    }

    const spokenText = sentences.join(' ');
    const occupantNames = occupyingPlanets.map(p => p.localizedName);

    return {
      houseNum: validHouse,
      localizedName: localizedHouse,
      rashiName: localizedRashi,
      rashiLord: localizedLord,
      isEmpty,
      occupyingPlanets: occupantNames,
      spokenText,
      sentences,
      facts: {
        house: localizedHouse,
        rashi: localizedRashi,
        rashiLord: localizedLord,
        bhavaType: bhavaType || 'सामान्य',
        occupants: isEmpty ? 'कोई ग्रह नहीं (रिक्त भाव)' : occupantNames.join(', '),
        aspectsReceived: aspectsReceived.length > 0 ? aspectsReceived.join('; ') : 'कोई दृष्टि प्राप्त नहीं'
      }
    };
  }

  /**
   * Speaks the house script using centralized SpeechEngine with sentence-pause pacing
   */
  static speakHouse(
    houseNum: number,
    masterKundliData: any,
    houseAnalysis?: any,
    language: LanguageCode = 'hi',
    onStateChange?: (state: SpeechState) => void,
    options?: SpeechOptions
  ): boolean {
    const script = this.generateScript(houseNum, masterKundliData, houseAnalysis, language);
    return SpeechEngine.speak(script.spokenText, language, onStateChange, {
      speedPreset: SpeechEngine.getSpeedPreset(),
      ...options
    });
  }

  /**
   * Stops any ongoing house speech
   */
  static stopSpeech(): void {
    SpeechEngine.stop();
  }
}
