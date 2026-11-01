/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — UNIFIED DOSH TYPES
 */

export type UnifiedDoshId = 
  | 'MANGAL_DOSHA'
  | 'KALA_SARPA_TRADITION'
  | 'KALA_SARPA'
  | 'PITRISHAPA_ANALYSIS'
  | 'PITRISHAPA'
  | 'GURU_CHANDAL_ANALYSIS'
  | 'GURU_CHANDAL'
  | 'GRAHAN_VICHAR'
  | 'GRAHAN_DOSHA'
  | 'KEMADRUMA_ANALYSIS'
  | 'KEMADRUMA'
  | 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS'
  | 'SHANI_SADE_SATI'
  | string;

export type UnifiedDoshStatus = 'PRESENT' | 'NOT_PRESENT' | 'MITIGATED' | 'INSUFFICIENT_DATA' | 'FORMED' | 'CANCELLED' | string;

export interface UnifiedDoshResult {
  doshId: UnifiedDoshId;
  title: string;
  titleHindi: string;
  status: UnifiedDoshStatus;
  hasBhanga?: boolean;
  bhangaNoticeHi?: string;
  bhangaNoticeEn?: string;
  traditionStatus?: string;
  evidenceList?: any[];
  disclaimer: {
    hi: string;
    en: string;
  };
  rawResult?: any;
  [key: string]: any;
}

export interface UnifiedDoshCollection {
  results: UnifiedDoshResult[];
  metadata: {
    totalEnginesEvaluated: number;
    profileId?: string;
    timestamp: string;
    [key: string]: any;
  };
  [key: string]: any;
}
