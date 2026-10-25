import React, { useState } from 'react';
import { PrashnaKundliData } from '../../types/kundli';

interface Props {
  data: PrashnaKundliData;
  onSelectHouse?: (house: number) => void;
}

// Geometric coordinates for North Indian chart houses
const housePolygons: Record<number, string> = {
  1: "50,0 100,50 50,100 0,50",      // Center Diamond (Houses 1, 4, 7, 10 are centered)
  // Standard North Indian Kundli houses geometry:
  // House 1: Top Diamond (25,25 50,0 75,25 50,50)
  // Let's use clean polygons:
};

// SVG standard coordinates for 12 North Indian houses (viewBox 0 0 100 100)
const HOUSE_POLYGONS: Record<number, string> = {
  1: "50,0 75,25 50,50 25,25",       // 1st House (Top Center Diamond)
  2: "0,0 50,0 25,25",               // 2nd House (Top Left Triangle)
  3: "0,0 25,25 0,50",               // 3rd House (Upper Left Triangle)
  4: "0,50 25,25 50,50 25,75",       // 4th House (Left Diamond)
  5: "0,50 25,75 0,100",             // 5th House (Lower Left Triangle)
  6: "0,100 25,75 50,100",           // 6th House (Bottom Left Triangle)
  7: "50,50 75,75 50,100 25,75",     // 7th House (Bottom Center Diamond)
  8: "50,100 75,75 100,100",         // 8th House (Bottom Right Triangle)
  9: "75,75 100,50 100,100",         // 9th House (Lower Right Triangle)
  10: "50,0 75,25 50,50 75,75",      // Right Diamond: (75,25 100,50 75,75 50,50)
  11: "75,25 100,0 100,50",          // 11th House (Upper Right Triangle)
  12: "50,0 75,25 100,0"             // 12th House (Top Right Triangle)
};

// Fixed corrected standard polygons for North Indian Kundli:
const CORRECTED_HOUSE_POLYGONS: Record<number, string> = {
  1: "50,0 75,25 50,50 25,25",
  2: "0,0 50,0 25,25",
  3: "0,0 25,25 0,50",
  4: "0,50 25,25 50,50 25,75",
  5: "0,50 25,75 0,100",
  6: "0,100 25,75 50,100",
  7: "50,50 75,75 50,100 25,75",
  8: "50,100 75,75 100,100",
  9: "75,75 100,50 100,100",
  10: "50,50 75,25 100,50 75,75",
  11: "75,25 100,0 100,50",
  12: "50,0 75,25 100,0"
};

// Center positions for house text positioning (percentage based in 100x100 box)
const HOUSE_POSITIONS: Record<number, { top: string; left: string }> = {
  1: { top: '16%', left: '50%' },
  2: { top: '8%', left: '25%' },
  3: { top: '25%', left: '8%' },
  4: { top: '50%', left: '20%' },
  5: { top: '75%', left: '8%' },
  6: { top: '90%', left: '25%' },
  7: { top: '80%', left: '50%' },
  8: { top: '90%', left: '75%' },
  9: { top: '75%', left: '92%' },
  10: { top: '50%', left: '78%' },
  11: { top: '25%', left: '92%' },
  12: { top: '8%', left: '75%' }
};

