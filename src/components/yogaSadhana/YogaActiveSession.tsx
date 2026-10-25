/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA ACTIVE SESSION SCREEN
 * PHASE 1.15F-B: REACTIVE SESSION UI (PREPARING, ACTIVE, PAUSED, COMPLETION)
 * 
 * STRICT INVARIANTS:
 * - Engine is the sole timing and state authority.
 * - Zero setInterval / setTimeout timing accumulation inside UI.
 * - Zero breathing ticks, zero Kumbhaka, zero breath ratios.
 * - Mobile-first layout with >= 44px touch targets.
 * - Zero audio, zero storage, zero network, zero AI.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Pause, Play, X, ArrowLeft, AlertTriangle, Wind, Volume2, VolumeX, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';
import { YogaSessionEngine } from '../../services/yogaSadhana/yogaSessionEngine';
import {
  YogaSessionSnapshot,
  YogaSessionClock
} from '../../types/yogaSadhana/yogaSessionTypes';
import { YogaStorageService } from '../../services/yogaSadhana/yogaStorageService';
import { YogaVoiceController, YogaVoiceGender } from '../../services/yogaSadhana/yogaVoiceController';
import { YogaPostureVisual } from './YogaPostureVisual';
import { YogaSessionComplete } from './YogaSessionComplete';

export interface YogaActiveSessionProps {
  practiceId: string;
  targetDurationSeconds: number;
  profileId?: string | null;
  isMasterProfile?: boolean;
  clock?: YogaSessionClock;
  autoTick?: boolean;
  onExit: () => void;
}

