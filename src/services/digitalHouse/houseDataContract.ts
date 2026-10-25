/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChamberDefinition, ChamberId, HousePortal } from '../../types/digitalHouse';
import { MasterKundliData } from '../../types/kundli';
import { LanguageCode } from '../../i18n';
import { getLocalizedPlanet, getLocalizedRashi, getLocalizedNakshatra, getLocalizedDignity } from '../../i18n/astrology';
import { PlanetSpeaksService } from '../astrology/planetSpeaksService';

export interface HouseWing {
  id: 'north_wing' | 'east_wing' | 'south_wing' | 'west_wing' | 'central';
  sanskritName: string;
  hindiName: string;
  englishName: string;
  chambers: ChamberId[];
}

export const HOUSE_WINGS: HouseWing[] = [
  {
    id: 'north_wing',
    sanskritName: 'उत्तर प्रांगण (Uttara Khand)',
    hindiName: 'उत्तर खंड (आत्म, धन एवं मोक्ष संकुल)',
    englishName: 'North Wing (Self, Lineage & Transcendence)',
    chambers: ['chamber_1', 'chamber_2', 'chamber_12', 'guardian_sanctum']
  },
  {
    id: 'east_wing',
    sanskritName: 'पूर्व प्रांगण (Purva Khand)',
    hindiName: 'पूर्व खंड (पराक्रम, सुख एवं बुद्धि संकुल)',
    englishName: 'East Wing (Courage, Sanctuary & Wisdom)',
    chambers: ['chamber_3', 'chamber_4', 'chamber_5']
  },
  {
    id: 'south_wing',
    sanskritName: 'दक्षिण प्रांगण (Dakshina Khand)',
    hindiName: 'दक्षिण खंड (आरोग्य, दांपत्य एवं रहस्य संकुल)',
    englishName: 'South Wing (Health, Partnership & Evidence Ledger)',
    chambers: ['chamber_6', 'chamber_7', 'chamber_8']
  },
  {
    id: 'west_wing',
    sanskritName: 'पश्चिम प्रांगण (Pashchima Khand)',
    hindiName: 'पश्चिम खंड (धर्म, कर्म एवं लाभ संकुल)',
    englishName: 'West Wing (Fortune, Career & Gains)',
    chambers: ['chamber_9', 'chamber_10', 'chamber_11']
  }
];

/**
 * 12 Astrological Bhavas + Brahma Sthan Courtyard + Guardian Sanctum.
 * Pure Read-Only Data Contract mapping the 3D Digital House to existing JeevanDarpan modules.
 */
