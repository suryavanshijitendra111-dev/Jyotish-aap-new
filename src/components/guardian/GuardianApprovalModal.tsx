import { useState } from 'react';
import { OwnerApprovalRequest } from '../../types/ownerControl';
import { ShieldCheck, ShieldAlert, X, FileCode, CheckCircle2, XCircle } from 'lucide-react';
import { t } from '../../i18n';

interface GuardianApprovalModalProps {
  request: OwnerApprovalRequest | null;
  onClose: () => void;
  onApproveAndFix: (request: OwnerApprovalRequest) => void;
  onReject: (request: OwnerApprovalRequest) => void;
}

export default function GuardianApprovalModal({
  request,
  onClose,
  onApproveAndFix,
  onReject,
}: GuardianApprovalModalProps) {
  const [showFullDetails, setShowFullDetails] = useState(false);

  if (!request) return null;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-950 border-red-500 text-red-300';
      case 'HIGH':
        return 'bg-amber-950 border-amber-500 text-amber-300';
      case 'MEDIUM':
        return 'bg-yellow-950 border-yellow-500 text-yellow-300';
      default:
        return 'bg-emerald-950 border-emerald-500 text-emerald-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-b from-[#0d2217] via-[#091b12] to-[#040e09] border-2 border-[#d4af37] rounded-3xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(212,175,55,0.3)] relative overflow-hidden text-white font-sans">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37]">
              <ShieldCheck className="w-6 h-6 text-[#d4af37]" />
            </div>
            <div>
              <div className="text-xs text-[#d4af37] uppercase tracking-[0.25em] font-bold">
                {t('guardian.guardianGovernance')}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mt-0.5">
                {t('guardian.changeRequest')}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Request Body */}
        <div className="py-4 space-y-4 text-sm text-gray-200">
          <div>
            <span className="text-xs text-gray-300 uppercase tracking-widest font-semibold block mb-1">
              {t('guardian.problem')}:
            </span>
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 font-semibold text-white break-words text-sm sm:text-base leading-relaxed">
              {request.description}
            </div>
          </div>

          <div>
            <span className="text-xs text-emerald-400 uppercase tracking-widest font-bold block mb-1">
              {t('guardian.proposedFix')}:
            </span>
            <div className="bg-[#08281a]/80 p-3.5 rounded-xl border border-[#d4af37]/30 text-gray-200 break-words text-sm sm:text-base leading-relaxed">
              {request.proposedFix || request.reason}
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-300 uppercase tracking-widest font-semibold block mb-1">
              {t('guardian.affectedFiles')}:
            </span>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 flex flex-wrap gap-2 font-mono text-xs sm:text-sm text-[#d4af37]">
              {request.affectedFiles.map((file, idx) => (
                <span key={idx} className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 break-all">
                  <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                  {file}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-gray-300 uppercase tracking-widest font-semibold block mb-1.5">
                {t('guardian.risk')}:
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${getRiskBadge(request.risk)}`}>
                {request.risk}
              </span>
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-gray-300 uppercase tracking-widest font-semibold block mb-1.5">
                {t('guardian.backup')}:
              </span>
              <span className="text-sm sm:text-base font-bold text-[#d4af37]">
                {request.backupRequired ? t('guardian.backupRequired') : t('guardian.backupNotRequired')}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-300 uppercase tracking-widest font-semibold block mb-1">
              {t('guardian.expectedResult')}:
            </span>
            <p className="text-gray-200 bg-black/20 p-3 rounded-xl border border-white/5 break-words text-sm sm:text-base leading-relaxed">
              {request.expectedResult || 'Preserves astrological accuracy while repairing the targeted subsystem.'}
            </p>
          </div>

          {showFullDetails && (
            <div className="p-3.5 bg-black/60 rounded-xl border border-[#d4af37]/30 text-xs sm:text-sm font-mono space-y-1.5 text-gray-300 overflow-x-auto">
              <p><span className="text-[#d4af37] font-semibold">{t('guardian.requestId')}:</span> {request.id}</p>
              <p><span className="text-[#d4af37] font-semibold">{t('guardian.requestedBy')}:</span> {request.requestedBy}</p>
              <p><span className="text-[#d4af37] font-semibold">{t('guardian.changeType')}:</span> {request.changeType}</p>
              <p><span className="text-[#d4af37] font-semibold">{t('guardian.createdAt')}:</span> {new Date(request.createdAt).toLocaleString()}</p>
              <p><span className="text-[#d4af37] font-semibold">{t('guardian.rollbackAvailable')}:</span> {request.rollbackAvailable ? 'YES' : 'NO'}</p>
            </div>
          )}
        </div>

        {/* Buttons: [APPROVE & FIX], [REJECT], [VIEW DETAILS] */}
        <div className="pt-4 border-t border-[#d4af37]/20 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="min-h-[48px] px-4 py-2.5 rounded-xl text-sm font-semibold text-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 transition-all cursor-pointer whitespace-nowrap"
          >
            {showFullDetails ? t('guardian.hideFullDetails') : t('guardian.viewDetails')}
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onReject(request)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl text-sm sm:text-base font-semibold text-gray-200 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
            >
              <XCircle className="w-4 h-4" />
              {t('guardian.reject')}
            </button>

            <button
              onClick={() => onApproveAndFix(request)}
              className="min-h-[48px] px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#d4af37] text-[#030a08] hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer flex items-center gap-2 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('guardian.approveAndFix')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
