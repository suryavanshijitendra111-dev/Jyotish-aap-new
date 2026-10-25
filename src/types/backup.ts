import { BirthProfile } from './kundli';
import { OwnerControlConfig } from './ownerControl';

export type BackupType = 'FULL' | 'SELECTIVE' | 'AUTO_PRE_RESTORE' | 'ROLLBACK_SNAPSHOT';

export interface BackupMetadata {
  deviceLanguage: string;
  appVersion: string;
  userAgent?: string;
  recordCounts: {
    reports: number;
    prashna: number;
    reflections: number;
    sensitivities: number;
    settings: number;
    profiles: number;
  };
}

export interface BackupExclusions {
  sensitiveCredentialsExcluded: boolean;
  excludedKeys: string[];
  noticeEn: string;
  noticeHi: string;
}

export interface BackupPayload {
  masterProfile?: BirthProfile | null;
  familyProfiles?: BirthProfile[];
  activeProfileId?: string;
  lifeJournalAndWellness?: {
    sensitivities?: string[];
    sleepTargetHours?: number;
    hydrationTargetLiters?: number;
    customNotes?: string;
    lastUpdated?: string;
  };
  dailyReportCards?: any[];
  prashnaHistory?: any[];
  settings?: {
    selectedLanguage?: string;
    voiceSpeed?: string;
    notifications?: any;
    pratahSettings?: any;
    pratahProgress?: Record<string, any>;
  };
  ownerConfigSafe?: Partial<OwnerControlConfig>;
  rawApplicationStorage?: Record<string, string>;
}

export interface BackupManifest {
  schemaVersion: '1.0.0';
  backupVersion: string;
  id: string;
  createdAt: string; // ISO string
  appIdentifier: 'JeevanDarpan-Private-Family-Edition';
  label: string;
  description?: string;
  backupType: BackupType;
  checksum: string;
  sizeBytes: number;
  metadata: BackupMetadata;
  exclusions: BackupExclusions;
  payload: BackupPayload;
}

export interface BackupValidationReport {
  valid: boolean;
  status: 'VALID' | 'WARNINGS' | 'INVALID' | 'CORRUPTED';
  errors: string[];
  warnings: string[];
  manifest?: BackupManifest;
  checksumVerified: boolean;
  secretsCheckPassed: boolean;
  detectedItemsSummary: string[];
}

export interface RestoreOptions {
  restoreMasterProfile: boolean;
  restoreFamilyProfiles: boolean;
  restoreJournalAndWellness: boolean;
  restoreReportCards: boolean;
  restorePrashnaHistory: boolean;
  restoreSettings: boolean;
  restoreOwnerConfig: boolean;
  createPreRestoreRollback: boolean;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  restoredCategories: string[];
  rollbackSnapshotId?: string;
  timestamp: number;
}

export interface RollbackSnapshot {
  id: string;
  timestamp: number;
  label: string;
  targetBackupId: string;
  previousStateBackup: BackupManifest;
}
