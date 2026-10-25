import { useState } from 'react';
import { 
  X, 
  Settings, 
  Bell, 
  Volume2, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Save, 
  Info,
  Check
} from 'lucide-react';
import { 
  PratahSanskarSettings, 
  PratahAudioChoice 
} from '../../types/pratahSanskar';
import { MorningAlarmService } from '../../services/pratah/morningAlarmService';

interface PratahSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PratahSanskarSettings;
  onSave: (newSettings: PratahSanskarSettings) => void;
  showToast: (msg: string) => void;
}

export default function PratahSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  showToast
}: PratahSettingsModalProps) {
  const [formData, setFormData] = useState<PratahSanskarSettings>({ ...settings });
  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setFormData(prev => {
      const exists = prev.alarmDays.includes(day);
      const updated = exists 
        ? prev.alarmDays.filter(d => d !== day)
        : [...prev.alarmDays, day];
      return { ...prev, alarmDays: updated };
    });
  };

  const handleSave = () => {
    MorningAlarmService.saveSettings(formData);
    onSave(formData);
    showToast('प्रातः संस्कार सेटिंग्स सुरक्षित की गईं!');
    onClose();
  };

  const handleTestNotification = async () => {
    setTestNotificationStatus('जाँच जारी...');
    const res = await MorningAlarmService.triggerWebNotification();
    if (res.success) {
      setTestNotificationStatus('✅ परीक्षण नोटिफिकेशन भेजा गया');
      showToast('परीक्षण नोटिफिकेशन भेजा गया (लॉकस्क्रीन गोपनीयता सक्रिय)');
    } else {
      setTestNotificationStatus(`⚠️ ${res.reason || 'अनुमति अस्वीकृत'}`);
      showToast(res.reason || 'नोटिफिकेशन अनुमति आवश्यक है');
    }
  };

  const reliabilityNotice = MorningAlarmService.getPlatformReliabilityNotice();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#051710] border border-[#d4af37]/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#051710]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">प्रातः संस्कार सेटिंग्स</h3>
              <p className="text-xs text-gray-400">दैनिक आध्यात्मिक दिनचर्या एवं अलार्म नियंत्रण</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* Main Routine Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#082218] border border-[#d4af37]/30 rounded-2xl">
            <div>
              <h4 className="text-sm font-bold text-white">प्रातः संस्कार दिनचर्या (Morning Routine)</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                प्रातःकाल शांतिपूर्वक जागने और आध्यात्मिक रूटीन को सक्रिय रखें
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
            </label>
          </div>

          {/* Wake-up Time & Days */}
          <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                <span>जागने का समय (Wake-up Time):</span>
              </label>
              <input
                type="time"
                value={formData.wakeUpTime}
                onChange={e => setFormData({ ...formData, wakeUpTime: e.target.value })}
                className="bg-[#030a08] border border-[#d4af37]/40 rounded-xl px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Days Selection */}
            <div>
              <span className="text-[11px] text-gray-400 block mb-1.5">सक्रिय दिन (Active Days):</span>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeek.map(day => {
                  const selected = formData.alarmDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        selected
                          ? 'bg-[#d4af37] text-[#030a08] font-bold shadow'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Audio Preference & Volume */}
          <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#d4af37]" />
                <span>जाग्रति ध्वनि (Wake-up Audio Preference):</span>
              </label>
              <span className="text-[10px] text-gray-400">धार्मिक बाध्यता रहित</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'gayatri', label: 'गायत्री मंत्र', desc: 'तन्पुरा एवं पवित्र वैदिक जप' },
                { id: 'instrumental', label: 'बांसुरी / राग', desc: 'शांत भारतीय वाद्य संगीत' },
                { id: 'nature', label: 'प्राकृतिक भोर', desc: 'पक्षियों का कलरव व समीर' },
                { id: 'silent', label: 'मौन (Silent)', desc: 'केवल दृश्य व नोटिफिकेशन' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, audioChoice: opt.id as PratahAudioChoice })}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    formData.audioChoice === opt.id
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>

            {/* Volume & Fade In */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>ध्वनि स्तर (Volume): {Math.round(formData.volume * 100)}%</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.fadeIn}
                    onChange={e => setFormData({ ...formData, fadeIn: e.target.checked })}
                    className="accent-[#d4af37]"
                  />
                  <span className="text-[11px] text-gray-400">मंद शुरुआत (Fade-in)</span>
                </label>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={formData.volume}
                onChange={e => setFormData({ ...formData, volume: parseFloat(e.target.value) })}
                className="w-full accent-[#d4af37]"
              />
            </div>

            {/* Snooze Duration */}
            <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
              <span>स्नूज़ अवधि (Snooze Minutes):</span>
              <select
                value={formData.snoozeMinutes}
                onChange={e => setFormData({ ...formData, snoozeMinutes: parseInt(e.target.value) })}
                className="bg-[#030a08] border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white"
              >
                <option value={5}>5 मिनट</option>
                <option value={9}>9 मिनट</option>
                <option value={10}>10 मिनट</option>
              </select>
            </div>
          </div>

          {/* Module-by-Module Toggles */}
          <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
              रूटीन मॉड्यूल नियंत्रण (Component Switches)
            </h4>

            {[
              {
                id: 'suryaArghyaEnabled',
                title: 'सूर्य अर्घ्य वंदना (Surya Arghya)',
                desc: 'प्रातःकाल सूर्य को जल अर्पित करने का निर्देश'
              },
              {
                id: 'twelveNamesAudioEnabled',
                title: '12 सूर्य नाम ऑडियो (12 Names Recitation)',
                desc: 'द्वादश आदित्य नामों का क्रमिक उच्चारण'
              },
              {
                id: 'snanReminderEnabled',
                title: 'स्नान स्मरण (Mindful Bath Reminder)',
                desc: 'शरीर के साथ मन को निर्मल करने का विचार'
              },
              {
                id: 'todaysKarmaEnabled',
                title: 'आज का अच्छा कर्म (Today\'s Karma)',
                desc: 'दैनिक सत्कर्म व सेवा का व्यावहारिक सुझाव'
              },
              {
                id: 'dailyGuidanceNotificationEnabled',
                title: 'दैनिक जीवन दर्पण नोटिफिकेशन (Daily Guidance)',
                desc: 'दिन के 4 पहरों में आध्यात्मिक मार्गदर्शन'
              }
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-xs font-semibold text-white">{item.title}</div>
                  <div className="text-[10px] text-gray-400">{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={(formData as any)[item.id]}
                  onChange={e => setFormData({ ...formData, [item.id]: e.target.checked })}
                  className="w-4 h-4 accent-[#10b981] cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Notification Privacy & Quiet Hours */}
          <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> गोपनीयता एवं शांत समय (Privacy & Quiet Hours)
            </h4>

            {/* Privacy toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-semibold text-white">लॉकस्क्रीन गोपनीयता (Notification Privacy)</div>
                <div className="text-[10px] text-gray-400 max-w-sm">
                  लॉकस्क्रीन पर जन्म विवरण या संवेदनशील ज्योतिषीय तथ्य छिपाएं (केवल सुरक्षित संदेश दिखाएं)
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.notificationPrivacy}
                onChange={e => setFormData({ ...formData, notificationPrivacy: e.target.checked })}
                className="w-4 h-4 accent-[#10b981] cursor-pointer"
              />
            </div>

            {/* Quiet Hours */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">शांत समय सक्रिय (Quiet Hours):</span>
                <input
                  type="checkbox"
                  checked={formData.quietHours.enabled}
                  onChange={e => setFormData({
                    ...formData,
                    quietHours: { ...formData.quietHours, enabled: e.target.checked }
                  })}
                  className="w-4 h-4 accent-[#10b981] cursor-pointer"
                />
              </div>
              {formData.quietHours.enabled && (
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>शुरू:</span>
                  <input
                    type="time"
                    value={formData.quietHours.start}
                    onChange={e => setFormData({
                      ...formData,
                      quietHours: { ...formData.quietHours, start: e.target.value }
                    })}
                    className="bg-[#030a08] border border-white/20 rounded px-2 py-1 text-white"
                  />
                  <span>समाप्त:</span>
                  <input
                    type="time"
                    value={formData.quietHours.end}
                    onChange={e => setFormData({
                      ...formData,
                      quietHours: { ...formData.quietHours, end: e.target.value }
                    })}
                    className="bg-[#030a08] border border-white/20 rounded px-2 py-1 text-white"
                  />
                </div>
              )}
            </div>

            {/* Test Notification Button */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestNotification}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-gray-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>परीक्षण नोटिफिकेशन भेजें</span>
              </button>
              {testNotificationStatus && (
                <span className="text-[11px] text-gray-300">{testNotificationStatus}</span>
              )}
            </div>
          </div>

          {/* Web Limitation Notice (Section 1 & 13) */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200/90 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">{reliabilityNotice.title}: </strong>
              <span>{reliabilityNotice.explanation}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex items-center justify-end gap-3 sticky bottom-0 bg-[#051710]/95 backdrop-blur-md">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 transition cursor-pointer"
          >
            रद्द करें
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b89528] text-[#030a08] font-bold rounded-xl text-xs hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>सेटिंग्स सुरक्षित करें</span>
          </button>
        </div>
      </div>
    </div>
  );
}
