/**
 * JEEVANDARPAN — KP PHASE 3C EVENT TIMING DATA MODEL
 * 
 * Defines strict deterministic structures for event timing based on
 * Vimshottari Dasha (Mahadasha/Antardasha), KP Significators (4-Fold A/B/C/D),
 * Primary Cusp Sub-Lords, and Ruling Planets.
 * 
 * STRICT INTEGRITY:
 * - NO hardcoded fake dates
 * - Dates originate exclusively from verified Dasha periods
 * - Favourability derived deterministically from KP significators
 */

import { KPQuestionCategory } from './kpJudgment';
import { TransitEvidenceLedger } from './transitEvidence';

export type KPTimingPeriodType =
  | 'CURRENT_ACTIVE'
  | 'NEXT_IMMEDIATE'
  | 'UPCOMING_FAVOURABLE'
  | 'UPCOMING_CHALLENGING'
  | 'LONG_TERM';

export type KPTimingFavourability =
  | 'HIGHLY_FAVOURABLE'
  | 'FAVOURABLE'
  | 'MODERATE_MIXED'
  | 'CHALLENGING_DELAY'
  | 'NEUTRAL';

export interface RealTransitPlanetDetail {
  planet: string;
  hindiName: string;
  exactLongitude: number;
  sign: string;
  hindiSign: string;
  degree: number;
  nakshatra: number;
  nakshatraName: string;
  nakshatraLord: string;
  pada: number;
  motionStatus: 'Direct' | 'Retrograde';
  isRetrograde: boolean;
  latitude: number;
  calculationTimestamp: string;
  ephemerisSource: string;
  transitHouseFromLagna: number;
  transitHouseFromMoon?: number;
  signifiedTargetHouses: number[];
}

export type FutureTransitStatus =
  | 'NOT_AVAILABLE'
  | 'SCANNED_NO_CORROBORATION'
  | 'SCANNED_CORROBORATED'
  | 'CALCULATION_ERROR';

export type FutureTransitBoundaryType =
  | 'SIGN_INGRESS'
  | 'NAKSHATRA_INGRESS'
  | 'PADA_TRANSITION'
  | 'HOUSE_TRANSITION'
  | 'RETROGRADE_TRANSITION'
  | 'DIRECT_TRANSITION'
  | 'PERIOD_SAMPLE';

export interface FutureTransitEvent {
  planet: string;
  hindiName: string;
  timestamp: string; // Refined boundary timestamp
  scanTimestamp?: string; // Baseline sample timestamp
  boundaryTimestamp?: string; // Refined timestamp
  precisionMinutes?: string; // e.g. "≤30 min", "≤60 min", "EVENT_TIME_UNRESOLVED"
  boundaryType?: FutureTransitBoundaryType;
  exactLongitude: number;
  sign: string;
  hindiSign: string;
  degree: number;
  nakshatra: number;
  nakshatraName: string;
  nakshatraLord: string;
  pada: number;
  motionStatus: 'Direct' | 'Retrograde';
  isRetrograde: boolean;
  transitHouseFromLagna: number;
  kpRelationship: string;
  targetHousesSignified: number[];
  adverseHousesSignified: number[];
  isDashaLordRelated: boolean;
  isAntardashaLordRelated: boolean;
  isCuspSubLordRelated: boolean;
  isQualifying: boolean;
}

export interface FutureTransitCorroboration {
  status: FutureTransitStatus;
  isCorroborated: boolean;
  scanStart: string;
  scanEnd: string;
  timestampsEvaluatedCount: number;
  candidateEventsCount: number;
  verifiedEventsCount: number;
  supportingPlanets: string[];
  keyTransitEvents: FutureTransitEvent[];
  summary: { hi: string; en: string };
  ephemerisSource: string;
  evidenceLedger?: TransitEvidenceLedger;
}

