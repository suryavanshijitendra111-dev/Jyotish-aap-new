/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA CATALOG SERVICE
 * PHASE 1.15D: STATIC, DETERMINISTIC, HUMAN-AUDITED CATALOG FOUNDATION
 * 
 * STRICT INVARIANTS:
 * - Version: 1.0.0
 * - Exactly 4 foundation entries (Shavasana, Sukhasana, Tadasana, Anulom Vilom).
 * - aiGenerated: false (strictly static, deterministic, human-audited).
 * - medicalClaim: false (no medical cures, disease treatments, or clinical promises).
 * - jyotishDependency: false (completely isolated from horoscopes, planets, doshas).
 * - requiresKumbhaka: false (strictly ZERO breath retention).
 * - requiresBreathRetention: false (strictly ZERO breath retention).
 * - requiresRapidBreathing: false (zero hyperventilation, zero Kapalabhati/Bhastrika).
 * - requiresForcefulBreathing: false (natural, unforced breathing).
 * - requiresBandhas: false (zero locks).
 * - requiresInversion: false (zero headstands/shoulderstands).
 * - Anulom Vilom is explicitly classified as a modern adaptation with zero Kumbhaka.
 * - Pure and offline: zero network, zero AI, zero localStorage, zero external APIs.
 */

import {
  YogaCatalogVersion,
  YOGA_CATALOG_VERSION,
  YogaPracticeDefinition,
  YogaPracticeId,
  YogaPracticeCategory,
  YogaCatalogValidationResult
} from '../../types/yogaSadhana/yogaCatalogTypes';

export class YogaCatalogService {
  /**
   * Version of the static Yoga catalog foundation.
   */
  public static readonly VERSION: YogaCatalogVersion = YOGA_CATALOG_VERSION;

