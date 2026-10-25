/**
 * DYNAMIC KUNDLI-DRIVEN “JYOTISH CINEMA / ज्योतिष कथा” ENGINE
 * 
 * Presentation & Education layer on top of verified astronomical Kundli data.
 * 
 * STRICT COMPLIANCE:
 * - Read-only access to MasterKundliData & Analysis data.
 * - NEVER invents coordinates, signs, degrees, nakshatras, dignities, or aspects.
 * - Displays "गणना अनुपलब्ध / Calculation unavailable" if data is missing.
 * - Supports all 9 Navagrahas: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu.
 */

import { LanguageCode } from '../../i18n/types';
import {
  getLocalizedPlanet,
  getLocalizedHouse,
  getLocalizedRashi,
  getLocalizedNakshatra,
  getLocalizedDignity
} from '../../i18n/astrology';

export type NavagrahaKey =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export const ALL_NAVAGRAHAS: NavagrahaKey[] = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu'
];

export interface NavagrahaCinemaProfile {
  key: NavagrahaKey;
  sanskritName: string;
  hindiName: string;
  englishName: string;
  symbol: string;
  element: string;
  rulingRashiHi: string;
  rulingRashiEn: string;
  ambientToneHz: number;
  themeTitleHi: string;
  themeTitleEn: string;
  atmosphereDescriptionHi: string;
  atmosphereDescriptionEn: string;
  colors: {
    primary: string;
    secondary: string;
    glow: string;
    particle: string;
    halo: string;
  };
  traditionalKeywordsHi: string[];
  traditionalKeywordsEn: string[];
  traditionalSignificationsHi: string;
  traditionalSignificationsEn: string;
}

