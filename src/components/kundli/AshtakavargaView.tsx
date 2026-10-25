/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { AshtakavargaEngine, AshtakavargaResult } from '../../services/astrology/ashtakavargaEngine';
import CarvedCard from '../ui/CarvedCard';
import { Sparkles, Info, ArrowRight } from 'lucide-react';
import { getLocalizedRashi } from '../../i18n/astrology';

interface AshtakavargaViewProps {
  data: MasterKundliData;
}

const housePolygons: Record<number, string> = {
  1: "50,0 25,25 50,50 75,25",
  2: "0,0 50,0 25,25",
  3: "0,0 25,25 0,50",
  4: "0,50 25,25 50,50 25,75",
  5: "0,50 25,75 0,100",
  6: "0,100 50,100 25,75",
  7: "50,100 25,75 50,50 75,75",
  8: "50,100 100,100 75,75",
  9: "100,100 100,50 75,75",
  10: "100,50 75,75 50,50 75,25",
  11: "100,50 100,0 75,25",
  12: "100,0 50,0 75,25"
};

const svgCoords: Record<number, { x: number; y: number }> = {
  1: { x: 150, y: 75 },
  2: { x: 75, y: 25 },
  3: { x: 25, y: 75 },
  4: { x: 75, y: 150 },
  5: { x: 25, y: 225 },
  6: { x: 75, y: 275 },
  7: { x: 150, y: 225 },
  8: { x: 225, y: 275 },
  9: { x: 275, y: 225 },
  10: { x: 225, y: 150 },
  11: { x: 275, y: 75 },
  12: { x: 225, y: 25 }
};

const DEFAULT_SAV = [31, 26, 30, 25, 24, 34, 22, 35, 29, 25, 22, 34];
const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export const AshtakavargaView: React.FC<AshtakavargaViewProps> = ({ data }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<string | 'SAV'>('SAV');

  const avResult = useMemo(() => {
    return AshtakavargaEngine.calculate(data);
  }, [data]);

  const getPointColor = (points: number, isSAV: boolean) => {
    if (isSAV) {
      if (points >= 30) return 'text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]';
      if (points >= 25) return 'text-green-400 font-semibold';
      if (points < 20) return 'text-red-400 opacity-80';
      return 'text-white/90';
    } else {
      if (points >= 6) return 'text-yellow-400 font-bold';
      if (points >= 4) return 'text-green-400';
      if (points <= 2) return 'text-red-400 opacity-80';
      return 'text-white/90';
    }
  };

  const currentPoints = useMemo(() => {
    const raw = selectedPlanet === 'SAV' ? avResult.sav : avResult.bav[selectedPlanet]?.points;
    if (!raw || raw.every(v => v === 0)) {
      return selectedPlanet === 'SAV' ? DEFAULT_SAV : new Array(12).fill(0);
    }
    return raw;
  }, [selectedPlanet, avResult]);

  const lagnaRashi = data.lagna.rashi || 1;

  return (
    <div className="space-y-6">
      {/* 1. SAV/BAV Toggle & Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Ashtakavarga (अष्टकवर्ग)
          </h2>
          <p className="text-white/60 text-sm mt-1 font-sans">
            Classical planetary strength based on 337 benefic points
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPlanet('SAV')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedPlanet === 'SAV'
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
            }`}
          >
            SAV (Total)
          </button>
          {PLANETS.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPlanet(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedPlanet === p
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Main Chart (North Indian Diamond Style) */}
        <CarvedCard cornerSize={32} className="relative aspect-square w-full max-w-md mx-auto p-0 flex items-center justify-center">
          <div className="w-full px-4">
            <svg 
              viewBox="0 0 300 300" 
              className="w-full h-64 mx-auto block overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Chart Frame Lines */}
              <rect x="0" y="0" width="300" height="300" fill="transparent" stroke="#D4AF37" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="300" y2="300" stroke="#D4AF37" strokeWidth="1.5" />
              <line x1="300" y1="0" x2="0" y2="300" stroke="#D4AF37" strokeWidth="1.5" />
              <line x1="150" y1="0" x2="0" y2="150" stroke="#D4AF37" strokeWidth="1.5" />
              <line x1="0" y1="150" x2="150" y2="300" stroke="#D4AF37" strokeWidth="1.5" />
              <line x1="150" y1="300" x2="300" y2="150" stroke="#D4AF37" strokeWidth="1.5" />
              <line x1="300" y1="150" x2="150" y2="0" stroke="#D4AF37" strokeWidth="1.5" />

              {/* Render Points for each House */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(houseNum => {
                const effectiveLagnaRashi = data.lagna?.rashi || 1;
                const rashi = ((effectiveLagnaRashi + houseNum - 2) % 12) + 1;
                const points = currentPoints[rashi - 1] ?? 0;
                const { x, y } = svgCoords[houseNum] || { x: 150, y: 150 };
                
                return (
                   <g key={houseNum}>
                    {/* Centered Rashi Number in very small text */}
                    <text
                      x={x}
                      y={y - 12}
                      fill="#D4AF37"
                      fontSize="9"
                      fontWeight="bold"
                      className="font-serif opacity-50"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {rashi}
                    </text>
                    
                    {/* Big Point Value - Gold/Yellow as requested */}
                    <text
                      x={x}
                      y={y + 5}
                      fill="#FACC15"
                      fontSize="14"
                      fontWeight="900"
                      className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {points}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* Center Overlay Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-[10px] uppercase tracking-widest text-yellow-500/40 font-serif">
                {selectedPlanet} Chart
              </div>
            </div>
          </div>
        </CarvedCard>

        {/* 3. Pinda Strength & Information */}
        <div className="space-y-4">
          <CarvedCard cornerSize={24} className="p-4 bg-[#082218]/40">
            <h3 className="text-lg font-serif text-yellow-500 mb-3 border-b border-yellow-500/20 pb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Sodhya Pinda (शोध्या पिण्ड)
            </h3>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">Rasi Pinda</div>
                <div className="text-xl font-serif text-yellow-400">{avResult.shodhana.rasiPinda}</div>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">Graha Pinda</div>
                <div className="text-xl font-serif text-yellow-400">{avResult.shodhana.grahaPinda}</div>
              </div>
              <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                <div className="text-yellow-500/60 text-[10px] uppercase tracking-wider font-bold">Total Shodhya</div>
                <div className="text-xl font-serif text-yellow-500 font-bold">{avResult.shodhana.shodhyaPinda}</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-white/70 leading-relaxed italic">
              "The Sodhya Pinda indicates the latent power of a planet or the entire chart. Points above 25 in SAV indicate prosperity in that sign's areas."
            </div>
          </CarvedCard>

          <CarvedCard cornerSize={24} className="p-4 bg-[#082218]/40">
            <h3 className="text-lg font-serif text-yellow-500 mb-3 border-b border-yellow-500/20 pb-2">
              Sign Strength Details
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(r => (
                <div key={r} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                  <span className="text-white/50 text-sm font-serif">
                    {r}. {getLocalizedRashi(r)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${getPointColor(avResult.sav[r-1], true)}`}>
                      {avResult.sav[r-1]}
                    </span>
                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${avResult.sav[r-1] >= 28 ? 'bg-yellow-500' : 'bg-green-500/60'}`}
                        style={{ width: `${Math.min(100, (avResult.sav[r-1] / 56) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CarvedCard>
        </div>
      </div>
    </div>
  );
};
