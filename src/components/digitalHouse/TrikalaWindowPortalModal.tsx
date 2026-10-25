/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PHASE 4.2
 * जीवन की तीन खिड़कियाँ • IMMERSIVE PAST • PRESENT • FUTURE EXPERIENCE
 * 
 * Architectural portal into the three temporal dimensions of the Digital Life House:
 * 1. अतीत (Past World) — Ancient library, amber parchment, calm contemplation, read-only dasha past
 * 2. वर्तमान (Present World) — Vibrant morning dawn, active dasha & progress, daily aphorism, active chambers
 * 3. भविष्य (Future World) — Vast cosmic observatory, verified timing windows, transit alignments, Evidence Ledger
 * 
 * STRICT INVARIANT:
 * Zero calculation modifications. 100% read-only orchestration of verified existing data.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Calendar,
  Eye,
  RotateCcw,
  BookOpen,
  Volume2,
  VolumeX,
  ChevronRight,
  Sun,
  Moon,
  Activity,
  Layers,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Feather,
  Info
} from 'lucide-react';
import { TrikalaWindowId, ChamberId } from '../../types/digitalHouse';
import { MasterKundliData } from '../../types/kundli';
import { JeevanPragyaService, JeevanPragyaHeartData } from '../../services/digitalHouse/jeevanPragyaService';
import { trikalaVoiceService } from '../../services/digitalHouse/trikalaVoiceService';
import { houseAudioService } from '../../services/digitalHouse/audioService';
import { useTranslation } from '../../i18n';

interface TrikalaWindowPortalModalProps {
  windowId: TrikalaWindowId;
  masterData: MasterKundliData | null;
  soundMuted: boolean;
  onClose: () => void;
  onBackToCourtyard: () => void;
  onOpenFullPragya: (tab: 'past' | 'present' | 'future') => void;
  onOpenEvidenceLedger: () => void;
  onFlyToChamber: (chamberId: ChamberId) => void;
  onEnterModule: (view: string) => void;
  onSwitchWindow?: (w: TrikalaWindowId) => void;
}

