/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — DOSH & REMEDIES DASHBOARD (दोष एवं उपाय)
 * PHASE 1.13F: PRESENTATION LAYER ONLY
 * 
 * Read-only presentation dashboard consuming ONLY UnifiedDoshAnalysisCollection
 * from DoshOrchestrator. Zero UI-side astrological calculations.
 * 
 * STRICT INVARIANTS:
 * - Pure presentation layer; consumes UnifiedDoshAnalysisCollection from DoshOrchestrator.
 * - Zero severity scoring, zero ranking, zero percentages.
 * - Non-fatalistic framing: displays traditional indicators, not guaranteed catastrophes.
 * - Preserves special engine-specific states (Kala Sarpa partial/boundary, Kemadruma base/bhanga, Shani phases).
 * - Read-only evidence inspection; never creates or modifies evidence records.
 * - Remedies remain strictly decoupled (placeholder banner only; no remedy generation).
 * - Fully accessible mobile design with >= 44px touch targets and responsive layouts (320px-412px+).
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Shield,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  X,
  FileText,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Flame,
  Moon,
  Sun,
  Compass,
  Check
} from 'lucide-react';
import { BirthProfile, MasterKundliData } from '../../types/kundli';
import { AstronomyService } from '../../services/astronomy/astronomyService';
import { DoshOrchestrator, ShaniTransitAnalysisOptions } from '../../services/dosh/doshOrchestrator';
import { TransitEngine } from '../../services/jyotish/transitEngine';
import { RemedyEligibilityService } from '../../services/dosh/remedyEligibilityService';
import { DoshRemedyEvaluation, RemedyItem } from '../../types/dosh/remedyTypes';
import {
  UnifiedDoshAnalysisCollection,
  UnifiedDoshResult,
  UnifiedDoshStatus,
  UnifiedDoshId
} from '../../types/dosh/unifiedDoshTypes';
import { useTranslation } from '../../i18n';

interface DoshDashboardProps {
  profile: BirthProfile | null;
  navigate: (view: string) => void;
  showToast: (msg: string) => void;
}

