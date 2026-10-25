/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { ArudhaCharaEngine, ArudhaCharaResult } from '../../services/astrology/arudhaCharaEngine';
import CarvedCard from '../ui/CarvedCard';
import { LayoutGrid, Timer, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';

interface ArudhaCharaViewProps {
  data: MasterKundliData;
}

export const ArudhaCharaView: React.FC<ArudhaCharaViewProps> = ({ data }) => {
  const result = useMemo(() => ArudhaCharaEngine.calculate(data), [data]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Active Chara Dasha Highlight */}
      {result.charaDasha.current && (
        <CarvedCard className="p-6 relative overflow-hidden bg-gradient-to-br from-amber-900/20 to-transparent border-amber-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Timer className="w-24 h-24 text-amber-500" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <Clock className="w-4 h-4" /> Current Active Chara Dasha
              </div>
              <h3 className="text-4xl font-serif text-white">{result.charaDasha.current.sign}</h3>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-[10px] text-amber-200/50 uppercase font-bold tracking-tighter">Period Duration</p>
                <p className="text-xl font-bold text-amber-100">{result.charaDasha.current.duration} Years</p>
              </div>
              <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs text-amber-200 font-medium">
                {formatDate(result.charaDasha.current.startDate)} — {formatDate(result.charaDasha.current.endDate)}
              </div>
            </div>
          </div>
        </CarvedCard>
      )}

      {/* Arudha Padas Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-200 uppercase tracking-wider">12 Arudha Padas (पद प्राप्त)</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {result.arudhaPadas.map((pada, idx) => (
            <CarvedCard key={idx} className="p-4 group hover:border-amber-500/50 transition-colors duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-amber-400">{pada.label}</span>
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">H{pada.houseNumber} Lord Reflection</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-100/90">{pada.rashiName}</p>
                <div className="flex items-center justify-between text-[10px] text-white/40">
                  <span>Falls in House</span>
                  <span className="text-amber-200 font-bold">{pada.padaNumber}</span>
                </div>
              </div>
              <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500/40 w-1/3 group-hover:w-full transition-all duration-700"></div>
              </div>
            </CarvedCard>
          ))}
        </div>
      </div>

      {/* Complete Chara Dasha Cycle */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-200 uppercase tracking-wider">Jaimini Chara Dasha Cycle</h3>
        </div>
        
        <CarvedCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-amber-900/20 border-b border-white/5">
                  <th className="px-4 py-3 font-bold text-amber-200 uppercase text-[11px] tracking-widest">Sign</th>
                  <th className="px-4 py-3 font-bold text-amber-200 uppercase text-[11px] tracking-widest">Years</th>
                  <th className="px-4 py-3 font-bold text-amber-200 uppercase text-[11px] tracking-widest">Start Date</th>
                  <th className="px-4 py-3 font-bold text-amber-200 uppercase text-[11px] tracking-widest">End Date</th>
                  <th className="px-4 py-3 font-bold text-amber-200 uppercase text-[11px] tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {result.charaDasha.sequence.map((period, idx) => {
                  const isCurrent = result.charaDasha.current?.sign === period.sign;
                  const isPast = new Date() > period.endDate;
                  
                  return (
                    <tr key={idx} className={`hover:bg-white/5 transition-colors ${isCurrent ? 'bg-amber-500/10' : ''}`}>
                      <td className="px-4 py-3 font-bold text-amber-100">{period.sign}</td>
                      <td className="px-4 py-3 text-white/70">{period.duration}</td>
                      <td className="px-4 py-3 text-white/60 font-mono text-[11px]">{formatDate(period.startDate)}</td>
                      <td className="px-4 py-3 text-white/60 font-mono text-[11px]">{formatDate(period.endDate)}</td>
                      <td className="px-4 py-3 text-right">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">ACTIVE</span>
                        ) : isPast ? (
                          <span className="text-white/20 text-[10px] font-bold">PAST</span>
                        ) : (
                          <span className="text-amber-200/30 text-[10px] font-bold">UPCOMING</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CarvedCard>
      </div>

      {/* Info Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CarvedCard className="p-4 bg-amber-900/5 border-amber-900/20">
          <div className="flex gap-3">
            <LayoutGrid className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-widest">Arudha Pada Definition</h4>
              <p className="text-[11px] text-amber-100/50 leading-relaxed italic">
                Reflection of a house in the material world. AL (Arudha Lagna) shows status/image, UL (Upapada) shows spouse/partnership.
              </p>
            </div>
          </div>
        </CarvedCard>
        <CarvedCard className="p-4 bg-amber-900/5 border-amber-900/20">
          <div className="flex gap-3">
            <Timer className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-widest">Chara Dasha Logic</h4>
              <p className="text-[11px] text-amber-100/50 leading-relaxed italic">
                A unique dasha based on signs rather than planets. Durations are calculated by counting from the sign to its lord position.
              </p>
            </div>
          </div>
        </CarvedCard>
      </div>
    </div>
  );
};
