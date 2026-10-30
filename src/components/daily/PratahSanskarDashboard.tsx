import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  RotateCcw, 
  Play, 
  Pause,
  Calendar,
  Volume2,
  Clock,
  Square,
  ArrowLeft
} from 'lucide-react';
import CarvedCard from '../ui/CarvedCard';
import OrnateCorner from '../ui/OrnateCorner';
import { cn } from '../../utils/cn';
import { SpeechEngine } from '../../services/companion/speechEngine';
import { TWELVE_SURYA_NAMES } from '../../types/pratahSanskar';

interface PratahSanskarDashboardProps {
  isPreview?: boolean;
  profile?: any;
  navigate?: (view: string) => void;
  showToast?: (msg: string) => void;
}

const STEPS = [
  { id: 'kara_darshan', title: '1. करदर्शन व जागृति ध्यान', subtitle: 'कराग्रे वसते लक्ष्मी... व 2 मिनट ध्यान', icon: '🙏' },
  { id: 'gayatri_jap', title: '2. गायत्री मंत्र जप साधना', subtitle: 'डिजिटल जप काउंटर (11/21/108 बार + हैप्टिक)', icon: '📿' },
  { id: 'surya_arghya', title: '3. सूर्य अर्घ्य व 12 सूर्य नाम', subtitle: 'प्रातःकालीन सूर्य वंदना एवं क्रमिक पाठ', icon: '☀️' },
  { id: 'deity_card', title: '4. वार-विशेष इष्ट मंत्र साधना', subtitle: 'आज के वार के अनुसार विशेष देवता', icon: '🌟' },
  { id: 'vedic_sankalpa', title: '5. दैनिक वैदिक संकल्प जनरेटर', subtitle: 'जितेन्द्र सूर्यवंशी हेतु विशेष संकल्प', icon: '✨' },
];

const PURE_SURYA_NAMES_AUDIO = [
  "ॐ मित्राय नमः। सबके मित्र और जगत को जीवन देने वाले सूर्यदेव को नमन।",
  "ॐ रवये नमः। संपूर्ण ब्रह्मांड में प्रकाश और ऊर्जा फैलाने वाले देव को नमन।",
  "ॐ सूर्याय नमः। कर्म और सक्रियता की प्रेरणा देने वाले सूर्य नारायण को नमन।",
  "ॐ भानवे नमः। दिव्य तेज और प्रकाश प्रदान करने वाले प्रभु को नमन।",
  "ॐ खगाय नमः। आकाश में विचरण करने वाले सर्वव्यापी देव को नमन।",
  "ॐ पूष्णे नमः। संसार का पोषण करने वाले और शक्तिदाता को नमन।",
  "ॐ हिरण्यगर्भाय नमः। स्वर्णिम आभा और सृष्टि के मूल स्रोत को नमन।",
  "ॐ मरीचये नमः। अनंत किरणों से अंधकार मिटाने वाले देव को नमन।",
  "ॐ आदित्याय नमः। माता अदिति के तेजस्वी पुत्र को नमन।",
  "ॐ सवित्रे नमः। संपूर्ण जगत को उत्पन्न करने वाले जगत्पिता को नमन।",
  "ॐ अर्काय नमः। संपूर्ण संसार द्वारा पूजनीय और वंदनीय देव को नमन।",
  "ॐ भास्कराय नमः। ज्ञान, मोक्ष और आत्मिक तेज देने वाले भगवान भास्कर को नमन।"
];

