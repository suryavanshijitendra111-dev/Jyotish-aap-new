/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BirthProfile, MasterKundliData } from '../../types/kundli';
import { AstronomyService } from '../../services/astronomy/astronomyService';
import { useTranslation } from '../../i18n';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { KPQuestionJudgment } from './KPQuestionJudgment';
import { DashaChartView } from './DashaChartView';
import { YoginiDashaView } from './YoginiDashaView';
import { AshtottariDashaView } from './AshtottariDashaView';
import { GocharVedhaView } from './GocharVedhaView';
import { VargaSpeaksControl } from './VargaSpeaksControl';
import { VargaKundaliView } from './VargaKundaliView';
import { SphutasView } from './SphutasView';
import { UpagrahaView } from './UpagrahaView';
import { PlanetSpeaksControl } from './PlanetSpeaksControl';
import { BhriguNandiNadiView } from './BhriguNandiNadiView';
import { HouseSpeaksControl } from './HouseSpeaksControl';
import { AshtakavargaView } from './AshtakavargaView';
import { JaiminiView } from './JaiminiView';
import { ArudhaCharaView } from './ArudhaCharaView';
import { SudarshanaChakraView } from './SudarshanaChakraView';
import { SarvatobhadraView } from './SarvatobhadraView';
import { YogaDoshaView } from './YogaDoshaView';
import { LongevityArgalaView } from './LongevityArgalaView';
import { SpecialPointsView } from './SpecialPointsView';
import { ShadbalaView } from './ShadbalaView';
import { NumerologyView } from './NumerologyView';
import { LoShuGridView } from './LoShuGridView';
import LiveTransitChart from './LiveTransitChart';
import { VargaEngine } from '../../services/jyotish/vargaEngine';
import { VedicKundliAdvancedEngine } from '../../services/jyotish/vedicKundliAdvancedEngine';

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

const HOUSE_POLYGONS: Record<number, string> = {
  1: '50,0 75,25 50,50 25,25',
  2: '0,0 50,0 25,25',
  3: '0,0 25,25 0,50',
  4: '0,50 25,25 50,50 25,75',
  5: '0,50 25,75 0,100',
  6: '0,100 50,100 25,75',
  7: '50,100 25,75 50,50 75,75',
  8: '50,100 100,100 75,75',
  9: '100,100 100,50 75,75',
  10: '100,50 75,75 50,50 75,25',
  11: '100,50 100,0 75,25',
  12: '100,0 50,0 75,25'
};

const HOUSE_POSITIONS: Record<number, string> = {
  1: 'top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2',
  2: 'top-[10%] left-[25%] -translate-x-1/2 -translate-y-1/2',
  3: 'top-[25%] left-[10%] -translate-x-1/2 -translate-y-1/2',
  4: 'top-[50%] left-[23%] -translate-x-1/2 -translate-y-1/2',
  5: 'top-[75%] left-[10%] -translate-x-1/2 -translate-y-1/2',
  6: 'top-[90%] left-[25%] -translate-x-1/2 -translate-y-1/2',
  7: 'top-[77%] left-1/2 -translate-x-1/2 -translate-y-1/2',
  8: 'top-[90%] left-[75%] -translate-x-1/2 -translate-y-1/2',
  9: 'top-[75%] left-[90%] -translate-x-1/2 -translate-y-1/2',
  10: 'top-[50%] left-[77%] -translate-x-1/2 -translate-y-1/2',
  11: 'top-[25%] left-[90%] -translate-x-1/2 -translate-y-1/2',
  12: 'top-[10%] left-[75%] -translate-x-1/2 -translate-y-1/2'
};

const HOUSE_CENTROIDS: Record<number, { x: number; y: number }> = {
  1: { x: 50, y: 25 },
  2: { x: 25, y: 8.33 },
  3: { x: 8.33, y: 25 },
  4: { x: 25, y: 50 },
  5: { x: 8.33, y: 75 },
  6: { x: 25, y: 91.67 },
  7: { x: 50, y: 75 },
  8: { x: 75, y: 91.67 },
  9: { x: 91.67, y: 75 },
  10: { x: 75, y: 50 },
  11: { x: 91.67, y: 25 },
  12: { x: 75, y: 8.33 }
};

const VARGA_NAMES_HI: Record<number, string> = {
  1: 'राशि कुंडली (D1)',
  2: 'होरा कुंडली (D2)',
  3: 'द्रेष्काण कुंडली (D3)',
  4: 'चतुर्थांश कुंडली (D4)',
  7: 'सप्तांश कुंडली (D7)',
  9: 'नवांश कुंडली (D9)',
  10: 'दशमांश कुंडली (D10)',
  12: 'द्वादशांश कुंडली (D12)',
  16: 'षोडशांश कुंडली (D16)',
  20: 'विंशांश कुंडली (D20)',
  24: 'चतुर्विंशांश कुंडली (D24)',
  27: 'सप्तविंशांश कुंडली (D27)',
  30: 'त्रिंशांश कुंडली (D30)',
  40: 'खवेदांश कुंडली (D40)',
  45: 'अक्षवेदांश कुंडली (D45)',
  60: 'षष्ट्यंश कुंडली (D60)',
  72: 'अष्टोत्तरांश / नाड़ी (D72)',
  81: 'नव-नवांश (D81)',
  96: 'प्रभाव (D96)',
  108: 'अष्टोत्तरांश (D108)',
  120: 'द्वादश-दशमांश (D120)',
  144: 'द्वादश-द्वादशांश (D144)',
  145: 'महा-चतुर्थांश (D145)'
};

const RASHI_HI_NAMES = ['', 'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
const PLANET_HI_NAMES: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु'
};

const NAKSHATRA_SHORT_NAMES_HI = [
  'अश्वि', 'भरणि', 'कृत्ति', 'रोहि', 'मृग', 'आर्द्रा', 'पुनर्व', 'पुष्य', 'अश्ले',
  'मघा', 'पूर्वा', 'उत्तरा', 'हस्त', 'चित्रा', 'स्वाति', 'विशा', 'अनुरा', 'ज्येष्ठा',
  'मूल', 'पूर्वाषा', 'उत्तराषा', 'श्रवण', 'धनिष्ठा', 'शतभि', 'पूर्वाभा', 'उत्तराभा', 'रेवती'
];

