/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — UNIFIED DOSH ORCHESTRATOR & NORMALIZER (एकीकृत दोष नियंत्रक एवं समन्वक)
 * PHASE 1.13E: DETERMINISTIC HEADLESS NORMALIZATION LAYER
 * 
 * Coordinates execution of seven deterministic Dosh engines in a fixed, immutable order
 * and wraps their outputs into a standardized UnifiedDoshResult envelope without
 * flattening or losing engine-specific data.
 * 
 * EXECUTION ORDER (STRICT & DETERMINISTIC):
 * 1. Mangal Dosha (भौम / मांगलिक विचार)
 * 2. Kala Sarpa Tradition (कालसर्प परंपरा)
 * 3. Pitrishapa / Pitru Analysis (पितृशाप एवं पितृ विचार)
 * 4. Guru Chandal Analysis (गुरु चाण्डाल विचार)
 * 5. Grahan Vichar (ग्रहण विचार)
 * 6. Kemadruma Yoga & Bhanga (केमद्रुम योग एवं भंग)
 * 7. Shani Sade Sati & Dhaiyya (शनि साढ़ेसाती एवं ढैया)
 * 
 * STRICT INVARIANTS:
 * - Pure calculation function; zero mutation of input MasterKundliData or transit options.
 * - Zero cross-engine rule mixing or synthetic severity scoring.
 * - Error isolation: a failure in one engine produces a structured result without crashing others.
 * - Preserves original engine results inside `engineSpecificDetails`.
 * - Zero UI, zero AI, zero network, zero external dependencies.
 */

import { MasterKundliData } from '../../types/kundli';
import {
  UnifiedDoshId,
  UnifiedDoshStatus,
  UnifiedDoshResult,
  UnifiedDoshAnalysisCollection,
  UnifiedEvidenceRecord
} from '../../types/dosh/unifiedDoshTypes';

import { MangalDoshaEngine } from './mangalDoshaEngine';
import { KalaSarpaTraditionEngine } from './kalaSarpaTraditionEngine';
import { PitrishapaEngine } from './pitrishapaEngine';
import { GuruChandalEngine } from './guruChandalEngine';
import { GrahanEngine } from './grahanEngine';
import { KemadrumaEngine } from './kemadrumaEngine';
import { ShaniSadeSatiEngine, ShaniTransitAnalysisOptions } from './shaniSadeSatiEngine';
export type { ShaniTransitAnalysisOptions };

import { MangalDoshaAnalysisResult } from '../../types/dosh/mangalTypes';
import { KalaSarpaAnalysisResult } from '../../types/dosh/kalaSarpaTypes';
import { PitrishapaAnalysisResult } from '../../types/dosh/pitrishapaTypes';
import { GuruChandalResult } from '../../types/dosh/guruChandalTypes';
import { GrahanResult } from '../../types/dosh/grahanTypes';
import { KemadrumaResult } from '../../types/dosh/kemadrumaTypes';
import { ShaniTransitAnalysisResult } from '../../types/dosh/shaniTransitTypes';

const EXECUTION_ORDER: UnifiedDoshId[] = [
  'MANGAL_DOSHA',
  'KALA_SARPA_TRADITION',
  'PITRISHAPA_ANALYSIS',
  'GURU_CHANDAL_ANALYSIS',
  'GRAHAN_VICHAR',
  'KEMADRUMA_ANALYSIS',
  'SHANI_SADE_SATI_DHAIYYA_ANALYSIS'
];

