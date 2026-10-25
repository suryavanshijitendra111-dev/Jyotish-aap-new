import { YogaResult } from './yoga';
import { PlanetData, VedicHouse, MasterKundliData } from './kundli';

export interface AuditResult {
  ruleId: string;
  system: string;
  input: string;
  conditions: { name: string; passed: boolean }[];
  result: string;
  engineVersion: string;
  masterDataVersion: string;
  isVerified: boolean;
}

export interface AspectAnalysis {
  sourcePlanet: string;
  targetHouse: number;
  targetPlanets: string[];
  aspectType: number; // 7th, 4th, 8th etc.
  ruleId: string;
  system: string;
}

export interface ConjunctionAnalysis {
  planetA: string;
  planetB: string;
  house: number;
  rashi: number;
  degreeSeparation: number;
  ruleId: string;
}

export interface RelationshipStatus {
  planet: string;
  status: string;
}

export interface PlanetAnalysisData {
  planet: string;
  tropicalLongitude: number | null;
  siderealLongitude: number | null;
  degree: number | null;
  minutes: number | null;
  seconds: number | null;
  rashi: number | null;
  rashiName: string | null;
  rashiLord: string;
  house: number | null;
  nakshatra: number | null;
  nakshatraName: string;
  nakshatraLord: string;
  nakshatraStartDeg: number | null;
  nakshatraEndDeg: number | null;
  nakshatraProgressPercent: number | null;
  pada: number | null;
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: string;
  ownSign: boolean;
  exalted: boolean;
  debilitated: boolean;
  vargottama: boolean;
  conjunctions: ConjunctionAnalysis[];
  aspectsGiven: AspectAnalysis[];
  aspectsReceived: AspectAnalysis[];
  naturalRelationships: RelationshipStatus[];
  temporaryRelationships: RelationshipStatus[];
  compoundRelationships: RelationshipStatus[];
  currentMahadasha: string | null;
  currentAntardasha: string | null;
  calculationSource: string;
  audit: AuditResult;
}

export interface HouseAnalysisData {
  houseNumber: number;
  rashi: number;
  rashiName: string;
  rashiLord: string;
  occupyingPlanets: string[];
  aspectsReceived: AspectAnalysis[];
  calculatedMarkers: string[];
  audit: AuditResult;
}

export interface ChartAnalysisResult {
  planets: Record<string, PlanetAnalysisData>;
  houses: Record<number, HouseAnalysisData>;
  aspects: AspectAnalysis[];
  conjunctions: ConjunctionAnalysis[];
  yogas: YogaResult[];
}
