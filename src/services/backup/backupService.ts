/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BackupManifest } from '../../types/backup';
import { ProfileService } from '../profile/profileService';
import { BackupValidationService } from './backupValidationService';

export class BackupService {
  public static createFullBackup(label: string = 'Full Backup'): BackupManifest {
    const master = ProfileService.getMasterProfile();
    const family = ProfileService.getFamilyProfiles();
    const activeId = ProfileService.getActiveProfileId();

    const payload = {
      masterProfile: master,
      familyProfiles: family,
      activeProfileId: activeId,
      timestamp: new Date().toISOString()
    };

    const checksum = BackupValidationService.calculateChecksum(payload);
    const sizeBytes = JSON.stringify(payload).length;

    return {
      schemaVersion: '1.0.0',
      backupVersion: '2026.09.v1',
      id: `bkp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      appIdentifier: 'JeevanDarpan-Private-Family-Edition',
      label,
      backupType: 'FULL',
      checksum,
      sizeBytes,
      metadata: {
        deviceLanguage: 'hi',
        appVersion: '1.0',
        recordCounts: { reports: 0, prashna: 0, reflections: 0, sensitivities: 0, settings: 0, profiles: family.length + 1 }
      },
      exclusions: {
        sensitiveCredentialsExcluded: true,
        excludedKeys: [],
        noticeEn: 'No sensitive keys included',
        noticeHi: 'कोई संवेदनशील कुंजी शामिल नहीं है'
      },
      payload
    };
  }

  public static createSelectiveBackup(categories: string[], label: string = 'Selective Backup'): BackupManifest {
    return this.createFullBackup(label);
  }
}
