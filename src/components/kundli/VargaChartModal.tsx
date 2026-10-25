import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, AlertCircle, Volume2, Info, ChevronRight, Sparkles } from 'lucide-react';
import { VargaAnalysisResult, VargaEngine } from '../../services/jyotish/vargaEngine';
import { useTranslation, LanguageCode } from '../../i18n';
import {
  getLocalizedPlanet,
  getLocalizedRashi,
  getLocalizedHouse,
  getPlanetAbbreviation
} from '../../i18n/astrology';
import { SpeechEngine } from '../../services/companion/speechEngine';
import { VargaSpeaksControl } from './VargaSpeaksControl';
import {
  VargaSpeaksService,
  VARGA_RASHI_LORDS,
  RASHI_NAMES_LIST,
  getHouseClassification
} from '../../services/astrology/vargaSpeaksService';
import OrnateCorner from '../ui/OrnateCorner';
import YantraMotif from '../ui/YantraMotif';

export interface VargaDefinition {
  key: string;
  nameHi: string;
  nameEn: string;
  division: number;
  significanceHi: string;
  significanceEn: string;
  isAvailable: boolean;
  signProp?: string;
}

export const SHODASHAVARGA_LIST: VargaDefinition[] = [
  { key: 'D1', nameHi: 'राशि (D1)', nameEn: 'Rashi (D1)', division: 1, significanceHi: 'सम्पूर्ण व्यक्तित्व, देह, आयु व समग्र जीवन', significanceEn: 'Overall Life, Physique & Core Destiny', isAvailable: true, signProp: 'd1Sign' },
  { key: 'D9', nameHi: 'नवांश (D9)', nameEn: 'Navamsha (D9)', division: 9, significanceHi: 'जीवनसाथी, धर्म, भाग्य व आंतरिक बल', significanceEn: 'Spouse, Dharma, Fortune & Inner Strength', isAvailable: true, signProp: 'd9Sign' },
  { key: 'D10', nameHi: 'दशमांश (D10)', nameEn: 'Dasamsha (D10)', division: 10, significanceHi: 'कर्म, पेशा, पद-प्रतिष्ठा व ख्याति', significanceEn: 'Career, Profession & Social Status', isAvailable: true, signProp: 'd10Sign' },
  { key: 'D2', nameHi: 'होरा (D2)', nameEn: 'Hora (D2)', division: 2, significanceHi: 'धन, संपदा व वित्तीय समृद्धि', significanceEn: 'Wealth, Assets & Prosperity', isAvailable: true, signProp: 'd2Sign' },
  { key: 'D3', nameHi: 'द्रेष्काण (D3)', nameEn: 'Drekkana (D3)', division: 3, significanceHi: 'सहोदर, साहस, पराक्रम व ऊर्जा', significanceEn: 'Siblings, Courage & Vitality', isAvailable: true, signProp: 'd3Sign' },
  { key: 'D4', nameHi: 'चतुर्थांश (D4)', nameEn: 'Chaturthamsha (D4)', division: 4, significanceHi: 'भाग्य, अचल संपत्ति, गृह व सुख', significanceEn: 'Fixed Assets, Home & Fortune', isAvailable: true, signProp: 'd4Sign' },
  { key: 'D7', nameHi: 'सप्तांश (D7)', nameEn: 'Saptamsha (D7)', division: 7, significanceHi: 'संतान, संतति व कुल विस्तार', significanceEn: 'Children, Progeny & Lineage', isAvailable: true, signProp: 'd7Sign' },
  { key: 'D12', nameHi: 'द्वादशांश (D12)', nameEn: 'Dwadashamsha (D12)', division: 12, significanceHi: 'माता-पिता, पूर्वज व वंश परंपरा', significanceEn: 'Parents, Ancestors & Heritage', isAvailable: true, signProp: 'd12Sign' },
  { key: 'D30', nameHi: 'त्रिंशांश (D30)', nameEn: 'Trimshamsha (D30)', division: 30, significanceHi: 'अरिष्ट, रोग, बाधाएं व संकट', significanceEn: 'Misfortunes, Evils & Obstacles', isAvailable: true, signProp: 'd30Sign' },
  { key: 'D60', nameHi: 'षष्ट्यंश (D60)', nameEn: 'Shashtiamsha (D60)', division: 60, significanceHi: 'सूक्ष्म प्रारब्ध व संचित कर्म', significanceEn: 'Past Life Karma & Root Destiny', isAvailable: true, signProp: 'd60Sign' },
  { key: 'D16', nameHi: 'षोडशांश (D16)', nameEn: 'Shodashamsha (D16)', division: 16, significanceHi: 'वाहन, भौतिक सुख व यात्राएं', significanceEn: 'Vehicles, Pleasures & Travel', isAvailable: true, signProp: 'd16Sign' },
  { key: 'D20', nameHi: 'विंशांश (D20)', nameEn: 'Vimshamsha (D20)', division: 20, significanceHi: 'उपासना, भक्ति व आध्यात्मिक साधना', significanceEn: 'Spiritual Progress & Worship', isAvailable: true, signProp: 'd20Sign' },
  { key: 'D24', nameHi: 'चतुर्विंशांश (D24)', nameEn: 'Chaturvimshamsha (D24)', division: 24, significanceHi: 'ज्ञान, विद्या, उच्च शिक्षा व सिद्धि', significanceEn: 'Higher Education & Intellect', isAvailable: true, signProp: 'd24Sign' },
  { key: 'D27', nameHi: 'सप्तविंशांश (D27)', nameEn: 'Saptavimshamsha (D27)', division: 27, significanceHi: 'बल, सामर्थ्य व शारीरिक क्षमता', significanceEn: 'Strength & Inherent Capacities', isAvailable: true, signProp: 'd27Sign' },
  { key: 'D40', nameHi: 'खवेदांश (D40)', nameEn: 'Khavedamsha (D40)', division: 40, significanceHi: 'शुभ-अशुभ फल व मातृक पूर्वज', significanceEn: 'Auspicious & Inauspicious Events', isAvailable: true, signProp: 'd40Sign' },
  { key: 'D45', nameHi: 'अक्षवेदांश (D45)', nameEn: 'Akshavedamsha (D45)', division: 45, significanceHi: 'सर्वतोमुख चरित्र व आध्यात्मिक गुण', significanceEn: 'General Indications & Character', isAvailable: true, signProp: 'd45Sign' }
];

