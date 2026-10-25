/**
 * JeevanDarpan - Classical Dynamic Vedic Hora Engine
 * 
 * Lineage & Shastra Source:
 * - Brihat Parashara Hora Shastra (BPHS), Purva Khanda
 * - Muhurta Chintamani & Kalaprakasika
 * 
 * Deterministic Rules:
 * 1. Dinmaan (दिनमान): Interval between local sunrise and sunset.
 * 2. Ratriman (रात्रिमान): Interval between sunset and next sunrise (24 hours - Dinmaan).
 * 3. 12 Day Horas (दिन होरा): Each equal to Dinmaan / 12 (exact astronomical span).
 * 4. 12 Night Horas (रात्रि होरा): Each equal to Ratriman / 12 (exact astronomical span).
 * 5. Hora Lords Cyclic Order (मन्दादि क्रम / Chaldean order descending):
 *    Sun -> Venus -> Mercury -> Moon -> Saturn -> Jupiter -> Mars -> (repeats)
 * 6. The 1st Hora at Sunrise is governed by the Lord of the Weekday (वारेश).
 *    Subsequent Horas follow the 7-planet cyclic order continuously across day and night.
 */

import { BirthProfile } from '../../types/kundli';
import { VedicHoraItem, VedicHoraDayAnalysis } from '../../types/dailyCompanion';
import { MuhuratPanchangCalculator } from '../muhurat/muhuratPanchangCalculator';

export type HoraPlanetName = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';

// Chaldean descending speed / distance order (मन्दादि क्रम)
export const HORA_CYCLE: HoraPlanetName[] = [
  'Sun',
  'Venus',
  'Mercury',
  'Moon',
  'Saturn',
  'Jupiter',
  'Mars'
];

export const WEEKDAY_LORDS: HoraPlanetName[] = [
  'Sun',      // 0 = Sunday (रविवार)
  'Moon',     // 1 = Monday (सोमवार)
  'Mars',     // 2 = Tuesday (मंगलवार)
  'Mercury',  // 3 = Wednesday (बुधवार)
  'Jupiter',  // 4 = Thursday (गुरुवार)
  'Venus',    // 5 = Friday (शुक्रवार)
  'Saturn'    // 6 = Saturday (शनिवार)
];

export const WEEKDAY_HINDI_NAMES: Record<number, string> = {
  0: 'रविवार (Ravivara)',
  1: 'सोमवार (Somavara)',
  2: 'मंगलवार (Mangalavara)',
  3: 'बुधवार (Budhavara)',
  4: 'गुरुवार (Guruvara)',
  5: 'शुक्रवार (Shukravara)',
  6: 'शनिवार (Shanivara)'
};

