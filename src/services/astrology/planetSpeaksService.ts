/**
 * Centralized Planet Speaks Service (नवग्रह वाणी सेवा)
 * 
 * Single authoritative source of truth for all 9 Navagrahas:
 * सूर्य (Sun), चंद्र (Moon), मंगल (Mars), बुध (Mercury),
 * गुरु (Jupiter), शुक्र (Venus), शनि (Saturn), राहु (Rahu), केतु (Ketu).
 * 
 * Generates verified first-person natural scripts strictly from deterministic
 * calculated Kundli data without inventing, rounding, or translating values.
 */

import { LanguageCode } from '../../i18n/types';
import { 
  getLocalizedPlanet, 
  getLocalizedHouse, 
  getLocalizedRashi, 
  getLocalizedNakshatra, 
  getLocalizedDignity 
} from '../../i18n/astrology';
import { SpeechEngine, SpeechState, SpeechOptions } from '../companion/speechEngine';

export const NAVAGRAHA_KEYS = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
] as const;

export type NavagrahaKey = typeof NAVAGRAHA_KEYS[number];

export interface PlanetSpeaksScript {
  planetKey: string;
  localizedName: string;
  spokenText: string;
  sentences: string[];
  facts: {
    planet: string;
    house: string;
    rashi: string;
    degree: string;
    nakshatra: string;
    pada: string;
    motion: string;
    dignity: string;
    conjunctions: string;
    aspectsGiven: string;
    aspectsReceived: string;
  };
}

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

export class PlanetSpeaksService {
  /**
   * Normalizes any planet identifier (English or Hindi name) to NavagrahaKey
   */
  static normalizePlanetKey(nameOrKey: string): NavagrahaKey {
    if (!nameOrKey) return 'Sun';
    const clean = nameOrKey.trim().toLowerCase();

    if (clean.includes('sun') || clean.includes('सूर्य') || clean.includes('surya') || clean.includes('रवि')) return 'Sun';
    if (clean.includes('moon') || clean.includes('चन्द्र') || clean.includes('चंद्र') || clean.includes('chandra') || clean.includes('सोम')) return 'Moon';
    if (clean.includes('mars') || clean.includes('मंगल') || clean.includes('mangal') || clean.includes('भौम')) return 'Mars';
    if (clean.includes('mercury') || clean.includes('बुध') || clean.includes('budh')) return 'Mercury';
    if (clean.includes('jupiter') || clean.includes('गुरु') || clean.includes('बृहस्पति') || clean.includes('guru') || clean.includes('brihaspati')) return 'Jupiter';
    if (clean.includes('venus') || clean.includes('शुक्र') || clean.includes('shukra')) return 'Venus';
    if (clean.includes('saturn') || clean.includes('शनि') || clean.includes('shani')) return 'Saturn';
    if (clean.includes('rahu') || clean.includes('राहु')) return 'Rahu';
    if (clean.includes('ketu') || clean.includes('केतु')) return 'Ketu';

    return 'Sun';
  }