export const NAVAGRAHA_PROFILES: Record<NavagrahaKey, NavagrahaCinemaProfile> = {
  Sun: {
    key: 'Sun',
    sanskritName: 'सूर्य (Surya)',
    hindiName: 'सूर्य',
    englishName: 'Sun',
    symbol: '☉',
    element: 'अग्नि (Fire)',
    rulingRashiHi: 'सिंह (Leo)',
    rulingRashiEn: 'Leo',
    ambientToneHz: 126.22,
    themeTitleHi: 'तेजोमय सौर मंडल',
    themeTitleEn: 'Radiant Solar Corona',
    atmosphereDescriptionHi: 'प्रचंड सौर कोरोना, स्वर्ण आभा और प्रकाश पुंज (सिनेमैटिक निरूपण)',
    atmosphereDescriptionEn: 'Intense solar corona, golden light, radiating solar flares (cinematic representation)',
    colors: {
      primary: '#ffb800',
      secondary: '#ff5500',
      glow: 'rgba(255, 184, 0, 0.85)',
      particle: '#ffe082',
      halo: 'rgba(255, 120, 0, 0.4)'
    },
    traditionalKeywordsHi: ['आत्मा', 'पिता', 'राजसत्ता', 'मान-सम्मान', 'ऊर्जा', 'तेज', 'आत्मविश्वास', 'स्वास्थ्य'],
    traditionalKeywordsEn: ['Soul (Atma)', 'Father', 'Authority', 'Dignity', 'Vitality', 'Splendor', 'Confidence'],
    traditionalSignificationsHi: 'आत्मा, पिता, आंतरिक ओज, आत्म-सम्मान, नेतृत्व और जीवन ऊर्जा',
    traditionalSignificationsEn: 'the Soul (Atma), Father, inner vitality, royal authority, self-worth, and leadership'
  },
  Moon: {
    key: 'Moon',
    sanskritName: 'चन्द्र (Chandra)',
    hindiName: 'चंद्र',
    englishName: 'Moon',
    symbol: '☽',
    element: 'जल (Water)',
    rulingRashiHi: 'कर्क (Cancer)',
    rulingRashiEn: 'Cancer',
    ambientToneHz: 210.42,
    themeTitleHi: 'शांत चंद्रलोक',
    themeTitleEn: 'Serene Lunar Glow',
    atmosphereDescriptionHi: 'शीतल रजत प्रकाश, शांत चंद्र किरणें और अमृतमय आभा (सिनेमैटिक निरूपण)',
    atmosphereDescriptionEn: 'Soft silver light, tranquil lunar environment, pearlescent glow (cinematic representation)',
    colors: {
      primary: '#e0f2fe',
      secondary: '#93c5fd',
      glow: 'rgba(224, 242, 254, 0.8)',
      particle: '#ffffff',
      halo: 'rgba(147, 197, 253, 0.35)'
    },
    traditionalKeywordsHi: ['मन', 'माता', 'भावनाएँ', 'शांति', 'कल्पना', 'संवेदनशीलता', 'जल तत्व', 'अंतर्मन'],
    traditionalKeywordsEn: ['Mind (Manas)', 'Mother', 'Emotions', 'Tranquility', 'Intuition', 'Fluids', 'Subconscious'],
    traditionalSignificationsHi: 'मन (मानस), माता, संवेदना, आंतरिक शांति, कल्पनाशीलता और जल तत्व',
    traditionalSignificationsEn: 'the Mind (Manas), Mother, emotional consciousness, peace of mind, and fluid harmony'
  },
  Mars: {
    key: 'Mars',
    sanskritName: 'मङ्गल (Mangala)',
    hindiName: 'मंगल',
    englishName: 'Mars',
    symbol: '♂',
    element: 'अग्नि (Fire)',
    rulingRashiHi: 'मेष व वृश्चिक (Aries & Scorpio)',
    rulingRashiEn: 'Aries & Scorpio',
    ambientToneHz: 144.72,
    themeTitleHi: 'ऊर्जावान अंगारक मंडल',
    themeTitleEn: 'Dynamic Crimson Sphere',
    atmosphereDescriptionHi: 'रक्ताभ ज्वालामुखीय आभा, साहसी स्पंद और ऊर्जा पुंज (सिनेमैटिक निरूपण)',
    atmosphereDescriptionEn: 'Red energetic atmosphere, courageous dynamic sparks, fiery vigor (cinematic representation)',
    colors: {
      primary: '#ef4444',
      secondary: '#991b1b',
      glow: 'rgba(239, 68, 68, 0.85)',
      particle: '#fca5a5',
      halo: 'rgba(153, 27, 27, 0.45)'
    },
    traditionalKeywordsHi: ['पराक्रम', 'साहस', 'भ्राता', 'ऊर्जा', 'दृढ़ संकल्प', 'भूमि', 'रक्त', 'सेनापति'],
    traditionalKeywordsEn: ['Courage (Parakrama)', 'Valor', 'Siblings', 'Energy', 'Land', 'Action', 'Determination'],
    traditionalSignificationsHi: 'पराक्रम, साहस, भ्रातृ सुख, निर्णय शक्ति, भूमि, रक्त और रक्षात्मक ऊर्जा',
    traditionalSignificationsEn: 'Courage (Parakrama), physical vitality, siblings, decisive action, land, and willpower'
  },
  Mercury: {
    key: 'Mercury',
    sanskritName: 'बुध (Budha)',
    hindiName: 'बुध',
    englishName: 'Mercury',
    symbol: '☿',
    element: 'पृथ्वी/वायु (Intellect/Earth)',
    rulingRashiHi: 'मिथुन व कन्या (Gemini & Virgo)',
    rulingRashiEn: 'Gemini & Virgo',
    ambientToneHz: 141.27,
    themeTitleHi: 'बुद्धिमत्ता का मरकत मंडल',
    themeTitleEn: 'Emerald Intellect Sphere',
    atmosphereDescriptionHi: 'पन्ना-हरित बौद्धिक ऊर्जा, त्वरित विचार किरणें और चैतन्य आभा (सिनेमैटिक निरूपण)',
    atmosphereDescriptionEn: 'Emerald-green intelligent energy, shimmering intellectual crystalline flow (cinematic representation)',
    colors: {
      primary: '#10b981',
      secondary: '#047857',
      glow: 'rgba(16, 185, 129, 0.85)',
      particle: '#a7f3d0',
      halo: 'rgba(4, 120, 87, 0.4)'
    },
    traditionalKeywordsHi: ['बुद्धि', 'वाणी', 'व्यापार', 'संचार', 'तर्कशक्ति', 'गणित', 'विद्या', 'मित्र'],
    traditionalKeywordsEn: ['Intellect (Buddhi)', 'Speech (Vani)', 'Commerce', 'Logic', 'Analytical Mind', 'Wit'],
    traditionalSignificationsHi: 'बुद्धि (तर्क), मधुर व स्पष्ट वाणी, व्यापारिक कौशल, संचार और गणितीय क्षमता',
    traditionalSignificationsEn: 'Intellect (Buddhi), eloquent speech, logical reasoning, trade, and communicative discernment'
  },
  Jupiter: {
    key: 'Jupiter',
    sanskritName: 'बृहस्पति / गुरु (Brihaspati)',
    hindiName: 'गुरु',
    englishName: 'Jupiter',
    symbol: '♃',
    element: 'आकाश (Ether)',
    rulingRashiHi: 'धनु व मीन (Sagittarius & Pisces)',
    rulingRashiEn: 'Sagittarius & Pisces',
    ambientToneHz: 183.58,
    themeTitleHi: 'दिव्य ज्ञानमय गुरु लोक',
    themeTitleEn: 'Grand Golden-Amber Wisdom',
    atmosphereDescriptionHi: 'विशाल स्वर्णिम-पीताभ आभा, धर्म-संस्कारों का प्रकाश और गुरु कृपा (सिनेमैटिक निरूपण)',
    atmosphereDescriptionEn: 'Large golden-amber cosmic presence, royal wisdom banded atmosphere (cinematic representation)',
    colors: {
      primary: '#f59e0b',
      secondary: '#b45309',
      glow: 'rgba(245, 158, 11, 0.85)',
      particle: '#fde68a',
      halo: 'rgba(180, 83, 9, 0.45)'
    },
    traditionalKeywordsHi: ['ज्ञान', 'गुरु', 'धर्म', 'संतान', 'भाग्य', 'विस्तार', 'उच्च शिक्षा', 'कृपा'],
    traditionalKeywordsEn: ['Wisdom (Jnana)', 'Guru', 'Dharma', 'Progeny', 'Fortune (Bhagya)', 'Expansion', 'Grace'],
    traditionalSignificationsHi: 'ज्ञान, धर्म, सद्गुरु, संतान सुख, आध्यात्मिक विवेक, सौभाग्य और जीव कारक',
    traditionalSignificationsEn: 'Wisdom (Jnana), spiritual Dharma, higher learning, progeny, fortune, and divine grace'
  },
  Venus: {
    key: 'Venus',
    sanskritName: 'शुक्र (Shukra)',
    hindiName: 'शुक्र',
    englishName: 'Venus',
    symbol: '♀',
    element: 'जल (Water)',
    rulingRashiHi: 'वृषभ व तुला (Taurus & Libra)',
    rulingRashiEn: 'Taurus & Libra',
    ambientToneHz: 221.23,
    themeTitleHi: 'सौंदर्य व कला का दैदीप्यमान मंडल',
    themeTitleEn: 'Luminous Celestial Beauty',
    atmosphereDescriptionHi: 'शुभ्र श्वेत-गुलाबी दिव्य प्रकाश, माधुर्य, कलात्मक तरंगें (सिनेमैटिक निरूपण)',
    atmosphereDescriptionEn: 'Bright white/rose celestial atmosphere, lustrous beauty nimbus, artistic grace (cinematic representation)',
    colors: {
      primary: '#f472b6',
      secondary: '#db2777',
      glow: 'rgba(244, 114, 182, 0.85)',
      particle: '#fdf2f8',
      halo: 'rgba(219, 39, 119, 0.35)'
    },
    traditionalKeywordsHi: ['प्रेम', 'सौंदर्य', 'कला', 'वैवाहिक सुख', 'वाहन', 'विलासिता', 'आकर्षण', 'संजीवनी'],
    traditionalKeywordsEn: ['Love (Prema)', 'Beauty', 'Arts', 'Marital Harmony', 'Luxury', 'Refinement', 'Vehicles'],
    traditionalSignificationsHi: 'प्रेम, सौंदर्य, कलात्मक अभिव्यक्ति, दांपत्य सुख, भौतिक समृद्धि और परिष्कार',
    traditionalSignificationsEn: 'Love, artistic elegance, aesthetic sensibility, marital harmony, and worldly prosperity'
  },
  Saturn: {
    key: 'Saturn',
    sanskritName: 'शनि (Shani)',
    hindiName: 'शनि',
    englishName: 'Saturn',
    symbol: '♄',
    element: 'वायु (Air)',
    rulingRashiHi: 'मकर व कुंभ (Capricorn & Aquarius)',
    rulingRashiEn: 'Capricorn & Aquarius',
    ambientToneHz: 147.85,
    themeTitleHi: 'गंभीर न्याय व कर्म का वलय मंडल',
    themeTitleEn: 'Majestic Indigo Karmic Rings',
    atmosphereDescriptionHi: 'गहन नील-नीलम आभा, सुदूर अंतरिक्षीय वलय, धैर्य और न्याय का संधान (सिनेमैटिक निरूपण)',
    atmosphereDescriptionEn: 'Deep blue/indigo, slow gravitational atmosphere, majestic concentric rings (cinematic representation)',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e3a8a',
      glow: 'rgba(59, 130, 246, 0.85)',
      particle: '#93c5fd',
      halo: 'rgba(30, 58, 138, 0.5)'
    },
    traditionalKeywordsHi: ['कर्म', 'धैर्य', 'न्याय', 'अनुशासन', 'वैराग्य', 'आयु', 'श्रम', 'तपस्या'],
    traditionalKeywordsEn: ['Karma', 'Patience (Dhairya)', 'Justice', 'Discipline', 'Longevity (Ayus)', 'Labor', 'Austerity'],
    traditionalSignificationsHi: 'कर्म फलदाता, न्याय, दीर्घायु, धैर्य, कठिन साधना, अनुशासन और वैराग्य',
    traditionalSignificationsEn: 'Lord of Karma, cosmic justice, patience, perseverance, longevity, and self-mastery'
  },
  Rahu: {
    key: 'Rahu',
    sanskritName: 'राहु (Rahu)',
    hindiName: 'राहु',
    englishName: 'Rahu',
    symbol: '☊',
    element: 'वायु/छाया (Shadow/Air)',
    rulingRashiHi: 'कुंभ / कन्या में कारक (Shadow Node)',
    rulingRashiEn: 'Shadow Node (North)',
    ambientToneHz: 108.0,
    themeTitleHi: 'रहस्यमयी ग्रहण मंडल',
    themeTitleEn: 'Enigmatic Eclipse Vortex',
    atmosphereDescriptionHi: 'गूढ़ ग्रहण आभा, छाया स्पंद, अन्वेषण और पारलौकिक आकर्षण (सिनेमैटिक निरूपण)',
    atmosphereDescriptionEn: 'Mysterious eclipse/shadow atmosphere, swirling cosmic shadow particles (cinematic representation)',
    colors: {
      primary: '#818cf8',
      secondary: '#312e81',
      glow: 'rgba(129, 140, 248, 0.85)',
      particle: '#c7d2fe',
      halo: 'rgba(49, 46, 129, 0.5)'
    },
    traditionalKeywordsHi: ['महत्वाकांक्षा', 'अन्वेषण', 'गूढ़ ज्ञान', 'माया', 'विदेश गमन', 'परिवर्तन', 'अपरंपरागत'],
    traditionalKeywordsEn: ['Ambition', 'Innovation', 'Exploration', 'Maya', 'Foreign Connections', 'Unconventional'],
    traditionalSignificationsHi: 'तीव्र महत्वाकांक्षा, आधुनिक अनुसंधान, रहस्यात्मक अन्वेषण, सीमांत तोड़ना और विदेशी संबंध',
    traditionalSignificationsEn: 'intense ambition, innovative exploration, breakthrough thinking, and cosmic maya'
  },
  Ketu: {
    key: 'Ketu',
    sanskritName: 'केतु (Ketu)',
    hindiName: 'केतु',
    englishName: 'Ketu',
    symbol: '☋',
    element: 'अग्नि/छाया (Spiritual Fire)',
    rulingRashiHi: 'वृश्चिक / मीन में कारक (Moksha Node)',
    rulingRashiEn: 'Moksha Node (South)',
    ambientToneHz: 136.1,
    themeTitleHi: 'मोक्ष व वैराग्य का धूम्र मंडल',
    themeTitleEn: 'Spiritual Cosmic Nebula',
    atmosphereDescriptionHi: 'धूम्रवर्णी पारलौकिक आभा, आध्यात्मिक शिखा, अंतर्ज्ञान और कैवल्य (सिनेमैटिक निरूपण)',
    atmosphereDescriptionEn: 'Spiritual/detached smoky cosmic atmosphere, ethereal comet-like spiritual aura (cinematic representation)',
    colors: {
      primary: '#a855f7',
      secondary: '#581c87',
      glow: 'rgba(168, 85, 247, 0.85)',
      particle: '#e9d5ff',
      halo: 'rgba(88, 28, 135, 0.5)'
    },
    traditionalKeywordsHi: ['मोक्ष', 'वैराग्य', 'आध्यात्म', 'अंतर्ज्ञान', 'कैवल्य', 'सूक्ष्म दृष्टि', 'गूढ़ शोध'],
    traditionalKeywordsEn: ['Moksha (Liberation)', 'Detachment (Vairagya)', 'Intuition', 'Occult', 'Spiritual Insight'],
    traditionalSignificationsHi: 'मोक्ष कारक, सांसारिक विरक्ति, सूक्ष्म अंतर्ज्ञान, योग-साधना और परम ज्ञान',
    traditionalSignificationsEn: 'Moksha (Liberation), spiritual detachment, metaphysical intuition, and transcendental insight'
  }
};

