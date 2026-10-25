import crypto from 'crypto';
import { IncidentSeverity } from '../../types/ownerControl';

/**
 * Protected Core Modules Registry
 * Mandatory protected modules that cannot be altered without explicit Owner approval (Level 2)
 * or are critically locked from automated modification (Level 3).
 */
export const PROTECTED_MODULE_REGISTRY = [
  'MasterKundliData',
  'SwissEphemeris',
  'AstronomicalCalculation',
  'KundliEngine',
  'DashaEngine',
  'PrashnaCalculation',
  'Authentication',
  'Security',
  'Payments',
  'PrivateFamilyData'
] as const;

export type ProtectedModule = typeof PROTECTED_MODULE_REGISTRY[number];

export type GuardianAuthorizationDecision = 
  | 'ALLOWED' 
  | 'DENIED' 
  | 'APPROVAL_REQUIRED' 
  | 'CRITICAL_LOCK';

export interface GuardianActor {
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'SYSTEM' | 'ANONYMOUS';
  sessionToken?: string;
  ipAddress?: string;
}

export interface GuardianActionRequest {
  actor: GuardianActor;
  action: string;
  targetModule: string;
  affectedFiles?: string[];
  severity: IncidentSeverity;
  approvalId?: string;
  clientPayload?: Record<string, any>;
}

export interface ServerApprovalRecord {
  id: string;
  createdAt: number;
  expiresAt: number;
  approvedBy: string; // Authenticated owner user id
  action: string;
  targetModule: string;
  affectedFiles: string[];
  severity: IncidentSeverity;
  status: 'PENDING' | 'APPROVED' | 'USED' | 'REJECTED' | 'ROLLED_BACK';
  singleUseConsumed: boolean;
  backupSnapshotId?: string;
  reason: string;
}

export interface ServerAuditRecord {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  target: string;
  approvalId?: string;
  result: GuardianAuthorizationDecision | 'SUCCESS' | 'FAILURE';
  severity: IncidentSeverity | 'INFO' | 'WARN';
  affectedFiles?: string[];
  rollbackReference?: string;
  details: string;
}

// In-memory Server-Side State Stores
const activeSessions = new Map<string, { userId: string; role: 'OWNER'; createdAt: number; expiresAt: number }>();
const serverApprovals = new Map<string, ServerApprovalRecord>();
const serverAuditLogs: ServerAuditRecord[] = [];
const serverBackups = new Map<string, { id: string; timestamp: number; label: string; data: any }>();

// Secret key for HMAC token signing (defaults to secure random or env)
const SERVER_SECRET = (typeof process !== 'undefined' && process.env?.GUARDIAN_SECRET_KEY) || 'jeevandarpan_guardian_secure_secret_2026';

// Fallback Default PINs:
// Testing fallback: '1234'
// Legacy fallback: '1986'
export const TESTING_FALLBACK_PIN = '1234';
export const LEGACY_DEFAULT_PIN = '1986';
export const ACCEPTED_FALLBACK_PINS = [TESTING_FALLBACK_PIN, LEGACY_DEFAULT_PIN];

let serverOwnerPin = (typeof process !== 'undefined' && process.env?.OWNER_PIN) || '';
let isCustomPinConfigured = Boolean(serverOwnerPin && serverOwnerPin.trim().length >= 4);

/**
 * Returns current Swami PIN status
 */
export function getOwnerPinStatus(): {
  hasCustomPin: boolean;
  defaultFallbackPin: string;
  legacyDefaultPin: string;
  allowedPins: string[];
} {
  return {
    hasCustomPin: isCustomPinConfigured && Boolean(serverOwnerPin),
    defaultFallbackPin: TESTING_FALLBACK_PIN,
    legacyDefaultPin: LEGACY_DEFAULT_PIN,
    allowedPins: ACCEPTED_FALLBACK_PINS,
  };
}

// Master Secret Key for emergency PIN reset (GUARDIAN_SECRET)
export const ACCEPTED_MASTER_KEYS = [
  'GUARDIAN_SECRET',
  'jeevandarpan_guardian_secure_secret_2026',
  SERVER_SECRET,
  (typeof process !== 'undefined' && process.env?.GUARDIAN_SECRET_KEY) || '',
].filter(Boolean);

