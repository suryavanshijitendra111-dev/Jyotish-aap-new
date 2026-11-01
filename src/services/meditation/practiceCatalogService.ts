/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION PRACTICE CATALOG SERVICE
 */

import { PracticeDefinition, PracticeId } from '../../types/meditation/practiceCatalogTypes';
import { ALLOWED_SESSION_DURATIONS, DEFAULT_SESSION_DURATION } from '../../types/meditation/meditationTypes';

const CATALOG: PracticeDefinition[] = [
  {
    practiceId: 'BREATH_AWARENESS',
    titleHindi: 'श्वास सजगता (आनापान)',
    titleEnglish: 'Breath Awareness (Anapana)',
    descriptionHindi: 'स्वाभाविक श्वास के आने और जाने पर शांत, साक्षी भाव से ध्यान केंद्रित करना।',
    descriptionEnglish: 'Mindfully observing natural inhalation and exhalation without control or force.',
    defaultDurationSeconds: DEFAULT_SESSION_DURATION,
    allowedDurations: [...ALLOWED_SESSION_DURATIONS],
    medicalClaim: false,
    jyotishDependency: false,
    isOfflineAvailable: true,
    instructionsHindi: [
      'सुखासन या कुर्सी पर मेरुदंड सीधा रखकर बैठें।',
      'नेत्र कोमलता से बंद करें और स्वाभाविक श्वास का अनुभव करें।',
      'विचार आएं तो बिना उलझे पुनः श्वास पर लौट आएं।'
    ],
    instructionsEnglish: [
      'Sit comfortably with an erect spine.',
      'Gently close your eyes and observe natural breathing.',
      'When thoughts arise, gently bring attention back to the breath.'
    ],
    contraindicationsHindi: ['कोई नहीं। सभी के लिए सुरक्षित।'],
    contraindicationsEnglish: ['None. Safe for all.'],
    safetyNoticeHindi: 'यदि चक्कर या असुविधा महसूस हो तो सामान्य विश्राम करें।',
    safetyNoticeEnglish: 'If feeling dizzy or uneasy, discontinue and rest normally.',
    iconName: 'Wind'
  },
  {
    practiceId: 'SILENT_MEDITATION',
    titleHindi: 'मौन ध्यान (Silent Meditation)',
    titleEnglish: 'Silent Meditation',
    descriptionHindi: 'आंतरिक एवं बाह्य मौन की स्थिति में चित्त के स्वाभाविक ठहराव का अनुभव।',
    descriptionEnglish: 'Resting in pure inner silence without guided cues or mental commentary.',
    defaultDurationSeconds: DEFAULT_SESSION_DURATION,
    allowedDurations: [...ALLOWED_SESSION_DURATIONS],
    medicalClaim: false,
    jyotishDependency: false,
    isOfflineAvailable: true,
    instructionsHindi: [
      'शांत वातावरण में बैठें।',
      'सभी क्रियाकलापों से विराम लेकर केवल उपस्थित रहें।'
    ],
    instructionsEnglish: [
      'Sit in a quiet space.',
      'Pause all active effort and rest in present awareness.'
    ],
    contraindicationsHindi: ['गंभीर अवसाद की स्थिति में छोटे सत्र चुनें।'],
    contraindicationsEnglish: ['In acute depression, prefer shorter 3-minute sessions.'],
    safetyNoticeHindi: 'यह कोई चिकित्सकीय उपचार नहीं है।',
    safetyNoticeEnglish: 'This is not a substitute for medical or clinical therapy.',
    iconName: 'Compass'
  },
  {
    practiceId: 'BODY_AWARENESS',
    titleHindi: 'काया सजगता (Body Scan)',
    titleEnglish: 'Body Scan Awareness',
    descriptionHindi: 'पादतल से लेकर मस्तक तक प्रत्येक अंग के प्रति संवेदनशील साक्षी भाव।',
    descriptionEnglish: 'Systematic observation of bodily sensations from feet to crown.',
    defaultDurationSeconds: DEFAULT_SESSION_DURATION,
    allowedDurations: [...ALLOWED_SESSION_DURATIONS],
    medicalClaim: false,
    jyotishDependency: false,
    isOfflineAvailable: true,
    instructionsHindi: [
      'शरीर को शिथिल छोड़ें।',
      'क्रमशः पैरों, उदर, वक्ष, भुजाओं और मुख पर सजगता ले जाएं।'
    ],
    instructionsEnglish: [
      'Relax the entire physical frame.',
      'Sequentially direct awareness across feet, abdomen, chest, arms, and face.'
    ],
    contraindicationsHindi: ['शारीरिक असहजता होने पर स्थिति बदलें।'],
    contraindicationsEnglish: ['Shift posture if experiencing discomfort.'],
    safetyNoticeHindi: 'दर्द या तनाव की स्थिति में खिंचाव न करें।',
    safetyNoticeEnglish: 'Do not strain muscles; maintain effortless observation.',
    iconName: 'Activity'
  },
  {
    practiceId: 'GRATITUDE_REFLECTION',
    titleHindi: 'कृतज्ञता भाव (Gratitude Reflection)',
    titleEnglish: 'Gratitude Reflection',
    descriptionHindi: 'जीवन, प्रकृति और सहयोगियों से प्राप्त अनुग्रह के प्रति आभार का जागरण।',
    descriptionEnglish: 'Cultivating heartfelt appreciation for life, nature, and benefactors.',
    defaultDurationSeconds: DEFAULT_SESSION_DURATION,
    allowedDurations: [...ALLOWED_SESSION_DURATIONS],
    medicalClaim: false,
    jyotishDependency: false,
    isOfflineAvailable: true,
    instructionsHindi: [
      'हृदय क्षेत्र में ध्यान केंद्रित करें।',
      'उन व्यक्तियों और अवसरों का स्मरण करें जिनके प्रति आप कृतज्ञ हैं।'
    ],
    instructionsEnglish: [
      'Center attention gently around the heart center.',
      'Recall beings and circumstances you genuinely appreciate.'
    ],
    contraindicationsHindi: ['कोई नहीं।'],
    contraindicationsEnglish: ['None.'],
    safetyNoticeHindi: 'भावुकता में उलझे बिना निर्मल आनंद का अनुभव करें।',
    safetyNoticeEnglish: 'Allow warmth to arise without clinging to emotional stories.',
    iconName: 'Heart'
  },
  {
    practiceId: 'SELF_OBSERVATION',
    titleHindi: 'साक्षी अवलोकन (Self Observation)',
    titleEnglish: 'Self Observation (Sakshi)',
    descriptionHindi: 'उठते और विलीन होते विचारों, भावनाओं व स्मृतियों को तटस्थ भाव से देखना।',
    descriptionEnglish: 'Witnessing the flow of thoughts, emotions, and memories without judgment.',
    defaultDurationSeconds: DEFAULT_SESSION_DURATION,
    allowedDurations: [...ALLOWED_SESSION_DURATIONS],
    medicalClaim: false,
    jyotishDependency: false,
    isOfflineAvailable: true,
    instructionsHindi: [
      'विचारों को रोकने का प्रयास न करें।',
      'जैसे नदी का प्रवाह बहता है, वैसे ही मानसिक तरंगों को केवल देखें।'
    ],
    instructionsEnglish: [
      'Do not attempt to suppress or alter thoughts.',
      'Observe mental waves naturally as a detached witness.'
    ],
    contraindicationsHindi: ['अत्यधिक मानसिक उद्वेग में श्वास ध्यान से आरंभ करें।'],
    contraindicationsEnglish: ['If agitated, begin with simple breath awareness first.'],
    safetyNoticeHindi: 'साक्षी भाव अभ्यास है, कोई कठोर संयम नहीं।',
    safetyNoticeEnglish: 'Witnessing is an effortless allowance, not rigid discipline.',
    iconName: 'Eye'
  },
  {
    practiceId: 'PRAYERFUL_CONTEMPLATION',
    titleHindi: 'प्रार्थना व समर्पण (Prayerful Contemplation)',
    titleEnglish: 'Prayerful Contemplation',
    descriptionHindi: 'परम चेतना, ईष्ट व समग्र अस्तित्व के समक्ष अहंकार का पावन समर्पण।',
    descriptionEnglish: 'Devotional surrender and sacred communion with higher consciousness.',
    defaultDurationSeconds: DEFAULT_SESSION_DURATION,
    allowedDurations: [...ALLOWED_SESSION_DURATIONS],
    medicalClaim: false,
    jyotishDependency: false,
    isOfflineAvailable: true,
    instructionsHindi: [
      'शांत चित्त से अपने ईष्ट या परम सत्ता का ध्यान करें।',
      'समस्त भार व अहंकार को समर्पित कर पूर्ण शांति का अनुभव करें।'
    ],
    instructionsEnglish: [
      'Invoke the divine presence or supreme awareness.',
      'Surrender mental burdens in profound peace and trust.'
    ],
    contraindicationsHindi: ['कोई नहीं।'],
    contraindicationsEnglish: ['None.'],
    safetyNoticeHindi: 'श्रद्धा व समर्पण व्यक्तिगत साधना का अंग है।',
    safetyNoticeEnglish: 'Devotion is an inner personal experience of reverence.',
    iconName: 'Sparkles'
  }
];

export class PracticeCatalogService {
  public static getAllPractices(): PracticeDefinition[] {
    return [...CATALOG];
  }

  public static getPracticeById(id: PracticeId): PracticeDefinition | undefined {
    return CATALOG.find(p => p.practiceId === id);
  }

  public static getDefaultPractice(): PracticeDefinition {
    return CATALOG[0];
  }
}