export interface VerifiedCinemaPlanetData {
  planetKey: NavagrahaKey;
  profile: NavagrahaCinemaProfile;
  nameHi: string;
  nameEn: string;
  sanskritName: string;
  symbol: string;

  // Real astronomical values
  houseNum: number | null;
  houseLabel: string;
  houseFullHi: string;
  rashiNum: number | null;
  rashiName: string;
  rashiNameHi: string;
  rashiLord: string;
  rashiLordHi: string;

  degreeFormatted: string; // e.g. "14° 32' 18""
  degreeDecimal: number | null;
  nakshatraName: string;
  nakshatraNameHi: string;
  nakshatraLord: string;
  nakshatraLordHi: string;
  pada: number | null;

  motionStatus: string; // "वक्री (Retrograde)" vs "मार्गी (Direct)"
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: string;
  dignityHi: string;
  vargottama: boolean;

  conjunctions: string[];
  aspectsGiven: string[];
  aspectsReceived: string[];

  dashaContext: {
    isCurrentMahadasha: boolean;
    isCurrentAntardasha: boolean;
    mahadashaStartDate?: string;
    mahadashaEndDate?: string;
    summaryHi: string;
    summaryEn: string;
  };

  topicTagline: string;
}

export interface CinemaScriptResult {
  spokenText: string;
  sentences: string[];
  paragraphs: {
    title: string;
    text: string;
  }[];
}

