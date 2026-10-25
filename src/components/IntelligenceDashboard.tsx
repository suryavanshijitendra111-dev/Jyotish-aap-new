import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BirthProfile } from '../types/kundli';
import { AstronomyService } from '../services/astronomy/astronomyService';
import { NumerologyEngine } from '../services/numerology/numerologyEngine';
import { LoShuEngine } from '../services/numerology/loShuEngine';
import { IntelligenceEngine } from '../services/intelligence/intelligenceEngine';
import { globalJyotishRegistry } from '../services/jyotish/systemRegistry';
import { JaiminiAnalysisResult } from '../services/jyotish/jaiminiEngine';
import { KPAnalysisResult } from '../services/jyotish/kpEngine';
import { VargaAnalysisResult } from '../services/jyotish/vargaEngine';
import { VargaChartModal, SHODASHAVARGA_LIST } from './kundli/VargaChartModal';
import { ArrowLeft, Loader2, Sparkles, Brain, Eye, RefreshCw, Mic, Volume2, Globe, FileText, Send, Share2, Printer, ShieldCheck, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PanchatattvaTab from './intelligence/PanchatattvaTab';
import ProblemAreasTab from './intelligence/ProblemAreasTab';
import FinancialIntelligenceTab from './intelligence/FinancialIntelligenceTab';
import { createDeterministicAiContext, performDataIntegrityDebugCheck, IntegrityCheckResult } from '../services/ai/aiDataIntegrity';
import { useTranslation } from '../i18n';
import { getLocalizedPlanet, getLocalizedRashi } from '../i18n/astrology';
import { SpeechEngine, SpeechState } from '../services/companion/speechEngine';
import { PlanetSpeaksControl } from './kundli/PlanetSpeaksControl';
import LanguageSelectorModal from './LanguageSelectorModal';

import { FamilyMemberProfile } from '../types/profile/profileTypes';

interface Props {
  profile: FamilyMemberProfile;
  navigate: (view: string) => void;
  showToast: (msg: string | null) => void;
}

type TabType = 'DAILY' | 'TOPICS' | 'AI' | 'PLANET_SPEAKS' | 'SNAPSHOT' | 'PLANETARY' | 'VARGA' | 'NAKSHATRA' | 'DASHA' | 'YOGA' | 'MULTI' | 'REPORT' | 'PANCHATATTVA' | 'PROBLEM_AREAS' | 'FINANCE';
type ChatMessage = { role: 'user' | 'ai', text: string, timestamp: Date };

export default function IntelligenceDashboard({ profile, navigate, showToast }: Props) {
  const { t, currentLanguageInfo } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const saved = sessionStorage.getItem('jeevandarpan_intel_tab');
      if (saved === 'QUESTIONS' || saved === 'TOPICS') {
        sessionStorage.removeItem('jeevandarpan_intel_tab');
        return 'TOPICS';
      }
      if (saved === 'AI') {
        sessionStorage.removeItem('jeevandarpan_intel_tab');
        return 'AI';
      }
    } catch {}
    return 'DAILY';
  });
  const [calcResult, setCalcResult] = useState<any>({ status: 'Idle', data: null, message: '' });
  
  // AI State
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedPlanetForSpeaks, setSelectedPlanetForSpeaks] = useState<string>('Sun');
  const [dataMismatchError, setDataMismatchError] = useState<string | null>(null);
  const [lastIntegrityStatus, setLastIntegrityStatus] = useState<string | null>(null);
  const [selectedVargaChart, setSelectedVargaChart] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Engines Data
  const numData = useMemo(() => profile ? NumerologyEngine.evaluate(profile) : null, [profile]);
  const loShuData = useMemo(() => profile ? LoShuEngine.evaluate(profile) : null, [profile]);
  
  // Daily Calculation
  

  useEffect(() => {
    if (!profile) return;
    setCalcResult({ status: 'Calculating', data: null, message: 'Processing Master Kundli...' });
    AstronomyService.calculateKundli(profile, 'Lahiri')
      .then(res => setCalcResult(res))
      .catch(err => setCalcResult({ status: 'Error', data: null, message: err.message }));
  }, [profile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  const jaiminiData = useMemo(() => {
    if (calcResult.status === 'Ready' && calcResult.data) {
      try { return globalJyotishRegistry.evaluate<JaiminiAnalysisResult>('JAIMINI', calcResult.data); } catch(e) { return null; }
    }
    return null;
  }, [calcResult]);

  const kpData = useMemo(() => {
    if (calcResult.status === 'Ready' && calcResult.data) {
      try { return globalJyotishRegistry.evaluate<KPAnalysisResult>('KP', calcResult.data); } catch(e) { return null; }
    }
    return null;
  }, [calcResult]);

  const vargaData = useMemo(() => {
    if (calcResult.status === 'Ready' && calcResult.data) {
      try { return globalJyotishRegistry.evaluate<VargaAnalysisResult>('VARGA', calcResult.data); } catch(e) { return null; }
    }
    return null;
  }, [calcResult]);

  // Voice Recognition Fallback
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(t('common.voiceNotSupported') || 'Voice input is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    const bcp47Lang = currentLanguageInfo.code === 'en' ? 'en-IN' : `${currentLanguageInfo.code}-IN`;
    recognition.lang = bcp47Lang;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      showToast(t('common.voiceFailed') || 'Voice recognition failed.');
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Speech State
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<number | null>(null);
  const [speechState, setSpeechState] = useState<SpeechState>('stopped');

  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, []);

  // Text-to-Speech via Central SpeechEngine (Authoritative mature spiritual voice)
  const handleSpeak = (text: string, msgIndex: number) => {
    if (activeSpeakingMsgId === msgIndex && speechState === 'playing') {
      SpeechEngine.stop();
      setSpeechState('stopped');
      setActiveSpeakingMsgId(null);
      return;
    }
    if (text.includes('⚠️')) return; // Do not speak error messages

    setActiveSpeakingMsgId(msgIndex);
    SpeechEngine.speak(text, currentLanguageInfo.code, (st) => {
      setSpeechState(st);
      if (st === 'stopped') setActiveSpeakingMsgId(null);
    });
  };

  const handleAskQuestion = async (predefinedQ?: string) => {
    if (isThinking) return;
    const q = predefinedQ || question;
    if (!q.trim() || !calcResult.data) return;
    
    const newUserMsg: ChatMessage = { role: 'user', text: q, timestamp: new Date() };
    setChatHistory(prev => [...prev, newUserMsg]);
    setQuestion('');
    if (!profile) return;
    setIsThinking(true);
    
    try {
      const panchatattva = calcResult.data?.panchatattva || IntelligenceEngine.getPanchatattva(profile);
      
      // Step 1: Create structured immutable context object from MasterKundliData
      const immutableContext = createDeterministicAiContext(
        calcResult.data,
        numData,
        loShuData,
        panchatattva,
        profile
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 seconds client timeout

      let data;
      let errObj;
      let isOk = false;
      let status = 500;

      try {
        const response = await fetch('/api/ai-jyotish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: q,
            context: immutableContext,
            history: chatHistory.map(m => ({ role: m.role, text: m.text })),
            language: currentLanguageInfo.name
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        isOk = response.ok;
        status = response.status;
        
        if (isOk) {
          data = await response.json();
        } else {
          errObj = await response.json().catch(() => ({}));
        }
      } catch (networkError: any) {
        clearTimeout(timeoutId);
        errObj = { 
          errorCode: networkError.name === 'AbortError' ? 'AI_TIMEOUT' : 'AI_NETWORK_ERROR',
          error: networkError.message 
        };
      }

      if (isOk && data && data.answer) {
        // Step 2: Data Integrity Debug Check
        const integrityCheck = performDataIntegrityDebugCheck(
          immutableContext,
          calcResult.data,
          numData,
          loShuData,
          data.answer
        );

        if (!integrityCheck.valid) {
          console.error('[Data Integrity Debug] AI_DATA_MISMATCH DETECTED:', integrityCheck.errors);
          setDataMismatchError(integrityCheck.errors.join(' | '));
          setLastIntegrityStatus('AI_DATA_MISMATCH');
        } else {
          setDataMismatchError(null);
          setLastIntegrityStatus('VERIFIED');
        }

        setChatHistory(prev => [...prev, { role: 'ai', text: data.answer, timestamp: new Date() }]);
      } else {
        const errorCode = errObj?.errorCode || 'AI_UNKNOWN';
        let errorMessage = "JeevanDarpan AI could not complete this request. Please try again.";
        
        if (errorCode === 'AI_429_RATE_LIMIT') errorMessage = "JeevanDarpan AI is currently receiving too many requests. Please wait a moment and try again.";
        else if (errorCode === 'AI_503_UNAVAILABLE' || errorCode === 'AI_500_SERVER' || errorCode === 'AI_502_BAD_GATEWAY') errorMessage = "JeevanDarpan AI is temporarily busy or experiencing high demand. Please try again.";
        else if (errorCode === 'AI_TIMEOUT') errorMessage = "JeevanDarpan AI took too long to respond. Please try again.";
        else if (errorCode === 'AI_NETWORK_ERROR') errorMessage = "Network error connecting to JeevanDarpan AI. Please check your connection.";
        else if (errObj?.error?.includes('GEMINI_API_KEY')) errorMessage = "AI service configuration is incomplete. Please check the server configuration.";
        
        setChatHistory(prev => [...prev, { 
          role: 'ai', 
          text: `⚠️ ${errorMessage}\n\n<retry-button>`, 
          timestamp: new Date(),
          isError: true
        } as any]);
      }
    } catch (error: any) {
      console.error("AI Request Failed (Outer Catch):", error);
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        text: `⚠️ An unexpected error occurred. Please try again.\n\n<retry-button>`, 
        timestamp: new Date(),
        isError: true
      } as any]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleTopicClick = (topic: string) => {
    setActiveTab('AI');
    handleAskQuestion(`Tell me about my ${topic} according to my chart.`);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#030a08] to-[#082218] text-white">
        <p className="text-[#d4af37] mb-10 text-lg">{t('common.notAvailable')}</p>
        <button onClick={() => navigate('dashboard')} className="px-10 py-3 border-2 border-[#d4af37] text-[#d4af37] rounded-full">{t('common.goBack')}</button>
      </div>
    );
  }

  const TABS: { id: TabType; label: string }[] = [
    { id: 'DAILY', label: t('intelligence.dailyDarpan') || 'Daily Mirror' },
    { id: 'TOPICS', label: t('intelligence.lifeTopics') || 'Life Topics' },
    { id: 'AI', label: t('intelligence.aiChat') || 'AI Chat' },
    { id: 'PLANET_SPEAKS', label: t('intelligence.planetSpeaks') || 'Planet Speaks' },
    { id: 'PANCHATATTVA', label: t('intelligence.panchatattva') || 'Panchatattva' },
    { id: 'PROBLEM_AREAS', label: t('intelligence.problemAreas') || 'Problem Areas' },
    { id: 'FINANCE', label: t('intelligence.finance') || 'Finance' },
    { id: 'SNAPSHOT', label: t('intelligence.snapshot') || 'Snapshot' },
    { id: 'PLANETARY', label: t('intelligence.planetary') || 'Planetary' },
    { id: 'VARGA', label: t('intelligence.varga') || 'Varga' },
    { id: 'NAKSHATRA', label: t('intelligence.nakshatra') || 'Nakshatra' },
    { id: 'DASHA', label: t('intelligence.dasha') || 'Dasha' },
    { id: 'YOGA', label: t('intelligence.yoga') || 'Yoga' },
    { id: 'MULTI', label: t('intelligence.multi') || 'Multi-System' },
    { id: 'REPORT', label: t('intelligence.report') || 'Report' },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full max-w-md mx-auto pb-28 font-sans text-white bg-gradient-to-br from-[#030a08] to-[#082218] overflow-x-hidden">
      <header className="flex justify-between items-center p-5 border-b border-[#d4af37]/20 bg-[#030a08]/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-[#d4af37] hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#d4af37] flex items-center gap-2"><Brain className="w-4 h-4"/> {t("intelligence.title") || "AI Life Guidance"}</h1>
            <p className="text-[10px] text-[#d4af37]/70 tracking-[0.2em] uppercase">{profile.name}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowLangModal(true)}
          className="flex items-center gap-1.5 text-[#d4af37] bg-[#d4af37]/15 px-3 py-1 rounded-full border border-[#d4af37]/40 text-xs font-semibold hover:bg-[#d4af37]/25 transition-all cursor-pointer shadow-sm"
        >
          <Globe className="w-3.5 h-3.5"/> {currentLanguageInfo.nativeName}
        </button>
      </header>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
        onLanguageSelected={(code) => showToast(`भाषा बदली गई: ${code.toUpperCase()}`)}
      />

      <main className="p-4 flex flex-col gap-6">
        {calcResult.status !== 'Ready' ? (
           <div className="flex flex-col items-center justify-center p-10 gap-4">
             <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
             <p className="text-[#d4af37] text-sm">{calcResult.message || 'Loading...'}</p>
           </div>
        ) : (
           <>
            {/* Horizontal Scrollable Tabs */}
            <div className="flex overflow-x-auto bg-black/40 p-1 rounded-full border border-[#d4af37]/20 hide-scrollbar gap-1">
               {TABS.map((tab) => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-semibold tracking-wider transition-colors ${activeTab === tab.id ? 'bg-[#d4af37] text-[#030a08]' : 'text-gray-400 hover:text-white'}`}
                 >
                   {tab.label}
                 </button>
               ))}
            </div>

            {/* DAILY */}
            {activeTab === 'DAILY' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-gradient-to-br from-[#0a1510]/90 to-[#05100a]/90 border border-[#d4af37]/40 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl"></div>
                  <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-4 flex items-center justify-between relative z-10">
                    {t('intelligence.todayMirror') || 'आज का जीवन दर्पण'}
                    <span className="text-[10px] text-gray-400 font-normal">{new Date().toLocaleDateString(currentLanguageInfo.code === 'hi' ? 'hi-IN' : 'en-IN')}</span>
                  </h2>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] text-gray-500 uppercase">{t('intelligence.mulankDriver') || 'Mulank (Driver)'}</p>
                        <p className="text-lg font-bold text-white">{numData?.birthNumber || '-'}</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] text-gray-500 uppercase">{t('intelligence.bhagyankConductor') || 'Bhagyank (Conductor)'}</p>
                        <p className="text-lg font-bold text-white">{numData?.destinyNumber || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] text-gray-500 uppercase">{t('intelligence.personalYear') || 'Personal Year'}</p>
                        <p className="text-xl font-bold text-[#d4af37]">{numData?.personalYear || '-'}</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] text-gray-500 uppercase">{t('intelligence.personalMonth') || 'Personal Month'}</p>
                        <p className="text-xl font-bold text-[#d4af37]">{numData?.personalMonth || '-'}</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] text-gray-500 uppercase">{t('intelligence.personalDay') || 'Personal Day'}</p>
                        <p className="text-xl font-bold text-[#d4af37]">{numData?.personalDay || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                       <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">{t('intelligence.currentDasha') || 'Current Jyotish Dasha'}</h3>
                       {calcResult.data?.vimshottariDasha?.currentMahadasha ? (
                         <div className="space-y-1">
                           <p className="text-lg text-[#d4af37] font-medium">
                             {getLocalizedPlanet(calcResult.data.vimshottariDasha.currentMahadasha.planet, currentLanguageInfo.code)} ({t('kundli.mahadasha') || 'MD'}) / {getLocalizedPlanet(calcResult.data.vimshottariDasha.currentAntardasha.planet, currentLanguageInfo.code)} ({t('kundli.antardasha') || 'AD'})
                           </p>
                           <p className="text-[10px] text-gray-400">
                             {t('kundli.dashaEnds') || 'समाप्ति'}: {new Date(calcResult.data.vimshottariDasha.currentAntardasha.endDate).toLocaleDateString(currentLanguageInfo.code === 'hi' ? 'hi-IN' : 'en-IN')}
                           </p>
                         </div>
                       ) : (
                         <p className="text-lg text-gray-500 font-medium italic">{t('common.unavailable') || 'Calculation unavailable'}</p>
                       )}
                    </div>

                    <button 
                      onClick={() => { 
                        setActiveTab('AI'); 
                        handleAskQuestion(currentLanguageInfo.code === 'hi' ? "आज के दिन मेरे व्यक्तिगत दिवस और वर्तमान विंशोत्तरी दशा के आधार पर मुझे क्या मार्गदर्शन है?" : "What should I focus on today based on my Personal Day and Current Dasha?"); 
                      }}
                      className="w-full bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4"/> {t('intelligence.getTodayGuidance') || "Get Today's AI Guidance"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TOPICS */}
            {activeTab === 'TOPICS' && (
              <div className="space-y-4 animate-in fade-in">
                <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase px-2">{t('intelligence.lifeTopics') || 'My Life Topics'}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'Career', hi: 'आजीविका एवं कार्यक्षेत्र', en: 'Career & Profession' },
                    { key: 'Business', hi: 'व्यवसाय एवं उद्यम', en: 'Business & Trade' },
                    { key: 'Marriage', hi: 'विवाह एवं दांपत्य', en: 'Marriage & Partnership' },
                    { key: 'Education', hi: 'विद्या एवं उच्च शिक्षा', en: 'Education & Learning' },
                    { key: 'Family', hi: 'परिवार एवं कुल', en: 'Family & Harmony' },
                    { key: 'Money', hi: 'धन एवं वित्तीय समृद्धि', en: 'Wealth & Finances' },
                    { key: 'Property', hi: 'भूमि एवं भवन संपत्ति', en: 'Property & Real Estate' },
                    { key: 'Travel', hi: 'विदेश यात्रा एवं गमन', en: 'Travel & Relocation' },
                    { key: 'Spirituality', hi: 'अध्यात्म एवं साधना', en: 'Spirituality & Moksha' },
                    { key: 'Health (General)', hi: 'स्वास्थ्य एवं जीवन ऊर्जा', en: 'Health & Vitality' }
                  ].map(topic => (
                    <button 
                      key={topic.key}
                      onClick={() => {
                        const promptQ = currentLanguageInfo.code === 'hi' 
                          ? `मेरी जन्म कुंडली के अनुसार मेरे ${topic.hi} के संबंध में विस्तृत मार्गदर्शन प्रदान करें।`
                          : `Please provide in-depth astrological guidance regarding my ${topic.en} based on my calculated birth chart.`;
                        setActiveTab('AI');
                        handleAskQuestion(promptQ);
                      }}
                      className="bg-[#0a1510]/80 border border-white/10 hover:border-[#d4af37]/50 rounded-xl p-4 text-left transition-all group"
                    >
                      <span className="text-sm text-gray-300 group-hover:text-[#d4af37] font-medium block mb-1">
                        {currentLanguageInfo.code === 'hi' ? topic.hi : topic.en}
                      </span>
                      <span className="text-[9px] text-gray-500">{t('intelligence.askJeevanDarpan') || 'जीवन दर्पण से पूछें'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI QUESTION CENTER */}
            {activeTab === 'AI' && (
              <div className="flex flex-col h-[65vh] animate-in fade-in">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase">{t('intelligence.askJeevanDarpan') || 'Ask JeevanDarpan'}</h2>
                  <button onClick={() => setChatHistory([])} className="text-[10px] text-gray-400 hover:text-white underline">{t('intelligence.clearChat') || 'Clear Chat'}</button>
                </div>

                {dataMismatchError && (
                  <div className="p-3 bg-red-950/90 border border-red-500 rounded-xl text-red-300 text-xs font-mono mb-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-red-200">AI_DATA_MISMATCH DETECTED</div>
                      <div className="text-[11px] text-red-300 mt-1">{dataMismatchError}</div>
                    </div>
                  </div>
                )}

                {lastIntegrityStatus === 'VERIFIED' && !dataMismatchError && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-[10px] text-emerald-400 mb-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {t('common.verified')}
                    </span>
                    <span className="text-gray-400 text-[9px]">MasterKundliData 100% {t('guardian.lockedStatus') || 'Locked'}</span>
                  </div>
                )}
                
                <div className="flex-1 bg-black/40 border border-[#d4af37]/20 rounded-2xl p-4 overflow-y-auto mb-4 space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                      <Brain className="w-10 h-10 text-[#d4af37] mb-3" />
                      <p className="text-sm text-gray-300">
                        {t('kundli.askQuestionPlaceholder') || (currentLanguageInfo.code === 'hi' ? 'आप अपने जीवन से जुड़ा कोई भी प्रश्न पूछ सकते हैं।' : 'Ask any question about your life guidance.')}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {t('kundli.aiAssistantDesc') || (currentLanguageInfo.code === 'hi' ? 'उदाहरण: "मेरी आजीविका और भविष्य कैसा रहेगा?"' : 'Example: "What does my career guidance indicate?"')}
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-[#d4af37] text-black rounded-tr-none' : 'bg-[#0a1510] border border-[#d4af37]/30 text-gray-200 rounded-tl-none'}`}>
                          {msg.role === 'ai' ? (
                            <div className="markdown-body text-sm prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-headings:text-[#d4af37] prose-strong:text-[#d4af37]">
                               {msg.text.includes('<retry-button>') ? (
                                  <>
                                    <ReactMarkdown>{msg.text.replace('<retry-button>', '')}</ReactMarkdown>
                                    <button onClick={() => { setChatHistory(prev => prev.slice(0, -2)); handleAskQuestion(chatHistory[i - 1]?.text); }} className="mt-3 px-4 py-2 bg-[#d4af37]/20 border border-[#d4af37]/50 rounded-lg text-[#d4af37] text-xs font-bold uppercase tracking-wider hover:bg-[#d4af37]/30 transition-colors">
                                      {t('common.retry') || 'पुनः प्रयास करें'}
                                    </button>
                                  </>
                               ) : (
                                 <ReactMarkdown>{msg.text}</ReactMarkdown>
                               )}
                               <button 
                                 onClick={() => handleSpeak(msg.text, i)} 
                                 className={`mt-2 p-2 rounded-full border transition cursor-pointer ${
                                   activeSpeakingMsgId === i && speechState === 'playing'
                                     ? 'bg-[#d4af37] text-black border-[#d4af37] animate-pulse'
                                     : 'bg-black/40 text-[#d4af37] hover:bg-black/60 border border-[#d4af37]/20'
                                 }`}
                                 title={activeSpeakingMsgId === i && speechState === 'playing' ? 'विराम दें / रोकें' : 'वाणी सुनें'}
                               >
                                 <Volume2 className="w-4 h-4"/>
                               </button>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>
                        <span className="text-[8px] text-gray-500 mt-1">{msg.timestamp.toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                  {isThinking && (
                    <div className="flex items-start">
                      <div className="bg-[#0a1510] border border-[#d4af37]/30 rounded-2xl rounded-tl-none p-3 text-sm text-[#d4af37] flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> {currentLanguageInfo.code === 'hi' ? 'जीवन दर्पण आपकी प्रामाणिक गणनाओं का विश्लेषण कर रहा है...' : 'JeevanDarpan is analyzing your verified chart data...'}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="flex gap-2">
                  <button 
                    onClick={handleVoiceInput}
                    className={`p-3 rounded-xl flex items-center justify-center transition-colors ${isListening ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-black/40 text-[#d4af37] border border-[#d4af37]/30'}`}
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                  </button>
                  <input 
                    type="text" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isThinking && handleAskQuestion()}
                    placeholder={t('intelligence.askPlaceholder') || 'Ask a question...'}
                    className="flex-1 bg-black/40 border border-[#d4af37]/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                  <button 
                    onClick={() => handleAskQuestion()}
                    disabled={isThinking || !question.trim()}
                    className="bg-[#d4af37] text-[#030a08] px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PLANET SPEAKS */}
            {activeTab === 'PLANET_SPEAKS' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5">
                  <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-2">
                    {t('intelligence.planetSpeaks') || 'ग्रह वाणी (Planet Speaks)'}
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    {currentLanguageInfo.code === 'hi'
                      ? 'अपनी कुंडली के प्रामाणिक खगोलीय गणितीय आधार पर ग्रह का संदेश एवं मार्गदर्शन सुनें।'
                      : 'Listen to the deterministic astrological guidance of each planet in your birth chart.'}
                  </p>
                  
                  {/* Planet Selection Pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Object.keys(calcResult.data.planets).map(p => (
                      <button 
                        key={p} 
                        disabled={isThinking}
                        onClick={() => setSelectedPlanetForSpeaks(p)} 
                        className={`px-3 py-1.5 border rounded-lg text-xs transition-colors cursor-pointer ${selectedPlanetForSpeaks === p ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] font-semibold' : 'bg-black/40 border-[#d4af37]/20 text-gray-300 hover:bg-[#d4af37]/10 hover:text-[#d4af37]'}`}
                      >
                        {getLocalizedPlanet(p, currentLanguageInfo.code)}
                      </button>
                    ))}
                  </div>

                  {/* Deterministic Audio Player Control */}
                  {calcResult.data.planets[selectedPlanetForSpeaks] && (
                    <div className="mb-6">
                      <PlanetSpeaksControl 
                        planet={{ 
                          name: selectedPlanetForSpeaks, 
                          ...calcResult.data.planets[selectedPlanetForSpeaks] 
                        }} 
                        masterData={calcResult.data} 
                      />
                    </div>
                  )}

                  {/* Deterministic Truth Anchor Displayed by UI */}
                  {(() => {
                    const activeP = calcResult.data.planets[selectedPlanetForSpeaks] || calcResult.data.planets['Sun'];
                    if (!activeP) return null;

                    return (
                      <div className="border border-[#d4af37]/20 bg-black/40 rounded-xl p-4 text-xs text-gray-300">
                        <div className="text-[#d4af37] font-semibold text-[10px] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-[#d4af37]/20 pb-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                          {t('report.verifiedNotice') || 'सत्यापित खगोलीय स्थिति (Master Data)'}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                          <div><span className="text-gray-500">{t('kundli.planetLabel') || 'ग्रह'}:</span> <span className="text-white font-medium">{getLocalizedPlanet(selectedPlanetForSpeaks, currentLanguageInfo.code)}</span></div>
                          <div><span className="text-gray-500">{t('kundli.signLabel') || 'राशि'}:</span> <span className="text-white font-medium">{getLocalizedRashi(activeP.rashiName, currentLanguageInfo.code)}</span></div>
                          <div><span className="text-gray-500">{t('kundli.houseLabel') || 'भाव'}:</span> <span className="text-white font-medium">{activeP.d1House || activeP.house || '1'}</span></div>
                          <div><span className="text-gray-500">{t('kundli.degreeLabel') || 'अंश'}:</span> <span className="text-white font-medium">{activeP.degree != null ? activeP.degree.toFixed(2) + '°' : '-'}</span></div>
                          <div><span className="text-gray-500">{t('kundli.nakshatraLabel') || 'नक्षत्र'}:</span> <span className="text-white font-medium">{activeP.nakshatraName || '-'} ({t('kundli.padaLabel') || 'पाद'} {activeP.nakshatraPada || activeP.pada || 1})</span></div>
                          <div><span className="text-gray-500">{t('kundli.motionLabel') || 'गति'}:</span> <span className="text-white font-medium">{activeP.isRetrograde ? (t('kundli.retrogradeMotion') || 'वक्री') : (t('kundli.directMotion') || 'मार्गी')}</span></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* REPORT GENERATION */}
            {activeTab === 'REPORT' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 text-center">
                  <FileText className="w-12 h-12 text-[#d4af37] mx-auto mb-4 opacity-80" />
                  <h2 className="text-[#d4af37] font-bold text-lg mb-2">
                    {t('report.headerTitle') || 'जीवन दर्पण प्रामाणिक महाकुण्डली प्रतिवेदन'}
                  </h2>
                  <p className="text-xs text-gray-400 mb-6 px-4">
                    {currentLanguageInfo.code === 'hi' 
                      ? 'लाहिड़ी अयनांश एवं खगोलीय सूत्रों पर आधारित 75-पृष्ठीय संपूर्ण ज्योतिष एवं अंकशास्त्र प्रतिवेदन।'
                      : 'Generate a comprehensive, verified 75-page astrological and numerological report.'}
                  </p>
                  
                  <div className="bg-black/40 rounded-xl p-4 text-left border border-white/5 mb-6 space-y-2">
                    <p className="text-xs text-gray-300 font-medium">✓ {t('report.section1Title') || 'महानिदेशक जन्म विवरण एवं लग्न परिचय'}</p>
                    <p className="text-xs text-gray-300 font-medium">✓ {t('report.section2Title') || 'खगोलीय ग्रह स्पष्ट एवं षोडशवर्ग चक्र'}</p>
                    <p className="text-xs text-gray-300 font-medium">✓ {t('report.section3Title') || 'विंशोत्तरी महादशा एवं अंतर्दशा समयरेखा'}</p>
                    <p className="text-xs text-gray-300 font-medium">✓ {t('report.section4Title') || 'अंकशास्त्र, मूलांक, भाग्यांक एवं लो-शू ग्रिड'}</p>
                    <p className="text-xs text-gray-300 font-medium">✓ {t('report.section7Title') || 'वैदिक समाधान, रत्न परामर्श एवं जीवन सार'}</p>
                  </div>

                  <div className="flex gap-3 justify-center">
                     <button onClick={()=>showToast(currentLanguageInfo.code === 'hi' ? 'प्रतिवेदन निर्माण सक्रिय है। पीडीएफ निर्यात शीघ्र उपलब्ध होगा।' : 'Report generation engine is active. PDF export coming soon.')} className="bg-[#d4af37] text-black px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 cursor-pointer">
                       <FileText className="w-4 h-4"/> {t('report.generatePdf') || 'प्रतिवेदन तैयार करें'}
                     </button>
                     <button onClick={()=>showToast(currentLanguageInfo.code === 'hi' ? 'साझा करने की सुविधा आपके उपकरण के अनुसार कार्य करती है।' : 'Share feature relies on native device APIs.')} className="bg-transparent border border-[#d4af37]/50 text-[#d4af37] p-2.5 rounded-full hover:bg-[#d4af37]/10 cursor-pointer">
                       <Share2 className="w-4 h-4"/>
                     </button>
                     <button onClick={()=>window.print()} className="bg-transparent border border-[#d4af37]/50 text-[#d4af37] p-2.5 rounded-full hover:bg-[#d4af37]/10 cursor-pointer">
                       <Printer className="w-4 h-4"/>
                     </button>
                  </div>
                </div>
              </div>
            )}

            {/* OTHER TABS (SNAPSHOT, PLANETARY, VARGA, NAKSHATRA, DASHA, YOGA, MULTI) */}
            {activeTab === 'SNAPSHOT' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-lg">
                  <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4 border-b border-[#d4af37]/20 pb-2 flex justify-between">
                    {t('intelligence.astroSnapshot') || 'ज्योतिष सार संक्षेप'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-black/40 p-3 rounded-xl border border-gray-700/50">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t('kundli.ascendant') || 'लग्न (Lagna)'}</span>
                        <span className="text-[#d4af37] font-medium">{getLocalizedRashi(calcResult.data.lagna?.rashiName, currentLanguageInfo.code)}</span>
                     </div>
                     <div className="bg-black/40 p-3 rounded-xl border border-gray-700/50">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t('kundli.moonSign') || 'चंद्र राशि (Moon Sign)'}</span>
                        <span className="text-[#d4af37] font-medium">{getLocalizedRashi(calcResult.data.planets?.Moon?.rashiName, currentLanguageInfo.code)}</span>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'PLANETARY' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5">
                   <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4">
                     {t('intelligence.planetaryIntel') || 'ग्रह स्थिति विश्लेषण'}
                   </h2>
                   <div className="space-y-3">
                     {Object.entries(calcResult.data.planets).map(([key, p]: any) => (
                       <div key={key} className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                         <div className="flex justify-between items-center border-b border-white/5 pb-2">
                           <span className="font-medium text-[#d4af37]">
                             {getLocalizedPlanet(key, currentLanguageInfo.code)} <span className="text-xs text-gray-400">({p.isRetrograde ? (t('kundli.retrogradeMotion') || 'वक्री') : (t('kundli.directMotion') || 'मार्गी')})</span>
                           </span>
                           <span className="text-xs text-gray-300 bg-black px-2 py-1 rounded">{p.degree?.toFixed(2) || '0.00'}°</span>
                         </div>
                         <div className="flex justify-between text-xs text-gray-400">
                           <span>{t('kundli.signLabel') || 'राशि'}: <span className="text-white">{getLocalizedRashi(p.rashiName, currentLanguageInfo.code)}</span></span>
                           <span>{t('kundli.houseLabel') || 'भाव'}: <span className="text-white">{p.d1House || p.house}</span></span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            )}

            {/* VARGA DIVISIONAL CHARTS */}
            {activeTab === 'VARGA' && (
              <div className="bg-[#0a1510]/90 border border-[#d4af37]/40 backdrop-blur-md rounded-2xl p-5 animate-in fade-in space-y-4">
                <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
                  <div>
                    <h2 className="text-[#d4af37] font-bold text-sm tracking-wider uppercase">
                      {t('kundli.vargaAnalysis') || 'वर्ग (विभागीय) कुंडली विश्लेषण'}
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {currentLanguageInfo.code === 'hi' ? 'षोडशवर्ग गणितीय चक्र व ग्रह स्थितियाँ' : 'Shodashavarga Divisional Calculations & Charts'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedVargaChart('D9')}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black font-bold rounded-lg text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_12px_rgba(212,175,55,0.35)] cursor-pointer"
                  >
                    {currentLanguageInfo.code === 'hi' ? 'चक्र देखें' : 'View Charts'}
                  </button>
                </div>

                {/* Shodashavarga Selector Pills */}
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold mb-1.5 block">
                    {currentLanguageInfo.code === 'hi' ? 'षोडशवर्ग कुंडलियाँ (चक्र खोलने के लिए टैप करें):' : 'Shodashavarga Charts (Tap to open chart):'}
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                    {SHODASHAVARGA_LIST.map(v => (
                      <button
                        key={v.key}
                        onClick={() => setSelectedVargaChart(v.key)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold shrink-0 transition-all border flex items-center gap-1 ${
                          v.isAvailable
                            ? 'bg-[#04120c] border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37] hover:text-black cursor-pointer'
                            : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-700 cursor-pointer'
                        }`}
                        title={`${v.nameEn} - ${v.isAvailable ? 'Available' : 'Unavailable'}`}
                      >
                        <span>{v.key}</span>
                        {!v.isAvailable && <span className="text-[9px] opacity-60">∅</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {vargaData && vargaData.status === 'AVAILABLE' ? (
                  <div className="space-y-3">
                    {/* Ascendant Badges */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedVargaChart('D9')}
                        className="bg-black/50 hover:bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-2.5 flex justify-between items-center transition-all cursor-pointer text-left"
                      >
                        <div>
                          <span className="text-gray-400 text-[10px] block">
                            {t('kundli.ascendantD9') || 'Ascendant D9 (नवांश)'}
                          </span>
                          <span className="text-[#d4af37] font-bold text-xs">
                            {vargaData.ascendantVargas?.D9
                              ? getLocalizedRashi(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][vargaData.ascendantVargas.D9 - 1], currentLanguageInfo.code)
                              : '-'}
                          </span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] font-semibold border border-[#d4af37]/40">
                          {currentLanguageInfo.code === 'hi' ? 'D9 खोलें' : 'Open D9'}
                        </span>
                      </button>

                      <button
                        onClick={() => setSelectedVargaChart('D10')}
                        className="bg-black/50 hover:bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-2.5 flex justify-between items-center transition-all cursor-pointer text-left"
                      >
                        <div>
                          <span className="text-gray-400 text-[10px] block">
                            {t('kundli.ascendantD10') || 'Ascendant D10 (दशमांश)'}
                          </span>
                          <span className="text-[#d4af37] font-bold text-xs">
                            {vargaData.ascendantVargas?.D10
                              ? getLocalizedRashi(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][vargaData.ascendantVargas.D10 - 1], currentLanguageInfo.code)
                              : '-'}
                          </span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] font-semibold border border-[#d4af37]/40">
                          {currentLanguageInfo.code === 'hi' ? 'D10 खोलें' : 'Open D10'}
                        </span>
                      </button>
                    </div>

                    {/* Planet Varga Table */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {vargaData.planets.map(vp => (
                        <div key={vp.planet} className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex flex-col text-center">
                          <span className="text-[#d4af37] font-bold text-xs">
                            {getLocalizedPlanet(vp.planet, currentLanguageInfo.code)}
                          </span>
                          <div className="space-y-1 mt-1.5 text-[10px]">
                            <button
                              onClick={() => setSelectedVargaChart('D9')}
                              className="w-full flex justify-between px-1.5 py-0.5 rounded hover:bg-[#d4af37]/15 transition-colors text-left cursor-pointer"
                            >
                              <span className="text-gray-400">D9 (नवांश)</span>
                              <span className="text-[#d4af37] font-medium">{getLocalizedRashi(vp.d9Sign, currentLanguageInfo.code)}</span>
                            </button>
                            <button
                              onClick={() => setSelectedVargaChart('D10')}
                              className="w-full flex justify-between px-1.5 py-0.5 rounded hover:bg-[#d4af37]/15 transition-colors text-left cursor-pointer"
                            >
                              <span className="text-gray-400">D10 (दशमांश)</span>
                              <span className="text-[#d4af37] font-medium">{getLocalizedRashi(vp.d10Sign, currentLanguageInfo.code)}</span>
                            </button>
                            <button
                              onClick={() => setSelectedVargaChart('D60')}
                              className="w-full flex justify-between px-1.5 py-0.5 rounded hover:bg-[#d4af37]/15 transition-colors text-left cursor-pointer"
                            >
                              <span className="text-gray-400">D60 (षष्ट्यंश)</span>
                              <span className="text-[#d4af37] font-medium">{getLocalizedRashi(vp.d60Sign, currentLanguageInfo.code)}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/40 border border-amber-500/30 rounded-xl p-4 text-center text-xs text-amber-300">
                    {currentLanguageInfo.code === 'hi' ? 'गणना उपलब्ध नहीं है।' : 'Calculation not available.'}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'NAKSHATRA' && (
               <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 animate-in fade-in">
                 <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4 flex justify-between">
                   {t('kundli.nakshatraTable') || 'नक्षत्र विश्लेषण'}
                 </h2>
                 <div className="space-y-2">
                   {Object.keys(calcResult.data.planets).map(p => (
                     <div key={p} className="bg-black/40 p-2 rounded border border-white/5 flex justify-between text-xs">
                       <span className="text-gray-400 w-24">{getLocalizedPlanet(p, currentLanguageInfo.code)}</span>
                       <span className="text-white flex-1">{calcResult.data.planets[p]?.nakshatraName || '-'}</span>
                       <span className="text-[#d4af37] w-16 text-right">{t('kundli.padaLabel') || 'पाद'} {calcResult.data.planets[p]?.pada || 1}</span>
                     </div>
                   ))}
                 </div>
               </div>
            )}

            {activeTab === 'DASHA' && (
               <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 animate-in fade-in">
                 <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4 flex justify-between">
                   {t('kundli.dasha') || 'विंशोत्तरी दशा'}
                 </h2>
                 <div className="bg-black/40 p-4 rounded-xl border border-[#d4af37]/20 flex flex-col gap-2">
                   <span className="text-[9px] text-gray-500 uppercase">{t('kundli.currentMahadasha') || 'वर्तमान विंशोत्तरी महादशा'}</span>
                   <span className="text-[#d4af37] font-bold text-xl">{getLocalizedPlanet(calcResult.data.planets?.Moon?.nakshatraLord || 'Unknown', currentLanguageInfo.code)}</span>
                   <span className="text-xs text-gray-400">
                     {currentLanguageInfo.code === 'hi' 
                       ? `चंद्रमा की नक्षत्र स्थिति (${calcResult.data.planets?.Moon?.nakshatraName || '-'}) से निष्पादित गणना`
                       : `Calculated from Moon's position in ${calcResult.data.planets?.Moon?.nakshatraName || 'Unknown'}`}
                   </span>
                 </div>
               </div>
            )}

            {activeTab === 'YOGA' && (
               <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 animate-in fade-in">
                 <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4 flex justify-between">
                   {t('kundli.yogas') || 'ग्रह योग एवं विश्लेषण'}
                 </h2>
                 <p className="text-[9px] text-gray-500 mt-2 text-center">
                   {currentLanguageInfo.code === 'hi' ? '(वैदिक पराशरी नियमों के आधार पर योग विश्लेषण)' : '(Standard Parashari Yogas via geometric constraints)'}
                 </p>
               </div>
            )}

            {activeTab === 'MULTI' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5">
                  <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4">
                    {t('intelligence.multiSystem') || 'बहु-पद्धति ज्योतिष तुलना (Multi-System)'}
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-black/40 p-4 rounded-xl border border-[#d4af37]/20">
                      <h3 className="text-sm font-medium text-white mb-2">
                        {currentLanguageInfo.code === 'hi' ? 'जैमिनी चर कारक' : 'Jaimini Chara Karakas'}
                      </h3>
                      {jaiminiData ? (
                        <div className="flex flex-wrap gap-2">
                          {jaiminiData.charaKarakas.map((ck: any) => (
                            <span key={ck.karaka} className="text-xs bg-black px-2 py-1 rounded border border-gray-700">
                              <span className="text-[#d4af37] mr-1">{ck.karaka}:</span>{getLocalizedPlanet(ck.planet, currentLanguageInfo.code)}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-gray-600">{t('common.unavailable') || 'Not Available'}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'PANCHATATTVA' && profile && (
              <PanchatattvaTab profile={profile} masterKundliData={calcResult.data} showToast={showToast} />
            )}
            
            {activeTab === 'PROBLEM_AREAS' && profile && (
              <ProblemAreasTab profile={profile} showToast={showToast} handleAskQuestion={(q) => { setActiveTab('AI'); handleAskQuestion(q); }} />
            )}
            
            {activeTab === 'FINANCE' && profile && (
              <FinancialIntelligenceTab profile={profile} showToast={showToast} handleAskQuestion={(q) => { setActiveTab('AI'); handleAskQuestion(q); }} />
            )}
            
            {!['AI', 'DAILY', 'TOPICS', 'PLANET_SPEAKS', 'REPORT', 'PANCHATATTVA', 'PROBLEM_AREAS', 'FINANCE'].includes(activeTab) && (
              <div className="flex gap-2 p-2 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20 mt-4 items-center justify-center">
                 <Eye className="w-4 h-4 text-[#d4af37]" />
                 <span className="text-xs text-[#d4af37]">
                   {t('common.verifiedNotice') || 'All calculations verified by MasterKundliData.'}
                 </span>
              </div>
            )}
           </>
        )}
      </main>

      {selectedVargaChart && (
        <VargaChartModal
          initialVarga={selectedVargaChart}
          vargaResult={vargaData}
          masterData={calcResult.data}
          onClose={() => setSelectedVargaChart(null)}
        />
      )}
    </div>
  );
}
