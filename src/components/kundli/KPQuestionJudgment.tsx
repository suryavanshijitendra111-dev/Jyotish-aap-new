import React, { useState, useMemo } from 'react';
import {
  Compass,
  Calendar,
  Clock,
  ChevronDown
} from 'lucide-react';
import { KPAnalysisResult } from '../../services/jyotish/kpEngine';
import {
  KPQuestionCategory,
  KPQuestionInput,
  KPJudgmentOutput,
  KP_EVENT_HOUSE_MAPPINGS
} from '../../types/jyotish/kpJudgment';
import { KpJudgmentEngine } from '../../services/jyotish/kpJudgmentEngine';
import { KpInterpretationEngine } from '../../services/jyotish/kpInterpretationEngine';
import { KPDeepInterpretationResult } from '../../types/jyotish/kpInterpretation';
import { KpTimingEngine } from '../../services/jyotish/kpTimingEngine';
import { KPTimingAnalysis } from '../../types/jyotish/kpTiming';
import { KPAnswerPanel } from './KPAnswerPanel';
import { KPTimingPanel } from './KPTimingPanel';
import { KPDetailItem } from './KPDetailModal';
import { LanguageCode } from '../../i18n';
import { MasterKundliData } from '../../types/kundli';

interface KPQuestionJudgmentProps {
  kpResult: KPAnalysisResult;
  masterData?: MasterKundliData | null;
  language: LanguageCode;
  birthLocation?: string;
  onSelectKpDetail: (item: KPDetailItem) => void;
  onOpenPlanetStory?: (planetKey: string) => void;
}

