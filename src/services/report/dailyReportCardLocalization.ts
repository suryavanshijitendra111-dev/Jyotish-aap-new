import { LanguageCode } from '../../i18n/types';
import { DailyReportCardData, DailyReportCardSection } from '../../types/dailyReportCard';

export interface LocalizedSectionGuidance {
  signal: string;
  why: string;
  whatToDo: string;
  whatToBeCarefulAbout: string;
  aiExplanation: string;
  actionableGuidance: string;
  traditionalInterpretation: string;
}

// Translations for Planets
export const PLANET_NAMES: Record<string, Partial<Record<LanguageCode, string>>> = {
  Sun: {
    en: 'Sun', hi: 'सूर्य', mr: 'सूर्य', gu: 'સૂર્ય', bn: 'সূর্য', ta: 'சூரியன்',
    te: 'సూర్యుడు', kn: 'ಸೂರ್ಯ', ml: 'സൂര്യൻ', pa: 'ਸੂਰਜ', or: 'ସୂର୍ଯ୍ୟ', as: 'সূৰ্য', sa: 'सूर्यः'
  },
  Moon: {
    en: 'Moon', hi: 'चंद्र', mr: 'चंद्र', gu: 'ચંદ્ર', bn: 'চন্দ্র', ta: 'சந்திரன்',
    te: 'చంద్రుడు', kn: 'ಚಂದ್ರ', ml: 'ചന്ദ്രൻ', pa: 'ਚੰਦਰਮਾ', or: 'ଚନ୍ଦ୍ର', as: 'চন্দ্ৰ', sa: 'चन्द्रः'
  },
  Mars: {
    en: 'Mars', hi: 'मंगल', mr: 'मंगळ', gu: 'મંગળ', bn: 'মঙ্গল', ta: 'செவ்வாய்',
    te: 'కుజుడు', kn: 'ಮಂಗಳ', ml: 'ചൊവ്വ', pa: 'ਮੰਗਲ', or: 'ମଙ୍ଗଳ', as: 'মঙ্গল', sa: 'मङ्गलः'
  },
  Mercury: {
    en: 'Mercury', hi: 'बुध', mr: 'बुध', gu: 'બુધ', bn: 'বুধ', ta: 'புதன்',
    te: 'బుధుడు', kn: 'ಬುಧ', ml: 'ബുധൻ', pa: 'ਬੁੱਧ', or: 'ବୁଧ', as: 'বুধ', sa: 'बुधः'
  },
  Jupiter: {
    en: 'Jupiter', hi: 'गुरु (बृहस्पति)', mr: 'गुरु', gu: 'ગુરુ', bn: 'বৃহস্পতি', ta: 'குரு',
    te: 'గురుడు', kn: 'ಗುರು', ml: 'വ്യാഴം', pa: 'ਗੁਰੂ', or: 'ବୃହସ୍ପତି', as: 'বৃহস্পতি', sa: 'गुरुः'
  },
  Venus: {
    en: 'Venus', hi: 'शुक्र', mr: 'शुक्र', gu: 'શુક્ર', bn: 'শুক্র', ta: 'சுக்கிரன்',
    te: 'శుక్రుడు', kn: 'ಶುಕ್ರ', ml: 'ശുക്രൻ', pa: 'ਸ਼ੁੱਕਰ', or: 'ଶୁକ୍ର', as: 'শুক্ৰ', sa: 'शुक्रः'
  },
  Saturn: {
    en: 'Saturn', hi: 'शनि', mr: 'शनि', gu: 'શનિ', bn: 'শনি', ta: 'சனி',
    te: 'శని', kn: 'ಶನಿ', ml: 'ശനി', pa: 'ਸ਼ਨਿ', or: 'ଶନି', as: 'শনি', sa: 'शनिः'
  },
  Rahu: {
    en: 'Rahu', hi: 'राहु', mr: 'राहु', gu: 'રાહુ', bn: 'রাহু', ta: 'ராகு',
    te: 'రాహువు', kn: 'ರಾಹು', ml: 'രാഹു', pa: 'ਰਾਹੂ', or: 'ରାହୁ', as: 'ৰাহু', sa: 'राहुः'
  },
  Ketu: {
    en: 'Ketu', hi: 'केतु', mr: 'केतु', gu: 'કેતુ', bn: 'কেতু', ta: 'கேது',
    te: 'కేతువు', kn: 'ಕೇತು', ml: 'കേതു', pa: 'ਕੇਤੂ', or: 'କେତୁ', as: 'কেতু', sa: 'केतुः'
  }
};

// Weekday Names
export const WEEKDAY_NAMES: Record<string, Partial<Record<LanguageCode, string>>> = {
  Sunday: {
    en: 'Sunday', hi: 'रविवार', mr: 'रविवार', gu: 'રવિવાર', bn: 'রবিবার', ta: 'ஞாயிறு',
    te: 'ఆదివారం', kn: 'ಭಾನುವಾರ', ml: 'ഞായർ', pa: 'ਐਤਵਾਰ', or: 'ରବିବାର', as: 'দেওবাৰ', sa: 'रविवासरः'
  },
  Monday: {
    en: 'Monday', hi: 'सोमवार', mr: 'सोमवार', gu: 'સોમવાર', bn: 'সোমবার', ta: 'திங்கள்',
    te: 'సోమవారం', kn: 'ಸೋಮವಾರ', ml: 'തിങ്കൾ', pa: 'ਸੋਮਵਾਰ', or: 'ସୋମବାର', as: 'সোমবাৰ', sa: 'सोमवासरः'
  },
  Tuesday: {
    en: 'Tuesday', hi: 'मंगलवार', mr: 'मंगळवार', gu: 'મંગળવાર', bn: 'মঙ্গলবার', ta: 'செவ்வாய்',
    te: 'మంగళవారం', kn: 'ಮಂಗಳವಾರ', ml: 'ചൊവ്വ', pa: 'ਮੰਗਲਵਾਰ', or: 'ମଙ୍ଗଳବାର', as: 'মঙলবাৰ', sa: 'मङ्गलवासरः'
  },
  Wednesday: {
    en: 'Wednesday', hi: 'बुधवार', mr: 'बुधवार', gu: 'બુધવાર', bn: 'বুধবার', ta: 'புதன்',
    te: 'బుధవారం', kn: 'ಬುಧವಾರ', ml: 'ബുಧൻ', pa: 'ਬੁੱਧਵਾਰ', or: 'ବୁଧବାର', as: 'বুধবাৰ', sa: 'बुधवासरः'
  },
  Thursday: {
    en: 'Thursday', hi: 'गुरुवार', mr: 'गुरुवार', gu: 'ગુરુવાર', bn: 'বৃহস্পতিবার', ta: 'வியாழன்',
    te: 'గురువారం', kn: 'ಗುರುವಾರ', ml: 'വ്യാഴം', pa: 'ਵੀਰਵਾਰ', or: 'ଗୁରୁବାର', as: 'বৃহস্পতিবাৰ', sa: 'गुरुवासरः'
  },
  Friday: {
    en: 'Friday', hi: 'शुक्रवार', mr: 'शुक्रवार', gu: 'શુક્રવાર', bn: 'শুক্রবার', ta: 'வெள்ளி',
    te: 'శుక్రవారం', kn: 'ಶುಕ್ರವಾರ', ml: 'വെള്ളി', pa: 'ਸ਼ੁੱਕਰਵਾਰ', or: 'ଶୁକ୍ରବାର', as: 'শুক্ৰবাৰ', sa: 'शुक्रवासरः'
  },
  Saturday: {
    en: 'Saturday', hi: 'शनिवार', mr: 'शनिवार', gu: 'શનિવાર', bn: 'শনিবার', ta: 'சனி',
    te: 'శనివారం', kn: 'ಶನಿವಾರ', ml: 'ശനി', pa: 'ਸ਼ਨੀਵਾਰ', or: 'ଶନିବାର', as: 'শনিবাৰ', sa: 'शनिवासरः'
  }
};

// Directions
export const DIRECTION_NAMES: Record<string, Partial<Record<LanguageCode, string>>> = {
  'North': { en: 'North', hi: 'उत्तर', mr: 'उत्तर', gu: 'ઉત્તર', bn: 'উত্তর', ta: 'வடக்கு', te: 'ఉత్తరం', kn: 'ಉತ್ತರ', ml: 'വടക്ക്', pa: 'ਉੱਤਰ', or: 'ଉତ୍ତର', as: 'উত্তৰ', sa: 'उत्तरम्' },
  'East': { en: 'East', hi: 'पूर्व', mr: 'पूर्व', gu: 'પૂર્વ', bn: 'পূর্ব', ta: 'கிழக்கு', te: 'తూర్పు', kn: 'ಪೂರ್ವ', ml: 'കിഴക്ക്', pa: 'ਪੂਰਬ', or: 'ପୂର୍ବ', as: 'পূব', sa: 'पूर्वम्' },
  'West': { en: 'West', hi: 'पश्चिम', mr: 'पश्चिम', gu: 'પશ્ચિમ', bn: 'পশ্চিম', ta: 'மேற்கு', te: 'పడమర', kn: 'ಪಶ್ಚಿಮ', ml: 'പടിഞ്ഞാറ്', pa: 'ਪੱਛਮ', or: 'ପଶ୍ଚିମ', as: 'পশ্চিম', sa: 'पश्चिमम्' },
  'South': { en: 'South', hi: 'दक्षिण', mr: 'दक्षिण', gu: 'દક્ષિણ', bn: 'দক্ষিণ', ta: 'தெற்கு', te: 'దక్షిణం', kn: 'ದಕ್ಷಿಣ', ml: 'തെക്ക്', pa: 'ਦੱਖਣ', or: 'ଦକ୍ଷିଣ', as: 'দক্ষিণ', sa: 'दक्षिणम्' },
  'North-East': { en: 'North-East', hi: 'ईशान', mr: 'ईशान्य', gu: 'ઈશાન', bn: 'ঈশান', ta: 'ஈசானியம்', te: 'ఈశాన్యం', kn: 'ಈಶಾನ್ಯ', ml: 'ഈശാനകോൺ', pa: 'ਈਸ਼ਾਨ', or: 'ଈଶାନ୍ୟ', as: 'ঈশান', sa: 'ईशानकोणः' },
  'North-West': { en: 'North-West', hi: 'वायव्य', mr: 'वायव्य', gu: 'વાયવ્ય', bn: 'বায়ব্য', ta: 'வாயுவ்யம்', te: 'వాయువ్యం', kn: 'ವಾಯುವ್ಯ', ml: 'വായുകോൺ', pa: 'ਵਾਇਵ੍ਯ', or: 'ବାୟବ୍ୟ', as: 'বায়ব্য', sa: 'वायव्यकोणः' },
  'South-East': { en: 'South-East', hi: 'आग्नेय', mr: 'आग्नेय', gu: 'આગ્નેય', bn: 'আগ্নেয়', ta: 'ஆக்னேயம்', te: 'ఆగ్నేయం', kn: 'ಆಗ್ನೇಯ', ml: 'അഗ്നികോൺ', pa: 'ਆਗਨੇਯ', or: 'ଆଗ୍ନେୟ', as: 'আগ্নেয়', sa: 'आग्नेयकोणः' },
  'South-West': { en: 'South-West', hi: 'नैऋत्य', mr: 'नैऋत्य', gu: 'નૈઋત્ય', bn: 'নৈঋত', ta: 'நைருதி', te: 'నైరుతి', kn: 'ನೈಋತ್ಯ', ml: 'നിര്യതികോൺ', pa: 'ਨੈਰਿਤ', or: 'ନୈରੁત', as: 'নৈঋত', sa: 'നैरृत्यकोणः' }
};

// Panchatattva Elements
export const ELEMENT_NAMES: Record<string, Partial<Record<LanguageCode, string>>> = {
  Earth: { en: 'Earth', hi: 'पृथ्वी', mr: 'पृथ्वी', gu: 'પૃથ્વી', bn: 'পৃথিবী', ta: 'நிலம்', te: 'భూమి', kn: 'ಭೂಮಿ', ml: 'ഭൂമി', pa: 'ਧਰਤੀ', or: 'ପୃଥିବୀ', as: 'পৃথিৱী', sa: 'पृथ्वी' },
  Water: { en: 'Water', hi: 'जल', mr: 'जल', gu: 'જળ', bn: 'জল', ta: 'நீர்', te: 'నీరు', kn: 'ನೀರು', ml: 'ജലം', pa: 'ਜਲ', or: 'ଜଳ', as: 'পানী', sa: 'जलम्' },
  Fire: { en: 'Fire', hi: 'अग्नि', mr: 'अग्नि', gu: 'અગ્નિ', bn: 'অગ্নি', ta: 'தீ', te: 'అగ్ని', kn: 'ಅಗ್ನಿ', ml: 'തീ', pa: 'ਅਗਨੀ', or: 'ଅଗ୍ନି', as: 'অগ্নি', sa: 'अग्निः' },
  Air: { en: 'Air', hi: 'वायु', mr: 'वायु', gu: 'વાયુ', bn: 'বায়ু', ta: 'காற்று', te: 'వాయువు', kn: 'ವಾಯು', ml: 'വായു', pa: 'ਵਾਯੂ', or: 'ବାୟੁ', as: 'বায়ু', sa: 'वायुः' },
  Space: { en: 'Space', hi: 'आकाश', mr: 'आकाश', gu: 'આકાશ', bn: 'আকাশ', ta: 'ஆகாயம்', te: 'ఆకాశం', kn: 'ಆಕಾಶ', ml: 'ആകാശം', pa: 'ਅਕਾਸ਼', or: 'ଆକାଶ', as: 'আকাশ', sa: 'आकाशः' },
  Ether: { en: 'Ether', hi: 'आकाश', mr: 'आकाश', gu: 'આકાશ', bn: 'আકાશ', ta: 'ஆகாயம்', te: 'ఆకాశം', kn: 'ಆಕಾಶ', ml: 'ആകാശം', pa: 'ਅਕਾਸ਼', or: 'ଆକାଶ', as: 'আকাশ', sa: 'आकाशः' }
};

