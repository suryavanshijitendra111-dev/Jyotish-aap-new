import React, { useMemo, useState } from 'react';
import { BirthProfile } from '../types/kundli';
import { NumerologyEngine } from '../services/numerology/numerologyEngine';
import { LoShuEngine } from '../services/numerology/loShuEngine';
import DigitalSignsTab from './numerology/DigitalSignsTab';
import { useI18n } from '../i18n';

interface NumerologyProps {
  profile: BirthProfile | null;
  navigate: (view: string) => void;
  showToast: (msg: string) => void;
}

type TabType = 'CORE' | 'TIMING' | 'LOSHU' | 'COMPARE' | 'DATE' | 'DIGITAL';

export default function Numerology({ profile, navigate, showToast }: NumerologyProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const saved = sessionStorage.getItem('jeevandarpan_numerology_tab') as TabType;
      if (saved && ['CORE', 'TIMING', 'LOSHU', 'COMPARE', 'DATE', 'DIGITAL'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'CORE';
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem('jeevandarpan_numerology_tab', tab);
    } catch {}
  };
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [compareName, setCompareName] = useState<string>('');
  const [compareResult, setCompareResult] = useState<any>(null);
  const [analysisDate, setAnalysisDate] = useState<string>('');
  const [dateResult, setDateResult] = useState<any>(null);

  const numData = useMemo(() => {
    if (!profile) return null;
    return NumerologyEngine.evaluate(profile);
  }, [profile]);

  const loShuData = useMemo(() => {
    if (!profile) return null;
    return LoShuEngine.evaluate(profile);
  }, [profile]);

  if (!profile || !numData || !loShuData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#030a08] to-[#082218] text-white">
        <p className="text-[#d4af37] mb-10 text-lg">{t('numerology.noProfileData')}</p>
        <button onClick={() => navigate('dashboard')} className="px-10 py-3 border-2 border-[#d4af37] text-[#d4af37] rounded-full hover:bg-[#d4af37] hover:text-[#030a08] transition-all text-lg">
          {t('numerology.goBack')}
        </button>
      </div>
    );
  }

  const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];

  const handleDateAnalysis = () => {
    if (!analysisDate.trim()) return;
    const res = NumerologyEngine.analyzeDate(analysisDate);
    setDateResult(res);
  };
  
  const handleCompare = () => {
    if (!compareName.trim()) return;
    const result = NumerologyEngine.compareNames(profile!.name, compareName);
    setCompareResult(result);
  };


  const renderTabs = () => (
    <div className="flex bg-black/40 p-1 rounded-full mb-6 border border-[#d4af37]/20 overflow-x-auto">
      <button 
        onClick={() => handleTabChange('CORE')} 
        className={`flex-1 py-2 px-2 rounded-full text-xs font-semibold tracking-wider transition-colors whitespace-nowrap ${activeTab === 'CORE' ? 'bg-[#d4af37] text-[#030a08]' : 'text-gray-400 hover:text-white'}`}
      >
        {t('numerology.tabCore')}
      </button>
      <button 
        onClick={() => handleTabChange('TIMING')} 
        className={`flex-1 py-2 px-2 rounded-full text-xs font-semibold tracking-wider transition-colors whitespace-nowrap ${activeTab === 'TIMING' ? 'bg-[#d4af37] text-[#030a08]' : 'text-gray-400 hover:text-white'}`}
      >
        {t('numerology.tabTiming')}
      </button>
      <button 
        onClick={() => handleTabChange('LOSHU')} 
        className={`flex-1 py-2 px-2 rounded-full text-xs font-semibold tracking-wider transition-colors whitespace-nowrap ${activeTab === 'LOSHU' ? 'bg-[#d4af37] text-[#030a08]' : 'text-gray-400 hover:text-white'}`}
      >
        {t('numerology.tabLoShu')}
      </button>
      <button 
        onClick={() => handleTabChange('COMPARE')} 
        className={`flex-1 py-2 px-2 rounded-full text-xs font-semibold tracking-wider transition-colors whitespace-nowrap ${activeTab === 'COMPARE' ? 'bg-[#d4af37] text-[#030a08]' : 'text-gray-400 hover:text-white'}`}
      >
        {t('numerology.tabCompare')}
      </button>
      <button 
        onClick={() => handleTabChange('DATE')} 
        className={`flex-1 py-2 px-2 rounded-full text-xs font-semibold tracking-wider transition-colors whitespace-nowrap ${activeTab === 'DATE' ? 'bg-[#d4af37] text-[#030a08]' : 'text-gray-400 hover:text-white'}`}
      >
        {t('numerology.tabDate')}
      </button>
      <button 
        onClick={() => handleTabChange('DIGITAL')} 
        className={`flex-1 py-2 px-2 rounded-full text-xs font-semibold tracking-wider transition-colors whitespace-nowrap ${activeTab === 'DIGITAL' ? 'bg-[#d4af37] text-[#030a08]' : 'text-gray-400 hover:text-white'}`}
      >
        {t('numerology.tabDigital')}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col w-full max-w-md mx-auto pb-28 font-sans text-white bg-gradient-to-br from-[#030a08] to-[#082218]">
      <header className="flex justify-between items-center p-5 border-b border-[#d4af37]/20 bg-[#030a08]/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-[#d4af37] hover:text-white transition-colors" aria-label={t('numerology.goBack')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#d4af37]">{t('numerology.advancedTitle')}</h1>
            <p className="text-[10px] text-[#d4af37]/70 tracking-[0.2em]">{profile.name}</p>
          </div>
        </div>
      </header>

      <main className="p-4 flex flex-col gap-6">
        {renderTabs()}

        {activeTab === 'CORE' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4 border-b border-[#d4af37]/20 pb-2">{t('numerology.primaryNumerology')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 text-center">{t('numerology.mulankBirth')}</span>
                  <span className="text-[#d4af37] text-3xl font-bold">{numData.birthNumber}</span>
                  <button onClick={() => showToast(`Mulank Calc: ${numData.birthNumberBreakdown}`)} className="text-[9px] text-[#d4af37]/60 underline mt-1">{t('numerology.why')}</button>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 text-center">{t('numerology.bhagyankDestiny')}</span>
                  <span className="text-[#d4af37] text-3xl font-bold">{numData.destinyNumber}</span>
                  <button onClick={() => showToast(`Bhagyank Calc: ${numData.destinyNumberBreakdown}`)} className="text-[9px] text-[#d4af37]/60 underline mt-1">{t('numerology.why')}</button>
                </div>
              </div>
            </div>

            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <div className="flex justify-between items-center mb-4 border-b border-[#d4af37]/20 pb-2">
                <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase">{t('numerology.nameAnalysisChaldean')}</h2>
                <button onClick={() => showToast(`Vowels: Soul Urge. Consonants: Personality.`)} className="text-[9px] text-[#d4af37]/60 underline">{t('numerology.why')}</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex flex-col items-center justify-center col-span-2">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 text-center">{t('numerology.expressionDestinyNumber')}</span>
                  <span className="text-[#d4af37] text-3xl font-bold">{numData.nameNumber}</span>
                  <span className="text-gray-500 text-[10px] mt-1">{t('numerology.compound')}: {numData.compoundNameNumber}</span>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 text-center">{t('numerology.soulUrge')}</span>
                  <span className="text-[#d4af37] text-xl font-bold">{numData.soulUrgeNumber}</span>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 text-center">{t('numerology.personality')}</span>
                  <span className="text-[#d4af37] text-xl font-bold">{numData.personalityNumber}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 font-mono bg-black/50 p-3 rounded-xl border border-gray-800 break-words leading-relaxed">
                {numData.nameCalculationBreakdown.map((n: any, i) => (
                  <span key={i} className="inline-block mr-1">
                    <span className="text-gray-300">{n.letter}</span>
                    <span className={n.isVowel ? "text-blue-400/70 text-[10px] ml-[1px]" : "text-emerald-500/70 text-[10px] ml-[1px]"}>{n.value}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4 border-b border-[#d4af37]/20 pb-2">{t('numerology.secondaryInfluences')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 text-center">{t('numerology.attitudeNumber')}</span>
                  <span className="text-[#d4af37] text-xl font-bold">{numData.attitudeNumber}</span>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 text-center">{t('numerology.maturityNumber')}</span>
                  <span className="text-[#d4af37] text-xl font-bold">{numData.maturityNumber}</span>
                </div>
              </div>

              {(numData.karmicDebts.length > 0 || numData.masterNumbers.length > 0) && (
                <div className="mt-4 pt-4 border-t border-[#d4af37]/20">
                  {numData.masterNumbers.length > 0 && (
                    <div className="mb-2">
                      <span className="text-[10px] text-gray-400 uppercase">{t('numerology.masterNumbersDetected')}</span>
                      <div className="flex gap-2 mt-1">
                        {numData.masterNumbers.map(n => <span key={n} className="bg-[#d4af37]/20 text-[#d4af37] px-2 py-1 rounded text-xs">{n}</span>)}
                      </div>
                    </div>
                  )}
                  {numData.karmicDebts.length > 0 && (
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">{t('numerology.karmicDebtsDetected')}</span>
                      <div className="flex gap-2 mt-1">
                        {numData.karmicDebts.map(n => <span key={n} className="bg-red-900/40 text-red-400 px-2 py-1 rounded text-xs">{n}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'TIMING' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <div className="flex justify-between items-center mb-4 border-b border-[#d4af37]/20 pb-2">
                <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase">{t('numerology.lifeCyclesTitle')}</h2>
                <button onClick={() => showToast('Derived from Month, Day, and Year of birth based on Destiny number.')} className="text-[9px] text-[#d4af37]/60 underline">{t('numerology.why')}</button>
              </div>
              <div className="space-y-3">
                {numData.lifeCycles.map((cycle: any) => (
                  <div key={cycle.cycleNumber} className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[#d4af37] font-medium text-xs uppercase tracking-wider">{t('numerology.cycleLabel')} {cycle.cycleNumber}: {cycle.value}</span>
                      <span className="text-[10px] text-gray-400 bg-black/50 px-2 py-0.5 rounded border border-gray-700">{t('numerology.ageLabel')}: {cycle.startAge} - {cycle.endAge}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">{cycle.theme}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <div className="flex justify-between items-center mb-4 border-b border-[#d4af37]/20 pb-2">
                <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase">{t('numerology.currentTimingCycles')}</h2>
                <button onClick={() => showToast(`Based on Date: Day + Month + Current Year`)} className="text-[9px] text-[#d4af37]/60 underline">{t('numerology.why')}</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-[9px] uppercase tracking-wider mb-1 text-center">{t('numerology.personalYear')}</span>
                  <span className="text-[#d4af37] text-2xl font-bold">{numData.personalYear}</span>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-[9px] uppercase tracking-wider mb-1 text-center">{t('numerology.personalMonth')}</span>
                  <span className="text-[#d4af37] text-2xl font-bold">{numData.personalMonth}</span>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-[9px] uppercase tracking-wider mb-1 text-center">{t('numerology.personalDay')}</span>
                  <span className="text-[#d4af37] text-2xl font-bold">{numData.personalDay}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4 border-b border-[#d4af37]/20 pb-2">{t('numerology.pinnaclesTitle')}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('numerology.firstPinnacle')}</span>
                  <span className="text-[#d4af37] text-lg font-bold">{numData.pinnacles.first}</span>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('numerology.secondPinnacle')}</span>
                  <span className="text-[#d4af37] text-lg font-bold">{numData.pinnacles.second}</span>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('numerology.thirdPinnacle')}</span>
                  <span className="text-[#d4af37] text-lg font-bold">{numData.pinnacles.third}</span>
                </div>
                <div className="bg-black/40 border border-[#d4af37]/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('numerology.fourthPinnacle')}</span>
                  <span className="text-[#d4af37] text-lg font-bold">{numData.pinnacles.fourth}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a1510]/80 border border-red-900/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-red-400 font-semibold text-xs tracking-widest uppercase mb-4 border-b border-red-900/30 pb-2">{t('numerology.challengesTitle')}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 border border-red-900/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('numerology.firstChallenge')}</span>
                  <span className="text-red-400 text-lg font-bold">{numData.challenges.first}</span>
                </div>
                <div className="bg-black/40 border border-red-900/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('numerology.secondChallenge')}</span>
                  <span className="text-red-400 text-lg font-bold">{numData.challenges.second}</span>
                </div>
                <div className="bg-black/40 border border-red-900/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('numerology.thirdChallenge')}</span>
                  <span className="text-red-400 text-lg font-bold">{numData.challenges.third}</span>
                </div>
                <div className="bg-black/40 border border-red-900/20 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('numerology.fourthChallenge')}</span>
                  <span className="text-red-400 text-lg font-bold">{numData.challenges.fourth}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'LOSHU' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <div className="flex justify-between items-center mb-4 border-b border-[#d4af37]/20 pb-2">
                <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase">{t('numerology.interactiveLoShu')}</h2>
                <button onClick={() => showToast(`Digits Extracted: ${loShuData.digitsExtracted.join(', ')}`)} className="text-[9px] text-[#d4af37]/60 underline">{t('numerology.why')}</button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mx-auto mb-4">
                {gridOrder.map((num) => {
                  const cell = loShuData.grid[num];
                  const isPresent = cell.count > 0;
                  const isSelected = selectedNumber === num;
                  
                  return (
                    <button
                      key={num}
                      onClick={() => setSelectedNumber(num)}
                      className={`
                        aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all duration-300
                        ${isSelected ? 'ring-2 ring-[#d4af37] border-[#d4af37] scale-105 z-10' : ''}
                        ${isPresent 
                          ? 'bg-gradient-to-br from-[#082218] to-[#0a1510] border-[#d4af37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)] text-[#d4af37]' 
                          : 'bg-black/30 border-white/5 text-gray-700'
                        }
                      `}
                    >
                      <span className={`text-3xl font-bold ${isPresent ? 'drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' : ''}`}>{num}</span>
                      {isPresent && (
                        <span className="absolute bottom-1 right-1.5 text-[9px] font-medium opacity-70">
                          ×{cell.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="text-center text-[10px] text-gray-500 italic">{t('numerology.tapNumberDetails')}</div>
            </div>

            {selectedNumber !== null && (
              <div className="bg-[#082218]/90 border border-[#d4af37]/50 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(212,175,55,0.15)]">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[#d4af37] font-bold text-lg">{t('numerology.numberLabel')} {selectedNumber}</h3>
                  <span className="text-[10px] px-2 py-1 bg-black/40 text-gray-300 rounded border border-gray-700">
                    {t('numerology.frequency')}: {loShuData.grid[selectedNumber].count}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  {loShuData.grid[selectedNumber].count > 0 
                    ? t('numerology.presentInGrid') 
                    : t('numerology.missingInGrid')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                <h3 className="text-[#d4af37] font-semibold text-[10px] tracking-widest uppercase mb-2">{t('numerology.missingNumbers')}</h3>
                <div className="flex flex-wrap gap-1">
                  {loShuData.missingNumbers.length > 0 ? (
                    loShuData.missingNumbers.map(n => (
                      <span key={n} className="w-6 h-6 rounded-full bg-black/50 border border-red-900/50 text-gray-400 flex items-center justify-center text-xs">
                        {n}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">{t('numerology.none')}</span>
                  )}
                </div>
              </div>
              
              <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                <h3 className="text-[#d4af37] font-semibold text-[10px] tracking-widest uppercase mb-2">{t('numerology.repeatedNumbers')}</h3>
                <div className="flex flex-col gap-1">
                  {loShuData.repeatedNumbers.length > 0 ? (
                    loShuData.repeatedNumbers.map(rn => (
                      <div key={rn.number} className="text-xs text-gray-300 flex justify-between bg-black/40 p-1 px-2 rounded border border-emerald-900/30">
                        <span>{t('numerology.numberLabel')} {rn.number}</span>
                        <span className="text-[#d4af37]">×{rn.count}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">{t('numerology.none')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-3 border-b border-[#d4af37]/20 pb-2">{t('numerology.loShuPlanes')}</h2>
              <div className="space-y-3">
                {loShuData.planes.map(plane => (
                  <div key={plane.name} className="flex flex-col gap-1 text-sm bg-black/40 p-2 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">{plane.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">[{plane.numbers.join('-')}]</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${plane.isComplete ? 'bg-[#d4af37]' : 'bg-gray-600'}`} style={{ width: `${(plane.filledCount / 3) * 100}%` }}></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{plane.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-3 border-b border-[#d4af37]/20 pb-2">{t('numerology.loShuArrows')}</h2>
              <div className="flex flex-col gap-2">
                {loShuData.arrows.length > 0 ? (
                  loShuData.arrows.map(arrow => (
                    <div key={arrow.id} className={`bg-black/40 border rounded-xl p-3 ${arrow.type === 'STRENGTH' ? 'border-[#d4af37]/20' : 'border-red-900/40'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-medium text-sm ${arrow.type === 'STRENGTH' ? 'text-[#d4af37]' : 'text-red-400'}`}>{arrow.name}</span>
                        <span className="text-xs text-gray-400 font-mono tracking-wider">[{arrow.numbers.join('-')}]</span>
                      </div>
                      <p className="text-xs text-gray-400">{arrow.interpretation}</p>
                      {arrow.type === 'WEAKNESS' && <div className="text-[9px] text-red-500 mt-1 uppercase tracking-wider">{t('numerology.missingPattern')}</div>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">{t('numerology.noCompleteArrows')}</p>
                )}
              </div>
            </div>
          </div>
        )}
      
        {activeTab === 'COMPARE' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4 border-b border-[#d4af37]/20 pb-2">{t('numerology.nameComparison')}</h2>
              <div className="mb-4">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">{t('numerology.enterProposedName')}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={compareName}
                    onChange={(e) => setCompareName(e.target.value)}
                    placeholder={t('numerology.placeholderName')}
                    className="flex-1 bg-black/40 border border-[#d4af37]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                  <button 
                    onClick={handleCompare}
                    className="bg-[#d4af37] text-[#030a08] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4af37]/90 transition-colors"
                  >
                    {t('numerology.analyzeBtn')}
                  </button>
                </div>
              </div>

              {compareResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 border border-gray-700 rounded-xl p-3">
                      <h3 className="text-gray-400 text-[9px] uppercase tracking-wider mb-2 text-center">{t('numerology.currentName')}</h3>
                      <p className="text-white text-center text-sm font-medium mb-3 truncate">{profile.name}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">{t('numerology.destinyLabel')}:</span>
                          <span className="text-[#d4af37] font-bold">{compareResult.current.reduced} <span className="text-[9px] text-gray-600">({compareResult.current.compound})</span></span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">{t('numerology.soulUrge')}:</span>
                          <span className="text-white font-medium">{compareResult.current.soulUrge}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">{t('numerology.personality')}:</span>
                          <span className="text-white font-medium">{compareResult.current.personality}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#082218] border border-[#d4af37]/40 rounded-xl p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#d4af37]/10 rounded-full blur-xl"></div>
                      <h3 className="text-[#d4af37] text-[9px] uppercase tracking-wider mb-2 text-center relative z-10">{t('numerology.proposedName')}</h3>
                      <p className="text-white text-center text-sm font-medium mb-3 truncate relative z-10">{compareName}</p>
                      <div className="space-y-2 relative z-10">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">{t('numerology.destinyLabel')}:</span>
                          <span className="text-[#d4af37] font-bold">{compareResult.proposed.reduced} <span className="text-[9px] text-gray-500">({compareResult.proposed.compound})</span></span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">{t('numerology.soulUrge')}:</span>
                          <span className="text-white font-medium">{compareResult.proposed.soulUrge}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">{t('numerology.personality')}:</span>
                          <span className="text-white font-medium">{compareResult.proposed.personality}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/60 p-3 rounded-lg border border-[#d4af37]/20">
                    <p className="text-xs text-gray-400">
                      <strong className="text-[#d4af37]">{t('numerology.insightLabel')}:</strong> {t('numerology.compareInsightText', { current: compareResult.current.reduced, proposed: compareResult.proposed.reduced, destiny: numData.destinyNumber })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      
        {activeTab === 'DATE' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-[#d4af37] font-semibold text-xs tracking-widest uppercase mb-4 border-b border-[#d4af37]/20 pb-2">{t('numerology.dateAnalysisTitle')}</h2>
              <p className="text-[10px] text-gray-400 mb-4">{t('numerology.dateAnalysisSubtitle')}</p>
              <div className="mb-4">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">{t('numerology.selectDateLabel')}</label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={analysisDate}
                    onChange={(e) => setAnalysisDate(e.target.value)}
                    className="flex-1 bg-black/40 border border-[#d4af37]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                  <button 
                    onClick={handleDateAnalysis}
                    className="bg-[#d4af37] text-[#030a08] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4af37]/90 transition-colors"
                  >
                    {t('numerology.analyzeBtn')}
                  </button>
                </div>
              </div>

              {dateResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/40 border border-gray-700 rounded-xl p-3 flex flex-col items-center justify-center">
                      <span className="text-gray-400 text-[9px] uppercase tracking-wider mb-1 text-center">{t('numerology.dayLabel')}</span>
                      <span className="text-white text-xl font-bold">{dateResult.dayNumber}</span>
                    </div>
                    <div className="bg-black/40 border border-gray-700 rounded-xl p-3 flex flex-col items-center justify-center">
                      <span className="text-gray-400 text-[9px] uppercase tracking-wider mb-1 text-center">{t('numerology.monthLabel')}</span>
                      <span className="text-white text-xl font-bold">{dateResult.monthNumber}</span>
                    </div>
                    <div className="bg-black/40 border border-gray-700 rounded-xl p-3 flex flex-col items-center justify-center">
                      <span className="text-gray-400 text-[9px] uppercase tracking-wider mb-1 text-center">{t('numerology.yearLabel')}</span>
                      <span className="text-white text-xl font-bold">{dateResult.yearNumber}</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#082218] border border-[#d4af37]/40 rounded-xl p-4 relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/10 rounded-full blur-2xl"></div>
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 block relative z-10">{t('numerology.universalDateNumber')}</span>
                    <span className="text-[#d4af37] text-4xl font-bold relative z-10">{dateResult.fullDateNumber}</span>
                    <div className="text-xs text-gray-500 mt-1 relative z-10">{t('numerology.compound')}: {dateResult.compoundNumber}</div>
                    {dateResult.masterNumber && (
                       <div className="text-[10px] text-[#d4af37] font-semibold mt-1 uppercase tracking-wider relative z-10">{t('numerology.masterNumberLabel')}: {dateResult.masterNumber}</div>
                    )}
                  </div>

                  <div className="bg-black/60 p-3 rounded-lg border border-[#d4af37]/20 flex justify-between items-center">
                     <span className="text-xs text-gray-400">{t('numerology.calculationBreakdown')}</span>
                     <button onClick={() => showToast(dateResult.breakdown)} className="text-[10px] text-[#d4af37]/60 underline">{t('numerology.why')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      
        {activeTab === 'DIGITAL' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <DigitalSignsTab profile={profile} numData={numData} showToast={showToast} />
          </div>
        )}
      </main>
    </div>
  );
}

