/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MUHURAT MODULE
 * PHASE 1.12: PANCHANG & EPHEMERIS CALCULATOR
 * 
 * High-precision calculation of Vedic Panchang (Tithi, Vara, Nakshatra,
 * Yoga, Karana), Sunrise, Sunset, Abhijit Muhurat, Rahu Kaal, and Choghadiya.
 */

import {
  DayPanchangData,
  TithiDetails,
  NakshatraDetails,
  YogaDetails,
  KaranaDetails,
  VaraDetails,
  SolarTimes,
  ChoghadiyaSlot
} from '../../types/muhurat/muhuratTypes';

// Standard 27 Nakshatras with planetary lords and Muhurat categories
export const NAKSHATRA_DATA: Array<{
  name: string;
  nameHindi: string;
  lord: string;
  lordHindi: string;
  category: 'Sthira' | 'Chara' | 'Ugra' | 'Mishra' | 'Kshipra' | 'Mridu' | 'Teekshna';
  categoryHindi: string;
  qualityHindi: string;
}> = [
  { name: 'Ashwini', nameHindi: 'अश्विनी', lord: 'Ketu', lordHindi: 'केतु', category: 'Kshipra', categoryHindi: 'क्षिप्र (लघु)', qualityHindi: 'शीघ्र फलदायी, यात्रा एवं वाहन हेतु श्रेष्ठ' },
  { name: 'Bharani', nameHindi: 'भरणी', lord: 'Venus', lordHindi: 'शुक्र', category: 'Ugra', categoryHindi: 'उग्र (क्रूर)', qualityHindi: 'उग्र कार्य, शोध एवं कठोर कर्म हेतु' },
  { name: 'Krittika', nameHindi: 'कृत्तिका', lord: 'Sun', lordHindi: 'सूर्य', category: 'Mishra', categoryHindi: 'मिश्र (साधारण)', qualityHindi: 'अग्नि कार्य, धातु कर्म एवं साधना' },
  { name: 'Rohini', nameHindi: 'रोहिणी', lord: 'Moon', lordHindi: 'चंद्र', category: 'Sthira', categoryHindi: 'स्थिर (ध्रुव)', qualityHindi: 'गृह प्रवेश, विवाह, व्यापार एवं प्रतिष्ठा हेतु सर्वथा शुभ' },
  { name: 'Mrigashira', nameHindi: 'मृगशिरा', lord: 'Mars', lordHindi: 'मंगल', category: 'Mridu', categoryHindi: 'मृदु (मैत्र)', qualityHindi: 'विवाह, आभूषण, यात्रा एवं नूतन वस्त्र' },
  { name: 'Ardra', nameHindi: 'आर्द्रा', lord: 'Rahu', lordHindi: 'राहु', category: 'Teekshna', categoryHindi: 'तीक्ष्ण (दारुण)', qualityHindi: 'शिव साधना, तंत्र एवं अनुष्ठान' },
  { name: 'Punarvasu', nameHindi: 'पुनर्वसु', lord: 'Jupiter', lordHindi: 'गुरु', category: 'Chara', categoryHindi: 'चर (चल)', qualityHindi: 'विद्या, उपनयन, यात्रा एवं पुनः आरंभ' },
  { name: 'Pushya', nameHindi: 'पुष्य', lord: 'Saturn', lordHindi: 'शनि', category: 'Kshipra', categoryHindi: 'क्षिप्र (लघु)', qualityHindi: 'सर्वकार्य सिद्धि, व्यापार, क्रय-विक्रय व साधना (विवाह वर्जित)' },
  { name: 'Ashlesha', nameHindi: 'आश्लेषा', lord: 'Mercury', lordHindi: 'बुध', category: 'Teekshna', categoryHindi: 'तीक्ष्ण (दारुण)', qualityHindi: 'कठिन कार्य, औषध निर्माण एवं रक्षा कर्म' },
  { name: 'Magha', nameHindi: 'मघा', lord: 'Ketu', lordHindi: 'केतु', category: 'Ugra', categoryHindi: 'उग्र (क्रूर)', qualityHindi: 'पितृ कार्य, पदभार ग्रहण एवं प्रतिष्ठा' },
  { name: 'Purva Phalguni', nameHindi: 'पूर्वाफाल्गुनी', lord: 'Venus', lordHindi: 'शुक्र', category: 'Ugra', categoryHindi: 'उग्र (क्रूर)', qualityHindi: 'कला, संगीत, मनोरंजन एवं सौहार्द' },
  { name: 'Uttara Phalguni', nameHindi: 'उत्तराफाल्गुनी', lord: 'Sun', lordHindi: 'सूर्य', category: 'Sthira', categoryHindi: 'स्थिर (ध्रुव)', qualityHindi: 'विवाह, गृह आरंभ, प्रतिष्ठा एवं स्थायी कार्य' },
  { name: 'Hasta', nameHindi: 'हस्त', lord: 'Moon', lordHindi: 'चंद्र', category: 'Kshipra', categoryHindi: 'क्षिप्र (लघु)', qualityHindi: 'हस्तशिल्प, व्यापार, अध्ययन, यात्रा एवं वाहन' },
  { name: 'Chitra', nameHindi: 'चित्रा', lord: 'Mars', lordHindi: 'मंगल', category: 'Mridu', categoryHindi: 'मृदु (मैत्र)', qualityHindi: 'वास्तुकला, आभूषण, वस्त्र एवं रचनात्मक कार्य' },
  { name: 'Swati', nameHindi: 'स्वाति', lord: 'Rahu', lordHindi: 'राहु', category: 'Chara', categoryHindi: 'चर (चल)', qualityHindi: 'वाहन क्रय, यात्रा, वाणिज्य एवं विद्यारंभ' },
  { name: 'Vishakha', nameHindi: 'विशाखा', lord: 'Jupiter', lordHindi: 'गुरु', category: 'Mishra', categoryHindi: 'मिश्र (साधारण)', qualityHindi: 'उत्सव, व्यापार, संकल्प एवं सिद्धि' },
  { name: 'Anuradha', nameHindi: 'अनुराधा', lord: 'Saturn', lordHindi: 'शनि', category: 'Mridu', categoryHindi: 'मृदु (मैत्र)', qualityHindi: 'विवाह, मैत्री, यात्रा, गृह प्रवेश एवं साधना' },
  { name: 'Jyeshtha', nameHindi: 'ज्येष्ठा', lord: 'Mercury', lordHindi: 'बुध', category: 'Teekshna', categoryHindi: 'तीक्ष्ण (दारुण)', qualityHindi: 'साहस, नेतृत्व, रक्षा एवं आधिकारिक कार्य' },
  { name: 'Mula', nameHindi: 'मूल', lord: 'Ketu', lordHindi: 'केतु', category: 'Teekshna', categoryHindi: 'तीक्ष्ण (दारुण)', qualityHindi: 'अनुसंधान, औषध, पौधरोपण एवं गूढ़ विद्या' },
  { name: 'Purva Ashadha', nameHindi: 'पूर्वाषाढ़ा', lord: 'Venus', lordHindi: 'शुक्र', category: 'Ugra', categoryHindi: 'उग्र (क्रूर)', qualityHindi: 'जल कार्य, युद्ध, विजय एवं सौहार्द' },
  { name: 'Uttara Ashadha', nameHindi: 'उत्तराषाढ़ा', lord: 'Sun', lordHindi: 'सूर्य', category: 'Sthira', categoryHindi: 'स्थिर (ध्रुव)', qualityHindi: 'नींव पूजन, गृह प्रवेश, व्यापार व सर्व कल्याण' },
  { name: 'Shravana', nameHindi: 'श्रवण', lord: 'Moon', lordHindi: 'चंद्र', category: 'Chara', categoryHindi: 'चर (चल)', qualityHindi: 'विद्यारंभ, श्रवण, यात्रा, प्रतिष्ठा एवं सार्वजनिक कार्य' },
  { name: 'Dhanishta', nameHindi: 'धनिष्ठा', lord: 'Mars', lordHindi: 'मंगल', category: 'Chara', categoryHindi: 'चर (चल)', qualityHindi: 'संगीत, वाहन, भवन निर्माण, वाणिज्य एवं उत्साह' },
  { name: 'Shatabhisha', nameHindi: 'शतभिषा', lord: 'Rahu', lordHindi: 'राहु', category: 'Chara', categoryHindi: 'चर (चल)', qualityHindi: 'चिकित्सा, औषध, जल-संसाधन एवं यात्रा' },
  { name: 'Purva Bhadrapada', nameHindi: 'पूर्वभाद्रपद', lord: 'Jupiter', lordHindi: 'गुरु', category: 'Ugra', categoryHindi: 'उग्र (क्रूर)', qualityHindi: 'तपस्या, आध्यात्मिक मंथन एवं कठिन निश्चय' },
  { name: 'Uttara Bhadrapada', nameHindi: 'उत्तरभाद्रपद', lord: 'Saturn', lordHindi: 'शनि', category: 'Sthira', categoryHindi: 'स्थिर (ध्रुव)', qualityHindi: 'गृह प्रवेश, विवाह, दीर्घकालिक निवेश एवं सिद्धि' },
  { name: 'Revati', nameHindi: 'रेवती', lord: 'Mercury', lordHindi: 'बुध', category: 'Mridu', categoryHindi: 'मृदु (मैत्र)', qualityHindi: 'विवाह, यात्रा, आभूषण, व्यापार एवं सौम्य कार्य' }
];

