import React from 'react';
import { ArrowLeft, Compass, Sparkles, Sun } from 'lucide-react';
import CarvedCard from '../ui/CarvedCard';
import OrnateCorner from '../ui/OrnateCorner';

interface JeevanPragyaDashboardProps {
  profile?: any;
  navigate?: (view: string) => void;
  showToast?: (msg: string) => void;
}

export const JeevanPragyaDashboard: React.FC<JeevanPragyaDashboardProps> = ({
  navigate,
  showToast
}) => {
  return (
    <div className="min-h-screen pb-28 pt-4 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/20 mb-6">
        <button
          onClick={() => navigate?.('dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-[#d4af37]/40 text-[#d4af37] text-sm font-semibold hover:bg-[#d4af37]/25 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>डैशबोर्ड</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-[#d4af37] tracking-wide font-serif">
          जीवन प्रज्ञा (Jeevan Pragya)
        </h1>

        <div className="w-16"></div>
      </div>

      {/* Main Content Card */}
      <CarvedCard className="p-6 relative mb-6">
        <OrnateCorner position="top-left" />
        <OrnateCorner position="top-right" />
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Compass className="w-8 h-8 text-[#d4af37]" />
          </div>
          <h2 className="text-[#d4af37] text-xl font-serif font-bold mb-1">सप्त ऋषियों का आध्यात्मिक मार्गदर्शन</h2>
          <p className="text-gray-300 text-xs italic">"आत्मदीपो भव — अपने दीपक स्वयं बनें"</p>
        </div>

        <div className="space-y-4 text-sm text-gray-200">
          <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#d4af37] text-base mb-1">दैनिक जीवन सूत्र</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                अपने जन्म लग्न और वर्तमान महादशा के अनुसार कर्म, ध्यान और सात्विक जीवन शैली का पालन करें।
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/20 flex items-start gap-3">
            <Sun className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#d4af37] text-base mb-1">प्रातःकालीन संकल्प</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                प्रत्येक दिन की शुरुआत कृतज्ञता और सकारात्मक संकल्प के साथ करें।
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => showToast?.('जीवन प्रज्ञा मार्गदर्शन अद्यतन किया गया।')}
            className="px-6 py-2.5 rounded-full bg-[#d4af37] text-black text-xs font-bold hover:bg-[#e6c250] transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          >
            मार्गदर्शन ताज़ा करें
          </button>
        </div>
      </CarvedCard>
    </div>
  );
};

export default JeevanPragyaDashboard;