export class JyotishCinemaEngine {
  /**
   * Normalizes any input string to standard NavagrahaKey
   */
  static normalizeKey(input: string): NavagrahaKey {
    if (!input) return 'Sun';
    const s = input.trim().toLowerCase();
    if (s.includes('sun') || s.includes('सूर्य') || s.includes('surya') || s.includes('रवि')) return 'Sun';
    if (s.includes('moon') || s.includes('चंद्र') || s.includes('चन्द्र') || s.includes('chandra') || s.includes('सोम')) return 'Moon';
    if (s.includes('mars') || s.includes('मंगल') || s.includes('mangal') || s.includes('भौम')) return 'Mars';
    if (s.includes('mercury') || s.includes('बुध') || s.includes('budh')) return 'Mercury';
    if (s.includes('jupiter') || s.includes('गुरु') || s.includes('बृहस्पति') || s.includes('guru') || s.includes('brihaspati')) return 'Jupiter';
    if (s.includes('venus') || s.includes('शुक्र') || s.includes('shukra')) return 'Venus';
    if (s.includes('saturn') || s.includes('शनि') || s.includes('shani')) return 'Saturn';
    if (s.includes('rahu') || s.includes('राहु')) return 'Rahu';
    if (s.includes('ketu') || s.includes('केतु')) return 'Ketu';
    return 'Sun';
  }

