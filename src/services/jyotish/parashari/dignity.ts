import { MasterKundliData } from '../../../types/kundli';
import { SIGN_LORDS } from './lordship';

export const NATURAL_FRIENDSHIPS: Record<string, { friends: string[], enemies: string[], neutrals: string[] }> = {
  'Sun': { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn', 'Rahu', 'Ketu'], neutrals: ['Mercury'] },
  'Moon': { friends: ['Sun', 'Mercury'], enemies: ['Rahu', 'Ketu'], neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'] },
  'Mars': { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury', 'Rahu'], neutrals: ['Venus', 'Saturn', 'Ketu'] },
  'Mercury': { friends: ['Sun', 'Venus', 'Rahu'], enemies: ['Moon'], neutrals: ['Mars', 'Jupiter', 'Saturn', 'Ketu'] },
  'Jupiter': { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'], neutrals: ['Saturn', 'Rahu', 'Ketu'] },
  'Venus': { friends: ['Mercury', 'Saturn', 'Rahu'], enemies: ['Sun', 'Moon'], neutrals: ['Mars', 'Jupiter', 'Ketu'] },
  'Saturn': { friends: ['Mercury', 'Venus', 'Rahu'], enemies: ['Sun', 'Moon', 'Mars', 'Ketu'], neutrals: ['Jupiter'] },
  'Rahu': { friends: ['Mercury', 'Venus', 'Saturn'], enemies: ['Sun', 'Moon', 'Mars'], neutrals: ['Jupiter', 'Ketu'] },
  'Ketu': { friends: ['Venus', 'Mars'], enemies: ['Sun', 'Moon', 'Saturn'], neutrals: ['Mercury', 'Jupiter', 'Rahu'] }
};

export const DIGNITY_RULES: Record<string, { exalt: number, deb: number, own: number[] }> = {
  'Sun': { exalt: 1, deb: 7, own: [5] },
  'Moon': { exalt: 2, deb: 8, own: [4] },
  'Mars': { exalt: 10, deb: 4, own: [1, 8] },
  'Mercury': { exalt: 6, deb: 12, own: [3, 6] },
  'Jupiter': { exalt: 4, deb: 10, own: [9, 12] },
  'Venus': { exalt: 12, deb: 6, own: [2, 7] },
  'Saturn': { exalt: 7, deb: 1, own: [10, 11] },
  'Rahu': { exalt: 3, deb: 9, own: [] },
  'Ketu': { exalt: 9, deb: 3, own: [] }
};

export class DignityCalculator {
  static getDignity(planet: string, sign: number): string {
    const rules = DIGNITY_RULES[planet];
    if (!rules) return 'Neutral';

    if (rules.exalt === sign) return 'Exalted';
    if (rules.deb === sign) return 'Debilitated';
    if (rules.own.includes(sign)) return 'OwnSign';

    // Dispositor friendship
    const dispositor = SIGN_LORDS[sign];
    if (!dispositor) return 'Neutral';
    if (dispositor === planet) return 'OwnSign';

    const friendships = NATURAL_FRIENDSHIPS[planet];
    if (friendships) {
      if (friendships.friends.includes(dispositor)) return 'Friendly';
      if (friendships.enemies.includes(dispositor)) return 'Enemy';
      if (friendships.neutrals.includes(dispositor)) return 'Neutral';
    }

    return 'Neutral';
  }

  static calculateAll(data: MasterKundliData): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [planetName, pData] of Object.entries(data.planets)) {
      result[planetName] = this.getDignity(planetName, pData.rashi);
    }
    return result;
  }
}
