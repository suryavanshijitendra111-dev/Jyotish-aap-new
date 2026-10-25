/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PITRISHAPA / ANCESTRAL LINEAGE ANALYSIS (पितृशाप एवं पितृ विचार)
 * PHASE 1.13C-3: DETERMINISTIC CALCULATION ENGINE
 * 
 * Evaluates narrow classical Parashari Purva Janma Shapa indications across
 * four distinct evidence channels: Sun (Pitru Karaka), 9th House (Ancestral Dharma),
 * 9th Lord (Bhagyesh), and Classical Progeny Context.
 * 
 * STRICT INVARIANTS:
 * - Narrow classical framework: derived from Parashari Purva Janma Shapa principles.
 * - Zero generalized fear-based claims (no poverty, no curses, no doomed fate).
 * - Distinguishes calculated astronomical facts from traditional interpretation.
 * - Independent evidence channels; zero artificial numerical scoring.
 * - Pure calculation function; zero mutation of input MasterKundliData.
 * - Zero remedies, zero AI, zero storage.
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';
import {
  PitrishapaAnalysisResult,
  PitrishapaStatus,
  ChannelAfflictionStatus,
  PitrishapaEvidenceItem,
  PitrishapaMitigationItem,
  PitrishapaRuleLineage,
  PitrishapaCalculatedFacts
} from '../../types/dosh/pitrishapaTypes';

const RASHI_NAMES_HI: Record<number, string> = {
  1: 'मेष (Aries)',
  2: 'वृषभ (Taurus)',
  3: 'मिथुन (Gemini)',
  4: 'कर्क (Cancer)',
  5: 'सिंह (Leo)',
  6: 'कन्या (Virgo)',
  7: 'तुला (Libra)',
  8: 'वृश्चिक (Scorpio)',
  9: 'धनु (Sagittarius)',
  10: 'मकर (Capricorn)',
  11: 'कुंभ (Aquarius)',
  12: 'मीन (Pisces)'
};

const RASHI_LORDS: Record<number, string> = {
  1: 'Mars',
  2: 'Venus',
  3: 'Mercury',
  4: 'Moon',
  5: 'Sun',
  6: 'Mercury',
  7: 'Venus',
  8: 'Mars',
  9: 'Jupiter',
  10: 'Saturn',
  11: 'Saturn',
  12: 'Jupiter'
};

export class PitrishapaEngine {
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
   * Calculates relative house of houseB from houseA in whole-sign system:
   * ((houseB - houseA + 12) % 12) + 1
   */
  public static calculateRelativeHouse(houseA: number, houseB: number): number {
    return ((houseB - houseA + 12) % 12) + 1;
  }

  /**
   * Checks whether Jupiter casts a full Parashari aspect (1st conjunction, 5th, 7th, or 9th aspect) on targetHouse
   */
  private static jupiterAspectsHouse(jupiterHouse: number, targetHouse: number): boolean {
    const diff = this.calculateRelativeHouse(jupiterHouse, targetHouse);
    return diff === 1 || diff === 5 || diff === 7 || diff === 9;
  }

