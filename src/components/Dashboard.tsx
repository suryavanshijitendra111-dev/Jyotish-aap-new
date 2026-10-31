import { useState, useEffect } from 'react';
import { Globe, User, Settings, Edit3, Compass, Sun, FileText, Shield, AlertTriangle, CheckCircle2, Clock, Calendar, Sparkles, Star } from 'lucide-react';
import { BirthProfile } from '../types/kundli';
import { useTranslation } from '../i18n';
import LanguageSelectorModal from './LanguageSelectorModal';
import OwnerNotificationCenter from './guardian/OwnerNotificationCenter';
import TechnicalAlertModal from './guardian/TechnicalAlertModal';
import PostFixAlertModal from './guardian/PostFixAlertModal';
import { guardianIncidentService, getStoredIncidents, classifyIncidentState } from '../services/guardian/guardianIncidentService';
import { GuardianIncident } from '../types/ownerControl';
import { FamilyProfileSelector } from './profile/FamilyProfileSelector';
import { FamilyMemberFormModal, RELATION_LABELS } from './profile/FamilyMemberFormModal';
import { ProfileService } from '../services/profile/profileService';
import NumerologyReportModal from './NumerologyReportModal';

interface DashboardProps {
  profile: BirthProfile | null;
  navigate: (view: string) => void;
  showToast: (msg: string) => void;
}

