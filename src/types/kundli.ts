/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — KUNDLI & JYOTISH CORE DATA CONTRACTS
 */

export interface BirthProfile {
  id?: string;
  name: string;
  dob: string;
  time: string;
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string;
  relationship?: string;
  timeUnknown?: boolean;
  rawDob?: string;
  rawTime?: string;
  ayanamsa?: string;
  mobileNumber?: string;
  mobileNumbers?: string[];
  pinCode?: string;
  detailedAddress?: string;
  isMaster?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanetData {
  name: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  degree: number;
  rashi: number;
  rashiName: string;
  latitude: number;
  isRetrograde: boolean;
  nakshatra: number;
  nakshatraName?: string;
  nakshatraLord?: string;
  signLord?: string;
  pada: number;
  motionStatus: string;
  isCombust: boolean;
  dignity: string;
  d1House: number;
  house?: number;
  calculationSource?: string;
  [key: string]: any;
}

export interface HouseData {
  houseNumber: number;
  rashi: number;
  rashiName: string;
  signLord: string;
  planetsOccupying: string[];
  cuspLongitude?: number;
  isBhava?: boolean;
  degree?: number;
  nakshatra?: string;
  nakshatraLord?: string;
  subLord?: string;
  [key: string]: any;
}

export type VedicHouse = HouseData;

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  subPeriods?: DashaPeriod[];
  antardasha?: DashaPeriod[];
  pratyantardasha?: DashaPeriod[];
  isCurrent?: boolean;
  level?: number;
  name?: string;
  durationYears?: number;
  [key: string]: any;
}

export interface VimshottariData {
  currentMahadasha?: string | DashaPeriod | any;
  currentAntardasha?: string | DashaPeriod | any;
  currentPratyantardasha?: string | DashaPeriod | any;
  periods: DashaPeriod[];
  mahadashaList?: DashaPeriod[];
  mahadashas?: DashaPeriod[];
  birthMahadasha?: string | DashaPeriod;
  birthNakshatra?: string;
  birthNakshatraLord?: string;
  nakshatraProgress?: number;
  balanceYears?: number;
  nextAntardasha?: DashaPeriod | any;
  nextMahadasha?: DashaPeriod | any;
  audit?: any;
  [key: string]: any;
}

export interface MasterKundliData {
  birthProfile: BirthProfile;
  lagna: {
    name: string;
    tropicalLongitude: number;
    siderealLongitude: number;
    degree: number;
    rashi: number;
    rashiName: string;
    nakshatra: number;
    pada: number;
    nakshatraName?: string;
    signLord?: string;
    nakshatraLord?: string;
    subLord?: string;
  };
  planets: Record<string, PlanetData>;
  d1Chart: Record<number, HouseData>;
  bhavaChart: Record<number, HouseData>;
  vimshottariDasha?: VimshottariData | null;
  parashariAnalysis?: any;
  panchatattva?: any;
  ayanamsa: string;
  metadata: {
    engine: string;
    ephemerisVersion: string;
    ayanamsa: string;
    ayanamsaValue: number;
    nodeType: string;
    houseSystem: string;
    timestamp: string;
    inputTimezone: string;
    julianDay: number;
    birthUtcTime: string;
    timeUnknown?: boolean;
  };
  warnings?: string[];
  [key: string]: any;
}

export interface EngineResult {
  status: 'Ready' | 'Error' | 'Idle' | 'Calculating' | string;
  data: MasterKundliData | null;
  message: string;
  isVerified: boolean;
}

export type AyanamsaType = 'Lahiri' | 'Raman' | 'KP' | string;

// Prashna (Horary) Types
export type PrashnaQuestionMode = 
  | 'general' 
  | 'lost_object' 
  | 'yes_no' 
  | 'career' 
  | 'health' 
  | 'relationship' 
  | 'travel' 
  | 'two_option' 
  | 'financial'
  | string;

export interface PrashnaSupportingDetails {
  optionA?: string;
  optionB?: string;
  lostItemName?: string;
  lostLocationContext?: string;
  notes?: string;
  [key: string]: any;
}

export interface PrashnaContext {
  question: string;
  mode: PrashnaQuestionMode;
  category?: string;
  formattedDate: string;
  formattedTime: string;
  latitude: number;
  longitude: number;
  locationName: string;
  location?: string;
  timezone: string;
  ayanamsa?: string;
  supportingDetails?: PrashnaSupportingDetails;
  timestamp?: string;
}

