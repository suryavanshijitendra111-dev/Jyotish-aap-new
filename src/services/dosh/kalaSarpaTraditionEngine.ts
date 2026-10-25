/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — KALA SARPA TRADITION ENGINE (कालसर्प परंपरा)
 * PHASE 1.13C-2: DETERMINISTIC CALCULATION ENGINE
 * 
 * Evaluates geometric containment of all seven physical planets between the
 * Rahu-Ketu nodal axis using exact sidereal longitudes.
 * 
 * STRICT INVARIANTS:
 * - Labeled strictly as "LATER / PRACTITIONER TRADITION" (उत्तर-मध्यकालीन ज्योतिर्परंपरा).
 * - Never claimed as an ancient universally accepted Parashari / BPHS dosha.
 * - Exact longitude-based containment; sign-only logic is explicitly rejected.
 * - Zero artificial severity scores (no 70%, 80%, etc.).
 * - Zero mutation of input MasterKundliData (pure calculation).
 * - Zero remedies, zero AI, zero storage.
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';
import {
  KalaSarpaAnalysisResult,
  KalaSarpaStatus,
  KalaSarpaClassification,
  CandidateArcResult,
  BoundaryPlanetDetail,
  PhysicalPlanetPosition,
  Traditional12Form,
  NodalBoundaryNode
} from '../../types/dosh/kalaSarpaTypes';

const PHYSICAL_PLANET_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const TRADITIONAL_12_FORMS: Record<number, { name: string; nameHindi: string; significanceHindi: string }> = {
  1: {
    name: 'Anant Kala Sarpa',
    nameHindi: 'अनंत कालसर्प',
    significanceHindi: 'लग्न (प्रथम भाव) में राहु एवं सप्तम भाव में केतु की स्थिति। व्यक्तित्व एवं दाम्पत्य सजगता का सूचक।'
  },
  2: {
    name: 'Kulik Kala Sarpa',
    nameHindi: 'कुलिक कालसर्प',
    significanceHindi: 'द्वितीय भाव में राहु एवं अष्टम भाव में केतु की स्थिति। पारिवारिक संवाद एवं संचित धन में अनुशासन अपेक्षित।'
  },
  3: {
    name: 'Vasuki Kala Sarpa',
    nameHindi: 'वासुकि कालसर्प',
    significanceHindi: 'तृतीय भाव में राहु एवं नवम भाव में केतु की स्थिति। पराक्रम, बंधु-संबंध एवं पुरुषार्थ संवर्धन का सूचक।'
  },
  4: {
    name: 'Shankhpal Kala Sarpa',
    nameHindi: 'शंखपाल कालसर्प',
    significanceHindi: 'चतुर्थ भाव में राहु एवं दशम भाव में केतु की स्थिति। गृह-शांति, वाहन सुख एवं मातृ-सेवा का संदेश।'
  },
  5: {
    name: 'Padma Kala Sarpa',
    nameHindi: 'पद्म कालसर्प',
    significanceHindi: 'पंचम भाव में राहु एवं एकादश भाव में केतु की स्थिति। मेधा बुद्धि, विद्या-अध्ययन एवं संतान पर केंद्रित साधना।'
  },
  6: {
    name: 'Mahapadma Kala Sarpa',
    nameHindi: 'महापद्म कालसर्प',
    significanceHindi: 'षष्ठ भाव में राहु एवं द्वादश भाव में केतु की स्थिति। सेवा, ऋण-शत्रु विजय एवं नित्य आरोग्य अनुशासन।'
  },
  7: {
    name: 'Takshak Kala Sarpa',
    nameHindi: 'तक्षक कालसर्प',
    significanceHindi: 'सप्तम भाव में राहु एवं लग्न में केतु की स्थिति। साझेदारी, वैवाहिक समझदारी एवं जनसंपर्क में संतुलन।'
  },
  8: {
    name: 'Karkotak Kala Sarpa',
    nameHindi: 'कर्कोटक कालसर्प',
    significanceHindi: 'अष्टम भाव में राहु एवं द्वितीय भाव में केतु की स्थिति। गूढ़ ज्ञान, शोध प्रवृत्ति एवं आकस्मिक परिवर्तनों में धैर्य।'
  },
  9: {
    name: 'Shankhachur Kala Sarpa',
    nameHindi: 'शंखचूड़ कालसर्प',
    significanceHindi: 'नवम भाव में राहु एवं तृतीय भाव में केतु की स्थिति। धर्म-आचरण, गुरु-कृपा एवं आत्मिक विश्वास का संकेत।'
  },
  10: {
    name: 'Ghatak Kala Sarpa',
    nameHindi: 'घातक कालसर्प',
    significanceHindi: 'दशम भाव में राहु एवं चतुर्थ भाव में केतु की स्थिति। कार्यक्षेत्र, सामाजिक कर्तव्य एवं व्यावसायिक प्रतिष्ठा।'
  },
  11: {
    name: 'Vishdhar Kala Sarpa',
    nameHindi: 'विषधर कालसर्प',
    significanceHindi: 'एकादश भाव में राहु एवं पंचम भाव में केतु की स्थिति। अभीष्ट सिद्धि, लाभार्जन एवं मित्रों के चयन में विवेक।'
  },
  12: {
    name: 'Sheshnag Kala Sarpa',
    nameHindi: 'शेषनाग कालसर्प',
    significanceHindi: 'द्वादश भाव में राहु एवं षष्ठ भाव में केतु की स्थिति। अंतर्मुखी ध्यान, परोपकार, दान एवं आध्यात्मिक मुक्ति।'
  }
};

