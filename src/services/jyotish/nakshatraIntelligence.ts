import { MasterKundliData } from '../../types/kundli';

export interface NakshatraIntel {
  number: number;
  name: string;
  lord: string;
  deity: string;
  symbol: string;
  gana: string;
  nadi: string;
}

export const NAKSHATRA_DB: NakshatraIntel[] = [
  { number: 1, name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse Head', gana: 'Deva', nadi: 'Adi' },
  { number: 2, name: 'Bharani', lord: 'Venus', deity: 'Yama', symbol: 'Yoni', gana: 'Manushya', nadi: 'Madhya' },
  { number: 3, name: 'Krittika', lord: 'Sun', deity: 'Agni', symbol: 'Razor/Axe', gana: 'Rakshasa', nadi: 'Antya' },
  { number: 4, name: 'Rohini', lord: 'Moon', deity: 'Brahma', symbol: 'Chariot', gana: 'Manushya', nadi: 'Antya' },
  { number: 5, name: 'Mrigashira', lord: 'Mars', deity: 'Soma', symbol: 'Deer Head', gana: 'Deva', nadi: 'Madhya' },
  { number: 6, name: 'Ardra', lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop', gana: 'Manushya', nadi: 'Adi' },
  { number: 7, name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', symbol: 'Quiver', gana: 'Deva', nadi: 'Adi' },
  { number: 8, name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', symbol: 'Udder/Lotus', gana: 'Deva', nadi: 'Madhya' },
  { number: 9, name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas', symbol: 'Coiled Serpent', gana: 'Rakshasa', nadi: 'Antya' },
  { number: 10, name: 'Magha', lord: 'Ketu', deity: 'Pitris', symbol: 'Royal Throne', gana: 'Rakshasa', nadi: 'Antya' },
  { number: 11, name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', symbol: 'Front Legs of Bed', gana: 'Manushya', nadi: 'Madhya' },
  { number: 12, name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', symbol: 'Back Legs of Bed', gana: 'Manushya', nadi: 'Adi' },
  { number: 13, name: 'Hasta', lord: 'Moon', deity: 'Savitar', symbol: 'Hand', gana: 'Deva', nadi: 'Adi' },
  { number: 14, name: 'Chitra', lord: 'Mars', deity: 'Vishvakarma', symbol: 'Pearl/Gem', gana: 'Rakshasa', nadi: 'Madhya' },
  { number: 15, name: 'Swati', lord: 'Rahu', deity: 'Vayu', symbol: 'Young Shoot', gana: 'Deva', nadi: 'Antya' },
  { number: 16, name: 'Vishakha', lord: 'Jupiter', deity: 'Indra/Agni', symbol: 'Triumphal Arch', gana: 'Rakshasa', nadi: 'Antya' },
  { number: 17, name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', symbol: 'Lotus', gana: 'Deva', nadi: 'Madhya' },
  { number: 18, name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', symbol: 'Earring/Umbrella', gana: 'Rakshasa', nadi: 'Adi' },
  { number: 19, name: 'Mula', lord: 'Ketu', deity: 'Nirriti', symbol: 'Tied Roots', gana: 'Rakshasa', nadi: 'Adi' },
  { number: 20, name: 'Purva Ashadha', lord: 'Venus', deity: 'Apah', symbol: 'Winnowing Basket', gana: 'Manushya', nadi: 'Madhya' },
  { number: 21, name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishwadevas', symbol: 'Elephant Tusk', gana: 'Manushya', nadi: 'Antya' },
  { number: 22, name: 'Shravana', lord: 'Moon', deity: 'Vishnu', symbol: 'Ear', gana: 'Deva', nadi: 'Antya' },
  { number: 23, name: 'Dhanishta', lord: 'Mars', deity: 'Vasus', symbol: 'Drum/Flute', gana: 'Rakshasa', nadi: 'Madhya' },
  { number: 24, name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', symbol: 'Empty Circle', gana: 'Rakshasa', nadi: 'Adi' },
  { number: 25, name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Front of Funeral Cot', gana: 'Manushya', nadi: 'Adi' },
  { number: 26, name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahir Budhyana', symbol: 'Back of Funeral Cot', gana: 'Manushya', nadi: 'Madhya' },
  { number: 27, name: 'Revati', lord: 'Mercury', deity: 'Pushan', symbol: 'Fish', gana: 'Deva', nadi: 'Antya' }
];

export class NakshatraIntelligenceEngine {
  static evaluate(data: MasterKundliData) {
    const planetNakshatras: Record<string, NakshatraIntel & { pada: number }> = {};
    const validPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    
    for (const p of validPlanets) {
      const pd = data.planets[p];
      if (pd && pd.siderealLongitude != null) {
        const nakIndex = Math.floor(pd.siderealLongitude / (10 / 3) / 4); // 0 to 26
        const pada = Math.floor((pd.siderealLongitude % (13 + 1/3)) / (3 + 1/3)) + 1;
        const intel = NAKSHATRA_DB[nakIndex];
        if (intel) {
          planetNakshatras[p] = { ...intel, pada };
        }
      }
    }
    return { status: 'AVAILABLE', planetNakshatras };
  }
}
