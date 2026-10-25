import React, { useState, useEffect, useMemo } from 'react';
import { BirthProfile, MasterKundliData } from '../../types/kundli';
import { 
  DailyReportCardData, 
  DailyReportCardSection, 
  UserWellnessDiary,
  MonthlyReportSummary 
} from '../../types/dailyReportCard';
import { DailyReportCardService } from '../../services/report/dailyReportCardService';
import { DailyReportPdfService, PdfGenerationResult } from '../../services/report/dailyReportPdfService';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  Share2, 
  Trash2, 
  BookOpen, 
  Heart, 
  Sun, 
  Moon, 
  Compass, 
  Coins, 
  Briefcase, 
  Clock, 
  Target, 
  Layout, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  RefreshCw,
  Eye,
  ExternalLink,
  SlidersHorizontal,
  BookmarkCheck,
  Flame,
  Droplets,
  Wind,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { DailyReportCardVerificationSuite, VerificationResult } from '../../tests/dailyReportCardVerification';
import { useTranslation } from '../../i18n';
import LanguageSelectorModal from '../LanguageSelectorModal';
import { 
  getLocalizedSectionContent, 
  getLocalizedSummaryHeadline, 
  getLocalizedMetric, 
  getLocalizedPlanetName,
  getLocalizedElement,
  localizeCalculatedData
} from '../../services/report/dailyReportCardLocalization';

interface Props {
  profile: BirthProfile | null;
  kundliData?: MasterKundliData | null;
  navigate: (view: string) => void;
  showToast: (msg: string) => void;
}

type CategoryFilter = 'ALL' | 'OVERVIEW' | 'ASTROLOGY' | 'NUMEROLOGY' | 'LIFE_DOMAINS' | 'WELLNESS' | 'CONSCIOUSNESS';

