export type LanguageCodeBase = 
  | 'hi' // Hindi - हिन्दी
  | 'en' // English
  | 'es' // Spanish - Español
  | 'fr' // French - Français
  | 'de' // German - Deutsch
  | 'ru' // Russian - Русский
  | 'mr' // Marathi - मराठी
  | 'gu' // Gujarati - ગુજરાતી
  | 'bn' // Bengali - বাংলা
  | 'ta' // Tamil - தமிழ்
  | 'te' // Telugu - తెలుగు
  | 'kn' // Kannada - ಕನ್ನಡ
  | 'ml' // Malayalam - മലയാളം
  | 'pa' // Punjabi - ਪੰਜਾਬੀ
  | 'or' // Odia - ଓଡ଼ିଆ
  | 'as' // Assamese - অসমীয়া
  | 'sa'; // Sanskrit - संस्कृत

export type LanguageCode = LanguageCodeBase | (string & {});

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
  firstPersonMoon: string;
  notAvailableText: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', firstPersonMoon: 'मैं चंद्र हूँ।', notAvailableText: 'उपलब्ध नहीं' },
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', firstPersonMoon: 'I am the Moon.', notAvailableText: 'Not Available' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', script: 'Latin', firstPersonMoon: 'Soy la Luna.', notAvailableText: 'No disponible' },
  { code: 'fr', name: 'French', nativeName: 'Français', script: 'Latin', firstPersonMoon: 'Je suis la Lune.', notAvailableText: 'Non disponible' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', script: 'Latin', firstPersonMoon: 'Ich bin der Mond.', notAvailableText: 'Nicht verfügbar' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', script: 'Cyrillic', firstPersonMoon: 'Я Луна.', notAvailableText: 'Недоступно' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', firstPersonMoon: 'मी चंद्र आहे.', notAvailableText: 'उपलब्ध नाही' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', firstPersonMoon: 'હું ચંદ્ર છું.', notAvailableText: 'ઉપલબ્ધ નથી' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', firstPersonMoon: 'আমি চন্দ্র।', notAvailableText: 'উপলব্ধ নয়' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', firstPersonMoon: 'நான் சந்திரன்.', notAvailableText: 'கிடைக்கவில்லை' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', firstPersonMoon: 'నేను చంద్రుడిని.', notAvailableText: 'అందుబాటులో లేదు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', firstPersonMoon: 'ನಾನು ಚಂದ್ರ.', notAvailableText: 'ಲಭ್ಯವಿಲ್ಲ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', firstPersonMoon: 'ഞാൻ ചന്ദ്രനാണ്.', notAvailableText: 'ലഭ്യമല്ല' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', firstPersonMoon: 'ਮੈਂ ਚੰਦਰਮਾ ਹਾਂ।', notAvailableText: 'ਉਪਲਬਧ ਨਹੀਂ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', firstPersonMoon: 'ମୁଁ ଚନ୍ଦ୍ର।', notAvailableText: 'ଉପଲବ୍ଧ ନାହିଁ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', firstPersonMoon: 'মই চন্দ্ৰ।', notAvailableText: 'উপলব্ধ নহয়' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', firstPersonMoon: 'अहं चन्द्रः अस्मि।', notAvailableText: 'न उपलब्धम्' }
];

