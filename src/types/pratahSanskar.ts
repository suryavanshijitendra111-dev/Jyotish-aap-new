export type PratahAudioChoice = 'gayatri' | 'instrumental' | 'nature' | 'silent';

export type PratahStepId = 
  | 'alarm' 
  | 'sankalp' 
  | 'snan' 
  | 'arghya' 
  | 'twelve_names' 
  | 'guidance' 
  | 'karma' 
  | 'goal';

export interface PratahSanskarSettings {
  enabled: boolean;
  wakeUpTime: string; // "05:30"
  alarmDays: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  audioChoice: PratahAudioChoice;
  volume: number; // 0.0 to 1.0
  fadeIn: boolean;
  snoozeMinutes: number; // 5, 9, 10
  gayatriAudioEnabled: boolean;
  suryaArghyaEnabled: boolean;
  twelveNamesAudioEnabled: boolean;
  snanReminderEnabled: boolean;
  todaysKarmaEnabled: boolean;
  dailyGuidanceNotificationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "05:00"
  };
  notificationPrivacy: boolean; // Hide sensitive astrology in lockscreen previews
  language: 'Hindi' | 'English';
}

export const DEFAULT_PRATAH_SETTINGS: PratahSanskarSettings = {
  enabled: true,
  wakeUpTime: '06:00',
  alarmDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  audioChoice: 'gayatri',
  volume: 0.8,
  fadeIn: true,
  snoozeMinutes: 5,
  gayatriAudioEnabled: true,
  suryaArghyaEnabled: true,
  twelveNamesAudioEnabled: true,
  snanReminderEnabled: true,
  todaysKarmaEnabled: true,
  dailyGuidanceNotificationEnabled: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '05:00'
  },
  notificationPrivacy: true,
  language: 'Hindi'
};

export interface PratahDailyProgress {
  date: string; // "YYYY-MM-DD"
  completedSteps: PratahStepId[];
  selectedResolution: string;
  customResolution?: string;
  isKarmaCompleted: boolean;
  karmaReflection?: string;
  mainGoalNote?: string;
  routineCompletedAt?: string; // Timestamp ISO
}

export interface SuryaNameItem {
  number: number;
  mantra: string;
  transliteration: string;
  hindiMeaning: string;
  englishMeaning: string;
  philosophicalSignificance: string;
}

