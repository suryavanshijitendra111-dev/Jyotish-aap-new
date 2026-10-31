import React, { useState } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { AshtottariEngine, AshtottariDasha } from '../../services/astrology/ashtottariEngine';
import CarvedCard from '../ui/CarvedCard';
import { ChevronDown, ChevronRight, Calendar, Info } from 'lucide-react';
import { getLocalizedPlanet } from '../../i18n/astrology';

interface AshtottariDashaViewProps {
  data: MasterKundliData;
}

export const AshtottariDashaView: React.FC<AshtottariDashaViewProps> = ({ data }) => {
  const result = AshtottariEngine.calculate(data);
  const [expandedMD, setExpandedMD] = useState<string | null>(result.currentMD.planet);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPlanetColor = (planet: string) => {
    const colors: Record<string, string> = {
      'Sun': 'text-orange-500',
      'Moon': 'text-blue-300',
      'Mars': 'text-red-500',
      'Mercury': 'text-green-500',
      'Jupiter': 'text-yellow-500',
      'Venus': 'text-pink-400',
      'Saturn': 'text-purple-500',
      'Rahu': 'text-slate-500',
    };
    return colors[planet] || 'text-[#D4AF37]';
  };

  return (
    <div className="space-y-6">
      <CarvedCard 
        header={
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-[#D4AF37] text-xl font-bold tracking-widest uppercase">अष्टोत्तरी दशा (१०८ वर्षीय कालचक्र)</h2>
              <p className="text-[#D4AF37]/60 text-xs italic">Ashtottari Dasha: 108 Years Nakshatra System</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${result.isApplicable ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
              <Info className="w-3 h-3" />
              {result.isApplicable ? 'अत्यंत उपयुक्त' : 'संदर्भ हेतु'}
            </div>
          </div>
        }
      >
        <div className="space-y-6 py-4">
          {/* Applicability Note */}
          <div className="bg-black/40 border border-[#D4AF37]/10 p-3 rounded-lg flex items-start gap-3">
            <Info className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400 italic">
              <span className="text-[#D4AF37] font-bold not-italic">नोट:</span> {result.applicabilityReason}
            </p>
          </div>

          {/* Current Dasha Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 p-4 rounded-xl">
              <span className="text-[10px] uppercase tracking-tighter text-[#D4AF37]/60 font-bold">सक्रिय महादशा</span>
              <div className="flex items-end gap-2 mt-1">
                <span className={`text-2xl font-bold ${getPlanetColor(result.currentMD.planet)}`}>{getLocalizedPlanet(result.currentMD.planet, 'hi')}</span>
                <span className="text-sm text-gray-400 mb-1">({result.currentMD.hindiName})</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(result.currentMD.start)} — {formatDate(result.currentMD.end)}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 p-4 rounded-xl">
              <span className="text-[10px] uppercase tracking-tighter text-[#D4AF37]/60 font-bold">सक्रिय अंतर्दशा</span>
              <div className="flex items-end gap-2 mt-1">
                <span className={`text-2xl font-bold ${getPlanetColor(result.currentAD.planet)}`}>{getLocalizedPlanet(result.currentAD.planet, 'hi')}</span>
                <span className="text-sm text-gray-400 mb-1">({result.currentAD.hindiName})</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>तक {formatDate(result.currentAD.end)}</span>
              </div>
            </div>
          </div>

          {/* Full Dasha List */}
          <div className="space-y-2">
            <h3 className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest px-2">१०८-वर्षीय कालक्रम</h3>
            <div className="border border-[#D4AF37]/10 rounded-lg overflow-hidden bg-black/20">
              {result.dashas.map((md) => (
                <div key={md.planet} className="border-b border-[#D4AF37]/5 last:border-0">
                  <button 
                    onClick={() => setExpandedMD(expandedMD === md.planet ? null : md.planet)}
                    className={`w-full flex items-center justify-between p-3 transition-colors ${expandedMD === md.planet ? 'bg-[#D4AF37]/10' : 'hover:bg-[#D4AF37]/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      {expandedMD === md.planet ? <ChevronDown className="w-4 h-4 text-[#D4AF37]" /> : <ChevronRight className="w-4 h-4 text-[#D4AF37]/40" />}
                      <div className="flex flex-col items-start">
                        <span className={`font-bold ${getPlanetColor(md.planet)}`}>{getLocalizedPlanet(md.planet, 'hi')} ({md.hindiName})</span>
                        <span className="text-[10px] text-gray-500">{md.duration} वर्ष</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#D4AF37]/60 block font-mono uppercase">काल</span>
                      <span className="text-xs text-gray-400 font-mono">{formatDate(md.start)} - {formatDate(md.end)}</span>
                    </div>
                  </button>

                  {expandedMD === md.planet && (
                    <div className="bg-black/40 px-4 py-2 space-y-1">
                      {md.antardashas?.map((ad) => (
                        <div key={ad.planet} className="flex items-center justify-between py-2 border-b border-[#D4AF37]/5 last:border-0 text-[11px]">
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-1 rounded-full ${getPlanetColor(ad.planet).replace('text-', 'bg-')}`} />
                            <span className={getPlanetColor(ad.planet)}>{getLocalizedPlanet(ad.planet, 'hi')}</span>
                            <span className="text-gray-600">({ad.hindiName})</span>
                          </div>
                          <div className="flex gap-4 text-gray-400 font-mono">
                            <span>{ad.duration.toFixed(2)} वर्ष</span>
                            <span>{formatDate(ad.start)} - {formatDate(ad.end)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CarvedCard>
    </div>
  );
};
