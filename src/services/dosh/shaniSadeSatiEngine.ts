/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — SHANI SADE SATI & DHAIYYA ENGINE (शनि साढ़ेसाती एवं ढैया विचार)
 * PHASE 1.13C-7: DETERMINISTIC CALCULATION ENGINE
 * 
 * Evaluates Saturn's transit position relative to the Natal Moon sign (Janma Rashi).
 * Classifies Sade Sati (12th, 1st, 2nd from Moon) and Dhaiyya (4th, 8th from Moon).
 * 
 * STRICT INVARIANTS:
 * - Reads existing verified transit data; zero duplicate ephemeris calculation.
 * - Whole-sign relative house from natal Moon: 12th, 1st, 2nd, 4th, 8th.
 * - Sade Sati takes precedence over Dhaiyya.
 * - Preserves existing future transit windows and evidence IDs without regeneration.
 * - Zero severity scoring, zero arbitrary orbs, zero fatalistic predictions.
 * - Pure calculation function; zero mutation of input MasterKundliData.
 * - Zero remedies, zero AI, zero storage.
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';
import { RealTransitPlanetDetail } from '../../types/jyotish/kpTiming';
import { TransitAnalysisResult } from '../jyotish/transitEngine';
import {
  ShaniTransitAnalysisResult,
  ShaniTransitStatus,
  ShaniTransitClassification,
  SadeSatiPhase,
  ShaniTransitPosition,
  ShaniFutureWindow
} from '../../types/dosh/shaniTransitTypes';

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

const SIGN_NAME_TO_RASHI: Record<string, number> = {
  aries: 1,
  taurus: 2,
  gemini: 3,
  cancer: 4,
  leo: 5,
  virgo: 6,
  libra: 7,
  scorpio: 8,
  sagittarius: 9,
  capricorn: 10,
  aquarius: 11,
  pisces: 12
};

export interface ShaniTransitAnalysisOptions {
  currentSaturnTransit?:
    | ShaniTransitPosition
    | RealTransitPlanetDetail
    | { rashi: number; degree?: number; siderealLongitude?: number; transitDate?: string; isRetrograde?: boolean }
    | null;
  transitResult?: TransitAnalysisResult | null;
  futureWindows?: ShaniFutureWindow[];
}

export class ShaniSadeSatiEngine {
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
   * Calculates whole-sign relative house of Saturn from Moon:
   * ((saturnRashi - moonRashi + 12) % 12) + 1
   */
  public static calculateRelativeHouse(moonRashi: number, saturnRashi: number): number {
    return ((saturnRashi - moonRashi + 12) % 12) + 1;
  }