export default function PrashnaChart({ data, onSelectHouse }: Props) {
  const [selectedHouse, setSelectedHouse] = useState<number>(1);

  const handleHouseClick = (h: number) => {
    setSelectedHouse(h);
    if (onSelectHouse) onSelectHouse(h);
  };

  // Group planets by house
  const planetsByHouse: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) planetsByHouse[i] = [];

  Object.values(data.planets).forEach(p => {
    if (p.house >= 1 && p.house <= 12) {
      const mark = p.isRetrograde ? `${p.planet.substring(0, 2)}(R)` : p.planet.substring(0, 2);
      planetsByHouse[p.house].push(mark);
    }
  });

  const karyaBhava = data.significators.karyaBhava;

  return (
    <div className="flex flex-col items-center">
      {/* North Indian Chart SVG Container */}
      <div className="w-full aspect-square max-w-[340px] relative mb-6 mx-auto bg-[#04110b]/90 border border-[#d4af37]/40 rounded-3xl p-2 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#d4af37] stroke-[0.6] pointer-events-auto">
          {/* Base Background */}
          <rect x="0" y="0" width="100" height="100" className="fill-[#082218]/40 stroke-none" />
          
          {/* Clickable House Polygons */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
            const isKarya = house === karyaBhava;
            const isLagna = house === 1;
            const isSelected = selectedHouse === house;

            let fillClass = 'fill-transparent hover:fill-[#d4af37]/20';
            if (isSelected) fillClass = 'fill-[#d4af37]/25';
            else if (isKarya) fillClass = 'fill-emerald-500/15';

            return (
              <polygon
                key={house}
                points={CORRECTED_HOUSE_POLYGONS[house]}
                className={`${fillClass} cursor-pointer transition-colors`}
                onClick={() => handleHouseClick(house)}
              />
            );
          })}

          {/* Grid lines */}
          <rect x="0" y="0" width="100" height="100" className="fill-none pointer-events-none" />
          <line x1="0" y1="0" x2="100" y2="100" className="pointer-events-none" />
          <line x1="100" y1="0" x2="0" y2="100" className="pointer-events-none" />
          <polygon points="50,0 100,50 50,100 0,50" className="fill-none pointer-events-none" />
        </svg>

        {/* Dynamic Overlays: House Numbers, Rashi & Occupying Planets */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
          const houseData = data.d1Chart[house];
          const pos = HOUSE_POSITIONS[house];
          const planets = planetsByHouse[house];
          const isLagna = house === 1;
          const isKarya = house === karyaBhava;

          return (
            <div
              key={house}
              onClick={() => handleHouseClick(house)}
              style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
              className={`absolute flex flex-col items-center justify-center p-1 rounded cursor-pointer transition-transform hover:scale-110 z-10 ${
                selectedHouse === house ? 'bg-[#d4af37]/30 border border-[#d4af37]' : ''
              }`}
            >
              {/* Rashi Number */}
              <span className="text-[10px] font-bold text-[#d4af37]">
                {houseData ? houseData.rashi : house}
              </span>

              {/* Special Tag for Lagna & Karya */}
              {isLagna && (
                <span className="text-[8px] bg-[#d4af37] text-black font-extrabold px-1 rounded-sm leading-tight">
                  लग्न
                </span>
              )}
              {isKarya && !isLagna && (
                <span className="text-[8px] bg-emerald-500 text-black font-extrabold px-1 rounded-sm leading-tight">
                  कार्य
                </span>
              )}

              {/* Occupying Planets */}
              {planets.length > 0 && (
                <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 max-w-[45px]">
                  {planets.map((pl, idx) => (
                    <span
                      key={idx}
                      className="text-[8px] font-semibold text-white px-0.5 rounded bg-black/60 border border-white/20"
                    >
                      {pl}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected House Details Card */}
      {selectedHouse && data.d1Chart[selectedHouse] && (
        <div className="w-full bg-[#0a1812]/90 border border-[#d4af37]/30 rounded-2xl p-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="font-bold text-[#d4af37]">
              भाव {selectedHouse} ({selectedHouse === 1 ? 'लग्न भाव / Querent' : selectedHouse === karyaBhava ? 'कार्य भाव / Matter' : `House ${selectedHouse}`})
            </span>
            <span className="text-gray-300">
              राशि: <strong className="text-white">{data.d1Chart[selectedHouse].rashiName} ({data.d1Chart[selectedHouse].rashi})</strong>
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-300">
            <span>भावेश (Lord): <strong className="text-[#d4af37]">{data.d1Chart[selectedHouse].signLord}</strong></span>
            <span>
              ग्रह: {planetsByHouse[selectedHouse].length > 0 ? (
                <strong className="text-emerald-400">{planetsByHouse[selectedHouse].join(', ')}</strong>
              ) : (
                <span className="text-gray-500">रिक्त (Empty)</span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
