/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, LayoutGrid, Compass, Shield, ChevronDown, Sparkles, Eye, DoorClosed, DoorOpen, Maximize2, Flame, LogOut, CornerUpLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChamberId, CameraPreset, SpatialZone, SpatialMode } from '../../types/digitalHouse';
import { CHAMBER_DEFINITIONS, HOUSE_WINGS } from '../../services/digitalHouse/houseDataContract';
import { useTranslation } from '../../i18n';

interface DigitalHouseNavHUDProps {
  spatialMode: SpatialMode;
  spatialZone: SpatialZone;
  activeChamberId: ChamberId | null;
  cameraPreset: CameraPreset;
  onSelectChamber: (id: ChamberId) => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  onSwitchToClassic: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  onReplayEntry: () => void;
  onEnterPalace: () => void;
  onExitPalace: () => void;
  onReturnToCourtyard: () => void;
  onPrevChamber: () => void;
  onNextChamber: () => void;
  onOpenChamberDetails?: () => void;
  kundliDrishtiMode?: boolean;
  onToggleKundliDrishti?: () => void;
}

export const DigitalHouseNavHUD: React.FC<DigitalHouseNavHUDProps> = ({
  spatialMode,
  spatialZone,
  activeChamberId,
  cameraPreset,
  onSelectChamber,
  onSelectCameraPreset,
  onSwitchToClassic,
  soundMuted,
  onToggleSound,
  onReplayEntry,
  onEnterPalace,
  onExitPalace,
  onReturnToCourtyard,
  onPrevChamber,
  onNextChamber,
  onOpenChamberDetails,
  kundliDrishtiMode,
  onToggleKundliDrishti
}) => {
  const { t } = useTranslation();
  const [showChambersDropdown, setShowChambersDropdown] = useState(false);

  const isExterior = spatialMode === 'EXTERIOR' || spatialZone === 'EXTERIOR_WORLD';
  const isChamber = spatialMode === 'CHAMBER';
  const currentChamberDef = CHAMBER_DEFINITIONS.find(d => d.id === activeChamberId);

  // i18n labels with canonical fallbacks
  const lblEnterPalace = t('digitalHouse.enterPalace') || 'गृह प्रवेश';
  const lblExitPalace = t('digitalHouse.exitPalace') || 'गृह निर्गम';
  const lblMainGate = t('digitalHouse.mainGate') || 'मुख्य द्वार';
  const lblCourtyard = t('digitalHouse.courtyard') || 'आंतरिक प्रांगण';
  const lblBrahmaSthan = t('digitalHouse.brahmaSthan') || 'ब्रह्म स्थान';
  const lblPragyaGuidance = t('digitalHouse.pragyaGuidance') || 'जीवन प्रज्ञा मार्गदर्शन';
  const lblViews = t('digitalHouse.views') || 'दृश्य';
  const lblMute = t('digitalHouse.mute') || 'मौन';
  const lblBackToCourtyard = t('digitalHouse.backToCourtyard') || 'आंगन';
  const lblPrevChamber = t('digitalHouse.previousChamber') || 'पिछला कक्ष';
  const lblNextChamber = t('digitalHouse.nextChamber') || 'अगला कक्ष';
  const lblChamberDetails = t('digitalHouse.chamberDetails') || 'कक्ष विवरण';
  const lblChambersCount = t('digitalHouse.chambersCount') || '12 कक्ष';
  const lblClassicGrid = t('digitalHouse.classicGrid') || 'क्लासिक ग्रिड';

  return (
    <>
      {/* Top Header Bar following minimal 3-zone contract */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2 bg-[#030e09]/90 backdrop-blur-md border-b border-[#d4af37]/30 shadow-lg min-h-[50px]">
        
        {/* Zone 1: Brand & Spatial Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isChamber ? (
            <button
              onClick={onReturnToCourtyard}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black font-bold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] active:scale-95"
            >
              <CornerUpLeft className="w-4 h-4" />
              <span>← {lblBackToCourtyard}</span>
            </button>
          ) : (
            <a
              href="#digital-house"
              onClick={(e) => {
                e.preventDefault();
                if (isExterior) {
                  onSelectCameraPreset('EXTERIOR_ENTRY');
                } else {
                  onSelectChamber('courtyard');
                  onSelectCameraPreset('INTERIOR_COURTYARD');
                }
              }}
              className="text-base sm:text-xl font-bold tracking-tight text-[#d4af37] hover:text-[#f3d06a] transition-colors flex items-center min-h-[44px]"
            >
              JeevanDarpan
            </a>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-[#d4af37]/30 text-[10px] font-semibold">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isExterior ? 'bg-amber-400 animate-pulse' : isChamber ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className={isExterior ? 'text-amber-300' : isChamber ? 'text-cyan-300' : 'text-emerald-300'}>
              {isExterior
                ? `${lblMainGate} • Exterior`
                : isChamber
                ? `${currentChamberDef?.sanskritName || 'Chamber'}`
                : `${lblCourtyard} • Interior`}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Minimal, contextual) */}
        {isChamber ? (
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold text-gray-200">
            <button
              onClick={onPrevChamber}
              className="min-h-[44px] flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/40 border border-[#d4af37]/30 hover:border-[#d4af37] text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden xs:inline">{lblPrevChamber}</span>
            </button>
            <span className="text-[#d4af37] font-bold text-xs sm:text-sm tracking-wide hidden sm:inline">
              {currentChamberDef?.sanskritName} ({currentChamberDef?.hindiTitle})
            </span>
            <button
              onClick={onNextChamber}
              className="min-h-[44px] flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/40 border border-[#d4af37]/30 hover:border-[#d4af37] text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="hidden xs:inline">{lblNextChamber}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : !isExterior ? (
          <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-gray-300">
            <button
              onClick={() => {
                onSelectChamber('courtyard');
                onSelectCameraPreset('INTERIOR_COURTYARD');
              }}
              className={`min-h-[44px] flex items-center hover:text-[#d4af37] transition-colors cursor-pointer ${
                activeChamberId === 'courtyard' ? 'text-[#d4af37] font-bold' : ''
              }`}
            >
              <Flame className="w-3.5 h-3.5 mr-1 text-[#d4af37]" />
              <span>{lblBrahmaSthan}</span>
            </button>

            <button
              onClick={() => {
                onSelectCameraPreset('INTERIOR_MANDALA');
              }}
              className={`min-h-[44px] flex items-center hover:text-[#d4af37] transition-colors cursor-pointer ${
                cameraPreset === 'mandala' || cameraPreset === 'INTERIOR_MANDALA' ? 'text-[#d4af37] font-bold' : ''
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5 mr-1 text-[#d4af37]" />
              <span>वास्तु मंडल</span>
            </button>

            <button
              onClick={onExitPalace}
              className="min-h-[44px] flex items-center hover:text-amber-400 text-amber-300/90 transition-colors cursor-pointer font-semibold"
            >
              <LogOut className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>{lblExitPalace}</span>
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-amber-200/90 font-medium">
            <span>{lblMainGate} • {lblEnterPalace}</span>
          </div>
        )}

        {/* Zone 3: Actions (Enter/Exit, Chambers Picker, Sound, Classic) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* EXTERIOR: Direct Enter Palace Button */}
          {isExterior && (
            <button
              onClick={onEnterPalace}
              className="min-h-[44px] flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#e6c250] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <DoorOpen className="w-4 h-4" />
              <span>{lblEnterPalace}</span>
            </button>
          )}

          {/* INTERIOR: Direct Exit Palace Button */}
          {!isExterior && !isChamber && (
            <button
              onClick={onExitPalace}
              title={`${lblExitPalace} (Exit to Grounds)`}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1c0f05] border border-amber-500/60 text-amber-300 hover:text-white hover:bg-amber-600/30 hover:border-amber-400 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.2)] active:scale-95"
            >
              <LogOut className="w-4 h-4 text-amber-400" />
              <span>{lblExitPalace}</span>
            </button>
          )}

          {/* CHAMBER: Details inspection button */}
          {isChamber && onOpenChamberDetails && (
            <button
              onClick={onOpenChamberDetails}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#d4af37] text-black text-xs font-bold hover:bg-[#e6c250] transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              <Compass className="w-4 h-4" />
              <span>{lblChamberDetails}</span>
            </button>
          )}

          {/* Kundli Drishti Mode Toggle (Overlay) */}
          {!isExterior && onToggleKundliDrishti && (
            <button
              onClick={onToggleKundliDrishti}
              title={kundliDrishtiMode ? 'कुंडली दृष्टि सक्रिय (Kundli View Active)' : 'कुंडली दृष्टि चालू करें (Enable Kundli View)'}
              className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-md ${
                kundliDrishtiMode
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#fef08a] text-black font-extrabold shadow-[0_0_15px_rgba(212,175,55,0.6)]'
                  : 'bg-[#062417] border border-[#d4af37]/50 text-[#fef08a] hover:bg-[#0c3825]'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden xs:inline">कुंडली दृष्टि</span>
            </button>
          )}

          {/* 12 Chambers Quick Picker (Inside interior) */}
          {!isExterior && (
            <div className="relative">
              <button
                onClick={() => setShowChambersDropdown(!showChambersDropdown)}
                className="min-h-[44px] flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-[#062417] border border-[#d4af37]/50 text-xs font-semibold text-[#d4af37] hover:bg-[#0c3825] transition-all cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-4 h-4" />
                <span className="hidden xs:inline">{lblChambersCount}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showChambersDropdown && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#03120b]/98 border border-[#d4af37]/60 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50">
                  <div className="p-1 space-y-2">
                    <button
                      onClick={() => {
                        onSelectChamber('courtyard');
                        onSelectCameraPreset('INTERIOR_COURTYARD');
                        setShowChambersDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer min-h-[44px] ${
                        activeChamberId === 'courtyard'
                          ? 'bg-[#d4af37] text-black font-bold'
                          : 'text-[#d4af37] hover:bg-[#0a2e1d]'
                      }`}
                    >
                      <span className="font-bold">{lblBrahmaSthan} • {lblPragyaGuidance}</span>
                      <span className="text-[10px] opacity-75">केंद्रीय मार्गदर्शन</span>
                    </button>

                    {HOUSE_WINGS.map(wing => (
                      <div key={wing.id} className="pt-1 border-t border-[#d4af37]/20">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-1">
                          {wing.hindiName}
                        </p>
                        <div className="space-y-1">
                          {wing.chambers.map(chId => {
                            const def = CHAMBER_DEFINITIONS.find(d => d.id === chId);
                            if (!def) return null;
                            return (
                              <button
                                key={def.id}
                                onClick={() => {
                                  onSelectChamber(def.id);
                                  setShowChambersDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer min-h-[44px] ${
                                  activeChamberId === def.id
                                    ? 'bg-[#d4af37] text-black font-bold'
                                    : 'text-gray-200 hover:bg-[#0a2e1d] hover:text-[#d4af37]'
                                }`}
                              >
                                <span className="font-medium">{def.sanskritName}</span>
                                <span className="text-[10px] opacity-75">{def.englishTitle.split('&')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sound Toggle (Mute / Active) */}
          <button
            onClick={onToggleSound}
            aria-label={soundMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
            title={soundMuted ? lblMute : 'ध्वनि सक्रिय'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg bg-[#062417] border border-[#d4af37]/40 text-gray-300 hover:text-[#d4af37] hover:border-[#d4af37] transition-all cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
          </button>

          {/* Switch to Classic Dashboard */}
          <button
            onClick={onSwitchToClassic}
            title={lblClassicGrid}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#062417] border border-[#d4af37]/40 hover:border-[#d4af37] text-xs font-semibold text-gray-200 hover:text-[#d4af37] transition-all cursor-pointer whitespace-nowrap"
          >
            <LayoutGrid className="w-4 h-4 text-[#d4af37]" />
            <span className="hidden sm:inline">{lblClassicGrid}</span>
          </button>
        </div>
      </header>

      {/* Floating Minimal Bottom Action Bar (Non-obstructive) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#030e09]/92 border border-[#d4af37]/45 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.85)] max-w-[95vw]">
        {isExterior ? (
          <>
            <button
              onClick={onEnterPalace}
              className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-black bg-gradient-to-r from-[#d4af37] to-[#e6c250] hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <DoorOpen className="w-4 h-4 text-black" />
              <span>{lblEnterPalace}</span>
            </button>

            <span className="text-gray-600">|</span>

            <button
              onClick={() => {
                onSelectCameraPreset(cameraPreset === 'EXTERIOR_OVERVIEW' ? 'EXTERIOR_ENTRY' : 'EXTERIOR_OVERVIEW');
              }}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-gray-300 hover:text-[#d4af37] transition-all cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-4 h-4 text-[#d4af37]" />
              <span>{lblViews}</span>
            </button>

            <span className="text-gray-600">|</span>

            <button
              onClick={onToggleSound}
              className="min-h-[44px] flex items-center gap-1.5 px-2.5 py-2 rounded-full text-xs font-medium text-gray-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
              <span>{soundMuted ? lblMute : 'ध्वनि'}</span>
            </button>
          </>
        ) : isChamber ? (
          <>
            <button
              onClick={onReturnToCourtyard}
              className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <CornerUpLeft className="w-4 h-4 text-[#d4af37]" />
              <span>← {lblBackToCourtyard}</span>
            </button>

            {onOpenChamberDetails && (
              <>
                <span className="text-gray-600">|</span>
                <button
                  onClick={onOpenChamberDetails}
                  className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>{lblChamberDetails}</span>
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => {
                onSelectChamber('courtyard');
                onSelectCameraPreset('INTERIOR_COURTYARD');
              }}
              className="min-h-[44px] flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-gray-200 hover:text-[#d4af37] hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Flame className="w-4 h-4 text-[#d4af37]" />
              <span>{lblBrahmaSthan}</span>
            </button>

            <span className="text-gray-600">|</span>

            <button
              onClick={() => {
                onSelectChamber('courtyard');
                onSelectCameraPreset('INTERIOR_COURTYARD');
              }}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-[#d4af37] hover:bg-[#d4af37]/15 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>{lblPragyaGuidance}</span>
            </button>

            <span className="text-gray-600">|</span>

            <button
              onClick={onExitPalace}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 text-amber-400" />
              <span>{lblExitPalace}</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};