const EPSILON = 1e-7;

export class KalaSarpaTraditionEngine {
  /**
   * Normalizes an angle into the standard range [0, 360)
   */
  public static normalizeDegrees(deg: number): number {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
  }

  /**
   * Helper to retrieve a planet safely regardless of key casing
   */
  private static getPlanet(
    planets: Record<string, PlanetData> | undefined,
    name: string
  ): PlanetData | null {
    if (!planets) return null;
    return (
      planets[name] ||
      planets[name.toLowerCase()] ||
      planets[name.toUpperCase()] ||
      null
    );
  }

  /**
   * Evaluates containment of physical planets inside a specific nodal arc
   */
  private static evaluateArc(
    arcId: 'ARC_A_RAHU_TO_KETU' | 'ARC_B_KETU_TO_RAHU',
    startNode: NodalBoundaryNode,
    endNode: NodalBoundaryNode,
    startLon: number,
    endLon: number,
    physicalPlanets: Array<{ name: string; longitude: number }>
  ): CandidateArcResult {
    const normStart = this.normalizeDegrees(startLon);
    const normEnd = this.normalizeDegrees(endLon);
    const arcSpan = this.normalizeDegrees(normEnd - normStart);

    const containedPlanets: string[] = [];
    const outsidePlanets: string[] = [];
    const boundaryPlanets: BoundaryPlanetDetail[] = [];

    for (const p of physicalPlanets) {
      const normP = this.normalizeDegrees(p.longitude);
      const pos = this.normalizeDegrees(normP - normStart);

      // Check boundary with start node
      const distToStart = Math.min(pos, Math.abs(360 - pos));
      const distToEnd = Math.abs(pos - arcSpan);

      if (distToStart < EPSILON) {
        boundaryPlanets.push({
          planet: p.name,
          longitude: normP,
          boundaryNode: startNode,
          nodeLongitude: normStart,
          exactBoundary: true
        });
      } else if (distToEnd < EPSILON) {
        boundaryPlanets.push({
          planet: p.name,
          longitude: normP,
          boundaryNode: endNode,
          nodeLongitude: normEnd,
          exactBoundary: true
        });
      } else if (pos > EPSILON && pos < arcSpan - EPSILON) {
        containedPlanets.push(p.name);
      } else {
        outsidePlanets.push(p.name);
      }
    }

    const allSevenContained =
      containedPlanets.length === physicalPlanets.length &&
      outsidePlanets.length === 0 &&
      boundaryPlanets.length === 0;

    let result: 'CONTAINED' | 'FAILED' | 'BOUNDARY_DEGENERATE' = 'FAILED';
    if (allSevenContained) {
      result = 'CONTAINED';
    } else if (boundaryPlanets.length > 0 && outsidePlanets.length === 0) {
      result = 'BOUNDARY_DEGENERATE';
    }

    return {
      arcId,
      startNode,
      endNode,
      startLongitude: normStart,
      endLongitude: normEnd,
      arcSpanDegrees: arcSpan,
      containedPlanets,
      outsidePlanets,
      boundaryPlanets,
      allSevenContained,
      result
    };
  }