export interface KPTimingEvidenceLayers {
  dashaEvidence: {
    isSupportive: boolean;
    mahadashaLord: string;
    antardashaLord: string;
    summary: { hi: string; en: string };
  };
  kpSignificatorEvidence: {
    isSupportive: boolean;
    targetHousesSignified: number[];
    adverseHousesSignified: number[];
    score: number;
    summary: { hi: string; en: string };
  };
  cuspSubLordEvidence: {
    isConnected: boolean;
    primaryCuspSubLord: string;
    summary: { hi: string; en: string };
  };
  rulingPlanetCorroboration: {
    isCorroborated: boolean;
    matchedPlanets: string[];
    summary: { hi: string; en: string };
  };
  // Current Transit Evidence (Evaluation timestamp)
  currentTransitEvidence?: {
    status: 'AVAILABLE' | 'NOT_AVAILABLE';
    isCorroborated: boolean;
    supportingPlanets: string[];
    summary: { hi: string; en: string };
    calculationTimestamp?: string;
  };
  // Backward compatibility alias for current transit
  actualTransitEvidence?: {
    status: 'AVAILABLE' | 'NOT_AVAILABLE';
    isCorroborated: boolean;
    supportingPlanets: string[];
    summary: { hi: string; en: string };
  };
  // Genuine Future Transit Evidence (Dates inside window)
  futureTransitEvidence?: FutureTransitCorroboration;
}

export interface KPTimingWindow {
  id: string;
  periodType: KPTimingPeriodType;
  mahadashaLord: string;
  antardashaLord: string;
  pratyantarLord?: string;
  startDate: string; // ISO string from Dasha engine
  endDate: string;   // ISO string from Dasha engine
  formattedStart: { hi: string; en: string };
  formattedEnd: { hi: string; en: string };
  durationMonths: number;
  favourability: KPTimingFavourability;
  favourabilityLabel: { hi: string; en: string };
  significatorScore: number; // 0 - 100
  targetHousesSignified: number[];
  adverseHousesSignified: number[];
  isMahadashaSupportive: boolean;
  isAntardashaSupportive: boolean;
  isRulingPlanetCorroborated: boolean;
  isCuspSubLordConnected: boolean;
  evidenceSummary: { hi: string; en: string };

  // Explicit 5+ Evidence Layers
  evidenceLayers?: KPTimingEvidenceLayers;
  futureTransitCorroboration?: FutureTransitCorroboration;
}

export interface KPCurrentPeriodStatus {
  mahadashaLord: string;
  mahadashaStart: string;
  mahadashaEnd: string;
  mahadashaSignifiedHouses: number[];
  isMahadashaSupportive: boolean;
  antardashaLord: string;
  antardashaStart: string;
  antardashaEnd: string;
  antardashaSignifiedHouses: number[];
  isAntardashaSupportive: boolean;
  formattedCurrentRange: { hi: string; en: string };
  summary: { hi: string; en: string };
}

export interface KPTransitCorroboration {
  status: 'AVAILABLE' | 'NOT_AVAILABLE';
  isCorroborated: boolean;
  description: { hi: string; en: string };
  transitSignificatorPlanets: string[];
  keyTransitHouses: number[];
  actualTransitPlanets?: RealTransitPlanetDetail[];
  calculationTimestamp?: string;
  ephemerisSource?: string;
  classicalRuleNote?: {
    label: { hi: string; en: string };
    description: { hi: string; en: string };
  };
}

export interface KPTimingAnalysis {
  question: string;
  category: KPQuestionCategory;
  categoryLabel: { hi: string; en: string };
  eventTargetHouses: number[];
  eventAdverseHouses: number[];
  isEventPromised: boolean;
  judgmentOutcome: string;
  primaryCusp: number;
  primaryCuspSubLord: string;
  
  // Current Dasha State
  currentPeriod: KPCurrentPeriodStatus;
  
  // Chronological Evaluated Windows (Next 5-8 Antardashas)
  evaluatedWindows: KPTimingWindow[];
  
  // Prime Timing Windows
  mostFavourableWindow: KPTimingWindow | null;
  favourableWindows: KPTimingWindow[];
  
  // Transit Corroboration (Current Evaluation Timestamp)
  transitCorroboration: KPTransitCorroboration;
  
  // Future Transit Corroboration (Scanned inside top window)
  futureTransitCorroboration?: FutureTransitCorroboration;
  
  // Human Natural Explanations
  humanTimingSummary: { hi: string; en: string };
  timingGuidance: Array<{ hi: string; en: string }>;
  timingUncertaintyNote: { hi: string; en: string };
  
  // Deterministic Evidence Reference
  evidenceReference: {
    dashaSource: string;
    primaryCuspSubLord: string;
    favourablePlanets: string[];
    adversePlanets: string[];
    rulingPlanets: string[];
  };
}