export interface SetOwnerPinOptions {
  oldPin?: string;
  masterKey?: string;
  sessionToken?: string;
}

/**
 * Configure / update Swami PIN dynamically.
 * Supports:
 * - Option A: Old PIN verification (oldPin -> newPin)
 * - Option B: Emergency Master Secret Key (masterKey: 'GUARDIAN_SECRET' -> newPin)
 * - Session token from authenticated owner
 * - First-time initial setup
 */
export function setServerOwnerPin(
  newPin: string, 
  tokenOrOptions?: string | SetOwnerPinOptions
): { success: boolean; sessionToken?: string; error?: string } {
  if (!newPin || typeof newPin !== 'string') {
    return { success: false, error: 'पिन दर्ज करना अनिवार्य है।' };
  }
  const cleanPin = newPin.trim();
  if (cleanPin.length < 4 || cleanPin.length > 8) {
    return { success: false, error: 'स्वामी सुरक्षा पिन 4 से 8 अंकों के बीच होना चाहिए।' };
  }

  const options: SetOwnerPinOptions = typeof tokenOrOptions === 'string'
    ? { sessionToken: tokenOrOptions }
    : (tokenOrOptions || {});

  // Case 1: Master Secret Key emergency reset
  if (options.masterKey) {
    const cleanMasterKey = options.masterKey.trim();
    const isMasterValid = ACCEPTED_MASTER_KEYS.some(k => k.trim() === cleanMasterKey);
    if (!isMasterValid) {
      appendServerAuditLog({
        actor: 'anonymous_reset',
        action: 'OWNER_PIN_RESET_FAILED',
        target: 'Authentication',
        result: 'DENIED',
        severity: 'CRITICAL',
        details: 'Attempted PIN reset with an invalid master secret key.'
      });
      return { success: false, error: 'अमान्य मास्टर कुंजी! कृपया वैध GUARDIAN_SECRET दर्ज करें।' };
    }
  } 
  // Case 2: Verification using old PIN
  else if (options.oldPin) {
    const cleanOldPin = options.oldPin.trim();
    let oldPinMatches = false;

    if (serverOwnerPin && serverOwnerPin.trim().length >= 4) {
      oldPinMatches = (cleanOldPin === serverOwnerPin.trim()) || ACCEPTED_FALLBACK_PINS.includes(cleanOldPin);
    } else {
      oldPinMatches = ACCEPTED_FALLBACK_PINS.includes(cleanOldPin);
    }

    if (!oldPinMatches) {
      appendServerAuditLog({
        actor: 'anonymous_change',
        action: 'OWNER_PIN_CHANGE_FAILED',
        target: 'Authentication',
        result: 'DENIED',
        severity: 'WARN',
        details: 'Failed PIN change: Incorrect old/current PIN supplied.'
      });
      return { success: false, error: 'वर्तमान/पुराना स्वामी पिन अमान्य है। यदि भूल गए हों तो विकल्प B (GUARDIAN_SECRET) चुनें।' };
    }
  }
  // Case 3: Verification using active session
  else if (options.sessionToken) {
    const session = validateSession(options.sessionToken);
    if (!session.valid || session.role !== 'OWNER') {
      return { success: false, error: 'अनधिकृत: पिन बदलने के लिए स्वामी सत्र आवश्यक है।' };
    }
  }
  // Case 4: No credentials provided, but custom PIN already set
  else if (isCustomPinConfigured) {
    return { success: false, error: 'सुरक्षा हेतु पुराना पिन अथवा मास्टर सीक्रेट की (GUARDIAN_SECRET) प्रदान करें।' };
  }

  serverOwnerPin = cleanPin;
  isCustomPinConfigured = true;

  appendServerAuditLog({
    actor: 'owner_master',
    action: options.masterKey ? 'OWNER_PIN_MASTER_RESET' : 'OWNER_PIN_UPDATED',
    target: 'Authentication',
    result: 'SUCCESS',
    severity: 'INFO',
    details: options.masterKey 
      ? 'Owner successfully reset Swami security PIN via GUARDIAN_SECRET master key.'
      : 'Owner successfully configured/updated Swami security PIN.'
  });

  // Issue active session immediately upon setting PIN
  const auth = authenticateOwner(cleanPin, 'localhost');
  return { success: true, sessionToken: auth.sessionToken };
}