const HOUSE_POLYGONS: Record<number, string> = {
  1: "50,0 75,25 50,50 25,25",
  2: "0,0 50,0 25,25",
  3: "0,0 25,25 0,50",
  4: "0,50 25,25 50,50 25,75",
  5: "0,50 25,75 0,100",
  6: "0,100 50,100 25,75",
  7: "50,100 25,75 50,50 75,75",
  8: "50,100 100,100 75,75",
  9: "100,100 100,50 75,75",
  10: "100,50 75,75 50,50 75,25",
  11: "100,50 100,0 75,25",
  12: "100,0 50,0 75,25"
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

function getVargaHouseInsetPoints(house: number, scale = 0.88): string {
  const polyStr = HOUSE_POLYGONS[house];
  if (!polyStr) return '';
  const centroid = HOUSE_CENTROIDS[house] || { x: 50, y: 50 };
  return polyStr
    .split(' ')
    .map(pair => {
      const [xStr, yStr] = pair.split(',');
      const x = parseFloat(xStr);
      const y = parseFloat(yStr);
      const ix = centroid.x + (x - centroid.x) * scale;
      const iy = centroid.y + (y - centroid.y) * scale;
      return `${ix.toFixed(2)},${iy.toFixed(2)}`;
    })
    .join(' ');
}

const ALL_NAVAGRAHAS = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
];

interface VargaChartModalProps {
  initialVarga?: string;
  vargaResult: VargaAnalysisResult | null;
  masterData: any;
  onClose: () => void;
}

