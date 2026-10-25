/**
 * JEEVANDARPAN — KP PHASE 3C EVENT TIMING ENGINE
 * 
 * Determines event timing windows using deterministic Vimshottari Dasha
 * (Mahadasha & Antardasha), KP 4-Fold Significators, Primary Cusp Sub-Lord,
 * Ruling Planets, and Transit Engine integration.
 * 
 * STRICT ARCHITECTURAL CONSTRAINTS:
 * - NEVER invent date, month, year, or duration.
 * - Dates originate strictly from verified Dasha periods.
 * - Favourability derived purely from mathematical KP house-significator intersections.
 * - AI never computes timing.
 */

import { MasterKundliData, DashaPeriod } from '../../types/kundli';
import { DateTime } from 'luxon';
import { KPAnalysisResult, KPPlanetSignificator } from './kpEngine';
import { KPJudgmentOutput, KPQuestionCategory, KP_EVENT_HOUSE_MAPPINGS } from '../../types/jyotish/kpJudgment';
import {
  KPTimingAnalysis,
  KPTimingWindow,
  KPCurrentPeriodStatus,
  KPTransitCorroboration,
  KPTimingFavourability,
  KPTimingPeriodType,
  KPTimingEvidenceLayers,
  FutureTransitCorroboration
} from '../../types/jyotish/kpTiming';
import { VimshottariEngine } from './dasha/vimshottari';
import { TransitEngine, TransitAnalysisResult, TransitCalculationOptions } from './transitEngine';
import { FutureTransitEngine } from './futureTransitEngine';

const HINDI_MONTHS = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const ENGLISH_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const PLANET_NAMES_HI: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगल',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु'
};

export class KpTimingEngine {
  private transitEngine = new TransitEngine();
  private futureTransitEngine = new FutureTransitEngine();

