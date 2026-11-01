/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PRACTICE CONFIG MODAL
 */

import React, { useState } from 'react';
import { X, Clock, Play, Volume2, Shield } from 'lucide-react';
import { PracticeDefinition } from '../../types/meditation/practiceCatalogTypes';
import { SessionDurationSeconds } from '../../types/meditation/meditationTypes';
import { MeditationAudioMode } from '../../services/meditation/meditationAudioController';

interface Props {
  practice: PracticeDefinition;
  profileId: string;
  onClose: () => void;
  onStartSession: (
    duration: SessionDurationSeconds,
    prepSeconds: number,
    audioMode: MeditationAudioMode
  ) => void;
}

export const PracticeConfigModal: React.FC<Props> = ({
  practice,
  onClose,
  onStartSession
}) => {
  const [duration, setDuration] = useState<SessionDurationSeconds>(practice.defaultDurationSeconds);
  const [prepSeconds, setPrepSeconds] = useState<number>(3);
  const [audioMode, setAudioMode] = useState<MeditationAudioMode>('VOICE_AND_AMBIENT');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#04120c] border border-[#d4af37]/40 rounded-3xl w-full max-w-md p-6 relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">{practice.titleHindi}</h3>
        <p className="text-xs text-[#d4af37] mb-4">{practice.titleEnglish}</p>
        <p className="text-xs text-gray-300 leading-relaxed mb-5">{practice.descriptionHindi}</p>

        {/* Duration Selection */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
            साधना अवधि (Duration)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {practice.allowedDurations.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  duration === d
                    ? 'bg-[#d4af37] text-black border-[#d4af37]'
                    : 'bg-black/40 text-gray-300 border-white/10 hover:border-[#d4af37]/40'
                }`}
              >
                {Math.round(d / 60)} मिनट
              </button>
            ))}
          </div>
        </div>

        {/* Audio Mode */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-[#d4af37]" />
            ध्वनि विधा (Audio Guidance)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'VOICE_AND_AMBIENT', label: 'ध्वनि + मार्गदर्शन' },
              { id: 'AMBIENT_ONLY', label: 'केवल ओंकार नाद' },
              { id: 'VOICE_ONLY', label: 'केवल मार्गदर्शन' },
              { id: 'SILENT', label: 'पूर्ण मौन (मौन)' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAudioMode(m.id as any)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-left ${
                  audioMode === m.id
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                    : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStartSession(duration, prepSeconds, audioMode)}
          className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-[#e6c250] text-black font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-[1.01] transition-transform"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>ध्यान सत्र आरंभ करें</span>
        </button>
      </div>
    </div>
  );
};
