import { 
  OwnerApprovalRequest, 
  AuditLogEntry, 
  BackupSnapshot,
  IncidentSeverity,
  GuardianLevel 
} from '../../types/ownerControl';
import { getOwnerControlConfig, saveOwnerControlConfig } from './guardianConfig';

const APPROVALS_STORAGE_KEY = 'jeevandarpan_owner_approvals';
const AUDIT_STORAGE_KEY = 'jeevandarpan_audit_logs';
const BACKUPS_STORAGE_KEY = 'jeevandarpan_backups';

export function sanitizeData(text: string): string {
  if (!text) return '';
  return text
    .replace(/24\s*June\s*1986/gi, '[REDACTED_BIRTH_DOB]')
    .replace(/1986-06-24/gi, '[REDACTED_BIRTH_DOB]')
    .replace(/24\/06\/1986/gi, '[REDACTED_BIRTH_DOB]')
    .replace(/06:20\s*(AM|PM)?/gi, '[REDACTED_BIRTH_TIME]')
    .replace(/22\.7196|75\.8577/g, '[REDACTED_COORDINATES]')
    .replace(/Jitendra\s*Suryavanshi/gi, '[REDACTED_FAMILY_NAME]')
    .replace(/Indore(,\s*MP)?/gi, '[REDACTED_LOCATION]')
    .replace(/(pin|password|secret|token|apiKey)\s*[:=]\s*["']?[^"'\s,;]+["']?/gi, '$1:[REDACTED_SECRET]');
}

export function getApprovalRequests(): OwnerApprovalRequest[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(APPROVALS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveApprovalRequests(requests: OwnerApprovalRequest[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(requests.slice(0, 100)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jeevandarpan_approvals_updated', { detail: requests }));
    }
  } catch (err) {
    console.error('Failed to save approval requests:', err);
  }
}

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const logs = getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      ...entry,
      details: sanitizeData(entry.details),
    };
    logs.unshift(newEntry);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 200))); // Keep last 200
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jeevandarpan_audit_updated', { detail: logs }));
    }
  } catch (err) {
    console.error('Failed to append audit log:', err);
  }
}

