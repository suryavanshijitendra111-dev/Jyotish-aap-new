/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MUHURAT MODULE (शुभ मुहूर्त)
 * PHASE 1.12: MUHURAT DASHBOARD COMPONENT
 * 
 * Mobile-first 2D calculation-driven Vedic Muhurat Explorer.
 * Supports 10 classical categories, Panchang evaluations, Choghadiya,
 * Rahu Kaal avoidance, Abhijit Muhurat, and 3-tier explainability.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  ChevronRight,
  X,
  Copy,
  Check,
  ShieldCheck,
  Heart,
  Home,
  Hammer,
  Car,
  Briefcase,
  Baby,
  Utensils,
  GraduationCap,
  Sun,
  Moon,
  Flame,
  Search,
  RefreshCw,
  Globe
} from 'lucide-react';
import { BirthProfile } from '../../types/kundli';
import {
  MuhuratCategoryKey,
  MuhuratQuery,
  MuhuratCalculationResult,
  MuhuratWindow,
  MuhuratSuitability
} from '../../types/muhurat/muhuratTypes';
import { MuhuratService } from '../../services/muhurat/muhuratService';
import { MUHURAT_CATEGORIES } from '../../services/muhurat/muhuratRulesEngine';
import { MuhuratAiService, MuhuratExplanationResult } from '../../services/muhurat/muhuratAiService';
import { useTranslation } from '../../i18n';
import LanguageSelectorModal from '../LanguageSelectorModal';

interface MuhuratDashboardProps {
  profile: BirthProfile | null;
  navigate: (view: string) => void;
  showToast?: (msg: string) => void;
}

const PRESET_CITIES = [
  { name: 'Indore, MP', lat: 22.7196, lon: 75.8577 },
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai, MH', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru, KA', lat: 12.9716, lon: 77.5946 },
  { name: 'Varanasi, UP', lat: 25.3176, lon: 82.9739 },
  { name: 'Jaipur, RJ', lat: 26.9124, lon: 75.7873 },
  { name: 'Kolkata, WB', lat: 22.5726, lon: 88.3639 },
  { name: 'Ahmedabad, GJ', lat: 23.0225, lon: 72.5714 }
];

