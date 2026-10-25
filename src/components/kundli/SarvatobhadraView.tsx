/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { SarvatobhadraEngine, SBCResult, GridCell } from '../../services/astrology/sarvatobhadraEngine';
import CarvedCard from '../ui/CarvedCard';
import { Sparkles, Shield, AlertTriangle, CheckCircle2, Search, Info } from 'lucide-react';

interface SarvatobhadraViewProps {
  data: MasterKundliData;
}

export const SarvatobhadraView: React.FC<SarvatobhadraViewProps> = ({ data }) => {
  const result = useMemo(() => SarvatobhadraEngine.calculate(data), [data]);

  const getCellStyles = (cell: GridCell) => {
    const hasVedha = cell.vedhas.length > 0;
    const isMalefic = cell.vedhas.some(v => v.type === 'Malefic');
    const isBenefic = cell.vedhas.some(v => v.type === 'Benefic');

    let base = "relative flex items-center justify-center text-[8px] sm:text-[10px] font-medium border border-white/5 transition-all duration-300 ";
    
    if (cell.type === 'Nakshatra') base += "bg-white/5 text-white/70 ";
    else if (cell.type === 'Rashi') base += "bg-yellow-500/5 text-yellow-500/60 ";
    else if (cell.type === 'Swara' || cell.type === 'Varna') base += "bg-blue-500/5 text-blue-500/60 ";
    else if (cell.type === 'Center') base += "bg-yellow-500/10 text-yellow-500 font-bold ";
    else base += "bg-transparent text-white/30 ";

    if (hasVedha) {
      if (isMalefic && isBenefic) base += "ring-1 ring-inset ring-orange-500/40 bg-orange-500/10 ";
      else if (isMalefic) base += "ring-1 ring-inset ring-red-500/40 bg-red-500/10 ";
      else if (isBenefic) base += "ring-1 ring-inset ring-green-500/40 bg-green-500/10 ";
    }

    return base;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Sarvatobhadra Chakra (सर्वतोभद्र चक्र)
        </h2>
        <p className="text-white/60 text-sm font-sans">
          The 81-grid "All-Auspicious Wheel" used to analyze planetary transits and their subtle impacts (Vedha).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. The 9x9 Grid Chart */}
        <div className="lg:col-span-2">
          <CarvedCard cornerSize={32} className="p-4 bg-[#082218]/40 border-yellow-500/20 aspect-square">
            <div className="grid grid-cols-9 h-full gap-1">
              {result.grid.flat().map((cell, idx) => (
                <div 
                  key={idx} 
                  className={getCellStyles(cell)}
                  title={`${cell.content} - Vedhas: ${cell.vedhas.length}`}
                >
                  <span className="truncate px-0.5">{cell.content}</span>
                  {cell.vedhas.length > 0 && (
                    <div className={`absolute top-0 right-0 w-1 h-1 rounded-full ${
                      cell.vedhas.some(v => v.type === 'Malefic') ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CarvedCard>
        </div>

        {/* 2. Special Nakshatra Analysis & Summary */}
        <div className="space-y-4">
          <CarvedCard cornerSize={24} className="p-4 bg-white/5 border-white/10">
            <h3 className="text-lg font-serif text-yellow-500 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
              <Shield className="w-5 h-5" />
              Special Vedha Analysis
            </h3>
            <div className="space-y-3">
              {result.specialNakshatraVedhas.map((sn, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-tighter">{sn.name}</div>
                    <div className="text-sm text-white font-medium">{sn.nakshatra}</div>
                  </div>
                  <div className="flex gap-1">
                    {sn.impacts.length === 0 ? (
                      <div className="flex items-center gap-1 text-[10px] text-green-500/60 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Clear
                      </div>
                    ) : (
                      sn.impacts.slice(0, 2).map((imp, i) => (
                        <div key={i} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                          imp.type === 'Malefic' 
                          ? 'text-red-400 bg-red-400/10 border-red-400/20' 
                          : 'text-green-400 bg-green-400/10 border-green-400/20'
                        }`}>
                          {imp.planet.substring(0,2)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CarvedCard>

          <CarvedCard cornerSize={24} className="p-4 bg-yellow-500/5 border-yellow-500/20">
            <h3 className="text-lg font-serif text-yellow-500 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Vedha Summary
            </h3>
            <div className="text-xs text-white/70 space-y-2">
              <p className="leading-relaxed">
                <span className="text-red-400 font-bold">Malefic Vedha:</span> Planets like Sun, Mars, Saturn cause obstacles when hitting birth points.
              </p>
              <p className="leading-relaxed">
                <span className="text-green-400 font-bold">Benefic Vedha:</span> Jupiter, Venus, Moon bring prosperity and smooth progress.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
              <Info className="w-4 h-4 text-yellow-500/40" />
              <span className="text-[10px] text-white/40 italic">Diagonal Vedha counts as stronger.</span>
            </div>
          </CarvedCard>
        </div>
      </div>
    </div>
  );
};