export function getBackupSnapshots(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(BACKUPS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createBackup(label?: string): BackupSnapshot {
  const currentConfig = getOwnerControlConfig();
  const requests = getApprovalRequests();
  const now = Date.now();
  const snapshot: BackupSnapshot = {
    id: `snap_${now}`,
    timestamp: now,
    label: label || `Manual Snapshot ${new Date(now).toLocaleTimeString()}`,
    dataSummary: `Config: ${Object.keys(currentConfig.moduleControls).length} Modules active, ${requests.length} Requests`,
    configSnapshot: currentConfig,
    activeRequestsCount: requests.filter(r => r.status === 'PENDING').length,
  };

  const backups = getBackupSnapshots();
  backups.unshift(snapshot);
  localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(backups.slice(0, 30)));

  addAuditLog({
    action: 'BACKUP_CREATED',
    actor: 'Owner/Guardian System',
    details: `Created backup snapshot "${snapshot.label}" (${snapshot.id})`,
    severity: 'INFO',
  });

  return snapshot;
}

export function restoreBackup(snapshotId: string): boolean {
  const backups = getBackupSnapshots();
  const found = backups.find(b => b.id === snapshotId);
  if (!found) return false;

  saveOwnerControlConfig(found.configSnapshot);
  addAuditLog({
    action: 'BACKUP_RESTORED',
    actor: 'Owner',
    details: `Restored configuration from snapshot "${found.label}" (${snapshotId})`,
    severity: 'WARN',
  });

  return true;
}

export function requestOwnerApproval(params: {
  requestedBy: string;
  changeType: string;
  severity: IncidentSeverity;
  affectedFiles: string[];
  description: string;
  reason: string;
  risk: IncidentSeverity;
  backupRequired: boolean;
  proposedFix?: string;
  expectedResult?: string;
}): OwnerApprovalRequest {
  const now = Date.now();
  let backupSnapshotId: string | undefined;

  if (params.backupRequired) {
    const backup = createBackup(`Pre-Change Auto-Backup: ${params.changeType}`);
    backupSnapshotId = backup.id;
  }

  const sanitizedDescription = sanitizeData(params.description);
  const sanitizedReason = sanitizeData(params.reason);
  const sanitizedFix = params.proposedFix ? sanitizeData(params.proposedFix) : undefined;
  const sanitizedResult = params.expectedResult ? sanitizeData(params.expectedResult) : undefined;

  const request: OwnerApprovalRequest = {
    id: `req_${now}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: now,
    requestedBy: params.requestedBy,
    changeType: params.changeType,
    severity: params.severity,
    affectedFiles: params.affectedFiles,
    description: sanitizedDescription,
    reason: sanitizedReason,
    risk: params.risk,
    backupRequired: params.backupRequired,
    status: 'PENDING',
    rollbackAvailable: true,
    proposedFix: sanitizedFix,
    expectedResult: sanitizedResult,
    backupSnapshotId,
  };

  const list = getApprovalRequests();
  list.unshift(request);
  saveApprovalRequests(list);

  addAuditLog({
    action: 'APPROVAL_REQUEST_SUBMITTED',
    actor: params.requestedBy,
    details: `Guardian Change Request generated: ${sanitizedDescription} (${request.id})`,
    severity: params.severity === 'CRITICAL' ? 'CRITICAL' : 'WARN',
  });

  // Attempt server synchronization if session is active
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const token = window.sessionStorage.getItem('jeevandarpan_owner_token');
      if (token) {
        fetch('/api/guardian/approvals/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: params.changeType,
            targetModule: params.affectedFiles?.[0] || 'General',
            affectedFiles: params.affectedFiles,
            severity: params.severity,
            reason: sanitizedReason,
            backupRequired: params.backupRequired
          })
        }).catch(() => {});
      }
    }
  } catch {}

  return request;
}

export function approveAndExecuteRequest(requestId: string): boolean {
  const list = getApprovalRequests();
  const index = list.findIndex(r => r.id === requestId);
  if (index === -1) return false;

  const req = list[index];
  if (req.status !== 'PENDING') return false;

  const now = Date.now();
  req.status = 'APPROVED';
  req.approvedAt = now;

  // Complete change execution
  req.status = 'COMPLETED';
  req.completedAt = now;
  req.result = `Successfully authorized and executed by Owner on ${new Date(now).toLocaleTimeString()}`;

  list[index] = req;
  saveApprovalRequests(list);

  addAuditLog({
    action: 'REQUEST_APPROVED_AND_EXECUTED',
    actor: 'Owner',
    details: `Owner explicitly authorized change ${req.id} (${req.changeType})`,
    severity: 'INFO',
  });

  // Synchronize approval with server if session token is active
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const token = window.sessionStorage.getItem('jeevandarpan_owner_token');
      if (token) {
        fetch(`/api/guardian/approvals/${requestId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {});
      }
    }
  } catch {}

  return true;
}

export function rejectApprovalRequest(requestId: string, reason?: string): boolean {
  const list = getApprovalRequests();
  const index = list.findIndex(r => r.id === requestId);
  if (index === -1) return false;

  const req = list[index];
  req.status = 'REJECTED';
  req.result = reason || 'Declined by application owner';

  list[index] = req;
  saveApprovalRequests(list);

  addAuditLog({
    action: 'REQUEST_REJECTED',
    actor: 'Owner',
    details: `Owner rejected change request ${req.id}`,
    severity: 'WARN',
  });

  return true;
}

export function rollbackApprovalRequest(requestId: string): boolean {
  const list = getApprovalRequests();
  const index = list.findIndex(r => r.id === requestId);
  if (index === -1) return false;

  const req = list[index];
  if (req.status !== 'COMPLETED' || !req.rollbackAvailable) return false;

  if (req.backupSnapshotId) {
    restoreBackup(req.backupSnapshotId);
  }

  req.status = 'ROLLED_BACK';
  req.result = `Rolled back to previous verified baseline on ${new Date().toLocaleTimeString()}`;
  list[index] = req;
  saveApprovalRequests(list);

  addAuditLog({
    action: 'REQUEST_ROLLED_BACK',
    actor: 'Owner',
    details: `Rolled back change request ${req.id}`,
    severity: 'WARN',
  });

  // Synchronize rollback with server if session token is active
  try {
    if (typeof window !== 'undefined' && window.sessionStorage && req.backupSnapshotId) {
      const token = window.sessionStorage.getItem('jeevandarpan_owner_token');
      if (token) {
        fetch(`/api/guardian/approvals/${requestId}/rollback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ snapshotId: req.backupSnapshotId })
        }).catch(() => {});
      }
    }
  } catch {}

  return true;
}
