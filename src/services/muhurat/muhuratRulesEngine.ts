/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MUHURAT RULES ENGINE & CATEGORY REGISTRY
 */

import { MuhuratCategoryKey, MuhuratCategoryConfig } from '../../types/muhurat/muhuratTypes';

export const MUHURAT_CATEGORIES: Record<MuhuratCategoryKey, MuhuratCategoryConfig> = {
  marriage: {
    key: 'marriage',
    titleHindi: 'विवाह मुहूर्त (Marriage)',
    titleEnglish: 'Marriage Ceremony',
    iconName: 'Heart',
    descriptionHindi: 'वैदिक विवाह संस्कार, पाणिग्रहण एवं दाम्पत्य जीवन का शुभ आरंभ।',
    descriptionEnglish: 'Sacred wedding ceremony, matrimonial union and lifelong marital harmony.',
    classicalSources: ['मुहूर्त चिंतामणि (विवाह प्रकरण)', 'कालप्रकाशिका']
  },
  griha_pravesh: {
    key: 'griha_pravesh',
    titleHindi: 'गृह प्रवेश (House Warming)',
    titleEnglish: 'House Warming Ceremony',
    iconName: 'Home',
    descriptionHindi: 'नूतन अथवा अपूर्व गृह में प्रथम प्रवेश, वास्तु शांति एवं सुख-समृद्धि।',
    descriptionEnglish: 'New house entry, Vastu peace and family prosperity.',
    classicalSources: ['मुहूर्त चिंतामणि (वास्तु प्रकरण)', 'वसिष्ठ संहिता']
  },
  bhumi_pujan: {
    key: 'bhumi_pujan',
    titleHindi: 'भूमि पूजन व निर्माण (Foundation Laying)',
    titleEnglish: 'Foundation Laying / Ground Breaking',
    iconName: 'Hammer',
    descriptionHindi: 'गृह निर्माण हेतु नींव खनन, शिला पूजन एवं आधारशिला प्रतिष्ठा।',
    descriptionEnglish: 'Laying the foundation stone and ground-breaking for construction.',
    classicalSources: ['शिल्प शास्त्र', 'विश्वकर्मा प्रकाश']
  },
  vehicle_purchase: {
    key: 'vehicle_purchase',
    titleHindi: 'वाहन क्रय (Vehicle Purchase)',
    titleEnglish: 'Vehicle Purchase',
    iconName: 'Car',
    descriptionHindi: 'नया वाहन (कार, बाइक, व्यावसायिक वाहन) क्रय एवं डिलीवरी मुहूर्त।',
    descriptionEnglish: 'Purchasing and taking delivery of cars, bikes, and transport vehicles.',
    classicalSources: ['मुहूर्त गणपति', 'नारद संहिता']
  },
  business_start: {
    key: 'business_start',
    titleHindi: 'व्यापार / दुकान शुरुआत (Business Inauguration)',
    titleEnglish: 'Business & Office Start',
    iconName: 'Briefcase',
    descriptionHindi: 'नई दुकान, कार्यालय, प्रतिष्ठान अथवा व्यावसायिक अनुबंध का शुभारंभ।',
    descriptionEnglish: 'Inauguration of new business, shop, venture or signing commercial agreements.',
    classicalSources: ['मुहूर्त मार्तण्ड', 'कालप्रकाशिका']
  },
  namkaran: {
    key: 'namkaran',
    titleHindi: 'नामकरण संस्कार (Naming Ceremony)',
    titleEnglish: 'Naming Ceremony',
    iconName: 'Baby',
    descriptionHindi: 'नवजात शिशु का वैदिक विधि अनुसार नामकरण संस्कार।',
    descriptionEnglish: 'Traditional Vedic naming ceremony for the newborn child.',
    classicalSources: ['पारस्कर गृह्यसूत्र', 'आश्वलायन गृह्यसूत्र']
  },
  annaprashan: {
    key: 'annaprashan',
    titleHindi: 'अन्नप्राशन (First Solid Feeding)',
    titleEnglish: 'First Feeding Ceremony',
    iconName: 'Utensils',
    descriptionHindi: 'शिशु को प्रथम बार अन्न (खीर/अन्न) का सेवन कराने का शुभ मुहूर्त।',
    descriptionEnglish: 'Ceremony of introducing first solid food and grains to the infant.',
    classicalSources: ['मुहूर्त चिंतामणि (संस्कार प्रकरण)']
  },
  upanayana: {
    key: 'upanayana',
    titleHindi: 'उपनयन / विद्यारंभ (Education & Thread)',
    titleEnglish: 'Sacred Thread & Education',
    iconName: 'GraduationCap',
    descriptionHindi: 'यज्ञोपवीत संस्कार, वेदारंभ एवं उच्च विद्या अध्ययन की शुरुआत।',
    descriptionEnglish: 'Upanayana thread ceremony and commencing formal studies or education.',
    classicalSources: ['मनुस्मृति', 'बौधायन गृह्यसूत्र']
  },
  travel_journey: {
    key: 'travel_journey',
    titleHindi: 'यात्रा आरंभ (Travel & Journey)',
    titleEnglish: 'Travel & Journey',
    iconName: 'Compass',
    descriptionHindi: 'दूर देश, विदेश गमन अथवा महत्वपूर्ण कार्य हेतु यात्रा का आरंभ।',
    descriptionEnglish: 'Commencing long-distance journeys, relocations or foreign trips.',
    classicalSources: ['मुहूर्त चिंतामणि (यात्रा प्रकरण)', 'दिशाशूल विचार']
  },
  sarva_karya: {
    key: 'sarva_karya',
    titleHindi: 'सर्वकार्य सिद्धि (General Auspicious Task)',
    titleEnglish: 'General Auspicious Venture',
    iconName: 'Sparkles',
    descriptionHindi: 'सामान्य शुभ कार्य, बैंक खाता, निवेश, आभूषण क्रय व नए समझौते।',
    descriptionEnglish: 'General auspicious tasks, opening accounts, gold purchase, and general ventures.',
    classicalSources: ['अभिजित मुहूर्त विचार', 'अमृत चौघड़िया']
  }
};