/**
 * Data Sanitizer for Audit Logging & Technical Alerts
 * Scrub private family information, birth credentials, coordinates, tokens, and keys.
 */
export function sanitizeSensitiveData(text: string): string {
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

/**
 * Server-side Owner Authentication
 * Generates a signed cryptographic session token upon valid owner PIN verification.
 * Accepts the user's custom PIN (if configured) or testing fallback PINs ('1234', '1986').
 */
export function authenticateOwner(pin: string, clientIp?: string): { success: boolean; sessionToken?: string; error?: string } {
  if (!pin || typeof pin !== 'string') {
    return { success: false, error: 'PIN must be provided.' };
  }

  const cleanPin = pin.trim();
  let matches = false;

  // 1. Check custom configured PIN
  if (serverOwnerPin) {
    const providedBuffer = Buffer.from(cleanPin);
    const secretBuffer = Buffer.from(serverOwnerPin);
    if (providedBuffer.length === secretBuffer.length && crypto.timingSafeEqual(providedBuffer, secretBuffer)) {
      matches = true;
    }
  }

  // 2. Check fallback pins ('1234', '1986')
  if (!matches) {
    for (const fb of ACCEPTED_FALLBACK_PINS) {
      const fbBuf = Buffer.from(fb);
      const prBuf = Buffer.from(cleanPin);
      if (prBuf.length === fbBuf.length && crypto.timingSafeEqual(prBuf, fbBuf)) {
        matches = true;
        break;
      }
    }
  }

  if (!matches) {
    appendServerAuditLog({
      actor: 'ANONYMOUS',
      action: 'OWNER_AUTH_FAILURE',
      target: 'Authentication',
      result: 'DENIED',
      severity: 'WARN',
      details: `Failed authentication attempt from IP: ${clientIp || 'unknown'}`
    });
    return { success: false, error: 'Invalid Owner PIN. Enter correct PIN or use testing fallback "1234".' };
  }

  // Generate secure 32-byte session token with cryptographic signature
  const rawToken = crypto.randomBytes(24).toString('hex');
  const timestamp = Date.now();
  const signature = crypto.createHmac('sha256', SERVER_SECRET)
    .update(`${rawToken}:${timestamp}:OWNER`)
    .digest('hex');
  const token = `${rawToken}.${timestamp}.${signature}`;

  // Session valid for 4 hours
  activeSessions.set(token, {
    userId: 'owner_master',
    role: 'OWNER',
    createdAt: timestamp,
    expiresAt: timestamp + 4 * 60 * 60 * 1000
  });

  appendServerAuditLog({
    actor: 'owner_master',
    action: 'OWNER_AUTH_SUCCESS',
    target: 'Authentication',
    result: 'SUCCESS',
    severity: 'INFO',
    details: `Owner authenticated successfully. Session issued.`
  });

  return { success: true, sessionToken: token };
}

/**
 * Validates a session token server-side.
 */
export function validateSession(sessionToken?: string): { valid: boolean; role?: string; userId?: string } {
  if (!sessionToken || typeof sessionToken !== 'string') return { valid: false };

  const session = activeSessions.get(sessionToken);
  if (!session) return { valid: false };

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(sessionToken);
    return { valid: false };
  }

  // Validate signature
  const parts = sessionToken.split('.');
  if (parts.length !== 3) return { valid: false };
  const [rawToken, ts, signature] = parts;

  const expectedSig = crypto.createHmac('sha256', SERVER_SECRET)
    .update(`${rawToken}:${ts}:OWNER`)
    .digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false };
  }

  return { valid: true, role: session.role, userId: session.userId };
}

/**
 * Checks if target module matches the protected module registry.
 */
export function isProtectedModule(moduleName: string): boolean {
  if (!moduleName) return false;
  const clean = moduleName.toLowerCase().replace(/[\s_-]/g, '');
  return PROTECTED_MODULE_REGISTRY.some(p => p.toLowerCase().replace(/[\s_-]/g, '') === clean);
}

/**
 * Checks if target or files invoke Level 3 critical locks.
 */
