import React, { useState, useMemo } from 'react';
import { ChevronRight, Activity, Heart, Shield, Award } from 'lucide-react';
import CarvedCard from '../ui/CarvedCard';
import OrnateCorner from '../ui/OrnateCorner';
import { cn } from '../../utils/cn';

interface DailyReportCardProps {
  isPreview?: boolean;
  profile?: any;
  navigate?: (view: string) => void;
  showToast?: (msg: string) => void;
}

const DailyReportCard: React.FC<DailyReportCardProps> = ({ isPreview = false }) => {
  const [trendTimeframe, setTrendTimeframe] = useState<'7D' | '14D' | '30D'>('7D');
  
  // Mock data for trends
  const mockTrendData = useMemo(() => {
    const days = trendTimeframe === '7D' ? 7 : trendTimeframe === '14D' ? 14 : 30;
    return Array.from({ length: days }).map((_, i) => ({
      day: `Day ${i + 1}`,
      health: Math.floor(Math.random() * 40) + 60,
      reflection: Math.floor(Math.random() * 40) + 60,
      karma: Math.floor(Math.random() * 40) + 60,
    }));
  }, [trendTimeframe]);

  if (isPreview) {
    return (
      <CarvedCard className="p-4 border-l-4 border-l-[#D4AF37]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-[#D4AF37] font-serif font-bold text-lg flex items-center gap-2">
              <Activity size={18} />
              दैनिक जीवन रिपोर्ट
            </h3>
            <p className="text-xs text-gray-500">Weekly Progress Summary</p>
          </div>
          <Award className="text-[#D4AF37] opacity-50" size={24} />
        </div>
        
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 bg-[#1A1A1A] p-3 rounded-lg border border-[#D4AF37]/10">
            <span className="text-[10px] text-gray-500 block uppercase tracking-wider">Avg Score</span>
            <span className="text-xl font-bold text-[#D4AF37]">84%</span>
          </div>
          <div className="flex-1 bg-[#1A1A1A] p-3 rounded-lg border border-[#D4AF37]/10">
            <span className="text-[10px] text-gray-500 block uppercase tracking-wider">Streak</span>
            <span className="text-xl font-bold text-[#D4AF37]">12 Days</span>
          </div>
        </div>
      </CarvedCard>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <CarvedCard className="p-6 relative">
        <OrnateCorner position="top-left" />
        <OrnateCorner position="top-right" />
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-[#D4AF37] text-2xl font-serif font-bold">जीवन रिपोर्ट कार्ड</h2>
            <p className="text-gray-400 text-sm">Interactive Visual Trend Analytics</p>
          </div>
          
          <div className="flex bg-[#141414] p-1 rounded-lg border border-[#D4AF37]/20">
            {(['7D', '14D', '30D'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTrendTimeframe(t)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  trendTimeframe === t 
                    ? "bg-[#D4AF37] text-[#1A1A1A] shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                    : "text-gray-500 hover:text-[#D4AF37]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Trend Chart */}
        <div className="h-64 w-full bg-[#141414]/50 rounded-xl border border-[#D4AF37]/10 relative p-4 mb-8">
          <div className="absolute inset-0 flex items-end justify-between px-8 pb-4">
            {mockTrendData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group relative">
                <div className="flex items-end gap-1 h-32">
                  <div 
                    style={{ height: `${d.health}%` }} 
                    className="w-1.5 bg-red-500/60 rounded-t-full transition-all group-hover:bg-red-500"
                  ></div>
                  <div 
                    style={{ height: `${d.reflection}%` }} 
                    className="w-1.5 bg-blue-500/60 rounded-t-full transition-all group-hover:bg-blue-500"
                  ></div>
                  <div 
                    style={{ height: `${d.karma}%` }} 
                    className="w-1.5 bg-green-500/60 rounded-t-full transition-all group-hover:bg-green-500"
                  ></div>
                </div>
                <div className="text-[8px] text-gray-600 rotate-45 mt-2 origin-left">
                  {i % 2 === 0 ? `D${i+1}` : ''}
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 bg-[#1A1A1A] border border-[#D4AF37] p-2 rounded shadow-xl min-w-[100px]">
                  <p className="text-[10px] font-bold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-1 mb-1">Day {i+1}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px]">
                      <span>Health:</span>
                      <span className="text-red-400">{d.health}</span>
                    </div>
                    <div className="flex justify-between text-[8px]">
                      <span>Reflection:</span>
                      <span className="text-blue-400">{d.reflection}</span>
                    </div>
                    <div className="flex justify-between text-[8px]">
                      <span>Karma:</span>
                      <span className="text-green-400">{d.karma}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="absolute top-2 right-4 flex gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-400">स्वास्थ्य</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400">आत्म-चिंतन</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-400">कर्म</span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard 
            title="Health Index" 
            value="82/100" 
            icon={<Heart className="text-red-500" size={16} />} 
            color="red"
          />
          <MetricCard 
            title="Self Reflection" 
            value="75/100" 
            icon={<Shield className="text-blue-500" size={16} />} 
            color="blue"
          />
          <MetricCard 
            title="Karma Score" 
            value="90/100" 
            icon={<Award className="text-green-500" size={16} />} 
            color="green"
          />
        </div>
      </CarvedCard>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 flex items-center justify-between hover:border-[#D4AF37]/20 transition-all">
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-lg bg-opacity-10", `bg-${color}-500`)}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{title}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
    <ChevronRight size={16} className="text-gray-600" />
  </div>
);

export default DailyReportCard;