  /**
   * Main entry point for pure deterministic Pitrishapa analysis
   */
  public static analyze(data: MasterKundliData | null | undefined): PitrishapaAnalysisResult {
    // 1. Boundary Guard: Missing chart or planetary data
    if (!data || !data.lagna || !data.planets) {
      return this.buildInsufficientDataResult('कुंडली अथवा ग्रह स्थिति उपलब्ध नहीं है। (Missing chart or planetary data)');
    }

    const lagna = data.lagna;
    if (typeof lagna.rashi !== 'number' || lagna.rashi < 1 || lagna.rashi > 12) {
      return this.buildInsufficientDataResult('लग्न राशि अनुपलब्ध है। (Missing Lagna rashi)');
    }

    const sun = this.getPlanet(data.planets, 'Sun');
    const rahu = this.getPlanet(data.planets, 'Rahu');
    const ketu = this.getPlanet(data.planets, 'Ketu');
    const saturn = this.getPlanet(data.planets, 'Saturn');
    const jupiter = this.getPlanet(data.planets, 'Jupiter');

    if (!sun || typeof sun.d1House !== 'number' || !rahu || typeof rahu.d1House !== 'number') {
      return this.buildInsufficientDataResult('सूर्य अथवा राहु की स्थिति उपलब्ध नहीं है। (Missing Sun or Rahu position)');
    }

    // 2. Resolve 9th House Rashi & 9th Lord
    const ninthHouseRashi = ((lagna.rashi + 8 - 1) % 12) + 1;
    const ninthLordName =
      (data.d1Chart && data.d1Chart[9] && data.d1Chart[9].signLord) ||
      RASHI_LORDS[ninthHouseRashi] ||
      'Unknown';
    const ninthLordPlanet = this.getPlanet(data.planets, ninthLordName);

    // 3. Channel A: Sun (Pitru Karaka) Evidence
    const sunEvidence: PitrishapaEvidenceItem[] = [
      {
        ruleId: 'PITRU_SUN_RAHU',
        ruleName: 'Sun Conjunct Rahu (सूर्य-राहु युति)',
        ruleNameHindi: 'सूर्य एवं राहु की युति (सूर्य ग्रहण प्रभाव)',
        triggered: sun.d1House === rahu.d1House,
        channel: 'SUN',
        primaryTarget: 'Sun',
        afflictingPlanet: 'Rahu',
        house: sun.d1House,
        rashi: sun.rashi,
        rashiName: RASHI_NAMES_HI[sun.rashi] || null,
        degree: typeof sun.degree === 'number' ? sun.degree : null,
        tradition: 'Parashari Purva Janma Shapa / Brihat Parashara Hora Shastra',
        confidence: 'CONFIDENT_CLASSICAL',
        calculatedFact: `Sun is conjunct Rahu in house ${sun.d1House} (${RASHI_NAMES_HI[sun.rashi] || ''}).`,
        calculatedFactHindi: `सूर्य एवं राहु भाव ${sun.d1House} (${RASHI_NAMES_HI[sun.rashi] || ''}) में एक साथ स्थित हैं।`,
        traditionalInterpretation: 'In classical Parashari Purva Janma Shapa traditions, the conjunction of natural Pitru Karaka Sun with Rahu indicates an ancestral-karma imprint encouraging conscious service, humility, and ancestral gratitude.',
        traditionalInterpretationHindi: 'पाराशरी पूर्वजन्म शाप परंपरा में सूर्य-राहु युति को पितृकारक पर छाया प्रभाव माना गया है, जो पूर्वजों के प्रति आदर, सात्विक आचरण एवं श्रद्धा-तर्पण का संदेश देता है।'
      },
      {
        ruleId: 'PITRU_SUN_KETU',
        ruleName: 'Sun Conjunct Ketu (सूर्य-केतु युति)',
        ruleNameHindi: 'सूर्य एवं केतु की युति',
        triggered: ketu && typeof ketu.d1House === 'number' ? sun.d1House === ketu.d1House : false,
        channel: 'SUN',
        primaryTarget: 'Sun',
        afflictingPlanet: 'Ketu',
        house: sun.d1House,
        rashi: sun.rashi,
        rashiName: RASHI_NAMES_HI[sun.rashi] || null,
        degree: typeof sun.degree === 'number' ? sun.degree : null,
        tradition: 'Parashari Purva Janma Shapa tradition',
        confidence: 'CONFIDENT_CLASSICAL',
        calculatedFact: `Sun is conjunct Ketu in house ${sun.d1House} (${RASHI_NAMES_HI[sun.rashi] || ''}).`,
        calculatedFactHindi: `सूर्य एवं केतु भाव ${sun.d1House} में युतिस्थ हैं।`,
        traditionalInterpretation: 'Sun conjunct Ketu is traditionally interpreted as a spiritualized ancestral lesson promoting detachment, self-inquiry, and internal peace.',
        traditionalInterpretationHindi: 'सूर्य-केतु युति पारंपरिक दृष्टिकोण में वैराग्य, आत्म-साधना एवं पितृ-स्मरण का आध्यात्मिक संकेतक है।'
      },
      {
        ruleId: 'PITRU_SUN_SATURN',
        ruleName: 'Sun Conjunct Saturn (सूर्य-शनि युति)',
        ruleNameHindi: 'सूर्य एवं शनि की युति (पिता-पुत्र नैसर्गिक विरोध)',
        triggered: saturn && typeof saturn.d1House === 'number' ? sun.d1House === saturn.d1House : false,
        channel: 'SUN',
        primaryTarget: 'Sun',
        afflictingPlanet: 'Saturn',
        house: sun.d1House,
        rashi: sun.rashi,
        rashiName: RASHI_NAMES_HI[sun.rashi] || null,
        degree: typeof sun.degree === 'number' ? sun.degree : null,
        tradition: 'Classical Parashari / Hora Shastra',
        confidence: 'CONFIDENT_CLASSICAL',
        calculatedFact: `Sun is conjunct Saturn in house ${sun.d1House} (${RASHI_NAMES_HI[sun.rashi] || ''}).`,
        calculatedFactHindi: `सूर्य एवं शनि भाव ${sun.d1House} में एक साथ स्थित हैं।`,
        traditionalInterpretation: 'The conjunction of Sun and Saturn traditionally signifies generational friction or karmic responsibilities towards elders, calling for patience and filial respect.',
        traditionalInterpretationHindi: 'सूर्य-शनि युति पारंपरिक रूप से पिता-पुत्र अथवा पीढ़ीगत वैचारिक मतभेद एवं दायित्व-निर्वहन का संकेत करती है।'
      }
    ];

    // 4. Channel B: 9th House (Ancestral Dharma) Evidence
    const ninthHouseEvidence: PitrishapaEvidenceItem[] = [
      {
        ruleId: 'PITRU_9TH_RAHU',
        ruleName: 'Rahu in 9th House (नवम भाव में राहु)',
        ruleNameHindi: 'भाग्य एवं धर्म (नवम) भाव में राहु की स्थिति',
        triggered: rahu.d1House === 9,
        channel: 'NINTH_HOUSE',
        primaryTarget: '9th House',
        afflictingPlanet: 'Rahu',
        house: 9,
        rashi: ninthHouseRashi,
        rashiName: RASHI_NAMES_HI[ninthHouseRashi] || null,
        degree: typeof rahu.degree === 'number' ? rahu.degree : null,
        tradition: 'Parashari Purva Janma Shapa / Dharma Sthana framework',
        confidence: 'CONFIDENT_CLASSICAL',
        calculatedFact: `Rahu is placed in the 9th house (${RASHI_NAMES_HI[ninthHouseRashi] || ''}).`,
        calculatedFactHindi: `राहु नवम भाव (${RASHI_NAMES_HI[ninthHouseRashi] || ''}) में स्थित है।`,
        traditionalInterpretation: 'Rahu occupying the 9th house is traditionally viewed as an unconventional approach to ancestral heritage, directing the native to seek higher ethical discernment.',
        traditionalInterpretationHindi: 'नवम भाव में राहु की स्थिति पारंपरिक शास्त्रों में पैतृक परम्पराओं के प्रति नवीन दृष्टिकोण एवं सत्य-धर्म के शोध का संकेत मानी जाती है।'
      },
      {
        ruleId: 'PITRU_9TH_KETU',
        ruleName: 'Ketu in 9th House (नवम भाव में केतु)',
        ruleNameHindi: 'नवम भाव में केतु की स्थिति',
        triggered: ketu && typeof ketu.d1House === 'number' ? ketu.d1House === 9 : false,
        channel: 'NINTH_HOUSE',
        primaryTarget: '9th House',
        afflictingPlanet: 'Ketu',
        house: 9,
        rashi: ninthHouseRashi,
        rashiName: RASHI_NAMES_HI[ninthHouseRashi] || null,
        degree: ketu && typeof ketu.degree === 'number' ? ketu.degree : null,
        tradition: 'Parashari Dharma Sthana framework',
        confidence: 'CONFIDENT_CLASSICAL',
        calculatedFact: `Ketu is placed in the 9th house (${RASHI_NAMES_HI[ninthHouseRashi] || ''}).`,
        calculatedFactHindi: `केतु नवम भाव में स्थित है।`,
        traditionalInterpretation: 'Ketu in the 9th house encourages spiritual contemplation, pilgrimage, and liberation from dogmatic constraints.',
        traditionalInterpretationHindi: 'नवम भाव में केतु अंतर्मुखी साधना, तीर्थाटन एवं पारंपरिक संस्कारों के प्रति सहज निष्ठा का द्योतक है।'
      },
      {
        ruleId: 'PITRU_9TH_SATURN',
        ruleName: 'Saturn in 9th House (नवम भाव में शनि)',
        ruleNameHindi: 'नवम भाव में शनि की स्थिति',
        triggered: saturn && typeof saturn.d1House === 'number' ? saturn.d1House === 9 : false,
        channel: 'NINTH_HOUSE',
        primaryTarget: '9th House',
        afflictingPlanet: 'Saturn',
        house: 9,
        rashi: ninthHouseRashi,
        rashiName: RASHI_NAMES_HI[ninthHouseRashi] || null,
        degree: saturn && typeof saturn.degree === 'number' ? saturn.degree : null,
        tradition: 'Parashari / Hora Shastra',
        confidence: 'CONFIDENT_CLASSICAL',
        calculatedFact: `Saturn is placed in the 9th house (${RASHI_NAMES_HI[ninthHouseRashi] || ''}).`,
        calculatedFactHindi: `शनि नवम भाव में स्थित है।`,
        traditionalInterpretation: 'Saturn in the 9th house signifies delayed fortune or demanding duties toward father and teachers, instilling disciplined virtue.',
        traditionalInterpretationHindi: 'नवम भाव में शनि भाग्योदय में विलंब अथवा गुरुजनों के प्रति कठोर परिश्रम व सेवा का सूचक है।'
      }
    ];

    // 5. Channel C: 9th Lord Evidence
    const ninthLordEvidence: PitrishapaEvidenceItem[] = [];
    if (ninthLordPlanet && typeof ninthLordPlanet.d1House === 'number') {
      const lordHouse = ninthLordPlanet.d1House;
      ninthLordEvidence.push(
        {
          ruleId: 'PITRU_9TH_LORD_RAHU',
          ruleName: `9th Lord (${ninthLordName}) Conjunct Rahu`,
          ruleNameHindi: `नवमेश (${ninthLordName}) एवं राहु की युति`,
          triggered: lordHouse === rahu.d1House,
          channel: 'NINTH_LORD',
          primaryTarget: `9th Lord (${ninthLordName})`,
          afflictingPlanet: 'Rahu',
          house: lordHouse,
          rashi: ninthLordPlanet.rashi,
          rashiName: RASHI_NAMES_HI[ninthLordPlanet.rashi] || null,
          degree: typeof ninthLordPlanet.degree === 'number' ? ninthLordPlanet.degree : null,
          tradition: 'Parashari Purva Janma Shapa tradition',
          confidence: 'CONFIDENT_CLASSICAL',
          calculatedFact: `9th lord (${ninthLordName}) is conjunct Rahu in house ${lordHouse}.`,
          calculatedFactHindi: `नवम भाव का स्वामी (${ninthLordName}) भाव ${lordHouse} में राहु के साथ स्थित है।`,
          traditionalInterpretation: 'The conjunction of the 9th lord with Rahu points to karmic lessons surrounding lineage ethics and integrity in promises.',
          traditionalInterpretationHindi: 'नवमेश की राहु के साथ युति पैतृक मूल्यों एवं धर्म-आचरण में निष्ठा बनाए रखने का संकेत करती है।'
        },
        {
          ruleId: 'PITRU_9TH_LORD_KETU',
          ruleName: `9th Lord (${ninthLordName}) Conjunct Ketu`,
          ruleNameHindi: `नवमेश (${ninthLordName}) एवं केतु की युति`,
          triggered: ketu && typeof ketu.d1House === 'number' ? lordHouse === ketu.d1House : false,
          channel: 'NINTH_LORD',
          primaryTarget: `9th Lord (${ninthLordName})`,
          afflictingPlanet: 'Ketu',
          house: lordHouse,
          rashi: ninthLordPlanet.rashi,
          rashiName: RASHI_NAMES_HI[ninthLordPlanet.rashi] || null,
          degree: typeof ninthLordPlanet.degree === 'number' ? ninthLordPlanet.degree : null,
          tradition: 'Parashari Purva Janma Shapa tradition',
          confidence: 'CONFIDENT_CLASSICAL',
          calculatedFact: `9th lord (${ninthLordName}) is conjunct Ketu in house ${lordHouse}.`,
          calculatedFactHindi: `नवमेश (${ninthLordName}) भाव ${lordHouse} में केतु के साथ स्थित है।`,
          traditionalInterpretation: 'The conjunction of the 9th lord with Ketu suggests spiritualized ancestral ties requiring selfless service.',
          traditionalInterpretationHindi: 'नवमेश-केतु युति पूर्वजों के प्रति निष्काम सेवा एवं धार्मिक दान-पुण्य की प्रेरणा देती है।'
        },
        {
          ruleId: 'PITRU_9TH_LORD_SATURN',
          ruleName: `9th Lord (${ninthLordName}) Conjunct Saturn`,
          ruleNameHindi: `नवमेश (${ninthLordName}) एवं शनि की युति`,
          triggered:
            Boolean(ninthLordName !== 'Saturn' &&
            saturn &&
            typeof saturn.d1House === 'number' &&
            lordHouse === saturn.d1House),
          channel: 'NINTH_LORD',
          primaryTarget: `9th Lord (${ninthLordName})`,
          afflictingPlanet: 'Saturn',
          house: lordHouse,
          rashi: ninthLordPlanet.rashi,
          rashiName: RASHI_NAMES_HI[ninthLordPlanet.rashi] || null,
          degree: typeof ninthLordPlanet.degree === 'number' ? ninthLordPlanet.degree : null,
          tradition: 'Parashari / Hora Shastra',
          confidence: 'CONFIDENT_CLASSICAL',
          calculatedFact: `9th lord (${ninthLordName}) is conjunct Saturn in house ${lordHouse}.`,
          calculatedFactHindi: `नवमेश (${ninthLordName}) भाव ${lordHouse} में शनि के साथ स्थित है।`,
          traditionalInterpretation: 'The conjunction of the 9th lord with Saturn indicates rigorous duties toward family legacy, solved through steady diligence.',
          traditionalInterpretationHindi: 'नवमेश-शनि युति कुल-मर्यादा एवं पारिवारिक दायित्वों के प्रति निरंतर निष्ठा का आह्वान करती है।'
        }
      );
    }

    // 6. Channel D: Classical Progeny-Related Scope (BPHS Ch. 84 Purva Janma Shapa)
    const progenyRelatedEvidence: PitrishapaEvidenceItem[] = [
      {
        ruleId: 'PITRU_PROGENY_SUN_5TH_RAHU',
        ruleName: 'Sun in 5th House Conjunct Rahu (पंचमस्थ सूर्य-राहु)',
        ruleNameHindi: 'पंचम (संतान) भाव में सूर्य-राहु की युति',
        triggered:
          Boolean(sun.d1House === 5 && rahu.d1House === 5),
        channel: 'PROGENY_CONTEXT',
        primaryTarget: '5th House / Sun',
        afflictingPlanet: 'Rahu',
        house: 5,
        rashi: sun.rashi,
        rashiName: RASHI_NAMES_HI[sun.rashi] || null,
        degree: typeof sun.degree === 'number' ? sun.degree : null,
        tradition: 'Brihat Parashara Hora Shastra • Purva Janma Shapa Adhyaya',
        confidence: 'CONFIDENT_CLASSICAL',
        calculatedFact: 'Sun and Rahu are conjunct specifically in the 5th house of progeny.',
        calculatedFactHindi: 'सूर्य एवं राहु संतान (पंचम) भाव में एक साथ स्थित हैं।',
        traditionalInterpretation: 'In BPHS Purva Janma Shapa, this combination is specifically cited regarding ancestral karma and progeny timing. It advises ancestral honour and satvik charity.',
        traditionalInterpretationHindi: 'बृहत्पाराशर होराशास्त्र के पूर्वजन्म शाप अध्याय में यह योग संतानोत्पत्ति में विलंब अथवा पितृ-ऋण मुक्ति हेतु सात्विक तर्पण व सेवा का विधान करता है।'
      },
      {
        ruleId: 'PITRU_PROGENY_SUN_5TH_SATURN',
        ruleName: 'Sun in 5th House Conjunct Saturn (पंचमस्थ सूर्य-शनि)',
        ruleNameHindi: 'पंचम भाव में सूर्य-शनि की युति',
        triggered:
          Boolean(sun.d1House === 5 &&
          saturn &&
          typeof saturn.d1House === 'number' &&
          saturn.d1House === 5),
        channel: 'PROGENY_CONTEXT',
        primaryTarget: '5th House / Sun',
        afflictingPlanet: 'Saturn',
        house: 5,
        rashi: sun.rashi,
        rashiName: RASHI_NAMES_HI[sun.rashi] || null,
        degree: typeof sun.degree === 'number' ? sun.degree : null,
        tradition: 'Brihat Parashara Hora Shastra • Purva Janma Shapa Adhyaya',
        confidence: 'CONFIDENT_CLASSICAL',
        calculatedFact: 'Sun and Saturn are conjunct specifically in the 5th house of progeny.',
        calculatedFactHindi: 'सूर्य एवं शनि पंचम भाव में एक साथ स्थित हैं।',
        traditionalInterpretation: 'BPHS identifies Sun-Saturn in the 5th as a karmic lesson related to children and spiritual lineage, requiring patience.',
        traditionalInterpretationHindi: 'बृहत्पाराशर होराशास्त्र में यह योग संतान भाव में धैर्य, सदाचार एवं पितृ-कृतज्ञता की साधना का संकेत करता है।'
      }
    ];

    // 7. Classical Jupiter Mitigation Checks
    const mitigationChecks: PitrishapaMitigationItem[] = [];
    if (jupiter && typeof jupiter.d1House === 'number') {
      const jupHouse = jupiter.d1House;

      // Mitigation 1: Jupiter aspects or conjuncts Sun
      const jupSunAspect = this.jupiterAspectsHouse(jupHouse, sun.d1House);
      mitigationChecks.push({
        ruleId: 'MITIGATION_JUPITER_SUN',
        name: 'Benefic Jupiter Aspect or Conjunction on Sun (सूर्य पर गुरु कृपा)',
        nameHindi: 'सूर्य पर देवगुरु बृहस्पति की दृष्टि अथवा युति',
        triggered: jupSunAspect,
        mitigatingPlanet: 'Jupiter',
        target: 'Sun',
        mechanism: jupHouse === sun.d1House ? 'Conjunction' : 'Aspect',
        explanation: 'Natural benefic Jupiter casting its 5th, 7th, 9th aspect or conjunction on Sun provides divine grace and neutralizes ancestral affliction.',
        explanationHindi: 'देवगुरु बृहस्पति की सूर्य पर पूर्ण दृष्टि (5वीं, 7वीं, 9वीं) अथवा युति पितृकारक को बल प्रदान करती है तथा दोष का शमन करती है।',
        tradition: 'Classical Parashari Hora Shastra',
        confidence: 'CONFIDENT_CLASSICAL'
      });

      // Mitigation 2: Jupiter in 9th house or aspects 9th house
      const jup9thAspect = this.jupiterAspectsHouse(jupHouse, 9);
      mitigationChecks.push({
        ruleId: 'MITIGATION_JUPITER_9TH_HOUSE',
        name: 'Jupiter in 9th House or Aspecting 9th House (नवम भाव पर गुरु प्रभाव)',
        nameHindi: 'नवम भाव में गुरु की स्थिति अथवा नवम भाव पर दृष्टि',
        triggered: jup9thAspect,
        mitigatingPlanet: 'Jupiter',
        target: '9th House',
        mechanism: jupHouse === 9 ? 'Conjunction' : 'Aspect',
        explanation: 'Jupiter occupying or aspecting the 9th house (Dharma/Bhagya Sthana) fortifies ancestral blessings and protects virtue.',
        explanationHindi: 'नवम भाव में गुरु की उपस्थिति अथवा पूर्ण दृष्टि कुल-मर्यादा, धर्म-आचरण एवं पितृ-आशीर्वाद को सुरक्षित रखती है।',
        tradition: 'Classical Parashari Hora Shastra',
        confidence: 'CONFIDENT_CLASSICAL'
      });

      // Mitigation 3: Jupiter aspects 9th lord
      if (ninthLordPlanet && typeof ninthLordPlanet.d1House === 'number') {
        const jupLordAspect = this.jupiterAspectsHouse(jupHouse, ninthLordPlanet.d1House);
        mitigationChecks.push({
          ruleId: 'MITIGATION_JUPITER_9TH_LORD',
          name: `Jupiter Aspect or Conjunction on 9th Lord (${ninthLordName})`,
          nameHindi: `नवमेश (${ninthLordName}) पर गुरु की दृष्टि अथवा युति`,
          triggered: jupLordAspect,
          mitigatingPlanet: 'Jupiter',
          target: '9th Lord',
          mechanism: jupHouse === ninthLordPlanet.d1House ? 'Conjunction' : 'Aspect',
          explanation: `Jupiter's aspect or conjunction with 9th lord (${ninthLordName}) protects the native's fortune and mitigates ancestral friction.`,
          explanationHindi: `नवमेश (${ninthLordName}) पर गुरु का शुभ प्रभाव भाग्योदय में स्थिरता एवं पितृ-सौहार्द प्रदान करता है।`,
          tradition: 'Classical Parashari Hora Shastra',
          confidence: 'CONFIDENT_CLASSICAL'
        });
      }
    }

    const activeMitigationsCount = mitigationChecks.filter(m => m.triggered).length;

    // Evaluate Channel Afflictions
    const hasSunAffliction = sunEvidence.some(e => e.triggered);
    const has9thHouseAffliction = ninthHouseEvidence.some(e => e.triggered);
    const has9thLordAffliction = ninthLordEvidence.some(e => e.triggered);
    const hasProgenyAffliction = progenyRelatedEvidence.some(e => e.triggered);

    const isPresent =
      hasSunAffliction ||
      has9thHouseAffliction ||
      has9thLordAffliction ||
      hasProgenyAffliction;

    const overallStatus: PitrishapaStatus = isPresent ? 'PRESENT' : 'NOT_PRESENT';
    const mitigated = isPresent && activeMitigationsCount > 0;

    // 8. Rule Lineage Documentation
    const ruleLineage: PitrishapaRuleLineage[] = [
      {
        ruleId: 'BPHS_PURVA_JANMA_SHAPA_CORE',
        ruleName: 'Parashari Purva Janma Shapa Framework',
        sourceFamily: 'Brihat Parashara Hora Shastra (BPHS)',
        classicalStatus: 'ATTESTED_CLASSICAL_FRAMEWORK_WITH_NARROW_SCOPE',
        tradition: 'Parashari',
        scope: 'Sun (Pitru Karaka), 9th house (Dharma/Lineage), and 5th house progeny context',
        confidence: 'HIGH',
        explanation: 'Evaluates authentic classical afflictions to Sun, 9th house, 9th lord, and 5th house without adopting modern commercialized fear-based expansions.'
      }
    ];

    // 9. Calculated Facts
    const calculatedFacts: PitrishapaCalculatedFacts = {
      sunHouse: sun.d1House,
      sunSign: sun.rashi,
      sunDegree: typeof sun.degree === 'number' ? sun.degree : null,
      ninthHouseRashi,
      ninthHouseLord: ninthLordName,
      ninthHouseLordHouse: ninthLordPlanet ? ninthLordPlanet.d1House : null,
      ninthHousePlanets:
        data.d1Chart && data.d1Chart[9] && Array.isArray(data.d1Chart[9].planetsOccupying)
          ? data.d1Chart[9].planetsOccupying
          : [],
      rahuHouse: rahu.d1House,
      ketuHouse: ketu ? ketu.d1House : null,
      saturnHouse: saturn ? saturn.d1House : null,
      jupiterHouse: jupiter ? jupiter.d1House : null
    };

    return {
      doshaId: 'PITRISHAPA_ANALYSIS',
      status: overallStatus,
      classicalStatus: 'ATTESTED_CLASSICAL_FRAMEWORK_WITH_NARROW_SCOPE',
      tradition: 'Parashari Purva Janma Shapa / Pitrishapa tradition',
      channelStatus: {
        sunAffliction: hasSunAffliction ? 'PRESENT' : 'NOT_PRESENT',
        ninthHouseAffliction: has9thHouseAffliction ? 'PRESENT' : 'NOT_PRESENT',
        ninthLordAffliction: has9thLordAffliction ? 'PRESENT' : 'NOT_PRESENT',
        progenyAffliction: hasProgenyAffliction ? 'PRESENT' : 'NOT_PRESENT'
      },
      sunEvidence,
      ninthHouseEvidence,
      ninthLordEvidence,
      progenyRelatedEvidence,
      mitigationChecks,
      mitigated,
      activeMitigationsCount,
      ruleLineage,
      calculatedFacts,
      disclaimer: {
        en: 'This analysis is based on classical Parashari Purva Janma Shapa principles regarding ancestral lineage and progeny context. It must not be interpreted as a scientific cause-and-effect relationship or a fatalistic curse. It does not predict poverty, disease, or doomed misfortune.',
        hi: 'यह विश्लेषण बृहत्पाराशर होराशास्त्र के पूर्वजन्म शाप एवं पितृ-चिंतन के शास्त्रीय नियमों पर आधारित है। इसे किसी वास्तविक शाप, पारिवारिक दुर्भाग्य अथवा वैज्ञानिक कारण-परिणाम के रूप में न लें। यह गरीबी, रोग या असफलता की निश्चित भविष्यवाणी नहीं है।'
      }
    };
  }

