import { KpEngine } from '../services/jyotish/kpEngine';
import { MasterKundliData } from '../types/kundli';

export class KpRulingPlanetsVerificationSuite {
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

    console.log('--- STARTING KP PHASE 3A RULING PLANETS TEST SUITE ---');

    try {
      // Test Chart 1: 1989-10-15 14:30 at Indore (Sunday)
      const res1 = await fetch('http://localhost:3000/api/calculate', {
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
      const data1: MasterKundliData = await res1.json();
      const engine = new KpEngine();
      const result1 = engine.evaluate(data1);

      assert(result1.system === 'KP', 'Result system must be KP');
      assert(result1.rulingPlanets !== undefined, 'rulingPlanets must be present');
      
      const rp1 = result1.rulingPlanets!;

      // 1. LAGNA RP
      assert(rp1.lagna !== undefined, 'Lagna RP must be present');
      assert(typeof rp1.lagna.signLord === 'string' && rp1.lagna.signLord.length > 0, 'Lagna Sign Lord must be a non-empty string');
      assert(typeof rp1.lagna.starLord === 'string' && rp1.lagna.starLord.length > 0, 'Lagna Star Lord must be a non-empty string');
      assert(typeof rp1.lagna.subLord === 'string' && rp1.lagna.subLord.length > 0, 'Lagna Sub Lord must be a non-empty string');
      assert(rp1.lagna.signLord === 'Saturn', `Expected Lagna Sign Lord Saturn, got ${rp1.lagna.signLord}`);
      assert(rp1.lagna.starLord === 'Moon', `Expected Lagna Star Lord Moon, got ${rp1.lagna.starLord}`);
      assert(rp1.lagna.subLord === 'Venus', `Expected Lagna Sub Lord Venus, got ${rp1.lagna.subLord}`);

      // 2. MOON RP
      assert(rp1.moon !== undefined, 'Moon RP must be present');
      assert(typeof rp1.moon.signLord === 'string' && rp1.moon.signLord.length > 0, 'Moon Sign Lord must be a non-empty string');
      assert(typeof rp1.moon.starLord === 'string' && rp1.moon.starLord.length > 0, 'Moon Star Lord must be a non-empty string');
      assert(typeof rp1.moon.subLord === 'string' && rp1.moon.subLord.length > 0, 'Moon Sub Lord must be a non-empty string');
      assert(rp1.moon.signLord === 'Mars', `Expected Moon Sign Lord Mars, got ${rp1.moon.signLord}`);
      assert(rp1.moon.starLord === 'Ketu', `Expected Moon Star Lord Ketu, got ${rp1.moon.starLord}`);
      assert(rp1.moon.subLord === 'Rahu', `Expected Moon Sub Lord Rahu, got ${rp1.moon.subLord}`);

      // 3. DAY LORD RP
      assert(rp1.dayLord !== undefined, 'Day Lord RP must be present');
      assert(rp1.dayLord.dayIndex === 0, `Expected dayIndex 0 (Sunday) for 1989-10-15, got ${rp1.dayLord.dayIndex}`);
      assert(rp1.dayLord.dayLord === 'Sun', `Expected Day Lord Sun for Sunday, got ${rp1.dayLord.dayLord}`);
      assert(rp1.dayLord.dayName === 'Sunday', `Expected Day Name Sunday, got ${rp1.dayLord.dayName}`);

      // 4. KP RP FRAMEWORK
      assert(Array.isArray(rp1.primaryList), 'primaryList must be an array');
      assert(rp1.primaryList.length > 0, 'primaryList must not be empty');
      assert(rp1.primaryList.includes('Sun'), 'primaryList must include Day Lord Sun');
      assert(rp1.primaryList.includes('Moon'), 'primaryList must include Lagna Star Lord Moon');
      assert(rp1.primaryList.includes('Saturn'), 'primaryList must include Lagna Sign Lord Saturn');
      assert(rp1.primaryList.includes('Mars'), 'primaryList must include Moon Sign Lord Mars');
      assert(rp1.primaryList.includes('Ketu'), 'primaryList must include Moon Star Lord Ketu');

      assert(Array.isArray(rp1.details), 'details must be an array');
      assert(rp1.details.length === 7, `Expected 7 hierarchy details items, got ${rp1.details.length}`);
      assert(rp1.details[0].role === 'STAR_LORD' && rp1.details[0].source === 'MOON', 'Detail 1 must be Moon Star Lord');
      assert(rp1.details[1].role === 'SIGN_LORD' && rp1.details[1].source === 'MOON', 'Detail 2 must be Moon Sign Lord');
      assert(rp1.details[2].role === 'STAR_LORD' && rp1.details[2].source === 'LAGNA', 'Detail 3 must be Lagna Star Lord');
      assert(rp1.details[3].role === 'SIGN_LORD' && rp1.details[3].source === 'LAGNA', 'Detail 4 must be Lagna Sign Lord');
      assert(rp1.details[4].role === 'DAY_LORD' && rp1.details[4].source === 'DAY', 'Detail 5 must be Day Lord');
      assert(rp1.details[5].role === 'SUB_LORD' && rp1.details[5].source === 'LAGNA', 'Detail 6 must be Lagna Sub Lord');
      assert(rp1.details[6].role === 'SUB_LORD' && rp1.details[6].source === 'MOON', 'Detail 7 must be Moon Sub Lord');

      // Check node representations
      assert(Array.isArray(rp1.nodeRepresentations), 'nodeRepresentations must be an array');
      assert(rp1.nodeRepresentations.length === 2, `Expected 2 nodes, got ${rp1.nodeRepresentations.length}`);
      const rahuRep = rp1.nodeRepresentations.find(n => n.node === 'Rahu');
      const ketuRep = rp1.nodeRepresentations.find(n => n.node === 'Ketu');
      assert(rahuRep !== undefined, 'Rahu representation must exist');
      assert(ketuRep !== undefined, 'Ketu representation must exist');
      assert(rahuRep!.signLord === 'Saturn', 'Rahu in Aquarius has Sign Lord Saturn');
      assert(ketuRep!.signLord === 'Sun', 'Ketu in Leo has Sign Lord Sun');

      // Test Chart 2: 2024-01-01 09:15 at New Delhi (Monday -> Moon Day Lord)
      const res2 = await fetch('http://localhost:3000/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dob: '2024-01-01',
          time: '09:15',
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 'Asia/Kolkata',
          ayanamsa: 'Lahiri'
        })
      });
      const data2: MasterKundliData = await res2.json();
      const result2 = engine.evaluate(data2);
      const rp2 = result2.rulingPlanets!;

