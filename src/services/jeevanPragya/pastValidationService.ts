/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PAST VALIDATION SERVICE
 */

import { BirthProfile } from '../../types/kundli';
import { ValidationSelection } from '../../types/jeevanPragya/jeevanPragyaTypes';

const STORAGE_PREFIX = 'jeevandarpan_past_val_';

function safeGet(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return null;
}

function safeSet(key: string, val: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    }
  } catch {}
}

export class PastValidationService {
  public static getProfileId(profile: BirthProfile | null): string {
    return profile?.id || 'master';
  }

  public static getFeedbackForProfile(profileId: string): Record<string, ValidationSelection> {
    const raw = safeGet(`${STORAGE_PREFIX}${profileId}`);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {}
    return {};
  }

  public static saveFeedback(
    profileId: string,
    cardId: string,
    selection: ValidationSelection,
    userNotes?: string,
    actualYearObserved?: number,
    language: string = 'hi'
  ): void {
    const current = this.getFeedbackForProfile(profileId);
    current[cardId] = selection;
    safeSet(`${STORAGE_PREFIX}${profileId}`, JSON.stringify(current));
  }
}