  /**
   * Strictly extracts verified calculated data from MasterKundliData & Analysis data
   * NEVER invents coordinates, signs, degrees, or aspects.
   */
  static extractVerifiedData(
    planetIdentifier: string,
    masterKundliData: any,
    analysisData?: any,
    language: LanguageCode = 'hi'
  ): VerifiedCinemaPlanetData {
    const pKey = this.normalizeKey(planetIdentifier);
    const profile = NAVAGRAHA_PROFILES[pKey];

    const planetsObj = masterKundliData?.data?.planets || masterKundliData?.planets || {};
    const rawPlanet = planetsObj[pKey] || {};
    const planetAnalysis = analysisData?.planets?.[pKey];

    // 1. House
    const houseNum: number | null = rawPlanet.d1House ?? rawPlanet.house ?? planetAnalysis?.house ?? null;
    const houseObj = houseNum ? getLocalizedHouse(houseNum, language) : { label: 'गणना अनुपलब्ध', full: 'गणना अनुपलब्ध' };

    // 2. Rashi & Lords
    const rashiNum: number | null = rawPlanet.rashi ?? planetAnalysis?.rashi ?? null;
    const rashiNameStr: string = rawPlanet.rashiName || planetAnalysis?.rashiName || '';
    const rashiNameHi = rashiNameStr ? getLocalizedRashi(rashiNameStr, 'hi') : (rashiNum ? `राशि ${rashiNum}` : 'गणना अनुपलब्ध');

    const rashiLordStr: string = rawPlanet.signLord || planetAnalysis?.rashiLord || '';
    const rashiLordHi = rashiLordStr ? getLocalizedPlanet(rashiLordStr, 'hi') : 'गणना अनुपलब्ध';

    // 3. Degree calculation
    const rawDegree: number | undefined = rawPlanet.degree ?? rawPlanet.siderealLongitude ?? planetAnalysis?.degree;
    let degreeFormatted = 'गणना अनुपलब्ध';
    let degDecimal: number | null = null;

    if (rawDegree != null && !isNaN(rawDegree)) {
      degDecimal = rawDegree;
      const d = Math.floor(rawDegree);
      const m = Math.floor((rawDegree - d) * 60);
      const s = Math.round(((rawDegree - d) * 60 - m) * 60);
      degreeFormatted = `${d}° ${m}' ${s}"`;
    }

    // 4. Nakshatra & Pada
    const nakName: string = rawPlanet.nakshatraName || planetAnalysis?.nakshatraName || '';
    const nakNameHi = nakName ? getLocalizedNakshatra(nakName, 'hi') : 'गणना अनुपलब्ध';
    const nakLordStr: string = rawPlanet.nakshatraLord || planetAnalysis?.nakshatraLord || '';
    const nakLordHi = nakLordStr ? getLocalizedPlanet(nakLordStr, 'hi') : 'गणना अनुपलब्ध';
    const pada: number | null = rawPlanet.pada ?? planetAnalysis?.pada ?? null;

    // 5. Motion Status
    const isRetro = Boolean(rawPlanet.isRetrograde ?? planetAnalysis?.isRetrograde);
    const motionStatus = isRetro ? 'वक्री (Retrograde)' : 'मार्गी (Direct)';

    // 6. Combust
    const isCombust = Boolean(rawPlanet.isCombust ?? planetAnalysis?.isCombust);

    // 7. Dignity
    const rawDignity: string = rawPlanet.dignity || planetAnalysis?.dignity || 'None';
    const dignityHi = rawDignity && rawDignity !== 'None' ? getLocalizedDignity(rawDignity, 'hi') : 'सामान्य स्थिति';

    // 8. Vargottama
    const vargottama: boolean = Boolean(
      planetAnalysis?.vargottama ||
      (masterKundliData?.vargaResults?.D9?.planets?.[pKey]?.rashi === rashiNum)
    );

    // 9. Conjunctions (Verified planets sharing same D1 house)
    const conjunctions: string[] = [];
    if (houseNum) {
      for (const otherKey of ALL_NAVAGRAHAS) {
        if (otherKey !== pKey) {
          const otherP = planetsObj[otherKey];
          const otherH = otherP?.d1House ?? otherP?.house;
          if (otherH === houseNum) {
            conjunctions.push(getLocalizedPlanet(otherKey, language));
          }
        }
      }
    }

    // 10. Aspects Given & Received
    const aspectsGiven: string[] = [];
    const aspectsReceived: string[] = [];
    const allAspects = masterKundliData?.relationships?.parashari?.aspects || [];

    for (const asp of allAspects) {
      if (asp.sourcePlanet === pKey) {
        const hLabel = getLocalizedHouse(asp.targetHouse, language).label;
        aspectsGiven.push(`${hLabel} (दृष्टि: ${asp.aspectType || 7}वीं)`);
      }
      if (asp.targetPlanets && asp.targetPlanets.includes(pKey)) {
        const srcP = getLocalizedPlanet(asp.sourcePlanet, language);
        aspectsReceived.push(`${srcP} (${asp.aspectType || 7}वीं दृष्टि)`);
      }
    }

    // 11. Dasha Context
    const dasha = masterKundliData?.data?.vimshottariDasha || masterKundliData?.vimshottariDasha;
    let isCurrentMahadasha = false;
    let isCurrentAntardasha = false;
    let mahadashaStartDate: string | undefined;
    let mahadashaEndDate: string | undefined;

    if (dasha) {
      if (dasha.currentMahadasha?.planet === pKey) {
        isCurrentMahadasha = true;
      }
      if (dasha.currentAntardasha?.planet === pKey) {
        isCurrentAntardasha = true;
      }
      const pMaha = dasha.mahadashas?.find((m: any) => m.planet === pKey);
      if (pMaha) {
        mahadashaStartDate = pMaha.startDate?.split('T')?.[0];
        mahadashaEndDate = pMaha.endDate?.split('T')?.[0];
      }
    }

    let dashaSummaryHi = 'वर्तमान दशा में तटस्थ';
    let dashaSummaryEn = 'Neutral in current dasha timing';
    if (isCurrentMahadasha) {
      dashaSummaryHi = '🌟 वर्तमान महादशा स्वामी (सक्रिय काल)';
      dashaSummaryEn = '🌟 Current Mahadasha Lord (Active Period)';
    } else if (isCurrentAntardasha) {
      dashaSummaryHi = '✨ वर्तमान अंतर्दशा स्वामी';
      dashaSummaryEn = '✨ Current Antardasha Lord';
    } else if (mahadashaStartDate && mahadashaEndDate) {
      dashaSummaryHi = `महादशा अवधि: ${mahadashaStartDate.split('-').reverse().join('/')} से ${mahadashaEndDate.split('-').reverse().join('/')}`;
      dashaSummaryEn = `Mahadasha Period: ${mahadashaStartDate} to ${mahadashaEndDate}`;
    }

    const topicTagline = `${getLocalizedPlanet(pKey, language)} — ${houseObj.label} में ${rashiNameHi}`;

    return {
      planetKey: pKey,
      profile,
      nameHi: profile.hindiName,
      nameEn: profile.englishName,
      sanskritName: profile.sanskritName,
      symbol: profile.symbol,
      houseNum,
      houseLabel: houseObj.label,
      houseFullHi: houseObj.full,
      rashiNum,
      rashiName: rashiNameStr,
      rashiNameHi,
      rashiLord: rashiLordStr,
      rashiLordHi,
      degreeFormatted,
      degreeDecimal: degDecimal,
      nakshatraName: nakName,
      nakshatraNameHi: nakNameHi,
      nakshatraLord: nakLordStr,
      nakshatraLordHi: nakLordHi,
      pada,
      motionStatus,
      isRetrograde: isRetro,
      isCombust,
      dignity: rawDignity,
      dignityHi,
      vargottama,
      conjunctions,
      aspectsGiven,
      aspectsReceived,
      dashaContext: {
        isCurrentMahadasha,
        isCurrentAntardasha,
        mahadashaStartDate,
        mahadashaEndDate,
        summaryHi: dashaSummaryHi,
        summaryEn: dashaSummaryEn
      },
      topicTagline
    };
  }

