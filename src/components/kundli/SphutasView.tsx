/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { SphutasEngine } from '../../services/astrology/sphutasEngine';
import CarvedCard from '../ui/CarvedCard';
import { Sparkles, Shield, Zap, Target, Star, Info } from 'lucide-react';
import { getLocalizedRashi } from '../../i18n/astrology';

interface SphutasViewProps {
  data: MasterKundliData;
}

export const SphutasView: React.FC<SphutasViewProps> = ({ data }) => {
  const result = useMemo(() => SphutasEngine.calculate(data), [data]);

  const getSphutaIcon = (name: string) => {
    if (name.includes('Yogi')) return <Star className="w-5 h-5 text-yellow-400" />;
    if (name.includes('Avayogi')) return <Shield className="w-5 h-5 text-red-400" />;
    if (name.includes('Tri')) return <Zap className="w-5 h-5 text-blue-400" />;
    if (name.includes('Beeja') || name.includes('Kshetra')) return <Target className="w-5 h-5 text-green-400" />;
    return <Sparkles className="w-5 h-5 text-yellow-500/60" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          14 Classical Sphutas (१४ शास्त्रीय स्फुट)
        </h2>
        <p className="text-white/60 text-sm font-sans max-w-2xl">
          Derived mathematical points in the zodiac that reveal specific life dimensions like prosperity, health, progeny, and destiny.
        </p>
      </div>

      {/* Yogi & Avayogi Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CarvedCard cornerSize={24} className="bg-yellow-500/10 border-yellow-500/30 p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Star className="w-32 h-32 text-yellow-500" />
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <div className="text-yellow-500 font-bold text-lg">Yogi (योगी)</div>
              <div className="text-white font-serif text-2xl mt-1">{result.yogi.planet}</div>
              <div className="text-white/60 text-sm mt-1">Nakshatra: <span className="text-yellow-400/80">{result.yogi.nakshatra}</span></div>
              <p className="text-white/40 text-xs mt-3 italic leading-relaxed">
                The planet of prosperity and success. Transits of Yogi are highly favorable.
              </p>
            </div>
          </div>
        </CarvedCard>

        <CarvedCard cornerSize={24} className="bg-red-500/10 border-red-500/30 p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-32 h-32 text-red-500" />
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="text-red-400 font-bold text-lg">Avayogi (अवयोगी)</div>
              <div className="text-white font-serif text-2xl mt-1">{result.avayogi.planet}</div>
              <div className="text-white/60 text-sm mt-1">Nakshatra: <span className="text-red-400/80">{result.avayogi.nakshatra}</span></div>
              <p className="text-white/40 text-xs mt-3 italic leading-relaxed">
                The planet of obstacles and challenges. Association with Avayogi causes delays.
              </p>
            </div>
          </div>
        </CarvedCard>
      </div>

      {/* Sphutas List */}
      <CarvedCard cornerSize={32} className="p-6 bg-[#082218]/40 border-yellow-500/20">
        <h3 className="text-xl font-serif text-yellow-500 mb-6 flex items-center gap-2 border-b border-yellow-500/20 pb-3">
          <Zap className="w-5 h-5" />
          Detailed Sphuta Calculations
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {result.sphutas.map((sphuta, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                sphuta.name.includes('Yogi') 
                ? 'bg-yellow-500/5 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    sphuta.name.includes('Yogi') ? 'bg-yellow-500/20' : 'bg-white/5'
                  }`}>
                    {getSphutaIcon(sphuta.name)}
                  </div>
                  <div>
                    <h4 className="text-yellow-500 font-bold text-sm leading-tight">{sphuta.name}</h4>
                    <div className="text-white/80 font-serif text-base">{sphuta.hindiName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-mono text-sm font-bold">{sphuta.formatted}</div>
                  <div className="text-white/40 text-[10px] uppercase tracking-tighter mt-1">
                    {getLocalizedRashi(sphuta.rashi)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <Info className="w-3 h-3 text-white/30" />
                <span className="text-[11px] text-white/50 italic leading-tight">
                  {sphuta.definition}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CarvedCard>

      {/* Legend/Note */}
      <div className="flex items-center gap-3 p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Info className="w-5 h-5 text-yellow-500" />
        </div>
        <p className="text-xs text-white/60 leading-relaxed font-sans">
          <strong className="text-yellow-500 block mb-1">Calculation Logic:</strong>
          These Sphutas are calculated as per the Brihat Parashara Hora Shastra (BPHS) and Jagannatha Hora tradition using exact sidereal longitudes. Beeja and Kshetra Sphutas are vital for determining fertility and progeny potential in male and female charts respectively.
        </p>
      </div>
    </div>
  );
};
