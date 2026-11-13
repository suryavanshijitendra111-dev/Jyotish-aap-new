import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Compass, 
  RotateCw, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Volume2
} from 'lucide-react';
import { MasterKundliData } from '../../types/kundli';
import { RealTransitPlanetDetail, TransitAnalysisResult, TransitEngine } from '../../services/jyotish/transitEngine';
import { useTranslation } from '../../i18n';
import { getLocalizedPlanet, getLocalizedRashi, getPlanetAbbreviation } from '../../i18n/astrology';
import { SpeechEngine } from '../../services/companion/speechEngine';
import OrnateCorner from '../ui/OrnateCorner';
import YantraMotif from '../ui/YantraMotif';

interface LiveTransitChartProps {
  masterData?: MasterKundliData | null;
  className?: string;
  initialViewMode?: TransitViewMode;
}

type TransitViewMode = 'birth_moon' | 'birth_lagna' | 'live_lagna';

const RASHI_NAMES_LIST = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const RASHI_HINDI_NAMES = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'
];

const HOUSE_POLYGONS: Record<number, string> = {
  1: "50,0 75,25 50,50 25,25",
  2: "0,0 50,0 25,25",
  3: "0,0 25,25 0,50",
  4: "0,50 25,25 50,50 25,75",
  5: "0,50 25,75 0,100",
  6: "0,100 50,100 25,75",
  7: "50,100 25,75 50,50 75,75",
  8: "50,100 100,100 75,75",
  9: "100,100 100,50 75,75",
  10: "100,50 75,75 50,50 75,25",
  11: "100,50 100,0 75,25",
  12: "100,0 50,0 75,25"
};

const HOUSE_POSITIONS: Record<number, string> = {
  1: 'top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2',
  2: 'top-[10%] left-[25%] -translate-x-1/2 -translate-y-1/2',
  3: 'top-[25%] left-[10%] -translate-x-1/2 -translate-y-1/2',
  4: 'top-[50%] left-[23%] -translate-x-1/2 -translate-y-1/2',
  5: 'top-[75%] left-[10%] -translate-x-1/2 -translate-y-1/2',
  6: 'top-[90%] left-[25%] -translate-x-1/2 -translate-y-1/2',
  7: 'top-[77%] left-1/2 -translate-x-1/2 -translate-y-1/2',
  8: 'top-[90%] left-[75%] -translate-x-1/2 -translate-y-1/2',
  9: 'top-[75%] left-[90%] -translate-x-1/2 -translate-y-1/2',
  10: 'top-[50%] left-[77%] -translate-x-1/2 -translate-y-1/2',
  11: 'top-[25%] left-[90%] -translate-x-1/2 -translate-y-1/2',
  12: 'top-[10%] left-[75%] -translate-x-1/2 -translate-y-1/2'
};

const HOUSE_CENTROIDS: Record<number, { x: number; y: number }> = {
  1: { x: 50, y: 25 },
  2: { x: 25, y: 8.33 },
  3: { x: 8.33, y: 25 },
  4: { x: 25, y: 50 },
  5: { x: 8.33, y: 75 },
  6: { x: 25, y: 91.67 },
  7: { x: 50, y: 75 },
  8: { x: 75, y: 91.67 },
  9: { x: 91.67, y: 75 },
  10: { x: 75, y: 50 },
  11: { x: 91.67, y: 25 },
  12: { x: 75, y: 8.33 }
};

