/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION SESSION COMPLETION SCREEN
 * PHASE 1.14G: QUALITATIVE REFLECTIONS, STREAK SHOWCASE & LOCAL DIARY
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Home,
  RotateCcw,
  Smile,
  Zap,
  Compass,
  MinusCircle,
  HelpCircle,
  Bed,
  Check,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react';
import { PracticeDefinition } from '../../types/meditation/practiceCatalogTypes';
import { SessionSnapshot } from '../../services/meditation/sessionEngine';
import { QualitativeState } from '../../types/meditation/meditationTypes';
import { MeditationStorageService } from '../../services/meditation/meditationStorageService';
import { useTranslation } from '../../i18n';

interface SessionCompleteScreenProps {
  practice: PracticeDefinition;
  snapshot: SessionSnapshot;
  profileId?: string;
  onReturnHome: () => void;
  onGoToDashboard: () => void;
  onRestartPractice: () => void;
  showToast?: (msg: string) => void;
}

export const SessionCompleteScreen: React.FC<SessionCompleteScreenProps> = ({
  practice,
  snapshot,
  profileId = 'default',
  onReturnHome,
  onGoToDashboard,
  onRestartPractice,
  showToast
}) => {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState<QualitativeState>('CALM');
  const [personalNote, setPersonalNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const durationMinutes = Math.max(1, Math.round(snapshot.elapsedSeconds / 60));

  const activeStreak = MeditationStorageService.getActiveStreak(profileId);
  const dailyProg = MeditationStorageService.getDailyProgress(profileId);

  const qualitativeOptions: Array<{
    id: QualitativeState;
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      id: 'CALM',
      label: 'शांत एवं स्थिर',
      icon: <Smile className="w-4 h-4" />,
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'
    },
    {
      id: 'REFRESHED',
      label: 'ऊर्जावान व ताज़ा',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/40'
    },
    {
      id: 'CENTERED',
      label: 'अंतर्मुखी व केंद्रित',
      icon: <Compass className="w-4 h-4" />,
      color: 'text-[#d4af37] border-[#d4af37]/40 bg-[#d4af37]/15'
    },
    {
      id: 'NEUTRAL',
      label: 'सामान्य व सहज',
      icon: <MinusCircle className="w-4 h-4" />,
      color: 'text-gray-300 border-gray-500/40 bg-gray-900/40'
    },
    {
      id: 'RESTLESS',
      label: 'विचारवान',
      icon: <HelpCircle className="w-4 h-4" />,
      color: 'text-purple-300 border-purple-500/40 bg-purple-950/40'
    },
    {
      id: 'TIRED',
      label: 'विश्राम की आवश्यकता',
      icon: <Bed className="w-4 h-4" />,
      color: 'text-blue-300 border-blue-500/40 bg-blue-950/40'
    }
  ];

  const handleSaveReflection = () => {
    MeditationStorageService.saveReflection(profileId, {
      sessionId: snapshot.sessionId,
      postSessionState: selectedState,
      personalNotes: personalNote.trim() || undefined,
      recordedAt: new Date().toISOString()
    });
    setIsSaved(true);
    if (showToast) {
      showToast('अनुभूति एवं डायरी स्थानीय रूप से सहेजी गई।');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#03140c] via-[#051c12] to-[#010603] text-white flex flex-col justify-center items-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-lg bg-gradient-to-br from-[#072418] via-[#04170f] to-[#020b07] border border-[#d4af37]/50 rounded-3xl p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#d4af37]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Diya / Lotus Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#d4af37] via-[#fef08a] to-[#b89528] p-0.5 shadow-[0_0_30px_rgba(212,175,55,0.5)] mb-4">
          <div className="w-full h-full bg-[#030e08] rounded-3xl flex items-center justify-center text-[#d4af37]">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#fef08a] animate-pulse" />
          </div>
        </div>

        {/* Header & Subtitle */}
        <div className="text-center mb-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide mb-1">
            {t('meditation.sessionCompleted')}
          </h2>
          <p className="text-sm sm:text-base text-emerald-300 font-medium">
            {t('meditation.sessionCompletedSub')}
          </p>
        </div>

        {/* Completed Stats Card & Streaks */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                साधना पद्धति
              </p>
              <p className="text-base sm:text-lg font-bold text-white">
                {t(practice.titleKey)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                साधना अवधि
              </p>
              <p className="text-base sm:text-lg font-bold text-[#d4af37] font-mono">
                {durationMinutes} {t('meditation.minutes')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-[#020d08] p-2 rounded-xl border border-white/5">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">साधना निरंतरता</span>
                <span className="font-bold text-white font-mono">{activeStreak.currentStreakDays} दिन</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#020d08] p-2 rounded-xl border border-white/5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px]">आज का लक्ष्य</span>
                <span className="font-bold text-white font-mono">{dailyProg.minutesCompleted} / {dailyProg.targetMinutes} मिनट</span>
              </div>
            </div>
          </div>
        </div>

        {/* Qualitative Evaluation Check-in */}
        <div className="mb-4">
          <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider block mb-2">
            {t('meditation.reflectionPrompt')}
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {qualitativeOptions.map((opt) => {
              const isSelected = selectedState === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedState(opt.id)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? `${opt.color} border-current shadow-md scale-[1.02]`
                      : 'bg-black/30 border-white/10 text-gray-300 hover:border-white/30'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Personal Reflection Note */}
          <div className="space-y-2">
            <textarea
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="साधना के उपरांत व्यक्तिगत अनुभव या मनःस्थिति (वैकल्पिक)..."
              rows={2}
              maxLength={250}
              className="w-full bg-black/40 border border-white/15 focus:border-[#d4af37]/60 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all resize-none"
            />

            <button
              type="button"
              onClick={handleSaveReflection}
              disabled={isSaved}
              className={`w-full min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                isSaved
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border-[#d4af37]/50 text-[#fef08a]'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>अनुभूति सहेजी गई</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>डायरी में सहेजें (Save Reflection)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Return & Navigation Controls */}
        <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onRestartPractice}
            className="flex-1 min-h-[44px] py-2 px-2.5 rounded-xl bg-black/30 hover:bg-white/10 border border-white/15 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>पुनः ध्यान</span>
          </button>

          <button
            type="button"
            onClick={onReturnHome}
            className="flex-1 min-h-[44px] py-2 px-2.5 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/50 text-xs font-bold text-[#d4af37] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ध्यान कक्ष</span>
          </button>

          <button
            type="button"
            onClick={onGoToDashboard}
            className="flex-1 min-h-[44px] py-2 px-2.5 rounded-xl bg-black/30 hover:bg-white/10 border border-white/15 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>डैशबोर्ड</span>
          </button>
        </div>
      </div>
    </div>
  );
};
