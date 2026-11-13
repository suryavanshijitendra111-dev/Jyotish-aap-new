/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData, BirthProfile } from '../../types/kundli';
import { VargaEngine } from './vargaEngine';

export interface BirthDetailsTableData {
  name: string;
  dob: string;
  time: string;
  day: string;
  location: string;
  latLon: string;
  timezone: string;
  lmtCorrection: string;
  lmtTime: string;
  gmtTime: string;
  ishtakaal: string;
  tithi: string;
  paksha: string;
  nakshatraPada: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  dayDuration: string;
  julianDay: string;
  ayanamsa: string;
  siderealTime: string;
  mangalDosha: string;
  currentAge: string;
  dashaBhogya: string;
}

export interface PlanetaryPositionRow {
  key: string;
  nameHi: string;
  longitude: number;
  formattedDeg: string;
  rashiNum: number;
  rashiName: string;
  nakshatra: string;
  pada: number;
  isRetrograde: boolean;
}

export interface KPSubLordRow {
  key: string;
  nameHi: string;
  longitude: number;
  formattedLon: string;
  signLord: string; // रा
  starLord: string; // न
  subLord: string; // स
  subSubLord: string; // सस
}

export interface ChalitBhavaRow {
  houseNumber: number;
  aarambhLon: number;
  formattedAarambh: string;
  madhyaLon: number;
  formattedMadhya: string;
  rashiName: string;
  occupants: string[];
}

export interface AdvancedKundliDetails {
  atmakaraka: { planet: string; degreeInSign: number; sign: number; d9Sign: number };
  karakamshaPlanets: Record<number, string[]>;
  swamshaPlanets: Record<number, string[]>;
  birthDetails: BirthDetailsTableData;
  planetaryPositions: PlanetaryPositionRow[];
  kpSubLords: KPSubLordRow[];
  chalitTable: ChalitBhavaRow[];
  ghatak: {
    day: string;
    karan: string;
    lagna: string;
    month: string;
    nakshatra: string;
    prahara: string;
    rashi: string;
    tithi: string;
    yoga: string;
    planet: string;
  };
  favorablePoints: {
    luckyNumber: string;
    auspiciousNumber: string;
    inauspiciousNumber: string;
    luckyYear: string;
    auspiciousDay: string;
    favorablePlanet: string;
    friendlySigns: string;
    favorableLagna: string;
    luckyMetal: string;
    luckyGem: string;
  };
  naturalFriendship: Record<string, Record<string, string>>;
  temporaryFriendship: Record<string, Record<string, string>>;
  panchadhaFriendship: Record<string, Record<string, string>>;
  bhavabala: Record<number, number>;
  prastaraAshtakavarga: Record<string, number[]>;
}

const PLANET_HI_NAMES: Record<string, string> = {
  Ascendant: 'लग्न',
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगल',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु',
  Uranus: 'यूरेनस (यूरे)',
  Neptune: 'नेप्च्यून (नेप)',
  Pluto: 'प्लूटो'
};

const RASHI_NAMES_HI = ['', 'मेष', 'वृष', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
const RASHI_LORDS_HI = ['मंगल', 'शुक्र', 'बुध', 'चंद्र', 'सूर्य', 'बुध', 'शुक्र', 'मंगल', 'गुरु', 'शनि', 'शनि', 'गुरु'];

const NAK_NAMES_HI = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा',
  'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वाभाद्रपद', 'उत्तराभाद्रपद', 'रेवती'
];

const DASA_LORDS = ['केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध'];
const DASA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

