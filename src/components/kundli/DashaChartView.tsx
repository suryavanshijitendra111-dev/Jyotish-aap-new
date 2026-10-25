/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { VimshottariData, DashaPeriod } from '../../types/kundli';
import CarvedCard from '../ui/CarvedCard';
import { Activity, ChevronDown, ChevronRight, Clock, Zap } from 'lucide-react';

interface DashaChartViewProps {
  dasha: VimshottariData | null;
}

const planetColors: Record<string, string> = {
  Sun: 'from-orange-400 to-amber-600',
  Moon: 'from-blue-100 to-blue-300',
  Mars: 'from-red-500 to-rose-700',
  Mercury: 'from-emerald-400 to-green-600',
  Jupiter: 'from-yellow-300 to-amber-500',
  Venus: 'from-pink-200 to-white',
  Saturn: 'from-indigo-600 to-blue-900',
  Rahu: 'from-gray-600 to-black',
  Ketu: 'from-amber-800 to-stone-900',
};

const getProgress = (start: string, end: string) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = new Date().getTime();
  if (isNaN(s) || isNaN(e)) return 0;
  if (now < s) return 0;
  if (now > e) return 100;
  return Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const isActive = (start: string, end: string) => {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = new Date().getTime();
  return now >= s && now < e;
};

