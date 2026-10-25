/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — JEEVAN PRAGYA MARGDARSHAN
 * PHASE 1.1: RUNTIME DATA-BINDING & FORENSIC VERIFICATION TYPES
 * 
 * Defines strict data contracts for:
 * 🔵 अतीत (Past) — historical disclaimer, past-life label, calculated periods
 * 🟢 वर्तमान (Present) — live dasha, active bhavas, numerology cycle, panchang, free preview limits
 * 🟡 भविष्य (Future) — strictly bound to Phase 3C.4 Transit Evidence Ledger, immutable evidenceId, benchmark validation
 * "जीवन यात्रा" (Life Journey) — overarching soul path
 * 
 * STRICT INVARIANT:
 * - MasterKundliData is the single source of truth.
 * - Zero AI-generated astronomical values.
 * - Evidence Ledger is required for every future event.
 */

import { BirthProfile } from '../kundli';

export type PragyaEra = 'past' | 'present' | 'future';
export type PragyaViewMode = 'past' | 'present' | 'future' | 'yatra';

export interface PragyaBhavaActivation {
  bhavaNumber: number;
  bhavaNameHindi: string;
  bhavaNameEnglish: string;
  signNameHindi: string;
  signLordHindi: string;
  karmicRole: string;
  importanceScore: number;
}

export interface PragyaRemedyItem {
  category: 'daan' | 'seva' | 'niyam' | 'mantra';
  titleHindi: string;
  instructionHindi: string;
  recommendedDayHindi: string;
  targetPlanetHindi: string;
}

export interface PragyaActionItem {
  titleHindi: string;
  descriptionHindi: string;
  priority: 'high' | 'medium' | 'general';
  sadhanaMantra?: string;
}

export interface TransitEvidenceBinding {
  evidenceId: string;
  source: string;
  window: string;
  planet: string;
  transit: string;
  dashaRelation: string;
  kpRelation?: string;
  status: 'VERIFIED' | 'QUALIFIED' | 'REJECTED';
  fingerprint?: string;
  ruleLineageSummary?: string;
  targetHouses?: number[];
  adverseHouses?: number[];
  swissResolution?: string;
  sign?: string;
  nakshatraName?: string;
}

export interface PragyaTimelineItem {
  id: string;
  era: PragyaEra;
  eraBadge: string; // '🔵 अतीत' | '🟢 वर्तमान' | '🟡 भविष्य'
  eraColorHex: string;
  periodTitle: string;
  planet: string;
  planetHindi: string;
  planetColor: string;
  dashaType: 'MAHADASHA' | 'ANTARDASHA' | 'PRATYANTAR';
  startDate: string;
  endDate: string;
  durationYears: number;
  progressPercent?: number; // active for present
  isCurrentlyActive: boolean;

  // Evidence Ledger Binding (Mandatory for Future)
  evidenceId?: string;
  evidenceSource?: string;
  verificationStatus?: string;
  transitEvidence?: TransitEvidenceBinding;

  // Free Preview vs Locked Indicator (Phase 1.1)
  isLocked?: boolean;
  lockReasonHindi?: string;

  // Astrological Core Foundations
  rulingHouseNumbers: number[];
  adverseHouseNumbers?: number[];
  domainCategory?: string;
  activatedBhavas: PragyaBhavaActivation[];
  transitInfluences: string[];

  // Soul Wisdom & Karmic Interpretation Layer
  karmicTheme: string;
  karmicThemeHindi: string;
  coreWisdom: string;
  coreWisdomHindi: string;
  lifeChallengeHindi: string;
  growthOpportunityHindi: string;

  // Forensic Disclaimers & Safety Phrasing
  historicalDisclaimerHi?: string;
  pastLifeDisclaimerHi?: string;
  safetyNoticeHi?: string;

  // Prescribed Actions & Remedies
  remedies: PragyaRemedyItem[];
  actions: PragyaActionItem[];
  sacredMantra: string;
  sanskritAphorism?: string;
  aphorismTranslationHindi?: string;
}

export interface JeevanYatraSummary {
  profileName: string;
  lagnaSignHindi: string;
  moonSignHindi: string;
  birthNakshatraHindi: string;
  overallMottoHindi: string;
  soulPurposeHindi: string;
  currentAgeYears: number;
  activeDashaSummary: string;
  totalCompletedErasCount: number;
  upcomingMilestonesCount: number;
  nextMajorTransitionDate: string;
  nextMajorTransitionPlanetHindi: string;
  journeyPhases: {
    pastLabel: string;
    pastDominantPlanet: string;
    presentLabel: string;
    presentDominantPlanet: string;
    futureLabel: string;
    futureDominantPlanet: string;
  };
}

export type LifeJourneyStage = 
  | 'birth'
  | 'early_life'
  | 'education'
  | 'career'
  | 'family'
  | 'finance'
  | 'dasha_shift'
  | 'present'
  | 'future_windows';

export interface CrossCorroborationItem {
  system: 'PARASHARI' | 'KP' | 'NUMEROLOGY' | 'LOSHU' | 'JAIMINI' | 'VARGA';
  systemHindi: string;
  detailHindi: string;
}

export interface LifeJourneyPhase {
  id: string;
  stage: LifeJourneyStage;
  stageNumber: number;
  stageTitleHindi: string;
  stageSubtitleHindi: string;
  periodRange: string;
  ageSpanText: string;
  associatedDasha: string;
  associatedPlanets: string[];
  lifeDomainsHindi: string;
  calculatedSource: string;
  traditionalInterpretation: string;
  confidenceStatus: string; // e.g. "📊 सत्यापित खगोलीय गणना • शास्त्रीय सूत्र"
  isActiveNow: boolean;
  isUpcoming: boolean;
  isPast: boolean;
  iconName: string;
  evidenceTags: string[];
  crossCorroborations: CrossCorroborationItem[];
}

