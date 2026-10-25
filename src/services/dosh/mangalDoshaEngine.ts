/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MANGAL DOSHA ENGINE (भौम / मांगलिक विचार)
 * PHASE 1.13C-1: DETERMINISTIC CALCULATION ENGINE
 * 
 * Evaluates classical Mangal Dosha based on primary Lagna standard and
 * separate secondary Moon/Venus indicators. Checks authentic Bhanga
 * (cancellation) conditions without altering calculated facts.
 * 
 * STRICT INVARIANTS:
 * - Pure calculation function; zero mutation of input MasterKundliData.
 * - Reads existing whole-sign house assignments from MasterKundliData.
 * - Zero severity scoring (no invented Mild/Moderate/Full numeric scores).
 * - Distinguishes primary shastric standard from secondary traditions.
 * - Non-fatalistic framing: Mangal is an indicator of energetic temperament,
 *   not an immutable curse or guaranteed catastrophe.
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';
import {
  MangalDoshaAnalysisResult,
  MangalDoshaStatus,
  IndicatorPresence,
  MangalCancellationRule,
  MangalIndicatorDetail,
  MangalCalculatedFacts
} from '../../types/dosh/mangalTypes';

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

const TRADITIONAL_MANGAL_HOUSES = [1, 4, 7, 8, 12];

export class MangalDoshaEngine {
  /**
   * Helper to resolve planet safely regardless of key casing
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
   * Calculates relative house of planet B from planet A using established whole-sign logic:
   * ((houseB - houseA + 12) % 12) + 1
   */
  public static calculateRelativeHouse(houseA: number, houseB: number): number {
    return ((houseB - houseA + 12) % 12) + 1;
  }