      assert(rp2.dayLord.dayIndex === 1, `Expected Day Index 1 (Monday) for 2024-01-01, got ${rp2.dayLord.dayIndex}`);
      assert(rp2.dayLord.dayLord === 'Moon', `Expected Day Lord Moon for Monday, got ${rp2.dayLord.dayLord}`);
      assert(rp2.dayLord.dayName === 'Monday', `Expected Day Name Monday, got ${rp2.dayLord.dayName}`);
      assert(rp2.lagna.signLord.length > 0, 'Chart 2 Lagna Sign Lord must be valid');
      assert(rp2.lagna.starLord.length > 0, 'Chart 2 Lagna Star Lord must be valid');
      assert(rp2.lagna.subLord.length > 0, 'Chart 2 Lagna Sub Lord must be valid');
      assert(rp2.moon.signLord.length > 0, 'Chart 2 Moon Sign Lord must be valid');
      assert(rp2.moon.starLord.length > 0, 'Chart 2 Moon Star Lord must be valid');
      assert(rp2.moon.subLord.length > 0, 'Chart 2 Moon Sub Lord must be valid');

    } catch (e: any) {
      failed++;
      errors.push(e?.message || String(e));
      console.error('Test execution exception:', e);
    }

    console.log(`KP Phase 3A Tests Finished: ${passed} passed, ${failed} failed`);
    return { passed, failed, errors };
  }
}