export class DoshOrchestrator {
  /**
   * Main headless entry point for evaluating all seven deterministic Dosh engines.
   * Pure, stateless, and idempotent function of passed arguments.
   */
  public static analyzeAllDoshas(
    data: MasterKundliData | null | undefined,
    shaniOptions?: ShaniTransitAnalysisOptions,
    profileId?: string
  ): UnifiedDoshAnalysisCollection {
    const calculatedAt = new Date().toISOString();
    const results: UnifiedDoshResult[] = [];

    // 1. Mangal Dosha
    try {
      const rawMangal = MangalDoshaEngine.analyze(data);
      results.push(this.normalizeMangal(rawMangal, calculatedAt));
    } catch (err: any) {
      results.push(this.buildErrorResult('MANGAL_DOSHA', 'Mangal Dosha', 'मांगलिक विचार', err, calculatedAt));
    }

    // 2. Kala Sarpa Tradition
    try {
      const rawKalaSarpa = KalaSarpaTraditionEngine.analyze(data);
      results.push(this.normalizeKalaSarpa(rawKalaSarpa, calculatedAt));
    } catch (err: any) {
      results.push(this.buildErrorResult('KALA_SARPA_TRADITION', 'Kala Sarpa Tradition', 'कालसर्प विचार', err, calculatedAt));
    }

    // 3. Pitrishapa / Pitru Analysis
    try {
      const rawPitrishapa = PitrishapaEngine.analyze(data);
      results.push(this.normalizePitrishapa(rawPitrishapa, calculatedAt));
    } catch (err: any) {
      results.push(this.buildErrorResult('PITRISHAPA_ANALYSIS', 'Pitrishapa / Ancestral Lineage Analysis', 'पितृशाप एवं पितृ विचार', err, calculatedAt));
    }

    // 4. Guru Chandal Analysis
    try {
      const rawGuruChandal = GuruChandalEngine.analyze(data);
      results.push(this.normalizeGuruChandal(rawGuruChandal, calculatedAt));
    } catch (err: any) {
      results.push(this.buildErrorResult('GURU_CHANDAL_ANALYSIS', 'Guru Chandal Analysis', 'गुरु चाण्डाल विचार', err, calculatedAt));
    }

    // 5. Grahan Vichar
    try {
      const rawGrahan = GrahanEngine.analyze(data);
      results.push(this.normalizeGrahan(rawGrahan, calculatedAt));
    } catch (err: any) {
      results.push(this.buildErrorResult('GRAHAN_VICHAR', 'Grahan Vichar', 'ग्रहण विचार', err, calculatedAt));
    }

    // 6. Kemadruma Yoga & Bhanga
    try {
      const rawKemadruma = KemadrumaEngine.analyze(data);
      results.push(this.normalizeKemadruma(rawKemadruma, calculatedAt));
    } catch (err: any) {
      results.push(this.buildErrorResult('KEMADRUMA_ANALYSIS', 'Kemadruma Yoga & Bhanga', 'केमद्रुम योग एवं भंग', err, calculatedAt));
    }

    // 7. Shani Sade Sati & Dhaiyya
    try {
      const rawShani = ShaniSadeSatiEngine.analyze(data, shaniOptions);
      results.push(this.normalizeShani(rawShani, calculatedAt));
    } catch (err: any) {
      results.push(this.buildErrorResult('SHANI_SADE_SATI_DHAIYYA_ANALYSIS', 'Shani Sade Sati & Dhaiyya', 'शनि साढ़ेसाती एवं ढैया', err, calculatedAt));
    }

    return {
      ...(profileId ? { profileId } : {}),
      calculatedAt,
      results,
      metadata: {
        totalEnginesEvaluated: results.length,
        executionOrder: [...EXECUTION_ORDER],
        isDeterministic: true
      }
    };
  }

  // ==========================================
  // NORMALIZATION HANDLERS (NON-DESTRUCTIVE)
  // ==========================================