  /**
   * Main entry point for pure deterministic Mangal Dosha analysis
   */
  public static analyze(data: MasterKundliData | null | undefined): MangalDoshaAnalysisResult {
    // 1. Boundary Guard: Incomplete or missing chart data
    if (!data || !data.lagna || !data.planets) {
      return this.buildInsufficientDataResult('कुंडली अथवा ग्रह स्थिति उपलब्ध नहीं है। (Missing chart or planetary data)');
    }

    const mars = this.getPlanet(data.planets, 'Mars');
    const lagna = data.lagna;

    if (!mars || typeof mars.d1House !== 'number' || mars.d1House < 1 || mars.d1House > 12) {
      return this.buildInsufficientDataResult('मंगल ग्रह की स्थिति अथवा भाव उपलब्ध नहीं है। (Missing Mars position or house)');
    }

    if (typeof lagna.rashi !== 'number' || lagna.rashi < 1 || lagna.rashi > 12) {
      return this.buildInsufficientDataResult('लग्न राशि अनुपलब्ध है। (Missing Lagna rashi)');
    }

    const moon = this.getPlanet(data.planets, 'Moon');
    const venus = this.getPlanet(data.planets, 'Venus');
    const jupiter = this.getPlanet(data.planets, 'Jupiter');

    // 2. Primary Standard: Mars from Lagna
    const primaryHouse = mars.d1House;
    const isPrimaryMangal = TRADITIONAL_MANGAL_HOUSES.includes(primaryHouse);
    const primaryIndication: IndicatorPresence = isPrimaryMangal ? 'PRESENT' : 'NOT_PRESENT';

    // 3. Secondary Traditions: Mars from Moon & Mars from Venus
    let moonIndicator: MangalIndicatorDetail;
    if (moon && typeof moon.d1House === 'number' && moon.d1House >= 1 && moon.d1House <= 12) {
      const houseFromMoon = this.calculateRelativeHouse(moon.d1House, mars.d1House);
      const isMangalFromMoon = TRADITIONAL_MANGAL_HOUSES.includes(houseFromMoon);
      moonIndicator = {
        referencePoint: 'Moon',
        traditionLabel: 'Secondary Traditional Indicator',
        traditionLabelHindi: 'चंद्र आधारित पारंपरिक संकेत',
        isPrimary: false,
        status: isMangalFromMoon ? 'PRESENT' : 'NOT_PRESENT',
        houseFromReference: houseFromMoon,
        isMangalHouse: isMangalFromMoon,
        description: `Mars is placed in house ${houseFromMoon} from Natal Moon.`,
        descriptionHindi: `जन्म चंद्र से मंगल ${houseFromMoon}वें भाव में स्थित है।`
      };
    } else {
      moonIndicator = {
        referencePoint: 'Moon',
        traditionLabel: 'Secondary Traditional Indicator',
        traditionLabelHindi: 'चंद्र आधारित पारंपरिक संकेत',
        isPrimary: false,
        status: 'UNKNOWN',
        houseFromReference: null,
        isMangalHouse: false,
        description: 'Moon position could not be safely verified.',
        descriptionHindi: 'चंद्रमा की स्थिति सत्यापित नहीं हो सकी।'
      };
    }

    let venusIndicator: MangalIndicatorDetail;
    if (venus && typeof venus.d1House === 'number' && venus.d1House >= 1 && venus.d1House <= 12) {
      const houseFromVenus = this.calculateRelativeHouse(venus.d1House, mars.d1House);
      const isMangalFromVenus = TRADITIONAL_MANGAL_HOUSES.includes(houseFromVenus);
      venusIndicator = {
        referencePoint: 'Venus',
        traditionLabel: 'Secondary Traditional Indicator',
        traditionLabelHindi: 'शुक्र आधारित पारंपरिक संकेत',
        isPrimary: false,
        status: isMangalFromVenus ? 'PRESENT' : 'NOT_PRESENT',
        houseFromReference: houseFromVenus,
        isMangalHouse: isMangalFromVenus,
        description: `Mars is placed in house ${houseFromVenus} from Natal Venus.`,
        descriptionHindi: `शुक्र से मंगल ${houseFromVenus}वें भाव में स्थित है।`
      };
    } else {
      venusIndicator = {
        referencePoint: 'Venus',
        traditionLabel: 'Secondary Traditional Indicator',
        traditionLabelHindi: 'शुक्र आधारित पारंपरिक संकेत',
        isPrimary: false,
        status: 'UNKNOWN',
        houseFromReference: null,
        isMangalHouse: false,
        description: 'Venus position could not be safely verified.',
        descriptionHindi: 'शुक्र की स्थिति सत्यापित नहीं हो सकी।'
      };
    }

    // 4. Bhanga / Mitigation Rules Evaluation
    // Evaluated deterministically against classical rules frozen in Phase 1.13B.2
    const cancellationChecks: MangalCancellationRule[] = [
      {
        ruleId: 'BHANGA_MARS_ARIES_1',
        name: 'Mars in Aries in 1st House (मेष लग्न में मंगल)',
        nameHindi: 'लग्न (प्रथम भाव) में मेष राशिस्थ स्वक्षेत्री मंगल',
        triggered: primaryHouse === 1 && mars.rashi === 1,
        explanation: 'Mars situated in its own fire sign Aries in the 1st house is considered naturally strong and auspicious.',
        explanationHindi: 'प्रथम भाव में मंगल स्वराशि मेष में होने से रुचक प्रभाव उत्पन्न होता है तथा भौम दोष निष्प्रभावी माना जाता है।',
        tradition: 'मुहूर्त मार्तण्ड / बृहद्दैवज्ञ रंजन ("मेषे लग्ने कुजे दोषो न विद्यते")',
        confidence: 'CONFIDENT_CLASSICAL'
      },
      {
        ruleId: 'BHANGA_MARS_SCORPIO_4',
        name: 'Mars in Scorpio in 4th House (वृश्चिक का मंगल चतुर्थ में)',
        nameHindi: 'चतुर्थ भाव में वृश्चिक राशिस्थ स्वक्षेत्री मंगल',
        triggered: primaryHouse === 4 && mars.rashi === 8,
        explanation: 'Mars situated in its own water sign Scorpio in the 4th house is neutralized.',
        explanationHindi: 'चतुर्थ भाव में मंगल स्वराशि वृश्चिक में स्थित होने से दोष शमन होता है।',
        tradition: 'मुहूर्त चिंतामणि ("वृश्चिके च चतुर्थे")',
        confidence: 'CONFIDENT_CLASSICAL'
      },
      {
        ruleId: 'BHANGA_MARS_CAPRICORN_7',
        name: 'Mars Exalted in Capricorn in 7th House (मकर का मंगल सप्तम में)',
        nameHindi: 'सप्तम भाव में मकर राशिस्थ उच्च मंगल',
        triggered: primaryHouse === 7 && mars.rashi === 10,
        explanation: 'Mars in its highest exaltation sign Capricorn in the 7th house confers dignity and mitigates affliction.',
        explanationHindi: 'सप्तम भाव में मंगल अपनी परम उच्च राशि मकर में होने से मांगलिक दोष का परिहार होता है।',
        tradition: 'मुहूर्त मार्तण्ड ("मकरे सप्तमे")',
        confidence: 'CONFIDENT_CLASSICAL'
      },
      {
        ruleId: 'BHANGA_MARS_SAGITTARIUS_8',
        name: 'Mars in Sagittarius in 8th House (धनु का मंगल अष्टम में)',
        nameHindi: 'अष्टम भाव में धनु राशिस्थ मंगल',
        triggered: primaryHouse === 8 && mars.rashi === 9,
        explanation: 'Mars placed in Jupiter\'s friendly fire sign Sagittarius in the 8th house mitigates adverse effects.',
        explanationHindi: 'अष्टम भाव में मंगल गुरु की सात्विक राशि धनु में होने से दोष का शमन माना गया है।',
        tradition: 'देव केरलम् / मुहूर्त मार्तण्ड ("चापे चाष्टमे")',
        confidence: 'CONFIDENT_CLASSICAL'
      },
      {
        ruleId: 'BHANGA_MARS_MERCURY_12',
        name: 'Mars in Mercury Sign in 12th House (मिथुन/कन्या का मंगल द्वादश में)',
        nameHindi: 'द्वादश भाव में मिथुन अथवा कन्या राशिस्थ मंगल',
        triggered: primaryHouse === 12 && (mars.rashi === 3 || mars.rashi === 6),
        explanation: 'Mars placed in Mercury\'s intellectual signs (Gemini or Virgo) in the 12th house is classically neutralized.',
        explanationHindi: 'व्यय (12वें) भाव में मंगल बुध की राशि (मिथुन अथवा कन्या) में होने से दोष भंग होता है।',
        tradition: 'मुहूर्त मार्तण्ड ("मिथुने कन्यकायां च द्वादशे")',
        confidence: 'CONFIDENT_CLASSICAL'
      },
      {
        ruleId: 'BHANGA_JUPITER_ASPECT_CONJUNCTION',
        name: 'Benefic Jupiter Aspect or Conjunction (गुरु दृष्टि अथवा युति)',
        nameHindi: 'मंगल पर देवगुरु बृहस्पति की दृष्टि अथवा युति',
        triggered: (() => {
          if (!jupiter || typeof jupiter.d1House !== 'number') return false;
          // Conjunction
          if (jupiter.d1House === mars.d1House) return true;
          // Parashari Special Full Aspects of Jupiter: 5th, 7th, 9th from itself
          const diff = this.calculateRelativeHouse(jupiter.d1House, mars.d1House);
          return diff === 5 || diff === 7 || diff === 9;
        })(),
        explanation: 'Direct aspect (5th, 7th, or 9th) or conjunction of natural benefic Jupiter on Mars neutralizes harshness.',
        explanationHindi: 'मंगल पर शुभ गुरु की पूर्ण दृष्टि (5वीं, 7वीं, 9वीं) अथवा युति होने से मंगल की उग्रता शांत होती है एवं दोष भंग होता है।',
        tradition: 'बृहद्दैवज्ञ रंजन ("गुरुणा दृष्टे संयुक्ते वा भौमदोषो न विद्यते")',
        confidence: 'CONFIDENT_CLASSICAL'
      }
    ];

    const activeCancellationsCount = cancellationChecks.filter(c => c.triggered).length;
    // Mitigation applies if Mangal was indicated in primary standard AND at least one cancellation triggered
    const mitigated = isPrimaryMangal && activeCancellationsCount > 0;

    // 5. Calculated Facts Container
    const calculatedFacts: MangalCalculatedFacts = {
      lagnaSign: lagna.rashi,
      lagnaSignName: RASHI_NAMES_HI[lagna.rashi] || null,
      marsSign: mars.rashi,
      marsSignName: RASHI_NAMES_HI[mars.rashi] || null,
      marsHouseFromLagna: primaryHouse,
      marsDegree: typeof mars.degree === 'number' ? mars.degree : null,
      marsLongitude: typeof mars.siderealLongitude === 'number' ? mars.siderealLongitude : null,
      moonSign: moon ? moon.rashi : null,
      moonHouseFromLagna: moon ? moon.d1House : null,
      venusSign: venus ? venus.rashi : null,
      venusHouseFromLagna: venus ? venus.d1House : null,
      jupiterHouseFromLagna: jupiter ? jupiter.d1House : null,
      jupiterSign: jupiter ? jupiter.rashi : null
    };

    const overallStatus: MangalDoshaStatus = isPrimaryMangal ? 'PRESENT' : 'NOT_PRESENT';

    return {
      doshaId: 'MANGAL_DOSHA',
      status: overallStatus,
      primaryStandard: {
        referencePoint: 'Lagna',
        traditionTitle: 'Primary Traditional Marriage Standard (Lagna-based)',
        traditionTitleHindi: 'मुख्य पारंपरिक विवाह विचार — Lagna आधारित',
        sourceText: 'मुहूर्त चिंतामणि • विवाह प्रकरण ("लग्ने व्यये च पाताले जामित्रे चाष्टमे कुजे")',
        evaluatedHouses: TRADITIONAL_MANGAL_HOUSES
      },
      primaryHouseFromLagna: primaryHouse,
      primaryIndication,
      moonIndicator,
      venusIndicator,
      cancellationChecks,
      mitigated,
      activeCancellationsCount,
      ruleLineage: [
        'मुहूर्त चिंतामणि • विवाह प्रकरण (Primary Lagna standard: Houses 1, 4, 7, 8, 12)',
        'मुहूर्त मार्तण्ड एवं बृहद्दैवज्ञ रंजन (Classical Bhanga / cancellation rules)',
        'दक्षिण भारतीय एवं उत्तर-मध्यकालीन परंपरा (Separate Moon and Venus secondary indicators)'
      ],
      calculatedFacts,
      disclaimer: {
        en: 'Mangal Dosha is a traditional astrological indicator concerning marital temperament and energetic dynamics. It is not an immutable curse or guaranteed catastrophe. Traditional cancellations and psychological maturity play a decisive role.',
        hi: 'मांगलिक विचार पारंपरिक ज्योतिषीय दृष्टिकोण है जो स्वभाव एवं ऊर्जा संतुलन का संकेत करता है। इसे किसी निश्चित अनिष्ट या भय के रूप में न लें। शास्त्रसम्मत परिहार (भंग) एवं परिपक्व समझ दाम्पत्य सौहार्द में निर्णायक होते हैं।'
      }
    };
  }

