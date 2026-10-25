import { GuardianIncident, IncidentSeverity } from '../../types/ownerControl';
import { t } from '../../i18n';

export type NotificationChannel = 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS';

export interface OwnerNotification {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  severity: IncidentSeverity;
  incidentId?: string;
  channel: NotificationChannel;
  read: boolean;
  status?: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'jeevandarpan_owner_notifications';
let notificationListeners: Array<(notifications: OwnerNotification[], unreadCount: number) => void> = [];

export function getStoredNotifications(): OwnerNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    let updated = false;
    const normalized = list.map((item: any) => {
      const isHistoricalFetch = item.incidentId === 'inc_1789906572846_d0sgv5' || 
        (item.title && String(item.title).includes('fetch of #<Window>')) ||
        (item.message && String(item.message).includes('fetch of #<Window>'));
      if (isHistoricalFetch && !item.read) {
        updated = true;
        return { ...item, read: true, status: 'RESOLVED_HISTORICAL' };
      }
      return item;
    });

    if (updated) {
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(normalized.slice(0, 50)));
      } catch {}
    }

    return normalized;
  } catch {
    return [];
  }
}

export function saveStoredNotifications(list: OwnerNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    const unread = list.filter(n => !n.read).length;
    window.dispatchEvent(new CustomEvent('jeevandarpan_notifications_updated', { 
      detail: { notifications: list, unreadCount: unread } 
    }));
  } catch (err) {
    console.warn('Failed to save owner notifications:', err);
  }
}

export class OwnerNotificationService {
  private static instance: OwnerNotificationService;

  private constructor() {}

  public static getInstance(): OwnerNotificationService {
    if (!OwnerNotificationService.instance) {
      OwnerNotificationService.instance = new OwnerNotificationService();
    }
    return OwnerNotificationService.instance;
  }

  public subscribe(callback: (notifications: OwnerNotification[], unreadCount: number) => void): () => void {
    notificationListeners.push(callback);
    return () => {
      notificationListeners = notificationListeners.filter(cb => cb !== callback);
    };
  }

  public getNotifications(): OwnerNotification[] {
    return getStoredNotifications();
  }

  /**
   * Dispatches a notification across specified channel
   */
  public async sendNotification(params: {
    title: string;
    message: string;
    severity: IncidentSeverity;
    channel?: NotificationChannel;
    incidentId?: string;
  }): Promise<{ success: boolean; channel: NotificationChannel; error?: string }> {
    const channel = params.channel || 'IN_APP';

    if (channel === 'IN_APP') {
      const notifications = getStoredNotifications();
      const newNotification: OwnerNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: Date.now(),
        title: params.title,
        message: params.message,
        severity: params.severity,
        incidentId: params.incidentId,
        channel: 'IN_APP',
        read: false,
      };

      notifications.unshift(newNotification);
      saveStoredNotifications(notifications);

      const unread = notifications.filter(n => !n.read).length;
      notificationListeners.forEach(fn => fn(notifications, unread));

      return { success: true, channel: 'IN_APP' };
    }

    if (channel === 'PUSH') {
      // If browser/native push is not configured, DO NOT pretend that push notification is working!
      const isPushConfigured = typeof window !== 'undefined' && 
                               'Notification' in window && 
                               'serviceWorker' in navigator && 
                               Notification.permission === 'granted';

      if (!isPushConfigured) {
        return {
          success: false,
          channel: 'PUSH',
          error: t('guardian.pushNotConfigured') || 'Push notification configured नहीं है',
        };
      }

      try {
        new Notification(params.title, {
          body: params.message,
          icon: '/favicon.ico',
        });
        return { success: true, channel: 'PUSH' };
      } catch {
        return {
          success: false,
          channel: 'PUSH',
          error: t('guardian.pushNotConfigured') || 'Push notification configured नहीं है',
        };
      }
    }

    // EMAIL or SMS channels
    return {
      success: false,
      channel,
      error: `${channel} gateway configured नहीं है`,
    };
  }

  /**
   * Notifies Owner about a technical incident
   */
  public notifyIncident(incident: GuardianIncident): void {
    const title = incident.title || `तकनीकी चेतावनी (${incident.errorCode})`;
    const message = `${incident.description}\n[${incident.affectedModule}]`;

    this.sendNotification({
      title,
      message,
      severity: incident.severity,
      channel: 'IN_APP',
      incidentId: incident.id,
    });
  }

  public getUnreadCount(): number {
    return getStoredNotifications().filter(n => !n.read).length;
  }

  public markAsRead(id: string): void {
    const notifications = getStoredNotifications();
    const target = notifications.find(n => n.id === id);
    if (target) {
      target.read = true;
      saveStoredNotifications(notifications);
      const unread = notifications.filter(n => !n.read).length;
      notificationListeners.forEach(fn => fn(notifications, unread));
    }
  }

  public markAllAsRead(): void {
    const notifications = getStoredNotifications();
    notifications.forEach(n => { n.read = true; });
    saveStoredNotifications(notifications);
    notificationListeners.forEach(fn => fn(notifications, 0));
  }

  public clearAll(): void {
    saveStoredNotifications([]);
    notificationListeners.forEach(fn => fn([], 0));
  }
}

export const ownerNotificationService = OwnerNotificationService.getInstance();
