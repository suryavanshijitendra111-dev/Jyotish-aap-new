import React from 'react';
import { PrashnaContext } from '../../types/kundli';
import { getPrashnaModeConfig } from '../../data/prashnaModes';
import { HelpCircle, Calendar, Clock, MapPin, Compass, ShieldCheck, X, Layers, AlertCircle, Info } from 'lucide-react';

interface Props {
  context: PrashnaContext;
  onConfirm: () => void;
  onEdit: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function PrashnaConfirmationModal({
  context,
  onConfirm,
  onEdit,
  onClose,
  isLoading
}: Props) {
  const modeConfig = getPrashnaModeConfig(context.mode || 'general');
  const details = context.supportingDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-gradient-to-b from-[#082218] to-[#030a08] border-2 border-[#d4af37]/60 rounded-3xl w-full max-w-lg p-6 shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-white my-8">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/2 transform translate-x-1/2 w-48 h-20 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-[#d4af37]/20 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#d4af37] tracking-wide">
              प्रश्न विवरण पुष्टि (Confirm Prashna)
            </h2>
            <p className="text-[11px] text-gray-400">
              वैदिक प्रश्न शास्त्र अनुसार तात्कालिक क्षण व विधा की प्रामाणिकता
            </p>
          </div>
        </div>

        {/* Mode Badge */}
        <div className="flex items-center gap-2 mb-3 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl px-3 py-2 text-xs text-[#d4af37]">
          <Layers className="w-4 h-4 shrink-0" />
          <span className="font-semibold">प्रश्न विधा (Mode):</span>
          <span className="font-bold text-white">{modeConfig.number}. {modeConfig.labelHindi}</span>
          <span className="ml-auto text-[10px] uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded border border-[#d4af37]/20 text-gray-300">
            {modeConfig.category}
          </span>
        </div>

        {/* Question Highlight */}
        <div className="bg-black/50 border border-[#d4af37]/30 rounded-2xl p-4 mb-4 shadow-inner">
          <span className="text-[10px] text-[#d4af37] uppercase tracking-wider font-semibold block mb-1">
            पूछा गया प्रश्न (Your Question):
          </span>
          <p className="text-base text-white font-medium italic leading-relaxed">
            "{context.question}"
          </p>
        </div>

        {/* Supporting Details (if present) */}
        {details && Object.keys(details).length > 0 && (
          <div className="bg-[#0f2a1f]/70 border border-[#d4af37]/25 rounded-2xl p-3 mb-4 text-xs space-y-1.5">
            <span className="text-[10px] text-[#d4af37] uppercase tracking-wider font-semibold block mb-1">
              अतिरिक्त विवरण (Supporting Details):
            </span>
            {details.objectDescription && (
              <div className="flex justify-between">
                <span className="text-gray-400">वस्तु का विवरण:</span>
                <span className="text-white font-medium">{details.objectDescription}</span>
              </div>
            )}
            {details.lastKnownPlace && (
              <div className="flex justify-between">
                <span className="text-gray-400">अंतिम ज्ञात स्थान:</span>
                <span className="text-white font-medium">{details.lastKnownPlace}</span>
              </div>
            )}
            {details.personRelation && (
              <div className="flex justify-between">
                <span className="text-gray-400">व्यक्ति से संबंध:</span>
                <span className="text-white font-medium">{details.personRelation}</span>
              </div>
            )}
            {details.symptomsOrConcern && (
              <div className="flex justify-between">
                <span className="text-gray-400">स्वास्थ्य संदर्भ:</span>
                <span className="text-white font-medium">{details.symptomsOrConcern}</span>
              </div>
            )}
            {details.optionA && details.optionB && (
              <div className="pt-1 border-t border-white/5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-semibold">विकल्प A (Option A):</span>
                  <span className="text-white font-medium">{details.optionA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400 font-semibold">विकल्प B (Option B):</span>
                  <span className="text-white font-medium">{details.optionB}</span>
                </div>
              </div>
            )}
            {details.destination && (
              <div className="flex justify-between">
                <span className="text-gray-400">गंतव्य (Destination):</span>
                <span className="text-white font-medium">{details.destination}</span>
              </div>
            )}
          </div>
        )}

        {/* Captured Deterministic Details */}
        <div className="space-y-2 mb-4 bg-[#0a1812]/90 border border-white/10 rounded-2xl p-3 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#d4af37]" /> दिनांक (Date):
            </span>
            <span className="text-white font-medium">{context.formattedDate}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#d4af37]" /> सटीक समय (Exact Time):
            </span>
            <span className="text-[#d4af37] font-mono font-semibold">{context.formattedTime}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-gray-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37]" /> स्थान (Location):
            </span>
            <span className="text-white font-medium">{context.location}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#d4af37]" /> अक्षांश व देशांतर (Coordinates):
            </span>
            <span className="text-gray-300 font-mono text-[11px]">
              {context.latitude.toFixed(4)}° N, {context.longitude.toFixed(4)}° E
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> समय क्षेत्र (Timezone):
            </span>
            <span className="text-emerald-300 font-mono text-[11px]">{context.timezone}</span>
          </div>
        </div>

        {/* Ethical / Mode Disclaimer Warning */}
        {modeConfig.disclaimer && (
          <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 mb-5 text-[11px] text-amber-200/90 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{modeConfig.disclaimer}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#030a08] font-bold rounded-2xl tracking-wider text-sm shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#030a08] border-t-transparent rounded-full animate-spin"></span>
                खगोलीय गणना हो रही है...
              </span>
            ) : (
              'पुष्टि करें एवं प्रश्न कुंडली बनाएं (Confirm & Calculate)'
            )}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onEdit}
              disabled={isLoading}
              className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs transition-colors text-center"
            >
              संशोधित करें (Edit)
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-red-300 rounded-xl text-xs transition-colors text-center"
            >
              रद्द करें (Cancel)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
