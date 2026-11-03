/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { SarvatobhadraEngine, SBCResult, GridCell } from '../../services/astrology/sarvatobhadraEngine';
import CarvedCard from '../ui/CarvedCard';
import { useTranslation } from '../../i18n';
import { Sparkles, Shield, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface SarvatobhadraViewProps {
  data: MasterKundliData;
}

const toHindiNakshatra = (val: any) => {
  const str = String(val || '').trim();
  const map: Record<string, string> = {
    'U.Ash': 'उत्तराषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा',
    'Krittika': 'कृत्तिका',
    'Ashlesha': 'आश्लेषा',
    'P.Phal': 'पूर्वाफाल्गुनी', 'Purva Phalguni': 'पूर्वाफाल्गुनी',
    'Vishak': 'विशाखा', 'Vishakha': 'विशाखा',
    'Jyesh': 'ज्येष्ठा', 'Jyeshtha': 'ज्येष्ठा',
    'Mula': 'मूल',
    'P.Ash': 'पूर्वाषाढ़ा', 'Purva Ashadha': 'पूर्वाषाढ़ा'
  };
  return map[str] || str;
};

const toHindiPlanet = (val: any) => {
  const str = String(val || '').trim();
  const map: Record<string, string> = {
    'Moon': 'चंद्र', 'Saturn': 'शनि', 'Mercury': 'बुध',
    'Venus': 'शुक्र', 'Rahu': 'राहु', 'Sun': 'सूर्य',
    'Mars': 'मंगल', 'Jupiter': 'गुरु', 'Ketu': 'केतु'
  };
  return map[str] || str;
};

export const SarvatobhadraView: React.FC<SarvatobhadraViewProps> = ({ data }) => {
  const { t, language } = useTranslation();
  const isHindi = language === 'hi';

  const result = useMemo(() => {
    try {
      return SarvatobhadraEngine.calculate(data || { planets: {} } as MasterKundliData);
    } catch {
      return { grid: [], specialNakshatraVedhas: [] };
    }
  }, [data]);

  const getSpecialNameKey = (name: string) => {
    const map: Record<string, string> = {
      'Janma (Birth)': 'janma',
      'Karma (Action)': 'karma',
      'Sanghatika': 'samghatika',
      'Samudayika': 'samudayika',
      'Naidhana': 'naidhana',
      'Desha': 'desha',
      'Jati': 'jati',
      'Abhisheka': 'abhisheka'
    };
    return map[name] ? t(`sarvatobhadra.${map[name]}`) : name;
  };

  const getLocalizedGridContent = (content: string) => {
    const converted = toHindiNakshatra(content);
    if (isHindi && converted !== content) {
      return converted;
    }
    const map: Record<string, { hi: string, en: string }> = {
      'Rohini': { hi: 'रोहिणी', en: 'Rohini' },
      'Mriga': { hi: 'मृगशिरा', en: 'Mrigashira' },
      'Ardra': { hi: 'आर्द्रा', en: 'Ardra' },
      'Punar': { hi: 'पुनर्वसु', en: 'Punarvasu' },
      'Pushya': { hi: 'पुष्य', en: 'Pushya' },
      'Magha': { hi: 'मघा', en: 'Magha' },
      'U.Phal': { hi: 'उत्तराफाल्गुनी', en: 'Uttara Phalguni' },
      'Hasta': { hi: 'हस्त', en: 'Hasta' },
      'Chitra': { hi: 'चित्रा', en: 'Chitra' },
      'Swati': { hi: 'स्वाती', en: 'Swati' },
      'Anura': { hi: 'अनुराधा', en: 'Anuradha' },
      'Shravan': { hi: 'श्रवण', en: 'Shravana' },
      'Abhijit': { hi: 'अभिजित', en: 'Abhijit' },
      'Dhanis': { hi: 'धनिष्ठा', en: 'Dhanishta' },
      'Shata': { hi: 'शतभिषा', en: 'Shatabhisha' },
      'P.Bhad': { hi: 'पूर्वभाद्रपद', en: 'Purva Bhadrapada' },
      'U.Bhad': { hi: 'उत्तरभाद्रपद', en: 'Uttara Bhadrapada' },
      'Revati': { hi: 'रेवती', en: 'Revati' },
      'Ashwini': { hi: 'अश्विनी', en: 'Ashwini' },
      'Bharani': { hi: 'भरणी', en: 'Bharani' },
      'Ari': { hi: 'मेष', en: 'Aries' },
      'Tau': { hi: 'वृषभ', en: 'Taurus' },
      'Gem': { hi: 'मिथुन', en: 'Gemini' },
      'Can': { hi: 'कर्क', en: 'Cancer' },
      'Leo': { hi: 'सिंह', en: 'Leo' },
      'Vir': { hi: 'कन्या', en: 'Virgo' },
      'Lib': { hi: 'तुला', en: 'Libra' },
      'Sco': { hi: 'वृश्चिक', en: 'Scorpio' },
      'Sag': { hi: 'धनु', en: 'Sagittarius' },
      'Cap': { hi: 'मकर', en: 'Capricorn' },
      'Aqu': { hi: 'कुंभ', en: 'Aquarius' },
      'Pis': { hi: 'मीन', en: 'Pisces' },
      'Nanda': { hi: 'नंदा', en: 'Nanda' },
      'Bhadra': { hi: 'भद्रा', en: 'Bhadra' },
      'Jaya': { hi: 'जया', en: 'Jaya' },
      'Rikta': { hi: 'रिक्ता', en: 'Rikta' },
      'Soul': { hi: 'आत्मा', en: 'Soul' }
    };
    return map[content]?.[isHindi ? 'hi' : 'en'] || converted;
  };

  const getCellStyles = (cell: GridCell) => {
    const hasVedha = (cell?.vedhas || []).length > 0;
    const isMalefic = (cell?.vedhas || []).some(v => v.type === 'Malefic');
    const isBenefic = (cell?.vedhas || []).some(v => v.type === 'Benefic');

    let base = "relative flex items-center justify-center text-[8px] sm:text-[10px] font-medium border border-white/5 transition-all duration-300 ";
    
    if (cell?.type === 'Nakshatra') base += "bg-white/5 text-white/70 ";
    else if (cell?.type === 'Rashi') base += "bg-yellow-500/5 text-yellow-500/60 ";
    else if (cell?.type === 'Swara' || cell?.type === 'Varna') base += "bg-blue-500/5 text-blue-500/60 ";
    else if (cell?.type === 'Center') base += "bg-yellow-500/10 text-yellow-500 font-bold ";
    else base += "bg-transparent text-white/30 ";

    if (hasVedha) {
      if (isMalefic && isBenefic) base += "ring-1 ring-inset ring-orange-500/40 bg-orange-500/10 ";
      else if (isMalefic) base += "ring-1 ring-inset ring-red-500/40 bg-red-500/10 ";
      else if (isBenefic) base += "ring-1 ring-inset ring-green-500/40 bg-green-500/10 ";
    }

    return base;
  };

  const gridCells = (result?.grid || []).flat();
  const specialVedhas = result?.specialNakshatraVedhas || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-serif text-yellow-500 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          {t('sarvatobhadra.title') || 'सर्वतोभद्र चक्र'}
        </h2>
        <p className="text-white/60 text-sm font-sans">
          {t('sarvatobhadra.desc') || 'The 81-grid All-Auspicious Wheel used to analyze planetary transits and their subtle impacts (Vedha).'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. The 9x9 Grid Chart */}
        <div className="lg:col-span-2">
          <CarvedCard cornerSize={32} className="p-4 bg-[#082218]/40 border-yellow-500/20 aspect-square">
            <div className="grid grid-cols-9 h-full gap-1">
              {gridCells.map((cell, idx) => (
                <div 
                  key={`cell-${cell?.row || 0}-${cell?.col || 0}-${idx}`} 
                  className={getCellStyles(cell)}
                  title={`${getLocalizedGridContent(cell?.content || '')} - Vedhas: ${(cell?.vedhas || []).length}`}
                >
                  <span className="truncate px-0.5">{getLocalizedGridContent(cell?.content || '')}</span>
                  {(cell?.vedhas || []).length > 0 && (
                    <div className={`absolute top-0 right-0 w-1 h-1 rounded-full ${
                      (cell?.vedhas || []).some(v => v.type === 'Malefic') ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CarvedCard>
        </div>

        {/* 2. Special Nakshatra Analysis & Summary */}
        <div className="space-y-4">
          <CarvedCard cornerSize={24} className="p-4 bg-white/5 border-white/10">
            <h3 className="text-lg font-serif text-yellow-500 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
              <Shield className="w-5 h-5" />
              {t('sarvatobhadra.special_vedha') || 'Special Vedha Analysis'}
            </h3>
            <div className="space-y-3">
              {specialVedhas.map((sn, idx) => (
                <div key={`sn-${idx}`} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-tighter">{getSpecialNameKey(sn?.name || '')}</div>
                    <div className="text-sm text-white font-medium">{toHindiNakshatra(sn?.nakshatra)}</div>
                  </div>
                  <div className="flex gap-1">
                    {(!sn?.impacts || sn.impacts.length === 0) ? (
                      <div className="flex items-center gap-1 text-[10px] text-green-500/60 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {t('sarvatobhadra.clear') || 'Clear'}
                      </div>
                    ) : (
                      (sn?.impacts || []).slice(0, 2).map((imp, i) => (
                        <div key={`imp-${i}`} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                          imp?.type === 'Malefic' 
                          ? 'text-red-400 bg-red-400/10 border-red-400/20' 
                          : 'text-green-400 bg-green-400/10 border-green-400/20'
                        }`}>
                          {toHindiPlanet(imp?.planet)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CarvedCard>

          <CarvedCard cornerSize={24} className="p-4 bg-yellow-500/5 border-yellow-500/20">
            <h3 className="text-lg font-serif text-yellow-500 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t('sarvatobhadra.active_vedha') || 'Active Vedha Summary'}
            </h3>
            <div className="text-xs text-white/70 space-y-2">
              <p className="leading-relaxed">
                {t('sarvatobhadra.malefic_vedha') || 'Malefic Vedha: Planets like Sun, Mars, Saturn cause obstacles when hitting birth points.'}
              </p>
              <p className="leading-relaxed">
                {t('sarvatobhadra.benefic_vedha') || 'Benefic Vedha: Jupiter, Venus, Moon bring prosperity and smooth progress.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
              <Info className="w-4 h-4 text-yellow-500/40" />
              <span className="text-[10px] text-white/40 italic">{t('sarvatobhadra.diagonal_note') || 'Diagonal Vedha counts as stronger.'}</span>
            </div>
          </CarvedCard>
        </div>
      </div>
    </div>
  );
};
