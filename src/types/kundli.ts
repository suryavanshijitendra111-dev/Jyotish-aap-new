import { ParashariEngineResult } from './parashari';

export interface BirthProfile {
  id?: string;
  name: string;
  dob: string;
  time: string;
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  rawDob?: string;
  rawTime?: string;
  timeUnknown?: boolean;
  mobile?: string;
  mobileNumber?: string;
  mobileNumbers?: string[];
  gender?: string;
  relationship?: string;
  isMaster?: boolean;
}

export type AyanamsaType = 'Lahiri' | 'Raman' | 'Future';
export type EngineStatus = 'Ready' | 'Calculating' | 'Not Connected' | 'Error';
export type MotionStatus = 'Direct' | 'Retrograde' | 'Stationary';
export type Dignity = 'Exalted' | 'Debilitated' | 'Moolatrikona' | 'Own Sign' | 'Friendly Sign' | 'Enemy Sign' | 'Neutral Sign' | 'OwnHouse' | 'Friendly' | 'Enemy' | 'Neutral' | 'None' | 'Unknown';

export interface CalculationMetadata {
  engine: string;
  ephemerisVersion: string;
  ayanamsa: string;
  ayanamsaValue: number;
  nodeType: string;
  houseSystem: string;
  timestamp: string;
  inputTimezone: string;
  julianDay?: number;
  birthUtcTime?: string;
}

export interface PlanetData {
  name: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  degree: number; // 0 to 29.999...
  rashi: number; // 1-12
  rashiName: string;
  nakshatra: number; // 1-27
  pada: number; // 1-4
  latitude: number;
  motionStatus: MotionStatus;
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: Dignity;
  signLord?: string;
  nakshatraLord?: string;
  d1House: number; // Assigned whole-sign house from Lagna
  calculationSource: string;
}

export interface HouseData {
  number: number;
  cuspLongitude: number;
  rashi: number;
  degree: number;
}

export interface VedicHouse {
  houseNumber: number; // 1-12
  rashi: number;
  rashiName: string;
  signLord: string;
  planetsOccupying: string[];
  cuspLongitude?: number;
  isBhava: boolean; // false for D1, true for Bhava chart
}

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  subPeriods?: DashaPeriod[];
}

export interface DashaAudit {
  rawMoonLongitude: number;
  tropicalMoonLongitude: number;
  siderealMoonLongitude: number;
  isAyanamsaApplied: boolean;
  assumedAyanamsa: number;
  nakshatraIndex: number;
  nakshatraName: string;
  nakshatraLord: string;
  nakshatraStartDeg: number;
  nakshatraEndDeg: number;
  progressPercent: number;
  remainingPercent: number;
  mahadashaTotalYears: number;
  birthBalanceYears: number;
  birthBalanceYMD: string;
  firstMahadashaEndDate: string;
  shadowCalculation?: {
    correctedSiderealMoon: number;
    correctedNakshatra: string;
    correctedNakshatraLord: string;
    correctedCurrentMahadasha: string;
    correctedCurrentAntardasha: string;
  };
  discrepancyReason: string;
}

export interface PanchatattvaIndicator {
  source: string;
  rule: string;
  element: 'Earth' | 'Water' | 'Fire' | 'Air' | 'Ether';
  weight: number;
}

export interface PanchatattvaElementDetail {
  score: number;
  percentage: number;
  relativePercentage: number;
  indicators: PanchatattvaIndicator[];
}

export interface PanchatattvaResult {
  earth: PanchatattvaElementDetail;
  water: PanchatattvaElementDetail;
  fire: PanchatattvaElementDetail;
  air: PanchatattvaElementDetail;
  ether: PanchatattvaElementDetail;
  totalScore: number;
  dominant: string;
  weakest: string;
  calculationTimestamp?: string;
  source: 'MasterKundliData';
}

export interface VimshottariData {
  system: "Vimshottari";
  version: string;
  dataSource: string;
  birthNakshatra: string;
  birthNakshatraLord: string;
  nakshatraProgress: number;
  birthMahadasha: DashaPeriod;
  mahadashas: DashaPeriod[];
  currentMahadasha: DashaPeriod;
  currentAntardasha: DashaPeriod;
  nextAntardasha: DashaPeriod;
  nextMahadasha: DashaPeriod;
  balanceYears: number;
  calculationExplanation: string;
  audit: DashaAudit;
}