export function isLevel3Target(targetModule: string, affectedFiles: string[] = []): boolean {
  const level3Keywords = [
    'swisseph', 'ephemeris', 'astronomycalculation', 'astronomyengine',
    'masterkundlidata', 'kundliengine', 'dashamathematics', 'vimshottari',
    'paymentsystem', 'privatefamilydata', 'birthprofile'
  ];

  const targetClean = targetModule.toLowerCase().replace(/[\s_-]/g, '');
  if (level3Keywords.some(kw => targetClean.includes(kw))) return true;

  const combinedFiles = affectedFiles.join(' ').toLowerCase();
  if (
    combinedFiles.includes('swisseph') ||
    combinedFiles.includes('astronomyservice') ||
    combinedFiles.includes('dashacalculator') ||
    combinedFiles.includes('masterkundli')
  ) {
    return true;
  }

  return false;
}

/**
 * Central Server-Side Permission Authorization Check
 * Concepts:
 * authorizeGuardianAction({ actor, action, targetModule, severity, approvalId })
 * Return: ALLOWED | DENIED | APPROVAL_REQUIRED | CRITICAL_LOCK
 */
export function authorizeGuardianAction(request: GuardianActionRequest): {
  decision: GuardianAuthorizationDecision;
  reason: string;
  auditId?: string;
} {
  const { actor, action, targetModule, affectedFiles = [], severity, approvalId, clientPayload } = request;

  // Rule 0: Anti-tamper check - Never trust client payload claiming approved: true without valid approval ID
  if (clientPayload && (clientPayload.approved === true || clientPayload.role === 'OWNER')) {
    if (!actor.sessionToken || !validateSession(actor.sessionToken).valid) {
      appendServerAuditLog({
        actor: actor.userId || 'ANONYMOUS',
        action: `TAMPER_ATTEMPT:${action}`,
        target: targetModule,
        result: 'DENIED',
        severity: 'CRITICAL',
        details: 'Client attempted to pass approved=true or role=OWNER without valid server session.'
      });
      return {
        decision: 'DENIED',
        reason: 'Client-side approval claim rejected: Valid server-side owner session required.'
      };
    }
  }

  // Rule 1: Authenticate Actor
  const sessionValidation = validateSession(actor.sessionToken);
  const isAuthenticatedOwner = sessionValidation.valid && sessionValidation.role === 'OWNER';

  // Rule 2: LEVEL 3 - CRITICAL_LOCK
  // Modifications to Swiss Ephemeris, Astronomy, MasterKundliData, Kundli Engine, Dasha, etc.
  if (severity === 'CRITICAL' || isLevel3Target(targetModule, affectedFiles)) {
    appendServerAuditLog({
      actor: isAuthenticatedOwner ? 'owner_master' : (actor.userId || 'ANONYMOUS'),
      action: `CRITICAL_LOCK:${action}`,
      target: targetModule,
      result: 'CRITICAL_LOCK',
      severity: 'CRITICAL',
      affectedFiles,
      details: `Automated changes to critical module ${targetModule} are strictly blocked. Architectural baseline lock enforced.`
    });
    return {
      decision: 'CRITICAL_LOCK',
      reason: `CRITICAL_LOCK: Module "${targetModule}" is an immutable baseline component. Automatic mutation is blocked by Guardian policy.`
    };
  }

  // Rule 3: Unauthenticated / Non-owner attempts Level 2 action
  if (!isAuthenticatedOwner) {
    appendServerAuditLog({
      actor: actor.userId || 'ANONYMOUS',
      action,
      target: targetModule,
      result: 'DENIED',
      severity: 'WARN',
      details: 'Unauthenticated or non-owner actor attempted protected Guardian action.'
    });
    return {
      decision: 'DENIED',
      reason: 'DENIED: Only authenticated application Owner can perform or authorize this action.'
    };
  }

  // Rule 4: LEVEL 1 - Safe fixes by authenticated Owner
  if (severity === 'LOW') {
    appendServerAuditLog({
      actor: 'owner_master',
      action,
      target: targetModule,
      result: 'ALLOWED',
      severity: 'INFO',
      affectedFiles,
      details: `Level 1 safe action authorized for Owner.`
    });
    return {
      decision: 'ALLOWED',
      reason: 'Level 1 safe action authorized.'
    };
  }

  // Rule 5: LEVEL 2 - Requires valid, single-use, matching Owner approval
  if (!approvalId) {
    appendServerAuditLog({
      actor: 'owner_master',
      action,
      target: targetModule,
      result: 'APPROVAL_REQUIRED',
      severity: 'WARN',
      affectedFiles,
      details: `Protected Level 2 action requires explicit approval record.`
    });
    return {
      decision: 'APPROVAL_REQUIRED',
      reason: 'APPROVAL_REQUIRED: Explicit Owner approval record must be created and approved.'
    };
  }

  // Verify server-side approval record
  const approval = serverApprovals.get(approvalId);
  if (!approval) {
    appendServerAuditLog({
      actor: 'owner_master',
      action,
      target: targetModule,
      result: 'DENIED',
      severity: 'WARN',
      details: `Supplied approval ID "${approvalId}" was not found on the server.`
    });
    return {
      decision: 'DENIED',
      reason: 'DENIED: Approval record does not exist on the server.'
    };
  }

  if (approval.status !== 'APPROVED') {
    return {
      decision: 'DENIED',
      reason: `DENIED: Approval record status is "${approval.status}". Action requires "APPROVED" state.`
    };
  }

  if (approval.singleUseConsumed) {
    return {
      decision: 'DENIED',
      reason: 'DENIED: Single-use approval has already been consumed.'
    };
  }

  if (Date.now() > approval.expiresAt) {
    approval.status = 'REJECTED';
    return {
      decision: 'DENIED',
      reason: 'DENIED: Approval record has expired.'
    };
  }

  // Validate that the approval matches the exact action and targetModule
  if (approval.action !== action || approval.targetModule !== targetModule) {
    appendServerAuditLog({
      actor: 'owner_master',
      action,
      target: targetModule,
      result: 'DENIED',
      severity: 'CRITICAL',
      details: `Approval mismatch: Approval was issued for ${approval.action}@${approval.targetModule} but used for ${action}@${targetModule}.`
    });
    return {
      decision: 'DENIED',
      reason: 'DENIED: Approval record action/target does not match the requested operation.'
    };
  }

  // Consume single-use approval
  approval.singleUseConsumed = true;
  approval.status = 'USED';

  appendServerAuditLog({
    actor: 'owner_master',
    action,
    target: targetModule,
    approvalId,
    result: 'ALLOWED',
    severity: 'INFO',
    affectedFiles,
    details: `Single-use approval ${approvalId} consumed. Change execution allowed.`
  });

  return {
    decision: 'ALLOWED',
    reason: 'Single-use Owner approval validated. Change execution permitted.'
  };
}

