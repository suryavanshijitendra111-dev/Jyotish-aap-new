/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { BirthProfile } from '../../types/kundli';
import { ArrowLeft, Sparkles, Grid, Shield, Zap, Award } from 'lucide-react';

interface LoShuGridViewProps {
  profile?: BirthProfile | null;
  onBack?: () => void;
  language?: string;
}

export const LoShuGridView: React.FC<LoShuGridViewProps> = ({ profile, onBack }) => {
  const dob = profile?.dob || '1986-06-24';
  const name = profile?.name || 'जितेंद्र सूर्यवंशी';

  // Calculate Lo Shu Digit Frequencies from birth date (1986-06-24 -> 1, 9, 8, 6, 0, 6, 2, 4)
  const digitCounts = useMemo(() => {
    const cleanDigits = dob.replace(/[^0-9]/g, '').split('').map(Number);
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    cleanDigits.forEach(d => {
      if (d >= 1 && d <= 9) {
        counts[d] = (counts[d] || 0) + 1;
      }
    });
    return counts;
  }, [dob]);

  // 3x3 Lo Shu Grid Standard positions
  const gridRows = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6]
  ];

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
          <Grid className="w-6 h-6 text-amber-400 animate-pulse" />
          लो-शू ग्रिड
        </h1>
        <p className="text-xs sm:text-sm text-amber-200/70 max-w-lg mx-auto">
          जन्म तिथि ({dob}) के अंकों द्वारा निर्मित पवित्र लो शू चक्र, तलों का विश्लेषण एवं अनुपस्थित अंकों के वैदिक उपाय।
        </p>
      </div>

      {/* 3x3 Lo Shu Grid Visual Display */}
      <div className="max-w-md mx-auto bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-widest font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            वैदिक लो शू ग्रिड (जन्म अंक: {dob})
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {gridRows.flat().map(num => {
            const count = digitCounts[num] || 0;
            return (
              <div
                key={num}
                className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-2 transition-all ${
                  count > 0
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                  {count > 0 ? String(num).repeat(count) : '-'}
                </span>
                <span className="text-[10px] text-amber-200/60 font-semibold mt-1">
                  अंक {num} {count > 0 ? `(${count} बार)` : '(रिक्त)'}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center text-xs text-slate-400">
          उपस्थित अंक: <strong className="text-amber-300">4, 9, 2, 8, 1, 6 (दो बार)</strong> | अनुपस्थित अंक: <strong className="text-red-300">3, 5, 7</strong>
        </div>
      </div>

      {/* Planes (तलों) ka Shastriya Vishleshan */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Mental Plane */}
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-5 shadow-lg space-y-2">
          <h3 className="text-base font-serif text-amber-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            मानसिक तल (4 - 9 - 2)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            यह तल बौद्धिक क्षमता, स्मरण शक्ति, निर्णय लेने की कला और विचारशीलता को दर्शाता है। आपके ग्रिड में 4, 9 और 2 की उपस्थिति इस तल को अत्यंत बलवान बनाती है।
          </p>
        </div>

        {/* Practical Plane */}
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-5 shadow-lg space-y-2">
          <h3 className="text-base font-serif text-amber-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            व्यावहारिक तल (8 - 1 - 6)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            यह तल कार्यकुशलता, भौतिक स्थिरता, धन प्रबंधन और व्यावहारिक दृष्टिकोण का प्रतिनिधित्व करता है। 8, 1 और 6 की उपस्थिति से जीवन में भौतिक समृद्धि और स्थिरता प्राप्त होती है।
          </p>
        </div>

        {/* Thought Plane */}
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-5 shadow-lg space-y-2">
          <h3 className="text-base font-serif text-amber-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            विचार तल (4 - 3 - 8)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            योजना निर्माण और मानसिक संकल्प का यह तल अंक 3 के रिक्त होने के कारण आंशिक रूप से प्रभावित है, जिसके लिए बौद्धिक साधना एवं पठन-पाठन अनुकूल है।
          </p>
        </div>

        {/* Action Plane */}
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-5 shadow-lg space-y-2">
          <h3 className="text-base font-serif text-amber-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            कर्म तल (2 - 7 - 6)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            सक्रियता, सेवा भाव और शारीरिक कर्म का यह तल अंक 2 और 6 की ऊर्जा से संचालित होता है, जो आपको कर्मठ और उत्तरदायित्व पूर्ण बनाता है।
          </p>
        </div>

      </div>

      {/* Missing Numbers & Remedies */}
      <div className="max-w-4xl mx-auto bg-slate-900/90 border border-amber-500/30 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-serif text-amber-400">अनुपस्थित अंक एवं सरल वैदिक उपाय (3, 5, 7)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-amber-300 text-sm">अंक 3 (गुरु / ज्ञान)</div>
            <p className="text-slate-300 leading-relaxed">
              आत्मविश्वास, ज्ञान और वाणी में स्थिरता हेतु गुरुवार को पीली वस्तुओं का दान करें, गुरुजनों का आदर करें और विष्णु सहस्रनाम का पाठ करें।
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-amber-300 text-sm">अंक 5 (बुध / संतुलन)</div>
            <p className="text-slate-300 leading-relaxed">
              जीवन में संतुलन, एकाग्रता और व्यापारिक स्थिरता हेतु बुधवार को गणेश भगवान की उपासना करें, दुर्वा अर्पित करें और हरी वस्तुओं का दान करें।
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-amber-300 text-sm">अंक 7 (केतु / अंतर्ज्ञान)</div>
            <p className="text-slate-300 leading-relaxed">
              अंतर्ज्ञान और आध्यात्मिक गहराई बढ़ाने हेतु गणेश जी या केतु मंत्र का जाप करें, तथा आवारा पशुओं/स्वान को नियमित आहार दें।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoShuGridView;
