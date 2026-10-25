import React, { useState } from 'react';
import { RollbackSnapshot } from '../../types/backup';
import { RollbackService } from '../../services/backup/rollbackService';
import { RotateCcw, AlertTriangle, X, Check, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface RollbackDialogProps {
  snapshot: RollbackSnapshot;
  onClose: () => void;
  onSuccess: (message: string) => void;
  showToast: (msg: string) => void;
}

export const RollbackDialog: React.FC<RollbackDialogProps> = ({
  snapshot,
  onClose,
  onSuccess,
  showToast,
}) => {
  const { language } = useTranslation();
  const isHindi = language === 'hi' || language === 'mr';

  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRollback = async () => {
    setIsExecuting(true);
    setErrorMsg(null);
    try {
      const result = await RollbackService.executeRollback(snapshot.id);
      if (result.success) {
        showToast(result.message);
        onSuccess(result.message);
        onClose();
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'रोलबैक के दौरान त्रुटि आई।');
    } finally {
      setIsExecuting(false);
    }
  };

  const formattedDate = new Date(snapshot.timestamp).toLocaleString(isHindi ? 'hi-IN' : 'en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-[#0a1812] border-2 border-amber-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-5 text-white my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-amber-400">
                {isHindi ? 'रोलबैक सुरक्षा बिंदु' : 'Rollback Restore Point'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                {snapshot.label}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snapshot Details Card */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center text-gray-300">
            <span className="text-gray-400">{isHindi ? 'स्नैपशॉट आईडी:' : 'Snapshot ID:'}</span>
            <span className="font-mono text-[#d4af37]">{snapshot.id}</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span className="text-gray-400">{isHindi ? 'निर्माण समय:' : 'Captured Time:'}</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span className="text-gray-400">{isHindi ? 'लक्षित बैकअप:' : 'Target Backup:'}</span>
            <span className="font-mono text-gray-200">{snapshot.targetBackupId}</span>
          </div>
        </div>

        {/* Confirmation Warning */}
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs sm:text-sm text-amber-200 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{isHindi ? 'क्या आप इस स्थिति में वापस लौटना चाहते हैं?' : 'Revert to this previous snapshot?'}</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed pl-6">
            {isHindi 
              ? 'यह क्रिया आपके वर्तमान डेटा (रिपोर्ट, दैनंदिनी, सेटिंग्स) को उस पूर्व स्थिति में बदल देगी जो पुनर्स्थापना से ठीक पहले थी। आपका स्वामी पिन (PIN) सुरक्षित रहेगा।'
              : 'This action will restore application state to exactly how it was prior to the target restore. Your Owner PIN remains protected.'}
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 text-gray-300 text-xs sm:text-sm font-semibold hover:bg-white/20 transition-all cursor-pointer"
          >
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleRollback}
            disabled={isExecuting}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs sm:text-sm font-bold hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isHindi ? 'रोलबैक हो रहा है...' : 'Reverting...'}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isHindi ? 'तत्काल रोलबैक करें' : 'Rollback Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