// Classical Gochar Fruit Guidance from Phaladeepika / Brihat Samhita for all 9 planets
const GOCHAR_EFFECTS_FROM_MOON: Record<string, Record<number, { quality: 'Shubha' | 'Madhyam' | 'Ashubha'; phalaHi: string; phalaEn: string }>> = {
  Sun: {
    1: { quality: 'Ashubha', phalaHi: 'थकान, कार्य में बाधाएं व स्वास्थ्य पर ध्यान दें', phalaEn: 'Fatigue, delays, health vigilance' },
    2: { quality: 'Ashubha', phalaHi: 'आर्थिक व्यय, कटु वाणी से बचें', phalaEn: 'Expenditure, avoid harsh speech' },
    3: { quality: 'Shubha', phalaHi: 'आरोग्य लाभ, पराक्रम वृद्धि, शत्रु पराजय', phalaEn: 'Vitality, courage, victory over hurdles' },
    4: { quality: 'Ashubha', phalaHi: 'मानसिक अशांति, घरेलू कार्यों में व्यस्तता', phalaEn: 'Domestic concerns, mental restlessness' },
    5: { quality: 'Ashubha', phalaHi: 'संतान व अध्ययन संबंधी चिंता, भ्रम से बचें', phalaEn: 'Intellectual anxiety, speculation caution' },
    6: { quality: 'Shubha', phalaHi: 'शत्रु नाश, रोग मुक्ति, ऋण मुक्ति प्रयास सफल', phalaEn: 'Disease relief, debt resolution, success' },
    7: { quality: 'Ashubha', phalaHi: 'यात्रा में विलंब, साझेदारी में सामंजस्य रखें', phalaEn: 'Travel delays, partnership diplomacy' },
    8: { quality: 'Ashubha', phalaHi: 'स्वास्थ्य सजगता, आकस्मिक खर्चों पर नियंत्रण', phalaEn: 'Health discipline, contingency control' },
    9: { quality: 'Madhyam', phalaHi: 'धर्म-कर्म में रुचि, गुरुजनों का आशीर्वाद लें', phalaEn: 'Spiritual focus, elder guidance' },
    10: { quality: 'Shubha', phalaHi: 'कार्यक्षेत्र में सम्मान, पदोन्नति, सफलता', phalaEn: 'Career acclaim, authority, achievement' },
    11: { quality: 'Shubha', phalaHi: 'उत्तम धन लाभ, मित्र सहयोग, कार्य सिद्धि', phalaEn: 'Substantial gains, networking success' },
    12: { quality: 'Ashubha', phalaHi: 'व्यय आधिक्य, शांत ध्यान व संयम रखें', phalaEn: 'Increased expenditures, rest needed' }
  },
  Moon: {
    1: { quality: 'Shubha', phalaHi: 'मन की प्रसन्नता, नए वस्त्र व आभूषण प्राप्ति, सुख', phalaEn: 'Mental happiness, new attire, comfort' },
    2: { quality: 'Ashubha', phalaHi: 'मानसिक चिंता, नेत्र कष्ट या पारिवारिक मतभेद', phalaEn: 'Mental anxiety, eye strain, family discord' },
    3: { quality: 'Shubha', phalaHi: 'पराक्रम वृद्धि, बंधु सुख, यात्रा लाभ', phalaEn: 'Courage rise, sibling joy, beneficial travel' },
    4: { quality: 'Ashubha', phalaHi: 'माता के स्वास्थ्य की चिंता, गृह में अशांति', phalaEn: 'Maternal health care, domestic unrest' },
    5: { quality: 'Ashubha', phalaHi: 'मतिभ्रम, पेट की तकलीफ, संतान चिंता', phalaEn: 'Confusion, stomach ailment, progeny worry' },
    6: { quality: 'Shubha', phalaHi: 'रोग मुक्ति, शत्रु पर विजय, कार्य सफलता', phalaEn: 'Disease relief, victory over rivals, success' },
    7: { quality: 'Shubha', phalaHi: 'उत्तम भोजन, दांपत्य सुख, प्रियजनों से मिलन', phalaEn: 'Good food, marital joy, meeting loved ones' },
    8: { quality: 'Ashubha', phalaHi: 'दुर्घटना भय, मानसिक तनाव, व्यय', phalaEn: 'Accident caution, mental stress, expense' },
    9: { quality: 'Ashubha', phalaHi: 'कार्य में बाधा, भाग्य में न्यूनता, थकान', phalaEn: 'Work hurdles, reduced fortune, fatigue' },
    10: { quality: 'Shubha', phalaHi: 'सम्मान प्राप्ति, व्यापार लाभ, सफलता', phalaEn: 'Honor gain, business success, triumph' },
    11: { quality: 'Shubha', phalaHi: 'प्रचुर धन लाभ, मित्रों का सहयोग, ऐश्वर्य', phalaEn: 'Abundant gains, friend support, luxury' },
    12: { quality: 'Ashubha', phalaHi: 'नेत्र पीड़ा, धन व्यय, अनिद्रा', phalaEn: 'Eye discomfort, financial loss, insomnia' }
  },
  Mars: {
    1: { quality: 'Ashubha', phalaHi: 'शारीरिक कष्ट, क्रोध वृद्धि, रक्त विकार', phalaEn: 'Physical distress, anger rise, blood disorders' },
    2: { quality: 'Ashubha', phalaHi: 'धन हानि, कटु वाणी, नेत्र रोग', phalaEn: 'Financial loss, harsh speech, eye ailments' },
    3: { quality: 'Shubha', phalaHi: 'पराक्रम, सहोदर सुख, शत्रुओं पर विजय', phalaEn: 'Courage, sibling happiness, triumph over rivals' },
    4: { quality: 'Ashubha', phalaHi: 'भूमि-वाहन से कष्ट, गृहकलह', phalaEn: 'Property distress, domestic strife' },
    5: { quality: 'Ashubha', phalaHi: 'संतान को कष्ट, उदर विकार, उद्वेग', phalaEn: 'Children trouble, stomach issues, agitation' },
    6: { quality: 'Shubha', phalaHi: 'शत्रु नाश, ऋण मुक्ति, रोग शमन', phalaEn: 'Enemy destruction, debt relief, disease pacification' },
    7: { quality: 'Ashubha', phalaHi: 'जीवनसाथी से मतभेद, उष्णता जनित रोग', phalaEn: 'Spousal discord, heat-related illness' },
    8: { quality: 'Ashubha', phalaHi: 'रक्तचाप, दुर्घटना या अपमान का भय', phalaEn: 'Blood pressure, accident or insult fear' },
    9: { quality: 'Ashubha', phalaHi: 'भाग्य बाधा, पिता से मतभेद, थकान', phalaEn: 'Fortune obstruction, father discord, fatigue' },
    10: { quality: 'Madhyam', phalaHi: 'कर्मक्षेत्र में संघर्ष, पराक्रम से सफलता', phalaEn: 'Career struggle, success through valor' },
    11: { quality: 'Shubha', phalaHi: 'धन लाभ, भूमि लाभ, इच्छा पूर्ति', phalaEn: 'Financial gain, land acquisition, fulfillment' },
    12: { quality: 'Ashubha', phalaHi: 'नेत्र रोग, व्यय, गुप्त शत्रु', phalaEn: 'Eye disease, expenditure, hidden enemies' }
  },
  Mercury: {
    1: { quality: 'Ashubha', phalaHi: 'मतिभ्रम, वाद-विवाद, मानसिक अशांति', phalaEn: 'Mental confusion, debates, restlessness' },
    2: { quality: 'Shubha', phalaHi: 'धन लाभ, मधुर वाणी, कुटुंब सुख', phalaEn: 'Wealth gain, sweet speech, family happiness' },
    3: { quality: 'Ashubha', phalaHi: 'भय, मित्रों से विरोध, कार्यों में विलंब', phalaEn: 'Fear, opposition from friends, work delays' },
    4: { quality: 'Shubha', phalaHi: 'सुख, ज्ञान वृद्धि, मित्रों से मिलन', phalaEn: 'Happiness, wisdom rise, meeting friends' },
    5: { quality: 'Shubha', phalaHi: 'बुद्धि विकास, संतान सुख, विद्या लाभ', phalaEn: 'Intellectual growth, progeny joy, education gain' },
    6: { quality: 'Shubha', phalaHi: 'शत्रु पराजय, विवादों में विजय, आरोग्य', phalaEn: 'Rival defeat, victory in disputes, health' },
    7: { quality: 'Ashubha', phalaHi: 'व्यापार में हानि, पत्नी से मतभेद', phalaEn: 'Business loss, spousal differences' },
    8: { quality: 'Shubha', phalaHi: 'धन लाभ, यश, शत्रुओं का शमन', phalaEn: 'Wealth gain, fame, pacification of enemies' },
    9: { quality: 'Ashubha', phalaHi: 'धर्म-कर्म में बाधा, भागदौड़', phalaEn: 'Religious hurdles, running around' },
    10: { quality: 'Shubha', phalaHi: 'सम्मान, कार्यसिद्धि, बौद्धिक सफलता', phalaEn: 'Honor, success, intellectual triumph' },
    11: { quality: 'Shubha', phalaHi: 'सर्वत्र लाभ, विद्या व धन की प्राप्ति', phalaEn: 'All-round gains, knowledge and wealth' },
    12: { quality: 'Ashubha', phalaHi: 'अपयश, व्यय, मानसिक चिंता', phalaEn: 'Bad repute, expenditure, mental worry' }
  },
  Jupiter: {
    1: { quality: 'Madhyam', phalaHi: 'स्थान परिवर्तन, आत्म-मंथन, गरिमा रक्षा', phalaEn: 'Relocation trends, dignified introspection' },
    2: { quality: 'Shubha', phalaHi: 'कुटुंब सुख, धन आगमन, मधुर वाणी', phalaEn: 'Wealth inflow, domestic happiness' },
    3: { quality: 'Ashubha', phalaHi: 'कार्य में गतिरोध, भाई-बहनों से समझदारी रखें', phalaEn: 'Patience with siblings, steady efforts' },
    4: { quality: 'Ashubha', phalaHi: 'मातृक चिंता, गृह मामलों में धैर्य रखें', phalaEn: 'Domestic adjustments, patient decisions' },
    5: { quality: 'Shubha', phalaHi: 'संतान सुख, बुद्धि विकास, मंत्र सिद्धि, यश', phalaEn: 'Progeny joy, creative brilliance, honour' },
    6: { quality: 'Ashubha', phalaHi: 'विरोधी सक्रिय, स्वास्थ्य व ऋण में सतर्कता', phalaEn: 'Caution with adversaries, health care' },
    7: { quality: 'Shubha', phalaHi: 'वैवाहिक सुख, यात्रा फलदायी, व्यापार विस्तार', phalaEn: 'Marital bliss, fruitful travel, business' },
    8: { quality: 'Ashubha', phalaHi: 'कठिन परीक्षा, साधना व अनुशासन से लाभ', phalaEn: 'Rigorous tests, spiritual growth' },
    9: { quality: 'Shubha', phalaHi: 'भाग्य वृद्धि, धार्मिक यात्राएं, सर्वतोमुख उन्नति', phalaEn: 'Fortune surge, higher learning, auspicious' },
    10: { quality: 'Madhyam', phalaHi: 'कार्यक्षेत्र में परिवर्तन, सतत कर्मशीलता', phalaEn: 'Career re-alignment, persistent action' },
    11: { quality: 'Shubha', phalaHi: 'सर्वकार्य सिद्धि, प्रचुर धन लाभ, सम्मान', phalaEn: 'All-round fulfillment, peak prosperity' },
    12: { quality: 'Madhyam', phalaHi: 'धार्मिक व्यय, दान, आध्यात्मिक प्रगति', phalaEn: 'Spiritual expenses, charity, inner peace' }
  },
  Venus: {
    1: { quality: 'Shubha', phalaHi: 'सुख, ऐश्वर्य, उत्तम वस्त्र व आभूषण प्राप्ति', phalaEn: 'Comforts, luxury, fine attire and ornaments' },
    2: { quality: 'Shubha', phalaHi: 'धन लाभ, कुटुंब सुख, स्वादिष्ट भोजन', phalaEn: 'Wealth gain, family happiness, good food' },
    3: { quality: 'Shubha', phalaHi: 'मित्रों का सहयोग, पराक्रम, वस्त्र लाभ', phalaEn: 'Friend support, courage, clothing gain' },
    4: { quality: 'Shubha', phalaHi: 'वाहन सुख, गृह निर्माण, मातृक सुख', phalaEn: 'Vehicle comfort, house building, maternal joy' },
    5: { quality: 'Shubha', phalaHi: 'संतान सुख, बुद्धि विकास, मनोरंजन', phalaEn: 'Progeny joy, intellect growth, entertainment' },
    6: { quality: 'Ashubha', phalaHi: 'शत्रु पीड़ा, गुप्त रोग, व्यय', phalaEn: 'Enemy trouble, secret illness, expenditure' },
    7: { quality: 'Ashubha', phalaHi: 'दाम्पत्य में मतभेद, यात्रा में कष्ट', phalaEn: 'Spousal differences, travel discomfort' },
    8: { quality: 'Shubha', phalaHi: 'धन लाभ, आभूषण प्राप्ति, सुख', phalaEn: 'Wealth gain, ornament acquisition, comfort' },
    9: { quality: 'Shubha', phalaHi: 'भाग्य उदय, धर्म में रुचि, सम्मान', phalaEn: 'Fortune rise, spiritual interest, honor' },
    10: { quality: 'Shubha', phalaHi: 'व्यापार में लाभ, स्त्री वर्ग से सहयोग', phalaEn: 'Business profit, support from women' },
    11: { quality: 'Shubha', phalaHi: 'सर्वविध लाभ, इच्छा पूर्ति, मित्रों से मिलन', phalaEn: 'All-round gains, fulfillment, friend meetings' },
    12: { quality: 'Shubha', phalaHi: 'शय्या सुख, भोग-विलास, व्यय', phalaEn: 'Bed comforts, sensual pleasures, expenses' }
  },
  Saturn: {
    1: { quality: 'Ashubha', phalaHi: 'साढ़ेसाती मध्य: मानसिक भार, धैर्य व अनुशासन रखें', phalaEn: 'Sade Sati core: heavy discipline, patience' },
    2: { quality: 'Ashubha', phalaHi: 'साढ़ेसाती उतरती: वाणी संयम, संचित धन रक्षा', phalaEn: 'Sade Sati closing: asset conservation' },
    3: { quality: 'Shubha', phalaHi: 'पराक्रम वृद्धि, शत्रु दमन, उत्तम सफलता', phalaEn: 'Heroic courage, overcoming obstacles' },
    4: { quality: 'Ashubha', phalaHi: 'कंटक शनि: गृह सुख में सामंजस्य, शांत रहें', phalaEn: 'Kantaka Shani: domestic grounding needed' },
    5: { quality: 'Ashubha', phalaHi: 'चित्त में एकाग्रता रखें, जोखिम से बचें', phalaEn: 'Avoid speculative risk, steady focus' },
    6: { quality: 'Shubha', phalaHi: 'शत्रु पराजय, रोग नाश, कानूनी मामलों में विजय', phalaEn: 'Victory over rivals, legal resolution' },
    7: { quality: 'Ashubha', phalaHi: 'साझेदारी में स्पष्टता, जीवनसाथी का आदर करें', phalaEn: 'Partnership diplomacy, mutual respect' },
    8: { quality: 'Ashubha', phalaHi: 'अष्टम ढैय्या: स्वास्थ्य सजगता, सावधानी से वाहन चलाएं', phalaEn: 'Ashtama Shani: profound transformation' },
    9: { quality: 'Madhyam', phalaHi: 'आध्यात्मिक झुकाव, कड़ी मेहनत से भाग्य निर्माण', phalaEn: 'Hard-earned fortune, spiritual duty' },
    10: { quality: 'Madhyam', phalaHi: 'कड़ा श्रम, कर्मक्षेत्र में प्रतिष्ठा की नींव', phalaEn: 'Intense diligence, authoritative groundwork' },
    11: { quality: 'Shubha', phalaHi: 'स्थायी संपत्ति, दीर्घकालिक लाभ, इच्छा पूर्ति', phalaEn: 'Enduring prosperity, long-term gains' },
    12: { quality: 'Ashubha', phalaHi: 'साढ़ेसाती आरंभ: व्यय नियंत्रण, एकांत साधना', phalaEn: 'Sade Sati entry: expenditure restraint' }
  },
  Rahu: {
    1: { quality: 'Ashubha', phalaHi: 'मानसिक भ्रम, शारीरिक कष्ट, तनाव', phalaEn: 'Mental confusion, physical distress, tension' },
    2: { quality: 'Ashubha', phalaHi: 'कटु वाणी, धन हानि, नेत्र कष्ट', phalaEn: 'Harsh speech, financial loss, eye trouble' },
    3: { quality: 'Shubha', phalaHi: 'पराक्रम, शत्रुओं पर विजय, लाभ', phalaEn: 'Courage, victory over enemies, gains' },
    4: { quality: 'Ashubha', phalaHi: 'गृह अशांति, मानसिक बेचैनी', phalaEn: 'Domestic unrest, mental restlessness' },
    5: { quality: 'Ashubha', phalaHi: 'संतान चिंता, मतिभ्रम, पेट की समस्या', phalaEn: 'Children worry, illusion, stomach issue' },
    6: { quality: 'Shubha', phalaHi: 'शत्रु पराजय, गुप्त शत्रुओं का शमन', phalaEn: 'Rival defeat, pacification of secret foes' },
    7: { quality: 'Ashubha', phalaHi: 'दाम्पत्य में तनाव, व्यापार में जोखिम से बचें', phalaEn: 'Spousal tension, avoid business risk' },
    8: { quality: 'Ashubha', phalaHi: 'आकस्मिक संकट, स्वास्थ्य सजगता', phalaEn: 'Sudden crisis, health vigilance' },
    9: { quality: 'Ashubha', phalaHi: 'भाग्य में रुकावट, भ्रम की स्थिति', phalaEn: 'Fortune obstruction, confused state' },
    10: { quality: 'Madhyam', phalaHi: 'कर्मक्षेत्र में अनपेक्षित मोड़, सतर्कता आवश्यक', phalaEn: 'Unexpected career turns, caution needed' },
    11: { quality: 'Shubha', phalaHi: 'आकस्मिक धन लाभ, इच्छा पूर्ति', phalaEn: 'Sudden financial gains, wish fulfillment' },
    12: { quality: 'Ashubha', phalaHi: 'अनिद्रा, व्यय, गुप्त चिंताएं', phalaEn: 'Insomnia, expenditure, hidden worries' }
  },
  Ketu: {
    1: { quality: 'Ashubha', phalaHi: 'शारीरिक कमजोरी, मानसिक उद्वेग', phalaEn: 'Physical weakness, mental agitation' },
    2: { quality: 'Ashubha', phalaHi: 'वाणी दोष, धन हानि', phalaEn: 'Speech flaw, financial loss' },
    3: { quality: 'Shubha', phalaHi: 'साहस, शत्रुओं का शमन', phalaEn: 'Courage, pacification of rivals' },
    4: { quality: 'Ashubha', phalaHi: 'पारिवारिक अशांति, वाहन सावधानी', phalaEn: 'Family unrest, vehicle caution' },
    5: { quality: 'Ashubha', phalaHi: 'विद्या में बाधा, संतान चिंता', phalaEn: 'Study hurdles, progeny worry' },
    6: { quality: 'Shubha', phalaHi: 'रोग मुक्ति, शत्रु विजय', phalaEn: 'Disease relief, victory over rivals' },
    7: { quality: 'Ashubha', phalaHi: 'वैवाहिक जीवन में संयम रखें', phalaEn: 'Exercise patience in married life' },
    8: { quality: 'Ashubha', phalaHi: 'आकस्मिक चोट या बाधा से सावधान', phalaEn: 'Caution against sudden injury or hurdle' },
    9: { quality: 'Madhyam', phalaHi: 'आध्यात्मिक झुकाव, यात्रा में सावधानी', phalaEn: 'Spiritual inclination, travel caution' },
    10: { quality: 'Madhyam', phalaHi: 'कर्मक्षेत्र में वैराग्य या परिवर्तन', phalaEn: 'Detachment or shift in career' },
    11: { quality: 'Shubha', phalaHi: 'आकस्मिक लाभ, आध्यात्मिक सिद्धि', phalaEn: 'Sudden gains, spiritual realization' },
    12: { quality: 'Shubha', phalaHi: 'मोक्ष मार्ग, दान-पुण्य, ध्यान', phalaEn: 'Liberation path, charity, meditation' }
  }
};