  /**
   * Main timing evaluation entry point.
   */
  public evaluateTiming(
    masterData: MasterKundliData | null | undefined,
    kpResult: KPAnalysisResult,
    judgmentResult: KPJudgmentOutput,
    precalculatedTransit?: TransitAnalysisResult | null
  ): KPTimingAnalysis {
    const category = judgmentResult.category || 'career_job';
    const categoryMapping = KP_EVENT_HOUSE_MAPPINGS[category] || KP_EVENT_HOUSE_MAPPINGS.career_job;
    const targetHouses = categoryMapping.targetHouses;
    const adverseHouses = categoryMapping.adverseHouses;
    const primaryCusp = categoryMapping.primaryCusp;

    const primaryCuspSubLord = judgmentResult.primaryCuspSubLord?.subLord ||
      kpResult.cuspData.find(c => c.house === primaryCusp)?.subLord || 'Unknown';

    // 1. Resolve Vimshottari Dasha data from MasterKundliData or compute via VimshottariEngine
    let vimshottari = masterData?.vimshottariDasha;
    if (!vimshottari && masterData?.birthProfile && masterData?.planets?.Moon) {
      try {
        vimshottari = VimshottariEngine.calculate(masterData);
      } catch {
        // If birthProfile has ISO dates, normalize to standard format expected by VimshottariEngine
        try {
          const bp = masterData.birthProfile;
          const isoCandidate = `${bp.dob.trim()}T${bp.time.trim()}`;
          const dt = DateTime.fromISO(isoCandidate, { zone: bp.timezone || 'Asia/Kolkata' });
          if (dt.isValid) {
            const normalizedData: MasterKundliData = {
              ...masterData,
              birthProfile: {
                ...bp,
                dob: dt.toFormat('dd MMMM yyyy'),
                time: dt.toFormat('hh:mm a')
              }
            };
            vimshottari = VimshottariEngine.calculate(normalizedData);
          }
        } catch {
          vimshottari = null;
        }
      }
    }

    // If Dasha data is unavailable, return deterministic insufficient result
    if (!vimshottari || !vimshottari.currentMahadasha || !vimshottari.currentAntardasha) {
      return this.buildInsufficientTimingResult(
        judgmentResult.question,
        category,
        { hi: categoryMapping.labelHi, en: categoryMapping.labelEn },
        targetHouses,
        adverseHouses,
        primaryCusp,
        primaryCuspSubLord,
        judgmentResult.outcome
      );
    }

    // 2. Evaluate Current Active Period (Mahadasha & Antardasha)
    const currentMahaLord = vimshottari.currentMahadasha.planet;
    const currentAntarLord = vimshottari.currentAntardasha.planet;
    const mahaSig = this.getSignificatorHouses(kpResult, currentMahaLord);
    const antarSig = this.getSignificatorHouses(kpResult, currentAntarLord);

    const isCurrentMahaSupportive = this.checkSupportive(mahaSig, targetHouses, adverseHouses);
    const isCurrentAntarSupportive = this.checkSupportive(antarSig, targetHouses, adverseHouses);

    const currentPeriodStatus: KPCurrentPeriodStatus = {
      mahadashaLord: currentMahaLord,
      mahadashaStart: vimshottari.currentMahadasha.startDate,
      mahadashaEnd: vimshottari.currentMahadasha.endDate,
      mahadashaSignifiedHouses: mahaSig,
      isMahadashaSupportive: isCurrentMahaSupportive,
      antardashaLord: currentAntarLord,
      antardashaStart: vimshottari.currentAntardasha.startDate,
      antardashaEnd: vimshottari.currentAntardasha.endDate,
      antardashaSignifiedHouses: antarSig,
      isAntardashaSupportive: isCurrentAntarSupportive,
      formattedCurrentRange: {
        hi: `${this.formatDate(vimshottari.currentAntardasha.startDate, 'hi')} से ${this.formatDate(vimshottari.currentAntardasha.endDate, 'hi')}`,
        en: `${this.formatDate(vimshottari.currentAntardasha.startDate, 'en')} to ${this.formatDate(vimshottari.currentAntardasha.endDate, 'en')}`
      },
      summary: {
        hi: `वर्तमान में ${PLANET_NAMES_HI[currentMahaLord] || currentMahaLord} की महादशा में ${PLANET_NAMES_HI[currentAntarLord] || currentAntarLord} की अंतर्दशा चल रही है।`,
        en: `Currently running ${currentMahaLord} Mahadasha with ${currentAntarLord} Antardasha.`
      }
    };

    // 3. Extract and Evaluate Sequential Antardashas (Current + Next 6-8 periods)
    const rawWindows = this.extractChronologicalAntardashas(vimshottari);
    const evaluatedWindows: KPTimingWindow[] = [];

    rawWindows.forEach((period, idx) => {
      const w = this.evaluateAntardashaWindow(
        period,
        idx === 0 ? 'CURRENT_ACTIVE' : idx === 1 ? 'NEXT_IMMEDIATE' : 'UPCOMING_FAVOURABLE',
        kpResult,
        targetHouses,
        adverseHouses,
        primaryCuspSubLord,
        category
      );
      evaluatedWindows.push(w);
    });

    // Sort or filter prime windows
    const favourableWindows = evaluatedWindows.filter(
      w => w.favourability === 'HIGHLY_FAVOURABLE' || w.favourability === 'FAVOURABLE'
    );

    const mostFavourableWindow = favourableWindows.length > 0
      ? favourableWindows[0]
      : evaluatedWindows.find(w => w.favourability === 'MODERATE_MIXED') || evaluatedWindows[0] || null;

    // 4. Transit Corroboration via TransitEngine (Real Swiss Ephemeris or explicit NOT_AVAILABLE)
    const transitCorroboration = this.buildTransitCorroboration(
      masterData,
      kpResult,
      targetHouses,
      adverseHouses,
      mostFavourableWindow?.antardashaLord || currentAntarLord,
      precalculatedTransit
    );

    // Update currentTransitEvidence and actualTransitEvidence on all evaluated windows
    evaluatedWindows.forEach(w => {
      if (w.evidenceLayers) {
        const curEvidence = {
          status: transitCorroboration.status,
          isCorroborated: transitCorroboration.isCorroborated,
          supportingPlanets: transitCorroboration.transitSignificatorPlanets || [],
          summary: transitCorroboration.description,
          calculationTimestamp: transitCorroboration.calculationTimestamp
        };
        w.evidenceLayers.currentTransitEvidence = curEvidence;
        w.evidenceLayers.actualTransitEvidence = curEvidence;
      }
    });

    // 5. Human Explanations
    const humanTimingSummary = this.buildHumanTimingSummary(
      category,
      judgmentResult.outcome,
      currentPeriodStatus,
      mostFavourableWindow,
      primaryCuspSubLord,
      targetHouses
    );

    const timingGuidance = this.buildTimingGuidance(
      category,
      judgmentResult.outcome,
      currentPeriodStatus,
      mostFavourableWindow
    );

    const timingUncertaintyNote = {
      hi: 'यह समय-सारणी पारंपरिक KP दशा-भुक्ति और कार्येश सिद्धान्तों पर आधारित है। सटीक घटनाक्रम व्यक्ति के सतत पुरुषार्थ, बाहरी परिस्थितियों और जन्म समय की सूक्ष्म सटीकता पर भी निर्भर करता है।',
      en: 'This timeline is based on traditional KP Dasha-Bhukti significator principles. Actual timing is also influenced by personal initiative, external circumstances, and birth-time precision.'
    };

    // 6. Evidence Reference
    const evidenceReference = {
      dashaSource: 'Vimshottari (Moon Sidereal Longitude)',
      primaryCuspSubLord,
      favourablePlanets: Object.keys(kpResult.significators?.byPlanet || {}).filter(p => {
        const sigs = this.getSignificatorHouses(kpResult, p);
        return sigs.some(h => targetHouses.includes(h));
      }),
      adversePlanets: Object.keys(kpResult.significators?.byPlanet || {}).filter(p => {
        const sigs = this.getSignificatorHouses(kpResult, p);
        return sigs.some(h => adverseHouses.includes(h));
      }),
      rulingPlanets: kpResult.rulingPlanets?.allRulingPlanets || []
    };

    return {
      question: judgmentResult.question,
      category,
      categoryLabel: { hi: categoryMapping.labelHi, en: categoryMapping.labelEn },
      eventTargetHouses: targetHouses,
      eventAdverseHouses: adverseHouses,
      isEventPromised: judgmentResult.outcome === 'FAVOURABLE',
      judgmentOutcome: judgmentResult.outcome,
      primaryCusp,
      primaryCuspSubLord,
      currentPeriod: currentPeriodStatus,
      evaluatedWindows,
      mostFavourableWindow,
      favourableWindows,
      transitCorroboration,
      humanTimingSummary,
      timingGuidance,
      timingUncertaintyNote,
      evidenceReference
    };
  }

