import { MasterKundliData } from '../../types/kundli';
import { JyotishRelationships } from '../../types/jyotish';
import { ParashariRules } from './parashariRules';
import { RelationshipValidator } from './relationshipValidator';

export class RelationshipEngine {
  /**
   * Analyzes the validated MasterKundliData and computes all cross-planetary relationships
   * and aspects according to standard Jyotish rules.
   */
  static analyze(data: MasterKundliData): JyotishRelationships {
    
    // Run automated internal tests
    RelationshipValidator.runTests();

    // 1. Calculate Parashari relationships
    const parashariAspects = ParashariRules.calculateAspects(data);

    const parashariConjunctions = ParashariRules.detectConjunctions(data);
    const parashariDignities = ParashariRules.calculateDignity(data);

    // Prepare structure for future systems
    return {
      parashari: {
        aspects: parashariAspects,
        conjunctions: parashariConjunctions,
        dignities: parashariDignities,
      },
      jaimini: null, // Placeholder for future integration
      kp: null,      // Placeholder for future integration
      lalKitab: null // Placeholder for future integration
    };
  }
}
