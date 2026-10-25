/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — ACTIVE MEDITATION SESSION SCREEN
 * PHASE 1.14F: ZERO-DRIFT SESSION ENGINE INTEGRATION WITH PROCEDURAL AUDIO CONTROLLER
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Pause,
  Play,
  Square,
  ShieldAlert,
  Volume2,
  VolumeX
} from 'lucide-react';
import { PracticeDefinition } from '../../types/meditation/practiceCatalogTypes';
import {
  SessionDurationSeconds,
  SessionPhase
} from '../../types/meditation/meditationTypes';
import { SessionEngine, SessionSnapshot } from '../../services/meditation/sessionEngine';
import {
  MeditationAudioController,
  MeditationAudioMode
} from '../../services/meditation/meditationAudioController';
import { useTranslation } from '../../i18n';

interface ActiveSessionScreenProps {
  practice: PracticeDefinition;
  targetDurationSeconds: SessionDurationSeconds;
  preparationDurationSeconds: number;
  audioMode: MeditationAudioMode;
  onComplete: (snapshot: SessionSnapshot) => void;
  onCancel: (snapshot: SessionSnapshot) => void;
}

export const ActiveSessionScreen: React.FC<ActiveSessionScreenProps> = ({
  practice,
  targetDurationSeconds,
  preparationDurationSeconds,
  audioMode,
  onComplete,
  onCancel
}) => {
  const { t, currentLanguageInfo } = useTranslation();

  const engineRef = useRef<SessionEngine | null>(null);
  const audioControllerRef = useRef<MeditationAudioController | null>(null);

  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(audioMode === 'SILENT');
  const [autoplayMessage, setAutoplayMessage] = useState<string | null>(null);

  const langCode = (currentLanguageInfo.code === 'en' ? 'en' : 'hi') as 'hi' | 'en';

  // Initialize Audio Controller & Session Engine
  useEffect(() => {
    // 1. Initialize Audio Controller
    const audioCtrl = new MeditationAudioController({
      initialMode: audioMode,
      language: langCode,
      onAutoplayBlocked: (msg) => {
        setAutoplayMessage(msg);
        setTimeout(() => setAutoplayMessage(null), 4000);
      }
    });
    audioControllerRef.current = audioCtrl;

    // 2. Initialize Session Engine
    const creationResult = SessionEngine.createSession({
      practice,
      targetDurationSeconds,
      autoTick: true,
      tickIntervalMs: 200,
      preparationDurationSeconds
    });

    if (!creationResult.success || !creationResult.data) {
      console.error('Failed to create session engine:', creationResult.error);
      return;
    }

    const engine = creationResult.data;
    engineRef.current = engine;

    // Initial snapshot
    setSnapshot(engine.getSessionSnapshot());

    // 3. Subscribe to engine updates
    const unsubscribe = engine.subscribe((snap) => {
      setSnapshot(snap);

      // Resolve voice cue based on current state & phase
      let cueText = '';
      if (snap.status === 'PREPARING') {
        cueText = t('meditation.generalCues.preparing') || 'धीरे से आँखें बंद करें और अपनी श्वास पर ध्यान दें।';
      } else if (snap.status === 'ACTIVE') {
        const phaseConfig = practice.phases.find((p) => p.phase === snap.currentPhase);
        if (phaseConfig && phaseConfig.voiceCueKey) {
          cueText = t(phaseConfig.voiceCueKey);
        }
        if (!cueText) {
          cueText = t('meditation.generalCues.active') || 'अपनी श्वास को सहज रहने दें।';
        }
      } else if (snap.status === 'SILENCE') {
        cueText = t('meditation.generalCues.silence') || 'अब कुछ क्षण केवल शांति का अनुभव करें।';
      } else if (snap.status === 'COMPLETED') {
        cueText = t('meditation.generalCues.completion') || 'अभ्यास पूर्ण हुआ। कुछ क्षण शांत रहें।';
      }

      // Delegate state handling safely to Audio Controller
      if (audioControllerRef.current) {
        audioControllerRef.current.handleSessionStateChange(
          snap.status,
          snap.currentPhase,
          practice,
          cueText
        );
      }

      // Check if session completed
      if (snap.status === 'COMPLETED') {
        onComplete(snap);
      }
    });

    // Start session
    engine.start();

    return () => {
      unsubscribe();
      if (audioControllerRef.current) {
        audioControllerRef.current.cleanup();
      }
      if (engineRef.current) {
        const currentSnap = engineRef.current.getSessionSnapshot();
        if (
          currentSnap.status === 'ACTIVE' ||
          currentSnap.status === 'PAUSED' ||
          currentSnap.status === 'PREPARING'
        ) {
          engineRef.current.interrupt();
        }
        engineRef.current.destroy();
      }
    };
  }, [practice, targetDurationSeconds, preparationDurationSeconds, audioMode, langCode, onComplete]);

  // Handle Pause / Resume
  const handleTogglePause = () => {
    if (!engineRef.current || !snapshot) return;

    if (snapshot.status === 'PAUSED') {
      engineRef.current.resume();
      if (audioControllerRef.current) {
        audioControllerRef.current.resume();
      }
    } else if (snapshot.status === 'ACTIVE' || snapshot.status === 'SILENCE') {
      engineRef.current.pause();
      if (audioControllerRef.current) {
        audioControllerRef.current.pause();
      }
    }
  };

  // Handle Mute Toggle
  const handleToggleMute = () => {
    if (!audioControllerRef.current) return;
    const newMuted = audioControllerRef.current.toggleMute();
    setIsMuted(newMuted);
  };

  // Handle Cancel
  const handleConfirmCancel = () => {
    if (audioControllerRef.current) {
      audioControllerRef.current.stopAll();
      audioControllerRef.current.cleanup();
    }
    if (!engineRef.current) return;
    engineRef.current.cancel();
    const finalSnap = engineRef.current.getSessionSnapshot();
    onCancel(finalSnap);
  };

  if (!snapshot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020a06] text-[#d4af37]">
        <p className="animate-pulse font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  // Format remaining seconds into MM:SS
  const formatTime = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isPreparing = snapshot.status === 'PREPARING';
  const isPaused = snapshot.status === 'PAUSED';

  // Resolve localized phase label
  const getPhaseLabel = (phase: SessionPhase): string => {
    switch (phase) {
      case 'SETTLE':
        return t('meditation.phaseSettle') || 'आसन एवं स्थिरता';
      case 'PRACTICE':
        return t('meditation.phasePractice') || 'साधना एवं सजगता';
      case 'SILENCE':
        return t('meditation.phaseSilence') || 'गहन मौन विश्रांति';
      case 'COMPLETE':
        return t('meditation.phaseComplete') || 'सत्र पूर्ण';
      default:
        return t('meditation.phasePractice') || 'साधना एवं सजगता';
    }
  };

  const audioModeDisplayLabel =
    audioMode === 'VOICE_AND_AMBIENT'
      ? t('meditation.audioModeVoiceAndAmbient') || 'आवाज + ध्वनि'
      : audioMode === 'AMBIENT_ONLY'
      ? t('meditation.audioModeAmbientOnly') || 'केवल ध्वनि'
      : t('meditation.audioModeSilent') || 'मौन';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a06] via-[#04160d] to-[#010603] text-white flex flex-col justify-between p-4 sm:p-6 relative select-none">
      
      {/* Top Header Bar */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#d4af37] animate-pulse" />
          <span className="text-xs uppercase font-bold tracking-widest text-[#d4af37]">
            {t(practice.titleKey)}
          </span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
            {audioModeDisplayLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Mute/Unmute Toggle */}
          {audioMode !== 'SILENT' && (
            <button
              onClick={handleToggleMute}
              className="min-h-[44px] min-w-[44px] rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#d4af37]" />
              )}
            </button>
          )}

          {/* End Session button */}
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="min-h-[44px] px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-red-950/60 border border-white/15 hover:border-red-500/50 text-xs text-gray-300 hover:text-red-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5" />
            <span>{t('meditation.endSession')}</span>
          </button>
        </div>
      </div>

      {/* Non-blocking Autoplay Blocked Notice */}
      {autoplayMessage && (
        <div className="w-full max-w-sm mx-auto bg-amber-950/90 border border-amber-500/60 text-amber-200 px-4 py-2.5 rounded-2xl text-xs text-center shadow-lg animate-fade-in z-20">
          {autoplayMessage}
        </div>
      )}

      {/* Centerpiece: Circular Breathing Ring & Authoritative Timer */}
      <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center justify-center text-center py-6">
        
        {/* Breathing Circle Ring */}
        <div className="relative w-64 h-64 sm:w-76 sm:h-76 flex items-center justify-center mb-6">
          
          {/* Background Ambient Glow */}
          <div
            className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
              isPaused
                ? 'bg-amber-500/10'
                : snapshot.currentPhase === 'SILENCE'
                ? 'bg-emerald-500/20'
                : 'bg-[#d4af37]/20 animate-pulse'
            }`}
          />

          {/* Outer Ring */}
          <div
            className={`absolute inset-2 rounded-full border border-[#d4af37]/30 transition-transform duration-1000 ${
              !isPaused && !isPreparing ? 'scale-105 opacity-80' : 'scale-95 opacity-40'
            }`}
          />

          {/* Progress SVG Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-black/50 fill-none"
              strokeWidth="3.5"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-[#d4af37] fill-none transition-all duration-300 ease-linear"
              strokeWidth="4"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 * (1 - (isPreparing ? 0 : snapshot.progressRatio))}
              strokeLinecap="round"
            />
          </svg>

          {/* Inner Content Display */}
          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
            {isPreparing ? (
              <div className="animate-fade-in">
                <span className="text-5xl sm:text-6xl font-extrabold text-[#fef08a] font-mono block mb-2">
                  {snapshot.preparingRemainingSeconds}
                </span>
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">
                  {t('meditation.preparing')}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight block">
                  {formatTime(snapshot.remainingSeconds)}
                </span>
                
                <span className="text-xs font-mono text-gray-400 mt-1 block">
                  व्यतीत: {formatTime(snapshot.elapsedSeconds)}
                </span>

                <div className="mt-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      snapshot.currentPhase === 'SILENCE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : isPaused
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/50'
                    }`}
                  >
                    {isPaused ? 'सत्र स्थगित (Paused)' : getPhaseLabel(snapshot.currentPhase)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase Guidance Hint */}
        <div className="max-w-xs mx-auto text-center px-4">
          {isPreparing ? (
            <p className="text-xs sm:text-sm text-emerald-300 italic animate-pulse">
              {t('meditation.preparingHint')}
            </p>
          ) : isPaused ? (
            <p className="text-xs sm:text-sm text-amber-300">
              सत्र विराम पर है। जब सहज हों, 'पुनः आरंभ' दबाएं।
            </p>
          ) : snapshot.currentPhase === 'SILENCE' ? (
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-light">
              मौन में विश्राम करें... अपनी स्वाभाविक आंतरिक शांति में ठहरें।
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              सहज श्वास को देखें • विचारों के प्रति तटस्थ साक्षी रहें
            </p>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full max-w-sm mx-auto flex items-center justify-center gap-4 z-10 pb-4">
        {!isPreparing && (
          <button
            onClick={handleTogglePause}
            className={`min-h-[56px] min-w-[140px] px-6 py-3 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              isPaused
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'bg-black/50 hover:bg-black/70 border border-[#d4af37]/50 text-[#d4af37] hover:border-[#d4af37]'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5 fill-black" />
                <span>{t('meditation.resume')}</span>
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                <span>{t('meditation.pause')}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-[#091e14] border border-[#d4af37]/50 rounded-3xl p-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              {t('meditation.cancelConfirmTitle')}
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              {t('meditation.cancelConfirmDesc')}
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:bg-[#e6c250] transition-all cursor-pointer"
              >
                {t('meditation.keepPracticing')}
              </button>

              <button
                onClick={handleConfirmCancel}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-black/40 border border-red-500/40 text-red-400 hover:bg-red-950/40 font-bold text-xs transition-all cursor-pointer"
              >
                {t('meditation.endNow')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
