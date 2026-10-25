/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MUHURAT MODULE (शुभ मुहूर्त)
 * PHASE 1.12: TYPE DEFINITIONS
 * 
 * Standard types for Vedic Muhurat calculation, classical shastra rules,
 * Panchang components, Choghadiya, and explainability.
 */

export type MuhuratCategoryKey =
  | 'marriage'         // विवाह मुहूर्त
  | 'griha_pravesh'    // गृह प्रवेश
  | 'bhumi_pujan'      // गृह निर्माण / भूमि पूजन
  | 'vehicle_purchase' // वाहन खरीद
  | 'business_start'   // व्यापार / दुकान / ऑफिस शुरुआत
  | 'namkaran'         // नामकरण
  | 'annaprashan'      // अन्नप्राशन
  | 'upanayana'        // उपनयन / विद्यारंभ
  | 'travel_journey'   // यात्रा आरंभ
  | 'sarva_karya';     // सामान्य शुभ कार्य

export type MuhuratSuitability = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'AVOID';

export interface MuhuratCategoryConfig {
  key: MuhuratCategoryKey;
  titleHindi: string;
  titleEnglish: string;
  iconName: string;
  descriptionHindi: string;
  descriptionEnglish: string;
  classicalSources: string[];
}

export interface TithiDetails {
  number: number; // 1 to 30
  name: string;
  nameHindi: string;
  paksha: 'Shukla' | 'Krishna';
  pakshaHindi: string;
  group: 'Nanda' | 'Bhadra' | 'Jaya' | 'Rikta' | 'Purna';
  groupHindi: string;
  isRikta: boolean; // 4, 9, 14
  isAmavasya: boolean; // 30
  isPurnima: boolean; // 15
}

export interface NakshatraDetails {
  number: number; // 1 to 27
  name: string;
  nameHindi: string;
  lord: string;
  lordHindi: string;
  category: 'Sthira' | 'Chara' | 'Ugra' | 'Mishra' | 'Kshipra' | 'Mridu' | 'Teekshna';
  categoryHindi: string;
  qualityHindi: string;
}

export interface YogaDetails {
  number: number; // 1 to 27
  name: string;
  nameHindi: string;
  isAuspicious: boolean;
  qualityHindi: string;
}

export interface KaranaDetails {
  number: number; // 1 to 60
  name: string;
  nameHindi: string;
  type: 'Chara' | 'Sthira';
  isBhadra: boolean; // Vishti Karana
  qualityHindi: string;
}

export interface VaraDetails {
  dayIndex: number; // 0 (Sun) to 6 (Sat)
  name: string;
  nameHindi: string;
  lord: string;
  lordHindi: string;
  element: string;
}

export interface ChoghadiyaSlot {
  name: 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
  nameHindi: string;
  periodType: 'Day' | 'Night';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  rulingPlanet: string;
  rulingPlanetHindi: string;
  suitability: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'INAUSPICIOUS';
  significanceHindi: string;
}

export interface SolarTimes {
  sunrise: string;       // HH:mm
  sunset: string;        // HH:mm
  solarNoon: string;     // HH:mm
  abhijitStart: string;  // HH:mm
  abhijitEnd: string;    // HH:mm
  rahuKaalStart: string; // HH:mm
  rahuKaalEnd: string;   // HH:mm
  yamagandaStart: string;// HH:mm
  yamagandaEnd: string;  // HH:mm
  gulikaStart: string;   // HH:mm
  gulikaEnd: string;     // HH:mm
}

export interface DayPanchangData {
  date: string; // YYYY-MM-DD
  dateDisplayHindi: string;
  dateDisplayEnglish: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  vara: VaraDetails;
  tithi: TithiDetails;
  nakshatra: NakshatraDetails;
  yoga: YogaDetails;
  karana: KaranaDetails;
  solarTimes: SolarTimes;
  choghadiyasDay: ChoghadiyaSlot[];
  choghadiyasNight: ChoghadiyaSlot[];
  sunLongitude: number;
  moonLongitude: number;
  calculationSource: string;
}

export interface MuhuratWindow {
  id: string;
  category: MuhuratCategoryKey;
  categoryTitleHindi: string;
  categoryTitleEnglish: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationFormatted: string;
  suitability: MuhuratSuitability;
  suitabilityHindi: string;
  suitabilityEnglish: string;
  score: number; // 0 to 100
  panchang: DayPanchangData;
  activeChoghadiya: ChoghadiyaSlot;
  isAbhijitMuhurat: boolean;
  hasRahuKaalConflict: boolean;
  hasBhadraConflict: boolean;
  rulesApplied: string[];
  reasonsHindi: string[];
  cautionsHindi: string[];
  recommendedActionHindi: string;
  calculationSource: string;
  calculationTimestamp: string;
}

export interface MuhuratQuery {
  category: MuhuratCategoryKey;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  locationName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  profileName?: string;
  filterSuitability?: 'ALL' | 'EXCELLENT_ONLY' | 'GOOD_AND_ABOVE';
}

export interface MuhuratCalculationResult {
  query: MuhuratQuery;
  generatedTimestamp: string;
  totalWindowsFound: number;
  excellentCount: number;
  goodCount: number;
  moderateCount: number;
  avoidCount: number;
  windows: MuhuratWindow[];
  bestWindow: MuhuratWindow | null;
  categoryGuidanceHindi: string;
  safetyNoticeHindi: string;
  calculationEngine: string;
}