  /**
   * Async evaluation which computes Swiss Ephemeris transit before timing
   * and performs genuine deterministic future window transit scanning (Phase 3C.2).
   */
  public async evaluateTimingAsync(
    masterData: MasterKundliData | null | undefined,
    kpResult: KPAnalysisResult,
    judgmentResult: KPJudgmentOutput,
    options?: TransitCalculationOptions
  ): Promise<KPTimingAnalysis> {
    const transit = await this.transitEngine.calculateTransit(options, masterData);
    const timing = this.evaluateTiming(masterData, kpResult, judgmentResult, transit);

    // Phase 3C.2: Perform genuine future transit scan on the candidate/top window
    if (timing.mostFavourableWindow) {
      try {
        const futureCorroboration = await this.futureTransitEngine.scanWindow(
          timing.mostFavourableWindow,
          masterData,
          kpResult,
          timing.eventTargetHouses,
          timing.eventAdverseHouses,
          timing.primaryCuspSubLord,
          {
            latitude: options?.latitude,
            longitude: options?.longitude,
            timezone: options?.timezone,
            ayanamsa: options?.ayanamsa
          }
        );
        timing.futureTransitCorroboration = futureCorroboration;
        timing.mostFavourableWindow.futureTransitCorroboration = futureCorroboration;
        if (timing.mostFavourableWindow.evidenceLayers) {
          timing.mostFavourableWindow.evidenceLayers.futureTransitEvidence = futureCorroboration;
        }
      } catch (err) {
        console.warn('Future transit scan execution note:', err);
      }
    }

    return timing;
  }