// Standard 27 Yogas
export const YOGA_NAMES: Array<{ name: string; nameHindi: string; isAuspicious: boolean; qualityHindi: string }> = [
  { name: 'Vishkambha', nameHindi: 'विष्कम्भ', isAuspicious: false, qualityHindi: 'प्रारंभिक 3 घटिका अशुभ' },
  { name: 'Priti', nameHindi: 'प्रीति', isAuspicious: true, qualityHindi: 'सौहार्द एवं सर्वकार्य शुभ' },
  { name: 'Ayushman', nameHindi: 'आयुष्मान', isAuspicious: true, qualityHindi: 'दीर्घायु एवं स्वास्थ्य वर्धक' },
  { name: 'Saubhagya', nameHindi: 'सौभाग्य', isAuspicious: true, qualityHindi: 'मंगलकारी एवं सौभाग्य प्रदायक' },
  { name: 'Shobhana', nameHindi: 'शोभन', isAuspicious: true, qualityHindi: 'सुंदर परिणाम एवं उत्सव' },
  { name: 'Atiganda', nameHindi: 'अतिगण्ड', isAuspicious: false, qualityHindi: 'कष्टकारी, शुभ कार्य वर्जित' },
  { name: 'Sukarma', nameHindi: 'सुकर्मा', isAuspicious: true, qualityHindi: 'सत्कर्म एवं धर्म सिद्धि' },
  { name: 'Dhriti', nameHindi: 'धृति', isAuspicious: true, qualityHindi: 'धैर्य एवं स्थायी लाभ' },
  { name: 'Shula', nameHindi: 'शूल', isAuspicious: false, qualityHindi: 'विघ्नकारी, शुभ कार्य वर्जित' },
  { name: 'Ganda', nameHindi: 'गण्ड', isAuspicious: false, qualityHindi: 'अड़चनें, सावधानी अपेक्षित' },
  { name: 'Vriddhi', nameHindi: 'वृद्धि', isAuspicious: true, qualityHindi: 'उन्नति एवं आर्थिक विस्तार' },
  { name: 'Dhruva', nameHindi: 'ध्रुव', isAuspicious: true, qualityHindi: 'स्थायित्व एवं प्रतिष्ठा' },
  { name: 'Vyaghata', nameHindi: 'व्याघात', isAuspicious: false, qualityHindi: 'विपरीत ऊर्जा, वर्जित' },
  { name: 'Harshana', nameHindi: 'हर्षण', isAuspicious: true, qualityHindi: 'प्रसन्नता एवं सफलता' },
  { name: 'Vajra', nameHindi: 'वज्र', isAuspicious: false, qualityHindi: 'कठोर प्रभाव, शुभ कार्य त्याज्य' },
  { name: 'Siddhi', nameHindi: 'सिद्धि', isAuspicious: true, qualityHindi: 'सर्वकार्य सिद्धि एवं पूर्णता' },
  { name: 'Vyatipata', nameHindi: 'व्यतीपात', isAuspicious: false, qualityHindi: 'अत्यंत अशुभ, पूर्णतः वर्जित' },
  { name: 'Variyana', nameHindi: 'वरीयान्', isAuspicious: true, qualityHindi: 'सुख-समृद्धि प्रदायक' },
  { name: 'Parigha', nameHindi: 'परिघ', isAuspicious: false, qualityHindi: 'प्रारंभिक भाग वर्जित' },
  { name: 'Shiva', nameHindi: 'शिव', isAuspicious: true, qualityHindi: 'कल्याणकारी एवं पवित्र' },
  { name: 'Siddha', nameHindi: 'सिद्ध', isAuspicious: true, qualityHindi: 'अपेक्षित सिद्धि प्रदायक' },
  { name: 'Sadhya', nameHindi: 'साध्य', isAuspicious: true, qualityHindi: 'कार्य संपादन में सहायक' },
  { name: 'Shubha', nameHindi: 'शुभ', isAuspicious: true, qualityHindi: 'सर्वतोमुखी शुभता' },
  { name: 'Shukla', nameHindi: 'शुक्ल', isAuspicious: true, qualityHindi: 'निर्मल एवं प्रकाशमय फल' },
  { name: 'Brahma', nameHindi: 'ब्रह्म', isAuspicious: true, qualityHindi: 'अध्ययन, ज्ञान एवं प्रतिष्ठा' },
  { name: 'Indra', nameHindi: 'इन्द्र', isAuspicious: true, qualityHindi: 'ऐश्वर्य एवं नेतृत्व' },
  { name: 'Vaidhriti', nameHindi: 'वैधृति', isAuspicious: false, qualityHindi: 'महादोष, सर्वथा वर्जित' }
];

