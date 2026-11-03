/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useProfile } from '../../context/ProfileContext';

interface FamilyProfileSelectorProps {
  onAddNewMember?: () => void;
  variant?: 'header' | 'card';
}

export const FamilyProfileSelector: React.FC<FamilyProfileSelectorProps> = () => {
  const { activeProfile, updateActiveProfile, allProfiles, masterProfile } = useProfile();

  const profilesList = Array.isArray(allProfiles) ? allProfiles : [];
  const familyProfiles = profilesList.filter(p => p.id !== 'master' && !p.isMaster);

  return (
    <div className="flex items-center gap-2 bg-black/40 border border-[#d4af37]/30 rounded-xl px-3 py-1.5 text-white">
      <span className="text-xs text-[#d4af37] font-bold">Profile:</span>
      <select 
        value={activeProfile?.id || 'master'} 
        onChange={(e) => updateActiveProfile(e.target.value)}
        className="bg-black text-xs text-white border border-gray-700 rounded px-2 py-1 focus:outline-none"
      >
        <option value="master">{masterProfile?.name || 'Master Profile'} (Self)</option>
        {familyProfiles.map(p => (
          <option key={p.id} value={p.id}>{p.name} ({p.relationship || 'Member'})</option>
        ))}
      </select>
    </div>
  );
};