export type ValidationSelection = 'MATCH' | 'PARTIAL' | 'NO_MATCH';

export interface PastValidationFeedback {
  id: string;
  profileId: string;
  timelineItemId: string;
  selection: ValidationSelection;
  optionalNote?: string;
  selectedThemes?: string[];
  createdAt: string;
  language: string;
}

export type ResonanceLevel = 'STRONGLY_RESONATED' | 'PARTIALLY_RESONATED' | 'NEUTRAL_UNSURE';

export interface UserPastValidation {
  cardId: string;
  resonance: ResonanceLevel;
  userNote?: string;
  selectedThemes?: string[];
  validatedAt?: string;
}

export interface PresentLifeDomainGuidance {
  domainKey: 'career' | 'finance' | 'relationship' | 'health' | 'spiritual';
  titleHindi: string;
  iconName: string;
  statusHindi: string;
  calculatedSignificators: string;
  classicalSutraHindi: string;
  cultivateHindi: string;
  avoidHindi: string;
}

export interface PresentDeepGuidanceData {
  mahadashaLord: string;
  antardashaLord: string;
  mahadashaHindi: string;
  antardashaHindi: string;
  subDashaWindow: string;
  progressPercent: number;
  calculatedFact: {
    dashaSummary: string;
    activeHouses: number[];
    activeHousesText: string;
    dayLordHindi: string;
    panchangTithiVara: string;
    personalYearNumber: number;
    personalYearMeaning: string;
  };
  traditionalInterpretation: {
    classicalSource: string;
    sutraHi: string;
    meaningHi: string;
  };
  karmicAlignment: {
    cultivateList: string[];
    avoidList: string[];
    coreMottoHindi: string;
  };
  domains: PresentLifeDomainGuidance[];
  vedicRemedies: {
    daan: { titleHi: string; descHi: string };
    snan: { titleHi: string; descHi: string };
    mantra: { titleHi: string; mantraText: string; countHi: string };
    dailyContemplation: { titleHi: string; descHi: string };
  };
}

export interface FutureDomainGroup {
  domainKey: 'career' | 'finance' | 'property' | 'marriage' | 'spiritual' | 'business';
  domainTitleHindi: string;
  domainIcon: string;
  descriptionHindi: string;
  benchmarkTag?: string;
  windows: PragyaTimelineItem[];
}

export interface PastAnalysisCard {
  id: string;
  category: 'MAHADASHA' | 'ANTARDASHA' | 'TRANSIT' | 'VARGA' | 'KP' | 'NUMEROLOGY' | 'LOSHU' | 'JAIMINI';
  categoryHindi: string;
  periodRange: string;
  associatedDasha: string;
  associatedPlanet: string;
  planetHindi: string;
  lifeDomainsHindi: string;
  calculatedSource: string;
  traditionalInterpretation: string;
  confidenceStatus: string; // e.g. "📊 शास्त्रीय गणना आधारित • प्रामाणिक"
  historicalDisclaimerHi: string;
  calculatedFactDetail?: string;
  pragyaGuidance?: string;
  userValidation?: UserPastValidation;
  vargaThemes?: string;
  kpIndicators?: string;
  numerologyCycle?: string;
  loShuTheme?: string;
  jaiminiIndicator?: string;
  remedy?: string;
  prayer?: string;
}

export interface JeevanPragyaData {
  profile: BirthProfile;
  calculatedAt: string;
  masterDataVerified: boolean;
  yatraSummary: JeevanYatraSummary;
  lifeJourneyTimeline?: LifeJourneyPhase[];
  pastAnalysisCards?: PastAnalysisCard[];
  presentDeepGuidance?: PresentDeepGuidanceData;
  futureDomainGroups?: FutureDomainGroup[];
  pastEra: {
    title: string;
    badge: string;
    descriptionHindi: string;
    disclaimerHindi: string;
    items: PragyaTimelineItem[];
  };
  presentEra: {
    title: string;
    badge: string;
    descriptionHindi: string;
    item: PragyaTimelineItem;
    freeInsightsCount: number;
    lockedInsightsCount: number;
    numerologyCycle: {
      personalYear: number;
      driverNumber: number;
      conductorNumber: number;
      meaningHi: string;
    };
    panchangVara: {
      nameHindi: string;
      lordHindi: string;
      dateDisplay: string;
      aphorismHindi: string;
    };
    activeRulingHouses: number[];
  };
  futureEra: {
    title: string;
    badge: string;
    descriptionHindi: string;
    items: PragyaTimelineItem[];
    verifiedLedgerWindowsCount: number;
    ledgerFingerprint?: string;
    benchmarkMatches: Array<{
      category: string;
      window: string;
      expectedStart: string;
      expectedEnd: string;
      verified: boolean;
      evidenceId: string;
    }>;
  };
  dataBoundary: {
    astronomicalEngine: string;
    ayanamsaUsed: string;
    verifiedPlanetsCount: number;
    pipelineProof: {
      calculatedData: string;
      evidence: string;
      traditionalInterpretation: string;
      aiExplanation: string;
      practicalGuidance: string;
    };
    safetyGuarantees: {
      healthDiagnosisFree: true;
      financialOutcomeFree: true;
      nonFatalisticLanguage: true;
      zeroFabricatedEvents: true;
    };
    noticeHi: string;
    noticeEn: string;
  };
}
