import { MasterKundliData } from '../../../types/kundli';
import { LordshipCalculator } from './lordship';
import { DignityCalculator } from './dignity';
import { FunctionalNatureCalculator } from './functional';
import { ParashariEngine } from './engine';
import { FoundationCalculator } from './foundation';
import { YogaCalculator } from './yogas';

export class ParashariValidator {
  
  static runTests() {
    console.log('[ParashariValidator] Running automated internal tests...');
    
    // --- FOUNDATION TESTS ---
    // Gemini Ascendant -> Pisces is 10th house
    const mockFoundationData = {
      planets: {
        Jupiter: { name: 'Jupiter', d1House: 10, rashi: 12, rashiName: 'Pisces' },
        Mars: { name: 'Mars', d1House: 4, rashi: 6, rashiName: 'Virgo' },
        Saturn: { name: 'Saturn', d1House: 6, rashi: 8, rashiName: 'Scorpio' }
      },
      d1Chart: {
        1: { houseNumber: 1, rashi: 3, rashiName: 'Gemini', signLord: 'Mercury', planetsOccupying: [] },
        2: { houseNumber: 2, rashi: 4, rashiName: 'Cancer', signLord: 'Moon', planetsOccupying: [] },
        3: { houseNumber: 3, rashi: 5, rashiName: 'Leo', signLord: 'Sun', planetsOccupying: [] },
        4: { houseNumber: 4, rashi: 6, rashiName: 'Virgo', signLord: 'Mercury', planetsOccupying: ['Mars'] },
        5: { houseNumber: 5, rashi: 7, rashiName: 'Libra', signLord: 'Venus', planetsOccupying: [] },
        6: { houseNumber: 6, rashi: 8, rashiName: 'Scorpio', signLord: 'Mars', planetsOccupying: ['Saturn'] },
        7: { houseNumber: 7, rashi: 9, rashiName: 'Sagittarius', signLord: 'Jupiter', planetsOccupying: [] },
        8: { houseNumber: 8, rashi: 10, rashiName: 'Capricorn', signLord: 'Saturn', planetsOccupying: [] },
        9: { houseNumber: 9, rashi: 11, rashiName: 'Aquarius', signLord: 'Saturn', planetsOccupying: [] },
        10: { houseNumber: 10, rashi: 12, rashiName: 'Pisces', signLord: 'Jupiter', planetsOccupying: ['Jupiter'] },
        11: { houseNumber: 11, rashi: 1, rashiName: 'Aries', signLord: 'Mars', planetsOccupying: [] },
        12: { houseNumber: 12, rashi: 2, rashiName: 'Taurus', signLord: 'Venus', planetsOccupying: [] }
      }
    } as any as MasterKundliData;
    
    const foundation = FoundationCalculator.calculate(mockFoundationData);
    
    // Test: Gemini Ascendant -> Pisces is 10th house
    if (foundation.houses[10].rashi !== 12) throw new Error('Foundation Test Failed: 10th house should be Pisces (12)');
    // Test: 10th house -> Kendra
    if (foundation.houses[10].isKendra !== true) throw new Error('Foundation Test Failed: 10th house should be Kendra');
    // Test: Jupiter in Pisces -> 10th house
    if (foundation.planets['Jupiter'].house !== 10) throw new Error('Foundation Test Failed: Jupiter should be in 10th house');
    // Test: Jupiter in Pisces -> Own Sign
    if (foundation.planets['Jupiter'].dignity !== 'Own Sign') throw new Error(`Foundation Test Failed: Jupiter in Pisces should be Own Sign, got ${foundation.planets['Jupiter'].dignity}`);
    
    // Test aspects: Jupiter (5, 7, 9)
    const jupAspects = foundation.planets['Jupiter'].aspectsGiven.map(a => a.aspectedHouse).sort((a,b) => a-b);
    if (jupAspects.join(',') !== '2,4,6') throw new Error(`Foundation Test Failed: Jupiter aspects should be 2,4,6, got ${jupAspects}`);
    
    // Test aspects: Mars (4, 7, 8)
    const marsAspects = foundation.planets['Mars'].aspectsGiven.map(a => a.aspectedHouse).sort((a,b) => a-b);
    if (marsAspects.join(',') !== '7,10,11') throw new Error(`Foundation Test Failed: Mars aspects should be 7,10,11, got ${marsAspects}`);
    
    // Test aspects: Saturn (3, 7, 10)
    const satAspects = foundation.planets['Saturn'].aspectsGiven.map(a => a.aspectedHouse).sort((a,b) => a-b);
    if (satAspects.join(',') !== '3,8,12') throw new Error(`Foundation Test Failed: Saturn aspects should be 3,8,12, got ${satAspects}`);

    
    // --- YOGA ENGINE TESTS ---
    // Test Valid Hamsa (Jupiter in 10th, Pisces) -> using the mockFoundationData from above
    const yogasFoundation1 = YogaCalculator.calculate(foundation);
    const hamsa = yogasFoundation1.find(y => y.name === 'Hamsa Yoga');
    if (!hamsa || hamsa.status !== true) throw new Error('Yoga Test Failed: Expected valid Hamsa Yoga to be true.');
    
    // Test Invalid Hamsa (Jupiter in 5th, Pisces - not kendra)
    const mockF2 = JSON.parse(JSON.stringify(mockFoundationData));
    mockF2.planets['Jupiter'].d1House = 5;
    const foundation2 = FoundationCalculator.calculate(mockF2);
    const yogasFoundation2 = YogaCalculator.calculate(foundation2);
    const hamsa2 = yogasFoundation2.find(y => y.name === 'Hamsa Yoga');
    if (!hamsa2 || hamsa2.status !== false) throw new Error('Yoga Test Failed: Expected invalid Hamsa Yoga to be false (Not Kendra).');

    // Valid Bhadra: Mercury in 1st, Gemini (3)
    const mockF3 = JSON.parse(JSON.stringify(mockFoundationData));
    mockF3.planets['Mercury'] = { name: 'Mercury', d1House: 1, rashi: 3, rashiName: 'Gemini' };
    const foundation3 = FoundationCalculator.calculate(mockF3);
    const yogasFoundation3 = YogaCalculator.calculate(foundation3);
    const bhadra = yogasFoundation3.find(y => y.name === 'Bhadra Yoga');
    if (!bhadra || bhadra.status !== true) throw new Error('Yoga Test Failed: Expected valid Bhadra Yoga to be true.');

    // Invalid Bhadra: Mercury in 2nd, Gemini (3)
    const mockF4 = JSON.parse(JSON.stringify(mockFoundationData));
    mockF4.planets['Mercury'] = { name: 'Mercury', d1House: 2, rashi: 3, rashiName: 'Gemini' };
    const foundation4 = FoundationCalculator.calculate(mockF4);
    const yogasFoundation4 = YogaCalculator.calculate(foundation4);
    const bhadra2 = yogasFoundation4.find(y => y.name === 'Bhadra Yoga');
    if (!bhadra2 || bhadra2.status !== false) throw new Error('Yoga Test Failed: Expected invalid Bhadra Yoga to be false.');

    // Valid Malavya: Venus in 4th, Pisces (12 - Exalted)
    const mockF5 = JSON.parse(JSON.stringify(mockFoundationData));
    mockF5.planets['Venus'] = { name: 'Venus', d1House: 4, rashi: 12, rashiName: 'Pisces' };
    const foundation5 = FoundationCalculator.calculate(mockF5);
    const yogasFoundation5 = YogaCalculator.calculate(foundation5);
    const malavya = yogasFoundation5.find(y => y.name === 'Malavya Yoga');
    if (!malavya || malavya.status !== true) throw new Error('Yoga Test Failed: Expected valid Malavya Yoga to be true.');

    // Invalid Malavya: Venus in 4th, Aries (1 - Neutral)
    const mockF6 = JSON.parse(JSON.stringify(mockFoundationData));
    mockF6.planets['Venus'] = { name: 'Venus', d1House: 4, rashi: 1, rashiName: 'Aries' };
    const foundation6 = FoundationCalculator.calculate(mockF6);
    const yogasFoundation6 = YogaCalculator.calculate(foundation6);
    const malavya2 = yogasFoundation6.find(y => y.name === 'Malavya Yoga');
    if (!malavya2 || malavya2.status !== false) throw new Error('Yoga Test Failed: Expected invalid Malavya Yoga to be false (Neutral sign).');

    // Valid Ruchaka: Mars in 10th, Capricorn (10 - Exalted)
    const mockF7 = JSON.parse(JSON.stringify(mockFoundationData));
    mockF7.planets['Mars'] = { name: 'Mars', d1House: 10, rashi: 10, rashiName: 'Capricorn' };
    const foundation7 = FoundationCalculator.calculate(mockF7);
    const yogasFoundation7 = YogaCalculator.calculate(foundation7);
    const ruchaka = yogasFoundation7.find(y => y.name === 'Ruchaka Yoga');
    if (!ruchaka || ruchaka.status !== true) throw new Error('Yoga Test Failed: Expected valid Ruchaka Yoga to be true.');

    // Invalid Ruchaka: Mars in 10th, Cancer (4 - Debilitated)
    const mockF8 = JSON.parse(JSON.stringify(mockFoundationData));
    mockF8.planets['Mars'] = { name: 'Mars', d1House: 10, rashi: 4, rashiName: 'Cancer' };
    const foundation8 = FoundationCalculator.calculate(mockF8);
    const yogasFoundation8 = YogaCalculator.calculate(foundation8);
    const ruchaka2 = yogasFoundation8.find(y => y.name === 'Ruchaka Yoga');
    if (!ruchaka2 || ruchaka2.status !== false) throw new Error('Yoga Test Failed: Expected invalid Ruchaka Yoga to be false (Debilitated).');

    // Valid Shasha: Saturn in 7th, Libra (7 - Exalted)
    const mockF9 = JSON.parse(JSON.stringify(mockFoundationData));
    mockF9.planets['Saturn'] = { name: 'Saturn', d1House: 7, rashi: 7, rashiName: 'Libra' };
    const foundation9 = FoundationCalculator.calculate(mockF9);
    const yogasFoundation9 = YogaCalculator.calculate(foundation9);
    const shasha = yogasFoundation9.find(y => y.name === 'Shasha Yoga');
    if (!shasha || shasha.status !== true) throw new Error('Yoga Test Failed: Expected valid Shasha Yoga to be true.');

    // Invalid Shasha: Saturn in 9th, Libra (7 - Exalted but not Kendra)
    const mockF10 = JSON.parse(JSON.stringify(mockFoundationData));
    mockF10.planets['Saturn'] = { name: 'Saturn', d1House: 9, rashi: 7, rashiName: 'Libra' };
    const foundation10 = FoundationCalculator.calculate(mockF10);
    const yogasFoundation10 = YogaCalculator.calculate(foundation10);
    const shasha2 = yogasFoundation10.find(y => y.name === 'Shasha Yoga');
    if (!shasha2 || shasha2.status !== false) throw new Error('Yoga Test Failed: Expected invalid Shasha Yoga to be false (Not Kendra).');

    console.log('[ParashariValidator] All tests passed.');
  }
}