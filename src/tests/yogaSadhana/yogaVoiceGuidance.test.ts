/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — YOGA & SADHANA VOICE & VISUAL GUIDANCE TEST SUITE
 * PHASE 1.15F-D: VOICE GUIDANCE (SPEECHENGINE REUSE) & VISUAL POSTURE DEMONSTRATION
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { YogaVoiceController, YogaVoiceState } from '../../services/yogaSadhana/yogaVoiceController';
import { SpeechEngine, SpeechState } from '../../services/companion/speechEngine';
import { YogaCatalogService } from '../../services/yogaSadhana/yogaCatalogService';

async function runYogaVoiceGuidanceTestSuite() {
  console.log('================================================================');
  console.log('JEEVANDARPAN — PHASE 1.15F-D: VOICE & VISUAL GUIDANCE TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;

  // Mock SpeechEngine for Node testing environment
  let speakCalls: Array<{ text: string; language: string; options?: any }> = [];
  let stopCalls = 0;

  const originalSpeak = SpeechEngine.speak;
  const originalStop = SpeechEngine.stop;

  SpeechEngine.speak = (
    text: string,
    language: string = 'hi',
    optionsOrCallback?: any,
    options?: any
  ): boolean => {
    speakCalls.push({ text, language, options: options || optionsOrCallback });
    if (typeof optionsOrCallback === 'function') {
      // Simulate immediate 'playing' event
      optionsOrCallback('playing');
    }
    return true;
  };

  SpeechEngine.stop = (): void => {
    stopCalls++;
  };

  // -------------------------------------------------------------
  // TEST 1: Reuses SpeechEngine without duplicate TTS implementations
  // -------------------------------------------------------------
  console.log('--- TEST 1: Reuses SpeechEngine without duplicate TTS implementations ---');
  const controllerSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/services/yogaSadhana/yogaVoiceController.ts'),
    'utf8'
  );
  assert.ok(
    controllerSource.includes("import { SpeechEngine"),
    'yogaVoiceController must import SpeechEngine from companion/speechEngine'
  );
  assert.strictEqual(
    controllerSource.includes('window.speechSynthesis'),
    false,
    'yogaVoiceController must not instantiate window.speechSynthesis directly'
  );
  assert.strictEqual(
    controllerSource.includes('new SpeechSynthesisUtterance'),
    false,
    'yogaVoiceController must not instantiate new SpeechSynthesisUtterance directly'
  );
  console.log('  ✓ Test 1 Passed: Centralized SpeechEngine reused with zero duplicate TTS');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 2: Exact static Hindi text from catalog practices
  // -------------------------------------------------------------
  console.log('--- TEST 2: Exact static Hindi text delivery for all 4 practices ---');
  const practices = YogaCatalogService.getAllPractices();
  assert.strictEqual(practices.length, 4, 'Catalog must contain 4 practices');

  for (const practice of practices) {
    assert.ok(practice.instructionsHindi.length >= 3, `${practice.id} must have at least 3 Hindi steps`);
    for (const step of practice.instructionsHindi) {
      assert.ok(step && step.trim().length > 5, `Instruction step in ${practice.id} must not be empty`);
      assert.strictEqual(step.includes('{'), false, `Step in ${practice.id} must not contain template placeholders`);
      assert.strictEqual(step.includes('AI'), false, `Step in ${practice.id} must not contain AI markers`);
    }
  }
  console.log('  ✓ Test 2 Passed: All 4 approved practices have static, verified Hindi steps');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 3: speakStep delivers Hindi language with steady yoga cadence
  // -------------------------------------------------------------
  console.log('--- TEST 3: speakStep delivers Hindi language with calibrated cadence ---');
  speakCalls = [];
  YogaVoiceController.setMuted(false);

  const testText = 'समतल आसन पर सुखासन में बैठें।';
  const ok = YogaVoiceController.speakStep(testText);
  assert.strictEqual(ok, true, 'speakStep should return true on successful dispatch');
  assert.strictEqual(speakCalls.length, 1, 'SpeechEngine.speak must have been called once');
  assert.strictEqual(speakCalls[0].text, testText, 'Exact Hindi instruction text must be passed');
  assert.strictEqual(speakCalls[0].language, 'hi', 'Language code must be "hi" for Hindi');
  console.log('  ✓ Test 3 Passed: speakStep dispatches Hindi with proper parameters');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 4: Step-by-step atomic delivery: stops previous before next step
  // -------------------------------------------------------------
  console.log('--- TEST 4: Atomic delivery and non-overlapping audio ---');
  stopCalls = 0;
  speakCalls = [];

  YogaVoiceController.speakStep('चरण 1: गहरी सांस लें');
  assert.strictEqual(speakCalls.length, 1);

  YogaVoiceController.stop();
  assert.ok(stopCalls >= 1, 'YogaVoiceController.stop() must call SpeechEngine.stop()');
  assert.strictEqual(YogaVoiceController.getState().isSpeaking, false, 'isSpeaking should be false after stop()');

  // Replay
  stopCalls = 0;
  speakCalls = [];
  YogaVoiceController.replay('चरण 1: पुनः गहरी सांस लें');
  assert.ok(stopCalls >= 1, 'Replay must stop active speech first');
  assert.strictEqual(speakCalls.length, 1, 'Replay must speak the requested text');
  console.log('  ✓ Test 4 Passed: Non-overlapping speech and clean replay verified');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 5: Mute control and state subscriptions
  // -------------------------------------------------------------
  console.log('--- TEST 5: Mute control and state subscriptions ---');
  speakCalls = [];
  let notifiedState: YogaVoiceState | null = null;
  const unsub = YogaVoiceController.subscribe((state) => {
    notifiedState = state;
  });

  // Toggle to muted
  YogaVoiceController.setMuted(true);
  assert.strictEqual(YogaVoiceController.getIsMuted(), true, 'Controller must be muted');
  assert.strictEqual((notifiedState as YogaVoiceState | null)?.isMuted, true, 'Subscriber must receive muted: true');

  // Attempt to speak while muted
  const speakMutedResult = YogaVoiceController.speakStep('म्यूट होने पर यह नहीं बोलना चाहिए');
  assert.strictEqual(speakMutedResult, true, 'speakStep returns true when muted for UI state preservation');
  assert.strictEqual(speakCalls.length, 0, 'SpeechEngine.speak must NOT be called when muted');
  assert.strictEqual(YogaVoiceController.getState().isSpeaking, false, 'isSpeaking must remain false when muted');

  // Unmute
  YogaVoiceController.setMuted(false);
  assert.strictEqual(YogaVoiceController.getIsMuted(), false, 'Controller must be unmuted');
  assert.strictEqual((notifiedState as YogaVoiceState | null)?.isMuted, false, 'Subscriber must receive muted: false');

  unsub();
  console.log('  ✓ Test 5 Passed: Mute toggle and reactive state subscriptions confirmed');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 6: Resilient audio error containment
  // -------------------------------------------------------------
  console.log('--- TEST 6: Audio error containment ---');
  SpeechEngine.speak = () => {
    throw new Error('Simulated browser speech synthesis failure');
  };

  let didCrash = false;
  try {
    const res = YogaVoiceController.speakStep('परीक्षण वाक्य');
    assert.strictEqual(res, false, 'speakStep should return false on engine exception');
  } catch (err) {
    didCrash = true;
  }
  assert.strictEqual(didCrash, false, 'Audio errors must not throw unhandled exceptions');
  assert.strictEqual(YogaVoiceController.getState().isSpeaking, false, 'isSpeaking must be false after error');

  // Restore mock
  SpeechEngine.speak = (text: string, language: string = 'hi', cb?: any, opts?: any) => {
    speakCalls.push({ text, language, options: opts || (typeof cb === 'object' ? cb : undefined) });
    if (typeof cb === 'function') cb('playing');
    return true;
  };
  console.log('  ✓ Test 6 Passed: Audio errors are safely contained without crashing UI');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 7: YogaPostureVisual component inspection
  // -------------------------------------------------------------
  console.log('--- TEST 7: YogaPostureVisual vector illustration implementation ---');
  const postureVisualSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/yogaSadhana/YogaPostureVisual.tsx'),
    'utf8'
  );
  assert.ok(
    postureVisualSource.includes("practiceId === 'shavasana'"),
    'Must contain Shavasana vector SVG'
  );
  assert.ok(
    postureVisualSource.includes("practiceId === 'sukhasana'"),
    'Must contain Sukhasana vector SVG'
  );
  assert.ok(
    postureVisualSource.includes("practiceId === 'tadasana'"),
    'Must contain Tadasana vector SVG'
  );
  assert.ok(
    postureVisualSource.includes("practiceId === 'anulom_vilom'"),
    'Must contain Anulom Vilom vector SVG'
  );
  assert.ok(
    postureVisualSource.includes('<svg'),
    'Must render SVG vector graphics'
  );
  assert.strictEqual(
    postureVisualSource.includes('http://') || postureVisualSource.includes('https://'),
    false,
    'Must have zero remote image URL requests'
  );
  assert.ok(
    postureVisualSource.includes('stepIndex'),
    'Must support stepIndex prop for dynamic step highlighting'
  );
  console.log('  ✓ Test 7 Passed: YogaPostureVisual provides 100% deterministic local SVG vectors');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 8: Active Session UI integrates visual posture and voice controls
  // -------------------------------------------------------------
  console.log('--- TEST 8: Active Session UI integration ---');
  const activeSessionSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/yogaSadhana/YogaActiveSession.tsx'),
    'utf8'
  );
  assert.ok(
    activeSessionSource.includes('<YogaPostureVisual'),
    'Active session UI must render YogaPostureVisual'
  );
  assert.ok(
    activeSessionSource.includes('YogaVoiceController.speakStep'),
    'Active session UI must invoke YogaVoiceController.speakStep'
  );
  assert.ok(
    activeSessionSource.includes('YogaVoiceController.stop()'),
    'Active session UI must invoke YogaVoiceController.stop() on pause/cancel/complete'
  );
  assert.ok(
    activeSessionSource.includes('handleToggleMute'),
    'Active session UI must provide mute toggle button handler'
  );
  assert.ok(
    activeSessionSource.includes('handleReplayStep'),
    'Active session UI must provide replay step button handler'
  );
  assert.ok(
    activeSessionSource.includes('handleNextStep') && activeSessionSource.includes('handlePrevStep'),
    'Active session UI must provide next and prev step navigation handlers'
  );
  console.log('  ✓ Test 8 Passed: Active session integrates visual demonstration and voice controls');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 9: Timing authority strictly preserved in YogaSessionEngine
  // -------------------------------------------------------------
  console.log('--- TEST 9: Timing authority invariant ---');
  assert.strictEqual(
    controllerSource.includes('setInterval'),
    false,
    'YogaVoiceController must not run setInterval timers'
  );
  assert.strictEqual(
    controllerSource.includes('sessionDuration'),
    false,
    'YogaVoiceController must not manage session duration'
  );
  console.log('  ✓ Test 9 Passed: YogaSessionEngine remains sole timing and session authority');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 10: Meditation domain isolation invariant
  // -------------------------------------------------------------
  console.log('--- TEST 10: Strict Meditation isolation ---');
  const meditationFiles = fs.readdirSync(path.resolve(process.cwd(), 'src/services/meditation'))
    .concat(fs.readdirSync(path.resolve(process.cwd(), 'src/components/meditation')));

  for (const f of meditationFiles) {
    const fullPath = f.endsWith('.tsx')
      ? path.resolve(process.cwd(), 'src/components/meditation', f)
      : path.resolve(process.cwd(), 'src/services/meditation', f);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.strictEqual(
      content.includes('yogaVoiceController'),
      false,
      `Meditation file ${f} must not reference yogaVoiceController`
    );
    assert.strictEqual(
      content.includes('YogaPostureVisual'),
      false,
      `Meditation file ${f} must not reference YogaPostureVisual`
    );
  }
  console.log('  ✓ Test 10 Passed: Meditation module remains 100% isolated and unaffected');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 11: Voice gender selection, metadata classification, and fallback handling
  // -------------------------------------------------------------
  console.log('--- TEST 11: Voice gender classification and resolveVoiceWithMetadata ---');
  
  // Scenario A: Both Male and Female Hindi voices available (e.g. Edge with Swara and Madhav)
  const dualVoices = [
    { name: 'Microsoft Madhav Online (Natural) - Hindi (India)', lang: 'hi-IN' } as any,
    { name: 'Microsoft Swara Online (Natural) - Hindi (India)', lang: 'hi-IN' } as any
  ];
  (SpeechEngine as any).cachedVoices = dualVoices;

  const femaleResA = SpeechEngine.resolveVoiceWithMetadata('hi', 'female');
  assert.strictEqual(femaleResA.voice?.name, 'Microsoft Swara Online (Natural) - Hindi (India)');
  assert.strictEqual(femaleResA.isExactGenderMatch, true);
  assert.strictEqual(femaleResA.detectedVoiceGender, 'female');
  assert.strictEqual(femaleResA.hasGenuineFemaleVoice, true);

  const maleResA = SpeechEngine.resolveVoiceWithMetadata('hi', 'male');
  assert.strictEqual(maleResA.voice?.name, 'Microsoft Madhav Online (Natural) - Hindi (India)');
  assert.strictEqual(maleResA.isExactGenderMatch, true);
  assert.strictEqual(maleResA.detectedVoiceGender, 'male');
  assert.strictEqual(maleResA.hasGenuineMaleVoice, true);
  console.log('  ✓ Test 11a Passed: Independent dual voice selection resolves exact matching genders');

  // Scenario B: Only Male Hindi voice available (e.g. Android Chrome with 'Google हिन्दी')
  const androidMaleOnlyVoices = [
    { name: 'Google हिन्दी', lang: 'hi-IN' } as any
  ];
  (SpeechEngine as any).cachedVoices = androidMaleOnlyVoices;

  const femaleResB = SpeechEngine.resolveVoiceWithMetadata('hi', 'female');
  // Must NOT claim that 'Google हिन्दी' is an exact female match
  assert.strictEqual(femaleResB.isExactGenderMatch, false, 'Must not claim exact gender match when only male voice exists');
  assert.strictEqual(femaleResB.hasGenuineFemaleVoice, false, 'hasGenuineFemaleVoice must be false');
  assert.strictEqual(femaleResB.voice?.name, 'Google हिन्दी', 'Uses best available voice as fallback');

  const maleResB = SpeechEngine.resolveVoiceWithMetadata('hi', 'male');
  assert.strictEqual(maleResB.isExactGenderMatch, true);
  assert.strictEqual(maleResB.detectedVoiceGender, 'male');
  console.log('  ✓ Test 11b Passed: Android single voice correctly detects female absence and marks fallback');

  // Scenario C: Asynchronous voice appearance (voices initially empty then populated)
  (SpeechEngine as any).cachedVoices = [];
  let asyncCallbackTriggered = false;
  const unsubVoices = SpeechEngine.onVoicesChanged(() => {
    asyncCallbackTriggered = true;
  });

  // Simulate window voiceschanged dispatch
  (SpeechEngine as any).cachedVoices = dualVoices;
  for (const listener of (SpeechEngine as any).voiceChangeListeners) {
    listener();
  }
  assert.strictEqual(asyncCallbackTriggered, true, 'onVoicesChanged must trigger subscribers on voice update');
  unsubVoices();
  console.log('  ✓ Test 11c Passed: Asynchronous voice availability updates listeners');

  // -------------------------------------------------------------
  // TEST 12: Utterance.voice assignment and honest disclosure verification
  // -------------------------------------------------------------
  console.log('--- TEST 12: Utterance.voice assignment and honest disclosure verification ---');
  // Check speechEngine source to guarantee utterance.voice is assigned
  const speechEngineSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/services/companion/speechEngine.ts'),
    'utf8'
  );
  assert.ok(
    speechEngineSource.includes('utterance.voice = selectedVoice'),
    'speechEngine must assign selectedVoice to utterance.voice'
  );
  assert.ok(
    activeSessionSource.includes('yoga-voice-fallback-disclosure'),
    'Active session must render fallback disclosure when female voice is uninstalled'
  );
  assert.ok(
    activeSessionSource.includes('आपके डिवाइस में वास्तविक हिंदी महिला वाणी उपलब्ध नहीं है। अभी उपलब्ध गुरु वाणी चलेगी।'),
    'Active session must include exact honest disclosure statement'
  );
  assert.ok(
    activeSessionSource.includes('Text-to-speech output → Preferred engine/voice data'),
    'Active session must provide helpful device TTS guidance'
  );

  // Verify YogaVoiceController natural fallback pitch logic:
  // When only male voice exists, female selection must use natural pitch 0.90, not distorted 1.18
  (SpeechEngine as any).cachedVoices = androidMaleOnlyVoices;
  YogaVoiceController.setVoiceGender('female');
  speakCalls = [];
  YogaVoiceController.speakStep('परीक्षण चरण');
  assert.strictEqual(speakCalls.length, 1);
  assert.strictEqual(
    speakCalls[0].options?.pitch,
    0.90,
    'Fallback male voice must use natural pitch 0.90 instead of artificial high pitch'
  );

  // When genuine female voice exists, female selection must use 1.08
  (SpeechEngine as any).cachedVoices = dualVoices;
  speakCalls = [];
  YogaVoiceController.speakStep('परीक्षण चरण 2');
  assert.strictEqual(speakCalls.length, 1);
  assert.strictEqual(
    speakCalls[0].options?.pitch,
    1.08,
    'Genuine female voice must use natural yogini pitch 1.08'
  );
  console.log('  ✓ Test 12 Passed: utterance.voice assigned, honest disclosure verified, and natural fallback pitch enforced');
  passedTests += 2;

  // Restore originals
  SpeechEngine.speak = originalSpeak;
  SpeechEngine.stop = originalStop;

  console.log('\n================================================================');
  console.log(`ALL ${passedTests}/${passedTests} YOGA VOICE & VISUAL GUIDANCE TESTS PASSED (100%)`);
  console.log('================================================================');
}

runYogaVoiceGuidanceTestSuite().catch((err) => {
  console.error('Voice & visual guidance test suite failed:', err);
  process.exit(1);
});
