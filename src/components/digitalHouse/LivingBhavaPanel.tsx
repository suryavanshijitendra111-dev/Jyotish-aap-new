/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, Compass, Shield, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { BhavaAstroViewModel, formatDegreeDMS } from '../../services/digitalHouse/houseDataContract';
import { ChamberId } from '../../types/digitalHouse';
import { MasterKundliData } from '../../types/kundli';

interface LivingBhavaPanelProps {
  bhava: BhavaAstroViewModel;
  masterData: MasterKundliData | null;
  onClose: () => void;
  onSelectPlanet?: (planetName: string, chamberId: ChamberId) => void;
}

/**
 * Vedic Traditional Significations for all 12 Bhavas (Strictly presentation-only)
 */
const TRADITIONAL_BHAVA_MEANINGS: Record<number, { title: string; desc: string; role: string }> = {
  1: {
    title: 'तनु भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में प्रथम भाव को \'तनु भाव\' अथवा \'लग्न\' कहा जाता है। यह जातक के आत्म-स्वरूप, जीवन शक्ति (Vitality), व्यक्तित्व, देह-प्रकृति एवं जीवन-मार्ग का सांकेतिक द्वार माना गया है।',
    role: 'परंपरागत व्याख्या में इसे केंद्र एवं त्रिकोण दोनों का शुभ संगम माना गया है, जो जातक की प्राथमिक चेतना और संसार में उसकी अभिव्यक्ति की आधारशिला का संकेत देता है।'
  },
  2: {
    title: 'धन भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में द्वितीय भाव को \'धन एवं कुटुंब भाव\' कहा जाता है। यह जातक की संचित संपत्ति, वाणी, कुल-परंपरा, प्राथमिक विद्या एवं पारिवारिक मूल्यों का सांकेतिक द्वार है।',
    role: 'परंपरागत व्याख्या में यह मुख, नेत्र एवं जीवन-निर्वाह के पोषण का प्रतिनिधित्व करता है, जिसे मारक एवं पोषण दोनों दृष्टि से देखा जाता है।'
  },
  3: {
    title: 'सहज भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में तृतीय भाव को \'सहज एवं पराक्रम भाव\' कहा जाता है। यह जातक के बाहुबल, पराक्रम, पुरुषार्थ, सहोदर (भाई-बहन), लघु यात्राओं एवं संप्रेषण का द्वार है।',
    role: 'यह उपचय भावों में प्रथम है, जो निरंतर प्रयास, धैर्य और संकल्प शक्ति से जीवन में प्रगति का संकेत देता है।'
  },
  4: {
    title: 'सुख भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में चतुर्थ भाव को \'सुख एवं मातृ भाव\' कहा जाता है। यह जातक के गृह, भूमि, वाहन, मातृ-स्नेह, मानसिक शांति एवं अंतःकरण के आनंद का द्वार है।',
    role: 'यह मोक्ष त्रिकोण का प्रथम केंद्र भाव है, जो बाह्य जगत की हलचलों के बीच हृदय की आंतरिक शांति और आश्रय का प्रतीक है।'
  },
  5: {
    title: 'पुत्र एवं ज्ञान भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में पंचम भाव को \'सुत, बुद्धि एवं पूर्वपुण्य भाव\' कहा जाता है। यह जातक की विवेक-शक्ति, रचनात्मकता, संतान-सुख, मंत्र-दीक्षा एवं प्रारब्ध कर्मों के पुण्य का द्वार है।',
    role: 'यह प्रमुख धर्म त्रिकोण भाव है, जो जातक की प्रज्ञा, उच्च विद्या और नैतिक विवेक की दिशा निर्धारित करता है।'
  },
  6: {
    title: 'रिपु एवं रोग भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में षष्ठ भाव को \'रिपु, रोग एवं ऋण भाव\' कहा जाता है। यह जातक की दैनिक सेवा, संघर्ष क्षमता, रोग-प्रतिरोधक शक्ति, प्रतिस्पर्द्धा एवं ऋण मुक्ति का द्वार है।',
    role: 'यह अर्थ त्रिकोण का उपचय भाव है, जो अनुशासन, सेवा-भाव और कठिन परिश्रम द्वारा बाधाओं पर विजय पाने का मार्ग दर्शाता है।'
  },
  7: {
    title: 'जाया एवं सहभागिता भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में सप्तम भाव को \'जाया एवं काम भाव\' कहा जाता है। यह दांपत्य जीवन, वैवाहिक सुख, व्यापारिक साझेदारी, सामाजिक संबंध एवं बाह्य जगत से संवाद का द्वार है।',
    role: 'यह लग्न के ठीक सम्मुख स्थित प्रमुख केंद्र भाव है, जो स्वयं के दर्पण के रूप में संबंधों के संतुलन का मार्गदर्शन करता है।'
  },
  8: {
    title: 'आयु एवं रन्ध्र भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में अष्टम भाव को \'आयु, रन्ध्र एवं गूढ़ भाव\' कहा जाता है। यह जातक की दीर्घायु, जीवन के गूढ़ रहस्य, परिवर्तन, आकस्मिक घटनाओं एवं आध्यात्मिक रूपांतरण का द्वार है।',
    role: 'यह मोक्ष त्रिकोण का अत्यंत गहन भाव है, जो आंतरिक शुद्धि, शोध और संकटों से पार पाने की अदम्य शक्ति का संकेत देता है।'
  },
  9: {
    title: 'भाग्य एवं धर्म भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में नवम भाव को \'भाग्य एवं धर्म भाव\' कहा जाता है। यह जातक के गुरु, पिता, तीर्थाटन, उच्च दर्शन, दैवीय कृपा एवं धार्मिक आचरण का द्वार है।',
    role: 'यह कुंडली का सबसे बलवान धर्म त्रिकोण भाव है, जो जीवन में नैतिक मूल्यों, सद्विचार और ईश्वरीय अनुग्रह का मार्ग प्रशस्त करता है।'
  },
  10: {
    title: 'कर्म एवं कीर्ति भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में दशम भाव को \'कर्म एवं आजीविका भाव\' कहा जाता है। यह जातक के कार्यक्षेत्र, सामाजिक प्रतिष्ठा, यश, राज्य-मान्यता एवं पुरुषार्थ की पराकाष्ठा का द्वार है।',
    role: 'यह सबसे बलवान केंद्र भाव (दशम केंद्र) है, जो संसार में जातक के कर्तव्य, दायित्व और कर्म-योग की सिद्धि का आधार है।'
  },
  11: {
    title: 'लाभ एवं आय भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में एकादश भाव को \'लाभ एवं आय भाव\' कहा जाता है। यह जातक की सभी अभीष्ट सिद्धियों, धन-प्राप्ति, सामाजिक प्रभाव, मित्र-मंडली एवं आकांक्षाओं की पूर्ति का द्वार है।',
    role: 'यह श्रेष्ठ उपचय भाव है, जहाँ प्रत्येक ग्रह समय के साथ अपने शुभ फल और उपलब्धियों का विस्तार करने में सहायक माना गया है।'
  },
  12: {
    title: 'व्यय एवं मोक्ष भाव का स्वरूप',
    desc: 'पारंपरिक ज्योतिष में द्वादश भाव को \'व्यय एवं मोक्ष भाव\' कहा जाता है। यह जातक के त्याग, दान, एकांत, शयन-सुख, दूरस्थ यात्राओं एवं आत्मिक मुक्ति (मोक्ष) का द्वार है।',
    role: 'यह मोक्ष त्रिकोण का अंतिम भाव है, जो संसार के बंधनों से विरक्ति, समर्पण और आत्म-साक्षात्कार की यात्रा का प्रतीक है।'
  }
};

