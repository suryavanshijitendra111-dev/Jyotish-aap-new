/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { TransitAnalysisResult } from '../../services/jyotish/transitEngine';
import { GocharVedhaEngine, GocharVedhaAnalysis } from '../../services/astrology/gocharVedhaEngine';
import { AshtakavargaEngine } from '../../services/astrology/ashtakavargaEngine';
import CarvedCard from '../ui/CarvedCard';
import { Shield, Timer, AlertTriangle, CheckCircle, Ban, ArrowRight, Info } from 'lucide-react';
import { getLocalizedPlanet, getLocalizedHouse } from '../../i18n/astrology';

interface GocharVedhaViewProps {
  natalData: MasterKundliData;
  transitResult: TransitAnalysisResult | null;
}

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export const GocharVedhaView: React.FC<GocharVedhaViewProps> = ({ natalData, transitResult }) => {
  const analysis = useMemo(() => {
    if (!transitResult || !transitResult.transitPlanets) return null;
    return GocharVedhaEngine.analyze(natalData, transitResult.transitPlanets);
  }, [natalData, transitResult]);

  const savPoints = useMemo(() => {
    return AshtakavargaEngine.calculate(natalData).sav;
  }, [natalData]);

  if (!analysis) {
    return (
      <div className="p-8 text-center text-white/40 italic font-serif">
        Initializing Real-Time Transit Data...
      </div>
    );
  }

  const { vedha, sadeSati } = analysis;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Favourable': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'Vedha Blocked': return <Ban className="w-4 h-4 text-amber-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-white/20" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Favourable': return 'text-emerald-400';
      case 'Vedha Blocked': return 'text-amber-500';
      default: return 'text-white/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Gochara Vedha (गोचर-वेध)
          </h2>
          <p className="text-white/60 text-sm mt-1 font-sans">
            Real-time planetary transit analysis with classical obstruction rules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Transit & Vedha Table */}
        <div className="lg:col-span-2">
          <CarvedCard cornerSize={24} className="p-0 overflow-hidden bg-[#082218]/40">
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-yellow-500/80">
                Planetary Transit Report
              </h3>
              <span className="text-[10px] text-white/40 font-mono">
                Relative to Natal Moon
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-white/30 border-b border-white/5">
                    <th className="px-4 py-3 font-medium">Planet</th>
                    <th className="px-4 py-3 font-medium text-center">House</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Obstruction (Vedha)</th>
                    <th className="px-4 py-3 font-medium text-right">SAV</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {PLANETS.map(pName => {
                    const res = vedha[pName];
                    const pts = savPoints[res.transitHouse - 1];
                    
                    return (
                      <tr key={pName} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white/90">{getLocalizedPlanet(pName, 'hi')}</div>
                          <div className="text-[9px] text-white/40 uppercase">{pName}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-white/10 px-2 py-0.5 rounded-full font-bold">
                            {res.transitHouse}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-1.5 font-bold ${getStatusColor(res.status)}`}>
                            {getStatusIcon(res.status)}
                            {res.status === 'Favourable' ? 'शुभ (Favourable)' : res.status === 'Vedha Blocked' ? 'वेध (Blocked)' : 'अशुभ (Neutral)'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {res.isBlocked ? (
                            <div className="flex flex-col">
                              <span className="text-amber-500 font-bold flex items-center gap-1">
                                <Ban className="w-3 h-3" /> {getLocalizedPlanet(res.vedhaPlanet!, 'hi')}
                              </span>
                              <span className="text-[9px] text-white/40 italic">
                                in {res.vedhaHouse}th house
                              </span>
                            </div>
                          ) : (
                            <span className="text-white/10 italic">No Obstruction</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-yellow-500/60">
                          {pts}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CarvedCard>
        </div>

        {/* 3. Sade Sati Card */}
        <div className="space-y-6">
          <CarvedCard cornerSize={32} className={`p-6 border-2 transition-all duration-500 ${sadeSati.isActive ? 'border-red-500/40 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-emerald-500/20 bg-emerald-950/10'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sadeSati.isActive ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                <Timer className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className={`text-[10px] uppercase tracking-widest font-black ${sadeSati.isActive ? 'text-red-400' : 'text-emerald-400'}`}>
                  Sade Sati Analysis
                </div>
                <div className="text-xl font-serif text-white/90">
                  {sadeSati.isActive ? 'Active (सक्रिय)' : 'Inactive'}
                </div>
              </div>
            </div>

            {sadeSati.isActive && (
              <div className="space-y-4">
                <div className="p-3 bg-black/40 rounded-xl border border-red-500/20">
                  <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Current Phase</div>
                  <div className="text-lg font-serif text-yellow-500">{sadeSati.phase}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-white/30">
                    <span>Saturn Orb Intensity</span>
                    <span>{Math.abs(sadeSati.diffDegrees).toFixed(1)}°</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${sadeSati.isDegreeActive ? 'bg-red-500' : 'bg-yellow-500/40'}`}
                      style={{ width: `${Math.max(5, 100 - (Math.abs(sadeSati.diffDegrees) / 90) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-white/40 italic">
                    {sadeSati.isDegreeActive 
                      ? 'High Intensity: Saturn is within 45° of your Natal Moon.'
                      : 'Low Intensity: Saturn is in the sign-vicinity but at a safe distance.'}
                  </div>
                </div>
              </div>
            )}

            {!sadeSati.isActive && (
              <div className="text-xs text-white/60 leading-relaxed italic border-t border-white/5 pt-4 mt-4">
                "Saturn is currently transiting far from your natal Moon. You are in a period of relative relief from Shani's heavy discipline."
              </div>
            )}
          </CarvedCard>

          <CarvedCard cornerSize={24} className="p-4 bg-white/5 border-white/10">
            <h4 className="text-xs font-bold text-yellow-500/80 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Classical Insights
            </h4>
            <div className="space-y-3 text-[11px] text-white/60 leading-relaxed">
              <div className="flex gap-2">
                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                <p>Transit results are measured from the <strong>Natal Moon (Janma Rashi)</strong> as per Phaladeepika.</p>
              </div>
              <div className="flex gap-2">
                <Ban className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                <p>A "Vedha Blocked" status means even a shubh transit is temporarily obstructed by another planet.</p>
              </div>
            </div>
          </CarvedCard>
        </div>
      </div>
    </div>
  );
};
