import { MasterKundliData } from '../../types/kundli';

export class KundliValidator {
  /**
   * Mathematically converts a sidereal longitude into Rashi, Degree, Nakshatra, and Pada.
   * This operates independently to act as a verifier against the server's payload.
   */
  static verifyLongitude(longitude: number): { rashi: number, degree: number, nakshatra: number, pada: number } {
    // Normalize to 0-359.999...
    const normalized = ((longitude % 360) + 360) % 360;
    
    // Rashi (Sign): 30 degrees per sign
    const rashi = Math.floor(normalized / 30) + 1;
    
    // Degree within the sign
    const degree = normalized % 30;
    
    // Nakshatra: 27 total, so 360 / 27 = 13.3333... degrees each
    const nakshatra = Math.floor(normalized / (360 / 27)) + 1;
    
    // Pada: 108 total, so 360 / 108 = 3.3333... degrees each
    const pada = Math.floor((normalized % (360 / 27)) / (360 / 108)) + 1;
    
    return { rashi, degree, nakshatra, pada };
  }

  /**
   * Run automated internal unit tests for known longitude boundaries and whole sign houses.
   */
  static runAutomatedTests() {
    // Test 1: 92.24 degrees
    const test1 = this.verifyLongitude(92.24);
    if (test1.rashi !== 4) throw new Error(`Test 1 Failed: Expected Rashi 4 (Cancer), got ${test1.rashi}`);
    if (test1.nakshatra !== 7) throw new Error(`Test 1 Failed: Expected Nakshatra 7, got ${test1.nakshatra}`);
    if (test1.pada !== 4) throw new Error(`Test 1 Failed: Expected Pada 4, got ${test1.pada}`);

    // Test 2: 359.99 degrees (End of Pisces/Revati)
    const test2 = this.verifyLongitude(359.99);
    if (test2.rashi !== 12) throw new Error(`Test 2 Failed: Expected Rashi 12 (Pisces), got ${test2.rashi}`);
    if (test2.nakshatra !== 27) throw new Error(`Test 2 Failed: Expected Nakshatra 27, got ${test2.nakshatra}`);
    if (test2.pada !== 4) throw new Error(`Test 2 Failed: Expected Pada 4, got ${test2.pada}`);

    // Test 3: Whole Sign House Calculation Math
    // Lagna is Cancer (4), Planet is Capricorn (10). Planet should be in 7th house.
    const lagnaRashi = 4;
    const planetRashi = 10;
    const calculatedHouse = ((planetRashi - lagnaRashi + 12) % 12) + 1;
    if (calculatedHouse !== 7) throw new Error(`Test 3 Failed: Expected House 7, got ${calculatedHouse}`);
    
    console.log('[Validator] Internal longitude and house boundary tests passed.');
  }

  /**
   * Validates the complete MasterKundliData payload to ensure no math errors occurred on the server.
   */
  static validatePayload(data: MasterKundliData): boolean {
    // 1. Run internal boundary tests
    this.runAutomatedTests();

    if (!data.lagna || !data.planets || !data.metadata || !data.d1Chart || !data.bhavaChart) {
      console.error('[Validator] Missing required core data structures in Master Kundli Dataset.');
      return false;
    }

    // 2. Verify Lagna Math independently
    const lagnaMath = this.verifyLongitude(data.lagna.siderealLongitude);
    if (lagnaMath.rashi !== data.lagna.rashi || lagnaMath.nakshatra !== data.lagna.nakshatra) {
       console.error(`[Validator] Lagna validation failed:`, { expected: lagnaMath, got: data.lagna });
       return false;
    }

    // 3. Verify All Planets and their D1 House assignment
    for (const key of Object.keys(data.planets)) {
      const p = data.planets[key];
      const math = this.verifyLongitude(p.siderealLongitude);
      
      if (
        math.rashi !== p.rashi || 
        math.nakshatra !== p.nakshatra || 
        math.pada !== p.pada ||
        Math.abs(math.degree - p.degree) > 0.0001
      ) {
        console.error(`[Validator] Planetary math validation failed for ${p.name}:`, { expected: math, got: p });
        return false;
      }

      // Verify D1 House assignment
      const expectedD1House = ((p.rashi - data.lagna.rashi + 12) % 12) + 1;
      if (p.d1House !== expectedD1House) {
        console.error(`[Validator] D1 House validation failed for ${p.name}: expected ${expectedD1House}, got ${p.d1House}`);
        return false;
      }

      // Verify planet exists in the correct D1 Chart house array
      if (!data.d1Chart[expectedD1House].planetsOccupying.includes(p.name)) {
         console.error(`[Validator] D1 Chart missing planet ${p.name} in House ${expectedD1House}`);
         return false;
      }
    }

    console.log('[Validator] Master Kundli Dataset mathematically verified.');
    return true;
  }
}

