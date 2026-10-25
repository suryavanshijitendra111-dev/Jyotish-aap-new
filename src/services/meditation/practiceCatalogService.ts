/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PRACTICE CATALOG SERVICE
 * PHASE 1.14C: DETERMINISTIC, PURE, IMMUTABLE PRACTICE CATALOG
 * 
 * STRICT INVARIANTS:
 * - Exactly 6 vetted practices. Deterministic, unchanging order.
 * - medicalClaim = false, jyotishDependency = false, requiresBreathControl = false across all items.
 * - Language-neutral IDs and keys. All copy references i18n keys.
 * - Pure and offline: zero network, zero AI, zero localStorage, zero external APIs.
 */

import {
  PracticeDefinition,
  PracticeId,
  PracticeCategory,
  PracticeDifficulty,
  SafetyLevel
} from '../../types/meditation/practiceCatalogTypes';
import { ALLOWED_SESSION_DURATIONS, DEFAULT_SESSION_DURATION } from '../../types/meditation/meditationTypes';

export class PracticeCatalogService {
  /**
   * Complete, audited, and immutable catalog of approved initial practices.
   * STRICT ORDER:
   * 1. BREATH_AWARENESS
   * 2. SILENT_MEDITATION
   * 3. BODY_AWARENESS
   * 4. GRATITUDE_REFLECTION
   * 5. SELF_OBSERVATION
   * 6. PRAYERFUL_CONTEMPLATION
   */
  private static readonly CATALOG: readonly PracticeDefinition[] = Object.freeze([
    // -------------------------------------------------------------
    // 1. BREATH_AWARENESS (श्वास जागरूकता)
    // -------------------------------------------------------------
    {
      practiceId: 'BREATH_AWARENESS',
      category: 'BREATH_AWARENESS',
      difficulty: 'BEGINNER',
      defaultDurationSeconds: DEFAULT_SESSION_DURATION,
      allowedDurations: ALLOWED_SESSION_DURATIONS,
      safetyLevel: 'LOW_RISK',
      voiceGuidanceSupported: true,
      ambientAudioSupported: true,
      requiresTimer: true,
      requiresBreathControl: false,
      requiresPhysicalMovement: false,
      spiritualContent: false,
      medicalClaim: false,
      jyotishDependency: false,
      titleKey: 'meditation.practices.breath_awareness.title',
      descriptionKey: 'meditation.practices.breath_awareness.desc',
      instructionsKey: 'meditation.practices.breath_awareness.instructions',
      safetyNoticeKey: 'meditation.practices.breath_awareness.safety',
      phases: [
        { phase: 'INTRO', durationSeconds: 30, voiceCueKey: 'meditation.cues.breath_intro' },
        { phase: 'SETTLE', durationSeconds: 30, voiceCueKey: 'meditation.cues.settle_posture' },
        { phase: 'PRACTICE', durationSeconds: 480, voiceCueKey: 'meditation.cues.observe_breath' },
        { phase: 'SILENCE', durationSeconds: 60, bellAtStart: true },
        { phase: 'COMPLETE', durationSeconds: 0, bellAtStart: true }
      ]
    },

    // -------------------------------------------------------------
    // 2. SILENT_MEDITATION (मौन ध्यान)
    // -------------------------------------------------------------
    {
      practiceId: 'SILENT_MEDITATION',
      category: 'SILENT_MEDITATION',
      difficulty: 'OPEN_TO_ALL',
      defaultDurationSeconds: DEFAULT_SESSION_DURATION,
      allowedDurations: ALLOWED_SESSION_DURATIONS,
      safetyLevel: 'LOW_RISK',
      voiceGuidanceSupported: false,
      ambientAudioSupported: true,
      requiresTimer: true,
      requiresBreathControl: false,
      requiresPhysicalMovement: false,
      spiritualContent: false,
      medicalClaim: false,
      jyotishDependency: false,
      titleKey: 'meditation.practices.silent_meditation.title',
      descriptionKey: 'meditation.practices.silent_meditation.desc',
      instructionsKey: 'meditation.practices.silent_meditation.instructions',
      safetyNoticeKey: 'meditation.practices.silent_meditation.safety',
      phases: [
        { phase: 'SETTLE', durationSeconds: 30, bellAtStart: true },
        { phase: 'SILENCE', durationSeconds: 570 },
        { phase: 'COMPLETE', durationSeconds: 0, bellAtStart: true }
      ]
    },

    // -------------------------------------------------------------
    // 3. BODY_AWARENESS (शरीर-जागरूकता)
    // -------------------------------------------------------------
    {
      practiceId: 'BODY_AWARENESS',
      category: 'BODY_AWARENESS',
      difficulty: 'BEGINNER',
      defaultDurationSeconds: DEFAULT_SESSION_DURATION,
      allowedDurations: ALLOWED_SESSION_DURATIONS,
      safetyLevel: 'LOW_RISK',
      voiceGuidanceSupported: true,
      ambientAudioSupported: true,
      requiresTimer: true,
      requiresBreathControl: false,
      requiresPhysicalMovement: false,
      spiritualContent: false,
      medicalClaim: false,
      jyotishDependency: false,
      titleKey: 'meditation.practices.body_awareness.title',
      descriptionKey: 'meditation.practices.body_awareness.desc',
      instructionsKey: 'meditation.practices.body_awareness.instructions',
      safetyNoticeKey: 'meditation.practices.body_awareness.safety',
      phases: [
        { phase: 'INTRO', durationSeconds: 30, voiceCueKey: 'meditation.cues.body_intro' },
        { phase: 'SETTLE', durationSeconds: 30, voiceCueKey: 'meditation.cues.settle_feet' },
        { phase: 'PRACTICE', durationSeconds: 480, voiceCueKey: 'meditation.cues.progressive_scan' },
        { phase: 'SILENCE', durationSeconds: 60, bellAtStart: true },
        { phase: 'COMPLETE', durationSeconds: 0, bellAtStart: true }
      ]
    },

    // -------------------------------------------------------------
    // 4. GRATITUDE_REFLECTION (कृतज्ञता चिंतन)
    // -------------------------------------------------------------
    {
      practiceId: 'GRATITUDE_REFLECTION',
      category: 'GRATITUDE_REFLECTION',
      difficulty: 'BEGINNER',
      defaultDurationSeconds: DEFAULT_SESSION_DURATION,
      allowedDurations: ALLOWED_SESSION_DURATIONS,
      safetyLevel: 'GENERAL_WELLNESS',
      voiceGuidanceSupported: true,
      ambientAudioSupported: true,
      requiresTimer: true,
      requiresBreathControl: false,
      requiresPhysicalMovement: false,
      spiritualContent: true,
      medicalClaim: false,
      jyotishDependency: false,
      titleKey: 'meditation.practices.gratitude_reflection.title',
      descriptionKey: 'meditation.practices.gratitude_reflection.desc',
      instructionsKey: 'meditation.practices.gratitude_reflection.instructions',
      safetyNoticeKey: 'meditation.practices.gratitude_reflection.safety',
      phases: [
        { phase: 'INTRO', durationSeconds: 30, voiceCueKey: 'meditation.cues.gratitude_intro' },
        { phase: 'SETTLE', durationSeconds: 30, voiceCueKey: 'meditation.cues.settle_heart' },
        { phase: 'PRACTICE', durationSeconds: 420, voiceCueKey: 'meditation.cues.reflect_blessings' },
        { phase: 'SILENCE', durationSeconds: 120, bellAtStart: true },
        { phase: 'COMPLETE', durationSeconds: 0, bellAtStart: true }
      ]
    },

    // -------------------------------------------------------------
    // 5. SELF_OBSERVATION (आत्मनिरीक्षण)
    // -------------------------------------------------------------
    {
      practiceId: 'SELF_OBSERVATION',
      category: 'SELF_OBSERVATION',
      difficulty: 'INTERMEDIATE',
      defaultDurationSeconds: DEFAULT_SESSION_DURATION,
      allowedDurations: ALLOWED_SESSION_DURATIONS,
      safetyLevel: 'GENERAL_WELLNESS',
      voiceGuidanceSupported: true,
      ambientAudioSupported: true,
      requiresTimer: true,
      requiresBreathControl: false,
      requiresPhysicalMovement: false,
      spiritualContent: true,
      medicalClaim: false,
      jyotishDependency: false,
      titleKey: 'meditation.practices.self_observation.title',
      descriptionKey: 'meditation.practices.self_observation.desc',
      instructionsKey: 'meditation.practices.self_observation.instructions',
      safetyNoticeKey: 'meditation.practices.self_observation.safety',
      phases: [
        { phase: 'INTRO', durationSeconds: 30, voiceCueKey: 'meditation.cues.sakshi_intro' },
        { phase: 'SETTLE', durationSeconds: 30, voiceCueKey: 'meditation.cues.settle_mind' },
        { phase: 'PRACTICE', durationSeconds: 420, voiceCueKey: 'meditation.cues.observe_thoughts' },
        { phase: 'SILENCE', durationSeconds: 120, bellAtStart: true },
        { phase: 'COMPLETE', durationSeconds: 0, bellAtStart: true }
      ]
    },

    // -------------------------------------------------------------
    // 6. PRAYERFUL_CONTEMPLATION (प्रार्थना एवं आध्यात्मिक चिंतन)
    // -------------------------------------------------------------
    {
      practiceId: 'PRAYERFUL_CONTEMPLATION',
      category: 'PRAYERFUL_CONTEMPLATION',
      difficulty: 'OPEN_TO_ALL',
      defaultDurationSeconds: DEFAULT_SESSION_DURATION,
      allowedDurations: ALLOWED_SESSION_DURATIONS,
      safetyLevel: 'GENERAL_WELLNESS',
      voiceGuidanceSupported: true,
      ambientAudioSupported: true,
      requiresTimer: true,
      requiresBreathControl: false,
      requiresPhysicalMovement: false,
      spiritualContent: true,
      medicalClaim: false,
      jyotishDependency: false,
      titleKey: 'meditation.practices.prayerful_contemplation.title',
      descriptionKey: 'meditation.practices.prayerful_contemplation.desc',
      instructionsKey: 'meditation.practices.prayerful_contemplation.instructions',
      safetyNoticeKey: 'meditation.practices.prayerful_contemplation.safety',
      phases: [
        { phase: 'INTRO', durationSeconds: 30, voiceCueKey: 'meditation.cues.prayer_intro' },
        { phase: 'SETTLE', durationSeconds: 30, voiceCueKey: 'meditation.cues.settle_reverence' },
        { phase: 'PRACTICE', durationSeconds: 420, voiceCueKey: 'meditation.cues.universal_wellbeing' },
        { phase: 'SILENCE', durationSeconds: 120, bellAtStart: true },
        { phase: 'COMPLETE', durationSeconds: 0, bellAtStart: true }
      ]
    }
  ]);