export default function MuhuratDashboard({ profile, navigate, showToast }: MuhuratDashboardProps) {
  const { language } = useTranslation();
  const isHindi = language === 'hi';

  const [showLangModal, setShowLangModal] = useState(false);

  // Category Selection
  const [selectedCategory, setSelectedCategory] = useState<MuhuratCategoryKey>('sarva_karya');

  // Location State
  const [locationName, setLocationName] = useState<string>(profile?.place || 'Indore, MP');
  const [latitude, setLatitude] = useState<number>(profile?.latitude ?? 22.7196);
  const [longitude, setLongitude] = useState<number>(profile?.longitude ?? 75.8577);
  const [timezone] = useState<string>(profile?.timezone || 'Asia/Kolkata');
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Date Range State
  const [rangePreset, setRangePreset] = useState<'7' | '15' | '30' | 'custom'>('15');
  const todayIso = useMemo(() => MuhuratService.formatDateIso(new Date()), []);
  const [startDate, setStartDate] = useState<string>(todayIso);
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return MuhuratService.formatDateIso(d);
  });

  // Calculation Results
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<MuhuratCalculationResult | null>(null);
  const [activeSuitabilityFilter, setActiveSuitabilityFilter] = useState<'ALL' | 'EXCELLENT' | 'GOOD' | 'MODERATE'>('ALL');

  // Detail Drawer & Explainability
  const [selectedWindow, setSelectedWindow] = useState<MuhuratWindow | null>(null);
  const [whyExplanation, setWhyExplanation] = useState<MuhuratExplanationResult | null>(null);
  const [isWhyLoading, setIsWhyLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Update dates when range preset changes
  const handleRangePresetChange = (preset: '7' | '15' | '30' | 'custom') => {
    setRangePreset(preset);
    if (preset === 'custom') return;

    const days = Number(preset);
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + (days - 1));

    setStartDate(MuhuratService.formatDateIso(start));
    setEndDate(MuhuratService.formatDateIso(end));
  };

  // Perform Calculation
  const runCalculation = useCallback(async () => {
    setIsCalculating(true);
    try {
      const query: MuhuratQuery = {
        category: selectedCategory,
        startDate,
        endDate,
        locationName,
        latitude,
        longitude,
        timezone,
        profileName: profile?.name || 'Jitendra Suryavanshi'
      };

      const result = await MuhuratService.calculateMuhurat(query);
      setCalculationResult(result);
    } catch (e) {
      console.error('Muhurat calculation error:', e);
      if (showToast) showToast('मुहूर्त गणना में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsCalculating(false);
    }
  }, [selectedCategory, startDate, endDate, locationName, latitude, longitude, timezone, profile, showToast]);

  // Initial Calculation on Mount or Category / Profile change
  useEffect(() => {
    runCalculation();
  }, [runCalculation]);

  // Handle Window Click
  const handleOpenWindowDetails = (w: MuhuratWindow) => {
    setSelectedWindow(w);
    setWhyExplanation(null);
  };

  // Handle "यह समय क्यों?" Explainability
  const handleRequestWhyExplanation = async (w: MuhuratWindow) => {
    setIsWhyLoading(true);
    try {
      const res = await MuhuratAiService.getExplanation(w, isHindi ? 'Hindi' : 'English');
      setWhyExplanation(res);
    } catch (e) {
      const fallback = MuhuratAiService.getDeterministicExplanation(w, isHindi);
      setWhyExplanation({ text: fallback, source: 'DETERMINISTIC_FALLBACK' });
    } finally {
      setIsWhyLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Category Icon Resolver
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-5 h-5 text-rose-400" />;
      case 'Home': return <Home className="w-5 h-5 text-emerald-400" />;
      case 'Hammer': return <Hammer className="w-5 h-5 text-amber-400" />;
      case 'Car': return <Car className="w-5 h-5 text-sky-400" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-yellow-400" />;
      case 'Baby': return <Baby className="w-5 h-5 text-pink-400" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-orange-400" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-teal-400" />;
      default: return <Sparkles className="w-5 h-5 text-[#d4af37]" />;
    }
  };

  // Filtered Windows List
  const displayedWindows = useMemo(() => {
    if (!calculationResult) return [];
    if (activeSuitabilityFilter === 'ALL') return calculationResult.windows;
    return calculationResult.windows.filter(w => w.suitability === activeSuitabilityFilter);
  }, [calculationResult, activeSuitabilityFilter]);

  const activeCategoryConfig = MUHURAT_CATEGORIES[selectedCategory];

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-28 text-white min-h-screen">
      {/* Header Bar */}
      <header className="flex justify-between items-center p-4 sm:p-5 border-b border-[#d4af37]/20 bg-[#030a08]/85 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('dashboard')}
            className="min-h-[44px] min-w-[44px] rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37]/25 transition-all cursor-pointer"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#d4af37]">
              {isHindi ? 'शुभ मुहूर्त' : 'Auspicious Muhurat'}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#d4af37]/80 font-medium">
              {isHindi ? 'वैदिक पंचांग एवं चौघड़िया समय-शोधक' : 'Vedic Panchang & Timing Explorer'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowLangModal(true)}
          className="min-h-[44px] px-3 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold hover:bg-[#d4af37]/25 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          <span>{isHindi ? 'हिन्दी' : 'English'}</span>
        </button>
      </header>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
        onLanguageSelected={(code) => {
          if (showToast) showToast(`भाषा बदली गई: ${code.toUpperCase()}`);
        }}
      />

      <main className="p-4 sm:p-5 flex flex-col gap-5 sm:gap-6">
        {/* Hero Spotlight Card */}
        <div className="bg-gradient-to-r from-[#041d13] via-[#082a1c] to-[#03150d] border border-[#d4af37]/70 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(212,175,55,0.25)]">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
              ॥ कालशुद्धि प्रज्ञा ॥
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide mb-1.5 flex items-center gap-2">
              <span>🌟 वैदिक शुभ मुहूर्त</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#fef08a] font-medium leading-relaxed mb-3">
              {isHindi
                ? '“शुभस्य शीघ्रम” — तिथि, वार, नक्षत्र, योग, करण, अभिजित एवं चौघड़िया से परिष्कृत मांगलिक समय-खिड़कियाँ।'
                : 'Astronomically calculated auspicious timing windows based on Tithi, Nakshatra, and Choghadiya.'}
            </p>

            {/* Location & Profile Strip */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="text-gray-200 font-medium truncate">{locationName}</span>
              </div>
              <button
                onClick={() => setShowLocationModal(true)}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#fef08a] text-xs font-bold hover:bg-[#d4af37]/30 transition-all cursor-pointer whitespace-nowrap"
              >
                {isHindi ? 'स्थान बदलें' : 'Change City'}
              </button>
            </div>
          </div>
        </div>

        {/* Category Selection Carousel / Grid */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              {isHindi ? '१. मांगलिक कार्य / प्रयोजन चुनें' : '1. Select Auspicious Activity'}
            </h3>
            <span className="text-[11px] text-gray-400">10 श्रेणियां</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {Object.values(MUHURAT_CATEGORIES).map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`min-h-[64px] p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#0c3120] to-[#05180f] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-[1.01]'
                      : 'bg-black/35 border-white/10 hover:border-[#d4af37]/40 hover:bg-black/50'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#030a08] border border-white/10 shrink-0">
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-[#fef08a]' : 'text-white'}`}>
                      {isHindi ? cat.titleHindi : cat.titleEnglish}
                    </h4>
                    <p className="text-[10px] text-gray-400 line-clamp-1">
                      {isHindi ? cat.titleEnglish : cat.titleHindi}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Category Description Pill */}
          <div className="p-3 rounded-2xl bg-black/30 border border-[#d4af37]/25 text-xs text-gray-300 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-0.5">
                {isHindi ? activeCategoryConfig.titleHindi : activeCategoryConfig.titleEnglish}
              </p>
              <p>{isHindi ? activeCategoryConfig.descriptionHindi : activeCategoryConfig.descriptionEnglish}</p>
            </div>
          </div>
        </section>

        {/* Date Range Selection */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              {isHindi ? '२. समय-सीमा चुनें (Date Range)' : '2. Select Search Window'}
            </h3>
            <span className="text-[11px] text-gray-400">{startDate} → {endDate}</span>
          </div>

          {/* Range Presets */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: '7', labelHi: '७ दिन', labelEn: '7 Days' },
              { id: '15', labelHi: '१५ दिन', labelEn: '15 Days' },
              { id: '30', labelHi: '३० दिन', labelEn: '30 Days' },
              { id: 'custom', labelHi: 'कस्टम', labelEn: 'Custom' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handleRangePresetChange(p.id as any)}
                className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${
                  rangePreset === p.id
                    ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-md'
                    : 'bg-black/35 text-gray-300 border-white/10 hover:border-[#d4af37]/40'
                }`}
              >
                {isHindi ? p.labelHi : p.labelEn}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers if selected */}
          {rangePreset === 'custom' && (
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs animate-fadeIn">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">आरंभ तिथि (Start Date)</label>
                <input
                  type="date"
                  value={startDate}
                  min={todayIso}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-xs focus:border-[#d4af37] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">समापन तिथि (End Date)</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-xs focus:border-[#d4af37] outline-none"
                />
              </div>
            </div>
          )}

          {/* Calculate Button */}
          <button
            onClick={runCalculation}
            disabled={isCalculating}
            className="w-full min-h-[50px] px-5 py-3 bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#b89528] text-black font-extrabold rounded-2xl text-base hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{isHindi ? 'खगोलीय गणना जारी है...' : 'Calculating Ephemeris...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-black" />
                <span>{isHindi ? 'शुभ मुहूर्त खोजें (Calculate Muhurat)' : 'Find Auspicious Muhurat'}</span>
              </>
            )}
          </button>
        </section>

        {/* Summary & Filter Pills */}
        {calculationResult && (
          <section className="flex flex-col gap-3">
            {/* Metric Summary Box */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-black/45 border border-[#d4af37]/30">
              <div className="p-2 rounded-xl bg-[#041b11] border border-emerald-500/30">
                <span className="text-xs text-emerald-400 font-bold block">अति शुभ</span>
                <span className="text-xl font-extrabold text-white font-mono">
                  {calculationResult.excellentCount}
                </span>
                <span className="text-[10px] text-gray-400">सर्वोत्तम काल</span>
              </div>

              <div className="p-2 rounded-xl bg-[#1c1804] border border-amber-500/30">
                <span className="text-xs text-amber-300 font-bold block">शुभ काल</span>
                <span className="text-xl font-extrabold text-white font-mono">
                  {calculationResult.goodCount}
                </span>
                <span className="text-[10px] text-gray-400">अनुकूल समय</span>
              </div>

              <div className="p-2 rounded-xl bg-[#121212] border border-white/10">
                <span className="text-xs text-gray-300 font-bold block">कुल खिड़कियाँ</span>
                <span className="text-xl font-extrabold text-[#d4af37] font-mono">
                  {calculationResult.totalWindowsFound}
                </span>
                <span className="text-[10px] text-gray-400">समीक्षित</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'ALL', labelHi: 'सभी मुहूर्त', count: calculationResult.windows.length },
                { id: 'EXCELLENT', labelHi: '🟢 केवल अति शुभ', count: calculationResult.excellentCount },
                { id: 'GOOD', labelHi: '🟡 शुभ', count: calculationResult.goodCount },
                { id: 'MODERATE', labelHi: '⚪ मध्यम', count: calculationResult.moderateCount }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveSuitabilityFilter(f.id as any)}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    activeSuitabilityFilter === f.id
                      ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                      : 'bg-black/40 text-gray-300 border-white/10 hover:border-amber-400/40 hover:text-white'
                  }`}
                >
                  {f.labelHi} ({f.count})
                </button>
              ))}
            </div>

            {/* Windows List */}
            <div className="flex flex-col gap-3">
              {displayedWindows.length > 0 ? (
                displayedWindows.map((w) => {
                  const isExcellent = w.suitability === 'EXCELLENT';
                  const isGood = w.suitability === 'GOOD';

                  return (
                    <div
                      key={w.id}
                      className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                        isExcellent
                          ? 'bg-gradient-to-br from-[#052115] via-[#082a1b] to-[#03130c] border-emerald-400/60 shadow-[0_4px_20px_rgba(16,185,129,0.2)]'
                          : isGood
                          ? 'bg-gradient-to-br from-[#1c1603] via-[#261f05] to-[#120f02] border-[#d4af37]/45 shadow-[0_4px_18px_rgba(212,175,55,0.2)]'
                          : 'bg-black/40 border-white/15'
                      }`}
                    >
                      {/* Top Bar: Date, Badge, Rating */}
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {w.panchang.dateDisplayHindi}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isExcellent
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                            : isGood
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                            : 'bg-gray-500/20 text-gray-300 border-gray-400'
                        }`}>
                          {w.suitabilityHindi}
                        </span>
                      </div>

                      {/* Main Time Range Box */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-5 h-5 ${isExcellent ? 'text-emerald-400' : 'text-[#d4af37]'}`} />
                          <div>
                            <span className="text-lg sm:text-xl font-extrabold text-white font-mono tracking-tight">
                              {w.startTime} ➔ {w.endTime}
                            </span>
                            <span className="text-[11px] text-gray-400 block">
                              {w.durationFormatted}
                            </span>
                          </div>
                        </div>

                        {/* Choghadiya / Abhijit Tag */}
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-[#d4af37]/15 text-[#fef08a] border border-[#d4af37]/40 block">
                            {w.activeChoghadiya.nameHindi} चौघड़िया
                          </span>
                          {w.isAbhijitMuhurat && (
                            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                              ✨ अभिजित मुहूर्त
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Panchang Highlights Strip */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-300 bg-black/40 p-2.5 rounded-xl border border-white/5 mb-3">
                        <div>
                          <strong className="text-gray-400">तिथि:</strong> {w.panchang.tithi.nameHindi}
                        </div>
                        <div>
                          <strong className="text-gray-400">नक्षत्र:</strong> {w.panchang.nakshatra.nameHindi}
                        </div>
                        <div>
                          <strong className="text-gray-400">योग:</strong> {w.panchang.yoga.nameHindi}
                        </div>
                        <div>
                          <strong className="text-gray-400">राहुकाल:</strong> {w.panchang.solarTimes.rahuKaalStart} - {w.panchang.solarTimes.rahuKaalEnd}
                        </div>
                      </div>

                      {/* Action Button: View Details */}
                      <button
                        onClick={() => handleOpenWindowDetails(w)}
                        className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#fef08a] border border-[#d4af37]/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>विस्तार एवं शास्त्रीय कारण देखें</span>
                        <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 rounded-2xl bg-black/30 border border-white/10 text-center text-sm text-gray-400">
                  चयनित फिल्टर अथवा समयावधि में कोई उपयुक्त मुहूर्त नहीं मिला। कृपया तिथि सीमा अथवा फिल्टर बदलें।
                </div>
              )}
            </div>
          </section>
        )}

        {/* Safety & Non-Fatalistic Disclaimer Notice */}
        <div className="p-4 rounded-2xl bg-[#03150d] border border-emerald-500/30 text-xs text-gray-300 leading-relaxed text-center space-y-1">
          <p className="font-bold text-emerald-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>वैदिक कालशुद्धि एवं मर्यादा विधान</span>
          </p>
          <p className="text-[11px] text-gray-300">
            {calculationResult?.safetyNoticeHindi || 'मुहूर्त पारंपरिक वैदिक ज्योतिषीय सिद्धांतों पर आधारित खगोलीय समय-संकेत है। इसे किसी निश्चित सफलता अथवा सांसारिक गारंटी के रूप में न लें।'}
          </p>
          <p className="text-[10px] text-gray-500 font-mono pt-1">
            Engine: Swiss Ephemeris Standard • Lahiri Ayanamsa • Verified Rules
          </p>
        </div>
      </main>

      {/* DETAIL MODAL / DRAWER */}
      {selectedWindow && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#061810] border border-[#d4af37]/60 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fadeIn flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] block">
                  {selectedWindow.categoryTitleHindi}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {selectedWindow.panchang.dateDisplayHindi}
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-semibold">
                  समय: {selectedWindow.startTime} ➔ {selectedWindow.endTime} ({selectedWindow.durationFormatted})
                </span>
              </div>

              <button
                onClick={() => setSelectedWindow(null)}
                className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suitability & Choghadiya Box */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">शुभता श्रेणी</span>
                <span className="text-sm font-bold text-emerald-300 block mt-0.5">
                  {selectedWindow.suitabilityHindi}
                </span>
                <span className="text-[10px] text-gray-400">प्राप्तांक: {selectedWindow.score} / 100</span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-[#d4af37]/30">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">सक्रिय चौघड़िया</span>
                <span className="text-sm font-bold text-[#fef08a] block mt-0.5">
                  {selectedWindow.activeChoghadiya.nameHindi} ({selectedWindow.activeChoghadiya.periodType === 'Day' ? 'दिन' : 'रात्रि'})
                </span>
                <span className="text-[10px] text-gray-400">{selectedWindow.activeChoghadiya.significanceHindi}</span>
              </div>
            </div>

            {/* Complete Panchang Breakdown */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>पंचांग अंग विवरण (Panchang Details)</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-200">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-gray-400 block text-[10px]">१. तिथि</span>
                  <span className="font-semibold text-white">{selectedWindow.panchang.tithi.nameHindi}</span>
                  <span className="text-[10px] text-gray-400 block">{selectedWindow.panchang.tithi.groupHindi}</span>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-gray-400 block text-[10px]">२. वार</span>
                  <span className="font-semibold text-white">{selectedWindow.panchang.vara.nameHindi}</span>
                  <span className="text-[10px] text-gray-400 block">स्वामी: {selectedWindow.panchang.vara.lordHindi}</span>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-gray-400 block text-[10px]">३. नक्षत्र</span>
                  <span className="font-semibold text-white">{selectedWindow.panchang.nakshatra.nameHindi}</span>
                  <span className="text-[10px] text-gray-400 block">{selectedWindow.panchang.nakshatra.categoryHindi}</span>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-gray-400 block text-[10px]">४. योग</span>
                  <span className="font-semibold text-white">{selectedWindow.panchang.yoga.nameHindi}</span>
                  <span className="text-[10px] text-gray-400 block">{selectedWindow.panchang.yoga.qualityHindi}</span>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-white/5 col-span-2">
                  <span className="text-gray-400 block text-[10px]">५. करण</span>
                  <span className="font-semibold text-white">{selectedWindow.panchang.karana.nameHindi}</span>
                  <span className="text-[10px] text-gray-400 block">{selectedWindow.panchang.karana.qualityHindi}</span>
                </div>
              </div>
            </div>

            {/* Solar Times & Rahu Kaal */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-gray-300">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>सूर्य एवं कालखंड (Solar & Shadow Timing)</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>• सूर्योदय: <strong>{selectedWindow.panchang.solarTimes.sunrise}</strong></div>
                <div>• सूर्यास्त: <strong>{selectedWindow.panchang.solarTimes.sunset}</strong></div>
                <div>• मध्याह्न (Noon): <strong>{selectedWindow.panchang.solarTimes.solarNoon}</strong></div>
                <div>• अभिजित काल: <strong>{selectedWindow.panchang.solarTimes.abhijitStart} - {selectedWindow.panchang.solarTimes.abhijitEnd}</strong></div>
                <div className="col-span-2 pt-1 border-t border-white/10 text-rose-300">
                  • राहुकाल (त्याज्य): <strong>{selectedWindow.panchang.solarTimes.rahuKaalStart} - {selectedWindow.panchang.solarTimes.rahuKaalEnd}</strong>
                </div>
              </div>
            </div>

            {/* Reasons & Shastra Principles */}
            <div className="flex flex-col gap-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                ✓ यह समय क्यों अनुकूल है? (Reasons)
              </h4>
              <ul className="space-y-1 text-gray-200">
                {selectedWindow.reasonsHindi.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cautions if any */}
            {selectedWindow.cautionsHindi.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200">
                <span className="font-bold block mb-1">⚠️ शास्त्रीय सावधानी एवं निर्देश:</span>
                <ul className="space-y-1">
                  {selectedWindow.cautionsHindi.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Classical Rules Lineage */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-gray-400 font-mono">
              <span className="font-bold text-[#d4af37] block font-sans text-xs mb-1">
                📜 शास्त्रीय ग्रंथ प्रमाण (Classical Rule Lineage):
              </span>
              {selectedWindow.rulesApplied.map((rule, idx) => (
                <div key={idx}>• {rule}</div>
              ))}
            </div>

            {/* Actionable Recommendation */}
            <div className="p-3 rounded-xl bg-[#041a10] border border-emerald-500/30 text-xs text-emerald-200">
              <span className="font-bold block text-white mb-0.5">अनुशंसित कार्य-दिशा:</span>
              <p>{selectedWindow.recommendedActionHindi}</p>
            </div>

            {/* "यह समय क्यों?" Explainability Button */}
            {!whyExplanation && (
              <button
                onClick={() => handleRequestWhyExplanation(selectedWindow)}
                disabled={isWhyLoading}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37]/20 via-[#d4af37]/35 to-[#d4af37]/20 border border-[#d4af37] text-[#fef08a] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#d4af37]/30 transition-all cursor-pointer disabled:opacity-60"
              >
                {isWhyLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
                    <span>शास्त्रीय विश्लेषण संकलित हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>💡 यह समय क्यों? (Detailed Shastra Explanation)</span>
                  </>
                )}
              </button>
            )}

            {/* Explanation Display */}
            {whyExplanation && (
              <div className="p-4 rounded-2xl bg-black/60 border border-[#d4af37]/50 text-xs leading-relaxed space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-[#fef08a] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                    <span>शास्त्रीय मुहूर्त व्याख्या</span>
                  </span>
                  <button
                    onClick={() => handleCopy(whyExplanation.text, 'why')}
                    className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-[#d4af37] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'why' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'why' ? 'कॉपी हुआ' : 'कॉपी'}</span>
                  </button>
                </div>
                <div className="whitespace-pre-line text-gray-200 text-xs leading-relaxed">
                  {whyExplanation.text}
                </div>
                <span className="text-[10px] text-gray-500 font-mono block pt-1">
                  Source: {whyExplanation.source === 'AI' ? 'JeevanDarpan AI Jyotish Scholar (Downstream Proxy)' : 'Vedic Shastra Deterministic Rules'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOCATION SELECTOR MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#061810] border border-[#d4af37]/60 rounded-3xl p-5 flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                <span>स्थान का चयन करें</span>
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="min-h-[44px] min-w-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              मुहूर्त में सूर्योदय, सूर्यास्त और चौघड़िया स्थानीय अक्षांश-देशांतर पर निर्भर करते हैं:
            </p>

            {/* City Presets */}
            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
              {PRESET_CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setLocationName(c.name);
                    setLatitude(c.lat);
                    setLongitude(c.lon);
                    setShowLocationModal(false);
                    if (showToast) showToast(`स्थान अपडेट हुआ: ${c.name}`);
                  }}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                    locationName === c.name
                      ? 'bg-[#d4af37]/25 border-[#d4af37] text-white font-bold'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/30'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-[10px] text-gray-400">({c.lat.toFixed(2)}°, {c.lon.toFixed(2)}°)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