export const TrikalaWindowPortalModal: React.FC<TrikalaWindowPortalModalProps> = ({
  windowId,
  masterData,
  soundMuted,
  onClose,
  onBackToCourtyard,
  onOpenFullPragya,
  onOpenEvidenceLedger,
  onFlyToChamber,
  onEnterModule,
  onSwitchWindow
}) => {
  const { t } = useTranslation();
  const [activeWorld, setActiveWorld] = useState<TrikalaWindowId>(windowId);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);

  // Sync if prop changes externally
  useEffect(() => {
    setActiveWorld(windowId);
  }, [windowId]);

  // Extract verified read-only Pragya heart data
  const pragyaData: JeevanPragyaHeartData = useMemo(() => {
    return JeevanPragyaService.extractPragyaHeart(masterData);
  }, [masterData]);

  const { trikala, dailyPragya, activeRulingChambers, evidenceLedger } = pragyaData;

  // Soundscape & Voice narration upon entering or switching worlds
  useEffect(() => {
    if (!soundMuted) {
      if (activeWorld === 'window_past') {
        houseAudioService.playPastAtmosphereSound();
      } else if (activeWorld === 'window_present') {
        houseAudioService.playPresentAtmosphereSound();
      } else if (activeWorld === 'window_future') {
        houseAudioService.playFutureAtmosphereSound();
      }
      trikalaVoiceService.speakWindowPrompt(activeWorld, false);
      setIsVoiceSpeaking(true);
      const timer = setTimeout(() => setIsVoiceSpeaking(false), 5000);
      return () => {
        clearTimeout(timer);
        trikalaVoiceService.stop();
      };
    } else {
      trikalaVoiceService.stop();
    }
  }, [activeWorld, soundMuted]);

  // Handle world switching
  const handleSwitchWorld = useCallback((newWorld: TrikalaWindowId) => {
    setActiveWorld(newWorld);
    if (onSwitchWindow) {
      onSwitchWindow(newWorld);
    }
  }, [onSwitchWindow]);

  // Manual replay voice
  const handleReplayVoice = useCallback(() => {
    trikalaVoiceService.speakWindowPrompt(activeWorld, false);
    setIsVoiceSpeaking(true);
    setTimeout(() => setIsVoiceSpeaking(false), 5000);
  }, [activeWorld]);

  // World visual configurations
  const worldConfig = useMemo(() => {
    switch (activeWorld) {
      case 'window_past':
        return {
          id: 'window_past' as const,
          nameHi: 'अतीत',
          nameEn: 'Past Realm',
          subtitleHi: 'पारंपरिक जीवन-संकेत • संचित अनुभव एवं कार्मिक जड़ें',
          descriptionHi: 'प्राचीन ग्रंथालय की भांति शांत वातावरण, जहां जीवन के पूर्व अध्यायों के अनुभव संचित हैं।',
          badgeHi: 'पारंपरिक ज्योतिषीय / आध्यात्मिक व्याख्या',
          themeColor: '#f59e0b',
          glowColor: 'rgba(245, 158, 11, 0.35)',
          borderColor: 'border-amber-500/40',
          bgGradient: 'from-[#1a0e04]/98 via-[#100903]/98 to-[#070503]/98',
          cardBg: 'bg-[#1e1308]/80 border-amber-500/25',
          bannerBg: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
          accentText: 'text-amber-300',
          accentBg: 'bg-amber-500/15',
          icon: Clock
        };
      case 'window_present':
        return {
          id: 'window_present' as const,
          nameHi: 'वर्तमान',
          nameEn: 'Present Realm',
          subtitleHi: 'आज के जीवन के संकेत • सक्रिय दशा एवं कर्म-क्षेत्र',
          descriptionHi: 'स्वर्ण प्रभात की ऊर्जा, बहता जल और सक्रिय चेतना, जहां आज का निर्णय और कर्म साकार होता है।',
          badgeHi: 'सक्रिय खगोलीय संरेखण एवं कर्म-क्षेत्र',
          themeColor: '#10b981',
          glowColor: 'rgba(16, 185, 129, 0.35)',
          borderColor: 'border-emerald-500/50',
          bgGradient: 'from-[#042416]/98 via-[#02170e]/98 to-[#010c07]/98',
          cardBg: 'bg-[#062b1a]/80 border-emerald-500/30',
          bannerBg: 'bg-emerald-950/40 border-emerald-500/35 text-emerald-200',
          accentText: 'text-emerald-300',
          accentBg: 'bg-emerald-500/15',
          icon: Flame
        };
      case 'window_future':
        return {
          id: 'window_future' as const,
          nameHi: 'भविष्य',
          nameEn: 'Future Realm',
          subtitleHi: 'महत्वपूर्ण समय-खिड़कियाँ • गोचर संरेखण एवं संभावनाओं का क्षितिज',
          descriptionHi: 'विशाल खगोलीय वेधशाला एवं तारों भरा आकाश, जहां आगामी समय-खिड़कियों का संरेखण दिखाई देता है।',
          badgeHi: 'आगामी खगोलीय समय-खिड़कियाँ (Timing Windows)',
          themeColor: '#38bdf8',
          glowColor: 'rgba(56, 189, 248, 0.35)',
          borderColor: 'border-cyan-500/50',
          bgGradient: 'from-[#021f2d]/98 via-[#02131e]/98 to-[#010910]/98',
          cardBg: 'bg-[#042537]/80 border-cyan-500/30',
          bannerBg: 'bg-cyan-950/40 border-cyan-500/35 text-cyan-200',
          accentText: 'text-cyan-300',
          accentBg: 'bg-cyan-500/15',
          icon: Sparkles
        };
    }
  }, [activeWorld]);

  const WorldIcon = worldConfig.icon;

  return (
    <div
      role="dialog"
      aria-label={`${worldConfig.nameHi} - ${worldConfig.subtitleHi}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-gradient-to-b ${worldConfig.bgGradient} border ${worldConfig.borderColor} rounded-2xl sm:rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.95)] text-white overflow-hidden transition-all duration-300`}
      >
        {/* Top Ornate Luminous Bar */}
        <div
          className="h-1.5 w-full shrink-0 transition-colors duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${worldConfig.themeColor}, transparent)`
          }}
        />

        {/* Grand Header & Architectural World Switcher */}
        <div className="px-4 sm:px-6 py-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 shrink-0">
          
          {/* Left: Window Identity */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border border-white/20 shrink-0 transition-all duration-300`}
              style={{
                backgroundColor: `${worldConfig.themeColor}22`,
                color: worldConfig.themeColor,
                boxShadow: `0 0 25px ${worldConfig.glowColor}`
              }}
            >
              <WorldIcon className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono" style={{ color: worldConfig.themeColor }}>
                  जीवन की तीन खिड़कियाँ • THREE WINDOWS
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                  आंतरिक अनुभव
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                <span>{worldConfig.nameHi}</span>
                <span className="text-gray-400 font-serif font-normal text-sm sm:text-base">
                  • {worldConfig.nameEn}
                </span>
              </h1>
              <p className="text-xs text-gray-300 line-clamp-1">
                {worldConfig.subtitleHi}
              </p>
            </div>
          </div>

          {/* Right: Architectural Three-World Switcher & Escape Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            
            {/* 3 Worlds Switcher Bar */}
            <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/15">
              <button
                onClick={() => handleSwitchWorld('window_past')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeWorld === 'window_past'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="अतीत की खिड़की में जाएं"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>अतीत</span>
              </button>

              <button
                onClick={() => handleSwitchWorld('window_present')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeWorld === 'window_present'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="वर्तमान की खिड़की में जाएं"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>वर्तमान</span>
              </button>

              <button
                onClick={() => handleSwitchWorld('window_future')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeWorld === 'window_future'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="भविष्य की खिड़की में जाएं"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>भविष्य</span>
              </button>
            </div>

            {/* Voice Prompt Replay */}
            <button
              onClick={handleReplayVoice}
              className={`p-2 rounded-xl border border-white/15 text-gray-300 hover:text-white transition-all cursor-pointer ${
                isVoiceSpeaking ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse' : 'bg-white/5 hover:bg-white/10'
              }`}
              title="मार्गदर्शन वाणी पुनः सुनें (Replay Voice Guidance)"
              aria-label="मार्गदर्शन वाणी पुनः सुनें"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Back to Courtyard Escape Button */}
            <button
              onClick={onBackToCourtyard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-gray-200 transition-all cursor-pointer"
              title="वापस आंगन में (Back to Courtyard)"
              aria-label="वापस आंगन में"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">आंगन में</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="बंद करें (Close)"
              aria-label="बंद करें"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Data Boundary Transparency Tagline */}
        <div className="px-4 sm:px-6 py-2 bg-black/50 border-b border-white/10 flex items-center justify-between gap-2 text-[11px] text-gray-300 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong className="text-emerald-300">[खगोलीय गणना]</strong> स्विस एफेमेरिस व विंशोत्तरी गणित · <strong className="text-[#d4af37]">[परंपरागत व्याख्या]</strong> दार्शनिक चिंतन एवं कर्म प्रज्ञा
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-400 shrink-0 hidden sm:inline">
            गैर-भाग्यवादी (Non-fatalistic)
          </span>
        </div>

        {/* Scrollable Rich Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar text-xs sm:text-sm">

          {/* ========================================================================= */}
          {/* 1. PAST WORLD — अतीत (Ancient Library / Calm Contemplation)               */}
          {/* ========================================================================= */}
          {activeWorld === 'window_past' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* World Intro Note */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-300 text-sm">
                    अतीत का शांत ग्रंथालय • संचित अनुभव एवं पूर्व संस्कार
                  </p>
                  <p className="text-gray-300 leading-relaxed text-xs">
                    यह वातावरण प्राचीन ग्रंथालय की भांति शांत है। यहां आपके जीवन के बीते काल-खंड केवल खगोलीय गणनाओं (महादशाओं) के आधार पर संरक्षित हैं। 
                    इसका उद्देश्य किसी निश्चित घटना का दावा करना नहीं, अपितु यह समझना है कि किस प्रकार बीते अनुभवों ने आपके आत्मबल को गढ़ा है।
                  </p>
                </div>
              </div>

              {/* Section 1: जीवन-पैटर्न (Life Patterns & Karmic Foundations) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>सेक्शन 1: जीवन-पैटर्न (Life Patterns)</span>
                  </h3>
                  <span className="text-[10px] text-amber-400 font-mono">
                    [परंपरागत व्याख्या]
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-[#1b1006] border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <Feather className="w-4 h-4" />
                      <span>कठिनाइयों से प्राप्त आंतरिक दृढ़ता</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      पारंपरिक दृष्टिकोण के अनुसार, बीते समय में आए अवरोधों ने आपकी सहनशीलता और अंतर्ज्ञान को परिपक्व किया है। भूतकाल कोई भार नहीं, अपितु प्रज्ञा का आधार है।
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1b1006] border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <HeartHandshake className="w-4 h-4" />
                      <span>संबंधों एवं कर्तव्यों की समझ</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      विभिन्न जीवन पर्वों में निभाए गए दायित्वों ने आपके विवेक को निखारा है। अनुभव सिखाते हैं कि निष्काम भाव से किया गया कर्म ही स्थायी शांति देता है।
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: दशा-आधारित अतीत (Dasha-Based Past Timelines — Strictly Read-Only) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>सेक्शन 2: दशा-आधारित अतीत (Dasha-Based Past Timelines)</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    [खगोलीय गणना: विंशोत्तरी दशा गणित]
                  </span>
                </div>

                <div className="space-y-3">
                  {trikala.past.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#140c04] border border-amber-500/30 hover:border-amber-400/60 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <h4 className="text-sm font-bold text-white">
                            {item.periodTitle}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                            {item.planetHindi}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.startDate} से {item.endDate}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                        <p className="text-xs font-semibold text-amber-200">
                          कार्मिक विषय: {item.karmicThemeHindi}
                        </p>
                        <p className="text-[11px] text-gray-300 italic border-l-2 border-amber-500/40 pl-2">
                          "{item.keyWisdomHindi}"
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-400 pt-1 border-t border-amber-500/15">
                        <span className="font-mono text-emerald-400">
                          आधार: {item.dataBoundary?.calculatedTiming.engine || 'Vimshottari Dasha Engine'}
                        </span>
                        <span className="text-gray-300">
                          स्वरूप: {item.dataBoundary?.reflectiveGuidance.tradition || 'पूर्व संस्कार एवं आत्म विकास'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: परंपरागत संकेत (Traditional Signals & Ethical Disclaimers) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>सेक्शन 3: परंपरागत संकेत (Traditional Signals)</span>
                  </h3>
                  <span className="text-[10px] text-amber-400 font-mono">
                    [परंपरागत व्याख्या]
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#160d05] border border-amber-500/25 space-y-3">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    वैदिक ज्योतिष में जन्म नक्षत्र व प्रारंभिक दशा को केवल चेतना के स्वभावगत रुझान (संस्कार) का प्रतीक माना गया है।
                    यह कोई पूर्वजन्म की ऐतिहासिक घटना या अंधविश्वास नहीं है, अपितु यह संकेत है कि किस प्रकार आरंभिक वातावरण ने जीवन की नींव रखी।
                  </p>

                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>स्पष्ट वैज्ञानिक व दार्शनिक मर्यादा:</strong> "यह घटना निश्चित रूप से हुई थी" — ऐसा कोई दावा नहीं किया जाता। हर व्यक्ति अपने विवेक और स्वतंत्र कर्म से अपने वर्तमान को रूपांतरित करने में स्वतंत्र है।
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: आध्यात्मिक चिंतन (Spiritual Contemplation & Peace) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>सेक्शन 4: आध्यात्मिक चिंतन (Spiritual Reflection)</span>
                  </h3>
                  <span className="text-[10px] text-[#d4af37] font-mono">
                    [प्रज्ञा चिंतन]
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#211306] to-[#140b03] border border-[#d4af37]/40 text-center space-y-3 shadow-lg">
                  <p className="text-sm sm:text-base text-amber-200 font-serif font-bold italic leading-relaxed">
                    "गते शोको न कर्तव्यो भविष्यं नैव चिन्तयेत्। वर्तमानेन कालेन वर्तयन्ति विचक्षणाः॥"
                  </p>
                  <p className="text-xs text-gray-300 max-w-xl mx-auto">
                    बीत चुके समय का शोक न करें, और न ही केवल भविष्य की चिंता में उलझें; बुद्धिमान व्यक्ति वर्तमान समय को जानकर उसी में श्रेष्ठ कर्म करते हैं।
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. PRESENT WORLD — वर्तमान (Vibrant Morning Dawn / Alive / Active)          */}
          {/* ========================================================================= */}
          {activeWorld === 'window_present' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* World Intro Note */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/35 flex items-start gap-3">
                <Sun className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-spin-slow" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-300 text-sm">
                    वर्तमान का चैतन्य आंगन • आज की सक्रिय ऊर्जा व कर्म-क्षेत्र
                  </p>
                  <p className="text-gray-300 leading-relaxed text-xs">
                    वर्तमान ही जीवन का वह क्षण है जहां आपका संकल्प, कर्म और चेतना प्रत्यक्ष रूप से फलित होते हैं। 
                    यहां जानिए कि आज के दिन कौन से खगोलीय सूत्र और महादशा आपके डिजिटल घर में सक्रिय हैं।
                  </p>
                </div>
              </div>

              {/* Section 1: आज का जीवन-संकेत (Today's Life Signal) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>सेक्शन 1: आज का जीवन-संकेत (Today's Life Signal)</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    [सक्रिय संरेखण]
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#062417] border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">वार एवं दिन</span>
                    <p className="text-sm font-bold text-white">{dailyPragya.varaNameHindi}</p>
                    <p className="text-[11px] text-gray-300">{dailyPragya.dateDisplay}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#062417] border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-bold">वार अधिपति ग्रह</span>
                    <p className="text-sm font-bold text-[#d4af37]">{dailyPragya.varaLordHindi}</p>
                    <p className="text-[11px] text-gray-300">दैनिक चेतना के मार्गदर्शक</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#062417] border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">वर्तमान महादशा</span>
                    <p className="text-sm font-bold text-white">{trikala.present.planetHindi}</p>
                    <p className="text-[11px] text-emerald-300 font-mono">प्रगति: {trikala.present.progressPercent}%</p>
                  </div>
                </div>
              </div>

              {/* Section 2: सक्रिय महादशा / अंतर्दशा (Active Dasha & Progress) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>सेक्शन 2: सक्रिय महादशा एवं अंतर्दशा (Active Dasha & Phase)</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    [खगोलीय गणना: Swiss Ephemeris Standard]
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#062b1a] to-[#02180e] border border-emerald-500/40 shadow-lg space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-white">
                        {trikala.present.periodTitle}
                      </h4>
                      <p className="text-xs text-[#d4af37] font-medium flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{trikala.present.startDate} से {trikala.present.endDate}</span>
                      </p>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                      काल-खंड प्रगति: {trikala.present.progressPercent}%
                    </div>
                  </div>

                  {/* Elegant progress meter */}
                  <div className="space-y-1">
                    <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden border border-emerald-500/30 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-[#10b981] to-[#d4af37] rounded-full transition-all duration-1000"
                        style={{ width: `${trikala.present.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>प्रारंभ: {trikala.present.startDate}</span>
                      <span>समापन: {trikala.present.endDate}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-200 leading-relaxed font-medium pt-1">
                    <strong>केंद्रीकृत कार्मिक उद्देश्य:</strong> {trikala.present.karmicThemeHindi}
                  </p>
                </div>
              </div>

              {/* Section 3: आज का चिंतन / प्रेरणा (Daily Contemplation & Aphorism) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>सेक्शन 3: आज का चिंतन व प्रेरणा (Daily Reflection)</span>
                  </h3>
                  <span className="text-[10px] text-[#d4af37] font-mono">
                    [प्रज्ञा सूत्र]
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#041a10] border border-[#d4af37]/35 space-y-2.5">
                  <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">
                    वैदिक प्रज्ञा सूत्र • {dailyPragya.varaLordHindi}
                  </span>
                  <p className="text-sm sm:text-base text-amber-200 font-serif font-bold italic leading-relaxed">
                    "{dailyPragya.sanskritAphorism}"
                  </p>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    {dailyPragya.aphorismHindi}
                  </p>
                </div>
              </div>

              {/* Section 4: डिजिटल घर में सक्रिय कक्ष (Active Chambers in Digital House) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>सेक्शन 4: डिजिटल घर में सक्रिय कक्ष (Active Chambers)</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    [3D चैतन्य]
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#051f14] border border-emerald-500/30 space-y-3">
                  <p className="text-xs text-gray-300">
                    वर्तमान महादशा व अंतर्दशा के ग्रह आपके डिजिटल जीवन महल के निम्नलिखित भाव कक्षों को विशेष रूप से ऊर्जावान बना रहे हैं:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {trikala.present.activatedBhavas.map(b => (
                      <button
                        key={b}
                        onClick={() => {
                          onClose();
                          onFlyToChamber(`chamber_${b}` as ChamberId);
                        }}
                        className="p-3 rounded-xl bg-[#06291a] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#083521] text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <span className="text-xs font-bold text-[#d4af37] block">
                            भाव {b} कक्ष (House {b})
                          </span>
                          <span className="text-[11px] text-gray-300">
                            सक्रिय अधिपति: {trikala.present.planetHindi}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold flex items-center gap-1 group-hover:bg-[#d4af37] group-hover:text-black transition-colors">
                          <span>भ्रमण</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 5: त्वरित कर्म मार्गदर्शन (Immediate Action Directives) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>सेक्शन 5: त्वरित कर्म मार्गदर्शन (Daily Action Directives)</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    [नैतिक आचरण]
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {dailyPragya.practicalDirectives.map((d, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#051c12] border border-emerald-500/25 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{d.titleHindi}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {d.guidanceHindi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Jump to Daily Companion */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    दैनिक प्रज्ञा साथी (Daily Companion Module)
                  </h4>
                  <p className="text-[11px] text-gray-300">
                    विस्तृत दैनिक मुहूर्त, चंद्र गोचर एवं व्यक्तिगत कर्म-योजना की पड़ताल करें।
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onEnterModule('daily_companion');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-md"
                >
                  <span>दैनिक साथी खोलें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. FUTURE WORLD — भविष्य (Cosmic Horizon / Twilight Observatory)           */}
          {/* ========================================================================= */}
          {activeWorld === 'window_future' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* World Intro Note & Core Ethos */}
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/35 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-cyan-300 text-sm">
                    भविष्य की खगोलीय वेधशाला • संभावनाओं का क्षितिज
                  </p>
                  <p className="text-gray-300 leading-relaxed text-xs">
                    <strong className="text-cyan-200">"भविष्य कोई निश्चित कहानी नहीं है, यह संभावनाओं और कर्म का क्षेत्र है।"</strong>{' '}
                    ग्रह केवल मौसम की भांति परिस्थितियां प्रस्तुत करते हैं; आपका वर्तमान पुरुषार्थ और नैतिक निर्णय ही आपके जीवन का निर्माण करता है।
                  </p>
                </div>
              </div>

              {/* Section 1: आगामी समय-खिड़कियाँ (Upcoming Timing Windows) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>सेक्शन 1: आगामी समय-खिड़कियाँ (Verified Timing Windows)</span>
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    [खगोलीय गणना: KP Transit Scanning]
                  </span>
                </div>

                <div className="space-y-3">
                  {trikala.future.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#041a24] border border-cyan-500/35 hover:border-cyan-400 transition-all space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                          <h4 className="text-sm font-bold text-white">
                            {item.periodTitle}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                            {item.planetHindi}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>संभावित प्रारंभ: {item.startDate}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-200 font-medium">
                        {item.karmicThemeHindi}
                      </p>

                      <p className="text-[11px] text-gray-400 italic border-l-2 border-cyan-500/40 pl-2">
                        "{item.keyWisdomHindi}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: आगामी दशा संक्रमण (Upcoming Dasha Transitions) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>सेक्शन 2: आगामी दशा संक्रमण (Dasha Transitions)</span>
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    [विंशोत्तरी गणित]
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#03151e] border border-cyan-500/25 space-y-2">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    आगामी अंतर्दशाएं आपके डिजिटल घर में नए भावों और अनुभवों को जाग्रत करेंगी। प्रत्येक संक्रमण मानसिक दृष्टिकोण को विस्तृत करने का अवसर होता है।
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {trikala.future.map((f, i) => (
                      <div key={i} className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs text-cyan-200 font-mono">
                        {f.planetHindi} ➔ {f.startDate}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: गोचर संरेखण (Transit Alignments) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>सेक्शन 3: गोचर संरेखण (Transit Alignments)</span>
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    [ग्रह गोचर विश्लेषण]
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-[#031924] border border-cyan-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>बृहस्पति (गुरु) का गोचर प्रभाव</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      गुरु का गोचर ज्ञान, धर्म और विवेक के विस्तार का वातावरण बनाता है। यह समय दीर्घकालिक योजनाओं और अध्ययन के लिए अनुकूल होता है।
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#031924] border border-cyan-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>शनि देव का गोचर अनुशासन</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      शनि का गोचर कर्म की शुद्धता और धैर्य की परीक्षा लेता है। दृढ़ संकल्प और निष्ठा से किए गए कार्य स्थायी सफलता की ओर ले जाते हैं।
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: खगोलीय प्रमाण बहीखाता (Transit Evidence Ledger & SHA-256 Audit) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>सेक्शन 4: खगोलीय प्रमाण बहीखाता (Evidence Ledger)</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    [SHA-256 अपरिवर्तनीय ऑडिट]
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#05202c] border border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        खगोलीय प्रमाण बहीखाता (Transit Evidence Ledger)
                      </h4>
                      <p className="text-xs text-gray-300 mt-0.5">
                        स्विस एफेमेरिस डेटा, 15-चरणीय केपी नियम और SHA-256 क्रिप्टोग्राफिक हैश द्वारा पूर्णतः प्रमाणित।
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenEvidenceLedger();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    <span>पूर्ण प्रमाण बहीखाता देखें</span>
                  </button>
                </div>
              </div>

              {/* Section 5: तैयारी एवं धैर्य मार्गदर्शन (Readiness & Patience Guidance) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>सेक्शन 5: तैयारी एवं धैर्य मार्गदर्शन (Readiness & Patience)</span>
                  </h3>
                  <span className="text-[10px] text-[#d4af37] font-mono">
                    [प्रज्ञा नीति]
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#031722] border border-cyan-500/30 space-y-2.5">
                  <p className="text-xs text-gray-200 leading-relaxed font-medium">
                    भविष्य की खिड़की आपको भयभीत करने के लिए नहीं, अपितु आपको समय से पूर्व तैयार करने के लिए है:
                  </p>
                  <ul className="space-y-1.5 text-xs text-gray-300 list-disc list-inside">
                    <li>अनपेक्षित चिंताओं से बचें; आज का सुकर्म ही कल का भाग्य बनता है।</li>
                    <li>आगामी समय-खिड़कियों को ध्यान में रखते हुए अपने कौशल व ज्ञान का संचय करें।</li>
                    <li>धैर्य और विवेक के साथ कर्म करते रहें, फल समय पर स्वतः प्रकट होता है।</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions & Navigation */}
        <div className="px-4 sm:px-6 py-3 border-t border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          <button
            onClick={onBackToCourtyard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200 transition-all cursor-pointer border border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>वापस आंगन में (Courtyard)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFullPragya(activeWorld === 'window_past' ? 'past' : activeWorld === 'window_present' ? 'present' : 'future')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-black font-bold text-xs shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
              style={{ backgroundColor: worldConfig.themeColor }}
            >
              <span>विस्तृत प्रज्ञा मार्गदर्शन</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
