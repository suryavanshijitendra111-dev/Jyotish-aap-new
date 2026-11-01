/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RollbackSnapshot, BackupManifest } from '../../types/backup';
import { BackupService } from './backupService';

export class RollbackService {
  public static createSnapshot(label: string, targetBackupId: string): RollbackSnapshot {
    const backup = BackupService.createFullBackup(label);
    return {
      id: `rb_${Date.now()}`,
      timestamp: Date.now(),
      label,
      targetBackupId,
      previousStateBackup: backup
    };
  }
}
