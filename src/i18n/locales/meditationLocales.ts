/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION & SADHANA LOCALES
 * PHASE 1.14F: AUDIO & VOICE GUIDANCE LOCALIZED COPY
 */

export interface MeditationPracticeCopy {
  title: string;
  desc: string;
  instructions: string;
  safety: string;
}

export interface MeditationGeneralCues {
  sessionStart: string;
  preparing: string;
  active: string;
  silence: string;
  completion: string;
}

export interface MeditationTranslations {
  title: string;
  subtitle: string;
  quickStart: string;
  quickStartDesc: string;
  selectPractice: string;
  configureSession: string;
  startSession: string;
  pause: string;
  resume: string;
  endSession: string;
  cancelConfirmTitle: string;
  cancelConfirmDesc: string;
  keepPracticing: string;
  endNow: string;
  sessionCompleted: string;
  sessionCompletedSub: string;
  reflectionPrompt: string;
  returnHome: string;
  minutes: string;
  seconds: string;
  preparing: string;
  preparingHint: string;
  phaseSettle: string;
  phasePractice: string;
  phaseSilence: string;
  phaseComplete: string;
  durationLabel: string;
  difficultyLabel: string;
  safetyLabel: string;
  allPractices: string;
  beginnerPractices: string;
  mindAndBreath: string;
  contemplative: string;
  audioModeLabel: string;
  audioModeVoiceAndAmbient: string;
  audioModeAmbientOnly: string;
  audioModeSilent: string;
  audioMuted: string;
  audioUnmuted: string;
  autoplayBlockedNotice: string;
  generalCues: MeditationGeneralCues;
  practices: {
    breath_awareness: MeditationPracticeCopy;
    silent_meditation: MeditationPracticeCopy;
    body_awareness: MeditationPracticeCopy;
    gratitude_reflection: MeditationPracticeCopy;
    self_observation: MeditationPracticeCopy;
    prayerful_contemplation: MeditationPracticeCopy;
  };
  cues: {
    breath_intro: string;
    settle_posture: string;
    observe_breath: string;
    body_intro: string;
    settle_feet: string;
    progressive_scan: string;
    gratitude_intro: string;
    settle_heart: string;
    reflect_blessings: string;
    sakshi_intro: string;
    settle_mind: string;
    observe_thoughts: string;
    prayer_intro: string;
    settle_reverence: string;
    universal_wellbeing: string;
  };
}

