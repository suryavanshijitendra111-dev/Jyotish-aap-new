import { KPAnalysisResult, KPPlanetData, KPCuspData, KPPlanetSignificator, KPRulingPlanetItem } from './kpEngine';
import {
  KPQuestionCategory,
  KPQuestionInput,
  KPEventHouseMapping,
  KP_EVENT_HOUSE_MAPPINGS,
  KPPlanetSignificatorEvidence,
  KPRulingPlanetSupport,
  KPCuspSubLordEvidence,
  KPJudgmentOutput,
  KPJudgmentOutcome,
  KPYesNoOutcome
} from '../../types/jyotish/kpJudgment';

const HINDI_PLANET_NAMES: Record<string, string> = {
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

export class KpJudgmentEngine {
  /**
   * Evaluates a question or event deterministically using existing KP calculation data.
   * ABSOLUTELY NO recalculation of astronomical or ephemeris data.
   */
  public evaluateQuestion(
    kpResult: KPAnalysisResult,
    input: KPQuestionInput
  ): KPJudgmentOutput {
    const mapping = KP_EVENT_HOUSE_MAPPINGS[input.category] || KP_EVENT_HOUSE_MAPPINGS.career_job;
    const now = new Date().toISOString();

    // Check if KP calculation data is fully available
    if (
      !kpResult ||
      kpResult.availability === 'NOT_AVAILABLE' ||
      !kpResult.cuspData ||
      kpResult.cuspData.length < 12 ||
      !kpResult.significators
    ) {
      return this.buildInsufficientDataResult(input, mapping, now);
    }

    const { targetHouses, supportingHouses, adverseHouses, primaryCusp } = mapping;
    const { significators, rulingPlanets, cuspData, planetData } = kpResult;

    // 1. Primary Cusp Sub Lord Analysis
    const primaryCuspData = cuspData.find(c => c.house === primaryCusp);
    const subLordEvidence = this.evaluatePrimaryCuspSubLord(
      primaryCusp,
      primaryCuspData,
      significators.byPlanet,
      planetData,
      targetHouses,
      adverseHouses
    );

    // 2. 4-Fold Significators Evidence for all 9 Navagrahas
    const planetEvidenceList: KPPlanetSignificatorEvidence[] = [];
    const positivePlanets: string[] = [];
    const challengingPlanets: string[] = [];

    const primaryRPSet = new Set(rulingPlanets?.primaryList || []);
    const allRPSet = new Set(rulingPlanets?.allRulingPlanets || []);

    for (const pd of planetData) {
      const sig = significators.byPlanet[pd.planet];
      if (!sig) continue;

      const evidence = this.evaluatePlanetEvidence(
        pd,
        sig,
        targetHouses,
        supportingHouses,
        adverseHouses,
        primaryRPSet,
        allRPSet,
        rulingPlanets?.details || []
      );

      planetEvidenceList.push(evidence);

      if (evidence.supportLevel === 'STRONG_POSITIVE' || evidence.supportLevel === 'POSITIVE') {
        positivePlanets.push(pd.planet);
      } else if (evidence.supportLevel === 'CHALLENGING') {
        challengingPlanets.push(pd.planet);
      }
    }

    // 3. Ruling Planets Support Evaluation
    const rpSupport = this.evaluateRulingPlanetSupport(
      rulingPlanets,
      positivePlanets,
      targetHouses,
      significators.byPlanet
    );

    // 4. Deterministic Outcome & Confidence Scoring
    const { outcome, yesNoOutcome, confidenceScore, reasonsEn, reasonsHi } = this.synthesizeJudgment(
      subLordEvidence,
      planetEvidenceList,
      positivePlanets,
      challengingPlanets,
      rpSupport,
      mapping
    );

    return {
      id: `kp-judgment-${Date.now()}`,
      timestamp: now,
      question: input.question.trim(),
      category: input.category,
      categoryLabel: {
        en: mapping.labelEn,
        hi: mapping.labelHi
      },
      targetHouses,
      supportingHouses,
      adverseHouses,
      primaryCusp,
      primaryCuspSubLord: subLordEvidence,
      outcome,
      yesNoOutcome,
      confidenceScore,
      relevantPlanets: [...new Set([...positivePlanets, ...challengingPlanets])],
      positivePlanets,
      challengingPlanets,
      significatorEvidence: planetEvidenceList,
      rulingPlanetSupport: rpSupport,
      reasons: {
        en: reasonsEn,
        hi: reasonsHi
      },
      traditionalNote: {
        en: 'According to Krishnamurti Paddhati (KP) tenets, an event is promised if the sub-lord of the primary cusp signifies the relevant houses and receives supportive agreement from the Ruling Planets.',
        hi: 'कृष्णमूर्ति पद्धति (KP) के पारंपरिक सिद्धांत अनुसार, किसी घटना की सिद्धि तब मानी जाती है जब मुख्य भाव का उप-स्वामी संबंधित कार्येश भावों को सूचित करता हो तथा रूलिंग ग्रहों का अनुकूल समर्थन प्राप्त हो।'
      },
      disclaimer: {
        en: 'Traditional KP horary indicators reflect cosmic tendencies and deterministic symbolic evidence, not absolute or fatalistic guarantee. Human conscious effort (Purushartha) and practical actions govern real-world results.',
        hi: 'यह आंतरिक पारंपरिक संकेत-सामंजस्य स्कोर है। इसे वास्तविक probability या निश्चित भविष्यवाणी न समझें। यह विश्लेषण केवल परंपरागत KP सूत्रों व कार्येश प्रतीकों पर आधारित है, यह कोई निश्चित भविष्यवाणी नहीं है। अंतिम परिणाम मानवीय पुरुषार्थ, कर्म एवं व्यावहारिक निर्णय पर निर्भर करते हैं।'
      },
      timingPlaceholder: {
        en: 'Timing analysis — Phase 3C (Coming Later)',
        hi: 'दशा व गोचर काल निर्धारण (Timing Analysis) — आगामी चरण 3C में सक्रिय होगा।'
      }
    };
  }

  /**
   * Evaluates the Sub Lord of the primary house cusp.
   */
  private evaluatePrimaryCuspSubLord(
    houseNum: number,
    cusp: KPCuspData | undefined,
    byPlanet: Record<string, KPPlanetSignificator>,
    planetData: KPPlanetData[],
    targetHouses: number[],
    adverseHouses: number[]
  ): KPCuspSubLordEvidence | undefined {
    if (!cusp) return undefined;

    const subLordName = cusp.subLord;
    const pd = planetData.find(p => p.planet === subLordName);
    const starLordName = pd?.nakshatraLord || '';
    const sig = byPlanet[subLordName];

    const signifiedHouses = sig ? sig.allSignifiedHouses : [];
    const targetMatches = signifiedHouses.filter(h => targetHouses.includes(h));
    const adverseMatches = signifiedHouses.filter(h => adverseHouses.includes(h));

    const signifiesTarget = targetMatches.length > 0;
    const signifiesAdverse = adverseMatches.length > 0;

    let isFavourable = false;
    let isNeutral = true;

    if (signifiesTarget && (!signifiesAdverse || targetMatches.length >= adverseMatches.length)) {
      isFavourable = true;
      isNeutral = false;
    } else if (signifiesAdverse && !signifiesTarget) {
      isFavourable = false;
      isNeutral = false;
    }

    return {
      house: houseNum,
      subLord: subLordName,
      subLordStarLord: starLordName,
      subLordSignifies: signifiedHouses,
      isFavourable,
      isNeutral,
      signifiesTarget,
      signifiesAdverse,
      summary: {
        en: `Cusp ${houseNum} Sub Lord is ${subLordName} (in Star of ${starLordName || '—'}), signifying houses [${signifiedHouses.join(', ')}]. ${
          isFavourable
            ? `Signifies key target house(s) [${targetMatches.join(', ')}].`
            : signifiesAdverse
            ? `Signifies obstruction house(s) [${adverseMatches.join(', ')}].`
            : `Neutral connection to target houses.`
        }`,
        hi: `भाव ${houseNum} का उप-स्वामी ${HINDI_PLANET_NAMES[subLordName] || subLordName} है (${starLordName ? (HINDI_PLANET_NAMES[starLordName] || starLordName) + ' के नक्षत्र में' : ''}), जो भाव [${signifiedHouses.join(', ')}] को सूचित करता है। ${
          isFavourable
            ? `यह अभीष्ट भाव [${targetMatches.join(', ')}] से सकारात्मक जुड़ाव रखता है।`
            : signifiesAdverse
            ? `यह अवरोधक भाव [${adverseMatches.join(', ')}] को सूचित करता है।`
            : `यह तटस्थ स्थिति दर्शाता है।`
        }`
      }
    };
  }

  /**
   * Evaluates a single planet's 4-fold significators against the event houses.
   */
  private evaluatePlanetEvidence(
    pd: KPPlanetData,
    sig: KPPlanetSignificator,
    targetHouses: number[],
    supportingHouses: number[],
    adverseHouses: number[],
    primaryRPSet: Set<string>,
    allRPSet: Set<string>,
    rpDetails: KPRulingPlanetItem[]
  ): KPPlanetSignificatorEvidence {
    const signifiedTarget = sig.allSignifiedHouses.filter(h => targetHouses.includes(h));
    const signifiedSupporting = sig.allSignifiedHouses.filter(h => supportingHouses.includes(h));
    const signifiedAdverse = sig.allSignifiedHouses.filter(h => adverseHouses.includes(h));

    const isPrimaryRP = primaryRPSet.has(pd.planet);
    const isAllRP = allRPSet.has(pd.planet);
    const rpDetailItem = rpDetails.find(r => r.planet === pd.planet);

    // KP 4-Fold Weighted Scoring
    // Level A (Star Lord's house) is strongest in KP (weight 4)
    // Level B (Planet's house) weight 3
    // Level C (Star Lord owned) weight 2
    // Level D (Planet owned) weight 1
    let score = 0;

    const countMatches = (houses: number[], targetList: number[]) =>
      houses.filter(h => targetList.includes(h)).length;

    score += countMatches(sig.levelA, targetHouses) * 4;
    score += countMatches(sig.levelB, targetHouses) * 3;
    score += countMatches(sig.levelC, targetHouses) * 2;
    score += countMatches(sig.levelD, targetHouses) * 1;

    score += countMatches(sig.levelA, supportingHouses) * 1.5;
    score += countMatches(sig.levelB, supportingHouses) * 1;

    // Adverse house penalization
    score -= countMatches(sig.levelA, adverseHouses) * 3;
    score -= countMatches(sig.levelB, adverseHouses) * 2.5;
    score -= countMatches(sig.levelC, adverseHouses) * 1;

    // RP boost
    if (isPrimaryRP) score += 2;
    else if (isAllRP) score += 1;

    // Retrograde dampening
    if (pd.retrograde) score *= 0.7;

    let supportLevel: 'STRONG_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'CHALLENGING';
    if (score >= 4 && signifiedTarget.length >= 1) {
      supportLevel = 'STRONG_POSITIVE';
    } else if (score >= 1.5 && signifiedTarget.length >= 1) {
      supportLevel = 'POSITIVE';
    } else if (score < 0 || (signifiedAdverse.length > signifiedTarget.length && signifiedAdverse.length > 0)) {
      supportLevel = 'CHALLENGING';
    } else {
      supportLevel = 'NEUTRAL';
    }

    return {
      planet: pd.planet,
      levelA: sig.levelA,
      levelB: sig.levelB,
      levelC: sig.levelC,
      levelD: sig.levelD,
      allSignifiedHouses: sig.allSignifiedHouses,
      signifiedTargetHouses: signifiedTarget,
      signifiedSupportingHouses: signifiedSupporting,
      signifiedAdverseHouses: signifiedAdverse,
      isRulingPlanet: isPrimaryRP || isAllRP,
      rulingPlanetRole: rpDetailItem?.label,
      isRetrograde: pd.retrograde,
      isStarLordRetrograde: rpDetailItem?.isStarLordRetrograde || false,
      starLord: pd.nakshatraLord,
      supportLevel,
      score: Math.round(score * 10) / 10
    };
  }

  /**
   * Compares the event's significators against Phase 3A Ruling Planets.
   */
  private evaluateRulingPlanetSupport(
    rulingPlanets: any,
    positivePlanets: string[],
    targetHouses: number[],
    byPlanet: Record<string, KPPlanetSignificator>
  ): KPRulingPlanetSupport {
    if (!rulingPlanets) {
      return {
        primaryRPList: [],
        allRPList: [],
        matchingPlanets: [],
        overlapHouses: [],
        supportDegree: 'NONE',
        retrogradeWarnings: [],
        explanation: {
          en: 'Ruling Planets data is not populated.',
          hi: 'रूलिंग प्लैनेट्स डेटा उपलब्ध नहीं है।'
        }
      };
    }

    const primaryRPList: string[] = rulingPlanets.primaryList || [];
    const allRPList: string[] = rulingPlanets.allRulingPlanets || [];
    const details: KPRulingPlanetItem[] = rulingPlanets.details || [];

    // Check which positive event planets are in the Ruling Planets list
    const matchingPlanets = positivePlanets.filter(p => allRPList.includes(p));
    const matchingPrimary = positivePlanets.filter(p => primaryRPList.includes(p));

    // Check target houses touched by ruling planets
    const overlapHousesSet = new Set<number>();
    for (const rpName of allRPList) {
      const sig = byPlanet[rpName];
      if (sig) {
        for (const h of sig.allSignifiedHouses) {
          if (targetHouses.includes(h)) overlapHousesSet.add(h);
        }
      }
    }
    const overlapHouses = Array.from(overlapHousesSet).sort((a, b) => a - b);

    // Retrograde warnings among RPs
    const retrogradeWarnings: string[] = [];
    for (const d of details) {
      if (d.isRetrograde && matchingPlanets.includes(d.planet)) {
        retrogradeWarnings.push(`${d.planet} (${d.label}) is Retrograde`);
      }
    }

    let supportDegree: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
    if (matchingPrimary.length >= 2 || (matchingPrimary.length >= 1 && overlapHouses.length >= 3)) {
      supportDegree = 'STRONG';
    } else if (matchingPlanets.length >= 2 || overlapHouses.length >= 2) {
      supportDegree = 'MODERATE';
    } else if (matchingPlanets.length === 1 || overlapHouses.length >= 1) {
      supportDegree = 'WEAK';
    } else {
      supportDegree = 'NONE';
    }

    const enText = `Ruling Planets show ${supportDegree.toLowerCase()} correlation. ` +
      `${matchingPlanets.length} key significator(s) [${matchingPlanets.join(', ') || 'none'}] overlap with Ruling Planets, ` +
      `touching target houses [${overlapHouses.join(', ') || 'none'}].` +
      (retrogradeWarnings.length > 0 ? ` Note: ${retrogradeWarnings.join(', ')} indicating delays.` : '');

    const matchingPlanetsHi = matchingPlanets.map(p => HINDI_PLANET_NAMES[p] || p);
    const hiText = `रूलिंग ग्रहों से ${
      supportDegree === 'STRONG' ? 'प्रबल' : supportDegree === 'MODERATE' ? 'मध्यम' : supportDegree === 'WEAK' ? 'अल्प' : 'न्यून'
    } समर्थन मिल रहा है। ${matchingPlanets.length} प्रमुख कारक ग्रह [${matchingPlanetsHi.join(', ') || 'कोई नहीं'}] रूलिंग ग्रहों में उपस्थित हैं, ` +
      `जो अभीष्ट भाव [${overlapHouses.join(', ') || 'कोई नहीं'}] को सक्रिय करते हैं।` +
      (retrogradeWarnings.length > 0 ? ` (सावधानी: वक्री कार्येश विलंब का संकेत देते हैं)।` : '');

    return {
      primaryRPList,
      allRPList,
      matchingPlanets,
      overlapHouses,
      supportDegree,
      retrogradeWarnings,
      explanation: {
        en: enText,
        hi: hiText
      }
    };
  }

  /**
   * Deterministically synthesizes the sub lord, 4-fold significators, and RP evidence.
   */
  private synthesizeJudgment(
    subLordEvidence: KPCuspSubLordEvidence | undefined,
    planetEvidenceList: KPPlanetSignificatorEvidence[],
    positivePlanets: string[],
    challengingPlanets: string[],
    rpSupport: KPRulingPlanetSupport,
    mapping: KPEventHouseMapping
  ): {
    outcome: KPJudgmentOutcome;
    yesNoOutcome: KPYesNoOutcome;
    confidenceScore: number;
    reasonsEn: string[];
    reasonsHi: string[];
  } {
    const reasonsEn: string[] = [];
    const reasonsHi: string[] = [];

    let score = 50; // Neutral baseline

    // 1. Primary Cusp Sub Lord factor (KP Core Rule: Sub Lord determines event promise)
    if (subLordEvidence) {
      const subLordHi = HINDI_PLANET_NAMES[subLordEvidence.subLord] || subLordEvidence.subLord;
      if (subLordEvidence.isFavourable) {
        score += 25;
        reasonsEn.push(`Primary Cusp ${subLordEvidence.house} Sub Lord (${subLordEvidence.subLord}) positively connects to event target houses.`);
        reasonsHi.push(`मुख्य भाव ${subLordEvidence.house} का उप-स्वामी (${subLordHi}) अभीष्ट कार्येश भावों से सकारात्मक रूप से जुड़ा है।`);
      } else if (subLordEvidence.signifiesAdverse && !subLordEvidence.signifiesTarget) {
        score -= 25;
        reasonsEn.push(`Primary Cusp ${subLordEvidence.house} Sub Lord (${subLordEvidence.subLord}) connects to negation/obstruction houses.`);
        reasonsHi.push(`मुख्य भाव ${subLordEvidence.house} का उप-स्वामी (${subLordHi}) अवरोधक/हानि भावों को सूचित करता है।`);
      } else {
        reasonsEn.push(`Primary Cusp ${subLordEvidence.house} Sub Lord (${subLordEvidence.subLord}) shows neutral/mixed significations.`);
        reasonsHi.push(`मुख्य भाव ${subLordEvidence.house} का उप-स्वामी (${subLordHi}) मिश्रित प्रभाव दर्शा रहा है।`);
      }
    }

    // 2. Positive vs Challenging significators count
    const strongPositives = planetEvidenceList.filter(p => p.supportLevel === 'STRONG_POSITIVE');
    if (strongPositives.length >= 2) {
      score += 15;
      reasonsEn.push(`Multiple strong significator planets (${strongPositives.map(p => p.planet).join(', ')}) heavily activate target houses [${mapping.targetHouses.join(', ')}].`);
      reasonsHi.push(`एकाधिक प्रबल कारक ग्रह (${strongPositives.map(p => HINDI_PLANET_NAMES[p.planet] || p.planet).join(', ')}) अभीष्ट भावों [${mapping.targetHouses.join(', ')}] को सक्रिय कर रहे हैं।`);
    } else if (positivePlanets.length > challengingPlanets.length) {
      score += 8;
      reasonsEn.push(`Favourable significator planets (${positivePlanets.join(', ')}) outnumber challenging planetary indicators.`);
      reasonsHi.push(`सकारात्मक कारक ग्रहों (${positivePlanets.map(p => HINDI_PLANET_NAMES[p] || p).join(', ')}) की संख्या प्रतिकूल कारकों से अधिक है।`);
    } else if (challengingPlanets.length > positivePlanets.length) {
      score -= 15;
      reasonsEn.push(`Challenging significators (${challengingPlanets.join(', ')}) indicate noticeable obstacles or resistance.`);
      reasonsHi.push(`प्रतिकूल कारक ग्रह (${challengingPlanets.map(p => HINDI_PLANET_NAMES[p] || p).join(', ')}) कार्य में रुकावट या संघर्ष का संकेत दे रहे हैं।`);
    }

    // 3. Ruling Planets agreement
    const matchingRPHi = rpSupport.matchingPlanets.map(p => HINDI_PLANET_NAMES[p] || p);
    if (rpSupport.supportDegree === 'STRONG') {
      score += 15;
      reasonsEn.push(`Ruling Planets provide strong affirmative corroboration (${rpSupport.matchingPlanets.join(', ')}).`);
      reasonsHi.push(`रूलिंग ग्रहों से प्रबल पुष्टि प्राप्त हो रही है (${matchingRPHi.join(', ')})।`);
    } else if (rpSupport.supportDegree === 'MODERATE') {
      score += 8;
      reasonsEn.push(`Ruling Planets moderately support the query with overlap on target houses.`);
      reasonsHi.push(`रूलिंग ग्रहों से मध्यम समर्थन मिल रहा है।`);
    } else if (rpSupport.supportDegree === 'NONE') {
      score -= 5;
      reasonsEn.push(`Ruling Planets lack strong direct overlap with the query significators.`);
      reasonsHi.push(`रूलिंग ग्रहों में प्रश्न कारकों का सीधा मेल कम है।`);
    }

    // 4. Retrograde penalties
    if (rpSupport.retrogradeWarnings.length > 0) {
      score -= 5;
      reasonsEn.push(`Retrograde motion in Ruling Planets indicates delays or need for repeated attempts.`);
      reasonsHi.push(`रूलिंग ग्रहों में वक्री गति परिणाम में विलंब या पुनरावृत्ति का संकेत देती है।`);
    }

    // Clamp score
    const confidenceScore = Math.max(15, Math.min(95, Math.round(score)));

    let outcome: KPJudgmentOutcome;
    let yesNoOutcome: KPYesNoOutcome;

    if (confidenceScore >= 65) {
      outcome = 'FAVOURABLE';
      yesNoOutcome = 'YES';
    } else if (confidenceScore >= 45) {
      outcome = 'MODERATE_MIXED';
      yesNoOutcome = 'MIXED_CONDITIONAL';
    } else {
      outcome = 'CHALLENGING';
      yesNoOutcome = 'NO';
    }

    return {
      outcome,
      yesNoOutcome,
      confidenceScore,
      reasonsEn,
      reasonsHi
    };
  }

  /**
   * Safe fallback if calculation data is incomplete.
   */
  private buildInsufficientDataResult(
    input: KPQuestionInput,
    mapping: KPEventHouseMapping,
    now: string
  ): KPJudgmentOutput {
    return {
      id: `kp-judgment-${Date.now()}`,
      timestamp: now,
      question: input.question.trim(),
      category: input.category,
      categoryLabel: {
        en: mapping.labelEn,
        hi: mapping.labelHi
      },
      targetHouses: mapping.targetHouses,
      supportingHouses: mapping.supportingHouses,
      adverseHouses: mapping.adverseHouses,
      primaryCusp: mapping.primaryCusp,
      outcome: 'INSUFFICIENT_DATA',
      yesNoOutcome: 'INSUFFICIENT_DATA',
      confidenceScore: 0,
      relevantPlanets: [],
      positivePlanets: [],
      challengingPlanets: [],
      significatorEvidence: [],
      rulingPlanetSupport: {
        primaryRPList: [],
        allRPList: [],
        matchingPlanets: [],
        overlapHouses: [],
        supportDegree: 'NONE',
        retrogradeWarnings: [],
        explanation: {
          en: 'KP calculation data is unavailable.',
          hi: 'KP गणना उपलब्ध नहीं है।'
        }
      },
      reasons: {
        en: ['KP calculation data is unavailable. Please verify MasterKundliData computation.'],
        hi: ['KP गणना उपलब्ध नहीं है। कृपया कुंडली डेटा की जांच करें।']
      },
      traditionalNote: {
        en: 'Calculation unavailable.',
        hi: 'गणना उपलब्ध नहीं है।'
      },
      disclaimer: {
        en: 'Calculation unavailable.',
        hi: 'गणना उपलब्ध नहीं है।'
      },
      timingPlaceholder: {
        en: 'Timing analysis — Phase 3C (Coming Later)',
        hi: 'दशा व गोचर काल निर्धारण — आगामी चरण 3C में सक्रिय होगा।'
      }
    };
  }
}
