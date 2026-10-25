import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, AlertCircle, Settings2 } from 'lucide-react';
import { SpeechEngine, SpeechState, SpeechSpeedPreset } from '../../services/companion/speechEngine';
import { HouseSpeaksService, HouseSpeaksScript } from '../../services/astrology/houseSpeaksService';
import { getLocalizedHouse } from '../../i18n/astrology';
import { useTranslation, LanguageCode } from '../../i18n';
import { HouseAnalysisData } from '../../types/analysis';

export interface HouseSpeaksControlProps {
  houseNum: number;
  houseData?: any;
  planets?: any[];
  analysis?: HouseAnalysisData;
  masterData?: any;
  autoPlay?: boolean;
  className?: string;
  showTextPreview?: boolean;
  onScriptGenerated?: (script: HouseSpeaksScript) => void;
}

/**
 * Universal Reusable House Speaks Control (भाव वाणी नियंत्रक)
 * 
 * Works for both occupied and empty houses across all 12 houses.
 * Controls:
 * 🔊 भाव वाणी सुनें (Play)
 * ⏸ रोकें (Pause)
 * ▶ फिर से चलाएँ (Resume)
 * 🔇 आवाज़ बंद करें (Stop)
 * गति: धीमी (0.76) | सामान्य (0.92) | तेज़ (1.05)
 */
