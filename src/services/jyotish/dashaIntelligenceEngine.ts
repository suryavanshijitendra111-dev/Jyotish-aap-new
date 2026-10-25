import { MasterKundliData } from '../../types/kundli';
import { RuleEngine } from '../../types/systemRegistry';
import { DateTime } from 'luxon';

export interface DashaIntelResult {
  status: 'AVAILABLE' | 'NOT_AVAILABLE';
  currentMahadasha: string | null;
  currentAntardasha: string | null;
  mahadashaLordDignity: string | null;
  antardashaLordDignity: string | null;
  mahadashaLordHouse: number | null;
  antardashaLordHouse: number | null;
  analysisMessage: string | null;
}

export class DashaIntelligenceEngine implements RuleEngine<DashaIntelResult> {
  evaluate(data: MasterKundliData): DashaIntelResult {
    if (!data.vimshottariDasha) {
      return {
        status: 'NOT_AVAILABLE',
        currentMahadasha: null,
        currentAntardasha: null,
        mahadashaLordDignity: null,
        antardashaLordDignity: null,
        mahadashaLordHouse: null,
        antardashaLordHouse: null,
        analysisMessage: 'Vimshottari Dasha data is not available.'
      };
    }

    const md = data.vimshottariDasha.currentMahadasha?.planet || null;
    const ad = data.vimshottariDasha.currentAntardasha?.planet || null;

    let mdDignity = null;
    let mdHouse = null;
    if (md && data.planets[md]) {
      mdDignity = data.planets[md].dignity || 'None';
      mdHouse = data.planets[md].d1House || null;
    }

    let adDignity = null;
    let adHouse = null;
    if (ad && data.planets[ad]) {
      adDignity = data.planets[ad].dignity || 'None';
      adHouse = data.planets[ad].d1House || null;
    }

    return {
      status: 'AVAILABLE',
      currentMahadasha: md,
      currentAntardasha: ad,
      mahadashaLordDignity: mdDignity,
      antardashaLordDignity: adDignity,
      mahadashaLordHouse: mdHouse,
      antardashaLordHouse: adHouse,
      analysisMessage: `Currently running ${md} Mahadasha and ${ad} Antardasha.`
    };
  }
}
