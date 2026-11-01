/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { SphutasEngine } from '../../services/astrology/sphutasEngine';
import CarvedCard from '../ui/CarvedCard';
import { Sparkles, Shield, Zap, Target, Star } from 'lucide-react';
import { getLocalizedPlanet, getLocalizedRashi } from '../../i18n/astrology';
import { useTranslation } from '../../i18n';

interface SphutasViewProps {
  data: MasterKundliData;
}

export const SphutasView: React.FC<SphutasViewProps> = ({ data }) => {
  const { language } = useTranslation();
  const result = useMemo(() => SphutasEngine.calculate(data), [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          {language === 'hi' ? '१४ शास्त्रीय स्फुट' : '14 Classical Sphutas'}
        </h2>
        <p className="text-white/60 text-sm font-sans max-w-2xl">
          {language === 'hi'
            ? 'चक्र के वे गणितीय बिंदु जो समृद्धि, स्वास्थ्य, संतान और भाग्य जैसे जीवन के विशेष आयामों को प्रकट करते हैं।'
            : 'Mathematical points in the chart revealing specific life dimensions like prosperity, health, progeny and fortune.'}
        </p>
      </div>

      {/* Yogi & Avayogi Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CarvedCard cornerSize={24} className="bg-yellow-500/10 border-yellow-500/30 p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Star className="w-32 h-32 text-yellow-500" />
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <div className="text-yellow-500 font-bold text-lg">{language === 'hi' ? 'योगी' : 'Yogi'}</div>
              <div className="text-white font-serif text-2xl mt-1">{getLocalizedPlanet(result.yogi.planet, language as any)}</div>
              <div className="text-white/60 text-sm mt-1">
                {language === 'hi' ? 'नक्षत्र:' : 'Nakshatra:'} <span className="text-yellow-400/80">{result.yogi.nakshatra}</span>
              </div>
              <p className="text-white/40 text-xs mt-3 italic leading-relaxed">
                {language === 'hi'
                  ? 'समृद्धि और सफलता का ग्रह। योगी का गोचर अत्यंत शुभ फलप्रद होता है।'
                  : 'Planet of prosperity and success. Yogi transit is highly auspicious.'}
              </p>
            </div>
          </div>
        </CarvedCard>

        <CarvedCard cornerSize={24} className="bg-red-500/10 border-red-500/30 p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-32 h-32 text-red-500" />
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="text-red-400 font-bold text-lg">{language === 'hi' ? 'अवयोगी' : 'Avayogi'}</div>
              <div className="text-white font-serif text-2xl mt-1">{getLocalizedPlanet(result.avayogi.planet, language as any)}</div>
              <div className="text-white/60 text-sm mt-1">
                {language === 'hi' ? 'नक्षत्र:' : 'Nakshatra:'} <span className="text-red-400/80">{result.avayogi.nakshatra}</span>
              </div>
              <p className="text-white/40 text-xs mt-3 italic leading-relaxed">
                {language === 'hi'
                  ? 'बाधाओं और चुनौतियों का ग्रह। अवयोगी का संबंध कार्यों में विलंब उत्पन्न कर सकता है।'
                  : 'Planet of obstacles and challenges. Avayogi may cause delays.'}
              </p>
            </div>
          </div>
        </CarvedCard>
      </div>

      {/* Sphutas List */}
      <CarvedCard cornerSize={32} className="p-6 bg-[#082218]/40 border-yellow-500/20">
        <h3 className="text-xl font-serif text-yellow-500 mb-6 flex items-center gap-2 border-b border-yellow-500/20 pb-3">
          <Zap className="w-5 h-5" />
          {language === 'hi' ? 'विस्तृत स्फुट गणनाएं' : 'Detailed Sphutas'}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {result.sphutas.map((sphuta, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                sphuta.name.includes('Yogi') 
                ? 'bg-yellow-500/5 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-yellow-400 font-serif font-bold text-sm">
                      {language === 'hi' ? sphuta.hindiName : sphuta.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono font-bold text-sm">{sphuta.formatted}</div>
                  <div className="text-[10px] text-white/40">{getLocalizedRashi(sphuta.rashi, language as any)} ({sphuta.rashi})</div>
                </div>
              </div>
              <p className="text-[11px] text-white/50 italic font-sans mt-2">
                {sphuta.definition}
              </p>
            </div>
          ))}
        </div>
      </CarvedCard>
    </div>
  );
};
