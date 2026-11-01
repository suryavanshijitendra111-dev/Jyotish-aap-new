/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — DIGITAL NUMEROLOGY ENGINE
 * Mobile, House, Vehicle, Angel numbers & sacred yantra numeric mappings
 */

export interface NumberEntry {
  number: string;
  title: string;
  category: string;
  description: string;
  name?: string;
}

export const angelNumbers: NumberEntry[] = [
  { number: '111', title: 'New Beginnings', category: 'Guidance', description: 'Manifestation portal is open. Keep thoughts focused on aspirations.' },
  { number: '222', title: 'Balance & Trust', category: 'Peace', description: 'Divine timing is in play. Trust where you are being led.' },
  { number: '333', title: 'Ascended Masters', category: 'Spirituality', description: 'Spiritual guides and protectors surround you with wisdom.' },
  { number: '444', title: 'Protection & Grounding', category: 'Health', description: 'Angelic presence and stability. You are safe and guided.' },
  { number: '555', title: 'Major Transformation', category: 'Finance', description: 'Significant positive shifts in life direction approaching.' },
  { number: '777', title: 'Divine Luck', category: 'Spirituality', description: 'Spiritual evolution, good fortune and auspicious alignment.' },
  { number: '888', title: 'Abundance & Karma', category: 'Finance', description: 'Financial flow, karmic rewards, and material balance.' }
];

export const esotericCodes: NumberEntry[] = [
  { number: '520 741 8', title: 'Unexpected Wealth & Instant Results', category: 'Finance', description: 'Grabovoi sequence for rapid economic turnaround.' },
  { number: '71427321893', title: 'Absolute Normalization of Health', category: 'Health', description: 'Restoration of bodily equilibrium and vitality.' },
  { number: '1888888 9 1', title: 'Spiritual Illumination & Peace', category: 'Peace', description: 'Deep mental stillness and inner clarity.' }
];

export const switchNumbers: NumberEntry[] = [
  { number: '19751', title: 'Universal Harmony & Relief', category: 'Peace', description: 'Harmonizes surrounding vibrations and resolves tensions.' },
  { number: '58', title: 'Immediate Flow & Action', category: 'Finance', description: 'Unblocks stagnant creative and commercial momentum.' }
];

export const yantraNumbers: NumberEntry[] = [
  { number: '15', title: 'Surya / Panchadashi Yantra Total', category: 'Spirituality', description: 'The 3x3 sacred grid summing to 15 in all directions.' },
  { number: '24', title: 'Brihaspati Gurukrupa Yantra Sum', category: 'Guidance', description: 'Auspicious Guru matrix conferring wisdom and righteous conduct.' }
];

function reduceToSingleDigit(numStr: string): { root: number; compound: number; steps: string } {
  const digits = numStr.replace(/\D/g, '').split('').map(Number);
  if (digits.length === 0) return { root: 1, compound: 1, steps: '1' };
  
  const compound = digits.reduce((acc, curr) => acc + curr, 0);
  let cur = compound;
  while (cur > 9 && cur !== 11 && cur !== 22 && cur !== 33) {
    cur = cur.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return {
    root: cur > 9 ? cur.toString().split('').map(Number).reduce((a, b) => a + b, 0) : cur,
    compound,
    steps: `${digits.join('+')} = ${compound} -> ${cur}`
  };
}

function checkCompatibility(num: number, target: number): 'compatible' | 'challenging' | 'neutral' {
  const friendly: Record<number, number[]> = {
    1: [1, 2, 3, 5, 9],
    2: [1, 2, 5],
    3: [1, 3, 5, 9],
    4: [5, 6, 7],
    5: [1, 2, 3, 5, 6],
    6: [5, 6, 7],
    7: [4, 6],
    8: [5, 6],
    9: [1, 3, 5, 9]
  };

  const hostile: Record<number, number[]> = {
    1: [8],
    2: [8, 9],
    3: [6],
    4: [4, 8, 9],
    5: [],
    6: [3],
    7: [1],
    8: [1, 2, 4],
    9: [2, 4]
  };

  if (friendly[target]?.includes(num)) return 'compatible';
  if (hostile[target]?.includes(num)) return 'challenging';
  return 'neutral';
}

export class DigitalNumerologyEngine {
  public static analyzeMobile(mobileNumber: string, birthNumber: number = 1, destinyNumber: number = 1): any {
    const cleanDigits = mobileNumber.replace(/\D/g, '');
    const { root, compound, steps } = reduceToSingleDigit(cleanDigits);

    const maskedNumber = cleanDigits.length >= 4 
      ? cleanDigits.slice(0, 2) + '••••' + cleanDigits.slice(-4)
      : cleanDigits;

    const pairs: Array<{ pair: string; classification: string; interpretation: string }> = [];
    for (let i = 0; i < cleanDigits.length - 1; i++) {
      const p = cleanDigits.slice(i, i + 2);
      if (p === '11') pairs.push({ pair: p, classification: 'Master Energy', interpretation: 'Intuitive leadership' });
      else if (p === '24') pairs.push({ pair: p, classification: 'Wisdom', interpretation: 'Subtle guidance and luck' });
      else if (p === '33') pairs.push({ pair: p, classification: 'Compassion', interpretation: 'Universal love and teaching' });
      else if (p === '77') pairs.push({ pair: p, classification: 'Mystic', interpretation: 'Spiritual focus' });
      else if (p === '88') pairs.push({ pair: p, classification: 'Material Flow', interpretation: 'Karma and discipline' });
    }

    return {
      maskedNumber,
      rootNumber: root,
      compoundNumber: compound,
      driverCompatibility: {
        status: checkCompatibility(root, birthNumber || 1)
      },
      conductorCompatibility: {
        status: checkCompatibility(root, destinyNumber || 1)
      },
      pairs,
      breakdown: `Digits sum: ${steps}. Driver: ${birthNumber}, Conductor: ${destinyNumber}.`
    };
  }

  public static analyzeObjectNumber(objectNumber: string, birthNumber: number = 1, destinyNumber: number = 1): any {
    const clean = objectNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    // Convert chars to pythagorean or chaldean values
    const charValues: Record<string, number> = {
      A: 1, I: 1, J: 1, Q: 1, Y: 1,
      B: 2, K: 2, R: 2,
      C: 3, G: 3, L: 3, S: 3,
      D: 4, M: 4, T: 4,
      E: 5, H: 5, N: 5, X: 5,
      U: 6, V: 6, W: 6,
      O: 7, Z: 7,
      F: 8, P: 8
    };

    let total = 0;
    for (const ch of clean) {
      if (/\d/.test(ch)) total += parseInt(ch, 10);
      else if (charValues[ch]) total += charValues[ch];
    }

    let root = total;
    while (root > 9) {
      root = root.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }

    return {
      objectIdentifier: clean,
      rootNumber: root || 1,
      compoundNumber: total || 1,
      driverCompatibility: {
        status: checkCompatibility(root || 1, birthNumber || 1)
      },
      conductorCompatibility: {
        status: checkCompatibility(root || 1, destinyNumber || 1)
      },
      pairs: [],
      breakdown: `Calculation for ${clean}: Total ${total} reduces to Root ${root}.`
    };
  }
}
