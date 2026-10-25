/**
 * Central AI Response Adapter & Gemini Service Layer
 * 
 * Provides unified, type-safe response parsing, error normalization,
 * and safe text extraction matching @google/genai SDK v2.4.0+.
 */

export type NormalizedAIErrorCode =
  | 'AI_SUCCESS'
  | 'AI_EMPTY_RESPONSE'
  | 'AI_RATE_LIMIT'
  | 'AI_PROVIDER_UNAVAILABLE'
  | 'AI_TIMEOUT'
  | 'AI_NETWORK_ERROR'
  | 'AI_INVALID_RESPONSE'
  | 'AI_AUTH_ERROR'
  | 'AI_UNKNOWN_ERROR';

export interface NormalizedAIError {
  code: NormalizedAIErrorCode;
  message: string;
  retryable?: boolean;
  httpStatus?: number;
}

export interface NormalizedAIResponse {
  success: boolean;
  text: string;
  language?: string;
  provider?: string;
  model?: string;
  error?: NormalizedAIError;
}

export interface GenerateAIRequestOptions {
  prompt: string;
  systemInstruction?: string;
  history?: Array<{
    role: 'user' | 'model' | 'ai';
    parts?: Array<{ text: string }>;
    text?: string;
  }>;
  language?: string;
  temperature?: number;
  responseMimeType?: string;
  timeoutMs?: number;
  models?: string[];
  maxRetries?: number;
}

/**
 * Safely extracts text from a Gemini GenerateContentResponse object.
 *
 * In @google/genai SDK (v2.4.0+), `response.text` is a getter property (string | undefined),
 * NOT a function. Calling `response.text()` throws "TypeError: response.text is not a function".
 *
 * This extractor safely inspects:
 * 1. `typeof response.text === 'string'` (Standard @google/genai SDK property)
 * 2. `typeof response.text === 'function'` (Legacy @google/generative-ai fallback)
 * 3. `response.candidates[0].content.parts[...].text` (Raw candidate parts fallback)
 */
export function extractTextSafely(response: any): string | null {
  if (!response) return null;

  try {
    // 1. Check if response.text is a string getter (standard @google/genai SDK)
    if (typeof response.text === 'string') {
      const trimmed = response.text.trim();
      if (trimmed.length > 0) return trimmed;
    }

    // 2. Safe check if response.text is a callable function (legacy SDK compatibility)
    if (typeof response.text === 'function') {
      try {
        const fnResult = response.text();
        if (typeof fnResult === 'string' && fnResult.trim().length > 0) {
          return fnResult.trim();
        }
      } catch (_) {
        // Ignored, proceed to candidate parts fallback
      }
    }

    // 3. Fallback to candidate parts structure
    if (Array.isArray(response.candidates) && response.candidates.length > 0) {
      const firstCandidate = response.candidates[0];
      if (firstCandidate?.content?.parts && Array.isArray(firstCandidate.content.parts)) {
        const collectedText = firstCandidate.content.parts
          .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
          .filter((t: string) => t.length > 0)
          .join('');

        if (collectedText.trim().length > 0) {
          return collectedText.trim();
        }
      }
    }
  } catch (extractionErr) {
    console.error('[extractTextSafely] Unexpected error during extraction:', extractionErr);
  }

  return null;
}

/**
 * Maps arbitrary provider or network errors into a normalized error representation.
 */
export function mapErrorToNormalizedCode(err: any): {
  code: NormalizedAIErrorCode;
  message: string;
  retryable: boolean;
  status: number;
} {
  const status = Number(err?.status || err?.statusCode || (err?.response && err.response.status) || 500);
  const name = err?.name || '';
  const msg = err?.message || 'Unknown AI error';

  if (name === 'TimeoutError' || name === 'AbortError' || msg.toLowerCase().includes('timeout') || status === 504) {
    return {
      code: 'AI_TIMEOUT',
      message: 'The AI request timed out. Please try again.',
      retryable: true,
      status: 504
    };
  }

  if (status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('resource exhausted')) {
    return {
      code: 'AI_RATE_LIMIT',
      message: 'AI request limit reached. Please wait a moment before trying again.',
      retryable: true,
      status: 429
    };
  }

  if (status === 503 || status === 502 || msg.toLowerCase().includes('unavailable') || msg.toLowerCase().includes('high demand')) {
    return {
      code: 'AI_PROVIDER_UNAVAILABLE',
      message: 'AI service is temporarily unavailable. Please try again in a few moments.',
      retryable: true,
      status: 503
    };
  }

  if (status === 401 || status === 403 || msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('permission denied')) {
    return {
      code: 'AI_AUTH_ERROR',
      message: 'AI authentication error. Verify system API key configuration.',
      retryable: false,
      status: status === 401 ? 401 : 403
    };
  }

  if (status === 400 || status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('bad request')) {
    return {
      code: 'AI_INVALID_RESPONSE',
      message: 'Invalid request or model configuration.',
      retryable: false,
      status: status
    };
  }

  if (status >= 500) {
    return {
      code: 'AI_PROVIDER_UNAVAILABLE',
      message: 'AI provider encountered an internal error.',
      retryable: true,
      status
    };
  }

  return {
    code: 'AI_UNKNOWN_ERROR',
    message: msg,
    retryable: false,
    status
  };
}

/**
 * Returns a localized user-friendly message for a given NormalizedAIErrorCode.
 */
