import React, { useState, useEffect } from 'react';
import { 
  PrashnaContext, 
  PrashnaKundliData, 
  PrashnaHistoryItem, 
  PrashnaQuestionMode,
  PrashnaSupportingDetails,
  BirthProfile 
} from '../../types/kundli';
import { PRASHNA_MODES, getPrashnaModeConfig, PrashnaModeConfig } from '../../data/prashnaModes';
import { PrashnaEngine, PLANET_HINDI_NAMES } from '../../services/prashna/prashnaEngine';
import { PrashnaService } from '../../services/prashna/prashnaService';
import PrashnaConfirmationModal from './PrashnaConfirmationModal';
import PrashnaChart from './PrashnaChart';
import { 
  ArrowLeft, 
  HelpCircle, 
  Compass, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Share2, 
  History, 
  RefreshCw, 
  BookOpen, 
  Calendar,
  Layers,
  MapPin,
  Cpu,
  Trash2,
  Search,
  Check,
  Send,
  ShieldAlert,
  Info,
  ChevronDown,
  Navigation,
  Wind,
  Flame,
  Droplets,
  Mountain,
  GitCompare,
  AlertCircle,
  Globe,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square
} from 'lucide-react';
import LanguageSelectorModal from '../LanguageSelectorModal';
import { useLanguage } from '../../i18n';
import { SpeechEngine, SpeechState } from '../../services/companion/speechEngine';

interface Props {
  profile: BirthProfile;
  navigate: (view: any) => void;
  showToast?: (msg: string) => void;
}

const CATEGORIES = [
  'All',
  'Material & Wealth',
  'Life & Health',
  'Work & Enterprise',
  'Relationships',
  'Intellect & Movement',
  'Spirituality & Decision'
] as const;

