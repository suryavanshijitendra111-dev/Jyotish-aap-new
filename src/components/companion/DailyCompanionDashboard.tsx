import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Bell, 
  Calendar, 
  Sun, 
  Compass, 
  Target, 
  Briefcase, 
  Coins, 
  Heart, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Database, 
  Moon, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Share2,
  X,
  Languages
} from 'lucide-react';
import { t } from '../../i18n';
import { BirthProfile, MasterKundliData } from '../../types/kundli';
import { 
  DailyCompanionData, 
  DailyCardType, 
  DailyCompanionTimeSlot, 
  DailyCompanionNotificationPreferences 
} from '../../types/dailyCompanion';
import { CompanionService } from '../../services/companion/companionService';
import { DailyCompanionEngine } from '../../services/companion/dailyCompanionEngine';
import { NotificationEngine } from '../../services/companion/notificationEngine';
import { SpeechEngine, SpeechState } from '../../services/companion/speechEngine';

interface DailyCompanionDashboardProps {
  profile: BirthProfile | null;
  navigate: (view: string) => void;
  showToast: (msg: string) => void;
  kundliData?: MasterKundliData | null;
}

export default function DailyCompanionDashboard({
  profile,
  navigate,
  showToast,
  kundliData
}: DailyCompanionDashboardProps) {
  // Target date selection
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [language, setLanguage] = useState<'Hindi' | 'English'>('Hindi');
  const [loading, setLoading] = useState<boolean>(true);
  const [companionData, setCompanionData] = useState<DailyCompanionData | null>(null);

  // Active time-of-day slot tab
  const [activeSlot, setActiveSlot] = useState<DailyCompanionTimeSlot>(() => {
    return DailyCompanionEngine.getCurrentTimeSlot();
  });

  // Filter category for 12 cards
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Overview' | 'Action' | 'Harmony' | 'Audit'>('all');

  // Expanded cards state for "Why / Astrological basis"
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Audio / TTS state
  const [speechState, setSpeechState] = useState<SpeechState>('stopped');
  const [activeSpeakingCard, setActiveSpeakingCard] = useState<string | null>(null);

  // Notification settings modal
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [notificationPrefs, setNotificationPrefs] = useState<DailyCompanionNotificationPreferences>(() => {
    return NotificationEngine.getPreferences();
  });

  // Verification audit modal
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  // 24 Dynamic Vedic Horas state
  const [horaFilter, setHoraFilter] = useState<'all' | 'day' | 'night'>('all');
  const [expandedHoraId, setExpandedHoraId] = useState<number | null>(null);

  // Fallback default profile if not passed
  const activeProfile: BirthProfile = profile || {
    name: 'Jitendra Suryavanshi',
    dob: '24 June 1986',
    time: '06:20 AM',
    place: 'Indore, MP',
    latitude: 22.7196,
    longitude: 75.8577,
    timezone: 'Asia/Kolkata'
  };

  // Load daily companion data on date/language/profile change with instant cache hydration
  useEffect(() => {
    let isMounted = true;

    // Check synchronous cache first to eliminate flicker
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const cacheKey = `${activeProfile.name}_${year}-${month}-${day}_${language}`;

    try {
      const stored = localStorage.getItem(`daily_companion_cache_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored) as DailyCompanionData;
        if (parsed && parsed.date && parsed.cards) {
          setCompanionData(parsed);
          setLoading(false);
        }
      } else {
        setLoading(true);
      }
    } catch (e) {
      setLoading(true);
    }

    CompanionService.getDailyGuidance(activeProfile, selectedDate, kundliData, language)
      .then(data => {
        if (isMounted) {
          setCompanionData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load companion guidance:', err);
        if (isMounted) {
          // Fallback to deterministic baseline
          const fallback = DailyCompanionEngine.generateDailyGuidance(activeProfile, selectedDate, kundliData, language);
          setCompanionData(fallback);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      SpeechEngine.stop();
    };
  }, [selectedDate, language, activeProfile.name]);

  // Audio Speech state listener
  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, []);

  const handleToggleAudio = (text: string, cardId: string) => {
    if (activeSpeakingCard === cardId && speechState === 'playing') {
      SpeechEngine.stop();
      setActiveSpeakingCard(null);
      setSpeechState('stopped');
      return;
    }

    setActiveSpeakingCard(cardId);
    SpeechEngine.speak(text, language, (st) => {
      setSpeechState(st);
      if (st === 'stopped') {
        setActiveSpeakingCard(null);
      }
    });
  };

  const handleListenFullDay = () => {
    if (!companionData) return;
    if (speechState === 'playing') {
      SpeechEngine.stop();
      setSpeechState('stopped');
      setActiveSpeakingCard(null);
      return;
    }

    const currentSlotMsg = companionData.timeSlotMessages[activeSlot];
    const coreCard = companionData.cards.core_message;
    const karma = companionData.todaysKarma;

    const fullScript = `
      ${currentSlotMsg.titleHindi}. 
      ${currentSlotMsg.greeting}. 
      ${currentSlotMsg.focusGuidance}. 
      आज का अमृत विचार: ${coreCard.practicalGuidance}. 
      आज का कर्म: ${karma.description}.
    `;

    setActiveSpeakingCard('full_day');
    SpeechEngine.speak(fullScript, language, (st) => {
      setSpeechState(st);
      if (st === 'stopped') setActiveSpeakingCard(null);
    });
  };

  const handleDateSelect = (offsetDays: number) => {
    SpeechEngine.stop();
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + offsetDays);
    setSelectedDate(newDate);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    SpeechEngine.stop();
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-').map(Number);
      const newDate = new Date(y, m - 1, d);
      setSelectedDate(newDate);
    }
  };

  const toggleCardExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveNotifications = (updated: DailyCompanionNotificationPreferences) => {
    setNotificationPrefs(updated);
    NotificationEngine.savePreferences(updated);
    showToast(language === 'Hindi' ? 'सूचना प्राथमिकताएं सुरक्षित की गईं।' : 'Notification settings saved.');
  };

  const handleTestNotification = async () => {
    if (!companionData) return;
    const res = await NotificationEngine.sendNotification(activeSlot, companionData, true);
    if (res.success) {
      showToast(language === 'Hindi' ? 'परीक्षण सूचना प्रेषित की गई!' : 'Test notification sent!');
    } else {
      showToast(res.reason || 'Notification error');
    }
  };

  const getCardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-5 h-5 text-[#d4af37]" />;
      case 'Target': return <Target className="w-5 h-5 text-emerald-400" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-amber-400" />;
      case 'Coins': return <Coins className="w-5 h-5 text-yellow-300" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-cyan-400" />;
      case 'Activity': return <Activity className="w-5 h-5 text-emerald-300" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-gold" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#d4af37]" />;
      case 'Database': return <Database className="w-5 h-5 text-indigo-400" />;
      case 'Moon': return <Moon className="w-5 h-5 text-purple-300" />;
      default: return <Sparkles className="w-5 h-5 text-[#d4af37]" />;
    }
  };

  // Card filter list
  const filteredCards = useMemo(() => {
    if (!companionData) return [];
    const all = Object.values(companionData.cards);
    if (categoryFilter === 'all') return all;
    return all.filter(c => c.category === categoryFilter);
  }, [companionData, categoryFilter]);

  // Dynamic 24-Hora filter list
  const filteredHoras = useMemo(() => {
    if (!companionData?.horaAnalysis?.horas) return [];
    if (horaFilter === 'day') return companionData.horaAnalysis.horas.filter(h => h.periodType === 'Day');
    if (horaFilter === 'night') return companionData.horaAnalysis.horas.filter(h => h.periodType === 'Night');
    return companionData.horaAnalysis.horas;
  }, [companionData, horaFilter]);

  const isToday = useMemo(() => {
    const today = new Date();
    return today.toDateString() === selectedDate.toDateString();
  }, [selectedDate]);

  const isTomorrow = useMemo(() => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    return tmr.toDateString() === selectedDate.toDateString();
  }, [selectedDate]);

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-28 font-sans min-h-screen text-white">
      {/* Top Sticky Header */}
      <header className="flex justify-between items-center p-4 border-b border-[#d4af37]/20 bg-[#030a08]/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              SpeechEngine.stop();
              navigate('dashboard');
            }}
            className="p-2 rounded-full bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors cursor-pointer"
            title={t('common.goBack')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#d4af37] leading-tight">{t('dailyCompanion.title')}</h1>
            <p className="text-[10px] text-gray-400 tracking-wider">{t('dailyCompanion.subtitle')} • {t('dailyCompanion.phase')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pratah Sanskar Quick Navigation */}
          <button
            onClick={() => navigate('pratah_sanskar')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-[#d4af37]/60 bg-[#0d2a1f] text-[#fef08a] hover:bg-[#133d2c] transition-all cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)]"
            title={t('pratah.title')}
          >
            <Sun className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="font-semibold hidden sm:inline">{t('pratah.title')}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(prev => prev === 'Hindi' ? 'English' : 'Hindi')}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#d4af37]/40 bg-[#0a1510] text-[#d4af37] hover:bg-[#d4af37]/15 transition-all cursor-pointer"
            title={t('common.language')}
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="font-semibold">{language === 'Hindi' ? 'EN' : 'हिन्दी'}</span>
          </button>

          {/* Master Audio Listen Button */}
          <button
            onClick={handleListenFullDay}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              activeSpeakingCard === 'full_day' && speechState === 'playing'
                ? 'bg-[#d4af37] text-[#030a08] border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.6)] animate-pulse'
                : 'bg-[#0a1510] text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37]/20'
            }`}
            title={t('voice.listen') || 'Listen'}
          >
            {activeSpeakingCard === 'full_day' && speechState === 'playing' ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Notification Preferences Button */}
          <button
            onClick={() => setShowNotificationModal(true)}
            className="p-2 rounded-lg border border-[#d4af37]/40 bg-[#0a1510] text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer relative"
            title={t('dailyCompanion.notifications')}
          >
            <Bell className="w-4 h-4" />
            {notificationPrefs.enabled && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>
      </header>

      <main className="p-4 flex flex-col gap-5">
        {/* Date Selector Bar */}
        <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleDateSelect(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isToday 
                  ? 'bg-[#d4af37] text-[#030a08] shadow-sm font-bold' 
                  : 'bg-black/30 text-gray-300 hover:text-[#d4af37] border border-white/5'
              }`}
            >
              आज (Today)
            </button>
            <button
              onClick={() => handleDateSelect(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isTomorrow 
                  ? 'bg-[#d4af37] text-[#030a08] shadow-sm font-bold' 
                  : 'bg-black/30 text-gray-300 hover:text-[#d4af37] border border-white/5'
              }`}
            >
              कल (Tomorrow)
            </button>
          </div>

          <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/10">
            <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
            <input
              type="date"
              value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
              onChange={handleCustomDateChange}
              className="bg-transparent text-xs text-[#d4af37] font-medium outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Master Profile & Verified Context Pill Bar */}
        {companionData && (
          <div className="bg-gradient-to-br from-[#082218] via-[#0b281d] to-[#04120c] border border-[#d4af37]/40 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-start justify-between relative z-10 mb-3">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Verified Master Birth Profile
                </span>
                <h2 className="text-xl font-bold text-white mt-1.5 tracking-wide">
                  {companionData.profile.name}
                </h2>
                <p className="text-xs text-[#d4af37]/80">
                  {companionData.formattedDate}
                </p>
              </div>

              <button
                onClick={() => setShowAuditModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] rounded-xl text-[11px] font-semibold border border-[#d4af37]/40 transition-all cursor-pointer"
                title={t('report.verifyAudit') || 'Audit'}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{t('report.auditBadge') || 'ऑडिट ट्रेल'}</span>
              </button>
            </div>

            {/* Micro Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-[11px] relative z-10">
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-gray-400 text-[10px] block">वार स्वामी</span>
                <span className="text-[#d4af37] font-semibold">{companionData.context.panchang.dayLordHindi}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-gray-400 text-[10px] block">पर्सनल डे</span>
                <span className="text-emerald-300 font-semibold">अंक {companionData.context.numerology.personalDay}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-gray-400 text-[10px] block">सक्रिय दशा</span>
                <span className="text-amber-300 font-semibold">{companionData.context.dasha.mahadasha}-{companionData.context.dasha.antardasha}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-gray-400 text-[10px] block">पंचतत्व</span>
                <span className="text-cyan-300 font-semibold">{companionData.context.panchatattva.dominant} प्रधान</span>
              </div>
            </div>
          </div>
        )}

        {/* 4 Time-of-Day Messages Section */}
        {companionData && (
          <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                <h3 className="text-sm font-bold text-[#d4af37] tracking-wide uppercase">
                  दैनिक प्रहर दर्शन (4 Time Slots)
                </h3>
              </div>
              <span className="text-[10px] text-gray-400">
                वर्तमान प्रहर: <strong className="text-emerald-400">{DailyCompanionEngine.getCurrentTimeSlot()}</strong>
              </span>
            </div>

            {/* Time Slot Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {(['morning', 'midday', 'evening', 'night'] as DailyCompanionTimeSlot[]).map((slot) => {
                const isSelected = activeSlot === slot;
                const isCurrent = DailyCompanionEngine.getCurrentTimeSlot() === slot;
                const slotTitle = slot === 'morning' ? 'प्रभात' : slot === 'midday' ? 'मध्याह्न' : slot === 'evening' ? 'संध्या' : 'रात्रि';

                return (
                  <button
                    key={slot}
                    onClick={() => {
                      SpeechEngine.stop();
                      setActiveSlot(slot);
                    }}
                    className={`py-2 px-1 rounded-xl text-center transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#030a08] font-bold shadow-md'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs block">{slotTitle}</span>
                    <span className={`text-[9px] block ${isSelected ? 'text-[#030a08]/80' : 'text-gray-500'}`}>
                      {slot === 'morning' ? '06-12' : slot === 'midday' ? '12-17' : slot === 'evening' ? '17-21' : '21-06'}
                    </span>
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0a1510]"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Time Slot Content */}
            {companionData.timeSlotMessages[activeSlot] && (
              <div className="bg-gradient-to-br from-[#061811] to-[#020b07] border border-[#d4af37]/25 rounded-2xl p-4 flex flex-col gap-3 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#d4af37]">
                      {companionData.timeSlotMessages[activeSlot].titleHindi}
                    </h4>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {companionData.timeSlotMessages[activeSlot].timeRange}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleAudio(
                      `${companionData.timeSlotMessages[activeSlot].titleHindi}. ${companionData.timeSlotMessages[activeSlot].greeting}. ${companionData.timeSlotMessages[activeSlot].focusGuidance}`,
                      `slot_${activeSlot}`
                    )}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      activeSpeakingCard === `slot_${activeSlot}` && speechState === 'playing'
                        ? 'bg-[#d4af37] text-[#030a08] border-[#d4af37] animate-pulse'
                        : 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30 hover:bg-[#d4af37]/25'
                    }`}
                    title="Speak this slot guidance"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-white font-medium bg-black/20 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                  {companionData.timeSlotMessages[activeSlot].greeting}
                </p>

                <div className="space-y-1.5 text-xs text-gray-200 leading-relaxed">
                  <p>
                    <strong className="text-emerald-400">मुख्य दिशा: </strong>
                    {companionData.timeSlotMessages[activeSlot].focusGuidance}
                  </p>
                  <p>
                    <strong className="text-amber-300">सजगता सूत्र: </strong>
                    {companionData.timeSlotMessages[activeSlot].mindfulnessTip}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 text-[10px] text-gray-400 flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-[#d4af37]" />
                  <span>आधार: {companionData.timeSlotMessages[activeSlot].whyBasis}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 24 Dynamic Vedic Horas Section (२४ गतिशील वैदिक होरा चक्र) */}
        {companionData?.horaAnalysis && (
          <div className="bg-[#0a1510]/90 border border-[#d4af37]/30 rounded-3xl p-3.5 sm:p-5 shadow-lg flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <h3 className="text-sm font-bold text-[#d4af37] tracking-wide uppercase truncate">
                    २४ गतिशील वैदिक होरा चक्र (Dynamic 24-Hora Timings)
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  स्थानीय सूर्योदय ({companionData.horaAnalysis.sunrise}) एवं सूर्यास्त ({companionData.horaAnalysis.sunset}) अनुसार शुद्ध दिनमान व रात्रिमान विभाजन
                </p>
              </div>

              {companionData.horaAnalysis.horas[companionData.horaAnalysis.currentHoraIndex] && (
                <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold self-start sm:self-auto shadow-sm shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>
                    सक्रिय: {companionData.horaAnalysis.horas[companionData.horaAnalysis.currentHoraIndex].lordHindi} होरा
                  </span>
                </div>
              )}
            </div>

            {/* Micro Metrics: Dinmaan, Ratriman, Sunrise, Sunset */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-gray-400 text-[10px] block">सूर्योदय (Sunrise)</span>
                <span className="text-amber-300 font-bold">{companionData.horaAnalysis.sunrise}</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-gray-400 text-[10px] block">सूर्यास्त (Sunset)</span>
                <span className="text-orange-300 font-bold">{companionData.horaAnalysis.sunset}</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-gray-400 text-[10px] block">दिनमान (Dinmaan)</span>
                <span className="text-emerald-300 font-bold">{companionData.horaAnalysis.dinmaanFormatted}</span>
                <span className="text-[9px] text-gray-500 block">({companionData.horaAnalysis.dayHoraDurationMinutes} मि./होरा)</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-gray-400 text-[10px] block">रात्रिमान (Ratriman)</span>
                <span className="text-indigo-300 font-bold">{companionData.horaAnalysis.ratrimanFormatted}</span>
                <span className="text-[9px] text-gray-500 block">({companionData.horaAnalysis.nightHoraDurationMinutes} मि./होरा)</span>
              </div>
            </div>

            {/* Filter Tabs: All 24 / Day 12 / Night 12 */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 text-xs overflow-x-auto max-w-full custom-scrollbar min-w-0">
              <button
                onClick={() => setHoraFilter('all')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-center text-xs font-semibold transition-all cursor-pointer ${
                  horaFilter === 'all'
                    ? 'bg-[#d4af37] text-[#030a08] font-bold shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                सभी २४ होरा
              </button>
              <button
                onClick={() => setHoraFilter('day')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-center text-xs font-semibold transition-all cursor-pointer ${
                  horaFilter === 'day'
                    ? 'bg-amber-400 text-[#030a08] font-bold shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                दिन की १२ होरा
              </button>
              <button
                onClick={() => setHoraFilter('night')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-center text-xs font-semibold transition-all cursor-pointer ${
                  horaFilter === 'night'
                    ? 'bg-indigo-400 text-[#030a08] font-bold shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                रात्रि की १२ होरा
              </button>
            </div>

            {/* Scrollable Hora Cards List */}
            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredHoras.map((hora) => {
                const isExpanded = expandedHoraId === hora.horaNumber;
                const isSpeaking = activeSpeakingCard === `hora_${hora.horaNumber}` && speechState === 'playing';

                const horaSpeechText = `
                  होरा संख्या ${hora.horaNumber}, ${hora.periodTypeHindi}. 
                  होरा स्वामी: ${hora.lordHindi}. 
                  समय: ${hora.startTime} से ${hora.endTime}. 
                  प्रकृति: ${hora.natureHindi}. 
                  अनुशंसित कार्य: ${hora.recommendedActivitiesHindi}. 
                  सावधानी: ${hora.cautionHindi}.
                `;

                return (
                  <div
                    key={hora.horaNumber}
                    className={`rounded-2xl border transition-all p-3 text-xs flex flex-col gap-2 ${
                      hora.isCurrent
                        ? 'bg-gradient-to-r from-[#0d2a1f] to-[#061811] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]/60'
                        : 'bg-black/30 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          hora.isCurrent 
                            ? 'bg-[#d4af37] text-black font-extrabold shadow-sm' 
                            : 'bg-white/5 text-gray-300 border border-white/10'
                        }`}>
                          {hora.horaNumber}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">
                              {hora.lordHindi}
                            </h4>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${
                              hora.nature === 'Shubha'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : hora.nature === 'Madhyam'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                            }`}>
                              {hora.natureHindi}
                            </span>
                            {hora.isCurrent && (
                              <span className="text-[9px] bg-emerald-500 text-black font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                                चालू (NOW)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {hora.periodTypeHindi} • {hora.startTime} - {hora.endTime} ({hora.durationMinutes} मिनट)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleAudio(horaSpeechText, `hora_${hora.horaNumber}`)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isSpeaking
                              ? 'bg-[#d4af37] text-[#030a08] border-[#d4af37] animate-pulse'
                              : 'bg-white/5 text-gray-300 border-white/10 hover:text-white hover:bg-white/10'
                          }`}
                          title="Speak hora guidance"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setExpandedHoraId(isExpanded ? null : hora.horaNumber)}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                          title="Expand details"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Summary row or expanded full details */}
                    {isExpanded ? (
                      <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px] leading-relaxed">
                        <p>
                          <strong className="text-emerald-300">शुभ कार्य: </strong>
                          <span className="text-gray-200">{hora.recommendedActivitiesHindi}</span>
                        </p>
                        <p>
                          <strong className="text-rose-300">सावधानी: </strong>
                          <span className="text-gray-300">{hora.cautionHindi}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-300 truncate">
                        <span className="text-emerald-400 font-semibold">शुभ कार्य: </span>
                        {hora.recommendedActivitiesHindi}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Tabs for the 12 Core Cards */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'सभी कार्ड (All 12)' },
            { id: 'Overview', label: 'दिन का सार (Overview)' },
            { id: 'Action', label: 'कर्म एवं निर्णय (Action)' },
            { id: 'Harmony', label: 'संबंध व स्वास्थ्य (Harmony)' },
            { id: 'Audit', label: 'गणितीय आधार (Audit)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer text-[11px] font-semibold ${
                categoryFilter === tab.id
                  ? 'bg-[#d4af37] text-[#030a08] shadow-sm'
                  : 'bg-[#0a1510] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 12 Core Guidance Cards List */}
        {loading ? (
          <div className="py-16 text-center text-[#d4af37] flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">दैनिक मार्गदर्शन की गणना की जा रही है...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredCards.map((card) => {
              const isExpanded = !!expandedCards[card.id];
              const isSpeaking = activeSpeakingCard === card.id && speechState === 'playing';

              const speakContent = `
                ${card.titleHindi}. 
                ${card.practicalGuidance}. 
                ${card.actionItem ? `आज का कदम: ${card.actionItem}` : ''}
              `;

              return (
                <div
                  key={card.id}
                  className="bg-[#0a1510]/90 border border-[#d4af37]/30 backdrop-blur-md rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col gap-3 transition-all hover:border-[#d4af37]/60"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center shrink-0">
                        {getCardIcon(card.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white tracking-wide">
                            {card.titleHindi}
                          </h3>
                          <span className="text-[9px] bg-[#d4af37]/10 text-[#d4af37] px-1.5 py-0.5 rounded-full border border-[#d4af37]/30 font-semibold">
                            {card.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {card.titleEnglish}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleAudio(speakContent, card.id)}
                        className={`p-2 rounded-full border transition-all cursor-pointer ${
                          isSpeaking
                            ? 'bg-[#d4af37] text-[#030a08] border-[#d4af37] animate-pulse'
                            : 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30 hover:bg-[#d4af37]/25'
                        }`}
                        title="Speak this card"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 1. Calculated Fact Badge (MANDATORY DETERMINISTIC DATA) */}
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-200 leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-0.5">
                        खगोलीय एवं अंकगणितीय तथ्य (Calculated Fact)
                      </span>
                      <span>{card.calculatedFact}</span>
                    </div>
                  </div>

                  {/* 2. Practical Guidance (CARING & ACTIONABLE) */}
                  <div className="space-y-2 text-xs text-gray-200 leading-relaxed">
                    <p className="text-[13px] font-medium text-white">
                      {card.practicalGuidance}
                    </p>
                    
                    {card.actionItem && (
                      <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-2.5 text-[#d4af37] flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 shrink-0" />
                        <span><strong>आज का कदम: </strong>{card.actionItem}</span>
                      </div>
                    )}

                    {card.quoteOrMantra && (
                      <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 text-center font-serif text-amber-200 text-xs italic">
                        {card.quoteOrMantra}
                      </div>
                    )}
                  </div>

                  {/* 3. Freewill & Uncertainty Notice (ETHICAL SAFETY) */}
                  <div className="text-[11px] text-gray-400 bg-black/20 p-2 rounded-xl border border-white/5 flex items-center gap-2">
                    <span className="text-amber-400 font-semibold text-[10px]">पुरुषार्थ एवं कर्म:</span>
                    <span>{card.uncertaintyAndFreewill}</span>
                  </div>

                  {/* 4. Collapsible "Why?" Astrological Basis */}
                  <div className="border-t border-white/10 pt-2">
                    <button
                      onClick={() => toggleCardExpand(card.id)}
                      className="flex items-center justify-between w-full text-[11px] text-[#d4af37] hover:underline font-semibold cursor-pointer py-1"
                    >
                      <span className="flex items-center gap-1.5">
                        <Database className="w-3 h-3" />
                        <span>{t('dailyCompanion.whyGuidance') || 'ज्योतिषीय एवं गणना आधार (Why this guidance?)'}</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 bg-black/40 rounded-xl border border-white/10 text-[11px] text-gray-300 space-y-2">
                        <p>
                          <strong className="text-[#d4af37]">पारंपरिक फलित सिद्धांत: </strong>
                          {card.traditionalInterpretation}
                        </p>
                        <p>
                          <strong className="text-emerald-400">ऑडिट प्रमाण: </strong>
                          {card.whyAstrologicalBasis}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Notification Preferences Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a1510] border border-[#d4af37]/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#d4af37]" />
                <h3 className="text-base font-bold text-[#d4af37]">दैनिक सूचना सेटिंग्स</h3>
              </div>
              <button 
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              जीवन दर्पण दैनिक साथी आपको प्रातः, दोपहर, संध्या और रात्रि के समय पर शांत और सौम्य स्मरण प्रदान करता है।
            </p>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-2xl border border-white/10">
              <div>
                <span className="text-sm font-semibold text-white block">दैनिक सूचनाएं सक्रिय रखें</span>
                <span className="text-[10px] text-gray-400">दैनिक प्रहर अनुसार सूचनाएं भेजें</span>
              </div>
              <input
                type="checkbox"
                checked={notificationPrefs.enabled}
                onChange={(e) => handleSaveNotifications({ ...notificationPrefs, enabled: e.target.checked })}
                className="w-5 h-5 accent-[#d4af37] cursor-pointer"
              />
            </div>

            {/* Time Slot Pickers */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">{t('dailyCompanion.notifications') || 'प्रहर समय सारणी'}</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/5">
                  <label className="text-[10px] text-gray-400 block mb-1">{t('dailyCompanion.morning')}</label>
                  <input
                    type="time"
                    value={notificationPrefs.morningTime}
                    onChange={(e) => handleSaveNotifications({ ...notificationPrefs, morningTime: e.target.value })}
                    className="bg-transparent text-xs text-white outline-none w-full cursor-pointer font-medium"
                  />
                </div>
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/5">
                  <label className="text-[10px] text-gray-400 block mb-1">{t('dailyCompanion.midday')}</label>
                  <input
                    type="time"
                    value={notificationPrefs.middayTime}
                    onChange={(e) => handleSaveNotifications({ ...notificationPrefs, middayTime: e.target.value })}
                    className="bg-transparent text-xs text-white outline-none w-full cursor-pointer font-medium"
                  />
                </div>
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/5">
                  <label className="text-[10px] text-gray-400 block mb-1">{t('dailyCompanion.evening')}</label>
                  <input
                    type="time"
                    value={notificationPrefs.eveningTime}
                    onChange={(e) => handleSaveNotifications({ ...notificationPrefs, eveningTime: e.target.value })}
                    className="bg-transparent text-xs text-white outline-none w-full cursor-pointer font-medium"
                  />
                </div>
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/5">
                  <label className="text-[10px] text-gray-400 block mb-1">{t('dailyCompanion.night')}</label>
                  <input
                    type="time"
                    value={notificationPrefs.nightTime}
                    onChange={(e) => handleSaveNotifications({ ...notificationPrefs, nightTime: e.target.value })}
                    className="bg-transparent text-xs text-white outline-none w-full cursor-pointer font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-2.5 p-3 bg-black/30 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">{t('dailyCompanion.quietHours')}</span>
                  <span className="text-[10px] text-gray-400">इस अवधि में सूचनाएं म्यूट रहेंगी</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.quietHoursEnabled}
                  onChange={(e) => handleSaveNotifications({ ...notificationPrefs, quietHoursEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                />
              </div>

              {notificationPrefs.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">आरंभ समय</label>
                    <input
                      type="time"
                      value={notificationPrefs.quietHoursStart}
                      onChange={(e) => handleSaveNotifications({ ...notificationPrefs, quietHoursStart: e.target.value })}
                      className="bg-transparent text-xs text-[#d4af37] outline-none cursor-pointer font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">समाप्ति समय</label>
                    <input
                      type="time"
                      value={notificationPrefs.quietHoursEnd}
                      onChange={(e) => handleSaveNotifications({ ...notificationPrefs, quietHoursEnd: e.target.value })}
                      className="bg-transparent text-xs text-[#d4af37] outline-none cursor-pointer font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-2xl border border-white/10">
              <div>
                <span className="text-xs font-semibold text-white block">शांत ध्वनि संकेत (Gentle Chime)</span>
                <span className="text-[10px] text-gray-400">528Hz शांति नाद</span>
              </div>
              <input
                type="checkbox"
                checked={notificationPrefs.soundEnabled}
                onChange={(e) => handleSaveNotifications({ ...notificationPrefs, soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#d4af37] cursor-pointer"
              />
            </div>

            {/* Test Notification Button */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleTestNotification}
                className="w-full py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#030a08] font-bold rounded-xl text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                सूचना परीक्षण भेजें (Send Test)
              </button>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2.5 border border-[#d4af37]/40 text-[#d4af37] rounded-xl text-xs hover:bg-[#d4af37]/15 transition-all cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Audit Modal */}
      {showAuditModal && companionData && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a1510] border border-[#d4af37]/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#d4af37]" />
                <h3 className="text-base font-bold text-[#d4af37]">22-बिंदु सत्यापन एवं डेटा अखंडता ऑडिट</h3>
              </div>
              <button onClick={() => setShowAuditModal(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-2xl text-emerald-200">
              <p className="font-bold text-xs mb-1">DATA INTEGRITY LOCK: शत-प्रतिशत प्रामाणिक</p>
              <p className="text-[11px]">{companionData.whyAuditTrail.complianceStatement}</p>
            </div>

            <div className="space-y-3 text-gray-300">
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                <h4 className="font-bold text-[#d4af37] text-xs">1. मास्टर जन्म प्रोफ़ाइल डेटा (Bound Inputs)</h4>
                {companionData.whyAuditTrail.profileDataUsed.map((p, idx) => (
                  <p key={idx} className="text-[11px]">• {p}</p>
                ))}
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                <h4 className="font-bold text-amber-300 text-xs">2. विंशोत्तरी दशा डेटा (Vimshottari Engine)</h4>
                <p className="text-[11px]">• {companionData.whyAuditTrail.dashaDataUsed}</p>
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                <h4 className="font-bold text-cyan-300 text-xs">3. अंकशास्त्र एवं लो शू ग्रिड (Numerology & Lo Shu)</h4>
                <p className="text-[11px]">• {companionData.whyAuditTrail.numerologyDataUsed}</p>
                <p className="text-[11px]">• {companionData.whyAuditTrail.loShuDataUsed}</p>
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                <h4 className="font-bold text-emerald-300 text-xs">4. पंचतत्व एवं दिनमान अधिपति (Panchatattva & Weekday)</h4>
                <p className="text-[11px]">• {companionData.whyAuditTrail.panchatattvaDataUsed}</p>
                <p className="text-[11px]">• {companionData.whyAuditTrail.transitDataUsed}</p>
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                <h4 className="font-bold text-purple-300 text-xs">5. सुरक्षा एवं नैतिक दिशा-निर्देश</h4>
                <p className="text-[11px]">• नो मेडिकल क्लेम: स्वास्थ्य कार्ड केवल सात्विक जीवनशैली तक सीमित है।</p>
                <p className="text-[11px]">• नो वित्तीय गारंटी: धन प्रबंधन में केवल विवेक एवं अनुशासन का निर्देश है।</p>
                <p className="text-[11px]">• नो फेटलिज्म: पुरुषार्थ और सजग कर्म को भाग्य से बड़ा स्थान दिया गया है।</p>
              </div>
            </div>

            <button
              onClick={() => setShowAuditModal(false)}
              className="w-full py-2 bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] rounded-xl font-bold text-xs hover:bg-[#d4af37]/30 transition-all cursor-pointer"
            >
              सत्यापन पूर्ण — वापस जाएं
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
