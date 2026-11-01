/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { SpecialLagnaEngine } from '../../services/astrology/specialLagnaEngine';
import CarvedCard from '../ui/CarvedCard';
import { Compass, Star, Coins, Crown, Heart, BookOpen, UserCircle, Zap } from 'lucide-react';
import { getLocalizedRashi } from '../../i18n/astrology';
import { useTranslation } from '../../i18n';

interface SpecialPointsViewProps {
  data: MasterKundliData;
}

export const SpecialPointsView: React.FC<SpecialPointsViewProps> = ({ data }) => {
  const { language } = useTranslation();
  const analysis = useMemo(() => SpecialLagnaEngine.calculate(data), [data]);
  const { lagnas, sahams } = analysis;

  const getLagnaIcon = (name: string) => {
    switch (name) {
      case 'Indu Lagna': return <Coins className="w-5 h-5 text-yellow-500" />;
      case 'Sree Lagna': return <Heart className="w-5 h-5 text-pink-400" />;
      case 'Bhrigu Bindu': return <Star className="w-5 h-5 text-purple-400" />;
      case 'Hora Lagna': return <Crown className="w-5 h-5 text-amber-500" />;
      case 'Bhava Lagna': return <UserCircle className="w-5 h-5 text-emerald-400" />;
      default: return <Compass className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
            <Compass className="w-6 h-6 text-yellow-400" />
            {language === 'hi' ? 'विशेष लग्न एवं सहम' : 'Special Lagnas & Sahams'}
          </h2>
          <p className="text-white/60 text-sm mt-1 font-sans italic">
            {language === 'hi' 
              ? 'जागन्नाथ होरा आधारित उन्नत गणितीय लग्न एवं अरबी बिंदु' 
              : 'Advanced Arabic points and mathematical lagnas from Jagannatha Hora'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Special Lagnas Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-yellow-500/80 mb-2 flex items-center gap-2 px-1">
            <Star className="w-5 h-5" />
            {language === 'hi' ? 'गणितीय लग्न' : 'Mathematical Lagnas'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lagnas.map((lagna, idx) => (
              <CarvedCard key={idx} cornerSize={16} className="p-4 bg-[#082218]/40 border-white/5 group hover:border-yellow-500/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/10 group-hover:border-yellow-500/20">
                    {getLagnaIcon(lagna.name)}
                  </div>
                  <div>
                    <div className="text-yellow-400 text-sm font-bold font-serif">
                      {language === 'hi' ? lagna.hindiName : lagna.name}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white/90">
                      {getLocalizedRashi(lagna.rashi, language as any)}
                    </div>
                    <div className="text-[10px] font-mono text-white/40">
                      {lagna.degree.toFixed(2)}°
                    </div>
                  </div>
                  <div className="text-[8px] bg-yellow-500/10 text-yellow-500/60 px-2 py-0.5 rounded border border-yellow-500/20 uppercase font-black">
                    {language === 'hi' ? 'सक्रिय' : 'Active'}
                  </div>
                </div>
                
                <p className="mt-3 text-[9px] text-white/40 leading-tight italic font-serif">
                  {lagna.description}
                </p>
              </CarvedCard>
            ))}
          </div>
        </div>

        {/* 3. Tajik Sahams Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif text-yellow-500/80 mb-2 flex items-center gap-2 px-1">
            <Zap className="w-5 h-5" />
            {language === 'hi' ? 'ताजिक सहम' : 'Tajik Sahams'}
          </h3>

          <div className="space-y-3">
            {sahams.map((saham, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-r from-black/40 to-transparent border border-white/5 hover:border-yellow-500/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-yellow-500/5 flex items-center justify-center border border-yellow-500/10 group-hover:bg-yellow-500/10">
                   <BookOpen className="w-5 h-5 text-yellow-500/40 group-hover:text-yellow-500/80" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-serif">
                      <span className="text-yellow-400 text-sm font-bold mr-2">
                        {language === 'hi' ? saham.hindiName : saham.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-white/80">
                        {getLocalizedRashi(saham.rashi, language as any)}
                      </div>
                      <div className="text-[9px] font-mono text-white/30">
                        {saham.degree.toFixed(2)}°
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 truncate mt-0.5 font-sans">
                    {saham.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <CarvedCard cornerSize={20} className="mt-6 p-4 bg-yellow-500/5 border-yellow-500/10">
            <div className="flex gap-3">
              <Compass className="w-5 h-5 text-yellow-500/40 shrink-0" />
              <p className="text-[10px] text-white/40 leading-relaxed italic font-serif">
                {language === 'hi'
                  ? '"विशेष लग्न और सहम राशिचक्र के संवेदनशील बिंदु हैं। इनका गणना में विशिष्ट गणितीय सूत्रों का प्रयोग होता है।"'
                  : '"Special Lagnas and Sahams act as sensitive points in the zodiac, revealing specific life dimensions like wealth, knowledge, and fame."'}
              </p>
            </div>
          </CarvedCard>
        </div>
      </div>
    </div>
  );
};
