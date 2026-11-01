/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PRASHNA KUNDLI CHART (NORTH INDIAN STYLE)
 */

import React, { useMemo } from 'react';
import { PrashnaKundliData } from '../../types/kundli';

interface Props {
  data: PrashnaKundliData | null;
  className?: string;
}

const HOUSE_POLYGONS: Record<number, string> = {
  1: "50,0 75,25 50,50 25,25",
  2: "0,0 50,0 25,25",
  3: "0,0 25,25 0,50",
  4: "0,50 25,25 50,50 25,75",
  5: "0,50 25,75 0,100",
  6: "0,100 50,100 25,75",
  7: "50,100 25,75 50,50 75,75",
  8: "50,100 100,100 75,75",
  9: "100,50 75,75 100,100",
  10: "50,50 75,25 100,50 75,75",
  11: "100,0 100,50 75,25",
  12: "50,0 100,0 75,25"
};

const HOUSE_LABEL_POS: Record<number, { x: number; y: number }> = {
  1: { x: 50, y: 22 },
  2: { x: 25, y: 12 },
  3: { x: 12, y: 25 },
  4: { x: 30, y: 50 },
  5: { x: 12, y: 75 },
  6: { x: 25, y: 88 },
  7: { x: 50, y: 78 },
  8: { x: 75, y: 88 },
  9: { x: 88, y: 75 },
  10: { x: 70, y: 50 },
  11: { x: 88, y: 25 },
  12: { x: 75, y: 12 }
};

export default function PrashnaChart({ data, className = '' }: Props) {
  const houseOccupants = useMemo(() => {
    const map: Record<number, { rashi: number; planets: string[] }> = {};
    for (let i = 1; i <= 12; i++) {
      const rashiNum = data ? ((data.ascendant.rashiNumber + i - 2) % 12) + 1 : i;
      map[i] = { rashi: rashiNum, planets: [] };
    }

    if (data && data.planets) {
      Object.values(data.planets).forEach(p => {
        if (p.house >= 1 && p.house <= 12) {
          const retStr = p.isRetrograde ? '(R)' : '';
          map[p.house].planets.push(`${p.hindiName}${retStr}`);
        }
      });
    }

    return map;
  }, [data]);

  return (
    <div className={`relative w-full max-w-md mx-auto aspect-square bg-[#030d08] border-2 border-[#d4af37]/60 rounded-2xl p-2 shadow-[0_0_30px_rgba(212,175,55,0.2)] ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background & Outer Border */}
        <rect x="0" y="0" width="100" height="100" fill="none" stroke="#d4af37" strokeWidth="1" />
        
        {/* Diamond Crossing Lines */}
        <line x1="0" y1="0" x2="100" y2="100" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
        <line x1="50" y1="0" x2="0" y2="50" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
        <line x1="0" y1="50" x2="50" y2="100" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
        <line x1="50" y1="100" x2="100" y2="50" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />
        <line x1="100" y1="50" x2="50" y2="0" stroke="#d4af37" strokeWidth="0.8" opacity="0.7" />

        {/* Polygons with hover effects */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(hNum => (
          <polygon
            key={hNum}
            points={HOUSE_POLYGONS[hNum]}
            className="fill-transparent hover:fill-[#d4af37]/10 transition-colors"
          />
        ))}

        {/* House Content (Rashi Number & Planets) */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(hNum => {
          const pos = HOUSE_LABEL_POS[hNum];
          const info = houseOccupants[hNum];
          return (
            <g key={hNum}>
              {/* Rashi Number in house */}
              <text
                x={pos.x}
                y={pos.y}
                fill="#d4af37"
                fontSize="3.2"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                opacity="0.9"
              >
                {info?.rashi}
              </text>
              {/* Occupying Planets */}
              {info?.planets.map((pl, idx) => (
                <text
                  key={idx}
                  x={pos.x}
                  y={pos.y + 4 + idx * 3.2}
                  fill="#f8fafc"
                  fontSize="2.4"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {pl}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-1 right-2 text-[9px] text-[#d4af37]/70 font-semibold">
        प्रश्न लग्न: {data?.ascendant.hindiSign || 'लग्न'} ({data?.ascendant.degree.toFixed(2)}°)
      </div>
    </div>
  );
}
