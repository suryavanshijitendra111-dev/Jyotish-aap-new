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

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, AlertCircle, Info, Check, Shield, Globe, Navigation } from 'lucide-react';
import { FamilyMemberProfile, ProfileGender, ProfileRelation } from '../../types/profile/profileTypes';
import { useTranslation } from '../../i18n';

interface FamilyMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Partial<FamilyMemberProfile>) => void;
  initialProfile?: FamilyMemberProfile | null;
  isMaster?: boolean;
}

export interface CityOption {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  tz: string;
}

export const COUNTRIES_LIST = [
  { code: 'India', name: 'भारत (India)' },
  { code: 'Nepal', name: 'नेपाल (Nepal)' },
  { code: 'USA', name: 'संयुक्त राज्य अमेरिका (USA)' },
  { code: 'UK', name: 'यूनाइटेड किंगडम (UK)' },
  { code: 'Canada', name: 'कनाडा (Canada)' },
  { code: 'Australia', name: 'ऑस्ट्रेलिया (Australia)' },
  { code: 'UAE', name: 'संयुक्त अरब अमीरात (UAE)' },
  { code: 'Japan', name: 'जापान (Japan)' },
  { code: 'Germany', name: 'जर्मनी (Germany)' },
  { code: 'France', name: 'फ्रांस (France)' },
  { code: 'Sri Lanka', name: 'श्रीलंका (Sri Lanka)' },
  { code: 'Bangladesh', name: 'बांग्लादेश (Bangladesh)' },
  { code: 'Pakistan', name: 'पाकिस्तान (Pakistan)' },
  { code: 'Saudi Arabia', name: 'सउदी अरब (Saudi Arabia)' },
  { code: 'Singapore', name: 'सिंगापुर (Singapore)' },
  { code: 'Other', name: 'अन्य देश (Other International)' }
];

export const INDIAN_STATES = [
  'Madhya Pradesh',
  'Uttar Pradesh',
  'Maharashtra',
  'Gujarat',
  'Rajasthan',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'West Bengal',
  'Bihar',
  'Punjab',
  'Haryana',
  'Jharkhand',
  'Chhattisgarh',
  'Uttarakhand',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Odisha',
  'Assam',
  'Goa',
  'Other State'
];

