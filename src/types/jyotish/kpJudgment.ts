import { KPPlanetData, KPCuspData, KPPlanetSignificator, KPHouseSignificator, KPRulingPlanets, KPAnalysisResult } from '../../services/jyotish/kpEngine';

export type KPQuestionCategory =
  | 'career_job'
  | 'business'
  | 'marriage'
  | 'relationship'
  | 'education_exam'
  | 'property'
  | 'vehicle'
  | 'finance_income'
  | 'children'
  | 'travel'
  | 'legal_matter'
  | 'partnership'
  | 'lost_item'
  | 'general_yes_no'
  | 'other';

export interface KPQuestionInput {
  question: string;
  category: KPQuestionCategory;
  questionDate: string; // YYYY-MM-DD
  questionTime: string; // HH:mm
  questionLocation: string;
}

export interface KPEventHouseMapping {
  category: KPQuestionCategory;
  labelEn: string;
  labelHi: string;
  targetHouses: number[];      // Primary houses of event fructification
  supportingHouses: number[];  // Supporting / Contextual houses
  adverseHouses: number[];     // Houses indicating obstruction or negation
  primaryCusp: number;         // Key cusp for sub lord examination (e.g. 10 for job, 7 for marriage)
  descriptionEn: string;
  descriptionHi: string;
}

export interface KPPlanetSignificatorEvidence {
  planet: string;
  levelA: number[];
  levelB: number[];
  levelC: number[];
  levelD: number[];
  allSignifiedHouses: number[];
  signifiedTargetHouses: number[];
  signifiedSupportingHouses: number[];
  signifiedAdverseHouses: number[];
  isRulingPlanet: boolean;
  rulingPlanetRole?: string;
  isRetrograde: boolean;
  isStarLordRetrograde: boolean;
  starLord: string;
  supportLevel: 'STRONG_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'CHALLENGING';
  score: number;
}

export interface KPRulingPlanetSupport {
  primaryRPList: string[];
  allRPList: string[];
  matchingPlanets: string[]; // Planets that signify target houses AND are in RP list
  overlapHouses: number[];   // Target houses touched by Ruling Planets
  supportDegree: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';
  retrogradeWarnings: string[];
  explanation: {
    en: string;
    hi: string;
  };
}

export interface KPCuspSubLordEvidence {
  house: number;
  subLord: string;
  subLordStarLord: string;
  subLordSignifies: number[];
  isFavourable: boolean;
  isNeutral: boolean;
  signifiesTarget: boolean;
  signifiesAdverse: boolean;
  summary: {
    en: string;
    hi: string;
  };
}

export type KPJudgmentOutcome =
  | 'FAVOURABLE'
  | 'MODERATE_MIXED'
  | 'CHALLENGING'
  | 'INSUFFICIENT_DATA';

export type KPYesNoOutcome =
  | 'YES'
  | 'MIXED_CONDITIONAL'
  | 'NO'
  | 'INSUFFICIENT_DATA';

export interface KPJudgmentOutput {
  id: string;
  timestamp: string;
  question: string;
  category: KPQuestionCategory;
  categoryLabel: {
    en: string;
    hi: string;
  };
  targetHouses: number[];
  supportingHouses: number[];
  adverseHouses: number[];
  primaryCusp: number;
  primaryCuspSubLord?: KPCuspSubLordEvidence;
  outcome: KPJudgmentOutcome;
  yesNoOutcome: KPYesNoOutcome;
  confidenceScore: number; // 0 to 100
  relevantPlanets: string[];
  positivePlanets: string[];
  challengingPlanets: string[];
  significatorEvidence: KPPlanetSignificatorEvidence[];
  rulingPlanetSupport: KPRulingPlanetSupport;
  reasons: {
    en: string[];
    hi: string[];
  };
  traditionalNote: {
    en: string;
    hi: string;
  };
  disclaimer: {
    en: string;
    hi: string;
  };
  timingPlaceholder: {
    en: string;
    hi: string;
  };
}

/**
 * 15 Standard Deterministic KP Question House Mappings
 * Stored as transparent, explicit rules per Krishnamurti Paddhati principles.
 */