  /**
   * Immutable, human-audited catalog containing exactly 4 approved foundation practices.
   * Order:
   * 1. Shavasana (शवासन) — Classical supine resting posture
   * 2. Sukhasana (सुखासन) — Traditional cross-legged seated posture
   * 3. Tadasana (ताड़ासन) — Modern upright standing posture
   * 4. Anulom Vilom (अनुलोम विलोम) — Modern zero-retention alternate nostril breathing
   */
  private static readonly CATALOG: readonly YogaPracticeDefinition[] = Object.freeze([
    // -------------------------------------------------------------
    // 1. SHAVASANA (शवासन)
    // -------------------------------------------------------------
    Object.freeze({
      id: 'shavasana',
      nameHindi: 'शवासन',
      nameEnglish: 'Shavasana',
      category: 'ASANA',
      difficulty: 'BEGINNER',
      safetyLevel: 'LOW_RISK_CANDIDATE',
      sourceClassification: 'CLASSICAL',
      sourceCitation: 'Hatha Yoga Pradipika 1.32; Gheranda Samhita 2.19 (Mritasana)',
      isModernAdaptation: false,
      techniqueSummaryHindi: 'पीठ के बल लेटकर संपूर्ण शरीर को शिथिल करने का पारंपरिक अभ्यास।',
      techniqueSummaryEnglish: 'Traditional practice of resting supine on the back to release bodily tension.',
      instructionsHindi: Object.freeze([
        'चटाई पर पीठ के बल आराम से सीधे लेट जाएं।',
        'पैरों के बीच थोड़ा अंतर रखें और पंजों को स्वाभाविक रूप से बाहर की ओर ढीला छोड़ें।',
        'हाथों को शरीर से थोड़ी दूरी पर रखें, हथेलियां ऊपर की ओर रहें।',
        'आंखें धीरे से बंद करें और सांसों को बिना किसी प्रयास के स्वाभाविक चलने दें।',
        'पूरे शरीर में कहीं भी तनाव न रखें, पूर्ण शांति का अनुभव करें।'
      ]),
      instructionsEnglish: Object.freeze([
        'Lie flat and comfortable on your back on a mat.',
        'Keep your feet slightly apart, letting the toes fall naturally outward.',
        'Place arms alongside the body with a slight gap, palms facing gently upward.',
        'Close the eyes softly and allow breathing to remain natural and unforced.',
        'Release all muscular tension throughout the body and rest in stillness.'
      ]),
      modificationGuidanceHindi: 'यदि कमर में तनाव लगे तो घुटनों के नीचे एक मुड़ा हुआ कंबल या तकिया रख सकते हैं।',
      modificationGuidanceEnglish: 'If lower back feels tense, place a small folded blanket or pillow under the knees.',
      safetyNoticeHindi: 'यह पारंपरिक योग अभ्यास है। अपनी सहज सीमा में करें। दर्द या असहजता होने पर तुरंत रुकें। चिकित्सीय स्थिति में चिकित्सक से सलाह लें।',
      safetyNoticeEnglish: 'This is a traditional yoga practice. Practice within your natural comfort limits. Stop immediately if discomfort occurs. Consult a healthcare provider for any medical condition.',
      contraindicationsHindi: Object.freeze([
        'गंभीर पीठ दर्द होने पर घुटने मोड़कर या सहारा लेकर अभ्यास करें।'
      ]),
      contraindicationsEnglish: Object.freeze([
        'In acute back pain, keep knees gently bent or supported with a pillow.'
      ]),
      defaultDurationSeconds: 300,
      allowedDurationsSeconds: Object.freeze([180, 300, 600]),
      aiGenerated: false,
      humanAudited: true,
      sourceReviewed: true,
      medicalClaim: false,
      jyotishDependency: false,
      requiresKumbhaka: false,
      requiresBreathRetention: false,
      requiresRapidBreathing: false,
      requiresForcefulBreathing: false,
      requiresBandhas: false,
      requiresInversion: false
    }),

    // -------------------------------------------------------------
    // 2. SUKHASANA (सुखासन)
    // -------------------------------------------------------------
    Object.freeze({
      id: 'sukhasana',
      nameHindi: 'सुखासन',
      nameEnglish: 'Sukhasana',
      category: 'ASANA',
      difficulty: 'BEGINNER',
      safetyLevel: 'LOW_RISK_CANDIDATE',
      sourceClassification: 'TRADITIONAL',
      sourceCitation: 'Shandilya Upanishad 1.3.12; Darshana Upanishad 3.13; Hatha Ratnavali 3.57',
      isModernAdaptation: true,
      techniqueSummaryHindi: 'रीढ़ को सीधा और मन को स्थिर रखने हेतु सुखद पालथी मारकर बैठने का पारंपरिक अभ्यास।',
      techniqueSummaryEnglish: 'Traditional comfortable cross-legged seated posture for steady spine and relaxed awareness.',
      instructionsHindi: Object.freeze([
        'फर्श पर चटाई या कंबल बिछाकर बैठें।',
        'पैरों को सहजता से मोड़कर पालथी लगाएं, पंजों को विपरीत जांघों के नीचे आराम से रखें।',
        'रीढ़, गर्दन और सिर को एक सीधी रेखा में रखें, लेकिन शरीर को अकड़ाएं नहीं।',
        'हाथों को ज्ञान मुद्रा में या हथेलियां घुटनों पर रखें।',
        'कंधों को ढीला रखें और स्वाभाविक श्वास-प्रश्वास के साथ स्थिर बैठें।'
      ]),
      instructionsEnglish: Object.freeze([
        'Sit comfortably on a yoga mat or folded blanket on the floor.',
        'Cross legs gently in a comfortable position, feet resting easily beneath opposite thighs.',
        'Keep spine, neck, and head naturally erect without stiffening.',
        'Rest hands comfortably on the knees with palms relaxed.',
        'Soften shoulders and breathe naturally with steady, calm posture.'
      ]),
      modificationGuidanceHindi: 'कूल्हों या घुटनों में जकड़न होने पर किसी कुशन या मुड़े कंबल पर बैठकर रीढ़ सीधी रखें।',
      modificationGuidanceEnglish: 'If hips or knees feel tight, sit on a firm cushion or folded blanket to elevate the pelvis.',
      safetyNoticeHindi: 'यह पारंपरिक योग अभ्यास है। अपनी सहज सीमा में करें। घुटनों पर दबाव न डालें। दर्द होने पर तुरंत रोकें।',
      safetyNoticeEnglish: 'This is a traditional yoga practice. Practice within comfort. Do not force the knees down. Stop if pain occurs.',
      contraindicationsHindi: Object.freeze([
        'घुटने की गंभीर चोट या गठिया में जबरदस्ती पालथी न लगाएं; कुर्सी पर बैठकर कर सकते हैं।'
      ]),
      contraindicationsEnglish: Object.freeze([
        'Avoid forcing cross-legged position if recovering from knee injury; chair seating can be used.'
      ]),
      defaultDurationSeconds: 300,
      allowedDurationsSeconds: Object.freeze([180, 300, 600]),
      aiGenerated: false,
      humanAudited: true,
      sourceReviewed: true,
      medicalClaim: false,
      jyotishDependency: false,
      requiresKumbhaka: false,
      requiresBreathRetention: false,
      requiresRapidBreathing: false,
      requiresForcefulBreathing: false,
      requiresBandhas: false,
      requiresInversion: false
    }),

    // -------------------------------------------------------------
    // 3. TADASANA (ताड़ासन)
    // -------------------------------------------------------------
    Object.freeze({
      id: 'tadasana',
      nameHindi: 'ताड़ासन',
      nameEnglish: 'Tadasana',
      category: 'ASANA',
      difficulty: 'BEGINNER',
      safetyLevel: 'LOW_RISK_CANDIDATE',
      sourceClassification: 'MODERN_ADAPTATION',
      sourceCitation: '20th-century postural yoga lineages (e.g., Light on Yoga / Krishnamacharya); medieval root citation unverified',
      isModernAdaptation: true,
      techniqueSummaryHindi: 'शरीर के संतुलन, सीधी मुद्रा और स्थिरता हेतु समस्थिति में खड़े होने का आधुनिक अभ्यास।',
      techniqueSummaryEnglish: 'Foundational modern upright standing posture promoting balanced body alignment and steady presence.',
      instructionsHindi: Object.freeze([
        'फर्श पर सीधे खड़े हों, पैरों के बीच कूल्हों जितनी दूरी रखें या पैरों को पास रखें।',
        'दोनों पैरों पर शरीर का वजन समान रूप से संतुलित करें।',
        'घुटनों को हल्का रखें (उन्हें पीछे की ओर न अकड़ाएं)।',
        'रीढ़ को ऊपर की ओर लंबा करें, छाती स्वाभाविक खुली रहे और कंधे ढीले रहें।',
        'हाथ शरीर के दोनों ओर स्वाभाविक रूप से रखें और दृष्टि सामने स्थिर रखें।'
      ]),
      instructionsEnglish: Object.freeze([
        'Stand upright on the floor with feet hip-width apart for steady balance.',
        'Distribute body weight evenly across both feet.',
        'Keep knees soft and unlocked without hyperextending.',
        'Lengthen the spine upward with chest naturally open and shoulders relaxed.',
        'Let arms rest gently alongside the body, keeping gaze soft and forward.'
      ]),
      modificationGuidanceHindi: 'संतुलन में असुविधा लगे तो दीवार के सहारे खड़े हों या पैरों के बीच थोड़ी अधिक दूरी रखें।',
      modificationGuidanceEnglish: 'If balance feels unsteady, stand near a wall for support or widen foot stance slightly.',
      safetyNoticeHindi: 'यह पारंपरिक शारीरिक संतुलन अभ्यास है। चक्कर या कमजोरी महसूस होने पर तुरंत बैठ जाएं।',
      safetyNoticeEnglish: 'This is a postural alignment practice. Sit down immediately if you experience dizziness or unsteadiness.',
      contraindicationsHindi: Object.freeze([
        'सिर चकराने या रक्तचाप में अचानक उतार-चढ़ाव होने पर खड़े होकर अभ्यास न करें।'
      ]),
      contraindicationsEnglish: Object.freeze([
        'Do not practice standing if experiencing active dizziness, vertigo, or extreme fatigue.'
      ]),
      defaultDurationSeconds: 180,
      allowedDurationsSeconds: Object.freeze([180, 300]),
      aiGenerated: false,
      humanAudited: true,
      sourceReviewed: true,
      medicalClaim: false,
      jyotishDependency: false,
      requiresKumbhaka: false,
      requiresBreathRetention: false,
      requiresRapidBreathing: false,
      requiresForcefulBreathing: false,
      requiresBandhas: false,
      requiresInversion: false
    }),

    // -------------------------------------------------------------
    // 4. ANULOM VILOM (अनुलोम विलोम)
    // -------------------------------------------------------------
    Object.freeze({
      id: 'anulom_vilom',
      nameHindi: 'अनुलोम विलोम',
      nameEnglish: 'Anulom Vilom',
      category: 'BREATH_AWARENESS',
      difficulty: 'BEGINNER',
      safetyLevel: 'LOW_RISK_CANDIDATE',
      sourceClassification: 'MODERN_ADAPTATION',
      sourceCitation: '20th-century traditional and institutional yoga curricula (e.g., Kaivalyadhama); zero-retention modern adaptation',
      isModernAdaptation: true,
      techniqueSummaryHindi: 'बिना श्वास रोके, दोनों नासिकाओं से क्रमबद्ध और सहज श्वास-प्रश्वास का आधुनिक सामंजस्य अभ्यास।',
      techniqueSummaryEnglish: 'Modern rhythmic alternating nasal breath awareness with strictly zero breath retention and unforced flow.',
      instructionsHindi: Object.freeze([
        'सुखासन या किसी आरामदायक स्थिति में रीढ़ सीधी करके बैठें।',
        'बाएं हाथ को घुटने पर रखें और दाएं हाथ के अंगूठे व अनामिका से नासिका का उपयोग करें।',
        'दाहिनी नासिका को अंगूठे से हल्के से बंद करें और बाईं नासिका से सहज व शांत सांस अंदर लें।',
        'सांस अंदर रोकने (कुंभक) का बिल्कुल प्रयास न करें; तुरंत बाईं नासिका बंद कर दाहिनी से सहज सांस बाहर छोड़ें।',
        'अब दाहिनी से सहज सांस अंदर लें और बाईं से बाहर छोड़ें। यह एक चक्र है।',
        'श्वास में कोई जोर, आवाज या जल्दबाजी न करें; गति बिल्कुल शांत और स्वाभाविक रखें।'
      ]),
      instructionsEnglish: Object.freeze([
        'Sit in Sukhasana or any comfortable upright position with spine gently aligned.',
        'Rest the left hand on the knee; use right thumb and ring finger to alternate nostrils.',
        'Gently close the right nostril with thumb and inhale smoothly through the left nostril.',
        'Do NOT hold the breath (strictly zero Kumbhaka); immediately close left nostril and exhale gently through the right.',
        'Inhale smoothly through the right nostril, then switch and exhale through the left to complete one round.',
        'Maintain a completely natural, unforced pace with zero strain, force, or rapid movement.'
      ]),
      modificationGuidanceHindi: 'यदि हाथ थक जाए तो हाथ बदलकर या बिना उंगली लगाए केवल मानसिक रूप से श्वास पर ध्यान दें।',
      modificationGuidanceEnglish: 'If arm tires, switch hands or practice purely through mental awareness of alternating airflow.',
      safetyNoticeHindi: 'यह सहज श्वास जागरूकता अभ्यास है। इसमें श्वास बिल्कुल न रोकें (कुंभक निषेध)। घुटन या चक्कर आने पर तुरंत सामान्य सांस लें।',
      safetyNoticeEnglish: 'This is a gentle breath awareness practice. Never hold your breath (zero Kumbhaka). Return to normal breathing if any strain occurs.',
      contraindicationsHindi: Object.freeze([
        'नासिका अवरुद्ध होने पर या गंभीर सांस की तकलीफ होने पर सामान्य सांस लें, जोर न लगाएं।'
      ]),
      contraindicationsEnglish: Object.freeze([
        'If nostrils are blocked from cold or acute respiratory distress, breathe naturally without forcing.'
      ]),
      defaultDurationSeconds: 300,
      allowedDurationsSeconds: Object.freeze([180, 300, 600]),
      aiGenerated: false,
      humanAudited: true,
      sourceReviewed: true,
      medicalClaim: false,
      jyotishDependency: false,
      requiresKumbhaka: false,
      requiresBreathRetention: false,
      requiresRapidBreathing: false,
      requiresForcefulBreathing: false,
      requiresBandhas: false,
      requiresInversion: false
    })
  ]);