const WEEKDAY_DEITIES: Record<number, { day: string; deity: string; mantra: string; meaning: string; color: string }> = {
  0: { day: 'रविवार', deity: 'भगवान सूर्य नारायण', mantra: 'ॐ घृणिः सूर्याय नमः', meaning: 'तेज, आरोग्यता और प्रशासनिक सफलता हेतु।', color: 'text-orange-400' },
  1: { day: 'सोमवार', deity: 'भगवान शिव (चन्द्र देव)', mantra: 'ॐ नमः शिवाय', meaning: 'मानसिक शांति, चंद्र दोष निवारण और शीतलता हेतु।', color: 'text-cyan-300' },
  2: { day: 'मंगलवार', deity: 'संकटमोचन श्री हनुमान जी', mantra: 'ॐ हं हनुमते नमः', meaning: 'साहस, ऊर्जा, मंगल दोष शांति और सुरक्षा हेतु।', color: 'text-red-400' },
  3: { day: 'बुधवार', deity: 'विघ्नहर्ता श्री गणेश जी', mantra: 'ॐ गं गणपतये नमः', meaning: 'बुद्धि, व्यापारिक उन्नति और विघ्न नाश हेतु।', color: 'text-emerald-400' },
  4: { day: 'गुरुवार', deity: 'देवगुरु बृहस्पति व श्री विष्णु', mantra: 'ॐ बृं बृहस्पतये नमः', meaning: 'ज्ञान, विवेक, गुरु कृपा और समृद्धि हेतु।', color: 'text-yellow-300' },
  5: { day: 'शुक्रवार', deity: 'माता महालक्ष्मी व शुक्र देव', mantra: 'ॐ श्री महालक्ष्म्यै नमः', meaning: 'ऐश्वर्य, प्रेम, भौतिक सुख और वैभव हेतु।', color: 'text-pink-300' },
  6: { day: 'शनिवार', deity: 'न्यायाधीश शनिदेव व हनुमान जी', mantra: 'ॐ शं शनैश्चराय नमः', meaning: 'कर्म शुद्धि, शनि साढ़ेसाती/ढैय्या शांति हेतु।', color: 'text-purple-300' },
};