export interface TranslationDictionary {
  common: {
    appName: string;
    appTagline: string;
    privateEdition: string;
    start: string;
    goBack: string;
    cancel: string;
    save: string;
    close: string;
    search: string;
    loading: string;
    error: string;
    retry: string;
    verified: string;
    notAvailable: string;
    success: string;
    confirm: string;
    delete: string;
    active: string;
    language: string;
    settings: string;
    next?: string;
    previous?: string;
    downloadPdf?: string;
    share?: string;
    today?: string;
    tomorrow?: string;
    why?: string;
    calculatedData?: string;
    traditionalInterpretation?: string;
    aiExplanation?: string;
    actionableGuidance?: string;
    select?: string;
    moduleComingSoon?: string;
    voiceNotSupported?: string;
    voiceFailed?: string;
    ttsNotSupported?: string;
    sharedSuccess?: string;
    shareCancelled?: string;
    copiedToClipboard?: string;
    yes?: string;
    no?: string;
    name?: string;
    unavailable?: string;
    dashboard?: string;
    copied?: string;
    saved?: string;
    back?: string;
    whyLabel?: string;
    liveCalculations?: string;
    lastUpdated?: string;
    tapToListen?: string;
    listening?: string;
    stopListening?: string;
    none?: string;
    empty?: string;
    english?: string;
    hindi?: string;
    dismiss?: string;
    verifiedNotice?: string;
  };
  nav: {
    home: string;
    kundli: string;
    ai: string;
    family: string;
    profile: string;
    reports: string;
    selectLanguage: string;
  };
  dashboard: {
    masterProfile: string;
    dailyReport: string;
    pratahSanskar: string;
    dailyCompanion: string;
    prashnaKundli: string;
    kundli: string;
    numerology: string;
    loShuGrid: string;
    kpJyotish: string;
    lalKitab: string;
    parashari: string;
    jaimini: string;
    dashaTiming: string;
    transit: string;
    nakshatra: string;
    varga: string;
    aiJyotish: string;
    doshRemedies: string;
    muhurat: string;
    family: string;
    lifeJournal: string;
    reports: string;
    meditation: string;
    mantraJaap: string;
    temple: string;
    dob: string;
    birthTime: string;
    birthPlace: string;
    viewProfile: string;
    goToProfile: string;
    quickGuidance: string;
    startMorningRoutine: string;
    modulesTitle: string;
    dailyReportSub?: string;
    pratahSanskarSub?: string;
    dailyCompanionSub?: string;
    prashnaKundliSub?: string;
  };
  daily: {
    today: string;
    focus: string;
    action: string;
    caution: string;
    service: string;
    eveningReflection: string;
    morningGreeting: string;
    dayHarmony: string;
    dailyScore: string;
    personalDay: string;
    rahuKaal: string;
    abhijit: string;
    whyBasis: string;
    traditionalContext: string;
    practicalAdvice: string;
    actionableStep: string;
    journalGoal: string;
    journalReflection: string;
    yesterday: string;
    tomorrow: string;
    jumpToday: string;
  };
  dailyCompanion?: {
    title: string;
    subtitle: string;
    whyGuidance: string;
    morning: string;
    midday: string;
    evening: string;
    night: string;
    quietHours: string;
    notifications: string;
    phase: string;
  };
  report: {
    title: string;
    subtitle: string;
    todayOverview: string;
    category: string;
    signal: string;
    whyBasis: string;
    whatToDo: string;
    whatToBeCarefulAbout: string;
    calculatedDataLabel: string;
    traditionalInterpretationLabel: string;
    aiSynthesisLabel: string;
    actionableGuidanceLabel: string;
    deepLayersToggleShow: string;
    deepLayersToggleHide: string;
    harmonyIndex: string;
    moolankLabel: string;
    bhagyankLabel: string;
    personalDayLabel: string;
    dayLordLabel: string;
    activePrashnaLink: string;
    healthSafetyDirective: string;
    todayGoalAndReflection: string;
    storedWithReport: string;
    mainGoalLabel: string;
    mainGoalPlaceholder: string;
    eveningReflectionLabel: string;
    eveningReflectionPlaceholder: string;
    ratingHigh: string;
    ratingModerate: string;
    ratingPrudent: string;
    downloadPdf: string;
    saveJournal: string;
    shareSummary: string;
    savedSuccess: string;
    downloadSuccess: string;
    generateNew: string;
    verifyAudit: string;
    healthSafetyNotice: string;
    auditPassed: string;
    categoriesAll: string;
    categoriesOverview: string;
    categoriesAstrology: string;
    categoriesNumerology: string;
    categoriesLife: string;
    categoriesWellness: string;
    categoriesConsciousness: string;
    historyTitle: string;
    historyEmpty: string;
    monthlyTitle: string;
    loggedDays: string;
    goodDeedsDone: string;
    recurringThemes: string;
    panchatattvaBalance: string;
    recordedGoals: string;
    wellnessTitle: string;
    wellnessNotice: string;
    recordedSensitivities: string;
    addSensitivityPlaceholder: string;
    addBtn: string;
    sleepTarget: string;
    hydrationTarget: string;
    saveAndClose: string;
    auditTitle: string;
    auditSubtitle: string;
    rerunTests: string;
    runningTests: string;
    allVerified: string;
    closeAudit: string;
    yesterday: string;
    today: string;
    nextDay: string;
    retry: string;
    score?: string;
    hours?: string;
    liters?: string;
    passed?: string;
    clickRerunTests?: string;
    pdfErrorTitle?: string;
    pdfReadyTitle?: string;
    pdfGeneratedNotice?: string;
    pdfDownloadInstructions?: string;
    openPdf?: string;
    downloadPdfFile?: string;
    sharePdfFile?: string;
    downloadInitiated?: string;
    pdfReadyToast?: string;
    pdfFileSize?: string;
    pdfVerifiedUnicode?: string;
    toastSaved?: string;
    toastPdfFailed?: string;
    openedReportFor?: string;
    downloadingPdfFor?: string;
    reportDeleted?: string;
    profileNotLoaded?: string;
    returnToDashboard?: string;
    auditBadge?: string;
    changeLanguage?: string;
    openReport?: string;
    deleteReport?: string;
    deleteItem?: string;
    testPass?: string;
    testFail?: string;
    sec_today_overview: string;
    sec_jyotish_guidance: string;
    sec_dasha_transit: string;
    sec_numerology: string;
    sec_lo_shu: string;
    sec_panchatattva: string;
    sec_wellness_safety: string;
    sec_career: string;
    sec_business: string;
    sec_money: string;
    sec_family: string;
    sec_relationship_marriage: string;
    sec_property: string;
    sec_travel: string;
    sec_education: string;
    sec_spirituality: string;
    sec_todays_caution: string;
    sec_todays_karma: string;
    sec_main_goal: string;
    sec_evening_reflection: string;
    sec_tomorrow_preparation: string;
    verifiedNotice?: string;
    headerTitle?: string;
    section1Title?: string;
    section2Title?: string;
    section3Title?: string;
    section4Title?: string;
    section7Title?: string;
    generatePdf?: string;
    shareCancelled?: string;
    sensitivityRemoved?: string;
    reportType?: string;
    detailedD1D9?: string;
    comprehensiveReport?: string;
    pagesCovered?: string;
    totalPagesCount?: string;
  };
  kundli: {
    lagna: string;
    moonSign: string;
    nakshatra: string;
    pada: string;
    degree: string;
    house: string;
    retrograde: string;
    combust: string;
    vargottama: string;
    d1Chart: string;
    d9Navamsha: string;
    planetaryPositions: string;
    planets: string;
    vimshottariDasha: string;
    mahadasha: string;
    antardasha: string;
    withPlanet?: string;
    kundliShell?: string;
    ayanamsaLabel?: string;

    // Header & Subtitles
    pageTitle?: string;
    pageSubtitle?: string;
    ayanamsaModel?: string;

    // Status
    calculationStatus?: string;
    ready?: string;
    calculating?: string;
    errorStatus?: string;
    notConnected?: string;
    calculationVerified?: string;
    engineAuditNotice?: string;

    // Chart
    lagnaChartTitle?: string;
    northIndianStyle?: string;
    southIndianStyle?: string;
    chartDataError?: string;
    ascendantBadge?: string;

    // Deep Bhava Analysis & House Panel
    deepBhavaAnalysis?: string;
    bhavaIdentity?: string;
    houseLabel?: string;
    signLord?: string;
    bhavaType?: string;
    occupyingPlanets?: string;
    aspectsReceived?: string;
    aspectsGiven?: string;
    noOccupyingPlanets?: string;
    noAspectsReceived?: string;
    aspectFrom?: string;
    aspectSuffix?: string;
    kendra?: string;
    trikona?: string;
    upachaya?: string;
    dusthana?: string;
    maraka?: string;
    houseNumberTitle?: string;

    // Why Engine
    why?: string;
    whyThisResult?: string;
    ruleId?: string;
    system?: string;
    input?: string;
    evaluationConditions?: string;
    finalCalculatedResult?: string;
    pass?: string;
    fail?: string;
    analyzed?: string;
    houseDataValid?: string;
    signLordBound?: string;
    dataExtracted?: string;
    rashiLordBound?: string;
    nakshatraLordBound?: string;

    // Verified Yogas
    verifiedYogasTitle?: string;
    parashariSystem?: string;
    planetsLabel?: string;
    housesLabel?: string;
    signsLabel?: string;
    strengthLabel?: string;
    satisfiedConditionsLabel?: string;
    noYogasDetected?: string;
    verifiedBadge?: string;
    notVerifiedBadge?: string;

    // Jaimini
    jaiminiCharaKarakasTitle?: string;
    jaiminiRashiDrishtiTitle?: string;
    jaiminiIntelligenceTitle?: string;
    foundationEngineBadge?: string;
    karakamshaTitle?: string;
    arudhaPadaTitle?: string;
    aspectsWord?: string;
    noRashiDrishtiDetected?: string;

    // KP Jyotish
    kpTitle?: string;
    kpSubLordsTitle?: string;
    kpSystemBadge?: string;
    signLordLabel?: string;
    nakLordLabel?: string;
    subLordLabel?: string;
    starLordLabel?: string;
    kpNotAvailable?: string;

    // Lal Kitab
    lalKitabTitle?: string;
    lalKitabFixedHousesTitle?: string;
    lalKitabBadge?: string;
    fixedHouseLabel?: string;
    inFixedHouse?: string;
    lalKitabNotAvailable?: string;

    // Varga
    vargaTitle?: string;
    vargaEngineBadge?: string;
    ascendantD9?: string;
    ascendantD10?: string;

    // Nakshatra & Dasha Intelligence
    nakshatraDeepIntelTitle?: string;
    nakshatraEngineBadge?: string;
    inNakshatraPada?: string;
    deityLabel?: string;
    ganaLabel?: string;
    nadiLabel?: string;
    lordLabel?: string;
    currentDashaIntelTitle?: string;
    dashaEngineBadge?: string;
    mahadashaLordLabel?: string;
    antardashaLordLabel?: string;
    liveTransitTitle?: string;
    transitEngineBadge?: string;
    transitNotAvailable?: string;

    // AI Jyotish Assistant
    aiAssistantTitle?: string;
    aiAssistantBadge?: string;
    aiAssistantDesc?: string;
    askQuestionPlaceholder?: string;
    askAiBtn?: string;
    analyzingBtn?: string;

    // Technical Audit & Metadata
    analysisEngineAuditTitle?: string;
    devAuditPanelTitle?: string;
    viewMasterDataset?: string;
    hideMasterDataset?: string;
    lagnaAndAyanamsaTitle?: string;
    ayanamsaNameLabel?: string;
    ayanamsaValueLabel?: string;
    ascendantSiderealLabel?: string;
    engineMetadataTitle?: string;
    planetaryRelationshipsTitle?: string;
    conjunctionsTitle?: string;
    aspectsTitle?: string;
    dashaTimingTitle?: string;
    nextAntardashaTitle?: string;
    nextMahadashaTitle?: string;
    dashaTimelineTitle?: string;
    calculationLogicTitle?: string;
    complete120YearTimelineTitle?: string;
    endsLabel?: string;
    startsLabel?: string;
    noConjunctions?: string;
    analysisUnavailable?: string;
    specialMarkers?: string;
    lagnaChartError?: string;
    jaiminiTag?: string;
    d10Dashamsha?: string;

    // Planet Panel
    planetPanelTitle?: string;
    tropicalLongitudeLabel?: string;
    siderealLongitudeLabel?: string;
    minutesAndSecondsLabel?: string;
    rashiLordLabel?: string;
    nakshatraLordLabel?: string;
    nakshatraRangeLabel?: string;
    progressInNakshatraLabel?: string;
    dignityLabel?: string;
    relationshipsLabel?: string;
    naturalRelationshipsLabel?: string;
    temporaryRelationshipsLabel?: string;
    compoundRelationshipsLabel?: string;
    greatFriend?: string;
    friend?: string;
    neutral?: string;
    enemy?: string;
    greatEnemy?: string;
    directMotion?: string;
    retrogradeMotion?: string;
    combustMotion?: string;
    ownSignLabel?: string;
    exaltedLabel?: string;
    debilitatedLabel?: string;
    moolatrikonaLabel?: string;
    friendlySignLabel?: string;
    enemySignLabel?: string;
    neutralSignLabel?: string;

    // Planet Speaks
    listenBtn?: string;
    playBtn?: string;
    pauseBtn?: string;
    replayBtn?: string;
    stopBtn?: string;
    voiceLabel?: string;

    // Additional UI and engine calculation labels
    statusReady?: string;
    statusCalculating?: string;
    statusNotConnected?: string;
    statusError?: string;
    lagnaChart?: string;
    navagraha?: string;
    tapToListen?: string;
    verifiedYogas?: string;
    jaiminiCharaKarakas?: string;
    foundationEngine?: string;
    jaiminiRashiDrishti?: string;
    aspects?: string;
    noRashiDrishti?: string;
    kpSubLords?: string;
    kpSystem?: string;
    lalKitabFixedHouses?: string;
    jaiminiIntelligence?: string;
    karakamsha?: string;
    d9Sign?: string;
    vargaAnalysis?: string;
    vargaEngine?: string;
    nakshatraDeepIntel?: string;
    nakshatraEngine?: string;
    inNakshatra?: string;
    deity?: string;
    gana?: string;
    nadi?: string;
    currentDashaIntel?: string;
    dashaEngine?: string;
    mahadashaLord?: string;
    antardashaLord?: string;
    liveTransit?: string;
    transitEngine?: string;
    aiJyotishAssistant?: string;
    askLifeQuestion?: string;
    analyzing?: string;
    askAi?: string;
    lagnaAndAyanamsa?: string;
    ayanamsaName?: string;
    ayanamsaValue?: string;
    ascendantSidereal?: string;
    siderealLabel?: string;
    degLabel?: string;
    planetaryRelationships?: string;
    separation?: string;
    aspectsLabel?: string;
    ends?: string;
    nextAntardasha?: string;
    starts?: string;
    nextMahadasha?: string;
    dashaTimeline?: string;
    calculationLogic?: string;
    vimshottariDashaAudit?: string;
    complete120YearTimeline?: string;
    parashariYogaEngine?: string;
    planetLabel?: string;
    signLabel?: string;
    satisfiedConditions?: string;
    calculationMetadata?: string;
    speechUnavailable?: string;
    speechError?: string;
    financialReport?: string;
    dashaEnds?: string;
    degreeLabel?: string;
    nakshatraLabel?: string;
    motionLabel?: string;
    ascendant?: string;
    nakshatraTable?: string;
    dasha?: string;
    currentMahadasha?: string;
    yogas?: string;
    dob?: string;
    tob?: string;
    pob?: string;
    padaLabel?: string;
    planetSpeaks?: string;
    notAvailable?: string;
    lalKitab?: string;
    verified?: string;
  };
  planetSpeaks: {
    title: string;
    subtitle: string;
    selectPlanet: string;
    firstPersonPrefix: string;
    deterministicNote: string;
  };
  pratah: {
    title: string;
    hindiTitle: string;
    subtitle: string;
    wakeUpAlarm: string;
    wakeUpTime: string;
    enableAlarm: string;
    snooze: string;
    stop: string;
    startRoutine: string;
    suryaArghya: string;
    gayatriMantra: string;
    dhyan: string;
    sankalp: string;
    peaceMantra: string;
    bathReminder?: string;
    todaysKarma?: string;
    primaryFocus?: string;
    routineTitle?: string;
    activeDays?: string;
    wakeUpAudio?: string;
    fadeIn?: string;
    snoozeDuration?: string;
    notificationPrivacy?: string;
    quietHoursActive?: string;
    completeProfilePrompt?: string;
  };
  prashna: {
    title: string;
    askQuestion: string;
    submit: string;
    verdict: string;
    auspicious: string;
    inauspicious: string;
    thinking: string;
    problemAreas?: string;
    searchModesPlaceholder?: string;
    askQuestionPrompt?: string;
    itemDescription?: string;
    lastKnownPlace?: string;
    personRelationship?: string;
    lastSeenPlace?: string;
    optionA?: string;
    optionB?: string;
    destinationPurpose?: string;
    prashnaLocation?: string;
    capturedMoment?: string;
    prashnaChartTitle?: string;
    traditionalAnalysisTitle?: string;
  };
  numerology: {
    title: string;
    moolank: string;
    bhagyank: string;
    driver: string;
    conductor: string;
    nameNumber: string;
    personalYear: string;
    personalMonth: string;
    personalDay: string;
    loShuGrid: string;
    missingNumbers: string;
    repeatedNumbers: string;
    advancedTitle: string;
    tabCore: string;
    tabTiming: string;
    tabLoShu: string;
    tabCompare: string;
    tabDate: string;
    tabDigital: string;
    primaryNumerology: string;
    mulankBirth: string;
    bhagyankDestiny: string;
    why: string;
    nameAnalysisChaldean: string;
    expressionDestinyNumber: string;
    compound: string;
    soulUrge: string;
    personality: string;
    secondaryInfluences: string;
    attitudeNumber: string;
    maturityNumber: string;
    masterNumbersDetected: string;
    karmicDebtsDetected: string;
    lifeCyclesTitle: string;
    cycleLabel: string;
    ageLabel: string;
    currentTimingCycles: string;
    pinnaclesTitle: string;
    challengesTitle: string;
    firstPinnacle: string;
    secondPinnacle: string;
    thirdPinnacle: string;
    fourthPinnacle: string;
    firstChallenge: string;
    secondChallenge: string;
    thirdChallenge: string;
    fourthChallenge: string;
    interactiveLoShu: string;
    tapNumberDetails: string;
    numberLabel: string;
    frequency: string;
    presentInGrid: string;
    missingInGrid: string;
    none: string;
    loShuPlanes: string;
    loShuArrows: string;
    missingPattern: string;
    noCompleteArrows: string;
    nameComparison: string;
    enterProposedName: string;
    placeholderName: string;
    analyzeBtn: string;
    currentName: string;
    proposedName: string;
    destinyLabel: string;
    insightLabel: string;
    compareInsightText: string;
    dateAnalysisTitle: string;
    dateAnalysisSubtitle: string;
    selectDateLabel: string;
    dayLabel: string;
    monthLabel: string;
    yearLabel: string;
    universalDateNumber: string;
    masterNumberLabel: string;
    calculationBreakdown: string;
    noProfileData: string;
    goBack: string;
    searchPlaceholder: string;
    catFinance: string;
    catPeace: string;
    catSpirituality: string;
    catGuidance: string;
    catHealth: string;
    mobileNumerology: string;
    houseAndVehicle?: string;
    searchNumberPlaceholder?: string;
    enterMobileNumber?: string;
    analyzedNumber?: string;
    root?: string;
    rootNumber?: string;
    driverMatch?: string;
    significantPairsFound?: string;
    whyCalculationDetails?: string;
    house?: string;
    vehicle?: string;
    enterHouseNo?: string;
    enterVehicleNo?: string;
    houseRoot?: string;
    vehicleRoot?: string;
    practice?: string;
    noEntriesFound?: string;
    digitalDisclaimer?: string;
    compatible?: string;
    challenging?: string;
    neutral?: string;
    pleaseEnterValidNumber?: string;
    pleaseEnterIdentifier?: string;
    mentalPlane?: string;
    emotionalPlane?: string;
    practicalPlane?: string;
    arrowProsperity?: string;
    arrowIntellect?: string;
    arrowLoneliness?: string;
    presentNumbers?: string;
    dominantPlanes?: string;
    cycleTheme1?: string;
    cycleTheme2?: string;
    cycleTheme3?: string;
    lifeEndAge?: string;
    birthdayNumber?: string;
    karmicDebt?: string;
    masterNumber?: string;
    expression?: string;
    calculationDetails?: string;
    planes?: string;
    arrows?: string;
    age?: string;
  };
  panchatattva: {
    title: string;
    fire: string;
    earth: string;
    air: string;
    water: string;
    ether: string;
    dominant: string;
    weakest: string;
    harmony: string;
    totalPoints?: string;
  };
  wellness: {
    title: string;
    personalDiary: string;
    medicalNotice: string;
    sensitivities: string;
    addSensitivity: string;
    sleepTarget: string;
    hydrationTarget: string;
  };
  settings: {
    title: string;
    languageSelection: string;
    activeLanguage: string;
    selectLanguagePrompt: string;
    switchLanguage: string;
    languageUpdated?: string;
    languageChanged?: string;
    singleSourceTruth?: string;
  };
  reportCenter?: {
    title?: string;
    astrologySnapshot?: string;
    ascendant?: string;
    moonSign?: string;
    planetaryPositions?: string;
    planet?: string;
    rashi?: string;
    degree?: string;
    nakshatra?: string;
    motion?: string;
    coreNumerology?: string;
    mulankBirth?: string;
    bhagyankDestiny?: string;
    nameNumber?: string;
    attitudeNumber?: string;
    loShuGridAnalysis?: string;
    strengthsArrows?: string;
    noneDetected?: string;
    aiGuidanceSummary?: string;
    aiGuidanceDesc?: string;
    goToAiChat?: string;
    customReportBuilder?: string;
    customReportDesc?: string;
    generateUnifiedReport?: string;
    verifiedNotice?: string;
    printFooter?: string;
  };
  intelligence?: {
    title?: string;
    todayMirror?: string;
    mulankDriver?: string;
    bhagyankConductor?: string;
    personalYear?: string;
    personalMonth?: string;
    personalDay?: string;
    currentDasha?: string;
    getTodayGuidance?: string;
    aiLifeGuidance?: string;
    dailyDarpan?: string;
    lifeTopics?: string;
    aiChat?: string;
    planetSpeaks?: string;
    panchatattva?: string;
    problemAreas?: string;
    finance?: string;
    snapshot?: string;
    planetary?: string;
    varga?: string;
    nakshatra?: string;
    dasha?: string;
    yoga?: string;
    multi?: string;
    report?: string;
    askJeevanDarpan?: string;
    clearChat?: string;
    askPlaceholder?: string;
    generate?: string;
    problemAreasDisclaimer?: string;
    whyHighlighted?: string;
    sourceSystems?: string;
    timingState?: string;
    askAiExplanation?: string;
    astroSnapshot?: string;
    planetaryIntel?: string;
    multiSystem?: string;
  };
  financial?: {
    wealthPotential?: string;
    incomeStreams?: string;
    careerIncome?: string;
    businessProspects?: string;
    expensesPressure?: string;
    timingContext?: string;
    askAiStrategy?: string;
    disclaimer?: string;
  };
  digitalHouse?: {
    enterPalace: string;
    exitPalace: string;
    mainGate: string;
    entryThreshold: string;
    courtyard: string;
    brahmaSthan: string;
    pragyaGuidance: string;
    views: string;
    mute: string;
    soundActive: string;
    backToCourtyard: string;
    previousChamber: string;
    nextChamber: string;
    chamberDetails: string;
    chambersCount: string;
    classicGrid: string;
  };
  guardian?: GuardianTranslations;
  meditation?: any;
}

