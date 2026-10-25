import { 
  BackupManifest, 
  RestoreOptions, 
  RestoreResult 
} from '../../types/backup';
import { BackupValidationService } from './backupValidationService';
import { RollbackService } from './rollbackService';
import { addAuditLog } from '../guardian/guardianApprovalService';
import { saveOwnerControlConfig, getOwnerControlConfig } from '../guardian/guardianConfig';

export class RestoreService {
  /**
   * Dry-run preview of what would be restored or skipped based on options.
   */
  public static previewRestore(
    manifest: BackupManifest,
    options: Partial<RestoreOptions> = {}
  ): {
    willRestore: string[];
    willSkip: string[];
    warnings: string[];
  } {
    const willRestore: string[] = [];
    const willSkip: string[] = [];
    const warnings: string[] = [];

    const opt: RestoreOptions = {
      restoreMasterProfile: options.restoreMasterProfile ?? true,
      restoreFamilyProfiles: options.restoreFamilyProfiles ?? true,
      restoreJournalAndWellness: options.restoreJournalAndWellness ?? true,
      restoreReportCards: options.restoreReportCards ?? true,
      restorePrashnaHistory: options.restorePrashnaHistory ?? true,
      restoreSettings: options.restoreSettings ?? true,
      restoreOwnerConfig: options.restoreOwnerConfig ?? true,
      createPreRestoreRollback: options.createPreRestoreRollback ?? true,
    };

    const willRestoreList: string[] = [];
    const willSkipList: string[] = [];

    const payload = manifest.payload;

    if (payload.masterProfile) {
      if (opt.restoreMasterProfile) willRestoreList.push(`मास्टर प्रोफ़ाइल (${payload.masterProfile.name})`);
      else willSkipList.push('मास्टर प्रोफ़ाइल');
    }

    if (payload.familyProfiles && payload.familyProfiles.length > 0) {
      if (opt.restoreFamilyProfiles) willRestoreList.push(`पारिवारिक प्रोफ़ाइल (${payload.familyProfiles.length})`);
      else willSkipList.push('पारिवारिक प्रोफ़ाइल');
    }

    if (payload.lifeJournalAndWellness) {
      if (opt.restoreJournalAndWellness) willRestoreList.push('जीवन दैनंदिनी, संवेदनशीलता एवं लक्ष्य');
      else willSkipList.push('जीवन दैनंदिनी');
    }

    if (payload.dailyReportCards && payload.dailyReportCards.length > 0) {
      if (opt.restoreReportCards) willRestoreList.push(`दैनिक रिपोर्ट कार्ड इतिहास (${payload.dailyReportCards.length})`);
      else willSkipList.push('दैनिक रिपोर्ट कार्ड इतिहास');
    }

    if (payload.prashnaHistory && payload.prashnaHistory.length > 0) {
      if (opt.restorePrashnaHistory) willRestoreList.push(`वैदिक प्रश्न कुंडली इतिहास (${payload.prashnaHistory.length})`);
      else willSkipList.push('वैदिक प्रश्न कुंडली इतिहास');
    }

    if (payload.settings) {
      if (opt.restoreSettings) willRestoreList.push('प्रातः संस्कार, ध्वनि एवं भाषा प्राथमिकताएं');
      else willSkipList.push('प्राथमिकताएं एवं सेटिंग्स');
    }

    if (payload.ownerConfigSafe) {
      if (opt.restoreOwnerConfig) willRestoreList.push('संरक्षक एवं नियंत्रण नीतियां');
      else willSkipList.push('संरक्षक नीतियां');
    }

    return {
      willRestore: willRestoreList,
      willSkip: willSkipList,
      warnings,
    };
  }

