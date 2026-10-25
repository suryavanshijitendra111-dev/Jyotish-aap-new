import { MasterKundliData } from '../../../types/kundli';
import { LordshipCalculator } from './lordship';

export class FunctionalNatureCalculator {
  static calculate(data: MasterKundliData): Record<string, 'Benefic' | 'Malefic' | 'Neutral'> {
    const result: Record<string, 'Benefic' | 'Malefic' | 'Neutral'> = {};
    const planets = Object.keys(data.planets);

    // Initialize all to Neutral
    planets.forEach(p => result[p] = 'Neutral');

    const lagnaLord = data.d1Chart[1].signLord;
    
    // Trikona lords are benefics (1, 5, 9)
    const trineLords = [
      data.d1Chart[1].signLord,
      data.d1Chart[5].signLord,
      data.d1Chart[9].signLord
    ];

    // Trishadaya lords are malefics (3, 6, 11)
    const maleficLords = [
      data.d1Chart[3].signLord,
      data.d1Chart[6].signLord,
      data.d1Chart[11].signLord
    ];

    planets.forEach(p => {
      // Lagna lord is prime benefic
      if (p === lagnaLord) {
        result[p] = 'Benefic';
        return;
      }
      
      const isTrineLord = trineLords.includes(p);
      const isMaleficLord = maleficLords.includes(p);

      if (isTrineLord && !isMaleficLord) {
        result[p] = 'Benefic';
      } else if (isMaleficLord && !isTrineLord) {
        result[p] = 'Malefic';
      } else if (isTrineLord && isMaleficLord) {
        // Lord of a trine and a malefic house (e.g., Mars for Leo ascendant lords 4 & 9)
        // actually 4 is not malefic. But e.g. Saturn for Taurus ascendant lords 9 & 10 (Yogakaraka - Benefic)
        // Jupiter for Aries lords 9 & 12 (Benefic)
        // We consider trine lordship usually overrides, making it benefic or at least neutral.
        result[p] = 'Benefic'; // Simple override
      } else {
        result[p] = 'Neutral'; // Kendras (4,7,10) and 2,8,12
      }
    });

    // Nodes take nature of their dispositor or conjunct planets (simplified to neutral for now)
    result['Rahu'] = 'Neutral';
    result['Ketu'] = 'Neutral';

    return result;
  }
}
