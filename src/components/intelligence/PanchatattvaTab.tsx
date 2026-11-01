/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PANCHATATTVA (5 ELEMENTS) TAB
 */

import React, { useMemo } from 'react';
import { BirthProfile, MasterKundliData } from '../../types/kundli';
import { IntelligenceEngine, PanchatattvaResult } from '../../services/intelligence/intelligenceEngine';
import { Flame, Mountain, Wind, Droplets, Sparkles } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface Props {
  profile: BirthProfile;
  masterKundliData?: MasterKundliData | null;
  showToast?: (msg: string) => void;
}

export default function PanchatattvaTab({ profile, masterKundliData, showToast }: Props) {
  const { t } = useTranslation();

  const data: PanchatattvaResult = useMemo(() => {
    if (masterKundliData?.panchatattva) {
      return masterKundliData.panchatattva;
    }
    return IntelligenceEngine.getPanchatattva(profile);
  }, [profile, masterKundliData]);

  const elementCards = [
    { name: 'Fire (अग्नि)', score: data.scores.fire, pct: data.percentages.fire, icon: <Flame className="w-5 h-5 text-amber-500" />, desc: 'ऊर्जा, उत्साह, निर्णय शक्ति एवं आत्म-विश्वास', color: 'from-amber-500/20 to-transparent border-amber-500/30' },
    { name: 'Earth (पृथ्वी)', score: data.scores.earth, pct: data.percentages.earth, icon: <Mountain className="w-5 h-5 text-emerald-500" />, desc: 'धैर्य, स्थिरता, व्यावहारिक बुद्धि एवं सहनशीलता', color: 'from-emerald-500/20 to-transparent border-emerald-500/30' },
    { name: 'Air (वायु)', score: data.scores.air, pct: data.percentages.air, icon: <Wind className="w-5 h-5 text-cyan-400" />, desc: 'चिंतन, संवाद, बौद्धिक विस्तार एवं गतिशीलता', color: 'from-cyan-500/20 to-transparent border-cyan-500/30' },
    { name: 'Water (जल)', score: data.scores.water, pct: data.percentages.water, icon: <Droplets className="w-5 h-5 text-blue-400" />, desc: 'संवेदना, अंतःप्रेरणा, अनुकूलन एवं मानसिक शांति', color: 'from-blue-500/20 to-transparent border-blue-500/30' },
    { name: 'Ether (आकाश)', score: data.scores.ether, pct: data.percentages.ether, icon: <Sparkles className="w-5 h-5 text-purple-400" />, desc: 'आत्म-बोध, विवेक, चेतना एवं आध्यात्मिक जिज्ञासा', color: 'from-purple-500/20 to-transparent border-purple-500/30' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {/* Header Banner */}
      <div className="bg-[#0a1510]/80 border border-[#d4af37]/40 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-[#d4af37] font-bold text-base tracking-wider uppercase flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              पंचतत्व सामंजस्य (Panchatattva Harmony)
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              अग्नि, पृथ्वी, वायु, जल और आकाश — जीवन के 5 आधारभूत तत्वों का अनुपात व प्रभाव।
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold">
            प्रधान तत्व: {data.dominant}
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {elementCards.map(item => (
            <div key={item.name} className={`bg-gradient-to-r ${item.color} p-3.5 rounded-xl border bg-black/40`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="font-semibold text-xs text-white">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-[#d4af37]">{item.pct}%</span>
              </div>
              <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="bg-[#d4af37] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
