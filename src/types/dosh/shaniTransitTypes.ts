/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — SHANI SADE SATI & DHAIYYA (शनि साढ़ेसाती एवं ढैया विचार)
 * PHASE 1.13C-7: TYPE DEFINITIONS
 * 
 * Strongly-typed contracts for deterministic Saturn transit analysis relative to
 * the Natal Moon sign (Sade Sati rising/peak/setting and 4th/8th Dhaiyya).
 * 
 * STRICT INVARIANTS:
 * - Reads existing calculated transit data; zero duplicate ephemeris calculation.
 * - Whole-sign zodiac relationship from natal Moon (12th, 1st, 2nd, 4th, 8th).
 * - Sade Sati takes precedence over Dhaiyya.
 * - Zero severity scoring (no danger scores, bad period points, or percentages).
 * - Non-fatalistic traditional interpretation only.
 */

export type ShaniTransitStatus =
  | 'PRESENT'
  | 'NOT_PRESENT'
  | 'INSUFFICIENT_DATA'
  | 'DATA_CONFLICT';

export type ShaniTransitClassification =
  | 'NONE'
  | 'SADE_SATI'
  | 'DHAIYYA_4TH'
  | 'DHAIYYA_8TH'
  | 'INSUFFICIENT_DATA'
  | 'DATA_CONFLICT';

export type SadeSatiPhase =
  | 'RISING'
  | 'PEAK'
  | 'SETTING';

export interface ShaniTransitPosition {
  currentRashi: number | null;
  currentRashiName: string | null;
  degree: number | null;
  siderealLongitude: number | null;
  transitDate: string | null;
  isRetrograde: boolean;
}

export interface ShaniFutureWindow {
  windowId: string;
  classification: 'SADE_SATI' | 'DHAIYYA_4TH' | 'DHAIYYA_8TH';
  phase?: SadeSatiPhase;
  saturnRashi: number;
  saturnRashiName: string;
  startDate: string;
  endDate: string;
  evidenceId?: string;
  source: string;
  provenance: string;
  fingerprint?: string;
}

export interface ShaniTransitAnalysisResult {
  doshaId: 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS';
  status: ShaniTransitStatus;
  classification: ShaniTransitClassification;
  phase: SadeSatiPhase | null;
  phaseHindi: string | null;
  natalMoon: {
    rashi: number | null;
    rashiName: string | null;
    house: number | null;
  };
  saturn: ShaniTransitPosition;
  saturnFromMoonHouse: number | null; // 1-12
  traditionalInterpretation: {
    en: string;
    hi: string;
  };
  traditionMetadata: {
    tradition: string;
    sourceStatus: string;
    scope: string;
    scientificStatus: string;
  };
  futureWindows?: ShaniFutureWindow[];
  disclaimer: {
    en: string;
    hi: string;
  };
}
