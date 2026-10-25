import { BirthProfile, EngineResult, AyanamsaType, MasterKundliData } from '../../types/kundli';
import { KundliValidator } from './validator';
import { VimshottariEngine } from '../jyotish/dasha/vimshottari';
import { DashaValidator } from '../jyotish/dasha/dashaValidator';
import { ParashariEngine } from '../jyotish/parashari/engine';
import { ParashariValidator } from '../jyotish/parashari/validator';
import { IntelligenceEngine } from '../intelligence/intelligenceEngine';

export class AstronomyService {
  static async calculateKundli(profile: BirthProfile, ayanamsa: AyanamsaType = 'Lahiri'): Promise<EngineResult> {
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dob: profile.dob,
          time: profile.time,
          latitude: profile.latitude,
          longitude: profile.longitude,
          timezone: profile.timezone,
          ayanamsa
        })
      });

      const responseText = await response.text();
      let responseJson: any = {};
      try {
        responseJson = responseText ? JSON.parse(responseText) : {};
      } catch (parseErr) {
        if (!response.ok) {
          throw new Error(`Server error (${response.status}): ${responseText || 'Empty response'}`);
        }
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        throw new Error(responseJson.error || `Calculation failed (${response.status})`);
      }

      const data: MasterKundliData = responseJson;

      // Independent Math Verification
      const isVerified = KundliValidator.validatePayload(data);

      if (!isVerified) {
         throw new Error('Mathematical validation of planetary coordinates failed.');
      }

      // Run internal Dasha math tests
      DashaValidator.runTests();

      // Calculate Vimshottari Dasha dynamically
      data.vimshottariDasha = VimshottariEngine.calculate(data);

      // Run internal Parashari rules tests
      ParashariValidator.runTests();

      // Process Parashari Rules
      data.parashariAnalysis = ParashariEngine.analyze(data);

      // Populate Panchatattva deterministically as Single Source of Truth
      data.panchatattva = IntelligenceEngine.getPanchatattva(profile);

      return {
        status: 'Ready',
        data: data,
        message: 'सफलतापूर्वक वास्तविक खगोलीय गणना की गई।', // "Real astronomical calculation done successfully"
        isVerified: true
      };
    } catch (error: any) {
      console.error('Astronomy Service Error:', error);
      return {
        status: 'Error',
        data: null,
        message: `गणना में त्रुटि: ${error.message || 'Server Not Responding'}`,
        isVerified: false
      };
    }
  }
}