  private static normalizeMangal(raw: MangalDoshaAnalysisResult, calculatedAt: string): UnifiedDoshResult<MangalDoshaAnalysisResult> {
    let unifiedStatus: UnifiedDoshStatus;
    if (raw.status === 'PRESENT') unifiedStatus = 'PRESENT';
    else if (raw.status === 'NOT_PRESENT') unifiedStatus = 'NOT_PRESENT';
    else unifiedStatus = 'INSUFFICIENT_DATA';

    const evidenceRecords: UnifiedEvidenceRecord[] = [];
    if (raw.cancellationChecks && Array.isArray(raw.cancellationChecks)) {
      for (const rule of raw.cancellationChecks) {
        if (rule.triggered) {
          evidenceRecords.push({
            ruleId: rule.ruleId,
            source: 'MangalDoshaEngine',
            provenance: rule.tradition,
            description: rule.explanation,
            descriptionHindi: rule.explanationHindi
          });
        }
      }
    }

    let enIndication: string;
    let hiIndication: string;
    if (raw.status === 'PRESENT') {
      if (raw.mitigated) {
        enIndication = 'Traditional Mangal indication detected with classical Bhanga (mitigation).';
        hiIndication = 'लग्न से मांगलिक योग उपस्थित है, किंतु शास्त्रीय भंग/शमन नियम भी सक्रिय हैं।';
      } else {
        enIndication = 'Traditional Mangal indication detected from Lagna.';
        hiIndication = 'लग्न से पारंपरिक मांगलिक योग उपस्थित है।';
      }
    } else if (raw.status === 'NOT_PRESENT') {
      enIndication = 'No primary Mangal indication detected from Lagna.';
      hiIndication = 'लग्न से कोई प्राथमिक मांगलिक योग उपस्थित नहीं है।';
    } else {
      enIndication = 'Insufficient data to evaluate Mangal indication.';
      hiIndication = 'मांगलिक विचार हेतु आवश्यक ग्रह स्थिति अनुपलब्ध है।';
    }

    return {
      doshId: 'MANGAL_DOSHA',
      title: 'Mangal Dosha',
      titleHindi: 'मांगलिक विचार',
      status: unifiedStatus,
      traditionalScope: 'traditional Jyotish marriage consideration',
      traditionLineage: 'Brihat Parashara Hora Shastra & Muhurat Chintamani',
      classicalStatus: 'ATTESTED_CLASSICAL_FRAMEWORK',
      primaryIndication: {
        en: enIndication,
        hi: hiIndication
      },
      summaryIndication: {
        en: `Primary house from Lagna: ${raw.primaryHouseFromLagna ?? 'N/A'}. Active cancellations: ${raw.activeCancellationsCount}.`,
        hi: `लग्न से मंगल भाव: ${raw.primaryHouseFromLagna ?? 'अनुपलब्ध'}। सक्रिय शमन नियम: ${raw.activeCancellationsCount}।`
      },
      evidenceRecords,
      disclaimer: raw.disclaimer,
      engineVersion: '1.0.0',
      calculatedAt,
      engineSpecificDetails: raw
    };
  }

  private static normalizeKalaSarpa(raw: KalaSarpaAnalysisResult, calculatedAt: string): UnifiedDoshResult<KalaSarpaAnalysisResult> {
    let unifiedStatus: UnifiedDoshStatus;
    if (raw.classification === 'PARTIAL_CONTAINMENT' || raw.classification === 'BOUNDARY_CASE') {
      unifiedStatus = 'SPECIAL_CASE';
    } else if (raw.status === 'PRESENT') {
      unifiedStatus = 'PRESENT';
    } else if (raw.status === 'NOT_PRESENT') {
      unifiedStatus = 'NOT_PRESENT';
    } else {
      unifiedStatus = 'INSUFFICIENT_DATA';
    }

    let enIndication: string;
    let hiIndication: string;
    if (raw.status === 'PRESENT') {
      enIndication = `Planetary containment observed between nodal axis (${raw.classification}).`;
      hiIndication = `राहु-केतु अक्ष के मध्य पूर्ण ग्रहीय संवृत स्थिति (${raw.classification})।`;
    } else if (raw.classification === 'PARTIAL_CONTAINMENT') {
      enIndication = 'Partial planetary containment observed (Special Case).';
      hiIndication = 'आंशिक ग्रहीय संवृत स्थिति (विशेष स्थिति)।';
    } else if (raw.classification === 'BOUNDARY_CASE') {
      enIndication = 'Planet on Rahu/Ketu boundary node (Special Case).';
      hiIndication = 'ग्रह राहु/केतु संधि बिंदु पर स्थित (विशेष स्थिति)।';
    } else if (raw.status === 'NOT_PRESENT') {
      enIndication = 'Planets distributed on both sides of nodal axis.';
      hiIndication = 'ग्रह राहु-केतु अक्ष के दोनों ओर प्रसारित हैं।';
    } else {
      enIndication = 'Insufficient data to evaluate containment.';
      hiIndication = 'कालसर्प स्थिति गणना हेतु आवश्यक ग्रह स्थिति अनुपलब्ध है।';
    }

    return {
      doshId: 'KALA_SARPA_TRADITION',
      title: 'Kala Sarpa Tradition',
      titleHindi: 'कालसर्प विचार',
      status: unifiedStatus,
      traditionalScope: 'LATER_TRADITION / PRACTITIONER_TRADITION',
      traditionLineage: 'Later practitioner tradition (उत्तर-मध्यकालीन ज्योतिर्परंपरा)',
      classicalStatus: 'TRADITIONAL_LATER_PRACTITIONER',
      primaryIndication: {
        en: enIndication,
        hi: hiIndication
      },
      summaryIndication: {
        en: `Classification: ${raw.classification}. Traditional form: ${raw.traditionalFormIfAvailable?.name ?? 'None'}.`,
        hi: `वर्गीकरण: ${raw.classification}। पारंपरिक स्वरूप: ${raw.traditionalFormIfAvailable?.nameHindi ?? 'कोई नहीं'}।`
      },
      evidenceRecords: [],
      disclaimer: raw.disclaimer,
      engineVersion: '1.0.0',
      calculatedAt,
      engineSpecificDetails: raw
    };
  }

