/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MasterKundliData } from '../../types/kundli';
import { SudarshanaEngine, SudarshanaData } from '../../services/astrology/sudarshanaEngine';
import CarvedCard from '../ui/CarvedCard';
import { useTranslation } from '../../i18n';
import { Sparkles, Compass } from 'lucide-react';

interface SudarshanaChakraViewProps {
  data: MasterKundliData;
}

const PLANET_HINDI: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगल',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु'
};

const RASHI_HINDI: Record<string, string> = {
  Ar: 'मेष', Ta: 'वृषभ', Ge: 'मिथुन', Cn: 'कर्क', Le: 'सिंह', Vi: 'कन्या',
  Li: 'तुला', Sc: 'वृश्चिक', Sg: 'धनु', Cp: 'मकर', Aq: 'कुंभ', Pi: 'मीन'
};

const RASHI_NAMES = [
  "Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"
];

export const SudarshanaChakraView: React.FC<SudarshanaChakraViewProps> = ({ data }) => {
  const { language, t } = useTranslation();
  const sudarshana: SudarshanaData = SudarshanaEngine.calculate(data);
  const isHi = language === 'hi';

  const formatPlanets = (planets: string[]) => {
    if (planets.length === 0) return isHi ? 'कोई ग्रह नहीं' : 'No Planets';
    if (!isHi) return planets.join(', ');
    return planets.map(p => PLANET_HINDI[p] || p).join(', ');
  };

  const formatRashi = (rashiIdx: number) => {
    const code = RASHI_NAMES[rashiIdx - 1];
    return isHi ? (RASHI_HINDI[code] || code) : code;
  };

  return (
    <div className="space-y-6 font-serif">
      <CarvedCard 
        header={
          <div className="flex flex-col">
            <h2 className="text-[#D4AF37] text-xl font-bold tracking-widest uppercase text-center">
              {isHi ? 'सुदर्शन चक्र (त्रिविध लग्न विश्लेषण)' : 'Sudarshana Chakra'}
            </h2>
            <p className="text-[#D4AF37]/60 text-xs text-center italic">
              {isHi ? 'लग्न (शारीरिक), चंद्र (मानसिक) तथा सूर्य (आत्मीय) दृष्टि का समन्वित चक्र' : 'Concentric Triple-Chakra Astrological Synthesis'}
            </p>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center gap-8 py-6">
          {/* Visual SVG Concentric Chakra */}
          <div className="relative w-full max-w-[420px] bg-black/50 border border-[#D4AF37]/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <svg viewBox="0 0 400 400" className="w-full h-auto">
              <defs>
                <radialGradient id="chakraGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="200" cy="200" r="185" fill="url(#chakraGlow)" />

              {/* 12 House Dividing Rays */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                return (
                  <line 
                    key={i}
                    x1="200" y1="200" 
                    x2={200 + 185 * Math.cos(angle)} 
                    y2={200 + 185 * Math.sin(angle)} 
                    stroke="#D4AF37" 
                    strokeWidth="0.8" 
                    opacity="0.3"
                  />
                );
              })}

              {/* Rings Render Helper */}
              {renderRings(sudarshana, formatPlanets, formatRashi)}

              {/* Center Core */}
              <circle cx="200" cy="200" r="8" fill="#D4AF37" />
              <circle cx="200" cy="200" r="4" fill="#000" />
            </svg>

            <div className="flex justify-center items-center gap-6 mt-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-3 h-3 rounded-full bg-blue-400/30 border border-blue-400" /> {isHi ? 'लग्न चक्र (शरीर)' : 'Lagna (Physical)'}
              </span>
              <span className="flex items-center gap-1.5 text-fuchsia-400">
                <span className="w-3 h-3 rounded-full bg-fuchsia-400/30 border border-fuchsia-400" /> {isHi ? 'चंद्र चक्र (मन)' : 'Moon (Mind)'}
              </span>
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-3 h-3 rounded-full bg-orange-400/30 border border-orange-400" /> {isHi ? 'सूर्य चक्र (आत्मा)' : 'Sun (Soul)'}
              </span>
            </div>
          </div>

          {/* Dasha & Shastriya Interpretation Panel */}
          <div className="w-full space-y-4">
            <div className="bg-black/60 border border-[#D4AF37]/30 p-5 rounded-xl shadow-lg">
              <h3 className="text-[#D4AF37] font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                {isHi ? 'सुदर्शन चक्र वार्षिक वर्ष एवं सक्रिय भाव' : 'Sudarshana Dasha & Active House'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-[#D4AF37]/5 p-4 rounded-lg border border-[#D4AF37]/20">
                <div className="flex justify-between sm:justify-start sm:gap-6">
                  <span className="text-gray-400">{isHi ? 'वर्तमान आयु वर्ष:' : 'Current Year:'}</span>
                  <span className="text-white font-mono font-bold">{sudarshana.currentDashaYear}</span>
                </div>
                <div className="flex justify-between sm:justify-start sm:gap-6">
                  <span className="text-gray-400">{isHi ? 'सक्रिय भाव:' : 'Active House:'}</span>
                  <span className="text-[#D4AF37] font-bold">{isHi ? `भाव ${sudarshana.activeHouse}` : `House ${sudarshana.activeHouse}`}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1A1A1A] border border-[#D4AF37]/40 p-5 rounded-xl shadow-xl">
              <h4 className="text-[#D4AF37] text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Compass className="w-4 h-4" />
                {isHi ? 'शास्त्रीय व्याख्या एवं वर्ष फलकथन' : 'Classical Shastriya Interpretation'}
              </h4>
              <p className="text-[#E0E0E0] text-sm leading-relaxed italic border-l-2 border-[#D4AF37] pl-3">
                {isHi ? t('sudarshan.interpretation_hi') : t('sudarshan.interpretation_en')}
              </p>
            </div>
          </div>

          {/* 12-House Comparative Table */}
          <div className="w-full space-y-3">
            <h3 className="text-base font-bold text-[#D4AF37] uppercase tracking-wider px-1">
              {isHi ? '12 भावों में त्रिविध चक्र तुलनात्मक स्थिति' : '12-House Triple Chakra Comparative Table'}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#D4AF37]/30 bg-black/40">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#D4AF37]/10 border-b border-[#D4AF37]/30 text-[#D4AF37]">
                    <th className="py-3 px-3 uppercase font-bold">{isHi ? 'भाव' : 'House'}</th>
                    <th className="py-3 px-3 uppercase font-bold text-blue-400">{isHi ? 'लग्न चक्र (शरीर)' : 'Lagna Chakra'}</th>
                    <th className="py-3 px-3 uppercase font-bold text-fuchsia-400">{isHi ? 'चंद्र चक्र (मन)' : 'Moon Chakra'}</th>
                    <th className="py-3 px-3 uppercase font-bold text-orange-400">{isHi ? 'सूर्य चक्र (आत्मा)' : 'Sun Chakra'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/10">
                  {sudarshana.lagnaChakra.map((lc, i) => {
                    const mc = sudarshana.moonChakra[i];
                    const sc = sudarshana.suryaChakra[i];
                    const isActive = lc.house === sudarshana.activeHouse;
                    return (
                      <tr key={i} className={`hover:bg-[#D4AF37]/5 transition-colors ${isActive ? 'bg-[#D4AF37]/15 font-bold' : ''}`}>
                        <td className="py-3 px-3 text-[#D4AF37] whitespace-nowrap">
                          {isHi ? `भाव ${lc.house}` : `House ${lc.house}`} {isActive && <span className="text-[10px] bg-[#D4AF37] text-black px-1.5 py-0.5 rounded ml-1 font-bold">{isHi ? 'सक्रिय' : 'ACTIVE'}</span>}
                        </td>
                        <td className="py-3 px-3 text-blue-200">
                          <span className="font-semibold text-white">{formatRashi(lc.rashi)}</span>
                          {lc.planets.length > 0 && <span className="block text-[11px] text-blue-300">({formatPlanets(lc.planets)})</span>}
                        </td>
                        <td className="py-3 px-3 text-fuchsia-200">
                          <span className="font-semibold text-white">{formatRashi(mc.rashi)}</span>
                          {mc.planets.length > 0 && <span className="block text-[11px] text-fuchsia-300">({formatPlanets(mc.planets)})</span>}
                        </td>
                        <td className="py-3 px-3 text-orange-200">
                          <span className="font-semibold text-white">{formatRashi(sc.rashi)}</span>
                          {sc.planets.length > 0 && <span className="block text-[11px] text-orange-300">({formatPlanets(sc.planets)})</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CarvedCard>
    </div>
  );
};

function renderRings(sudarshana: SudarshanaData, formatPlanets: (p: string[]) => string, formatRashi: (r: number) => string) {
  const renderRingPoints = (points: any[], radius: number, color: string) => {
    return (
      <g>
        <circle cx="200" cy="200" r={radius} fill="none" stroke={color} strokeWidth="1.2" opacity="0.6" />
        {points.map((p, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = 200 + (radius - 16) * Math.cos(angle);
          const y = 200 + (radius - 16) * Math.sin(angle);
          
          return (
            <g key={i}>
              <text 
                x={x} 
                y={y} 
                fill={color} 
                fontSize="11" 
                textAnchor="middle" 
                className="font-bold drop-shadow"
              >
                {formatRashi(p.rashi)}
              </text>
              {p.planets.length > 0 && (
                <text 
                  x={x} 
                  y={y + 11} 
                  fill="#facc15" 
                  fontSize="8" 
                  textAnchor="middle"
                  className="font-mono"
                >
                  {p.planets.map((pl: string) => pl.substring(0, 2)).join(',')}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <>
      {renderRingPoints(sudarshana.lagnaChakra, 55, "#60a5fa")}
      {renderRingPoints(sudarshana.moonChakra, 110, "#e879f9")}
      {renderRingPoints(sudarshana.suryaChakra, 165, "#fb923c")}
      
      {/* Ring Labels */}
      <text x="200" y="48" fill="#60a5fa" fontSize="9" textAnchor="middle" className="uppercase font-bold tracking-widest">लग्न</text>
      <text x="200" y="103" fill="#e879f9" fontSize="9" textAnchor="middle" className="uppercase font-bold tracking-widest">चंद्र</text>
      <text x="200" y="158" fill="#fb923c" fontSize="9" textAnchor="middle" className="uppercase font-bold tracking-widest">सूर्य</text>
    </>
  );
}
