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
  Award
} from 'lucide-react';
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [guidanceData, setGuidanceData] = useState<JeevanPragyaData | null>(null);
  const [activeTab, setActiveTab] = useState<'yatra' | 'past' | 'present' | 'future'>('yatra');
  const [feedbackMap, setFeedbackMap] = useState<Record<string, ValidationSelection>>({});
  const [selectedPastCategory, setSelectedPastCategory] = useState<string>('ALL');

  const profileId = PastValidationService.getProfileId(profile || null);

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

        <button
          onClick={() => loadGuidance(true)}
          className="w-10 h-10 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37]/30 transition-all cursor-pointer"
          title="मार्गदर्शन ताज़ा करें"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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

              <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/20">
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

                      <div className="pt-3 border-t border-[#d4af37]/20">
                        <h4 className="text-xs font-bold text-[#d4af37] mb-1">दैनिक साधना व उपाय:</h4>
                        <p className="text-xs text-gray-300 mb-1">• दान: {guidanceData.presentDeepGuidance.vedicRemedies.daan.titleHi} — {guidanceData.presentDeepGuidance.vedicRemedies.daan.descHi}</p>
                        <p className="text-xs text-gray-300">• महामंत्र: <span className="text-[#d4af37] font-bold">{guidanceData.presentDeepGuidance.vedicRemedies.mantra.mantraText}</span></p>
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
