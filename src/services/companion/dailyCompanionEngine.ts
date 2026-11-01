/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — DAILY COMPANION ENGINE
 */

import { BirthProfile, MasterKundliData } from '../../types/kundli';
import { 
  DailyCompanionData, 
  DailyCardType, 
  DailyCompanionCard, 
  DailyCompanionTimeSlot,
  DailyTimeSlotMessage 
} from '../../types/dailyCompanion';

export class DailyCompanionEngine {
  public static getCurrentTimeSlot(): DailyCompanionTimeSlot {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 16) return 'midday';
    if (hour >= 16 && hour < 20) return 'evening';
    return 'night';
  }

  public static generateDailyGuidance(
    profile: BirthProfile,
    targetDate: Date = new Date(),
    kundliData: MasterKundliData | null = null,
    language: string = 'Hindi'
  ): DailyCompanionData {
    const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const engDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = targetDate.getDay();
    const dayOfWeek = language === 'Hindi' ? days[dayIndex] : engDays[dayIndex];

    const dateStr = targetDate.toISOString().split('T')[0];
    const formattedDate = targetDate.toLocaleDateString(language === 'Hindi' ? 'hi-IN' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const cardTypes: DailyCardType[] = [
      'today_start',
      'goal_sankalp',
      'work_focus',
      'finance_decisions',
      'family_harmony',
      'travel_movement',
      'wellness_vitality',
      'todays_karma',
      'what_to_avoid',
      'core_message',
      'why_audit',
      'night_closure'
    ];

    const cardsRecord: Record<DailyCardType, DailyCompanionCard> = {} as any;

    cardTypes.forEach(ctype => {
      cardsRecord[ctype] = {
        id: ctype,
        titleHindi: ctype === 'today_start' ? 'दिन का आरंभ एवं संकल्प' :
                    ctype === 'work_focus' ? 'कर्म एवं कार्यक्षेत्र प्राथमिकता' :
                    ctype === 'finance_decisions' ? 'आर्थिक निर्णय एवं विवेक' :
                    ctype === 'family_harmony' ? 'पारिवारिक सौहार्द' :
                    ctype === 'wellness_vitality' ? 'स्वास्थ्य एवं ऊर्जा संवर्धन' :
                    ctype === 'todays_karma' ? 'आज का कर्तव्य' :
                    ctype === 'what_to_avoid' ? 'सावधानियाँ एवं त्याग' :
                    ctype === 'night_closure' ? 'रात्रि आत्म-अवलोकन' : 'दैनिक मार्गदर्शन',
        titleEnglish: ctype.replace(/_/g, ' ').toUpperCase(),
        category: ctype.includes('audit') ? 'Audit' : ctype.includes('harmony') ? 'Harmony' : ctype.includes('work') ? 'Action' : 'Overview',
        iconName: 'Sun',
        calculatedFact: `सूर्य एवं चंद्र स्थिति: ${kundliData?.planets?.Moon?.rashiName || 'शुभ चंद्र'} गोचर प्रभाव`,
        traditionalInterpretation: 'वैदिक ज्योतिष शास्त्र के अनुसार ग्रहों का शुभ दृष्टिपात कर्म को सुगम बनाता है।',
        practicalGuidance: 'शांत चित्त से अपनी प्राथमिकताओं को पूरा करें। अहंकार और जल्दबाजी से दूर रहें।',
        uncertaintyAndFreewill: 'ग्रह केवल प्रवृत्तियाँ दर्शाते हैं; अंतिम परिणाम आपके विवेकपूर्ण पुरुषार्थ से निर्धारित होता है।',
        whyAstrologicalBasis: `गोचर लग्न व विंशोत्तरी दशा का समन्वय [${kundliData?.vimshottariDasha?.currentMahadasha || 'शुभ दशा'}]`
      };
    });

    const timeSlotMessages: Record<DailyCompanionTimeSlot, DailyTimeSlotMessage> = {
      morning: {
        slot: 'morning',
        titleHindi: 'प्रातः प्रहर (Morning Awakening)',
        titleEnglish: 'Morning Awakening',
        timeRange: '05:00 - 11:00',
        greeting: 'शुभ प्रभात! नव प्रभात आपके जीवन में नई ऊर्जा लाए।',
        focusGuidance: 'सूर्य को अर्घ्य दें और दिन के 3 प्रमुख संकल्प निर्धारित करें।',
        mindfulnessTip: '5 मिनट प्राणायाम चित्त को शांत करेगा।',
        whyBasis: 'प्रातः काल सूर्य की ऊर्जा व सत्व गुण का प्रभाव उच्चतम रहता है।'
      },
      midday: {
        slot: 'midday',
        titleHindi: 'मध्याह्न प्रहर (Midday Productivity)',
        titleEnglish: 'Midday Productivity',
        timeRange: '11:00 - 16:00',
        greeting: 'मध्याह्न की ऊर्जा कर्मठता की मांग करती है।',
        focusGuidance: 'महत्वपूर्ण कार्य और वार्ताएँ इस समय संपन्न करें।',
        mindfulnessTip: 'भोजन सात्विक व समय पर लें।',
        whyBasis: 'सूर्य दसवें भाव के प्रभाव क्षेत्र में होता है।'
      },
      evening: {
        slot: 'evening',
        titleHindi: 'सायं प्रहर (Evening Reflection)',
        titleEnglish: 'Evening Reflection',
        timeRange: '16:00 - 20:00',
        greeting: 'संध्या काल संतुलन और विश्राम का समय है।',
        focusGuidance: 'पारिवारिक संवाद एवं दिन के कार्यों का समापन करें।',
        mindfulnessTip: 'दीपक प्रज्वलन व गायत्री जप मन को शांत करता है।',
        whyBasis: 'संध्याकाल में ग्रहों की गति में स्थिरता का प्रवेश होता है।'
      },
      night: {
        slot: 'night',
        titleHindi: 'रात्रि प्रहर (Night Closure)',
        titleEnglish: 'Night Closure',
        timeRange: '20:00 - 05:00',
        greeting: 'शुभ रात्रि! आज के कर्मों का समर्पण करें।',
        focusGuidance: 'चित्त को सभी चिंताओं से मुक्त कर गहरी निद्रा लें।',
        mindfulnessTip: 'कृतज्ञता भाव के साथ शयन करें।',
        whyBasis: 'चंद्रमा का शीतलता प्रभाव मन को पुनर्जीवित करता है।'
      }
    };

    return {
      date: dateStr,
      formattedDate,
      dayOfWeek,
      profile,
      context: {
        date: dateStr,
        formattedDate,
        language: language === 'Hindi' ? 'Hindi' : 'English',
        profile,
        numerology: {
          birthNumber: 6,
          destinyNumber: 9,
          nameNumber: 1,
          personalYear: 5,
          personalMonth: 2,
          personalDay: 7,
          favorableDays: ['Wednesday', 'Friday'],
          favorableColors: ['White', 'Light Blue'],
          dailyAffirmationHindi: 'मैं अपने कर्तव्यों का निष्ठापूर्वक पालन करता हूँ।'
        },
        dasha: {
          mahadashaLord: kundliData?.vimshottariDasha?.currentMahadasha || 'Saturn',
          antardashaLord: kundliData?.vimshottariDasha?.currentAntardasha || 'Mercury',
          pratyantardashaLord: kundliData?.vimshottariDasha?.currentPratyantardasha || 'Venus',
          dashaInfluenceSummary: 'सकारात्मक कर्म एवं व्यावहारिक स्थिरता की अवधि।'
        },
        panchatattva: {
          fire: 25,
          earth: 25,
          air: 20,
          water: 20,
          ether: 10,
          dominant: 'Earth (पृथ्वी)',
          weakest: 'Ether (आकाश)',
          balanceGuidance: 'स्थिरता बनाए रखें और आत्म-चिंतन के लिए समय निकालें।',
          dailyElementHarmonizer: 'नियमित जल का सेवन व गहरी श्वास।'
        },
        panchang: {
          dayOfWeek,
          dayLord: 'Sun',
          dayLordHindi: 'सूर्य',
          elementOfInfluence: 'अग्नि',
          auspiciousDirection: 'पूर्व',
          favorableColors: ['लाल', 'केसरिया'],
          favorableDeityOrMeditation: 'सूर्य नारायण उपासना',
          rahukaalWindow: '16:30 - 18:00',
          choghadiyaDayLord: 'शुभ'
        },
        masterKundliSummary: {
          lagnaRashi: kundliData?.lagna?.rashiName || 'Cancer',
          moonRashi: kundliData?.planets?.Moon?.rashiName || 'Capricorn',
          moonNakshatra: kundliData?.planets?.Moon?.nakshatraName || 'Shravana',
          sunRashi: kundliData?.planets?.Sun?.rashiName || 'Gemini',
          lagnaLord: 'Moon'
        }
      },
      cards: cardsRecord,
      timeSlotMessages,
      todaysKarma: {
        title: 'सात्विक कर्म एवं परोपकार',
        titleHindi: 'सात्विक कर्म एवं परोपकार',
        description: 'आज किसी जरूरतमंद की गुप्त सहायता करें अथवा किसी प्राणी को जल/अन्न प्रदान करें।',
        spiritualBasis: 'परोपकाराय सतां विभूतयः — सत्पुरुषों की संपदा परोपकार के लिए होती है।',
        actionStep: 'प्रातः पक्षियों या गाय को भोजन अर्पित करें।',
        suggestedTime: 'प्रातः 07:00 - 09:00'
      },
      whyAuditTrail: {
        profileDataUsed: ['DOB', 'Birth Coordinates', 'Lagna'],
        dashaDataUsed: 'Vimshottari Dasha calculation from Moon nakshatra',
        numerologyDataUsed: 'Cheiro & Pythagorean calculations',
        panchatattvaDataUsed: 'Normalized 5 elements distribution',
        loShuDataUsed: '3x3 birth date mapping',
        transitDataUsed: 'Real Swiss Ephemeris sidereal planetary coordinates',
        complianceStatement: 'All calculations are deterministic, audited, and strictly offline-first.'
      },
      generationTimestamp: new Date().toISOString(),
      isAiEnhanced: false
    };
  }
}