export const CHAMBER_DEFINITIONS: ChamberDefinition[] = [
  {
    id: 'courtyard',
    wingId: 'central',
    wingName: 'Central Open Courtyard (Brahm Sthan)',
    wingNameHindi: 'ब्रह्म स्थान (खुला केंद्रीय आँगन)',
    sanskritName: 'Brahma Sthan',
    englishTitle: 'Central Courtyard & Jeevan Pragya',
    hindiTitle: 'ब्रह्म स्थान एवं जीवन प्रज्ञा',
    signification: 'The sacred heart of the Digital Life House. Contains the cosmic astrolabe, daily report, companion guidance, and spiritual morning routine.',
    targetView: 'daily_companion',
    cameraPosition: [0, 8, 14],
    cameraTarget: [0, 1.5, 0],
    color: '#d4af37',
    iconName: 'Sparkles',
    subModules: [
      { title: 'दैनिक साथी (Daily Companion)', view: 'daily_companion' },
      { title: 'प्रातः संस्कार (Pratah Sanskar)', view: 'pratah_sanskar' },
      { title: 'दैनिक रिपोर्ट कार्ड (Daily Report Card)', view: 'daily_report_card' },
      { title: 'मास्टर प्रोफाइल (Master Profile)', view: 'profile' }
    ]
  },
  {
    id: 'chamber_1',
    houseNumber: 1,
    wingId: 'north_wing',
    wingName: 'North Wing (Self & Vitality)',
    wingNameHindi: 'उत्तर खंड (आत्म व लग्न कक्ष)',
    sanskritName: 'Tanu Bhava (तनू भाव)',
    englishTitle: 'Chamber of Lagna & Soul',
    hindiTitle: 'लग्न एवं आत्म कक्ष',
    signification: 'Physical vitality, personality, soul constitution, and the foundational ascendant blueprint.',
    targetView: 'kundli_shell',
    cameraPosition: [0, 4, 8],
    cameraTarget: [0, 1, 4],
    color: '#f59e0b',
    iconName: 'Sun',
    subModules: [
      { title: 'कुण्डली चक्र (Kundli Shell)', view: 'kundli_shell' },
      { title: 'लग्न एवं ग्रह स्थिति (Planetary Positions)', view: 'kundli_shell' }
    ]
  },
  {
    id: 'chamber_2',
    houseNumber: 2,
    wingId: 'north_wing',
    wingName: 'North Wing (Wealth & Lineage)',
    wingNameHindi: 'उत्तर खंड (धन व कुटुंब कक्ष)',
    sanskritName: 'Dhana Bhava (धन भाव)',
    englishTitle: 'Chamber of Wealth & Family',
    hindiTitle: 'धन, वाणी एवं कुटुंब कक्ष',
    signification: 'Accumulated wealth, speech purity, family lineage, and numeric cosmic vibrations.',
    targetView: 'numerology',
    cameraPosition: [4, 4, 7],
    cameraTarget: [3, 1, 3.5],
    color: '#10b981',
    iconName: 'Coins',
    subModules: [
      { title: 'अंक ज्योतिष (Numerology)', view: 'numerology' },
      { title: 'लो शू ग्रिड (Lo Shu Grid)', view: 'numerology' }
    ]
  },
  {
    id: 'chamber_3',
    houseNumber: 3,
    wingId: 'east_wing',
    wingName: 'East Wing (Courage & Valour)',
    wingNameHindi: 'पूर्व खंड (पराक्रम व सहोदर कक्ष)',
    sanskritName: 'Sahaja Bhava (सहज भाव)',
    englishTitle: 'Chamber of Courage & Valour',
    hindiTitle: 'पराक्रम एवं सहोदर कक्ष',
    signification: 'Effort, initiative, courage, willpower, and immediate siblings/allies.',
    targetView: 'prashna_kundli',
    cameraPosition: [7, 4, 4],
    cameraTarget: [4, 1, 1],
    color: '#ef4444',
    iconName: 'Shield',
    subModules: [
      { title: 'प्रश्न कुण्डली (Prashna Kundli)', view: 'prashna_kundli' }
    ]
  },
  {
    id: 'chamber_4',
    houseNumber: 4,
    wingId: 'east_wing',
    wingName: 'East Wing (Sanctuary & Home)',
    wingNameHindi: 'पूर्व खंड (मातृ, गृह व सुख कक्ष)',
    sanskritName: 'Sukha Bhava (सुख भाव)',
    englishTitle: 'Chamber of Sanctuary & Inner Peace',
    hindiTitle: 'मातृ, गृह एवं सुख कक्ष',
    signification: 'Maternal grace, inner happiness, home sanctuary, emotional peace, and sacred dwellings.',
    targetView: 'daily_report_card',
    cameraPosition: [8, 4, 0],
    cameraTarget: [4, 1, 0],
    color: '#38bdf8',
    iconName: 'Home',
    subModules: [
      { title: 'दैनिक रिपोर्ट कार्ड (Daily Report Card)', view: 'daily_report_card' }
    ]
  },
  {
    id: 'chamber_5',
    houseNumber: 5,
    wingId: 'east_wing',
    wingName: 'East Wing (Intelligence & Wisdom)',
    wingNameHindi: 'पूर्व खंड (बुद्धि व ज्ञान कक्ष)',
    sanskritName: 'Putra & Buddhi Bhava (पुत्र एवं बुद्धि भाव)',
    englishTitle: 'Chamber of Intelligence & Past Merit',
    hindiTitle: 'बुद्धि, ज्ञान एवं पूर्वपुण्य कक्ष',
    signification: 'Creative genius, higher learning, discernment, children, and AI Jyotish intelligence.',
    targetView: 'intelligence_dashboard',
    cameraPosition: [7, 4, -4],
    cameraTarget: [3.5, 1, -2.5],
    color: '#8b5cf6',
    iconName: 'Sparkles',
    subModules: [
      { title: 'आर्टिफिशियल इंटेलिजेंस ज्योतिष (AI Jyotish)', view: 'intelligence_dashboard' },
      { title: 'पञ्चतत्त्व विश्लेषण (Panchatattva)', view: 'intelligence_dashboard' }
    ]
  },
  {
    id: 'chamber_6',
    houseNumber: 6,
    wingId: 'south_wing',
    wingName: 'South Wing (Health & Discipline)',
    wingNameHindi: 'दक्षिण खंड (आरोग्य व सेवा कक्ष)',
    sanskritName: 'Ripu & Ari Bhava (रिपु भाव)',
    englishTitle: 'Chamber of Health & Overcoming',
    hindiTitle: 'आरोग्य, सेवा एवं शत्रुंजय कक्ष',
    signification: 'Daily service, overcoming obstacles, healing vitality, and morning spiritual discipline.',
    targetView: 'pratah_sanskar',
    cameraPosition: [4, 4, -7],
    cameraTarget: [2, 1, -4],
    color: '#06b6d4',
    iconName: 'HeartPulse',
    subModules: [
      { title: 'प्रातः संस्कार दिनचर्या (Pratah Routine)', view: 'pratah_sanskar' }
    ]
  },
  {
    id: 'chamber_7',
    houseNumber: 7,
    wingId: 'south_wing',
    wingName: 'South Wing (Union & Partnerships)',
    wingNameHindi: 'दक्षिण खंड (दांपत्य व साझेदारी कक्ष)',
    sanskritName: 'Kalatra Bhava (कलत्र भाव)',
    englishTitle: 'Chamber of Union & Partnerships',
    hindiTitle: 'साझेदारी एवं दांपत्य कक्ष',
    signification: 'Sacred marital union, long-term business partnerships, public interactions, and Horary inquiries.',
    targetView: 'prashna_kundli',
    cameraPosition: [0, 4, -8],
    cameraTarget: [0, 1, -4],
    color: '#ec4899',
    iconName: 'Users',
    subModules: [
      { title: 'प्रश्न कुण्डली निर्णय (Horary Judgment)', view: 'prashna_kundli' }
    ]
  },
  {
    id: 'chamber_8',
    houseNumber: 8,
    wingId: 'south_wing',
    wingName: 'South Wing (Mysteries & Evidence Ledger)',
    wingNameHindi: 'दक्षिण खंड (गूढ़ विद्या व साक्ष्य कक्ष)',
    sanskritName: 'Randhra Bhava (रन्ध्र भाव)',
    englishTitle: 'Chamber of Mysteries & Evidence Ledger',
    hindiTitle: 'गूढ़ विद्या, आयु एवं पारगमन साक्ष्य कक्ष',
    signification: 'Occult wisdom, transformative longevity, KP Stellar sub-lords, and the Permanent Transit Evidence Ledger.',
    targetView: 'kundli_shell',
    cameraPosition: [-4, 4, -7],
    cameraTarget: [-2, 1, -4],
    color: '#a855f7',
    iconName: 'Key',
    subModules: [
      { title: 'केपी ज्योतिष एवं उप-स्वामी (KP Sub-Lords)', view: 'kundli_shell' },
      { title: 'पारगमन साक्ष्य बहीखाता (Transit Evidence Ledger)', view: 'kundli_shell' }
    ]
  },
  {
    id: 'chamber_9',
    houseNumber: 9,
    wingId: 'west_wing',
    wingName: 'West Wing (Fortune & Philosophy)',
    wingNameHindi: 'पश्चिम खंड (धर्म व भाग्य कक्ष)',
    sanskritName: 'Dharma & Bhagya Bhava (धर्म एवं भाग्य भाव)',
    englishTitle: 'Chamber of Divine Fortune & Wisdom',
    hindiTitle: 'धर्म, गुरु एवं भाग्य कक्ष',
    signification: 'Higher spiritual philosophy, guru guidance, divine grace, Parashari yogas, and Jaimini Karakas.',
    targetView: 'kundli_shell',
    cameraPosition: [-7, 4, -4],
    cameraTarget: [-3.5, 1, -2.5],
    color: '#f59e0b',
    iconName: 'BookOpen',
    subModules: [
      { title: 'पाराशरी योग एवं दशा (Parashari Yogas)', view: 'kundli_shell' },
      { title: 'जैमिनी ज्योतिष (Jaimini Sutras)', view: 'kundli_shell' }
    ]
  },
  {
    id: 'chamber_10',
    houseNumber: 10,
    wingId: 'west_wing',
    wingName: 'West Wing (Career & Zenith)',
    wingNameHindi: 'पश्चिम खंड (कर्म व कीर्ति कक्ष)',
    sanskritName: 'Karma Bhava (कर्म भाव)',
    englishTitle: 'Chamber of Zenith & Worldly Action',
    hindiTitle: 'कर्म, कीर्ति एवं आजीविका कक्ष',
    signification: 'Career authority, worldly achievements, future transit timing, and executive life reports.',
    targetView: 'reports',
    cameraPosition: [-8, 4, 0],
    cameraTarget: [-4, 1, 0],
    color: '#d4af37',
    iconName: 'FileText',
    subModules: [
      { title: 'जीवन रिपोर्ट केंद्र (Report Center)', view: 'reports' },
      { title: 'करियर एवं भविष्य पारगमन (Career Transits)', view: 'kundli_shell' }
    ]
  },
  {
    id: 'chamber_11',
    houseNumber: 11,
    wingId: 'west_wing',
    wingName: 'West Wing (Gains & Aspirations)',
    wingNameHindi: 'पश्चिम खंड (आय व अभीष्ट लाभ कक्ष)',
    sanskritName: 'Labha Bhava (लाभ भाव)',
    englishTitle: 'Chamber of Cosmic Gains & Wishes',
    hindiTitle: 'आय, सिद्धि एवं अभीष्ट लाभ कक्ष',
    signification: 'Inflow of blessings, social circles, aspirations fulfilled, and auspicious Muhurat timing.',
    targetView: 'daily_companion',
    cameraPosition: [-7, 4, 4],
    cameraTarget: [-3.5, 1, 2.5],
    color: '#10b981',
    iconName: 'Sparkles',
    subModules: [
      { title: 'दैनिक शुभ समय व साथी (Daily Companion)', view: 'daily_companion' }
    ]
  },
  {
    id: 'chamber_12',
    houseNumber: 12,
    wingId: 'north_wing',
    wingName: 'North Wing (Transcendence & Peace)',
    wingNameHindi: 'उत्तर खंड (मोक्ष व एकांत कक्ष)',
    sanskritName: 'Moksha & Vyaya Bhava (मोक्ष भाव)',
    englishTitle: 'Chamber of Transcendence & Stillness',
    hindiTitle: 'मोक्ष, एकांत एवं परमसत्य कक्ष',
    signification: 'Spiritual liberation, subconscious surrender, meditative stillness, and sacred temple peace.',
    targetView: 'pratah_sanskar',
    cameraPosition: [-4, 4, 7],
    cameraTarget: [-2, 1, 4],
    color: '#6366f1',
    iconName: 'Moon',
    subModules: [
      { title: 'ध्यान एवं प्रातः साधना (Morning Sadhana)', view: 'pratah_sanskar' }
    ]
  },
  {
    id: 'guardian_sanctum',
    wingId: 'north_wing',
    wingName: 'North Wing Inner Sanctum (Gupta Garbha Griha)',
    wingNameHindi: 'उत्तर आंतरिक खंड (गुप्त गर्भगृह)',
    sanskritName: 'Gupta Garbha Griha',
    englishTitle: 'Secret Guardian Sanctum',
    hindiTitle: 'गुप्त गर्भगृह एवं संरक्षक नियंत्रण',
    signification: 'Protected operational sanctuary for system resilience, error rollback, and Owner Control Center.',
    targetView: 'owner_control',
    cameraPosition: [0, 5, -12],
    cameraTarget: [0, 2, -10],
    color: '#eab308',
    iconName: 'Shield',
    subModules: [
      { title: 'स्वामी नियंत्रण केंद्र (Owner Control Center)', view: 'owner_control' }
    ]
  }
];

