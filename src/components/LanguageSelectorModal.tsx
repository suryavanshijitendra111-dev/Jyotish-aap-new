/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — GLOBAL LANGUAGE SELECTOR MODAL
 */

import React from 'react';
import { X, Globe, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelected?: (code: string) => void;
}

export default function LanguageSelectorModal({ isOpen, onClose, onLanguageSelected }: Props) {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  const handleSelect = (code: string) => {
    setLanguage(code as any);
    if (onLanguageSelected) {
      onLanguageSelected(code);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#030d08] border border-[#d4af37]/60 rounded-3xl w-full max-w-lg p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">भाषा चयन (Select Language)</h2>
              <p className="text-xs text-[#d4af37]/80">International & Regional Languages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="overflow-y-auto pr-1 space-y-2 pt-4 flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#d4af37]/20 to-[#b89528]/10 border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:border-[#d4af37]/40 hover:bg-black/60'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{lang.nativeName}</span>
                    <span className="text-[11px] text-[#d4af37]/80">{lang.name}</span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#d4af37] text-black flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