export const VargaChartModal: React.FC<VargaChartModalProps> = ({
  initialVarga = 'D9',
  vargaResult,
  masterData,
  onClose
}) => {
  const [activeVarga, setActiveVarga] = useState<string>(initialVarga);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [showDiscoveryHint, setShowDiscoveryHint] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('jeevandarpan_bhava_hint_dismissed');
    } catch {
      return true;
    }
  });

  const dismissDiscoveryHint = useCallback(() => {
    setShowDiscoveryHint(false);
    try {
      sessionStorage.setItem('jeevandarpan_bhava_hint_dismissed', 'true');
    } catch {}
  }, []);

  // Auto-dismiss discovery hint after ~3 seconds
  useEffect(() => {
    if (!showDiscoveryHint) return;
    const timer = setTimeout(() => {
      dismissDiscoveryHint();
    }, 3200);
    return () => clearTimeout(timer);
  }, [showDiscoveryHint, dismissDiscoveryHint]);

  const { t, language } = useTranslation();
  const isHindi = language === 'hi' || (language as string) === 'Hindi' || language === 'sa';

  const vargaDef = SHODASHAVARGA_LIST.find(v => v.key === activeVarga) || SHODASHAVARGA_LIST[0];
  const isAvailable = vargaDef.isAvailable && vargaResult && vargaResult.status === 'AVAILABLE';

  // Stop speech when modal closes
  const handleModalClose = useCallback(() => {
    SpeechEngine.stop();
    onClose();
  }, [onClose]);

  // Clean state when changing active Varga
  const handleSelectVarga = useCallback((vKey: string) => {
    SpeechEngine.stop();
    setSelectedPlanet(null);
    setSelectedHouse(null);
    setActiveVarga(vKey);
  }, []);

  // Planet selection handler
  const handleSelectPlanet = useCallback((pName: string) => {
    SpeechEngine.stop();
    if (showDiscoveryHint) dismissDiscoveryHint();
    setSelectedHouse(null);
    setSelectedPlanet(pName);
  }, [showDiscoveryHint, dismissDiscoveryHint]);

  // House selection handler
  const handleSelectHouse = useCallback((houseNum: number) => {
    SpeechEngine.stop();
    if (showDiscoveryHint) dismissDiscoveryHint();
    setSelectedPlanet(null);
    setSelectedHouse(houseNum);
  }, [showDiscoveryHint, dismissDiscoveryHint]);

  // Calculate houses and planet distribution for active Varga using existing calculated data or masterData fallback
  const chartData = useMemo(() => {
    // 1. Ascendant sign for active Varga
    let ascendantSign: number | null | undefined = vargaResult?.ascendantVargas?.[activeVarga];

    // Fallback: Compute ascendant on-the-fly from masterData
    if ((ascendantSign == null || ascendantSign < 1) && masterData) {
      const lagnaLong = masterData.lagna?.siderealLongitude ?? (masterData.lagna?.rashi != null ? (masterData.lagna.rashi - 1) * 30 + (masterData.lagna.degree || 0) : null);
      if (lagnaLong != null) {
        ascendantSign = VargaEngine.getVargaSign(activeVarga, lagnaLong);
      }
    }

    if (ascendantSign == null || ascendantSign < 1 || ascendantSign > 12) {
      return null;
    }

    if (!vargaResult) return null;
    const signPropKey = (vargaDef.signProp || `${activeVarga.toLowerCase()}Sign`) as keyof (typeof vargaResult.planets)[0];

    // Build house signs: House 1 = ascendantSign, House 2 = ascendantSign + 1, etc.
    const houseRashis: Record<number, number> = {};
    for (let h = 1; h <= 12; h++) {
      houseRashis[h] = ((ascendantSign - 1 + (h - 1)) % 12) + 1;
    }

    // Map planets to houses
    const housePlanets: Record<number, string[]> = {};
    for (let h = 1; h <= 12; h++) {
      housePlanets[h] = [];
    }

    const planetList: { planet: string; sign: number; house: number }[] = [];
    const planetMap: Record<string, { planet: string; sign: number; house: number }> = {};

    const validPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    for (const pName of validPlanets) {
      let pSign: number | null = null;
      // Try from vargaResult.planets first
      const vp = vargaResult?.planets?.find(p => p.planet === pName);
      if (vp && signPropKey && vp[signPropKey] != null) {
        pSign = Number(vp[signPropKey]);
      }
      // Fallback: Compute on-the-fly from masterData
      if ((pSign == null || pSign < 1) && masterData?.planets?.[pName]) {
        const pd = masterData.planets[pName];
        const pLong = pd.siderealLongitude ?? (pd.rashi != null ? (pd.rashi - 1) * 30 + (pd.degree || 0) : null);
        if (pLong != null) {
          pSign = VargaEngine.getVargaSign(activeVarga, pLong);
        }
      }

      if (pSign != null && pSign >= 1 && pSign <= 12) {
        const pHouse = ((pSign - ascendantSign + 12) % 12) + 1;
        housePlanets[pHouse].push(pName);
        const item = {
          planet: pName,
          sign: pSign,
          house: pHouse
        };
        planetList.push(item);
        planetMap[pName] = item;
      }
    }

    return {
      ascendantSign,
      houseRashis,
      housePlanets,
      planetList,
      planetMap
    };
  }, [vargaResult, activeVarga, vargaDef, masterData]);

  // Scripts for selected planet and house
  const selectedPlanetScript = useMemo(() => {
    if (!selectedPlanet || !chartData || !chartData.planetMap[selectedPlanet]) {
      return null;
    }
    const info = chartData.planetMap[selectedPlanet];
    return VargaSpeaksService.generatePlanetScript(
      selectedPlanet,
      activeVarga,
      vargaDef.nameHi,
      vargaDef.nameEn,
      info.house,
      info.sign,
      masterData,
      language as LanguageCode
    );
  }, [selectedPlanet, chartData, activeVarga, vargaDef, masterData, language]);

  const selectedHouseScript = useMemo(() => {
    if (selectedHouse == null || !chartData) {
      return null;
    }
    const rashiNum = chartData.houseRashis[selectedHouse];
    const occupants = chartData.housePlanets[selectedHouse] || [];
    return VargaSpeaksService.generateHouseScript(
      selectedHouse,
      activeVarga,
      vargaDef.nameHi,
      vargaDef.nameEn,
      rashiNum,
      occupants,
      language as LanguageCode
    );
  }, [selectedHouse, chartData, activeVarga, vargaDef, language]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm" onClick={handleModalClose}>
      <div 
        className="bg-gradient-to-br from-[#061e14] via-[#030d08] to-[#020a06] border border-[#d4af37]/50 p-3 sm:p-6 rounded-2xl sm:rounded-3xl w-full max-w-xl shadow-[0_16px_50px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,232,158,0.2)] relative flex flex-col max-h-[94vh] text-white min-w-0 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Royal Temple Carved Corner Flourishes */}
        <OrnateCorner position="top-left" size={28} />
        <OrnateCorner position="top-right" size={28} />
        <OrnateCorner position="bottom-left" size={28} />
        <OrnateCorner position="bottom-right" size={28} />

        {/* Subtle Inner Stepped Temple Trim Line */}
        <div className="absolute inset-1.5 sm:inset-2 rounded-xl sm:rounded-2xl border border-[#d4af37]/15 pointer-events-none" aria-hidden="true" />

        {/* Header */}
        <div className="flex justify-between items-start mb-3 border-b border-[#d4af37]/25 pb-3 gap-2 min-w-0 relative z-10">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-[#d4af37] truncate sm:whitespace-normal">
                {isHindi ? vargaDef.nameHi : vargaDef.nameEn}
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border shrink-0 ${
                chartData 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50' 
                  : 'bg-amber-950/80 text-amber-300 border-amber-600/50'
              }`}>
                {chartData ? (isHindi ? 'गणना उपलब्ध' : 'CALCULATED') : (isHindi ? 'गणना उपलब्ध नहीं' : 'UNAVAILABLE')}
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5 line-clamp-2 sm:line-clamp-none">
              {isHindi ? vargaDef.significanceHi : vargaDef.significanceEn}
            </p>
          </div>
          <button 
            onClick={handleModalClose} 
            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title={t('common.close') || 'Close'}
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shodashavarga Switcher Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 border-b border-[#d4af37]/15 custom-scrollbar shrink-0">
          {SHODASHAVARGA_LIST.map(v => {
            const isActive = v.key === activeVarga;
            return (
              <button
                key={v.key}
                onClick={() => handleSelectVarga(v.key)}
                className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-[#d4af37] text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                    : v.isAvailable
                    ? 'bg-[#04120c] border border-[#d4af37]/35 text-gray-300 hover:bg-[#d4af37]/20 hover:text-[#d4af37]'
                    : 'bg-black/40 border border-gray-800 text-gray-500 hover:text-gray-400'
                }`}
                title={`${v.nameEn} (${v.isAvailable ? 'Available' : 'Unavailable'})`}
              >
                <span>{v.key}</span>
                {!v.isAvailable && <span className="text-[9px] opacity-60">∅</span>}
              </button>
            );
          })}
        </div>

        {/* Chart Content Body */}
        <div className="overflow-y-auto pr-1 custom-scrollbar space-y-4 flex-1">
          {chartData ? (
            <div>
              {/* Ascendant Banner & Interaction Hint */}
              <div className="flex justify-between items-center bg-black/40 border border-[#d4af37]/25 rounded-xl px-3 py-2 mb-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">
                    {isHindi ? 'वर्ग लग्न (Ascendant):' : 'Varga Ascendant:'}
                  </span>
                  <span className="text-[#d4af37] font-bold text-xs sm:text-sm">
                    {getLocalizedRashi(RASHI_NAMES_LIST[chartData.ascendantSign - 1], language)} ({chartData.ascendantSign})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 text-[10px] flex items-center gap-1 justify-end font-medium">
                    <Volume2 className="w-3.5 h-3.5" />
                    {isHindi ? 'ग्रह या भाव छुएँ (Touch to Speak)' : 'Touch Planet or House to Speak'}
                  </span>
                </div>
              </div>

              {/* First-Time Discovery Hint (Session Dismissible) */}
              {showDiscoveryHint && (
                <div 
                  id="varga-discovery-hint"
                  className="relative mb-2.5 w-full max-w-[min(320px,calc(100vw-48px))] mx-auto bg-gradient-to-r from-[#082218] via-[#0f3f2c] to-[#082218] border border-[#d4af37]/70 rounded-xl px-3 py-2 text-xs flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_12px_rgba(212,175,55,0.3)] animate-pulse transition-opacity duration-500"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none animate-bounce">✨</span>
                    <span className="text-[#fae19c] font-semibold text-[11px] sm:text-xs tracking-wide">
                      {isHindi ? '✨ किसी भी भाव को स्पर्श करें — भाव वाणी सुनें' : '✨ Touch any house — Listen to Bhava Speaks'}
                    </span>
                  </div>
                  <button
                    onClick={dismissDiscoveryHint}
                    className="text-gray-300 hover:text-white p-1 ml-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
                    title={isHindi ? 'हटाएँ' : 'Dismiss'}
                    aria-label="Dismiss discovery hint"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Dynamic Visual Hierarchy Legend */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-2.5 text-[10px] sm:text-[11px] font-medium select-none">
                <span 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all duration-300 shadow-sm ${
                    selectedHouse != null
                      ? 'bg-[#0f3f2c] border-[#fae19c] text-[#ffe89e] shadow-[0_0_10px_rgba(250,225,156,0.4)] scale-105'
                      : 'bg-black/60 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  <span className="text-xs">🏛️</span>
                  <span className="font-semibold">
                    {selectedHouse != null 
                      ? `${isHindi ? 'भाव' : 'House'} ${selectedHouse} ${isHindi ? 'सक्रिय' : 'Active'}` 
                      : (isHindi ? 'भाव = भाव वाणी' : 'House = House Speaks')}
                  </span>
                </span>

                <span 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all duration-300 shadow-sm ${
                    selectedPlanet != null
                      ? 'bg-[#3b2a05] border-[#ffe89e] text-[#ffe89e] shadow-[0_0_10px_rgba(250,225,156,0.5)] scale-105'
                      : 'bg-black/60 border-[#d4af37]/40 text-[#fae19c]'
                  }`}
                >
                  <span className="text-xs">🪐</span>
                  <span className="font-semibold">
                    {selectedPlanet != null 
                      ? `${getLocalizedPlanet(selectedPlanet, language)} ${isHindi ? 'सक्रिय' : 'Active'}` 
                      : (isHindi ? 'ग्रह = ग्रह वाणी' : 'Planet = Planet Speaks')}
                  </span>
                </span>

                <span className="flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-full border border-gray-700/60 text-gray-300 shadow-sm">
                  <span className="text-xs text-amber-300">✨</span>
                  <span>{isHindi ? 'स्पर्श करें = विवरण' : 'Tap = Details'}</span>
                </span>
              </div>

              {/* North Indian Interactive SVG Chart with 3D tactile depth */}
              <div className="w-full aspect-square max-w-[min(320px,calc(100vw-48px))] relative mb-3 mx-auto bg-[#030d08] border border-[#d4af37]/50 rounded-2xl p-2 shadow-[0_6px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.2)] select-none">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#d4af37] stroke-[0.5] pointer-events-auto">
                  <defs>
                    {/* Soft Emerald Depth: Centroid-aligned radial gradients */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                      <radialGradient 
                        key={`varga-ambient-grad-${h}`}
                        id={`vargaBhavaAmbientGrad-${h}`} 
                        cx={`${HOUSE_CENTROIDS[h].x}%`} 
                        cy={`${HOUSE_CENTROIDS[h].y}%`} 
                        r="36%"
                      >
                        <stop offset="0%" stopColor="#0f4430" stopOpacity="0.85" />
                        <stop offset="60%" stopColor="#072b1d" stopOpacity="0.92" />
                        <stop offset="100%" stopColor="#03160e" stopOpacity="0.98" />
                      </radialGradient>
                    ))}

                    {/* Stronger Gold/Emerald Radiance for Selected Bhava */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                      <radialGradient 
                        key={`varga-selected-grad-${h}`}
                        id={`vargaBhavaSelectedGrad-${h}`} 
                        cx={`${HOUSE_CENTROIDS[h].x}%`} 
                        cy={`${HOUSE_CENTROIDS[h].y}%`} 
                        r="40%"
                      >
                        <stop offset="0%" stopColor="#ffe89e" stopOpacity="0.75" />
                        <stop offset="42%" stopColor="#d4af37" stopOpacity="0.55" />
                        <stop offset="85%" stopColor="#0c432d" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#041a10" stopOpacity="0.98" />
                      </radialGradient>
                    ))}

                    {/* Subtle 3D Tactile Elevation Shadow for Non-Selected Bhavas */}
                    <filter id="vargaBhavaTactileElevation" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0.6" stdDeviation="0.6" floodColor="#000000" floodOpacity="0.75" />
                    </filter>

                    {/* 3D Elevated Shadow and Strong Golden Glow for Selected Bhava */}
                    <filter id="vargaBhavaSelectedGlow" x="-35%" y="-35%" width="170%" height="170%">
                      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.95" />
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="blur" />
                      <feComponentTransfer in="blur" result="glow">
                        <feFuncA type="linear" slope="1" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <rect x="0" y="0" width="100" height="100" className="fill-[#04140d] stroke-none" />
                  
                  {/* Clickable House Polygons with 3D tactile feedback and metallic-gold inner rim */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
                    const isSelected = selectedHouse === house;
                    return (
                      <g key={house}>
                        {/* Base Facet Polygon with soft emerald depth & tactile elevation */}
                        <polygon 
                          id={`varga-bhava-facet-${house}`}
                          points={HOUSE_POLYGONS[house]} 
                          filter={isSelected ? "url(#vargaBhavaSelectedGlow)" : "url(#vargaBhavaTactileElevation)"}
                          fill={isSelected ? `url(#vargaBhavaSelectedGrad-${house})` : `url(#vargaBhavaAmbientGrad-${house})`}
                          className={`cursor-pointer transition-all duration-300 ease-out ${
                            isSelected 
                              ? 'stroke-[#ffe89e] stroke-[1.8] opacity-100' 
                              : 'stroke-[#d4af37]/65 hover:stroke-[#fae19c] hover:stroke-[1.3] active:stroke-[#ffe89e] stroke-[0.8] opacity-90 hover:opacity-100'
                          }`}
                          onClick={() => handleSelectHouse(house)}
                          onTouchEnd={() => handleSelectHouse(house)}
                        >
                          <title>{`${getLocalizedHouse(house, language).full} (${getLocalizedRashi(RASHI_NAMES_LIST[chartData.houseRashis[house] - 1], language)})`}</title>
                        </polygon>

                        {/* Thin Metallic-Gold Inner Rim */}
                        <polygon
                          id={`varga-bhava-inner-rim-${house}`}
                          points={getVargaHouseInsetPoints(house, 0.88)}
                          className={`pointer-events-none fill-none transition-all duration-300 ${
                            isSelected
                              ? 'stroke-[#ffe89e] stroke-[0.8] opacity-90'
                              : 'stroke-[#d4af37] stroke-[0.45] opacity-40 hover:opacity-75'
                          }`}
                        />
                      </g>
                    );
                  })}

                  {/* Standard Crisp Lines with Rich Golden Stroke */}
                  <rect x="0" y="0" width="100" height="100" className="fill-none pointer-events-none stroke-[#d4af37]/60 stroke-[0.8]" />
                  <line x1="0" y1="0" x2="100" y2="100" className="pointer-events-none stroke-[#d4af37]/80 stroke-[0.7]" />
                  <line x1="100" y1="0" x2="0" y2="100" className="pointer-events-none stroke-[#d4af37]/80 stroke-[0.7]" />
                  <polygon points="50,0 100,50 50,100 0,50" className="fill-none pointer-events-none stroke-[#d4af37]/80 stroke-[0.7]" />

                  {/* Sacred Central Vedic Yantra Motif */}
                  <YantraMotif cx={50} cy={50} radius={16} opacity={0.25} />

                  {/* Discovery Guided Soft Golden Ripple Pulses on Bhava 1 (Lagna) */}
                  {showDiscoveryHint && (
                    <g className="pointer-events-none">
                      <circle
                        cx={HOUSE_CENTROIDS[1].x}
                        cy={HOUSE_CENTROIDS[1].y}
                        r="5"
                        className="fill-[#fae19c]/40 animate-ping"
                        style={{ animationDuration: '1.8s' }}
                      />
                      <circle
                        cx={HOUSE_CENTROIDS[1].x}
                        cy={HOUSE_CENTROIDS[1].y}
                        r="12"
                        className="fill-none stroke-[#ffe89e] stroke-[0.8] opacity-80 animate-pulse"
                      />
                      <circle
                        cx={HOUSE_CENTROIDS[1].x}
                        cy={HOUSE_CENTROIDS[1].y}
                        r="18"
                        className="fill-none stroke-[#d4af37]/60 stroke-[0.5] opacity-50 animate-ping"
                        style={{ animationDuration: '2.5s' }}
                      />
                    </g>
                  )}

                  {/* 3D Elevated Selection Soft Ripple Effect */}
                  {selectedHouse && HOUSE_CENTROIDS[selectedHouse] && (
                    <g className="pointer-events-none">
                      <circle
                        cx={HOUSE_CENTROIDS[selectedHouse].x}
                        cy={HOUSE_CENTROIDS[selectedHouse].y}
                        r="5"
                        className="fill-[#fae19c]/40 animate-ping"
                      />
                      <circle
                        cx={HOUSE_CENTROIDS[selectedHouse].x}
                        cy={HOUSE_CENTROIDS[selectedHouse].y}
                        r="11"
                        className="fill-none stroke-[#fae19c] stroke-[0.8] opacity-80 animate-pulse"
                      />
                      <circle
                        cx={HOUSE_CENTROIDS[selectedHouse].x}
                        cy={HOUSE_CENTROIDS[selectedHouse].y}
                        r="18"
                        className="fill-none stroke-[#d4af37]/50 stroke-[0.5] opacity-50"
                      />
                    </g>
                  )}
                </svg>

                {/* House Content (Signs, Clickable Occupying Planets, and Empty House Speaker Buttons) */}
                <div className="absolute inset-0 text-[#d4af37]/90 font-medium text-xs pointer-events-none">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
                    const rashiNum = chartData.houseRashis[house];
                    const isLagna = house === 1;
                    const occupants = chartData.housePlanets[house] || [];
                    const isHouseSelected = selectedHouse === house;

                    // Layout orientation based on triangle geometry to prevent diagonal/border collision
                    const isHorizontal = house === 2 || house === 12 || house === 6 || house === 8;
                    const isVertical = house === 3 || house === 11 || house === 5 || house === 9;

                    return (
                      <div 
                        key={house} 
                        className={`absolute ${HOUSE_POSITIONS[house]} flex flex-col items-center p-0.5 text-center z-10 leading-tight pointer-events-none transition-all duration-200 ${
                          isHorizontal ? 'max-w-[86px]' : isVertical ? 'max-w-[46px]' : 'max-w-[80px]'
                        } ${
                          isHouseSelected ? 'scale-105 z-30 drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]' : 'hover:scale-[1.02]'
                        }`}
                      >
                        {/* Rashi indicator with 44px+ touch hit area */}
                        <div className="relative flex items-center justify-center mb-0.5 pointer-events-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectHouse(house);
                            }}
                            className={`group relative cursor-pointer transition-all duration-200 text-[9px] font-bold rounded-full px-2 py-0.5 select-none flex items-center justify-center gap-1 shadow-md ${
                              isHouseSelected
                                ? 'bg-gradient-to-r from-[#ffe89e] via-[#d4af37] to-[#b3861d] text-black font-extrabold ring-2 ring-[#fae19c] shadow-[0_0_12px_rgba(250,225,156,0.9)] scale-105'
                                : 'bg-[#04150e]/95 text-emerald-300 border border-[#d4af37]/50 hover:border-[#fae19c] hover:bg-[#0c3523] hover:scale-105 active:scale-95'
                            }`}
                            title={`${getLocalizedHouse(house, language).full} (${isHindi ? 'भाव वाणी' : 'House Speaks'})`}
                            aria-label={`House ${house} ${isHindi ? 'भाव वाणी' : 'House Speaks'}`}
                          >
                            <span className="absolute -inset-2 pointer-events-auto" style={{ minWidth: '44px', minHeight: '44px' }} aria-hidden="true" />
                            <span className="text-[8px] opacity-80 relative z-10">🏛️</span>
                            <span className="relative z-10">{rashiNum}</span>
                          </button>
                        </div>
                        
                        {isLagna && (
                          <span className="text-emerald-400 text-[9px] -mt-0.5 mb-0.5 font-bold tracking-wider select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {isHindi ? 'ल / Asc' : 'Asc'}
                          </span>
                        )}

                        {/* Collision-Safe Planet Badges Flow & Empty House Indicator */}
                        <div className={`${
                          isHorizontal 
                            ? 'flex flex-row flex-wrap justify-center items-center gap-1 max-w-[84px]' 
                            : isVertical 
                              ? 'flex flex-col items-center gap-1 max-w-[44px]' 
                              : 'flex flex-wrap justify-center items-center gap-1 max-w-[78px]'
                        } text-[10px] leading-tight`}>
                          {occupants.map(pName => {
                            const pMaster = masterData?.planets?.[pName];
                            const isRetro = pMaster?.isRetrograde;
                            const abbr = getPlanetAbbreviation(pName, language);
                            const isPlanetSelected = selectedPlanet === pName;
                            const isCrowded = occupants.length >= 3;
                            const isMulti = occupants.length >= 2;

                            return (
                              <div key={pName} className="relative flex items-center justify-center pointer-events-auto">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectPlanet(pName);
                                  }}
                                  className={`group relative cursor-pointer transition-all duration-200 flex items-center justify-center select-none rounded-md ${
                                    isCrowded 
                                      ? 'px-1 py-0.5 gap-0.5 text-[8.5px]' 
                                      : isMulti 
                                        ? 'px-1.5 py-0.5 gap-0.5 text-[9px]' 
                                        : 'px-2 py-0.5 gap-1 text-[10px]'
                                  } font-bold ${
                                    isPlanetSelected
                                      ? 'bg-gradient-to-b from-[#ffe89e] via-[#d4af37] to-[#aa831b] text-black font-extrabold shadow-[0_4px_14px_rgba(0,0,0,0.9),0_0_12px_rgba(212,175,55,0.95)] scale-110 border border-white/80 ring-2 ring-[#fae19c] z-30'
                                      : 'bg-gradient-to-b from-[#181a13] to-[#0c1209] text-[#fae19c] border border-[#d4af37]/65 shadow-[0_2px_6px_rgba(0,0,0,0.7)] hover:border-[#fae19c] hover:bg-[#d4af37]/25 hover:scale-105 active:scale-95'
                                  }`}
                                  title={`${getLocalizedPlanet(pName, language)} (${isHindi ? 'छूने पर वाणी सुनें' : 'Tap for Planet Speaks'})`}
                                  aria-label={`Planet ${pName} ${isHindi ? 'ग्रह वाणी' : 'Planet Speaks'}`}
                                >
                                  {/* Touch target hit area ensuring >= 44x44px for finger taps */}
                                  <span className="absolute -inset-2 pointer-events-auto" style={{ minWidth: '44px', minHeight: '44px' }} aria-hidden="true" />
                                  <span className="text-[7.5px] opacity-80 relative z-10">🪐</span>
                                  <span className="font-black relative z-10 whitespace-nowrap">{abbr}{isRetro ? '*' : ''}</span>
                                </button>
                              </div>
                            );
                          })}

                          {/* Empty House Interactive Speaker Trigger with 3D Tactile Feedback */}
                          {occupants.length === 0 && (
                            <div className="relative flex items-center justify-center pointer-events-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectHouse(house);
                                }}
                                className={`group relative cursor-pointer p-2 rounded-full transition-all duration-200 flex items-center justify-center select-none ${
                                  isHouseSelected
                                    ? 'bg-gradient-to-br from-[#fae19c] via-[#d4af37] to-[#aa831b] text-black shadow-[0_0_14px_rgba(212,175,55,0.95)] scale-110 ring-2 ring-[#fae19c]'
                                    : 'bg-[#041a11]/95 border border-emerald-500/40 text-emerald-400 hover:text-[#fae19c] hover:border-[#d4af37] hover:bg-[#0c3523] hover:scale-105 active:scale-95 shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
                                }`}
                                title={`${getLocalizedHouse(house, language).full} (${isHindi ? 'रिक्त भाव - वाणी सुनें' : 'Empty House - Speaks'})`}
                                aria-label={`Empty House ${house} ${isHindi ? 'भाव वाणी' : 'House Speaks'}`}
                              >
                                <span className="absolute -inset-2 pointer-events-auto" style={{ minWidth: '44px', minHeight: '44px' }} aria-hidden="true" />
                                <span className="absolute inset-0 rounded-full border border-emerald-400/50 animate-ping pointer-events-none opacity-40" />
                                <Volume2 className="w-3.5 h-3.5 relative z-10 animate-pulse" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile First: Universal Navagraha Bar (Tap any planet to speak) */}
              <div className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-2.5 space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[11px] font-bold text-[#d4af37] flex items-center gap-1.5 uppercase tracking-wide">
                    <Volume2 className="w-3.5 h-3.5 text-[#d4af37]" />
                    {isHindi ? 'नवग्रह वाणी (Tap any Planet)' : 'Navagraha Speaks (Tap any Planet)'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {isHindi ? 'सीधे छूकर सुनें' : 'Touch to listen'}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {ALL_NAVAGRAHAS.map(pName => {
                    const info = chartData.planetMap[pName];
                    const isSel = selectedPlanet === pName;
                    if (!info) return null;

                    return (
                      <button
                        key={pName}
                        onClick={() => handleSelectPlanet(pName)}
                        className={`min-h-[44px] px-2 py-1.5 rounded-xl border text-xs transition-all flex flex-col justify-center items-center cursor-pointer ${
                          isSel
                            ? 'bg-[#d4af37] text-black border-[#d4af37] font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-[1.02]'
                            : 'bg-[#04120c] text-gray-200 border-[#d4af37]/20 hover:border-[#d4af37] hover:bg-[#d4af37]/15 active:scale-95'
                        }`}
                        aria-label={`Select ${pName}`}
                      >
                        <span className="font-semibold text-[11px] truncate">{getLocalizedPlanet(pName, language)}</span>
                        <span className="text-[9px] opacity-75 font-mono">
                          {isHindi ? `भाव ${info.house}` : `H${info.house}`} • {getLocalizedRashi(RASHI_NAMES_LIST[info.sign - 1], language)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 12 Bhavas Quick Touch Grid */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[11px] font-bold text-[#d4af37] flex items-center gap-1.5 uppercase tracking-wide">
                    <Info className="w-3.5 h-3.5 text-[#d4af37]" />
                    {isHindi ? '१२ भाव विवरण (12 Bhavas)' : '12 Bhavas Information'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {isHindi ? 'भाव छूकर वाणी सुनें' : 'Tap house for speech'}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => {
                    const isSel = selectedHouse === h;
                    const rNum = chartData.houseRashis[h];
                    const occ = chartData.housePlanets[h] || [];
                    const isEmpty = occ.length === 0;

                    return (
                      <button
                        key={h}
                        onClick={() => handleSelectHouse(h)}
                        className={`min-h-[44px] p-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isSel
                            ? 'bg-[#d4af37] text-black font-bold border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                            : 'bg-black/50 text-gray-300 border-white/10 hover:border-[#d4af37]/50 active:scale-95'
                        }`}
                        aria-label={`Select house ${h}`}
                      >
                        <span className="text-[11px] font-bold">
                          {isHindi ? `भाव ${h}` : `H${h}`}
                        </span>
                        <span className="text-[9px] opacity-75">
                          {isEmpty ? (isHindi ? 'रिक्त' : 'Empty') : `${occ.length} ${isHindi ? 'ग्रह' : 'pl'}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Planet Placements Breakdown Table with Click Handlers */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider block border-b border-[#d4af37]/20 pb-1">
                  {isHindi ? 'ग्रहों की वर्ग स्थिति (विस्तृत विवरण के लिए ग्रह पर टैप करें)' : 'Planetary Positions in Varga (Tap to inspect & listen)'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {chartData.planetList.map(item => {
                    const isSel = selectedPlanet === item.planet;
                    return (
                      <button 
                        key={item.planet} 
                        onClick={() => handleSelectPlanet(item.planet)}
                        className={`min-h-[44px] border rounded-xl p-2 flex flex-col text-center transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#d4af37] text-black border-[#d4af37] font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-[1.02]'
                            : 'bg-black/40 border-white/10 hover:border-[#d4af37] hover:bg-[#d4af37]/10 active:scale-95'
                        }`}
                      >
                        <span className={isSel ? 'text-black font-extrabold' : 'text-[#d4af37] font-bold'}>
                          {getLocalizedPlanet(item.planet, language)}
                        </span>
                        <span className={isSel ? 'text-black/80 text-[10px]' : 'text-gray-300 text-[10px]'}>
                          {getLocalizedRashi(RASHI_NAMES_LIST[item.sign - 1], language)}
                        </span>
                        <span className={isSel ? 'text-black/70 text-[9px]' : 'text-gray-500 text-[9px]'}>
                          {isHindi ? `भाव ${item.house}` : `House ${item.house}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Proper Unavailable State - Zero Fake Data */
            <div className="bg-black/50 border border-amber-500/40 rounded-xl p-6 text-center space-y-3 my-4">
              <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-amber-300 font-bold text-base">
                  {isHindi ? 'गणना उपलब्ध नहीं' : 'Calculation Unavailable'}
                </h3>
                <p className="text-gray-300 text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
                  {isHindi
                    ? `वर्तमान गणितीय इंजन में ${vargaDef.nameHi} की गणना उपलब्ध नहीं है। प्रामाणिक खगोल विज्ञान नियमों के अनुसार कोई भी अनुमानित या काल्पनिक मान प्रदर्शित नहीं किया जाता है।`
                    : `Calculation for ${vargaDef.nameEn} is not implemented in the current astronomical engine. Per Vedic integrity standards, no simulated or fabricated data is displayed.`}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-[11px] text-gray-400 mb-2">
                  {isHindi ? 'उपलब्ध वर्ग कुंडलियाँ:' : 'Available Varga Charts:'}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {SHODASHAVARGA_LIST.filter(v => v.isAvailable).map(v => (
                    <button
                      key={v.key}
                      onClick={() => handleSelectVarga(v.key)}
                      className="px-3 py-1.5 min-h-[44px] rounded-lg text-xs bg-[#0a2016] border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-colors cursor-pointer"
                    >
                      {v.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PLANET INFORMATION PANEL (Opens on Planet Touch)                          */}
        {/* ========================================================================= */}
        {selectedPlanet && selectedPlanetScript && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              SpeechEngine.stop();
              setSelectedPlanet(null);
            }}
          >
            <div 
              className="bg-[#082218] border border-[#d4af37]/60 p-4 sm:p-5 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] text-white"
              onClick={e => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div className="flex justify-between items-start mb-3 border-b border-[#d4af37]/25 pb-3 gap-2">
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#d4af37] truncate">
                      {getLocalizedPlanet(selectedPlanet, language)}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shrink-0">
                      {activeVarga}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5 truncate">
                    {isHindi ? `${vargaDef.nameHi} ग्रह विश्लेषण` : `${vargaDef.nameEn} Planetary Analysis`}
                  </p>
                </div>

                {/* Speaker Control & Close */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <VargaSpeaksControl 
                    profile="planet"
                    spokenText={selectedPlanetScript.spokenText}
                    title={`${isHindi ? 'वाणी सुनें' : 'Listen'}: ${getLocalizedPlanet(selectedPlanet, language)}`}
                    autoPlay={true}
                  />
                  <button 
                    onClick={() => {
                      SpeechEngine.stop();
                      setSelectedPlanet(null);
                    }}
                    className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors text-base cursor-pointer"
                    title={t('common.close') || 'Close'}
                    aria-label="Close Planet Panel"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 9-Navagraha Switcher inside panel */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 border-b border-white/10 custom-scrollbar shrink-0">
                {ALL_NAVAGRAHAS.map(p => {
                  const isCurrent = p === selectedPlanet;
                  return (
                    <button
                      key={p}
                      onClick={() => handleSelectPlanet(p)}
                      className={`px-2.5 py-1 min-h-[36px] rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-[#d4af37] text-black font-bold shadow-md' 
                          : 'bg-black/40 text-gray-300 hover:text-[#d4af37] border border-white/10'
                      }`}
                    >
                      {getLocalizedPlanet(p, language)}
                    </button>
                  );
                })}
              </div>

              {/* Facts & Spoken Script Content */}
              <div className="overflow-y-auto pr-1 custom-scrollbar space-y-3.5 text-xs flex-1">
                {/* Calculated Placement Facts Grid */}
                <div className="grid grid-cols-2 gap-2 bg-black/40 border border-[#d4af37]/20 rounded-xl p-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'वर्ग चक्र' : 'Divisional Chart'}
                    </span>
                    <span className="text-[#d4af37] font-bold text-xs">{selectedPlanetScript.facts.varga}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'भाव स्थिति' : 'House'}
                    </span>
                    <span className="text-white font-bold text-xs">{selectedPlanetScript.facts.house}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'वर्ग राशि' : 'Varga Sign'}
                    </span>
                    <span className="text-emerald-400 font-bold text-xs">{selectedPlanetScript.facts.rashi}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'राशि स्वामी' : 'Sign Lord'}
                    </span>
                    <span className="text-[#d4af37] font-semibold text-xs">{selectedPlanetScript.facts.rashiLord}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'चाल (Motion)' : 'Motion'}
                    </span>
                    <span className="text-gray-200 text-xs">{selectedPlanetScript.facts.motion}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'अंश स्थिति (Natal)' : 'Natal Longitude'}
                    </span>
                    <span className="text-gray-200 text-xs">{selectedPlanetScript.facts.degree}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'नक्षत्र व चरण' : 'Nakshatra & Pada'}
                    </span>
                    <span className="text-gray-200 text-xs">{selectedPlanetScript.facts.nakshatra}</span>
                  </div>
                </div>

                {/* Spoken Narration Preview */}
                <div className="bg-[#030a08] border border-[#d4af37]/30 rounded-xl p-3 space-y-1.5">
                  <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-[#d4af37]" />
                    {isHindi ? 'वाणी पाठ (Devanagari Narration)' : 'Spoken Narration'}
                  </span>
                  <p className="text-gray-200 text-xs leading-relaxed font-sans">
                    {selectedPlanetScript.spokenText}
                  </p>
                </div>

                {/* Data Integrity Footnote */}
                <div className="text-[10px] text-gray-400 bg-black/20 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                  <span>{isHindi ? 'डेटा स्रोत: प्रामाणिक वर्ग गणना (VargaEngine)' : 'Source: Calculated VargaEngine'}</span>
                  <span className="text-emerald-400 font-semibold">✓ Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* HOUSE INFORMATION PANEL (Opens on House Touch - empty or occupied)        */}
        {/* ========================================================================= */}
        {selectedHouse != null && selectedHouseScript && chartData && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              SpeechEngine.stop();
              setSelectedHouse(null);
            }}
          >
            <div 
              className="bg-[#082218] border border-[#d4af37]/60 p-4 sm:p-5 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] text-white"
              onClick={e => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div className="flex justify-between items-start mb-3 border-b border-[#d4af37]/25 pb-3 gap-2">
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#d4af37] truncate">
                      {getLocalizedHouse(selectedHouse, language).full}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shrink-0">
                      {activeVarga}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5 truncate">
                    {isHindi ? `${vargaDef.nameHi} भाव विश्लेषण` : `${vargaDef.nameEn} House Analysis`}
                  </p>
                </div>

                {/* Speaker Control & Close */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <VargaSpeaksControl 
                    profile="bhava"
                    spokenText={selectedHouseScript.spokenText}
                    title={`${isHindi ? 'वाणी सुनें' : 'Listen'}: ${getLocalizedHouse(selectedHouse, language).full}`}
                    autoPlay={true}
                  />
                  <button 
                    onClick={() => {
                      SpeechEngine.stop();
                      setSelectedHouse(null);
                    }}
                    className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors text-base cursor-pointer"
                    title={t('common.close') || 'Close'}
                    aria-label="Close House Panel"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 12-House Switcher inside panel */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 border-b border-white/10 custom-scrollbar shrink-0">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => {
                  const isCurrent = h === selectedHouse;
                  return (
                    <button
                      key={h}
                      onClick={() => handleSelectHouse(h)}
                      className={`px-2.5 py-1 min-h-[36px] rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-[#d4af37] text-black font-bold shadow-md' 
                          : 'bg-black/40 text-gray-300 hover:text-[#d4af37] border border-white/10'
                      }`}
                    >
                      {isHindi ? `भाव ${h}` : `H${h}`}
                    </button>
                  );
                })}
              </div>

              {/* Facts & Spoken Script Content */}
              <div className="overflow-y-auto pr-1 custom-scrollbar space-y-3.5 text-xs flex-1">
                {/* Calculated House Placement Facts Grid */}
                <div className="grid grid-cols-2 gap-2 bg-black/40 border border-[#d4af37]/20 rounded-xl p-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'वर्ग चक्र' : 'Divisional Chart'}
                    </span>
                    <span className="text-[#d4af37] font-bold text-xs">{selectedHouseScript.facts.varga}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'भाव संख्या' : 'House Number'}
                    </span>
                    <span className="text-white font-bold text-xs">{selectedHouseScript.facts.house}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'भाव राशि' : 'Sign'}
                    </span>
                    <span className="text-emerald-400 font-bold text-xs">{selectedHouseScript.facts.rashi}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'राशि स्वामी' : 'Sign Lord'}
                    </span>
                    <span className="text-[#d4af37] font-semibold text-xs">{selectedHouseScript.facts.rashiLord}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                      {isHindi ? 'भाव वर्गीकरण' : 'Classification'}
                    </span>
                    <span className="text-amber-300 font-medium text-xs">{selectedHouseScript.facts.classification}</span>
                  </div>

                  {/* Occupancy Status */}
                  <div className="col-span-2 pt-2 border-t border-white/10">
                    <span className="text-[10px] text-gray-400 uppercase block font-semibold mb-1">
                      {isHindi ? 'भाव में स्थित ग्रह' : 'Occupying Planets'}
                    </span>
                    {chartData.housePlanets[selectedHouse]?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {chartData.housePlanets[selectedHouse].map(p => (
                          <button
                            key={p}
                            onClick={() => handleSelectPlanet(p)}
                            className="px-2.5 py-1 min-h-[36px] bg-[#d4af37]/20 border border-[#d4af37]/40 rounded-lg text-[#d4af37] font-bold text-xs hover:bg-[#d4af37] hover:text-black transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>{getLocalizedPlanet(p, language)}</span>
                            <ChevronRight className="w-3 h-3 opacity-60" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-2 text-amber-300">
                        <span className="font-bold text-xs block">
                          {isHindi ? 'यह भाव रिक्त है' : 'This house is empty'}
                        </span>
                        <p className="text-[11px] text-gray-300 mt-0.5">
                          {isHindi 
                            ? `इस भाव का फल इसके स्वामी ${selectedHouseScript.facts.rashiLord} की स्थिति और दृष्टि द्वारा निर्धारित होता है।` 
                            : `Governed by its lord ${selectedHouseScript.facts.rashiLord}.`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spoken Narration Preview */}
                <div className="bg-[#030a08] border border-[#d4af37]/30 rounded-xl p-3 space-y-1.5">
                  <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-[#d4af37]" />
                    {isHindi ? 'भाव वाणी पाठ (Devanagari Narration)' : 'Spoken Narration'}
                  </span>
                  <p className="text-gray-200 text-xs leading-relaxed font-sans">
                    {selectedHouseScript.spokenText}
                  </p>
                </div>

                {/* Data Integrity Footnote */}
                <div className="text-[10px] text-gray-400 bg-black/20 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                  <span>{isHindi ? 'डेटा स्रोत: प्रामाणिक वर्ग गणना (VargaEngine)' : 'Source: Calculated VargaEngine'}</span>
                  <span className="text-emerald-400 font-semibold">✓ Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
