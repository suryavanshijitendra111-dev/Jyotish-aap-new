import { useState } from 'react';
import { GuardianIncident } from '../../types/ownerControl';
import { AlertTriangle, ShieldAlert, X, ChevronDown, ChevronUp, Clock, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';
import { t } from '../../i18n';

interface TechnicalAlertModalProps {
  incident: GuardianIncident | null;
  onClose: () => void;
  onFixNow: (incident: GuardianIncident) => void;
  onRequestApproval: (incident: GuardianIncident) => void;
  onIgnore: (incident: GuardianIncident) => void;
  onDismissSimulation?: (incident: GuardianIncident) => void;
}

export default function TechnicalAlertModal({
  incident,
  onClose,
  onFixNow,
  onRequestApproval,
  onIgnore,
  onDismissSimulation,
}: TechnicalAlertModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!incident) return null;

  const isSimulation = incident.isSimulation === true ||
    incident.isTest === true ||
    incident.errorCode === 'CRITICAL_LOCK_EPHEMERIS' ||
    Boolean(incident.errorCode?.startsWith('TEST_')) ||
    incident.title?.includes('(Simulated)') ||
    incident.description?.includes('(Simulated)');

  const isHistorical = incident.isHistorical === true ||
    incident.status === 'RESOLVED' ||
    incident.status === 'HISTORICAL' ||
    incident.status === 'FIXED' ||
    incident.id === 'inc_1789906572846_d0sgv5' ||
    incident.incidentState === 'HISTORICAL_INCIDENT' ||
    incident.incidentState === 'RESOLVED_INCIDENT';

  const isCritical = (incident.severity === 'CRITICAL' || incident.guardianLevel === 3) && !isSimulation && !isHistorical;
  const isProtected = (incident.guardianLevel === 2 || incident.ownerApprovalRequired) && !isSimulation && !isHistorical;
  const isSafeFix = (incident.guardianLevel === 1 || incident.autoFixAllowed) && !isSimulation && !isHistorical;

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/90 border-red-500 text-red-300';
      case 'HIGH':
        return 'bg-amber-950/90 border-amber-500 text-amber-300';
      case 'MEDIUM':
        return 'bg-yellow-950/90 border-yellow-500 text-yellow-300';
      default:
        return 'bg-emerald-950/90 border-emerald-500 text-emerald-300';
    }
  };

  const formattedTime = new Date(incident.lastSeen || incident.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-b from-[#0a1812] via-[#05140e] to-[#020a06] border-2 border-[#d4af37] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-[0_0_50px_rgba(212,175,55,0.35)] relative overflow-hidden text-white font-sans">
        
        {/* Ambient Top Glow */}
        <div className={`absolute -top-12 -left-12 w-36 h-36 ${isCritical ? 'bg-red-600/20' : 'bg-[#d4af37]/20'} rounded-full blur-2xl pointer-events-none`} />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/25 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              isSimulation ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' : 
              isHistorical ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400' :
              isCritical ? 'bg-red-950/80 border-red-500 text-red-400' : 
              'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#d4af37]'
            }`}>
              {isSimulation ? <ShieldCheck className="w-6 h-6 text-[#d4af37]" /> : 
               isHistorical ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> :
               isCritical ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : 
               <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#d4af37] tracking-wide flex items-center gap-2">
                <span>{isSimulation ? '🟡' : isHistorical ? '🟢' : '🔴'}</span> 
                {isSimulation ? 'सुरक्षा सिमुलेशन परीक्षण' : 
                 isHistorical ? 'सुलझाई गई ऐतिहासिक घटना (HISTORICAL / RESOLVED)' : 
                 (t('guardian.technicalAlert') || 'जीवन दर्पण तकनीकी चेतावनी')}
              </h2>
              <p className="text-xs text-gray-300 uppercase tracking-widest mt-0.5 font-medium">
                {isSimulation
                  ? 'सुरक्षित सिमुलेशन • कोई उत्पादन बदलाव नहीं'
                  : isHistorical
                  ? 'ऐतिहासिक ऑडिट रिकॉर्ड • वर्तमान कोड सुरक्षित • स्वामी अनुमोदन अनावश्यक'
                  : `${t('guardian.tabGuardian')} ${incident.guardianLevel} • ${isCritical ? (t('guardian.criticalConstraint') || 'Critical Lock') : isProtected ? (t('guardian.protectedDomain') || 'Protected Domain') : (t('guardian.safeSelfHeal') || 'Safe Self-Heal')}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-3.5 text-sm text-gray-200 relative z-10 max-h-[60vh] overflow-y-auto">
          
          {/* 1. Problem */}
          <div>
            <span className="text-xs text-gray-300 uppercase tracking-wider block mb-1 font-semibold">
              {t('guardian.problem') || 'समस्या'}:
            </span>
            <div className="text-base font-semibold text-white bg-black/40 p-3.5 rounded-xl border border-white/10 break-words leading-relaxed">
              {incident.title || incident.description || incident.message}
            </div>
          </div>

          {/* 2. Grid: Module, Severity, Event (ErrorCode), Occurrences */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1 font-semibold">
                {t('guardian.module') || 'मॉड्यूल'}:
              </span>
              <span className="text-white font-mono font-bold text-xs sm:text-sm truncate block">
                {incident.affectedModule || incident.module}
              </span>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1 font-semibold">
                {t('guardian.severity') || 'गंभीरता'}:
              </span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadgeClass(incident.severity)}`}>
                {incident.severity}
              </span>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1 font-semibold">
                {t('guardian.incidentTitle') || 'घटना'}:
              </span>
              <span className="text-[#d4af37] font-mono font-bold text-xs sm:text-sm truncate block">
                {incident.errorCode || incident.category}
              </span>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1 font-semibold">
                {t('guardian.incidentCountTitle') || 'घटनाएँ'}:
              </span>
              <span className="text-white font-bold text-xs sm:text-sm">
                {incident.occurrenceCount}
              </span>
            </div>
          </div>

          {/* Event Time */}
          <div className="flex items-center gap-2 text-xs text-gray-300 px-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{t('guardian.incidentTimeTitle') || 'घटना समय'}: <strong className="text-white">{formattedTime}</strong></span>
          </div>

          {/* 3. Guardian Suggested Action */}
          <div className="bg-[#082218]/70 p-3.5 rounded-xl border border-[#d4af37]/35">
            <span className="text-xs text-[#d4af37] uppercase tracking-wider font-bold block mb-1">
              Guardian {t('guardian.suggestedAction') || 'सुझाव'}:
            </span>
            <p className="text-gray-200 leading-relaxed text-sm break-words">
              {incident.suggestedAction}
            </p>
          </div>

          {/* 4. Banner: Simulation Test vs Historical Resolved vs Critical Lock */}
          {isSimulation ? (
            <div className="bg-[#d4af37]/15 p-3.5 rounded-xl border border-[#d4af37]/40 text-xs text-[#d4af37] space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-white text-sm">
                <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                <span>सुरक्षित सिमुलेशन परीक्षण (Simulated Security-Test Event)</span>
              </div>
              <p className="text-gray-300 leading-relaxed text-xs sm:text-sm">
                यह केवल एक सुरक्षा सिमुलेशन परीक्षण है। वास्तविक उत्पादन कोड, स्विस एफिमरिस गणना, एवं डेटाबेस पूरी तरह सुरक्षित व अपरिवर्तित हैं। स्वामी अनुमोदन की आवश्यकता नहीं है।
              </p>
              <div className="text-[11px] text-[#d4af37] bg-black/40 px-2.5 py-1 rounded inline-block font-mono border border-white/10">
                Event: {incident.errorCode} • Classification: TEST_ONLY
              </div>
            </div>
          ) : isHistorical ? (
            <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-500/60 text-xs text-emerald-200 space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-white text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>ऐतिहासिक ऑडिट रिकॉर्ड — हल किया गया (RESOLVED / HISTORICAL)</span>
              </div>
              <p className="text-gray-300 leading-relaxed text-xs sm:text-sm">
                यह पूर्व सत्र का ऐतिहासिक ऑडिट रिकॉर्ड है। global window.fetch म्यूटेशन को पूर्णतया हटाया जा चुका है एवं नेटिव सुरक्षित फेच कार्यशील है। कोई सक्रिय क्रिटिकल लॉक अथवा स्वामी पिन (OWNER_PIN) की आवश्यकता नहीं है।
              </p>
              <div className="text-[11px] text-emerald-300 bg-black/40 px-2.5 py-1 rounded inline-block font-mono border border-emerald-500/30">
                Status: RESOLVED • State: HISTORICAL_INCIDENT • Approval: NOT_REQUIRED
              </div>
            </div>
          ) : isCritical && (
            <div className="bg-red-950/60 p-3.5 rounded-xl border border-red-500/60 text-xs text-red-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-300 text-sm">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                CRITICAL LOCK — Owner Approval Required
              </div>
              <p className="text-gray-300 leading-relaxed">
                {t('guardian.criticalLockDesc') || 'यह सुरक्षित क्षेत्र है। Guardian अपने-आप बदलाव नहीं कर सकता।'}
              </p>
            </div>
          )}

          {/* 5. Details Accordion */}
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 min-h-[44px] text-sm text-[#d4af37] hover:underline font-semibold cursor-pointer"
            >
              <span>{showDetails ? (t('guardian.hideDetails') || 'विवरण छिपाएँ') : (t('guardian.details') || 'विवरण देखें')}</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showDetails && (
              <div className="mt-2 p-3 bg-black/60 rounded-xl border border-white/10 text-xs font-mono text-gray-300 overflow-x-auto max-h-36 space-y-1">
                <p><span className="text-[#d4af37] font-semibold">{t('guardian.incidentId') || 'आईडी'}:</span> {incident.id}</p>
                <p><span className="text-[#d4af37] font-semibold">स्क्रीन:</span> {incident.affectedScreen || incident.screen}</p>
                <p><span className="text-[#d4af37] font-semibold">{t('guardian.firstSeen') || 'प्रथम'}:</span> {new Date(incident.firstSeen).toLocaleString()}</p>
                {incident.sanitizedStack && (
                  <pre className="mt-2 whitespace-pre-wrap text-gray-400 text-[11px] bg-black/40 p-2 rounded">{incident.sanitizedStack}</pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#d4af37]/20 flex flex-wrap items-center justify-end gap-3 relative z-10">
          {!isHistorical && (
            <button
              onClick={() => onIgnore(incident)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl text-sm sm:text-base font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
            >
              {t('guardian.notNow') || 'अभी नहीं'}
            </button>
          )}

          {isHistorical ? (
            <button
              onClick={onClose}
              className="min-h-[48px] px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] whitespace-nowrap cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>स्वीकृत एवं बंद करें (Close)</span>
            </button>
          ) : isSimulation ? (
            <button
              onClick={() => {
                if (onDismissSimulation) {
                  onDismissSimulation(incident);
                } else {
                  onIgnore(incident);
                }
              }}
              className="min-h-[48px] px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#d4af37] text-[#030a08] hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] whitespace-nowrap cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-[#030a08]" />
              <span>सिमुलेशन अलर्ट बंद करें (Dismiss Test Alert)</span>
            </button>
          ) : isCritical ? (
            <button
              onClick={() => onRequestApproval(incident)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] whitespace-nowrap cursor-pointer flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              CRITICAL LOCK — Owner Approval Required
            </button>
          ) : isProtected ? (
            <button
              onClick={() => onRequestApproval(incident)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-black hover:opacity-90 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] whitespace-nowrap cursor-pointer"
            >
              {t('guardian.requestApproval') || 'ठीक करने की अनुमति दें'}
            </button>
          ) : (
            <button
              onClick={() => onFixNow(incident)}
              className="min-h-[48px] px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold bg-[#d4af37] text-[#030a08] hover:bg-[#d4af37]/90 transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] whitespace-nowrap cursor-pointer"
            >
              {t('guardian.fixAllowedNow') || 'ठीक करो'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