export const TWELVE_SURYA_NAMES: SuryaNameItem[] = [
  {
    number: 1,
    mantra: 'ॐ मित्राय नमः',
    transliteration: 'Om Mitrāya Namaḥ',
    hindiMeaning: 'समस्त सृष्टि के सर्वसुलभ और निष्पक्ष मित्र को नमन।',
    englishMeaning: 'Salutations to the universal friend who shines without bias on all beings.',
    philosophicalSignificance: 'मैत्री भाव, उदारता एवं सर्वजन हिताय दृष्टिकोण का जागरण।'
  },
  {
    number: 2,
    mantra: 'ॐ रवये नमः',
    transliteration: 'Om Ravaye Namaḥ',
    hindiMeaning: 'समस्त ब्रह्मांड के प्रकाशक एवं दिव्य तेज के स्वामी को नमन।',
    englishMeaning: 'Salutations to the radiant source of cosmic illumination.',
    philosophicalSignificance: 'आंतरिक चेतना की स्पष्टता एवं अज्ञान रूपी अंधकार का निवारण।'
  },
  {
    number: 3,
    mantra: 'ॐ सूर्याय नमः',
    transliteration: 'Om Sūryāya Namaḥ',
    hindiMeaning: 'कर्मों के संचालक एवं जीवन को गति प्रदान करने वाले देव को नमन।',
    englishMeaning: 'Salutations to the guide of supreme activity and vital life rhythm.',
    philosophicalSignificance: 'सत्कर्म, कर्तव्यनिष्ठा और समय के प्रति श्रद्धा।'
  },
  {
    number: 4,
    mantra: 'ॐ भानवे नमः',
    transliteration: 'Om Bhānave Namaḥ',
    hindiMeaning: 'सौंदर्य, कांति एवं आकर्षण की वर्षा करने वाले देव को नमन।',
    englishMeaning: 'Salutations to the magnificent dispenser of golden beauty and clarity.',
    philosophicalSignificance: 'विचारों में शुचिता, सौम्यता एवं रचनात्मक ऊर्जा का संचार।'
  },
  {
    number: 5,
    mantra: 'ॐ खगाय नमः',
    transliteration: 'Om Khagāya Namaḥ',
    hindiMeaning: 'विशाल आकाश में अनवरत गतिमान ब्रह्मांडीय पथिक को नमन।',
    englishMeaning: 'Salutations to the boundless celestial traveler who marks eternal time.',
    philosophicalSignificance: 'सदा अग्रसर रहने का संकल्प और आलस्य का त्याग।'
  },
  {
    number: 6,
    mantra: 'ॐ पुष्णे नमः',
    transliteration: 'Om Pūṣṇe Namaḥ',
    hindiMeaning: 'समस्त चराचर जगत का पोषण व संवर्धन करने वाले देव को नमन।',
    englishMeaning: 'Salutations to the supreme cosmic nourisher who sustains all flora and fauna.',
    philosophicalSignificance: 'परिवार, समाज एवं पर्यावरण के प्रति पोषणकारी संवेदनशीलता।'
  },
  {
    number: 7,
    mantra: 'ॐ हिरण्यगर्भाय नमः',
    transliteration: 'Om Hiraṇyagarbhāya Namaḥ',
    hindiMeaning: 'स्वर्णमयी सृजन शक्ति एवं दिव्यता के मूल आधार को नमन।',
    englishMeaning: 'Salutations to the golden primordial womb and seed of all cosmic creation.',
    philosophicalSignificance: 'आत्मबल, गहन चिंतन एवं असीम आंतरिक सामर्थ्य का बोध।'
  },
  {
    number: 8,
    mantra: 'ॐ मरीचये नमः',
    transliteration: 'Om Marīcaye Namaḥ',
    hindiMeaning: 'किरणों के स्वामी एवं रोग-शोक नाशक दिव्य ऊर्जा को नमन।',
    englishMeaning: 'Salutations to the lord of healing light rays and vitality.',
    philosophicalSignificance: 'सकारात्मक दृष्टिकोण और मानसिक दुर्बलताओं पर विजय।'
  },
  {
    number: 9,
    mantra: 'ॐ आदित्याय नमः',
    transliteration: 'Om Ādityāya Namaḥ',
    hindiMeaning: 'अदिति (अनंत प्रकृति) के परम तेजस्वी पुत्र को नमन।',
    englishMeaning: 'Salutations to the son of cosmic infinity who unites the realms.',
    philosophicalSignificance: 'विशाल हृदय, सहिष्णुता और संकुचित सीमाओं से मुक्ति।'
  },
  {
    number: 10,
    mantra: 'ॐ सवित्रे नमः',
    transliteration: 'Om Savitre Namaḥ',
    hindiMeaning: 'दिव्य प्रज्ञा, ज्ञान एवं विवेक को जगाने वाले उत्प्रेरक देव को नमन।',
    englishMeaning: 'Salutations to the divine stimulator of higher intellect and wisdom.',
    philosophicalSignificance: 'गायत्री चेतना, संयम एवं सत्य के मार्ग पर चलने की प्रेरणा।'
  },
  {
    number: 11,
    mantra: 'ॐ अर्काय नमः',
    transliteration: 'Om Arkāya Namaḥ',
    hindiMeaning: 'परम पूज्य, वंदनीय एवं नमन योग्य दिव्य शक्ति को नमन।',
    englishMeaning: 'Salutations to the one universally worthy of exalted praise and reverence.',
    philosophicalSignificance: 'कृतज्ञता ज्ञापन, विनम्रता और उच्च आदर्शों के प्रति आदर।'
  },
  {
    number: 12,
    mantra: 'ॐ भास्कराय नमः',
    transliteration: 'Om Bhāskarāya Namaḥ',
    hindiMeaning: 'परम प्रकाशवान, आत्मज्ञान एवं मोक्ष की दिशा दिखाने वाले देव को नमन।',
    englishMeaning: 'Salutations to the luminous illuminator of ultimate self-realization.',
    philosophicalSignificance: 'आंतरिक प्रकाश, समत्व भाव और जीवन की सार्थकता का दर्शन।'
  }
];

export const PREDEFINED_RESOLUTIONS: string[] = [
  'आज मैं क्रोध में कोई निर्णय नहीं लूँगा।',
  'आज मैं किसी का अनावश्यक दिल नहीं दुखाऊँगा।',
  'आज मैं पूरी ईमानदारी और लगन से अपना काम करूँगा।',
  'आज मैं किसी जरूरतमंद की निःस्वार्थ सहायता करूँगा।',
  'आज मैं हर परिस्थिति में मानसिक संतुलन और धैर्य रखूँगा।',
  'आज मैं अपने परिवार और सहकर्मियों से मधुरतापूर्वक बात करूँगा।',
  'आज मैं व्यर्थ की चिंताओं को छोड़कर केवल अपने वर्तमान कर्म पर ध्यान दूँगा।'
];

