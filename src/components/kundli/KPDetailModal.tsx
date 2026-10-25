import React from 'react';
import { X, Sparkles, Compass, ShieldAlert, Award, Star } from 'lucide-react';
import { KPPlanetData, KPCuspData, KPPlanetSignificator, KPHouseSignificator, KPRulingPlanetItem } from '../../services/jyotish/kpEngine';
import { getLocalizedPlanet, getLocalizedRashi } from '../../i18n/astrology';
import { LanguageCode } from '../../i18n';

export type KPDetailItem =
  | { type: 'planet'; data: KPPlanetData; significator?: KPPlanetSignificator }
  | { type: 'cusp'; data: KPCuspData; significator?: KPHouseSignificator }
  | { type: 'planet_significator'; data: KPPlanetSignificator; planetData?: KPPlanetData }
  | { type: 'house_significator'; data: KPHouseSignificator; cuspData?: KPCuspData }
  | { type: 'ruling_planet'; data: KPRulingPlanetItem; planetData?: KPPlanetData; significator?: KPPlanetSignificator };

interface KPDetailModalProps {
  isOpen: boolean;
  item: KPDetailItem | null;
  language: LanguageCode;
  onClose: () => void;
  onOpenPlanetStory?: (planetKey: string) => void;
}

export const KPDetailModal: React.FC<KPDetailModalProps> = ({
  isOpen,
  item,
  language,
  onClose,
  onOpenPlanetStory
}) => {
  if (!isOpen || !item) return null;

  const isHindi = language === 'hi';

  const renderContent = () => {
    if (!item.data) {
      return (
        <div className="p-8 text-center text-gray-400">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="text-sm">
            {isHindi ? 'इस अनुभाग का विस्तृत डेटा उपलब्ध नहीं है।' : 'Detailed data for this section is not available.'}
          </p>
        </div>
      );
    }

    if (item.type === 'planet') {
      const pd = item.data;
      const sig = item.significator;
      const planetName = getLocalizedPlanet(pd.planet, language);

      return (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-[#0a2318]/70 border border-[#d4af37]/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                {isHindi ? 'केपी ग्रह स्थिति' : 'KP Planet Position'}
              </span>
              <h3 className="text-xl font-bold text-[#d4af37]">{planetName}</h3>
              <p className="text-xs text-gray-300">
                {isHindi ? `भाव ${pd.house} में स्थित` : `Occupying House ${pd.house}`}
                {' • '}
                {pd.degree.toFixed(2)}° {getLocalizedRashi(pd.rashi, language)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-1 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] font-semibold">
                {pd.retrograde
                  ? (isHindi ? 'वक्री (R)' : 'Retrograde (R)')
                  : pd.combust
                  ? (isHindi ? 'अस्त' : 'Combust')
                  : (isHindi ? 'मार्गी' : 'Direct')}
              </span>
            </div>
          </div>

          {/* Planetary KP Hierarchy */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-black/40 border border-gray-800 rounded-lg p-2.5">
              <span className="text-[10px] text-gray-400 block">{isHindi ? 'राशि स्वामी' : 'Sign Lord'}</span>
              <span className="text-xs font-bold text-gray-200 mt-1 block">
                {getLocalizedPlanet(pd.rashiLord, language)}
              </span>
            </div>
            <div className="bg-black/40 border border-gray-800 rounded-lg p-2.5">
              <span className="text-[10px] text-gray-400 block">{isHindi ? 'नक्षत्र स्वामी' : 'Star Lord'}</span>
              <span className="text-xs font-bold text-gray-200 mt-1 block">
                {getLocalizedPlanet(pd.nakshatraLord, language)}
              </span>
            </div>
            <div className="bg-[#082218]/90 border border-[#d4af37]/50 rounded-lg p-2.5 shadow-[0_0_10px_rgba(212,175,55,0.15)]">
              <span className="text-[10px] text-[#d4af37] font-semibold block">{isHindi ? 'उप-स्वामी' : 'Sub Lord'}</span>
              <span className="text-xs font-bold text-emerald-400 mt-1 block">
                {getLocalizedPlanet(pd.subLord, language)}
              </span>
            </div>
          </div>

          {/* 4-Fold Significators */}
          <div className="bg-black/40 border border-emerald-900/40 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#d4af37] border-b border-emerald-900/40 pb-1.5">
              <Award className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{isHindi ? '4-स्तरीय केपी कारकत्व (4-Fold Significators)' : '4-Fold KP Significators'}</span>
            </div>

            {sig ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">
                    {isHindi ? 'स्तर A (नक्षत्र स्वामी का भाव)' : 'Level A (Star Lord\'s House)'}
                  </span>
                  <span className="font-semibold text-emerald-400">{sig.levelA.join(', ') || '—'}</span>
                </div>
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">
                    {isHindi ? 'स्तर B (ग्रह का अपना भाव)' : 'Level B (Planet\'s Own House)'}
                  </span>
                  <span className="font-semibold text-emerald-400">{sig.levelB.join(', ') || '—'}</span>
                </div>
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">
                    {isHindi ? 'स्तर C (नक्षत्र स्वामी के स्वामित्व भाव)' : 'Level C (Star Lord\'s Owned Houses)'}
                  </span>
                  <span className="font-semibold text-emerald-400">{sig.levelC.join(', ') || '—'}</span>
                </div>
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">
                    {isHindi ? 'स्तर D (ग्रह के स्वामित्व भाव)' : 'Level D (Planet\'s Owned Houses)'}
                  </span>
                  <span className="font-semibold text-emerald-400">{sig.levelD.join(', ') || '—'}</span>
                </div>
                <div className="flex justify-between items-center bg-[#082218] px-2.5 py-2 rounded border border-[#d4af37]/30 mt-2">
                  <span className="text-[#d4af37] font-bold text-[11px]">
                    {isHindi ? 'कुल कारक भाव' : 'All Signified Houses'}
                  </span>
                  <span className="font-bold text-[#d4af37]">
                    {sig.allSignifiedHouses.length > 0 ? sig.allSignifiedHouses.join(', ') : '—'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-1">
                {isHindi ? 'कारकत्व डेटा उपलब्ध नहीं है।' : 'Significator data not available.'}
              </p>
            )}
          </div>

          {/* Planet Story Action Button */}
          {onOpenPlanetStory && (
            <button
              onClick={() => {
                onClose();
                onOpenPlanetStory(pd.planet);
              }}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#082218] to-[#0d3425] border border-[#d4af37]/50 text-[#d4af37] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#d4af37]/20 hover:border-[#d4af37] transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>
                {isHindi
                  ? `${planetName} की गाथा व व्याख्या देखें`
                  : `View ${planetName} Cinema & Story`}
              </span>
            </button>
          )}
        </div>
      );
    }

    if (item.type === 'cusp') {
      const cd = item.data;
      const hSig = item.significator;
      const houseTitle = isHindi ? `भाव कस्प ${cd.house}` : `Cusp ${cd.house}`;

      return (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-[#0a2318]/70 border border-[#d4af37]/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                {isHindi ? 'प्लेसिडस भाव कस्प' : 'Placidus Bhava Cusp'}
              </span>
              <h3 className="text-xl font-bold text-[#d4af37]">{houseTitle}</h3>
              <p className="text-xs text-gray-300">
                {cd.degree.toFixed(2)}° {getLocalizedRashi(cd.rashi, language)} ({cd.cuspLongitude.toFixed(2)}°)
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#082218] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] font-bold text-sm">
              #{cd.house}
            </div>
          </div>

          {/* Cusp KP Hierarchy */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-black/40 border border-gray-800 rounded-lg p-2.5">
              <span className="text-[10px] text-gray-400 block">{isHindi ? 'भावेश (राशि स्वामी)' : 'Sign Lord'}</span>
              <span className="text-xs font-bold text-gray-200 mt-1 block">
                {getLocalizedPlanet(cd.rashiLord, language)}
              </span>
            </div>
            <div className="bg-black/40 border border-gray-800 rounded-lg p-2.5">
              <span className="text-[10px] text-gray-400 block">{isHindi ? 'कस्प नक्षत्र स्वामी' : 'Star Lord'}</span>
              <span className="text-xs font-bold text-gray-200 mt-1 block">
                {getLocalizedPlanet(cd.nakshatraLord, language)}
              </span>
            </div>
            <div className="bg-[#082218]/90 border border-[#d4af37]/50 rounded-lg p-2.5 shadow-[0_0_10px_rgba(212,175,55,0.15)]">
              <span className="text-[10px] text-[#d4af37] font-semibold block">{isHindi ? 'कस्प उप-स्वामी' : 'Sub Lord'}</span>
              <span className="text-xs font-bold text-emerald-400 mt-1 block">
                {getLocalizedPlanet(cd.subLord, language)}
              </span>
            </div>
          </div>

          {/* House Significators */}
          <div className="bg-black/40 border border-emerald-900/40 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#d4af37] border-b border-emerald-900/40 pb-1.5">
              <Award className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{isHindi ? `भाव ${cd.house} के 4-स्तरीय कारक ग्रह` : `House ${cd.house} 4-Fold Significators`}</span>
            </div>

            {hSig ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">
                    {isHindi ? 'स्तर A (भाव स्थित ग्रहों के नक्षत्र में)' : 'Level A (In star of occupants)'}
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {hSig.levelA.map(p => getLocalizedPlanet(p, language)).join(', ') || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">
                    {isHindi ? 'स्तर B (भाव में स्थित ग्रह)' : 'Level B (Occupants)'}
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {hSig.levelB.map(p => getLocalizedPlanet(p, language)).join(', ') || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">
                    {isHindi ? 'स्तर C (भावेश के नक्षत्र में ग्रह)' : 'Level C (In star of house lord)'}
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {hSig.levelC.map(p => getLocalizedPlanet(p, language)).join(', ') || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">
                    {isHindi ? 'स्तर D (भाव का स्वामी)' : 'Level D (House lord)'}
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {hSig.levelD.map(p => getLocalizedPlanet(p, language)).join(', ') || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#082218] px-2.5 py-2 rounded border border-[#d4af37]/30 mt-2">
                  <span className="text-[#d4af37] font-bold text-[11px]">
                    {isHindi ? 'कुल कारक ग्रह' : 'All Significator Planets'}
                  </span>
                  <span className="font-bold text-[#d4af37]">
                    {hSig.allSignificatorPlanets.length > 0
                      ? hSig.allSignificatorPlanets.map(p => getLocalizedPlanet(p, language)).join(', ')
                      : '—'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-1">
                {isHindi ? 'कारक ग्रह उपलब्ध नहीं हैं।' : 'Significators not available.'}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (item.type === 'planet_significator') {
      const sig = item.data;
      const pd = item.planetData;
      const planetName = getLocalizedPlanet(sig.planet, language);

      return (
        <div className="space-y-4">
          <div className="bg-[#0a2318]/70 border border-[#d4af37]/40 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
              {isHindi ? 'ग्रह कारकत्व विवरण' : 'Planet Significator Details'}
            </span>
            <h3 className="text-xl font-bold text-[#d4af37]">{planetName}</h3>
            {pd && (
              <p className="text-xs text-gray-300">
                {isHindi ? `KP भाव ${pd.house}` : `KP House ${pd.house}`}
                {' • '}
                {isHindi ? `नक्षत्र स्वामी: ${getLocalizedPlanet(pd.nakshatraLord, language)}` : `Star Lord: ${getLocalizedPlanet(pd.nakshatraLord, language)}`}
              </p>
            )}
          </div>

          <div className="bg-black/40 border border-emerald-900/40 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-2 rounded border border-white/5">
              <span className="text-gray-400">
                {isHindi ? 'स्तर A (नक्षत्र स्वामी स्थित भाव)' : 'Level A (Star Lord\'s House)'}
              </span>
              <span className="font-bold text-emerald-400">{sig.levelA.join(', ') || '—'}</span>
            </div>
            <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-2 rounded border border-white/5">
              <span className="text-gray-400">
                {isHindi ? 'स्तर B (ग्रह स्वयं स्थित भाव)' : 'Level B (Planet\'s House)'}
              </span>
              <span className="font-bold text-emerald-400">{sig.levelB.join(', ') || '—'}</span>
            </div>
            <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-2 rounded border border-white/5">
              <span className="text-gray-400">
                {isHindi ? 'स्तर C (नक्षत्र स्वामी के स्वामित्व भाव)' : 'Level C (Star Lord\'s Owned Houses)'}
              </span>
              <span className="font-bold text-emerald-400">{sig.levelC.join(', ') || '—'}</span>
            </div>
            <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-2 rounded border border-white/5">
              <span className="text-gray-400">
                {isHindi ? 'स्तर D (ग्रह के अपने स्वामित्व भाव)' : 'Level D (Planet\'s Owned Houses)'}
              </span>
              <span className="font-bold text-emerald-400">{sig.levelD.join(', ') || '—'}</span>
            </div>
            <div className="flex justify-between items-center bg-[#082218] px-2.5 py-2 rounded border border-[#d4af37]/30 mt-2">
              <span className="text-[#d4af37] font-bold">
                {isHindi ? 'कुल कारक भाव' : 'All Signified Houses'}
              </span>
              <span className="font-bold text-[#d4af37]">
                {sig.allSignifiedHouses.join(', ') || '—'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (item.type === 'house_significator') {
      const hSig = item.data;
      const cd = item.cuspData;

      return (
        <div className="space-y-4">
          <div className="bg-[#0a2318]/70 border border-[#d4af37]/40 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
              {isHindi ? 'भाव कारकत्व विवरण' : 'House Significator Details'}
            </span>
            <h3 className="text-xl font-bold text-[#d4af37]">
              {isHindi ? `भाव ${hSig.house}` : `House ${hSig.house}`}
            </h3>
            {cd && (
              <p className="text-xs text-gray-300">
                {isHindi ? `भावेश: ${getLocalizedPlanet(cd.rashiLord, language)}` : `Lord: ${getLocalizedPlanet(cd.rashiLord, language)}`}
                {' • '}
                {isHindi ? `उप-स्वामी: ${getLocalizedPlanet(cd.subLord, language)}` : `Sub Lord: ${getLocalizedPlanet(cd.subLord, language)}`}
              </p>
            )}
          </div>

          <div className="bg-black/40 border border-emerald-900/40 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-2 rounded border border-white/5">
              <span className="text-gray-400">
                {isHindi ? 'स्तर A (भाव स्थित ग्रहों के नक्षत्र में)' : 'Level A (In star of occupants)'}
              </span>
              <span className="font-bold text-emerald-400">
                {hSig.levelA.map(p => getLocalizedPlanet(p, language)).join(', ') || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-2 rounded border border-white/5">
              <span className="text-gray-400">
                {isHindi ? 'स्तर B (भाव में स्थित ग्रह)' : 'Level B (Occupants)'}
              </span>
              <span className="font-bold text-emerald-400">
                {hSig.levelB.map(p => getLocalizedPlanet(p, language)).join(', ') || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-2 rounded border border-white/5">
              <span className="text-gray-400">
                {isHindi ? 'स्तर C (भावेश के नक्षत्र में ग्रह)' : 'Level C (In star of house lord)'}
              </span>
              <span className="font-bold text-emerald-400">
                {hSig.levelC.map(p => getLocalizedPlanet(p, language)).join(', ') || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-2 rounded border border-white/5">
              <span className="text-gray-400">
                {isHindi ? 'स्तर D (भाव का स्वामी)' : 'Level D (House lord)'}
              </span>
              <span className="font-bold text-emerald-400">
                {hSig.levelD.map(p => getLocalizedPlanet(p, language)).join(', ') || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-[#082218] px-2.5 py-2 rounded border border-[#d4af37]/30 mt-2">
              <span className="text-[#d4af37] font-bold">
                {isHindi ? 'कुल कारक ग्रह' : 'All Significator Planets'}
              </span>
              <span className="font-bold text-[#d4af37]">
                {hSig.allSignificatorPlanets.map(p => getLocalizedPlanet(p, language)).join(', ') || '—'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (item.type === 'ruling_planet') {
      const rp = item.data;
      const pd = item.planetData;
      const sig = item.significator;
      const planetName = getLocalizedPlanet(rp.planet, language);

      return (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-[#0a2318]/70 border border-[#d4af37]/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {isHindi ? 'केपी रूलिंग प्लैनेट (कार्येश ग्रह)' : 'KP Ruling Planet'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold border border-[#d4af37]/40">
                  #{rp.priority}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#d4af37]">{planetName}</h3>
              <p className="text-xs text-gray-300">
                {rp.label} ({rp.source})
              </p>
            </div>
            <div className="text-right">
              <span className={`text-[10px] px-2 py-1 rounded font-semibold border ${
                rp.isRetrograde 
                  ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                  : 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
              }`}>
                {rp.isRetrograde
                  ? (isHindi ? 'वक्री (R)' : 'Retrograde (R)')
                  : (isHindi ? 'मार्गी' : 'Direct')}
              </span>
            </div>
          </div>

          {/* Retrograde Warning in KP Horary */}
          {rp.isRetrograde && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                {isHindi
                  ? 'केपी नियम: वक्री रूलिंग प्लैनेट फल प्राप्ति में विलंब या अवरोध का संकेत देता है।'
                  : 'KP Rule: A retrograde ruling planet indicates delay or impediment in event fruition.'}
              </span>
            </div>
          )}

          {rp.isStarLordRetrograde && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                {isHindi
                  ? `केपी नियम: इस ग्रह का नक्षत्र स्वामी (${getLocalizedPlanet(rp.starLord || '', language)}) वक्री है।`
                  : `KP Rule: Star Lord of this planet (${getLocalizedPlanet(rp.starLord || '', language)}) is retrograde.`}
              </span>
            </div>
          )}

          {/* Planetary KP Hierarchy if available */}
          {pd && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-black/40 border border-gray-800 rounded-lg p-2.5">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'राशि स्वामी' : 'Sign Lord'}</span>
                <span className="text-xs font-bold text-gray-200 mt-1 block">
                  {getLocalizedPlanet(pd.rashiLord, language)}
                </span>
              </div>
              <div className="bg-black/40 border border-gray-800 rounded-lg p-2.5">
                <span className="text-[10px] text-gray-400 block">{isHindi ? 'नक्षत्र स्वामी' : 'Star Lord'}</span>
                <span className="text-xs font-bold text-gray-200 mt-1 block">
                  {getLocalizedPlanet(pd.nakshatraLord, language)}
                </span>
              </div>
              <div className="bg-[#082218]/90 border border-[#d4af37]/50 rounded-lg p-2.5 shadow-[0_0_10px_rgba(212,175,55,0.15)]">
                <span className="text-[10px] text-[#d4af37] font-semibold block">{isHindi ? 'उप-स्वामी' : 'Sub Lord'}</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 block">
                  {getLocalizedPlanet(pd.subLord, language)}
                </span>
              </div>
            </div>
          )}

          {/* 4-Fold Significators */}
          {sig && (
            <div className="bg-black/40 border border-emerald-900/40 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#d4af37] border-b border-emerald-900/40 pb-1.5">
                <Award className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{isHindi ? '4-स्तरीय केपी कारकत्व' : '4-Fold KP Significators'}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">{isHindi ? 'स्तर A' : 'Level A'}</span>
                  <span className="font-semibold text-emerald-400">{sig.levelA.join(', ') || '—'}</span>
                </div>
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">{isHindi ? 'स्तर B' : 'Level B'}</span>
                  <span className="font-semibold text-emerald-400">{sig.levelB.join(', ') || '—'}</span>
                </div>
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">{isHindi ? 'स्तर C' : 'Level C'}</span>
                  <span className="font-semibold text-emerald-400">{sig.levelC.join(', ') || '—'}</span>
                </div>
                <div className="flex justify-between items-center bg-[#0a1812] px-2.5 py-1.5 rounded border border-white/5">
                  <span className="text-gray-400 text-[11px]">{isHindi ? 'स्तर D' : 'Level D'}</span>
                  <span className="font-semibold text-emerald-400">{sig.levelD.join(', ') || '—'}</span>
                </div>
                <div className="flex justify-between items-center bg-[#082218] px-2.5 py-2 rounded border border-[#d4af37]/30 mt-2">
                  <span className="text-[#d4af37] font-bold text-[11px]">{isHindi ? 'कुल कारक भाव' : 'All Signified Houses'}</span>
                  <span className="font-bold text-[#d4af37]">{sig.allSignifiedHouses.join(', ') || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Planet Story Action Button */}
          {onOpenPlanetStory && (
            <button
              onClick={() => {
                onClose();
                onOpenPlanetStory(rp.planet);
              }}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#082218] to-[#0d3425] border border-[#d4af37]/50 text-[#d4af37] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#d4af37]/20 hover:border-[#d4af37] transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>
                {isHindi
                  ? `${planetName} की गाथा व व्याख्या देखें`
                  : `View ${planetName} Cinema & Story`}
              </span>
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#081812] border-t sm:border border-[#d4af37]/50 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-[#d4af37]/30 flex items-center justify-between bg-[#06140e]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#d4af37]" />
            <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider">
              {isHindi ? 'केपी ज्योतिष विश्लेषण' : 'KP Jyotish Analysis'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label={isHindi ? 'बंद करें' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {renderContent()}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3.5 border-t border-white/10 bg-[#06140e] flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-black/60 border border-gray-700 text-gray-200 text-xs font-semibold hover:border-gray-500 active:scale-95 transition-all cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
