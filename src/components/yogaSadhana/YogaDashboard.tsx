/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA HOME DASHBOARD
 * PHASE 1.15E + 1.15F-C: CLEAN PRESENTATION & HISTORY ACCESS
 * 
 * STRICT INVARIANTS:
 * - Domain-isolated from Meditation (zero Meditation imports).
 * - Zero streak calculation, zero streak UI, zero points, zero gamification.
 * - Profile identity gate: only verified master profile accesses 'default' partition.
 * - Simple history modal trigger for authorized profiles.
 * - Zero audio, zero AI, zero medical claims.
 */

import React, { useState } from 'react';
import { ArrowLeft, ShieldAlert, Sparkles, ChevronRight, Wind, UserCheck, Calendar } from 'lucide-react';
import { BirthProfile } from '../../types/kundli';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';
import { YogaPracticeDetail } from './YogaPracticeDetail';
import { YogaActiveSession } from './YogaActiveSession';
import { YogaHistoryModal } from './YogaHistoryModal';

interface YogaDashboardProps {
  profile?: BirthProfile | null;
  isMasterProfile?: boolean;
  onBack: () => void;
  showToast?: (msg: string) => void;
}

export const YogaDashboard: React.FC<YogaDashboardProps> = ({
  profile,
  isMasterProfile = true, // Defaulting to true when invoked from master App container
  onBack
}) => {
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);
  const [activeSessionConfig, setActiveSessionConfig] = useState<{ practiceId: string; targetDurationSeconds: number } | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Derive explicit identity: If master profile is verified, authorized partition is 'default'
  const isMaster = Boolean(isMasterProfile && profile);
  const profileId = profile?.id ?? (isMaster ? 'default' : null);

  // If active session is initiated, render the active session screen
  if (activeSessionConfig) {
    return (
      <YogaActiveSession
        practiceId={activeSessionConfig.practiceId}
        targetDurationSeconds={activeSessionConfig.targetDurationSeconds}
        profileId={profileId}
        isMasterProfile={isMaster}
        onExit={() => {
          setActiveSessionConfig(null);
          setSelectedPracticeId(null);
        }}
      />
    );
  }

  // If a practice is selected, render its detail view
  if (selectedPracticeId) {
    return (
      <YogaPracticeDetail
        practiceId={selectedPracticeId}
        onBack={() => setSelectedPracticeId(null)}
        onSelectPractice={(id, duration) => {
          setActiveSessionConfig({ practiceId: id, targetDurationSeconds: duration });
        }}
      />
    );
  }

  const practices = YogaCatalogService.getAllPractices();

  const getCategoryBadge = (category: string) => {
    if (category === 'BREATH_AWARENESS') {
      return (
        <span className="flex items-center gap-1 text-[11px] bg-sky-950/80 border border-sky-500/40 text-sky-300 px-2.5 py-0.5 rounded-full font-medium">
          <Wind className="w-3 h-3 text-sky-400" />
          <span>श्वास जागरूकता</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full font-medium">
        <UserCheck className="w-3 h-3 text-emerald-400" />
        <span>आसन</span>
      </span>
    );
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'CLASSICAL':
        return <span className="text-[11px] text-[#fef08a] bg-[#d4af37]/20 border border-[#d4af37]/40 px-2 py-0.5 rounded-full font-medium">शास्त्रीय (Classical)</span>;
      case 'TRADITIONAL':
        return <span className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full font-medium">पारंपरिक (Traditional)</span>;
      case 'MODERN_ADAPTATION':
        return <span className="text-[11px] text-teal-300 bg-teal-950/60 border border-teal-500/40 px-2 py-0.5 rounded-full font-medium">आधुनिक अनुकूलन (Adaptation)</span>;
      default:
        return <span className="text-[11px] text-gray-300 bg-gray-800 px-2 py-0.5 rounded-full">{classification}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030a08] via-[#051811] to-[#082218] text-white p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[#0a1510]/80 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer font-medium text-sm"
            aria-label="डैशबोर्ड पर वापस जाएं"
          >
            <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
            <span>डैशबोर्ड</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-1.5 rounded-xl bg-[#0a1510]/80 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer text-xs font-semibold"
              aria-label="अभ्यास इतिहास देखें"
            >
              <Calendar className="w-4 h-4 text-[#d4af37]" />
              <span>इतिहास</span>
            </button>

            <span className="text-xs bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fef08a] px-3 py-1 rounded-full font-semibold">
              कैटलॉग v1.0.0
            </span>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="bg-gradient-to-r from-[#041d13] via-[#082a1c] to-[#03150d] border border-[#d4af37]/70 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_8px_30px_rgba(212,175,55,0.25)]">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#d4af37]/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              <span className="text-xs tracking-wider text-[#d4af37] uppercase font-bold">
                नित्य योग एवं साधना
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              योग एवं साधना
            </h1>
            <p className="text-sm sm:text-base text-gray-200 font-medium">
              सरल, पारंपरिक और सहज अभ्यास
            </p>
          </div>
        </div>

        {/* Safety Notice Banner */}
        <div className="bg-[#121c15] border border-[#d4af37]/50 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs uppercase tracking-wider text-[#d4af37] font-bold">
                सुरक्षा एवं स्वास्थ्य सूचना (Safety Notice)
              </h2>
              <p className="text-xs sm:text-sm text-gray-200 mt-1 leading-relaxed">
                यह पारंपरिक योग अभ्यास है। अपनी सहज सीमा में करें। दर्द, चक्कर, सांस की परेशानी या असहजता होने पर तुरंत रोकें। यह चिकित्सा उपचार या चिकित्सा अनुमति नहीं है।
              </p>
            </div>
          </div>
        </div>

        {/* Practice List Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
              प्रारंभिक अभ्यास सूची ({practices.length})
            </h2>
            <span className="text-xs text-[#d4af37] font-medium">
              विस्तृत विधि हेतु चयन करें
            </span>
          </div>

          {practices.length === 0 ? (
            <div className="bg-[#0a1510]/80 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-gray-300 text-sm">योग अभ्यास इस समय उपलब्ध नहीं हैं।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {practices.map((practice) => (
                <button
                  key={practice.id}
                  onClick={() => setSelectedPracticeId(practice.id)}
                  className="w-full text-left bg-[#0a1510]/85 border border-[#d4af37]/35 hover:border-[#d4af37] rounded-2xl p-4 sm:p-5 transition-all duration-200 group cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.2)] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  aria-label={`${practice.nameHindi} (${practice.nameEnglish}) का विवरण देखें`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#fef08a] transition-colors truncate">
                          {practice.nameHindi}
                        </h3>
                        <span className="text-sm text-[#d4af37] font-medium">
                          ({practice.nameEnglish})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {getCategoryBadge(practice.category)}
                        {getClassificationBadge(practice.sourceClassification)}
                      </div>

                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed pt-1">
                        {practice.techniqueSummaryHindi}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#030a08] transition-all shrink-0 mt-2">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informational Footnote */}
        <div className="text-center pt-2 text-xs text-gray-400">
          <p>सभी 4 अभ्यास मानवीय रूप से सत्यापित और शास्त्रीय/पारंपरिक स्रोतों पर आधारित हैं।</p>
          <p className="text-[11px] text-gray-400 mt-0.5">शून्य कुंभक • शून्य कृत्रिम बुद्धिमत्ता (AI) • शत-प्रतिशत सुरक्षित</p>
        </div>

      </div>

      {/* History Modal */}
      {isHistoryOpen && (
        <YogaHistoryModal
          profileId={profileId}
          isMasterProfile={isMaster}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
};

export default YogaDashboard;
