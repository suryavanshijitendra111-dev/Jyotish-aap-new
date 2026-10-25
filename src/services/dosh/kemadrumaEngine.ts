/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — KEMADRUMA YOGA & BHANGA ENGINE (केमद्रुम योग एवं भंग विचार)
 * PHASE 1.13C-6: DETERMINISTIC CALCULATION ENGINE
 * 
 * Evaluates classical Kemadruma Yoga where the 2nd and 12th houses from Moon
 * are devoid of qualifying physical planets (Sun, Mars, Mercury, Jupiter, Venus, Saturn).
 * 
 * STRICT INVARIANTS:
 * - Rahu, Ketu, Uranus, Neptune, and Pluto do NOT count as relieving planets.
 * - Base Kemadruma and classical Bhanga (cancellation) are preserved as distinct states.
 * - Base indication is NEVER erased merely because Bhanga is present.
 * - Uncertain Bhanga rules are explicitly marked DEFERRED instead of guessed.
 * - Zero severity scores, zero percentage cancellations, zero arbitrary orbs.
 * - Pure calculation function; zero mutation of input MasterKundliData.
 * - Zero remedies, zero AI, zero storage.
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';
import {
  KemadrumaResult,
  KemadrumaStatus,
  KemadrumaIndication,
  KemadrumaBhangaRule,
  RelievingPlanetCheck
} from '../../types/dosh/kemadrumaTypes';

