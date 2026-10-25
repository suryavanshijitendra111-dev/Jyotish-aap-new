/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — GURU CHANDAL VICHAR ENGINE (पारंपरिक गुरु चाण्डाल विचार)
 * PHASE 1.13C-4: DETERMINISTIC CALCULATION ENGINE
 * 
 * Evaluates Jupiter-Rahu same-Rashi placement using authentic calculated
 * chart data from MasterKundliData.
 * 
 * STRICT INVARIANTS:
 * - Primary rule: Jupiter + Rahu in same Rashi -> PRESENT.
 * - Jupiter + Ketu does NOT trigger Guru Chandal -> NOT_PRESENT.
 * - Same-Rashi vs Same-House discrepancy is flagged as DATA_CONFLICT.
 * - Transparent degree separation reporting; zero arbitrary universal orb cutoffs.
 * - Zero severity scoring (no +30, 70%, 80%, etc.).
 * - Pure calculation function; zero mutation of input MasterKundliData.
 * - Zero remedies, zero AI, zero storage.
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';
import {
  GuruChandalResult,
  GuruChandalStatus,
  PlanetaryReference,
  GuruChandalMitigationModifiers
} from '../../types/dosh/guruChandalTypes';

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

export class GuruChandalEngine {
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
   * Calculates minimum circular angular separation on 360° circle:
   * min(|lon1 - lon2|, 360 - |lon1 - lon2|)
   */
  public static calculateCircularSeparation(lon1: number, lon2: number): number {
    const rawDiff = Math.abs(lon1 - lon2) % 360;
    return rawDiff > 180 ? 360 - rawDiff : rawDiff;
  }

