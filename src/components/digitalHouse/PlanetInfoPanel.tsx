/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, X, Sparkles, Orbit } from 'lucide-react';
import { PlanetAstroViewModel, BhavaAstroViewModel } from '../../services/digitalHouse/houseDataContract';
import { SpeechEngine, SpeechState } from '../../services/companion/speechEngine';

interface PlanetInfoPanelProps {
  planet: PlanetAstroViewModel;
  bhava: BhavaAstroViewModel;
  onClose: () => void;
  onSpeechStateChange?: (isSpeaking: boolean) => void;
}

/**
 * Builds deterministic spoken narration for the selected planet strictly from verified data.
 * Structure mandated by Phase 4.6-B specification.
 */
export function buildPlanetVoiceScript(planet: PlanetAstroViewModel, bhavaName: string): string {
  const fallback = 'यह जानकारी अभी उपलब्ध नहीं है।';
  const planetName = planet.localizedName || planet.name || fallback;
  const houseNum = planet.house ? `${planet.house}` : fallback;
  const bName = bhavaName || planet.bhavaName || fallback;
  const rName = planet.rashiName ? `${planet.rashiName}` : fallback;
  const nakName = planet.nakshatraName ? `${planet.nakshatraName}` : fallback;
  const padaVal = planet.pada != null ? `${planet.pada}` : fallback;
  const degVal = planet.formattedDegree || (planet.degree != null ? `${planet.degree.toFixed(2)} अंश` : fallback);

  let motionStatus = fallback;
  if (planet.isRetrograde) {
    motionStatus = 'वक्री';
  } else if (planet.motion) {
    const mLower = planet.motion.toLowerCase();
    motionStatus = mLower.includes('retro') ? 'वक्री' : 'मार्गी';
  } else {
    motionStatus = 'मार्गी';
  }

  const parts = [
    `मैं ${planetName} हूँ।`,
    `मैं आपके ${houseNum} भाव, अर्थात ${bName} में स्थित हूँ।`,
    `मैं ${rName} राशि में स्थित हूँ।`,
    `मेरा नक्षत्र ${nakName} है, और मेरा पाद ${padaVal} है।`,
    `मेरी स्थिति लगभग ${degVal} है।`,
    `मेरी गति ${motionStatus} है।`
  ];

  return parts.join(' ');
}

