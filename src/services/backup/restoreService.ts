/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BackupManifest, RestoreOptions, RestoreResult } from '../../types/backup';
import { ProfileService } from '../profile/profileService';

export class RestoreService {
  public static async executeRestore(manifest: BackupManifest, options: RestoreOptions): Promise<RestoreResult> {
    try {
      const payload = manifest.payload;
      if (options.restoreFamilyProfiles && payload.familyProfiles) {
        localStorage.setItem('jeevandarpan_family_profiles', JSON.stringify(payload.familyProfiles));
      }
      if (options.restoreMasterProfile && payload.masterProfile) {
        localStorage.setItem('jeevandarpan_master_profile', JSON.stringify(payload.masterProfile));
      }
      if (payload.activeProfileId) {
        ProfileService.setActiveProfileId(payload.activeProfileId);
      } else {
        ProfileService.setActiveProfileId('master');
      }

      return {
        success: true,
        message: 'Restore completed successfully',
        restoredCategories: ['profiles'],
        timestamp: Date.now()
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Restore failed',
        restoredCategories: [],
        timestamp: Date.now()
      };
    }
  }
}
