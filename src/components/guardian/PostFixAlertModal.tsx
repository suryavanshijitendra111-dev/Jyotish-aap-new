import React from 'react';
import { CheckCircle, AlertOctagon, RotateCcw, X, ShieldCheck } from 'lucide-react';
import { t } from '../../i18n';

interface PostFixAlertModalProps {
  isOpen?: boolean;
  result: {
    success: boolean;
    problemTitle: string;
    actionTaken: string;
    testsPassed: string;
    status: 'RESOLVED' | 'ROLLED_BACK';
    rollbackAvailable: boolean;
    backupId?: string;
    errorReason?: string;
  } | null;
  onClose: () => void;
  onRollback?: (backupId: string) => void;
}

export default function PostFixAlertModal({
  isOpen,
  result,
  onClose,
  onRollback,
}: PostFixAlertModalProps) {
  if (isOpen === false || !result) return null;

  const isSuccess = result.success && result.status === 'RESOLVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-b from-[#091f15] via-[#05140e] to-[#020a06] border-2 border-[#d4af37] rounded-3xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(212,175,55,0.35)] relative overflow-hidden text-white font-sans">
        {/* Glow */}
        <div className={`absolute -top-10 -right-10 w-36 h-36 ${isSuccess ? 'bg-emerald-500/20' : 'bg-red-500/20'} rounded-full blur-2xl pointer-events-none`} />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/30 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${isSuccess ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' : 'bg-red-950/80 border-red-500 text-red-400'}`}>
              {isSuccess ? <CheckCircle className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-wide text-white">
                {isSuccess ? `🟢 ${t('guardian.fixSuccessTitle') || 'समस्या ठीक हो गई'}` : `🔴 ${t('guardian.fixFailedTitle') || 'सुधार लागू नहीं किया गया'}`}
              </h2>
              <p className="text-xs text-[#d4af37] uppercase tracking-widest mt-0.5 font-medium">
                {t('guardian.guardianGovernance')} • {result.status}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-4 space-y-3.5 text-sm text-gray-200 relative z-10">
          <div className="bg-black/40 p-3.5 rounded-xl border border-white/10">
            <span className="text-xs text-gray-300 uppercase tracking-wider block mb-1 font-semibold">
              {t('guardian.problem')}:
            </span>
            <p className="text-base font-semibold text-white break-words">
              {result.problemTitle}
            </p>
          </div>

          <div className="bg-[#082218]/60 p-3.5 rounded-xl border border-[#d4af37]/30">
            <span className="text-xs text-[#d4af37] uppercase tracking-wider font-bold block mb-1">
              {t('guardian.action')}:
            </span>
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed break-words">
              {result.actionTaken}
            </p>
          </div>

          {result.errorReason && (
            <div className="bg-red-950/40 p-3 rounded-xl border border-red-500/40 text-red-200 text-sm">
              <span className="text-xs uppercase font-bold text-red-300 block mb-0.5">कारण:</span>
              {result.errorReason}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">
                {t('guardian.testsPassed') || 'परीक्षण'}:
              </span>
              <span className={`text-xs sm:text-sm font-bold font-mono ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.testsPassed}
              </span>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">
                {t('guardian.status')}:
              </span>
              <span className={`text-xs sm:text-sm font-bold ${isSuccess ? 'text-emerald-300' : 'text-amber-300'}`}>
                {result.status}
              </span>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1">
                {t('guardian.rollbackStatus') || 'रोलबैक'}:
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#d4af37]">
                {result.rollbackAvailable ? (t('guardian.rollbackAvailableText') || 'उपलब्ध') : 'NA'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#d4af37]/20 flex flex-wrap items-center justify-end gap-3 relative z-10">
          {result.rollbackAvailable && result.backupId && onRollback && (
            <button
              onClick={() => onRollback(result.backupId!)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              {t('guardian.rollbackAction')}
            </button>
          )}

          <button
            onClick={onClose}
            className="min-h-[48px] px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold bg-[#d4af37] text-[#030a08] hover:bg-[#d4af37]/90 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer whitespace-nowrap"
          >
            {t('common.close') || 'ठीक है'}
          </button>
        </div>
      </div>
    </div>
  );
}