  /**
   * Executes restoration from a validated BackupManifest.
   */
  public static async executeRestore(
    manifest: BackupManifest,
    options: RestoreOptions
  ): Promise<RestoreResult> {
    // 1. Validation check
    const validation = BackupValidationService.validateBackup(manifest);
    if (!validation.valid) {
      return {
        success: false,
        message: `पुनर्स्थापना अस्वीकृत: ${validation.errors.join('; ')}`,
        restoredCategories: [],
        timestamp: Date.now(),
      };
    }

    // Log RESTORE_STARTED
    try {
      addAuditLog({
        action: 'RESTORE_STARTED',
        actor: 'Owner',
        details: `Started restore process for backup "${manifest.label}" (${manifest.id})`,
        severity: 'WARN',
      });
    } catch {
      // Safe fallback
    }

    let rollbackSnapshotId: string | undefined;

    // 2. Pre-restore automatic rollback snapshot
    if (options.createPreRestoreRollback) {
      const rollback = RollbackService.createRollbackSnapshot(
        `स्वतः सुरक्षा बिंदु (पूर्व ${manifest.label})`,
        manifest.id
      );
      rollbackSnapshotId = rollback.id;
    }

    const payload = manifest.payload;
    const restoredCategories: string[] = [];

    try {
      // 3. Apply selected categories to localStorage

      // A. Master Birth Profile
      if (options.restoreMasterProfile && payload.masterProfile) {
        localStorage.setItem('jeevandarpan_master_profile', JSON.stringify(payload.masterProfile));
        restoredCategories.push('मास्टर प्रोफ़ाइल');
      }

      // B. Family Profiles
      if (options.restoreFamilyProfiles && payload.familyProfiles) {
        localStorage.setItem('jeevandarpan_family_profiles', JSON.stringify(payload.familyProfiles));
        restoredCategories.push('पारिवारिक प्रोफ़ाइल');
      }

      // B.1 Active Profile ID with Mutual Verification
      if (options.restoreMasterProfile || options.restoreFamilyProfiles) {
        const candidateActiveId = payload.activeProfileId;
        const validFamilyIds = Array.isArray(payload.familyProfiles)
          ? payload.familyProfiles.map((p: any) => p?.id).filter(Boolean)
          : [];
        const masterId = (payload.masterProfile as any)?.id || 'master';
        const allowedIds = new Set<string>(['master', masterId, ...validFamilyIds]);

        if (candidateActiveId && allowedIds.has(candidateActiveId)) {
          localStorage.setItem('jeevandarpan_active_profile_id', candidateActiveId);
        } else {
          localStorage.setItem('jeevandarpan_active_profile_id', 'master');
        }
      }

      // C. Life Journal & Wellness
      if (options.restoreJournalAndWellness && payload.lifeJournalAndWellness) {
        localStorage.setItem('jeevandarpan_user_wellness', JSON.stringify(payload.lifeJournalAndWellness));
        restoredCategories.push('दैनंदिनी एवं संवेदनशीलता');
      }

      // D. Daily Report Cards
      if (options.restoreReportCards && Array.isArray(payload.dailyReportCards)) {
        localStorage.setItem('jeevandarpan_daily_reports', JSON.stringify(payload.dailyReportCards));
        restoredCategories.push('दैनिक रिपोर्ट कार्ड इतिहास');
      }

      // E. Prashna History
      if (options.restorePrashnaHistory && Array.isArray(payload.prashnaHistory)) {
        localStorage.setItem('jeevandarpan_prashna_history', JSON.stringify(payload.prashnaHistory));
        restoredCategories.push('वैदिक प्रश्न कुंडली इतिहास');
      }

      // F. Settings (Language, Voice, Routine, Notifications)
      if (options.restoreSettings && payload.settings) {
        if (payload.settings.selectedLanguage) {
          localStorage.setItem('jeevandarpan_language', payload.settings.selectedLanguage);
        }
        if (payload.settings.voiceSpeed) {
          localStorage.setItem('jeevandarpan_voice_speed', payload.settings.voiceSpeed);
        }
        if (payload.settings.notifications) {
          localStorage.setItem('jeevandarpan_companion_notifications', JSON.stringify(payload.settings.notifications));
        }
        if (payload.settings.pratahSettings) {
          localStorage.setItem('jeevandarpan_pratah_settings', JSON.stringify(payload.settings.pratahSettings));
        }
        if (payload.settings.pratahProgress) {
          for (const [k, v] of Object.entries(payload.settings.pratahProgress)) {
            localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
          }
        }
        restoredCategories.push('प्राथमिकताएं एवं संस्कार सेटिंग्स');
      }

      // G. Safe Owner Configuration — STRICTLY PRESERVING CURRENT PIN
      if (options.restoreOwnerConfig && payload.ownerConfigSafe) {
        const currentConfig = getOwnerControlConfig();
        const currentPin = currentConfig.securityControls?.ownerPinCode || '';
        const mergedConfig = {
          ...payload.ownerConfigSafe,
          securityControls: {
            ...currentConfig.securityControls,
            ownerPinCode: currentPin, // Never overwrite live PIN with backup!
          },
        };
        saveOwnerControlConfig(mergedConfig as any);
        restoredCategories.push('संरक्षक नीतियां');
      }

      // Broadcast update events to UI
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jeevandarpan_data_restored', { detail: { manifestId: manifest.id } }));
        window.dispatchEvent(new CustomEvent('jeevandarpan_reports_updated'));
        window.dispatchEvent(new CustomEvent('jeevandarpan_owner_config_updated'));
      }

      // Log to Audit Log
      try {
        addAuditLog({
          action: 'RESTORE_COMPLETED',
          actor: 'Owner',
          details: `Completed restore of ${restoredCategories.length} categories from backup "${manifest.label}" (${manifest.id})`,
          severity: 'WARN',
        });
      } catch {
        // Safe fallback
      }

      return {
        success: true,
        message: `सफलतापूर्वक डेटा पुनर्स्थापित हुआ! (${restoredCategories.join(', ')})`,
        restoredCategories,
        rollbackSnapshotId,
        timestamp: Date.now(),
      };
    } catch (err: any) {
      try {
        addAuditLog({
          action: 'RESTORE_FAILED',
          actor: 'Owner',
          details: `Restore failed for backup ${manifest.id}: ${err?.message || 'unknown error'}`,
          severity: 'CRITICAL',
        });
      } catch {
        // Safe fallback
      }

      return {
        success: false,
        message: `पुनर्स्थापना में त्रुटि: ${err?.message || 'अज्ञात त्रुटि'}`,
        restoredCategories,
        rollbackSnapshotId,
        timestamp: Date.now(),
      };
    }
  }
}
