import { DashaIntelligenceEngine } from './dashaIntelligenceEngine';
import { TransitEngine } from './transitEngine';
import { NakshatraIntelligenceEngine } from './nakshatraIntelligence';
import { VargaEngine } from './vargaEngine';
import { JyotishSystemId, JyotishSystemMetadata, RuleEngine } from '../../types/systemRegistry';
import { ParashariEngine } from './parashariWrapper';
import { KpEngine } from './kpEngine';
import { JaiminiEngine } from './jaiminiEngine';
import { LalKitabEngine } from './lalKitabEngine';
import { MasterKundliData } from '../../types/kundli';

export class JyotishRegistry {
  private systems = new Map<JyotishSystemId, { metadata: JyotishSystemMetadata, engine: RuleEngine<any> }>();

  constructor() {
    this.registerSystems();
  }

  private registerSystems() {
    this.systems.set('PARASHARI', {
      metadata: {
        id: 'PARASHARI',
        displayName: 'Parashari Jyotish',
        description: 'Classical Vedic Astrology system including aspects, yogas, and dashas.',
        supportedFeatures: ['Aspects', 'Conjunctions', 'Dignity', 'Relationships', 'Maha Purusha Yogas', 'Raja Yogas', 'Dhana Yogas'],
        enabled: true,
        version: '1.0.0'
      },
      engine: new ParashariEngine()
    });

    this.systems.set('KP', {
      metadata: {
        id: 'KP',
        displayName: 'Krishnamurti Paddhati (KP)',
        description: 'Advanced stellar astrology based on Placidus cusps and sub-lords.',
        supportedFeatures: ['Sub Lords', 'Cuspal Interlinks', 'Significators'],
        enabled: false, 
        version: '0.1.0'
      },
      engine: new KpEngine()
    });

    
    
    this.systems.set('DASHA_INTEL', {
      metadata: { id: 'DASHA_INTEL' as any, displayName: 'Dasha Deep Intelligence', description: 'Combines current date, Dasha timeline, and chart placements.', supportedFeatures: ['Current Lords'], enabled: true, version: '1.0.0' },
      engine: new DashaIntelligenceEngine() as any
    });

    this.systems.set('TRANSIT', {
      metadata: { id: 'TRANSIT' as any, displayName: 'Transit (Gochar)', description: 'Real-time transit integration (Currently unavailable in pure D1 engine).', supportedFeatures: ['Gochar'], enabled: true, version: '1.0.0' },
      engine: new TransitEngine() as any
    });

    this.systems.set('VARGA', {
      metadata: { id: 'VARGA' as any, displayName: 'Varga (Divisional)', description: 'D9 Navamsha and D10 Dasamsha calculations.', supportedFeatures: ['D9', 'D10'], enabled: true, version: '1.0.0' },
      engine: new VargaEngine()
    });

    this.systems.set('NAKSHATRA_INTEL', {
      metadata: { id: 'NAKSHATRA_INTEL' as any, displayName: 'Nakshatra Deep Intel', description: 'Deity, Nadi, Gana, and Symbol assignments.', supportedFeatures: ['Padas', 'Nadi', 'Gana'], enabled: true, version: '1.0.0' },
      engine: new NakshatraIntelligenceEngine() as any
    });

    this.systems.set('JAIMINI', {
      metadata: {
        id: 'JAIMINI',
        displayName: 'Jaimini Sutras',
        description: 'Sign-based aspects, Chara Karakas, and specialized Dashas.',
        supportedFeatures: ['Chara Karakas', 'Rashi Drishti', 'Arudhas'],
        enabled: true, 
        version: '0.1.0'
      },
      engine: new JaiminiEngine()
    });

    this.systems.set('LAL_KITAB', {
      metadata: {
        id: 'LAL_KITAB',
        displayName: 'Lal Kitab',
        description: 'Remedial astrology based on fixed houses (Kaal Purush).',
        supportedFeatures: ['Fixed Houses', 'Remedies'],
        enabled: false,
        version: '0.1.0'
      },
      engine: new LalKitabEngine()
    });
  }

  getSystemMetadata(id: JyotishSystemId): JyotishSystemMetadata | undefined {
    return this.systems.get(id)?.metadata;
  }

  getAllSystems(): JyotishSystemMetadata[] {
    return Array.from(this.systems.values()).map(s => s.metadata);
  }

  evaluate<T>(id: JyotishSystemId, data: MasterKundliData): T | null {
    const sys = this.systems.get(id);
    if (!sys) return null;
    return sys.engine.evaluate(data) as T;
  }
}

export const globalJyotishRegistry = new JyotishRegistry();
