/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — JEEVAN PRAGYA MARGDARSHAN
 * PHASE 1: PREVIEW & SYNTHESIS SERVICE (jeevanPragyaPreviewService.ts)
 * 
 * Synthesizes the overarching "जीवन यात्रा" (Life Journey) timeline concept
 * from MasterKundliData without altering any mathematical calculations.
 */

import { MasterKundliData, BirthProfile } from '../../types/kundli';
import { JeevanYatraSummary, PragyaTimelineItem } from '../../types/jeevanPragya/jeevanPragyaTypes';

export class JeevanPragyaPreviewService {
  /**
   * Builds the comprehensive "जीवन यात्रा" summary.
   */
  public static buildYatraSummary(
    profile: BirthProfile | null,
    masterData: MasterKundliData | null,
    pastItems: PragyaTimelineItem[],
    presentItem: PragyaTimelineItem,
    futureItems: PragyaTimelineItem[]
  ): JeevanYatraSummary {
    const profileName = profile?.name || 'साधक';
    const lagnaSign = masterData?.lagna?.rashiName || 'मेष';
    const moonSign = masterData?.planets?.Moon?.rashiName || 'कर्क';
    const birthNakshatra = masterData?.vimshottariDasha?.birthNakshatra || 'रोहिणी';

    // Calculate approximate age
    let currentAge = 38;
    if (profile?.dob) {
      const birthYear = new Date(profile.dob).getFullYear();
      if (!isNaN(birthYear)) {
        currentAge = Math.max(1, new Date().getFullYear() - birthYear);
      }
    }

    const nextTransition = presentItem?.endDate || '2030-01-01';
    const nextPlanet = futureItems[0]?.planetHindi || 'आगामी ग्रह';

    // Soul purpose derived from Lagna and 9th/10th houses in D1
    const lagnaLord = masterData?.d1Chart?.[1]?.signLord || 'सूर्य';
    const karmaLord = masterData?.d1Chart?.[10]?.signLord || 'बृहस्पति';

    const soulPurpose = `${lagnaSign} लग्न एवं ${moonSign} चंद्र राशि अनुसार, आपका आध्यात्मिक प्रयोजन कर्म की शुद्धि, परिवार व समाज को संबल प्रदान करना, एवं ${presentItem.planetHindi} के अनुशासन में आत्म-साक्षात्कार की ओर अग्रसर होना है।`;

    const overallMotto = 'अतीत से परिपक्वता, वर्तमान में कर्तव्यनिष्ठा, और भविष्य के प्रति आध्यात्मिक सजगता।';

    return {
      profileName,
      lagnaSignHindi: lagnaSign,
      moonSignHindi: moonSign,
      birthNakshatraHindi: birthNakshatra,
      overallMottoHindi: overallMotto,
      soulPurposeHindi: soulPurpose,
      currentAgeYears: currentAge,
      activeDashaSummary: presentItem.periodTitle,
      totalCompletedErasCount: pastItems.length,
      upcomingMilestonesCount: futureItems.length,
      nextMajorTransitionDate: nextTransition,
      nextMajorTransitionPlanetHindi: nextPlanet,
      journeyPhases: {
        pastLabel: pastItems.length > 0 ? `${pastItems.length} कालखंड संचित` : 'आरंभिक चरण',
        pastDominantPlanet: pastItems[pastItems.length - 1]?.planetHindi || 'पूर्व संस्कार',
        presentLabel: presentItem.periodTitle,
        presentDominantPlanet: presentItem.planetHindi,
        futureLabel: futureItems.length > 0 ? `${futureItems.length} आगामी खिड़कियाँ` : 'आगामी काल',
        futureDominantPlanet: nextPlanet
      }
    };
  }
}
