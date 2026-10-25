import React, { useState } from 'react';
import { Search, Phone, Home, Eye } from 'lucide-react';
import { DigitalNumerologyEngine, angelNumbers, esotericCodes, switchNumbers, yantraNumbers } from '../../services/numerology/digitalNumerologyEngine';
import { useLanguage } from '../../i18n';

interface Props {
  profile: any;
  numData: any;
  showToast: (msg: string) => void;
}

export default function DigitalSignsTab({ profile, numData, showToast }: Props) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileResult, setMobileResult] = useState<any>(null);
  
  const [objectNumber, setObjectNumber] = useState('');
  const [objectType, setObjectType] = useState<'HOUSE'|'VEHICLE'>('HOUSE');
  const [objectResult, setObjectResult] = useState<any>(null);

  const [intentionFilter, setIntentionFilter] = useState<string | null>(null);

  const handleMobileCheck = () => {
    if (mobileNumber.length < 5) {
      showToast(t('numerology.pleaseEnterValidNumber') || "Please enter a valid number");
      return;
    }
    const res = DigitalNumerologyEngine.analyzeMobile(mobileNumber, numData.birthNumber, numData.destinyNumber);
    setMobileResult(res);
  };

  const handleObjectCheck = () => {
    if (!objectNumber) {
      showToast(t('numerology.pleaseEnterIdentifier') || "Please enter a number/identifier");
      return;
    }
    const res = DigitalNumerologyEngine.analyzeObjectNumber(objectNumber, numData.birthNumber, numData.destinyNumber);
    setObjectResult(res);
  };

  const allEntries = [
    ...angelNumbers.map(n => ({ ...n, type: 'Angel Number' })),
    ...esotericCodes.map(n => ({ ...n, type: 'Grabovoi Code' })),
    ...switchNumbers.map(n => ({ ...n, type: 'Switch Number' })),
    ...yantraNumbers.map(n => ({ ...n, type: 'Yantra Grid' }))
  ];

  const filteredEntries = allEntries.filter(entry => {
    if (intentionFilter && (entry as any).category !== intentionFilter && (entry as any).type !== intentionFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (entry as any).number?.toLowerCase().includes(q) ||
      (entry as any).title?.toLowerCase().includes(q) ||
      (entry as any).category?.toLowerCase().includes(q) ||
      (entry as any).name?.toLowerCase().includes(q)
    );
  });

  const getCompColor = (status: string) => {
    if (status === 'compatible') return 'text-emerald-400';
    if (status === 'challenging') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getCompLabel = (status: string) => {
    if (status === 'compatible') return t('numerology.compatible') || 'compatible';
    if (status === 'challenging') return t('numerology.challenging') || 'challenging';
    return t('numerology.neutral') || status;
  };

  const intentionCategories = [
    { id: 'Finance', label: t('numerology.catFinance') || 'Finance' },
    { id: 'Peace', label: t('numerology.catPeace') || 'Peace' },
    { id: 'Spirituality', label: t('numerology.catSpirituality') || 'Spirituality' },
    { id: 'Guidance', label: t('numerology.catGuidance') || 'Guidance' },
    { id: 'Health', label: t('numerology.catHealth') || 'Health' }
  ];

  return (
    <div className="space-y-6 pb-8">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/60" />
        <input 
          type="text"
          placeholder={t('numerology.searchNumberPlaceholder') || t('numerology.searchPlaceholder') || "Search number, code, pair or category..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
        />
      </div>

      {/* Intention Filter */}
      {!searchQuery && (
        <div className="flex overflow-x-auto gap-2 hide-scrollbar pb-2">
          {intentionCategories.map(cat => (
             <button 
               key={cat.id}
               onClick={() => setIntentionFilter(intentionFilter === cat.id ? null : cat.id)}
               className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border ${intentionFilter === cat.id ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-black/40 text-gray-400 border-gray-700'}`}
             >
               {cat.label}
             </button>
          ))}
        </div>
      )}

      {/* Mobile Numerology */}
      {!searchQuery && !intentionFilter && (
        <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
           <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-4 flex items-center gap-2 relative z-10">
             <Phone className="w-4 h-4" /> {t('numerology.mobileNumerology') || 'Mobile Numerology'}
           </h2>
           <div className="flex gap-2 mb-4 relative z-10">
              <input 
                type="text"
                placeholder={t('numerology.enterMobileNumber') || 'Enter Mobile Number'}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={15}
                className="flex-1 bg-black/40 border border-[#d4af37]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
              <button 
                onClick={handleMobileCheck}
                className="bg-[#d4af37] text-[#030a08] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4af37]/90 transition-colors cursor-pointer"
              >
                {t('numerology.analyzeBtn') || 'Analyze'}
              </button>
           </div>
           
           {mobileResult && (
             <div className="space-y-4 relative z-10 animate-in fade-in">
               <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-gray-700">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{t('numerology.analyzedNumber') || 'Analyzed Number'}</div>
                    <div className="text-white font-mono">{mobileResult.maskedNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{t('numerology.root') || 'Root'}</div>
                    <div className="text-[#d4af37] text-xl font-bold">{mobileResult.rootNumber} <span className="text-[10px] text-gray-600 font-normal">({mobileResult.compoundNumber})</span></div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <div className="bg-black/40 p-3 rounded-xl border border-gray-700">
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('numerology.driver') || 'Driver'} ({numData.birthNumber})</div>
                   <div className={`text-sm font-semibold capitalize ${getCompColor(mobileResult.driverCompatibility.status)}`}>
                     {getCompLabel(mobileResult.driverCompatibility.status)}
                   </div>
                 </div>
                 <div className="bg-black/40 p-3 rounded-xl border border-gray-700">
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('numerology.conductor') || 'Conductor'} ({numData.destinyNumber})</div>
                   <div className={`text-sm font-semibold capitalize ${getCompColor(mobileResult.conductorCompatibility.status)}`}>
                     {getCompLabel(mobileResult.conductorCompatibility.status)}
                   </div>
                 </div>
               </div>

               {mobileResult.pairs.length > 0 && (
                 <div>
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-800 pb-1">{t('numerology.significantPairsFound') || 'Significant Pairs Found'}</div>
                   <div className="space-y-2">
                     {mobileResult.pairs.map((p: any, idx: number) => (
                       <div key={idx} className="bg-[#082218] p-2 rounded-lg border border-[#d4af37]/20 flex gap-3">
                         <div className="bg-black/40 w-8 h-8 rounded flex items-center justify-center text-[#d4af37] font-bold shrink-0">{p.pair}</div>
                         <div>
                           <div className="text-[10px] font-semibold text-[#d4af37] uppercase tracking-wider">{p.classification}</div>
                           <div className="text-[10px] text-gray-300 leading-tight">{p.interpretation}</div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               <button onClick={() => showToast(mobileResult.breakdown)} className="flex items-center gap-1 text-[10px] text-[#d4af37]/80 underline cursor-pointer">
                 <Eye className="w-3 h-3" /> {t('numerology.whyCalculationDetails') || t('numerology.why') || 'Why? (Calculation Details)'}
               </button>
             </div>
           )}
        </div>
      )}

      {/* House & Vehicle */}
      {!searchQuery && !intentionFilter && (
        <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
           <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-4 flex items-center gap-2 relative z-10">
             <Home className="w-4 h-4" /> {t('numerology.houseAndVehicle') || 'House & Vehicle'}
           </h2>
           <div className="flex mb-4 bg-black/40 p-1 rounded-xl border border-gray-700 relative z-10">
             <button 
               onClick={() => setObjectType('HOUSE')}
               className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${objectType === 'HOUSE' ? 'bg-[#d4af37] text-black' : 'text-gray-400'}`}
             >
               {t('numerology.house') || 'House'}
             </button>
             <button 
               onClick={() => setObjectType('VEHICLE')}
               className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${objectType === 'VEHICLE' ? 'bg-[#d4af37] text-black' : 'text-gray-400'}`}
             >
               {t('numerology.vehicle') || 'Vehicle'}
             </button>
           </div>
           
           <div className="flex gap-2 mb-4 relative z-10">
              <input 
                type="text"
                placeholder={objectType === 'HOUSE' ? (t('numerology.enterHouseNo') || 'Enter House/Flat No.') : (t('numerology.enterVehicleNo') || 'Enter Vehicle No.')}
                value={objectNumber}
                onChange={(e) => setObjectNumber(e.target.value.toUpperCase())}
                className="flex-1 bg-black/40 border border-[#d4af37]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
              <button 
                onClick={handleObjectCheck}
                className="bg-[#d4af37] text-[#030a08] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4af37]/90 transition-colors cursor-pointer"
              >
                {t('numerology.analyzeBtn') || 'Analyze'}
              </button>
           </div>

           {objectResult && (
             <div className="space-y-4 animate-in fade-in relative z-10">
               <div className="bg-[#082218] p-4 rounded-xl border border-[#d4af37]/40 flex items-center justify-between">
                 <div>
                   <div className="text-[10px] text-[#d4af37] uppercase tracking-widest mb-1">
                     {objectType === 'HOUSE' ? (t('numerology.houseRoot') || 'HOUSE ROOT') : (t('numerology.vehicleRoot') || 'VEHICLE ROOT')}
                   </div>
                   <div className="text-2xl font-bold text-white">{objectResult.rootNumber}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t('numerology.driverMatch') || 'Driver Match'}</div>
                    <div className={`text-xs font-semibold capitalize ${getCompColor(objectResult.driverCompatibility.status)}`}>
                      {getCompLabel(objectResult.driverCompatibility.status)}
                    </div>
                 </div>
               </div>
               <button onClick={() => showToast(objectResult.breakdown)} className="flex items-center gap-1 text-[10px] text-[#d4af37]/80 underline cursor-pointer">
                 <Eye className="w-3 h-3" /> {t('numerology.why') || 'Why?'}
               </button>
             </div>
           )}
        </div>
      )}

      {/* Directory Results */}
      {(searchQuery || intentionFilter) && (
        <div className="space-y-4 animate-in fade-in">
          {filteredEntries.map((entry: any, idx: number) => (
            <div key={idx} className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[#d4af37] font-bold text-xl">{entry.number || entry.code || entry.numbers}</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">{entry.type} • {entry.category || entry.association}</div>
                </div>
              </div>
              <p className="text-sm text-gray-200 mb-2 leading-relaxed">{entry.title || entry.name || entry.meaning}</p>
              {entry.instructions || entry.practice ? (
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800 text-[10px] text-gray-400 mt-3 leading-relaxed">
                  <strong className="text-[#d4af37]">{t('numerology.practice') || 'Practice'}:</strong> {entry.practice} {entry.instructions}
                </div>
              ) : null}
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <div className="text-center p-8 text-gray-500 text-sm">
              {t('numerology.noEntriesFound') || 'No entries found for your search.'}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-black/40 p-4 rounded-xl border border-gray-800 text-center mb-8">
        <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-relaxed">
          {t('numerology.digitalDisclaimer') || 'Traditional & Esoteric numerology is a spiritual/reflective practice. It does not scientifically guarantee financial, medical, or life outcomes.'}
        </p>
      </div>

    </div>
  );
}
