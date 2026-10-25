import { KpEngine } from '../services/jyotish/kpEngine';
import { KpJudgmentEngine } from '../services/jyotish/kpJudgmentEngine';
import { KP_EVENT_HOUSE_MAPPINGS, KPQuestionCategory, KPQuestionInput } from '../types/jyotish/kpJudgment';
import { MasterKundliData } from '../types/kundli';

export class KpJudgmentVerificationSuite {
  static async runAllTests(): Promise<{ passed: number; failed: number; errors: string[] }> {
    let passed = 0;
    let failed = 0;
    const errors: string[] = [];

    const assert = (condition: boolean, msg: string) => {
      if (condition) {
        passed++;
      } else {
        failed++;
        errors.push(msg);
        console.error(`FAIL: ${msg}`);
      }
    };

    console.log('--- STARTING KP PHASE 3B JUDGMENT ENGINE TEST SUITE ---');

    try {
      // Fetch live calculated MasterKundliData for test chart
      const res = await fetch('http://localhost:3000/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dob: '1989-10-15',
          time: '14:30',
          latitude: 22.7196,
          longitude: 75.8577,
          timezone: 'Asia/Kolkata',
          ayanamsa: 'Lahiri'
        })
      });
      const masterData: MasterKundliData = await res.json();
      const kpEngine = new KpEngine();
      const kpResult = kpEngine.evaluate(masterData);
      const judgmentEngine = new KpJudgmentEngine();

      assert(kpResult.system === 'KP', 'KP Engine system must be KP');
      assert(kpResult.cuspData.length === 12, 'Must have 12 cusps');
      assert(kpResult.planetData.length === 9, 'Must have 9 planets');
      assert(kpResult.significators !== undefined, 'Significators must be populated');
      assert(kpResult.rulingPlanets !== undefined, 'Ruling Planets must be populated');

      // Test 1: Verify all 15 Categories & Target House Mappings
      const categories: KPQuestionCategory[] = [
        'career_job',
        'business',
        'marriage',
        'relationship',
        'education_exam',
        'property',
        'vehicle',
        'finance_income',
        'children',
        'travel',
        'legal_matter',
        'partnership',
        'lost_item',
        'general_yes_no',
        'other'
      ];

      for (const cat of categories) {
        const mapping = KP_EVENT_HOUSE_MAPPINGS[cat];
        assert(mapping !== undefined, `Mapping for ${cat} must exist`);
        assert(Array.isArray(mapping.targetHouses) && mapping.targetHouses.length > 0, `${cat} targetHouses must be non-empty array`);
        assert(typeof mapping.primaryCusp === 'number' && mapping.primaryCusp >= 1 && mapping.primaryCusp <= 12, `${cat} primaryCusp must be 1-12`);
        assert(mapping.labelEn.length > 0 && mapping.labelHi.length > 0, `${cat} labels must be non-empty`);

        // Run judgment evaluation
        const input: KPQuestionInput = {
          question: `Test Question for ${cat}`,
          category: cat,
          questionDate: '2026-09-23',
          questionTime: '12:00',
          questionLocation: 'Indore, India'
        };

        const result = judgmentEngine.evaluateQuestion(kpResult, input);
        assert(result !== undefined, `Result for ${cat} must exist`);
        assert(result.category === cat, `Result category must match ${cat}`);
        assert(['FAVOURABLE', 'MODERATE_MIXED', 'CHALLENGING', 'INSUFFICIENT_DATA'].includes(result.outcome), `${cat} outcome must be valid enum`);
        assert(['YES', 'MIXED_CONDITIONAL', 'NO', 'INSUFFICIENT_DATA'].includes(result.yesNoOutcome), `${cat} yesNoOutcome must be valid enum`);
        assert(result.confidenceScore >= 0 && result.confidenceScore <= 100, `${cat} confidenceScore must be 0-100`);
        assert(Array.isArray(result.reasons.en) && result.reasons.en.length > 0, `${cat} reasonsEn must not be empty`);
        assert(Array.isArray(result.reasons.hi) && result.reasons.hi.length > 0, `${cat} reasonsHi must not be empty`);
        assert(result.rulingPlanetSupport !== undefined, `${cat} rulingPlanetSupport must be present`);
        assert(result.significatorEvidence.length === 9, `${cat} must evaluate all 9 planets`);
      }

      // Test 2: Specific House Mappings match KP specifications
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.career_job.targetHouses) === JSON.stringify([2, 6, 10, 11]),
        'Career target houses must be [2, 6, 10, 11]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.business.targetHouses) === JSON.stringify([2, 7, 10, 11]),
        'Business target houses must be [2, 7, 10, 11]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.marriage.targetHouses) === JSON.stringify([2, 7, 11]),
        'Marriage target houses must be [2, 7, 11]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.education_exam.targetHouses) === JSON.stringify([4, 5, 9, 11]),
        'Education target houses must be [4, 5, 9, 11]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.property.targetHouses) === JSON.stringify([4, 11]),
        'Property target houses must be [4, 11]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.vehicle.targetHouses) === JSON.stringify([4, 11]),
        'Vehicle target houses must be [4, 11]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.finance_income.targetHouses) === JSON.stringify([2, 6, 10, 11]),
        'Finance target houses must be [2, 6, 10, 11]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.children.targetHouses) === JSON.stringify([2, 5, 11]),
        'Children target houses must be [2, 5, 11]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.travel.targetHouses) === JSON.stringify([3, 9, 12]),
        'Travel target houses must be [3, 9, 12]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.legal_matter.targetHouses) === JSON.stringify([6, 7, 11]),
        'Legal target houses must be [6, 7, 11]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.partnership.targetHouses) === JSON.stringify([7, 2, 11]),
        'Partnership target houses must be [7, 2, 11]'
      );
      assert(
        JSON.stringify(KP_EVENT_HOUSE_MAPPINGS.lost_item.targetHouses) === JSON.stringify([2, 4, 11]),
        'Lost item target houses must be [2, 4, 11]'
      );

      // Test 3: 9 Planets verification in significator evidence
      const careerJudgment = judgmentEngine.evaluateQuestion(kpResult, {
        question: 'Will I get promoted this year?',
        category: 'career_job',
        questionDate: '2026-09-23',
        questionTime: '14:30',
        questionLocation: 'Indore'
      });

      const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      for (const p of planets) {
        const pEvidence = careerJudgment.significatorEvidence.find(e => e.planet === p);
        assert(pEvidence !== undefined, `Significator evidence for planet ${p} must exist`);
        assert(Array.isArray(pEvidence!.levelA), `Planet ${p} levelA must be array`);
        assert(Array.isArray(pEvidence!.levelB), `Planet ${p} levelB must be array`);
        assert(Array.isArray(pEvidence!.levelC), `Planet ${p} levelC must be array`);
        assert(Array.isArray(pEvidence!.levelD), `Planet ${p} levelD must be array`);
        assert(typeof pEvidence!.score === 'number', `Planet ${p} score must be number`);
        assert(
          ['STRONG_POSITIVE', 'POSITIVE', 'NEUTRAL', 'CHALLENGING'].includes(pEvidence!.supportLevel),
          `Planet ${p} support level must be valid`
        );
      }

      // Test 4: Primary Cusp Sub Lord evaluation
      assert(careerJudgment.primaryCuspSubLord !== undefined, 'Career primary cusp sub lord evidence must exist');
      assert(careerJudgment.primaryCuspSubLord!.house === 10, 'Career primary cusp must be 10');
      assert(typeof careerJudgment.primaryCuspSubLord!.subLord === 'string', 'Sub Lord must be string');
      assert(careerJudgment.primaryCuspSubLord!.subLord.length > 0, 'Sub Lord must not be empty');

      // Test 5: Insufficient data handling
      const emptyResult = judgmentEngine.evaluateQuestion({} as any, {
        question: 'Any question',
        category: 'marriage',
        questionDate: '2026-09-23',
        questionTime: '12:00',
        questionLocation: 'Delhi'
      });
      assert(emptyResult.outcome === 'INSUFFICIENT_DATA', 'Empty input must return INSUFFICIENT_DATA');
      assert(emptyResult.yesNoOutcome === 'INSUFFICIENT_DATA', 'Empty input must return yesNo INSUFFICIENT_DATA');
      assert(emptyResult.confidenceScore === 0, 'Empty input confidence must be 0');

    } catch (e: any) {
      failed++;
      errors.push(e?.message || String(e));
      console.error('Test execution error:', e);
    }

    console.log(`KP Phase 3B Tests Finished: ${passed} passed, ${failed} failed`);
    return { passed, failed, errors };
  }
}