const RASHI_NAMES_HI: Record<number, string> = {
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

const QUALIFYING_CLASSICAL_PLANETS = ['Sun', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const EXCLUDED_NON_RELIEVING_PLANETS = ['Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'];

export class KemadrumaEngine {
  /**
   * Helper to retrieve a planet safely regardless of key casing
   */
  private static getPlanet(
    planets: Record<string, PlanetData> | undefined,
    name: string
  ): PlanetData | null {
    if (!planets) return null;
    return (
      planets[name] ||
      planets[name.toLowerCase()] ||
      planets[name.toUpperCase()] ||
      null
    );
  }

  /**
   * Calculates whole-sign relative house:
   * ((houseB - houseA + 12) % 12) + 1
   */
  public static calculateRelativeHouse(houseA: number, houseB: number): number {
    return ((houseB - houseA + 12) % 12) + 1;
  }

  /**
   * Main entry point for pure deterministic Kemadruma Yoga & Bhanga analysis
   */
  public static analyze(data: MasterKundliData | null | undefined): KemadrumaResult {
    // 1. Boundary Guard: Missing chart data or planetary dictionary
    if (!data || !data.planets) {
      return this.buildFallbackResult('INSUFFICIENT_DATA', 'कुंडली अथवा ग्रह स्थिति उपलब्ध नहीं है। (Missing chart or planetary data)');
    }

    const moon = this.getPlanet(data.planets, 'Moon');

    // 2. Data Validation for Moon
    if (
      !moon ||
      typeof moon.d1House !== 'number' ||
      typeof moon.rashi !== 'number' ||
      moon.d1House < 1 ||
      moon.d1House > 12 ||
      moon.rashi < 1 ||
      moon.rashi > 12
    ) {
      return this.buildFallbackResult('INSUFFICIENT_DATA', 'चंद्रमा की भाव अथवा राशि स्थिति उपलब्ध नहीं है। (Missing Moon position)');
    }

    // 3. Calculate 2nd and 12th houses from Moon (Whole-Sign)
    const secondHouseFromLagna = (moon.d1House % 12) + 1;
    const twelfthHouseFromLagna = ((moon.d1House + 10) % 12) + 1;

    const secondRashi = (moon.rashi % 12) + 1;
    const twelfthRashi = ((moon.rashi + 10) % 12) + 1;

    const secondQualifying: string[] = [];
    const secondExcluded: string[] = [];
    const twelfthQualifying: string[] = [];
    const twelfthExcluded: string[] = [];

    // Scan all planets in data.planets
    for (const [pKey, pData] of Object.entries(data.planets)) {
      if (!pData || typeof pData.d1House !== 'number') continue;
      const canonicalName = pData.name || pKey;
      if (canonicalName.toLowerCase() === 'moon') continue; // Moon does not relieve its own 2nd/12th

      const isQualifying = QUALIFYING_CLASSICAL_PLANETS.some(
        q => q.toLowerCase() === canonicalName.toLowerCase()
      );
      const isExcluded = EXCLUDED_NON_RELIEVING_PLANETS.some(
        e => e.toLowerCase() === canonicalName.toLowerCase()
      );

      if (pData.d1House === secondHouseFromLagna) {
        if (isQualifying) secondQualifying.push(canonicalName);
        else if (isExcluded) secondExcluded.push(canonicalName);
      }

      if (pData.d1House === twelfthHouseFromLagna) {
        if (isQualifying) twelfthQualifying.push(canonicalName);
        else if (isExcluded) twelfthExcluded.push(canonicalName);
      }
    }

    const relievingPlanetCheck: RelievingPlanetCheck = {
      secondHouseFromMoon: {
        rashi: secondRashi,
        rashiName: RASHI_NAMES_HI[secondRashi] || null,
        houseFromLagna: secondHouseFromLagna,
        occupyingQualifyingPlanets: secondQualifying,
        occupyingExcludedPlanets: secondExcluded
      },
      twelfthHouseFromMoon: {
        rashi: twelfthRashi,
        rashiName: RASHI_NAMES_HI[twelfthRashi] || null,
        houseFromLagna: twelfthHouseFromLagna,
        occupyingQualifyingPlanets: twelfthQualifying,
        occupyingExcludedPlanets: twelfthExcluded
      }
    };

    // 4. Base Kemadruma Evaluation
    // Base Kemadruma exists if BOTH 2nd and 12th from Moon are devoid of qualifying classical planets
    const hasSecondRelief = secondQualifying.length > 0;
    const hasTwelfthRelief = twelfthQualifying.length > 0;
    const isBaseKemadruma = !hasSecondRelief && !hasTwelfthRelief;
    const baseIndication: KemadrumaIndication = isBaseKemadruma ? 'PRESENT' : 'NOT_PRESENT';

    // 5. Classical Bhanga (Cancellation) Rules Evaluation
    const jupiter = this.getPlanet(data.planets, 'Jupiter');

    // Rule 1: Kendra from Lagna (Any physical planet in Kendra from Lagna: 1, 4, 7, 10)
    const kendraFromLagnaPlanets: string[] = [];
    for (const pName of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
      const p = this.getPlanet(data.planets, pName);
      if (p && typeof p.d1House === 'number' && [1, 4, 7, 10].includes(p.d1House)) {
        kendraFromLagnaPlanets.push(pName);
      }
    }
    const hasKendraFromLagnaBhanga = kendraFromLagnaPlanets.length > 0;

    // Rule 2: Kendra from Moon (Any physical planet other than Moon in Kendra 4, 7, 10 from Moon)
    const kendraFromMoonPlanets: string[] = [];
    for (const pName of ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
      const p = this.getPlanet(data.planets, pName);
      if (p && typeof p.d1House === 'number') {
        const relHouse = this.calculateRelativeHouse(moon.d1House, p.d1House);
        if ([4, 7, 10].includes(relHouse)) {
          kendraFromMoonPlanets.push(pName);
        }
      }
    }
    const hasKendraFromMoonBhanga = kendraFromMoonPlanets.length > 0;

    // Rule 3: Moon Conjunct Physical Planet
    const conjunctMoonPlanets: string[] = [];
    for (const pName of ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
      const p = this.getPlanet(data.planets, pName);
      if (p && typeof p.d1House === 'number' && p.d1House === moon.d1House) {
        conjunctMoonPlanets.push(pName);
      }
    }
    const hasMoonConjunctBhanga = conjunctMoonPlanets.length > 0;

    // Rule 4: Jupiter Full Aspect or Conjunction on Moon
    let hasJupiterAspectBhanga = false;
    if (jupiter && typeof jupiter.d1House === 'number') {
      const jupRel = this.calculateRelativeHouse(jupiter.d1House, moon.d1House);
      hasJupiterAspectBhanga = [1, 5, 7, 9].includes(jupRel);
    }

    const bhangaRules: KemadrumaBhangaRule[] = [
      {
        ruleId: 'BHANGA_PLANET_IN_KENDRA_FROM_LAGNA',
        name: 'Planet in Kendra from Lagna (लग्न से केंद्र में ग्रह)',
        nameHindi: 'लग्न से केंद्र (1, 4, 7, 10) भाव में भौतिक ग्रह की उपस्थिति',
        triggered: hasKendraFromLagnaBhanga,
        status: 'ACTIVE',
        explanation: `Classical primary Bhanga: The presence of physical planet(s) (${kendraFromLagnaPlanets.join(', ') || 'none'}) in Kendra from Lagna provides structural stability to the chart.`,
        explanationHindi: `वराहमिहिर बृहज्जातक के अनुसार लग्न से केंद्र (1, 4, 7, 10) में ग्रह (${kendraFromLagnaPlanets.join(', ') || 'कोई नहीं'}) होने से केमद्रुम दोष का शास्त्रीय परिहार होता है।`,
        tradition: 'वराहमिहिर • बृहज्जातक (13.6) / बृहत्पाराशर होराशास्त्र (37.11)',
        confidence: 'CONFIDENT_CLASSICAL'
      },
      {
        ruleId: 'BHANGA_PLANET_IN_KENDRA_FROM_MOON',
        name: 'Planet in Kendra from Moon (चंद्र से केंद्र में ग्रह)',
        nameHindi: 'चंद्रमा से केंद्र (4, 7, 10) भाव में ग्रह की स्थिति',
        triggered: hasKendraFromMoonBhanga,
        status: 'ACTIVE',
        explanation: `Presence of planet(s) (${kendraFromMoonPlanets.join(', ') || 'none'}) in Kendra from Moon neutralizes planetary isolation.`,
        explanationHindi: `चंद्रमा से केंद्र (4, 7, 10) भावों में ग्रह स्थित होने से चंद्र की अकेलापन समाप्त होकर शुभता प्राप्त होती है।`,
        tradition: 'बृहज्जातक (13.6) • "केन्द्रे चन्द्रादथवा लग्नात्"',
        confidence: 'CONFIDENT_CLASSICAL'
      },
      {
        ruleId: 'BHANGA_MOON_CONJUNCT_PLANET',
        name: 'Moon Conjunct Physical Planet (चंद्रमा के साथ ग्रह युति)',
        nameHindi: 'चंद्रमा के साथ किसी भौतिक ग्रह की एक ही भाव में युति',
        triggered: hasMoonConjunctBhanga,
        status: 'ACTIVE',
        explanation: `Moon sharing a house with planet(s) (${conjunctMoonPlanets.join(', ') || 'none'}) forms an active association that mitigates Kemadruma.`,
        explanationHindi: 'चंद्रमा के साथ किसी भौतिक ग्रह की युति होने से केमद्रुम योग का प्रभाव समाप्त होता है।',
        tradition: 'फलदीपिका • अध्याय 6',
        confidence: 'CONFIDENT_CLASSICAL'
      },
      {
        ruleId: 'BHANGA_JUPITER_ASPECT_MOON',
        name: 'Benefic Jupiter Aspect on Moon (चंद्रमा पर गुरु की दृष्टि)',
        nameHindi: 'चंद्रमा पर देवगुरु बृहस्पति की पूर्ण दृष्टि (5, 7, 9) अथवा युति',
        triggered: hasJupiterAspectBhanga,
        status: 'ACTIVE',
        explanation: "Direct aspect or conjunction from natural benefic Jupiter illuminates the Moon and confers mental resilience.",
        explanationHindi: 'शुभ गुरु की चंद्र पर दृष्टि होने से मानसिक शांति, विवेक एवं केमद्रुम शमन होता है।',
        tradition: 'बृहत्पाराशर होराशास्त्र • शुभ दृष्टि विचार',
        confidence: 'CONFIDENT_CLASSICAL'
      },
      {
        ruleId: 'BHANGA_DEFERRED_UNVERIFIED_REGIONAL',
        name: 'Controversial Regional Combinations',
        nameHindi: 'अपुष्ट क्षेत्रीय मान्यताएं (जैसे रात्रि जन्म विशिष्ट अपवाद)',
        triggered: false,
        status: 'DEFERRED',
        explanation: 'Regional non-canonical cancellation claims are deferred pending definitive classical textual verification.',
        explanationHindi: 'अपुष्ट क्षेत्रीय मान्यताओं को बिना मूल ग्रंथ प्रमाण के स्थगित (Deferred) रखा गया है।',
        tradition: 'Regional Commentaries',
        confidence: 'TRADITIONAL_SCHOOL'
      }
    ];

    const activeBhangasCount = bhangaRules.filter(r => r.status === 'ACTIVE' && r.triggered).length;
    const bhangaPresent = activeBhangasCount > 0;

    // Overall Status:
    // If base Kemadruma is PRESENT -> status = 'PRESENT'
    // (Bhanga status is reported distinctly via bhangaPresent without erasing base calculation)
    const status: KemadrumaStatus = isBaseKemadruma ? 'PRESENT' : 'NOT_PRESENT';

    return {
      doshaId: 'KEMADRUMA_ANALYSIS',
      status,
      baseIndication,
      bhangaPresent,
      activeBhangasCount,
      moonDetails: {
        house: moon.d1House,
        rashi: moon.rashi,
        rashiName: RASHI_NAMES_HI[moon.rashi] || null,
        degree: typeof moon.degree === 'number' ? moon.degree : null,
        siderealLongitude: typeof moon.siderealLongitude === 'number' ? moon.siderealLongitude : null
      },
      relievingPlanetCheck,
      bhangaRules,
      traditionMetadata: {
        tradition: 'शास्त्रीय केमद्रुम विचार (Classical Kemadruma Yoga & Bhanga)',
        scope: 'Evaluation of Moon 2nd/12th houses with qualifying physical planets and canonical Bhanga',
        scientificStatus: 'Traditional astrological interpretation; not scientifically established causal fact'
      },
      disclaimer: {
        en: 'Kemadruma is a classical astrological configuration concerning psychological self-reliance and focus. It is not an empirical guarantee of financial destitution or tragedy. Classical Bhanga (cancellation) is present in the vast majority of horoscopes.',
        hi: 'केमद्रुम योग पारंपरिक ज्योतिष में मानसिक स्वावलंबन एवं अंतर्मुखी एकाग्रता का संकेतक है। इसे दरिद्रता अथवा दुर्भाग्य का निश्चित प्रमाण न समझें। अधिकांश कुंडलियों में लग्न अथवा चंद्र केंद्र से शास्त्रीय भंग उपलब्ध होता है।'
      }
    };
  }

  /**
   * Safe fallback response when required chart parameters are absent
   */
  private static buildFallbackResult(
    status: 'INSUFFICIENT_DATA',
    reasonHindi: string
  ): KemadrumaResult {
    return {
      doshaId: 'KEMADRUMA_ANALYSIS',
      status,
      baseIndication: 'INSUFFICIENT_DATA',
      bhangaPresent: false,
      activeBhangasCount: 0,
      moonDetails: {
        house: null,
        rashi: null,
        rashiName: null,
        degree: null,
        siderealLongitude: null
      },
      relievingPlanetCheck: {
        secondHouseFromMoon: {
          rashi: null,
          rashiName: null,
          houseFromLagna: null,
          occupyingQualifyingPlanets: [],
          occupyingExcludedPlanets: []
        },
        twelfthHouseFromMoon: {
          rashi: null,
          rashiName: null,
          houseFromLagna: null,
          occupyingQualifyingPlanets: [],
          occupyingExcludedPlanets: []
        }
      },
      bhangaRules: [],
      traditionMetadata: {
        tradition: 'शास्त्रीय केमद्रुम विचार',
        scope: 'Evaluation of Moon 2nd/12th houses with qualifying physical planets and canonical Bhanga',
        scientificStatus: 'Traditional astrological interpretation; not scientifically established'
      },
      disclaimer: {
        en: `Calculation could not be completed: ${reasonHindi}`,
        hi: `गणना पूर्ण नहीं हो सकी: ${reasonHindi}`
      }
    };
  }
}
