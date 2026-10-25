/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — KEMADRUMA YOGA & BHANGA (केमद्रुम योग एवं भंग विचार)
 * PHASE 1.13C-6: TYPE DEFINITIONS
 * 
 * Strongly-typed contracts for deterministic Kemadruma Yoga analysis,
 * independent tracking of Base Kemadruma and classical Bhanga (cancellation) rules,
 * qualifying planet filtering, and non-fatalistic traditional metadata.
 */

export type KemadrumaStatus =
  | 'PRESENT'
  | 'NOT_PRESENT'
  | 'INSUFFICIENT_DATA';

export type KemadrumaIndication =
  | 'PRESENT'
  | 'NOT_PRESENT'
  | 'INSUFFICIENT_DATA';

export interface KemadrumaBhangaRule {
  ruleId: string;
  name: string;
  nameHindi: string;
  triggered: boolean;
  status: 'ACTIVE' | 'DEFERRED';
  explanation: string;
  explanationHindi: string;
  tradition: string;
  confidence: 'CONFIDENT_CLASSICAL' | 'TRADITIONAL_SCHOOL';
}

export interface RelievingPlanetCheck {
  secondHouseFromMoon: {
    rashi: number | null;
    rashiName: string | null;
    houseFromLagna: number | null;
    occupyingQualifyingPlanets: string[];
    occupyingExcludedPlanets: string[];
  };
  twelfthHouseFromMoon: {
    rashi: number | null;
    rashiName: string | null;
    houseFromLagna: number | null;
    occupyingQualifyingPlanets: string[];
    occupyingExcludedPlanets: string[];
  };
}

export interface KemadrumaResult {
  doshaId: 'KEMADRUMA_ANALYSIS';
  status: KemadrumaStatus;
  baseIndication: KemadrumaIndication;
  bhangaPresent: boolean;
  activeBhangasCount: number;
  moonDetails: {
    house: number | null;
    rashi: number | null;
    rashiName: string | null;
    degree: number | null;
    siderealLongitude: number | null;
  };
  relievingPlanetCheck: RelievingPlanetCheck;
  bhangaRules: KemadrumaBhangaRule[];
  traditionMetadata: {
    tradition: string;
    scope: string;
    scientificStatus: string;
  };
  disclaimer: {
    en: string;
    hi: string;
  };
}