  private static readonly VALID_PRACTICE_IDS: ReadonlySet<string> = new Set([
    'BREATH_AWARENESS',
    'SILENT_MEDITATION',
    'BODY_AWARENESS',
    'GRATITUDE_REFLECTION',
    'SELF_OBSERVATION',
    'PRAYERFUL_CONTEMPLATION'
  ]);

  /**
   * Returns all vetted practices in deterministic, frozen sequence.
   */
  public static getAllPractices(): readonly PracticeDefinition[] {
    return this.CATALOG;
  }

  /**
   * Retrieves a practice definition by its unique identifier.
   */
  public static getPracticeById(id: PracticeId | string): PracticeDefinition | undefined {
    return this.CATALOG.find(p => p.practiceId === id);
  }

  /**
   * Filters practices by category.
   */
  public static getPracticesByCategory(category: PracticeCategory): PracticeDefinition[] {
    return this.CATALOG.filter(p => p.category === category);
  }

  /**
   * Filters practices by difficulty level.
   */
  public static getPracticesByDifficulty(difficulty: PracticeDifficulty): PracticeDefinition[] {
    return this.CATALOG.filter(p => p.difficulty === difficulty);
  }

  /**
   * Returns the primary default practice for initial sessions.
   */
  public static getDefaultPractice(): PracticeDefinition {
    return this.CATALOG[0]; // BREATH_AWARENESS
  }

