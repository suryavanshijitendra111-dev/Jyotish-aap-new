/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PRASHNA KUNDLI TRADITIONAL MODES & CATEGORIES
 */

import { PrashnaQuestionMode } from '../types/kundli';

export interface PrashnaExampleQuestion {
  hindi: string;
  english: string;
}

export interface PrashnaModeConfig {
  id: PrashnaQuestionMode;
  number: number;
  labelHindi: string;
  labelEnglish: string;
  category: string;
  descriptionHindi: string;
  descriptionEnglish: string;
  primaryHouse: number;
  secondaryHouses: number[];
  primarySignificator: string;
  secondarySignificators: string[];
  quickExamples: PrashnaExampleQuestion[];
  disclaimer?: string;
}

export const PRASHNA_MODES: PrashnaModeConfig[] = [
  {
    id: 'general',
    number: 1,
    labelHindi: 'सामान्य प्रश्न',
    labelEnglish: 'General Query',
    category: 'सभी',
    descriptionHindi: 'दैनिक जीवन, कार्यसिद्धि एवं सामान्य परिस्थितियों के समाधान हेतु।',
    descriptionEnglish: 'For daily life situations, generic guidance and general outcomes.',
    primaryHouse: 1,
    secondaryHouses: [9, 11],
    primarySignificator: 'Moon',
    secondarySignificators: ['Jupiter', 'Sun'],
    quickExamples: [
      { hindi: 'क्या यह कार्य मेरे लिए फलदायी रहेगा?', english: 'Will this endeavor be fruitful for me?' },
      { hindi: 'क्या वर्तमान समय मेरे अनुकूल है?', english: 'Is the current time favorable for me?' }
    ]
  },
  {
    id: 'lost_object',
    number: 2,
    labelHindi: 'खोई वस्तु प्राप्ति',
    labelEnglish: 'Lost Object',
    category: 'अर्थ व संपत्ति',
    descriptionHindi: 'खोई अथवा विस्मृत वस्तुओं की दिशा, प्राप्ति संभावना एवं काल निर्धारण।',
    descriptionEnglish: 'Locating misplaced or lost articles, direction and retrieval timing.',
    primaryHouse: 2,
    secondaryHouses: [4, 7, 8],
    primarySignificator: 'Moon',
    secondarySignificators: ['Mercury', 'Mars'],
    quickExamples: [
      { hindi: 'मेरी खोई हुई वस्तु कब और कहाँ मिलेगी?', english: 'When and where will my lost item be found?' },
      { hindi: 'क्या खोया सामान सुरक्षित है?', english: 'Is the misplaced item safe?' }
    ],
    disclaimer: 'वस्तु प्राप्ति में स्वयं का यत्न (खोज) भी परम आवश्यक है।'
  },
  {
    id: 'career',
    number: 3,
    labelHindi: 'नौकरी व आजीविका',
    labelEnglish: 'Career & Employment',
    category: 'कार्य व व्यवसाय',
    descriptionHindi: 'पदोन्नति, नई नौकरी, स्थानांतरण एवं कार्यक्षेत्र में स्थायित्व।',
    descriptionEnglish: 'Promotion, new job offers, career changes and workplace stability.',
    primaryHouse: 10,
    secondaryHouses: [2, 6, 11],
    primarySignificator: 'Sun',
    secondarySignificators: ['Saturn', 'Mercury'],
    quickExamples: [
      { hindi: 'क्या मुझे नई नौकरी में सफलता मिलेगी?', english: 'Will I get success in the new job?' },
      { hindi: 'क्या पदोन्नति का योग निकट भविष्य में है?', english: 'Is a promotion indicated soon?' }
    ]
  },
  {
    id: 'financial',
    number: 4,
    labelHindi: 'धन एवं ऋण',
    labelEnglish: 'Wealth & Finance',
    category: 'अर्थ व संपत्ति',
    descriptionHindi: 'अटका हुआ धन, ऋण मुक्ति, निवेश लाभ एवं आर्थिक समृद्धि।',
    descriptionEnglish: 'Stuck finances, loan clearance, investments and monetary flow.',
    primaryHouse: 2,
    secondaryHouses: [5, 9, 11],
    primarySignificator: 'Jupiter',
    secondarySignificators: ['Mercury', 'Venus'],
    quickExamples: [
      { hindi: 'क्या अटका हुआ धन वापस मिलेगा?', english: 'Will I recover my blocked money?' },
      { hindi: 'क्या इस निवेश से लाभ होगा?', english: 'Will this investment yield profit?' }
    ]
  },
  {
    id: 'relationship',
    number: 5,
    labelHindi: 'विवाह एवं संबंध',
    labelEnglish: 'Marriage & Relationships',
    category: 'संबंध व परिवार',
    descriptionHindi: 'विवाह प्रस्ताव, दाम्पत्य सौहार्द एवं पारस्परिक सामंजस्य।',
    descriptionEnglish: 'Marriage proposals, marital harmony and mutual understanding.',
    primaryHouse: 7,
    secondaryHouses: [2, 4, 11],
    primarySignificator: 'Venus',
    secondarySignificators: ['Jupiter', 'Moon'],
    quickExamples: [
      { hindi: 'क्या इस विवाह प्रस्ताव को स्वीकार करना शुभ है?', english: 'Is it auspicious to accept this marriage proposal?' },
      { hindi: 'क्या संबंधों में मधुरता लौटेगी?', english: 'Will peace and warmth return to the relationship?' }
    ]
  },
  {
    id: 'health',
    number: 6,
    labelHindi: 'स्वास्थ्य व आरोग्य',
    labelEnglish: 'Health & Vitality',
    category: 'आयु व स्वास्थ्य',
    descriptionHindi: 'रोग निवृत्ति, स्वास्थ्य लाभ एवं आरोग्य सुधार की संभावना।',
    descriptionEnglish: 'Recovery from illness, vitality and general medical prognosis.',
    primaryHouse: 1,
    secondaryHouses: [5, 6, 8, 11],
    primarySignificator: 'Sun',
    secondarySignificators: ['Moon', 'Jupiter'],
    quickExamples: [
      { hindi: 'स्वास्थ्य में सुधार कब तक संभव है?', english: 'When can improvement in health be expected?' }
    ],
    disclaimer: 'यह केवल ज्योतिषीय संभावना है, योग्य चिकित्सक से परामर्श अनिवार्य है।'
  },
  {
    id: 'two_option',
    number: 7,
    labelHindi: 'द्वि-विकल्प तुलना',
    labelEnglish: 'Two-Option Decision',
    category: 'कार्य व व्यवसाय',
    descriptionHindi: 'दो विकल्पों (A बनाम B) में से अनुकूल दिशा का तुलनात्मक शास्त्रीय अध्ययन।',
    descriptionEnglish: 'Comparative horary analysis between Option A (1st house) and Option B (7th house).',
    primaryHouse: 1,
    secondaryHouses: [7, 10, 11],
    primarySignificator: 'Jupiter',
    secondarySignificators: ['Mercury', 'Venus'],
    quickExamples: [
      { hindi: 'विकल्प A या विकल्प B में से कौन सा अधिक फलदायी रहेगा?', english: 'Which of Option A or Option B will be more favorable?' }
    ]
  },
  {
    id: 'travel',
    number: 8,
    labelHindi: 'यात्रा व विदेश गमन',
    labelEnglish: 'Travel & Relocation',
    category: 'सभी',
    descriptionHindi: 'यात्रा की सफलता, विदेश गमन एवं स्थान परिवर्तन के योग।',
    descriptionEnglish: 'Journey success, foreign travel and relocation prospects.',
    primaryHouse: 9,
    secondaryHouses: [3, 7, 12],
    primarySignificator: 'Moon',
    secondarySignificators: ['Venus', 'Rahu'],
    quickExamples: [
      { hindi: 'क्या यह यात्रा सुरक्षित व सफल रहेगी?', english: 'Will this journey be safe and successful?' },
      { hindi: 'क्या विदेश जाने का मार्ग खुलेगा?', english: 'Will foreign travel materialize?' }
    ]
  },
  {
    id: 'yes_no',
    number: 9,
    labelHindi: 'हाँ / ना त्वरित प्रश्न',
    labelEnglish: 'Yes/No Fast Inquiry',
    category: 'सभी',
    descriptionHindi: 'प्रत्यक्ष कार्यसिद्धि व ताजिक योग के आधार पर त्वरित समाधान।',
    descriptionEnglish: 'Fast affirmative or negative horary guidance based on Tajik yogas.',
    primaryHouse: 1,
    secondaryHouses: [11],
    primarySignificator: 'Moon',
    secondarySignificators: ['Jupiter'],
    quickExamples: [
      { hindi: 'क्या आज मेरा यह कार्य संपन्न हो जाएगा?', english: 'Will my work be accomplished today?' }
    ]
  }
];

export function getPrashnaModeConfig(mode: PrashnaQuestionMode): PrashnaModeConfig {
  const found = PRASHNA_MODES.find(m => m.id === mode);
  return found || PRASHNA_MODES[0];
}
