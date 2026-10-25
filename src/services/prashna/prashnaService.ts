import { PrashnaKundliData } from '../../types/kundli';

export interface PrashnaAiResponse {
  ok: boolean;
  answer?: string;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
}

export class PrashnaService {
  /**
   * Request structured Prashna AI interpretation
   * Separated into:
   * 1. CALCULATED DATA
   * 2. TRADITIONAL PRASHNA INTERPRETATION
   * 3. AI EXPLANATION & ACTIONABLE GUIDANCE
   */
  public static async generateInterpretation(
    data: PrashnaKundliData, 
    language: 'Hindi' | 'English' = 'Hindi'
  ): Promise<PrashnaAiResponse> {
    if (!data || !data.ascendant || !data.planets) {
      return {
        ok: false,
        errorCode: 'CALCULATION_UNAVAILABLE',
        error: 'Calculation unavailable: खगोलीय गणना उपलब्ध नहीं है।'
      };
    }

    try {
      const response = await fetch('/api/prashna-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: data.context.question,
          prashnaKundliData: data,
          language
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return {
          ok: false,
          errorCode: errJson.errorCode || 'AI_ERROR',
          retryable: !!errJson.retryable,
          error: errJson.error || `AI interpretation unavailable (HTTP ${response.status})`
        };
      }

      const result = await response.json();
      return {
        ok: true,
        answer: result.answer || ''
      };
    } catch (error: any) {
      console.error('PrashnaService Error:', error);
      return {
        ok: false,
        errorCode: 'NETWORK_ERROR',
        retryable: true,
        error: error.message || 'Network error while contacting Prashna AI engine.'
      };
    }
  }

  /**
   * Request follow-up interpretation grounded strictly in the same Prashna chart
   */
  public static async askFollowUp(
    data: PrashnaKundliData,
    followUpQuestion: string,
    previousAnswer: string,
    language: 'Hindi' | 'English' = 'Hindi'
  ): Promise<PrashnaAiResponse> {
    if (!data || !data.ascendant || !data.planets) {
      return {
        ok: false,
        errorCode: 'CALCULATION_UNAVAILABLE',
        error: 'Calculation unavailable: खगोलीय गणना उपलब्ध नहीं है।'
      };
    }

    try {
      const compositeQuestion = `मूल प्रश्न: "${data.context.question}"
पूर्व उत्तर सारांश: ${previousAnswer.substring(0, 300)}...
अनुगामी प्रश्न (Follow-up Question): "${followUpQuestion}"`;

      const response = await fetch('/api/prashna-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: compositeQuestion,
          prashnaKundliData: data,
          language
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return {
          ok: false,
          errorCode: errJson.errorCode || 'AI_ERROR',
          retryable: !!errJson.retryable,
          error: errJson.error || `Follow-up AI interpretation unavailable (HTTP ${response.status})`
        };
      }

      const result = await response.json();
      return {
        ok: true,
        answer: result.answer || ''
      };
    } catch (error: any) {
      console.error('PrashnaService Follow-up Error:', error);
      return {
        ok: false,
        errorCode: 'NETWORK_ERROR',
        retryable: true,
        error: error.message || 'Network error while contacting Prashna AI engine.'
      };
    }
  }
}
