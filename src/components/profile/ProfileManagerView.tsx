/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PROFILE MANAGER VIEW
 * PHASE B: FAMILY PROFILE UI & APP INTEGRATION
 * 
 * Full management dashboard for Master Profile and Family Profiles.
 * Provides active switching, member editing, creation, and secure deletion.
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Shield, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  ArrowLeft, 
  Globe, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone,
  AlertTriangle
} from 'lucide-react';
import { FamilyMemberProfile } from '../../types/profile/profileTypes';
import { 
  ProfileService, 
  ACTIVE_PROFILE_CHANGED_EVENT, 
  PROFILES_UPDATED_EVENT 
} from '../../services/profile/profileService';
import { FamilyMemberFormModal, RELATION_LABELS } from './FamilyMemberFormModal';
import { useTranslation } from '../../i18n';
import { useProfile } from '../../context/ProfileContext';

interface ProfileManagerViewProps {
  navigate: (view: string) => void;
  showToast: (msg: string) => void;
  onOpenLanguageModal?: () => void;
}

export const ProfileManagerView: React.FC<ProfileManagerViewProps> = ({
  navigate,
  showToast,
  onOpenLanguageModal
}) => {
  const { t, currentLanguageInfo } = useTranslation();

  const { activeProfile, masterProfile, allProfiles, updateActiveProfile } = useProfile();
  const familyMembers = allProfiles.filter(p => !p.isMaster && p.id !== 'master');
  const activeProfileId = activeProfile.id;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FamilyMemberProfile | null>(null);
  const [isEditingMaster, setIsEditingMaster] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMemberProfile | null>(null);

  const handleSetActive = (id: string) => {
    updateActiveProfile(id);
    showToast('सक्रिय प्रोफ़ाइल सफलतापूर्वक बदली गई।');
  };

  const handleOpenAddMember = () => {
    setEditingProfile(null);
    setIsEditingMaster(false);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (profile: FamilyMemberProfile) => {
    setEditingProfile(profile);
    setIsEditingMaster(Boolean(profile.isMaster || profile.id === 'master'));
    setIsFormModalOpen(true);
  };

  const handleSaveProfile = (formData: Partial<FamilyMemberProfile>) => {
    if (isEditingMaster) {
      const res = ProfileService.saveMasterProfile(formData);
      if (res.success) {
        showToast('मुख्य प्रोफ़ाइल विवरण सफलतापूर्वक सहेजा गया।');
      } else {
        showToast(res.error || 'सहेजने में विफलता हुई।');
      }
    } else {
      const payload: Partial<FamilyMemberProfile> = {
        ...formData,
        id: editingProfile?.id
      };
      const res = ProfileService.saveFamilyMember(payload);
      if (res.success) {
        showToast(editingProfile ? 'सदस्य विवरण अद्यतन किया गया।' : 'नया सदस्य सफलतापूर्वक जोड़ा गया।');
      } else {
        showToast(res.error || 'सहेजने में विफलता हुई।');
      }
    }
  };

  const handleConfirmDelete = () => {
    if (!memberToDelete) return;
    const res = ProfileService.deleteFamilyMember(memberToDelete.id);
    if (res.success) {
      showToast(`'${memberToDelete.name}' को सफलतापूर्वक हटाया गया।`);
    } else {
      showToast(res.error || 'सदस्य हटाने में त्रुटि।');
    }
    setMemberToDelete(null);
  };

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/20 mb-6">
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-[#d4af37]/40 text-[#d4af37] text-sm font-semibold hover:bg-[#d4af37]/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>डैशबोर्ड</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-[#d4af37] tracking-wide">
          पारिवारिक प्रोफ़ाइल केंद्र
        </h1>

        <button
          onClick={handleOpenAddMember}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d4af37] text-black text-sm font-bold hover:bg-[#e6c250] transition-all shadow-[0_0_12px_rgba(212,175,55,0.4)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>सदस्य जोड़ें</span>
        </button>
      </div>

      {/* Section 1: Master Profile Card */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs uppercase tracking-widest font-bold text-[#d4af37] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#d4af37]" /> मुख्य प्रोफ़ाइल (Master Birth Profile)
          </span>
          <span className="text-[11px] text-gray-400">अपरिवर्तनीय मुख्य आईडी (master)</span>
        </div>

        <div className={`p-5 rounded-3xl border transition-all relative overflow-hidden backdrop-blur-md ${
          activeProfileId === 'master'
            ? 'bg-gradient-to-br from-[#072418] to-[#04150e] border-[#d4af37] shadow-[0_8px_30px_rgba(212,175,55,0.3)]'
            : 'bg-[#0a1510]/80 border-[#d4af37]/30'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-2xl font-bold text-white tracking-wide">{masterProfile.name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#d4af37]/25 text-[#fef08a] border border-[#d4af37]/50 font-bold">
                  {RELATION_LABELS.SELF.hi}
                </span>
                {activeProfileId === 'master' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> सक्रिय (Active)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm text-gray-300">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#d4af37]" />
                  <span>{masterProfile.dob}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#d4af37]" />
                  <span>{masterProfile.time}</span>
                </p>
                <p className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-[#d4af37]" />
                  <span>{masterProfile.place}</span>
                </p>
                {masterProfile.mobileNumber && (
                  <p className="flex items-center gap-2 sm:col-span-2">
                    <Phone className="w-4 h-4 text-[#d4af37]" />
                    <span>{masterProfile.mobileNumber}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => handleOpenEdit(masterProfile)}
                className="w-9 h-9 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/30 transition-all cursor-pointer"
                title="मुख्य प्रोफ़ाइल संपादित करें"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              {activeProfileId !== 'master' && (
                <button
                  onClick={() => handleSetActive('master')}
                  className="px-3 py-1.5 rounded-full bg-[#d4af37] text-black text-xs font-bold hover:bg-[#e6c250] transition-all cursor-pointer"
                >
                  सक्रिय करें
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Family Members List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs uppercase tracking-widest font-bold text-[#d4af37] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#d4af37]" /> पारिवारिक सदस्य ({familyMembers.length})
          </span>
          <button
            onClick={handleOpenAddMember}
            className="text-xs text-[#d4af37] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> सदस्य जोड़ें
          </button>
        </div>

        {familyMembers.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#0a1510]/50 border border-dashed border-[#d4af37]/30 text-center">
            <Users className="w-10 h-10 text-[#d4af37]/50 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">कोई पारिवारिक सदस्य नहीं जुड़ा है</h4>
            <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">
              जीवनसाथी, संतान, माता-पिता या अन्य संबंधियों की कुंडली और अंकशास्त्र देखने के लिए उन्हें जोड़ें।
            </p>
            <button
              onClick={handleOpenAddMember}
              className="px-5 py-2.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] text-xs font-bold hover:bg-[#d4af37]/30 transition-all cursor-pointer"
            >
              + प्रथम पारिवारिक सदस्य जोड़ें
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {familyMembers.map(member => {
              const isActive = activeProfileId === member.id;
              const relText = RELATION_LABELS[member.relationship]?.hi || member.relationship;

              return (
                <div 
                  key={member.id}
                  className={`p-4 rounded-2xl border transition-all backdrop-blur-md ${
                    isActive
                      ? 'bg-gradient-to-br from-[#072418] to-[#04150e] border-[#d4af37] shadow-[0_4px_20px_rgba(212,175,55,0.25)]'
                      : 'bg-[#0a1510]/70 border-white/10 hover:border-[#d4af37]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-bold text-white">{member.name}</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/30 font-semibold">
                          {relText}
                        </span>
                        {isActive && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> सक्रिय
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 text-xs text-gray-300">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{member.dob}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{member.time}</span>
                        </p>
                        <p className="flex items-center gap-1.5 sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{member.place}</span>
                        </p>
                        {member.mobileNumber && (
                          <p className="flex items-center gap-1.5 sm:col-span-2">
                            <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                            <span>{member.mobileNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isActive && (
                        <button
                          onClick={() => handleSetActive(member.id)}
                          className="px-3 py-1.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/60 text-[#d4af37] text-xs font-bold hover:bg-[#d4af37] hover:text-black transition-all cursor-pointer"
                        >
                          सक्रिय करें
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all cursor-pointer"
                        title="संपादित करें"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setMemberToDelete(member)}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-400/40 transition-all cursor-pointer"
                        title="हटाएँ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Language Switcher Section (Preserved from legacy profile view) */}
      {onOpenLanguageModal && (
        <div className="p-4 rounded-2xl bg-black/40 border border-[#d4af37]/30 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#d4af37]" />
            <div>
              <p className="text-xs text-gray-400">{t('settings.languageSelection')}</p>
              <p className="text-sm font-bold text-white">{currentLanguageInfo.nativeName} ({currentLanguageInfo.name})</p>
            </div>
          </div>
          <button
            onClick={onOpenLanguageModal}
            className="px-4 py-2 rounded-full border border-[#d4af37] text-[#d4af37] text-xs font-bold hover:bg-[#d4af37]/15 transition-all cursor-pointer"
          >
            {t('settings.switchLanguage')}
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <FamilyMemberFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveProfile}
        initialProfile={editingProfile}
        isMaster={isEditingMaster}
      />

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#04120c] border border-red-500/50 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">सदस्य हटाने की पुष्टि</h3>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed">
              क्या आप सचमुच <strong>'{memberToDelete.name}'</strong> को परिवार सूची से हटाना चाहते हैं?
              {memberToDelete.id === activeProfileId && (
                <span className="block mt-2 text-[#d4af37] font-semibold">
                  (यह वर्तमान में सक्रिय सदस्य है। इसे हटाने पर सक्रिय प्रोफ़ाइल स्वतः मुख्य प्रोफ़ाइल पर रीसेट हो जाएगी।)
                </span>
              )}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white text-xs cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg cursor-pointer"
              >
                हटाएँ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManagerView;
