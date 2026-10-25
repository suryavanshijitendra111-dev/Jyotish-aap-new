/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA SESSION COMPLETE SCREEN
 * PHASE 1.15F-B: POST-SESSION COMPLETION & CANCELLED SUMMARY
 * 
 * STRICT INVARIANTS:
 * - Engine is sole authority for elapsedSeconds and targetDurationSeconds.
 * - Zero gamification, zero points, zero streak, zero rewards.
 * - Zero audio, zero storage, zero network, zero AI.
 * - Restart triggers a brand new session with a new sessionId.
 */

import React from 'react';
import { CheckCircle, AlertTriangle, RotateCcw, ArrowLeft, Clock } from 'lucide-react';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';

export interface YogaSessionCompleteProps {
  practiceId: string;
  targetDurationSeconds: number;
  actualElapsedSeconds: number;
  isCompleted: boolean; // true = COMPLETED, false = CANCELLED
  onRestart: () => void;
  onExit: () => void;
}

function formatDuration(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const YogaSessionComplete: React.FC<YogaSessionCompleteProps> = ({
  practiceId,
  targetDurationSeconds,
  actualElapsedSeconds,
  isCompleted,
  onRestart,
  onExit
}) => {
  const practice = YogaCatalogService.getPracticeById(practiceId);

  const practiceNameHindi = practice?.nameHindi ?? 'योग अभ्यास';
  const practiceNameEnglish = practice?.nameEnglish ?? 'Yoga Practice';
  const categoryLabel = practice?.category === 'ASANA' ? 'आसन' : 'श्वास जागरूकता';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030a08] via-[#051811] to-[#082218] text-white p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[#0a1510]/95 border border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Status Icon */}
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-[#d4af37]/20 border-2 border-[#d4af37]">
          {isCompleted ? (
            <CheckCircle className="w-10 h-10 text-[#fef08a]" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-amber-400" />
          )}
        </div>

        {/* Title & Practice Identity */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            {isCompleted ? 'अभ्यास पूर्ण' : 'अभ्यास समाप्त'}
          </h1>
          <p className="text-lg text-[#d4af37] font-semibold">
            {practiceNameHindi} ({practiceNameEnglish})
          </p>
          <span className="inline-block text-xs bg-white/10 text-gray-300 px-3 py-0.5 rounded-full mt-1">
            {categoryLabel}
          </span>
        </div>

        {/* Duration Metrics Box */}
        <div className="grid grid-cols-2 gap-3 bg-black/40 border border-[#d4af37]/30 rounded-2xl p-4">
          <div>
            <p className="text-xs text-gray-400">सक्रिय अभ्यास समय</p>
            <p className="text-xl font-bold text-white font-mono mt-0.5">
              {formatDuration(actualElapsedSeconds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">लक्षित अवधि</p>
            <p className="text-xl font-bold text-[#fef08a] font-mono mt-0.5">
              {formatDuration(targetDurationSeconds)}
            </p>
          </div>
        </div>

        {/* Calm Closing Message */}
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          {isCompleted
            ? 'शांत चित्त और सहज श्वास के साथ अभ्यास का समापन हुआ। कुछ क्षण इस स्थिरता का अनुभव करें।'
            : 'अभ्यास समय पूर्व समाप्त कर दिया गया। जब भी अनुकूल हो, पुनः अभ्यास करें।'}
        </p>

        {/* Primary Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={onRestart}
            className="w-full min-h-[48px] py-3 px-6 rounded-2xl bg-[#d4af37] text-[#030a08] font-bold text-base hover:bg-[#e6c250] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>फिर से करें</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            className="w-full min-h-[48px] py-3 px-6 rounded-2xl bg-black/40 border border-[#d4af37]/40 text-[#d4af37] font-semibold text-base hover:bg-[#d4af37]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>वापस Yoga सूची</span>
          </button>
        </div>
      </div>
    </div>
  );
};
