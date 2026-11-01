/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MUHURAT AI & DETERMINISTIC EXPLAINABILITY SERVICE
 */

import { MuhuratWindow } from '../../types/muhurat/muhuratTypes';

export interface MuhuratExplanationResult {
  text: string;
  source: 'AI' | 'DETERMINISTIC_FALLBACK' | string;
}

export class MuhuratAiService {
  public static getDeterministicExplanation(w: MuhuratWindow, isHindi: boolean = true): string {
    if (isHindi) {
      return `**मुहूर्त शास्त्रीय व्याख्या (${w.categoryTitleHindi})**\n\n` +
        `• **समय विंडो:** ${w.startTime} से ${w.endTime} (${w.durationFormatted})\n` +
        `• **सक्रिय चौघड़िया:** ${w.activeChoghadiya.nameHindi} (${w.activeChoghadiya.significanceHindi})\n` +
        `• **पंचांग आधार:** तिथि ${w.panchang.tithi.nameHindi}, नक्षत्र ${w.panchang.nakshatra.nameHindi}, वार ${w.panchang.vara.nameHindi}\n` +
        `• **शास्त्रीय परिहार:** ${w.rulesApplied.join(', ')}\n\n` +
        `**मार्गदर्शन:**\n${w.recommendedActionHindi}\n\n` +
        `*नोट: मुहूर्त उत्तम शुरुआत की अनुकूलता दर्शाता है, पुरुषार्थ एवं शुद्ध भाव ही सिद्धि का मूल हैं।*`;
    }

    return `**Classical Muhurat Explanation (${w.categoryTitleEnglish})**\n\n` +
      `• **Time Window:** ${w.startTime} to ${w.endTime} (${w.durationFormatted})\n` +
      `• **Active Choghadiya:** ${w.activeChoghadiya.name} (Ruled by ${w.activeChoghadiya.rulingPlanet})\n` +
      `• **Panchang Basis:** Tithi ${w.panchang.tithi.name}, Nakshatra ${w.panchang.nakshatra.name}, Vara ${w.panchang.vara.name}\n` +
      `• **Classical Protection:** ${w.rulesApplied.join(', ')}\n\n` +
      `**Guidance:**\n${w.reasonsHindi.join(' ')}\n\n` +
      `*Disclaimer: Astrological timing aligns natural forces; righteous endeavor is the true foundation of success.*`;
  }

  public static async getExplanation(
    w: MuhuratWindow,
    language: 'Hindi' | 'English' = 'Hindi'
  ): Promise<MuhuratExplanationResult> {
    try {
      const response = await fetch('/api/ai-jyotish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Explain why this Muhurat window is suitable for ${w.categoryTitleEnglish}.`,
          context: {
            category: w.category,
            startTime: w.startTime,
            endTime: w.endTime,
            score: w.score,
            panchang: w.panchang,
            rulesApplied: w.rulesApplied
          },
          language
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.answer || data.text) {
          return {
            text: data.answer || data.text,
            source: 'AI'
          };
        }
      }
    } catch {
      // fallback handled below
    }

    return {
      text: this.getDeterministicExplanation(w, language === 'Hindi'),
      source: 'DETERMINISTIC_FALLBACK'
    };
  }
}
