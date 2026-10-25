/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — FROZEN SOURCE-VERIFIED REMEDY CATALOG SERVICE (वैदिक उपाय संकलन)
 * PHASE 1.13H: DETERMINISTIC FROZEN CATALOG IMPLEMENTATION
 * 
 * STRICT INVARIANTS:
 * - Deterministic, immutable, static catalog; ZERO dynamic AI generation.
 * - Allowed classifications ONLY: CLASSICAL, TRADITIONAL, LATER_PRACTITIONER,
 *   REGIONAL_CUSTOM, MODERN_ESOTERIC, SOURCE_UNVERIFIED.
 * - Zero commercial services, zero gemstones, zero paid rituals, zero affiliate links.
 * - Language-independent IDs (REM_MANGAL_001, etc.).
 * - Critical evidence separation: sourceContainsPractice vs. doshSpecificSupport.
 */

import { UnifiedDoshId } from '../../types/dosh/unifiedDoshTypes';
import { RemedyItem } from '../../types/dosh/remedyTypes';

export class RemedyCatalogService {
  /**
   * Complete, audited, and immutable catalog of approved traditional remedies.
   */
  private static readonly CATALOG: readonly RemedyItem[] = [
    // -------------------------------------------------------------
    // 1. MANGAL DOSHA
    // -------------------------------------------------------------
    {
      remedyId: 'REM_MANGAL_001',
      targetDosh: 'MANGAL_DOSHA',
      category: 'TRADITIONAL_ROUTINE',
      nature: 'MATCHING_GUIDELINE',
      titleHi: 'कुंडली मिलान में मंगल संतुलन विचार',
      titleEn: 'Mutual Mars Balancing in Horoscope Matching',
      practiceHi: 'वर एवं कन्या दोनों की कुंडलियों में समान भावों (1, 4, 7, 8, 12) में पापक ग्रहों की उपस्थिति का पारंपरिक संतुलन-विचार।',
      practiceEn: 'Traditional balancing evaluation of equivalent malefic placements (1st, 4th, 7th, 8th, 12th) across prospective partners.',
      instructionHi: 'विवाह मिलान में इसे बाह्य अनुष्ठान या उपाय के रूप में न लें, बल्कि दोनों पक्षों के स्वभाव, ऊर्जा और दायित्वों के परस्पर अनुकूल संतुलन के रूप में समझें।',
      instructionEn: 'Understand this not as an external remedial ritual, but as an astrological principle of energetic and temperament compatibility.',
      sourceName: 'Brihat Parashara Hora Shastra / Muhurta Chintamani',
      edition: 'Motilal Banarsidass (Ch. 81) / Khemraj Shrikrishnadas',
      reference: 'BPHS Ch. 81, Slokas 47–49; Muhurta Chintamani, Vivaha Prakarana, Sloka 30',
      sourceClassification: 'CLASSICAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'YES',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_STATUS_PRESENT_AND_NO_BHANGA',
      safetyNoteHi: 'यह विवाह मिलान का ज्योतिषीय सिद्धांत है। इसे किसी जादू-टोने या अंधविश्वास के रूप में न लें।',
      safetyNoteEn: 'This is an astrological matching guideline. It is not an external magical fix or superstition.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'अध्याय/श्लोक क्रम संस्करण के अनुसार भिन्न हो सकता है। पाराशरी परंपरा में सम-कक्ष मंगल या पापी ग्रह की स्थिति से संतुलन माना जाता है।',
      displayNotesEn: 'Chapter and verse sequence may vary by edition. Classical canon considers mutual balance rather than external erasure.'
    },
    {
      remedyId: 'REM_MANGAL_002',
      targetDosh: 'MANGAL_DOSHA',
      category: 'MANTRA_JAPA',
      nature: 'OPTIONAL_SPIRITUAL_PRACTICE',
      titleHi: 'हनुमान उपासना एवं सुंदरकांड पाठ',
      titleEn: 'Hanuman Upasana & Sundarkand Recitation',
      practiceHi: 'श्री हनुमान चालीसा अथवा सुंदरकांड का नियमित श्रद्धापूर्वक पाठ एवं आत्म-संयम।',
      practiceEn: 'Devotional recitation of Sri Hanuman Chalisa or Sundarkand for courage and emotional balance.',
      instructionHi: 'मंगल की उग्र ऊर्जा को धैर्य, सेवा और धर्मपरायणता में रूपांतरित करने हेतु यह एक लोकप्रिय भक्ति परंपरा है।',
      instructionEn: 'A traditional devotional practice aimed at sublimating volatile Martian energy into discipline and inner patience.',
      sourceName: 'Ramcharitmanas (Goswami Tulsidas)',
      edition: 'Gita Press, Gorakhpur',
      reference: 'Sundarkand (Dohas 1–60); Sri Hanuman Chalisa',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'UNCERTAIN',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_STATUS_PRESENT',
      safetyNoteHi: 'यह पारंपरिक भक्ति साधना है। इसे वैवाहिक समस्याओं के निश्चित समाधान की गारंटी न मानें।',
      safetyNoteEn: 'Traditional devotional practice. It does not constitute a guaranteed marital guarantee.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'स्रोत उपलब्ध है, लेकिन इस Dosh के लिए विशेष prescription स्पष्ट रूप से स्थापित नहीं है। यह मंगल के अधिदेवता से संबंधित भक्ति परंपरा है।',
      displayNotesEn: 'Source is verified, but specific prescription for Mangal Dosha is traditional association rather than Parashari verse.'
    },
    {
      remedyId: 'REM_MANGAL_003',
      targetDosh: 'MANGAL_DOSHA',
      category: 'VRATA_DISCIPLINE',
      nature: 'OPTIONAL_SPIRITUAL_PRACTICE',
      titleHi: 'भौमवार (मंगलवार) सात्विक अनुशासन एवं व्रत',
      titleEn: 'Tuesday Discipline (Bhauma Vrata)',
      practiceHi: 'मंगलवार को क्रोध त्याग, नमक-रहित सात्विक आहार एवं शांत मन से आत्म-अवलोकन।',
      practiceEn: 'Tuesday observational discipline with mild salt-free diet, anger restraint, and self-reflection.',
      instructionHi: 'यदि स्वास्थ्य अनुमति दे, तभी सात्विक आहार या उपवास करें। जल का पर्याप्त सेवन रखें।',
      instructionEn: 'Only undertake dietary restraint if medically safe and suitable for your constitution.',
      sourceName: 'Bhavishya Purana',
      edition: 'Chaukhamba Sanskrit Pratishthan',
      reference: 'Bhavishya Purana, Uttara Parva, Bhauma Vrata Katha',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'UNCERTAIN',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_STATUS_PRESENT',
      safetyNoteHi: 'यदि यह अभ्यास आपकी स्वास्थ्य स्थिति के अनुकूल न हो तो इसे न करें और उचित चिकित्सकीय सलाह लें।',
      safetyNoteEn: 'If this practice is not suitable for your medical condition, do not fast and seek appropriate medical advice.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'पौराणिक व्रत परंपरा है। स्वास्थ्य को सर्वोपरि रखें; निर्जला या कठोर उपवास पूर्णतः वर्जित है।',
      displayNotesEn: 'Puranic observance. Health must take precedence; extreme or dehydrating fasts are prohibited.'
    },

    // -------------------------------------------------------------
    // 2. KALA SARPA TRADITION
    // -------------------------------------------------------------
    {
      remedyId: 'REM_KALA_001',
      targetDosh: 'KALA_SARPA_TRADITION',
      category: 'MANTRA_JAPA',
      nature: 'OPTIONAL_SPIRITUAL_PRACTICE',
      titleHi: 'महामृत्युंजय जप (आंतरिक शांति हेतु)',
      titleEn: 'Maha Mrityunjaya Japa for Inner Peace',
      practiceHi: 'भगवान शिव के महामृत्युंजय मंत्र का शांत वातावरण में मानसिक अथवा वाचिक जप।',
      practiceEn: 'Recitation of the Vedic Maha Mrityunjaya mantra for mental fortitude and spiritual groundedness.',
      instructionHi: 'कालसर्प को किसी शाप के रूप में न लें। यह वैदिक मंत्र भय-मुक्ति और प्राण-शक्ति के संवर्धन हेतु पारंपरिक रूप से जपा जाता है।',
      instructionEn: 'Approach this as an ancient Vedic meditation for tranquility and overcoming irrational anxiety.',
      sourceName: 'Rigveda Samhita',
      edition: 'Vaidika Samshodhana Mandala, Pune',
      reference: 'Rigveda Mandala 7, Sukta 59, Mantra 12',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'NO',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_FULL_CONTAINMENT_ONLY',
      canonicalDevanagari: 'ॐ त्र्य॑म्बकं यजामहे सु॒गन्धिं॑ पुष्टि॒वर्ध॑नम्।\nउ॒र्वा॒रु॒कमि॑व॒ बन्ध॑नान्मृ॒त्योर्मु॑क्षीय॒ माऽमृता॑त्॥',
      iastText: "oṃ tryambakaṃ yajāmahe sugandhiṃ puṣṭivardhanam।\nurvārukamiva bandhanānmṛtyormukṣīya mā'mṛtāt॥",
      mantraMeaningHi: 'हम त्रिनेत्रधारी भगवान शिव की आराधना करते हैं, जो पुष्टि और सुगंध के संवर्धक हैं। जिस प्रकार पका हुआ फल बंधन से मुक्त होता है, उसी प्रकार हम मृत्यु के भय से मुक्त होकर अमरता को प्राप्त हों।',
      mantraMeaningEn: 'We worship the Three-Eyed Lord Shiva, the fragrant nourisher of all beings. As a ripe fruit is liberated from its stem, may we be liberated from the bondage of mortality unto immortality.',
      safetyNoteHi: 'यह एक पारंपरिक वैदिक प्रार्थना है। उपलब्ध स्रोत में इसे विशेष रूप से कालसर्प के उपाय के रूप में निर्धारित नहीं पाया गया।',
      safetyNoteEn: 'This is an authentic traditional Vedic prayer. Available classical sources do not prescribe it specifically for Kala Sarpa.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'ऋग्वेद में कालसर्प योग का कोई उल्लेख नहीं है; 20वीं सदी के ज्योतिषियों ने शांति हेतु इस मंत्र का प्रयोग आरंभ किया।',
      displayNotesEn: 'Rigveda contains no mention of Kala Sarpa; its application is a 20th-century practitioner synthesis.'
    },
    {
      remedyId: 'REM_KALA_002',
      targetDosh: 'KALA_SARPA_TRADITION',
      category: 'SEVA_SERVICE',
      nature: 'OPTIONAL_SPIRITUAL_PRACTICE',
      titleHi: 'सप्तधान्य दान, पक्षी सेवा एवं अहिंसा',
      titleEn: 'Grain Feeding to Birds & Ecological Ahimsa',
      practiceHi: 'पक्षियों या चींटियों को सप्तधान्य (सात प्रकार के अनाज) अर्पित करना एवं वन्यजीवों के प्रति दया भाव।',
      practiceEn: 'Offering mixed wholesome grains to wild birds or ants, observing reverence toward living creatures.',
      instructionHi: 'सर्पों अथवा किसी भी जीव को कष्ट न पहुंचाएं। प्रकृति और पर्यावरण के प्रति कृतज्ञता व्यक्त करें।',
      instructionEn: 'Practice ecological kindness; avoid harming reptiles or wildlife.',
      sourceName: 'Bhavishya Purana / Mahabharata',
      edition: 'Gita Press, Gorakhpur',
      reference: 'Mahabharata, Adi Parva (Astika Parva); Bhavishya Purana',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'UNCERTAIN',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_FULL_CONTAINMENT_ONLY',
      safetyNoteHi: 'प्रकृति के प्रति सात्विक सेवा; इसमें किसी पंडित या अनुष्ठान पर धन खर्च करने की आवश्यकता नहीं है।',
      safetyNoteEn: 'Sattvic service to nature; requires zero financial expenditure or ritual middlemen.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'स्रोत उपलब्ध है (अहिंसा व नाग संस्कृति), लेकिन कालसर्प योग के लिए विशेष prescription नहीं है। यह राहु-केतु अक्ष के संरेखण में सात्विक कर्म का पारंपरिक अनुप्रयोग है।',
      displayNotesEn: 'Source is verified for ecological ahimsa, but not specifically prescribed for Kala Sarpa Yoga in classical texts.'
    },

    // -------------------------------------------------------------
    // 3. PITRISHAPA / PITRU ANALYSIS
    // -------------------------------------------------------------
    {
      remedyId: 'REM_PITRU_001',
      targetDosh: 'PITRISHAPA_ANALYSIS',
      category: 'TRADITIONAL_ROUTINE',
      nature: 'CORRECTIVE',
      titleHi: 'अमावस्या एवं पितृपक्ष श्राद्ध-तर्पण',
      titleEn: 'Shraddha & Tarpana Ancestral Remembrance',
      practiceHi: 'अमावस्या अथवा पितृपक्ष में पूर्वजों के प्रति जल-तिल से तर्पण एवं श्रद्धापूर्वक स्मरण।',
      practiceEn: 'Observance of respectful Shraddha, water-sesame offerings (Tarpana), and prayer for departed ancestors.',
      instructionHi: 'पूर्वजों को कृतज्ञतापूर्वक नमन करें। इसे किसी अनिष्ट के भय से नहीं, बल्कि वंश-परंपरा के आदर हेतु करें।',
      instructionEn: 'Offer gratitude to past generations with devotion. Ancestors are revered, not feared.',
      sourceName: 'Brihat Parashara Hora Shastra / Garuda Purana',
      edition: 'Motilal Banarsidass (Ed. Devachandra Jha) / Gita Press',
      reference: 'BPHS Ch. 83, Slokas 12–18; Garuda Purana, Dharma Khanda',
      sourceClassification: 'CLASSICAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'YES',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_STATUS_PRESENT',
      safetyNoteHi: 'पारंपरिक स्मृति विधान। महंगे व्यावसायिक पैकेजों या भयभीत करने वाले अनुष्ठानों से दूर रहें।',
      safetyNoteEn: 'Classical remembrance. Shun expensive commercial packages or fear-driven rituals.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'अध्याय/श्लोक क्रम संस्करण के अनुसार भिन्न हो सकता है। पराशर होरा शास्त्र के पितृशाप अध्याय में गया श्राद्ध व पिंडदान का सीधा निर्देश है।',
      displayNotesEn: 'Chapter numbering varies by edition. BPHS Shapa Adhyaya explicitly prescribes Shraddha and remembrance.'
    },
    {
      remedyId: 'REM_PITRU_002',
      targetDosh: 'PITRISHAPA_ANALYSIS',
      category: 'SEVA_SERVICE',
      nature: 'CORRECTIVE',
      titleHi: 'गौ-सेवा एवं अन्नदान',
      titleEn: 'Gau-Seva (Caring for Cows) & Food Giving',
      practiceHi: 'गौशाला में हरी घास, गुड़ अथवा पौष्टिक आहार अर्पित करना तथा जरूरतमंदों को भोजन कराना।',
      practiceEn: 'Providing green fodder or food to cows, and offering wholesome meals to the hungry.',
      instructionHi: 'पाराशरी संहिता में पितृशाप शमन हेतु गोदान व अन्नदान का स्पष्ट विधान वर्णित है। वर्तमान में प्रत्यक्ष सेवा ही इसका सात्विक स्वरूप है।',
      instructionEn: 'BPHS specifically mentions care and giving of cows and food as an antidote to ancestral debt.',
      sourceName: 'Brihat Parashara Hora Shastra',
      edition: 'Motilal Banarsidass',
      reference: 'BPHS Ch. 83, Sloka 15 ("गोदानं कारयेत्तत्र कन्यादानमथापि वा...")',
      sourceClassification: 'CLASSICAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'YES',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_STATUS_PRESENT',
      safetyNoteHi: 'सीधी सात्विक सेवा। किसी भी बिचौलिए को दान देने के बजाय सीधे जीव या भूखे की सेवा करें।',
      safetyNoteEn: 'Direct service to living beings without commercial intermediaries.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'शास्त्रीय प्रमाण श्लोक 15 में उपलब्ध है। इसे स्वयं निष्काम भाव से करें।',
      displayNotesEn: 'Direct classical citation in BPHS 83.15. Practice with selfless devotion.'
    },
    {
      remedyId: 'REM_PITRU_003',
      targetDosh: 'PITRISHAPA_ANALYSIS',
      category: 'SEVA_SERVICE',
      nature: 'CORRECTIVE',
      titleHi: 'पीपल, वट अथवा फलदार वृक्षारोपण',
      titleEn: 'Planting Peepal, Banyan or Shade Trees',
      practiceHi: 'पर्यावरण व भावी पीढ़ियों के कल्याण हेतु पीपल, बरगद अथवा फलदार वृक्ष का रोपण एवं उसकी रक्षा।',
      practiceEn: 'Planting and nurturing sacred shade-giving trees like Peepal or Banyan for community welfare.',
      instructionHi: 'महर्षि पराशर ने पूर्वजों की तृप्ति और वंश-वृद्धि हेतु वृक्षारोपण को अत्यंत शुभ कर्म माना है।',
      instructionEn: 'Maharishi Parashara explicitly lists planting trees as a noble remediation for ancestral afflictions.',
      sourceName: 'Brihat Parashara Hora Shastra / Varaha Purana',
      edition: 'Motilal Banarsidass',
      reference: 'BPHS Ch. 83, Sloka 16; Varaha Purana, Vriksha Mahatmya',
      sourceClassification: 'CLASSICAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'YES',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_STATUS_PRESENT',
      safetyNoteHi: 'पारिस्थितिक व सामाजिक दृष्टि से उत्कृष्ट अभ्यास। इसमें शून्य अंधविश्वास है।',
      safetyNoteEn: 'An exemplary ecological and social action with zero superstition.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'पाराशरी ग्रंथ में पितृ दोष की शांति हेतु वृक्षारोपण को दीर्घकालिक कल्याणकारी उपाय माना गया है।',
      displayNotesEn: 'Planting long-lived trees is recognized in classical texts as beneficial karma for lineage health.'
    },

    // -------------------------------------------------------------
    // 4. GURU CHANDAL ANALYSIS
    // -------------------------------------------------------------
    {
      remedyId: 'REM_GURU_001',
      targetDosh: 'GURU_CHANDAL_ANALYSIS',
      category: 'SEVA_SERVICE',
      nature: 'CORRECTIVE',
      titleHi: 'गुरु-वंदना एवं शिक्षकों का सम्मान',
      titleEn: 'Guru Vandana & Respect for Mentors',
      practiceHi: 'माता-पिता, शिक्षकों, आचार्यों व ज्ञानियों के प्रति कृतज्ञता, विनम्रता एवं सेवा भाव।',
      practiceEn: 'Cultivating humility, gratitude, and respectful conduct toward teachers, elders, and mentors.',
      instructionHi: 'गुरु चांडाल योग का मूल मनोवैज्ञानिक तत्व गुरु-अपमान या ज्ञान की विकृति है; इसका सच्चा समाधान गुरुजनों का आदर है।',
      instructionEn: 'Addresses the symbolic root of Chandal yoga (disrespect or arrogance toward preceptors) through humility.',
      sourceName: 'Guru Gita (Skanda Purana) / Shvetashvatara Upanishad',
      edition: 'Gita Press, Gorakhpur',
      reference: 'Guru Gita, Slokas 1–30; Shvetashvatara Upanishad 6.23',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'UNCERTAIN',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_STATUS_PRESENT',
      safetyNoteHi: 'आंतरिक आचरण सुधार। महंगे पुखराज या रत्नों की कोई आवश्यकता नहीं है।',
      safetyNoteEn: 'Behavioral cultivation. Yellow sapphire or costly gemstones are never required.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'स्रोत उपलब्ध है, लेकिन गुरु चांडाल योग के लिए विशेष श्लोक नहीं है। यह बृहस्पति (ज्ञान व गुरु) के कारकतत्व संतुलन पर आधारित पारंपरिक मार्गदर्शन है।',
      displayNotesEn: 'Source is verified, but not an explicit astrological remedy verse for Guru Chandal Yoga. It represents traditional ethical conduct aligned with Jupiterian karakatva.'
    },
    {
      remedyId: 'REM_GURU_002',
      targetDosh: 'GURU_CHANDAL_ANALYSIS',
      category: 'SVADHYAYA',
      nature: 'OPTIONAL_SPIRITUAL_PRACTICE',
      titleHi: 'स्वाध्याय: नैतिक एवं दार्शनिक ग्रंथों का अध्ययन',
      titleEn: 'Svadhyaya: Contemplative Moral Study',
      practiceHi: 'प्रतिदिन गीता, उपनिषद अथवा सद्ग्रंथों के किसी अंश का मननपूर्वक अध्ययन एवं विवेक का अभ्यास।',
      practiceEn: 'Daily reading of philosophical or ethical literature to sharpen moral discrimination (Viveka).',
      instructionHi: 'राहु जनित भ्रम और बौद्धिक भटकाव से बचने के लिए प्रामाणिक ज्ञान का नियमित अध्ययन सर्वश्रेष्ठ उपाय है।',
      instructionEn: 'Regular contemplation of wisdom counters speculative confusion and intellectual cynicism.',
      sourceName: 'Patanjali Yoga Sutras / Bhagavad Gita',
      edition: 'Motilal Banarsidass',
      reference: 'Yoga Sutras 2.32 & 2.44; Gita Ch. 16',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'UNCERTAIN',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_STATUS_PRESENT',
      safetyNoteHi: 'स्वाध्याय विशुद्ध बौद्धिक व नैतिक साधन है। यह किसी अंधविश्वास पर निर्भर नहीं है।',
      safetyNoteEn: 'Purely intellectual and spiritual refinement; completely free of superstition.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'स्रोत उपलब्ध है, लेकिन इस Dosh के लिए विशेष prescription स्पष्ट रूप से स्थापित नहीं है। यह बुद्धि शुद्धि का सार्वभौमिक योग नियम है।',
      displayNotesEn: 'Source is verified, but specific prescription for this Dosh is a traditional application of Yogic Svadhyaya.'
    },

    // -------------------------------------------------------------
    // 5. GRAHAN VICHAR ANALYSIS
    // -------------------------------------------------------------
    {
      remedyId: 'REM_GRAHAN_001',
      targetDosh: 'GRAHAN_VICHAR',
      category: 'MANTRA_JAPA',
      nature: 'OPTIONAL_SPIRITUAL_PRACTICE',
      titleHi: 'सूर्य/चंद्र गायत्री ध्यान एवं मौन',
      titleEn: 'Surya/Chandra Gayatri Meditation & Silence',
      practiceHi: 'प्रातःकाल अथवा शांत वेला में सूर्य या चंद्र गायत्री का मानसिक जप एवं कुछ समय मौन ध्यान।',
      practiceEn: 'Silent mental contemplation or recitation of the solar/lunar Gayatri for emotional clarity.',
      instructionHi: 'ग्रहण योग मन और आत्मा पर राहु/केतु के प्रभाव को दर्शाता है। प्रकाश और एकाग्रता का ध्यान मन को स्थिर करता है।',
      instructionEn: 'Counters the psychological agitation of lunar nodes upon luminaries through quiet mindfulness.',
      sourceName: 'Mahanarayana Upanishad',
      edition: 'Ramakrishna Math',
      reference: 'Mahanarayana Upanishad, Section 2',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'UNCERTAIN',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_STATUS_PRESENT',
      canonicalDevanagari: 'ॐ भास्कराय॑ वि॒द्महे॑ महद्द्युतिकरा॑य धीमहि।\nतन्नो॑ आदित्यः प्रचो॒दया॑त्॥',
      iastText: 'oṃ bhāskarāya vidmahe mahaddyutikarāya dhīmahi।\ntanno ādityaḥ pracodayāt॥',
      mantraMeaningHi: 'हम प्रकाशवान सूर्य देव को जानते हैं और उन महान दीप्तिमान का ध्यान करते हैं। वे आदित्य हमारी बुद्धि को सन्मार्ग पर प्रेरित करें।',
      mantraMeaningEn: 'May we know the radiant Sun and meditate upon that great illuminator. May Aditya inspire our intellect on the noble path.',
      safetyNoteHi: 'यह पारंपरिक उपनिषदिक ध्यान है। इसे किसी बीमारी के अचूक इलाज के रूप में प्रस्तुत न करें।',
      safetyNoteEn: 'Traditional Upanishadic meditation; not a medical cure or substitute for professional care.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'स्रोत उपलब्ध है, लेकिन जन्मकालीन ग्रहण योग हेतु यह विशेष श्लोक नहीं है। यह प्रकाश-तत्त्व की सार्वभौमिक वैदिक उपासना है।',
      displayNotesEn: 'Upanishadic Gayatri; traditionally applied to afflicted luminaries for mental illumination.'
    },
    {
      remedyId: 'REM_GRAHAN_002',
      targetDosh: 'GRAHAN_VICHAR',
      category: 'DAAN_CHARITY',
      nature: 'OPTIONAL_SPIRITUAL_PRACTICE',
      titleHi: 'अन्न एवं तिल का सात्विक दान',
      titleEn: 'Food Grains & Sesame Charity',
      practiceHi: 'सूर्य हेतु गेहूं, चंद्र हेतु चावल/दूध, अथवा राहु/केतु हेतु तिल का जरूरतमंदों को पारदर्शी दान।',
      practiceEn: 'Offering wheat, rice, or sesame to needy individuals as an act of selfless generosity.',
      instructionHi: 'मत्स्य पुराण में ग्रहण काल एवं ग्रह पीड़ा की शांति हेतु अन्नदान को सर्वाधिक पुण्यप्रद कहा गया है।',
      instructionEn: 'Matsya Purana praises grain charity during planetary afflictions as a direct sattvic merit.',
      sourceName: 'Matsya Purana / Brihat Samhita',
      edition: 'Chaukhamba Sanskrit Sansthan',
      reference: 'Matsya Purana Ch. 205–207; Brihat Samhita Ch. 5',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'YES',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_STATUS_PRESENT',
      safetyNoteHi: 'दान अपनी सामर्थ्य अनुसार ऐच्छिक होना चाहिए। कभी भी किसी दबाव में न दें।',
      safetyNoteEn: 'Charity must be strictly voluntary and within one’s means; never coercive.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'ग्रह पीड़ा शांति प्रकरण में अन्न दान का स्पष्ट पारंपरिक उल्लेख मिलता है।',
      displayNotesEn: 'Classical Grahadana sections explicitly link grain donation with soothing lunar and solar afflictions.'
    },

    // -------------------------------------------------------------
    // 6. KEMADRUMA YOGA & BHANGA
    // -------------------------------------------------------------
    {
      remedyId: 'REM_KEMA_001',
      targetDosh: 'KEMADRUMA_ANALYSIS',
      category: 'MANTRA_JAPA',
      nature: 'OPTIONAL_SPIRITUAL_PRACTICE',
      titleHi: 'भगवान शिव (चंद्रशेखर) की उपासना',
      titleEn: 'Worship of Lord Shiva (Chandra-Shekhara)',
      practiceHi: 'भगवान शिव के चंद्रशेखर रूप का ध्यान अथवा "ॐ नमः शिवाय" का शांत मन से जप।',
      practiceEn: 'Contemplation of Lord Shiva who adorns the isolated crescent Moon upon His head.',
      instructionHi: 'चंद्रमा को सहारा देने वाले देवाधिदेव शिव की शरण में जाना एकाकीपन और मानसिक अशांति को दूर करता है।',
      instructionEn: 'Tradition seeks refuge in Lord Shiva as the cosmic protector of the isolated Moon.',
      sourceName: 'Shiva Purana',
      edition: 'Gita Press, Gorakhpur',
      reference: 'Shiva Purana, Rudra Samhita',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'UNCERTAIN',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_ONLY_IF_BASE_PRESENT_AND_BHANGA_IS_FALSE',
      canonicalDevanagari: 'ॐ नमः शिवाय।',
      iastText: 'oṃ namaḥ śivāya।',
      mantraMeaningHi: 'कल्याणकारी देवाधिदेव भगवान शिव को सादर नमन।',
      mantraMeaningEn: 'Salutations to the auspicious Lord Shiva.',
      safetyNoteHi: 'यदि कुंडली में केमद्रुम भंग उपस्थित है, तो यह उपाय आवश्यक नहीं है। केवल ऐच्छिक साधना है।',
      safetyNoteEn: 'If Kemadruma Bhanga is present in the chart, this remedy is NOT required. Purely optional.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'भंग/शमन नियम सक्रिय होने पर कोई corrective उपाय आवश्यक नहीं है। यह केवल चित्त शांति हेतु वैकल्पिक साधना है।',
      displayNotesEn: 'When Bhanga is present, no corrective remedy is needed. This remains purely optional contemplation.'
    },
    {
      remedyId: 'REM_KEMA_002',
      targetDosh: 'KEMADRUMA_ANALYSIS',
      category: 'TRADITIONAL_ROUTINE',
      nature: 'OPTIONAL_SPIRITUAL_PRACTICE',
      titleHi: 'मानसिक संतुलन, दिनचर्या एवं मातृ-सेवा',
      titleEn: 'Emotional Grounding, Routine & Maternal Care',
      practiceHi: 'नियमित दैनिक दिनचर्या, जल का सदुपयोग, माता का सम्मान एवं सामाजिक एकांत से बचाव।',
      practiceEn: 'Structured daily routine, emotional grounding, honoring mother, and active social connection.',
      instructionHi: 'चरक संहिता का सद्वृत्त बताता है कि नियमित दिनचर्या और परिजनों का सानिध्य चित्त की अस्थिरता को समाप्त करता है।',
      instructionEn: 'Classical Ayurvedic Sadvritta prescribes disciplined routine and community warmth to cure lunar loneliness.',
      sourceName: 'Charaka Samhita (Sadvritta) / BPHS Karakatva',
      edition: 'Chaukhamba Bharati Academy',
      reference: 'Charaka Samhita, Sutrasthana Ch. 8; BPHS Ch. 3',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'UNCERTAIN',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_ONLY_IF_BASE_PRESENT_AND_BHANGA_IS_FALSE',
      safetyNoteHi: 'व्यावहारिक जीवन-पद्धति। केमद्रुम से स्थायी निर्धनता या मानसिक रोग का कोई निश्चित योग नहीं बनता।',
      safetyNoteEn: 'Practical psychological hygiene. Kemadruma does not guarantee permanent poverty or distress.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'स्रोत उपलब्ध है, लेकिन केमद्रुम योग के लिए यह सीधा शास्त्रीय उपाय नहीं है। यह चंद्र के कारकतत्व (मन व माता) और आयुर्वेद के सद्वृत्त पर आधारित व्यावहारिक मार्गदर्शन है।',
      displayNotesEn: 'Source is verified, but not a direct classical remedy verse for Kemadruma. It is practical guidance based on Moon karakatva and Ayurvedic Sadvritta.'
    },

    // -------------------------------------------------------------
    // 7. SHANI SADE SATI & DHAIYYA
    // -------------------------------------------------------------
    {
      remedyId: 'REM_SHANI_001',
      targetDosh: 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS',
      category: 'MANTRA_JAPA',
      nature: 'OPTIONAL_SPIRITUAL_PRACTICE',
      titleHi: 'दशरथकृत शनि स्तोत्र पाठ',
      titleEn: 'Dasharatha Kruta Shani Stotra',
      practiceHi: 'शनिवार को अथवा संध्या समय दशरथकृत शनि स्तोत्र का शांत चित्त से पाठ।',
      practiceEn: 'Devotional recitation of the Dasharatha Kruta Shani Stotra on Saturdays.',
      instructionHi: 'पद्म पुराण में वर्णित इस स्तोत्र में राजा दशरथ ने शनिदेव की न्यायप्रियता व तपस्या की स्तुति की है।',
      instructionEn: 'From Padma Purana, praises Saturn as the cosmic arbiter of truth, discipline, and endurance.',
      sourceName: 'Padma Purana (Uttara Khanda)',
      edition: 'Gita Press / Venkateshvara Press',
      reference: 'Padma Purana, Uttara Khanda, Dasharatha-Shani Samvada, Slokas 1–32',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'YES',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_SADE_SATI_OR_DHAIYYA_ACTIVE',
      canonicalDevanagari: 'कोणस्थः पिङ्गलो बभ्रुः कृष्णो रौद्रोऽन्तको यमः।\nसौरिः शनैश्चरो मन्दः पिप्पलादेन संस्तुतः॥\nनमस्ते कोणसंस्थाय पिङ्गलाय नमोऽस्तु ते।\nनमस्ते बभ्रुरूपाय कृष्णाय च नमोऽस्तु ते॥',
      iastText: "koṇasthaḥ piṅgalo babhruḥ kṛṣṇo raudro'ntako yamaḥ।\nsauriḥ śanaiścaro mandaḥ pippalādena saṃstutaḥ॥\nnamaste koṇasaṃsthāya piṅgalāya namo'stu te।\nnamaste babhrurūpāya kṛṣṇāya ca namo'stu te॥",
      mantraMeaningHi: 'कोणस्थ, पिंगल, बभ्रु, कृष्ण, रौद्र, अंतक, यम, सौरि, शनैश्चर तथा मंद—इन पवित्र नामों वाले शनिदेव को सादर नमस्कार।',
      mantraMeaningEn: 'Salutations to Saturn, addressed by the sacred names: Konastha, Pingala, Babhru, Krishna, Raudra, Antaka, Yama, Sauri, Shanaishchara, and Manda.',
      safetyNoteHi: 'शनि न्याय और अनुशासन के प्रतीक हैं, शत्रु नहीं। दुर्घटना या मृत्यु जैसे डरावने दावों पर विश्वास न करें।',
      safetyNoteEn: 'Saturn embodies cosmic discipline, not arbitrary harm. Reject fatalistic or fear-based predictions.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'पद्म पुराण में इस स्तोत्र के पाठकों को शनि के गोचरीय कष्ट से अभय का वरदान वर्णित है।',
      displayNotesEn: 'Padma Purana dialogue explicitly grants solace to those reciting this stotra during Saturn transits.'
    },
    {
      remedyId: 'REM_SHANI_002',
      targetDosh: 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS',
      category: 'SEVA_SERVICE',
      nature: 'CORRECTIVE',
      titleHi: 'श्रमिकों, शिल्पियों, वृद्धों एवं दिव्यांगों की सेवा',
      titleEn: 'Service to Manual Laborers, Artisans & Elderly',
      practiceHi: 'श्रमजीवियों को उचित व समय पर पारिश्रमिक देना, सम्मान से बात करना तथा असहायों की सहायता।',
      practiceEn: 'Paying fair wages promptly, treating workers with respect, and assisting vulnerable elders.',
      instructionHi: 'महर्षि पराशर के अनुसार शनि श्रम, सेवा और न्याय के कारक हैं। श्रमजीवियों के साथ न्याय ही शनि की वास्तविक शांति है।',
      instructionEn: 'BPHS establishes Saturn as the significator of laborers and the elderly; treating them with dignity aligns with Saturn.',
      sourceName: 'Brihat Parashara Hora Shastra',
      edition: 'Motilal Banarsidass',
      reference: 'BPHS Ch. 3 (Saturn Karakatva)',
      sourceClassification: 'TRADITIONAL',
      sourceContainsPractice: true,
      doshSpecificSupport: 'UNCERTAIN',
      verificationStatus: 'VERIFIED',
      eligibilityRule: 'ELIGIBLE_IF_SADE_SATI_OR_DHAIYYA_ACTIVE',
      safetyNoteHi: 'सच्चा नैतिक व सामाजिक आचरण। महंगे छल्लों या ताबीजों से कहीं अधिक प्रभावशाली कर्म-शुद्धि है।',
      safetyNoteEn: 'Genuine ethical conduct. Karma refinement is far more meaningful than commercial rings or amulets.',
      languageStatus: 'BILINGUAL_VERIFIED',
      displayNotesHi: 'स्रोत उपलब्ध है (शनि कारकतत्व), लेकिन साढ़ेसाती निवारण हेतु यह सीधा श्लोक नहीं है। श्रमजीवियों के सम्मान का यह अभ्यास शनि के न्याय व सेवा कारकतत्व पर आधारित पारंपरिक सदाचार है।',
      displayNotesEn: 'Source is verified (Saturn significations in BPHS), but not an explicit remedy verse for Sade Sati. It represents ethical conduct aligned with Saturn karakatva.'
    }
  ];

  /**
   * Returns all frozen remedies.
   */
  public static getAllRemedies(): readonly RemedyItem[] {
    return Object.freeze([...this.CATALOG]);
  }

  /**
   * Retrieves remedies targeted to a specific Dosh subsystem.
   */
  public static getRemediesByDoshId(doshId: UnifiedDoshId): RemedyItem[] {
    return this.CATALOG.filter(r => r.targetDosh === doshId);
  }

  /**
   * Retrieves a specific remedy by programmatic ID.
   */
  public static getRemedyById(remedyId: string): RemedyItem | undefined {
    return this.CATALOG.find(r => r.remedyId === remedyId);
  }
}