  /**
   * Evaluates a single Antardasha window for a specific category.
   */
  private evaluateAntardashaWindow(
    period: { mahadashaLord: string; antardashaLord: string; startDate: string; endDate: string },
    periodType: KPTimingPeriodType,
    kpResult: KPAnalysisResult,
    targetHouses: number[],
    adverseHouses: number[],
    primaryCuspSubLord: string,
    _category: KPQuestionCategory
  ): KPTimingWindow {
    const mahaLord = period.mahadashaLord;
    const antarLord = period.antardashaLord;

    const mahaHouses = this.getSignificatorHouses(kpResult, mahaLord);
    const antarHouses = this.getSignificatorHouses(kpResult, antarLord);

    const targetHousesSignified = Array.from(
      new Set(antarHouses.filter(h => targetHouses.includes(h)))
    ).sort((a, b) => a - b);

    const adverseHousesSignified = Array.from(
      new Set(antarHouses.filter(h => adverseHouses.includes(h)))
    ).sort((a, b) => a - b);

    const isMahaSupportive = this.checkSupportive(mahaHouses, targetHouses, adverseHouses);
    const isAntarSupportive = targetHousesSignified.length > 0;

    // Check Ruling Planet alignment
    const rps = kpResult.rulingPlanets?.allRulingPlanets || [];
    const isRulingPlanetCorroborated = rps.includes(antarLord) || rps.includes(mahaLord);

    // Check Sub Lord connection
    const isCuspSubLordConnected =
      antarLord === primaryCuspSubLord ||
      mahaLord === primaryCuspSubLord ||
      antarHouses.includes(primaryCuspSubLord as any);

    // Calculate deterministic significator score (0 to 100)
    let score = 30; // base neutrality

    // Target house additions
    score += targetHousesSignified.length * 18;
    if (isMahaSupportive) score += 15;
    if (isRulingPlanetCorroborated) score += 15;
    if (isCuspSubLordConnected) score += 12;

    // Adverse house deductions
    score -= adverseHousesSignified.length * 18;

    // Retrograde check
    const antarPlanetData = kpResult.planetData.find(p => p.planet === antarLord);
    if (antarPlanetData?.retrograde) {
      score -= 10;
    }

    score = Math.max(10, Math.min(95, score));

    // Determine favourability tier
    let favourability: KPTimingFavourability = 'NEUTRAL';
    if (score >= 68 && targetHousesSignified.length >= 1) {
      favourability = 'HIGHLY_FAVOURABLE';
    } else if (score >= 50 && targetHousesSignified.length >= 1) {
      favourability = 'FAVOURABLE';
    } else if (targetHousesSignified.length > 0 && adverseHousesSignified.length > 0) {
      favourability = 'MODERATE_MIXED';
    } else if (adverseHousesSignified.length > targetHousesSignified.length || score < 40) {
      favourability = 'CHALLENGING_DELAY';
    }

    const durationMonths = this.calculateDurationMonths(period.startDate, period.endDate);

    const formattedStart = {
      hi: this.formatDate(period.startDate, 'hi'),
      en: this.formatDate(period.startDate, 'en')
    };
    const formattedEnd = {
      hi: this.formatDate(period.endDate, 'hi'),
      en: this.formatDate(period.endDate, 'en')
    };

    const mahaLordHi = PLANET_NAMES_HI[mahaLord] || mahaLord;
    const antarLordHi = PLANET_NAMES_HI[antarLord] || antarLord;

    const evidenceSummary = {
      hi: `${mahaLordHi}-${antarLordHi} अवधि (${formattedStart.hi} से ${formattedEnd.hi})। भाव [${targetHousesSignified.join(', ')}] को सक्रिय करती है। ${isRulingPlanetCorroborated ? 'रूलिंग ग्रहों का समर्थन प्राप्त है।' : ''}`,
      en: `${mahaLord}-${antarLord} period (${formattedStart.en} to ${formattedEnd.en}). Activates houses [${targetHousesSignified.join(', ')}]. ${isRulingPlanetCorroborated ? 'Supported by Ruling Planets.' : ''}`
    };

    const favourabilityLabels: Record<KPTimingFavourability, { hi: string; en: string }> = {
      HIGHLY_FAVOURABLE: { hi: 'अत्यंत अनुकूल खिड़की', en: 'Highly Favourable Window' },
      FAVOURABLE: { hi: 'अनुकूल समय', en: 'Favourable Period' },
      MODERATE_MIXED: { hi: 'मिश्रित व मध्यम संकेत', en: 'Mixed / Moderate Period' },
      CHALLENGING_DELAY: { hi: 'विलंब व चुनौती की संभावना', en: 'Delay / Challenging Period' },
      NEUTRAL: { hi: 'तटस्थ समय', en: 'Neutral Period' }
    };

    const dashaEvidence = {
      isSupportive: isMahaSupportive && isAntarSupportive,
      mahadashaLord: mahaLord,
      antardashaLord: antarLord,
      summary: {
        hi: `${mahaLordHi} महादशा और ${antarLordHi} अंतर्दशा का प्रभाव।`,
        en: `${mahaLord} Mahadasha and ${antarLord} Antardasha active.`
      }
    };

    const kpSignificatorEvidence = {
      isSupportive: targetHousesSignified.length > 0,
      targetHousesSignified,
      adverseHousesSignified,
      score,
      summary: {
        hi: `KP 4-स्तरीय कार्येश अनुसार अनुकूल भाव [${targetHousesSignified.join(', ')}] सक्रिय हैं।`,
        en: `KP 4-Fold significators activate target houses [${targetHousesSignified.join(', ')}].`
      }
    };

    const cuspSubLordEvidence = {
      isConnected: isCuspSubLordConnected,
      primaryCuspSubLord,
      summary: {
        hi: isCuspSubLordConnected
          ? `कस्प उप-स्वामी (${PLANET_NAMES_HI[primaryCuspSubLord] || primaryCuspSubLord}) के साथ प्रत्यक्ष संबंध स्थापित है।`
          : `कस्प उप-स्वामी (${PLANET_NAMES_HI[primaryCuspSubLord] || primaryCuspSubLord}) के साथ प्रत्यक्ष संबंध नहीं है।`,
        en: isCuspSubLordConnected
          ? `Direct connection with primary cusp sub-lord (${primaryCuspSubLord}).`
          : `No direct connection with primary cusp sub-lord (${primaryCuspSubLord}).`
      }
    };

    const rulingPlanetCorroboration = {
      isCorroborated: isRulingPlanetCorroborated,
      matchedPlanets: isRulingPlanetCorroborated ? [antarLord] : [],
      summary: {
        hi: isRulingPlanetCorroborated
          ? `रूलिंग ग्रहों (Ruling Planets) द्वारा इस अवधि का समर्थन प्राप्त है।`
          : `रूलिंग ग्रहों द्वारा प्रत्यक्ष पुष्टि नहीं है।`,
        en: isRulingPlanetCorroborated
          ? `Corroborated by Ruling Planets at query time.`
          : `Not directly corroborated by Ruling Planets.`
      }
    };

    const curEvidence = {
      status: 'NOT_AVAILABLE' as const,
      isCorroborated: false,
      supportingPlanets: [],
      summary: {
        hi: 'वर्तमान गोचर डेटा उपलब्ध नहीं है, इसलिए वास्तविक गोचर समर्थन की पुष्टि नहीं की जा सकती।',
        en: 'Current transit data is not available, so real transit corroboration cannot be confirmed.'
      }
    };

    const futureEvidence: FutureTransitCorroboration = {
      status: 'NOT_AVAILABLE',
      isCorroborated: false,
      scanStart: period.startDate,
      scanEnd: period.endDate,
      timestampsEvaluatedCount: 0,
      candidateEventsCount: 0,
      verifiedEventsCount: 0,
      supportingPlanets: [],
      keyTransitEvents: [],
      summary: {
        hi: 'वास्तविक भविष्य गोचर गणना उपलब्ध नहीं है, इसलिए इस समय-खिड़की के लिए गोचर समर्थन की पुष्टि नहीं की जा सकती।',
        en: 'Real future transit calculation is unavailable, so transit corroboration cannot be confirmed for this window.'
      },
      ephemerisSource: 'Swiss Ephemeris'
    };

    const evidenceLayers: KPTimingEvidenceLayers = {
      dashaEvidence,
      kpSignificatorEvidence,
      cuspSubLordEvidence,
      rulingPlanetCorroboration,
      currentTransitEvidence: curEvidence,
      actualTransitEvidence: curEvidence,
      futureTransitEvidence: futureEvidence
    };

    return {
      id: `${mahaLord}-${antarLord}-${period.startDate.slice(0, 10)}`,
      periodType,
      mahadashaLord: mahaLord,
      antardashaLord: antarLord,
      startDate: period.startDate,
      endDate: period.endDate,
      formattedStart,
      formattedEnd,
      durationMonths,
      favourability,
      favourabilityLabel: favourabilityLabels[favourability],
      significatorScore: score,
      targetHousesSignified,
      adverseHousesSignified,
      isMahadashaSupportive: isMahaSupportive,
      isAntardashaSupportive: isAntarSupportive,
      isRulingPlanetCorroborated,
      isCuspSubLordConnected,
      evidenceSummary,
      evidenceLayers
    };
  }

