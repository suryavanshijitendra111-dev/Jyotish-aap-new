/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — DIGITAL HOUSE 3D SPATIAL DATA CONTRACTS
 */

export type ChamberId = 
  | 'courtyard' 
  | 'chamber_1' 
  | 'chamber_2' 
  | 'chamber_3' 
  | 'chamber_4' 
  | 'chamber_5' 
  | 'chamber_6' 
  | 'chamber_7' 
  | 'chamber_8' 
  | 'chamber_9' 
  | 'chamber_10' 
  | 'chamber_11' 
  | 'chamber_12' 
  | 'guardian_sanctum' 
  | string;

export type EntryStep = 'gate' | 'pathway' | 'portal' | 'threshold' | 'inside' | string;

export type CameraPreset = 'overview' | 'courtyard' | 'chamber' | 'drishti' | 'cinematic' | string;

export type TrikalaWindowId = 'PAST' | 'PRESENT' | 'FUTURE' | string;

export type SpatialZone = 'courtyard' | 'north' | 'east' | 'south' | 'west' | 'sanctum' | string;

export type SpatialMode = '2D' | '3D' | 'HUD' | 'WALKTHROUGH' | string;

export interface SubModuleRef {
  title: string;
  view: string;
}

export interface ChamberDefinition {
  id: ChamberId;
  houseNumber?: number;
  wingId: string;
  wingName: string;
  wingNameHindi: string;
  sanskritName: string;
  englishTitle: string;
  hindiTitle: string;
  signification: string;
  targetView?: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  color: string;
  iconName: string;
  subModules?: SubModuleRef[];
  residentPlanets?: string[];
  signLord?: string;
  rashi?: number;
  rashiName?: string;
  [key: string]: any;
}

export interface HousePortal {
  id: string;
  sourceChamber: ChamberId;
  targetChamber: ChamberId;
  label: string;
  labelHindi: string;
  [key: string]: any;
}
