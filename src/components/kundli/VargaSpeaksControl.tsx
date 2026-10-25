import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, Square, Settings2 } from 'lucide-react';
import { SpeechEngine, SpeechState, SpeechSpeedPreset, VoiceProfileType } from '../../services/companion/speechEngine';
import { useTranslation, LanguageCode } from '../../i18n';

export interface VargaSpeaksControlProps {
  spokenText: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  profile?: VoiceProfileType;
}

/**
 * Centralized Varga Speaks Control (वर्ग वाणी नियंत्रक)
 * 
 * Controls:
 * ▶ बोलें (Play)
 * ⏸ रोकें (Pause)
 * ▶ जारी रखें (Resume)
 * ■ बंद करें (Stop)
 * गति: धीमी (0.76) | सामान्य (0.92) | तेज़ (1.05)
 */
export const VargaSpeaksControl: React.FC<VargaSpeaksControlProps> = ({
  spokenText,
  title,
  autoPlay = false,
  className = '',
  profile = 'default'
}) => {
  const { language, t } = useTranslation();
  const [speechState, setSpeechState] = useState<SpeechState>('stopped');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<SpeechSpeedPreset>(() => SpeechEngine.getSpeedPreset());
  const isBusyRef = useRef(false);

  const isHindi = language === 'hi' || (language as string) === 'Hindi' || language === 'sa';

  // Stop speech when unmounted or spokenText changes
  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, [spokenText]);

  const handlePlay = useCallback(() => {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    setTimeout(() => { isBusyRef.current = false; }, 300);

    setErrorMessage(null);

    try {
      const success = SpeechEngine.speak(
        spokenText,
        language as LanguageCode,
        (state) => setSpeechState(state),
        { profile, speedPreset: currentSpeed }
      );

      if (!success) {
        setErrorMessage(isHindi ? 'ध्वनि सेवा इस ब्राउज़र में उपलब्ध नहीं है।' : 'Speech unavailable in this browser.');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Varga Speaks error:', err);
      setErrorMessage(isHindi ? 'वाणी सुनाने में समस्या हुई।' : 'Error playing speech.');
      setSpeechState('stopped');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  }, [spokenText, language, currentSpeed, isHindi]);

  // Optional auto-play
  useEffect(() => {
    if (autoPlay && spokenText) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [spokenText, autoPlay, handlePlay]);

  const handlePause = useCallback(() => {
    SpeechEngine.pause();
    setSpeechState('paused');
  }, []);

  const handleResume = useCallback(() => {
    SpeechEngine.resume();
    setSpeechState('playing');
  }, []);

  const handleStop = useCallback(() => {
    SpeechEngine.stop();
    setSpeechState('stopped');
  }, []);

  const handleSpeedSelect = (preset: SpeechSpeedPreset) => {
    setCurrentSpeed(preset);
    SpeechEngine.setSpeedPreset(preset);
    setShowSpeedMenu(false);

    if (speechState === 'playing') {
      SpeechEngine.stop();
      setTimeout(() => {
        handlePlay();
      }, 100);
    }
  };

  const speedLabels: Record<SpeechSpeedPreset, string> = {
    slow: isHindi ? 'धीमी (0.76)' : 'Slow (0.76)',
    normal: isHindi ? 'सामान्य (0.92)' : 'Normal (0.92)',
    fast: isHindi ? 'तेज़ (1.05)' : 'Fast (1.05)'
  };

  return (
    <div className={`relative flex items-center gap-1.5 ${className}`}>
      {/* 1. STOPPED STATE -> ▶ बोलें Button */}
      {speechState === 'stopped' && (
        <button
          onClick={handlePlay}
          className="group relative flex items-center justify-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl border text-xs font-bold tracking-wide transition-all duration-300 shadow-md bg-[#082218] text-[#d4af37] border-[#d4af37]/50 hover:bg-[#d4af37]/25 hover:border-[#d4af37] active:scale-95 cursor-pointer"
          title={title || (isHindi ? 'वाणी सुनें' : 'Listen')}
          aria-label={title || (isHindi ? 'वाणी सुनें' : 'Listen')}
        >
          <Volume2 className="w-4 h-4 text-[#d4af37] group-hover:scale-110 transition-transform" />
          <span className="whitespace-nowrap font-medium">
            {isHindi ? 'बोलें' : 'Listen'}
          </span>
        </button>
      )}

      {/* 2. PLAYING STATE -> ⏸ रोकें + ■ बंद करें */}
      {speechState === 'playing' && (
        <div className="flex items-center gap-1.5 bg-[#d4af37]/15 p-1 rounded-xl border border-[#d4af37]/50 shadow-[0_0_12px_rgba(212,175,55,0.25)]">
          {/* Pause Button */}
          <button
            onClick={handlePause}
            className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg bg-[#d4af37] text-black text-xs font-bold hover:bg-[#d4af37]/90 active:scale-95 transition-all cursor-pointer"
            title={isHindi ? 'रोकें (Pause)' : 'Pause'}
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span className="whitespace-nowrap">{isHindi ? 'रोकें' : 'Pause'}</span>
          </button>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            className="flex items-center justify-center gap-1 px-2.5 py-2 min-h-[44px] rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold hover:bg-red-900 active:scale-95 transition-all cursor-pointer"
            title={isHindi ? 'बंद करें (Stop)' : 'Stop'}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="whitespace-nowrap">{isHindi ? 'बंद करें' : 'Stop'}</span>
          </button>

          {/* Voice Wave Indicator */}
          <div className="flex items-center gap-0.5 px-1.5" title="Playing...">
            <span className="w-1 h-3.5 bg-[#d4af37] rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-[#d4af37] rounded-full animate-pulse delay-100" />
            <span className="w-1 h-2.5 bg-[#d4af37] rounded-full animate-pulse delay-200" />
          </div>
        </div>
      )}

      {/* 3. PAUSED STATE -> ▶ जारी रखें + ■ बंद करें */}
      {speechState === 'paused' && (
        <div className="flex items-center gap-1.5 bg-amber-950/50 p-1 rounded-xl border border-amber-500/50 shadow-md">
          {/* Resume Button */}
          <button
            onClick={handleResume}
            className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg bg-[#d4af37] text-black text-xs font-bold hover:bg-[#d4af37]/90 active:scale-95 transition-all cursor-pointer"
            title={isHindi ? 'जारी रखें (Resume)' : 'Resume'}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="whitespace-nowrap">{isHindi ? 'जारी रखें' : 'Resume'}</span>
          </button>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            className="flex items-center justify-center gap-1 px-2.5 py-2 min-h-[44px] rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold hover:bg-red-900 active:scale-95 transition-all cursor-pointer"
            title={isHindi ? 'बंद करें (Stop)' : 'Stop'}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="whitespace-nowrap">{isHindi ? 'बंद करें' : 'Stop'}</span>
          </button>
        </div>
      )}

      {/* Speed Setting Toggle Button */}
      <div className="relative">
        <button
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className={`flex items-center justify-center w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl border transition-all cursor-pointer ${
            showSpeedMenu 
              ? 'bg-[#d4af37] text-black border-[#d4af37]' 
              : 'bg-[#04120c] text-gray-400 border-white/10 hover:text-white hover:border-[#d4af37]/50'
          }`}
          title={isHindi ? 'गति नियंत्रण' : 'Speed Controls'}
        >
          <Settings2 className="w-4 h-4" />
        </button>

        {/* Speed Dropdown Menu */}
        {showSpeedMenu && (
          <div 
            className="absolute right-0 top-full mt-1.5 z-50 bg-[#082218] border border-[#d4af37]/40 rounded-xl p-1.5 shadow-2xl min-w-[130px] space-y-1"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-2 py-1 text-[10px] text-gray-400 border-b border-white/10 font-bold uppercase tracking-wider">
              {isHindi ? 'वाणी गति' : 'Speech Speed'}
            </div>
            {(['slow', 'normal', 'fast'] as SpeechSpeedPreset[]).map(preset => (
              <button
                key={preset}
                onClick={() => handleSpeedSelect(preset)}
                className={`w-full text-left px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  currentSpeed === preset
                    ? 'bg-[#d4af37] text-black font-bold'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{speedLabels[preset]}</span>
                {currentSpeed === preset && <span className="text-[10px]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-red-950/95 border border-red-500 rounded-xl p-2.5 shadow-xl text-xs text-red-200 flex items-center gap-2 min-w-[200px]">
          <VolumeX className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
