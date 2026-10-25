/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION HISTORY & JOURNAL MODAL
 * PHASE 1.14H: MULTI-DIMENSIONAL FILTERING (STATUS, PRACTICE, DATE) & SAFE PURGE
 */

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Flame,
  Award,
  Trash2,
  AlertTriangle,
  Smile,
  Zap,
  Compass,
  MinusCircle,
  HelpCircle,
  Bed,
  Filter
} from 'lucide-react';
import { MeditationStorageService } from '../../services/meditation/meditationStorageService';
import { PracticeCatalogService } from '../../services/meditation/practiceCatalogService';
import { QualitativeState } from '../../types/meditation/meditationTypes';
import { PracticeId } from '../../types/meditation/practiceCatalogTypes';
import { useTranslation } from '../../i18n';

interface MeditationHistoryModalProps {
  profileId: string;
  onClose: () => void;
  onHistoryUpdated?: () => void;
}

export const MeditationHistoryModal: React.FC<MeditationHistoryModalProps> = ({
  profileId,
  onClose,
  onHistoryUpdated
}) => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [practiceFilter, setPracticeFilter] = useState<'ALL' | PracticeId>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | '7D' | '30D'>('ALL');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const storageData = MeditationStorageService.loadState(profileId);
  const activeStreak = MeditationStorageService.getActiveStreak(profileId);
  const history = storageData.history;
  const allPractices = PracticeCatalogService.getAllPractices();

  const now = new Date();
  const cutoff7D = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const cutoff30D = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredHistory = history.filter((session) => {
    // 1. Status Filter
    if (statusFilter === 'COMPLETED' && session.status !== 'COMPLETED') return false;
    if (statusFilter === 'CANCELLED' && (session.status !== 'CANCELLED' && session.status !== 'INTERRUPTED')) return false;

    // 2. Practice Type Filter
    if (practiceFilter !== 'ALL' && session.practiceId !== practiceFilter) return false;

    // 3. Date Range Filter
    if (dateFilter !== 'ALL') {
      const sessionDate = new Date(session.completedAt || session.startedAt);
      if (dateFilter === '7D' && sessionDate < cutoff7D) return false;
      if (dateFilter === '30D' && sessionDate < cutoff30D) return false;
    }

    return true;
  });

  const getQualitativeBadge = (state?: QualitativeState) => {
    switch (state) {
      case 'CALM':
        return { label: 'शांत', icon: <Smile className="w-3 h-3 text-emerald-400" />, color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' };
      case 'REFRESHED':
        return { label: 'ऊर्जावान', icon: <Zap className="w-3 h-3 text-amber-400" />, color: 'bg-amber-950/60 text-amber-300 border-amber-500/30' };
      case 'CENTERED':
        return { label: 'केंद्रित', icon: <Compass className="w-3 h-3 text-[#d4af37]" />, color: 'bg-[#d4af37]/15 text-[#fef08a] border-[#d4af37]/40' };
      case 'NEUTRAL':
        return { label: 'सहज', icon: <MinusCircle className="w-3 h-3 text-gray-400" />, color: 'bg-gray-900/60 text-gray-300 border-gray-600/30' };
      case 'RESTLESS':
        return { label: 'विचारवान', icon: <HelpCircle className="w-3 h-3 text-purple-400" />, color: 'bg-purple-950/60 text-purple-300 border-purple-500/30' };
      case 'TIRED':
        return { label: 'विश्राम', icon: <Bed className="w-3 h-3 text-blue-400" />, color: 'bg-blue-950/60 text-blue-300 border-blue-500/30' };
      default:
        return null;
    }
  };

  const handleClearHistory = () => {
    MeditationStorageService.clearMeditationData(profileId);
    setShowClearConfirm(false);
    if (onHistoryUpdated) onHistoryUpdated();
    onClose();
  };

  const getPracticeName = (practiceId: string): string => {
    const practice = PracticeCatalogService.getPracticeById(practiceId as any);
    if (practice) {
      return t(practice.titleKey);
    }
    return practiceId;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#061e14] via-[#04160e] to-[#020b07] border border-[#d4af37]/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Calendar className="w-5 h-5 text-[#fef08a]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                साधना डायरी एवं इतिहास
              </h2>
              <p className="text-xs text-emerald-300">
                व्यक्तिगत स्थानीय साधना रिकॉर्ड (Local-First)
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

        {/* Streaks & Cumulative Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-5 bg-black/30 border-b border-white/10 shrink-0">
          <div className="bg-[#03140c] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">वर्तमान निरंतरता</p>
              <p className="text-lg font-extrabold text-white font-mono">
                {activeStreak.currentStreakDays} <span className="text-xs font-normal text-gray-400">दिन</span>
              </p>
            </div>
          </div>

          <div className="bg-[#03140c] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">सर्वश्रेष्ठ निरंतरता</p>
              <p className="text-lg font-extrabold text-white font-mono">
                {activeStreak.longestStreakDays} <span className="text-xs font-normal text-gray-400">दिन</span>
              </p>
            </div>
          </div>

          <div className="bg-[#03140c] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">कुल साधना समय</p>
              <p className="text-lg font-extrabold text-white font-mono">
                {activeStreak.totalMinutesPracticed} <span className="text-xs font-normal text-gray-400">मिनट</span>
              </p>
            </div>
          </div>

          <div className="bg-[#03140c] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">सत्र पूर्ण</p>
              <p className="text-lg font-extrabold text-white font-mono">
                {activeStreak.totalSessionsCompleted}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Multi-Dimensional Filter Bar */}
        <div className="p-3 sm:p-4 bg-black/20 border-b border-white/10 space-y-2.5 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            
            {/* Status Pills */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#d4af37]" />
                स्थिति:
              </span>
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#d4af37]/25 text-[#fef08a] border border-[#d4af37]/50'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                सभी ({history.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('COMPLETED')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'COMPLETED'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                पूर्ण
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('CANCELLED')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'CANCELLED'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                अपूर्ण
              </button>
            </div>

            {/* Date Range Pills */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1">अवधि:</span>
              {(['ALL', '7D', '30D'] as const).map((dr) => (
                <button
                  key={dr}
                  type="button"
                  onClick={() => setDateFilter(dr)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    dateFilter === dr
                      ? 'bg-[#d4af37] text-black font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {dr === 'ALL' ? 'सभी' : dr === '7D' ? '7 दिन' : '30 दिन'}
                </button>
              ))}
            </div>
          </div>

          {/* Practice Type Dropdown */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">साधना:</span>
              <select
                value={practiceFilter}
                onChange={(e) => setPracticeFilter(e.target.value as any)}
                className="bg-[#03150d] border border-white/15 focus:border-[#d4af37]/60 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">सभी साधनाएं (All)</option>
                {allPractices.map((p) => (
                  <option key={p.practiceId} value={p.practiceId}>
                    {t(p.titleKey)}
                  </option>
                ))}
              </select>
            </div>

            {history.length > 0 && !showClearConfirm && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-red-950/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>डेटा साफ़ करें</span>
              </button>
            )}
          </div>
        </div>

        {/* Clear History Confirmation Banner */}
        {showClearConfirm && (
          <div className="p-3 bg-red-950/70 border-b border-red-500/40 flex items-center justify-between gap-3 text-xs shrink-0 animate-fade-in">
            <div className="flex items-start gap-2 text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                इस profile का meditation history, streak, goals, reflections और Sankalpa हटाया जाएगा। यह कार्रवाई वापस नहीं की जा सकती।
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer"
              >
                हाँ, साफ़ करें
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg cursor-pointer"
              >
                रद्द करें
              </button>
            </div>
          </div>
        )}

        {/* Sessions Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-gray-500 mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-300">
                चयनित फ़िल्टर के अनुसार कोई सत्र नहीं मिला।
              </p>
              <p className="text-xs text-gray-500 mt-1">
                फ़िल्टर बदलें या नया साधना सत्र आरंभ करें।
              </p>
            </div>
          ) : (
            filteredHistory.map((session) => {
              const minutes = Math.max(1, Math.round(session.actualDurationSeconds / 60));
              const dateObj = new Date(session.completedAt || session.startedAt);
              const formattedDate = dateObj.toLocaleDateString('hi-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
              const formattedTime = dateObj.toLocaleTimeString('hi-IN', {
                hour: '2-digit',
                minute: '2-digit'
              });

              const qualBadge = session.reflection ? getQualitativeBadge(session.reflection.postSessionState) : null;

              return (
                <div
                  key={session.sessionId}
                  className="bg-black/35 hover:bg-black/50 border border-white/10 hover:border-white/20 rounded-2xl p-3.5 sm:p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-white">
                          {getPracticeName(session.practiceId)}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                            session.status === 'COMPLETED'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {session.status === 'COMPLETED' ? 'पूर्ण' : 'अपूर्ण'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formattedDate} • {formattedTime}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm sm:text-base font-extrabold text-[#d4af37] font-mono">
                        {minutes} <span className="text-xs font-normal text-gray-400">मिनट</span>
                      </p>
                    </div>
                  </div>

                  {/* Reflection Card if present */}
                  {session.reflection && (
                    <div className="mt-2.5 pt-2.5 border-t border-white/5 flex flex-wrap items-center gap-2">
                      {qualBadge && (
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border font-medium ${qualBadge.color}`}>
                          {qualBadge.icon}
                          <span>{qualBadge.label}</span>
                        </span>
                      )}

                      {session.reflection.personalNotes && (
                        <p className="text-xs text-gray-300 italic bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 flex-1 min-w-[200px]">
                          &ldquo;{session.reflection.personalNotes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/50 text-xs font-bold text-[#fef08a] transition-all cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
