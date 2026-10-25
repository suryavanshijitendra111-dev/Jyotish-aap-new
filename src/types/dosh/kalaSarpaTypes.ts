/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — KALA SARPA TRADITION (कालसर्प परंपरा)
 * PHASE 1.13C-2: TYPE DEFINITIONS
 * 
 * Strongly-typed contracts for deterministic Kala Sarpa Tradition analysis,
 * exact planetary longitude containment, candidate arc metrics, and diagnostic reporting.
 * 
 * STRICT INVARIANTS:
 * - Kala Sarpa is labeled strictly as LATER / PRACTITIONER TRADITION.
 * - Never labeled as universal Parashari Vedic dosha.
 * - Containment is strictly geometric; zero artificial severity scoring.
 */

export type KalaSarpaStatus = 'PRESENT' | 'NOT_PRESENT' | 'INSUFFICIENT_DATA';

export type KalaSarpaClassification =
  | 'PURNA'
  | 'PARTIAL_CONTAINMENT'
  | 'NOT_DETECTED'
  | 'BOUNDARY_CASE';

export type NodalBoundaryNode = 'RAHU' | 'KETU';

export interface BoundaryPlanetDetail {
  planet: string;
  longitude: number;
  boundaryNode: NodalBoundaryNode;
  nodeLongitude: number;
  exactBoundary: boolean;
}

export interface PhysicalPlanetPosition {
  name: string;
  longitude: number;
  rashi: number;
  d1House: number;
}

export interface CandidateArcResult {
  arcId: 'ARC_A_RAHU_TO_KETU' | 'ARC_B_KETU_TO_RAHU';
  startNode: NodalBoundaryNode;
  endNode: NodalBoundaryNode;
  startLongitude: number;
  endLongitude: number;
  arcSpanDegrees: number;
  containedPlanets: string[];
  outsidePlanets: string[];
  boundaryPlanets: BoundaryPlanetDetail[];
  allSevenContained: boolean;
  result: 'CONTAINED' | 'FAILED' | 'BOUNDARY_DEGENERATE';
}

export interface ContainmentDiagnostics {
  planetsInsideArcA: string[];
  planetsOutsideArcA: string[];
  planetsInsideArcB: string[];
  planetsOutsideArcB: string[];
  boundaryPlanets: BoundaryPlanetDetail[];
  candidateArcResults: {
    arcA: CandidateArcResult;
    arcB: CandidateArcResult;
  };
  hasPartialContainment: boolean;
  partialDescription: string;
}

export interface Traditional12Form {
  formId: string;
  name: string;
  nameHindi: string;
  rahuHouse: number;
  ketuHouse: number;
  significanceHindi: string;
  tradition: string;
  sourceStatus: 'LATER_TRADITION';
}

export interface KalaSarpaAnalysisResult {
  doshaId: 'KALA_SARPA_TRADITION';
  status: KalaSarpaStatus;
  classification: KalaSarpaClassification;
  tradition: string;
  sourceStatus: 'LATER_TRADITION';
  rahuLongitude: number | null;
  ketuLongitude: number | null;
  arcA: CandidateArcResult | null;
  arcB: CandidateArcResult | null;
  physicalPlanetPositions: PhysicalPlanetPosition[];
  containmentDiagnostics: ContainmentDiagnostics;
  boundaryPlanets: BoundaryPlanetDetail[];
  rahuHouseIfAvailable: number | null;
  traditionalFormIfAvailable: Traditional12Form | null;
  activeContainedArc: 'ARC_A_RAHU_TO_KETU' | 'ARC_B_KETU_TO_RAHU' | null;
  ruleLineage: {
    ruleType: 'KALA_SARPA_TRADITION';
    tradition: string;
    calculationBasis: string;
    classicalStatus: 'LATER / PRACTITIONER TRADITION';
  };
  calculatedFacts: {
    rahuLongitude: number | null;
    ketuLongitude: number | null;
    nodalSpanArcA: number | null;
    nodalSpanArcB: number | null;
    physicalPlanetsEvaluated: string[];
  };
  disclaimer: {
    en: string;
    hi: string;
  };
}
