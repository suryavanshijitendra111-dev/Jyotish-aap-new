/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MUHURAT MODULE
 * PHASE 1.12: EXPLAINABILITY & AI SERVICE
 * 
 * Generates scholarly, non-fatalistic "यह समय क्यों?" explanations for
 * Muhurat windows using deterministic shastra parameters.
 */

import { MuhuratWindow } from '../../types/muhurat/muhuratTypes';

export interface MuhuratExplanationResult {
  text: string;
  source: 'AI' | 'DETERMINISTIC_FALLBACK';
  loading?: boolean;
}

export class MuhuratAiService {
  /**
   * Generates deterministic 3-tier explanation without calling any external service
   */
  public static getDeterministicExplanation(window: MuhuratWindow, isHindi: boolean = true): string {
    const p = window.panchang;
    if (isHindi) {
      return `### १. खगोलीय एवं पंचांग तथ्य (Calculated Facts)
- **तिथि:** ${p.tithi.nameHindi} (${p.tithi.groupHindi})
- **वार:** ${p.vara.nameHindi} (वार स्वामी: ${p.vara.lordHindi})
- **नक्षत्र:** ${p.nakshatra.nameHindi} (${p.nakshatra.categoryHindi})
- **योग:** ${p.yoga.nameHindi} (${p.yoga.qualityHindi})
- **करण:** ${p.karana.nameHindi} (${p.karana.qualityHindi})
- **सक्रिय चौघड़िया:** ${window.activeChoghadiya.nameHindi} (${window.activeChoghadiya.significanceHindi})
- **राहुकाल अंतराल:** ${p.solarTimes.rahuKaalStart} से ${p.solarTimes.rahuKaalEnd} (इस मुहूर्त से ${window.hasRahuKaalConflict ? 'संयोगित' : 'मुक्त'})

### २. शास्त्रीय आधार (Traditional Shastra Lineage)
${window.rulesApplied.map(r => `- ${r}`).join('\n')}

${window.reasonsHindi.map(r => `• ${r}`).join('\n')}
${window.cautionsHindi.length > 0 ? `\n**सावधानी / निषेध:**\n${window.cautionsHindi.map(c => `• ${c}`).join('\n')}` : ''}

### ३. व्यावहारिक मार्गदर्शन (Practical Wisdom)
- **अनुशंसित आचरण:** ${window.recommendedActionHindi}
- **पारंपरिक दृष्टिकोण:** यह समय ब्रह्मांडीय शक्तियों के सौम्य एवं अनुकूल स्पंदन का संकेतक है। इसे किसी निश्चित या अचूक सांसारिक गारंटी के रूप में न लें, बल्कि अपने यत्न, ईमानदारी और एकाग्रता के साथ कार्य आरंभ करें।`;
    }

    return `### 1. Calculated Astronomical Facts
- **Tithi:** ${p.tithi.name} (${p.tithi.paksha} Paksha)
- **Weekday:** ${p.vara.name} (Lord: ${p.vara.lord})
- **Nakshatra:** ${p.nakshatra.name} (${p.nakshatra.category})
- **Yoga:** ${p.yoga.name}
- **Karana:** ${p.karana.name}
- **Choghadiya:** ${window.activeChoghadiya.name} (${window.activeChoghadiya.suitability})
- **Rahu Kaal:** ${p.solarTimes.rahuKaalStart} to ${p.solarTimes.rahuKaalEnd} (${window.hasRahuKaalConflict ? 'Conflict' : 'Free'})

### 2. Classical Principles Applied
${window.rulesApplied.map(r => `- ${r}`).join('\n')}

${window.reasonsHindi.map(r => `• ${r}`).join('\n')}

### 3. Actionable Life Wisdom
- This window is an auspicious alignment for conscious action, not a deterministic certainty. Combine timing with diligence and ethical dedication.`;
  }

  /**
   * Requests enriched explanation from downstream AI proxy with deterministic fallback
   */
  public static async getExplanation(
    window: MuhuratWindow,
    language: 'Hindi' | 'English' = 'Hindi'
  ): Promise<MuhuratExplanationResult> {
    const isHindi = language === 'Hindi';
    const fallbackText = this.getDeterministicExplanation(window, isHindi);

    try {
      const prompt = `You are a Vedic Jyotish and Muhurat scholar in JeevanDarpan.
Explain why this specific time window was recommended for the activity: "${window.categoryTitleHindi} (${window.categoryTitleEnglish})".

GIVEN CALCULATED DATA (IMMUTABLE - DO NOT ALTER OR CALCULATE):
- Date: ${window.date} (${window.startTime} to ${window.endTime})
- Suitability: ${window.suitabilityHindi} (Score: ${window.score}/100)
- Tithi: ${window.panchang.tithi.nameHindi}
- Weekday: ${window.panchang.vara.nameHindi}
- Nakshatra: ${window.panchang.nakshatra.nameHindi} (${window.panchang.nakshatra.qualityHindi})
- Yoga: ${window.panchang.yoga.nameHindi}
- Karana: ${window.panchang.karana.nameHindi}
- Active Choghadiya: ${window.activeChoghadiya.nameHindi} (${window.activeChoghadiya.significanceHindi})
- Rahu Kaal: ${window.panchang.solarTimes.rahuKaalStart} to ${window.panchang.solarTimes.rahuKaalEnd} (${window.hasRahuKaalConflict ? 'CONFLICT' : 'FREE'})
- Classical Rules: ${window.rulesApplied.join('; ')}
- Reasons: ${window.reasonsHindi.join('; ')}
- Cautions: ${window.cautionsHindi.join('; ')}

MANDATORY INSTRUCTIONS:
1. Explain concisely in 2-3 structured paragraphs in pure dignified ${language}.
2. DO NOT change or invent any date, time, planet, or degree.
3. DO NOT give 100% guarantees or fatalistic predictions.
4. Emphasize that Muhurat provides favorable celestial alignment, but personal dedication and ethics are essential.`;

      const response = await fetch('/api/ai-jyotish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          language,
          context: {
            category: window.category,
            windowId: window.id,
            date: window.date,
            time: `${window.startTime} - ${window.endTime}`,
            score: window.score,
            tithi: window.panchang.tithi.name,
            nakshatra: window.panchang.nakshatra.name,
            choghadiya: window.activeChoghadiya.name
          }
        })
      });

      if (!response.ok) {
        return { text: fallbackText, source: 'DETERMINISTIC_FALLBACK' };
      }

      const data = await response.json();
      if (data?.answer || data?.text) {
        return { text: data.answer || data.text, source: 'AI' };
      }

      return { text: fallbackText, source: 'DETERMINISTIC_FALLBACK' };
    } catch (e) {
      console.warn('Muhurat AI explanation fallback engaged:', e);
      return { text: fallbackText, source: 'DETERMINISTIC_FALLBACK' };
    }
  }
}