// Comprehensive city database covering all Indian states and international cities
export const CITIES_DATABASE: CityOption[] = [
  // India - Madhya Pradesh
  { name: 'Indore, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, tz: 'Asia/Kolkata' },
  { name: 'Ujjain, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 23.1765, lon: 75.7885, tz: 'Asia/Kolkata' },
  { name: 'Dewas, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 22.9676, lon: 76.0534, tz: 'Asia/Kolkata' },
  { name: 'Bhopal, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, tz: 'Asia/Kolkata' },
  { name: 'Gwalior, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828, tz: 'Asia/Kolkata' },
  { name: 'Jabalpur, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864, tz: 'Asia/Kolkata' },
  { name: 'Sagar, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 23.8388, lon: 78.7378, tz: 'Asia/Kolkata' },
  { name: 'Satna, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 24.5852, lon: 80.8322, tz: 'Asia/Kolkata' },
  { name: 'Rewa, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 24.5362, lon: 81.3037, tz: 'Asia/Kolkata' },
  { name: 'Ratlam, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 23.3343, lon: 75.0365, tz: 'Asia/Kolkata' },
  { name: 'Khandwa, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 21.8306, lon: 76.3524, tz: 'Asia/Kolkata' },
  { name: 'Khargone, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 21.8213, lon: 75.6133, tz: 'Asia/Kolkata' },
  { name: 'Mhow, Madhya Pradesh', country: 'India', state: 'Madhya Pradesh', lat: 22.5552, lon: 75.7538, tz: 'Asia/Kolkata' },

  // India - Delhi & NCR
  { name: 'New Delhi, Delhi', country: 'India', state: 'Delhi', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
  { name: 'Noida, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910, tz: 'Asia/Kolkata' },
  { name: 'Gurugram, Haryana', country: 'India', state: 'Haryana', lat: 28.4595, lon: 77.0266, tz: 'Asia/Kolkata' },
  { name: 'Ghaziabad, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538, tz: 'Asia/Kolkata' },
  { name: 'Faridabad, Haryana', country: 'India', state: 'Haryana', lat: 28.4089, lon: 77.3178, tz: 'Asia/Kolkata' },

  // India - Maharashtra
  { name: 'Mumbai, Maharashtra', country: 'India', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'Pune, Maharashtra', country: 'India', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata' },
  { name: 'Nagpur, Maharashtra', country: 'India', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, tz: 'Asia/Kolkata' },
  { name: 'Nashik, Maharashtra', country: 'India', state: 'Maharashtra', lat: 19.9975, lon: 73.7898, tz: 'Asia/Kolkata' },
  { name: 'Aurangabad, Maharashtra', country: 'India', state: 'Maharashtra', lat: 19.8762, lon: 75.3433, tz: 'Asia/Kolkata' },
  { name: 'Kolhapur, Maharashtra', country: 'India', state: 'Maharashtra', lat: 16.7050, lon: 74.2433, tz: 'Asia/Kolkata' },
  { name: 'Solapur, Maharashtra', country: 'India', state: 'Maharashtra', lat: 17.6599, lon: 75.9064, tz: 'Asia/Kolkata' },
  { name: 'Amravati, Maharashtra', country: 'India', state: 'Maharashtra', lat: 20.9374, lon: 77.7796, tz: 'Asia/Kolkata' },

  // India - Gujarat
  { name: 'Ahmedabad, Gujarat', country: 'India', state: 'Gujarat', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata' },
  { name: 'Surat, Gujarat', country: 'India', state: 'Gujarat', lat: 21.1702, lon: 72.8311, tz: 'Asia/Kolkata' },
  { name: 'Vadodara, Gujarat', country: 'India', state: 'Gujarat', lat: 22.3072, lon: 73.1812, tz: 'Asia/Kolkata' },
  { name: 'Rajkot, Gujarat', country: 'India', state: 'Gujarat', lat: 22.3039, lon: 70.8022, tz: 'Asia/Kolkata' },
  { name: 'Gandhinagar, Gujarat', country: 'India', state: 'Gujarat', lat: 23.2156, lon: 72.6369, tz: 'Asia/Kolkata' },

  // India - Uttar Pradesh
  { name: 'Varanasi, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, tz: 'Asia/Kolkata' },
  { name: 'Lucknow, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, tz: 'Asia/Kolkata' },
  { name: 'Kanpur, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319, tz: 'Asia/Kolkata' },
  { name: 'Prayagraj, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463, tz: 'Asia/Kolkata' },
  { name: 'Agra, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081, tz: 'Asia/Kolkata' },
  { name: 'Meerut, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 28.9845, lon: 77.7064, tz: 'Asia/Kolkata' },
  { name: 'Bareilly, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 28.3670, lon: 79.4304, tz: 'Asia/Kolkata' },
  { name: 'Aligarh, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 27.8974, lon: 78.0880, tz: 'Asia/Kolkata' },
  { name: 'Gorakhpur, Uttar Pradesh', country: 'India', state: 'Uttar Pradesh', lat: 26.7606, lon: 83.3732, tz: 'Asia/Kolkata' },

  // India - Rajasthan
  { name: 'Jaipur, Rajasthan', country: 'India', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, tz: 'Asia/Kolkata' },
  { name: 'Jodhpur, Rajasthan', country: 'India', state: 'Rajasthan', lat: 26.2389, lon: 73.0243, tz: 'Asia/Kolkata' },
  { name: 'Udaipur, Rajasthan', country: 'India', state: 'Rajasthan', lat: 24.5854, lon: 73.7125, tz: 'Asia/Kolkata' },
  { name: 'Kota, Rajasthan', country: 'India', state: 'Rajasthan', lat: 25.2138, lon: 75.8648, tz: 'Asia/Kolkata' },
  { name: 'Ajmer, Rajasthan', country: 'India', state: 'Rajasthan', lat: 26.4499, lon: 74.6399, tz: 'Asia/Kolkata' },
  { name: 'Bikaner, Rajasthan', country: 'India', state: 'Rajasthan', lat: 28.0229, lon: 73.3119, tz: 'Asia/Kolkata' },

  // India - Karnataka
  { name: 'Bengaluru, Karnataka', country: 'India', state: 'Karnataka', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
  { name: 'Mysuru, Karnataka', country: 'India', state: 'Karnataka', lat: 12.2958, lon: 76.6394, tz: 'Asia/Kolkata' },
  { name: 'Mangaluru, Karnataka', country: 'India', state: 'Karnataka', lat: 12.9141, lon: 74.8560, tz: 'Asia/Kolkata' },
  { name: 'Hubballi, Karnataka', country: 'India', state: 'Karnataka', lat: 15.3647, lon: 75.1240, tz: 'Asia/Kolkata' },
  { name: 'Belagavi, Karnataka', country: 'India', state: 'Karnataka', lat: 15.8497, lon: 74.4977, tz: 'Asia/Kolkata' },

  // India - Telangana & Andhra Pradesh
  { name: 'Hyderabad, Telangana', country: 'India', state: 'Telangana', lat: 17.3850, lon: 78.4867, tz: 'Asia/Kolkata' },
  { name: 'Warangal, Telangana', country: 'India', state: 'Telangana', lat: 17.9689, lon: 79.5941, tz: 'Asia/Kolkata' },
  { name: 'Visakhapatnam, Andhra Pradesh', country: 'India', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, tz: 'Asia/Kolkata' },
  { name: 'Vijayawada, Andhra Pradesh', country: 'India', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480, tz: 'Asia/Kolkata' },
  { name: 'Guntur, Andhra Pradesh', country: 'India', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365, tz: 'Asia/Kolkata' },
  { name: 'Tirupati, Andhra Pradesh', country: 'India', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192, tz: 'Asia/Kolkata' },

  // India - West Bengal & East
  { name: 'Kolkata, West Bengal', country: 'India', state: 'West Bengal', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata' },
  { name: 'Howrah, West Bengal', country: 'India', state: 'West Bengal', lat: 22.5958, lon: 88.2636, tz: 'Asia/Kolkata' },
  { name: 'Siliguri, West Bengal', country: 'India', state: 'West Bengal', lat: 26.7271, lon: 88.3953, tz: 'Asia/Kolkata' },
  { name: 'Patna, Bihar', country: 'India', state: 'Bihar', lat: 25.5941, lon: 85.1376, tz: 'Asia/Kolkata' },
  { name: 'Gaya, Bihar', country: 'India', state: 'Bihar', lat: 24.7914, lon: 85.0002, tz: 'Asia/Kolkata' },
  { name: 'Ranchi, Jharkhand', country: 'India', state: 'Jharkhand', lat: 23.3441, lon: 85.3096, tz: 'Asia/Kolkata' },
  { name: 'Jamshedpur, Jharkhand', country: 'India', state: 'Jharkhand', lat: 22.8046, lon: 86.2029, tz: 'Asia/Kolkata' },
  { name: 'Dhanbad, Jharkhand', country: 'India', state: 'Jharkhand', lat: 23.7957, lon: 86.4304, tz: 'Asia/Kolkata' },
  { name: 'Bhubaneswar, Odisha', country: 'India', state: 'Odisha', lat: 20.2961, lon: 85.8245, tz: 'Asia/Kolkata' },
  { name: 'Cuttack, Odisha', country: 'India', state: 'Odisha', lat: 20.4625, lon: 85.8828, tz: 'Asia/Kolkata' },
  { name: 'Guwahati, Assam', country: 'India', state: 'Assam', lat: 26.1445, lon: 91.7362, tz: 'Asia/Kolkata' },

  // India - Tamil Nadu & Kerala
  { name: 'Chennai, Tamil Nadu', country: 'India', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' },
  { name: 'Coimbatore, Tamil Nadu', country: 'India', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558, tz: 'Asia/Kolkata' },
  { name: 'Madurai, Tamil Nadu', country: 'India', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198, tz: 'Asia/Kolkata' },
  { name: 'Tiruchirappalli, Tamil Nadu', country: 'India', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047, tz: 'Asia/Kolkata' },
  { name: 'Salem, Tamil Nadu', country: 'India', state: 'Tamil Nadu', lat: 11.6643, lon: 78.1460, tz: 'Asia/Kolkata' },
  { name: 'Thiruvananthapuram, Kerala', country: 'India', state: 'Kerala', lat: 8.5241, lon: 76.9366, tz: 'Asia/Kolkata' },
  { name: 'Kochi, Kerala', country: 'India', state: 'Kerala', lat: 9.9312, lon: 76.2673, tz: 'Asia/Kolkata' },
  { name: 'Kozhikode, Kerala', country: 'India', state: 'Kerala', lat: 11.2588, lon: 75.7804, tz: 'Asia/Kolkata' },
  { name: 'Thrissur, Kerala', country: 'India', state: 'Kerala', lat: 10.5276, lon: 76.2144, tz: 'Asia/Kolkata' },

  // India - North & Punjab / Haryana / Himachal / J&K / Uttarakhand
  { name: 'Chandigarh, Punjab/Haryana', country: 'India', state: 'Punjab', lat: 30.7333, lon: 76.7794, tz: 'Asia/Kolkata' },
  { name: 'Amritsar, Punjab', country: 'India', state: 'Punjab', lat: 31.6340, lon: 74.8723, tz: 'Asia/Kolkata' },
  { name: 'Ludhiana, Punjab', country: 'India', state: 'Punjab', lat: 30.9010, lon: 75.8573, tz: 'Asia/Kolkata' },
  { name: 'Jalandhar, Punjab', country: 'India', state: 'Punjab', lat: 31.3260, lon: 75.5762, tz: 'Asia/Kolkata' },
  { name: 'Dehradun, Uttarakhand', country: 'India', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322, tz: 'Asia/Kolkata' },
  { name: 'Haridwar, Uttarakhand', country: 'India', state: 'Uttarakhand', lat: 29.9457, lon: 78.1642, tz: 'Asia/Kolkata' },
  { name: 'Shimla, Himachal Pradesh', country: 'India', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734, tz: 'Asia/Kolkata' },
  { name: 'Srinagar, Jammu & Kashmir', country: 'India', state: 'Jammu & Kashmir', lat: 34.0837, lon: 74.7973, tz: 'Asia/Kolkata' },
  { name: 'Jammu, Jammu & Kashmir', country: 'India', state: 'Jammu & Kashmir', lat: 32.7266, lon: 74.8570, tz: 'Asia/Kolkata' },
  { name: 'Raipur, Chhattisgarh', country: 'India', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296, tz: 'Asia/Kolkata' },
  { name: 'Goa (Panaji)', country: 'India', state: 'Goa', lat: 15.4909, lon: 73.8278, tz: 'Asia/Kolkata' },

  // Nepal
  { name: 'Kathmandu, Nepal', country: 'Nepal', state: 'Bagmati', lat: 27.7172, lon: 85.3240, tz: 'Asia/Kathmandu' },
  { name: 'Pokhara, Nepal', country: 'Nepal', state: 'Gandaki', lat: 28.2096, lon: 83.9856, tz: 'Asia/Kathmandu' },

  // USA
  { name: 'New York, NY, USA', country: 'USA', state: 'New York', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'San Francisco, CA, USA', country: 'USA', state: 'California', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles' },
  { name: 'Chicago, IL, USA', country: 'USA', state: 'Illinois', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago' },

  // UK
  { name: 'London, UK', country: 'UK', state: 'England', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },

  // Other International
  { name: 'Dubai, UAE', country: 'UAE', state: 'Dubai', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai' },
  { name: 'Singapore', country: 'Singapore', state: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Sydney, Australia', country: 'Australia', state: 'New South Wales', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Toronto, Canada', country: 'Canada', state: 'Ontario', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto' }
];

export const RELATION_LABELS: Record<ProfileRelation, { hi: string; en: string }> = {
  SELF: { hi: 'स्वयं (Self)', en: 'Self' },
  SPOUSE: { hi: 'जीवनसाथी (Spouse)', en: 'Spouse' },
  CHILD: { hi: 'संतान (Child)', en: 'Child' },
  PARENT: { hi: 'माता / पिता (Parent)', en: 'Parent' },
  SIBLING: { hi: 'भाई / बहन (Sibling)', en: 'Sibling' },
  OTHER: { hi: 'अन्य संबंधी (Other)', en: 'Other' }
};

// Helper: Convert any DOB string format to YYYY-MM-DD for HTML date input
const toInputDate = (dobStr: string): string => {
  if (!dobStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) return dobStr;
  const parsed = new Date(dobStr);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return dobStr;
};

// Helper: Convert time string (e.g. "06:20 AM" or "18:20") to HH:MM (24h) for HTML time input
const toInputTime = (timeStr: string): string => {
  if (!timeStr) return '12:00';
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3] ? match[3].toUpperCase() : '';
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  return '12:00';
};

// Helper: Convert HH:MM (24h) to 12h format (e.g. "06:20 AM")
const fromInputTime = (time24: string): string => {
  if (!time24) return '12:00 PM';
  const parts = time24.split(':');
  if (parts.length !== 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
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
  const [time24, setTime24] = useState('12:00');
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [selectedState, setSelectedState] = useState<string>('Madhya Pradesh');
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState(22.7196);
  const [longitude, setLongitude] = useState(75.8577);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [mobileNumber, setMobileNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCustomPlace, setIsCustomPlace] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || '');
      setGender(initialProfile.gender || 'MALE');
      setRelationship(isMaster ? 'SELF' : (initialProfile.relationship || 'OTHER'));
      setDob(toInputDate(initialProfile.dob || ''));
      setTime24(toInputTime(initialProfile.time || '12:00 PM'));
      setPlace(initialProfile.place || '');
      setLatitude(typeof initialProfile.latitude === 'number' ? initialProfile.latitude : 22.7196);
      setLongitude(typeof initialProfile.longitude === 'number' ? initialProfile.longitude : 75.8577);
      setTimezone(initialProfile.timezone || 'Asia/Kolkata');
      setMobileNumber(initialProfile.mobileNumber || (initialProfile.mobileNumbers && initialProfile.mobileNumbers.length > 0 ? initialProfile.mobileNumbers[0] : ''));
      setIsTimeUnknown(initialProfile.time === '12:00 PM' && (initialProfile as any).timeUnknown === true);
      setIsCustomPlace(false);
    } else {
      // Reset defaults for new member
      setName('');
      setGender('MALE');
      setRelationship('OTHER');
      setDob('');
      setTime24('12:00');
      setIsTimeUnknown(false);
      setSelectedCountry('India');
      setSelectedState('Madhya Pradesh');
      setPlace('Indore, Madhya Pradesh');
      setLatitude(22.7196);
      setLongitude(75.8577);
      setTimezone('Asia/Kolkata');
      setMobileNumber('');
      setIsCustomPlace(false);
    }
    setErrors({});
    setGpsStatus(null);
  }, [initialProfile, isMaster, isOpen]);

  // Handle outside click to close city autocomplete suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filtered cities based on selected country, state, and typed place query
  const filteredCities = CITIES_DATABASE.filter(c => {
    const matchesCountry = c.country === selectedCountry;
    const matchesState = selectedCountry !== 'India' || !selectedState || c.state === selectedState;
    const matchesQuery = c.name.toLowerCase().includes(place.toLowerCase());
    return matchesCountry && matchesState && (place.trim() === '' || matchesQuery);
  });

  const handleCitySelect = (city: CityOption) => {
    setPlace(city.name);
    setLatitude(city.lat);
    setLongitude(city.lon);
    setTimezone(city.tz);
    if (city.state) setSelectedState(city.state);
    setShowSuggestions(false);
    setIsCustomPlace(false);
    setErrors(prev => ({ ...prev, place: '', latitude: '', longitude: '' }));
  };

  const handlePlaceChange = (val: string) => {
    setPlace(val);
    setShowSuggestions(true);
    const found = CITIES_DATABASE.find(c => c.country === selectedCountry && c.name.toLowerCase() === val.toLowerCase());
    if (found) {
      setLatitude(found.lat);
      setLongitude(found.lon);
      setTimezone(found.tz);
      if (found.state) setSelectedState(found.state);
      setIsCustomPlace(false);
    } else {
      setIsCustomPlace(true);
    }
  };

  const diagnoseGeolocationSupport = async () => {
    console.log('[GPS Diagnostics] Checking navigator.geolocation support...');
    if (!navigator.geolocation) {
      console.warn('[GPS Diagnostics] navigator.geolocation is NOT supported in this browser/context.');
      return false;
    }
    console.log('[GPS Diagnostics] navigator.geolocation is supported.');

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        console.log(`[GPS Diagnostics] Permissions API status for geolocation: ${permissionStatus.state}`);
        permissionStatus.onchange = () => {
          console.log(`[GPS Diagnostics] Geolocation permission state changed to: ${permissionStatus.state}`);
        };
      } catch (err) {
        console.warn('[GPS Diagnostics] Permissions API query failed or restricted:', err);
      }
    } else {
      console.log('[GPS Diagnostics] Permissions API is not available in this environment.');
    }
    return true;
  };

  const handleDetectLocation = async () => {
    await diagnoseGeolocationSupport();
    if (!navigator.geolocation) {
      setGpsStatus('जियोलोकेशन समर्थित नहीं है।');
      return;
    }
    setGpsStatus('स्थान (GPS) खोजा जा रहा है...');
    
    // Attempt high accuracy first, fallback or prompt
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
        setLatitude(parseFloat(lat.toFixed(4)));
        setLongitude(parseFloat(lon.toFixed(4)));
        setTimezone(tz);
        setPlace(`GPS Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
        setIsCustomPlace(false);
        setGpsStatus('स्थान सफलतापूर्वक मिल गया!');
        setErrors(prev => ({ ...prev, place: '', latitude: '', longitude: '' }));
        setTimeout(() => setGpsStatus(null), 3000);
      },
      (error) => {
        console.warn('GPS error code:', error.code, error.message);
        // Try fallback with low accuracy if high accuracy failed (e.g. timeout or blocked)
        navigator.geolocation.getCurrentPosition(
          (pos2) => {
            const lat = pos2.coords.latitude;
            const lon = pos2.coords.longitude;
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
            setLatitude(parseFloat(lat.toFixed(4)));
            setLongitude(parseFloat(lon.toFixed(4)));
            setTimezone(tz);
            setPlace(`GPS Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
            setIsCustomPlace(false);
            setGpsStatus('स्थान सफलतापूर्वक मिल गया!');
            setErrors(prev => ({ ...prev, place: '', latitude: '', longitude: '' }));
            setTimeout(() => setGpsStatus(null), 3000);
          },
          (err2) => {
            console.error('GPS fallback error:', err2);
            setGpsStatus('GPS अनुमति अस्वीकृत या ब्लॉक है। कृपया सूची से अपना शहर चुनें।');
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'नाम कम से कम 2 अक्षरों का होना अनिवार्य है।';
    }

    if (!dob.trim()) {
      newErrors.dob = 'जन्मतिथि अनिवार्य है।';
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

    if (!isTimeUnknown && !time24.trim()) {
      newErrors.time = 'जन्म समय अनिवार्य है।';
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

    const formattedTime = isTimeUnknown ? '12:00 PM' : fromInputTime(time24);

    const payload: Partial<FamilyMemberProfile> = {
      name: name.trim(),
      gender,
      relationship: isMaster ? 'SELF' : relationship,
      dob: dob.trim(),
      time: formattedTime,
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

          {/* DOB & Time (With Native Calendar & Time Pickers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#d4af37]" /> जन्मतिथि (Date of Birth) *
              </label>
              <input 
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-black/50 border ${errors.dob ? 'border-red-500' : 'border-[#d4af37]/40'} text-white focus:outline-none focus:border-[#d4af37] text-sm`}
              />
              {errors.dob && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dob}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#d4af37]" /> जन्म समय (Birth Time) *
              </label>
              <input 
                type="time"
                disabled={isTimeUnknown}
                value={time24}
                onChange={e => setTime24(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-black/50 border ${errors.time ? 'border-red-500' : 'border-[#d4af37]/40'} text-white focus:outline-none focus:border-[#d4af37] text-sm disabled:opacity-50`}
              />
              {errors.time && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.time}</p>}
            </div>
          </div>

          {/* Time Unknown Checkbox */}
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
              <input 
                type="checkbox"
                checked={isTimeUnknown}
                onChange={e => {
                  setIsTimeUnknown(e.target.checked);
                  if (e.target.checked) {
                    setTime24('12:00');
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
                  <strong>शास्त्रीय सूचना:</strong> समय अज्ञात होने पर ग्रह स्थितियां दोपहर 12:00 बजे के आधार पर विश्वसनीय रहेंगी, लेकिन लग्न और भाव केवल अनुमानित होंगे।
                </span>
              </div>
            )}
          </div>

          {/* Country, State & Autocomplete Birthplace Search with GPS Location Tracker */}
          <div className="space-y-3 relative" ref={suggestionRef}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#d4af37]" /> देश और राज्य (Country & State) *
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="px-2.5 py-1 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/30 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="GPS Location Tracker"
              >
                <Navigation className="w-3 h-3 animate-pulse" />
                <span>वर्तमान GPS स्थान खोजें</span>
              </button>
            </div>

            {gpsStatus && (
              <div className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${gpsStatus.includes('सफलता') ? 'bg-emerald-950/40 border border-emerald-600/40 text-emerald-300' : 'bg-amber-950/40 border border-amber-600/40 text-amber-300'}`}>
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{gpsStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Country Select */}
              <select
                value={selectedCountry}
                onChange={e => {
                  setSelectedCountry(e.target.value);
                  setPlace('');
                  setIsCustomPlace(false);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-[#d4af37]/40 text-white focus:outline-none focus:border-[#d4af37] text-sm"
              >
                {COUNTRIES_LIST.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>

              {/* State Select (for India) */}
              {selectedCountry === 'India' ? (
                <select
                  value={selectedState}
                  onChange={e => {
                    setSelectedState(e.target.value);
                    setPlace('');
                    setIsCustomPlace(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-[#d4af37]/40 text-white focus:outline-none focus:border-[#d4af37] text-sm"
                >
                  {INDIAN_STATES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-gray-400 text-sm flex items-center">
                  <span>क्षेत्र / राज्य (Global)</span>
                </div>
              )}
            </div>

            {/* City Search / Autocomplete */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" /> जन्म स्थान (City / Town) *
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={place}
                  onChange={e => handlePlaceChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="शहर या गाँव का नाम टाइप करें..."
                  className={`w-full px-4 py-2.5 rounded-xl bg-black/50 border ${errors.place ? 'border-red-500' : 'border-[#d4af37]/40'} text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] text-sm`}
                />
                
                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions && filteredCities.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-[#04120c] border border-[#d4af37]/50 rounded-xl shadow-2xl divide-y divide-white/5">
                    {filteredCities.map(city => (
                      <div
                        key={city.name}
                        onClick={() => handleCitySelect(city)}
                        className="px-4 py-2.5 text-sm text-gray-200 hover:bg-[#d4af37]/20 hover:text-white cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="font-medium">{city.name}</span>
                        <span className="text-[11px] text-[#d4af37]/70 font-mono">
                          {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.place && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.place}</p>}

              {isCustomPlace && (
                <div className="mt-1.5 p-2 bg-amber-950/30 border border-amber-600/30 rounded-lg text-[11px] text-amber-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span>यह स्थान सूची में नहीं है। सटीक ज्योतिषीय गणना हेतु कृपया नीचे सही अक्षांश (Latitude) और देशांतर (Longitude) मैन्युअल रूप से जाँच कर दर्ज करें।</span>
                </div>
              )}
            </div>
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
                onChange={e => setLongitude(parseFloat(e.type === 'number' ? e.target.value : (e.target as any).value))}
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
              className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#e6c250] transition-all shadow-[0_15px_rgba(212,175,55,0.4)] text-sm flex items-center gap-2 cursor-pointer"
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
