/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
  | 'window_past'
  | 'window_present'
  | 'window_future'
  | 'main_gate'
  | 'exit_gate';

export type TrikalaWindowId = 'window_past' | 'window_present' | 'window_future';

export type SpatialMode = 'EXTERIOR' | 'INTERIOR' | 'CHAMBER';

export type SpatialZone = 'EXTERIOR_WORLD' | 'THRESHOLD_TRANSITION' | 'INTERIOR_WORLD' | 'CHAMBER_WORLD';

export type HousePortalType = 'ENTRY' | 'EXIT' | 'CHAMBER';

export interface HousePortal {
  id: string;
  type: HousePortalType;
  position: [number, number, number];
  direction: [number, number, number];
  width: number;
  height: number;
  targetMode: SpatialMode;
}

export interface ChamberDefinition {
  id: ChamberId;
  houseNumber?: number; // 1-12 for Bhavas
  wingId?: 'north_wing' | 'east_wing' | 'south_wing' | 'west_wing' | 'central';
  wingName?: string;
  wingNameHindi?: string;
  sanskritName: string;
  englishTitle: string;
  hindiTitle: string;
  signification: string;
  targetView: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  color: string;
  iconName: string;
  accentPlanets?: string[];
  subModules?: { title: string; view: string }[];
}

export type EntryStep =
  | 'dark'
  | 'ambient_sound'
  | 'house_emerge'
  | 'lamps_light'
  | 'doors_open'
  | 'camera_glide'
  | 'courtyard_active'
  | 'completed';

export type CameraPreset =
  | 'EXTERIOR_OVERVIEW'
  | 'EXTERIOR_ENTRY'
  | 'INTERIOR_ENTRY'
  | 'INTERIOR_COURTYARD'
  | 'INTERIOR_MANDALA'
  | 'INTERIOR_CHAMBER'
  | 'INTERIOR_EXIT_APPROACH'
  | 'overview'
  | 'exterior_overview'
  | 'entrance'
  | 'courtyard'
  | 'mandala'
  | 'chamber_focus'
  | 'window_past'
  | 'window_present'
  | 'window_future'
  | 'exit_gate';

export interface HouseSettings {
  soundEnabled: boolean;
  volume: number;
  graphicsQuality: 'high' | 'medium';
  autoRotate: boolean;
  reducedMotion?: boolean;
}