export interface GuardianTranslations {
  // Title & Headers
  ownerControlCenter: string;
  owner: string;
  guardian: string;
  guardianGovernance: string;
  privateFamilyEdition: string;
  lockedTitle: string;
  lockedSubtitle: string;
  unlockAccess: string;
  enterPinPlaceholder: string;
  invalidPin: string;
  returnToDashboard: string;
  activeStatus: string;
  snapshot: string;
  
  // Navigation Tabs
  tabModules: string;
  tabGuardian: string;
  tabAi: string;
  tabVoice: string;
  tabLanguage: string;
  tabMaintenance: string;
  tabApprovals: string;
  tabIncidents: string;
  tabBackups: string;
  tabAudit: string;
  tabCommand: string;

  // Guardian Levels
  level1Title: string;
  level1Desc: string;
  level1Short: string;
  level2Title: string;
  level2Desc: string;
  level2Short: string;
  level3Title: string;
  level3Desc: string;
  level3Short: string;
  safeSelfHeal: string;
  protectedDomain: string;
  criticalConstraint: string;
  immutableCore: string;

  // Technical Alerts
  technicalAlert: string;
  problem: string;
  module: string;
  severity: string;
  category: string;
  affectedFeature: string;
  suggestedAction: string;
  details: string;
  hideDetails: string;
  fixNow: string;
  ignore: string;
  requestApproval: string;
  incidentId: string;
  firstSeen: string;
  occurrences: string;
  noIncidents: string;