export default function LiveTransitChart({ masterData, className = '', initialViewMode }: LiveTransitChartProps) {
  const { language } = useTranslation();
  const currentLang = language;
  const isHindi = currentLang === 'hi' || currentLang === 'sa';

  const [transitResult, setTransitResult] = useState<TransitAnalysisResult | null>(() => {
    try {
      const transitEngine = new TransitEngine();
      return transitEngine.calculateDeterministicAstronomicalTransit({}, masterData);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TransitViewMode>(initialViewMode || 'birth_moon');
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch real-time live transit coordinates
  const fetchLiveTransit = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setError(null);

    try {
      const transitEngine = new TransitEngine();
      const targetDate = new Date().toISOString().split('T')[0];
      const targetTime = new Date().toTimeString().slice(0, 8);
      const targetLat = masterData?.birthProfile?.latitude ?? 22.7196;
      const targetLon = masterData?.birthProfile?.longitude ?? 75.8577;
      const targetTz = masterData?.birthProfile?.timezone || 'Asia/Kolkata';

      const res = await transitEngine.calculateTransit({
        date: targetDate,
        time: targetTime,
        latitude: targetLat,
        longitude: targetLon,
        timezone: targetTz
      }, masterData);

      if (res && res.status === 'AVAILABLE' && res.transits && res.transits.length > 0) {
        setTransitResult(res);
      }
    } catch (err: any) {
      console.warn('Background live transit update note:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [masterData]);

  useEffect(() => {
    fetchLiveTransit();
  }, [fetchLiveTransit]);

  // Determine Native Reference Signs
  const birthLagnaRashi = masterData?.lagna?.rashi || 1;
  const birthMoonRashi = masterData?.planets?.Moon?.rashi || 1;
  const liveTransitLagnaRashi = transitResult?.ascendant?.rashi || 1;

  // Determine active reference Ascendant sign based on view mode
  const activeAscendantSign = useMemo(() => {
    if (viewMode === 'birth_moon') return birthMoonRashi;
    if (viewMode === 'birth_lagna') return birthLagnaRashi;
    return liveTransitLagnaRashi;
  }, [viewMode, birthMoonRashi, birthLagnaRashi, liveTransitLagnaRashi]);

  // Build the 12-house North Indian chart data
  const chartData = useMemo(() => {
    if (!transitResult?.transits) return null;

    const ascendantSign = activeAscendantSign;
    const houseRashis: Record<number, number> = {};
    const housePlanets: Record<number, RealTransitPlanetDetail[]> = {};

    for (let h = 1; h <= 12; h++) {
      houseRashis[h] = ((ascendantSign - 1 + (h - 1)) % 12) + 1;
      housePlanets[h] = [];
    }

    for (const p of transitResult.transits) {
      const pRashiIdx = RASHI_NAMES_LIST.indexOf(p.sign);
      const pRashi = pRashiIdx >= 0 ? pRashiIdx + 1 : 1;
      const houseNum = ((pRashi - ascendantSign + 12) % 12) + 1;
      if (housePlanets[houseNum]) {
        housePlanets[houseNum].push(p);
      }
    }

    return {
      ascendantSign,
      houseRashis,
      housePlanets
    };
  }, [transitResult, activeAscendantSign]);

  // Helper for planet abbreviation
  const getAbbr = (planet: string): string => {
    return getPlanetAbbreviation(planet, currentLang);
  };

  // Selected planet details
  const activePlanetDetail = useMemo(() => {
    if (!selectedPlanet || !transitResult?.transits) return null;
    return transitResult.transits.find(p => p.planet === selectedPlanet) || null;
  }, [selectedPlanet, transitResult]);

  // Speech handler
  const handleSpeakPlanet = (planetName: string) => {
    const detail = transitResult?.transits?.find(p => p.planet === planetName);
    if (!detail) return;

    const pRashiIdx = RASHI_NAMES_LIST.indexOf(detail.sign);
    const rashiLocalized = getLocalizedRashi(RASHI_NAMES_LIST[pRashiIdx] || detail.sign, currentLang);
    const houseFromMoon = ((pRashiIdx + 1 - birthMoonRashi + 12) % 12) + 1;
    const effectEntry = GOCHAR_EFFECTS_FROM_MOON[planetName]?.[houseFromMoon];
    const effect = isHindi ? (effectEntry?.phalaHi || 'गोचर परिभ्रमण जारी है।') : (effectEntry?.phalaEn || 'Transit transit is active.');
    const planetLocalized = getLocalizedPlanet(planetName, currentLang);

    const text = isHindi ? `
      ${planetLocalized} देव का वर्तमान प्रत्यक्ष गोचर।
      राशि: ${rashiLocalized}, अंश: ${detail.degree} डिग्री।
      गति: ${detail.isRetrograde ? 'वक्री (Retrograde)' : 'मार्गी'}।
      जन्म चंद्र राशि से भाव: ${houseFromMoon}।
      शास्त्रीय गोचर फल: ${effect}।
    ` : `
      Live transit of ${planetLocalized}.
      Sign: ${rashiLocalized}, Degree: ${detail.degree.toFixed(1)}.
      Motion: ${detail.isRetrograde ? 'Retrograde' : 'Direct'}.
      House from Moon: ${houseFromMoon}.
      Effect: ${effect}.
    `;

    SpeechEngine.speak(text, currentLang);
  };

  return (
    <div className={`w-full bg-gradient-to-br from-[#061e14] via-[#030d08] to-[#020a06] border border-[#d4af37]/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,232,158,0.2)] relative overflow-hidden min-w-0 max-w-full text-white ${className}`}>
      {/* Royal Temple Carved Corner Flourishes */}
      <OrnateCorner position="top-left" size={28} />
      <OrnateCorner position="top-right" size={28} />
      <OrnateCorner position="bottom-left" size={28} />
      <OrnateCorner position="bottom-right" size={28} />

      {/* Subtle Inner Stepped Temple Trim Line */}
      <div className="absolute inset-1.5 sm:inset-2 rounded-xl sm:rounded-2xl border border-[#d4af37]/15 pointer-events-none" aria-hidden="true" />

      {/* Decorative Aura */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d4af37]/25 pb-3.5 relative z-10 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#d4af37] shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-[#d4af37] tracking-wide truncate">
              {isHindi ? 'प्रत्यक्ष खगोलीय गोचर चक्र (Live Planetary Transit)' : 'Live Planetary Transit Chart'}
            </h3>
          </div>
          <p className="text-[11px] text-gray-300 mt-0.5">
            {isHindi 
              ? 'स्विस एफिमेरिस (Swiss Ephemeris) द्वारा वास्तविक समय के ग्रह अंशों पर आधारित प्रामाणिक १२ भाव चक्र'
              : 'Real-time astronomical ephemeris 12-house North Indian Kundli'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => fetchLiveTransit(true)}
            disabled={isRefreshing || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/40 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            title="Refresh Live Planetary Coordinates"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isHindi ? 'तरोताजा करें' : 'Refresh Live'}</span>
          </button>
        </div>
      </div>

      {/* View Mode Frame-of-Reference Switcher */}
      <div className="my-3 flex flex-wrap items-center justify-between gap-2 relative z-10 min-w-0">
        <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10 text-xs overflow-x-auto max-w-full custom-scrollbar min-w-0">
          <button
            onClick={() => {
              SpeechEngine.stop();
              setViewMode('birth_moon');
              setSelectedHouse(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'birth_moon'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black font-bold shadow-sm'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {isHindi ? 'चंद्र राशि से गोचर (मानक)' : 'From Natal Moon (Standard)'}
          </button>
          <button
            onClick={() => {
              SpeechEngine.stop();
              setViewMode('birth_lagna');
              setSelectedHouse(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'birth_lagna'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black font-bold shadow-sm'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {isHindi ? 'जन्म लग्न से गोचर' : 'From Natal Lagna'}
          </button>
          <button
            onClick={() => {
              SpeechEngine.stop();
              setViewMode('live_lagna');
              setSelectedHouse(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'live_lagna'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black font-bold shadow-sm'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {isHindi ? 'तात्कालिक गोचर लग्न' : 'Live Transit Ascendant'}
          </button>
        </div>

        <div className="text-[11px] text-gray-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {isHindi ? 'चक्र केंद्र:' : 'Chart Center:'}{' '}
            <strong className="text-[#d4af37]">
              {getLocalizedRashi(RASHI_NAMES_LIST[activeAscendantSign - 1], currentLang)} ({activeAscendantSign})
            </strong>
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      {loading ? (
        <div className="py-16 text-center text-[#d4af37] flex flex-col items-center justify-center gap-3">
          <RotateCw className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">
            {isHindi ? 'स्विस एफिमेरिस से प्रत्यक्ष गोचर की गणना की जा रही है...' : 'Calculating live transit coordinates via Swiss Ephemeris...'}
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-xl text-center text-red-200 text-xs">
          {error}
        </div>
      ) : chartData ? (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* North Indian 12-House SVG Transit Chart */}
          <div className="w-full lg:w-[340px] shrink-0 mx-auto select-none">
            <div className="w-full aspect-square max-w-[min(320px,calc(100vw-48px))] mx-auto relative bg-[#030d08] border border-[#d4af37]/60 rounded-2xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.25)]">
              <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#d4af37] stroke-[0.5] pointer-events-auto">
                <defs>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                    <radialGradient 
                      key={`transit-ambient-grad-${h}`}
                      id={`transitBhavaAmbientGrad-${h}`} 
                      cx={`${HOUSE_CENTROIDS[h].x}%`} 
                      cy={`${HOUSE_CENTROIDS[h].y}%`} 
                      r="36%"
                    >
                      <stop offset="0%" stopColor="#0f4430" stopOpacity="0.85" />
                      <stop offset="60%" stopColor="#072b1d" stopOpacity="0.92" />
                      <stop offset="100%" stopColor="#03160e" stopOpacity="0.98" />
                    </radialGradient>
                  ))}

                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                    <radialGradient 
                      key={`transit-selected-grad-${h}`}
                      id={`transitBhavaSelectedGrad-${h}`} 
                      cx={`${HOUSE_CENTROIDS[h].x}%`} 
                      cy={`${HOUSE_CENTROIDS[h].y}%`} 
                      r="40%"
                    >
                      <stop offset="0%" stopColor="#ffe89e" stopOpacity="0.75" />
                      <stop offset="42%" stopColor="#d4af37" stopOpacity="0.55" />
                      <stop offset="85%" stopColor="#0c432d" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#041a10" stopOpacity="0.98" />
                    </radialGradient>
                  ))}
                </defs>

                {/* Base Dark Background */}
                <rect x="0" y="0" width="100" height="100" className="fill-[#030d08] stroke-none" />

                {/* 12 Clickable Bhavas */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
                  const isSelected = selectedHouse === house;
                  return (
                    <g key={house}>
                      <polygon 
                        points={HOUSE_POLYGONS[house]} 
                        fill={isSelected ? `url(#transitBhavaSelectedGrad-${house})` : `url(#transitBhavaAmbientGrad-${house})`}
                        className={`cursor-pointer transition-all duration-300 ease-out ${
                          isSelected 
                            ? 'stroke-[#ffe89e] stroke-[1.8] opacity-100' 
                            : 'stroke-[#d4af37]/60 hover:stroke-[#fae19c] stroke-[0.8] opacity-90 hover:opacity-100'
                        }`}
                        onClick={() => setSelectedHouse(isSelected ? null : house)}
                      />
                    </g>
                  );
                })}

                {/* Traditional North Indian Geometry Lines with Rich Golden Stroke */}
                <rect x="0" y="0" width="100" height="100" className="fill-none pointer-events-none stroke-[#d4af37]/60 stroke-[0.8]" />
                <line x1="0" y1="0" x2="100" y2="100" className="pointer-events-none stroke-[#d4af37]/80 stroke-[0.7]" />
                <line x1="100" y1="0" x2="0" y2="100" className="pointer-events-none stroke-[#d4af37]/80 stroke-[0.7]" />
                <polygon points="50,0 100,50 50,100 0,50" className="fill-none pointer-events-none stroke-[#d4af37]/80 stroke-[0.7]" />

                {/* Sacred Central Vedic Yantra Motif */}
                <YantraMotif cx={50} cy={50} radius={16} opacity={0.25} />
              </svg>

              {/* House Rashi Numbers & Transit Planets Overlay */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
                const rashiNum = chartData.houseRashis[house];
                const planets = chartData.housePlanets[house] || [];
                const isHouseSelected = selectedHouse === house;
                const rashiLocalized = getLocalizedRashi(RASHI_NAMES_LIST[rashiNum - 1], currentLang);

                return (
                  <div 
                    key={house} 
                    className={`absolute ${HOUSE_POSITIONS[house]} flex flex-col items-center pointer-events-none p-0.5 text-center z-10 leading-tight transition-all duration-300`}
                  >
                    {/* Rashi Number in House */}
                    <span 
                      className={`text-[10px] font-bold select-none cursor-pointer pointer-events-auto px-1.5 py-0.2 rounded-full mb-0.5 transition-all ${
                        isHouseSelected
                          ? 'bg-[#d4af37] text-black font-extrabold ring-1 ring-white shadow-md'
                          : 'text-[#fae19c] bg-black/40 hover:bg-[#d4af37]/20 border border-white/5'
                      }`}
                      onClick={() => setSelectedHouse(isHouseSelected ? null : house)}
                      title={`Bhava ${house} • ${rashiLocalized}`}
                    >
                      {rashiNum}
                    </span>

                    {/* Planets in this House */}
                    <div className="flex flex-wrap items-center justify-center gap-1 max-w-[80px] pointer-events-auto">
                      {planets.map(p => {
                        const isPlanetSelected = selectedPlanet === p.planet;
                        const abbr = getAbbr(p.planet);
                        const suffix = p.isRetrograde ? '*' : '';
                        const planetLoc = getLocalizedPlanet(p.planet, currentLang);

                        return (
                          <button
                            key={p.planet}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlanet(isPlanetSelected ? null : p.planet);
                              handleSpeakPlanet(p.planet);
                            }}
                            className={`min-h-[26px] px-1.5 py-0.5 rounded-md text-[9px] font-bold border transition-all flex items-center gap-0.5 cursor-pointer shadow-sm ${
                              isPlanetSelected
                                ? 'bg-[#d4af37] text-black border-white ring-2 ring-[#fae19c] scale-110 font-extrabold'
                                : 'bg-[#041a11]/90 text-amber-200 border-[#d4af37]/50 hover:bg-[#d4af37]/20 hover:scale-105 active:scale-95'
                            }`}
                            title={`${planetLoc} (${p.degree.toFixed(1)}° ${p.isRetrograde ? 'Retro' : ''})`}
                          >
                            <span>{abbr}{suffix}</span>
                            <span className="text-[7.5px] opacity-75">{Math.floor(p.degree)}°</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-2 text-[10px] text-gray-400">
              {isHindi ? '💡 किसी भी ग्रह पर टैप करें — गोचर फल व वाणी सुनें' : '💡 Tap any planet to view Gochar effect & listen'}
            </div>
          </div>

          {/* Right Column: Planetary Positions Table & Interactive Inspector */}
          <div className="flex-1 w-full space-y-3.5">
            {/* Inspector Panel for Selected Planet */}
            {activePlanetDetail && (
              <div className="bg-gradient-to-r from-[#0d2a1f] to-[#04120c] border border-[#d4af37] rounded-2xl p-4 shadow-xl relative animate-fadeIn">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center text-[#d4af37] font-bold text-base shadow-sm">
                      {getAbbr(activePlanetDetail.planet)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-white">
                          {getLocalizedPlanet(activePlanetDetail.planet, currentLang)} ({activePlanetDetail.planet})
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          activePlanetDetail.isRetrograde
                            ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        }`}>
                          {activePlanetDetail.isRetrograde ? (isHindi ? 'वक्री (Retrograde)' : 'Retrograde') : (isHindi ? 'मार्गी (Direct)' : 'Direct')}
                        </span>
                      </div>
                      <p className="text-xs text-amber-300 mt-0.5">
                        {getLocalizedRashi(activePlanetDetail.sign, currentLang)} ({activePlanetDetail.sign}) {activePlanetDetail.degree}° • Nakshatra: {activePlanetDetail.nakshatraName} (Pada {activePlanetDetail.pada})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpeakPlanet(activePlanetDetail.planet)}
                    className="p-2 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37]/30 border border-[#d4af37]/50 text-[#d4af37] transition-all cursor-pointer"
                    title="Speak transit effect"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* House Placements & Classical Effect */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-gray-400 block">{isHindi ? 'जन्म लग्न से गोचर भाव' : 'Transit House from Lagna'}</span>
                    <span className="text-emerald-300 font-bold">
                      {isHindi ? 'भाव' : 'House'} {activePlanetDetail.transitHouseFromLagna} ({masterData?.lagna?.rashiName || 'Lagna'})
                    </span>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-gray-400 block">{isHindi ? 'जन्म चंद्र से गोचर भाव' : 'Transit House from Moon'}</span>
                    <span className="text-amber-300 font-bold">
                      {isHindi ? 'भाव' : 'House'} {activePlanetDetail.transitHouseFromMoon || ((RASHI_NAMES_LIST.indexOf(activePlanetDetail.sign) + 1 - birthMoonRashi + 12) % 12 + 1)} ({masterData?.planets?.Moon?.rashiName || 'Moon'})
                    </span>
                  </div>
                </div>

                {/* Classical Gochar Phala */}
                <div className="mt-3 bg-black/40 p-3 rounded-xl border border-emerald-500/30 text-xs leading-relaxed">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                    {isHindi ? 'शास्त्रीय गोचर फल (Phaladeepika Tenet)' : 'Classical Gochar Phala (Phaladeepika)'}
                  </span>
                  <p className="text-gray-200">
                    {(() => {
                      const hFromMoon = activePlanetDetail.transitHouseFromMoon || ((RASHI_NAMES_LIST.indexOf(activePlanetDetail.sign) + 1 - birthMoonRashi + 12) % 12 + 1);
                      const entry = GOCHAR_EFFECTS_FROM_MOON[activePlanetDetail.planet]?.[hFromMoon];
                      return isHindi ? (entry?.phalaHi || 'इस भाव में गोचर शुभ फलदायी व संतुलित कर्म की प्रेरणा देता है।') : (entry?.phalaEn || 'Transit in this house brings balanced karmic results.');
                    })()}
                  </p>
                </div>
              </div>
            )}

            {/* All 9 Transit Planets Summary Table */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-3 sm:p-3.5 space-y-2 min-w-0 max-w-full overflow-hidden">
              <div className="flex flex-wrap justify-between items-center gap-1.5 px-1">
                <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                  {isHindi ? 'नवग्रह प्रत्यक्ष गोचर स्थिति (Ephemeris Table)' : 'Navagraha Real Transit Coordinates'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {transitResult?.transits?.length || 0} {isHindi ? 'ग्रह सक्रिय' : 'Planets Active'}
                </span>
              </div>

              <div className="overflow-x-auto max-h-56 custom-scrollbar pr-1 w-full min-w-0">
                <table className="w-full text-[11px] text-left border-collapse min-w-[340px]">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-[10px]">
                      <th className="py-1.5 px-2 font-medium">{isHindi ? 'ग्रह' : 'Planet'}</th>
                      <th className="py-1.5 px-2 font-medium">{isHindi ? 'गोचर राशि' : 'Transit Sign'}</th>
                      <th className="py-1.5 px-2 font-medium">{isHindi ? 'अंश' : 'Degree'}</th>
                      <th className="py-1.5 px-2 font-medium">{isHindi ? 'गति' : 'Motion'}</th>
                      <th className="py-1.5 px-2 font-medium text-center">{isHindi ? 'चंद्र से' : 'From Moon'}</th>
                      <th className="py-1.5 px-2 font-medium text-center">{isHindi ? 'लग्न से' : 'From Lagna'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transitResult?.transits?.map(p => {
                      const isSel = selectedPlanet === p.planet;
                      const pRashiIdx = RASHI_NAMES_LIST.indexOf(p.sign);
                      const houseFromMoon = ((pRashiIdx + 1 - birthMoonRashi + 12) % 12) + 1;
                      const quality = GOCHAR_EFFECTS_FROM_MOON[p.planet]?.[houseFromMoon]?.quality || 'Madhyam';

                      return (
                        <tr
                          key={p.planet}
                          onClick={() => {
                            setSelectedPlanet(p.planet);
                            handleSpeakPlanet(p.planet);
                          }}
                          className={`hover:bg-[#d4af37]/15 transition-colors cursor-pointer ${
                            isSel ? 'bg-[#d4af37]/20 font-semibold' : ''
                          }`}
                        >
                          <td className="py-1.5 px-2 text-[#d4af37] font-semibold whitespace-nowrap">
                            {getLocalizedPlanet(p.planet, currentLang)}
                          </td>
                          <td className="py-1.5 px-2 text-gray-200 whitespace-nowrap">
                            {getLocalizedRashi(p.sign, currentLang)}
                          </td>
                          <td className="py-1.5 px-2 font-mono text-amber-200 whitespace-nowrap">
                            {p.degree.toFixed(1)}°
                          </td>
                          <td className="py-1.5 px-2 whitespace-nowrap">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                              p.isRetrograde ? 'text-rose-400 bg-rose-950/60' : 'text-emerald-400 bg-emerald-950/60'
                            }`}>
                              {p.isRetrograde ? (isHindi ? 'वक्री' : 'Retro') : (isHindi ? 'मार्गी' : 'Direct')}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-center whitespace-nowrap">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              quality === 'Shubha' ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/30' :
                              quality === 'Ashubha' ? 'text-rose-300 bg-rose-950/80 border border-rose-500/30' :
                              'text-amber-300 bg-amber-950/80 border border-amber-500/30'
                            }`}>
                              {isHindi ? 'भाव' : 'H'} {houseFromMoon}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-center text-gray-300 whitespace-nowrap font-mono">
                            H{p.transitHouseFromLagna}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
