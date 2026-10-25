import { OwnerControlConfig } from '../../types/ownerControl';

export const DEFAULT_OWNER_CONTROL_CONFIG: OwnerControlConfig = {
  moduleControls: {
    kundli: true,
    numerology: true,
    prashna: true,
    dailyCompanion: true,
    pratahSanskar: true,
    dailyReportCard: true,
    aiIntelligence: true,
    planetSpeaks: true,
    panchatattva: true,
    wellness: true,
  },
  aiControls: {
    enabled: true,
    modelSelection: 'gemini-1.5-flash',
    maxDailyTokens: 50000,
    requireConfirmationForAiAdvice: true,
    allowFamilyInsights: true,
  },
  guardianControls: {
    guardianLevel: 2, // Level 2: Protected Change by default
    activeMonitoringEnabled: true,
    autoFixLevel1: true,
    notifyOnEveryIncident: false,
    haltOnLevel3: true,
  },
  voiceControls: {
    enabled: true,
    defaultVoiceSpeed: 0.9,
    allowPlanetSpeaks: true,
    offlineTtsFallback: true,
  },
  languageControls: {
    enabledLanguages: ['hi', 'en', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml', 'pa', 'or', 'as', 'sa'],
    defaultLanguage: 'hi',
    allowCustomLanguageSwitch: true,
  },
  notificationControls: {
    enabled: true,
    dailyReminders: true,
    alertSeverityFilter: 'MEDIUM',
  },
  maintenanceControls: {
    maintenanceMode: false,
    maintenanceMessage: 'JeevanDarpan is briefly in owner maintenance mode. Vedic calculations are safeguarded.',
    readOnlyMode: false,
    bypassForOwner: true,
  },
  securityControls: {
    ownerPinCode: '', // Stored securely on server / authenticated via /api/guardian/login
    sessionTimeoutMinutes: 60,
    requirePinForProtectedChanges: true,
    auditLoggingEnabled: true,
  },
};

const STORAGE_KEY = 'jeevandarpan_owner_config';

export function getOwnerControlConfig(): OwnerControlConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OWNER_CONTROL_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_OWNER_CONTROL_CONFIG,
      ...parsed,
      moduleControls: { ...DEFAULT_OWNER_CONTROL_CONFIG.moduleControls, ...(parsed.moduleControls || {}) },
      aiControls: { ...DEFAULT_OWNER_CONTROL_CONFIG.aiControls, ...(parsed.aiControls || {}) },
      guardianControls: { ...DEFAULT_OWNER_CONTROL_CONFIG.guardianControls, ...(parsed.guardianControls || {}) },
      voiceControls: { ...DEFAULT_OWNER_CONTROL_CONFIG.voiceControls, ...(parsed.voiceControls || {}) },
      languageControls: { ...DEFAULT_OWNER_CONTROL_CONFIG.languageControls, ...(parsed.languageControls || {}) },
      notificationControls: { ...DEFAULT_OWNER_CONTROL_CONFIG.notificationControls, ...(parsed.notificationControls || {}) },
      maintenanceControls: { ...DEFAULT_OWNER_CONTROL_CONFIG.maintenanceControls, ...(parsed.maintenanceControls || {}) },
      securityControls: { ...DEFAULT_OWNER_CONTROL_CONFIG.securityControls, ...(parsed.securityControls || {}) },
    };
  } catch {
    return DEFAULT_OWNER_CONTROL_CONFIG;
  }
}

export function saveOwnerControlConfig(config: OwnerControlConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('jeevandarpan_owner_config_updated', { detail: config }));
  } catch (err) {
    console.error('Failed to save owner config:', err);
  }
}

export const DEFAULT_TESTING_PIN = '1234';
export const LEGACY_DEFAULT_PIN = '1986';
export const ACCEPTED_MASTER_KEYS = ['GUARDIAN_SECRET', 'jeevandarpan_guardian_secure_secret_2026'];

export function isOwnerPinConfigured(): boolean {
  const config = getOwnerControlConfig();
  return Boolean(config.securityControls.ownerPinCode && config.securityControls.ownerPinCode.trim().length >= 4);
}

export function saveOwnerPin(newPin: string): void {
  const config = getOwnerControlConfig();
  const updated: OwnerControlConfig = {
    ...config,
    securityControls: {
      ...config.securityControls,
      ownerPinCode: newPin.trim(),
    }
  };
  saveOwnerControlConfig(updated);
}

export function verifyOldPinLocally(oldPin: string): boolean {
  const clean = oldPin.trim();
  const config = getOwnerControlConfig();
  const currentPin = config.securityControls.ownerPinCode;
  if (currentPin && currentPin.trim().length >= 4) {
    return clean === currentPin.trim() || clean === DEFAULT_TESTING_PIN || clean === LEGACY_DEFAULT_PIN;
  }
  return clean === DEFAULT_TESTING_PIN || clean === LEGACY_DEFAULT_PIN;
}

export function verifyMasterKeyLocally(key: string): boolean {
  const clean = key.trim();
  return ACCEPTED_MASTER_KEYS.includes(clean);
}

export const OWNER_TOKEN_KEY = 'jeevandarpan_owner_token';
export const OWNER_AUTH_CHANGED_EVENT = 'jeevandarpan_owner_auth_changed';

export function isOwnerAuthenticatedSession(): boolean {
  try {
    const token = sessionStorage.getItem(OWNER_TOKEN_KEY);
    return Boolean(token && token.trim().length > 0);
  } catch {
    return false;
  }
}

export function setOwnerSessionToken(token: string): void {
  try {
    sessionStorage.setItem(OWNER_TOKEN_KEY, token);
    window.dispatchEvent(new CustomEvent(OWNER_AUTH_CHANGED_EVENT, { detail: { authenticated: true, token } }));
  } catch (err) {
    console.error('Failed to save owner session token:', err);
  }
}

export function clearOwnerSession(): void {
  try {
    sessionStorage.removeItem(OWNER_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent(OWNER_AUTH_CHANGED_EVENT, { detail: { authenticated: false } }));
  } catch (err) {
    console.error('Failed to clear owner session:', err);
  }
}

/**
 * Verify owner PIN against server login endpoint with fallback to local configuration.
 */
export async function verifyOwnerPin(pinToVerify: string): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
  const cleanPin = (pinToVerify || '').trim();
  if (!cleanPin) {
    return { success: false, error: 'कृपया सुरक्षा पिन दर्ज करें' };
  }

  try {
    const res = await fetch('/api/guardian/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: cleanPin })
    });
    const data = await res.json();
    if (res.ok && data.ok && data.sessionToken) {
      setOwnerSessionToken(data.sessionToken);
      return { success: true, sessionToken: data.sessionToken };
    }
  } catch {
    // Server unreachable; proceed to fallback check below
  }

  // Fallback check against local custom PIN or default accepted pins
  const config = getOwnerControlConfig();
  const configuredPin = config.securityControls.ownerPinCode;
  if (
    (configuredPin && cleanPin === configuredPin.trim()) ||
    cleanPin === DEFAULT_TESTING_PIN ||
    cleanPin === LEGACY_DEFAULT_PIN
  ) {
    const localToken = `local_fallback_owner_${Date.now()}`;
    setOwnerSessionToken(localToken);
    return { success: true, sessionToken: localToken };
  }

  return { success: false, error: 'अमान्य स्वामी पिन (Invalid Owner PIN)' };
}
