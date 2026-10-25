import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Compass
} from 'lucide-react';
import { KPTimingAnalysis, KPTimingWindow } from '../../types/jyotish/kpTiming';
import { KPAnalysisResult } from '../../services/jyotish/kpEngine';
import { LanguageCode } from '../../i18n';
import { TransitEvidenceLedgerModal } from './TransitEvidenceLedgerModal';

interface KPTimingPanelProps {
  timingAnalysis: KPTimingAnalysis;
  kpResult: KPAnalysisResult;
  language: LanguageCode;
}

export const KPTimingPanel: React.FC<KPTimingPanelProps> = ({
  timingAnalysis,
  kpResult: _kpResult,
  language
}) => {
  const isHindi = language === 'hi';
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showTransitTable, setShowTransitTable] = useState(false);
  const [showFutureTransitDetails, setShowFutureTransitDetails] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  const {
    currentPeriod,
    mostFavourableWindow,
    evaluatedWindows,
    transitCorroboration,
    futureTransitCorroboration,
    humanTimingSummary,
    timingGuidance,
    timingUncertaintyNote,
    evidenceReference
  } = timingAnalysis;

  const hasRealTransit = transitCorroboration.status === 'AVAILABLE' &&
    Boolean(transitCorroboration.actualTransitPlanets && transitCorroboration.actualTransitPlanets.length > 0);

  const formatDegMinSec = (degFloat: number) => {
    const d = Math.floor(degFloat);
    const m = Math.floor((degFloat - d) * 60);
    const s = Math.round(((degFloat - d) * 60 - m) * 60);
    return `${d}° ${m}' ${s}"`;
  };

  const getFavourabilityBadge = (window: KPTimingWindow) => {
    switch (window.favourability) {
      case 'HIGHLY_FAVOURABLE':
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'FAVOURABLE':
        return {
          bg: 'bg-[#0a2618] border-emerald-600/50 text-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'MODERATE_MIXED':
        return {
          bg: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'CHALLENGING_DELAY':
        return {
          bg: 'bg-red-950/70 border-red-500/50 text-red-300',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-400" />
        };
      default:
        return {
          bg: 'bg-gray-900 border-gray-700 text-gray-400',
          icon: <Info className="w-3.5 h-3.5 text-gray-500" />
        };
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#061810] via-black to-[#05140d] border-2 border-[#d4af37]/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#d4af37]/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#d4af37] uppercase tracking-wider">
                {isHindi ? 'समय निर्धारण (KP Event Timing)' : 'Event Timing Analysis'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/50 text-emerald-400 font-bold uppercase">
                PHASE 3C.1
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              {isHindi
                ? 'विंशोत्तरी महादशा, अंतर्दशा एवं 4-स्तरीय केपी कार्येश ग्रहों का गणितीय काल-संरेखण'
                : 'Deterministic Vimshottari Dasha, Antardasha & KP 4-Fold significator chronological alignment'}
            </p>
          </div>
        </div>

        {/* Cusp Sub Lord Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-gray-400">{isHindi ? 'कस्प Sub Lord:' : 'Cusp Sub Lord:'}</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0a1812] border border-[#d4af37]/50 text-[#d4af37]">
            {timingAnalysis.primaryCuspSubLord}
          </span>
        </div>
      </div>

      {/* 1. Prime Favourable Timing Window Card */}
      {mostFavourableWindow && (
        <div className="bg-gradient-to-r from-[#0a281b] via-[#051910] to-[#0a281b] border border-emerald-500/60 rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                {isHindi ? '🗓️ संभावित समय' : '🗓️ Probable Timing Window'}
              </span>
            </div>
            {(() => {
              const badge = getFavourabilityBadge(mostFavourableWindow);
              return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                  {badge.icon}
                  <span>{mostFavourableWindow.favourabilityLabel[isHindi ? 'hi' : 'en']}</span>
                </span>
              );
            })()}
          </div>

          {/* Date Window Display */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-3">
            <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-400" />
              <span>
                {mostFavourableWindow.formattedStart[isHindi ? 'hi' : 'en']} — {mostFavourableWindow.formattedEnd[isHindi ? 'hi' : 'en']}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              ({mostFavourableWindow.durationMonths} {isHindi ? 'माह' : 'months'})
            </span>
          </div>

          {/* STRICT EVIDENCE PILLS (Dasha, KP, Sub-Lord, RP, Future Transit) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 pb-2">
            {/* 1. Dasha Support Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/90 border border-emerald-600/70 text-emerald-300">
              <span>🟢</span>
              <span>{isHindi ? 'दशा समर्थन' : 'Dasha Support'}</span>
            </span>

            {/* 2. KP Significator Support Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/90 border border-emerald-600/70 text-emerald-300">
              <span>🟢</span>
              <span>{isHindi ? 'KP समर्थन' : 'KP Support'}</span>
            </span>

            {/* 3. Primary Cusp Sub-Lord Support Badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
              mostFavourableWindow.isCuspSubLordConnected
                ? 'bg-emerald-950/90 border border-emerald-600/70 text-emerald-300'
                : 'bg-gray-900 border border-gray-700 text-gray-400'
            }`}>
              <span>{mostFavourableWindow.isCuspSubLordConnected ? '🟢' : '⚪'}</span>
              <span>{isHindi ? 'उप-स्वामी समर्थन' : 'Sub-Lord Support'}</span>
            </span>

            {/* 4. Ruling Planets Support Badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
              mostFavourableWindow.isRulingPlanetCorroborated
                ? 'bg-emerald-950/90 border border-emerald-600/70 text-emerald-300'
                : 'bg-gray-900 border border-gray-700 text-gray-400'
            }`}>
              <span>{mostFavourableWindow.isRulingPlanetCorroborated ? '🟢' : '⚪'}</span>
              <span>{isHindi ? 'RP समर्थन' : 'RP Support'}</span>
            </span>

            {/* 5. Future Transit Support Badge (Strictly derived from real future window scan) */}
            {(() => {
              const ft = futureTransitCorroboration || mostFavourableWindow.evidenceLayers?.futureTransitEvidence;
              if (ft?.status === 'SCANNED_CORROBORATED') {
                return (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/90 border border-emerald-600/70 text-emerald-300">
                    <span>🟢</span>
                    <span>{isHindi ? 'वास्तविक गोचर समर्थन' : 'Real Transit Support'}</span>
                  </span>
                );
              } else if (ft?.status === 'SCANNED_NO_CORROBORATION') {
                return (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-900 border border-gray-700 text-gray-400">
                    <span>⚪</span>
                    <span>{isHindi ? 'गोचर स्कैन हुआ — पुष्ट समर्थन नहीं मिला' : 'Transit Scanned — No Qualifying Corroboration'}</span>
                  </span>
                );
              } else {
                return (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-900 border border-gray-700 text-gray-400">
                    <span>⚪</span>
                    <span>{isHindi ? 'वास्तविक भविष्य गोचर डेटा उपलब्ध नहीं' : 'Real Future Transit Unavailable'}</span>
                  </span>
                );
              }
            })()}
          </div>

          {/* Dasha Lords and House Alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-300 pt-2 border-t border-emerald-800/40">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{isHindi ? 'सक्रिय ग्रह:' : 'Active Lords:'}</span>
              <span className="font-bold text-[#d4af37]">
                {mostFavourableWindow.mahadashaLord} ({isHindi ? 'महादशा' : 'Maha'}) + {mostFavourableWindow.antardashaLord} ({isHindi ? 'अंतर्दशा' : 'Antar'})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{isHindi ? 'सक्रिय भाव:' : 'Active Houses:'}</span>
              <span className="font-mono font-bold text-emerald-300">
                [{mostFavourableWindow.targetHousesSignified.join(', ')}]
              </span>
              {mostFavourableWindow.isRulingPlanetCorroborated && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
                  RP Match
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Natural Timing Explanation Narrative */}
      <div className="p-4 bg-black/60 border border-gray-800 rounded-xl space-y-2 text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
        <p>{humanTimingSummary[isHindi ? 'hi' : 'en']}</p>
      </div>

      {/* 3. Current Dasha Status Strip */}
      <div className="p-3.5 bg-[#091f15]/70 border border-gray-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-[#d4af37]" />
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
              {isHindi ? 'वर्तमान सक्रिय अवधि:' : 'Currently Active Period:'}
            </span>
            <span className="font-bold text-gray-200">
              {currentPeriod.mahadashaLord} / {currentPeriod.antardashaLord} ({currentPeriod.formattedCurrentRange[isHindi ? 'hi' : 'en']})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${
            currentPeriod.isAntardashaSupportive
              ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300'
              : 'bg-amber-950/70 border-amber-600/50 text-amber-300'
          }`}>
            {currentPeriod.isAntardashaSupportive
              ? (isHindi ? '🟢 वर्तमान अंतर्दशा सहयोगी है' : '🟢 Current Antardasha Supportive')
              : (isHindi ? '🟡 वर्तमान अंतर्दशा तैयारी की अवधि है' : '🟡 Current Antardasha Preparation Phase')}
          </span>
        </div>
      </div>

      {/* 4. Sequential Evaluated Antardashas (Upcoming Windows) */}
      {evaluatedWindows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{isHindi ? 'क्रमबद्ध आगामी अंतर्दशा खिड़कियाँ (Dasha Timeline)' : 'Sequential Antardasha Timeline'}</span>
            </h4>
            <span className="text-[10px] text-gray-500">
              {evaluatedWindows.length} {isHindi ? 'अवधियाँ मूल्यांकित' : 'evaluated periods'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {evaluatedWindows.map(w => {
              const badge = getFavourabilityBadge(w);
              const isBest = mostFavourableWindow?.id === w.id;
              return (
                <div
                  key={w.id}
                  className={`p-3.5 rounded-xl border transition-all duration-200 ${
                    isBest
                      ? 'bg-[#0a281b] border-emerald-500/80 shadow-md'
                      : 'bg-black/50 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {w.mahadashaLord} — {w.antardashaLord}
                        </span>
                        {isBest && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300 font-bold border border-emerald-600/50">
                            {isHindi ? 'शीर्ष खिड़की' : 'Top Window'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono block mt-0.5">
                        {w.formattedStart[isHindi ? 'hi' : 'en']} से {w.formattedEnd[isHindi ? 'hi' : 'en']}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badge.bg}`}>
                      {badge.icon}
                      <span>{w.favourabilityLabel[isHindi ? 'hi' : 'en']}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-800/80 mt-2">
                    <div className="flex items-center gap-1">
                      <span>{isHindi ? 'सक्रिय भाव:' : 'Houses:'}</span>
                      <span className="font-mono text-gray-200 font-bold">
                        {w.targetHousesSignified.length > 0 ? `[${w.targetHousesSignified.join(', ')}]` : '[-]'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {w.isRulingPlanetCorroborated && (
                        <span className="text-[9px] px-1 rounded bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
                          RP
                        </span>
                      )}
                      {w.isCuspSubLordConnected && (
                        <span className="text-[9px] px-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                          Sub-Lord
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Transit Evidence Section */}
      <div className="p-4 bg-[#0a1812] border border-[#d4af37]/30 rounded-xl space-y-2 text-xs text-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <h5 className="font-bold text-[#d4af37] uppercase tracking-wider text-[11px]">
              {hasRealTransit
                ? (isHindi ? 'वास्तविक गोचर साक्ष्य (Swiss Ephemeris)' : 'Actual Transit Evidence (Swiss Ephemeris)')
                : (isHindi ? '⚪ वास्तविक गोचर डेटा उपलब्ध नहीं' : '⚪ Actual Transit Data Unavailable')}
            </h5>
          </div>
          {hasRealTransit && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/50 text-emerald-400 font-mono">
              ASTRO-VERIFIED
            </span>
          )}
        </div>

        <p className="leading-relaxed text-[11px] sm:text-xs text-gray-200">
          {transitCorroboration.description[isHindi ? 'hi' : 'en']}
        </p>

        {/* Traditional rule label if no real transit */}
        {!hasRealTransit && transitCorroboration.classicalRuleNote && (
          <div className="mt-3 p-3 bg-black/60 border border-amber-500/30 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
              <Compass className="w-3.5 h-3.5" />
              <span>{transitCorroboration.classicalRuleNote.label[isHindi ? 'hi' : 'en']}</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              {transitCorroboration.classicalRuleNote.description[isHindi ? 'hi' : 'en']}
            </p>
          </div>
        )}
      </div>

      {/* 6. Expandable Technical Transit Inspection */}
      {hasRealTransit && transitCorroboration.actualTransitPlanets && (
        <div className="border border-emerald-900/50 rounded-xl overflow-hidden bg-black/50">
          <button
            type="button"
            onClick={() => setShowTransitTable(!showTransitTable)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-gray-200">
                {isHindi ? '⌄ तकनीकी गोचर गणना देखें (Swiss Ephemeris Transit Coordinates)' : '⌄ View Technical Transit Calculations (Swiss Ephemeris Transit Coordinates)'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <span>{showTransitTable ? (isHindi ? 'छिपाएँ' : 'Hide') : (isHindi ? 'खोलें' : 'Inspect')}</span>
              {showTransitTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showTransitTable && (
            <div className="p-4 border-t border-emerald-900/50 space-y-3 text-xs font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 text-[10px] text-gray-400 border-b border-gray-800">
                <span>Source: {transitCorroboration.ephemerisSource || 'Swiss Ephemeris'}</span>
                <span>Timestamp: {transitCorroboration.calculationTimestamp || new Date().toISOString()}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-[10px]">
                      <th className="py-1.5 px-2">{isHindi ? 'ग्रह' : 'Planet'}</th>
                      <th className="py-1.5 px-2">{isHindi ? 'स्पष्ट रेखांश' : 'Longitude'}</th>
                      <th className="py-1.5 px-2">{isHindi ? 'राशि' : 'Sign'}</th>
                      <th className="py-1.5 px-2">{isHindi ? 'नक्षत्र (पाद)' : 'Nakshatra (Pada)'}</th>
                      <th className="py-1.5 px-2">{isHindi ? 'गति' : 'Motion'}</th>
                      <th className="py-1.5 px-2">{isHindi ? 'गोचर भाव' : 'Transit House'}</th>
                      <th className="py-1.5 px-2">{isHindi ? 'सक्रिय भाव' : 'Active Houses'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900">
                    {transitCorroboration.actualTransitPlanets.map(p => (
                      <tr key={p.planet} className="hover:bg-white/5">
                        <td className="py-1.5 px-2 font-bold text-gray-200">
                          {isHindi ? p.hindiName : p.planet}
                        </td>
                        <td className="py-1.5 px-2 text-[#d4af37]">
                          {formatDegMinSec(p.exactLongitude)}
                        </td>
                        <td className="py-1.5 px-2 text-gray-300">
                          {isHindi ? p.hindiSign : p.sign} {p.degree.toFixed(2)}°
                        </td>
                        <td className="py-1.5 px-2 text-gray-300">
                          {p.nakshatraName} ({p.pada})
                        </td>
                        <td className="py-1.5 px-2">
                          <span className={`text-[10px] px-1 rounded ${
                            p.isRetrograde ? 'bg-amber-950 text-amber-300' : 'text-gray-400'
                          }`}>
                            {p.motionStatus}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 font-bold text-emerald-400">
                          H{p.transitHouseFromLagna}
                        </td>
                        <td className="py-1.5 px-2 font-bold text-[#d4af37]">
                          {p.signifiedTargetHouses.length > 0 ? `[${p.signifiedTargetHouses.join(', ')}]` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6B. Future Transit Verification & Evidence Ledger (Phase 3C.4) */}
      {futureTransitCorroboration && (
        <div className="border-2 border-emerald-800/70 rounded-2xl overflow-hidden bg-gradient-to-b from-[#07180f] via-black to-[#05140d] shadow-xl">
          {/* Header Banner & Ledger Action */}
          <div className="p-4 sm:p-5 border-b border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#0a2316] via-transparent to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-600/60 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  {isHindi ? 'भविष्य गोचर सत्यापन एवं साक्ष्य बही' : 'Future Transit Verification & Evidence Ledger'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {mostFavourableWindow?.mahadashaLord} → {mostFavourableWindow?.antardashaLord}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/60 flex items-center gap-1.5 shadow">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{futureTransitCorroboration.isCorroborated ? (isHindi ? '🟢 सत्यापित (CORROBORATED)' : '🟢 SCANNED_CORROBORATED') : (isHindi ? '🔴 अपुष्ट' : '🔴 UNCORROBORATED')}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLedgerModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37]/25 to-[#d4af37]/10 hover:from-[#d4af37]/35 hover:to-[#d4af37]/20 border border-[#d4af37]/60 text-[#d4af37] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg self-start sm:self-auto shrink-0"
            >
              <span>🔍 {isHindi ? 'गोचर प्रमाण देखें (View Ledger)' : 'View Transit Evidence'}</span>
            </button>
          </div>

          {/* Core Summary Metrics (Section 8 Format) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-black/40 border-b border-gray-900 text-xs">
            <div className="p-2.5 rounded-lg bg-[#07190f] border border-emerald-900/50">
              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">
                {isHindi ? 'समय-खिड़की:' : 'Timing Window:'}
              </span>
              <span className="text-white font-bold text-sm">
                {mostFavourableWindow?.mahadashaLord} → {mostFavourableWindow?.antardashaLord}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#07190f] border border-emerald-900/50">
              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">
                {isHindi ? 'भविष्य गोचर:' : 'Future Transit:'}
              </span>
              <span className="text-emerald-400 font-bold text-sm">
                {futureTransitCorroboration.isCorroborated ? '🟢 सत्यापित' : '🔴 अपुष्ट'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#07190f] border border-emerald-900/50">
              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">
                {isHindi ? 'स्कैन अवधि:' : 'Scan Interval:'}
              </span>
              <span className="text-gray-200 font-mono text-xs">
                {futureTransitCorroboration.scanStart.slice(0, 10)} → {futureTransitCorroboration.scanEnd.slice(0, 10)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#07190f] border border-emerald-900/50">
              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">
                {isHindi ? 'सत्यापित घटनाएँ:' : 'Verified Events:'}
              </span>
              <span className="text-[#d4af37] font-bold font-mono text-sm">
                {futureTransitCorroboration.verifiedEventsCount}
              </span>
            </div>
          </div>

          {/* Expandable Technical Calculation View */}
          <div>
            <button
              type="button"
              onClick={() => setShowFutureTransitDetails(!showFutureTransitDetails)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer text-xs border-b border-emerald-950"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-gray-200">
                  {isHindi ? '⌄ गणना प्रमाण देखें (View Technical Calculations & Lineage)' : '⌄ View Technical Calculations & Lineage'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <span>{showFutureTransitDetails ? (isHindi ? 'छिपाएँ' : 'Hide') : (isHindi ? 'खोलें' : 'Inspect')}</span>
                {showFutureTransitDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showFutureTransitDetails && (
              <div className="p-4 space-y-4 text-xs font-mono">
                <div className="p-2.5 rounded bg-black/40 border border-gray-800 text-[11px] text-gray-300 leading-relaxed font-sans">
                  <span className="text-gray-400 font-bold">विश्लेषण निष्कर्ष: </span>
                  <span>{futureTransitCorroboration.summary[isHindi ? 'hi' : 'en']}</span>
                </div>

                {futureTransitCorroboration.keyTransitEvents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400 text-[10px]">
                          <th className="py-1.5 px-2">Planet</th>
                          <th className="py-1.5 px-2">Scan Time</th>
                          <th className="py-1.5 px-2">Refined Event Time</th>
                          <th className="py-1.5 px-2">Longitude</th>
                          <th className="py-1.5 px-2">Sign</th>
                          <th className="py-1.5 px-2">Nakshatra</th>
                          <th className="py-1.5 px-2 text-center">Pada</th>
                          <th className="py-1.5 px-2">Motion</th>
                          <th className="py-1.5 px-2">House</th>
                          <th className="py-1.5 px-2">Target Houses</th>
                          <th className="py-1.5 px-2">Adverse</th>
                          <th className="py-1.5 px-2">Precision</th>
                          <th className="py-1.5 px-2">KP Relationship</th>
                          <th className="py-1.5 px-2">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-900 font-mono">
                        {futureTransitCorroboration.keyTransitEvents.map((ev, i) => (
                          <tr key={i} className="hover:bg-white/5">
                            <td className="py-1.5 px-2 font-bold text-gray-200">
                              {isHindi ? ev.hindiName : ev.planet}
                            </td>
                            <td className="py-1.5 px-2 text-gray-500 text-[10px]">
                              {ev.scanTimestamp ? ev.scanTimestamp.slice(0, 16).replace('T', ' ') : ev.timestamp.slice(0, 10)}
                            </td>
                            <td className="py-1.5 px-2 text-emerald-400 font-bold text-[10px]">
                              {ev.boundaryTimestamp ? ev.boundaryTimestamp.slice(0, 16).replace('T', ' ') : ev.timestamp.slice(0, 16).replace('T', ' ')}
                            </td>
                            <td className="py-1.5 px-2 text-[#d4af37]">
                              {formatDegMinSec(ev.exactLongitude)}
                            </td>
                            <td className="py-1.5 px-2 text-gray-300">
                              {isHindi ? ev.hindiSign : ev.sign} {ev.degree.toFixed(2)}°
                            </td>
                            <td className="py-1.5 px-2 text-gray-300">
                              {ev.nakshatraName}
                            </td>
                            <td className="py-1.5 px-2 text-center text-gray-300">
                              {ev.pada}
                            </td>
                            <td className="py-1.5 px-2">
                              <span className={`text-[10px] px-1 rounded ${ev.isRetrograde ? 'bg-amber-950 text-amber-300' : 'text-gray-400'}`}>
                                {ev.motionStatus}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-emerald-400 font-bold">
                              H{ev.transitHouseFromLagna}
                            </td>
                            <td className="py-1.5 px-2 text-[#d4af37]">
                              [{ev.targetHousesSignified.join(', ')}]
                            </td>
                            <td className="py-1.5 px-2 text-gray-500">
                              {ev.adverseHousesSignified.length > 0 ? `[${ev.adverseHousesSignified.join(', ')}]` : '-'}
                            </td>
                            <td className="py-1.5 px-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40 font-mono">
                                {ev.precisionMinutes || '≤60 min'}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-[10px] text-gray-300 max-w-xs truncate font-sans">
                              {ev.kpRelationship}
                            </td>
                            <td className="py-1.5 px-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/40">
                                QUALIFIED
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 bg-black/40 border border-gray-800 rounded text-center text-gray-500 text-xs">
                    {isHindi ? 'कोई सत्यापित गोचर घटना दर्ज नहीं हुई' : 'No verified qualifying transit events recorded'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Practical Timing Guidance */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>{isHindi ? 'समय सम्बंधी व्यावहारिक मार्गदर्शन' : 'Practical Timing Guidance'}</span>
        </h4>
        <div className="space-y-2">
          {timingGuidance.map((tip, idx) => (
            <div
              key={idx}
              className="p-3 bg-black/50 border border-gray-800 rounded-xl flex items-start gap-2.5 text-xs text-gray-200"
            >
              <ArrowRight className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
              <span>{tip[isHindi ? 'hi' : 'en']}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 italic pt-1">
          {timingUncertaintyNote[isHindi ? 'hi' : 'en']}
        </p>
      </div>

      {/* 8. Expandable Technical Timing Details (Dasha Math & House Linkage) */}
      <div className="border border-gray-800 rounded-xl overflow-hidden bg-black/40">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="font-bold text-gray-300">
              {isHindi ? 'तकनीकी समय गणना विवरण देखें (Dasha Math & House Linkage)' : 'View Technical Timing Calculations (Dasha Math & House Linkage)'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <span>{showTechnicalDetails ? (isHindi ? 'छिपाएँ' : 'Hide') : (isHindi ? 'खोलें' : 'Expand')}</span>
            {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-4 border-t border-gray-800 space-y-3 text-xs text-gray-300 font-mono animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500 block">Dasha Source:</span>
                <span className="text-gray-200">{evidenceReference.dashaSource}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Primary Cusp Sub Lord:</span>
                <span className="text-[#d4af37] font-bold">{evidenceReference.primaryCuspSubLord}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Favourable Significators:</span>
                <span className="text-emerald-400">[{evidenceReference.favourablePlanets.join(', ')}]</span>
              </div>
              <div>
                <span className="text-gray-500 block">Ruling Planets at Query:</span>
                <span className="text-[#d4af37]">[{evidenceReference.rulingPlanets.join(', ')}]</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transit Evidence Ledger Modal */}
      <TransitEvidenceLedgerModal
        isOpen={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
        ledger={futureTransitCorroboration?.evidenceLedger}
        futureTransit={futureTransitCorroboration}
        mahadashaLord={mostFavourableWindow?.mahadashaLord || ''}
        antardashaLord={mostFavourableWindow?.antardashaLord || ''}
        windowStart={futureTransitCorroboration?.scanStart || ''}
        windowEnd={futureTransitCorroboration?.scanEnd || ''}
        language={language}
      />
    </div>
  );
};
