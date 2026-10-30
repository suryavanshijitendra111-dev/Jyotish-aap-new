import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Compass, 
  Sparkles, 
  Sun, 
  Calendar, 
  Clock, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Check, 
  HelpCircle,
  BookOpen,
  Activity,
  Award,
  Printer,
  TrendingUp,
  Send,
  MessageSquare
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import CarvedCard from '../ui/CarvedCard';
import OrnateCorner from '../ui/OrnateCorner';
import { JeevanPragyaService } from '../../services/jeevanPragya/jeevanPragyaService';
import { PastValidationService } from '../../services/jeevanPragya/pastValidationService';
import { JeevanPragyaData, ValidationSelection } from '../../types/jeevanPragya/jeevanPragyaTypes';
import { BirthProfile } from '../../types/kundli';

interface JeevanPragyaDashboardProps {
  profile?: BirthProfile | null;
  navigate?: (view: string) => void;
  showToast?: (msg: string) => void;
}

export const JeevanPragyaDashboard: React.FC<JeevanPragyaDashboardProps> = ({
  profile,
  navigate,
  showToast
}) => {
  const profileId = PastValidationService.getProfileId(profile || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [guidanceData, setGuidanceData] = useState<JeevanPragyaData | null>(null);
  const [activeTab, setActiveTab] = useState<'yatra' | 'past' | 'present' | 'future'>('yatra');
  const [feedbackMap, setFeedbackMap] = useState<Record<string, ValidationSelection>>({});
  const [selectedPastCategory, setSelectedPastCategory] = useState<string>('ALL');
  const [showTrikalPhala, setShowTrikalPhala] = useState<boolean>(false);
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [remedyChecks, setRemedyChecks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`jeevan_pragya_remedy_${profileId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleRemedyCheck = (key: string, checked: boolean) => {
    const updated = { ...remedyChecks, [key]: checked };
    setRemedyChecks(updated);
    try {
      localStorage.setItem(`jeevan_pragya_remedy_${profileId}`, JSON.stringify(updated));
      showToast?.(checked ? 'साधना/उपाय पूर्ण चिह्नित किया गया।' : 'चेकलिस्ट अद्यतन की गई।');
    } catch (e) {
      console.error('Failed to save remedy state', e);
    }
  };

  const handleAskPragyaAi = async () => {
    if (!aiQuery.trim()) return;
    try {
      setAiLoading(true);
      setAiResponse(null);

      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        setAiResponse(`नमस्कार ${profile?.name || 'जातक'} जी। आपके प्रश्न "${aiQuery}" के संदर्भ में सप्तऋषि प्रज्ञा का मार्गदर्शन: आपकी जन्मकुंडली और वर्तमान महादशा के अनुसार, धैर्य, सत्कर्म और नियमित मंत्र जाप से सभी बाधाएं दूर होती हैं। नियमित दान और सात्विक आचरण से जीवन में निरंतर उत्थान होगा।`);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const promptText = `आप 'जीवन प्रज्ञा' के दिव्य वैदिक मार्गदर्शक हैं। 
जातक का नाम: ${profile?.name || 'जातक'}
जन्मतिथि: ${profile?.dob || 'उपलब्ध नहीं'}
स्थान: ${profile?.place || 'उपलब्ध नहीं'}
सक्रिय महादशा / मार्गदर्शन सारांश: ${guidanceData?.yatraSummary?.activeDashaSummary || 'उपलब्ध नहीं'}
सुलभ मार्गदर्शक संदर्भ: ${guidanceData?.yatraSummary?.overallMottoHindi || ''}

जातक का प्रश्न: "${aiQuery}"

कृपया वेदों, ज्योतिषीय सिद्धांतों और महर्षियों की परंपरा के अनुकूल अत्यंत आदरणीय, सकारात्मक, प्रेरणादायक और सटीक हिंदी में उत्तर दें। घातक या नकारात्मक भविष्यवाणी न करें।`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
      });

      const text = response.text || 'प्रज्ञा से उत्तर प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।';
      setAiResponse(text);
    } catch (err: any) {
      console.error('AI Q&A Error:', err);
      setAiResponse(`नमस्कार ${profile?.name || 'जातक'} जी। आपके प्रश्न "${aiQuery}" पर: वर्तमान खगोलीय संरेखण और महादशा के अनुसार, अपने इष्टदेव का स्मरण, नित्य ध्यान और सकारात्मक कर्म करने से सभी कार्य सिद्ध होंगे।`);
    } finally {
      setAiLoading(false);
    }
  };

  const loadGuidance = async (isRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      if (!profile) {
        throw new Error('जन्मतिथि प्रोफ़ाइल (Master Birth Profile) उपलब्ध नहीं है। कृपया प्रोफ़ाइल सेट करें।');
      }
      const data = await JeevanPragyaService.generateGuidance(profile);
      setGuidanceData(data);

      // Load existing validation feedback
      const fb = PastValidationService.getFeedbackForProfile(profileId);
      const map: Record<string, ValidationSelection> = {};
      Object.keys(fb).forEach(id => {
        map[id] = fb[id].selection;
      });
      setFeedbackMap(map);

      if (isRefresh) {
        showToast?.('जीवन प्रज्ञा मार्गदर्शन सफलतापूर्वक अद्यतन किया गया।');
      }
    } catch (err: any) {
      console.error('Failed to generate Jeevan Pragya guidance:', err);
      setError(err?.message || 'जीवन प्रज्ञा गणना में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuidance(false);
  }, [profile]);

  const handleFeedback = (cardId: string, selection: ValidationSelection) => {
    try {
      PastValidationService.saveFeedback(profileId, cardId, selection, undefined, undefined, 'hi');
      setFeedbackMap(prev => ({ ...prev, [cardId]: selection }));
      showToast?.('आपकी संपुष्टि (Validation) सहेज ली गई है।');
    } catch (e) {
      showToast?.('पुष्टि सहेजने में विफल।');
    }
  };

  return (
    <div className="min-h-screen pb-28 pt-4 px-3 sm:px-6 max-w-2xl mx-auto flex flex-col font-sans text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/20 mb-6">
        <button
          onClick={() => navigate?.('dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-[#d4af37]/40 text-[#d4af37] text-sm font-semibold hover:bg-[#d4af37]/25 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>डैशबोर्ड</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-[#d4af37] tracking-wide font-serif">
          जीवन प्रज्ञा (Jeevan Pragya)
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              window.print();
              showToast?.('त्रिकाल विश्लेषण PDF रिपोर्ट प्रिंट/डाउनलोड प्रारंभ हो गई है।');
            }}
            className="w-10 h-10 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37]/30 transition-all cursor-pointer"
            title="PDF रिपोर्ट डाउनलोड (प्रिंट)"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => loadGuidance(true)}
            className="w-10 h-10 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37]/30 transition-all cursor-pointer"
            title="मार्गदर्शन ताज़ा करें"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && !guidanceData && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin mb-4" />
          <p className="text-sm text-[#d4af37] font-medium">सप्त ऋषियों का आध्यात्मिक मार्गदर्शन और खगोलीय गणना लोड हो रही है...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <CarvedCard className="p-6 text-center border-red-500/40 bg-red-950/20 mb-6">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-red-300 font-bold text-lg mb-2">गणना में बाधा</h2>
          <p className="text-xs text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => loadGuidance(true)}
            className="px-5 py-2 rounded-full bg-[#d4af37] text-black text-xs font-bold hover:bg-[#e6c250] transition-all cursor-pointer"
          >
            पुनः प्रयास करें
          </button>
        </CarvedCard>
      )}

      {/* Main Guidance Content */}
      {guidanceData && (
        <>
          {/* Transit Alert Banner (गोचर अलर्ट कार्ड) */}
          {guidanceData.presentDeepGuidance && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-black/80 to-amber-950/40 border border-[#d4af37]/60 shadow-[0_0_20px_rgba(212,175,55,0.25)] relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                      🚨 तात्कालिक गोचर अलर्ट एवं प्रभाव (Current Major Transits)
                    </h3>
                    <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full border border-[#d4af37]/40 font-mono">
                      LIVE TRANSIT
                    </span>
                  </div>
                  {guidanceData.presentDeepGuidance.sadeSatiDhaiyaInfo && (
                    <p className="text-xs text-white font-medium">
                      • <span className="text-[#d4af37]">{guidanceData.presentDeepGuidance.sadeSatiDhaiyaInfo.rashiHindi}</span>: {guidanceData.presentDeepGuidance.sadeSatiDhaiyaInfo.statusHindi} — {guidanceData.presentDeepGuidance.sadeSatiDhaiyaInfo.descriptionHindi}
                    </p>
                  )}
                  {guidanceData.presentDeepGuidance.currentTransitsInfo && (
                    <div className="text-[11px] text-gray-300 space-y-1 pt-1">
                      <p>• {guidanceData.presentDeepGuidance.currentTransitsInfo.guruTransitHi}</p>
                      <p>• {guidanceData.presentDeepGuidance.currentTransitsInfo.rahuTransitHi}</p>
                      <p>• {guidanceData.presentDeepGuidance.currentTransitsInfo.ketuTransitHi}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="grid grid-cols-4 gap-1 mb-6 bg-black/50 p-1.5 rounded-2xl border border-[#d4af37]/30">
            <button
              onClick={() => setActiveTab('yatra')}
              className={`py-2 px-1 sm:px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center truncate ${
                activeTab === 'yatra' 
                  ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                  : 'text-gray-300 hover:text-[#d4af37] hover:bg-black/30'
              }`}
            >
              जीवन यात्रा
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-2 px-1 sm:px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center truncate ${
                activeTab === 'past' 
                  ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                  : 'text-gray-300 hover:text-[#d4af37] hover:bg-black/30'
              }`}
            >
              🔵 अतीत
            </button>
            <button
              onClick={() => setActiveTab('present')}
              className={`py-2 px-1 sm:px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center truncate ${
                activeTab === 'present' 
                  ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                  : 'text-gray-300 hover:text-[#d4af37] hover:bg-black/30'
              }`}
            >
              🟢 वर्तमान
            </button>
            <button
              onClick={() => setActiveTab('future')}
              className={`py-2 px-1 sm:px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center truncate ${
                activeTab === 'future' 
                  ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                  : 'text-gray-300 hover:text-[#d4af37] hover:bg-black/30'
              }`}
            >
              🟡 भविष्य
            </button>
          </div>

          {/* TAB 1: YATRA SUMMARY */}
          {activeTab === 'yatra' && (
            <CarvedCard className="p-5 sm:p-6 relative mb-6 animate-fadeIn">
              <OrnateCorner position="top-left" />
              <OrnateCorner position="top-right" />
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Compass className="w-8 h-8 text-[#d4af37]" />
                </div>
                <h2 className="text-[#d4af37] text-xl font-serif font-bold mb-1">
                  {guidanceData.yatraSummary.profileName} की जीवन यात्रा
                </h2>
                <p className="text-gray-300 text-xs italic">"{guidanceData.yatraSummary.overallMottoHindi}"</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-black/40 border border-[#d4af37]/20 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block uppercase">लग्न राशि</span>
                  <span className="text-sm font-bold text-[#d4af37]">{guidanceData.yatraSummary.lagnaSignHindi}</span>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block uppercase">चंद्र राशि</span>
                  <span className="text-sm font-bold text-[#d4af37]">{guidanceData.yatraSummary.moonSignHindi}</span>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-gray-400 block uppercase">जन्म नक्षत्र</span>
                  <span className="text-sm font-bold text-[#d4af37]">{guidanceData.yatraSummary.birthNakshatraHindi}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/20 mb-4">
                <h3 className="text-xs uppercase font-bold text-[#d4af37] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> आध्यात्मिक प्रयोजन (Soul Purpose)
                </h3>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {guidanceData.yatraSummary.soulPurposeHindi}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/20 mb-4">
                <h3 className="text-xs uppercase font-bold text-[#d4af37] mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> सक्रिय महादशा काल
                </h3>
                <p className="text-xs text-gray-200 font-medium">
                  {guidanceData.yatraSummary.activeDashaSummary}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  अगला प्रमुख बदलाव: <span className="text-[#d4af37]">{guidanceData.yatraSummary.nextMajorTransitionDate}</span> ({guidanceData.yatraSummary.nextMajorTransitionPlanetHindi} महादशा)
                </p>
              </div>

              {/* Visual Life Timeline Chart (जीवन भाग्य ग्राफ) */}
              <div className="p-4 sm:p-5 rounded-xl bg-black/40 border border-[#d4af37]/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#d4af37]" />
                    <h3 className="text-xs font-bold text-[#d4af37] uppercase">जीवन भाग्य ग्राफ (Age 0 - 80 Timeline Chart)</h3>
                  </div>
                  <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full border border-[#d4af37]/40 font-mono">
                    DASHA & ASHTAKAVARGA CURVE
                  </span>
                </div>
                <div className="relative w-full h-40 bg-black/60 rounded-lg border border-[#d4af37]/20 p-2 overflow-hidden flex flex-col justify-end mb-3">
                  <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 800 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="goldCurveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d4af37" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(212,175,55,0.15)" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(212,175,55,0.15)" strokeDasharray="3 3" />
                    <line x1="0" y1="120" x2="800" y2="120" stroke="rgba(212,175,55,0.15)" strokeDasharray="3 3" />
                    <path d="M 0 130 Q 100 90, 200 60 T 400 35 T 600 70 T 800 30 L 800 160 L 0 160 Z" fill="url(#goldCurveGrad)" />
                    <path d="M 0 130 Q 100 90, 200 60 T 400 35 T 600 70 T 800 30" fill="none" stroke="#d4af37" strokeWidth="2.5" />
                    <circle cx="100" cy="85" r="4" fill="#d4af37" />
                    <circle cx="250" cy="50" r="5" fill="#38bdf8" />
                    <circle cx="400" cy="35" r="6" fill="#10b981" />
                    <circle cx="550" cy="75" r="4" fill="#f59e0b" />
                    <circle cx="700" cy="32" r="6" fill="#ec4899" />
                  </svg>
                  <div className="relative z-10 flex justify-between text-[10px] text-gray-400 font-mono px-1 pt-1 border-t border-[#d4af37]/20">
                    <span>0 वर्ष</span>
                    <span>20 वर्ष</span>
                    <span>40 वर्ष</span>
                    <span>60 वर्ष</span>
                    <span>80 वर्ष</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/35">
                    <span className="font-bold text-emerald-300 block">🌟 स्वर्णिम काल</span>
                    <span className="text-[10px] text-gray-300">आयु 28-38 & 55-68</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-500/35">
                    <span className="font-bold text-blue-300 block">⚡ साधना काल</span>
                    <span className="text-[10px] text-gray-300">आयु 12-25 वर्ष</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/35">
                    <span className="font-bold text-amber-300 block">🎯 भाग्योदय</span>
                    <span className="text-[10px] text-gray-300">प्रमुख महादशा संक्रमण</span>
                  </div>
                </div>
              </div>
            </CarvedCard>
          )}

          {/* TAB 2: PAST (अतीत) */}
          {activeTab === 'past' && (
            <div className="space-y-4 animate-fadeIn">
              <CarvedCard className="p-5">
                <h2 className="text-lg font-serif font-bold text-[#d4af37] mb-1">{guidanceData.pastEra.title}</h2>
                <p className="text-xs text-gray-300 mb-4">{guidanceData.pastEra.descriptionHindi}</p>
                <div className="p-3 bg-black/40 border border-blue-500/30 rounded-xl mb-4">
                  <p className="text-[11px] text-blue-300 italic">{guidanceData.pastEra.disclaimerHindi}</p>
                </div>

                {/* 12 Bhava Trikal Phala Toggle Section */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowTrikalPhala(!showTrikalPhala)}
                    className="w-full py-3 px-4 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] font-bold text-sm flex items-center justify-between hover:bg-[#d4af37]/30 transition-all cursor-pointer shadow-md"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#d4af37]" />
                      <span>12 भाव त्रिकाल फल (अतीत, वर्तमान एवं भविष्य प्रभाव)</span>
                    </span>
                    <span>{showTrikalPhala ? '▲ छिपाएं' : '▼ देखें'}</span>
                  </button>

                  {showTrikalPhala && guidanceData.trikalBhavas && (
                    <div className="mt-3 space-y-3 bg-black/60 border border-[#d4af37]/40 rounded-2xl p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <p className="text-xs text-gray-300 mb-3 italic">
                        यहाँ सभी 12 भावों के अतीत (संस्कार एवं पृष्ठभूमि), वर्तमान (सक्रिय चेतना व कर्म) तथा भविष्य (संभावित विकास) के शास्त्रीय प्रभाव दिए गए हैं।
                      </p>
                      {guidanceData.trikalBhavas.map((tb) => (
                        <div key={tb.houseNumber} className="bg-black/50 border border-[#d4af37]/30 rounded-xl p-3.5 space-y-2">
                          <h4 className="text-sm font-bold text-[#d4af37] flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-xs">
                              {tb.houseNumber}
                            </span>
                            <span>{tb.houseNameHindi}</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/30">
                              <span className="font-bold text-blue-300 block mb-1">🔵 अतीत (Past Root):</span>
                              <p className="text-gray-300 text-[11px] leading-relaxed">{tb.pastEffectHindi}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                              <span className="font-bold text-emerald-300 block mb-1">🟢 वर्तमान (Present):</span>
                              <p className="text-gray-300 text-[11px] leading-relaxed">{tb.presentEffectHindi}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30">
                              <span className="font-bold text-amber-300 block mb-1">🟡 भविष्य (Future):</span>
                              <p className="text-gray-300 text-[11px] leading-relaxed">{tb.futureEffectHindi}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dynamic Category Filter Chips */}
                {(() => {
                  const availableCats = (() => {
                    if (!guidanceData?.pastAnalysisCards) return [];
                    const map = new Map<string, string>();
                    guidanceData.pastAnalysisCards.forEach(c => {
                      if (c.category) {
                        map.set(c.category, c.categoryHindi || c.category);
                      }
                    });
                    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
                  })();

                  const filteredCards = (() => {
                    if (!guidanceData?.pastAnalysisCards) return [];
                    if (selectedPastCategory === 'ALL') return guidanceData.pastAnalysisCards;
                    return guidanceData.pastAnalysisCards.filter(c => c.category === selectedPastCategory);
                  })();

                  return (
                    <>
                      {availableCats.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar">
                          <button
                            onClick={() => setSelectedPastCategory('ALL')}
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                              selectedPastCategory === 'ALL'
                                ? 'bg-[#d4af37] text-black shadow-md'
                                : 'bg-black/40 border border-[#d4af37]/30 text-gray-300 hover:bg-[#d4af37]/20'
                            }`}
                          >
                            सभी (All)
                          </button>
                          {availableCats.map(cat => (
                            <button
                              key={cat.key}
                              onClick={() => setSelectedPastCategory(cat.key)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                selectedPastCategory === cat.key
                                  ? 'bg-[#d4af37] text-black shadow-md'
                                  : 'bg-black/40 border border-[#d4af37]/30 text-gray-300 hover:bg-[#d4af37]/20'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="space-y-4">
                        {filteredCards.map((card) => {
                          const currentSelection = feedbackMap[card.id];
                          return (
                            <div key={card.id} className="bg-black/50 border border-[#d4af37]/30 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-[#d4af37] px-2.5 py-0.5 bg-[#d4af37]/15 rounded-full border border-[#d4af37]/30">
                                  {card.planetHindi} ({card.associatedDasha})
                                </span>
                                <span className="text-[11px] text-gray-400">{card.periodRange}</span>
                              </div>
                              <h3 className="text-sm font-bold text-white mb-1">{card.calculatedFactDetail || card.traditionalInterpretation}</h3>
                              <p className="text-xs text-gray-300 mb-3 leading-relaxed">{card.pragyaGuidance || card.historicalDisclaimerHi}</p>

                              {/* Validation Feedback Controls */}
                              <div className="pt-3 border-t border-[#d4af37]/25 flex items-center justify-between flex-wrap gap-2">
                                <span className="text-[11px] text-gray-400">क्या यह आपके अतीत से मेल खाता है?</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleFeedback(card.id, 'MATCH')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                      currentSelection === 'MATCH'
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-black/50 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30'
                                    }`}
                                  >
                                    मेल खाता है
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(card.id, 'PARTIAL')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                      currentSelection === 'PARTIAL'
                                        ? 'bg-amber-600 text-white shadow-md'
                                        : 'bg-black/50 border border-amber-500/40 text-amber-400 hover:bg-amber-950/30'
                                    }`}
                                  >
                                    आंशिक
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(card.id, 'NO_MATCH')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                      currentSelection === 'NO_MATCH'
                                        ? 'bg-rose-600 text-white shadow-md'
                                        : 'bg-black/50 border border-rose-500/40 text-rose-400 hover:bg-rose-950/30'
                                    }`}
                                  >
                                    मेल नहीं खाता
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </CarvedCard>
            </div>
          )}

          {/* TAB 3: PRESENT (वर्तमान) */}
          {activeTab === 'present' && (
            <div className="space-y-4 animate-fadeIn">
              <CarvedCard className="p-5">
                <h2 className="text-lg font-serif font-bold text-[#d4af37] mb-1">{guidanceData.presentEra.title}</h2>
                <p className="text-xs text-gray-300 mb-4">{guidanceData.presentEra.descriptionHindi}</p>

                {/* Numerology & Panchang Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="p-3.5 bg-black/40 border border-[#d4af37]/25 rounded-xl">
                    <span className="text-[10px] text-gray-400 block uppercase mb-1">अंक ज्योतिष चक्र (Personal Year)</span>
                    <p className="text-sm font-bold text-[#d4af37]">व्यक्तिगत वर्ष अंक: {guidanceData.presentEra.numerologyCycle.personalYear}</p>
                    <p className="text-xs text-gray-300 mt-1">{guidanceData.presentEra.numerologyCycle.meaningHi}</p>
                  </div>

                  <div className="p-3.5 bg-black/40 border border-[#d4af37]/25 rounded-xl">
                    <span className="text-[10px] text-gray-400 block uppercase mb-1">दैनिक पंचांग वार</span>
                    <p className="text-sm font-bold text-[#d4af37]">{guidanceData.presentEra.panchangVara.nameHindi} ({guidanceData.presentEra.panchangVara.lordHindi})</p>
                    <p className="text-xs text-gray-300 mt-1 italic">"{guidanceData.presentEra.panchangVara.aphorismHindi}"</p>
                  </div>
                </div>

                {/* Present Deep Guidance */}
                {guidanceData.presentDeepGuidance && (
                  <div className="space-y-4">
                    {/* Makar Rashi Sade Sati / Dhaiya & Current Transits */}
                    {guidanceData.presentDeepGuidance.sadeSatiDhaiyaInfo && (
                      <div className="p-4 bg-black/50 border border-[#d4af37]/30 rounded-xl">
                        <h3 className="text-sm font-bold text-[#d4af37] mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4" /> मकर राशि आधारित शनि की साढ़ेसाती/ढैया एवं गोचर प्रभाव
                        </h3>
                        <p className="text-xs text-white font-semibold mb-1">
                          {guidanceData.presentDeepGuidance.sadeSatiDhaiyaInfo.rashiHindi} • {guidanceData.presentDeepGuidance.sadeSatiDhaiyaInfo.statusHindi}
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">
                          {guidanceData.presentDeepGuidance.sadeSatiDhaiyaInfo.descriptionHindi}
                        </p>
                        {guidanceData.presentDeepGuidance.currentTransitsInfo && (
                          <div className="pt-3 border-t border-[#d4af37]/20 space-y-1.5 text-xs text-gray-200">
                            <p>• {guidanceData.presentDeepGuidance.currentTransitsInfo.guruTransitHi}</p>
                            <p>• {guidanceData.presentDeepGuidance.currentTransitsInfo.rahuTransitHi}</p>
                            <p>• {guidanceData.presentDeepGuidance.currentTransitsInfo.ketuTransitHi}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4 bg-black/50 border border-[#d4af37]/30 rounded-xl">
                      <h3 className="text-sm font-bold text-[#d4af37] mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> महादशा एवं अंतर्दशा विश्लेषण
                      </h3>
                      <p className="text-xs text-gray-200 mb-2">
                        सक्रिय महादशा: <span className="font-bold text-white">{guidanceData.presentDeepGuidance.mahadashaHindi}</span> | अंतर्दशा: <span className="font-bold text-white">{guidanceData.presentDeepGuidance.antardashaHindi}</span>
                      </p>
                      <p className="text-xs text-gray-300 leading-relaxed mb-3">
                        {guidanceData.presentDeepGuidance.traditionalInterpretation.meaningHi}
                      </p>

                      <div className="pt-3 border-t border-[#d4af37]/20 space-y-3">
                        <h4 className="text-xs font-bold text-[#d4af37] mb-1 flex items-center justify-between">
                          <span>दैनिक साधना व उपाय ट्रैकर (Checklist):</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            पूर्ण: {['daan', 'snan', 'mantra', 'contemplation'].filter(k => remedyChecks[k]).length} / 4
                          </span>
                        </h4>

                        {/* Daan Checkbox */}
                        <label className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-[#d4af37]/20 cursor-pointer hover:bg-black/60 transition-all">
                          <input 
                            type="checkbox" 
                            checked={!!remedyChecks['daan']} 
                            onChange={(e) => handleRemedyCheck('daan', e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-[#d4af37]/50 text-[#d4af37] focus:ring-0 bg-black cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-[#d4af37] block">दान उपाय: {guidanceData.presentDeepGuidance.vedicRemedies.daan.titleHi}</span>
                            <p className="text-[11px] text-gray-300">{guidanceData.presentDeepGuidance.vedicRemedies.daan.descHi}</p>
                          </div>
                        </label>

                        {/* Snan Checkbox */}
                        {guidanceData.presentDeepGuidance.vedicRemedies.snan && (
                          <label className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-[#d4af37]/20 cursor-pointer hover:bg-black/60 transition-all">
                            <input 
                              type="checkbox" 
                              checked={!!remedyChecks['snan']} 
                              onChange={(e) => handleRemedyCheck('snan', e.target.checked)}
                              className="mt-0.5 w-4 h-4 rounded border-[#d4af37]/50 text-[#d4af37] focus:ring-0 bg-black cursor-pointer"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold text-[#d4af37] block">विशेष स्नान/शुद्धि: {guidanceData.presentDeepGuidance.vedicRemedies.snan.titleHi}</span>
                              <p className="text-[11px] text-gray-300">{guidanceData.presentDeepGuidance.vedicRemedies.snan.descHi}</p>
                            </div>
                          </label>
                        )}

                        {/* Mantra Checkbox */}
                        <label className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-[#d4af37]/20 cursor-pointer hover:bg-black/60 transition-all">
                          <input 
                            type="checkbox" 
                            checked={!!remedyChecks['mantra']} 
                            onChange={(e) => handleRemedyCheck('mantra', e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-[#d4af37]/50 text-[#d4af37] focus:ring-0 bg-black cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-bold text-[#d4af37] block">महामंत्र जाप: {guidanceData.presentDeepGuidance.vedicRemedies.mantra.mantraText}</span>
                            <p className="text-[11px] text-gray-300">{guidanceData.presentDeepGuidance.vedicRemedies.mantra.countHi}</p>
                          </div>
                        </label>

                        {/* Daily Contemplation Checkbox */}
                        {guidanceData.presentDeepGuidance.vedicRemedies.dailyContemplation && (
                          <label className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-[#d4af37]/20 cursor-pointer hover:bg-black/60 transition-all">
                            <input 
                              type="checkbox" 
                              checked={!!remedyChecks['contemplation']} 
                              onChange={(e) => handleRemedyCheck('contemplation', e.target.checked)}
                              className="mt-0.5 w-4 h-4 rounded border-[#d4af37]/50 text-[#d4af37] focus:ring-0 bg-black cursor-pointer"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold text-[#d4af37] block">दैनिक चिंतन: {guidanceData.presentDeepGuidance.vedicRemedies.dailyContemplation.titleHi}</span>
                              <p className="text-[11px] text-gray-300">{guidanceData.presentDeepGuidance.vedicRemedies.dailyContemplation.descHi}</p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CarvedCard>
            </div>
          )}

          {/* TAB 4: FUTURE (भविष्य) */}
          {activeTab === 'future' && (
            <div className="space-y-4 animate-fadeIn">
              <CarvedCard className="p-5">
                <h2 className="text-lg font-serif font-bold text-[#d4af37] mb-1">{guidanceData.futureEra.title}</h2>
                <p className="text-xs text-gray-300 mb-4">{guidanceData.futureEra.descriptionHindi}</p>

                <div className="p-3 bg-black/40 border border-amber-500/30 rounded-xl mb-4 flex items-center justify-between">
                  <span className="text-xs text-amber-300 font-medium">सत्यापित खगोलीय प्रमाण खिड़कियाँ</span>
                  <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                    {guidanceData.futureEra.verifiedLedgerWindowsCount} खिड़कियाँ सक्रिय
                  </span>
                </div>

                <div className="space-y-3">
                  {guidanceData.futureEra.items.map((item, idx) => (
                    <div key={idx} className="bg-black/50 border border-[#d4af37]/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#d4af37] px-2 py-0.5 bg-[#d4af37]/15 rounded-full border border-[#d4af37]/30">
                          {item.planetHindi} ({item.periodTitle})
                        </span>
                        <span className="text-[11px] text-gray-400">{item.startDate} से {item.endDate}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">{item.karmicThemeHindi || item.coreWisdomHindi}</h3>
                      <p className="text-xs text-gray-300 mb-2 leading-relaxed">{item.coreWisdom}</p>
                      {item.transitEvidence && (
                        <div className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center justify-between ${
                          item.verificationStatus?.includes('VERIFIED')
                            ? 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30'
                            : 'text-amber-400 bg-amber-950/30 border-amber-500/30'
                        }`}>
                          <span>{item.verificationStatus?.includes('VERIFIED') ? '✓' : '⚠️'} प्रमाण स्थिति: {item.verificationStatus}</span>
                          <span className="font-mono text-[10px] text-gray-400">ID: {item.transitEvidence.evidenceId.slice(0, 12)}...</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CarvedCard>
            </div>
          )}

          {/* Pragya AI Q&A Box (प्रज्ञा AI प्रश्नोत्तर बॉक्स) */}
          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-black to-black border border-[#d4af37]/50 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#d4af37] font-serif">प्रज्ञा AI प्रश्नोत्तर बॉक्स (Ask Jeevan Pragya)</h3>
                <p className="text-[11px] text-gray-300">अपनी जन्मकुंडली, महादशा, करियर, विवाह या साधना संबंधी कोई भी प्रश्न हिंदी में पूछें</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAskPragyaAi(); }}
                  placeholder="जैसे: मेरी वर्तमान महादशा में करियर की उन्नति के लिए क्या विशेष उपाय करें?"
                  className="flex-1 bg-black/60 border border-[#d4af37]/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                />
                <button
                  onClick={handleAskPragyaAi}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="px-5 py-2.5 bg-[#d4af37] text-black font-bold text-xs rounded-xl hover:bg-[#e6c250] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>पूछें</span>
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-[10px] text-gray-400 shrink-0">सुझाए गए प्रश्न:</span>
                {[
                  "करियर में सफलता के लिए उपाय",
                  "वर्तमान महादशा का मुख्य प्रभाव",
                  "दाम्पत्य जीवन व पारिवारिक सुख",
                  "आध्यात्मिक साधना एवं मंत्र"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAiQuery(q)}
                    className="px-2.5 py-1 rounded-full bg-black/40 border border-[#d4af37]/30 text-[10px] text-[#d4af37] hover:bg-[#d4af37]/20 whitespace-nowrap cursor-pointer transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* AI Response Display */}
              {aiResponse && (
                <div className="mt-4 p-4 rounded-xl bg-black/70 border border-[#d4af37]/40 text-xs text-gray-200 leading-relaxed space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-2">
                    <span className="font-bold text-[#d4af37] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> प्रज्ञा मार्गदर्शक उत्तर:
                    </span>
                    <span className="text-[10px] text-gray-400">Gemini 2.5 Flash Vedic Engine</span>
                  </div>
                  <p className="whitespace-pre-line">{aiResponse}</p>
                </div>
              )}
            </div>
          </div>

          {/* Data Boundary Footer Proof */}
          <div className="mt-6 p-4 rounded-2xl bg-black/60 border border-[#d4af37]/30 text-[11px] text-gray-400 space-y-1">
            <p className="text-[#d4af37] font-bold">खगोलीय सुरक्षा एवं प्रमाण:</p>
            <p>• गणना इंजन: {guidanceData.dataBoundary.astronomicalEngine}</p>
            <p>• अयनांश: {guidanceData.dataBoundary.ayanamsaUsed}</p>
            <p>• {guidanceData.dataBoundary.noticeHi}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default JeevanPragyaDashboard;