export const HORA_PLANET_CONFIG: Record<HoraPlanetName, {
  hindi: string;
  lordHindi: string;
  nature: 'Shubha' | 'Madhyam' | 'Ashubha';
  natureHindi: string;
  recommendedActivitiesHindi: string;
  recommendedActivitiesEnglish: string;
  cautionHindi: string;
  color: string;
}> = {
  Sun: {
    hindi: 'सूर्य (Surya)',
    lordHindi: 'सूर्य देव',
    nature: 'Madhyam',
    natureHindi: 'मध्यम / तेजस्वी',
    recommendedActivitiesHindi: 'राजकीय कार्य, सरकारी आवेदन, उच्चाधिकारियों से भेंट, स्वास्थ्य साधना, पदभार ग्रहण, प्रतिष्ठा कार्य',
    recommendedActivitiesEnglish: 'Government matters, leadership, executive meetings, vital health routines, administration',
    cautionHindi: 'अहंकार, क्रोध, कटु वाणी और सौम्य रिश्तों में अनावश्यक तनाव से बचें',
    color: '#f59e0b'
  },
  Venus: {
    hindi: 'शुक्र (Shukra)',
    lordHindi: 'शुक्र देव',
    nature: 'Shubha',
    natureHindi: 'परम शुभ / सौम्य',
    recommendedActivitiesHindi: 'वस्त्र, आभूषण, वाहन क्रय, कला, संगीत, नवीन व्यावसायिक संबंध, गृह सज्जा, सौन्दर्य प्रसाधन',
    recommendedActivitiesEnglish: 'Creativity, luxury, arts, partnerships, travel, diplomacy, purchases',
    cautionHindi: 'अति-व्यय, विलासिता में समय का अपव्यय और वासनाजन्य भ्रम से बचें',
    color: '#ec4899'
  },
  Mercury: {
    hindi: 'बुध (Budha)',
    lordHindi: 'बुध देव',
    nature: 'Shubha',
    natureHindi: 'शुभ / बौद्धिक',
    recommendedActivitiesHindi: 'व्यापार, शेयर बाजार/निवेश, अध्ययन, लेखन, लेखा (Accounts), अनुबंध व दस्तावेज हस्ताक्षर, संचार',
    recommendedActivitiesEnglish: 'Trading, writing, documentation, intellect, mathematics, agreements',
    cautionHindi: 'द्विधा व अनिर्णय से बचें, अनुबंध की शर्तें बिना पढ़े हस्ताक्षर न करें',
    color: '#10b981'
  },
  Moon: {
    hindi: 'चन्द्र (Chandra)',
    lordHindi: 'चन्द्र देव',
    nature: 'Shubha',
    natureHindi: 'अति शुभ / शांति',
    recommendedActivitiesHindi: 'नवीन कार्य का प्रारंभ, यात्रा, जल/पेय संबंधित कार्य, माता की सेवा, कला, ध्यान, पारिवारिक मेल-मिलाप',
    recommendedActivitiesEnglish: 'New beginnings, travel, domestic harmony, arts, intuition, public relations',
    cautionHindi: 'भावुकता में बहकर अस्थिर या आवेगपूर्ण वित्तीय निर्णय न लें',
    color: '#38bdf8'
  },
  Saturn: {
    hindi: 'शनि (Shani)',
    lordHindi: 'शनि देव',
    nature: 'Ashubha',
    natureHindi: 'कठिन / अनुशासनात्मक',
    recommendedActivitiesHindi: 'भूमि, कृषि, तेल/खनिज, कड़ा शारीरिक श्रम, अनुशासन, गहन चिंतन, सेवा कार्य, पुरानी समस्याओं का समाधान',
    recommendedActivitiesEnglish: 'Discipline, physical labor, land/mining, persistence, charity to laborers',
    cautionHindi: 'मांगलिक कार्य, विवाह वार्ता, नवीन निवेश और महत्वपूर्ण यात्रा से बचें',
    color: '#6366f1'
  },
  Jupiter: {
    hindi: 'गुरु / बृहस्पति (Guru)',
    lordHindi: 'बृहस्पति देव',
    nature: 'Shubha',
    natureHindi: 'सर्वोत्तम शुभ / अमृत',
    recommendedActivitiesHindi: 'विद्यारंभ, पूजा-पाठ, विवाह चर्चा, गुरु दर्शन, बैंक/ऋण कार्य, न्याय, दान, नवीन उद्यम स्थापना',
    recommendedActivitiesEnglish: 'Education, spirituality, auspicious ceremonies, high finance, guidance',
    cautionHindi: 'अहंकार, अति-आशावादिता और गुरुजनों की सलाह की अनदेखी से बचें',
    color: '#eab308'
  },
  Mars: {
    hindi: 'मंगल (Mangala)',
    lordHindi: 'मंगल देव',
    nature: 'Ashubha',
    natureHindi: 'क्रूर / साहसिक',
    recommendedActivitiesHindi: 'साहसिक कार्य, खेल, तकनीक/मशीनरी, शल्य चिकित्सा, भूमि क्रय-विक्रय, कानूनी वाद-विवाद निस्तारण',
    recommendedActivitiesEnglish: 'Courage, surgery, sports, engineering, legal battles, land transactions',
    cautionHindi: 'क्रोध, वाहन की तेज गति, कटु तर्क-वितर्क और जल्दबाजी में चोट से बचें',
    color: '#ef4444'
  }
};

/**
 * Formats a decimal hour (e.g. 6.35) into "HH:mm" (24-hour clock string)
 */
