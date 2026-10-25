import { BirthProfile } from '../../types/kundli';

export interface LifeCycle {
  cycleNumber: number;
  value: number;
  startAge: number;
  endAge: number | string;
  theme: string;
}

export interface DateAnalysisResult {
  date: string;
  dayNumber: number;
  monthNumber: number;
  yearNumber: number;
  fullDateNumber: number;
  compoundNumber: number;
  masterNumber: number | null;
  breakdown: string;
}

export interface NumerologyAnalysis {
  birthNumber: number;
  destinyNumber: number;
  nameNumber: number;
  compoundNameNumber: number;
  nameCalculationBreakdown: { letter: string; value: number }[];
  birthNumberBreakdown: string;
  destinyNumberBreakdown: string;
  system: string;
  
  attitudeNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  maturityNumber: number;
  
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  
  pinnacles: { first: number, second: number, third: number, fourth: number };
  challenges: { first: number, second: number, third: number, fourth: number };
  
  lifeCycles: LifeCycle[];
  
  karmicDebts: number[];
  masterNumbers: number[];
}

export const CHALDEAN_MAPPING: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8
};

export class NumerologyEngine {
  static reduceNumber(num: number, keepMaster: boolean = false): number {
    if (keepMaster && (num === 11 || num === 22 || num === 33)) return num;
    if (num <= 9) return num;
    return this.reduceNumber(num.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0), keepMaster);
  }

  static isVowel(char: string): boolean {
    return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
  }

  static parseDate(dob: string): { day: number; month: number; year: number } {
    if (!dob || typeof dob !== 'string') {
      return { day: 1, month: 1, year: 2000 };
    }

    const cleanDob = dob.trim();

    const monthMap: Record<string, number> = {
      january: 1, jan: 1,
      february: 2, feb: 2,
      march: 3, mar: 3,
      april: 4, apr: 4,
      may: 5,
      june: 6, jun: 6,
      july: 7, jul: 7,
      august: 8, aug: 8,
      september: 9, sep: 9, sept: 9,
      october: 10, oct: 10,
      november: 11, nov: 11,
      december: 12, dec: 12
    };

    // 1. Format: "DD MMMM YYYY" or "D MMMM YYYY" (e.g. "23 April 2016", "23-April-2016")
    const spaceParts = cleanDob.split(/[\s\-_/]+/);
    if (spaceParts.length === 3) {
      // Check if middle part is month name (text)
      const monthKey = spaceParts[1].toLowerCase();
      if (monthMap[monthKey]) {
        const day = parseInt(spaceParts[0], 10);
        const year = parseInt(spaceParts[2], 10);
        if (!isNaN(day) && !isNaN(year) && day >= 1 && day <= 31 && year > 1000) {
          return { day, month: monthMap[monthKey], year };
        }
      }

      // Check if first part is month name (e.g. "April 23 2016")
      const firstMonthKey = spaceParts[0].toLowerCase();
      if (monthMap[firstMonthKey]) {
        const day = parseInt(spaceParts[1], 10);
        const year = parseInt(spaceParts[2], 10);
        if (!isNaN(day) && !isNaN(year) && day >= 1 && day <= 31 && year > 1000) {
          return { day, month: monthMap[firstMonthKey], year };
        }
      }

      // Check if all 3 parts are numeric:
      const n1 = parseInt(spaceParts[0], 10);
      const n2 = parseInt(spaceParts[1], 10);
      const n3 = parseInt(spaceParts[2], 10);

      if (!isNaN(n1) && !isNaN(n2) && !isNaN(n3)) {
        // Case A: YYYY-MM-DD
        if (n1 > 1000) {
          return { day: Math.max(1, Math.min(31, n3)), month: Math.max(1, Math.min(12, n2)), year: n1 };
        }
        // Case B: DD/MM/YYYY or DD-MM-YYYY (Indian format preferred)
        if (n3 > 1000) {
          return { day: Math.max(1, Math.min(31, n1)), month: Math.max(1, Math.min(12, n2)), year: n3 };
        }
      }
    }

    // 2. Native Date parser fallback
    const parsedDate = new Date(cleanDob);
    if (!isNaN(parsedDate.getTime())) {
      return {
        day: parsedDate.getDate(),
        month: parsedDate.getMonth() + 1,
        year: parsedDate.getFullYear()
      };
    }

    // Safe fallback to prevent application crashes
    return { day: 1, month: 1, year: 2000 };
  }

  static calculateMulank(day: number): { value: number; breakdown: string } {
    const sum = day.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const reduced = this.reduceNumber(sum);
    return {
      value: reduced,
      breakdown: `${day.toString().split('').join(' + ')} = ${sum}${sum !== reduced ? ` -> ${reduced}` : ''}`
    };
  }

  static calculateBhagyank(day: number, month: number, year: number): { value: number; breakdown: string; raw: number } {
    const daySum = day.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const monthSum = month.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const yearSum = year.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    
    const totalSum = daySum + monthSum + yearSum;
    const reduced = this.reduceNumber(totalSum, true);
    
    return {
      value: this.reduceNumber(totalSum),
      raw: totalSum,
      breakdown: `(${day}) + (${month}) + (${year}) = ${totalSum} -> ${this.reduceNumber(totalSum)}`
    };
  }

  static calculateNameNumerology(name: string) {
    let totalSum = 0;
    let vowelSum = 0;
    let consonantSum = 0;
    const breakdown: { letter: string, value: number, isVowel: boolean }[] = [];
    
    // Safety guard for undefined/null name
    const safeName = typeof name === 'string' ? name : '';
    const cleanName = safeName.toLowerCase().replace(/[^a-z]/g, '');
    
    for (const char of cleanName) {
      const val = CHALDEAN_MAPPING[char];
      if (val) {
        const isV = this.isVowel(char);
        totalSum += val;
        if (isV) vowelSum += val;
        else consonantSum += val;
        
        breakdown.push({ letter: char.toUpperCase(), value: val, isVowel: isV });
      }
    }
    
    return {
      compound: totalSum,
      reduced: this.reduceNumber(totalSum),
      soulUrge: this.reduceNumber(vowelSum),
      personality: this.reduceNumber(consonantSum),
      breakdown
    };
  }

  static checkKarmicDebtsAndMaster(numbers: number[]) {
    const karmic = [13, 14, 16, 19];
    const master = [11, 22, 33];
    const debts = numbers.filter(n => karmic.includes(n));
    const masters = numbers.filter(n => master.includes(n));
    return { debts, masters };
  }

  static calculateLifeCycles(day: number, month: number, year: number, destinyNumber: number): LifeCycle[] {
    const redMonth = this.reduceNumber(month);
    const redDay = this.reduceNumber(day);
    const redYear = this.reduceNumber(year);

    const firstCycleEnd = 36 - destinyNumber;
    const secondCycleEnd = firstCycleEnd + 27;

    return [
      {
        cycleNumber: 1,
        value: redMonth,
        startAge: 0,
        endAge: firstCycleEnd,
        theme: 'Formative Years / Early Development'
      },
      {
        cycleNumber: 2,
        value: redDay,
        startAge: firstCycleEnd,
        endAge: secondCycleEnd,
        theme: 'Productive Years / Middle Age'
      },
      {
        cycleNumber: 3,
        value: redYear,
        startAge: secondCycleEnd,
        endAge: 'Life',
        theme: 'Harvest Years / Later Life'
      }
    ];
  }

  static analyzeDate(dateString: string): DateAnalysisResult | null {
    // Expected format: YYYY-MM-DD
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    const daySum = day.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const monthSum = month.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const yearSum = year.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);

    const totalSum = daySum + monthSum + yearSum;
    const reduced = this.reduceNumber(totalSum, false);
    const master = this.reduceNumber(totalSum, true) > 9 ? this.reduceNumber(totalSum, true) : null;

    return {
      date: dateString,
      dayNumber: this.reduceNumber(daySum),
      monthNumber: this.reduceNumber(monthSum),
      yearNumber: this.reduceNumber(yearSum),
      fullDateNumber: reduced,
      compoundNumber: totalSum,
      masterNumber: [11, 22, 33].includes(master as number) ? master : null,
      breakdown: `Day(${day}) + Month(${month}) + Year(${year}) = ${totalSum} -> ${reduced}`
    };
  }

  static evaluate(profile: BirthProfile, targetDate: Date = new Date()): NumerologyAnalysis {
    const { day, month, year } = this.parseDate(profile.dob);
    
    const mulank = this.calculateMulank(day);
    const bhagyank = this.calculateBhagyank(day, month, year);
    const nameData = this.calculateNameNumerology(profile.name || '');
    
    const attitudeRaw = day + month;
    const attitudeNumber = this.reduceNumber(attitudeRaw);
    
    const maturityRaw = bhagyank.value + nameData.reduced;
    const maturityNumber = this.reduceNumber(maturityRaw);

    // Timing
    const currentYear = targetDate.getFullYear();
    const currentMonth = targetDate.getMonth() + 1;
    const currentDay = targetDate.getDate();

    const personalYearRaw = day + month + currentYear;
    const personalYear = this.reduceNumber(personalYearRaw);
    
    const personalMonthRaw = personalYear + currentMonth;
    const personalMonth = this.reduceNumber(personalMonthRaw);
    
    const personalDayRaw = personalMonth + currentDay;
    const personalDay = this.reduceNumber(personalDayRaw);

    const redMonth = this.reduceNumber(month);
    const redDay = this.reduceNumber(day);
    const redYear = this.reduceNumber(year);

    const pinnacles = {
      first: this.reduceNumber(redMonth + redDay),
      second: this.reduceNumber(redDay + redYear),
      third: this.reduceNumber(this.reduceNumber(redMonth + redDay) + this.reduceNumber(redDay + redYear)),
      fourth: this.reduceNumber(redMonth + redYear)
    };

    const challenges = {
      first: Math.abs(redMonth - redDay),
      second: Math.abs(redDay - redYear),
      third: Math.abs(Math.abs(redMonth - redDay) - Math.abs(redDay - redYear)),
      fourth: Math.abs(redMonth - redYear)
    };

    const lifeCycles = this.calculateLifeCycles(day, month, year, bhagyank.value);

    const allRawNumbers = [
      bhagyank.raw, nameData.compound, attitudeRaw, maturityRaw,
      day, month, year, personalYearRaw
    ];
    
    const { debts, masters } = this.checkKarmicDebtsAndMaster(allRawNumbers);

    return {
      birthNumber: mulank.value,
      destinyNumber: bhagyank.value,
      nameNumber: nameData.reduced,
      compoundNameNumber: nameData.compound,
      nameCalculationBreakdown: nameData.breakdown,
      birthNumberBreakdown: mulank.breakdown,
      destinyNumberBreakdown: bhagyank.breakdown,
      system: 'Chaldean',
      
      attitudeNumber,
      soulUrgeNumber: nameData.soulUrge,
      personalityNumber: nameData.personality,
      maturityNumber,
      
      personalYear,
      personalMonth,
      personalDay,
      
      pinnacles,
      challenges,
      lifeCycles,
      
      karmicDebts: Array.from(new Set(debts)),
      masterNumbers: Array.from(new Set(masters))
    };
  }

  static compareNames(currentName: string, proposedName: string) {
    return {
      current: this.calculateNameNumerology(currentName || ''),
      proposed: this.calculateNameNumerology(proposedName || '')
    };
  }
}
