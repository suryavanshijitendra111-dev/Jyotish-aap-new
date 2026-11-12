/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Sparkles, Star, Compass, Shield, Zap } from 'lucide-react';

interface NumerologyViewProps {
  profile?: any;
  onBack?: () => void;
  language?: string;
}

export const NumerologyView: React.FC<NumerologyViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-amber-100 font-sans space-y-6 pb-28">
      {/* Top Bar */}
      {onBack && (
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-sm font-bold hover:bg-amber-500/25 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← डैशबोर्ड</span>
          </button>
        </div>
      )}

      {/* Header & Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif text-amber-400 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          अंकशास्त्र (मूलांक एवं भाग्यांक)
        </h1>
        <p className="text-xs sm:text-sm text-amber-200/70 max-w-lg mx-auto">
          जन्म तिथि एवं नामांक के आधार पर वैदिक अंकशास्त्र का संपूर्ण विश्लेषण।
        </p>
      </div>

      {/* Main Grid for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        
        {/* Card 1: Moolank 6 */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
            <h3 className="text-lg font-serif text-amber-400 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              मूलांक 6 (स्वामी: शुक्र)
            </h3>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full font-bold">
              जन्म अंक
            </span>
          </div>
          <div className="text-xs font-mono text-amber-200/90 bg-black/30 p-2.5 rounded-lg border border-amber-500/10">
            गणना: 24 तारीख (2 + 4 = 6)
          </div>
          <p className="text-xs text-amber-100/80 leading-relaxed">
            <strong>गुण:</strong> कला, सौंदर्य, आकर्षण, संतुलन एवं पारिवारिक सुख। मूलांक 6 के जातक कलाप्रेमी, मिलनसार और जीवन में सुख-सुविधाओं के प्रति विशेष रुचि रखने वाले होते हैं।
          </p>
        </div>

        {/* Card 2: Bhagyank 9 */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
            <h3 className="text-lg font-serif text-amber-400 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              भाग्यांक 9 (स्वामी: मंगल)
            </h3>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full font-bold">
              भाग्य अंक
            </span>
          </div>
          <div className="text-xs font-mono text-amber-200/90 bg-black/30 p-2.5 rounded-lg border border-amber-500/10">
            गणना: 24-06-1986 (2+4+0+6+1+9+8+6 = 36 &rarr; 9)
          </div>
          <p className="text-xs text-amber-100/80 leading-relaxed">
            <strong>प्रभाव:</strong> ऊर्जा, नेतृत्व, पराक्रम, संगठन क्षमता एवं जनकल्याण। भाग्यांक 9 जातक को उच्च पदों पर नेतृत्व करने और समाजहित के कार्यों में सफलता दिलाता है।
          </p>
        </div>

        {/* Card 3: Harmony / Samanjasya */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
            <h3 className="text-lg font-serif text-amber-400 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              मूलांक 6 व भाग्यांक 9 सामंजस्य
            </h3>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full font-bold">
              शास्त्रीय समन्वय
            </span>
          </div>
          <div className="text-xs font-mono text-amber-200/90 bg-black/30 p-2.5 rounded-lg border border-amber-500/10">
            शुक्र एवं मंगल का योग
          </div>
          <p className="text-xs text-amber-100/80 leading-relaxed">
            शुक्र और मंगल का श्रेष्ठ योग, जो आकर्षण के साथ दृढ़ संकल्प और कार्यसिद्धि प्रदान करता है। यह संयोजन व्यक्ति को कलात्मक दृष्टि के साथ-साथ पराक्रमी बनाता है।
          </p>
        </div>

        {/* Card 4: Favorable Instructions / Anukool Nirdesh */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
            <h3 className="text-lg font-serif text-amber-400 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              अनुकूल निर्देश
            </h3>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full font-bold">
              शुभ तत्व
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">शुभ वार</span>
              <span className="font-semibold text-amber-200">शुक्रवार, मंगलवार</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">शुभ रंग</span>
              <span className="font-semibold text-amber-200">सफेद, क्रीम, हल्का नीला, लाल</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">शुभ दिशा</span>
              <span className="font-semibold text-amber-200">दक्षिण-पूर्व (आग्नेय)</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">शुभ रत्न</span>
              <span className="font-semibold text-amber-200">हीरा, ओपल, मूंगा</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NumerologyView;