  /**
   * Safe fallback response when required chart parameters are absent
   */
  private static buildInsufficientDataResult(reasonHindi: string): PitrishapaAnalysisResult {
    return {
      doshaId: 'PITRISHAPA_ANALYSIS',
      status: 'INSUFFICIENT_DATA',
      classicalStatus: 'ATTESTED_CLASSICAL_FRAMEWORK_WITH_NARROW_SCOPE',
      tradition: 'Parashari Purva Janma Shapa / Pitrishapa tradition',
      channelStatus: {
        sunAffliction: 'INSUFFICIENT_DATA',
        ninthHouseAffliction: 'INSUFFICIENT_DATA',
        ninthLordAffliction: 'INSUFFICIENT_DATA',
        progenyAffliction: 'INSUFFICIENT_DATA'
      },
      sunEvidence: [],
      ninthHouseEvidence: [],
      ninthLordEvidence: [],
      progenyRelatedEvidence: [],
      mitigationChecks: [],
      mitigated: false,
      activeMitigationsCount: 0,
      ruleLineage: [],
      calculatedFacts: {
        sunHouse: null,
        sunSign: null,
        sunDegree: null,
        ninthHouseRashi: null,
        ninthHouseLord: null,
        ninthHouseLordHouse: null,
        ninthHousePlanets: [],
        rahuHouse: null,
        ketuHouse: null,
        saturnHouse: null,
        jupiterHouse: null
      },
      disclaimer: {
        en: `Calculation could not be completed: ${reasonHindi}`,
        hi: `गणना पूर्ण नहीं हो सकी: ${reasonHindi}`
      }
    };
  }
}