export function getLocalizedAiErrorMessage(code: NormalizedAIErrorCode, language: string = 'Hindi'): string {
  const isHindi = language.toLowerCase() === 'hindi' || language.toLowerCase() === 'hi';

  switch (code) {
    case 'AI_RATE_LIMIT':
      return isHindi
        ? 'AI सेवा पर इस समय अनुरोध अधिक हैं। कृपया कुछ क्षण प्रतीक्षा कर पुनः प्रयास करें।'
        : 'AI service rate limit reached. Please wait a moment and try again.';
    case 'AI_PROVIDER_UNAVAILABLE':
      return isHindi
        ? 'AI सेवा इस समय उपलब्ध नहीं है। कृपया थोड़ी देर बाद पुनः प्रयास करें।'
        : 'AI service is temporarily unavailable. Please try again shortly.';
    case 'AI_TIMEOUT':
      return isHindi
        ? 'AI सेवा से उत्तर प्राप्त करने में समय अधिक लगा। कृपया पुनः प्रयास करें।'
        : 'AI request timed out. Please try again.';
    case 'AI_AUTH_ERROR':
      return isHindi
        ? 'AI सेवा प्रमाणीकरण में समस्या है। कृपया व्यवस्थापक से संपर्क करें।'
        : 'AI service authorization issue. Please contact support.';
    case 'AI_EMPTY_RESPONSE':
      return isHindi
        ? 'AI द्वारा कोई उत्तर प्राप्त नहीं हुआ। कृपया प्रश्न पुनः पूछें।'
        : 'Received an empty response from AI. Please try rephrasing.';
    case 'AI_NETWORK_ERROR':
      return isHindi
        ? 'नेटवर्क संपर्क में समस्या हुई। कृपया इंटरनेट जांचें।'
        : 'Network communication error. Please check your connection.';
    default:
      return isHindi
        ? 'AI विश्लेषण प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।'
        : 'Unable to retrieve AI analysis. Please try again.';
  }
}

/**
 * Executes a Gemini generateContent request with multi-model fallback,
 * bounded retries, explicit timeout, and safe text extraction.
 */
export async function executeGeminiRequest(
  aiClient: any,
  options: GenerateAIRequestOptions
): Promise<NormalizedAIResponse> {
  const models = options.models || ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];
  const maxRetries = Math.min(options.maxRetries ?? 2, 2); // Bounded at maximum 2 retries
  const timeoutMs = options.timeoutMs || 22000;
  const language = options.language || 'Hindi';

  // Format contents array
  const formattedContents: any[] = [];

  if (options.history && options.history.length > 0) {
    for (const h of options.history) {
      const role = (h.role === 'ai' || h.role === 'model') ? 'model' : 'user';
      const text = h.text || (h.parts?.[0]?.text) || '';
      if (text.trim()) {
        formattedContents.push({ role, parts: [{ text }] });
      }
    }
  }

  formattedContents.push({
    role: 'user',
    parts: [{ text: options.prompt }]
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  let lastError: any = null;

  for (const model of models) {
    let attempt = 0;

    while (attempt <= maxRetries) {
      let timeoutId: any = null;

      try {
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            const err = new Error(`AI request timed out after ${timeoutMs / 1000}s`);
            err.name = 'TimeoutError';
            reject(err);
          }, timeoutMs);
        });

        const config: any = {};
        
        // Strict Language & Natural Tone Directives
        const languageDirectives = `
CRITICAL LANGUAGE & NATURAL FLUENCY DIRECTIVES:
- Target Language: ${language}
- Write 100% in authentic, natural, dignified ${language}.
- STRICT PROHIBITION: NEVER mix English words into Hindi/vernacular sentences (no 'Hinglish' like "aapka career", "business me success", "dasha timing"). Express thoughts completely in natural ${language}.
- Classical Vedic terminology (e.g. लग्न, नक्षत्र, विंशोत्तरी दशा, गोचर, राजयोग) must be used with reverence in their authentic forms.
- Astronomical figures (degrees like 23.45°, dates like 24/06/1986, times like 06:20 AM, house numbers) must remain exact and untouched.`;

        const finalSystemInstruction = options.systemInstruction 
          ? `${options.systemInstruction}\n\n${languageDirectives}`
          : languageDirectives;

        config.systemInstruction = finalSystemInstruction;

        if (options.temperature != null) {
          config.temperature = options.temperature;
        }
        if (options.responseMimeType) {
          config.responseMimeType = options.responseMimeType;
        }

        const apiPromise = aiClient.models.generateContent({
          model,
          contents: formattedContents,
          config
        });

        const rawResponse: any = await Promise.race([apiPromise, timeoutPromise]);
        clearTimeout(timeoutId);

        const extractedText = extractTextSafely(rawResponse);

        if (extractedText && extractedText.length > 0) {
          return {
            success: true,
            text: extractedText,
            language,
            provider: 'google-gemini',
            model
          };
        } else {
          throw new Error('AI provider returned an empty or unparseable response');
        }
      } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId);
        lastError = err;

        const errorInfo = mapErrorToNormalizedCode(err);

        // Bounded retry for retryable errors only
        if (errorInfo.retryable && attempt < maxRetries) {
          attempt++;
          const backoff = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 300, 4000);
          await delay(backoff);
          continue;
        }

        // Break to next model on non-retryable or if attempts exhausted
        break;
      }
    }
  }

  const normalizedErr = mapErrorToNormalizedCode(lastError);

  return {
    success: false,
    text: '',
    language,
    provider: 'google-gemini',
    error: {
      code: normalizedErr.code,
      message: normalizedErr.message,
      retryable: normalizedErr.retryable,
      httpStatus: normalizedErr.status
    }
  };
}