const DEVANAGARI_DIGITS_MAP: Record<number, string> = {
  1: '१', 2: '२', 3: '३', 4: '४', 5: '५', 6: '६',
  7: '७', 8: '८', 9: '९', 10: '१०', 11: '११', 12: '१२'
};

const ORDINAL_NAMES_MAP: Record<number, string> = {
  1: 'प्रथम भाव', 2: 'द्वितीय भाव', 3: 'तृतीय भाव', 4: 'चतुर्थ भाव',
  5: 'पंचम भाव', 6: 'षष्ठ भाव', 7: 'सप्तम भाव', 8: 'अष्टम भाव',
  9: 'नवम भाव', 10: 'दशम भाव', 11: 'एकादश भाव', 12: 'द्वादश भाव'
};

/**
 * Phase 4.7: Generalized Living Bhava Chamber Knowledge Panel
 * Supports all 12 Bhavas (1–12) using strictly verified data from BhavaAstroViewModel.
 * 
 * Strict Data / Interpretation Separation:
 * 🟢 गणना से प्राप्त डेटा (Calculated Verified Data)
 * 🟡 पारंपरिक ज्योतिषीय व्याख्या (Traditional Jyotish Meaning with careful phrasing)
 */
export const LivingBhavaPanel: React.FC<LivingBhavaPanelProps> = ({
  bhava,
  masterData,
  onClose,
  onSelectPlanet
}) => {
  const fallbackNotice = 'डेटा उपलब्ध नहीं';

  // Verified Calculated Values
  const bhavaNumber = typeof bhava.bhavaNumber === 'number' && bhava.bhavaNumber >= 1 && bhava.bhavaNumber <= 12
    ? bhava.bhavaNumber
    : 1;
  const bhavaName = bhava.bhavaName || fallbackNotice;
  const devanagariDigit = bhava.devanagariNum || DEVANAGARI_DIGITS_MAP[bhavaNumber] || `${bhavaNumber}`;
  const ordinalName = ORDINAL_NAMES_MAP[bhavaNumber] || `भाव ${bhavaNumber}`;

  const rashiNumber = typeof bhava.rashiNumber === 'number' ? bhava.rashiNumber : fallbackNotice;
  const rashiName = bhava.rashiName || (typeof rashiNumber === 'number' ? `राशि ${rashiNumber}` : fallbackNotice);
  const rashiSymbol = bhava.rashiSymbol || '';
  const signLord = bhava.signLord || fallbackNotice;

  // Format Cusp Degree strictly from verified data
  let cuspDegreeDisplay = fallbackNotice;
  if (bhava.cuspFormattedDegree) {
    cuspDegreeDisplay = bhava.cuspFormattedDegree;
  } else if (typeof bhava.cuspDegree === 'number') {
    cuspDegreeDisplay = formatDegreeDMS(bhava.cuspDegree);
  } else if (bhavaNumber === 1 && masterData?.lagna?.degree != null) {
    cuspDegreeDisplay = formatDegreeDMS(masterData.lagna.degree);
  }

  const residentPlanets = Array.isArray(bhava.planets) ? bhava.planets : [];
  const traditionalMeaning = TRADITIONAL_BHAVA_MEANINGS[bhavaNumber] || {
    title: `${bhavaName} का स्वरूप`,
    desc: bhava.signification || 'पारंपरिक वैदिक ज्योतिष में यह भाव जीवन के विशिष्ट अनुभवों और कर्म-क्षेत्र का प्रतिनिधित्व करता है।',
    role: 'यह भाव संबंधित राशि एवं भावेश के माध्यम से जीवन के इस प्रभाग को दिशा प्रदान करता है।'
  };

  const chamberId: ChamberId = bhava.chamberId || (`chamber_${bhavaNumber}` as ChamberId);

  return (
    <div
      role="dialog"
      aria-label={`भाव ${bhavaNumber} ज्ञान पट्टिका`}
      className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto w-full sm:w-[440px] z-40 pointer-events-auto animate-in slide-in-from-bottom duration-300"
    >
      <div className="mx-auto sm:mx-0 max-w-md sm:max-w-none rounded-t-3xl sm:rounded-3xl bg-[#02130b]/96 border-t-2 sm:border-2 border-[#d4af37]/75 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.85),0_0_50px_rgba(212,175,55,0.25)] text-white p-4 sm:p-5 max-h-[78vh] sm:max-h-[85vh] overflow-y-auto">
        
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-[#d4af37]/40 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#d4af37]/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#063b24] to-[#021c11] border border-[#d4af37]/60 flex items-center justify-center text-xl font-bold text-[#fef08a] shadow-lg shrink-0">
              {devanagariDigit}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#fef08a] tracking-wide font-serif">
                  भाव {bhavaNumber} • {bhavaName}
                </h2>
              </div>
              <p className="text-xs text-emerald-300 font-medium">
                {ordinalName} • {bhava.englishTitle || 'Living Knowledge Chamber'}
              </p>
            </div>
          </div>

          {/* Close Button: min 44px practical touch target */}
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-[#d4af37]/40 hover:border-[#d4af37]/80 text-xs sm:text-sm text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer font-medium"
            aria-label="कक्ष से बाहर आएं"
          >
            <X className="w-4 h-4 text-[#d4af37]" />
            <span className="hidden sm:inline">बंद करें</span>
          </button>
        </div>

        {/* SECTION 1: CALCULATED DATA (🟢 गणना से प्राप्त डेटा) */}
        <div className="mt-4 mb-4 p-3.5 rounded-2xl bg-[#041d12]/90 border border-emerald-500/40 shadow-inner">
          <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-emerald-500/25">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              🟢 गणना से प्राप्त डेटा (Calculated Astrological Placements)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Bhava Number */}
            <div className="p-2 rounded-xl bg-black/25 border border-emerald-500/20">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                भाव संख्या
              </span>
              <p className="text-sm font-bold text-white mt-0.5">
                भाव {bhavaNumber} ({ordinalName})
              </p>
            </div>

            {/* Actual Rashi */}
            <div className="p-2 rounded-xl bg-black/25 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">
                स्थित राशि
              </span>
              <p className="text-sm font-bold text-[#fef08a] mt-0.5 truncate">
                {typeof rashiNumber === 'number' ? `राशि ${rashiNumber} • ` : ''}{rashiName} {rashiSymbol}
              </p>
            </div>

            {/* Rashi Lord */}
            <div className="p-2 rounded-xl bg-black/25 border border-emerald-500/20">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                राशि स्वामी (भावेश)
              </span>
              <p className="text-sm font-bold text-white mt-0.5">
                {signLord}
              </p>
            </div>

            {/* Cusp / Bhava Degree */}
            <div className="p-2 rounded-xl bg-black/25 border border-emerald-500/20">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                {bhavaNumber === 1 ? 'लग्न / कस्प अंश' : 'भाव कस्प अंश'}
              </span>
              <p className="text-sm font-bold text-[#a7f3d0] font-mono mt-0.5">
                {cuspDegreeDisplay}
              </p>
            </div>
          </div>

          {/* Resident Planets in Bhava */}
          <div className="mt-3 pt-2.5 border-t border-emerald-500/20">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold mb-1.5">
              स्थित ग्रह (Resident Planets in House {bhavaNumber}):
            </span>

            {residentPlanets.length > 0 ? (
              <div className="flex flex-col gap-2">
                {residentPlanets.map((p) => {
                  const planetDisplayName = p.localizedName || p.name || fallbackNotice;
                  const degDisplay = p.formattedDegree || (typeof p.degree === 'number' ? formatDegreeDMS(p.degree) : fallbackNotice);
                  const nakshatraDisplay = p.nakshatraName ? `${p.nakshatraName} (पद ${p.pada || 1})` : (p.nakshatra ? `नक्षत्र ${p.nakshatra}` : fallbackNotice);
                  const nakLordDisplay = p.nakshatraLord || fallbackNotice;
                  const motionDisplay = p.motion === 'RETROGRADE' || p.isRetrograde ? 'वक्री (R)' : 'मार्गी (D)';

                  return (
                    <button
                      key={p.name}
                      onClick={() => onSelectPlanet && onSelectPlanet(p.name, chamberId)}
                      className="min-h-[44px] w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-[#042416] hover:from-emerald-900/90 hover:to-[#063320] active:scale-[0.99] border border-[#d4af37]/50 hover:border-[#d4af37] text-left transition-all cursor-pointer shadow-sm group"
                      aria-label={`${planetDisplayName} का विवरण देखें`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                            style={{ backgroundColor: `${p.color || '#d4af37'}33`, color: p.color || '#d4af37' }}
                          >
                            {p.symbol || '•'}
                          </span>
                          <div>
                            <span className="text-sm font-bold text-[#fef08a]">{planetDisplayName}</span>
                            <span className="text-xs text-gray-300 font-mono ml-2 font-medium">[{degDisplay}]</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                          <span className="font-semibold">{motionDisplay}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Extended Astronomical Metadata */}
                      <div className="mt-1.5 pt-1.5 border-t border-emerald-500/20 grid grid-cols-2 gap-1 text-[10px] text-gray-300">
                        <div>
                          <span className="text-gray-400">नक्षत्र: </span>
                          <span className="text-emerald-300 font-medium">{nakshatraDisplay}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">नक्षत्रेश: </span>
                          <span className="text-white font-medium">{nakLordDisplay}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-black/20 border border-emerald-500/20 text-xs text-gray-300">
                <p className="text-emerald-300 font-medium">कोई ग्रह स्थित नहीं (स्थान शांति)</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  यह भाव अपने भावेश ({signLord}) एवं अन्य ग्रहों के दृष्टि संबंधों द्वारा संचालित है।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: TRADITIONAL JYOTISH SIGNIFICATION (🟡 पारंपरिक ज्योतिषीय व्याख्या) */}
        <div className="p-3.5 rounded-2xl bg-[#1c1404]/80 border border-amber-500/40 shadow-inner">
          <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-amber-500/25">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              🟡 पारंपरिक ज्योतिषीय व्याख्या (Traditional Vedic Significations)
            </span>
          </div>

          <div className="space-y-2 text-xs text-amber-100/90 leading-relaxed">
            <p>
              <strong className="text-amber-300 font-semibold">{traditionalMeaning.title}: </strong>
              {traditionalMeaning.desc}
            </p>

            <p>
              <strong className="text-amber-300 font-semibold">वैदिक संदर्भ: </strong>
              {traditionalMeaning.role}
            </p>

            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 mt-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200/90 leading-normal">
                <strong>पारंपरिक सूचना: </strong> यह विवरण पारंपरिक सांकेतिक दृष्टिकोण पर आधारित है। इसे किसी वैज्ञानिक तथ्य अथवा अकाट्य भविष्यवाणियों के रूप में नहीं लिया जाना चाहिए।
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Action */}
        <div className="mt-4 pt-3 border-t border-[#d4af37]/30 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            जीवंत कक्ष • भाव {bhavaNumber} ({ordinalName})
          </p>
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37]/20 to-emerald-500/20 hover:from-[#d4af37]/30 hover:to-emerald-500/30 active:scale-95 border border-[#d4af37]/60 text-xs font-bold text-[#fef08a] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>प्रांगण में लौटें (Back)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