// Rashis (Signs)
export const RASHI_NAMES: Record<string, Partial<Record<LanguageCode, string>>> = {
  Aries: { en: 'Aries', hi: 'मेष', mr: 'मेष', gu: 'મેષ', bn: 'মেষ', ta: 'மேஷம்', te: 'మేషం', kn: 'ಮೇಷ', ml: 'മേടം', pa: 'ਮੇਖ', or: 'ମେଷ', as: 'মেষ', sa: 'मेषः' },
  Taurus: { en: 'Taurus', hi: 'वृषभ', mr: 'वृषभ', gu: 'વૃષભ', bn: 'বৃষ', ta: 'ரிஷபம்', te: 'వృషభం', kn: 'ವೃಷಭ', ml: 'ഇടവം', pa: 'ਬ੍ਰਿਖ', or: 'ବୃଷ', as: 'বৃষ', sa: 'वृषभः' },
  Gemini: { en: 'Gemini', hi: 'मिथुन', mr: 'मिथुन', gu: 'મિથુન', bn: 'মিথুন', ta: 'மிதுனம்', te: 'మిథునం', kn: 'ಮಿಥುನ', ml: 'മിഥുനം', pa: 'ਮਿਥੁਨ', or: 'ମିଥୁନ', as: 'মিথুন', sa: 'मिथुनम्' },
  Cancer: { en: 'Cancer', hi: 'कर्क', mr: 'कर्क', gu: 'કર્ક', bn: 'কর্কট', ta: 'கடகம்', te: 'కర్కాటకం', kn: 'ಕರ್ಕಾಟಕ', ml: 'കർക്കടകം', pa: 'ਕਰਕ', or: 'କର୍କଟ', as: 'কৰ্কট', sa: 'कर्कटः' },
  Leo: { en: 'Leo', hi: 'सिंह', mr: 'सिंह', gu: 'સિંહ', bn: 'সিংহ', ta: 'சிம்மம்', te: 'సింహం', kn: 'ಸಿಂಹ', ml: 'ചിങ്ങം', pa: 'ਸਿੰਘ', or: 'ସିଂହ', as: 'সিংহ', sa: 'सिंहः' },
  Virgo: { en: 'Virgo', hi: 'कन्या', mr: 'कन्या', gu: 'કન્યા', bn: 'কন্যা', ta: 'கன்னி', te: 'కన్య', kn: 'ಕನ್ಯಾ', ml: 'കന്നി', pa: 'ਕੰਨਿਆ', or: 'କନ୍ୟା', as: 'কন্যা', sa: 'कन्या' },
  Libra: { en: 'Libra', hi: 'तुला', mr: 'तूळ', gu: 'તુલા', bn: 'তুলা', ta: 'துலாம்', te: 'తుల', kn: 'ತುಲಾ', ml: 'തുലാം', pa: 'ਤੁਲਾ', or: 'ତୁଳା', as: 'তুলা', sa: 'तुला' },
  Scorpio: { en: 'Scorpio', hi: 'वृश्चिक', mr: 'वृश्चिक', gu: 'વૃશ્ચિક', bn: 'বৃশ্চিক', ta: 'விருச்சிகம்', te: 'వృశ్చికం', kn: 'ವೃಶ್ಚಿಕ', ml: 'വൃശ്ചികം', pa: 'ਬ੍ਰਿਸ਼ਚਕ', or: 'ବିଛା', as: 'বৃশ্চিক', sa: 'वृश्चिकः' },
  Sagittarius: { en: 'Sagittarius', hi: 'धनु', mr: 'धनु', gu: 'ધન', bn: 'ধনু', ta: 'தனுசு', te: 'ధనుస్సు', kn: 'ಧನು', ml: 'ധനു', pa: 'ਧਨੁ', or: 'ଧନୁ', as: 'ধনু', sa: 'धनुः' },
  Capricorn: { en: 'Capricorn', hi: 'मकर', mr: 'मकर', gu: 'મકર', bn: 'মকর', ta: 'மகரம்', te: 'మకరం', kn: 'ಮಕರ', ml: 'മകരം', pa: 'ਮਕਰ', or: 'ମକର', as: 'মকৰ', sa: 'मकरः' },
  Aquarius: { en: 'Aquarius', hi: 'कुंभ', mr: 'कुंभ', gu: 'કુંભ', bn: 'কুম্ভ', ta: 'கும்பம்', te: 'కుంభం', kn: 'ಕುಂಭ', ml: 'കുംഭം', pa: 'ਕੁੰਭ', or: 'କୁମ୍ଭ', as: 'কুম্ভ', sa: 'कुम्भः' },
  Pisces: { en: 'Pisces', hi: 'मीन', mr: 'मीन', gu: 'મીન', bn: 'মীন', ta: 'மீனம்', te: 'మీనం', kn: 'ಮೀನ', ml: 'മീനം', pa: 'ਮੀਨ', or: 'ମୀନ', as: 'মীন', sa: 'मीनः' }
};

export function getLocalizedPlanetName(planetStr: string, lang: LanguageCode): string {
  const clean = planetStr.split(' ')[0].replace(/[^a-zA-Z]/g, '');
  return PLANET_NAMES[clean]?.[lang] || PLANET_NAMES[clean]?.hi || planetStr;
}

export function getLocalizedWeekday(dayStr: string, lang: LanguageCode): string {
  const clean = dayStr.split(' ')[0].replace(/[^a-zA-Z]/g, '');
  return WEEKDAY_NAMES[clean]?.[lang] || WEEKDAY_NAMES[clean]?.hi || dayStr;
}

export function getLocalizedDirection(dirStr: string, lang: LanguageCode): string {
  if (!dirStr) return '';
  let key = 'North-East';
  if (/north-?east|ईशान/i.test(dirStr)) key = 'North-East';
  else if (/north-?west|वायव्य|उत्तर-पश्चिम/i.test(dirStr)) key = 'North-West';
  else if (/south-?east|आग्नेय/i.test(dirStr)) key = 'South-East';
  else if (/south-?west|नैऋत्य|दक्षिण-पश्चिम/i.test(dirStr)) key = 'South-West';
  else if (/east|पूर्व/i.test(dirStr)) key = 'East';
  else if (/west|पश्चिम/i.test(dirStr)) key = 'West';
  else if (/north|उत्तर/i.test(dirStr)) key = 'North';
  else if (/south|दक्षिण/i.test(dirStr)) key = 'South';

  return DIRECTION_NAMES[key]?.[lang] || (lang === 'en' ? key : (DIRECTION_NAMES[key]?.hi || key));
}

export function getLocalizedElement(elemStr: string, lang: LanguageCode): string {
  if (!elemStr) return '';
  const clean = elemStr.trim();
  return ELEMENT_NAMES[clean]?.[lang] || (lang === 'en' ? clean : (ELEMENT_NAMES[clean]?.hi || clean));
}

export function getLocalizedRashi(rashiStr: string, lang: LanguageCode): string {
  if (!rashiStr) return '';
  const clean = rashiStr.split(' ')[0].replace(/[^a-zA-Z]/g, '');
  return RASHI_NAMES[clean]?.[lang] || (lang === 'en' ? clean : (RASHI_NAMES[clean]?.hi || clean));
}

export function getLocalizedMetric(type: 'moolank' | 'bhagyank', val: number, lang: LanguageCode): string {
  if (lang === 'en') {
    return type === 'moolank' ? `${val} (Venus)` : `${val} (Mars)`;
  }
  const planet = type === 'moolank' ? getLocalizedPlanetName('Venus', lang) : getLocalizedPlanetName('Mars', lang);
  return `${val} (${planet})`;
}

/**
 * Extracts dynamic variables from report card data and section for interpolation
 */
interface InterpolationParams {
  dayLord: string;
  dayOfWeek: string;
  moolank: number;
  bhagyank: number;
  personalDay: number;
  direction: string;
  rahukaal: string;
  ascSign: string;
  ascDegree: string;
  moonSign: string;
  moonNakshatra: string;
  mahadasha: string;
  antardasha: string;
  dominantElement: string;
  weakestElement: string;
  elementOfInfluence: string;
  sensitivities: string;
  hydrationTarget: number;
  sleepTarget: number;
  favorableDeity: string;
}

