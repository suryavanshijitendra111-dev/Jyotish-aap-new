/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — KEMADRUMA DOSHA TYPES
 */

export type KemadrumaStatus = 'FORMED' | 'CANCELLED' | 'NOT_PRESENT' | 'CALCULATION_ERROR' | string;
export type KemadrumaIndication = 'PRESENT' | 'ABSENT' | 'INSUFFICIENT_DATA' | string;

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

export interface KemadrumaBhangaRule {
  id: string;
  name: string;
  nameHindi: string;
  conditionMet: boolean;
  explanation: string;
  explanationHindi: string;
  [key: string]: any;
}

export interface KemadrumaResult {
  doshaId: string;
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
  [key: string]: any;
}
