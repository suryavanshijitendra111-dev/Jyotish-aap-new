import { KPJudgmentOutcome, KPYesNoOutcome, KPQuestionCategory } from './kpJudgment';

export type KPResultType =
  | 'SUPPORTIVE'
  | 'MIXED_CONDITIONAL'
  | 'CHALLENGING_DELAY'
  | 'INSUFFICIENT_DATA';

export type KPOverallStrength =
  | 'STRONG'
  | 'MODERATE'
  | 'MIXED'
  | 'WEAK'
  | 'INSUFFICIENT';

export interface KPLocalizedText {
  en: string;
  hi: string;
}

export interface KPIntFactor {
  title: KPLocalizedText;
  description: KPLocalizedText;
  planets?: string[];
  houses?: number[];
}

export interface KPKeyHouseInterpretation {
  house: number;
  role: 'PRIMARY' | 'SUPPORTING' | 'ADVERSE' | 'CONTEXTUAL';
  meaning: KPLocalizedText;
  status: KPLocalizedText;
}

export interface KPCuspInterpretation {
  cusp: number;
  subLord: string;
  subLordSignifies: number[];
  interpretation: KPLocalizedText;
}

export interface KPRulingPlanetInterpretation {
  rps: string[];
  agreementLevel: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
  interpretation: KPLocalizedText;
}

export interface KPDeepInterpretationResult {
  id: string;
  timestamp: string;
  question: string;
  category: KPQuestionCategory;
  categoryLabel: KPLocalizedText;
  questionSummary: KPLocalizedText;
  directAnswer: KPLocalizedText;
  resultType: KPResultType;
  overallStrength: KPOverallStrength;
  overallStrengthLabel: KPLocalizedText;
  harmonyScore: number; // Internal indicator harmony score (0-100)
  supportiveFactors: KPIntFactor[];
  obstacleFactors: KPIntFactor[];
  mixedFactors: KPIntFactor[];
  keyHouseInterpretations: KPKeyHouseInterpretation[];
  cuspInterpretation: KPCuspInterpretation;
  rulingPlanetInterpretation: KPRulingPlanetInterpretation;
  contradictionAnalysis: KPLocalizedText;
  practicalGuidance: KPLocalizedText[];
  uncertaintyNote: KPLocalizedText;
  safetyNote?: KPLocalizedText;
  calculationEvidenceReference: {
    targetHouses: number[];
    supportingHouses: number[];
    adverseHouses: number[];
    primaryCusp: number;
    primaryCuspSubLord: string;
    subLordSignifies: number[];
    positivePlanets: string[];
    challengingPlanets: string[];
    primaryRPs: string[];
    confidenceScore: number;
    outcome: KPJudgmentOutcome;
    yesNoOutcome: KPYesNoOutcome;
  };
}