  /**
   * Main entry point for pure deterministic Guru Chandal analysis
   */
  public static analyze(data: MasterKundliData | null | undefined): GuruChandalResult {
    // 1. Boundary Guard: Missing chart data or planetary dictionary
    if (!data || !data.planets) {
      return this.buildFallbackResult('INSUFFICIENT_DATA', 'कुंडली अथवा ग्रह स्थिति उपलब्ध नहीं है। (Missing chart or planetary data)');
    }

    const jupiter = this.getPlanet(data.planets, 'Jupiter');
    const rahu = this.getPlanet(data.planets, 'Rahu');

    // 2. Data Validation
    if (
      !jupiter ||
      !rahu ||
      typeof jupiter.rashi !== 'number' ||
      typeof rahu.rashi !== 'number' ||
      jupiter.rashi < 1 ||
      jupiter.rashi > 12 ||
      rahu.rashi < 1 ||
      rahu.rashi > 12 ||
      typeof jupiter.d1House !== 'number' ||
      typeof rahu.d1House !== 'number' ||
      typeof jupiter.siderealLongitude !== 'number' ||
      typeof rahu.siderealLongitude !== 'number' ||
      isNaN(jupiter.siderealLongitude) ||
      isNaN(rahu.siderealLongitude)
    ) {
      return this.buildFallbackResult('INSUFFICIENT_DATA', 'गुरु अथवा राहु का स्पष्ट भोगांश/राशि उपलब्ध नहीं है। (Missing Jupiter or Rahu data)');
    }

    // 3. Primary Same-Rashi & Same-House Evaluation
    const sameRashi = jupiter.rashi === rahu.rashi;
    const sameHouse = jupiter.d1House === rahu.d1House;

    // Detect internal data inconsistency between whole-sign house and rashi
    if (sameRashi !== sameHouse) {
      return this.buildFallbackResult(
        'DATA_CONFLICT',
        `राशि एवं भाव संरेखण में विसंगति पाई गई (Jupiter Rashi: ${jupiter.rashi}, Rahu Rashi: ${rahu.rashi}, Jupiter House: ${jupiter.d1House}, Rahu House: ${rahu.d1House}).`
      );
    }

    // 4. Calculate Exact Circular Degree Separation
    const degreeSeparation = Number(
      this.calculateCircularSeparation(jupiter.siderealLongitude, rahu.siderealLongitude).toFixed(4)
    );

    // 5. Status Determination
    const status: GuruChandalStatus = sameRashi ? 'PRESENT' : 'NOT_PRESENT';

    // 6. Structured Astronomical Mitigation Modifiers (Zero numerical scores)
    const isJupiterExalted = jupiter.rashi === 4; // Cancer
    const isJupiterOwnSign = jupiter.rashi === 9 || jupiter.rashi === 12; // Sagittarius or Pisces
    const isJupiterDebilitated = jupiter.rashi === 10; // Capricorn
    const isJupiterRetrograde = Boolean(jupiter.isRetrograde);

    const mitigationNotes: string[] = [];
    const mitigationNotesHindi: string[] = [];

    if (isJupiterExalted) {
      mitigationNotes.push('Jupiter is placed in its highest exaltation sign (Cancer), providing high moral grounding and wisdom.');
      mitigationNotesHindi.push('देवगुरु बृहस्पति अपनी परम उच्च राशि (कर्क) में स्थित हैं, जिससे उच्च विवेक एवं नैतिक बल प्राप्त होता है।');
    }

    if (isJupiterOwnSign) {
      mitigationNotes.push('Jupiter is placed in its own swakshetra sign (Sagittarius or Pisces), protecting philosophical integrity.');
      mitigationNotesHindi.push('गुरु अपनी स्वराशि (धनु अथवा मीन) में स्थित हैं, जो आत्मिक ज्ञान एवं मर्यादा की रक्षा करती है।');
    }

    if (isJupiterDebilitated) {
      mitigationNotes.push('Jupiter is in its debilitation sign (Capricorn); diligence in practical ethics and mentorship is advised.');
      mitigationNotesHindi.push('गुरु अपनी नीच राशि (मकर) में स्थित हैं; व्यवहार में सत्यनिष्ठा एवं गुरुजनों का सम्मान हितकर है।');
    }

    if (isJupiterRetrograde) {
      mitigationNotes.push('Jupiter is retrograde, indicating an introspective and unconventional philosophical learning style.');
      mitigationNotesHindi.push('गुरु वक्री अवस्था में हैं, जो अंतर्मुखी शोध एवं स्वतंत्र चिंतन का सूचक है।');
    }

    const mitigation: GuruChandalMitigationModifiers = {
      jupiterDignity: jupiter.dignity || (isJupiterExalted ? 'Exalted' : isJupiterOwnSign ? 'OwnHouse' : isJupiterDebilitated ? 'Debilitated' : 'Neutral'),
      isJupiterExalted,
      isJupiterOwnSign,
      isJupiterDebilitated,
      isJupiterRetrograde,
      mitigationNotes,
      mitigationNotesHindi
    };

    // 7. Planetary References
    const jupiterRef: PlanetaryReference = {
      house: jupiter.d1House,
      rashi: jupiter.rashi,
      rashiName: RASHI_NAMES_HI[jupiter.rashi] || null,
      degree: typeof jupiter.degree === 'number' ? jupiter.degree : null,
      siderealLongitude: jupiter.siderealLongitude,
      dignity: jupiter.dignity,
      isRetrograde: jupiter.isRetrograde
    };

    const rahuRef: PlanetaryReference = {
      house: rahu.d1House,
      rashi: rahu.rashi,
      rashiName: RASHI_NAMES_HI[rahu.rashi] || null,
      degree: typeof rahu.degree === 'number' ? rahu.degree : null,
      siderealLongitude: rahu.siderealLongitude
    };

    return {
      doshaId: 'GURU_CHANDAL_ANALYSIS',
      status,
      jupiter: jupiterRef,
      rahu: rahuRef,
      sameRashi,
      sameHouse,
      degreeSeparation,
      indication: {
        en: sameRashi
          ? `Jupiter and Rahu are conjunct in the same sign (${RASHI_NAMES_HI[jupiter.rashi] || ''}) with an angular separation of ${degreeSeparation}°. In traditional Jyotish, this is studied as Guru Chandal consideration, signifying non-conformist intellect and questioning of dogmas.`
          : 'Jupiter and Rahu are placed in different zodiac signs; Guru Chandal combination is not present.',
        hi: sameRashi
          ? `देवगुरु बृहस्पति एवं राहु एक ही राशि (${RASHI_NAMES_HI[jupiter.rashi] || ''}) में ${degreeSeparation}° के कोणीय अंतर पर स्थित हैं। पारंपरिक ज्योतिष में इसे गुरु चाण्डाल विचार के अंतर्गत देखा जाता है, जो स्वतंत्र चिंतन, रूढ़ियों पर प्रश्न उठाने एवं बौद्धिक शोध का संकेत करता है।`
          : 'गुरु एवं राहु भिन्न राशियों में स्थित हैं; गुरु चाण्डाल योग अनुपस्थित है।'
      },
      traditionMetadata: {
        tradition: 'पारंपरिक गुरु चाण्डाल विचार (Traditional Guru Chandal Analysis)',
        scope: 'Jupiter + Rahu same-Rashi analysis',
        scientificStatus: 'Traditional astrological interpretation; not scientifically established causal fact'
      },
      mitigation,
      disclaimer: {
        en: 'This analysis represents traditional astrological perspectives regarding planetary combinations. It is not an empirical scientific diagnosis or an immutable life prediction. It does not imply personal defect, deceit, or inevitable misfortune.',
        hi: 'यह विश्लेषण पारंपरिक ज्योतिषीय मान्यताओं पर आधारित है। इसे किसी व्यक्ति के चरित्र का दोष, निश्चित अनिष्ट अथवा वैज्ञानिक कारण-परिणाम न माना जाए। आत्म-संयम एवं सत्यनिष्ठा सर्वोपरि है।'
      }
    };
  }

  /**
   * Builds safe fallback result for missing or conflicting data states
   */
  private static buildFallbackResult(
    status: 'INSUFFICIENT_DATA' | 'DATA_CONFLICT',
    reasonHindi: string
  ): GuruChandalResult {
    return {
      doshaId: 'GURU_CHANDAL_ANALYSIS',
      status,
      jupiter: {
        house: null,
        rashi: null,
        rashiName: null,
        degree: null,
        siderealLongitude: null
      },
      rahu: {
        house: null,
        rashi: null,
        rashiName: null,
        degree: null,
        siderealLongitude: null
      },
      sameRashi: false,
      sameHouse: false,
      degreeSeparation: null,
      indication: {
        en: `Analysis could not be safely computed: ${reasonHindi}`,
        hi: `गणना पूर्ण नहीं हो सकी: ${reasonHindi}`
      },
      traditionMetadata: {
        tradition: 'पारंपरिक गुरु चाण्डाल विचार',
        scope: 'Jupiter + Rahu same-Rashi analysis',
        scientificStatus: 'Traditional astrological interpretation; not scientifically established'
      },
      mitigation: {
        jupiterDignity: null,
        isJupiterExalted: false,
        isJupiterOwnSign: false,
        isJupiterDebilitated: false,
        isJupiterRetrograde: false,
        mitigationNotes: [],
        mitigationNotesHindi: []
      },
      disclaimer: {
        en: `Status: ${status} - ${reasonHindi}`,
        hi: `स्थिति: ${status} - ${reasonHindi}`
      }
    };
  }
}
