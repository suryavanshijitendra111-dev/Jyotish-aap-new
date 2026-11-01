/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA PRACTICE DETAIL SCREEN
 */

import React, { useState } from 'react';
import { ArrowLeft, Clock, Play, AlertCircle, ShieldCheck, BookOpen, Compass } from 'lucide-react';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';

interface YogaPracticeDetailProps {
  practiceId: string;
  onBack: () => void;
  onSelectPractice: (practiceId: string, durationSeconds: number) => void;
}

export const YogaPracticeDetail: React.FC<YogaPracticeDetailProps> = ({
  practiceId,
  onBack,
  onSelectPractice
}) => {
  const practice = YogaCatalogService.getPracticeById(practiceId);

  const [selectedDuration, setSelectedDuration] = useState<number>(() => {
    return practice?.defaultDurationSeconds || 300;
  });

  if (!practice) {
    return (
      <div className="min-h-screen bg-[#030a08] text-white p-6 flex flex-col items-center justify-center">
        <p className="text-gray-400 mb-4">अभ्यास विवरण उपलब्ध नहीं है।</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#d4af37] text-black font-bold rounded-xl">वापस जाएँ</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030a08] via-[#051811] to-[#082218] text-white p-4 sm:p-6 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>सूची पर वापस जाएँ</span>
        </button>

        {/* Title Card */}
        <div className="bg-[#0a1510]/80 border border-[#d4af37]/40 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white">{practice.nameHindi}</h1>
              <p className="text-xs text-[#d4af37]">{practice.nameEnglish} • {practice.sanskritTransliteration}</p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] font-semibold">
              {practice.classification}
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed mt-4">{practice.briefDescriptionHindi}</p>

          {/* Shastriya Source */}
          <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
            <div className="text-[11px] text-gray-400">
              <strong className="text-[#d4af37]">शास्त्रीय प्रमाण: </strong>{practice.primarySourceCitation}
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="bg-[#0a1510]/80 border border-white/10 rounded-2xl p-5">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#d4af37]" />
            साधना समय चुनें (Select Duration)
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {practice.allowedDurationsSeconds.map(dur => (
              <button
                key={dur}
                onClick={() => setSelectedDuration(dur)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedDuration === dur
                    ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'bg-black/40 text-gray-300 border-white/10 hover:border-[#d4af37]/40'
                }`}
              >
                {Math.round(dur / 60)} मिनट
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-[#0a1510]/80 border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#d4af37]" />
            अभ्यास विधि (Steps)
          </h3>
          <ol className="space-y-2 text-xs text-gray-300 list-decimal list-inside leading-relaxed">
            {practice.stepsHindi.map((step, idx) => (
              <li key={idx} className="pl-1"><span className="text-gray-200">{step}</span></li>
            ))}
          </ol>
        </div>

        {/* Safety Cautions */}
        <div className="bg-amber-950/20 border border-amber-600/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <strong className="block text-amber-300 font-semibold mb-1">सावधानी एवं सीमाएँ:</strong>
            {practice.contraindicationsHindi.join(' ')}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onSelectPractice(practice.id, selectedDuration)}
          className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#e6c250] text-black font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:scale-[1.01] transition-transform cursor-pointer"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>साधना सत्र प्रारंभ करें ({Math.round(selectedDuration / 60)} मिनट)</span>
        </button>
      </div>
    </div>
  );
};
