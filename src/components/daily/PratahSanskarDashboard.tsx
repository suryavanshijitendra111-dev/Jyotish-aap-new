import React, { useState, useEffect } from 'react';
import { Sun, CheckCircle2, Circle, Award, Zap, Info } from 'lucide-react';
import CarvedCard from '../ui/CarvedCard';
import OrnateCorner from '../ui/OrnateCorner';
import { cn } from '../../utils/cn';

interface PratahSanskarDashboardProps {
  isPreview?: boolean;
  profile?: any;
  navigate?: (view: string) => void;
  showToast?: (msg: string) => void;
}

const STEPS = [
  { id: 'kara_darshan', title: 'करदर्शन', subtitle: 'Waking up with gratitude', icon: '🙏' },
  { id: 'bhumi_vandan', title: 'भूमिवंदन', subtitle: 'Saluting Mother Earth', icon: '🌍' },
  { id: 'surya_arghya', title: 'सूर्य अर्घ्य', subtitle: 'Salutation to the Sun', icon: '☀️' },
  { id: 'sankalpa', title: 'संकल्प', subtitle: 'Intention for the day', icon: '✨' },
  { id: 'pranayama', title: 'प्राणायाम', subtitle: 'Breath work for energy', icon: '🌬️' },
];

const PratahSanskarDashboard: React.FC<PratahSanskarDashboardProps> = ({ isPreview = false }) => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('pratah_sanskar_progress');
    if (saved) {
      const { steps, lastUpdate, currentStreak } = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (lastUpdate === today) {
        setCompletedSteps(steps);
      }
      setStreak(currentStreak || 0);
    }
  }, []);

  // Save to LocalStorage
  const toggleStep = (id: string) => {
    const newSteps = completedSteps.includes(id)
      ? completedSteps.filter(s => s !== id)
      : [...completedSteps, id];
    
    setCompletedSteps(newSteps);
    
    const today = new Date().toISOString().split('T')[0];
    const data = {
      steps: newSteps,
      lastUpdate: today,
      currentStreak: streak + (newSteps.length === STEPS.length ? 1 : 0) // Simplified streak logic
    };
    localStorage.setItem('pratah_sanskar_progress', JSON.stringify(data));
  };

  if (isPreview) {
    return (
      <CarvedCard className="p-4 border-l-4 border-l-orange-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-orange-500 font-serif font-bold text-lg flex items-center gap-2">
              <Sun size={18} />
              प्रातः संस्कार
            </h3>
            <p className="text-xs text-gray-500">5-Step Daily Routine</p>
          </div>
          <Zap className="text-orange-500 opacity-50" size={24} />
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-row items-center -space-x-2">
            {STEPS.map((s, i) => (
              <div 
                key={s.id} 
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center text-xs",
                  completedSteps.includes(s.id) ? "bg-orange-500" : "bg-gray-800"
                )}
              >
                {completedSteps.includes(s.id) ? "✓" : (i + 1)}
              </div>
            ))}
          </div>
          <div className="text-sm font-bold text-orange-400">{completedSteps.length}/5 Done</div>
        </div>
      </CarvedCard>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <CarvedCard className="p-6 relative">
        <OrnateCorner position="top-left" />
        <OrnateCorner position="top-right" />
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-[#D4AF37] text-2xl font-serif font-bold">प्रातः संस्कार डैशबोर्ड</h2>
            <p className="text-gray-400 text-sm">Spiritual Morning Routine Tracker</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl flex items-center gap-3">
            <Zap className="text-orange-500" size={20} />
            <div>
              <p className="text-[10px] text-orange-500 uppercase font-bold tracking-widest">Streak</p>
              <p className="text-xl font-bold text-orange-400">{streak} Days</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                completedSteps.includes(step.id) 
                  ? "bg-orange-500/10 border-orange-500/40 shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]" 
                  : "bg-[#1A1A1A] border-white/5 hover:border-[#D4AF37]/30"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all",
                completedSteps.includes(step.id) ? "bg-orange-500 text-white scale-110" : "bg-gray-800 text-gray-500"
              )}>
                {completedSteps.includes(step.id) ? <CheckCircle2 size={24} /> : step.icon}
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-500/60 font-mono">STEP 0{index + 1}</span>
                  {completedSteps.includes(step.id) && (
                    <span className="text-[10px] bg-orange-500 text-[#1A1A1A] px-1.5 py-0.5 rounded font-bold uppercase">Done</span>
                  )}
                </div>
                <h3 className={cn(
                  "font-serif font-bold text-lg",
                  completedSteps.includes(step.id) ? "text-[#D4AF37]" : "text-gray-300"
                )}>
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500">{step.subtitle}</p>
              </div>
              
              <div className="text-orange-500/30">
                {completedSteps.includes(step.id) ? <Award size={20} /> : <Circle size={20} />}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-[#141414] p-4 rounded-xl border border-white/5 flex items-start gap-4">
          <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
            <Info size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-300">Why this routine?</h4>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              प्रातः काल के ये ५ संस्कार आपके चक्रों को जागृत करते हैं और दिन भर के लिए सकारात्मक ऊर्जा का संचार करते हैं। 
              नियमित अभ्यास से आत्म-बल में वृद्धि होती है।
            </p>
          </div>
        </div>
      </CarvedCard>
    </div>
  );
};

export default PratahSanskarDashboard;
