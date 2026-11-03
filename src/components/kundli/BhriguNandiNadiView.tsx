/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { useTranslation } from '../../i18n';
import { Compass, Sparkles, Shield, Zap, BookOpen, Layers } from 'lucide-react';
import { getLocalizedPlanet, getLocalizedRashi } from '../../i18n/astrology';

interface BhriguNandiNadiViewProps {
  masterData?: MasterKundliData | null;
}

export const BhriguNandiNadiView: React.FC<BhriguNandiNadiViewProps> = ({ masterData }) => {
  const { t, currentLanguageInfo } = useTranslation();
  const lang = currentLanguageInfo.code;

  // Safe fallback if masterData or planets missing
  const planets = useMemo(() => {
    if (!masterData || !masterData.planets) return {};
    return masterData.planets;
  }, [masterData]);

  const planetList = useMemo(() => {
    const pNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    return pNames
      .map(name => {
        const p = planets[name] || planets[name.toLowerCase()] || planets[name.toUpperCase()];
        if (!p) return null;
        const houseNum = p.house || p.d1House || p.rashi || 1;
        const rashiNum = p.rashi || houseNum;
        return {
          name,
          house: houseNum,
          rashiName: getLocalizedRashi(rashiNum),
          nakshatra: p.nakshatraName || p.nakshatra || 'Ashwini',
          isRetrograde: !!p.isRetrograde,
          degree: p.degree || 0,
        };
      })
      .filter(Boolean) as Array<{
        name: string;
        house: number;
        rashiName: string;
        nakshatra: string | number;
        isRetrograde: boolean;
        degree: number;
      }>;
  }, [planets, lang]);

  // 1-5-9 Trikona groups
  const trikonaGroups = useMemo(() => {
    const groups: Record<number, typeof planetList> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

    planetList.forEach(p => {
      const mod = ((p.house - 1) % 4) + 1;
      if (groups[mod]) {
        groups[mod].push(p);
      }
    });

    return groups;
  }, [planetList]);

  // Directional alignments (Dishatmak Yuti)
  const directions = [
    { key: 'purva', nameKey: 'bnnView.purvaDir', houses: [1, 5, 9], icon: Zap, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { key: 'dakshin', nameKey: 'bnnView.dakshinDir', houses: [2, 6, 10], icon: Compass, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { key: 'paschim', nameKey: 'bnnView.paschimDir', houses: [3, 7, 11], icon: Sparkles, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
    { key: 'uttar', nameKey: 'bnnView.uttarDir', houses: [4, 8, 12], icon: Layers, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  ];

  // Karaka analysis
  const guruPlanet = planetList.find(p => p.name.toLowerCase() === 'jupiter');
  const shaniPlanet = planetList.find(p => p.name.toLowerCase() === 'saturn');
  const shukraPlanet = planetList.find(p => p.name.toLowerCase() === 'venus');

  const formatDesc = (template: string, house: number, rashi: string) => {
    return template.replace('{house}', String(house)).replace('{rashi}', rashi);
  };

  const formatHouse = (h: number) => (lang === 'hi' ? `भाव ${h}` : `House ${h}`);
  const formatCount = (c: number) => (lang === 'hi' ? `${c} ग्रह` : `${c} Planets`);

  return (
    <div className="space-y-6 text-white">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a2e20] via-[#03140f] to-[#010806] border border-[#d4af37]/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-[#d4af37]">
          <Compass className="w-24 h-24" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold uppercase tracking-wider border border-[#d4af37]/40">
              {t('bnnView.title') || 'Bhrugu Nandi Nadi'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">✓ {t('bnnView.badge') || 'Verified Engine'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-[#d4af37] font-bold">
            {t('modules.bnn.title') || 'Bhrugu Nandi Nadi System'}
          </h2>
          <p className="text-sm text-gray-300 font-sans leading-relaxed">
            {t('bnnView.desc') || 'Explore 1-5-9 trine combinations (Trikona Sambandh), directional sign groupings and Nadi karaka guidance.'}
          </p>
        </div>
      </div>

      {/* 1. Karaka Guidance Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {t('bnnView.karakaTitle') || 'Karaka Guidance'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Guru / Jeeva */}
          <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/20 space-y-2 hover:border-[#d4af37]/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#d4af37] uppercase">{t('bnnView.jeevaTitle') || 'Jeeva Karaka (Jupiter)'}</span>
              <span className="text-xs font-mono bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded">
                {formatHouse(guruPlanet?.house || 1)}
              </span>
            </div>
            <p className="text-xs text-gray-300">
              {guruPlanet
                ? formatDesc(t('bnnView.guruDesc') || 'Jupiter is placed in House {house} ({rashi}). Represents soul expansion and wisdom.', guruPlanet.house, guruPlanet.rashiName)
                : (t('bnnView.planetActive') || 'Position active in chart.')}
            </p>
          </div>

          {/* Shani / Karma */}
          <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/20 space-y-2 hover:border-[#d4af37]/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#d4af37] uppercase">{t('bnnView.karmaTitle') || 'Karma Karaka (Saturn)'}</span>
              <span className="text-xs font-mono bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded">
                {formatHouse(shaniPlanet?.house || 1)}
              </span>
            </div>
            <p className="text-xs text-gray-300">
              {shaniPlanet
                ? formatDesc(t('bnnView.shaniDesc') || 'Saturn is placed in House {house} ({rashi}). Governs professional destiny and action.', shaniPlanet.house, shaniPlanet.rashiName)
                : (t('bnnView.planetActive') || 'Position active in chart.')}
            </p>
          </div>

          {/* Shukra / Dhana */}
          <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/20 space-y-2 hover:border-[#d4af37]/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#d4af37] uppercase">{t('bnnView.dhanaTitle') || 'Dhana Karaka (Venus)'}</span>
              <span className="text-xs font-mono bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded">
                {formatHouse(shukraPlanet?.house || 1)}
              </span>
            </div>
            <p className="text-xs text-gray-300">
              {shukraPlanet
                ? formatDesc(t('bnnView.shukraDesc') || 'Venus is placed in House {house} ({rashi}). Governs wealth and comforts.', shukraPlanet.house, shukraPlanet.rashiName)
                : (t('bnnView.planetActive') || 'Position active in chart.')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. 1-5-9 Trikona Sambandh */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {t('bnnView.trikonaTitle') || '1-5-9 Trine Relationships'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(trikonaGroups).map(([modKey, groupPlanets]) => {
            const groupNameKey = `bnnView.trineGroup${modKey}`;
            const groupName = t(groupNameKey) || `Trine Group ${modKey}`;
            return (
              <div key={modKey} className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/20 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-[#d4af37]">
                    {groupName}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">
                    {formatCount(groupPlanets.length)}
                  </span>
                </div>
                {groupPlanets.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">{t('bnnView.noPlanets') || 'No direct occupants in this trine group.'}</p>
                ) : (
                  <div className="space-y-2">
                    {groupPlanets.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{getLocalizedPlanet(p.name)}</span>
                          {p.isRetrograde && <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">R</span>}
                        </div>
                        <div className="text-right text-gray-300">
                          <span>{formatHouse(p.house)}</span>
                          <span className="text-[10px] text-gray-400 ml-1">({p.degree.toFixed(1)}°)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Directional Alignment (Dishatmak Yuti) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1 flex items-center gap-2">
          <Compass className="w-4 h-4" />
          {t('bnnView.directionalTitle') || 'Directional Elements'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {directions.map(dir => {
            const matchingPlanets = planetList.filter(p => dir.houses.includes(p.house));
            const IconComponent = dir.icon;
            const dirName = t(dir.nameKey) || dir.key;
            return (
              <div key={dir.key} className={`p-4 rounded-xl border ${dir.color} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    <span className="text-xs font-bold">{dirName}</span>
                  </div>
                  <span className="text-xs font-mono font-bold">
                    {formatCount(matchingPlanets.length)}
                  </span>
                </div>
                {matchingPlanets.length === 0 ? (
                  <p className="text-xs opacity-60 italic">{t('bnnView.noDirection') || 'No planetary occupancy in this directional axis.'}</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {matchingPlanets.map((mp, mIdx) => (
                      <span key={mIdx} className="text-xs bg-black/40 px-2 py-1 rounded-md border border-white/10 font-medium">
                        {getLocalizedPlanet(mp.name)} <span className="text-[10px] opacity-70">({formatHouse(mp.house)})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 rounded-xl bg-[#03140f] border border-[#d4af37]/20 flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-[#d4af37] shrink-0" />
        <p className="text-xs text-gray-300">
          {t('bnnView.footerText') || 'According to Bhrugu Nandi Nadi, planetary trine relationships and karaka aspects provide profound insights into destiny, profession and wealth.'}
        </p>
      </div>
    </div>
  );
};
