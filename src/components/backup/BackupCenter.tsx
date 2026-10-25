import React, { useState, useEffect, useRef } from 'react';
import { 
  BackupManifest, 
  RollbackSnapshot, 
  RestoreOptions 
} from '../../types/backup';
import { BackupService } from '../../services/backup/backupService';
import { BackupStorageService } from '../../services/backup/backupStorageService';
import { BackupPdfService } from '../../services/backup/backupPdfService';
import { BackupValidationService } from '../../services/backup/backupValidationService';
import { BackupHistory } from './BackupHistory';
import { RestoreDialog } from './RestoreDialog';
import { RollbackDialog } from './RollbackDialog';
import { 
  Database, 
  PlusCircle, 
  Upload, 
  ShieldCheck, 
  RotateCcw, 
  Lock, 
  Calendar, 
  FileText,
  CheckCircle2,
  X,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { getBackupTranslations } from '../../i18n/locales/backupLocales';

interface BackupCenterProps {
  onBack?: () => void;
  showToast: (msg: string) => void;
}

export const BackupCenter: React.FC<BackupCenterProps> = ({ onBack, showToast }) => {
  const { language } = useTranslation();
  const isHindi = language === 'hi' || language === 'mr';
  const backupT = getBackupTranslations(language);

  const [backups, setBackups] = useState<BackupManifest[]>(() => BackupStorageService.getStoredBackups());
  const [rollbacks, setRollbacks] = useState<RollbackSnapshot[]>(() => BackupStorageService.getRollbackSnapshots());
  const [activeSubTab, setActiveSubTab] = useState<'backups' | 'rollbacks' | 'security'>('backups');

  // Modals state
  const [activeRestoreManifest, setActiveRestoreManifest] = useState<BackupManifest | null>(null);
  const [activeRollbackSnapshot, setActiveRollbackSnapshot] = useState<RollbackSnapshot | null>(null);
  const [showSelectiveModal, setShowSelectiveModal] = useState(false);

  // File upload input ref & Drag state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Selective backup form state
  const [selectiveOptions, setSelectiveOptions] = useState<Partial<RestoreOptions>>({
    restoreMasterProfile: true,
    restoreFamilyProfiles: true,
    restoreJournalAndWellness: true,
    restoreReportCards: true,
    restorePrashnaHistory: true,
    restoreSettings: true,
    restoreOwnerConfig: true,
  });
  const [selectiveLabel, setSelectiveLabel] = useState('');

  // Sync with storage events
  useEffect(() => {
    const handleBackupsUpdated = () => {
      setBackups(BackupStorageService.getStoredBackups());
    };
    const handleRollbacksUpdated = () => {
      setRollbacks(BackupStorageService.getRollbackSnapshots());
    };

    window.addEventListener('jeevandarpan_backups_updated', handleBackupsUpdated);
    window.addEventListener('jeevandarpan_rollbacks_updated', handleRollbacksUpdated);

    return () => {
      window.removeEventListener('jeevandarpan_backups_updated', handleBackupsUpdated);
      window.removeEventListener('jeevandarpan_rollbacks_updated', handleRollbacksUpdated);
    };
  }, []);

  // 1. Full Backup Action: Create -> Validate -> Checksum -> Download
  const handleCreateFullBackup = () => {
    setIsProcessing(true);
    try {
      const manifest = BackupService.createFullBackup();
      const validation = BackupValidationService.validateBackup(manifest);
      if (!validation.valid) {
        showToast(isHindi ? `बैकअप अमान्य: ${validation.errors.join(', ')}` : `Backup invalid: ${validation.errors.join(', ')}`);
        return;
      }
      BackupStorageService.exportBackupToJsonFile(manifest);
      setBackups(BackupStorageService.getStoredBackups());
      showToast(`${backupT.backupSuccess}: ${manifest.label}`);
    } catch (err: any) {
      showToast(err?.message || (isHindi ? 'बैकअप निर्माण में विफलता' : 'Failed to create backup'));
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. PDF Report Action: Generate actual PDF -> Verify -> Download
  const handleGeneratePdfReport = async () => {
    setIsProcessing(true);
    try {
      let target = backups[0];
      if (!target) {
        target = BackupService.createFullBackup();
        setBackups(BackupStorageService.getStoredBackups());
      }
      showToast(backupT.generatingPdf);
      const res = await BackupPdfService.generateBackupPdfReport(target);
      if (res.success) {
        showToast(`${backupT.pdfReady}: ${res.filename}`);
      } else {
        showToast(isHindi ? 'PDF निर्माण में विफलता' : 'Failed to generate PDF');
      }
    } catch (err: any) {
      showToast(err?.message || (isHindi ? 'PDF निर्माण में विफलता' : 'Failed to generate PDF'));
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Trigger Restore Action
  const handleTriggerRestore = () => {
    if (backups.length > 0) {
      setActiveRestoreManifest(backups[0]);
    } else {
      fileInputRef.current?.click();
    }
  };

  // 4. Trigger Rollback View Action
  const handleViewRollbacks = () => {
    if (rollbacks.length > 0) {
      setActiveRollbackSnapshot(rollbacks[0]);
    } else {
      setActiveSubTab('rollbacks');
    }
  };

  // Selective Backup
  const handleCreateSelectiveBackup = () => {
    setIsProcessing(true);
    try {
      const manifest = BackupService.createSelectiveBackup(
        selectiveOptions,
        selectiveLabel || undefined
      );
      setBackups(BackupStorageService.getStoredBackups());
      setShowSelectiveModal(false);
      setSelectiveLabel('');
      showToast(isHindi ? `चयनात्मक बैकअप निर्मित: ${manifest.label}` : `Selective backup created: ${manifest.label}`);
    } catch (err: any) {
      showToast(err?.message || (isHindi ? 'चयनात्मक बैकअप निर्माण में विफलता' : 'Failed to create selective backup'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle File Upload (.json)
  const handleFileSelected = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      showToast(isHindi ? 'कृपया केवल वैध .json बैकअप फ़ाइल चुनें' : 'Please select a valid .json backup file');
      return;
    }

    setIsProcessing(true);
    try {
      const manifest = await BackupStorageService.importBackupFromJsonFile(file);
      BackupStorageService.saveBackup(manifest);
      setBackups(BackupStorageService.getStoredBackups());
      showToast(isHindi ? `बैकअप फ़ाइल सफलतापूर्वक लोड की गई: ${manifest.label}` : `Backup imported successfully: ${manifest.label}`);
      setActiveRestoreManifest(manifest);
    } catch (err: any) {
      showToast(err?.message || (isHindi ? 'फ़ाइल सत्यापन विफल रहा' : 'File verification failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Export JSON file
  const handleExportJson = (manifest: BackupManifest) => {
    BackupStorageService.exportBackupToJsonFile(manifest);
    showToast(isHindi ? `JSON डाउनलोड आरंभ: ${manifest.id}` : `JSON download started: ${manifest.id}`);
  };

  // Generate PDF report from specific manifest
  const handleGeneratePdf = async (manifest: BackupManifest) => {
    showToast(backupT.generatingPdf);
    try {
      const res = await BackupPdfService.generateBackupPdfReport(manifest);
      if (res.success) {
        showToast(`${backupT.pdfReady}: ${res.filename}`);
      }
    } catch (err: any) {
      showToast(err?.message || (isHindi ? 'PDF निर्माण में विफलता' : 'Failed to generate PDF'));
    }
  };

  // Delete Backup
  const handleDeleteBackup = (id: string) => {
    const success = BackupStorageService.deleteBackup(id);
    if (success) {
      setBackups(BackupStorageService.getStoredBackups());
      showToast(isHindi ? 'बैकअप रिकॉर्ड हटा दिया गया' : 'Backup record deleted');
    }
  };

  // Delete Rollback Snapshot
  const handleDeleteRollback = (id: string) => {
    const success = BackupStorageService.deleteRollbackSnapshot(id);
    if (success) {
      setRollbacks(BackupStorageService.getRollbackSnapshots());
      showToast(isHindi ? 'रोलबैक स्नैपशॉट हटा दिया गया' : 'Rollback snapshot deleted');
    }
  };

  const latestBackup = backups[0];

  return (
    <div className="space-y-6">
      {/* Hidden File Input for JSON Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
          e.target.value = '';
        }}
      />

      {/* 🏛️ Main Header Banner */}
      <div className="bg-[#0a1812]/95 border border-[#d4af37]/40 rounded-3xl p-5 sm:p-6 backdrop-blur-md relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)] space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs font-semibold">{backupT.back}</span>
              </button>
            )}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4af37]/30 to-[#082218] border border-[#d4af37] flex items-center justify-center text-[#d4af37] flex-shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <Database className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-[#d4af37] truncate">
                {backupT.backupCenterTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5 leading-relaxed">
                {backupT.backupCenterSubtitle}
              </p>
            </div>
          </div>

          {/* Top Quick Secondary Actions */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <button
              onClick={() => setShowSelectiveModal(true)}
              className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] text-xs sm:text-sm font-semibold hover:bg-[#d4af37]/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{backupT.selective}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-xs sm:text-sm font-semibold hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span>{backupT.importJson}</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileSelected(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`p-3.5 sm:p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-3 text-center min-h-[44px] ${
            isDragging 
              ? 'bg-[#d4af37]/10 border-[#d4af37] scale-[0.99]' 
              : 'bg-black/20 border-white/15 hover:border-[#d4af37]/40'
          }`}
        >
          <Upload className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-300">
            {backupT.dragDropNotice}
          </span>
        </div>
      </div>

      {/* 🎴 SECTION 2: THE FOUR LARGE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: पूर्ण बैकअप */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0a1812] to-[#040e0a] border border-[#d4af37]/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between space-y-4 hover:border-[#d4af37] transition-all">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37]">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {backupT.fullBackupTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed min-h-[36px]">
              {backupT.fullBackupDesc}
            </p>
          </div>
          <button
            onClick={handleCreateFullBackup}
            disabled={isProcessing}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89528] hover:opacity-90 text-black font-bold text-sm transition-all cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{backupT.createBackupBtn}</span>
          </button>
        </div>

        {/* Card 2: PDF बैकअप रिपोर्ट */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0a1812] to-[#040e0a] border border-[#d4af37]/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between space-y-4 hover:border-[#d4af37] transition-all">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {backupT.pdfReportTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed min-h-[36px]">
              {backupT.pdfReportDesc}
            </p>
          </div>
          <button
            onClick={handleGeneratePdfReport}
            disabled={isProcessing}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/60 hover:bg-[#d4af37]/30 text-[#d4af37] font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(212,175,55,0.15)]"
          >
            <FileText className="w-4 h-4" />
            <span>{backupT.createPdfBtn}</span>
          </button>
        </div>

        {/* Card 3: पुनर्स्थापित करें */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0a1812] to-[#040e0a] border border-[#d4af37]/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between space-y-4 hover:border-[#d4af37] transition-all">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {backupT.restoreTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed min-h-[36px]">
              {backupT.restoreDesc}
            </p>
          </div>
          <button
            onClick={handleTriggerRestore}
            disabled={isProcessing}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{backupT.restoreBtn}</span>
          </button>
        </div>

        {/* Card 4: सुरक्षा Snapshot */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0a1812] to-[#040e0a] border border-[#d4af37]/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between space-y-4 hover:border-[#d4af37] transition-all">
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {backupT.securitySnapshotTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed min-h-[36px]">
              {backupT.securitySnapshotDesc}
            </p>
          </div>
          <button
            onClick={handleViewRollbacks}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{backupT.viewBtn}</span>
          </button>
        </div>
      </div>

      {/* 📊 SECTION 3: BACKUP STATUS */}
      {latestBackup ? (
        <div className="p-5 rounded-2xl bg-[#0a1812]/90 border border-[#d4af37]/35 shadow-[0_0_20px_rgba(0,0,0,0.4)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#d4af37]" />
              <h4 className="text-sm sm:text-base font-bold text-[#d4af37]">
                {backupT.statusLabel}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/90 border border-emerald-500 text-emerald-300 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{backupT.integrityVerified}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <p className="text-xs text-gray-400 font-medium">{backupT.lastBackup}</p>
              <p className="text-sm font-bold text-white truncate" title={latestBackup.label}>
                {latestBackup.label}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <p className="text-xs text-gray-400 font-medium">{backupT.backupDate}</p>
              <p className="text-sm font-bold text-white">
                {new Date(latestBackup.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <p className="text-xs text-gray-400 font-medium">{backupT.backupSize}</p>
              <p className="text-sm font-bold text-[#d4af37]">
                {(latestBackup.sizeBytes / 1024).toFixed(1)} KB
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <p className="text-xs text-gray-400 font-medium">{backupT.schemaVersion}</p>
              <p className="text-sm font-bold text-white font-mono">
                {latestBackup.schemaVersion || '2.0'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-400 font-medium">{backupT.backupVersion}</p>
              <p className="text-sm font-bold text-white font-mono">
                {latestBackup.backupVersion || '2.0.0'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0a1812]/90 border border-dashed border-[#d4af37]/40 text-center space-y-3">
          <Database className="w-10 h-10 text-gray-500 mx-auto" />
          <p className="text-sm sm:text-base font-semibold text-gray-300">
            {backupT.noBackupAvailable}
          </p>
          <button
            onClick={handleCreateFullBackup}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black font-bold text-sm cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:opacity-90 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{backupT.createBackupBtn}</span>
          </button>
        </div>
      )}

      {/* 🧭 Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('backups')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'backups'
              ? 'bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{isHindi ? 'सक्रिय बैकअप इतिहास' : 'Active Backups'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
            {backups.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('rollbacks')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'rollbacks'
              ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isHindi ? '1-क्लिक रोलबैक स्नैपशॉट' : 'Rollback Points'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
            {rollbacks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'security'
              ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isHindi ? 'सुरक्षा एवं अपवर्जन' : 'Security Exclusions'}</span>
        </button>
      </div>

      {/* Tab 1: Backups History */}
      {activeSubTab === 'backups' && (
        <BackupHistory
          backups={backups}
          onRestore={(manifest) => setActiveRestoreManifest(manifest)}
          onExportJson={handleExportJson}
          onGeneratePdf={handleGeneratePdf}
          onDelete={handleDeleteBackup}
        />
      )}

      {/* Tab 2: Rollbacks Snapshots */}
      {activeSubTab === 'rollbacks' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs sm:text-sm text-amber-200 flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-300">
                {isHindi ? 'स्वचालित पूर्व-पुनर्स्थापना रोलबैक बिंदु' : 'Automated Pre-Restore Rollback Points'}
              </p>
              <p className="text-gray-300 text-xs leading-relaxed">
                {isHindi 
                  ? 'जब भी आप किसी बैकअप को पुनर्स्थापित करते हैं, जीवनदर्पण उस समय की वर्तमान स्थिति का एक सुरक्षित बिंदु स्वतः संजो लेता है। यदि आपको नया डेटा उचित न लगे, तो आप केवल एक क्लिक में वापस पूर्व स्थिति पर लौट सकते हैं।'
                  : 'Whenever you execute a restore, JeevanDarpan automatically snapshots the exact state before changes are applied, giving you a 1-click safety rollback at any time.'}
              </p>
            </div>
          </div>

          {rollbacks.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-black/30 border border-white/10 space-y-3">
              <RotateCcw className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-sm text-gray-300">
                {isHindi ? 'कोई सक्रिय रोलबैक बिंदु उपलब्ध नहीं है।' : 'No rollback points captured yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rollbacks.map((s) => (
                <div
                  key={s.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0a1812]/80 border border-amber-500/30 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {s.label}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-300 font-mono">
                      {s.id} • {new Date(s.timestamp).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {isHindi ? 'लक्षित बैकअप आईडी:' : 'Target Backup ID:'} {s.targetBackupId}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setActiveRollbackSnapshot(s)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'तत्काल रोलबैक' : 'Rollback Now'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRollback(s.id)}
                      className="min-h-[44px] w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Security & Exclusions Policy */}
      {activeSubTab === 'security' && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-red-950/20 border-2 border-red-500/40 space-y-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-red-300">
                  {isHindi ? 'सुरक्षा एवं गोपनीयता घोषणा' : 'Security & Privacy Exclusions'}
                </h2>
                <p className="text-xs text-gray-300">
                  {backupT.sensitiveNotice}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-red-500/30 text-xs sm:text-sm space-y-2">
              <p className="font-bold text-red-200">
                {backupT.sensitiveNotice}
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                {isHindi 
                  ? 'जीवनदर्पण के संरक्षक सुरक्षा मानकों के अंतर्गत निम्नलिखित कुंजियाँ 100% अपवर्जित रहती हैं:'
                  : 'Under JeevanDarpan Guardian security architecture, the following keys are 100% excluded:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-300 pl-1 font-mono">
                <li>OWNER_PIN / ownerPinCode ({isHindi ? 'स्वामी सुरक्षा पिन' : 'Owner PIN'})</li>
                <li>GUARDIAN_SECRET_KEY ({isHindi ? 'संरक्षक मास्टर कुंजी' : 'Guardian Master Key'})</li>
                <li>GEMINI_API_KEY / API Keys ({isHindi ? 'कृत्रिम बुद्धिमत्ता एपीआई कुंजियाँ' : 'AI API Keys'})</li>
                <li>Session Tokens / Auth Passwords ({isHindi ? 'प्रमाणीकरण एवं सत्र टोकन' : 'Session Tokens'})</li>
                <li>Server Credentials & Private Keys ({isHindi ? 'सर्वर क्रेडेंशियल्स' : 'Server credentials'})</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {isHindi 
                  ? 'यह नीति सुनिश्चित करती है कि बैकअप फ़ाइल किसी अन्य डिवाइस पर भी पूर्ण सुरक्षित रहे।' 
                  : 'This policy guarantees your exported files remain safe across personal devices.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Selective Backup Modal */}
      {showSelectiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div 
            className="w-full max-w-lg bg-[#081a12] border-2 border-[#d4af37]/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_35px_rgba(212,175,55,0.2)] space-y-4 text-white my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 text-[#d4af37]" />
                <h3 className="text-base sm:text-lg font-bold text-[#d4af37]">
                  {isHindi ? 'चयनात्मक बैकअप बनाएं' : 'Create Selective Backup'}
                </h3>
              </div>
              <button 
                onClick={() => setShowSelectiveModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">
                {isHindi ? 'बैकअप नाम / लेबल (वैकल्पिक):' : 'Backup Label (Optional):'}
              </label>
              <input
                type="text"
                value={selectiveLabel}
                onChange={(e) => setSelectiveLabel(e.target.value)}
                placeholder={isHindi ? 'उदा. दैनिक रिपोर्ट कार्ड बैकअप' : 'e.g. Daily Reports Backup'}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-[#d4af37]">
                {isHindi ? 'सम्मिलित किए जाने वाले घटक:' : 'Included Categories:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'restoreMasterProfile', label: isHindi ? 'मास्टर प्रोफ़ाइल' : 'Master Profile' },
                  { key: 'restoreReportCards', label: isHindi ? 'दैनिक रिपोर्ट कार्ड' : 'Daily Reports' },
                  { key: 'restorePrashnaHistory', label: isHindi ? 'वैदिक प्रश्न इतिहास' : 'Prashna History' },
                  { key: 'restoreJournalAndWellness', label: isHindi ? 'दैनंदिनी एवं संवेदनशीलता' : 'Journal & Sensitivities' },
                  { key: 'restoreSettings', label: isHindi ? 'प्रातः संस्कार व सेटिंग्स' : 'Routine & Settings' },
                  { key: 'restoreOwnerConfig', label: isHindi ? 'संरक्षक नीतियां (सुरक्षित)' : 'Guardian Policies (Safe)' },
                ].map((item) => (
                  <label 
                    key={item.key}
                    className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center gap-2.5 cursor-pointer text-xs min-h-[44px]"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean((selectiveOptions as any)[item.key])}
                      onChange={() => {
                        setSelectiveOptions(prev => ({
                          ...prev,
                          [item.key]: !Boolean((prev as any)[item.key])
                        }));
                      }}
                      className="rounded text-[#d4af37] accent-[#d4af37]"
                    />
                    <span className="text-gray-200">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowSelectiveModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 text-gray-300 text-xs font-semibold hover:bg-white/20 transition-all cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCreateSelectiveBackup}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black text-xs font-bold hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isHindi ? 'बैकअप निर्मित करें' : 'Build Backup'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Restore Dialog */}
      {activeRestoreManifest && (
        <RestoreDialog
          manifest={activeRestoreManifest}
          onClose={() => setActiveRestoreManifest(null)}
          onSuccess={(msg) => {
            setBackups(BackupStorageService.getStoredBackups());
            setRollbacks(BackupStorageService.getRollbackSnapshots());
          }}
          showToast={showToast}
        />
      )}

      {/* Active Rollback Dialog */}
      {activeRollbackSnapshot && (
        <RollbackDialog
          snapshot={activeRollbackSnapshot}
          onClose={() => setActiveRollbackSnapshot(null)}
          onSuccess={(msg) => {
            setBackups(BackupStorageService.getStoredBackups());
            setRollbacks(BackupStorageService.getRollbackSnapshots());
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};
