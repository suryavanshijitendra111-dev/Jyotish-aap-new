/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — REMEDY TYPES & ELIGIBILITY CONTRACTS
 */

import { UnifiedDoshId } from './unifiedDoshTypes';

export type RemedyCategory = 
  | 'TRADITIONAL_ROUTINE' 
  | 'MANTRA_JAPA' 
  | 'DANA_CHARITY' 
  | 'FASTING_VRATA' 
  | 'MEDITATION_SADHANA' 
  | 'SCRIPTURAL_READING' 
  | string;

export type SourceClassification = 
  | 'CLASSICAL' 
  | 'TRADITIONAL' 
  | 'LATER_PRACTITIONER' 
  | 'REGIONAL_CUSTOM' 
  | 'MODERN_ESOTERIC' 
  | 'SOURCE_UNVERIFIED';

export type DoshSpecificSupport = 'YES' | 'UNCERTAIN' | 'NO';

export interface RemedyItem {
  remedyId: string;
  targetDosh: UnifiedDoshId;
  category: RemedyCategory;
  nature: string;
  titleHi: string;
  titleEn: string;
  practiceHi: string;
  practiceEn: string;
  instructionHi: string;
  instructionEn: string;
  sourceName: string;
  edition: string;
  reference: string;
  sourceClassification: SourceClassification;
  sourceContainsPractice: boolean;
  doshSpecificSupport: DoshSpecificSupport;
  verificationStatus: string;
  eligibilityRule: string;
  safetyNoteHi: string;
  safetyNoteEn: string;
  languageStatus: string;
  displayNotesHi: string;
  displayNotesEn: string;
  [key: string]: any;
}

export interface DoshRemedyEvaluation {
  doshId: UnifiedDoshId;
  hasBhanga: boolean;
  isRemedyRequired: boolean;
  bhangaNoticeHi?: string;
  bhangaNoticeEn?: string;
  guidanceNoticeHi: string;
  guidanceNoticeEn: string;
  candidateRemediesCount: number;
  eligibleRemedies: RemedyItem[];
  [key: string]: any;
}
