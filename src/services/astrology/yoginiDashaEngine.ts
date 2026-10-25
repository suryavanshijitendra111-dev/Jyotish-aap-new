/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData } from '../../types/kundli';

export interface YoginiDashaPeriod {
  name: string;
  hindiName: string;
  planet: string;
  durationYears: number;
  startDate: Date;
  endDate: Date;
  description: string;
  isCurrent: boolean;
}

export interface YoginiDashaResult {
  currentMahadasha: YoginiDashaPeriod;
  fullCycle: YoginiDashaPeriod[];
}

const YOGINIS = [
  { id: 1, name: 'Mangala', hindiName: 'मंगला', planet: 'Moon', duration: 1, description: 'Success, happiness and auspicious events.' },
  { id: 2, name: 'Pingala', hindiName: 'पिंगला', planet: 'Sun', duration: 2, description: 'Minor health issues, success after effort.' },
  { id: 3, name: 'Dhanya', hindiName: 'धान्या', planet: 'Jupiter', duration: 3, description: 'Wealth, prosperity and wisdom.' },
  { id: 4, name: 'Bhramari', hindiName: 'भ्रामरी', planet: 'Mars', duration: 4, description: 'Travel, dynamic energy, possible restlessness.' },
  { id: 5, name: 'Bhadrika', hindiName: 'भद्रिका', planet: 'Mercury', duration: 5, description: 'Intellectual growth, family happiness.' },
  { id: 6, name: 'Ulka', hindiName: 'उल्का', planet: 'Saturn', duration: 6, description: 'Hard work, challenges, but long-term gains.' },
  { id: 7, name: 'Siddha', hindiName: 'सिद्धा', planet: 'Venus', duration: 7, description: 'Fulfillment of desires, luxury and art.' },
  { id: 8, name: 'Sankata', hindiName: 'संकटा', planet: 'Rahu', duration: 8, description: 'Sudden changes, caution required, spiritual growth.' },
];

export class YoginiDashaEngine {
  static calculate(data: MasterKundliData): YoginiDashaResult {
    const moon = data.planets['Moon'];
    if (!moon || !data.birthProfile) {
      return {
        currentMahadasha: {} as YoginiDashaPeriod,
        fullCycle: []
      };
    }

    let birthDate = new Date();
    try {
      const dob = data.birthProfile?.dob || '';
      const time = data.birthProfile?.time || '00:00';
      
      // Try ISO format first
      birthDate = new Date(`${dob}T${time}`);
      
      if (isNaN(birthDate.getTime())) {
        // Handle YYYY-MM-DD or DD-MM-YYYY
        const parts = dob.split(/[-/]/);
        const tParts = time.split(':');
        
        if (parts.length === 3) {
          let year, month, day;
          if (parts[0].length === 4) {
            [year, month, day] = parts.map(Number);
          } else {
            [day, month, year] = parts.map(Number);
          }
          
          const h = parseInt(tParts[0]) || 0;
          const m = parseInt(tParts[1]) || 0;
          const s = parseInt(tParts[2]) || 0;
          
          birthDate = new Date(year, month - 1, day, h, m, s);
        }
      }
    } catch (e) {
      console.error('Date parsing failed', e);
    }
    
    if (isNaN(birthDate.getTime())) birthDate = new Date();
    const now = new Date();

    // 1. Determine Starting Yogini
    const nakIndex = moon.nakshatra || 1;
    let startYoginiIndex = (nakIndex + 3) % 8;
    if (startYoginiIndex === 0) startYoginiIndex = 8;
    startYoginiIndex -= 1; // 0-indexed

    // 2. Calculate Balance at Birth
    const nakDuration = 360 / 27; 
    const startOfNak = Math.max(0, (nakIndex - 1) * nakDuration);
    const posInNak = Math.max(0, (moon.siderealLongitude || 0) - startOfNak);
    const remainingInNak = Math.max(0, nakDuration - posInNak);
    const currentYogini = YOGINIS[startYoginiIndex] || YOGINIS[0];
    
    let balanceYears = (remainingInNak / nakDuration) * currentYogini.duration;
    if (isNaN(balanceYears)) balanceYears = 0;
    
    const dashaStart = new Date(birthDate);
    const dashaEndAtBirth = new Date(birthDate);
    dashaEndAtBirth.setFullYear(dashaEndAtBirth.getFullYear() + Math.floor(balanceYears));
    dashaEndAtBirth.setMonth(dashaEndAtBirth.getMonth() + Math.floor((balanceYears % 1) * 12));

    const fullCycle: YoginiDashaPeriod[] = [];
    let rollingDate = new Date(birthDate);

    // We calculate 3 full cycles (36 * 3 = 108 years) to cover a lifetime
    for (let cycle = 0; cycle < 3; cycle++) {
      for (let i = 0; i < 8; i++) {
        const idx = (startYoginiIndex + i + (cycle * 8)) % 8;
        const yogini = YOGINIS[idx];
        
        const periodStart = new Date(rollingDate);
        let duration = yogini.duration;
        
        // Adjust for birth balance in the very first period
        if (cycle === 0 && i === 0) {
          duration = balanceYears;
        }

        const periodEnd = new Date(periodStart);
        periodEnd.setFullYear(periodEnd.getFullYear() + Math.floor(duration));
        periodEnd.setMonth(periodEnd.getMonth() + Math.floor((duration % 1) * 12));
        
        const isCurrent = now >= periodStart && now <= periodEnd;

        fullCycle.push({
          name: yogini.name,
          hindiName: yogini.hindiName,
          planet: yogini.planet,
          durationYears: yogini.duration,
          startDate: periodStart,
          endDate: periodEnd,
          description: yogini.description,
          isCurrent
        });

        rollingDate = periodEnd;
        if (rollingDate.getFullYear() > birthDate.getFullYear() + 105) break;
      }
    }

    const currentMahadasha = fullCycle.find(p => p.isCurrent) || fullCycle[0];

    return {
      currentMahadasha,
      fullCycle: fullCycle.slice(0, 15) // Return a reasonable range
    };
  }
}