  // Owner Approval Workflow
  changeRequest: string;
  proposedFix: string;
  affectedFiles: string;
  risk: string;
  backup: string;
  backupRequired: string;
  backupNotRequired: string;
  expectedResult: string;
  approveAndFix: string;
  reject: string;
  viewDetails: string;
  hideFullDetails: string;
  pendingApprovals: string;
  noApprovals: string;
  approved: string;
  rejected: string;
  requestId: string;
  requestedBy: string;
  changeType: string;
  createdAt: string;
  rollbackAvailable: string;
  actionAllowed: string;
  actionRejected: string;

  // Audit Log
  auditLogs: string;
  actor: string;
  action: string;
  result: string;
  timestamp: string;
  status: string;
  noAuditLogs: string;
  auditRecordsCount: string;
  target: string;

  // System Health & Maintenance
  systemStatus: string;
  technicalHealth: string;
  healthy: string;
  warning: string;
  error: string;
  disabled: string;
  checking: string;
  unavailable: string;
  maintenanceMode: string;
  maintenanceDesc: string;
  readOnlyMode: string;
  readOnlyDesc: string;
  offlineFallback: string;
  offlineFallbackDesc: string;

  // Backups & Rollback
  backups: string;
  createBackup: string;
  backupNotice: string;
  restoreSnapshot: string;
  rollbackAction: string;
  snapshotCreated: string;
  snapshotRestored: string;
  rollbackSuccess: string;
  noBackups: string;

