import { BirthProfile, PanchatattvaResult, PanchatattvaIndicator, PanchatattvaElementDetail } from '../../types/kundli';
import { AstronomyService } from '../astronomy/astronomyService';
import { NumerologyEngine } from '../numerology/numerologyEngine';
import { LoShuEngine } from '../numerology/loShuEngine';

export type ElementIndicator = PanchatattvaIndicator;
export type { PanchatattvaResult };

export interface ProblemAreaResult {
  category: string;
  indicators: string[];
  sourceSystems: string[];
  traditionalInterpretation: string;
  timing: string;
  confidenceLabel: 'Few indicators' | 'Multiple indicators' | 'Strong traditional indicators';
  explanation: string;
}

export interface FinancialResult {
  wealthIndicators: string[];
  incomeIndicators: string[];
  careerIncomeIndicators: string[];
  businessIndicators: string[];
  expensesIndicators: string[];
  timing: string;
  explanation: string;
}

export class IntelligenceEngine {
  static getPanchatattva(profile: BirthProfile): PanchatattvaResult {
    const indicators: ElementIndicator[] = [];
    
    // 1. Numerology (Vedic)
    const numData = NumerologyEngine.evaluate(profile);
    const mapNumToElement = (num: number, source: string) => {
      switch (num) {
        case 1: indicators.push({ source, rule: `Number 1 (Sun)`, element: 'Fire', weight: 2 }); break;
        case 2: indicators.push({ source, rule: `Number 2 (Moon)`, element: 'Water', weight: 2 }); break;
        case 3: indicators.push({ source, rule: `Number 3 (Jupiter)`, element: 'Ether', weight: 2 }); break;
        case 4: indicators.push({ source, rule: `Number 4 (Rahu)`, element: 'Air', weight: 1 }); break;
        case 5: indicators.push({ source, rule: `Number 5 (Mercury)`, element: 'Earth', weight: 2 }); break;
        case 6: indicators.push({ source, rule: `Number 6 (Venus)`, element: 'Water', weight: 2 }); break;
        case 7: indicators.push({ source, rule: `Number 7 (Ketu)`, element: 'Ether', weight: 1 }); break;
        case 8: indicators.push({ source, rule: `Number 8 (Saturn)`, element: 'Air', weight: 2 }); break;
        case 9: indicators.push({ source, rule: `Number 9 (Mars)`, element: 'Fire', weight: 2 }); break;
      }
    };
    
    mapNumToElement(numData.birthNumber, 'Numerology (Mulank)');
    mapNumToElement(numData.destinyNumber, 'Numerology (Bhagyank)');
    
    // 2. Astrology (Basic planets if available - let's calculate rough ascendant if we can, or just use Sun/Moon sign)
    // For now we use the birth date to get Sun sign approx
    const d = new Date(profile.dob);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    // Approximate Western Sun Sign for elements
    let sunSign = '';
    let element: 'Earth'|'Water'|'Fire'|'Air'|'Ether' = 'Fire';
    if ((m===3 && day>=21) || (m===4 && day<=19)) { sunSign = 'Aries'; element = 'Fire'; }
    else if ((m===4 && day>=20) || (m===5 && day<=20)) { sunSign = 'Taurus'; element = 'Earth'; }
    else if ((m===5 && day>=21) || (m===6 && day<=20)) { sunSign = 'Gemini'; element = 'Air'; }
    else if ((m===6 && day>=21) || (m===7 && day<=22)) { sunSign = 'Cancer'; element = 'Water'; }
    else if ((m===7 && day>=23) || (m===8 && day<=22)) { sunSign = 'Leo'; element = 'Fire'; }
    else if ((m===8 && day>=23) || (m===9 && day<=22)) { sunSign = 'Virgo'; element = 'Earth'; }
    else if ((m===9 && day>=23) || (m===10 && day<=22)) { sunSign = 'Libra'; element = 'Air'; }
    else if ((m===10 && day>=23) || (m===11 && day<=21)) { sunSign = 'Scorpio'; element = 'Water'; }
    else if ((m===11 && day>=22) || (m===12 && day<=21)) { sunSign = 'Sagittarius'; element = 'Fire'; }
    else if ((m===12 && day>=22) || (m===1 && day<=19)) { sunSign = 'Capricorn'; element = 'Earth'; }
    else if ((m===1 && day>=20) || (m===2 && day<=18)) { sunSign = 'Aquarius'; element = 'Air'; }
    else if ((m===2 && day>=19) || (m===3 && day<=20)) { sunSign = 'Pisces'; element = 'Water'; }
    
    indicators.push({ source: 'Astrology (Sun Sign Approx)', rule: `Sun in ${sunSign}`, element, weight: 3 });
    
    // Calculate totals
    const result: PanchatattvaResult = {
      earth: { score: 0, percentage: 0, relativePercentage: 0, indicators: [] },
      water: { score: 0, percentage: 0, relativePercentage: 0, indicators: [] },
      fire: { score: 0, percentage: 0, relativePercentage: 0, indicators: [] },
      air: { score: 0, percentage: 0, relativePercentage: 0, indicators: [] },
      ether: { score: 0, percentage: 0, relativePercentage: 0, indicators: [] },
      totalScore: 0,
      dominant: '',
      weakest: '',
      calculationTimestamp: new Date().toISOString(),
      source: 'MasterKundliData'
    };
    
    indicators.forEach(ind => {
      const el = ind.element.toLowerCase() as 'earth' | 'water' | 'fire' | 'air' | 'ether';
      if (result[el]) {
        result[el].score += ind.weight;
        result[el].indicators.push(ind);
      }
    });

    const totalScore = result.earth.score + result.water.score + result.fire.score + result.air.score + result.ether.score;
    result.totalScore = totalScore;

    const maxScore = Math.max(result.earth.score, result.water.score, result.fire.score, result.air.score, result.ether.score, 1);

    const elements: ('earth' | 'water' | 'fire' | 'air' | 'ether')[] = ['earth', 'water', 'fire', 'air', 'ether'];
    elements.forEach(el => {
      result[el].percentage = totalScore > 0 ? Number(((result[el].score / totalScore) * 100).toFixed(1)) : 0;
      result[el].relativePercentage = maxScore > 0 ? Math.round((result[el].score / maxScore) * 100) : 0;
    });
    
    // Canonical tie-break hierarchy for absolute determinism:
    // ether (1) -> air (2) -> fire (3) -> water (4) -> earth (5)
    const tieBreakOrder: Record<string, number> = { ether: 1, air: 2, fire: 3, water: 4, earth: 5 };
    const sorted = [...elements].sort((a, b) => {
      const diff = result[b].score - result[a].score;
      if (diff !== 0) return diff;
      return (tieBreakOrder[a] || 0) - (tieBreakOrder[b] || 0);
    });
    
    result.dominant = sorted[0].charAt(0).toUpperCase() + sorted[0].slice(1);
    result.weakest = sorted[4].charAt(0).toUpperCase() + sorted[4].slice(1);
    
    return result;
  }
  