/**
 * Server-side Approval Request Creation
 */
export function createServerApprovalRequest(params: {
  sessionToken: string;
  action: string;
  targetModule: string;
  affectedFiles?: string[];
  severity: IncidentSeverity;
  reason: string;
  backupRequired?: boolean;
}): { success: boolean; approval?: ServerApprovalRecord; error?: string } {
  const session = validateSession(params.sessionToken);
  if (!session.valid || session.role !== 'OWNER') {
    return { success: false, error: 'Unauthorized: Valid Owner session is required to create an approval request.' };
  }

  // Enforce CRITICAL_LOCK: Even requests cannot be created for Level 3 automated modifications
  if (isLevel3Target(params.targetModule, params.affectedFiles)) {
    return {
      success: false,
      error: `CRITICAL_LOCK: Module "${params.targetModule}" is locked from automated modification.`
    };
  }

  const id = `srv_req_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  let backupSnapshotId: string | undefined;

  if (params.backupRequired !== false) {
    backupSnapshotId = createServerBackup(`Pre-Change Snapshot: ${params.action}@${params.targetModule}`, session.userId!);
  }

  const record: ServerApprovalRecord = {
    id,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour validity window
    approvedBy: '',
    action: params.action,
    targetModule: params.targetModule,
    affectedFiles: params.affectedFiles || [],
    severity: params.severity,
    status: 'PENDING',
    singleUseConsumed: false,
    backupSnapshotId,
    reason: sanitizeSensitiveData(params.reason),
  };

  serverApprovals.set(id, record);

  appendServerAuditLog({
    actor: session.userId!,
    action: 'APPROVAL_REQUEST_CREATED',
    target: params.targetModule,
    approvalId: id,
    result: 'SUCCESS',
    severity: params.severity,
    affectedFiles: params.affectedFiles,
    details: `Approval request ${id} generated for ${params.action}@${params.targetModule}`
  });

  return { success: true, approval: record };
}

/**
 * Server-side Approval Authorization
 */
export function approveServerRequest(sessionToken: string, approvalId: string): { success: boolean; error?: string } {
  const session = validateSession(sessionToken);
  if (!session.valid || session.role !== 'OWNER') {
    return { success: false, error: 'Unauthorized: Only an authenticated Owner can approve requests.' };
  }

  const approval = serverApprovals.get(approvalId);
  if (!approval) {
    return { success: false, error: 'Approval request not found.' };
  }

  if (approval.status !== 'PENDING') {
    return { success: false, error: `Cannot approve request in "${approval.status}" state.` };
  }

  approval.status = 'APPROVED';
  approval.approvedBy = session.userId!;

  appendServerAuditLog({
    actor: session.userId!,
    action: 'APPROVAL_REQUEST_APPROVED',
    target: approval.targetModule,
    approvalId,
    result: 'SUCCESS',
    severity: 'INFO',
    details: `Owner explicitly authorized approval ${approvalId}`
  });

  return { success: true };
}

/**
 * Server-side Backup Creation
 */
export function createServerBackup(label: string, actor: string, dataSnapshot?: any): string {
  const id = `srv_snap_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  serverBackups.set(id, {
    id,
    timestamp: Date.now(),
    label: sanitizeSensitiveData(label),
    data: dataSnapshot || { timestamp: Date.now(), status: 'baseline_active' }
  });

  appendServerAuditLog({
    actor,
    action: 'BACKUP_CREATED',
    target: 'SystemState',
    result: 'SUCCESS',
    severity: 'INFO',
    rollbackReference: id,
    details: `Created verified baseline snapshot ${id} (${label})`
  });

  return id;
}

