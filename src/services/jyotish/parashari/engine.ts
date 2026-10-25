import { MasterKundliData } from '../../../types/kundli';
import { ParashariEngineResult, ParashariInterpretation } from '../../../types/parashari';
import { DignityCalculator } from './dignity';
import { FunctionalNatureCalculator } from './functional';
import { HouseAnalyzer } from './houseAnalysis';
import { YogaCalculator } from './yogas';
import { FoundationCalculator } from './foundation';

export class ParashariEngine {
  static analyze(data: MasterKundliData): ParashariEngineResult {
    const foundation = FoundationCalculator.calculate(data);
    const dignities = DignityCalculator.calculateAll(data);
    const functionalNatures = FunctionalNatureCalculator.calculate(data);
    const houseAnalysis = HouseAnalyzer.analyzeAll(data);
    const yogas = YogaCalculator.calculate(foundation);
    
    // Generate basic interpretations structure (legacy compatibility)
    const interpretations: ParashariInterpretation[] = [];

    return {
      foundation,
      dignities,
      functionalNatures,
      houseAnalysis,
      yogas,
      interpretations
    };
  }
}
