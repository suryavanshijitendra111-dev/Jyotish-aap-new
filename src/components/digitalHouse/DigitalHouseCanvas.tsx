/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ChamberId, EntryStep, CameraPreset, SpatialZone, TrikalaWindowId } from '../../types/digitalHouse';
import { 
  CHAMBER_DEFINITIONS, 
  extractHouseResidents,
  extractBhavaAstroViewModels,
  BhavaAstroViewModel,
  PlanetAstroViewModel,
  RASHI_DATA,
  PLANET_META
} from '../../services/digitalHouse/houseDataContract';
import { MasterKundliData } from '../../types/kundli';
import { houseAudioService } from '../../services/digitalHouse/audioService';
import { getCurrentLanguage } from '../../i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CanvasHitboxItem {
  id: string;
  mesh: THREE.Mesh;
  isPlanet?: boolean;
  planetName?: string;
  chamberId?: ChamberId;
}

interface DigitalHouseCanvasProps {
  entryStep: EntryStep;
  spatialZone: SpatialZone;
  masterData: MasterKundliData | null;
  activeChamberId: ChamberId | null;
  cameraPreset?: CameraPreset;
  onSelectChamber: (id: ChamberId) => void;
  soundEnabled: boolean;
  onCameraPresetChange?: (preset: CameraPreset) => void;
  onEnterPalace?: () => void;
  onExitPalace?: () => void;
  thresholdDirection?: 'entering' | 'exiting' | null;
  kundliDrishtiMode?: boolean;
  onSelectPlanet?: (planetName: string, chamberId: ChamberId) => void;
  selectedPlanetName?: string | null;
  isPlanetSpeaking?: boolean;
}

// Architectural placement angles for the 12 Astrological Bhavas
// Carefully spaced around perimeter wings, leaving the South Gateway at 90° completely open
const getChamberAngle = (houseNumber: number): number => {
  switch (houseNumber) {
    case 1: return -Math.PI * 0.5;   // -90° (North - Tanu / Lagna)
    case 2: return -Math.PI * 0.333; // -60° (North-East - Dhana)
    case 3: return -Math.PI * 0.167; // -30° (East-North-East - Sahaja)
    case 4: return 0;                // 0°   (East - Sukha)
    case 5: return Math.PI * 0.133;  // 24°  (East-South-East - Putra)
    case 6: return Math.PI * 0.267;  // 48°  (South-East - Ari / Health)
    case 7: return Math.PI * 0.38;   // 68.4° (South Wing, East of South Gate - Jaya / Partnership)
    // South Gate sits at Math.PI * 0.5 (90° / South Center)
    case 8: return Math.PI * 0.62;   // 111.6° (South Wing, West of South Gate - Randhra / Secret)
    case 9: return Math.PI * 0.75;   // 135° (South-West - Dharma)
    case 10: return Math.PI;         // 180° (West - Karma)
    case 11: return Math.PI * 1.167; // 210° (West-North-West - Labha)
    case 12: return Math.PI * 1.333; // 240° (North-West - Vyaya)
    default: return 0;
  }
};

export const getFacingBhavaNumber = (camX: number, camZ: number): number => {
  const facingAngle = Math.atan2(camZ, camX);
  let bestHouse = 1;
  let minDiff = Infinity;
  for (let h = 1; h <= 12; h++) {
    const ang = getChamberAngle(h);
    let diff = Math.abs(facingAngle - ang);
    while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
    if (diff < minDiff) {
      minDiff = diff;
      bestHouse = h;
    }
  }
  return bestHouse;
};

export interface OrbitStationItem {
  id: string;
  type: 'bhava' | 'trikala';
  bhavaNum?: number;
  trikalaId?: TrikalaWindowId;
  label: string;
  title: string;
  subtitle: string;
  angle: number;
}

export const ORBIT_STATIONS: OrbitStationItem[] = [
  { id: 'bhava_1', type: 'bhava', bhavaNum: 1, label: '1', title: 'भाव 1', subtitle: 'लग्न एवं आत्म कक्ष', angle: getChamberAngle(1) },
  { id: 'bhava_2', type: 'bhava', bhavaNum: 2, label: '2', title: 'भाव 2', subtitle: 'धन, वाणी एवं कुटुंब कक्ष', angle: getChamberAngle(2) },
  { id: 'bhava_3', type: 'bhava', bhavaNum: 3, label: '3', title: 'भाव 3', subtitle: 'पराक्रम एवं सहोदर कक्ष', angle: getChamberAngle(3) },
  { id: 'bhava_4', type: 'bhava', bhavaNum: 4, label: '4', title: 'भाव 4', subtitle: 'मातृ, गृह एवं सुख कक्ष', angle: getChamberAngle(4) },
  { id: 'bhava_5', type: 'bhava', bhavaNum: 5, label: '5', title: 'भाव 5', subtitle: 'बुद्धि, ज्ञान एवं पूर्वपुण्य कक्ष', angle: getChamberAngle(5) },
  { id: 'bhava_6', type: 'bhava', bhavaNum: 6, label: '6', title: 'भाव 6', subtitle: 'रोग, ऋण एवं शत्रु कक्ष', angle: getChamberAngle(6) },
  { id: 'bhava_7', type: 'bhava', bhavaNum: 7, label: '7', title: 'भाव 7', subtitle: 'कलत्र, साझेदारी एवं व्यापार कक्ष', angle: getChamberAngle(7) },
  { id: 'bhava_8', type: 'bhava', bhavaNum: 8, label: '8', title: 'भाव 8', subtitle: 'आयु, गुप्त ज्ञान एवं परिवर्तन कक्ष', angle: getChamberAngle(8) },
  { id: 'bhava_9', type: 'bhava', bhavaNum: 9, label: '9', title: 'भाव 9', subtitle: 'धर्म, भाग्य एवं गुरु कक्ष', angle: getChamberAngle(9) },
  { id: 'bhava_10', type: 'bhava', bhavaNum: 10, label: '10', title: 'भाव 10', subtitle: 'कर्म, प्रतिष्ठा एवं अधिकार कक्ष', angle: getChamberAngle(10) },
  { id: 'bhava_11', type: 'bhava', bhavaNum: 11, label: '11', title: 'भाव 11', subtitle: 'आय, सिद्धि एवं अभीष्ट लाभ कक्ष', angle: getChamberAngle(11) },
  { id: 'bhava_12', type: 'bhava', bhavaNum: 12, label: '12', title: 'भाव 12', subtitle: 'मोक्ष, एकांत एवं परमसत्य कक्ष', angle: getChamberAngle(12) },
  { id: 'window_past', type: 'trikala', trikalaId: 'window_past', label: 'अतीत', title: 'अतीत', subtitle: 'पूर्व जीवन • जीवन के बीते चरण', angle: Math.PI * (157.5 / 180) },
  { id: 'window_present', type: 'trikala', trikalaId: 'window_present', label: 'वर्तमान', title: 'वर्तमान', subtitle: 'आज के संकेत • वर्तमान जीवन', angle: -Math.PI * (75.0 / 180) },
  { id: 'window_future', type: 'trikala', trikalaId: 'window_future', label: 'भविष्य', title: 'भविष्य', subtitle: 'समय-खिड़कियाँ • आगे के संकेत', angle: Math.PI * (36.0 / 180) }
];

/**
 * Phase 4.7 Safe Patch 3: Deterministic Non-Overlapping Planet Positioning inside Chamber
 * Keeps all vigrahas/orbs strictly inside room boundaries (X: [-0.95, +0.95], Z: [-0.75, +0.65])
 * avoiding z-fighting, wall collision, and obscuring the rear wall plaque.
 */
export const getPlanetPositionInChamber = (pIdx: number, totalCount: number): { x: number; z: number } => {
  if (totalCount <= 1) {
    // 1 planet: Center
    return { x: 0, z: -0.15 };
  }
  if (totalCount === 2) {
    // 2 planets: Left + Right
    return {
      x: pIdx === 0 ? -0.42 : 0.42,
      z: -0.15
    };
  }
  if (totalCount === 3) {
    // 3 planets: Triangle arrangement (apex centered rear, base left & right front)
    if (pIdx === 0) return { x: 0, z: -0.38 };
    if (pIdx === 1) return { x: -0.44, z: 0.10 };
    return { x: 0.44, z: 0.10 };
  }
  if (totalCount === 4) {
    // 4 planets: 2x2 balanced grid
    const row = Math.floor(pIdx / 2); // 0 = rear (-0.36), 1 = front (0.12)
    const col = pIdx % 2;            // 0 = left (-0.42), 1 = right (0.42)
    return {
      x: col === 0 ? -0.42 : 0.42,
      z: row === 0 ? -0.36 : 0.12
    };
  }
  // 5+ planets: dual-row radial/grid arrangement
  const rearCount = Math.min(3, Math.ceil(totalCount / 2));
  const isRear = pIdx < rearCount;
  if (isRear) {
    const spacing = 0.88 / Math.max(1, rearCount - 1);
    const x = rearCount === 1 ? 0 : -0.44 + pIdx * spacing;
    return { x, z: -0.36 };
  } else {
    const frontIdx = pIdx - rearCount;
    const frontCount = totalCount - rearCount;
    const spacing = 0.88 / Math.max(1, frontCount - 1);
    const x = frontCount === 1 ? 0 : -0.44 + frontIdx * spacing;
    return { x, z: 0.12 };
  }
};

/**
 * Disposes geometry and materials/textures of a Three.js group recursively
 */
export const disposeGroupResources = (group: THREE.Group) => {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh && (mesh as any).isMesh) {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m: any) => {
            if (m && m.map) m.map.dispose();
            if (m && m.dispose) m.dispose();
          });
        } else {
          const m = mesh.material as any;
          if (m && m.map) m.map.dispose();
          if (m && m.dispose) m.dispose();
        }
      }
    }
  });
};

export interface BhavaConfigItem {
  devanagariNum: string;
  name: string;
  subtitle: string;
}

export const BHAVA_CONFIG: Record<number, BhavaConfigItem> = {
  1: { devanagariNum: '१', name: 'तनु भाव', subtitle: 'Lagna & Soul • 1st House' },
  2: { devanagariNum: '२', name: 'धन भाव', subtitle: 'Wealth & Lineage • 2nd House' },
  3: { devanagariNum: '३', name: 'सहज • पराक्रम भाव', subtitle: 'Courage & Valour • 3rd House' },
  4: { devanagariNum: '४', name: 'सुख • बंधु भाव', subtitle: 'Sanctuary & Home • 4th House' },
  5: { devanagariNum: '५', name: 'पुत्र • ज्ञान भाव', subtitle: 'Wisdom & Intellect • 5th House' },
  6: { devanagariNum: '६', name: 'रिपु • शत्रु भाव', subtitle: 'Health & Service • 6th House' },
  7: { devanagariNum: '७', name: 'जाया • पत्नी भाव', subtitle: 'Union & Partner • 7th House' },
  8: { devanagariNum: '८', name: 'आयु • रन्ध्र भाव', subtitle: 'Mysteries & Ledger • 8th House' },
  9: { devanagariNum: '९', name: 'भाग्य • धर्म भाव', subtitle: 'Fortune & Dharma • 9th House' },
  10: { devanagariNum: '१०', name: 'कर्म भाव', subtitle: 'Career & Zenith • 10th House' },
  11: { devanagariNum: '११', name: 'लाभ • आय भाव', subtitle: 'Gains & Wishes • 11th House' },
  12: { devanagariNum: '१२', name: 'व्यय • मोक्ष भाव', subtitle: 'Transcendence • 12th House' }
};

export interface BhavaPlaqueTransform {
  position: THREE.Vector3;
  width: number;
  height: number;
  clearance: number;
  roofTopY: number;
  bracketBottomY: number;
  bracketTopY: number;
}

export const getBhavaPlaqueTransform = (
  houseNumber: number,
  chamberRoofTopY: number = 4.40,
  desiredClearance: number = 0.28
): BhavaPlaqueTransform => {
  const plaqueHeight = 0.66;
  const plaqueHalfHeight = plaqueHeight / 2;
  const plaqueY = chamberRoofTopY + desiredClearance + plaqueHalfHeight; // 4.40 + 0.28 + 0.33 = 5.01

  return {
    position: new THREE.Vector3(0, plaqueY, 0.35),
    width: 1.72,
    height: plaqueHeight,
    clearance: desiredClearance,
    roofTopY: chamberRoofTopY,
    bracketBottomY: chamberRoofTopY,
    bracketTopY: chamberRoofTopY + desiredClearance
  };
};

// =============================================================================
// PHASE 4.5: 3D KUNDLI BHAVA ARCHITECTURAL & CELESTIAL TEXTURE GENERATORS
// =============================================================================
export const createChamberPlaqueTexture = (
  bhavaNum: number,
  bhavaName: string,
  rashiNum: number,
  rashiName: string,
  rashiLord: string
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Deep dark polished emerald temple granite background
  ctx.fillStyle = '#01150c';
  ctx.fillRect(0, 0, 1024, 420);

  const grad = ctx.createRadialGradient(512, 210, 40, 512, 210, 520);
  grad.addColorStop(0, '#063520');
  grad.addColorStop(0.6, '#022013');
  grad.addColorStop(1, '#011008');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 420);

  // Outer gold ornamental border with rounded bevel
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 9;
  ctx.strokeRect(10, 10, 1004, 400);

  // Inner delicate gold hairline border
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(22, 22, 980, 376);

  // 4 Corner gold rosettes
  const corners = [[36, 36], [988, 36], [36, 384], [988, 384]];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Hierarchy as required in Phase 4.5 Section 2 & Safe Patch 3:
  // भाव 1
  // तनु भाव
  //
  // राशि 3 • मिथुन
  // राशि स्वामी • बुध
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1. Primary: Bhava Number
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = 'rgba(254, 240, 138, 0.7)';
  ctx.shadowBlur = 6;
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`भाव ${bhavaNum}`, 512, 68);
  ctx.shadowBlur = 0;

  // 2. Primary: Bhava Name
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(212, 175, 55, 0.95)';
  ctx.shadowBlur = 14;
  ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(bhavaName || 'डेटा उपलब्ध नहीं', 512, 138);
  ctx.shadowBlur = 0;

  // Delicate Gold Divider with Center Diamond
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(220, 204);
  ctx.lineTo(804, 204);
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(512, 197);
  ctx.lineTo(521, 204);
  ctx.lineTo(512, 211);
  ctx.lineTo(503, 204);
  ctx.closePath();
  ctx.fill();

  // 3. Secondary: Rashi Number & Name
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`राशि ${rashiNum} • ${rashiName || 'डेटा उपलब्ध नहीं'}`, 512, 260);

  // 4. Secondary: Rashi Lord
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`राशि स्वामी • ${rashiLord || 'डेटा उपलब्ध नहीं'}`, 512, 328);

  // Subtle Temple Seal Inscription
  ctx.fillStyle = 'rgba(212, 175, 55, 0.65)';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('॥ वैदिक प्रासाद कुण्डली शिलापट्ट ॥', 512, 382);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

export const createTrikalaChamberPlaqueTexture = (
  primaryTitle: string,
  subtitle: string,
  accentColor: string = '#d4af37'
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Deep dark polished emerald temple granite background
  ctx.fillStyle = '#01150c';
  ctx.fillRect(0, 0, 1024, 420);

  const grad = ctx.createRadialGradient(512, 210, 40, 512, 210, 520);
  grad.addColorStop(0, '#063520');
  grad.addColorStop(0.6, '#022013');
  grad.addColorStop(1, '#011008');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 420);

  // Outer gold ornamental border with rounded bevel
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 9;
  ctx.strokeRect(10, 10, 1004, 400);

  // Inner delicate gold hairline border
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(22, 22, 980, 376);

  // 4 Corner gold rosettes
  const corners = [[36, 36], [988, 36], [36, 384], [988, 384]];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1. Tag line
  ctx.fillStyle = accentColor;
  ctx.shadowColor = 'rgba(212, 175, 55, 0.7)';
  ctx.shadowBlur = 6;
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText('॥ त्रिकाल वातायन कक्ष ॥', 512, 70);
  ctx.shadowBlur = 0;

  // 2. Primary Title: अतीत / वर्तमान / भविष्य
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 16;
  ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(primaryTitle, 512, 150);
  ctx.shadowBlur = 0;

  // Delicate Gold Divider with Center Diamond
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(220, 222);
  ctx.lineTo(804, 222);
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(512, 215);
  ctx.lineTo(521, 222);
  ctx.lineTo(512, 229);
  ctx.lineTo(503, 222);
  ctx.closePath();
  ctx.fill();

  // 3. Subtitle (as specified in user prompt: "पूर्व जीवन • जीवन के बीते चरण", etc.)
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(subtitle, 512, 280);

  // Subtle Temple Seal Inscription
  ctx.fillStyle = 'rgba(212, 175, 55, 0.75)';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('॥ कालचक्र प्रज्ञा द्वार ॥', 512, 355);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

export const createRashiPlaqueTexture = (
  bhavaNum: number,
  bhavaName: string,
  rashiNum: number,
  rashiName: string,
  rashiSymbol: string,
  signLord: string
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Deep dark obsidian/emerald stone gradient
  ctx.fillStyle = '#02130b';
  ctx.fillRect(0, 0, 1024, 640);

  const grad = ctx.createRadialGradient(512, 320, 40, 512, 320, 600);
  grad.addColorStop(0, '#062d1c');
  grad.addColorStop(0.65, '#02180e');
  grad.addColorStop(1, '#010d06');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 640);

  // Outer gold frame border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, 1000, 616);

  // Inner delicate hairline border
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(26, 26, 972, 588);

  // 4 Corner rosettes
  const corners = [[42, 42], [982, 42], [42, 598], [982, 598]];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Section 1: Bhava Number & Name
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = 'rgba(254, 240, 138, 0.8)';
  ctx.shadowBlur = 8;
  ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`भाव ${bhavaNum}`, 512, 85);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(212, 175, 55, 0.9)';
  ctx.shadowBlur = 12;
  ctx.font = 'bold 58px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(bhavaName || 'डेटा उपलब्ध नहीं', 512, 160);
  ctx.shadowBlur = 0;

  // Elegant divider 1
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(180, 225);
  ctx.lineTo(844, 225);
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(512, 216);
  ctx.lineTo(522, 225);
  ctx.lineTo(512, 234);
  ctx.lineTo(502, 225);
  ctx.closePath();
  ctx.fill();

  // Section 2: Verified Rashi Number & Name
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`राशि ${rashiNum}`, 512, 285);

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(254, 240, 138, 0.8)';
  ctx.shadowBlur = 14;
  ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const rashiDisplay = rashiSymbol ? `${rashiName} ${rashiSymbol}` : rashiName;
  ctx.fillText(rashiDisplay || 'डेटा उपलब्ध नहीं', 512, 360);
  ctx.shadowBlur = 0;

  // Elegant divider 2
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(240, 425);
  ctx.lineTo(784, 425);
  ctx.stroke();

  // Section 3: Verified Rashi Lord
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  const lordDisplay = signLord || 'डेटा उपलब्ध नहीं';
  ctx.fillText(`राशि स्वामी: ${lordDisplay}`, 512, 485);

  // Inscription footer
  ctx.fillStyle = 'rgba(212, 175, 55, 0.85)';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('॥ वैदिक प्रासाद कुण्डली शिलापट्ट ॥', 512, 570);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

// =============================================================================
// PHASE 4.7-A: LIVING BHAVA CHAMBER 1 IDENTITY TEXTURE GENERATOR
// =============================================================================
export const createLivingBhavaIdentityTexture = (
  bhavaNum: number,
  bhavaName: string,
  rashiNum: number,
  rashiName: string,
  rashiLord: string
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = '#01150c';
  ctx.fillRect(0, 0, 512, 360);

  const grad = ctx.createRadialGradient(256, 180, 20, 256, 180, 260);
  grad.addColorStop(0, '#063a24');
  grad.addColorStop(0.7, '#021c11');
  grad.addColorStop(1, '#010f08');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 360);

  // Gold ornamental border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 344);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(16, 16, 480, 328);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title: भाव 1
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = 'rgba(254, 240, 138, 0.7)';
  ctx.shadowBlur = 6;
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`भाव ${bhavaNum}`, 256, 52);
  ctx.shadowBlur = 0;

  // Bhava Name: तनु भाव
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(212, 175, 55, 0.85)';
  ctx.shadowBlur = 10;
  ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(bhavaName, 256, 106);
  ctx.shadowBlur = 0;

  // Gold divider
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(90, 150);
  ctx.lineTo(422, 150);
  ctx.stroke();

  // Rashi: राशि • [actual Rashi]
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`राशि • ${rashiName}`, 256, 196);

  // Swami: स्वामी • [actual Rashi Lord]
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`स्वामी • ${rashiLord}`, 256, 250);

  // Inscription
  ctx.fillStyle = 'rgba(212, 175, 55, 0.85)';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('॥ जीवंत ज्ञान कक्ष • आत्म द्वार ॥', 256, 305);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

