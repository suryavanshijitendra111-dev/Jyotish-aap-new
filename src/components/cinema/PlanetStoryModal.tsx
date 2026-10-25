import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  Square,
  Sparkles,
  Info,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  JyotishCinemaEngine,
  NavagrahaKey,
  ALL_NAVAGRAHAS,
  NAVAGRAHA_PROFILES,
  VerifiedCinemaPlanetData,
  CinemaScriptResult
} from '../../services/cinema/jyotishCinemaEngine';
import { JyotishCinemaScene } from './JyotishCinemaScene';
import { SpeechEngine, SpeechState, SpeechSpeedPreset } from '../../services/companion/speechEngine';
import { LanguageCode } from '../../i18n/types';

interface PlanetStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  planetKey: string;
  masterKundliData: any;
  analysisData?: any;
  language?: LanguageCode;
  onSelectHouse?: (houseNumber: number) => void;
}

export const PlanetStoryModal: React.FC<PlanetStoryModalProps> = ({
  isOpen,
  onClose,
  planetKey: initialPlanetKey,
  masterKundliData,
  analysisData,
  language = 'hi',
  onSelectHouse
}) => {
  const [selectedPlanetKey, setSelectedPlanetKey] = useState<NavagrahaKey>(() =>
    JyotishCinemaEngine.normalizeKey(initialPlanetKey)
  );

  // Sync with prop when opened
  useEffect(() => {
    if (initialPlanetKey) {
      setSelectedPlanetKey(JyotishCinemaEngine.normalizeKey(initialPlanetKey));
    }
  }, [initialPlanetKey]);

  // Speech State
  const [speechState, setSpeechState] = useState<SpeechState>('stopped');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [totalSentences, setTotalSentences] = useState<number>(0);
  const [speedPreset, setSpeedPreset] = useState<SpeechSpeedPreset>(() => SpeechEngine.getSpeedPreset());

  const isHindi = language === 'hi' || (language as string) === 'Hindi' || language === 'sa';

  // Extract Verified Astronomical & Astrological Data
  const verifiedData: VerifiedCinemaPlanetData = useMemo(() => {
    return JyotishCinemaEngine.extractVerifiedData(
      selectedPlanetKey,
      masterKundliData,
      analysisData,
      language
    );
  }, [selectedPlanetKey, masterKundliData, analysisData, language]);

  // Generate Personalized Cinema Script
  const scriptResult: CinemaScriptResult = useMemo(() => {
    return JyotishCinemaEngine.buildScript(verifiedData, language);
  }, [verifiedData, language]);

  // Stop speech when modal closes or unmounts
  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, []);

  // When selected planet changes, stop current speech and reset index
  useEffect(() => {
    SpeechEngine.stop();
    setSpeechState('stopped');
    setCurrentSentenceIndex(0);
  }, [selectedPlanetKey]);

  // Speech Controls
  const handlePlayVoice = useCallback(() => {
    if (speechState === 'paused') {
      SpeechEngine.resume();
      setSpeechState('playing');
      return;
    }

    setTotalSentences(scriptResult.sentences.length);
    SpeechEngine.speak(scriptResult.spokenText, language, {
      profile: 'planet',
      planetKey: selectedPlanetKey,
      speedPreset,
      onStateChange: (newState) => {
        setSpeechState(newState);
      },
      onSentenceChange: (curr, total) => {
        setCurrentSentenceIndex(curr - 1);
        setTotalSentences(total);
      }
    });
  }, [scriptResult, language, selectedPlanetKey, speedPreset, speechState]);

  const handlePauseVoice = () => {
    SpeechEngine.pause();
    setSpeechState('paused');
  };

  const handleStopVoice = () => {
    SpeechEngine.stop();
    setSpeechState('stopped');
    setCurrentSentenceIndex(0);
  };

  const handleCycleSpeed = () => {
    const nextSpeed: SpeechSpeedPreset =
      speedPreset === 'slow' ? 'normal' : speedPreset === 'normal' ? 'fast' : 'slow';
    setSpeedPreset(nextSpeed);
    SpeechEngine.setSpeedPreset(nextSpeed);

    // If currently playing, restart smoothly at new rate
    if (speechState === 'playing') {
      handleStopVoice();
      setTimeout(() => {
        SpeechEngine.speak(scriptResult.spokenText, language, {
          profile: 'planet',
          planetKey: selectedPlanetKey,
          speedPreset: nextSpeed,
          onStateChange: setSpeechState,
          onSentenceChange: (curr, total) => {
            setCurrentSentenceIndex(curr - 1);
            setTotalSentences(total);
          }
        });
      }, 100);
    }
  };

  const handleHouseClick = () => {
    if (verifiedData.houseNum && onSelectHouse) {
      onSelectHouse(verifiedData.houseNum);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="planet-story-cinema-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="planet-story-title"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#091811] via-[#05110c] to-[#020805] border border-[#d4af37]/50 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.2)] overflow-hidden text-gray-100">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#d4af37]/30 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37]/30 to-[#10b981]/20 border border-[#d4af37]/60 text-lg shadow-[0_0_12px_rgba(212,175,55,0.4)]">
              {verifiedData.symbol}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="planet-story-title" className="text-base sm:text-lg font-bold text-[#fef3c7] tracking-wide">
                  {isHindi ? `${verifiedData.nameHi} — ग्रह कथा (Jyotish Cinema)` : `${verifiedData.nameEn} — Planet Story`}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#fae19c]">
                  {verifiedData.sanskritName}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-400/90 flex items-center gap-1.5">
                <span>{verifiedData.profile.element}</span>
                <span>•</span>
                <span>{verifiedData.topicTagline}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="close-planet-story-modal-btn"
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 9 NAVAGRAHAS QUICK SWITCHER BAR */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 overflow-x-auto bg-black/60 border-b border-gray-800/80 scrollbar-none">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            {isHindi ? 'नवग्रह:' : 'Planets:'}
          </span>
          {ALL_NAVAGRAHAS.map((pKey) => {
            const pProfile = NAVAGRAHA_PROFILES[pKey];
            const isSelected = pKey === selectedPlanetKey;
            return (
              <button
                key={pKey}
                onClick={() => setSelectedPlanetKey(pKey)}
                id={`cinema-navagraha-btn-${pKey}`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer min-h-[36px] ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#d4af37]/30 to-[#10b981]/30 border border-[#d4af37] text-[#fef08a] shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/10'
                }`}
                title={isHindi ? pProfile.hindiName : pProfile.englishName}
              >
                <span className="text-xs">{pProfile.symbol}</span>
                <span>{isHindi ? pProfile.hindiName : pProfile.englishName}</span>
              </button>
            );
          })}
        </div>

        {/* SCROLLABLE MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
          
          {/* TOP SECTION: 3D CINEMA SCENE & REAL-TIME SPEECH CONTROLS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* 3D Celestial Scene (5 cols on large screen) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <JyotishCinemaScene
                profile={verifiedData.profile}
                isSpeaking={speechState === 'playing'}
                language={language}
              />
              <p className="mt-2 text-[11px] text-gray-400/90 text-center flex items-center gap-1">
                <span>{isHindi ? '3D में घुमाएँ' : 'Drag to rotate'}</span>
                <span>•</span>
                <span>{verifiedData.profile.atmosphereDescriptionHi}</span>
              </p>
            </div>

            {/* Voice Narration & Audio Controls (7 cols on large screen) */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
              
              {/* Dynamic Spoken Voice Controls Panel */}
              <div className="p-4 rounded-2xl bg-black/50 border border-[#d4af37]/40 shadow-inner space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${speechState === 'playing' ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`} />
                    <span className="text-xs font-semibold text-[#fef3c7] tracking-wider uppercase">
                      {isHindi ? 'ग्रह वाणी (Planet Voice Narration)' : 'Spiritual Voice Narration'}
                    </span>
                  </div>

                  {/* Speed Preset Selector */}
                  <button
                    onClick={handleCycleSpeed}
                    id="cinema-voice-speed-btn"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-[#d4af37]/50 text-[11px] text-gray-300 cursor-pointer min-h-[32px]"
                    title={isHindi ? 'गति बदलें' : 'Change Speed'}
                  >
                    <Gauge className="w-3 h-3 text-[#d4af37]" />
                    <span>
                      {speedPreset === 'slow'
                        ? (isHindi ? 'धीमी (0.76x)' : 'Slow')
                        : speedPreset === 'fast'
                        ? (isHindi ? 'तेज़ (1.05x)' : 'Fast')
                        : (isHindi ? 'सामान्य (0.92x)' : 'Normal')}
                    </span>
                  </button>
                </div>

                {/* Spoken Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {speechState === 'playing' ? (
                    <button
                      onClick={handlePauseVoice}
                      id="cinema-pause-voice-btn"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/60 text-amber-200 font-medium text-xs sm:text-sm hover:bg-amber-500/30 transition-all cursor-pointer min-h-[44px]"
                    >
                      <Pause className="w-4 h-4 fill-amber-200" />
                      <span>{isHindi ? 'विराम (Pause)' : 'Pause Narration'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePlayVoice}
                      id="cinema-play-voice-btn"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border border-emerald-400/60 text-white font-medium text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer min-h-[44px]"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>{speechState === 'paused' ? (isHindi ? 'पुनः चलाएँ (Resume)' : 'Resume') : (isHindi ? 'कथा सुनें (Listen to Story)' : 'Listen to Planet')}</span>
                    </button>
                  )}

                  {speechState !== 'stopped' && (
                    <button
                      onClick={handleStopVoice}
                      id="cinema-stop-voice-btn"
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs sm:text-sm hover:bg-red-900/50 transition-all cursor-pointer min-h-[44px]"
                    >
                      <Square className="w-3.5 h-3.5 fill-red-300" />
                      <span>{isHindi ? 'रोकें' : 'Stop'}</span>
                    </button>
                  )}
                </div>

                {/* Subtitle / Karaoke Active Sentence Display */}
                <div className="p-3 rounded-xl bg-[#030d07] border border-emerald-900/60 min-h-[70px] flex flex-col justify-center">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" />
                      {isHindi ? 'सजीव उपशीर्षक (Live Voice Subtitle)' : 'Live Subtitles'}
                    </span>
                    {totalSentences > 0 && (
                      <span className="text-[#d4af37] font-mono">
                        {currentSentenceIndex + 1} / {totalSentences}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200/95 font-medium leading-relaxed italic">
                    {speechState !== 'stopped' && scriptResult.sentences[currentSentenceIndex]
                      ? `"${scriptResult.sentences[currentSentenceIndex]}"`
                      : (isHindi
                        ? `"${scriptResult.sentences[0]}"`
                        : `"${scriptResult.sentences[0]}"`)}
                  </p>
                </div>
              </div>

              {/* VISUAL RELATIONSHIP CONNECTOR: PLANET -> HOUSE -> SIGN */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-black/80 via-[#0a2318]/60 to-black/80 border border-[#d4af37]/40 shadow-md">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3 h-3 text-[#d4af37]" />
                    {isHindi ? 'खगोलीय संबंध सूत्र (Visual Relationship Connector)' : 'Visual Planetary Chain'}
                  </span>
                  <span className="text-[9px] text-[#d4af37]">
                    {isHindi ? 'कुंडली मूल स्थिति' : 'Kundli Origin'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Step 1: Planet */}
                  <div className="flex-1 min-w-[90px] p-2 rounded-xl bg-black/60 border border-[#d4af37]/50 text-center">
                    <div className="text-[10px] text-gray-400">{isHindi ? 'ग्रह' : 'Planet'}</div>
                    <div className="font-bold text-[#fef08a]">{verifiedData.nameHi}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">{verifiedData.degreeFormatted}</div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#d4af37] shrink-0" />

                  {/* Step 2: House */}
                  <button
                    onClick={handleHouseClick}
                    className="flex-1 min-w-[90px] p-2 rounded-xl bg-black/60 border border-emerald-500/50 text-center hover:bg-emerald-950/40 transition-all cursor-pointer group"
                    title={isHindi ? 'कुंडली में इस भाव को देखें' : 'View this house in chart'}
                  >
                    <div className="text-[10px] text-gray-400 group-hover:text-emerald-300">
                      {isHindi ? 'स्थित भाव' : 'House'}
                    </div>
                    <div className="font-bold text-emerald-200 group-hover:underline">
                      {verifiedData.houseLabel}
                    </div>
                    <div className="text-[9px] text-gray-400">{verifiedData.houseFullHi}</div>
                  </button>

                  <ArrowRight className="w-4 h-4 text-[#d4af37] shrink-0" />

                  {/* Step 3: Sign & Sign Lord */}
                  <div className="flex-1 min-w-[90px] p-2 rounded-xl bg-black/60 border border-[#d4af37]/50 text-center">
                    <div className="text-[10px] text-gray-400">{isHindi ? 'राशि' : 'Sign'}</div>
                    <div className="font-bold text-[#fef08a]">{verifiedData.rashiNameHi}</div>
                    <div className="text-[9px] text-gray-400">
                      {isHindi ? `स्वामी: ${verifiedData.rashiLordHi}` : `Lord: ${verifiedData.rashiLord}`}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* VERIFIED ASTRONOMICAL DATA GRID (Strictly verified data, no invented values) */}
          <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-xs sm:text-sm font-semibold text-[#fef3c7] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isHindi ? 'प्रमाणित खगोलीय व ज्योतिषीय गणनाएँ (Verified Astronomical Data)' : 'Verified Astronomical & Astrological Data'}</span>
              </h3>
              <span className="text-[10px] text-emerald-400/90 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{isHindi ? 'खगोलीय गणना सत्यापित' : 'Calculated'}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
              
              {/* 1. House */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'भाव (House)' : 'House'}</span>
                <span className="font-semibold text-gray-200">{verifiedData.houseLabel}</span>
              </div>

              {/* 2. Rashi */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'राशि (Sign)' : 'Sign'}</span>
                <span className="font-semibold text-gray-200">{verifiedData.rashiNameHi}</span>
              </div>

              {/* 3. Degree */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'अंश (Exact Degree)' : 'Exact Degree'}</span>
                <span className="font-semibold text-emerald-300 font-mono">{verifiedData.degreeFormatted}</span>
              </div>

              {/* 4. Nakshatra & Pada */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'नक्षत्र व चरण' : 'Nakshatra & Pada'}</span>
                <span className="font-semibold text-gray-200">
                  {verifiedData.nakshatraNameHi}
                  {verifiedData.pada ? ` (${isHindi ? 'चरण' : 'Pada'} ${verifiedData.pada})` : ''}
                </span>
              </div>

              {/* 5. Nakshatra Lord */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'नक्षत्र स्वामी' : 'Nakshatra Lord'}</span>
                <span className="font-semibold text-gray-200">{verifiedData.nakshatraLordHi}</span>
              </div>

              {/* 6. Motion (Vakri/Margi) */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'गति स्थिति' : 'Motion'}</span>
                <span className={`font-semibold ${verifiedData.isRetrograde ? 'text-amber-400' : 'text-gray-200'}`}>
                  {verifiedData.motionStatus}
                </span>
              </div>

              {/* 7. Dignity */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'खगोलीय गरिमा (Dignity)' : 'Dignity'}</span>
                <span className="font-semibold text-[#fef08a]">{verifiedData.dignityHi}</span>
              </div>

              {/* 8. Combust & Vargottama */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'विशेष योग' : 'Special Status'}</span>
                <span className="font-semibold text-gray-200">
                  {verifiedData.vargottama ? 'वर्गोत्तम (Vargottama) ' : ''}
                  {verifiedData.isCombust ? 'अस्त (Combust)' : (!verifiedData.vargottama ? 'सामान्य' : '')}
                </span>
              </div>

              {/* 9. Conjunctions */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 col-span-2">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'युति (Conjunctions in House)' : 'Conjunctions'}</span>
                <span className="font-semibold text-gray-200">
                  {verifiedData.conjunctions.length > 0 ? verifiedData.conjunctions.join(', ') : (isHindi ? 'कोई युति नहीं' : 'No Conjunction')}
                </span>
              </div>

              {/* 10. Dasha Context */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 col-span-2">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'दशा संबंध (Vimshottari Dasha)' : 'Dasha Timing'}</span>
                <span className="font-semibold text-emerald-300">
                  {isHindi ? verifiedData.dashaContext.summaryHi : verifiedData.dashaContext.summaryEn}
                </span>
              </div>

            </div>
          </div>

          {/* SCRIPT PARAGRAPHS (Personalized Planet Speaks Story) */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-[#d4af37] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#d4af37]" />
              <span>{isHindi ? 'ग्रह द्वारा व्यक्त पूर्ण आख्यान (Planet Narration Script)' : 'Full Planet Narration Script'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scriptResult.paragraphs.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-black/40 border border-gray-800/80 hover:border-[#d4af37]/40 transition-all space-y-1.5"
                >
                  <div className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-[#d4af37]" />
                    <span>{p.title}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-[#d4af37]/30 bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Info className="w-4 h-4 text-[#d4af37]" />
            <span>
              {isHindi
                ? 'यह व्याख्या पूर्णतः प्रामाणिक खगोलीय गणनाओं व पारंपरिक ज्योतिषीय नियमों पर आधारित है।'
                : 'Educational narration strictly derived from verified astronomical calculations.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {verifiedData.houseNum && onSelectHouse && (
              <button
                onClick={handleHouseClick}
                id="cinema-view-house-btn"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 hover:bg-emerald-900/70 text-emerald-200 text-xs font-medium transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5"
              >
                <span>{isHindi ? `भाव ${verifiedData.houseNum} देखें` : `View House ${verifiedData.houseNum}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              id="cinema-close-btn"
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 text-xs font-medium transition-all cursor-pointer min-h-[36px]"
            >
              {isHindi ? 'बंद करें (Close)' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