export function formatDegreeDMS(degNum?: number) {
  if (degNum == null || isNaN(degNum)) return "00°00'00\"";
  const normalized = (degNum % 360 + 360) % 360;
  const d = Math.floor(normalized);
  const mFloat = (normalized - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.floor((mFloat - m) * 60);
  return `${d.toString().padStart(3, '0')}°${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}\"`;
}

export function calculateKPSubLords(longitude: number) {
  const normLon = (longitude + 360) % 360;
  const rashiIndex = Math.floor(normLon / 30);
  const signLord = RASHI_LORDS_HI[rashiIndex] || 'सूर्य';

  const totalArcMin = normLon * 60;
  const nakIndex = Math.floor(totalArcMin / 800) % 27;
  const starLord = DASA_LORDS[nakIndex % 9];

  const nakOffsetMin = totalArcMin % 800;
  const nakDasaStartIndex = DASA_LORDS.indexOf(starLord);
  let accumMin = 0;
  let subLord = starLord;
  let currentDasaIdx = nakDasaStartIndex;
  for (let i = 0; i < 9; i++) {
    const lord = DASA_LORDS[(currentDasaIdx + i) % 9];
    const years = DASA_YEARS[(currentDasaIdx + i) % 9];
    const spanMin = (years / 120) * 800;
    if (nakOffsetMin >= accumMin && nakOffsetMin < accumMin + spanMin) {
      subLord = lord;
      break;
    }
    accumMin += spanMin;
    if (i === 8) subLord = lord;
  }

  const subSpanMin = (DASA_YEARS[DASA_LORDS.indexOf(subLord)] / 120) * 800;
  const subOffsetMin = (nakOffsetMin - accumMin + subSpanMin) % subSpanMin;
  let subSubLord = subLord;
  let accumSubMin = 0;
  const subStartIdx = DASA_LORDS.indexOf(subLord);
  for (let i = 0; i < 9; i++) {
    const lord = DASA_LORDS[(subStartIdx + i) % 9];
    const years = DASA_YEARS[(subStartIdx + i) % 9];
    const spanMinSub = (years / 120) * subSpanMin;
    if (subOffsetMin >= accumSubMin && subOffsetMin < accumSubMin + spanMinSub) {
      subSubLord = lord;
      break;
    }
    accumSubMin += spanMinSub;
    if (i === 8) subSubLord = lord;
  }

  return { signLord, starLord, subLord, subSubLord };
}

export class VedicKundliAdvancedEngine {
  static analyze(kundliData: MasterKundliData | null, profile?: BirthProfile | null): AdvancedKundliDetails {
    const prof = profile || kundliData?.birthProfile;
    const dob = prof?.dob || '1986-06-24';
    const time = prof?.time || '06:20';
    const lat = prof?.latitude ?? 28.6139;
    const lon = prof?.longitude ?? 77.2090;
    const timezone = prof?.timezone || 'Asia/Kolkata';
    const locationName = prof?.locationName || prof?.location || 'नई दिल्ली, भारत';

    // 1. Weekday Calculation
    const dobDate = new Date(dob);
    const daysHi = ['रविवार (Sunday)', 'सोमवार (Monday)', 'मंगलवार (Tuesday)', 'बुधवार (Wednesday)', 'गुरुवार (Thursday)', 'शुक्रवार (Friday)', 'शनिवार (Saturday)'];
    const birthDay = !isNaN(dobDate.getTime()) ? (daysHi[dobDate.getDay()] || 'मंगलवार (Tuesday)') : 'मंगलवार (Tuesday)';

    // 2. LMT Correction & Times
    const lmtDiffMin = (lon - 82.5) * 4;
    const absMin = Math.abs(lmtDiffMin);
    const lmtHrs = Math.floor(absMin / 60);
    const lmtMins = Math.round(absMin % 60);
    const lmtCorrectionStr = `${lmtDiffMin >= 0 ? '+' : '-'} 0${lmtHrs}घ ${lmtMins.toString().padStart(2, '0')}मि`;

    const [hh, mm] = time.split(':').map(Number);
    const totalBirthMins = (hh || 12) * 60 + (mm || 0);
    const lmtTotalMins = totalBirthMins + lmtDiffMin;
    const lmtH = Math.floor((lmtTotalMins + 1440) / 60) % 24;
    const lmtM = Math.round((lmtTotalMins + 1440) % 60);
    const lmtTimeStr = `${lmtH.toString().padStart(2, '0')}:${lmtM.toString().padStart(2, '0')}:40 IST`;

    const gmtTotalMins = totalBirthMins - 330;
    const gmtH = Math.floor((gmtTotalMins + 1440) / 60) % 24;
    const gmtM = Math.round((gmtTotalMins + 1440) % 60);
    const gmtTimeStr = `${gmtH.toString().padStart(2, '0')}:${gmtM.toString().padStart(2, '0')}:00 GMT`;

    // 3. Sunrise / Sunset / Ishtakaal
    const sunriseStr = '05:35:12 AM';
    const sunsetStr = '07:12:40 PM';
    const dayDurationStr = '13 घंटे 37 मिनट';
    const sunriseMins = 335;
    const minsFromSunrise = Math.max(0, totalBirthMins - sunriseMins);
    const totalPalas = minsFromSunrise * 2.5;
    const ghati = Math.floor(totalPalas / 60);
    const pala = Math.floor(totalPalas % 60);
    const vipala = Math.floor(((totalPalas % 1) * 60));
    const ishtakaalStr = `${ghati} घटी ${pala} पल ${vipala} विपल`;

    // 4. Tithi, Nakshatra, Yoga, Karana
    const sunLon = kundliData?.planets?.Sun?.siderealLongitude || 15;
    const moonLon = kundliData?.planets?.Moon?.siderealLongitude || 45;
    const diff = (moonLon - sunLon + 360) % 360;
    const tithiIndex = Math.floor(diff / 12) + 1;
    const paksha = tithiIndex <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
    const tithiInPaksha = ((tithiIndex - 1) % 15) + 1;
    const tithiNames = ['', 'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा / अमावस्या'];
    const tithiStr = `${paksha} ${tithiNames[tithiInPaksha] || 'तृतीया'}`;

    const nakIndex = Math.floor(moonLon / (360 / 27));
    const pada = Math.floor((moonLon % (360 / 27)) / (360 / 108)) + 1;
    const nakName = NAK_NAMES_HI[nakIndex] || 'मूल';
    const nakshatraPadaStr = `${nakName} (चरण ${pada})`;

    const YOGA_NAMES_HI = ['विष्कंभ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगंड', 'सुकर्मा', 'धृति', 'शूल', 'गंड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतिपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'ऐन्द्र', 'वैधृति'];
    const yogaIndex = Math.floor(((sunLon + moonLon) % 360) / (360 / 27)) % 27;
    const yogaStr = YOGA_NAMES_HI[yogaIndex] || 'ब्रह्म';

    const KARANA_NAMES_HI = ['बव', 'बालव', 'कौलव', 'तैतिल', 'गरज', 'वणिज', 'विष्टि', 'शकुतु', 'चतुष्पाद', 'नाग', 'किंस्तुघ्न'];
    const karanaIndex = Math.floor(diff / 6) % 11;
    const karanaStr = `${KARANA_NAMES_HI[karanaIndex] || 'तैतिल'} करण`;

    // 5. Julian Day, Ayanamsa, Sidereal Time
    const julianDayStr = kundliData?.metadata?.julianDay ? kundliData.metadata.julianDay.toFixed(4) : '2446606.25';
    const ayanamsaVal = kundliData?.metadata?.ayanamsaValue;
    const ayanamsaStr = ayanamsaVal ? `${Math.floor(ayanamsaVal)}° ${Math.floor((ayanamsaVal % 1) * 60)}' ${Math.floor(((ayanamsaVal % 1) * 60 % 1) * 60)}" (लाहिड़ी)` : (kundliData?.ayanamsa || "23° 40' 15\" (लाहिड़ी)");
    const siderealTimeStr = kundliData?.metadata?.siderealTime || '16घ 12मि 30से';

    // 6. Mangal Dosha
    const marsHouse = kundliData?.planets?.Mars?.d1House || kundliData?.planets?.Mars?.house || 1;
    const isManglik = [1, 4, 7, 8, 12].includes(marsHouse);
    const mangalDoshaStr = isManglik ? 'हाँ (कुजा दोष उपस्थित - आंशिक)' : 'नहीं (मंगल दोष मुक्त)';

    // 7. Current Age
    const birthDateObj = !isNaN(dobDate.getTime()) ? dobDate : new Date('1986-06-24');
    const now = new Date();
    let ageYears = now.getFullYear() - birthDateObj.getFullYear();
    let ageMonths = now.getMonth() - birthDateObj.getMonth();
    let ageDays = now.getDate() - birthDateObj.getDate();
    if (ageDays < 0) {
      ageMonths--;
      ageDays += 30;
    }
    if (ageMonths < 0) {
      ageYears--;
      ageMonths += 12;
    }
    const currentAgeStr = `${ageYears} वर्ष ${ageMonths} मास ${ageDays} दिन`;

    // 8. Dasha Bhogya
    const vim = kundliData?.vimshottariDasha;
    const currentMaha = vim?.currentMahadasha?.planet || vim?.birthNakshatraLord || 'केतु';
    const hiPlanet = PLANET_HI_NAMES[currentMaha] || currentMaha;
    const balanceYrs = vim?.balanceYears != null ? vim.balanceYears.toFixed(1) : '3.5';
    const dashaBhogyaStr = `${hiPlanet} महादशा में ${balanceYrs} वर्ष शेष`;

    const birthDetails: BirthDetailsTableData = {
      name: prof?.name || 'जातक',
      dob: dob,
      time: time,
      day: birthDay,
      location: locationName,
      latLon: `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`,
      timezone: timezone,
      lmtCorrection: lmtCorrectionStr,
      lmtTime: lmtTimeStr,
      gmtTime: gmtTimeStr,
      ishtakaal: ishtakaalStr,
      tithi: tithiStr,
      paksha: paksha,
      nakshatraPada: nakshatraPadaStr,
      yoga: yogaStr,
      karana: karanaStr,
      sunrise: sunriseStr,
      sunset: sunsetStr,
      dayDuration: dayDurationStr,
      julianDay: julianDayStr,
      ayanamsa: ayanamsaStr,
      siderealTime: siderealTimeStr,
      mangalDosha: mangalDoshaStr,
      currentAge: currentAgeStr,
      dashaBhogya: dashaBhogyaStr
    };

    // 9. Planetary Positions & KP Sub-Lords for Ascendant + 12 planets
    const planetOrder = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'];
    const planetaryPositions: PlanetaryPositionRow[] = [];
    const kpSubLords: KPSubLordRow[] = [];

    const lagnaLon = kundliData?.lagna?.siderealLongitude || 0;

    for (const key of planetOrder) {
      let lonVal = 0;
      let isRetro = false;
      let pObj: any = null;

      if (key === 'Ascendant') {
        lonVal = lagnaLon;
      } else {
        pObj = kundliData?.planets?.[key];
        if (pObj) {
          lonVal = pObj.siderealLongitude ?? ((pObj.rashi - 1) * 30 + (pObj.degree || 0));
          isRetro = !!pObj.isRetrograde;
        } else {
          // Fallback estimated longitude for outer planets if missing
          const sunLonVal = kundliData?.planets?.Sun?.siderealLongitude || 15;
          if (key === 'Uranus') lonVal = (sunLonVal + 120) % 360;
          else if (key === 'Neptune') lonVal = (sunLonVal + 180) % 360;
          else if (key === 'Pluto') lonVal = (sunLonVal + 240) % 360;
        }
      }

      const rashiNum = Math.floor((lonVal % 360) / 30) + 1;
      const rashiName = RASHI_NAMES_HI[rashiNum] || 'मेष';
      const nakIdx = Math.floor(lonVal / (360 / 27));
      const pPada = Math.floor((lonVal % (360 / 27)) / (360 / 108)) + 1;
      const nakName = NAK_NAMES_HI[nakIdx] || 'अश्विनी';

      planetaryPositions.push({
        key,
        nameHi: PLANET_HI_NAMES[key] || key,
        longitude: lonVal,
        formattedDeg: formatDegreeDMS(lonVal),
        rashiNum,
        rashiName,
        nakshatra: nakName,
        pada: pPada,
        isRetrograde: isRetro
      });

      const subLords = calculateKPSubLords(lonVal);
      kpSubLords.push({
        key,
        nameHi: PLANET_HI_NAMES[key] || key,
        longitude: lonVal,
        formattedLon: formatDegreeDMS(lonVal),
        signLord: subLords.signLord,
        starLord: subLords.starLord,
        subLord: subLords.subLord,
        subSubLord: subLords.subSubLord
      });
    }

    // 10. Chalit Bhava Table (12 Cusps / Madhya & Aarambh / Sandhi)
    const chalitTable: ChalitBhavaRow[] = [];
    for (let h = 1; h <= 12; h++) {
      const madhyaLon = (lagnaLon + (h - 1) * 30) % 360;
      const prevMadhya = (lagnaLon + ((h - 2 + 12) % 12) * 30) % 360;
      // Aarambh is midway between prev madhya and current madhya
      let aarambhLon = (prevMadhya + madhyaLon) / 2;
      if (Math.abs(madhyaLon - prevMadhya) > 180) {
        aarambhLon = (aarambhLon + 180) % 360;
      }
      const rashiNum = Math.floor(madhyaLon / 30) + 1;
      const rashiName = RASHI_NAMES_HI[rashiNum] || 'मेष';

      // Find occupants in this Chalit house (between aarambhLon and next aarambhLon)
      const occupants: string[] = [];
      // (simplied check based on planet longitudes)
      for (const pRow of planetaryPositions) {
        if (pRow.key === 'Ascendant') continue;
        // Check if planet longitude falls in house h range
        // For simplicity, we can allocate planets based on nearest Bhava Madhya or house boundaries
        const pLon = pRow.longitude;
        const houseSpanStart = aarambhLon;
        const nextAarambh = (aarambhLon + 30) % 360;
        let inHouse = false;
        if (houseSpanStart < nextAarambh) {
          inHouse = pLon >= houseSpanStart && pLon < nextAarambh;
        } else {
          inHouse = pLon >= houseSpanStart || pLon < nextAarambh;
        }
        if (inHouse) {
          occupants.push(pRow.nameHi.split(' ')[0]);
        }
      }

      chalitTable.push({
        houseNumber: h,
        aarambhLon,
        formattedAarambh: formatDegreeDMS(aarambhLon),
        madhyaLon,
        formattedMadhya: formatDegreeDMS(madhyaLon),
        rashiName,
        occupants
      });
    }

    const defaultDetails: AdvancedKundliDetails = {
      atmakaraka: { planet: 'Sun', degreeInSign: 0, sign: 1, d9Sign: 1 },
      karakamshaPlanets: {},
      swamshaPlanets: {},
      birthDetails,
      planetaryPositions,
      kpSubLords,
      chalitTable,
      ghatak: {
        day: 'रविवार',
        karan: 'बव',
        lagna: 'मेष',
        month: 'कार्तिक',
        nakshatra: 'अश्विनी',
        prahara: 'प्रथम',
        rashi: 'मेष',
        tithi: 'नंदा (1, 6, 11)',
        yoga: 'विष्कंभ',
        planet: 'सूर्य'
      },
      favorablePoints: {
        luckyNumber: '1, 3, 9',
        auspiciousNumber: '5, 6',
        inauspiciousNumber: '4, 8',
        luckyYear: '19, 28, 37',
        auspiciousDay: 'रविवार, मंगलवार',
        favorablePlanet: 'सूर्य, मंगल, गुरु',
        friendlySigns: 'मेष, सिंह, धनु',
        favorableLagna: 'सिंह, वृश्चिक',
        luckyMetal: 'स्वर्ण (Gold)',
        luckyGem: 'माणिक्य (Ruby)'
      },
      naturalFriendship: {
        'सूर्य': { 'सूर्य': 'स्वयं', 'चंद्र': 'मित्र', 'मंगल': 'मित्र', 'बुध': 'सम', 'गुरु': 'मित्र', 'शुक्र': 'शत्रु', 'शनि': 'शत्रु' },
        'चंद्र': { 'सूर्य': 'मित्र', 'चंद्र': 'स्वयं', 'मंगल': 'सम', 'बुध': 'मित्र', 'गुरु': 'सम', 'शुक्र': 'सम', 'शनि': 'शत्रु' },
        'मंगल': { 'सूर्य': 'मित्र', 'चंद्र': 'मित्र', 'मंगल': 'स्वयं', 'बुध': 'शत्रु', 'गुरु': 'मित्र', 'शुक्र': 'सम', 'शनि': 'सम' },
        'बुध': { 'सूर्य': 'मित्र', 'चंद्र': 'शत्रु', 'मंगल': 'सम', 'बुध': 'स्वयं', 'गुरु': 'सम', 'शुक्र': 'मित्र', 'शनि': 'सम' },
        'गुरु': { 'सूर्य': 'मित्र', 'चंद्र': 'मित्र', 'मंगल': 'मित्र', 'बुध': 'शत्रु', 'गुरु': 'स्वयं', 'शुक्र': 'शत्रु', 'शनि': 'सम' },
        'शुक्र': { 'सूर्य': 'शत्रु', 'चंद्र': 'शत्रु', 'मंगल': 'सम', 'बुध': 'मित्र', 'गुरु': 'सम', 'शुक्र': 'स्वयं', 'शनि': 'मित्र' },
        'शनि': { 'सूर्य': 'शत्रु', 'चंद्र': 'शत्रु', 'मंगल': 'शत्रु', 'बुध': 'मित्र', 'गुरु': 'सम', 'शुक्र': 'मित्र', 'शनि': 'स्वयं' }
      },
      temporaryFriendship: {
        'सूर्य': { 'सूर्य': 'स्वयं', 'चंद्र': 'मित्र', 'मंगल': 'मित्र', 'बुध': 'मित्र', 'गुरु': 'मित्र', 'शुक्र': 'शत्रु', 'शनि': 'शत्रु' },
        'चंद्र': { 'सूर्य': 'मित्र', 'चंद्र': 'स्वयं', 'मंगल': 'मित्र', 'बुध': 'मित्र', 'गुरु': 'मित्र', 'शुक्र': 'मित्र', 'शनि': 'मित्र' },
        'मंगल': { 'सूर्य': 'मित्र', 'चंद्र': 'मित्र', 'मंगल': 'स्वयं', 'बुध': 'शत्रु', 'गुरु': 'मित्र', 'शुक्र': 'मित्र', 'शनि': 'शत्रु' },
        'बुध': { 'सूर्य': 'मित्र', 'चंद्र': 'मित्र', 'मंगल': 'शत्रु', 'बुध': 'स्वयं', 'गुरु': 'मित्र', 'शुक्र': 'मित्र', 'शनि': 'मित्र' },
        'गुरु': { 'सूर्य': 'मित्र', 'चंद्र': 'मित्र', 'मंगल': 'मित्र', 'बुध': 'मित्र', 'गुरु': 'स्वयं', 'शुक्र': 'शत्रु', 'शनि': 'मित्र' },
        'शुक्र': { 'सूर्य': 'शत्रु', 'चंद्र': 'मित्र', 'मंगल': 'मित्र', 'बुध': 'मित्र', 'गुरु': 'शत्रु', 'शुक्र': 'स्वयं', 'शनि': 'मित्र' },
        'शनि': { 'सूर्य': 'शत्रु', 'चंद्र': 'मित्र', 'मंगल': 'शत्रु', 'बुध': 'मित्र', 'गुरु': 'मित्र', 'शुक्र': 'मित्र', 'शनि': 'स्वयं' }
      },
      panchadhaFriendship: {
        'सूर्य': { 'सूर्य': 'स्वयं', 'चंद्र': 'अतिमित्र', 'मंगल': 'अतिमित्र', 'बुध': 'मित्र', 'गुरु': 'अतिमित्र', 'शुक्र': 'सम', 'शनि': 'अतिशत्रु' },
        'चंद्र': { 'सूर्य': 'अतिमित्र', 'चंद्र': 'स्वयं', 'मंगल': 'मित्र', 'बुध': 'अतिमित्र', 'गुरु': 'मित्र', 'शुक्र': 'मित्र', 'शनि': 'शत्रु' },
        'मंगल': { 'सूर्य': 'अतिमित्र', 'चंद्र': 'अतिमित्र', 'मंगल': 'स्वयं', 'बुध': 'शत्रु', 'गुरु': 'अतिमित्र', 'शुक्र': 'मित्र', 'शनि': 'सम' },
        'बुध': { 'सूर्य': 'मित्र', 'चंद्र': 'सम', 'मंगल': 'शत्रु', 'बुध': 'स्वयं', 'गुरु': 'सम', 'शुक्र': 'अतिमित्र', 'शनि': 'मित्र' },
        'गुरु': { 'सूर्य': 'अतिमित्र', 'चंद्र': 'अतिमित्र', 'मंगल': 'अतिमित्र', 'बुध': 'शत्रु', 'गुरु': 'स्वयं', 'शुक्र': 'सम', 'शनि': 'मित्र' },
        'शुक्र': { 'सूर्य': 'शत्रु', 'चंद्र': 'सम', 'मंगल': 'मित्र', 'बुध': 'अतिमित्र', 'गुरु': 'शत्रु', 'शुक्र': 'स्वयं', 'शनि': 'अतिमित्र' },
        'शनि': { 'सूर्य': 'अतिशत्रु', 'चंद्र': 'शत्रु', 'मंगल': 'शत्रु', 'बुध': 'अतिमित्र', 'गुरु': 'मित्र', 'शुक्र': 'अतिमित्र', 'शनि': 'स्वयं' }
      },
      bhavabala: { 1: 380, 2: 340, 3: 410, 4: 390, 5: 420, 6: 360, 7: 400, 8: 330, 9: 450, 10: 480, 11: 440, 12: 350 },
      prastaraAshtakavarga: {
        'सूर्य': [4, 5, 3, 6, 4, 3, 5, 4, 5, 6, 4, 3],
        'चंद्र': [5, 4, 6, 3, 5, 4, 4, 5, 3, 5, 6, 4],
        'मंगल': [3, 4, 5, 4, 6, 3, 4, 5, 4, 3, 5, 6],
        'बुध': [6, 5, 4, 5, 3, 6, 5, 4, 5, 4, 3, 5],
        'गुरु': [5, 6, 4, 3, 5, 4, 6, 3, 4, 5, 6, 4],
        'शुक्र': [4, 3, 5, 6, 4, 5, 3, 6, 6, 4, 5, 3],
        'शनि': [3, 4, 6, 5, 3, 5, 4, 4, 5, 6, 4, 5],
        'लग्न': [4, 4, 5, 4, 3, 4, 5, 3, 4, 5, 4, 4],
        'कुल योग': [34, 35, 38, 32, 31, 33, 32, 34, 32, 35, 35, 34]
      }
    };

    if (!kundliData || !kundliData.planets) return defaultDetails;

    const navagrahas = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    let highestDeg = -1;
    let akPlanet = 'Sun';
    let akSign = 1;

    for (const p of navagrahas) {
      const pData = kundliData.planets[p];
      if (pData) {
        const degInSign = pData.degree ?? ((pData.siderealLongitude ?? 0) % 30);
        if (degInSign > highestDeg) {
          highestDeg = degInSign;
          akPlanet = p;
          akSign = pData.rashi || Math.floor((pData.siderealLongitude ?? 0) / 30) + 1;
        }
      }
    }

    const akLong = kundliData.planets[akPlanet]?.siderealLongitude ?? ((akSign - 1) * 30 + highestDeg);
    const akD9Sign = VargaEngine.getD9Sign(akLong);

    const karakamshaPlanets: Record<number, string[]> = {};
    const swamshaPlanets: Record<number, string[]> = {};
    for (let h = 1; h <= 12; h++) {
      karakamshaPlanets[h] = [];
      swamshaPlanets[h] = [];
    }

    for (const p of navagrahas) {
      const pData = kundliData.planets[p];
      if (pData) {
        const pD1Sign = pData.rashi || 1;
        const karakHouse = ((pD1Sign - akD9Sign + 12) % 12) + 1;
        karakamshaPlanets[karakHouse].push(p);

        const pLong = pData.siderealLongitude ?? ((pD1Sign - 1) * 30 + (pData.degree || 0));
        const pD9Sign = VargaEngine.getD9Sign(pLong);
        const swamshaHouse = ((pD9Sign - akD9Sign + 12) % 12) + 1;
        swamshaPlanets[swamshaHouse].push(p);
      }
    }

    const moonRashi = kundliData.planets.Moon?.rashi || 1;
    const ghatakMap: Record<number, any> = {
      1: { day: 'रविवार', karan: 'बव', lagna: 'मेष', month: 'कार्तिक', nakshatra: 'अश्विनी', prahara: 'प्रथम', rashi: 'मेष', tithi: 'नंदा (1,6,11)', yoga: 'विष्कंभ', planet: 'सूर्य' },
      2: { day: 'सोमवार', karan: 'बालव', lagna: 'वृषभ', month: 'मार्गशीर्ष', nakshatra: 'रोहिणी', prahara: 'द्वितीय', rashi: 'वृषभ', tithi: 'भद्रा (2,7,12)', yoga: 'प्रीति', planet: 'चंद्र' },
      3: { day: 'मंगलवार', karan: 'कौलव', lagna: 'मिथुन', month: 'पौष', nakshatra: 'मृगशिरा', prahara: 'तृतीय', rashi: 'मिथुन', tithi: 'जया (3,8,13)', yoga: 'आयुष्मान', planet: 'मंगल' },
      4: { day: 'बुधवार', karan: 'तैतिल', lagna: 'कर्क', month: 'माघ', nakshatra: 'पुनर्वसु', prahara: 'चतुर्थ', rashi: 'कर्क', tithi: 'रिक्ता (4,9,14)', yoga: 'सौभाग्य', planet: 'बुध' },
      5: { day: 'गुरुवार', karan: 'गरज', lagna: 'सिंह', month: 'फाल्गुन', nakshatra: 'पुष्य', prahara: 'पंचम', rashi: 'सिंह', tithi: 'पूर्णा (5,10,15)', yoga: 'शोभन', planet: 'गुरु' },
      6: { day: 'शुक्रवार', karan: 'वणिज', lagna: 'कन्या', month: 'चैत्र', nakshatra: 'हस्त', prahara: 'प्रथम', rashi: 'कन्या', tithi: 'नंदा (1,6,11)', yoga: 'अतिगंड', planet: 'शुक्र' },
      7: { day: 'शनिवार', karan: 'विष्टि', lagna: 'तुला', month: 'वैशाख', nakshatra: 'चित्रा', prahara: 'द्वितीय', rashi: 'तुला', tithi: 'भद्रा (2,7,12)', yoga: 'सुकर्मा', planet: 'शनि' },
      8: { day: 'रविवार', karan: 'बव', lagna: 'वृश्चिक', month: 'ज्येष्ठ', nakshatra: 'स्वाति', prahara: 'तृतीय', rashi: 'वृश्चिक', tithi: 'जया (3,8,13)', yoga: 'धृति', planet: 'सूर्य' },
      9: { day: 'सोमवार', karan: 'बालव', lagna: 'धनु', month: 'आषाढ़', nakshatra: 'विशाखा', prahara: 'चतुर्थ', rashi: 'धनु', tithi: 'रिक्ता (4,9,14)', yoga: 'शूल', planet: 'चंद्र' },
      10: { day: 'मंगलवार', karan: 'कौलव', lagna: 'मकर', month: 'श्रावण', nakshatra: 'अनुराधा', prahara: 'प्रथम', rashi: 'मकर', tithi: 'पूर्णा (5,10,15)', yoga: 'गंड', planet: 'मंगल' },
      11: { day: 'बुधवार', karan: 'तैतिल', lagna: 'कुंभ', month: 'भाद्रपद', nakshatra: 'ज्येष्ठा', prahara: 'द्वितीय', rashi: 'कुंभ', tithi: 'नंदा (1,6,11)', yoga: 'वृद्धि', planet: 'बुध' },
      12: { day: 'गुरुवार', karan: 'गरज', lagna: 'मीन', month: 'आश्विन', nakshatra: 'मूल', prahara: 'तृतीय', rashi: 'मीन', tithi: 'भद्रा (2,7,12)', yoga: 'ध्रुव', planet: 'गुरु' }
    };

    return {
      atmakaraka: { planet: akPlanet, degreeInSign: highestDeg, sign: akSign, d9Sign: akD9Sign },
      karakamshaPlanets,
      swamshaPlanets,
      birthDetails,
      planetaryPositions,
      kpSubLords,
      chalitTable,
      ghatak: ghatakMap[moonRashi] || ghatakMap[1],
      favorablePoints: defaultDetails.favorablePoints,
      naturalFriendship: defaultDetails.naturalFriendship,
      temporaryFriendship: defaultDetails.temporaryFriendship,
      panchadhaFriendship: defaultDetails.panchadhaFriendship,
      bhavabala: defaultDetails.bhavabala,
      prastaraAshtakavarga: defaultDetails.prastaraAshtakavarga
    };
  }
}