export interface HouseResidentSummary {
  chamberId: ChamberId;
  houseNumber?: number;
  planets: string[];
  rashiName?: string;
  signLord?: string;
  isLagna?: boolean;
}

/**
 * Verified Zodiac Sign metadata (1 = Mesha to 12 = Meena)
 */
export const RASHI_DATA: Record<number, { nameHi: string; nameEn: string; symbol: string; lord: string }> = {
  1: { nameHi: 'मेष', nameEn: 'Aries', symbol: '♈', lord: 'Mars' },
  2: { nameHi: 'वृषभ', nameEn: 'Taurus', symbol: '♉', lord: 'Venus' },
  3: { nameHi: 'मिथुन', nameEn: 'Gemini', symbol: '♊', lord: 'Mercury' },
  4: { nameHi: 'कर्क', nameEn: 'Cancer', symbol: '♋', lord: 'Moon' },
  5: { nameHi: 'सिंह', nameEn: 'Leo', symbol: '♌', lord: 'Sun' },
  6: { nameHi: 'कन्या', nameEn: 'Virgo', symbol: '♍', lord: 'Mercury' },
  7: { nameHi: 'तुला', nameEn: 'Libra', symbol: '♎', lord: 'Venus' },
  8: { nameHi: 'वृश्चिक', nameEn: 'Scorpio', symbol: '♏', lord: 'Mars' },
  9: { nameHi: 'धनु', nameEn: 'Sagittarius', symbol: '♐', lord: 'Jupiter' },
  10: { nameHi: 'मकर', nameEn: 'Capricorn', symbol: '♑', lord: 'Saturn' },
  11: { nameHi: 'कुंभ', nameEn: 'Aquarius', symbol: '♒', lord: 'Saturn' },
  12: { nameHi: 'मीन', nameEn: 'Pisces', symbol: '♓', lord: 'Jupiter' }
};

