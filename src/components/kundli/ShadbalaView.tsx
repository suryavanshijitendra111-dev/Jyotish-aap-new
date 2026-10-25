/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { ShadbalaEngine, ShadbalaResult } from '../../services/astrology/shadbalaEngine';
import CarvedCard from '../ui/CarvedCard';
import { Shield, TrendingUp, Award, Info, Zap } from 'lucide-react';
import { getLocalizedPlanet, getLocalizedHouse } from '../../i18n/astrology';

interface ShadbalaViewProps {
  data: MasterKundliData;
}

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export const ShadbalaView: React.FC<ShadbalaViewProps> = ({ data }) => {
  const shadbala = useMemo(() => {
    return ShadbalaEngine.calculate(data);
  }, [data]);

  const getRatioColor = (ratio: number) => {
    if (ratio >= 115) return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
    if (ratio >= 100) return 'bg-green-500';
    if (ratio >= 85) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 font-bold border-yellow-500/40 bg-yellow-500/10';
    if (rank <= 3) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (rank >= 10) return 'text-red-400 border-red-500/20 bg-red-500/5';
    return 'text-white/60 border-white/10 bg-white/5';
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Shadbala (षड्बल)
          </h2>
          <p className="text-white/60 text-sm mt-1 font-sans">
            Six-fold strength analysis of planets for karmic impact
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
            Classical Strength Engine
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Planetary Shadbala Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-yellow-500/80 mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Planetary Strength Ratio
          </h3>
          <div className="space-y-3">
            {PLANETS.map(pName => {
              const res = shadbala.planets[pName];
              if (!res) return null;
              return (
                <CarvedCard key={pName} cornerSize={20} className="p-4 bg-[#082218]/40 border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white/90">
                        {getLocalizedPlanet(pName, 'hi')}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {res.totalRupas.toFixed(2)} Rupas
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-black ${res.strengthRatio >= 100 ? 'text-yellow-400' : 'text-white/70'}`}>
                        {res.strengthRatio.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${getRatioColor(res.strengthRatio)}`}
                      style={{ width: `${Math.min(100, res.strengthRatio)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-emerald-400/60 uppercase font-bold">Ishta (इष्ट)</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{res.ishtaPhala.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-red-400/60 uppercase font-bold">Kashta (कष्ट)</span>
                      <span className="text-[10px] text-red-400 font-mono">{res.kashtaPhala.toFixed(1)}</span>
                    </div>
                  </div>
                </CarvedCard>
              );
            })}
          </div>
        </div>

        {/* 3. Bhava Bala Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-yellow-500/80 mb-2 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Bhava Bala Rankings (भाव बल)
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {shadbala.houses.sort((a, b) => a.rank - b.rank).map(h => (
              <div 
                key={h.house} 
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${getRankColor(h.rank)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-black/30 border border-current flex items-center justify-center text-xs font-black">
                    {h.rank}
                  </div>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-2">
                      {h.house}. {getLocalizedHouse(h.house, 'hi').full}
                    </div>
                    <div className="text-[9px] opacity-60 uppercase tracking-tighter">
                      Lord Strength: {h.adhipatiBala.toFixed(0)} • Rank {h.rank}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold">{h.totalRupas.toFixed(2)}</div>
                  <div className="text-[8px] opacity-50 uppercase tracking-widest">Rupas</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex gap-3">
            <Info className="w-5 h-5 text-yellow-500 shrink-0" />
            <p className="text-[11px] text-white/60 leading-relaxed italic">
              "Shadbala reveals the potential energy of a planet. Bhava Bala indicates the capacity of a house to deliver its results. 
              A high rank for a specific house ensures fruition of that department of life."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
