import React, { useState } from 'react';
import { 
  BackupManifest, 
  RestoreOptions 
} from '../../types/backup';
import { BackupValidationService } from '../../services/backup/backupValidationService';
import { RestoreService } from '../../services/backup/restoreService';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  FileCheck, 
  RotateCcw,
  Check
} from 'lucide-react';
import { useTranslation } from '../../i18n';

interface RestoreDialogProps {
  manifest: BackupManifest;
  onClose: () => void;
  onSuccess: (message: string) => void;
  showToast: (msg: string) => void;
}

export const RestoreDialog: React.FC<RestoreDialogProps> = ({
  manifest,
  onClose,
  onSuccess,
  showToast,
}) => {
  const { language } = useTranslation();
  const isHindi = language === 'hi' || language === 'mr';

  const [options, setOptions] = useState<RestoreOptions>({
    restoreMasterProfile: true,
    restoreFamilyProfiles: true,
    restoreJournalAndWellness: true,
    restoreReportCards: true,
    restorePrashnaHistory: true,
    restoreSettings: true,
    restoreOwnerConfig: true,
    createPreRestoreRollback: true,
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validation report
  const validation = BackupValidationService.validateBackup(manifest);
  const preview = RestoreService.previewRestore(manifest, options);

  const handleToggle = (key: keyof RestoreOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setErrorMsg(null);
    try {
      const result = await RestoreService.executeRestore(manifest, options);
      if (result.success) {
        showToast(result.message);
        onSuccess(result.message);
        onClose();
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'पुनर्स्थापना में अप्रत्याशित त्रुटि आई।');
    } finally {
      setIsExecuting(false);
    }
  };

  const payload = manifest.payload;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-[#081a12] border-2 border-[#d4af37]/60 rounded-3xl p-5 sm:p-7 shadow-[0_0_40px_rgba(212,175,55,0.25)] space-y-5 text-white my-auto max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center text-[#d4af37] flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#d4af37] flex items-center gap-2">
                {isHindi ? 'डेटा पुनर्स्थापना विज़ार्ड' : 'Data Restore Wizard'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                {manifest.label} ({manifest.id})
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

        {/* Security & Validation Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-[#d4af37]/30 space-y-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isHindi ? 'सुरक्षा सत्यापन: संवेदनशील कुंजियाँ अपवर्जित' : 'Security Audit: Sensitive Credentials Excluded'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-gray-300">
              <FileCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{manifest.checksum}</span>
            </div>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            {manifest.exclusions.noticeHi}
          </p>
        </div>

        {/* Categories Selection */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-[#d4af37] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
            <span>{isHindi ? 'पुनर्स्थापित करने हेतु श्रेणियाँ चुनें:' : 'Select Categories to Restore:'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Master Profile */}
            {payload.masterProfile && (
              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  options.restoreMasterProfile 
                    ? 'bg-[#0a2618]/60 border-[#d4af37] text-white' 
                    : 'bg-black/20 border-white/10 text-gray-400'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={options.restoreMasterProfile} 
                  onChange={() => handleToggle('restoreMasterProfile')}
                  className="mt-1 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {isHindi ? 'मास्टर जन्म प्रोफ़ाइल' : 'Master Birth Profile'}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {payload.masterProfile.name} • {payload.masterProfile.dob}
                  </p>
                </div>
              </label>
            )}

            {/* Daily Reports */}
            {Array.isArray(payload.dailyReportCards) && payload.dailyReportCards.length > 0 && (
              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  options.restoreReportCards 
                    ? 'bg-[#0a2618]/60 border-[#d4af37] text-white' 
                    : 'bg-black/20 border-white/10 text-gray-400'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={options.restoreReportCards} 
                  onChange={() => handleToggle('restoreReportCards')}
                  className="mt-1 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {isHindi ? 'दैनिक रिपोर्ट कार्ड' : 'Daily Report Cards'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {payload.dailyReportCards.length} {isHindi ? 'दैनिक रिकॉर्ड्स' : 'Records'}
                  </p>
                </div>
              </label>
            )}

            {/* Prashna History */}
            {Array.isArray(payload.prashnaHistory) && payload.prashnaHistory.length > 0 && (
              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  options.restorePrashnaHistory 
                    ? 'bg-[#0a2618]/60 border-[#d4af37] text-white' 
                    : 'bg-black/20 border-white/10 text-gray-400'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={options.restorePrashnaHistory} 
                  onChange={() => handleToggle('restorePrashnaHistory')}
                  className="mt-1 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {isHindi ? 'वैदिक प्रश्न इतिहास' : 'Vedic Prashna History'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {payload.prashnaHistory.length} {isHindi ? 'पूछे गए प्रश्न' : 'Prashna Queries'}
                  </p>
                </div>
              </label>
            )}

            {/* Journal & Wellness */}
            {payload.lifeJournalAndWellness && (
              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  options.restoreJournalAndWellness 
                    ? 'bg-[#0a2618]/60 border-[#d4af37] text-white' 
                    : 'bg-black/20 border-white/10 text-gray-400'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={options.restoreJournalAndWellness} 
                  onChange={() => handleToggle('restoreJournalAndWellness')}
                  className="mt-1 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {isHindi ? 'दैनंदिनी एवं संवेदनशीलता' : 'Journal & Wellness'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {payload.lifeJournalAndWellness.sensitivities?.length || 0} {isHindi ? 'संवेदनशीलता प्रविष्टियां' : 'Sensitivities'}
                  </p>
                </div>
              </label>
            )}

            {/* Routine & Settings */}
            {payload.settings && (
              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  options.restoreSettings 
                    ? 'bg-[#0a2618]/60 border-[#d4af37] text-white' 
                    : 'bg-black/20 border-white/10 text-gray-400'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={options.restoreSettings} 
                  onChange={() => handleToggle('restoreSettings')}
                  className="mt-1 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {isHindi ? 'प्रातः संस्कार एवं सेटिंग्स' : 'Routine & Settings'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {payload.settings.selectedLanguage ? `भाषा: ${payload.settings.selectedLanguage}` : 'ध्वनि व संस्कार'}
                  </p>
                </div>
              </label>
            )}

            {/* Guardian Policies */}
            {payload.ownerConfigSafe && (
              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  options.restoreOwnerConfig 
                    ? 'bg-[#0a2618]/60 border-[#d4af37] text-white' 
                    : 'bg-black/20 border-white/10 text-gray-400'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={options.restoreOwnerConfig} 
                  onChange={() => handleToggle('restoreOwnerConfig')}
                  className="mt-1 rounded text-[#d4af37] focus:ring-0 accent-[#d4af37]"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {isHindi ? 'संरक्षक नियंत्रण नीतियां' : 'Guardian Policies'}
                  </p>
                  <p className="text-[11px] text-emerald-400">
                    {isHindi ? 'पिन सुरक्षित रहेगा' : 'PIN will be preserved'}
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Safety Rollback Option (CRITICAL SAFEGUARD) */}
        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox"
              checked={options.createPreRestoreRollback}
              onChange={() => handleToggle('createPreRestoreRollback')}
              className="rounded text-amber-500 focus:ring-0 accent-amber-500"
            />
            <span className="text-xs sm:text-sm font-bold text-amber-300">
              {isHindi ? 'पूर्व-पुनर्स्थापना रोलबैक बिंदु स्वतः बनाएं (अनुशंसित)' : 'Create Pre-Restore Rollback Point (Recommended)'}
            </span>
          </label>
          <p className="text-[11px] text-gray-300 pl-7 leading-relaxed">
            {isHindi 
              ? 'पुनर्स्थापना से ठीक पहले वर्तमान स्थिति का एक सुरक्षित स्नैपशॉट लिया जाएगा, जिससे आप कभी भी 1-क्लिक में वापस आ सकते हैं।'
              : 'A safety snapshot of your current state will be saved right before restoring, allowing 1-click reversal anytime.'}
          </p>
        </div>

        {/* Error notification if any */}
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
            onClick={handleExecute}
            disabled={isExecuting || preview.willRestore.length === 0}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black text-xs sm:text-sm font-bold hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isHindi ? 'पुनर्स्थापित हो रहा है...' : 'Restoring...'}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isHindi ? 'पुनर्स्थापना आरंभ करें' : 'Execute Restore'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