/**
 * Verified Navagraha Visual & Astronomical metadata
 */
export const PLANET_META: Record<string, { symbol: string; color: string; element: string; defaultHindi: string }> = {
  Sun: { symbol: '☉', color: '#ffb800', element: 'अग्नि (Fire)', defaultHindi: 'सूर्य' },
  Moon: { symbol: '☽', color: '#e0f2fe', element: 'जल (Water)', defaultHindi: 'चंद्र' },
  Mars: { symbol: '♂', color: '#ef4444', element: 'अग्नि (Fire)', defaultHindi: 'मंगल' },
  Mercury: { symbol: '☿', color: '#10b981', element: 'पृथ्वी (Earth)', defaultHindi: 'बुध' },
  Jupiter: { symbol: '♃', color: '#facc15', element: 'आकाश (Ether)', defaultHindi: 'गुरु' },
  Venus: { symbol: '♀', color: '#f472b6', element: 'जल (Water)', defaultHindi: 'शुक्र' },
  Saturn: { symbol: '♄', color: '#60a5fa', element: 'वायु (Air)', defaultHindi: 'शनि' },
  Rahu: { symbol: '☊', color: '#818cf8', element: 'वायु (Air)', defaultHindi: 'राहु' },
  Ketu: { symbol: '☋', color: '#a855f7', element: 'अग्नि (Fire)', defaultHindi: 'केतु' }
};