export const HouseSpeaksControl: React.FC<HouseSpeaksControlProps> = ({
  houseNum,
  houseData,
  planets,
  analysis,
  masterData,
  autoPlay = false,
  className = '',
  showTextPreview = false,
  onScriptGenerated
}) => {
  const { language, t } = useTranslation();
  const [speechState, setSpeechState] = useState<SpeechState>('stopped');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<SpeechSpeedPreset>(() => SpeechEngine.getSpeedPreset());
  const [currentScript, setCurrentScript] = useState<HouseSpeaksScript | null>(null);
  const isBusyRef = useRef(false);

  // Generate script whenever house or language or data changes
  useEffect(() => {
    try {
      const script = HouseSpeaksService.generateScript(
        houseNum,
        masterData,
        analysis,
        language as LanguageCode
      );
      setCurrentScript(script);
      if (onScriptGenerated) {
        onScriptGenerated(script);
      }
    } catch (err) {
      console.error('Error generating House Speaks script:', err);
    }
  }, [houseNum, masterData, analysis, language, onScriptGenerated]);

  // Clean up speech on unmount or houseNum change
  useEffect(() => {
    return () => {
      SpeechEngine.stop();
    };
  }, [houseNum]);

  const handlePlay = useCallback(() => {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    setTimeout(() => { isBusyRef.current = false; }, 300);

    setErrorMessage(null);

    try {
      const script = HouseSpeaksService.generateScript(
        houseNum,
        masterData,
        analysis,
        language as LanguageCode
      );
      setCurrentScript(script);

      const success = SpeechEngine.speak(
        script.spokenText,
        language,
        (state) => setSpeechState(state),
        { profile: 'bhava', speedPreset: currentSpeed }
      );

      if (!success) {
        setErrorMessage(t('kundli.speechUnavailable') || 'ध्वनि सेवा इस ब्राउज़र में उपलब्ध नहीं है।');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('House Speaks error:', err);
      setErrorMessage(t('kundli.speechError') || 'वाणी सुनाने में समस्या हुई।');
      setSpeechState('stopped');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  }, [houseNum, masterData, analysis, language, currentSpeed, t]);

  // Auto-play on first mount if requested
  useEffect(() => {
    if (autoPlay && houseNum) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [houseNum, autoPlay, handlePlay]);

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

  const isHindi = language === 'hi' || (language as string) === 'Hindi' || language === 'sa';

  const speedLabels: Record<SpeechSpeedPreset, string> = {
    slow: isHindi ? 'धीमी (0.76)' : 'Slow (0.76)',
    normal: isHindi ? 'सामान्य (0.92)' : 'Normal (0.92)',
    fast: isHindi ? 'तेज़ (1.05)' : 'Fast (1.05)'
  };

  const localizedHouse = getLocalizedHouse(houseNum, language as LanguageCode);
  const houseLabel = localizedHouse.full || localizedHouse.label;

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        {/* Main Play / Pause / Resume / Stop Controls */}
        {speechState === 'stopped' && (
          <button
            onClick={handlePlay}
            className="group relative flex items-center gap-1.5 px-3 py-1.5 h-8 sm:h-9 rounded-lg border text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm bg-[#082218]/90 text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37]/20 hover:border-[#d4af37] hover:shadow-[0_0_10px_rgba(212,175,55,0.2)]"
            title={`${isHindi ? 'भाव वाणी सुनें' : 'Listen House Speaks'}: ${houseLabel}`}
            aria-label={`Listen to ${houseLabel}`}
          >
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37] group-hover:scale-110 transition-transform" />
            <span className="whitespace-nowrap">
              {isHindi ? 'भाव वाणी' : (t('kundli.houseSpeaks') || 'House Speaks')}
            </span>
          </button>
        )}

        {speechState === 'playing' && (
          <div className="flex items-center gap-1 bg-[#d4af37]/10 p-0.5 rounded-lg border border-[#d4af37]/40 shadow-[0_0_12px_rgba(212,175,55,0.25)]">
            {/* Pause Button */}
            <button
              onClick={handlePause}
              className="flex items-center gap-1 px-2.5 py-1 h-7 rounded-md bg-[#d4af37] text-black text-[11px] font-bold hover:bg-[#d4af37]/90 transition-all"
              title={isHindi ? 'रोकें (Pause)' : 'Pause'}
            >
              <Pause className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">{isHindi ? 'रोकें' : 'Pause'}</span>
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStop}
              className="flex items-center gap-1 px-2 py-1 h-7 rounded-md bg-[#082218] text-[#d4af37] border border-[#d4af37]/40 text-[11px] font-semibold hover:bg-red-950/40 hover:border-red-500/50 hover:text-red-300 transition-all"
              title={isHindi ? 'आवाज़ बंद करें' : 'Stop'}
            >
              <VolumeX className="w-3 h-3" />
              <span className="hidden sm:inline">{isHindi ? 'बंद' : 'Stop'}</span>
            </button>

            {/* Audio Waveform Animation */}
            <span className="flex items-center gap-0.5 px-1.5">
              <span className="w-0.5 h-2 bg-[#d4af37] rounded-full animate-[bounce_0.6s_infinite_100ms]" />
              <span className="w-0.5 h-3.5 bg-[#d4af37] rounded-full animate-[bounce_0.6s_infinite_200ms]" />
              <span className="w-0.5 h-2.5 bg-[#d4af37] rounded-full animate-[bounce_0.6s_infinite_300ms]" />
            </span>
          </div>
        )}

        {speechState === 'paused' && (
          <div className="flex items-center gap-1 bg-amber-950/40 p-0.5 rounded-lg border border-amber-500/40">
            {/* Resume Button */}
            <button
              onClick={handleResume}
              className="flex items-center gap-1 px-2.5 py-1 h-7 rounded-md bg-[#d4af37] text-black text-[11px] font-bold hover:bg-[#d4af37]/90 transition-all"
              title={isHindi ? 'फिर से चलाएँ (Resume)' : 'Resume'}
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">{isHindi ? 'फिर से चलाएँ' : 'Resume'}</span>
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStop}
              className="flex items-center gap-1 px-2 py-1 h-7 rounded-md bg-[#082218] text-gray-300 text-[11px] hover:text-red-400 transition-all"
              title={isHindi ? 'आवाज़ बंद करें' : 'Stop'}
            >
              <VolumeX className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Speed Selector Toggle Button */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="flex items-center gap-1 px-2 py-1 h-8 sm:h-9 rounded-lg border border-[#d4af37]/20 bg-[#082218]/80 text-[#d4af37]/80 hover:text-[#d4af37] hover:border-[#d4af37]/50 text-[11px] transition-all"
            title={isHindi ? 'गति चयन' : 'Speed Setting'}
          >
            <Settings2 className="w-3 h-3 text-[#d4af37]/70" />
            <span className="text-[10px] hidden md:inline">
              {currentSpeed === 'slow' ? (isHindi ? 'धीमी' : 'Slow') : currentSpeed === 'normal' ? (isHindi ? 'सामान्य' : 'Normal') : (isHindi ? 'तेज़' : 'Fast')}
            </span>
          </button>

          {/* Speed Menu Popup */}
          {showSpeedMenu && (
            <div className="absolute top-full mt-1.5 right-0 z-50 bg-[#030a08] border border-[#d4af37]/40 rounded-lg p-1.5 shadow-2xl backdrop-blur-xl min-w-[130px] space-y-1">
              <div className="text-[10px] font-semibold text-gray-400 px-2 py-0.5 border-b border-[#d4af37]/15">
                {isHindi ? 'आवाज़ की गति' : 'Voice Speed'}
              </div>
              {(['slow', 'normal', 'fast'] as SpeechSpeedPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSpeedSelect(preset)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between ${
                    currentSpeed === preset
                      ? 'bg-[#d4af37] text-black font-bold'
                      : 'text-gray-300 hover:bg-[#d4af37]/15 hover:text-[#d4af37]'
                  }`}
                >
                  <span>{speedLabels[preset]}</span>
                  {currentSpeed === preset && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Floating Error Tooltip if Speech fails */}
        {errorMessage && (
          <div className="absolute top-full mt-2 right-0 z-50 flex items-center gap-2 p-2.5 rounded-lg bg-red-950/95 border border-red-500/40 text-red-200 text-[11px] shadow-xl whitespace-nowrap backdrop-blur-md">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Optional Spoken Text Preview Banner */}
      {showTextPreview && currentScript && (
        <div className="p-2.5 bg-[#04120c]/80 border border-[#d4af37]/30 rounded-xl text-xs text-gray-200 leading-relaxed font-serif shadow-inner">
          <div className="text-[10px] text-[#d4af37] font-sans font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{isHindi ? 'भाव वाणी वक्तव्य' : 'Spoken Statement'}</span>
            <span className="text-[9px] text-gray-400 font-normal">
              {currentScript.isEmpty 
                ? (isHindi ? 'रिक्त भाव (कोई ग्रह नहीं)' : 'Empty House')
                : (isHindi ? `${currentScript.occupyingPlanets.length} ग्रह स्थित` : `${currentScript.occupyingPlanets.length} Planets`)}
            </span>
          </div>
          <p className="italic text-gray-300">
            "{currentScript.spokenText}"
          </p>
        </div>
      )}
    </div>
  );
};

export default HouseSpeaksControl;
