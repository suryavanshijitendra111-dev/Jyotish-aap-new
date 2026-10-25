export interface YogaCondition {
  name: string;
  passed: boolean;
}

export interface YogaResult {
  id: string;
  name: string;
  system: string;
  status: 'VERIFIED' | 'NOT_VERIFIED' | 'POTENTIAL';
  planets: string[];
  houses: number[];
  conditions: YogaCondition[];
  strength?: string;
  ruleId: string;
  explanationKey: string;
}
