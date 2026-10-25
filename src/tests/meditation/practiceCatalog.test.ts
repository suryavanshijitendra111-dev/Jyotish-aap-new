/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — PRACTICE CATALOG & SAFETY VERIFICATION SUITE
 * PHASE 1.14C: AUTOMATED DOMAIN MODEL & DETERMINISTIC CATALOG TESTS
 */

import assert from 'node:assert';
import { PracticeCatalogService } from '../../services/meditation/practiceCatalogService';
import { ALLOWED_SESSION_DURATIONS, DEFAULT_SESSION_DURATION } from '../../types/meditation/meditationTypes';
import { PracticeId } from '../../types/meditation/practiceCatalogTypes';

async function runPracticeCatalogTestSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.14C: MEDITATION PRACTICE CATALOG SUITE');
  console.log('================================================================\n');

  const practices = PracticeCatalogService.getAllPractices();

  // -------------------------------------------------------------
  // TEST 1: Exactly 6 practices exist
  // -------------------------------------------------------------
  console.log('--- TEST 1: Exactly 6 practices exist ---');
  assert.strictEqual(practices.length, 6, 'Catalog must contain exactly 6 practices');
  console.log('  ✓ Test 1 Passed: Exactly 6 practices confirmed');

  // -------------------------------------------------------------
  // TEST 2: All six expected IDs exist
  // -------------------------------------------------------------
  console.log('--- TEST 2: All six expected IDs exist ---');
  const expectedIds: PracticeId[] = [
    'BREATH_AWARENESS',
    'SILENT_MEDITATION',
    'BODY_AWARENESS',
    'GRATITUDE_REFLECTION',
    'SELF_OBSERVATION',
    'PRAYERFUL_CONTEMPLATION'
  ];
  for (const id of expectedIds) {
    const found = practices.find(p => p.practiceId === id);
    assert.ok(found, `Expected practiceId '${id}' must be present in catalog`);
  }
  console.log('  ✓ Test 2 Passed: All 6 canonical practice IDs are present');

  // -------------------------------------------------------------
  // TEST 3: No duplicate IDs
  // -------------------------------------------------------------
  console.log('--- TEST 3: No duplicate IDs ---');
  const seenIds = new Set<string>();
  for (const p of practices) {
    assert.strictEqual(seenIds.has(p.practiceId), false, `Duplicate practiceId detected: ${p.practiceId}`);
    seenIds.add(p.practiceId);
  }
  assert.strictEqual(seenIds.size, 6, 'Unique practice count must be 6');
  console.log('  ✓ Test 3 Passed: Zero duplicate IDs detected');

  // -------------------------------------------------------------
  // TEST 4: Deterministic ordering
  // -------------------------------------------------------------
  console.log('--- TEST 4: Deterministic ordering ---');
  for (let i = 0; i < expectedIds.length; i++) {
    assert.strictEqual(
      practices[i].practiceId,
      expectedIds[i],
      `Catalog position ${i + 1} must be '${expectedIds[i]}' but found '${practices[i].practiceId}'`
    );
  }
  console.log('  ✓ Test 4 Passed: Exact deterministic sequence verified');

  // -------------------------------------------------------------
  // TEST 5: Default practice is BREATH_AWARENESS
  // -------------------------------------------------------------
  console.log('--- TEST 5: Default practice is BREATH_AWARENESS ---');
  const defaultPractice = PracticeCatalogService.getDefaultPractice();
  assert.strictEqual(defaultPractice.practiceId, 'BREATH_AWARENESS');
  console.log('  ✓ Test 5 Passed: Default practice is BREATH_AWARENESS');

  // -------------------------------------------------------------
  // TEST 6: Default duration is 600 seconds
  // -------------------------------------------------------------
  console.log('--- TEST 6: Default duration is 600 seconds ---');
  assert.strictEqual(DEFAULT_SESSION_DURATION, 600);
  for (const p of practices) {
    assert.strictEqual(p.defaultDurationSeconds, 600, `Practice ${p.practiceId} must have default duration of 600 seconds`);
  }
  console.log('  ✓ Test 6 Passed: Default duration is 600 seconds across all practices');

  // -------------------------------------------------------------
  // TEST 7: All durations are valid
  // -------------------------------------------------------------
  console.log('--- TEST 7: All durations are valid ---');
  const validDurationsSet = new Set<number>(ALLOWED_SESSION_DURATIONS);
  assert.deepStrictEqual(ALLOWED_SESSION_DURATIONS, [180, 300, 600, 900, 1200, 1800]);
  for (const p of practices) {
    for (const d of p.allowedDurations) {
      assert.ok(validDurationsSet.has(d), `Practice ${p.practiceId} has invalid duration: ${d}`);
    }
  }
  console.log('  ✓ Test 7 Passed: All duration values conform to [180, 300, 600, 900, 1200, 1800]');

  // -------------------------------------------------------------
  // TEST 8: All practices have medicalClaim=false
  // -------------------------------------------------------------
  console.log('--- TEST 8: All practices have medicalClaim=false ---');
  for (const p of practices) {
    assert.strictEqual(p.medicalClaim, false, `Practice ${p.practiceId} must have medicalClaim=false`);
  }
  console.log('  ✓ Test 8 Passed: medicalClaim=false strictly confirmed');

  // -------------------------------------------------------------
  // TEST 9: All practices have jyotishDependency=false
  // -------------------------------------------------------------
  console.log('--- TEST 9: All practices have jyotishDependency=false ---');
  for (const p of practices) {
    assert.strictEqual(p.jyotishDependency, false, `Practice ${p.practiceId} must have jyotishDependency=false`);
  }
  console.log('  ✓ Test 9 Passed: jyotishDependency=false strictly confirmed');

  // -------------------------------------------------------------
  // TEST 10: All practices have requiresBreathControl=false
  // -------------------------------------------------------------
  console.log('--- TEST 10: All practices have requiresBreathControl=false ---');
  for (const p of practices) {
    assert.strictEqual(p.requiresBreathControl, false, `Practice ${p.practiceId} must have requiresBreathControl=false`);
    assert.strictEqual(p.requiresPhysicalMovement, false, `Practice ${p.practiceId} must have requiresPhysicalMovement=false`);
  }
  console.log('  ✓ Test 10 Passed: requiresBreathControl=false and physicalMovement=false confirmed');

  // -------------------------------------------------------------
  // TEST 11: No practice contains Dosh/remedy dependency
  // -------------------------------------------------------------
  console.log('--- TEST 11: No Dosh / remedy dependency in catalog ---');
  const forbiddenFields = [
    'doshId',
    'remedyId',
    'planetaryAffliction',
    'graha',
    'dasha',
    'transit',
    'kundli',
    'kp',
    'numerology',
    'gemstone',
    'price'
  ];
  for (const p of practices) {
    const raw = p as unknown as Record<string, unknown>;
    for (const f of forbiddenFields) {
      assert.strictEqual(raw[f], undefined, `Practice ${p.practiceId} must not contain astrological/commercial field '${f}'`);
    }
  }
  console.log('  ✓ Test 11 Passed: Zero astrological or commercial fields present');

  // -------------------------------------------------------------
  // TEST 12: No network / AI dependency
  // -------------------------------------------------------------
  console.log('--- TEST 12: No network / AI dependency ---');
  for (const p of practices) {
    const raw = p as unknown as Record<string, unknown>;
    assert.strictEqual(raw['aiPrompt'], undefined);
    assert.strictEqual(raw['apiKey'], undefined);
    assert.strictEqual(raw['endpoint'], undefined);
  }
  console.log('  ✓ Test 12 Passed: 100% offline, pure deterministic metadata verified');

  // -------------------------------------------------------------
  // TEST 13: getPracticeById works
  // -------------------------------------------------------------
  console.log('--- TEST 13: getPracticeById works ---');
  const breath = PracticeCatalogService.getPracticeById('BREATH_AWARENESS');
  assert.ok(breath);
  assert.strictEqual(breath.practiceId, 'BREATH_AWARENESS');
  assert.strictEqual(breath.category, 'BREATH_AWARENESS');
  assert.strictEqual(breath.difficulty, 'BEGINNER');

  const silent = PracticeCatalogService.getPracticeById('SILENT_MEDITATION');
  assert.ok(silent);
  assert.strictEqual(silent.practiceId, 'SILENT_MEDITATION');
  console.log('  ✓ Test 13 Passed: getPracticeById correctly retrieves matching item');

  // -------------------------------------------------------------
  // TEST 14: Invalid ID returns undefined
  // -------------------------------------------------------------
  console.log('--- TEST 14: Invalid ID returns undefined ---');
  const invalidResult = PracticeCatalogService.getPracticeById('NON_EXISTENT_PRACTICE');
  assert.strictEqual(invalidResult, undefined, 'Invalid ID must return undefined');

  const emptyResult = PracticeCatalogService.getPracticeById('');
  assert.strictEqual(emptyResult, undefined, 'Empty ID must return undefined');
  console.log('  ✓ Test 14 Passed: Non-existent IDs cleanly return undefined');

  // -------------------------------------------------------------
  // TEST 15: Category filtering works
  // -------------------------------------------------------------
  console.log('--- TEST 15: Category filtering works ---');
  const gratitudeList = PracticeCatalogService.getPracticesByCategory('GRATITUDE_REFLECTION');
  assert.strictEqual(gratitudeList.length, 1);
  assert.strictEqual(gratitudeList[0].practiceId, 'GRATITUDE_REFLECTION');

  const bodyList = PracticeCatalogService.getPracticesByCategory('BODY_AWARENESS');
  assert.strictEqual(bodyList.length, 1);
  assert.strictEqual(bodyList[0].practiceId, 'BODY_AWARENESS');
  console.log('  ✓ Test 15 Passed: Category filtering operates accurately');

  // -------------------------------------------------------------
  // TEST 16: Difficulty filtering works
  // -------------------------------------------------------------
  console.log('--- TEST 16: Difficulty filtering works ---');
  const beginnerList = PracticeCatalogService.getPracticesByDifficulty('BEGINNER');
  assert.strictEqual(beginnerList.length, 3); // BREATH, BODY, GRATITUDE
  assert.ok(beginnerList.some(p => p.practiceId === 'BREATH_AWARENESS'));
  assert.ok(beginnerList.some(p => p.practiceId === 'BODY_AWARENESS'));
  assert.ok(beginnerList.some(p => p.practiceId === 'GRATITUDE_REFLECTION'));

  const intermediateList = PracticeCatalogService.getPracticesByDifficulty('INTERMEDIATE');
  assert.strictEqual(intermediateList.length, 1); // SELF_OBSERVATION

  const openList = PracticeCatalogService.getPracticesByDifficulty('OPEN_TO_ALL');
  assert.strictEqual(openList.length, 2); // SILENT, PRAYERFUL
  console.log('  ✓ Test 16 Passed: Difficulty filtering partitions catalog accurately');

  // -------------------------------------------------------------
  // TEST 17: Catalog validation passes for all 6 catalog items
  // -------------------------------------------------------------
  console.log('--- TEST 17: Catalog validation passes ---');
  for (const p of practices) {
    const val = PracticeCatalogService.validatePracticeDefinition(p);
    assert.strictEqual(val.valid, true, `Catalog item ${p.practiceId} failed validation: ${val.errors.join(', ')}`);
    assert.strictEqual(val.errors.length, 0);
  }
  console.log('  ✓ Test 17 Passed: All 6 catalog practices pass validation');

  // -------------------------------------------------------------
  // TEST 18: Safety validation rejects an unsafe practice
  // -------------------------------------------------------------
  console.log('--- TEST 18: Safety validation rejects unsafe practice ---');
  const unsafePracticeA = {
    ...practices[0],
    medicalClaim: true // Violation!
  };
  const resA = PracticeCatalogService.validatePracticeDefinition(unsafePracticeA);
  assert.strictEqual(resA.valid, false);
  assert.ok(resA.errors.some(e => e.includes('medicalClaim must be strictly false')));

  const unsafePracticeB = {
    ...practices[0],
    requiresBreathControl: true // Violation (Kumbhaka/retention forbidden)!
  };
  const resB = PracticeCatalogService.validatePracticeDefinition(unsafePracticeB);
  assert.strictEqual(resB.valid, false);
  assert.ok(resB.errors.some(e => e.includes('requiresBreathControl must be strictly false')));

  const unsafePracticeC = {
    ...practices[0],
    jyotishDependency: true, // Violation!
    doshId: 'MANGAL_DOSHA' // Forbidden field!
  };
  const resC = PracticeCatalogService.validatePracticeDefinition(unsafePracticeC);
  assert.strictEqual(resC.valid, false);
  assert.ok(resC.errors.some(e => e.includes('jyotishDependency must be strictly false')));
  assert.ok(resC.errors.some(e => e.includes('Prohibited field detected: doshId')));
  console.log('  ✓ Test 18 Passed: Unsafe definitions are strictly rejected with detailed errors');

  // -------------------------------------------------------------
  // TEST 19: Unapproved practice ID validation fails
  // -------------------------------------------------------------
  console.log('--- TEST 19: Duplicate or unapproved ID validation fails ---');
  const fakePractice = {
    ...practices[0],
    practiceId: 'KUNDALINI_AWAKENING' // Forbidden!
  };
  const resFake = PracticeCatalogService.validatePracticeDefinition(fakePractice);
  assert.strictEqual(resFake.valid, false);
  assert.ok(resFake.errors.some(e => e.includes('Invalid or unapproved practiceId')));

  assert.strictEqual(PracticeCatalogService.isPracticeIdValid('BREATH_AWARENESS'), true);
  assert.strictEqual(PracticeCatalogService.isPracticeIdValid('KUNDALINI_AWAKENING'), false);
  console.log('  ✓ Test 19 Passed: Unapproved practice IDs fail validation');

  // -------------------------------------------------------------
  // TEST 20: Catalog remains language-neutral
  // -------------------------------------------------------------
  console.log('--- TEST 20: Catalog remains language-neutral ---');
  for (const p of practices) {
    assert.match(p.practiceId, /^[A-Z_]+$/, `ID ${p.practiceId} must be ASCII upper snake-case`);
    assert.match(p.titleKey, /^meditation\.practices\.[a-z_]+\.title$/);
    assert.match(p.descriptionKey, /^meditation\.practices\.[a-z_]+\.desc$/);
    assert.match(p.instructionsKey, /^meditation\.practices\.[a-z_]+\.instructions$/);
    assert.match(p.safetyNoticeKey, /^meditation\.practices\.[a-z_]+\.safety$/);
  }
  console.log('  ✓ Test 20 Passed: All practice IDs and content keys strictly adhere to language-neutral tokens');

  console.log('\n================================================================');
  console.log('ALL PHASE 1.14C PRACTICE CATALOG TESTS PASSED (20/20)');
  console.log('================================================================');
}

runPracticeCatalogTestSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