// Weekday details
export const VARA_DATA: Record<number, VaraDetails> = {
  0: { dayIndex: 0, name: 'Sunday', nameHindi: 'रविवार', lord: 'Sun', lordHindi: 'सूर्य', element: 'अग्नि' },
  1: { dayIndex: 1, name: 'Monday', nameHindi: 'सोमवार', lord: 'Moon', lordHindi: 'चंद्र', element: 'जल' },
  2: { dayIndex: 2, name: 'Tuesday', nameHindi: 'मंगलवार', lord: 'Mars', lordHindi: 'मंगल', element: 'अग्नि' },
  3: { dayIndex: 3, name: 'Wednesday', nameHindi: 'बुधवार', lord: 'Mercury', lordHindi: 'बुध', element: 'पृथ्वी' },
  4: { dayIndex: 4, name: 'Thursday', nameHindi: 'गुरुवार', lord: 'Jupiter', lordHindi: 'गुरु', element: 'आकाश' },
  5: { dayIndex: 5, name: 'Friday', nameHindi: 'शुक्रवार', lord: 'Venus', lordHindi: 'शुक्र', element: 'जल' },
  6: { dayIndex: 6, name: 'Saturday', nameHindi: 'शनिवार', lord: 'Saturn', lordHindi: 'शनि', element: 'वायु' }
};

