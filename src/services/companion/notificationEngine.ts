import { DailyCompanionNotificationPreferences, DailyCompanionTimeSlot, DailyCompanionData } from '../../types/dailyCompanion';
import { getCurrentLanguage, t } from '../../i18n';

const STORAGE_KEY = 'jeevandarpan_companion_notifications_v1';

export const DEFAULT_NOTIFICATION_PREFERENCES: DailyCompanionNotificationPreferences = {
  enabled: true,
  morningTime: '07:00',
  middayTime: '12:30',
  eveningTime: '18:00',
  nightTime: '21:30',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '06:30',
  soundEnabled: true,
  language: 'Hindi'
};

export class NotificationEngine {
  /**
   * Loads user notification preferences from localStorage
   */
  static getPreferences(): DailyCompanionNotificationPreferences {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading notification preferences:', e);
    }
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  /**
   * Saves user notification preferences to localStorage
   */
  static savePreferences(prefs: DailyCompanionNotificationPreferences): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Error saving notification preferences:', e);
    }
  }

  /**
   * Checks if a given time is within quiet hours
   */
  static isWithinQuietHours(
    timeString: string = new Date().toTimeString().slice(0, 5),
    prefs: DailyCompanionNotificationPreferences = this.getPreferences()
  ): boolean {
    if (!prefs.quietHoursEnabled) return false;

    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + (m || 0);
    };

    const currentM = toMinutes(timeString);
    const startM = toMinutes(prefs.quietHoursStart);
    const endM = toMinutes(prefs.quietHoursEnd);

    if (startM > endM) {
      // Spans across midnight, e.g. 22:00 to 06:30
      return currentM >= startM || currentM < endM;
    } else {
      // Within same day, e.g. 13:00 to 15:00
      return currentM >= startM && currentM < endM;
    }
  }

  /**
   * Requests browser notification permission if available
   */
  static async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch (err) {
      console.warn('Notification permission error:', err);
      return 'denied';
    }
  }

  /**
   * Dispatches or simulates sending a daily companion notification
   */
  static async sendNotification(
    slot: DailyCompanionTimeSlot,
    data: DailyCompanionData,
    force: boolean = false
  ): Promise<{ success: boolean; reason?: string }> {
    const prefs = this.getPreferences();

    if (!prefs.enabled && !force) {
      return { success: false, reason: 'Notifications are disabled in settings.' };
    }

    const nowStr = new Date().toTimeString().slice(0, 5);
    if (!force && this.isWithinQuietHours(nowStr, prefs)) {
      return { success: false, reason: 'Quiet hours are active.' };
    }

    const slotMsg = data.timeSlotMessages[slot];
    if (!slotMsg) {
      return { success: false, reason: 'Time slot message unavailable.' };
    }

    const currentLang = getCurrentLanguage();
    const title = currentLang === 'en' ? (slotMsg.titleEnglish || slotMsg.titleHindi) : slotMsg.titleHindi;
    const body = `${slotMsg.greeting}\n${slotMsg.focusGuidance}`;

    // Play subtle chime sound if enabled
    if (prefs.soundEnabled && typeof window !== 'undefined' && window.AudioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz love/peace frequency
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } catch (e) {
        // Audio playback error ignore
      }
    }

    // Check Web Notification API
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: `jeevandarpan-${slot}`
        });
        prefs.lastNotifiedDate = data.date;
        prefs.lastNotifiedSlot = slot;
        this.savePreferences(prefs);
        return { success: true };
      } catch (e) {
        console.warn('Web notification dispatch error:', e);
      }
    }

    // In-app fallback acknowledgment
    prefs.lastNotifiedDate = data.date;
    prefs.lastNotifiedSlot = slot;
    this.savePreferences(prefs);
    return { success: true, reason: 'In-app simulated notification sent.' };
  }
}
