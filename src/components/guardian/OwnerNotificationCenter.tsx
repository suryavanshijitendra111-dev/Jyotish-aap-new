import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Clock, 
  RotateCcw, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import { GuardianIncident } from '../../types/ownerControl';
import { 
  ownerNotificationService, 
  OwnerNotification 
} from '../../services/guardian/ownerNotificationService';
import { 
  guardianIncidentService, 
  getStoredIncidents,
  classifyIncidentState 
} from '../../services/guardian/guardianIncidentService';
import { t } from '../../i18n';

interface OwnerNotificationCenterProps {
  onOpenIncidentModal: (incident: GuardianIncident) => void;
  onOpenOwnerControl?: () => void;
  onDirectFix?: (incident: GuardianIncident) => void;
}

export default function OwnerNotificationCenter({
  onOpenIncidentModal,
  onOpenOwnerControl,
  onDirectFix,
}: OwnerNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<OwnerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'incidents' | 'notifications'>('incidents');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setNotifications(ownerNotificationService.getNotifications());
    setUnreadCount(ownerNotificationService.getUnreadCount());

    const unsubscribe = ownerNotificationService.subscribe((list, unread) => {
      setNotifications([...list]);
      setUnreadCount(unread);
    });

    const handleIncidentUpdate = () => {
      // Force refresh unread count
      setUnreadCount(ownerNotificationService.getUnreadCount());
    };

    window.addEventListener('jeevandarpan_incidents_updated', handleIncidentUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('jeevandarpan_incidents_updated', handleIncidentUpdate);
    };
  }, []);

  const allIncidents = getStoredIncidents();
  const openIncidents = allIncidents.filter(i => {
    const state = classifyIncidentState(i);
    return state === 'ACTIVE_RUNTIME_INCIDENT' && 
      (i.status === 'OPEN' || i.status === 'INVESTIGATING' || i.status === 'APPROVAL_REQUESTED');
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/80 border-red-500/80 text-red-300';
      case 'HIGH':
        return 'bg-amber-950/80 border-amber-500/80 text-amber-300';
      case 'MEDIUM':
        return 'bg-yellow-950/80 border-yellow-500/80 text-yellow-300';
      default:
        return 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300';
    }
  };

  return (
    <>
      {/* Floating or Header Notification Bell with Unread Badge */}
      <div className="relative inline-block">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              ownerNotificationService.markAllAsRead();
            }
          }}
          className={`relative min-h-[44px] min-w-[44px] p-2.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            openIncidents.length > 0 
              ? 'bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50' 
              : 'bg-black/40 border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10'
          }`}
          title={t('guardian.technicalAlert')}
          aria-label={t('guardian.technicalAlert')}
        >
          <Bell className={`w-5 h-5 ${openIncidents.some(i => i.severity === 'CRITICAL') ? 'text-red-400 animate-bounce' : ''}`} />
          {openIncidents.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full border border-black shadow-md min-w-[20px] text-center">
              {openIncidents.length}
            </span>
          )}
        </button>
      </div>

      {/* Slide-over / Modal Dropdown Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-b from-[#0a1812] via-[#05110d] to-[#020805] border-2 border-[#d4af37]/70 rounded-3xl w-full max-w-md shadow-[0_0_40px_rgba(212,175,55,0.3)] overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-[#d4af37]/20 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    {t('guardian.technicalAlert') || 'तकनीकी चेतावनी'}
                    {openIncidents.length > 0 && ` (${openIncidents.length})`}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {openIncidents.length > 0 
                      ? `${openIncidents.length} समस्याएँ ध्यान चाहती हैं` 
                      : 'सिस्टम सुचारू रूप से चल रहा है'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Incidents */}
            <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-sm">
              {openIncidents.length === 0 ? (
                <div className="text-center py-10 px-4 text-gray-400">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
                  <p className="font-semibold text-white text-base">🟢 {t('guardian.healthy') || 'सिस्टम स्वस्थ'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('guardian.noIncidents') || 'कोई सक्रिय तकनीकी चेतावनी नहीं है।'}
                  </p>
                </div>
              ) : (
                openIncidents.map((incident) => {
                  const isCritical = incident.severity === 'CRITICAL' || incident.guardianLevel === 3;
                  const isProtected = incident.guardianLevel === 2 || incident.ownerApprovalRequired;
                  const isExpanded = expandedId === incident.id;

                  return (
                    <div 
                      key={incident.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        isCritical 
                          ? 'bg-red-950/30 border-red-500/50' 
                          : 'bg-[#082218]/50 border-[#d4af37]/30'
                      }`}
                    >
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getSeverityBadge(incident.severity)}`}>
                            {incident.severity}
                          </span>
                          <span className="font-mono text-xs text-gray-300 bg-black/40 px-2 py-0.5 rounded">
                            {incident.errorCode}
                          </span>
                          {incident.occurrenceCount > 1 && (
                            <span className="text-[11px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                              {t('guardian.occurrences') || 'घटनाएँ'}: {incident.occurrenceCount}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {new Date(incident.lastSeen || incident.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h4 className="font-bold text-white text-sm sm:text-base leading-snug mb-1">
                        {isCritical && '🔴 '}
                        {incident.title}
                      </h4>
                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-2">
                        {incident.description}
                      </p>

                      {/* Module tag */}
                      <div className="text-[11px] text-gray-400 mb-3 flex items-center gap-1.5">
                        <span className="text-gray-300 font-semibold">{t('guardian.module') || 'मॉड्यूल'}:</span>
                        <span className="text-[#d4af37] font-mono">{incident.affectedModule}</span>
                      </div>

                      {/* Critical Lock Explanation */}
                      {isCritical && (
                        <div className="mb-3 p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200">
                          <p className="font-semibold flex items-center gap-1.5 text-red-300 mb-0.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            CRITICAL LOCK — Owner Approval Required
                          </p>
                          <p className="text-[11px] text-gray-300">
                            यह सुरक्षित क्षेत्र है। Guardian अपने-आप बदलाव नहीं कर सकता।
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10 flex-wrap">
                        <button
                          onClick={() => onOpenIncidentModal(incident)}
                          className="min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-200 bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
                        >
                          {t('guardian.viewDetails') || 'विवरण देखें'}
                        </button>

                        {isCritical ? (
                          <button
                            onClick={() => onOpenIncidentModal(incident)}
                            className="min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-sm cursor-pointer ml-auto"
                          >
                            CRITICAL LOCK
                          </button>
                        ) : isProtected ? (
                          <button
                            onClick={() => onOpenIncidentModal(incident)}
                            className="min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:opacity-90 transition-all cursor-pointer ml-auto"
                          >
                            {t('guardian.requestApproval') || 'अनुमति दें'}
                          </button>
                        ) : (
                          <button
                            onClick={() => onDirectFix ? onDirectFix(incident) : onOpenIncidentModal(incident)}
                            className="min-h-[44px] px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[#d4af37] text-[#030a08] hover:bg-[#d4af37]/90 transition-all cursor-pointer ml-auto"
                          >
                            {t('guardian.fixNow') || 'ठीक करो'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {onOpenOwnerControl && (
              <div className="p-3.5 border-t border-[#d4af37]/20 bg-black/40 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {t('guardian.guardianGovernance')}
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenOwnerControl();
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {t('guardian.ownerControlCenter')}
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
