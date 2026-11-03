/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { ArudhaCharaEngine } from '../../services/astrology/arudhaCharaEngine';
import CarvedCard from '../ui/CarvedCard';
import { LayoutGrid, Timer, MapPin, Calendar, Clock } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface ArudhaCharaViewProps {
  data: MasterKundliData;
}

const RASHI_HINDI: Record<string, string> = {
  Aries: 'मेष',
  Taurus: 'वृषभ',
  Gemini: 'मिथुन',
  Cancer: 'कर्क',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तुला',
  Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुंभ',
  Pisces: 'मीन'
};

export const ArudhaCharaView: React.FC<ArudhaCharaViewProps> = ({ data }) => {
  const { language } = useTranslation();
  const result = useMemo(() => ArudhaCharaEngine.calculate(data), [data]);
  const isHi = language === 'hi';

  const al = result.arudhaPadas.find(p => p.label === 'AL');
  const ul = result.arudhaPadas.find(p => p.label === 'UL');
  const a10 = result.arudhaPadas.find(p => p.label === 'A10');
  const currentDasha = result.charaDasha.current;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRashiLabel = (rashiName: string) => {
    return isHi ? (RASHI_HINDI[rashiName] || rashiName) : rashiName;
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Active Chara Dasha Highlight */}
      {currentDasha && (
        <CarvedCard className="p-6 relative overflow-hidden bg-gradient-to-br from-amber-900/20 to-transparent border-amber-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Timer className="w-24 h-24 text-amber-500" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <Clock className="w-4 h-4" /> {isHi ? 'वर्तमान सक्रिय चर दशा' : 'Current Active Chara Dasha'}
              </div>
              <h3 className="text-4xl font-serif text-white">{getRashiLabel(currentDasha.sign)}</h3>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-[10px] text-amber-200/50 uppercase font-bold tracking-tighter">{isHi ? 'दशा अवधि' : 'Period Duration'}</p>
                <p className="text-xl font-bold text-amber-100">{currentDasha.duration} {isHi ? 'वर्ष' : 'Years'}</p>
              </div>
              <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs text-amber-200 font-medium">
                {formatDate(currentDasha.startDate)} — {formatDate(currentDasha.endDate)}
              </div>
            </div>
          </div>
        </CarvedCard>
      )}

      {/* Arudha Padas Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-200 uppercase tracking-wider">
            {isHi ? '12 आरूढ़ पद (A1 से A12 एवं UL)' : '12 Arudha Padas (A1 to A12 & UL)'}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {result.arudhaPadas.map((pada, idx) => (
            <CarvedCard key={`${pada.label}-${idx}`} className="p-4 group hover:border-amber-500/50 transition-colors duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-amber-400">{pada.label}</span>
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">H{pada.houseNumber} Lord</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-100/90">{getRashiLabel(pada.rashiName)}</p>
                <div className="flex items-center justify-between text-[10px] text-white/40">
                  <span>{isHi ? 'भाव स्थिति' : 'Falls in House'}</span>
                  <span className="text-amber-200 font-bold">{pada.padaNumber}</span>
                </div>
              </div>
              <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500/40 w-1/3 group-hover:w-full transition-all duration-700"></div>
              </div>
            </CarvedCard>
          ))}
        </div>
      </div>

      {/* Complete Chara Dasha Cycle */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-200 uppercase tracking-wider">
            {isHi ? 'जैमिनी चर दशा क्रम (12 राशियां)' : 'Jaimini Chara Dasha Cycle'}
          </h3>
        </div>
        
        <CarvedCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-amber-900/20 border-b border-white/5">
                  <th className="px-4 py-3 font-bold text-amber-200 uppercase text-[11px] tracking-widest">{isHi ? 'राशि' : 'Sign'}</th>
                  <th className="px-4 py-3 font-bold text-amber-200 uppercase text-[11px] tracking-widest">{isHi ? 'वर्ष' : 'Years'}</th>
                  <th className="px-4 py-3 font-bold text-amber-200 uppercase text-[11px] tracking-widest">{isHi ? 'प्रारंभ तिथि' : 'Start Date'}</th>
                  <th className="px-4 py-3 font-bold text-amber-200 uppercase text-[11px] tracking-widest">{isHi ? 'समाप्ति तिथि' : 'End Date'}</th>
                  <th className="px-4 py-3 font-bold text-amber-200 uppercase text-[11px] tracking-widest text-right">{isHi ? 'स्थिति' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {result.charaDasha.sequence.map((period, idx) => {
                  const isCurrent = currentDasha?.sign === period.sign;
                  const isPast = new Date() > period.endDate;
                  
                  return (
                    <tr key={`${period.sign}-${idx}`} className={`hover:bg-white/5 transition-colors ${isCurrent ? 'bg-amber-500/10' : ''}`}>
                      <td className="px-4 py-3 font-bold text-amber-100">{getRashiLabel(period.sign)}</td>
                      <td className="px-4 py-3 text-white/70">{period.duration}</td>
                      <td className="px-4 py-3 text-white/60 font-mono text-[11px]">{formatDate(period.startDate)}</td>
                      <td className="px-4 py-3 text-white/60 font-mono text-[11px]">{formatDate(period.endDate)}</td>
                      <td className="px-4 py-3 text-right">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">{isHi ? 'सक्रिय' : 'ACTIVE'}</span>
                        ) : isPast ? (
                          <span className="text-white/20 text-[10px] font-bold">{isHi ? 'बीता हुआ' : 'PAST'}</span>
                        ) : (
                          <span className="text-amber-200/30 text-[10px] font-bold">{isHi ? 'आगामी' : 'UPCOMING'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CarvedCard>
      </div>

      {/* Personalized Astrological Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CarvedCard className="p-4 bg-amber-900/10 border-amber-500/30">
          <div className="flex gap-3">
            <LayoutGrid className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-widest">
                {isHi ? 'आरूढ़ पद फलकथन (AL एवं UL विश्लेषण)' : 'Arudha Pada Insights'}
              </h4>
              <div className="text-xs text-amber-100/90 space-y-1.5 leading-relaxed">
                <p>• <strong className="text-amber-300">AL (आरूढ़ लग्न):</strong> राशि <strong className="text-white">{getRashiLabel(al?.rashiName || 'Gemini')}</strong> (भाव {al?.padaNumber || 3}) — समाज में आपकी वास्तविक प्रतिष्ठा, मान-सम्मान और जनमानस में आपकी छवि का मुख्य द्योतक।</p>
                <p>• <strong className="text-amber-300">UL (उपपद लग्न):</strong> राशि <strong className="text-white">{getRashiLabel(ul?.rashiName || 'Scorpio')}</strong> (भाव {ul?.padaNumber || 8}) — दांपत्य सुख, पारिवारिक सौहार्द, विवाह और जीवनसाथी के साथ संबंधों की स्थिरता का बोध कराता है।</p>
                <p>• <strong className="text-amber-300">A10 (कर्म आरूढ़):</strong> राशि <strong className="text-white">{getRashiLabel(a10?.rashiName || 'Pisces')}</strong> (भाव {a10?.padaNumber || 12}) — कार्यक्षेत्र, व्यवसाय और आजीविका में आपकी प्रोफेशनल पहचान व प्रतिष्ठा।</p>
              </div>
            </div>
          </div>
        </CarvedCard>

        <CarvedCard className="p-4 bg-amber-900/10 border-amber-500/30">
          <div className="flex gap-3">
            <Timer className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-widest">
                {isHi ? 'चर दशा सक्रिय फल एवं मार्गदर्शन' : 'Active Chara Dasha Guidance'}
              </h4>
              <div className="text-xs text-amber-100/90 space-y-2">
                <p>• <strong className="text-amber-300">{isHi ? 'सक्रिय राशि' : 'Active Sign'}:</strong> <strong className="text-white">{getRashiLabel(currentDasha?.sign || 'Scorpio')}</strong> ({isHi ? 'अवधि' : 'Duration'}: {currentDasha?.duration || 7} {isHi ? 'वर्ष' : 'Years'})</p>
                <p className="leading-relaxed">
                  {isHi 
                    ? 'इस चर दशा के प्रभाव से आपके पराक्रम, आत्मबल और व्यावसायिक योजनाओं में तीव्र गति आएगी। कारकेश ग्रहों के योग से वर्तमान समय में महत्वपूर्ण निर्णय और उन्नति के विशेष योग हैं।'
                    : 'The influence of this Chara dasha brings dynamic growth to your enterprise, courage, and professional pursuits.'
                  }
                </p>
              </div>
            </div>
          </div>
        </CarvedCard>
      </div>
    </div>
  );
};
