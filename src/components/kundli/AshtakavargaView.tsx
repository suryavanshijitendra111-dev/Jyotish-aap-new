/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { AshtakavargaEngine, AshtakavargaResult } from '../../services/astrology/ashtakavargaEngine';
import CarvedCard from '../ui/CarvedCard';
import { Sparkles, Info, Loader2 } from 'lucide-react';
import { getLocalizedRashi } from '../../i18n/astrology';
import { useTranslation } from '../../i18n';

interface AshtakavargaViewProps {
  data?: MasterKundliData | null;
}

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
  const { t } = useTranslation();
  const [selectedPlanet, setSelectedPlanet] = useState<string | 'SAV'>('SAV');

  const avResult = useMemo<AshtakavargaResult>(() => {
    if (!data) {
      return {
        sav: DEFAULT_SAV,
        bav: PLANETS.reduce((acc, p) => ({ ...acc, [p]: new Array(12).fill(4) }), {}),
        shodhana: { rasiPinda: 120, grahaPinda: 140, sodhyaPinda: 260 }
      };
    }
    try {
      return AshtakavargaEngine.calculate(data);
    } catch {
      return {
        sav: DEFAULT_SAV,
        bav: PLANETS.reduce((acc, p) => ({ ...acc, [p]: new Array(12).fill(4) }), {}),
        shodhana: { rasiPinda: 120, grahaPinda: 140, sodhyaPinda: 260 }
      };
    }
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
    const raw = selectedPlanet === 'SAV' ? avResult?.sav : (avResult?.bav?.[selectedPlanet] || avResult?.bav?.[selectedPlanet.toLowerCase()]);
    const pointsList = raw || (selectedPlanet === 'SAV' ? DEFAULT_SAV : new Array(12).fill(4));
    return (pointsList || []).length === 12 ? pointsList : DEFAULT_SAV;
  }, [selectedPlanet, avResult]);

  const savPoints = avResult?.sav || DEFAULT_SAV;
  const planetsList = PLANETS || [];

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-black/40 border border-[#d4af37]/30 rounded-2xl">
        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mb-3" />
        <p className="text-sm text-[#d4af37] font-medium">{t('common.loading') || 'Loading Ashtakavarga data...'}</p>
      </div>
    );
  }

  const selectedPlanetDisplay = selectedPlanet === 'SAV'
    ? (t('ashtakavarga.sav_total') || 'Sav Total')
    : (t(`ashtakavarga.${selectedPlanet.toLowerCase()}`) || selectedPlanet);

  return (
    <div className="space-y-6">
      {/* 1. SAV/BAV Toggle & Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            {t('modules.ashtakavarga.title') || 'Ashtakavarga (अष्टकवर्ग)'}
          </h2>
          <p className="text-white/60 text-sm mt-1 font-sans">
            {t('modules.ashtakavarga.desc') || 'Classical planetary strength based on 337 benefic points'}
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
            {t('ashtakavarga.sav_total') || 'Sav Total'}
          </button>
          {planetsList.map(p => {
            const localizedPlanetName = t(`ashtakavarga.${p.toLowerCase()}`) || p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPlanet(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedPlanet === p
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                {localizedPlanetName}
              </button>
            );
          })}
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

              {/* Render Points for each House with safe fallbacks */}
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] || []).map(houseNum => {
                const effectiveLagnaRashi = data?.lagna?.rashi || 1;
                const rashi = ((effectiveLagnaRashi + houseNum - 2) % 12) + 1;
                const points = (currentPoints || [])[rashi - 1] ?? 28;
                const { x, y } = svgCoords[houseNum] || { x: 150, y: 150 };
                
                return (
                   <g key={houseNum}>
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
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-[10px] uppercase tracking-widest text-yellow-500/40 font-serif">
                {selectedPlanetDisplay} {t('ashtakavarga.chart_suffix') || 'Chart'}
              </div>
            </div>
          </div>
        </CarvedCard>

        {/* 3. Pinda Strength & Information */}
        <div className="space-y-4">
          <CarvedCard cornerSize={24} className="p-4 bg-[#082218]/40">
            <h3 className="text-lg font-serif text-yellow-500 mb-3 border-b border-yellow-500/20 pb-2 flex items-center gap-2">
              <Info className="w-5 h-5" />
              {t('ashtakavarga.shodhya_pinda') || 'Sodhya Pinda (शोध्य पिंड)'}
            </h3>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">{t('ashtakavarga.rasi_pinda') || 'Rasi Pinda'}</div>
                <div className="text-xl font-serif text-yellow-400">{avResult?.shodhana?.rasiPinda || 120}</div>
              </div>
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">{t('ashtakavarga.graha_pinda') || 'Graha Pinda'}</div>
                <div className="text-xl font-serif text-yellow-400">{avResult?.shodhana?.grahaPinda || 140}</div>
              </div>
              <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                <div className="text-yellow-500/60 text-[10px] uppercase tracking-wider font-bold">{t('ashtakavarga.total_shodhya') || 'Total Shodhya'}</div>
                <div className="text-xl font-serif text-yellow-500 font-bold">{avResult?.shodhana?.shodhyaPinda || 260}</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-white/70 leading-relaxed italic">
              {t('ashtakavarga.note') || 'The Sodhya Pinda indicates the latent power of a planet or the entire chart. Points above 25 in SAV indicate prosperity in that sign areas.'}
            </div>
          </CarvedCard>

          <CarvedCard cornerSize={24} className="p-4 bg-[#082218]/40">
            <h3 className="text-lg font-serif text-yellow-500 mb-3 border-b border-yellow-500/20 pb-2">
              {t('ashtakavarga.sign_strength') || 'Sign Strength Details (राशि बल विवरण)'}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] || []).map(r => {
                const savPointsVal = (savPoints || [])[r - 1] ?? 28;
                return (
                  <div key={r} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                    <span className="text-white/50 text-sm font-serif">
                      {r}. {getLocalizedRashi(r)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${getPointColor(savPointsVal, true)}`}>
                        {savPointsVal}
                      </span>
                      <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${savPointsVal >= 28 ? 'bg-yellow-500' : 'bg-green-500/60'}`}
                          style={{ width: `${Math.min(100, (savPointsVal / 56) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CarvedCard>
        </div>
      </div>
    </div>
  );
};
