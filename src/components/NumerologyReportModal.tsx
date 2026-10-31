import React, { useMemo, useState } from 'react';
import { Sparkles, X, Star, Compass, Award, Calendar, Volume2, Share2, Sun } from 'lucide-react';
import { BirthProfile } from '../types/kundli';
import { NumerologyEngine } from '../services/numerology/numerologyEngine';
import { LoShuEngine } from '../services/numerology/loShuEngine';

interface NumerologyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BirthProfile | null;
  showToast: (msg: string) => void;
}

const PLANET_MAP: Record<number, { nameHi: string; nameEn: string; deity: string; gemstone: string; color: string; guidance: { hi: string; en: string }; friendly: number[]; neutral: number[]; enemy: number[] }> = {
  1: {
    nameHi: 'सूर्य (Sun)',
    nameEn: 'Sun',
    deity: 'भगवान सूर्य नारायण',
    gemstone: 'माणिक (Ruby)',
    color: 'सुनहरा / केसरिया',
    friendly: [1, 2, 3, 9],
    neutral: [5, 7],
    enemy: [6, 8],
    guidance: {
      hi: 'यह सप्ताह नेतृत्व, आत्म-विश्वास और नए आरंभ के लिए अत्यंत शुभ है। कार्यक्षेत्र में अपनी निर्णय क्षमता का खुलकर प्रदर्शन करें। अहंकार से बचें।',
      en: 'This week is highly favorable for leadership, confidence, and new beginnings. Showcase your decision-making skills in your career.'
    }
  },
  2: {
    nameHi: 'चंद्र (Moon)',
    nameEn: 'Moon',
    deity: 'भगवान शिव / चंद्रदेव',
    gemstone: 'मोती (Pearl)',
    color: 'श्वेत / चांदी',
    friendly: [1, 2, 3, 5],
    neutral: [4, 6, 9],
    enemy: [8],
    guidance: {
      hi: 'यह सप्ताह मानसिक शांति, रचनात्मकता और पारिवारिक संबंधों को मजबूत करने का है। सहज अंतःप्रेरणा पर भरोसा रखें।',
      en: 'This week emphasizes emotional peace, creativity, and strengthening family bonds. Trust your intuition.'
    }
  },
  3: {
    nameHi: 'गुरु (Jupiter)',
    nameEn: 'Jupiter',
    deity: 'देवगुरु बृहस्पति',
    gemstone: 'पुखराज (Yellow Sapphire)',
    color: 'पीला / सुनहरा',
    friendly: [1, 2, 3, 9],
    neutral: [5, 6],
    enemy: [4, 7, 8],
    guidance: {
      hi: 'ज्ञान, विस्तार और वित्तीय वृद्धि का योग है। गुरु कृपा से अटके हुए कार्य पूर्ण होंगे। शिक्षण और सलाह में लाभ मिलेगा।',
      en: 'Favorable for knowledge, expansion, and financial growth. Jupiter’s grace brings completion to stuck tasks.'
    }
  },
  4: {
    nameHi: 'राहु (Rahu)',
    nameEn: 'Rahu',
    deity: 'माता दुर्गा / भैरव',
    gemstone: 'हेसोनाइट (Hessonite)',
    color: 'धूसर / नीला',
    friendly: [1, 5, 6, 7],
    neutral: [2, 4],
    enemy: [3, 8, 9],
    guidance: {
      hi: 'अचानक परिवर्तन और तकनीकी कार्यों में सफलता का सप्ताह। कूटनीतिक सूझबूझ से काम लें और शॉर्टकट से बचें।',
      en: 'A week for sudden shifts and technical breakthroughs. Use diplomatic acumen and avoid shortcuts.'
    }
  },
  5: {
    nameHi: 'बुध (Mercury)',
    nameEn: 'Mercury',
    deity: 'भगवान गणेश',
    gemstone: 'पन्ना (Emerald)',
    color: 'हरा',
    friendly: [1, 5, 6],
    neutral: [2, 3, 4, 7, 9],
    enemy: [8],
    guidance: {
      hi: 'संचार, व्यापार और नेटवर्किंग के लिए यह सप्ताह स्वर्ण अवसर लेकर आया है। नए अनुबंध करने में सफलता मिलेगी।',
      en: 'A golden week for communication, business networking, and signing contracts. Success is assured.'
    }
  },
  6: {
    nameHi: 'शुक्र (Venus)',
    nameEn: 'Venus',
    deity: 'माता लक्ष्मी',
    gemstone: 'हीरा / ओपल',
    color: 'चमकता सफेद / गुलाबी',
    friendly: [4, 5, 6, 7],
    neutral: [2, 9],
    enemy: [1, 3, 8],
    guidance: {
      hi: 'प्रेम, कला, सौंदर्य और भौतिक सुख-सुविधाओं में वृद्धि होगी। परिवार के साथ आनंददायक समय बीतेगा।',
      en: 'Enhances love, arts, beauty, and material comforts. Enjoy delightful moments with family.'
    }
  },
  7: {
    nameHi: 'केतु (Ketu)',
    nameEn: 'Ketu',
    deity: 'भगवान गणेश',
    gemstone: 'लहसुनिया (Cat\'s Eye)',
    color: 'बहुरंगी / स्मोकी',
    friendly: [4, 5, 7],
    neutral: [1, 2, 6, 9],
    enemy: [3, 8],
    guidance: {
      hi: 'आध्यात्मिक चिंतन, शोध कार्य और अंतःदृष्टि के लिए उत्तम समय। बाहरी दुनिया की बजाय अपने भीतर झांकें।',
      en: 'Excellent for spiritual contemplation, research, and deep inner insight. Look within.'
    }
  },
  8: {
    nameHi: 'शनि (Saturn)',
    nameEn: 'Saturn',
    deity: 'शनिदेव / हनुमान जी',
    gemstone: 'नीलम (Blue Sapphire)',
    color: 'नीला / काला',
    friendly: [3, 5, 6],
    neutral: [4, 7, 8],
    enemy: [1, 2, 9],
    guidance: {
      hi: 'कड़ी मेहनत, अनुशासन और धैर्य का फल मिलने का समय। न्यायप्रिय और निष््ट रहें। कर्म प्रधान रहें।',
      en: 'Fruits of hard work, discipline, and patience are unfolding. Stay just and dedicated.'
    }
  },
  9: {
    nameHi: 'मंगल (Mars)',
    nameEn: 'Mars',
    deity: 'हनुमान जी',
    gemstone: 'मूंगा (Red Coral)',
    color: 'लाल / सिंदूरी',
    friendly: [1, 2, 3, 9],
    neutral: [5, 7],
    enemy: [4, 6, 8],
    guidance: {
      hi: 'अद्भुत ऊर्जा, साहस और पराक्रम का सप्ताह। रुके हुए साहसिक निर्णय लें। क्रोध और जल्दबाजी से बचें।',
      en: 'A week of immense energy, courage, and action. Make bold decisions, avoiding anger.'
    }
  }
};