export const DashaChartView: React.FC<DashaChartViewProps> = ({ dasha }) => {
  const [expandedMd, setExpandedMd] = useState<string | null>(null);
  const [expandedAd, setExpandedAd] = useState<string | null>(null);

  if (!dasha) return null;

  const md = dasha.currentMahadasha;
  const ad = dasha.currentAntardasha;
  
  const now = new Date().getTime();
  const pd = ad.subPeriods?.find(p => {
    const s = new Date(p.startDate).getTime();
    const e = new Date(p.endDate).getTime();
    return now >= s && now < e;
  }) || null;

  const mdProgress = getProgress(md.startDate, md.endDate);
  const adProgress = getProgress(ad.startDate, ad.endDate);
  const pdProgress = pd ? getProgress(pd.startDate, pd.endDate) : 0;

  return (
    <div className="space-y-6">
      {/* 1. 3-Level Visual Progress Bars */}
      <CarvedCard className="p-5 bg-gradient-to-br from-amber-900/15 to-transparent border-amber-500/30">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-200 uppercase tracking-widest">Active Cycle Progress</h3>
        </div>

        <div className="space-y-8">
          {/* Mahadasha */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${planetColors[md.planet]}`} />
                <span className="text-[10px] text-amber-200/50 uppercase font-bold tracking-tighter">Mahadasha:</span>
                <span className="text-lg font-serif text-white">{md.planet} ({mdProgress.toFixed(1)}%)</span>
              </div>
              <span className="text-[10px] text-amber-100/40">{formatDate(md.startDate)} — {formatDate(md.endDate)}</span>
            </div>
            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${planetColors[md.planet]} transition-all duration-1000`}
                style={{ width: `${mdProgress}%` }}
              />
            </div>
          </div>

          {/* Antardasha */}
          <div className="space-y-2 pl-4 border-l border-amber-500/20">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${planetColors[ad.planet]}`} />
                <span className="text-[10px] text-amber-200/50 uppercase font-bold tracking-tighter">Antardasha:</span>
                <span className="text-base font-serif text-white">{ad.planet} ({adProgress.toFixed(1)}%)</span>
              </div>
              <span className="text-[10px] text-amber-100/40">{formatDate(ad.startDate)} — {formatDate(ad.endDate)}</span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${planetColors[ad.planet]} transition-all duration-1000`}
                style={{ width: `${adProgress}%` }}
              />
            </div>
          </div>

          {/* Pratyantardasha */}
          {pd && (
            <div className="space-y-2 pl-8 border-l border-amber-500/10">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${planetColors[pd.planet]}`} />
                  <span className="text-[10px] text-amber-200/50 uppercase font-bold tracking-tighter">Pratyantar:</span>
                  <span className="text-sm font-serif text-white">{pd.planet} ({pdProgress.toFixed(1)}%)</span>
                </div>
                <span className="text-[10px] text-amber-100/40">{formatDate(pd.startDate)} — {formatDate(pd.endDate)}</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${planetColors[pd.planet]} transition-all duration-1000`}
                  style={{ width: `${pdProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CarvedCard>

      {/* 2. Interactive Dasha Tree */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-200 uppercase tracking-wider">120-Year Dasha Tree</h3>
        </div>

        <div className="space-y-2">
          {dasha.mahadashas.map((mPeriod, mIdx) => {
            const isMdActive = isActive(mPeriod.startDate, mPeriod.endDate);
            const isMdExpanded = expandedMd === mPeriod.planet;
            
            return (
              <CarvedCard key={mIdx} className={`p-0 overflow-hidden transition-all duration-300 ${isMdActive ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5'}`}>
                <button 
                  onClick={() => setExpandedMd(isMdExpanded ? null : mPeriod.planet)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm bg-gradient-to-br ${planetColors[mPeriod.planet]}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-bold ${isMdActive ? 'text-emerald-400' : 'text-amber-100'}`}>{mPeriod.planet}</span>
                        {isMdActive && <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 uppercase">Active</span>}
                      </div>
                      <p className="text-[10px] text-white/30">{formatDate(mPeriod.startDate)} — {formatDate(mPeriod.endDate)}</p>
                    </div>
                  </div>
                  {isMdExpanded ? <ChevronDown className="w-4 h-4 text-amber-500/50" /> : <ChevronRight className="w-4 h-4 text-white/20" />}
                </button>

                {isMdExpanded && mPeriod.subPeriods && (
                  <div className="bg-black/40 border-t border-white/5 divide-y divide-white/5">
                    {mPeriod.subPeriods.map((aPeriod, aIdx) => {
                      const isAdActive = isActive(aPeriod.startDate, aPeriod.endDate);
                      const isAdExpanded = expandedAd === `${mPeriod.planet}-${aPeriod.planet}`;

                      return (
                        <div key={aIdx} className="pl-4">
                          <button 
                            onClick={() => setExpandedAd(isAdExpanded ? null : `${mPeriod.planet}-${aPeriod.planet}`)}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${planetColors[aPeriod.planet]}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${isAdActive ? 'text-emerald-400' : 'text-amber-200/80'}`}>{aPeriod.planet}</span>
                                  {isAdActive && <span className="text-[7px] px-1 py-0 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 uppercase">AD Active</span>}
                                </div>
                                <p className="text-[9px] text-white/20">{formatDate(aPeriod.startDate)} — {formatDate(aPeriod.endDate)}</p>
                              </div>
                            </div>
                            {aPeriod.subPeriods && (isAdExpanded ? <ChevronDown className="w-3.5 h-3.5 text-amber-500/50" /> : <ChevronRight className="w-3.5 h-3.5 text-white/10" />)}
                          </button>

                          {isAdExpanded && aPeriod.subPeriods && (
                            <div className="bg-black/60 pl-8 pr-4 py-2 space-y-1.5 border-l border-amber-500/10 mb-2">
                              {aPeriod.subPeriods.map((pPeriod, pIdx) => {
                                const isPdActive = isActive(pPeriod.startDate, pPeriod.endDate);
                                return (
                                  <div key={pIdx} className="flex justify-between items-center py-1 group">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-1 h-1 rounded-full ${isPdActive ? 'bg-emerald-400 animate-pulse' : 'bg-white/10 group-hover:bg-amber-500/30'}`} />
                                      <span className={`text-xs ${isPdActive ? 'text-emerald-300 font-bold' : 'text-white/40'}`}>{pPeriod.planet}</span>
                                    </div>
                                    <span className={`text-[9px] font-mono ${isPdActive ? 'text-emerald-400/70' : 'text-white/10'}`}>
                                      {formatDate(pPeriod.startDate)} — {formatDate(pPeriod.endDate)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CarvedCard>
            );
          })}
        </div>
      </div>

      {/* Info Legend */}
      <CarvedCard className="p-4 bg-amber-900/5 border-amber-900/20">
        <div className="flex gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-200 uppercase tracking-widest">Time Cycle Logic</h4>
            <p className="text-[10px] text-amber-100/50 leading-relaxed italic">
              Vimshottari Dasha spans 120 years. Each Mahadasha is subdivided into 9 Antardashas and further into 9 Pratyantardashas for micro-timing analysis.
            </p>
          </div>
        </div>
      </CarvedCard>
    </div>
  );
};