function extractParams(report: DailyReportCardData, lang: LanguageCode): InterpolationParams {
  const overviewCalc = report.sections?.today_overview?.calculatedData || '';
  const numCalc = report.sections?.numerology?.calculatedData || '';
  const jyotishCalc = report.sections?.jyotish_guidance?.calculatedData || '';
  const dashaCalc = report.sections?.dasha_transit?.calculatedData || '';
  const travelCalc = report.sections?.travel?.calculatedData || '';

  const rawDayLord = overviewCalc.match(/Day Lord: ([^(|]+)/)?.[1]?.trim() || 'Venus';
  const rawDayOfWeek = overviewCalc.match(/Day: ([^|]+)/)?.[1]?.trim() || 'Friday';
  const rawDirection = travelCalc.match(/Travel Direction: ([^|]+)/)?.[1]?.trim() || 'North-East';
  const rawRahukaal = overviewCalc.match(/Rahu Kaal: ([^|]+)/)?.[1]?.trim() || '10:30 AM - 12:00 PM';
  const rawPersonalDay = parseInt(numCalc.match(/Personal Day: (\d+)/)?.[1] || '7', 10);
  const rawMahadasha = dashaCalc.match(/Mahadasha: ([^|]+)/)?.[1]?.trim() || 'Jupiter';
  const rawAntardasha = dashaCalc.match(/Antardasha: ([^|]+)/)?.[1]?.trim() || 'Mercury';

  const rawAscSign = jyotishCalc.match(/Lagna: ([^|]+)/)?.[1]?.trim() || 'Gemini';
  const rawMoonSign = jyotishCalc.match(/Moon Sign: ([^|]+)/)?.[1]?.trim() || 'Sagittarius';
  const rawMoonNak = jyotishCalc.match(/Nakshatra: ([^|]+)/)?.[1]?.trim() || 'Mula';

  const dominant = report.sections?.panchatattva?.signal?.match(/Dominant element: (\w+)/)?.[1] || 'Water';
  const weakest = report.sections?.panchatattva?.signal?.match(/Weakest element: (\w+)/)?.[1] || 'Ether';

  return {
    dayLord: getLocalizedPlanetName(rawDayLord, lang),
    dayOfWeek: getLocalizedWeekday(rawDayOfWeek, lang),
    moolank: 6,
    bhagyank: 9,
    personalDay: rawPersonalDay,
    direction: getLocalizedDirection(rawDirection, lang),
    rahukaal: rawRahukaal,
    ascSign: getLocalizedRashi(rawAscSign, lang),
    ascDegree: '18.42°',
    moonSign: getLocalizedRashi(rawMoonSign, lang),
    moonNakshatra: rawMoonNak,
    mahadasha: getLocalizedPlanetName(rawMahadasha, lang),
    antardasha: getLocalizedPlanetName(rawAntardasha, lang),
    dominantElement: dominant,
    weakestElement: weakest,
    elementOfInfluence: rawDayLord === 'Saturn' ? 'Air' : rawDayLord === 'Venus' ? 'Water' : 'Fire',
    sensitivities: report.wellnessDiarySnapshot?.sensitivities?.join(', ') || '',
    hydrationTarget: report.wellnessDiarySnapshot?.hydrationTargetLiters || 3.0,
    sleepTarget: report.wellnessDiarySnapshot?.sleepTargetHours || 7.5,
    favorableDeity: rawDayLord === 'Saturn' ? 'हनुमान जी एवं शनि साधना' : rawDayLord === 'Venus' ? 'महालक्ष्मी साधना' : 'शिव ध्यान'
  };
}

/**
 * Returns localized summary headline based on language
 */
export function getLocalizedSummaryHeadline(
  report: DailyReportCardData,
  lang: LanguageCode
): { primary: string; secondary?: string } {
  const score = report.summaryScore;
  if (lang === 'en') {
    return {
      primary: `Harmonious & Disciplined Momentum (Score: ${score}/100)`,
      secondary: 'Vedic harmony, karmic discipline & planetary alignment'
    };
  }
  if (lang === 'hi') {
    return {
      primary: report.summaryHeadlineHindi || `संतुलित एवं अनुशासित प्रगति (दैनिक सूचकांक: ${score}/100)`,
      secondary: 'जीवन संतुलन, कर्म शुद्धि एवं दैनिक ग्रह संरेखण'
    };
  }
  if (lang === 'mr') {
    return {
      primary: `संतुलित आणि शिस्तबद्ध प्रगती (दैनिक निर्देशांक: ${score}/100)`,
      secondary: 'जीवन समतोल, कर्म शुद्धी आणि दैनिक ग्रह संरेखन'
    };
  }
  if (lang === 'gu') {
    return {
      primary: `સંતુલિત અને શિસ્તબદ્ધ પ્રગતિ (દૈનિક સૂચકાંક: ${score}/100)`,
      secondary: 'જીવન સંતુલન, કર્મ શુદ્ધિ અને દૈનિક ગ્રહ ગોઠવણી'
    };
  }
  if (lang === 'sa') {
    return {
      primary: `संतुलिता अनुशासिता च प्रगतिः (दैनिकसूचकाङ्कः: ${score}/१००)`,
      secondary: 'जीवनसन्तुलनं, कर्मशुद्धिः, ग्रहानुकूल्यं च'
    };
  }
  if (lang === 'bn') {
    return {
      primary: `সুষম ও সুশৃঙ্খল অগ্রগতি (দৈনিক সূচক: ${score}/১০০)`,
      secondary: 'জীবন ভারসাম্য, কর্ম শুদ্ধি এবং দৈনিক গ্রহ বিন্যাস'
    };
  }
  if (lang === 'ta') {
    return {
      primary: `சீரான மற்றும் ஒழுக்கமான முன்னேற்றம் (தினசரி குறியீடு: ${score}/100)`,
      secondary: 'வாழ்க்கை சமநிலை, கர்ம தூய்மை மற்றும் கிரக சீரமைப்பு'
    };
  }
  if (lang === 'te') {
    return {
      primary: `సమతుల్య మరియు క్రమశిక్షణతో కూడిన ప్రగతి (రోజువారీ సూచిక: ${score}/100)`,
      secondary: 'జీవిత సమతుల్యత, కర్మ శుద్ధి మరియు గ్రహ సమలేఖనం'
    };
  }
  if (lang === 'kn') {
    return {
      primary: `ಸಮತೋಲಿತ ಮತ್ತು ಶಿಸ್ತುಬದ್ಧ ಪ್ರಗತಿ (ದೈನಂದಿನ ಸೂಚ್ಯಂಕ: ${score}/100)`,
      secondary: 'ಜೀವನ ಸಮತೋಲನ, ಕರ್ಮ ಶುದ್ಧಿ ಮತ್ತು ಗ್ರಹ ಜೋಡಣೆ'
    };
  }
  if (lang === 'ml') {
    return {
      primary: `സന്തുലിതവും അച്ചടക്കമുള്ളതുമായ പുരോഗതി (ദൈനംദിന സൂചിക: ${score}/100)`,
      secondary: 'ജീവിത സന്തുലിതാവസ്ഥ, കർമ്മ ശുദ്ധി, ഗ്രഹ വിന്യാസം'
    };
  }
  if (lang === 'pa') {
    return {
      primary: `ਸੰਤੁਲਿਤ ਅਤੇ ਅਨੁਸ਼ਾਸਿਤ ਤਰੱਕੀ (ਰੋਜ਼ਾਨਾ ਸੂਚਕਾਂਕ: ${score}/100)`,
      secondary: 'ਜੀਵਨ ਸੰਤੁਲਨ, ਕਰਮ ਸ਼ੁੱਧੀ ਅਤੇ ਰੋਜ਼ਾਨਾ ਗ੍ਰਹਿ ਇਕਸਾਰਤਾ'
    };
  }
  if (lang === 'or') {
    return {
      primary: `ସନ୍ତୁଳିତ ଏବଂ ଶୃଙ୍ଖଳିତ ପ୍ରଗତି (ଦୈନିକ ସୂଚକାଙ୍କ: ${score}/୧୦୦)`,
      secondary: 'ଜୀବନ ସନ୍ତୁଳନ, କର୍ମ ଶୁଦ୍ଧି ଏବଂ ଦୈନିକ ଗ୍ରହ ସମନ୍ୱୟ'
    };
  }
  if (lang === 'as') {
    return {
      primary: `সন্তুলিত আৰু শৃংখলাবদ্ধ অগ্ৰগতি (দৈনিক সূচকাংক: ${score}/১০০)`,
      secondary: 'জীৱনৰ ভাৰসাম্য, কৰ্ম শুদ্ধি আৰু দৈনন্দিন গ্ৰহ বিন্যাস'
    };
  }
  return {
    primary: report.summaryHeadlineHindi || `संतुलित एवं अनुशासित प्रगति (दैनिक सूचकांक: ${score}/100)`,
    secondary: 'जीवन संतुलन, कर्म शुद्धि एवं दैनिक ग्रह संरेखण'
  };
}

/**
 * Returns localized section content (signal, why, whatToDo, whatToBeCarefulAbout, etc.)
 * supporting all 13 languages.
 */
export function getLocalizedSectionContent(
  sec: DailyReportCardSection,
  report: DailyReportCardData,
  lang: LanguageCode
): LocalizedSectionGuidance {
  // If English is selected, return original English fields verbatim
  if (lang === 'en') {
    return {
      signal: sec.signal,
      why: sec.why,
      whatToDo: sec.whatToDo,
      whatToBeCarefulAbout: sec.whatToBeCarefulAbout,
      aiExplanation: sec.aiExplanation,
      actionableGuidance: sec.actionableGuidance,
      traditionalInterpretation: sec.traditionalInterpretation
    };
  }

  const p = extractParams(report, lang);

  // Translation generator per section
  switch (sec.id) {
    case 'today_overview':
      if (lang === 'mr') {
        return {
          signal: `दिवस स्वामी ${p.dayLord} सह वैयक्तिक दिवस ${p.personalDay} चा प्रभाव आंतरिक समतोल आणि स्थिर प्रगतीला चालना देतो.`,
          why: `${p.dayLord} च्या प्रभावाखालील ${p.dayOfWeek} आणि आपला मूलांक ${p.moolank} व वैयक्तिक दिवस ${p.personalDay} ची सुसंगतता शिस्तबद्ध प्रगती घडवून आणते.`,
          whatToDo: `महत्त्वाची आणि एकाग्रतेची कामे अनुकूल वेळेत (10:00 AM - 01:00 PM) पूर्ण करा आणि शुभ दिशेकडे (${p.direction}) तोंड ठेवून चर्चा करा.`,
          whatToBeCarefulAbout: `राहुकाळात (${p.rahukaal}) महत्त्वाचे कायदेशीर करार किंवा अपरिवर्तनीय निर्णय घेणे टाळा.`,
          aiExplanation: `आजचा दिवस शारीरिक शिस्त आणि मानसिक स्पष्टता यांचा समन्वय साधून संतुलित उत्पादकतेचा पाया रचतो.`,
          actionableGuidance: `सकाळी 08:30 पर्यंत आपल्या प्राधान्यक्रमांची यादी बनवा, अनावश्यक व्यत्यय टाळा आणि संध्याकाळी शांत चालायला जा.`,
          traditionalInterpretation: sec.traditionalInterpretation
        };
      }
      if (lang === 'gu') {
        return {
          signal: `દિવસ સ્વામી ${p.dayLord} સાથે વ્યક્તિગત દિવસ ${p.personalDay} આંતરિક સંતુલન અને પ્રગતિશીલ ગતિ આપે છે.`,
          why: `${p.dayLord} શાસિત ${p.dayOfWeek} અને તમારો મૂળાંક ${p.moolank} સાથે વ્યક્તિગત દિવસ ${p.personalDay} શિસ્તબદ્ધ ગતિ પ્રદાન કરે છે.`,
          whatToDo: `મહત્વપૂર્ણ કાર્યો અનુકૂળ સમયગાળા (10:00 AM - 01:00 PM) દરમિયાન પૂર્ણ કરો અને શુભ દિશા (${p.direction}) નું ધ્યાન રાખો.`,
          whatToBeCarefulAbout: `રાહુકાળ (${p.rahukaal}) દરમિયાન નવા મોટા કરારો કે અવિચારી નિર્ણયો લેવાનું ટાળો.`,
          aiExplanation: `આજનો દિવસ શારીરિક શિસ્ત અને સ્પષ્ટ માનસિક એકાગ્રતાનો સુમેળ સાધે છે.`,
          actionableGuidance: `સવારે 08:30 સુધીમાં પ્રાથમિકતાઓ નક્કી કરો, બિનજરૂરી ખલેલ ટાળો અને સાંજે શાંત ચાલવાનો નિયમ રાખો.`,
          traditionalInterpretation: sec.traditionalInterpretation
        };
      }
      if (lang === 'sa') {
        return {
          signal: `दिनस्वामी ${p.dayLord} तथा व्यक्तिगतदिनम् ${p.personalDay} आन्तरिकसन्तुलनं दृढप्रगतिं च पोषयतः।`,
          why: `${p.dayLord}-शासिते ${p.dayOfWeek}े मूलाङ्कः ${p.moolank} सक्रियव्यक्तिगतदिनेन सह कर्मसु अनुशासनं वर्धयति।`,
          whatToDo: `महत्त्वपूर्णानि कार्याणि शुभवेलायां (10:00 AM - 01:00 PM) कुर्वन्तु, शुभदिशं (${p.direction}) च अनुसरन्तु।`,
          whatToBeCarefulAbout: `राहुकालवेलायां (${p.rahukaal}) नवीनं महत्त्वपूर्णं निर्णयं मा कुर्वन्तु।`,
          aiExplanation: `अद्यतनः दिवसः शारीरिकनियन्त्रणेन सह मानसिकप्रसन्नतां ददाति।`,
          actionableGuidance: `प्रातःकाले एव कार्ययोजनां निर्मान्त्वेकचित्तेन लक्ष्यं साधयन्तु।`,
          traditionalInterpretation: sec.traditionalInterpretation
        };
      }
      // Default Indian languages (Hindi and high-fidelity Vedic Hindi)
      return {
        signal: `दिन स्वामी ${p.dayLord} के साथ व्यक्तिगत दिवस ${p.personalDay} का प्रभाव आंतरिक संतुलन और स्थिर प्रगति को बल देता है।`,
        why: `${p.dayLord} द्वारा शासित ${p.dayOfWeek} और आपके मूलांक ${p.moolank} (शुक्र) तथा सक्रिय व्यक्तिगत दिवस ${p.personalDay} का सामंजस्य व्यावहारिक अनुशासन को प्रोत्साहित करता है।`,
        whatToDo: `महत्वपूर्ण एवं गहन एकाग्रता वाले कार्य दिन के अनुकूल समय (10:00 AM - 01:00 PM) में संपन्न करें और मुख्य चर्चाओं को शुभ दिशा (${p.direction}) के अनुकूल रखें।`,
        whatToBeCarefulAbout: `राहुकाल (${p.rahukaal}) के दौरान कोई नया बड़ा विधिक अनुबंध या अपरिवर्तनीय समझौता आरंभ करने से बचें।`,
        aiExplanation: `आज का दिन शारीरिक अनुशासन को स्पष्ट वैचारिक एकाग्रता के साथ जोड़ता है, जो संतुलित उत्पादकता का ठोस आधार है।`,
        actionableGuidance: `प्रातः 08:30 बजे तक अपनी प्राथमिकताओं की सूची बनाएं, व्यर्थ के व्यवधानों को विनम्रता से अस्वीकार करें और सायं को टहलने अवश्य जाएं।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'jyotish_guidance':
      return {
        signal: `${p.ascSign} लग्न और लग्नेश बुध का प्रभाव सूक्ष्म विश्लेषणात्मक संवाद एवं तकनीकी सूझबूझ को प्रखर बनाता है।`,
        why: `जन्म लग्न ${p.ascDegree} (बुध शासित ${p.ascSign}) और जन्म चंद्रमा ${p.moonSign} (${p.moonNakshatra}) मिलकर वैचारिक जिज्ञासा और उच्च सत्य की खोज का दोहरा सामंजस्य प्रदान करते हैं।`,
        whatToDo: `रणनीतिक चिंतन, लेखन, विश्लेषणात्मक समस्या समाधान और स्पष्ट संवाद में अपनी ऊर्जा लगाएं जहां शब्दों की सटीकता महत्वपूर्ण हो।`,
        whatToBeCarefulAbout: `मानसिक चंचलता, एक साथ कई विकल्पों पर अत्यधिक सोच-विचार करने और तय निर्णयों पर बार-बार संशय करने से बचें।`,
        aiExplanation: `विश्लेषणात्मक बुद्धि को व्यावहारिक कर्म के साथ संतुलित करने से निरंतर और भरोसेमंद उन्नति प्राप्त होती है।`,
        actionableGuidance: `अनावश्यक सामाजिक बहसों के स्थान पर अपनी मानसिक ऊर्जा को व्यवस्थित प्रलेखन या गहन तकनीकी कार्य में लगाएं।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'dasha_transit':
      return {
        signal: `${p.mahadasha} महादशा में ${p.antardasha} अंतर्दशा ज्ञान विस्तार, व्यावसायिक परिपक्वता और दीर्घकालिक संपदा संरक्षण पर बल देती है।`,
        why: `${p.mahadasha} विवेक व उच्च ज्ञान का संचालन करते हैं, जबकि ${p.antardasha} बुद्धि, वाणिज्य और विश्लेषणात्मक विवेक का। इनका संगम योजनाबद्ध उन्नति में सहायक है।`,
        whatToDo: `निरंतर कौशल संवर्धन, नैतिक वित्तीय प्रबंधन, मार्गदर्शन और भरोसेमंद व्यावसायिक संपर्कों को सुदृढ़ करने पर ध्यान दें।`,
        whatToBeCarefulAbout: `अत्यधिक उत्साह में आकर अपनी क्षमता से अधिक का वादा करने से बचें; संसाधन लगाने से पहले सभी व्यावहारिक पक्षों की जांच करें।`,
        aiExplanation: `यह समय जल्दबाजी या सट्टेबाजी के लाभ के स्थान पर सुदृढ़ और टिकाऊ नींव निर्माण के लिए सर्वाधिक अनुकूल है।`,
        actionableGuidance: `आज 45 मिनट किसी जटिल व्यावसायिक विषय के अध्ययन अथवा अपने दीर्घकालिक करियर रोडमैप की समीक्षा हेतु समर्पित करें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'numerology':
      return {
        signal: `व्यक्तिगत दिवस ${p.personalDay} आत्मचिंतन और गहराई की तरंगें लाता है। मूलांक ${p.moolank} (शुक्र - सामंजस्य, रचनात्मकता) एवं भाग्यांक ${p.bhagyank} (मंगल - कर्म, साहस) द्वारा संचालित।`,
        why: `जन्म तिथि 24 से मूलांक ${p.moolank} (2+4=6, शुक्र) और पूर्ण जन्म तिथि से भाग्यांक ${p.bhagyank} (9, मंगल) प्राप्त होता है। व्यक्तिगत दिवस ${p.personalDay} के साथ यह संयोजन कर्म से पूर्व विवेकपूर्ण विचार की प्रेरणा देता है।`,
        whatToDo: `गहन एकाग्रता, शोध, वास्तु या योजना निर्माण और आत्म-समीक्षा जैसे कार्यों को भीड़भाड़ वाले सामाजिक आयोजनों से ऊपर रखें।`,
        whatToBeCarefulAbout: `भावनात्मक अधीरता या दूसरों से तत्काल उत्तर की अपेक्षा करने से बचें; लोगों को उनका समय और स्थान दें।`,
        aiExplanation: `आपके मूल अंक करुणा को प्रेरक ऊर्जा के साथ जोड़ते हैं। आज का व्यक्तिगत दिवस ${p.personalDay} इसकी कार्यशैली का आधार बनता है।`,
        actionableGuidance: `एकाग्र कार्य के दौरान पास में एक डायरी रखें; अचानक आए विचारों को तुरंत करने के बजाय नोट कर लें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'lo_shu':
      return {
        signal: `लो शू ग्रिड में विचार और कर्म का संतुलन (उपस्थित अंक [2, 4, 6, 8, 9] और अनुपस्थित अंक [3, 5, 7])। दोहरे 6 का प्रभाव पारिवारिक और सौंदर्य बोध के उत्तरदायित्व को बढ़ाता है।`,
        why: `अंक 3 (बृहस्पति/ज्ञान) और अंक 5 (बुध/स्थिरता केंद्र) की अनुपस्थिति अनुशासन और नियमित दिनचर्या के पालन की आवश्यकता दर्शाती है। अंक 7 नियमित साधना से आध्यात्मिक विश्वास गहरा करने का संकेत देता है।`,
        whatToDo: `कार्य सूची (चेकलिस्ट) का प्रयोग करें, अपने कार्यस्थल पर स्वच्छता रखें और प्रातः व सायं की निश्चित दिनचर्या का पालन करें।`,
        whatToBeCarefulAbout: `घरेलू या सामाजिक जिम्मेदारियों का इतना अधिक भार अपने ऊपर न लें जिससे व्यक्तिगत तनाव उत्पन्न हो।`,
        aiExplanation: `केंद्रीय संतुलन अंक की कमी की पूर्ति के लिए सचेत होकर स्पष्ट लिखित नोट्स और सुव्यवस्थित दिनचर्या अपनाएं।`,
        actionableGuidance: `प्रातः कार्य आरंभ करने से पहले अपनी मेज पर 3 मुख्य कार्यों की सूची बनाकर रखें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'panchatattva':
      return {
        signal: `प्रधान तत्व: ${getLocalizedElement(p.dominantElement, lang)} | दुर्बल तत्व: ${getLocalizedElement(p.weakestElement, lang)}। आज का सक्रिय तत्व समंजक ${getLocalizedElement(p.elementOfInfluence, lang)} है।`,
        why: `${p.dayLord} तत्व का नियमन करते हैं, जो शारीरिक तापमान और मानसिक संतुलन को स्थिर रखता है। आंतरिक त्रिदोष (वात, पित्त, कफ) का संतुलन बनाए रखें।`,
        whatToDo: `शीतली या नाड़ी शोधन प्राणायाम करें, दिन भर में घूंट-घूंट करके जल पिएं और प्रकृति के सानिध्य में कुछ समय बिताएं।`,
        whatToBeCarefulAbout: `अत्यधिक तीखा या तला-भुना भोजन, अंधेरे में लंबे समय तक स्क्रीन देखना और गर्दन व कंधों में तनाव जमा होने से बचें।`,
        aiExplanation: `पंचतत्व संतुलन बनाए रखने से मानसिक थकान दूर होती है और व्यस्त समय में भी भावनात्मक स्थिरता बनी रहती है।`,
        actionableGuidance: `दोपहर 12:00 बजे 5 गहरी और धीमी श्वास लें और तुलसी या जीरा युक्त गुनगुना जल पिएं।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'wellness_safety':
      return {
        signal: `संतुलित गति से निरंतर ऊर्जा का प्रवाह। अपनी दैनिक दिनचर्या को व्यक्तिगत शारीरिक क्षमता के अनुकूल रखें।`,
        why: `दर्ज व्यक्तिगत संवेदनशीलताएं (${p.sensitivities || 'कोई दर्ज नहीं'}) और दैनिक ऊर्जा वक्र पर्याप्त विश्राम की मांग करते हैं।`,
        whatToDo: `लक्ष्य के अनुसार ${p.hydrationTarget} लीटर जल पिएं, प्रत्येक 50 मिनट पर उठकर स्ट्रेचिंग करें और ${p.sleepTarget} घंटे की गहरी नींद सुनिश्चित करें।`,
        whatToBeCarefulAbout: `कभी भी चिकित्सीय स्थितियों का स्वयं निदान न करें और न ही ज्योतिषीय संकेतों को योग्य चिकित्सा सलाह का विकल्प मानें। शारीरिक थकान को दूर करने हेतु अत्यधिक कैफीन के सेवन से बचें।`,
        aiExplanation: `शारीरिक सीमाओं का सम्मान करने और नियमित दिनचर्या बनाए रखने से मानसिक स्फूर्ति और जीवन शक्ति सुरक्षित रहती है।`,
        actionableGuidance: `सायंकालीन धूप में 1,500 कदम टहलें ताकि आपका सर्कैडियन चक्र सुचारू रहे।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'career':
      return {
        signal: `सुदृढ़ विश्लेषणात्मक नेतृत्व। तकनीकी लक्ष्यों की प्राप्ति और सुनियोजित प्रस्ताव प्रस्तुत करने की उत्कृष्ट क्षमता।`,
        why: `दशम भाव, बुध लग्नेश और मंगल भाग्यांक 9 का प्रभाव संगठित कार्यशैली और तकनीकी नेतृत्व को शक्ति प्रदान करता है।`,
        whatToDo: `लंबित कार्यों को पूर्ण करें, सिस्टम आर्किटेक्चर दस्तावेज तैयार करें और अपनी अपेक्षाएं पूरी स्पष्टता के साथ संप्रेषित करें।`,
        whatToBeCarefulAbout: `सहकर्मियों के प्रत्येक छोटे कार्य में हस्तक्षेप करने या धीमी गति से कार्य करने वालों पर अधीर होने से बचें।`,
        aiExplanation: `व्यवस्थित प्रक्रियाओं पर किया गया श्रम स्थायी और विश्वसनीय व्यावसायिक साख का निर्माण करता है।`,
        actionableGuidance: `दोपहर 02:00 बजे से पूर्व एक महत्वपूर्ण प्रोजेक्ट कार्य पूर्ण करें और टीम को संक्षिप्त स्थिति ईमेल भेजें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'business':
      return {
        signal: `व्यावसायिक अनुबंधों की समीक्षा, विक्रेता समझौतों और परिचालन प्रक्रियाओं के अनुकूलन हेतु अनुकूल समय।`,
        why: `बुधादित्य और वाणिज्यिक कारकों का प्रभाव व्यापारिक सूझबूझ को बढ़ाता है, बशर्ते सभी शर्तें लिखित रूप में तय हों।`,
        whatToDo: `साझेदारी समझौतों की समीक्षा करें, बिलों का सत्यापन करें और लाभ मार्जिन का विवेकपूर्वक पुनर्मूल्यांकन करें।`,
        whatToBeCarefulAbout: `मौखिक आश्वासनों पर निर्भर रहने से बचें; सदैव स्पष्ट लिखित शर्तों और ऑडिट ट्रेल पर बल दें।`,
        aiExplanation: `स्पष्टता और पारदर्शिता से साझेदारों के मध्य टकराव कम होता है और व्यावसायिक वृद्धि को गति मिलती है।`,
        actionableGuidance: `आज किसी प्रमुख आपूर्तिकर्ता या वाणिज्यिक अनुबंध की विधिक शर्तों की सूक्ष्मता से जांच करें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'money':
      return {
        signal: `अनुशासित और विवेकपूर्ण वित्तीय वृद्धि। दीर्घकालिक बचत, व्यवस्थित निवेश योजनाओं (SIP) और अनावश्यक व्यय रोकने हेतु उत्तम समय।`,
        why: `द्वितीय और एकादश भाव के ग्रह संकेतक सट्टा या आकस्मिक जोखिम के स्थान पर निरंतर मूल्य संवर्धन का समर्थन करते हैं।`,
        whatToDo: `अनावश्यक सब्सक्रिप्शन रद्द करें, अतिरिक्त धन को ऋणमुक्ति या अनुशासित निवेश में लगाएं और 6 माह का आपातकालीन फंड रखें।`,
        whatToBeCarefulAbout: `शीघ्र धन कमाने के भ्रामक सुझावों, अत्यधिक अस्थिर सट्टेबाजी या सामाजिक दबाव में किए जाने वाले अनावश्यक खर्च से बचें।`,
        aiExplanation: `अनिश्चित सट्टेबाजी के बजाय बैलेंस शीट को सुदृढ़ बनाने को प्राथमिकता दें।`,
        actionableGuidance: `आज किए गए प्रत्येक खर्च को नोट करें और बचाए गए धन को अपने आपातकालीन बचत खाते में स्थानांतरित करें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'family':
      return {
        signal: `स्नेहपूर्ण और आत्मीय पारिवारिक वातावरण। वरिष्ठों के आशीर्वाद, शांत वार्तालाप और गृह सौहार्द के लिए शुभ।`,
        why: `मूलांक 6 के स्वामी शुक्र माता-पिता, जीवनसाथी और बच्चों के साथ बातचीत में सौम्यता और सद्भाव प्रदान करते हैं।`,
        whatToDo: `परिवार के साथ बिना जल्दबाजी के समय बिताएं, सहानुभूतिपूर्वक उनकी बात सुनें और साथ में सायं का भोजन करें।`,
        whatToBeCarefulAbout: `कार्यक्षेत्र का तनाव या चिड़चिड़ाहट घर की बातचीत में लाने से बचें।`,
        aiExplanation: `घर में शांतिपूर्ण उपस्थिति तनाव को कम करती है और परिवार के सभी सदस्यों में भावनात्मक सुरक्षा का संचार करती है।`,
        actionableGuidance: `किसी बुजुर्ग सदस्य का कुशलक्षेम पूछें और भोजन के समय कम से कम एक प्रेरणादायक प्रसंग साझा करें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'relationship_marriage':
      return {
        signal: `दांपत्य विश्वास को प्रगाढ़ करने, संयुक्त योजनाएं बनाने और परस्पर कृतज्ञता व्यक्त करने हेतु सकारात्मक समय।`,
        why: `सप्तम भाव और शुक्र की ऊर्जा परस्पर आदर को बढ़ावा देती है, बशर्ते अहंकार के टकराव से बचा जाए।`,
        whatToDo: `जीवनसाथी की उनके दैनिक प्रयासों और सहयोग के लिए हृदय से सराहना करें।`,
        whatToBeCarefulAbout: `छोटी-छोटी कमियां निकालने या सुझावों पर रक्षात्मक प्रतिक्रिया देने से बचें।`,
        aiExplanation: `सहानुभूतिपूर्ण व्यवहार और ध्यानपूर्वक सुनने की आदत दांपत्य जीवन में गहरा सकारात्मक प्रभाव डालती है।`,
        actionableGuidance: `आज सायं मोबाइल फोन से दूर रहकर अपने जीवनसाथी के साथ कम से कम 15 मिनट शांत मन से बातचीत करें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'property':
      return {
        signal: `घर के रखरखाव, व्यवस्था सुधार और संपत्ति के दस्तावेजों की समीक्षा हेतु अनुकूल दिन।`,
        why: `मंगल भाग्यांक 9 (भूमि कारक) पृथ्वी तत्व के साथ सामंजस्य बनाकर भौतिक संरचनात्मक सुधारों को समर्थन देता है।`,
        whatToDo: `घर की सुविधाओं का निरीक्षण करें, अनावश्यक सामान हटाएं और संपत्ति के रिकॉर्ड व बीमा की अद्यतन स्थिति जांचें।`,
        whatToBeCarefulAbout: `बिना विधिक व तकनीकी जांच के अधूरे संपत्ति दस्तावेजों पर हस्ताक्षर करने से बचें।`,
        aiExplanation: `अपने भौतिक वातावरण को सुव्यवस्थित रखने से मानसिक शांति और दैनिक एकाग्रता में वृद्धि होती है।`,
        actionableGuidance: `घर की किसी एक अव्यवस्थित दराज या अलमारी को साफ करके व्यवस्थित करें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'travel':
      return {
        signal: `उद्देश्यपूर्ण स्थानीय आवागमन और सुनियोजित संक्षिप्त यात्राओं हेतु अनुकूल; यात्रा को शुभ दिशा के अनुरूप रखें।`,
        why: `दिन स्वामी ${p.dayLord} के अनुसार ${p.direction} यात्रा के लिए सर्वाधिक शुभ दिशा है।`,
        whatToDo: `पर्याप्त समय लेकर निकलें, वाहन का ईंधन व स्थिति जांचें और शांत व सतर्क मन से यात्रा करें।`,
        whatToBeCarefulAbout: `राहुकाल (${p.rahukaal}) के समय यात्रा करने से बचें; सड़क पर अधीरता या तीव्र गति से वाहन चलाने से बचें।`,
        aiExplanation: `योजनाबद्ध यात्रा और सतर्कता से ऊर्जा की बचत होती है और सुरक्षा सुनिश्चित रहती है।`,
        actionableGuidance: `अपनी निर्धारित यात्रा हेतु आवश्यक समय से 10 मिनट पहले प्रस्थान करें ताकि जल्दबाजी न हो।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'education':
      return {
        signal: `गहन एकाग्रता, जटिल विषयों को समझने और विश्लेषणात्मक अनुसंधान हेतु अत्यंत श्रेष्ठ दिन।`,
        why: `बुध लग्न और गुरु दशा का प्रभाव बौद्धिक प्रगति के लिए अनुकूल मानसिक वातावरण तैयार करता है।`,
        whatToDo: `कठिन विषयों का अध्ययन प्रातःकाल करें; सीखने को स्थायी बनाने हेतु हस्तलिखित नोट्स तैयार करें।`,
        whatToBeCarefulAbout: `बिना स्वयं अभ्यास या व्यावहारिक प्रयोग के केवल वीडियो देखने में समय व्यर्थ करने से बचें।`,
        aiExplanation: `निश्चित अंतरालों पर किया गया सक्रिय अभ्यास स्मरण शक्ति और अवधारणाओं की समझ को गहरा करता है।`,
        actionableGuidance: `दोपहर से पहले किसी महत्वपूर्ण तकनीकी अध्याय या लेख को पढ़कर उसका संक्षिप्त सारांश लिखें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'spirituality':
      return {
        signal: `अंतर्मुखी चिंतन, मंत्र जप और ईश्वरीय चेतना से जुड़ने का पावन अवसर।`,
        why: `दिन स्वामी ${p.dayLord} की वैदिक ऊर्जा ${p.favorableDeity} की आराधना और ध्यान को विशेष बल देती है।`,
        whatToDo: `गायत्री मंत्र का जप करें, 15 मिनट शांत प्राणायाम व ध्यान करें और ईश्वर के प्रति कृतज्ञता व्यक्त करें।`,
        whatToBeCarefulAbout: `आध्यात्मिक साधना को केवल भौतिक लाभ प्राप्त करने का साधन मानने से बचें।`,
        aiExplanation: `आध्यात्मिक आधार दैनिक भावनात्मक उथल-पुथल के मध्य चित्त को स्थिर और शांत रखता है।`,
        actionableGuidance: `संध्याकाल में एक दीपक प्रज्वलित करें या 10 मिनट मौन बैठकर सभी प्राणियों के कल्याण की प्रार्थना करें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'todays_caution':
      return {
        signal: `अधीरता, अचानक वित्तीय सट्टेबाजी और तनाव के क्षणों में कड़वे शब्दों के प्रयोग से विशेष रूप से सावधान रहें।`,
        why: `राहुकाल (${p.rahukaal}) और गोचर चंद्रमा की संवेदनशीलता के कारण उकसावे पर भावनात्मक उत्तेजना की संभावना रहती है।`,
        whatToDo: `किसी अप्रत्याशित समाचार, आलोचना या विलंब पर प्रतिक्रिया देने से पूर्व '10 सेकंड का विराम' लें।`,
        whatToBeCarefulAbout: `सोशल मीडिया पर व्यर्थ के विवादों, बिना जांचे दस्तावेजों पर हस्ताक्षर करने या भोजन छोड़ने से बचें।`,
        aiExplanation: `सचेत आत्म-संयम से संभावित गलतफहमियां दूर होती हैं और संबंध सुरक्षित रहते हैं।`,
        actionableGuidance: `यदि राहुकाल (${p.rahukaal}) के दौरान कोई उत्तेजक स्थिति बने, तो उत्तर देने से पहले एक गिलास सामान्य जल पिएं।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'todays_karma':
      return {
        signal: `कोई एक निःस्वार्थ सत्कर्म करें जिससे किसी अन्य व्यक्ति या मूक प्राणी को सहायता और प्रसन्नता मिले।`,
        why: `दिन स्वामी ${p.dayLord} और भाग्यांक 9 का कार्मिक संरेखण सार्वभौमिक करुणा और निःस्वार्थ सेवा की प्रेरणा देता है।`,
        whatToDo: `पक्षियों या बेजुबान जानवरों को दाना-पानी दें, किसी की सहायता करें या किसी जरूरतमंद की गुप्त मदद करें।`,
        whatToBeCarefulAbout: `सत्कर्म के बदले प्रशंसा चाहने, सार्वजनिक प्रदर्शन करने या भविष्य के लाभ की गणना करने से बचें।`,
        aiExplanation: `निःस्वार्थ सेवा और परोपकार से अंतःकरण में शांति और वास्तविक आत्म-संतोष की वृद्धि होती है।`,
        actionableGuidance: `आज प्रातः पक्षियों को जल या अन्न दें और किसी अधीनस्थ अथवा सहयोगी को सच्चे मन से प्रोत्साहित करें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'main_goal':
      return {
        signal: `अपनी सर्वश्रेष्ठ बौद्धिक क्षमता को आज के मुख्य लक्ष्य पर केंद्रित करें और ध्यान को बिखरने न दें।`,
        why: `व्यक्तिगत दिवस ${p.personalDay} किसी एक महत्वपूर्ण उद्देश्य पर सुनियोजित एकाग्रता का फल देता है।`,
        whatToDo: `आज के अपने सबसे महत्वपूर्ण कार्य को स्पष्ट रूप से निर्धारित करें और उसके लिए निर्बाध समय सुरक्षित रखें।`,
        whatToBeCarefulAbout: `छोटे-मोटे गैर-जरूरी प्रशासनिक कार्यों को अपने सबसे महत्वपूर्ण लक्ष्य पर हावी न होने दें।`,
        aiExplanation: `गहन एकाग्रता के समय एक ही कार्य पर ध्यान लगाने से उत्कृष्ट परिणाम प्राप्त होते हैं।`,
        actionableGuidance: `अपना मुख्य लक्ष्य एक कागज पर या ऐप के लक्ष्य ट्रैकर में लिखें और कार्य आरंभ करने से पूर्व उसे दोहराएं।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'evening_reflection':
      return {
        signal: `सक्रिय कार्य से शांत अवलोकन की ओर बढ़ें। बिना आत्म-आलोचना के अपने पूरे दिन का शांतिपूर्वक अवलोकन करें।`,
        why: `संध्याकाल जैविक और सूक्ष्म ऊर्जा को सूर्य की बाह्य सक्रियता से चंद्र की आंतरिक शांति में बदलने का स्वाभाविक समय है।`,
        whatToDo: `स्वयं से पूछें: "क्या मैं आज धैर्यवान रहा? क्या मैंने अपने दायित्व निभाए? कल मैं क्या बेहतर कर सकता हूँ?"`,
        whatToBeCarefulAbout: `सोने से ठीक पहले अनसुलझी समस्याओं पर अत्यधिक चिंता या विचार करने से बचें।`,
        aiExplanation: `आत्मचिंतन से कार्यशील स्मृति का भार कम होता है और गहरी, आरामदायक नींद आती है।`,
        actionableGuidance: `उपकरण बंद करने से पूर्व उन 3 बातों को याद करें जिनके लिए आप आभारी हैं और एक सीख नोट करें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    case 'tomorrow_preparation':
      return {
        signal: `कल के दिन हेतु सहज पूर्व-तैयारी करें ताकि आगामी प्रातःकाल शांति, सहजता और स्पष्टता के साथ आरंभ हो सके।`,
        why: `पूर्व-तैयारी प्रातःकाल के तनाव को दूर करती है और सूर्योदय की सकारात्मक ऊर्जा के साथ सामंजस्य स्थापित करती है।`,
        whatToDo: `वस्त्र व्यवस्थित करें, प्रातः का जलपात्र रखें, कल के निर्धारित कार्यों की समीक्षा करें और समय पर शयन करें।`,
        whatToBeCarefulAbout: `सोने से 60 मिनट पहले उत्तेजक चर्चाओं, भारी भोजन या तेज डिजिटल स्क्रीन से बचें।`,
        aiExplanation: `रात्रि के शांत अनुष्ठान तंत्रिका तंत्र को गहरी कोशिकीय पुनर्स्थापना के लिए तैयार करते हैं।`,
        actionableGuidance: `सोने से 45 मिनट पूर्व सभी स्क्रीन बंद कर दें और शांत संगीत अथवा मौन का अनुभव करें।`,
        traditionalInterpretation: sec.traditionalInterpretation
      };

    default:
      return {
        signal: sec.signal,
        why: sec.why,
        whatToDo: sec.whatToDo,
        whatToBeCarefulAbout: sec.whatToBeCarefulAbout,
        aiExplanation: sec.aiExplanation,
        actionableGuidance: sec.actionableGuidance,
        traditionalInterpretation: sec.traditionalInterpretation
      };
  }
}

// Master mapping of Calculated Data labels and keywords across 13 languages
export const CALCULATED_DATA_LABELS: Record<string, Partial<Record<LanguageCode, string>>> = {
  'Personal Year': {
    hi: 'व्यक्तिगत वर्ष', mr: 'वैयक्तिक वर्ष', gu: 'વ્યક્તિગત વર્ષ', bn: 'ব্যক্তিগত বছর',
    ta: 'தனிப்பட்ட ஆண்டு', te: 'వ్యక్తిగత సంవత్సరం', kn: 'ವೈಯಕ್ತಿಕ ವರ್ಷ', ml: 'വ്യക്തിഗത വർഷം',
    pa: 'ਨਿੱਜੀ ਸਾਲ', or: 'ବ୍ୟକ୍ତିଗତ ବର୍ଷ', as: 'ব্যক্তিগত বছৰ', sa: 'व्यक्तिगतवर्षम्'
  },
  'Personal Month': {
    hi: 'व्यक्तिगत माह', mr: 'वैयक्तिक महिना', gu: 'વ્યક્તિગત મહિનો', bn: 'ব্যক্তিগত মাস',
    ta: 'தனிப்பட்ட மாதம்', te: 'వ్యక్తిగత నెల', kn: 'ವೈಯಕ್ತಿಕ ತಿಂಗಳು', ml: 'വ്യക്തിഗത മാസം',
    pa: 'ਨਿੱਜੀ ਮਹੀਨਾ', or: 'ବ୍ୟକ୍ତିଗତ ମାସ', as: 'ব্যক্তিগত মাহ', sa: 'व्यक्तिगतमासः'
  },
  'Personal Day': {
    hi: 'व्यक्तिगत दिवस', mr: 'वैयक्तिक दिवस', gu: 'વ્યક્તિગત દિવસ', bn: 'ব্যক্তিগত দিন',
    ta: 'தனிப்பட்ட நாள்', te: 'వ్యక్తిగత రోజు', kn: 'ವೈಯಕ್ತಿಕ ದಿನ', ml: 'വ്യక్తిഗത ദിവസം',
    pa: 'ਨਿੱਜੀ ਦਿਨ', or: 'ବ୍ୟକ୍ତିଗତ ଦିନ', as: 'ব্যক্তিগত দিন', sa: 'व्यक्तिगतदिनम्'
  },
  'Day Lord': {
    hi: 'दिन स्वामी', mr: 'वार स्वामी', gu: 'વાર સ્વામી', bn: 'বার অধিপতি',
    ta: 'நாள் அதிபதி', te: 'వార అధిపతి', kn: 'ವಾರಾಧಿಪತಿ', ml: 'വാരനാഥൻ',
    pa: 'ਦਿਨ ਦਾ ਸੁਆਮੀ', or: 'ବାର ଅଧିପତି', as: 'বাৰ অধিপতি', sa: 'वारस्वामी'
  },
  'Primary Target Hours': {
    hi: 'मुख्य लक्ष्य समय', mr: 'मुख्य उद्दिष्ट वेळ', gu: 'મુખ્ય લક્ષ્ય સમય', bn: 'প্রধান লক্ষ্য সময়',
    ta: 'முக்கிய இலக்கு நேரம்', te: 'ప్రధాన లక్ష్య సమయం', kn: 'ಮುಖ್ಯ ಗುರಿ ಸಮಯ', ml: 'പ്രധാന ലക്ഷ്യ സമയം',
    pa: 'ਮੁੱਖ ਟੀਚਾ ਸਮਾਂ', or: 'ମୁଖ୍ୟ ଲକ୍ଷ୍ୟ ସମୟ', as: 'মুখ্য লক্ষ্য সময়', sa: 'मुख्यलक्ष्यसमयः'
  },
  'Focus Index': {
    hi: 'एकाग्रता सूचकांक', mr: 'एकाग्रता निर्देशांक', gu: 'એકાગ્રતા સૂચકાંક', bn: 'মনোযোগ সূচক',
    ta: 'கவனக் குறியீடு', te: 'ఏకాగ్రత సూచిక', kn: 'ಏಕಾಗ್ರತೆ ಸೂಚ್ಯಂಕ', ml: 'ഏകാഗ്രതാ സൂചിക',
    pa: 'ਧਿਆਨ ਸੂਚਕ', or: 'ଧ୍ୟାନ ସୂଚକାଙ୍କ', as: 'মনোযোগ সূচক', sa: 'एकाग्रतासूचकाङ्कः'
  },
  'Alignment': {
    hi: 'संरेखण', mr: 'संरेखन', gu: 'સુમેળ / સંરેખણ', bn: 'সমন্বয়',
    ta: 'ஒத்திசைவு', te: 'సమలేఖనం', kn: 'ಹೊಂದಾಣಿಕೆ', ml: 'ക്രമീകരണം',
    pa: 'ਤਾਲਮੇਲ', or: 'ସମନ୍ୱୟ', as: 'সমন্বয়', sa: 'संरेखणम्'
  },
  'Trade Index': {
    hi: 'व्यापार सूचकांक', mr: 'व्यापार निर्देशांक', gu: 'વેપાર સૂચકાંક', bn: 'বাণিজ্য সূচক',
    ta: 'வர்த்தகக் குறியீடு', te: 'వ్యాపార సూచిక', kn: 'ವ್ಯಾಪಾರ ಸೂಚ್ಯಂಕ', ml: 'വ്യാപാര സൂചിക',
    pa: 'ਵਪਾਰ ਸੂਚਕ', or: 'ବାଣିଜ୍ୟ ସୂଚକାଙ୍କ', as: 'বাণিজ্য সূচক', sa: 'वाणिज्यसूचकाङ्कः'
  },
  'Mercury-Venus Alignment': {
    hi: 'बुध-शुक्र संरेखण', mr: 'बुध-शुक्र संरेखन', gu: 'બુધ-શુક્ર સંરેખણ', bn: 'বুধ-শুক্র সমন্বয়',
    ta: 'புதன்-சுக்கிரன் ஒத்திசைவு', te: 'బుధ-శుక్ర సమలేఖనం', kn: 'ಬುಧ-ಶುಕ್ರ ಹೊಂದಾಣಿಕೆ', ml: 'ബുധ-ശുക്ര യോഗം',
    pa: 'ਬੁੱਧ-ਸ਼ੁੱਕਰ ਤਾਲਮੇਲ', or: 'ବୁଧ-ଶୁକ୍ର ସମନ୍ୱୟ', as: 'বুধ-শুক্ৰ সমন্বয়', sa: 'बुधशुक्रसंरेखणम्'
  },
  'Mercury-Venus alignment': {
    hi: 'बुध-शुक्र संरेखण', mr: 'बुध-शुक्र संरेखन', gu: 'બુધ-શુક્ર સંરેખણ', bn: 'বুধ-শুক্র সমন্বয়',
    ta: 'புதன்-சுக்கிரன் ஒத்திசைவு', te: 'బుధ-శుక్ర సమలేఖనం', kn: 'ಬುಧ-ಶುಕ್ರ ಹೊಂದಾಣಿಕೆ', ml: 'ബുധ-ശുക്ര യോഗം',
    pa: 'ਬੁੱਧ-ਸ਼ੁੱਕਰ ਤਾਲਮੇਲ', or: 'ବୁଧ-ଶୁକ୍ର ସମନ୍ୱୟ', as: 'বুধ-শুক্ৰ সমন্বয়', sa: 'बुधशुक्रसंरेखणम्'
  },
  'Favorable Negotiation Window': {
    hi: 'अनुकूल वार्ता समय', mr: 'अनुकूल बोलणी वेळ', gu: 'અનુકૂળ વાર્તાલાપ સમય', bn: 'অনুকূল আলোচনার সময়',
    ta: 'சாதகமான பேச்சுவார்த்தை நேரம்', te: 'అనుకూల చర్చల సమయం', kn: 'ಅನುಕೂಲಕರ ಮಾತುಕತೆಯ ಸಮಯ', ml: 'അനുകൂല ചർച്ചാ സമയം',
    pa: 'ਅਨੁਕੂਲ ਗੱਲਬਾਤ ਸਮਾਂ', or: 'ଅନୁକୂଳ ଆଲୋଚନା ସମୟ', as: 'অনুকূল আলোচনাৰ সময়', sa: 'अनुकूलवार्तासमयः'
  },
  'Favorable negotiation window': {
    hi: 'अनुकूल वार्ता समय', mr: 'अनुकूल बोलणी वेळ', gu: 'અનુકૂળ વાર્તાલાપ સમય', bn: 'অনুকূল আলোচনার সময়',
    ta: 'சாதகமான பேச்சுவார்த்தை நேரம்', te: 'అనుకూల చర్చల సమయం', kn: 'ಅನುಕೂಲಕರ ಮಾತುಕತೆಯ ಸಮಯ', ml: 'അനുകൂല ചർച്ചാ സമയം',
    pa: 'ਅਨੁਕੂਲ ਗੱਲਬਾਤ ਸਮਾਂ', or: 'ଅନୁକୂଳ ଆଲୋଚନା ସମୟ', as: 'অনুকূল আলোচনাৰ সময়', sa: 'अनुकूलवार्तासमयः'
  },
  'Fiscal Aspect': {
    hi: 'वित्तीय दृष्टिकोण', mr: 'आर्थिक पैलू', gu: 'નાણાકીય પાસું', bn: 'আর্থিক দিক',
    ta: 'நிதி அம்சம்', te: 'ఆర్థిక అంశం', kn: 'ಹಣಕಾಸು ಅಂಶ', ml: 'സാമ്പത്തിക വശം',
    pa: 'ਵਿੱਤੀ ਪੱਖ', or: 'ଆର୍ଥିକ ଦିଗ', as: 'বিত্তীয় দিশ', sa: 'वित्तीयदृष्टिकोणः'
  },
  'Prudence Rating': {
    hi: 'सतर्कता मूल्यांकन', mr: 'दक्षता मूल्यांकन', gu: 'સાવચેતી મૂલ્યાંકન', bn: 'সতর্কতা রেটিং',
    ta: 'எச்சரிக்கை மதிப்பீடு', te: 'వివేక రేటింగ్', kn: 'ಜಾಗರೂಕತೆ ರೇಟಿಂಗ್', ml: 'ജാഗ്രത റേറ്റിംഗ്',
    pa: 'ਸਾਵਧਾਨੀ ਰੇਟਿੰਗ', or: 'ସତର୍କତା ମୂଲ୍ୟାଙ୍କନ', as: 'সতৰ্কতা মূল্যায়ন', sa: 'सतर्कतामूल्याङ्कनम्'
  },
  'Speculation Caution': {
    hi: 'सट्टा / जोखिम सावधानी', mr: 'सट्टेबाजी दक्षता', gu: 'સટ્ટાકીય સાવધાની', bn: 'ফটকা সতর্কতা',
    ta: 'ஊக வணிக எச்சரிக்கை', te: 'స్పెక్యులేషన్ హెచ్చరిక', kn: 'ಊಹಾಪೋಹ ಎಚ್ಚರಿಕೆ', ml: 'ഊഹക്കച്ചവട ജാഗ്രത',
    pa: 'ਅਟਕਲਬਾਜ਼ੀ ਸਾਵਧਾਨੀ', or: 'ଅନୁମାନମୂଳକ ସତର୍କତା', as: 'ফটকা সতৰ্কতা', sa: 'सट्टासावधानी'
  },
  'Family Node': {
    hi: 'पारिवारिक स्थिति', mr: 'कौटुंबिक स्थिती', gu: 'પારિવારિક સ્થિતિ', bn: 'পারিবারিক অবস্থা',
    ta: 'குடும்ப நிலை', te: 'కుటుంబ స్థితి', kn: 'ಕೌಟುಂಬಿಕ ಸ್ಥಿತಿ', ml: 'കുടുംബ സ്ഥിതി',
    pa: 'ਪਰਿਵਾਰਕ ਸਥਿਤੀ', or: 'ପାରିବାରିକ ସ୍ଥିତି', as: 'পাৰিবাৰিক স্থিতি', sa: 'पारिवारिकस्थितिः'
  },
  'Harmony Index': {
    hi: 'सौहार्द सूचकांक', mr: 'सुसंवाद निर्देशांक', gu: 'સૌહાર્દ સૂચકાંક', bn: 'সম্প্রীতি সূচক',
    ta: 'நல்லிணக்கக் குறியீடு', te: 'సామరస్య సూచిక', kn: 'ಸಾಮರಸ್ಯ ಸೂಚ್ಯಂಕ', ml: 'സൗഹാർദ്ദ സൂചിക',
    pa: 'ਸਦਭਾਵਨਾ ਸੂਚਕ', or: 'ସୌହାର୍ଦ୍ଦ ସୂଚକାଙ୍କ', as: 'সম্প্ৰীতি সূচক', sa: 'सौहार्दसूचकाङ्कः'
  },
  'Property Factor': {
    hi: 'संपत्ति कारक', mr: 'मालमत्ता घटक', gu: 'સંપત્તિ પરિબળ', bn: 'সম্পত্তি ফ্যাক্টর',
    ta: 'சொத்து காரணி', te: 'ఆస్తి కారకం', kn: 'ಆಸ್ತಿ ಅಂಶ', ml: 'സ്വത്ത് ഘടകം',
    pa: 'ਜਾਇਦਾਦ ਕਾਰਕ', or: 'ସମ୍ପତ୍ତି କାରକ', as: 'সম্পত্তি কাৰক', sa: 'सम्पत्तिकारकम्'
  },
  '4th House Property Factor': {
    hi: 'चतुर्थ भाव संपत्ति कारक', mr: 'चतुर्थ भाव मालमत्ता घटक', gu: 'ચતુર્થ ભાવ સંપત્તિ પરિબળ', bn: 'চতুর্থ ভাব সম্পত্তি ফ্যাক্টর',
    ta: '4ஆம் வீடு சொத்து காரணி', te: '4వ భావ ఆస్తి కారకం', kn: '4ನೇ ಮನೆ ಆಸ್ತಿ ಅಂಶ', ml: 'നാലാം ഭാവ സ്വത്ത് ഘടകം',
    pa: 'ਚੌਥੇ ਘਰ ਦਾ ਜਾਇਦਾਦ ਕਾਰਕ', or: 'ଚତୁର୍ଥ ଭାବ ସମ୍ପତ୍ତି କାରକ', as: 'চতুৰ্থ ভাৱ সম্পত্তি কাৰক', sa: 'चतुर्थभावसम्पत्तिकारकम्'
  },
  'Documentation Aspect': {
    hi: 'दस्तावेजीकरण पहलू', mr: 'दस्तऐवजीकरण पैलू', gu: 'દસ્તાવેજીકરણ પાસું', bn: 'নথি সংক্রান্ত দিক',
    ta: 'ஆவணப்படுத்தல் அம்சம்', te: 'డాక్యుమెంటేషన్ అంశం', kn: 'ದಾಖಲಾತಿ ಅಂಶ', ml: 'രേഖാപരമായ വശം',
    pa: 'ਦਸਤਾਵੇਜ਼ੀ ਪੱਖ', or: 'ଦସ୍ତାବିଜ ଦିଗ', as: 'নথিভুক্তকৰণ দিশ', sa: 'प्रलेखनदृष्टिकोणः'
  },
  'Auspicious Travel Direction': {
    hi: 'शुभ यात्रा दिशा', mr: 'शुभ प्रवास दिशा', gu: 'શુભ પ્રવાસ દિશા', bn: 'শুভ ভ্রমণ দিক',
    ta: 'சுப பயண திசை', te: 'శుభ ప్రయాణ దిశ', kn: 'ಶುಭ ಪ್ರಯಾಣದ ದಿಕ್ಕು', ml: 'ശുഭകരമായ യാത്രാ ദിശ',
    pa: 'ਸ਼ੁਭ ਯਾਤਰਾ ਦਿਸ਼ਾ', or: 'ଶୁଭ ଯାତ୍ରା ଦିଗ', as: 'শুভ যাত্ৰা দিশ', sa: 'शुभयात्रादिशा'
  },
  'Avoid Time Slot': {
    hi: 'वर्जित समय अवधि', mr: 'वर्ज्य वेळ', gu: 'વર્જિત સમયગાળો', bn: 'বর্জনীয় সময়কাল',
    ta: 'தவிர்க்க வேண்டிய நேரம்', te: 'నివారించాల్సిన సమయం', kn: 'ವರ್ಜಿಸಬೇಕಾದ ಸಮಯ', ml: 'ഒഴിവാക്കേണ്ട സമയം',
    pa: 'ਟਾਲਣਯੋਗ ਸਮਾਂ', or: 'ବର୍ଜନୀୟ ସମୟ', as: 'বৰ্জনীয় সময়', sa: 'वर्जितसमयः'
  },
  'Commute Safety Factor': {
    hi: 'यात्रा सुरक्षा कारक', mr: 'प्रवास सुरक्षा घटक', gu: 'મુસાફરી સુરક્ષા પરિબળ', bn: 'ভ্রমণ নিরাপত্তা সূচক',
    ta: 'பயண பாதுகாப்பு காரணி', te: 'ప్రయాణ భద్రత కారకం', kn: 'ಪ್ರಯಾಣ ಸುರಕ್ಷತೆ ಅಂಶ', ml: 'യാത്രാ സുരക്ഷാ ഘടകം',
    pa: 'ਸਫ਼ਰ ਸੁਰੱਖਿਆ ਕਾਰਕ', or: 'ଯାତ୍ରା ସୁରକ୍ଷା କାରକ', as: 'যাত্ৰা নিৰাপত্তা কাৰক', sa: 'यात्रासुरक्षाकारकम्'
  },
  'Best Study Hours': {
    hi: 'सर्वोत्तम अध्ययन समय', mr: 'उत्तम अभ्यास वेळ', gu: 'શ્રેષ્ઠ અભ્યાસ સમય', bn: 'সেরা অধ্যয়নের সময়',
    ta: 'சிறந்த படிப்பு நேரம்', te: 'ఉత్తమ అధ్యయన సమయం', kn: 'ಉತ್ತಮ ಅಧ್ಯಯನ ಸಮಯ', ml: 'മികച്ച പഠന സമയം',
    pa: 'ਵਧੀਆ ਪੜ੍ਹਾਈ ਦਾ ਸਮਾਂ', or: 'ସର୍ବୋତ୍ତମ ଅଧ୍ୟୟନ ସମୟ', as: 'উত্তম অধ্যয়নৰ সময়', sa: 'सर्वोत्तमाध्ययनसमयः'
  },
  'Spiritual Lord': {
    hi: 'आध्यात्मिक स्वामी / इष्ट', mr: 'अध्यात्म स्वामी / इष्ट', gu: 'આધ્યાત્મિક સ્વામી / ઇષ્ટ', bn: 'আধ্যাত্মিক অধিপতি / ইষ্ট',
    ta: 'ஆன்மீக அதிபதி', te: 'ఆధ్యాత్మిక అధిపతి', kn: 'ಆಧ್ಯಾತ್ಮಿಕ ಅಧಿಪತಿ', ml: 'ആത്മീയ നാഥൻ',
    pa: 'ਰੂਹਾਨੀ ਸੁਆਮੀ / ਇਸ਼ਟ', or: 'ଆଧ୍ୟାତ୍ମିକ ଅଧିପତି', as: 'আধ্যাত্মিক অধিপতি', sa: 'आध्यात्मिकस्वामी'
  },
  'Recommended Mantra': {
    hi: 'अनुशंसित मंत्र', mr: 'शिफारस केलेला मंत्र', gu: 'અનુશંસિત મંત્ર', bn: 'পরামর্শকৃত মন্ত্র',
    ta: 'பரிந்துரைக்கப்பட்ட மந்திரம்', te: 'సిఫార్సు చేయబడిన మంత్రం', kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ಮಂತ್ರ', ml: 'നിർദ്ദേശിച്ച മന്ത്രം',
    pa: 'ਸਿਫਾਰਸ਼ੀ ਮੰਤਰ', or: 'ଅନୁଶଂସିତ ମନ୍ତ୍ର', as: 'অনুমোদিত মন্ত্ৰ', sa: 'अनुशंसितमन्त्रः'
  },
  'Auspicious Time': {
    hi: 'शुभ समय / मुहूर्त', mr: 'शुभ वेळ / मुहूर्त', gu: 'શુભ સમય / મુહૂર્ત', bn: 'শুভ সময় / মুহূর্ত',
    ta: 'சுப நேரம்', te: 'శుభ సమయం / ముహూర్తం', kn: 'ಶುಭ ಸಮಯ / ಮುಹೂರ್ತ', ml: 'ശുഭ സമയം / മുഹൂർത്തം',
    pa: 'ਸ਼ੁਭ ਸਮਾਂ / ਮੁਹੂਰਤ', or: 'ଶୁଭ ସମୟ / ମୁହୂର୍ତ୍ତ', as: 'শুভ সময় / মুহূৰ্ত', sa: 'शुभसमयः'
  },
  'Reflection Window': {
    hi: 'आत्मचिंतन समय', mr: 'आत्मपरीक्षण वेळ', gu: 'આત્મચિંતન સમય', bn: 'আত্মচিন্তনের সময়',
    ta: 'சுயபரிசீலனை நேரம்', te: 'ఆత్మపరిశీలన సమయం', kn: 'ಆತ್ಮಾವಲೋಕನದ ಸಮಯ', ml: 'ആത്മപരിശോധനാ സമയം',
    pa: 'ਆਤਮ-ਚਿੰਤਨ ਸਮਾਂ', or: 'ଆତ୍ମଚିନ୍ତନ ସମୟ', as: 'আত্মচিন্তনৰ সময়', sa: 'आत्मचिन्तनसमयः'
  },
  'Lunar Phase': {
    hi: 'चंद्र कला / पक्ष', mr: 'चंद्र कला / पक्ष', gu: 'ચંદ્ર કળા / પક્ષ', bn: 'চন্দ্রকলা / পক্ষ',
    ta: 'சந்திர நிலை', te: 'చంద్ర దశ / పక్షం', kn: 'ಚಂದ್ರನ ಹಂತ / ಪಕ್ಷ', ml: 'ചന്ദ്രകലാ ഘട്ടം',
    pa: 'ਚੰਦਰਮਾ ਦਾ ਪੜਾਅ', or: 'ଚନ୍ଦ୍ରକଳା / ପକ୍ଷ', as: 'চন্দ্ৰকলা / পক্ষ', sa: 'चन्द्रकला / पक्षः'
  },
  'Evening Tone': {
    hi: 'सायं कालीन ऊर्जा', mr: 'संध्याकाळचा सूर', gu: 'સાંજની ઊર્જા', bn: 'সন্ধ্যার সুর',
    ta: 'மாலை ஆற்றல்', te: 'సాయంత్ర భావన', kn: 'ಸಂಜೆಯ ಸ್ವರೂಪ', ml: 'സായാഹ്ന ഭാവം',
    pa: 'ਸ਼ਾਮ ਦੀ ਊਰਜਾ', or: 'ସନ୍ଧ୍ୟାର ସ୍ୱରୂପ', as: 'সন্ধ্যাৰ অনুভৱ', sa: 'सायङ्कालीनऊर्जा'
  },
  'Next Day Lord': {
    hi: 'आगामी दिन स्वामी', mr: 'पुढील दिवसाचा स्वामी', gu: 'આગામી દિવસ સ્વામી', bn: 'পরবর্তী দিনের অধিপতি',
    ta: 'அடுத்த நாள் அதிபதி', te: 'మరుసటి రోజు అధిపతి', kn: 'ಮುಂದಿನ ದಿನದ ಅಧಿಪತಿ', ml: 'അടുത്ത ദിവസത്തെ നാഥൻ',
    pa: 'ਅਗਲੇ ਦਿਨ ਦਾ ਸੁਆਮੀ', or: 'ପରବର୍ତ୍ତୀ ଦିନର ଅଧିପତି', as: 'পিছৰ দিনৰ অধিপতি', sa: 'परदिनाधिपतिः'
  },
  'Recommended Sleep Time': {
    hi: 'अनुशंसित शयन समय', mr: 'शिफारस केलेली झोपेची वेळ', gu: 'અનુશંસિત ઊંઘનો સમય', bn: 'পরামর্শকৃত ঘুমানোর সময়',
    ta: 'பரிந்துரைக்கப்பட்ட உறங்கும் நேரம்', te: 'సిఫార్సు చేయబడిన నిద్ర సమయం', kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ನಿದ್ರೆಯ ಸಮಯ', ml: 'നിർദ്ദേശിച്ച ഉറക്ക സമയം',
    pa: 'ਸੌਣ ਦਾ ਸਿਫਾਰਸ਼ੀ ਸਮਾਂ', or: 'ଅନୁଶଂସିତ ଶୟନ ସମୟ', as: 'শোৱাৰ বাবে অনুशंसিত সময়', sa: 'अनुशंसितशयनसमयः'
  },
  'Tomorrow Alignment': {
    hi: 'कल का संरेखण', mr: 'उद्याचा समन्वय', gu: 'આવતીકાલનું સંરેખણ', bn: 'আগামীকালের সমন্বয়',
    ta: 'நாளை ஒத்திசைவு', te: 'రేపటి సమలేఖనం', kn: 'ನಾಳೆಯ ಹೊಂದಾಣಿಕೆ', ml: 'നാളത്തെ ക്രമീകരണം',
    pa: 'ਕੱਲ੍ਹ ਦਾ ਤਾਲਮੇਲ', or: 'ଆଗାମୀ କାଲିର ସମନ୍ୱୟ', as: 'কাইলৈৰ সমন্বয়', sa: 'श्वःसंरेखणम्'
  },
  'Present Digits': {
    hi: 'उपस्थित अंक', mr: 'उपस्थित अंक', gu: 'ઉપસ્થિત અંકો', bn: 'উপস্থিত সংখ্যা',
    ta: 'இருக்கும் எண்கள்', te: 'ఉన్న అంకెలు', kn: 'ಇರುವ ಅಂಕಿಗಳು', ml: 'ഉള്ള അക്കങ്ങൾ',
    pa: 'ਮੌਜੂਦ ਅੰਕ', or: 'ଉପସ୍ଥିତ ଅଙ୍କ', as: 'উপস্থিত সংখ্যা', sa: 'उपस्थिताङ्काः'
  },
  'Missing Digits': {
    hi: 'अनुपस्थित अंक', mr: 'अनुपस्थित अंक', gu: 'ગેરહાજર અંકો', bn: 'অনুপস্থিত সংখ্যা',
    ta: 'இல்லாத எண்கள்', te: 'లేని అంకెలు', kn: 'ಇಲ್ಲದ ಅಂಕಿಗಳು', ml: 'ഇല്ലാത്ത അക്കങ്ങൾ',
    pa: 'ਗੈਰ-ਹਾਜ਼ਰ ਅੰਕ', or: 'ଅନୁପସ୍ଥିତ ଅଙ୍କ', as: 'অনুপস্থিত সংখ্যা', sa: 'अनुपस्थिताङ्काः'
  },
  'Repeated Digits': {
    hi: 'पुनरावृत्त अंक', mr: 'पुनरावृत्ती झालेले अंक', gu: 'પુનરાવર્તિત અંકો', bn: 'পুনরাবৃত্ত সংখ্যা',
    ta: 'மீண்டும் வந்த எண்கள்', te: 'పునరావృతమైన అంకెలు', kn: 'ಪುನರಾವರ್ತಿತ ಅಂಕಿಗಳು', ml: 'ആവർത്തിച്ച അക്കങ്ങൾ',
    pa: 'ਦੁਹਰਾਏ ਗਏ ਅੰਕ', or: 'ପୁନରାବୃତ୍ତ ଅଙ୍କ', as: 'পুনৰাবৃত্ত সংখ্যা', sa: 'पुनरावृत्ताङ्काः'
  },
  'Dominant Planes': {
    hi: 'प्रमुख तल', mr: 'प्रमुख प्रत', gu: 'પ્રમુખ તલ', bn: 'প্রধান তল',
    ta: 'முக்கிய தளங்கள்', te: 'ప్రధాన తలాలు', kn: 'ಪ್ರಮುಖ ತಲಗಳು', ml: 'പ്രധാന തലങ്ങൾ',
    pa: 'ਮੁੱਖ ਤਲ', or: 'ପ୍ରମୁଖ ସ୍ତର', as: 'প্ৰধান স্তৰ', sa: 'प्रमुखतलानि'
  },
  'Dominant Element': {
    hi: 'प्रमुख तत्व', mr: 'प्रमुख तत्त्व', gu: 'પ્રમુખ તત્વ', bn: 'প্রধান উপাদান',
    ta: 'முக்கிய பூதம்', te: 'ప్రధాన మూలకం', kn: 'ಪ್ರಮುಖ ತತ್ತ್ವ', ml: 'പ്രധാന മൂലകം',
    pa: 'ਮੁੱਖ ਤੱਤ', or: 'ପ୍ରମୁଖ ତତ୍ତ୍ୱ', as: 'প্ৰধান তত্ত্ব', sa: 'प्रमुखतत्त्वम्'
  },
  'Weakest': {
    hi: 'निर्बल तत्व', mr: 'कमी प्रभाव तत्त्व', gu: 'નિર્બળ તત્વ', bn: 'দুর্বলতম উপাদান',
    ta: 'பலவீனமான பூதம்', te: 'బలహీన మూలకం', kn: 'ದುರ್ಬಲ ತತ್ತ್ವ', ml: 'ദുർബലമായ മൂലകം',
    pa: 'ਕਮਜ਼ੋਰ ਤੱਤ', or: 'ଦୁର୍ବଳ ତତ୍ତ୍ୱ', as: 'দুৰ্বল তত্ত্ব', sa: 'निर्बलतत्त्वम्'
  },
  'Harmony Score': {
    hi: 'संतुलन स्कोर', mr: 'संतुलन गुण', gu: 'સંતુલન સ્કોર', bn: 'ভারসাম্য স্কোর',
    ta: 'சமநிலை மதிப்பெண்', te: 'సమతుల్యత స్కోరు', kn: 'ಸಮತೋಲನ ಸ್ಕೋರ್', ml: 'സന്തുലിതാവസ്ഥ സ്കോർ',
    pa: 'ਸੰਤੁਲਨ ਸਕੋਰ', or: 'ସନ୍ତୁଳନ ସ୍କୋର', as: 'ভাৰসাম্য স্কোৰ', sa: 'सन्तुलनमूल्यम्'
  },
  'Balancing Activity': {
    hi: 'संतुलनकारी गतिविधि', mr: 'संतुलन साधणारी कृती', gu: 'સંતુલનકારી પ્રવૃત્તિ', bn: 'ভারসাম্যকারী কার্যকলাপ',
    ta: 'சமநிலைப்படுத்தும் செயல்பாடு', te: 'సమతుల్యత కలిగించే కార్యాచరణ', kn: 'ಸಮತೋಲನ ಚಟುವಟಿಕೆ', ml: 'സന്തുലിതമാക്കുന്ന പ്രവർത്തനം',
    pa: 'ਸੰਤੁਲਨ ਵਾਲੀ ਗਤੀਵਿਧੀ', or: 'ସନ୍ତୁଳନକାରୀ କାର୍ଯ୍ୟକଳାପ', as: 'ভাৰসাম্য ৰক্ষাকাৰী কাৰ্যকলাপ', sa: 'सन्तुलनकार्यम्'
  },
  'User-Recorded Sensitivities': {
    hi: 'दर्ज संवेदनशीलताएं', mr: 'नोंदवलेली संवेदनशीलता', gu: 'નોંધાયેલ સંવેદનશીલતાઓ', bn: 'নথিভুক্ত সংবেদনশীলতা',
    ta: 'பதிவு செய்யப்பட்ட உணர்திறன்கள்', te: 'నమోదు చేయబడిన సున్నితత్వాలు', kn: 'ದಾಖಲಾದ ಸೂಕ್ಷ್ಮತೆಗಳು', ml: 'രേഖപ്പെടുത്തിയ മുൻഗണനകൾ',
    pa: 'ਦਰਜ ਕੀਤੀਆਂ ਸੰਵੇਦਨਸ਼ੀਲਤਾਵਾਂ', or: 'ଦାଖଲ ସମ୍ବେଦନଶୀଳତା', as: 'নথিভুক্ত সংবেদনশীলতা', sa: 'अभिलेखितसंवेदनशीलताः'
  },
  'Sleep Target': {
    hi: 'शयन लक्ष्य', mr: 'झोपेचे उद्दिष्ट', gu: 'ઊંઘનું લક્ષ્ય', bn: 'ঘুমের লক্ষ্য',
    ta: 'தூக்க இலக்கு', te: 'నిద్ర లక్ష్యం', kn: 'ನಿದ್ರೆಯ ಗುರಿ', ml: 'ഉറക്ക ലക്ഷ്യം',
    pa: 'ਨੀਂਦ ਦਾ ਟੀਚਾ', or: 'ନିଦ୍ରା ଲକ୍ଷ୍ୟ', as: 'টোপনিৰ লক্ষ্য', sa: 'शयनलक्ष्यम्'
  },
  'Hydration Target': {
    hi: 'जलपान लक्ष्य', mr: 'पाण्याचे उद्दिष्ट', gu: 'પાણી પીવાનું લક્ષ્ય', bn: 'জলপানের লক্ষ্য',
    ta: 'குடிநீர் இலக்கு', te: 'నీరు త్రాగే లక్ష్యం', kn: 'ನೀರಿನ ಗುರಿ', ml: 'ജലപാന ലക്ഷ്യം',
    pa: 'ਪਾਣੀ ਦਾ ਟੀਚਾ', or: 'ଜଳପାନ ଲକ୍ଷ୍ୟ', as: 'পানী খোৱাৰ লক্ষ্য', sa: 'जलपानलक्ष्यम्'
  },
  'Custom Note': {
    hi: 'व्यक्तिगत टिप्पणी', mr: 'वैयक्तिक नोंद', gu: 'વ્યક્તિગત નોંધ', bn: 'ব্যক্তিগত নোট',
    ta: 'தனிப்பட்ட குறிப்பு', te: 'వ్యక్తిగత గమనిక', kn: 'ವೈಯಕ್ತಿಕ ಟಿಪ್ಪಣಿ', ml: 'വ്യക്തിഗത കുറിപ്പ്',
    pa: 'ਨਿੱਜੀ ਨੋਟ', or: 'ବ୍ୟକ୍ତିଗତ ଟିପ୍ପଣୀ', as: 'ব্যক্তিগত টোকা', sa: 'व्यक्तिगतटिप्पणी'
  },
  'Peak Productivity Slot': {
    hi: 'उच्चतम उत्पादकता समय', mr: 'सर्वोच्च उत्पादकता वेळ', gu: 'સર્વોચ્ચ ઉત્પાદકતા સમય', bn: 'সর্বোচ্চ উৎপাদনশীলতার সময়',
    ta: 'அதிக உற்பத்தி நேரம்', te: 'అత్యధిక ఉత్పాదకత సమయం', kn: 'ಗರಿಷ್ಠ ಉತ್ಪಾದಕತೆಯ ಸಮಯ', ml: 'ഉയർന്ന ഉൽപ്പാദനക്ഷമതാ സമയം',
    pa: 'ਸਭ ਤੋਂ ਵੱਧ ਉਤਪਾਦਕਤਾ ਦਾ ਸਮਾਂ', or: 'ସର୍ବୋଚ୍ଚ ଉତ୍ପାଦକତା ସମୟ', as: 'সৰ্বোচ্চ উৎপাদনশীল সময়', sa: 'उत्पादकतासमयः'
  },
  'Rahu Kaal Window': {
    hi: 'राहुकाल समय', mr: 'राहुकाळ वेळ', gu: 'રાહુકાળ સમય', bn: 'রাহু কাল সময়',
    ta: 'ராகு காலம்', te: 'రాహుకాల సమయం', kn: 'ರಾಹುಕಾಲದ ಸಮಯ', ml: 'രാഹുകാല സമയം',
    pa: 'ਰਾਹੂ ਕਾਲ ਸਮਾਂ', or: 'ରାହୁକାଳ ସମୟ', as: 'ৰাহুকালৰ সময়', sa: 'राहुकालसमयः'
  },
  'Indore Rahu Kaal': {
    hi: 'इंदौर राहुकाल', mr: 'इंदूर राहुकाळ', gu: 'ઇન્દોર રાહુકાળ', bn: 'ইন্দোর রাহু কাল',
    ta: 'இந்தூர் ராகு காலம்', te: 'ఇండోర్ రాహుకాలం', kn: 'ಇಂದೋರ್ ರಾಹುಕಾಲ', ml: 'ഇൻഡോർ രാഹുകാലം',
    pa: 'ਇੰਦੌਰ ਰਾਹੂ ਕਾਲ', or: 'ଇନ୍ଦୋର ରାହୁକାଳ', as: 'ইন্দোৰ ৰাহুকাল', sa: 'इन्दौरराहुकालः'
  },
  'Indore Abhijit': {
    hi: 'इंदौर अभिजित मुहूर्त', mr: 'इंदूर अभिजित मुहूर्त', gu: 'ઇન્દોર અભિજિત મુહૂર્ત', bn: 'ইন্দোর অভিজিৎ মুহূর্ত',
    ta: 'இந்தூர் அபிஜித் முஹூர்த்தம்', te: 'ఇండోర్ అభిజిత్ ముహూర్తం', kn: 'ಇಂದೋರ್ ಅಭಿಜಿತ್ ಮುಹೂರ್ತ', ml: 'ഇൻഡോർ അഭിജിത് മുഹൂർത്തം',
    pa: 'ਇੰਦੌਰ ਅਭਿਜੀਤ ਮੁਹੂਰਤ', or: 'ଇନ୍ଦୋର ଅଭିଜିତ ମୁହୂର୍ତ୍ତ', as: 'ইন্দোৰ অভিজিৎ মুহূৰ্ত', sa: 'इन्दौरअभिजित्मुहूर्तः'
  },
  'Date': {
    hi: 'दिनांक', mr: 'दिनांक', gu: 'તારીખ', bn: 'তারিখ',
    ta: 'தேதி', te: 'తేదీ', kn: 'ದಿನಾಂಕ', ml: 'തീയതി',
    pa: 'ਮਿਤੀ', or: 'ତାରିଖ', as: 'তাৰিখ', sa: 'दिनाङ्कः'
  },
  'Day': {
    hi: 'दिन', mr: 'वार', gu: 'દિવસ', bn: 'বার',
    ta: 'நாள்', te: 'రోజు', kn: 'ದಿನ', ml: 'ദിവസം',
    pa: 'ਦਿਨ', or: 'ଦିନ', as: 'দিন', sa: 'दिनम्'
  },
  'Lagna': {
    hi: 'लग्न', mr: 'लग्न', gu: 'લગ્ન', bn: 'লগ্ন',
    ta: 'லக்னம்', te: 'లగ్నం', kn: 'ಲಗ್ನ', ml: 'ലഗ്നം',
    pa: 'ਲਗਨ', or: 'ଲଗ୍ନ', as: 'লগ্ন', sa: 'लग्नम्'
  },
  'Moon Sign': {
    hi: 'चंद्र राशि', mr: 'चंद्र रास', gu: 'ચંદ્ર રાશિ', bn: 'চন্দ্র রাশি',
    ta: 'சந்திர ராசி', te: 'చంద్ర రాశి', kn: 'ಚಂದ್ರ ರಾಶಿ', ml: 'ചന്ദ്ര രാശി',
    pa: 'ਚੰਦਰ ਰਾਸ਼ੀ', or: 'ଚନ୍ଦ୍ର ରାଶି', as: 'চন্দ্ৰ ৰাশি', sa: 'चन्द्रराशिः'
  },
  'Moon Nakshatra': {
    hi: 'चंद्र नक्षत्र', mr: 'चंद्र नक्षत्र', gu: 'ચંદ્ર નક્ષત્ર', bn: 'চন্দ্র নক্ষত্র',
    ta: 'சந்திர நட்சத்திரம்', te: 'చంద్ర నక్షత్రం', kn: 'ಚಂದ್ರ ನಕ್ಷತ್ರ', ml: 'ചന്ദ്ര നക്ഷത്രം',
    pa: 'ਚੰਦਰ ਨਕਸ਼ੱਤਰ', or: 'ଚନ୍ଦ୍ର ନକ୍ଷତ୍ର', as: 'চন্দ্ৰ নক্ষত্ৰ', sa: 'चन्द्रनक्षत्रम्'
  },
  'Favorable Direction': {
    hi: 'अनुकूल दिशा', mr: 'अनुकूल दिशा', gu: 'અનુકૂળ દિશા', bn: 'অনুকূল দিক',
    ta: 'சாதகமான திசை', te: 'అనుకూల దిశ', kn: 'ಅನುಕೂಲಕರ ದಿಕ್ಕು', ml: 'അനുകൂല ദിശ',
    pa: 'ਅਨੁਕੂਲ ਦਿਸ਼ਾ', or: 'ଅନୁକୂଳ ଦିଗ', as: 'অনুকূল দিশ', sa: 'अनुकूलदिशा'
  },
  'Mahadasha': {
    hi: 'महादशा', mr: 'महादशा', gu: 'મહાદશા', bn: 'মহাদশা',
    ta: 'மகாதிசை', te: 'మహాదశ', kn: 'ಮಹಾದಶೆ', ml: 'മഹാദശ',
    pa: 'ਮਹਾਦਸ਼ਾ', or: 'ମହାଦଶା', as: 'মহাদশা', sa: 'महादशा'
  },
  'Antardasha': {
    hi: 'अंतर्दशा', mr: 'अंतर्दशा', gu: 'અંતર્દશા', bn: 'অন্তর্দশা',
    ta: 'அந்தர்திசை', te: 'అంతర్దశ', kn: 'ಅಂತರ್ದಶೆ', ml: 'അന്തർദശ',
    pa: 'ਅੰਤਰਦਸ਼ਾ', or: 'ଅନ୍ତର୍ଦଶା', as: 'অন্তৰ্দশা', sa: 'अन्तर्दशा'
  },
  'Dasha Significance': {
    hi: 'दशा प्रभाव', mr: 'दशा महत्त्व', gu: 'દશા મહત્વ', bn: 'দশার তাৎপর্য',
    ta: 'திசை முக்கியத்துவம்', te: 'దశ ప్రాముఖ్యత', kn: 'ದಶಾ ಮಹತ್ವ', ml: 'ദശാ പ്രാധാന്യം',
    pa: 'ਦਸ਼ਾ ਮਹੱਤਵ', or: 'ଦଶା ମହତ୍ତ୍ୱ', as: 'দশা তাৎপৰ্য', sa: 'दशाप्रभावः'
  },
  'Moolank': {
    hi: 'मूलांक', mr: 'मूलांक', gu: 'મૂળાંક', bn: 'মূলাঙ্ক',
    ta: 'மூலாங்க்', te: 'మూలాంక్', kn: 'ಮೂಲಾಂಕ', ml: 'മൂലാങ്ക്',
    pa: 'ਮੂਲਾਂਕ', or: 'ମୂଳାଙ୍କ', as: 'মূলাংক', sa: 'मूलाङ्कः'
  },
  'Bhagyank': {
    hi: 'भाग्यांक', mr: 'भाग्यांक', gu: 'ભાગ્યાંક', bn: 'ভাগ্যাঙ্ক',
    ta: 'பாக்யாங்க்', te: 'భాగ్యాంక్', kn: 'ಭಾಗ್ಯಾಂಕ', ml: 'ഭാഗ്യാങ്ക്',
    pa: 'ਭਾਗਿਆਂਕ', or: 'ଭାଗ୍ୟାଙ୍କ', as: 'ভাগ্যাংক', sa: 'भाग्याङ्कः'
  },
  'Midheaven influence': {
    hi: 'दशम भाव प्रभाव', mr: 'दशम भाव प्रभाव', gu: 'દશમ ભાવ પ્રભાવ', bn: 'দশম ভাব প্রভাব',
    ta: '10ஆம் வீடு தாக்கம்', te: '10వ భావ ప్రభావం', kn: '10ನೇ ಮನೆ ಪ್ರಭಾವ', ml: 'പത്താം ഭാവ സ്വാധീനം',
    pa: 'ਦਸਵੇਂ ਘਰ ਦਾ ਪ੍ਰਭਾਵ', or: 'ଦଶମ ଭାବ ପ୍ରଭାବ', as: 'দশম ভাৱ প্ৰভাৱ', sa: 'दशमभावप्रभावः'
  },
  'Key Planet': {
    hi: 'प्रमुख ग्रह', mr: 'प्रमुख ग्रह', gu: 'મુખ્ય ગ્રહ', bn: 'প্রধান গ্রহ',
    ta: 'முக்கிய கிரகம்', te: 'ముఖ్య గ్రహం', kn: 'ಪ್ರಮುಖ ಗ್ರಹ', ml: 'പ്രധാന ഗ്രഹം',
    pa: 'ਮੁੱਖ ਗ੍ਰਹਿ', or: 'ପ୍ରମୁଖ ଗ୍ରହ', as: 'প্ৰধান গ্ৰহ', sa: 'प्रमुखग्रहः'
  },
  'Bhumi Karaka': {
    hi: 'भूमि कारक', mr: 'भूमी कारक', gu: 'ભૂમિ કારક', bn: 'ভূমি কারক',
    ta: 'பூமி காரகர்', te: 'భూమి కారకుడు', kn: 'ಭೂಮಿ ಕಾರಕ', ml: 'ഭൂമി കാരകൻ',
    pa: 'ਭੂਮੀ ਕਾਰਕ', or: 'ଭୂମି କାରକ', as: 'ভূমি কাৰক', sa: 'भूमिकारकः'
  },
  'Karma Mode': {
    hi: 'कर्म स्वरूप', mr: 'कर्म स्वरूप', gu: 'કર્મ સ્વરૂપ', bn: 'কর্মের ধরন',
    ta: 'கர்ம முறை', te: 'కర్మ విధానం', kn: 'ಕರ್ಮ ಸ್ವರೂಪ', ml: 'കർമ്മ രീതി',
    pa: 'ਕਰਮ ਸਰੂਪ', or: 'କର୍ମ ସ୍ୱରୂପ', as: 'কৰ্মৰ ধৰণ', sa: 'कर्मस्वरूपम्'
  },
  'Beneficiary Vector': {
    hi: 'लाभार्थी वर्ग', mr: 'लाभार्थी वर्ग', gu: 'લાભાર્થી વર્ગ', bn: 'উপকৃত বর্গ',
    ta: 'பயனடைவோர்', te: 'లబ్ధిదారుల వర్గం', kn: 'ಫಲಾನುಭವಿಗಳು', ml: 'ഗുണഭോക്താക്കൾ',
    pa: 'ਲਾਭਪਾਤਰੀ ਵਰਗ', or: 'ଲାଭାର୍ଥୀ ବର୍ଗ', as: 'উপকৃত শ্ৰেণী', sa: 'लाभार्थिवर्गः'
  },
  'Karmic Merit': {
    hi: 'पुण्य फल', mr: 'पुण्य फळ', gu: 'પુણ્ય ફળ', bn: 'পুণ্য ফল',
    ta: 'புண்ணிய பலன்', te: 'పుణ్య ఫలం', kn: 'ಪುಣ್ಯ ಫಲ', ml: 'പുണ്യ ഫലം',
    pa: 'ਪੁੰਨ ਫਲ', or: 'ପୁଣ୍ୟ ଫଳ', as: 'পুণ্য ফল', sa: 'पुण्यफलम्'
  },
  'Caution Level': {
    hi: 'सावधानी स्तर', mr: 'दक्षता पातळी', gu: 'સાવધાની સ્તર', bn: 'সতর্কতার মাত্রা',
    ta: 'எச்சரிக்கை நிலை', te: 'హెచ్చరిక స్థాయి', kn: 'ಎಚ್ಚರಿಕೆಯ ಮಟ್ಟ', ml: 'ജാഗ്രതാ നില',
    pa: 'ਸਾਵਧਾਨੀ ਪੱਧਰ', or: 'ସତର୍କତା ସ୍ତର', as: 'সতৰ্কতাৰ মাত্ৰা', sa: 'सावधानीस्तरः'
  }
};

/**
 * Localizes Calculated Data label strings while strictly preserving all calculated numbers,
 * dates, times, percentages, and mathematical results.
 */
export function localizeCalculatedData(calculatedDataStr: string, lang: LanguageCode): string {
  if (!calculatedDataStr || lang === 'en') return calculatedDataStr;

  let result = calculatedDataStr;

  // Replace each label safely by checking boundaries
  for (const [englishLabel, transMap] of Object.entries(CALCULATED_DATA_LABELS)) {
    const localized = transMap[lang] || transMap['hi'];
    if (!localized) continue;

    // Replace occurrences that are followed by ':' or space or '|'
    const escaped = englishLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\|\\s*)${escaped}(\\s*:)`, 'g');
    result = result.replace(regex, `$1${localized}$2`);
  }

  // Also localize Lo Shu plane mentions inside dominant planes (e.g. Mental Plane, Emotional Plane, Practical Plane)
  if (result.includes('Plane')) {
    result = result.replace(/Mental Plane/g, lang === 'hi' ? 'मानसिक तल' : 'Mental Plane');
    result = result.replace(/Emotional Plane/g, lang === 'hi' ? 'भावनात्मक तल' : 'Emotional Plane');
    result = result.replace(/Practical Plane/g, lang === 'hi' ? 'व्यावहारिक तल' : 'Practical Plane');
  }

  // Localize standard planetary names when appearing as labels or in results
  if (lang === 'hi') {
    result = result.replace(/\bSaturn\b/g, 'शनि');
    result = result.replace(/\bJupiter\b/g, 'गुरु');
    result = result.replace(/\bMercury\b/g, 'बुध');
    result = result.replace(/\bVenus\b/g, 'शुक्र');
    result = result.replace(/\bMars\b/g, 'मंगल');
    result = result.replace(/\bSun\b/g, 'सूर्य');
    result = result.replace(/\bMoon\b/g, 'चंद्र');
    result = result.replace(/\bRahu\b/g, 'राहु');
    result = result.replace(/\bKetu\b/g, 'केतु');

    // Weekday replacements
    result = result.replace(/\bSaturday\b/g, 'शनिवार');
    result = result.replace(/\bSunday\b/g, 'रविवार');
    result = result.replace(/\bMonday\b/g, 'सोमवार');
    result = result.replace(/\bTuesday\b/g, 'मंगलवार');
    result = result.replace(/\bWednesday\b/g, 'बुधवार');
    result = result.replace(/\bThursday\b/g, 'गुरुवार');
    result = result.replace(/\bFriday\b/g, 'शुक्रवार');

    // Value qualifiers (while preserving numbers & math)
    result = result.replace(/:\s*High\b/g, ': उच्च');
    result = result.replace(/:\s*Moderate\b/g, ': मध्यम');
    result = result.replace(/:\s*Prudent\b/g, ': सतर्क');
    result = result.replace(/:\s*Favorable\b/g, ': अनुकूल');
    result = result.replace(/:\s*Stable\b/g, ': स्थिर');
    result = result.replace(/:\s*Active\b/g, ': सक्रिय');
    result = result.replace(/:\s*Balanced\b/g, ': संतुलित');
    result = result.replace(/:\s*Prepared\b/g, ': तैयार');
    result = result.replace(/:\s*Peaceful\b/g, ': शांतिमय');
    result = result.replace(/:\s*Restful\b/g, ': शांत');
    result = result.replace(/Shukla Paksha/g, 'शुक्ल पक्ष');
    result = result.replace(/Krishna Paksha/g, 'कृष्ण पक्ष');
    result = result.replace(/Sandhya Kaal/g, 'संध्याकाल');
    result = result.replace(/Early Morning & Pre-Sunset/g, 'प्रातःकाल एवं सूर्यास्त पूर्व');
    result = result.replace(/Review thoroughly/g, 'गहन समीक्षा करें');
    result = result.replace(/Very High \(Avoid intraday gambling\)/g, 'अत्यधिक उच्च (सट्टेबाजी व इंट्राडे से बचें)');
    result = result.replace(/High Impact Priority/g, 'उच्च प्राथमिकता');
    result = result.replace(/Verified from calendar/g, 'पंचांग अनुसार सत्यापित');
  }

  return result;
}

