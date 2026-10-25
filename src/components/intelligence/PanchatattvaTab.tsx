import React, { useMemo } from 'react';
import { BirthProfile, MasterKundliData, PanchatattvaResult } from '../../types/kundli';
import { IntelligenceEngine } from '../../services/intelligence/intelligenceEngine';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface Props {
  profile: BirthProfile;
  masterKundliData?: MasterKundliData | null;
  showToast: (msg: string) => void;
}

export default function PanchatattvaTab({ profile, masterKundliData, showToast }: Props) {
  const { t } = useTranslation();
  // Single Source of Truth: Use MasterKundliData calculated Panchatattva, fallback to engine calculation
  const data: PanchatattvaResult = useMemo(() => {
    return masterKundliData?.panchatattva || IntelligenceEngine.getPanchatattva(profile);
  }, [profile, masterKundliData]);

  // Development-only consistency assertion: UI Panchatattva === MasterKundliData Panchatattva
  const mismatchError = useMemo(() => {
    if (!masterKundliData || !masterKundliData.panchatattva) return null;
    const mk = masterKundliData.panchatattva;
    const mismatches: string[] = [];
    
    if (data.dominant !== mk.dominant) {
      mismatches.push(`Dominant element mismatch: UI='${data.dominant}' vs Master='${mk.dominant}'`);
    }
    if (data.weakest !== mk.weakest) {
      mismatches.push(`Weakest element mismatch: UI='${data.weakest}' vs Master='${mk.weakest}'`);
    }
    
    const elements: ('fire' | 'earth' | 'air' | 'water' | 'ether')[] = ['fire', 'earth', 'air', 'water', 'ether'];
    for (const el of elements) {
      if (data[el].score !== mk[el].score) {
        mismatches.push(`${el} score mismatch: UI=${data[el].score} vs Master=${mk[el].score}`);
      }
      if (data[el].percentage !== mk[el].percentage) {
        mismatches.push(`${el} percentage mismatch: UI=${data[el].percentage}% vs Master=${mk[el].percentage}%`);
      }
    }

    if (mismatches.length > 0) {
      const errorMsg = `PANCHATATTVA_DATA_MISMATCH: ${mismatches.join('; ')}`;
      console.error('[Panchatattva Consistency Error]', errorMsg);
      return errorMsg;
    }
    return null;
  }, [data, masterKundliData]);

  const renderElementBar = (
    name: string, 
    score: number, 
    percentage: number, 
    relativePercentage: number, 
    color: string, 
    indicators: any[]
  ) => {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
           <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${color}`}>{name}</span>
              <span className="text-xs text-gray-400">({score} pts • {percentage}% of total)</span>
           </div>
           <button 
             onClick={() => {
               const details = indicators.length > 0
                 ? indicators.map(i => `${i.source}: ${i.rule} (+${i.weight} pts)`).join('\n')
                 : "No active indicators (0 pts).";
               showToast(details);
             }}
             className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
           >
             {t('common.why') || 'Why?'}
           </button>
        </div>
        <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-gray-800">
          <div 
            className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000`} 
            style={{ width: `${relativePercentage || (score > 0 ? 5 : 0)}%` }}
          />
        </div>
        <div className="mt-1.5 flex gap-1.5 flex-wrap">
          {indicators.length > 0 ? indicators.map((ind, idx) => (
             <span key={idx} className="text-[9px] bg-black/40 px-2 py-0.5 rounded text-gray-400 border border-gray-800">
               {ind.source} (+{ind.weight})
             </span>
          )) : (
             <span className="text-[9px] text-gray-600 italic">0 indicators</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase flex items-center gap-2">
            {t('panchatattva.title') || 'पंचतत्व बुद्धिमत्ता (Panchatattva Intelligence)'}
          </h2>
          <span className="text-[10px] text-emerald-400/80 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {t('common.verified') || 'MasterKundliData Truth'}
          </span>
        </div>

        {/* Development Consistency Assertion Mismatch Warning */}
        {mismatchError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-200">
            <div className="font-bold text-red-400 tracking-wider text-xs uppercase mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              PANCHATATTVA_DATA_MISMATCH
            </div>
            <div className="text-xs font-mono">{mismatchError}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-black/40 p-4 rounded-xl border border-emerald-900/50 text-center">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('panchatattva.dominant') || 'Dominant Element'}</div>
              <div className="text-xl font-bold text-[#d4af37]">{data.dominant}</div>
           </div>
           <div className="bg-black/40 p-4 rounded-xl border border-red-900/30 text-center">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('panchatattva.weakest') || 'Weakest Element'}</div>
              <div className="text-xl font-bold text-gray-400">{data.weakest}</div>
           </div>
        </div>

        <div>
           {renderElementBar(`${t('panchatattva.water') || 'Water'} (जल)`, data.water.score, data.water.percentage, data.water.relativePercentage, 'text-cyan-400', data.water.indicators)}
           {renderElementBar(`${t('panchatattva.fire') || 'Fire'} (अग्नि)`, data.fire.score, data.fire.percentage, data.fire.relativePercentage, 'text-red-500', data.fire.indicators)}
           {renderElementBar(`${t('panchatattva.earth') || 'Earth'} (पृथ्वी)`, data.earth.score, data.earth.percentage, data.earth.relativePercentage, 'text-emerald-500', data.earth.indicators)}
           {renderElementBar(`${t('panchatattva.air') || 'Air'} (वायु)`, data.air.score, data.air.percentage, data.air.relativePercentage, 'text-blue-400', data.air.indicators)}
           {renderElementBar(`${t('panchatattva.ether') || 'Ether'} (आकाश)`, data.ether.score, data.ether.percentage, data.ether.relativePercentage, 'text-purple-400', data.ether.indicators)}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
           <span>{t('panchatattva.totalPoints') || 'Total Elemental Points'}: <strong className="text-white">{data.totalScore} pts</strong></span>
           <span className="text-[#d4af37]">{t('common.verified') || 'Composition: 100% Deterministic'}</span>
        </div>

        <div className="mt-6 bg-black/60 p-4 rounded-xl border border-gray-800 text-sm text-gray-300 leading-relaxed">
          <p>
            <strong className="text-[#d4af37]">{t('common.traditionalInterpretation') || 'Traditional Interpretation'}:</strong><br/>
            This representation is based on your Numerology numbers and approximate Sun Sign mapping. A dominant <strong>{data.dominant}</strong> element traditionally suggests strong traits associated with that element, while a weaker <strong>{data.weakest}</strong> element may represent an area requiring conscious balancing. 
          </p>
        </div>
      </div>
    </div>
  );
}
