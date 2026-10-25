/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData } from '../../types/kundli';
import { RealTransitPlanetDetail } from '../jyotish/transitEngine';

export interface VedhaResult {
  planet: string;
  transitHouse: number;
  isShubh: boolean;
  vedhaHouse: number;
  vedhaPlanet: string | null;
  isBlocked: boolean;
  status: 'Favourable' | 'Not Favourable' | 'Vedha Blocked';
}

export interface SadeSatiResult {
  isActive: boolean;
  isDegreeActive: boolean;
  phase: 'Not Active' | 'First Phase (Rising)' | 'Peak Phase' | 'Final Phase (Setting)';
  description: string;
  saturnLongitude: number;
  moonLongitude: number;
  diffDegrees: number;
}

export interface GocharVedhaAnalysis {
  vedha: Record<string, VedhaResult>;
  sadeSati: SadeSatiResult;
}

// Classical Vedha Pairs (Shubh-Vedha)
// If planet is in Shubh position, and ANOTHER planet is in Vedha position, Shubh effect is blocked.
const VEDHA_PAIRS: Record<string, Record<number, number>> = {
  Sun: { 3: 9, 6: 12, 10: 4, 11: 5 },
  Moon: { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  Mars: { 3: 12, 6: 9, 11: 5 },
  Mercury: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 8, 11: 12 },
  Jupiter: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
  Venus: { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 6, 12: 3 },
  Saturn: { 3: 12, 6: 9, 11: 5 }
};

export class GocharVedhaEngine {
  static analyze(natalData: MasterKundliData, transitPlanets: Record<string, RealTransitPlanetDetail>): GocharVedhaAnalysis {
    const moonRashi = natalData.planets['Moon'].rashi;
    const moonLong = natalData.planets['Moon'].siderealLongitude;
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    
    const vedhaResults: Record<string, VedhaResult> = {};

    // 1. Calculate Vedha for each planet
    planets.forEach(pName => {
      const tp = transitPlanets[pName];
      if (!tp) return;

      const pRashi = Math.floor(tp.exactLongitude / 30) + 1;
      const transitHouse = ((pRashi - moonRashi + 12) % 12) + 1;
      const shubhPositions = Object.keys(VEDHA_PAIRS[pName] || {}).map(Number);
      const isShubh = shubhPositions.includes(transitHouse);
      const vedhaHouseRequired = VEDHA_PAIRS[pName]?.[transitHouse] || 0;

      let vedhaPlanet: string | null = null;
      let isBlocked = false;

      if (isShubh && vedhaHouseRequired !== 0) {
        // Check if ANY other planet (except node/moon) is in vedha position
        Object.entries(transitPlanets).forEach(([otherName, otherP]) => {
          if (otherName === 'Rahu' || otherName === 'Ketu') return;
          
          const otherRashi = Math.floor(otherP.exactLongitude / 30) + 1;
          const otherHouse = ((otherRashi - moonRashi + 12) % 12) + 1;
          if (otherHouse === vedhaHouseRequired) {
            // Check exceptions
            if (pName === 'Sun' && otherName === 'Saturn') return;
            if (pName === 'Saturn' && otherName === 'Sun') return;
            if (pName === 'Moon' && otherName === 'Mercury') return;
            if (pName === 'Mercury' && otherName === 'Moon') return;

            vedhaPlanet = otherName;
            isBlocked = true;
          }
        });
      }

      let status: 'Favourable' | 'Not Favourable' | 'Vedha Blocked' = isShubh ? 'Favourable' : 'Not Favourable';
      if (isBlocked) status = 'Vedha Blocked';

      vedhaResults[pName] = {
        planet: pName,
        transitHouse,
        isShubh,
        vedhaHouse: vedhaHouseRequired,
        vedhaPlanet,
        isBlocked,
        status
      };
    });

    // 2. Sade Sati Calculation
    const saturnLong = transitPlanets['Saturn']?.exactLongitude || 0;
    const saturnRashi = Math.floor(saturnLong / 30) + 1;

    // Sign-based phases
    const distRashi = (saturnRashi - moonRashi + 12) % 12;
    let isActive = false;
    let phaseDescription = 'Not Active';
    
    if (distRashi === 11) {
      isActive = true;
      phaseDescription = 'First Phase (Rising)';
    } else if (distRashi === 0) {
      isActive = true;
      phaseDescription = 'Peak Phase';
    } else if (distRashi === 1) {
      isActive = true;
      phaseDescription = 'Final Phase (Setting)';
    }

    // Degree-based phases (+- 45 degrees)
    let diffLong = saturnLong - moonLong;
    if (diffLong > 180) diffLong -= 360;
    if (diffLong < -180) diffLong += 360;

    const isDegreeActive = Math.abs(diffLong) <= 45;

    return {
      vedha: vedhaResults,
      sadeSati: {
        isActive,
        isDegreeActive,
        phase: phaseDescription as any,
        description: isActive 
          ? `Saturn is currently in the ${phaseDescription} of Sade Sati.`
          : 'Sade Sati is not currently active for this profile.',
        saturnLongitude: saturnLong,
        moonLongitude: moonLong,
        diffDegrees: diffLong
      }
    };
  }
}