export const TODAYS_KARMA_SUGGESTIONS: {
  titleHindi: string;
  titleEnglish: string;
  category: 'Compassion' | 'Service' | 'Mindfulness' | 'Integrity' | 'Nature' | 'Harmony';
  descriptionHindi: string;
  descriptionEnglish: string;
  philosophicalNote: string;
}[] = [
  {
    titleHindi: 'किसी जरूरतमंद की सहायता',
    titleEnglish: 'Help Someone in Need',
    category: 'Compassion',
    descriptionHindi: 'आज किसी ऐसे व्यक्ति की बिना किसी प्रचार या अपेक्षा के गुप्त रूप से मदद करें, जिसे सचमुच सहारे की आवश्यकता हो।',
    descriptionEnglish: 'Offer discreet assistance to someone facing hardship today without expecting anything in return.',
    philosophicalNote: 'परोपकाराय फलन्ति वृक्षाः — निःस्वार्थ सेवा चित्त को निर्मल बनाती है।'
  },
  {
    titleHindi: 'परिवार से प्रेमपूर्वक संवाद',
    titleEnglish: 'Affectionate Family Dialogue',
    category: 'Harmony',
    descriptionHindi: 'आज माता-पिता, जीवनसाथी अथवा बच्चों के साथ 15 मिनट पूरी एकाग्रता और प्रेम से बिना किसी फोन या तर्क-वितर्क के बैठें।',
    descriptionEnglish: 'Spend 15 distraction-free minutes conversing with family members with complete warmth and undivided presence.',
    philosophicalNote: 'गृहस्थ धर्म में आत्मीय संवाद ही वास्तविक सुख और शांति की नींव है।'
  },
  {
    titleHindi: 'वाणी का संयम व सम्मान',
    titleEnglish: 'Restraint in Speech & Respect',
    category: 'Integrity',
    descriptionHindi: 'आज किसी का भी उपहास, निंदा या अपमान न करने का कठोर व्रत रखें। जब भी आवेश आए, एक गहरा श्वास लें।',
    descriptionEnglish: 'Vow not to speak harshly, gossip, or belittle anyone today. Breathe deeply before responding under irritation.',
    philosophicalNote: 'अनुद्वेगकरं वाक्यं सत्यं प्रियहितं च यत् — वाणी की तपस्या सबसे बड़ा आत्मसंयम है।'
  },
  {
    titleHindi: 'प्रकृति व मूक जीवों की सेवा',
    titleEnglish: 'Kindness to Animals & Nature',
    category: 'Nature',
    descriptionHindi: 'पक्षियों के लिए जल व दाना रखें अथवा किसी भूखे मूक जीव को भोजन कराएं। किसी वृक्ष को जल अर्पित करें।',
    descriptionEnglish: 'Place water and grain for birds, or feed a stray animal mindfully. Offer water to a tree or plant.',
    philosophicalNote: 'ईशा वास्यमिदं सर्वम् — प्रत्येक जीव में उसी परमतत्व का वास है।'
  },
  {
    titleHindi: 'कार्यक्षेत्र में शुचिता व ईमानदारी',
    titleEnglish: 'Purity & Diligence at Work',
    category: 'Service',
    descriptionHindi: 'अपने व्यावसायिक कर्तव्यों को पूरी लगन से निभाएं। किसी को धोखा न दें और समय के प्रति पूर्ण वफादार रहें।',
    descriptionEnglish: 'Execute your vocational tasks with unimpeachable sincerity, truthfulness, and punctuality.',
    philosophicalNote: 'योगः कर्मसु कौशलम् — कार्य को पूजा मानकर कुशलतापूर्वक करना ही कर्मयोग है।'
  },
  {
    titleHindi: '10 मिनट का ध्यान व आत्मनिरीक्षण',
    titleEnglish: 'Mindful Silence & Self-Reflection',
    category: 'Mindfulness',
    descriptionHindi: 'दिन की आपाधापी से पहले 10 मिनट शांत बैठकर अपनी श्वासों को देखें और ईश्वर के प्रति कृतज्ञता व्यक्त करें।',
    descriptionEnglish: 'Sit in quiet observation for 10 minutes, observing your breath and grounding yourself in silent gratitude.',
    philosophicalNote: 'प्रशांतचित्तस्य सुखं — शांत मन में ही विवेक और परमात्मा की स्पष्ट अनुभूति होती है।'
  }
];
