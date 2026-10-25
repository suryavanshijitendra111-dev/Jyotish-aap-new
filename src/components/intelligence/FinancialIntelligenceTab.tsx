import React, { useMemo } from 'react';
import { BirthProfile } from '../../types/kundli';
import { IntelligenceEngine, FinancialResult } from '../../services/intelligence/intelligenceEngine';
import { Brain, DollarSign } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface Props {
  profile: BirthProfile;
  showToast: (msg: string) => void;
  handleAskQuestion: (q: string) => void;
}

export default function FinancialIntelligenceTab({ profile, showToast, handleAskQuestion }: Props) {
  const { t } = useTranslation();
  const data: FinancialResult = useMemo(() => {
    return IntelligenceEngine.getFinancialIntelligence(profile);
  }, [profile]);

  const SectionCard = ({ title, items, icon }: { title: string, items: string[], icon: string }) => (
    <div className="bg-black/40 p-4 rounded-xl border border-gray-800 hover:border-[#d4af37]/30 transition-colors">
      <div className="text-[10px] text-[#d4af37] uppercase tracking-widest mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-gray-300 leading-relaxed flex gap-2">
             <span className="text-[#d4af37] mt-1">•</span>
             <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      
      <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
        
        <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-6 flex items-center gap-2 relative z-10">
          <DollarSign className="w-4 h-4" /> {t('kundli.financialReport') || 'वित्तीय बुद्धिमत्ता (Financial Intelligence)'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
           <SectionCard title={t('financial.wealthPotential') || "धन संकेत (Wealth Potential)"} items={data.wealthIndicators} icon="💎" />
           <SectionCard title={t('financial.incomeStreams') || "आय संकेत (Income Streams)"} items={data.incomeIndicators} icon="📈" />
           <SectionCard title={t('financial.careerIncome') || "करियर से आय (Career Income)"} items={data.careerIncomeIndicators} icon="👔" />
           <SectionCard title={t('financial.businessProspects') || "व्यवसाय संकेत (Business Prospects)"} items={data.businessIndicators} icon="🏢" />
           <SectionCard title={t('financial.expensesPressure') || "खर्च/वित्तीय दबाव (Expenses/Pressure)"} items={data.expensesIndicators} icon="📉" />
           
           <div className="bg-black/40 p-4 rounded-xl border border-gray-800 flex flex-col justify-center">
             <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('financial.timingContext') || 'Timing Context'}</div>
             <div className="text-sm text-[#d4af37] font-bold">{data.timing}</div>
           </div>
        </div>

        <button 
           onClick={() => handleAskQuestion("Can you give me a detailed breakdown of my financial prospects based on these traditional numerology and astrology indicators?")}
           className="w-full mt-6 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 relative z-10"
        >
           <Brain className="w-4 h-4"/> {t('financial.askAiStrategy') || 'Ask AI for Financial Strategy interpretation'}
        </button>

        <div className="mt-6 bg-black/60 p-4 rounded-xl border border-gray-800 text-center relative z-10">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-relaxed">
            {data.explanation}<br/>
            {t('financial.disclaimer') || 'This is NOT an investment recommendation system. It does not promise wealth, guaranteed profit, or debt removal.'}
          </p>
        </div>
      </div>
    </div>
  );
}