function formatDuration(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const YogaActiveSession: React.FC<YogaActiveSessionProps> = ({
  practiceId,
  targetDurationSeconds,
  profileId,
  isMasterProfile = false,
  clock,
  autoTick = true,
  onExit
}) => {
  const practice = YogaCatalogService.getPracticeById(practiceId);
  const [sessionKey, setSessionKey] = useState<number>(0);
  const [engine, setEngine] = useState<YogaSessionEngine | null>(null);
  const [snapshot, setSnapshot] = useState<YogaSessionSnapshot | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  // Engine instance ref for safe cleanup in unmount
  const engineRef = useRef<YogaSessionEngine | null>(null);
  const recordedSessionIdRef = useRef<string | null>(null);

  // Step guidance state
  const totalSteps = practice?.instructionsHindi.length || 1;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [voiceState, setVoiceState] = useState(YogaVoiceController.getState());
  const [isMuted, setIsMuted] = useState<boolean>(voiceState.isMuted);
  const [voiceGender, setVoiceGender] = useState<YogaVoiceGender>(voiceState.voiceGender);

  // Subscribe to voice controller state
  useEffect(() => {
    const unsub = YogaVoiceController.subscribe((vState) => {
      setVoiceState(vState);
      setIsMuted(vState.isMuted);
      setVoiceGender(vState.voiceGender);
    });
    return () => {
      unsub();
      YogaVoiceController.stop();
    };
  }, []);

  // When active session transitions to ACTIVE, narrate the initial step
  const hasSpokenFirstStepRef = useRef<boolean>(false);
  useEffect(() => {
    if (snapshot?.status === 'ACTIVE' && !hasSpokenFirstStepRef.current && practice) {
      hasSpokenFirstStepRef.current = true;
      const initialStepText = practice.instructionsHindi[currentStepIndex];
      if (initialStepText) {
        YogaVoiceController.speakStep(initialStepText);
      }
    }
  }, [snapshot?.status, practice, currentStepIndex]);

  // When paused, cancelled or completed, immediately stop any ongoing speech
  useEffect(() => {
    if (snapshot?.status === 'PAUSED' || snapshot?.status === 'CANCELLED' || snapshot?.status === 'COMPLETED') {
      YogaVoiceController.stop();
    }
  }, [snapshot?.status]);

  // Step Navigation Handlers
  const handleNextStep = () => {
    if (!practice) return;
    const nextIndex = Math.min(totalSteps - 1, currentStepIndex + 1);
    setCurrentStepIndex(nextIndex);
    const text = practice.instructionsHindi[nextIndex];
    if (text) {
      YogaVoiceController.speakStep(text);
    }
  };

  const handlePrevStep = () => {
    if (!practice) return;
    const prevIndex = Math.max(0, currentStepIndex - 1);
    setCurrentStepIndex(prevIndex);
    const text = practice.instructionsHindi[prevIndex];
    if (text) {
      YogaVoiceController.speakStep(text);
    }
  };

  const handleReplayStep = () => {
    if (!practice) return;
    const text = practice.instructionsHindi[currentStepIndex];
    if (text) {
      YogaVoiceController.replay(text);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = YogaVoiceController.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleToggleVoiceGender = () => {
    const nextGender = YogaVoiceController.toggleVoiceGender();
    setVoiceGender(nextGender);
    if (practice) {
      const text = practice.instructionsHindi[currentStepIndex];
      if (text) {
        YogaVoiceController.replay(text);
      }
    }
  };

  // Initialize engine and subscribe to snapshots
  useEffect(() => {
    setErrorMessage(null);
    setShowCancelModal(false);

    const createResult = YogaSessionEngine.create({
      practiceId,
      targetDurationSeconds,
      clock,
      autoTick
    });

    if (!createResult.success || !createResult.data) {
      const code = createResult.error?.code;
      if (code === 'INVALID_PRACTICE_ID') {
        setErrorMessage('अभ्यास पहचानकर्ता अमान्य है। कृपया सूची से पुनः चयन करें।');
      } else if (code === 'INVALID_DURATION') {
        setErrorMessage('चयनित अभ्यास अवधि इस अभ्यास के लिए स्वीकृत नहीं है।');
      } else {
        setErrorMessage(createResult.error?.message ?? 'सत्र प्रारंभ करने में त्रुटि हुई।');
      }
      return;
    }

    const currentEngine = createResult.data;
    engineRef.current = currentEngine;
    setEngine(currentEngine);

    const unsubscribe = currentEngine.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);

      // Record to Yoga local storage upon entering terminal status (COMPLETED or CANCELLED)
      if (
        (nextSnapshot.status === 'COMPLETED' || nextSnapshot.status === 'CANCELLED') &&
        recordedSessionIdRef.current !== nextSnapshot.sessionId
      ) {
        recordedSessionIdRef.current = nextSnapshot.sessionId;
        const targetPartition = isMasterProfile ? 'default' : (profileId || 'unidentified');
        YogaStorageService.recordSession(
          profileId,
          {
            sessionId: nextSnapshot.sessionId,
            profileId: targetPartition,
            practiceId: nextSnapshot.practiceId,
            targetDurationSeconds: nextSnapshot.targetDurationSeconds,
            actualDurationSeconds: nextSnapshot.elapsedSeconds,
            status: nextSnapshot.status,
            startedAt: nextSnapshot.startedAt,
            completedAt: nextSnapshot.completedAt || nextSnapshot.cancelledAt
          },
          isMasterProfile
        );
      }
    });

    // Start session engine (transitions IDLE -> PREPARING)
    const startResult = currentEngine.start();
    if (!startResult.success) {
      setErrorMessage(startResult.error?.message ?? 'सत्र शुरू करने में असमर्थ।');
    }

    return () => {
      unsubscribe();
      currentEngine.destroy();
      engineRef.current = null;
    };
  }, [practiceId, targetDurationSeconds, profileId, isMasterProfile, clock, autoTick, sessionKey]);

  // Restart creates a fresh engine instance
  const handleRestart = () => {
    setSessionKey((prev) => prev + 1);
  };

  // Safe Back button handling
  const handleBackRequest = () => {
    if (!snapshot) {
      onExit();
      return;
    }

    if (snapshot.status === 'PREPARING' || snapshot.status === 'ACTIVE' || snapshot.status === 'PAUSED') {
      setShowCancelModal(true);
    } else {
      onExit();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    if (engine) {
      engine.cancel();
    }
  };

  const handleDismissCancel = () => {
    setShowCancelModal(false);
  };

  // -------------------------------------------------------------
  // 1. Error Fallback
  // -------------------------------------------------------------
  if (errorMessage || !practice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030a08] to-[#082218] text-white p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">सत्र प्रारंभ नहीं हो सका</h2>
        <p className="text-gray-300 text-sm max-w-sm mb-6 leading-relaxed">
          {errorMessage || 'अभ्यास जानकारी उपलब्ध नहीं है।'}
        </p>
        <button
          type="button"
          onClick={onExit}
          className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#d4af37] text-[#030a08] font-bold text-sm cursor-pointer"
        >
          वापस जाएं
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. Initial / Uninitialized Loading
  // -------------------------------------------------------------
  if (!snapshot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030a08] to-[#082218] text-white p-6 flex items-center justify-center">
        <p className="text-sm text-gray-300">सत्र तैयार हो रहा है...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. Terminal Completion or Cancelled Screen
  // -------------------------------------------------------------
  if (snapshot.status === 'COMPLETED' || snapshot.status === 'CANCELLED') {
    return (
      <YogaSessionComplete
        practiceId={practiceId}
        targetDurationSeconds={snapshot.targetDurationSeconds}
        actualElapsedSeconds={snapshot.elapsedSeconds}
        isCompleted={snapshot.status === 'COMPLETED'}
        onRestart={handleRestart}
        onExit={onExit}
      />
    );
  }

  // -------------------------------------------------------------
  // 4. PREPARING Settle Screen (3-second engine countdown)
  // -------------------------------------------------------------
  if (snapshot.status === 'PREPARING') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030a08] via-[#051811] to-[#082218] text-white p-4 sm:p-6 flex flex-col justify-between">
        <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleBackRequest}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer text-xs"
            aria-label="रद्द करें"
          >
            <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
            <span>वापस</span>
          </button>

          <span className="text-xs bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fef08a] px-3 py-1 rounded-full font-semibold">
            तैयारी
          </span>
        </div>

        <div className="w-full max-w-md mx-auto flex flex-col items-center text-center space-y-6 my-auto">
          <div className="space-y-1.5">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              सत्र प्रारंभ
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
              {practice.nameHindi}
            </h1>
            <p className="text-base text-gray-300 font-medium">
              ({practice.nameEnglish})
            </p>
          </div>

          {/* Settle countdown ring from engine */}
          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-[#d4af37]/40 flex items-center justify-center bg-[#0a1510]/90 shadow-[0_0_30px_rgba(212,175,55,0.25)]">
            <span className="text-6xl sm:text-7xl font-extrabold text-[#fef08a] font-mono">
              {snapshot.preparingRemainingSeconds > 0 ? snapshot.preparingRemainingSeconds : 1}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 max-w-xs leading-relaxed">
            अभ्यास के लिए सहज स्थिति में आएँ।
          </p>

          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="text-xs text-gray-400 hover:text-gray-200 underline cursor-pointer py-1"
          >
            सत्र रद्द करें
          </button>
        </div>

        <div className="w-full max-w-md mx-auto pb-4 text-center text-xs text-gray-400">
          तैयारी अवधि अभ्यास समय में नहीं जोड़ी जाएगी
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <CancelConfirmModal
            onKeepGoing={handleDismissCancel}
            onConfirmEnd={handleConfirmCancel}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. ACTIVE & PAUSED Screen
  // -------------------------------------------------------------
  const isPaused = snapshot.status === 'PAUSED';
  const isAnulomVilom = practice.id === 'anulom_vilom';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030a08] via-[#051811] to-[#082218] text-white p-4 sm:p-6 flex flex-col justify-between">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleBackRequest}
          className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer text-xs"
          aria-label="वापस"
        >
          <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
          <span>वापस</span>
        </button>

        {isPaused ? (
          <span className="flex items-center gap-1.5 text-xs bg-amber-950/80 border border-amber-500/50 text-amber-300 px-3 py-1 rounded-full font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>विराम (Paused)</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>सक्रिय (Active)</span>
          </span>
        )}
      </div>

      {/* Main Practice Core Card */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center space-y-6 my-auto">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
            {practice.nameHindi}
          </h1>
          <p className="text-lg text-[#d4af37] font-medium">
            {practice.nameEnglish}
          </p>
          <span className="inline-block text-xs bg-white/10 text-gray-300 px-3 py-0.5 rounded-full mt-1">
            {practice.category === 'ASANA' ? 'आसन' : 'श्वास जागरूकता'}
          </span>
        </div>

        {/* Big Time Display */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-center gap-2 font-mono">
            <span className="text-6xl sm:text-7xl font-extrabold text-white tracking-tight">
              {formatDuration(snapshot.elapsedSeconds)}
            </span>
            <span className="text-2xl sm:text-3xl text-gray-400 font-semibold">
              / {formatDuration(snapshot.targetDurationSeconds)}
            </span>
          </div>

          <p className="text-xs text-gray-400">
            अवशिष्ट समय: <span className="text-gray-200 font-mono font-medium">{formatDuration(snapshot.remainingSeconds)}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs space-y-1.5">
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-[#d4af37]/20">
            <div
              className="bg-gradient-to-r from-[#d4af37] to-[#fef08a] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.round(snapshot.progressRatio * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 px-1 font-mono">
            <span>00:00</span>
            <span>{Math.round(snapshot.progressRatio * 100)}%</span>
            <span>{formatDuration(snapshot.targetDurationSeconds)}</span>
          </div>
        </div>

        {/* Anulom Vilom Special Provenance & Safety Notice */}
        {isAnulomVilom && (
          <div className="bg-[#121c15] border border-[#d4af37]/50 rounded-2xl p-3.5 max-w-xs text-left space-y-1.5 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#fef08a]">
              <Wind className="w-4 h-4 text-[#d4af37]" />
              <span>अनुलोम विलोम — ऐतिहासिक परंपरा</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              यह आधुनिक परंपरा में प्रयुक्त सरल alternate-nostril breathing का रूप है। इसे शास्त्रीय नाड़ी शोधन के समान मानकर प्रस्तुत नहीं किया गया है।
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold pt-0.5">
              शून्य कुंभक — स्वाभाविक एवं शांत प्रवाह
            </p>
          </div>
        )}

        {/* Posture Demonstration & Step-by-Step Voice Guidance Card */}
        <div className="w-full max-w-sm bg-[#0a1510]/95 border border-[#d4af37]/40 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          {/* Posture Illustration */}
          <YogaPostureVisual
            practiceId={practice.id}
            stepIndex={currentStepIndex}
          />

          {/* Current Step Instruction Text */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#fef08a] bg-[#d4af37]/20 border border-[#d4af37]/40 px-2.5 py-0.5 rounded-full">
                चरण {currentStepIndex + 1} / {totalSteps}
              </span>

              <div className="flex items-center gap-1.5">
                {/* Guru Voice Selector (Defaults to Female Guru Voice) */}
                <button
                  type="button"
                  onClick={handleToggleVoiceGender}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#fef08a] hover:text-white px-2 py-1 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/40 transition-all cursor-pointer min-h-[36px]"
                  title="गुरु वाणी स्वर बदलें (महिला / पुरुष)"
                  aria-label={voiceGender === 'female' ? 'महिला योगिनी वाणी' : 'पुरुष गुरु वाणी'}
                >
                  <span className="text-xs">{voiceGender === 'female' ? '🧘‍♀️' : '🧘‍♂️'}</span>
                  <span>{voiceGender === 'female' ? 'महिला वाणी' : 'पुरुष वाणी'}</span>
                </button>

                {/* Mute/Voice Audio Control */}
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="flex items-center gap-1 text-[11px] font-semibold text-gray-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 transition-all cursor-pointer min-h-[36px]"
                  aria-label={isMuted ? 'ध्वनि चालू करें' : 'ध्वनि बंद करें'}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      <span>म्यूट</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>आवाज़ चालू</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-100 font-medium leading-relaxed pt-1">
              {practice.instructionsHindi[currentStepIndex] || practice.techniqueSummaryHindi}
            </p>

            {/* Honest Disclosure: When user selected Female Voice but device has no female Hindi voice */}
            {voiceGender === 'female' && !voiceState.hasGenuineFemaleVoice && (
              <div 
                data-testid="yoga-voice-fallback-disclosure"
                className="mt-1.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed space-y-1"
              >
                <div className="font-semibold flex items-center gap-1 text-amber-300">
                  <span>ℹ️</span>
                  <span>डिवाइस स्वर सूचना:</span>
                </div>
                <p>
                  आपके डिवाइस में वास्तविक हिंदी महिला वाणी उपलब्ध नहीं है। अभी उपलब्ध गुरु वाणी चलेगी। महिला वाणी के लिए अपने फ़ोन की Text-to-speech सेटिंग्स में उपलब्ध हिंदी आवाज़ें जाँचें।
                </p>
                <p className="text-[10px] text-amber-300/80 pt-0.5 border-t border-amber-500/20">
                  💡 फ़ोन सेटिंग्स → Text-to-speech output → Preferred engine/voice data → हिन्दी में उपलब्ध आवाज़ें जाँचें। विकल्प फ़ोन और TTS इंजन के अनुसार अलग हो सकते हैं।
                </p>
              </div>
            )}
          </div>

          {/* Step Navigation & Replay Bar */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed min-h-[44px]"
              aria-label="पिछला चरण"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>पिछला</span>
            </button>

            <button
              type="button"
              onClick={handleReplayStep}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/50 text-[#fef08a] text-xs font-bold transition-all cursor-pointer min-h-[44px]"
              aria-label="पुनः सुनें"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>पुनः सुनें</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={currentStepIndex >= totalSteps - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed min-h-[44px]"
              aria-label="अगला चरण"
            >
              <span>अगला</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Control Buttons */}
      <div className="w-full max-w-md mx-auto space-y-3 pb-6">
        <div className="flex items-center gap-3">
          {isPaused ? (
            <button
              type="button"
              onClick={() => engine?.resume()}
              className="flex-1 min-h-[52px] py-3.5 px-6 rounded-2xl bg-[#d4af37] text-[#030a08] font-bold text-base hover:bg-[#e6c250] transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              aria-label="जारी रखें"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>जारी रखें</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => engine?.pause()}
              className="flex-1 min-h-[52px] py-3.5 px-6 rounded-2xl bg-[#0a1510] border-2 border-[#d4af37] text-[#d4af37] font-bold text-base hover:bg-[#d4af37]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              aria-label="विराम दें"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>विराम दें</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="min-h-[52px] px-6 rounded-2xl bg-white/5 border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm font-semibold"
            aria-label="समाप्त करें"
          >
            <X className="w-5 h-5" />
            <span>समाप्त</span>
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <CancelConfirmModal
          onKeepGoing={handleDismissCancel}
          onConfirmEnd={handleConfirmCancel}
        />
      )}
    </div>
  );
};

interface CancelConfirmModalProps {
  onKeepGoing: () => void;
  onConfirmEnd: () => void;
}

const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({ onKeepGoing, onConfirmEnd }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0a1510] border border-[#d4af37]/60 rounded-3xl p-6 space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full mx-auto bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-white">
            क्या आप अभ्यास समाप्त करना चाहते हैं?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            अभ्यास अभी जारी है। यदि आप समाप्त करते हैं, तो यह सत्र यहीं रुक जाएगा।
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onKeepGoing}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-[#d4af37] text-[#030a08] font-bold text-sm hover:bg-[#e6c250] transition-all cursor-pointer"
          >
            जारी रखें
          </button>

          <button
            type="button"
            onClick={onConfirmEnd}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-black/40 border border-red-500/40 text-red-300 font-semibold text-sm hover:bg-red-950/40 transition-all cursor-pointer"
          >
            अभ्यास समाप्त करें
          </button>
        </div>
      </div>
    </div>
  );
};
