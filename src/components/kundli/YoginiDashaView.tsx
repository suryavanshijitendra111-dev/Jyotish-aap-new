/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { YoginiDashaEngine, YoginiDashaPeriod } from '../../services/astrology/yoginiDashaEngine';
import CarvedCard from '../ui/CarvedCard';
import { Flower2, Moon, Sun, Zap, Shield, Sparkles, Timer, Calendar, Info } from 'lucide-react';
import { getLocalizedPlanet } from '../../i18n/astrology';

interface YoginiDashaViewProps {
  data: MasterKundliData;
}

export const YoginiDashaView: React.FC<YoginiDashaViewProps> = ({ data }) => {
  const result = useMemo(() => YoginiDashaEngine.calculate(data), [data]);
  const { currentMahadasha, fullCycle } = result;

  const getPlanetIcon = (planet: string) => {
    switch (planet) {
      case 'Sun': return <Sun className="w-5 h-5 text-orange-400" />;
      case 'Moon': return <Moon className="w-5 h-5 text-blue-300" />;
      case 'Jupiter': return <Flower2 className="w-5 h-5 text-yellow-400" />;
      case 'Mars': return <Zap className="w-5 h-5 text-red-500" />;
      case 'Saturn': return <Shield className="w-5 h-5 text-purple-600" />;
      default: return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  const progress = useMemo(() => {
    const start = currentMahadasha.startDate.getTime();
    const end = currentMahadasha.endDate.getTime();
    const now = new Date().getTime();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  }, [currentMahadasha]);

  return (
      <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
            <Timer className="w-6 h-6 text-yellow-400" />
            योगिनी दशा (Yogini Dasha)
          </h2>
          <p className="text-white/60 text-sm mt-1 font-sans italic">
            पारंपरिक ३६-वर्षीय चक्रीय दशा प्रणाली
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Current Active Yogini Card */}
        <CarvedCard cornerSize={32} className="lg:col-span-1 p-6 border-2 border-yellow-500/20 bg-yellow-950/10 shadow-[0_0_40px_rgba(212,175,55,0.1)]">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-black/60 border-2 border-yellow-500/30 flex items-center justify-center shadow-[inset_0_0_20px_rgba(212,175,55,0.2)]">
               {getPlanetIcon(currentMahadasha.planet)}
            </div>
            
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-500/60 font-black">वर्तमान दशा</div>
              <h3 className="text-3xl font-serif text-yellow-500 mt-1">{currentMahadasha.hindiName}</h3>
              <div className="text-xs text-white/40 uppercase tracking-widest">{currentMahadasha.name} ({getLocalizedPlanet(currentMahadasha.planet, 'hi')})</div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex justify-between text-[10px] uppercase font-bold text-white/30 px-1">
                <span>दशा प्रगति</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="text-left">
                <div className="text-[9px] text-white/30 uppercase font-bold">प्रारंभ</div>
                <div className="text-xs text-white/80 font-mono">{currentMahadasha.startDate.toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-white/30 uppercase font-bold">समाप्ति</div>
                <div className="text-xs text-white/80 font-mono">{currentMahadasha.endDate.toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </CarvedCard>

        {/* 3. Cycle Timeline Table */}
        <div className="lg:col-span-2">
          <CarvedCard cornerSize={24} className="p-0 overflow-hidden border-white/5 bg-[#082218]/40">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-yellow-500/60" />
              <h4 className="text-sm font-bold uppercase tracking-widest text-yellow-500/80">३६-वर्षीय चक्रीय क्रम</h4>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-white/30 border-b border-white/5 sticky top-0 bg-[#082218] z-10">
                    <th className="px-4 py-3 font-medium">योगिनी</th>
                    <th className="px-4 py-3 font-medium">अवधि</th>
                    <th className="px-4 py-3 font-medium">काल</th>
                    <th className="px-4 py-3 font-medium">फलकथन</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {fullCycle.map((period, idx) => (
                    <tr key={idx} className={`border-b border-white/5 transition-colors ${period.isCurrent ? 'bg-yellow-500/10 border-yellow-500/30' : 'hover:bg-white/5'}`}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white/90 flex items-center gap-2">
                          {period.hindiName}
                          {period.isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
                        </div>
                        <div className="text-[9px] text-white/40 uppercase">{period.name}</div>
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {period.durationYears} वर्ष
                      </td>
                      <td className="px-4 py-3 font-mono text-white/40 whitespace-nowrap">
                        {period.startDate.getFullYear()} - {period.endDate.getFullYear()}
                      </td>
                      <td className="px-4 py-3 text-white/50 italic leading-relaxed max-w-xs">
                        {period.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CarvedCard>
          
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-3">
            <Info className="w-5 h-5 text-yellow-500/40 shrink-0" />
            <p className="text-[10px] text-white/40 leading-relaxed font-serif italic">
              "योगिनी दशा उत्तर भारत में ३६-वर्षीय चक्र के भीतर घटनाओं के सटीक निर्धारण के लिए अत्यंत आदरणीय है। प्रत्येक योगिनी एक विशिष्ट देवी और नियंत्रक ग्रह का प्रतिनिधित्व करती है।"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
