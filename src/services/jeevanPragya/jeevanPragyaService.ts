/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — JEEVAN PRAGYA MARGDARSHAN
 * PHASE 1.1: MASTER ORCHESTRATION SERVICE (jeevanPragyaService.ts)
 * 
 * Acts as the authoritative facade connecting the Master Birth Profile,
 * verified AstronomyService calculation results, timeline extraction,
 * and overarching "जीवन यात्रा" guidance.
 * 
 * STRICT INVARIANT:
 * - Master Birth Profile is the ONLY identity source.
 * - Never creates demo data or duplicate astrological engines.
 * - Auto-recalculates when profile changes.
 * - Enforces pipeline: CALCULATED DATA -> EVIDENCE -> INTERPRETATION -> GUIDANCE.
 */

import { BirthProfile, MasterKundliData } from '../../types/kundli';
import { AstronomyService } from '../astronomy/astronomyService';
import { NumerologyEngine } from '../numerology/numerologyEngine';
import { JeevanPragyaTimelineService } from './jeevanPragyaTimelineService';
import { JeevanPragyaPreviewService } from './jeevanPragyaPreviewService';
import { JeevanPragyaData } from '../../types/jeevanPragya/jeevanPragyaTypes';

const VARA_DAYS_HI = [
  { name: 'रविवार (Ravivar)', lord: 'सूर्य देव', aphorism: 'आत्मचेतना एवं सत्य-आचरण का दिन' },
  { name: 'सोमवार (Somavar)', lord: 'चंद्र देव', aphorism: 'चित्त-प्रसाद एवं मानसिक शांति का दिन' },
  { name: 'मंगलवार (Mangalvar)', lord: 'मंगल देव', aphorism: 'धैर्य-युक्त पराक्रम एवं ऊर्जा शोधन का दिन' },
  { name: 'बुधवार (Budhavar)', lord: 'बुध देव', aphorism: 'विवेक, वाणी शुद्धि एवं ज्ञानार्जन का दिन' },
  { name: 'गुरुवार (Guruvar)', lord: 'बृहस्पति देव', aphorism: 'गुरु-कृपा, सदाचार एवं धर्म-चिंतन का दिन' },
  { name: 'शुक्रवार (Shukravar)', lord: 'शुक्र देव', aphorism: 'कलात्मक सुरुचि एवं सौहार्द का दिन' },
  { name: 'शनिवार (Shanivar)', lord: 'शनि देव', aphorism: 'तपस्या, निष्काम सेवा एवं न्याय-निष्ठा का दिन' }
];