export default function Dashboard({ profile, navigate, showToast }: DashboardProps) {
  const { t, currentLanguageInfo } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNumerologyModalOpen, setIsNumerologyModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<GuardianIncident | null>(null);
  const [postFixResult, setPostFixResult] = useState<{
    success: boolean;
    problemTitle: string;
    actionTaken: string;
    testsPassed: string;
    status: 'RESOLVED' | 'ROLLED_BACK';
    rollbackAvailable: boolean;
    backupId?: string;
    errorReason?: string;
  } | null>(null);
  const [incidents, setIncidents] = useState<GuardianIncident[]>(getStoredIncidents());

  useEffect(() => {
    const handleUpdate = () => {
      setIncidents(getStoredIncidents());
    };
    window.addEventListener('jeevandarpan_incidents_updated', handleUpdate);
    return () => window.removeEventListener('jeevandarpan_incidents_updated', handleUpdate);
  }, []);

  const handleFixIncident = async (incident: GuardianIncident) => {
    const token = sessionStorage.getItem('jeevandarpan_owner_token') || undefined;
    const result = await guardianIncidentService.executeControlledFix(incident.id, { sessionToken: token });
    setPostFixResult({
      success: result.success,
      problemTitle: incident.title || incident.description || incident.message,
      actionTaken: result.actionTaken,
      testsPassed: result.testsPassed,
      status: result.status,
      rollbackAvailable: result.rollbackAvailable,
      backupId: result.backupId,
      errorReason: result.errorReason,
    });
    setIncidents(getStoredIncidents());
    setSelectedIncident(null);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-28">
      {/* Header */}
      <header className="flex justify-between items-center p-4 sm:p-5 border-b border-[#d4af37]/20 bg-[#030a08]/80 sticky top-0 z-20 backdrop-blur-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#d4af37]">{t('common.appName')}</h1>
          <p className="text-xs sm:text-sm font-bold text-[#d4af37]/80 tracking-[0.2em] uppercase mt-0.5">JEEVANDARPAN</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-[#d4af37]">
          {/* Active Family Profile Selector */}
          <FamilyProfileSelector 
            onAddNewMember={() => setIsAddMemberOpen(true)}
            variant="header"
          />

          {/* Active Language Badge */}
          <button 
            onClick={() => setShowLangModal(true)}
            className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] text-sm font-bold hover:bg-[#d4af37]/25 transition-all shadow-sm cursor-pointer"
            title={t('settings.languageSelection')}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[80px] sm:max-w-none">{currentLanguageInfo.nativeName}</span>
          </button>

          {/* Guardian Technical Alert Bell & Notification Center */}
          <OwnerNotificationCenter
            onOpenIncidentModal={(inc) => setSelectedIncident(inc)}
            onOpenOwnerControl={() => navigate('owner_control')}
            onDirectFix={(inc) => handleFixIncident(inc)}
          />
          
          <button 
            onClick={() => navigate('owner_control')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer"
            title={t('guardian.ownerControlCenter')}
          >
            <Shield className="w-5 h-5 text-[#d4af37]" />
          </button>
          <button
            onClick={() => navigate('profile')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer"
            title={t('dashboard.masterProfile')}
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowLangModal(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer"
            title={t('settings.languageSelection')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={showLangModal}
        onClose={() => setShowLangModal(false)}
        onLanguageSelected={(code) => showToast(`भाषा बदली गई: ${code.toUpperCase()}`)}
      />

      <main className="p-4 sm:p-5 flex flex-col gap-6 sm:gap-8">
        {/* जीवन प्रज्ञा मार्गदर्शन (Jeevan Pragya Margdarshan — 2D Spotlight) */}
        <div className="bg-gradient-to-r from-[#041d13] via-[#082a1c] to-[#03150d] border border-[#d4af37]/70 backdrop-blur-md rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(212,175,55,0.3)]">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#d4af37]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#fef08a] to-[#d4af37] p-[1.5px] shrink-0 shadow-[0_0_18px_rgba(212,175,55,0.5)]">
                  <div className="w-full h-full bg-[#030a08] rounded-2xl flex items-center justify-center text-[#d4af37]">
                    <Compass className="w-6 h-6 text-[#d4af37]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                      जीवन प्रज्ञा मार्गदर्शन
                    </h3>
                    <span className="text-xs bg-[#d4af37]/25 text-[#fef08a] border border-[#d4af37]/50 px-2.5 py-0.5 rounded-full font-bold">
                      त्रिकाल दृष्टि
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#d4af37]/90 font-medium mt-0.5">
                    अतीत • वर्तमान • भविष्य का सूक्ष्म आध्यात्मिक एवं ज्योतिषीय बोध
                  </p>
                </div>
              </div>
            </div>

            {/* Quick 3 Era Snapshot Preview / Direct Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => navigate('jeevan_pragya')}
                className="py-2.5 px-2 rounded-xl bg-black/40 border border-[#d4af37]/35 hover:border-[#d4af37] transition-all text-center group cursor-pointer"
              >
                <Clock className="w-4 h-4 mx-auto text-[#d4af37] mb-1" />
                <span className="text-xs uppercase tracking-wider text-[#d4af37] block font-bold">अतीत</span>
                <span className="text-[11px] text-gray-300 group-hover:text-white">पूर्व संस्कार</span>
              </button>
              <button
                onClick={() => navigate('jeevan_pragya')}
                className="py-2.5 px-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/60 hover:bg-[#d4af37]/30 transition-all text-center group cursor-pointer shadow-sm"
              >
                <Sun className="w-4 h-4 mx-auto text-[#fef08a] mb-1" />
                <span className="text-xs uppercase tracking-wider text-[#fef08a] block font-bold">वर्तमान</span>
                <span className="text-[11px] text-white group-hover:text-[#fef08a] font-semibold">दशा गोचर</span>
              </button>
              <button
                onClick={() => navigate('jeevan_pragya')}
                className="py-2.5 px-2 rounded-xl bg-black/40 border border-[#d4af37]/35 hover:border-[#d4af37] transition-all text-center group cursor-pointer"
              >
                <Calendar className="w-4 h-4 mx-auto text-[#d4af37] mb-1" />
                <span className="text-xs uppercase tracking-wider text-[#d4af37] block font-bold">भविष्य</span>
                <span className="text-[11px] text-gray-300 group-hover:text-white">आगामी काल</span>
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => navigate('jeevan_pragya')}
                className="flex-1 min-h-[46px] px-4 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#b89528] text-[#030a08] font-bold rounded-xl text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>प्रज्ञा मार्गदर्शन खोलें</span>
                <span>→</span>
              </button>
              <button
                onClick={() => navigate('daily_report_card')}
                className="flex-1 min-h-[46px] px-4 py-2.5 bg-black/50 border border-[#d4af37]/60 text-[#d4af37] font-bold rounded-xl text-sm hover:bg-[#d4af37]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>दैनिक रिपोर्ट कार्ड</span>
                <span>📋</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Profile Summary Card */}
        <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-3xl p-5 sm:p-6 relative z-10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          {/* Glassmorphism ambient glow safely contained */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h2 className="text-[#d4af37] font-bold text-sm sm:text-base tracking-widest uppercase flex items-center gap-2">
                <span>{(profile as any)?.isMaster || (profile as any)?.id === 'master' ? t('dashboard.masterProfile') : 'सक्रिय पारिवारिक प्रोफ़ाइल'}</span>
                {(profile as any)?.relationship && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-semibold normal-case">
                    {RELATION_LABELS[(profile as any).relationship as keyof typeof RELATION_LABELS]?.hi || (profile as any).relationship}
                  </span>
                )}
              </h2>
            </div>
            <button 
              onClick={() => navigate('profile')}
              className="text-[#d4af37]/80 hover:text-[#d4af37] bg-[#d4af37]/10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-colors cursor-pointer"
              title="प्रोफ़ाइल केंद्र खोलें"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Family Profile Switcher Dropdown (higher z-index stacking context) */}
          <div className="relative z-30 mb-4">
            <FamilyProfileSelector 
              onAddNewMember={() => setIsAddMemberOpen(true)}
              variant="card"
            />
          </div>

          {profile ? (
            <div className="space-y-4 relative z-0">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-black/25 p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="text-sm text-gray-300 uppercase tracking-wider mb-1 font-semibold">{t('dashboard.dob')}</p>
                  <p className="text-[#d4af37] text-lg sm:text-xl font-bold">{profile.dob}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300 uppercase tracking-wider mb-1 font-semibold">{t('dashboard.birthTime')}</p>
                  <p className="text-[#d4af37] text-lg sm:text-xl font-bold">{profile.time}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/5">
                  <p className="text-sm text-gray-300 uppercase tracking-wider mb-1 font-semibold">{t('dashboard.birthPlace')}</p>
                  <p className="text-[#d4af37] text-lg sm:text-xl font-bold">{profile.place}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 relative z-0">
              <p className="text-gray-200 mb-4 text-base font-light">{t('common.notAvailable')}</p>
              <button 
                onClick={() => navigate('profile')} 
                className="min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 border border-[#d4af37] text-[#d4af37] rounded-full text-base font-bold tracking-wide hover:bg-[#d4af37]/30 transition-all cursor-pointer"
              >
                {t('dashboard.goToProfile')}
              </button>
            </div>
          )}
        </div>

        {/* Daily Jeevan Report Card (Phase 23.1 Spotlight) */}
        <div className="bg-gradient-to-r from-[#0a2318] via-[#0d2f21] to-[#05160e] border border-[#d4af37]/70 backdrop-blur-md rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(212,175,55,0.3)]">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#d4af37]/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#fef08a] to-[#d4af37] p-[1.5px] shrink-0 shadow-[0_0_18px_rgba(212,175,55,0.5)] mt-0.5">
                <div className="w-full h-full bg-[#030a08] rounded-2xl flex items-center justify-center text-[#d4af37]">
                  <FileText className="w-6 h-6 text-[#d4af37]" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">{t('dashboard.dailyReport')}</h3>
                  <span className="text-sm bg-[#d4af37]/25 text-[#fef08a] border border-[#d4af37]/50 px-2.5 py-0.5 rounded-full font-bold">
                    Phase 23.1
                  </span>
                </div>
                <p className="text-base text-gray-200 mt-1.5 leading-[1.65] break-words">
                  21-सेक्शन विस्तृत रिपोर्ट, वास्तविक PDF डाउनलोड एवं दैनिक जर्नल
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('daily_report_card')}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#b89528] text-[#030a08] font-bold rounded-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.5)] shrink-0 cursor-pointer text-center"
            >
              {t('common.start')}
            </button>
          </div>
        </div>

        {/* Pratah Sanskar (Phase 22.3 Spotlight) */}
        <div className="bg-gradient-to-r from-[#0d2f21] via-[#092218] to-[#04120c] border border-[#d4af37]/60 backdrop-blur-md rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(212,175,55,0.25)]">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#f59e0b]/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f59e0b] p-[1.5px] shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.4)] mt-0.5">
                <div className="w-full h-full bg-[#04120c] rounded-2xl flex items-center justify-center text-[#d4af37]">
                  <Sun className="w-6 h-6 text-[#d4af37] animate-pulse" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">{t('dashboard.pratahSanskar')}</h3>
                  <span className="text-sm bg-[#d4af37]/25 text-[#fef08a] border border-[#d4af37]/50 px-2.5 py-0.5 rounded-full font-bold">
                    Phase 22.3
                  </span>
                </div>
                <p className="text-base text-gray-200 mt-1.5 leading-[1.65] break-words">
                  जागृति अलार्म, गायत्री मंत्र, सूर्य अर्घ्य (12 नाम) एवं दैनिक संकल्प
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('pratah_sanskar')}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b89528] text-[#030a08] font-bold rounded-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.5)] shrink-0 cursor-pointer text-center"
            >
              {t('common.start')}
            </button>
          </div>
        </div>

        {/* JeevanDarpan Daily Companion (Phase 22.2 Spotlight) */}
        <div className="bg-gradient-to-r from-[#0d2a1f] via-[#0b281d] to-[#04120c] border border-[#d4af37]/50 backdrop-blur-md rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(212,175,55,0.2)]">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37]/30 to-[#d4af37]/10 border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] shrink-0 shadow-inner mt-0.5">
                <Sun className="w-6 h-6 text-[#d4af37]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">{t('dashboard.dailyCompanion')}</h3>
                  <span className="text-sm bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 px-2.5 py-0.5 rounded-full font-bold">
                    Phase 22.2
                  </span>
                </div>
                <p className="text-base text-gray-200 mt-1.5 leading-[1.65] break-words">
                  प्रातः, दोपहर, संध्या एवं रात्रि के लिए व्यक्तिगत दैनिक साथी
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('daily_companion')}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#030a08] font-bold rounded-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] shrink-0 cursor-pointer text-center"
            >
              {t('common.start')}
            </button>
          </div>
        </div>

        {/* Prashna Kundli (Horary) Spotlight Card */}
        <div className="bg-gradient-to-r from-[#082218] via-[#0b281d] to-[#05140e] border border-[#d4af37]/40 backdrop-blur-md rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                <Compass className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-[#d4af37]">{t('dashboard.prashnaKundli')}</h3>
                  <span className="text-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                    New Phase 22.1
                  </span>
                </div>
                <p className="text-base text-gray-200 mt-1.5 leading-[1.65] break-words">
                  वर्तमान क्षण और स्थान अनुसार प्रश्न का त्वरित वैदिक विचार
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('prashna_kundli')}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#030a08] font-bold rounded-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shrink-0 cursor-pointer text-center"
            >
              {t('common.start')}
            </button>
          </div>
        </div>

        {/* Numerology Report (Janmank & Bhagyank) Spotlight Card */}
        <div className="bg-gradient-to-r from-[#0a2318] via-[#0d2f21] to-[#05160e] border border-[#d4af37]/70 backdrop-blur-md rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(212,175,55,0.3)]">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#d4af37]/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#fef08a] to-[#d4af37] p-[1.5px] shrink-0 shadow-[0_0_18px_rgba(212,175,55,0.5)] mt-0.5">
                <div className="w-full h-full bg-[#030a08] rounded-2xl flex items-center justify-center text-[#d4af37]">
                  <Sparkles className="w-6 h-6 text-[#d4af37]" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">अंकशास्त्र साप्ताहिक प्रतिवेदन</h3>
                  <span className="text-sm bg-[#d4af37]/25 text-[#fef08a] border border-[#d4af37]/50 px-2.5 py-0.5 rounded-full font-bold">
                    Janmank & Bhagyank
                  </span>
                </div>
                <p className="text-base text-gray-200 mt-1.5 leading-[1.65] break-words">
                  मूलांक एवं भाग्यांक विश्लेषण तथा ग्रह आधारित व्यक्तिगत साप्ताहिक मार्गदर्शन
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsNumerologyModalOpen(true)}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#b89528] text-[#030a08] font-bold rounded-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.5)] shrink-0 cursor-pointer text-center"
            >
              प्रतिवेदन देखें
            </button>
          </div>
        </div>

        {/* Owner Control Center (Guardian Foundation Spotlight) */}
        <div className="bg-gradient-to-r from-[#0d2217] via-[#091b12] to-[#040e09] border border-[#d4af37]/70 backdrop-blur-md rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(212,175,55,0.25)]">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#fef08a] to-[#d4af37] p-[1.5px] shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.4)] mt-0.5">
                <div className="w-full h-full bg-[#040e09] rounded-2xl flex items-center justify-center text-[#d4af37]">
                  <Shield className="w-6 h-6 text-[#d4af37]" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">Owner Control Center</h3>
                  <span className="text-sm bg-[#d4af37]/25 text-[#fef08a] border border-[#d4af37]/50 px-2.5 py-0.5 rounded-full font-bold">
                    Guardian Core
                  </span>
                </div>
                <p className="text-base text-gray-200 mt-1.5 leading-[1.65] break-words">
                  मॉड्यूल नियंत्रण, गार्जियन स्तर (1/2/3), अनुमोदन अनुरोध एवं बैकअप
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('owner_control')}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#b89528] text-[#030a08] font-bold rounded-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] shrink-0 cursor-pointer text-center"
            >
              नियंत्रण
            </button>
          </div>
        </div>

        {/* 🔔 तकनीकी स्वास्थ्य (Technical Health) Card */}
        {(() => {
          const openIncs = incidents.filter(i => 
            classifyIncidentState(i) === 'ACTIVE_RUNTIME_INCIDENT' && 
            (i.status === 'OPEN' || i.status === 'INVESTIGATING' || i.status === 'APPROVAL_REQUESTED')
          );
          const isHealthy = openIncs.length === 0;

          return (
            <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
              isHealthy 
                ? 'bg-gradient-to-r from-[#082218]/90 via-[#05140e]/90 to-[#020a06]/90 border-[#d4af37]/35 shadow-[0_4px_25px_rgba(0,0,0,0.5)]' 
                : 'bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-black/60 border-amber-500/60 shadow-[0_4px_25px_rgba(245,158,11,0.2)]'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border shrink-0 ${
                    isHealthy 
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' 
                      : 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
                  }`}>
                    {isHealthy ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base sm:text-lg">
                        🔔 {t('guardian.technicalHealthTitle') || 'तकनीकी स्वास्थ्य (Technical Health)'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isHealthy 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' 
                          : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                      }`}>
                        {isHealthy 
                          ? '🟢 Guardian: सुरक्षित (PASS / ACTIVE)' 
                          : `🟠 ${openIncs.length} ${t('guardian.activeIncidentsCount') || 'समस्याएँ ध्यान चाहती हैं'}`}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                      {isHealthy 
                        ? 'Guardian सुरक्षित है • सक्रिय समस्याएँ: 0 • ऐतिहासिक घटनाएँ ऑडिट लॉग में सुरक्षित' 
                        : `${openIncs[0].title}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (openIncs.length > 0) {
                      setSelectedIncident(openIncs[0]);
                    } else {
                      navigate('owner_control');
                    }
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#d4af37] text-[#030a08] text-xs sm:text-sm font-bold hover:bg-[#d4af37]/90 transition-all cursor-pointer whitespace-nowrap shadow-md shrink-0"
                >
                  {openIncs.length > 0 ? (t('guardian.viewAction') || 'देखें') : (t('guardian.ownerControlCenter') || 'प्रशासन')}
                </button>
              </div>
            </div>
          );
        })()}

        {/* All 27 Vedic 2D Modules Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[#d4af37] font-bold text-sm sm:text-base tracking-widest uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>वैदिक प्रभाग एवं साधन (Modules)</span>
            </h2>
            <span className="text-xs text-[#d4af37]/70 font-mono">27 प्रभाग</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              {
                id: 'kundli',
                title: 'Kundli',
                titleHindi: 'कुंडली जन्मांग',
                desc: 'लग्न, 12 भाव एवं ग्रह स्थिति',
                isLive: true,
                action: () => navigate('kundli_intro')
              },
              {
                id: 'kp',
                title: 'KP Jyotish',
                titleHindi: 'केपी ज्योतिष',
                desc: 'नक्षत्र स्वामी, उप-स्वामी व कस्प',
                isLive: true,
                action: () => {
                  try { sessionStorage.setItem('jeevandarpan_scroll_to', 'kp'); } catch {}
                  navigate('kundli_shell');
                }
              },
              {
                id: 'pragya',
                title: 'Jeevan Pragya',
                titleHindi: 'जीवन प्रज्ञा मार्गदर्शन',
                desc: 'अतीत • वर्तमान • भविष्य',
                isLive: true,
                action: () => navigate('jeevan_pragya')
              },
              {
                id: 'dasha',
                title: 'Dasha',
                titleHindi: 'विंशोत्तरी दशा',
                desc: 'महादशा, अंतर्दशा एवं कालक्रम',
                isLive: true,
                action: () => {
                  try { sessionStorage.setItem('jeevandarpan_scroll_to', 'dasha'); } catch {}
                  navigate('kundli_shell');
                }
              },
              {
                id: 'gochar',
                title: 'Gochar',
                titleHindi: 'गोचर (Transit)',
                desc: 'तात्कालिक आकाशीय ग्रह चाल',
                isLive: true,
                action: () => {
                  try { sessionStorage.setItem('jeevandarpan_scroll_to', 'transit'); } catch {}
                  navigate('kundli_shell');
                }
              },
              {
                id: 'varga',
                title: 'Varga',
                titleHindi: 'वर्ग कुंडलियां',
                desc: 'D1 से D60 षोडशवर्ग',
                isLive: true,
                action: () => {
                  try { sessionStorage.setItem('jeevandarpan_scroll_to', 'varga'); } catch {}
                  navigate('kundli_shell');
                }
              },
              {
                id: 'numerology',
                title: 'Numerology',
                titleHindi: 'अंकशास्त्र',
                desc: 'मूलांक, भाग्यांक एवं नामांक',
                isLive: true,
                action: () => {
                  try { sessionStorage.setItem('jeevandarpan_numerology_tab', 'CORE'); } catch {}
                  navigate('numerology');
                }
              },
              {
                id: 'loshu',
                title: 'Lo Shu',
                titleHindi: 'लो शू ग्रिड',
                desc: 'अंक चक्र एवं योग विश्लेषण',
                isLive: true,
                action: () => {
                  try { sessionStorage.setItem('jeevandarpan_numerology_tab', 'LOSHU'); } catch {}
                  navigate('numerology');
                }
              },
              {
                id: 'prashna',
                title: 'Prashna Kundli',
                titleHindi: 'प्रश्न कुंडली',
                desc: 'वर्तमान क्षण का प्रश्न विचार',
                isLive: true,
                action: () => navigate('prashna_kundli')
              },
              {
                id: 'ai_jyotish',
                title: 'AI Jyotish',
                titleHindi: 'ज्योतिष प्रज्ञा AI',
                desc: 'प्रत्यक्ष प्रश्नोत्तर एवं विश्लेषण',
                isLive: true,
                action: () => {
                  try { sessionStorage.setItem('jeevandarpan_intel_tab', 'AI'); } catch {}
                  navigate('intelligence_dashboard');
                }
              },
              {
                id: 'life_questions',
                title: 'Life Questions',
                titleHindi: 'जीवन प्रश्न',
                desc: 'करियर, वित्त, विवाह, स्वास्थ्य',
                isLive: true,
                action: () => {
                  try { sessionStorage.setItem('jeevandarpan_intel_tab', 'QUESTIONS'); } catch {}
                  navigate('intelligence_dashboard');
                }
              },
              {
                id: 'daily_companion',
                title: 'Daily Companion',
                titleHindi: 'दैनिक सहचर',
                desc: 'प्रातः, दोपहर, संध्या, रात्रि',
                isLive: true,
                action: () => navigate('daily_companion')
              },
              {
                id: 'pratah_sanskar',
                title: 'Pratah Sanskar',
                titleHindi: 'प्रातः संस्कार',
                desc: 'गायत्री मंत्र, सूर्य अर्घ्य, संकल्प',
                isLive: true,
                action: () => navigate('pratah_sanskar')
              },
              {
                id: 'muhurat',
                title: 'Muhurat',
                titleHindi: 'शुभ मुहूर्त',
                desc: 'चौघड़िया, अभिजित व पंचांग',
                isLive: true,
                action: () => navigate('muhurat')
              },
              {
                id: 'dosh_remedies',
                title: 'Dosh & Remedies',
                titleHindi: 'दोष एवं उपाय',
                desc: 'कालसर्प, मांगलिक व वैदिक शांति',
                isLive: true,
                action: () => navigate('dosh_remedies')
              },
              {
                id: 'lal_kitab',
                title: 'Lal Kitab',
                titleHindi: 'लाल किताब',
                desc: 'ग्रह ऋण, दृष्टि एवं सरल उपाय',
                isLive: true,
                action: () => {
                  try { sessionStorage.setItem('jeevandarpan_scroll_to', 'lalkitab'); } catch {}
                  navigate('kundli_shell');
                }
              },
              {
                id: 'reports',
                title: 'Reports',
                titleHindi: 'विस्तृत रिपोर्ट',
                desc: '21-सेक्शन विस्तृत PDF प्रतिवेदन',
                isLive: true,
                action: () => navigate('reports')
              },
              {
                id: 'family',
                title: 'Family',
                titleHindi: 'पारिवारिक कुंडली',
                desc: 'मास्टर प्रोफाइल एवं परिवार',
                isLive: true,
                action: () => navigate('profile')
              },
              {
                id: 'life_journal',
                title: 'Life Journal',
                titleHindi: 'जीवन दैनंदिनी',
                desc: 'आत्म-चिंतन व अनुभव संकलन',
                isLive: true,
                action: () => navigate('daily_report_card')
              },
              {
                id: 'meditation',
                title: 'Meditation',
                titleHindi: 'ध्यान व साधना',
                desc: 'आत्म-साधना एवं आंतरिक शांति',
                isLive: true,
                action: () => navigate('meditation')
              },
              {
                id: 'yoga',
                title: 'Yoga & Sadhana',
                titleHindi: 'योग एवं साधना',
                desc: 'प्राणायाम एवं नित्य साधना विधि',
                isLive: true,
                action: () => navigate('yoga')
              },
              {
                id: 'mantra_jaap',
                title: 'Mantra Jaap',
                titleHindi: 'मंत्र जाप',
                desc: 'डिजिटल माला एवं मंत्र सिद्धि',
                isLive: false,
                action: () => showToast('मंत्र जाप एवं माला गणना केंद्र शीघ्र उपलब्ध होगा।')
              },
              {
                id: 'puja_3d',
                title: '3D Puja',
                titleHindi: '3D डिजिटल पूजा',
                desc: 'देव अर्चन एवं आरती (स्वतंत्र)',
                isLive: false,
                action: () => showToast('3D डिजिटल पूजा स्वतंत्र मॉड्यूल के रूप में शीघ्र उपलब्ध होगी।')
              },
              {
                id: 'temple_explorer',
                title: 'Temple Explorer',
                titleHindi: 'तीर्थ एवं मंदिर',
                desc: 'पवित्र देवालय एवं महात्म्य',
                isLive: false,
                action: () => showToast('तीर्थ एवं मंदिर दर्शन मार्गदर्शिका शीघ्र उपलब्ध होगी।')
              },
              {
                id: 'temple_travel',
                title: 'Temple + Travel',
                titleHindi: 'तीर्थ यात्रा',
                desc: 'धार्मिक यात्रा एवं सुविधा केंद्र',
                isLive: false,
                action: () => showToast('तीर्थ यात्रा योजना एवं सुविधा केंद्र शीघ्र उपलब्ध होगा।')
              },
              {
                id: 'spiritual_store',
                title: 'Spiritual Store',
                titleHindi: 'आध्यात्मिक केंद्र',
                desc: 'प्रामाणिक रत्न, रुद्राक्ष एवं सामग्री',
                isLive: false,
                action: () => showToast('वैदिक आध्यात्मिक सामग्री एवं रत्न केंद्र शीघ्र उपलब्ध होगा।')
              },
              {
                id: 'settings',
                title: 'Settings',
                titleHindi: 'सेटिंग्स एवं विन्यास',
                desc: 'भाषा, गार्जियन व वरीयताएं',
                isLive: true,
                action: () => setShowLangModal(true)
              }
            ].map((mod, idx) => {
              return (
                <button
                  key={idx}
                  onClick={mod.action}
                  className={`
                    border rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between text-left transition-all duration-300 min-h-[96px] sm:min-h-[108px] relative overflow-hidden group cursor-pointer
                    ${mod.isLive
                      ? 'bg-gradient-to-br from-[#062016] via-[#08281a] to-[#04140d] border-[#d4af37]/45 shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_0_24px_rgba(212,175,55,0.3)] hover:border-[#d4af37]' 
                      : 'bg-[#06150f]/60 border-white/10 hover:border-[#d4af37]/30 hover:bg-[#081e14]'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-1 w-full">
                    <div>
                      <h4 className={`font-bold tracking-wide text-sm sm:text-base leading-snug ${mod.isLive ? 'text-[#d4af37] group-hover:text-[#fef08a]' : 'text-gray-300 group-hover:text-white'}`}>
                        {mod.titleHindi}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {mod.title}
                      </p>
                    </div>
                    {mod.isLive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-300 mt-2 line-clamp-1 leading-normal">
                    {mod.desc}
                  </p>
                  {mod.isLive && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/0 via-[#d4af37]/5 to-[#d4af37]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Technical Alert Incident Modal */}
      <TechnicalAlertModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onDismissSimulation={(inc) => {
          guardianIncidentService.dismissSimulationIncident(inc.id);
          setSelectedIncident(null);
          setIncidents(getStoredIncidents());
        }}
        onFixNow={(inc) => handleFixIncident(inc)}
        onRequestApproval={() => {
          setSelectedIncident(null);
          navigate('owner_control');
        }}
        onIgnore={(inc) => {
          guardianIncidentService.resolveIncident(inc.id, 'IGNORED');
          setSelectedIncident(null);
          setIncidents(getStoredIncidents());
        }}
      />

      {/* Post-Fix Feedback Alert Modal */}
      <PostFixAlertModal
        isOpen={!!postFixResult}
        onClose={() => setPostFixResult(null)}
        result={postFixResult}
        onRollback={() => {
          if (postFixResult?.backupId) {
            navigate('owner_control');
          }
          setPostFixResult(null);
        }}
      />

      {/* Add Family Member Modal */}
      <FamilyMemberFormModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSave={(data) => {
          const res = ProfileService.saveFamilyMember(data);
          if (res.success) {
            showToast('नया पारिवारिक सदस्य सफलतापूर्वक जोड़ा गया।');
          } else {
            showToast(res.error || 'सदस्य जोड़ने में त्रुटि।');
          }
        }}
      />

      {/* Numerology Report Modal */}
      <NumerologyReportModal
        isOpen={isNumerologyModalOpen}
        onClose={() => setIsNumerologyModalOpen(false)}
        profile={profile}
        showToast={showToast}
      />
    </div>
  );
}
