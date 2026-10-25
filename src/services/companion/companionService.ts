import { BirthProfile, MasterKundliData } from '../../types/kundli';
import { DailyCompanionData, DailyCardType } from '../../types/dailyCompanion';
import { DailyCompanionEngine } from './dailyCompanionEngine';

const guidanceCache = new Map<string, DailyCompanionData>();

export class CompanionService {
  /**
   * Retrieves or computes daily companion guidance for a given profile and date.
   */
  static async getDailyGuidance(
    profile: BirthProfile,
    targetDate: Date = new Date(),
    kundliData?: MasterKundliData | null,
    language: 'Hindi' | 'English' = 'Hindi',
    forceRefresh: boolean = false
  ): Promise<DailyCompanionData> {
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const cacheKey = `${profile.name}_${year}-${month}-${day}_${language}`;

    if (!forceRefresh) {
      if (guidanceCache.has(cacheKey)) {
        return guidanceCache.get(cacheKey)!;
      }
      try {
        const stored = localStorage.getItem(`daily_companion_cache_${cacheKey}`);
        if (stored) {
          const parsed = JSON.parse(stored) as DailyCompanionData;
          if (parsed && parsed.date && parsed.cards) {
            guidanceCache.set(cacheKey, parsed);
            return parsed;
          }
        }
      } catch (err) {
        // Ignore JSON/storage parse errors
      }
    }

    // Step 1: Compute deterministic baseline
    const baseline = DailyCompanionEngine.generateDailyGuidance(profile, targetDate, kundliData, language);

    // Step 2: Attempt grounded AI enrichment from server
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch('/api/daily-companion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context: baseline.context,
          language
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const aiResult = await response.json();
        if (aiResult && aiResult.ok && aiResult.enrichedCards) {
          // Merge enriched cards while strictly preserving deterministic facts & audit trail
          const mergedCards = { ...baseline.cards };
          for (const cardKey of Object.keys(aiResult.enrichedCards)) {
            const k = cardKey as DailyCardType;
            if (mergedCards[k] && aiResult.enrichedCards[k]) {
              mergedCards[k] = {
                ...mergedCards[k],
                practicalGuidance: aiResult.enrichedCards[k].practicalGuidance || mergedCards[k].practicalGuidance,
                actionItem: aiResult.enrichedCards[k].actionItem || mergedCards[k].actionItem,
                quoteOrMantra: aiResult.enrichedCards[k].quoteOrMantra || mergedCards[k].quoteOrMantra,
                // Keep calculatedFact and whyAstrologicalBasis locked to deterministic values
                calculatedFact: baseline.cards[k].calculatedFact,
                whyAstrologicalBasis: baseline.cards[k].whyAstrologicalBasis
              };
            }
          }

          const enhancedData: DailyCompanionData = {
            ...baseline,
            cards: mergedCards,
            isAiEnhanced: true,
            aiSourceModel: aiResult.modelUsed || 'JeevanDarpan AI'
          };

          guidanceCache.set(cacheKey, enhancedData);
          try {
            localStorage.setItem(`daily_companion_cache_${cacheKey}`, JSON.stringify(enhancedData));
          } catch (e) {
            // Ignore quota errors
          }
          return enhancedData;
        }
      }
    } catch (err) {
      console.info('Server AI enhancement skipped or offline, using deterministic baseline:', err);
    }

    // Fallback to verified deterministic baseline
    guidanceCache.set(cacheKey, baseline);
    try {
      localStorage.setItem(`daily_companion_cache_${cacheKey}`, JSON.stringify(baseline));
    } catch (e) {
      // Ignore quota errors
    }
    return baseline;
  }

  /**
   * Clears in-memory cache
   */
  static clearCache(): void {
    guidanceCache.clear();
  }
}