  /**
   * Extracts chronological Antardashas (current + upcoming).
   */
  private extractChronologicalAntardashas(
    vimshottari: any
  ): Array<{ mahadashaLord: string; antardashaLord: string; startDate: string; endDate: string }> {
    const list: Array<{ mahadashaLord: string; antardashaLord: string; startDate: string; endDate: string }> = [];
    const currentMaha = vimshottari.currentMahadasha;
    const currentAntar = vimshottari.currentAntardasha;

    if (!currentMaha?.subPeriods) return list;

    // Find current antardasha index
    const currentIdx = currentMaha.subPeriods.findIndex(
      (ad: DashaPeriod) => ad.planet === currentAntar.planet && ad.startDate === currentAntar.startDate
    );

    const startIdx = currentIdx >= 0 ? currentIdx : 0;

    // Collect remaining in current Mahadasha
    for (let i = startIdx; i < currentMaha.subPeriods.length; i++) {
      const ad = currentMaha.subPeriods[i];
      list.push({
        mahadashaLord: currentMaha.planet,
        antardashaLord: ad.planet,
        startDate: ad.startDate,
        endDate: ad.endDate
      });
      if (list.length >= 7) break;
    }

    // If less than 6 periods, add from next Mahadasha
    if (list.length < 6 && vimshottari.nextMahadasha?.subPeriods) {
      const nextMaha = vimshottari.nextMahadasha;
      for (let j = 0; j < nextMaha.subPeriods.length; j++) {
        const ad = nextMaha.subPeriods[j];
        list.push({
          mahadashaLord: nextMaha.planet,
          antardashaLord: ad.planet,
          startDate: ad.startDate,
          endDate: ad.endDate
        });
        if (list.length >= 7) break;
      }
    }

    return list;
  }

