/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION SETTINGS & SANKALPA MODAL
 * PHASE 1.14H: DAILY GOALS, LOCAL REMINDERS, SANKALPA & SAFE PROFILE PURGE
 */

import React, { useState } from 'react';
import {
  X,
  Target,
  Bell,
  Sparkles,
  Trash2,
  AlertTriangle,
  Check,
  Info,
  Clock,
  Compass
} from 'lucide-react';
import { MeditationStorageService } from '../../services/meditation/meditationStorageService';
import { useTranslation } from '../../i18n';

interface MeditationSettingsModalProps {
  profileId: string;
  onClose: () => void;
  onSettingsUpdated?: () => void;
  showToast?: (msg: string) => void;
}

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

const SANKALPA_SUGGESTIONS = [
  'मैं प्रतिदिन शांत मन से ध्यान का अभ्यास करूँगा।',
  'मैं अपने विचारों के प्रति सजग, शांत एवं साक्षी रहूँगा।',
  'सर्वे भवन्तु सुखिनः — समस्त चराचर के कल्याण एवं शांति की भावना।',
  'श्वास के प्रति सजगता से अपने चित्त को स्थिर और प्रसन्न रखूँगा।'
];

export const MeditationSettingsModal: React.FC<MeditationSettingsModalProps> = ({
  profileId,
  onClose,
  onSettingsUpdated,
  showToast
}) => {
  const { t } = useTranslation();
  const currentSchema = MeditationStorageService.loadState(profileId);

  // Daily goal state
  const [targetMinutes, setTargetMinutes] = useState(
    currentSchema.state.goal.targetMinutesPerDay || 10
  );

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(
    currentSchema.state.goal.reminderEnabled || false
  );
  const [preferredTime, setPreferredTime] = useState(
    currentSchema.state.goal.preferredReminderTime || '06:30'
  );
  const [reminderMessage, setReminderMessage] = useState(
    currentSchema.state.goal.reminderMessage || 'शांत मन, स्थिर श्वास — ध्यान का समय'
  );

  // Sankalpa state
  const [activeSankalpa, setActiveSankalpa] = useState(
    currentSchema.state.activeSankalpa || ''
  );

  // Data clear confirmation state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const handleSaveSettings = () => {
    // 1. Update Goal & Reminder
    MeditationStorageService.updateDailyGoal(profileId, {
      targetMinutesPerDay: targetMinutes,
      reminderEnabled,
      preferredReminderTime: preferredTime,
      reminderMessage: reminderMessage.trim() || undefined
    });

    // 2. Update Sankalpa
    if (activeSankalpa.trim()) {
      MeditationStorageService.setSankalpa(profileId, activeSankalpa.trim());
    } else {
      MeditationStorageService.clearSankalpa(profileId);
    }

    setHasSaved(true);
    if (showToast) {
      showToast('सेटिंग्स एवं संकल्प सुरक्षित किए गए।');
    }
    if (onSettingsUpdated) {
      onSettingsUpdated();
    }

    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleClearMeditationData = () => {
    MeditationStorageService.clearMeditationData(profileId);
    setShowClearConfirm(false);
    if (showToast) {
      showToast('इस प्रोफ़ाइल का ध्यान डेटा साफ़ कर दिया गया।');
    }
    if (onSettingsUpdated) {
      onSettingsUpdated();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#061e14] via-[#04160e] to-[#020b07] border border-[#d4af37]/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Compass className="w-5 h-5 text-[#fef08a]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                साधना सेटिंग्स व संकल्प
              </h2>
              <p className="text-xs text-emerald-300">
                लक्ष्य, समय, संकल्प व गोपनीयता प्रबंधन
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer min-h-[44px]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* SECTION 1: DAILY GOAL SETTINGS */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>दैनिक साधना लक्ष्य (Daily Goal)</span>
            </div>
            <p className="text-xs text-gray-400">
              प्रतिदिन का साधना समय निर्धारित करें। मानक अवधि 10 मिनट है।
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
              {GOAL_OPTIONS.map((mins) => {
                const isSelected = targetMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTargetMinutes(mins)}
                    className={`min-h-[40px] py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#d4af37] border-[#fef08a] text-black shadow-md scale-105'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    <span>{mins}</span>
                    <span className="text-[10px] font-normal">{t('meditation.minutes')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: REMINDER SETTINGS */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>स्मरण समय प्राथमिकता (Reminder Preference)</span>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  reminderEnabled ? 'bg-[#d4af37]' : 'bg-white/15'
                }`}
                aria-label="Toggle reminder preference"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 left-0.5 ${
                    reminderEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="space-y-3 pt-2 animate-fade-in border-t border-white/5">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    स्मरण समय (Preferred Time)
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#d4af37]" />
                    <input
                      type="time"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="bg-black/40 border border-white/15 focus:border-[#d4af37]/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    स्मरण संदेश (Optional Note)
                  </label>
                  <input
                    type="text"
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    maxLength={100}
                    placeholder="जैसे: शांत मन, स्थिर श्वास..."
                    className="w-full bg-black/40 border border-white/15 focus:border-[#d4af37]/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-200">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-300">
                      यह केवल आपकी व्यक्तिगत समय प्राथमिकता (preference) है, स्वचालित अलार्म या बैकग्राउंड सूचना नहीं।
                    </p>
                    <p className="text-[11px] text-amber-200/80">
                      इस डिवाइस पर स्वचालित notification उपलब्ध नहीं है। आपकी reminder preference सुरक्षित रूप से सेव कर दी गई है।
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: SANKALPA MANAGEMENT */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-[#fef08a]" />
                <span>दैनिक साधना संकल्प (Active Sankalpa)</span>
              </div>
              {activeSankalpa && (
                <button
                  type="button"
                  onClick={() => setActiveSankalpa('')}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  हटाएं
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400">
              प्रत्येक साधना सत्र से पूर्व आपका संकल्प स्मरण कराया जाएगा।
            </p>

            <textarea
              value={activeSankalpa}
              onChange={(e) => setActiveSankalpa(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="अपना व्यक्तिगत साधना संकल्प लिखें..."
              className="w-full bg-black/40 border border-white/15 focus:border-[#d4af37]/60 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-all resize-none"
            />

            {/* Suggestions */}
            <div>
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">सुझाए गए शास्त्रीय संकल्प:</p>
              <div className="space-y-1.5">
                {SANKALPA_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSankalpa(sug)}
                    className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-emerald-200 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0" />
                    <span className="line-clamp-1">&ldquo;{sug}&rdquo;</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: SAFE DATA PURGE */}
          <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>ध्यान डेटा साफ़ करें (Clear Meditation Data)</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              केवल इसी प्रोफ़ाइल का ध्यान इतिहास, निरंतरता (streak) एवं संकल्प हटाया जाएगा। कुंडली, दोष, उपाय व अन्य डेटा पूर्णतः सुरक्षित रहेंगे।
            </p>

            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-xs font-bold text-red-300 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>डेटा साफ़ करने का विकल्प</span>
              </button>
            ) : (
              <div className="bg-red-950/70 border border-red-500/50 rounded-xl p-3.5 space-y-3 animate-fade-in">
                <div className="flex items-start gap-2 text-xs text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    इस profile का meditation history, streak, goals, reflections और Sankalpa हटाया जाएगा। यह कार्रवाई वापस नहीं की जा सकती।
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearMeditationData}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    हाँ, पूर्णतः साफ़ करें
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-xs rounded-xl cursor-pointer"
                  >
                    रद्द करें
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-all cursor-pointer"
          >
            रद्द करें
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#03110a] font-bold text-xs hover:brightness-110 shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            {hasSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>सहेजा गया</span>
              </>
            ) : (
              <span>सेटिंग्स सहेजें (Save)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