export interface MasterKundliData {
  birthProfile: BirthProfile;
  metadata: CalculationMetadata;
  ayanamsa: string;
  lagna: PlanetData;
  planets: Record<string, PlanetData>;
  d1Chart: Record<number, VedicHouse>;
  bhavaChart: Record<number, VedicHouse>;
  vimshottariDasha: VimshottariData | null;
  parashariAnalysis?: ParashariEngineResult | null;
  panchatattva?: PanchatattvaResult;
  warnings: string[];
}

export interface EngineResult {
  status: EngineStatus;
  data: MasterKundliData | null;
  message: string;
  isVerified?: boolean;
}

export type PrashnaQuestionMode =
  | 'general'
  | 'lost_object'
  | 'stolen_object'
  | 'missing_person'
  | 'health_rog'
  | 'yes_no'
  | 'career'
  | 'job'
  | 'business'
  | 'finance'
  | 'property_land'
  | 'vehicle'
  | 'marriage'
  | 'relationship'
  | 'children'
  | 'education_exam'
  | 'legal_dispute'
  | 'partnership'
  | 'travel'
  | 'lost_parcel'
  | 'digital_device'
  | 'spiritual_sadhana'
  | 'temple_puja'
  | 'muhurat'
  | 'two_option';

export interface PrashnaSupportingDetails {
  objectDescription?: string;
  lastKnownPlace?: string;
  lastSeenTime?: string;
  personRelationName?: string;
  personRelation?: string;
  personConcerned?: string;
  symptomsOrConcern?: string;
  duration?: string;
  optionA?: string;
  optionB?: string;
  propertyType?: string;
  locality?: string;
  vehicleType?: string;
  destination?: string;
  examName?: string;
  disputeType?: string;
  partnerName?: string;
  deviceType?: string;
  carrierParcelDetails?: string;
  spiritualTopic?: string;
  ritualType?: string;
  activityName?: string;
}

export interface PrashnaContext {
  mode: PrashnaQuestionMode;
  question: string;
  timestamp: string; // ISO string
  formattedDate: string; // e.g. "16 September 2026"
  formattedTime: string; // e.g. "11:22:30 AM"
  timezone: string; // e.g. "Asia/Kolkata"
  latitude: number;
  longitude: number;
  location: string;
  ayanamsa?: AyanamsaType;
  supportingDetails?: PrashnaSupportingDetails;
}

export interface PrashnaPlanet {
  planet: string;
  hindiName: string;
  sign: string;
  hindiSign: string;
  rashiNumber: number;
  house: number;
  degree: number;
  formattedDegree: string;
  nakshatra: string;
  pada: number;
  motion: string;
  isRetrograde: boolean;
  isCombust: boolean;
  lordOfHouses: number[];
  dignity: string;
}

export interface PrashnaTraditionalAnalysis {
  mode: PrashnaQuestionMode;
  modeLabel: string;
  modeCategory: string;
  primaryHouse: number;
  secondaryHouses: number[];
  primarySignificator: string;
  secondarySignificators: string[];
  directionIndicator: {
    direction: 'East' | 'South' | 'West' | 'North' | 'North-East' | 'South-East' | 'South-West' | 'North-West' | 'Indeterminate';
    hindiDirection: string;
    basis: string;
  };
  signNatureIndicator: {
    nature: 'Movable (Chara)' | 'Fixed (Sthira)' | 'Dual (Dvisvabhava)';
    hindiNature: string;
    implication: string;
  };
  elementIndicator: {
    element: 'Agni (Fire)' | 'Prithvi (Earth)' | 'Vayu (Air)' | 'Jala (Water)';
    hindiElement: string;
    locationClues: string;
  };
  recoveryOrOutcomeTiming: {
    probability: 'High' | 'Moderate' | 'Low / Delayed';
    traditionalTimingEstimate: string;
    astrologicalCondition: string;
  };
  twoOptionAnalysis?: {
    optionA: {
      label: string;
      associatedHouse: number;
      houseLord: string;
      lordDignity: string;
      evaluation: string;
    };
    optionB: {
      label: string;
      associatedHouse: number;
      houseLord: string;
      lordDignity: string;
      evaluation: string;
    };
    comparisonSummary: string;
  };
  cautionsAndDisclaimers: string[];
}

