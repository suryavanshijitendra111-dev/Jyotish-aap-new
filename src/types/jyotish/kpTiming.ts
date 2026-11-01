/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — KP TIMING & TRANSIT CORROBORATION DATA CONTRACTS
 */

import { TransitEvidenceLedger } from './transitEvidence';

export type KPTimingFavourability = 
  | 'HIGHLY_FAVOURABLE' 
  | 'FAVOURABLE' 
  | 'MODERATE_MIXED' 
  | 'CHALLENGING_DELAY' 
  | string;

export type KPTimingPeriodType = 'ANTARDASHA' | 'PRATYANTARDASHA' | 'MAHADASHA' | string;

export interface KPTimingEvidenceLayers {
  primarySignificatorPassed: boolean;
  transitSupportPassed: boolean;
  rulingPlanetCorroboration: boolean;
  score: number;
  [key: string]: any;
}

export interface KPTimingWindow {
  id: string;
  startDate: string;
  endDate: string;
  mahadashaLord: string;
  antardashaLord: string;
  pratyantardashaLord?: string;
  favourability: KPTimingFavourability;
  score: number;
  significanceHindi?: string;
  significanceEnglish?: string;
  descriptionHindi?: string;
  descriptionEnglish?: string;
  [key: string]: any;
}

export interface KPCurrentPeriodStatus {
  isCurrentFavourable: boolean;
  mahadashaLord: string;
  antardashaLord: string;
  pratyantardashaLord?: string;
  startDate: string;
  endDate: string;
  statusTextHindi: string;
  statusTextEnglish: string;
  [key: string]: any;
}

export interface RealTransitPlanetDetail {
  planet: string;
  sign: string;
  degree: number;
  nakshatra: string;
  nakshatraLord: string;
  pada: number;
  motion: string;
  transitHouse: number;
  [key: string]: any;
}

export interface KPTransitCorroboration {
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'PARTIAL' | string;
  corroborated: boolean;
  actualTransitPlanets?: RealTransitPlanetDetail[];
  summaryHindi?: string;
  summaryEnglish?: string;
  [key: string]: any;
}

export type FutureTransitStatus = 'CONFIRMED' | 'UNVERIFIED' | 'REJECTED' | 'PENDING' | string;
export type FutureTransitBoundaryType = 'INGRESS' | 'STATION' | 'RETROGRADE_START' | 'DIRECT' | string;

export interface FutureTransitEvent {
  planet: string;
  eventType: FutureTransitBoundaryType;
  timestamp: string;
  sign: string;
  degree: number;
  nakshatra: string;
  status: FutureTransitStatus;
  [key: string]: any;
}

export interface FutureTransitCorroboration {
  status: FutureTransitStatus;
  verifiedEvents?: FutureTransitEvent[];
  events?: FutureTransitEvent[];
  summaryHindi?: string;
  summaryEnglish?: string;
  ledger?: TransitEvidenceLedger;
  [key: string]: any;
}

export interface KPTimingAnalysis {
  category: string;
  currentPeriod: KPCurrentPeriodStatus;
  mostFavourableWindow: KPTimingWindow | null;
  evaluatedWindows: KPTimingWindow[];
  transitCorroboration: KPTransitCorroboration;
  futureTransitCorroboration?: FutureTransitCorroboration;
  evidenceLedger?: TransitEvidenceLedger;
  humanTimingSummary: {
    hindi: string;
    english: string;
  };
  timingGuidance: {
    hindi: string;
    english: string;
  };
  timingUncertaintyNote?: {
    hindi: string;
    english: string;
  };
  evidenceReference?: string;
  [key: string]: any;
}