  private static normalizePitrishapa(raw: PitrishapaAnalysisResult, calculatedAt: string): UnifiedDoshResult<PitrishapaAnalysisResult> {
    let unifiedStatus: UnifiedDoshStatus;
    if (raw.status === 'PRESENT') unifiedStatus = 'PRESENT';
    else if (raw.status === 'NOT_PRESENT') unifiedStatus = 'NOT_PRESENT';
    else unifiedStatus = 'INSUFFICIENT_DATA';

    const evidenceRecords: UnifiedEvidenceRecord[] = [];
    const allEvidence = [
      ...(raw.sunEvidence || []),
      ...(raw.ninthHouseEvidence || []),
      ...(raw.ninthLordEvidence || []),
      ...(raw.progenyRelatedEvidence || [])
    ];
    for (const ev of allEvidence) {
      if (ev.triggered) {
        evidenceRecords.push({
          ruleId: ev.ruleId,
          source: 'PitrishapaEngine',
          provenance: ev.tradition,
          channel: ev.channel,
          target: ev.primaryTarget,
          description: ev.traditionalInterpretation,
          descriptionHindi: ev.traditionalInterpretationHindi
        });
      }
    }

    let enIndication: string;
    let hiIndication: string;
    if (raw.status === 'PRESENT') {
      if (raw.mitigated) {
        enIndication = 'Classical Pitrishapa indication detected with Jupiter mitigation.';
        hiIndication = 'विशिष्ट शास्त्रीय पितृशाप संकेत उपस्थित है, गुरु दृष्टि द्वारा शमित।';
      } else {
        enIndication = 'Classical Pitrishapa indication detected in specific channel.';
        hiIndication = 'पारंपरिक पितृशाप संबंधित ग्रह स्थिति पहचानी गई।';
      }
    } else if (raw.status === 'NOT_PRESENT') {
      enIndication = 'No classical Pitrishapa indication detected across channels.';
      hiIndication = 'किसी भी चैनल में कोई शास्त्रीय पितृशाप संकेत नहीं पाया गया।';
    } else {
      enIndication = 'Insufficient data to evaluate ancestral lineage indications.';
      hiIndication = 'पितृ विचार हेतु आवश्यक ग्रह विवरण अनुपलब्ध है।';
    }

    return {
      doshId: 'PITRISHAPA_ANALYSIS',
      title: 'Pitrishapa / Ancestral Lineage Analysis',
      titleHindi: 'पितृशाप एवं पितृ विचार',
      status: unifiedStatus,
      traditionalScope: 'NARROW_PARASHARI_PURVA_JANMA_SHAPA_SCOPE',
      traditionLineage: 'Brihat Parashara Hora Shastra (Purva Janma Shapa, Ch. 84)',
      classicalStatus: 'NARROW_CLASSICAL_FRAMEWORK',
      primaryIndication: {
        en: enIndication,
        hi: hiIndication
      },
      summaryIndication: {
        en: `Channels evaluated: Sun, 9th House, 9th Lord, Progeny. Active mitigations: ${raw.activeMitigationsCount}.`,
        hi: `परीक्षित चैनल: सूर्य, नवम भाव, नवमेश, संतान संदर्भ। सक्रिय शमन: ${raw.activeMitigationsCount}।`
      },
      evidenceRecords,
      disclaimer: raw.disclaimer,
      engineVersion: '1.0.0',
      calculatedAt,
      engineSpecificDetails: raw
    };
  }

