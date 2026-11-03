/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
  Info,
  ChevronDown,
  Layers,
  Compass,
  Check
} from 'lucide-react';
import { MasterKundliData } from '../../types/kundli';
import { VargaEngine, VargaAnalysisResult } from '../../services/jyotish/vargaEngine';
import { useTranslation, LanguageCode } from '../../i18n';
import {
  getLocalizedPlanet,
  getLocalizedRashi,
  getLocalizedHouse,
  getPlanetAbbreviation
} from '../../i18n/astrology';
import { SpeechEngine } from '../../services/companion/speechEngine';
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
  category: 'core' | 'higher' | 'subtle';
}

export const COMPLETE_SHODASHAVARGA: VargaDefinition[] = [
  { key: 'D1', nameHi: 'राशि कुंडली (D1)', nameEn: 'Rashi (D1)', division: 1, significanceHi: 'सम्पूर्ण व्यक्तित्व, देह, रूप, आयु व समग्र जीवन का मूल आधार', significanceEn: 'Overall Life, Physique, Temperament & Core Destiny', isAvailable: true, signProp: 'd1Sign', category: 'core' },
  { key: 'D2', nameHi: 'होरा कुंडली (D2)', nameEn: 'Hora (D2)', division: 2, significanceHi: 'धन, संपदा, पैतृक संपत्ति, वाणी व वित्तीय समृद्धि', significanceEn: 'Wealth, Liquid Assets, Speech & Prosperity', isAvailable: true, signProp: 'd2Sign', category: 'core' },
  { key: 'D3', nameHi: 'द्रेष्काण कुंडली (D3)', nameEn: 'Drekkana (D3)', division: 3, significanceHi: 'सहोदर, भाई-बहन, अदम्य साहस, पराक्रम व ऊर्जा', significanceEn: 'Siblings, Courage, Vitality & Energy', isAvailable: true, signProp: 'd3Sign', category: 'core' },
  { key: 'D4', nameHi: 'चतुर्थांश कुंडली (D4)', nameEn: 'Chaturthamsha (D4)', division: 4, significanceHi: 'अचल संपत्ति, भवन, वाहन, गृह सुख व मातृक भाग्य', significanceEn: 'Fixed Assets, Real Estate, Home & Fortune', isAvailable: true, signProp: 'd4Sign', category: 'core' },
  { key: 'D7', nameHi: 'सप्तांश कुंडली (D7)', nameEn: 'Saptamsha (D7)', division: 7, significanceHi: 'संतान, संतति सुख, वंश वृद्धि व पौत्र-प्रपौत्र', significanceEn: 'Children, Progeny, Lineage & Descendants', isAvailable: true, signProp: 'd7Sign', category: 'core' },
  { key: 'D9', nameHi: 'नवांश कुंडली (D9)', nameEn: 'Navamsha (D9)', division: 9, significanceHi: 'जीवनसाथी, वैवाहिक जीवन, धर्म, भाग्य व ग्रहों का आंतरिक सूक्ष्म बल', significanceEn: 'Spouse, Marriage, Dharma, Fortune & Soul Strength', isAvailable: true, signProp: 'd9Sign', category: 'core' },
  { key: 'D10', nameHi: 'दशमांश कुंडली (D10)', nameEn: 'Dasamsha (D10)', division: 10, significanceHi: 'कर्म, पेशा, आजीविका, सामाजिक पद-प्रतिष्ठा, अधिकार व ख्याति', significanceEn: 'Career, Profession, Leadership, Status & Fame', isAvailable: true, signProp: 'd10Sign', category: 'core' },
  { key: 'D12', nameHi: 'द्वादशांश कुंडली (D12)', nameEn: 'Dwadashamsha (D12)', division: 12, significanceHi: 'माता-पिता, पूर्वज, पैतृक संस्कार, वंश परंपरा व आनुवंशिकता', significanceEn: 'Parents, Ancestors, Heredity & Lineage Karma', isAvailable: true, signProp: 'd12Sign', category: 'core' },
  { key: 'D16', nameHi: 'षोडशांश कुंडली (D16)', nameEn: 'Shodashamsha (D16)', division: 16, significanceHi: 'वाहन, भौतिक ऐश्वर्य, सुख-सुविधाएं, यात्राएं व मानसिक शांति', significanceEn: 'Vehicles, Luxuries, Inner Comfort & Pleasures', isAvailable: true, signProp: 'd16Sign', category: 'higher' },
  { key: 'D20', nameHi: 'विंशांश कुंडली (D20)', nameEn: 'Vimshamsha (D20)', division: 20, significanceHi: 'उपासना, भक्ति, आध्यात्मिक साधना, मंत्र सिद्धि व ईश्वरीय कृपा', significanceEn: 'Spiritual Progress, Worship, Mantra Sadhana & Devotion', isAvailable: true, signProp: 'd20Sign', category: 'higher' },
  { key: 'D24', nameHi: 'चतुर्विंशांश कुंडली (D24)', nameEn: 'Chaturvimshamsha (D24)', division: 24, significanceHi: 'ज्ञान, विद्या, उच्च शिक्षा, प्रज्ञा, अनुसंधान व मेधा शक्ति', significanceEn: 'Higher Education, Intellect, Learning & Wisdom', isAvailable: true, signProp: 'd24Sign', category: 'higher' },
  { key: 'D27', nameHi: 'सप्तविंशांश कुंडली (D27)', nameEn: 'Saptavimshamsha (D27)', division: 27, significanceHi: 'शारीरिक बल, अंतर्निहित सामर्थ्य, सहनशक्ति व नक्षत्र पद फल', significanceEn: 'Physical Strength, Stamina, Inherent Capacities & Padas', isAvailable: true, signProp: 'd27Sign', category: 'higher' },
  { key: 'D30', nameHi: 'त्रिंशांश कुंडली (D30)', nameEn: 'Trimshamsha (D30)', division: 30, significanceHi: 'अरिष्ट, रोग, गुप्त शत्रु, जीवन के संकट, भय व बाधाओं का विचार', significanceEn: 'Misfortunes, Evils, Diseases, Adversities & Obstacles', isAvailable: true, signProp: 'd30Sign', category: 'higher' },
  { key: 'D40', nameHi: 'खवेदांश कुंडली (D40)', nameEn: 'Khavedamsha (D40)', division: 40, significanceHi: 'शुभ-अशुभ फल, मातृक कुल के पूर्वज व शुभ संस्कारों की स्थिति', significanceEn: 'Auspicious & Inauspicious Events, Maternal Heritage', isAvailable: true, signProp: 'd40Sign', category: 'subtle' },
  { key: 'D45', nameHi: 'अक्षवेदांश कुंडली (D45)', nameEn: 'Akshavedamsha (D45)', division: 45, significanceHi: 'नैतिक चरित्र, सामान्य शुभ-अशुभ स्थिति, सत्यनिष्ठा व पितृक प्रभाव', significanceEn: 'Character, Integrity, General Indications & Moral Ethics', isAvailable: true, signProp: 'd45Sign', category: 'subtle' },
  { key: 'D60', nameHi: 'षष्ट्यंश कुंडली (D60)', nameEn: 'Shashtiamsha (D60)', division: 60, significanceHi: 'सूक्ष्म प्रारब्ध, पूर्व जन्म के संचित कर्म व जीवन का अंतिम रहस्य', significanceEn: 'Past Life Karma, Root Destiny & Ultimate Subconscious Blueprint', isAvailable: true, signProp: 'd60Sign', category: 'subtle' }
];

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