export const PlanetInfoPanel: React.FC<PlanetInfoPanelProps> = ({
  planet,
  bhava,
  onClose,
  onSpeechStateChange
}) => {
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');
  const fallbackNotice = 'डेटा उपलब्ध नहीं';
  const currentPlanetRef = useRef<string>(planet.name);

  // Generate verified voice script for narration
  const actualBhavaName = bhava.bhavaName || planet.bhavaName || fallbackNotice;
  const spokenScript = React.useMemo(() => {
    return buildPlanetVoiceScript(planet, actualBhavaName);
  }, [planet, actualBhavaName]);

  // Clean up and stop speech when planet changes or on unmount
  useEffect(() => {
    currentPlanetRef.current = planet.name;
    setSpeechStatus('idle');
    if (onSpeechStateChange) onSpeechStateChange(false);
    SpeechEngine.stop();

    return () => {
      SpeechEngine.stop();
      if (onSpeechStateChange) onSpeechStateChange(false);
    };
  }, [planet.name, onSpeechStateChange]);

  const handleStateUpdate = useCallback((st: SpeechState) => {
    if (st === 'playing') {
      setSpeechStatus('playing');
      if (onSpeechStateChange) onSpeechStateChange(true);
    } else if (st === 'paused') {
      setSpeechStatus('paused');
      if (onSpeechStateChange) onSpeechStateChange(false);
    } else if (st === 'stopped') {
      setSpeechStatus(prev => (prev === 'playing' ? 'finished' : 'idle'));
      if (onSpeechStateChange) onSpeechStateChange(false);
    }
  }, [onSpeechStateChange]);

  // 🔊 ग्रह बोलता है - Play narration
  const handlePlaySpeech = useCallback(() => {
    SpeechEngine.stop();
    setSpeechStatus('playing');
    if (onSpeechStateChange) onSpeechStateChange(true);

    SpeechEngine.speak(
      spokenScript,
      'hi',
      handleStateUpdate,
      {
        profile: 'planet',
        planetKey: planet.name,
        preferredGender: 'male',
        speedPreset: 'slow'
      }
    );
  }, [spokenScript, planet.name, handleStateUpdate, onSpeechStateChange]);

  // ⏸ रोकें - Pause speech
  const handlePauseSpeech = useCallback(() => {
    SpeechEngine.pause();
    setSpeechStatus('paused');
    if (onSpeechStateChange) onSpeechStateChange(false);
  }, [onSpeechStateChange]);

  // ▶ जारी रखें - Resume paused speech
  const handleResumeSpeech = useCallback(() => {
    SpeechEngine.resume();
    setSpeechStatus('playing');
    if (onSpeechStateChange) onSpeechStateChange(true);
  }, [onSpeechStateChange]);

  // 🔇 बंद करें - Stop speech
  const handleStopSpeech = useCallback(() => {
    SpeechEngine.stop();
    setSpeechStatus('idle');
    if (onSpeechStateChange) onSpeechStateChange(false);
  }, [onSpeechStateChange]);

  // Close panel and restore normal visual state
  const handleClose = useCallback(() => {
    SpeechEngine.stop();
    if (onSpeechStateChange) onSpeechStateChange(false);
    onClose();
  }, [onClose, onSpeechStateChange]);

  // Values formatted with strict fallback: never invent data
  const planetDisplayName = planet.localizedName || planet.name || fallbackNotice;
  const planetSymbol = planet.symbol || '☉';
  const bhavaNumberText = planet.house ? `भाव ${planet.house}` : fallbackNotice;
  const rashiNumberText = planet.rashiNumber ? `राशि ${planet.rashiNumber}` : fallbackNotice;
  const rashiNameText = planet.rashiName ? planet.rashiName : fallbackNotice;
  const dmsDegreeText = planet.formattedDegree || (planet.degree != null ? `${planet.degree.toFixed(2)}°` : fallbackNotice);
  const nakshatraNameText = planet.nakshatraName || fallbackNotice;
  const padaNumberText = planet.pada != null ? `${planet.pada}` : fallbackNotice;
  const nakshatraLordText = planet.nakshatraLord || fallbackNotice;
  const rashiLordText = planet.rashiLord || bhava.signLord || fallbackNotice;
  
  let motionText = fallbackNotice;
  if (planet.isRetrograde) {
    motionText = 'वक्री (वक्र गति)';
  } else if (planet.motion) {
    const isRet = planet.motion.toLowerCase().includes('retro');
    motionText = isRet ? 'वक्री (वक्र गति)' : 'मार्गी (सीधी गति)';
  } else {
    motionText = 'मार्गी';
  }

  return (
    <div
      role="dialog"
      aria-label={`${planetDisplayName} विवरण`}
      className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto w-full sm:w-96 z-40 pointer-events-auto animate-in slide-in-from-bottom duration-300"
    >
      <div className="mx-auto sm:mx-0 max-w-md sm:max-w-none rounded-t-3xl sm:rounded-3xl bg-[#03150d]/95 border-t-2 sm:border-2 border-[#d4af37]/70 backdrop-blur-xl shadow-[0_-8px_36px_rgba(0,0,0,0.85),0_0_40px_rgba(212,175,55,0.25)] text-white p-4 sm:p-5 max-h-[70vh] sm:max-h-[82vh] overflow-y-auto">
        
        {/* Top Handle for mobile drag visual cue */}
        <div className="sm:hidden w-12 h-1 bg-[#d4af37]/40 rounded-full mx-auto mb-3" />

        {/* Header: Planet Symbol, Name & Close Button */}
        <div className="flex items-start justify-between border-b border-[#d4af37]/30 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg transition-transform ${
                speechStatus === 'playing' ? 'ring-2 ring-[#d4af37] ring-offset-2 ring-offset-[#03150d] scale-105' : ''
              }`}
              style={{
                backgroundColor: `${planet.color || '#d4af37'}22`,
                borderColor: planet.color || '#d4af37',
                borderWidth: 1.5
              }}
            >
              <span style={{ color: planet.color || '#fef08a' }}>{planetSymbol}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#fef08a] tracking-wide flex items-center gap-1.5">
                  <span>{planetSymbol}</span>
                  <span>{planetDisplayName}</span>
                </h2>
                {speechStatus === 'playing' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[10px] text-[#fef08a] font-semibold animate-pulse">
                    <Volume2 className="w-3 h-3 text-[#d4af37]" />
                    वाणी सक्रिय
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-300 font-medium">
                {bhavaNumberText} • {actualBhavaName}
              </p>
            </div>
          </div>

          {/* Close Button: min 44px practical touch size */}
          <button
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-[#d4af37]/30 hover:border-[#d4af37]/70 text-xs sm:text-sm text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer font-medium"
            aria-label="बंद करें"
          >
            <X className="w-4 h-4 text-[#d4af37]" />
            <span className="hidden sm:inline">बंद करें</span>
          </button>
        </div>

        {/* Bhava & Rashi Connections (Strict Dual Identity: Bhava ≠ Rashi) */}
        <div className="grid grid-cols-2 gap-2.5 my-3">
          <div className="p-2.5 rounded-xl bg-[#041d12] border border-[#d4af37]/30">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              भाव स्थिति
            </span>
            <p className="text-sm font-bold text-white mt-0.5">
              {bhavaNumberText}
            </p>
            <p className="text-xs text-emerald-300 font-medium truncate">
              {actualBhavaName}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#041d12] border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">
              राशि स्थिति
            </span>
            <p className="text-sm font-bold text-[#fef08a] mt-0.5">
              {rashiNumberText}
            </p>
            <p className="text-xs text-white font-medium truncate">
              {rashiNameText}
            </p>
          </div>
        </div>

        {/* Phase 4.6-B: Planet Speaks Controls */}
        <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-[#062417] to-[#041d12] border border-[#d4af37]/40 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#d4af37] uppercase tracking-wider">
              <Volume2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>ग्रह बोलता है (Planet Speaks)</span>
            </div>
            {speechStatus === 'playing' && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fef08a]"></span>
              </span>
            )}
          </div>

          {/* Voice Buttons Row (Minimum 44px practical touch size each) */}
          <div className="flex flex-wrap items-center gap-2">
            {speechStatus === 'idle' && (
              <button
                onClick={handlePlaySpeech}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c250] hover:brightness-110 active:scale-[0.98] text-black font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                aria-label="ग्रह बोलता है"
              >
                <Volume2 className="w-4 h-4 text-black shrink-0" />
                <span>🔊 ग्रह बोलता है</span>
              </button>
            )}

            {speechStatus === 'playing' && (
              <>
                <button
                  onClick={handlePauseSpeech}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/60 active:scale-[0.98] text-[#fef08a] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  aria-label="रोकें"
                >
                  <Pause className="w-4 h-4 text-[#fef08a] shrink-0" />
                  <span>⏸ रोकें</span>
                </button>

                <button
                  onClick={handleStopSpeech}
                  className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 active:scale-[0.98] text-red-200 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  aria-label="बंद करें"
                >
                  <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
                  <span>🔇 बंद करें</span>
                </button>
              </>
            )}

            {speechStatus === 'paused' && (
              <>
                <button
                  onClick={handleResumeSpeech}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c250] hover:brightness-110 active:scale-[0.98] text-black font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  aria-label="जारी रखें"
                >
                  <Play className="w-4 h-4 text-black shrink-0" />
                  <span>▶ जारी रखें</span>
                </button>

                <button
                  onClick={handleStopSpeech}
                  className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 active:scale-[0.98] text-red-200 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  aria-label="बंद करें"
                >
                  <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
                  <span>🔇 बंद करें</span>
                </button>
              </>
            )}

            {speechStatus === 'finished' && (
              <button
                onClick={handlePlaySpeech}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c250] hover:brightness-110 active:scale-[0.98] text-black font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                aria-label="फिर से सुनें"
              >
                <RotateCcw className="w-4 h-4 text-black shrink-0" />
                <span>🔁 फिर से सुनें</span>
              </button>
            )}
          </div>
        </div>

        {/* Verified Astronomical Parameters (Data Grid) */}
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#02130b] border border-[#d4af37]/20 flex items-center justify-between">
            <span className="text-gray-400 font-medium">डिग्री (DMS)</span>
            <span className="font-mono font-bold text-[#fef08a] text-sm">
              {dmsDegreeText}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-[#02130b] border border-[#d4af37]/20">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">
                नक्षत्र
              </span>
              <span className="font-bold text-white text-xs mt-0.5 block truncate">
                {nakshatraNameText}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#02130b] border border-[#d4af37]/20">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">
                पाद
              </span>
              <span className="font-bold text-emerald-400 text-xs mt-0.5 block">
                {padaNumberText !== fallbackNotice ? `पाद ${padaNumberText}` : fallbackNotice}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-[#02130b] border border-[#d4af37]/20">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">
                नक्षत्र स्वामी
              </span>
              <span className="font-bold text-white text-xs mt-0.5 block truncate">
                {nakshatraLordText}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#02130b] border border-[#d4af37]/20">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">
                राशि स्वामी
              </span>
              <span className="font-bold text-[#fef08a] text-xs mt-0.5 block truncate">
                {rashiLordText}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#02130b] border border-[#d4af37]/20 flex items-center justify-between">
            <span className="text-gray-400 font-medium">गति (Motion)</span>
            <span className="font-semibold text-white">
              {motionText}
            </span>
          </div>
        </div>

        {/* Footer: Close button as specified in prompt: "× बंद करें" */}
        <div className="mt-3.5 pt-2.5 border-t border-[#d4af37]/20">
          <button
            onClick={handleClose}
            className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-xs text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium"
          >
            <span>× बंद करें</span>
          </button>
        </div>

      </div>
    </div>
  );
};
