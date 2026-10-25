import React, { useState } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { JaiminiKarakaEngine, JaiminiAnalysisResult } from '../../services/astrology/jaiminiKarakaEngine';

interface JaiminiViewProps {
  data: MasterKundliData;
}

export const JaiminiView: React.FC<JaiminiViewProps> = ({ data }) => {
  const [system, setSystem] = useState<7 | 8>(8);
  const result: JaiminiAnalysisResult = JaiminiKarakaEngine.calculate(data);
  const karakas = system === 7 ? result.charaKarakas7 : result.charaKarakas8;

  return (
    <div className="bg-[#1A1A1A] border-2 border-[#D4AF37] rounded-xl overflow-hidden shadow-2xl mb-8 font-serif">
      {/* Royal Header */}
      <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1A1A1A] p-4 border-b border-[#D4AF37] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <span className="text-[#1A1A1A] font-bold text-xl">J</span>
          </div>
          <div>
            <h2 className="text-[#D4AF37] text-xl font-bold tracking-widest uppercase">Jaimini Karakas</h2>
            <p className="text-[#A0A0A0] text-xs uppercase tracking-tighter">Chara Karakas & Karakamsha</p>
          </div>
        </div>
        <div className="flex bg-[#000] border border-[#D4AF37]/30 rounded-lg p-1">
          <button 
            onClick={() => setSystem(7)}
            className={`px-3 py-1 rounded text-xs transition-all ${system === 7 ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
          >
            7 Karakas
          </button>
          <button 
            onClick={() => setSystem(8)}
            className={`px-3 py-1 rounded text-xs transition-all ${system === 8 ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
          >
            8 Karakas
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Karakamsha Highlight */}
        <div className="mb-8 bg-[#000]/40 border border-[#D4AF37]/20 rounded-lg p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
             <div className="w-20 h-20 border-4 border-[#D4AF37] rotate-45"></div>
          </div>
          <h3 className="text-[#D4AF37] font-bold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
            Karakamsha Lagna: {result.karakamshaLagna.rashiName}
          </h3>
          <div className="space-y-2">
            {result.karakamshaResults.map((line, idx) => (
              <p key={idx} className="text-[#E0E0E0] text-sm leading-relaxed italic border-l-2 border-[#D4AF37]/30 pl-3">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Chara Karakas Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/30">
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold">Karaka</th>
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold">Planet</th>
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold">Sign</th>
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold text-right">Degree</th>
              </tr>
            </thead>
            <tbody>
              {karakas.map((k, idx) => (
                <tr 
                  key={k.type} 
                  className={`border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-colors ${idx === 0 ? 'bg-[#D4AF37]/5' : ''}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-[#D4AF37] font-bold text-sm">{k.type}</span>
                      <span className="text-[#888] text-[10px] uppercase">{k.fullName.split(' (')[1]?.replace(')', '') || k.fullName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#FFF] font-medium">{k.planet}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#E0E0E0] text-sm">{k.signName}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-[#D4AF37] font-mono text-xs">{k.degree.toFixed(4)}°</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center text-[#666] text-[10px] italic uppercase tracking-widest">
          Calculated using {system} Chara Karaka System • Jagannatha Hora Standards
        </div>
      </div>
    </div>
  );
};
