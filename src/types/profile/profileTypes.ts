/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — FAMILY PROFILE & MULTI-MOBILE TYPE DEFINITIONS
 * PHASE A: PROFILE SERVICE FOUNDATION
 */

import { BirthProfile } from '../kundli';

export type ProfileRelation = 
  | 'SELF' 
  | 'SPOUSE' 
  | 'CHILD' 
  | 'PARENT' 
  | 'SIBLING' 
  | 'OTHER';

export type ProfileGender = 'MALE' | 'FEMALE' | 'OTHER';

/**
 * Extended profile model supporting family members, relation, and multi-mobile numbers.
 * Fully backward-compatible with BirthProfile.
 */
export interface FamilyMemberProfile extends BirthProfile {
  id: string; // Permanent identifier ('master' for master profile, 'fam_*' for family members)
  gender: ProfileGender;
  relationship: ProfileRelation;
  mobileNumber?: string; // Primary mobile number for Master/Sync
  mobileNumbers?: string[]; // Multi-mobile numerology support
  isMaster?: boolean;
  createdAt?: string; // ISO 8601 string
  updatedAt?: string; // ISO 8601 string
}

export type ProfileErrorCode =
  | 'SUCCESS'
  | 'MASTER_CANNOT_BE_DELETED'
  | 'PROFILE_NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'DUPLICATE_IDENTIFIER'
  | 'CORRUPT_STORAGE_RECOVERED';

export interface ProfileOperationResult<T = FamilyMemberProfile> {
  success: boolean;
  data?: T;
  error?: string;
  code?: ProfileErrorCode;
}