  /**
   * Type-guard to check if an arbitrary string is an approved PracticeId.
   */
  public static isPracticeIdValid(id: string): id is PracticeId {
    return this.VALID_PRACTICE_IDS.has(id);
  }

  /**
   * Validates a candidate practice definition against safety and architectural constraints.
   * Returns validation status with all violations if invalid.
   */
  public static validatePracticeDefinition(practice: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!practice || typeof practice !== 'object') {
      return { valid: false, errors: ['Practice definition must be a non-null object.'] };
    }

    const p = practice as Record<string, unknown>;

    // 1. Identity & Category Check
    if (!p.practiceId || typeof p.practiceId !== 'string' || !this.VALID_PRACTICE_IDS.has(p.practiceId)) {
      errors.push(`Invalid or unapproved practiceId: ${String(p.practiceId)}`);
    }

    if (!p.category || typeof p.category !== 'string') {
      errors.push('Missing or invalid category.');
    }

    // 2. Strict Safety & Medical Invariants
    if (p.medicalClaim !== false) {
      errors.push('Safety violation: medicalClaim must be strictly false.');
    }

    if (p.jyotishDependency !== false) {
      errors.push('Architectural violation: jyotishDependency must be strictly false.');
    }

    if (p.requiresBreathControl !== false) {
      errors.push('Safety violation: requiresBreathControl must be strictly false.');
    }

