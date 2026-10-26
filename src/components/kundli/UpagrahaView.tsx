import React from 'react';
import { MasterKundliData } from '../../types/kundli';
import { UpagrahaEngine, UpagrahaInfo } from '../../services/astrology/upagrahaEngine';
import CarvedCard from '../ui/CarvedCard';

interface UpagrahaViewProps {
  data: MasterKundliData;
}

export const UpagrahaView: React.FC<UpagrahaViewProps> = ({ data }) => {
  const upagrahas = UpagrahaEngine.calculate(data);

  // Divide into groups for better display
  const sunBased = upagrahas.filter(u => u.type === 'Non-Luminous');
  const timeBased = upagrahas.filter(u => u.type === 'Time-Based');

  const formatDegree = (deg: number) => {
    if (isNaN(deg)) return "N/A";
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.floor(((deg - d) * 60 - m) * 60);
    return `${d}° ${m}' ${s}"`;
  };

  return (
    <div className="space-y-8 font-serif">
      {/* Main Upagraha Table */}
      <CarvedCard 
        header={
          <div className="flex flex-col">
            <h2 className="text-[#D4AF37] text-xl font-bold tracking-widest uppercase">Upagrahas & Non-Luminous Points</h2>
            <p className="text-[#A0A0A0] text-xs uppercase tracking-tighter">उपाग्रह एवं अप्रकाशित बिन्दु</p>
          </div>
        }
      >
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/30">
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold">Upagraha</th>
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold">Rashi</th>
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold text-right">Longitude</th>
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold text-center">House</th>
              </tr>
            </thead>
            <tbody>
              {[...timeBased, ...sunBased].map((u, idx) => (
                <tr 
                  key={u.name} 
                  className={`border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-colors ${u.name === 'Gulika' ? 'bg-[#D4AF37]/5' : ''}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-[#FFF] font-bold text-sm">{u.hindiName} ({u.name})</span>
                      <span className="text-[#888] text-[9px] uppercase tracking-tighter line-clamp-1">{u.description}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#E0E0E0] text-sm">{u.rashiName}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-[#D4AF37] font-mono text-xs">{formatDegree(u.degree)}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="w-7 h-7 rounded-full bg-[#000] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold mx-auto">
                      {isNaN(u.house) ? '?' : u.house}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CarvedCard>

      {/* Special Highlights for Gulika and Mandi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upagrahas.filter(u => u.name === 'Gulika' || u.name === 'Mandi').map(u => (
          <div key={u.name} className="bg-[#1A1A1A] border border-[#D4AF37]/40 rounded-xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#D4AF37]/10 rounded-full blur-xl group-hover:bg-[#D4AF37]/20 transition-all"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center">
                <span className="text-[#000] font-bold text-sm">{u.name[0]}</span>
              </div>
              <h4 className="text-[#D4AF37] font-bold uppercase tracking-widest">{u.hindiName} Analysis</h4>
            </div>
            <p className="text-[#E0E0E0] text-sm italic mb-4 leading-relaxed border-l-2 border-[#D4AF37]/40 pl-3">
              Placed in the {u.house}th House in {u.rashiName}. {u.description}
            </p>
            <div className="text-[10px] text-[#A0A0A0] uppercase tracking-wider font-bold">
              Karmic Influence: <span className="text-[#D4AF37]">Strong</span> • Status: <span className="text-[#FF4444]">Critical</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-[#666] text-[10px] italic uppercase tracking-widest mt-4">
        Calculated using Jagannatha Hora Non-Luminous Point Algorithms
      </div>
    </div>
  );
};
