import { GuardianIncident, IncidentCategory, IncidentSeverity, GuardianLevel } from '../../types/ownerControl';
import { 
  guardianIncidentService, 
  getStoredIncidents, 
  saveStoredIncidents, 
  classifyIncident, 
  sanitizeText 
} from './guardianIncidentService';
import { ownerNotificationService } from './ownerNotificationService';
import { getOwnerControlConfig } from './guardianConfig';

export { getStoredIncidents, saveStoredIncidents, sanitizeText as sanitizeErrorMessage };

export function determineGuardianLevel(
  category: IncidentCategory, 
  message: string, 
  moduleName: string
): {
  level: GuardianLevel;
  severity: IncidentSeverity;
  autoFixAllowed: boolean;
  ownerApprovalRequired: boolean;
} {
  const classified = classifyIncident(category, '', message, moduleName);
  return {
    level: classified.level,
    severity: classified.severity,
    autoFixAllowed: classified.autoFixAllowed,
    ownerApprovalRequired: classified.ownerApprovalRequired,
  };
}

let activeListeners: Array<(incident: GuardianIncident) => void> = [];

export class GuardianMonitor {
  private static instance: GuardianMonitor;
  private isInitialized = false;
  private isDegraded = false;
  private degradedReason: string | null = null;

  private constructor() {}

  public static getInstance(): GuardianMonitor {
    if (!GuardianMonitor.instance) {
      GuardianMonitor.instance = new GuardianMonitor();
    }
    return GuardianMonitor.instance;
  }

  public getStatus(): 'ACTIVE' | 'DEGRADED-SAFE' {
    return this.isDegraded ? 'DEGRADED-SAFE' : 'ACTIVE';
  }

  public isDegradedSafe(): boolean {
    return this.isDegraded;
  }

  public getDegradedReason(): string | null {
    return this.degradedReason;
  }

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    try {
      // 1. Window Error Listener (JavaScript Runtime Errors)
      window.addEventListener('error', (event) => {
        try {
          // Ignore benign vite websocket errors
          if (event.message && (event.message.includes('websocket') || event.message.includes('WebSocket'))) return;
          const incident = this.recordIncident({
            category: 'RUNTIME',
            message: event.message || 'JavaScript runtime execution exception',
            stack: event.error?.stack,
            module: event.filename ? event.filename.split('/').pop() || 'runtime' : 'window',
            screen: window.location.pathname,
            affectedFeature: 'JavaScript Engine',
          });
          ownerNotificationService.notifyIncident(incident);
        } catch {
          // Internal error handling must never crash the application
        }
      });

      // 2. Unhandled Promise Rejection Listener
      window.addEventListener('unhandledrejection', (event) => {
        try {
          const reason = event.reason;
          const message = typeof reason === 'string' ? reason : (reason?.message || 'Unhandled Promise Rejection');
          if (message.includes('websocket') || message.includes('WebSocket')) return;
          const incident = this.recordIncident({
            category: 'RUNTIME',
            message,
            stack: reason?.stack,
            module: 'async_pipeline',
            screen: window.location.pathname,
            affectedFeature: 'Async Promise Pipeline',
          });
          ownerNotificationService.notifyIncident(incident);
        } catch {
          // Internal error handling must never crash the application
        }
      });

      // 3. Network Offline / Online State Listener
      window.addEventListener('offline', () => {
        try {
          const incident = this.recordIncident({
            category: 'NETWORK',
            message: 'Device lost internet connectivity. Offline Vedic fallback mode active.',
            module: 'NetworkConnectivity',
            screen: window.location.pathname,
            affectedFeature: 'Network Gateway',
          });
          ownerNotificationService.notifyIncident(incident);
        } catch {
          // Internal error handling must never crash the application
        }
      });

      // 4. CRITICAL: Browser window.fetch is NEVER globally monkey-patched or mutated.
      // Global window.fetch remains completely untouched and read-only.
      // Use the exported safeFetch() / guardianFetch() application wrappers for monitored API calls.

      console.info('🛡️ JeevanDarpan Guardian Central Monitor initialized successfully (Fail-Safe Active).');
    } catch (err: any) {
      // FAIL-SAFE: If any initialization step fails, mark as DEGRADED-SAFE and log cleanly without throwing.
      this.isDegraded = true;
      this.degradedReason = err?.message || 'Guardian initialization degraded';
      console.warn('🛡️ Guardian Central Monitor running in DEGRADED-SAFE mode (App remains fully functional):', err);
    }
  }

  /**
   * Safe Network Wrapper for JeevanDarpan API calls.
   * Does NOT modify, reassign, or monkey-patch window.fetch.
   * Calls standard native fetch directly and safely records Guardian incidents on failures.
   */
  public async safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const rawUrl = input;
    const urlStr = typeof rawUrl === 'string' ? rawUrl : (rawUrl && typeof rawUrl === 'object' && 'url' in rawUrl ? (rawUrl as any).url : '');
    try {
      const res = await fetch(input, init);
      if (!res.ok && urlStr && urlStr.startsWith('/api/')) {
        if (res.status >= 500) {
          try {
            const incident = this.recordIncident({
              category: 'API',
              message: `Backend API route returned HTTP ${res.status}: ${urlStr}`,
              module: urlStr.replace('/api/', '').split('?')[0] || 'API',
              screen: typeof window !== 'undefined' ? window.location.pathname : '/',
              affectedFeature: 'Server API Service',
            });
            ownerNotificationService.notifyIncident(incident);
          } catch {
            // Non-blocking
          }
        }
      }
      return res;
    } catch (err: any) {
      if (urlStr && urlStr.startsWith('/api/')) {
        try {
          const incident = this.recordIncident({
            category: 'NETWORK',
            message: `API request to ${urlStr} failed: ${err?.message || 'Network error'}`,
            module: urlStr.replace('/api/', '').split('?')[0] || 'API',
            screen: typeof window !== 'undefined' ? window.location.pathname : '/',
            affectedFeature: 'Network Connectivity',
          });
          ownerNotificationService.notifyIncident(incident);
        } catch {
          // Non-blocking
        }
      }
      throw err;
    }
  }

  public subscribe(callback: (incident: GuardianIncident) => void): () => void {
    activeListeners.push(callback);
    return () => {
      activeListeners = activeListeners.filter(cb => cb !== callback);
    };
  }

  public recordIncident(params: {
    category: IncidentCategory;
    message: string;
    stack?: string;
    module?: string;
    screen?: string;
    affectedFeature?: string;
    suggestedAction?: string;
    errorCode?: string;
    title?: string;
    isSimulation?: boolean;
  }): GuardianIncident {
    const incident = guardianIncidentService.reportIncident({
      category: params.category,
      title: params.title,
      description: params.message,
      affectedModule: params.module || params.affectedFeature || 'SystemCore',
      affectedScreen: params.screen,
      errorCode: params.errorCode,
      sanitizedStack: params.stack,
      suggestedAction: params.suggestedAction,
      isSimulation: params.isSimulation,
    });

    // Notify listeners
    const config = getOwnerControlConfig();
    if (config.guardianControls.activeMonitoringEnabled) {
      activeListeners.forEach(listener => listener(incident));
    }

    return incident;
  }

  public updateIncidentStatus(id: string, status: GuardianIncident['status']): void {
    guardianIncidentService.updateIncidentStatus(id, status);
  }

  public clearAllIncidents(): void {
    guardianIncidentService.clearAllIncidents();
  }
}

export const guardianMonitor = GuardianMonitor.getInstance();
export const guardianFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => 
  guardianMonitor.safeFetch(input, init);
export const safeFetch = guardianFetch;
