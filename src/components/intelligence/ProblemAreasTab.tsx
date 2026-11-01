/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PROBLEM AREAS & LIFE CHALLENGES TAB
 */

import React from 'react';
import { BirthProfile } from '../../types/kundli';
import { AlertCircle, HelpCircle, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface Props {
  profile: BirthProfile;
  showToast?: (msg: string) => void;
  handleAskQuestion: (q: string) => void;
}

export default function ProblemAreasTab({ profile, showToast, handleAskQuestion }: Props) {
  const { t } = useTranslation();

  const areas = [
    {
      title: 'मानसिक अशांति एवं अत्यधिक विचार (Mental Overthinking)',
      severity: 'मध्यम (Moderate)',
      reason: 'चंद्रमा एवं राहु/केतु अक्ष का प्रभाव मन में क्षणिक संशय उत्पन्न करता है।',
      question: 'अत्यधिक चिंता एवं मानसिक शांति के लिए मुझे क्या उपाय करने चाहिए?',
      remedy: 'प्रतिदिन 10 मिनट चंद्र प्राणायाम अथवा शिव ध्यान करें।'
    },
    {
      title: 'कार्यक्षेत्र में विलंब एवं संघर्ष (Career Stagnation/Delays)',
      severity: 'सामान्य (Mild)',
      reason: 'शनि की दृष्टि दशम भाव पर होने से परिणाम कठोर श्रम व धैर्य के उपरांत मिलते हैं।',
      question: 'करियर में स्थिरता व उन्नति के लिए सर्वोत्तम ज्योतिषीय मार्गदर्शन क्या है?',
      remedy: 'शनिवार को जरूरतमंदों को तिल/तेल का दान एवं सूर्य को प्रातः जल अर्पण करें।'
    },
    {
      title: 'वित्तीय संचय में उतार-चढ़ाव (Financial Influx Fluctuations)',
      severity: 'मध्यम (Moderate)',
      reason: 'द्वादशेश व द्वितीयेश का संबंध आकस्मिक पारिवारिक व्ययों का योग बनाता है।',
      question: 'धन संचय व स्थिर आर्थिक प्रवाह के लिए क्या उपाय आवश्यक हैं?',
      remedy: 'श्री सूक्त पाठ अथवा गाय को बुधवार हरा चारा खिलाना श्रेयस्कर रहेगा।'
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in pb-8">
      <div className="bg-[#0a1510]/80 border border-[#d4af37]/40 rounded-2xl p-5 backdrop-blur-md">
        <h2 className="text-[#d4af37] font-bold text-base tracking-wider uppercase flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          समस्या समाधान एवं जीवन चुनौतियाँ (Life Challenges & Solutions)
        </h2>
        <p className="text-xs text-gray-300 mb-6">
          कुंडली के संवेदनशील भावों व गोचर बाधाओं का निष्पक्ष अध्ययन एवं समाधान। किसी भी विषय पर सीधा प्रश्न पूछें।
        </p>

        <div className="space-y-4">
          {areas.map((a, idx) => (
            <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-[#d4af37]/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold text-white text-sm">{a.title}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 w-fit">
                  {a.severity}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                <strong className="text-gray-300">शास्त्रीय कारण: </strong>{a.reason}
              </p>
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-600/30 text-xs text-emerald-200 mb-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-emerald-300">सुझाया गया उपाय: </strong>{a.remedy}</span>
              </div>
              <button
                onClick={() => handleAskQuestion(a.question)}
                className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:text-[#f3cc58] font-semibold transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>इस विषय पर प्रज्ञा AI से मार्गदर्शन लें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
