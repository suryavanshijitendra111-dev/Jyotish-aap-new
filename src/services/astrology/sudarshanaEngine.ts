import { MasterKundliData } from '../../types/kundli';

export interface SudarshanaPoint {
  house: number;
  rashi: number;
  planets: string[];
}

export interface SudarshanaData {
  lagnaChakra: SudarshanaPoint[];
  moonChakra: SudarshanaPoint[];
  suryaChakra: SudarshanaPoint[];
  currentDashaYear: number;
  activeHouse: number; // 1-12
  analysis: string;
}

export class SudarshanaEngine {
  static calculate(data: MasterKundliData): SudarshanaData {
    const lagnaRashi = data.lagna.rashi;
    const moonRashi = data.planets['Moon'].rashi;
    const suryaRashi = data.planets['Sun'].rashi;

    const getChakra = (startRashi: number) => {
      const houses: SudarshanaPoint[] = [];
      for (let h = 1; h <= 12; h++) {
        const rashi = ((startRashi + h - 2) % 12) + 1;
        const planetsInRashi = Object.entries(data.planets)
          .filter(([_, p]) => p.rashi === rashi)
          .map(([name, _]) => name);
        
        houses.push({
          house: h,
          rashi,
          planets: planetsInRashi
        });
      }
      return houses;
    };

    // Calculate current age for Sudarshana Dasha
    const dob = new Date(data.birthProfile.dob);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    const currentYear = age + 1;
    const activeHouse = ((currentYear - 1) % 12) + 1;

    // Analysis for the active house across all 3 chakras
    const lagnaActive = getChakra(lagnaRashi)[activeHouse - 1];
    const moonActive = getChakra(moonRashi)[activeHouse - 1];
    const suryaActive = getChakra(suryaRashi)[activeHouse - 1];

    const analysis = this.generateAnalysis(currentYear, activeHouse, lagnaActive, moonActive, suryaActive);

    return {
      lagnaChakra: getChakra(lagnaRashi),
      moonChakra: getChakra(moonRashi),
      suryaChakra: getChakra(suryaRashi),
      currentDashaYear: currentYear,
      activeHouse,
      analysis
    };
  }

  private static generateAnalysis(year: number, house: number, l: SudarshanaPoint, m: SudarshanaPoint, s: SudarshanaPoint): string {
    const allPlanets = [...new Set([...l.planets, ...m.planets, ...s.planets])];
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'];

    const activeBenefics = allPlanets.filter(p => benefics.includes(p));
    const activeMalefics = allPlanets.filter(p => malefics.includes(p));

    let summary = `Currently in Year ${year}, the Sudarshana Dasha activates House ${house} across all three charts. `;
    
    if (activeBenefics.length > activeMalefics.length) {
      summary += "This year promises prosperity, mental peace, and success due to the dominance of benefic influences in the active sectors.";
    } else if (activeMalefics.length > activeBenefics.length) {
      summary += "This year may bring challenges, structural changes, and intense effort as malefic forces dominate the triple-chakra focal point.";
    } else {
      summary += "The year presents a balanced mix of opportunities and challenges, requiring a steady mind and disciplined approach.";
    }

    if (activeBenefics.includes('Jupiter')) summary += " Jupiter's influence suggests spiritual growth or expansion.";
    if (activeMalefics.includes('Saturn')) summary += " Saturn's presence indicates delays but long-term gains through hard work.";

    return summary;
  }
}