  /**
   * Builds human-readable narrative timing summary.
   */
  private buildHumanTimingSummary(
    category: KPQuestionCategory,
    judgmentOutcome: string,
    currentPeriod: KPCurrentPeriodStatus,
    bestWindow: KPTimingWindow | null,
    primaryCuspSubLord: string,
    targetHouses: number[]
  ): { hi: string; en: string } {
    const cuspSubLordHi = PLANET_NAMES_HI[primaryCuspSubLord] || primaryCuspSubLord;
    const currentMahaHi = PLANET_NAMES_HI[currentPeriod.mahadashaLord] || currentPeriod.mahadashaLord;
    const currentAntarHi = PLANET_NAMES_HI[currentPeriod.antardashaLord] || currentPeriod.antardashaLord;

    if (judgmentOutcome === 'CHALLENGING') {
      return {
        hi: `कस्प उप-स्वामी (${cuspSubLordHi}) स्तर पर प्रतिकूल भावों का प्रभाव अधिक होने के कारण मूलभूत संकेत चुनौतीपूर्ण या विलंबकारी हैं। वर्तमान ${currentMahaHi}-${currentAntarHi} अवधि में तत्काल पूर्ण फलित के बजाय धैर्य व तैयारी रखना श्रेयस्कर रहेगा। यदि कोई अनुकूल सब-पीरियड आता है, तो वह केवल आंशिक राहत या सीमित प्रगति प्रदान कर सकता है।`,
        en: `Due to primary cusp sub-lord (${primaryCuspSubLord}) signifying obstructive houses, fundamental indicators suggest delays. In the current ${currentPeriod.mahadashaLord}-${currentPeriod.antardashaLord} period, patience is advised rather than expecting sudden breakthrough.`
      };
    }

    if (!bestWindow) {
      return {
        hi: `वर्तमान दशा-भुक्ति संरचना में स्पष्ट अनुकूल समय-खिड़की निकट भविष्य में सक्रिय नहीं दिख रही है। वर्तमान परिस्थितियों को सुदृढ़ रखने पर ध्यान दें।`,
        en: `A clearly supportive timing window is not actively highlighted in the immediate near-term Dasha. Focus on consolidating current positions.`
      };
    }

    const bestAntarHi = PLANET_NAMES_HI[bestWindow.antardashaLord] || bestWindow.antardashaLord;
    const bestMahaHi = PLANET_NAMES_HI[bestWindow.mahadashaLord] || bestWindow.mahadashaLord;

    const categoryNames: Record<KPQuestionCategory, string> = {
      career_job: 'नौकरी व करियर में प्रगति',
      business: 'व्यवसाय व व्यापार विस्तार',
      marriage: 'विवाह व सम्बंधों की बात आगे बढ़ने',
      relationship: 'सम्बंधों में अनुकूलता',
      education_exam: 'शिक्षा व परीक्षा में सफलता',
      property: 'संपत्ति व भूमि संबंधी कार्य',
      vehicle: 'वाहन क्रय व यात्रा',
      finance_income: 'धन लाभ व आय वृद्धि',
      children: 'संतान संबंधी सुख व समाचार',
      travel: 'यात्रा व स्थान परिवर्तन',
      legal_matter: 'विवाद व क़ानूनी मामलों के समाधान',
      partnership: 'साझेदारी के अनुकूल योग',
      lost_item: 'वस्तु की पुनर्प्राप्ति',
      general_yes_no: 'कार्य सिद्धि',
      other: 'अभीष्ट कार्य की प्रगति'
    };

    const catNameHi = categoryNames[category] || 'कार्य सिद्धि';

    return {
      hi: `पारंपरिक KP कार्येशों और दशा-भुक्ति के विश्लेषण के अनुसार ${catNameHi} के लिए सबसे संरेखित समय-खिड़की ${bestWindow.formattedStart.hi} से ${bestWindow.formattedEnd.hi} के बीच (${bestMahaHi} की महादशा में ${bestAntarHi} की अंतर्दशा) बनती दिखाई दे रही है। यह अवधि प्रश्न से जुड़े मुख्य भावों [${targetHouses.join(', ')}] को सक्रिय करती है।`,
      en: `According to KP significator analysis and Dasha-Bhukti alignment, the most aligned time window for ${category} occurs between ${bestWindow.formattedStart.en} and ${bestWindow.formattedEnd.en} (${bestWindow.mahadashaLord}-${bestWindow.antardashaLord}). This period energizes target houses [${targetHouses.join(', ')}].`
    };
  }