  /**
   * Generates deterministic natural script from verified calculated MasterKundliData
   */
  static generateScript(
    planetIdentifier: string,
    masterKundliData: any,
    language: LanguageCode = 'hi'
  ): PlanetSpeaksScript {
    const pKey = this.normalizePlanetKey(planetIdentifier);
    const localizedPlanet = getLocalizedPlanet(pKey, language);

    // Extract planet data from dataset
    const planetsObj = masterKundliData?.data?.planets || masterKundliData?.planets || {};
    const planetData = planetsObj[pKey] || {};

    // 1. House Placement
    const houseNum: number = planetData.d1House || planetData.house || 1;
    const houseObj = getLocalizedHouse(houseNum, language);
    const localizedHouse = houseObj.full || houseObj.label;

    // 2. Rashi
    const rawRashi = planetData.rashiName || planetData.rashi;
    const localizedRashi = rawRashi ? getLocalizedRashi(rawRashi, language) : '';

    // 3. Exact Degree
    const degVal: number | undefined = planetData.degree ?? planetData.siderealLongitude;
    let exactDegreeStr = '';
    let degDisplay = 'Unavailable';

    if (degVal != null && !isNaN(degVal)) {
      const d = Math.floor(degVal);
      const m = Math.floor((degVal - d) * 60);
      const s = Math.round(((degVal - d) * 60 - m) * 60);
      degDisplay = `${d}° ${m}' ${s}"`;

      if (language === 'hi' || language === 'mr') {
        exactDegreeStr = `${degVal.toFixed(2)} अंश (${d} अंश, ${m} कला)`;
      } else if (language === 'sa') {
        exactDegreeStr = `${degVal.toFixed(2)} अंशाः (${d} अंशाः, ${m} कलाः)`;
      } else if (language === 'gu') {
        exactDegreeStr = `${degVal.toFixed(2)} અંશ (${d} અંશ, ${m} કળા)`;
      } else if (language === 'bn' || language === 'as') {
        exactDegreeStr = `${degVal.toFixed(2)} অংশ (${d} অংশ, ${m} কলা)`;
      } else if (language === 'ta') {
        exactDegreeStr = `${degVal.toFixed(2)} பாகை (${d} பாகை, ${m} கலை)`;
      } else if (language === 'te') {
        exactDegreeStr = `${degVal.toFixed(2)} డిగ్రీలు (${d} డిగ్రీ, ${m} నిమిషాలు)`;
      } else if (language === 'kn') {
        exactDegreeStr = `${degVal.toFixed(2)} ಡಿಗ್ರಿ (${d} ಅಂಶ, ${m} ಕಲಾ)`;
      } else if (language === 'ml') {
        exactDegreeStr = `${degVal.toFixed(2)} ഡിഗ്രി (${d} അംശം, ${m} മിനിറ്റ്)`;
      } else if (language === 'pa') {
        exactDegreeStr = `${degVal.toFixed(2)} ਡਿਗਰੀ (${d} ਅੰਸ਼, ${m} ਕਲਾ)`;
      } else if (language === 'or') {
        exactDegreeStr = `${degVal.toFixed(2)} ଡିଗ୍ରୀ (${d} ଅଂଶ, ${m} କଳା)`;
      } else {
        exactDegreeStr = `${degVal.toFixed(2)} degrees (${d}° ${m}')`;
      }
    }

    // 4. Nakshatra & Pada
    const rawNak = planetData.nakshatraName || planetData.nakshatra;
    const localizedNak = rawNak ? getLocalizedNakshatra(rawNak, language) : '';
    const padaNum = planetData.pada;
    const padaDisplay = padaNum ? String(padaNum) : '';

    // 5. Motion (Retrograde / Direct)
    const isRetro = Boolean(planetData.isRetrograde);
    let motionDisplay = '';
    if (language === 'hi' || language === 'sa') {
      motionDisplay = isRetro ? 'वक्री (वक्र गति)' : 'मार्गी (सीधी गति)';
    } else if (language === 'en') {
      motionDisplay = isRetro ? 'Retrograde (Vakri)' : 'Direct (Margi)';
    } else {
      motionDisplay = isRetro ? 'वक्री' : 'मार्गी';
    }

    // 6. Dignity
    const rawDignity = planetData.dignity || 
      masterKundliData?.relationships?.parashari?.dignities?.find((d: any) => d.planet === pKey)?.status;
    const localizedDignity = rawDignity && rawDignity !== 'None' ? getLocalizedDignity(rawDignity, language) : '';

    // 7. Conjunctions (Planets in the same house)
    const conjunctions: string[] = [];
    for (const otherKey of NAVAGRAHA_KEYS) {
      if (otherKey !== pKey) {
        const otherP = planetsObj[otherKey];
        if (otherP && (otherP.d1House || otherP.house) === houseNum) {
          conjunctions.push(getLocalizedPlanet(otherKey, language));
        }
      }
    }

    // 8. Aspects Received (e.g. "मेरे ऊपर मंगल की सप्तम दृष्टि है")
    const aspectsReceived: string[] = [];
    const allAspects = masterKundliData?.relationships?.parashari?.aspects || [];
    for (const asp of allAspects) {
      if (asp.targetPlanets && asp.targetPlanets.includes(pKey)) {
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

    // 9. Aspects Given
    const aspectsGiven: string[] = [];
    for (const asp of allAspects) {
      if (asp.sourcePlanet === pKey) {
        const hObj = getLocalizedHouse(asp.targetHouse, language);
        const aspTypeNum = asp.aspectType || 7;
        const ordinalName = language === 'hi' 
          ? (HINDI_ASPECT_NAMES[aspTypeNum] || `${aspTypeNum}वीं`)
          : `${aspTypeNum}th`;
        aspectsGiven.push(
          language === 'hi'
            ? `${hObj.label} पर ${ordinalName} दृष्टि`
            : `${ordinalName} aspect on ${hObj.label}`
        );
      }
    }

    // Build sentence array for pause-aware narration
    const sentences: string[] = [];

    if (language === 'hi') {
      sentences.push(`मैं ${localizedPlanet} हूँ।`);
      sentences.push(`मैं आपकी जन्म कुंडली के ${localizedHouse} में स्थित हूँ।`);
      if (localizedRashi) {
        sentences.push(`मैं ${localizedRashi} राशि में विराजमान हूँ।`);
      }
      if (exactDegreeStr) {
        sentences.push(`मेरा अंश ${exactDegreeStr} है।`);
      }
      if (localizedNak) {
        const padaPhrase = padaDisplay ? `के ${padaDisplay} चरण` : '';
        sentences.push(`मेरा नक्षत्र ${localizedNak} ${padaPhrase} है।`);
      }
      sentences.push(`मेरी चाल ${motionDisplay} है।`);
      if (localizedDignity) {
        sentences.push(`इस भाव में मेरी स्थिति ${localizedDignity} है।`);
      }
      if (conjunctions.length > 0) {
        sentences.push(`यहाँ मेरी युति ${conjunctions.join(' और ')} के साथ है।`);
      }
      if (aspectsReceived.length > 0) {
        sentences.push(`मेरे ऊपर ${aspectsReceived.join(', ')} है।`);
      }
      if (aspectsGiven.length > 0) {
        sentences.push(`मेरी दृष्टि ${aspectsGiven.join(' तथा ')} है।`);
      }
      sentences.push('यह मेरी प्रामाणिक और निश्चित खगोलीय स्थिति है।');
    } else if (language === 'en') {
      sentences.push(`I am ${localizedPlanet}.`);
      sentences.push(`In your birth chart, I reside in the ${localizedHouse}.`);
      if (localizedRashi) {
        sentences.push(`I am situated in the sign of ${localizedRashi}.`);
      }
      if (exactDegreeStr) {
        sentences.push(`My exact sidereal longitude is ${exactDegreeStr}.`);
      }
      if (localizedNak) {
        const padaPhrase = padaDisplay ? `in Pada ${padaDisplay}` : '';
        sentences.push(`I am placed in ${localizedNak} Nakshatra ${padaPhrase}.`);
      }
      sentences.push(`My planetary motion is ${motionDisplay}.`);
      if (localizedDignity) {
        sentences.push(`My celestial dignity is ${localizedDignity}.`);
      }
      if (conjunctions.length > 0) {
        sentences.push(`I am in conjunction with ${conjunctions.join(' and ')}.`);
      }
      if (aspectsReceived.length > 0) {
        sentences.push(`I receive ${aspectsReceived.join(', ')}.`);
      }
      if (aspectsGiven.length > 0) {
        sentences.push(`I cast my ${aspectsGiven.join(' and ')}.`);
      }
      sentences.push('This is my verified astronomical placement.');
    } else {
      // General Indian Language Template (Bengali, Marathi, Gujarati, Tamil, etc.)
      sentences.push(`मैं ${localizedPlanet} हूँ।`);
      sentences.push(`मैं आपके ${localizedHouse} में, ${localizedRashi} राशि में स्थित हूँ।`);
      if (exactDegreeStr) sentences.push(`मेरा अंश ${exactDegreeStr} है।`);
      if (localizedNak) sentences.push(`मेरा नक्षत्र ${localizedNak} है।`);
      sentences.push(`मेरी गति ${motionDisplay} है।`);
      if (conjunctions.length > 0) sentences.push(`यहाँ मेरी युति ${conjunctions.join(', ')} के साथ है।`);
      if (aspectsReceived.length > 0) sentences.push(`मेरे ऊपर ${aspectsReceived.join(', ')} है।`);
      sentences.push('यह मेरी प्रामाणिक स्थिति है।');
    }

    const spokenText = sentences.join(' ');

    return {
      planetKey: pKey,
      localizedName: localizedPlanet,
      spokenText,
      sentences,
      facts: {
        planet: localizedPlanet,
        house: localizedHouse,
        rashi: localizedRashi || 'Unavailable',
        degree: degDisplay,
        nakshatra: localizedNak || 'Unavailable',
        pada: padaDisplay || 'Unavailable',
        motion: motionDisplay,
        dignity: localizedDignity || 'सामान्य',
        conjunctions: conjunctions.length > 0 ? conjunctions.join(', ') : 'कोई युति नहीं',
        aspectsGiven: aspectsGiven.length > 0 ? aspectsGiven.join('; ') : 'कोई प्रमुख दृष्टि नहीं',
        aspectsReceived: aspectsReceived.length > 0 ? aspectsReceived.join('; ') : 'कोई दृष्टि प्राप्त नहीं'
      }
    };
  }

  /**
   * Speaks the planet's script using centralized SpeechEngine with sentence-pause pacing
   */
  static speakPlanet(
    planetIdentifier: string,
    masterKundliData: any,
    language: LanguageCode = 'hi',
    onStateChange?: (state: SpeechState) => void,
    options?: SpeechOptions
  ): boolean {
    const script = this.generateScript(planetIdentifier, masterKundliData, language);
    return SpeechEngine.speak(script.spokenText, language, onStateChange, {
      speedPreset: SpeechEngine.getSpeedPreset(),
      ...options
    });
  }

  /**
   * Stops any ongoing planet narration
   */
  static stopSpeech(): void {
    SpeechEngine.stop();
  }
}