export const KP_EVENT_HOUSE_MAPPINGS: Record<KPQuestionCategory, KPEventHouseMapping> = {
  career_job: {
    category: 'career_job',
    labelEn: 'Career / Job',
    labelHi: 'नौकरी / आजीविका',
    targetHouses: [2, 6, 10, 11],
    supportingHouses: [1, 3],
    adverseHouses: [5, 9, 12], // 5 is 8th from 10, 9 is 12th from 10 (change/leaving)
    primaryCusp: 10,
    descriptionEn: 'Evaluates 2nd (wealth), 6th (service/employment), 10th (profession/status), and 11th (gain/fulfillment).',
    descriptionHi: 'द्वितीय (धन), षष्ठ (सेवा/नौकरी), दशम (कर्म/पद) एवं एकादश (लाभ/सफलता) भावों का विश्लेषण।'
  },
  business: {
    category: 'business',
    labelEn: 'Business',
    labelHi: 'व्यापार / व्यवसाय',
    targetHouses: [2, 7, 10, 11],
    supportingHouses: [3, 9],
    adverseHouses: [5, 6, 12], // 6 is 12th from 7, loss in business / competition
    primaryCusp: 7,
    descriptionEn: 'Evaluates 2nd (capital), 7th (clients/trade), 10th (commercial activity), and 11th (profit).',
    descriptionHi: 'द्वितीय (पूंजी), सप्तम (ग्राहक/व्यापार), दशम (वाणिज्यिक स्थिति) एवं एकादश (मुनाफा/सिद्धि) भाव।'
  },
  marriage: {
    category: 'marriage',
    labelEn: 'Marriage',
    labelHi: 'विवाह',
    targetHouses: [2, 7, 11],
    supportingHouses: [5], // love/affection
    adverseHouses: [1, 6, 10, 12], // 6 is 12th from 7, 10 is 12th from 11, 1 is 12th from 2
    primaryCusp: 7,
    descriptionEn: 'Evaluates 2nd (family expansion), 7th (spouse/matrimonial union), and 11th (permanent bonding/fulfillment).',
    descriptionHi: 'द्वितीय (कुटुंब विस्तार), सप्तम (जीवनसाथी/विवाह बंधन) एवं एकादश (स्थायी मित्रता व अभीष्ट सिद्धि) भाव।'
  },
  relationship: {
    category: 'relationship',
    labelEn: 'Relationship',
    labelHi: 'प्रेम सम्बंध',
    targetHouses: [5, 7, 11],
    supportingHouses: [2, 3],
    adverseHouses: [6, 12],
    primaryCusp: 5,
    descriptionEn: 'Evaluates 5th (romance/attraction), 7th (partnership), and 11th (fulfillment of desire).',
    descriptionHi: 'पंचम (प्रणय/अनुराग), सप्तम (साझेदारी) एवं एकादश (मनोकामना पूर्ति) भाव।'
  },
  education_exam: {
    category: 'education_exam',
    labelEn: 'Education / Exam',
    labelHi: 'शिक्षा / परीक्षा',
    targetHouses: [4, 5, 9, 11],
    supportingHouses: [2, 6], // 6 is competitive success
    adverseHouses: [3, 8], // 3 is 12th from 4, 8 is break/distraction
    primaryCusp: 4,
    descriptionEn: 'Evaluates 4th (formal education), 5th (intelligence/memory), 9th (higher studies), and 11th (success).',
    descriptionHi: 'चतुर्थ (विद्या/ज्ञान), पंचम (बुद्धि/मेधा), नवम (उच्च शिक्षा) एवं एकादश (सफलता) भाव।'
  },
  property: {
    category: 'property',
    labelEn: 'Property',
    labelHi: 'भूमि / संपत्ति / गृह',
    targetHouses: [4, 11],
    supportingHouses: [2, 8], // 2 is finance, 8 is estate/inheritance/debt-financing
    adverseHouses: [3, 12], // 3 is sale/leaving, 12 is expenditure/loss
    primaryCusp: 4,
    descriptionEn: 'Evaluates 4th (immovable property/home) and 11th (acquisition) with 2nd and 8th as supporting indicators.',
    descriptionHi: 'चतुर्थ (स्थावर संपत्ति/भवन) व एकादश (प्राप्ति), साथ ही द्वितीय (धन) व अष्टम (पैतृक/ऋण) भाव।'
  },
  vehicle: {
    category: 'vehicle',
    labelEn: 'Vehicle',
    labelHi: 'वाहन',
    targetHouses: [4, 11],
    supportingHouses: [2],
    adverseHouses: [3, 12],
    primaryCusp: 4,
    descriptionEn: 'Evaluates 4th (vehicles/conveyance) and 11th (gain/possession) supported by 2nd house.',
    descriptionHi: 'चतुर्थ (वाहन सुख) एवं एकादश (प्राप्ति/लाभ) भाव।'
  },
  finance_income: {
    category: 'finance_income',
    labelEn: 'Finance / Income',
    labelHi: 'धन / आय',
    targetHouses: [2, 6, 10, 11],
    supportingHouses: [1, 5],
    adverseHouses: [8, 12], // 12 is expenditure/loss, 8 is unearned/obstacles
    primaryCusp: 2,
    descriptionEn: 'Evaluates 2nd (wealth/savings), 6th (income from work), 10th (status), and 11th (large gains).',
    descriptionHi: 'द्वितीय (संचित धन), षष्ठ (आय/प्राप्ति), दशम (आजीविका) एवं एकादश (प्रचुर लाभ) भाव।'
  },
  children: {
    category: 'children',
    labelEn: 'Children',
    labelHi: 'संतान',
    targetHouses: [2, 5, 11],
    supportingHouses: [9],
    adverseHouses: [1, 4, 10, 12], // 4 is 12th from 5, 10 is 12th from 11
    primaryCusp: 5,
    descriptionEn: 'Evaluates 2nd (family growth), 5th (conception/progeny), and 11th (fulfillment of desire).',
    descriptionHi: 'द्वितीय (वंश वृद्धि), पंचम (संतान/गर्भ) एवं एकादश (सफलता/सिद्धि) भाव।'
  },
  travel: {
    category: 'travel',
    labelEn: 'Travel / Foreign',
    labelHi: 'यात्रा / विदेश',
    targetHouses: [3, 9, 12],
    supportingHouses: [11],
    adverseHouses: [2, 4], // 4 represents staying at own home/country
    primaryCusp: 9,
    descriptionEn: 'Evaluates 3rd (short journeys), 9th (long journeys/pilgrimage), and 12th (foreign land/relocation).',
    descriptionHi: 'तृतीय (लघु यात्रा), नवम (दीर्घ/तीर्थ यात्रा) एवं द्वादश (विदेश वास/सुदूर यात्रा) भाव।'
  },
  legal_matter: {
    category: 'legal_matter',
    labelEn: 'Legal Matter',
    labelHi: 'मुकदमा / कानूनी विवाद',
    targetHouses: [6, 7, 11],
    supportingHouses: [1, 3],
    adverseHouses: [12], // 12 is opposition success / defeat for querent
    primaryCusp: 6,
    descriptionEn: 'Evaluates 6th (litigation/victory over enemies), 7th (opponent/court), and 11th (success/favourable decree) with 12th as opposition indicator.',
    descriptionHi: 'षष्ठ (मुकदमा/शत्रु विजय), सप्तम (प्रतिवादी) एवं एकादश (विजयी फैसला) भाव।'
  },
  partnership: {
    category: 'partnership',
    labelEn: 'Partnership',
    labelHi: 'साझेदारी',
    targetHouses: [7, 2, 11],
    supportingHouses: [3, 5],
    adverseHouses: [6, 12], // 6 is disputes with partner, 12 is loss
    primaryCusp: 7,
    descriptionEn: 'Evaluates 7th (partner/contract), 2nd (joint finances), and 11th (profitable agreement).',
    descriptionHi: 'सप्तम (साझेदार/अनुबंध), द्वितीय (साझा धन) एवं एकादश (लाभकारी सम्बंध) भाव।'
  },
  lost_item: {
    category: 'lost_item',
    labelEn: 'Lost Item',
    labelHi: 'खोई हुई वस्तु',
    targetHouses: [2, 4, 11],
    supportingHouses: [1, 6],
    adverseHouses: [12], // 12 is permanent loss/theft beyond recovery
    primaryCusp: 2,
    descriptionEn: 'Evaluates 2nd (movable assets/possession), 4th (recovery at home/fixed location), and 11th (recovery) with 12th indicating loss.',
    descriptionHi: 'द्वितीय (द्रव्य/वस्तु अधिकार), चतुर्थ (निवास स्थल पर मिलना) एवं एकादश (पुनः प्राप्ति) भाव।'
  },
  general_yes_no: {
    category: 'general_yes_no',
    labelEn: 'General Yes / No',
    labelHi: 'सामान्य हाँ / नहीं',
    targetHouses: [1, 11],
    supportingHouses: [2, 3],
    adverseHouses: [12],
    primaryCusp: 11,
    descriptionEn: 'Evaluates 11th (fulfillment of question/desire) and 1st (querent vitality and success).',
    descriptionHi: 'एकादश (इच्छा सिद्धि/कार्य पूर्ति) एवं प्रथम (प्रश्नोत्सुक की अनुकूलता) भाव।'
  },
  other: {
    category: 'other',
    labelEn: 'Other Subject',
    labelHi: 'अन्य विषय',
    targetHouses: [1, 11],
    supportingHouses: [2],
    adverseHouses: [12],
    primaryCusp: 11,
    descriptionEn: 'Evaluates 1st (self) and 11th (fulfillment of ambition/resolution of matter).',
    descriptionHi: 'प्रथम (स्वयं) एवं एकादश (इच्छा पूर्ति) भाव।'
  }
};