  /**
   * Builds practical timing guidance tips.
   */
  private buildTimingGuidance(
    category: KPQuestionCategory,
    judgmentOutcome: string,
    currentPeriod: KPCurrentPeriodStatus,
    bestWindow: KPTimingWindow | null
  ): Array<{ hi: string; en: string }> {
    const tips: Array<{ hi: string; en: string }> = [];

    if (currentPeriod.isAntardashaSupportive) {
      tips.push({
        hi: 'वर्तमान अंतर्दशा अनुकूल भावों को सक्रिय कर रही है; अतः अपने स्तर पर आवश्यक बातचीत और आवेदन में देरी न करें।',
        en: 'The current Antardasha is actively energizing supportive houses; proceed with planned initiatives.'
      });
    } else {
      tips.push({
        hi: 'वर्तमान अंतर्दशा में कागज़ी तैयारी और आंतरिक सुधार को प्राथमिकता दें, क्योंकि जल्दबाज़ी में लिए गए निर्णय लाभ के बजाय विलंब करा सकते हैं।',
        en: 'Prioritize documentation and preparation during the current period to avoid unintended friction.'
      });
    }

    if (bestWindow) {
      tips.push({
        hi: `मुख्य निर्णय अथवा निर्णायक क़दम को ${bestWindow.formattedStart.hi} से ${bestWindow.formattedEnd.hi} की अवधि के साथ संरेखित करना पारंपरिक दृष्टि से अधिक फलदायी रह सकता है।`,
        en: `Aligning decisive actions with the window between ${bestWindow.formattedStart.en} and ${bestWindow.formattedEnd.en} provides better astrological resonance.`
      });
    }

    tips.push({
      hi: 'समय का संकेत मार्गदर्शक है; अपनी व्यावहारिक तैयारी, नेटवर्किंग और ज़मीनी तथ्यों पर पूरा भरोसा बनाए रखें।',
      en: 'Astrological timing is directional; maintain practical preparedness and grounded decision-making.'
    });

    return tips;
  }

  /**
   * Builds transit corroboration without faking ephemeris data.
   */
  private buildTransitCorroboration(
    masterData: MasterKundliData | null | undefined,
    kpResult: KPAnalysisResult,
    targetHouses: number[],
    adverseHouses: number[],
    keyPlanet: string,
    precalculatedTransit?: TransitAnalysisResult | null
  ): KPTransitCorroboration {
    let transitResult: TransitAnalysisResult | null = null;
    try {
      transitResult = this.transitEngine.evaluate(masterData as any, precalculatedTransit as any);
    } catch {
      transitResult = null;
    }

    if (transitResult && transitResult.status === 'AVAILABLE' && transitResult.transits && transitResult.transits.length > 0) {
      return this.transitEngine.corroborateTransitWithKP(
        transitResult,
        kpResult,
        targetHouses,
        adverseHouses,
        keyPlanet
      );
    }

    // Truthful unavailable reporting with explicit traditional rule note
    return {
      status: 'NOT_AVAILABLE',
      isCorroborated: false,
      description: {
        hi: 'वर्तमान गोचर डेटा उपलब्ध नहीं है, इसलिए वास्तविक गोचर समर्थन की पुष्टि नहीं की जा सकती।',
        en: 'Current transit data is not available, so real transit corroboration cannot be confirmed.'
      },
      transitSignificatorPlanets: [],
      keyTransitHouses: targetHouses,
      actualTransitPlanets: [],
      classicalRuleNote: {
        label: {
          hi: 'परंपरागत नियम-आधारित संकेत',
          en: 'Traditional Rule-Based Indicator'
        },
        description: {
          hi: 'केपी सिद्धांत के अनुसार जब दशा-नाथ अनुकूल भावों का कार्येश होता है, तब गोचर में सूर्य और गुरु का उसके नक्षत्र से गुजरना घटना को गति देता है। (ध्यान दें: यह वास्तविक गोचर समर्थन नहीं है, केवल शास्त्रीय नियम है)',
          en: 'According to KP tenets, when Dasha Lord signifies target houses, transit of Sun and Jupiter through its star provides event catalyst. (Note: This is a classical rule, not actual transit corroboration).'
        }
      }
    };
  }

  /**
   * Helper to fetch signified houses for a planet.
   */
  private getSignificatorHouses(kpResult: KPAnalysisResult, planet: string): number[] {
    const pSig: KPPlanetSignificator | undefined = kpResult.significators?.byPlanet[planet];
    if (!pSig) return [];
    return pSig.allSignifiedHouses || [];
  }

  /**
   * Helper to check if houses have positive overlap.
   */
  private checkSupportive(signified: number[], targetHouses: number[], adverseHouses: number[]): boolean {
    const hasTarget = signified.some(h => targetHouses.includes(h));
    const adverseCount = signified.filter(h => adverseHouses.includes(h)).length;
    return hasTarget && adverseCount <= 1;
  }

