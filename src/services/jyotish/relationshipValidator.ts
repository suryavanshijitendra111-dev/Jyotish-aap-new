import { MasterKundliData } from '../../types/kundli';
import { RelationshipEngine } from './relationshipEngine';
import { ParashariRules } from './parashariRules';

export class RelationshipValidator {
  
  static runTests() {
    console.log('[RelationshipValidator] Running automated internal tests...');
    
    // Test 1: Aspect Math
    // If Mars is in House 1 (Aries 1), Aspects should be 4, 7, 8 (Cancer 4, Libra 7, Scorpio 8)
    const marsTypes = ParashariRules.getAspectTypes('Mars');
    if (!marsTypes.includes(4) || !marsTypes.includes(7) || !marsTypes.includes(8)) {
      throw new Error(`Test 1 Failed: Mars missing aspects`);
    }

    const jupTypes = ParashariRules.getAspectTypes('Jupiter');
    if (!jupTypes.includes(5) || !jupTypes.includes(9)) {
       throw new Error(`Test 1 Failed: Jupiter missing aspects`);
    }

    const satTypes = ParashariRules.getAspectTypes('Saturn');
    if (!satTypes.includes(3) || !satTypes.includes(10)) {
       throw new Error(`Test 1 Failed: Saturn missing aspects`);
    }

    // Mock an aspect calculation for Mars in H2
    const mockData = {
      planets: {
        Mars: { d1House: 2, rashi: 2, siderealLongitude: 45, name: 'Mars' }
      },
      d1Chart: {
        5: { planetsOccupying: [] }, // 2 + 4 - 1
        8: { planetsOccupying: ['Moon'] }, // 2 + 7 - 1
        9: { planetsOccupying: [] }  // 2 + 8 - 1
      }
    } as any as MasterKundliData;

    const aspects = ParashariRules.calculateAspects(mockData);
    if (aspects.length !== 3) throw new Error('Test failed: Mars should have exactly 3 aspects');
    
    // Check 4th aspect (target house 5)
    const aspect4 = aspects.find(a => a.aspectType === 4);
    if (aspect4?.targetHouse !== 5 || aspect4?.targetSign !== 5) {
      throw new Error('Test failed: Mars 4th aspect calculated incorrectly');
    }

    // Test Conjunction logic
    const mockConjData = {
      planets: {
        Sun: { name: 'Sun', d1House: 1, rashi: 1, siderealLongitude: 10 },
        Mercury: { name: 'Mercury', d1House: 1, rashi: 1, siderealLongitude: 15 },
        Moon: { name: 'Moon', d1House: 2, rashi: 2, siderealLongitude: 40 }
      }
    } as any as MasterKundliData;
    
    const conjunctions = ParashariRules.detectConjunctions(mockConjData);
    if (conjunctions.length !== 1) throw new Error('Test failed: Should detect exactly 1 conjunction');
    if (conjunctions[0].planet1 !== 'Sun' || conjunctions[0].planet2 !== 'Mercury') {
      throw new Error('Test failed: Conjunction planets incorrect');
    }
    if (conjunctions[0].separationDegrees !== 5) throw new Error('Test failed: Conjunction separation incorrect');

    console.log('[RelationshipValidator] All tests passed.');
  }

}
