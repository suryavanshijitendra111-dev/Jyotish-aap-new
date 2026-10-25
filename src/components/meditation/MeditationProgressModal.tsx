/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — LONG-TERM MEDITATION PROGRESS DASHBOARD
 * PHASE 1.14H: MULTI-HORIZON ANALYTICS (7D, 30D, 90D, ALL-TIME) & GOAL ACCURACY
 */

import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Award,
  Clock,
  Flame,
  CheckCircle,
  Calendar,
  Compass
} from 'lucide-react';
import { MeditationStorageService } from '../../services/meditation/meditationStorageService';
import { useTranslation } from '../../i18n';

interface MeditationProgressModalProps {
  profileId: string;
  onClose: () => void;
}

export const MeditationProgressModal: React.FC<MeditationProgressModalProps> = ({
  profileId,
  onClose
}) => {
  const { t } = useTranslation();
  const [range, setRange] = useState<'7D' | '30D' | '90D' | 'ALL'>('30D');

  const stats = MeditationStorageService.getProgressStats(profileId, range);
  const targetMinutes = MeditationStorageService.loadState(profileId).state.goal.targetMinutesPerDay || 10;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#061e14] via-[#04160e] to-[#020b07] border border-[#d4af37]/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <TrendingUp className="w-5 h-5 text-[#fef08a]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                दीर्घकालिक साधना प्रगति
              </h2>
              <p className="text-xs text-emerald-300">
                साधना विश्लेषण एवं लक्ष्य उपलब्धि (Local Analytics)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer min-h-[44px]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center justify-center gap-2 p-3.5 bg-black/30 border-b border-white/10 shrink-0">
          {(['7D', '30D', '90D', 'ALL'] as const).map((r) => {
            const labelMap = {
              '7D': '7 दिन',
              '30D': '30 दिन',
              '90D': '90 दिन',
              'ALL': 'संपूर्ण काल'
            };
            const isSelected = range === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#d4af37] border-[#fef08a] text-black shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                }`}
              >
                {labelMap[r]}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Main Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            {/* Total Minutes */}
            <div className="bg-[#03150d] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>कुल साधना समय</span>
              </div>
              <div>
                <p className="text-2xl font-black text-white font-mono">
                  {stats.totalMinutes} <span className="text-xs font-normal text-gray-400">{t('meditation.minutes')}</span>
                </p>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  चयनित अवधि में
                </p>
              </div>
            </div>

            {/* Total Sessions */}
            <div className="bg-[#03150d] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>सत्र पूर्ण</span>
              </div>
              <div>
                <p className="text-2xl font-black text-white font-mono">
                  {stats.totalSessions} <span className="text-xs font-normal text-gray-400">सत्र</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  औसत: {stats.avgDurationMinutes} {t('meditation.minutes')}/सत्र
                </p>
              </div>
            </div>

            {/* Goal Completion Rate */}
            <div className="bg-[#03150d] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                <Award className="w-4 h-4 text-[#d4af37]" />
                <span>लक्ष्य सफलता दर</span>
              </div>
              <div>
                <p className="text-2xl font-black text-[#fef08a] font-mono">
                  {stats.goalCompletionRate}%
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {stats.daysGoalMetCount} दिन लक्ष्य पूरा हुआ
                </p>
              </div>
            </div>

            {/* Current Streak */}
            <div className="bg-[#03150d] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>वर्तमान निरंतरता</span>
              </div>
              <div>
                <p className="text-2xl font-black text-white font-mono">
                  {stats.currentStreak} <span className="text-xs font-normal text-gray-400">दिन</span>
                </p>
                <p className="text-[11px] text-amber-300 mt-0.5">
                  सक्रिय क्रम
                </p>
              </div>
            </div>

            {/* Longest Streak */}
            <div className="bg-[#03150d] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                <Award className="w-4 h-4 text-[#fef08a]" />
                <span>सर्वश्रेष्ठ निरंतरता</span>
              </div>
              <div>
                <p className="text-2xl font-black text-white font-mono">
                  {stats.longestStreak} <span className="text-xs font-normal text-gray-400">दिन</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  सर्वकालिक रिकॉर्ड
                </p>
              </div>
            </div>

            {/* Days Practiced */}
            <div className="bg-[#03150d] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>साधना दिवस</span>
              </div>
              <div>
                <p className="text-2xl font-black text-white font-mono">
                  {stats.daysPracticedCount} <span className="text-xs font-normal text-gray-400">दिन</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  कुल {stats.totalDaysInRange} दिनों में से
                </p>
              </div>
            </div>
          </div>

          {/* Goal Completion Visual Bar */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-white">दैनिक लक्ष्य पूर्ति दर ({targetMinutes} मिनट/दिन)</span>
              <span className="font-bold text-[#d4af37] font-mono">{stats.goalCompletionRate}%</span>
            </div>

            <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-[#d4af37] to-[#fef08a] transition-all duration-700 rounded-full"
                style={{ width: `${stats.goalCompletionRate}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
              <span>0%</span>
              <span>साधना लक्ष्य: {stats.daysGoalMetCount} / {stats.totalDaysInRange} दिवस पूर्ण</span>
              <span>100%</span>
            </div>
          </div>

          {/* Philosophical Encouragement Card */}
          <div className="bg-[#041910] border border-[#d4af37]/30 rounded-2xl p-4 text-center">
            <Compass className="w-5 h-5 text-[#d4af37] mx-auto mb-1.5" />
            <p className="text-xs sm:text-sm text-gray-200 italic font-serif">
              &ldquo;अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते।&rdquo;
            </p>
            <p className="text-[11px] text-emerald-300/80 mt-1">
              निरंतर अभ्यास एवं अनासक्ति से ही मन शांत और वशीभूत होता है।
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/50 text-xs font-bold text-[#fef08a] transition-all cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
