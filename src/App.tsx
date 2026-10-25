/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import { KundliIntro, KundliShell } from './components/Kundli';
import Numerology from './components/Numerology';
import IntelligenceDashboard from './components/IntelligenceDashboard';
import ReportCenter from './components/ReportCenter';
import PrashnaDashboard from './components/prashna/PrashnaDashboard';
import DailyCompanionDashboard from './components/companion/DailyCompanionDashboard';
import PratahSanskarDashboard from './components/pratah/PratahSanskarDashboard';
import DailyReportCard from './components/report/DailyReportCard';
import LanguageSelectorModal from './components/LanguageSelectorModal';
import OwnerControlCenter from './components/guardian/OwnerControlCenter';
import MuhuratDashboard from './components/muhurat/MuhuratDashboard';
import DoshDashboard from './components/dosh/DoshDashboard';
import MeditationDashboard from './components/meditation/MeditationDashboard';
import YogaDashboard from './components/yogaSadhana/YogaDashboard';
import JeevanPragyaDashboard from './components/jeevanPragya/JeevanPragyaDashboard';
import { ProfileManagerView } from './components/profile/ProfileManagerView';
import { GuardianErrorBoundary } from './components/guardian/GuardianErrorBoundary';
import { guardianMonitor } from './services/guardian/guardianMonitor';
import { 
  getOwnerControlConfig, 
  isOwnerAuthenticatedSession, 
  OWNER_AUTH_CHANGED_EVENT 
} from './services/guardian/guardianConfig';
import SwamiSecretPinModal from './components/guardian/SwamiSecretPinModal';
import { Home, Star, Sparkles, Users, User, Globe, Shield, Wrench, Compass, Flame } from 'lucide-react';
import { BirthProfile } from './types/kundli';
import { FamilyMemberProfile } from './types/profile/profileTypes';
import { ProfileService, PROFILES_UPDATED_EVENT } from './services/profile/profileService';
import { useTranslation } from './i18n';
import { useProfile } from './context/ProfileContext';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { t, currentLanguageInfo } = useTranslation();
  
  const { activeProfile } = useProfile();

  const [ownerConfig, setOwnerConfig] = useState(getOwnerControlConfig());
  const [isOwnerAuth, setIsOwnerAuth] = useState(() => isOwnerAuthenticatedSession());
  const [maintenanceTapCount, setMaintenanceTapCount] = useState(0);
  const [showMaintenanceSecretModal, setShowMaintenanceSecretModal] = useState(false);
  const lastMaintenanceTapRef = useRef(0);

  // Initialize Guardian Error Monitor & Owner Config Listeners
  useEffect(() => {
    guardianMonitor.init();

    const handleConfigChange = () => {
      setOwnerConfig(getOwnerControlConfig());
    };
    const handleAuthChange = () => {
      setIsOwnerAuth(isOwnerAuthenticatedSession());
    };

    window.addEventListener('jeevandarpan_owner_config_updated', handleConfigChange);
    window.addEventListener(OWNER_AUTH_CHANGED_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener('jeevandarpan_owner_config_updated', handleConfigChange);
      window.removeEventListener(OWNER_AUTH_CHANGED_EVENT, handleAuthChange);
    };
  }, []);

  // Auto-hide toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const renderView = () => {
    // If maintenance mode active and not on owner_control, display maintenance notice
    if (ownerConfig.maintenanceControls.maintenanceMode && !ownerConfig.maintenanceControls.bypassForOwner && view !== 'owner_control') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#030a08] to-[#082218] flex flex-col items-center justify-center p-6 text-center">
          <div 
            onClick={() => {
              const now = Date.now();
              const elapsed = now - lastMaintenanceTapRef.current;
              lastMaintenanceTapRef.current = now;
              const nextCount = elapsed < 3000 ? maintenanceTapCount + 1 : 1;
              setMaintenanceTapCount(nextCount);
              if (nextCount >= 5) {
                setMaintenanceTapCount(0);
                if (isOwnerAuth) {
                  setView('owner_control');
                } else {
                  setShowMaintenanceSecretModal(true);
                }
              }
            }}
            className="w-16 h-16 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/40 mb-4 animate-pulse cursor-pointer select-none active:scale-95 transition-transform"
            title=""
          >
            <Wrench className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#d4af37] mb-3">{t('guardian.maintenanceMode')}</h2>
          <p className="text-base text-gray-200 max-w-sm mb-6 leading-relaxed break-words">
            {ownerConfig.maintenanceControls.maintenanceMessage}
          </p>
          {isOwnerAuth && (
            <button
              onClick={() => setView('owner_control')}
              className="min-h-[48px] px-6 py-3 rounded-full bg-[#d4af37] text-black font-bold text-base hover:bg-[#d4af37]/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer flex items-center gap-2 whitespace-nowrap animate-fadeIn"
            >
              <Shield className="w-5 h-5" /> {t('guardian.ownerControlCenter')}
            </button>
          )}
        </div>
      );
    }

    switch(view) {
      case 'owner_control':
        return <OwnerControlCenter onBack={() => setView('dashboard')} showToast={setToastMessage} />;
      case 'intro':
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#030a08] to-[#082218] flex flex-col items-center justify-center font-sans p-4 relative">
            {/* Language Quick Switcher */}
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={() => setShowLanguageModal(true)}
                className="flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full bg-[#0a1510] border border-[#d4af37]/50 text-[#d4af37] text-sm font-semibold hover:bg-[#d4af37]/20 transition-all shadow-md cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLanguageInfo.nativeName}</span>
              </button>
            </div>

            <div className="text-center mb-10 max-w-sm">
              <h1 className="text-4xl sm:text-5xl font-bold text-[#d4af37] mb-3 tracking-wider">
                {t('common.appName')}
              </h1>
              <p className="text-sm sm:text-base text-emerald-300 font-medium tracking-widest uppercase">
                {t('common.privateEdition')}
              </p>
              <p className="text-sm sm:text-base text-gray-300 mt-2 italic leading-relaxed">
                {t('common.appTagline')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button 
                onClick={() => setView('dashboard')}
                className="min-h-[52px] px-8 py-3.5 bg-[#d4af37] text-[#030a08] text-lg font-bold rounded-full hover:bg-[#e6c250] transition-all duration-300 ease-in-out cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.7)] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>डैशबोर्ड प्रवेश</span>
              </button>
            </div>
          </div>
        );
      case 'profile':
        return (
          <ProfileManagerView 
            navigate={setView} 
            showToast={setToastMessage} 
            onOpenLanguageModal={() => setShowLanguageModal(true)} 
          />
        );
      case 'dashboard':
        return <Dashboard key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'jeevan_pragya':
        return <JeevanPragyaDashboard key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'numerology':
        return <Numerology key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'intelligence_dashboard':
        return <IntelligenceDashboard key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'reports':
        return <ReportCenter key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'kundli_intro':
        return <KundliIntro onSkip={() => setView('kundli_shell')} />;
      case 'kundli_shell':
        return <KundliShell key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'prashna_kundli':
        return <PrashnaDashboard key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'daily_companion':
        return <DailyCompanionDashboard key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'pratah_sanskar':
        return <PratahSanskarDashboard key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'daily_report_card':
        return <DailyReportCard key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'muhurat':
        return <MuhuratDashboard key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'dosh_remedies':
        return <DoshDashboard key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'meditation':
        return <MeditationDashboard key={activeProfile.id} profile={activeProfile} navigate={setView} showToast={setToastMessage} />;
      case 'yoga':
        return (
          <YogaDashboard 
            key={activeProfile.id} 
            profile={activeProfile} 
            isMasterProfile={activeProfile.id === 'master' || activeProfile.isMaster === true} 
            onBack={() => setView('dashboard')} 
            showToast={setToastMessage} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-deep font-sans text-white relative selection:bg-royal-gold/30">
      
      {/* Main Content Area Protected by Guardian Error Boundary */}
      <GuardianErrorBoundary moduleName={view}>
        {renderView()}
      </GuardianErrorBoundary>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 bg-[#0a1510]/95 border border-[#d4af37]/80 text-[#d4af37] px-6 py-3.5 rounded-full shadow-[0_0_25px_rgba(212,175,55,0.4)] z-50 backdrop-blur-md transition-opacity max-w-[90vw] text-center">
          <p className="text-sm sm:text-base font-medium tracking-wide break-words">{toastMessage}</p>
        </div>
      )}

      {/* Global Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onLanguageSelected={(code) => setToastMessage(`भाषा अपडेट की गई: ${code.toUpperCase()}`)}
      />

      {/* Bottom Navigation */}
      {['dashboard', 'kundli_shell', 'profile', 'muhurat'].includes(view) && (
        <nav className="fixed bottom-0 w-full bg-[#020805]/95 backdrop-blur-xl border-t border-[#d4af37]/25 px-2 sm:px-6 py-2 pb-4 z-40">
          <div className="max-w-md mx-auto flex justify-around items-center text-[#d4af37]/60">
            <button onClick={() => setView('dashboard')} className={`flex flex-col items-center justify-center min-h-[48px] min-w-[44px] px-1 py-1 transition-colors cursor-pointer ${view === 'dashboard' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]/90'}`}>
              <Home className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[13px] sm:text-sm font-bold tracking-tight sm:tracking-wider mt-0.5">{t('nav.home')}</span>
            </button>
            <button onClick={() => setView('kundli_intro')} className={`flex flex-col items-center justify-center min-h-[48px] min-w-[44px] px-1 py-1 transition-colors cursor-pointer ${view.startsWith('kundli') ? 'text-[#d4af37]' : 'hover:text-[#d4af37]/90'}`}>
              <Star className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[13px] sm:text-sm font-bold tracking-tight sm:tracking-wider mt-0.5">{t('nav.kundli')}</span>
            </button>
            <button onClick={() => setView('intelligence_dashboard')} className={`flex flex-col items-center justify-center min-h-[48px] min-w-[44px] px-1 py-1 transition-colors cursor-pointer ${view === 'intelligence_dashboard' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]/90'}`}>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[13px] sm:text-sm font-bold tracking-tight sm:tracking-wider mt-0.5">{t('nav.ai')}</span>
            </button>
            <button onClick={() => setView('profile')} className={`flex flex-col items-center justify-center min-h-[48px] min-w-[44px] px-1 py-1 transition-colors cursor-pointer ${view === 'profile' ? 'text-[#d4af37]' : 'hover:text-[#d4af37]/90'}`}>
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[13px] sm:text-sm font-bold tracking-tight sm:tracking-wider mt-0.5">{t('nav.profile')}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Hidden Swami Secret PIN Modal for Maintenance Unlock */}
      <SwamiSecretPinModal
        isOpen={showMaintenanceSecretModal}
        onClose={() => setShowMaintenanceSecretModal(false)}
        onSuccess={() => {
          setIsOwnerAuth(true);
          setView('owner_control');
        }}
        showToast={setToastMessage}
      />
    </div>
  );
}
