/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — GRAHAN VICHAR (ग्रहण विचार)
 * PHASE 1.13C-5: TYPE DEFINITIONS
 * 
 * Strongly-typed contracts for deterministic Grahan Vichar analysis,
 * evaluating four independent combinations (Sun+Rahu, Sun+Ketu, Moon+Rahu, Moon+Ketu),
 * same-Rashi / same-House alignment, transparent circular degree separation,
 * and non-fatalistic traditional metadata.
 */

export type GrahanCombinationStatus =
  | 'PRESENT'
  | 'NOT_PRESENT'
  | 'INSUFFICIENT_DATA'
  | 'DATA_CONFLICT';

export type GrahanOverallStatus =
  | 'PRESENT'
  | 'NOT_PRESENT'
  | 'INSUFFICIENT_DATA'
  | 'DATA_CONFLICT';

export interface GrahanCombinationDetail {
  combinationId: 'SUN_RAHU' | 'SUN_KETU' | 'MOON_RAHU' | 'MOON_KETU';
  luminary: 'Sun' | 'Moon';
  node: 'Rahu' | 'Ketu';
  status: GrahanCombinationStatus;
  luminaryHouse: number | null;
  luminaryRashi: number | null;
  luminaryRashiName: string | null;
  luminaryDegree: number | null;
  luminarySiderealLongitude: number | null;
  nodeHouse: number | null;
  nodeRashi: number | null;
  nodeRashiName: string | null;
  nodeDegree: number | null;
  nodeSiderealLongitude: number | null;
  sameRashi: boolean;
  sameHouse: boolean;
  degreeSeparation: number | null;
  indication: {
    en: string;
    hi: string;
  };
}

export interface GrahanResult {
  doshaId: 'GRAHAN_VICHAR_ANALYSIS';
  overallStatus: GrahanOverallStatus;
  sunRahu: GrahanCombinationDetail;
  sunKetu: GrahanCombinationDetail;
  moonRahu: GrahanCombinationDetail;
  moonKetu: GrahanCombinationDetail;
  activeCombinationsCount: number;
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
