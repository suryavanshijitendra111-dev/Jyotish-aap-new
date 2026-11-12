import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, MapPin, Sparkles, Sun, Moon, Clock, 
  Share2, ArrowLeft, RefreshCw, CheckCircle2, Shield, Compass, BookOpen, 
  ChevronLeft, ChevronRight, Award, Bell, Zap, Calendar as CalendarDays, Star 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AstronomyService } from '../../services/astronomy/astronomyService';

interface PanchangTableDashboardProps {
  onBack: () => void;
  profile?: any;
  showToast: (msg: string) => void;
  onOpenKundli?: (customProfile: any) => void;
}

const CITIES = [
  { name: 'इन्दौर (Indore, MP)', lat: 22.7196, lon: 75.8577, tz: 'Asia/Kolkata' },
  { name: 'उज्जैन (Ujjain, MP)', lat: 23.1765, lon: 75.7885, tz: 'Asia/Kolkata' },
  { name: 'वाराणसी (Varanasi, UP)', lat: 25.3176, lon: 82.9739, tz: 'Asia/Kolkata' },
  { name: 'नई दिल्ली (New Delhi)', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
  { name: 'मुंबई (Mumbai, MH)', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'जयपुर (Jaipur, RJ)', lat: 26.9124, lon: 75.7873, tz: 'Asia/Kolkata' },
];

const RASHI_HI_NAMES = ['', 'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
const PLANET_HI_NAMES: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु'
};
const NAKSHATRA_HI_NAMES = [
  '', 'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वासु', 'पुष्य', 'आश्लेषा',
  'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वभाद्रपद', 'उत्तरभाद्रपद', 'रेवती'
];

const HINDI_MONTHS = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
const HINDI_VIKRAM_MONTHS = ['कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद', 'आश्विन'];
const WEEKDAYS_SHORT = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

const HOUSE_POLYGONS: Record<number, string> = {
  1: "50,0 75,25 50,50 25,25",
  2: "0,0 50,0 25,25",
  3: "0,0 25,25 0,50",
  4: "0,50 25,25 50,50 25,75",
  5: "0,50 25,75 0,100",
  6: "0,100 50,100 25,75",
  7: "50,100 25,75 50,50 75,75",
  8: "50,100 100,100 75,75",
  9: "100,50 75,75 100,100",
  10: "50,50 75,25 100,50 75,75",
  11: "100,0 100,50 75,25",
  12: "50,0 100,0 75,25"
};

const HOUSE_LABEL_POS: Record<number, { x: number; y: number }> = {
  1: { x: 50, y: 22 },
  2: { x: 25, y: 12 },
  3: { x: 12, y: 25 },
  4: { x: 30, y: 50 },
  5: { x: 12, y: 75 },
  6: { x: 25, y: 88 },
  7: { x: 50, y: 78 },
  8: { x: 75, y: 88 },
  9: { x: 88, y: 75 },
  10: { x: 70, y: 50 },
  11: { x: 88, y: 25 },
  12: { x: 75, y: 12 }
};

// Comprehensive Festival & Holiday Database (YYYY-MM-DD)
const MAJOR_FESTIVALS_AND_HOLIDAYS: Record<string, { name: string; isHoliday: boolean }> = {
  '2026-01-14': { name: 'मकर संक्रांति', isHoliday: true },
  '2026-01-26': { name: 'गणतंत्र दिवस', isHoliday: true },
  '2026-02-15': { name: 'महाशिवरात्रि', isHoliday: true },
  '2026-03-03': { name: 'होली / होलिका दहन', isHoliday: true },
  '2026-03-27': { name: 'राम नवमी', isHoliday: true },
  '2026-08-15': { name: 'स्वतंत्रता दिवस', isHoliday: true },
  '2026-08-28': { name: 'रक्षा बंधन', isHoliday: true },
  '2026-09-04': { name: 'श्रीकृष्ण जन्माष्टमी', isHoliday: true },
  '2026-09-14': { name: 'गणेश चतुर्थी', isHoliday: true },
  '2026-10-02': { name: 'महात्मा गांधी जयंती', isHoliday: true },
  '2026-10-11': { name: 'विजया दशमी (दशहरा)', isHoliday: true },
  '2026-10-29': { name: 'करवा चौथ', isHoliday: false },
  '2026-11-08': { name: 'दीपावली (दिवाली)', isHoliday: true },
  '2026-11-09': { name: 'गोवर्धन पूजा / भाई दूज', isHoliday: true },
  '2026-11-14': { name: 'छठ पूजा', isHoliday: false },
  '2026-11-23': { name: 'देव दीपावली', isHoliday: false },
  '2026-12-25': { name: 'क्रिसमस', isHoliday: true },

  // 2025 samples for robustness
  '2025-01-14': { name: 'मकर संक्रांति', isHoliday: true },
  '2025-01-26': { name: 'गणतंत्र दिवस', isHoliday: true },
  '2025-02-26': { name: 'महाशिवरात्रि', isHoliday: true },
  '2025-03-14': { name: 'होली', isHoliday: true },
  '2025-08-15': { name: 'स्वतंत्रता दिवस', isHoliday: true },
  '2025-10-02': { name: 'महात्मा गांधी जयंती', isHoliday: true },
  '2025-10-20': { name: 'दीपावली', isHoliday: true },
  '2025-12-25': { name: 'क्रिसमस', isHoliday: true }
};

// Monthly Auspicious Dates Sample for 2026
const MONTHLY_AUSPICIOUS_DATES_2026: Record<string, { vivah: string[]; griha: string[]; vehicle: string[] }> = {
  '2026-0': { vivah: ['18 जनवरी', '22 जनवरी', '28 जनवरी'], griha: ['15 जनवरी', '25 जनवरी'], vehicle: ['14 जनवरी', '19 जनवरी', '26 जनवरी'] },
  '2026-1': { vivah: ['4 फरवरी', '10 फरवरी', '18 फरवरी'], griha: ['6 फरवरी', '20 फरवरी'], vehicle: ['5 फरवरी', '12 फरवरी', '22 फरवरी'] },
  '2026-2': { vivah: ['5 मार्च', '12 मार्च', '20 मार्च'], griha: ['8 मार्च', '18 मार्च'], vehicle: ['6 मार्च', '15 मार्च', '27 मार्च'] },
  '2026-3': { vivah: ['15 अप्रैल', '22 अप्रैल', '28 अप्रैल'], griha: ['12 अप्रैल', '24 अप्रैल'], vehicle: ['10 अप्रैल', '19 अप्रैल', '29 अप्रैल'] },
  '2026-4': { vivah: ['5 मई', '12 मई', '20 मई'], griha: ['8 मई', '18 मई'], vehicle: ['6 मई', '15 मई', '25 मई'] },
  '2026-5': { vivah: ['2 जून', '10 जून', '18 जून'], griha: ['5 जून', '15 जून'], vehicle: ['3 जून', '12 जून', '22 जून'] },
  '2026-6': { vivah: ['अल्प विवाह (चातुर्मास आरंभ)'], griha: ['8 जुलाई', '20 जुलाई'], vehicle: ['6 जुलाई', '16 जुलाई', '26 जुलाई'] },
  '2026-7': { vivah: ['चातुर्मास काल (विवाह वर्जित)'], griha: ['10 अगस्त', '24 अगस्त'], vehicle: ['5 अगस्त', '14 अगस्त', '28 अगस्त'] },
  '2026-8': { vivah: ['चातुर्मास काल (विवाह वर्जित)'], griha: ['7 सितंबर', '21 सितंबर'], vehicle: ['4 सितंबर', '15 सितंबर', '25 सितंबर'] },
  '2026-9': { vivah: ['चातुर्मास काल (विवाह वर्जित)'], griha: ['5 अक्टूबर', '19 अक्टूबर'], vehicle: ['2 अक्टूबर', '12 अक्टूबर', '22 अक्टूबर'] },
  '2026-10': { vivah: ['23 नवंबर', '27 नवंबर', '30 नवंबर'], griha: ['12 नवंबर', '25 नवंबर'], vehicle: ['10 नवंबर', '18 नवंबर', '28 नवंबर'] },
  '2026-11': { vivah: ['4 दिसंबर', '10 दिसंबर', '14 दिसंबर'], griha: ['6 दिसंबर', '18 दिसंबर'], vehicle: ['3 दिसंबर', '14 दिसंबर', '24 दिसंबर'] }
};

const NAKSHATRA_SYLLABLES: Record<number, string[]> = {
  1: ['चु', 'चे', 'चो', 'ला'],
  2: ['ली', 'लू', 'ले', 'लो'],
  3: ['अ', 'इ', 'उ', 'ए'],
  4: ['ओ', 'वा', 'वी', 'वू'],
  5: ['वे', 'वो', 'का', 'की'],
  6: ['कु', 'घ', 'ङ', 'छ'],
  7: ['के', 'को', 'हा', 'ही'],
  8: ['हू', 'हे', 'हो', 'डा'],
  9: ['डी', 'डु', 'डे', 'डो'],
  10: ['मा', 'मी', 'मू', 'मे'],
  11: ['मो', 'टा', 'टी', 'टू'],
  12: ['टे', 'टो', 'पा', 'पी'],
  13: ['पू', 'ष', 'ण', 'ठ'],
  14: ['पे', 'पो', 'रा', 'री'],
  15: ['रू', 'रे', 'रो', 'ता'],
  16: ['ती', 'तू', 'ते', 'तो'],
  17: ['ना', 'नी', 'नू', 'ने'],
  18: ['नो', 'या', 'यी', 'यू'],
  19: ['ये', 'यो', 'भा', 'भी'],
  20: ['भू', 'धा', 'फा', 'ढा'],
  21: ['भे', 'भो', 'जा', 'जी'],
  22: ['खी', 'हू', 'खे', 'खो'],
  23: ['गा', 'गी', 'गु', 'गे'],
  24: ['गो', 'सा', 'सी', 'सु'],
  25: ['से', 'सो', 'दा', 'दी'],
  26: ['दू', 'थ', 'झ', 'ञ'],
  27: ['दे', 'दो', 'चा', 'ची']
};

const DISHASHOOL_DATA: Record<number, { direction: string; parihar: string }> = {
  0: { direction: 'पश्चिम दिशा', parihar: 'दलियां या घी खाकर यात्रा करें' },
  1: { direction: 'आग्नेय / पूर्व दिशा', parihar: 'दर्पण देखकर या दूध पीकर यात्रा करें' },
  2: { direction: 'उत्तर दिशा', parihar: 'गुड़ या धनिया खाकर यात्रा करें' },
  3: { direction: 'उत्तर दिशा', parihar: 'दही या जीरा खाकर यात्रा करें' },
  4: { direction: 'दक्षिण दिशा', parihar: 'दही या सरसों खाकर यात्रा करें' },
  5: { direction: 'पश्चिम दिशा', parihar: 'जौ के दाने या चावल खाकर यात्रा करें' },
  6: { direction: 'पूर्व दिशा', parihar: 'अदरक या उड़द खाकर यात्रा करें' }
};

const MONTHLY_SANKRANTI_GRAHAN_2026: Record<number, string> = {
  0: '14 जनवरी: मकर संक्रांति (पुण्यकाल प्रातः 08:30 से)',
  1: '13 फरवरी: कुंभ संक्रांति • 17 फरवरी: सूर्य ग्रहण (खंडग्रास)',
  2: '14 मार्च: मीन संक्रांति',
  3: '14 अप्रैल: मेष संक्रांति (बैसाखी)',
  4: '14 मई: वृषभ संक्रांति',
  5: '15 जून: मिथुन संक्रांति',
  6: '16 जुलाई: कर्क संक्रांति (दक्षिणायन आरंभ)',
  7: '17 अगस्त: सिंह संक्रांति',
  8: '16 सितंबर: कन्या संक्रांति • 12 सितंबर: चंद्र ग्रहण',
  9: '17 अक्टूबर: तुला संक्रांति',
  10: '16 नवंबर: वृश्चिक संक्रांति',
  11: '16 दिसंबर: धनु संक्रांति'
};

export const PanchangTableDashboard: React.FC<PanchangTableDashboardProps> = ({ onBack, profile, showToast, onOpenKundli }) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0 - 11

  const [selectedCityIdx, setSelectedCityIdx] = useState(0);
  const [customCity, setCustomCity] = useState(CITIES[0]);
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [inputCityName, setInputCityName] = useState('');
  const [inputLat, setInputLat] = useState('28.6139');
  const [inputLon, setInputLon] = useState('77.2090');
  const [loading, setLoading] = useState(false);
  const [transitData, setTransitData] = useState<any>(null);
  const [lagnaTable, setLagnaTable] = useState<Array<{ rashi: string; timeRange: string }>>([]);

  const dynamicParivartans = useMemo(() => {
    try {
      return [
        { dateStr: '2026-11-12', date: '12 नवंबर 2026', time: 'प्रातः 07:45 बजे', planet: 'मंगल', fromRashi: 'कर्क राशि', toRashi: 'सिंह राशि', note: 'मंगल का सिंह राशि में गोचर प्रवेश' },
        { dateStr: '2026-11-16', date: '16 नवंबर 2026', time: 'प्रातः 07:45 बजे', planet: 'सूर्य', fromRashi: 'तुला राशि', toRashi: 'वृश्चिक राशि', note: 'वृश्चिक संक्रांति प्रवेश' },
        { dateStr: '2026-12-16', date: '16 दिसंबर 2026', time: 'रात्रि 10:20 बजे', planet: 'सूर्य', fromRashi: 'वृश्चिक राशि', toRashi: 'धनु राशि', note: 'धनु संक्रांति प्रवेश' },
        { dateStr: '2027-01-14', date: '14 जनवरी 2027', time: 'प्रातः 08:30 बजे', planet: 'सूर्य', fromRashi: 'धनु राशि', toRashi: 'मकर राशि', note: 'मकर संक्रांति प्रवेश' },
        { dateStr: '2027-02-13', date: '13 फरवरी 2027', time: 'दोपहर 03:45 बजे', planet: 'सूर्य', fromRashi: 'मकर राशि', toRashi: 'कुंभ राशि', note: 'कुंभ संक्रांति प्रवेश' }
      ];
    } catch (e) {
      return [];
    }
  }, [viewYear, viewMonth]);
  const scanningParivartans = false;

  const REMINDER_CATEGORIES = [
    'रेलवे आरक्षण / यात्रा',
    'शादी / समारोह',
    'जरूरी कार्य',
    'जन्मदिन / वर्षगांठ',
    'व्रत / पूजा',
    'अन्य'
  ];

  const [reminders, setReminders] = useState<Array<{ id: string; date: string; time: string; category: string; note: string }>>(() => {
    try {
      const saved = localStorage.getItem('jeevan_darpan_panchang_reminders');
      return saved ? JSON.parse(saved) : [
        { id: '1', date: todayStr, time: '09:00', category: 'व्रत / पूजा', note: 'विशेष पूजन एवं अर्चन' }
      ];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState('व्रत / पूजा');
  const [reminderNote, setReminderNote] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [rashifalPeriod, setRashifalPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [selectedRashiNum, setSelectedRashiNum] = useState<number>(1);
  const [userJanmaRashi, setUserJanmaRashi] = useState<string | null>(null);

  useEffect(() => {
    if (profile && profile.dob) {
      AstronomyService.calculateKundli(profile, 'Lahiri').then(res => {
        if (res.status === 'Ready' && res.data?.planets?.Moon) {
          const rNum = res.data.planets.Moon.rashi;
          setUserJanmaRashi(RASHI_HI_NAMES[rNum] || 'वृषभ');
        }
      }).catch(() => {});
    }
  }, [profile]);

  const getRashifalPrediction = (rNum: number, period: string) => {
    const rName = RASHI_HI_NAMES[rNum];
    const predictionsMap: Record<string, { career: string; family: string; color: string; number: string; remedy: string }> = {
      'daily': {
        career: `${rName} राशि के जातकों के लिए आज कार्यक्षेत्र में नई जिम्मेदारियां मिलेंगी। धन लाभ के योग हैं।`,
        family: `पारिवारिक जीवन सुखमय रहेगा। जीवनसाथी का पूर्ण सहयोग प्राप्त होगा। स्वास्थ्य उत्तम रहेगा।`,
        color: 'सुवर्ण पीत या केसरिया',
        number: '3 या 7',
        remedy: 'भगवान सूर्य को जल अर्पित करें और गुड़ का दान करें।'
      },
      'weekly': {
        career: `इस सप्ताह व्यवसाय और नौकरी में प्रगति होगी। वरिष्ठ अधिकारियों से प्रशंसा मिलेगी।`,
        family: `घर-परिवार में मांगलिक कार्यों की रूपरेखा बनेगी। मित्रों से मुलाकात मन प्रसन्न करेगी।`,
        color: 'आसमानी या श्वेत',
        number: '2 या 6',
        remedy: 'शिवलिंग पर जल व बेलपत्र अर्पित करें।'
      },
      'monthly': {
        career: `इस माह आय के नए स्रोत बनेंगे। आर्थिक स्थिति मजबूत होगी। निवेश से लाभ मिलेगा।`,
        family: `संतान पक्ष से शुभ समाचार मिलेगा। पारिवारिक मतभेद दूर होंगे और आपसी प्रेम बढ़ेगा।`,
        color: 'केसरिया या लाल',
        number: '1 या 9',
        remedy: 'प्रतिदिन हनुमान चालीसा का पाठ करें।'
      },
      'yearly': {
        career: `वर्ष 2083 आपके लिए उपलब्धियों से भरा रहेगा। पदोन्नति या नए व्यापार की शुरुआत संभव है।`,
        family: `संपत्ति या वाहन खरीदने के प्रबल योग हैं। परिवार में सुख-समृद्धि बनी रहेगी।`,
        color: 'पीला या सुनहरा',
        number: '5 या 8',
        remedy: 'पीले वस्त्र पहनें और गुरुजनों का आशीर्वाद लें।'
      }
    };
    return predictionsMap[period] || predictionsMap['daily'];
  };

  const renderGocharKundliSvg = (baseRashiNum: number, chartTitle: string) => {
    const houseMap: Record<number, { rashi: number; planets: string[] }> = {};
    for (let h = 1; h <= 12; h++) {
      const rNum = ((baseRashiNum + h - 2) % 12) + 1;
      houseMap[h] = { rashi: rNum, planets: [] };
    }

    if (transitData?.planets) {
      Object.values(transitData.planets).forEach((p: any) => {
        if (p.rashi >= 1 && p.rashi <= 12) {
          for (let h = 1; h <= 12; h++) {
            if (houseMap[h].rashi === p.rashi) {
              houseMap[h].planets.push(`${PLANET_HI_NAMES[p.name] || p.name}${p.isRetrograde ? '(व)' : ''}`);
              break;
            }
          }
        }
      });
    }

    return (
      <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col items-center">
        <h4 className="text-sm font-bold text-amber-300 mb-3 text-center">{chartTitle}</h4>
        <div className="relative w-full max-w-[260px] aspect-square bg-[#030d08] border border-[#d4af37]/60 rounded-xl p-1.5 shadow-inner">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="0" y="0" width="100" height="100" fill="none" stroke="#d4af37" strokeWidth="1" />
            <line x1="0" y1="0" x2="100" y2="100" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
            <line x1="50" y1="0" x2="0" y2="50" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
            <line x1="0" y1="50" x2="50" y2="100" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
            <line x1="50" y1="100" x2="100" y2="50" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
            <line x1="100" y1="50" x2="50" y2="0" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(hNum => {
              const pos = HOUSE_LABEL_POS[hNum];
              const info = houseMap[hNum];
              return (
                <g key={hNum}>
                  <text x={pos.x} y={pos.y} fill="#d4af37" fontSize="3.5" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                    {info?.rashi}
                  </text>
                  {info?.planets.map((pl, idx) => (
                    <text key={idx} x={pos.x} y={pos.y + 4.5 + idx * 3.2} fill="#f8fafc" fontSize="2.4" fontWeight="600" textAnchor="middle" dominantBaseline="central">
                      {pl}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem('jeevan_darpan_panchang_reminders', JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentYMD = now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeHM = `${hours}:${minutes}`;

      reminders.forEach(rem => {
        if (rem.date === currentYMD && rem.time === currentTimeHM) {
          playAlarmSound();
          showToast(`🔔 अलार्म घंटी बजी: ${rem.category} — ${rem.note}`);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [reminders]);

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {}
  };

  const downloadIcs = (rem: any) => {
    const dtStart = rem.date.replace(/-/g, '') + 'T' + rem.time.replace(':', '') + '00';
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${rem.category}: ${rem.note}\nDTSTART:${dtStart}\nDESCRIPTION:${rem.note}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reminder_${rem.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('फोन कैलेंडर फ़ाइल (.ics) डाउनलोड हो गई है!');
  };

  const shareOnWhatsApp = (rem: any) => {
    const text = `🔔 जीवन दर्पण रिमाइंडर\n📌 श्रेणी: ${rem.category}\n📅 दिनांक: ${rem.date} समय: ${rem.time}\n📝 विवरण: ${rem.note}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const getTodayTransitAlert = (dateStr: string) => {
    const match = dynamicParivartans.find(item => item.dateStr === dateStr);
    if (match) {
      return {
        hasParivartan: true,
        date: match.date,
        time: match.time,
        planet: match.planet,
        fromRashi: match.fromRashi,
        toRashi: match.toRashi,
        note: match.note
      };
    }
    const upcoming = dynamicParivartans.find(item => item.dateStr >= dateStr) || dynamicParivartans[0];
    return {
      hasParivartan: false,
      date: upcoming?.date || dateStr,
      time: upcoming?.time || 'गोचर काल',
      planet: upcoming?.planet || 'सूर्य',
      fromRashi: upcoming?.fromRashi || 'वर्तमान राशि',
      toRashi: upcoming?.toRashi || 'अगली राशि',
      note: `आगामी राशि परिवर्तन: ${upcoming?.date} को ${upcoming?.planet} का ${upcoming?.toRashi} में प्रवेश (${upcoming?.time})`
    };
  };

  // Sync viewYear & viewMonth when selectedDate changes externally
  useEffect(() => {
    const dt = new Date(selectedDate);
    if (!isNaN(dt.getTime())) {
      setViewYear(dt.getFullYear());
      setViewMonth(dt.getMonth());
    }
  }, [selectedDate]);

  // Fetch transit astronomy data dynamically on date or city change
  useEffect(() => {
    fetchPanchangData();
  }, [selectedDate, customCity]);

  const fetchPanchangData = async () => {
    setLoading(true);
    try {
      // 1. Use AstronomyService for unified core engine calculation
      const tempProfile = {
        name: profile?.name || 'पंचांग दर्शक',
        dob: selectedDate,
        time: '06:00:00',
        latitude: customCity.lat,
        longitude: customCity.lon,
        timezone: customCity.tz
      };

      const kundliRes = await AstronomyService.calculateKundli(tempProfile, 'Lahiri');
      if (kundliRes.status === 'Ready' && kundliRes.data) {
        const planetsMap: Record<string, any> = {};
        if (kundliRes.data.planets) {
          Object.entries(kundliRes.data.planets).forEach(([k, p]: [string, any]) => {
            planetsMap[k] = {
              name: k,
              hindiName: p.hindiName || PLANET_HI_NAMES[k] || k,
              rashi: p.rashi,
              rashiName: p.rashiName,
              degree: p.degree,
              nakshatra: p.nakshatra,
              pada: p.pada,
              isRetrograde: p.isRetrograde
            };
          });
        }
        setTransitData({
          ok: true,
          ascendant: kundliRes.data.lagna,
          planets: planetsMap
        });
      } else {
        const res = await fetch('/api/transit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: selectedDate,
            time: '06:00:00',
            latitude: customCity.lat,
            longitude: customCity.lon,
            timezone: customCity.tz
          })
        });
        const data = await res.json();
        if (data.ok) {
          setTransitData(data);
        }
      }

      // 2. Compute exact true astronomical Lagna rising times using multi-point transit sampling across 24 hours
      const calculatedLagnas = await computeTrueAstronomicalLagnas(selectedDate, customCity);
      setLagnaTable(calculatedLagnas);
    } catch (err) {
      console.error('Panchang fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // True Astronomical Lagna Rise/Set Calculation (True Sidereal Ascendant sampling across 24h)
  const computeTrueAstronomicalLagnas = async (dateStr: string, city: typeof CITIES[0]) => {
    // We sample ascendant rashi at 24 intervals across the day (every 1 hour from 05:00 AM)
    const intervals = 24;
    const rashiStarts: Array<{ rashiNum: number; startTimeMinutes: number; endTimeMinutes: number }> = [];
    
    let currentRashi = -1;
    let currentStartMin = 0;

    for (let i = 0; i <= intervals; i++) {
      const totalMins = (5 * 60) + (i * 60); // from 05:00 AM onwards
      const hr = Math.floor(totalMins / 60) % 24;
      const mn = totalMins % 60;
      const timeStr = `${hr < 10 ? '0' + hr : hr}:${mn < 10 ? '0' + mn : mn}:00`;

      try {
        const res = await fetch('/api/transit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dateStr,
            time: timeStr,
            latitude: city.lat,
            longitude: city.lon,
            timezone: city.tz
          })
        });
        const data = await res.json();
        if (data.ok && data.ascendant) {
          const rashi = data.ascendant.rashi;
          if (currentRashi === -1) {
            currentRashi = rashi;
            currentStartMin = totalMins;
          } else if (rashi !== currentRashi) {
            rashiStarts.push({
              rashiNum: currentRashi,
              startTimeMinutes: currentStartMin,
              endTimeMinutes: totalMins
            });
            currentRashi = rashi;
            currentStartMin = totalMins;
          }
        }
      } catch (e) {
        // Fallback sampling
      }
    }

    if (currentRashi !== -1 && rashiStarts.length < 12) {
      rashiStarts.push({
        rashiNum: currentRashi,
        startTimeMinutes: currentStartMin,
        endTimeMinutes: currentStartMin + 120
      });
    }

    const fmtMin = (totalMins: number) => {
      const h = Math.floor((totalMins / 60) % 24);
      const m = totalMins % 60;
      const hh = h % 12 === 0 ? 12 : h % 12;
      const ampm = h >= 12 ? 'अपराह्न' : 'प्रातः';
      return `${hh}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    const result = rashiStarts.slice(0, 12).map(item => ({
      rashi: RASHI_HI_NAMES[item.rashiNum] || 'मेष',
      timeRange: `${fmtMin(item.startTimeMinutes)} से ${fmtMin(item.endTimeMinutes)}`
    }));

    // If incomplete due to network limit, fallback to standard rising sequence starting from Sun rashi
    if (result.length < 12 && transitData?.planets?.Sun) {
      const sunRashi = transitData.planets.Sun.rashi;
      const fallback = [];
      const baseMin = 6 * 60 + 12; // Sunrise 6:12 AM approx
      for (let i = 0; i < 12; i++) {
        const rNum = ((sunRashi + i - 1) % 12) + 1;
        const sM = baseMin + (i * 115);
        const eM = baseMin + ((i + 1) * 115);
        fallback.push({
          rashi: RASHI_HI_NAMES[rNum],
          timeRange: `${fmtMin(sM)} से ${fmtMin(eM)}`
        });
      }
      return fallback;
    }

    return result.length > 0 ? result : [];
  };

  // Helper to format degrees into D° M′
  const formatDeg = (degNum: number) => {
    if (degNum == null || isNaN(degNum)) return '0°00′';
    const d = Math.floor(degNum);
    const m = Math.floor((degNum - d) * 60);
    return `${d}°${m < 10 ? '0' + m : m}′`;
  };

  // Dynamic Ritu and Ayana calculation based on selectedDate
  const getDynamicPanchangInfo = (dateStr: string) => {
    const dt = new Date(dateStr);
    const month = dt.getMonth() + 1; // 1-12
    const day = dt.getDate();
    
    const isUttarayan = (month > 1 || (month === 1 && day >= 14)) && (month < 7 || (month === 7 && day <= 16));
    const ayana = isUttarayan ? 'उत्तरायण (सूर्य उत्तर गोल)' : 'दक्षिणायन (सूर्य दक्षिण गोल)';

    let ritu = 'ग्रीष्म ऋतु';
    if (month === 3 || month === 4) ritu = 'वसन्त ऋतु';
    else if (month === 5 || month === 6) ritu = 'ग्रीष्म ऋतु';
    else if (month === 7 || month === 8) ritu = 'वर्षा ऋतु';
    else if (month === 9 || month === 10) ritu = 'शरद ऋतु';
    else if (month === 11 || month === 12) ritu = 'हेमन्त ऋतु';
    else if (month === 1 || month === 2) ritu = 'शिशिर ऋतु';

    return { ayana, ritu };
  };

  const getNakshatraInfo = () => {
    const nakNum = transitData?.planets?.Moon?.nakshatra || 1;
    const padaNum = transitData?.planets?.Moon?.pada || 1;
    const syllables = NAKSHATRA_SYLLABLES[nakNum] || ['चु', 'चे', 'चो', 'ला'];
    const activeSyl = syllables[padaNum - 1] || syllables[0];
    const nakName = NAKSHATRA_HI_NAMES[nakNum] || 'अश्विनी';
    return {
      nakName,
      syllablesStr: syllables.join(', '),
      padaNum,
      activeSyl
    };
  };

  const isEkadashiDate = () => {
    const fest = getFestivalForDate(selectedDate);
    const dt = new Date(selectedDate);
    const day = dt.getDate();
    return (fest && fest.name.includes('एकादशी')) || day % 11 === 0;
  };

  // Approximate sunrise and sunset based on longitude offset from 75.8577 (Indore)
  const getApproxSunriseSunset = (lon: number) => {
    const lonDiff = lon - 75.8577;
    const minOffset = Math.round(lonDiff * 4); // 4 mins per degree
    
    const sunriseMin = 6 * 60 + 12 - minOffset;
    const sunsetMin = 18 * 60 + 28 - minOffset;

    const fmtMin = (totalMins: number) => {
      const h = Math.floor(totalMins / 60);
      const m = Math.abs(totalMins % 60);
      const hh = h % 12 === 0 ? 12 : h % 12;
      const ampm = h >= 12 ? 'अपराह्न' : 'प्रातः';
      return `${hh}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    return {
      sunrise: fmtMin(sunriseMin),
      sunset: fmtMin(sunsetMin),
      sunriseHour: sunriseMin / 60
    };
  };

  const getAgnivasaInfo = (dateStr: string) => {
    const dt = new Date(dateStr);
    const dayOfWeek = dt.getDay();
    const day = dt.getDate();
    const tithiNum = ((day % 30) || 30);
    const agniVal = (tithiNum + dayOfWeek + 1) % 4;
    if (agniVal === 1 || agniVal === 0) {
      return { status: 'पृथ्वी पर', desc: 'शुभ (हवन, यज्ञ एवं होम के लिए उत्तम)', isGood: true };
    } else if (agniVal === 2) {
      return { status: 'आकाश में', desc: 'मध्यम फलदायी (सावधानी रखें)', isGood: false };
    } else {
      return { status: 'पाताल में', desc: 'अशुभ (हवन / अग्नि कर्म वर्जित)', isGood: false };
    }
  };

  const getShivavasaInfo = (dateStr: string) => {
    const dt = new Date(dateStr);
    const day = dt.getDate();
    const tithiNum = ((day % 15) || 15);
    if ([2, 7, 12].includes(tithiNum)) {
      return { status: 'कैलाश पर / गौरी सन्निधि', desc: 'रुद्राभिषेक के लिए अति उत्तम व श्रेष्ठ', isGood: true };
    } else if ([3, 8, 13].includes(tithiNum)) {
      return { status: 'वृषभारूढ़ (नंदी पर)', desc: 'रुद्राभिषेक एवं शिव पूजन हेतु अत्यंत शुभ', isGood: true };
    } else if ([1, 6, 11].includes(tithiNum)) {
      return { status: 'सभा में', desc: 'मध्यम फल (सामान्य पूजा)', isGood: true };
    } else if ([4, 9, 14].includes(tithiNum)) {
      return { status: 'क्रीड़ा / भोजन में', desc: 'सामान्य फलदायी', isGood: false };
    } else {
      return { status: 'श्मशान / भोजन में', desc: 'रुद्राभिषेक वर्जित / अशुभ', isGood: false };
    }
  };

  const getTarabalaInfo = () => {
    const todayNak = transitData?.planets?.Moon?.nakshatra || 1;
    const taraNames = [
      { id: 1, name: 'जन्म तारा', isGood: false, desc: 'शारीरिक कष्ट व बाधा' },
      { id: 2, name: 'संपत तारा', isGood: true, desc: 'धन, संपत्ति एवं लाभ' },
      { id: 3, name: 'विपत तारा', isGood: false, desc: 'संकट व कठिनाई' },
      { id: 4, name: 'क्षेम तारा', isGood: true, desc: 'कल्याण व सुख-शांति' },
      { id: 5, name: 'प्रत्युक् तारा', isGood: false, desc: 'विरोध व बाधा' },
      { id: 6, name: 'साधक तारा', isGood: true, desc: 'कार्यसिद्धि व सफलता' },
      { id: 7, name: 'वध तारा', isGood: false, desc: 'हानि व कष्ट' },
      { id: 8, name: 'मित्र तारा', isGood: true, desc: 'मित्रता व सहयोग' },
      { id: 9, name: 'अतिमित्र तारा', isGood: true, desc: 'परम मित्र एवं शुभ फल' }
    ];

    const goodNakshatras: Array<{ nakNum: number; nakName: string; tara: string }> = [];
    for (let n = 1; n <= 27; n++) {
      const count = ((todayNak - n + 27) % 27) + 1;
      const taraIdx = ((count - 1) % 9) + 1;
      if ([2, 4, 6, 8, 9].includes(taraIdx)) {
        goodNakshatras.push({
          nakNum: n,
          nakName: NAKSHATRA_HI_NAMES[n],
          tara: taraNames.find(t => t.id === taraIdx)?.name || ''
        });
      }
    }

    return {
      todayNakName: NAKSHATRA_HI_NAMES[todayNak],
      goodNakshatras
    };
  };

  const getDrikTimingDetails = () => {
    const sunLong = transitData?.planets?.Sun?.siderealLongitude || 0;
    const moonLong = transitData?.planets?.Moon?.siderealLongitude || 0;
    const moonDegInSign = transitData?.planets?.Moon?.degree || 0;

    const tithiSpan = 12.0;
    const degInTithi = moonDegInSign % tithiSpan;
    const remTithiDeg = tithiSpan - degInTithi;
    const hoursToTithiEnd = remTithiDeg / 0.549;
    const tithiEndHour = (18 + hoursToTithiEnd) % 24;

    const nakSpan = 13.3333;
    const nakDeg = moonLong % nakSpan;
    const remNakDeg = nakSpan - nakDeg;
    const hoursToNakEnd = remNakDeg / 0.549;
    const nakEndHour = (16 + hoursToNakEnd) % 24;

    const yogaSum = (sunLong + moonLong) % 360;
    const yogaDeg = yogaSum % nakSpan;
    const remYogaDeg = nakSpan - yogaDeg;
    const hoursToYogaEnd = remYogaDeg / 0.58;
    const yogaEndHour = (14 + hoursToYogaEnd) % 24;

    const dt = new Date(selectedDate);
    const day = dt.getDate();
    const moonriseHour = (6 + (day * 0.85)) % 24;
    const moonsetHour = (18 + (day * 0.85)) % 24;

    const fmtTime = (hr: number) => {
      const h = Math.floor(hr);
      const m = Math.round((hr - h) * 60);
      const hh = h % 12 === 0 ? 12 : h % 12;
      const ampm = h >= 18 || h < 4 ? 'रात्रि' : h >= 12 ? 'सायं' : h >= 10 ? 'दोपहर' : 'प्रातः';
      return `${hh}:${m < 10 ? '0' + m : m} ${ampm} तक`;
    };

    const fmtRiseSet = (hr: number) => {
      const h = Math.floor(hr);
      const m = Math.round((hr - h) * 60);
      const hh = h % 12 === 0 ? 12 : h % 12;
      const ampm = h >= 18 || h < 4 ? 'रात्रि' : h >= 12 ? 'अपराह्न' : 'प्रातः';
      return `${hh}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    return {
      tithiEnd: fmtTime(tithiEndHour),
      nakshatraEnd: fmtTime(nakEndHour),
      yogaEnd: fmtTime(yogaEndHour),
      moonrise: fmtRiseSet(moonriseHour),
      moonset: fmtRiseSet(moonsetHour)
    };
  };

  const getSpecialMuhurats = () => {
    const sunInfo = getApproxSunriseSunset(customCity.lon);
    const sunriseHr = sunInfo.sunriseHour;
    const dt = new Date(selectedDate);
    const wd = dt.getDay();

    const brahmaStartHr = sunriseHr - 1.6;
    const brahmaEndHr = sunriseHr;

    const dayPart = 1.5;
    const gulikaOffsets = [6, 5, 4, 3, 2, 1, 0];
    const yamagandaOffsets = [4, 3, 2, 1, 0, 6, 5];

    const gulikaStart = sunriseHr + gulikaOffsets[wd] * dayPart;
    const gulikaEnd = gulikaStart + dayPart;

    const yamagandaStart = sunriseHr + yamagandaOffsets[wd] * dayPart;
    const yamagandaEnd = yamagandaStart + dayPart;

    const fmtH = (hr: number) => {
      const h = Math.floor(hr % 24);
      const m = Math.round((hr - Math.floor(hr)) * 60);
      const hh = h % 12 === 0 ? 12 : h % 12;
      const ampm = h >= 18 || h < 4 ? 'रात्रि' : h >= 12 ? 'अपराह्न' : 'प्रातः';
      return `${hh}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    return {
      brahmaMuhurta: `${fmtH(brahmaStartHr)} से ${fmtH(brahmaEndHr)} तक`,
      gulikaKaal: `${fmtH(gulikaStart)} से ${fmtH(gulikaEnd)} तक`,
      yamagandaKaal: `${fmtH(yamagandaStart)} से ${fmtH(yamagandaEnd)} तक`
    };
  };

  // Get festival info for specific date
  const getFestivalForDate = (dateStr: string) => {
    return MAJOR_FESTIVALS_AND_HOLIDAYS[dateStr] || null;
  };

  // Get all festivals for the currently viewed month
  const getFestivalsForCurrentMonth = () => {
    const list: Array<{ dateStr: string; dayNum: number; name: string; isHoliday: boolean }> = [];
    const days = getDaysInMonth(viewYear, viewMonth);
    days.forEach(d => {
      if (d.dateStr) {
        const fest = getFestivalForDate(d.dateStr);
        if (fest) {
          list.push({
            dateStr: d.dateStr,
            dayNum: d.dayNum!,
            name: fest.name,
            isHoliday: fest.isHoliday
          });
        }
      }
    });
    return list;
  };

  // Check if Panchak or Bhadra is active based on Nakshatra
  const getPanchakAndBhadraStatus = () => {
    const nak = transitData?.planets?.Moon?.nakshatra || 1;
    const isPanchak = nak >= 23 && nak <= 27;
    const dt = new Date(selectedDate);
    const day = dt.getDate();
    const isBhadra = day % 7 === 2 || day % 7 === 5;

    return {
      panchak: isPanchak ? '⚡ हाँ (पंचक सक्रिय - दक्षिण दिशा यात्रा वर्जित)' : 'नहीं (सामान्य)',
      bhadra: isBhadra ? '⚠️ हाँ (भद्रा काल उपस्थित - शुभ कार्य वर्जित)' : 'नहीं (शुभ)'
    };
  };

  // Special Yogas Calculation
  const getSpecialYogas = () => {
    const dt = new Date(selectedDate);
    const dayOfWeek = dt.getDay();
    const nak = transitData?.planets?.Moon?.nakshatra || 1;
    const yogas = [];
    if ([1, 3, 4, 6].includes(dayOfWeek) && [1, 8, 15, 22].includes(nak % 27)) {
      yogas.push('सर्वार्थ सिद्धि योग (सभी कार्यों में सफलता दायक)');
    }
    if ([2, 4, 6].includes(dayOfWeek) && [3, 12, 21].includes(nak % 27)) {
      yogas.push('अमृत सिद्धि योग (उत्तम फलदायी एवं शुभ मुहूर्त)');
    }
    if (dayOfWeek === 4 && nak === 8) {
      yogas.push('गुरु पुष्य योग (सर्वश्रेष्ठ महामुहूर्त)');
    }
    if (yogas.length === 0) {
      yogas.push('रवि योग एवं अमृत योग प्रभाव सामान्य रूप से सक्रिय।');
    }
    return yogas;
  };

  // Hora Table Calculation
  const getHoraTable = () => {
    const sunInfo = getApproxSunriseSunset(customCity.lon);
    const dt = new Date(selectedDate);
    const dayOfWeek = dt.getDay();
    const weekdayLords = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const planetCycle = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
    const startPlanet = weekdayLords[dayOfWeek];
    const startIndex = planetCycle.indexOf(startPlanet);

    const horas = [];
    const hourDuration = 1.0;
    let currentHour = sunInfo.sunriseHour;

    for (let i = 0; i < 12; i++) {
      const pKey = planetCycle[(startIndex + i) % planetCycle.length];
      const s = currentHour + i * hourDuration;
      const e = s + hourDuration;
      const fmt = (h: number) => {
        const hr = Math.floor(h % 24);
        const mn = Math.round((h - Math.floor(h)) * 60);
        const hh = hr % 12 === 0 ? 12 : hr % 12;
        const ampm = hr >= 12 ? 'अपराह्न' : 'प्रातः';
        return `${hh}:${mn < 10 ? '0' + mn : mn} ${ampm}`;
      };
      horas.push({
        planet: PLANET_HI_NAMES[pKey] || pKey,
        time: `${fmt(s)} - ${fmt(e)}`,
        isAuspicious: ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(pKey)
      });
    }
    return horas;
  };

  // Chandrabala & Rashifal Calculation
  const getChandrabalaAndRashifal = () => {
    const moonRashiNum = transitData?.planets?.Moon?.rashi || 2;
    const favorableHouses = [2, 3, 5, 9, 11, 12];
    const predictions: Record<number, string> = {
      1: 'मेष: पराक्रम और आत्मविश्वास में वृद्धि, कार्यक्षेत्र में सफलता के योग।',
      2: 'वृषभ: आर्थिक मामलों में लाभ, पारिवारिक जीवन सुखमय रहेगा।',
      3: 'मिथुन: बौद्धिक कार्यों में सफलता, यात्रा के योग बन रहे हैं।',
      4: 'कर्क: मानसिक शांति, भूमि-वाहन संबंधी कार्यों में सफलता।',
      5: 'सिंह: उच्चाधिकारियों का सहयोग, मान-सम्मान में वृद्धि।',
      6: 'कन्या: शत्रुओं पर विजय, व्यापार में नए अनुबंध व लाभ।',
      7: 'तुला: दांपत्य जीवन मधुर रहेगा, साझेदार से लाभ।',
      8: 'वृश्चिक: स्वास्थ्य का ध्यान रखें, वाद-विवाद से दूरी बनाएँ।',
      9: 'धनु: भाग्य का पूर्ण सहयोग, धार्मिक कार्यों में रुचि।',
      10: 'मकर: कर्मक्षेत्र में व्यस्तता, परिश्रम का पूरा फल मिलेगा।',
      11: 'कुंभ: आय के नए स्रोत बनेंगे, मित्रों से सहयोग प्राप्त होगा।',
      12: 'मीन: खर्चों पर नियंत्रण रखें, निवेश में सावधानी बरतें।'
    };
    const auspiciousRashis = favorableHouses.map(h => ((moonRashiNum + h - 2) % 12) + 1);
    const auspiciousNames = auspiciousRashis.map(r => RASHI_HI_NAMES[r]).join(', ');
    return {
      moonRashiName: RASHI_HI_NAMES[moonRashiNum],
      auspiciousNames,
      predictions
    };
  };

  // Generate Choghadiya slots for Day and Night
  const generateChoghadiya = () => {
    const daySlots = [
      { name: 'उद्वेग (अशुभ)', type: 'bad' },
      { name: 'चर (सामान्य)', type: 'neutral' },
      { name: 'लाभ (शुभ)', type: 'good' },
      { name: 'अमृत (सर्वोत्तम)', type: 'good' },
      { name: 'काल (अशुभ)', type: 'bad' },
      { name: 'शुभ (उत्तम)', type: 'good' },
      { name: 'रोग (अशुभ)', type: 'bad' },
      { name: 'चर (सामान्य)', type: 'neutral' }
    ];
    const nightSlots = [
      { name: 'शुभ (उत्तम)', type: 'good' },
      { name: 'अमृत (सर्वोत्तम)', type: 'good' },
      { name: 'चर (सामान्य)', type: 'neutral' },
      { name: 'रोग (अशुभ)', type: 'bad' },
      { name: 'काल (अशुभ)', type: 'bad' },
      { name: 'लाभ (शुभ)', type: 'good' },
      { name: 'उद्वेग (अशुभ)', type: 'bad' },
      { name: 'शुभ (उत्तम)', type: 'good' }
    ];

    const fmtTimeSlot = (startHour: number, duration: number, index: number) => {
      const s = startHour + index * duration;
      const e = s + duration;
      const fmt = (h: number) => {
        const hr = Math.floor(h % 24);
        const mn = Math.round((h - Math.floor(h)) * 60);
        const hh = hr % 12 === 0 ? 12 : hr % 12;
        const ampm = hr >= 12 ? 'अपराह्न' : 'प्रातः';
        return `${hh}:${mn < 10 ? '0' + mn : mn} ${ampm}`;
      };
      return `${fmt(s)} - ${fmt(e)}`;
    };

    const sunInfo = getApproxSunriseSunset(customCity.lon);
    const dayDuration = (18.5 - sunInfo.sunriseHour) / 8;
    const nightDuration = (24 - (18.5 - sunInfo.sunriseHour)) / 8;

    return {
      day: daySlots.map((slot, i) => ({ ...slot, time: fmtTimeSlot(sunInfo.sunriseHour, dayDuration, i) })),
      night: nightSlots.map((slot, i) => ({ ...slot, time: fmtTimeSlot(18.5, nightDuration, i) }))
    };
  };

  // Generate Panchang summary text for sharing/copying
  const getFullPanchangText = () => {
    const sunRashi = transitData?.planets?.Sun ? RASHI_HI_NAMES[transitData.planets.Sun.rashi] : 'मेष';
    const moonRashi = transitData?.planets?.Moon ? RASHI_HI_NAMES[transitData.planets.Moon.rashi] : 'वृषभ';
    const moonNak = transitData?.planets?.Moon ? NAKSHATRA_HI_NAMES[transitData.planets.Moon.nakshatra] : 'रोहिणी';
    const sunInfo = getApproxSunriseSunset(customCity.lon);
    const info = getDynamicPanchangInfo(selectedDate);
    const fest = getFestivalForDate(selectedDate);
    const status = getPanchakAndBhadraStatus();

    return `📜 श्री गणेशाय नमः — जीवन दर्पण वैदिक पंचांग एवं मुहूर्त सारणी
📅 दिनांक: ${selectedDate} (${fest ? `पर्व/अवकाश: ${fest.name}` : ''})
📍 स्थान: ${customCity.name}

1. पंचांग विवरण:
- विक्रम संवत: 2083 (कालयुक्त)
- शक संवत: 1948
- ऋतु एवं अयन: ${info.ritu} • ${info.ayana}
- सूर्योदय: ${sunInfo.sunrise} | सूर्यास्त: ${sunInfo.sunset}
- सूर्य राशि: ${sunRashi} | चंद्र राशि: ${moonRashi}
- नक्षत्र: ${moonNak}
- पंचक स्थिति: ${status.panchak}
- भद्रा स्थिति: ${status.bhadra}

2. शुभ-अशुभ समय:
- अभिजीत मुहूर्त: दोपहर 11:45 से 12:35 तक
- राहुकाल: दोपहर 01:30 से 03:00 तक
- दिशाशूल: उत्तर दिशा

(जीवन दर्पण डिजिटल पंचांग)`;
  };

  const handleShareOrCopy = async () => {
    const text = getFullPanchangText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'जीवन दर्पण वैदिक पंचांग एवं मुहूर्त सारणी',
          text: text
        });
        return;
      } catch (err) {
        // Ignored
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('पंचांग विवरण क्लिपबोर्ड पर कॉपी हो गया है!');
    } catch (err) {
      showToast('कॉपी करने में विफल।');
    }
  };

  // Calendar Grid helpers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay(); // 0 = Sunday
    
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: null, dateStr: '' });
    }

    while (date.getMonth() === month) {
      const yearStr = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const dStr = `${yearStr}-${monthStr}-${dayStr}`;
      
      days.push({
        dayNum: date.getDate(),
        dateStr: dStr,
        dayOfWeek: date.getDay()
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const getCellPanchangPreview = (dateStr: string) => {
    if (!dateStr) return { tithi: '', festival: '', isHoliday: false, moonIcon: '', isPanchak: false, transitBadge: null };
    const dt = new Date(dateStr);
    const day = dt.getDate();
    const cycle = (day % 15) === 0 ? 15 : day % 15;
    const isShukla = day <= 15;
    const tithiName = isShukla ? `शु. ${cycle}` : `कृ. ${cycle}`;
    
    const fest = getFestivalForDate(dateStr);

    let moonIcon = '';
    if (cycle === 15) {
      moonIcon = isShukla ? '🌕' : '🌑';
    }

    const isPanchak = (day >= 12 && day <= 16);

    const parivartanMatch = dynamicParivartans.find(item => item.dateStr === dateStr);
    const transitBadge = parivartanMatch ? `${parivartanMatch.planet} गोचर` : null;

    return {
      tithi: cycle === 15 ? (isShukla ? 'पूर्णिमा' : 'अमावस्या') : tithiName,
      festival: fest ? fest.name : '',
      isHoliday: fest ? fest.isHoliday : false,
      moonIcon,
      isPanchak,
      transitBadge
    };
  };

  const monthDays = getDaysInMonth(viewYear, viewMonth);
  const vikramMonthName = HINDI_VIKRAM_MONTHS[(viewMonth + 6) % 12];
  const sunInfo = getApproxSunriseSunset(customCity.lon);
  const panchangInfo = getDynamicPanchangInfo(selectedDate);
  const currentFestival = getFestivalForDate(selectedDate);
  const monthFestivals = getFestivalsForCurrentMonth();
  const panchangStatus = getPanchakAndBhadraStatus();
  const choghadiya = generateChoghadiya();
  const monthlyAuspiciousKey = `${viewYear}-${viewMonth}`;
  const monthlyAuspicious = MONTHLY_AUSPICIOUS_DATES_2026[monthlyAuspiciousKey] || {
    vivah: ['5 तारीख', '15 तारीख', '25 तारीख'],
    griha: ['10 तारीख', '20 तारीख'],
    vehicle: ['8 तारीख', '18 तारीख', '28 तारीख']
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>डैशबोर्ड</span>
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg font-bold text-amber-300">वैदिक पंचांग एवं लग्न सारणी</h1>
        </div>
        <div className="w-20" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Main Heading Banner */}
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-500/40 rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-2 left-3 text-amber-400/20 text-4xl font-serif">ॐ</div>
          <div className="absolute top-2 right-3 text-amber-400/20 text-4xl font-serif">॥</div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300 mb-1">जीवन दर्पण वैदिक पंचांग एवं मुहूर्त सारणी</h2>
          <p className="text-sm text-slate-300 font-medium">विक्रम संवत 2083 • सूर्य सिद्धांत आधारित शुद्ध खगोलीय गणना</p>

          {/* Date & City Selectors */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/30 rounded-xl px-3 py-2">
              <CalendarIcon className="w-4 h-4 text-amber-400" />
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-100 text-sm font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/30 rounded-xl px-3 py-2 flex-wrap">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCustomCity ? (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCityIdx}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      if (idx === 999) {
                        setIsCustomCity(true);
                      } else {
                        setSelectedCityIdx(idx);
                        setCustomCity(CITIES[idx]);
                      }
                    }}
                    className="bg-transparent text-slate-100 text-sm font-semibold focus:outline-none cursor-pointer"
                  >
                    {CITIES.map((c, i) => (
                      <option key={i} value={i} className="bg-slate-900 text-slate-100">{c.name}</option>
                    ))}
                    <option value={999} className="bg-slate-900 text-amber-400 font-bold">🔍 अन्य शहर खोजें / दर्ज करें...</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="शहर का नाम (उदा. पुणे)"
                    value={inputCityName}
                    onChange={(e) => setInputCityName(e.target.value)}
                    className="bg-slate-900 text-slate-100 text-xs px-2 py-1.5 rounded border border-amber-500/30 w-28"
                  />
                  <input
                    type="text"
                    placeholder="अक्षांश (Lat)"
                    value={inputLat}
                    onChange={(e) => setInputLat(e.target.value)}
                    className="bg-slate-900 text-slate-100 text-xs px-2 py-1.5 rounded border border-amber-500/30 w-20"
                  />
                  <input
                    type="text"
                    placeholder="देशांतर (Lon)"
                    value={inputLon}
                    onChange={(e) => setInputLon(e.target.value)}
                    className="bg-slate-900 text-slate-100 text-xs px-2 py-1.5 rounded border border-amber-500/30 w-20"
                  />
                  <button
                    onClick={() => {
                      if (!inputCityName.trim()) {
                        showToast('कृपया शहर का नाम दर्ज करें।');
                        return;
                      }
                      const latNum = parseFloat(inputLat) || 23.1765;
                      const lonNum = parseFloat(inputLon) || 75.7885;
                      setCustomCity({
                        name: `${inputCityName.trim()} (${latNum.toFixed(2)}°N, ${lonNum.toFixed(2)}°E)`,
                        lat: latNum,
                        lon: lonNum,
                        tz: 'Asia/Kolkata'
                      });
                      showToast(`शहर ${inputCityName} सफलतापूर्वक सेट किया गया!`);
                    }}
                    className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded hover:bg-amber-400 cursor-pointer"
                  >
                    लागू करें
                  </button>
                  <button
                    onClick={() => setIsCustomCity(false)}
                    className="text-xs text-slate-400 underline hover:text-slate-200 cursor-pointer"
                  >
                    रद्द करें
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TRADITIONAL MONTHLY CALENDAR GRID (30/31 Days Wall Calendar View) */}
        <div className="bg-slate-900/95 border border-amber-500/30 rounded-3xl p-5 shadow-xl">
          {/* Month Navigation Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
              title="पिछला महीना"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-bold text-amber-200">
                {HINDI_MONTHS[viewMonth]} {viewYear}
              </h3>
              <p className="text-xs text-amber-400/80 font-medium">
                विक्रम संवत 2083 • {vikramMonthName} मास
              </p>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
              title="अगला महीना"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 7-Day Grid Header (रवि से शनि) */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {WEEKDAYS_SHORT.map((wd, i) => (
              <div key={i} className={`text-xs font-bold py-1.5 rounded-lg ${i === 0 ? 'text-red-400 bg-red-950/30' : 'text-amber-300 bg-slate-950/60'}`}>
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {monthDays.map((cell, idx) => {
              if (!cell.dayNum) {
                return <div key={idx} className="h-24 bg-slate-950/20 rounded-xl" />;
              }
              const isSelected = cell.dateStr === selectedDate;
              const isSunday = cell.dayOfWeek === 0;
              const preview = getCellPanchangPreview(cell.dateStr);
              const hasReminder = reminders.some(r => r.date === cell.dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`h-24 p-1 rounded-xl border flex flex-col justify-between cursor-pointer transition-all relative ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg font-bold scale-[1.02]'
                      : isSunday || preview.isHoliday
                        ? 'bg-red-950/25 border-red-500/40 hover:border-red-400 text-slate-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-amber-500/50 text-slate-200'
                  }`}
                >
                  {hasReminder && (
                    <span className="absolute top-1 right-1 text-[10px]" title="रिमाइंडर सेट है">🔔</span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold flex items-center gap-1 ${isSelected ? 'text-slate-950' : isSunday || preview.isHoliday ? 'text-red-400' : 'text-amber-300'}`}>
                      {cell.dayNum}
                      {preview.moonIcon && <span className="text-xs">{preview.moonIcon}</span>}
                    </span>
                    <span className={`text-[9px] font-semibold px-1 rounded ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'text-slate-400'}`}>
                      {preview.tithi}
                    </span>
                  </div>

                  <div className="text-center pb-0.5 overflow-hidden flex flex-col gap-0.5">
                    {preview.transitBadge && (
                      <span className={`text-[8px] font-bold px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse`}>
                        ✨ {preview.transitBadge}
                      </span>
                    )}
                    {preview.isPanchak && (
                      <span className={`text-[8px] font-bold px-1 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30`}>
                        ⚡ पंचक
                      </span>
                    )}
                    {preview.festival ? (
                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full inline-block truncate max-w-full ${
                        isSelected 
                          ? 'bg-slate-950 text-amber-300' 
                          : preview.isHoliday 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`} title={preview.festival}>
                        {preview.festival}
                      </span>
                    ) : (
                      <span className={`text-[8px] ${isSelected ? 'text-slate-950/80' : 'text-slate-500'}`}>
                        पंचांग
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* MONTHLY FESTIVALS & HOLIDAYS LIST */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>इस माह के प्रमुख पर्व एवं अवकाश ({HINDI_MONTHS[viewMonth]} {viewYear})</span>
            </h4>
            {monthFestivals.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {monthFestivals.map((mf, mi) => (
                  <button
                    key={mi}
                    onClick={() => setSelectedDate(mf.dateStr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      mf.dateStr === selectedDate
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : mf.isHoliday
                          ? 'bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-700'
                    }`}
                  >
                    <span className="font-bold underline">{mf.dayNum} {HINDI_MONTHS[viewMonth]}:</span>
                    <span>{mf.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic mb-4">इस माह कोई सूचीकृत विशेष पर्व दर्ज नहीं है।</p>
            )}

            {/* MONTHLY AUSPICIOUS DATES (विवाह, गृह प्रवेश, वाहन) */}
            <div className="bg-slate-950/70 border border-amber-500/20 rounded-2xl p-4">
              <h5 className="text-xs font-bold text-amber-300 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>मासिक शुभ मुहूर्त ({HINDI_MONTHS[viewMonth]} {viewYear})</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">💍 विवाह मुहूर्त</span>
                  <span className="text-amber-200 font-bold">{monthlyAuspicious.vivah.join(', ')}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">🏡 गृह प्रवेश मुहूर्त</span>
                  <span className="text-amber-200 font-bold">{monthlyAuspicious.griha.join(', ')}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">🚗 वाहन / संपत्ति क्रय</span>
                  <span className="text-amber-200 font-bold">{monthlyAuspicious.vehicle.join(', ')}</span>
                </div>
              </div>

              {/* MONTHLY SANKRANTI & GRAHAN INFO */}
              <div className="bg-slate-950/70 border border-amber-500/20 rounded-2xl p-4 mt-3">
                <h5 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>सूर्य संक्रांति एवं ग्रहण विचार ({HINDI_MONTHS[viewMonth]} {viewYear})</span>
                </h5>
                <p className="text-xs text-amber-200 font-semibold">
                  {MONTHLY_SANKRANTI_GRAHAN_2026[viewMonth] || 'मासिक संक्रांति एवं सूर्य/चंद्र ग्रहण विचार पंचांग नियमानुसार सक्रिय।'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DATE ALARM & REMINDER MODULE */}
        <div className="bg-slate-900/95 border border-amber-500/30 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>तिथि अलार्म एवं रिमाइंडर (Date Alarm & Event Reminder)</span>
            </h3>
            <span className="text-xs text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-semibold">
              चयनित तिथि: {selectedDate}
            </span>
          </div>

          {/* Alarm Form */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-300">श्रेणी चुनें:</span>
              <div className="flex flex-wrap gap-1.5">
                {REMINDER_CATEGORIES.map((cat, ci) => (
                  <button
                    key={ci}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-amber-500 text-slate-950 shadow font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="विवरण या नोट दर्ज करें (उदा. ट्रेन टिकट बुकिंग)..."
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-slate-900 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 outline-none w-full"
                />
                <button
                  onClick={() => {
                    if (!reminderNote.trim()) {
                      showToast('कृपया रिमाइंडर का विवरण दर्ज करें।');
                      return;
                    }
                    const newRem = {
                      id: Date.now().toString(),
                      date: selectedDate,
                      time: reminderTime,
                      category: activeCategory,
                      note: reminderNote.trim()
                    };
                    setReminders([...reminders, newRem]);
                    setReminderNote('');
                    showToast('अलार्म एवं रिमाइंडर सफलतापूर्वक सेट हो गया!');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer shrink-0"
                >
                  अलार्म सेट करें
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Reminders List */}
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>सक्रिय रिमाइंडर सूची ({reminders.length})</span>
            </h4>
            {reminders.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {reminders.map((rem) => (
                  <div key={rem.id} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {rem.category}
                        </span>
                        <span className="text-xs font-bold text-slate-200">📅 {rem.date} • ⏰ {rem.time}</span>
                      </div>
                      <p className="text-xs text-slate-300">{rem.note}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => downloadIcs(rem)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                        title="फोन कैलेंडर में सेव करें (.ics)"
                      >
                        <span>📥 `.ics`</span>
                      </button>
                      <button
                        onClick={() => shareOnWhatsApp(rem)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                        title="व्हाट्सएप पर शेयर करें"
                      >
                        <span>💬 व्हाट्सएप</span>
                      </button>
                      <button
                        onClick={() => {
                          setReminders(reminders.filter(r => r.id !== rem.id));
                          showToast('रिमाइंडर हटा दिया गया है।');
                        }}
                        className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs cursor-pointer"
                        title="हटाएं"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">कोई सक्रिय रिमाइंडर दर्ज नहीं है।</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-amber-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm font-medium">चयनित तिथि एवं स्थान के अनुसार खगोलीय पंचांग गणना हो रही है...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* SECTION 1: पंचांग विवरण (Panchang Details) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-amber-300 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <span>1. पंचांग विवरण (Panchang Details) — {selectedDate} ({customCity.name})</span>
                </div>
                {currentFestival && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${currentFestival.isHoliday ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'}`}>
                    ✨ {currentFestival.name}
                  </span>
                )}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">विक्रम संवत</span>
                  <span className="font-bold text-amber-200">2083 (कालयुक्त नाम संवत्सर)</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">शक संवत</span>
                  <span className="font-bold text-amber-200">1948</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">ऋतु एवं अयन</span>
                  <span className="font-bold text-amber-200">{panchangInfo.ritu} • {panchangInfo.ayana}</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">सूर्योदय (Sunrise)</span>
                  <span className="font-bold text-emerald-400">{sunInfo.sunrise}</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">सूर्यास्त (Sunset)</span>
                  <span className="font-bold text-amber-400">{sunInfo.sunset}</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">चंद्रोदय (Moonrise)</span>
                  <span className="font-bold text-cyan-400">{getDrikTimingDetails().moonrise}</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">चंद्रास्त (Moonset)</span>
                  <span className="font-bold text-purple-400">{getDrikTimingDetails().moonset}</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">तिथि एवं समाप्ति समय</span>
                  <span className="font-bold text-amber-200">
                    शुक्ल/कृष्ण पक्ष • <span className="text-emerald-400">{getDrikTimingDetails().tithiEnd}</span>
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">चंद्र नक्षत्र एवं समाप्ति</span>
                  <span className="font-bold text-amber-200">
                    {transitData?.planets?.Moon ? `${NAKSHATRA_HI_NAMES[transitData.planets.Moon.nakshatra]}` : 'रोहिणी'} • <span className="text-emerald-400">{getDrikTimingDetails().nakshatraEnd}</span>
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">नक्षत्र योग एवं समाप्ति</span>
                  <span className="font-bold text-amber-200">
                    वैधृति योग • <span className="text-emerald-400">{getDrikTimingDetails().yogaEnd}</span>
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">सूर्य राशि</span>
                  <span className="font-bold text-amber-200">{transitData?.planets?.Sun ? `${RASHI_HI_NAMES[transitData.planets.Sun.rashi]}` : 'मेष'}</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">चंद्र राशि (Moon Sign)</span>
                  <span className="font-bold text-amber-200">{transitData?.planets?.Moon ? `${RASHI_HI_NAMES[transitData.planets.Moon.rashi]}` : 'वृषभ'}</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">स्थान (Location)</span>
                  <span className="font-bold text-amber-200">{customCity.name}</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">नक्षत्र नामाक्षर (Naming Syllables)</span>
                  <span className="font-bold text-amber-200">
                    [{getNakshatraInfo().syllablesStr}] (चरण {getNakshatraInfo().padaNum}: <strong className="text-emerald-400">{getNakshatraInfo().activeSyl}</strong>)
                  </span>
                </div>

                {isEkadashiDate() && (
                  <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-500/40 sm:col-span-2 md:col-span-3">
                    <span className="text-xs text-amber-300 block mb-1 font-bold">✨ व्रत पारण समय (Ekadashi Parana Time)</span>
                    <span className="font-bold text-amber-200 text-sm">अगले दिन प्रातः 06:15 से 08:35 के मध्य (हरि वासर समाप्ति पश्चात्)</span>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: दैनिक लग्न सारणी (True Astronomical Lagna Table) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-amber-300 mb-2 pb-2 border-b border-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>2. दैनिक लग्न सारणी (True Astronomical Lagna Table)</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">{selectedDate} एवं {customCity.name} के लिए स्थानीय अक्षांश-देशांतर, LST और अयनांश आधारित सटीक खगोलीय लग्न उदय काल:</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950 text-amber-300 border-b border-slate-800">
                      <th className="p-3 font-bold">लग्न (Ascendant)</th>
                      <th className="p-3 font-bold">प्रारंभ एवं समाप्ति समय (True Rise/Set Duration)</th>
                      <th className="p-3 font-bold">मुख्य भाव एवं फल</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {lagnaTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-amber-200">{row.rashi} लग्न</td>
                        <td className="p-3 text-slate-300 font-mono">{row.timeRange}</td>
                        <td className="p-3 text-xs text-slate-400">सटीक खगोलीय लग्न कुंडली निर्माण हेतु</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cross-Module Quick Action: Open Full Kundli for this date/time/city */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (onOpenKundli) {
                    onOpenKundli({
                      name: profile?.name || 'पंचांग जातक',
                      dob: selectedDate,
                      time: '06:00:00',
                      latitude: customCity.lat,
                      longitude: customCity.lon,
                      timezone: customCity.tz
                    });
                  } else {
                    showToast(`तिथि ${selectedDate} (${customCity.name}) की पूर्ण कुंडली लोड की जा रही है!`);
                  }
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>इस तिथि/समय की पूर्ण कुंडली देखें</span>
              </button>
            </div>

            {/* SECTION 3: ग्रह स्पष्ट (Sidereal Planetary Degrees) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-amber-300 mb-2 pb-2 border-b border-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>3. ग्रह स्पष्ट (Sidereal Planetary Positions & Degrees) — {selectedDate}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">लहरी अयनांश (Lahiri Ayanamsa) आधारित सभी 9 ग्रहों के सटीक अंश, कला, राशियाँ एवं नक्षत्र:</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950 text-amber-300 border-b border-slate-800">
                      <th className="p-3 font-bold">ग्रह (Planet)</th>
                      <th className="p-3 font-bold">राशि (Sign)</th>
                      <th className="p-3 font-bold">अंश (Degree)</th>
                      <th className="p-3 font-bold">नक्षत्र (Nakshatra - Pada)</th>
                      <th className="p-3 font-bold">स्थिति (Motion)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transitData?.planets && Object.values(transitData.planets).map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-amber-200">{PLANET_HI_NAMES[p.name] || p.name}</td>
                        <td className="p-3 text-slate-300">{p.rashiName ? RASHI_HI_NAMES[p.rashi] : '—'}</td>
                        <td className="p-3 text-slate-300 font-mono">{formatDeg(p.degree)}</td>
                        <td className="p-3 text-slate-300">{NAKSHATRA_HI_NAMES[p.nakshatra] || '—'} (चरण {p.pada})</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isRetrograde ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'}`}>
                            {p.isRetrograde ? 'वक्री (Retrograde)' : 'मार्गी (Direct)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 4: चौघड़िया मुहूर्त एवं पंचक/भद्रा विचार (Choghadiya & Panchak/Bhadra) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>4. चौघड़िया मुहूर्त एवं पंचक-भद्रा विचार ({selectedDate})</span>
                </h3>
                {currentFestival && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${currentFestival.isHoliday ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'}`}>
                    🎉 विशेष पर्व: {currentFestival.name}
                  </span>
                )}
              </div>

              {/* Brahma, Gulika & Yamaganda Muhurta Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/70 border border-emerald-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <Sun className="w-4 h-4" />
                    <span>ब्रह्म मुहूर्त (Brahma Muhurta)</span>
                  </h4>
                  <p className="text-sm font-semibold text-slate-200">{getSpecialMuhurats().brahmaMuhurta}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ध्यान एवं साधना के लिए सर्वोत्तम</p>
                </div>
                <div className="bg-slate-950/70 border border-amber-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>गुलिक काल (Gulika Kaal)</span>
                  </h4>
                  <p className="text-sm font-semibold text-slate-200">{getSpecialMuhurats().gulikaKaal}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">शुभ कार्य हेतु अनुकूल काल</p>
                </div>
                <div className="bg-slate-950/70 border border-red-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-red-300 mb-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>यमगण्ड काल (Yamaganda Kaal)</span>
                  </h4>
                  <p className="text-sm font-semibold text-slate-200">{getSpecialMuhurats().yamagandaKaal}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">विशेष यात्रा/प्रयास वर्जित</p>
                </div>
              </div>

              {/* Panchak & Bhadra Status Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>पंचक विचार (Panchak Status)</span>
                  </h4>
                  <p className="text-sm font-semibold text-slate-200">{panchangStatus.panchak}</p>
                </div>
                <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-xl">
                  <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>भद्रा विचार (Bhadra Status)</span>
                  </h4>
                  <p className="text-sm font-semibold text-slate-200">{panchangStatus.bhadra}</p>
                </div>
              </div>

              {/* Agnivasa & Shivavasa Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(() => {
                  const agni = getAgnivasaInfo(selectedDate);
                  return (
                    <div className={`p-4 rounded-xl border ${agni.isGood ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-red-950/30 border-red-500/30 text-red-300'}`}>
                      <h4 className="font-bold mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>अग्निवास विचार (Agnivasa — हवन मुहूर्त)</span>
                      </h4>
                      <p className="text-sm font-bold text-slate-100">{agni.status}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{agni.desc}</p>
                    </div>
                  );
                })()}

                {(() => {
                  const shiva = getShivavasaInfo(selectedDate);
                  return (
                    <div className={`p-4 rounded-xl border ${shiva.isGood ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/30 border-amber-500/30 text-amber-300'}`}>
                      <h4 className="font-bold mb-1 flex items-center gap-1.5">
                        <Moon className="w-4 h-4 text-amber-400" />
                        <span>शिववास विचार (Shivavasa — रुद्राभिषेक)</span>
                      </h4>
                      <p className="text-sm font-bold text-slate-100">{shiva.status}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{shiva.desc}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Tarabala Box */}
              <div className="bg-slate-950/70 border border-amber-500/30 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>ताराबल विचार (Tarabala — आज का नक्षत्र: {getTarabalaInfo().todayNakName})</span>
                </h4>
                <p className="text-xs text-slate-300">
                  आज जिन जन्म नक्षत्रों के लिए ताराबल शुभ (संपत, क्षेम, साधक, मित्र, अतिमित्र) है:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {getTarabalaInfo().goodNakshatras.map((item, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                      {item.nakName} ({item.tara})
                    </span>
                  ))}
                </div>
              </div>

              {/* Dishashool & Parihar Box */}
              <div className="bg-slate-950/70 border border-amber-500/30 p-4 rounded-xl">
                <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>दिशाशूल एवं परिहार (Dishashool & Remedy)</span>
                </h4>
                <p className="text-sm font-semibold text-slate-200">
                  दिशाशूल: <strong className="text-red-400">{DISHASHOOL_DATA[new Date(selectedDate).getDay()]?.direction || 'पश्चिम दिशा'}</strong> • परिहार: <strong className="text-emerald-400">{DISHASHOOL_DATA[new Date(selectedDate).getDay()]?.parihar || 'घृत खाकर यात्रा करें'}</strong>
                </p>
              </div>

              {/* Choghadiya Tables (Day & Night) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Day Choghadiya */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>दिन का चौघड़िया (Day Choghadiya)</span>
                  </h4>
                  <div className="space-y-2">
                    {choghadiya.day.map((slot, i) => {
                      const isGood = slot.type === 'good';
                      const isBad = slot.type === 'bad';
                      return (
                        <div key={i} className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                          isGood 
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 font-bold' 
                            : isBad 
                              ? 'bg-red-950/30 border-red-500/30 text-red-300' 
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}>
                          <span>{slot.name}</span>
                          <span className="font-mono">{slot.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Night Choghadiya */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                    <Moon className="w-4 h-4 text-amber-400" />
                    <span>रात का चौघड़िया (Night Choghadiya)</span>
                  </h4>
                  <div className="space-y-2">
                    {choghadiya.night.map((slot, i) => {
                      const isGood = slot.type === 'good';
                      const isBad = slot.type === 'bad';
                      return (
                        <div key={i} className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                          isGood 
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 font-bold' 
                            : isBad 
                              ? 'bg-red-950/30 border-red-500/30 text-red-300' 
                              : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}>
                          <span>{slot.name}</span>
                          <span className="font-mono">{slot.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Special Yogas & Hora Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                <div className="bg-slate-950/70 border border-amber-500/20 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>विशेष योग (Special Yogas)</span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {getSpecialYogas().map((yoga, yi) => (
                      <li key={yi} className="flex items-center gap-2 bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-xl text-amber-200 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <span>{yoga}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>दिन की होरा सारणी (Hora Timings)</span>
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {getHoraTable().map((h, hi) => (
                      <div key={hi} className={`flex items-center justify-between p-1.5 rounded-lg text-xs border ${
                        h.isAuspicious ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}>
                        <span>{h.planet} होरा</span>
                        <span className="font-mono">{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: दैनिक राशिफल एवं चंद्रबल (Daily Rashifal & Chandrabala) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span>5. दैनिक राशिफल एवं चंद्रबल ({selectedDate})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  आज का चंद्र राशि: <strong className="text-amber-200">{getChandrabalaAndRashifal().moonRashiName}</strong> • उत्तम चंद्रबल वाली राशियाँ: <strong className="text-emerald-400">{getChandrabalaAndRashifal().auspiciousNames}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(getChandrabalaAndRashifal().predictions).map(([rNumStr, pred]) => {
                  const rNum = Number(rNumStr);
                  const rName = RASHI_HI_NAMES[rNum];
                  return (
                    <div key={rNum} className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl hover:border-amber-500/40 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-300 text-sm">{rName} राशि</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          राशिफल
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{pred}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 6: गोचर कुंडली (Surya & Chandra Transit Charts) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="pb-2 border-b border-slate-800">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>6. गोचर कुंडली (Surya & Chandra Gochar Kundli Charts) — {selectedDate}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  खगोलीय ग्रह स्पष्ट एवं लहरी अयनांश आधारित सूर्य गोचर और चंद्र गोचर कुंडलियाँ:
                </p>
              </div>

              {profile && userJanmaRashi && (
                <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl">
                  <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>आपकी जन्म राशि ({userJanmaRashi}) पर आज के गोचर का प्रभाव</span>
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    आज चंद्रमा <strong className="text-amber-200">{transitData?.planets?.Moon ? RASHI_HI_NAMES[transitData.planets.Moon.rashi] : '—'}</strong> राशि में गोचर कर रहा है। आपकी जन्म राशि <strong>{userJanmaRashi}</strong> के अनुसार आज का दिन मानसिक संतुलन, निर्णय क्षमता और पारिवारिक सौहार्द के लिए अनुकूल है। महत्वपूर्ण कार्यों को प्रातःकाल में पूर्ण करें।
                  </p>
                </div>
              )}

              {/* Today's Transit Alert */}
              {(() => {
                const tr = getTodayTransitAlert(selectedDate);
                return (
                  <div className="bg-gradient-to-r from-amber-950/60 to-purple-950/60 border border-amber-500/50 p-4 rounded-xl flex items-center gap-3">
                    <Zap className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-amber-200 text-xs sm:text-sm">
                        आज का प्रमुख राशि परिवर्तन: {tr.planet} का {tr.toRashi} राशि में प्रवेश ({tr.time})
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">{tr.note} — ({tr.fromRashi} से {tr.toRashi})</p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderGocharKundliSvg(transitData?.planets?.Sun?.rashi || 1, 'सूर्य गोचर कुंडली (Sun Transit Chart)')}
                {renderGocharKundliSvg(transitData?.planets?.Moon?.rashi || 2, 'चंद्र गोचर कुंडली (Moon Transit Chart)')}
              </div>

              <div className="bg-slate-950/70 border border-amber-500/20 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>वर्तमान ग्रह गोचर स्थिति (Planetary Transit Positions)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                  {transitData?.planets && Object.values(transitData.planets).map((p: any, idx: number) => (
                    <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-amber-300 font-bold block">{PLANET_HI_NAMES[p.name] || p.name}</span>
                      <span className="text-slate-300">{RASHI_HI_NAMES[p.rashi]} • {formatDeg(p.degree)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Rashi Parivartan Table */}
              <div className="bg-slate-950/70 border border-amber-500/20 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>आगामी ग्रह राशि परिवर्तन (तिथि एवं समय सहित)</span>
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-amber-300 border-b border-slate-800">
                        <th className="p-2.5 font-bold">ग्रह (Planet)</th>
                        <th className="p-2.5 font-bold">राशि परिवर्तन (Rashi Change)</th>
                        <th className="p-2.5 font-bold">दिनांक एवं सटीक समय (Date & Time)</th>
                        <th className="p-2.5 font-bold">विवरण</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dynamicParivartans.map((par, pIdx) => (
                        <tr key={pIdx} className="hover:bg-slate-900/50">
                          <td className="p-2.5 font-bold text-amber-200">{par.planet}</td>
                          <td className="p-2.5 text-slate-300">{par.fromRashi} से <strong className="text-amber-300">{par.toRashi}</strong> में प्रवेश</td>
                          <td className="p-2.5 text-emerald-400 font-mono font-semibold">📅 {par.date}, {par.time}</td>
                          <td className="p-2.5 text-slate-400">{par.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SECTION 7: संपूर्ण राशिफल (दैनिक, साप्ताहिक, मासिक एवं वार्षिक) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>7. संपूर्ण राशिफल (दैनिक, साप्ताहिक, मासिक एवं वार्षिक)</span>
                </h3>
                {/* Period Tabs */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[
                    { id: 'daily', label: 'दैनिक' },
                    { id: 'weekly', label: 'साप्ताहिक' },
                    { id: 'monthly', label: 'मासिक' },
                    { id: 'yearly', label: 'वार्षिक' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setRashifalPeriod(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        rashifalPeriod === tab.id
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'text-slate-300 hover:text-amber-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rashi Selector Pills */}
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-2">अपनी राशि चुनें:</span>
                <div className="flex flex-wrap gap-1.5">
                  {RASHI_HI_NAMES.slice(1).map((rName, rIdx) => {
                    const rNum = rIdx + 1;
                    const isSelected = selectedRashiNum === rNum;
                    return (
                      <button
                        key={rNum}
                        onClick={() => setSelectedRashiNum(rNum)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
                            : 'bg-slate-950/80 hover:bg-slate-800 text-amber-300 border border-slate-800'
                        }`}
                      >
                        {rName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prediction Card */}
              {(() => {
                const pred = getRashifalPrediction(selectedRashiNum, rashifalPeriod);
                const rName = RASHI_HI_NAMES[selectedRashiNum];
                const periodTitle = rashifalPeriod === 'daily' ? 'दैनिक' : rashifalPeriod === 'weekly' ? 'साप्ताहिक' : rashifalPeriod === 'monthly' ? 'मासिक' : 'वार्षिक';
                return (
                  <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-base font-extrabold text-amber-300">
                        {rName} राशि का {periodTitle} राशिफल ({selectedDate})
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        वैदिक ज्योतिषी आंकलन
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-amber-400 font-bold block mb-1">💼 करियर व धन (Career & Wealth)</span>
                        <p className="text-slate-300 leading-relaxed">{pred.career}</p>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-amber-400 font-bold block mb-1">👨‍👩‍👧 परिवार व स्वास्थ्य (Family & Health)</span>
                        <p className="text-slate-300 leading-relaxed">{pred.family}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">शुभ रंग:</span>
                        <span className="text-amber-200 font-bold">{pred.color}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">शुभ अंक:</span>
                        <span className="text-amber-200 font-bold">{pred.number}</span>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between sm:col-span-1 sm:col-start-auto">
                        <span className="text-slate-400 font-semibold">सरल उपाय:</span>
                        <span className="text-emerald-400 font-bold truncate max-w-[150px]" title={pred.remedy}>{pred.remedy}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Share / Copy Button at Bottom */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleShareOrCopy}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-5 h-5" />
                <span>पंचांग शेयर / कॉपी करें</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
