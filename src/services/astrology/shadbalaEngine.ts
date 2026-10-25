/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';

export interface IndividualShadbala {
  sthanaBala: number;
  digBala: number;
  kaalaBala: number;
  cheshtaBala: number;
  naisargikaBala: number;
  drikBala: number;
  totalVirupas: number;
  totalRupas: number;
  requiredVirupas: number;
  strengthRatio: number; // Percentage
  ishtaPhala: number;
  kashtaPhala: number;
}

export interface BhavaBalaResult {
  house: number;
  adhipatiBala: number;
  digBala: number;
  drishtiBala: number;
  totalVirupas: number;
  totalRupas: number;
  rank: number;
}

export interface ShadbalaResult {
  planets: Record<string, IndividualShadbala>;
  houses: BhavaBalaResult[];
}

const NAISARGIKA_BALA_VALUES: Record<string, number> = {
  Sun: 60,
  Moon: 51.43,
  Mars: 17.14,
  Mercury: 25.71,
  Jupiter: 34.29,
  Venus: 42.86,
  Saturn: 8.57
};

const REQUIRED_SHADBALA: Record<string, number> = {
  Sun: 390,
  Moon: 360,
  Mars: 300,
  Mercury: 420,
  Jupiter: 390,
  Venus: 330,
  Saturn: 300
};

export class ShadbalaEngine {
  static calculate(data: MasterKundliData): ShadbalaResult {
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const planetResults: Record<string, IndividualShadbala> = {};

    planets.forEach(pName => {
      const pData = data.planets[pName];
      if (!pData) return;

      const sthana = this.calculateSthanaBala(pData, data);
      const dig = this.calculateDigBala(pName, pData, data);
      const kaala = this.calculateKaalaBala(pName, pData, data);
      const cheshta = this.calculateCheshtaBala(pData);
      const naisargika = NAISARGIKA_BALA_VALUES[pName] || 0;
      const drik = this.calculateDrikBala(pName, data);

      const totalVirupas = sthana + dig + kaala + cheshta + naisargika + drik;
      const totalRupas = totalVirupas / 60;
      const required = REQUIRED_SHADBALA[pName] || 300;

      // Ishta/Kashta Phala Calculation (Simplified)
      // Ishta = sqrt(Ucha Bala * Cheshta Bala)
      // Kashta = sqrt((60 - Ucha) * (60 - Cheshta))
      const uchaBala = this.calculateUchaBala(pData);
      const ishta = Math.sqrt(uchaBala * cheshta);
      const kashta = Math.sqrt((60 - uchaBala) * (60 - cheshta));

      planetResults[pName] = {
        sthanaBala: sthana,
        digBala: dig,
        kaalaBala: kaala,
        cheshtaBala: cheshta,
        naisargikaBala: naisargika,
        drikBala: drik,
        totalVirupas,
        totalRupas,
        requiredVirupas: required,
        strengthRatio: (totalVirupas / required) * 100,
        ishtaPhala: ishta,
        kashtaPhala: kashta
      };
    });

    const houseResults = this.calculateBhavaBala(data, planetResults);

    return {
      planets: planetResults,
      houses: houseResults
    };
  }

  private static calculateUchaBala(p: PlanetData): number {
    const exaltationPoints: Record<string, number> = {
      Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200
    };
    const point = exaltationPoints[p.name];
    if (point === undefined) return 0;

    const diff = Math.abs(p.siderealLongitude - point);
    const dist = diff > 180 ? 360 - diff : diff;
    return (180 - dist) / 3; // Max 60
  }

  private static calculateSthanaBala(p: PlanetData, data: MasterKundliData): number {
    let score = this.calculateUchaBala(p);
    
    // Saptavargiya Bala (Simplified approximation)
    // Own house = 30, Friendly = 22.5, Neutral = 15, Enemy = 7.5
    const dignityScores: Record<string, number> = {
      'OwnHouse': 30, 'Exalted': 30, 'Friendly': 22.5, 'Neutral': 15, 'Enemy': 7.5, 'Debilitated': 3.75, 'None': 15
    };
    score += dignityScores[p.dignity] || 15;

    // Kendradi Bala
    const house = p.d1House;
    if ([1, 4, 7, 10].includes(house)) score += 60;
    else if ([2, 5, 8, 11].includes(house)) score += 30;
    else score += 15;

    // Drekkana Bala
    // Based on Rashi and Degree (Simplified)
    if (p.degree < 10) score += 15;
    else if (p.degree < 20) score += 10;
    else score += 5;

    return score;
  }

