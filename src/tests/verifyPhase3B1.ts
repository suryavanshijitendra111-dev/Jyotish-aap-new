import { KpEngine } from '../services/jyotish/kpEngine';
import { KpJudgmentEngine } from '../services/jyotish/kpJudgmentEngine';
import { KpInterpretationEngine } from '../services/jyotish/kpInterpretationEngine';
import { KPQuestionInput } from '../types/jyotish/kpJudgment';
import { MasterKundliData } from '../types/kundli';

async function runPhase3B1Verification() {
  console.log('====================================================');
  console.log('STARTING KP PHASE 3B.1 FINAL USER-ANSWER VERIFICATION');
  console.log('====================================================\n');

  // Fetch live MasterKundliData from local dev server API
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

  if (!res.ok) {
    throw new Error(`Failed to calculate MasterKundliData: ${res.statusText}`);
  }

  const masterData: MasterKundliData = await res.json();
  const kpEngine = new KpEngine();
  const kpResult = kpEngine.evaluate(masterData);
  const judgmentEngine = new KpJudgmentEngine();
  const interpEngine = new KpInterpretationEngine();

  console.log(`KP Calculation System: ${kpResult.system}`);
  console.log(`Cusps Calculated: ${kpResult.cuspData.length}`);
  console.log(`Planets Calculated: ${kpResult.planetData.length}`);
  console.log(`Ruling Planets Day Lord: ${kpResult.rulingPlanets?.dayLord?.dayLord || 'N/A'}`);
  console.log(`Ascendant Sub Lord: ${kpResult.cuspData[0].subLord}\n`);

  const testQuestions: Array<{ q: string; cat: any }> = [
    { q: 'Meri job me pragati kab ayegi?', cat: 'career_job' },
    { q: 'Kya mere ghar banane ke raste khulenge?', cat: 'property' },
    { q: 'Kya mera vaivahik jeevan khushhal hoga?', cat: 'marriage' },
    { q: 'Kya mera dhan aayega?', cat: 'finance_income' }
  ];

  const results: any[] = [];

  for (const t of testQuestions) {
    console.log('----------------------------------------------------');
    console.log(`TEST QUESTION: "${t.q}" (${t.cat})`);
    console.log('----------------------------------------------------');

    const input: KPQuestionInput = {
      question: t.q,
      category: t.cat,
      questionDate: '2026-09-23',
      questionTime: '12:00',
      questionLocation: 'Indore, MP'
    };

    const judgment = judgmentEngine.evaluateQuestion(kpResult, input);
    const interp = interpEngine.interpret(judgment, kpResult);

    // Assertions matching KPDeepInterpretationResult
    if (!interp.questionSummary.hi || !interp.questionSummary.en) throw new Error('Missing questionSummary');
    if (!interp.overallStrengthLabel.hi || !interp.overallStrengthLabel.en) throw new Error('Missing overallStrengthLabel');
    if (!interp.directAnswer.hi || !interp.directAnswer.en) throw new Error('Missing directAnswer');
    if (interp.supportiveFactors.length === 0) throw new Error('Supportive factors should not be empty');
    if (!interp.contradictionAnalysis.hi || !interp.contradictionAnalysis.en) throw new Error('Missing contradictionAnalysis');
    if (interp.practicalGuidance.length === 0) throw new Error('Practical guidance should not be empty');

    // Verify determinism binding
    // Sub Lord check
    const primaryCuspData = kpResult.cuspData.find(c => c.house === judgment.primaryCusp);
    if (primaryCuspData && judgment.primaryCuspSubLord) {
      if (primaryCuspData.subLord !== judgment.primaryCuspSubLord.subLord) {
        throw new Error(`SubLord mismatch: expected ${primaryCuspData.subLord}, got ${judgment.primaryCuspSubLord.subLord}`);
      }
    }

    // Verify qualitative conclusion allowed set
    const validHindiQual = [
      'मजबूत समर्थन',
      'मध्यम समर्थन',
      'मध्यम / मिश्रित संकेत',
      'मिश्रित संकेत',
      'चुनौतीपूर्ण संकेत',
      'चुनौतीपूर्ण / अवरोधक स्थिति',
      'अपर्याप्त संकेत'
    ];
    if (!validHindiQual.includes(interp.overallStrengthLabel.hi)) {
      throw new Error(`Invalid Hindi overallStrengthLabel: ${interp.overallStrengthLabel.hi}`);
    }

    // Check for bad raw patterns in answer
    const forbiddenPatterns = ['85%', '93%', '95%', '4-Fold A/B/C/D'];
    for (const pat of forbiddenPatterns) {
      if (interp.directAnswer.hi.includes(pat) || interp.directAnswer.en.includes(pat)) {
        throw new Error(`Answer contains forbidden pattern: ${pat}`);
      }
    }

    console.log(`1. प्रश्न: ${judgment.question}`);
    console.log(`2. ⭐ आपका उत्तर: ${interp.directAnswer.hi}`);
    console.log(`3. स्पष्ट निष्कर्ष: ${interp.overallStrengthLabel.hi} (${interp.overallStrength})`);
    console.log(`4. 🟢 समर्थन के संकेत:\n   ${interp.supportiveFactors.map(f => `• ${f.title.hi}: ${f.description.hi}`).join('\n   ')}`);
    console.log(`5. 🟡 मिश्रित संकेत:\n   ${interp.mixedFactors.length > 0 ? interp.mixedFactors.map(f => `• ${f.title.hi}: ${f.description.hi}`).join('\n   ') : 'कोई विरोधाभासी संकेत नहीं'}`);
    console.log(`6. 🔴 संभावित बाधाएँ:\n   ${interp.obstacleFactors.length > 0 ? interp.obstacleFactors.map(f => `• ${f.title.hi}: ${f.description.hi}`).join('\n   ') : 'कोई बड़ी बाधा नहीं'}`);
    console.log(`7. 🔎 यह निष्कर्ष क्यों?: ${interp.contradictionAnalysis.hi}`);
    console.log(`8. 🧭 व्यावहारिक मार्गदर्शन:\n   ${interp.practicalGuidance.map(g => `• ${g.hi}`).join('\n   ')}`);
    console.log(`9. AI व्याख्या मॉड्यूल उपलब्ध: हाँ (/api/prashna-ai)`);
    console.log(`10. तकनीकी KP गणना (Hidden by default): Houses: [${judgment.targetHouses.join(',')}], Primary Cusp: H${judgment.primaryCusp}, Sub Lord: ${judgment.primaryCuspSubLord?.subLord}, RP Degree: ${judgment.rulingPlanetSupport.supportDegree} (Matching: ${judgment.rulingPlanetSupport.matchingPlanets.join(', ')})\n`);

    results.push({
      question: t.q,
      category: t.cat,
      judgment,
      interp
    });
  }

  console.log('====================================================');
  console.log('ALL 4 QUESTIONS VERIFIED SUCCESSFULLY AGAINST MASTER DATA');
  console.log('====================================================');
}

runPhase3B1Verification().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