  // Module Controls
  moduleControls: string;
  moduleControlsDesc: string;
  masterKundli: string;
  prashnaModule: string;
  planetSpeaksModule: string;
  numerologyModule: string;
  dailyReportModule: string;
  pratahSanskarModule: string;
  aiCompanionModule: string;
  familyKundliModule: string;

  // AI Controls
  aiControls: string;
  aiControlsDesc: string;
  enableAi: string;
  aiDisclaimer: string;
  maxTokens: string;
  rateLimit: string;
  aiModel: string;

  // Voice & TTS
  voiceControls: string;
  voiceControlsDesc: string;
  enableVoice: string;
  speechRate: string;
  speechPitch: string;
  testVoice: string;

  // Language Settings
  languages: string;
  languageSettingsDesc: string;
  availableLanguages: string;

  // Command Center
  commandCenterTitle: string;
  commandCenterDesc: string;
  commandPlaceholder: string;
  sendCommand: string;
  commandResult: string;
  commandProcessing: string;
  commandQuick1: string;
  commandQuick2: string;
  commandQuick3: string;
  commandQuick4: string;

  // Error Boundary
  protectedViewTitle: string;
  protectedViewDesc: string;
  retryComponent: string;

  // New Alert & Health Extension Keys
  pushNotConfigured?: string;
  criticalLockProblem?: string;
  criticalLockDesc?: string;
  criticalLockRequired?: string;
  fixAllowedNow?: string;
  notNow?: string;
  incidentTitle?: string;
  incidentCountTitle?: string;
  incidentTimeTitle?: string;
  technicalHealthTitle?: string;
  systemHealthy?: string;
  activeIncidentsCount?: string;
  activeIncidentsZero?: string;
  fixSuccessTitle?: string;
  fixFailedTitle?: string;
  viewAction?: string;
  problemTitle?: string;
  statusLabel?: string;
  actionTakenLabel?: string;
  testsPassedLabel?: string;
  rollbackSnapshotLabel?: string;
  errorReasonLabel?: string;
  testsPassed?: string;
  rollbackStatus?: string;
  rollbackAvailableText?: string;
  testsFailedDesc?: string;
  restoredSafeSystem?: string;
  resolvedStatus?: string;
  rolledBackStatus?: string;
  unreadNotificationBadge?: string;
  automaticRollbackNotice?: string;
  safeRollbackBtn?: string;
  closeBtn?: string;
  governanceSubtitle?: string;
}