  private static calculateDigBala(pName: string, p: PlanetData, data: MasterKundliData): number {
    const digBalaPoints: Record<string, number> = {
      Jupiter: 1, Mercury: 1, // 1st House
      Sun: 10, Mars: 10,       // 10th House
      Saturn: 7,               // 7th House
      Moon: 4, Venus: 4        // 4th House
    };
    const bestHouse = digBalaPoints[pName];
    if (!bestHouse) return 30;

    const currentHouse = p.d1House;
    const oppositeHouse = (bestHouse + 6) % 12 || 12;
    
    // Calculate distance in houses
    let dist = Math.abs(currentHouse - bestHouse);
    if (dist > 6) dist = 12 - dist;
    
    return (6 - dist) * 10; // Max 60 at best house, 0 at opposite
  }

  private static calculateKaalaBala(pName: string, p: PlanetData, data: MasterKundliData): number {
    let score = 30; // Baseline

    // Nathonnatha (Day/Night) - Simplified
    const isDay = data.planets['Sun'].d1House > 6;
    const dayPlanets = ['Sun', 'Jupiter', 'Venus'];
    const nightPlanets = ['Moon', 'Mars', 'Saturn'];
    
    if (isDay && dayPlanets.includes(pName)) score += 30;
    if (!isDay && nightPlanets.includes(pName)) score += 30;
    if (pName === 'Mercury') score += 30; // Always gets some

    // Paksha Bala (Moon's distance from Sun)
    if (pName === 'Moon') {
       const sunLong = data.planets['Sun'].siderealLongitude;
       const moonLong = data.planets['Moon'].siderealLongitude;
       let diff = moonLong - sunLong;
       if (diff < 0) diff += 360;
       score += (diff / 3); // Max 120 at 360 (full moon phase)
    }

    return score;
  }

  private static calculateCheshtaBala(p: PlanetData): number {
    if (p.isRetrograde) return 60;
    // Stationary or slow motion gets more strength
    if (p.motionStatus === 'Stationary') return 45;
    return 30; // Normal
  }

  private static calculateDrikBala(pName: string, data: MasterKundliData): number {
    // Aspect strength (Simplified)
    // Benefics (Jupiter, Venus) add strength, Malefics (Saturn, Mars) subtract
    let score = 0;
    const targetHouse = data.planets[pName]?.d1House;
    if (!targetHouse) return 0;

    const benefics = ['Jupiter', 'Venus'];
    const malefics = ['Saturn', 'Mars'];

    benefics.forEach(b => {
      const bHouse = data.planets[b]?.d1House;
      if (!bHouse) return;
      const diff = Math.abs(targetHouse - bHouse);
      if ([0, 4, 6, 8].includes(diff)) score += 15; // 1, 5, 7, 9 aspects
    });

    malefics.forEach(m => {
      const mHouse = data.planets[m]?.d1House;
      if (!mHouse) return;
      const diff = Math.abs(targetHouse - mHouse);
      if ([0, 2, 6, 9].includes(diff)) score -= 10; // 1, 3, 7, 10 aspects
    });

    return score;
  }

  private static calculateBhavaBala(data: MasterKundliData, planetShadbala: Record<string, IndividualShadbala>): BhavaBalaResult[] {
    const results: BhavaBalaResult[] = [];

    for (let h = 1; h <= 12; h++) {
      const houseData = data.d1Chart[h];
      const lordName = houseData.signLord;
      const lordBala = planetShadbala[lordName]?.totalVirupas || 0;

      // Bhava Dig Bala (Simplified)
      // Nara (1-3-4-5-6-7-8-9-10-11-12) etc.
      // Fixed values per house group
      let digBala = 30;
      if ([1, 4, 7, 10].includes(h)) digBala = 60;
      else if ([2, 5, 8, 11].includes(h)) digBala = 40;

      // Bhava Drishti Bala (Simplified)
      let drishtiBala = 0;
      ['Jupiter', 'Venus'].forEach(b => {
         const bHouse = data.planets[b]?.d1House;
         if (bHouse && Math.abs(h - bHouse) === 6) drishtiBala += 20; // 7th aspect
      });

      const totalVirupas = (lordBala * 0.5) + digBala + drishtiBala; // Lord's strength contributes 50%
      
      results.push({
        house: h,
        adhipatiBala: lordBala,
        digBala: digBala,
        drishtiBala: drishtiBala,
        totalVirupas: totalVirupas,
        totalRupas: totalVirupas / 60,
        rank: 0
      });
    }

    // Rank houses
    const sorted = [...results].sort((a, b) => b.totalVirupas - a.totalVirupas);
    sorted.forEach((h, index) => {
      const original = results.find(r => r.house === h.house);
      if (original) original.rank = index + 1;
    });

    return results;
  }
}