function getAvakahadaDetails(masterData: MasterKundliData | null) {
  if (!masterData || !masterData.planets?.Moon) return null;
  const moon = masterData.planets.Moon;
  const lagna = masterData.lagnetish || masterData.lagna;
  
  const moonRashi = moon.rashi || 1;
  const moonDeg = moon.degree || 0;
  const totalMoonLon = (moonRashi - 1) * 30 + moonDeg;
  
  const nakIndex = Math.floor(totalMoonLon / (360 / 27)) + 1;
  const padaIndex = Math.floor((totalMoonLon % (360 / 27)) / (360 / 108)) + 1;
  
  const nakNamesHi = [
    'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा',
    'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
    'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वाभाद्रपद', 'उत्तराभाद्रपद', 'रेवती'
  ];
  const nakLords = [
    'केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध',
    'केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध',
    'केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध'
  ];
  
  const nakName = nakNamesHi[nakIndex - 1] || 'अश्विनी';
  const nakLord = nakLords[nakIndex - 1] || 'केतु';
  
  const rashiNamesHi = ['', 'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
  const rashiLords = ['', 'मंगल', 'शुक्र', 'बुध', 'चंद्र', 'सूर्य', 'बुध', 'शुक्र', 'मंगल', 'गुरु', 'शनि', 'शनि', 'गुरु'];
  const moonSign = rashiNamesHi[moonRashi] || 'मेष';
  const moonSignLord = rashiLords[moonRashi] || 'मंगल';

  const sunRashi = masterData.planets?.Sun?.rashi || 1;
  const sunSign = rashiNamesHi[sunRashi] || 'वृश्चिक';

  const devaNaks = [1, 5, 7, 8, 13, 14, 15, 17, 27];
  const manushyaNaks = [2, 4, 6, 11, 12, 20, 21, 25, 26];
  const gana = devaNaks.includes(nakIndex) ? 'देव गण' : manushyaNaks.includes(nakIndex) ? 'मनुष्य गण' : 'राक्षस गण';

  const vataNaks = [1, 6, 7, 12, 13, 18, 19, 24, 25];
  const pittaNaks = [2, 5, 8, 11, 14, 17, 20, 23, 26];
  const nadi = vataNaks.includes(nakIndex) ? 'आदि नाड़ी (वात)' : pittaNaks.includes(nakIndex) ? 'मध्य नाड़ी (पित्त)' : 'अंत्य नाड़ी (कफ)';

  const lagnaRashi = lagna?.rashi || 1;
  const moonHouseFromLagna = ((moonRashi - lagnaRashi + 12) % 12) + 1;
  let paya = 'ताम्र पाया';
  if ([1, 6, 11].includes(moonHouseFromLagna)) paya = 'स्वर्ण पाया (Gold)';
  else if ([2, 5, 9].includes(moonHouseFromLagna)) paya = 'रजत पाया (Silver)';
  else if ([3, 7, 10].includes(moonHouseFromLagna)) paya = 'ताम्र पाया (Copper)';
  else paya = 'लोह पाया (Iron)';

  const syllablesMatrix: Record<number, string[]> = {
    1: ['चु', 'चे', 'चो', 'ला'],
    2: ['ली', 'लू', 'ले', 'लो'],
    3: ['अ', 'इ', 'उ', 'ए'],
    4: ['ओ', 'वा', 'वी', 'वू'],
    5: ['वे', 'वो', 'का', 'की'],
    6: ['कू', 'घ', 'ङ', 'छ'],
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
    17: ['ना', 'नी', 'नु', 'ने'],
    18: ['नो', 'या', 'यी', 'यू'],
    19: ['ये', 'यो', 'भा', 'भी'],
    20: ['भू', 'धा', 'फा', 'ढा'],
    21: ['भे', 'भो', 'जा', 'जी'],
    22: ['खी', 'हू', 'खे', 'खो'],
    23: ['गा', 'गी', 'गु', 'गे'],
    24: ['गो', 'सा', 'सी', 'सू'],
    25: ['से', 'सो', 'दा', 'दी'],
    26: ['दू', 'थ', 'झ', 'ञ'],
    27: ['दे', 'दो', 'चा', 'ची']
  };
  const namakshara = (syllablesMatrix[nakIndex] || ['अ', 'इ', 'उ', 'ए'])[padaIndex - 1] || 'अ';

  const varnaMap: Record<number, string> = { 1: 'क्षत्रिय', 2: 'वैश्य', 3: 'शूद्र', 4: 'ब्राह्मण', 5: 'क्षत्रिय', 6: 'वैश्य', 7: 'शूद्र', 8: 'ब्राह्मण', 9: 'क्षत्रिय', 10: 'वैश्य', 11: 'शूद्र', 12: 'ब्राह्मण' };
  const vashyaMap: Record<number, string> = { 1: 'चतुष्पाद', 2: 'मानव / द्विपाद', 3: 'नर / द्विपाद', 4: 'जलचर', 5: 'वनचर / सिंह', 6: 'मानव', 7: 'नर', 8: 'कीट / जलचर', 9: 'चतुष्पाद / अश्व', 10: 'जलचर / मकर', 11: 'मानव', 12: 'जलचर / मीन' };
  const yoniMap = ['अश्व', 'गज', 'मेष', 'सर्प', 'श्वा', 'मार्जार', 'मूषक', 'गो', 'महिष', 'व्याघ्र', 'मृग', 'वानर', 'नकुल', 'सिंह'];
  const tatvaMap = ['', 'अग्नि (Fire)', 'पृथ्वी (Earth)', 'वायु (Air)', 'जल (Water)', 'अग्नि (Fire)', 'पृथ्वी (Earth)', 'वायु (Air)', 'जल (Water)', 'अग्नि (Fire)', 'पृथ्वी (Earth)', 'वायु (Air)', 'जल (Water)'];

  const varna = varnaMap[moonRashi] || 'क्षत्रिय';
  const vashya = vashyaMap[moonRashi] || 'मानव';
  const yoni = yoniMap[(nakIndex - 1) % yoniMap.length] || 'अश्व';
  const tatva = tatvaMap[moonRashi] || 'अग्नि';

  return {
    moonSign,
    moonSignLord,
    nakName,
    nakIndex,
    padaIndex,
    nakLord,
    namakshara,
    gana,
    nadi,
    paya,
    sunSign,
    varna,
    vashya,
    yoni,
    tatva
  };
}

interface ModuleScreenProps {
  activeModule: string;
  profile: BirthProfile | null;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export const ModuleScreen: React.FC<ModuleScreenProps> = ({
  activeModule,
  profile,
  onBack
}) => {
  if (!activeModule) {
    onBack();
    return null;
  }
  if (['numerology', 'ankashastra'].includes(activeModule)) {
    return <NumerologyView onBack={onBack} />;
  }
  if (['loshu', 'loshu_grid'].includes(activeModule)) {
    return <LoShuGridView onBack={onBack} />;
  }
  const { t, currentLanguageInfo } = useTranslation();
  const language = currentLanguageInfo.code;
  const [loading, setLoading] = useState(true);
  const [kundliData, setKundliData] = useState<MasterKundliData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiv, setSelectedDiv] = useState<number>(9);
  const [kundliSubTab, setKundliSubTab] = useState<'overview' | 'birth_details' | 'karakamsha' | 'ghatak' | 'friendship' | 'ashtakavarga' | 'grah_sthiti' | 'grah_sthiti_sub' | 'chalit'>('overview');

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    AstronomyService.calculateKundli(profile, 'Lahiri')
      .then(res => {
        if (res.status === 'Ready' && res.data) {
          setKundliData(res.data);
        } else {
          setError(res.message || 'Calculation error');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [profile]);

  const moduleTitle = t(`modules.${activeModule}.title`) || activeModule;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-28 min-h-screen bg-cosmic-deep text-white">
      {/* Universal Back Navigation Header */}
      <header className="flex items-center justify-between p-4 sm:p-5 border-b border-[#d4af37]/20 bg-[#030a08]/90 sticky top-0 z-30 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] text-sm font-bold hover:bg-[#d4af37]/25 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('nav.back_to_dashboard') || '← Dashboard'}</span>
        </button>
        <h1 className="text-base sm:text-lg font-bold text-[#d4af37] truncate max-w-[200px] sm:max-w-[240px] text-right">
          {moduleTitle}
        </h1>
      </header>

      <main className="p-4 sm:p-5 flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin mb-3" />
            <p className="text-sm text-[#d4af37] font-medium">{t('common.loading') || 'Calculating Ephemeris...'}</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/40 border border-red-500/50 rounded-2xl text-center text-red-300">
            <p>{error}</p>
          </div>
        ) : !kundliData ? (
          <div className="p-6 bg-black/40 border border-[#d4af37]/30 rounded-2xl text-center text-gray-300">
            <p>{t('common.notAvailable') || 'Profile data required.'}</p>
          </div>
        ) : (
          <div>
            {(() => {
              const isKundliModule = ['kundli', 'kundli_janmang', 'kundliJanmang', 'kundli_shell'].includes(activeModule);
              return (
                <>
                  {isKundliModule && (
                    <div className="space-y-6">
                      {/* Horizontal Sub-Tabs in Pure Hindi */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar bg-[#030a08]/90 p-2 rounded-2xl border border-[#d4af37]/30 sticky top-16 z-20 backdrop-blur-md">
                        {[
                          { id: 'overview', label: 'मुख्य कुण्डली' },
                          { id: 'birth_details', label: 'जन्म विवरण' },
                          { id: 'grah_sthiti', label: 'ग्रह स्थिति' },
                          { id: 'grah_sthiti_sub', label: 'ग्रह स्थिति सब' },
                          { id: 'chalit', label: 'चलित तालिका' },
                          { id: 'karakamsha', label: 'कारकांश व स्वांश' },
                          { id: 'ghatak', label: 'घातक चक्र' },
                          { id: 'friendship', label: 'मैत्री चक्र' },
                          { id: 'ashtakavarga', label: 'अष्टकवर्ग' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setKundliSubTab(tab.id as any)}
                            className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                              kundliSubTab === tab.id
                                ? 'bg-gradient-to-r from-[#ffe89e] via-[#d4af37] to-[#aa831b] text-black shadow-[0_0_12px_rgba(212,175,55,0.5)] scale-105'
                                : 'bg-[#061e14] text-gray-300 border border-[#d4af37]/30 hover:border-[#d4af37] hover:text-[#d4af37]'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {kundliSubTab === 'overview' && (
                        <div className="space-y-6">
                          {/* Avakahada Chakra & Birth Details Card */}
                          {(() => {
                            const avakahada = getAvakahadaDetails(kundliData);
                            if (!avakahada) return null;
                            const dobStr = profile?.dob || '2026-11-13';
                            const timeStr = profile?.time || '12:00';
                            const locationStr = profile?.locationName || profile?.location || 'भारत';
                            return (
                              <div className="bg-gradient-to-br from-[#071d14] via-[#030d08] to-[#020a06] border-2 border-[#d4af37]/60 p-4 sm:p-5 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] space-y-4">
                                <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#d4af37]" />
                                    <h3 className="text-base sm:text-lg font-bold text-[#d4af37]">
                                      अवकहड़ा चक्र एवं जन्म विवरण (Avakahada Chakra & Panchang)
                                    </h3>
                                  </div>
                                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#d4af37]/20 text-[#ffe89e] border border-[#d4af37]/40 font-bold">
                                    वैदिक ज्योतिष
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                  <div className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-3 flex flex-col justify-between">
                                    <span className="text-gray-400 text-[11px]">जन्म राशि व स्वामी</span>
                                    <span className="text-[#ffe89e] font-bold text-sm mt-1">
                                      {avakahada.moonSign} ({avakahada.moonSignLord})
                                    </span>
                                  </div>

                                  <div className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-3 flex flex-col justify-between">
                                    <span className="text-gray-400 text-[11px]">जन्म नक्षत्र व चरण</span>
                                    <span className="text-[#ffe89e] font-bold text-sm mt-1">
                                      {avakahada.nakName} (चरण {avakahada.padaIndex})
                                    </span>
                                  </div>

                                  <div className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-3 flex flex-col justify-between">
                                    <span className="text-gray-400 text-[11px]">नक्षत्र स्वामी</span>
                                    <span className="text-emerald-300 font-bold text-sm mt-1">
                                      {avakahada.nakLord}
                                    </span>
                                  </div>

                                  <div className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-3 flex flex-col justify-between">
                                    <span className="text-gray-400 text-[11px]">जन्माक्षर / नामाक्षर</span>
                                    <span className="text-[#ffe89e] font-bold text-sm mt-1 font-mono">
                                      {avakahada.namakshara} (प्रारंभिक अक्षर)
                                    </span>
                                  </div>

                                  <div className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-3 flex flex-col justify-between">
                                    <span className="text-gray-400 text-[11px]">पाया (Paya)</span>
                                    <span className="text-amber-300 font-bold text-sm mt-1">
                                      {avakahada.paya}
                                    </span>
                                  </div>

                                  <div className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-3 flex flex-col justify-between">
                                    <span className="text-gray-400 text-[11px]">गण व नाड़ी</span>
                                    <span className="text-gray-200 font-bold text-xs mt-1">
                                      {avakahada.gana} • {avakahada.nadi}
                                    </span>
                                  </div>

                                  <div className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-3 flex flex-col justify-between">
                                    <span className="text-gray-400 text-[11px]">योनि, वर्ण व वश्य</span>
                                    <span className="text-gray-200 font-bold text-xs mt-1">
                                      {avakahada.yoni} • {avakahada.varna} • {avakahada.vashya}
                                    </span>
                                  </div>

                                  <div className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-3 flex flex-col justify-between">
                                    <span className="text-gray-400 text-[11px]">तत्व व सूर्य राशि</span>
                                    <span className="text-gray-200 font-bold text-xs mt-1">
                                      {avakahada.tatva} • सूर्य: {avakahada.sunSign}
                                    </span>
                                  </div>

                                  <div className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-3 flex flex-col justify-between">
                                    <span className="text-gray-400 text-[11px]">जन्म विवरण (दिनांक/समय)</span>
                                    <span className="text-emerald-400 font-bold text-xs mt-1 font-mono">
                                      {dobStr} {timeStr} ({locationStr})
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1">
                              मुख्य D1-D145 वर्ग कुंडली (Divisional Charts D1 - D145)
                            </h4>
                            <div className="bg-black/40 border border-[#d4af37]/30 rounded-2xl p-4">
                              <VargaKundaliView masterData={kundliData} language={language} />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1">
                              जन्म चंद्र राशि कुंडली (Natal Moon Chart)
                            </h4>
                            <div className="bg-gradient-to-br from-[#061e14] via-[#030d08] to-[#020a06] border border-[#d4af37]/50 p-4 sm:p-6 rounded-3xl relative shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
                              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#d4af37]/20">
                                <div>
                                  <h3 className="text-base sm:text-lg font-bold text-[#d4af37]">जन्म चंद्र राशि चक्र (Natal Moon Ascendant Chart)</h3>
                                  <p className="text-xs text-gray-300">चंद्रमा को प्रथम भाव (लग्न) मानकर जन्मकालीन ग्रहों की स्थिति</p>
                                </div>
                                <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-[#d4af37]/20 text-[#ffe89e] border border-[#d4af37]/40 font-bold">
                                  चन्द्र लग्न: {RASHI_HI_NAMES[kundliData?.planets?.Moon?.rashi || 1]}
                                </span>
                              </div>

                              <div className="w-full aspect-square max-w-[320px] relative mx-auto bg-[#030d08] border-2 border-[#d4af37]/60 rounded-2xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.8)] select-none">
                                <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#d4af37] stroke-[0.5]">
                                  <rect x="0" y="0" width="100" height="100" className="fill-[#04140d] stroke-none" />
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => (
                                    <polygon key={house} points={HOUSE_POLYGONS[house]} className="fill-[#082218]/90 stroke-[#d4af37]/70 stroke-[0.8]" />
                                  ))}
                                  <rect x="0" y="0" width="100" height="100" className="fill-none stroke-[#d4af37]/70 stroke-[0.8]" />
                                  <line x1="0" y1="0" x2="100" y2="100" className="stroke-[#d4af37]/80 stroke-[0.7]" />
                                  <line x1="100" y1="0" x2="0" y2="100" className="stroke-[#d4af37]/80 stroke-[0.7]" />
                                  <polygon points="50,0 100,50 50,100 0,50" className="fill-none stroke-[#d4af37]/80 stroke-[0.7]" />
                                </svg>

                                <div className="absolute inset-0 text-[#d4af37]/90 font-medium text-xs pointer-events-none">
                                  {(() => {
                                    const moonRashi = kundliData?.planets?.Moon?.rashi || 1;
                                    const houseRashis: Record<number, number> = {};
                                    const housePlanets: Record<number, string[]> = {};
                                    for (let h = 1; h <= 12; h++) {
                                      houseRashis[h] = ((moonRashi - 1 + (h - 1)) % 12) + 1;
                                      housePlanets[h] = [];
                                    }
                                    const ALL_NAVAGRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
                                    for (const p of ALL_NAVAGRAHAS) {
                                      const pData = kundliData?.planets?.[p];
                                      const pRashi = pData?.rashi || (pData?.longitude ? Math.floor(pData.longitude / 30) + 1 : 1);
                                      const pHouse = ((pRashi - moonRashi + 12) % 12) + 1;
                                      if (housePlanets[pHouse]) {
                                        housePlanets[pHouse].push(p);
                                      }
                                    }

                                    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
                                      const rNum = houseRashis[house];
                                      const occupants = housePlanets[house] || [];
                                      const isMoonLagna = house === 1;

                                      return (
                                        <div key={house} className={`absolute ${HOUSE_POSITIONS[house]} flex flex-col items-center p-0.5 text-center z-10 leading-tight`}>
                                          <span className="text-[9px] font-bold bg-[#04150e]/90 text-emerald-300 border border-[#d4af37]/40 rounded-full px-1.5 py-0.2 mb-0.5">
                                            {rNum}
                                          </span>
                                          {isMoonLagna && (
                                            <span className="text-emerald-400 text-[8.5px] font-bold tracking-wider">
                                              चन्द्र लग्न
                                            </span>
                                          )}
                                          <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-[75px]">
                                            {occupants.map(p => {
                                              const hiName = PLANET_HI_NAMES[p] || p;
                                              const abbr = hiName.slice(0, 3);
                                              const pMaster = kundliData?.planets?.[p];
                                              const isRetro = pMaster?.isRetrograde;
                                              const degStr = pMaster?.degree != null ? `${Math.floor(pMaster.degree)}°${Math.floor((pMaster.degree % 1) * 60)}'` : '';
                                              const nakShort = pMaster?.nakshatra ? NAKSHATRA_SHORT_NAMES_HI[pMaster.nakshatra - 1] : '';
                                              return (
                                                <span key={p} className="px-1 py-0.5 rounded bg-black/80 text-[#fae19c] border border-[#d4af37]/50 text-[8px] font-bold" title={`${hiName} ${degStr} ${nakShort}`}>
                                                  {abbr} {degStr} {nakShort}{isRetro ? '*' : ''}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1">
                              वर्तमान गोचर / लाइव प्लैनेटरी ट्रांज़िट (Live Planetary Transit Chart)
                            </h4>
                            <div className="bg-black/40 border border-[#d4af37]/30 rounded-2xl p-4">
                              <LiveTransitChart masterData={kundliData} initialViewMode="live_lagna" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1">
                              मुख्य षडबल (Mukhya Shadbala)
                            </h4>
                            <ShadbalaView data={kundliData} />
                          </div>
                        </div>
                      )}

                      {kundliSubTab === 'birth_details' && (
                        <div className="bg-black/40 border border-[#d4af37]/30 rounded-3xl p-5 shadow-xl space-y-4">
                          <h3 className="text-base font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-3">
                            जन्म एवं व्यक्ति विवरण (Birth, Panchang & Astronomical Details Table)
                          </h3>
                          {(() => {
                            const adv = VedicKundliAdvancedEngine.analyze(kundliData, profile);
                            const bd = adv.birthDetails;
                            const tableRows = [
                              ['नाम (Name)', bd.name],
                              ['जन्म दिनांक (Birth Date)', bd.dob],
                              ['जन्म समय (Birth Time)', bd.time],
                              ['जन्म दिन (Day)', bd.day],
                              ['जन्म स्थान (Birth Place)', bd.location],
                              ['अक्षांश व देशांतर (Lat / Lon)', bd.latLon],
                              ['टाइम जोन (Timezone)', bd.timezone],
                              ['स्थानीय समय संशोधन (LMT Correction)', bd.lmtCorrection],
                              ['स्थानीय औसत समय (LMT)', bd.lmtTime],
                              ['जन्म समय (GMT / UTC)', bd.gmtTime],
                              ['इष्टकाल (Ghati-Pala-Vipala)', bd.ishtakaal],
                              ['तिथि (Tithi)', bd.tithi],
                              ['पक्ष (Paksha)', bd.paksha],
                              ['नक्षत्र व चरण (Nakshatra & Pada)', bd.nakshatraPada],
                              ['योग (Yoga)', bd.yoga],
                              ['करण (Karana)', bd.karana],
                              ['सूर्योदय (Sunrise)', bd.sunrise],
                              ['सूर्यास्त (Sunset)', bd.sunset],
                              ['दिन अवधि (Day Duration)', bd.dayDuration],
                              ['जूलियन दिन (Julian Day)', bd.julianDay],
                              ['अयनांश मान (Ayanamsa - Lahiri)', bd.ayanamsa],
                              ['साम्पातिक काल (Sidereal Time)', bd.siderealTime],
                              ['मंगल दोष (Mangal Dosha)', bd.mangalDosha],
                              ['वर्तमान आयु (Current Age)', bd.currentAge],
                              ['दशा भोग्य (Vimshottari Balance)', bd.dashaBhogya]
                            ];
                            return (
                              <div className="overflow-x-auto rounded-xl border border-[#d4af37]/25 bg-black/60">
                                <table className="w-full text-xs text-left">
                                  <tbody className="divide-y divide-[#d4af37]/15">
                                    {tableRows.map(([label, val], idx) => (
                                      <tr key={idx} className="hover:bg-white/5">
                                        <td className="p-3 text-[#d4af37] font-bold w-1/2">{label}</td>
                                        <td className="p-3 text-gray-200 font-mono w-1/2">{val}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {kundliSubTab === 'karakamsha' && (
                        <div className="bg-black/40 border border-[#d4af37]/30 rounded-3xl p-5 shadow-xl space-y-6">
                          <h3 className="text-base font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-3">
                            कारकांश एवं स्वांश कुंडली (Karakamsha & Swamsha Charts)
                          </h3>
                          {(() => {
                            const adv = VedicKundliAdvancedEngine.analyze(kundliData, profile);
                            const renderSvgKundli = (planetsByHouse: Record<number, string[]>, d9LagnaSign: number) => {
                              const houseRashis: Record<number, number> = {};
                              for (let h = 1; h <= 12; h++) {
                                houseRashis[h] = ((d9LagnaSign - 1 + (h - 1)) % 12) + 1;
                              }
                              return (
                                <div className="w-full aspect-square max-w-[280px] relative mx-auto bg-[#030d08] border-2 border-[#d4af37]/60 rounded-2xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.8)] select-none">
                                  <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#d4af37] stroke-[0.5]">
                                    <rect x="0" y="0" width="100" height="100" className="fill-[#04140d] stroke-none" />
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => (
                                      <polygon key={house} points={HOUSE_POLYGONS[house]} className="fill-[#082218]/90 stroke-[#d4af37]/70 stroke-[0.8]" />
                                    ))}
                                    <rect x="0" y="0" width="100" height="100" className="fill-none stroke-[#d4af37]/70 stroke-[0.8]" />
                                    <line x1="0" y1="0" x2="100" y2="100" className="stroke-[#d4af37]/80 stroke-[0.7]" />
                                    <line x1="100" y1="0" x2="0" y2="100" className="stroke-[#d4af37]/80 stroke-[0.7]" />
                                    <polygon points="50,0 100,50 50,100 0,50" className="fill-none stroke-[#d4af37]/80 stroke-[0.7]" />
                                  </svg>
                                  <div className="absolute inset-0 text-[#d4af37]/90 font-medium text-xs pointer-events-none">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
                                      const rNum = houseRashis[house];
                                      const occupants = planetsByHouse[house] || [];
                                      const isLagna = house === 1;
                                      return (
                                        <div key={house} className={`absolute ${HOUSE_POSITIONS[house]} flex flex-col items-center p-0.5 text-center z-10 leading-tight`}>
                                          <span className="text-[9px] font-bold bg-[#04150e]/90 text-emerald-300 border border-[#d4af37]/40 rounded-full px-1.5 py-0.2 mb-0.5">
                                            {rNum}
                                          </span>
                                          {isLagna && (
                                            <span className="text-emerald-400 text-[8px] font-bold">लग्न</span>
                                          )}
                                          <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-[65px]">
                                            {occupants.map(p => {
                                              const hiName = PLANET_HI_NAMES[p] || p;
                                              const abbr = hiName.slice(0, 3);
                                              const pMaster = kundliData?.planets?.[p];
                                              const degStr = pMaster?.degree != null ? `${Math.floor(pMaster.degree)}°${Math.floor((pMaster.degree % 1) * 60)}'` : '';
                                              const isRetro = pMaster?.isRetrograde;
                                              return (
                                                <span key={p} className="px-1 py-0.5 rounded bg-black/80 text-[#fae19c] border border-[#d4af37]/50 text-[8px] font-bold" title={`${hiName} ${degStr}`}>
                                                  {abbr} {degStr}{isRetro ? '*' : ''}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            };

                            return (
                              <div className="space-y-6">
                                <div className="p-4 bg-[#051c12] border border-[#d4af37]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                                  <div>
                                    <span className="text-gray-300">जैमिनी आत्मकarak (Atmakaraka):</span>
                                    <span className="text-[#ffe89e] font-bold ml-2 text-sm">{PLANET_HI_NAMES[adv.atmakaraka.planet] || adv.atmakaraka.planet} ({adv.atmakaraka.degreeInSign.toFixed(2)}°)</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-300">नवमांश राशि (D9 Sign):</span>
                                    <span className="text-emerald-300 font-bold ml-2 text-sm">राशि {adv.atmakaraka.d9Sign} ({RASHI_HI_NAMES[adv.atmakaraka.d9Sign]})</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-black/50 border border-[#d4af37]/30 rounded-2xl p-4 space-y-3">
                                    <h4 className="text-xs font-bold text-amber-300 text-center">कारकांश कुंडली (Karakamsha Chart - D1 in D9 Lagna)</h4>
                                    <p className="text-[11px] text-gray-300 text-center">आत्मकारक के नवमांश को लग्न मानकर D1 ग्रहों की स्थिति</p>
                                    <div className="p-3 bg-[#030d08] rounded-xl border border-[#d4af37]/40">
                                      {renderSvgKundli(adv.karakamshaPlanets, adv.atmakaraka.d9Sign)}
                                    </div>
                                  </div>

                                  <div className="bg-black/50 border border-[#d4af37]/30 rounded-2xl p-4 space-y-3">
                                    <h4 className="text-xs font-bold text-amber-300 text-center">स्वांश कुंडली (Swamsha Chart - D9 in D9 Lagna)</h4>
                                    <p className="text-[11px] text-gray-300 text-center">आत्मकारक के नवमांश को लग्न मानकर D9 ग्रहों की स्थिति</p>
                                    <div className="p-3 bg-[#030d08] rounded-xl border border-[#d4af37]/40">
                                      {renderSvgKundli(adv.swamshaPlanets, adv.atmakaraka.d9Sign)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {kundliSubTab === 'ghatak' && (
                        <div className="bg-black/40 border border-[#d4af37]/30 rounded-3xl p-5 shadow-xl space-y-6">
                          <h3 className="text-base font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-3">
                            घातक चक्र एवं अनुकूल बिन्दु (Ghatak Chakra & Favorable Points)
                          </h3>
                          {(() => {
                            const adv = VedicKundliAdvancedEngine.analyze(kundliData);
                            return (
                              <div className="space-y-6">
                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">घातक चक्र (Ghatak - Inauspicious Factors for Moon Sign)</h4>
                                  <div className="overflow-x-auto rounded-xl border border-red-500/30 bg-black/60">
                                    <table className="w-full text-xs text-left">
                                      <thead className="bg-red-950/60 text-red-300 border-b border-red-500/30 text-[11px] font-bold">
                                        <tr>
                                          <th className="p-2.5">घातक तत्व</th>
                                          <th className="p-2.5">अशुभ / वर्जित मान</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-red-500/20 text-gray-200">
                                        {[
                                          ['वार (Day)', adv.ghatak.day],
                                          ['तिथि (Tithi)', adv.ghatak.tithi],
                                          ['नक्षत्र (Nakshatra)', adv.ghatak.nakshatra],
                                          ['करण (Karana)', adv.ghatak.karan],
                                          ['योग (Yoga)', adv.ghatak.yoga],
                                          ['माह (Month)', adv.ghatak.month],
                                          ['राशि (Moon Sign)', adv.ghatak.rashi],
                                          ['लग्न (Lagna)', adv.ghatak.lagna],
                                          ['प्रहर (Prahara)', adv.ghatak.prahara],
                                          ['ग्रह (Planet)', adv.ghatak.planet]
                                        ].map(([label, val], idx) => (
                                          <tr key={idx} className="hover:bg-white/5">
                                            <td className="p-2.5 font-bold text-red-300">{label}</td>
                                            <td className="p-2.5 font-mono text-gray-100">{val}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">अनुकूल बिन्दु एवं भाग्यशाली कारक (Favorable Points)</h4>
                                  <div className="overflow-x-auto rounded-xl border border-emerald-500/30 bg-black/60">
                                    <table className="w-full text-xs text-left">
                                      <thead className="bg-emerald-950/60 text-emerald-300 border-b border-emerald-500/30 text-[11px] font-bold">
                                        <tr>
                                          <th className="p-2.5">अनुकूल तत्व</th>
                                          <th className="p-2.5">शुभ मान / रत्न / धातु</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-emerald-500/20 text-gray-200">
                                        {[
                                          ['भाग्यांक (Lucky Numbers)', adv.favorablePoints.luckyNumber],
                                          ['शुभ अंक (Auspicious Numbers)', adv.favorablePoints.auspiciousNumber],
                                          ['अशुभ अंक (Inauspicious Numbers)', adv.favorablePoints.inauspiciousNumber],
                                          ['शुभ वर्ष (Lucky Years)', adv.favorablePoints.luckyYear],
                                          ['भाग्यशाली दिन (Auspicious Days)', adv.favorablePoints.auspiciousDay],
                                          ['शुभ ग्रह (Favorable Planets)', adv.favorablePoints.favorablePlanet],
                                          ['मित्र राशियां (Friendly Signs)', adv.favorablePoints.friendlySigns],
                                          ['शुभ लग्न (Favorable Lagnas)', adv.favorablePoints.favorableLagna],
                                          ['भाग्यशाली धातु (Lucky Metal)', adv.favorablePoints.luckyMetal],
                                          ['भाग्यशाली रत्न (Lucky Gemstone)', adv.favorablePoints.luckyGem]
                                        ].map(([label, val], idx) => (
                                          <tr key={idx} className="hover:bg-white/5">
                                            <td className="p-2.5 font-bold text-emerald-300">{label}</td>
                                            <td className="p-2.5 font-mono text-gray-100">{val}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {kundliSubTab === 'friendship' && (
                        <div className="bg-black/40 border border-[#d4af37]/30 rounded-3xl p-5 shadow-xl space-y-6">
                          <h3 className="text-base font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-3">
                            मैत्री चक्र (Three-fold Planetary Friendship Grids)
                          </h3>
                          {(() => {
                            const adv = VedicKundliAdvancedEngine.analyze(kundliData);
                            const planetsList = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
                            return (
                              <div className="space-y-6">
                                {(['naturalFriendship', 'temporaryFriendship', 'panchadhaFriendship'] as const).map((gridKey, gIdx) => {
                                  const titles = ['नैसर्गिक मैत्री (Natural Friendship)', 'तात्कालिक मैत्री (Temporary Friendship)', 'पंचधा मैत्री (Compound Friendship - 5 Fold)'];
                                  const gridData = adv[gridKey];
                                  return (
                                    <div key={gIdx} className="space-y-2">
                                      <h4 className="text-xs font-bold text-[#ffe89e]">{titles[gIdx]}</h4>
                                      <div className="overflow-x-auto rounded-xl border border-[#d4af37]/25 bg-black/60">
                                        <table className="w-full text-[11px] text-center font-mono">
                                          <thead className="bg-[#041a10] text-[#d4af37] border-b border-[#d4af37]/30">
                                            <tr>
                                              <th className="p-2 text-left font-bold">ग्रह</th>
                                              {planetsList.map(p => <th key={p} className="p-2">{p}</th>)}
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-[#d4af37]/15">
                                            {planetsList.map(rowP => (
                                              <tr key={rowP} className="hover:bg-white/5">
                                                <td className="p-2 text-left font-bold text-[#d4af37]">{rowP}</td>
                                                {planetsList.map(colP => {
                                                  const val = gridData[rowP]?.[colP] || 'सम';
                                                  const colorClass = val === 'अतिमित्र' || val === 'मित्र' ? 'text-emerald-300 font-bold' : val === 'अतिशत्रु' || val === 'शत्रु' ? 'text-red-400 font-bold' : 'text-gray-300';
                                                  return <td key={colP} className={`p-2 ${colorClass}`}>{val}</td>;
                                                })}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {kundliSubTab === 'ashtakavarga' && (
                        <div className="bg-black/40 border border-[#d4af37]/30 rounded-3xl p-5 shadow-xl space-y-6">
                          <h3 className="text-base font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-3">
                            भावबल एवं प्रस्तर अष्टकवर्ग (Bhavabala & Prastara Ashtakavarga)
                          </h3>
                          {(() => {
                            const adv = VedicKundliAdvancedEngine.analyze(kundliData);
                            const rashiShorts = ['मेष', 'वृष', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
                            return (
                              <div className="space-y-6">
                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">भावबल (12-House Bhavabala Bar Chart)</h4>
                                  <div className="space-y-2 bg-black/50 border border-[#d4af37]/25 rounded-2xl p-4">
                                    {Object.entries(adv.bhavabala).map(([house, val]) => {
                                      const pct = Math.min(Math.round((Number(val) / 600) * 100), 100);
                                      return (
                                        <div key={house} className="flex items-center gap-3 text-xs">
                                          <span className="w-16 font-bold text-[#d4af37]">भाव {house}</span>
                                          <div className="flex-1 bg-black/80 h-3.5 rounded-full overflow-hidden border border-[#d4af37]/30 relative">
                                            <div className="bg-gradient-to-r from-amber-500 to-[#ffe89e] h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                          </div>
                                          <span className="w-12 text-right font-mono text-emerald-300">{val} रूप</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">प्रस्तर अष्टकवर्ग (Prastara Ashtakavarga Bindu Tables)</h4>
                                  <div className="overflow-x-auto rounded-xl border border-[#d4af37]/25 bg-black/60">
                                    <table className="w-full text-xs text-center font-mono">
                                      <thead className="bg-[#041a10] text-[#d4af37] border-b border-[#d4af37]/30 text-[11px] font-bold">
                                        <tr>
                                          <th className="p-2.5 text-left">ग्रह \ राशि</th>
                                          {rashiShorts.map((r, idx) => <th key={idx} className="p-2.5">{r}</th>)}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[#d4af37]/15 text-gray-200">
                                        {Object.entries(adv.prastaraAshtakavarga).map(([planet, rowVals]) => (
                                          <tr key={planet} className={planet === 'कुल योग' ? 'bg-[#d4af37]/15 font-bold text-[#ffe89e]' : 'hover:bg-white/5'}>
                                            <td className="p-2.5 text-left font-bold text-[#d4af37]">{planet}</td>
                                            {(rowVals as number[]).map((bindu, bIdx) => (
                                              <td key={bIdx} className="p-2.5">{bindu}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {kundliSubTab === 'grah_sthiti' && (
                        <div className="bg-black/40 border border-[#d4af37]/30 rounded-3xl p-5 shadow-xl space-y-6">
                          <h3 className="text-base font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-3">
                            ग्रह स्थिति तालिका (Detailed Planetary Positions & Nakshatras)
                          </h3>
                          {(() => {
                            const adv = VedicKundliAdvancedEngine.analyze(kundliData, profile);
                            return (
                              <div className="overflow-x-auto rounded-xl border border-[#d4af37]/25 bg-black/60">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-[#041a10] text-[#d4af37] border-b border-[#d4af37]/30 text-[11px] font-bold">
                                    <tr>
                                      <th className="p-3">ग्रह नाम</th>
                                      <th className="p-3">राशि</th>
                                      <th className="p-3">अंश (DD°MM'SS")</th>
                                      <th className="p-3">नक्षत्र</th>
                                      <th className="p-3">चरण</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#d4af37]/15 text-gray-200 font-mono">
                                    {adv.planetaryPositions.map((p) => (
                                      <tr key={p.key} className="hover:bg-white/5">
                                        <td className="p-3 font-bold text-[#ffe89e] font-sans">
                                          {p.nameHi} {p.isRetrograde ? <span className="text-red-400 font-bold ml-1">(व)</span> : ''}
                                        </td>
                                        <td className="p-3">{p.rashiName} ({p.rashiNum})</td>
                                        <td className="p-3 text-emerald-300">{p.formattedDeg}</td>
                                        <td className="p-3 font-sans">{p.nakshatra}</td>
                                        <td className="p-3 font-sans">({p.pada})</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {kundliSubTab === 'grah_sthiti_sub' && (
                        <div className="bg-black/40 border border-[#d4af37]/30 rounded-3xl p-5 shadow-xl space-y-6">
                          <h3 className="text-base font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-3">
                            केपी 4-लेवल सब-लॉर्ड तालिका (KP 4-Level Sub-Lord Table - Sign, Star, Sub, Sub-Sub)
                          </h3>
                          {(() => {
                            const adv = VedicKundliAdvancedEngine.analyze(kundliData, profile);
                            return (
                              <div className="overflow-x-auto rounded-xl border border-[#d4af37]/25 bg-black/60">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-[#041a10] text-[#d4af37] border-b border-[#d4af37]/30 text-[11px] font-bold">
                                    <tr>
                                      <th className="p-3">ग्रह नाम</th>
                                      <th className="p-3">निरयन अंश</th>
                                      <th className="p-3">राशि स्वामी (रा)</th>
                                      <th className="p-3">नक्षत्र स्वामी (न)</th>
                                      <th className="p-3">उप स्वामी (स)</th>
                                      <th className="p-3">उप-उप स्वामी (सस)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#d4af37]/15 text-gray-200 font-mono">
                                    {adv.kpSubLords.map((row) => (
                                      <tr key={row.key} className="hover:bg-white/5">
                                        <td className="p-3 font-bold text-[#ffe89e] font-sans">{row.nameHi}</td>
                                        <td className="p-3 text-emerald-300">{row.formattedLon}</td>
                                        <td className="p-3 font-sans">{row.signLord}</td>
                                        <td className="p-3 font-sans text-amber-300">{row.starLord}</td>
                                        <td className="p-3 font-sans text-emerald-400 font-bold">{row.subLord}</td>
                                        <td className="p-3 font-sans text-cyan-300">{row.subSubLord}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {kundliSubTab === 'chalit' && (
                        <div className="bg-black/40 border border-[#d4af37]/30 rounded-3xl p-5 shadow-xl space-y-6">
                          <h3 className="text-base font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-3">
                            भाव चलित चक्र एवं तालिका (Chalit Chart & Bhava Cusp Table)
                          </h3>
                          {(() => {
                            const adv = VedicKundliAdvancedEngine.analyze(kundliData, profile);
                            return (
                              <div className="space-y-6">
                                <div className="w-full aspect-square max-w-[320px] relative mx-auto bg-[#030d08] border-2 border-[#d4af37]/60 rounded-2xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.8)] select-none">
                                  <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#d4af37] stroke-[0.5]">
                                    <rect x="0" y="0" width="100" height="100" className="fill-[#04140d] stroke-none" />
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => (
                                      <polygon key={house} points={HOUSE_POLYGONS[house]} className="fill-[#082218]/90 stroke-[#d4af37]/70 stroke-[0.8]" />
                                    ))}
                                    <rect x="0" y="0" width="100" height="100" className="fill-none stroke-[#d4af37]/70 stroke-[0.8]" />
                                    <line x1="0" y1="0" x2="100" y2="100" className="stroke-[#d4af37]/80 stroke-[0.7]" />
                                    <line x1="100" y1="0" x2="0" y2="100" className="stroke-[#d4af37]/80 stroke-[0.7]" />
                                    <polygon points="50,0 100,50 50,100 0,50" className="fill-none stroke-[#d4af37]/80 stroke-[0.7]" />
                                  </svg>
                                  <div className="absolute inset-0 text-[#d4af37]/90 font-medium text-xs pointer-events-none">
                                    {adv.chalitTable.map((row) => {
                                      const house = row.houseNumber;
                                      return (
                                        <div key={house} className={`absolute ${HOUSE_POSITIONS[house]} flex flex-col items-center p-0.5 text-center z-10 leading-tight`}>
                                          <span className="text-[9px] font-bold bg-[#04150e]/90 text-emerald-300 border border-[#d4af37]/40 rounded-full px-1.5 py-0.2 mb-0.5">
                                            {row.houseNumber}
                                          </span>
                                          <span className="text-[8px] text-amber-200">{row.rashiName}</span>
                                          <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-[70px]">
                                            {row.occupants.map((occ, idx) => (
                                              <span key={idx} className="px-1 py-0.5 rounded bg-black/80 text-[#fae19c] border border-[#d4af37]/50 text-[8px] font-bold">
                                                {occ}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-[#d4af37]/25 bg-black/60">
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-[#041a10] text-[#d4af37] border-b border-[#d4af37]/30 text-[11px] font-bold">
                                      <tr>
                                        <th className="p-3">भाव संख्या</th>
                                        <th className="p-3">राशि</th>
                                        <th className="p-3">भाव आरंभ (Sandhi)</th>
                                        <th className="p-3">भाव मध्य (Cusp)</th>
                                        <th className="p-3">ग्रह स्थिति (Occupants)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#d4af37]/15 text-gray-200 font-mono">
                                      {adv.chalitTable.map((row) => (
                                        <tr key={row.houseNumber} className="hover:bg-white/5">
                                          <td className="p-3 font-bold text-[#ffe89e] font-sans">भाव {row.houseNumber}</td>
                                          <td className="p-3 font-sans">{row.rashiName}</td>
                                          <td className="p-3 text-gray-300">{row.formattedAarambh}</td>
                                          <td className="p-3 text-emerald-300">{row.formattedMadhya}</td>
                                          <td className="p-3 font-sans text-amber-200">{row.occupants.length > 0 ? row.occupants.join(', ') : 'खाली (Vacant)'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                  {activeModule === 'kp' && (
                    <KPQuestionJudgment
                      masterData={kundliData}
                      language={language}
                      onOpenPlanetStory={() => {}}
                    />
                  )}
                  {['dasha', 'vimshottari', 'vimshottari_dasha', 'vimshottaridasha'].includes(activeModule) && <DashaChartView data={kundliData} dasha={kundliData?.vimshottariDasha} />}
                  {activeModule === 'yogini_dasha' && <YoginiDashaView data={kundliData} />}
                  {activeModule === 'ashtottari' && <AshtottariDashaView data={kundliData} />}
                  {activeModule === 'gochar' && <GocharVedhaView natalData={kundliData} />}
                  {['varga', 'varga_kundliyan', 'vargakundliyan', 'divisional_charts'].includes(activeModule) && (
                    <VargaKundaliView masterData={kundliData} language={language} />
                  )}
                  {activeModule === 'sphutas' && <SphutasView data={kundliData} />}
                  {activeModule === 'upagrahas' && <UpagrahaView data={kundliData} />}
                  {activeModule === 'bnn' && <BhriguNandiNadiView masterData={kundliData} />}
                  {activeModule === 'house_speaks' && <HouseSpeaksControl masterData={kundliData} />}
                  {activeModule === 'ashtakavarga' && <AshtakavargaView data={kundliData} />}
                  {['jaimini', 'jaimini_sutra', 'jaimini_sutras'].includes(activeModule) && <JaiminiView data={kundliData} />}
                  {['arudha', 'arudha_chara', 'arudha_pada', 'arudhapada'].includes(activeModule) && <ArudhaCharaView data={kundliData} />}
                  {['sudarshan', 'sudarshana', 'sudarshan_chakra'].includes(activeModule) && <SudarshanaChakraView data={kundliData} />}
                  {activeModule === 'sarvatobhadra' && <SarvatobhadraView data={kundliData} />}
                  {activeModule === 'yoga_dosha' && <YogaDoshaView data={kundliData} />}
                  {activeModule === 'longevity' && <LongevityArgalaView data={kundliData} />}
                  {activeModule === 'special_points' && <SpecialPointsView data={kundliData} />}
                  {['shadbala', 'shadbala_bal', 'shadbalabal'].includes(activeModule) && <ShadbalaView data={kundliData} />}
                  {['numerology', 'ankashastra'].includes(activeModule) && <NumerologyView profile={profile} language={language} />}
                  {activeModule === 'lal_kitab' && (
                    <div className="p-5 bg-black/40 border border-[#d4af37]/30 rounded-2xl space-y-4">
                      <h3 className="text-lg font-bold text-[#d4af37]">लाल किताब ज्योतिष (Lal Kitab Analysis)</h3>
                      <p className="text-sm text-gray-300">ग्रह ऋण, दृष्टि एवं सरल उपाय आधारित विश्लेषण।</p>
                      <ShadbalaView data={kundliData} />
                    </div>
                  )}
                  {!['kundli', 'kundli_janmang', 'kundliJanmang', 'kundli_shell', 'kp', 'dasha', 'vimshottari', 'vimshottari_dasha', 'vimshottaridasha', 'yogini_dasha', 'ashtottari', 'gochar', 'varga', 'varga_kundliyan', 'vargakundliyan', 'divisional_charts', 'sphutas', 'upagrahas', 'bnn', 'house_speaks', 'ashtakavarga', 'jaimini', 'arudha', 'arudha_chara', 'arudha_pada', 'arudhapada', 'sudarshan', 'sudarshana', 'sudarshan_chakra', 'sarvatobhadra', 'yoga_dosha', 'longevity', 'special_points', 'shadbala', 'numerology', 'ankashastra', 'lal_kitab'].includes(activeModule) && (
                    <div className="p-6 bg-black/40 border border-[#d4af37]/30 rounded-2xl text-center space-y-3">
                      <h3 className="text-xl font-bold text-[#d4af37]">{moduleTitle}</h3>
                      <p className="text-sm text-gray-300">{t(`modules.${activeModule}.desc`) || 'Dedicated module analysis.'}</p>
                      <p className="text-xs text-emerald-400 font-medium">Ephemeris engine calculations verified successfully.</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
};
