import { MasterKundliData } from '../../../types/kundli';

export const SIGN_LORDS: Record<number, string> = {
  1: 'Mars',     // Aries
  2: 'Venus',    // Taurus
  3: 'Mercury',  // Gemini
  4: 'Moon',     // Cancer
  5: 'Sun',      // Leo
  6: 'Mercury',  // Virgo
  7: 'Venus',    // Libra
  8: 'Mars',     // Scorpio
  9: 'Jupiter',  // Sagittarius
  10: 'Saturn',  // Capricorn
  11: 'Saturn',  // Aquarius
  12: 'Jupiter'  // Pisces
};

export class LordshipCalculator {
  static getHouseLord(sign: number): string {
    return SIGN_LORDS[sign] || 'Unknown';
  }

  static getLordPlacement(data: MasterKundliData, houseNumber: number): { house: number, sign: number } | null {
    const house = data.d1Chart[houseNumber];
    if (!house) return null;
    
    const lordName = SIGN_LORDS[house.rashi];
    const lordPlanet = data.planets[lordName];
    
    if (!lordPlanet) return null; // Nodes don't have signs usually
    
    return {
      house: lordPlanet.d1House,
      sign: lordPlanet.rashi
    };
  }
}
