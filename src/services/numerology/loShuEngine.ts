import { BirthProfile } from '../../types/kundli';
import { NumerologyEngine } from './numerologyEngine';

export interface LoShuGridCell {
  number: number;
  count: number;
}

export interface LoShuArrow {
  id: string;
  name: string;
  numbers: number[];
  type: 'STRENGTH' | 'WEAKNESS';
  isPresent: boolean;
  interpretation: string;
}

export interface LoShuPlane {
  name: string;
  numbers: number[];
  filledCount: number;
  isComplete: boolean;
  interpretation: string;
}

export interface LoShuAnalysis {
  grid: Record<number, LoShuGridCell>;
  presentNumbers: number[];
  missingNumbers: number[];
  repeatedNumbers: { number: number, count: number }[];
  arrows: LoShuArrow[];
  planes: LoShuPlane[];
  digitsExtracted: number[];
  centerNumber: LoShuGridCell;
}

export const LO_SHU_ARROWS = [
  { id: '1-5-9', numbers: [1, 5, 9], name: 'Arrow of Determination', type: 'STRENGTH' as const, interpretation: 'Strong willpower, persistent, and determined.' },
  { id: '3-5-7', numbers: [3, 5, 7], name: 'Arrow of Spirituality', type: 'STRENGTH' as const, interpretation: 'Deeply compassionate, spiritual, and philosophical.' },
  { id: '8-1-6', numbers: [8, 1, 6], name: 'Arrow of Prosperity', type: 'STRENGTH' as const, interpretation: 'Practical, good at business, and attracts wealth.' },
  { id: '4-9-2', numbers: [4, 9, 2], name: 'Arrow of Intellect', type: 'STRENGTH' as const, interpretation: 'Sharp memory, analytical, and highly intelligent.' },
  { id: '3-6-9', numbers: [3, 6, 9], name: 'Arrow of Action', type: 'STRENGTH' as const, interpretation: 'Energetic, action-oriented, and dynamic.' },
  { id: '2-5-8', numbers: [2, 5, 8], name: 'Arrow of Emotional Balance', type: 'STRENGTH' as const, interpretation: 'Emotionally stable, understanding, and patient.' },
  { id: '1-2-3', numbers: [1, 2, 3], name: 'Arrow of Planning', type: 'STRENGTH' as const, interpretation: 'Good at organizing, planning, and structured thinking.' },
  { id: '7-8-9', numbers: [7, 8, 9], name: 'Arrow of Activity', type: 'STRENGTH' as const, interpretation: 'Need for physical activity, sports, and expression.' },
  { id: '4-5-6', numbers: [4, 5, 6], name: 'Arrow of Will', type: 'STRENGTH' as const, interpretation: 'Strong willpower and perseverance.' },
  { id: '1-5-9-W', numbers: [1, 5, 9], name: 'Arrow of Apathy', type: 'WEAKNESS' as const, interpretation: 'May lack motivation or clear direction without conscious effort.' },
  { id: '3-5-7-W', numbers: [3, 5, 7], name: 'Arrow of Loneliness', type: 'WEAKNESS' as const, interpretation: 'Tendency to isolate or feel misunderstood.' },
  { id: '2-5-8-W', numbers: [2, 5, 8], name: 'Arrow of Suspicion', type: 'WEAKNESS' as const, interpretation: 'Can struggle with trust or emotional vulnerability.' },
  { id: '4-5-6-W', numbers: [4, 5, 6], name: 'Arrow of Frustration', type: 'WEAKNESS' as const, interpretation: 'May experience delays or repeated obstacles.' },
  { id: '1-2-3-W', numbers: [1, 2, 3], name: 'Arrow of Confusion', type: 'WEAKNESS' as const, interpretation: 'May struggle with organizing thoughts and making structured plans.' },
  { id: '7-8-9-W', numbers: [7, 8, 9], name: 'Arrow of Loss', type: 'WEAKNESS' as const, interpretation: 'Requires caution in financial and physical pursuits.' }
];

export const LO_SHU_PLANES = [
  { name: 'Mental Plane', numbers: [4, 9, 2], interpretation: 'Focuses on thinking, logic, memory, and intellectual pursuits.' },
  { name: 'Emotional Plane', numbers: [3, 5, 7], interpretation: 'Focuses on feelings, intuition, spirituality, and inner peace.' },
  { name: 'Practical Plane', numbers: [8, 1, 6], interpretation: 'Focuses on physical reality, business, action, and material success.' }
];

export class LoShuEngine {
  static extractDigits(dob: string): number[] {
    if (!dob || typeof dob !== 'string') return [];

    const { day, month, year } = NumerologyEngine.parseDate(dob);
    if (!day || !month || !year) return [];

    const dayStr = day.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString();

    const numString = dayStr + monthStr + yearStr;
    const digits: number[] = [];

    for (const char of numString) {
      if (char >= '1' && char <= '9') {
        digits.push(parseInt(char, 10));
      }
    }

    return digits;
  }

  static evaluate(profile: BirthProfile): LoShuAnalysis {
    const grid: Record<number, LoShuGridCell> = {};
    for (let i = 1; i <= 9; i++) {
      grid[i] = { number: i, count: 0 };
    }

    if (!profile || !profile.dob) {
      return {
        grid,
        presentNumbers: [],
        missingNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        repeatedNumbers: [],
        arrows: [],
        planes: LO_SHU_PLANES.map(p => ({ ...p, filledCount: 0, isComplete: false })),
        digitsExtracted: [],
        centerNumber: grid[5]
      };
    }

    const digits = this.extractDigits(profile.dob);

    for (const d of digits) {
      if (d >= 1 && d <= 9 && grid[d]) {
        grid[d].count++;
      }
    }

    const presentNumbers: number[] = [];
    const missingNumbers: number[] = [];
    const repeatedNumbers: { number: number, count: number }[] = [];

    for (let i = 1; i <= 9; i++) {
      const cell = grid[i] ?? { number: i, count: 0 };
      if (cell.count > 0) {
        presentNumbers.push(i);
        if (cell.count > 1) {
          repeatedNumbers.push({ number: i, count: cell.count });
        }
      } else {
        missingNumbers.push(i);
      }
    }

    const arrows: LoShuArrow[] = LO_SHU_ARROWS.map(arrow => {
      let isPresent = false;
      if (arrow.type === 'STRENGTH') {
        isPresent = arrow.numbers.every(num => (grid[num]?.count ?? 0) > 0);
      } else {
        isPresent = arrow.numbers.every(num => (grid[num]?.count ?? 0) === 0);
      }
      return {
        ...arrow,
        isPresent
      };
    }).filter(a => a.isPresent);

    const planes: LoShuPlane[] = LO_SHU_PLANES.map(plane => {
      const filledCount = plane.numbers.filter(num => (grid[num]?.count ?? 0) > 0).length;
      return {
        ...plane,
        filledCount,
        isComplete: filledCount === plane.numbers.length
      };
    });

    return {
      grid,
      presentNumbers,
      missingNumbers,
      repeatedNumbers,
      arrows,
      planes,
      digitsExtracted: digits,
      centerNumber: grid[5] ?? { number: 5, count: 0 }
    };
  }
}