const MISSING_REMEDIES: Record<number, { title: string; remedy: string }> = {
  1: { title: 'अंक 1 (सूर्य) उपाय', remedy: 'प्रतिदिन सूर्य अर्घ्य दें और आदित्य हृदय स्तोत्र का पाठ करें।' },
  2: { title: 'अंक 2 (चंद्र) उपाय', remedy: 'चांदी के गिलास में जल पिएं और पूर्णिमा का व्रत रखें।' },
  3: { title: 'अंक 3 (गुरु) उपाय', remedy: 'गुरुवार को पीला वस्त्र पहनें और किसी विद्वान या ब्राह्मण को चने की दाल दान करें।' },
  4: { title: 'अंक 4 (राहु) उपाय', remedy: 'दुर्गा चालीसा का पाठ करें और पक्षियों को दाना डालें।' },
  5: { title: 'अंक 5 (बुध) उपाय', remedy: 'गणेश जी को दूर्वा अर्पित करें और हरे रंग का प्रयोग बढ़ाएं।' },
  6: { title: 'अंक 6 (शुक्र) उपाय', remedy: 'शुक्रवार को माता लक्ष्मी के मंदिर में श्वेत पुष्प अर्पित करें।' },
  7: { title: 'अंक 7 (केतु) उपाय', remedy: 'गणेश स्तोत्र का पाठ करें और कुत्तों को रोटी खिलाएं।' },
  8: { title: 'अंक 8 (शनि) उपाय', remedy: 'शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएं।' },
  9: { title: 'अंक 9 (मंगल) उपाय', remedy: 'हनुमान चालीसा का पाठ करें और सुंदरकांड का पाठ करें।' }
};