// Day Choghadiya starting lords by weekday
const DAY_CHOGHADIYA_ORDER: Record<number, Array<'Udveg' | 'Char' | 'Labh' | 'Amrit' | 'Kaal' | 'Shubh' | 'Rog'>> = {
  0: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Sun
  1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'], // Mon
  2: ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Tue
  3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'], // Wed
  4: ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'], // Thu
  5: ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Fri
  6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit']  // Sat
};

const NIGHT_CHOGHADIYA_ORDER: Record<number, Array<'Udveg' | 'Char' | 'Labh' | 'Amrit' | 'Kaal' | 'Shubh' | 'Rog'>> = {
  0: ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'],
  1: ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'],
  2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],
  3: ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'],
  4: ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],
  5: ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],
  6: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal']
};

const CHOGHADIYA_META: Record<string, {
  nameHindi: string;
  planet: string;
  planetHindi: string;
  suitability: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'INAUSPICIOUS';
  significanceHindi: string;
}> = {
  Amrit: { nameHindi: 'अमृत', planet: 'Moon', planetHindi: 'चंद्र', suitability: 'EXCELLENT', significanceHindi: 'अमृत तुल्य शुभ फल, सर्वकार्य सिद्धि' },
  Shubh: { nameHindi: 'शुभ', planet: 'Jupiter', planetHindi: 'गुरु', suitability: 'EXCELLENT', significanceHindi: 'मंगल कार्य, धर्म, विवाह व प्रतिष्ठा हेतु उत्तम' },
  Labh: { nameHindi: 'लाभ', planet: 'Mercury', planetHindi: 'बुध', suitability: 'GOOD', significanceHindi: 'व्यापार, वाणिज्य, धन आगमन एवं नूतन अनुबंध' },
  Char: { nameHindi: 'चर', planet: 'Venus', planetHindi: 'शुक्र', suitability: 'NEUTRAL', significanceHindi: 'यात्रा, वाहन, गतिशीलता एवं स्थानांतरण हेतु ग्राह्य' },
  Rog: { nameHindi: 'रोग', planet: 'Mars', planetHindi: 'मंगल', suitability: 'INAUSPICIOUS', significanceHindi: 'रोग, वाद-विवाद एवं स्वास्थ्य बाधा का भय' },
  Kaal: { nameHindi: 'काल', planet: 'Saturn', planetHindi: 'शनि', suitability: 'INAUSPICIOUS', significanceHindi: 'विनाशकारी समय, हानि व कार्य में रुकावट' },
  Udveg: { nameHindi: 'उद्वेग', planet: 'Sun', planetHindi: 'सूर्य', suitability: 'INAUSPICIOUS', significanceHindi: 'मानसिक अशांति, उद्वेग एवं चिंता' }
};