  /**
   * Returns the catalog version.
   */
  public static getVersion(): YogaCatalogVersion {
    return this.VERSION;
  }

  /**
   * Returns all vetted practices in the frozen catalog.
   */
  public static getAllPractices(): readonly YogaPracticeDefinition[] {
    return this.CATALOG;
  }

  /**
   * Lookup a practice by its unique ID.
   */
  public static getPracticeById(id: string): YogaPracticeDefinition | undefined {
    return this.CATALOG.find(p => p.id === id);
  }

  /**
   * Get all asanas (postures).
   */
  public static getAsanas(): readonly YogaPracticeDefinition[] {
    return this.CATALOG.filter(p => p.category === 'ASANA');
  }

  /**
   * Get all breath awareness practices.
   */
  public static getBreathingPractices(): readonly YogaPracticeDefinition[] {
    return this.CATALOG.filter(p => p.category === 'BREATH_AWARENESS');
  }

  /**
   * Validates the catalog against all safety, architectural, and scope rules.
   */
  public static validateCatalog(
    practices: readonly YogaPracticeDefinition[] = this.CATALOG
  ): YogaCatalogValidationResult {
    const errors: string[] = [];

    // 1. Exact count check (strictly 4)
    if (practices.length !== 4) {
      errors.push(`Expected exactly 4 practices, but found ${practices.length}.`);
    }

    // 2. Expected IDs set
    const expectedIds: YogaPracticeId[] = ['shavasana', 'sukhasana', 'tadasana', 'anulom_vilom'];
    const practiceIds = practices.map(p => p.id);
    for (const expectedId of expectedIds) {
      if (!practiceIds.includes(expectedId)) {
        errors.push(`Missing mandatory practice: "${expectedId}".`);
      }
    }

    // Duplicate ID check
    const idSet = new Set<string>();
    for (const p of practices) {
      if (idSet.has(p.id)) {
        errors.push(`Duplicate practice ID detected: "${p.id}".`);
      }
      idSet.add(p.id);
    }

    // 3. Prohibited terms and pattern audits
    const prohibitedKeywords = [
      'kumbhaka',
      'retention',
      'breath-holding',
      'hold breath',
      'kapalabhati',
      'bhastrika',
      'hyperventilat',
      'bandha',
      'inversion',
      'headstand',
      'shoulderstand',
      'cure',
      'disease treatment',
      'kundalini awakening',
      'chakra activation',
      'siddhi',
      'graha shanti',
      'dosh removal',
      'gemstone'
    ];

    for (const practice of practices) {
      // Invariant checks
      if (practice.aiGenerated !== false) {
        errors.push(`Practice "${practice.id}" must have aiGenerated === false.`);
      }
      if (practice.humanAudited !== true) {
        errors.push(`Practice "${practice.id}" must have humanAudited === true.`);
      }
      if (practice.sourceReviewed !== true) {
        errors.push(`Practice "${practice.id}" must have sourceReviewed === true.`);
      }
      if (practice.medicalClaim !== false) {
        errors.push(`Practice "${practice.id}" must have medicalClaim === false.`);
      }
      if (practice.jyotishDependency !== false) {
        errors.push(`Practice "${practice.id}" must have jyotishDependency === false.`);
      }
      if (practice.requiresKumbhaka !== false) {
        errors.push(`Practice "${practice.id}" must have requiresKumbhaka === false.`);
      }
      if (practice.requiresBreathRetention !== false) {
        errors.push(`Practice "${practice.id}" must have requiresBreathRetention === false.`);
      }
      if (practice.requiresRapidBreathing !== false) {
        errors.push(`Practice "${practice.id}" must have requiresRapidBreathing === false.`);
      }
      if (practice.requiresForcefulBreathing !== false) {
        errors.push(`Practice "${practice.id}" must have requiresForcefulBreathing === false.`);
      }
      if (practice.requiresBandhas !== false) {
        errors.push(`Practice "${practice.id}" must have requiresBandhas === false.`);
      }
      if (practice.requiresInversion !== false) {
        errors.push(`Practice "${practice.id}" must have requiresInversion === false.`);
      }

      // Check non-empty text fields
      if (!practice.nameHindi.trim() || !practice.nameEnglish.trim()) {
        errors.push(`Practice "${practice.id}" has empty name fields.`);
      }
      if (!practice.techniqueSummaryHindi.trim() || !practice.techniqueSummaryEnglish.trim()) {
        errors.push(`Practice "${practice.id}" has empty technique summary.`);
      }
      if (practice.instructionsHindi.length === 0 || practice.instructionsEnglish.length === 0) {
        errors.push(`Practice "${practice.id}" has empty instructions.`);
      }
      if (!practice.modificationGuidanceHindi.trim() || !practice.modificationGuidanceEnglish.trim()) {
        errors.push(`Practice "${practice.id}" has empty modification guidance.`);
      }
      if (!practice.safetyNoticeHindi.trim() || !practice.safetyNoticeEnglish.trim()) {
        errors.push(`Practice "${practice.id}" has empty safety notice.`);
      }
      if (practice.allowedDurationsSeconds.length === 0) {
        errors.push(`Practice "${practice.id}" has no allowed durations.`);
      }

      // Specific Anulom Vilom checks
      if (practice.id === 'anulom_vilom') {
        if (practice.category !== 'BREATH_AWARENESS') {
          errors.push(`Anulom Vilom must be categorized as BREATH_AWARENESS.`);
        }
        if (practice.isModernAdaptation !== true) {
          errors.push(`Anulom Vilom must be marked as isModernAdaptation === true.`);
        }
        if (practice.sourceClassification !== 'MODERN_ADAPTATION') {
          errors.push(`Anulom Vilom must have sourceClassification === 'MODERN_ADAPTATION'.`);
        }
      }

      // Check text for prohibited words
      const textToSearch = [
        practice.techniqueSummaryEnglish,
        practice.modificationGuidanceEnglish,
        practice.safetyNoticeEnglish,
        ...practice.instructionsEnglish,
        ...practice.contraindicationsEnglish
      ].join(' ').toLowerCase();

      for (const keyword of prohibitedKeywords) {
        if (textToSearch.includes(keyword)) {
          // Allow "never hold your breath" or "zero kumbhaka" or "do not hold the breath"
          const benignPhrases = [
            `do not hold the breath`,
            `never hold your breath`,
            `zero kumbhaka`,
            `strictly zero breath retention`,
            `zero breath retention`,
            `zero strain, force, or rapid movement`
          ];
          const isBenign = benignPhrases.some(phrase => textToSearch.includes(phrase));
          if (!isBenign) {
            errors.push(`Practice "${practice.id}" text contains prohibited keyword: "${keyword}".`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      catalogVersion: this.VERSION,
      practiceCount: practices.length,
      errors
    };
  }
}
