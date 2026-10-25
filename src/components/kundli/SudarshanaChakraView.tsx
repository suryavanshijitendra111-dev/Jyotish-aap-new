import React from 'react';
import { MasterKundliData } from '../../types/kundli';
import { SudarshanaEngine, SudarshanaData } from '../../services/astrology/sudarshanaEngine';
import CarvedCard from '../ui/CarvedCard';

interface SudarshanaChakraViewProps {
  data: MasterKundliData;
}

export const SudarshanaChakraView: React.FC<SudarshanaChakraViewProps> = ({ data }) => {
  const sudarshana = SudarshanaEngine.calculate(data);

  const RASHI_NAMES = [
    "Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"
  ];

  const getPlanetSymbols = (planets: string[]) => {
    const symbols: Record<string, string> = {
      "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me", 
      "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke"
    };
    return planets.map(p => symbols[p] || p.substring(0, 2)).join(' ');
  };

  const renderChakraRing = (points: any[], radius: number, label: string, color: string) => {
    return (
      <g>
        <circle cx="200" cy="200" r={radius} fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
        {points.map((p, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = 200 + (radius - 15) * Math.cos(angle);
          const y = 200 + (radius - 15) * Math.sin(angle);
          
          return (
            <g key={i}>
              <text 
                x={x} 
                y={y} 
                fill={color} 
                fontSize="10" 
                textAnchor="middle" 
                className="font-bold"
              >
                {RASHI_NAMES[p.rashi - 1]}
              </text>
              <text 
                x={x} 
                y={y + 12} 
                fill="#facc15" 
                fontSize="8" 
                textAnchor="middle"
              >
                {getPlanetSymbols(p.planets)}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <CarvedCard 
        header={
          <div className="flex flex-col">
            <h2 className="text-[#D4AF37] text-xl font-bold tracking-widest uppercase text-center">Sudarshana Chakra</h2>
            <p className="text-[#D4AF37]/60 text-xs text-center italic">सुदर्शन चक्र: त्रिविध लग्न विश्लेषण</p>
          </div>
        }
      >
        <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-6">
          {/* Visual SVG Chakra */}
          <div className="relative w-full max-w-[400px]">
            <svg viewBox="0 0 400 400" className="w-full h-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              {/* Background Glow */}
              <defs>
                <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="200" cy="200" r="180" fill="url(#sunGlow)" />

              {/* Dividing Lines */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                return (
                  <line 
                    key={i}
                    x1="200" y1="200" 
                    x2={200 + 180 * Math.cos(angle)} 
                    y2={200 + 180 * Math.sin(angle)} 
                    stroke="#D4AF37" 
                    strokeWidth="0.5" 
                    opacity="0.3"
                  />
                );
              })}

              {/* Rings */}
              {renderChakraRing(sudarshana.lagnaChakra, 60, "Lagna", "#60a5fa")}
              {renderChakraRing(sudarshana.moonChakra, 110, "Moon", "#e879f9")}
              {renderChakraRing(sudarshana.suryaChakra, 160, "Surya", "#fb923c")}

              {/* Center Point */}
              <circle cx="200" cy="200" r="5" fill="#D4AF37" />
              
              {/* Legend labels */}
              <text x="200" y="55" fill="#60a5fa" fontSize="8" textAnchor="middle" className="uppercase font-bold">Lagna</text>
              <text x="200" y="105" fill="#e879f9" fontSize="8" textAnchor="middle" className="uppercase font-bold">Chandra</text>
              <text x="200" y="155" fill="#fb923c" fontSize="8" textAnchor="middle" className="uppercase font-bold">Surya</text>
            </svg>
          </div>

          {/* Dasha Info */}
          <div className="flex-1 space-y-4 w-full">
            <div className="bg-black/40 border border-[#D4AF37]/20 p-4 rounded-lg">
              <h3 className="text-[#D4AF37] font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Sudarshana Dasha (Current)
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-400">Current Year:</div>
                <div className="text-white font-mono">{sudarshana.currentDashaYear}</div>
                <div className="text-gray-400">Active House:</div>
                <div className="text-[#D4AF37] font-bold">{sudarshana.activeHouse}</div>
              </div>
            </div>

            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-4 rounded-lg">
              <h4 className="text-[#D4AF37] text-xs font-bold uppercase mb-2">Classical Interpretation</h4>
              <p className="text-white text-sm italic leading-relaxed">
                {sudarshana.analysis}
              </p>
            </div>

            <p className="text-xs text-gray-400 italic leading-relaxed">
              * Sudarshana Chakra provides a synthesized view from Ascendant, Moon, and Sun. The active house changes every year, reflecting the unfolding of destiny.
            </p>
          </div>
        </div>
      </CarvedCard>
    </div>
  );
};
