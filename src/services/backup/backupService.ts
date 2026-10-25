import { 
  BackupManifest, 
  BackupPayload, 
  BackupType, 
  RestoreOptions 
} from '../../types/backup';
import { BackupValidationService } from './backupValidationService';
import { BackupStorageService } from './backupStorageService';
import { getOwnerControlConfig } from '../guardian/guardianConfig';
import { addAuditLog } from '../guardian/guardianApprovalService';
import { getStoredLanguage } from '../../i18n';
import { BirthProfile } from '../../types/kundli';

export class BackupService {
  /**
   * Captures the current application state into a sanitized, secret-free BackupPayload.
   */
  public static gatherCurrentPayload(options?: Partial<RestoreOptions>): BackupPayload {
    const payload: BackupPayload = {};
    if (typeof window === 'undefined') return payload;

    const includeAll = !options;

    // 1. Master Profile
    if (includeAll || options?.restoreMasterProfile) {
      try {
        const storedMaster = localStorage.getItem('jeevandarpan_master_profile');
        if (storedMaster) {
          payload.masterProfile = JSON.parse(storedMaster);
        } else {
          // Default deterministic Jitendra Suryavanshi profile
          payload.masterProfile = {
            name: 'Jitendra Suryavanshi',
            dob: '24 June 1986',
            time: '06:20 AM',
            place: 'Indore, MP',
            latitude: 22.7196,
            longitude: 75.8577,
            timezone: 'Asia/Kolkata',
          };
        }
      } catch {
        // Fallback default
      }
    }

    // 2. Family Profiles
    if (includeAll || options?.restoreFamilyProfiles) {
      try {
        const storedFamily = localStorage.getItem('jeevandarpan_family_profiles');
        if (storedFamily) {
          payload.familyProfiles = JSON.parse(storedFamily);
        }
      } catch {
        payload.familyProfiles = [];
      }
    }

    // 2.1 Active Profile ID
    if (includeAll || options?.restoreMasterProfile || options?.restoreFamilyProfiles) {
      try {
        const storedActiveId = localStorage.getItem('jeevandarpan_active_profile_id');
        payload.activeProfileId = storedActiveId || 'master';
      } catch {
        payload.activeProfileId = 'master';
      }
    }

    // 3. Life Journal & Wellness
    if (includeAll || options?.restoreJournalAndWellness) {
      try {
        const rawWellness = localStorage.getItem('jeevandarpan_user_wellness');
        if (rawWellness) {
          payload.lifeJournalAndWellness = JSON.parse(rawWellness);
        }
      } catch {
        payload.lifeJournalAndWellness = {};
      }
    }

    // 4. Daily Report Cards History
    if (includeAll || options?.restoreReportCards) {
      try {
        const rawReports = localStorage.getItem('jeevandarpan_daily_reports');
        if (rawReports) {
          payload.dailyReportCards = JSON.parse(rawReports);
        }
      } catch {
        payload.dailyReportCards = [];
      }
    }

    // 5. Prashna History
    if (includeAll || options?.restorePrashnaHistory) {
      try {
        const rawPrashna = localStorage.getItem('jeevandarpan_prashna_history');
        if (rawPrashna) {
          payload.prashnaHistory = JSON.parse(rawPrashna);
        }
      } catch {
        payload.prashnaHistory = [];
      }
    }

    // 6. Settings (Language, Voice, Pratah, Notifications)
    if (includeAll || options?.restoreSettings) {
      const settings: Record<string, any> = {};
      try {
        settings.selectedLanguage = getStoredLanguage();
        settings.voiceSpeed = localStorage.getItem('jeevandarpan_voice_speed') || 'normal';
        
        const rawNotif = localStorage.getItem('jeevandarpan_companion_notifications');
        if (rawNotif) settings.notifications = JSON.parse(rawNotif);

        const rawPratah = localStorage.getItem('jeevandarpan_pratah_settings');
        if (rawPratah) settings.pratahSettings = JSON.parse(rawPratah);

        // Gather recent Pratah progress keys
        const pratahProgressMap: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('jeevandarpan_pratah_progress_')) {
            const val = localStorage.getItem(key);
            if (val) {
              try {
                pratahProgressMap[key] = JSON.parse(val);
              } catch {
                pratahProgressMap[key] = val;
              }
            }
          }
        }
        settings.pratahProgress = pratahProgressMap;
      } catch {
        // Continue
      }
      payload.settings = settings;
    }

    // 7. Safe Owner Configuration — STRICTLY EXCLUDING ALL SECRETS!
    if (includeAll || options?.restoreOwnerConfig) {
      try {
        const fullCfg = getOwnerControlConfig();
        // Deep copy and explicitly wipe security credentials
        const safeCfg = JSON.parse(JSON.stringify(fullCfg));
        if (safeCfg.securityControls) {
          safeCfg.securityControls.ownerPinCode = ''; // Wipe PIN!
        }
        payload.ownerConfigSafe = safeCfg;
      } catch {
        // Continue
      }
    }

    return payload;
  }

  /**
   * Creates a complete, versioned, secret-free Backup Manifest.
   */
  public static createFullBackup(label?: string, description?: string): BackupManifest {
    return this.buildManifest({
      backupType: 'FULL',
      label: label || `पूर्ण बैकअप ${new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`,
      description: description || 'जीवनदर्पण का संपूर्ण व्यक्तिगत डेटा, रिपोर्ट कार्ड, दैनंदिनी एवं प्राथमिकताएं',
    });
  }

  /**
   * Creates a selective backup with only user-specified categories.
   */
  public static createSelectiveBackup(
    options: Partial<RestoreOptions>,
    label?: string,
    description?: string
  ): BackupManifest {
    return this.buildManifest({
      backupType: 'SELECTIVE',
      label: label || `चयनात्मक बैकअप ${new Date().toLocaleTimeString()}`,
      description: description || 'उपयोगकर्ता द्वारा चुनी गई श्रेणियों का सुरक्षित बैकअप',
      options,
    });
  }

  /**
   * Internal generator for BackupManifest
   */
  private static buildManifest(params: {
    backupType: BackupType;
    label: string;
    description?: string;
    options?: Partial<RestoreOptions>;
  }): BackupManifest {
    const payload = this.gatherCurrentPayload(params.options);
    const checksum = BackupValidationService.calculateChecksum(payload);
    const jsonStr = JSON.stringify(payload);
    const sizeBytes = new TextEncoder().encode(jsonStr).length;

    const reportCount = Array.isArray(payload.dailyReportCards) ? payload.dailyReportCards.length : 0;
    const prashnaCount = Array.isArray(payload.prashnaHistory) ? payload.prashnaHistory.length : 0;
    const sensitivityCount = payload.lifeJournalAndWellness?.sensitivities?.length || 0;

    const now = new Date();
    const manifest: BackupManifest = {
      schemaVersion: '1.0.0',
      backupVersion: '2026.09.v1',
      id: `bkp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now.toISOString(),
      appIdentifier: 'JeevanDarpan-Private-Family-Edition',
      label: params.label,
      description: params.description,
      backupType: params.backupType,
      checksum,
      sizeBytes,
      metadata: {
        deviceLanguage: getStoredLanguage(),
        appVersion: 'JeevanDarpan Private Family Edition 1.0',
        recordCounts: {
          reports: reportCount,
          prashna: prashnaCount,
          reflections: reportCount,
          sensitivities: sensitivityCount,
          settings: payload.settings ? Object.keys(payload.settings).length : 0,
          profiles: 1 + (payload.familyProfiles?.length || 0),
        },
      },
      exclusions: {
        sensitiveCredentialsExcluded: true,
        excludedKeys: [
          'OWNER_PIN',
          'ownerPinCode',
          'GUARDIAN_SECRET_KEY',
          'API_KEYS',
          'GEMINI_API_KEY',
          'sessionTokens',
          'jeevandarpan_owner_token',
          'privateCredentials',
        ],
        noticeEn: 'Sensitive credentials excluded (OWNER_PIN, GUARDIAN_SECRET_KEY, API keys, authentication passwords, session tokens, access tokens, server credentials, private encryption keys, environment secrets).',
        noticeHi: 'संवेदनशील सुरक्षा कुंजियाँ बैकअप में शामिल नहीं की गईं (पिन, पासवर्ड, टोकन, एपीआई कीज, गुप्त कुंजियाँ)।',
      },
      payload,
    };

    // Store manifest
    BackupStorageService.saveBackup(manifest);

    // Audit log
    addAuditLog({
      action: 'BACKUP_CREATED',
      actor: 'Owner',
      details: `Created ${manifest.backupType} backup "${manifest.label}" (${manifest.id}, ${(manifest.sizeBytes / 1024).toFixed(1)} KB)`,
      severity: 'INFO',
    });

    return manifest;
  }
}
