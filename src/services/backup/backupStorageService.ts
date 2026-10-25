import { BackupManifest, RollbackSnapshot } from '../../types/backup';
import { BackupValidationService } from './backupValidationService';

const BACKUPS_STORAGE_KEY = 'jeevandarpan_backups_manifests';
const ROLLBACK_STORAGE_KEY = 'jeevandarpan_rollback_snapshots';
const MAX_STORED_BACKUPS = 20;
const MAX_ROLLBACK_SNAPSHOTS = 10;

export class BackupStorageService {
  public static getStoredBackups(): BackupManifest[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(BACKUPS_STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      console.warn('Failed to load stored backups:', err);
      return [];
    }
  }

  public static saveBackup(manifest: BackupManifest): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const list = this.getStoredBackups();
      const existingIdx = list.findIndex(b => b.id === manifest.id);
      if (existingIdx >= 0) {
        list[existingIdx] = manifest;
      } else {
        list.unshift(manifest);
      }
      const trimmed = list.slice(0, MAX_STORED_BACKUPS);
      localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(trimmed));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jeevandarpan_backups_updated', { detail: trimmed }));
      }
    } catch (err) {
      console.warn('Failed to save backup to storage:', err);
    }
  }

  public static deleteBackup(id: string): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
      const list = this.getStoredBackups();
      const filtered = list.filter(b => b.id !== id);
      if (filtered.length === list.length) return false;
      localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(filtered));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jeevandarpan_backups_updated', { detail: filtered }));
      }
      return true;
    } catch {
      return false;
    }
  }

  public static getRollbackSnapshots(): RollbackSnapshot[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(ROLLBACK_STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (err) {
      console.warn('Failed to load rollback snapshots:', err);
      return [];
    }
  }

  public static saveRollbackSnapshot(snapshot: RollbackSnapshot): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const list = this.getRollbackSnapshots();
      list.unshift(snapshot);
      const trimmed = list.slice(0, MAX_ROLLBACK_SNAPSHOTS);
      localStorage.setItem(ROLLBACK_STORAGE_KEY, JSON.stringify(trimmed));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jeevandarpan_rollbacks_updated', { detail: trimmed }));
      }
    } catch (err) {
      console.warn('Failed to save rollback snapshot:', err);
    }
  }

  public static deleteRollbackSnapshot(id: string): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
      const list = this.getRollbackSnapshots();
      const filtered = list.filter(s => s.id !== id);
      if (filtered.length === list.length) return false;
      localStorage.setItem(ROLLBACK_STORAGE_KEY, JSON.stringify(filtered));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jeevandarpan_rollbacks_updated', { detail: filtered }));
      }
      return true;
    } catch {
      return false;
    }
  }

  public static exportBackupToJsonFile(manifest: BackupManifest): void {
    if (typeof window === 'undefined') return;
    const jsonStr = JSON.stringify(manifest, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date(manifest.createdAt).toISOString().split('T')[0];
    const filename = `jeevandarpan_backup_${dateStr}_${manifest.id}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  public static importBackupFromJsonFile(file: File): Promise<BackupManifest> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const report = BackupValidationService.validateBackup(content);
          if (!report.valid || !report.manifest) {
            reject(new Error(report.errors.join('; ') || 'अमान्य बैकअप फ़ाइल'));
            return;
          }
          resolve(report.manifest);
        } catch (err: any) {
          reject(new Error(`फ़ाइल पढ़ने में त्रुटि: ${err?.message || 'अज्ञात त्रुटि'}`));
        }
      };
      reader.onerror = () => reject(new Error('फ़ाइल लोड करने में विफलता।'));
      reader.readAsText(file);
    });
  }

  public static getTotalStorageUsageBytes(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const rawBackups = localStorage.getItem(BACKUPS_STORAGE_KEY) || '';
      const rawRollbacks = localStorage.getItem(ROLLBACK_STORAGE_KEY) || '';
      return (rawBackups.length + rawRollbacks.length) * 2; // Approximate UTF-16 bytes
    } catch {
      return 0;
    }
  }
}