export const createPlanetOverheadTexture = (
  symbol: string,
  name: string,
  degreeFormatted: string,
  nakshatraName: string,
  pada: number | string | undefined,
  color: string,
  isRetrograde?: boolean
) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = 'rgba(2, 20, 12, 0.95)';
  ctx.fillRect(0, 0, 512, 280);

  const grad = ctx.createLinearGradient(0, 0, 512, 280);
  grad.addColorStop(0, 'rgba(6, 45, 28, 0.95)');
  grad.addColorStop(1, 'rgba(2, 16, 10, 0.95)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 280);

  // Gold border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 5;
  ctx.strokeRect(5, 5, 502, 270);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(12, 12, 488, 256);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Line 1: Planet Symbol & Name (e.g. "☉ सूर्य")
  const displayName = name || 'डेटा उपलब्ध नहीं';
  const displayTitle = symbol ? `${symbol} ${displayName}` : displayName;
  ctx.fillStyle = color || '#fef08a';
  ctx.shadowColor = color || '#fef08a';
  ctx.shadowBlur = 8;
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(displayTitle, 256, 46);
  ctx.shadowBlur = 0;

  // Divider line
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 80);
  ctx.lineTo(452, 80);
  ctx.stroke();

  // Line 2: Exact Degree in DMS (e.g. 16°24'18")
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px monospace, -apple-system, sans-serif';
  ctx.fillText(degreeFormatted || 'डेटा उपलब्ध नहीं', 256, 118);

  // Line 3: Nakshatra • Pada (e.g. आर्द्रा • पाद 2)
  const nakshatraDisplay = nakshatraName || 'डेटा उपलब्ध नहीं';
  const padaDisplay = pada != null && pada !== '' ? `पाद ${pada}` : 'पाद उपलब्ध नहीं';
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText(`${nakshatraDisplay} • ${padaDisplay}`, 256, 166);

  // Line 4: Motion Status: Direct / Retrograde
  ctx.fillStyle = isRetrograde ? '#f87171' : '#6ee7b7';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(isRetrograde ? 'वक्री (Retrograde)' : 'मार्गी (Direct)', 256, 214);

  // Line 5: Interactive tap prompt
  ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('टैप करें • पूर्ण ग्रह फल एवं वाणी', 256, 252);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

export const createEmptyHousePlaqueTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = 'rgba(3, 20, 13, 0.90)';
  ctx.fillRect(0, 0, 512, 180);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 168);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
  ctx.fillText('ग्रह स्थिति: कोई ग्रह नहीं', 256, 70);

  ctx.fillStyle = 'rgba(212, 175, 55, 0.75)';
  ctx.font = 'italic 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('स्थान शांति • दृष्टि संबंध एवं स्वामी संचालित', 256, 120);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
};

