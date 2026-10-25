/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — GRAHAN VICHAR ENGINE (ग्रहण विचार)
 * PHASE 1.13C-5: DETERMINISTIC CALCULATION ENGINE
 * 
 * Evaluates four independent classical luminary-node conjunction combinations:
 * 1. Sun + Rahu
 * 2. Sun + Ketu
 * 3. Moon + Rahu
 * 4. Moon + Ketu
 * 
 * STRICT INVARIANTS:
 * - Primary detection is same-Rashi conjunction; same-House is recorded separately.
 * - Inconsistency between same-Rashi and same-House is flagged as DATA_CONFLICT.
 * - Circular degree separation is calculated transparently without arbitrary orb cutoffs.
 * - Zero severity scoring (no artificial points, percentages, or damage scores).
 * - Pure calculation function; zero mutation of input MasterKundliData.
 * - Zero remedies, zero AI, zero storage.
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';
import {
  GrahanResult,
  GrahanOverallStatus,
  GrahanCombinationStatus,
  GrahanCombinationDetail
} from '../../types/dosh/grahanTypes';

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

export class GrahanEngine {
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
   * Evaluates an individual luminary-node combination pair
   */
  private static evaluateCombination(
    combinationId: 'SUN_RAHU' | 'SUN_KETU' | 'MOON_RAHU' | 'MOON_KETU',
    luminary: PlanetData | null,
    node: PlanetData | null,
    luminaryName: 'Sun' | 'Moon',
    nodeName: 'Rahu' | 'Ketu'
  ): GrahanCombinationDetail {
    const luminaryNameHi = luminaryName === 'Sun' ? 'सूर्य' : 'चंद्र';
    const nodeNameHi = nodeName === 'Rahu' ? 'राहु' : 'केतु';

    // Guard: missing or invalid planetary parameters
    if (
      !luminary ||
      !node ||
      typeof luminary.rashi !== 'number' ||
      typeof node.rashi !== 'number' ||
      luminary.rashi < 1 ||
      luminary.rashi > 12 ||
      node.rashi < 1 ||
      node.rashi > 12 ||
      typeof luminary.d1House !== 'number' ||
      typeof node.d1House !== 'number' ||
      typeof luminary.siderealLongitude !== 'number' ||
      typeof node.siderealLongitude !== 'number' ||
      isNaN(luminary.siderealLongitude) ||
      isNaN(node.siderealLongitude)
    ) {
      return {
        combinationId,
        luminary: luminaryName,
        node: nodeName,
        status: 'INSUFFICIENT_DATA',
        luminaryHouse: luminary?.d1House ?? null,
        luminaryRashi: luminary?.rashi ?? null,
        luminaryRashiName: luminary?.rashi ? RASHI_NAMES_HI[luminary.rashi] || null : null,
        luminaryDegree: typeof luminary?.degree === 'number' ? luminary.degree : null,
        luminarySiderealLongitude: typeof luminary?.siderealLongitude === 'number' && !isNaN(luminary.siderealLongitude) ? luminary.siderealLongitude : null,
        nodeHouse: node?.d1House ?? null,
        nodeRashi: node?.rashi ?? null,
        nodeRashiName: node?.rashi ? RASHI_NAMES_HI[node.rashi] || null : null,
        nodeDegree: typeof node?.degree === 'number' ? node.degree : null,
        nodeSiderealLongitude: typeof node?.siderealLongitude === 'number' && !isNaN(node.siderealLongitude) ? node.siderealLongitude : null,
        sameRashi: false,
        sameHouse: false,
        degreeSeparation: null,
        indication: {
          en: `Data for ${luminaryName} or ${nodeName} is missing or incomplete.`,
          hi: `${luminaryNameHi} अथवा ${nodeNameHi} का डेटा अपूर्ण या अनुपलब्ध है।`
        }
      };
    }

    const sameRashi = luminary.rashi === node.rashi;
    const sameHouse = luminary.d1House === node.d1House;

    // Detect inconsistency between whole-sign house assignment and Rashi
    if (sameRashi !== sameHouse) {
      return {
        combinationId,
        luminary: luminaryName,
        node: nodeName,
        status: 'DATA_CONFLICT',
        luminaryHouse: luminary.d1House,
        luminaryRashi: luminary.rashi,
        luminaryRashiName: RASHI_NAMES_HI[luminary.rashi] || null,
        luminaryDegree: typeof luminary.degree === 'number' ? luminary.degree : null,
        luminarySiderealLongitude: luminary.siderealLongitude,
        nodeHouse: node.d1House,
        nodeRashi: node.rashi,
        nodeRashiName: RASHI_NAMES_HI[node.rashi] || null,
        nodeDegree: typeof node.degree === 'number' ? node.degree : null,
        nodeSiderealLongitude: node.siderealLongitude,
        sameRashi,
        sameHouse,
        degreeSeparation: null,
        indication: {
          en: `Inconsistency detected: ${luminaryName} and ${nodeName} match same-Rashi (${sameRashi}) but differ in whole-sign house (${sameHouse}).`,
          hi: `राशि एवं भाव संरेखण में विसंगति: ${luminaryNameHi} एवं ${nodeNameHi} की राशि संरेखण (${sameRashi}) और भाव संरेखण (${sameHouse}) में विरोधाभास है।`
        }
      };
    }

    const degreeSeparation = Number(
      this.calculateCircularSeparation(luminary.siderealLongitude, node.siderealLongitude).toFixed(4)
    );

    const status: GrahanCombinationStatus = sameRashi ? 'PRESENT' : 'NOT_PRESENT';

    return {
      combinationId,
      luminary: luminaryName,
      node: nodeName,
      status,
      luminaryHouse: luminary.d1House,
      luminaryRashi: luminary.rashi,
      luminaryRashiName: RASHI_NAMES_HI[luminary.rashi] || null,
      luminaryDegree: typeof luminary.degree === 'number' ? luminary.degree : null,
      luminarySiderealLongitude: luminary.siderealLongitude,
      nodeHouse: node.d1House,
      nodeRashi: node.rashi,
      nodeRashiName: RASHI_NAMES_HI[node.rashi] || null,
      nodeDegree: typeof node.degree === 'number' ? node.degree : null,
      nodeSiderealLongitude: node.siderealLongitude,
      sameRashi,
      sameHouse,
      degreeSeparation,
      indication: {
        en: sameRashi
          ? `${luminaryName} and ${nodeName} occupy the same sign (${RASHI_NAMES_HI[luminary.rashi] || ''}) with a degree separation of ${degreeSeparation}°. In traditional Jyotish, this is considered a ${luminaryName}-Grahan association.`
          : `${luminaryName} and ${nodeName} occupy different zodiac signs; no same-Rashi Grahan combination is present.`,
        hi: sameRashi
          ? `${luminaryNameHi} एवं ${nodeNameHi} एक ही राशि (${RASHI_NAMES_HI[luminary.rashi] || ''}) में ${degreeSeparation}° के अंतर पर स्थित हैं। पारंपरिक ज्योतिष में इसे ${luminaryNameHi}-ग्रहण योग विचार के अंतर्गत देखा जाता है।`
          : `${luminaryNameHi} एवं ${nodeNameHi} भिन्न राशियों में स्थित हैं; यह ग्रहण संयोजन अनुपस्थित है।`
      }
    };
  }

