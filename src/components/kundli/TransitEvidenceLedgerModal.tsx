import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Calendar,
  Compass,
  Search,
  Copy,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { TransitEvidenceLedger, TransitEvidenceRecord } from '../../types/jyotish/transitEvidence';
import { FutureTransitCorroboration } from '../../types/jyotish/kpTiming';
import { LanguageCode } from '../../i18n';

interface TransitEvidenceLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledger?: TransitEvidenceLedger;
  futureTransit?: FutureTransitCorroboration;
  mahadashaLord: string;
  antardashaLord: string;
  windowStart: string;
  windowEnd: string;
  language: LanguageCode;
}

export const TransitEvidenceLedgerModal: React.FC<TransitEvidenceLedgerModalProps> = ({
  isOpen,
  onClose,
  ledger,
  futureTransit,
  mahadashaLord,
  antardashaLord,
  windowStart,
  windowEnd,
  language
}) => {
  const isHindi = language === 'hi';
  const [activeTab, setActiveTab] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [selectedRecord, setSelectedRecord] = useState<TransitEvidenceRecord | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const verifiedList = ledger?.verifiedEvidence || [];
  const rejectedList = ledger?.rejectedEvidence || [];

  const currentList = activeTab === 'VERIFIED' ? verifiedList : rejectedList;

  const filteredList = currentList.filter(rec => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      rec.transitPlanet.toLowerCase().includes(term) ||
      rec.sign.toLowerCase().includes(term) ||
      rec.nakshatraName.toLowerCase().includes(term) ||
      rec.evidenceFingerprint.toLowerCase().includes(term) ||
      rec.evaluationTimestamp.toLowerCase().includes(term)
    );
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatDegMinSec = (degFloat: number) => {
    const d = Math.floor(degFloat);
    const m = Math.floor((degFloat - d) * 60);
    const s = Math.round(((degFloat - d) * 60 - m) * 60);
    return `${d}° ${m}' ${s}"`;
  };

  const formatDateDisplay = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoStr.slice(0, 10);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#07160e] border-2 border-[#d4af37]/60 rounded-2xl shadow-2xl overflow-hidden text-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#d4af37]/30 bg-gradient-to-r from-[#0a2417] via-black to-[#061910]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {isHindi ? '🔍 स्थायी गोचर प्रमाण बही (Transit Evidence Ledger)' : '🔍 Permanent Transit Evidence Ledger'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600/50 font-mono font-bold">
                  IMMUTABLE
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {isHindi
                  ? 'स्विस एफिमेरिस द्वारा गणना किए गए प्रत्येक गोचर बिंदु का अखंड प्रमाण व नियम-वंशावली'
                  : 'Deterministic cryptographic proof and rule lineage calculated via Swiss Ephemeris'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Window & Ledger Fingerprint Banner */}
        <div className="p-4 bg-black/60 border-b border-gray-800/80 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#0a2015] border border-emerald-900/60">
              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">
                {isHindi ? 'समय-खिड़की:' : 'Timing Window:'}
              </span>
              <span className="text-white font-bold text-sm">
                {mahadashaLord} → {antardashaLord}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0a2015] border border-emerald-900/60">
              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">
                {isHindi ? 'भविष्य गोचर स्थिति:' : 'Future Transit:'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-300 font-bold text-xs">
                  {futureTransit?.isCorroborated
                    ? (isHindi ? '🟢 सत्यापित (CORROBORATED)' : '🟢 SCANNED_CORROBORATED')
                    : (isHindi ? '🔴 अपुष्ट' : '🔴 NO_CORROBORATION')}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0a2015] border border-emerald-900/60">
              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">
                {isHindi ? 'स्कैन अवधि (Scan Window):' : 'Scan Window:'}
              </span>
              <span className="text-gray-300 font-mono text-xs">
                {formatDateDisplay(windowStart)} → {formatDateDisplay(windowEnd)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0a2015] border border-emerald-900/60">
              <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">
                {isHindi ? 'प्रमाणित घटनाएँ:' : 'Verified Events:'}
              </span>
              <span className="text-[#d4af37] font-bold font-mono text-sm">
                {verifiedList.length} {isHindi ? 'प्रमाण' : 'events'}
              </span>
            </div>
          </div>

          {/* Ledger SHA-256 Fingerprint */}
          {ledger?.ledgerFingerprint && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#06120b] border border-[#d4af37]/30 text-xs font-mono">
              <div className="flex items-center gap-2 overflow-hidden">
                <Fingerprint className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="text-gray-400 text-[10px] shrink-0 font-sans">
                  {isHindi ? 'बही SHA-256 डिजिटल हस्ताक्षर:' : 'Ledger SHA-256 Fingerprint:'}
                </span>
                <span className="text-emerald-300 font-bold text-[11px] truncate">
                  {ledger.ledgerFingerprint}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(ledger.ledgerFingerprint, 'ledger')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] text-[10px] font-sans font-bold cursor-pointer transition-colors shrink-0"
              >
                {copiedHash === 'ledger' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash === 'ledger' ? (isHindi ? 'कॉपी हुआ' : 'Copied') : (isHindi ? 'हस्ताक्षर कॉपी करें' : 'Copy Hash')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Controls & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-5 border-b border-gray-800 bg-black/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('VERIFIED'); setSelectedRecord(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'VERIFIED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/60 shadow'
                  : 'bg-black/40 text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHindi ? `🟢 प्रमाणित साक्ष्य (${verifiedList.length})` : `Verified Evidence (${verifiedList.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('REJECTED'); setSelectedRecord(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'REJECTED'
                  ? 'bg-red-950/80 text-red-300 border border-red-600/60 shadow'
                  : 'bg-black/40 text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{isHindi ? `🔴 अस्वीकृत साक्ष्य (${rejectedList.length})` : `Rejected Candidates (${rejectedList.length})`}</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isHindi ? 'ग्रह, राशि, नक्षत्र खोजें...' : 'Search planet, sign, nakshatra...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/60 border border-gray-800 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Content Body: Table + Lineage Inspector Drawer */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Detailed Evidence Table */}
          <div className="overflow-x-auto border border-gray-800 rounded-xl bg-black/50">
            <table className="w-full text-left text-[11px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-[10px] bg-white/[0.02]">
                  <th className="py-2 px-3">{isHindi ? 'ग्रह' : 'Planet'}</th>
                  <th className="py-2 px-3">{isHindi ? 'सटीक समय' : 'Refined Timestamp'}</th>
                  <th className="py-2 px-3">{isHindi ? 'रेखांश (Longitude)' : 'Exact Longitude'}</th>
                  <th className="py-2 px-3">{isHindi ? 'राशि' : 'Sign'}</th>
                  <th className="py-2 px-3">{isHindi ? 'नक्षत्र (पाद)' : 'Nakshatra (Pada)'}</th>
                  <th className="py-2 px-3">{isHindi ? 'नक्षत्र-नाथ' : 'Star Lord'}</th>
                  <th className="py-2 px-3 text-center">{isHindi ? 'गोचर भाव' : 'House'}</th>
                  <th className="py-2 px-3">{isHindi ? 'सक्रिय भाव' : 'Target Match'}</th>
                  <th className="py-2 px-3">{isHindi ? 'प्रतिकूल भाव / कारण' : 'Adverse / Reason'}</th>
                  <th className="py-2 px-3">{isHindi ? 'परिशुद्धता' : 'Precision'}</th>
                  <th className="py-2 px-3">{isHindi ? 'परिणाम' : 'Result'}</th>
                  <th className="py-2 px-3 text-center">{isHindi ? 'वंशावली' : 'Lineage'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900 font-mono">
                {filteredList.map((rec, i) => {
                  const isSelected = selectedRecord?.evidenceId === rec.evidenceId;
                  return (
                    <tr
                      key={rec.evidenceId || i}
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-950/40' : ''}`}
                      onClick={() => setSelectedRecord(rec)}
                    >
                      <td className="py-2 px-3 font-bold text-gray-200">
                        {isHindi ? rec.hindiName : rec.transitPlanet}
                      </td>
                      <td className="py-2 px-3 text-emerald-400 font-bold text-[10px]">
                        {(rec.boundaryTimestamp || rec.evaluationTimestamp).replace('T', ' ').slice(0, 16)}
                      </td>
                      <td className="py-2 px-3 text-[#d4af37]">
                        {formatDegMinSec(rec.exactLongitude)}
                      </td>
                      <td className="py-2 px-3 text-gray-300">
                        {isHindi ? rec.hindiSign : rec.sign} {rec.degreeInSign.toFixed(2)}°
                      </td>
                      <td className="py-2 px-3 text-gray-300">
                        {rec.nakshatraName} ({rec.pada})
                      </td>
                      <td className="py-2 px-3 text-gray-400">
                        {rec.nakshatraLord}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-400">
                        H{rec.transitHouse}
                      </td>
                      <td className="py-2 px-3 text-[#d4af37]">
                        {rec.targetHouseMatch.length > 0 ? `[${rec.targetHouseMatch.join(', ')}]` : '-'}
                      </td>
                      <td className="py-2 px-3">
                        {rec.result === 'REJECTED' ? (
                          <span className="text-[10px] text-red-400 font-sans font-semibold">
                            {rec.rejectionReason === 'ADVERSE_HOUSE_MATCH'
                              ? `[${rec.adverseHouseMatch.join(', ')}] adverse`
                              : rec.rejectionReason}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500">0 adverse</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                          {rec.precision}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          rec.result === 'QUALIFIED'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                            : 'bg-red-950 text-red-300 border-red-700/50'
                        }`}>
                          {rec.result}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedRecord(rec); }}
                          className="p-1 rounded hover:bg-[#d4af37]/20 text-[#d4af37] transition-colors"
                          title="View Full Rule Lineage"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded Single-Event Forensic Lineage Inspector */}
          {selectedRecord && (
            <div className="p-4 sm:p-5 rounded-xl border border-[#d4af37]/50 bg-gradient-to-br from-[#081a11] via-black to-[#05140d] space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#d4af37]" />
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {isHindi ? 'प्रमाण वंशावली विश्लेषण (Complete Rule Lineage Trace)' : 'Rule Lineage Forensic Trace'}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    selectedRecord.result === 'QUALIFIED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                      : 'bg-red-950 text-red-300 border border-red-600/50'
                  }`}>
                    {selectedRecord.result}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400">
                  <span>ID: {selectedRecord.evidenceId}</span>
                </div>
              </div>

              {/* 15-Step Unbroken Lineage Chain */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-black/60 border border-gray-800/80">
                  <span className="text-[10px] text-gray-400 block font-bold">1. भविष्य समय (Future Time)</span>
                  <span className="text-emerald-300 font-mono text-[11px] font-bold">
                    {selectedRecord.boundaryTimestamp || selectedRecord.evaluationTimestamp}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-black/60 border border-gray-800/80">
                  <span className="text-[10px] text-gray-400 block font-bold">2. गोचर ग्रह (Transit Planet)</span>
                  <span className="text-white font-bold">{selectedRecord.transitPlanet} ({selectedRecord.hindiName})</span>
                </div>

                <div className="p-2.5 rounded bg-black/60 border border-gray-800/80">
                  <span className="text-[10px] text-gray-400 block font-bold">3. स्विस एफिमेरिस रेखांश</span>
                  <span className="text-[#d4af37] font-mono font-bold">{formatDegMinSec(selectedRecord.exactLongitude)}</span>
                </div>

                <div className="p-2.5 rounded bg-black/60 border border-gray-800/80">
                  <span className="text-[10px] text-gray-400 block font-bold">4. निरयण राशि (Sign)</span>
                  <span className="text-gray-200">{selectedRecord.sign} ({selectedRecord.hindiSign}) {selectedRecord.degreeInSign.toFixed(2)}°</span>
                </div>

                <div className="p-2.5 rounded bg-black/60 border border-gray-800/80">
                  <span className="text-[10px] text-gray-400 block font-bold">5. नक्षत्र व पाद (Nakshatra)</span>
                  <span className="text-gray-200">{selectedRecord.nakshatraName} (पाद {selectedRecord.pada})</span>
                </div>

                <div className="p-2.5 rounded bg-black/60 border border-gray-800/80">
                  <span className="text-[10px] text-gray-400 block font-bold">6. नक्षत्र-नाथ (Star Lord)</span>
                  <span className="text-emerald-400 font-bold">{selectedRecord.nakshatraLord}</span>
                </div>

                <div className="p-2.5 rounded bg-black/60 border border-gray-800/80">
                  <span className="text-[10px] text-gray-400 block font-bold">7. लग्न से गोचर भाव</span>
                  <span className="text-white font-bold">भाव {selectedRecord.transitHouse}</span>
                </div>

                <div className="p-2.5 rounded bg-black/60 border border-gray-800/80">
                  <span className="text-[10px] text-gray-400 block font-bold">8. केपी नियम (Rule ID)</span>
                  <span className="text-blue-300 font-mono text-[10px]">{selectedRecord.kpRuleId}</span>
                </div>
              </div>

              {/* Explanatory Narrative & Digital Fingerprint */}
              <div className="p-3 rounded-lg bg-black/60 border border-emerald-900/40 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-gray-300 font-bold">
                  <Info className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{isHindi ? 'वंशावली विवरण:' : 'Lineage Explanation:'}</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  {selectedRecord.ruleLineage.explanation[isHindi ? 'hi' : 'en']}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-800 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-gray-400 truncate">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Evidence Hash:</span>
                    <span className="text-emerald-300 truncate">{selectedRecord.evidenceFingerprint}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedRecord.evidenceFingerprint, selectedRecord.evidenceId)}
                    className="inline-flex items-center gap-1 text-[#d4af37] hover:underline cursor-pointer shrink-0 font-sans"
                  >
                    {copiedHash === selectedRecord.evidenceId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash === selectedRecord.evidenceId ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3.5 sm:px-5 border-t border-gray-800 bg-black/70 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>{isHindi ? 'विधि: उच्च-सटीक द्विभाजन स्कैन' : 'Method: High-Precision Binary Subdivision'}</span>
            <span>•</span>
            <span className="text-[#d4af37]">Swiss Ephemeris (@kuntay/swisseph)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold cursor-pointer transition-colors"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