  /**
   * Main entry point for pure deterministic Kala Sarpa Tradition analysis
   */
  public static analyze(data: MasterKundliData | null | undefined): KalaSarpaAnalysisResult {
    // 1. Boundary Guard: Chart data missing
    if (!data || !data.planets) {
      return this.buildInsufficientDataResult('कुंडली अथवा ग्रह स्थिति उपलब्ध नहीं है। (Missing chart or planetary data)');
    }

    // 2. Extract and validate Rahu & Ketu longitudes
    const rahu = this.getPlanet(data.planets, 'Rahu');
    const ketu = this.getPlanet(data.planets, 'Ketu');

    if (
      !rahu ||
      typeof rahu.siderealLongitude !== 'number' ||
      isNaN(rahu.siderealLongitude)
    ) {
      return this.buildInsufficientDataResult('राहु का स्पष्ट भोगांश (siderealLongitude) उपलब्ध नहीं है।');
    }

    if (
      !ketu ||
      typeof ketu.siderealLongitude !== 'number' ||
      isNaN(ketu.siderealLongitude)
    ) {
      return this.buildInsufficientDataResult('केतु का स्पष्ट भोगांश (siderealLongitude) उपलब्ध नहीं है।');
    }

    // 3. Extract and validate all 7 physical planets
    const physicalPlanetPositions: PhysicalPlanetPosition[] = [];
    const evaluationPlanets: Array<{ name: string; longitude: number }> = [];

    for (const pName of PHYSICAL_PLANET_NAMES) {
      const p = this.getPlanet(data.planets, pName);
      if (
        !p ||
        typeof p.siderealLongitude !== 'number' ||
        isNaN(p.siderealLongitude)
      ) {
        return this.buildInsufficientDataResult(`ग्रह ${pName} का स्पष्ट भोगांश (siderealLongitude) उपलब्ध नहीं है।`);
      }
      const normLon = this.normalizeDegrees(p.siderealLongitude);
      physicalPlanetPositions.push({
        name: pName,
        longitude: normLon,
        rashi: typeof p.rashi === 'number' ? p.rashi : Math.floor(normLon / 30) + 1,
        d1House: typeof p.d1House === 'number' ? p.d1House : 0
      });
      evaluationPlanets.push({
        name: pName,
        longitude: normLon
      });
    }

    const rahuLon = this.normalizeDegrees(rahu.siderealLongitude);
    const ketuLon = this.normalizeDegrees(ketu.siderealLongitude);

    // 4. Evaluate both candidate arcs
    // Arc A: Rahu -> Ketu
    const arcA = this.evaluateArc(
      'ARC_A_RAHU_TO_KETU',
      'RAHU',
      'KETU',
      rahuLon,
      ketuLon,
      evaluationPlanets
    );

    // Arc B: Ketu -> Rahu
    const arcB = this.evaluateArc(
      'ARC_B_KETU_TO_RAHU',
      'KETU',
      'RAHU',
      ketuLon,
      rahuLon,
      evaluationPlanets
    );

    // Collect all boundary planets across both arcs
    const boundaryPlanetsMap = new Map<string, BoundaryPlanetDetail>();
    for (const b of [...arcA.boundaryPlanets, ...arcB.boundaryPlanets]) {
      boundaryPlanetsMap.set(`${b.planet}_${b.boundaryNode}`, b);
    }
    const boundaryPlanets = Array.from(boundaryPlanetsMap.values());

    // 5. Determine Status & Classification
    let status: KalaSarpaStatus = 'NOT_PRESENT';
    let classification: KalaSarpaClassification = 'NOT_DETECTED';
    let activeContainedArc: 'ARC_A_RAHU_TO_KETU' | 'ARC_B_KETU_TO_RAHU' | null = null;

    if (arcA.allSevenContained) {
      status = 'PRESENT';
      classification = 'PURNA';
      activeContainedArc = 'ARC_A_RAHU_TO_KETU';
    } else if (arcB.allSevenContained) {
      status = 'PRESENT';
      classification = 'PURNA';
      activeContainedArc = 'ARC_B_KETU_TO_RAHU';
    } else if (
      (arcA.boundaryPlanets.length > 0 && arcA.outsidePlanets.length === 0) ||
      (arcB.boundaryPlanets.length > 0 && arcB.outsidePlanets.length === 0)
    ) {
      // Degenerate boundary case: one or more planets are sitting exactly on the node
      status = 'NOT_PRESENT';
      classification = 'BOUNDARY_CASE';
    } else {
      status = 'NOT_PRESENT';
      // Diagnostic check for partial/incomplete containment (e.g. 5 or 6 planets in arc)
      const maxContained = Math.max(arcA.containedPlanets.length, arcB.containedPlanets.length);
      if (maxContained >= 5 && maxContained < 7) {
        classification = 'PARTIAL_CONTAINMENT';
      } else {
        classification = 'NOT_DETECTED';
      }
    }

    // Diagnostics package
    const maxContained = Math.max(arcA.containedPlanets.length, arcB.containedPlanets.length);
    const hasPartialContainment = maxContained >= 5 && maxContained < 7;
    const containmentDiagnostics = {
      planetsInsideArcA: arcA.containedPlanets,
      planetsOutsideArcA: arcA.outsidePlanets,
      planetsInsideArcB: arcB.containedPlanets,
      planetsOutsideArcB: arcB.outsidePlanets,
      boundaryPlanets,
      candidateArcResults: {
        arcA,
        arcB
      },
      hasPartialContainment,
      partialDescription: hasPartialContainment
        ? `One nodal arc contains ${maxContained} of 7 physical planets, while the remaining lie outside. This represents an incomplete alignment, not Purna Kala Sarpa.`
        : 'Planets are distributed across both sides of the nodal axis; no concentrated containment detected.'
    };

    // 6. Traditional 12 Names (Based strictly on existing rahu.d1House)
    let rahuHouseIfAvailable: number | null = null;
    let traditionalFormIfAvailable: Traditional12Form | null = null;

    if (typeof rahu.d1House === 'number' && rahu.d1House >= 1 && rahu.d1House <= 12) {
      rahuHouseIfAvailable = rahu.d1House;
      const formConfig = TRADITIONAL_12_FORMS[rahu.d1House];
      if (formConfig) {
        const ketuHouse = ((rahu.d1House + 6 - 1) % 12) + 1;
        traditionalFormIfAvailable = {
          formId: `FORM_${rahu.d1House}_${formConfig.name.toUpperCase().replace(/\s+/g, '_')}`,
          name: formConfig.name,
          nameHindi: formConfig.nameHindi,
          rahuHouse: rahu.d1House,
          ketuHouse,
          significanceHindi: formConfig.significanceHindi,
          tradition: 'Later practitioner tradition (उत्तर-मध्यकालीन परंपरा)',
          sourceStatus: 'LATER_TRADITION'
        };
      }
    }

    return {
      doshaId: 'KALA_SARPA_TRADITION',
      status,
      classification,
      tradition: 'Later practitioner tradition (उत्तर-मध्यकालीन ज्योतिर्परंपरा)',
      sourceStatus: 'LATER_TRADITION',
      rahuLongitude: rahuLon,
      ketuLongitude: ketuLon,
      arcA,
      arcB,
      physicalPlanetPositions,
      containmentDiagnostics,
      boundaryPlanets,
      rahuHouseIfAvailable,
      traditionalFormIfAvailable,
      activeContainedArc,
      ruleLineage: {
        ruleType: 'KALA_SARPA_TRADITION',
        tradition: 'Later practitioner tradition (उत्तर-मध्यकालीन ज्योतिर्परंपरा)',
        calculationBasis: 'Exact sidereal longitude containment between the Rahu-Ketu nodal axis',
        classicalStatus: 'LATER / PRACTITIONER TRADITION'
      },
      calculatedFacts: {
        rahuLongitude: rahuLon,
        ketuLongitude: ketuLon,
        nodalSpanArcA: arcA.arcSpanDegrees,
        nodalSpanArcB: arcB.arcSpanDegrees,
        physicalPlanetsEvaluated: PHYSICAL_PLANET_NAMES
      },
      disclaimer: {
        en: 'Kala Sarpa is a 20th-century practitioner tradition based on geometric enclosure between the lunar nodes. It is not an ancient Parashari Vedic dosha and does not represent an immutable catastrophe. Many accomplished leaders and scholars possess this planetary alignment.',
        hi: 'कालसर्प विचार उत्तर-मध्यकालीन एवं 20वीं सदी की ज्योतिर्परंपरा पर आधारित खगोलीय संरेखण है। यह प्राचीन पाराशरी संहिता का सार्वभौमिक महादोष नहीं है। इसे किसी शाप या निश्चित अनिष्ट के रूप में न लें; आत्म-साधना एवं कर्तव्यपरायणता सर्वोपरि है।'
      }
    };
  }

