/**
 * Verification test for Central AI Adapter
 */
import {
  extractTextSafely,
  mapErrorToNormalizedCode,
  getLocalizedAiErrorMessage,
  NormalizedAIErrorCode
} from '../services/ai/centralAiAdapter';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
  console.log(`PASS: ${msg}`);
}

console.log('=== Starting AI Adapter Verification ===\n');

// Test 1: @google/genai string getter property (v2.4.0+)
{
  const mockResponse = { text: 'Hello from modern @google/genai getter' };
  const extracted = extractTextSafely(mockResponse);
  assert(extracted === 'Hello from modern @google/genai getter', 'Should extract string from text property');
}

// Test 2: Legacy callable text() function (prevents "response.text is not a function")
{
  const mockResponse = { text: () => 'Hello from legacy text() function' };
  const extracted = extractTextSafely(mockResponse);
  assert(extracted === 'Hello from legacy text() function', 'Should safely extract from text() function without throwing');
}

// Test 3: Raw candidate parts fallback
{
  const mockResponse = {
    candidates: [
      {
        content: {
          parts: [{ text: 'Part 1 ' }, { text: 'Part 2' }]
        }
      }
    ]
  };
  const extracted = extractTextSafely(mockResponse);
  assert(extracted === 'Part 1 Part 2', 'Should extract and concatenate text from candidate parts');
}

// Test 4: Empty / malformed response returns null safely without throwing
{
  assert(extractTextSafely(null) === null, 'null response returns null');
  assert(extractTextSafely(undefined) === null, 'undefined response returns null');
  assert(extractTextSafely({}) === null, 'empty object returns null');
  assert(extractTextSafely({ text: '' }) === null, 'empty string returns null');
  assert(extractTextSafely({ text: () => '' }) === null, 'empty function result returns null');
  assert(extractTextSafely({ candidates: [] }) === null, 'empty candidates returns null');
}

// Test 5: Error mapping to NormalizedAIErrorCode
{
  const err429 = { status: 429, message: 'Resource exhausted' };
  const map429 = mapErrorToNormalizedCode(err429);
  assert(map429.code === 'AI_RATE_LIMIT' && map429.retryable === true, '429 maps to AI_RATE_LIMIT (retryable)');

  const err503 = { status: 503, message: 'Service Unavailable' };
  const map503 = mapErrorToNormalizedCode(err503);
  assert(map503.code === 'AI_PROVIDER_UNAVAILABLE' && map503.retryable === true, '503 maps to AI_PROVIDER_UNAVAILABLE (retryable)');

  const errTimeout = { name: 'TimeoutError', message: 'Request timed out' };
  const mapTimeout = mapErrorToNormalizedCode(errTimeout);
  assert(mapTimeout.code === 'AI_TIMEOUT' && mapTimeout.retryable === true, 'Timeout maps to AI_TIMEOUT (retryable)');

  const err401 = { status: 401, message: 'API key not valid' };
  const map401 = mapErrorToNormalizedCode(err401);
  assert(map401.code === 'AI_AUTH_ERROR' && map401.retryable === false, '401 maps to AI_AUTH_ERROR (not retryable)');

  const err400 = { status: 400, message: 'Bad request' };
  const map400 = mapErrorToNormalizedCode(err400);
  assert(map400.code === 'AI_INVALID_RESPONSE' && map400.retryable === false, '400 maps to AI_INVALID_RESPONSE (not retryable)');
}

// Test 6: Localized error messages
{
  const hiMsg = getLocalizedAiErrorMessage('AI_RATE_LIMIT', 'Hindi');
  const enMsg = getLocalizedAiErrorMessage('AI_RATE_LIMIT', 'English');
  assert(typeof hiMsg === 'string' && hiMsg.length > 0, 'Hindi rate limit message is present');
  assert(typeof enMsg === 'string' && enMsg.length > 0, 'English rate limit message is present');
}

console.log('\n=== All AI Adapter Verification Tests Passed Successfully! ===');
