/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION STREAK & PRACTICE CALENDAR
 * PHASE 1.14H: VISUAL PRACTICE CALENDAR, DAY-LEVEL COMPLIANCE & STREAK DISCOVERY
 */

import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { MeditationStorageService } from '../../services/meditation/meditationStorageService';
import { useTranslation } from '../../i18n';

interface MeditationStreakCalendarProps {
  profileId: string;
  onClose: () => void;
}

const MONTH_NAMES_HI = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const WEEKDAY_NAMES_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

export const MeditationStreakCalendar: React.FC<MeditationStreakCalendarProps> = ({
  profileId,
  onClose
}) => {
  const { t } = useTranslation();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    dateStr: string;
    minutes: number;
    count: number;
    status: string;
  } | null>(null);

  const activeStreak = MeditationStorageService.getActiveStreak(profileId);
  const calendarData = MeditationStorageService.getMonthCalendarData(
    profileId,
    currentYear,
    currentMonth,
    today
  );

  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDayInfo(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDayInfo(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#061e14] via-[#04160e] to-[#020b07] border border-[#d4af37]/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <CalendarIcon className="w-5 h-5 text-[#fef08a]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                साधना निरंतरता पंचांग (Calendar)
              </h2>
              <p className="text-xs text-emerald-300">
                मासिक अभ्यास एवं निरंतरता रिकॉर्ड
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

        {/* Streaks Summary Strip */}
        <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 bg-black/30 border-b border-white/10 shrink-0 text-center">
          <div className="bg-[#03150d] border border-white/10 rounded-xl p-2.5">
            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>वर्तमान</span>
            </div>
            <p className="text-base sm:text-lg font-black text-white font-mono">
              {activeStreak.currentStreakDays} <span className="text-xs font-normal text-gray-400">दिन</span>
            </p>
          </div>

          <div className="bg-[#03150d] border border-white/10 rounded-xl p-2.5">
            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mb-0.5">
              <Award className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>सर्वश्रेष्ठ</span>
            </div>
            <p className="text-base sm:text-lg font-black text-[#fef08a] font-mono">
              {activeStreak.longestStreakDays} <span className="text-xs font-normal text-gray-400">दिन</span>
            </p>
          </div>

          <div className="bg-[#03150d] border border-white/10 rounded-xl p-2.5">
            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mb-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>कुल समय</span>
            </div>
            <p className="text-base sm:text-lg font-black text-white font-mono">
              {activeStreak.totalMinutesPracticed} <span className="text-xs font-normal text-gray-400">मिनट</span>
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 shrink-0">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm sm:text-base font-extrabold text-white tracking-wide">
            {MONTH_NAMES_HI[currentMonth]} {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-1">
            {WEEKDAY_NAMES_HI.map((w, idx) => (
              <div
                key={idx}
                className="text-[11px] font-bold text-gray-400 uppercase py-1"
              >
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank cells for alignment */}
            {Array.from({ length: firstDayWeekday }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-10 sm:h-12" />
            ))}

            {/* Actual day cells */}
            {calendarData.map((day) => {
              const isGoalMet = day.status === 'GOAL_MET';
              const isPartial = day.status === 'PARTIAL';
              const isMissed = day.status === 'MISSED';
              const isFuture = day.status === 'FUTURE';

              let cellStyle = 'bg-white/5 border-white/5 text-gray-500';
              if (isGoalMet) {
                cellStyle = 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-bold';
              } else if (isPartial) {
                cellStyle = 'bg-amber-950/60 border-amber-500/50 text-amber-200 font-semibold';
              } else if (isMissed) {
                cellStyle = 'bg-black/30 border-white/5 text-gray-400';
              } else if (isFuture) {
                cellStyle = 'bg-transparent border-transparent text-gray-600 opacity-40';
              }

              const isSelected = selectedDayInfo?.dateStr === day.dateStr;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  disabled={isFuture}
                  onClick={() =>
                    setSelectedDayInfo({
                      dateStr: day.dateStr,
                      minutes: day.minutesPracticed,
                      count: day.sessionCount,
                      status: day.status
                    })
                  }
                  className={`h-10 sm:h-12 rounded-xl border flex flex-col items-center justify-center relative transition-all cursor-pointer ${cellStyle} ${
                    day.isToday ? 'ring-2 ring-[#d4af37]' : ''
                  } ${isSelected ? 'scale-105 ring-2 ring-white' : ''}`}
                >
                  <span className="text-xs">{day.dayNumber}</span>
                  {day.minutesPracticed > 0 && (
                    <span className="text-[9px] font-mono leading-none mt-0.5 text-[#fef08a]">
                      {day.minutesPracticed}m
                    </span>
                  )}
                  {day.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Detail Card */}
          {selectedDayInfo && (
            <div className="bg-[#03150d] border border-white/15 rounded-2xl p-3.5 flex items-center justify-between text-xs animate-fade-in">
              <div>
                <span className="text-gray-400 font-medium block">
                  तारीख: {selectedDayInfo.dateStr}
                </span>
                <span className="font-bold text-white text-sm">
                  {selectedDayInfo.minutes} मिनट अभ्यास ({selectedDayInfo.count} सत्र)
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    selectedDayInfo.status === 'GOAL_MET'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : selectedDayInfo.status === 'PARTIAL'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-gray-900 text-gray-400 border-gray-700'
                  }`}
                >
                  {selectedDayInfo.status === 'GOAL_MET'
                    ? 'लक्ष्य पूर्ण ✓'
                    : selectedDayInfo.status === 'PARTIAL'
                    ? 'आंशिक साधना'
                    : 'साधना नहीं हुई'}
                </span>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-950 border border-emerald-500/60" />
              <span>लक्ष्य पूर्ण</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-950 border border-amber-500/50" />
              <span>आंशिक साधना</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-black/40 border border-white/10" />
              <span>अभ्यास नहीं</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md border-2 border-[#d4af37]" />
              <span>आज</span>
            </div>
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
