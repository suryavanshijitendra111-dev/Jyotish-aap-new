/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — KALA SARPA TRADITION ENGINE
 * PHASE 1.13C-2: DETERMINISTIC LONGITUDE-BASED CONTAINMENT ENGINE
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';

export type KalaSarpaClassification = 
  | 'PURNA' 
  | 'PARTIAL_CONTAINMENT' 
  | 'BOUNDARY_CASE' 
  | 'NOT_DETECTED' 
  | string;

export interface BoundaryPlanetInfo {
  planet: string;
  boundaryNode: 'RAHU' | 'KETU';
  degree: number;
}

export interface TraditionalKalaSarpaForm {
  name: string;
  nameHindi: string;
  rahuHouse: number;
  sourceStatus: 'LATER_TRADITION';
}

const TRADITIONAL_12_NAMES: Record<number, { name: string; nameHindi: string }> = {
  1: { name: 'Anant Kala Sarpa', nameHindi: 'अनंत कालसर्प' },
  2: { name: 'Kulik Kala Sarpa', nameHindi: 'कुलिक कालसर्प' },
  3: { name: 'Vasuki Kala Sarpa', nameHindi: 'वासुकि कालसर्प' },
  4: { name: 'Shankhpal Kala Sarpa', nameHindi: 'शंखपाल कालसर्प' },
  5: { name: 'Padma Kala Sarpa', nameHindi: 'पद्म कालसर्प' },
  6: { name: 'Mahapadma Kala Sarpa', nameHindi: 'महापद्म कालसर्प' },
  7: { name: 'Takshak Kala Sarpa', nameHindi: 'तक्षक कालसर्प' },
  8: { name: 'Karkotak Kala Sarpa', nameHindi: 'कर्कोटक कालसर्प' },
  9: { name: 'Shankhachur Kala Sarpa', nameHindi: 'शंखचूड़ कालसर्प' },
  10: { name: 'Ghatak Kala Sarpa', nameHindi: 'घातक कालसर्प' },
  11: { name: 'Vishdhar Kala Sarpa', nameHindi: 'विषधर कालसर्प' },
  12: { name: 'Sheshnag Kala Sarpa', nameHindi: 'शेषनाग कालसर्प' }
};

const PHYSICAL_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;

