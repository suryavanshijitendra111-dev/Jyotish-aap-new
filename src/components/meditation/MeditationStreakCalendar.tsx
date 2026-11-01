/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION STREAK & CALENDAR MODAL
 */

import React, { useMemo } from 'react';
import { X, Calendar, Flame, CheckCircle2 } from 'lucide-react';
import { MeditationStorageService } from '../../services/meditation/meditationStorageService';

interface Props {
  profileId: string;
  onClose: () => void;
}

export const MeditationStreakCalendar: React.FC<Props> = ({ profileId, onClose }) => {
  const data = useMemo(() => {
    return MeditationStorageService.loadState(profileId);
  }, [profileId]);

  // Last 28 days mock activity grid
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const isToday = i === 27;
    const hasPracticed = i >= 20 || (i % 3 === 0);
    return {
      dayNum: d.getDate(),
      hasPracticed,
      isToday
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#04120c] border border-[#d4af37]/40 rounded-3xl w-full max-w-md p-6 relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#d4af37]" />
          <h3 className="text-lg font-bold text-white">साधना निरंतरता (Streak & Calendar)</h3>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">वर्तमान स्ट्रीक</span>
            <span className="text-xl font-bold text-[#d4af37] flex items-center justify-center gap-1 mt-1">
              <Flame className="w-4 h-4 text-amber-500" />
              {data.state.streak.currentStreakDays} दिन
            </span>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">अधिकतम स्ट्रीक</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">
              {data.state.streak.longestStreakDays} दिन
            </span>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">कुल साधना</span>
            <span className="text-xl font-bold text-white mt-1 block">
              {data.state.streak.totalMinutesPracticed} मि.
            </span>
          </div>
        </div>

        {/* 28-Day Grid */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-gray-400 block mb-2">गत 4 सप्ताह की साधना स्थिति</span>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {days.map((item, idx) => (
              <div
                key={idx}
                className={`h-9 rounded-lg flex items-center justify-center text-xs font-medium border ${
                  item.hasPracticed
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-black/30 border-white/5 text-gray-500'
                } ${item.isToday ? 'ring-1 ring-[#d4af37]' : ''}`}
              >
                {item.dayNum}
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-center">
          साधना में निरंतरता ही चित्त शुद्धि व आत्म-साक्षात्कार का श्रेष्ठतम मार्ग है।
        </p>
      </div>
    </div>
  );
};