  private static normalizeGuruChandal(raw: GuruChandalResult, calculatedAt: string): UnifiedDoshResult<GuruChandalResult> {
    let unifiedStatus: UnifiedDoshStatus;
    if (raw.status === 'PRESENT') unifiedStatus = 'PRESENT';
    else if (raw.status === 'NOT_PRESENT') unifiedStatus = 'NOT_PRESENT';
    else if (raw.status === 'DATA_CONFLICT') unifiedStatus = 'DATA_CONFLICT';
    else unifiedStatus = 'INSUFFICIENT_DATA';

    return {
      doshId: 'GURU_CHANDAL_ANALYSIS',
      title: 'Guru Chandal Analysis',
      titleHindi: 'गुरु चाण्डाल विचार',
      status: unifiedStatus,
      traditionalScope: 'JUPITER_RAHU_TRADITIONAL_ASSOCIATION',
      traditionLineage: 'Traditional Jyotish Association (Guru-Rahu Conjunction)',
      classicalStatus: 'TRADITIONAL_INTERPRETATION',
      primaryIndication: {
        en: raw.indication?.en || 'Guru Chandal evaluation.',
        hi: raw.indication?.hi || 'गुरु चाण्डाल विश्लेषण।'
      },
      summaryIndication: {
        en: `Jupiter and Rahu same sign: ${raw.sameRashi}. Angular separation: ${raw.degreeSeparation !== null ? raw.degreeSeparation.toFixed(2) + '°' : 'N/A'}.`,
        hi: `गुरु एवं राहु एक राशि: ${raw.sameRashi ? 'हाँ' : 'नहीं'}। कोणीय अंतर: ${raw.degreeSeparation !== null ? raw.degreeSeparation.toFixed(2) + '°' : 'अनुपलब्ध'}।`
      },
      evidenceRecords: [],
      disclaimer: raw.disclaimer,
      engineVersion: '1.0.0',
      calculatedAt,
      engineSpecificDetails: raw
    };
  }

  private static normalizeGrahan(raw: GrahanResult, calculatedAt: string): UnifiedDoshResult<GrahanResult> {
    let unifiedStatus: UnifiedDoshStatus;
    if (raw.overallStatus === 'PRESENT') unifiedStatus = 'PRESENT';
    else if (raw.overallStatus === 'NOT_PRESENT') unifiedStatus = 'NOT_PRESENT';
    else if (raw.overallStatus === 'DATA_CONFLICT') unifiedStatus = 'DATA_CONFLICT';
    else unifiedStatus = 'INSUFFICIENT_DATA';

    const evidenceRecords: UnifiedEvidenceRecord[] = [];
    const combos = [raw.sunRahu, raw.sunKetu, raw.moonRahu, raw.moonKetu].filter(Boolean);
    for (const c of combos) {
      if (c.status === 'PRESENT') {
        evidenceRecords.push({
          ruleId: c.combinationId,
          source: 'GrahanEngine',
          provenance: 'Traditional Jyotish Association',
          channel: c.luminary,
          target: c.node,
          description: c.indication.en,
          descriptionHindi: c.indication.hi
        });
      }
    }

    let enIndication: string;
    let hiIndication: string;
    if (raw.overallStatus === 'PRESENT') {
      enIndication = `Luminary-node conjunction detected (${raw.activeCombinationsCount} active).`;
      hiIndication = `सूर्य/चंद्र एवं राहु/केतु युति उपस्थिति (${raw.activeCombinationsCount} सक्रिय)।`;
    } else if (raw.overallStatus === 'NOT_PRESENT') {
      enIndication = 'No luminary-node conjunction detected.';
      hiIndication = 'कोई ग्रहण संबंधी युति उपस्थित नहीं है।';
    } else if (raw.overallStatus === 'DATA_CONFLICT') {
      enIndication = 'Data conflict detected in luminary-node alignments.';
      hiIndication = 'ग्रह स्थिति संरेखण में विसंगति।';
    } else {
      enIndication = 'Insufficient data to evaluate Grahan combinations.';
      hiIndication = 'ग्रहण विचार हेतु आवश्यक ग्रह विवरण अनुपलब्ध है।';
    }

    return {
      doshId: 'GRAHAN_VICHAR',
      title: 'Grahan Vichar',
      titleHindi: 'ग्रहण विचार',
      status: unifiedStatus,
      traditionalScope: 'LUMINARY_NODE_TRADITIONAL_ASSOCIATION',
      traditionLineage: 'Traditional Jyotish Association (Sun/Moon + Rahu/Ketu Conjunction)',
      classicalStatus: 'TRADITIONAL_INTERPRETATION',
      primaryIndication: {
        en: enIndication,
        hi: hiIndication
      },
      summaryIndication: {
        en: `Active combinations: ${raw.activeCombinationsCount} / 4 evaluated.`,
        hi: `सक्रिय युतियाँ: ${raw.activeCombinationsCount} / 4 परीक्षित।`
      },
      evidenceRecords,
      disclaimer: raw.disclaimer,
      engineVersion: '1.0.0',
      calculatedAt,
      engineSpecificDetails: raw
    };
  }