export default function PratahSanskarDashboard({ isPreview = false, navigate, showToast = () => {} }: PratahSanskarDashboardProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [streak, setStreak] = useState(1);
  
  // Voice Gender preference state (female / male)
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>(() => {
    return (localStorage.getItem('jeevandarpan_voice_preference') as 'female' | 'male') || 'female';
  });

  const handleToggleVoiceGender = (gender: 'female' | 'male') => {
    setVoiceGender(gender);
    localStorage.setItem('jeevandarpan_voice_preference', gender);
    showToast(gender === 'female' ? '👩 महिला स्वर चयनित' : '👨 पुरुष स्वर चयनित');
  };

  // Jap Counter state
  const [japCount, setJapCount] = useState<number>(0);
  const [targetJaps, setTargetJaps] = useState<number>(108);

  // Meditation timer state
  const [meditationActive, setMeditationActive] = useState<boolean>(false);
  const [meditationSeconds, setMeditationSeconds] = useState<number>(120); // 2 minutes

  // Surya Arghya index & Automatic Carousel state
  const [suryaIndex, setSuryaIndex] = useState<number>(0);
  const [isSequentialPlaying, setIsSequentialPlaying] = useState<boolean>(false);
  
  const seqTimerRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Live Sunrise & Brahm Muhurta Countdown
  const [timeToSunrise, setTimeToSunrise] = useState<string>('01:24:15');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const sunrise = new Date();
      sunrise.setHours(6, 18, 0, 0);
      if (now > sunrise) sunrise.setDate(sunrise.getDate() + 1);
      
      const diff = sunrise.getTime() - now.getTime();
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeToSunrise(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Voices changed listener for Android Chrome
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('jeevandarpan_pratah_sanskar');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastUpdate === today) {
          setCompletedSteps(parsed.steps || []);
        }
        setStreak(parsed.streak || 1);
        setJapCount(parsed.japCount || 0);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save to LocalStorage
  const saveProgress = (newSteps: string[], newJaps: number) => {
    const today = new Date().toISOString().split('T')[0];
    const data = {
      steps: newSteps,
      japCount: newJaps,
      lastUpdate: today,
      streak: newSteps.length === STEPS.length ? streak + 1 : streak
    };
    localStorage.setItem('jeevandarpan_pratah_sanskar', JSON.stringify(data));
  };

  const toggleStep = (id: string) => {
    const isAlreadyCompleted = completedSteps.includes(id);
    const newSteps = isAlreadyCompleted
      ? completedSteps.filter(s => s !== id)
      : [...completedSteps, id];
    
    setCompletedSteps(newSteps);
    saveProgress(newSteps, japCount);
    showToast(isAlreadyCompleted ? 'अनुष्ठान अनचेक किया गया' : 'अनुष्ठान पूर्ण चिह्नित हुआ! साधुवाद 🙏');
  };

  // Meditation Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (meditationActive && meditationSeconds > 0) {
      interval = setInterval(() => {
        setMeditationSeconds(prev => {
          if (prev <= 1) {
            setMeditationActive(false);
            showToast('2 मिनट का जागृति ध्यान पूर्ण हुआ! आंतरिक शांति का अनुभव करें।');
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [meditationActive, meditationSeconds, showToast]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Web Audio API Omkara Tone (432Hz)
  const playOmkaraTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        showToast('Web Audio API समर्थित नहीं है');
        return;
      }
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(108, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 6);
      showToast('ॐ ओंकार (432Hz) ध्वनि तरंग प्रवाहित हो रही है...');
    } catch (e) {
      console.error(e);
      showToast('ऑडियो प्लेबैक में त्रुटि');
    }
  };

  // Single-Utterance Chaining with 700ms pause and Voice Toggle preference
  const speakSuryaName = (index: number) => {
    if (!isPlayingRef.current) return;
    if (index >= PURE_SURYA_NAMES_AUDIO.length) {
      setIsSequentialPlaying(false);
      isPlayingRef.current = false;
      showToast('12 सूर्य नामों का संपूर्ण पाठ पूर्ण हुआ! 🙏');
      if (!completedSteps.includes('surya_arghya')) {
        toggleStep('surya_arghya');
      }
      return;
    }

    setSuryaIndex(index);
    const text = PURE_SURYA_NAMES_AUDIO[index];

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    activeUtteranceRef.current = utterance;
    utterance.lang = 'hi-IN';
    utterance.rate = 0.85; // calm speed
    utterance.pitch = voiceGender === 'female' ? 1.0 : 0.95; // Female: 1.0, Male: 0.95

    const voices = window.speechSynthesis.getVoices();
    const isFemale = voiceGender === 'female';
    const chosenVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      if (!lang.includes('hi')) return false;
      if (isFemale) {
        return name.includes('female') || name.includes('google हिन्दी') || name.includes('hi-in-x-hie') || name.includes('hi-in-x-hia') || name.includes('priya') || name.includes('kavya');
      } else {
        return name.includes('male') || name.includes('hemant') || name.includes('madhav') || name.includes('rohit');
      }
    }) || voices.find(v => v.lang.toLowerCase().includes('hi')) || voices[0];

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onend = () => {
      if (!isPlayingRef.current) return;
      seqTimerRef.current = setTimeout(() => {
        speakSuryaName(index + 1);
      }, 700); // 700ms pause between names
    };

    utterance.onerror = () => {
      if (!isPlayingRef.current) return;
      seqTimerRef.current = setTimeout(() => {
        speakSuryaName(index + 1);
      }, 700);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startSequentialSuryaNames = () => {
    setIsSequentialPlaying(true);
    isPlayingRef.current = true;
    showToast('सभी 12 सूर्य नामों का शुद्ध क्रमिक पाठ आरंभ...');
    speakSuryaName(0);
  };

  const stopSequentialSuryaNames = () => {
    setIsSequentialPlaying(false);
    isPlayingRef.current = false;
    if (seqTimerRef.current) clearTimeout(seqTimerRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    showToast('सूर्य नाम पाठ रोका गया');
  };

  // Dynamic Vedic Sankalpa Generator for Jitendra Suryavanshi
  const todayDateObj = new Date();
  const dayOfWeek = todayDateObj.getDay();
  const dayNameHindi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'][dayOfWeek];
  const formattedDateStr = todayDateObj.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const currentDeity = WEEKDAY_DEITIES[dayOfWeek] || WEEKDAY_DEITIES[0];
  
  const vedicSankalpaText = `अद्य श्री ब्रह्मणो द्वितीये परार्धे विष्णोराहर्ये श्वेतवाराहकल्पे वैवस्वत मन्वंतरे अष्टाविंशतितमे युगे कलिचौके जम्बूद्वीपे भारतवर्षे आर्यावर्तान्तर्गाते ब्रह्मवर्त क्षेत्रे, शुभ मन्वादि सम्वत्सरे, सूर्योदये, ${dayNameHindi}वासरे, ${formattedDateStr} तिथौ, मिथुन लग्ने, मकर राशौ स्थित चन्द्रे, उत्तराषाढ़ा नक्षत्रे, मम जन्मनाम्ने (जितेन्द्र सूर्यवंशी) आत्मिक बल-तेज-आरोग्यता-सिद्धि वृद्धये, अहमिमं प्रातः संस्कारानुष्ठानं सविधिं करिष्ये।`;

  if (isPreview) {
    return (
      <CarvedCard className="p-4 border-l-4 border-l-[#d4af37] bg-gradient-to-br from-[#04120c] to-[#082218]">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-[#d4af37] font-serif font-bold text-lg flex items-center gap-2">
              <Sun size={18} />
              प्रातः संस्कार (Phase 22.3)
            </h3>
            <p className="text-xs text-gray-400">दैनिक आध्यात्मिक अनुष्ठान ट्रैकर</p>
          </div>
          <Sparkles className="text-[#d4af37] animate-pulse" size={22} />
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-row items-center gap-1">
            {STEPS.map((s, i) => (
              <div 
                key={s.id} 
                className={cn(
                  "w-7 h-7 rounded-full border border-[#d4af37]/40 flex items-center justify-center text-[10px] font-bold",
                  completedSteps.includes(s.id) ? "bg-[#d4af37] text-[#030a08]" : "bg-[#0a1f16] text-gray-400"
                )}
              >
                {completedSteps.includes(s.id) ? "✓" : (i + 1)}
              </div>
            ))}
          </div>
          <div className="text-xs font-bold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-1 rounded-full border border-[#d4af37]/30">
            Streak: {streak} दिन 🔥
          </div>
        </div>
      </CarvedCard>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <CarvedCard className="p-6 sm:p-8 relative overflow-hidden">
        <OrnateCorner position="top-left" />
        <OrnateCorner position="top-right" />
        
        {/* Back Button, Voice Toggle & Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            {navigate && (
              <button
                onClick={() => navigate('dashboard')}
                className="inline-flex items-center gap-2 text-xs bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/40 px-4 py-2 rounded-xl font-bold transition shadow-sm cursor-pointer"
              >
                <ArrowLeft size={16} /> ← डैशबोर्ड
              </button>
            )}

            {/* Voice Gender Toggle Switch */}
            <div className="flex items-center gap-2 bg-[#030a08] border border-[#d4af37]/30 p-1 rounded-2xl shadow-sm">
              <button
                onClick={() => handleToggleVoiceGender('female')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5",
                  voiceGender === 'female' ? "bg-[#d4af37] text-[#030a08] shadow" : "text-gray-400 hover:text-white"
                )}
              >
                👩 महिला स्वर
              </button>
              <button
                onClick={() => handleToggleVoiceGender('male')}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5",
                  voiceGender === 'male' ? "bg-[#d4af37] text-[#030a08] shadow" : "text-gray-400 hover:text-white"
                )}
              >
                👨 पुरुष स्वर
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#d4af37]/20 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 px-3 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  Phase 22.3 — {voiceGender === 'female' ? 'महिला स्वर (Pitch 1.0)' : 'पुरुष स्वर (Pitch 0.95)'}
                </span>
                <span className="text-xs text-gray-400">साधक: जितेन्द्र सूर्यवंशी</span>
              </div>
              <h2 className="text-[#d4af37] text-2xl sm:text-3xl font-serif font-bold mt-1.5 flex items-center gap-2">
                <Sun className="text-[#d4af37]" size={28} />
                प्रातः संस्कार महाडैशबोर्ड
              </h2>
            </div>
            <div className="bg-gradient-to-tr from-[#d4af37]/20 via-[#f59e0b]/10 to-transparent border border-[#d4af37]/40 px-5 py-3 rounded-2xl flex items-center gap-3.5 shadow-lg">
              <div className="p-2.5 bg-[#d4af37]/20 rounded-xl text-[#d4af37]">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-[10px] text-[#d4af37] uppercase font-bold tracking-widest">साधना स्ट्रीक</p>
                <p className="text-2xl font-bold text-white">{streak} <span className="text-xs text-[#d4af37]">दिन निरंतर</span></p>
              </div>
            </div>
          </div>

          {/* Live Brahm Muhurta & Sunrise Countdown Card */}
          <div className="mt-5 bg-gradient-to-r from-[#072418] via-[#04120c] to-[#072418] border border-[#d4af37]/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#d4af37]/15 rounded-xl text-[#d4af37]">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs text-[#d4af37] font-bold uppercase tracking-wider">ब्रह्म मुहूर्त (04:24 - 05:12 AM)</p>
                <p className="text-xs text-gray-300">आज का स्थानीय सूर्योदय: <strong className="text-white">06:18 AM</strong></p>
              </div>
            </div>
            <div className="bg-black/50 border border-[#d4af37]/30 px-4 py-2 rounded-xl text-center">
              <p className="text-[10px] text-gray-400 uppercase">अर्घ्य हेतु शेष समय</p>
              <p className="text-lg font-mono font-bold text-[#fef08a]">{timeToSunrise}</p>
            </div>
          </div>
        </div>

        {/* 5-Step Checklist & Interactive Modules */}
        <div className="space-y-8">
          
          {/* SECTION 1: करदर्शन एवं जागृति ध्यान */}
          <div className="bg-[#051710] border border-[#d4af37]/30 rounded-2xl p-5 sm:p-6 shadow-md relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleStep('kara_darshan')}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                    completedSteps.includes('kara_darshan') ? "bg-[#d4af37] text-[#030a08] border-[#d4af37]" : "bg-gray-800 text-gray-400 border-gray-700"
                  )}
                >
                  {completedSteps.includes('kara_darshan') ? <CheckCircle2 size={18} /> : "1"}
                </button>
                <h3 className="text-lg font-serif font-bold text-[#d4af37]">1. जागृति आदर्श एवं कर-दर्शन</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={playOmkaraTone}
                  className="text-xs bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#fef08a] border border-[#d4af37]/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="432Hz ओंकार ध्वनि तरंग"
                >
                  <Volume2 size={14} /> ओंकार धुन (432Hz)
                </button>
                <button 
                  onClick={() => SpeechEngine.speak('कराग्रे वसते लक्ष्मी, करमध्ये सरस्वती। करमूले तू गोविंदा, प्रभाते करदर्शनम्॥', 'Sanskrit', { preferredGender: voiceGender, rate: 0.85, pitch: voiceGender === 'female' ? 1.0 : 0.95 })}
                  className="text-xs bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Volume2 size={14} /> श्लोक
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#030a08] p-4 rounded-xl border border-white/10">
                <p className="text-sm font-serif text-[#fef08a] font-semibold text-center leading-relaxed">
                  "कराग्रे वसते लक्ष्मीः, करमध्ये सरस्वती ।<br />
                  करमूले तू गोविन्दः, प्रभाते करदर्शनम् ॥"
                </p>
                <p className="text-xs text-gray-400 text-center mt-2">
                  <strong>अर्थ:</strong> हथेली के अग्रभाग में लक्ष्मी, मध्य में सरस्वती और मूल में भगवान विष्णु (गोविन्द) का वास है। प्रातः उठकर सर्वप्रथम हाथों के दर्शन करें।
                </p>
              </div>

              <div className="bg-[#030a08] p-4 rounded-xl border border-white/10 flex flex-col justify-between items-center text-center">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">2 मिनट जागृति ध्यान (Morning Meditation)</h4>
                  <div className="text-3xl font-mono font-bold text-white my-2">{formatTimer(meditationSeconds)}</div>
                  <p className="text-[11px] text-gray-400">आँखें बंद कर 432Hz ओंकार धुन के साथ ध्यान करें।</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => setMeditationActive(!meditationActive)}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer",
                      meditationActive ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-[#d4af37] text-[#030a08]"
                    )}
                  >
                    {meditationActive ? <Pause size={14} /> : <Play size={14} />}
                    {meditationActive ? 'रोकें (Pause)' : 'ध्यान शुरू करें'}
                  </button>
                  <button 
                    onClick={() => { setMeditationActive(false); setMeditationSeconds(120); }}
                    className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 cursor-pointer"
                    title="रीसेट"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* SECTION 2: गायत्री मंत्र साधना व डिजिटल जप काउंटर (with Haptic Feedback) */}
          <div className="bg-[#051710] border border-[#d4af37]/30 rounded-2xl p-5 sm:p-6 shadow-md relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleStep('gayatri_jap')}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                    completedSteps.includes('gayatri_jap') ? "bg-[#d4af37] text-[#030a08] border-[#d4af37]" : "bg-gray-800 text-gray-400 border-gray-700"
                  )}
                >
                  {completedSteps.includes('gayatri_jap') ? <CheckCircle2 size={18} /> : "2"}
                </button>
                <h3 className="text-lg font-serif font-bold text-[#d4af37]">2. गायत्री मंत्र साधना व डिजिटल जप काउंटर</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => SpeechEngine.speak('ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्।', 'Sanskrit', { preferredGender: voiceGender, rate: 0.85, pitch: voiceGender === 'female' ? 1.0 : 0.95 })}
                  className="text-xs bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Volume2 size={14} /> मंत्र उच्चारण
                </button>
              </div>
            </div>

            <div className="bg-[#030a08] p-4 rounded-xl border border-white/10 text-center mb-4">
              <p className="text-base font-serif text-[#fef08a] font-bold">
                ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <strong>अर्थ:</strong> हम उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक परमात्मा (सविता) का ध्यान करते हैं। वह हमारी बुद्धियों को सही दिशा में प्रेरित करे।
              </p>
            </div>

            {/* Interactive Counter Box with Haptic Vibration */}
            <div className="bg-gradient-to-r from-[#030a08] via-[#071f16] to-[#030a08] p-5 rounded-xl border border-[#d4af37]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#d4af37] uppercase font-bold tracking-widest">जप लक्ष्य: {targetJaps} बार (हैप्टिक वाइब्रेशन सहित)</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-mono font-bold text-white">{japCount}</span>
                  <span className="text-xs text-gray-400">/ {targetJaps} पूर्ण</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[11, 21, 108].map(num => (
                    <button
                      key={num}
                      onClick={() => setTargetJaps(num)}
                      className={cn(
                        "text-[10px] px-2.5 py-1 rounded-lg border font-bold cursor-pointer",
                        targetJaps === num ? "bg-[#d4af37] text-[#030a08] border-[#d4af37]" : "bg-black/40 text-gray-300 border-white/10"
                      )}
                    >
                      {num} जप
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const next = japCount + 1;
                    setJapCount(next);

                    // Haptic feedback on tap
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      try {
                        navigator.vibrate(40);
                      } catch (e) {}
                    }

                    if (next >= targetJaps) {
                      if (typeof navigator !== 'undefined' && navigator.vibrate) {
                        try {
                          navigator.vibrate([100, 50, 100]);
                        } catch (e) {}
                      }
                      showToast(`उत्कृष्ट! ${targetJaps} जप का लक्ष्य पूर्ण हुआ! 🎉`);
                      if (!completedSteps.includes('gayatri_jap')) {
                        toggleStep('gayatri_jap');
                      }
                    }
                    saveProgress(completedSteps, next);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bf47] hover:to-[#ffaf1b] text-[#030a08] font-bold rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.4)] transition transform active:scale-95 cursor-pointer flex items-center gap-2 text-base"
                >
                  <Sparkles size={20} /> जप करें (+1 Tap)
                </button>
                <button
                  onClick={() => { setJapCount(0); saveProgress(completedSteps, 0); }}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                  title="काउंटर रीसेट"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>


          {/* SECTION 3: सूर्य अर्घ्य व 12 सूर्य नाम (Chained Pure Hindi Recitation with Voice Toggle) */}
          <div className="bg-[#051710] border border-[#d4af37]/30 rounded-2xl p-5 sm:p-6 shadow-md relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleStep('surya_arghya')}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                    completedSteps.includes('surya_arghya') ? "bg-[#d4af37] text-[#030a08] border-[#d4af37]" : "bg-gray-800 text-gray-400 border-gray-700"
                  )}
                >
                  {completedSteps.includes('surya_arghya') ? <CheckCircle2 size={18} /> : "3"}
                </button>
                <h3 className="text-lg font-serif font-bold text-[#d4af37]">3. सूर्य अर्घ्य व 12 सूर्य नाम (शुद्ध हिंदी पाठ)</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {isSequentialPlaying ? (
                  <button 
                    onClick={stopSequentialSuryaNames}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow cursor-pointer animate-pulse"
                  >
                    <Square size={14} /> रोकें (Stop)
                  </button>
                ) : (
                  <button 
                    onClick={startSequentialSuryaNames}
                    className="text-xs bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-[#030a08] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow hover:brightness-110 cursor-pointer"
                  >
                    <Play size={14} /> सभी 12 नाम क्रमवार सुनें
                  </button>
                )}
                <button 
                  onClick={() => {
                    const text = PURE_SURYA_NAMES_AUDIO[suryaIndex];
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      const u = new SpeechSynthesisUtterance(text);
                      u.lang = 'hi-IN';
                      u.rate = 0.85;
                      u.pitch = voiceGender === 'female' ? 1.0 : 0.95;
                      const voices = window.speechSynthesis.getVoices();
                      const isFemale = voiceGender === 'female';
                      const fv = voices.find(v => {
                        const name = v.name.toLowerCase();
                        const lang = v.lang.toLowerCase();
                        if (!lang.includes('hi')) return false;
                        if (isFemale) return name.includes('female') || name.includes('google हिन्दी') || name.includes('hi-in-x-hie');
                        return name.includes('male') || name.includes('hemant');
                      }) || voices.find(v => v.lang.toLowerCase().includes('hi')) || voices[0];
                      if (fv) u.voice = fv;
                      window.speechSynthesis.speak(u);
                    }
                  }}
                  className="text-xs bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Volume2 size={14} /> वर्तमान नाम
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-300 mb-4">
              प्रातःकाल तांबे के लड़े में जल, रोली, अक्षत और लाल फूल लेकर सूर्य नारायण को अर्घ्य दें और 12 नामों का स्मरण करें:
            </p>

            <div className="bg-[#030a08] p-5 rounded-xl border border-[#d4af37]/30 relative overflow-hidden">
              {isSequentialPlaying && (
                <div className="absolute top-2 right-3 text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> क्रमिक पाठ जारी है...
                </div>
              )}

              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-[#d4af37] font-bold uppercase tracking-wider">
                  नाम {TWELVE_SURYA_NAMES[suryaIndex].number} / 12 • {TWELVE_SURYA_NAMES[suryaIndex].transliteration}
                </span>
                <span className="text-xs bg-[#d4af37]/20 text-[#fef08a] px-2.5 py-0.5 rounded-full font-bold">
                  {TWELVE_SURYA_NAMES[suryaIndex].philosophicalSignificance}
                </span>
              </div>
              
              <p className="text-lg font-serif font-bold text-[#fef08a] text-center my-2">
                {TWELVE_SURYA_NAMES[suryaIndex].mantra}
              </p>
              <p className="text-xs text-gray-300 text-center">
                {TWELVE_SURYA_NAMES[suryaIndex].hindiMeaning}
              </p>

              <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/10">
                <button
                  disabled={suryaIndex === 0 || isSequentialPlaying}
                  onClick={() => setSuryaIndex(prev => Math.max(0, prev - 1))}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 disabled:opacity-30 border border-white/10 text-gray-300 cursor-pointer"
                >
                  ← पिछला नाम
                </button>
                <div className="flex gap-1">
                  {TWELVE_SURYA_NAMES.map((_, i) => (
                    <div 
                      key={i} 
                      onClick={() => !isSequentialPlaying && setSuryaIndex(i)}
                      className={cn(
                        "w-2 h-2 rounded-full cursor-pointer transition-all",
                        suryaIndex === i ? "bg-[#d4af37] w-5" : "bg-white/20"
                      )}
                    />
                  ))}
                </div>
                <button
                  disabled={suryaIndex === TWELVE_SURYA_NAMES.length - 1 || isSequentialPlaying}
                  onClick={() => setSuryaIndex(prev => Math.min(TWELVE_SURYA_NAMES.length - 1, prev + 1))}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 disabled:opacity-30 border border-white/10 text-gray-300 cursor-pointer"
                >
                  अगला नाम →
                </button>
              </div>
            </div>
          </div>


          {/* SECTION 4: वार-विशेष इष्ट मंत्र (Day-Specific Deity Card) */}
          <div className="bg-[#051710] border border-[#d4af37]/30 rounded-2xl p-5 sm:p-6 shadow-md relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleStep('deity_card')}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                    completedSteps.includes('deity_card') ? "bg-[#d4af37] text-[#030a08] border-[#d4af37]" : "bg-gray-800 text-gray-400 border-gray-700"
                  )}
                >
                  {completedSteps.includes('deity_card') ? <CheckCircle2 size={18} /> : "4"}
                </button>
                <h3 className="text-lg font-serif font-bold text-[#d4af37]">4. वार-विशेष इष्ट मंत्र साधना ({currentDeity.day})</h3>
              </div>
              <button 
                onClick={() => SpeechEngine.speak(`${currentDeity.deity} का मंत्र। ${currentDeity.mantra}। ${currentDeity.meaning}`, 'Hindi', { preferredGender: voiceGender, rate: 0.85, pitch: voiceGender === 'female' ? 1.0 : 0.95 })}
                className="text-xs bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Volume2 size={14} /> इष्ट मंत्र सुनें
              </button>
            </div>

            <div className="bg-[#030a08] p-5 rounded-xl border border-white/10 text-center">
              <p className="text-xs text-[#d4af37] uppercase font-bold tracking-widest mb-1">आज के अधिष्ठाता देवता: {currentDeity.deity}</p>
              <p className={`text-xl font-serif font-bold my-2 ${currentDeity.color}`}>
                "{currentDeity.mantra}"
              </p>
              <p className="text-xs text-gray-300">
                <strong>फल / महत्व:</strong> {currentDeity.meaning}
              </p>
            </div>
          </div>


          {/* SECTION 5: दैनिक वैदिक संकल्प जनरेटर */}
          <div className="bg-[#051710] border border-[#d4af37]/30 rounded-2xl p-5 sm:p-6 shadow-md relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleStep('vedic_sankalpa')}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                    completedSteps.includes('vedic_sankalpa') ? "bg-[#d4af37] text-[#030a08] border-[#d4af37]" : "bg-gray-800 text-gray-400 border-gray-700"
                  )}
                >
                  {completedSteps.includes('vedic_sankalpa') ? <CheckCircle2 size={18} /> : "5"}
                </button>
                <h3 className="text-lg font-serif font-bold text-[#d4af37]">5. दैनिक वैदिक संकल्प जनरेटर (जितेन्द्र सूर्यवंशी)</h3>
              </div>
              <button 
                onClick={() => SpeechEngine.speak(vedicSankalpaText, 'Hindi', { preferredGender: voiceGender, rate: 0.85, pitch: voiceGender === 'female' ? 1.0 : 0.95 })}
                className="text-xs bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Volume2 size={14} /> संकल्प पाठ सुनें
              </button>
            </div>

            <div className="bg-[#030a08] p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-xs text-[#d4af37] font-bold">
                <Calendar size={14} /> आज की तिथि: {formattedDateStr} ({dayNameHindi})
              </div>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-serif italic">
                "{vedicSankalpaText}"
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                <span>जातक: जितेन्द्र सूर्यवंशी (मिथुन लग्न / मकर राशि)</span>
                <span className="text-[#d4af37]">✓ सिद्ध संकल्प</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Summary & Completion */}
        <div className="mt-8 pt-6 border-t border-[#d4af37]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#d4af37]/10 rounded-2xl text-[#d4af37]">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">कुल पूर्णता: {completedSteps.length} / 5 अनुष्ठान</p>
              <p className="text-xs text-gray-400">दैनिक प्रातः संस्कार से मानसिक शांति व आध्यात्मिक उन्नति होती है।</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (completedSteps.length === STEPS.length) {
                showToast('आज के सभी प्रातः संस्कार पूर्ण हो चुके हैं! उत्कृष्ट साधना। 🙏');
              } else {
                showToast('सभी 5 चरण पूरे करने के बाद अनुष्ठान पूर्ण माना जाएगा।');
              }
            }}
            className={cn(
              "px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg cursor-pointer",
              completedSteps.length === STEPS.length 
                ? "bg-green-600 text-white shadow-green-900/30" 
                : "bg-[#d4af37] text-[#030a08]"
            )}
          >
            {completedSteps.length === STEPS.length ? '✓ आज की साधना संपन्न' : `${5 - completedSteps.length} चरण शेष`}
          </button>
        </div>

      </CarvedCard>
    </div>
  );
}