  /**
   * Main entry point for pure deterministic Grahan Vichar analysis
   */
  public static analyze(data: MasterKundliData | null | undefined): GrahanResult {
    // 1. Boundary Guard: Missing chart data or planetary dictionary
    if (!data || !data.planets) {
      return this.buildFallbackResult('INSUFFICIENT_DATA', 'कुंडली अथवा ग्रह स्थिति उपलब्ध नहीं है। (Missing chart or planetary data)');
    }

    const sun = this.getPlanet(data.planets, 'Sun');
    const moon = this.getPlanet(data.planets, 'Moon');
    const rahu = this.getPlanet(data.planets, 'Rahu');
    const ketu = this.getPlanet(data.planets, 'Ketu');

    // 2. Evaluate all 4 independent combinations
    const sunRahu = this.evaluateCombination('SUN_RAHU', sun, rahu, 'Sun', 'Rahu');
    const sunKetu = this.evaluateCombination('SUN_KETU', sun, ketu, 'Sun', 'Ketu');
    const moonRahu = this.evaluateCombination('MOON_RAHU', moon, rahu, 'Moon', 'Rahu');
    const moonKetu = this.evaluateCombination('MOON_KETU', moon, ketu, 'Moon', 'Ketu');

    const combinations = [sunRahu, sunKetu, moonRahu, moonKetu];

    // 3. Determine Overall Status
    let overallStatus: GrahanOverallStatus = 'NOT_PRESENT';

    if (combinations.some(c => c.status === 'DATA_CONFLICT')) {
      overallStatus = 'DATA_CONFLICT';
    } else if (combinations.some(c => c.status === 'INSUFFICIENT_DATA')) {
      overallStatus = 'INSUFFICIENT_DATA';
    } else if (combinations.some(c => c.status === 'PRESENT')) {
      overallStatus = 'PRESENT';
    } else {
      overallStatus = 'NOT_PRESENT';
    }

    const activeCombinationsCount = combinations.filter(c => c.status === 'PRESENT').length;

    return {
      doshaId: 'GRAHAN_VICHAR_ANALYSIS',
      overallStatus,
      sunRahu,
      sunKetu,
      moonRahu,
      moonKetu,
      activeCombinationsCount,
      traditionMetadata: {
        tradition: 'पारंपरिक ग्रहण विचार (Traditional Grahan Vichar Analysis)',
        scope: 'Independent evaluation of Sun/Moon with Rahu/Ketu in the same zodiac sign',
        scientificStatus: 'Traditional astrological interpretation; not scientifically established causal fact'
      },
      disclaimer: {
        en: 'This analysis reflects traditional astrological observations concerning luminary and nodal conjunctions. It is not an empirical medical, psychological, or material prediction, nor an indicator of inevitable misfortune or curses.',
        hi: 'यह विश्लेषण सूर्य-चंद्र एवं राहु-केतु के पारंपरिक शास्त्रीय संरेखण पर आधारित है। इसे किसी वास्तविक शाप, शारीरिक व्याधि अथवा निश्चित दुर्भाग्य की भविष्यवाणी न माना जाए। विवेक एवं सात्विक साधना सर्वोपरि है।'
      }
    };
  }

