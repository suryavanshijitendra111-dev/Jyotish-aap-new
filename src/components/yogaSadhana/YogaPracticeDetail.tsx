/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA PRACTICE DETAIL SCREEN
 * PHASE 1.15E: STRICT PRESENTATION ONLY (NO SESSION, NO AUDIO, NO TIMER)
 */

import React, { useState } from 'react';
import { ArrowLeft, ShieldAlert, BookOpen, AlertTriangle, CheckCircle, Info, Wind, Play, Clock } from 'lucide-react';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';

interface YogaPracticeDetailProps {
  practiceId: string;
  onBack: () => void;
  onSelectPractice?: (practiceId: string, durationSeconds: number) => void;
}

export const YogaPracticeDetail: React.FC<YogaPracticeDetailProps> = ({ practiceId, onBack, onSelectPractice }) => {
  const practice = YogaCatalogService.getPracticeById(practiceId);
  const [chosenDuration, setChosenDuration] = useState<number>(practice?.defaultDurationSeconds || 300);

  if (!practice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030a08] to-[#082218] text-white p-4 sm:p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/40 mb-4">
          <AlertTriangle className="w-8 h-8 text-[#d4af37]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">यह योग अभ्यास उपलब्ध नहीं है।</h2>
        <p className="text-gray-300 text-sm max-w-sm mb-6 leading-relaxed">
          अनुरोधित अभ्यास पहचानकर्ता कैटलॉग में नहीं मिला। कृपया सूची से पुनः अभ्यास का चयन करें।
        </p>
        <button
          onClick={onBack}
          className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#d4af37] text-[#030a08] font-bold text-sm hover:bg-[#e6c250] transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>अभ्यास सूची पर वापस जाएं</span>
        </button>
      </div>
    );
  }

  const isAnulomVilom = practice.id === 'anulom_vilom';

  const getSourceBadgeText = (classification: string) => {
    switch (classification) {
      case 'CLASSICAL':
        return 'शास्त्रीय मूल (Classical)';
      case 'TRADITIONAL':
        return 'पारंपरिक (Traditional)';
      case 'LATER_TRADITION':
        return 'उत्तर परंपरा (Later Tradition)';
      case 'MODERN_ADAPTATION':
        return 'आधुनिक अनुकूलन (Modern Adaptation)';
      default:
        return classification;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030a08] via-[#051811] to-[#082218] text-white p-4 sm:p-6 pb-24">
      {/* Top Bar with Back Button */}
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[#0a1510]/80 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer font-medium text-sm"
          aria-label="वापस जाएं"
        >
          <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
          <span>वापस</span>
        </button>

        <span className="text-xs bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fef08a] px-3 py-1 rounded-full font-semibold">
          {practice.category === 'ASANA' ? 'आसन (Posture)' : 'श्वास जागरूकता (Breath Awareness)'}
        </span>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Practice Hero Card */}
        <div className="bg-[#0a1510]/90 border border-[#d4af37]/50 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
                {practice.nameHindi}
              </h1>
              <span className="text-xl sm:text-2xl text-[#d4af37] font-semibold">
                ({practice.nameEnglish})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-0.5 rounded-full font-medium">
                {getSourceBadgeText(practice.sourceClassification)}
              </span>
              <span className="text-xs bg-amber-950/70 border border-amber-500/30 text-amber-200 px-3 py-0.5 rounded-full font-medium">
                प्रारंभिक स्तर (Beginner)
              </span>
            </div>

            <p className="text-base sm:text-lg text-gray-200 mt-4 leading-relaxed font-normal">
              {practice.techniqueSummaryHindi}
            </p>
            <p className="text-sm text-gray-400 mt-1 italic">
              {practice.techniqueSummaryEnglish}
            </p>
          </div>
        </div>

        {/* Anulom Vilom Special Provenance & Safety Notice */}
        {isAnulomVilom && (
          <div className="bg-[#121c15] border-2 border-[#d4af37] rounded-2xl p-5 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <div className="flex items-start gap-3">
              <Wind className="w-6 h-6 text-[#d4af37] shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h2 className="text-base font-bold text-[#fef08a]">
                  अनुलोम विलोम — ऐतिहासिक परंपरा एवं सुरक्षा अनुबंध
                </h2>
                <p className="text-sm text-gray-200 leading-relaxed">
                  यह आधुनिक परंपरा में प्रयुक्त सरल alternate-nostril breathing का रूप है। इसे शास्त्रीय नाड़ी शोधन के समान मानकर प्रस्तुत नहीं किया गया है।
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  <div className="bg-black/40 border border-emerald-500/40 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-emerald-400 font-bold">शून्य कुंभक</p>
                    <p className="text-[11px] text-gray-300">श्वास रोकना पूरी तरह वर्जित</p>
                  </div>
                  <div className="bg-black/40 border border-emerald-500/40 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-emerald-400 font-bold">स्वाभाविक प्रवाह</p>
                    <p className="text-[11px] text-gray-300">कोई कठिन अनुपात नहीं</p>
                  </div>
                  <div className="bg-black/40 border border-emerald-500/40 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-emerald-400 font-bold">शांत गति</p>
                    <p className="text-[11px] text-gray-300">तीव्र या बलपूर्वक श्वास निषेध</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Source Citation Box */}
        <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs uppercase tracking-wider text-[#d4af37] font-bold">
                पारंपरिक एवं ऐतिहासिक संदर्भ (Source Reference)
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                {practice.sourceCitation}
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="bg-[#0a1510]/80 border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#d4af37]/20 pb-3">
            <CheckCircle className="w-5 h-5 text-[#d4af37]" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              अभ्यास विधि एवं चरण (Step-by-Step Practice)
            </h2>
          </div>

          <ol className="space-y-4 pt-1">
            {practice.instructionsHindi.map((instruction, index) => (
              <li key={index} className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#d4af37]/40">
                  {index + 1}
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm sm:text-base text-gray-100 leading-relaxed font-medium">
                    {instruction}
                  </p>
                  {practice.instructionsEnglish[index] && (
                    <p className="text-xs text-gray-400 italic">
                      {practice.instructionsEnglish[index]}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Modification Guidance */}
        <div className="bg-[#0a1510]/80 border border-emerald-500/30 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-emerald-300">
                सहजता एवं संशोधन मार्गदर्शन (Modification Guidance)
              </h2>
              <p className="text-sm text-gray-200 mt-1 leading-relaxed">
                {practice.modificationGuidanceHindi}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 italic">
                {practice.modificationGuidanceEnglish}
              </p>
            </div>
          </div>
        </div>

        {/* Contraindications & Cautions */}
        {practice.contraindicationsHindi.length > 0 && (
          <div className="bg-[#18110b] border border-amber-600/40 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-amber-300">
                  सावधानी एवं सीमाएं (Precautions & Boundaries)
                </h2>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-sm text-gray-200">
                  {practice.contraindicationsHindi.map((caution, index) => (
                    <li key={index} className="leading-relaxed">
                      <span>{caution}</span>
                      {practice.contraindicationsEnglish[index] && (
                        <span className="text-xs text-gray-400 block ml-5 italic">
                          {practice.contraindicationsEnglish[index]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Standard Safety Notice */}
        <div className="bg-[#121c15] border border-[#d4af37]/40 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs uppercase tracking-wider text-[#d4af37] font-bold">
                सुरक्षा सूचना (Safety Notice)
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
                {practice.safetyNoticeHindi}
              </p>
              <p className="text-xs text-gray-400 mt-1 italic">
                {practice.safetyNoticeEnglish}
              </p>
            </div>
          </div>
        </div>

        {/* Available Durations / Duration Selection */}
        {onSelectPractice ? (
          <div className="bg-[#0a1510]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_4px_25px_rgba(212,175,55,0.2)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#d4af37]" />
                <span className="text-sm font-bold text-white">अभ्यास अवधि चुनें</span>
              </div>
              <span className="text-xs text-[#d4af37] font-mono font-semibold">
                {Math.floor(chosenDuration / 60)} मिनट
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {practice.allowedDurationsSeconds.map((sec) => {
                const mins = Math.floor(sec / 60);
                const isSelected = chosenDuration === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setChosenDuration(sec)}
                    className={`min-h-[44px] py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#d4af37] text-[#030a08] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{mins} मिनट</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onSelectPractice(practice.id, chosenDuration)}
              className="w-full min-h-[48px] py-3 px-6 rounded-2xl bg-[#d4af37] text-[#030a08] font-bold text-base hover:bg-[#e6c250] transition-all shadow-[0_0_20px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>अभ्यास प्रारंभ करें</span>
            </button>
          </div>
        ) : (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-xs text-gray-400 font-medium">
              अनुशंसित अभ्यास अवधि (सूचनात्मक):{' '}
              <span className="text-white font-semibold">
                {practice.allowedDurationsSeconds.map(s => `${Math.floor(s / 60)} मिनट`).join(' • ')}
              </span>
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              (इस चरण में केवल अभ्यास विधि उपलब्ध है; कोई टाइमर या सत्र संलग्न नहीं है)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
