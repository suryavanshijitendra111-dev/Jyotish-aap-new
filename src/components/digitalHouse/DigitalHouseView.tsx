/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DigitalHouseCanvas } from './DigitalHouseCanvas';
import { DigitalHouseNavHUD } from './DigitalHouseNavHUD';
import { ChamberDetailModal } from './ChamberDetailModal';
import { JeevanPragyaModal } from './JeevanPragyaModal';
import { TrikalaWindowPortalModal } from './TrikalaWindowPortalModal';
import { PlanetInfoPanel } from './PlanetInfoPanel';
import { LivingBhavaPanel } from './LivingBhavaPanel';
import { TransitEvidenceLedgerModal } from '../kundli/TransitEvidenceLedgerModal';
import { ChamberId, EntryStep, CameraPreset, TrikalaWindowId, SpatialZone, SpatialMode } from '../../types/digitalHouse';
import { CHAMBER_DEFINITIONS, extractHouseResidents, extractBhavaAstroViewModels } from '../../services/digitalHouse/houseDataContract';
import { JeevanPragyaService } from '../../services/digitalHouse/jeevanPragyaService';
import { MasterKundliData, BirthProfile } from '../../types/kundli';
import { AstronomyService } from '../../services/astronomy/astronomyService';
import { houseAudioService } from '../../services/digitalHouse/audioService';
import { SpeechEngine } from '../../services/companion/speechEngine';
import { Sparkles, ArrowRight, Volume2, Shield, DoorOpen, LogOut, Compass } from 'lucide-react';
import { useTranslation, getCurrentLanguage } from '../../i18n';

interface DigitalHouseViewProps {
  profile: BirthProfile | null;
  navigate: (view: string) => void;
  showToast: (msg: string) => void;
}

