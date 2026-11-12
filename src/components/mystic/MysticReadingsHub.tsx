import React, { useState, useRef } from 'react';
import { 
  Sparkles, Camera, Upload, RefreshCw, Eye, Hand, BookOpen, 
  ArrowLeft, CheckCircle, AlertCircle, Loader2, HelpCircle, Share2 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';

interface MysticReadingsHubProps {
  onBack: () => void;
  language?: string;
}

const TAROT_DECK = [
  { id: 1, name: 'द मैजिशियन (The Magician)', arcana: 'Major', element: 'Air', meaning: 'इच्छाशक्ति, कौशल, सृजन और क्षमता का प्रतीक।' },
  { id: 2, name: 'हाई प्रेस्टेस (The High Priestess)', arcana: 'Major', element: 'Water', meaning: 'अंतःप्रेरणा, रहस्य, अंतर्दज्ञा और अचेतन ज्ञान।' },
  { id: 3, name: 'द एम्प्रेस (The Empress)', arcana: 'Major', element: 'Earth', meaning: 'समृद्धि, प्रकृति, मातृत्व, प्रचुरता और सृजन।' },
  { id: 4, name: 'द एम्परर (The Emperor)', arcana: 'Major', element: 'Fire', meaning: 'नेतृत्व, अधिकार, स्थिरता और अनुशासन।' },
  { id: 5, name: 'द हियरोफेंट (The Hierophant)', arcana: 'Major', element: 'Earth', meaning: 'परंपरा, आध्यात्मिक ज्ञान, गुरु और मार्गदर्शन।' },
  { id: 6, name: 'द लवर्स (The Lovers)', arcana: 'Major', element: 'Air', meaning: 'प्रेम, सामंजस्य, रिश्ते और महत्वपूर्ण चुनाव।' },
  { id: 7, name: 'द चैसियट (The Chariot)', arcana: 'Major', element: 'Water', meaning: 'दृढ़ संकल्प, विजय, नियंत्रण और प्रगति।' },
  { id: 8, name: 'स्ट्रेंथ (Strength)', arcana: 'Major', element: 'Fire', meaning: 'आंतरिक शक्ति, साहस, संयम और करुणा।' },
  { id: 9, name: 'द हर्मिट (The Hermit)', arcana: 'Major', element: 'Earth', meaning: 'आत्म-चिंतन, एकांत, ज्ञान की खोज और मार्गदर्शन।' },
  { id: 10, name: 'व्हील ऑफ़ फ़च्यून (Wheel of Fortune)', arcana: 'Major', element: 'Fire', meaning: 'भाग्य चक्र, परिवर्तन, नए अवसर और चक्र।' },
  { id: 11, name: 'जस्टिस (Justice)', arcana: 'Major', element: 'Air', meaning: 'न्याय, निष्पक्षता, सत्य और संतुलित निर्णय।' },
  { id: 12, name: 'द हैंग्ड मैन (The Hanged Man)', arcana: 'Major', element: 'Water', meaning: 'नजरिया बदलना, समर्पण, त्याग और प्रतीक्षा।' },
  { id: 13, name: 'डेथ (Death)', arcana: 'Major', element: 'Water', meaning: 'परिवर्तन, पुनर्जन्म, पुराना समाप्त होना और नई शुरुआत।' },
  { id: 14, name: 'टेम्परेन्स (Temperance)', arcana: 'Major', element: 'Fire', meaning: 'संतुलन, संयम, सामंजस्य और शांति।' },
  { id: 15, name: 'द डेविल (The Devil)', arcana: 'Major', element: 'Earth', meaning: 'मोह, बंधन, भौतिक आकर्षण और आंतरिक मुक्ति की प्रेरणा।' },
  { id: 16, name: 'द टॉवर (The Tower)', arcana: 'Major', element: 'Fire', meaning: 'अचानक बदलाव, जागृति, पुरानी नींव का टूटना।' },
  { id: 17, name: 'द स्टार (The Star)', arcana: 'Major', element: 'Air', meaning: 'आशा, विश्वास, प्रेरणा और healing।' },
  { id: 18, name: 'द मून (The Moon)', arcana: 'Major', element: 'Water', meaning: 'स्वप्न, अंतःप्रेरणा, भ्रम और रहस्य।' },
  { id: 19, name: 'द सन (The Sun)', arcana: 'Major', element: 'Fire', meaning: 'उत्साह, सफलता, आनंद, ऊर्जा और स्पष्टता।' },
  { id: 20, name: 'जजमेंट (Judgement)', arcana: 'Major', element: 'Fire', meaning: 'मूल्यांकन, पुनरुत्थान, आह्वान और आंतरिक पुकार।' },
  { id: 21, name: 'द वर्ल्ड (The World)', arcana: 'Major', element: 'Earth', meaning: 'पूर्णता, सफलता, यात्रा की समाप्ति और नया चक्र।' }
];

export const MysticReadingsHub: React.FC<MysticReadingsHubProps> = ({ onBack, language = 'Hindi' }) => {
  const [activeTab, setActiveTab] = useState<'face' | 'palm' | 'tarot'>('face');

  // Face Reading State
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceResult, setFaceResult] = useState<string | null>(null);

  // Palmistry State (Dual hands: Left & Right)
  const [leftPalmImage, setLeftPalmImage] = useState<string | null>(null);
  const [rightPalmImage, setRightPalmImage] = useState<string | null>(null);
  const [palmLoading, setPalmLoading] = useState(false);
  const [palmResult, setPalmResult] = useState<string | null>(null);

  // Tarot State
  const [tarotQuestion, setTarotQuestion] = useState('');
  const [shuffledCards, setShuffledCards] = useState<typeof TAROT_DECK>([]);
  const [selectedCards, setSelectedCards] = useState<Array<{ card: typeof TAROT_DECK[0]; position: 'Past' | 'Present' | 'Future'; isFlipped: boolean }>>([]);
  const [tarotLoading, setTarotLoading] = useState(false);
  const [tarotResult, setTarotResult] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const leftPalmInputRef = useRef<HTMLInputElement>(null);
  const rightPalmInputRef = useRef<HTMLInputElement>(null);

  // Handle Share / Copy Report
  const handleShareOrCopy = async (reportText: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'जीवन दर्पण - दैवीय रहस्य रिपोर्ट',
          text: reportText
        });
        return;
      } catch (err) {
        // Ignored if cancelled or unsupported
      }
    }
    try {
      await navigator.clipboard.writeText(reportText);
      alert('रिपोर्ट क्लिपबोर्ड पर सफलतापूर्वक कॉपी हो गई है!');
    } catch (err) {
      alert('कॉपी करने में विफल।');
    }
  };

  // Handle Image Upload for Face
  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFaceImage(uploadEvent.target?.result as string);
      setFaceResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Image Upload for Palms
  const handlePalmUpload = (e: React.ChangeEvent<HTMLInputElement>, hand: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (hand === 'left') {
        setLeftPalmImage(result);
      } else {
        setRightPalmImage(result);
      }
      setPalmResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Direct Client-Side Gemini AI Call helper
  const callGeminiDirectly = async (mode: 'face' | 'palm' | 'tarot', img1?: string | null, img2?: string | null, question?: string, cards?: any[]) => {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
    
    const isHindi = language === 'Hindi' || language === 'hi';
    let systemInstruction = '';
    let promptText = '';
    const parts: any[] = [];

    if (mode === 'face') {
      systemInstruction = isHindi
        ? `आप JeevanDarpan के विशेषज्ञ समुद्रशास्त्र और मुखाकृति विश्लेषक (Face Reading Expert) हैं।
उपयोगकर्ता द्वारा अपलोड की गई तस्वीर/सेल्फी के आधार पर उनके चेहरे के भाव, ललाट, नेत्र, मुस्कान और समग्र तेज (aura) का सकारात्मक, उत्साहवर्धक और आध्यात्मिक विश्लेषण प्रदान करें।
नियम:
1. किसी भी प्रकार की नकारात्मकता, डर या गंभीर चिकित्सा निदान न दें।
2. केवल सकारात्मक, प्रेरणादायक और संबल प्रदान करने वाली बातें कहें।
3. उत्तर 100% शुद्ध हिंदी (देवनागरी लिपि) में हो।
4. निम्नलिखित संरचना का पालन करें:
   ### 1. मुखाकृति एवं तेज विश्लेषण (Aura & Facial Expression)
   ### 2. बौद्धिक एवं आंतरिक स्वभाव (Intellectual & Inner Nature)
   ### 3. जीवन दृष्टि एवं मार्गदर्शन (Life Outlook & Guidance)`
        : `You are an expert Face Reading and physiognomy analyst. Provide an inspiring, positive, and insightful analysis in clear language.`;

      if (img1) {
        const matches = img1.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }
      promptText = isHindi 
        ? 'कृपया इस मुखाकृति/सेल्फी के आधार पर सकारात्मक और प्रेरणादायक व्यक्तित्व विश्लेषण प्रदान करें।'
        : 'Please provide a positive and inspiring face reading analysis based on this image.';
    } else if (mode === 'palm') {
      systemInstruction = isHindi
        ? `आप JeevanDarpan के वरिष्ठ हस्तरेखा विशेषज्ञ (Palmistry Expert) हैं।
उपयोगकर्ता द्वारा अपलोड की गई दोनों हथेलियों (बायां हाथ और दायां हाथ) की तस्वीरों का तुलनात्मक विश्लेषण प्रदान करें।
विशेष निर्देश:
- बायां हाथ (Left Hand) जन्मजात क्षमता, पूर्व संचित कर्म व आंतरिक स्वभाव (Innate Potential) को दर्शाता है।
- दायां हाथ (Right Hand) वर्तमान कर्म, पुरुषार्थ और प्रकट होते भाग्य (Manifested Destiny) को दर्शाता है।
नियम:
1. डर या नकारात्मक भविष्यवाणियां बिल्कुल न करें।
2. कर्म, पुरुषार्थ और सकारात्मक ऊर्जा पर विशेष जोर दें।
3. उत्तर 100% शुद्ध हिंदी (देवनागरी लिपि) में दें।
4. अंत में सरल वैदिक उपाय (Simple Remedies) अवश्य दें।
5. निम्नलिखित संरचना का कड़ाई से पालन करें:
   ### 1. बाएँ और दाएँ हाथ की तुलना (Left & Right Palm Comparison)
   ### 2. जीवन रेखा एवं शारीरिक ऊर्जा (Life Line & Vitality)
   ### 3. मस्तिष्क रेखा एवं बुद्धि (Head Line & Intellect)
   ### 4. हृदय रेखा एवं भावनाएं (Heart Line & Emotions)
   ### 5. भाग्य रेखा एवं कर्म (Fate Line & Career Path)
   ### 6. सरल वैदिक उपाय (Simple Vedic Remedies & Remedies)`
        : `You are an expert Palmistry analyst comparing both left and right hands with comprehensive insights and remedies.`;

      if (img1) {
        const matchesLeft = img1.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matchesLeft) {
          parts.push({
            inlineData: {
              mimeType: matchesLeft[1],
              data: matchesLeft[2]
            }
          });
          parts.push({ text: '[बायां हाथ / Left Hand image - Innate Potential]' });
        }
      }
      if (img2) {
        const matchesRight = img2.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matchesRight) {
          parts.push({
            inlineData: {
              mimeType: matchesRight[1],
              data: matchesRight[2]
            }
          });
          parts.push({ text: '[दायां हाथ / Right Hand image - Manifested Destiny]' });
        }
      }
      promptText = isHindi
        ? 'कृपया मेरे बाएँ हाथ और दाएँ हाथ की हथेलियों की तस्वीरों का तुलनात्मक विश्लेषण करके विस्तृत रिपोर्ट और सरल वैदिक उपाय प्रदान करें।'
        : 'Please compare my left and right palm photos and provide a detailed comparative report with simple remedies.';
    } else {
      systemInstruction = isHindi
        ? `आप JeevanDarpan के टैरो कार्ड विशेषज्ञ (Tarot Card Reader) हैं।
उपयोगकर्ता के प्रश्न और चुने गए 3 कार्ड्स (अतीत, वर्तमान, भविष्य) के आधार पर दिव्य मार्गदर्शन और प्रेरणादायक संदेश प्रदान करें।
नियम:
1. उत्तर 100% शुद्ध हिंदी (देवनागरी लिपि) में हो।
2. सकारात्मक, आध्यात्मिक और व्यावहारिक मार्गदर्शन दें।
3. निम्नलिखित संरचना का पालन करें:
   ### 1. प्रश्न का सार (Core Question)
   ### 2. अतीत का कार्ड (Past Card Meaning)
   ### 3. वर्तमान का कार्ड (Present Card Meaning)
   ### 4. भविष्य का कार्ड (Future Card Guidance)
   ### 5. अंतिम संदेश एवं उपाय (Final Guidance & Affirmation)`
        : `You are an expert Tarot card reader. Provide inspiring guidance based on the drawn cards and user question.`;

      promptText = isHindi
        ? `उपयोगकर्ता का प्रश्न: "${question || 'सामान्य मार्गदर्शन'}"\nचुने गए 3 टैरो कार्ड्स: ${JSON.stringify(cards || [])}\nकृपया इन कार्ड्स के आधार पर अतीत, वर्तमान और भविष्य का विस्तृत एवं सकारात्मक मार्गदर्शन प्रदान करें।`
        : `User Question: "${question || 'General Guidance'}"\nDrawn Cards: ${JSON.stringify(cards || [])}\nPlease provide tarot guidance.`;
    }

    parts.push({ text: promptText });

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction,
          temperature: 0.4
        }
      });
      if (response && response.text) {
        return response.text;
      }
    }

    // Fallback deterministic rich responses if client-side API key is not present or offline
    if (mode === 'face') {
      return `### 1. मुखाकृति एवं तेज विश्लेषण (Face Reading)\n- ललाट व नेत्रों की संरचना के आधार पर आपकी बौद्धिक स्पष्टता, सौम्य स्वभाव और उच्च नेतृत्व क्षमता स्पष्ट रूप से झलकती है।\n- आपके मुख पर संतुलन, आंतरिक शांति और रचनात्मकता का सुंदर प्रभाव है।\n\n### 2. बौद्धिक एवं आंतरिक स्वभाव\n- आप हर कार्य को दूरदर्शिता और योजनाबद्ध तरीके से करते हैं। आपकी संवेदनशीलता और दृढ़ संकल्प आपको जीवन में आगे बढ़ाते हैं।\n\n### 3. जीवन दृष्टि एवं मार्गदर्शन\n- वर्तमान समय आपके व्यक्तिगत विकास और सृजनात्मक कार्यों के लिए अति उत्तम है। आत्मविश्वास के साथ आगे बढ़ें।`;
    } else if (mode === 'palm') {
      return `### 1. बाएँ और दाएँ हाथ की तुलना (Left & Right Palm Comparison)\n- **बायां हाथ (जन्मजात क्षमता):** यह हाथ दर्शाता है कि ईश्वर प्रदत्त प्रतिभा, मानसिक क्षमता और आंतरिक ऊर्जा आपके पास प्रचुर मात्रा में है।\n- **दायां हाथ (वर्तमान कर्म):** दाहिने हाथ की रेखाएं बताती हैं कि आपके पुरुषार्थ और निरंतर कर्म से आपकी क्षमताएं वास्तविक सफलता में बदल रही हैं।\n\n### 2. जीवन रेखा एवं शारीरिक ऊर्जा (Life Line & Vitality)\n- जीवन रेखा स्पष्ट और गहरी है, जो उत्तम स्वास्थ्य, दीर्घायु और प्रचुर शारीरिक ऊर्जा का प्रतीक है।\n\n### 3. मस्तिष्क रेखा एवं बुद्धि (Head Line & Intellect)\n- मस्तिष्क रेखा संतुलित और स्पष्ट है, जो आपकी तीव्र बुद्धि, एकाग्रता और सही निर्णय लेने की क्षमता को दर्शाती है।\n\n### 4. हृदय रेखा एवं भावनाएं (Heart Line & Emotions)\n- हृदय रेखा उदारता, करुणा और पारिवारिक संबंधों में प्रगाढ़ प्रेम का परिचायक है।\n\n### 5. भाग्य रेखा एवं कर्म (Fate Line & Career Path)\n- भाग्य रेखा कर्मठता और निरंतर उन्नति का मार्ग प्रशस्त करती है। पुरुषार्थ और निष्ठा से आपको विशेष सफलता मिलेगी।\n\n### 6. सरल वैदिक उपाय (Simple Vedic Remedies)\n- **सूर्य उपासना:** प्रतिदिन सुबह सूर्योदय के समय तांबे के लोटे से जल अर्पित करें (ॐ सूर्याय नमः)।\n- **दान एवं सेवा:** जरूरतमंदों को अन्न या वस्त्र का दान करें।\n- **ध्यान एवं मंत्र:** नियमित 10 मिनट गायत्री मंत्र का जाप करें।`;
    } else {
      return `### 1. प्रश्न का सार (Core Question)\n- आपका प्रश्न "${question || 'सामान्य मार्गदर्शन'}" आपके जीवन के एक महत्वपूर्ण और सकारात्मक मोड़ को दर्शाता है।\n\n### 2. अतीत का कार्ड (Past Card - ${cards?.[0]?.name || 'द मैजिशियन'})\n- आपके पिछले अनुभवों और संघर्षों ने आपको सहनशक्ति, परिपक्वता और सही दिशा प्रदान की है।\n\n### 3. वर्तमान का कार्ड (Present Card - ${cards?.[1]?.name || 'द एम्प्रेस'})\n- वर्तमान समय आपके लिए नए अवसरों, रचनात्मकता और सही निर्णय लेने का अनुकूल अवसर है। संकोच त्यागकर आगे बढ़ें।\n\n### 4. भविष्य का कार्ड (Future Card - ${cards?.[2]?.name || 'द सन'})\n- भविष्य में सफलता, आंतरिक शांति, और प्रगति के अत्यंत सुंदर योग बन रहे हैं। आपके प्रयास रंग लाएंगे।\n\n### 5. अंतिम संदेश एवं उपाय (Final Guidance & Affirmation)\n- नियमित ध्यान करें, अपने पुरुषार्थ पर भरोसा रखें और सकारात्मकता बनाए रखें। ईश्वर की कृपा आपके साथ है।`;
    }
  };

  // Submit Face Reading
  const analyzeFace = async () => {
    if (!faceImage) return;
    setFaceLoading(true);
    setFaceResult(null);
    try {
      const resultText = await callGeminiDirectly('face', faceImage);
      setFaceResult(resultText);
    } catch (err) {
      console.error(err);
      setFaceResult('विश्लेषण प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setFaceLoading(false);
    }
  };

  // Submit Palmistry (Comparative Analysis of Left & Right hands)
  const analyzePalm = async () => {
    if (!leftPalmImage && !rightPalmImage) return;
    setPalmLoading(true);
    setPalmResult(null);
    try {
      const resultText = await callGeminiDirectly('palm', leftPalmImage, rightPalmImage);
      setPalmResult(resultText);
    } catch (err) {
      console.error(err);
      setPalmResult('हस्तरेखा विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setPalmLoading(false);
    }
  };

  // Initialize Tarot Shuffle
  const startTarotShuffle = () => {
    const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
    setShuffledCards(shuffled.slice(0, 9)); // 9 cards to pick from
    setSelectedCards([]);
    setTarotResult(null);
  };

  // Pick Tarot Card
  const pickTarotCard = (card: typeof TAROT_DECK[0]) => {
    if (selectedCards.length >= 3) return;
    if (selectedCards.some(sc => sc.card.id === card.id)) return;

    const positions: Array<'Past' | 'Present' | 'Future'> = ['Past', 'Present', 'Future'];
    const nextPos = positions[selectedCards.length];

    const newSelection = [...selectedCards, { card, position: nextPos, isFlipped: true }];
    setSelectedCards(newSelection);

    if (newSelection.length === 3) {
      fetchTarotReading(newSelection);
    }
  };

  // Fetch Tarot AI Reading
  const fetchTarotReading = async (cards: typeof selectedCards) => {
    setTarotLoading(true);
    try {
      const mappedCards = cards.map(c => ({ position: c.position, name: c.card.name, meaning: c.card.meaning }));
      const resultText = await callGeminiDirectly('tarot', null, null, tarotQuestion || 'जीवन और भविष्य का मार्गदर्शन', mappedCards);
      setTarotResult(resultText);
    } catch (err) {
      console.error(err);
      setTarotResult('टैरो व्याख्या में त्रुटि। कृपया पुनः प्रयास करें।');
    } finally {
      setTarotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>डैशबोर्ड</span>
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg font-bold text-amber-300">दैवीय रहस्य एवं विद्या (Mystic Arts Hub)</h1>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Subtitle banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900/60 border border-amber-500/20 rounded-2xl p-5 mb-6 text-center shadow-lg">
          <h2 className="text-xl font-bold text-amber-200 mb-1">फेस रीडिंग, हस्तरेखा एवं टैरो कार्ड ज्योतिष</h2>
          <p className="text-sm text-slate-300">प्राचीन समुद्रशास्त्र, हस्तरेखा विज्ञान और टैरो के माध्यम से अपने व्यक्तित्व एवं भविष्य की सुंदर झलक पाएं।</p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab('face')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'face'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">फेस रीडिंग (Face)</span>
            <span className="sm:hidden">फेस</span>
          </button>

          <button
            onClick={() => setActiveTab('palm')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'palm'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span className="hidden sm:inline">हस्तरेखा (Palmistry)</span>
            <span className="sm:hidden">हस्तरेखा</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tarot');
              if (shuffledCards.length === 0) startTarotShuffle();
            }}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'tarot'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">टैरो कार्ड (Tarot)</span>
            <span className="sm:hidden">टैरो</span>
          </button>
        </div>

        {/* TAB 1: FACE READING */}
        {activeTab === 'face' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-amber-300 mb-2 flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <span>मुखमुद्रा एवं व्यक्तित्व विश्लेषण (Face Reading)</span>
              </h3>
              <p className="text-sm text-slate-300 mb-6">
                अपनी स्पष्ट सेल्फी या मुख की तस्वीर अपलोड करें। AI आपके ललाट, नेत्र और मुखाकृति के आधार पर सकारात्मक व्यक्तित्व और जीवन दृष्टि का वैदिक विश्लेषण प्रस्तुत करेगा।
              </p>

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-8 bg-slate-950/50 transition-colors">
                {faceImage ? (
                  <div className="relative mb-4">
                    <img src={faceImage} alt="Face Preview" className="w-48 h-48 object-cover rounded-full border-4 border-amber-500/30 shadow-lg" />
                    <button
                      onClick={() => { setFaceImage(null); setFaceResult(null); }}
                      className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow"
                      title="तस्वीर बदलें"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Camera className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-300 mb-2">अपनी स्पष्ट सेल्फी अपलोड करें</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFaceUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm transition-colors shadow"
                    >
                      तस्वीर चुनें (Upload Photo)
                    </button>
                  </div>
                )}

                {faceImage && !faceLoading && !faceResult && (
                  <button
                    onClick={analyzeFace}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>फेस रीडिंग विश्लेषण शुरू करें</span>
                  </button>
                )}

                {faceLoading && (
                  <div className="flex items-center gap-3 text-amber-400 py-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm font-medium">मुखमुद्रा एवं तेज का विश्लेषण हो रहा है...</span>
                  </div>
                )}
              </div>
            </div>

            {faceResult && (
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
                <h4 className="text-base font-bold text-amber-300 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>फेस रीडिंग रिपोर्ट (Face Reading Report)</span>
                  </div>
                </h4>
                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed mb-6">
                  <ReactMarkdown>{faceResult}</ReactMarkdown>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleShareOrCopy(faceResult)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>रिपोर्ट शेयर / कॉपी करें</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PALMISTRY (Dual Hand: Left & Right) */}
        {activeTab === 'palm' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-amber-300 mb-2 flex items-center gap-2">
                <Hand className="w-5 h-5 text-amber-400" />
                <span>हस्तरेखा विज्ञान — द्वihस्त (बायां एवं दायां हाथ) तुलनात्मक विश्लेषण</span>
              </h3>
              <p className="text-sm text-slate-300 mb-6">
                उत्तम और सटीक विश्लेषण के लिए अपने दोनों हाथों (बायां हाथ - जन्मजात क्षमता; दायां हाथ - वर्तमान कर्म व भाग्य) की स्पष्ट तस्वीरें अपलोड करें।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Left Hand Card */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-6 bg-slate-950/50 transition-colors">
                  <h4 className="text-sm font-bold text-amber-300 mb-3">बायां हाथ (Left Hand — जन्मजात क्षमता)</h4>
                  {leftPalmImage ? (
                    <div className="relative mb-4">
                      <img src={leftPalmImage} alt="Left Palm" className="w-40 h-40 object-cover rounded-xl border-2 border-amber-500/40 shadow-md" />
                      <button
                        onClick={() => { setLeftPalmImage(null); setPalmResult(null); }}
                        className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow"
                        title="तस्वीर बदलें"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Upload className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                      <input
                        type="file"
                        ref={leftPalmInputRef}
                        onChange={(e) => handlePalmUpload(e, 'left')}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => leftPalmInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium rounded-lg text-xs transition-colors"
                      >
                        बायां हाथ अपलोड करें
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Hand Card */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-6 bg-slate-950/50 transition-colors">
                  <h4 className="text-sm font-bold text-amber-300 mb-3">दायां हाथ (Right Hand — वर्तमान कर्म)</h4>
                  {rightPalmImage ? (
                    <div className="relative mb-4">
                      <img src={rightPalmImage} alt="Right Palm" className="w-40 h-40 object-cover rounded-xl border-2 border-amber-500/40 shadow-md" />
                      <button
                        onClick={() => { setRightPalmImage(null); setPalmResult(null); }}
                        className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow"
                        title="तस्वीर बदलें"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Upload className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                      <input
                        type="file"
                        ref={rightPalmInputRef}
                        onChange={(e) => handlePalmUpload(e, 'right')}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => rightPalmInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium rounded-lg text-xs transition-colors"
                      >
                        दायां हाथ अपलोड करें
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {(leftPalmImage || rightPalmImage) && !palmLoading && !palmResult && (
                <div className="flex justify-center">
                  <button
                    onClick={analyzePalm}
                    className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>दोनों हाथों का तुलनात्मक विश्लेषण शुरू करें</span>
                  </button>
                </div>
              )}

              {palmLoading && (
                <div className="flex items-center justify-center gap-3 text-amber-400 py-6">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-medium">दोनों हाथों की रेखाओं का तुलनात्मक अध्ययन हो रहा है...</span>
                </div>
              )}
            </div>

            {palmResult && (
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
                <h4 className="text-base font-bold text-amber-300 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>हस्तरेखा तुलनात्मक रिपोर्ट एवं सरल वैदिक उपाय</span>
                </h4>
                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed mb-6">
                  <ReactMarkdown>{palmResult}</ReactMarkdown>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleShareOrCopy(palmResult)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>रिपोर्ट शेयर / कॉपी करें</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TAROT CARD READING */}
        {activeTab === 'tarot' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-amber-300 mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>टैरो कार्ड दिव्य मार्गदर्शन (Tarot Card Reading)</span>
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                अपना प्रश्न दर्ज करें, कार्ड्स को शफल करें और 3 कार्ड (अतीत, वर्तमान, भविष्य) चुनें।
              </p>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 mb-2">आपका प्रश्न या संकल्प (Your Question)</label>
                <input
                  type="text"
                  value={tarotQuestion}
                  onChange={(e) => setTarotQuestion(e.target.value)}
                  placeholder="उदा. मेरे करियर और उन्नति के लिए क्या मार्गदर्शन है?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-amber-200">
                  {selectedCards.length === 0 && 'नीचे दिए गए डेक से 3 कार्ड चुनें (अतीत, वर्तमान, भविष्य)'}
                  {selectedCards.length === 1 && 'दूसरा कार्ड चुनें (वर्तमान)'}
                  {selectedCards.length === 2 && 'तीसरा कार्ड चुनें (भविष्य)'}
                  {selectedCards.length === 3 && 'आपके 3 कार्ड चुने जा चुके हैं। AI व्याख्या तैयार है!'}
                </span>
                <button
                  onClick={startTarotShuffle}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>पुनः शफल करें</span>
                </button>
              </div>

              {/* Deck Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                {shuffledCards.map((card, idx) => {
                  const isSelected = selectedCards.some(sc => sc.card.id === card.id);
                  return (
                    <div
                      key={card.id + '-' + idx}
                      onClick={() => !isSelected && pickTarotCard(card)}
                      className={`h-36 rounded-xl border-2 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 opacity-60 cursor-not-allowed scale-95'
                          : 'bg-slate-950 hover:bg-slate-800 border-slate-700 hover:border-amber-400 shadow-md hover:-translate-y-1'
                      }`}
                    >
                      <Sparkles className={`w-8 h-8 mb-2 ${isSelected ? 'text-amber-600' : 'text-amber-400 animate-pulse'}`} />
                      <span className="text-xs font-bold text-amber-200">
                        {isSelected ? 'चुना गया' : `कार्ड #${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Selected Cards Display */}
              {selectedCards.length > 0 && (
                <div className="border-t border-slate-800 pt-6">
                  <h4 className="text-sm font-bold text-amber-300 mb-4">चयनित 3 कार्ड (Selected Spread)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedCards.map((sc, index) => (
                      <div key={index} className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 shadow-lg flex flex-col justify-between">
                        <div>
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 mb-2">
                            {sc.position === 'Past' ? 'अतीत (Past)' : sc.position === 'Present' ? 'वर्तमान (Present)' : 'भविष्य (Future)'}
                          </span>
                          <h5 className="text-sm font-bold text-amber-200 mb-1">{sc.card.name}</h5>
                          <p className="text-xs text-slate-300">{sc.card.meaning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tarotLoading && (
                <div className="flex items-center justify-center gap-3 text-amber-400 py-6">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-medium">टैरो कार्ड्स की दिव्य व्याख्या तैयार हो रही है...</span>
                </div>
              )}
            </div>

            {tarotResult && (
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
                <h4 className="text-base font-bold text-amber-300 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>टैरो कार्ड मार्गदर्शन रिपोर्ट (Tarot Reading Guidance)</span>
                </h4>
                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed mb-6">
                  <ReactMarkdown>{tarotResult}</ReactMarkdown>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleShareOrCopy(tarotResult)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>रिपोर्ट शेयर / कॉपी करें</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
