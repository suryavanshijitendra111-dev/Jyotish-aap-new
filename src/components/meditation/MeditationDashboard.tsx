/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION & SADHANA ORCHESTRATOR DASHBOARD
 * PHASE 1.14H: SCREEN ROUTING, LOCAL PERSISTENCE, SANKALPA & MANAGEMENT MODALS
 */

import React, { useState } from 'react';
import {
  ChevronLeft,
  Compass,
  BookOpen,
  Settings,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { BirthProfile } from '../../types/kundli';
import { PracticeDefinition } from '../../types/meditation/practiceCatalogTypes';
import { SessionDurationSeconds, MeditationSessionRecord } from '../../types/meditation/meditationTypes';
import { SessionSnapshot } from '../../services/meditation/sessionEngine';
import { MeditationAudioMode } from '../../services/meditation/meditationAudioController';
import { MeditationStorageService } from '../../services/meditation/meditationStorageService';
import { MeditationHome } from './MeditationHome';
import { PracticeConfigModal } from './PracticeConfigModal';
import { ActiveSessionScreen } from './ActiveSessionScreen';
import { SessionCompleteScreen } from './SessionCompleteScreen';
import { MeditationHistoryModal } from './MeditationHistoryModal';
import { MeditationProgressModal } from './MeditationProgressModal';
import { MeditationStreakCalendar } from './MeditationStreakCalendar';
import { MeditationSettingsModal } from './MeditationSettingsModal';
import { useTranslation } from '../../i18n';

type MeditationScreen = 'HOME' | 'CONFIG' | 'ACTIVE_SESSION' | 'COMPLETION';

interface MeditationDashboardProps {
  profile: BirthProfile | null;
  navigate: (view: string) => void;
  showToast: (msg: string) => void;
}

export const MeditationDashboard: React.FC<MeditationDashboardProps> = ({
  profile,
  navigate,
  showToast
}) => {
  const { t } = useTranslation();
  const profileId = profile?.id || 'default';

  // Screen routing state
  const [screen, setScreen] = useState<MeditationScreen>('HOME');
  const [selectedPractice, setSelectedPractice] = useState<PracticeDefinition | null>(null);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Active session parameters
  const [activeDuration, setActiveDuration] = useState<SessionDurationSeconds>(600);
  const [activePrepSeconds, setActivePrepSeconds] = useState<number>(3);
  const [activeAudioMode, setActiveAudioMode] = useState<MeditationAudioMode>('VOICE_AND_AMBIENT');

  // Completed session snapshot
  const [completionSnapshot, setCompletionSnapshot] = useState<SessionSnapshot | null>(null);

  // Handle Practice Selection -> Opens Configuration
  const handleSelectPractice = (practice: PracticeDefinition) => {
    setSelectedPractice(practice);
    setActiveDuration(practice.defaultDurationSeconds);
    setActiveAudioMode('VOICE_AND_AMBIENT');
    setScreen('CONFIG');
  };

  // Handle Quick Start -> Immediately launches session with default parameters
  const handleQuickStart = (practice: PracticeDefinition) => {
    setSelectedPractice(practice);
    setActiveDuration(practice.defaultDurationSeconds);
    setActivePrepSeconds(3);
    setActiveAudioMode('VOICE_AND_AMBIENT');
    setScreen('ACTIVE_SESSION');
  };

  // Handle Start from Config Modal
  const handleStartFromConfig = (config: {
    durationSeconds: SessionDurationSeconds;
    preparationDurationSeconds: number;
    audioMode: MeditationAudioMode;
  }) => {
    setActiveDuration(config.durationSeconds);
    setActivePrepSeconds(config.preparationDurationSeconds);
    setActiveAudioMode(config.audioMode);
    setScreen('ACTIVE_SESSION');
  };

  // Handle Session Completion -> Persists session in local-first storage
  const handleSessionCompleted = (snapshot: SessionSnapshot) => {
    setCompletionSnapshot(snapshot);

    if (selectedPractice) {
      const storageState = MeditationStorageService.loadState(profileId);
      const activeSankalpa = storageState.state.activeSankalpa;

      const record: MeditationSessionRecord = {
        sessionId: snapshot.sessionId,
        profileId,
        practiceId: selectedPractice.practiceId,
        targetDurationSeconds: activeDuration,
        actualDurationSeconds: snapshot.elapsedSeconds,
        status: 'COMPLETED',
        recommendationSource: 'USER_SELECTED',
        startedAt: new Date(snapshot.startedAt).toISOString(),
        completedAt: new Date().toISOString(),
        sankalpaText: activeSankalpa,
        audioModeUsed: activeAudioMode === 'VOICE_AND_AMBIENT' ? 'VOICE_AND_AMBIENT' : activeAudioMode === 'AMBIENT_ONLY' ? 'AMBIENT' : 'OFF'
      };
      MeditationStorageService.recordSession(profileId, record);
    }

    setScreen('COMPLETION');
  };

  // Handle Session Cancel -> Persists incomplete session if practiced for > 10s
  const handleSessionCancelled = (snapshot: SessionSnapshot) => {
    if (selectedPractice && snapshot.elapsedSeconds > 10) {
      const storageState = MeditationStorageService.loadState(profileId);
      const activeSankalpa = storageState.state.activeSankalpa;

      const record: MeditationSessionRecord = {
        sessionId: snapshot.sessionId,
        profileId,
        practiceId: selectedPractice.practiceId,
        targetDurationSeconds: activeDuration,
        actualDurationSeconds: snapshot.elapsedSeconds,
        status: 'CANCELLED',
        recommendationSource: 'USER_SELECTED',
        startedAt: new Date(snapshot.startedAt).toISOString(),
        completedAt: new Date().toISOString(),
        sankalpaText: activeSankalpa,
        audioModeUsed: activeAudioMode === 'VOICE_AND_AMBIENT' ? 'VOICE_AND_AMBIENT' : activeAudioMode === 'AMBIENT_ONLY' ? 'AMBIENT' : 'OFF'
      };
      MeditationStorageService.recordSession(profileId, record);
    }
    showToast('ध्यान सत्र समाप्त किया गया।');
    setScreen('HOME');
  };

  // If in ACTIVE_SESSION, display audio-integrated active session screen
  if (screen === 'ACTIVE_SESSION' && selectedPractice) {
    return (
      <ActiveSessionScreen
        practice={selectedPractice}
        targetDurationSeconds={activeDuration}
        preparationDurationSeconds={activePrepSeconds}
        audioMode={activeAudioMode}
        onComplete={handleSessionCompleted}
        onCancel={handleSessionCancelled}
      />
    );
  }

  // If in COMPLETION, display qualitative completion screen
  if (screen === 'COMPLETION' && selectedPractice && completionSnapshot) {
    return (
      <SessionCompleteScreen
        practice={selectedPractice}
        snapshot={completionSnapshot}
        profileId={profileId}
        onReturnHome={() => setScreen('HOME')}
        onGoToDashboard={() => navigate('dashboard')}
        onRestartPractice={() => setScreen('ACTIVE_SESSION')}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030a08] via-[#05140d] to-[#082218] text-white">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#020a06]/95 backdrop-blur-xl border-b border-[#d4af37]/25 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          
          {/* Back button */}
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2 text-sm text-[#d4af37] hover:text-[#fef08a] transition-all font-semibold cursor-pointer group min-h-[44px]"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span>डैशबोर्ड</span>
          </button>

          {/* Module Title */}
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#d4af37]" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {t('meditation.title')}
            </h1>
          </div>

          {/* Header Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsProgressOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="प्रगति विश्लेषण"
              aria-label="Progress"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="निरंतरता पंचांग"
              aria-label="Calendar"
            >
              <Calendar className="w-4 h-4 text-[#fef08a]" />
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="साधना डायरी"
              aria-label="History"
            >
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="सेटिंग्स व संकल्प"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <MeditationHome
          profileId={profileId}
          onSelectPractice={handleSelectPractice}
          onQuickStart={handleQuickStart}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenProgress={() => setIsProgressOpen(true)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </main>

      {/* Practice Configuration Modal */}
      {screen === 'CONFIG' && selectedPractice && (
        <PracticeConfigModal
          practice={selectedPractice}
          profileId={profileId}
          onClose={() => setScreen('HOME')}
          onStartSession={handleStartFromConfig}
        />
      )}

      {/* Meditation History / Journal Modal */}
      {isHistoryOpen && (
        <MeditationHistoryModal
          profileId={profileId}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {/* Long-Term Progress Modal */}
      {isProgressOpen && (
        <MeditationProgressModal
          profileId={profileId}
          onClose={() => setIsProgressOpen(false)}
        />
      )}

      {/* Streak & Practice Calendar Modal */}
      {isCalendarOpen && (
        <MeditationStreakCalendar
          profileId={profileId}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}

      {/* Practice Settings & Sankalpa Modal */}
      {isSettingsOpen && (
        <MeditationSettingsModal
          profileId={profileId}
          onClose={() => setIsSettingsOpen(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default MeditationDashboard;