  /**
   * Safe fallback response when required planetary longitudes are missing
   */
  private static buildInsufficientDataResult(reasonHindi: string): KalaSarpaAnalysisResult {
    return {
      doshaId: 'KALA_SARPA_TRADITION',
      status: 'INSUFFICIENT_DATA',
      classification: 'NOT_DETECTED',
      tradition: 'Later practitioner tradition (उत्तर-मध्यकालीन ज्योतिर्परंपरा)',
      sourceStatus: 'LATER_TRADITION',
      rahuLongitude: null,
      ketuLongitude: null,
      arcA: null,
      arcB: null,
      physicalPlanetPositions: [],
      containmentDiagnostics: {
        planetsInsideArcA: [],
        planetsOutsideArcA: [],
        planetsInsideArcB: [],
        planetsOutsideArcB: [],
        boundaryPlanets: [],
        candidateArcResults: {
          arcA: {
            arcId: 'ARC_A_RAHU_TO_KETU',
            startNode: 'RAHU',
            endNode: 'KETU',
            startLongitude: 0,
            endLongitude: 0,
            arcSpanDegrees: 0,
            containedPlanets: [],
            outsidePlanets: [],
            boundaryPlanets: [],
            allSevenContained: false,
            result: 'FAILED'
          },
          arcB: {
            arcId: 'ARC_B_KETU_TO_RAHU',
            startNode: 'KETU',
            endNode: 'RAHU',
            startLongitude: 0,
            endLongitude: 0,
            arcSpanDegrees: 0,
            containedPlanets: [],
            outsidePlanets: [],
            boundaryPlanets: [],
            allSevenContained: false,
            result: 'FAILED'
          }
        },
        hasPartialContainment: false,
        partialDescription: 'Insufficient chart data.'
      },
      boundaryPlanets: [],
      rahuHouseIfAvailable: null,
      traditionalFormIfAvailable: null,
      activeContainedArc: null,
      ruleLineage: {
        ruleType: 'KALA_SARPA_TRADITION',
        tradition: 'Later practitioner tradition (उत्तर-मध्यकालीन ज्योतिर्परंपरा)',
        calculationBasis: 'Exact sidereal longitude containment between the Rahu-Ketu nodal axis',
        classicalStatus: 'LATER / PRACTITIONER TRADITION'
      },
      calculatedFacts: {
        rahuLongitude: null,
        ketuLongitude: null,
        nodalSpanArcA: null,
        nodalSpanArcB: null,
        physicalPlanetsEvaluated: []
      },
      disclaimer: {
        en: `Calculation could not be completed: ${reasonHindi}`,
        hi: `गणना पूर्ण नहीं हो सकी: ${reasonHindi}`
      }
    };
  }
}
