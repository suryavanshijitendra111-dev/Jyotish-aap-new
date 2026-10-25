import { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Droplets, 
  ShieldCheck, 
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  TWELVE_SURYA_NAMES, 
  SuryaNameItem 
} from '../../types/pratahSanskar';
import { SpeechEngine } from '../../services/companion/speechEngine';

interface SuryaArghyaProps {
  onComplete: () => void;
  showToast: (msg: string) => void;
  language?: 'Hindi' | 'English';
}

export default function SuryaArghya({
  onComplete,
  showToast,
  language = 'Hindi'
}: SuryaArghyaProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [isCompletedAll, setIsCompletedAll] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<any>(null);

  const currentName: SuryaNameItem = TWELVE_SURYA_NAMES[currentIndex];

  // Draw Solar Mandala & Shimmering Rays Animation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let angle = 0;

    const render = () => {
      const w = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
      const h = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const baseRadius = Math.min(w, h) * 0.28;

      // Outer pulsating glow
      const pulse = Math.sin(angle * 2) * 8;
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, baseRadius + 70 + pulse);
      grad.addColorStop(0, 'rgba(253, 230, 138, 0.95)');
      grad.addColorStop(0.3, 'rgba(245, 158, 11, 0.6)');
      grad.addColorStop(0.7, 'rgba(217, 119, 6, 0.2)');
      grad.addColorStop(1, 'rgba(217, 119, 6, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius + 70 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // 12 Sunbeams representing 12 Aditya Names
      for (let i = 0; i < 12; i++) {
        const rayAngle = angle + (i * Math.PI * 2) / 12;
        const isCurrent = i === currentIndex;
        const rayLength = baseRadius + (isCurrent ? 55 + pulse : 35);
        const rayWidth = isCurrent ? 4 : 2;

        const x1 = cx + Math.cos(rayAngle) * (baseRadius + 5);
        const y1 = cy + Math.sin(rayAngle) * (baseRadius + 5);
        const x2 = cx + Math.cos(rayAngle) * rayLength;
        const y2 = cy + Math.sin(rayAngle) * rayLength;

        ctx.strokeStyle = isCurrent ? '#fef08a' : 'rgba(212, 175, 55, 0.45)';
        ctx.lineWidth = rayWidth * window.devicePixelRatio;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Inner Solar Disk
      const innerGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, baseRadius);
      innerGrad.addColorStop(0, '#fffbeb');
      innerGrad.addColorStop(0.5, '#f59e0b');
      innerGrad.addColorStop(1, '#b45309');

      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      angle += 0.006;
      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [currentIndex]);

  // Recite current mantra if audio is enabled
  useEffect(() => {
    if (audioEnabled && isPlaying) {
      const textToSpeak = `${currentName.mantra}। ${currentName.hindiMeaning}`;
      SpeechEngine.speak(textToSpeak, 'Hindi');
    }
  }, [currentIndex, audioEnabled, isPlaying]);

  // Auto-advance timer when playing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        if (currentIndex < TWELVE_SURYA_NAMES.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setIsCompletedAll(true);
          showToast('12 सूर्य नामों का स्मरण पूर्ण हुआ!');
        }
      }, 5500);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, showToast]);

  const handleNext = () => {
    if (currentIndex < TWELVE_SURYA_NAMES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompletedAll(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRepeat = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
    setIsCompletedAll(false);
    showToast('सूर्य नमस्कार नाम स्मरण पुनः आरंभ किया गया');
  };

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (audioEnabled) {
        SpeechEngine.speak(`${currentName.mantra}। ${currentName.hindiMeaning}`, 'Hindi');
      }
    } else {
      setIsPlaying(false);
      SpeechEngine.stop();
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Visual Header & Sacred Instructions */}
      <div className="bg-gradient-to-r from-[#0d2a1f] via-[#092017] to-[#04120c] border border-[#d4af37]/40 rounded-3xl p-5 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f59e0b] p-0.5 shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <div className="w-full h-full bg-[#04120c] rounded-2xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-[#d4af37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  सूर्य अर्घ्य एवं द्वादश नाम स्मरण
                </h3>
                <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 px-2 py-0.5 rounded-full font-bold">
                  वैदिक परंपरा
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                "अब सूर्यदेव को तांबे के पात्र से जल अर्पित करते हुए 12 दिव्य नामों का स्मरण करें।"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const next = !audioEnabled;
                setAudioEnabled(next);
                if (!next) SpeechEngine.stop();
                showToast(next ? 'मंत्र उच्चारण चालू' : 'मंत्र उच्चारण मूक किया गया');
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                audioEnabled 
                  ? 'border-[#d4af37]/50 bg-[#d4af37]/15 text-[#d4af37]' 
                  : 'border-white/10 bg-white/5 text-gray-400'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{audioEnabled ? 'ध्वनि चालू' : 'ध्वनि मूक'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Surya Mandala Visualization & Active Mantra Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left/Top: Interactive Canvas Orbit / Mandala */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#05160f]/80 border border-[#d4af37]/30 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="w-64 h-64 relative flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[11px] font-bold text-black/80 tracking-widest uppercase">
                नाम #{currentIndex + 1}
              </span>
              <span className="text-sm font-bold text-[#451a03]">
                {currentName.transliteration.split(' ')[1] || 'Sūrya'}
              </span>
            </div>
          </div>

          {/* Arghya Symbolic Tip */}
          <p className="text-[11px] text-gray-300 text-center mt-3 bg-black/30 border border-white/10 px-3 py-1.5 rounded-xl">
            तांबे के लोटे को दोनों हाथों से सिर के ऊपर उठाकर जल की गिरती धार के मध्य से सूर्य का दर्शन करें।
          </p>
        </div>

        {/* Right: Mantra Detail, Recitation & Controls */}
        <div className="lg:col-span-7 bg-[#051710] border border-[#d4af37]/40 rounded-3xl p-6 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          {/* Step Indicator Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-semibold text-[#d4af37] tracking-wider uppercase">
              द्वादश आदित्य नाम {currentIndex + 1} / 12
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {Math.round(((currentIndex + 1) / 12) * 100)}% पूर्ण
            </span>
          </div>

          {/* 12-Step Progress Dots Bar */}
          <div className="grid grid-cols-12 gap-1 sm:gap-1.5">
            {TWELVE_SURYA_NAMES.map((item, idx) => (
              <button
                key={item.number}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-[#d4af37] ring-2 ring-[#d4af37]/50 scale-y-125'
                    : idx < currentIndex
                    ? 'bg-[#10b981]'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                title={`${item.number}. ${item.mantra}`}
              />
            ))}
          </div>

          {/* Mantra Display Box */}
          <div className="bg-gradient-to-b from-[#0a2318] to-[#04120c] border border-[#d4af37]/50 rounded-2xl p-6 text-center space-y-3 relative overflow-hidden shadow-inner">
            <div className="inline-block bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold px-3 py-1 rounded-full">
              मंत्र #{currentIndex + 1}
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#fef08a] tracking-wide drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
              {currentName.mantra}
            </h2>

            <p className="text-sm font-serif italic text-gray-300">
              {currentName.transliteration}
            </p>

            <div className="pt-2 border-t border-white/10 text-left space-y-2 text-xs">
              <p className="text-gray-200 leading-relaxed">
                <strong className="text-[#d4af37]">अर्थ: </strong>
                {currentName.hindiMeaning}
              </p>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                <strong className="text-gray-300">English: </strong>
                {currentName.englishMeaning}
              </p>
              <p className="text-emerald-300/90 leading-relaxed text-[11px] bg-emerald-950/40 border border-emerald-500/20 p-2 rounded-xl">
                <strong className="text-emerald-200">दार्शनिक प्रेरणा: </strong>
                {currentName.philosophicalSignificance}
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="पिछला नाम"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="px-5 py-3 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#030a08] font-bold rounded-xl text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'रोकें' : 'स्वचालित जप'}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === TWELVE_SURYA_NAMES.length - 1}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="अगला नाम"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={handleRepeat}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition cursor-pointer"
                title="पुनः आरंभ"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onComplete}
              className="px-5 py-3 bg-[#0c3123] border border-[#10b981]/50 text-[#10b981] font-bold rounded-xl text-xs hover:bg-[#10b981]/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              <span>अर्घ्य पूर्ण • आगे बढ़ें</span>
            </button>
          </div>

          {/* Guardrail Disclaimer */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-gray-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
            <p>
              (वैदिक संस्कार परामर्श): यह अनुष्ठान प्रकृति, सूर्य और चेतना के प्रति कृतज्ञता की अभिव्यक्ति है। यह किसी सांसारिक लाभ, धन, अथवा असाध्य व्याधि के चमत्कारिक समाधान का दावा नहीं करता।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
