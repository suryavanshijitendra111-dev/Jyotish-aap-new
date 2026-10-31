/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { LongevityArgalaEngine, LongevityArgalaResult } from '../../services/astrology/longevityArgalaEngine';
import CarvedCard from '../ui/CarvedCard';
import { Shield, Clock, Info, AlertTriangle, CheckCircle2, Crosshair } from 'lucide-react';
import { getLocalizedPlanet } from '../../i18n/astrology';

interface LongevityArgalaViewProps {
  data: MasterKundliData;
}

export const LongevityArgalaView: React.FC<LongevityArgalaViewProps> = ({ data }) => {
  const result = useMemo(() => LongevityArgalaEngine.calculate(data), [data]);

  return (
    <div className="space-y-6">
      {/* Longevity Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CarvedCard className="md:col-span-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/30">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-amber-200 mb-1">आयु वर्ग (आयु निर्णय)</h3>
          <p className="text-2xl font-serif text-white tracking-wide">{result.longevity.category}</p>
          <div className="mt-4 px-4 py-1 rounded-full bg-amber-900/40 border border-amber-700/50 text-amber-200 text-sm font-medium">
            आयु सीमा: {result.longevity.range}
          </div>
        </CarvedCard>

        <CarvedCard className="md:col-span-2 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-amber-200 uppercase tracking-wider">जैमिनी तीन जोड़े (आयु) विश्लेषण</h3>
          </div>
          <div className="space-y-3">
            {result.longevity.pairs.map((pair, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="text-amber-100/70 text-sm font-medium">{pair.pair}</span>
                <span className={`text-sm font-bold ${
                  pair.result.includes('Long') ? 'text-emerald-400' : 
                  pair.result.includes('Short') ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {pair.result}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 items-start text-xs text-amber-200/50 italic bg-amber-900/10 p-2 rounded">
            <Info className="w-4 h-4 shrink-0" />
            <p>{result.longevity.explanation}</p>
          </div>
        </CarvedCard>
      </div>

      {/* Argala Analysis Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Crosshair className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-200 uppercase tracking-wider">अर्गला एवं विरोधर्गला (हस्तक्षेप विश्लेषण)</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.argala.map((arg, idx) => (
            <CarvedCard key={idx} className="p-4 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center font-bold text-amber-400 border border-amber-500/30">
                    {arg.house}
                  </span>
                  <span className="text-sm font-bold text-amber-100 tracking-tight">भाव विश्लेषण</span>
                </div>
                {(arg.activeArgalas.length > 0 || arg.blockedArgalas.length > 0) && (
                  <div className="flex gap-1">
                    {arg.activeArgalas.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" title="Active Argala"></span>
                    )}
                    {arg.blockedArgalas.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" title="Obstructed Argala"></span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Active Argalas */}
                {arg.activeArgalas.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> सक्रिय हस्तक्षेप (Active Argala)
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {arg.activeArgalas.map((a, i) => (
                        <div key={i} className="px-2 py-1 bg-emerald-900/30 border border-emerald-500/20 rounded text-[11px] text-emerald-100">
                          {getLocalizedPlanet(a.planet, 'hi')} (भाव {a.house})
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-2 px-3 border border-dashed border-white/5 rounded text-[11px] text-white/30 text-center">
                    कोई सक्रिय अर्गला हस्तक्षेप नहीं
                  </div>
                )}

                {/* Blocked Argalas */}
                {arg.blockedArgalas.length > 0 && (
                  <div className="space-y-2 border-t border-white/5 pt-2">
                    <p className="text-[10px] uppercase text-rose-400 font-bold tracking-widest flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> बाधित (विरोधर्गला)
                    </p>
                    <div className="space-y-1">
                      {arg.blockedArgalas.map((b, i) => (
                        <div key={i} className="text-[11px] text-rose-200/70 italic flex items-center gap-2">
                          <span className="text-white/80 font-medium">{getLocalizedPlanet(b.planet, 'hi')}</span> 
                          <span>द्वारा बाधित</span> 
                          <span className="text-rose-400">{b.blockedBy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CarvedCard>
          ))}
        </div>
      </div>
      
      {/* Legend / Key */}
      <CarvedCard className="p-4 bg-amber-900/5 border-amber-900/20">
        <h4 className="text-xs font-bold text-amber-400 uppercase mb-3 text-center tracking-widest">शास्त्रीय नियम सार</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] text-amber-200/60 leading-relaxed uppercase tracking-tighter">
          <div className="space-y-1 border-r border-white/5 px-2">
            <p className="text-amber-200 font-bold">द्वितीय भाव</p>
            <p>धन अर्गला (धन एवं कुटुंब)</p>
          </div>
          <div className="space-y-1 border-r border-white/5 px-2">
            <p className="text-amber-200 font-bold">चतुर्थ भाव</p>
            <p>सुख अर्गला (सुख एवं संपत्ति)</p>
          </div>
          <div className="space-y-1 border-r border-white/5 px-2">
            <p className="text-amber-200 font-bold">एकादश भाव</p>
            <p>लाभ अर्गला (लाभ एवं उद्देश्य)</p>
          </div>
          <div className="space-y-1 px-2">
            <p className="text-amber-200 font-bold">पंचम भाव</p>
            <p>धी अर्गला (बुद्धि एवं कर्म)</p>
          </div>
        </div>
      </CarvedCard>
    </div>
  );
};