  /**
   * Calculate months between two ISO dates.
   */
  private calculateDurationMonths(startDate: string, endDate: string): number {
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
      return Math.max(1, months);
    } catch {
      return 1;
    }
  }

  /**
   * Format ISO date string into human localized date.
   */
  private formatDate(isoStr: string, lang: 'hi' | 'en'): string {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr.slice(0, 10);
      const day = d.getDate();
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      if (lang === 'hi') {
        return `${day} ${HINDI_MONTHS[monthIdx]} ${year}`;
      }
      return `${day} ${ENGLISH_MONTHS[monthIdx]} ${year}`;
    } catch {
      return isoStr.slice(0, 10);
    }
  }

  /**
   * Construct insufficient timing result without guessing.
   */
  private buildInsufficientTimingResult(
    question: string,
    category: KPQuestionCategory,
    categoryLabel: { hi: string; en: string },
    targetHouses: number[],
    adverseHouses: number[],
    primaryCusp: number,
    primaryCuspSubLord: string,
    outcome: string
  ): KPTimingAnalysis {
    return {
      question,
      category,
      categoryLabel,
      eventTargetHouses: targetHouses,
      eventAdverseHouses: adverseHouses,
      isEventPromised: outcome === 'FAVOURABLE',
      judgmentOutcome: outcome,
      primaryCusp,
      primaryCuspSubLord,
      currentPeriod: {
        mahadashaLord: 'Unknown',
        mahadashaStart: '',
        mahadashaEnd: '',
        mahadashaSignifiedHouses: [],
        isMahadashaSupportive: false,
        antardashaLord: 'Unknown',
        antardashaStart: '',
        antardashaEnd: '',
        antardashaSignifiedHouses: [],
        isAntardashaSupportive: false,
        formattedCurrentRange: { hi: 'डेटा अप्राप्य', en: 'Data Unavailable' },
        summary: {
          hi: 'दशा डेटा अप्राप्य होने के कारण वर्तमान अवधि निर्धारित नहीं की जा सकी।',
          en: 'Current period cannot be determined due to missing Dasha data.'
        }
      },
      evaluatedWindows: [],
      mostFavourableWindow: null,
      favourableWindows: [],
      transitCorroboration: {
        status: 'NOT_AVAILABLE',
        isCorroborated: false,
        description: {
          hi: 'वर्तमान गोचर डेटा उपलब्ध नहीं है, इसलिए वास्तविक गोचर समर्थन की पुष्टि नहीं की जा सकती।',
          en: 'Current transit data is not available, so real transit corroboration cannot be confirmed.'
        },
        transitSignificatorPlanets: [],
        keyTransitHouses: targetHouses,
        actualTransitPlanets: [],
        classicalRuleNote: {
          label: {
            hi: 'परंपरागत नियम-आधारित संकेत',
            en: 'Traditional Rule-Based Indicator'
          },
          description: {
            hi: 'केपी सिद्धांत के अनुसार जब दशा-नाथ अनुकूल भावों का कार्येश होता है, तब गोचर में सूर्य और गुरु का उसके नक्षत्र से गुजरना घटना को गति देता है। (ध्यान दें: यह वास्तविक गोचर समर्थन नहीं है, केवल शास्त्रीय नियम है)',
            en: 'According to KP tenets, when Dasha Lord signifies target houses, transit of Sun and Jupiter through its star provides event catalyst. (Note: This is a classical rule, not actual transit corroboration).'
          }
        }
      },
      humanTimingSummary: {
        hi: 'उपलब्ध दशा, गोचर और KP timing data से विश्वसनीय समय-खिड़की निर्धारित नहीं की जा सकती। कृपया जन्म समय व तिथि की पुष्टि करें।',
        en: 'Reliable timing window cannot be determined from available Dasha and timing data.'
      },
      timingGuidance: [
        {
          hi: 'सटीक समय निर्धारण के लिए जन्म कुंडली में चंद्रमा के नक्षत्र और दशा संतुलन की पुनः गणना करें।',
          en: 'Verify birth profile and Moon nakshatra parameters for accurate event timing.'
        }
      ],
      timingUncertaintyNote: {
        hi: 'अपर्याप्त डेटा की स्थिति में काल्पनिक समय-सारणी नहीं बनाई जा सकती।',
        en: 'Speculative timing cannot be generated when core data is incomplete.'
      },
      evidenceReference: {
        dashaSource: 'None (Data Insufficient)',
        primaryCuspSubLord,
        favourablePlanets: [],
        adversePlanets: [],
        rulingPlanets: []
      }
    };
  }
}
