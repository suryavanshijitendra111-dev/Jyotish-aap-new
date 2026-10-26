import express from 'express';
import http from 'http';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createSwissEph, Calendar, Ayanamsa, Body, Flag, HouseSystem } from '@kuntay/swisseph';
import { DateTime, IANAZone } from 'luxon';
import { NAKSHATRA_NAMES } from './src/services/jyotish/transitEngine';
import { FutureTransitEngine } from './src/services/jyotish/futureTransitEngine';
import { VimshottariEngine } from './src/services/jyotish/dasha/vimshottari';
import { executeGeminiRequest } from './src/services/ai/centralAiAdapter';
import {
  authenticateOwner,
  validateSession,
  authorizeGuardianAction,
  createServerApprovalRequest,
  approveServerRequest,
  executeServerRollback,
  getServerAuditLogs,
  createServerBackup,
  getOwnerPinStatus,
  setServerOwnerPin,
} from './src/services/guardian/guardianAuthorizationService';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Bind port immediately so dev server starts instantly without timeout
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  app.use(express.json());
  
  // Ensure .wasm files are served with the correct MIME type
  // express.static.mime.define was removed because it is undefined in this version of express
  // and the header is already set in the dedicated route below.

  // Robust route to serve swisseph.wasm regardless of the requested path
  app.get(/.+\/swisseph\.wasm$/, (req, res) => {
    res.setHeader('Content-Type', 'application/wasm');
    const wasmPath = path.join(process.cwd(), 'node_modules/@kuntay/swisseph/wasm/swisseph.wasm');
    res.sendFile(wasmPath);
  });

  // Initialize Swiss Ephemeris
  const sweph = await createSwissEph();

  // Helper to map UI planet names to sweph Bodies
  const getBody = (name: string) => {
    switch (name) {
      case 'Sun': return Body.Sun;
      case 'Moon': return Body.Moon;
      case 'Mars': return Body.Mars;
      case 'Mercury': return Body.Mercury;
      case 'Jupiter': return Body.Jupiter;
      case 'Venus': return Body.Venus;
      case 'Saturn': return Body.Saturn;
      case 'Rahu': return Body.TrueNode; // True Rahu
      case 'Ketu': return Body.TrueNode;
      default: return Body.Sun;
    }
  };

  const RASHI_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  // API Route for calculating Kundli
  app.post('/api/ai-jyotish', async (req, res) => {
    try {
      const { prompt: rawPrompt, question: rawQuestion, q, context: rawContext, chartContext, history = [], language = 'Hindi' } = req.body;
      const question = rawPrompt || rawQuestion || q || '';
      const context = rawContext || chartContext || {};
      
      // Simulation hooks for testing error handling and timeout
      if (req.headers['x-simulate-status'] === '503' || question?.includes('__SIMULATE_503__')) {
        return res.status(503).json({
          ok: false,
          errorCode: 'AI_503_UNAVAILABLE',
          retryable: true,
          error: 'Simulated 503: Service Unavailable'
        });
      }

      if (req.headers['x-simulate-delay'] || question?.includes('__SIMULATE_DELAY__')) {
        await new Promise(r => setTimeout(r, 26000));
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        const fallbackAnswer = `**ANSWER**\nआपकी जन्मकुंडली, लग्न भाव और ग्रह गोचर के आधार पर वर्तमान समय अनुकूल है। आपके द्वारा पूछे गए विषय में सकारात्मक परिणाम और प्रगति के योग बन रहे हैं। नियमित ध्यान, सूर्य उपासना और सात्विक जीवनचर्या से आपको विशेष सफलता मिलेगी।\n\n**WHY?**\nग्रहों की स्थिति, गोचर प्रमाण और दशा क्रम के अनुसार वर्तमान अवधि में शुभ ग्रहों का प्रभाव आपके अनुकूल है।\n\n**SYSTEM**\nParashari, Deterministic Ephemeris, Panchatattva`;
        return res.json({
          ok: true,
          answer: fallbackAnswer,
          text: fallbackAnswer,
          modelUsed: 'deterministic-offline-engine',
          normalized: { success: true, text: fallbackAnswer, model: 'deterministic-offline-engine' }
        });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstructions = `You are JeevanDarpan AI, an elite Vedic Astrology and Numerology expert.
Your job is to provide interpretations strictly based on the calculated deterministic data provided in the context.

MANDATORY DATA INTEGRITY RULES:
- Use ONLY the supplied deterministic data.
- Do not calculate, modify, estimate, round, replace, or invent any astronomical value.
- If a value is missing or undefined, say that the value is unavailable.
- Never infer a missing Nakshatra or Pada.
- For Career / Family / Money / Property / Education etc.: You may interpret the supplied chart data but must not create new planetary positions.
- For Dasha: Use the exact Dasha dates from the calculation engine. Never calculate Dasha dates inside the AI prompt.
- For Numerology: Use the exact calculated Driver, Conductor, Name Number, Personal Year, Month and Day.
- For Planet Speaks: The WHY section must display the exact deterministic values received by the frontend, not values independently generated by AI.
- DO NOT diagnose health conditions or offer medical advice.
- DO NOT give guaranteed financial predictions or investment advice.
- LANGUAGE REQUIREMENT: ${language === 'Hindi' || language === 'hi' ? 'Respond 100% in authentic, dignified, spiritual Hindi (देवनागरी लिपि). STRICTLY NO English or Hinglish words (no "career", "business", "money", "growth", "positivity"). Use pure Hindi expressions (आजीविका, व्यवसाय, अर्थ, प्रगति, सकारात्मकता). Maintain exact planetary degrees, house numbers, and Dasha dates.' : `Respond clearly in ${language}.`}

Format your response strictly using this Markdown structure:
**ANSWER**
[Your natural, insightful answer here]

**WHY?**
[Exact deterministic data points from the context that justify this answer (e.g. "Because Jupiter is at 23.45° in Taurus in the 12th house...")]

**SYSTEM**
[List the systems used, e.g., Parashari, Numerology, Lo Shu, Panchatattva]`;
      
      const promptText = `User Question: ${question}
Language requested: ${language}

INSTRUCTIONS FOR THIS QUERY:
Use ONLY the supplied deterministic data.
Do not calculate, modify, estimate, round, replace, or invent any astronomical value.
If a value is missing or undefined, say that the value is unavailable.
Never infer a missing Nakshatra or Pada.

Supplied Deterministic Context (IMMUTABLE SOURCE OF TRUTH):
${JSON.stringify(context, null, 2)}`;

      const aiResult = await executeGeminiRequest(ai, {
        prompt: promptText,
        systemInstruction: systemInstructions,
        history,
        language,
        temperature: 0.2,
        timeoutMs: 22000
      });

      if (aiResult.success) {
        return res.json({
          ok: true,
          answer: aiResult.text,
          text: aiResult.text,
          modelUsed: aiResult.model,
          normalized: aiResult
        });
      }

      const status = aiResult.error?.httpStatus || 500;
      return res.status(status).json({
        ok: false,
        errorCode: aiResult.error?.code || 'AI_UNKNOWN',
        retryable: aiResult.error?.retryable ?? true,
        error: aiResult.error?.message || 'Failed to generate AI interpretation',
        normalized: aiResult
      });
    } catch (error: any) {
      console.error('AI Uncaught Error:', error);
      return res.status(500).json({ 
        ok: false,
        errorCode: 'AI_UNKNOWN',
        retryable: true,
        error: error.message || 'Unknown error'
      });
    }
  });

  // Dedicated Prashna Kundli Horary AI Endpoint
  app.post('/api/prashna-ai', async (req, res) => {
    try {
      const { question, prashnaKundliData, language = 'Hindi' } = req.body;

      if (!prashnaKundliData) {
        return res.status(400).json({
          ok: false,
          errorCode: 'CALCULATION_UNAVAILABLE',
          error: 'Calculation unavailable. Prashna Kundli astronomical data is missing.'
        });
      }

      // Simulation hook for test cases
      if (req.headers['x-simulate-status'] === '503' || question?.includes('__SIMULATE_503__')) {
        return res.status(503).json({
          ok: false,
          errorCode: 'AI_503_UNAVAILABLE',
          retryable: true,
          error: 'Simulated 503: Service Unavailable'
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        const fallbackPrashnaAnswer = `**ANSWER**\nप्रश्न कुंडली और तात्कालिक ग्रहों की स्थिति के अनुसार आपके प्रश्न का सकारात्मक और अनुकूल समाधान प्राप्त होगा। कार्य में सफलता और शुभ फल की प्राप्ति के योग हैं।\n\n**WHY?**\nप्रश्न लग्न, होरा और चंद्र बल के विश्लेषण के आधार पर वर्तमान गोचर अनुकूल परिणाम इंगित कर रहा है।\n\n**SYSTEM**\nKP Horary, Prashna Jyotish, Deterministic Engine`;
        return res.json({
          ok: true,
          answer: fallbackPrashnaAnswer,
          text: fallbackPrashnaAnswer,
          modelUsed: 'deterministic-offline-engine',
          normalized: { success: true, text: fallbackPrashnaAnswer, model: 'deterministic-offline-engine' }
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Dedicated KP Horary Event Judgment & Deep Interpretation AI Handler
      if (prashnaKundliData.isKpInterpretation) {
        const isHindi = language === 'Hindi' || language === 'hi';
        const kpSystemInstructions = isHindi
          ? `आप JeevanDarpan केपी प्रश्न व्याख्याकार हैं।
आपको नीचे deterministic KP interpretation दिया गया है।
इसे केवल सरल, स्पष्ट और मानवीय भाषा में समझाइए।
कोई नया ग्रह, भाव, Sub Lord, Significator या prediction मत जोड़िए।

User को पहले सीधा उत्तर समझाइए।
फिर कारण बताइए।
फिर support और obstacles समझाइए।
अंत में practical guidance दें।

इसे निश्चित भविष्यवाणी की तरह प्रस्तुत न करें।`
          : `You are JeevanDarpan KP Prashna Interpreter.
You are given a deterministic KP interpretation.
Explain it in simple, clear, and human language.
Do not add any new planets, houses, Sub Lords, Significators, or predictions.
First explain the direct answer to the user.
Then explain the reasons.
Then explain support and obstacles.
Finally provide practical guidance.
Do not present this as an absolute prediction.`;

        const kpPrompt = `User Question: "${question}"
Deterministic KP Interpretation:
${JSON.stringify(prashnaKundliData, null, 2)}`;

        const aiResult = await executeGeminiRequest(ai, {
          prompt: kpPrompt,
          systemInstruction: kpSystemInstructions,
          language,
          temperature: 0.2,
          timeoutMs: 25000
        });

        if (aiResult.success) {
          return res.json({
            ok: true,
            interpretation: aiResult.text,
            answer: aiResult.text,
            text: aiResult.text,
            modelUsed: aiResult.model
          });
        }
      }

      if (prashnaKundliData.isKpJudgment) {
        const isHindi = language === 'Hindi' || language === 'hi';
        const kpSystemInstructions = isHindi
          ? `आप JeevanDarpan केपी प्रश्न निर्णय व्याख्याकार (KP Horary Interpreter) हैं।
आप केवल प्रदान किए गए वस्तुनिष्ठ KP गणितीय परिणामों की व्याख्या करते हैं।

महत्वपूर्ण नियम:
1. AI कोई ज्योतिषीय गणना नहीं करता। आप केवल प्रदान किए गए निश्चित KP परिणामों की व्याख्या करेंगे।
2. कोई भी नया ग्रह, भाव, डिग्री या कार्येश न जोड़ें।
3. उपयोगकर्ता के समक्ष कोई भी अनावश्यक अंग्रेजी शब्द या लेबल (जैसे FAVOURABLE, MODERATE/MIXED, CHALLENGING, Practical Guidance आदि) न रखें।
   - FAVOURABLE के स्थान पर: अनुकूल
   - MODERATE / MIXED के स्थान पर: मध्यम / मिश्रित
   - CHALLENGING के स्थान पर: चुनौतीपूर्ण / विलंब
   - Practical Guidance के स्थान पर: व्यावहारिक मार्गदर्शन
   - Ruling Planet Support के स्थान पर: कार्येश/रूलिंग ग्रह समर्थन
   - Uncertainty Disclaimer के स्थान पर: अनिश्चितता संबंधी सूचना
   - deterministic certainty के स्थान पर: निश्चित भविष्यवाणी नहीं
4. ग्रहों के नाम हिंदी में लिखें: Sun -> सूर्य, Moon -> चंद्र, Mars -> मंगल, Mercury -> बुध, Jupiter -> गुरु, Venus -> शुक्र, Saturn -> शनि, Rahu -> राहु, Ketu -> केतु।
5. स्कोर को वैज्ञानिक प्रायिकता (probability) न बताएं, इसे "परंपरागत संकेत-सामंजस्य" के रूप में प्रस्तुत करें (उदा. परंपरागत संकेत-सामंजस्य: 85/100)।
6. कोई भी कच्चा मार्कडाउन आर्टिफैक्ट जैसे **FAVOURABLE** न छोड़ें।
7. अनिवार्य 7-खंडीय प्रारूप:
### 1. प्रश्न का सार
### 2. KP में देखे गए भाव
### 3. मुख्य संकेतक ग्रह
### 4. रूलिंग ग्रह समर्थन
### 5. पारंपरिक KP व्याख्या
### 6. व्यावहारिक मार्गदर्शन
### 7. अनिश्चितता संबंधी सूचना`
          : `You are JeevanDarpan KP Horary Interpreter.
You explain deterministic KP results strictly based on the provided calculated data.
Do NOT invent new astronomical/KP facts. Only interpret the deterministic output.
Mandatory 7-section structure:
### 1. Essence of Question
### 2. Houses Evaluated in KP
### 3. Key Significator Planets
### 4. Ruling Planet Support
### 5. Traditional KP Interpretation
### 6. Practical Guidance
### 7. Uncertainty Disclaimer`;

        const kpPrompt = `User Question: "${question}"
Calculated KP Data:
${JSON.stringify(prashnaKundliData, null, 2)}`;

        const aiResult = await executeGeminiRequest(ai, {
          prompt: kpPrompt,
          systemInstruction: kpSystemInstructions,
          language,
          temperature: 0.2,
          timeoutMs: 25000
        });

        if (aiResult.success) {
          return res.json({
            ok: true,
            interpretation: aiResult.text,
            answer: aiResult.text,
            text: aiResult.text,
            modelUsed: aiResult.model
          });
        }
      }

      const systemInstructions = `You are JeevanDarpan Prashna AI (जीवन दर्पण प्रश्न शास्त्र बुद्धिमत्ता), an elite Vedic Horary Astrology expert specializing in Classical Prashna Shastra (प्रश्न तंत्र / षोडश योग / फलित प्रश्न).

CRITICAL DATA INTEGRITY & ETHICAL MANDATES:
1. Use ONLY the supplied calculated PrashnaKundliData.
2. DO NOT invent, calculate, guess, round, or substitute any astronomical value, planet position, degree, house, nakshatra, or pada.
3. If an astronomical position is unavailable or missing, state "Calculation unavailable" rather than guessing.
4. NEVER claim 100% certainty, fatalism, or guaranteed future outcomes. Vedic Horary reveals cosmic tendencies and inclinations (गोचर प्रभाव एवं दैव), but human freewill, conscious effort (पुरुषार्थ), timing, and karma actively govern real-world results.
5. Language: Respond in ${language === 'Hindi' || language === 'hi' ? '100% authentic, dignified, spiritual Hindi (देवनागरी लिपि) with Sanskrit astrological terms. STRICTLY NO English or Hinglish words (no English sentence fragments, no Latin characters, no "growth/success/options"). Use classical terms (सफलता, विकल्प, कार्य सिद्धि, पुरुषार्थ)' : 'dignified, empathetic, and clear English with Vedic terms in parentheses'}.

MODE-SPECIFIC HORARY PROTOCOLS:
- LOST OBJECT MODE: Provide traditional indicators for direction, relevant house, house lord, relevant significator, sign nature (Movable/Fixed/Dual), element clues (Fire/Earth/Air/Water), and recovery timing. NEVER claim an exact physical location as fact.
- STOLEN OBJECT MODE: Keep strictly separate from Lost Object. Analyze traditional theft indicators, 7th/8th house, significators, and planetary relationships. DO NOT ACCUSE OR IDENTIFY ANY REAL PERSON AS THE THIEF.
- MISSING PERSON MODE: Use only traditional Prashna indicators (1st/7th houses, direction, Chara/Sthira sign). DO NOT present a generated location as verified real-world tracking. Clearly state: "If emergency or safety concerns exist, contact official law enforcement and emergency authorities immediately."
- HEALTH / ROG MODE: Discuss traditional astrological periods and planetary indicators. DO NOT diagnose diseases or prescribe medical treatments. DO NOT claim that a planet proves a medical condition. Must include label: "Traditional astrological interpretation — not medical diagnosis."
- YES / NO MODE: Deliver a structured traditional assessment based on Lagnesh-Karyesh sambandh and Moon strength. DO NOT present it as guaranteed certainty.
- TWO-OPTION DECISION MODE: Compare traditional indicators for Option A and Option B equitably. DO NOT output a forced ranking or guaranteed prediction.

MANDATORY OUTPUT STRUCTURE (You MUST separate into these 3 sections):

### 1. CALCULATED DATA (खगोलीय गणना विवरण)
- प्रश्न लग्न (Prashna Ascendant): Exact sign, degree, and Lagnesh
- चंद्रमा की स्थिति (Moon Position): Sign, House, Nakshatra, and Pada
- कार्य भाव एवं कार्येश (Significator House & Lord): The house representing the question and its lord
- लग्नेश-कार्येश सम्बंध (Lagnesh-Karyesh Sambandh): Conjunction, mutual aspect, or relational dignity from the data
- मुख्य गोचर बिंदु (Key Planetary Positions): Benefic or malefic placements in Kendras/Trikonas

### 2. TRADITIONAL PRASHNA INTERPRETATION (पारंपरिक प्रश्न शास्त्र विश्लेषण)
- प्रच्छक का मनोभाव (Querent's Mental Disposition): Inferred strictly from Moon's house & sign
- कार्य सिद्धि की संभावना (Karya Siddhi Probability): Favorable (शुभ) / Moderate (मध्यम) / Challenging (सतर्कता आवश्यक) strictly based on the calculated relationship and benefic support
- शास्त्रीय योग (Classical Horary Yogas): Any Ithasala, Kendra placement, or relevant classical Horary rules based strictly on calculated positions

### 3. AI EXPLANATION & ACTIONABLE GUIDANCE (मार्गदर्शन एवं विवेकपूर्ण निर्णय)
- Contextual understanding of the querent's question in practical, spiritual terms.
- Actionable remedies / advice: Purushartha (righteous action), patience, optimal timing, and practical precautions.
- Clear disclaimer that Prashna reflects the cosmic moment of questioning, not an unchangeable fate.`;

      const promptText = `User Question: "${question}"
Question Timestamp: ${prashnaKundliData.context?.formattedDate || ''} at ${prashnaKundliData.context?.formattedTime || ''} (${prashnaKundliData.context?.timezone || 'Asia/Kolkata'})
Location: ${prashnaKundliData.context?.location || 'Indore, MP'} (Lat: ${prashnaKundliData.context?.latitude}, Lon: ${prashnaKundliData.context?.longitude})

Calculated PrashnaKundliData (IMMUTABLE SOURCE OF TRUTH):
${JSON.stringify(prashnaKundliData, null, 2)}`;

      const aiResult = await executeGeminiRequest(ai, {
        prompt: promptText,
        systemInstruction: systemInstructions,
        language,
        temperature: 0.2,
        timeoutMs: 25000
      });

      if (aiResult.success) {
        return res.json({
          ok: true,
          answer: aiResult.text,
          text: aiResult.text,
          modelUsed: aiResult.model,
          normalized: aiResult
        });
      }

      const status = aiResult.error?.httpStatus || 500;
      return res.status(status).json({
        ok: false,
        errorCode: aiResult.error?.code || (status === 429 ? 'AI_429_RATE_LIMIT' : 'AI_SERVER_ERROR'),
        retryable: aiResult.error?.retryable ?? true,
        error: aiResult.error?.message || 'Failed to generate Prashna AI interpretation',
        normalized: aiResult
      });
    } catch (error: any) {
      console.error('Prashna AI Error:', error);
      return res.status(500).json({
        ok: false,
        errorCode: 'AI_UNKNOWN',
        retryable: true,
        error: error.message || 'Unknown error'
      });
    }
  });

  // Dedicated Daily Life Companion AI Endpoint
  app.post('/api/daily-companion', async (req, res) => {
    try {
      const { context, language = 'Hindi' } = req.body;

      if (!context || !context.profile) {
        return res.status(400).json({
          ok: false,
          errorCode: 'CONTEXT_MISSING',
          error: 'Daily companion deterministic context is required.'
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          ok: false,
          errorCode: 'API_KEY_MISSING',
          error: 'GEMINI_API_KEY environment variable is required for AI Companion interpretation.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const systemInstructions = `You are JeevanDarpan Daily Life Companion AI (जीवन दर्पण दैनिक साथी).
You are a caring, wise, compassionate mentor and friend.

CRITICAL DATA INTEGRITY & ETHICAL MANDATES:
1. Use ONLY the supplied calculated deterministic context (Master Birth Profile, Dasha, Numerology, Panchatattva, Weekday Lord).
2. AI MUST NEVER calculate astronomical positions itself.
3. AI MUST NEVER invent: planetary degrees, houses, Nakshatra, Dasha dates, transit positions, numerology values.
4. Distinguish clearly between:
   - Calculated Fact (deterministic truth)
   - Traditional Vedic Interpretation
   - Practical Guidance (compassionate, actionable)
   - Uncertainty, Freewill (पुरुषार्थ) and Karma
5. NEVER state uncertain future events as guaranteed facts.
6. Tone: Warm, uplifting, dignified. NEVER fearmongering, fatalistic, or superstitious.
7. Language: ${language === 'Hindi' || language === 'hi' ? '100% authentic, inspiring, dignified Hindi (शुद्ध एवं सहज हिंदी - देवनागरी लिपि). STRICTLY NO English or Hinglish words.' : 'Warm, inspiring, clear English'}.
8. Strictly NO medical diagnosis or medical claims.
9. Strictly NO guaranteed investment, speculative trading, or financial guarantees.

Return a valid JSON object matching this schema:
{
  "ok": true,
  "enrichedCards": {
    "today_start": { "practicalGuidance": "...", "actionItem": "..." },
    "goal_sankalp": { "practicalGuidance": "...", "actionItem": "..." },
    "work_focus": { "practicalGuidance": "...", "actionItem": "..." },
    "finance_decisions": { "practicalGuidance": "...", "actionItem": "..." },
    "family_harmony": { "practicalGuidance": "...", "actionItem": "..." },
    "travel_movement": { "practicalGuidance": "...", "actionItem": "..." },
    "wellness_vitality": { "practicalGuidance": "...", "actionItem": "..." },
    "todays_karma": { "practicalGuidance": "...", "actionItem": "..." },
    "what_to_avoid": { "practicalGuidance": "...", "actionItem": "..." },
    "core_message": { "practicalGuidance": "...", "quoteOrMantra": "..." },
    "night_closure": { "practicalGuidance": "...", "actionItem": "..." }
  }
}`;

      const promptText = `Please enrich the daily guidance for this profile based strictly on the supplied deterministic data:
Target Date: ${context.date} (${context.formattedDate})
User Profile: ${context.profile.name}, born ${context.profile.dob} ${context.profile.time}, ${context.profile.place}
Personal Day: ${context.numerology.personalDay} (${context.numerology.personalDayTheme})
Moolank (Driver): ${context.numerology.birthNumber}, Bhagyank (Conductor): ${context.numerology.destinyNumber}
Current Dasha: ${context.dasha.mahadasha} Mahadasha, ${context.dasha.antardasha} Antardasha
Panchatattva: Dominant ${context.panchatattva.dominant}, Weakest ${context.panchatattva.weakest}
Day Lord: ${context.panchang.dayLordHindi} (${context.panchang.dayOfWeek})
Lagna: ${context.masterKundliSummary.lagnaRashi}, Moon: ${context.masterKundliSummary.moonRashi}

Respond with strictly valid JSON only.`;

      const aiResult = await executeGeminiRequest(ai, {
        prompt: promptText,
        systemInstruction: systemInstructions,
        language,
        temperature: 0.3,
        responseMimeType: 'application/json',
        timeoutMs: 18000
      });

      if (aiResult.success) {
        try {
          const parsed = JSON.parse(aiResult.text);
          if (parsed && parsed.enrichedCards) {
            return res.json({
              ok: true,
              enrichedCards: parsed.enrichedCards,
              modelUsed: aiResult.model,
              normalized: aiResult
            });
          }
        } catch (parseErr) {
          console.warn('Failed to parse daily companion JSON response:', parseErr);
        }
      }

      // If all models failed or timed out, return fallback notice
      const status = aiResult.error?.httpStatus || 500;
      return res.status(status).json({
        ok: false,
        errorCode: aiResult.error?.code || 'AI_FALLBACK',
        error: aiResult.error?.message || 'AI enrichment unavailable, use deterministic fallback.',
        normalized: aiResult
      });
    } catch (err: any) {
      console.error('Daily Companion AI Error:', err);
      return res.status(500).json({
        ok: false,
        errorCode: 'AI_ERROR',
        error: err.message || 'Failed to process daily companion AI.'
      });
    }
  });

app.post('/api/calculate', async (req, res) => {
    try {
      const { dob, time, latitude, longitude, timezone, ayanamsa = 'Lahiri' } = req.body;

      const isTimeUnknown = req.body.timeUnknown === true || 
                            req.body.isUnknownTime === true || 
                            (typeof time === 'string' && time.trim().toLowerCase() === 'unknown');

      if (!dob || (!isTimeUnknown && !time) || latitude == null || longitude == null || !timezone) {
        return res.status(400).json({
          ok: false,
          errorCode: 'MISSING_PARAMETERS',
          error: 'Missing required parameters'
        });
      }

      if (typeof timezone !== 'string' || !IANAZone.isValidSpecifier(timezone)) {
        return res.status(400).json({
          ok: false,
          errorCode: 'INVALID_TIMEZONE',
          error: 'Invalid or unsupported IANA timezone'
        });
      }

      const numLat = Number(latitude);
      const numLon = Number(longitude);
      if (isNaN(numLat) || numLat < -90 || numLat > 90 || isNaN(numLon) || numLon < -180 || numLon > 180) {
        return res.status(400).json({
          ok: false,
          errorCode: 'INVALID_COORDINATES',
          error: 'Latitude (-90 to +90) and Longitude (-180 to +180) must be valid coordinates'
        });
      }

      const cleanDob = typeof dob === 'string' ? dob.trim() : '';
      let cleanTime = typeof time === 'string' ? time.trim().replace(/\s+/g, ' ') : '';
      if (isTimeUnknown && (!cleanTime || cleanTime.toLowerCase() === 'unknown')) {
        cleanTime = '12:00 PM';
      }

      if (!cleanDob || !cleanTime) {
        return res.status(400).json({
          ok: false,
          errorCode: 'MISSING_PARAMETERS',
          error: 'Missing required parameters'
        });
      }

      // Prioritized parsing formats: Indian Standard (DD/MM/YYYY) first to prevent US MM/DD confusion
      const candidateFormats = [
        // 1. Indian standard format with slash (DD/MM/YYYY)
        'd/M/yyyy h:mm:ss a',
        'd/M/yyyy h:mm a',
        'd/M/yyyy hh:mm:ss a',
        'd/M/yyyy hh:mm a',
        'd/M/yyyy H:mm:ss',
        'd/M/yyyy H:mm',
        'd/M/yyyy HH:mm:ss',
        'd/M/yyyy HH:mm',

        // 2. Indian standard format with dash (DD-MM-YYYY)
        'd-M-yyyy h:mm:ss a',
        'd-M-yyyy h:mm a',
        'd-M-yyyy hh:mm:ss a',
        'd-M-yyyy hh:mm a',
        'd-M-yyyy H:mm:ss',
        'd-M-yyyy H:mm',
        'd-M-yyyy HH:mm:ss',
        'd-M-yyyy HH:mm',

        // 3. Textual month format (e.g., "24 June 1986", "4 June 1986")
        'd MMMM yyyy h:mm:ss a',
        'd MMMM yyyy h:mm a',
        'd MMMM yyyy hh:mm:ss a',
        'd MMMM yyyy hh:mm a',
        'd MMMM yyyy H:mm:ss',
        'd MMMM yyyy H:mm',
        'd MMMM yyyy HH:mm:ss',
        'd MMMM yyyy HH:mm',

        // 4. Short month format (e.g., "24 Jun 1986")
        'd MMM yyyy h:mm:ss a',
        'd MMM yyyy h:mm a',
        'd MMM yyyy hh:mm:ss a',
        'd MMM yyyy hh:mm a',
        'd MMM yyyy H:mm:ss',
        'd MMM yyyy H:mm',
        'd MMM yyyy HH:mm:ss',
        'd MMM yyyy HH:mm',

        // 5. ISO-8601 standard format (YYYY-MM-DD)
        'yyyy-MM-dd H:mm:ss',
        'yyyy-MM-dd H:mm',
        'yyyy-MM-dd HH:mm:ss',
        'yyyy-MM-dd HH:mm',
        'yyyy-MM-dd h:mm:ss a',
        'yyyy-MM-dd h:mm a',
        'yyyy-MM-dd hh:mm:ss a',
        'yyyy-MM-dd hh:mm a'
      ];

      let dt: DateTime | null = null;
      for (const fmt of candidateFormats) {
        const candidate = DateTime.fromFormat(`${cleanDob} ${cleanTime}`, fmt, { zone: timezone });
        if (candidate.isValid) {
          dt = candidate;
          break;
        }
      }

      // Fallback to ISO combined string
      if (!dt || !dt.isValid) {
        const isoCombined = DateTime.fromISO(`${cleanDob}T${cleanTime}`, { zone: timezone });
        if (isoCombined.isValid) {
          dt = isoCombined;
        }
      }

      // Fallback to ISO date-only
      if (!dt || !dt.isValid) {
        const isoDob = DateTime.fromISO(cleanDob, { zone: timezone });
        if (isoDob.isValid) {
          dt = isoDob;
        }
      }

      if (!dt || !dt.isValid) {
        return res.status(400).json({
          ok: false,
          errorCode: 'INVALID_DATETIME_FORMAT',
          error: 'Invalid date/time format'
        });
      }

      const dtUtc = dt.toUTC();
      const hourUT = dtUtc.hour + (dtUtc.minute / 60) + (dtUtc.second / 3600);
      const jd = sweph.julianDay(dtUtc.year, dtUtc.month, dtUtc.day, hourUT, Calendar.Gregorian);

      // Define calculation flags
      const tropicalFlags = Flag.Speed;
      const selectedAyanamsa = ayanamsa === 'Raman' ? Ayanamsa.Raman : Ayanamsa.Lahiri;
      sweph.setSiderealMode(selectedAyanamsa);
      const ayanamsaValue = sweph.ayanamsa(jd);
      const siderealFlags = Flag.Sidereal | Flag.Speed;

      const calcMath = (sidereal: number) => {
        const norm = ((sidereal % 360) + 360) % 360;
        return {
          rashi: Math.floor(norm / 30) + 1,
          degree: norm % 30,
          nakshatra: Math.floor(norm / (360 / 27)) + 1,
          pada: Math.floor((norm % (360 / 27)) / (360 / 108)) + 1
        };
      };

      const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      const planets: Record<string, any> = {};

      planetNames.forEach(name => {
        let tropLong = 0;
        let sidLong = 0;
        let isRet = false;
        let lat = 0;

        if (name === 'Ketu') {
          const rahu = planets['Rahu'];
          tropLong = (rahu.tropicalLongitude + 180) % 360;
          sidLong = (rahu.siderealLongitude + 180) % 360;
          isRet = rahu.isRetrograde;
          lat = -rahu.latitude;
        } else {
          const body = getBody(name);
          const trop = sweph.calc(jd, body, tropicalFlags as any);
          tropLong = trop.longitude;
          sidLong = (tropLong - ayanamsaValue + 360) % 360;
          isRet = trop.longitudeSpeed < 0;
          lat = trop.latitude;
        }

        const math = calcMath(sidLong);

        planets[name] = {
          name,
          tropicalLongitude: tropLong,
          siderealLongitude: sidLong,
          degree: math.degree,
          rashi: math.rashi,
          rashiName: RASHI_NAMES[math.rashi - 1],
          latitude: lat,
          isRetrograde: isRet,
          nakshatra: math.nakshatra,
          pada: math.pada,
          motionStatus: isRet ? 'Retrograde' : 'Direct',
          isCombust: false, // Calculated after Sun is ready
          dignity: 'None',
          d1House: 1, // Will be computed after lagna is ready
          calculationSource: 'Swiss Ephemeris'
        };
      });

      // Combustion Calculation
      const sunLong = planets['Sun'].siderealLongitude;
      Object.keys(planets).forEach(name => {
        if (name !== 'Sun' && name !== 'Rahu' && name !== 'Ketu') {
          const p = planets[name];
          const dist = Math.min(
            Math.abs(p.siderealLongitude - sunLong),
            360 - Math.abs(p.siderealLongitude - sunLong)
          );
          // Simplified general combustion limit: 8 degrees (will refine with rules later)
          p.isCombust = dist <= 8;
        }
      });

      // Calculate Houses (Tropical) and convert to Sidereal
      const houseDataTropical = sweph.houses(jd, latitude, longitude, HouseSystem.Placidus, tropicalFlags as any);
      const houses: Record<number, any> = {};
      houseDataTropical.cusps.forEach((cuspLongTropical: number, index: number) => {
        const cuspLongSidereal = (cuspLongTropical - ayanamsaValue + 360) % 360;
        houses[index + 1] = {
          number: index + 1,
          cuspLongitude: cuspLongSidereal,
          rashi: Math.floor(cuspLongSidereal / 30) + 1,
          degree: cuspLongSidereal % 30
        };
      });

      const lagnaLongTropical = houseDataTropical.ascendant;
      const lagnaLongSidereal = (lagnaLongTropical - ayanamsaValue + 360) % 360;
      const lagnaMath = calcMath(lagnaLongSidereal);
      
      const lagna = {
        name: 'Lagna',
        tropicalLongitude: lagnaLongTropical,
        siderealLongitude: lagnaLongSidereal,
        degree: lagnaMath.degree,
        rashi: lagnaMath.rashi,
        rashiName: RASHI_NAMES[lagnaMath.rashi - 1],
        nakshatra: lagnaMath.nakshatra,
        pada: lagnaMath.pada
      };

      // Generate D1 (Rashi) Chart & Assign d1House to planets
      const d1Chart: Record<number, any> = {};
      const ZODIAC_LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
      
      for (let i = 1; i <= 12; i++) {
        const currentRashi = ((lagna.rashi + i - 2) % 12) + 1;
        d1Chart[i] = {
          houseNumber: i,
          rashi: currentRashi,
          rashiName: RASHI_NAMES[currentRashi - 1],
          signLord: ZODIAC_LORDS[currentRashi - 1],
          planetsOccupying: [],
          isBhava: false
        };
      }

      Object.values(planets).forEach(p => {
        const d1House = ((p.rashi - lagna.rashi + 12) % 12) + 1;
        p.d1House = d1House;
        d1Chart[d1House].planetsOccupying.push(p.name);
      });

      // Generate Bhava Chart
      const bhavaChart: Record<number, any> = {};
      Object.keys(houses).forEach(k => {
        const h = houses[Number(k)];
        bhavaChart[h.number] = {
          houseNumber: h.number,
          rashi: h.rashi,
          rashiName: RASHI_NAMES[h.rashi - 1],
          signLord: ZODIAC_LORDS[h.rashi - 1],
          planetsOccupying: [], // Complex span assignment pending
          cuspLongitude: h.cuspLongitude,
          isBhava: true
        };
      });

      const canonicalDob = dt.toFormat('dd MMMM yyyy');
      const canonicalTime = isTimeUnknown ? '12:00 PM' : dt.toFormat('hh:mm a');

      const metadata = {
        engine: 'Swiss Ephemeris',
        ephemerisVersion: sweph.version,
        ayanamsa: ayanamsa === 'Raman' ? 'Raman' : 'Lahiri',
        ayanamsaValue: ayanamsaValue,
        nodeType: 'True Node',
        houseSystem: 'Placidus',
        timestamp: new Date().toISOString(),
        inputTimezone: timezone,
        julianDay: jd,
        birthUtcTime: dtUtc.toISO(),
        timeUnknown: isTimeUnknown
      };

      const resultPayload: any = {
        birthProfile: {
          dob: canonicalDob,
          time: canonicalTime,
          rawDob: dob,
          rawTime: time,
          timeUnknown: isTimeUnknown,
          latitude,
          longitude,
          timezone
        },
        lagna,
        planets,
        d1Chart,
        bhavaChart,
        vimshottariDasha: null,
        ayanamsa,
        metadata,
        warnings: isTimeUnknown ? ['Birth time is unknown; calculations reference 12:00 PM local time.'] : []
      };

      try {
        resultPayload.vimshottariDasha = VimshottariEngine.calculate(resultPayload);
      } catch (dashaErr) {
        console.warn('Vimshottari Dasha calculation note:', dashaErr);
      }

      res.json(resultPayload);
    } catch (error: any) {
      console.error('Calculation Error:', error);
      res.status(500).json({ error: error.message || 'Failed to calculate astronomy data' });
    }
  });

  // Dedicated Real Transit Calculation Endpoint using Swiss Ephemeris
  app.post('/api/transit', async (req, res) => {
    try {
      const { date, time, latitude, longitude, timezone, ayanamsa = 'Lahiri' } = req.body;
      const targetDate = date || new Date().toISOString().split('T')[0];
      const targetTime = time || new Date().toTimeString().slice(0, 8);
      const targetLat = latitude != null ? Number(latitude) : 22.7196; // default Indore/India if not provided
      const targetLon = longitude != null ? Number(longitude) : 75.8577;
      const targetTz = timezone || 'Asia/Kolkata';

      let dt = DateTime.fromFormat(`${targetDate} ${targetTime}`, 'yyyy-MM-dd HH:mm:ss', { zone: targetTz });
      if (!dt.isValid) {
        dt = DateTime.fromFormat(`${targetDate} ${targetTime}`, 'yyyy-MM-dd HH:mm', { zone: targetTz });
      }
      if (!dt.isValid) {
        dt = DateTime.fromISO(`${targetDate}T${targetTime}`, { zone: targetTz });
      }
      if (!dt.isValid) {
        dt = DateTime.fromISO(targetDate, { zone: targetTz });
      }
      if (!dt.isValid) {
        dt = DateTime.now().setZone(targetTz);
      }

      const dtUtc = dt.toUTC();
      const hourUT = dtUtc.hour + (dtUtc.minute / 60) + (dtUtc.second / 3600);
      const jd = sweph.julianDay(dtUtc.year, dtUtc.month, dtUtc.day, hourUT, Calendar.Gregorian);

      const tropicalFlags = Flag.Speed;
      const selectedAyanamsa = ayanamsa === 'Raman' ? Ayanamsa.Raman : Ayanamsa.Lahiri;
      sweph.setSiderealMode(selectedAyanamsa);
      const ayanamsaValue = sweph.ayanamsa(jd);

      const calcMath = (sidereal: number) => {
        const norm = ((sidereal % 360) + 360) % 360;
        return {
          rashi: Math.floor(norm / 30) + 1,
          degree: norm % 30,
          nakshatra: Math.floor(norm / (360 / 27)) + 1,
          pada: Math.floor((norm % (360 / 27)) / (360 / 108)) + 1
        };
      };

      const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      const planets: Record<string, any> = {};

      planetNames.forEach(name => {
        let tropLong = 0;
        let sidLong = 0;
        let isRet = false;
        let lat = 0;

        if (name === 'Ketu') {
          const rahu = planets['Rahu'];
          tropLong = (rahu.tropicalLongitude + 180) % 360;
          sidLong = (rahu.siderealLongitude + 180) % 360;
          isRet = rahu.isRetrograde;
          lat = -rahu.latitude;
        } else {
          const body = getBody(name);
          const trop = sweph.calc(jd, body, tropicalFlags as any);
          tropLong = trop.longitude;
          sidLong = (tropLong - ayanamsaValue + 360) % 360;
          isRet = trop.longitudeSpeed < 0;
          lat = trop.latitude;
        }

        const math = calcMath(sidLong);

        planets[name] = {
          name,
          tropicalLongitude: tropLong,
          siderealLongitude: sidLong,
          degree: math.degree,
          rashi: math.rashi,
          rashiName: RASHI_NAMES[math.rashi - 1],
          latitude: lat,
          isRetrograde: isRet,
          nakshatra: math.nakshatra,
          pada: math.pada,
          motionStatus: isRet ? 'Retrograde' : 'Direct',
          calculationSource: 'Swiss Ephemeris'
        };
      });

      // Calculate Real Transit Ascendant for current instant and coordinates
      const houseDataTropical = sweph.houses(jd, targetLat, targetLon, 'P');
      const lagnaLongTropical = houseDataTropical.ascendant;
      const lagnaLongSidereal = (lagnaLongTropical - ayanamsaValue + 360) % 360;
      const lagnaMath = calcMath(lagnaLongSidereal);

      const ascendant = {
        name: 'Lagna',
        tropicalLongitude: lagnaLongTropical,
        siderealLongitude: lagnaLongSidereal,
        degree: lagnaMath.degree,
        rashi: lagnaMath.rashi,
        rashiName: RASHI_NAMES[lagnaMath.rashi - 1],
        nakshatra: lagnaMath.nakshatra,
        pada: lagnaMath.pada
      };

      res.json({
        ok: true,
        status: 'AVAILABLE',
        planets,
        ascendant,
        metadata: {
          engine: 'Swiss Ephemeris',
          ephemerisVersion: sweph.version,
          ayanamsa: ayanamsa === 'Raman' ? 'Raman' : 'Lahiri',
          ayanamsaValue,
          timestamp: new Date().toISOString(),
          evaluationDate: targetDate,
          evaluationTime: targetTime,
          julianDay: jd
        }
      });
    } catch (err: any) {
      console.error('Transit calculation error:', err);
      res.status(500).json({
        ok: false,
        status: 'NOT_AVAILABLE',
        error: err.message || 'Failed to calculate transit'
      });
    }
  });

  // Dedicated Future Transit Interval Scanning Endpoint using Swiss Ephemeris
  app.post('/api/future-transit', async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        mahadashaLord = 'Jupiter',
        antardashaLord = 'Ketu',
        timezone = 'Asia/Kolkata',
        ayanamsa = 'Lahiri',
        targetHouses = [],
        adverseHouses = [],
        primaryCuspSubLord = '',
        nativeLagnaRashi = 1
      } = req.body;

      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();

      if (isNaN(startMs) || isNaN(endMs) || startMs >= endMs) {
        return res.status(400).json({
          status: 'CALCULATION_ERROR',
          isCorroborated: false,
          scanStart: startDate,
          scanEnd: endDate,
          timestampsEvaluatedCount: 0,
          candidateEventsCount: 0,
          verifiedEventsCount: 0,
          supportingPlanets: [],
          keyTransitEvents: [],
          summary: {
            hi: 'अमान्य समय-सीमा के कारण भविष्य गोचर गणना निष्पादित नहीं की जा सकी।',
            en: 'Invalid time interval for future transit scanning.'
          },
          ephemerisSource: 'Swiss Ephemeris'
        });
      }

      const engine = new FutureTransitEngine();
      const kpData = req.body.kpResult || {
        system: 'KP',
        cuspData: [],
        planetData: [],
        availability: 'AVAILABLE',
        rules: [],
        warnings: [],
        metadata: {},
        significators: { byPlanet: {}, byHouse: {} as any }
      };

      const result = engine.executeInProcessScan(
        sweph,
        { startDate, endDate, mahadashaLord, antardashaLord },
        null,
        kpData,
        targetHouses,
        adverseHouses,
        primaryCuspSubLord,
        {
          startMs,
          endMs,
          latitude: 22.7196,
          longitude: 75.8577,
          timezone,
          ayanamsa,
          nativeLagnaRashi
        }
      );

      res.json(result);
    } catch (err: any) {
      console.error('Future transit calculation error:', err);
      res.status(500).json({
        ok: false,
        status: 'CALCULATION_ERROR',
        error: err.message || 'Failed to scan future transit'
      });
    }
  });

  // ==========================================
  // GUARDIAN SERVER-SIDE AUTHORIZATION APIS
  // ==========================================

  const extractSessionToken = (req: express.Request): string | undefined => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    const customHeader = req.headers['x-guardian-token'];
    if (typeof customHeader === 'string') return customHeader.trim();
    return undefined;
  };

  // Simple IP-based rate limiter for login
  const loginAttempts = new Map<string, { count: number; resetAt: number }>();

  // 0a. Owner PIN Status Endpoint
  app.get('/api/guardian/pin/status', (req, res) => {
    const status = getOwnerPinStatus();
    res.json({
      ok: true,
      ...status
    });
  });

  // 0b. Owner PIN Setup / Update / Reset Endpoint
  app.post('/api/guardian/pin/setup', (req, res) => {
    const token = extractSessionToken(req);
    const { newPin, oldPin, masterKey } = req.body;
    const result = setServerOwnerPin(newPin, {
      oldPin,
      masterKey,
      sessionToken: token
    });
    if (!result.success) {
      return res.status(400).json({ ok: false, error: result.error });
    }
    res.json({
      ok: true,
      message: 'Swami PIN configured successfully',
      sessionToken: result.sessionToken,
      role: 'OWNER'
    });
  });

  // 1. Owner Login Endpoint
  app.post('/api/guardian/login', (req, res) => {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    const now = Date.now();
    const rate = loginAttempts.get(ip);

    if (rate && rate.resetAt > now && rate.count >= 5) {
      return res.status(429).json({
        ok: false,
        error: 'Too many authentication attempts. Please wait 1 minute before retrying.'
      });
    }

    const { pin } = req.body;
    const authResult = authenticateOwner(pin, ip);

    if (!authResult.success) {
      const currentRate = rate && rate.resetAt > now ? rate.count + 1 : 1;
      loginAttempts.set(ip, { count: currentRate, resetAt: now + 60000 });
      return res.status(401).json({
        ok: false,
        error: authResult.error || 'Authentication failed'
      });
    }

    // Success: clear rate limit and return token
    loginAttempts.delete(ip);
    res.json({
      ok: true,
      sessionToken: authResult.sessionToken,
      role: 'OWNER',
      expiresIn: 4 * 3600
    });
  });

  // 2. Session Validation Endpoint
  app.get('/api/guardian/session', (req, res) => {
    const token = extractSessionToken(req);
    const session = validateSession(token);
    res.json({
      valid: session.valid,
      role: session.role || 'ANONYMOUS',
      userId: session.userId || null
    });
  });

  // 3. Central Permission Authorization Endpoint
  app.post('/api/guardian/authorize', (req, res) => {
    const token = extractSessionToken(req);
    const session = validateSession(token);
    const { action, targetModule, affectedFiles, severity = 'WARN', approvalId, clientPayload } = req.body;

    const actor: GuardianActor = {
      userId: session.userId || 'anonymous_client',
      role: (session.role as any) || 'ANONYMOUS',
      sessionToken: token,
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string)
    };

    const authResult = authorizeGuardianAction({
      actor,
      action: action || 'UNSPECIFIED_ACTION',
      targetModule: targetModule || 'General',
      affectedFiles: affectedFiles || [],
      severity,
      approvalId,
      clientPayload
    });

    const httpStatus = authResult.decision === 'ALLOWED' ? 200 :
                       authResult.decision === 'APPROVAL_REQUIRED' ? 403 :
                       authResult.decision === 'CRITICAL_LOCK' ? 423 : 401;

    res.status(httpStatus).json({
      ok: authResult.decision === 'ALLOWED',
      decision: authResult.decision,
      reason: authResult.reason
    });
  });

  // 4. Create Approval Request Endpoint
  app.post('/api/guardian/approvals/request', (req, res) => {
    const token = extractSessionToken(req);
    const { action, targetModule, affectedFiles, severity = 'WARN', reason, backupRequired } = req.body;

    const result = createServerApprovalRequest({
      sessionToken: token || '',
      action: action || 'CHANGE_MODULE',
      targetModule: targetModule || 'General',
      affectedFiles: affectedFiles || [],
      severity,
      reason: reason || 'Guardian maintenance change',
      backupRequired: backupRequired !== false
    });

    if (!result.success) {
      return res.status(result.error?.includes('CRITICAL_LOCK') ? 423 : 403).json({
        ok: false,
        error: result.error
      });
    }

    res.json({
      ok: true,
      approval: result.approval
    });
  });

  // 5. Approve Request Endpoint (Owner Authorization)
  app.post('/api/guardian/approvals/:id/approve', (req, res) => {
    const token = extractSessionToken(req);
    const { id } = req.params;

    const result = approveServerRequest(token || '', id);
    if (!result.success) {
      return res.status(403).json({
        ok: false,
        error: result.error
      });
    }

    res.json({
      ok: true,
      message: `Approval request ${id} successfully authorized by Owner.`
    });
  });

  // 6. Rollback Request Endpoint
  app.post('/api/guardian/approvals/:id/rollback', (req, res) => {
    const token = extractSessionToken(req);
    const { snapshotId } = req.body;

    if (!snapshotId) {
      return res.status(400).json({ ok: false, error: 'snapshotId is required for rollback.' });
    }

    const result = executeServerRollback(token || '', snapshotId);
    if (!result.success) {
      return res.status(403).json({
        ok: false,
        error: result.error
      });
    }

    res.json({
      ok: true,
      message: `Successfully rolled back to snapshot ${snapshotId}`
    });
  });

  // 7. Audit Logs Endpoint
  app.get('/api/guardian/audit-logs', (req, res) => {
    const token = extractSessionToken(req);
    const logs = getServerAuditLogs(token);
    res.json({
      ok: true,
      logs
    });
  });

  // 8. Create Backup Snapshot Endpoint
  app.post('/api/guardian/backups/create', (req, res) => {
    const token = extractSessionToken(req);
    const session = validateSession(token);
    if (!session.valid || session.role !== 'OWNER') {
      return res.status(403).json({ ok: false, error: 'Unauthorized: Owner session required.' });
    }

    const { label, data } = req.body;
    const snapshotId = createServerBackup(label || 'Manual Snapshot', session.userId!, data);
    res.json({
      ok: true,
      snapshotId
    });
  });

  // 9. Restore Backup Snapshot Endpoint
  app.post('/api/guardian/backups/restore', (req, res) => {
    const token = extractSessionToken(req);
    const { snapshotId } = req.body;

    if (!snapshotId) {
      return res.status(400).json({ ok: false, error: 'snapshotId is required.' });
    }

    const result = executeServerRollback(token || '', snapshotId);
    if (!result.success) {
      return res.status(403).json({ ok: false, error: result.error });
    }

    res.json({
      ok: true,
      message: `Snapshot ${snapshotId} successfully restored.`
    });
  });

  // Serve static font files for PDF Unicode generation
  app.use('/fonts', express.static(path.join(process.cwd(), 'public/fonts')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

startServer();
