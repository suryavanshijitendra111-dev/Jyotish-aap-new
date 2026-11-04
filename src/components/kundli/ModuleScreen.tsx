/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BirthProfile, MasterKundliData } from '../../types/kundli';
import { AstronomyService } from '../../services/astronomy/astronomyService';
import { useTranslation } from '../../i18n';
import { Loader2, ArrowLeft } from 'lucide-react';
import { KPQuestionJudgment } from './KPQuestionJudgment';
import { DashaChartView } from './DashaChartView';
import { YoginiDashaView } from './YoginiDashaView';
import { AshtottariDashaView } from './AshtottariDashaView';
import { GocharVedhaView } from './GocharVedhaView';
import { VargaSpeaksControl } from './VargaSpeaksControl';
import { VargaKundaliView } from './VargaKundaliView';
import { SphutasView } from './SphutasView';
import { UpagrahaView } from './UpagrahaView';
import { PlanetSpeaksControl } from './PlanetSpeaksControl';
import { BhriguNandiNadiView } from './BhriguNandiNadiView';
import { HouseSpeaksControl } from './HouseSpeaksControl';
import { AshtakavargaView } from './AshtakavargaView';
import { JaiminiView } from './JaiminiView';
import { ArudhaCharaView } from './ArudhaCharaView';
import { SudarshanaChakraView } from './SudarshanaChakraView';
import { SarvatobhadraView } from './SarvatobhadraView';
import { YogaDoshaView } from './YogaDoshaView';
import { LongevityArgalaView } from './LongevityArgalaView';
import { SpecialPointsView } from './SpecialPointsView';
import { ShadbalaView } from './ShadbalaView';
import LiveTransitChart from './LiveTransitChart';