export const DigitalHouseView: React.FC<DigitalHouseViewProps> = ({
  profile,
  navigate,
  showToast
}) => {
  const { t } = useTranslation();
  const [entryStep, setEntryStep] = useState<EntryStep>('completed');
  const [spatialZone, setSpatialZone] = useState<SpatialZone>('EXTERIOR_WORLD');
  const [thresholdDirection, setThresholdDirection] = useState<'entering' | 'exiting' | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('entrance');
  const [activeChamberId, setActiveChamberId] = useState<ChamberId | null>(null);
  const [modalChamberId, setModalChamberId] = useState<ChamberId | null>(null);
  const [trikalaSubTab, setTrikalaSubTab] = useState<'present' | 'past' | 'future'>('present');
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [masterData, setMasterData] = useState<MasterKundliData | null>(null);
  const [welcomeBannerVisible, setWelcomeBannerVisible] = useState(false);
  const [selectedPlanetName, setSelectedPlanetName] = useState<string | null>(null);
  const [isPlanetSpeaking, setIsPlanetSpeaking] = useState<boolean>(false);
  const [interactionHintVisible, setInteractionHintVisible] = useState(true);

  // Phase 4.5 Section 19: Auto-fade subtle interaction hint after 5 seconds
  useEffect(() => {
    if (spatialZone === 'INTERIOR_WORLD') {
      const timer = setTimeout(() => {
        setInteractionHintVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [spatialZone]);

  const currentLanguage = getCurrentLanguage();
  const astroViewModels = React.useMemo(() => {
    return extractBhavaAstroViewModels(masterData, currentLanguage);
  }, [masterData, currentLanguage]);

  // Phase 4.6-A: Resolve selected planet and its host Bhava strictly from verified data
  const selectedPlanetData = React.useMemo(() => {
    if (!selectedPlanetName || !astroViewModels) return null;
    const pTarget = selectedPlanetName.trim().toLowerCase();
    for (const bNum of Object.keys(astroViewModels)) {
      const bVM = astroViewModels[Number(bNum)];
      if (bVM && bVM.planets) {
        const found = bVM.planets.find(
          p => p.name.toLowerCase() === pTarget || (p.localizedName && p.localizedName.toLowerCase() === pTarget)
        );
        if (found) {
          return {
            planet: found,
            bhava: bVM
          };
        }
      }
    }
    return null;
  }, [selectedPlanetName, astroViewModels]);

  const pragyaData = React.useMemo(() => {
    return JeevanPragyaService.extractPragyaHeart(masterData);
  }, [masterData]);

  // Fetch MasterKundliData for read-only visualization of resident planets
  useEffect(() => {
    let isMounted = true;
    if (profile) {
      AstronomyService.calculateKundli(profile)
        .then(res => {
          if (isMounted && res.data) {
            setMasterData(res.data);
          }
        })
        .catch(err => {
          console.warn('Digital House: Astrology read-only query loaded safely with baseline fallback', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [profile]);

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Real Architectural Entrance Crossing (OUTSIDE -> THRESHOLD -> INSIDE)
  const handleEnterPalace = useCallback(() => {
    if (spatialZone === 'INTERIOR_WORLD' || thresholdDirection) return;

    if (prefersReducedMotion) {
      setSpatialZone('INTERIOR_WORLD');
      setCameraPreset('courtyard');
      setActiveChamberId('courtyard');
      setThresholdDirection(null);
      showToast('शुभ आगमनम् • प्रासाद के अंतःकक्ष में प्रवेश (Entered Palace Interior)');
      return;
    }

    setThresholdDirection('entering');
    setSpatialZone('THRESHOLD_TRANSITION');
    houseAudioService.startAmbientDrone();
    houseAudioService.playDoorsOpenSound();

    setTimeout(() => {
      houseAudioService.playThresholdCrossingSound();
    }, 700);

    setTimeout(() => {
      setSpatialZone('INTERIOR_WORLD');
      setCameraPreset('courtyard');
      setActiveChamberId('courtyard');
      setThresholdDirection(null);
      showToast('शुभ आगमनम् • प्रासाद के अंतःकक्ष में प्रवेश (Entered Palace Interior)');
    }, 1800);
  }, [spatialZone, thresholdDirection, showToast, prefersReducedMotion]);

  // Real Architectural Exit Crossing (INSIDE -> THRESHOLD -> OUTSIDE)
  const handleExitPalace = useCallback(() => {
    if (spatialZone === 'EXTERIOR_WORLD' || thresholdDirection) return;

    if (prefersReducedMotion) {
      setModalChamberId(null);
      setSpatialZone('EXTERIOR_WORLD');
      setCameraPreset('entrance');
      setActiveChamberId(null);
      setThresholdDirection(null);
      showToast('गृह निर्गम • बाह्य प्रांगण में प्रस्थान (Exited to Grounds)');
      return;
    }

    setModalChamberId(null);
    setThresholdDirection('exiting');
    setSpatialZone('THRESHOLD_TRANSITION');
    houseAudioService.playDoorsOpenSound();

    setTimeout(() => {
      houseAudioService.playPalaceExitSound();
    }, 700);

    setTimeout(() => {
      setSpatialZone('EXTERIOR_WORLD');
      setCameraPreset('entrance');
      setActiveChamberId(null);
      setThresholdDirection(null);
      showToast('गृह निर्गम • बाह्य प्रांगण में प्रस्थान (Exited to Grounds)');
    }, 1800);
  }, [spatialZone, thresholdDirection, showToast, prefersReducedMotion]);

  // Optional Full Vedic Ritual Emergence Sequence
  const runEntrySequence = useCallback(() => {
    setSpatialZone('EXTERIOR_WORLD');
    setEntryStep('dark');
    setWelcomeBannerVisible(false);

    // 1. Dark Screen & Ambient Sound
    houseAudioService.startAmbientDrone();
    setTimeout(() => {
      setEntryStep('ambient_sound');
      houseAudioService.playTempleChime(320);
    }, 800);

    // 2. House slowly appears
    setTimeout(() => {
      setEntryStep('house_emerge');
    }, 2200);

    // 3. Lamps illuminate sequentially
    setTimeout(() => {
      setEntryStep('lamps_light');
      houseAudioService.playLampIgniteSound(1.0);
    }, 4000);

    // 4. Double doors open
    setTimeout(() => {
      setEntryStep('doors_open');
      houseAudioService.playDoorsOpenSound();
    }, 5800);

    // 5. Camera moves through entrance
    setTimeout(() => {
      setEntryStep('camera_glide');
    }, 7800);

    // 6. Courtyard activates
    setTimeout(() => {
      setEntryStep('courtyard_active');
      houseAudioService.playTempleChime(540);
      setWelcomeBannerVisible(true);
    }, 10500);

    // 7. Completed interactive mode in INTERIOR
    setTimeout(() => {
      setEntryStep('completed');
      setSpatialZone('INTERIOR_WORLD');
      setCameraPreset('courtyard');
      setActiveChamberId('courtyard');
    }, 12500);
  }, []);

  const handleClosePlanetPanel = useCallback(() => {
    SpeechEngine.stop();
    setIsPlanetSpeaking(false);
    setSelectedPlanetName(null);
    setActiveChamberId('courtyard');
    setCameraPreset('courtyard');
  }, []);

  const handleSelectPlanet = useCallback((planetName: string, chamberId: ChamberId) => {
    // If speaking, stop immediately before switching
    SpeechEngine.stop();
    setIsPlanetSpeaking(false);
    setSelectedPlanetName(planetName);
    setActiveChamberId(chamberId);
    // Keep ChamberDetailModal closed so compact bottom sheet is visible without full modal obstruction
    setModalChamberId(null);
  }, []);

  const handleToggleSound = useCallback(() => {
    const isMuted = houseAudioService.toggleMute();
    setSoundMuted(isMuted);
    if (isMuted) {
      SpeechEngine.stop();
      setIsPlanetSpeaking(false);
    }
    showToast(isMuted ? 'ध्वनि म्यूट की गई (Sound Muted)' : 'ध्वनि सक्रिय की गई (Sound Active)');
  }, [showToast]);

  // Auto-hide subtle interaction hint after 4 seconds to keep interior viewport clean
  useEffect(() => {
    if (interactionHintVisible && spatialZone === 'INTERIOR_WORLD') {
      const timer = setTimeout(() => {
        setInteractionHintVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [interactionHintVisible, spatialZone]);

  const handleSelectChamber = useCallback((id: ChamberId) => {
    setInteractionHintVisible(false);
    if (spatialZone === 'EXTERIOR_WORLD') {
      if (id === 'main_gate') {
        handleEnterPalace();
      }
      return;
    }

    if (id === 'exit_gate') {
      handleExitPalace();
      return;
    }

    // Dismiss planet panel when selecting chamber from navigation
    handleClosePlanetPanel();

    setActiveChamberId(id);
    // Phase 4.6-D Hotfix-4: In 3D interior palace, Bhava chambers (1–12) are presented directly in 3D.
    // Do NOT automatically open modal bottom-sheets for Bhava chambers, keeping 3D presentation completely unobstructed.
    if (id === 'courtyard' || id === 'window_past' || id === 'window_present' || id === 'window_future' || id === 'guardian_sanctum') {
      setModalChamberId(id);
    } else {
      setModalChamberId(null);
    }
  }, [spatialZone, handleEnterPalace, handleExitPalace, handleClosePlanetPanel]);

  const handleSelectCameraPreset = useCallback((preset: CameraPreset) => {
    setInteractionHintVisible(false);
    setCameraPreset(preset);
    if (preset === 'exit_gate') {
      setActiveChamberId('exit_gate');
      handleClosePlanetPanel();
    } else if (preset !== 'chamber_focus') {
      setActiveChamberId(preset === 'courtyard' ? 'courtyard' : null);
      handleClosePlanetPanel();
    }
  }, [handleClosePlanetPanel]);

  const handleEnterChamberModule = useCallback((targetView: string) => {
    setModalChamberId(null);
    handleClosePlanetPanel();
    navigate(targetView);
  }, [navigate, handleClosePlanetPanel]);

  const spatialMode: SpatialMode = React.useMemo(() => {
    if (spatialZone === 'EXTERIOR_WORLD') return 'EXTERIOR';
    if (activeChamberId && activeChamberId.startsWith('chamber_')) return 'CHAMBER';
    return 'INTERIOR';
  }, [spatialZone, activeChamberId]);

  const handleReturnToCourtyard = useCallback(() => {
    handleClosePlanetPanel();
    setModalChamberId(null);
    setActiveChamberId('courtyard');
    setCameraPreset('courtyard');
  }, [handleClosePlanetPanel]);

  const handlePrevChamber = useCallback(() => {
    handleClosePlanetPanel();
    let nextNum = 12;
    if (activeChamberId && activeChamberId.startsWith('chamber_')) {
      const currentNum = parseInt(activeChamberId.replace('chamber_', ''), 10);
      nextNum = currentNum <= 1 ? 12 : currentNum - 1;
    }
    const newId = `chamber_${nextNum}` as ChamberId;
    handleSelectChamber(newId);
  }, [activeChamberId, handleSelectChamber, handleClosePlanetPanel]);

  const handleNextChamber = useCallback(() => {
    handleClosePlanetPanel();
    let nextNum = 1;
    if (activeChamberId && activeChamberId.startsWith('chamber_')) {
      const currentNum = parseInt(activeChamberId.replace('chamber_', ''), 10);
      nextNum = currentNum >= 12 ? 1 : currentNum + 1;
    }
    const newId = `chamber_${nextNum}` as ChamberId;
    handleSelectChamber(newId);
  }, [activeChamberId, handleSelectChamber, handleClosePlanetPanel]);

  const handleOpenChamberDetails = useCallback(() => {
    if (activeChamberId) {
      handleClosePlanetPanel();
      setModalChamberId(activeChamberId);
    }
  }, [activeChamberId, handleClosePlanetPanel]);

  const residentsSummary = React.useMemo(() => extractHouseResidents(masterData), [masterData]);
  const currentModalDef = React.useMemo(
    () => (modalChamberId ? CHAMBER_DEFINITIONS.find(d => d.id === modalChamberId) || null : null),
    [modalChamberId]
  );

  // Safe Patch 2: Resolve verified astrological house number (1–12) for active modal chamber
  // Mapping: Chamber (e.g. chamber_1..12) -> verified houseNumber (1..12) -> astroViewModels[houseNumber] -> LivingBhavaPanel
  const selectedBhavaHouseNumber = React.useMemo<number | null>(() => {
    if (currentModalDef && typeof currentModalDef.houseNumber === 'number') {
      const h = currentModalDef.houseNumber;
      if (h >= 1 && h <= 12) return h;
    }
    if (modalChamberId && typeof modalChamberId === 'string' && modalChamberId.startsWith('chamber_')) {
      const parsed = parseInt(modalChamberId.replace('chamber_', ''), 10);
      if (parsed >= 1 && parsed <= 12) return parsed;
    }
    return null;
  }, [currentModalDef, modalChamberId]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020705]">
      
      {/* 3D WebGL Canvas */}
      <DigitalHouseCanvas
        entryStep={entryStep}
        spatialZone={spatialZone}
        masterData={masterData}
        activeChamberId={activeChamberId}
        cameraPreset={cameraPreset}
        onSelectChamber={handleSelectChamber}
        soundEnabled={!soundMuted}
        onCameraPresetChange={handleSelectCameraPreset}
        onEnterPalace={handleEnterPalace}
        onExitPalace={handleExitPalace}
        thresholdDirection={thresholdDirection}
        onSelectPlanet={handleSelectPlanet}
        selectedPlanetName={selectedPlanetName}
        isPlanetSpeaking={isPlanetSpeaking}
      />

      {/* Top HUD and Navigation Bar (Active in both Exterior and Interior) */}
      {entryStep === 'completed' && (
        <DigitalHouseNavHUD
          spatialMode={spatialMode}
          spatialZone={spatialZone}
          activeChamberId={activeChamberId}
          cameraPreset={cameraPreset}
          onSelectChamber={handleSelectChamber}
          onSelectCameraPreset={handleSelectCameraPreset}
          onSwitchToClassic={() => navigate('dashboard')}
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
          onReplayEntry={runEntrySequence}
          onEnterPalace={handleEnterPalace}
          onExitPalace={handleExitPalace}
          onReturnToCourtyard={handleReturnToCourtyard}
          onPrevChamber={handlePrevChamber}
          onNextChamber={handleNextChamber}
          onOpenChamberDetails={handleOpenChamberDetails}
        />
      )}

      {/* Threshold Transition Active Indicator Badge */}
      {thresholdDirection && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 text-center pointer-events-none animate-in fade-in duration-300">
          <div className="px-8 py-4 rounded-3xl bg-[#030a08]/92 border-2 border-[#d4af37]/80 backdrop-blur-xl shadow-[0_0_50px_rgba(212,175,55,0.5)]">
            <p className="text-base sm:text-lg font-bold text-[#d4af37] tracking-wider uppercase mb-1">
              {thresholdDirection === 'entering' ? 'द्वारोद्घाटन • गृह प्रवेश' : 'गृह निर्गम • बाह्य प्रांगण'}
            </p>
            <p className="text-xs text-gray-200">
              {thresholdDirection === 'entering'
                ? 'देहली पारगमन... प्रासाद के आंतरिक ब्रह्म स्थान में प्रवेश'
                : 'देहली पारगमन... प्रासाद के बाह्य प्रांगण में प्रस्थान'}
            </p>
          </div>
        </div>
      )}

      {/* Entry Ritual Sequence Active Stepper Overlay */}
      {entryStep !== 'completed' && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 text-center pointer-events-none animate-in fade-in duration-300">
          <div className="px-6 py-2.5 rounded-full bg-[#030a08]/90 border border-[#d4af37]/50 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <p className="text-xs font-bold text-[#d4af37] tracking-widest uppercase">
              {entryStep === 'ambient_sound' && 'नाद ब्रह्म आह्वान • Sacred Soundscape'}
              {entryStep === 'house_emerge' && 'प्रासाद प्रादुर्भाव • Divine Architecture Emerging'}
              {entryStep === 'lamps_light' && 'दीप प्रज्वलन • Diya Lamps Illuminating'}
              {entryStep === 'doors_open' && 'कपाट उद्घाटन • Grand Sanctuary Doors Opening'}
              {entryStep === 'camera_glide' && 'गृह प्रवेश • Entering Sacred Threshold'}
              {entryStep === 'courtyard_active' && 'ब्रह्म स्थान जागृति • Brahma Sthan Awakening'}
            </p>
          </div>
        </div>
      )}

      {/* Welcoming Proclamation Banner in Courtyard (After entering) */}
      {welcomeBannerVisible && spatialZone === 'INTERIOR_WORLD' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[90vw] p-4 rounded-2xl bg-[#04140d]/90 border border-[#d4af37]/60 backdrop-blur-md shadow-2xl text-center animate-in slide-in-from-top duration-500">
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">
            शुभ आगमनम् • Welcome to Your Sacred Digital Home
          </p>
          <p className="text-sm text-gray-200 mt-1">
            ब्रह्म स्थान में आपका स्वागत है। किसी भी कक्ष पर क्लिक कर उसके आंतरिक ज्योतिर्विज्ञान एवं मॉड्यूल का अवलोकन करें।
          </p>
          <button
            onClick={() => setWelcomeBannerVisible(false)}
            className="mt-3 px-4 py-1 rounded-full text-xs font-bold text-[#d4af37] hover:bg-[#d4af37]/20 border border-[#d4af37]/40 cursor-pointer"
          >
            अन्वेषण प्रारंभ करें (Begin Exploring)
          </button>
        </div>
      )}

      {/* Phase 4.5 Section 19: Subtle First-Time-Only Interaction Hint */}
      {spatialZone === 'INTERIOR_WORLD' && interactionHintVisible && !modalChamberId && (
        <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center animate-in fade-in duration-500 max-w-[92vw]">
          <div className="px-4 py-2 rounded-full bg-[#02130b]/92 border border-[#d4af37]/50 backdrop-blur-md shadow-xl flex items-center justify-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#d4af37] shrink-0 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs sm:text-sm font-medium text-amber-100">
              तीर के चिन्ह (← / →) से 12 भावों का एक-एक करके दर्शन करें • किसी भी भाव या ग्रह पर टैप करें
            </span>
          </div>
        </div>
      )}

      {/* Jeevan Pragya Heart Modal (Central Courtyard Guidance Experience) */}
      {modalChamberId === 'courtyard' && (
        <JeevanPragyaModal
          masterData={masterData}
          initialSubTab={trikalaSubTab}
          onClose={() => setModalChamberId(null)}
          onEnterModule={handleEnterChamberModule}
          onFlyToChamber={(chamberId) => {
            setModalChamberId(chamberId);
            setActiveChamberId(chamberId);
            setCameraPreset('chamber_focus');
          }}
          onOpenEvidenceLedger={() => setShowLedgerModal(true)}
        />
      )}

      {/* Trikala Architectural Window Portal Modal (अतीत • वर्तमान • भविष्य) */}
      {modalChamberId &&
        (modalChamberId === 'window_past' ||
          modalChamberId === 'window_present' ||
          modalChamberId === 'window_future') && (
          <TrikalaWindowPortalModal
            windowId={modalChamberId as TrikalaWindowId}
            masterData={masterData}
            soundMuted={soundMuted}
            onClose={() => setModalChamberId(null)}
            onBackToCourtyard={() => {
              setModalChamberId(null);
              setActiveChamberId('courtyard');
              setCameraPreset('courtyard');
            }}
            onOpenFullPragya={(tab) => {
              setTrikalaSubTab(tab);
              setModalChamberId('courtyard');
            }}
            onOpenEvidenceLedger={() => setShowLedgerModal(true)}
            onFlyToChamber={(chamberId) => {
              setModalChamberId(chamberId);
              setActiveChamberId(chamberId);
              setCameraPreset('chamber_focus');
            }}
            onEnterModule={handleEnterChamberModule}
            onSwitchWindow={(w) => {
              setModalChamberId(w);
              setActiveChamberId(w);
              setCameraPreset('chamber_focus');
            }}
          />
        )}

      {/* Safe Patch 2: Living Bhava Chamber Knowledge Panel (Generalized for all 12 Bhavas) */}
      {selectedBhavaHouseNumber && (
        <LivingBhavaPanel
          bhava={astroViewModels[selectedBhavaHouseNumber] || {
            chamberId: (modalChamberId as ChamberId) || (`chamber_${selectedBhavaHouseNumber}` as ChamberId),
            bhavaNumber: selectedBhavaHouseNumber,
            devanagariNum: `${selectedBhavaHouseNumber}`,
            bhavaName: currentModalDef?.hindiTitle || currentModalDef?.sanskritName || `भाव ${selectedBhavaHouseNumber}`,
            englishTitle: currentModalDef?.englishTitle || `House ${selectedBhavaHouseNumber}`,
            signification: currentModalDef?.signification || 'डेटा उपलब्ध नहीं',
            targetView: currentModalDef?.targetView || 'kundli_shell',
            color: currentModalDef?.color || '#d4af37',
            rashiNumber: selectedBhavaHouseNumber,
            rashiName: `राशि ${selectedBhavaHouseNumber}`,
            rashiNameEn: currentModalDef?.englishTitle || `Sign ${selectedBhavaHouseNumber}`,
            rashiSymbol: '',
            signLord: 'डेटा उपलब्ध नहीं',
            planets: []
          }}
          masterData={masterData}
          onClose={() => {
            setModalChamberId(null);
            handleReturnToCourtyard();
          }}
          onSelectPlanet={handleSelectPlanet}
        />
      )}

      {/* Chamber Detail Inspection Modal (Strictly for Non-Bhava Chambers like Guardian Sanctum) */}
      {modalChamberId &&
        !selectedBhavaHouseNumber &&
        modalChamberId !== 'courtyard' &&
        modalChamberId !== 'window_past' &&
        modalChamberId !== 'window_present' &&
        modalChamberId !== 'window_future' &&
        modalChamberId !== 'main_gate' &&
        modalChamberId !== 'exit_gate' &&
        currentModalDef && (
        <ChamberDetailModal
          chamber={currentModalDef}
          residentSummary={residentsSummary[currentModalDef.id]}
          astroViewModel={currentModalDef.houseNumber ? astroViewModels[currentModalDef.houseNumber] : undefined}
          selectedPlanetName={selectedPlanetName}
          onClose={() => {
            setModalChamberId(null);
            setSelectedPlanetName(null);
          }}
          onEnter={handleEnterChamberModule}
        />
      )}

      {/* Phase 4.6-A & 4.6-B: Verified Planet Information Panel with Planet Speaks Voice Experience */}
      {selectedPlanetData && (
        <PlanetInfoPanel
          planet={selectedPlanetData.planet}
          bhava={selectedPlanetData.bhava}
          onClose={handleClosePlanetPanel}
          onSpeechStateChange={(speaking) => setIsPlanetSpeaking(speaking)}
        />
      )}

      {/* Transit Evidence Ledger Modal with Verified Cryptographic Fingerprints */}
      <TransitEvidenceLedgerModal
        isOpen={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
        ledger={pragyaData.evidenceLedger || undefined}
        futureTransit={pragyaData.futureTransitCorroboration || undefined}
        mahadashaLord={pragyaData.trikala.present.planet}
        antardashaLord={masterData?.vimshottariDasha?.currentAntardasha?.planet || 'Saturn'}
        windowStart={pragyaData.trikala.present.startDate}
        windowEnd={pragyaData.trikala.present.endDate}
        language="hi"
      />

    </div>
  );
};
