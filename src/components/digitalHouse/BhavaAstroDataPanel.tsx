/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Compass, Moon, Sun, Orbit, ChevronDown, ChevronUp, Info, Volume2, Shield } from 'lucide-react';
import { BhavaAstroViewModel, PlanetAstroViewModel } from '../../services/digitalHouse/houseDataContract';
import { useTranslation } from '../../i18n';
import { getCurrentLanguage } from '../../i18n';

interface BhavaAstroDataPanelProps {
  viewModel: BhavaAstroViewModel;
  selectedPlanetName?: string | null;
  onSelectPlanet?: (planetName: string) => void;
  onEnterModule?: (targetView: string) => void;
  onClose?: () => void;
  compact?: boolean;
}

export const BhavaAstroDataPanel: React.FC<BhavaAstroDataPanelProps> = ({
  viewModel,
  selectedPlanetName,
  onSelectPlanet,
  onEnterModule,
  onClose,
  compact = false
}) => {
  const { t } = useTranslation();
  const lang = getCurrentLanguage();
  const [expandedMonologuePlanet, setExpandedMonologuePlanet] = useState<string | null>(selectedPlanetName || null);
  const [showAstronomicalDetails, setShowAstronomicalDetails] = useState<boolean>(true);

  const isHindi = lang === 'hi' || lang === 'sa' || lang === 'mr';

  const toggleMonologue = (name: string) => {
    setExpandedMonologuePlanet(prev => (prev === name ? null : name));
  };

  return (
    <div className="w-full flex flex-col space-y-4 text-white">
      {/* 1. Header: Bhava Number & Bhava Name */}
      <div className="flex items-start justify-between border-b border-[#d4af37]/30 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#d4af37] tracking-widest uppercase mb-1">
            <span className="px-2 py-0.5 rounded bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#fef08a]">
              {viewModel.devanagariNum ? `भाव ${viewModel.devanagariNum}` : `HOUSE ${viewModel.bhavaNumber}`}
            </span>
            <span>·</span>
            <span className="text-emerald-400 font-bold">{viewModel.wingNameHindi || 'प्रासाद प्रकोष्ठ'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide flex items-center gap-2">
            <span>{viewModel.bhavaName}</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-300 font-medium mt-0.5">
            {viewModel.englishTitle}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close Panel"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. Kundli-Style Dual Identity: Bhava Number ≠ Rashi Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Left: Bhava (House) Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#062417] to-[#03150d] border border-[#d4af37]/30 shadow-md">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{isHindi ? 'स्थान / भाव' : 'Bhava (House)'}</span>
            <span className="text-[#fef08a] font-mono font-bold text-sm">#{viewModel.bhavaNumber}</span>
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl text-[#fef08a]">{viewModel.devanagariNum}</span>
            <span>{viewModel.bhavaName}</span>
          </div>
          <div className="text-xs text-gray-300 mt-1 line-clamp-2">
            {viewModel.signification}
          </div>
        </div>

        {/* Right: Rashi (Zodiac Sign) Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0a2f1f] to-[#041910] border border-emerald-500/40 shadow-md">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{isHindi ? 'उस भाव में स्थापित राशि' : 'Zodiac Sign in House'}</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-900/60 border border-emerald-400/30 text-emerald-300 font-mono text-xs">
              {isHindi ? `राशि ${viewModel.rashiNumber}` : `Sign ${viewModel.rashiNumber}`}
            </span>
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl text-[#fef08a] leading-none" title={viewModel.rashiName}>
              {viewModel.rashiSymbol}
            </span>
            <span>{viewModel.rashiName}</span>
            <span className="text-xs text-gray-400 font-normal">({viewModel.rashiNameEn})</span>
          </div>
          <div className="text-xs text-emerald-300/90 mt-1 flex items-center gap-3">
            <span>
              {isHindi ? 'राशि स्वामी' : 'Sign Lord'}: <strong className="text-white">{viewModel.signLord}</strong>
            </span>
            {viewModel.cuspFormattedDegree && (
              <span>
                {isHindi ? 'संधि' : 'Cusp'}: <strong className="text-[#fef08a]">{viewModel.cuspFormattedDegree}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Occupying Planets in this Bhava */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pt-1">
          <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
            <Orbit className="w-4 h-4 text-[#d4af37]" />
            <span>{isHindi ? 'भावस्थ ग्रह (Planetary Occupancy)' : 'Planets in this Bhava'}</span>
            <span className="px-2 py-0.2 rounded-full bg-[#d4af37]/20 text-[11px] text-[#fef08a]">
              {viewModel.planets.length}
            </span>
          </h3>

          <button
            onClick={() => setShowAstronomicalDetails(!showAstronomicalDetails)}
            className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer min-h-[36px]"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showAstronomicalDetails ? (isHindi ? 'संक्षिप्त' : 'Compact') : (isHindi ? 'खगोलीय विवरण' : 'Astro Details')}</span>
          </button>
        </div>

        {/* Case A: 0 Planets in this Bhava */}
        {viewModel.planets.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#04180f]/90 border border-dashed border-[#d4af37]/30 text-center space-y-1.5">
            <p className="text-sm font-semibold text-gray-300">
              {isHindi ? 'इस भाव में कोई ग्रह स्थित नहीं है।' : 'No planets occupy this Bhava.'}
            </p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {isHindi
                ? `यह कक्ष राशि स्वामी ${viewModel.signLord} एवं दृष्टि संबंधों द्वारा संचालित होता है।`
                : `This house is governed by its sign lord ${viewModel.signLord} and aspectual influences.`}
            </p>
          </div>
        ) : (
          /* Case B: 1 or More Planets */
          <div className="space-y-3">
            {viewModel.planets.map((planet) => {
              const isSelected = selectedPlanetName === planet.name;
              const isMonologueOpen = expandedMonologuePlanet === planet.name;

              return (
                <div
                  key={planet.name}
                  className={`rounded-2xl transition-all p-3.5 sm:p-4 ${
                    isSelected
                      ? 'bg-[#0b3824] border-2 border-[#fef08a] shadow-[0_0_25px_rgba(254,240,138,0.3)]'
                      : 'bg-[#052115]/90 border border-[#d4af37]/30 hover:border-[#d4af37]/70'
                  }`}
                >
                  {/* Planet Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-md"
                        style={{ backgroundColor: `${planet.color}25`, borderColor: planet.color, borderWidth: 1 }}
                      >
                        <span style={{ color: planet.color }}>{planet.symbol}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base sm:text-lg text-white">
                            {planet.localizedName}
                          </span>
                          <span className="text-xs text-gray-400">({planet.name})</span>
                        </div>
                        <div className="text-xs text-emerald-300 flex items-center gap-2">
                          <span>{planet.rashiName} ({planet.rashiSymbol})</span>
                          <span>·</span>
                          <span className="text-[#fef08a] font-mono font-semibold">{planet.formattedDegree}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dignity & Motion Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {planet.isRetrograde && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50">
                          {isHindi ? 'वक्री (Vakri)' : 'Retrograde'}
                        </span>
                      )}
                      {planet.isCombust && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-600/50">
                          {isHindi ? 'अस्त (Combust)' : 'Combust'}
                        </span>
                      )}
                      {planet.dignity && planet.dignity !== 'None' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                          {planet.dignity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Astronomical Parameters Breakdown */}
                  {showAstronomicalDetails && (
                    <div className="mt-3 pt-3 border-t border-[#d4af37]/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-[#02130b] border border-[#d4af37]/15">
                        <span className="block text-[10px] text-gray-400 uppercase">{isHindi ? 'अंश (Exact Degree)' : 'Degree in Sign'}</span>
                        <span className="font-mono font-bold text-[#fef08a]">{planet.formattedDegree}</span>
                        <span className="block text-[9px] text-gray-500 font-mono">({planet.decimalDegree})</span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#02130b] border border-[#d4af37]/15">
                        <span className="block text-[10px] text-gray-400 uppercase">{isHindi ? 'नक्षत्र एवं पाद' : 'Nakshatra & Pada'}</span>
                        <span className="font-bold text-white">{planet.nakshatraName}</span>
                        <span className="block text-[10px] text-emerald-400">{isHindi ? `पाद ${planet.pada}` : `Pada ${planet.pada}`}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#02130b] border border-[#d4af37]/15">
                        <span className="block text-[10px] text-gray-400 uppercase">{isHindi ? 'नक्षत्र स्वामी' : 'Nakshatra Lord'}</span>
                        <span className="font-bold text-white">{planet.nakshatraLord}</span>
                        <span className="block text-[9px] text-gray-500">{planet.element}</span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#02130b] border border-[#d4af37]/15">
                        <span className="block text-[10px] text-gray-400 uppercase">{isHindi ? 'निरयण रेखांश' : 'Sidereal Long.'}</span>
                        <span className="font-mono font-bold text-white">{planet.siderealLongitude.toFixed(2)}°</span>
                        <span className="block text-[9px] text-gray-500">{isHindi ? `गति: ${planet.motion}` : planet.motion}</span>
                      </div>
                    </div>
                  )}

                  {/* Expandable Planet Speaks Voice Monologue */}
                  {planet.monologue && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => toggleMonologue(planet.name)}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#031c11] hover:bg-[#07301e] border border-[#d4af37]/25 text-xs text-[#fef08a] font-semibold transition-all cursor-pointer min-h-[40px]"
                      >
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{isHindi ? `मैं ${planet.localizedName} हूँ • ग्रह वाणी सुनें` : `I am ${planet.name} • Hear Planet Speaks`}</span>
                        </div>
                        {isMonologueOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isMonologueOpen && (
                        <div className="mt-2 p-3 rounded-xl bg-[#021008] border border-emerald-500/30 text-xs sm:text-sm text-gray-200 leading-relaxed italic animate-in fade-in duration-200">
                          "{planet.monologue}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Action Buttons (Enter Chamber Module) */}
      {onEnterModule && viewModel.targetView && (
        <div className="pt-2">
          <button
            onClick={() => onEnterModule(viewModel.targetView)}
            className="w-full min-h-[48px] px-6 py-3 rounded-full bg-gradient-to-r from-[#d4af37] to-[#e6c250] text-black font-extrabold text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isHindi ? `कक्ष में प्रवेश करें (${viewModel.bhavaName})` : `Enter Chamber (${viewModel.englishTitle})`}</span>
          </button>
        </div>
      )}
    </div>
  );
};
