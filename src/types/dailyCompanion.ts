import { BirthProfile, MasterKundliData } from './kundli';

export type DailyCompanionTimeSlot = 'morning' | 'midday' | 'evening' | 'night';

export type DailyCardType =
  | 'today_start'
  | 'goal_sankalp'
  | 'work_focus'
  | 'finance_decisions'
  | 'family_harmony'
  | 'travel_movement'
  | 'wellness_vitality'
  | 'todays_karma'
  | 'what_to_avoid'
  | 'core_message'
  | 'why_audit'
  | 'night_closure';

export interface DailyCompanionCard {
  id: DailyCardType;
  titleHindi: string;
  titleEnglish: string;
  category: 'Overview' | 'Action' | 'Harmony' | 'Audit';
  iconName: string;
  calculatedFact: string; // The exact mathematical / astronomical / numerological fact
  traditionalInterpretation: string; // Traditional Jyotish / Numerology interpretation
  practicalGuidance: string; // Gentle, empathetic, actionable advice
  uncertaintyAndFreewill: string; // Explicit statement on freewill, purushartha & uncertainty
  whyAstrologicalBasis: string; // Concrete audit trail of data points
  actionItem?: string;
  quoteOrMantra?: string;
}

export interface DailyTimeSlotMessage {
  slot: DailyCompanionTimeSlot;
  titleHindi: string;
  titleEnglish: string;
  timeRange: string;
  greeting: string;
  focusGuidance: string;
  mindfulnessTip: string;
  whyBasis: string;
}

export interface PanchangDailySummary {
  dayOfWeek: string;
  dayLord: string;
  dayLordHindi: string;
  elementOfInfluence: string;
  auspiciousDirection: string;
  favorableColors: string[];
  favorableDeityOrMeditation: string;
  rahukaalWindow: string;
  choghadiyaDayLord: string;
}

export interface NumerologyDailySummary {
  birthNumber: number; // Moolank
  destinyNumber: number; // Bhagyank
  nameNumber: number;
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  personalDayTheme: string;
  personalDayVibration: string;
  loShuRepeated: number[];
  loShuMissing: number[];
}

export interface DashaDailySummary {
  mahadasha: string;
  antardasha: string;
  pratyantardasha?: string;
  startDate: string;
  endDate: string;
  dashaSignificance: string;
}

export interface PanchatattvaDailySummary {
  dominant: string;
  weakest: string;
  balanceGuidance: string;
  dailyElementHarmonizer: string;
}

export interface DailyCompanionGuidanceContext {
  date: string; // YYYY-MM-DD
  formattedDate: string;
  language: 'Hindi' | 'English';
  profile: BirthProfile;
  numerology: NumerologyDailySummary;
  dasha: DashaDailySummary;
  panchatattva: PanchatattvaDailySummary;
  panchang: PanchangDailySummary;
  masterKundliSummary: {
    lagnaRashi: string;
    moonRashi: string;
    moonNakshatra: string;
    sunRashi: string;
    lagnaLord: string;
  };
}

export interface TodaysKarmaDetails {
  title: string;
  titleHindi: string;
  description: string;
  spiritualBasis: string;
  actionStep: string;
  suggestedTime: string;
}

export interface VedicHoraItem {
  horaNumber: number; // 1 to 24 (1-12 Day, 13-24 Night)
  periodType: 'Day' | 'Night';
  periodTypeHindi: 'दिन होरा' | 'रात्रि होरा';
  lord: 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';
  lordHindi: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  nature: 'Shubha' | 'Madhyam' | 'Ashubha';
  natureHindi: string;
  recommendedActivitiesHindi: string;
  recommendedActivitiesEnglish: string;
  cautionHindi: string;
  isCurrent: boolean;
}

export interface VedicHoraDayAnalysis {
  date: string;
  weekday: string;
  weekdayHindi: string;
  dayLord: string;
  dayLordHindi: string;
  sunrise: string;
  sunset: string;
  dinmaanFormatted: string; // e.g. "12 घंटे 14 मिनट"
  ratrimanFormatted: string; // e.g. "11 घंटे 46 मिनट"
  dayHoraDurationMinutes: number;
  nightHoraDurationMinutes: number;
  currentHoraIndex: number; // 0 to 23
  horas: VedicHoraItem[];
}

export interface DailyCompanionData {
  date: string;
  formattedDate: string;
  dayOfWeek: string;
  profile: BirthProfile;
  context: DailyCompanionGuidanceContext;
  cards: Record<DailyCardType, DailyCompanionCard>;
  timeSlotMessages: Record<DailyCompanionTimeSlot, DailyTimeSlotMessage>;
  todaysKarma: TodaysKarmaDetails;
  horaAnalysis?: VedicHoraDayAnalysis;
  whyAuditTrail: {
    profileDataUsed: string[];
    dashaDataUsed: string;
    numerologyDataUsed: string;
    panchatattvaDataUsed: string;
    loShuDataUsed: string;
    transitDataUsed: string;
    complianceStatement: string;
  };
  generationTimestamp: string;
  isAiEnhanced: boolean;
  aiSourceModel?: string;
}

export interface DailyCompanionNotificationPreferences {
  enabled: boolean;
  morningTime: string; // e.g. "07:00"
  middayTime: string; // e.g. "12:30"
  eveningTime: string; // e.g. "18:00"
  nightTime: string; // e.g. "21:30"
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "06:30"
  soundEnabled: boolean;
  language: 'Hindi' | 'English';
  lastNotifiedDate?: string;
  lastNotifiedSlot?: DailyCompanionTimeSlot;
}