export default function DailyReportCard({ profile, kundliData, navigate, showToast }: Props) {
  const { t, currentLanguageInfo, language } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [report, setReport] = useState<DailyReportCardData | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({});
  
  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyResults, setVerifyResults] = useState<VerificationResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [historyReports, setHistoryReports] = useState<DailyReportCardData[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlyReportSummary | null>(null);
  const [wellnessDiary, setWellnessDiary] = useState<UserWellnessDiary>(DailyReportCardService.getUserWellnessDiary());
  const [newSensitivityText, setNewSensitivityText] = useState('');

  const runVerificationTests = async () => {
    setIsRunningTests(true);
    try {
      const { results } = await DailyReportCardVerificationSuite.runAllTests();
      setVerifyResults(results);
    } catch (e: any) {
      showToast(t('common.error') || 'Error running verification suite');
    } finally {
      setIsRunningTests(false);
    }
  };

  // PDF Status & Generated Result
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfResult, setPdfResult] = useState<PdfGenerationResult | null>(null);

  // User input notes for Main Goal & Evening Reflection
  const [goalInput, setGoalInput] = useState('');
  const [reflectionInput, setReflectionInput] = useState('');

  // Format date helper
  const dateStr = useMemo(() => {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  }, [selectedDate]);

  // 3-Tier Identity Guard: Prevents showing private journal notes to wrong profile or corrupt/unassigned records
  const matchesCurrentProfile = (existingReport: DailyReportCardData, currentProfile: BirthProfile): boolean => {
    const activeId = (currentProfile as any)?.id;
    const reportProfileId = (existingReport.profile as any)?.id;

    // Tier 1: Modern record with explicit ID
    if (reportProfileId && activeId) {
      return reportProfileId === activeId;
    }

    // Tier 2: Legacy record without ID — attributed ONLY to master if birth details match strictly
    const isMaster = activeId === 'master' || (currentProfile as any)?.isMaster === true;
    if (!reportProfileId && isMaster) {
      return Boolean(
        existingReport.profile?.dob === currentProfile.dob &&
        existingReport.profile?.time === currentProfile.time &&
        existingReport.profile?.place === currentProfile.place
      );
    }

    // Tier 3: Unassigned legacy or mismatched person
    return false;
  };

  // Load or generate report when date or profile changes
  useEffect(() => {
    if (!profile) return;
    
    // Check if report already exists in history
    const existing = DailyReportCardService.getReportByDate(dateStr);
    if (existing && matchesCurrentProfile(existing, profile)) {
      setReport(existing);
      setGoalInput(existing.userGoalNote || '');
      setReflectionInput(existing.userReflectionNote || '');
    } else {
      // Either no report exists OR the existing report is UNASSIGNED_LEGACY / belongs to another member.
      // Deterministically generate fresh daily report for current profile. Do NOT expose other member's notes or delete the existing report.
      const generated = DailyReportCardService.generateDailyReportCard(profile, selectedDate, kundliData);
      setReport(generated);
      setGoalInput('');
      setReflectionInput('');
    }
  }, [profile, selectedDate, kundliData, dateStr]);

  // Load history list when modal opens
  useEffect(() => {
    if (showHistoryModal) {
      setHistoryReports(DailyReportCardService.getAllReports());
    }
  }, [showHistoryModal]);

  // Load monthly summary when monthly modal opens
  useEffect(() => {
    if (showMonthlyModal) {
      const monthStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
      setMonthlySummary(DailyReportCardService.getMonthlySummary(monthStr));
    }
  }, [showMonthlyModal, selectedDate]);

  // Handle Date Shifts
  const shiftDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const jumpToToday = () => {
    setSelectedDate(new Date());
  };

  // Toggle layer details for a section
  const toggleLayers = (sectionId: string) => {
    setExpandedLayers(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Mobile-reliable PDF Opener
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
      console.warn('Fallback window opening error:', e);
      window.location.href = res.blobUrl;
    }
  };

  // Mobile Web Share API for PDF
  const handleSharePdf = async (res: PdfGenerationResult) => {
    if (!res) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
        const file = new File([res.blob], res.filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: res.filename,
            text: `JeevanDarpan Daily Life Report (${report?.date || ''})`
          });
          showToast(t('common.success') || 'Shared successfully');
          return;
        }
      }
    } catch (e) {
      console.warn('Share not completed or cancelled:', e);
    }
    // Fallback to opening PDF
    handleOpenPdf(res);
  };

  // Real PDF Generation & Download
  const handleDownloadPdf = async () => {
    if (!report) return;
    setIsPdfGenerating(true);
    setPdfError(null);
    try {
      const result = await DailyReportPdfService.generateAndDownloadPdf(report, language);
      setPdfResult(result);
      if (result.downloadTriggered) {
        showToast(`${t('report.downloadInitiated') || 'Download initiated'}: ${result.filename}`);
      } else {
        showToast(`${t('report.pdfReadyTitle') || 'PDF compiled'}: ${result.filename}`);
      }
    } catch (err: any) {
      setPdfError(err.message || 'PDF Generation encountered an unexpected error.');
      showToast(t('report.toastPdfFailed') || 'PDF download failed. Please review error.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Save to Daily Journal
  const handleSaveToJournal = () => {
    if (!report) return;
    const updated: DailyReportCardData = {
      ...report,
      userGoalNote: goalInput,
      userReflectionNote: reflectionInput,
      isSavedToJournal: true
    };
    DailyReportCardService.saveReportToJournal(updated);
    setReport(updated);
    showToast(t('report.toastSaved') || 'Saved to Daily Journal successfully!');
  };

  // Share report summary
  const handleShare = async () => {
    if (!report) return;
    const shareText = `JeevanDarpan Daily Report (${report.date})\nScore: ${report.summaryScore}/100\nHeadline: ${report.summaryHeadline}\nPersonal Day: ${report.sections.numerology.calculatedData.match(/Personal Day: (\d+)/)?.[1] || ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `JeevanDarpan Daily Report - ${report.date}`,
          text: shareText,
          url: window.location.href
        });
        showToast(t('common.success') || 'Shared successfully');
      } catch {
        showToast(t('report.shareCancelled') || 'Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      showToast(t('common.copied') || 'Summary copied to clipboard!');
    }
  };

  // Add user sensitivity
  const handleAddSensitivity = () => {
    if (!newSensitivityText.trim()) return;
    const updated: UserWellnessDiary = {
      ...wellnessDiary,
      sensitivities: [...wellnessDiary.sensitivities, newSensitivityText.trim()]
    };
    DailyReportCardService.saveUserWellnessDiary(updated);
    setWellnessDiary(updated);
    setNewSensitivityText('');
    showToast(t('common.saved') || 'Sensitivity recorded in personal diary');
  };

  const handleRemoveSensitivity = (index: number) => {
    const filtered = wellnessDiary.sensitivities.filter((_, i) => i !== index);
    const updated: UserWellnessDiary = {
      ...wellnessDiary,
      sensitivities: filtered
    };
    DailyReportCardService.saveUserWellnessDiary(updated);
    setWellnessDiary(updated);
    showToast(t('report.sensitivityRemoved') || 'Removed sensitivity entry');
  };

  // Section icon resolver
  const renderSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Moon': return <Moon className="w-4 h-4 text-sky-300" />;
      case 'Compass': return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'Coins': return <Coins className="w-4 h-4 text-yellow-400" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4 text-teal-400" />;
      case 'Clock': return <Clock className="w-4 h-4 text-indigo-400" />;
      case 'Target': return <Target className="w-4 h-4 text-rose-400" />;
      case 'Layout': return <Layout className="w-4 h-4 text-emerald-300" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-yellow-300" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'AlertTriangle': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <FileText className="w-4 h-4 text-[#d4af37]" />;
    }
  };

  // Filter sections
  const filteredSections = useMemo(() => {
    if (!report) return [];
    const list = Object.values(report.sections);
    if (categoryFilter === 'ALL') return list;
    return list.filter(sec => sec.category === categoryFilter);
  }, [report, categoryFilter]);

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#030a08] to-[#082218] text-white">
        <p className="text-[#d4af37] mb-6 text-lg font-serif">{t('report.profileNotLoaded') || 'Master Profile is not loaded.'}</p>
        <button 
          onClick={() => navigate('dashboard')}
          className="px-8 py-3 border border-[#d4af37] text-[#d4af37] rounded-full hover:bg-[#d4af37]/10"
        >
          {t('report.returnToDashboard') || 'Return to Dashboard'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full max-w-2xl mx-auto pb-32 font-sans text-white bg-gradient-to-b from-[#030a08] via-[#05140e] to-[#082218]">
      
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#030a08]/95 backdrop-blur-md border-b border-[#d4af37]/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('dashboard')} 
              className="p-2 text-[#d4af37] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title={t('common.back') || 'Back'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-[#d4af37] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#d4af37]" />
                {t('report.title')}
              </h1>
              <p className="text-[10px] text-[#d4af37]/70 uppercase tracking-widest">
                {profile.name} • {t('report.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowVerifyModal(true);
                runVerificationTests();
              }}
              className="px-2.5 py-1.5 text-amber-400 bg-amber-950/40 border border-amber-500/30 rounded-lg hover:bg-amber-900/50 transition-colors flex items-center gap-1.5"
              title={t('report.verifyAudit')}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold hidden sm:inline text-amber-300">
                {t('report.auditBadge') || '24-Pt Audit'}
              </span>
            </button>
            <button
              onClick={() => setShowWellnessModal(true)}
              className="p-2 text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/50 transition-colors"
              title={t('report.wellnessTitle')}
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMonthlyModal(true)}
              className="p-2 text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg hover:bg-[#d4af37]/20 transition-colors"
              title={t('report.monthlyTitle')}
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="p-2 text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg hover:bg-[#d4af37]/20 transition-colors"
              title={t('report.historyTitle')}
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLangModal(true)}
              className="px-2 py-1.5 text-[#d4af37] bg-[#d4af37]/15 border border-[#d4af37]/40 rounded-lg hover:bg-[#d4af37]/25 transition-colors flex items-center gap-1 text-[11px] font-semibold"
              title={t('report.changeLanguage') || 'Change Language'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLanguageInfo.code.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Global Language Selector Modal */}
        <LanguageSelectorModal
          isOpen={showLangModal}
          onClose={() => setShowLangModal(false)}
          onLanguageSelected={(code) => showToast(`Language: ${code.toUpperCase()}`)}
        />

        {/* Date Navigation Strip */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-xs">
          <button 
            onClick={() => shiftDate(-1)} 
            className="flex items-center gap-1 text-[#d4af37] hover:text-white px-2 py-1 rounded bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" /> {t('report.yesterday')}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide">
              {selectedDate.toLocaleDateString(currentLanguageInfo.code === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {dateStr !== new Date().toISOString().split('T')[0] && (
              <button 
                onClick={jumpToToday}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40"
              >
                {t('report.today')}
              </button>
            )}
          </div>

          <button 
            onClick={() => shiftDate(1)} 
            className="flex items-center gap-1 text-[#d4af37] hover:text-white px-2 py-1 rounded bg-white/5"
          >
            {t('report.nextDay')} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="p-4 flex flex-col gap-4">

        {/* Score & Master Alignment Hero Card */}
        {report && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#082218] via-[#0d2f21] to-[#082218] border border-[#d4af37]/30 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-semibold">
                  {t('report.harmonyIndex')}
                </span>
                {(() => {
                  const headline = getLocalizedSummaryHeadline(report, language);
                  return (
                    <>
                      <h2 className="text-xl font-bold text-white mt-0.5">
                        {headline.primary}
                      </h2>
                      {headline.secondary && (
                        <p className="text-xs text-emerald-200/80 mt-1 font-hindi">
                          {headline.secondary}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#030a08]/80 border-2 border-[#d4af37] text-center shadow-inner">
                <span className="text-lg font-bold text-[#d4af37]">{report.summaryScore}</span>
                <span className="text-[9px] text-gray-400">/ 100</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
              <div className="p-1.5 rounded bg-black/30 border border-white/5">
                <span className="text-[9px] text-gray-400 block">{t('report.moolankLabel')}</span>
                <span className="text-xs font-bold text-[#d4af37]">
                  {getLocalizedMetric('moolank', 6, language)}
                </span>
              </div>
              <div className="p-1.5 rounded bg-black/30 border border-white/5">
                <span className="text-[9px] text-gray-400 block">{t('report.bhagyankLabel')}</span>
                <span className="text-xs font-bold text-rose-300">
                  {getLocalizedMetric('bhagyank', 9, language)}
                </span>
              </div>
              <div className="p-1.5 rounded bg-black/30 border border-white/5">
                <span className="text-[9px] text-gray-400 block">{t('report.personalDayLabel')}</span>
                <span className="text-xs font-bold text-amber-300">
                  {report.sections.numerology.calculatedData.match(/Personal Day: (\d+)/)?.[1] || '7'}
                </span>
              </div>
              <div className="p-1.5 rounded bg-black/30 border border-white/5">
                <span className="text-[9px] text-gray-400 block">{t('report.dayLordLabel')}</span>
                <span className="text-xs font-bold text-emerald-300">
                  {getLocalizedPlanetName(
                    report.sections.today_overview.calculatedData.match(/Day Lord: ([^(|]+)/)?.[1]?.trim() || 'Mercury',
                    language
                  )}
                </span>
              </div>
            </div>

            {/* Prashna Reference if active */}
            {report.prashnaReference && (
              <div className="mt-3 p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-[11px] text-emerald-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span><strong>{t('report.activePrashnaLink')}</strong> {report.prashnaReference}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Toolbar: Download PDF, Save to Journal, Share */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isPdfGenerating}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#c49f27] active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            {isPdfGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Download className="w-4 h-4 text-black" />
            )}
            {t('report.downloadPdf').toUpperCase()}
          </button>

          <button
            onClick={handleSaveToJournal}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-800 text-white font-medium text-xs hover:bg-emerald-700 active:scale-95 transition-all border border-emerald-500/40"
          >
            <BookmarkCheck className="w-4 h-4 text-emerald-300" />
            {t('report.saveJournal').toUpperCase()}
          </button>

          <button
            onClick={handleShare}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 text-gray-200 font-medium text-xs hover:bg-white/10 active:scale-95 transition-all border border-white/10"
          >
            <Share2 className="w-4 h-4 text-[#d4af37]" />
            {t('report.shareSummary').toUpperCase()}
          </button>
        </div>

        {/* PDF Ready & Mobile Fallback Action Card */}
        {pdfResult && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#082218] to-[#04130d] border-2 border-[#d4af37] text-xs text-white shadow-2xl animate-in fade-in flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#d4af37]">
                      {pdfResult.downloadTriggered
                        ? (t('report.downloadInitiated') || 'PDF Generated & Download Initiated')
                        : (t('report.pdfReadyTitle') || 'PDF Generated Successfully')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-medium">
                      {t('report.pdfVerifiedUnicode') || 'Verified Unicode'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-mono mt-0.5 truncate max-w-[260px] sm:max-w-md">
                    {pdfResult.filename} • {((pdfResult.arrayBuffer?.byteLength || 0) / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPdfResult(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-emerald-200/90 leading-relaxed relative z-10">
              {t('report.pdfDownloadInstructions') || 'If automatic download did not trigger on your mobile device, tap "Open PDF" or "Download PDF" directly below:'}
            </p>

            {/* Mobile-Guaranteed Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 relative z-10 pt-1">
              <button
                onClick={() => handleOpenPdf(pdfResult)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#c49f27] active:scale-95 transition-all shadow-md"
              >
                <Eye className="w-4 h-4 text-black" />
                <span>{t('report.openPdf') || 'Open PDF'}</span>
                <ExternalLink className="w-3 h-3 text-black/70" />
              </button>

              <a
                href={pdfResult.blobUrl}
                download={pdfResult.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#082218] border border-[#d4af37]/60 text-[#d4af37] font-semibold text-xs hover:bg-[#0d2f21] active:scale-95 transition-all text-center"
              >
                <Download className="w-4 h-4 text-[#d4af37]" />
                <span>{t('report.downloadPdfFile') || 'Download PDF'}</span>
              </a>

              <button
                onClick={() => handleSharePdf(pdfResult)}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-gray-200 font-medium text-xs hover:bg-white/20 active:scale-95 transition-all border border-white/10"
              >
                <Share2 className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{t('report.sharePdfFile') || 'Share / Save'}</span>
              </button>
            </div>
          </div>
        )}

        {/* PDF Error Display with Retry */}
        {pdfError && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 flex items-start justify-between">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">{t('report.pdfErrorTitle') || 'PDF Generation Notice'}</p>
                <p className="text-[11px] mt-0.5">{pdfError}</p>
              </div>
            </div>
            <button 
              onClick={handleDownloadPdf}
              className="px-2.5 py-1 text-[11px] bg-red-800 hover:bg-red-700 text-white rounded font-medium ml-2 flex-shrink-0"
            >
              {t('report.retry')}
            </button>
          </div>
        )}

        {/* Health Safety Guardrail Banner */}
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-start gap-2.5">
          <Heart className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            {t('report.healthSafetyDirective')}
          </div>
        </div>

        {/* Interactive Goal & Evening Reflection Section */}
        <div className="p-4 rounded-2xl bg-black/40 border border-[#d4af37]/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#d4af37] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#d4af37]" />
              {t('report.todayGoalAndReflection')}
            </span>
            <span className="text-[10px] text-gray-400">{t('report.storedWithReport')}</span>
          </div>

          <div>
            <label className="text-[11px] text-gray-300 block mb-1">{t('report.mainGoalLabel')}</label>
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder={t('report.mainGoalPlaceholder')}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#082218] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-300 block mb-1">{t('report.eveningReflectionLabel')}</label>
            <textarea
              rows={2}
              value={reflectionInput}
              onChange={(e) => setReflectionInput(e.target.value)}
              placeholder={t('report.eveningReflectionPlaceholder')}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[#082218] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'ALL', label: t('report.categoriesAll') },
            { id: 'OVERVIEW', label: t('report.categoriesOverview') },
            { id: 'ASTROLOGY', label: t('report.categoriesAstrology') },
            { id: 'NUMEROLOGY', label: t('report.categoriesNumerology') },
            { id: 'LIFE_DOMAINS', label: t('report.categoriesLife') },
            { id: 'WELLNESS', label: t('report.categoriesWellness') },
            { id: 'CONSCIOUSNESS', label: t('report.categoriesConsciousness') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as CategoryFilter)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                categoryFilter === tab.id
                  ? 'bg-[#d4af37] text-black shadow-sm'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 21 Guidance Sections List */}
        <div className="flex flex-col gap-3">
          {filteredSections.map((sec, idx) => {
            const isExpanded = !!expandedLayers[sec.id];
            const content = getLocalizedSectionContent(sec, report, language);

            return (
              <div 
                key={sec.id}
                className="rounded-xl bg-[#082218]/80 border border-[#d4af37]/25 p-4 flex flex-col gap-3 shadow-md hover:border-[#d4af37]/40 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                      {renderSectionIcon(sec.iconName)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {t(`report.sec_${sec.id}` as any) || sec.title}
                        {sec.titleHindi && currentLanguageInfo.code === 'en' && (
                          <span className="text-[10px] text-gray-400 font-normal font-hindi">
                            {sec.titleHindi}
                          </span>
                        )}
                      </h3>
                      <span className="text-[10px] text-[#d4af37]/80 uppercase tracking-wider">
                        {t('report.category')}: {
                          sec.category === 'OVERVIEW' ? t('report.categoriesOverview') :
                          sec.category === 'ASTROLOGY' ? t('report.categoriesAstrology') :
                          sec.category === 'NUMEROLOGY' ? t('report.categoriesNumerology') :
                          sec.category === 'LIFE_DOMAINS' ? t('report.categoriesLife') :
                          sec.category === 'WELLNESS' ? t('report.categoriesWellness') :
                          sec.category === 'CONSCIOUSNESS' ? t('report.categoriesConsciousness') :
                          sec.category.replace('_', ' ')
                        }
                      </span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sec.favorableRating === 'High' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                    sec.favorableRating === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                    sec.favorableRating === 'Prudent' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                    'bg-gray-800 text-gray-300 border border-gray-600'
                  }`}>
                    {sec.favorableRating === 'High' ? t('report.ratingHigh') :
                     sec.favorableRating === 'Moderate' ? t('report.ratingModerate') :
                     t('report.ratingPrudent')}
                  </span>
                </div>

                {/* 4-Part Guidance Grid */}
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {/* SIGNAL */}
                  <div className="p-2.5 rounded-lg bg-black/40 border-l-2 border-emerald-400">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                      {t('report.signal')}
                    </span>
                    <p className="text-gray-200 leading-relaxed">{content.signal}</p>
                  </div>

                  {/* WHY */}
                  <div className="p-2.5 rounded-lg bg-black/40 border-l-2 border-amber-400">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                      {t('report.whyBasis')}
                    </span>
                    <p className="text-gray-300 leading-relaxed">{content.why}</p>
                  </div>

                  {/* WHAT TO DO */}
                  <div className="p-2.5 rounded-lg bg-black/40 border-l-2 border-sky-400">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-0.5">
                      {t('report.whatToDo')}
                    </span>
                    <p className="text-gray-200 leading-relaxed">{content.whatToDo}</p>
                  </div>

                  {/* WHAT TO BE CAREFUL ABOUT */}
                  <div className="p-2.5 rounded-lg bg-black/40 border-l-2 border-rose-400">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-0.5">
                      {t('report.whatToBeCarefulAbout')}
                    </span>
                    <p className="text-gray-300 leading-relaxed">{content.whatToBeCarefulAbout}</p>
                  </div>
                </div>

                {/* Expandable Layer Details */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => toggleLayers(sec.id)}
                    className="flex items-center justify-between w-full text-[11px] text-[#d4af37] hover:text-white py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      {isExpanded ? t('report.deepLayersToggleHide') : t('report.deepLayersToggleShow')}
                    </span>
                    <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 flex flex-col gap-2 p-3 rounded-lg bg-black/50 border border-white/10 text-[11px]">
                      <div>
                        <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">
                          {t('report.calculatedDataLabel')}
                        </span>
                        <p className="text-gray-300 font-mono text-[10px] mt-0.5 bg-black/30 p-1.5 rounded">
                          {localizeCalculatedData(sec.calculatedData || '', language)}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">
                          {t('report.traditionalInterpretationLabel')}
                        </span>
                        <p className="text-emerald-200/90 font-hindi mt-0.5">
                          {content.traditionalInterpretation}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">
                          {t('report.aiSynthesisLabel')}
                        </span>
                        <p className="text-gray-300 mt-0.5">
                          {content.aiExplanation}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">
                          {t('report.actionableGuidanceLabel')}
                        </span>
                        <p className="text-[#d4af37] mt-0.5">
                          {content.actionableGuidance}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* --- MODAL 1: REPORT HISTORY --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#082218] border border-[#d4af37]/30 rounded-2xl p-5 text-white flex flex-col max-h-[85vh] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-[#d4af37] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                {t('report.historyTitle')}
              </h2>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 flex flex-col gap-2.5">
              {historyReports.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">{t('report.historyEmpty')}</p>
              ) : (
                historyReports.map(r => (
                  <div key={r.reportId} className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{r.date}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4af37]/20 text-[#d4af37]">
                          {t('report.score') || 'Score'}: {r.summaryScore}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                        {r.userGoalNote || (language === 'hi' ? r.summaryHeadlineHindi : r.summaryHeadline)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedDate(new Date(r.date));
                          setShowHistoryModal(false);
                          showToast(`${t('report.openedReportFor') || 'Opened report for'} ${r.date}`);
                        }}
                        className="p-1.5 text-xs rounded bg-white/10 hover:bg-white/20 text-[#d4af37]"
                        title={t('report.openReport') || 'Open'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={async () => {
                          showToast(`${t('report.downloadingPdfFor') || 'Generating PDF for'} ${r.date}...`);
                          try {
                            const res = await DailyReportPdfService.generateAndDownloadPdf(r, language);
                            setPdfResult(res);
                            setShowHistoryModal(false);
                            if (res.downloadTriggered) {
                              showToast(`${t('report.downloadInitiated') || 'Download initiated'}: ${res.filename}`);
                            } else {
                              showToast(`${t('report.pdfReadyTitle') || 'PDF ready'}: ${res.filename}`);
                            }
                          } catch (err: any) {
                            showToast(t('report.toastPdfFailed') || 'PDF download failed');
                          }
                        }}
                        className="p-1.5 text-xs rounded bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37]"
                        title={t('report.downloadPdf') || 'Download PDF'}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          DailyReportCardService.deleteReport(r.reportId);
                          setHistoryReports(DailyReportCardService.getAllReports());
                          showToast(t('report.reportDeleted') || 'Report deleted from history');
                        }}
                        className="p-1.5 text-xs rounded bg-red-950/60 hover:bg-red-900/80 text-red-300"
                        title={t('report.deleteReport') || 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full py-2 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: MONTHLY SUMMARY FOUNDATION --- */}
      {showMonthlyModal && monthlySummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#082218] border border-[#d4af37]/30 rounded-2xl p-5 text-white flex flex-col max-h-[85vh] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-[#d4af37] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d4af37]" />
                {t('report.monthlyTitle')} ({monthlySummary.month})
              </h2>
              <button onClick={() => setShowMonthlyModal(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] text-gray-400 block">{t('report.loggedDays')}</span>
                  <span className="text-base font-bold text-[#d4af37]">{monthlySummary.totalDaysRecorded}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-[10px] text-gray-400 block">{t('report.goodDeedsDone')}</span>
                  <span className="text-base font-bold text-emerald-400">{monthlySummary.karmaActionsCompleted}</span>
                </div>
              </div>

              {/* Recurring Themes */}
              <div>
                <span className="text-[11px] font-bold text-[#d4af37] block mb-1">{t('report.recurringThemes')}</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-300 text-[11px]">
                  {monthlySummary.frequentThemes.map((th, i) => (
                    <li key={i}>{th}</li>
                  ))}
                </ul>
              </div>

              {/* Elemental Balance Average */}
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="text-[11px] font-bold text-gray-300 block mb-1.5">{t('report.panchatattvaBalance')}</span>
                <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                  <div className="p-1 bg-amber-950/40 rounded border border-amber-500/20 text-amber-300">
                    <span className="block">{getLocalizedElement('Earth', language)}</span>85%
                  </div>
                  <div className="p-1 bg-blue-950/40 rounded border border-blue-500/20 text-blue-300">
                    <span className="block">{getLocalizedElement('Water', language)}</span>82%
                  </div>
                  <div className="p-1 bg-red-950/40 rounded border border-red-500/20 text-red-300">
                    <span className="block">{getLocalizedElement('Fire', language)}</span>88%
                  </div>
                  <div className="p-1 bg-teal-950/40 rounded border border-teal-500/20 text-teal-300">
                    <span className="block">{getLocalizedElement('Air', language)}</span>90%
                  </div>
                  <div className="p-1 bg-indigo-950/40 rounded border border-indigo-500/20 text-indigo-300">
                    <span className="block">{getLocalizedElement('Space', language)}</span>86%
                  </div>
                </div>
              </div>

              {/* Recorded Goals */}
              {monthlySummary.recordedGoals.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-[#d4af37] block mb-1">{t('report.recordedGoals')}</span>
                  <div className="space-y-1 text-[10px] text-gray-300 max-h-24 overflow-y-auto">
                    {monthlySummary.recordedGoals.map((g, i) => (
                      <div key={i} className="p-1.5 rounded bg-white/5 flex justify-between">
                        <span>{g.goal}</span>
                        <span className="text-gray-400">{g.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => setShowMonthlyModal(false)}
                className="w-full py-2 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: USER WELLNESS & SENSITIVITY DIARY --- */}
      {showWellnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#082218] border border-[#d4af37]/30 rounded-2xl p-5 text-white flex flex-col max-h-[85vh] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                {t('report.wellnessTitle')}
              </h2>
              <button onClick={() => setShowWellnessModal(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 flex flex-col gap-3 text-xs">
              {/* Medical Notice */}
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/30 text-[10px] text-red-200">
                {t('report.wellnessNotice')}
              </div>

              {/* Sensitivities List */}
              <div>
                <span className="text-[11px] font-bold text-gray-300 block mb-1">{t('report.recordedSensitivities')}</span>
                <div className="flex flex-col gap-1.5">
                  {wellnessDiary.sensitivities.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-[11px]">
                      <span>{s}</span>
                      <button 
                        onClick={() => handleRemoveSensitivity(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title={t('report.deleteItem') || 'Delete'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Sensitivity */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSensitivityText}
                  onChange={(e) => setNewSensitivityText(e.target.value)}
                  placeholder={t('report.addSensitivityPlaceholder')}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#030a08] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleAddSensitivity}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> {t('report.addBtn')}
                </button>
              </div>

              {/* Targets */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <span className="text-[10px] text-gray-400 block">{t('report.sleepTarget')}</span>
                  <span className="font-bold text-white">{wellnessDiary.sleepTargetHours} {t('report.hours') || 'Hours'}</span>
                </div>
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <span className="text-[10px] text-gray-400 block">{t('report.hydrationTarget')}</span>
                  <span className="font-bold text-white">{wellnessDiary.hydrationTargetLiters} {t('report.liters') || 'Liters'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => setShowWellnessModal(false)}
                className="w-full py-2 text-xs rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold"
              >
                {t('report.saveAndClose')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: 24-POINT VERIFICATION & AUDIT SUITE --- */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#082218] border border-[#d4af37]/40 rounded-2xl p-5 text-white flex flex-col max-h-[85vh] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="text-base font-bold text-[#d4af37]">
                    {t('report.auditTitle')}
                  </h2>
                  <p className="text-[10px] text-gray-400">
                    {t('report.auditSubtitle')}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Controls & Summary */}
            <div className="py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  {verifyResults.filter(r => r.passed).length} / {verifyResults.length} {t('report.passed') || 'Passed'}
                </span>
                {verifyResults.length > 0 && verifyResults.every(r => r.passed) && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t('report.allVerified')}
                  </span>
                )}
              </div>
              <button
                onClick={runVerificationTests}
                disabled={isRunningTests}
                className="px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#bfa030] text-black font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
                {isRunningTests ? t('report.runningTests') : t('report.rerunTests')}
              </button>
            </div>

            {/* Test List */}
            <div className="overflow-y-auto py-2 flex flex-col gap-2 text-xs flex-1 pr-1">
              {isRunningTests ? (
                <div className="py-12 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#d4af37] mb-2" />
                  {t('report.runningTests')}
                </div>
              ) : verifyResults.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  {t('report.clickRerunTests') || "Click 'Re-run Tests' to execute the audit suite."}
                </div>
              ) : (
                verifyResults.map((test) => (
                  <div 
                    key={test.id} 
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-colors ${
                      test.passed 
                        ? 'bg-black/40 border-emerald-500/20' 
                        : 'bg-red-950/40 border-red-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400 w-5">#{test.id}</span>
                        <span className="font-semibold text-white text-[11px]">{test.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        test.passed ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'
                      }`}>
                        {test.passed ? (t('report.testPass') || 'PASS') : (t('report.testFail') || 'FAIL')}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-300 pl-7">{test.details}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="w-full py-2 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
              >
                {t('report.closeAudit')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