  /**
   * Extracts or normalizes the Saturn transit position from available inputs
   */
  private static extractSaturnTransit(
    data: MasterKundliData | null | undefined,
    options?: ShaniTransitAnalysisOptions
  ): ShaniTransitPosition | null {
    // 1. Direct option input
    if (options?.currentSaturnTransit) {
      const st = options.currentSaturnTransit;
      let rashi: number | null = null;
      let degree: number | null = null;
      let lon: number | null = null;
      let isRet = false;
      let date: string | null = null;

      if ('currentRashi' in st && typeof st.currentRashi === 'number') {
        rashi = st.currentRashi;
        degree = st.degree ?? null;
        lon = st.siderealLongitude ?? null;
        isRet = Boolean(st.isRetrograde);
        date = st.transitDate ?? null;
      } else if ('rashi' in st && typeof st.rashi === 'number') {
        rashi = st.rashi;
        degree = st.degree ?? null;
        lon = (st as any).siderealLongitude ?? null;
        isRet = Boolean(st.isRetrograde);
        date = st.transitDate ?? null;
      } else if ('sign' in st && typeof st.sign === 'string') {
        rashi = SIGN_NAME_TO_RASHI[st.sign.toLowerCase()] || null;
        degree = typeof st.degree === 'number' ? st.degree : null;
        lon = typeof (st as any).exactLongitude === 'number' ? (st as any).exactLongitude : null;
        isRet = Boolean(st.isRetrograde);
        date = (st as any).calculationTimestamp ?? null;
      }

      if (typeof rashi === 'number') {
        return {
          currentRashi: rashi,
          currentRashiName: RASHI_NAMES_HI[rashi] || null,
          degree,
          siderealLongitude: lon,
          transitDate: date,
          isRetrograde: isRet
        };
      }
    }

    // 2. Precalculated TransitAnalysisResult
    if (options?.transitResult) {
      const tr = options.transitResult;
      let saturnDetail: RealTransitPlanetDetail | null = null;

      if (tr.transits && Array.isArray(tr.transits)) {
        saturnDetail = tr.transits.find(p => p.planet.toLowerCase() === 'saturn') || null;
      } else if (tr.transitPlanets && tr.transitPlanets['Saturn']) {
        saturnDetail = tr.transitPlanets['Saturn'];
      }

      if (saturnDetail && typeof saturnDetail.sign === 'string') {
        const rashi = SIGN_NAME_TO_RASHI[saturnDetail.sign.toLowerCase()] || null;
        if (rashi) {
          return {
            currentRashi: rashi,
            currentRashiName: RASHI_NAMES_HI[rashi] || null,
            degree: saturnDetail.degree,
            siderealLongitude: saturnDetail.exactLongitude,
            transitDate: saturnDetail.calculationTimestamp || tr.calculationTimestamp || null,
            isRetrograde: Boolean(saturnDetail.isRetrograde)
          };
        }
      }
    }

    // 3. Optional transit property on data
    if (data && (data as any).currentTransit) {
      const ct = (data as any).currentTransit;
      if (ct.transitPlanets && ct.transitPlanets['Saturn']) {
        const saturnDetail = ct.transitPlanets['Saturn'];
        const rashi = SIGN_NAME_TO_RASHI[saturnDetail.sign?.toLowerCase()] || null;
        if (rashi) {
          return {
            currentRashi: rashi,
            currentRashiName: RASHI_NAMES_HI[rashi] || null,
            degree: saturnDetail.degree,
            siderealLongitude: saturnDetail.exactLongitude,
            transitDate: saturnDetail.calculationTimestamp || null,
            isRetrograde: Boolean(saturnDetail.isRetrograde)
          };
        }
      }
    }

    return null;
  }

