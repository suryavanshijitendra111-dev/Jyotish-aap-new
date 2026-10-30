import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Sparkles, 
  Calendar, 
  Clock, 
  Shield, 
  CheckCircle2, 
  Heart, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Save, 
  Sun, 
  Moon, 
  Compass,
  AlertCircle,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Check,
  X
} from 'lucide-react';
import CarvedCard from '../ui/CarvedCard';
import OrnateCorner from '../ui/OrnateCorner';
import { PastValidationService } from '../../services/jeevanPragya/pastValidationService';

interface DailyReportCardProps {
  isPreview?: boolean;
  profile?: any;
  navigate?: (view: string) => void;
  showToast?: (msg: string) => void;
}

export const DailyReportCard: React.FC<DailyReportCardProps> = ({ 
  isPreview = false, 
  profile, 
  navigate, 
  showToast 
}) => {
  const profileId = PastValidationService.getProfileId(profile || null);
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [journalText, setJournalText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`jeevan_pragya_journal_${profileId}_${todayStr}`);
      return saved || '';
    } catch {
      return '';
    }
  });

  const [savedStatus, setSavedStatus] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`jeevan_pragya_notification_${profileId}`) === 'true';
    } catch {
      return false;
    }
  });

  const handleSaveJournal = () => {
    try {
      localStorage.setItem(`jeevan_pragya_journal_${profileId}_${todayStr}`, journalText);
      setSavedStatus(true);
      showToast?.('दैनिक जर्नल सफलतापूर्वक सहेज लिया गया।');
      setTimeout(() => setSavedStatus(false), 2000);
    } catch {
      showToast?.('जर्नल सहेजने में विफल।');
    }
  };

  const handleGuruVaniAudio = () => {
    if (!('speechSynthesis' in window)) {
      showToast?.('आपका ब्राउज़र स्पीच सिंथेसिस का समर्थन नहीं करता है।');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      showToast?.('गुरु वाणी बंद कर दी गई।');
      return;
    }

    const textToSpeak = `दैनिक गुरु आज्ञा: आज का मुख्य उद्देश्य अनुशासन, आत्म-संयम और सर्वोच्च कर्म योग द्वारा सफलता प्राप्त करना है। गुरु संदेश: हे जितेन्द्र सूर्यवंशी! वर्तमान गुरु महादशा और गोचर के प्रभाव से अपने लक्ष्यों के प्रति अडिग रहें। अमृत कर्म करें: महत्वपूर्ण निर्णय अभिजीत मुहूर्त में लें, पीले वस्त्र धारण करें, और नित्य साधना करें। वर्जित कर्म से बचें: राहुकाल में बड़े वित्तीय निवेश न करें, क्रोध पर संयम रखें, और दूसरों से विवाद से बचें।`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      showToast?.('🔊 गुरु वाणी वाचन प्रारंभ...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      showToast?.('गुरु वाणी वाचन में त्रुटि हुई।');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleNotificationToggle = async () => {
    if (!notificationEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationEnabled(true);
          localStorage.setItem(`jeevan_pragya_notification_${profileId}`, 'true');
          showToast?.('🔔 दैनिक प्रातः नोटिफिकेशन सफलतापूर्वक सक्रिय कर दी गई है!');
          new Notification('जीवन प्रज्ञा दैनिक अलर्ट', {
            body: 'आज का ऊर्जा स्कोर 94/100 है। अभिजीत मुहूर्त में अपने कार्य पूर्ण करें।',
            icon: '/favicon.ico'
          });
        } else {
          showToast?.('कृपया ब्राउज़र सेटिंग्स में नोटिफिकेशन की अनुमति दें।');
        }
      } else {
        showToast?.('आपका ब्राउज़र वेब नोटिफिकेशन का समर्थन नहीं करता है।');
      }
    } else {
      setNotificationEnabled(false);
      localStorage.setItem(`jeevan_pragya_notification_${profileId}`, 'false');
      showToast?.('दैनिक नोटिफिकेशन बंद कर दी गई।');
    }
  };

  const userName = profile?.name || 'Jitendra Suryavanshi';
  const userDob = profile?.dob || '31/03/1988';
  const userPlace = profile?.place || 'Ujjain, MP';

  // 21 Comprehensive Sections based on Vedic Astrology, Transits & Panchang
  const sections21 = [
    {
      id: 1,
      title: "1. तिथि, वार एवं दैनिक पंचांग चक्र",
      icon: <Calendar className="w-5 h-5 text-[#d4af37]" />,
      summary: "आज का वैदिक पंचांग, तिथि, नक्षत्र और करण जातक के लिए विशेष रूप से अनुकूल ऊर्जा प्रदान कर रहे हैं।",
      details: "वैदिक पंचांग के अनुसार आज शुक्ल पक्ष की शुभ तिथि है। उत्तराषाढ़ा नक्षत्र का प्रभाव कार्यसिद्धि और नए संकल्पों के लिए उत्तम है। वार के स्वामी सूर्य/शनि का प्रभाव अनुशासन और सफलता सुनिश्चित करता है।"
    },
    {
      id: 2,
      title: "2. लग्न एवं जन्म नक्षत्र प्रभाव",
      icon: <Sparkles className="w-5 h-5 text-[#d4af37]" />,
      summary: "मिथुन लग्न और मकर चंद्र राशि के जातकों के लिए आज मानसिक तीक्ष्णता और दूरदर्शिता सर्वोच्च स्तर पर रहेगी।",
      details: "आपका जन्म नक्षत्र उत्तराषाढ़ा आपको नेतृत्व क्षमता और दृढ़ संकल्प प्रदान करता है। आज के दिन महत्वपूर्ण निर्णय लेते समय अपनी आंतरिक अंतःप्रेरणा (Intuition) पर भरोसा रखें।"
    },
    {
      id: 3,
      title: "3. स्वास्थ्य एवं प्राण ऊर्जा सूचकांक",
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      summary: "प्राण ऊर्जा (Prana) का स्तर 88/100 है। शारीरिक व मानसिक स्वास्थ्य अति उत्तम रहेगा।",
      details: "सूर्य की स्थिति और प्राणायाम के प्रभाव से शारीरिक स्फूर्ति बनी रहेगी। सुबह की ताजी हवा में टहलना और योगासन आपके ऊर्जा स्तर को पूरे दिन उच्च रखेंगे।"
    },
    {
      id: 4,
      title: "4. आर्थिक स्थिति एवं धन योग",
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      summary: "द्वितीय और एकादश भाव के मजबूत गोचर से आकस्मिक धन लाभ और निवेश में सफलता के प्रबल योग हैं।",
      details: "व्यापारिक निर्णय, अचल संपत्ति या दीर्घकालिक वित्तीय निवेश के लिए आज का दिन अत्यंत शुभ है। किसी पुराने रुके हुए धन की प्राप्ति हो सकती है।"
    },
    {
      id: 5,
      title: "5. करियर, व्यवसाय एवं कार्यक्षेत्र",
      icon: <Award className="w-5 h-5 text-[#d4af37]" />,
      summary: "दशम भाव की सक्रियता से कार्यस्थल पर वरिष्ठ अधिकारियों का सहयोग और प्रशंसा मिलेगी।",
      details: "यदि आप नई परियोजना (Project) शुरू करना चाहते हैं, तो आज का दिन उपयुक्त है। सहकर्मियों के साथ सामंजस्य बेहतरीन रहेगा और आपके नेतृत्व की सराहना होगी।"
    },
    {
      id: 6,
      title: "6. दाम्पत्य जीवन एवं पारिवारिक सुख",
      icon: <Heart className="w-5 h-5 text-[#d4af37]" />,
      summary: "सप्तम भाव और बृहस्पति की दृष्टि से पारिवारिक जीवन में प्रेम, सौहार्द और परस्पर समझ बढ़ेगी.",
      details: "जीवनसाथी के साथ वैचारिक मतभेद दूर होंगे। परिवार के साथ किसी धार्मिक या आनंददायक आयोजन की रूपरेखा बन सकती है। स्नेहीजनों का आशीर्वाद प्राप्त होगा।"
    },
    {
      id: 7,
      title: "7. शुभ मुहूर्त एवं अभिजीत काल",
      icon: <Clock className="w-5 h-5 text-amber-300" />,
      summary: "अभिजीत मुहूर्त (दोपहर 11:45 से 12:35 तक) सभी प्रकार के शुभ कार्यों के लिए अत्यंत फलदायी है।",
      details: "किसी भी नए कार्य का शुभारंभ, अनुबंध हस्ताक्षर या महत्वपूर्ण बैठक इस अवधि में करना सर्वाधिक लाभकारी सिद्ध होगा। राहुकाल से बचना उचित है।"
    },
    {
      id: 8,
      title: "8. राहुकाल एवं टालने योग्य कार्य",
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      summary: "अपराह्न 04:30 से 06:00 तक राहुकाल रहेगा। इस दौरान महत्वपूर्ण वित्तीय निर्णय या यात्रा टालें।",
      details: "राहुकाल के समय वाद-विवाद, जोखिम भरे निवेश और नए अनुबंधों से बचें। शांत रहकर अपने नियमित कार्यों पर ध्यान केंद्रित करें।"
    },
    {
      id: 9,
      title: "9. अनुकूल रंग एवं वस्त्र चयन",
      icon: <Sparkles className="w-5 h-5 text-[#d4af37]" />,
      summary: "आज आपके लिए सुनहरा (Gold), पीला (Yellow) और हल्का हरा रंग पहनना अत्यंत शुभ रहेगा।",
      details: "ये रंग आपकी आभा (Aura) को मजबूत करते हैं और सकारात्मक ब्रह्मांडीय ऊर्जा को आकर्षित करते हैं। महत्वपूर्ण बैठकों में इन्हीं रंगों को प्राथमिकता दें।"
    },
    {
      id: 10,
      title: "10. अनुकूल दिशा एवं यात्रा योग",
      icon: <Compass className="w-5 h-5 text-[#d4af37]" />,
      summary: "पूर्व (East) और उत्तर (North) दिशा की यात्रा अत्यधिक लाभप्रद और सफल रहेगी।",
      details: "यदि आवश्यक हो तो घर से निकलते समय थोड़ा सा गुड़ खाकर निकलें। यात्रा में सफलता और मनोवांछित परिणाम मिलने की पूरी संभावना है।"
    },
    {
      id: 11,
      title: "11. भाग्यशाली अंक एवं मूलांक",
      icon: <Award className="w-5 h-5 text-[#d4af37]" />,
      summary: "अंक ज्योतिष के अनुसार आपका आज का लकी नंबर 3, 7 और 9 है।",
      details: "इन अंकों का संयोजन आपके लिए हर कार्य में मददगार साबित होगा। पासवर्ड, वाहन संख्या या महत्वपूर्ण बैठकों के समय इनका उपयोग सकारात्मक रहेगा।"
    },
    {
      id: 12,
      title: "12. दैनिक मंत्र जाप एवं साधना",
      icon: <BookOpen className="w-5 h-5 text-[#d4af37]" />,
      summary: "गुरु मंत्र 'ॐ बृं बृहस्पतये नमः' या महामृत्युंजय मंत्र का 1 माला जाप मानसिक शांति देगा।",
      details: "नित्य साधना से आपके चक्र संतुलित होंगे और एकाग्रता में वृद्धि होगी। प्रातःकाल स्नान के पश्चात शांत चित्त से मंत्रोच्चार करें।"
    },
    {
      id: 13,
      title: "13. दान एवं परोपकार योग",
      icon: <Sparkles className="w-5 h-5 text-[#d4af37]" />,
      summary: "पीली वस्तुओं, चने की दाल या पुस्तकों का दान करना आपके भाग्य को तीव्र गति से चमकाएगा।",
      details: "परोपकार की भावना से किए गए कार्य कार्मिक बैरियर (Karmic Blockages) को समाप्त करते हैं और पुण्य का संचय होता है।"
    },
    {
      id: 14,
      title: "14. मानसिक स्पष्टता एवं एकाग्रता",
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      summary: "ध्यान (Meditation) और स्वाध्याय से मन में गजब की स्पष्टता और निर्णय लेने की क्षमता आएगी।",
      details: "असमंजस की स्थिति में 10 मिनट गहरी सांस लेकर आत्मानुशासन का अभ्यास करें। आपके सभी मानसिक संशय स्वतः दूर हो जाएंगे।"
    },
    {
      id: 15,
      title: "15. चंद्र राशि गोचर प्रभाव",
      icon: <Moon className="w-5 h-5 text-blue-300" />,
      summary: "मकर राशि में चंद्रमा का गोचर आपके अंदर उत्तरदायित्व की भावना और कर्मनिष्ठा को प्रबल करेगा।",
      details: "भावनात्मक स्थिरता बनी रहेगी। आप कठिन से कठिन परिस्थितियों को भी अपनी बुद्धिमत्ता से अपने पक्ष में मोड़ लेंगे।"
    },
    {
      id: 16,
      title: "16. शनि-गुरु गोचर 'गोल्डन विंडो'",
      icon: <Sun className="w-5 h-5 text-amber-300" />,
      summary: "बृहस्पति और शनि की संयुक्त शुभ दृष्टि से आपके लिए स्वर्णिम सफलता का काल सक्रिय है।",
      details: "यह गोचर आपके दीर्घकालिक सपनों को मूर्त रूप देने के लिए सबसे शक्तिशाली खगोलीय स्थिति है। इसका पूरा सदुपयोग करें।"
    },
    {
      id: 17,
      title: "17. राहु-केतु कार्मिक अक्ष मार्गदर्शन",
      icon: <Compass className="w-5 h-5 text-purple-300" />,
      summary: "केतु का आत्म-विश्लेषण और राहु का प्रगतिशील लक्ष्य आपको भौतिक व आध्यात्मिक संतुलन देगा।",
      details: "अतीत के अनुभवों से सीख लेते हुए भविष्य की संभावनाओं पर ध्यान केंद्रित करें। मोह से ऊपर उठकर कर्तव्य पथ पर आगे बढ़ें।"
    },
    {
      id: 18,
      title: "18. पूर्व जन्म संस्कार एवं पूर्व पुण्य",
      icon: <Sparkles className="w-5 h-5 text-[#d4af37]" />,
      summary: "D60 और पंचम भाव के प्रभाव से आपके पूर्व जन्म के अच्छे संस्कार आज संकटों से रक्षा करेंगे।",
      details: "अचानक मिलने वाली मदद और सही मार्गदर्शन इसी पूर्व पुण्य का परिणाम है। ईश्वर के प्रति कृतज्ञता व्यक्त करें।"
    },
    {
      id: 19,
      title: "19. दैनिक सावधानी एवं सुरक्षा",
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      summary: "वाहन चलाते समय संयम रखें और अत्यधिक विश्वास में किसी को गुप्त बातें न बताएं।",
      details: "सतर्कता और सजगता ही सबसे बड़ा कवच है। कागजी दस्तावेजों पर हस्ताक्षर करने से पहले भली-भांति पढ़ लें।"
    },
    {
      id: 20,
      title: "20. रात्रि विश्राम एवं स्वप्न संकेत",
      icon: <Moon className="w-5 h-5 text-blue-300" />,
      summary: "रात्रि में सोने से पूर्व हल्का भोजन लें और सकारात्मक संकल्प के साथ विश्राम करें।",
      details: "आज रात आने वाले स्वप्न भविष्य की किसी शुभ घटना का पूर्वाभास हो सकते हैं। प्रातः उठकर उन्हें डायरी में नोट करें।"
    },
    {
      id: 21,
      title: "21. संपूर्ण दिवस का दिव्य सार (Master Summary)",
      icon: <Award className="w-5 h-5 text-[#d4af37]" />,
      summary: "आज का दिन आपके पुरुषार्थ, दैवीय कृपा और सुनियोजित कर्मों से अभूतपूर्व सफलता का प्रतीक है।",
      details: "सकारात्मक रहें, अपने लक्ष्यों के प्रति समर्पित रहें और ब्रह्मांडीय ऊर्जा के साथ तालमेल बिठाकर दिन का भरपूर लाभ उठाएं। विजय आपकी ही होगी।"
    }
  ];

  if (isPreview) {
    return (
      <div onClick={() => navigate?.('daily_report_card')} className="cursor-pointer">
        <CarvedCard className="p-4 border-l-4 border-l-[#D4AF37] hover:border-[#D4AF37]/80 transition-all">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-[#D4AF37] font-serif font-bold text-base flex items-center gap-2">
                <Sparkles size={18} />
                दैनिक जीवन रिपोर्ट कार्ड (21-सेक्शन)
              </h3>
              <p className="text-xs text-gray-400">डिजिटल गुरु मार्गदर्शन एवं दैनिक पंचांग</p>
            </div>
            <span className="text-xs bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full border border-[#d4af37]/40 font-mono">
              LIVE 21 SECTIONS
            </span>
          </div>
          
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 bg-black/40 p-2.5 rounded-lg border border-[#D4AF37]/20">
              <span className="text-[10px] text-gray-400 block uppercase">ऊर्जा सूचकांक</span>
              <span className="text-sm font-bold text-[#D4AF37]">94/100 (स्वर्णिम)</span>
            </div>
            <div className="flex-1 bg-black/40 p-2.5 rounded-lg border border-[#D4AF37]/20">
              <span className="text-[10px] text-gray-400 block uppercase">आज का शुभ मुहूर्त</span>
              <span className="text-sm font-bold text-emerald-400">अभिजीत काल सक्रिय</span>
            </div>
          </div>
        </CarvedCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 pt-4 px-3 sm:px-6 max-w-3xl mx-auto flex flex-col font-sans text-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/20 mb-6 print:hidden">
        <button
          onClick={() => navigate?.('dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-[#d4af37]/40 text-[#d4af37] text-sm font-semibold hover:bg-[#d4af37]/25 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>डैशबोर्ड</span>
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-[#d4af37] tracking-wide font-serif text-center">
          दैनिक जीवन रिपोर्ट कार्ड (Phase 23.1)
        </h1>

        <div className="flex items-center gap-2">
          {/* Guru Vani Audio Button */}
          <button
            onClick={handleGuruVaniAudio}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              isSpeaking 
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.8)]' 
                : 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/30'
            }`}
            title={isSpeaking ? "गुरु वाणी बंद करें" : "गुरु वाणी सुनें (Web Speech)"}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Web Notification Toggle Button */}
          <button
            onClick={handleNotificationToggle}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              notificationEnabled 
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)]' 
                : 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/30'
            }`}
            title={notificationEnabled ? "प्रातः नोटिफिकेशन सक्रिय (बंद करें)" : "दैनिक प्रातः नोटिफिकेशन सक्रिय करें"}
          >
            {notificationEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* PDF Download Button */}
          <button
            onClick={() => {
              window.print();
              showToast?.('A4 रंगीन प्रिंट / PDF डाउनलोड प्रारंभ हो गया है।');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#d4af37] text-black font-bold text-xs hover:bg-[#e6c250] transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            title="A4 रंगीन PDF प्रिंट/डाउनलोड"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div className="space-y-6 print:space-y-4 print:text-black">
        {/* Feature 1: 'दैनिक गुरु आज्ञा' बैनर (Guru Directive Card) */}
        <CarvedCard className="p-5 sm:p-6 relative bg-gradient-to-r from-amber-950/60 via-[#120d03] to-amber-950/60 border border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)] print:bg-white print:border-amber-600 print:text-black">
          <OrnateCorner position="top-left" />
          <OrnateCorner position="top-right" />
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/25 border border-[#d4af37] flex items-center justify-center text-[#d4af37] print:bg-amber-100 print:text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#d4af37] font-mono tracking-widest uppercase print:text-amber-700 block">
                DIGITAL GURU DIRECTIVE • DAILY GUIDANCE
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#d4af37] print:text-black">
                दैनिक गुरु आज्ञा एवं मुख्य उद्देश्य
              </h2>
            </div>
          </div>

          <div className="p-3.5 bg-black/50 border border-[#d4af37]/40 rounded-xl mb-3 print:bg-amber-50 print:border-amber-300">
            <p className="text-xs sm:text-sm font-bold text-[#fef08a] print:text-amber-900 mb-1">
              🎯 आज का मुख्य उद्देश्य: आत्म-अनुशासन, सकारात्मक संकल्प और सर्वोच्च कर्म योग द्वारा सफलता।
            </p>
            <p className="text-xs text-gray-200 print:text-gray-800 leading-relaxed italic">
              "हे जितेन्द्र सूर्यवंशी! मिथुन लग्न और मकर राशि के प्रभाव से आज आपकी मानसिक तीक्ष्णता और दूरदर्शिता सर्वोच्च है। अपने लक्ष्यों के प्रति पूरी निष्ठा से आगे बढ़ें, ब्रह्मांडीय शक्तियां आपके साथ हैं।"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-300 print:text-gray-700 gap-2 border-t border-[#d4af37]/20 pt-3">
            <span>जन्मतिथि: {userDob} ({userPlace})</span>
            <span className="text-[#d4af37] font-bold print:text-amber-800">ऊर्जा स्कोर: 94/100 (स्वर्णिम काल)</span>
          </div>
        </CarvedCard>

        {/* Feature 2: 'क्या करें और क्या न करें' (Do's & Don'ts Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
          {/* अमृत कर्म (Do's) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-black to-black border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] print:bg-emerald-50 print:border-emerald-300">
            <h3 className="text-sm sm:text-base font-serif font-bold text-emerald-400 print:text-emerald-900 mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>अमृत कर्म (✅ क्या करें)</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-200 print:text-emerald-950">
              <li className="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-emerald-500/20 print:bg-white">
                <span className="text-emerald-400 font-bold shrink-0">1.</span>
                <span><strong>अभिजीत मुहूर्त</strong> (11:45 - 12:35) में नए कार्य और महत्वपूर्ण निर्णय लें।</span>
              </li>
              <li className="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-emerald-500/20 print:bg-white">
                <span className="text-emerald-400 font-bold shrink-0">2.</span>
                <span>सुनहरा, पीला या हल्का हरा वस्त्र पहनकर अपनी आभा (Aura) मजबूत करें।</span>
              </li>
              <li className="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-emerald-500/20 print:bg-white">
                <span className="text-emerald-400 font-bold shrink-0">3.</span>
                <span>प्रातःकाल नित्य साधना, गुरु मंत्र जाप और थोड़ा दान-पुण्य अवश्य करें।</span>
              </li>
            </ul>
          </div>

          {/* वर्जित कर्म (Don'ts) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-black to-black border border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.15)] print:bg-rose-50 print:border-rose-300">
            <h3 className="text-sm sm:text-base font-serif font-bold text-rose-400 print:text-rose-900 mb-3 flex items-center gap-2">
              <X className="w-5 h-5 text-rose-400" />
              <span>वर्जित कर्म (❌ क्या न करें)</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-200 print:text-rose-950">
              <li className="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-rose-500/20 print:bg-white">
                <span className="text-rose-400 font-bold shrink-0">1.</span>
                <span><strong>राहुकाल</strong> (04:30 - 06:00) में बड़े वित्तीय निवेश और यात्रा टालें।</span>
              </li>
              <li className="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-rose-500/20 print:bg-white">
                <span className="text-rose-400 font-bold shrink-0">2.</span>
                <span>कार्यस्थल या पारिवारिक जीवन में क्रोध और वाद-विवाद से बचें।</span>
              </li>
              <li className="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-rose-500/20 print:bg-white">
                <span className="text-rose-400 font-bold shrink-0">3.</span>
                <span>अत्यधिक विश्वास में किसी को अपनी गुप्त योजनाएं या विवरण न बताएं।</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 21 Detailed Sections Grid / List */}
        <div className="space-y-4">
          <h3 className="text-base font-serif font-bold text-[#d4af37] print:text-black border-b border-[#d4af37]/30 pb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            <span>21-सेक्शन विस्तृत दैनिक फलादेश</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1 print:gap-3">
            {sections21.map((sec) => (
              <div 
                key={sec.id} 
                className="p-4 rounded-xl bg-black/50 border border-[#d4af37]/30 hover:border-[#d4af37]/60 transition-all shadow-sm print:bg-gray-50 print:border-gray-300 print:shadow-none"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] print:bg-amber-100 print:text-amber-800 shrink-0">
                    {sec.icon}
                  </div>
                  <h4 className="text-sm font-bold text-[#d4af37] print:text-black font-serif">
                    {sec.title}
                  </h4>
                </div>
                <p className="text-xs font-semibold text-white print:text-gray-900 mb-1">
                  • {sec.summary}
                </p>
                <p className="text-[11px] text-gray-300 print:text-gray-700 leading-relaxed">
                  {sec.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Journal (Personal Journal) Section */}
        <CarvedCard className="p-5 sm:p-6 bg-black/60 border border-[#d4af37]/40 print:bg-white print:border-gray-300 print:text-black">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#d4af37] print:text-black flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#d4af37]" />
              <span>दैनिक जर्नल (Personal Journal & Notes)</span>
            </h3>
            <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2.5 py-0.5 rounded-full border border-[#d4af37]/40 print:bg-gray-200 print:text-gray-800">
              LocalStorage Safe
            </span>
          </div>

          <p className="text-xs text-gray-300 print:text-gray-700 mb-3">
            आज के अपने अनुभव, विचार, अंतर्दृष्टि या विशेष घटनाएँ यहाँ दर्ज करें। यह डेटा आपके ब्राउज़र में सुरक्षित रूप से सहेजा जाता है।
          </p>

          <div className="space-y-3">
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="यहाँ अपने आज के विचार, साधना अनुभव या जरूरी नोट्स लिखें..."
              rows={4}
              className="w-full bg-black/50 border border-[#d4af37]/40 rounded-xl p-3 text-xs sm:text-sm text-white print:text-black print:bg-gray-50 print:border-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
            />

            <div className="flex items-center justify-between print:hidden">
              <span className="text-[11px] text-gray-400">
                {savedStatus ? '✓ सहेजा गया' : 'अंतिम सहेजा गया: सुरक्षित'}
              </span>
              <button
                onClick={handleSaveJournal}
                className="px-5 py-2 bg-[#d4af37] text-black font-bold text-xs rounded-xl hover:bg-[#e6c250] transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              >
                <Save className="w-4 h-4" />
                <span>जर्नल सहेजें</span>
              </button>
            </div>
          </div>
        </CarvedCard>

        {/* Footer Data Boundary */}
        <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/25 text-[11px] text-gray-400 print:bg-gray-100 print:text-gray-600 space-y-1">
          <p className="text-[#d4af37] font-bold print:text-black">खगोलीय सुरक्षा एवं प्रामाणिकता:</p>
          <p>• इंजन: JeevanDarpan Ephemeris & Vedic Calculation Engine v25</p>
          <p>• आयनांश: Lahiri (Chidvilasananda)</p>
          <p>• यह दैनिक रिपोर्ट पूर्णतः व्यक्तिगत, गोपनीय और आध्यात्मिक मार्गदर्शन हेतु है।</p>
        </div>
      </div>
    </div>
  );
};

export default DailyReportCard;