export default function DoshDashboard({ profile, navigate, showToast }: DoshDashboardProps) {
  const { language, t } = useTranslation();
  const isHindi = language === 'hi';

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<UnifiedDoshAnalysisCollection | null>(null);
  const [selectedDosh, setSelectedDosh] = useState<UnifiedDoshResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'SPECIAL' | 'NOT_PRESENT'>('ALL');
  const [copiedFingerprint, setCopiedFingerprint] = useState<string | null>(null);

  // Automatically recalculate through DoshOrchestrator when Master Profile changes
  useEffect(() => {
    let isMounted = true;

    if (!profile) {
      setError(isHindi ? 'मास्टर जन्म प्रोफाइल उपलब्ध नहीं है।' : 'Master Birth Profile is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    AstronomyService.calculateKundli(profile)
      .then(async res => {
        if (!isMounted) return;
        if (!res || !res.data) {
          setError(isHindi ? 'कुंडली गणना डेटा प्राप्त नहीं हो सका।' : 'Could not obtain chart calculations.');
          setLoading(false);
          return;
        }

        // Calculate real astronomical transit for Saturn using existing TransitEngine
        let shaniOptions: ShaniTransitAnalysisOptions | undefined = undefined;
        try {
          const transitEngine = new TransitEngine();
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0];
          const timeStr = now.toTimeString().slice(0, 8);
          const transitRes = await transitEngine.calculateTransit({
            date: dateStr,
            time: timeStr,
            latitude: profile.latitude,
            longitude: profile.longitude,
            timezone: profile.timezone || 'Asia/Kolkata',
            ayanamsa: (res.data.ayanamsa as any) || 'Lahiri'
          }, res.data);

          if (transitRes && transitRes.status === 'AVAILABLE') {
            shaniOptions = { transitResult: transitRes };
          }
        } catch (transitErr) {
          console.warn('Real transit calculation skipped or unavailable:', transitErr);
        }

        // Orchestrate all seven deterministic Dosh engines with verified transit data
        const analysisCollection = DoshOrchestrator.analyzeAllDoshas(res.data, shaniOptions, profile.name);
        setCollection(analysisCollection);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Dosh Orchestration Error:', err);
        setError(isHindi ? 'दोष विश्लेषण संकलन में समस्या आई।' : 'Failed to compile dosha analysis.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, isHindi]);

  // Copy helper for evidence SHA-256 fingerprint
  const handleCopyFingerprint = (fp: string) => {
    try {
      navigator.clipboard.writeText(fp);
      setCopiedFingerprint(fp);
      showToast(isHindi ? 'प्रमाण फ़िंगरप्रिंट कॉपी किया गया' : 'Evidence fingerprint copied');
      setTimeout(() => setCopiedFingerprint(null), 2500);
    } catch {
      showToast(isHindi ? 'कॉपी विफल' : 'Copy failed');
    }
  };

  // Status Presentation Helpers
  const getStatusBadge = (status: UnifiedDoshStatus) => {
    switch (status) {
      case 'PRESENT':
        return {
          label: isHindi ? 'पारंपरिक संकेत उपस्थित' : 'Traditional Indication Present',
          bg: 'bg-amber-950/60',
          border: 'border-amber-500/50',
          text: 'text-amber-300',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        };
      case 'NOT_PRESENT':
        return {
          label: isHindi ? 'इस framework में संकेत नहीं' : 'No Indication in Framework',
          bg: 'bg-emerald-950/60',
          border: 'border-emerald-500/50',
          text: 'text-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        };
      case 'SPECIAL_CASE':
        return {
          label: isHindi ? 'विशेष स्थिति (Special Case)' : 'Special Case Condition',
          bg: 'bg-cyan-950/60',
          border: 'border-cyan-500/50',
          text: 'text-cyan-300',
          icon: <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        };
      case 'DATA_CONFLICT':
        return {
          label: isHindi ? 'डेटा में असंगति' : 'Data Conflict Detected',
          bg: 'bg-red-950/60',
          border: 'border-red-500/50',
          text: 'text-red-300',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        };
      case 'INSUFFICIENT_DATA':
      default:
        return {
          label: isHindi ? 'आवश्यक जन्म डेटा उपलब्ध नहीं' : 'Insufficient Data',
          bg: 'bg-gray-900/60',
          border: 'border-gray-600/50',
          text: 'text-gray-400',
          icon: <HelpCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        };
    }
  };

  const getClassicalBadge = (status: string) => {
    switch (status) {
      case 'ATTESTED_CLASSICAL_FRAMEWORK':
        return {
          label: isHindi ? 'प्रामाणिक शास्त्रीय सिद्धांत' : 'Classical Canon',
          color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'
        };
      case 'NARROW_CLASSICAL_FRAMEWORK':
        return {
          label: isHindi ? 'विशिष्ट शास्त्रीय संदर्भ' : 'Narrow Classical Framework',
          color: 'text-amber-300 border-amber-500/40 bg-amber-950/40'
        };
      case 'TRADITIONAL_LATER_PRACTITIONER':
        return {
          label: isHindi ? 'उत्तर-मध्यकालीन परंपरा' : 'Later Practitioner Tradition',
          color: 'text-blue-300 border-blue-500/40 bg-blue-950/40'
        };
      case 'TRADITIONAL_INTERPRETATION':
        return {
          label: isHindi ? 'पारंपरिक योग विचार' : 'Traditional Association',
          color: 'text-purple-300 border-purple-500/40 bg-purple-950/40'
        };
      default:
        return {
          label: isHindi ? 'पारंपरिक संदर्भ' : 'Traditional Context',
          color: 'text-gray-300 border-gray-600/40 bg-gray-900/40'
        };
    }
  };

  // Filtered Results
  const filteredResults = useMemo(() => {
    if (!collection) return [];
    if (statusFilter === 'ALL') return collection.results;
    if (statusFilter === 'PRESENT') return collection.results.filter(r => r.status === 'PRESENT');
    if (statusFilter === 'SPECIAL') return collection.results.filter(r => r.status === 'SPECIAL_CASE');
    if (statusFilter === 'NOT_PRESENT') return collection.results.filter(r => r.status === 'NOT_PRESENT');
    return collection.results;
  }, [collection, statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030a08] via-[#05140e] to-[#082218] font-sans text-white pb-28">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#030a08]/90 backdrop-blur-md border-b border-[#d4af37]/25 px-4 py-3.5 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('dashboard')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-black/40 border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer"
              title={isHindi ? 'मुख्य पृष्ठ पर वापस जाएँ' : 'Back to Dashboard'}
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  {isHindi ? 'दोष एवं उपाय' : 'Dosh & Remedies'}
                </h1>
                <span className="text-[11px] bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/50 px-2 py-0.5 rounded-full font-bold">
                  {isHindi ? 'विस्तृत विश्लेषण' : 'Analysis'}
                </span>
              </div>
              <p className="text-xs text-[#d4af37]/80 font-medium">
                {isHindi ? 'पारंपरिक ज्योतिषीय संकेतों का वस्तुनिष्ठ विश्लेषण' : 'Objective Analysis of Traditional Indicators'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-5 sm:px-6 flex flex-col gap-5">
        {/* Informational Classical Disclaimer Banner */}
        <div className="bg-[#041d13]/90 border border-[#d4af37]/40 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3 relative z-10">
            <div className="p-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/50 text-[#d4af37] shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#fef08a] uppercase tracking-wider">
                {isHindi ? 'शास्त्रीय एवं वैज्ञानिक दृष्टि' : 'Classical & Ethical Guidance'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {isHindi
                  ? 'यह विश्लेषण पारंपरिक ज्योतिषीय प्रणालियों पर आधारित है। इसे वैज्ञानिक रूप से प्रमाणित भविष्यवाणी या निश्चित परिणाम न माना जाए। ग्रह स्थितियाँ जीवन के विभिन्न आयामों में अनुशासन, सजगता और कर्म-शुद्धि की प्रेरणा देती हैं, भय या नियतिवाद की नहीं।'
                  : 'This analysis evaluates traditional celestial frameworks. It is an exploration of traditional tendencies, discipline, and awareness—not a fatalistic curse, guaranteed prediction, or medical/financial diagnosis.'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card Summary */}
        {profile && (
          <div className="bg-black/30 border border-[#d4af37]/25 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-[#d4af37] font-semibold">{profile.name}</span>
              <span className="text-gray-500">•</span>
              <span>{profile.dob}</span>
              <span className="text-gray-500">•</span>
              <span>{profile.place}</span>
            </div>
            <span className="text-[#d4af37]/75 font-mono text-[11px] shrink-0">
              {isHindi ? 'सक्रिय जन्मांग' : 'Active Chart'}
            </span>
          </div>
        )}

        {/* Status Filter Tabs (Touch Friendly >= 44px) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`min-h-[44px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-black/40 border border-[#d4af37]/30 text-gray-300 hover:text-white'
            }`}
          >
            {isHindi ? 'सभी विश्लेषण (7)' : 'All Analyses (7)'}
          </button>
          <button
            onClick={() => setStatusFilter('PRESENT')}
            className={`min-h-[44px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'PRESENT'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-black/40 border border-amber-500/30 text-amber-300 hover:text-amber-200'
            }`}
          >
            {isHindi ? 'सक्रिय संकेत' : 'Present Indications'}
          </button>
          <button
            onClick={() => setStatusFilter('SPECIAL')}
            className={`min-h-[44px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'SPECIAL'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-black/40 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200'
            }`}
          >
            {isHindi ? 'विशेष स्थितियाँ' : 'Special Cases'}
          </button>
          <button
            onClick={() => setStatusFilter('NOT_PRESENT')}
            className={`min-h-[44px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'NOT_PRESENT'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-black/40 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200'
            }`}
          >
            {isHindi ? 'संकेत रहित' : 'Not Present'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#d4af37] font-medium">
              {isHindi ? 'सात प्रामाणिक दोष प्रणालियों का विश्लेषण हो रहा है...' : 'Evaluating seven deterministic dosha frameworks...'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-950/40 border border-red-500/50 rounded-2xl p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-red-200">{error}</p>
            <button
              onClick={() => navigate('dashboard')}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 cursor-pointer"
            >
              {isHindi ? 'डैशबोर्ड पर लौटें' : 'Return to Dashboard'}
            </button>
          </div>
        )}

        {/* Analysis Cards Grid */}
        {!loading && !error && collection && (
          <div className="flex flex-col gap-4">
            {filteredResults.map((result) => {
              const badge = getStatusBadge(result.status);
              const classicalBadge = getClassicalBadge(result.classicalStatus);

              return (
                <div
                  key={result.doshId}
                  className="bg-[#051811]/90 border border-[#d4af37]/35 hover:border-[#d4af37]/70 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col gap-3.5 relative overflow-hidden"
                >
                  {/* Top Bar: Titles & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                          {isHindi ? result.titleHindi : result.title}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${classicalBadge.color}`}>
                          {classicalBadge.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isHindi ? result.title : result.titleHindi} • {result.traditionalScope}
                      </p>
                    </div>

                    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${badge.bg} ${badge.border} ${badge.text} shrink-0 self-start sm:self-auto`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Indication & Summary Text */}
                  <div className="bg-black/40 border border-[#d4af37]/15 rounded-xl p-3 text-xs sm:text-sm space-y-1.5">
                    <p className="text-gray-100 font-medium leading-relaxed">
                      {isHindi ? result.primaryIndication.hi : result.primaryIndication.en}
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {isHindi ? result.summaryIndication.hi : result.summaryIndication.en}
                    </p>
                  </div>

                  {/* Engine Specific Feature Highlights */}
                  {result.doshId === 'KALA_SARPA_TRADITION' && (
                    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300">
                      <span className="px-2 py-0.5 rounded bg-black/50 border border-gray-700">
                        {isHindi ? 'वर्गीकरण:' : 'Class:'} {(result.engineSpecificDetails as any).classification}
                      </span>
                      {(result.engineSpecificDetails as any).classification !== 'NOT_DETECTED' &&
                        (result.engineSpecificDetails as any).traditionalFormIfAvailable && (
                        <span className="px-2 py-0.5 rounded bg-black/50 border border-[#d4af37]/30 text-[#fef08a]">
                          {isHindi
                            ? (result.engineSpecificDetails as any).traditionalFormIfAvailable.nameHindi
                            : (result.engineSpecificDetails as any).traditionalFormIfAvailable.name}
                        </span>
                      )}
                      {(result.engineSpecificDetails as any).classification === 'NOT_DETECTED' && (
                        <span className="text-gray-400 text-[11px] italic">
                          {isHindi ? 'इस framework में कालसर्प संकेत नहीं मिला' : 'No alignment in framework'}
                        </span>
                      )}
                    </div>
                  )}

                  {result.doshId === 'KEMADRUMA_ANALYSIS' && (
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2 py-0.5 rounded bg-black/50 border border-gray-700 text-gray-300">
                        {isHindi ? 'मूल केमद्रुम:' : 'Base:'} {(result.engineSpecificDetails as any).baseIndication}
                      </span>
                      <span className={`px-2 py-0.5 rounded border font-semibold ${
                        (result.engineSpecificDetails as any).bhangaPresent
                          ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                          : 'border-gray-700 bg-black/50 text-gray-400'
                      }`}>
                        {isHindi ? 'शास्त्रीय भंग:' : 'Bhanga:'} {(result.engineSpecificDetails as any).bhangaPresent ? (isHindi ? 'सक्रिय (Bhanga Active)' : 'Active') : (isHindi ? 'भंग उपस्थित नहीं' : 'None')}
                      </span>
                    </div>
                  )}

                  {result.doshId === 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS' && (
                    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300">
                      <span className="px-2 py-0.5 rounded bg-black/50 border border-gray-700">
                        {isHindi ? 'गोचर स्थिति:' : 'Transit:'} {(result.engineSpecificDetails as any).classification}
                      </span>
                      {(result.engineSpecificDetails as any).phaseHindi && (
                        <span className="px-2 py-0.5 rounded bg-black/50 border border-cyan-500/40 text-cyan-300">
                          {isHindi ? (result.engineSpecificDetails as any).phaseHindi : (result.engineSpecificDetails as any).phase}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom Action Bar: View Details + Evidence Tag */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#d4af37]/15">
                    <span className="text-[11px] text-gray-400 truncate max-w-[200px] sm:max-w-xs font-mono">
                      {result.traditionLineage}
                    </span>

                    <div className="flex items-center gap-2">
                      {result.evidenceRecords.length > 0 && (
                        <span className="text-[11px] text-[#fef08a] bg-[#d4af37]/15 border border-[#d4af37]/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Search className="w-3 h-3 text-[#d4af37]" />
                          <span>{result.evidenceRecords.length} {isHindi ? 'प्रमाण' : 'Records'}</span>
                        </span>
                      )}

                      <button
                        onClick={() => setSelectedDosh(result)}
                        className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#fef08a] text-xs font-bold hover:bg-[#d4af37]/35 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>{isHindi ? 'विस्तार देखें' : 'View Details'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Source-Verified Remedies Layer Summary Section */}
        <div className="mt-4 bg-gradient-to-r from-[#03150e] via-[#052216] to-[#03150e] border border-[#d4af37]/40 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                {isHindi ? 'वैदिक उपाय एवं आध्यात्मिक मार्गदर्शन' : 'Vedic Remedies & Spiritual Guidance'}
              </h2>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-bold">
              {isHindi ? 'स्रोत-सत्यापित संकलन सक्रिय' : 'Source-Verified Catalog Active'}
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {isHindi
              ? 'प्रत्येक दोष विश्लेषण के साथ पूर्णतः सात्विक, स्वावलंबी एवं पारंपरिक स्रोतों (पाराशर होरा शास्त्र, पुराण, उपनिषद) पर आधारित मार्गदर्शन संलग्न है। किसी भी कार्ड पर "विस्तार देखें" दबाकर प्रामाणिक उपाय व स्रोत संदर्भ देखें।'
              : 'Each dosha analysis is coupled with strictly sattvic, autonomous, and traditional source-verified guidance (Parashari canon, Puranas, Upanishads). Tap "View Details" on any card to inspect approved guidance and exact citations.'}
          </p>
        </div>
      </main>

      {/* Detail Modal / Drawer (Touch-Accessible & Fully Mobile Responsive) */}
      {selectedDosh && (() => {
        const remedyEval = RemedyEligibilityService.evaluateEligibility(selectedDosh);

        return (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedDosh(null)}
        >
          <div
            className="w-full sm:max-w-2xl bg-[#03100a] border border-[#d4af37]/60 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto custom-scrollbar space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#d4af37]/20 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-[#fef08a]">
                    {isHindi ? selectedDosh.titleHindi : selectedDosh.title}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getClassicalBadge(selectedDosh.classicalStatus).color}`}>
                    {getClassicalBadge(selectedDosh.classicalStatus).label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isHindi ? selectedDosh.title : selectedDosh.titleHindi}
                </p>
              </div>

              <button
                onClick={() => setSelectedDosh(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title={isHindi ? 'बंद करें' : 'Close'}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Lineage Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-black/50 border border-[#d4af37]/20 rounded-xl p-3 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider text-[10px] block">
                  {isHindi ? 'विश्लेषण स्थिति' : 'Evaluation Status'}
                </span>
                <span className="text-sm font-bold text-white block">
                  {getStatusBadge(selectedDosh.status).label}
                </span>
                <span className="text-[11px] text-gray-400 block font-mono">
                  ID: {selectedDosh.doshId}
                </span>
              </div>

              <div className="bg-black/50 border border-[#d4af37]/20 rounded-xl p-3 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider text-[10px] block">
                  {isHindi ? 'शास्त्रीय स्रोत एवं परंपरा' : 'Traditional Lineage'}
                </span>
                <span className="text-xs font-semibold text-white block">
                  {selectedDosh.traditionLineage}
                </span>
                <span className="text-[11px] text-[#fef08a]/80 block">
                  {selectedDosh.traditionalScope}
                </span>
              </div>
            </div>

            {/* Detailed Interpretation */}
            <div className="bg-[#051c13]/70 border border-[#d4af37]/25 rounded-xl p-4 space-y-2 text-xs sm:text-sm">
              <h4 className="text-xs font-bold text-[#fef08a] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{isHindi ? 'पारंपरिक व्याख्या' : 'Traditional Interpretation'}</span>
              </h4>
              <p className="text-gray-200 leading-relaxed">
                {isHindi ? selectedDosh.primaryIndication.hi : selectedDosh.primaryIndication.en}
              </p>
              <p className="text-gray-400 text-xs leading-relaxed pt-1 border-t border-[#d4af37]/15">
                {isHindi ? selectedDosh.summaryIndication.hi : selectedDosh.summaryIndication.en}
              </p>
            </div>

            {/* Source-Verified Traditional Remedies & Guidance Section */}
            <div className="bg-gradient-to-b from-[#03150e] to-[#010905] border border-[#d4af37]/40 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <h4 className="text-xs sm:text-sm font-bold text-[#fef08a] uppercase tracking-wider">
                    {isHindi ? 'वैदिक उपाय एवं आध्यात्मिक मार्गदर्शन' : 'Vedic Remedies & Spiritual Guidance'}
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#fef08a] font-mono">
                  {remedyEval.eligibleRemedies.length} {isHindi ? 'मार्गदर्शन उपलब्ध' : 'Available'}
                </span>
              </div>

              {/* Bhanga Active Notice */}
              {remedyEval.hasBhanga && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 leading-relaxed font-medium">
                  {isHindi ? remedyEval.bhangaNoticeHi : remedyEval.bhangaNoticeEn}
                </div>
              )}

              {/* Guidance Context Notice */}
              <p className="text-xs text-gray-300 leading-relaxed italic">
                {isHindi ? remedyEval.guidanceNoticeHi : remedyEval.guidanceNoticeEn}
              </p>

              {/* List of Approved Remedies */}
              {remedyEval.eligibleRemedies.length === 0 ? (
                <div className="p-3 bg-black/40 border border-gray-800 rounded-xl text-gray-400 text-xs text-center">
                  {isHindi
                    ? 'इस ज्योतिषीय स्थिति में कोई अनिवार्य निवारक उपाय आवश्यक नहीं है।'
                    : 'No corrective remedy is required for this specific astrological indication.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {remedyEval.eligibleRemedies.map((rem) => {
                    const isNatureCorrective = rem.nature === 'CORRECTIVE';
                    const isNatureMatching = rem.nature === 'MATCHING_GUIDELINE';

                    return (
                      <div
                        key={rem.remedyId}
                        className="bg-black/50 border border-[#d4af37]/25 rounded-xl p-3.5 space-y-2.5 hover:border-[#d4af37]/50 transition-colors"
                      >
                        {/* Remedy Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-gray-800/80 pb-2">
                          <h5 className="text-xs sm:text-sm font-bold text-white">
                            {isHindi ? rem.titleHi : rem.titleEn}
                          </h5>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                                isNatureCorrective
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                  : isNatureMatching
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                  : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                              }`}
                            >
                              {rem.nature === 'CORRECTIVE'
                                ? isHindi ? 'निवारक मार्गदर्शन' : 'Corrective Guidance'
                                : rem.nature === 'MATCHING_GUIDELINE'
                                ? isHindi ? 'कुंडली मिलान विचार' : 'Horoscope Matching'
                                : isHindi ? 'वैकल्पिक आध्यात्मिक अभ्यास' : 'Optional Practice'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-gray-700 text-gray-300 font-mono">
                              {rem.category}
                            </span>
                          </div>
                        </div>

                        {/* Practice & Instructions */}
                        <div className="space-y-1 text-xs">
                          <p className="text-gray-200 font-medium leading-relaxed">
                            {isHindi ? rem.practiceHi : rem.practiceEn}
                          </p>
                          <p className="text-gray-300 leading-relaxed text-[11px]">
                            {isHindi ? rem.instructionHi : rem.instructionEn}
                          </p>
                        </div>

                        {/* Sanskrit Mantra Box if present */}
                        {rem.canonicalDevanagari && (
                          <div className="bg-[#051c14] border border-[#d4af37]/35 rounded-lg p-2.5 space-y-1.5">
                            <span className="text-[10px] font-bold text-[#fef08a] uppercase tracking-wider block">
                              {isHindi ? 'वैदिक / स्तोत्र मंत्र' : 'Vedic / Stotra Mantra'}
                            </span>
                            <p className="font-serif text-sm text-[#fef08a] whitespace-pre-line leading-relaxed">
                              {rem.canonicalDevanagari}
                            </p>
                            {rem.iastText && (
                              <p className="font-mono text-[10px] text-gray-400 whitespace-pre-line leading-relaxed">
                                {rem.iastText}
                              </p>
                            )}
                            {rem.mantraMeaningHi && (
                              <p className="text-[11px] text-gray-300 italic pt-1 border-t border-[#d4af37]/15">
                                {isHindi ? rem.mantraMeaningHi : rem.mantraMeaningEn}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Source Metadata & Evidence Badge */}
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-2.5 text-[11px] space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-gray-300">
                              <strong className="text-gray-400">{isHindi ? 'स्रोत:' : 'Source:'}</strong> {rem.sourceName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                  rem.sourceClassification === 'CLASSICAL'
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                    : 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                                }`}
                              >
                                {rem.sourceClassification === 'CLASSICAL'
                                  ? isHindi ? 'शास्त्रीय प्रमाण' : 'Classical Canon'
                                  : isHindi ? 'पारंपरिक प्रमाण' : 'Traditional Lineage'}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                  rem.doshSpecificSupport === 'YES'
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                    : rem.doshSpecificSupport === 'UNCERTAIN'
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                    : 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                                }`}
                              >
                                {rem.doshSpecificSupport === 'YES'
                                  ? isHindi ? 'दोष-विशिष्ट विधान' : 'Directly Prescribed'
                                  : rem.doshSpecificSupport === 'UNCERTAIN'
                                  ? isHindi ? 'पारंपरिक अनुप्रयोग' : 'Traditional Association'
                                  : isHindi ? 'सामान्य वैदिक प्रार्थना' : 'General Vedic Prayer'}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-400 text-[10px] font-mono">
                            {isHindi ? 'संदर्भ:' : 'Ref:'} {rem.reference}
                          </p>
                          {rem.displayNotesHi ? (
                            <p className="text-amber-300/90 text-[10px] italic">
                              {isHindi ? rem.displayNotesHi : rem.displayNotesEn}
                            </p>
                          ) : rem.doshSpecificSupport !== 'YES' ? (
                            <p className="text-amber-400/90 text-[10px] italic">
                              {isHindi
                                ? 'स्रोत उपलब्ध है, लेकिन इस Dosh के लिए विशेष prescription स्पष्ट रूप से स्थापित नहीं है।'
                                : 'Source is verified, but specific prescription for this Dosh is a traditional association.'}
                            </p>
                          ) : null}
                          <p className="text-gray-500 text-[10px]">
                            {isHindi
                              ? 'अध्याय/श्लोक क्रम संस्करण के अनुसार भिन्न हो सकता है।'
                              : 'Chapter/verse numbering may vary across scholarly editions.'}
                          </p>
                        </div>

                        {/* Safety Note */}
                        <div className="text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-500/20 rounded p-2">
                          <strong>{isHindi ? 'सुरक्षा निर्देश: ' : 'Safety Note: '}</strong>
                          {isHindi ? rem.safetyNoteHi : rem.safetyNoteEn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Universal Safety Constitution Disclaimer */}
              <div className="p-3 bg-black/60 border border-gray-800 rounded-xl text-[10px] text-gray-400 leading-relaxed space-y-1">
                <span className="text-[#fef08a] font-bold block uppercase tracking-wider">
                  {isHindi ? 'सांस्कृतिक एवं आध्यात्मिक मर्यादा' : 'Spiritual & Safety Guidelines'}
                </span>
                <p>
                  {isHindi
                    ? 'यह मार्गदर्शन पारंपरिक ज्योतिषीय/आध्यात्मिक मान्यताओं पर आधारित है। इसे वैज्ञानिक रूप से प्रमाणित उपचार, निश्चित भविष्यवाणी या गारंटीकृत परिणाम न माना जाए। किसी भी स्वास्थ्य, कानूनी या वित्तीय निर्णय के लिए संबंधित योग्य विशेषज्ञ की सलाह लें।'
                    : 'This guidance is grounded in traditional astrological/spiritual perspectives. It must not be considered a scientifically proven cure, certain prediction, or guaranteed outcome. Consult qualified professionals for health, legal, or financial decisions.'}
                </p>
              </div>
            </div>

            {/* Engine Specific Details Inspector */}
            <div className="bg-black/60 border border-gray-800 rounded-xl p-3.5 text-xs space-y-2">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{isHindi ? 'विस्तृत ग्रहीय तथ्य' : 'Calculated Astronomical Facts'}</span>
              </h4>
              <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 bg-[#010403] rounded border border-gray-900 font-mono text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(selectedDosh.engineSpecificDetails, null, 2)}
              </div>
            </div>

            {/* Read-Only Evidence Records Section (If Available) */}
            {selectedDosh.evidenceRecords.length > 0 && (
              <div className="bg-[#062016]/80 border border-[#d4af37]/40 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#fef08a] uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>{isHindi ? '🔍 प्रामाणिक साक्ष्य अभिलेख' : '🔍 Verified Evidence Ledger Records'}</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-[#d4af37]/30 text-[#d4af37] font-mono">
                    {selectedDosh.evidenceRecords.length} {isHindi ? 'अभिलेख' : 'Records'}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {selectedDosh.evidenceRecords.map((ev, idx) => (
                    <div key={idx} className="bg-black/50 border border-gray-800 rounded-lg p-2.5 space-y-1">
                      {ev.evidenceId && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400 font-mono">ID: {ev.evidenceId}</span>
                          <span className="text-emerald-400 font-semibold">{ev.source}</span>
                        </div>
                      )}
                      {ev.description && (
                        <p className="text-gray-200 text-xs">{ev.description}</p>
                      )}
                      {ev.fingerprint && (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-900 text-[10px] font-mono text-gray-400">
                          <span className="truncate">SHA-256: {ev.fingerprint}</span>
                          <button
                            onClick={() => handleCopyFingerprint(ev.fingerprint!)}
                            className="text-[#d4af37] hover:underline cursor-pointer shrink-0 min-h-[30px] flex items-center gap-1 px-1.5"
                          >
                            {copiedFingerprint === ev.fingerprint ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <span>{isHindi ? 'कॉपी' : 'Copy'}</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mandatory Disclaimer */}
            <div className="bg-black/40 border border-gray-800 rounded-xl p-3 text-[11px] text-gray-400 space-y-1">
              <span className="text-gray-500 font-bold uppercase tracking-wider block">
                {isHindi ? 'महत्वपूर्ण सूचना' : 'Important Notice'}
              </span>
              <p>{isHindi ? selectedDosh.disclaimer.hi : selectedDosh.disclaimer.en}</p>
            </div>

            {/* Close Modal Button (>= 44px) */}
            <button
              onClick={() => setSelectedDosh(null)}
              className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md"
            >
              {isHindi ? 'विवरण बंद करें' : 'Close Details'}
            </button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
