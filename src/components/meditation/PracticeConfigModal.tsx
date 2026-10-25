/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PRACTICE CONFIGURATION SCREEN / MODAL
 * PHASE 1.14F: PRACTICE SELECTION, DURATION & AUDIO MODE SELECTION
 */

import React, { useState } from 'react';
import {
  X,
  Play,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Info,
  Volume2,
  VolumeX,
  Mic,
  Sparkles
} from 'lucide-react';
import { PracticeDefinition } from '../../types/meditation/practiceCatalogTypes';
import { SessionDurationSeconds } from '../../types/meditation/meditationTypes';
import { MeditationAudioMode } from '../../services/meditation/meditationAudioController';
import { MeditationStorageService } from '../../services/meditation/meditationStorageService';
import { useTranslation } from '../../i18n';

interface PracticeConfigModalProps {
  practice: PracticeDefinition;
  profileId?: string;
  onClose: () => void;
  onStartSession: (config: {
    durationSeconds: SessionDurationSeconds;
    preparationDurationSeconds: number;
    audioMode: MeditationAudioMode;
  }) => void;
}

export const PracticeConfigModal: React.FC<PracticeConfigModalProps> = ({
  practice,
  profileId = 'default',
  onClose,
  onStartSession
}) => {
  const { t } = useTranslation();

  const storageData = MeditationStorageService.loadState(profileId);
  const activeSankalpa = storageData.state.activeSankalpa;

  const [selectedDuration, setSelectedDuration] = useState<SessionDurationSeconds>(
    practice.defaultDurationSeconds
  );

  const [audioMode, setAudioMode] = useState<MeditationAudioMode>('VOICE_AND_AMBIENT');

  const handleStart = () => {
    onStartSession({
      durationSeconds: selectedDuration,
      preparationDurationSeconds: 3,
      audioMode
    });
  };

  const audioModesList: Array<{
    id: MeditationAudioMode;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'VOICE_AND_AMBIENT',
      label: t('meditation.audioModeVoiceAndAmbient') || 'आवाज + ध्वनि',
      sublabel: 'मार्गदर्शन वाणी व 136.1 Hz ॐ नाद',
      icon: <Mic className="w-4 h-4 text-[#d4af37]" />
    },
    {
      id: 'AMBIENT_ONLY',
      label: t('meditation.audioModeAmbientOnly') || 'केवल ध्वनि',
      sublabel: 'केवल 136.1 Hz ॐ नाद एवं घंटी',
      icon: <Volume2 className="w-4 h-4 text-[#fef08a]" />
    },
    {
      id: 'SILENT',
      label: t('meditation.audioModeSilent') || 'मौन',
      sublabel: 'पूर्णतः शांत एवं निस्तब्ध अभ्यास',
      icon: <VolumeX className="w-4 h-4 text-gray-400" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gradient-to-br from-[#071d14] via-[#05160e] to-[#020a06] border border-[#d4af37]/40 rounded-3xl p-5 sm:p-7 shadow-[0_12px_45px_rgba(0,0,0,0.85)] my-auto">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/20">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-[#d4af37] hover:text-[#fef08a] transition-all cursor-pointer font-medium min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('common.goBack')}</span>
          </button>
          
          <span className="text-xs uppercase tracking-widest text-[#d4af37]/70 font-mono">
            {practice.category}
          </span>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer min-h-[44px] min-w-[44px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Practice Title & Spiritual Description */}
        <div className="my-4">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              {t(practice.titleKey)}
            </h2>
            <span className="text-[11px] bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 px-2.5 py-0.5 rounded-full font-bold">
              {practice.difficulty}
            </span>
          </div>

          <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed break-words">
            {t(practice.descriptionKey)}
          </p>
        </div>

        {/* Active Sankalpa Reminder if Set */}
        {activeSankalpa && (
          <div className="bg-[#03150d] border border-[#d4af37]/35 rounded-2xl p-3.5 mb-4 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#fef08a] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-bold block">
                आपका साधना संकल्प (Active Sankalpa)
              </span>
              <p className="text-xs text-emerald-100 font-serif italic mt-0.5">
                &ldquo;{activeSankalpa}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="bg-black/35 border border-white/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-2">
            <Info className="w-4 h-4" />
            <span>साधना विधि (Instructions)</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
            {t(practice.instructionsKey)}
          </p>
        </div>

        {/* Duration Selection */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{t('meditation.durationLabel')}</span>
            </label>
            <span className="text-xs text-gray-300 font-mono">
              {Math.round(selectedDuration / 60)} {t('meditation.minutes')}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {practice.allowedDurations.map((duration) => {
              const minutes = Math.round(duration / 60);
              const isSelected = selectedDuration === duration;

              return (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setSelectedDuration(duration)}
                  className={`min-h-[44px] py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex flex-col items-center justify-center border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-[1.02]'
                      : 'bg-black/40 text-gray-300 border-white/10 hover:border-[#d4af37]/50 hover:text-white'
                  }`}
                >
                  <span>{minutes}</span>
                  <span className="text-[10px] font-normal opacity-80">{t('meditation.minutes')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Mode Selection (In-Memory Only) */}
        <div className="mb-5">
          <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider block mb-2">
            {t('meditation.audioModeLabel') || 'ध्वनि व वाणी मोड'}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {audioModesList.map((mode) => {
              const isSelected = audioMode === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setAudioMode(mode.id)}
                  className={`min-h-[48px] p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center sm:flex-col sm:items-start justify-between sm:justify-center gap-2 ${
                    isSelected
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-sm'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {mode.icon}
                    <span className="text-xs sm:text-sm font-bold">{mode.label}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block sm:mt-1">
                    {mode.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safety Invariant Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 mb-5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-emerald-200/90 leading-relaxed">
            <strong className="text-emerald-300 font-bold">सुरक्षा नियम: </strong>
            {t(practice.safetyNoticeKey)}
          </p>
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#b89528] text-black text-base sm:text-lg font-bold hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(212,175,55,0.45)] cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-black" />
          <span>{t('meditation.startSession')}</span>
        </button>
      </div>
    </div>
  );
};
