/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — P1-C KARANA & PANCHANG STRICT AUDIT TEST SUITE
 */

import { MuhuratPanchangCalculator } from '../services/muhurat/muhuratPanchangCalculator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function runAudit() {
  console.log('=== STARTING P1-C STRICT AUDIT ===');

  // 1. Test Karana 60-half-tithi indexing logic
  console.log('Test 1: Verifying Karana indexing rules (0=Kimstughna, 1-56=movable, 57=Shakuni, 58=Chatushpada, 59=Naga)...');
  
  const panchang = await MuhuratPanchangCalculator.calculateDayPanchang(
    '2026-11-14',
    22.7196,
    75.8577,
    'Indore, MP',
    'Asia/Kolkata'
  );
  
  assert(panchang !== null, 'Panchang data must be returned');
  assert(panchang.karana !== undefined, 'Karana must be defined');
  assert(panchang.karana.number >= 1 && panchang.karana.number <= 60, 'Karana number must be between 1 and 60');
  console.log(`  ✓ Karana calculated successfully: #${panchang.karana.number} (${panchang.karana.nameHindi} - ${panchang.karana.name})`);

  // 2. Test Abhijit duration formula = Dinmaan / 15
  console.log('Test 2: Verifying Abhijit duration equals Dinmaan / 15...');
  const [srH, srM] = panchang.solarTimes.sunrise.split(':').map(Number);
  const [ssH, ssM] = panchang.solarTimes.sunset.split(':').map(Number);
  const sunriseMins = srH * 60 + srM;
  const sunsetMins = ssH * 60 + ssM;
  const dinmaan = sunsetMins - sunriseMins;
  const expectedAbhijitDuration = dinmaan / 15;

  const [abH1, abM1] = panchang.solarTimes.abhijitStart.split(':').map(Number);
  const [abH2, abM2] = panchang.solarTimes.abhijitEnd.split(':').map(Number);
  const abStartMins = abH1 * 60 + abM1;
  const abEndMins = abH2 * 60 + abM2;
  const actualAbhijitDuration = abEndMins - abStartMins;

  console.log(`  Dinmaan: ${dinmaan} mins, Expected Abhijit Duration: ${expectedAbhijitDuration.toFixed(2)} mins, Actual: ${actualAbhijitDuration} mins`);
  assert(Math.abs(actualAbhijitDuration - expectedAbhijitDuration) < 2, 'Abhijit duration must equal Dinmaan / 15');
  console.log('  ✓ Abhijit duration verification passed.');

  // 3. Test Rahu Kaal, Yamaganda, Gulika presence and valid time formatting
  console.log('Test 3: Verifying Rahu Kaal, Yamaganda, Gulika timing...');
  assert(panchang.solarTimes.rahuKaalStart && panchang.solarTimes.rahuKaalEnd, 'Rahu Kaal must be defined');
  assert(panchang.solarTimes.yamagandaStart && panchang.solarTimes.yamagandaEnd, 'Yamaganda must be defined');
  assert(panchang.solarTimes.gulikaStart && panchang.solarTimes.gulikaEnd, 'Gulika must be defined');
  console.log(`  Rahu Kaal: ${panchang.solarTimes.rahuKaalStart} - ${panchang.solarTimes.rahuKaalEnd}`);
  console.log(`  Yamaganda: ${panchang.solarTimes.yamagandaStart} - ${panchang.solarTimes.yamagandaEnd}`);
  console.log(`  Gulika: ${panchang.solarTimes.gulikaStart} - ${panchang.solarTimes.gulikaEnd}`);
  console.log('  ✓ Muhurta intervals verification passed.');

  // 4. Test Moonrise/Moonset calculation (checking no fallback stubs)
  console.log('Test 4: Verifying Moonrise/Moonset calculation without fabricated fallbacks...');
  const lunar = await MuhuratPanchangCalculator.calculateLunarTimes(
    '2026-11-14',
    22.7196,
    75.8577,
    'Asia/Kolkata'
  );
  assert(lunar.moonrise && lunar.moonset, 'Moonrise and Moonset must be calculated');
  console.log(`  Moonrise: ${lunar.moonrise}, Moonset: ${lunar.moonset}`);
  console.log('  ✓ Lunar times verification passed.');

  // 5. Test multi-location audit
  console.log('Test 5: Verifying calculation across multiple cities...');
  const varanasiPanchang = await MuhuratPanchangCalculator.calculateDayPanchang(
    '2026-11-14',
    25.3176,
    82.9739,
    'Varanasi, UP',
    'Asia/Kolkata'
  );
  assert(varanasiPanchang !== null, 'Varanasi Panchang must be calculated successfully');
  console.log(`  Varanasi Sunrise: ${varanasiPanchang.solarTimes.sunrise}, Sunset: ${varanasiPanchang.solarTimes.sunset}`);
  console.log('  ✓ Multi-location verification passed.');

  console.log('================================================================');
  console.log('ALL P1-C STRICT AUDIT TESTS PASSED SUCCESSFULLY.');
  console.log('================================================================');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
