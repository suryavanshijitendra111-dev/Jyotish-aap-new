import React, { useMemo, useState } from 'react';
import { BirthProfile } from '../../types/kundli';
import { IntelligenceEngine, ProblemAreaResult } from '../../services/intelligence/intelligenceEngine';
import { Brain, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface Props {
  profile: BirthProfile;
  showToast: (msg: string) => void;
  handleAskQuestion: (q: string) => void;
}

export default function ProblemAreasTab({ profile, showToast, handleAskQuestion }: Props) {
  const { t } = useTranslation();
  const areas: ProblemAreaResult[] = useMemo(() => {
    return IntelligenceEngine.getProblemAreas(profile);
  }, [profile]);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getConfidenceColor = (conf: string) => {
    if (conf === 'Strong traditional indicators') return 'text-red-400 border-red-900/30 bg-red-900/10';
    if (conf === 'Multiple indicators') return 'text-yellow-400 border-yellow-900/30 bg-yellow-900/10';
    return 'text-emerald-400 border-emerald-900/30 bg-emerald-900/10';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 relative overflow-hidden">
        <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {t('prashna.problemAreas') || 'मेरी समस्या कहाँ है? (Find My Problem Areas)'}
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          {t('intelligence.problemAreasDisclaimer') || 'This module highlights life areas where multiple traditional astrological or numerological rules suggest potential challenges. It does not scientifically diagnose problems.'}
        </p>

        <div className="space-y-4">
          {areas.map((area, idx) => {
             const isExpanded = expandedIndex === idx;
             const confStyle = getConfidenceColor(area.confidenceLabel);
             return (
               <div key={idx} className="bg-black/40 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="w-full p-4 flex justify-between items-center hover:bg-black/60 transition-colors"
                  >
                     <div className="flex flex-col items-start gap-1">
                        <span className="text-[#d4af37] font-bold text-lg">{area.category}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${confStyle}`}>
                          {area.confidenceLabel}
                        </span>
                     </div>
                     {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-gray-800/50 mt-2 space-y-4 animate-in slide-in-from-top-2">
                       <div>
                         <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                           {t('intelligence.whyHighlighted') || 'Why was this highlighted? (Indicators)'}
                         </div>
                         <ul className="list-disc list-inside space-y-1">
                           {area.indicators.map((ind, i) => (
                             <li key={i} className="text-xs text-gray-300">{ind}</li>
                           ))}
                         </ul>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                         <div className="bg-[#030a08] p-3 rounded-lg border border-[#d4af37]/10">
                           <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                             {t('intelligence.sourceSystems') || 'Source Systems'}
                           </div>
                           <div className="text-xs text-[#d4af37]">{area.sourceSystems.join(', ')}</div>
                         </div>
                         <div className="bg-[#030a08] p-3 rounded-lg border border-[#d4af37]/10">
                           <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                             {t('intelligence.timingState') || 'Timing / State'}
                           </div>
                           <div className="text-xs text-gray-300">{area.timing}</div>
                         </div>
                       </div>

                       <div>
                         <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                           {t('common.traditionalInterpretation') || 'Traditional Interpretation'}
                         </div>
                         <p className="text-sm text-gray-200 leading-relaxed bg-[#0a1510] p-3 rounded-lg border border-gray-800">
                           {area.traditionalInterpretation}
                           <br/><br/>
                           <span className="text-gray-400 italic">{area.explanation}</span>
                         </p>
                       </div>

                       <button 
                         onClick={() => handleAskQuestion(`Can you explain the astrological and numerological challenges I face in my ${area.category} and suggest remedies?`)}
                         className="w-full mt-2 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                       >
                         <Brain className="w-4 h-4"/> {t('intelligence.askAiExplanation') || 'Ask AI for deep explanation & remedies'}
                       </button>
                    </div>
                  )}
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}
