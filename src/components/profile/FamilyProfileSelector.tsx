/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — FAMILY PROFILE SELECTOR COMPONENT
 * PHASE B: FAMILY PROFILE UI & APP INTEGRATION
 * 
 * Compact, accessible selector pill and dropdown for switching the active person
 * from Header, Dashboard, or Navigation without full-page reloads.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Users, ChevronDown, Check, Plus, Shield, User, Sparkles } from 'lucide-react';
import { FamilyMemberProfile } from '../../types/profile/profileTypes';
import { ProfileService, ACTIVE_PROFILE_CHANGED_EVENT, PROFILES_UPDATED_EVENT } from '../../services/profile/profileService';
import { RELATION_LABELS } from './FamilyMemberFormModal';

interface FamilyProfileSelectorProps {
  onAddNewMember?: () => void;
  className?: string;
  variant?: 'header' | 'card';
}

export const FamilyProfileSelector: React.FC<FamilyProfileSelectorProps> = ({
  onAddNewMember,
  className = '',
  variant = 'header'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState<FamilyMemberProfile>(() => ProfileService.getActiveProfile());
  const [allProfiles, setAllProfiles] = useState<FamilyMemberProfile[]>(() => ProfileService.getAllProfiles());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with ProfileService events
  useEffect(() => {
    const sync = () => {
      setActiveProfile(ProfileService.getActiveProfile());
      setAllProfiles(ProfileService.getAllProfiles());
    };

    window.addEventListener(ACTIVE_PROFILE_CHANGED_EVENT, sync);
    window.addEventListener(PROFILES_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener(ACTIVE_PROFILE_CHANGED_EVENT, sync);
      window.removeEventListener(PROFILES_UPDATED_EVENT, sync);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (id: string) => {
    ProfileService.setActiveProfileId(id);
    setIsOpen(false);
  };

  const relLabel = RELATION_LABELS[activeProfile.relationship]?.hi || activeProfile.relationship;

  if (variant === 'card') {
    return (
      <div className={`relative ${isOpen ? 'z-40' : 'z-10'} ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-[#d4af37]/40 hover:border-[#d4af37] transition-all text-left cursor-pointer group shadow-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
              {activeProfile.isMaster ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base truncate">{activeProfile.name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#d4af37]/25 text-[#fef08a] border border-[#d4af37]/40 font-semibold whitespace-nowrap">
                  {relLabel}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {activeProfile.dob} • {activeProfile.place}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#d4af37] transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#071912] border border-[#d4af37]/60 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.95)] p-2">
            <div className="px-3 py-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider border-b border-[#d4af37]/20">
              पारिवारिक सदस्य चुनें
            </div>
            <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar space-y-1">
              {allProfiles.map(p => {
                const isSelected = p.id === activeProfile.id;
                const pRel = RELATION_LABELS[p.relationship]?.hi || p.relationship;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#d4af37]/20 border border-[#d4af37]/50 text-white font-semibold'
                        : 'hover:bg-white/5 text-gray-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center text-[#d4af37] shrink-0 text-xs font-bold">
                        {p.isMaster ? '★' : '•'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm truncate text-white">{p.name}</p>
                        <p className="text-[11px] text-[#d4af37]/80">{pRel} • {p.dob}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#d4af37] shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
            {onAddNewMember && (
              <div className="pt-1 mt-1 border-t border-[#d4af37]/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onAddNewMember();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>नया पारिवारिक सदस्य जोड़ें</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Header compact variant
  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-20'} ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/25 transition-all shadow-sm cursor-pointer"
        title="सक्रिय प्रोफ़ाइल बदलें"
      >
        <Users className="w-4 h-4 shrink-0 text-[#d4af37]" />
        <span className="text-xs sm:text-sm font-bold text-white max-w-[90px] sm:max-w-[120px] truncate">
          {activeProfile.name.split(' ')[0]}
        </span>
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/30 hidden sm:inline-block font-semibold">
          {relLabel}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#d4af37] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] z-50 bg-[#071912] border border-[#d4af37]/60 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.95)] p-2">
          <div className="px-3 py-1.5 text-xs font-bold text-[#d4af37] uppercase tracking-wider border-b border-[#d4af37]/20 flex items-center justify-between">
            <span>पारिवारिक प्रोफ़ाइल</span>
            <span className="text-[10px] text-gray-400">{allProfiles.length} सदस्य</span>
          </div>
          <div className="max-h-48 sm:max-h-60 overflow-y-auto py-1 custom-scrollbar space-y-1">
            {allProfiles.map(p => {
              const isSelected = p.id === activeProfile.id;
              const pRel = RELATION_LABELS[p.relationship]?.hi || p.relationship;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#d4af37]/20 border border-[#d4af37]/50 text-white font-semibold'
                      : 'hover:bg-white/5 text-gray-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-white">{p.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{pRel} • {p.dob}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#d4af37] shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
          {onAddNewMember && (
            <div className="pt-1 mt-1 border-t border-[#d4af37]/20">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddNewMember();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नया सदस्य जोड़ें</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
