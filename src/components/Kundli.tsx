/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BirthProfile, MasterKundliData } from '../types/kundli';
import { AstronomyService } from '../services/astronomy/astronomyService';
import { useTranslation } from '../i18n';
import { Loader2, Star, Shield } from 'lucide-react';
import LiveTransitChart from './kundli/LiveTransitChart';
import { VargaSpeaksControl } from './kundli/VargaSpeaksControl';
import { ShadbalaView } from './kundli/ShadbalaView';

export const KundliIntro: React.FC<{ onStart?: () => void }> = ({ onStart }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 p-6 text-white max-w-md mx-auto min-h-screen flex flex-col justify-center items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] mb-2 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
        <Star className="w-8 h-8" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-[#d4af37]">{t('modules.kundli.title') || 'कुंडली जन्मांग'}</h2>
      <p className="text-sm text-gray-300 leading-relaxed">
        {t('modules.kundli.desc') || 'लग्न, 12 भाव एवं ग्रह स्थिति'}
      </p>
      {onStart && (
        <button
          onClick={onStart}
          className="min-h-[48px] px-8 py-3 bg-[#d4af37] text-black font-bold rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:bg-[#e6c250] transition-all cursor-pointer"
        >
          {t('common.start') || 'आरंभ करें'}
        </button>
      )}
    </div>
  );
};

export const KundliShell: React.FC<{ profile?: BirthProfile | null; navigate?: (view: string) => void; showToast?: (msg: string) => void }> = ({
  profile
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [kundliData, setKundliData] = useState<MasterKundliData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    AstronomyService.calculateKundli(profile, 'Lahiri')
      .then(res => {
        if (res.status === 'Ready' && res.data) {
          setKundliData(res.data);
        } else {
          setError(res.message || 'Calculation error');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [profile]);

  return (
    <div className="space-y-6 p-4 sm:p-5 text-white max-w-md mx-auto pb-28">
      {/* Header Summary */}
      <div className="p-4 bg-gradient-to-r from-[#082218] via-[#05140e] to-[#020a06] border border-[#d4af37]/40 rounded-3xl shadow-lg flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#d4af37]">{t('modules.kundli.title') || 'जन्म कुंडली संकुल'}</h3>
          <p className="text-xs text-gray-300 mt-0.5">
            {profile?.name || 'Master Profile'} • {profile?.dob || ''}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
          <Shield className="w-5 h-5" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin mb-3" />
          <p className="text-sm text-[#d4af37] font-medium">{t('common.loading') || 'Calculating Kundli...'}</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-500/50 rounded-2xl text-center text-red-300">
          <p>{error}</p>
        </div>
      ) : !kundliData ? (
        <div className="p-6 bg-black/40 border border-[#d4af37]/30 rounded-2xl text-center text-gray-300">
          <p>{t('common.notAvailable') || 'Profile required.'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. D1 Lagna Kundli */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1">
              D1 Lagna Kundli (लग्न कुंडली)
            </h4>
            <LiveTransitChart masterData={kundliData} />
          </div>

          {/* 2. D9 Navamsha */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1">
              D9 Navamsha (नवांश कुंडली)
            </h4>
            <VargaSpeaksControl masterData={kundliData} />
          </div>

          {/* 3. Mukhya Shadbala */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider px-1">
              Mukhya Shadbala (मुख्य षडबल)
            </h4>
            <ShadbalaView data={kundliData} />
          </div>
        </div>
      )}
    </div>
  );
};