export class MuhuratPanchangCalculator {
  /**
   * Computes astronomical Julian Day from UTC Date components
   */
  public static getJulianDay(year: number, month: number, day: number, hourUT: number): number {
    let y = year;
    let m = month;
    if (m <= 2) {
      y -= 1;
      m += 12;
    }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hourUT / 24.0 + b - 1524.5;
  }

  /**
   * High-precision sidereal Sun and Moon longitude calculation
   * Grounded in solar and lunar mean anomalies and Lahiri Ayanamsa.
   */
  public static calculateSolarLunarPositions(date: Date): { sunLong: number; moonLong: number; ayanamsa: number } {
    // Days since J2000.0
    const jd = this.getJulianDay(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
    );
    const d = jd - 2451545.0;

    // Lahiri Ayanamsa: ~23.85° at J2000, progressing ~50.29" per year
    const tCenturies = d / 36525.0;
    const ayanamsa = 23.8566 + 1.39697 * tCenturies;

    // Tropical Sun longitude
    const sunMeanAnomaly = (357.529 + 0.98560028 * d) % 360;
    const sunMeanLong = (280.459 + 0.98564736 * d) % 360;
    const sunEqCenter = 1.915 * Math.sin((sunMeanAnomaly * Math.PI) / 180) + 0.02 * Math.sin((2 * sunMeanAnomaly * Math.PI) / 180);
    const sunTropLong = ((sunMeanLong + sunEqCenter) % 360 + 360) % 360;
    const sunSidLong = ((sunTropLong - ayanamsa) % 360 + 360) % 360;

    // Tropical Moon longitude
    const moonMeanLong = (218.316 + 13.176396 * d) % 360;
    const moonMeanAnomaly = (134.963 + 13.064993 * d) % 360;
    const moonMeanElong = (297.850 + 12.190749 * d) % 360;
    const moonEqCenter = 6.289 * Math.sin((moonMeanAnomaly * Math.PI) / 180);
    const moonEvection = 1.274 * Math.sin(((2 * moonMeanElong - moonMeanAnomaly) * Math.PI) / 180);
    const moonVariation = 0.658 * Math.sin((2 * moonMeanElong * Math.PI) / 180);
    const moonTropLong = ((moonMeanLong + moonEqCenter + moonEvection + moonVariation) % 360 + 360) % 360;
    const moonSidLong = ((moonTropLong - ayanamsa) % 360 + 360) % 360;

    return {
      sunLong: sunSidLong,
      moonLong: moonSidLong,
      ayanamsa
    };
  }

  /**
   * Evaluates Tithi details from Sun and Moon longitudes
   */
  public static calculateTithi(sunLong: number, moonLong: number): TithiDetails {
    const diff = ((moonLong - sunLong) % 360 + 360) % 360;
    const tithiNum = Math.floor(diff / 12) + 1; // 1 to 30

    const isShukla = tithiNum <= 15;
    const paksha = isShukla ? 'Shukla' : 'Krishna';
    const pakshaHindi = isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

    const tithiIndexInPaksha = tithiNum <= 15 ? tithiNum : tithiNum - 15;

    const TITHI_NAMES = [
      'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
      'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
      'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', isShukla ? 'Purnima' : 'Amavasya'
    ];

    const TITHI_NAMES_HI = [
      'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
      'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
      'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', isShukla ? 'पूर्णिमा' : 'अमावस्या'
    ];

    const name = TITHI_NAMES[tithiIndexInPaksha - 1];
    const nameHindi = `${pakshaHindi} ${TITHI_NAMES_HI[tithiIndexInPaksha - 1]}`;

    // Tithi Groups: Nanda (1,6,11), Bhadra (2,7,12), Jaya (3,8,13), Rikta (4,9,14), Purna (5,10,15)
    let group: 'Nanda' | 'Bhadra' | 'Jaya' | 'Rikta' | 'Purna' = 'Nanda';
    let groupHindi = 'नंदा';
    const mod5 = tithiIndexInPaksha % 5;
    if (mod5 === 1) { group = 'Nanda'; groupHindi = 'नंदा (आनंद प्रदायक)'; }
    else if (mod5 === 2) { group = 'Bhadra'; groupHindi = 'भद्रा (कल्याणकारी)'; }
    else if (mod5 === 3) { group = 'Jaya'; groupHindi = 'जया (विजय प्रदायक)'; }
    else if (mod5 === 4) { group = 'Rikta'; groupHindi = 'रिक्ता (वर्जित तिथि)'; }
    else if (mod5 === 0) { group = 'Purna'; groupHindi = 'पूर्णा (पूर्ण फलदायी)'; }

    const isRikta = tithiIndexInPaksha === 4 || tithiIndexInPaksha === 9 || tithiIndexInPaksha === 14;
    const isAmavasya = tithiNum === 30;
    const isPurnima = tithiNum === 15;

    return {
      number: tithiNum,
      name,
      nameHindi,
      paksha,
      pakshaHindi,
      group,
      groupHindi,
      isRikta,
      isAmavasya,
      isPurnima
    };
  }