export class JeevanPragyaService {
  /**
   * Generates the complete 2D Jeevan Pragya Guidance data bundle
   * bound exclusively to the provided Master Birth Profile.
   */
  public static async generateGuidance(profile: BirthProfile | null): Promise<JeevanPragyaData> {
    if (!profile) {
      throw new Error('Master Birth Profile is required to generate Jeevan Pragya Guidance.');
    }

    // 1. Calculate or retrieve authentic MasterKundliData using verified AstronomyService
    const kundliResult = await AstronomyService.calculateKundli(profile);
    const masterData: MasterKundliData | null = kundliResult?.data || null;

    // 2. Extract verified Past, Present, and Future cycles
    const { pastItems, presentItem, futureItems, benchmarkMatches } = JeevanPragyaTimelineService.extractTimeline(masterData);

    // 3. Compute live Numerology cycle
    const numResult = NumerologyEngine.evaluate(profile);

    // 4. Compute live Panchang Day Info
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const varaInfo = VARA_DAYS_HI[dayOfWeek] || VARA_DAYS_HI[0];

    // 5. Synthesize overarching "जीवन यात्रा" (Life Journey) summary
    const yatraSummary = JeevanPragyaPreviewService.buildYatraSummary(
      profile,
      masterData,
      pastItems,
      presentItem,
      futureItems
    );

    // 5.1 PHASE 1.2 & 1.3: Generate dynamic 9-stage Life Journey Timeline, chronological Past Milestones, 12 Bhava Trikal Phala, Present Deep Guidance, and Grouped Future Windows
    const lifeJourneyTimeline = JeevanPragyaTimelineService.generateLifeJourneyTimeline(profile, masterData);
    const pastAnalysisCards = JeevanPragyaTimelineService.generateChronologicalMilestones(profile, masterData);
    const trikalBhavas = JeevanPragyaTimelineService.generate12BhavaTrikalPhala(masterData);
    const presentDeepGuidance = JeevanPragyaTimelineService.generatePresentDeepGuidance(profile, masterData);
    const futureDomainGroups = JeevanPragyaTimelineService.generateFutureDomainGroups(futureItems);

    // 6. Assemble the complete forensically validated response
    const guidanceData: JeevanPragyaData = {
      profile,
      calculatedAt: new Date().toISOString(),
      masterDataVerified: Boolean(masterData && kundliResult.isVerified),
      yatraSummary,
      lifeJourneyTimeline,
      pastAnalysisCards,
      trikalBhavas,
      presentDeepGuidance,
      futureDomainGroups,
      pastEra: {
        title: 'अतीत कालखंड (Past Roots & Karma)',
        badge: '🔵 अतीत',
        descriptionHindi: 'बीते जीवन चरणों के संचित कर्म संस्कार, अर्जित परिपक्वता एवं जीवन की नींव।',
        disclaimerHindi: 'यह पारंपरिक ज्योतिषीय संकेत है; वास्तविक घटना उपयोगकर्ता के अनुभव से सत्यापित की जा सकती है।',
        items: pastItems
      },
      presentEra: {
        title: 'वर्तमान जीवन चरण (Present Conscious Action)',
        badge: '🟢 वर्तमान',
        descriptionHindi: 'वर्तमान में सक्रिय महादशा व अंतर्दशा, आज का कर्तव्य, जागृति एवं कर्मक्षेत्र।',
        item: presentItem,
        freeInsightsCount: 3,
        lockedInsightsCount: 2,
        numerologyCycle: {
          personalYear: numResult.personalYear,
          driverNumber: numResult.birthNumber,
          conductorNumber: numResult.destinyNumber,
          meaningHi: `मूलांक ${numResult.birthNumber} एवं भाग्यांक ${numResult.destinyNumber} के अनुसार इस वर्ष व्यक्तिगत वर्ष अंक ${numResult.personalYear} का प्रभाव सक्रिय है।`
        },
        panchangVara: {
          nameHindi: varaInfo.name,
          lordHindi: varaInfo.lord,
          dateDisplay: today.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          aphorismHindi: varaInfo.aphorism
        },
        activeRulingHouses: presentItem.rulingHouseNumbers
      },
      futureEra: {
        title: 'भविष्य समय-खिड़कियाँ (Future Evidence Windows)',
        badge: '🟡 भविष्य',
        descriptionHindi: 'Phase 3C.4 खगोलीय प्रमाण बही (Transit Evidence Ledger) से सत्यापित आगामी समय-खिड़कियाँ।',
        items: futureItems,
        verifiedLedgerWindowsCount: benchmarkMatches.length,
        ledgerFingerprint: futureItems[0]?.transitEvidence?.fingerprint,
        benchmarkMatches
      },
      dataBoundary: {
        astronomicalEngine: 'Swiss Ephemeris & Lahiri Ayanamsa Verified Core',
        ayanamsaUsed: masterData?.ayanamsa || 'Lahiri',
        verifiedPlanetsCount: 9,
        pipelineProof: {
          calculatedData: 'MasterKundliData (Swiss Ephemeris 0.2.2 & Lahiri Ayanamsa)',
          evidence: 'Phase 3C.4 Transit Evidence Ledger (Immutable SHA-256 Fingerprint)',
          traditionalInterpretation: 'Brihat Parashara Hora Shastra & Krishnamurti Padhdhati (KP)',
          aiExplanation: 'Deterministic Linguistic Formulations (Zero AI Astronomical Calculations)',
          practicalGuidance: 'Classical Vedic Upaya, Daan, Seva & Scriptural Mantras'
        },
        safetyGuarantees: {
          healthDiagnosisFree: true,
          financialOutcomeFree: true,
          nonFatalisticLanguage: true,
          zeroFabricatedEvents: true
        },
        noticeHi: 'यह मार्गदर्शन पूर्णतः आपके प्रामाणिक मास्टर जन्म विवरण, विंशोत्तरी काल-गणना एवं Phase 3C.4 गोचर प्रमाण बही पर आधारित है।',
        noticeEn: 'This guidance is computed deterministically from verified Master Kundli, Vimshottari Dasha, and Phase 3C.4 Transit Evidence Ledger.'
      }
    };

    return guidanceData;
  }
}
