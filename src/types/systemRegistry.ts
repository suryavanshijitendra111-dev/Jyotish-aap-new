import { MasterKundliData } from './kundli';

export type JyotishSystemId = 'PARASHARI' | 'KP' | 'JAIMINI' | 'LAL_KITAB' | 'VARGA' | 'NAKSHATRA_INTEL' | 'DASHA_INTEL' | 'TRANSIT';

export interface JyotishSystemMetadata {
  id: JyotishSystemId;
  displayName: string;
  description: string;
  supportedFeatures: string[];
  enabled: boolean;
  version: string;
}

export interface RuleEngine<T> {
  evaluate(data: MasterKundliData): T;
}
