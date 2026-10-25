import { RollbackSnapshot, RestoreResult } from '../../types/backup';
import { BackupService } from './backupService';
import { BackupStorageService } from './backupStorageService';
import { addAuditLog } from '../guardian/guardianApprovalService';
import { saveOwnerControlConfig, getOwnerControlConfig } from '../guardian/guardianConfig';

export class RollbackService {
  /**
   * Automatically captures the current state prior to executing any restore or rollback operation.
   */
  public static createRollbackSnapshot(label: string, targetBackupId: string): RollbackSnapshot {
    const currentStateBackup = BackupService.createFullBackup(
      `पूर्व-पुनर्स्थापना स्नैपशॉट (${label})`,
      `यह स्नैपशॉट बैकअप ${targetBackupId} को पुनर्स्थापित करने से ठीक पहले स्वतः लिया गया था।`
    );

    const snapshot: RollbackSnapshot = {
      id: `rb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      label,
      targetBackupId,
      previousStateBackup: currentStateBackup,
    };

    BackupStorageService.saveRollbackSnapshot(snapshot);

    addAuditLog({
      action: 'BACKUP_CREATED',
      actor: 'Guardian Rollback Engine',
      details: `Created pre-restore rollback point "${label}" (${snapshot.id})`,
      severity: 'INFO',
    });

    return snapshot;
  }

  /**
   * Instantly rolls back the application to the previous state captured in a RollbackSnapshot.
   */
  public static async executeRollback(snapshotId: string): Promise<RestoreResult> {
    const snapshots = BackupStorageService.getRollbackSnapshots();
    const found = snapshots.find(s => s.id === snapshotId);

    if (!found) {
      return {
        success: false,
        message: 'रोलबैक स्नैपशॉट नहीं मिला या हटा दिया गया है।',
        restoredCategories: [],
        timestamp: Date.now(),
      };
    }

    try {
      addAuditLog({
        action: 'ROLLBACK_STARTED',
        actor: 'Owner',
        details: `Initiated rollback to snapshot "${found.label}" (${found.id})`,
        severity: 'WARN',
      });
    } catch {
      // Safe fallback
    }

    const payload = found.previousStateBackup.payload;
    const restoredCategories: string[] = [];

    try {
      // 1. Master Profile
      if (payload.masterProfile) {
        localStorage.setItem('jeevandarpan_master_profile', JSON.stringify(payload.masterProfile));
        restoredCategories.push('मास्टर जन्म प्रोफ़ाइल');
      }

      // 2. Family Profiles
      if (payload.familyProfiles) {
        localStorage.setItem('jeevandarpan_family_profiles', JSON.stringify(payload.familyProfiles));
        restoredCategories.push('पारिवारिक प्रोफ़ाइल');
      }

      // 2.1 Active Profile ID with Mutual Verification
      if (payload.masterProfile || payload.familyProfiles) {
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

      // 3. Wellness & Life Journal
      if (payload.lifeJournalAndWellness) {
        localStorage.setItem('jeevandarpan_user_wellness', JSON.stringify(payload.lifeJournalAndWellness));
        restoredCategories.push('दैनंदिनी एवं संवेदनशीलता');
      }

      // 4. Daily Reports
      if (payload.dailyReportCards) {
        localStorage.setItem('jeevandarpan_daily_reports', JSON.stringify(payload.dailyReportCards));
        restoredCategories.push('दैनिक रिपोर्ट कार्ड इतिहास');
      }

      // 5. Prashna History
      if (payload.prashnaHistory) {
        localStorage.setItem('jeevandarpan_prashna_history', JSON.stringify(payload.prashnaHistory));
        restoredCategories.push('वैदिक प्रश्न इतिहास');
      }

      // 6. Settings
      if (payload.settings) {
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

      // 7. Owner Config (Preserving current PIN!)
      if (payload.ownerConfigSafe) {
        const currentConfig = getOwnerControlConfig();
        const currentPin = currentConfig.securityControls?.ownerPinCode || '';
        const mergedConfig = {
          ...payload.ownerConfigSafe,
          securityControls: {
            ...currentConfig.securityControls,
            ownerPinCode: currentPin, // Preserve live PIN
          },
        };
        saveOwnerControlConfig(mergedConfig as any);
        restoredCategories.push('संरक्षक नीतियां');
      }

      // Notify window of state updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jeevandarpan_data_restored', { detail: { snapshotId } }));
        window.dispatchEvent(new CustomEvent('jeevandarpan_reports_updated'));
        window.dispatchEvent(new CustomEvent('jeevandarpan_owner_config_updated'));
      }

      try {
        addAuditLog({
          action: 'ROLLBACK_COMPLETED',
          actor: 'Owner',
          details: `Completed rollback to snapshot "${found.label}" (${found.id})`,
          severity: 'WARN',
        });
      } catch {
        // Safe fallback
      }

      return {
        success: true,
        message: `सफलतापूर्वक रोलबैक पूर्ण हुआ। ${restoredCategories.length} श्रेणियां पूर्व स्थिति में बहाल कर दी गईं।`,
        restoredCategories,
        rollbackSnapshotId: found.id,
        timestamp: Date.now(),
      };
    } catch (err: any) {
      return {
        success: false,
        message: `रोलबैक के दौरान त्रुटि: ${err?.message || 'अज्ञात त्रुटि'}`,
        restoredCategories,
        timestamp: Date.now(),
      };
    }
  }
}