export default function PrashnaDashboard({ profile, navigate, showToast }: Props) {
  const { t, currentLanguageInfo } = useLanguage();
  const [showLangModal, setShowLangModal] = useState(false);

  // Mode Selection State
  const [selectedMode, setSelectedMode] = useState<PrashnaQuestionMode>('general');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modeSearch, setModeSearch] = useState('');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  // Input & Supporting Details State
  const [question, setQuestion] = useState('');
  const [objectDescription, setObjectDescription] = useState('');
  const [lastKnownPlace, setLastKnownPlace] = useState('');
  const [personRelation, setPersonRelation] = useState('');
  const [symptomsOrConcern, setSymptomsOrConcern] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [destination, setDestination] = useState('');

  // Location & Timestamp State with Profile Fallback
  const [locationName, setLocationName] = useState(profile?.place || 'Indore, MP');
  const [latitude, setLatitude] = useState(profile?.latitude ?? 22.7196);
  const [longitude, setLongitude] = useState(profile?.longitude ?? 75.8577);
  const [timezone, setTimezone] = useState(profile?.timezone || 'Asia/Kolkata');
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<'profile' | 'gps' | 'manual'>('profile');

  // Flow State
  const [pendingContext, setPendingContext] = useState<PrashnaContext | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Result State
  const [prashnaData, setPrashnaData] = useState<PrashnaKundliData | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'tajik' | 'traditional' | 'planets' | 'houses' | 'ai' | 'why'>('chart');

  // AI State
  const [aiLanguage, setAiLanguage] = useState<'Hindi' | 'English'>('Hindi');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Voice / TTS State
  const [ttsState, setTtsState] = useState<SpeechState>('stopped');
  const [ttsSpeed, setTtsSpeed] = useState<'slow' | 'normal' | 'fast'>(SpeechEngine.getSpeedPreset());

  // Grounded Follow-up State
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [followUpHistory, setFollowUpHistory] = useState<Array<{ q: string; a: string }>>([]);

  // History State (partitioned by active profile)
  const activeProfileKey = profile?.id || profile?.name || 'default';
  const [history, setHistory] = useState<PrashnaHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const activeModeConfig = getPrashnaModeConfig(selectedMode);

  // Sync profile & load profile-specific history
  useEffect(() => {
    if (profile) {
      setLocationName(profile.place || 'Indore, MP');
      setLatitude(profile.latitude ?? 22.7196);
      setLongitude(profile.longitude ?? 75.8577);
      setTimezone(profile.timezone || 'Asia/Kolkata');
      setLocationSource('profile');
    }
    setHistory(PrashnaEngine.getHistory(activeProfileKey));
  }, [profile?.id, profile?.name, activeProfileKey]);

  // GPS Live Detection with Graceful Profile Fallback
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      const fallbackPlace = profile?.place || 'Indore, MP';
      setGpsStatus('ब्राउज़र में GPS उपलब्ध नहीं है। प्रोफाइल स्थान का उपयोग किया जा रहा है।');
      setLocationSource('profile');
      if (showToast) showToast('GPS उपलब्ध नहीं है, प्रोफाइल स्थान का उपयोग किया गया');
      return;
    }

    setIsLocatingGps(true);
    setGpsStatus('GPS से उपग्रह स्थिति जांची जा रही है...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        setLatitude(lat);
        setLongitude(lng);
        setLocationName(`GPS स्थान (${lat}°, ${lng}°)`);
        setLocationSource('gps');
        setIsLocatingGps(false);
        setGpsStatus(`GPS स्थान सत्यापित: ${lat}°, ${lng}° (सटीकता: ±${Math.round(pos.coords.accuracy)}m)`);
        if (showToast) showToast('वर्तमान GPS स्थान सफलतापूर्वक प्राप्त हुआ');
      },
      (err) => {
        console.warn('Geolocation fallback triggered:', err);
        const fallbackPlace = profile?.place || 'Indore, MP';
        const fallbackLat = profile?.latitude ?? 22.7196;
        const fallbackLng = profile?.longitude ?? 75.8577;
        setLocationName(fallbackPlace);
        setLatitude(fallbackLat);
        setLongitude(fallbackLng);
        setLocationSource('profile');
        setIsLocatingGps(false);
        setGpsStatus(`GPS अनुमति न मिलने पर प्रोफाइल स्थान (${fallbackPlace}) सुरक्षित रूप से प्रयुक्त।`);
        if (showToast) showToast(`GPS अनुपलब्ध: प्रोफाइल स्थान (${fallbackPlace}) प्रयुक्त`);
      },
      { timeout: 7000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  // Filter modes by category & search
  const filteredModes = PRASHNA_MODES.filter(m => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = !modeSearch.trim() || 
      m.labelHindi.toLowerCase().includes(modeSearch.toLowerCase()) || 
      m.labelEnglish.toLowerCase().includes(modeSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(modeSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Mode change handler
  const handleSelectMode = (modeId: PrashnaQuestionMode) => {
    setSelectedMode(modeId);
    setIsModeDropdownOpen(false);
    // If question is empty or was from previous mode's example, prefill with first example of new mode
    const newConfig = getPrashnaModeConfig(modeId);
    if (newConfig.quickExamples.length > 0 && (!question.trim() || activeModeConfig.quickExamples.some(e => e.hindi === question))) {
      setQuestion(newConfig.quickExamples[0].hindi);
    }
  };

  // Format current date and time for horary timestamp
  const captureCurrentContext = (customQuestion: string): PrashnaContext => {
    const now = new Date();
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedTime = `${formattedHours}:${minutes}:${seconds} ${ampm}`;

    const supportingDetails: PrashnaSupportingDetails = {};
    if (objectDescription.trim()) supportingDetails.objectDescription = objectDescription.trim();
    if (lastKnownPlace.trim()) supportingDetails.lastKnownPlace = lastKnownPlace.trim();
    if (personRelation.trim()) supportingDetails.personRelation = personRelation.trim();
    if (symptomsOrConcern.trim()) supportingDetails.symptomsOrConcern = symptomsOrConcern.trim();
    if (optionA.trim()) supportingDetails.optionA = optionA.trim();
    if (optionB.trim()) supportingDetails.optionB = optionB.trim();
    if (destination.trim()) supportingDetails.destination = destination.trim();

    return {
      question: customQuestion.trim(),
      timestamp: now.toISOString(),
      formattedDate,
      formattedTime,
      timezone,
      latitude,
      longitude,
      location: locationName,
      ayanamsa: 'Lahiri',
      mode: selectedMode,
      supportingDetails: Object.keys(supportingDetails).length > 0 ? supportingDetails : undefined
    };
  };

  const handleAskQuestion = (qText: string) => {
    if (!qText.trim()) {
      if (showToast) showToast(currentLanguageInfo.code === 'hi' ? 'कृपया अपना प्रश्न दर्ज करें' : 'Please enter your question');
      return;
    }
    const ctx = captureCurrentContext(qText);
    setPendingContext(ctx);
    setIsConfirmModalOpen(true);
  };

  const executeCalculation = async (ctx: PrashnaContext) => {
    setIsCalculating(true);
    setCalculationError(null);
    setAiInterpretation(null);
    setAiError(null);
    setFollowUpHistory([]);

    try {
      const result = await PrashnaEngine.calculatePrashnaChart(ctx);
      setPrashnaData(result);
      setIsConfirmModalOpen(false);

      // Save to privacy-safe history partitioned by active profile
      const historyItem: PrashnaHistoryItem = {
        id: result.prashnaId,
        profileId: activeProfileKey,
        profileName: profile?.name,
        mode: result.mode,
        modeLabel: result.traditionalAnalysis?.modeLabel || result.mode,
        question: ctx.question,
        timestamp: ctx.timestamp,
        formattedDateTime: `${ctx.formattedDate} ${ctx.formattedTime}`,
        location: ctx.location,
        calculationVersion: result.calculationVersion,
        lagnaSign: result.ascendant.hindiSign,
        moonSign: result.significators.moon.sign,
        karyaSiddhiPotential: result.significators.karyaSiddhiPotential,
        summary: result.significators.karyaSiddhiReason,
        tajikYoga: result.tajikAnalysis?.yogaNameHindi
      };
      PrashnaEngine.saveHistoryItem(historyItem);
      setHistory(PrashnaEngine.getHistory(activeProfileKey));

      if (showToast) showToast(currentLanguageInfo.code === 'hi' ? `प्रश्न कुंडली तैयार की गई` : `Prashna chart generated`);
    } catch (err: any) {
      console.error('Calculation failure:', err);
      setCalculationError(err.message || 'Calculation unavailable');
      if (showToast) showToast(currentLanguageInfo.code === 'hi' ? 'खगोलीय गणना उपलब्ध नहीं है' : 'Calculation unavailable');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, []);

  const handleToggleTts = () => {
    if (ttsState === 'playing') {
      SpeechEngine.pause();
      setTtsState('paused');
      return;
    }
    if (ttsState === 'paused') {
      SpeechEngine.resume();
      setTtsState('playing');
      return;
    }
    if (!aiInterpretation) return;

    const targetLang = aiLanguage === 'Hindi' ? 'hi' : 'en';
    setTtsState('playing');
    SpeechEngine.speak(
      aiInterpretation,
      targetLang,
      (state) => setTtsState(state),
      { speedPreset: ttsSpeed }
    );
  };

  const handleStopTts = () => {
    SpeechEngine.stop();
    setTtsState('stopped');
  };

  const handleSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    setTtsSpeed(speed);
    SpeechEngine.setSpeedPreset(speed);
    if (ttsState === 'playing' && aiInterpretation) {
      SpeechEngine.stop();
      const targetLang = aiLanguage === 'Hindi' ? 'hi' : 'en';
      setTtsState('playing');
      SpeechEngine.speak(
        aiInterpretation,
        targetLang,
        (state) => setTtsState(state),
        { speedPreset: speed }
      );
    }
  };

  const handleGenerateAi = async () => {
    if (!prashnaData || isAiLoading) return;
    SpeechEngine.stop();
    setTtsState('stopped');
    setIsAiLoading(true);
    setAiError(null);

    const res = await PrashnaService.generateInterpretation(prashnaData, aiLanguage);
    if (res.ok && res.answer) {
      setAiInterpretation(res.answer);
    } else {
      setAiError(res.error || 'Calculation unavailable: AI विश्लेषण प्राप्त करने में समस्या हुई।');
    }
    setIsAiLoading(false);
  };

  const handleAskFollowUp = async () => {
    if (!prashnaData || !followUpQuestion.trim() || !aiInterpretation || isFollowUpLoading) return;
    setIsFollowUpLoading(true);

    const currentQ = followUpQuestion.trim();
    const res = await PrashnaService.askFollowUp(prashnaData, currentQ, aiInterpretation, aiLanguage);
    if (res.ok && res.answer) {
      setFollowUpHistory(prev => [...prev, { q: currentQ, a: res.answer! }]);
      setFollowUpQuestion('');
    } else {
      if (showToast) showToast(res.error || 'अनुगामी प्रश्न विश्लेषण उपलब्ध नहीं हो सका');
    }
    setIsFollowUpLoading(false);
  };

  const handleCopyReport = () => {
    if (!prashnaData) return;
    const report = `=== जीवन दर्पण - प्रश्न कुंडली रिपोर्ट ===
विधा: ${prashnaData.traditionalAnalysis?.modeLabel || prashnaData.mode}
प्रश्न: ${prashnaData.context.question}
दिनांक व समय: ${prashnaData.context.formattedDate} at ${prashnaData.context.formattedTime}
स्थान: ${prashnaData.context.location} (${prashnaData.context.latitude}°N, ${prashnaData.context.longitude}°E)
समय क्षेत्र: ${prashnaData.context.timezone}
गणना प्रणाली: ${prashnaData.calculationVersion}

[खगोलीय संकेतक]
प्रश्न लग्न: ${prashnaData.ascendant.hindiSign} (${prashnaData.ascendant.formattedDegree}) - भावेश: ${prashnaData.ascendant.lord}
चंद्रमा: ${prashnaData.significators.moon.sign} (भाव ${prashnaData.significators.moon.house}, नक्षत्र: ${prashnaData.significators.moon.nakshatra} पद ${prashnaData.significators.moon.pada})
कार्य भाव: भाव ${prashnaData.significators.karyaBhava} - कार्येश: ${prashnaData.significators.karyeshLord.lord}
लग्न-कार्य सम्बंध: ${prashnaData.significators.lagneshKaryeshRelation}

[पारंपरिक प्रश्न फल एवं दिशा संकेतक]
कार्य सिद्धि सम्भावना: ${prashnaData.significators.karyaSiddhiPotential}
दिशा संकेत: ${prashnaData.traditionalAnalysis?.directionIndicator.hindiDirection} (${prashnaData.traditionalAnalysis?.directionIndicator.basis})
राशि स्वभाव: ${prashnaData.traditionalAnalysis?.signNatureIndicator.hindiNature} - ${prashnaData.traditionalAnalysis?.signNatureIndicator.implication}
तत्वीय संकेत: ${prashnaData.traditionalAnalysis?.elementIndicator.hindiElement} (${prashnaData.traditionalAnalysis?.elementIndicator.locationClues})
प्राप्ति / सिद्धि काल: ${prashnaData.traditionalAnalysis?.recoveryOrOutcomeTiming.traditionalTimingEstimate}

विवरण: ${prashnaData.significators.karyaSiddhiReason}
`;
    navigator.clipboard.writeText(report);
    if (showToast) showToast(currentLanguageInfo.code === 'hi' ? 'प्रश्न कुंडली रिपोर्ट कॉपी हो गई' : 'Prashna report copied');
  };

  const handleClearHistory = () => {
    PrashnaEngine.clearHistory(activeProfileKey);
    setHistory([]);
    if (showToast) showToast(currentLanguageInfo.code === 'hi' ? 'सक्रिय सदस्य का प्रश्न इतिहास मिटाया गया' : 'Active profile question history cleared');
  };

  const handleDeleteHistoryItem = (id: string) => {
    PrashnaEngine.deleteHistoryItem(id);
    setHistory(PrashnaEngine.getHistory(activeProfileKey));
    if (showToast) showToast(currentLanguageInfo.code === 'hi' ? 'प्रश्न इतिहास से हटाया गया' : 'Item removed from history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030a08] via-[#05140e] to-[#020604] text-white pb-24 px-4 sm:px-6 pt-4">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto flex items-center justify-between py-3 border-b border-[#d4af37]/20 mb-6">
        <button 
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-[#d4af37] bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-[#d4af37]/30 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.dashboard')}
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowLangModal(true)}
            className="flex items-center gap-1.5 text-[#d4af37] bg-[#d4af37]/15 px-3 py-2 rounded-xl border border-[#d4af37]/40 text-xs font-semibold hover:bg-[#d4af37]/25 transition-all cursor-pointer shadow-sm"
          >
            <Globe className="w-3.5 h-3.5" /> {currentLanguageInfo.nativeName}
          </button>
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-[#082218] border border-[#d4af37]/30 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <History className="w-4 h-4 text-[#d4af37]" /> {t('report.historyTitle') || 'इतिहास'} ({history.length})
          </button>
        </div>
      </header>

      {/* Global Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
        onLanguageSelected={(code) => showToast && showToast(`भाषा बदली गई: ${code.toUpperCase()}`)}
      />

      <main className="max-w-4xl mx-auto space-y-6">
        {/* Title Card */}
        <div className="bg-gradient-to-r from-[#082218] to-[#04120c] border border-[#d4af37]/40 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.7)] relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#d4af37] tracking-wide">
                  प्रश्न कुंडली — 25 वैदिक प्रश्न विधाएं
                </h1>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Phase 22.1.1
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
                25 विशिष्ट वैदिक प्रश्न विधाओं में खोई वस्तु, स्वास्थ्य, द्विविकल्प, करियर व विवाह आदि का तात्कालिक खगोलीय व पारंपरिक विश्लेषण।
              </p>
            </div>
          </div>
        </div>

        {/* Question Input Card (Visible when no chart is active or user wants to ask another) */}
        {!prashnaData ? (
          <div className="bg-[#082218]/80 border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-5">
            
            {/* 1. Mode Selector Grid / Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#d4af37]" />
                  1. प्रश्न विधा चुनें (Select Question Mode — 25 Modes):
                </label>
                <span className="text-[11px] text-emerald-300 font-semibold">
                  विधा: #{activeModeConfig.number} {activeModeConfig.labelHindi}
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 text-xs scrollbar-thin">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-[11px] font-medium ${
                      selectedCategory === cat
                        ? 'bg-[#d4af37] text-black font-bold shadow'
                        : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Selected Mode Banner with Change Toggle */}
              <div className="bg-black/50 border border-[#d4af37]/40 rounded-2xl p-3.5 mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] font-bold text-sm">
                    {activeModeConfig.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm text-white">{activeModeConfig.labelHindi}</h2>
                      <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded border border-white/10">
                        {activeModeConfig.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {activeModeConfig.descriptionHindi}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className="text-xs bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 shrink-0"
                >
                  {isModeDropdownOpen ? 'बंद करें (Close)' : 'विधाएं बदलें (Browse)'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isModeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Mode Selection Grid Drawer (Collapsible) */}
              {isModeDropdownOpen && (
                <div className="bg-[#04110b] border border-[#d4af37]/30 rounded-2xl p-3 mb-4 max-h-72 overflow-y-auto space-y-2">
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={modeSearch}
                      onChange={(e) => setModeSearch(e.target.value)}
                      placeholder={t('prashna.searchModesPlaceholder') || 'विधा खोजें (Search 25 modes)...'}
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredModes.map(m => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMode(m.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                          selectedMode === m.id
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow'
                            : 'bg-black/30 border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-6 h-6 rounded-lg bg-black/40 text-[11px] font-bold text-[#d4af37] flex items-center justify-center shrink-0">
                            {m.number}
                          </span>
                          <div className="truncate">
                            <span className="font-semibold block truncate">{m.labelHindi}</span>
                            <span className="text-[10px] text-gray-400 block truncate">{m.labelEnglish}</span>
                          </div>
                        </div>
                        {selectedMode === m.id && (
                          <Check className="w-4 h-4 text-[#d4af37] shrink-0 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Question Text Input */}
            <div>
              <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider block mb-1.5">
                {t('prashna.askQuestionPrompt') || '2. अपना प्रश्न दर्ज करें (Ask Question in Hindi or English):'}
              </label>
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t('kundli.askQuestionPlaceholder') || 'अपना प्रश्न यहाँ लिखें...'}
                  rows={2}
                  className="w-full bg-black/60 border border-[#d4af37]/40 rounded-2xl p-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-all resize-none shadow-inner"
                />
              </div>
            </div>

            {/* 3. Mode-Specific Supporting Input Fields */}
            {(selectedMode === 'lost_object' || selectedMode === 'stolen_object') && (
              <div className="bg-[#0a1b14] border border-[#d4af37]/30 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" /> वस्तु एवं स्थान विवरण (Object & Place Clues):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">{t('prashna.itemDescription') || 'वस्तु का विवरण (Description of item):'}</label>
                    <input
                      type="text"
                      value={objectDescription}
                      onChange={(e) => setObjectDescription(e.target.value)}
                      placeholder="उदा. सोने की अंगूठी, लैपटॉप बैग, फ़ाइल"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">{t('prashna.lastKnownPlace') || 'अंतिम बार कहाँ देखी गई (Last known place):'}</label>
                    <input
                      type="text"
                      value={lastKnownPlace}
                      onChange={(e) => setLastKnownPlace(e.target.value)}
                      placeholder="उदा. घर की अलमारी, ऑफिस डेस्क, यात्रा में"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMode === 'missing_person' && (
              <div className="bg-[#0a1b14] border border-[#d4af37]/30 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> लापता व्यक्ति संदर्भ (Missing Person Context):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">{t('prashna.personRelationship') || 'व्यक्ति से संबंध (Relationship):'}</label>
                    <input
                      type="text"
                      value={personRelation}
                      onChange={(e) => setPersonRelation(e.target.value)}
                      placeholder="उदा. मित्र, परिजन, कर्मचारी"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">{t('prashna.lastSeenPlace') || 'अंतिम ज्ञात स्थान / समय (Last seen place):'}</label>
                    <input
                      type="text"
                      value={lastKnownPlace}
                      onChange={(e) => setLastKnownPlace(e.target.value)}
                      placeholder="उदा. रेलवे स्टेशन, पुराना पता"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMode === 'health_rog' && (
              <div className="bg-[#0a1b14] border border-[#d4af37]/30 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> स्वास्थ्य संदर्भ (General Health Concern Context):
                </span>
                <input
                  type="text"
                  value={symptomsOrConcern}
                  onChange={(e) => setSymptomsOrConcern(e.target.value)}
                  placeholder="उदा. सामान्य स्वास्थ्य सुधार, चिकित्सा में प्रगति अथवा आरोग्य काल"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            )}

            {selectedMode === 'two_option' && (
              <div className="bg-[#0a1b14] border border-[#d4af37]/30 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                  <GitCompare className="w-3.5 h-3.5" /> दोनों विकल्पों का विवरण (Option A vs Option B):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-emerald-400 font-semibold block mb-1">{t('prashna.optionA') || 'विकल्प A (Option A):'}</label>
                    <input
                      type="text"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      placeholder="उदा. वर्तमान नौकरी में बने रहना"
                      className="w-full bg-black/50 border border-emerald-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-amber-400 font-semibold block mb-1">{t('prashna.optionB') || 'विकल्प B (Option B):'}</label>
                    <input
                      type="text"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      placeholder="उदा. नया स्टार्टअप / व्यवसाय आरंभ करना"
                      className="w-full bg-black/50 border border-amber-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMode === 'travel' && (
              <div className="bg-[#0a1b14] border border-[#d4af37]/30 rounded-2xl p-4 space-y-2">
                <label className="text-[11px] text-gray-400 block">{t('prashna.destinationPurpose') || 'यात्रा गंतव्य अथवा उद्देश्य (Destination / Purpose):'}</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="उदा. विदेश यात्रा, तीर्थ यात्रा, व्यावसायिक प्रवास"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            )}

            {/* Quick Example Chips for Active Mode */}
            <div>
              <span className="text-[11px] text-gray-400 block mb-1.5">
                विधा अनुसार शीघ्र प्रश्न (Quick Examples for {activeModeConfig.labelEnglish}):
              </span>
              <div className="flex flex-wrap gap-2">
                {activeModeConfig.quickExamples.map((eq, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuestion(eq.hindi)}
                    className="text-xs bg-white/5 hover:bg-[#d4af37]/20 border border-white/10 hover:border-[#d4af37]/50 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl transition-all text-left"
                  >
                    "{eq.hindi}"
                  </button>
                ))}
              </div>
            </div>

            {/* Mode-Specific Ethical / Warning Disclaimer */}
            {activeModeConfig.disclaimer && (
              <div className="flex items-start gap-2 bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-200/90 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{activeModeConfig.disclaimer}</span>
              </div>
            )}

            {/* Location & Time Confirmation Settings with GPS Fallback */}
            <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-3 rounded-xl">
                  <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-gray-400 block">{t('prashna.prashnaLocation') || 'प्रश्न स्थान (Location):'}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        locationSource === 'gps'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {locationSource === 'gps' ? 'GPS लाइव' : locationSource === 'profile' ? 'प्रोफाइल फॉलबैक' : 'हस्तचालित'}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => {
                        setLocationName(e.target.value);
                        setLocationSource('manual');
                      }}
                      className="bg-transparent text-white font-medium focus:outline-none w-full text-xs"
                      placeholder="शहर अथवा स्थान दर्ज करें"
                    />
                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                      <span>अक्षांश: {latitude.toFixed(4)}°</span>
                      <span>•</span>
                      <span>देशांतर: {longitude.toFixed(4)}°</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isLocatingGps}
                    title="वर्तमान GPS स्थान प्राप्त करें"
                    className="p-2 rounded-lg bg-[#d4af37]/10 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/30 transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin' : ''}`} />
                    <span className="text-[10px] font-bold hidden sm:inline">GPS</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-3 rounded-xl">
                  <Clock className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <div>
                    <span className="text-[10px] text-gray-400 block">{t('prashna.capturedMoment') || 'गणना क्षण (Captured at click):'}</span>
                    <span className="text-emerald-400 font-mono text-xs font-semibold block">
                      {t('common.liveCalculations') || 'तात्कालिक लाइव सेकंड्स (Real-time Horary)'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      समय क्षेत्र: {timezone}
                    </span>
                  </div>
                </div>
              </div>

              {gpsStatus && (
                <div className="text-[11px] px-3 py-1.5 rounded-lg bg-black/30 border border-white/5 text-gray-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span>{gpsStatus}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleAskQuestion(question)}
              disabled={!question.trim() || isCalculating}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#d4af37] via-[#c29e2e] to-[#a3801c] text-[#030a08] font-bold rounded-2xl tracking-wider text-sm shadow-[0_4px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_4px_35px_rgba(212,175,55,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              प्रश्न विचारें एवं कुंडली बनाएं (Ask Question & Calculate)
            </button>
          </div>
        ) : (
          /* RESULT VIEW */
          <div className="space-y-6 animate-fade-in">
            {/* Top Action Bar with Mode Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#082218]/90 border border-[#d4af37]/30 rounded-2xl p-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] font-bold px-2.5 py-0.5 rounded-md">
                    विधा: {prashnaData.traditionalAnalysis?.modeLabel || prashnaData.mode}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {prashnaData.traditionalAnalysis?.modeCategory}
                  </span>
                </div>
                <p className="text-base font-semibold text-white mt-0.5">
                  "{prashnaData.context.question}"
                </p>
                <span className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                  <span>{prashnaData.context.formattedDate} {prashnaData.context.formattedTime}</span>
                  <span>•</span>
                  <span>{prashnaData.context.location}</span>
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-[#d4af37]/40 text-[#d4af37] px-3 py-2 rounded-xl transition-all"
                >
                  <Share2 className="w-4 h-4" /> कॉपी रिपोर्ट
                </button>
                <button
                  onClick={() => {
                    setPrashnaData(null);
                    setQuestion('');
                    setFollowUpHistory([]);
                  }}
                  className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#030a08] font-bold px-4 py-2 rounded-xl transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> नया प्रश्न (New)
                </button>
              </div>
            </div>

            {/* Horary Verdict Card */}
            <div className="bg-gradient-to-b from-[#082218] to-[#04110b] border-2 border-[#d4af37]/50 rounded-3xl p-5 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                    कार्य सिद्धि सम्भावना (Horary Verdict):
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {prashnaData.significators.karyaSiddhiPotential === 'Favorable' && (
                      <span className="inline-flex items-center gap-1.5 text-base font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" /> शुभ एवं अनुकूल (Favorable)
                      </span>
                    )}
                    {prashnaData.significators.karyaSiddhiPotential === 'Moderate' && (
                      <span className="inline-flex items-center gap-1.5 text-base font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-xl">
                        <AlertTriangle className="w-4 h-4" /> मध्यम (Moderate Effort Needed)
                      </span>
                    )}
                    {prashnaData.significators.karyaSiddhiPotential === 'Challenging' && (
                      <span className="inline-flex items-center gap-1.5 text-base font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40 px-3 py-1 rounded-xl">
                        <AlertTriangle className="w-4 h-4" /> सतर्कता आवश्यक / विलंब (Challenging)
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Quick Badges */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="bg-black/50 border border-white/10 px-3 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-gray-400 block">प्रश्न लग्न:</span>
                    <span className="text-[#d4af37] font-semibold">{prashnaData.ascendant.hindiSign}</span>
                  </div>
                  <div className="bg-black/50 border border-white/10 px-3 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-gray-400 block">ताजिक योग:</span>
                    <span className="text-emerald-400 font-semibold">
                      {prashnaData.tajikAnalysis?.yogaNameHindi || prashnaData.significators.tajikYogaName || 'स्वतंत्र'}
                    </span>
                  </div>
                  <div className="bg-black/50 border border-white/10 px-3 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-gray-400 block">दिशा संकेत:</span>
                    <span className="text-white font-semibold">{prashnaData.traditionalAnalysis?.directionIndicator.hindiDirection}</span>
                  </div>
                  <div className="bg-black/50 border border-white/10 px-3 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-gray-400 block">कार्य भाव:</span>
                    <span className="text-emerald-400 font-semibold">भाव {prashnaData.significators.karyaBhava} ({prashnaData.significators.karyeshLord.lord})</span>
                  </div>
                </div>
              </div>

              {/* Astrological Rationale */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-gray-300 leading-relaxed">
                <span className="text-[#d4af37] font-bold block mb-1">
                  शास्त्रीय सम्बंध (Astronomical & Horary Relationship):
                </span>
                <p>
                  <strong>{prashnaData.significators.lagneshKaryeshRelation}:</strong> {prashnaData.significators.karyaSiddhiReason}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 border-b border-white/10 scrollbar-thin">
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'chart' 
                    ? 'bg-[#d4af37] text-[#030a08] font-bold shadow' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> कुंडली चक्र (Chart)
              </button>

              <button
                onClick={() => setActiveTab('tajik')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'tajik' 
                    ? 'bg-[#d4af37] text-[#030a08] font-bold shadow' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> ताजिक योग (Tajik Yogas)
              </button>

              <button
                onClick={() => setActiveTab('traditional')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'traditional' 
                    ? 'bg-[#d4af37] text-[#030a08] font-bold shadow' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" /> पारंपरिक प्रश्न फल (Indicators)
              </button>

              <button
                onClick={() => setActiveTab('planets')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'planets' 
                    ? 'bg-[#d4af37] text-[#030a08] font-bold shadow' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> ग्रह स्थिति (Planets)
              </button>

              <button
                onClick={() => setActiveTab('houses')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'houses' 
                    ? 'bg-[#d4af37] text-[#030a08] font-bold shadow' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> भाव चक्र (Houses)
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'ai' 
                    ? 'bg-[#d4af37] text-[#030a08] font-bold shadow' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" /> AI विश्लेषण व संवाद (Prashna AI)
              </button>

              <button
                onClick={() => setActiveTab('why')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'why' 
                    ? 'bg-[#d4af37] text-[#030a08] font-bold shadow' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> प्रमाण (Why?)
              </button>
            </div>

            {/* Tab 1: Chart View */}
            {activeTab === 'chart' && (
              <div className="bg-[#082218]/90 border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl">
                <div className="text-center mb-4">
                  <h2 className="text-base font-bold text-[#d4af37]">{t('prashna.prashnaChartTitle') || 'उत्तर भारतीय प्रश्न लग्न चक्र (Prashna Chart)'}</h2>
                  <p className="text-[11px] text-gray-400">
                    लग्न: {prashnaData.ascendant.hindiSign} ({prashnaData.ascendant.formattedDegree}) • कार्य भाव: भाव {prashnaData.significators.karyaBhava} ({prashnaData.significators.karyeshLord.lord})
                  </p>
                </div>
                <PrashnaChart data={prashnaData} />
              </div>
            )}

            {/* Tab: Classical Tajik Yoga Analysis */}
            {activeTab === 'tajik' && prashnaData.tajikAnalysis && (
              <div className="bg-[#082218]/90 border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                        prashnaData.tajikAnalysis.yogaCategory === 'Fulfillment (सिद्धि)'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : prashnaData.tajikAnalysis.yogaCategory === 'Impediment (बाधा/हानि)'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : prashnaData.tajikAnalysis.yogaCategory === 'Mediated (मध्यस्थ)'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {prashnaData.tajikAnalysis.yogaCategory}
                      </span>
                      {prashnaData.tajikAnalysis.subType && (
                        <span className="text-[11px] text-gray-300 bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/10">
                          {prashnaData.tajikAnalysis.subType}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-[#d4af37] flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> {prashnaData.tajikAnalysis.yogaNameHindi}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ताजिक नीलकण्ठी एवं शास्त्रीय प्रश्न शास्त्र के प्रामाणिक दीप्तांश नियमों पर आधारित गणितीय विश्लेषण
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">दृष्टि संबंध (Aspect):</span>
                    <span className="text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-xl border border-white/10 inline-block mt-0.5">
                      {prashnaData.tajikAnalysis.aspectNameHindi}
                    </span>
                  </div>
                </div>

                {/* Mathematical Planetary Orbs Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lagnesh Card */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-[#d4af37]">
                        लग्नेश (Lagna Lord): {prashnaData.tajikAnalysis.lagnesh.hindiName}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        prashnaData.tajikAnalysis.lagnesh.isFaster
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {prashnaData.tajikAnalysis.lagnesh.isFaster ? 'शीघ्रगामी (Laghukrami)' : 'मंदगामी (Gurukrami)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[10px] text-gray-400 block">राशि अंश:</span>
                        <span className="font-mono font-bold text-white">
                          {prashnaData.tajikAnalysis.lagnesh.degreeInSign.toFixed(2)}°
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[10px] text-gray-400 block">दीप्तांश (Orb):</span>
                        <span className="font-mono font-bold text-[#d4af37]">
                          {prashnaData.tajikAnalysis.lagnesh.deeptamsha}°
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[10px] text-gray-400 block">भाव स्थिति:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          भाव {prashnaData.tajikAnalysis.lagnesh.house}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Karyesh Card */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-emerald-400">
                        कार्येश (Karya Lord): {prashnaData.tajikAnalysis.karyesh.hindiName}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        prashnaData.tajikAnalysis.karyesh.isFaster
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {prashnaData.tajikAnalysis.karyesh.isFaster ? 'शीघ्रगामी (Laghukrami)' : 'मंदगामी (Gurukrami)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[10px] text-gray-400 block">राशि अंश:</span>
                        <span className="font-mono font-bold text-white">
                          {prashnaData.tajikAnalysis.karyesh.degreeInSign.toFixed(2)}°
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[10px] text-gray-400 block">दीप्तांश (Orb):</span>
                        <span className="font-mono font-bold text-[#d4af37]">
                          {prashnaData.tajikAnalysis.karyesh.deeptamsha}°
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[10px] text-gray-400 block">भाव स्थिति:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          भाव {prashnaData.tajikAnalysis.karyesh.house}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mathematical Verification Metrics Bar */}
                <div className="bg-black/60 border border-white/10 rounded-2xl p-4">
                  <h3 className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#d4af37]" /> ताजिक गणितीय सत्यापन (Mathematical Orb Calculus)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 block">संयुक्त दीप्तांश सीमा:</span>
                      <span className="text-xs font-bold font-mono text-[#d4af37]">
                        {prashnaData.tajikAnalysis.combinedDeeptamshaLimit.toFixed(1)}°
                      </span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">(Orb1 + Orb2) / 2</span>
                    </div>

                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 block">वास्तविक अंशात्मक अंतर:</span>
                      <span className="text-xs font-bold font-mono text-white">
                        {prashnaData.tajikAnalysis.actualDegreeDiff.toFixed(2)}°
                      </span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">|Deg1 - Deg2|</span>
                    </div>

                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 block">दीप्तांश सीमा स्थिति:</span>
                      <span className={`text-xs font-bold ${
                        prashnaData.tajikAnalysis.isWithinOrb ? 'text-emerald-400' : 'text-gray-400'
                      }`}>
                        {prashnaData.tajikAnalysis.isWithinOrb ? '✓ सीमा के भीतर' : '✗ सीमा से बाहर'}
                      </span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">
                        {prashnaData.tajikAnalysis.actualDegreeDiff <= prashnaData.tajikAnalysis.combinedDeeptamshaLimit ? 'Within Orb' : 'Beyond Orb'}
                      </span>
                    </div>

                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 block">गति दिशा (Vector):</span>
                      <span className={`text-xs font-bold ${
                        prashnaData.tajikAnalysis.isApplying ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {prashnaData.tajikAnalysis.isApplying ? 'सन्मुख (Applying)' : 'विमुख (Separating)'}
                      </span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">
                        {prashnaData.tajikAnalysis.isApplying ? 'इत्थशाल प्रवृत्त' : 'ईशराफ निवृत्त'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mediator Planet Card (if Nakta / Yamaya / Kambool) */}
                {prashnaData.tajikAnalysis.mediatorPlanet && (
                  <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black/50 border border-indigo-500/40 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-300">
                        मध्यस्थ ग्रह भूमिका: {prashnaData.tajikAnalysis.mediatorPlanet.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200">
                      {prashnaData.tajikAnalysis.mediatorPlanet.description}
                    </p>
                  </div>
                )}

                {/* Classical Shloka Citation */}
                <div className="bg-[#05170f] border border-[#d4af37]/20 rounded-2xl p-4">
                  <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider block mb-1">
                    शास्त्रीय श्लोक एवं सूत्र (Classical Tajik Neelakanthi Citation):
                  </span>
                  <p className="text-xs text-[#d4af37] font-serif italic mb-2">
                    {prashnaData.tajikAnalysis.classicalRule}
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {prashnaData.tajikAnalysis.interpretationHindi}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Traditional Prashna Indicators (Directions, Sign Nature, Elements, Timing) */}
            {activeTab === 'traditional' && prashnaData.traditionalAnalysis && (
              <div className="bg-[#082218]/90 border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-[#d4af37] flex items-center gap-2">
                      <Navigation className="w-5 h-5" /> पारंपरिक प्रश्न शास्त्र संकेतक (Traditional Horary Analysis)
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      विधा: {prashnaData.traditionalAnalysis.modeLabel} • प्राथमिक भाव: भाव {prashnaData.traditionalAnalysis.primaryHouse} • मुख्य कारक: {prashnaData.traditionalAnalysis.primarySignificator}
                    </p>
                  </div>
                </div>

                {/* 4 Core Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Direction */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-[#d4af37]" /> दिशा संकेत (Direction Indicator):
                      </span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        {prashnaData.traditionalAnalysis.directionIndicator.hindiDirection}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {prashnaData.traditionalAnalysis.directionIndicator.basis}
                    </p>
                  </div>

                  {/* Sign Nature */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                        <Wind className="w-4 h-4 text-[#d4af37]" /> राशि स्वभाव (Sign Nature):
                      </span>
                      <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                        {prashnaData.traditionalAnalysis.signNatureIndicator.hindiNature}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {prashnaData.traditionalAnalysis.signNatureIndicator.implication}
                    </p>
                  </div>

                  {/* Element & Environmental Clues */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-[#d4af37]" /> तत्व एवं परिवेश (Element & Place Clues):
                      </span>
                      <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        {prashnaData.traditionalAnalysis.elementIndicator.hindiElement}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {prashnaData.traditionalAnalysis.elementIndicator.locationClues}
                    </p>
                  </div>

                  {/* Timing & Recovery */}
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#d4af37]" /> सिद्धि / प्राप्ति काल (Timing Horizon):
                      </span>
                      <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                        {prashnaData.traditionalAnalysis.recoveryOrOutcomeTiming.probability}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300 font-medium">
                      {prashnaData.traditionalAnalysis.recoveryOrOutcomeTiming.traditionalTimingEstimate}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {prashnaData.traditionalAnalysis.recoveryOrOutcomeTiming.astrologicalCondition}
                    </p>
                  </div>
                </div>

                {/* Two-Option Comparative Analysis (If active) */}
                {prashnaData.traditionalAnalysis.twoOptionAnalysis && (
                  <div className="bg-[#04110b] border border-[#d4af37]/40 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-[#d4af37] flex items-center gap-2">
                      <GitCompare className="w-4 h-4" /> द्वि-विकल्प शास्त्रीय तुलना (Two-Option Comparative Assessment)
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-300 text-sm">
                            {prashnaData.traditionalAnalysis.twoOptionAnalysis.optionA.label}
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                            भाव 1 (लग्न)
                          </span>
                        </div>
                        <p className="text-gray-300">
                          {prashnaData.traditionalAnalysis.twoOptionAnalysis.optionA.evaluation}
                        </p>
                      </div>

                      <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300 text-sm">
                            {prashnaData.traditionalAnalysis.twoOptionAnalysis.optionB.label}
                          </span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                            भाव 7 (सप्तम)
                          </span>
                        </div>
                        <p className="text-gray-300">
                          {prashnaData.traditionalAnalysis.twoOptionAnalysis.optionB.evaluation}
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-gray-300 italic">
                      {prashnaData.traditionalAnalysis.twoOptionAnalysis.comparisonSummary}
                    </div>
                  </div>
                )}

                {/* Disclaimers & Ethics */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  {prashnaData.traditionalAnalysis.cautionsAndDisclaimers.map((caution, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-gray-400">
                      <Info className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                      <span>{caution}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Planetary Positions Table */}
            {activeTab === 'planets' && (
              <div className="bg-[#082218]/90 border border-[#d4af37]/30 rounded-3xl p-5 shadow-xl overflow-x-auto">
                <h2 className="text-sm font-bold text-[#d4af37] mb-3">
                  तात्कालिक ग्रह स्थिति (Planetary Coordinates at Horary Moment)
                </h2>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#d4af37]/20 text-[#d4af37]">
                      <th className="py-2.5 px-3">{t('kundli.planetLabel') || 'ग्रह'}</th>
                      <th className="py-2.5 px-3">{t('kundli.signLabel') || 'राशि'}</th>
                      <th className="py-2.5 px-3">{t('kundli.houseLabel') || 'भाव'}</th>
                      <th className="py-2.5 px-3">{t('kundli.degreeLabel') || 'अंश'}</th>
                      <th className="py-2.5 px-3">{t('kundli.nakshatraLabel') || 'नक्षत्र'}</th>
                      <th className="py-2.5 px-3">{t('kundli.padaLabel') || 'पद'}</th>
                      <th className="py-2.5 px-3">{t('kundli.motionLabel') || 'गति'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {/* Ascendant first */}
                    <tr className="bg-white/5 font-semibold text-[#d4af37]">
                      <td className="py-2.5 px-3">{t('kundli.lagna') || 'प्रश्न लग्न (Lagna)'}</td>
                      <td className="py-2.5 px-3">{prashnaData.ascendant.hindiSign}</td>
                      <td className="py-2.5 px-3">1</td>
                      <td className="py-2.5 px-3 font-mono">{prashnaData.ascendant.formattedDegree}</td>
                      <td className="py-2.5 px-3">{prashnaData.ascendant.nakshatra}</td>
                      <td className="py-2.5 px-3">{prashnaData.ascendant.pada}</td>
                      <td className="py-2.5 px-3 text-emerald-400">{t('kundli.directMotion') || 'Direct'}</td>
                    </tr>
                    {Object.values(prashnaData.planets).map((p) => {
                      const isMoon = p.planet === 'Moon';
                      const isKaryesh = p.planet === prashnaData.significators.karyeshLord.lord;
                      const isLagnesh = p.planet === prashnaData.significators.lagnaLord.planet;

                      return (
                        <tr 
                          key={p.planet}
                          className={isKaryesh || isLagnesh ? 'bg-[#d4af37]/10' : ''}
                        >
                          <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                            {p.hindiName}
                            {isLagnesh && <span className="text-[9px] bg-[#d4af37] text-black px-1 rounded font-bold">लग्नेश</span>}
                            {isKaryesh && <span className="text-[9px] bg-emerald-500 text-black px-1 rounded font-bold">कार्येश</span>}
                            {isMoon && <span className="text-[9px] bg-blue-500 text-white px-1 rounded font-bold">चंद्र</span>}
                          </td>
                          <td className="py-2.5 px-3">{p.hindiSign}</td>
                          <td className="py-2.5 px-3 font-bold text-white">{p.house}</td>
                          <td className="py-2.5 px-3 font-mono">{p.formattedDegree}</td>
                          <td className="py-2.5 px-3">{p.nakshatra}</td>
                          <td className="py-2.5 px-3">{p.pada}</td>
                          <td className="py-2.5 px-3">
                            {p.isRetrograde ? (
                              <span className="text-rose-400 font-bold">वक्र (Retrograde)</span>
                            ) : (
                              <span className="text-emerald-400">मार्गी (Direct)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Houses Table */}
            {activeTab === 'houses' && (
              <div className="bg-[#082218]/90 border border-[#d4af37]/30 rounded-3xl p-5 shadow-xl">
                <h2 className="text-sm font-bold text-[#d4af37] mb-3">भाव चक्र विश्लेषण (12 Houses Analysis)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => {
                    const houseData = prashnaData.d1Chart[h];
                    const occupying = Object.values(prashnaData.planets).filter(p => p.house === h);
                    const isKarya = h === prashnaData.significators.karyaBhava;
                    const isLagna = h === 1;

                    return (
                      <div 
                        key={h}
                        className={`border rounded-2xl p-3 text-xs ${
                          isKarya 
                            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md' 
                            : isLagna 
                            ? 'bg-[#d4af37]/10 border-[#d4af37]/60' 
                            : 'bg-black/40 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                          <span className="font-bold text-[#d4af37]">भाव {h}</span>
                          {isLagna && <span className="text-[9px] bg-[#d4af37] text-black px-1 rounded font-bold">लग्न भाव</span>}
                          {isKarya && <span className="text-[9px] bg-emerald-500 text-black px-1 rounded font-bold">कार्य भाव</span>}
                        </div>
                        <div className="text-gray-300 space-y-0.5">
                          <p>राशि: <strong>{houseData?.rashiName} ({houseData?.rashi})</strong></p>
                          <p>भावेश (Lord): <strong className="text-white">{houseData?.signLord}</strong></p>
                          <p>
                            स्थित ग्रह: {occupying.length > 0 ? (
                              <strong className="text-emerald-300">{occupying.map(o => o.planet).join(', ')}</strong>
                            ) : (
                              <span className="text-gray-500">रिक्त (None)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 5: AI Interpretation & Grounded Follow-up */}
            {activeTab === 'ai' && (
              <div className="bg-[#082218]/90 border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-[#d4af37] flex items-center gap-2">
                      <Cpu className="w-5 h-5" /> प्रश्न शास्त्र AI व्याख्या (Prashna Shastra AI)
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      खगोलीय सत्य + पारंपरिक प्रश्न फल + क्रियाशील मार्गदर्शन (Separated into 3 clear sections)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex bg-black/50 border border-white/10 rounded-xl p-1 text-xs">
                      <button
                        onClick={() => setAiLanguage('Hindi')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          aiLanguage === 'Hindi' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300'
                        }`}
                      >
                        हिन्दी
                      </button>
                      <button
                        onClick={() => setAiLanguage('English')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          aiLanguage === 'English' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-300'
                        }`}
                      >
                        English
                      </button>
                    </div>

                    <button
                      onClick={handleGenerateAi}
                      disabled={isAiLoading}
                      className="py-1.5 px-4 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#030a08] font-bold rounded-xl text-xs shadow hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isAiLoading ? 'विश्लेषण हो रहा है...' : aiInterpretation ? 'पुनः विश्लेषण (Refresh)' : 'AI विश्लेषण प्राप्त करें'}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {aiError && (
                  <div className="bg-red-950/60 border border-red-500/50 rounded-2xl p-4 text-xs text-red-200">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" /> त्रुटि (Error)
                    </p>
                    <p className="mt-1">{aiError}</p>
                  </div>
                )}

                {/* AI Interpretation Content */}
                {aiInterpretation ? (
                  <div className="space-y-4">
                    {/* Central Voice / TTS Audio Player Bar */}
                    <div className="bg-[#04120c] border border-[#d4af37]/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleToggleTts}
                          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            ttsState === 'playing'
                              ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-pulse'
                              : ttsState === 'paused'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 hover:bg-[#d4af37]/25'
                          }`}
                          title={ttsState === 'playing' ? 'विराम दें (Pause)' : 'व्याख्या सुनें (Listen)'}
                        >
                          {ttsState === 'playing' ? (
                            <>
                              <Pause className="w-3.5 h-3.5" /> विराम (Pause)
                            </>
                          ) : ttsState === 'paused' ? (
                            <>
                              <Play className="w-3.5 h-3.5" /> पुनः सुनें (Resume)
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" /> व्याख्या सुनें (Listen)
                            </>
                          )}
                        </button>

                        {(ttsState === 'playing' || ttsState === 'paused') && (
                          <button
                            onClick={handleStopTts}
                            className="p-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 transition cursor-pointer"
                            title="रोकें (Stop)"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}

                        <span className="text-[11px] text-gray-400 hidden sm:inline">
                          {aiLanguage === 'Hindi' ? 'वैदिक गंभीर स्वर (Hindi)' : 'English Voice'}
                        </span>
                      </div>

                      {/* Speed Presets */}
                      <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1 text-[10px]">
                        <span className="text-gray-400 px-1 text-[9px]">गति:</span>
                        <button
                          onClick={() => handleSpeedChange('slow')}
                          className={`px-2 py-0.5 rounded-lg transition ${
                            ttsSpeed === 'slow' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          0.76x शांत
                        </button>
                        <button
                          onClick={() => handleSpeedChange('normal')}
                          className={`px-2 py-0.5 rounded-lg transition ${
                            ttsSpeed === 'normal' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          0.92x
                        </button>
                        <button
                          onClick={() => handleSpeedChange('fast')}
                          className={`px-2 py-0.5 rounded-lg transition ${
                            ttsSpeed === 'fast' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          1.05x
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                      {aiInterpretation}
                    </div>

                    {/* Grounded Follow-up History */}
                    {followUpHistory.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                          अनुगामी प्रश्न व उत्तर (Follow-up Inquiries):
                        </h3>
                        {followUpHistory.map((item, idx) => (
                          <div key={idx} className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
                            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5" /> प्रश्न: "{item.q}"
                            </p>
                            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Grounded Follow-up Input Box */}
                    <div className="bg-[#05140e] border border-[#d4af37]/30 rounded-2xl p-4 space-y-2">
                      <label className="text-xs font-bold text-[#d4af37] block">
                        इसी प्रश्न कुंडली पर अनुगामी प्रश्न पूछें (Ask Grounded Follow-up on this Prashna Chart):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={followUpQuestion}
                          onChange={(e) => setFollowUpQuestion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isFollowUpLoading) {
                              handleAskFollowUp();
                            }
                          }}
                          placeholder="उदा. क्या इसमें किसी मित्र की सहायता लाभकारी रहेगी?"
                          className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                        />
                        <button
                          onClick={handleAskFollowUp}
                          disabled={!followUpQuestion.trim() || isFollowUpLoading}
                          className="py-2 px-4 bg-[#d4af37] hover:bg-[#c49f2b] text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          {isFollowUpLoading ? (
                            <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          पूछें
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 italic">
                        (यह अनुगामी प्रश्न इसी तात्कालिक प्रश्न कुंडली के खगोलीय आंकड़ों पर आधारित रहेगा)
                      </p>
                    </div>
                  </div>
                ) : !isAiLoading ? (
                  <div className="text-center py-10 bg-black/20 rounded-2xl border border-white/5">
                    <Sparkles className="w-8 h-8 text-[#d4af37]/60 mx-auto mb-2" />
                    <p className="text-xs text-gray-300 font-medium">
                      गणित आधारित शास्त्रीय प्रश्न फल एवं विवेकपूर्ण मार्गदर्शन हेतु 'AI विश्लेषण प्राप्त करें' पर क्लिक करें।
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      (No fabricated data • Strictly uses calculated horary coordinates)
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-3 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs text-[#d4af37] font-semibold">
                      वैदिक प्रश्न शास्त्र अनुसार खगोलीय संबंधों का विश्लेषण किया जा रहा है...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: Why? Astrological Explanation */}
            {activeTab === 'why' && (
              <div className="bg-[#082218]/90 border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-[#d4af37] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" /> ज्योतिषीय कारण एवं प्रमाण (Astrological "Why?")
                </h2>
                
                <div className="space-y-3 text-xs text-gray-300">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                    <h3 className="font-bold text-white mb-1">1. प्रश्न लग्न एवं लग्नेश (Querent's Sign & Ruler):</h3>
                    <p>
                      प्रश्न लग्न <strong>{prashnaData.ascendant.hindiSign}</strong> है, जिसके स्वामी ग्रह <strong>{prashnaData.ascendant.lord}</strong> हैं। लग्न प्रच्छक (प्रश्नकर्ता) की मंशा, निष्ठा और आत्म-संयम को दर्शाता है।
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                    <h3 className="font-bold text-white mb-1">2. चंद्रमा की स्थिति (Seed of Question / Moon's Placement):</h3>
                    <p>
                      चंद्रमा <strong>{prashnaData.significators.moon.sign}</strong> में भाव <strong>{prashnaData.significators.moon.house}</strong> में, नक्षत्र <strong>{prashnaData.significators.moon.nakshatra}</strong> के पद <strong>{prashnaData.significators.moon.pada}</strong> में स्थित हैं। चंद्रमा मन और विचार का कारक है।
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                    <h3 className="font-bold text-white mb-1">3. कार्य भाव एवं कार्येश (Significator of Query):</h3>
                    <p>
                      प्रश्न का मुख्य विषय '{prashnaData.significators.questionCategory}' है। इसके लिए <strong>भाव {prashnaData.significators.karyaBhava}</strong> को कार्य भाव माना गया है, जिसके स्वामी <strong>{prashnaData.significators.karyeshLord.lord}</strong> हैं।
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                    <h3 className="font-bold text-[#d4af37] mb-1">4. लग्न-कार्य सम्बंध (Sambandh / Horary Synthesis):</h3>
                    <p>
                      {prashnaData.significators.lagneshKaryeshRelation}: {prashnaData.significators.karyaSiddhiReason}
                    </p>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 text-emerald-200">
                    <h3 className="font-bold mb-1">5. दैव एवं पुरुषार्थ (Cosmic Inclination vs Free Will):</h3>
                    <p>
                      प्रश्न शास्त्र तात्कालिक ऊर्जा और खगोलीय प्रवाह का दर्पण है। यह किसी अपरिवर्तनीय नियति का दावा नहीं करता; विवेकपूर्ण निर्णय और समर्पित पुरुषार्थ द्वारा परिणाम सदैव परिष्कृत किए जा सकते हैं।
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* History Modal / Drawer */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#082218] border border-[#d4af37]/50 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-white max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#d4af37] flex items-center gap-2">
                    <History className="w-5 h-5" /> प्रश्न इतिहास (Prashna Question History)
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    सक्रिय सदस्य: <span className="text-[#d4af37] font-semibold">{profile?.name || 'प्राथमिक सदस्य'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 bg-red-950/30 border border-red-500/30 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> सब मिटाएं
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="text-gray-400 hover:text-white text-sm p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                {history.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">
                    {profile?.name ? `${profile.name} के लिए कोई पूर्व प्रश्न इतिहास दर्ज नहीं है।` : 'कोई पूर्व प्रश्न इतिहास उपलब्ध नहीं है।'}
                  </p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="bg-black/50 border border-white/10 rounded-2xl p-3.5 text-xs hover:border-[#d4af37]/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          {item.modeLabel && (
                            <span className="text-[9px] bg-[#d4af37]/20 text-[#d4af37] px-1.5 py-0.5 rounded mr-1.5 font-semibold">
                              {item.modeLabel}
                            </span>
                          )}
                          {item.tajikYoga && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded mr-1.5 font-semibold">
                              {item.tajikYoga}
                            </span>
                          )}
                          <span className="font-bold text-white text-sm">"{item.question}"</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.karyaSiddhiPotential === 'Favorable'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : item.karyaSiddhiPotential === 'Challenging'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {item.karyaSiddhiPotential}
                          </span>
                          <button
                            onClick={() => handleDeleteHistoryItem(item.id)}
                            title="यह प्रश्न हटाएं"
                            className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-1.5 flex items-center gap-2">
                        <span>{item.formattedDateTime}</span>
                        <span>•</span>
                        <span>{item.location}</span>
                        <span>•</span>
                        <span className="text-[#d4af37]">लग्न: {item.lagnaSign}</span>
                      </p>
                      <p className="text-[11px] text-gray-300 italic bg-[#04110b] p-2 rounded-xl">
                        {item.summary}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {isConfirmModalOpen && pendingContext && (
          <PrashnaConfirmationModal
            context={pendingContext}
            onConfirm={() => executeCalculation(pendingContext)}
            onEdit={() => setIsConfirmModalOpen(false)}
            onClose={() => setIsConfirmModalOpen(false)}
            isLoading={isCalculating}
          />
        )}
      </main>
    </div>
  );
}
