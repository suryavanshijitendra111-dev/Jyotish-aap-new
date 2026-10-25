import { DateTime } from 'luxon';
import { MasterKundliData } from '../../../types/kundli';
import { VimshottariEngine } from './vimshottari';

export class DashaValidator {
  
  static runTests() {
    console.log('[DashaValidator] Running automated internal tests...');
    
    // Mock a Moon at 0 degrees Aries (Ashwini, Ketu Mahadasha)
    const mockData1 = {
      birthProfile: { dob: '01 January 2000', time: '12:00 PM', timezone: 'UTC' },
      planets: {
        Moon: { siderealLongitude: 0, tropicalLongitude: 23.6 }
      }
    } as any as MasterKundliData;
    
    const res1 = VimshottariEngine.calculate(mockData1);
    if (res1.birthNakshatra !== 'Ashwini') throw new Error('Test 1 Failed: Expected Ashwini');
    if (res1.birthNakshatraLord !== 'Ketu') throw new Error('Test 1 Failed: Expected Ketu');
    // Balance should be exactly 7 years
    if (Math.abs(res1.balanceYears - 7) > 0.001) throw new Error(`Test 1 Failed: Expected 7 balance years, got ${res1.balanceYears}`);
    
    // Check 120 year total duration
    const birthDate = DateTime.fromISO(res1.mahadashas[0].startDate);
    const endDate = DateTime.fromISO(res1.mahadashas[8].endDate);
    const totalDays = endDate.diff(birthDate, 'days').days;
    const expectedDays = 120 * 365.2425;
    if (Math.abs(totalDays - expectedDays) > 1) {
       throw new Error(`Test 1 Failed: Expected ~${expectedDays} total days, got ${totalDays}`);
    }

    // Mock Moon exactly halfway through Rohini (Moon Mahadasha, 10 years total)
    // 3 complete nakshatras = 3 * 13.3333 = 40 degrees. Half of 13.3333 = 6.6666. Total = 46.6666 degrees.
    const mockData2 = {
      birthProfile: { dob: '01 January 2000', time: '12:00 PM', timezone: 'UTC' },
      planets: {
        Moon: { siderealLongitude: 46.66666666666, tropicalLongitude: 46.66666666666 + 23.6 }
      }
    } as any as MasterKundliData;
    
    const res2 = VimshottariEngine.calculate(mockData2);
    if (res2.birthNakshatra !== 'Rohini') throw new Error('Test 2 Failed: Expected Rohini');
    if (res2.birthNakshatraLord !== 'Moon') throw new Error('Test 2 Failed: Expected Moon');
    // Balance should be approx 5 years
    if (Math.abs(res2.balanceYears - 5) > 0.001) throw new Error(`Test 2 Failed: Expected 5 balance years, got ${res2.balanceYears}`);

    // Test that all 9 planets exist in sequence starting from Moon
    const expectedSeq = ['Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun'];
    for (let i = 0; i < 9; i++) {
       if (res2.mahadashas[i].planet !== expectedSeq[i]) {
         throw new Error(`Test 2 Failed: Sequence mismatch at ${i}. Expected ${expectedSeq[i]} got ${res2.mahadashas[i].planet}`);
       }
    }

    // Test 3: Validate explicit boundaries using the specific profile (JS)
    const mockDataJS = {
      birthProfile: { dob: '24 June 1986', time: '06:20 AM', timezone: 'Asia/Kolkata' },
      planets: { 
        Moon: { siderealLongitude: 276.5493, tropicalLongitude: 298.7692 } // Uttara Ashadha (Sun)
      }
    } as any as MasterKundliData;
    
    const resJS = VimshottariEngine.calculate(mockDataJS);
    
    // Regression check for specific known profile boundaries
    if (resJS.birthNakshatraLord !== 'Sun') throw new Error(`Test 3 Failed: Expected Sun birth Mahadasha, got ${resJS.birthNakshatraLord}`);
    if (Math.abs(resJS.nakshatraProgress - 74.12) > 0.01) throw new Error(`Test 3 Failed: Expected ~74.12% progress, got ${resJS.nakshatraProgress}`);
    if (Math.abs(resJS.balanceYears - 1.5528) > 0.01) throw new Error(`Test 3 Failed: Expected ~1.5528 balance years, got ${resJS.balanceYears}`);
    
    // Check first Mahadasha end date bounds (approx 14/01/1988)
    const firstMahaEndJS = DateTime.fromISO(resJS.audit.firstMahadashaEndDate);
    if (firstMahaEndJS.year !== 1988 || firstMahaEndJS.month !== 1 || firstMahaEndJS.day !== 14) {
       throw new Error(`Test 3 Failed: First Mahadasha end must be 14-01-1988, got ${firstMahaEndJS.toISODate()}`);
    }

    // Since DateTime.now() moves, we check structural integrity of current/next for now
    if (resJS.currentMahadasha.planet === resJS.nextMahadasha.planet) {
      throw new Error(`Test 3 Failed: nextMahadasha should strictly be the NEXT mahadasha, not the current one.`);
    }

    // Explicitly check Jupiter/Saturn boundary for 14-09-2027 to prevent calendar drift regression
    const jupJS = resJS.mahadashas.find(m => m.planet === 'Jupiter');
    if (jupJS) {
      const satAntar = jupJS.subPeriods?.find(a => a.planet === 'Saturn');
      if (satAntar) {
         const endDt = DateTime.fromISO(satAntar.endDate);
         if (endDt.year !== 2027 || endDt.month !== 9 || endDt.day !== 14) {
           throw new Error(`Test 3 Failed: Jupiter/Saturn Antardasha MUST end on 2027-09-14 to prove drift logic is intact. Got: ${endDt.toISODate()}`);
         }
      }
    }

    if (resJS.nextAntardasha.startDate === resJS.nextMahadasha.startDate) {
      // In very rare cases this might align if we are on the very last AD, but usually they are distinct
      // But specifically we need to check that they are distinct objects in memory or correctly mapped
      if (resJS.currentMahadasha.planet === 'Saturn' && resJS.nextMahadasha.planet !== 'Mercury') {
         throw new Error('Test 3 Failed: Next Mahadasha after Saturn must be Mercury.');
      }
    }

    // Test 4: Verify explicit lengths for Jupiter and Saturn
    const jupiter = res1.mahadashas.find(m => m.planet === 'Jupiter');
    const saturn = res1.mahadashas.find(m => m.planet === 'Saturn');
    
    if (!jupiter) throw new Error("Jupiter Mahadasha not found in timeline");
    if (!saturn) throw new Error("Saturn Mahadasha not found in timeline");

    const jupYears = DateTime.fromISO(jupiter.endDate).diff(DateTime.fromISO(jupiter.startDate), 'days').days / 365.2425;
    const satYears = DateTime.fromISO(saturn.endDate).diff(DateTime.fromISO(saturn.startDate), 'days').days / 365.2425;

    if (Math.abs(jupYears - 16) > 0.1) throw new Error(`Jupiter Mahadasha is not 16 years, got ${jupYears}`);
    if (Math.abs(satYears - 19) > 0.1) throw new Error(`Saturn Mahadasha is not 19 years, got ${satYears}`);

    console.log('[DashaValidator] All tests passed.');
  }

}
