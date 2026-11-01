/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useProfile } from '../../context/ProfileContext';

export const FamilyProfileSelector: React.FC = () => {
  const { activeProfile, setActiveProfileId, familyProfiles, masterProfile } = useProfile();

  return (
    <div className="flex items-center gap-2 bg-black/40 border border-yellow-500/30 rounded-xl px-3 py-1.5 text-white">
      <span className="text-xs text-yellow-500 font-bold">Profile:</span>
      <select 
        value={activeProfile?.id || 'master'} 
        onChange={(e) => setActiveProfileId(e.target.value)}
        className="bg-black text-xs text-white border border-gray-700 rounded px-2 py-1 focus:outline-none"
      >
        <option value="master">{masterProfile?.name || 'Master Profile'} (Self)</option>
        {familyProfiles.map(p => (
          <option key={p.id} value={p.id}>{p.name} ({p.relationship})</option>
        ))}
      </select>
    </div>
  );
};
