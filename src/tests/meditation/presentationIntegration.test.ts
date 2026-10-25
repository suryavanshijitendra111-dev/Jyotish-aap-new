/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MEDITATION PHASE 1.14E: PRESENTATION & ROUTING VERIFICATION SUITE
 * STRICT SCOPE: PURE PRESENTATION LAYER & STATE MACHINE INTEGRATION
 */

import { PracticeCatalogService } from '../../services/meditation/practiceCatalogService';
import { SessionEngine } from '../../services/meditation/sessionEngine';
import { meditationLocales } from '../../i18n/locales/meditationLocales';
import { t } from '../../i18n';

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
console.log('JEEVANDARPAN — PHASE 1.14E: MEDITATION PRESENTATION & INTEGRATION');
console.log('================================================================');

// 1. Practice Catalog Available for Presentation
const practices = PracticeCatalogService.getAllPractices();
assert(practices.length === 6, 'Exactly 6 vetted practices available for presentation');

// 2. All practices resolve localized title, description, instructions, and safety in Hindi
for (const p of practices) {
  const title = t(p.titleKey);
  const desc = t(p.descriptionKey);
  const instructions = t(p.instructionsKey);
  const safety = t(p.safetyNoticeKey);

  assert(Boolean(title) && !title.includes('meditation.'), `Practice ${p.practiceId} resolves localized title`);
  assert(Boolean(desc) && !desc.includes('meditation.'), `Practice ${p.practiceId} resolves localized description`);
  assert(Boolean(instructions) && !instructions.includes('meditation.'), `Practice ${p.practiceId} resolves localized instructions`);
  assert(Boolean(safety) && !safety.includes('meditation.'), `Practice ${p.practiceId} resolves localized safety notice`);
}

// 3. All voice cues resolve localized text
for (const p of practices) {
  for (const phase of p.phases) {
    if (phase.voiceCueKey) {
      const cue = t(phase.voiceCueKey);
      assert(Boolean(cue) && !cue.includes('meditation.'), `Voice cue ${phase.voiceCueKey} resolves localized text`);
    }
  }
}

// 4. Default practice is Breath Awareness (श्वास जागरूकता)
const defaultPractice = PracticeCatalogService.getDefaultPractice();
assert(defaultPractice.practiceId === 'BREATH_AWARENESS', 'Default practice is BREATH_AWARENESS');
assert(t(defaultPractice.titleKey) === 'श्वास जागरूकता', 'Default practice title in Hindi is श्वास जागरूकता');

// 5. English locale translation parity
assert(Boolean(meditationLocales.en.practices.breath_awareness.title), 'English title for breath_awareness exists');
assert(Boolean(meditationLocales.en.practices.silent_meditation.title), 'English title for silent_meditation exists');
assert(Boolean(meditationLocales.en.practices.body_awareness.title), 'English title for body_awareness exists');
assert(Boolean(meditationLocales.en.practices.gratitude_reflection.title), 'English title for gratitude_reflection exists');
assert(Boolean(meditationLocales.en.practices.self_observation.title), 'English title for self_observation exists');
assert(Boolean(meditationLocales.en.practices.prayerful_contemplation.title), 'English title for prayerful_contemplation exists');

// 6. Session Engine launches cleanly with presentation options
const sessionRes = SessionEngine.createSession({
  practice: defaultPractice,
  targetDurationSeconds: 600,
  preparationDurationSeconds: 3
});
assert(sessionRes.success === true && Boolean(sessionRes.data), 'SessionEngine creates successfully with UI options');

const engine = sessionRes.data!;
engine.start();
const snap = engine.getSessionSnapshot();
assert(snap.status === 'PREPARING', 'Session engine enters PREPARING on start');
assert(snap.remainingSeconds === 600, 'Remaining seconds begins at target duration 600');
engine.cancel();
assert(engine.getStatus() === 'CANCELLED', 'Session engine cancels cleanly without guilt');

// 7. In-Memory Session Snapshot Verification (Zero Storage)
assert(snap.sessionId.startsWith('ses_'), 'Session snapshot produces valid in-memory identifier');
assert(snap.progressRatio >= 0 && snap.progressRatio <= 1, 'Progress ratio bounded in [0, 1]');

console.log('================================================================');
console.log(`ALL PHASE 1.14E PRESENTATION INTEGRATION TESTS PASSED (${passedTests}/${totalTests})`);
console.log('================================================================');
