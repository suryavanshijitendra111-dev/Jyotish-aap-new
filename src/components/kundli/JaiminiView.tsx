/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MasterKundliData } from '../../types/kundli';
import { JaiminiKarakaEngine, JaiminiAnalysisResult } from '../../services/astrology/jaiminiKarakaEngine';
import { useTranslation } from '../../i18n';

interface JaiminiViewProps {
  data: MasterKundliData;
}

const PLANET_HINDI: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगल',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु'
};

const RASHI_HINDI: Record<string, string> = {
  Aries: 'मेष',
  Taurus: 'वृषभ',
  Gemini: 'मिथुन',
  Cancer: 'कर्क',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तुला',
  Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुंभ',
  Pisces: 'मीन'
};

const KARAKA_HINDI: Record<string, string> = {
  AK: 'आत्मकारक',
  AmK: 'अमात्यकारक',
  BK: 'भ्रातृकारक',
  MK: 'मातृकारक',
  PiK: 'पितृकारक',
  PK: 'पुत्रकारक',
  GK: 'ज्ञातिकारक',
  DK: 'दारकारक'
};

const KARAKAMSHA_HINDI_MAP: Record<number, { title: string; desc: string }> = {
  1: {
    title: 'मेष',
    desc: 'आपका कारकांश लग्न मेष है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। मेष कारकांश: नेतृत्व क्षमता, उच्च ऊर्जा, साहसिक प्रवृत्ति और जीवंत दृष्टिकोण। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  2: {
    title: 'वृषभ',
    desc: 'आपका कारकांश लग्न वृषभ है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। वृषभ कारकांश: भौतिक सुख, वाहन, संपत्ति और घरेलू स्थिरता में आनंद। सौंदर्य, कला और स्थिरता के प्रति गहरी निष्ठा। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  3: {
    title: 'मिथुन',
    desc: 'आपका कारकांश लग्न मिथुन है, क्योंकि आपके आत्मकारक (गुरु) नवमांश (D9) चक्र में यहाँ स्थित हैं। मिथुन कारकांश: संचार, कला, व्यापार में निपुणता और बौद्धिक चिंतन की प्रवृत्ति। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  4: {
    title: 'कर्क',
    desc: 'आपका कारकांश लग्न कर्क है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। कर्क कारकांश: जल से जुड़े क्षेत्र, नौकायन या समुद्री व्यवसाय में सफलता। गहन संवेदनशील और अंतःप्रेरणा से युक्त स्वभाव। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  5: {
    title: 'सिंह',
    desc: 'आपका कारकांश लग्न सिंह है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। सिंह कारकांश: आत्म-सम्मान, उच्च नेतृत्व गुण, ओजस्वी व्यक्तित्व और प्रबंधन क्षमता। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  6: {
    title: 'कन्या',
    desc: 'आपका कारकांश लग्न कन्या है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। कन्या कारकांश: विश्लेषणात्मक प्रवृत्ति, सेवाभाव, शिल्पकला और सूक्ष्म कार्यों में दक्षता। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  7: {
    title: 'तुला',
    desc: 'आपका कारकांश लग्न तुला है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। तुला कारकांश: व्यापार, वाणिज्य और कूटनीति में रुचि। जीवन में संतुलन, सामंजस्य और न्यायप्रियता मुख्य मार्ग हैं। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  8: {
    title: 'वृश्चिक',
    desc: 'आपका कारकांश लग्न वृश्चिक है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। वृश्चिक कारकांश: गूढ़ विद्याओं, अनुसंधान और अन्वेषण के क्षेत्र में रुचि। जीवन में गहरे आत्मीय परिवर्तन और रूपांतरण का अनुभव। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  9: {
    title: 'धनु',
    desc: 'आपका कारकांश लग्न धनु है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। धनु कारकांश: उच्च शिक्षा, दर्शनशास्त्र और दूरस्थ यात्राएं। सत्य और आध्यात्मिक ज्ञान की खोज करने वाली आत्मा। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  10: {
    title: 'मकर',
    desc: 'आपका कारकांश लग्न मकर है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। मकर कारकांश: प्रशासन, निर्माण कार्य और संगठनात्मक क्षेत्रों में सफलता। अनुशासित, कर्मठ और दृढ़ संकल्पित आत्मा। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  11: {
    title: 'कुंभ',
    desc: 'आपका कारकांश लग्न कुंभ है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। कुंभ कारकांश: परोपकारी भावना, सामाजिक नेटवर्क और नवीन नवाचार में रुचि। जनहित के कार्यों में विशेष लगाव। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  },
  12: {
    title: 'मीन',
    desc: 'आपका कारकांश लग्न मीन है, क्योंकि आपके आत्मकारक नवमांश (D9) चक्र में यहाँ स्थित हैं। मीन कारकांश: गहन आध्यात्मिकता, मोक्ष की प्रवृत्ति और कलात्मक सृजनशीलता। दिव्य ऊर्जा से जुड़ाव। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।'
  }
};

export const JaiminiView: React.FC<JaiminiViewProps> = ({ data }) => {
  const { t, language } = useTranslation();
  const [system, setSystem] = useState<7 | 8>(8);
  const result: JaiminiAnalysisResult = JaiminiKarakaEngine.calculate(data);
  const karakas = system === 7 ? result.charaKarakas7 : result.charaKarakas8;
  const isHi = language === 'hi';

  const rashiH = RASHI_HINDI[result.karakamshaLagna.rashiName] || result.karakamshaLagna.rashiName;
  const karakamshaInfo = KARAKAMSHA_HINDI_MAP[result.karakamshaLagna.rashi] || {
    title: rashiH,
    desc: `आपका कारकांश लग्न ${rashiH} है, क्योंकि आपके आत्मकारक (${PLANET_HINDI[result.karakamshaLagna.atmakaraka] || result.karakamshaLagna.atmakaraka}) नवमांश (D9) चक्र में यहाँ स्थित हैं। कारकांश से ग्रहों की स्थिति जातक के जीवन के उद्देश्य और आध्यात्मिक-व्यावसायिक मार्ग को निर्धारित करती है।`
  };

  return (
    <div className="bg-[#1A1A1A] border-2 border-[#D4AF37] rounded-xl overflow-hidden shadow-2xl mb-8 font-serif">
      {/* Royal Header */}
      <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1A1A1A] p-4 border-b border-[#D4AF37] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <span className="text-[#1A1A1A] font-bold text-xl">J</span>
          </div>
          <div>
            <h2 className="text-[#D4AF37] text-xl font-bold tracking-widest uppercase">{t('jaimini.title') || 'जैमिनी सूत्र'}</h2>
            <p className="text-[#A0A0A0] text-xs uppercase tracking-tighter">{t('jaimini.subtitle') || 'चर कारक एवं कारकांश'}</p>
          </div>
        </div>
        <div className="flex bg-[#000] border border-[#D4AF37]/30 rounded-lg p-1">
          <button 
            onClick={() => setSystem(7)}
            className={`px-3 py-1 rounded text-xs transition-all ${system === 7 ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
          >
            {t('jaimini.system7') || '7 कारक'}
          </button>
          <button 
            onClick={() => setSystem(8)}
            className={`px-3 py-1 rounded text-xs transition-all ${system === 8 ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
          >
            {t('jaimini.system8') || '8 कारक'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Karakamsha Highlight */}
        <div className="mb-8 bg-[#000]/40 border border-[#D4AF37]/20 rounded-lg p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
             <div className="w-20 h-20 border-4 border-[#D4AF37] rotate-45"></div>
          </div>
          <h3 className="text-[#D4AF37] font-bold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
            {t('jaimini.karakamshaLagna') || 'कारकांश लग्न'}: {isHi ? karakamshaInfo.title : result.karakamshaLagna.rashiName}
          </h3>
          <div className="space-y-2">
            <p className="text-[#E0E0E0] text-sm leading-relaxed italic border-l-2 border-[#D4AF37]/30 pl-3">
              {isHi ? karakamshaInfo.desc : result.karakamshaResults.join(' ')}
            </p>
          </div>
        </div>

        {/* Chara Karakas Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/30">
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold">{t('jaimini.karaka') || 'कारक'}</th>
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold">{t('jaimini.planet') || 'ग्रह'}</th>
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold">{t('jaimini.sign') || 'राशि'}</th>
                <th className="py-3 px-4 text-[#D4AF37] text-xs uppercase tracking-widest font-bold text-right">{t('jaimini.degree') || 'अंश'}</th>
              </tr>
            </thead>
            <tbody>
              {karakas.map((k, idx) => {
                const karakaLabel = isHi ? (KARAKA_HINDI[k.type] || k.type) : k.type;
                const planetLabel = isHi ? (PLANET_HINDI[k.planet] || k.planet) : k.planet;
                const signLabel = isHi ? (RASHI_HINDI[k.signName] || k.signName) : k.signName;
                return (
                  <tr 
                    key={`${k.type}-${idx}`} 
                    className={`border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-colors ${idx === 0 ? 'bg-[#D4AF37]/5' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-[#D4AF37] font-bold text-sm">{karakaLabel}</span>
                        <span className="text-[#888] text-[10px] uppercase">{k.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#FFF] font-medium">{planetLabel}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#E0E0E0] text-sm">{signLabel}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-[#D4AF37] font-mono text-xs">{k.degree.toFixed(4)}°</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center text-[#666] text-[10px] italic uppercase tracking-widest">
          {t('jaimini.calcNote', { system }) || `${system} चर कारक प्रणाली • जगन्नाथ होरा मानक अनुसार गणना`}
        </div>
      </div>
    </div>
  );
};