export interface PrashnaSignificators {
  lagnaLord: {
    planet: string;
    house: number;
    sign: string;
    dignity: string;
  };
  moon: {
    sign: string;
    house: number;
    nakshatra: string;
    pada: number;
    dignity: string;
  };
  questionCategory: string;
  karyaBhava: number;
  karyeshLord: {
    house: number;
    lord: string;
    sign: string;
    currentHouse: number;
    dignity: string;
  };
  lagneshKaryeshRelation: string;
  karyaSiddhiPotential: 'Favorable' | 'Moderate' | 'Challenging';
  karyaSiddhiReason: string;
  tajikYogaName?: string;
  tajikRelationHindi?: string;
}

export interface PrashnaAIExplanation {
  calculatedDataSection: string;
  traditionalSection: string;
  aiExplanationSection: string;
  rawText: string;
}

export type TajikAspectType = 
  | 'Conjunction' // 1st (0°)
  | 'Sextile'     // 3rd / 11th (60°)
  | 'Square'      // 4th / 10th (90°)
  | 'Trine'       // 5th / 9th (120°)
  | 'Opposition'  // 7th (180°)
  | 'None';       // 2, 6, 8, 12

export type TajikYogaName = 
  | 'Ithasala'    // Muthashila
  | 'Ishrafa'     // Musaripha
  | 'Nakta'
  | 'Yamaya'
  | 'Kambool'
  | 'None';

export interface TajikPlanetOrbInfo {
  planet: string;
  hindiName: string;
  deeptamsha: number;
  degreeInSign: number;
  house: number;
  speedRank: number; // 1 = Moon, 7 = Saturn
  isFaster: boolean;
  isRetrograde: boolean;
}

export interface PrashnaTajikYogaAnalysis {
  lagnesh: TajikPlanetOrbInfo;
  karyesh: TajikPlanetOrbInfo;
  aspectType: TajikAspectType;
  aspectNameHindi: string;
  combinedDeeptamshaLimit: number; // (deeptamsha1 + deeptamsha2) / 2
  actualDegreeDiff: number; // |degree1 - degree2|
  isWithinOrb: boolean;
  isApplying: boolean;
  activeYoga: TajikYogaName;
  yogaNameHindi: string;
  yogaCategory: 'Fulfillment (सिद्धि)' | 'Impediment (बाधा/हानि)' | 'Mediated (मध्यस्थ)' | 'Neutral (तटस्थ)';
  subType?: string; // e.g. 'Poorna Ithasala', 'Vartamana Ithasala', 'Uttama Kambool', etc.
  mediatorPlanet?: {
    planet: string;
    hindiName: string;
    role: 'Fast Messenger (शीघ्रगामी नक्त मध्यस्थ)' | 'Heavy Authority (गुरु यामया मध्यस्थ)' | 'Kambool Moon (कम्बूल चंद्रमा)';
    house: number;
    description: string;
  };
  classicalRule: string;
  interpretationHindi: string;
  interpretationEnglish: string;
}

export interface PrashnaKundliData {
  prashnaId: string;
  mode: PrashnaQuestionMode;
  context: PrashnaContext;
  ascendant: {
    sign: string;
    hindiSign: string;
    rashiNumber: number;
    degree: number;
    formattedDegree: string;
    nakshatra: string;
    pada: number;
    lord: string;
  };
  planets: Record<string, PrashnaPlanet>;
  d1Chart: Record<number, VedicHouse>;
  bhavaChart: Record<number, VedicHouse>;
  significators: PrashnaSignificators;
  traditionalAnalysis: PrashnaTraditionalAnalysis;
  tajikAnalysis?: PrashnaTajikYogaAnalysis;
  calculationVersion: string;
  source: 'PrashnaCalculationEngine';
  timestamp: string;
  warnings: string[];
}

export interface PrashnaHistoryItem {
  id: string;
  profileId?: string;
  profileName?: string;
  mode: PrashnaQuestionMode;
  modeLabel: string;
  question: string;
  timestamp: string;
  formattedDateTime: string;
  location: string;
  calculationVersion: string;
  lagnaSign: string;
  moonSign: string;
  karyaSiddhiPotential: 'Favorable' | 'Moderate' | 'Challenging';
  summary: string;
  tajikYoga?: string;
}