  static getProblemAreas(profile: BirthProfile): ProblemAreaResult[] {
     const numData = NumerologyEngine.evaluate(profile);
     const loshu = LoShuEngine.evaluate(profile);
     
     const areas: ProblemAreaResult[] = [];
     
     // CAREER
     
     // CAREER
     const careerInds = [];
     const careerSys = [];
     if (loshu.grid[1] && loshu.grid[1].count === 0) {
         careerInds.push('Missing Number 1 in Lo Shu Grid (Career/Communication)');
         careerSys.push('Lo Shu Grid');
     }
     if (numData.destinyNumber === 4 || numData.destinyNumber === 8) {
         careerInds.push(`Destiny Number ${numData.destinyNumber} indicates hard work and delays in stability.`);
         careerSys.push('Numerology');
     }
     
     // FINANCE
     const finInds = [];
     const finSys = [];
     if (loshu.grid[8] && loshu.grid[8].count === 0) {
         finInds.push('Missing Number 8 in Lo Shu Grid (Wealth/Abundance)');
         finSys.push('Lo Shu Grid');
     }
     if (numData.birthNumber === 4 || numData.birthNumber === 8) {
         finInds.push(`Birth Number ${numData.birthNumber} can bring sudden fluctuations in wealth.`);
         finSys.push('Numerology');
     }

     // RELATIONSHIP & MARRIAGE
     const relInds = [];
     const relSys = [];
     if (loshu.grid[2] && loshu.grid[2].count === 0) {
         relInds.push('Missing Number 2 in Lo Shu Grid (Marriage/Relationships)');
         relSys.push('Lo Shu Grid');
     }
     if (loshu.grid[6] && loshu.grid[6].count > 2) {
         relInds.push('Excess Number 6 suggests over-attachment or family friction.');
         relSys.push('Lo Shu Grid');
     }
     if (numData.birthNumber === 7 || numData.destinyNumber === 7) {
         relInds.push(`Number 7 suggests detachment, spiritual focus over material relationships.`);
         relSys.push('Numerology');
     }

     // BUSINESS
     const busInds = [];
     const busSys = [];
     if (loshu.grid[5] && loshu.grid[5].count === 0) {
         busInds.push('Missing Number 5 (Core stability/Business).');
         busSys.push('Lo Shu Grid');
     }

     // EDUCATION
     const eduInds = [];
     const eduSys = [];
     if (loshu.grid[3] && loshu.grid[3].count === 0) {
         eduInds.push('Missing Number 3 (Jupiter/Wisdom).');
         eduSys.push('Lo Shu Grid');
     }

     // PROPERTY
     const propInds = [];
     const propSys = [];
     if (loshu.grid[8] && loshu.grid[8].count === 0 && loshu.grid[2] && loshu.grid[2].count === 0) {
         propInds.push('Missing Earth elements (2, 8) can delay property acquisition.');
         propSys.push('Lo Shu Grid');
     }

     // FAMILY
     const famInds = [];
     const famSys = [];
     if (loshu.grid[3] && loshu.grid[3].count === 0) {
         famInds.push('Missing Number 3 (Family/Elders support).');
         famSys.push('Lo Shu Grid');
     }

     // TIMING
     const timeInds = [];
     const timeSys = [];
     if (numData.personalYear === 4 || numData.personalYear === 8) {
         timeInds.push(`Personal Year ${numData.personalYear} suggests structural challenges or hard work.`);
         timeSys.push('Numerology (Timing)');
     }
     if (numData.personalYear === 9) {
         timeInds.push(`Personal Year 9 indicates completion, high expenses or clearing debts.`);
         timeSys.push('Numerology (Timing)');
     }

     // SPIRITUALITY
     const spirInds = [];
     const spirSys = [];
     if (loshu.grid[7] && loshu.grid[7].count === 0) {
         spirInds.push('Missing Number 7 (Ketu/Spirituality) indicates highly material focus.');
         spirSys.push('Lo Shu Grid');
     }

     const buildArea = (cat: string, inds: string[], sys: string[], interp: string, expl: string): ProblemAreaResult => {
         let conf = 'Few indicators';
         if (inds.length > 1) conf = 'Multiple indicators';
         if (inds.length > 2) conf = 'Strong traditional indicators';
         if (inds.length === 0) {
             inds.push('No severe traditional afflictions found.');
             sys.push('Basic Numerology');
         }
         return {
             category: cat,
             indicators: inds,
             sourceSystems: [...new Set(sys)] as string[],
             traditionalInterpretation: interp,
             timing: `Current Personal Year: ${numData.personalYear}`,
             confidenceLabel: conf as any,
             explanation: expl
         };
     };

     areas.push(buildArea('Career', careerInds, careerSys, 'Potential obstacles or required hard work in career progression.', 'This indicates a period or inherent trait requiring structured effort.'));
     areas.push(buildArea('Finance', finInds, finSys, 'Potential financial fluctuations or unexpected expenses.', 'Traditional texts advise caution with investments.'));
     areas.push(buildArea('Business', busInds, busSys, 'Business stability might require extra effort to maintain.', 'Lack of core stability element implies need for strong planning.'));
     areas.push(buildArea('Relationship', relInds, relSys, 'Possible misunderstandings or emotional detachment.', 'Focus on clear communication and emotional grounding.'));
     areas.push(buildArea('Marriage', [...relInds], [...relSys], 'Similar to relationships, requires patience and understanding.', 'Traditional systems look at 2 and 6 for marriage harmony.'));
     areas.push(buildArea('Education', eduInds, eduSys, 'Requires focused effort for higher studies.', 'Wisdom numbers are crucial for academic success.'));
     areas.push(buildArea('Property', propInds, propSys, 'Delays in property acquisition or land disputes.', 'Earth elements govern physical assets and real estate.'));
     areas.push(buildArea('Family', famInds, famSys, 'Need for conscious effort in maintaining family ties.', 'Focus on elders and extended family relationships.'));
     areas.push(buildArea('Timing', timeInds, timeSys, 'Current period indicates significant transition or hard work.', 'Personal years 4, 8, and 9 are traditionally restrictive or transitional.'));
     areas.push(buildArea('Spirituality', spirInds, spirSys, 'Highly material focus, potential disconnect from intuition.', 'Consider developing a meditation or spiritual practice.'));

     return areas;
  }
  