  /**
   * Main entry point for pure deterministic Shani Sade Sati & Dhaiyya analysis
   */
  public static analyze(
    data: MasterKundliData | null | undefined,
    options?: ShaniTransitAnalysisOptions
  ): ShaniTransitAnalysisResult {
    // 1. Boundary Guard: Missing chart data or planetary dictionary
    if (!data || !data.planets) {
      return this.buildFallbackResult('INSUFFICIENT_DATA', 'कुंडली अथवा ग्रह स्थिति उपलब्ध नहीं है। (Missing chart or planetary data)');
    }

    const moon = this.getPlanet(data.planets, 'Moon');

    // 2. Data Validation for Natal Moon
    if (
      !moon ||
      typeof moon.rashi !== 'number' ||
      moon.rashi < 1 ||
      moon.rashi > 12
    ) {
      return this.buildFallbackResult('INSUFFICIENT_DATA', 'जन्म चंद्र राशि (Natal Moon Sign) उपलब्ध नहीं है।');
    }

    const moonRashi = moon.rashi;
    const moonHouse = typeof moon.d1House === 'number' ? moon.d1House : null;

    // 3. Extract and Validate Current Saturn Transit Data
    const saturnTransit = this.extractSaturnTransit(data, options);
    if (!saturnTransit || typeof saturnTransit.currentRashi !== 'number') {
      return this.buildFallbackResult('INSUFFICIENT_DATA', 'शनि का गोचर डेटा (Saturn Transit Data) उपलब्ध नहीं है।');
    }

    const saturnRashi = saturnTransit.currentRashi;
    if (saturnRashi < 1 || saturnRashi > 12) {
      return this.buildFallbackResult('DATA_CONFLICT', `शनि की गोचर राशि अमान्य है (${saturnRashi})।`);
    }

    // 4. Calculate Whole-Sign Relative House of Saturn from Natal Moon
    const saturnFromMoonHouse = this.calculateRelativeHouse(moonRashi, saturnRashi);

    // 5. Classification with Strict Sade Sati Precedence
    let status: ShaniTransitStatus = 'NOT_PRESENT';
    let classification: ShaniTransitClassification = 'NONE';
    let phase: SadeSatiPhase | null = null;
    let phaseHindi: string | null = null;

    if (saturnFromMoonHouse === 12) {
      // 12th from Moon: Sade Sati Rising
      status = 'PRESENT';
      classification = 'SADE_SATI';
      phase = 'RISING';
      phaseHindi = 'प्रथम चरण (उदयमान / Rising Phase)';
    } else if (saturnFromMoonHouse === 1) {
      // 1st from Moon: Sade Sati Peak
      status = 'PRESENT';
      classification = 'SADE_SATI';
      phase = 'PEAK';
      phaseHindi = 'द्वितीय चरण (शिखर / Peak Phase)';
    } else if (saturnFromMoonHouse === 2) {
      // 2nd from Moon: Sade Sati Setting
      status = 'PRESENT';
      classification = 'SADE_SATI';
      phase = 'SETTING';
      phaseHindi = 'तृतीय चरण (अस्तगामी / Setting Phase)';
    } else if (saturnFromMoonHouse === 4) {
      // 4th from Moon: Dhaiyya / Kantaka / Ardha-Ashtama
      status = 'PRESENT';
      classification = 'DHAIYYA_4TH';
      phase = null;
      phaseHindi = null;
    } else if (saturnFromMoonHouse === 8) {
      // 8th from Moon: Dhaiyya / Ashtama Shani
      status = 'PRESENT';
      classification = 'DHAIYYA_8TH';
      phase = null;
      phaseHindi = null;
    } else {
      // 3rd, 5th, 6th, 7th, 9th, 10th, 11th from Moon
      status = 'NOT_PRESENT';
      classification = 'NONE';
      phase = null;
      phaseHindi = null;
    }

    // 6. Traditional Interpretations (Strictly non-fatalistic)
    let interpretationEn = '';
    let interpretationHi = '';

    if (classification === 'SADE_SATI') {
      interpretationEn = `Saturn is transiting ${saturnFromMoonHouse === 12 ? 'the 12th house (Rising)' : saturnFromMoonHouse === 1 ? 'the Janma Rashi (Peak)' : 'the 2nd house (Setting)'} from Natal Moon. In traditional Gochara Jyotish (Phaladeepika Ch. 26), this is recognized as Sade Sati (${phaseHindi}). It represents a period of practical discipline, psychological grounding, and life restructuring.`;
      interpretationHi = `शनि जन्म चंद्र से ${saturnFromMoonHouse === 12 ? '12वें भाव (उदयमान)' : saturnFromMoonHouse === 1 ? 'जन्म राशि (शिखर)' : 'द्वितीय भाव (उतरती)'} में गोचर कर रहे हैं। फलदीपिका अध्याय 26 के अनुसार यह साढ़ेसाती का ${phaseHindi} है। यह काल अनुशासन, धैर्य, जीवन के प्राथमिकताओं के पुनर्गठन एवं आत्म-मंथन का संदेश देता है।`;
    } else if (classification === 'DHAIYYA_4TH') {
      interpretationEn = 'Saturn is transiting the 4th house from Natal Moon (Kantaka / Ardha-Ashtama Shani). Traditionally, this calls for focus on domestic balance, health awareness, and mindful decision-making.';
      interpretationHi = 'शनि जन्म चंद्र से चतुर्थ भाव में गोचर कर रहे हैं, जिसे कंटक अथवा अर्ध-अष्टम शनि ढैया कहा जाता है। पारंपरिक रूप से यह पारिवारिक शांति, स्वास्थ्य सजगता एवं धैर्यपूर्वक कर्तव्य-पालन का समय माना जाता है।';
    } else if (classification === 'DHAIYYA_8TH') {
      interpretationEn = 'Saturn is transiting the 8th house from Natal Moon (Ashtama Shani). Traditionally, this emphasizes caution, self-reliance, emotional maturity, and avoiding speculative risks.';
      interpretationHi = 'शनि जन्म चंद्र से अष्टम भाव में गोचर कर रहे हैं, जिसे अष्टम शनि ढैया कहा जाता है। यह काल आत्म-संयम, दीर्घकालिक निवेश, निष्ठा एवं अनावश्यक जोखिमों से बचने की प्रेरणा देता है।';
    } else {
      interpretationEn = `Saturn is transiting house ${saturnFromMoonHouse} from Natal Moon. Neither Sade Sati nor Dhaiyya is currently active.`;
      interpretationHi = `शनि जन्म चंद्र से ${saturnFromMoonHouse}वें भाव में गोचरस्थ हैं। वर्तमान में न तो साढ़ेसाती और न ही ढैया प्रभावी है।`;
    }

    // 7. Preserve Future Transit Windows & Evidence Ledger IDs
    let futureWindows: ShaniFutureWindow[] | undefined = undefined;
    if (options?.futureWindows && Array.isArray(options.futureWindows)) {
      // Deep clone future windows preserving exact evidenceId and provenance
      futureWindows = options.futureWindows.map(w => ({
        windowId: w.windowId,
        classification: w.classification,
        phase: w.phase,
        saturnRashi: w.saturnRashi,
        saturnRashiName: w.saturnRashiName || RASHI_NAMES_HI[w.saturnRashi] || '',
        startDate: w.startDate,
        endDate: w.endDate,
        evidenceId: w.evidenceId,
        source: w.source,
        provenance: w.provenance,
        fingerprint: w.fingerprint
      }));
    }

    return {
      doshaId: 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS',
      status,
      classification,
      phase,
      phaseHindi,
      natalMoon: {
        rashi: moonRashi,
        rashiName: RASHI_NAMES_HI[moonRashi] || null,
        house: moonHouse
      },
      saturn: saturnTransit,
      saturnFromMoonHouse,
      traditionalInterpretation: {
        en: interpretationEn,
        hi: interpretationHi
      },
      traditionMetadata: {
        tradition: 'पारंपरिक शनि गोचर विचार (Phaladeepika Ch. 26 / Gochara Shastra)',
        sourceStatus: 'ATTESTED_CLASSICAL_TRANSIT_FRAMEWORK',
        scope: 'Saturn 12th, 1st, 2nd, 4th, 8th whole-sign transit relative to Natal Moon',
        scientificStatus: 'Traditional astrological transit interpretation; not scientifically established causal fact'
      },
      futureWindows,
      disclaimer: {
        en: 'Saturn transit (Sade Sati and Dhaiyya) is a classical astrological transit analysis regarding discipline and life stages. It does not predict guaranteed destruction, financial ruination, or disease. It is not an empirical scientific diagnosis.',
        hi: 'शनि साढ़ेसाती एवं ढैया का विश्लेषण शास्त्रीय गोचर सिद्धांतों (फलदीपिका) पर आधारित है। इसे किसी विनाश, निश्चित आर्थिक हानि या शारीरिक व्याधि की भविष्यवाणी न मानें। यह केवल जीवन में धैर्य एवं आत्म-अनुशासन का प्रतीक है।'
      }
    };
  }

