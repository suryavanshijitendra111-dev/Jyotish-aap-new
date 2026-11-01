/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA ACTIVE SESSION
 * PHASE 1.15F-B: ACTIVE SESSION UI AND ENGINE INTEGRATION
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Pause, Play, X, ShieldAlert, Wind, UserCheck } from 'lucide-react';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';
import { YogaSessionEngine } from '../../services/yogaSadhana/yogaSessionEngine';
import { YogaSessionSnapshot } from '../../types/yogaSadhana/yogaSessionTypes';
import { YogaSessionComplete } from './YogaSessionComplete';

export interface YogaActiveSessionProps {
  practiceId: string;
  targetDurationSeconds: number;
  profileId?: string | null;
  isMasterProfile?: boolean;
  onExit: () => void;
}

export const YogaActiveSession: React.FC<YogaActiveSessionProps> = ({
  practiceId,
  targetDurationSeconds,
  profileId,
  isMasterProfile,
  onExit
}) => {
  const [snapshot, setSnapshot] = useState<YogaSessionSnapshot | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const engineRef = useRef<any>(null);

  const practice = YogaCatalogService.getPracticeById(practiceId);

  useEffect(() => {
    if (!practice) {
      setEngineError('INVALID_PRACTICE_ID: सत्र प्रारंभ नहीं हो सका। अभ्यास अनुपलब्ध है।');
      return;
    }

    if (!practice.allowedDurationsSeconds.includes(targetDurationSeconds)) {
      setEngineError('INVALID_DURATION: सत्र प्रारंभ नहीं हो सका। अवधि अमान्य है।');
      return;
    }

    const created = YogaSessionEngine.create({
      practiceId,
      targetDurationSeconds,
      autoTick: true
    });

    if (!created.success || !created.data) {
      setEngineError(created.error?.code || 'सत्र प्रारंभ नहीं हो सका');
      return;
    }

    const engineInstance = created.data;
    engineRef.current = engineInstance;
    setSnapshot(engineInstance.getSnapshot());

    const unsubscribe = engineInstance.subscribe((snap: YogaSessionSnapshot) => {
      setSnapshot(snap);
    });

    engineInstance.start();

    return () => {
      unsubscribe();
      if (engineInstance.getSnapshot().status === 'ACTIVE' || engineInstance.getSnapshot().status === 'PAUSED') {
        engineInstance.cancel();
      }
    };
  }, [practiceId, targetDurationSeconds]);

  if (engineError) {
    return (
      <div className="min-h-screen bg-[#030a08] text-white p-6 flex flex-col items-center justify-center">
        <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-lg font-bold mb-2">त्रुटि: सत्र प्रारंभ नहीं हो सका</h2>
        <p className="text-xs text-gray-400 mb-6 text-center">{engineError}</p>
        <button
          onClick={onExit}
          className="px-6 py-2.5 bg-[#d4af37] text-black font-bold rounded-xl"
        >
          वापस जाएँ
        </button>
      </div>
    );
  }

  if (!practice || !snapshot) {
    return (
      <div className="min-h-screen bg-[#030a08] text-white flex items-center justify-center">
        <div className="animate-pulse text-[#d4af37] text-sm">साधना सत्र प्रारंभ हो रहा है...</div>
      </div>
    );
  }

  // Switch to complete / cancelled screen if terminal
  if (snapshot.status === 'COMPLETED' || snapshot.status === 'CANCELLED') {
    return (
      <YogaSessionComplete
        practiceId={practice.id}
        targetDurationSeconds={targetDurationSeconds}
        actualElapsedSeconds={snapshot.elapsedSeconds}
        isCompleted={snapshot.status === 'COMPLETED'}
        onRestart={() => {
          if (engineRef.current) {
            const restarted = YogaSessionEngine.create({
              practiceId,
              targetDurationSeconds,
              autoTick: true
            });
            if (restarted.success && restarted.data) {
              engineRef.current = restarted.data;
              restarted.data.subscribe((s: YogaSessionSnapshot) => setSnapshot(s));
              restarted.data.start();
            }
          }
        }}
        onExit={onExit}
      />
    );
  }

  const handleBackRequest = () => {
    if (snapshot.status === 'ACTIVE' || snapshot.status === 'PAUSED') {
      setShowCancelModal(true);
    } else {
      onExit();
    }
  };

  const handleDismissCancel = () => {
    setShowCancelModal(false);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    if (engineRef.current) {
      engineRef.current.cancel();
    }
  };

  const engine = engineRef.current;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030a08] via-[#051811] to-[#082218] text-white p-4 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackRequest}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs">वापस</span>
          </button>
          <span className="text-xs text-[#d4af37] font-semibold">
            {practice.category === 'ASANA' ? 'आसन' : 'श्वास जागरूकता'}
          </span>
        </div>

        <div className="text-center mt-2">
          <h1 className="text-2xl font-bold text-white mb-0.5">{practice.nameHindi}</h1>
          <p className="text-xs text-[#d4af37]/80">{practice.nameEnglish}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md w-full mx-auto my-auto text-center space-y-6">
        {/* PREPARING State */}
        {snapshot.status === 'PREPARING' && (
          <div className="space-y-4">
            <div className="w-32 h-32 mx-auto rounded-full border-4 border-[#d4af37] flex items-center justify-center bg-black/40 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              <span className="text-4xl font-bold text-[#d4af37] animate-pulse">
                {snapshot.preparingRemainingSeconds}
              </span>
            </div>
            <p className="text-sm text-gray-300">अभ्यास के लिए सहज स्थिति में आएँ।</p>
          </div>
        )}

        {/* ACTIVE & PAUSED States */}
        {(snapshot.status === 'ACTIVE' || snapshot.status === 'PAUSED') && (
          <div className="space-y-6">
            {/* Status Pill */}
            {snapshot.status === 'PAUSED' && (
              <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                विराम (Paused)
              </div>
            )}

            {/* Circular Timer Progress */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-gray-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#d4af37] transition-all duration-300"
                  strokeWidth="6"
                  strokeDasharray="264"
                  strokeDashoffset={264 - 264 * snapshot.progressRatio}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">
                  {Math.floor(snapshot.remainingSeconds / 60)}:
                  {String(snapshot.remainingSeconds % 60).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">
                  व्यतीत: {Math.floor(snapshot.elapsedSeconds / 60)}:{String(snapshot.elapsedSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Anulom Vilom Provenance Notice if applicable */}
            {practice.id === 'anulom_vilom' && (
              <div className="p-3 bg-black/40 border border-[#d4af37]/30 rounded-xl text-[11px] text-gray-300 space-y-1 text-left">
                <p>यह आधुनिक परंपरा में प्रयुक्त सरल alternate-nostril breathing का रूप है।</p>
                <p className="text-[#d4af37]">शून्य कुंभक — स्वाभाविक एवं शांत प्रवाह</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {snapshot.status === 'ACTIVE' ? (
                <button
                  onClick={() => engine?.pause()}
                  className="px-6 py-3 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold flex items-center gap-2 hover:bg-amber-500/30 transition-colors"
                >
                  <Pause className="w-4 h-4 fill-amber-300" />
                  <span>रोकें</span>
                </button>
              ) : (
                <button
                  onClick={() => engine?.resume()}
                  className="px-6 py-3 rounded-full bg-[#d4af37] text-black font-bold flex items-center gap-2 hover:bg-[#e6c250] transition-colors"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>जारी रखें</span>
                </button>
              )}

              <button
                onClick={() => setShowCancelModal(true)}
                className="px-6 py-3 rounded-full bg-red-950/40 border border-red-500/40 text-red-300 font-bold hover:bg-red-900/40 transition-colors"
              >
                समाप्त
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-gray-500">
        JeevanDarpan Yoga Sadhana — Zero Kumbhaka, Classical & Traditional Form
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a1510] border border-[#d4af37]/50 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="text-base font-bold text-white">
              क्या आप अभ्यास समाप्त करना चाहते हैं?
            </h3>
            <p className="text-xs text-gray-300">
              सत्र बीच में रोकने पर अब तक का अभ्यास समय सुरक्षित रहेगा।
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={handleDismissCancel}
                className="px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold text-gray-300"
              >
                अभ्यास जारी रखें
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                हाँ, समाप्त करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
