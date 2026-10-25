import { NumerologyEngine } from './numerologyEngine';

export interface MobileAnalysis {
  maskedNumber: string;
  compoundNumber: number;
  rootNumber: number;
  pairs: NumberPairAnalysis[];
  driverCompatibility: CompatibilityResult;
  conductorCompatibility: CompatibilityResult;
  breakdown: string;
}

export interface NumberPairAnalysis {
  pair: string;
  classification: string;
  interpretation: string;
}

export interface CompatibilityResult {
  status: "compatible" | "neutral" | "challenging";
  explanation: string;
}

const pairInterpretations: Record<string, { classification: string, interpretation: string }> = {
  "11": { classification: "Leadership", interpretation: "Double Sun energy. High authority, ego, and independence. Good for leadership." },
  "12": { classification: "Creation", interpretation: "Sun and Moon. Father and mother energy. Good for creative fields." },
  "13": { classification: "Action", interpretation: "Sun and Jupiter. Fast growth, dynamic action, but can bring sudden changes." },
  "14": { classification: "Movement", interpretation: "Sun and Rahu. Travel, dynamic energy, financial fluctuation." },
  "15": { classification: "Success", interpretation: "Sun and Mercury. Highly auspicious for business, communication, and intelligence." },
  "18": { classification: "Struggle", interpretation: "Sun and Saturn. Hard work, delays, father-son conflict energy." },
  "24": { classification: "Wealth", interpretation: "Moon and Rahu. Good for property, wealth, but emotional ups and downs." },
  "28": { classification: "Delay", interpretation: "Moon and Saturn. Delays, hard work, emotional suppression." },
  "33": { classification: "Master", interpretation: "Double Jupiter. Master teacher energy. Great for consulting, teaching." },
  "44": { classification: "Hard Work", interpretation: "Double Rahu. Need for structure. Hard work required. Can bring sudden events." },
  "55": { classification: "Change", interpretation: "Double Mercury. Fast-paced, business-minded, constant communication." },
  "66": { classification: "Luxury", interpretation: "Double Venus. Family, luxury, beauty, but can indicate indulgence." },
  "77": { classification: "Spiritual", interpretation: "Double Ketu. High intuition, spiritual depth, detachment from material." },
  "88": { classification: "Power", interpretation: "Double Saturn. Intense karmic lessons. High wealth or big struggles." },
  "99": { classification: "Completion", interpretation: "Double Mars. High energy, aggression, completion of cycles." },
};

// Extremely basic compatibility table for 1-9 (Driver/Conductor vs Root)
// This is a simplified representation of Chaldean numerology compatibilities.
const compatibilityMatrix: Record<number, Record<number, string>> = {
  1: { 1: "compatible", 2: "compatible", 3: "compatible", 4: "compatible", 5: "compatible", 6: "neutral", 7: "compatible", 8: "challenging", 9: "compatible" },
  2: { 1: "compatible", 2: "compatible", 3: "compatible", 4: "neutral", 5: "compatible", 6: "challenging", 7: "compatible", 8: "challenging", 9: "challenging" },
  3: { 1: "compatible", 2: "compatible", 3: "compatible", 4: "neutral", 5: "compatible", 6: "challenging", 7: "compatible", 8: "neutral", 9: "compatible" },
  4: { 1: "compatible", 2: "neutral", 3: "neutral", 4: "challenging", 5: "compatible", 6: "compatible", 7: "compatible", 8: "challenging", 9: "challenging" },
  5: { 1: "compatible", 2: "compatible", 3: "compatible", 4: "compatible", 5: "compatible", 6: "compatible", 7: "neutral", 8: "compatible", 9: "neutral" },
  6: { 1: "neutral", 2: "challenging", 3: "challenging", 4: "compatible", 5: "compatible", 6: "compatible", 7: "compatible", 8: "compatible", 9: "compatible" },
  7: { 1: "compatible", 2: "compatible", 3: "compatible", 4: "compatible", 5: "neutral", 6: "compatible", 7: "neutral", 8: "challenging", 9: "challenging" },
  8: { 1: "challenging", 2: "challenging", 3: "neutral", 4: "challenging", 5: "compatible", 6: "compatible", 7: "challenging", 8: "challenging", 9: "challenging" },
  9: { 1: "compatible", 2: "challenging", 3: "compatible", 4: "challenging", 5: "neutral", 6: "compatible", 7: "challenging", 8: "challenging", 9: "compatible" }
};

export class DigitalNumerologyEngine {
  
  static analyzeMobile(mobile: string, driver: number, conductor: number): MobileAnalysis {
    const cleaned = mobile.replace(/\D/g, '');
    let compoundNumber = 0;
    
    for (let i = 0; i < cleaned.length; i++) {
      compoundNumber += parseInt(cleaned[i], 10);
    }
    
    const rootNumber = NumerologyEngine.reduceNumber(compoundNumber);
    
    const pairs: NumberPairAnalysis[] = [];
    for (let i = 0; i < cleaned.length - 1; i++) {
      const pair = cleaned.substring(i, i + 2);
      if (pairInterpretations[pair] && !pairs.find(p => p.pair === pair)) {
         pairs.push({
           pair,
           classification: pairInterpretations[pair].classification,
           interpretation: pairInterpretations[pair].interpretation
         });
      }
    }
    
    const maskedNumber = cleaned.substring(0, 2) + "XXXXXX" + cleaned.substring(8);
    
    const dComp = this.getCompatibility(driver, rootNumber);
    const cComp = this.getCompatibility(conductor, rootNumber);

    return {
      maskedNumber,
      compoundNumber,
      rootNumber,
      pairs,
      driverCompatibility: {
        status: dComp as any,
        explanation: `Driver ${driver} and Root ${rootNumber} are ${dComp}.`
      },
      conductorCompatibility: {
        status: cComp as any,
        explanation: `Conductor ${conductor} and Root ${rootNumber} are ${cComp}.`
      },
      breakdown: `Sum of digits: ${cleaned.split('').join(' + ')} = ${compoundNumber} -> ${rootNumber}`
    };
  }