  private static normalizeKemadruma(raw: KemadrumaResult, calculatedAt: string): UnifiedDoshResult<KemadrumaResult> {
    let unifiedStatus: UnifiedDoshStatus;
    if (raw.status === 'PRESENT') unifiedStatus = 'PRESENT';
    else if (raw.status === 'NOT_PRESENT') unifiedStatus = 'NOT_PRESENT';
    else unifiedStatus = 'INSUFFICIENT_DATA';

    const evidenceRecords: UnifiedEvidenceRecord[] = [];
    if (raw.bhangaRules && Array.isArray(raw.bhangaRules)) {
      for (const rule of raw.bhangaRules) {
        if (rule.triggered) {
          evidenceRecords.push({
            ruleId: rule.ruleId,
            source: 'KemadrumaEngine',
            provenance: rule.tradition,
            description: rule.explanation,
            descriptionHindi: rule.explanationHindi
          });
        }
      }
    }

    let enIndication: string;
    let hiIndication: string;
    if (raw.baseIndication === 'PRESENT') {
      if (raw.bhangaPresent) {
        enIndication = 'Base Kemadruma detected with classical Bhanga (cancellation) active.';
        hiIndication = 'मूल केमद्रुम योग उपस्थित है, किंतु शास्त्रीय भंग सक्रिय है।';
      } else {
        enIndication = 'Base Kemadruma detected (2nd and 12th from Moon unoccupied by qualifying classical planets).';
        hiIndication = 'मूल केमद्रुम योग उपस्थित है (चंद्र से द्वितीय व द्वादश भाव रिक्त)।';
      }
    } else if (raw.baseIndication === 'NOT_PRESENT') {
      enIndication = 'No base Kemadruma indication detected.';
      hiIndication = 'केमद्रुम योग का कोई प्राथमिक आधार नहीं है।';
    } else {
      enIndication = 'Insufficient data to evaluate Kemadruma Yoga.';
      hiIndication = 'केमद्रुम योग विचार हेतु आवश्यक चंद्र स्थिति अनुपलब्ध है।';
    }

    return {
      doshId: 'KEMADRUMA_ANALYSIS',
      title: 'Kemadruma Yoga & Bhanga',
      titleHindi: 'केमद्रुम योग एवं भंग',
      status: unifiedStatus,
      traditionalScope: 'MOON_CENTERED_TRADITIONAL_YOGA_ANALYSIS',
      traditionLineage: 'Brihat Jataka & Saravali (Moon devoid of planets in 2nd & 12th)',
      classicalStatus: 'ATTESTED_CLASSICAL_FRAMEWORK',
      primaryIndication: {
        en: enIndication,
        hi: hiIndication
      },
      summaryIndication: {
        en: `Base Indication: ${raw.baseIndication}. Bhanga Present: ${raw.bhangaPresent} (${raw.activeBhangasCount} active rules).`,
        hi: `मूल स्थिति: ${raw.baseIndication}। भंग उपस्थित: ${raw.bhangaPresent ? 'हाँ' : 'नहीं'} (${raw.activeBhangasCount} नियम सक्रिय)।`
      },
      evidenceRecords,
      disclaimer: raw.disclaimer,
      engineVersion: '1.0.0',
      calculatedAt,
      engineSpecificDetails: raw
    };
  }