export class KalaSarpaTraditionEngine {
  public static analyze(masterData: MasterKundliData): any {
    if (!masterData || !masterData.planets) {
      return this.buildInsufficientResult('Kundli data is missing');
    }

    const rahu = masterData.planets.Rahu;
    const ketu = masterData.planets.Ketu;

    if (!rahu || !ketu || typeof rahu.siderealLongitude !== 'number' || typeof ketu.siderealLongitude !== 'number') {
      return this.buildInsufficientResult('Rahu or Ketu longitude missing');
    }

    for (const p of PHYSICAL_PLANETS) {
      const pl = masterData.planets[p];
      if (!pl || typeof pl.siderealLongitude !== 'number') {
        return this.buildInsufficientResult(`Physical planet ${p} longitude missing`);
      }
    }

    const rahuLon = ((rahu.siderealLongitude % 360) + 360) % 360;
    const ketuLon = ((ketu.siderealLongitude % 360) + 360) % 360;

    const spanA = ((ketuLon - rahuLon) % 360 + 360) % 360;
    const spanB = ((rahuLon - ketuLon) % 360 + 360) % 360;

    const boundaryPlanets: BoundaryPlanetInfo[] = [];
    const planetsInsideArcA: string[] = [];
    const planetsOutsideArcA: string[] = [];
    const planetsInsideArcB: string[] = [];
    const planetsOutsideArcB: string[] = [];

    const EPSILON = 0.0001;

    for (const pName of PHYSICAL_PLANETS) {
      const pLon = ((masterData.planets[pName].siderealLongitude % 360) + 360) % 360;

      const diffFromRahu = Math.abs(pLon - rahuLon);
      const diffFromKetu = Math.abs(pLon - ketuLon);

      if (diffFromRahu < EPSILON || Math.abs(diffFromRahu - 360) < EPSILON) {
        boundaryPlanets.push({ planet: pName, boundaryNode: 'RAHU', degree: pLon });
      } else if (diffFromKetu < EPSILON || Math.abs(diffFromKetu - 360) < EPSILON) {
        boundaryPlanets.push({ planet: pName, boundaryNode: 'KETU', degree: pLon });
      }

      // Check Arc A (Rahu -> Ketu)
      const offsetA = ((pLon - rahuLon) % 360 + 360) % 360;
      if (offsetA > EPSILON && offsetA < (spanA - EPSILON)) {
        planetsInsideArcA.push(pName);
      } else {
        planetsOutsideArcA.push(pName);
      }

      // Check Arc B (Ketu -> Rahu)
      const offsetB = ((pLon - ketuLon) % 360 + 360) % 360;
      if (offsetB > EPSILON && offsetB < (spanB - EPSILON)) {
        planetsInsideArcB.push(pName);
      } else {
        planetsOutsideArcB.push(pName);
      }
    }

    let status = 'NOT_PRESENT';
    let classification: KalaSarpaClassification = 'NOT_DETECTED';
    let activeContainedArc: 'ARC_A_RAHU_TO_KETU' | 'ARC_B_KETU_TO_RAHU' | 'NONE' = 'NONE';

    if (boundaryPlanets.length > 0) {
      status = 'NOT_PRESENT';
      classification = 'BOUNDARY_CASE';
    } else if (planetsInsideArcA.length === 7) {
      status = 'PRESENT';
      classification = 'PURNA';
      activeContainedArc = 'ARC_A_RAHU_TO_KETU';
    } else if (planetsInsideArcB.length === 7) {
      status = 'PRESENT';
      classification = 'PURNA';
      activeContainedArc = 'ARC_B_KETU_TO_RAHU';
    } else if (planetsInsideArcA.length === 6 || planetsInsideArcB.length === 6) {
      status = 'NOT_PRESENT';
      classification = 'PARTIAL_CONTAINMENT';
    } else {
      status = 'NOT_PRESENT';
      classification = 'NOT_DETECTED';
    }

    let traditionalFormIfAvailable: TraditionalKalaSarpaForm | null = null;
    const rHouse = rahu.d1House ?? 1;
    if (TRADITIONAL_12_NAMES[rHouse]) {
      traditionalFormIfAvailable = {
        name: TRADITIONAL_12_NAMES[rHouse].name,
        nameHindi: TRADITIONAL_12_NAMES[rHouse].nameHindi,
        rahuHouse: rHouse,
        sourceStatus: 'LATER_TRADITION'
      };
    }

    return {
      doshaId: 'KALA_SARPA_TRADITION',
      status,
      classification,
      activeContainedArc,
      containmentDiagnostics: {
        planetsInsideArcA,
        planetsInsideArcB
      },
      arcA: {
        allSevenContained: planetsInsideArcA.length === 7,
        insidePlanets: planetsInsideArcA,
        outsidePlanets: planetsOutsideArcA
      },
      arcB: {
        allSevenContained: planetsInsideArcB.length === 7,
        insidePlanets: planetsInsideArcB,
        outsidePlanets: planetsOutsideArcB
      },
      boundaryPlanets,
      traditionalFormIfAvailable,
      traditionMetadata: {
        tradition: 'Later Astrological Tradition (20th Century / Regional Compendia)',
        scope: 'Evaluation of total physical planet containment between nodal axis',
        scientificStatus: 'Traditional astrological concept; not scientifically attested'
      },
      disclaimer: {
        en: 'Kala Sarpa Yoga is not attested in foundational classical Parashari texts. It is evaluated here purely under later traditional definitions with exact astronomical degrees.',
        hi: 'कालसर्प योग मूल शास्त्रीय पाराशरी ग्रंथों में उल्लिखित नहीं है। यहाँ इसका विश्लेषण 20वीं शताब्दी के पारंपरिक नियमों और सटीक खगोलीय डिग्रियों के आधार पर किया गया है।'
      }
    };
  }

  private static buildInsufficientResult(reason: string) {
    return {
      doshaId: 'KALA_SARPA_TRADITION',
      status: 'INSUFFICIENT_DATA',
      classification: 'NOT_DETECTED',
      activeContainedArc: 'NONE',
      containmentDiagnostics: {
        planetsInsideArcA: [],
        planetsInsideArcB: []
      },
      arcA: {
        allSevenContained: false,
        insidePlanets: [],
        outsidePlanets: []
      },
      arcB: {
        allSevenContained: false,
        insidePlanets: [],
        outsidePlanets: []
      },
      boundaryPlanets: [],
      traditionalFormIfAvailable: null,
      traditionMetadata: {
        tradition: 'Later Astrological Tradition',
        scope: 'Evaluation of total physical planet containment between nodal axis',
        scientificStatus: 'Traditional astrological concept; not scientifically attested'
      },
      disclaimer: {
        en: `Calculation could not be completed: ${reason}`,
        hi: `गणना पूर्ण नहीं हो सकी: ${reason}`
      }
    };
  }
}
