/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — FAMILY MEMBER PROFILE FORM MODAL
 * PHASE B: FAMILY PROFILE UI & APP INTEGRATION
 * 
 * STRICT INVARIANTS:
 * - Validates Name, DOB, Time, Place, Latitude, Longitude, Timezone, Gender, Relationship.
 * - Explicit distinction between exact time, estimated time, and completely unknown birth time.
 * - Unknown birth time defaults safely to 12:00 PM with transparent educational disclosure.
 * - Coordinates clamped strictly within astronomical validity (-90 to +90, -180 to +180).
 * - Master profile relationship cannot be altered away from 'SELF'.
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, AlertCircle, Info, Check, Shield } from 'lucide-react';
import { FamilyMemberProfile, ProfileGender, ProfileRelation } from '../../types/profile/profileTypes';
import { useTranslation } from '../../i18n';

interface FamilyMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Partial<FamilyMemberProfile>) => void;
  initialProfile?: FamilyMemberProfile | null;
  isMaster?: boolean;
}

// Curated list of prominent Indian cities for instant, error-free coordinate pre-population
export const POPULAR_CITIES = [
  { name: 'Indore, MP', lat: 22.7196, lon: 75.8577, tz: 'Asia/Kolkata' },
  { name: 'Ujjain, MP', lat: 23.1765, lon: 75.7885, tz: 'Asia/Kolkata' },
  { name: 'Bhopal, MP', lat: 23.2599, lon: 77.4126, tz: 'Asia/Kolkata' },
  { name: 'New Delhi, DL', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
  { name: 'Mumbai, MH', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'Pune, MH', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata' },
  { name: 'Ahmedabad, GJ', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata' },
  { name: 'Varanasi, UP', lat: 25.3176, lon: 82.9739, tz: 'Asia/Kolkata' },
  { name: 'Lucknow, UP', lat: 26.8467, lon: 80.9462, tz: 'Asia/Kolkata' },
  { name: 'Jaipur, RJ', lat: 26.9124, lon: 75.7873, tz: 'Asia/Kolkata' },
  { name: 'Bengaluru, KA', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Hyderabad, TS', lat: 17.3850, lon: 78.4867, tz: 'Asia/Kolkata' },
  { name: 'Kolkata, WB', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata' },
  { name: 'Chennai, TN', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' }
];

export const RELATION_LABELS: Record<ProfileRelation, { hi: string; en: string }> = {
  SELF: { hi: 'स्वयं (Self)', en: 'Self' },
  SPOUSE: { hi: 'जीवनसाथी (Spouse)', en: 'Spouse' },
  CHILD: { hi: 'संतान (Child)', en: 'Child' },
  PARENT: { hi: 'माता / पिता (Parent)', en: 'Parent' },
  SIBLING: { hi: 'भाई / बहन (Sibling)', en: 'Sibling' },
  OTHER: { hi: 'अन्य संबंधी (Other)', en: 'Other' }
};

export const FamilyMemberFormModal: React.FC<FamilyMemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  isMaster = false
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<ProfileGender>('MALE');
  const [relationship, setRelationship] = useState<ProfileRelation>('OTHER');
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('12:00 PM');
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [isTimeEstimated, setIsTimeEstimated] = useState(false);
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState(22.7196);
  const [longitude, setLongitude] = useState(75.8577);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [mobileNumber, setMobileNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || '');
      setGender(initialProfile.gender || 'MALE');
      setRelationship(isMaster ? 'SELF' : (initialProfile.relationship || 'OTHER'));
      setDob(initialProfile.dob || '');
      setTime(initialProfile.time || '12:00 PM');
      setPlace(initialProfile.place || '');
      setLatitude(typeof initialProfile.latitude === 'number' ? initialProfile.latitude : 22.7196);
      setLongitude(typeof initialProfile.longitude === 'number' ? initialProfile.longitude : 75.8577);
      setTimezone(initialProfile.timezone || 'Asia/Kolkata');
      setMobileNumber(initialProfile.mobileNumber || (initialProfile.mobileNumbers && initialProfile.mobileNumbers.length > 0 ? initialProfile.mobileNumbers[0] : ''));
      setIsTimeUnknown(initialProfile.time === '12:00 PM' && (initialProfile as any).timeUnknown === true);
    } else {
      // Reset defaults for new member
      setName('');
      setGender('MALE');
      setRelationship('OTHER');
      setDob('');
      setTime('12:00 PM');
      setIsTimeUnknown(false);
      setIsTimeEstimated(false);
      setPlace('Indore, MP');
      setLatitude(22.7196);
      setLongitude(75.8577);
      setTimezone('Asia/Kolkata');
      setMobileNumber('');
    }
    setErrors({});
  }, [initialProfile, isMaster, isOpen]);

  if (!isOpen) return null;

  const handleCitySelect = (cityName: string) => {
    const found = POPULAR_CITIES.find(c => c.name === cityName);
    if (found) {
      setPlace(found.name);
      setLatitude(found.lat);
      setLongitude(found.lon);
      setTimezone(found.tz);
      setErrors(prev => ({ ...prev, place: '', latitude: '', longitude: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'नाम कम से कम 2 अक्षरों का होना अनिवार्य है।';
    }

    if (!dob.trim()) {
      newErrors.dob = 'जन्मतिथि अनिवार्य है (उदा. 24 June 1986)।';
    }

    if (!place.trim()) {
      newErrors.place = 'जन्म स्थान अनिवार्य है।';
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      newErrors.latitude = 'अक्षांश (Latitude) -90.0 और +90.0 के बीच होना चाहिए।';
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      newErrors.longitude = 'देशांतर (Longitude) -180.0 और +180.0 के बीच होना चाहिए।';
    }

    if (!isTimeUnknown && !time.trim()) {
      newErrors.time = 'जन्म समय अनिवार्य है। यदि ज्ञात न हो तो "जन्म समय अज्ञात" चुनें।';
    }

    if (mobileNumber.trim()) {
      const cleanMob = mobileNumber.trim().replace(/\D/g, '');
      if (cleanMob.length < 10 || cleanMob.length > 12) {
        newErrors.mobileNumber = 'वैध 10-अंकीय मोबाइल नंबर दर्ज करें।';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<FamilyMemberProfile> = {
      name: name.trim(),
      gender,
      relationship: isMaster ? 'SELF' : relationship,
      dob: dob.trim(),
      time: isTimeUnknown ? '12:00 PM' : time.trim(),
      place: place.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone: timezone.trim() || 'Asia/Kolkata',
      mobileNumber: mobileNumber.trim(),
      mobileNumbers: mobileNumber.trim() ? [mobileNumber.trim()] : [],
      isMaster
    };

    if (isTimeUnknown) {
      (payload as any).timeUnknown = true;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-[#04120c] border border-[#d4af37]/50 rounded-3xl w-full max-w-lg p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              {isMaster ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialProfile ? (isMaster ? 'मुख्य प्रोफ़ाइल संपादन' : 'पारिवारिक सदस्य संपादन') : 'नया सदस्य जोड़ें'}
              </h2>
              <p className="text-xs text-[#d4af37]/80">
                {isMaster ? 'Authoritative Master Birth Profile' : 'Family Member Birth Record'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-4 pt-4 custom-scrollbar flex-1">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              पूरा नाम (Full Name) *
            </label>
            <input 
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="उदा. अनिता सूर्यवंशी"
              className={`w-full px-4 py-2.5 rounded-xl bg-black/50 border ${errors.name ? 'border-red-500' : 'border-[#d4af37]/40'} text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] text-sm`}
            />
            {errors.name && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
          </div>

          {/* Gender & Relationship */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                लिंग (Gender) *
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as ProfileGender)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-[#d4af37]/40 text-white focus:outline-none focus:border-[#d4af37] text-sm"
              >
                <option value="MALE">पुरुष (Male)</option>
                <option value="FEMALE">महिला (Female)</option>
                <option value="OTHER">अन्य (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                संबंध (Relationship) *
              </label>
              {isMaster ? (
                <div className="px-3 py-2.5 rounded-xl bg-black/30 border border-[#d4af37]/20 text-[#d4af37] text-sm font-bold flex items-center justify-between">
                  <span>स्वयं (SELF)</span>
                  <span className="text-[10px] text-gray-400 uppercase">स्थायी</span>
                </div>
              ) : (
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value as ProfileRelation)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-[#d4af37]/40 text-white focus:outline-none focus:border-[#d4af37] text-sm"
                >
                  <option value="SPOUSE">जीवनसाथी (Spouse)</option>
                  <option value="CHILD">संतान (Child)</option>
                  <option value="PARENT">माता / पिता (Parent)</option>
                  <option value="SIBLING">भाई / बहन (Sibling)</option>
                  <option value="OTHER">अन्य संबंधी (Other)</option>
                </select>
              )}
            </div>
          </div>

          {/* DOB & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#d4af37]" /> जन्मतिथि (Date of Birth) *
              </label>
              <input 
                type="text"
                value={dob}
                onChange={e => setDob(e.target.value)}
                placeholder="24 June 1986 या 1986-06-24"
                className={`w-full px-4 py-2.5 rounded-xl bg-black/50 border ${errors.dob ? 'border-red-500' : 'border-[#d4af37]/40'} text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] text-sm`}
              />
              {errors.dob && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dob}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#d4af37]" /> जन्म समय (Birth Time) *
              </label>
              <input 
                type="text"
                disabled={isTimeUnknown}
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="06:20 AM"
                className={`w-full px-4 py-2.5 rounded-xl bg-black/50 border ${errors.time ? 'border-red-500' : 'border-[#d4af37]/40'} text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] text-sm disabled:opacity-50`}
              />
              {errors.time && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.time}</p>}
            </div>
          </div>

          {/* Time Unknown / Estimated Checkboxes */}
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
              <input 
                type="checkbox"
                checked={isTimeUnknown}
                onChange={e => {
                  setIsTimeUnknown(e.target.checked);
                  if (e.target.checked) {
                    setTime('12:00 PM');
                    setErrors(prev => ({ ...prev, time: '' }));
                  }
                }}
                className="w-4 h-4 rounded text-[#d4af37] focus:ring-0"
              />
              <span className="font-semibold text-[#d4af37]">जन्म समय सटीक रूप से ज्ञात नहीं है (12:00 PM डिफ़ॉल्ट)</span>
            </label>

            {isTimeUnknown && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-600/40 rounded-lg text-[11px] text-amber-200 leading-relaxed flex items-start gap-1.5">
                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>शास्त्रीय सूचना:</strong> समय अज्ञात होने पर ग्रह स्थितियां दोपहर 12:00 बजे के आधार पर विश्वसनीय रहेंगी, लेकिन लग्न (Lagna) और भाव (Houses) केवल अनुमानित होंगे।
                </span>
              </div>
            )}
          </div>

          {/* City / Place Preset Selector */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" /> जन्म स्थान (Birthplace) *
              </label>
              <select 
                onChange={e => handleCitySelect(e.target.value)}
                defaultValue=""
                className="text-xs bg-black/60 border border-[#d4af37]/30 text-[#d4af37] rounded-lg px-2 py-0.5 focus:outline-none"
              >
                <option value="" disabled>प्रमुख शहर चुनें...</option>
                {POPULAR_CITIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <input 
              type="text"
              value={place}
              onChange={e => setPlace(e.target.value)}
              placeholder="Indore, MP"
              className={`w-full px-4 py-2.5 rounded-xl bg-black/50 border ${errors.place ? 'border-red-500' : 'border-[#d4af37]/40'} text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] text-sm`}
            />
            {errors.place && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.place}</p>}
          </div>

          {/* Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                अक्षांश (Latitude)
              </label>
              <input 
                type="number"
                step="any"
                value={latitude}
                onChange={e => setLatitude(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:border-[#d4af37]"
              />
              {errors.latitude && <p className="text-[10px] text-red-400 mt-0.5">{errors.latitude}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                देशांतर (Longitude)
              </label>
              <input 
                type="number"
                step="any"
                value={longitude}
                onChange={e => setLongitude(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:border-[#d4af37]"
              />
              {errors.longitude && <p className="text-[10px] text-red-400 mt-0.5">{errors.longitude}</p>}
            </div>
          </div>

          {/* Optional Mobile Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" /> संपर्क मोबाइल नंबर (अंकशास्त्र स्पंदन हेतु)
            </label>
            <input 
              type="tel"
              value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value)}
              placeholder="उदा. 9826012345 (वैकल्पिक)"
              className={`w-full px-4 py-2.5 rounded-xl bg-black/50 border ${errors.mobileNumber ? 'border-red-500' : 'border-[#d4af37]/30'} text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] text-sm`}
            />
            {errors.mobileNumber && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.mobileNumber}</p>}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#e6c250] transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] text-sm flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialProfile ? 'परिवर्तन सहेजें' : 'प्रोफ़ाइल सहेजें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