  static analyzeObjectNumber(objectNumber: string, driver: number, conductor: number) {
    const cleaned = objectNumber.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    let compoundNumber = 0;
    
    // Using Chaldean alphabet values for letters if any
    const chaldeanValues: Record<string, number> = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5, 'I': 1,
      'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8, 'Q': 1, 'R': 2,
      'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5, 'Y': 1, 'Z': 7
    };

    let breakdownParts = [];

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (/[0-9]/.test(char)) {
        compoundNumber += parseInt(char, 10);
        breakdownParts.push(char);
      } else if (chaldeanValues[char]) {
        compoundNumber += chaldeanValues[char];
        breakdownParts.push(`${char}(${chaldeanValues[char]})`);
      }
    }

    const rootNumber = NumerologyEngine.reduceNumber(compoundNumber);
    
    const dComp = this.getCompatibility(driver, rootNumber);
    const cComp = this.getCompatibility(conductor, rootNumber);

    return {
      compoundNumber,
      rootNumber,
      driverCompatibility: {
        status: dComp as any,
        explanation: `Driver ${driver} and Root ${rootNumber} are ${dComp}.`
      },
      conductorCompatibility: {
        status: cComp as any,
        explanation: `Conductor ${conductor} and Root ${rootNumber} are ${cComp}.`
      },
      breakdown: `Sum: ${breakdownParts.join(' + ')} = ${compoundNumber} -> ${rootNumber}`
    };
  }

  static getCompatibility(a: number, b: number): string {
    if (!a || !b || !compatibilityMatrix[a]) return "neutral";
    return compatibilityMatrix[a][b] || "neutral";
  }
}

export const angelNumbers = [
  { number: "111", title: "Alignment", category: "Spirituality", meaning: "Your thoughts are manifesting quickly. Keep them positive." },
  { number: "222", title: "Balance", category: "Peace", meaning: "Trust the process. You are exactly where you need to be." },
  { number: "333", title: "Support", category: "Guidance", meaning: "Ascended masters and spiritual guides are offering support." },
  { number: "444", title: "Protection", category: "Guidance", meaning: "You are surrounded by protective spiritual energy." },
  { number: "555", title: "Change", category: "Change", meaning: "Major life changes are coming. Embrace them." },
  { number: "777", title: "Luck", category: "Prosperity", meaning: "You are on the right spiritual path. Good fortune." },
  { number: "888", title: "Abundance", category: "Finance", meaning: "Financial and material abundance is on its way." },
  { number: "999", title: "Completion", category: "Reflection", meaning: "A cycle is ending. Prepare for a new beginning." },
  { number: "1111", title: "Awakening", category: "Spirituality", meaning: "A gateway of manifestation is open. Spiritual awakening." },
];

export const esotericCodes = [
  { code: "520", category: "Finance", traditionalAssociation: "Unexpected Money", practice: "Focus on abundance, not lack.", instructions: "Write in green ink or visualize." },
  { code: "741", category: "Peace", traditionalAssociation: "Problem Solving", practice: "Visualize dissolving obstacles.", instructions: "Chant or write on a piece of paper." },
  { code: "318 798", category: "Finance", traditionalAssociation: "Financial Independence", practice: "Focus on creating value.", instructions: "Keep in wallet." },
  { code: "8888", category: "Spirituality", traditionalAssociation: "Divine Protection", practice: "Feel enveloped in white light.", instructions: "Meditate upon this sequence." },
  { code: "1814321", category: "Health", traditionalAssociation: "Perfect Health Pattern", practice: "Traditional spiritual visualization for well-being. Not medical advice.", instructions: "Visualize over the body." },
];

export const switchNumbers = [
  { number: "1176", category: "Desire", association: "Manifestation", instructions: "Write on left body part or chant 28 times." },
  { number: "808", category: "Finance", association: "Debt Free / Money", instructions: "Keep written in workspace or wallet." },
  { number: "517", category: "Focus", association: "Confidence & Clarity", instructions: "Chant before exams or meetings." },
  { number: "45", category: "Peace", association: "Reduce Anxiety", instructions: "Visualize the number in blue light." }
];

export const yantraNumbers = [
  { name: "Kubera Yantra Grid", numbers: "27, 20, 25 | 22, 24, 26 | 23, 28, 21", association: "Wealth & Prosperity", purpose: "Traditional grid where all rows/columns sum to 72 (7+2=9).", source: "Traditional Vedic Numerology" },
  { name: "Surya Yantra Grid", numbers: "6, 1, 8 | 7, 5, 3 | 2, 9, 4", association: "Health & Authority", purpose: "Sun magic square. All rows/columns sum to 15 (1+5=6).", source: "Traditional Vedic Numerology" },
];
