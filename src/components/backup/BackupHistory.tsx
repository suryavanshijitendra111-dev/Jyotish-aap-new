import React, { useState } from 'react';
import { BackupManifest } from '../../types/backup';
import { 
  Download, 
  FileText, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
  Calendar, 
  Database, 
  HardDrive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../../i18n';

interface BackupHistoryProps {
  backups: BackupManifest[];
  onRestore: (manifest: BackupManifest) => void;
  onExportJson: (manifest: BackupManifest) => void;
  onGeneratePdf: (manifest: BackupManifest) => void;
  onDelete: (id: string) => void;
}

export const BackupHistory: React.FC<BackupHistoryProps> = ({
  backups,
  onRestore,
  onExportJson,
  onGeneratePdf,
  onDelete,
}) => {
  const { language } = useTranslation();
  const isHindi = language === 'hi' || language === 'mr';
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (backups.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-2xl bg-black/30 border border-white/10 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mx-auto">
          <Database className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white">
          {isHindi ? 'कोई बैकअप रिकॉर्ड नहीं मिला' : 'No Backups Stored Yet'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          {isHindi 
            ? 'ऊपर दिए गए बटन से पहला संपूर्ण या चयनात्मक बैकअप बनाएं, अथवा पूर्व में डाउनलोड की गई JSON फ़ाइल को यहाँ लोड करें।' 
            : 'Create your first full or selective backup using the buttons above, or import an existing JSON backup file.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {backups.map((b) => {
        const dateStr = new Date(b.createdAt).toLocaleString(isHindi ? 'hi-IN' : 'en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
        const sizeKb = (b.sizeBytes / 1024).toFixed(1);
        const isConfirmingDelete = deleteConfirmId === b.id;

        return (
          <div
            key={b.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#06170e]/80 border border-white/10 hover:border-[#d4af37]/50 transition-all space-y-3 group backdrop-blur-sm"
          >
            {/* Top Row */}
            <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#d4af37] transition-colors">
                    {b.label}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    b.backupType === 'FULL' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : b.backupType === 'SELECTIVE' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {b.backupType}
                  </span>
                </div>
                {b.description && (
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {b.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono flex-wrap pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#d4af37]" />
                    {dateStr}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-[#d4af37]" />
                    {sizeKb} KB
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {b.checksum}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                <button
                  onClick={() => onRestore(b)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                  title={isHindi ? 'इस बैकअप से डेटा पुनर्स्थापित करें' : 'Restore from this backup'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'पुनर्स्थापित करें' : 'Restore'}</span>
                </button>

                <button
                  onClick={() => onGeneratePdf(b)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold hover:bg-[#d4af37]/25 transition-all flex items-center gap-1.5 cursor-pointer"
                  title={isHindi ? 'सत्यापित पीडीएफ रिपोर्ट डाउनलोड करें' : 'Download Verified PDF Manifest'}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => onExportJson(b)}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-xs font-semibold hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  title={isHindi ? 'JSON फ़ाइल डाउनलोड करें' : 'Download JSON file'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>

                {isConfirmingDelete ? (
                  <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/50 p-1 rounded-xl">
                    <button
                      onClick={() => {
                        onDelete(b.id);
                        setDeleteConfirmId(null);
                      }}
                      className="min-h-[44px] px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      {isHindi ? 'पुष्टि' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="min-h-[44px] px-2.5 py-1.5 text-gray-300 text-xs hover:text-white cursor-pointer"
                    >
                      {isHindi ? 'रद्द' : 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(b.id)}
                    className="min-h-[44px] w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                    title={isHindi ? 'बैकअप हटाएं' : 'Delete backup'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Inventory badges */}
            <div className="pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap text-[11px]">
              {b.metadata.recordCounts.reports > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/5">
                  {b.metadata.recordCounts.reports} {isHindi ? 'दैनिक रिपोर्ट्स' : 'Reports'}
                </span>
              )}
              {b.metadata.recordCounts.prashna > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/5">
                  {b.metadata.recordCounts.prashna} {isHindi ? 'वैदिक प्रश्न' : 'Prashna'}
                </span>
              )}
              {b.payload.masterProfile && (
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/5">
                  {isHindi ? 'मास्टर प्रोफ़ाइल' : 'Master Profile'}: {b.payload.masterProfile.name}
                </span>
              )}
              {b.metadata.recordCounts.sensitivities > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/5">
                  {b.metadata.recordCounts.sensitivities} {isHindi ? 'संवेदनशीलता प्रविष्टियां' : 'Sensitivities'}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {isHindi ? 'संवेदनशील कुंजियाँ अपवर्जित' : 'Credentials Excluded'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
