/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — GUARDIAN ERROR MONITOR & ACTIVE SURVEILLANCE
 */

import { GuardianIncident } from '../../types/ownerControl';
import { 
  guardianIncidentService, 
  getStoredIncidents as getStoredIncidentsFromService 
} from './guardianIncidentService';

export const getStoredIncidents = getStoredIncidentsFromService;

type IncidentSubscriber = (incident: GuardianIncident) => void;

class GuardianMonitor {
  private initialized = false;
  private subscribers: Set<IncidentSubscriber> = new Set();

  public init(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.recordIncident({
          category: 'RUNTIME',
          message: event.message || 'Uncaught window error',
          stack: event.error?.stack,
          module: 'WindowGlobal',
          screen: window.location.pathname,
          affectedFeature: 'Global Runtime Execution'
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        this.recordIncident({
          category: 'PROMISE',
          message: typeof reason === 'object' && reason ? (reason.message || String(reason)) : String(reason),
          stack: typeof reason === 'object' && reason ? reason.stack : undefined,
          module: 'AsyncPromise',
          screen: window.location.pathname,
          affectedFeature: 'Async Promise Pipeline'
        });
      });
    }
  }

  public subscribe(cb: IncidentSubscriber): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  public recordIncident(params: {
    category?: any;
    message?: string;
    title?: string;
    description?: string;
    stack?: string;
    sanitizedStack?: string;
    module?: string;
    screen?: string;
    affectedModule?: string;
    affectedScreen?: string;
    affectedFeature?: string;
    errorCode?: string;
    suggestedAction?: string;
    isSimulation?: boolean;
  }): GuardianIncident {
    const incident = guardianIncidentService.reportIncident({
      category: params.category || 'RUNTIME',
      title: params.title || params.message || 'System Incident',
      description: params.description || params.message || 'Runtime execution issue logged by Guardian.',
      affectedModule: params.affectedModule || params.module || 'SystemCore',
      affectedScreen: params.affectedScreen || params.screen || '/',
      errorCode: params.errorCode,
      sanitizedStack: params.sanitizedStack || params.stack,
      suggestedAction: params.suggestedAction,
      isSimulation: params.isSimulation
    });

    this.subscribers.forEach(cb => {
      try {
        cb(incident);
      } catch (err) {
        console.warn('Incident subscriber notification failed:', err);
      }
    });

    return incident;
  }

  public clearAllIncidents(): void {
    guardianIncidentService.clearAllIncidents();
  }

  public updateIncidentStatus(id: string, status: GuardianIncident['status']): void {
    guardianIncidentService.updateIncidentStatus(id, status);
  }

  public resolveIncident(id: string): void {
    guardianIncidentService.resolveIncident(id);
  }
}

export const guardianMonitor = new GuardianMonitor();