export const createNebulaTexture = (baseHex: string, accentHex: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.clearRect(0, 0, 512, 512);

  const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
  grad.addColorStop(0, accentHex);
  grad.addColorStop(0.35, baseHex);
  grad.addColorStop(0.7, 'rgba(8, 25, 40, 0.12)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

export const DigitalHouseCanvas: React.FC<DigitalHouseCanvasProps> = ({
  entryStep,
  spatialZone = 'EXTERIOR_WORLD',
  masterData,
  activeChamberId,
  cameraPreset = 'courtyard',
  onSelectChamber,
  soundEnabled,
  onCameraPresetChange,
  onEnterPalace,
  onExitPalace,
  thresholdDirection = null,
  kundliDrishtiMode = false,
  onSelectPlanet,
  selectedPlanetName = null,
  isPlanetSpeaking = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Spatial World Groups
  const exteriorGroupRef = useRef<THREE.Group | null>(null);
  const interiorGroupRef = useRef<THREE.Group | null>(null);

  // Cosmic Sky Layer Refs
  const skyGroupRef = useRef<THREE.Group | null>(null);
  const distantStarsRef = useRef<THREE.Points | null>(null);
  const midStarsRef = useRef<THREE.Points | null>(null);
  const nakshatrasRef = useRef<THREE.Points | null>(null);
  const saptarishiGroupRef = useRef<THREE.Group | null>(null);
  const milkyWayRef = useRef<THREE.Points | null>(null);
  const nebulaGroupRef = useRef<THREE.Group | null>(null);
  const cosmicDustRef = useRef<THREE.Points | null>(null);
  const waterRingRef = useRef<THREE.Mesh | null>(null);

  // Kundli & Planet Presentation Refs
  const planetOrbsRef = useRef<THREE.Group[]>([]);
  const rashiPlaqueMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const palaceWallMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const goldTrimMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Prop refs for non-reinitialization render loop & listeners
  const spatialZoneRef = useRef<SpatialZone>(spatialZone);
  spatialZoneRef.current = spatialZone;

  const thresholdDirRef = useRef<'entering' | 'exiting' | null>(thresholdDirection);
  thresholdDirRef.current = thresholdDirection;

  const onEnterPalaceRef = useRef(onEnterPalace);
  onEnterPalaceRef.current = onEnterPalace;

  const onExitPalaceRef = useRef(onExitPalace);
  onExitPalaceRef.current = onExitPalace;

  const onSelectChamberRef = useRef(onSelectChamber);
  onSelectChamberRef.current = onSelectChamber;

  const onSelectPlanetRef = useRef(onSelectPlanet);
  onSelectPlanetRef.current = onSelectPlanet;

  const selectedPlanetRef = useRef<string | null>(selectedPlanetName);
  selectedPlanetRef.current = selectedPlanetName;

  const activeChamberRef = useRef<ChamberId | null>(activeChamberId);
  activeChamberRef.current = activeChamberId;

  const isPlanetSpeakingRef = useRef<boolean>(isPlanetSpeaking);
  isPlanetSpeakingRef.current = isPlanetSpeaking;

  const kundliDrishtiRef = useRef(kundliDrishtiMode);
  kundliDrishtiRef.current = kundliDrishtiMode;

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  // Animated Door Elements
  // Main Entrance Doors (Exterior Gate)
  const leftDoorRef = useRef<THREE.Group | null>(null);
  const rightDoorRef = useRef<THREE.Group | null>(null);

  // Interior Exit Gate Doors (South Wall of Courtyard)
  const exitLeftDoorRef = useRef<THREE.Group | null>(null);
  const exitRightDoorRef = useRef<THREE.Group | null>(null);

  // Sacred Elements
  const astrolabeGroupRef = useRef<THREE.Group | null>(null);
  const trikalaRingRef = useRef<THREE.Group | null>(null);
  const pragyaFlameLightRef = useRef<THREE.PointLight | null>(null);
  const diyaLightsRef = useRef<THREE.PointLight[]>([]);
  const windowLightsRef = useRef<THREE.PointLight[]>([]);
  const floorPathwaysRef = useRef<THREE.Mesh[]>([]);
  const chamberMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const bhavaPlaqueMeshesRef = useRef<Map<number, THREE.Mesh>>(new Map());
  const interactiveHitboxesRef = useRef<CanvasHitboxItem[]>([]);

  // Camera lerp targets
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 19, 35));
  const targetCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.8, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.8, 0));

  // User Orbit Interaction State
  const isDragging = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const initialPinchDistance = useRef<number | null>(null);
  const orbitAngles = useRef({
    theta: 0,
    phi: Math.PI * 0.22,
    radius: 26
  });

  const [hoveredChamber, setHoveredChamber] = useState<string | null>(null);
  const residentsSummary = React.useMemo(() => extractHouseResidents(masterData), [masterData]);
  const currentLanguage = getCurrentLanguage();
  const bhavaAstroViewModels = React.useMemo(
    () => extractBhavaAstroViewModels(masterData, currentLanguage),
    [masterData, currentLanguage]
  );

  // Phase 4.6-C: Planet Camera Focus & Smooth Return State
  const savedCourtyardState = useRef<{
    pos: THREE.Vector3;
    look: THREE.Vector3;
    theta: number;
    phi: number;
    radius: number;
  } | null>(null);
  const isPlanetFocusActiveRef = useRef<boolean>(false);

  // Phase 4.6-C: Camera Focus towards Selected Planet
  const applyPlanetFocus = useCallback((planetName: string) => {
    if (spatialZoneRef.current !== 'INTERIOR_WORLD') return;

    const pTarget = planetName.trim().toLowerCase();
    const targetOrb = planetOrbsRef.current.find(p => {
      const pName = p.userData.planetName || p.userData.name;
      if (!pName) return false;
      const lower = String(pName).toLowerCase();
      return lower === pTarget || lower.includes(pTarget) || pTarget.includes(lower);
    });

    if (!targetOrb) return;

    // Save previous courtyard camera state before focusing if not already saved
    if (!savedCourtyardState.current) {
      savedCourtyardState.current = {
        pos: targetCamPos.current.clone(),
        look: targetCamLook.current.clone(),
        theta: orbitAngles.current.theta,
        phi: orbitAngles.current.phi,
        radius: orbitAngles.current.radius
      };
    }

    // Compute exact world coordinates of this specific planet orb
    targetOrb.updateMatrixWorld(true);
    const pWorld = new THREE.Vector3();
    targetOrb.getWorldPosition(pWorld);

    const isMobile = window.innerWidth < 640;

    // Direction vector from planet towards central courtyard (0, 0, 0)
    const distFromOrigin = Math.hypot(pWorld.x, pWorld.z);
    const uX = distFromOrigin > 0.001 ? -pWorld.x / distFromOrigin : 0;
    const uZ = distFromOrigin > 0.001 ? -pWorld.z / distFromOrigin : 1;

    // Position camera in front of the chamber facing the planet
    // Camera is placed at radius ~ 5.2m - 5.6m, well inside interior safety boundary (max 6.8m)
    const camDist = isMobile ? 3.9 : 3.5;
    const camX = pWorld.x + uX * camDist;
    const camZ = pWorld.z + uZ * camDist;
    const camY = isMobile ? 1.85 : 1.65;

    targetCamPos.current.set(camX, camY, camZ);

    // Frame the planet near visual center: on mobile, slightly lower look target
    // so the planet orb and overhead banner sit nicely in upper 60% of viewport above bottom sheet
    const lookTargetY = isMobile ? pWorld.y - 0.10 : pWorld.y + 0.12;
    targetCamLook.current.set(pWorld.x, lookTargetY, pWorld.z);

    // Sync orbitAngles so user manual drag will smoothly pick up from this vantage point
    const r = Math.hypot(camX, camZ);
    orbitAngles.current.theta = Math.atan2(camX, camZ);
    orbitAngles.current.phi = Math.atan2(camY, r);
    orbitAngles.current.radius = Math.hypot(camX, camY, camZ);

    isPlanetFocusActiveRef.current = true;
  }, []);

  // Phase 4.6-D: Orbit Station (12 Bhavas + 3 Tri-Kala Special Chambers)
  const [activeStationIndex, setActiveStationIndex] = useState<number>(0);
  const activeStationIndexRef = useRef<number>(0);
  const [facingBhavaNum, setFacingBhavaNum] = useState<number>(1);
  const lastFacingBhavaRef = useRef<number>(1);
  // Phase 4.6-D Hotfix-7: Restored exact pre-HOTFIX-5 working interior camera framing
  // Frames the entire chamber (Bhava plaque, roof arch, pillars, doorway, resident planet, and floor)
  // with comfortable margins so no plaque or wall fills the screen.
  const interiorAzimuthRef = useRef<number>(getChamberAngle(1));
  const interiorCamDistanceRef = useRef<number>(window.innerWidth < 640 ? 7.8 : 8.8);

  const rotateToStation = useCallback((targetIndexOrId: number | string) => {
    if (spatialZoneRef.current !== 'INTERIOR_WORLD') return;
    if (isPlanetFocusActiveRef.current) {
      isPlanetFocusActiveRef.current = false;
    }

    let targetIdx: number;
    if (typeof targetIndexOrId === 'string') {
      const foundIdx = ORBIT_STATIONS.findIndex(
        s => s.id === targetIndexOrId || (s.type === 'trikala' && s.trikalaId === targetIndexOrId)
      );
      targetIdx = foundIdx !== -1 ? foundIdx : 0;
    } else {
      targetIdx = ((targetIndexOrId % ORBIT_STATIONS.length) + ORBIT_STATIONS.length) % ORBIT_STATIONS.length;
    }

    const station = ORBIT_STATIONS[targetIdx];
    const angle = station.angle;
    const chamberRadius = 9.2;
    const isMobile = window.innerWidth < 640;

    // Phase 4.6-D Hotfix-8: Keep current zoom level (camDistance) when changing Bhava / Special Chamber
    const minCamDistance = isMobile ? 6.4 : 7.2;
    const maxCamDistance = isMobile ? 8.5 : 9.0;
    const currentDist = interiorCamDistanceRef.current ?? (isMobile ? 7.8 : 8.8);
    const camDistance = Math.max(minCamDistance, Math.min(maxCamDistance, currentDist));
    interiorCamDistanceRef.current = camDistance;
    interiorAzimuthRef.current = angle;

    const camRadius = chamberRadius - camDistance; // ~1.4m on mobile, ~0.4m on desktop
    const camX = Math.cos(angle) * camRadius;
    const camZ = Math.sin(angle) * camRadius;
    const camY = isMobile ? 3.4 : 3.2;

    const targetX = Math.cos(angle) * chamberRadius;
    const targetZ = Math.sin(angle) * chamberRadius;
    const targetY = isMobile ? 2.4 : 2.4;

    targetCamPos.current.set(camX, camY, camZ);
    targetCamLook.current.set(targetX, targetY, targetZ);

    activeStationIndexRef.current = targetIdx;
    setActiveStationIndex(targetIdx);

    if (station.type === 'bhava' && station.bhavaNum) {
      lastFacingBhavaRef.current = station.bhavaNum;
      setFacingBhavaNum(station.bhavaNum);
    }
  }, []);

  const rotateToBhava = useCallback((targetHouse: number) => {
    const house = ((targetHouse - 1 + 12) % 12) + 1;
    rotateToStation(house - 1);
  }, [rotateToStation]);

  const restoreCourtyardCamera = useCallback(() => {
    if (savedCourtyardState.current) {
      targetCamPos.current.copy(savedCourtyardState.current.pos);
      targetCamLook.current.copy(savedCourtyardState.current.look);
      orbitAngles.current.theta = savedCourtyardState.current.theta;
      orbitAngles.current.phi = savedCourtyardState.current.phi;
      orbitAngles.current.radius = savedCourtyardState.current.radius;
      savedCourtyardState.current = null;
    } else if (spatialZoneRef.current === 'INTERIOR_WORLD') {
      rotateToStation(activeStationIndexRef.current);
    }
    isPlanetFocusActiveRef.current = false;
  }, [rotateToStation]);

  const goToPreviousBhava = useCallback(() => {
    if (activeStationIndexRef.current >= 0 && activeStationIndexRef.current < 12) {
      const prevHouse = (activeStationIndexRef.current - 1 + 12) % 12 + 1;
      rotateToBhava(prevHouse);
    } else {
      rotateToStation(activeStationIndexRef.current - 1);
    }
  }, [rotateToBhava, rotateToStation]);

  const goToNextBhava = useCallback(() => {
    if (activeStationIndexRef.current >= 0 && activeStationIndexRef.current < 12) {
      const nextHouse = (activeStationIndexRef.current + 1) % 12 + 1;
      rotateToBhava(nextHouse);
    } else {
      rotateToStation(activeStationIndexRef.current + 1);
    }
  }, [rotateToBhava, rotateToStation]);

  const goToPrevBhava = goToPreviousBhava;
  const goToPreviousBhavaRef = useRef(goToPreviousBhava);
  goToPreviousBhavaRef.current = goToPreviousBhava;
  const goToPrevBhavaRef = goToPreviousBhavaRef;
  const goToNextBhavaRef = useRef(goToNextBhava);
  goToNextBhavaRef.current = goToNextBhava;
  const rotateToBhavaRef = useRef(rotateToBhava);
  rotateToBhavaRef.current = rotateToBhava;
  const rotateToStationRef = useRef(rotateToStation);
  rotateToStationRef.current = rotateToStation;

  // Phase 4.6-C: Reactive Camera Focus on Planet Selection / Return on Deselection
  useEffect(() => {
    if (selectedPlanetName) {
      applyPlanetFocus(selectedPlanetName);
    } else if (isPlanetFocusActiveRef.current) {
      restoreCourtyardCamera();
    }
  }, [selectedPlanetName, applyPlanetFocus, restoreCourtyardCamera]);

  // ===========================================================================
  // PHASE 4.5: 3D KUNDLI CHAMBER ASTROLOGY POPULATOR (READ-ONLY PRESENTATION)
  // ===========================================================================
  const populateChamberAstrology = useCallback((
    targetGroup: THREE.Group,
    houseNumber: number,
    bhavaInfo: { devanagariNum: string; name: string; subtitle: string },
    model?: BhavaAstroViewModel,
    pWallMat?: THREE.MeshStandardMaterial,
    gTrimMat?: THREE.MeshStandardMaterial
  ) => {
    const wallMat = pWallMat || palaceWallMatRef.current || new THREE.MeshStandardMaterial({ color: 0x0c3122, roughness: 0.38, metalness: 0.20 });
    const goldMat = gTrimMat || goldTrimMatRef.current || new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.22, metalness: 0.85 });

    const rashiNum = model?.rashiNumber || (((1 - 1 + (houseNumber - 1)) % 12) + 1);
    const rashiName = model?.rashiName || `राशि ${rashiNum}`;
    const rashiSymbol = model?.rashiSymbol || '';
    const signLord = model?.signLord || 'डेटा उपलब्ध नहीं';

    // 1. Grand Kundli Rashi Inscription Plaque physically attached to Rear Wall (Section 5)
    const rashiTex = createRashiPlaqueTexture(
      houseNumber,
      model?.bhavaName || bhavaInfo.name,
      rashiNum,
      rashiName,
      rashiSymbol,
      signLord
    );
    const rashiMat = new THREE.MeshStandardMaterial({
      map: rashiTex,
      roughness: 0.28,
      metalness: 0.35,
      emissive: new THREE.Color(0x062817),
      emissiveIntensity: kundliDrishtiRef.current ? 0.95 : 0.40
    });
    rashiPlaqueMatsRef.current.push(rashiMat);

    // Wall stone backing attached directly to rear wall (z = -0.96)
    const rashiBacking = new THREE.Mesh(new THREE.BoxGeometry(1.68, 1.10, 0.08), wallMat);
    rashiBacking.position.set(0, 1.90, -0.96);
    targetGroup.add(rashiBacking);

    // Architectural gold frame moulding
    const rashiFrame = new THREE.Mesh(new THREE.BoxGeometry(1.72, 1.14, 0.04), goldMat);
    rashiFrame.position.set(0, 1.90, -0.93);
    targetGroup.add(rashiFrame);

    // Inscription face
    const rashiMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 1.04), rashiMat);
    rashiMesh.position.set(0, 1.90, -0.90);
    targetGroup.add(rashiMesh);

    // Supporting lotus corbels under the plaque
    const corbelL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.12), goldMat);
    corbelL.position.set(-0.55, 1.30, -0.94);
    targetGroup.add(corbelL);

    const corbelR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.12), goldMat);
    corbelR.position.set(0.55, 1.30, -0.94);
    targetGroup.add(corbelR);

    // Dedicated warm accent sconce spotlight
    const rashiLight = new THREE.PointLight(0xfff0b3, 0.70, 3.2);
    rashiLight.position.set(0, 2.05, -0.65);
    targetGroup.add(rashiLight);

    // 2. 3D Planetary Vigrahas / Orbs inside the chamber (Section 6 & 7 & Safe Patch 3)
    const residentPlanets = model?.planets || [];
    if (residentPlanets.length > 0) {
      const pCount = residentPlanets.length;
      residentPlanets.forEach((p, pIdx) => {
        const pGroup = new THREE.Group();
        // Deterministic non-overlapping layout: 1: center, 2: left+right, 3: triangle, 4+: grid
        const { x: px, z: pz } = getPlanetPositionInChamber(pIdx, pCount);

        // Height: base plinth sits at y = 0.42 resting on floor at 0.35; orb at y = 0.95
        pGroup.position.set(px, 0.95, pz);
        pGroup.userData = { baseY: 0.95, pIdx, name: p.name, house: houseNumber };

        // Lotus pedestal base
        const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.08, 12), goldMat);
        plinth.position.y = -0.45;
        pGroup.add(plinth);

        const plinthRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 6, 16), goldMat);
        plinthRing.rotation.x = Math.PI / 2;
        plinthRing.position.y = -0.42;
        pGroup.add(plinthRing);

        // Glowing Planetary Gem Sphere
        const sphereMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(p.color),
          emissive: new THREE.Color(p.color),
          emissiveIntensity: 0.65,
          roughness: 0.18,
          metalness: 0.45
        });
        const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), sphereMat);
        sphereMesh.name = 'planet_sphere';
        pGroup.add(sphereMesh);

        // Astrological Planetary Ring
        const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.012, 8, 24), goldMat);
        ringMesh.rotation.x = Math.PI * 0.35;
        ringMesh.name = 'astro_ring';
        pGroup.add(ringMesh);

        // Dedicated Planetary Point Light
        const pLight = new THREE.PointLight(new THREE.Color(p.color), 0.75, 2.5);
        pLight.position.set(0, 0, 0);
        pLight.name = 'planet_light';
        pGroup.add(pLight);

        // Phase 4.6-A: Selection Halo (Subtle Gold Glow + Soft Emerald Rim)
        const haloGroup = new THREE.Group();
        haloGroup.name = 'selection_halo';
        haloGroup.visible = false;

        // Inner subtle gold ring
        const goldHaloMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xd4af37),
          emissive: new THREE.Color(0xd4af37),
          emissiveIntensity: 0.88,
          roughness: 0.25,
          metalness: 0.8,
          transparent: true,
          opacity: 0.88,
          side: THREE.DoubleSide
        });
        const goldHaloMesh = new THREE.Mesh(new THREE.RingGeometry(0.19, 0.225, 32), goldHaloMat);
        goldHaloMesh.rotation.x = -Math.PI / 2;
        haloGroup.add(goldHaloMesh);

        // Outer soft emerald rim
        const emeraldRimMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x10b981),
          emissive: new THREE.Color(0x059669),
          emissiveIntensity: 0.75,
          roughness: 0.3,
          metalness: 0.6,
          transparent: true,
          opacity: 0.80,
          side: THREE.DoubleSide
        });
        const emeraldRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.23, 0.26, 32), emeraldRimMat);
        emeraldRimMesh.rotation.x = -Math.PI / 2;
        haloGroup.add(emeraldRimMesh);

        pGroup.add(haloGroup);

        // Compact Overhead Marker Banner with Verified Degree DMS, Nakshatra, Pada & Motion
        const bannerTex = createPlanetOverheadTexture(
          p.symbol,
          p.localizedName || p.name,
          p.formattedDegree,
          p.nakshatraName,
          p.pada,
          p.color,
          p.isRetrograde
        );
        const bannerMat = new THREE.MeshBasicMaterial({
          map: bannerTex,
          transparent: true,
          opacity: 0.96,
          side: THREE.DoubleSide
        });
        const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.28), bannerMat);
        bannerMesh.position.set(0, 0.32, 0);
        bannerMesh.name = 'overhead_banner';
        pGroup.add(bannerMesh);

        // Planet Interactive Hitbox (Enlarged for comfortable >= 44px mobile practical touch target)
        const planetHitGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.85, 12);
        const planetHitMesh = new THREE.Mesh(planetHitGeo, new THREE.MeshBasicMaterial({ visible: false }));
        planetHitMesh.position.set(0, 0.05, 0);
        pGroup.add(planetHitMesh);

        const chamberDef = CHAMBER_DEFINITIONS.find(c => c.houseNumber === houseNumber);
        if (chamberDef) {
          interactiveHitboxesRef.current.push({
            id: chamberDef.id,
            mesh: planetHitMesh,
            isPlanet: true,
            planetName: p.name,
            chamberId: chamberDef.id
          });
        }

        pGroup.userData.planetName = p.name;
        pGroup.userData.chamberId = chamberDef ? chamberDef.id : null;

        targetGroup.add(pGroup);
        planetOrbsRef.current.push(pGroup);
      });
    } else {
      // Empty House Lotus Floor Plaque
      const emptyTex = createEmptyHousePlaqueTexture();
      const emptyMat = new THREE.MeshStandardMaterial({
        map: emptyTex,
        roughness: 0.38,
        metalness: 0.25,
        emissive: new THREE.Color(0x03180f),
        emissiveIntensity: 0.32
      });
      const emptyMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.42), emptyMat);
      emptyMesh.rotation.x = -Math.PI / 2;
      emptyMesh.position.set(0, 0.36, 0.05);
      targetGroup.add(emptyMesh);
    }

    // =======================================================================
    // PHASE 4.7-A: LIVING BHAVA CHAMBER (PROTOTYPE FOR BHAVA 1 ONLY)
    // =======================================================================
    if (houseNumber === 1) {
      // 1. Premium Identity Plaque on inner right wall
      const idTex = createLivingBhavaIdentityTexture(
        1,
        bhavaInfo.name,
        rashiNum,
        rashiName,
        signLord
      );
      const idMat = new THREE.MeshStandardMaterial({
        map: idTex,
        roughness: 0.28,
        metalness: 0.35,
        emissive: new THREE.Color(0x062817),
        emissiveIntensity: 0.45
      });
      const idBacking = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.68, 0.04), goldMat);
      idBacking.position.set(1.08, 1.70, -0.15);
      idBacking.rotation.y = -Math.PI / 2;
      targetGroup.add(idBacking);

      const idMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.64), idMat);
      idMesh.position.set(1.055, 1.70, -0.15);
      idMesh.rotation.y = -Math.PI / 2;
      targetGroup.add(idMesh);

      // Plaque soft accent sconce light
      const idLight = new THREE.PointLight(0xfff0b3, 0.55, 2.2);
      idLight.position.set(0.85, 1.70, -0.15);
      targetGroup.add(idLight);

      // 2. Small Decorative "Bhava Knowledge Orb" on inner left pedestal
      const orbGroup = new THREE.Group();
      orbGroup.name = 'bhava1_knowledge_orb_group';
      orbGroup.position.set(-0.85, 1.15, -0.15);

      // Carved Lotus Pedestal
      const orbPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.14, 0.16, 12), goldMat);
      orbPlinth.position.y = -0.22;
      orbGroup.add(orbPlinth);

      // Glowing Knowledge Orb (slowly rotates in animate loop)
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.92
      });
      const orbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), orbMat);
      orbMesh.name = 'bhava1_knowledge_orb';
      orbGroup.add(orbMesh);

      // Concentric Orbiting Gold Ring
      const ringGeo = new THREE.TorusGeometry(0.18, 0.012, 8, 24);
      const ringMesh = new THREE.Mesh(ringGeo, goldMat);
      ringMesh.rotation.x = Math.PI * 0.35;
      ringMesh.name = 'bhava1_orb_ring';
      orbGroup.add(ringMesh);

      // Soft emerald point light
      const orbLight = new THREE.PointLight(0x34d399, 0.75, 2.0);
      orbLight.name = 'bhava1_orb_light';
      orbGroup.add(orbLight);

      // Interactive Hitbox for Knowledge Orb
      const orbHitMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), new THREE.MeshBasicMaterial({ visible: false }));
      orbGroup.add(orbHitMesh);
      interactiveHitboxesRef.current.push({
        id: 'chamber_1',
        mesh: orbHitMesh
      });

      targetGroup.add(orbGroup);

      // 3. Living Chamber Ambient Lighting (subtle warm gold + emerald rim)
      const livingGoldLight = new THREE.PointLight(0xfef08a, 0.85, 4.0);
      livingGoldLight.name = 'bhava1_living_gold_light';
      livingGoldLight.position.set(0, 1.95, -0.3);
      targetGroup.add(livingGoldLight);

      const livingEmeraldLight = new THREE.PointLight(0x10b981, 0.65, 3.5);
      livingEmeraldLight.name = 'bhava1_living_emerald_light';
      livingEmeraldLight.position.set(0, 0.75, 0.3);
      targetGroup.add(livingEmeraldLight);
    }
  }, []);

  // Reactive Astrological Chamber Synchronization when masterData updates
  useEffect(() => {
    planetOrbsRef.current = [];
    rashiPlaqueMatsRef.current = [];
    // Clean up old planet hitboxes before repopulating
    interactiveHitboxesRef.current = interactiveHitboxesRef.current.filter(h => !h.isPlanet);

    CHAMBER_DEFINITIONS.forEach((chamber) => {
      if (!chamber.houseNumber) return;
      const cGroup = chamberMeshesRef.current.get(chamber.id);
      if (!cGroup) return;

      const model = bhavaAstroViewModels[chamber.houseNumber];
      const rashiNum = model?.rashiNumber || (((chamber.houseNumber - 1) % 12) + 1);
      const rashiName = model?.rashiName || `राशि ${rashiNum}`;
      const signLord = model?.signLord || 'डेटा उपलब्ध नहीं';
      const bhavaTitle = model?.bhavaName || chamber.hindiTitle || chamber.sanskritName || `भाव ${chamber.houseNumber}`;

      const bhavaInfo = BHAVA_CONFIG[chamber.houseNumber] || {
        devanagariNum: `${chamber.houseNumber}`,
        name: bhavaTitle,
        subtitle: chamber.englishTitle
      };

      // Phase 4.5 & Safe Patch 3: Dynamically update the Bhava entrance plaque with real calculated Kundli data
      const plaqueMesh = bhavaPlaqueMeshesRef.current.get(chamber.houseNumber);
      if (plaqueMesh) {
        const newPlaqueTex = createChamberPlaqueTexture(
          chamber.houseNumber,
          bhavaTitle,
          rashiNum,
          rashiName,
          signLord
        );
        const mat = plaqueMesh.material as THREE.MeshStandardMaterial;
        if (mat.map) mat.map.dispose();
        mat.map = newPlaqueTex;
        mat.needsUpdate = true;
      }

      const existingAstro = cGroup.getObjectByName('astro_content') as THREE.Group;
      if (existingAstro) {
        disposeGroupResources(existingAstro);
        cGroup.remove(existingAstro);
      }

      const newAstroGroup = new THREE.Group();
      newAstroGroup.name = 'astro_content';

      populateChamberAstrology(
        newAstroGroup,
        chamber.houseNumber,
        bhavaInfo,
        model
      );

      cGroup.add(newAstroGroup);
    });
  }, [bhavaAstroViewModels, populateChamberAstrology]);

  // Dynamic Kundli Drishti Mode Illumination Update
  useEffect(() => {
    const isDrishti = Boolean(kundliDrishtiMode);
    rashiPlaqueMatsRef.current.forEach(mat => {
      mat.emissiveIntensity = isDrishti ? 0.95 : 0.38;
    });
  }, [kundliDrishtiMode]);

  // Compute camera position based on preset or active chamber
  const applyCameraPreset = useCallback((preset: CameraPreset, chamberId?: ChamberId | null) => {
    const isMobile = window.innerWidth < 640;

    // Handle Main Exterior Entrance Gate
    if (chamberId === 'main_gate' || preset === 'entrance' || preset === 'EXTERIOR_ENTRY') {
      targetCamPos.current.set(0, isMobile ? 3.4 : 3.0, isMobile ? 20.0 : 17.5);
      targetCamLook.current.set(0, 2.6, 9.4);
      orbitAngles.current.radius = isMobile ? 20.0 : 17.5;
      orbitAngles.current.phi = Math.PI * 0.14;
      orbitAngles.current.theta = 0;
      return;
    }

    // Handle Dedicated Interior Exit Gate (Facing South toward the gate)
    if (chamberId === 'exit_gate' || preset === 'exit_gate' || preset === 'INTERIOR_EXIT_APPROACH') {
      targetCamPos.current.set(0, isMobile ? 2.4 : 2.2, 5.8);
      targetCamLook.current.set(0, 2.2, 9.2);
      orbitAngles.current.radius = 5.8;
      orbitAngles.current.phi = Math.PI * 0.16;
      orbitAngles.current.theta = Math.PI;
      return;
    }

    // Handle Trikala Special Chambers Focus (Fixed-radius framing, azimuth only)
    if (chamberId === 'window_past') {
      rotateToStation('window_past');
      return;
    }

    if (chamberId === 'window_present') {
      rotateToStation('window_present');
      return;
    }

    if (chamberId === 'window_future') {
      rotateToStation('window_future');
      return;
    }

    // Handle Individual Chamber Focus
    if (
      chamberId &&
      chamberId !== 'courtyard' &&
      chamberId !== 'guardian_sanctum'
    ) {
      const def = CHAMBER_DEFINITIONS.find(d => d.id === chamberId);
      if (def && def.houseNumber) {
        rotateToBhava(def.houseNumber);
        return;
      }
    } else if (chamberId === 'guardian_sanctum') {
      targetCamPos.current.set(0, 3.0, -7.0);
      targetCamLook.current.set(0, 2.2, -12.0);
      return;
    }

    switch (preset) {
      case 'overview':
      case 'exterior_overview':
      case 'EXTERIOR_OVERVIEW':
        // Elevated front 3/4 overview of palace estate
        targetCamPos.current.set(0, isMobile ? 17 : 14, isMobile ? 36 : 30);
        targetCamLook.current.set(0, 3.0, 8.0);
        orbitAngles.current.radius = isMobile ? 36 : 30;
        orbitAngles.current.phi = Math.PI * 0.28;
        orbitAngles.current.theta = 0;
        break;

      case 'courtyard':
      case 'INTERIOR_COURTYARD':
      default:
        if (spatialZone === 'EXTERIOR_WORLD') {
          targetCamPos.current.set(0, isMobile ? 3.4 : 3.0, isMobile ? 20.0 : 17.5);
          targetCamLook.current.set(0, 2.6, 9.4);
          orbitAngles.current.radius = isMobile ? 20.0 : 17.5;
          orbitAngles.current.phi = Math.PI * 0.14;
          orbitAngles.current.theta = 0;
        } else {
          // Phase 4.6-D Hotfix-8: Reset to default HOTFIX-7 camera distance on entry
          interiorCamDistanceRef.current = isMobile ? 7.8 : 8.8;
          rotateToBhava(1);
        }
        break;

      case 'mandala':
      case 'INTERIOR_MANDALA':
        // Top-down interior Vastu mandala view
        targetCamPos.current.set(0, isMobile ? 11.5 : 10.0, 0.01);
        targetCamLook.current.set(0, 0, 0);
        orbitAngles.current.radius = 10.5;
        orbitAngles.current.phi = Math.PI * 0.48;
        orbitAngles.current.theta = 0;
        break;
    }
  }, [spatialZone, rotateToBhava]);

  // Update camera based on entry sequence or active preset/chamber/threshold
  useEffect(() => {
    const isMobile = window.innerWidth < 640;

    // 1. Explicit Threshold Crossing Animation
    if (thresholdDirection === 'entering') {
      // Step A: Camera approaches the grand gate
      targetCamPos.current.set(0, 3.0, 14.0);
      targetCamLook.current.set(0, 2.6, 9.4);

      // Step B: Camera crosses threshold into entrance vestibule
      const t1 = setTimeout(() => {
        targetCamPos.current.set(0, 2.4, 8.8);
        targetCamLook.current.set(0, 1.8, 0);
      }, 700);

      // Step C: Camera smoothly enters interior courtyard to working First Interior View facing Bhava 1
      const t2 = setTimeout(() => {
        interiorCamDistanceRef.current = isMobile ? 7.8 : 8.8;
        rotateToBhava(1);
      }, 1500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    if (thresholdDirection === 'exiting') {
      // Step A: Camera approaches interior exit gate
      targetCamPos.current.set(0, 2.4, 7.2);
      targetCamLook.current.set(0, 2.2, 9.2);

      // Step B: Camera crosses doorway threshold outward
      const t1 = setTimeout(() => {
        targetCamPos.current.set(0, 2.6, 11.2);
        targetCamLook.current.set(0, 2.6, 16.0);
      }, 700);

      // Step C: Camera backs out to exterior ceremonial approach view
      const t2 = setTimeout(() => {
        targetCamPos.current.set(0, isMobile ? 3.4 : 3.0, isMobile ? 20.0 : 17.5);
        targetCamLook.current.set(0, 2.6, 9.4);
      }, 1500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    // 2. Ceremonial Entry Steps
    if (entryStep === 'dark') {
      targetCamPos.current.set(0, 5.0, 32);
      targetCamLook.current.set(0, 2.5, 0);
      return;
    } else if (entryStep === 'house_emerge' || entryStep === 'lamps_light') {
      targetCamPos.current.set(0, 4.2, 24);
      targetCamLook.current.set(0, 2.8, 7.5);
      return;
    } else if (entryStep === 'doors_open') {
      targetCamPos.current.set(0, 3.6, 17);
      targetCamLook.current.set(0, 2.8, 7.5);
      return;
    } else if (entryStep === 'camera_glide') {
      targetCamPos.current.set(0, 4.4, 11);
      targetCamLook.current.set(0, 2.0, 0);
      return;
    }

    // 3. Normal Spatial Zone Camera Placement
    if (spatialZone === 'EXTERIOR_WORLD') {
      applyCameraPreset(cameraPreset === 'overview' || cameraPreset === 'EXTERIOR_OVERVIEW' ? 'EXTERIOR_OVERVIEW' : 'EXTERIOR_ENTRY', activeChamberId);
      return;
    }

    if (spatialZone === 'INTERIOR_WORLD') {
      if (selectedPlanetRef.current) {
        // Planet camera focus actively handles camera framing
        return;
      }
      if (activeChamberId && activeChamberId !== 'courtyard') {
        applyCameraPreset(cameraPreset, activeChamberId);
      } else {
        if (savedCourtyardState.current) {
          restoreCourtyardCamera();
        } else {
          applyCameraPreset(cameraPreset, 'courtyard');
        }
      }
    }
  }, [entryStep, spatialZone, thresholdDirection, cameraPreset, activeChamberId, applyCameraPreset, restoreCourtyardCamera]);

  // Handle door animation targets
  // Main doors open INWARD into vestibule (+Z -> -Z direction)
  // Exit doors open outward when exiting
  useEffect(() => {
    if (thresholdDirection === 'entering') {
      // Main doors open INWARD into vestibule (smooth 1.5–2s)
      if (leftDoorRef.current && rightDoorRef.current) {
        leftDoorRef.current.userData.targetRotationY = Math.PI * 0.45;
        rightDoorRef.current.userData.targetRotationY = -Math.PI * 0.45;
      }
    } else if (thresholdDirection === 'exiting') {
      // Exit doors swing open smoothly
      if (exitLeftDoorRef.current && exitRightDoorRef.current) {
        exitLeftDoorRef.current.userData.targetRotationY = -Math.PI * 0.45;
        exitRightDoorRef.current.userData.targetRotationY = Math.PI * 0.45;
      }
    } else if (spatialZone === 'INTERIOR_WORLD') {
      // When inside, both the entrance doors and exit doors remain closed
      if (leftDoorRef.current && rightDoorRef.current) {
        leftDoorRef.current.userData.targetRotationY = 0;
        rightDoorRef.current.userData.targetRotationY = 0;
      }
      if (exitLeftDoorRef.current && exitRightDoorRef.current) {
        exitLeftDoorRef.current.userData.targetRotationY = 0;
        exitRightDoorRef.current.userData.targetRotationY = 0;
      }
    } else {
      // In EXTERIOR_WORLD, doors are closed
      if (leftDoorRef.current && rightDoorRef.current) {
        leftDoorRef.current.userData.targetRotationY = 0;
        rightDoorRef.current.userData.targetRotationY = 0;
      }
      if (exitLeftDoorRef.current && exitRightDoorRef.current) {
        exitLeftDoorRef.current.userData.targetRotationY = 0;
        exitRightDoorRef.current.userData.targetRotationY = 0;
      }
    }
  }, [spatialZone, thresholdDirection, entryStep]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isMobile = width < 640;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020a07);
    scene.fog = new THREE.Fog(0x020a07, 35, 110);
    sceneRef.current = scene;

    // Spatial Root Groups
    const exteriorGroup = new THREE.Group();
    exteriorGroup.name = 'EXTERIOR_WORLD_GROUP';
    scene.add(exteriorGroup);
    exteriorGroupRef.current = exteriorGroup;

    const interiorGroup = new THREE.Group();
    interiorGroup.name = 'INTERIOR_WORLD_GROUP';
    scene.add(interiorGroup);
    interiorGroupRef.current = interiorGroup;

    // 2. Camera with responsive FOV (wider on mobile portrait)
    const aspect = width / height;
    const initialFov = aspect < 0.65 ? 60 : (aspect < 1.0 ? 54 : 45);
    const camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 180);
    camera.position.set(0, isMobile ? 22 : 18, isMobile ? 38 : 32);
    camera.lookAt(0, 1.8, 0);
    cameraRef.current = camera;

    // 3. Renderer with high dynamic range tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Procedural Textures
    const createMandalaTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      ctx.fillStyle = '#062619';
      ctx.fillRect(0, 0, 512, 512);

      const cx = 256;
      const cy = 256;

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 240, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 220, 0, Math.PI * 2);
      ctx.stroke();

      const numPetals = 16;
      for (let i = 0; i < numPetals; i++) {
        const angle = (i * Math.PI * 2) / numPetals;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 140, 24, 70, 0, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(212, 175, 55, 0.22)' : 'rgba(16, 185, 129, 0.22)';
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 70, cy - 70, 140, 140);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-70, -70, 140, 140);
      ctx.restore();

      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 4;
      return texture;
    };

    const createPlaqueReverseTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      // Deep carved temple dark stone background
      ctx.fillStyle = '#01120a';
      ctx.fillRect(0, 0, 1024, 420);

      const grad = ctx.createRadialGradient(512, 210, 40, 512, 210, 520);
      grad.addColorStop(0, '#042718');
      grad.addColorStop(0.65, '#021810');
      grad.addColorStop(1, '#010d06');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 420);

      // Outer gold ornamental frame border
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 10;
      ctx.strokeRect(10, 10, 1004, 400);

      // Inner delicate gold hairline border
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(22, 22, 980, 376);

      // 4 Corner gold rosettes
      const corners = [[36, 36], [988, 36], [36, 384], [988, 384]];
      corners.forEach(([cx, cy]) => {
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Center Sacred Architectural Lotus Mandala (Ashtadala Padma)
      const cx = 512;
      const cy = 210;

      // Outer concentric ornamental gold rings
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 135, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 122, 0, Math.PI * 2);
      ctx.stroke();

      // 16-dot perimeter ring
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const dx = cx + Math.cos(ang) * 128;
        const dy = cy + Math.sin(ang) * 128;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 8 Sacred Lotus Petals (Ashtadala Padma)
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang);

        // Petal shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(24, 60, 0, 105);
        ctx.quadraticCurveTo(-24, 60, 0, 0);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.28)';
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Petal inner spine
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.lineTo(0, 95);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      // Inner Lotus Core
      const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 38);
      coreGrad.addColorStop(0, '#fef08a');
      coreGrad.addColorStop(0.5, '#d4af37');
      coreGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Golden Bindu Center Jewel
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();

      // Flanking Left & Right Carved Filigree Motifs
      [-260, 260].forEach((offset) => {
        const fx = cx + offset;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(fx, cy, 32, 0, Math.PI * 2);
        ctx.stroke();

        // Diamond motif inside flanking circles
        ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
        ctx.beginPath();
        ctx.moveTo(fx, cy - 14);
        ctx.lineTo(fx + 14, cy);
        ctx.lineTo(fx, cy + 14);
        ctx.lineTo(fx - 14, cy);
        ctx.closePath();
        ctx.fill();

        // Connecting horizontal filigree bar
        ctx.beginPath();
        ctx.moveTo(fx - (offset > 0 ? 55 : -55), cy);
        ctx.lineTo(cx + (offset > 0 ? 145 : -145), cy);
        ctx.stroke();
      });

      // Bottom Subtle Architectural Inscription
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(212, 175, 55, 0.65)';
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('जीवनदर्पण • प्रासाद पीठिका', cx, 360);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      return texture;
    };

    const createTrikalaPlaqueTexture = (title: string, accentColor: string, bgColor: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 96;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      ctx.fillStyle = bgColor || '#052216';
      ctx.fillRect(0, 0, 256, 96);

      ctx.strokeStyle = accentColor || '#d4af37';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, 248, 88);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, 128, 48);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const createPragyaNameplateTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 192;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      ctx.fillStyle = '#04170e';
      ctx.fillRect(0, 0, 512, 192);

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 6;
      ctx.strokeRect(8, 8, 496, 176);

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 16, 480, 160);

      const corners = [[20, 20], [492, 20], [20, 172], [492, 172]];
      ctx.fillStyle = '#d4af37';
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('• जीवन प्रज्ञा हृदय •', 256, 38);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText('जीवन प्रज्ञा मार्गदर्शन', 256, 88);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(70, 122);
      ctx.lineTo(442, 122);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('अतीत  •  वर्तमान  •  भविष्य', 256, 150);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 4;
      return texture;
    };

    const createTrikalaWindowPlaqueTexture = (primary: string, subtitle: string, accentColor: string, bgColor: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 384;
      canvas.height = 144;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      ctx.fillStyle = bgColor || '#04170e';
      ctx.fillRect(0, 0, 384, 144);

      ctx.strokeStyle = accentColor || '#d4af37';
      ctx.lineWidth = 5;
      ctx.strokeRect(6, 6, 372, 132);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(12, 12, 360, 120);

      const dots = [[16, 16], [368, 16], [16, 128], [368, 128]];
      ctx.fillStyle = accentColor || '#d4af37';
      dots.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 8;
      ctx.fillText(primary, 192, 48);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(50, 78);
      ctx.lineTo(334, 78);
      ctx.stroke();

      ctx.fillStyle = accentColor || '#fef08a';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(subtitle, 192, 106);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 4;
      return texture;
    };

    const createGatePlaqueTexture = (primary: string, subtitle: string, accentColor?: string, bgColor?: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 144;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      ctx.fillStyle = bgColor || '#04170e';
      ctx.fillRect(0, 0, 512, 144);

      ctx.strokeStyle = accentColor || '#d4af37';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 132);

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(14, 14, 484, 116);

      const dots = [[20, 20], [492, 20], [20, 124], [492, 124]];
      ctx.fillStyle = accentColor || '#d4af37';
      dots.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = accentColor || '#d4af37';
      ctx.shadowBlur = 8;
      ctx.fillText(primary, 256, 48);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(80, 78);
      ctx.lineTo(432, 78);
      ctx.stroke();

      ctx.fillStyle = accentColor || '#fef08a';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(subtitle, 256, 106);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 4;
      return texture;
    };

    const createCosmicPortalTexture = (colorA: string, colorB: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 384;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const grad = ctx.createLinearGradient(0, 384, 0, 0);
      grad.addColorStop(0, colorA);
      grad.addColorStop(0.5, colorB);
      grad.addColorStop(1, '#020705');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 384);

      for (let i = 0; i < 45; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 384;
        const rad = Math.random() * 2.2 + 0.6;
        ctx.fillStyle = Math.random() > 0.45 ? '#ffffff' : colorA;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(128, 240, 75, Math.PI, 0);
      ctx.stroke();

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    // Phase 4.5: Naturalized Live Cosmic Brahmand Sky
    const createSoftStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.25, 'rgba(255, 245, 210, 0.85)');
      grad.addColorStop(0.55, 'rgba(180, 240, 220, 0.35)');
      grad.addColorStop(0.85, 'rgba(120, 200, 180, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const createLiveCosmicSky = () => {
      const cosmicGroup = new THREE.Group();
      cosmicGroup.name = 'LIVE_COSMIC_SKY_BRAHMAND';
      skyGroupRef.current = cosmicGroup;
      const starTex = createSoftStarTexture();

      // 1. Deep Celestial Cosmic Dome
      const domeGeo = new THREE.SphereGeometry(140, 32, 16);
      const domeMat = new THREE.MeshBasicMaterial({
        color: 0x010806,
        side: THREE.BackSide,
        depthWrite: false
      });
      const celestialDome = new THREE.Mesh(domeGeo, domeMat);
      cosmicGroup.add(celestialDome);

      // 2. Distant Deep Space Stars (3800 points) - Tiny, distant, naturalized circular points
      const distantCount = 3800;
      const distantPos = new Float32Array(distantCount * 3);
      const distantCol = new Float32Array(distantCount * 3);
      for (let i = 0; i < distantCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 110 + Math.random() * 25;

        distantPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        distantPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 6;
        distantPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

        const tint = Math.random();
        if (tint > 0.7) {
          distantCol[i * 3] = 1.0;
          distantCol[i * 3 + 1] = 0.88;
          distantCol[i * 3 + 2] = 0.45;
        } else if (tint > 0.4) {
          distantCol[i * 3] = 0.85;
          distantCol[i * 3 + 1] = 0.95;
          distantCol[i * 3 + 2] = 1.0;
        } else {
          distantCol[i * 3] = 0.55;
          distantCol[i * 3 + 1] = 0.95;
          distantCol[i * 3 + 2] = 0.80;
        }
      }
      const distantGeo = new THREE.BufferGeometry();
      distantGeo.setAttribute('position', new THREE.BufferAttribute(distantPos, 3));
      distantGeo.setAttribute('color', new THREE.BufferAttribute(distantCol, 3));
      const distantMat = new THREE.PointsMaterial({
        size: 0.85,
        map: starTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const distantPoints = new THREE.Points(distantGeo, distantMat);
      distantStarsRef.current = distantPoints;
      cosmicGroup.add(distantPoints);

      // 3. Mid-field Bright Vedic Yogataras / Major Constellation Stars (1200 points)
      const midCount = 1200;
      const midPos = new Float32Array(midCount * 3);
      const midCol = new Float32Array(midCount * 3);
      for (let i = 0; i < midCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 85 + Math.random() * 25;

        midPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        midPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 8;
        midPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

        const isSolar = Math.random() > 0.5;
        midCol[i * 3] = isSolar ? 1.0 : 0.9;
        midCol[i * 3 + 1] = isSolar ? 0.92 : 0.98;
        midCol[i * 3 + 2] = isSolar ? 0.65 : 1.0;
      }
      const midGeo = new THREE.BufferGeometry();
      midGeo.setAttribute('position', new THREE.BufferAttribute(midPos, 3));
      midGeo.setAttribute('color', new THREE.BufferAttribute(midCol, 3));
      const midMat = new THREE.PointsMaterial({
        size: 1.40,
        map: starTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.90,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const midPoints = new THREE.Points(midGeo, midMat);
      midStarsRef.current = midPoints;
      cosmicGroup.add(midPoints);

      // 4. Akash Ganga (Milky Way Luminous Ribbon) - Soft glowing stream (2800 particles)
      const mwCount = 2800;
      const mwPos = new Float32Array(mwCount * 3);
      const mwCol = new Float32Array(mwCount * 3);
      const mwTilt = Math.PI * 0.28;
      for (let i = 0; i < mwCount; i++) {
        const t = (Math.random() - 0.5) * Math.PI * 1.8;
        const ribbonRadius = 95 + (Math.random() - 0.5) * 16;
        const spread = (Math.random() - 0.5) * (Math.random() - 0.5) * 28;

        const rawX = Math.cos(t) * ribbonRadius;
        const rawY = Math.sin(t) * ribbonRadius;
        const rawZ = spread;

        const yRot = Math.PI * 0.25;
        const tiltedX = rawX * Math.cos(yRot) - rawZ * Math.sin(yRot);
        const intermediateZ = rawX * Math.sin(yRot) + rawZ * Math.cos(yRot);
        const finalY = Math.abs(rawY * Math.cos(mwTilt) - intermediateZ * Math.sin(mwTilt)) + 12;
        const finalZ = rawY * Math.sin(mwTilt) + intermediateZ * Math.cos(mwTilt);

        mwPos[i * 3] = tiltedX;
        mwPos[i * 3 + 1] = finalY;
        mwPos[i * 3 + 2] = finalZ;

        const mwColorTier = Math.random();
        if (mwColorTier > 0.6) {
          mwCol[i * 3] = 0.95; mwCol[i * 3 + 1] = 0.85; mwCol[i * 3 + 2] = 0.45;
        } else if (mwColorTier > 0.3) {
          mwCol[i * 3] = 0.40; mwCol[i * 3 + 1] = 0.85; mwCol[i * 3 + 2] = 0.95;
        } else {
          mwCol[i * 3] = 0.80; mwCol[i * 3 + 1] = 0.70; mwCol[i * 3 + 2] = 0.98;
        }
      }
      const mwGeo = new THREE.BufferGeometry();
      mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPos, 3));
      mwGeo.setAttribute('color', new THREE.BufferAttribute(mwCol, 3));
      const mwMat = new THREE.PointsMaterial({
        size: 2.1,
        map: starTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.40,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const mwPoints = new THREE.Points(mwGeo, mwMat);
      milkyWayRef.current = mwPoints;
      cosmicGroup.add(mwPoints);

      // 5. Procedural Glowing Nebulae Clouds (Section 11: Soft, distant, semi-transparent)
      const nebulaGroup = new THREE.Group();
      nebulaGroupRef.current = nebulaGroup;
      const nebulaColors = [
        ['#064e3b', '#10b981'],
        ['#78350f', '#f59e0b'],
        ['#1e1b4b', '#6366f1'],
        ['#4c1d95', '#c084fc']
      ];
      nebulaColors.forEach(([baseC, accC], idx) => {
        const tex = createNebulaTexture(baseC, accC);
        const nMat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.20,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        const nMesh = new THREE.Mesh(new THREE.PlaneGeometry(55, 55), nMat);
        const ang = (idx * Math.PI * 2) / 4 + 0.4;
        const nDist = 95;
        nMesh.position.set(Math.cos(ang) * nDist, 72 + (idx % 2) * 14, Math.sin(ang) * nDist);
        nMesh.lookAt(0, 0, 0);
        nebulaGroup.add(nMesh);
      });
      cosmicGroup.add(nebulaGroup);

      // 6. 27 Vedic Nakshatra Yogataras (Prominent Radiant Marker Stars across Ecliptic)
      const nakCount = 27;
      const nakPos = new Float32Array(nakCount * 3);
      const nakCol = new Float32Array(nakCount * 3);
      for (let i = 0; i < nakCount; i++) {
        const ang = (i * 2 * Math.PI) / 27;
        const r = 105 + (i % 3) * 5;
        const nx = Math.cos(ang) * r;
        const ny = 48 + Math.sin(ang * 2) * 14 + ((i % 4) * 4);
        const nz = Math.sin(ang) * r;

        nakPos[i * 3] = nx;
        nakPos[i * 3 + 1] = ny;
        nakPos[i * 3 + 2] = nz;

        // Distinct Vedic Yogatara colors
        if (i === 3 || i === 5 || i === 17) {
          // Rohini, Ardra, Jyeshtha (Red/Amber Giants)
          nakCol[i * 3] = 1.0; nakCol[i * 3 + 1] = 0.45; nakCol[i * 3 + 2] = 0.25;
        } else if (i === 13 || i === 9 || i === 21) {
          // Chitra, Magha, Shravana (Brilliant Diamond/Blue Spica/Altair)
          nakCol[i * 3] = 0.65; nakCol[i * 3 + 1] = 0.85; nakCol[i * 3 + 2] = 1.0;
        } else {
          // Celestial Golden Starlight
          nakCol[i * 3] = 1.0; nakCol[i * 3 + 1] = 0.92; nakCol[i * 3 + 2] = 0.55;
        }
      }
      const nakGeo = new THREE.BufferGeometry();
      nakGeo.setAttribute('position', new THREE.BufferAttribute(nakPos, 3));
      nakGeo.setAttribute('color', new THREE.BufferAttribute(nakCol, 3));
      const nakMat = new THREE.PointsMaterial({
        size: 3.0,
        map: starTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const nakPoints = new THREE.Points(nakGeo, nakMat);
      nakshatrasRef.current = nakPoints;
      cosmicGroup.add(nakPoints);

      // 7. Saptarishi Constellation (The 7 Ancient Rishis) & Dhruva Tara (Pole Star) in North Sky
      const saptarishiGroup = new THREE.Group();
      saptarishiGroupRef.current = saptarishiGroup;
      const rishiStars = [
        [-18, 92, -95], // Kratu
        [-10, 88, -96], // Pulaha
        [-4, 82, -98],  // Pulastya
        [4, 85, -97],   // Atri
        [14, 90, -96],  // Angiras
        [22, 98, -94],  // Marichi
        [28, 105, -92]  // Vashistha
      ];
      const rishiPointsMat = new THREE.PointsMaterial({
        size: 3.4,
        map: starTex,
        color: 0xfff0b3,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const rishiGeo = new THREE.BufferGeometry();
      const rishiFloatPos = new Float32Array(rishiStars.flat());
      rishiGeo.setAttribute('position', new THREE.BufferAttribute(rishiFloatPos, 3));
      saptarishiGroup.add(new THREE.Points(rishiGeo, rishiPointsMat));

      // Dhruva Tara (Brilliant North Pole Star)
      const dhruvaGeo = new THREE.BufferGeometry();
      dhruvaGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-14, 118, -98]), 3));
      const dhruvaMat = new THREE.PointsMaterial({
        size: 4.2,
        map: starTex,
        color: 0xffffff,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      saptarishiGroup.add(new THREE.Points(dhruvaGeo, dhruvaMat));
      cosmicGroup.add(saptarishiGroup);

      return cosmicGroup;
    };

    scene.add(createLiveCosmicSky());

    // 5. Lighting System (Section 15: Increased ambient visibility with warm gold and emerald bounce)
    const ambientLight = new THREE.AmbientLight(0x225540, 3.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x4e8570, 0x1f4632, 2.4);
    scene.add(hemiLight);

    const courtyardDownFill = new THREE.DirectionalLight(0xfff6e5, 1.8);
    courtyardDownFill.position.set(0, 32, 6);
    courtyardDownFill.target.position.set(0, 0, 0);
    scene.add(courtyardDownFill);
    scene.add(courtyardDownFill.target);

    const celestialKeyLight = new THREE.DirectionalLight(0xfff4dc, 2.9);
    celestialKeyLight.position.set(18, 38, 24);
    scene.add(celestialKeyLight);

    const rimLight = new THREE.DirectionalLight(0x62b392, 1.5);
    rimLight.position.set(-20, 25, -20);
    scene.add(rimLight);

    const courtyardGlow = new THREE.PointLight(0xf59e0b, 2.8, 28);
    courtyardGlow.position.set(0, 2.0, 0);
    scene.add(courtyardGlow);

    // 6. Materials (Section 16: Rich emerald, deep stone, and warm teakwood avoiding pure black holes)
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.22
    });
    goldTrimMatRef.current = goldTrimMat;

    const palaceWallMat = new THREE.MeshStandardMaterial({
      color: 0x0c3122,
      roughness: 0.38,
      metalness: 0.20
    });
    palaceWallMatRef.current = palaceWallMat;

    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x153d2b,
      roughness: 0.48,
      metalness: 0.18
    });

    const corridorFloorMat = new THREE.MeshStandardMaterial({
      color: 0x0f3325,
      roughness: 0.32,
      metalness: 0.22
    });

    const jaaliMat = new THREE.MeshStandardMaterial({
      color: 0xc09c37,
      metalness: 0.65,
      roughness: 0.35
    });

    const roofTileMat = new THREE.MeshStandardMaterial({
      color: 0x113b28,
      roughness: 0.38,
      metalness: 0.22
    });

    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x4a2814, // rich warm teakwood / rosewood
      roughness: 0.42,
      metalness: 0.12
    });

    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x0d4224,
      roughness: 0.7
    });

    const planterMat = new THREE.MeshStandardMaterial({
      color: 0x143d2b,
      roughness: 0.55,
      metalness: 0.2
    });

    const invisibleMat = new THREE.MeshBasicMaterial({ visible: false });

    // =========================================================================
    // 7. EXTERIOR WORLD GROUP (Visible strictly when outside)
    // =========================================================================
    // Outer raised estate plinth
    const outerPlinthGeo = new THREE.CylinderGeometry(15.4, 15.8, 0.7, 36);
    const outerPlinth = new THREE.Mesh(outerPlinthGeo, plinthMat);
    outerPlinth.position.y = -0.35;
    exteriorGroup.add(outerPlinth);

    const outerRimGeo = new THREE.TorusGeometry(15.4, 0.14, 12, 48);
    outerRimGeo.rotateX(Math.PI / 2);
    const outerRim = new THREE.Mesh(outerRimGeo, goldTrimMat);
    outerRim.position.y = 0.01;
    exteriorGroup.add(outerRim);

    // Front Stepped Ceremonial Approach
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.25, 4.5), plinthMat);
    step1.position.set(0, -0.12, 16.5);
    exteriorGroup.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.25, 3.5), plinthMat);
    step2.position.set(0, 0.08, 14.0);
    exteriorGroup.add(step2);

    const step3 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.25, 2.5), plinthMat);
    step3.position.set(0, 0.28, 11.5);
    exteriorGroup.add(step3);

    // Outer Prakaara Perimeter Boundary Wall with Carved Jaali Panels
    const perimeterGroup = new THREE.Group();
    const prakaaraRadius = 14.6;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      if (Math.abs(angle - Math.PI / 2) < 0.35) continue; // Skip South entrance portal

      const px = Math.cos(angle) * prakaaraRadius;
      const pz = Math.sin(angle) * prakaaraRadius;

      const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.85, 0.35), palaceWallMat);
      wallMesh.position.set(px, 0.42, pz);
      wallMesh.lookAt(0, 0.42, 0);
      perimeterGroup.add(wallMesh);

      const capMesh = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.1, 0.45), goldTrimMat);
      capMesh.position.set(px, 0.88, pz);
      capMesh.lookAt(0, 0.88, 0);
      perimeterGroup.add(capMesh);

      const jaaliMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.1), jaaliMat);
      jaaliMesh.position.set(px, 0.45, pz);
      jaaliMesh.lookAt(0, 0.45, 0);
      perimeterGroup.add(jaaliMesh);

      const postMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 1.05, 8), plinthMat);
      const postAngle = angle + (Math.PI / 16);
      postMesh.position.set(Math.cos(postAngle) * prakaaraRadius, 0.52, Math.sin(postAngle) * prakaaraRadius);
      perimeterGroup.add(postMesh);
    }
    exteriorGroup.add(perimeterGroup);

    // Exterior Garden: Cypress Trees in Urns
    const gardenGroup = new THREE.Group();
    const cypressPositions: [number, number, number][] = [
      [-4.4, 0.1, 16.5], [4.4, 0.1, 16.5],
      [-3.8, 0.3, 14.0], [3.8, 0.3, 14.0],
      [-3.2, 0.5, 11.5], [3.2, 0.5, 11.5]
    ];

    cypressPositions.forEach(([gx, gy, gz]) => {
      const urn = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.32, 0.65, 8), planterMat);
      urn.position.set(gx, gy + 0.32, gz);
      gardenGroup.add(urn);

      const urnRim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.05, 6, 16), goldTrimMat);
      urnRim.rotation.x = Math.PI / 2;
      urnRim.position.set(gx, gy + 0.65, gz);
      gardenGroup.add(urnRim);

      const treeTier1 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.2, 8), foliageMat);
      treeTier1.position.set(gx, gy + 1.6, gz);
      gardenGroup.add(treeTier1);

      const treeTier2 = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.8, 8), foliageMat);
      treeTier2.position.set(gx, gy + 2.4, gz);
      gardenGroup.add(treeTier2);

      const treeTier3 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 8), foliageMat);
      treeTier3.position.set(gx, gy + 3.0, gz);
      gardenGroup.add(treeTier3);
    });
    exteriorGroup.add(gardenGroup);

    // Diya Oil Lamps along exterior ceremonial approach
    diyaLightsRef.current = [];
    const extDiyaPositions: [number, number, number][] = [
      [-3.8, 0.4, 18], [3.8, 0.4, 18],
      [-3.4, 0.5, 14.5], [3.4, 0.5, 14.5],
      [-2.8, 0.6, 11.2], [2.8, 0.6, 11.2]
    ];

    extDiyaPositions.forEach(pos => {
      const diyaGroup = new THREE.Group();
      diyaGroup.position.set(...pos);

      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.5, 12), plinthMat);
      ped.position.y = -0.15;
      diyaGroup.add(ped);

      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.14, 0.18, 16), goldTrimMat);
      bowl.position.y = 0.15;
      diyaGroup.add(bowl);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 12), new THREE.MeshBasicMaterial({ color: 0xffaa22 }));
      flame.position.y = 0.32;
      diyaGroup.add(flame);

      const pLight = new THREE.PointLight(0xff9911, 1.8, 8);
      pLight.position.y = 0.4;
      diyaGroup.add(pLight);
      diyaLightsRef.current.push(pLight);

      exteriorGroup.add(diyaGroup);
    });

    // Grand Entrance Mahadvara Archway & Double Doors (South Exterior Facade)
    const extArchGroup = new THREE.Group();
    extArchGroup.position.set(0, 0, 9.4);

    const gatePillarGeo = new THREE.CylinderGeometry(0.5, 0.6, 5.2, 16);
    const leftPillar = new THREE.Mesh(gatePillarGeo, goldTrimMat);
    leftPillar.position.set(-2.4, 2.6, 0);
    extArchGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(gatePillarGeo, goldTrimMat);
    rightPillar.position.set(2.4, 2.6, 0);
    extArchGroup.add(rightPillar);

    // Physical Threshold Stone
    const thresholdGeo = new THREE.BoxGeometry(4.2, 0.28, 1.8);
    const thresholdMesh = new THREE.Mesh(thresholdGeo, plinthMat);
    thresholdMesh.position.set(0, 0.14, 0);
    extArchGroup.add(thresholdMesh);

    const thresholdEdgeGeo = new THREE.BoxGeometry(4.25, 0.05, 0.08);
    const thresholdEdge1 = new THREE.Mesh(thresholdEdgeGeo, goldTrimMat);
    thresholdEdge1.position.set(0, 0.28, 0.88);
    extArchGroup.add(thresholdEdge1);

    // Lintel Beam & Torana Arch
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.8, 1.2), palaceWallMat);
    lintel.position.set(0, 4.9, 0);
    extArchGroup.add(lintel);

    const archTrim = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.2, 12, 32, Math.PI), goldTrimMat);
    archTrim.position.set(0, 4.5, 0.2);
    extArchGroup.add(archTrim);

    // Exterior Entrance Plaque
    const extPlaqueTex = createGatePlaqueTexture('महाद्वार', 'गृह प्रवेश • कपाट स्पर्श करें', '#d4af37', '#03170e');
    const extPlaque = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.62), new THREE.MeshStandardMaterial({
      map: extPlaqueTex,
      roughness: 0.25,
      metalness: 0.35,
      emissive: new THREE.Color(0xd4af37),
      emissiveIntensity: 0.2
    }));
    extPlaque.position.set(0, 4.35, 0.65);
    extArchGroup.add(extPlaque);

    // Chhatri Dome & Finial
    const chhatri = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.3, 16), roofTileMat);
    chhatri.position.set(0, 5.9, 0);
    extArchGroup.add(chhatri);

    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), goldTrimMat);
    finial.position.set(0, 6.7, 0);
    extArchGroup.add(finial);

    // Grand Double Carved Teak Doors (Pivot Inward Into Vestibule on Opening)
    const leftDoorPivot = new THREE.Group();
    leftDoorPivot.position.set(-1.95, 0, 0);
    const leftDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 4.1, 0.2), doorMat);
    leftDoorPanel.position.set(0.95, 2.05, 0);
    leftDoorPivot.add(leftDoorPanel);

    const sunMedallionGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16);
    sunMedallionGeo.rotateX(Math.PI / 2);
    const leftSun = new THREE.Mesh(sunMedallionGeo, goldTrimMat);
    leftSun.position.set(1.0, 2.2, 0.12);
    leftDoorPivot.add(leftSun);

    leftDoorPivot.userData = { targetRotationY: 0 };
    extArchGroup.add(leftDoorPivot);
    leftDoorRef.current = leftDoorPivot;

    const rightDoorPivot = new THREE.Group();
    rightDoorPivot.position.set(1.95, 0, 0);
    const rightDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 4.1, 0.2), doorMat);
    rightDoorPanel.position.set(-0.95, 2.05, 0);
    rightDoorPivot.add(rightDoorPanel);

    const rightSun = new THREE.Mesh(sunMedallionGeo, goldTrimMat);
    rightSun.position.set(-1.0, 2.2, 0.12);
    rightDoorPivot.add(rightSun);

    rightDoorPivot.userData = { targetRotationY: 0 };
    extArchGroup.add(rightDoorPivot);
    rightDoorRef.current = rightDoorPivot;

    exteriorGroup.add(extArchGroup);

    // Interactive Hitbox for Main Gate
    const mainGateHit = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.8, 1.8), invisibleMat);
    mainGateHit.position.set(0, 2.4, 10.2);
    exteriorGroup.add(mainGateHit);
    interactiveHitboxesRef.current.push({ id: 'main_gate', mesh: mainGateHit });

    // =========================================================================
    // 8. INTERIOR WORLD GROUP (Visible strictly inside palace)
    // =========================================================================
    // Continuous Paved Verandah & Corridor Floor (Aalinda)
    const corridorRingGeo = new THREE.RingGeometry(6.6, 11.6, 48);
    corridorRingGeo.rotateX(-Math.PI / 2);
    const corridorRing = new THREE.Mesh(corridorRingGeo, corridorFloorMat);
    corridorRing.position.set(0, 0.04, 0);
    interiorGroup.add(corridorRing);

    const innerInlayGeo = new THREE.TorusGeometry(6.6, 0.05, 8, 48);
    innerInlayGeo.rotateX(Math.PI / 2);
    const innerInlay = new THREE.Mesh(innerInlayGeo, goldTrimMat);
    innerInlay.position.y = 0.05;
    interiorGroup.add(innerInlay);

    const outerInlayGeo = new THREE.TorusGeometry(11.6, 0.06, 8, 48);
    outerInlayGeo.rotateX(Math.PI / 2);
    const outerInlay = new THREE.Mesh(outerInlayGeo, goldTrimMat);
    outerInlay.position.y = 0.05;
    interiorGroup.add(outerInlay);

    // Central Courtyard: Sacred Lotus Floor & Reflective Water Kund
    const courtyardFloorGeo = new THREE.CircleGeometry(6.2, 48);
    courtyardFloorGeo.rotateX(-Math.PI / 2);
    const mandalaTexture = createMandalaTexture();
    const courtyardFloorMat = new THREE.MeshStandardMaterial({
      map: mandalaTexture,
      roughness: 0.25,
      metalness: 0.35
    });
    const courtyardFloor = new THREE.Mesh(courtyardFloorGeo, courtyardFloorMat);
    courtyardFloor.position.set(0, 0.03, 0);
    interiorGroup.add(courtyardFloor);

    // Phase 4.5 Section 17: Sacred Water Kund (Reflective pool surrounding the Pragya Deep Altar)
    const waterKundGeo = new THREE.RingGeometry(1.8, 5.4, 48);
    waterKundGeo.rotateX(-Math.PI / 2);
    const waterKundMat = new THREE.MeshStandardMaterial({
      color: 0x052e22,
      roughness: 0.08,
      metalness: 0.88,
      emissive: 0x021810,
      emissiveIntensity: 0.25
    });
    const waterRing = new THREE.Mesh(waterKundGeo, waterKundMat);
    waterRing.position.set(0, 0.035, 0);
    interiorGroup.add(waterRing);
    waterRingRef.current = waterRing;

    // Gold Kund Ornamental Kerbing
    const innerKundCurb = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.025, 8, 36), goldTrimMat);
    innerKundCurb.rotation.x = Math.PI / 2;
    innerKundCurb.position.y = 0.04;
    interiorGroup.add(innerKundCurb);

    const outerKundCurb = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.03, 8, 48), goldTrimMat);
    outerKundCurb.rotation.x = Math.PI / 2;
    outerKundCurb.position.y = 0.04;
    interiorGroup.add(outerKundCurb);

    // Interactive Hitbox for Central Courtyard (Jeevan Pragya)
    const courtyardHitGeo = new THREE.CylinderGeometry(3.6, 3.6, 1.4, 16);
    const courtyardHitMesh = new THREE.Mesh(courtyardHitGeo, invisibleMat);
    courtyardHitMesh.position.set(0, 0.7, 0);
    interiorGroup.add(courtyardHitMesh);
    interactiveHitboxesRef.current.push({ id: 'courtyard', mesh: courtyardHitMesh });

    // Central Altar: Pragya Deep & Trikala Ring (Low profile keeping all sightlines clear)
    const altarGroup = new THREE.Group();
    altarGroup.position.set(0, 0.03, 0);

    const altarBase = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.22, 8), plinthMat);
    altarBase.position.y = 0.11;
    altarGroup.add(altarBase);

    const altarUpper = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 0.18, 8), plinthMat);
    altarUpper.position.y = 0.28;
    altarGroup.add(altarUpper);

    const altarGoldTrim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.04, 8, 24), goldTrimMat);
    altarGoldTrim.rotation.x = Math.PI / 2;
    altarGoldTrim.position.y = 0.38;
    altarGroup.add(altarGoldTrim);

    const sanctumPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.42, 8), palaceWallMat);
    sanctumPedestal.position.y = 0.58;
    altarGroup.add(sanctumPedestal);

    // Pragya Nameplate mounted on front face
    const nameplateTex = createPragyaNameplateTexture();
    const nameplateGroup = new THREE.Group();
    nameplateGroup.position.set(0, 0.44, 1.18);
    nameplateGroup.rotation.x = -Math.PI * 0.12;

    const bezelMesh = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.70, 0.06), goldTrimMat);
    nameplateGroup.add(bezelMesh);

    const stoneBacking = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.64, 0.08), palaceWallMat);
    stoneBacking.position.z = -0.01;
    nameplateGroup.add(stoneBacking);

    const plaqueFront = new THREE.Mesh(new THREE.PlaneGeometry(1.58, 0.60), new THREE.MeshStandardMaterial({
      map: nameplateTex,
      roughness: 0.25,
      metalness: 0.35,
      emissive: 0x05291b,
      emissiveIntensity: 0.3
    }));
    plaqueFront.position.z = 0.035;
    nameplateGroup.add(plaqueFront);
    altarGroup.add(nameplateGroup);

    const emeraldRimLight = new THREE.PointLight(0x10b981, 1.8, 6.5);
    emeraldRimLight.position.set(0, 0.52, 0);
    altarGroup.add(emeraldRimLight);

    const pragyaMandala = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.04, 32), new THREE.MeshStandardMaterial({
      map: mandalaTexture,
      roughness: 0.2,
      metalness: 0.45
    }));
    pragyaMandala.position.y = 0.81;
    altarGroup.add(pragyaMandala);

    const pragyaGoldRim = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.025, 8, 32), goldTrimMat);
    pragyaGoldRim.rotation.x = Math.PI / 2;
    pragyaGoldRim.position.y = 0.83;
    altarGroup.add(pragyaGoldRim);

    // Pragya Deep Sacred Vessel
    const diyaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.14, 0.18, 16), goldTrimMat);
    diyaBase.position.y = 0.91;
    altarGroup.add(diyaBase);

    const diyaRim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 24), goldTrimMat);
    diyaRim.rotation.x = Math.PI / 2;
    diyaRim.position.y = 0.99;
    altarGroup.add(diyaRim);

    // Sacred Akhanda Jyoti
    const innerFlameGeo = new THREE.SphereGeometry(0.075, 16, 16);
    innerFlameGeo.scale(1.0, 1.8, 1.0);
    const innerFlame = new THREE.Mesh(innerFlameGeo, new THREE.MeshStandardMaterial({
      color: 0xfff3b0,
      emissive: 0xffaa00,
      emissiveIntensity: 2.2,
      roughness: 0.1
    }));
    innerFlame.position.y = 1.06;
    altarGroup.add(innerFlame);

    const outerFlameGeo = new THREE.SphereGeometry(0.11, 16, 16);
    outerFlameGeo.scale(1.0, 1.9, 1.0);
    const outerFlame = new THREE.Mesh(outerFlameGeo, new THREE.MeshStandardMaterial({
      color: 0xff9900,
      emissive: 0xff6600,
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1
    }));
    outerFlame.position.y = 1.07;
    altarGroup.add(outerFlame);

    const pragyaLight = new THREE.PointLight(0xffb74d, 2.8, 8.5);
    pragyaLight.position.set(0, 1.18, 0);
    altarGroup.add(pragyaLight);
    pragyaFlameLightRef.current = pragyaLight;

    // Phase 4.6-D Visual Patch: Central Brahmasthan Altar
    // Pure sacred astrolabe celestial rings with fine Navaratna gems around the Akhanda Jyoti
    // NO floating badges, doors, or panels in the center, keeping central courtyard open and unobstructed
    const trikalaGroup = new THREE.Group();
    trikalaGroup.position.set(0, 1.28, 0);

    const celestialRingGeo = new THREE.TorusGeometry(0.85, 0.022, 12, 48);
    celestialRingGeo.rotateX(Math.PI / 2);
    const celestialRing = new THREE.Mesh(celestialRingGeo, goldTrimMat);
    trikalaGroup.add(celestialRing);

    const tiltedRing = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.016, 12, 36), goldTrimMat);
    tiltedRing.rotation.x = Math.PI * 0.35;
    trikalaGroup.add(tiltedRing);

    // Delicate decorative Navaratna gems along the celestial ring
    const gemAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
    const gemColors = [0xf59e0b, 0x10b981, 0x38bdf8];
    gemAngles.forEach((ang, idx) => {
      const sx = Math.cos(ang) * 0.85;
      const sz = Math.sin(ang) * 0.85;
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), new THREE.MeshStandardMaterial({
        color: gemColors[idx],
        emissive: gemColors[idx],
        emissiveIntensity: 1.2,
        roughness: 0.15
      }));
      gem.position.set(sx, 0, sz);
      trikalaGroup.add(gem);
    });

    altarGroup.add(trikalaGroup);
    interiorGroup.add(altarGroup);
    trikalaRingRef.current = trikalaGroup;
    astrolabeGroupRef.current = trikalaGroup;

    // Phase 4.6-D Visual Patch: Central Brahmasthan remains clear and unobstructed
    floorPathwaysRef.current = [];
    windowLightsRef.current = [];

    // 4 Corner Chhatri Pavilions & Wing Colonnades
    const wingsGroup = new THREE.Group();
    const cornerAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    cornerAngles.forEach(ang => {
      const kx = Math.cos(ang) * 10.8;
      const kz = Math.sin(ang) * 10.8;

      const cornerGroup = new THREE.Group();
      cornerGroup.position.set(kx, 0, kz);
      cornerGroup.lookAt(0, 0, 0);

      const kBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.4, 8), plinthMat);
      kBase.position.y = 0.2;
      cornerGroup.add(kBase);

      const kPillarGeo = new THREE.CylinderGeometry(0.09, 0.1, 2.8, 8);
      const kOffsets = [[-0.65, -0.65], [0.65, -0.65], [-0.65, 0.65], [0.65, 0.65]];
      kOffsets.forEach(([px, pz]) => {
        const pil = new THREE.Mesh(kPillarGeo, goldTrimMat);
        pil.position.set(px, 1.7, pz);
        cornerGroup.add(pil);
      });

      const kRoof = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.9, 8), roofTileMat);
      kRoof.position.y = 3.45;
      cornerGroup.add(kRoof);

      const kFinial = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), goldTrimMat);
      kFinial.position.y = 4.0;
      cornerGroup.add(kFinial);

      wingsGroup.add(cornerGroup);
    });

    // Continuous Eaves (Chhajjas) along North, East, and West wings
    // For South Wing, we split into left and right canopies leaving the South Gateway open in the center
    const fullWingAngles = [
      -Math.PI / 2, // North Wing
      0,            // East Wing
      Math.PI       // West Wing
    ];

    fullWingAngles.forEach(midAng => {
      const chhajja = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.18, 2.2), roofTileMat);
      chhajja.position.set(Math.cos(midAng) * 9.8, 3.45, Math.sin(midAng) * 9.8);
      chhajja.lookAt(0, 3.45, 0);
      wingsGroup.add(chhajja);

      const cornice = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.08, 0.35), goldTrimMat);
      cornice.position.set(Math.cos(midAng) * 8.8, 3.4, Math.sin(midAng) * 8.8);
      cornice.lookAt(0, 3.4, 0);
      wingsGroup.add(cornice);
    });

    // South Wing Split Eaves (Flanking South Gateway without blocking center sightline)
    const southLeftChhajja = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 2.0), roofTileMat);
    southLeftChhajja.position.set(4.2, 3.45, 9.6);
    southLeftChhajja.lookAt(0, 3.45, 0);
    wingsGroup.add(southLeftChhajja);

    const southRightChhajja = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 2.0), roofTileMat);
    southRightChhajja.position.set(-4.2, 3.45, 9.6);
    southRightChhajja.lookAt(0, 3.45, 0);
    wingsGroup.add(southRightChhajja);

    interiorGroup.add(wingsGroup);

    // =========================================================================
    // 9. THE 12 ASTROLOGICAL BHAVAS (Real Enclosed Rooms around Perimeter)
    // =========================================================================
    const chamberRadius = 9.2;
    chamberMeshesRef.current.clear();

    // Reusable sacred architectural reverse face texture for all 12 Bhava Shilapattas
    const plaqueReverseTex = createPlaqueReverseTexture();

    CHAMBER_DEFINITIONS.forEach((chamber) => {
      if (chamber.id === 'courtyard' || chamber.id === 'guardian_sanctum' || !chamber.houseNumber) return;

      const angle = getChamberAngle(chamber.houseNumber);
      const x = Math.cos(angle) * chamberRadius;
      const z = Math.sin(angle) * chamberRadius;

      const cGroup = new THREE.Group();
      cGroup.position.set(x, 0, z);
      cGroup.lookAt(0, 0, 0); // Face inward toward central courtyard

      // Stepped Room Plinth
      const cBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 2.6), palaceWallMat);
      cBase.position.set(0, 0.18, 0);
      cGroup.add(cBase);

      const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.08, 2.65), goldTrimMat);
      baseTrim.position.set(0, 0.34, 0);
      cGroup.add(baseTrim);

      // Solid Rear Wall (outer perimeter boundary of the room)
      const rearWall = new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.9, 0.35), palaceWallMat);
      rearWall.position.set(0, 1.8, -1.15);
      cGroup.add(rearWall);

      // =======================================================================
      // PHASE 4.3: 3D KUNDLI BHAVA CHAMBER (RASHI INSCRIPTION & PLANETS)
      // =======================================================================
      const astroContentGroup = new THREE.Group();
      astroContentGroup.name = 'astro_content';

      const bhavaInfo = BHAVA_CONFIG[chamber.houseNumber] || {
        devanagariNum: `${chamber.houseNumber}`,
        name: chamber.hindiTitle || chamber.sanskritName,
        subtitle: chamber.englishTitle
      };

      populateChamberAstrology(
        astroContentGroup,
        chamber.houseNumber,
        bhavaInfo,
        bhavaAstroViewModels[chamber.houseNumber],
        palaceWallMat,
        goldTrimMat
      );

      cGroup.add(astroContentGroup);

      // Left & Right Partition Walls
      const leftSideWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.9, 2.3), palaceWallMat);
      leftSideWall.position.set(-1.25, 1.8, 0);
      cGroup.add(leftSideWall);

      const rightSideWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.9, 2.3), palaceWallMat);
      rightSideWall.position.set(1.25, 1.8, 0);
      cGroup.add(rightSideWall);

      // Front Courtyard-facing Colonnade & Torana Arch
      const pLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.9, 12), goldTrimMat);
      pLeft.position.set(-1.0, 1.8, 1.15);
      cGroup.add(pLeft);

      const pRight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.9, 12), goldTrimMat);
      pRight.position.set(1.0, 1.8, 1.15);
      cGroup.add(pRight);

      const archFront = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.09, 8, 24, Math.PI), goldTrimMat);
      archFront.position.set(0, 2.65, 1.15);
      cGroup.add(archFront);

      // Door panels ajar revealing room interior
      const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.1, 0.1), doorMat);
      doorL.position.set(-0.55, 1.38, 0.95);
      doorL.rotation.y = -Math.PI * 0.18;
      cGroup.add(doorL);

      const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.1, 0.1), doorMat);
      doorR.position.set(0.55, 1.38, 0.95);
      doorR.rotation.y = Math.PI * 0.18;
      cGroup.add(doorR);

      // Pyramid Cone Roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.65, 1.1, 8), roofTileMat);
      roof.position.set(0, 3.75, 0);
      cGroup.add(roof);

      const kalash = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), goldTrimMat);
      kalash.position.set(0, 4.4, -0.15);
      cGroup.add(kalash);

      // =======================================================================
      // PHASE 4.5: AUTHENTIC ARCHITECTURAL BHAVA SHILAPATTA & INTEGRATED MOUNT
      // =======================================================================
      const plaqueTransform = getBhavaPlaqueTransform(chamber.houseNumber, 4.40, 0.28);
      const initialModel = bhavaAstroViewModels[chamber.houseNumber];
      const initialRashiNum = initialModel?.rashiNumber || (((chamber.houseNumber - 1) % 12) + 1);
      const initialRashiName = initialModel?.rashiName || `राशि ${initialRashiNum}`;
      const initialSignLord = initialModel?.signLord || 'डेटा उपलब्ध नहीं';
      const plaqueTex = createChamberPlaqueTexture(
        chamber.houseNumber,
        initialModel?.bhavaName || bhavaInfo.name,
        initialRashiNum,
        initialRashiName,
        initialSignLord
      );

      const mountZ = 0.35;
      const plaqueCenterY = plaqueTransform.position.y; // 5.01
      const plaqueW = plaqueTransform.width; // 1.72
      const plaqueH = plaqueTransform.height; // 0.66
      const plaqueBottomY = plaqueCenterY - (plaqueH / 2);
      const plaqueTopY = plaqueCenterY + (plaqueH / 2);

      const shilapattaGroup = new THREE.Group();

      // 1. CARVED VERTICAL SANDSTONE PEDESTAL (anchored seamlessly into chamber roof ridge)
      const pedestalBase = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, 0.34), palaceWallMat);
      pedestalBase.position.set(0, 4.30, mountZ);
      shilapattaGroup.add(pedestalBase);

      const pedestalShaft = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.22, 0.26), palaceWallMat);
      pedestalShaft.position.set(0, 4.49, mountZ);
      shilapattaGroup.add(pedestalShaft);

      const pedestalCollar = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.28), goldTrimMat);
      pedestalCollar.position.set(0, 4.60, mountZ);
      shilapattaGroup.add(pedestalCollar);

      // 2. CENTRAL CARVED LOTUS CORBEL (cradles the center underside of the plaque)
      const corbelRing = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.04, 12), goldTrimMat);
      corbelRing.position.set(0, 4.63, mountZ);
      shilapattaGroup.add(corbelRing);

      const corbelLotus = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.16, 0.07, 12), goldTrimMat);
      corbelLotus.position.set(0, 4.67, mountZ);
      shilapattaGroup.add(corbelLotus);

      const corbelCap = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.03, 0.20), goldTrimMat);
      corbelCap.position.set(0, 4.70, mountZ);
      shilapattaGroup.add(corbelCap);

      // 3. TWO CARVED SANDSTONE/GOLD BRACKETS (\  /)
      const leftBracketStrut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.08), goldTrimMat);
      leftBracketStrut.position.set(-0.35, 4.66, mountZ);
      leftBracketStrut.rotation.z = 0.78;
      shilapattaGroup.add(leftBracketStrut);

      const leftBracketFlank = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.06), palaceWallMat);
      leftBracketFlank.position.set(-0.35, 4.65, mountZ);
      leftBracketFlank.rotation.z = 0.78;
      shilapattaGroup.add(leftBracketFlank);

      const leftBracketBoss = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), goldTrimMat);
      leftBracketBoss.position.set(-0.55, plaqueBottomY, mountZ);
      shilapattaGroup.add(leftBracketBoss);

      const rightBracketStrut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.08), goldTrimMat);
      rightBracketStrut.position.set(0.35, 4.66, mountZ);
      rightBracketStrut.rotation.z = -0.78;
      shilapattaGroup.add(rightBracketStrut);

      const rightBracketFlank = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.06), palaceWallMat);
      rightBracketFlank.position.set(0.35, 4.65, mountZ);
      rightBracketFlank.rotation.z = -0.78;
      shilapattaGroup.add(rightBracketFlank);

      const rightBracketBoss = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), goldTrimMat);
      rightBracketBoss.position.set(0.55, plaqueBottomY, mountZ);
      shilapattaGroup.add(rightBracketBoss);

      // 4. SUBTLE GOLD ORNAMENTAL SUPPORT (Horizontal rail & mounting clamps)
      const supportRail = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.04, 0.10), goldTrimMat);
      supportRail.position.set(0, plaqueBottomY, mountZ);
      shilapattaGroup.add(supportRail);

      const clampL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.10), goldTrimMat);
      clampL.position.set(-0.55, plaqueBottomY + 0.04, mountZ);
      shilapattaGroup.add(clampL);

      const clampR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.10), goldTrimMat);
      clampR.position.set(0.55, plaqueBottomY + 0.04, mountZ);
      shilapattaGroup.add(clampR);

      // 5. CARVED PALACE BHAVA SHILAPATTA (Frame & Inscribed Stone)
      const outerFrame = new THREE.Mesh(
        new THREE.BoxGeometry(plaqueW, plaqueH, 0.08),
        goldTrimMat
      );
      outerFrame.position.set(0, plaqueCenterY, mountZ);
      shilapattaGroup.add(outerFrame);

      // 4 Front corner floral rosettes
      const rosetteGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const rX = plaqueW / 2 - 0.07;
      const rY = plaqueH / 2 - 0.07;
      [[-rX, rY], [rX, rY], [-rX, -rY], [rX, -rY]].forEach(([cx, cy]) => {
        const rosetteF = new THREE.Mesh(rosetteGeo, goldTrimMat);
        rosetteF.position.set(cx, plaqueCenterY + cy, mountZ + 0.045);
        shilapattaGroup.add(rosetteF);

        const rosetteB = new THREE.Mesh(rosetteGeo, goldTrimMat);
        rosetteB.position.set(cx, plaqueCenterY + cy, mountZ - 0.045);
        shilapattaGroup.add(rosetteB);
      });

      // Front Face (Polished Emerald Stone Inscription facing central courtyard)
      const frontMat = new THREE.MeshStandardMaterial({
        map: plaqueTex,
        roughness: 0.32,
        metalness: 0.22,
        emissive: new THREE.Color(0x082b1c),
        emissiveIntensity: 0.35,
        side: THREE.FrontSide
      });
      const plaqueFace = new THREE.Mesh(
        new THREE.PlaneGeometry(plaqueW - 0.08, plaqueH - 0.08),
        frontMat
      );
      plaqueFace.position.set(0, plaqueCenterY, mountZ + 0.042);
      shilapattaGroup.add(plaqueFace);
      bhavaPlaqueMeshesRef.current.set(chamber.houseNumber, plaqueFace);

      // Rear Face (Sacred Lotus Mandala Emblem - avoids mirrored text during 360° orbit)
      const reverseMat = new THREE.MeshStandardMaterial({
        map: plaqueReverseTex,
        roughness: 0.38,
        metalness: 0.20,
        emissive: new THREE.Color(0x051a10),
        emissiveIntensity: 0.25,
        side: THREE.FrontSide
      });
      const plaqueBackFace = new THREE.Mesh(
        new THREE.PlaneGeometry(plaqueW - 0.10, plaqueH - 0.10),
        reverseMat
      );
      plaqueBackFace.rotation.y = Math.PI;
      plaqueBackFace.position.set(0, plaqueCenterY, mountZ - 0.042);
      shilapattaGroup.add(plaqueBackFace);

      // 6. MINIATURE KALASH FINIAL (Crowning the Plaque Frame)
      const kalashRing = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.14, 0.04, 12), goldTrimMat);
      kalashRing.position.set(0, plaqueTopY + 0.02, mountZ);
      shilapattaGroup.add(kalashRing);

      const plaqueKalash = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), goldTrimMat);
      plaqueKalash.position.set(0, plaqueTopY + 0.10, mountZ);
      shilapattaGroup.add(plaqueKalash);

      const kalashSpire = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.11, 8), goldTrimMat);
      kalashSpire.position.set(0, plaqueTopY + 0.20, mountZ);
      shilapattaGroup.add(kalashSpire);

      // 7. DEDICATED PLAQUE SOFT GOLD EDGE LIGHT
      const plaqueGlowLight = new THREE.PointLight(new THREE.Color('#fef08a'), 0.40, 2.5);
      plaqueGlowLight.position.set(0, plaqueCenterY, mountZ + 0.55);
      shilapattaGroup.add(plaqueGlowLight);

      cGroup.add(shilapattaGroup);

      // Warm Room Light
      const interiorLight = new THREE.PointLight(new THREE.Color(chamber.color), 1.6, 5.5);
      interiorLight.position.set(0, 1.8, 0);
      cGroup.add(interiorLight);

      interiorGroup.add(cGroup);
      chamberMeshesRef.current.set(chamber.id, cGroup);

      // Interactive Hitbox (Encompassing chamber entrance, pillars, and elevated plaque)
      const chamberHit = new THREE.Mesh(new THREE.BoxGeometry(2.8, 5.8, 2.8), invisibleMat);
      chamberHit.position.set(x, 2.9, z);
      chamberHit.lookAt(0, 2.9, 0);
      interiorGroup.add(chamberHit);
      interactiveHitboxesRef.current.push({ id: chamber.id, mesh: chamberHit });
    });

    // =========================================================================
    // 9B. THREE SPECIAL BHAVA-ORBIT TRI-KALA CHAMBERS (अतीत • वर्तमान • भविष्य)
    // Positioned on the same circular orbit ring (radius = 9.2m) as Bhava chambers
    // Built as real architectural palace chambers with matching emerald walls,
    // gold trim, colonnade pillars, Torana arch, pyramid roof, kalash, and Shilapatta!
    // =========================================================================
    const trikalaSpecialChambers = [
      {
        id: 'window_past' as const,
        primaryText: 'अतीत',
        subtitleText: 'पूर्व जीवन • जीवन के बीते चरण',
        angle: Math.PI * (157.5 / 180),
        accentColor: '#f59e0b',
        lightColor: 0xf59e0b,
        portalGradA: '#6b3a06',
        portalGradB: '#f59e0b',
      },
      {
        id: 'window_present' as const,
        primaryText: 'वर्तमान',
        subtitleText: 'आज के संकेत • वर्तमान जीवन',
        angle: -Math.PI * (75.0 / 180),
        accentColor: '#10b981',
        lightColor: 0x10b981,
        portalGradA: '#043b22',
        portalGradB: '#34d399',
      },
      {
        id: 'window_future' as const,
        primaryText: 'भविष्य',
        subtitleText: 'समय-खिड़कियाँ • आगे के संकेत',
        angle: Math.PI * (36.0 / 180),
        accentColor: '#38bdf8',
        lightColor: 0x38bdf8,
        portalGradA: '#03293d',
        portalGradB: '#38bdf8',
      }
    ];

    trikalaSpecialChambers.forEach(win => {
      const angle = win.angle;
      const x = Math.cos(angle) * chamberRadius;
      const z = Math.sin(angle) * chamberRadius;

      const cGroup = new THREE.Group();
      cGroup.position.set(x, 0, z);
      cGroup.lookAt(0, 0, 0); // Face inward toward central courtyard

      // Stepped Room Plinth (slender pavilion width 1.3m preventing any collision with adjacent Bhavas)
      const cBase = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 1.3), palaceWallMat);
      cBase.position.set(0, 0.18, 0);
      cGroup.add(cBase);

      const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 1.35), goldTrimMat);
      baseTrim.position.set(0, 0.34, 0);
      cGroup.add(baseTrim);

      // Solid Rear Wall (outer perimeter boundary of room)
      const rearWall = new THREE.Mesh(new THREE.BoxGeometry(1.22, 2.9, 0.25), palaceWallMat);
      rearWall.position.set(0, 1.8, -0.52);
      cGroup.add(rearWall);

      // Left & Right Partition Walls
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.9, 1.1), palaceWallMat);
      leftWall.position.set(-0.58, 1.8, 0);
      cGroup.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.9, 1.1), palaceWallMat);
      rightWall.position.set(0.58, 1.8, 0);
      cGroup.add(rightWall);

      // Front Courtyard-facing Colonnade & Torana Arch
      const pLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.9, 12), goldTrimMat);
      pLeft.position.set(-0.50, 1.8, 0.55);
      cGroup.add(pLeft);

      const pRight = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.9, 12), goldTrimMat);
      pRight.position.set(0.50, 1.8, 0.55);
      cGroup.add(pRight);

      const archFront = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.06, 8, 24, Math.PI), goldTrimMat);
      archFront.position.set(0, 2.65, 0.55);
      cGroup.add(archFront);

      // Door panels ajar revealing cosmic portal inside
      const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.1, 0.06), doorMat);
      doorL.position.set(-0.26, 1.38, 0.45);
      doorL.rotation.y = -Math.PI * 0.18;
      cGroup.add(doorL);

      const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.1, 0.06), doorMat);
      doorR.position.set(0.26, 1.38, 0.45);
      doorR.rotation.y = Math.PI * 0.18;
      cGroup.add(doorR);

      // Inside: Glowing Cosmic Aperture Portal
      const portalTex = createCosmicPortalTexture(win.portalGradA, win.portalGradB);
      const portalAperture = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.7), new THREE.MeshStandardMaterial({
        map: portalTex,
        emissive: new THREE.Color(win.lightColor),
        emissiveIntensity: 0.55,
        roughness: 0.2
      }));
      portalAperture.position.set(0, 1.45, -0.42);
      cGroup.add(portalAperture);

      // Sacred Chamber Light
      const wLight = new THREE.PointLight(win.lightColor, 1.5, 6.0);
      wLight.position.set(0, 1.8, 0);
      cGroup.add(wLight);
      windowLightsRef.current.push(wLight);

      // Pyramid Cone Roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.95, 8), roofTileMat);
      roof.position.set(0, 3.65, 0);
      cGroup.add(roof);

      const kalash = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), goldTrimMat);
      kalash.position.set(0, 4.15, -0.05);
      cGroup.add(kalash);

      // Authentic Shilapatta on Roof
      const shilapattaGroup = new THREE.Group();
      const mountZ = 0.25;
      const plaqueCenterY = 4.82;
      const plaqueW = 1.36;
      const plaqueH = 0.56;
      const plaqueBottomY = plaqueCenterY - (plaqueH / 2);
      const plaqueTopY = plaqueCenterY + (plaqueH / 2);

      // Pedestal base & shaft
      const pedestalBase = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.14, 0.26), palaceWallMat);
      pedestalBase.position.set(0, 4.18, mountZ);
      shilapattaGroup.add(pedestalBase);

      const pedestalShaft = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.20), palaceWallMat);
      pedestalShaft.position.set(0, 4.34, mountZ);
      shilapattaGroup.add(pedestalShaft);

      const pedestalCollar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.22), goldTrimMat);
      pedestalCollar.position.set(0, 4.45, mountZ);
      shilapattaGroup.add(pedestalCollar);

      // Corbel ring & lotus
      const corbelRing = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.035, 12), goldTrimMat);
      corbelRing.position.set(0, 4.48, mountZ);
      shilapattaGroup.add(corbelRing);

      const corbelLotus = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.13, 0.06, 12), goldTrimMat);
      corbelLotus.position.set(0, 4.52, mountZ);
      shilapattaGroup.add(corbelLotus);

      const corbelCap = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.16), goldTrimMat);
      corbelCap.position.set(0, 4.56, mountZ);
      shilapattaGroup.add(corbelCap);

      // Brackets
      const leftBracketStrut = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.06), goldTrimMat);
      leftBracketStrut.position.set(-0.28, 4.52, mountZ);
      leftBracketStrut.rotation.z = 0.78;
      shilapattaGroup.add(leftBracketStrut);

      const rightBracketStrut = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.06), goldTrimMat);
      rightBracketStrut.position.set(0.28, 4.52, mountZ);
      rightBracketStrut.rotation.z = -0.78;
      shilapattaGroup.add(rightBracketStrut);

      // Outer gold frame
      const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(plaqueW, plaqueH, 0.06), goldTrimMat);
      outerFrame.position.set(0, plaqueCenterY, mountZ);
      shilapattaGroup.add(outerFrame);

      // Corner rosettes
      const rosetteGeo = new THREE.SphereGeometry(0.035, 8, 8);
      const rX = plaqueW / 2 - 0.06;
      const rY = plaqueH / 2 - 0.06;
      [[-rX, rY], [rX, rY], [-rX, -rY], [rX, -rY]].forEach(([cx, cy]) => {
        const rosetteF = new THREE.Mesh(rosetteGeo, goldTrimMat);
        rosetteF.position.set(cx, plaqueCenterY + cy, mountZ + 0.035);
        shilapattaGroup.add(rosetteF);
      });

      // Front Face
      const winPlaqueTex = createTrikalaChamberPlaqueTexture(win.primaryText, win.subtitleText, win.accentColor);
      const frontMat = new THREE.MeshStandardMaterial({
        map: winPlaqueTex,
        roughness: 0.32,
        metalness: 0.22,
        emissive: new THREE.Color(0x082b1c),
        emissiveIntensity: 0.35,
        side: THREE.FrontSide
      });
      const plaqueFace = new THREE.Mesh(new THREE.PlaneGeometry(plaqueW - 0.08, plaqueH - 0.08), frontMat);
      plaqueFace.position.set(0, plaqueCenterY, mountZ + 0.032);
      shilapattaGroup.add(plaqueFace);

      // Rear Face
      const reverseMat = new THREE.MeshStandardMaterial({
        map: plaqueReverseTex,
        roughness: 0.38,
        metalness: 0.20,
        emissive: new THREE.Color(0x051a10),
        emissiveIntensity: 0.25,
        side: THREE.FrontSide
      });
      const plaqueBackFace = new THREE.Mesh(new THREE.PlaneGeometry(plaqueW - 0.10, plaqueH - 0.10), reverseMat);
      plaqueBackFace.rotation.y = Math.PI;
      plaqueBackFace.position.set(0, plaqueCenterY, mountZ - 0.032);
      shilapattaGroup.add(plaqueBackFace);

      // Kalash Finial on Plaque
      const kalashRing = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.035, 12), goldTrimMat);
      kalashRing.position.set(0, plaqueTopY + 0.02, mountZ);
      shilapattaGroup.add(kalashRing);

      const plaqueKalash = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), goldTrimMat);
      plaqueKalash.position.set(0, plaqueTopY + 0.09, mountZ);
      shilapattaGroup.add(plaqueKalash);

      const kalashSpire = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.10, 8), goldTrimMat);
      kalashSpire.position.set(0, plaqueTopY + 0.18, mountZ);
      shilapattaGroup.add(kalashSpire);

      // Plaque soft edge glow
      const plaqueGlowLight = new THREE.PointLight(new THREE.Color(win.accentColor), 0.40, 2.5);
      plaqueGlowLight.position.set(0, plaqueCenterY, mountZ + 0.45);
      shilapattaGroup.add(plaqueGlowLight);

      cGroup.add(shilapattaGroup);

      interiorGroup.add(cGroup);
      chamberMeshesRef.current.set(win.id, cGroup);

      // Interactive Hitbox
      const chamberHit = new THREE.Mesh(new THREE.BoxGeometry(1.35, 5.2, 1.35), invisibleMat);
      chamberHit.position.set(x, 2.6, z);
      chamberHit.lookAt(0, 2.6, 0);
      interiorGroup.add(chamberHit);
      interactiveHitboxesRef.current.push({ id: win.id, mesh: chamberHit });
    });

    // =========================================================================
    // 10. DEDICATED REAL ARCHITECTURAL INTERIOR EXIT GATE (South Side of Courtyard)
    // =========================================================================
    // Situated at South wall (x = 0, z = 9.2) looking North into Courtyard
    const intExitGateGroup = new THREE.Group();
    intExitGateGroup.position.set(0, 0, 9.2);

    // Flanking solid palace wall segments
    const leftWallSeg = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.8, 0.4), palaceWallMat);
    leftWallSeg.position.set(-3.0, 1.9, 0);
    intExitGateGroup.add(leftWallSeg);

    const rightWallSeg = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.8, 0.4), palaceWallMat);
    rightWallSeg.position.set(3.0, 1.9, 0);
    intExitGateGroup.add(rightWallSeg);

    // Thick stone doorway jamb pillars
    const exitPillarGeo = new THREE.CylinderGeometry(0.32, 0.38, 4.4, 12);
    const exitLeftPil = new THREE.Mesh(exitPillarGeo, plinthMat);
    exitLeftPil.position.set(-1.8, 2.2, 0);
    intExitGateGroup.add(exitLeftPil);

    const exitRightPil = new THREE.Mesh(exitPillarGeo, plinthMat);
    exitRightPil.position.set(1.8, 2.2, 0);
    intExitGateGroup.add(exitRightPil);

    // Lintel Stone Beam & Torana Arch
    const exitLintel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 0.5), palaceWallMat);
    exitLintel.position.set(0, 4.4, 0);
    intExitGateGroup.add(exitLintel);

    const exitArchTrim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.14, 12, 32, Math.PI), goldTrimMat);
    exitArchTrim.position.set(0, 4.15, -0.05);
    intExitGateGroup.add(exitArchTrim);

    // Stepped Stone Threshold (देहली)
    const exitThreshold = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 0.8), plinthMat);
    exitThreshold.position.set(0, 0.11, 0);
    intExitGateGroup.add(exitThreshold);

    const exitNosing = new THREE.Mesh(new THREE.BoxGeometry(3.65, 0.05, 0.08), goldTrimMat);
    exitNosing.position.set(0, 0.22, -0.38);
    intExitGateGroup.add(exitNosing);

    // Dedicated Inscription Plaque: "गृह निर्गम द्वार • निकास"
    const intPlaqueTex = createGatePlaqueTexture('गृह निर्गम द्वार', 'निकास • बाहर जाने हेतु स्पर्श करें', '#f59e0b', '#1f1003');
    const intExitPlaque = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.62), new THREE.MeshStandardMaterial({
      map: intPlaqueTex,
      roughness: 0.25,
      metalness: 0.35,
      emissive: new THREE.Color(0xd97706),
      emissiveIntensity: 0.25
    }));
    intExitPlaque.rotation.y = Math.PI; // Face North into Courtyard
    intExitPlaque.position.set(0, 4.4, -0.28);
    intExitGateGroup.add(intExitPlaque);

    // Two Flanking Sconce Lamps
    const sconceGeo = new THREE.CylinderGeometry(0.18, 0.10, 0.14, 12);
    const leftSconce = new THREE.Mesh(sconceGeo, goldTrimMat);
    leftSconce.position.set(-2.1, 2.6, -0.15);
    intExitGateGroup.add(leftSconce);

    const leftFlame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0xffaa22 }));
    leftFlame.position.set(-2.1, 2.76, -0.15);
    intExitGateGroup.add(leftFlame);

    const leftExitLight = new THREE.PointLight(0xff9911, 1.4, 6.0);
    leftExitLight.position.set(-2.1, 2.8, -0.2);
    intExitGateGroup.add(leftExitLight);

    const rightSconce = new THREE.Mesh(sconceGeo, goldTrimMat);
    rightSconce.position.set(2.1, 2.6, -0.15);
    intExitGateGroup.add(rightSconce);

    const rightFlame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0xffaa22 }));
    rightFlame.position.set(2.1, 2.76, -0.15);
    intExitGateGroup.add(rightFlame);

    const rightExitLight = new THREE.PointLight(0xff9911, 1.4, 6.0);
    rightExitLight.position.set(2.1, 2.8, -0.2);
    intExitGateGroup.add(rightExitLight);

    // Two Real Wooden Door Leaves for Exit Gate
    const exitDoorMat = new THREE.MeshStandardMaterial({
      color: 0x24140a,
      roughness: 0.45,
      metalness: 0.15
    });

    const exitLeftDoorPivot = new THREE.Group();
    exitLeftDoorPivot.position.set(-1.5, 0, 0);
    const exitLeftPanel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.8, 0.16), exitDoorMat);
    exitLeftPanel.position.set(0.75, 1.9, 0);
    exitLeftDoorPivot.add(exitLeftPanel);

    // Brass pull handle
    const handleGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 16);
    const leftHandle = new THREE.Mesh(handleGeo, goldTrimMat);
    leftHandle.position.set(1.35, 1.8, -0.1);
    exitLeftDoorPivot.add(leftHandle);

    exitLeftDoorPivot.userData = { targetRotationY: 0 };
    intExitGateGroup.add(exitLeftDoorPivot);
    exitLeftDoorRef.current = exitLeftDoorPivot;

    const exitRightDoorPivot = new THREE.Group();
    exitRightDoorPivot.position.set(1.5, 0, 0);
    const exitRightPanel = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.8, 0.16), exitDoorMat);
    exitRightPanel.position.set(-0.75, 1.9, 0);
    exitRightDoorPivot.add(exitRightPanel);

    const rightHandle = new THREE.Mesh(handleGeo, goldTrimMat);
    rightHandle.position.set(-1.35, 1.8, -0.1);
    exitRightDoorPivot.add(rightHandle);

    exitRightDoorPivot.userData = { targetRotationY: 0 };
    intExitGateGroup.add(exitRightDoorPivot);
    exitRightDoorRef.current = exitRightDoorPivot;

    // Solid Vestibule Backplate behind closed doors preventing any exterior leak
    const bufferWall = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.4, 0.2), palaceWallMat);
    bufferWall.position.set(0, 2.2, 0.3);
    intExitGateGroup.add(bufferWall);

    interiorGroup.add(intExitGateGroup);

    // Interactive Hitbox for Interior Exit Gate
    const exitGateHit = new THREE.Mesh(new THREE.BoxGeometry(3.8, 4.4, 1.4), invisibleMat);
    exitGateHit.position.set(0, 2.2, 9.2);
    interiorGroup.add(exitGateHit);
    interactiveHitboxesRef.current.push({ id: 'exit_gate', mesh: exitGateHit });

    // Initial Spatial World Visibility sync
    if (spatialZoneRef.current === 'EXTERIOR_WORLD') {
      exteriorGroup.visible = true;
      interiorGroup.visible = false;
    } else {
      exteriorGroup.visible = false;
      interiorGroup.visible = true;
    }

    // =========================================================================
    // 11. USER ORBIT & TOUCH INTERACTION (PHASE 4.6-D HOTFIX-5 GESTURE CLASSIFICATION)
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const touchCountRef = { current: 0 };
    const touchStartX = { current: 0 };
    const touchStartY = { current: 0 };
    const isClassifiedHorizontalOrbit = { current: false };
    const hasMovedBeyondThreshold = { current: false };
    const justSwiped = { current: false };
    const hasTriggeredInteriorSwipeRef = { current: false };

    const handlePointerDown = (clientX: number, clientY: number, pointerCount: number = 1) => {
      isDragging.current = true;
      touchCountRef.current = pointerCount;
      previousPointerPosition.current = { x: clientX, y: clientY };
      touchStartX.current = clientX;
      touchStartY.current = clientY;
      isClassifiedHorizontalOrbit.current = false;
      hasMovedBeyondThreshold.current = false;
      justSwiped.current = false;
      hasTriggeredInteriorSwipeRef.current = false;
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging.current && touchCountRef.current <= 1) {
        if (isPlanetFocusActiveRef.current) {
          isPlanetFocusActiveRef.current = false;
        }

        const deltaX = clientX - touchStartX.current;
        const deltaY = clientY - touchStartY.current;
        const stepDeltaX = clientX - previousPointerPosition.current.x;
        const stepDeltaY = clientY - previousPointerPosition.current.y;
        const totalDist = Math.hypot(deltaX, deltaY);

        const isExt = spatialZoneRef.current === 'EXTERIOR_WORLD';

        if (isExt) {
          // SWIPE THRESHOLD: 8px to cleanly distinguish single tap from intentional horizontal swipe
          const SWIPE_THRESHOLD = 8;
          if (!isClassifiedHorizontalOrbit.current && totalDist >= SWIPE_THRESHOLD) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              isClassifiedHorizontalOrbit.current = true;
              hasMovedBeyondThreshold.current = true;
              justSwiped.current = true;
            }
          }

          if (isClassifiedHorizontalOrbit.current) {
            hasMovedBeyondThreshold.current = true;
            justSwiped.current = true;

            // Exterior World: Free 360° orbital navigation around palace estate
            orbitAngles.current.theta -= stepDeltaX * 0.0055;
            orbitAngles.current.phi += stepDeltaY * 0.005;
            orbitAngles.current.phi = Math.max(0.08, Math.min(Math.PI * 0.35, orbitAngles.current.phi));
            orbitAngles.current.radius = Math.max(16.0, Math.min(38.0, orbitAngles.current.radius));

            const r = orbitAngles.current.radius;
            targetCamPos.current.x = r * Math.sin(orbitAngles.current.theta) * Math.cos(orbitAngles.current.phi);
            targetCamPos.current.y = Math.max(2.5, r * Math.sin(orbitAngles.current.phi));
            targetCamPos.current.z = r * Math.cos(orbitAngles.current.theta) * Math.cos(orbitAngles.current.phi);
          }
        } else {
          // Phase 4.6-D Final Touch Fix: Single-finger horizontal swipe navigates Bhavas
          // ONE TAP / ONE SWIPE = ONE BHAVA
          // LEFT SWIPE (deltaX < 0) -> Next Bhava (e.g. Bhava 1 -> Bhava 2)
          // RIGHT SWIPE (deltaX > 0) -> Previous Bhava (e.g. Bhava 2 -> Bhava 1)
          // CRITICAL RULES:
          // THE CAMERA MUST NOT MOVE FORWARD OR BACKWARD.
          // THE CAMERA MUST NOT ZOOM.
          // THE CAMERA MUST NOT DOLLY.
          // THE CAMERA MUST NOT CHANGE FOV.
          // THE CAMERA MUST NOT CHANGE CAMERA HEIGHT.
          // THE CAMERA MUST NOT CHANGE VERTICAL ANGLE.
          // ONLY THE HORIZONTAL INTERIOR VIEW / AZIMUTH MAY CHANGE.
          if (!hasTriggeredInteriorSwipeRef.current) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            const SWIPE_THRESHOLD = 28; // Responsive, distinct horizontal swipe threshold

            if (absX >= SWIPE_THRESHOLD && absX > absY * 1.12) {
              hasTriggeredInteriorSwipeRef.current = true;
              hasMovedBeyondThreshold.current = true;
              justSwiped.current = true;

              if (soundEnabledRef.current) {
                houseAudioService.playTempleChime(440);
              }

              if (deltaX < 0) {
                // Finger moves left -> show next Bhava
                goToNextBhavaRef.current();
              } else {
                // Finger moves right -> show previous Bhava
                goToPreviousBhavaRef.current();
              }
            }
          }
        }

        previousPointerPosition.current = { x: clientX, y: clientY };
      }

      // Raycast hover testing
      raycaster.setFromCamera(mouse, camera);
      const isExtZone = spatialZoneRef.current === 'EXTERIOR_WORLD';
      if (isExtZone) {
        const activeHitboxes = interactiveHitboxesRef.current.filter(h => h.id === 'main_gate');
        const meshesToTest = activeHitboxes.map(h => h.mesh);
        const intersects = raycaster.intersectObjects(meshesToTest);

        if (intersects.length > 0) {
          const hit = activeHitboxes.find(h => h.mesh === intersects[0].object);
          if (hit) {
            setHoveredChamber(hit.id);
            container.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredChamber(null);
        container.style.cursor = isDragging.current ? 'grabbing' : 'grab';
      } else {
        // Phase 4.6-D Hotfix-4: In INTERIOR_WORLD, strictly suppress chamber hover overlay
        setHoveredChamber(null);
        // Only set pointer cursor if hovering over an interactive planetary gem
        const planetHitboxes = interactiveHitboxesRef.current.filter(h => h.isPlanet);
        const planetMeshes = planetHitboxes.map(h => h.mesh);
        const intersects = raycaster.intersectObjects(planetMeshes);
        container.style.cursor = intersects.length > 0 ? 'pointer' : (isDragging.current ? 'grabbing' : 'grab');
      }
    };

    const handlePointerUp = (clientX?: number, clientY?: number) => {
      isDragging.current = false;
      touchCountRef.current = 0;
      isClassifiedHorizontalOrbit.current = false;
      initialPinchDistance.current = null;

      if (!hasTriggeredInteriorSwipeRef.current && spatialZoneRef.current === 'INTERIOR_WORLD' && clientX !== undefined && touchStartX.current !== 0) {
        const finalDeltaX = clientX - touchStartX.current;
        const finalDeltaY = (clientY !== undefined ? clientY : touchStartY.current) - touchStartY.current;
        const absX = Math.abs(finalDeltaX);
        const absY = Math.abs(finalDeltaY);
        if (absX >= 22 && absX > absY * 1.12) {
          hasTriggeredInteriorSwipeRef.current = true;
          hasMovedBeyondThreshold.current = true;
          justSwiped.current = true;
          if (soundEnabledRef.current) {
            houseAudioService.playTempleChime(440);
          }
          if (finalDeltaX < 0) {
            goToNextBhavaRef.current();
          } else {
            goToPreviousBhavaRef.current();
          }
        }
      }

      if (hasMovedBeyondThreshold.current || hasTriggeredInteriorSwipeRef.current) {
        // Prevent click execution when gesture was a horizontal swipe
        justSwiped.current = true;
        setTimeout(() => {
          justSwiped.current = false;
          hasMovedBeyondThreshold.current = false;
          hasTriggeredInteriorSwipeRef.current = false;
        }, 250);
      } else {
        // Tap remained below threshold: allow clean single tap
        justSwiped.current = false;
        hasTriggeredInteriorSwipeRef.current = false;
      }
    };

    const onMouseDown = (e: MouseEvent) => handlePointerDown(e.clientX, e.clientY, 1);
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();

    const onClick = () => {
      if (justSwiped.current) {
        justSwiped.current = false;
        return;
      }
      const isExtZone = spatialZoneRef.current === 'EXTERIOR_WORLD';

      // Perform accurate click raycasting
      raycaster.setFromCamera(mouse, camera);
      const activeHitboxes = interactiveHitboxesRef.current.filter(h => {
        if (isExtZone) {
          return h.id === 'main_gate';
        } else {
          return h.id !== 'main_gate';
        }
      });
      const meshesToTest = activeHitboxes.map(h => h.mesh);
      const intersects = raycaster.intersectObjects(meshesToTest);

      if (intersects.length > 0) {
        const hit = activeHitboxes.find(h => h.mesh === intersects[0].object);
        if (hit) {
          if (isExtZone) {
            if (hit.id === 'main_gate') {
              if (soundEnabledRef.current) {
                houseAudioService.playDoorsOpenSound();
              }
              if (onEnterPalaceRef.current) {
                onEnterPalaceRef.current();
              }
            }
            return;
          }

          if (hit.id === 'exit_gate') {
            if (soundEnabledRef.current) {
              houseAudioService.playPalaceExitSound();
            }
            if (onExitPalaceRef.current) {
              onExitPalaceRef.current();
            }
            return;
          }

          if (soundEnabledRef.current) {
            houseAudioService.playTempleChime(480);
          }

          // Phase 4.6-A & 4.6-C: Tap on planet marker/orb selects planet, opens panel and focuses camera
          if (hit.isPlanet && hit.planetName) {
            if (soundEnabledRef.current) {
              houseAudioService.playTempleChime(540);
            }
            if (onSelectPlanetRef.current) {
              onSelectPlanetRef.current(hit.planetName, hit.id as ChamberId);
            }
            applyPlanetFocus(hit.planetName);
            return;
          }

          if (onSelectChamberRef.current) {
            onSelectChamberRef.current(hit.id as ChamberId);
          }
          return;
        }
      }

      if (isExtZone) {
        if (hoveredChamber === 'main_gate') {
          if (soundEnabledRef.current) {
            houseAudioService.playDoorsOpenSound();
          }
          if (onEnterPalaceRef.current) {
            onEnterPalaceRef.current();
          }
        }
        return;
      }

      if (hoveredChamber === 'exit_gate') {
        if (soundEnabledRef.current) {
          houseAudioService.playPalaceExitSound();
        }
        if (onExitPalaceRef.current) {
          onExitPalaceRef.current();
        }
        return;
      }

      if (hoveredChamber) {
        if (soundEnabledRef.current) {
          houseAudioService.playTempleChime(480);
        }
        if (onSelectChamberRef.current) {
          onSelectChamberRef.current(hoveredChamber as ChamberId);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const isExtZone = spatialZoneRef.current === 'EXTERIOR_WORLD';
      if (isExtZone) {
        orbitAngles.current.radius = Math.max(16.0, Math.min(38.0, orbitAngles.current.radius + e.deltaY * 0.02));
        const r = orbitAngles.current.radius;
        targetCamPos.current.x = r * Math.sin(orbitAngles.current.theta) * Math.cos(orbitAngles.current.phi);
        targetCamPos.current.y = Math.max(2.5, r * Math.sin(orbitAngles.current.phi));
        targetCamPos.current.z = r * Math.cos(orbitAngles.current.theta) * Math.cos(orbitAngles.current.phi);
      } else {
        // Phase 4.6-D Hotfix-8: Safe smooth trackpad/wheel zoom within calibrated HOTFIX-7 limits
        const isMobile = window.innerWidth < 640;
        const minCamDistance = isMobile ? 6.4 : 7.2;
        const maxCamDistance = isMobile ? 8.5 : 9.0;
        const currentDist = interiorCamDistanceRef.current ?? (isMobile ? 7.8 : 8.8);
        const newDist = Math.max(minCamDistance, Math.min(maxCamDistance, currentDist + e.deltaY * 0.005));
        interiorCamDistanceRef.current = newDist;

        const angle = interiorAzimuthRef.current ?? getChamberAngle(lastFacingBhavaRef.current);
        const chamberRadius = 9.2;
        const camRadius = chamberRadius - newDist;
        const camX = Math.cos(angle) * camRadius;
        const camZ = Math.sin(angle) * camRadius;
        const camY = isMobile ? 3.4 : 3.2;

        const targetX = Math.cos(angle) * chamberRadius;
        const targetZ = Math.sin(angle) * chamberRadius;
        const targetY = isMobile ? 2.4 : 2.4;

        targetCamPos.current.set(camX, camY, camZ);
        targetCamLook.current.set(targetX, targetY, targetZ);
      }
    };

    // Phase 4.6-D Hotfix-5 & Hotfix-8: Strict Gesture Classification (1 finger = horizontal swipe Bhava navigation only, 2 fingers = pinch zoom only)
    const onTouchStart = (e: TouchEvent) => {
      touchCountRef.current = e.touches.length;
      if (e.touches.length === 1) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, 1);
        initialPinchDistance.current = null;
      } else if (e.touches.length >= 2) {
        // Two or more fingers: genuine pinch gesture
        isDragging.current = false;
        isClassifiedHorizontalOrbit.current = false;
        hasMovedBeyondThreshold.current = true;
        justSwiped.current = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance.current = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      // Prevent browser default native page zoom on 3D canvas
      if (e.cancelable) {
        e.preventDefault();
      }

      if (e.touches.length === 1) {
        // ONE FINGER -> HORIZONTAL SWIPE BHAVA NAVIGATION ONLY (NEVER DOLLY OR ZOOM)
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length >= 2 && initialPinchDistance.current !== null) {
        // TWO FINGERS -> GENUINE PINCH ZOOM ONLY
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        // distance increasing -> zoom in (diff < 0)
        // distance decreasing -> zoom out (diff > 0)
        const diff = initialPinchDistance.current - dist;
        initialPinchDistance.current = dist;

        const isExtZone = spatialZoneRef.current === 'EXTERIOR_WORLD';
        if (isExtZone) {
          orbitAngles.current.radius = Math.max(16.0, Math.min(38.0, orbitAngles.current.radius + diff * 0.04));
          const r = orbitAngles.current.radius;
          targetCamPos.current.x = r * Math.sin(orbitAngles.current.theta) * Math.cos(orbitAngles.current.phi);
          targetCamPos.current.y = Math.max(2.5, r * Math.sin(orbitAngles.current.phi));
          targetCamPos.current.z = r * Math.cos(orbitAngles.current.theta) * Math.cos(orbitAngles.current.phi);
        } else {
          // Phase 4.6-D Hotfix-8: Genuine two-finger pinch zoom in INTERIOR_WORLD
          // Pinch OUT (diff < 0): Zoom IN smoothly towards chamber
          // Pinch IN (diff > 0): Zoom OUT smoothly towards courtyard center
          const isMobile = window.innerWidth < 640;
          const minCamDistance = isMobile ? 6.4 : 7.2;
          const maxCamDistance = isMobile ? 8.5 : 9.0;
          const currentDist = interiorCamDistanceRef.current ?? (isMobile ? 7.8 : 8.8);
          const newDist = Math.max(minCamDistance, Math.min(maxCamDistance, currentDist + diff * 0.008));
          interiorCamDistanceRef.current = newDist;

          const angle = interiorAzimuthRef.current ?? getChamberAngle(lastFacingBhavaRef.current);
          const chamberRadius = 9.2;
          const camRadius = chamberRadius - newDist;
          const camX = Math.cos(angle) * camRadius;
          const camZ = Math.sin(angle) * camRadius;
          const camY = isMobile ? 3.4 : 3.2;

          const targetX = Math.cos(angle) * chamberRadius;
          const targetZ = Math.sin(angle) * chamberRadius;
          const targetY = isMobile ? 2.4 : 2.4;

          targetCamPos.current.set(camX, camY, camZ);
          targetCamLook.current.set(targetX, targetY, targetZ);
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      touchCountRef.current = e.touches.length;
      if (e.touches.length === 1) {
        // Transition back to 1-finger tracking if one finger lifted
        previousPointerPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isDragging.current = true;
        initialPinchDistance.current = null;
      } else if (e.touches.length === 0) {
        const lastTouch = e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : null;
        if (lastTouch) {
          handlePointerUp(lastTouch.clientX, lastTouch.clientY);
        } else {
          handlePointerUp();
        }
      }
    };

    const dom = renderer.domElement;
    dom.style.touchAction = 'none';
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('mousemove', onMouseMove);
    dom.addEventListener('click', onClick);
    dom.addEventListener('wheel', onWheel, { passive: false });

    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const asp = w / h;
      cameraRef.current.aspect = asp;
      cameraRef.current.fov = asp < 0.65 ? 64 : (asp < 1.0 ? 56 : 45);
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // 12. ANIMATION & RENDER LOOP
    // =========================================================================
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Dynamic visibility of Spatial World Groups
      const curZone = spatialZoneRef.current;
      const isThreshold = thresholdDirRef.current !== null;

      if (exteriorGroupRef.current && interiorGroupRef.current) {
        if (isThreshold) {
          exteriorGroupRef.current.visible = true;
          interiorGroupRef.current.visible = true;
        } else if (curZone === 'EXTERIOR_WORLD') {
          exteriorGroupRef.current.visible = true;
          interiorGroupRef.current.visible = false;
        } else {
          // INTERIOR_WORLD
          exteriorGroupRef.current.visible = false;
          interiorGroupRef.current.visible = true;
        }
      }

      // Rotate Astrolabe / Trikala rings smoothly
      if (trikalaRingRef.current) {
        trikalaRingRef.current.rotation.y = elapsedTime * 0.14;
      } else if (astrolabeGroupRef.current) {
        astrolabeGroupRef.current.rotation.y = elapsedTime * 0.22;
      }

      // Pragya Flame Light dynamic breathing pulse
      if (pragyaFlameLightRef.current) {
        pragyaFlameLightRef.current.intensity = 2.4 + Math.sin(elapsedTime * 4.2) * 0.45;
      }

      // Diya lamps flickering flame effect
      diyaLightsRef.current.forEach((light, i) => {
        light.intensity = 1.6 + Math.sin(elapsedTime * 6.5 + i * 1.4) * 0.28;
      });

      // Phase 4.4: Divya Brahmand Parallax Motion & Stellar Scintillation
      if (skyGroupRef.current) {
        skyGroupRef.current.rotation.y = elapsedTime * 0.00015;
      }
      if (distantStarsRef.current) {
        distantStarsRef.current.rotation.y = elapsedTime * 0.00008;
      }
      if (midStarsRef.current) {
        midStarsRef.current.rotation.y = elapsedTime * 0.00012;
      }
      if (nakshatrasRef.current) {
        nakshatrasRef.current.rotation.y = elapsedTime * 0.00014;
        (nakshatrasRef.current.material as THREE.PointsMaterial).size = 3.6 + Math.sin(elapsedTime * 3.2) * 0.35;
      }
      if (milkyWayRef.current) {
        milkyWayRef.current.rotation.y = elapsedTime * 0.00018;
        (milkyWayRef.current.material as THREE.PointsMaterial).opacity = 0.72 + Math.sin(elapsedTime * 0.5) * 0.08;
      }
      if (waterRingRef.current) {
        (waterRingRef.current.material as THREE.MeshStandardMaterial).roughness = 0.10 + Math.sin(elapsedTime * 1.8) * 0.04;
      }

      // Phase 4.3: Planetary Orbs Levitation, Ring Orbit & Banner Facing
      planetOrbsRef.current.forEach((pGroup) => {
        const baseY = pGroup.userData.baseY || 1.18;
        const pIdx = pGroup.userData.pIdx || 0;
        pGroup.position.y = baseY + Math.sin(elapsedTime * 2.2 + pIdx * 1.5) * 0.035;

        const ring = pGroup.getObjectByName('astro_ring');
        if (ring) {
          ring.rotation.z += 0.012;
        }

        const banner = pGroup.getObjectByName('overhead_banner');
        if (banner) {
          banner.rotation.y = Math.sin(elapsedTime * 1.5 + pIdx) * 0.08;
        }

        // Phase 4.6-A & 4.6-B: Selection Halo & Subtle Speaking Pulse
        const isSelected = selectedPlanetRef.current === pGroup.userData.planetName;
        const isSpeaking = isSelected && Boolean(isPlanetSpeakingRef.current);
        const halo = pGroup.getObjectByName('selection_halo');
        if (halo) {
          halo.visible = isSelected;
          if (isSelected) {
            halo.rotation.y += 0.015;
            if (isSpeaking) {
              const pulse = 1.0 + Math.sin(elapsedTime * 4.5) * 0.08;
              halo.scale.set(pulse, pulse, pulse);
            } else {
              halo.scale.set(1.0, 1.0, 1.0);
            }
          }
        }

        const sphere = pGroup.getObjectByName('planet_sphere');
        if (sphere) {
          if (isSpeaking) {
            const pScale = 1.0 + Math.sin(elapsedTime * 4.5) * 0.06;
            sphere.scale.set(pScale, pScale, pScale);
          } else {
            sphere.scale.set(1.0, 1.0, 1.0);
          }
        }

        const pLight = pGroup.getObjectByName('planet_light') as THREE.PointLight | null;
        if (pLight) {
          if (isSelected) {
            const baseLight = isSpeaking ? 1.25 + Math.sin(elapsedTime * 4.5) * 0.2 : 1.1;
            pLight.intensity = baseLight;
          } else {
            pLight.intensity = 0.75;
          }
        }
      });

      // Phase 4.7-A: Living Bhava Chamber 1 Prototype Animation
      const bhava1Group = chamberMeshesRef.current.get('chamber_1');
      if (bhava1Group) {
        const knowledgeOrb = bhava1Group.getObjectByName('bhava1_knowledge_orb');
        if (knowledgeOrb) {
          knowledgeOrb.rotation.y += 0.008;
        }
        const orbRing = bhava1Group.getObjectByName('bhava1_orb_ring');
        if (orbRing) {
          orbRing.rotation.x += 0.012;
          orbRing.rotation.z += 0.006;
        }

        // Living Chamber subtle breathing pulse (active when focused or viewed)
        const isBhava1Active = activeChamberRef.current === 'chamber_1';
        const goldLight = bhava1Group.getObjectByName('bhava1_living_gold_light') as THREE.PointLight | null;
        if (goldLight) {
          const baseIntensity = isBhava1Active ? 0.95 : 0.70;
          goldLight.intensity = baseIntensity + Math.sin(elapsedTime * 1.8) * 0.12;
        }
        const emeraldLight = bhava1Group.getObjectByName('bhava1_living_emerald_light') as THREE.PointLight | null;
        if (emeraldLight) {
          const baseIntensity = isBhava1Active ? 0.75 : 0.50;
          emeraldLight.intensity = baseIntensity + Math.sin(elapsedTime * 1.8 + 1.2) * 0.10;
        }
      }

      // Smooth Door Hinges rotation (approx 1.5–2s smooth transition, no snapping)
      // Main Entrance Doors
      if (leftDoorRef.current && rightDoorRef.current) {
        const lTarget = leftDoorRef.current.userData.targetRotationY || 0;
        const rTarget = rightDoorRef.current.userData.targetRotationY || 0;
        leftDoorRef.current.rotation.y += (lTarget - leftDoorRef.current.rotation.y) * 0.045;
        rightDoorRef.current.rotation.y += (rTarget - rightDoorRef.current.rotation.y) * 0.045;
      }

      // Interior Exit Doors
      if (exitLeftDoorRef.current && exitRightDoorRef.current) {
        const elTarget = exitLeftDoorRef.current.userData.targetRotationY || 0;
        const erTarget = exitRightDoorRef.current.userData.targetRotationY || 0;
        exitLeftDoorRef.current.rotation.y += (elTarget - exitLeftDoorRef.current.rotation.y) * 0.045;
        exitRightDoorRef.current.rotation.y += (erTarget - exitRightDoorRef.current.rotation.y) * 0.045;
      }

      // Architectural Collision & Boundary Constraints
      if (!isThreshold) {
        if (curZone === 'EXTERIOR_WORLD') {
          // Never penetrate south entrance wall into interior from exterior
          if (targetCamPos.current.z < 10.8) targetCamPos.current.z = 10.8;
          if (camera.position.z < 10.8) camera.position.z = 10.8;
          orbitAngles.current.theta = Math.max(-Math.PI * 0.40, Math.min(Math.PI * 0.40, orbitAngles.current.theta));
          orbitAngles.current.phi = Math.max(0.08, Math.min(Math.PI * 0.35, orbitAngles.current.phi));
        } else if (curZone === 'INTERIOR_WORLD') {
          // Strict Interior Safe Volume (stay inside courtyard and inner verandah, clear of all walls and gates)
          const maxInteriorRadius = 6.8;
          const curDist = Math.hypot(camera.position.x, camera.position.z);
          if (curDist > maxInteriorRadius) {
            const ratio = maxInteriorRadius / curDist;
            camera.position.x *= ratio;
            camera.position.z *= ratio;
          }
          const tgtDist = Math.hypot(targetCamPos.current.x, targetCamPos.current.z);
          if (tgtDist > maxInteriorRadius) {
            const ratio = maxInteriorRadius / tgtDist;
            targetCamPos.current.x *= ratio;
            targetCamPos.current.z *= ratio;
          }
          // Phase 4.6-D Hotfix-3: Safety radius constraint allows calibrated camera distances (~0.3m to 6.8m)
          if (!selectedPlanetRef.current) {
            const minInteriorRadius = 0.3;
            if (curDist < minInteriorRadius && curDist > 0.01) {
              const ratio = minInteriorRadius / curDist;
              camera.position.x *= ratio;
              camera.position.z *= ratio;
            }
          }
          // Phase 4.6-D Hotfix-7: Restored interior camera height invariant (3.4m mobile, 3.2m desktop)
          if (!selectedPlanetRef.current) {
            const lockedHeight = window.innerWidth < 640 ? 3.4 : 3.2;
            targetCamPos.current.y = lockedHeight;
          } else {
            camera.position.y = Math.max(1.4, Math.min(5.2, camera.position.y));
            targetCamPos.current.y = Math.max(1.4, Math.min(5.2, targetCamPos.current.y));
          }
        }
      }

      // Smooth Camera Damping (Phase 4.6-D Hotfix: 500-800ms smooth settle to calibrated Bhava viewing position)
      camera.position.lerp(targetCamPos.current, 0.075);
      currentLookAt.current.lerp(targetCamLook.current, 0.08);
      camera.lookAt(currentLookAt.current);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('mousemove', onMouseMove);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />

      {/* Phase 4.6-D: Mobile 3D Bhava Orientation HUD ("सामने: भाव X") with smooth prev/next navigation & 12 Bhava stepper */}
      {spatialZone === 'INTERIOR_WORLD' && !selectedPlanetName && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-1.5 max-w-[96vw] animate-in fade-in duration-300">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-2xl bg-[#03150d]/92 border border-[#d4af37]/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.7)] max-w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPreviousBhava();
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-black/40 hover:bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fef08a] hover:text-white transition-all cursor-pointer active:scale-95 shrink-0"
              title="पिछला भाव (Previous Bhava)"
              aria-label="Previous Bhava"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              className="flex flex-col items-center justify-center px-2 sm:px-4 py-0.5 text-center min-h-[44px]"
            >
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#fef08a]">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">सामने:</span>
                <span>भाव {facingBhavaNum}</span>
                <span className="text-gray-400">•</span>
                <span className="text-white">{bhavaAstroViewModels[facingBhavaNum]?.bhavaName || BHAVA_CONFIG[facingBhavaNum]?.name}</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-emerald-200">
                <span className="text-amber-300 font-medium">
                  राशि {bhavaAstroViewModels[facingBhavaNum]?.rashiNumber || facingBhavaNum} • {bhavaAstroViewModels[facingBhavaNum]?.rashiName}
                </span>
                <span className="text-emerald-500">•</span>
                <span className="text-gray-300">
                  स्वामी: {bhavaAstroViewModels[facingBhavaNum]?.signLord || 'सूर्य'}
                </span>
                {bhavaAstroViewModels[facingBhavaNum]?.planets && bhavaAstroViewModels[facingBhavaNum].planets.length > 0 && (
                  <>
                    <span className="text-emerald-500">•</span>
                    <span className="text-[#fef08a] font-semibold">
                      ग्रह: {bhavaAstroViewModels[facingBhavaNum].planets.map(p => p.symbol + ' ' + (p.localizedName || p.name)).join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextBhava();
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-black/40 hover:bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fef08a] hover:text-white transition-all cursor-pointer active:scale-95 shrink-0"
              title="अगला भाव (Next Bhava)"
              aria-label="Next Bhava"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Phase 4.6-D: 12 Quick-Select Bhava Stepper Pills + 3 Special Orbit Chambers */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#021009]/85 border border-[#d4af37]/40 backdrop-blur-md shadow-md max-w-full overflow-x-auto scrollbar-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
              const isActive = facingBhavaNum === num && activeStationIndex < 12;
              return (
                <button
                  key={num}
                  onClick={(e) => {
                    e.stopPropagation();
                    rotateToBhava(num);
                  }}
                  className={`min-w-[24px] h-6 px-1 rounded-full text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#e6c250] text-black shadow-[0_0_8px_rgba(212,175,55,0.8)] scale-110'
                      : 'text-emerald-200/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={`भाव ${num} पर जाएँ`}
                >
                  {num}
                </button>
              );
            })}
            <div className="w-[1px] h-3.5 bg-emerald-700/60 mx-0.5 shrink-0" />
            {[
              { id: 'window_past' as const, label: 'अतीत' },
              { id: 'window_present' as const, label: 'वर्तमान' },
              { id: 'window_future' as const, label: 'भविष्य' }
            ].map((special) => {
              const isActive = activeStationIndex === ORBIT_STATIONS.findIndex(s => s.id === special.id);
              return (
                <button
                  key={special.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectChamberRef.current) {
                      onSelectChamberRef.current(special.id);
                    } else {
                      rotateToStation(special.id);
                    }
                  }}
                  className={`px-2 h-6 rounded-full text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#e6c250] text-black shadow-[0_0_8px_rgba(212,175,55,0.8)] scale-105'
                      : 'text-amber-200/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={`${special.label} वातायन कक्ष`}
                >
                  {special.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase 4.6-D Hotfix-2: Mobile & Desktop Floating Bhava Navigation Arrows */}
      {spatialZone === 'INTERIOR_WORLD' && !selectedPlanetName && (
        <>
          {/* Left Arrow: ← Previous Bhava */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (soundEnabledRef.current) {
                houseAudioService.playTempleChime(440);
              }
              goToPreviousBhava();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full bg-[#03150d]/90 hover:bg-[#062618] border-2 border-[#d4af37]/85 hover:border-[#ffd700] text-[#fef08a] hover:text-white shadow-[0_0_20px_rgba(212,175,55,0.45)] backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-90 hover:scale-105 group"
            title="पिछला भाव (Previous Bhava)"
            aria-label="Previous Bhava"
          >
            <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:-translate-x-0.5 text-[#fef08a]" />
          </button>

          {/* Right Arrow: → Next Bhava */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (soundEnabledRef.current) {
                houseAudioService.playTempleChime(440);
              }
              goToNextBhava();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full bg-[#03150d]/90 hover:bg-[#062618] border-2 border-[#d4af37]/85 hover:border-[#ffd700] text-[#fef08a] hover:text-white shadow-[0_0_20px_rgba(212,175,55,0.45)] backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-90 hover:scale-105 group"
            title="अगला भाव (Next Bhava)"
            aria-label="Next Bhava"
          >
            <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:translate-x-0.5 text-[#fef08a]" />
          </button>
        </>
      )}

      {/* Floating Chamber Hover Indicator - Strictly restricted to EXTERIOR_WORLD only */}
      {hoveredChamber && spatialZone === 'EXTERIOR_WORLD' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-20 w-[90vw] max-w-sm">
          <div className="px-5 py-3 rounded-2xl bg-[#030e09]/92 border border-[#d4af37]/70 backdrop-blur-md text-center shadow-[0_4px_30px_rgba(0,0,0,0.8)] animate-in fade-in duration-150">
            {(() => {
              const def = CHAMBER_DEFINITIONS.find(d => d.id === hoveredChamber);
              return def?.wingNameHindi ? (
                <p className="text-[10px] text-emerald-400 font-semibold tracking-wider mb-0.5">
                  {def.wingNameHindi}
                </p>
              ) : null;
            })()}
            <p className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">
              {hoveredChamber === 'main_gate'
                ? 'महाद्वार • मुख्य राजद्वार'
                : hoveredChamber === 'exit_gate'
                ? 'गृह निर्गम द्वार • निकास'
                : hoveredChamber === 'courtyard'
                ? 'ब्रह्म स्थान • जीवन प्रज्ञा हृदय'
                : hoveredChamber === 'guardian_sanctum'
                ? 'गुप्त गर्भगृह • Guardian Sanctum'
                : hoveredChamber === 'window_past'
                ? 'त्रिकाल वातायन • अतीत'
                : hoveredChamber === 'window_present'
                ? 'त्रिकाल वातायन • वर्तमान'
                : hoveredChamber === 'window_future'
                ? 'त्रिकाल वातायन • भविष्य'
                : CHAMBER_DEFINITIONS.find(d => d.id === hoveredChamber)?.sanskritName}
            </p>
            <p className="text-sm font-bold text-white mt-0.5">
              {hoveredChamber === 'main_gate'
                ? 'प्रासाद के भीतर प्रवेश करें (Enter House)'
                : hoveredChamber === 'exit_gate'
                ? 'प्रासाद से बाहर प्रांगण में जाएं (Exit Palace)'
                : hoveredChamber === 'courtyard'
                ? 'जीवन प्रज्ञा मार्गदर्शन (त्रिकाल दृष्टि: अतीत • वर्तमान • भविष्य)'
                : hoveredChamber === 'guardian_sanctum'
                ? 'स्वामी नियंत्रण एवं सुरक्षा केंद्र'
                : hoveredChamber === 'window_past'
                ? 'अतीत वातायन • पारंपरिक संकेत'
                : hoveredChamber === 'window_present'
                ? 'वर्तमान वातायन • आज के संकेत'
                : hoveredChamber === 'window_future'
                ? 'भविष्य वातायन • समय-खिड़कियाँ'
                : CHAMBER_DEFINITIONS.find(d => d.id === hoveredChamber)?.englishTitle}
            </p>
            {residentsSummary[hoveredChamber]?.planets && residentsSummary[hoveredChamber].planets.length > 0 && (
              <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                विद्यमान ग्रह: {residentsSummary[hoveredChamber].planets.join(', ')}
              </p>
            )}
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
              {hoveredChamber === 'main_gate'
                ? 'क्लिक कर गृह प्रवेश करें (Click to Enter)'
                : hoveredChamber === 'exit_gate'
                ? 'क्लिक कर बाहर जाएं (Click to Exit)'
                : 'क्लिक कर कक्ष में प्रवेश करें (Click to Enter)'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