export default function NumerologyReportModal({ isOpen, onClose, profile, showToast }: NumerologyReportModalProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const numData = useMemo(() => {
    if (!profile) return null;
    return NumerologyEngine.evaluate(profile, new Date(2026, 9, 31));
  }, [profile]);

  const loShuData = useMemo(() => {
    if (!profile) return null;
    return LoShuEngine.evaluate(profile);
  }, [profile]);

  if (!isOpen) return null;

  const birthNum = numData?.birthNumber || 6;
  const destinyNum = numData?.destinyNumber || 9;
  const nameNum = numData?.nameNumber || 6;
  const compoundName = numData?.compoundNameNumber || 33;

  const birthPlanet = PLANET_MAP[birthNum] || PLANET_MAP[6];
  const destinyPlanet = PLANET_MAP[destinyNum] || PLANET_MAP[9];

  // Personal Year for 2026
  const dobParts = NumerologyEngine.parseDate(profile?.dob || '1986-06-24');
  const personalYearRaw = dobParts.day + dobParts.month + 2026;
  const personalYear = NumerologyEngine.reduceNumber(personalYearRaw);

  // Personal Day for today (Oct 31, 2026)
  const personalMonthRaw = personalYear + 10;
  const personalMonth = NumerologyEngine.reduceNumber(personalMonthRaw);
  const personalDayRaw = personalMonth + 31;
  const personalDay = NumerologyEngine.reduceNumber(personalDayRaw);

  const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];

  const handleAudioPlayback = () => {
    if (!('speechSynthesis' in window)) {
      showToast('आपका ब्राउज़र वॉयस स्पीच का समर्थन नहीं करता है।');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `अंकशास्त्र प्रतिवेदन। जातक ${profile?.name || 'मित्र'}. मूलांक ${birthNum}, स्वामी ${birthPlanet.nameHi}. भाग्यांक ${destinyNum}, स्वामी ${destinyPlanet.nameHi}. नामांक ${nameNum}. व्यक्तिगत वर्ष ${personalYear}. साप्ताहिक मार्गदर्शन: ${birthPlanet.guidance.hi}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
    showToast('ऑडियो प्ले शुरू हो गया है...');
  };

  const handleWhatsAppShare = () => {
    const reportText = `🌟 *जीवनदर्पण - अंकशास्त्र साप्ताहिक प्रतिवेदन* 🌟\n\n👤 *नाम:* ${profile?.name || 'जातक'}\n📅 *जन्मतिथि:* ${profile?.dob || '24 June 1986'}\n\n🔢 *कोर अंकशास्त्र विश्लेषण:*\n• मूलांक (Janmank): ${birthNum} (${birthPlanet.nameHi})\n• भाग्यांक (Bhagyank): ${destinyNum} (${destinyPlanet.nameHi})\n• नामांक (Name No.): ${nameNum} (Compound: ${compoundName})\n\n⏳ *समय चक्र (2026):*\n• व्यक्तिगत वर्ष: ${personalYear}\n• आज का व्यक्तिगत दिन: ${personalDay}\n\n💡 *साप्ताहिक मार्गदर्शन:*\n${birthPlanet.guidance.hi}\n\n✨ _जीवनदर्पण वैदिक ऐप द्वारा जनरेटेड_`;

    const encoded = encodeURIComponent(reportText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    showToast('व्हाट्सएप शेयर लिंक खोला जा रहा है...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-[#062016] via-[#092a1c] to-[#03110a] border border-[#d4af37]/60 w-full max-w-xl rounded-3xl shadow-[0_0_60px_rgba(212,175,55,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-[#d4af37]/30 bg-[#030a08]/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#d4af37] tracking-wide">अंकशास्त्र विस्तृत प्रतिवेदन</h2>
              <p className="text-xs text-gray-300">लो-शू ग्रिड, नामांक, व्यक्तिगत वर्ष एवं साप्ताहिक मार्गदर्शन</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAudioPlayback}
              className={`p-2.5 rounded-full border transition-all ${isSpeaking ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse' : 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/30'}`}
              title="ऑडियो सुनें"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="p-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all"
              title="व्हाट्सएप पर शेयर करें"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-black/40 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-white">
          
          {/* User Profile Info Badge */}
          {profile && (
            <div className="bg-black/40 border border-[#d4af37]/25 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block">जातक / प्रोफ़ाइल</span>
                <span className="text-base font-bold text-[#d4af37]">{profile.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block">जन्मतिथि</span>
                <span className="text-sm font-semibold text-white">{profile.dob}</span>
              </div>
            </div>
          )}

          {/* 1. Core Numbers Grid: Mulank & Bhagyank */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#030a08]/90 border border-[#d4af37]/40 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#d4af37]/10 rounded-full blur-xl"></div>
              <span className="text-xs text-[#d4af37]/80 uppercase tracking-wider mb-1 font-bold">जन्मांक (Mulank)</span>
              <span className="text-4xl font-extrabold text-[#d4af37] my-1">{birthNum}</span>
              <span className="text-[11px] text-gray-300 font-medium text-center">स्वामी: {birthPlanet.nameHi}</span>
            </div>

            <div className="bg-[#030a08]/90 border border-[#d4af37]/40 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#d4af37]/10 rounded-full blur-xl"></div>
              <span className="text-xs text-[#d4af37]/80 uppercase tracking-wider mb-1 font-bold">भाग्यांक (Bhagyank)</span>
              <span className="text-4xl font-extrabold text-[#d4af37] my-1">{destinyNum}</span>
              <span className="text-[11px] text-gray-300 font-medium text-center">स्वामी: {destinyPlanet.nameHi}</span>
            </div>
          </div>

          {/* 2. Lo Shu Grid & Missing Numbers */}
          <div className="bg-[#0a1510]/90 border border-[#d4af37]/40 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-[#d4af37] tracking-widest uppercase mb-3 border-b border-[#d4af37]/20 pb-2 flex items-center justify-between">
              <span>लो-शू ग्रिड (Lo Shu Grid) एवं मिसिंग अंक</span>
              <span className="text-[10px] text-gray-400 font-mono">3×3 Vedic Grid</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mx-auto mb-4">
              {gridOrder.map((num) => {
                const count = loShuData?.grid[num]?.count || 0;
                const isPresent = count > 0;
                return (
                  <div
                    key={num}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative ${
                      isPresent
                        ? 'bg-gradient-to-br from-[#082218] to-[#0a1510] border-[#d4af37]/60 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                        : 'bg-black/30 border-white/5 text-gray-600'
                    }`}
                  >
                    <span className="text-2xl font-bold">{num}</span>
                    {isPresent && (
                      <span className="absolute bottom-1 right-1.5 text-[9px] font-bold text-[#fef08a]">
                        ×{count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Missing Numbers & Remedies */}
            {loShuData && loShuData.missingNumbers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#d4af37]/20 space-y-2">
                <span className="text-[11px] text-red-400 font-semibold block uppercase tracking-wider">
                  अनुपस्थित अंक (Missing Numbers) व सरल उपाय:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {loShuData.missingNumbers.map(missNum => {
                    const rem = MISSING_REMEDIES[missNum] || { title: `अंक ${missNum} उपाय`, remedy: 'नियमित ध्यान और सात्विकचर्या अपनाएं।' };
                    return (
                      <div key={missNum} className="bg-black/50 border border-red-900/30 rounded-xl p-2.5 text-xs">
                        <span className="text-[#d4af37] font-bold">{rem.title}:</span>
                        <p className="text-gray-300 text-[11px] mt-0.5">{rem.remedy}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Personal Year & Personal Day */}
          <div className="bg-[#030a08]/85 border border-[#d4af37]/40 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#d4af37] tracking-widest uppercase border-b border-[#d4af37]/20 pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#d4af37]" />
              <span>व्यक्तिगत वर्ष (Personal Year 2026) एवं आज का दिन</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-center">
                <span className="text-gray-400 block mb-1 uppercase text-[10px]">पर्सनल ईयर 2026</span>
                <span className="text-[#d4af37] text-2xl font-bold">{personalYear}</span>
                <p className="text-[11px] text-gray-300 mt-1">
                  {personalYear === 1 ? 'नई शुरुआत और लीडरशिप का वर्ष' : personalYear === 4 ? 'कड़ी मेहनत, नींव और अनुशासन का वर्ष' : personalYear === 6 ? 'परिवार, प्रेम और उत्तरदायित्व का वर्ष' : 'परिवर्तन और प्रगति का वर्ष'}
                </p>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-center">
                <span className="text-gray-400 block mb-1 uppercase text-[10px]">आज का पर्सनल डे</span>
                <span className="text-[#d4af37] text-2xl font-bold">{personalDay}</span>
                <p className="text-[11px] text-gray-300 mt-1">आज का दिन आंतरिक ऊर्जा और कार्य सिद्धि के लिए उत्तम है।</p>
              </div>
            </div>
          </div>

          {/* 4. Name Numerology (Chaldean) & Compatibility */}
          <div className="bg-[#0a1510]/90 border border-[#d4af37]/40 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#d4af37] tracking-widest uppercase border-b border-[#d4af37]/20 pb-2">
              नामांक विश्लेषण (Chaldean Name Numerology)
            </h3>

            <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/10 text-xs">
              <div>
                <span className="text-gray-400 block">प्रोफ़ाइल नाम:</span>
                <span className="text-white font-bold text-sm">{profile?.name || 'Jitendra Suryavanshi'}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block">नामांक / Compound:</span>
                <span className="text-[#d4af37] font-bold text-base">{nameNum} <span className="text-[11px] text-gray-400">({compoundName})</span></span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              आपका नामांक <strong className="text-[#d4af37]">{nameNum}</strong> आपके मूलांक <strong className="text-[#d4af37]">{birthNum}</strong> और भाग्यांक <strong className="text-[#d4af37]">{destinyNum}</strong> के साथ सामंजस्य स्थापित करता है, जिससे आपके व्यक्तित्व में आकर्षण और कार्यकुशलता बढ़ती है।
            </p>
          </div>

          {/* 5. Friendly & Enemy Numbers Table (Compatibility) */}
          <div className="bg-[#030a08]/85 border border-[#d4af37]/40 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#d4af37] tracking-widest uppercase border-b border-[#d4af37]/20 pb-2">
              मूलांक {birthNum} के मित्र व शत्रु अंक (Compatibility Table)
            </h3>

            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
                <span className="text-emerald-400 font-bold block mb-1">अति शुभ (मित्र)</span>
                <span className="text-white font-mono text-sm">{birthPlanet.friendly.join(', ')}</span>
              </div>
              <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl">
                <span className="text-amber-400 font-bold block mb-1">मध्यम (सम)</span>
                <span className="text-white font-mono text-sm">{birthPlanet.neutral.join(', ')}</span>
              </div>
              <div className="bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl">
                <span className="text-red-400 font-bold block mb-1">वर्जित (शत्रु)</span>
                <span className="text-white font-mono text-sm">{birthPlanet.enemy.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Personalized Weekly Guidance */}
          <div className="bg-gradient-to-br from-[#0a2217] via-[#05150e] to-[#030a08] border border-[#d4af37]/50 rounded-2xl p-5 shadow-[0_8px_25px_rgba(212,175,55,0.2)]">
            <h3 className="text-sm font-bold text-[#d4af37] tracking-wide mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#d4af37]" />
              <span>व्यक्तिगत साप्ताहिक मार्गदर्शन (Weekly Guidance)</span>
            </h3>
            
            <p className="text-sm text-gray-200 leading-relaxed mb-4">
              {birthPlanet.guidance.hi}
            </p>

            <div className="bg-black/50 p-3 rounded-xl border border-[#d4af37]/25 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 block">इस सप्ताह का शुभ रंग:</span>
                <span className="text-[#d4af37] font-bold">{birthPlanet.color}</span>
              </div>
              <div>
                <span className="text-gray-400 block">शुभ दिशा / अंक:</span>
                <span className="text-[#d4af37] font-bold">उत्तर-पूर्व / {birthNum}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAudioPlayback}
              className="min-h-[46px] py-3 bg-black/60 border border-[#d4af37]/50 text-[#d4af37] font-bold rounded-xl text-sm hover:bg-[#d4af37]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'ऑडियो रोकें' : 'ऑडियो सुनें'}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="min-h-[46px] py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-xl text-sm hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span>व्हाट्सएप पर शेयर</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