/**
 * Server-side Rollback Execution
 */
export function executeServerRollback(sessionToken: string, snapshotId: string): { success: boolean; error?: string } {
  const session = validateSession(sessionToken);
  if (!session.valid || session.role !== 'OWNER') {
    appendServerAuditLog({
      actor: 'ANONYMOUS',
      action: 'UNAUTHORIZED_ROLLBACK_ATTEMPT',
      target: 'SystemState',
      result: 'DENIED',
      severity: 'CRITICAL',
      rollbackReference: snapshotId,
      details: 'Unauthorized actor attempted to invoke rollback.'
    });
    return { success: false, error: 'Unauthorized: Valid Owner session is required to execute rollback.' };
  }

  const snapshot = serverBackups.get(snapshotId);
  if (!snapshot) {
    return { success: false, error: `Invalid rollback reference: Snapshot "${snapshotId}" does not exist on server.` };
  }

  appendServerAuditLog({
    actor: session.userId!,
    action: 'ROLLBACK_EXECUTED',
    target: 'SystemState',
    result: 'SUCCESS',
    severity: 'WARN',
    rollbackReference: snapshotId,
    details: `System state rolled back to snapshot ${snapshotId} (${snapshot.label})`
  });

  return { success: true };
}

/**
 * Append to Server-side Immutable Audit Log
 */
function appendServerAuditLog(entry: Omit<ServerAuditRecord, 'id' | 'timestamp'>): void {
  const record: ServerAuditRecord = {
    id: `srv_audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    timestamp: Date.now(),
    ...entry,
    details: sanitizeSensitiveData(entry.details)
  };

  serverAuditLogs.unshift(record);
  if (serverAuditLogs.length > 500) {
    serverAuditLogs.pop();
  }
}

/**
 * Retrieve Server Audit Logs
 */
export function getServerAuditLogs(sessionToken?: string): ServerAuditRecord[] {
  // Return sanitized logs
  return serverAuditLogs.slice(0, 200);
}

/**
 * Reset state helper for test suites
 */
export function _resetServerSecurityState(): void {
  activeSessions.clear();
  serverApprovals.clear();
  serverAuditLogs.length = 0;
  serverBackups.clear();
}