    if (p.requiresPhysicalMovement !== false) {
      errors.push('Safety violation: requiresPhysicalMovement must be strictly false.');
    }

    // 3. Prohibited Dynamic/Commercial/Astrological Fields
    const prohibitedKeys = [
      'doshId',
      'remedyId',
      'planetaryAffliction',
      'graha',
      'dasha',
      'transit',
      'kundli',
      'kp',
      'numerology',
      'price',
      'gemstone',
      'affiliateUrl',
      'bookingUrl',
      'aiPrompt',
      'kumbhakaRatio'
    ];

    for (const key of prohibitedKeys) {
      if (key in p) {
        errors.push(`Prohibited field detected: ${key}`);
      }
    }

    // 4. Timing & Durations
    if (typeof p.defaultDurationSeconds !== 'number' || !ALLOWED_SESSION_DURATIONS.includes(p.defaultDurationSeconds as any)) {
      errors.push(`defaultDurationSeconds must be one of ${ALLOWED_SESSION_DURATIONS.join(', ')}`);
    }

    if (!Array.isArray(p.allowedDurations) || p.allowedDurations.length === 0) {
      errors.push('allowedDurations must be a non-empty array of valid durations.');
    } else {
      for (const d of p.allowedDurations) {
        if (!ALLOWED_SESSION_DURATIONS.includes(d)) {
          errors.push(`Disallowed duration value: ${d}`);
        }
      }
    }

    // 5. Localization Key Enforcement
    const requiredKeys = ['titleKey', 'descriptionKey', 'instructionsKey', 'safetyNoticeKey'];
    for (const k of requiredKeys) {
      if (typeof p[k] !== 'string' || (p[k] as string).trim() === '') {
        errors.push(`Missing or invalid i18n key: ${k}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
