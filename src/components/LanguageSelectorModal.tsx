import React, { useState, useEffect } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES, LanguageCode } from '../i18n';
import { Globe, Check, X, Sparkles, Search } from 'lucide-react';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelected?: (code: LanguageCode) => void;
}

export default function LanguageSelectorModal({ isOpen, onClose, onLanguageSelected }: LanguageSelectorModalProps) {
  const { language, setLanguage, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Lock background scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.script.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    if (onLanguageSelected) {
      onLanguageSelected(code);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#082218] border border-[#d4af37]/50 rounded-3xl p-4 sm:p-6 text-white flex flex-col h-[88vh] h-[88dvh] max-h-[660px] shadow-[0_10px_40px_rgba(0,0,0,0.85)] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8c7322] p-[1px] flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#030a08] rounded-2xl flex items-center justify-center text-[#d4af37]">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#d4af37] tracking-wide">
                {t('settings.languageSelection')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                13 Indian Languages • भारत की पवित्र भाषाएं
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-300 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="pt-3 pb-2 sm:pt-4 sm:pb-3 relative z-10 shrink-0">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${t('common.search')} (हिंदी, English, मराठी, தமிழ்...)`}
              className="w-full min-h-[48px] bg-black/40 border border-[#d4af37]/30 rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>
        </div>

        {/* Language Grid - Dedicated Touch Scroll Container */}
        <div 
          className="overflow-y-auto min-h-0 py-2 flex flex-col gap-2.5 flex-1 pr-1.5 relative z-10 custom-scrollbar overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y'
          }}
        >
          {filteredLanguages.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => handleSelect(item.code)}
                className={`w-full min-h-[64px] text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-r from-[#d4af37]/25 to-emerald-950/60 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                    : 'bg-black/30 border-white/10 hover:border-[#d4af37]/40 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isSelected 
                      ? 'bg-[#d4af37] text-[#030a08]' 
                      : 'bg-white/10 text-gray-300 group-hover:text-[#d4af37]'
                  }`}>
                    {item.code.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                        {item.nativeName}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-300">
                        ({item.name})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-[#d4af37] font-semibold">
                        {item.script}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-300 italic">
                        "{item.firstPersonMoon}"
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-2 shrink-0">
                  {isSelected ? (
                    <div className="w-8 h-8 rounded-full bg-[#d4af37] text-[#030a08] flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold text-gray-400 group-hover:text-[#d4af37] transition-colors whitespace-nowrap">
                      {t('common.select') || 'Select'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Deterministic Data Guarantee Footer Note */}
        <div className="pt-3 sm:pt-4 border-t border-white/10 mt-2 relative z-10 flex flex-col gap-2.5 shrink-0 pb-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#d4af37] leading-relaxed">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t('settings.singleSourceTruth') || 'Single Source of Truth: Language never alters astronomical degrees or calculations.'}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