  /**
   * Builds the Personalized First-Person Planet Speaks script
   * strictly adhering to the user's requested structure:
   * "मैं [ग्रह] हूँ।
   * आपकी जन्मकुंडली में मैं [HOUSE] भाव में, [RASHI] राशि में, [DEGREE] अंश पर, [NAKSHATRA] नक्षत्र में स्थित हूँ।
   * पारंपरिक ज्योतिष में मुझे [TRADITIONAL_SIGNIFICATIONS] से जोड़ा जाता है।
   * आपकी कुंडली में मेरी स्थिति को इस प्रकार समझा जाता है…"
   */
  static buildScript(
    data: VerifiedCinemaPlanetData,
    language: LanguageCode = 'hi'
  ): CinemaScriptResult {
    const isHindi = language === 'hi' || (language as string) === 'Hindi' || language === 'sa';
    const sentences: string[] = [];
    const paragraphs: { title: string; text: string }[] = [];

    const housePhraseHi = data.houseNum ? `आपकी जन्मकुंडली के ${data.houseFullHi}` : 'आपकी जन्मकुंडली';
    const rashiPhraseHi = data.rashiNameHi !== 'गणना अनुपलब्ध' ? `${data.rashiNameHi} राशि` : '';
    const degreePhraseHi = data.degreeFormatted !== 'गणना अनुपलब्ध' ? `${data.degreeFormatted} अंश` : '';
    const nakshatraPhraseHi = data.nakshatraNameHi !== 'गणना अनुपलब्ध'
      ? `${data.nakshatraNameHi} नक्षत्र${data.pada ? ` के ${data.pada} चरण` : ''}`
      : '';

    if (isHindi) {
      // Paragraph 1: Cosmic Opening & Exact Placement
      const p1Title = 'ब्रह्मांडीय उपस्थिति (Cosmic Opening)';
      const p1Sentences: string[] = [
        `मैं ${data.nameHi} हूँ।`,
        `${housePhraseHi} में, ${rashiPhraseHi} में, ${degreePhraseHi} पर, ${nakshatraPhraseHi} में स्थित हूँ।`,
        `मेरी गति ${data.motionStatus} है।`
      ];
      if (data.isCombust) {
        p1Sentences.push('सूर्य के अति निकट होने से मेरी स्थिति अस्त (Combust) है।');
      }
      if (data.vargottama) {
        p1Sentences.push('लग्न व नवांश दोनों में समान राशि में होने के कारण मैं वर्गोत्तम हूँ।');
      }
      paragraphs.push({ title: p1Title, text: p1Sentences.join(' ') });
      sentences.push(...p1Sentences);

      // Paragraph 2: Traditional Significations
      const p2Title = 'पारंपरिक कारकत्व (Traditional Significations)';
      const p2Sentences: string[] = [
        `पारंपरिक वैदिक ज्योतिष में मुझे ${data.profile.traditionalSignificationsHi} से जोड़ा जाता है।`,
        `मानव जीवन में मेरा प्रभाव ${data.profile.traditionalKeywordsHi.slice(0, 5).join(', ')} के रूप में परिलक्षित होता है।`
      ];
      paragraphs.push({ title: p2Title, text: p2Sentences.join(' ') });
      sentences.push(...p2Sentences);

      // Paragraph 3: Kundli Connection & Inter-planetary dynamics
      const p3Title = 'कुंडली संबंध व दृष्टि (Planetary Dynamics)';
      const p3Sentences: string[] = [
        `आपकी कुंडली में मेरी स्थिति को इस प्रकार समझा जाता है।`,
        data.rashiLordHi !== 'गणना अनुपलब्ध' ? `जिस राशि में मैं बैठा हूँ, उसके स्वामी ${data.rashiLordHi} हैं।` : '',
        data.nakshatraLordHi !== 'गणना अनुपलब्ध' ? `तथा मेरे नक्षत्र के अधिपति ${data.nakshatraLordHi} हैं।` : '',
        data.dignityHi !== 'सामान्य स्थिति' ? `इस भाव में मेरी खगोलीय गरिमा ${data.dignityHi} मानी जाती है।` : ''
      ].filter(Boolean);

      if (data.conjunctions.length > 0) {
        p3Sentences.push(`इस भाव में मेरी युति ${data.conjunctions.join(' और ')} के साथ है।`);
      }
      if (data.aspectsReceived.length > 0) {
        p3Sentences.push(`मेरे ऊपर ${data.aspectsReceived.join(', ')} है।`);
      }
      if (data.aspectsGiven.length > 0) {
        p3Sentences.push(`मेरी दृष्टि ${data.aspectsGiven.join(' तथा ')} पर पड़ रही है।`);
      }
      paragraphs.push({ title: p3Title, text: p3Sentences.join(' ') });
      sentences.push(...p3Sentences);

      // Paragraph 4: Dasha Resonance & Wisdom
      const p4Title = 'दशा काल व संदेश (Karmic Resonance)';
      const p4Sentences: string[] = [];
      if (data.dashaContext.isCurrentMahadasha) {
        p4Sentences.push(`वर्तमान समय में आपकी विंशोत्तरी महादशा मेरे ही अधीन चल रही है, इसलिए मेरा प्रभाव जीवन में सर्वाधिक प्रत्यक्ष है।`);
      } else if (data.dashaContext.isCurrentAntardasha) {
        p4Sentences.push(`वर्तमान समय में मेरी अंतर्दशा सक्रिय है, जो मेरे भाव और कारकत्व को उद्घाटित कर रही है।`);
      } else if (data.dashaContext.mahadashaStartDate && data.dashaContext.mahadashaEndDate) {
        p4Sentences.push(`विंशोत्तरी दशा चक्र में मेरा प्रमुख महादशा काल निर्धारित समय पर जाग्रत होता है।`);
      }
      p4Sentences.push(`ज्योतिष भाग्य का बंधन नहीं, आत्म-ज्ञान का दर्पण है। मेरी ऊर्जा को जागरूकता और विवेक के साथ संतुलित करें।`);
      paragraphs.push({ title: p4Title, text: p4Sentences.join(' ') });
      sentences.push(...p4Sentences);

    } else {
      // English script
      const p1Title = 'Cosmic Opening & Astronomical Placement';
      const p1Sentences: string[] = [
        `I am ${data.nameEn}.`,
        `In your birth chart, I reside in the ${data.houseLabel}, in the sign of ${data.rashiName || 'Unavailable'}, at ${data.degreeFormatted}, within ${data.nakshatraName || 'Unavailable'} Nakshatra${data.pada ? ` Pada ${data.pada}` : ''}.`,
        `My motion is ${data.isRetrograde ? 'Retrograde (Vakri)' : 'Direct (Margi)'}.`
      ];
      if (data.isCombust) p1Sentences.push('Being close to the Sun, my astronomical status is Combust.');
      if (data.vargottama) p1Sentences.push('Occupying identical signs in both D1 and D9 Navamsha, I am Vargottama.');
      paragraphs.push({ title: p1Title, text: p1Sentences.join(' ') });
      sentences.push(...p1Sentences);

      const p2Title = 'Traditional Significations';
      const p2Sentences: string[] = [
        `In classical Jyotish, I am traditionally associated with ${data.profile.traditionalSignificationsEn}.`,
        `In human consciousness, my archetypes manifest through ${data.profile.traditionalKeywordsEn.slice(0, 5).join(', ')}.`
      ];
      paragraphs.push({ title: p2Title, text: p2Sentences.join(' ') });
      sentences.push(...p2Sentences);

      const p3Title = 'Chart Relationships & Aspects';
      const p3Sentences: string[] = [
        `In your specific chart, my placement is interpreted through this foundation:`,
        data.rashiLord ? `My sign lord is ${getLocalizedPlanet(data.rashiLord, 'en')}.` : '',
        data.nakshatraLord ? `My Nakshatra lord is ${getLocalizedPlanet(data.nakshatraLord, 'en')}.` : '',
        data.dignity !== 'None' ? `My celestial dignity is ${data.dignity}.` : ''
      ].filter(Boolean);

      if (data.conjunctions.length > 0) {
        p3Sentences.push(`I share this house in conjunction with ${data.conjunctions.join(' and ')}.`);
      }
      if (data.aspectsReceived.length > 0) {
        p3Sentences.push(`I receive aspects from ${data.aspectsReceived.join(', ')}.`);
      }
      if (data.aspectsGiven.length > 0) {
        p3Sentences.push(`I cast my aspects upon ${data.aspectsGiven.join(' and ')}.`);
      }
      paragraphs.push({ title: p3Title, text: p3Sentences.join(' ') });
      sentences.push(...p3Sentences);

      const p4Title = 'Dasha Resonance & Wisdom';
      const p4Sentences: string[] = [];
      if (data.dashaContext.isCurrentMahadasha) {
        p4Sentences.push(`You are currently living under my Vimshottari Mahadasha, making my vibrations directly active.`);
      } else if (data.dashaContext.isCurrentAntardasha) {
        p4Sentences.push(`My Antardasha is currently active, spotlighting my house matters.`);
      }
      p4Sentences.push('Jyotish is not fatalistic bondage, but a mirror of inner awareness. Channel my energies with conscious discernment.');
      paragraphs.push({ title: p4Title, text: p4Sentences.join(' ') });
      sentences.push(...p4Sentences);
    }

    const spokenText = sentences.join(' ');
    return {
      spokenText,
      sentences,
      paragraphs
    };
  }
}
