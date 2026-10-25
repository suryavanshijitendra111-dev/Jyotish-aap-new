/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { YogaDoshaEngine, YogaResult, DoshaResult } from '../../services/astrology/yogaDoshaEngine';
import CarvedCard from '../ui/CarvedCard';
import { Sparkles, AlertCircle, CheckCircle2, ShieldAlert, Award, Zap, Info } from 'lucide-react';

interface YogaDoshaViewProps {
  data: MasterKundliData;
}

export const YogaDoshaView: React.FC<YogaDoshaViewProps> = ({ data }) => {
  const analysis = useMemo(() => YogaDoshaEngine.analyze(data), [data]);
  const { yogas, doshas } = analysis;

  const getDoshaStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'text-red-400 border-red-500/30 bg-red-500/5';
      case 'Partial': return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
      case 'Canceled': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
      default: return 'text-emerald-500/60 border-emerald-500/10 bg-emerald-500/2';
    }
  };

  const getDoshaBadge = (status: string) => {
    switch (status) {
      case 'Present': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'Partial': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'Canceled': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return <CheckCircle2 className="w-4 h-4 text-emerald-500/40" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Classical Yogas & Doshas (योग और दोष)
          </h2>
          <p className="text-white/60 text-sm mt-1 font-sans italic">
            Shastriya detection of cosmic alignments from Jagannatha Hora
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-black text-yellow-500 uppercase tracking-widest">
              {yogas.length} Active Yogas
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Classical Yogas Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-yellow-500/80 mb-2 flex items-center gap-2 px-1">
            <Zap className="w-5 h-5" />
            Active Auspicious Yogas
          </h3>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {yogas.length > 0 ? (
              yogas.map((yoga, idx) => (
                <CarvedCard key={idx} cornerSize={20} className="p-4 bg-[#082218]/40 border-white/5 group hover:border-yellow-500/40 transition-all duration-500">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-serif">
                      <div className="text-yellow-400 text-base font-bold">{yoga.hindiName}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-sans">{yoga.name}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-yellow-500/60" />
                    </div>
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed font-sans group-hover:text-white transition-colors">
                    {yoga.description}
                  </p>
                </CarvedCard>
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-white/20 italic font-serif">No classical yogas detected in current chart.</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Dosha Analysis Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-yellow-500/80 mb-2 flex items-center gap-2 px-1">
            <ShieldAlert className="w-5 h-5" />
            Karmic Dosha Analysis
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {doshas.map((dosha, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 ${getDoshaStatusColor(dosha.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-black/20`}>
                      {getDoshaBadge(dosha.status)}
                    </div>
                    <div>
                      <div className="text-sm font-bold font-serif">{dosha.hindiName}</div>
                      <div className="text-[9px] uppercase tracking-tighter opacity-60 font-sans">{dosha.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/20`}>
                      {dosha.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-[10px] opacity-80 leading-relaxed font-sans">
                  {dosha.description}
                </p>

                {dosha.status === 'Present' && dosha.intensity !== undefined && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[8px] uppercase font-black opacity-40">
                      <span>Karmic Intensity</span>
                      <span>{dosha.intensity}%</span>
                    </div>
                    <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-current transition-all duration-1000"
                        style={{ width: `${dosha.intensity}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-[#082218]/20 border border-yellow-500/10 rounded-2xl flex gap-3">
            <Info className="w-5 h-5 text-yellow-500/40 shrink-0" />
            <p className="text-[10px] text-white/40 leading-relaxed italic font-serif">
              "Yogas represent cosmic assets and talents, while Doshas indicate karmic challenges that require awareness and remedies (Upaya)."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