  /**
   * Safe fallback response when required chart or transit data is absent
   */
  private static buildFallbackResult(
    status: 'INSUFFICIENT_DATA' | 'DATA_CONFLICT',
    reasonHindi: string
  ): ShaniTransitAnalysisResult {
    return {
      doshaId: 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS',
      status,
      classification: status,
      phase: null,
      phaseHindi: null,
      natalMoon: {
        rashi: null,
        rashiName: null,
        house: null
      },
      saturn: {
        currentRashi: null,
        currentRashiName: null,
        degree: null,
        siderealLongitude: null,
        transitDate: null,
        isRetrograde: false
      },
      saturnFromMoonHouse: null,
      traditionalInterpretation: {
        en: `Calculation could not be completed: ${reasonHindi}`,
        hi: `गणना पूर्ण नहीं हो सकी: ${reasonHindi}`
      },
      traditionMetadata: {
        tradition: 'पारंपरिक शनि गोचर विचार (Phaladeepika Ch. 26 / Gochara Shastra)',
        sourceStatus: 'ATTESTED_CLASSICAL_TRANSIT_FRAMEWORK',
        scope: 'Saturn transit relative to Natal Moon',
        scientificStatus: 'Traditional astrological interpretation; not scientifically established'
      },
      disclaimer: {
        en: `Status: ${status} - ${reasonHindi}`,
        hi: `स्थिति: ${status} - ${reasonHindi}`
      }
    };
  }
}