  /**
   * Safe fallback response when required chart parameters are absent
   */
  private static buildInsufficientDataResult(reasonHindi: string): MangalDoshaAnalysisResult {
    return {
      doshaId: 'MANGAL_DOSHA',
      status: 'INSUFFICIENT_DATA',
      primaryStandard: {
        referencePoint: 'Lagna',
        traditionTitle: 'Primary Traditional Marriage Standard (Lagna-based)',
        traditionTitleHindi: 'मुख्य पारंपरिक विवाह विचार — Lagna आधारित',
        sourceText: 'मुहूर्त चिंतामणि • विवाह प्रकरण',
        evaluatedHouses: TRADITIONAL_MANGAL_HOUSES
      },
      primaryHouseFromLagna: null,
      primaryIndication: 'UNKNOWN',
      moonIndicator: {
        referencePoint: 'Moon',
        traditionLabel: 'Secondary Traditional Indicator',
        traditionLabelHindi: 'चंद्र आधारित पारंपरिक संकेत',
        isPrimary: false,
        status: 'UNKNOWN',
        houseFromReference: null,
        isMangalHouse: false,
        description: 'Insufficient chart data.',
        descriptionHindi: 'अपर्याप्त कुंडली डेटा।'
      },
      venusIndicator: {
        referencePoint: 'Venus',
        traditionLabel: 'Secondary Traditional Indicator',
        traditionLabelHindi: 'शुक्र आधारित पारंपरिक संकेत',
        isPrimary: false,
        status: 'UNKNOWN',
        houseFromReference: null,
        isMangalHouse: false,
        description: 'Insufficient chart data.',
        descriptionHindi: 'अपर्याप्त कुंडली डेटा।'
      },
      cancellationChecks: [],
      mitigated: false,
      activeCancellationsCount: 0,
      ruleLineage: [
        'मुहूर्त चिंतामणि • विवाह प्रकरण'
      ],
      calculatedFacts: {
        lagnaSign: null,
        lagnaSignName: null,
        marsSign: null,
        marsSignName: null,
        marsHouseFromLagna: null,
        marsDegree: null,
        marsLongitude: null,
        moonSign: null,
        moonHouseFromLagna: null,
        venusSign: null,
        venusHouseFromLagna: null,
        jupiterHouseFromLagna: null,
        jupiterSign: null
      },
      disclaimer: {
        en: `Calculation could not be completed: ${reasonHindi}`,
        hi: `गणना पूर्ण नहीं हो सकी: ${reasonHindi}`
      }
    };
  }
}