export const meditationLocales: { hi: MeditationTranslations; en: MeditationTranslations } = {
  hi: {
    title: 'ध्यान एवं साधना',
    subtitle: 'वैदिक आत्म-दर्शन, मौन विश्रांति एवं आंतरिक एकाग्रता',
    quickStart: 'दैनिक त्वरित ध्यान',
    quickStartDesc: '10 मिनट की सरल श्वास सजगता से अपने दिन को शांत एवं संतुलित बनाएं।',
    selectPractice: 'साधना पद्धति का चयन करें',
    configureSession: 'सत्र विन्यास एवं समय निर्धारण',
    startSession: 'साधना सत्र प्रारंभ करें',
    pause: 'सत्र रोकें',
    resume: 'पुनः जारी रखें',
    endSession: 'सत्र समाप्त करें',
    cancelConfirmTitle: 'क्या आप साधना सत्र समाप्त करना चाहते हैं?',
    cancelConfirmDesc: 'मन को शांत रखें। आप जब चाहें पुनः अभ्यास आरंभ कर सकते हैं।',
    keepPracticing: 'साधना जारी रखें',
    endNow: 'हाँ, सत्र समाप्त करें',
    sessionCompleted: 'अभ्यास पूर्ण हुआ',
    sessionCompletedSub: 'बहुत अच्छा। आपने आज अपने लिए समय निकाला।',
    reflectionPrompt: 'सत्र के उपरांत आपकी चित्त-दशा कैसी है?',
    returnHome: 'ध्यान कक्ष पर लौटें',
    minutes: 'मिनट',
    seconds: 'सेकंड',
    preparing: 'सत्र पूर्व तैयारी',
    preparingHint: 'सुखासन में बैठें, मेरुदंड सीधा रखें और नेत्र कोमलता से बंद करें...',
    phaseSettle: 'आसन एवं स्थिरता',
    phasePractice: 'साधना एवं सजगता',
    phaseSilence: 'गहन मौन विश्रांति',
    phaseComplete: 'सत्र पूर्ण',
    durationLabel: 'साधना अवधि',
    difficultyLabel: 'कठिनाई स्तर',
    safetyLabel: 'सुरक्षा निर्देश',
    allPractices: 'समस्त साधनाएं (6)',
    beginnerPractices: 'आरंभिक साधक',
    mindAndBreath: 'मौन एवं श्वास',
    contemplative: 'चित्त-चिंतन',
    audioModeLabel: 'ध्वनि व वाणी मोड',
    audioModeVoiceAndAmbient: 'आवाज + ध्वनि',
    audioModeAmbientOnly: 'केवल ध्वनि',
    audioModeSilent: 'मौन',
    audioMuted: 'ध्वनि म्यूट है',
    audioUnmuted: 'ध्वनि सक्रिय है',
    autoplayBlockedNotice: 'ध्वनि शुरू नहीं हो सकी। अभ्यास बिना ध्वनि के जारी रहेगा।',
    generalCues: {
      sessionStart: 'अब अपने शरीर को सहज होने दें।',
      preparing: 'धीरे से आँखें बंद करें और अपनी श्वास पर ध्यान दें।',
      active: 'अपनी श्वास को सहज रहने दें।',
      silence: 'अब कुछ क्षण केवल शांति का अनुभव करें।',
      completion: 'अभ्यास पूर्ण हुआ। कुछ क्षण शांत रहें।'
    },
    practices: {
      breath_awareness: {
        title: 'श्वास जागरूकता',
        desc: 'सहज श्वास के आवागमन का मौन अवलोकन। मन को वर्तमान क्षण में स्थिर करने की मूल साधना।',
        instructions: 'सुखासन अथवा कुर्सी पर मेरुदंड सीधा रखकर बैठें। नेत्र कोमलता से बंद करें। नासिका छिद्रों पर आती-जाती श्वास के स्पर्श को केवल साक्षी भाव से देखें। श्वास को बलपूर्वक नियंत्रित न करें।',
        safety: 'यह अभ्यास पूर्णतः सौम्य एवं सुरक्षित है। इसमें कुंभक (श्वास रोकना) नहीं किया जाता।'
      },
      silent_meditation: {
        title: 'मौन ध्यान',
        desc: 'आंतरिक एवं बाह्य कोलाहल से परे, गहन मौन में शांत विश्राम।',
        instructions: 'शांति से बैठें। शरीर को पूरी तरह शिथिल होने दें। विचारों को बिना रोके केवल बहने दें और अपने अंतरात्मा के अगाध मौन में ठहरें।',
        safety: 'सभी साधकों के लिए उपयुक्त। यदि मन में बेचैनी लगे तो सामान्य रूप से नेत्र खोल सकते हैं।'
      },
      body_awareness: {
        title: 'शरीर-जागरूकता',
        desc: 'पाद-तल से मस्तक पर्यंत शरीर के समस्त अंगों की क्रमशः सजग अनुभूति व विश्रांति।',
        instructions: 'मेरुदंड सीधा रखें। प्रत्येक अंग (चरण, घुटने, उदर, छाती, हाथ, मुख) पर चेतना को लाएं और वहां उपस्थित सूक्ष्म तनाव को श्वास के साथ विसर्जित करें।',
        safety: 'पूर्णतः विश्रांतिदायक। किसी भी अंग में खिंचाव या पीड़ा न आने दें।'
      },
      gratitude_reflection: {
        title: 'कृतज्ञता चिंतन',
        desc: 'जीवन के समस्त उपहारों, संबंधों, गुरुओं एवं प्रकृति के प्रति हृदयस्पर्शी कृतज्ञता।',
        instructions: 'हृदय क्षेत्र पर कोमल ध्यान केंद्रित करें। जीवन में प्राप्त अनुग्रह, प्रेम और साधनों का स्मरण करें और हृदय को असीम कृतज्ञता के भाव से भरें।',
        safety: 'सकारात्मक एवं चित्त-प्रसादन अभ्यास। सभी आयु वर्गों के लिए उपयुक्त।'
      },
      self_observation: {
        title: 'आत्मनिरीक्षण',
        desc: 'साक्षी भाव से मन, विचारों और भावनाओं को बिना निर्णय किए देखना।',
        instructions: 'अपने मन में उठने वाले विचारों को एक तटस्थ साक्षी की भांति देखें। न किसी विचार का स्वागत करें, न किसी से संघर्ष। विचार आते हैं और चले जाते हैं; आप अचल साक्षी हैं।',
        safety: 'यदि विचार तीव्र लगें, तो ध्यान पुनः अपनी स्वाभाविक श्वास के स्पर्श पर लौटा लें।'
      },
      prayerful_contemplation: {
        title: 'प्रार्थना एवं आध्यात्मिक चिंतन',
        desc: 'समस्त प्राणियों के कल्याण, आरोग्य एवं वैश्विक शांति हेतु मंगल संकल्प।',
        instructions: 'हृदय में श्रद्धा और करुणा का भाव जाग्रत करें। समस्त चराचर जगत के लिए शांति, स्वास्थ्य और आनंद की प्रार्थना करें: सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।',
        safety: 'सद्भाव एवं शांति संवर्धन अभ्यास। विशुद्ध आध्यात्मिक चिंतन।'
      }
    },
    cues: {
      breath_intro: 'सुखासन में स्थिर होकर बैठें। अपनी स्वाभाविक श्वास के प्रति सजग हों।',
      settle_posture: 'रीढ़ सीधी रखें, कंधे ढीले छोड़ें और नेत्र कोमलता से बंद करें।',
      observe_breath: 'प्रत्येक आती और जाती श्वास को केवल साक्षी भाव से देखते रहें।',
      body_intro: 'अपने संपूर्ण शरीर के प्रति सजग हों। पैरों से मस्तक तक ध्यान लाएं।',
      settle_feet: 'अपने चरणों को शिथिल करें, समस्त तनाव को धरती में विसर्जित होने दें।',
      progressive_scan: 'शरीर में जहां भी खिंचाव हो, श्वास के साथ उसे पूरी तरह मुक्त कर दें।',
      gratitude_intro: 'हृदय में कृतज्ञता और असीम शांति का भाव जाग्रत करें।',
      settle_heart: 'अपने हृदय केंद्र पर ध्यान लाएं। शांत एवं कृतज्ञ रहें।',
      reflect_blessings: 'जीवन के समस्त उपहारों और कृपा का शांत स्मरण करें।',
      sakshi_intro: 'विचारों के प्रति साक्षी बनें। आप दृष्टा हैं, विचार केवल दृश्य हैं।',
      settle_mind: 'मन के प्रवाह को बिना उलझे दूर से देखते रहें।',
      observe_thoughts: 'विचारों को आने और जाने दें, शांत साक्षी भाव में स्थित रहें।',
      prayer_intro: 'सर्वे भवन्तु सुखिनः। समस्त जगत के मंगल की भावना करें।',
      settle_reverence: 'समस्त चराचर के प्रति आदर, प्रेम एवं शांति का भाव रखें।',
      universal_wellbeing: 'सबका मंगल हो, सबकी शांति हो, सबका कल्याण हो।'
    }
  },
  en: {
    title: 'Meditation & Sadhana',
    subtitle: 'Vedic Self-Awareness, Sacred Stillness & Inner Focus',
    quickStart: 'Daily Quick Meditation',
    quickStartDesc: 'Anchor your day in 10 minutes of gentle breath awareness and calm focus.',
    selectPractice: 'Select a Practice',
    configureSession: 'Session Configuration & Timing',
    startSession: 'Begin Meditation Session',
    pause: 'Pause',
    resume: 'Resume',
    endSession: 'End Session',
    cancelConfirmTitle: 'Do you wish to end this session?',
    cancelConfirmDesc: 'Keep your mind at ease. You can return to your practice whenever ready.',
    keepPracticing: 'Keep Practicing',
    endNow: 'Yes, End Session',
    sessionCompleted: 'Practice Completed',
    sessionCompletedSub: 'Well done. You took time out for yourself today.',
    reflectionPrompt: 'How do you feel after this session?',
    returnHome: 'Return to Meditation Home',
    minutes: 'min',
    seconds: 'sec',
    preparing: 'Preparing Session',
    preparingHint: 'Take a comfortable seated posture, relax your shoulders, and gently close your eyes...',
    phaseSettle: 'Settling Posture',
    phasePractice: 'Mindful Observation',
    phaseSilence: 'Deep Silence',
    phaseComplete: 'Complete',
    durationLabel: 'Session Duration',
    difficultyLabel: 'Difficulty Level',
    safetyLabel: 'Safety Invariant',
    allPractices: 'All Practices (6)',
    beginnerPractices: 'Beginner Friendly',
    mindAndBreath: 'Breath & Silence',
    contemplative: 'Contemplative Reflection',
    audioModeLabel: 'Audio & Voice Mode',
    audioModeVoiceAndAmbient: 'Voice + Ambient',
    audioModeAmbientOnly: 'Ambient Only',
    audioModeSilent: 'Silent',
    audioMuted: 'Audio Muted',
    audioUnmuted: 'Audio Unmuted',
    autoplayBlockedNotice: 'Audio could not start. Practice will continue silently.',
    generalCues: {
      sessionStart: 'Allow your body to relax and become comfortable.',
      preparing: 'Gently close your eyes and bring attention to your breath.',
      active: 'Let your natural breath flow freely and effortlessly.',
      silence: 'Now rest peacefully in quiet stillness.',
      completion: 'Practice completed. Remain peaceful and centered.'
    },
    practices: {
      breath_awareness: {
        title: 'Breath Awareness',
        desc: 'Gentle observation of incoming and outgoing breath to anchor attention in the present moment.',
        instructions: 'Sit comfortably with an erect spine. Close your eyes softly. Simply observe the natural rhythm of breath at your nostrils without trying to control it.',
        safety: 'Completely gentle and safe. Involves no breath holding (kumbhaka) or hypoxia.'
      },
      silent_meditation: {
        title: 'Silent Meditation',
        desc: 'Deep resting in pure silence beyond mental chatter and external distractions.',
        instructions: 'Sit quietly. Let your body relax completely. Allow thoughts to arise and pass like passing clouds while resting in spacious silence.',
        safety: 'Suitable for all practitioners. You may softly open your eyes if restlessness arises.'
      },
      body_awareness: {
        title: 'Body Awareness',
        desc: 'Step-by-step mindful scan of physical sensations from head to toe, releasing held tension.',
        instructions: 'Maintain a relaxed upright posture. Progressively scan each part of your body—feet, legs, abdomen, chest, shoulders, and face—letting go of tight holding.',
        safety: 'Deeply restorative. Avoid forced stiffness or discomfort.'
      },
      gratitude_reflection: {
        title: 'Gratitude Reflection',
        desc: 'Heartfelt remembrance of life\'s blessings, family, teachers, and nature.',
        instructions: 'Bring gentle attention to your chest center. Recall kindness, protection, and gifts received with sincere reverence and an open heart.',
        safety: 'Gentle uplifting reflection suitable for all seekers.'
      },
      self_observation: {
        title: 'Self-Observation',
        desc: 'Witnessing mental waves, emotions, and subtle stillness without judgment or attachment.',
        instructions: 'Observe incoming thoughts as an unattached witness. Neither chase them nor push them away. You are the unchanging awareness behind thoughts.',
        safety: 'If thoughts feel too fast, gently return your attention to your breathing.'
      },
      prayerful_contemplation: {
        title: 'Prayerful Contemplation',
        desc: 'Silent aspiration for universal peace, wellness, and spiritual harmony.',
        instructions: 'Cultivate compassionate goodwill. Silently send peace and harmony to all living beings: May all be happy, may all be peaceful and free from suffering.',
        safety: 'Peace-cultivating, unifying contemplation.'
      }
    },
    cues: {
      breath_intro: 'Take a comfortable seat. Become aware of your natural breath.',
      settle_posture: 'Keep your spine straight, relax your shoulders, and gently close your eyes.',
      observe_breath: 'Observe each incoming and outgoing breath as a calm, quiet witness.',
      body_intro: 'Become aware of your entire physical presence from head to toe.',
      settle_feet: 'Relax your feet and legs, allowing any residual tension to release into the earth.',
      progressive_scan: 'Wherever tension remains, breathe out and let it dissolve completely.',
      gratitude_intro: 'Awaken a quiet feeling of gratitude and peace in your heart.',
      settle_heart: 'Rest your gentle awareness at the center of your chest.',
      reflect_blessings: 'Silently remember the grace and blessings in your life with reverence.',
      sakshi_intro: 'Become a quiet witness to your mind. You are the observer, not the thoughts.',
      settle_mind: 'Watch the flow of thoughts from a calm distance without entanglement.',
      observe_thoughts: 'Let thoughts come and go freely while you rest in pure awareness.',
      prayer_intro: 'May all beings be happy and free from distress.',
      settle_reverence: 'Hold an attitude of deep respect and goodwill toward all creation.',
      universal_wellbeing: 'May peace, light, and goodness prevail everywhere.'
    }
  }
};