const ALL_NAVAGRAHAS = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
];

interface VargaKundaliViewProps {
  masterData: MasterKundliData | null;
  language?: string;
}

export const VargaKundaliView: React.FC<VargaKundaliViewProps> = ({
  masterData,
  language: propLanguage
}) => {
  const { t, language: i18nLanguage } = useTranslation();
  const currentLang = (propLanguage || i18nLanguage || 'hi') as LanguageCode;
  const isHindi = currentLang === 'hi' || (currentLang as string) === 'Hindi' || currentLang === 'sa';

  const [activeVarga, setActiveVarga] = useState<string>('D9');
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<'normal' | 'slow' | 'fast'>('normal');

  // Compute Varga analysis using the Jyotish VargaEngine
  const vargaResult: VargaAnalysisResult | null = useMemo(() => {
    if (!masterData) return null;
    try {
      const engine = new VargaEngine();
      return engine.evaluate(masterData);
    } catch (err) {
      console.error('Error evaluating VargaEngine:', err);
      return null;
    }
  }, [masterData]);

  const vargaDef = useMemo(() => {
    return (COMPLETE_SHODASHAVARGA || []).find(v => v.key === activeVarga) || COMPLETE_SHODASHAVARGA[0];
  }, [activeVarga]);

  // Clean state when changing active Varga
  const handleSelectVarga = useCallback((vKey: string) => {
    SpeechEngine.stop();
    setIsPlayingAudio(false);
    setSelectedPlanet(null);
    setSelectedHouse(null);
    setActiveVarga(vKey);
  }, []);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, []);

  // House selection handler
  const handleSelectHouse = useCallback((houseNum: number) => {
    SpeechEngine.stop();
    setIsPlayingAudio(false);
    setSelectedPlanet(null);
    setSelectedHouse(prev => (prev === houseNum ? null : houseNum));
  }, []);

  // Planet selection handler
  const handleSelectPlanet = useCallback((pName: string) => {
    SpeechEngine.stop();
    setIsPlayingAudio(false);
    setSelectedHouse(null);
    setSelectedPlanet(prev => (prev === pName ? null : pName));
  }, []);

  // Calculate houses and planet distribution for active Varga
  const chartData = useMemo(() => {
    let ascendantSign: number | null | undefined = vargaResult?.ascendantVargas?.[activeVarga];

    if ((ascendantSign == null || ascendantSign < 1) && masterData) {
      const lagnaLong =
        masterData.lagna?.siderealLongitude ??
        (masterData.lagna?.rashi != null
          ? (masterData.lagna.rashi - 1) * 30 + (masterData.lagna.degree || 0)
          : null);
      if (lagnaLong != null) {
        ascendantSign = VargaEngine.getVargaSign(activeVarga, lagnaLong);
      }
    }

    if (ascendantSign == null || ascendantSign < 1 || ascendantSign > 12) {
      ascendantSign = 1;
    }

    const signPropKey = (vargaDef.signProp || `${activeVarga.toLowerCase()}Sign`) as keyof NonNullable<typeof vargaResult>['planets'][0];

    const houseRashis: Record<number, number> = {};
    for (let h = 1; h <= 12; h++) {
      houseRashis[h] = ((ascendantSign - 1 + (h - 1)) % 12) + 1;
    }

    const housePlanets: Record<number, string[]> = {};
    for (let h = 1; h <= 12; h++) {
      housePlanets[h] = [];
    }

    const planetList: { planet: string; sign: number; house: number }[] = [];
    const planetMap: Record<string, { planet: string; sign: number; house: number }> = {};

    for (const pName of ALL_NAVAGRAHAS) {
      let pSign: number | null = null;
      const vp = vargaResult?.planets?.find(p => p.planet === pName);
      if (vp && signPropKey && vp[signPropKey] != null) {
        pSign = Number(vp[signPropKey]);
      }
      if ((pSign == null || pSign < 1) && masterData?.planets?.[pName]) {
        const pd = masterData.planets[pName];
        const pLong =
          pd.siderealLongitude ??
          (pd.rashi != null ? (pd.rashi - 1) * 30 + (pd.degree || 0) : null);
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
      currentLang
    );
  }, [selectedPlanet, chartData, activeVarga, vargaDef, masterData, currentLang]);

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
      currentLang
    );
  }, [selectedHouse, chartData, activeVarga, vargaDef, currentLang]);

  // Audio Playback Handler
  const handleToggleAudio = useCallback(() => {
    if (isPlayingAudio) {
      SpeechEngine.stop();
      setIsPlayingAudio(false);
      return;
    }

    let textToSpeak = '';
    if (selectedPlanetScript) {
      textToSpeak = selectedPlanetScript.spokenText;
    } else if (selectedHouseScript) {
      textToSpeak = selectedHouseScript.spokenText;
    } else if (chartData) {
      const ascRashi = getLocalizedRashi(RASHI_NAMES_LIST[chartData.ascendantSign - 1], currentLang);
      if (isHindi) {
        textToSpeak = `यह ${vargaDef.nameHi} है। इसका मुख्य विचार ${vargaDef.significanceHi} है। इस वर्ग चक्र में लग्न ${ascRashi} उदित है। किसी भी ग्रह अथवा भाव का फल जानने के लिए चक्र पर स्पर्श करें।`;
      } else {
        textToSpeak = `This is the ${vargaDef.nameEn} divisional chart. It illuminates ${vargaDef.significanceEn}. The ascendant of this chart is ${ascRashi}. Tap on any planet or house to explore verified planetary placements.`;
      }
    }

    if (!textToSpeak) return;

    setIsPlayingAudio(true);
    SpeechEngine.speak(textToSpeak, currentLang, {
      profile: selectedPlanet ? 'planet' : 'bhava',
      speedPreset: audioSpeed,
      onStateChange: state => {
        if (state === 'stopped') {
          setIsPlayingAudio(false);
        }
      }
    });
  }, [
    isPlayingAudio,
    selectedPlanetScript,
    selectedHouseScript,
    chartData,
    vargaDef,
    currentLang,
    isHindi,
    audioSpeed,
    selectedPlanet
  ]);

  return (
    <div className="space-y-6">
      {/* Varga Selector Dropdown & Scrollable Bar */}
      <div className="bg-[#04120c]/90 border border-[#d4af37]/30 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#d4af37]" />
            <h3 className="text-base font-bold text-[#d4af37]">
              {t('dashboard.varga') || (isHindi ? 'षोडशवर्ग कुंडलियां (D1 - D60)' : 'Divisional Charts (D1 - D60)')}
            </h3>
          </div>

          {/* Quick Dropdown Selector */}
          <div className="relative min-w-[200px]">
            <select
              value={activeVarga}
              onChange={e => handleSelectVarga(e.target.value)}
              className="w-full appearance-none bg-[#082218] border border-[#d4af37]/50 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#d4af37] focus:outline-none focus:border-[#fae19c] cursor-pointer shadow-inner pr-8"
              aria-label="Select Divisional Chart"
            >
              <optgroup label={isHindi ? 'प्रमुख वर्ग (Core Shodashavarga)' : 'Core Divisional Charts'}>
                {(COMPLETE_SHODASHAVARGA || [])
                  .filter(v => v.category === 'core')
                  .map(v => (
                    <option key={v.key} value={v.key}>
                      {v.key} - {isHindi ? v.nameHi : v.nameEn}
                    </option>
                  ))}
              </optgroup>
              <optgroup label={isHindi ? 'उच्च वर्ग (Higher Vargas)' : 'Higher Vargas'}>
                {(COMPLETE_SHODASHAVARGA || [])
                  .filter(v => v.category === 'higher')
                  .map(v => (
                    <option key={v.key} value={v.key}>
                      {v.key} - {isHindi ? v.nameHi : v.nameEn}
                    </option>
                  ))}
              </optgroup>
              <optgroup label={isHindi ? 'सूक्ष्म प्रारब्ध वर्ग (Subtle & Karma)' : 'Subtle & Karma Vargas'}>
                {(COMPLETE_SHODASHAVARGA || [])
                  .filter(v => v.category === 'subtle')
                  .map(v => (
                    <option key={v.key} value={v.key}>
                      {v.key} - {isHindi ? v.nameHi : v.nameEn}
                    </option>
                  ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-[#d4af37] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Shodashavarga Quick Select Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
          {(COMPLETE_SHODASHAVARGA || []).map(v => {
            const isSel = v.key === activeVarga;
            return (
              <button
                key={v.key}
                onClick={() => handleSelectVarga(v.key)}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                  isSel
                    ? 'bg-gradient-to-r from-[#ffe89e] via-[#d4af37] to-[#aa831b] text-black shadow-[0_0_12px_rgba(212,175,55,0.5)] scale-105'
                    : 'bg-[#071d14] text-gray-300 border border-[#d4af37]/30 hover:border-[#d4af37] hover:text-[#d4af37]'
                }`}
              >
                <span>{v.key}</span>
                {isSel && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart Container with Ornate Corners */}
      <div className="bg-gradient-to-br from-[#061e14] via-[#030d08] to-[#020a06] border border-[#d4af37]/50 p-4 sm:p-6 rounded-3xl relative shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
        <OrnateCorner position="top-left" size={24} />
        <OrnateCorner position="top-right" size={24} />
        <OrnateCorner position="bottom-left" size={24} />
        <OrnateCorner position="bottom-right" size={24} />

        {/* Varga Header & Audio Narration Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d4af37]/20 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#d4af37]">
                {isHindi ? vargaDef.nameHi : vargaDef.nameEn}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#fae19c] border border-[#d4af37]/40 font-bold">
                1/{vargaDef.division} {isHindi ? 'भाग' : 'Part'}
              </span>
            </div>
            <p className="text-xs text-gray-300 max-w-md">
              {isHindi ? vargaDef.significanceHi : vargaDef.significanceEn}
            </p>
          </div>

          {/* Varga Audio Narration / Speaks Controller */}
          <div className="flex items-center gap-2 shrink-0 bg-black/60 border border-[#d4af37]/40 rounded-xl p-1.5 self-start sm:self-auto">
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                isPlayingAudio
                  ? 'bg-amber-500 text-black animate-pulse'
                  : 'bg-[#d4af37] text-black hover:bg-[#ffe89e]'
              }`}
              title={isPlayingAudio ? 'Pause / Stop' : 'Listen to Audio Voice'}
            >
              {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-black" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>
                {isPlayingAudio
                  ? (isHindi ? 'विराम' : 'Stop')
                  : (isHindi ? 'वाणी सुनें' : 'Listen')}
              </span>
            </button>

            <button
              onClick={() => {
                const nextSpeed = audioSpeed === 'normal' ? 'fast' : audioSpeed === 'fast' ? 'slow' : 'normal';
                setAudioSpeed(nextSpeed);
              }}
              className="px-2 py-1 text-[10px] font-mono rounded bg-white/10 text-gray-300 hover:text-white"
              title="Speech Speed"
            >
              {audioSpeed === 'normal' ? '1.0x' : audioSpeed === 'fast' ? '1.25x' : '0.8x'}
            </button>
          </div>
        </div>

        {/* Ascendant Badge & Guidance Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#041910] border border-[#d4af37]/30 rounded-xl px-3.5 py-2 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#d4af37]" />
            <span className="text-gray-300">{isHindi ? 'वर्ग लग्न (Ascendant):' : 'Varga Lagna:'}</span>
            <span className="text-[#ffe89e] font-bold text-sm">
              {getLocalizedRashi(RASHI_NAMES_LIST[(chartData?.ascendantSign || 1) - 1], currentLang)} ({chartData?.ascendantSign})
            </span>
          </div>

          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHindi ? 'ग्रह या भाव पर टैप करके विश्लेषण सुनें' : 'Tap any house or planet for speech & analysis'}</span>
          </div>
        </div>

        {/* North Indian Visual Kundali Chart */}
        <div className="w-full aspect-square max-w-[340px] relative mx-auto bg-[#030d08] border-2 border-[#d4af37]/60 rounded-2xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.25)] select-none mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#d4af37] stroke-[0.5] pointer-events-auto">
            <defs>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                <radialGradient
                  key={`varga-grad-${h}`}
                  id={`vargaBhavaGrad-${h}`}
                  cx={`${HOUSE_CENTROIDS[h].x}%`}
                  cy={`${HOUSE_CENTROIDS[h].y}%`}
                  r="38%"
                >
                  <stop offset="0%" stopColor="#0f4430" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#072b1d" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#03160e" stopOpacity="0.98" />
                </radialGradient>
              ))}

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                <radialGradient
                  key={`varga-sel-grad-${h}`}
                  id={`vargaBhavaSelGrad-${h}`}
                  cx={`${HOUSE_CENTROIDS[h].x}%`}
                  cy={`${HOUSE_CENTROIDS[h].y}%`}
                  r="42%"
                >
                  <stop offset="0%" stopColor="#ffe89e" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#d4af37" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#041a10" stopOpacity="0.95" />
                </radialGradient>
              ))}
            </defs>

            <rect x="0" y="0" width="100" height="100" className="fill-[#04140d] stroke-none" />

            {/* Clickable House Polygons */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
              const isSelected = selectedHouse === house;
              return (
                <polygon
                  key={house}
                  points={HOUSE_POLYGONS[house]}
                  fill={isSelected ? `url(#vargaBhavaSelGrad-${house})` : `url(#vargaBhavaGrad-${house})`}
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'stroke-[#ffe89e] stroke-[1.8] opacity-100'
                      : 'stroke-[#d4af37]/70 hover:stroke-[#fae19c] stroke-[0.8] opacity-90 hover:opacity-100'
                  }`}
                  onClick={() => handleSelectHouse(house)}
                >
                  <title>{`${getLocalizedHouse(house, currentLang).full}`}</title>
                </polygon>
              );
            })}

            {/* Crisp Golden Geometry Lines */}
            <rect x="0" y="0" width="100" height="100" className="fill-none pointer-events-none stroke-[#d4af37]/70 stroke-[0.8]" />
            <line x1="0" y1="0" x2="100" y2="100" className="pointer-events-none stroke-[#d4af37]/80 stroke-[0.7]" />
            <line x1="100" y1="0" x2="0" y2="100" className="pointer-events-none stroke-[#d4af37]/80 stroke-[0.7]" />
            <polygon points="50,0 100,50 50,100 0,50" className="fill-none pointer-events-none stroke-[#d4af37]/80 stroke-[0.7]" />

            {/* Central Yantra Sacred Motif */}
            <YantraMotif cx={50} cy={50} radius={16} opacity={0.25} />
          </svg>

          {/* House Content: Rashis and Occupying Planets */}
          <div className="absolute inset-0 text-[#d4af37]/90 font-medium text-xs pointer-events-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
              const rashiNum = chartData.houseRashis[house];
              const isLagna = house === 1;
              const occupants = chartData.housePlanets[house] || [];
              const isHouseSelected = selectedHouse === house;

              return (
                <div
                  key={house}
                  className={`absolute ${HOUSE_POSITIONS[house]} flex flex-col items-center p-0.5 text-center z-10 leading-tight pointer-events-none transition-all duration-200 ${
                    isHouseSelected ? 'scale-105 z-30 drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]' : ''
                  }`}
                >
                  {/* Rashi Number */}
                  <div className="relative flex items-center justify-center mb-0.5 pointer-events-auto">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleSelectHouse(house);
                      }}
                      className={`cursor-pointer transition-all text-[9px] font-bold rounded-full px-1.5 py-0.2 select-none flex items-center justify-center ${
                        isHouseSelected
                          ? 'bg-[#ffe89e] text-black ring-2 ring-[#fae19c]'
                          : 'bg-[#04150e]/90 text-emerald-300 border border-[#d4af37]/40 hover:border-[#fae19c]'
                      }`}
                    >
                      {rashiNum}
                    </button>
                  </div>

                  {isLagna && (
                    <span className="text-emerald-400 text-[8.5px] font-bold tracking-wider select-none drop-shadow">
                      {isHindi ? 'लग्न' : 'Asc'}
                    </span>
                  )}

                  {/* Occupying Planets */}
                  <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-[80px]">
                    {(occupants || []).map(pName => {
                      const abbr = getPlanetAbbreviation(pName, currentLang);
                      const isPlanetSelected = selectedPlanet === pName;
                      const pMaster = masterData?.planets?.[pName];
                      const isRetro = pMaster?.isRetrograde;

                      return (
                        <button
                          key={pName}
                          onClick={e => {
                            e.stopPropagation();
                            handleSelectPlanet(pName);
                          }}
                          className={`pointer-events-auto cursor-pointer px-1 py-0.5 rounded text-[9px] font-bold transition-all ${
                            isPlanetSelected
                              ? 'bg-gradient-to-r from-[#ffe89e] to-[#d4af37] text-black scale-110 shadow-md ring-1 ring-white'
                              : 'bg-black/80 text-[#fae19c] border border-[#d4af37]/50 hover:bg-[#d4af37]/30'
                          }`}
                          title={getLocalizedPlanet(pName, currentLang)}
                        >
                          {abbr}
                          {isRetro ? '*' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Planet or House Interactive Interpretation Banner */}
        {(selectedPlanetScript || selectedHouseScript) && (
          <div className="bg-[#051c12] border-2 border-[#d4af37] rounded-2xl p-4 mb-6 shadow-xl relative animate-fadeIn">
            <div className="flex justify-between items-start gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4af37]" />
                <h4 className="text-base font-bold text-[#d4af37]">
                  {selectedPlanetScript ? selectedPlanetScript.title : selectedHouseScript?.title}
                </h4>
              </div>
              <button
                onClick={handleToggleAudio}
                className="flex items-center gap-1 px-3 py-1 bg-[#d4af37] text-black font-bold rounded-lg text-xs hover:bg-[#ffe89e] transition-colors cursor-pointer"
              >
                {isPlayingAudio ? <Square className="w-3 h-3 fill-black" /> : <Play className="w-3 h-3 fill-black" />}
                <span>{isPlayingAudio ? (isHindi ? 'रोकें' : 'Stop') : (isHindi ? 'सुनें' : 'Play')}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {selectedPlanetScript ? selectedPlanetScript.spokenText : selectedHouseScript?.spokenText}
            </p>

            {/* Quick Fact Badges */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#d4af37]/20 text-[11px]">
              {selectedPlanetScript && (
                <>
                  <span className="px-2 py-0.5 rounded bg-black/40 text-gray-300 border border-white/10">
                    {isHindi ? 'भाव:' : 'House:'} {selectedPlanetScript.facts.house}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/40 text-[#d4af37] border border-[#d4af37]/30">
                    {isHindi ? 'राशि:' : 'Rashi:'} {selectedPlanetScript.facts.rashi}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/40 text-emerald-300 border border-emerald-500/30">
                    {isHindi ? 'स्वामी:' : 'Lord:'} {selectedPlanetScript.facts.rashiLord}
                  </span>
                </>
              )}
              {selectedHouseScript && (
                <>
                  <span className="px-2 py-0.5 rounded bg-black/40 text-gray-300 border border-white/10">
                    {selectedHouseScript.facts.classification}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/40 text-[#d4af37] border border-[#d4af37]/30">
                    {isHindi ? 'राशि:' : 'Rashi:'} {selectedHouseScript.facts.rashi}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/40 text-emerald-300 border border-emerald-500/30">
                    {isHindi ? 'भावाधिपति:' : 'Lord:'} {selectedHouseScript.facts.rashiLord}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* 9-Navagraha Quick Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              {isHindi ? '९ नवग्रह वर्ग स्थिति (Tap to inspect)' : '9 Navagrahas in Varga (Tap to inspect)'}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {ALL_NAVAGRAHAS.map(pName => {
              const info = chartData.planetMap[pName];
              if (!info) return null;
              const isSel = selectedPlanet === pName;
              const rashiName = RASHI_NAMES_LIST[info.sign - 1] || 'Aries';

              return (
                <button
                  key={pName}
                  onClick={() => handleSelectPlanet(pName)}
                  className={`min-h-[44px] p-2 rounded-xl border text-xs transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isSel
                      ? 'bg-gradient-to-r from-[#ffe89e] to-[#d4af37] text-black font-extrabold shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105'
                      : 'bg-black/50 text-gray-300 border-[#d4af37]/25 hover:border-[#d4af37] hover:bg-[#d4af37]/15'
                  }`}
                >
                  <span className="font-bold">{getLocalizedPlanet(pName, currentLang)}</span>
                  <span className="text-[10px] opacity-80 font-mono">
                    {isHindi ? `भाव ${info.house}` : `H${info.house}`} • {getLocalizedRashi(rashiName, currentLang)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 12 Bhavas Quick Grid */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#d4af37]" />
              {isHindi ? '१२ भाव विवरण (12 Bhavas)' : '12 Bhavas Information'}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => {
              const isSel = selectedHouse === h;
              const occ = chartData.housePlanets[h] || [];
              const rNum = chartData.houseRashis[h];
              const rName = RASHI_NAMES_LIST[rNum - 1];

              return (
                <button
                  key={h}
                  onClick={() => handleSelectHouse(h)}
                  className={`min-h-[44px] p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isSel
                      ? 'bg-[#d4af37] text-black font-bold border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                      : 'bg-black/40 text-gray-300 border-white/10 hover:border-[#d4af37]/50'
                  }`}
                >
                  <span className="text-xs font-bold">{isHindi ? `भाव ${h}` : `H${h}`}</span>
                  <span className="text-[9.5px] opacity-75 truncate max-w-[55px]">
                    {getLocalizedRashi(rName, currentLang)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comprehensive Planetary Placement Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider px-1">
            {isHindi ? `${vargaDef.nameHi} ग्रह स्थिति तालिका` : `${vargaDef.nameEn} Planetary Placements Table`}
          </h4>

          <div className="overflow-x-auto rounded-xl border border-[#d4af37]/25 bg-black/40">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#041a10] text-[#d4af37] border-b border-[#d4af37]/30 text-[11px] font-bold">
                <tr>
                  <th className="p-2.5">{isHindi ? 'ग्रह' : 'Planet'}</th>
                  <th className="p-2.5">{isHindi ? 'राशि' : 'Sign'}</th>
                  <th className="p-2.5">{isHindi ? 'भाव' : 'House'}</th>
                  <th className="p-2.5">{isHindi ? 'राशि स्वामी' : 'Sign Lord'}</th>
                  <th className="p-2.5">{isHindi ? 'स्थिति' : 'Motion'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/15">
                {(chartData.planetList || []).map(item => {
                  const rashiName = RASHI_NAMES_LIST[item.sign - 1] || 'Aries';
                  const lordKey = VARGA_RASHI_LORDS[item.sign] || 'Mars';
                  const pMaster = masterData?.planets?.[item.planet];
                  const isRetro = pMaster?.isRetrograde;
                  const isSel = selectedPlanet === item.planet;

                  return (
                    <tr
                      key={item.planet}
                      onClick={() => handleSelectPlanet(item.planet)}
                      className={`cursor-pointer transition-colors ${
                        isSel ? 'bg-[#d4af37]/25 text-white font-bold' : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      <td className="p-2.5 font-bold text-[#d4af37]">
                        {getLocalizedPlanet(item.planet, currentLang)}
                      </td>
                      <td className="p-2.5">{getLocalizedRashi(rashiName, currentLang)}</td>
                      <td className="p-2.5 font-mono">{isHindi ? `भाव ${item.house}` : `House ${item.house}`}</td>
                      <td className="p-2.5 text-gray-400">{getLocalizedPlanet(lordKey, currentLang)}</td>
                      <td className="p-2.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            isRetro
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
                          }`}
                        >
                          {isRetro ? (isHindi ? 'वक्री' : 'Retro') : (isHindi ? 'मार्गी' : 'Direct')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