  /**
   * Builds safe fallback result for missing or invalid top-level data
   */
  private static buildFallbackResult(
    overallStatus: 'INSUFFICIENT_DATA' | 'DATA_CONFLICT',
    reasonHindi: string
  ): GrahanResult {
    const makeEmptyCombination = (
      combinationId: 'SUN_RAHU' | 'SUN_KETU' | 'MOON_RAHU' | 'MOON_KETU',
      luminary: 'Sun' | 'Moon',
      node: 'Rahu' | 'Ketu'
    ): GrahanCombinationDetail => ({
      combinationId,
      luminary,
      node,
      status: overallStatus,
      luminaryHouse: null,
      luminaryRashi: null,
      luminaryRashiName: null,
      luminaryDegree: null,
      luminarySiderealLongitude: null,
      nodeHouse: null,
      nodeRashi: null,
      nodeRashiName: null,
      nodeDegree: null,
      nodeSiderealLongitude: null,
      sameRashi: false,
      sameHouse: false,
      degreeSeparation: null,
      indication: {
        en: `Analysis could not be computed: ${reasonHindi}`,
        hi: `गणना पूर्ण नहीं हो सकी: ${reasonHindi}`
      }
    });

    return {
      doshaId: 'GRAHAN_VICHAR_ANALYSIS',
      overallStatus,
      sunRahu: makeEmptyCombination('SUN_RAHU', 'Sun', 'Rahu'),
      sunKetu: makeEmptyCombination('SUN_KETU', 'Sun', 'Ketu'),
      moonRahu: makeEmptyCombination('MOON_RAHU', 'Moon', 'Rahu'),
      moonKetu: makeEmptyCombination('MOON_KETU', 'Moon', 'Ketu'),
      activeCombinationsCount: 0,
      traditionMetadata: {
        tradition: 'पारंपरिक ग्रहण विचार',
        scope: 'Independent evaluation of Sun/Moon with Rahu/Ketu in the same sign',
        scientificStatus: 'Traditional astrological interpretation; not scientifically established'
      },
      disclaimer: {
        en: `Status: ${overallStatus} - ${reasonHindi}`,
        hi: `स्थिति: ${overallStatus} - ${reasonHindi}`
      }
    };
  }
}
