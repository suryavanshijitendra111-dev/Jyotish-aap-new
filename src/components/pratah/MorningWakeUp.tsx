import { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Sun, 
  Clock, 
  Play, 
  Square, 
  RotateCcw, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  PratahSanskarSettings, 
  PratahAudioChoice 
} from '../../types/pratahSanskar';
import { MorningAlarmService } from '../../services/pratah/morningAlarmService';

interface MorningWakeUpProps {
  settings: PratahSanskarSettings;
  onStartRoutine: () => void;
  onDismiss: () => void;
  showToast: (msg: string) => void;
  isSimulatedAlarm?: boolean;
}

export default function MorningWakeUp({
  settings,
  onStartRoutine,
  onDismiss,
  showToast,
  isSimulatedAlarm = false
}: MorningWakeUpProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(isSimulatedAlarm);
  const [selectedAudio, setSelectedAudio] = useState<PratahAudioChoice>(settings.audioChoice);
  const [snoozeMessage, setSnoozeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isSimulatedAlarm && settings.enabled && selectedAudio !== 'silent') {
      MorningAlarmService.playAlarmAudio(selectedAudio, settings.volume, settings.fadeIn);
      setIsPlayingAudio(true);
    }
    return () => {
      MorningAlarmService.stopAlarmAudio();
    };
  }, [isSimulatedAlarm, selectedAudio, settings]);

  const handleTogglePlay = (choice: PratahAudioChoice) => {
    setSelectedAudio(choice);
    if (isPlayingAudio && selectedAudio === choice) {
      MorningAlarmService.stopAlarmAudio();
      setIsPlayingAudio(false);
    } else {
      MorningAlarmService.playAlarmAudio(choice, settings.volume, settings.fadeIn);
      setIsPlayingAudio(true);
    }
  };

  const handleStopAlarm = () => {
    MorningAlarmService.stopAlarmAudio();
    setIsPlayingAudio(false);
    showToast('अलार्म बंद किया गया। शुभ प्रभात!');
  };

  const handleSnooze = () => {
    const until = MorningAlarmService.snooze(settings.snoozeMinutes);
    setIsPlayingAudio(false);
    const timeStr = until.toTimeString().slice(0, 5);
    setSnoozeMessage(`अलार्म ${settings.snoozeMinutes} मिनट के लिए स्नूज़ किया गया (${timeStr})`);
    showToast(`स्नूज़: ${timeStr} पर पुनः याद दिलाएगा`);
  };

  const handleStart = () => {
    MorningAlarmService.stopAlarmAudio();
    setIsPlayingAudio(false);
    onStartRoutine();
  };

  const reliabilityNotice = MorningAlarmService.getPlatformReliabilityNotice();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#d4af37]/40 bg-gradient-to-b from-[#0a2318] via-[#051710] to-[#020906] p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] text-white">
      {/* Background Animated Sunrise Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[#f59e0b]/25 via-[#d4af37]/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Floating Solar Halo */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Sun & Logo Emblem */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#f59e0b] to-[#fef08a] p-[2px] shadow-[0_0_35px_rgba(212,175,55,0.4)] animate-spin-slow">
            <div className="w-full h-full rounded-full bg-[#04120c] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/20 to-transparent"></div>
              <Sun className="w-12 h-12 text-[#d4af37] animate-pulse" />
            </div>
          </div>
          <span className="absolute -bottom-2 bg-[#d4af37] text-[#030a08] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
            JeevanDarpan
          </span>
        </div>

        {/* Morning Greeting */}
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
          सुप्रभात 🙏
        </h2>
        <p className="text-sm sm:text-base text-[#d4af37] font-medium mt-1">
          आज का जीवन दर्पण आपका साथ देने के लिए तैयार है।
        </p>
        <p className="text-xs text-gray-400 mt-1 max-w-md">
          प्रातःकाल का यह शांत समय आत्मचिंतन, सूर्य वंदना और सात्विक संकल्प के लिए सर्वोत्तम है।
        </p>

        {/* Wake-up Time Pill */}
        <div className="mt-4 inline-flex items-center gap-2 bg-[#061e14] border border-[#d4af37]/30 px-3.5 py-1.5 rounded-full text-xs text-gray-300">
          <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>जागने का समय: <strong className="text-white">{settings.wakeUpTime}</strong></span>
          <span className="text-gray-500">•</span>
          <span>{settings.alarmDays.join(', ')}</span>
        </div>

        {snoozeMessage && (
          <div className="mt-3 text-xs bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30 px-3 py-1 rounded-xl">
            {snoozeMessage}
          </div>
        )}

        {/* Sound Selection Grid */}
        <div className="mt-6 w-full max-w-lg bg-[#04140d]/80 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 text-xs text-gray-300">
            <span className="font-medium text-[#d4af37] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" /> जाग्रति ध्वनि (Optional Audio):
            </span>
            <span className="text-[11px] text-gray-400">धार्मिक बाध्यता रहित</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleTogglePlay('gayatri')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                selectedAudio === 'gayatri'
                  ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>गायत्री मंत्र</span>
              <span className="text-[9px] opacity-75">तन्पुरा + जप</span>
            </button>

            <button
              onClick={() => handleTogglePlay('instrumental')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                selectedAudio === 'instrumental'
                  ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>बांसुरी/राग</span>
              <span className="text-[9px] opacity-75">शांत तान</span>
            </button>

            <button
              onClick={() => handleTogglePlay('nature')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                selectedAudio === 'nature'
                  ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>प्राकृतिक भोर</span>
              <span className="text-[9px] opacity-75">पक्षियों की चहचहाहट</span>
            </button>

            <button
              onClick={() => handleTogglePlay('silent')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                selectedAudio === 'silent'
                  ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <VolumeX className="w-4 h-4" />
              <span>मौन / शांत</span>
              <span className="text-[9px] opacity-75">केवल दृश्य</span>
            </button>
          </div>

          {/* Playing Status Bar */}
          {isPlayingAudio && selectedAudio !== 'silent' && (
            <div className="mt-3 flex items-center justify-between bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping"></span>
                <span>ध्वनि सक्रिय है ({selectedAudio})</span>
              </div>
              <button
                onClick={handleStopAlarm}
                className="px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 text-[11px] font-medium transition cursor-pointer"
              >
                ध्वनि रोकें
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          {isPlayingAudio && (
            <>
              <button
                onClick={handleSnooze}
                className="px-4 py-3 bg-[#082218] border border-white/20 rounded-2xl text-xs font-semibold text-gray-200 hover:bg-[#0c3123] active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> स्नूज़ ({settings.snoozeMinutes}m)
              </button>

              <button
                onClick={handleStopAlarm}
                className="px-4 py-3 bg-[#1e1515] border border-red-500/30 rounded-2xl text-xs font-semibold text-red-300 hover:bg-red-950/40 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5" /> अलार्म रोकें
              </button>
            </>
          )}

          <button
            onClick={handleStart}
            className="flex-1 min-w-[200px] px-6 py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#b89528] text-[#030a08] font-bold text-sm rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>शुरू करें प्रातः संस्कार</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Transparent Web Limitation Notice */}
        <div className="mt-6 p-3 bg-white/5 border border-white/10 rounded-2xl max-w-lg text-[11px] text-gray-400 text-left flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-gray-300">{reliabilityNotice.title}: </span>
            <span>{reliabilityNotice.explanation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