export interface PrashnaPlanet {
  planet: string;
  hindiName: string;
  sign: string;
  hindiSign: string;
  rashiNumber: number;
  house: number;
  degree: number;
  formattedDegree?: string;
  nakshatra: string;
  pada: number;
  motion: string;
  isRetrograde: boolean;
  isCombust: boolean;
  lordOfHouses: number[];
  dignity?: string;
  aspectsOnHouses?: number[];
  role?: string;
  description?: string;
  [key: string]: any;
}

export interface PrashnaSignificatorInfo {
  planet: string;
  house: number;
  sign: string;
  dignity: string;
  lord?: string;
  nakshatra?: string;
  pada?: number;
  [key: string]: any;
}

export interface PrashnaSignificators {
  lagnaLord: PrashnaSignificatorInfo;
  moon: {
    sign: string;
    house: number;
    nakshatra: string;
    pada: number;
    dignity: string;
    [key: string]: any;
  };
  questionCategory?: string;
  karyeshLord?: PrashnaSignificatorInfo;
  karyaBhava?: number;
  karyaSiddhiPotential?: string;
  karyaSiddhiReason?: string;
  lagneshKaryeshRelation?: string;
  tajikYogaName?: string;
  [key: string]: any;
}

export type TajikAspectType = 'Pratyaksha' | 'Mitra' | 'Shatru' | 'None';
export type TajikYogaName = 'Ithasala' | 'Ishrafa' | 'Nakta' | 'Yamaya' | 'Kambool' | 'None';

export interface TajikPlanetOrbInfo {
  planet: string;
  orbLimit: number;
  degree: number;
}

export interface TajikYogaAnalysis {
  activeYoga: TajikYogaName;
  yogaNameHindi: string;
  aspectType: TajikAspectType;
  aspectNameHindi: string;
  fasterPlanet?: PrashnaPlanet;
  slowerPlanet?: PrashnaPlanet;
  mediatorPlanet?: PrashnaPlanet;
  interpretationHindi: string;
  interpretationEnglish: string;
  yogaCategory?: string;
  subType?: string;
  lagnesh?: any;
  karyesh?: any;
  combinedDeeptamshaLimit?: number;
  actualDegreeDiff?: number;
  isWithinOrb?: boolean;
  isApplying?: boolean;
  classicalRule?: string;
  [key: string]: any;
}

export type PrashnaTajikYogaAnalysis = TajikYogaAnalysis;

export interface PrashnaTraditionalAnalysis {
  mode: string;
  modeLabel: string;
  modeCategory: string;
  primaryHouse: number;
  secondaryHouses: number[];
  primarySignificator: string;
  secondarySignificators: string[];
  directionIndicator: {
    direction: string;
    hindiDirection: string;
    basis: string;
  };
  signNatureIndicator: {
    nature: string;
    hindiNature: string;
    implication: string;
  };
  elementIndicator: {
    element: string;
    hindiElement: string;
    locationClues: string;
  };
  recoveryOrOutcomeTiming: {
    probability: 'High' | 'Moderate' | 'Low / Delayed' | string;
    traditionalTimingEstimate: string;
    astrologicalCondition: string;
  };
  twoOptionAnalysis?: any;
  cautionsAndDisclaimers: string[];
  [key: string]: any;
}

export interface PrashnaKundliData {
  prashnaId?: string;
  mode?: any;
  calculationVersion?: string;
  context: PrashnaContext;
  ascendant: {
    sign: string;
    hindiSign: string;
    degree: number;
    formattedDegree?: string;
    rashiNumber: number;
    nakshatra: string;
    pada: number;
    lord: string;
    hindiLord: string;
    [key: string]: any;
  };
  planets: Record<string, PrashnaPlanet>;
  houses: Record<number, any>;
  d1Chart?: any;
  karyesh: {
    targetHouse: number;
    karyeshLord: string;
    hindiLord: string;
    houseLocation: number;
    dignity: string;
    [key: string]: any;
  };
  karyaSiddhiPotential: 'Favorable' | 'Moderate' | 'Challenging' | string;
  lagneshKaryeshRelation: string;
  karyaSiddhiReason: string;
  significators: PrashnaSignificators;
  tajikAnalysis: TajikYogaAnalysis;
  traditionalAnalysis: PrashnaTraditionalAnalysis;
  calculatedAt: string;
  [key: string]: any;
}

export interface PrashnaHistoryItem {
  id: string;
  timestamp: string;
  question: string;
  mode: PrashnaQuestionMode;
  locationName: string;
  outcomeProbability: string;
  karyaSiddhiReason: string;
  data: PrashnaKundliData;
  profileId?: string;
  modeLabel?: string;
  tajikYoga?: string;
  karyaSiddhiPotential?: string;
  formattedDateTime?: string;
  location?: string;
  lagnaSign?: string;
  summary?: string;
  [key: string]: any;
}