  private static normalizeShani(raw: ShaniTransitAnalysisResult, calculatedAt: string): UnifiedDoshResult<ShaniTransitAnalysisResult> {
    let unifiedStatus: UnifiedDoshStatus;
    if (raw.status === 'PRESENT') unifiedStatus = 'PRESENT';
    else if (raw.status === 'NOT_PRESENT') unifiedStatus = 'NOT_PRESENT';
    else if (raw.status === 'DATA_CONFLICT') unifiedStatus = 'DATA_CONFLICT';
    else unifiedStatus = 'INSUFFICIENT_DATA';

    const evidenceRecords: UnifiedEvidenceRecord[] = [];
    if (raw.futureWindows && Array.isArray(raw.futureWindows)) {
      for (const fw of raw.futureWindows) {
        evidenceRecords.push({
          evidenceId: fw.evidenceId,
          source: fw.source || 'FutureTransitEngine',
          provenance: fw.provenance || 'SwissEphemeris_HighPrecision',
          fingerprint: fw.fingerprint,
          ruleId: fw.windowId,
          description: `Saturn transit in ${fw.saturnRashiName} (${fw.startDate} to ${fw.endDate})`
        });
      }
    }

    let enIndication: string;
    let hiIndication: string;
    if (raw.status === 'PRESENT') {
      if (raw.classification === 'SADE_SATI') {
        enIndication = `Active Saturn Sade Sati (${raw.phase ?? 'Unknown'} Phase).`;
        hiIndication = `सक्रिय शनि साढ़ेसाती (${raw.phaseHindi ?? 'सक्रिय चरण'})।`;
      } else {
        enIndication = `Active Saturn Dhaiyya (${raw.classification === 'DHAIYYA_4TH' ? '4th from Moon' : '8th from Moon'}).`;
        hiIndication = `सक्रिय शनि ढैया (${raw.classification === 'DHAIYYA_4TH' ? 'चंद्र से चतुर्थ' : 'चंद्र से अष्टम'})।`;
      }
    } else if (raw.status === 'NOT_PRESENT') {
      enIndication = 'Saturn is not currently transiting 12th, 1st, 2nd, 4th, or 8th from Moon.';
      hiIndication = 'शनि वर्तमान में चंद्र से 12, 1, 2, 4 या 8वें भाव में गोचर नहीं कर रहे हैं।';
    } else if (raw.status === 'DATA_CONFLICT') {
      enIndication = 'Data conflict in transit Saturn parameters.';
      hiIndication = 'शनि गोचर स्थिति में डेटा विसंगति।';
    } else {
      enIndication = 'Insufficient data to evaluate Saturn transit.';
      hiIndication = 'शनि गोचर विचार हेतु डेटा अपूर्ण है।';
    }

    return {
      doshId: 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS',
      title: 'Shani Sade Sati & Dhaiyya',
      titleHindi: 'शनि साढ़ेसाती एवं ढैया',
      status: unifiedStatus,
      traditionalScope: 'TRADITIONAL_SATURN_GOCARA_FROM_NATAL_MOON',
      traditionLineage: 'Phaladeepika & Brihat Samhita (Gochara from Janma Rashi)',
      classicalStatus: 'ATTESTED_CLASSICAL_FRAMEWORK',
      primaryIndication: {
        en: enIndication,
        hi: hiIndication
      },
      summaryIndication: {
        en: `Classification: ${raw.classification}. Saturn from Moon: ${raw.saturnFromMoonHouse ?? 'N/A'}th house.`,
        hi: `वर्गीकरण: ${raw.classification}। चंद्र से शनि: ${raw.saturnFromMoonHouse ?? 'अनुपलब्ध'} भाव।`
      },
      evidenceRecords,
      disclaimer: raw.disclaimer,
      engineVersion: '1.0.0',
      calculatedAt,
      engineSpecificDetails: raw
    };
  }

  private static buildErrorResult(
    doshId: UnifiedDoshId,
    title: string,
    titleHindi: string,
    error: any,
    calculatedAt: string
  ): UnifiedDoshResult<any> {
    return {
      doshId,
      title,
      titleHindi,
      status: 'DATA_CONFLICT',
      traditionalScope: 'ERROR_ISOLATION_FALLBACK',
      traditionLineage: 'Error isolation boundary',
      classicalStatus: 'UNKNOWN_OR_NOT_UNIVERSAL',
      primaryIndication: {
        en: `Calculation error isolated: ${error?.message || 'Unknown error'}`,
        hi: `गणना त्रुटि पृथक्कृत: ${error?.message || 'अज्ञात त्रुटि'}`
      },
      summaryIndication: {
        en: 'Engine execution halted safely without affecting remaining engines.',
        hi: 'इंजन निष्पादन सुरक्षित रूप से रोका गया।'
      },
      evidenceRecords: [],
      disclaimer: {
        en: 'This analysis encountered an unexpected processing condition and safely isolated it.',
        hi: 'इस विश्लेषण में अप्रत्याशित स्थिति का सामना हुआ और इसे सुरक्षित रूप से पृथक किया गया।'
      },
      engineVersion: '1.0.0',
      calculatedAt,
      engineSpecificDetails: {
        error: String(error?.message || error)
      }
    };
  }
}
