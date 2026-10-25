/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PHASE 4.1: JEEVAN PRAGYA HEART EXPERIENCE MODAL
 * जीवन प्रज्ञा हृदय • केंद्रीय मार्गदर्शन केंद्र
 * 
 * Houses the Tri-Kala Drishti (अतीत, वर्तमान, भविष्य),
 * Daily Pragya Reflection (आज का चिंतन), and Deep Gateway Links.
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Compass,
  Clock,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Sun,
  Eye,
  BookOpen,
  ChevronRight,
  Maximize2,
  ExternalLink,
  HeartHandshake
} from 'lucide-react';
import { ChamberId } from '../../types/digitalHouse';
import { MasterKundliData } from '../../types/kundli';
import { JeevanPragyaService, JeevanPragyaHeartData } from '../../services/digitalHouse/jeevanPragyaService';
import { useTranslation } from '../../i18n';

interface JeevanPragyaModalProps {
  masterData: MasterKundliData | null;
  initialSubTab?: 'present' | 'past' | 'future';
  onClose: () => void;
  onEnterModule: (view: string) => void;
  onFlyToChamber: (chamberId: ChamberId) => void;
  onOpenEvidenceLedger: () => void;
}

export const JeevanPragyaModal: React.FC<JeevanPragyaModalProps> = ({
  masterData,
  initialSubTab = 'present',
  onClose,
  onEnterModule,
  onFlyToChamber,
  onOpenEvidenceLedger
}) => {
  const { t } = useTranslation();
  const [activeMainTab, setActiveMainTab] = useState<'trikala' | 'daily' | 'chambers' | 'gateways'>('trikala');
  const [trikalaSubTab, setTrikalaSubTab] = useState<'present' | 'past' | 'future'>(initialSubTab);

  // Compute read-only Pragya data safely
  const pragyaData: JeevanPragyaHeartData = React.useMemo(() => {
    return JeevanPragyaService.extractPragyaHeart(masterData);
  }, [masterData]);

  const { trikala, dailyPragya, activeRulingChambers, evidenceLedger, dataBoundaryNotice } = pragyaData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[94vh] sm:max-h-[92vh] flex flex-col bg-[#03140d]/98 border border-[#d4af37]/60 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] text-white overflow-hidden">
        
        {/* Top Ornate Glow Trim */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent shrink-0" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#d4af37]/25 flex items-start justify-between bg-[#041d13]/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#d4af37]/25 to-emerald-950 border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.35)] shrink-0">
              <Flame className="w-6 h-6 animate-pulse text-[#d4af37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#d4af37] uppercase">
                  3D Digital Life House • ब्रह्म स्थान
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  जीवंत हृदय
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-wide mt-0.5">
                जीवन प्रज्ञा मार्गदर्शन <span className="text-[#d4af37] font-serif font-normal text-base sm:text-xl">• Jeevan Pragya</span>
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                {dailyPragya.varaNameHindi} • दशा: {dailyPragya.currentDashaSummary}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Data Boundary Transparency Banner */}
        <div className="px-4 sm:px-6 py-2 bg-[#021109] border-b border-[#d4af37]/15 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-gray-300 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              <span className="text-emerald-300 font-semibold">[खगोलीय गणना]</span> स्विस एफेमेरिस व दशा गणित · <span className="text-[#d4af37] font-semibold">[प्रज्ञा चिंतन]</span> नैतिक व आध्यात्मिक मीमांसा
            </span>
          </div>
          <span className="hidden sm:inline px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-[9px]">
            डेटा सीमा सुरक्षित
          </span>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex items-center border-b border-[#d4af37]/20 bg-[#020b07]/90 px-3 sm:px-6 overflow-x-auto shrink-0 custom-scrollbar">
          <button
            onClick={() => setActiveMainTab('trikala')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'trikala'
                ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>त्रिकाल दृष्टि (Past • Present • Future)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('daily')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'daily'
                ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>आज का चिंतन (Daily Reflection)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('chambers')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'chambers'
                ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>सक्रिय दशा कक्ष (Active Chambers)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('gateways')}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'gateways'
                ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>द्वार एवं सेतु (Gateways)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

          {/* TAB 1: TRIKALA DRISHTI */}
          {activeMainTab === 'trikala' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Trikala Sub-Selector */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#010905] border border-[#d4af37]/30">
                <button
                  onClick={() => setTrikalaSubTab('past')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    trikalaSubTab === 'past'
                      ? 'bg-[#d97706] text-black shadow-md'
                      : 'text-amber-300 hover:bg-white/5'
                  }`}
                >
                  <span>अतीत (Past)</span>
                </button>

                <button
                  onClick={() => setTrikalaSubTab('present')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    trikalaSubTab === 'present'
                      ? 'bg-[#10b981] text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'text-emerald-400 hover:bg-white/5'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>वर्तमान (Present)</span>
                </button>

                <button
                  onClick={() => setTrikalaSubTab('future')}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    trikalaSubTab === 'future'
                      ? 'bg-[#38bdf8] text-black shadow-md'
                      : 'text-cyan-300 hover:bg-white/5'
                  }`}
                >
                  <span>भविष्य (Future)</span>
                </button>
              </div>

              {/* PRESENT PANE */}
              {trikalaSubTab === 'present' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#06291a] to-[#03150d] border border-emerald-500/50 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
                      <span className="uppercase tracking-widest">सक्रिय जीवन पर्व • Living Moment</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono">
                        प्रगति: {trikala.present.progressPercent}%
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                      {trikala.present.periodTitle}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-[#d4af37] font-medium mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{trikala.present.startDate} से {trikala.present.endDate}</span>
                    </div>

                    {/* Data Boundary Indicators */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>गणितीय आधार: {trikala.present.dataBoundary?.calculatedTiming.engine || 'Vimshottari Dasha Engine'}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>प्रज्ञा स्वरूप: {trikala.present.dataBoundary?.reflectiveGuidance.tradition || 'वैदिक जीवन प्रज्ञा'}</span>
                      </span>
                    </div>

                    {/* Dasha Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden mb-4 border border-emerald-500/30">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#d4af37] rounded-full transition-all duration-500"
                        style={{ width: `${trikala.present.progressPercent}%` }}
                      />
                    </div>

                    {/* Karmic Theme */}
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        वर्तमान कार्मिक विषय एवं संकल्प
                      </p>
                      <p className="text-sm text-gray-200 leading-relaxed font-medium">
                        {trikala.present.karmicThemeHindi}
                      </p>
                      <p className="text-xs text-gray-400 italic">
                        "{trikala.present.keyWisdomHindi}"
                      </p>
                    </div>

                    {/* Action: Jump to Activated Chambers */}
                    <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Compass className="w-4 h-4 text-[#d4af37]" />
                        <span>सक्रिय कक्ष:</span>
                        <div className="flex gap-1.5">
                          {trikala.present.activatedBhavas.map(b => (
                            <button
                              key={b}
                              onClick={() => {
                                onClose();
                                onFlyToChamber(`chamber_${b}` as ChamberId);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#041a10] border border-[#d4af37]/50 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-colors cursor-pointer"
                            >
                              भाव {b} कक्ष ➔
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => onEnterModule('kundli_shell')}
                        className="px-4 py-1.5 rounded-full bg-[#d4af37] text-black font-bold text-xs hover:bg-[#e6c250] transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <span>विस्तृत कालचक्र</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAST PANE */}
              {trikalaSubTab === 'past' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                    <p className="font-semibold">कार्मिक जड़ें एवं पूर्व जीवन अध्याय (Karmic Roots)</p>
                    <p className="text-gray-300 mt-0.5">
                      वे महादशा काल जिन्होंने आपकी चेतना की नींव को गढ़ा है और जिनके संस्कार आज भी आपकी शक्ति हैं।
                    </p>
                  </div>

                  <div className="space-y-3">
                    {trikala.past.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-[#061810] border border-amber-500/30 hover:border-amber-500/60 transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-base font-bold text-amber-300">
                            {item.periodTitle}
                          </h4>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {item.startDate} — {item.endDate}
                          </span>
                        </div>
                        <p className="text-xs text-gray-200 mt-1 leading-relaxed">
                          {item.karmicThemeHindi}
                        </p>
                        <p className="text-[11px] text-gray-400 italic mt-1.5 border-l-2 border-amber-500/40 pl-2">
                          {item.keyWisdomHindi}
                        </p>
                        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-amber-500/20 text-[10px] text-gray-400">
                          <span className="text-amber-400 font-mono">गणितीय आधार: {item.dataBoundary?.calculatedTiming.engine || 'Vimshottari Dasha Engine'}</span>
                          <span>•</span>
                          <span className="text-gray-300">चिंतन: {item.dataBoundary?.reflectiveGuidance.tradition || 'पूर्व कर्म संस्कार'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FUTURE PANE */}
              {trikalaSubTab === 'future' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200">
                    <p className="font-semibold">आगामी क्षितिज एवं गोचर संरेखण (Emerging Horizons)</p>
                    <p className="text-gray-300 mt-0.5">
                      आगामी महादशा एवं अंतर्दशा काल जो नई संभावनाओं एवं कर्तव्यों का उद्घाटन करेंगे।
                    </p>
                  </div>

                  <div className="space-y-3">
                    {trikala.future.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-[#041920] border border-cyan-500/40 hover:border-cyan-400 transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-base font-bold text-cyan-300">
                            {item.periodTitle}
                          </h4>
                          <span className="text-[11px] text-gray-300 font-mono">
                            प्रारंभ: {item.startDate}
                          </span>
                        </div>
                        <p className="text-xs text-gray-200 mt-1 leading-relaxed">
                          {item.karmicThemeHindi}
                        </p>
                        <p className="text-[11px] text-gray-400 italic mt-1.5 border-l-2 border-cyan-500/40 pl-2">
                          {item.keyWisdomHindi}
                        </p>
                        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-cyan-500/20 text-[10px] text-gray-400">
                          <span className="text-cyan-400 font-mono">गणितीय आधार: {item.dataBoundary?.calculatedTiming.engine || 'Vimshottari Dasha Engine'}</span>
                          <span>•</span>
                          <span className="text-gray-300">क्षितिज: {item.dataBoundary?.reflectiveGuidance.tradition || 'आगामी कर्म पर्व'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Future Transit Evidence Verification Badge */}
                  <div className="p-4 rounded-2xl bg-[#041f16] border border-[#d4af37]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          खगोलीय प्रमाण बहीखाता (Transit Evidence Ledger)
                        </h4>
                        <p className="text-xs text-gray-300">
                          स्विट्जरलैंड एफिमेरिस एवं SHA-256 हैश द्वारा पूर्णतः सत्यापित गोचर डेटा।
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onOpenEvidenceLedger}
                      className="px-4 py-2 rounded-xl bg-[#062417] border border-[#d4af37]/60 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>प्रमाण बहीखाता देखें</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: DAILY PRAGYA REFLECTION */}
          {activeMainTab === 'daily' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Daily Vedic Aphorism Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#082b1c] to-[#03150d] border-2 border-[#d4af37]/50 shadow-2xl relative">
                <div className="flex items-center justify-between text-xs text-[#d4af37] font-bold mb-2">
                  <span>{dailyPragya.dateDisplay}</span>
                  <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 uppercase tracking-widest text-[10px]">
                    वार अधिपति: {dailyPragya.varaLordHindi}
                  </span>
                </div>

                <div className="my-4 p-4 rounded-2xl bg-black/40 border border-[#d4af37]/30 text-center">
                  <p className="text-base sm:text-lg font-serif font-bold text-[#fef08a] leading-relaxed tracking-wide">
                    {dailyPragya.sanskritAphorism}
                  </p>
                </div>

                <div className="space-y-1.5 text-center max-w-xl mx-auto">
                  <p className="text-sm text-gray-200 font-medium leading-relaxed">
                    {dailyPragya.aphorismHindi}
                  </p>
                  <p className="text-xs text-gray-400 italic">
                    "{dailyPragya.aphorismEnglish}"
                  </p>
                </div>
              </div>

              {/* 3 Practical Directives for Today */}
              <div>
                <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-3">
                  आज के तीन व्यावहारिक सूत्र (Practical Directives for Today)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {dailyPragya.practicalDirectives.map((d, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-[#062014] border border-emerald-500/30 flex flex-col justify-between">
                      <div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs mb-2">
                          {i + 1}
                        </div>
                        <h5 className="text-xs font-bold text-white mb-1">
                          {d.titleHindi}
                        </h5>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {d.guidanceHindi}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Data Boundary Clarification Note */}
              <div className="p-3.5 rounded-xl bg-[#041b11] border border-[#d4af37]/30 flex items-start gap-2.5 text-xs text-gray-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px]">
                  <p className="text-gray-200">
                    <strong className="text-emerald-300">गणना आधार:</strong> {dailyPragya.dataBoundary?.calculatedAstro.varaLordEngine}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-[#d4af37]">चिंतन स्वरूप:</strong> {dailyPragya.dataBoundary?.reflectivePragya.contemplationType}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE RULING CHAMBERS */}
          {activeMainTab === 'chambers' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200">
                <p className="font-semibold">3D डिजिटल गृह में सक्रिय दशा कक्ष</p>
                <p className="text-gray-300 mt-0.5">
                  वर्तमान महादशा एवं अंतर्दशा के ग्रह आपकी जन्म कुंडली में जिन कक्षों में स्थित हैं, वे इस समय सबसे अधिक ऊर्जावान हैं। किसी भी कक्ष पर क्लिक कर कैमरा सीधे उस कक्ष की ओर ले जाएं।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeRulingChambers.map(ch => (
                  <div
                    key={ch.chamberId}
                    className="p-4 rounded-2xl bg-[#062215] border border-[#d4af37]/40 hover:border-[#d4af37] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-black"
                          style={{ backgroundColor: ch.color }}
                        >
                          भाव {ch.houseNumber}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {ch.chamberId}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1">
                        {ch.hindiTitle}
                      </h4>
                      <p className="text-xs text-[#d4af37] font-medium mb-2">
                        {ch.sanskritTitle}
                      </p>
                      <p className="text-xs text-gray-300 leading-relaxed mb-3">
                        {ch.reasonHindi}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onFlyToChamber(ch.chamberId);
                      }}
                      className="w-full py-2 rounded-xl bg-[#0a3320] border border-[#d4af37]/50 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>कक्ष में प्रवेश करें (Fly to Chamber)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GATEWAYS TO EXPERIENCES */}
          {activeMainTab === 'gateways' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 rounded-xl bg-[#062417] border border-[#d4af37]/30 text-xs text-gray-200">
                <p className="font-semibold text-[#d4af37]">जीवनदर्पण के प्रमुख मार्ग एवं सेतु</p>
                <p className="text-gray-300 mt-0.5">
                  केंद्रीय ब्रह्म स्थान से जुड़े विभिन्न जीवन अनुभवों में सीधे प्रवेश करें:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => onEnterModule('kundli_shell')}
                  className="p-4 rounded-2xl bg-[#051c12] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#082a1b] text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">कालचक्र एवं कुण्डली चक्र</h4>
                      <p className="text-xs text-gray-400">Vimshottari Dasha Timeline & Kundli</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenEvidenceLedger();
                  }}
                  className="p-4 rounded-2xl bg-[#051c12] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#082a1b] text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">प्रमाण बहीखाता (Evidence Ledger)</h4>
                      <p className="text-xs text-gray-400">Cryptographic Transit Proofs</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                </button>

                <button
                  onClick={() => onEnterModule('daily_companion')}
                  className="p-4 rounded-2xl bg-[#051c12] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#082a1b] text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">दैनिक साथी (Daily Companion)</h4>
                      <p className="text-xs text-gray-400">Personalized Day Guidance</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                </button>

                <button
                  onClick={() => onEnterModule('pratah_sanskar')}
                  className="p-4 rounded-2xl bg-[#051c12] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#082a1b] text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">प्रातः संस्कार (Morning Ritual)</h4>
                      <p className="text-xs text-gray-400">Sacred Chants & Meditation</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                </button>

                <button
                  onClick={() => onEnterModule('daily_report_card')}
                  className="p-4 rounded-2xl bg-[#051c12] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#082a1b] text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">दैनिक रिपोर्ट कार्ड</h4>
                      <p className="text-xs text-gray-400">Comprehensive Planetary Scores</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                </button>

                <button
                  onClick={() => onEnterModule('profile')}
                  className="p-4 rounded-2xl bg-[#051c12] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#082a1b] text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">मास्टर प्रोफाइल (Master Profile)</h4>
                      <p className="text-xs text-gray-400">Birth Ephemeris & Settings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#d4af37]" />
                </button>
              </div>
            </div>
          )}

          {/* Data Boundary & Calculation Verification Box */}
          <div className="p-4 rounded-2xl bg-[#02130b] border border-emerald-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  डेटा सीमा एवं गणना सत्यनिष्ठा (Data Boundary Invariant)
                </h5>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Deterministic Core
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
                  <span>खगोलीय गणितीय गणना</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {dataBoundaryNotice?.calculationNoticeHi}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-[#d4af37]/20">
                <div className="flex items-center gap-1.5 font-bold text-[#d4af37] mb-1">
                  <span>जीवन प्रज्ञा चिंतन</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  {dataBoundaryNotice?.interpretationNoticeHi}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-[#d4af37]/20 bg-[#020906] flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300">ब्रह्म स्थान चैतन्य • जीवन प्रज्ञा हृदय</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEnterModule('dashboard')}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              क्लासिक डैशबोर्ड
            </button>
            <span className="text-gray-600">·</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
            >
              कक्ष में वापस जाएं (Return to House)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
