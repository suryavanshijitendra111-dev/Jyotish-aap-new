import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Compass,
  Star,
  Check,
  AlertCircle
} from 'lucide-react';
import { KPAnalysisResult, KPPlanetData, KPCuspData } from '../../services/jyotish/kpEngine';
import { KPJudgmentOutput } from '../../types/jyotish/kpJudgment';
import { KPDeepInterpretationResult } from '../../types/jyotish/kpInterpretation';
import { KPDetailItem } from './KPDetailModal';
import { getLocalizedPlanet, getLocalizedRashi } from '../../i18n/astrology';
import { LanguageCode } from '../../i18n';

interface KPAnswerPanelProps {
  interpretation: KPDeepInterpretationResult;
  judgmentResult: KPJudgmentOutput;
  kpResult: KPAnalysisResult;
  language: LanguageCode;
  onSelectKpDetail: (item: KPDetailItem) => void;
  onOpenPlanetStory?: (planetKey: string) => void;
}

export const KPAnswerPanel: React.FC<KPAnswerPanelProps> = ({
  interpretation,
  judgmentResult,
  kpResult,
  language,
  onSelectKpDetail
}) => {
  const isHindi = language === 'hi';
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // AI Explanation State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // House touch inspection state inside technical section
  const [selectedHouseInfo, setSelectedHouseInfo] = useState<{
    house: number;
    title: string;
    description: string;
  } | null>(null);

  const handleRequestAiExplanation = async () => {
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/prashna-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: interpretation.question,
          language: isHindi ? 'Hindi' : 'English',
          prashnaKundliData: {
            isKpInterpretation: true,
            category: interpretation.categoryLabel[isHindi ? 'hi' : 'en'],
            directAnswer: interpretation.directAnswer[isHindi ? 'hi' : 'en'],
            overallStrength: interpretation.overallStrengthLabel[isHindi ? 'hi' : 'en'],
            harmonyScore: interpretation.harmonyScore,
            supportiveFactors: interpretation.supportiveFactors.map(f => ({
              title: f.title[isHindi ? 'hi' : 'en'],
              description: f.description[isHindi ? 'hi' : 'en']
            })),
            obstacleFactors: interpretation.obstacleFactors.map(f => ({
              title: f.title[isHindi ? 'hi' : 'en'],
              description: f.description[isHindi ? 'hi' : 'en']
            })),
            mixedFactors: interpretation.mixedFactors.map(f => ({
              title: f.title[isHindi ? 'hi' : 'en'],
              description: f.description[isHindi ? 'hi' : 'en']
            })),
            cuspInterpretation: interpretation.cuspInterpretation.interpretation[isHindi ? 'hi' : 'en'],
            rulingPlanetInterpretation: interpretation.rulingPlanetInterpretation.interpretation[isHindi ? 'hi' : 'en'],
            contradictionAnalysis: interpretation.contradictionAnalysis[isHindi ? 'hi' : 'en'],
            practicalGuidance: interpretation.practicalGuidance.map(g => g[isHindi ? 'hi' : 'en']),
            uncertaintyNote: interpretation.uncertaintyNote[isHindi ? 'hi' : 'en']
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.interpretation || data.answer || data.text) {
          setAiExplanation(data.interpretation || data.answer || data.text);
          setAiLoading(false);
          return;
        }
      }
    } catch {
      // Fallback below
    }

    // High quality deterministic fallback explanation
    const fallback = isHindi
      ? `### 1. प्रश्न का सीधा उत्तर\n${interpretation.directAnswer.hi}\n\n### 2. समर्थन के मुख्य आधार\n${interpretation.supportiveFactors.map(f => `• **${f.title.hi}:** ${f.description.hi}`).join('\n') || 'कोई विशेष अनुकूल कारक नहीं मिला।'}\n\n### 3. संभावित रुकावटें व पेचीदगियाँ\n${interpretation.obstacleFactors.map(f => `• **${f.title.hi}:** ${f.description.hi}`).join('\n') || 'कोई गंभीर रुकावट के संकेत नहीं हैं।'}\n\n### 4. अंतर्विरोध एवं संतुलन विश्लेषण\n${interpretation.contradictionAnalysis.hi}\n\n### 5. कस्प उप-स्वामी व रूलिंग ग्रह\n${interpretation.cuspInterpretation.interpretation.hi}\n${interpretation.rulingPlanetInterpretation.interpretation.hi}\n\n### 6. व्यावहारिक मार्गदर्शन\n${interpretation.practicalGuidance.map((g, i) => `${i + 1}. ${g.hi}`).join('\n')}\n\n### 7. पारम्परिक मर्यादा सूचना\n${interpretation.uncertaintyNote.hi}`
      : `### 1. Direct Answer\n${interpretation.directAnswer.en}\n\n### 2. Key Supportive Factors\n${interpretation.supportiveFactors.map(f => `• **${f.title.en}:** ${f.description.en}`).join('\n') || 'No major supportive factors identified.'}\n\n### 3. Potential Obstacles & Friction\n${interpretation.obstacleFactors.map(f => `• **${f.title.en}:** ${f.description.en}`).join('\n') || 'No critical obstacles detected.'}\n\n### 4. Contradiction & Balance Analysis\n${interpretation.contradictionAnalysis.en}\n\n### 5. Cusp Sub Lord & Ruling Planets\n${interpretation.cuspInterpretation.interpretation.en}\n${interpretation.rulingPlanetInterpretation.interpretation.en}\n\n### 6. Practical Guidance\n${interpretation.practicalGuidance.map((g, i) => `${i + 1}. ${g.en}`).join('\n')}\n\n### 7. Traditional Perspective & Scope\n${interpretation.uncertaintyNote.en}`;

    setAiExplanation(fallback);
    setAiLoading(false);
  };

  const getStatusBadge = () => {
    switch (interpretation.resultType) {
      case 'SUPPORTIVE':
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          label: isHindi ? 'अनुकूल संकेत' : 'Favourable Indicators'
        };
      case 'MIXED_CONDITIONAL':
        return {
          bg: 'bg-amber-950/80 border-amber-500/60 text-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          label: isHindi ? 'मिश्रित / शर्तों के साथ' : 'Mixed / Conditional'
        };
      case 'CHALLENGING_DELAY':
        return {
          bg: 'bg-rose-950/80 border-rose-500/60 text-rose-300',
          icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          label: isHindi ? 'चुनौतीपूर्ण / विलंब' : 'Challenging / Delay'
        };
      default:
        return {
          bg: 'bg-gray-900 border-gray-700 text-gray-300',
          icon: <HelpCircle className="w-5 h-5 text-gray-400 shrink-0" />,
          label: isHindi ? 'अपर्याप्त डेटा' : 'Insufficient Data'
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* 1. प्रश्न (Question Banner) */}
      {/* ============================================================ */}
      <div className="bg-black/50 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center shrink-0 mt-0.5">
            <Compass className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                {isHindi ? 'आपका प्रश्न' : 'Your Inquiry'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                {interpretation.categoryLabel[isHindi ? 'hi' : 'en']}
              </span>
            </div>
            <p className="text-white font-medium text-sm sm:text-base mt-1">
              "{interpretation.question}"
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice if applicable */}
      {interpretation.safetyNote && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>{interpretation.safetyNote[isHindi ? 'hi' : 'en']}</p>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. ⭐ आपका उत्तर (Direct User Answer First!) */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-br from-[#0a2318] via-[#04120c] to-black border-2 border-[#d4af37]/50 rounded-2xl p-5 sm:p-6 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#d4af37]/20">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />
            <h3 className="text-base sm:text-lg font-bold text-[#d4af37] uppercase tracking-wider">
              {isHindi ? '⭐ आपका उत्तर' : '⭐ Your Answer'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
              {statusBadge.icon}
              <span>{interpretation.overallStrengthLabel[isHindi ? 'hi' : 'en']}</span>
            </span>
          </div>
        </div>

        {/* Direct Narrative Answer */}
        <p className="text-gray-100 text-sm sm:text-base leading-relaxed font-sans mb-4">
          {interpretation.directAnswer[isHindi ? 'hi' : 'en']}
        </p>

        {/* Qualitative Traditional Indicator Status (No numeric score shown to user) */}
        <div className="bg-black/60 border border-gray-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{isHindi ? 'संकेत स्थिति:' : 'Indicator Status:'}</span>
            <span className="font-bold text-[#d4af37]">
              {interpretation.overallStrengthLabel[isHindi ? 'hi' : 'en']}
            </span>
          </div>
          <div className="text-[11px] text-gray-400 italic">
            {isHindi ? 'पारंपरिक KP ज्योतिषीय संकेत, निश्चित भविष्यवाणी नहीं।' : 'Traditional KP directional indicator, not absolute prediction.'}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. 🟢 समर्थन के संकेत (Supportive Factors) */}
      {/* ============================================================ */}
      {interpretation.supportiveFactors.length > 0 && (
        <div className="bg-black/50 border border-emerald-900/50 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-emerald-900/40 pb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">
              {isHindi ? '🟢 समर्थन के संकेत' : '🟢 Supportive Indicators'}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interpretation.supportiveFactors.map((factor, idx) => (
              <div
                key={idx}
                className="bg-[#071810] border border-emerald-800/40 rounded-xl p-3.5 flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-emerald-300">
                    {factor.title[isHindi ? 'hi' : 'en']}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pl-6">
                  {factor.description[isHindi ? 'hi' : 'en']}
                </p>
                {factor.planets && factor.planets.length > 0 && (
                  <div className="pl-6 pt-1 flex flex-wrap gap-1">
                    {factor.planets.map(p => (
                      <span
                        key={p}
                        className="text-[9px] px-2 py-0.5 rounded bg-black/60 border border-emerald-700/40 text-emerald-300"
                      >
                        {getLocalizedPlanet(p, language)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. 🟡 मिश्रित संकेत (Mixed Factors) */}
      {/* ============================================================ */}
      {interpretation.mixedFactors.length > 0 && (
        <div className="bg-black/50 border border-amber-900/50 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-amber-900/40 pb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h4 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">
              {isHindi ? '🟡 मिश्रित संकेत (शर्तें व पेचीदगियाँ)' : '🟡 Mixed Indicators (Conditional Factors)'}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interpretation.mixedFactors.map((factor, idx) => (
              <div
                key={idx}
                className="bg-[#141006] border border-amber-800/40 rounded-xl p-3.5 flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-300">
                    {factor.title[isHindi ? 'hi' : 'en']}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pl-6">
                  {factor.description[isHindi ? 'hi' : 'en']}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. 🔴 संभावित बाधाएँ (Obstacle Factors) */}
      {/* ============================================================ */}
      {interpretation.obstacleFactors.length > 0 && (
        <div className="bg-black/50 border border-rose-900/50 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-rose-900/40 pb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h4 className="text-xs sm:text-sm font-bold text-rose-400 uppercase tracking-wider">
              {isHindi ? '🔴 संभावित बाधाएँ व विलंब' : '🔴 Potential Obstacles & Delays'}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interpretation.obstacleFactors.map((factor, idx) => (
              <div
                key={idx}
                className="bg-[#180a0d] border border-rose-800/40 rounded-xl p-3.5 flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-xs font-bold text-rose-300">
                    {factor.title[isHindi ? 'hi' : 'en']}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pl-6">
                  {factor.description[isHindi ? 'hi' : 'en']}
                </p>
                {factor.planets && factor.planets.length > 0 && (
                  <div className="pl-6 pt-1 flex flex-wrap gap-1">
                    {factor.planets.map(p => (
                      <span
                        key={p}
                        className="text-[9px] px-2 py-0.5 rounded bg-black/60 border border-rose-800/40 text-rose-300"
                      >
                        {getLocalizedPlanet(p, language)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. 🔎 यह निष्कर्ष क्यों? (Why This Conclusion?) */}
      {/* ============================================================ */}
      <div className="bg-black/50 border border-gray-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <h4 className="text-xs sm:text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#d4af37]" />
          <span>{isHindi ? '🔎 यह निष्कर्ष क्यों?' : '🔎 Why This Conclusion?'}</span>
        </h4>
        <div className="p-4 bg-[#0a1812] border border-emerald-900/40 rounded-xl space-y-3 text-xs sm:text-sm text-gray-100">
          <p className="leading-relaxed">
            {interpretation.contradictionAnalysis[isHindi ? 'hi' : 'en']}
          </p>
          <div className="pt-2.5 border-t border-emerald-900/40 space-y-2 text-xs text-gray-300">
            <p>
              <strong className="text-[#d4af37] font-semibold">{isHindi ? 'कस्प Sub Lord विश्लेषण:' : 'Cusp Sub Lord:'}</strong>{' '}
              {interpretation.cuspInterpretation.interpretation[isHindi ? 'hi' : 'en']}
            </p>
            <p>
              <strong className="text-[#d4af37] font-semibold">{isHindi ? 'Ruling Planets (RP) पुष्टि:' : 'Ruling Planets Corroboration:'}</strong>{' '}
              {interpretation.rulingPlanetInterpretation.interpretation[isHindi ? 'hi' : 'en']}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. 🧭 व्यावहारिक मार्गदर्शन (Practical Guidance) */}
      {/* ============================================================ */}
      <div className="bg-black/50 border border-gray-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <h4 className="text-xs sm:text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#d4af37]" />
          <span>{isHindi ? '🧭 व्यावहारिक मार्गदर्शन' : '🧭 Practical Guidance'}</span>
        </h4>
        <div className="space-y-2">
          {interpretation.practicalGuidance.map((tip, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#0a1812] border border-gray-800 rounded-xl flex items-start gap-2.5 text-xs text-gray-200"
            >
              <ArrowRight className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
              <span>{tip[isHindi ? 'hi' : 'en']}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 italic pt-1">
          {interpretation.uncertaintyNote[isHindi ? 'hi' : 'en']}
        </p>
      </div>

      {/* ============================================================ */}
      {/* 8. 🤖 AI से सरल भाषा में समझें (AI Explanation) */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-[#082218] to-[#0a1812] border border-[#d4af37]/40 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#d4af37] flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>{isHindi ? 'AI से सरल भाषा में समझें' : 'Explain in Simple Language with AI'}</span>
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isHindi
                ? 'AI केवल ऊपर निकाले गए वास्तविक KP परिणामों की व्याख्या करता है, कोई नया फलादेश नहीं गढ़ता।'
                : 'AI strictly interprets the above deterministic interpretation without altering data.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRequestAiExplanation}
            disabled={aiLoading}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-[#0a2318] to-[#123e2b] border border-[#d4af37]/60 hover:border-[#d4af37] text-[#d4af37] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d4af37]/20 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isHindi ? 'विश्लेषण जारी...' : 'Interpreting...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isHindi ? 'AI व्याख्या देखें' : 'View AI Explanation'}</span>
              </>
            )}
          </button>
        </div>

        {/* AI Output Card */}
        {aiExplanation && (
          <div className="mt-4 p-4 bg-black/60 border border-emerald-900/60 rounded-xl space-y-3 text-xs text-gray-200 leading-relaxed font-sans animate-in fade-in duration-300">
            <div className="prose prose-invert max-w-none text-xs whitespace-pre-line">
              {aiExplanation}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 9. "तकनीकी KP गणना देखें" (Expandable Section) */}
      {/* ============================================================ */}
      <div className="border border-gray-800 rounded-2xl overflow-hidden bg-black/40">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs sm:text-sm font-bold text-gray-300">
              {isHindi ? 'तकनीकी KP गणना देखें (Cusps, Sub-Lords, 4-Fold & RPs)' : 'View Technical KP Calculation (Cusps, Sub-Lords, 4-Fold & RPs)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>{showTechnicalDetails ? (isHindi ? 'छिपाएँ' : 'Hide') : (isHindi ? 'खोलें' : 'Expand')}</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-4 sm:p-5 border-t border-gray-800 space-y-5 animate-in fade-in duration-200">
            {/* Diagnostic Score (Internal Only) */}
            <div className="p-3 bg-black/60 border border-gray-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {isHindi ? 'आंतरिक सामंजस्य स्कोर (डायग्नोस्टिक/तकनीकी):' : 'Internal Harmony Score (Technical Diagnostic):'}
              </span>
              <span className="text-[#d4af37] font-mono font-bold text-sm">{interpretation.harmonyScore}/100</span>
            </div>

            {/* Target Houses Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                {isHindi ? 'लक्षित एवं सहायक भाव:' : 'Target & Supporting Houses:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {judgmentResult.targetHouses.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSelectedHouseInfo({
                      house: h,
                      title: isHindi ? `लक्षित भाव ${h}` : `Target House ${h}`,
                      description: isHindi ? `यह इस विषय के फलित का मुख्य भाव है।` : `Primary house for this event fructification.`
                    })}
                    className="px-3 py-1 rounded-lg bg-[#0a2318] border border-emerald-600/60 text-emerald-300 text-xs font-bold flex items-center gap-1 hover:border-emerald-400 cursor-pointer"
                  >
                    <span>{isHindi ? `भाव ${h}` : `House ${h}`}</span>
                    <span className="text-[9px] px-1 rounded bg-emerald-950 text-emerald-400 font-semibold">{isHindi ? 'प्राथमिक' : 'Target'}</span>
                  </button>
                ))}
                {judgmentResult.supportingHouses.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSelectedHouseInfo({
                      house: h,
                      title: isHindi ? `सहायक भाव ${h}` : `Supporting House ${h}`,
                      description: isHindi ? `यह इस विषय के फलित का सहायक भाव है।` : `Supporting house for context.`
                    })}
                    className="px-3 py-1 rounded-lg bg-black/50 border border-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1 hover:border-gray-500 cursor-pointer"
                  >
                    <span>{isHindi ? `भाव ${h}` : `House ${h}`}</span>
                    <span className="text-[9px] px-1 rounded bg-gray-800 text-gray-400">{isHindi ? 'सहायक' : 'Support'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* House Info Popover/Modal */}
            {selectedHouseInfo && (
              <div className="p-3 bg-[#0a1812] border border-[#d4af37]/40 rounded-xl flex items-start justify-between gap-3 text-xs">
                <div>
                  <h5 className="font-bold text-[#d4af37]">{selectedHouseInfo.title}</h5>
                  <p className="text-gray-300 mt-0.5">{selectedHouseInfo.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHouseInfo(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Primary Cusp Sub Lord Card */}
            {judgmentResult.primaryCuspSubLord && (
              <div className="p-3.5 bg-black/60 border border-gray-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#d4af37]">
                    {isHindi ? `मुख्य कस्प ${judgmentResult.primaryCusp} उप-स्वामी:` : `Primary Cusp ${judgmentResult.primaryCusp} Sub Lord:`}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-600/40">
                    {getLocalizedPlanet(judgmentResult.primaryCuspSubLord.subLord, language)}
                  </span>
                </div>
                <p className="text-gray-300">
                  {judgmentResult.primaryCuspSubLord.summary[isHindi ? 'hi' : 'en']}
                </p>
                <div className="text-[11px] text-gray-400 flex items-center gap-1 pt-1">
                  <span>{isHindi ? 'सूचित भाव:' : 'Signifies Houses:'}</span>
                  <span className="text-gray-200 font-mono font-bold">
                    [{judgmentResult.primaryCuspSubLord.subLordSignifies.join(', ')}]
                  </span>
                </div>
              </div>
            )}

            {/* 4-Fold Significators (9 Planet Cards) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  {isHindi ? '4-स्तरीय कार्येश ग्रह (टच करके विवरण देखें):' : '4-Fold Planet Significators (Tap to Inspect):'}
                </span>
                <span className="text-[10px] text-gray-500">9 Navagrahas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {judgmentResult.significatorEvidence.map(pEvidence => {
                  const pd = kpResult.planetData.find(p => p.planet === pEvidence.planet);
                  const sig = kpResult.significators?.byPlanet[pEvidence.planet];

                  return (
                    <button
                      key={pEvidence.planet}
                      type="button"
                      onClick={() => {
                        if (pd) {
                          onSelectKpDetail({
                            type: 'planet',
                            data: pd,
                            significator: sig
                          });
                        }
                      }}
                      className={`min-h-[44px] rounded-xl p-3 text-left border transition-all duration-200 active:scale-95 cursor-pointer flex flex-col justify-between group ${
                        pEvidence.supportLevel === 'STRONG_POSITIVE'
                          ? 'bg-[#0a2318]/70 border-emerald-600/60 hover:border-emerald-400'
                          : pEvidence.supportLevel === 'POSITIVE'
                          ? 'bg-black/50 border-emerald-900/50 hover:border-emerald-600'
                          : pEvidence.supportLevel === 'CHALLENGING'
                          ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-600'
                          : 'bg-black/40 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#d4af37] group-hover:text-amber-300">
                            {getLocalizedPlanet(pEvidence.planet, language)}
                          </span>
                          {pEvidence.isRulingPlanet && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#d4af37]/20 text-[#d4af37] font-semibold border border-[#d4af37]/40">
                              {isHindi ? 'रूलिंग' : 'RP'}
                            </span>
                          )}
                          {pEvidence.isRetrograde && (
                            <span className="text-[9px] px-1 rounded bg-amber-950/80 text-amber-300 font-semibold border border-amber-800/40">
                              {isHindi ? 'वक्री' : 'R'}
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          pEvidence.supportLevel === 'STRONG_POSITIVE'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
                            : pEvidence.supportLevel === 'POSITIVE'
                            ? 'bg-emerald-950/50 text-emerald-400'
                            : pEvidence.supportLevel === 'CHALLENGING'
                            ? 'bg-rose-950/60 text-rose-300'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {pEvidence.supportLevel === 'STRONG_POSITIVE'
                            ? (isHindi ? 'प्रबल अनुकूल' : 'Strong')
                            : pEvidence.supportLevel === 'POSITIVE'
                            ? (isHindi ? 'अनुकूल' : 'Positive')
                            : pEvidence.supportLevel === 'CHALLENGING'
                            ? (isHindi ? 'प्रतिकूल / विलंब' : 'Adverse')
                            : (isHindi ? 'तटस्थ' : 'Neutral')}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-300 space-y-0.5 mt-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{isHindi ? '4-स्तरीय (A/B/C/D):' : '4-Fold (A/B/C/D):'}</span>
                          <span className="text-gray-300 font-mono">
                            {pEvidence.levelA.join(',') || '—'} / {pEvidence.levelB.join(',') || '—'} / {pEvidence.levelC.join(',') || '—'} / {pEvidence.levelD.join(',') || '—'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-0.5">
                          <span className="text-gray-500">{isHindi ? 'लक्षित भाव सम्बंध:' : 'Target Houses:'}</span>
                          <span className="text-[#d4af37] font-bold">
                            {pEvidence.signifiedTargetHouses.length > 0
                              ? pEvidence.signifiedTargetHouses.join(', ')
                              : (isHindi ? 'कोई नहीं' : 'None')}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ruling Planets Corroboration */}
            <div className="p-3.5 bg-[#0a1812] border border-emerald-900/40 rounded-xl space-y-1.5 text-xs">
              <span className="font-bold text-[#d4af37] block">
                {isHindi ? 'रूलिंग ग्रह समर्थन (RP Corroboration):' : 'Ruling Planets Agreement (RP):'}
              </span>
              <p className="text-gray-300">
                {judgmentResult.rulingPlanetSupport.explanation[isHindi ? 'hi' : 'en']}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-gray-400">
                <span>{isHindi ? 'प्राथमिक RPs:' : 'Primary RPs:'}</span>
                {judgmentResult.rulingPlanetSupport.primaryRPList.map(p => (
                  <span
                    key={p}
                    className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-gray-700 text-gray-300"
                  >
                    {getLocalizedPlanet(p, language)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
