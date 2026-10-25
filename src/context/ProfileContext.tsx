/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FamilyMemberProfile } from '../types/profile/profileTypes';
import { 
  ProfileService, 
  ACTIVE_PROFILE_CHANGED_EVENT, 
  PROFILES_UPDATED_EVENT 
} from '../services/profile/profileService';

interface ProfileContextType {
  activeProfile: FamilyMemberProfile;
  masterProfile: FamilyMemberProfile;
  allProfiles: FamilyMemberProfile[];
  refreshProfiles: () => void;
  updateActiveProfile: (id: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<FamilyMemberProfile>(() => ProfileService.getActiveProfile());
  const [masterProfile, setMasterProfile] = useState<FamilyMemberProfile>(() => ProfileService.getMasterProfile());
  const [allProfiles, setAllProfiles] = useState<FamilyMemberProfile[]>(() => ProfileService.getAllProfiles());

  const refreshProfiles = () => {
    setActiveProfile(ProfileService.getActiveProfile());
    setMasterProfile(ProfileService.getMasterProfile());
    setAllProfiles(ProfileService.getAllProfiles());
  };

  useEffect(() => {
    const handleSync = () => refreshProfiles();
    
    window.addEventListener(ACTIVE_PROFILE_CHANGED_EVENT, handleSync);
    window.addEventListener(PROFILES_UPDATED_EVENT, handleSync);
    
    return () => {
      window.removeEventListener(ACTIVE_PROFILE_CHANGED_EVENT, handleSync);
      window.removeEventListener(PROFILES_UPDATED_EVENT, handleSync);
    };
  }, []);

  const updateActiveProfile = (id: string) => {
    ProfileService.setActiveProfileId(id);
    // State will update via the event listener
  };

  return (
    <ProfileContext.Provider value={{ 
      activeProfile, 
      masterProfile, 
      allProfiles, 
      refreshProfiles, 
      updateActiveProfile 
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