/**
 * Standard Vedic Bhava Titles (Read-Only)
 */
export const BHAVA_NAMES_STANDARD: Record<number, string> = {
  1: 'तनु भाव',
  2: 'धन भाव',
  3: 'सहज भाव',
  4: 'सुख भाव',
  5: 'पुत्र भाव',
  6: 'रिपु भाव',
  7: 'जाया भाव',
  8: 'आयु भाव',
  9: 'भाग्य भाव',
  10: 'कर्म भाव',
  11: 'लाभ भाव',
  12: 'व्यय भाव'
};

/**
 * Formats a decimal degree into standard astronomical DMS format (e.g. 18° 42' 15")
 * Strictly presentation-only: never modifies the underlying astronomical floating value.
 */
export function formatDegreeDMS(degVal: number): string {
  if (degVal == null || isNaN(degVal)) return '0° 00\' 00"';
  const totalSeconds = Math.round(degVal * 3600);
  const d = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

/**
 * Formats a decimal degree string (e.g. 18.7042°)
 */
export function formatDecimalDegree(degVal: number): string {
  if (degVal == null || isNaN(degVal)) return '0.0000°';
  return `${degVal.toFixed(4)}°`;
}

/**
 * Single Resident Planet Astronomical ViewModel (Read-Only)
 */
export interface PlanetAstroViewModel {
  name: string;
  localizedName: string;
  symbol: string;
  color: string;
  house: number;
  rashiNumber: number;
  rashiName: string;
  rashiSymbol: string;
  degree: number;
  formattedDegree: string;
  decimalDegree: string;
  siderealLongitude: number;
  nakshatra: number;
  nakshatraName: string;
  pada: number;
  nakshatraLord: string;
  motion: string;
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: string;
  element: string;
  rashiLord?: string;
  bhavaName?: string;
  monologue?: string;
}

/**
 * Complete Bhava Kundli Chamber Astronomical ViewModel (Read-Only)
 */
export interface BhavaAstroViewModel {
  chamberId: ChamberId;
  bhavaNumber: number;
  devanagariNum: string;
  bhavaName: string;
  englishTitle: string;
  wingNameHindi?: string;
  signification: string;
  targetView: string;
  color: string;
  rashiNumber: number;
  rashiName: string;
  rashiNameEn: string;
  rashiSymbol: string;
  signLord: string;
  cuspLongitude?: number;
  cuspDegree?: number;
  cuspFormattedDegree?: string;
  planets: PlanetAstroViewModel[];
  emptyNotice?: string;
}

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२'];

/**
 * Safely extracts read-only astrological placements from MasterKundliData.
 * Invariant: Does not alter, recalculate, or modify any astronomy core.
 */
export function extractHouseResidents(masterData: MasterKundliData | null): Record<string, HouseResidentSummary> {
  const result: Record<string, HouseResidentSummary> = {};

  CHAMBER_DEFINITIONS.forEach(def => {
    result[def.id] = {
      chamberId: def.id,
      houseNumber: def.houseNumber,
      planets: [],
      isLagna: def.houseNumber === 1
    };
  });

  if (!masterData || !masterData.planets) {
    return result;
  }

  // Populate resident planets in each house (1 through 12)
  Object.entries(masterData.planets).forEach(([planetName, planetInfo]) => {
    if (planetInfo && typeof planetInfo.d1House === 'number') {
      const chamberKey = `chamber_${planetInfo.d1House}`;
      if (result[chamberKey]) {
        result[chamberKey].planets.push(planetName);
      }
    }
  });

  // Assign Lagna sign to 1st house
  if (masterData.lagna && result['chamber_1']) {
    result['chamber_1'].rashiName = masterData.lagna.rashiName;
    result['chamber_1'].signLord = masterData.lagna.signLord;
  }

  return result;
}

/**
 * Safely extracts rich read-only Bhava Kundli ViewModels from MasterKundliData.
 * Communicates: Bhava #, Bhava Name, Rashi #, Rashi Name, Resident Planets with
 * exact degree DMS, Nakshatra, Pada, Nakshatra Lord, and Motion.
 * Invariant: READ-ONLY. Never invents or recalculates astronomical values.
 */
export function extractBhavaAstroViewModels(
  masterData: MasterKundliData | null,
  lang: LanguageCode = 'hi'
): Record<number, BhavaAstroViewModel> {
  const models: Record<number, BhavaAstroViewModel> = {};

  // Default Lagna sign fallback (if masterData not yet loaded)
  const lagnaRashi = masterData?.lagna?.rashi || masterData?.d1Chart?.[1]?.rashi || 1;

  for (let h = 1; h <= 12; h++) {
    const chamberDef = CHAMBER_DEFINITIONS.find(c => c.houseNumber === h);
    const d1House = masterData?.d1Chart?.[h];

    // Determine Rashi for this Bhava: whole-sign chart calculation from verified d1Chart
    const rashiNum = d1House?.rashi || (((lagnaRashi - 1 + (h - 1)) % 12) + 1);
    const rashiMeta = RASHI_DATA[rashiNum] || { nameHi: `राशि ${rashiNum}`, nameEn: `Sign ${rashiNum}`, symbol: '♈', lord: 'Unknown' };
    const localizedRashi = getLocalizedRashi(rashiNum, lang);

    // Cusp degree
    const cuspLong = d1House?.cuspLongitude;
    const cuspDeg = cuspLong != null ? (cuspLong % 30) : (h === 1 && masterData?.lagna?.degree != null ? masterData.lagna.degree : undefined);

    // Filter planets in this house
    const residentPlanets: PlanetAstroViewModel[] = [];
    if (masterData?.planets) {
      Object.entries(masterData.planets).forEach(([pKey, pData]) => {
        if (!pData) return;
        const targetHouse = pData.d1House != null ? pData.d1House : (pData as any).house;
        if (targetHouse === h) {
          const meta = PLANET_META[pKey] || { symbol: '•', color: '#d4af37', element: 'Unknown', defaultHindi: pKey };
          const pRashiNum = pData.rashi || rashiNum;
          const pRashiMeta = RASHI_DATA[pRashiNum] || rashiMeta;
          const pDegree = typeof pData.degree === 'number' ? pData.degree : 0;

          // Generate planet speaks monologue if available
          let monologue = '';
          try {
            monologue = PlanetSpeaksService.generateScript(pKey, masterData, lang).spokenText;
          } catch {
            monologue = '';
          }

          residentPlanets.push({
            name: pKey,
            localizedName: getLocalizedPlanet(pKey, lang),
            symbol: meta.symbol,
            color: meta.color,
            house: h,
            rashiNumber: pRashiNum,
            rashiName: getLocalizedRashi(pRashiNum, lang),
            rashiSymbol: pRashiMeta.symbol,
            degree: pDegree,
            formattedDegree: formatDegreeDMS(pDegree),
            decimalDegree: formatDecimalDegree(pDegree),
            siderealLongitude: typeof pData.siderealLongitude === 'number' ? pData.siderealLongitude : pDegree,
            nakshatra: pData.nakshatra || 1,
            nakshatraName: getLocalizedNakshatra(pData.nakshatra || 1, lang),
            pada: pData.pada || 1,
            nakshatraLord: getLocalizedPlanet(pData.nakshatraLord || '', lang),
            motion: pData.motionStatus || (pData.isRetrograde ? 'RETROGRADE' : 'DIRECT'),
            isRetrograde: Boolean(pData.isRetrograde),
            isCombust: Boolean(pData.isCombust),
            dignity: getLocalizedDignity(pData.dignity || 'None', lang),
            element: meta.element,
            rashiLord: getLocalizedPlanet(pRashiMeta.lord || '', lang),
            bhavaName: BHAVA_NAMES_STANDARD[h] || chamberDef?.hindiTitle || chamberDef?.sanskritName || `भाव ${h}`,
            monologue
          });
        }
      });
    }

    models[h] = {
      chamberId: (chamberDef?.id || `chamber_${h}`) as ChamberId,
      bhavaNumber: h,
      devanagariNum: DEVANAGARI_DIGITS[h] || `${h}`,
      bhavaName: BHAVA_NAMES_STANDARD[h] || chamberDef?.hindiTitle || chamberDef?.sanskritName || `भाव ${h}`,
      englishTitle: chamberDef?.englishTitle || `House ${h}`,
      wingNameHindi: chamberDef?.wingNameHindi,
      signification: chamberDef?.signification || '',
      targetView: chamberDef?.targetView || 'dashboard',
      color: chamberDef?.color || '#d4af37',
      rashiNumber: rashiNum,
      rashiName: localizedRashi,
      rashiNameEn: rashiMeta.nameEn,
      rashiSymbol: rashiMeta.symbol,
      signLord: getLocalizedPlanet(d1House?.signLord || rashiMeta.lord, lang),
      cuspLongitude: cuspLong,
      cuspDegree: cuspDeg,
      cuspFormattedDegree: cuspDeg != null ? formatDegreeDMS(cuspDeg) : undefined,
      planets: residentPlanets,
      emptyNotice: residentPlanets.length === 0 ? (lang === 'hi' ? 'इस भाव में कोई ग्रह स्थित नहीं है।' : 'No planets in this Bhava.') : undefined
    };
  }

  return models;
}

/**
 * Architectural Portals for Spatial Navigation (Phase 4.2A)
 */
export const MAIN_ENTRY_PORTAL: HousePortal = {
  id: 'main_entry_portal',
  type: 'ENTRY',
  position: [0, 0, 9.4],
  direction: [0, 0, -1],
  width: 3.8,
  height: 4.8,
  targetMode: 'INTERIOR'
};

export const INTERNAL_EXIT_PORTAL: HousePortal = {
  id: 'internal_exit_portal',
  type: 'EXIT',
  position: [0, 0, 9.4],
  direction: [0, 0, 1],
  width: 3.8,
  height: 4.8,
  targetMode: 'EXTERIOR'
};

export const CHAMBER_PORTALS: Record<string, HousePortal> = {
  chamber_1: {
    id: 'portal_chamber_1',
    type: 'CHAMBER',
    position: [0, 0, -8.0],
    direction: [0, 0, 1],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_2: {
    id: 'portal_chamber_2',
    type: 'CHAMBER',
    position: [4.0, 0, -6.9],
    direction: [-0.5, 0, 0.86],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_3: {
    id: 'portal_chamber_3',
    type: 'CHAMBER',
    position: [6.9, 0, -4.0],
    direction: [-0.86, 0, 0.5],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_4: {
    id: 'portal_chamber_4',
    type: 'CHAMBER',
    position: [8.0, 0, 0],
    direction: [-1, 0, 0],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_5: {
    id: 'portal_chamber_5',
    type: 'CHAMBER',
    position: [6.9, 0, 4.0],
    direction: [-0.86, 0, -0.5],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_6: {
    id: 'portal_chamber_6',
    type: 'CHAMBER',
    position: [4.0, 0, 6.9],
    direction: [-0.5, 0, -0.86],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_7: {
    id: 'portal_chamber_7',
    type: 'CHAMBER',
    position: [0, 0, 8.0],
    direction: [0, 0, -1],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_8: {
    id: 'portal_chamber_8',
    type: 'CHAMBER',
    position: [-4.0, 0, 6.9],
    direction: [0.5, 0, -0.86],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_9: {
    id: 'portal_chamber_9',
    type: 'CHAMBER',
    position: [-6.9, 0, 4.0],
    direction: [0.86, 0, -0.5],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_10: {
    id: 'portal_chamber_10',
    type: 'CHAMBER',
    position: [-8.0, 0, 0],
    direction: [1, 0, 0],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_11: {
    id: 'portal_chamber_11',
    type: 'CHAMBER',
    position: [-6.9, 0, -4.0],
    direction: [0.86, 0, 0.5],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  chamber_12: {
    id: 'portal_chamber_12',
    type: 'CHAMBER',
    position: [-4.0, 0, -6.9],
    direction: [0.5, 0, 0.86],
    width: 2.2,
    height: 3.2,
    targetMode: 'CHAMBER'
  },
  guardian_sanctum: {
    id: 'portal_guardian_sanctum',
    type: 'CHAMBER',
    position: [0, 0, -9.2],
    direction: [0, 0, 1],
    width: 2.4,
    height: 3.4,
    targetMode: 'CHAMBER'
  }
};

