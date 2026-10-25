export interface Evidence {
  factor: string;
  value: string | number;
}

export interface YogaResult {
  id: string;
  name: string;
  category: string;
  status: boolean;
  planetsInvolved: string[];
  housesInvolved: number[];
  signsInvolved: number[];
  conditions: string[];
  satisfiedConditions: string[];
  failedConditions: string[];
  strength: string;
  calculationSource: string;
  explanationKey: string;
}

export interface ParashariAspectData {
  aspectingPlanet: string;
  aspectedHouse: number;
  aspectType: 'Full' | 'Special';
  aspectValue: number; // e.g. 7 for full, 5/9 for special
}

export interface ParashariPlanetData {
  name: string;
  house: number;
  rashi: number;
  rashiName: string;
  dignity: 'Own Sign' | 'Exalted' | 'Debilitated' | 'Neutral/Other';
  conjunctions: string[];
  aspectsGiven: ParashariAspectData[];
  aspectsReceived: ParashariAspectData[];
}

export interface ParashariHouseData {
  houseNumber: number;
  rashi: number;
  rashiName: string;
  signLord: string;
  isKendra: boolean;
  isTrikona: boolean;
  isDusthana: boolean;
  planetsOccupying: string[];
}

export interface ParashariFoundationResult {
  houses: Record<number, ParashariHouseData>;
  planets: Record<string, ParashariPlanetData>;
}

export interface ParashariInterpretation {
  system: "Parashari";
  rule: string;
  planet?: string;
  house?: number;
  sign?: string | number;
  evidence: Evidence[];
  confidence: "traditional";
  interpretation: string;
}

export interface HouseAnalysisResult {
  houseNumber: number;
  sign: number;
  signLord: string;
  occupants: string[];
  aspectsReceived: string[]; // Planets aspecting this house
  houseLordPlacement: {
    house: number;
    sign: number;
    state: string; // Exalted, Debilitated, OwnSign, etc.
  };
}

export interface ParashariEngineResult {
  foundation: ParashariFoundationResult;
  dignities: Record<string, string>;
  functionalNatures: Record<string, 'Benefic' | 'Malefic' | 'Neutral'>;
  houseAnalysis: Record<number, HouseAnalysisResult>;
  yogas: YogaResult[];
  interpretations: ParashariInterpretation[];
}
