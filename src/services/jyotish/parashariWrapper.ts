import { analyzeChart } from './analysisLayer';
import { ChartAnalysisResult } from '../../types/analysis';
import { RuleEngine } from '../../types/systemRegistry';
import { MasterKundliData } from '../../types/kundli';

export class ParashariEngine implements RuleEngine<ChartAnalysisResult> {
  evaluate(data: MasterKundliData): ChartAnalysisResult {
    return analyzeChart(data);
  }
}
