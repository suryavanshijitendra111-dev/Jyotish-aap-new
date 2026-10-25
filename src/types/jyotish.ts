import { MasterKundliData } from './kundli';

export interface AspectData {
  sourcePlanet: string;
  targetHouse: number; // The target house number in D1
  targetSign: number;  // The target rashi
  targetPlanets: string[]; // Planets residing in the target house
  aspectType: number; // The visual aspect number (e.g., 7 for 7th house aspect)
  aspectStrength: string; // e.g., 'Full'
  sourceLongitude: number;
  ruleSource: string; // e.g., 'Parashari'
}

export interface ConjunctionPair {
  planet1: string;
  planet2: string;
  house: number; // D1 House
  sign: number;
  separationDegrees: number;
  exactLongitude1: number;
  exactLongitude2: number;
  ruleSource: string;
}

export interface DignityData {
  planet: string;
  sign: number;
  status: 'Exalted' | 'Debilitated' | 'OwnSign' | 'Friendly' | 'Enemy' | 'Neutral' | 'None';
  ruleSource: string;
}

export interface JyotishRelationships {
  parashari: {
    aspects: AspectData[];
    conjunctions: ConjunctionPair[];
    dignities: DignityData[];
  };
  jaimini: any | null; // Prepared interface
  kp: any | null;      // Prepared interface
  lalKitab: any | null; // Prepared interface
}