function formatDecimalToTime(decimalHours: number): string {
  const normalized = ((decimalHours % 24) + 24) % 24;
  const h = Math.floor(normalized);
  const m = Math.floor((normalized - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Parses "HH:mm" string into decimal hours
 */
function parseTimeToDecimal(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  return h + m / 60.0;
}

export class HoraEngine {
  /**
   * Evaluates the 24 Dynamic Vedic Horas strictly tailored to local Sunrise and Sunset
   */
  public static calculateVedicHoras(
    profile: BirthProfile,
    targetDate: Date = new Date(),
    overrideTimezone?: string
  ): VedicHoraDayAnalysis {
    const lat = profile.latitude ?? 22.7196; // Default Indore, MP
    const lon = profile.longitude ?? 75.8577;
    const tz = overrideTimezone || profile.timezone || 'Asia/Kolkata';

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 1. Calculate Astronomical Solar Times (Sunrise & Sunset)
    const solarTimes = MuhuratPanchangCalculator.calculateSolarTimes(dateStr, lat, lon, tz);
    const sunriseDecimal = parseTimeToDecimal(solarTimes.sunrise);
    const sunsetDecimal = parseTimeToDecimal(solarTimes.sunset);

    // 2. Dinmaan (दिनमान) & Ratriman (रात्रिमान) in exact decimal hours
    let dinmaanHours = sunsetDecimal - sunriseDecimal;
    if (dinmaanHours <= 0) {
      dinmaanHours += 24; // Polar safety fallback
    }
    const ratrimanHours = 24.0 - dinmaanHours;

    const dayHoraSpan = dinmaanHours / 12.0;
    const nightHoraSpan = ratrimanHours / 12.0;

    // 3. Weekday and Day Lord (वारेश)
    const weekdayIdx = targetDate.getDay();
    const dayLord = WEEKDAY_LORDS[weekdayIdx];
    const weekdayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekdayIdx];
    const weekdayHindi = WEEKDAY_HINDI_NAMES[weekdayIdx];

    // Starting index in Chaldean order
    const startCycleIdx = HORA_CYCLE.indexOf(dayLord);

    // 4. Current time comparison for isCurrent detection
    const now = new Date();
    const isTargetToday = now.getFullYear() === year && now.getMonth() + 1 === month && now.getDate() === day;
    const nowDecimal = now.getHours() + now.getMinutes() / 60.0 + now.getSeconds() / 3600.0;

    const horas: VedicHoraItem[] = [];
    let currentHoraIndex = 0;

    // Generate 24 Horas
    for (let i = 0; i < 24; i++) {
      const isDayHora = i < 12;
      const horaNumber = i + 1;
      const lord = HORA_CYCLE[(startCycleIdx + i) % 7];
      const config = HORA_PLANET_CONFIG[lord];

      let startDec: number;
      let endDec: number;
      let spanHours: number;

      if (isDayHora) {
        spanHours = dayHoraSpan;
        startDec = sunriseDecimal + i * dayHoraSpan;
        endDec = sunriseDecimal + (i + 1) * dayHoraSpan;
      } else {
        const nightIdx = i - 12;
        spanHours = nightHoraSpan;
        startDec = sunsetDecimal + nightIdx * nightHoraSpan;
        endDec = sunsetDecimal + (nightIdx + 1) * nightHoraSpan;
      }

      const startTimeStr = formatDecimalToTime(startDec);
      const endTimeStr = formatDecimalToTime(endDec);
      const durationMinutes = Math.round(spanHours * 60);

      // Check if current time falls within this hora
      let isCurrent = false;
      if (isTargetToday) {
        // Normalize time range
        const sNorm = ((startDec % 24) + 24) % 24;
        const eNorm = ((endDec % 24) + 24) % 24;

        if (sNorm < eNorm) {
          isCurrent = nowDecimal >= sNorm && nowDecimal < eNorm;
        } else {
          // Crosses midnight
          isCurrent = nowDecimal >= sNorm || nowDecimal < eNorm;
        }

        if (isCurrent) {
          currentHoraIndex = i;
        }
      }

      horas.push({
        horaNumber,
        periodType: isDayHora ? 'Day' : 'Night',
        periodTypeHindi: isDayHora ? 'दिन होरा' : 'रात्रि होरा',
        lord,
        lordHindi: config.hindi,
        startTime: startTimeStr,
        endTime: endTimeStr,
        durationMinutes,
        nature: config.nature,
        natureHindi: config.natureHindi,
        recommendedActivitiesHindi: config.recommendedActivitiesHindi,
        recommendedActivitiesEnglish: config.recommendedActivitiesEnglish,
        cautionHindi: config.cautionHindi,
        isCurrent
      });
    }

    // Format Dinmaan & Ratriman in Hindi
    const dinmaanH = Math.floor(dinmaanHours);
    const dinmaanM = Math.round((dinmaanHours - dinmaanH) * 60);
    const ratrimanH = Math.floor(ratrimanHours);
    const ratrimanM = Math.round((ratrimanHours - ratrimanH) * 60);

    return {
      date: dateStr,
      weekday: weekdayName,
      weekdayHindi,
      dayLord,
      dayLordHindi: HORA_PLANET_CONFIG[dayLord].lordHindi,
      sunrise: solarTimes.sunrise,
      sunset: solarTimes.sunset,
      dinmaanFormatted: `${dinmaanH} घंटे ${dinmaanM} मिनट`,
      ratrimanFormatted: `${ratrimanH} घंटे ${ratrimanM} मिनट`,
      dayHoraDurationMinutes: Math.round(dayHoraSpan * 60),
      nightHoraDurationMinutes: Math.round(nightHoraSpan * 60),
      currentHoraIndex,
      horas
    };
  }
}
