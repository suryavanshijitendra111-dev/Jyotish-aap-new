/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA CATALOG TEST SUITE
 * PHASE 1.15D: DETERMINISTIC FOUNDATION VERIFICATION (EXACTLY 4 PRACTICES)
 */

import assert from 'node:assert';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';
import { YOGA_CATALOG_VERSION, YogaPracticeId } from '../../types/yogaSadhana/yogaCatalogTypes';

async function runYogaCatalogTestSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.15D: YOGA CATALOG FOUNDATION TEST SUITE');
  console.log('================================================================\n');

  const practices = YogaCatalogService.getAllPractices();
  let passedTests = 0;

  // -------------------------------------------------------------
  // TEST 1: Catalog Version is 1.0.0
  // -------------------------------------------------------------
  console.log('--- TEST 1: Catalog Version is 1.0.0 ---');
  assert.strictEqual(YogaCatalogService.getVersion(), '1.0.0', 'Catalog version must be 1.0.0');
  assert.strictEqual(YOGA_CATALOG_VERSION, '1.0.0', 'YOGA_CATALOG_VERSION constant must be 1.0.0');
  console.log('  ✓ Test 1 Passed: Catalog version is strictly 1.0.0');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 2: Exactly 4 practices exist
  // -------------------------------------------------------------
  console.log('--- TEST 2: Exactly 4 practices exist ---');
  assert.strictEqual(practices.length, 4, `Catalog must contain exactly 4 practices, but found ${practices.length}`);
  console.log('  ✓ Test 2 Passed: Exactly 4 practices confirmed');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 3: All 4 canonical IDs exist in deterministic order
  // -------------------------------------------------------------
  console.log('--- TEST 3: Canonical IDs and deterministic ordering ---');
  const expectedOrder: YogaPracticeId[] = ['shavasana', 'sukhasana', 'tadasana', 'anulom_vilom'];
  for (let i = 0; i < expectedOrder.length; i++) {
    assert.strictEqual(
      practices[i].id,
      expectedOrder[i],
      `Catalog position ${i + 1} must be '${expectedOrder[i]}' but found '${practices[i].id}'`
    );
  }
  console.log('  ✓ Test 3 Passed: Exact deterministic sequence verified (Shavasana -> Sukhasana -> Tadasana -> Anulom Vilom)');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 4: Zero duplicate IDs
  // -------------------------------------------------------------
  console.log('--- TEST 4: Zero duplicate IDs ---');
  const seenIds = new Set<string>();
  for (const p of practices) {
    assert.strictEqual(seenIds.has(p.id), false, `Duplicate practice ID detected: ${p.id}`);
    seenIds.add(p.id);
  }
  assert.strictEqual(seenIds.size, 4, 'Unique practice count must be 4');
  console.log('  ✓ Test 4 Passed: Zero duplicate IDs confirmed');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 5: Immutability / Object freezing
  // -------------------------------------------------------------
  console.log('--- TEST 5: Immutability / Object freezing ---');
  assert.ok(Object.isFrozen(practices), 'Catalog array must be frozen');
  for (const p of practices) {
    assert.ok(Object.isFrozen(p), `Practice '${p.id}' must be frozen`);
    assert.ok(Object.isFrozen(p.instructionsHindi), `Practice '${p.id}' instructionsHindi must be frozen`);
    assert.ok(Object.isFrozen(p.instructionsEnglish), `Practice '${p.id}' instructionsEnglish must be frozen`);
    assert.ok(Object.isFrozen(p.allowedDurationsSeconds), `Practice '${p.id}' allowedDurationsSeconds must be frozen`);
  }
  console.log('  ✓ Test 5 Passed: Full immutability and deep freezing verified');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 6: Mandatory architectural & safety invariants across all entries
  // -------------------------------------------------------------
  console.log('--- TEST 6: Mandatory safety invariants ---');
  for (const p of practices) {
    assert.strictEqual(p.aiGenerated, false, `Practice '${p.id}' must have aiGenerated === false`);
    assert.strictEqual(p.humanAudited, true, `Practice '${p.id}' must have humanAudited === true`);
    assert.strictEqual(p.sourceReviewed, true, `Practice '${p.id}' must have sourceReviewed === true`);
    assert.strictEqual(p.medicalClaim, false, `Practice '${p.id}' must have medicalClaim === false`);
    assert.strictEqual(p.jyotishDependency, false, `Practice '${p.id}' must have jyotishDependency === false`);
    assert.strictEqual(p.requiresKumbhaka, false, `Practice '${p.id}' must have requiresKumbhaka === false`);
    assert.strictEqual(p.requiresBreathRetention, false, `Practice '${p.id}' must have requiresBreathRetention === false`);
    assert.strictEqual(p.requiresRapidBreathing, false, `Practice '${p.id}' must have requiresRapidBreathing === false`);
    assert.strictEqual(p.requiresForcefulBreathing, false, `Practice '${p.id}' must have requiresForcefulBreathing === false`);
    assert.strictEqual(p.requiresBandhas, false, `Practice '${p.id}' must have requiresBandhas === false`);
    assert.strictEqual(p.requiresInversion, false, `Practice '${p.id}' must have requiresInversion === false`);
    assert.strictEqual(p.difficulty, 'BEGINNER', `Practice '${p.id}' must be BEGINNER level`);
    assert.strictEqual(p.safetyLevel, 'LOW_RISK_CANDIDATE', `Practice '${p.id}' must be LOW_RISK_CANDIDATE`);
  }
  console.log('  ✓ Test 6 Passed: Safety invariants held across all 4 entries (0 AI, 0 medical claims, 0 Jyotish, 0 Kumbhaka)');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 7: Anulom Vilom modern adaptation & zero-kumbhaka contract
  // -------------------------------------------------------------
  console.log('--- TEST 7: Anulom Vilom specific contract ---');
  const anulomVilom = YogaCatalogService.getPracticeById('anulom_vilom');
  assert.ok(anulomVilom, 'Anulom Vilom must be present');
  assert.strictEqual(anulomVilom.category, 'BREATH_AWARENESS');
  assert.strictEqual(anulomVilom.isModernAdaptation, true, 'Anulom Vilom must be marked as modern adaptation');
  assert.strictEqual(anulomVilom.sourceClassification, 'MODERN_ADAPTATION');
  assert.strictEqual(anulomVilom.requiresKumbhaka, false);
  assert.strictEqual(anulomVilom.requiresBreathRetention, false);
  assert.strictEqual(anulomVilom.requiresRapidBreathing, false);
  assert.strictEqual(anulomVilom.requiresForcefulBreathing, false);

  // Verify explicit zero-retention in instructions
  const avText = anulomVilom.instructionsEnglish.join(' ').toLowerCase();
  assert.ok(
    avText.includes('strictly zero kumbhaka') || avText.includes('do not hold the breath'),
    'Anulom Vilom instructions must explicitly disclaim Kumbhaka/retention'
  );
  console.log('  ✓ Test 7 Passed: Anulom Vilom modern adaptation and zero-Kumbhaka verified');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 8: Category breakdown (3 Asanas, 1 Breathing Practice)
  // -------------------------------------------------------------
  console.log('--- TEST 8: Category breakdown ---');
  const asanas = YogaCatalogService.getAsanas();
  const breathing = YogaCatalogService.getBreathingPractices();
  assert.strictEqual(asanas.length, 3, `Expected 3 Asanas, got ${asanas.length}`);
  assert.strictEqual(breathing.length, 1, `Expected 1 Breathing practice, got ${breathing.length}`);
  assert.strictEqual(breathing[0].id, 'anulom_vilom');
  console.log('  ✓ Test 8 Passed: Exactly 3 Asanas and 1 Breathing practice verified');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 9: Query methods (getPracticeById, getAsanas, getBreathingPractices)
  // -------------------------------------------------------------
  console.log('--- TEST 9: Query methods ---');
  assert.ok(YogaCatalogService.getPracticeById('shavasana'), 'Should find shavasana');
  assert.ok(YogaCatalogService.getPracticeById('sukhasana'), 'Should find sukhasana');
  assert.ok(YogaCatalogService.getPracticeById('tadasana'), 'Should find tadasana');
  assert.ok(YogaCatalogService.getPracticeById('anulom_vilom'), 'Should find anulom_vilom');
  assert.strictEqual(YogaCatalogService.getPracticeById('nadi_shodhana'), undefined, 'Nadi Shodhana must NOT be present');
  assert.strictEqual(YogaCatalogService.getPracticeById('bhramari'), undefined, 'Bhramari must NOT be present');
  assert.strictEqual(YogaCatalogService.getPracticeById('nonexistent'), undefined, 'Unknown ID returns undefined');
  console.log('  ✓ Test 9 Passed: Query methods operate accurately');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 10: Validation engine produces 0 errors
  // -------------------------------------------------------------
  console.log('--- TEST 10: Validation engine ---');
  const validation = YogaCatalogService.validateCatalog();
  assert.strictEqual(validation.isValid, true, `Catalog validation failed: ${validation.errors.join(', ')}`);
  assert.strictEqual(validation.errors.length, 0, 'Catalog validation must have 0 errors');
  assert.strictEqual(validation.practiceCount, 4, 'Validation practice count must be 4');
  assert.strictEqual(validation.catalogVersion, '1.0.0', 'Validation version must match 1.0.0');
  console.log('  ✓ Test 10 Passed: validateCatalog() passed with 0 errors');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 11: Bilingual completeness (Hindi and English in all fields)
  // -------------------------------------------------------------
  console.log('--- TEST 11: Bilingual completeness ---');
  for (const p of practices) {
    assert.ok(p.nameHindi.length > 0 && p.nameEnglish.length > 0, `${p.id} missing names`);
    assert.ok(p.techniqueSummaryHindi.length > 0 && p.techniqueSummaryEnglish.length > 0, `${p.id} missing summary`);
    assert.ok(p.modificationGuidanceHindi.length > 0 && p.modificationGuidanceEnglish.length > 0, `${p.id} missing modifications`);
    assert.ok(p.safetyNoticeHindi.length > 0 && p.safetyNoticeEnglish.length > 0, `${p.id} missing safety notice`);
    assert.ok(p.instructionsHindi.length > 0 && p.instructionsEnglish.length > 0, `${p.id} missing instructions`);
    assert.ok(p.contraindicationsHindi.length > 0 && p.contraindicationsEnglish.length > 0, `${p.id} missing contraindications`);
  }
  console.log('  ✓ Test 11 Passed: Full bilingual completeness verified');
  passedTests++;

  console.log('\n================================================================');
  console.log(`ALL ${passedTests}/${passedTests} YOGA CATALOG TESTS PASSED CLEANLY (100%)`);
  console.log('================================================================');
}

runYogaCatalogTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
