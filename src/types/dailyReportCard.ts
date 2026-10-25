import { BirthProfile } from './kundli';

export type ReportSectionCategory = 
  | 'OVERVIEW'
  | 'ASTROLOGY'
  | 'NUMEROLOGY'
  | 'ELEMENTAL'
  | 'WELLNESS'
  | 'LIFE_DOMAINS'
  | 'CONSCIOUSNESS';

export interface DailyReportCardSection {
  id: string;
  title: string;
  titleHindi: string;
  category: ReportSectionCategory;
  signal: string;
  why: string;
  whatToDo: string;
  whatToBeCarefulAbout: string;
  calculatedData: string;
  traditionalInterpretation: string;
  aiExplanation: string;
  actionableGuidance: string;
  iconName: string;
  favorableRating: 'High' | 'Moderate' | 'Neutral' | 'Prudent';
}

export interface UserWellnessDiary {
  sensitivities: string[]; // Explicitly user-recorded allergies or personal sensitivities (e.g. 'Dust', 'Lactose', 'Migraine with screen strain')
  sleepTargetHours: number;
  hydrationTargetLiters: number;
  customNotes?: string;
  lastUpdated: string;
}

export interface DailyReportCardData {
  reportId: string;
  date: string; // YYYY-MM-DD
  generatedTimestamp: string;
  profile: BirthProfile;
  summaryScore: number; // 0 - 100 daily harmony index
  summaryHeadline: string;
  summaryHeadlineHindi: string;
  sections: {
    today_overview: DailyReportCardSection;
    jyotish_guidance: DailyReportCardSection;
    dasha_transit: DailyReportCardSection;
    numerology: DailyReportCardSection;
    lo_shu: DailyReportCardSection;
    panchatattva: DailyReportCardSection;
    wellness_safety: DailyReportCardSection;
    career: DailyReportCardSection;
    business: DailyReportCardSection;
    money: DailyReportCardSection;
    family: DailyReportCardSection;
    relationship_marriage: DailyReportCardSection;
    property: DailyReportCardSection;
    travel: DailyReportCardSection;
    education: DailyReportCardSection;
    spirituality: DailyReportCardSection;
    todays_caution: DailyReportCardSection;
    todays_karma: DailyReportCardSection;
    main_goal: DailyReportCardSection;
    evening_reflection: DailyReportCardSection;
    tomorrow_preparation: DailyReportCardSection;
  };
  prashnaReference: string | null;
  wellnessDiarySnapshot: UserWellnessDiary;
  userGoalNote?: string;
  userReflectionNote?: string;
  isSavedToJournal: boolean;
}

export interface MonthlyReportSummary {
  month: string; // YYYY-MM
  totalDaysRecorded: number;
  frequentThemes: string[];
  elementalHarmonyAverage: {
    earth: number;
    water: number;
    fire: number;
    air: number;
    space: number;
  };
  karmaActionsCompleted: number;
  dominantPersonalDayTrends: Record<number, number>;
  recordedGoals: { date: string; goal: string }[];
  recordedReflections: { date: string; reflection: string }[];
}

export const DEFAULT_USER_WELLNESS_DIARY: UserWellnessDiary = {
  sensitivities: [
    'Seasonal pollen sensitivity (Spring/Autumn)',
    'Eye fatigue with prolonged night screen work',
    'Sensitivity to irregular meal timings'
  ],
  sleepTargetHours: 7.5,
  hydrationTargetLiters: 2.5,
  customNotes: 'Prefer warm water in the morning and avoid excessive caffeine after 4 PM.',
  lastUpdated: new Date().toISOString()
};

export interface DailyTrendDataPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "14 Oct"
  healthScore: number; // 0 - 100
  reflectionScore: number; // 0 - 100
  karmaScore: number; // 0 - 100
  overallScore: number; // 0 - 100
  dominantElement: 'Earth' | 'Water' | 'Fire' | 'Air' | 'Space';
  karmaDone: boolean;
  hasJournalEntry: boolean;
  note?: string;
}

export interface DailyTrendSummary {
  averageHealthScore: number;
  averageReflectionScore: number;
  averageKarmaScore: number;
  averageOverallScore: number;
  highestAlignmentDate: string;
  highestScore: number;
  karmaConsistencyRate: number; // percentage (0 - 100)
  totalDaysEvaluated: number;
}