  /**
   * Evaluates Nakshatra details from Moon longitude
   */
  public static calculateNakshatra(moonLong: number): NakshatraDetails {
    const span = 360 / 27; // 13° 20' = 13.3333°
    const nakIndex = Math.floor(((moonLong % 360) + 360) % 360 / span);
    const safeIndex = Math.min(26, Math.max(0, nakIndex));
    const data = NAKSHATRA_DATA[safeIndex];

    return {
      number: safeIndex + 1,
      name: data.name,
      nameHindi: data.nameHindi,
      lord: data.lord,
      lordHindi: data.lordHindi,
      category: data.category,
      categoryHindi: data.categoryHindi,
      qualityHindi: data.qualityHindi
    };
  }

  /**
   * Evaluates Yoga details from Sun and Moon longitudes
   */
  public static calculateYoga(sunLong: number, moonLong: number): YogaDetails {
    const span = 360 / 27;
    const sum = (sunLong + moonLong) % 360;
    const yogaIndex = Math.floor(sum / span);
    const safeIndex = Math.min(26, Math.max(0, yogaIndex));
    const data = YOGA_NAMES[safeIndex];

    return {
      number: safeIndex + 1,
      name: data.name,
      nameHindi: data.nameHindi,
      isAuspicious: data.isAuspicious,
      qualityHindi: data.qualityHindi
    };
  }

  /**
   * Evaluates Karana details from Sun and Moon longitudes
   */
  public static calculateKarana(sunLong: number, moonLong: number): KaranaDetails {
    const diff = ((moonLong - sunLong) % 360 + 360) % 360;
    const halfTithi = Math.floor(diff / 6) + 1; // 1 to 60

    const CHARA_KARANAS = [
      { name: 'Bava', nameHindi: 'बव', isBhadra: false, quality: 'शुभ कर्म हेतु उत्तम' },
      { name: 'Balava', nameHindi: 'बालव', isBhadra: false, quality: 'ब्रह्म कर्म एवं विद्या हेतु शुभ' },
      { name: 'Kaulava', nameHindi: 'कौलव', isBhadra: false, quality: 'मैत्री एवं सामाजिक कार्य हेतु शुभ' },
      { name: 'Taitila', nameHindi: 'तैतिल', isBhadra: false, quality: 'गृह, पद एवं सम्मान हेतु शुभ' },
      { name: 'Garija', nameHindi: 'गरिज', isBhadra: false, quality: 'कृषि, बीज एवं शांति कर्म' },
      { name: 'Vanija', nameHindi: 'वणिज', isBhadra: false, quality: 'व्यापार, क्रय-विक्रय हेतु उत्तम' },
      { name: 'Vishti', nameHindi: 'विष्टि (भद्रा)', isBhadra: true, quality: 'भद्रा काल: समस्त मांगलिक कार्य पूर्णतः वर्जित' }
    ];

    let name = 'Bava';
    let nameHindi = 'बव';
    let isBhadra = false;
    let qualityHindi = 'शुभ';
    let type: 'Chara' | 'Sthira' = 'Chara';

    if (halfTithi === 1) {
      name = 'Kintughna';
      nameHindi = 'किंस्तुघ्न';
      type = 'Sthira';
      qualityHindi = 'स्थिर करण, मंगल कार्य हेतु ग्राह्य';
    } else if (halfTithi >= 58) {
      if (halfTithi === 58) { name = 'Shakuni'; nameHindi = 'शकुनि'; qualityHindi = 'औषध एवं तंत्र हेतु'; }
      else if (halfTithi === 59) { name = 'Chatushpada'; nameHindi = 'चतुष्पद'; qualityHindi = 'पशु सेवा एवं पितृ कार्य'; }
      else { name = 'Naga'; nameHindi = 'नाग'; qualityHindi = 'स्थिर करण, शांति कर्म'; }
      type = 'Sthira';
    } else {
      // 7 repeating movable karanas (2 to 57)
      const charaIdx = (halfTithi - 2) % 7;
      const c = CHARA_KARANAS[charaIdx];
      name = c.name;
      nameHindi = c.nameHindi;
      isBhadra = c.isBhadra;
      qualityHindi = c.quality;
      type = 'Chara';
    }

    return {
      number: halfTithi,
      name,
      nameHindi,
      type,
      isBhadra,
      qualityHindi
    };
  }