export const KPQuestionJudgment: React.FC<KPQuestionJudgmentProps> = ({
  kpResult,
  masterData,
  language,
  birthLocation = 'India',
  onSelectKpDetail,
  onOpenPlanetStory
}) => {
  const isHindi = language === 'hi';
  const engine = useMemo(() => new KpJudgmentEngine(), []);
  const interpretationEngine = useMemo(() => new KpInterpretationEngine(), []);
  const timingEngine = useMemo(() => new KpTimingEngine(), []);

  // Form State
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<KPQuestionCategory>('career_job');
  const [questionDate, setQuestionDate] = useState(defaultDate);
  const [questionTime, setQuestionTime] = useState(defaultTime);
  const [judgmentResult, setJudgmentResult] = useState<KPJudgmentOutput | null>(null);
  const [interpretationResult, setInterpretationResult] = useState<KPDeepInterpretationResult | null>(null);
  const [timingResult, setTimingResult] = useState<KPTimingAnalysis | null>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalQuestion = question.trim() || (isHindi ? 'क्या मेरा कार्य सिद्ध होगा?' : 'Will my endeavor succeed?');

    const input: KPQuestionInput = {
      question: finalQuestion,
      category,
      questionDate,
      questionTime,
      questionLocation: birthLocation
    };

    const res = engine.evaluateQuestion(kpResult, input);
    setJudgmentResult(res);
    const interp = interpretationEngine.interpret(res, kpResult);
    setInterpretationResult(interp);

    // Initial evaluation (instant feedback)
    const initialTiming = timingEngine.evaluateTiming(masterData, kpResult, res);
    setTimingResult(initialTiming);

    // Enrich with deterministic Swiss Ephemeris real transit
    try {
      const enrichedTiming = await timingEngine.evaluateTimingAsync(masterData, kpResult, res, {
        date: questionDate,
        time: questionTime,
        latitude: masterData?.birthProfile?.latitude,
        longitude: masterData?.birthProfile?.longitude,
        timezone: masterData?.birthProfile?.timezone
      });
      setTimingResult(enrichedTiming);
    } catch (err) {
      console.warn('Real transit asynchronous calculation note:', err);
    }
  };

  const categories = Object.values(KP_EVENT_HOUSE_MAPPINGS);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#082218] via-[#0d3425] to-[#082218] border border-[#d4af37]/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-[#d4af37]" />
              <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest">
                {isHindi ? 'केपी प्रश्न निर्णय (चरण 3B)' : 'KP Question & Event Judgment'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              {isHindi ? 'कृष्णमूर्ति पद्धति आधारित प्रश्न व कार्य सिद्धि विश्लेषण' : 'Deterministic KP Event Judgment Engine'}
            </h3>
            <p className="text-xs text-gray-300 mt-1 max-w-xl">
              {isHindi
                ? 'पारंपरिक KP 4-स्तरीय कार्येश (4-Fold Significators), कस्प उप-स्वामी एवं रूलिंग प्लैनेट्स के गणितीय मिलान पर आधारित वस्तुनिष्ठ निर्णय।'
                : 'Deterministic evaluation based on verified 4-Fold Significators, Primary Cusp Sub-Lord, and Phase 3A Ruling Planets.'}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[10px] px-3 py-1.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] font-bold uppercase tracking-wider">
              {isHindi ? 'प्रामाणिक केपी नियम' : 'KP HORARY RULES'}
            </span>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <form onSubmit={handleAnalyze} className="bg-black/50 border border-gray-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Question Text */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              {isHindi ? 'प्रश्न दर्ज करें (Question Text):' : 'Enter Your Question:'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder={isHindi ? 'उदा. क्या मुझे नई नौकरी मिलेगी? या क्या यह कार्य सफल होगा?' : 'e.g. Will I get the new job? or Will this deal succeed?'}
                className="w-full bg-[#0a1812] border border-gray-700 focus:border-[#d4af37] text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none transition-all placeholder:text-gray-600 min-h-[44px]"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              {isHindi ? 'प्रश्न श्रेणी (15 Categories):' : 'Question Category (15 Categories):'}
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={e => setCategory(e.target.value as KPQuestionCategory)}
                className="w-full bg-[#0a1812] border border-gray-700 focus:border-[#d4af37] text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none transition-all appearance-none cursor-pointer min-h-[44px]"
              >
                {categories.map(c => (
                  <option key={c.category} value={c.category} className="bg-[#0a1812] text-white">
                    {isHindi ? `${c.labelHi} (${c.labelEn})` : `${c.labelEn} (${c.labelHi})`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Active Target Houses Preview */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              {isHindi ? 'देखे जाने वाले भाव (Target Houses):' : 'Evaluated KP Houses:'}
            </label>
            <div className="bg-[#0a1812] border border-gray-800 rounded-xl px-3 py-2 min-h-[44px] flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {KP_EVENT_HOUSE_MAPPINGS[category].targetHouses.map(h => (
                  <span
                    key={h}
                    className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold"
                  >
                    {isHindi ? `भाव ${h}` : `H${h}`}
                  </span>
                ))}
                {KP_EVENT_HOUSE_MAPPINGS[category].supportingHouses.map(h => (
                  <span
                    key={h}
                    className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-emerald-400 text-xs font-medium"
                  >
                    +{h}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-gray-500">
                {isHindi ? `मुख्य कस्प: ${KP_EVENT_HOUSE_MAPPINGS[category].primaryCusp}` : `Cusp ${KP_EVENT_HOUSE_MAPPINGS[category].primaryCusp}`}
              </span>
            </div>
          </div>

          {/* Question Date & Time (Defaults to Current, editable for Horary) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              {isHindi ? 'प्रश्न दिनांक (Date):' : 'Question Date:'}
            </label>
            <input
              type="date"
              value={questionDate}
              onChange={e => setQuestionDate(e.target.value)}
              className="w-full bg-[#0a1812] border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              {isHindi ? 'प्रश्न समय (Time):' : 'Question Time:'}
            </label>
            <input
              type="time"
              value={questionTime}
              onChange={e => setQuestionTime(e.target.value)}
              className="w-full bg-[#0a1812] border border-gray-800 text-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none min-h-[44px]"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto min-h-[44px] px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 active:scale-95 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{isHindi ? 'KP विश्लेषण करें' : 'Perform KP Judgment'}</span>
          </button>
        </div>
      </form>

      {/* User-Facing Deep Interpretation & Answer Layer (Phase 3B.1) */}
      {judgmentResult && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {interpretationResult && (
            <KPAnswerPanel
              interpretation={interpretationResult}
              judgmentResult={judgmentResult}
              kpResult={kpResult}
              language={language}
              onSelectKpDetail={onSelectKpDetail}
              onOpenPlanetStory={onOpenPlanetStory}
            />
          )}





          {/* Phase 3C Event Timing Analysis */}
          {timingResult && (
            <KPTimingPanel
              timingAnalysis={timingResult}
              kpResult={kpResult}
              language={language}
            />
          )}

          {/* Bottom Disclaimer */}
          <div className="p-3 bg-black/30 border border-gray-900 rounded-xl text-[10px] text-gray-500 text-center leading-relaxed">
            {judgmentResult.disclaimer[isHindi ? 'hi' : 'en']}
          </div>
        </div>
      )}
    </div>
  );
};
