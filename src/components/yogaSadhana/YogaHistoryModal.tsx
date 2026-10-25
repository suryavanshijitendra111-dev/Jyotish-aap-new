/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA HISTORY MODAL
 * PHASE 1.15F-C: PROFILE-ISOLATED SESSION HISTORY (CLEAN, FOCUSED, AUDITED)
 * 
 * STRICT INVARIANTS:
 * - Domain-isolated from Meditation (zero Meditation imports).
 * - Reads directly from YogaStorageService.
 * - Simple chronological session history list showing validated available fields:
 *     - Practice Hindi & English names
 *     - Recorded Date & Time
 *     - Actual active duration vs target duration
 *     - Completed or Cancelled status
 * - Honest storage persistence status indicator.
 * - Zero streak calculations or UI, zero purge controls, zero multi-dimensional filters.
 * - Zero audio, zero network, zero AI.
 */

import React from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { YogaStorageService } from '../../services/yogaSadhana/yogaStorageService';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';

export interface YogaHistoryModalProps {
  profileId?: string | null;
  isMasterProfile?: boolean;
  onClose: () => void;
}

function formatDuration(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const YogaHistoryModal: React.FC<YogaHistoryModalProps> = ({
  profileId,
  isMasterProfile = false,
  onClose
}) => {
  const storageData = YogaStorageService.loadState(profileId, isMasterProfile);
  const history = storageData.history;

  const getPracticeName = (practiceId: string): string => {
    const practice = YogaCatalogService.getPracticeById(practiceId);
    if (practice) {
      return `${practice.nameHindi} (${practice.nameEnglish})`;
    }
    return practiceId;
  };

  const isIdentityVerified = isMasterProfile || Boolean(profileId && profileId.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#061e14] via-[#04160e] to-[#020b07] border border-[#d4af37]/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Calendar className="w-5 h-5 text-[#fef08a]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                योग अभ्यास इतिहास
              </h2>
              <p className="text-xs text-emerald-300">
                व्यक्तिगत स्थानीय साधना रिकॉर्ड (Local-First)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer min-h-[44px]"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity & Total Count Banner */}
        <div className="px-4 py-3 bg-black/30 border-b border-white/10 flex items-center justify-between text-xs text-gray-300 shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#d4af37]" />
            <span>कुल रिकॉर्ड: <strong className="text-white font-mono">{history.length}</strong> / 200</span>
          </div>

          {!isIdentityVerified ? (
            <span className="text-amber-400 flex items-center gap-1 text-[11px]">
              <Info className="w-3.5 h-3.5" />
              प्रोफ़ाइल असत्यापित (सत्र स्थानीय रूप से संचित नहीं होगा)
            </span>
          ) : (
            <span className="text-emerald-400 text-[11px]">
              विभाजन: {isMasterProfile ? 'मास्टर' : profileId}
            </span>
          )}
        </div>

        {/* Simple Chronological History List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {history.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <p className="text-sm text-gray-300">
                अभी तक कोई योग सत्र रिकॉर्ड नहीं हुआ है।
              </p>
              <p className="text-xs text-gray-400">
                सत्र पूर्ण या समाप्त होने पर विवरण स्वतः यहाँ क्रमानुसार संचित होगा।
              </p>
            </div>
          ) : (
            history.map((session) => {
              const isCompleted = session.status === 'COMPLETED';
              const dateDisplay = new Date(session.completedAt || session.startedAt).toLocaleString('hi-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              return (
                <div
                  key={session.sessionId}
                  className="bg-[#03140c]/80 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-2.5 hover:border-[#d4af37]/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-white">
                        {getPracticeName(session.practiceId)}
                      </h4>
                      <p className="text-[11px] text-gray-400">{dateDisplay}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>पूर्ण</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>अपूर्ण</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Duration Metrics */}
                  <div className="flex items-center gap-4 text-xs text-gray-300 pt-1 border-t border-white/5">
                    <div>
                      <span className="text-gray-400">अभ्यास समय: </span>
                      <span className="font-mono font-bold text-white">
                        {formatDuration(session.actualDurationSeconds)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">लक्षित अवधि: </span>
                      <span className="font-mono text-gray-300">
                        {formatDuration(session.targetDurationSeconds)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#e6c250] transition-all cursor-pointer min-h-[44px]"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