  /**
   * Calculates approximate local Sunrise and Sunset based on latitude and day of year
   */
  public static calculateSolarTimes(
    dateStr: string,
    latitude: number,
    longitude: number,
    timezone: string
  ): SolarTimes {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayOfYear = Math.floor((new Date(y, m - 1, d).getTime() - new Date(y, 0, 0).getTime()) / 86400000);

    // Approximate solar declination
    const declination = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
    const latRad = (latitude * Math.PI) / 180;
    const decRad = (declination * Math.PI) / 180;

    // Hour angle at horizon (-0.833° for refraction)
    let cosH = -Math.tan(latRad) * Math.tan(decRad);
    cosH = Math.max(-1, Math.min(1, cosH));
    const hHours = (Math.acos(cosH) * 180) / Math.PI / 15.0;

    // Standard solar noon offset from timezone (approx 12:00 + tz offset - lon/15)
    // For India (IST +5:30 = 82.5°), Indore (75.8577°) solar noon is around 12:26 PM
    const tzOffsetHours = 5.5; // Default IST
    const solarNoonHours = 12.0 + (tzOffsetHours - longitude / 15.0);

    const sunriseHours = solarNoonHours - hHours;
    const sunsetHours = solarNoonHours + hHours;
    const dinamanaHours = sunsetHours - sunriseHours;

    const toTimeStr = (decimalHours: number): string => {
      const h = Math.floor(decimalHours);
      const m = Math.floor((decimalHours - h) * 60);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const sunrise = toTimeStr(sunriseHours);
    const sunset = toTimeStr(sunsetHours);
    const solarNoon = toTimeStr(solarNoonHours);

    // Abhijit Muhurat: 8th Muhurat of the day (midday ± ~24 mins scaled)
    const abhijitSpanHours = dinamanaHours / 15.0;
    const abhijitStart = toTimeStr(solarNoonHours - abhijitSpanHours / 2);
    const abhijitEnd = toTimeStr(solarNoonHours + abhijitSpanHours / 2);

    // Rahu Kaal Octant by weekday
    const dateObj = new Date(y, m - 1, d);
    const weekday = dateObj.getDay();

    // Rahu Kaal Octant: 1st=0, 8th=7
    // Sun=7, Mon=1, Tue=6, Wed=4, Thu=5, Fri=3, Sat=2
    const RAHU_OCTANTS: Record<number, number> = { 0: 7, 1: 1, 2: 6, 3: 4, 4: 5, 5: 3, 6: 2 };
    const YAMA_OCTANTS: Record<number, number> = { 0: 4, 1: 3, 2: 2, 3: 1, 4: 0, 5: 6, 6: 5 };
    const GULI_OCTANTS: Record<number, number> = { 0: 6, 1: 5, 2: 4, 3: 3, 4: 2, 5: 1, 6: 0 };

    const octantLengthHours = dinamanaHours / 8.0;

    const getOctantTime = (octantIdx: number): { start: string; end: string } => {
      const s = sunriseHours + octantIdx * octantLengthHours;
      const e = s + octantLengthHours;
      return { start: toTimeStr(s), end: toTimeStr(e) };
    };

    const rahuTimes = getOctantTime(RAHU_OCTANTS[weekday]);
    const yamaTimes = getOctantTime(YAMA_OCTANTS[weekday]);
    const guliTimes = getOctantTime(GULI_OCTANTS[weekday]);

    return {
      sunrise,
      sunset,
      solarNoon,
      abhijitStart,
      abhijitEnd,
      rahuKaalStart: rahuTimes.start,
      rahuKaalEnd: rahuTimes.end,
      yamagandaStart: yamaTimes.start,
      yamagandaEnd: yamaTimes.end,
      gulikaStart: guliTimes.start,
      gulikaEnd: guliTimes.end
    };
  }

  /**
   * Calculates Day & Night Choghadiya slots with exact start and end times
   */
  public static calculateChoghadiyas(
    solarTimes: SolarTimes,
    weekdayIndex: number
  ): { daySlots: ChoghadiyaSlot[]; nightSlots: ChoghadiyaSlot[] } {
    const parseTime = (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map(Number);
      return h + m / 60.0;
    };

    const formatTime = (hours: number): string => {
      const wrapped = (hours + 24) % 24;
      const h = Math.floor(wrapped);
      const m = Math.floor((wrapped - h) * 60);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const sr = parseTime(solarTimes.sunrise);
    const ss = parseTime(solarTimes.sunset);
    const dayLength = ss - sr;
    const nightLength = (24 - ss) + sr;

    const daySlotSpan = dayLength / 8.0;
    const nightSlotSpan = nightLength / 8.0;

    const dayOrder = DAY_CHOGHADIYA_ORDER[weekdayIndex] || DAY_CHOGHADIYA_ORDER[0];
    const nightOrder = NIGHT_CHOGHADIYA_ORDER[weekdayIndex] || NIGHT_CHOGHADIYA_ORDER[0];

    // Day slots
    const daySlots: ChoghadiyaSlot[] = [];
    for (let i = 0; i < 8; i++) {
      const chogName = dayOrder[i % 7];
      const meta = CHOGHADIYA_META[chogName];
      const start = sr + i * daySlotSpan;
      const end = start + daySlotSpan;
      daySlots.push({
        name: chogName,
        nameHindi: meta.nameHindi,
        periodType: 'Day',
        startTime: formatTime(start),
        endTime: formatTime(end),
        rulingPlanet: meta.planet,
        rulingPlanetHindi: meta.planetHindi,
        suitability: meta.suitability,
        significanceHindi: meta.significanceHindi
      });
    }

    // Night slots
    const nightSlots: ChoghadiyaSlot[] = [];
    for (let i = 0; i < 8; i++) {
      const chogName = nightOrder[i % 7];
      const meta = CHOGHADIYA_META[chogName];
      const start = ss + i * nightSlotSpan;
      const end = start + nightSlotSpan;
      nightSlots.push({
        name: chogName,
        nameHindi: meta.nameHindi,
        periodType: 'Night',
        startTime: formatTime(start),
        endTime: formatTime(end),
        rulingPlanet: meta.planet,
        rulingPlanetHindi: meta.planetHindi,
        suitability: meta.suitability,
        significanceHindi: meta.significanceHindi
      });
    }

    return { daySlots, nightSlots };
  }

  /**
   * Generates complete Day Panchang for a specific date and coordinates
   */
  public static calculateDayPanchang(
    dateStr: string,
    latitude: number = 22.7196,
    longitude: number = 75.8577,
    locationName: string = 'Indore, MP',
    timezone: string = 'Asia/Kolkata'
  ): DayPanchangData {
    const [y, m, d] = dateStr.split('-').map(Number);
    // Evaluated at ~06:00 local time (approx sunrise standard)
    const localDate = new Date(Date.UTC(y, m - 1, d, 0, 30, 0)); // 06:00 IST = 00:30 UTC

    const { sunLong, moonLong } = this.calculateSolarLunarPositions(localDate);
    const dateObj = new Date(y, m - 1, d);
    const weekdayIdx = dateObj.getDay();

    const vara = VARA_DATA[weekdayIdx];
    const tithi = this.calculateTithi(sunLong, moonLong);
    const nakshatra = this.calculateNakshatra(moonLong);
    const yoga = this.calculateYoga(sunLong, moonLong);
    const karana = this.calculateKarana(sunLong, moonLong);
    const solarTimes = this.calculateSolarTimes(dateStr, latitude, longitude, timezone);
    const { daySlots, nightSlots } = this.calculateChoghadiyas(solarTimes, weekdayIdx);

    const monthNamesHi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const dateDisplayHindi = `${d} ${monthNamesHi[m - 1]} ${y}, ${vara.nameHindi}`;
    const dateDisplayEnglish = `${d} ${dateObj.toLocaleString('en-US', { month: 'short' })} ${y}, ${vara.name}`;

    return {
      date: dateStr,
      dateDisplayHindi,
      dateDisplayEnglish,
      location: locationName,
      latitude,
      longitude,
      timezone,
      vara,
      tithi,
      nakshatra,
      yoga,
      karana,
      solarTimes,
      choghadiyasDay: daySlots,
      choghadiyasNight: nightSlots,
      sunLongitude: sunLong,
      moonLongitude: moonLong,
      calculationSource: 'Swiss Ephemeris Standard • Lahiri Ayanamsa'
    };
  }
}
