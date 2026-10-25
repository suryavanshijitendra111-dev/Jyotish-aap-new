export type GuardianLevel = 1 | 2 | 3;

export type ChangeRequestStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLED_BACK';

export type IncidentSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentCategory = 
  | 'RUNTIME'
  | 'UI'
  | 'TRANSLATION'
  | 'AI'
  | 'VOICE'
  | 'TTS'
  | 'API'
  | 'NETWORK'
  | 'DATABASE'
  | 'PERFORMANCE'
  | 'SECURITY'
  | 'CALCULATION'
  | 'UNKNOWN'
  | 'JS_RUNTIME'
  | 'REACT'
  | 'PROMISE';

export interface OwnerControlConfig {
  moduleControls: {
    kundli: boolean;
    numerology: boolean;
    prashna: boolean;
    dailyCompanion: boolean;
    pratahSanskar: boolean;
    dailyReportCard: boolean;
    aiIntelligence: boolean;
    planetSpeaks: boolean;
    panchatattva: boolean;
    wellness: boolean;
  };
  aiControls: {
    enabled: boolean;
    modelSelection: string;
    maxDailyTokens: number;
    requireConfirmationForAiAdvice: boolean;
    allowFamilyInsights: boolean;
  };
  guardianControls: {
    guardianLevel: GuardianLevel;
    activeMonitoringEnabled: boolean;
    autoFixLevel1: boolean;
    notifyOnEveryIncident: boolean;
    haltOnLevel3: boolean;
  };
  voiceControls: {
    enabled: boolean;
    defaultVoiceSpeed: number;
    allowPlanetSpeaks: boolean;
    offlineTtsFallback: boolean;
  };
  languageControls: {
    enabledLanguages: string[];
    defaultLanguage: string;
    allowCustomLanguageSwitch: boolean;
  };
  notificationControls: {
    enabled: boolean;
    dailyReminders: boolean;
    alertSeverityFilter: IncidentSeverity;
  };
  maintenanceControls: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    readOnlyMode: boolean;
    bypassForOwner: boolean;
  };
  securityControls: {
    ownerPinCode: string;
    sessionTimeoutMinutes: number;
    requirePinForProtectedChanges: boolean;
    auditLoggingEnabled: boolean;
  };
}

export interface OwnerApprovalRequest {
  id: string;
  createdAt: number;
  requestedBy: string;
  changeType: string;
  severity: IncidentSeverity;
  affectedFiles: string[];
  description: string;
  reason: string;
  risk: IncidentSeverity;
  backupRequired: boolean;
  status: ChangeRequestStatus;
  approvedAt?: number;
  completedAt?: number;
  result?: string;
  rollbackAvailable: boolean;
  proposedFix?: string;
  expectedResult?: string;
  backupSnapshotId?: string;
}

export type IncidentStateClassification = 
  | 'ACTIVE_RUNTIME_INCIDENT'
  | 'HISTORICAL_INCIDENT'
  | 'RESOLVED_INCIDENT'
  | 'TEST_ONLY_INCIDENT';

export interface GuardianIncident {
  id: string;
  timestamp: number;
  category: IncidentCategory;
  severity: IncidentSeverity;
  title: string;
  description: string;
  affectedModule: string;
  affectedScreen: string;
  errorCode: string;
  sanitizedStack?: string;
  occurrenceCount: number;
  firstSeen: number;
  lastSeen: number;
  status: 'OPEN' | 'INVESTIGATING' | 'FIXED' | 'RESOLVED' | 'IGNORED' | 'APPROVAL_REQUESTED' | 'ROLLED_BACK' | 'HISTORICAL';
  autoFixAllowed: boolean;
  ownerApprovalRequired: boolean;
  suggestedAction: string;
  backupRequired: boolean;
  isSimulation?: boolean;
  isTest?: boolean;
  incidentState?: IncidentStateClassification;
  isHistorical?: boolean;
  resolvedAt?: number;
  resolutionReason?: string;

  // Compatibility aliases
  message?: string;
  stack?: string;
  module?: string;
  screen?: string;
  affectedFeature?: string;
  guardianLevel?: GuardianLevel;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: string;
  actor: string;
  details: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  metadata?: Record<string, any>;
}

export interface BackupSnapshot {
  id: string;
  timestamp: number;
  label: string;
  dataSummary: string;
  configSnapshot: OwnerControlConfig;
  activeRequestsCount: number;
}
