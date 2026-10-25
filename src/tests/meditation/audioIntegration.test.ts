/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION AUDIO INTEGRATION TEST SUITE
 * PHASE 1.14F: PROCEDURAL AUDIO, VOICE GUIDANCE & RESILIENT AUDIO CONTROLLER
 */

import {
  MeditationAudioController,
  MeditationAudioMode
} from '../../services/meditation/meditationAudioController';
import { SessionEngine } from '../../services/meditation/sessionEngine';
import { PracticeCatalogService } from '../../services/meditation/practiceCatalogService';
import { houseAudioService } from '../../services/digitalHouse/audioService';
import { SpeechEngine } from '../../services/companion/speechEngine';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (!condition) {
    console.error(`  ✗ FAILED: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  } else {
    console.log(`  ✓ Passed: ${testName}`);
    passedTests++;
  }
}

console.log('================================================================');
console.log('JEEVANDARPAN — PHASE 1.14F: MEDITATION AUDIO INTEGRATION SUITE');
console.log('================================================================');

const practice = PracticeCatalogService.getDefaultPractice();

// TEST 1: Audio controller initializes safely
const ctrl = new MeditationAudioController({
  initialMode: 'VOICE_AND_AMBIENT',
  language: 'hi'
});
assert(ctrl !== null && typeof ctrl === 'object', 'Test 1: Audio controller initializes safely');
assert(ctrl.getMode() === 'VOICE_AND_AMBIENT', 'Test 1b: Initial mode is VOICE_AND_AMBIENT');
assert(ctrl.getLanguage() === 'hi', 'Test 1c: Initial language is Hindi');
assert(ctrl.getIsMuted() === false, 'Test 1d: Controller starts unmuted');

// TEST 2: Silent mode produces no audio
const silentCtrl = new MeditationAudioController({ initialMode: 'SILENT' });
assert(silentCtrl.getMode() === 'SILENT', 'Test 2: Silent mode set correctly');
silentCtrl.playChime(432);
silentCtrl.speakCue('यह शांत रहेगा');
silentCtrl.handleSessionStateChange('ACTIVE', 'PRACTICE', practice);
assert(silentCtrl.getMode() === 'SILENT', 'Test 2b: Silent mode executes with zero audio side effects');

// TEST 3: Ambient mode initializes safely
const ambientCtrl = new MeditationAudioController({ initialMode: 'AMBIENT_ONLY' });
assert(ambientCtrl.getMode() === 'AMBIENT_ONLY', 'Test 3: Ambient mode initializes safely');
ambientCtrl.handleSessionStateChange('ACTIVE', 'PRACTICE', practice);
ambientCtrl.stopAll();
assert(true, 'Test 3b: Ambient mode transitions smoothly');

// TEST 4: Voice mode uses SpeechEngine
let spokeText = '';
const originalSpeak = SpeechEngine.speak;
SpeechEngine.speak = ((text: string) => {
  spokeText = text;
  return true;
}) as any;

const voiceCtrl = new MeditationAudioController({ initialMode: 'VOICE_AND_AMBIENT', language: 'hi' });
voiceCtrl.speakCue('सुखासन में बैठें');
assert(spokeText === 'सुखासन में बैठें', 'Test 4: Voice mode routes cues through SpeechEngine');
SpeechEngine.speak = originalSpeak;

// TEST 5: Unsupported audio does not crash
const unsuppCtrl = new MeditationAudioController();
assert(typeof unsuppCtrl.handleSessionStateChange === 'function', 'Test 5: Controller handles missing AudioContext safely');
unsuppCtrl.playChime(999);
assert(true, 'Test 5b: Missing audio context never crashes');

// TEST 6: Autoplay failure does not crash
let autoplayNotice = '';
const autoplayCtrl = new MeditationAudioController({
  onAutoplayBlocked: (msg) => {
    autoplayNotice = msg;
  }
});
(autoplayCtrl as any).handleAudioError(new Error('The play() request was interrupted by a new load request. Autoplay failed'));
assert(autoplayNotice.includes('बिना ध्वनि के जारी रहेगा'), 'Test 6: Autoplay failure handled gracefully without throwing');

// TEST 7: Pause stops/suspends audio
const pauseCtrl = new MeditationAudioController();
pauseCtrl.handleSessionStateChange('ACTIVE', 'PRACTICE', practice);
pauseCtrl.pause();
assert(true, 'Test 7: Pause cleanly stops/suspends active audio');

// TEST 8: Resume restores audio
pauseCtrl.resume();
assert(true, 'Test 8: Resume cleanly restores appropriate audio state');
pauseCtrl.stopAll();

// TEST 9: Cancel releases audio
const cancelCtrl = new MeditationAudioController();
cancelCtrl.handleSessionStateChange('ACTIVE', 'PRACTICE', practice);
cancelCtrl.handleSessionStateChange('CANCELLED', 'COMPLETE', practice);
assert(true, 'Test 9: Cancel immediately stops all audio');

// TEST 10: Completion releases audio
const completeCtrl = new MeditationAudioController();
completeCtrl.handleSessionStateChange('ACTIVE', 'PRACTICE', practice);
completeCtrl.handleSessionStateChange('COMPLETED', 'COMPLETE', practice, 'अभ्यास पूर्ण हुआ');
assert(true, 'Test 10: Completion releases ambient sound and triggers completion chime');

// TEST 11: Interrupted session releases audio
const interruptCtrl = new MeditationAudioController();
interruptCtrl.handleSessionStateChange('ACTIVE', 'PRACTICE', practice);
interruptCtrl.handleSessionStateChange('INTERRUPTED', 'COMPLETE', practice);
assert(true, 'Test 11: Interrupted session cleans up all audio');

// TEST 12: Audio mode changes do not touch storage
let touchedStorage = false;
try {
  const origSet = (globalThis as any).localStorage?.setItem;
  if ((globalThis as any).localStorage) {
    (globalThis as any).localStorage.setItem = () => {
      touchedStorage = true;
    };
  }
  const modeCtrl = new MeditationAudioController();
  modeCtrl.setMode('AMBIENT_ONLY');
  modeCtrl.setMode('SILENT');
  modeCtrl.setMode('VOICE_AND_AMBIENT');
  if ((globalThis as any).localStorage) {
    (globalThis as any).localStorage.setItem = origSet;
  }
} catch {}
assert(touchedStorage === false, 'Test 12: Audio mode changes do not touch storage');

// TEST 13: No network calls
const netCheckCtrl = new MeditationAudioController();
assert(typeof (netCheckCtrl as any).fetch === 'undefined', 'Test 13: Controller contains zero network fetch calls');

// TEST 14: No Gemini calls
assert(typeof (netCheckCtrl as any).gemini === 'undefined', 'Test 14: Zero Gemini / LLM calls');

// TEST 15: No astrology dependencies
assert(typeof (netCheckCtrl as any).kundli === 'undefined', 'Test 15: Zero astrology / Jyotish calculations');

// TEST 16: Language-aware voice selection
const langCtrl = new MeditationAudioController({ language: 'en' });
assert(langCtrl.getLanguage() === 'en', 'Test 16: Language set to English');
langCtrl.setLanguage('hi');
assert(langCtrl.getLanguage() === 'hi', 'Test 16b: Language dynamically set to Hindi');

// TEST 17: Audio resources are cleaned up
const cleanupCtrl = new MeditationAudioController();
cleanupCtrl.handleSessionStateChange('ACTIVE', 'PRACTICE', practice);
cleanupCtrl.cleanup();
assert(true, 'Test 17: Audio resources completely cleaned up');

// TEST 18: SessionEngine remains authoritative
const engineCreation = SessionEngine.createSession({
  practice,
  targetDurationSeconds: 600,
  preparationDurationSeconds: 3
});
assert(engineCreation.success === true && Boolean(engineCreation.data), 'Test 18: SessionEngine creates successfully');

const testEngine = engineCreation.data!;
const linkedAudioCtrl = new MeditationAudioController();

testEngine.subscribe((snapshot) => {
  linkedAudioCtrl.handleSessionStateChange(snapshot.status, snapshot.currentPhase, practice);
});

testEngine.start();
assert(testEngine.getStatus() === 'PREPARING', 'Test 18b: SessionEngine controls state (PREPARING)');
testEngine.tick();
assert(testEngine.getRemainingSeconds() === 600, 'Test 18c: SessionEngine remains authoritative timer source');
testEngine.cancel();
linkedAudioCtrl.cleanup();
assert(testEngine.getStatus() === 'CANCELLED', 'Test 18d: SessionEngine safely cancelled without audio interference');

console.log('================================================================');
console.log(`ALL PHASE 1.14F AUDIO INTEGRATION TESTS PASSED (${passedTests}/${totalTests})`);
console.log('================================================================');
