/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChamberDefinition, ChamberId } from '../../types/digitalHouse';
import { HouseResidentSummary, BhavaAstroViewModel } from '../../services/digitalHouse/houseDataContract';
import { BhavaAstroDataPanel } from './BhavaAstroDataPanel';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface ChamberDetailModalProps {
  chamber: ChamberDefinition;
  residentSummary?: HouseResidentSummary;
  astroViewModel?: BhavaAstroViewModel;
  selectedPlanetName?: string | null;
  onClose: () => void;
  onEnter: (view: string) => void;
}

export const ChamberDetailModal: React.FC<ChamberDetailModalProps> = ({
  chamber,
  residentSummary,
  astroViewModel,
  selectedPlanetName,
  onClose,
  onEnter
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#04140d]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.85)] text-white">
        
        {/* If this is an astrological house and we have an astroViewModel, render BhavaAstroDataPanel */}
        {astroViewModel ? (
          <div className="space-y-5">
            <BhavaAstroDataPanel
              viewModel={astroViewModel}
              selectedPlanetName={selectedPlanetName}
              onEnterModule={onEnter}
              onClose={onClose}
            />

            {/* Sub-modules available in this chamber */}
            {chamber.subModules && chamber.subModules.length > 0 && (
              <div className="pt-2 border-t border-[#d4af37]/20">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  उपलब्ध कक्ष मॉड्यूल एवं सेवाएँ (Sub-modules)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {chamber.subModules.map(sub => (
                    <button
                      key={sub.view}
                      onClick={() => onEnter(sub.view)}
                      className="w-full text-left p-3 rounded-xl bg-[#061e13] hover:bg-[#0c3824] border border-[#d4af37]/20 hover:border-[#d4af37]/60 transition-all text-xs font-medium text-gray-200 hover:text-white flex items-center justify-between cursor-pointer min-h-[44px]"
                    >
                      <span>{sub.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Zone */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#d4af37] tracking-widest uppercase mb-1">
                <span>3D DIGITAL LIFE HOUSE</span>
                <span aria-hidden="true">·</span>
                <span>{chamber.houseNumber ? `भाव ${chamber.houseNumber}` : 'केंद्रीय संकुल'}</span>
                {chamber.wingNameHindi && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-bold">{chamber.wingNameHindi}</span>
                  </>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                {chamber.sanskritName}
              </h2>
              <p className="text-sm sm:text-base text-emerald-300 font-medium mt-1">
                {chamber.englishTitle}
              </p>
            </div>

            {/* Astrological Placement & Significations */}
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-2xl bg-[#062417]/80 border border-[#d4af37]/20">
                <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
                  कक्ष तात्पर्य एवं विशेषता
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {chamber.signification}
                </p>
              </div>

              {/* Resident Planets in this House */}
              {residentSummary && residentSummary.planets.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#0a2e1d]/80 border border-emerald-500/30">
                  <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                    जन्म कुण्डली में विद्यमान ग्रह
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {residentSummary.planets.map(planet => (
                      <span
                        key={planet}
                        className="px-3 py-1 rounded-lg bg-[#04170e] border border-[#d4af37]/40 text-xs font-semibold text-[#d4af37]"
                      >
                        {planet}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-modules available in this chamber */}
              {chamber.subModules && chamber.subModules.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    उपलब्ध मॉड्यूल एवं सेवाएँ
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {chamber.subModules.map(sub => (
                      <button
                        key={sub.view}
                        onClick={() => onEnter(sub.view)}
                        className="w-full text-left p-3 rounded-xl bg-[#061e13] hover:bg-[#0c3824] border border-[#d4af37]/20 hover:border-[#d4af37]/60 transition-all text-xs font-medium text-gray-200 hover:text-white flex items-center justify-between cursor-pointer min-h-[44px]"
                      >
                        <span>{sub.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#d4af37]/20">
              <button
                onClick={() => onEnter(chamber.targetView)}
                className="flex-1 min-h-[48px] px-6 py-3 rounded-full bg-[#d4af37] text-black font-bold text-sm hover:bg-[#e6c250] transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>कक्ष में प्रवेश करें (Enter Chamber)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