  static getFinancialIntelligence(profile: BirthProfile): FinancialResult {
     const numData = NumerologyEngine.evaluate(profile);
     const loshu = LoShuEngine.evaluate(profile);
     
     const wealth = [];
     const income = [];
     const career = [];
     const business = [];
     const expenses = [];
     
     // Simple Rules
     if (loshu.grid[8] && loshu.grid[8].count > 0) {
         wealth.push('Presence of 8 in Lo Shu: Strong indicator for wealth accumulation over time.');
     } else {
         wealth.push('Missing 8 in Lo Shu: Wealth requires highly structured effort, avoid risky investments.');
     }
     
     if (numData.birthNumber === 6 || numData.destinyNumber === 6) {
         income.push('Venus influence (6): Propensity for luxury and consistent income streams.');
     }
     if (numData.birthNumber === 1 || numData.destinyNumber === 1) {
         career.push('Sun influence (1): Strong leadership potential, income from authoritative roles.');
     }
     
     if (loshu.grid[5] && loshu.grid[5].count > 0) {
         business.push('Presence of 5: Good balance, highly favorable for business stability.');
     }
     if (loshu.grid[6] && loshu.grid[6].count > 0) {
         business.push('Presence of 6: Favorable for luxury, creative, or hospitality businesses.');
     }
     
     if (numData.personalYear === 9) {
         expenses.push('Personal Year 9: High expenses expected. Avoid taking new major loans.');
     } else if (numData.personalYear === 4) {
         expenses.push('Personal Year 4: Restrictive cash flow. Save carefully.');
     } else {
         expenses.push('General: Avoid unnecessary luxury expenses, focus on structured savings.');
     }
     
     return {
       wealthIndicators: wealth.length > 0 ? wealth : ['Standard wealth accumulation path.'],
       incomeIndicators: income.length > 0 ? income : ['Income through sustained effort.'],
       careerIncomeIndicators: career.length > 0 ? career : ['Consistent career progression recommended.'],
       businessIndicators: business.length > 0 ? business : ['Consult professional advice before large business risks.'],
       expensesIndicators: expenses,
       timing: `Current Personal Year: ${numData.personalYear}`,
       explanation: 'This analysis is based on traditional numerological indicators. It does not constitute professional financial advice. Always consult a financial advisor for actual investments.'
     };
  }
}