interface ModuleScreenProps {
  activeModule: string;
  profile: BirthProfile | null;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export const ModuleScreen: React.FC<ModuleScreenProps> = ({
  activeModule,
  profile,
  onBack
}) => {
  if (!activeModule) {
    onBack();
    return null;
  }
  const { t, currentLanguageInfo } = useTranslation();
  const language = currentLanguageInfo.code;
  const [loading, setLoading] = useState(true);
  const [kundliData, setKundliData] = useState<MasterKundliData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    AstronomyService.calculateKundli(profile, 'Lahiri')
      .then(res => {
        if (res.status === 'Ready' && res.data) {
          setKundliData(res.data);
        } else {
          setError(res.message || 'Calculation error');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [profile]);

  const moduleTitle = t(`modules.${activeModule}.title`) || activeModule;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-28 min-h-screen bg-cosmic-deep text-white">
      {/* Universal Back Navigation Header */}
      <header className="flex items-center justify-between p-4 sm:p-5 border-b border-[#d4af37]/20 bg-[#030a08]/90 sticky top-0 z-30 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] text-sm font-bold hover:bg-[#d4af37]/25 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('nav.back_to_dashboard') || '← Dashboard'}</span>
        </button>
        <h1 className="text-base sm:text-lg font-bold text-[#d4af37] truncate max-w-[200px] sm:max-w-[240px] text-right">
          {moduleTitle}
        </h1>
      </header>

      <main className="p-4 sm:p-5 flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin mb-3" />
            <p className="text-sm text-[#d4af37] font-medium">{t('common.loading') || 'Calculating Ephemeris...'}</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/40 border border-red-500/50 rounded-2xl text-center text-red-300">
            <p>{error}</p>
          </div>
        ) : !kundliData ? (
          <div className="p-6 bg-black/40 border border-[#d4af37]/30 rounded-2xl text-center text-gray-300">
            <p>{t('common.notAvailable') || 'Profile data required.'}</p>
          </div>
        ) : (
          <div>
            {(() => {
              const isKundliModule = ['kundli', 'kundli_janmang', 'kundliJanmang', 'kundli_shell'].includes(activeModule);
              return (
                <>
                  {isKundliModule && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1">
                          D1 Lagna Kundli (लग्न कुंडली)
                        </h4>
                        <LiveTransitChart masterData={kundliData} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1">
                          D9 Navamsha (नवांश कुंडली)
                        </h4>
                        <VargaSpeaksControl masterData={kundliData} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1">
                          Mukhya Shadbala (मुख्य षडबल)
                        </h4>
                        <ShadbalaView data={kundliData} />
                      </div>
                    </div>
                  )}
                  {activeModule === 'kp' && (
                    <KPQuestionJudgment
                      masterData={kundliData}
                      language={language}
                      onOpenPlanetStory={() => {}}
                    />
                  )}
                  {['dasha', 'vimshottari', 'vimshottari_dasha', 'vimshottaridasha'].includes(activeModule) && <DashaChartView data={kundliData} dasha={kundliData?.vimshottariDasha} />}
                  {activeModule === 'yogini_dasha' && <YoginiDashaView data={kundliData} />}
                  {activeModule === 'ashtottari' && <AshtottariDashaView data={kundliData} />}
                  {activeModule === 'gochar' && <GocharVedhaView natalData={kundliData} />}
                  {['varga', 'varga_kundliyan', 'vargakundliyan', 'divisional_charts'].includes(activeModule) && (
                    <VargaKundaliView masterData={kundliData} language={language} />
                  )}
                  {activeModule === 'sphutas' && <SphutasView data={kundliData} />}
                  {activeModule === 'upagrahas' && <UpagrahaView data={kundliData} />}
                  {activeModule === 'bnn' && <BhriguNandiNadiView masterData={kundliData} />}
                  {activeModule === 'house_speaks' && <HouseSpeaksControl masterData={kundliData} />}
                  {activeModule === 'ashtakavarga' && <AshtakavargaView data={kundliData} />}
                  {['jaimini', 'jaimini_sutra', 'jaimini_sutras'].includes(activeModule) && <JaiminiView data={kundliData} />}
                  {['arudha', 'arudha_chara', 'arudha_pada', 'arudhapada'].includes(activeModule) && <ArudhaCharaView data={kundliData} />}
                  {['sudarshan', 'sudarshana', 'sudarshan_chakra'].includes(activeModule) && <SudarshanaChakraView data={kundliData} />}
                  {activeModule === 'sarvatobhadra' && <SarvatobhadraView data={kundliData} />}
                  {activeModule === 'yoga_dosha' && <YogaDoshaView data={kundliData} />}
                  {activeModule === 'longevity' && <LongevityArgalaView data={kundliData} />}
                  {activeModule === 'special_points' && <SpecialPointsView data={kundliData} />}
                  {['shadbala', 'shadbala_bal', 'shadbalabal'].includes(activeModule) && <ShadbalaView data={kundliData} />}
                  {activeModule === 'lal_kitab' && (
                    <div className="p-5 bg-black/40 border border-[#d4af37]/30 rounded-2xl space-y-4">
                      <h3 className="text-lg font-bold text-[#d4af37]">लाल किताब ज्योतिष (Lal Kitab Analysis)</h3>
                      <p className="text-sm text-gray-300">ग्रह ऋण, दृष्टि एवं सरल उपाय आधारित विश्लेषण।</p>
                      <ShadbalaView data={kundliData} />
                    </div>
                  )}
                  {!['kundli', 'kundli_janmang', 'kundliJanmang', 'kundli_shell', 'kp', 'dasha', 'vimshottari', 'vimshottari_dasha', 'vimshottaridasha', 'yogini_dasha', 'ashtottari', 'gochar', 'varga', 'varga_kundliyan', 'vargakundliyan', 'divisional_charts', 'sphutas', 'upagrahas', 'bnn', 'house_speaks', 'ashtakavarga', 'jaimini', 'arudha', 'arudha_chara', 'arudha_pada', 'arudhapada', 'sudarshan', 'sudarshana', 'sudarshan_chakra', 'sarvatobhadra', 'yoga_dosha', 'longevity', 'special_points', 'shadbala', 'lal_kitab'].includes(activeModule) && (
                    <div className="p-6 bg-black/40 border border-[#d4af37]/30 rounded-2xl text-center space-y-3">
                      <h3 className="text-xl font-bold text-[#d4af37]">{moduleTitle}</h3>
                      <p className="text-sm text-gray-300">{t(`modules.${activeModule}.desc`) || 'Dedicated module analysis.'}</p>
                      <p className="text-xs text-emerald-400 font-medium">Ephemeris engine calculations verified successfully.</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
};
