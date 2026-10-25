/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION HOME SCREEN
 * PHASE 1.14H: SANKALPA BANNER, PROGRESS, CALENDAR, SETTINGS & PRACTICE CATALOG
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Play,
  ChevronRight,
  Compass,
  ShieldCheck,
  Flame,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Settings
} from 'lucide-react';
import { PracticeDefinition } from '../../types/meditation/practiceCatalogTypes';
import { PracticeCatalogService } from '../../services/meditation/practiceCatalogService';
import { MeditationStorageService } from '../../services/meditation/meditationStorageService';
import { useTranslation } from '../../i18n';

interface MeditationHomeProps {
  profileId?: string;
  onSelectPractice: (practice: PracticeDefinition) => void;
  onQuickStart: (practice: PracticeDefinition) => void;
  onOpenHistory: () => void;
  onOpenProgress: () => void;
  onOpenCalendar: () => void;
  onOpenSettings: () => void;
}

export const MeditationHome: React.FC<MeditationHomeProps> = ({
  profileId = 'default',
  onSelectPractice,
  onQuickStart,
  onOpenHistory,
  onOpenProgress,
  onOpenCalendar,
  onOpenSettings
}) => {
  const { t } = useTranslation();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BEGINNER' | 'BREATH' | 'CONTEMPLATION'>('ALL');

  const storageData = MeditationStorageService.loadState(profileId);
  const activeStreak = MeditationStorageService.getActiveStreak(profileId);
  const dailyProg = MeditationStorageService.getDailyProgress(profileId);
  const activeSankalpa = storageData.state.activeSankalpa;

  const practices = PracticeCatalogService.getAllPractices();
  const defaultPractice = PracticeCatalogService.getDefaultPractice();

  const filteredPractices = practices.filter((p) => {
    if (activeFilter === 'BEGINNER') {
      return p.difficulty === 'BEGINNER';
    }
    if (activeFilter === 'BREATH') {
      return p.category === 'BREATH_AWARENESS' || p.category === 'SILENT_MEDITATION' || p.category === 'BODY_AWARENESS';
    }
    if (activeFilter === 'CONTEMPLATION') {
      return p.category === 'GRATITUDE_REFLECTION' || p.category === 'SELF_OBSERVATION' || p.category === 'PRAYERFUL_CONTEMPLATION';
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* Hero Spiritual Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#072418] via-[#093322] to-[#041910] border border-[#d4af37]/45 p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping" />
              <span className="text-xs uppercase tracking-widest text-[#fef08a] font-bold">
                वैदिक आत्म-साधना प्रभाग
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide mb-2">
              {t('meditation.title')}
            </h1>

            <p className="text-sm sm:text-base text-emerald-200/90 max-w-xl leading-relaxed">
              {t('meditation.subtitle')}
            </p>
          </div>

          {/* Quick Hub Navigation Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenHistory}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-[#d4af37]/50 text-xs font-bold text-gray-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
              <span>डायरी</span>
            </button>

            <button
              type="button"
              onClick={onOpenProgress}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-[#d4af37]/50 text-xs font-bold text-gray-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>प्रगति</span>
            </button>

            <button
              type="button"
              onClick={onOpenCalendar}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-[#d4af37]/50 text-xs font-bold text-gray-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <Calendar className="w-4 h-4 text-[#fef08a]" />
              <span>पंचांग</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-[#d4af37]/50 text-xs font-bold text-gray-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>सेटिंग्स</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Sankalpa Card if Present */}
      {activeSankalpa && (
        <div className="bg-gradient-to-r from-[#062015] via-[#082a1c] to-[#04160e] border border-[#d4af37]/50 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 shadow-[0_4px_20px_rgba(212,175,55,0.15)] animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#fef08a] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4af37] block">
                सक्रिय साधना संकल्प (Active Sankalpa)
              </span>
              <p className="text-sm sm:text-base text-emerald-100 font-serif italic mt-0.5 leading-relaxed">
                &ldquo;{activeSankalpa}&rdquo;
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="text-xs text-[#d4af37] hover:text-[#fef08a] font-semibold shrink-0 pt-1 cursor-pointer"
          >
            संपादित करें
          </button>
        </div>
      )}

      {/* Streak & Daily Goal Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Streak Card */}
        <div
          onClick={onOpenCalendar}
          className="bg-[#051a11] hover:bg-[#072418] transition-all cursor-pointer border border-white/10 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">साधना निरंतरता</p>
              <p className="text-xl font-black text-white font-mono">
                {activeStreak.currentStreakDays} <span className="text-xs font-normal text-gray-400">दिन</span>
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-gray-400">
            <span>सर्वश्रेष्ठ: </span>
            <span className="font-bold text-[#fef08a] font-mono">{activeStreak.longestStreakDays} दिन</span>
          </div>
        </div>

        {/* Daily Goal Card */}
        <div
          onClick={onOpenSettings}
          className="bg-[#051a11] hover:bg-[#072418] transition-all cursor-pointer border border-white/10 rounded-2xl p-4 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-400 font-medium">आज का लक्ष्य</span>
            </div>
            <span className="text-xs font-bold text-white font-mono">
              {dailyProg.minutesCompleted} / {dailyProg.targetMinutes} मिनट
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                dailyProg.isGoalMet
                  ? 'bg-gradient-to-r from-emerald-500 to-[#d4af37]'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${dailyProg.percentage}%` }}
            />
          </div>
        </div>

        {/* Total Practice Time */}
        <div
          onClick={onOpenProgress}
          className="bg-[#051a11] hover:bg-[#072418] transition-all cursor-pointer border border-white/10 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Award className="w-6 h-6 text-[#fef08a]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">कुल साधना समय</p>
              <p className="text-xl font-black text-white font-mono">
                {activeStreak.totalMinutesPracticed} <span className="text-xs font-normal text-gray-400">मिनट</span>
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-gray-400">
            <span className="font-mono">{activeStreak.totalSessionsCompleted} सत्र</span>
          </div>
        </div>
      </div>

      {/* Quick Start Spotlight Card */}
      <div className="bg-gradient-to-r from-[#0b2b1e] via-[#0e3626] to-[#082017] border border-[#d4af37]/60 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(212,175,55,0.25)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#99771a] p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.4)] shrink-0 mt-0.5">
              <div className="w-full h-full bg-[#03110a] rounded-2xl flex items-center justify-center text-[#fef08a]">
                <Sparkles className="w-7 h-7 text-[#fef08a]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  {t('meditation.quickStart')}
                </h3>
                <span className="text-[11px] bg-[#d4af37]/25 text-[#fef08a] border border-[#d4af37]/50 px-2 py-0.5 rounded-full font-bold">
                  10 मिनट
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 mt-1 leading-relaxed">
                {t('meditation.quickStartDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => onQuickStart(defaultPractice)}
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#03110a] font-extrabold text-xs sm:text-sm hover:brightness-110 shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>प्रारंभ करें</span>
            </button>
          </div>
        </div>
      </div>

      {/* Practice Catalog Filter Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              {t('meditation.selectPractice')}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              सभी 6 साधनाएं शास्त्रीय मर्यादा, सुरक्षा एवं सौम्यता के अनुरूप
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeFilter === 'ALL'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'bg-black/30 border border-white/10 text-gray-300 hover:border-white/30'
              }`}
            >
              {t('meditation.allPractices')}
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('BEGINNER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeFilter === 'BEGINNER'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'bg-black/30 border border-white/10 text-gray-300 hover:border-white/30'
              }`}
            >
              {t('meditation.beginnerPractices')}
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('BREATH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeFilter === 'BREATH'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'bg-black/30 border border-white/10 text-gray-300 hover:border-white/30'
              }`}
            >
              {t('meditation.mindAndBreath')}
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('CONTEMPLATION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                activeFilter === 'CONTEMPLATION'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'bg-black/30 border border-white/10 text-gray-300 hover:border-white/30'
              }`}
            >
              {t('meditation.contemplative')}
            </button>
          </div>
        </div>

        {/* Practice Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPractices.map((practice) => {
            const isBeginner = practice.difficulty === 'BEGINNER';
            const defaultMins = Math.round(practice.defaultDurationSeconds / 60);
            const englishTitle = practice.practiceId.replace(/_/g, ' ');

            return (
              <div
                key={practice.practiceId}
                onClick={() => onSelectPractice(practice)}
                className="group bg-gradient-to-br from-[#061d13] via-[#04160e] to-[#020d07] border border-white/10 hover:border-[#d4af37]/60 rounded-3xl p-5 shadow-lg hover:shadow-[0_10px_35px_rgba(212,175,55,0.18)] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-[#fef08a] transition-colors">
                          {t(practice.titleKey)}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                            isBeginner
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {isBeginner ? 'सरल' : 'मध्यम'}
                        </span>
                      </div>
                      <p className="text-xs text-[#d4af37] font-medium mt-0.5 capitalize">
                        {englishTitle}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#d4af37]/20 border border-white/10 group-hover:border-[#d4af37]/40 flex items-center justify-center text-gray-400 group-hover:text-[#fef08a] transition-all shrink-0">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    {t(practice.descriptionKey)}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>मानक: <strong className="text-white font-mono">{defaultMins} {t('meditation.minutes')}</strong></span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>पूर्णतः सुरक्षित</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sankalpa / Shloka Bottom Peaceful Card */}
      <div className="rounded-3xl bg-black/40 border border-[#d4af37]/30 p-5 text-center relative overflow-hidden">
        <Compass className="w-6 h-6 text-[#d4af37]/60 mx-auto mb-2" />
        <p className="text-sm font-serif text-[#fef08a] italic tracking-wide">
          &ldquo;योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥&rdquo;
        </p>
        <p className="text-xs text-emerald-300/80 mt-1">
          समत्व ही योग है — श्रीमद्भगवद्गीता
        </p>
      </div>
    </div>
  );
};
