import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  KeyRound, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Key,
  HelpCircle
} from 'lucide-react';
import CarvedCard from '../ui/CarvedCard';
import { 
  verifyOwnerPin, 
  getOwnerControlConfig, 
  saveOwnerPin,
  verifyOldPinLocally,
  verifyMasterKeyLocally,
  DEFAULT_TESTING_PIN,
  ACCEPTED_MASTER_KEYS
} from '../../services/guardian/guardianConfig';

interface SwamiSecretPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast?: (message: string) => void;
}

export default function SwamiSecretPinModal({
  isOpen,
  onClose,
  onSuccess,
  showToast
}: SwamiSecretPinModalProps) {
  const [pinInput, setPinInput] = useState('');
  const [showMask, setShowMask] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sub-modal for PIN Change / Reset (विकल्प A: पुराना पिन, विकल्प B: GUARDIAN_SECRET)
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTab, setResetTab] = useState<'OLD_PIN' | 'MASTER'>('OLD_PIN');
  const [resetOldPin, setResetOldPin] = useState('');
  const [resetMasterKey, setResetMasterKey] = useState('');
  const [resetNewPin, setResetNewPin] = useState('');
  const [resetConfirmPin, setResetConfirmPin] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showResetMask, setShowResetMask] = useState(false);

  if (!isOpen) return null;

  const handleKeypadPress = (val: string) => {
    setError('');
    if (val === 'CLEAR') {
      setPinInput('');
    } else if (val === 'BACKSPACE') {
      setPinInput(prev => prev.slice(0, -1));
    } else {
      if (pinInput.length < 8) {
        setPinInput(prev => prev + val);
      }
    }
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const clean = pinInput.trim();
    if (!clean) {
      setError('कृपया स्वामी सुरक्षा पिन दर्ज करें।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOwnerPin(clean);
      if (res.success) {
        if (showToast) {
          showToast('स्वामी अभिगम सत्यापित • नियंत्रण केंद्र सक्रिय');
        }
        setPinInput('');
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'अमान्य स्वामी पिन! पुनः प्रयास करें।');
      }
    } catch {
      setError('सत्यापन में त्रुटि उत्पन्न हुई। पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    const cleanNew = resetNewPin.trim();
    const cleanConfirm = resetConfirmPin.trim();

    if (!cleanNew || cleanNew.length < 4 || cleanNew.length > 8) {
      setResetError('नया पिन 4 से 8 अंकों का होना आवश्यक है।');
      return;
    }
    if (cleanNew !== cleanConfirm) {
      setResetError('नया पिन और पुष्टि पिन एक समान नहीं हैं!');
      return;
    }

    try {
      if (resetTab === 'OLD_PIN') {
        const cleanOld = resetOldPin.trim();
        if (!cleanOld) {
          setResetError('कृपया अपना वर्तमान / पुराना पिन दर्ज करें।');
          return;
        }

        let isOldValid = false;
        try {
          const checkRes = await fetch('/api/guardian/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: cleanOld })
          });
          const checkData = await checkRes.json();
          if (checkRes.ok && checkData.ok) {
            isOldValid = true;
          }
        } catch {
          // offline
        }

        if (!isOldValid && !verifyOldPinLocally(cleanOld)) {
          setResetError('वर्तमान / पुराना पिन अमान्य है!');
          return;
        }

        // Apply via server
        try {
          await fetch('/api/guardian/pin/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPin: cleanNew, oldPin: cleanOld })
          });
        } catch {}

        saveOwnerPin(cleanNew);
        setResetSuccess(true);
        if (showToast) showToast('स्वामी पिन सफलतापूर्वक अपडेट किया गया!');
        setTimeout(() => {
          setShowResetModal(false);
          setPinInput(cleanNew);
          setResetSuccess(false);
        }, 1200);

      } else {
        // Master Key bypass (GUARDIAN_SECRET)
        const cleanKey = resetMasterKey.trim();
        if (!cleanKey) {
          setResetError('कृपया मास्टर सीक्रेट की दर्ज करें।');
          return;
        }

        let isMasterValid = verifyMasterKeyLocally(cleanKey);
        try {
          const res = await fetch('/api/guardian/pin/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPin: cleanNew, masterKey: cleanKey })
          });
          const data = await res.json();
          if (res.ok && data.ok) {
            isMasterValid = true;
          }
        } catch {}

        if (!isMasterValid) {
          setResetError('अमान्य मास्टर सीक्रेट की (Invalid Master Secret)!');
          return;
        }

        saveOwnerPin(cleanNew);
        setResetSuccess(true);
        if (showToast) showToast('मास्टर सीक्रेट द्वारा नया पिन सुरक्षित सेट किया गया!');
        setTimeout(() => {
          setShowResetModal(false);
          setPinInput(cleanNew);
          setResetSuccess(false);
        }, 1200);
      }
    } catch {
      setResetError('पिन अद्यतन में तकनीकी समस्या हुई।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <CarvedCard 
        cornerSize={32}
        className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#0e271c] via-[#081a12] to-[#040e09] border-[#d4af37]/60 shadow-[0_0_50px_rgba(212,175,55,0.35)] relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#d4af37]/20 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#fef08a] to-[#d4af37] p-[1.5px] shadow-[0_0_15px_rgba(212,175,55,0.35)] shrink-0">
              <div className="w-full h-full bg-[#040e09] rounded-2xl flex items-center justify-center text-[#d4af37]">
                <Shield className="w-5 h-5 text-[#d4af37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#d4af37] tracking-wide">
                  स्वामी नियंत्रण केंद्र
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-bold">
                  गुप्त अभिगम
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                गोपनीय सुरक्षा पिन सत्यापन (Owner Authentication)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-[#d4af37]/50 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-5 sm:p-6 relative z-10">
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#d4af37] uppercase tracking-wider mb-2">
                स्वामी सुरक्षा पिन (4-8 अंक)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#d4af37]/60">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showMask ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pinInput}
                  onChange={(e) => {
                    setError('');
                    setPinInput(e.target.value.replace(/\D/g, '').slice(0, 8));
                  }}
                  placeholder="अपना पिन दर्ज करें"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#040e09]/90 border border-[#d4af37]/40 focus:border-[#d4af37] text-white text-center font-mono text-xl sm:text-2xl tracking-[0.35em] placeholder:tracking-normal placeholder:text-gray-500 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowMask(!showMask)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#d4af37] transition-colors cursor-pointer"
                  title={showMask ? 'पिन छिपाएं' : 'पिन देखें'}
                >
                  {showMask ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Virtual Numpad for Convenient Quick Entry */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACKSPACE'].map((btn) => {
                if (btn === 'CLEAR') {
                  return (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => handleKeypadPress('CLEAR')}
                      className="min-h-[42px] rounded-xl bg-white/5 border border-white/10 hover:border-red-400/40 text-gray-300 text-xs font-semibold hover:bg-red-950/30 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                    >
                      मिटाएं (C)
                    </button>
                  );
                }
                if (btn === 'BACKSPACE') {
                  return (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => handleKeypadPress('BACKSPACE')}
                      className="min-h-[42px] rounded-xl bg-white/5 border border-white/10 hover:border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold hover:bg-[#d4af37]/15 transition-all cursor-pointer flex items-center justify-center active:scale-95"
                      title="एक अंक हटाएं"
                    >
                      ⌫ बैक
                    </button>
                  );
                }
                return (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => handleKeypadPress(btn)}
                    className="min-h-[44px] rounded-xl bg-[#040e09]/70 border border-[#d4af37]/25 hover:border-[#d4af37] text-white text-lg font-bold font-mono hover:bg-[#d4af37]/15 transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-sm"
                  >
                    {btn}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={isLoading || pinInput.length < 4}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#b89528] text-[#030a08] font-bold text-base hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(212,175,55,0.35)] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>सत्यापित करें एवं प्रवेश करें</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setResetOldPin('');
                    setResetMasterKey('');
                    setResetNewPin('');
                    setResetConfirmPin('');
                    setResetError('');
                    setShowResetModal(true);
                  }}
                  className="text-[#d4af37] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>पिन बदलें / भूल गए?</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>
            </div>
          </form>
        </div>
      </CarvedCard>

      {/* Nested Modal: Change / Reset PIN */}
      {showResetModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn">
          <CarvedCard 
            cornerSize={32}
            className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#112d20] via-[#091f16] to-[#040e09] border-[#d4af37]/70 shadow-[0_0_50px_rgba(212,175,55,0.4)] relative overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#d4af37]/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#d4af37]">पिन बदलें या रीसेट करें</h3>
                  <p className="text-xs text-gray-300">सुरक्षित स्वामी पिन प्रबंधन</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Option Tabs */}
            <div className="px-5 pt-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-[#d4af37]/20">
                <button
                  type="button"
                  onClick={() => { setResetTab('OLD_PIN'); setResetError(''); }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    resetTab === 'OLD_PIN' 
                      ? 'bg-[#d4af37] text-black shadow-md' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  विकल्प A: पुराना पिन
                </button>
                <button
                  type="button"
                  onClick={() => { setResetTab('MASTER'); setResetError(''); }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    resetTab === 'MASTER' 
                      ? 'bg-[#d4af37] text-black shadow-md' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  विकल्प B: पिन भूल गए?
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleResetSubmit} className="p-5 space-y-3.5">
              {resetSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>पिन सफलतापूर्वक अपडेट कर दिया गया है!</span>
                </div>
              )}

              {resetError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetTab === 'OLD_PIN' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    वर्तमान / पुराना स्वामी पिन
                  </label>
                  <input
                    type={showResetMask ? 'text' : 'password'}
                    value={resetOldPin}
                    onChange={(e) => setResetOldPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="वर्तमान पिन (उदा. 1234)"
                    className="w-full px-3 py-2 rounded-xl bg-[#040e09]/90 border border-[#d4af37]/40 text-white font-mono text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#fef08a] mb-1 flex items-center justify-between">
                    <span>मास्टर सीक्रेट की (GUARDIAN_SECRET)</span>
                    <button
                      type="button"
                      onClick={() => setResetMasterKey('GUARDIAN_SECRET')}
                      className="text-[10px] text-[#d4af37] underline"
                    >
                      'GUARDIAN_SECRET' भरें
                    </button>
                  </label>
                  <input
                    type="text"
                    value={resetMasterKey}
                    onChange={(e) => setResetMasterKey(e.target.value)}
                    placeholder="GUARDIAN_SECRET दर्ज करें"
                    className="w-full px-3 py-2 rounded-xl bg-[#040e09]/90 border border-[#d4af37]/40 text-white font-mono text-xs focus:outline-none focus:border-[#d4af37]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    यदि पिन याद न हो, तो मास्टर सीक्रेट की द्वारा नया पिन सेट करें।
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  नया स्वामी पिन (4 से 8 अंक)
                </label>
                <input
                  type={showResetMask ? 'text' : 'password'}
                  value={resetNewPin}
                  onChange={(e) => setResetNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="नया पिन दर्ज करें"
                  className="w-full px-3 py-2 rounded-xl bg-[#040e09]/90 border border-[#d4af37]/40 text-white font-mono text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  नया पिन पुनः दर्ज करें (Confirm)
                </label>
                <input
                  type={showResetMask ? 'text' : 'password'}
                  value={resetConfirmPin}
                  onChange={(e) => setResetConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="नए पिन की पुष्टि करें"
                  className="w-full px-3 py-2 rounded-xl bg-[#040e09]/90 border border-[#d4af37]/40 text-white font-mono text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetMask(!showResetMask)}
                  className="text-gray-300 hover:text-white flex items-center gap-1.5"
                >
                  {showResetMask ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showResetMask ? 'पिन छिपाएं' : 'पिन देखें'}</span>
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold hover:bg-white/10"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#fef08a] to-[#b89528] text-black text-xs font-bold hover:scale-[1.01] active:scale-[0.98] shadow-md"
                >
                  नया पिन सहेजें
                </button>
              </div>
            </form>
          </CarvedCard>
        </div>
      )}
    </div>
  );
}
