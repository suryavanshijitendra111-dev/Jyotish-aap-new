/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — GURU CHANDAL VICHAR (पारंपरिक गुरु चाण्डाल विचार)
 * PHASE 1.13C-4: TYPE DEFINITIONS
 * 
 * Strongly-typed contracts for deterministic Guru Chandal analysis,
 * same-Rashi / same-House evaluation, transparent degree separation,
 * and structured astronomical modifiers without numerical scoring.
 */

export type GuruChandalStatus =
  | 'PRESENT'
  | 'NOT_PRESENT'
  | 'INSUFFICIENT_DATA'
  | 'DATA_CONFLICT';

export interface PlanetaryReference {
  house: number | null;
  rashi: number | null;
  rashiName: string | null;
  degree: number | null;
  siderealLongitude: number | null;
  dignity?: string;
  isRetrograde?: boolean;
}

export interface GuruChandalMitigationModifiers {
  jupiterDignity: string | null;
  isJupiterExalted: boolean;
  isJupiterOwnSign: boolean;
  isJupiterDebilitated: boolean;
  isJupiterRetrograde: boolean;
  mitigationNotes: string[];
  mitigationNotesHindi: string[];
}

export interface GuruChandalResult {
  doshaId: 'GURU_CHANDAL_ANALYSIS';
  status: GuruChandalStatus;
  jupiter: PlanetaryReference;
  rahu: PlanetaryReference;
  sameRashi: boolean;
  sameHouse: boolean;
  degreeSeparation: number | null;
  indication: {
    en: string;
    hi: string;
  };
  traditionMetadata: {
    tradition: string;
    scope: string;
    scientificStatus: string;
  };
  mitigation: GuruChandalMitigationModifiers;
  disclaimer: {
    en: string;
    hi: string;
  };
}
