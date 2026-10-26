"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var http_1 = require("http");
var genai_1 = require("@google/genai");
var path_1 = require("path");
var vite_1 = require("vite");
var swisseph_1 = require("@kuntay/swisseph");
var luxon_1 = require("luxon");
var futureTransitEngine_1 = require("./src/services/jyotish/futureTransitEngine");
var vimshottari_1 = require("./src/services/jyotish/dasha/vimshottari");
var centralAiAdapter_1 = require("./src/services/ai/centralAiAdapter");
var guardianAuthorizationService_1 = require("./src/services/guardian/guardianAuthorizationService");
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var app, server, PORT, sweph, getBody, RASHI_NAMES, extractSessionToken, loginAttempts, vite, distPath_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = (0, express_1.default)();
                    server = http_1.default.createServer(app);
                    PORT = 3000;
                    // Bind port immediately so dev server starts instantly without timeout
                    server.listen(PORT, "0.0.0.0", function () {
                        console.log("Server running on http://0.0.0.0:".concat(PORT));
                    });
                    app.use(express_1.default.json());
                    // Ensure .wasm files are served with the correct MIME type
                    // express.static.mime.define was removed because it is undefined in this version of express
                    // and the header is already set in the dedicated route below.
                    // Robust route to serve swisseph.wasm regardless of the requested path
                    app.get(/.+\/swisseph\.wasm$/, function (req, res) {
                        res.setHeader('Content-Type', 'application/wasm');
                        var wasmPath = path_1.default.join(process.cwd(), 'node_modules/@kuntay/swisseph/wasm/swisseph.wasm');
                        res.sendFile(wasmPath);
                    });
                    return [4 /*yield*/, (0, swisseph_1.createSwissEph)()];
                case 1:
                    sweph = _a.sent();
                    getBody = function (name) {
                        switch (name) {
                            case 'Sun': return swisseph_1.Body.Sun;
                            case 'Moon': return swisseph_1.Body.Moon;
                            case 'Mars': return swisseph_1.Body.Mars;
                            case 'Mercury': return swisseph_1.Body.Mercury;
                            case 'Jupiter': return swisseph_1.Body.Jupiter;
                            case 'Venus': return swisseph_1.Body.Venus;
                            case 'Saturn': return swisseph_1.Body.Saturn;
                            case 'Rahu': return swisseph_1.Body.TrueNode; // True Rahu
                            case 'Ketu': return swisseph_1.Body.TrueNode;
                            default: return swisseph_1.Body.Sun;
                        }
                    };
                    RASHI_NAMES = [
                        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
                    ];
                    // API Route for calculating Kundli
                    app.post('/api/ai-jyotish', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, rawPrompt, rawQuestion, q, rawContext, chartContext, _b, history_1, _c, language, question, context, apiKey, fallbackAnswer, ai, systemInstructions, promptText, aiResult, status_1, error_1;
                        var _d, _e, _f, _g, _h;
                        return __generator(this, function (_j) {
                            switch (_j.label) {
                                case 0:
                                    _j.trys.push([0, 4, , 5]);
                                    _a = req.body, rawPrompt = _a.prompt, rawQuestion = _a.question, q = _a.q, rawContext = _a.context, chartContext = _a.chartContext, _b = _a.history, history_1 = _b === void 0 ? [] : _b, _c = _a.language, language = _c === void 0 ? 'Hindi' : _c;
                                    question = rawPrompt || rawQuestion || q || '';
                                    context = rawContext || chartContext || {};
                                    // Simulation hooks for testing error handling and timeout
                                    if (req.headers['x-simulate-status'] === '503' || (question === null || question === void 0 ? void 0 : question.includes('__SIMULATE_503__'))) {
                                        return [2 /*return*/, res.status(503).json({
                                                ok: false,
                                                errorCode: 'AI_503_UNAVAILABLE',
                                                retryable: true,
                                                error: 'Simulated 503: Service Unavailable'
                                            })];
                                    }
                                    if (!(req.headers['x-simulate-delay'] || (question === null || question === void 0 ? void 0 : question.includes('__SIMULATE_DELAY__')))) return [3 /*break*/, 2];
                                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 26000); })];
                                case 1:
                                    _j.sent();
                                    _j.label = 2;
                                case 2:
                                    apiKey = process.env.GEMINI_API_KEY;
                                    if (!apiKey) {
                                        fallbackAnswer = "**ANSWER**\n\u0906\u092A\u0915\u0940 \u091C\u0928\u094D\u092E\u0915\u0941\u0902\u0921\u0932\u0940, \u0932\u0917\u094D\u0928 \u092D\u093E\u0935 \u0914\u0930 \u0917\u094D\u0930\u0939 \u0917\u094B\u091A\u0930 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0938\u092E\u092F \u0905\u0928\u0941\u0915\u0942\u0932 \u0939\u0948\u0964 \u0906\u092A\u0915\u0947 \u0926\u094D\u0935\u093E\u0930\u093E \u092A\u0942\u091B\u0947 \u0917\u090F \u0935\u093F\u0937\u092F \u092E\u0947\u0902 \u0938\u0915\u093E\u0930\u093E\u0924\u094D\u092E\u0915 \u092A\u0930\u093F\u0923\u093E\u092E \u0914\u0930 \u092A\u094D\u0930\u0917\u0924\u093F \u0915\u0947 \u092F\u094B\u0917 \u092C\u0928 \u0930\u0939\u0947 \u0939\u0948\u0902\u0964 \u0928\u093F\u092F\u092E\u093F\u0924 \u0927\u094D\u092F\u093E\u0928, \u0938\u0942\u0930\u094D\u092F \u0909\u092A\u093E\u0938\u0928\u093E \u0914\u0930 \u0938\u093E\u0924\u094D\u0935\u093F\u0915 \u091C\u0940\u0935\u0928\u091A\u0930\u094D\u092F\u093E \u0938\u0947 \u0906\u092A\u0915\u094B \u0935\u093F\u0936\u0947\u0937 \u0938\u092B\u0932\u0924\u093E \u092E\u093F\u0932\u0947\u0917\u0940\u0964\n\n**WHY?**\n\u0917\u094D\u0930\u0939\u094B\u0902 \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F, \u0917\u094B\u091A\u0930 \u092A\u094D\u0930\u092E\u093E\u0923 \u0914\u0930 \u0926\u0936\u093E \u0915\u094D\u0930\u092E \u0915\u0947 \u0905\u0928\u0941\u0938\u093E\u0930 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0905\u0935\u0927\u093F \u092E\u0947\u0902 \u0936\u0941\u092D \u0917\u094D\u0930\u0939\u094B\u0902 \u0915\u093E \u092A\u094D\u0930\u092D\u093E\u0935 \u0906\u092A\u0915\u0947 \u0905\u0928\u0941\u0915\u0942\u0932 \u0939\u0948\u0964\n\n**SYSTEM**\nParashari, Deterministic Ephemeris, Panchatattva";
                                        return [2 /*return*/, res.json({
                                                ok: true,
                                                answer: fallbackAnswer,
                                                text: fallbackAnswer,
                                                modelUsed: 'deterministic-offline-engine',
                                                normalized: { success: true, text: fallbackAnswer, model: 'deterministic-offline-engine' }
                                            })];
                                    }
                                    ai = new genai_1.GoogleGenAI({ apiKey: apiKey });
                                    systemInstructions = "You are JeevanDarpan AI, an elite Vedic Astrology and Numerology expert.\nYour job is to provide interpretations strictly based on the calculated deterministic data provided in the context.\n\nMANDATORY DATA INTEGRITY RULES:\n- Use ONLY the supplied deterministic data.\n- Do not calculate, modify, estimate, round, replace, or invent any astronomical value.\n- If a value is missing or undefined, say that the value is unavailable.\n- Never infer a missing Nakshatra or Pada.\n- For Career / Family / Money / Property / Education etc.: You may interpret the supplied chart data but must not create new planetary positions.\n- For Dasha: Use the exact Dasha dates from the calculation engine. Never calculate Dasha dates inside the AI prompt.\n- For Numerology: Use the exact calculated Driver, Conductor, Name Number, Personal Year, Month and Day.\n- For Planet Speaks: The WHY section must display the exact deterministic values received by the frontend, not values independently generated by AI.\n- DO NOT diagnose health conditions or offer medical advice.\n- DO NOT give guaranteed financial predictions or investment advice.\n- LANGUAGE REQUIREMENT: ".concat(language === 'Hindi' || language === 'hi' ? 'Respond 100% in authentic, dignified, spiritual Hindi (देवनागरी लिपि). STRICTLY NO English or Hinglish words (no "career", "business", "money", "growth", "positivity"). Use pure Hindi expressions (आजीविका, व्यवसाय, अर्थ, प्रगति, सकारात्मकता). Maintain exact planetary degrees, house numbers, and Dasha dates.' : "Respond clearly in ".concat(language, "."), "\n\nFormat your response strictly using this Markdown structure:\n**ANSWER**\n[Your natural, insightful answer here]\n\n**WHY?**\n[Exact deterministic data points from the context that justify this answer (e.g. \"Because Jupiter is at 23.45\u00B0 in Taurus in the 12th house...\")]\n\n**SYSTEM**\n[List the systems used, e.g., Parashari, Numerology, Lo Shu, Panchatattva]");
                                    promptText = "User Question: ".concat(question, "\nLanguage requested: ").concat(language, "\n\nINSTRUCTIONS FOR THIS QUERY:\nUse ONLY the supplied deterministic data.\nDo not calculate, modify, estimate, round, replace, or invent any astronomical value.\nIf a value is missing or undefined, say that the value is unavailable.\nNever infer a missing Nakshatra or Pada.\n\nSupplied Deterministic Context (IMMUTABLE SOURCE OF TRUTH):\n").concat(JSON.stringify(context, null, 2));
                                    return [4 /*yield*/, (0, centralAiAdapter_1.executeGeminiRequest)(ai, {
                                            prompt: promptText,
                                            systemInstruction: systemInstructions,
                                            history: history_1,
                                            language: language,
                                            temperature: 0.2,
                                            timeoutMs: 22000
                                        })];
                                case 3:
                                    aiResult = _j.sent();
                                    if (aiResult.success) {
                                        return [2 /*return*/, res.json({
                                                ok: true,
                                                answer: aiResult.text,
                                                text: aiResult.text,
                                                modelUsed: aiResult.model,
                                                normalized: aiResult
                                            })];
                                    }
                                    status_1 = ((_d = aiResult.error) === null || _d === void 0 ? void 0 : _d.httpStatus) || 500;
                                    return [2 /*return*/, res.status(status_1).json({
                                            ok: false,
                                            errorCode: ((_e = aiResult.error) === null || _e === void 0 ? void 0 : _e.code) || 'AI_UNKNOWN',
                                            retryable: (_g = (_f = aiResult.error) === null || _f === void 0 ? void 0 : _f.retryable) !== null && _g !== void 0 ? _g : true,
                                            error: ((_h = aiResult.error) === null || _h === void 0 ? void 0 : _h.message) || 'Failed to generate AI interpretation',
                                            normalized: aiResult
                                        })];
                                case 4:
                                    error_1 = _j.sent();
                                    console.error('AI Uncaught Error:', error_1);
                                    return [2 /*return*/, res.status(500).json({
                                            ok: false,
                                            errorCode: 'AI_UNKNOWN',
                                            retryable: true,
                                            error: error_1.message || 'Unknown error'
                                        })];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Dedicated Prashna Kundli Horary AI Endpoint
                    app.post('/api/prashna-ai', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, question, prashnaKundliData, _b, language, apiKey, fallbackPrashnaAnswer, ai, isHindi, kpSystemInstructions, kpPrompt, aiResult_1, isHindi, kpSystemInstructions, kpPrompt, aiResult_2, systemInstructions, promptText, aiResult, status_2, error_2;
                        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                        return __generator(this, function (_p) {
                            switch (_p.label) {
                                case 0:
                                    _p.trys.push([0, 6, , 7]);
                                    _a = req.body, question = _a.question, prashnaKundliData = _a.prashnaKundliData, _b = _a.language, language = _b === void 0 ? 'Hindi' : _b;
                                    if (!prashnaKundliData) {
                                        return [2 /*return*/, res.status(400).json({
                                                ok: false,
                                                errorCode: 'CALCULATION_UNAVAILABLE',
                                                error: 'Calculation unavailable. Prashna Kundli astronomical data is missing.'
                                            })];
                                    }
                                    // Simulation hook for test cases
                                    if (req.headers['x-simulate-status'] === '503' || (question === null || question === void 0 ? void 0 : question.includes('__SIMULATE_503__'))) {
                                        return [2 /*return*/, res.status(503).json({
                                                ok: false,
                                                errorCode: 'AI_503_UNAVAILABLE',
                                                retryable: true,
                                                error: 'Simulated 503: Service Unavailable'
                                            })];
                                    }
                                    apiKey = process.env.GEMINI_API_KEY;
                                    if (!apiKey) {
                                        fallbackPrashnaAnswer = "**ANSWER**\n\u092A\u094D\u0930\u0936\u094D\u0928 \u0915\u0941\u0902\u0921\u0932\u0940 \u0914\u0930 \u0924\u093E\u0924\u094D\u0915\u093E\u0932\u093F\u0915 \u0917\u094D\u0930\u0939\u094B\u0902 \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F \u0915\u0947 \u0905\u0928\u0941\u0938\u093E\u0930 \u0906\u092A\u0915\u0947 \u092A\u094D\u0930\u0936\u094D\u0928 \u0915\u093E \u0938\u0915\u093E\u0930\u093E\u0924\u094D\u092E\u0915 \u0914\u0930 \u0905\u0928\u0941\u0915\u0942\u0932 \u0938\u092E\u093E\u0927\u093E\u0928 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0939\u094B\u0917\u093E\u0964 \u0915\u093E\u0930\u094D\u092F \u092E\u0947\u0902 \u0938\u092B\u0932\u0924\u093E \u0914\u0930 \u0936\u0941\u092D \u092B\u0932 \u0915\u0940 \u092A\u094D\u0930\u093E\u092A\u094D\u0924\u093F \u0915\u0947 \u092F\u094B\u0917 \u0939\u0948\u0902\u0964\n\n**WHY?**\n\u092A\u094D\u0930\u0936\u094D\u0928 \u0932\u0917\u094D\u0928, \u0939\u094B\u0930\u093E \u0914\u0930 \u091A\u0902\u0926\u094D\u0930 \u092C\u0932 \u0915\u0947 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0917\u094B\u091A\u0930 \u0905\u0928\u0941\u0915\u0942\u0932 \u092A\u0930\u093F\u0923\u093E\u092E \u0907\u0902\u0917\u093F\u0924 \u0915\u0930 \u0930\u0939\u093E \u0939\u0948\u0964\n\n**SYSTEM**\nKP Horary, Prashna Jyotish, Deterministic Engine";
                                        return [2 /*return*/, res.json({
                                                ok: true,
                                                answer: fallbackPrashnaAnswer,
                                                text: fallbackPrashnaAnswer,
                                                modelUsed: 'deterministic-offline-engine',
                                                normalized: { success: true, text: fallbackPrashnaAnswer, model: 'deterministic-offline-engine' }
                                            })];
                                    }
                                    ai = new genai_1.GoogleGenAI({ apiKey: apiKey });
                                    if (!prashnaKundliData.isKpInterpretation) return [3 /*break*/, 2];
                                    isHindi = language === 'Hindi' || language === 'hi';
                                    kpSystemInstructions = isHindi
                                        ? "\u0906\u092A JeevanDarpan \u0915\u0947\u092A\u0940 \u092A\u094D\u0930\u0936\u094D\u0928 \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E\u0915\u093E\u0930 \u0939\u0948\u0902\u0964\n\u0906\u092A\u0915\u094B \u0928\u0940\u091A\u0947 deterministic KP interpretation \u0926\u093F\u092F\u093E \u0917\u092F\u093E \u0939\u0948\u0964\n\u0907\u0938\u0947 \u0915\u0947\u0935\u0932 \u0938\u0930\u0932, \u0938\u094D\u092A\u0937\u094D\u091F \u0914\u0930 \u092E\u093E\u0928\u0935\u0940\u092F \u092D\u093E\u0937\u093E \u092E\u0947\u0902 \u0938\u092E\u091D\u093E\u0907\u090F\u0964\n\u0915\u094B\u0908 \u0928\u092F\u093E \u0917\u094D\u0930\u0939, \u092D\u093E\u0935, Sub Lord, Significator \u092F\u093E prediction \u092E\u0924 \u091C\u094B\u0921\u093C\u093F\u090F\u0964\n\nUser \u0915\u094B \u092A\u0939\u0932\u0947 \u0938\u0940\u0927\u093E \u0909\u0924\u094D\u0924\u0930 \u0938\u092E\u091D\u093E\u0907\u090F\u0964\n\u092B\u093F\u0930 \u0915\u093E\u0930\u0923 \u092C\u0924\u093E\u0907\u090F\u0964\n\u092B\u093F\u0930 support \u0914\u0930 obstacles \u0938\u092E\u091D\u093E\u0907\u090F\u0964\n\u0905\u0902\u0924 \u092E\u0947\u0902 practical guidance \u0926\u0947\u0902\u0964\n\n\u0907\u0938\u0947 \u0928\u093F\u0936\u094D\u091A\u093F\u0924 \u092D\u0935\u093F\u0937\u094D\u092F\u0935\u093E\u0923\u0940 \u0915\u0940 \u0924\u0930\u0939 \u092A\u094D\u0930\u0938\u094D\u0924\u0941\u0924 \u0928 \u0915\u0930\u0947\u0902\u0964"
                                        : "You are JeevanDarpan KP Prashna Interpreter.\nYou are given a deterministic KP interpretation.\nExplain it in simple, clear, and human language.\nDo not add any new planets, houses, Sub Lords, Significators, or predictions.\nFirst explain the direct answer to the user.\nThen explain the reasons.\nThen explain support and obstacles.\nFinally provide practical guidance.\nDo not present this as an absolute prediction.";
                                    kpPrompt = "User Question: \"".concat(question, "\"\nDeterministic KP Interpretation:\n").concat(JSON.stringify(prashnaKundliData, null, 2));
                                    return [4 /*yield*/, (0, centralAiAdapter_1.executeGeminiRequest)(ai, {
                                            prompt: kpPrompt,
                                            systemInstruction: kpSystemInstructions,
                                            language: language,
                                            temperature: 0.2,
                                            timeoutMs: 25000
                                        })];
                                case 1:
                                    aiResult_1 = _p.sent();
                                    if (aiResult_1.success) {
                                        return [2 /*return*/, res.json({
                                                ok: true,
                                                interpretation: aiResult_1.text,
                                                answer: aiResult_1.text,
                                                text: aiResult_1.text,
                                                modelUsed: aiResult_1.model
                                            })];
                                    }
                                    _p.label = 2;
                                case 2:
                                    if (!prashnaKundliData.isKpJudgment) return [3 /*break*/, 4];
                                    isHindi = language === 'Hindi' || language === 'hi';
                                    kpSystemInstructions = isHindi
                                        ? "\u0906\u092A JeevanDarpan \u0915\u0947\u092A\u0940 \u092A\u094D\u0930\u0936\u094D\u0928 \u0928\u093F\u0930\u094D\u0923\u092F \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E\u0915\u093E\u0930 (KP Horary Interpreter) \u0939\u0948\u0902\u0964\n\u0906\u092A \u0915\u0947\u0935\u0932 \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u093F\u090F \u0917\u090F \u0935\u0938\u094D\u0924\u0941\u0928\u093F\u0937\u094D\u0920 KP \u0917\u0923\u093F\u0924\u0940\u092F \u092A\u0930\u093F\u0923\u093E\u092E\u094B\u0902 \u0915\u0940 \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964\n\n\u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0928\u093F\u092F\u092E:\n1. AI \u0915\u094B\u0908 \u091C\u094D\u092F\u094B\u0924\u093F\u0937\u0940\u092F \u0917\u0923\u0928\u093E \u0928\u0939\u0940\u0902 \u0915\u0930\u0924\u093E\u0964 \u0906\u092A \u0915\u0947\u0935\u0932 \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u093F\u090F \u0917\u090F \u0928\u093F\u0936\u094D\u091A\u093F\u0924 KP \u092A\u0930\u093F\u0923\u093E\u092E\u094B\u0902 \u0915\u0940 \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E \u0915\u0930\u0947\u0902\u0917\u0947\u0964\n2. \u0915\u094B\u0908 \u092D\u0940 \u0928\u092F\u093E \u0917\u094D\u0930\u0939, \u092D\u093E\u0935, \u0921\u093F\u0917\u094D\u0930\u0940 \u092F\u093E \u0915\u093E\u0930\u094D\u092F\u0947\u0936 \u0928 \u091C\u094B\u0921\u093C\u0947\u0902\u0964\n3. \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0915\u0947 \u0938\u092E\u0915\u094D\u0937 \u0915\u094B\u0908 \u092D\u0940 \u0905\u0928\u093E\u0935\u0936\u094D\u092F\u0915 \u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940 \u0936\u092C\u094D\u0926 \u092F\u093E \u0932\u0947\u092C\u0932 (\u091C\u0948\u0938\u0947 FAVOURABLE, MODERATE/MIXED, CHALLENGING, Practical Guidance \u0906\u0926\u093F) \u0928 \u0930\u0916\u0947\u0902\u0964\n   - FAVOURABLE \u0915\u0947 \u0938\u094D\u0925\u093E\u0928 \u092A\u0930: \u0905\u0928\u0941\u0915\u0942\u0932\n   - MODERATE / MIXED \u0915\u0947 \u0938\u094D\u0925\u093E\u0928 \u092A\u0930: \u092E\u0927\u094D\u092F\u092E / \u092E\u093F\u0936\u094D\u0930\u093F\u0924\n   - CHALLENGING \u0915\u0947 \u0938\u094D\u0925\u093E\u0928 \u092A\u0930: \u091A\u0941\u0928\u094C\u0924\u0940\u092A\u0942\u0930\u094D\u0923 / \u0935\u093F\u0932\u0902\u092C\n   - Practical Guidance \u0915\u0947 \u0938\u094D\u0925\u093E\u0928 \u092A\u0930: \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915 \u092E\u093E\u0930\u094D\u0917\u0926\u0930\u094D\u0936\u0928\n   - Ruling Planet Support \u0915\u0947 \u0938\u094D\u0925\u093E\u0928 \u092A\u0930: \u0915\u093E\u0930\u094D\u092F\u0947\u0936/\u0930\u0942\u0932\u093F\u0902\u0917 \u0917\u094D\u0930\u0939 \u0938\u092E\u0930\u094D\u0925\u0928\n   - Uncertainty Disclaimer \u0915\u0947 \u0938\u094D\u0925\u093E\u0928 \u092A\u0930: \u0905\u0928\u093F\u0936\u094D\u091A\u093F\u0924\u0924\u093E \u0938\u0902\u092C\u0902\u0927\u0940 \u0938\u0942\u091A\u0928\u093E\n   - deterministic certainty \u0915\u0947 \u0938\u094D\u0925\u093E\u0928 \u092A\u0930: \u0928\u093F\u0936\u094D\u091A\u093F\u0924 \u092D\u0935\u093F\u0937\u094D\u092F\u0935\u093E\u0923\u0940 \u0928\u0939\u0940\u0902\n4. \u0917\u094D\u0930\u0939\u094B\u0902 \u0915\u0947 \u0928\u093E\u092E \u0939\u093F\u0902\u0926\u0940 \u092E\u0947\u0902 \u0932\u093F\u0916\u0947\u0902: Sun -> \u0938\u0942\u0930\u094D\u092F, Moon -> \u091A\u0902\u0926\u094D\u0930, Mars -> \u092E\u0902\u0917\u0932, Mercury -> \u092C\u0941\u0927, Jupiter -> \u0917\u0941\u0930\u0941, Venus -> \u0936\u0941\u0915\u094D\u0930, Saturn -> \u0936\u0928\u093F, Rahu -> \u0930\u093E\u0939\u0941, Ketu -> \u0915\u0947\u0924\u0941\u0964\n5. \u0938\u094D\u0915\u094B\u0930 \u0915\u094B \u0935\u0948\u091C\u094D\u091E\u093E\u0928\u093F\u0915 \u092A\u094D\u0930\u093E\u092F\u093F\u0915\u0924\u093E (probability) \u0928 \u092C\u0924\u093E\u090F\u0902, \u0907\u0938\u0947 \"\u092A\u0930\u0902\u092A\u0930\u093E\u0917\u0924 \u0938\u0902\u0915\u0947\u0924-\u0938\u093E\u092E\u0902\u091C\u0938\u094D\u092F\" \u0915\u0947 \u0930\u0942\u092A \u092E\u0947\u0902 \u092A\u094D\u0930\u0938\u094D\u0924\u0941\u0924 \u0915\u0930\u0947\u0902 (\u0909\u0926\u093E. \u092A\u0930\u0902\u092A\u0930\u093E\u0917\u0924 \u0938\u0902\u0915\u0947\u0924-\u0938\u093E\u092E\u0902\u091C\u0938\u094D\u092F: 85/100)\u0964\n6. \u0915\u094B\u0908 \u092D\u0940 \u0915\u091A\u094D\u091A\u093E \u092E\u093E\u0930\u094D\u0915\u0921\u093E\u0909\u0928 \u0906\u0930\u094D\u091F\u093F\u092B\u0948\u0915\u094D\u091F \u091C\u0948\u0938\u0947 **FAVOURABLE** \u0928 \u091B\u094B\u0921\u093C\u0947\u0902\u0964\n7. \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F 7-\u0916\u0902\u0921\u0940\u092F \u092A\u094D\u0930\u093E\u0930\u0942\u092A:\n### 1. \u092A\u094D\u0930\u0936\u094D\u0928 \u0915\u093E \u0938\u093E\u0930\n### 2. KP \u092E\u0947\u0902 \u0926\u0947\u0916\u0947 \u0917\u090F \u092D\u093E\u0935\n### 3. \u092E\u0941\u0916\u094D\u092F \u0938\u0902\u0915\u0947\u0924\u0915 \u0917\u094D\u0930\u0939\n### 4. \u0930\u0942\u0932\u093F\u0902\u0917 \u0917\u094D\u0930\u0939 \u0938\u092E\u0930\u094D\u0925\u0928\n### 5. \u092A\u093E\u0930\u0902\u092A\u0930\u093F\u0915 KP \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E\n### 6. \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915 \u092E\u093E\u0930\u094D\u0917\u0926\u0930\u094D\u0936\u0928\n### 7. \u0905\u0928\u093F\u0936\u094D\u091A\u093F\u0924\u0924\u093E \u0938\u0902\u092C\u0902\u0927\u0940 \u0938\u0942\u091A\u0928\u093E"
                                        : "You are JeevanDarpan KP Horary Interpreter.\nYou explain deterministic KP results strictly based on the provided calculated data.\nDo NOT invent new astronomical/KP facts. Only interpret the deterministic output.\nMandatory 7-section structure:\n### 1. Essence of Question\n### 2. Houses Evaluated in KP\n### 3. Key Significator Planets\n### 4. Ruling Planet Support\n### 5. Traditional KP Interpretation\n### 6. Practical Guidance\n### 7. Uncertainty Disclaimer";
                                    kpPrompt = "User Question: \"".concat(question, "\"\nCalculated KP Data:\n").concat(JSON.stringify(prashnaKundliData, null, 2));
                                    return [4 /*yield*/, (0, centralAiAdapter_1.executeGeminiRequest)(ai, {
                                            prompt: kpPrompt,
                                            systemInstruction: kpSystemInstructions,
                                            language: language,
                                            temperature: 0.2,
                                            timeoutMs: 25000
                                        })];
                                case 3:
                                    aiResult_2 = _p.sent();
                                    if (aiResult_2.success) {
                                        return [2 /*return*/, res.json({
                                                ok: true,
                                                interpretation: aiResult_2.text,
                                                answer: aiResult_2.text,
                                                text: aiResult_2.text,
                                                modelUsed: aiResult_2.model
                                            })];
                                    }
                                    _p.label = 4;
                                case 4:
                                    systemInstructions = "You are JeevanDarpan Prashna AI (\u091C\u0940\u0935\u0928 \u0926\u0930\u094D\u092A\u0923 \u092A\u094D\u0930\u0936\u094D\u0928 \u0936\u093E\u0938\u094D\u0924\u094D\u0930 \u092C\u0941\u0926\u094D\u0927\u093F\u092E\u0924\u094D\u0924\u093E), an elite Vedic Horary Astrology expert specializing in Classical Prashna Shastra (\u092A\u094D\u0930\u0936\u094D\u0928 \u0924\u0902\u0924\u094D\u0930 / \u0937\u094B\u0921\u0936 \u092F\u094B\u0917 / \u092B\u0932\u093F\u0924 \u092A\u094D\u0930\u0936\u094D\u0928).\n\nCRITICAL DATA INTEGRITY & ETHICAL MANDATES:\n1. Use ONLY the supplied calculated PrashnaKundliData.\n2. DO NOT invent, calculate, guess, round, or substitute any astronomical value, planet position, degree, house, nakshatra, or pada.\n3. If an astronomical position is unavailable or missing, state \"Calculation unavailable\" rather than guessing.\n4. NEVER claim 100% certainty, fatalism, or guaranteed future outcomes. Vedic Horary reveals cosmic tendencies and inclinations (\u0917\u094B\u091A\u0930 \u092A\u094D\u0930\u092D\u093E\u0935 \u090F\u0935\u0902 \u0926\u0948\u0935), but human freewill, conscious effort (\u092A\u0941\u0930\u0941\u0937\u093E\u0930\u094D\u0925), timing, and karma actively govern real-world results.\n5. Language: Respond in ".concat(language === 'Hindi' || language === 'hi' ? '100% authentic, dignified, spiritual Hindi (देवनागरी लिपि) with Sanskrit astrological terms. STRICTLY NO English or Hinglish words (no English sentence fragments, no Latin characters, no "growth/success/options"). Use classical terms (सफलता, विकल्प, कार्य सिद्धि, पुरुषार्थ)' : 'dignified, empathetic, and clear English with Vedic terms in parentheses', ".\n\nMODE-SPECIFIC HORARY PROTOCOLS:\n- LOST OBJECT MODE: Provide traditional indicators for direction, relevant house, house lord, relevant significator, sign nature (Movable/Fixed/Dual), element clues (Fire/Earth/Air/Water), and recovery timing. NEVER claim an exact physical location as fact.\n- STOLEN OBJECT MODE: Keep strictly separate from Lost Object. Analyze traditional theft indicators, 7th/8th house, significators, and planetary relationships. DO NOT ACCUSE OR IDENTIFY ANY REAL PERSON AS THE THIEF.\n- MISSING PERSON MODE: Use only traditional Prashna indicators (1st/7th houses, direction, Chara/Sthira sign). DO NOT present a generated location as verified real-world tracking. Clearly state: \"If emergency or safety concerns exist, contact official law enforcement and emergency authorities immediately.\"\n- HEALTH / ROG MODE: Discuss traditional astrological periods and planetary indicators. DO NOT diagnose diseases or prescribe medical treatments. DO NOT claim that a planet proves a medical condition. Must include label: \"Traditional astrological interpretation \u2014 not medical diagnosis.\"\n- YES / NO MODE: Deliver a structured traditional assessment based on Lagnesh-Karyesh sambandh and Moon strength. DO NOT present it as guaranteed certainty.\n- TWO-OPTION DECISION MODE: Compare traditional indicators for Option A and Option B equitably. DO NOT output a forced ranking or guaranteed prediction.\n\nMANDATORY OUTPUT STRUCTURE (You MUST separate into these 3 sections):\n\n### 1. CALCULATED DATA (\u0916\u0917\u094B\u0932\u0940\u092F \u0917\u0923\u0928\u093E \u0935\u093F\u0935\u0930\u0923)\n- \u092A\u094D\u0930\u0936\u094D\u0928 \u0932\u0917\u094D\u0928 (Prashna Ascendant): Exact sign, degree, and Lagnesh\n- \u091A\u0902\u0926\u094D\u0930\u092E\u093E \u0915\u0940 \u0938\u094D\u0925\u093F\u0924\u093F (Moon Position): Sign, House, Nakshatra, and Pada\n- \u0915\u093E\u0930\u094D\u092F \u092D\u093E\u0935 \u090F\u0935\u0902 \u0915\u093E\u0930\u094D\u092F\u0947\u0936 (Significator House & Lord): The house representing the question and its lord\n- \u0932\u0917\u094D\u0928\u0947\u0936-\u0915\u093E\u0930\u094D\u092F\u0947\u0936 \u0938\u092E\u094D\u092C\u0902\u0927 (Lagnesh-Karyesh Sambandh): Conjunction, mutual aspect, or relational dignity from the data\n- \u092E\u0941\u0916\u094D\u092F \u0917\u094B\u091A\u0930 \u092C\u093F\u0902\u0926\u0941 (Key Planetary Positions): Benefic or malefic placements in Kendras/Trikonas\n\n### 2. TRADITIONAL PRASHNA INTERPRETATION (\u092A\u093E\u0930\u0902\u092A\u0930\u093F\u0915 \u092A\u094D\u0930\u0936\u094D\u0928 \u0936\u093E\u0938\u094D\u0924\u094D\u0930 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923)\n- \u092A\u094D\u0930\u091A\u094D\u091B\u0915 \u0915\u093E \u092E\u0928\u094B\u092D\u093E\u0935 (Querent's Mental Disposition): Inferred strictly from Moon's house & sign\n- \u0915\u093E\u0930\u094D\u092F \u0938\u093F\u0926\u094D\u0927\u093F \u0915\u0940 \u0938\u0902\u092D\u093E\u0935\u0928\u093E (Karya Siddhi Probability): Favorable (\u0936\u0941\u092D) / Moderate (\u092E\u0927\u094D\u092F\u092E) / Challenging (\u0938\u0924\u0930\u094D\u0915\u0924\u093E \u0906\u0935\u0936\u094D\u092F\u0915) strictly based on the calculated relationship and benefic support\n- \u0936\u093E\u0938\u094D\u0924\u094D\u0930\u0940\u092F \u092F\u094B\u0917 (Classical Horary Yogas): Any Ithasala, Kendra placement, or relevant classical Horary rules based strictly on calculated positions\n\n### 3. AI EXPLANATION & ACTIONABLE GUIDANCE (\u092E\u093E\u0930\u094D\u0917\u0926\u0930\u094D\u0936\u0928 \u090F\u0935\u0902 \u0935\u093F\u0935\u0947\u0915\u092A\u0942\u0930\u094D\u0923 \u0928\u093F\u0930\u094D\u0923\u092F)\n- Contextual understanding of the querent's question in practical, spiritual terms.\n- Actionable remedies / advice: Purushartha (righteous action), patience, optimal timing, and practical precautions.\n- Clear disclaimer that Prashna reflects the cosmic moment of questioning, not an unchangeable fate.");
                                    promptText = "User Question: \"".concat(question, "\"\nQuestion Timestamp: ").concat(((_c = prashnaKundliData.context) === null || _c === void 0 ? void 0 : _c.formattedDate) || '', " at ").concat(((_d = prashnaKundliData.context) === null || _d === void 0 ? void 0 : _d.formattedTime) || '', " (").concat(((_e = prashnaKundliData.context) === null || _e === void 0 ? void 0 : _e.timezone) || 'Asia/Kolkata', ")\nLocation: ").concat(((_f = prashnaKundliData.context) === null || _f === void 0 ? void 0 : _f.location) || 'Indore, MP', " (Lat: ").concat((_g = prashnaKundliData.context) === null || _g === void 0 ? void 0 : _g.latitude, ", Lon: ").concat((_h = prashnaKundliData.context) === null || _h === void 0 ? void 0 : _h.longitude, ")\n\nCalculated PrashnaKundliData (IMMUTABLE SOURCE OF TRUTH):\n").concat(JSON.stringify(prashnaKundliData, null, 2));
                                    return [4 /*yield*/, (0, centralAiAdapter_1.executeGeminiRequest)(ai, {
                                            prompt: promptText,
                                            systemInstruction: systemInstructions,
                                            language: language,
                                            temperature: 0.2,
                                            timeoutMs: 25000
                                        })];
                                case 5:
                                    aiResult = _p.sent();
                                    if (aiResult.success) {
                                        return [2 /*return*/, res.json({
                                                ok: true,
                                                answer: aiResult.text,
                                                text: aiResult.text,
                                                modelUsed: aiResult.model,
                                                normalized: aiResult
                                            })];
                                    }
                                    status_2 = ((_j = aiResult.error) === null || _j === void 0 ? void 0 : _j.httpStatus) || 500;
                                    return [2 /*return*/, res.status(status_2).json({
                                            ok: false,
                                            errorCode: ((_k = aiResult.error) === null || _k === void 0 ? void 0 : _k.code) || (status_2 === 429 ? 'AI_429_RATE_LIMIT' : 'AI_SERVER_ERROR'),
                                            retryable: (_m = (_l = aiResult.error) === null || _l === void 0 ? void 0 : _l.retryable) !== null && _m !== void 0 ? _m : true,
                                            error: ((_o = aiResult.error) === null || _o === void 0 ? void 0 : _o.message) || 'Failed to generate Prashna AI interpretation',
                                            normalized: aiResult
                                        })];
                                case 6:
                                    error_2 = _p.sent();
                                    console.error('Prashna AI Error:', error_2);
                                    return [2 /*return*/, res.status(500).json({
                                            ok: false,
                                            errorCode: 'AI_UNKNOWN',
                                            retryable: true,
                                            error: error_2.message || 'Unknown error'
                                        })];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Dedicated Daily Life Companion AI Endpoint
                    app.post('/api/daily-companion', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, context, _b, language, apiKey, ai, systemInstructions, promptText, aiResult, parsed, status_3, err_1;
                        var _c, _d, _e;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    _f.trys.push([0, 2, , 3]);
                                    _a = req.body, context = _a.context, _b = _a.language, language = _b === void 0 ? 'Hindi' : _b;
                                    if (!context || !context.profile) {
                                        return [2 /*return*/, res.status(400).json({
                                                ok: false,
                                                errorCode: 'CONTEXT_MISSING',
                                                error: 'Daily companion deterministic context is required.'
                                            })];
                                    }
                                    apiKey = process.env.GEMINI_API_KEY;
                                    if (!apiKey) {
                                        return [2 /*return*/, res.status(500).json({
                                                ok: false,
                                                errorCode: 'API_KEY_MISSING',
                                                error: 'GEMINI_API_KEY environment variable is required for AI Companion interpretation.'
                                            })];
                                    }
                                    ai = new genai_1.GoogleGenAI({
                                        apiKey: apiKey,
                                        httpOptions: {
                                            headers: {
                                                'User-Agent': 'aistudio-build'
                                            }
                                        }
                                    });
                                    systemInstructions = "You are JeevanDarpan Daily Life Companion AI (\u091C\u0940\u0935\u0928 \u0926\u0930\u094D\u092A\u0923 \u0926\u0948\u0928\u093F\u0915 \u0938\u093E\u0925\u0940).\nYou are a caring, wise, compassionate mentor and friend.\n\nCRITICAL DATA INTEGRITY & ETHICAL MANDATES:\n1. Use ONLY the supplied calculated deterministic context (Master Birth Profile, Dasha, Numerology, Panchatattva, Weekday Lord).\n2. AI MUST NEVER calculate astronomical positions itself.\n3. AI MUST NEVER invent: planetary degrees, houses, Nakshatra, Dasha dates, transit positions, numerology values.\n4. Distinguish clearly between:\n   - Calculated Fact (deterministic truth)\n   - Traditional Vedic Interpretation\n   - Practical Guidance (compassionate, actionable)\n   - Uncertainty, Freewill (\u092A\u0941\u0930\u0941\u0937\u093E\u0930\u094D\u0925) and Karma\n5. NEVER state uncertain future events as guaranteed facts.\n6. Tone: Warm, uplifting, dignified. NEVER fearmongering, fatalistic, or superstitious.\n7. Language: ".concat(language === 'Hindi' || language === 'hi' ? '100% authentic, inspiring, dignified Hindi (शुद्ध एवं सहज हिंदी - देवनागरी लिपि). STRICTLY NO English or Hinglish words.' : 'Warm, inspiring, clear English', ".\n8. Strictly NO medical diagnosis or medical claims.\n9. Strictly NO guaranteed investment, speculative trading, or financial guarantees.\n\nReturn a valid JSON object matching this schema:\n{\n  \"ok\": true,\n  \"enrichedCards\": {\n    \"today_start\": { \"practicalGuidance\": \"...\", \"actionItem\": \"...\" },\n    \"goal_sankalp\": { \"practicalGuidance\": \"...\", \"actionItem\": \"...\" },\n    \"work_focus\": { \"practicalGuidance\": \"...\", \"actionItem\": \"...\" },\n    \"finance_decisions\": { \"practicalGuidance\": \"...\", \"actionItem\": \"...\" },\n    \"family_harmony\": { \"practicalGuidance\": \"...\", \"actionItem\": \"...\" },\n    \"travel_movement\": { \"practicalGuidance\": \"...\", \"actionItem\": \"...\" },\n    \"wellness_vitality\": { \"practicalGuidance\": \"...\", \"actionItem\": \"...\" },\n    \"todays_karma\": { \"practicalGuidance\": \"...\", \"actionItem\": \"...\" },\n    \"what_to_avoid\": { \"practicalGuidance\": \"...\", \"actionItem\": \"...\" },\n    \"core_message\": { \"practicalGuidance\": \"...\", \"quoteOrMantra\": \"...\" },\n    \"night_closure\": { \"practicalGuidance\": \"...\", \"actionItem\": \"...\" }\n  }\n}");
                                    promptText = "Please enrich the daily guidance for this profile based strictly on the supplied deterministic data:\nTarget Date: ".concat(context.date, " (").concat(context.formattedDate, ")\nUser Profile: ").concat(context.profile.name, ", born ").concat(context.profile.dob, " ").concat(context.profile.time, ", ").concat(context.profile.place, "\nPersonal Day: ").concat(context.numerology.personalDay, " (").concat(context.numerology.personalDayTheme, ")\nMoolank (Driver): ").concat(context.numerology.birthNumber, ", Bhagyank (Conductor): ").concat(context.numerology.destinyNumber, "\nCurrent Dasha: ").concat(context.dasha.mahadasha, " Mahadasha, ").concat(context.dasha.antardasha, " Antardasha\nPanchatattva: Dominant ").concat(context.panchatattva.dominant, ", Weakest ").concat(context.panchatattva.weakest, "\nDay Lord: ").concat(context.panchang.dayLordHindi, " (").concat(context.panchang.dayOfWeek, ")\nLagna: ").concat(context.masterKundliSummary.lagnaRashi, ", Moon: ").concat(context.masterKundliSummary.moonRashi, "\n\nRespond with strictly valid JSON only.");
                                    return [4 /*yield*/, (0, centralAiAdapter_1.executeGeminiRequest)(ai, {
                                            prompt: promptText,
                                            systemInstruction: systemInstructions,
                                            language: language,
                                            temperature: 0.3,
                                            responseMimeType: 'application/json',
                                            timeoutMs: 18000
                                        })];
                                case 1:
                                    aiResult = _f.sent();
                                    if (aiResult.success) {
                                        try {
                                            parsed = JSON.parse(aiResult.text);
                                            if (parsed && parsed.enrichedCards) {
                                                return [2 /*return*/, res.json({
                                                        ok: true,
                                                        enrichedCards: parsed.enrichedCards,
                                                        modelUsed: aiResult.model,
                                                        normalized: aiResult
                                                    })];
                                            }
                                        }
                                        catch (parseErr) {
                                            console.warn('Failed to parse daily companion JSON response:', parseErr);
                                        }
                                    }
                                    status_3 = ((_c = aiResult.error) === null || _c === void 0 ? void 0 : _c.httpStatus) || 500;
                                    return [2 /*return*/, res.status(status_3).json({
                                            ok: false,
                                            errorCode: ((_d = aiResult.error) === null || _d === void 0 ? void 0 : _d.code) || 'AI_FALLBACK',
                                            error: ((_e = aiResult.error) === null || _e === void 0 ? void 0 : _e.message) || 'AI enrichment unavailable, use deterministic fallback.',
                                            normalized: aiResult
                                        })];
                                case 2:
                                    err_1 = _f.sent();
                                    console.error('Daily Companion AI Error:', err_1);
                                    return [2 /*return*/, res.status(500).json({
                                            ok: false,
                                            errorCode: 'AI_ERROR',
                                            error: err_1.message || 'Failed to process daily companion AI.'
                                        })];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post('/api/calculate', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, dob, time, latitude, longitude, timezone, _b, ayanamsa, isTimeUnknown, numLat, numLon, cleanDob, cleanTime, candidateFormats, dt, _i, candidateFormats_1, fmt, candidate, isoCombined, isoDob, dtUtc, hourUT, jd_1, tropicalFlags_1, selectedAyanamsa, ayanamsaValue_1, siderealFlags, calcMath_1, planetNames, planets_1, sunLong_1, houseDataTropical, houses_1, lagnaLongTropical, lagnaLongSidereal, lagnaMath, lagna_1, d1Chart_1, ZODIAC_LORDS_1, i, currentRashi, bhavaChart_1, canonicalDob, canonicalTime, metadata, resultPayload;
                        return __generator(this, function (_c) {
                            try {
                                _a = req.body, dob = _a.dob, time = _a.time, latitude = _a.latitude, longitude = _a.longitude, timezone = _a.timezone, _b = _a.ayanamsa, ayanamsa = _b === void 0 ? 'Lahiri' : _b;
                                isTimeUnknown = req.body.timeUnknown === true ||
                                    req.body.isUnknownTime === true ||
                                    (typeof time === 'string' && time.trim().toLowerCase() === 'unknown');
                                if (!dob || (!isTimeUnknown && !time) || latitude == null || longitude == null || !timezone) {
                                    return [2 /*return*/, res.status(400).json({
                                            ok: false,
                                            errorCode: 'MISSING_PARAMETERS',
                                            error: 'Missing required parameters'
                                        })];
                                }
                                if (typeof timezone !== 'string' || !luxon_1.IANAZone.isValidSpecifier(timezone)) {
                                    return [2 /*return*/, res.status(400).json({
                                            ok: false,
                                            errorCode: 'INVALID_TIMEZONE',
                                            error: 'Invalid or unsupported IANA timezone'
                                        })];
                                }
                                numLat = Number(latitude);
                                numLon = Number(longitude);
                                if (isNaN(numLat) || numLat < -90 || numLat > 90 || isNaN(numLon) || numLon < -180 || numLon > 180) {
                                    return [2 /*return*/, res.status(400).json({
                                            ok: false,
                                            errorCode: 'INVALID_COORDINATES',
                                            error: 'Latitude (-90 to +90) and Longitude (-180 to +180) must be valid coordinates'
                                        })];
                                }
                                cleanDob = typeof dob === 'string' ? dob.trim() : '';
                                cleanTime = typeof time === 'string' ? time.trim().replace(/\s+/g, ' ') : '';
                                if (isTimeUnknown && (!cleanTime || cleanTime.toLowerCase() === 'unknown')) {
                                    cleanTime = '12:00 PM';
                                }
                                if (!cleanDob || !cleanTime) {
                                    return [2 /*return*/, res.status(400).json({
                                            ok: false,
                                            errorCode: 'MISSING_PARAMETERS',
                                            error: 'Missing required parameters'
                                        })];
                                }
                                candidateFormats = [
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
                                dt = null;
                                for (_i = 0, candidateFormats_1 = candidateFormats; _i < candidateFormats_1.length; _i++) {
                                    fmt = candidateFormats_1[_i];
                                    candidate = luxon_1.DateTime.fromFormat("".concat(cleanDob, " ").concat(cleanTime), fmt, { zone: timezone });
                                    if (candidate.isValid) {
                                        dt = candidate;
                                        break;
                                    }
                                }
                                // Fallback to ISO combined string
                                if (!dt || !dt.isValid) {
                                    isoCombined = luxon_1.DateTime.fromISO("".concat(cleanDob, "T").concat(cleanTime), { zone: timezone });
                                    if (isoCombined.isValid) {
                                        dt = isoCombined;
                                    }
                                }
                                // Fallback to ISO date-only
                                if (!dt || !dt.isValid) {
                                    isoDob = luxon_1.DateTime.fromISO(cleanDob, { zone: timezone });
                                    if (isoDob.isValid) {
                                        dt = isoDob;
                                    }
                                }
                                if (!dt || !dt.isValid) {
                                    return [2 /*return*/, res.status(400).json({
                                            ok: false,
                                            errorCode: 'INVALID_DATETIME_FORMAT',
                                            error: 'Invalid date/time format'
                                        })];
                                }
                                dtUtc = dt.toUTC();
                                hourUT = dtUtc.hour + (dtUtc.minute / 60) + (dtUtc.second / 3600);
                                jd_1 = sweph.julianDay(dtUtc.year, dtUtc.month, dtUtc.day, hourUT, swisseph_1.Calendar.Gregorian);
                                tropicalFlags_1 = swisseph_1.Flag.Speed;
                                selectedAyanamsa = ayanamsa === 'Raman' ? swisseph_1.Ayanamsa.Raman : swisseph_1.Ayanamsa.Lahiri;
                                sweph.setSiderealMode(selectedAyanamsa);
                                ayanamsaValue_1 = sweph.ayanamsa(jd_1);
                                siderealFlags = swisseph_1.Flag.Sidereal | swisseph_1.Flag.Speed;
                                calcMath_1 = function (sidereal) {
                                    var norm = ((sidereal % 360) + 360) % 360;
                                    return {
                                        rashi: Math.floor(norm / 30) + 1,
                                        degree: norm % 30,
                                        nakshatra: Math.floor(norm / (360 / 27)) + 1,
                                        pada: Math.floor((norm % (360 / 27)) / (360 / 108)) + 1
                                    };
                                };
                                planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
                                planets_1 = {};
                                planetNames.forEach(function (name) {
                                    var tropLong = 0;
                                    var sidLong = 0;
                                    var isRet = false;
                                    var lat = 0;
                                    if (name === 'Ketu') {
                                        var rahu = planets_1['Rahu'];
                                        tropLong = (rahu.tropicalLongitude + 180) % 360;
                                        sidLong = (rahu.siderealLongitude + 180) % 360;
                                        isRet = rahu.isRetrograde;
                                        lat = -rahu.latitude;
                                    }
                                    else {
                                        var body = getBody(name);
                                        var trop = sweph.calc(jd_1, body, tropicalFlags_1);
                                        tropLong = trop.longitude;
                                        sidLong = (tropLong - ayanamsaValue_1 + 360) % 360;
                                        isRet = trop.longitudeSpeed < 0;
                                        lat = trop.latitude;
                                    }
                                    var math = calcMath_1(sidLong);
                                    planets_1[name] = {
                                        name: name,
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
                                sunLong_1 = planets_1['Sun'].siderealLongitude;
                                Object.keys(planets_1).forEach(function (name) {
                                    if (name !== 'Sun' && name !== 'Rahu' && name !== 'Ketu') {
                                        var p = planets_1[name];
                                        var dist = Math.min(Math.abs(p.siderealLongitude - sunLong_1), 360 - Math.abs(p.siderealLongitude - sunLong_1));
                                        // Simplified general combustion limit: 8 degrees (will refine with rules later)
                                        p.isCombust = dist <= 8;
                                    }
                                });
                                houseDataTropical = sweph.houses(jd_1, latitude, longitude, swisseph_1.HouseSystem.Placidus, tropicalFlags_1);
                                houses_1 = {};
                                houseDataTropical.cusps.forEach(function (cuspLongTropical, index) {
                                    var cuspLongSidereal = (cuspLongTropical - ayanamsaValue_1 + 360) % 360;
                                    houses_1[index + 1] = {
                                        number: index + 1,
                                        cuspLongitude: cuspLongSidereal,
                                        rashi: Math.floor(cuspLongSidereal / 30) + 1,
                                        degree: cuspLongSidereal % 30
                                    };
                                });
                                lagnaLongTropical = houseDataTropical.ascendant;
                                lagnaLongSidereal = (lagnaLongTropical - ayanamsaValue_1 + 360) % 360;
                                lagnaMath = calcMath_1(lagnaLongSidereal);
                                lagna_1 = {
                                    name: 'Lagna',
                                    tropicalLongitude: lagnaLongTropical,
                                    siderealLongitude: lagnaLongSidereal,
                                    degree: lagnaMath.degree,
                                    rashi: lagnaMath.rashi,
                                    rashiName: RASHI_NAMES[lagnaMath.rashi - 1],
                                    nakshatra: lagnaMath.nakshatra,
                                    pada: lagnaMath.pada
                                };
                                d1Chart_1 = {};
                                ZODIAC_LORDS_1 = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
                                for (i = 1; i <= 12; i++) {
                                    currentRashi = ((lagna_1.rashi + i - 2) % 12) + 1;
                                    d1Chart_1[i] = {
                                        houseNumber: i,
                                        rashi: currentRashi,
                                        rashiName: RASHI_NAMES[currentRashi - 1],
                                        signLord: ZODIAC_LORDS_1[currentRashi - 1],
                                        planetsOccupying: [],
                                        isBhava: false
                                    };
                                }
                                Object.values(planets_1).forEach(function (p) {
                                    var d1House = ((p.rashi - lagna_1.rashi + 12) % 12) + 1;
                                    p.d1House = d1House;
                                    d1Chart_1[d1House].planetsOccupying.push(p.name);
                                });
                                bhavaChart_1 = {};
                                Object.keys(houses_1).forEach(function (k) {
                                    var h = houses_1[Number(k)];
                                    bhavaChart_1[h.number] = {
                                        houseNumber: h.number,
                                        rashi: h.rashi,
                                        rashiName: RASHI_NAMES[h.rashi - 1],
                                        signLord: ZODIAC_LORDS_1[h.rashi - 1],
                                        planetsOccupying: [], // Complex span assignment pending
                                        cuspLongitude: h.cuspLongitude,
                                        isBhava: true
                                    };
                                });
                                canonicalDob = dt.toFormat('dd MMMM yyyy');
                                canonicalTime = isTimeUnknown ? '12:00 PM' : dt.toFormat('hh:mm a');
                                metadata = {
                                    engine: 'Swiss Ephemeris',
                                    ephemerisVersion: sweph.version,
                                    ayanamsa: ayanamsa === 'Raman' ? 'Raman' : 'Lahiri',
                                    ayanamsaValue: ayanamsaValue_1,
                                    nodeType: 'True Node',
                                    houseSystem: 'Placidus',
                                    timestamp: new Date().toISOString(),
                                    inputTimezone: timezone,
                                    julianDay: jd_1,
                                    birthUtcTime: dtUtc.toISO(),
                                    timeUnknown: isTimeUnknown
                                };
                                resultPayload = {
                                    birthProfile: {
                                        dob: canonicalDob,
                                        time: canonicalTime,
                                        rawDob: dob,
                                        rawTime: time,
                                        timeUnknown: isTimeUnknown,
                                        latitude: latitude,
                                        longitude: longitude,
                                        timezone: timezone
                                    },
                                    lagna: lagna_1,
                                    planets: planets_1,
                                    d1Chart: d1Chart_1,
                                    bhavaChart: bhavaChart_1,
                                    vimshottariDasha: null,
                                    ayanamsa: ayanamsa,
                                    metadata: metadata,
                                    warnings: isTimeUnknown ? ['Birth time is unknown; calculations reference 12:00 PM local time.'] : []
                                };
                                try {
                                    resultPayload.vimshottariDasha = vimshottari_1.VimshottariEngine.calculate(resultPayload);
                                }
                                catch (dashaErr) {
                                    console.warn('Vimshottari Dasha calculation note:', dashaErr);
                                }
                                res.json(resultPayload);
                            }
                            catch (error) {
                                console.error('Calculation Error:', error);
                                res.status(500).json({ error: error.message || 'Failed to calculate astronomy data' });
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    // Dedicated Real Transit Calculation Endpoint using Swiss Ephemeris
                    app.post('/api/transit', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, date, time, latitude, longitude, timezone, _b, ayanamsa, targetDate, targetTime, targetLat, targetLon, targetTz, dt, dtUtc, hourUT, jd_2, tropicalFlags_2, selectedAyanamsa, ayanamsaValue_2, calcMath_2, planetNames, planets_2, houseDataTropical, lagnaLongTropical, lagnaLongSidereal, lagnaMath, ascendant;
                        return __generator(this, function (_c) {
                            try {
                                _a = req.body, date = _a.date, time = _a.time, latitude = _a.latitude, longitude = _a.longitude, timezone = _a.timezone, _b = _a.ayanamsa, ayanamsa = _b === void 0 ? 'Lahiri' : _b;
                                targetDate = date || new Date().toISOString().split('T')[0];
                                targetTime = time || new Date().toTimeString().slice(0, 8);
                                targetLat = latitude != null ? Number(latitude) : 22.7196;
                                targetLon = longitude != null ? Number(longitude) : 75.8577;
                                targetTz = timezone || 'Asia/Kolkata';
                                dt = luxon_1.DateTime.fromFormat("".concat(targetDate, " ").concat(targetTime), 'yyyy-MM-dd HH:mm:ss', { zone: targetTz });
                                if (!dt.isValid) {
                                    dt = luxon_1.DateTime.fromFormat("".concat(targetDate, " ").concat(targetTime), 'yyyy-MM-dd HH:mm', { zone: targetTz });
                                }
                                if (!dt.isValid) {
                                    dt = luxon_1.DateTime.fromISO("".concat(targetDate, "T").concat(targetTime), { zone: targetTz });
                                }
                                if (!dt.isValid) {
                                    dt = luxon_1.DateTime.fromISO(targetDate, { zone: targetTz });
                                }
                                if (!dt.isValid) {
                                    dt = luxon_1.DateTime.now().setZone(targetTz);
                                }
                                dtUtc = dt.toUTC();
                                hourUT = dtUtc.hour + (dtUtc.minute / 60) + (dtUtc.second / 3600);
                                jd_2 = sweph.julianDay(dtUtc.year, dtUtc.month, dtUtc.day, hourUT, swisseph_1.Calendar.Gregorian);
                                tropicalFlags_2 = swisseph_1.Flag.Speed;
                                selectedAyanamsa = ayanamsa === 'Raman' ? swisseph_1.Ayanamsa.Raman : swisseph_1.Ayanamsa.Lahiri;
                                sweph.setSiderealMode(selectedAyanamsa);
                                ayanamsaValue_2 = sweph.ayanamsa(jd_2);
                                calcMath_2 = function (sidereal) {
                                    var norm = ((sidereal % 360) + 360) % 360;
                                    return {
                                        rashi: Math.floor(norm / 30) + 1,
                                        degree: norm % 30,
                                        nakshatra: Math.floor(norm / (360 / 27)) + 1,
                                        pada: Math.floor((norm % (360 / 27)) / (360 / 108)) + 1
                                    };
                                };
                                planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
                                planets_2 = {};
                                planetNames.forEach(function (name) {
                                    var tropLong = 0;
                                    var sidLong = 0;
                                    var isRet = false;
                                    var lat = 0;
                                    if (name === 'Ketu') {
                                        var rahu = planets_2['Rahu'];
                                        tropLong = (rahu.tropicalLongitude + 180) % 360;
                                        sidLong = (rahu.siderealLongitude + 180) % 360;
                                        isRet = rahu.isRetrograde;
                                        lat = -rahu.latitude;
                                    }
                                    else {
                                        var body = getBody(name);
                                        var trop = sweph.calc(jd_2, body, tropicalFlags_2);
                                        tropLong = trop.longitude;
                                        sidLong = (tropLong - ayanamsaValue_2 + 360) % 360;
                                        isRet = trop.longitudeSpeed < 0;
                                        lat = trop.latitude;
                                    }
                                    var math = calcMath_2(sidLong);
                                    planets_2[name] = {
                                        name: name,
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
                                houseDataTropical = sweph.houses(jd_2, targetLat, targetLon, 'P');
                                lagnaLongTropical = houseDataTropical.ascendant;
                                lagnaLongSidereal = (lagnaLongTropical - ayanamsaValue_2 + 360) % 360;
                                lagnaMath = calcMath_2(lagnaLongSidereal);
                                ascendant = {
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
                                    planets: planets_2,
                                    ascendant: ascendant,
                                    metadata: {
                                        engine: 'Swiss Ephemeris',
                                        ephemerisVersion: sweph.version,
                                        ayanamsa: ayanamsa === 'Raman' ? 'Raman' : 'Lahiri',
                                        ayanamsaValue: ayanamsaValue_2,
                                        timestamp: new Date().toISOString(),
                                        evaluationDate: targetDate,
                                        evaluationTime: targetTime,
                                        julianDay: jd_2
                                    }
                                });
                            }
                            catch (err) {
                                console.error('Transit calculation error:', err);
                                res.status(500).json({
                                    ok: false,
                                    status: 'NOT_AVAILABLE',
                                    error: err.message || 'Failed to calculate transit'
                                });
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    // Dedicated Future Transit Interval Scanning Endpoint using Swiss Ephemeris
                    app.post('/api/future-transit', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, startDate, endDate, _b, mahadashaLord, _c, antardashaLord, _d, timezone, _e, ayanamsa, _f, targetHouses, _g, adverseHouses, _h, primaryCuspSubLord, _j, nativeLagnaRashi, startMs, endMs, engine, kpData, result;
                        return __generator(this, function (_k) {
                            try {
                                _a = req.body, startDate = _a.startDate, endDate = _a.endDate, _b = _a.mahadashaLord, mahadashaLord = _b === void 0 ? 'Jupiter' : _b, _c = _a.antardashaLord, antardashaLord = _c === void 0 ? 'Ketu' : _c, _d = _a.timezone, timezone = _d === void 0 ? 'Asia/Kolkata' : _d, _e = _a.ayanamsa, ayanamsa = _e === void 0 ? 'Lahiri' : _e, _f = _a.targetHouses, targetHouses = _f === void 0 ? [] : _f, _g = _a.adverseHouses, adverseHouses = _g === void 0 ? [] : _g, _h = _a.primaryCuspSubLord, primaryCuspSubLord = _h === void 0 ? '' : _h, _j = _a.nativeLagnaRashi, nativeLagnaRashi = _j === void 0 ? 1 : _j;
                                startMs = new Date(startDate).getTime();
                                endMs = new Date(endDate).getTime();
                                if (isNaN(startMs) || isNaN(endMs) || startMs >= endMs) {
                                    return [2 /*return*/, res.status(400).json({
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
                                        })];
                                }
                                engine = new futureTransitEngine_1.FutureTransitEngine();
                                kpData = req.body.kpResult || {
                                    system: 'KP',
                                    cuspData: [],
                                    planetData: [],
                                    availability: 'AVAILABLE',
                                    rules: [],
                                    warnings: [],
                                    metadata: {},
                                    significators: { byPlanet: {}, byHouse: {} }
                                };
                                result = engine.executeInProcessScan(sweph, { startDate: startDate, endDate: endDate, mahadashaLord: mahadashaLord, antardashaLord: antardashaLord }, null, kpData, targetHouses, adverseHouses, primaryCuspSubLord, {
                                    startMs: startMs,
                                    endMs: endMs,
                                    latitude: 22.7196,
                                    longitude: 75.8577,
                                    timezone: timezone,
                                    ayanamsa: ayanamsa,
                                    nativeLagnaRashi: nativeLagnaRashi
                                });
                                res.json(result);
                            }
                            catch (err) {
                                console.error('Future transit calculation error:', err);
                                res.status(500).json({
                                    ok: false,
                                    status: 'CALCULATION_ERROR',
                                    error: err.message || 'Failed to scan future transit'
                                });
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    extractSessionToken = function (req) {
                        var authHeader = req.headers['authorization'];
                        if (authHeader && authHeader.startsWith('Bearer ')) {
                            return authHeader.substring(7).trim();
                        }
                        var customHeader = req.headers['x-guardian-token'];
                        if (typeof customHeader === 'string')
                            return customHeader.trim();
                        return undefined;
                    };
                    loginAttempts = new Map();
                    // 0a. Owner PIN Status Endpoint
                    app.get('/api/guardian/pin/status', function (req, res) {
                        var status = (0, guardianAuthorizationService_1.getOwnerPinStatus)();
                        res.json(__assign({ ok: true }, status));
                    });
                    // 0b. Owner PIN Setup / Update / Reset Endpoint
                    app.post('/api/guardian/pin/setup', function (req, res) {
                        var token = extractSessionToken(req);
                        var _a = req.body, newPin = _a.newPin, oldPin = _a.oldPin, masterKey = _a.masterKey;
                        var result = (0, guardianAuthorizationService_1.setServerOwnerPin)(newPin, {
                            oldPin: oldPin,
                            masterKey: masterKey,
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
                    app.post('/api/guardian/login', function (req, res) {
                        var ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
                        var now = Date.now();
                        var rate = loginAttempts.get(ip);
                        if (rate && rate.resetAt > now && rate.count >= 5) {
                            return res.status(429).json({
                                ok: false,
                                error: 'Too many authentication attempts. Please wait 1 minute before retrying.'
                            });
                        }
                        var pin = req.body.pin;
                        var authResult = (0, guardianAuthorizationService_1.authenticateOwner)(pin, ip);
                        if (!authResult.success) {
                            var currentRate = rate && rate.resetAt > now ? rate.count + 1 : 1;
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
                    app.get('/api/guardian/session', function (req, res) {
                        var token = extractSessionToken(req);
                        var session = (0, guardianAuthorizationService_1.validateSession)(token);
                        res.json({
                            valid: session.valid,
                            role: session.role || 'ANONYMOUS',
                            userId: session.userId || null
                        });
                    });
                    // 3. Central Permission Authorization Endpoint
                    app.post('/api/guardian/authorize', function (req, res) {
                        var token = extractSessionToken(req);
                        var session = (0, guardianAuthorizationService_1.validateSession)(token);
                        var _a = req.body, action = _a.action, targetModule = _a.targetModule, affectedFiles = _a.affectedFiles, _b = _a.severity, severity = _b === void 0 ? 'WARN' : _b, approvalId = _a.approvalId, clientPayload = _a.clientPayload;
                        var actor = {
                            userId: session.userId || 'anonymous_client',
                            role: session.role || 'ANONYMOUS',
                            sessionToken: token,
                            ipAddress: req.ip || req.headers['x-forwarded-for']
                        };
                        var authResult = (0, guardianAuthorizationService_1.authorizeGuardianAction)({
                            actor: actor,
                            action: action || 'UNSPECIFIED_ACTION',
                            targetModule: targetModule || 'General',
                            affectedFiles: affectedFiles || [],
                            severity: severity,
                            approvalId: approvalId,
                            clientPayload: clientPayload
                        });
                        var httpStatus = authResult.decision === 'ALLOWED' ? 200 :
                            authResult.decision === 'APPROVAL_REQUIRED' ? 403 :
                                authResult.decision === 'CRITICAL_LOCK' ? 423 : 401;
                        res.status(httpStatus).json({
                            ok: authResult.decision === 'ALLOWED',
                            decision: authResult.decision,
                            reason: authResult.reason
                        });
                    });
                    // 4. Create Approval Request Endpoint
                    app.post('/api/guardian/approvals/request', function (req, res) {
                        var _a;
                        var token = extractSessionToken(req);
                        var _b = req.body, action = _b.action, targetModule = _b.targetModule, affectedFiles = _b.affectedFiles, _c = _b.severity, severity = _c === void 0 ? 'WARN' : _c, reason = _b.reason, backupRequired = _b.backupRequired;
                        var result = (0, guardianAuthorizationService_1.createServerApprovalRequest)({
                            sessionToken: token || '',
                            action: action || 'CHANGE_MODULE',
                            targetModule: targetModule || 'General',
                            affectedFiles: affectedFiles || [],
                            severity: severity,
                            reason: reason || 'Guardian maintenance change',
                            backupRequired: backupRequired !== false
                        });
                        if (!result.success) {
                            return res.status(((_a = result.error) === null || _a === void 0 ? void 0 : _a.includes('CRITICAL_LOCK')) ? 423 : 403).json({
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
                    app.post('/api/guardian/approvals/:id/approve', function (req, res) {
                        var token = extractSessionToken(req);
                        var id = req.params.id;
                        var result = (0, guardianAuthorizationService_1.approveServerRequest)(token || '', id);
                        if (!result.success) {
                            return res.status(403).json({
                                ok: false,
                                error: result.error
                            });
                        }
                        res.json({
                            ok: true,
                            message: "Approval request ".concat(id, " successfully authorized by Owner.")
                        });
                    });
                    // 6. Rollback Request Endpoint
                    app.post('/api/guardian/approvals/:id/rollback', function (req, res) {
                        var token = extractSessionToken(req);
                        var snapshotId = req.body.snapshotId;
                        if (!snapshotId) {
                            return res.status(400).json({ ok: false, error: 'snapshotId is required for rollback.' });
                        }
                        var result = (0, guardianAuthorizationService_1.executeServerRollback)(token || '', snapshotId);
                        if (!result.success) {
                            return res.status(403).json({
                                ok: false,
                                error: result.error
                            });
                        }
                        res.json({
                            ok: true,
                            message: "Successfully rolled back to snapshot ".concat(snapshotId)
                        });
                    });
                    // 7. Audit Logs Endpoint
                    app.get('/api/guardian/audit-logs', function (req, res) {
                        var token = extractSessionToken(req);
                        var logs = (0, guardianAuthorizationService_1.getServerAuditLogs)(token);
                        res.json({
                            ok: true,
                            logs: logs
                        });
                    });
                    // 8. Create Backup Snapshot Endpoint
                    app.post('/api/guardian/backups/create', function (req, res) {
                        var token = extractSessionToken(req);
                        var session = (0, guardianAuthorizationService_1.validateSession)(token);
                        if (!session.valid || session.role !== 'OWNER') {
                            return res.status(403).json({ ok: false, error: 'Unauthorized: Owner session required.' });
                        }
                        var _a = req.body, label = _a.label, data = _a.data;
                        var snapshotId = (0, guardianAuthorizationService_1.createServerBackup)(label || 'Manual Snapshot', session.userId, data);
                        res.json({
                            ok: true,
                            snapshotId: snapshotId
                        });
                    });
                    // 9. Restore Backup Snapshot Endpoint
                    app.post('/api/guardian/backups/restore', function (req, res) {
                        var token = extractSessionToken(req);
                        var snapshotId = req.body.snapshotId;
                        if (!snapshotId) {
                            return res.status(400).json({ ok: false, error: 'snapshotId is required.' });
                        }
                        var result = (0, guardianAuthorizationService_1.executeServerRollback)(token || '', snapshotId);
                        if (!result.success) {
                            return res.status(403).json({ ok: false, error: result.error });
                        }
                        res.json({
                            ok: true,
                            message: "Snapshot ".concat(snapshotId, " successfully restored.")
                        });
                    });
                    // Serve static font files for PDF Unicode generation
                    app.use('/fonts', express_1.default.static(path_1.default.join(process.cwd(), 'public/fonts')));
                    if (!(process.env.NODE_ENV !== "production")) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, vite_1.createServer)({
                            server: {
                                middlewareMode: true,
                                hmr: {
                                    server: server,
                                },
                            },
                            appType: "spa",
                        })];
                case 2:
                    vite = _a.sent();
                    app.use(vite.middlewares);
                    return [3 /*break*/, 4];
                case 3:
                    distPath_1 = path_1.default.join(process.cwd(), 'dist');
                    app.use(express_1.default.static(distPath_1));
                    app.get('*', function (req, res) {
                        res.sendFile(path_1.default.join(distPath_1, 'index.html'));
                    });
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
startServer();
