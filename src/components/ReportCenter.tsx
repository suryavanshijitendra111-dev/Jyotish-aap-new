import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BirthProfile } from '../types/kundli';
import { AstronomyService } from '../services/astronomy/astronomyService';
import { NumerologyEngine } from '../services/numerology/numerologyEngine';
import { LoShuEngine } from '../services/numerology/loShuEngine';
import { globalJyotishRegistry } from '../services/jyotish/systemRegistry';
import { DailyReportCardService } from '../services/report/dailyReportCardService';
import { DailyReportPdfService, PdfGenerationResult } from '../services/report/dailyReportPdfService';
import { useLanguage } from '../i18n';
import { getLocalizedPlanet, getLocalizedRashi } from '../i18n/astrology';
import { ArrowLeft, Loader2, FileText, Share2, Printer, Download, Eye, Layout, ExternalLink, X } from 'lucide-react';

interface Props {
  profile: BirthProfile | null;
  navigate: (view: string) => void;
  showToast: (msg: string) => void;
}

type ReportType = 'KUNDLI' | 'NUMEROLOGY' | 'LOSHU' | 'AI_GUIDANCE' | 'CUSTOM';

export default function ReportCenter({ profile, navigate, showToast }: Props) {
  const { t, language } = useLanguage();
  const [activeReport, setActiveReport] = useState<ReportType>('KUNDLI');
  const [calcResult, setCalcResult] = useState<any>({ status: 'Idle', data: null, message: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfResult, setPdfResult] = useState<PdfGenerationResult | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const numData = useMemo(() => profile ? NumerologyEngine.evaluate(profile) : null, [profile]);
  const loShuData = useMemo(() => profile ? LoShuEngine.evaluate(profile) : null, [profile]);

  useEffect(() => {
    if (!profile) return;
    setCalcResult({ status: 'Calculating', data: null, message: t('common.loading') });
    AstronomyService.calculateKundli(profile, 'Lahiri')
      .then(res => setCalcResult(res))
      .catch(err => setCalcResult({ status: 'Error', data: null, message: err.message }));
  }, [profile, t]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JeevanDarpan Report',
          text: `Astrological Report for ${profile?.name}`,
          url: window.location.href,
        });
        showToast(t('common.sharedSuccess') || 'Shared successfully');
      } catch (error) {
        showToast(t('common.shareCancelled') || 'Share cancelled');
      }
    } else {
      showToast(t('common.notAvailable') || 'Sharing not supported on this device/browser');
    }
  };

  const handleOpenPdf = (res: PdfGenerationResult) => {
    if (!res?.blobUrl) return;
    try {
      const win = window.open(res.blobUrl, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        const link = document.createElement('a');
        link.href = res.blobUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try { document.body.removeChild(link); } catch {}
        }, 1000);
      }
      showToast(t('report.openPdf') || 'Opening PDF...');
    } catch (e) {
      window.location.href = res.blobUrl;
    }
  };

  const handleExportPDF = async () => {
    if (!profile) return;
    setIsGenerating(true);
    showToast(t('report.downloadingPdfFor') + (profile.name || ''));
    try {
      const dailyReport = DailyReportCardService.generateDailyReportCard(profile, new Date(), calcResult.data);
      const result = await DailyReportPdfService.generateAndDownloadPdf(dailyReport, language);
      setPdfResult(result);
      if (result.downloadTriggered) {
        showToast(`${t('report.downloadInitiated')}: ${result.filename}`);
      } else {
        showToast(`${t('report.pdfReadyTitle')}: ${result.filename}`);
      }
    } catch (err: any) {
      console.error('PDF export error:', err);
      showToast(`${t('report.toastPdfFailed')}: ${err.message || 'Error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#030a08] to-[#082218] text-white">
        <p className="text-[#d4af37] mb-10 text-lg">{t('numerology.noProfileData') || 'No profile data available.'}</p>
        <button onClick={() => navigate('dashboard')} className="px-10 py-3 border-2 border-[#d4af37] text-[#d4af37] rounded-full">{t('common.goBack')}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full max-w-md mx-auto pb-28 font-sans text-white bg-gradient-to-br from-[#030a08] to-[#082218]">
      {/* Header (No Print) */}
      <header className="flex justify-between items-center p-5 border-b border-[#d4af37]/20 bg-[#030a08]/80 sticky top-0 z-20 backdrop-blur-md print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-[#d4af37] hover:text-white transition-colors" title={t('common.goBack')}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#d4af37] flex items-center gap-2"><FileText className="w-4 h-4"/> {t('reportCenter.title') || 'Report Center'}</h1>
            <p className="text-[10px] text-[#d4af37]/70 tracking-[0.2em] uppercase">{profile.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={handleShare} className="text-[#d4af37] p-1.5 bg-[#d4af37]/10 rounded border border-[#d4af37]/30 hover:bg-[#d4af37]/20" title={t('common.share')}><Share2 className="w-4 h-4"/></button>
           <button onClick={handleExportPDF} className="text-[#d4af37] p-1.5 bg-[#d4af37]/10 rounded border border-[#d4af37]/30 hover:bg-[#d4af37]/20" title={t('common.downloadPdf')}>
             {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
           </button>
           <button onClick={handlePrint} className="text-[#d4af37] p-1.5 bg-[#d4af37]/10 rounded border border-[#d4af37]/30 hover:bg-[#d4af37]/20"><Printer className="w-4 h-4"/></button>
        </div>
      </header>

      <main className="p-4 flex flex-col gap-6 relative" ref={printRef}>
        
        {/* Printable Report Header */}
        <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
           <h1 className="text-2xl font-bold text-black uppercase tracking-widest">JeevanDarpan</h1>
           <h2 className="text-lg text-gray-800">{t('reportCenter.title') || 'Master Life Report'}</h2>
           <div className="mt-4 text-sm text-gray-600">
             <p><strong>{t('common.name') || 'Name'}:</strong> {profile.name}</p>
             <p><strong>{t('kundli.dob') || 'DOB'}:</strong> {profile.dob} | <strong>{t('kundli.tob') || 'Time'}:</strong> {profile.time}</p>
             <p><strong>{t('kundli.pob') || 'Location'}:</strong> {profile.latitude}, {profile.longitude} ({profile.timezone})</p>
           </div>
        </div>

        {calcResult.status !== 'Ready' ? (
           <div className="flex flex-col items-center justify-center p-10 gap-4 print:hidden">
             <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
             <p className="text-[#d4af37] text-sm">{calcResult.message || t('common.loading')}</p>
           </div>
        ) : (
           <>
            {/* PDF Ready Fallback Card */}
            {pdfResult && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#082218] to-[#04130d] border border-[#d4af37] text-white shadow-xl flex flex-col gap-2.5 print:hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#d4af37]" />
                    <div>
                      <span className="font-bold text-xs text-[#d4af37]">
                        {pdfResult.downloadTriggered ? t('report.downloadInitiated') : t('report.pdfReadyTitle')}
                      </span>
                      <p className="text-[10px] text-gray-300 font-mono truncate max-w-[200px]">
                        {pdfResult.filename}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setPdfResult(null)} className="text-gray-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenPdf(pdfResult)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#c49f27]"
                  >
                    <Eye className="w-3.5 h-3.5 text-black" />
                    <span>{t('report.openPdf')}</span>
                    <ExternalLink className="w-3 h-3 text-black/70" />
                  </button>
                  <a
                    href={pdfResult.blobUrl}
                    download={pdfResult.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-black/40 border border-[#d4af37]/60 text-[#d4af37] font-semibold text-xs hover:bg-black/60 text-center"
                  >
                    <Download className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>{t('common.downloadPdf')}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Report Selector - Hidden on print */}
            <div className="flex overflow-x-auto bg-black/40 p-1 rounded-xl border border-[#d4af37]/20 hide-scrollbar gap-1 print:hidden">
               {[
                 { id: 'KUNDLI', label: t('nav.kundli') },
                 { id: 'NUMEROLOGY', label: t('numerology.title') },
                 { id: 'LOSHU', label: t('numerology.loShuGrid') },
                 { id: 'AI_GUIDANCE', label: t('intelligence.title') || 'AI Guidance' },
                 { id: 'CUSTOM', label: t('reportCenter.customReportBuilder') || 'Custom' }
               ].map((tab) => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveReport(tab.id as ReportType)}
                   className={`flex-shrink-0 px-3 py-2 rounded-lg text-[10px] font-semibold tracking-wider transition-colors ${activeReport === tab.id ? 'bg-[#d4af37] text-[#030a08]' : 'text-gray-400 hover:text-white'}`}
                 >
                   {tab.label}
                 </button>
               ))}
            </div>

            {/* KUNDLI REPORT */}
            {activeReport === 'KUNDLI' && (
              <div className="space-y-6 animate-in fade-in print:text-black print:bg-white">
                <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 print:border-none print:shadow-none print:p-0">
                  <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-4 border-b border-[#d4af37]/20 pb-2 print:text-black print:border-black">{t('reportCenter.astrologySnapshot')}</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-black/40 p-3 rounded-xl border border-gray-700/50 print:bg-gray-100 print:border-gray-300">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t('reportCenter.ascendant')}</span>
                        <span className="text-[#d4af37] font-medium print:text-black">{getLocalizedRashi(calcResult.data.lagna?.rashiName, language)}</span>
                     </div>
                     <div className="bg-black/40 p-3 rounded-xl border border-gray-700/50 print:bg-gray-100 print:border-gray-300">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t('reportCenter.moonSign')}</span>
                        <span className="text-[#d4af37] font-medium print:text-black">{getLocalizedRashi(calcResult.data.planets?.Moon?.rashiName, language)}</span>
                     </div>
                  </div>
                </div>

                <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 print:border-none print:shadow-none print:p-0">
                   <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-4 border-b border-[#d4af37]/20 pb-2 print:text-black print:border-black">{t('reportCenter.planetaryPositions')}</h2>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-xs">
                       <thead className="text-[#d4af37] border-b border-white/10 print:text-black print:border-black">
                         <tr>
                           <th className="py-2">{t('reportCenter.planet')}</th>
                           <th className="py-2">{t('reportCenter.rashi')}</th>
                           <th className="py-2">{t('reportCenter.degree')}</th>
                           <th className="py-2">{t('reportCenter.nakshatra')}</th>
                           <th className="py-2">{t('reportCenter.motion')}</th>
                         </tr>
                       </thead>
                       <tbody className="text-gray-300 print:text-gray-800">
                         {Object.entries(calcResult.data.planets).map(([key, p]: any) => (
                           <tr key={key} className="border-b border-white/5 print:border-gray-200">
                             <td className="py-2 font-medium">{getLocalizedPlanet(key, language)}</td>
                             <td className="py-2">{getLocalizedRashi(p.rashiName, language)}</td>
                             <td className="py-2">{p.degree?.toFixed(2) || '0.00'}°</td>
                             <td className="py-2">{p.nakshatraName} ({t('kundli.padaLabel') || 'P'}{p.pada})</td>
                             <td className="py-2">{p.isRetrograde ? (language === 'hi' ? (t('kundli.retrogradeMotion') || 'वक्री') : 'Rx') : (language === 'hi' ? (t('kundli.directMotion') || 'मार्गी') : 'Dir')}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              </div>
            )}

            {/* NUMEROLOGY REPORT */}
            {activeReport === 'NUMEROLOGY' && numData && (
               <div className="space-y-6 animate-in fade-in print:text-black print:bg-white">
                 <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 print:border-none print:p-0">
                  <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-4 border-b border-[#d4af37]/20 pb-2 print:text-black print:border-black">{t('reportCenter.coreNumerology')}</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-black/40 p-3 rounded-xl border border-gray-700/50 print:bg-gray-100 print:border-gray-300">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t('reportCenter.mulankBirth')}</span>
                        <span className="text-[#d4af37] font-medium print:text-black">{numData.birthNumber}</span>
                     </div>
                     <div className="bg-black/40 p-3 rounded-xl border border-gray-700/50 print:bg-gray-100 print:border-gray-300">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t('reportCenter.bhagyankDestiny')}</span>
                        <span className="text-[#d4af37] font-medium print:text-black">{numData.destinyNumber}</span>
                     </div>
                     <div className="bg-black/40 p-3 rounded-xl border border-gray-700/50 print:bg-gray-100 print:border-gray-300">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t('reportCenter.nameNumber')}</span>
                        <span className="text-[#d4af37] font-medium print:text-black">{numData.nameNumber}</span>
                     </div>
                     <div className="bg-black/40 p-3 rounded-xl border border-gray-700/50 print:bg-gray-100 print:border-gray-300">
                        <span className="text-[9px] text-gray-500 uppercase block mb-1">{t('reportCenter.attitudeNumber')}</span>
                        <span className="text-[#d4af37] font-medium print:text-black">{numData.attitudeNumber}</span>
                     </div>
                  </div>
                 </div>
               </div>
            )}

            {/* LO SHU REPORT */}
            {activeReport === 'LOSHU' && loShuData && (
              <div className="space-y-6 animate-in fade-in print:text-black print:bg-white">
                 <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 print:border-none print:p-0">
                  <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-4 border-b border-[#d4af37]/20 pb-2 print:text-black print:border-black">{t('reportCenter.loShuGridAnalysis')}</h2>
                  
                  <div className="mb-6 bg-black/40 p-4 rounded-xl border border-gray-700/50 print:bg-gray-100 print:border-gray-300 flex justify-center">
                     <div className="grid grid-cols-3 gap-2 p-2">
                        {[4,9,2,3,5,7,8,1,6].map(cell => (
                          <div key={cell} className="w-12 h-12 flex items-center justify-center bg-[#0a1510] border border-[#d4af37]/30 text-white font-bold rounded print:border-black print:text-black print:bg-white">
                            {(loShuData.grid[cell] as any) > 0 ? Array(loShuData.grid[cell] as any).fill(cell).join('') : ''}
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs text-gray-400 uppercase mb-2 print:text-gray-800">{t('reportCenter.strengthsArrows')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {loShuData.arrows.filter((a:any) => a.type === 'STRENGTH').map((a:any) => (
                           <span key={a.id} className="text-xs bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded border border-emerald-800 print:bg-gray-200 print:text-black print:border-gray-400">{a.name}</span>
                        ))}
                        {loShuData.arrows.filter((a:any) => a.type === 'STRENGTH').length === 0 && <span className="text-xs text-gray-500">{t('reportCenter.noneDetected')}</span>}
                      </div>
                    </div>
                  </div>
                 </div>
              </div>
            )}
            
            {/* AI GUIDANCE REPORT */}
            {activeReport === 'AI_GUIDANCE' && (
              <div className="space-y-6 animate-in fade-in print:text-black print:bg-white">
                 <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 text-center print:border-none print:p-0">
                   <Layout className="w-10 h-10 text-[#d4af37] mx-auto mb-3 opacity-80 print:hidden" />
                   <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-4 print:text-black">{t('reportCenter.aiGuidanceSummary')}</h2>
                   <p className="text-xs text-gray-400 print:text-gray-800">{t('reportCenter.aiGuidanceDesc')}</p>
                   <button onClick={() => navigate('intelligence_dashboard')} className="mt-4 px-6 py-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded-full text-xs hover:bg-[#d4af37]/20 print:hidden">
                     {t('reportCenter.goToAiChat')}
                   </button>
                 </div>
              </div>
            )}
            
            {/* CUSTOM REPORT */}
            {activeReport === 'CUSTOM' && (
              <div className="space-y-6 animate-in fade-in print:text-black print:bg-white">
                 <div className="bg-[#0a1510]/80 border border-[#d4af37]/30 rounded-2xl p-5 text-center print:border-none print:p-0">
                   <h2 className="text-[#d4af37] font-semibold text-sm tracking-widest uppercase mb-4 print:text-black">{t('reportCenter.customReportBuilder')}</h2>
                   <p className="text-xs text-gray-400 print:text-gray-800 mb-4">
                     {t('reportCenter.customReportDesc')}
                   </p>
                   <div className="grid grid-cols-2 gap-2 text-left mb-6 print:hidden">
                     <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked readOnly className="accent-[#d4af37]" /> {t('dashboard.masterProfile')}</label>
                     <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked readOnly className="accent-[#d4af37]" /> {t('reportCenter.astrologySnapshot')}</label>
                     <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked readOnly className="accent-[#d4af37]" /> {t('reportCenter.planetaryPositions')}</label>
                     <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked readOnly className="accent-[#d4af37]" /> {t('reportCenter.coreNumerology')}</label>
                     <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked readOnly className="accent-[#d4af37]" /> {t('numerology.loShuGrid')}</label>
                   </div>
                   <button onClick={handlePrint} className="w-full px-6 py-3 bg-[#d4af37] text-black font-bold rounded-xl text-sm print:hidden">
                     {t('reportCenter.generateUnifiedReport')}
                   </button>
                 </div>
              </div>
            )}

            <div className="flex gap-2 p-2 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20 mt-4 items-center justify-center print:hidden">
                 <Eye className="w-4 h-4 text-[#d4af37]" />
                 <span className="text-[10px] text-[#d4af37]">{t("reportCenter.verifiedNotice")}</span>
            </div>
           </>
        )}
      </main>
      
      {/* Print Footer */}
      <div className="hidden print:block fixed bottom-0 w-full text-center p-4 border-t border-gray-300 text-[10px] text-gray-500 bg-white">
        {t("reportCenter.printFooter")}
      </div>
    </div>
  );
}
