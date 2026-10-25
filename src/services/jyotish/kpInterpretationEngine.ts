import { KPAnalysisResult, KPPlanetData } from './kpEngine';
import {
  KPJudgmentOutput,
  KPQuestionCategory,
  KP_EVENT_HOUSE_MAPPINGS
} from '../../types/jyotish/kpJudgment';
import {
  KPDeepInterpretationResult,
  KPIntFactor,
  KPKeyHouseInterpretation,
  KPCuspInterpretation,
  KPRulingPlanetInterpretation,
  KPOverallStrength,
  KPResultType,
  KPLocalizedText
} from '../../types/jyotish/kpInterpretation';

const HINDI_PLANET_NAMES: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगल',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु'
};

function getLocalizedPlanetName(planet: string): { en: string; hi: string } {
  return {
    en: planet,
    hi: HINDI_PLANET_NAMES[planet] || planet
  };
}

export class KpInterpretationEngine {
  /**
   * Generates a deep, humanized, and transparent user interpretation
   * strictly consuming existing deterministic KP calculations.
   * ABSOLUTELY NO recalculation or invention of new astrology.
   */
  public interpret(
    judgment: KPJudgmentOutput,
    kpResult: KPAnalysisResult
  ): KPDeepInterpretationResult {
    const isInsufficient =
      judgment.outcome === 'INSUFFICIENT_DATA' ||
      !kpResult ||
      kpResult.availability === 'NOT_AVAILABLE';

    if (isInsufficient) {
      return this.buildInsufficientDataResult(judgment);
    }

    const category = judgment.category;
    const mapping = KP_EVENT_HOUSE_MAPPINGS[category] || KP_EVENT_HOUSE_MAPPINGS.career_job;

    // 1. Determine Qualitative Strength and Result Type
    const { overallStrength, overallStrengthLabel, resultType } = this.evaluateStrengthAndType(judgment);

    // 2. Build Category-Specific Direct Answer (Human-centric first)
    const directAnswer = this.buildDirectAnswer(category, resultType, overallStrength, judgment);

    // 3. Build Supportive, Obstacle, and Mixed Factors
    const supportiveFactors = this.buildSupportiveFactors(judgment, kpResult);
    const obstacleFactors = this.buildObstacleFactors(judgment, kpResult);
    const mixedFactors = this.buildMixedFactors(judgment, kpResult, supportiveFactors, obstacleFactors);

    // 4. Build Contradiction Analysis
    const contradictionAnalysis = this.buildContradictionAnalysis(
      category,
      supportiveFactors,
      obstacleFactors,
      judgment
    );

    // 5. Cusp Sub Lord Interpretation
    const cuspInterpretation = this.buildCuspInterpretation(judgment);

    // 6. Ruling Planet Interpretation
    const rulingPlanetInterpretation = this.buildRulingPlanetInterpretation(judgment);

    // 7. Key House Meaning & Status
    const keyHouseInterpretations = this.buildKeyHouseInterpretations(judgment, kpResult);

    // 8. Grounded Practical Guidance
    const practicalGuidance = this.buildPracticalGuidance(category, resultType, judgment);

    // 9. Safety Notes (Health & Financial caution)
    const safetyNote = this.detectSafetyNote(judgment.question, category);

    // 10. Dignified Uncertainty & Philosophy Note
    const uncertaintyNote: KPLocalizedText = {
      en: 'This interpretation is based strictly on classical KP Horary principles and deterministic mathematical significators. Astrology provides directional signals and traditional indicators, not absolute fate. Human effort, clarity of thought, and ground reality remain sovereign.',
      hi: 'यह व्याख्या विशुद्ध रूप से पारंपरिक कृष्णमूर्ति पद्धति (KP) के गणितीय कार्येशों और कस्प उप-स्वामियों पर आधारित है। ज्योतिष संभावित दिशा एवं पारम्परिक प्रवृत्तियों का संकेत करता है, किसी अटल नियति का नहीं। आपका सतत प्रयास, विवेकपूर्ण निर्णय और ज़मीनी वास्तविकता ही सर्वोपरि हैं।'
    };

    return {
      id: judgment.id,
      timestamp: judgment.timestamp,
      question: judgment.question,
      category,
      categoryLabel: judgment.categoryLabel,
      questionSummary: {
        en: `Inquiry regarding ${mapping.labelEn} focusing on Houses ${judgment.targetHouses.join(', ')}.`,
        hi: `${mapping.labelHi} से सम्बंधित प्रश्न (मुख्य लक्षित भाव: ${judgment.targetHouses.join(', ')})।`
      },
      directAnswer,
      resultType,
      overallStrength,
      overallStrengthLabel,
      harmonyScore: judgment.confidenceScore,
      supportiveFactors,
      obstacleFactors,
      mixedFactors,
      keyHouseInterpretations,
      cuspInterpretation,
      rulingPlanetInterpretation,
      contradictionAnalysis,
      practicalGuidance,
      uncertaintyNote,
      safetyNote,
      calculationEvidenceReference: {
        targetHouses: judgment.targetHouses,
        supportingHouses: judgment.supportingHouses,
        adverseHouses: judgment.adverseHouses,
        primaryCusp: judgment.primaryCusp,
        primaryCuspSubLord: judgment.primaryCuspSubLord?.subLord || '',
        subLordSignifies: judgment.primaryCuspSubLord?.subLordSignifies || [],
        positivePlanets: judgment.positivePlanets,
        challengingPlanets: judgment.challengingPlanets,
        primaryRPs: judgment.rulingPlanetSupport.primaryRPList,
        confidenceScore: judgment.confidenceScore,
        outcome: judgment.outcome,
        yesNoOutcome: judgment.yesNoOutcome
      }
    };
  }

  // -------------------------------------------------------------
  // Strength and Result Type Mapping
  // -------------------------------------------------------------
  private evaluateStrengthAndType(judgment: KPJudgmentOutput): {
    overallStrength: KPOverallStrength;
    overallStrengthLabel: KPLocalizedText;
    resultType: KPResultType;
  } {
    const score = judgment.confidenceScore;
    const outcome = judgment.outcome;

    if (outcome === 'FAVOURABLE') {
      if (score >= 75) {
        return {
          overallStrength: 'STRONG',
          overallStrengthLabel: { en: 'Strong Support', hi: 'मजबूत समर्थन' },
          resultType: 'SUPPORTIVE'
        };
      } else {
        return {
          overallStrength: 'MODERATE',
          overallStrengthLabel: { en: 'Moderate Support', hi: 'मध्यम समर्थन' },
          resultType: 'SUPPORTIVE'
        };
      }
    } else if (outcome === 'MODERATE_MIXED') {
      return {
        overallStrength: 'MIXED',
        overallStrengthLabel: { en: 'Mixed Indicators', hi: 'मिश्रित संकेत' },
        resultType: 'MIXED_CONDITIONAL'
      };
    } else if (outcome === 'CHALLENGING') {
      return {
        overallStrength: 'WEAK',
        overallStrengthLabel: { en: 'Challenging Indicators', hi: 'चुनौतीपूर्ण संकेत' },
        resultType: 'CHALLENGING_DELAY'
      };
    } else {
      return {
        overallStrength: 'INSUFFICIENT',
        overallStrengthLabel: { en: 'Insufficient Data', hi: 'अपर्याप्त संकेत' },
        resultType: 'CHALLENGING_DELAY'
      };
    }
  }

  // -------------------------------------------------------------
  // Category-Specific Direct User Answer
  // -------------------------------------------------------------
  private buildDirectAnswer(
    category: KPQuestionCategory,
    resultType: KPResultType,
    strength: KPOverallStrength,
    judgment: KPJudgmentOutput
  ): KPLocalizedText {
    switch (category) {
      case 'career_job':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Based on classical KP indicators, there is supportive momentum regarding your job and career path. The natural alignment of work, service, and professional avenues indicates positive direction. Please view this as a traditional directional indicator rather than absolute prediction; tangible progress will also depend on your ongoing effort and objective circumstances.',
            hi: 'परंपरागत KP संकेतों के आधार पर आपके नौकरी और कार्यक्षेत्र से जुड़े मामलों में समर्थन दिखाई दे रहा है। काम, सेवा और पेशे से जुड़े संकेतों का आपसी संबंध आगे बढ़ने की दिशा की ओर संकेत करता है। इसे निश्चित भविष्यवाणी न मानकर पारंपरिक संकेत के रूप में समझें; वास्तविक परिणाम आपके प्रयास और परिस्थितियों पर भी निर्भर करेंगे।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Traditional KP indicators present a balanced, mixed outlook for your career query. While work opportunities are active, transitional signals suggest that progress may take additional time, patience, or adaptability to organizational shifts.',
            hi: 'आजीविका और कार्यक्षेत्र के मामले में पारंपरिक KP संकेत मिले-जुले दिखाई दे रहे हैं। काम और आजीविका से जुड़े संकेत सक्रिय तो हैं, किंतु साथ ही कुछ ऐसे संकेत भी हैं जो बदलाव, अतिरिक्त समय या प्रतिस्पर्धा की आवश्यकता दर्शाते हैं। इसे रुकावट मानने के बजाय अतिरिक्त धैर्य और तैयारी का संकेत समझें।'
          };
        } else {
          return {
            en: 'Traditional KP indicators point to temporary hurdles, delays, or competitive friction in your career path. Conditions demand prudence and steady preparation rather than hasty or high-risk moves.',
            hi: 'पारंपरिक KP संकेतों के अनुसार वर्तमान में कार्यक्षेत्र या नौकरी से जुड़े विषय में रुकावट, विलंब या प्रतिस्पर्धा की संभावना दिखाई दे रही है। परिस्थितियाँ तुरंत अनुकूल होने के बजाय थोड़ा समय और संयम की मांग कर रही हैं। इस समय किसी बड़े अप्रत्याशित जोखिम के बजाय वर्तमान स्थिति को व्यवस्थित रखना अधिक हितकर रहेगा।'
          };
        }

      case 'business':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Classical KP principles indicate supportive factors for commercial enterprise, negotiations, and client engagements. Favourable alignment across capital, trade, and enterprise channels reflects positive potential for business growth.',
            hi: 'पारंपरिक KP पद्धति के अनुसार व्यापार, नए अनुबंध और व्यावसायिक विस्तार के पक्ष में सकारात्मक वातावरण दिखाई दे रहा है। पूंजी, ग्राहक और लाभ के संकेतों का सामंजस्य व्यापारिक प्रगति में सहायक सिद्ध हो सकता है।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Business indicators show genuine potential accompanied by operational friction. While trade opportunities exist, financial overheads or contractual terms require cautious management.',
            hi: 'व्यापारिक विषय पर संकेत मिले-जुले हैं। व्यापार में अवसर तो बनेंगे, किंतु संचालन लागत और अनुबंध की शर्तों पर बारीक नज़र रखनी होगी। बिना लिखित स्पष्टता के बड़ा आर्थिक जोखिम न लें।'
          };
        } else {
          return {
            en: 'Traditional KP significators reflect commercial friction, contractual complications, or delayed returns. Prudent capital conservation is recommended.',
            hi: 'पारंपरिक KP संकेतों के अनुसार वर्तमान में व्यापारिक निर्णयों में सतर्कता बरतने की आवश्यकता है। नए बड़े वित्तीय जोखिम लेने से पहले बाज़ार की स्थिति और लागत का गहन विश्लेषण करें।'
          };
        }

      case 'marriage':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'In classical KP Horary, the primary marital indicators receive supportive alignment. Traditional factors suggest harmony and constructive understanding for matrimonial alliances and domestic companionship.',
            hi: 'पारंपरिक KP संकेतों के आधार पर वैवाहिक जीवन एवं साझेदारी के मामलों में सौहार्दपूर्ण और अनुकूल संकेत दृष्टिगोचर हो रहे हैं। परिवार, आपसी तालमेल और स्थायित्व से जुड़े संकेतों का सहयोग वैवाहिक जीवन में सुखद दिशा का निर्माण कर रहा है।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Matrimonial indicators present a conditional pattern. While connections are forming, secondary indicators suggest differences in expectations or logistical delays that require patient family communication.',
            hi: 'विवाह से जुड़े विषय में पारंपरिक संकेत मिले-जुले हैं। सम्बंध की सम्भावना तो बन रही है, किंतु अपेक्षाओं में अंतर या पारिवारिक सहमति में थोड़ा समय और संवाद की आवश्यकता दिखाई दे रही है।'
          };
        } else {
          return {
            en: 'Classical KP markers suggest temporary misalignment or delays in matrimonial matters. Careful verification and patient dialogue are advised before committing.',
            hi: 'पारंपरिक KP संकेतों के अनुसार वैवाहिक विषय में इस समय कुछ असहमति, दूरी या विलंब के संकेत हैं। स्थिति को समझने के लिए जल्दबाज़ी के बजाय आपसी समझ, संयम और खुले संवाद को प्राथमिकता दें।'
          };
        }

      case 'relationship':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Emotional affinity and mutual commitment receive favourable traditional KP reinforcement, indicating warmth and progressive understanding in relationships.',
            hi: 'पारंपरिक KP संकेतों के अनुसार प्रेम एवं सम्बंध के मामले में आपसी समझ और भावनात्मक निकटता के अनुकूल संकेत हैं। आपसी सहयोग और विश्वास से सम्बंध में मधुरता बढ़ेगी।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Relationship indicators reflect emotional connection coupled with communication friction. Mutual clarity and patient listening are advised.',
            hi: 'सम्बंध के विषय में संकेत मिले-जुले हैं। भावनात्मक लगाव के साथ-साथ कभी-कभी संवादहीनता या प्राथमिकताओं में अंतर आ सकता है। धैर्यपूर्वक बातचीत से स्थिति संभल सकती है।'
          };
        } else {
          return {
            en: 'Traditional indicators suggest emotional friction, distance, or conflicting expectations. Self-reflection and objective evaluation are recommended.',
            hi: 'पारंपरिक KP संकेतों के अनुसार इस समय सम्बंध में भावनात्मक दूरी या मतभेद के संकेत हैं। किसी भी तात्कालिक प्रतिक्रिया से बचकर शांतिपूर्ण संवाद बनाए रखें।'
          };
        }

      case 'education_exam':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Educational indicators demonstrate harmonious traditional support, indicating high retention and competitive readiness for studies and examinations.',
            hi: 'पारंपरिक KP संकेतों के अनुसार शिक्षा और अध्ययन के क्षेत्र में बहुत अच्छे और उत्साहवर्धक संकेत दिखाई दे रहे हैं। आपकी एकाग्रता और सतत अभ्यास से अनुकूल परीक्षा परिणाम प्राप्त होने की प्रबल संभावना है।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Academic indicators show foundational potential but flag potential distractions. Consistent revision and disciplined focus will be key.',
            hi: 'शिक्षा के मामले में क्षमता तो पर्याप्त है, किंतु अध्ययन में निरंतरता और एकाग्रता बनाए रखने की आवश्यकता है। नियमित समय सारिणी बनाकर तैयारी करें।'
          };
        } else {
          return {
            en: 'Examination indicators reflect pressure, conceptual hurdles, or stiff competition. Diligent remediation is strongly indicated.',
            hi: 'पारंपरिक KP संकेतों के अनुसार पढ़ाई या परीक्षा में कड़ी प्रतिस्पर्धा और अतिरिक्त परिश्रम की आवश्यकता है। अपनी कमजोरियों को पहचानकर विशेष अभ्यास करें।'
          };
        }

      case 'property':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Classical KP indicators reflect supportive momentum for property or real estate matters. Harmonious traditional links between home foundation and acquisition suggest constructive avenues opening up.',
            hi: 'परंपरागत KP संकेतों के आधार पर आपके घर, भूमि या संपत्ति से जुड़े प्रयासों में सकारात्मक संकेत दिखाई दे रहे हैं। निवास और प्राप्ति से जुड़े कारकों का आपसी तालमेल संपत्ति से जुड़े नए रास्ते खुलने की ओर इशारा करता है। इसे निश्चित भविष्यवाणी न मानकर पारंपरिक संकेत समझें; अंतिम सफलता कानूनी और वित्तीय तैयारी पर भी निर्भर करेगी।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Property acquisition indicators show promise alongside practical challenges such as documentation or financial negotiations. Expect a step-by-step process.',
            hi: 'घर या संपत्ति के मामले में संभावनाएं तो हैं, किंतु साथ ही कागज़ी औपचारिकताओं, बजट या बातचीत में व्यावहारिक चुनौतियों के संकेत भी हैं। रास्ते बंद नहीं हैं, किंतु प्रक्रिया चरणबद्ध रूप से ही आगे बढ़ेगी।'
          };
        } else {
          return {
            en: 'Traditional significators indicate procedural delays, expenditure pressure, or unfavourable valuation for property transactions at this time. Thorough verification is essential.',
            hi: 'पारंपरिक KP संकेतों के अनुसार संपत्ति सम्बंधी निर्णय में इस समय कुछ रुकावटें, कानूनी औपचारिकताएं या बजट सम्बंधी दबाव दिख रहे हैं। पूरी जांच-पड़ताल और कागज़ातों की पुष्टि के बिना बड़ा फैसला लेने में जल्दबाज़ी न करें।'
          };
        }

      case 'vehicle':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Vehicle conveyance and acquisition fulfillment receive positive KP alignment, supporting plans for purchase or vehicle upgrade.',
            hi: 'पारंपरिक KP संकेतों के अनुसार नए वाहन के क्रय या वाहन सुख से जुड़ी योजनाओं के आगे बढ़ने के अनुकूल संकेत हैं।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Vehicle purchase indicators are active but suggest budget constraints or selection friction. Align financing carefully before finalizing.',
            hi: 'वाहन क्रय से जुड़े संकेत सक्रिय हैं, किंतु बजट या सही विकल्प के चयन में थोड़ा समय लग सकता है। अपनी वित्तीय तैयारी के अनुसार ही कदम उठाएं।'
          };
        } else {
          return {
            en: 'Conveyance indicators advise postponing major vehicular acquisitions due to hidden maintenance risks or unfavorable financing terms.',
            hi: 'पारंपरिक KP संकेत वाहन के सम्बंध में वर्तमान में अतिरिक्त खर्च या रखरखाव की सम्भावना दर्शाते हैं। थोड़ा सोच-समझकर निर्णय लेना अधिक सुरक्षित रहेगा।'
          };
        }

      case 'finance_income':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Financial accumulation and occupational earnings exhibit positive traditional KP synergy. Supportive indicators suggest steady income opportunities and financial progress.',
            hi: 'पारंपरिक KP संकेतों के अनुसार आपके धन संचय और आय से जुड़े मामलों में अनुकूल वातावरण बन रहा है। आजीविका और लाभ के संकेतों का सकारात्मक समन्वय रुके हुए धन की प्राप्ति या आय के नए अवसरों की ओर संकेत करता है।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Income channels are functioning, but simultaneous outflow indicators suggest financial discipline and conservative budgeting are necessary.',
            hi: 'आर्थिक स्थिति में धन आगमन के साथ-साथ खर्चों के बने रहने के संकेत भी हैं। आमदनी के रास्ते खुल सकते हैं, किंतु बजट संतुलन और विवेकपूर्ण व्यय पर विशेष ध्यान देना होगा।'
          };
        } else {
          return {
            en: 'Financial indicators point to cash flow pressure or blocked payments. Speculative investments should be avoided.',
            hi: 'पारंपरिक KP संकेतों के अनुसार इस समय वित्तीय दबाव या लेन-देन में रुकावट की संभावना है। किसी भी बड़े अनपेक्षित निवेश या अनावश्यक खर्च से इस समय बचना बुद्धिमानी होगी।'
          };
        }

      case 'children':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Classical KP markers for family expansion and progeny show harmonious traditional alignment, reflecting encouraging traditional indicators.',
            hi: 'पारंपरिक KP सिद्धांतों के अनुसार संतान सुख और परिवार वृद्धि के सम्बंध में अनुकूल और आशावादी संकेत दृष्टिगोचर हो रहे हैं।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Progeny indicators reflect traditional promise with advice for patient planning and medical guidance.',
            hi: 'संतान सम्बंधी विषय में धैर्य और समय के साथ चलने के संकेत हैं। सकारात्मक दृष्टिकोण और उचित मार्गदर्शन सहायक रहेगा।'
          };
        } else {
          return {
            en: 'Traditional indicators reflect delays or physical strain in progeny matters. Qualified medical consultation and holistic well-being are paramount.',
            hi: 'पारंपरिक KP संकेत इस विषय में थोड़ा समय लगने या अतिरिक्त देखभाल की आवश्यकता दर्शाते हैं। स्वास्थ्य सम्बंधी मामलों में विशेषज्ञ परामर्श ही सर्वोपरि है।'
          };
        }

      case 'travel':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Travel indicators align favourably, indicating fruitful journeys and constructive movements.',
            hi: 'पारंपरिक KP संकेतों के अनुसार यात्रा, स्थानांतरण या दूरस्थ अवसरों के पक्ष में अनुकूल संकेत हैं। यह यात्रा उद्देश्यपूर्ण सिद्ध हो सकती है।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Travel plans are supported, but schedule adjustments or logistical steps may require additional follow-ups.',
            hi: 'यात्रा की योजनाएं बन सकती हैं, किंतु समय या व्यवस्थाओं में थोड़ा फेरबदल संभव है। पूर्व तैयारी मजबूत रखें।'
          };
        } else {
          return {
            en: 'Traditional indicators advise postponing non-essential long journeys due to potential disruptions or unexpected expenditures.',
            hi: 'पारंपरिक KP संकेत यात्रा के कार्यक्रम में विलंब या अनपेक्षित असुविधा की ओर इशारा करते हैं। आवश्यक होने पर ही प्रस्थान करें।'
          };
        }

      case 'legal_matter':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'In traditional KP Horary, dispute resolution indicators receive supportive alignment, suggesting positive momentum toward resolving the matter.',
            hi: 'पारंपरिक KP ज्योतिष के अनुसार विवाद या कानूनी मामले में सकारात्मक समाधान की दिशा में अनुकूल संकेत मिल रहे हैं।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Legal indicators suggest a protracted process. Mutual arbitration or phased settlements appear more feasible than an immediate outright victory.',
            hi: 'कानूनी विषय में संकेत मिले-जुले हैं। प्रक्रिया में कुछ समय लग सकता है; आपसी सहमति या समझौते के माध्यम से समाधान निकलने के संकेत अधिक हैं।'
          };
        } else {
          return {
            en: 'Classical indicators reflect procedural hurdles. Consult your legal counsel meticulously; do not rely on assumptions.',
            hi: 'पारंपरिक KP संकेतों के अनुसार प्रक्रियात्मक जटिलता दिखाई दे रही है। किसी भी कदम से पहले अपने विधि सलाहकार (वकील) से पूर्ण परामर्श करें।'
          };
        }

      case 'partnership':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Partnership dynamics backed by joint resources and mutual fulfillment show constructive KP alignment.',
            hi: 'साझेदारी और संयुक्त प्रयासों के सम्बंध में पारम्परिक KP संकेत सहयोग और पारस्परिक लाभ के पक्ष में हैं।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Partnership proposal holds merit, but role ambiguity or profit-sharing percentages need transparent contractual codification.',
            hi: 'साझेदारी की सम्भावना अच्छी है, किंतु कार्य विभाजन और लाभ के बंटवारे को लेकर लिखित अनुबंध आवश्यक है।'
          };
        } else {
          return {
            en: 'Traditional significators caution against hasty alliances due to divergent priorities or hidden liabilities.',
            hi: 'पारंपरिक KP संकेत इस समय नई साझेदारी के सम्बंध में सतर्क रहने की सलाह देते हैं। सामने वाले पक्ष की प्रतिबद्धता की पूरी परख आवश्यक है।'
          };
        }

      case 'lost_item':
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Traditional recovery markers are active, indicating high probability of tracing the item near a known location.',
            hi: 'खोई वस्तु के मामले में आशाजनक संकेत हैं। वस्तु के किसी परिचित या सुरक्षित स्थान पर पुनः मिलने की अच्छी स्थिति है।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'Recovery indicators suggest the item is misplaced rather than permanently lost, but will require searching in overlooked storage or asking trusted intermediaries.',
            hi: 'संकेत मिले-जुले हैं; ऐसा प्रतीत होता है कि वस्तु खोने के बजाय कहीं रखकर भूल गए हैं। किसी उपेक्षित स्थान पर पुनः तलाश करें।'
          };
        } else {
          return {
            en: 'Classical recovery significators are weak. Recovery appears improbable at this stage.',
            hi: 'पारंपरिक KP गणना के अनुसार वस्तु के पुनः मिलने के संकेत काफी कमज़ोर हैं।'
          };
        }

      case 'general_yes_no':
      case 'other':
      default:
        if (resultType === 'SUPPORTIVE') {
          return {
            en: 'Based on classical KP indicators, positive directional support is observed for this inquiry. Maintain consistent efforts with confidence.',
            hi: 'पारंपरिक KP संकेतों के आधार पर आपके द्वारा पूछे गए विषय में सकारात्मक दिशा और अनुकूल परिस्थितियां दिखाई दे रही हैं। अपने प्रयासों को आत्मविश्वास के साथ जारी रखें।'
          };
        } else if (resultType === 'MIXED_CONDITIONAL') {
          return {
            en: 'The traditional KP indicators point to a mixed or conditional outcome. Success is viable, but depends on satisfying specific prerequisites and managing operational delays.',
            hi: 'पारंपरिक KP संकेतों का रुझान मिले-जुले संकेतों की ओर है। कार्य सिद्धि की संभावना विद्यमान है, परंतु इसके लिए कुछ पूर्व-शर्तें पूरी करनी होंगी और धैर्य रखना होगा।'
          };
        } else {
          return {
            en: 'Classical KP markers suggest caution and patience. Current conditions indicate notable obstacles or waiting periods.',
            hi: 'पारंपरिक KP संकेतों के अनुसार इस समय परिस्थितियां कुछ चुनौतीपूर्ण हैं। संयम बनाए रखें और उपयुक्त अवसर की प्रतीक्षा करें।'
          };
        }
    }
  }

  // -------------------------------------------------------------
  // Supportive Factors (🟢 समर्थन)
  // -------------------------------------------------------------
  private buildSupportiveFactors(
    judgment: KPJudgmentOutput,
    kpResult: KPAnalysisResult
  ): KPIntFactor[] {
    const factors: KPIntFactor[] = [];

    // Factor 1: Positive Significator Planets
    if (judgment.positivePlanets.length > 0) {
      const pListEn = judgment.positivePlanets.join(', ');
      const pListHi = judgment.positivePlanets.map(p => HINDI_PLANET_NAMES[p] || p).join(', ');

      factors.push({
        title: {
          en: `Supportive Planetary Significators (${pListEn})`,
          hi: `अनुकूल कार्येश ग्रह (${pListHi})`
        },
        description: {
          en: `Planets ${pListEn} are actively transmitting strength to the primary objective houses (${judgment.targetHouses.join(', ')}) through 4-fold KP significator levels.`,
          hi: `ग्रह ${pListHi} 4-स्तरीय KP कार्येश संबंधों (A/B/C/D) द्वारा प्रश्न के मुख्य लक्षित भावों [${judgment.targetHouses.join(', ')}] को सक्रिय रूप से ऊर्जा व समर्थन प्रदान कर रहे हैं।`
        },
        planets: judgment.positivePlanets,
        houses: judgment.targetHouses
      });
    }

    // Factor 2: Primary Cusp Sub Lord positive alignment
    if (judgment.primaryCuspSubLord && judgment.primaryCuspSubLord.isFavourable) {
      const subLord = judgment.primaryCuspSubLord.subLord;
      const subLordHi = HINDI_PLANET_NAMES[subLord] || subLord;
      factors.push({
        title: {
          en: `Key Cusp Sub Lord (${subLord}) Favourability`,
          hi: `मुख्य भाव उप-स्वामी (${subLordHi}) की अनुकूलता`
        },
        description: {
          en: `The Sub Lord of the primary house (${judgment.primaryCusp}) is ${subLord}, whose significations touch houses [${judgment.primaryCuspSubLord.subLordSignifies.join(', ')}], aligning directly with positive fructification.`,
          hi: `प्रश्न के मुख्य भाव (कस्प ${judgment.primaryCusp}) का उप-स्वामी ${subLordHi} है। यह ग्रह भाव [${judgment.primaryCuspSubLord.subLordSignifies.join(', ')}] को सूचित कर रहा है, जो सीधे अभीष्ट सिद्धि के अनुकूल है।`
        },
        planets: [subLord],
        houses: judgment.primaryCuspSubLord.subLordSignifies
      });
    }

    // Factor 3: Ruling Planet Agreement
    if (
      judgment.rulingPlanetSupport.supportDegree === 'STRONG' ||
      judgment.rulingPlanetSupport.supportDegree === 'MODERATE'
    ) {
      const matchingEn = judgment.rulingPlanetSupport.matchingPlanets.join(', ');
      const matchingHi = judgment.rulingPlanetSupport.matchingPlanets.map(p => HINDI_PLANET_NAMES[p] || p).join(', ');
      factors.push({
        title: {
          en: 'Ruling Planets (RP) Corroboration',
          hi: 'रूलिंग ग्रहों (RP) का समर्थन'
        },
        description: {
          en: `Current cosmic Ruling Planets (${matchingEn}) agree with the chart's event significators, confirming organic resonance for this question.`,
          hi: `तात्कालिक रूलिंग ग्रह (${matchingHi}) प्रश्न कुंडली के मुख्य कार्येश ग्रहों से मेल खा रहे हैं, जो इस विषय में पारम्परिक सामंजस्य की पुष्टि करते हैं।`
        },
        planets: judgment.rulingPlanetSupport.matchingPlanets
      });
    }

    // Factor 4: Primary Fulfillment House (11th) connectivity
    if (judgment.targetHouses.includes(11)) {
      const house11Sig = kpResult.significators?.byHouse[11];
      if (house11Sig && house11Sig.allSignificatorPlanets.length > 0) {
        const h11Planets = house11Sig.allSignificatorPlanets.filter(p => !judgment.challengingPlanets.includes(p));
        if (h11Planets.length > 0) {
          const h11Hi = h11Planets.map(p => HINDI_PLANET_NAMES[p] || p).join(', ');
          factors.push({
            title: {
              en: '11th House (Desire Fulfillment) Activation',
              hi: 'एकादश भाव (मनोकामना सिद्धि) की सक्रियता'
            },
            description: {
              en: `The 11th house of gain and fruition is well-signified by ${h11Planets.join(', ')}, traditionally indicating that efforts lead to tangible culmination.`,
              hi: `लाभ और इच्छा पूर्ति का एकादश भाव ${h11Hi} द्वारा सक्रिय है, जो पारम्परिक रूप से यह दर्शाता है कि प्रयास व्यर्थ न जाकर परिणाम में परिवर्तित हो सकते हैं।`
            },
            planets: h11Planets,
            houses: [11]
          });
        }
      }
    }

    return factors;
  }

  // -------------------------------------------------------------
  // Obstacle Factors (🔴 संभावित बाधाएँ)
  // -------------------------------------------------------------
  private buildObstacleFactors(
    judgment: KPJudgmentOutput,
    kpResult: KPAnalysisResult
  ): KPIntFactor[] {
    const factors: KPIntFactor[] = [];

    // Factor 1: Challenging Planets
    if (judgment.challengingPlanets.length > 0) {
      const cListEn = judgment.challengingPlanets.join(', ');
      const cListHi = judgment.challengingPlanets.map(p => HINDI_PLANET_NAMES[p] || p).join(', ');

      factors.push({
        title: {
          en: `Conflicting Planetary Influences (${cListEn})`,
          hi: `अवरोधक ग्रह प्रभाव (${cListHi})`
        },
        description: {
          en: `Planets ${cListEn} primarily signify adverse or friction houses (${judgment.adverseHouses.join(', ')}), which can trigger delay, bureaucratic fatigue, or increased resistance.`,
          hi: `ग्रह ${cListHi} प्रतिकूल भावों [${judgment.adverseHouses.join(', ')}] से सम्बंध बना रहे हैं। यह स्थिति कार्य में अनावश्यक विलंब, कागज़ी पेचीदगियों या अतिरिक्त प्रयास की ओर इशारा करती है।`
        },
        planets: judgment.challengingPlanets,
        houses: judgment.adverseHouses
      });
    }

    // Factor 2: Adverse Sub Lord connections
    if (judgment.primaryCuspSubLord && judgment.primaryCuspSubLord.signifiesAdverse) {
      const subLord = judgment.primaryCuspSubLord.subLord;
      const subLordHi = HINDI_PLANET_NAMES[subLord] || subLord;
      factors.push({
        title: {
          en: `Sub Lord Linkage to Friction Houses`,
          hi: `उप-स्वामी का बाधा भावों से जुड़ाव`
        },
        description: {
          en: `The Sub Lord ${subLord} has ties to Houses [${judgment.primaryCuspSubLord.subLordSignifies.filter(h => judgment.adverseHouses.includes(h)).join(', ')}], warning that the process will require navigating roadblocks.`,
          hi: `मुख्य उप-स्वामी ${subLordHi} का सम्बंध अवरोधक भावों [${judgment.primaryCuspSubLord.subLordSignifies.filter(h => judgment.adverseHouses.includes(h)).join(', ')}] से भी बन रहा है, जिससे प्रक्रिया सरल न होकर चरणबद्ध चुनौतियों से भरी रह सकती है।`
        },
        planets: [subLord]
      });
    }

    // Factor 3: Retrograde warnings
    if (judgment.rulingPlanetSupport.retrogradeWarnings.length > 0) {
      factors.push({
        title: {
          en: 'Retrograde Status of Key Planets',
          hi: 'प्रमुख कार्येशों की वक्री स्थिति'
        },
        description: {
          en: `Certain significator or ruling planets are in retrograde motion: ${judgment.rulingPlanetSupport.retrogradeWarnings.join('; ')}. In KP, retrogrades traditionally indicate renegotiation, review, or delayed realization.`,
          hi: `कुछ महत्वपूर्ण ग्रह वक्री अवस्था में हैं: ${judgment.rulingPlanetSupport.retrogradeWarnings.join('; ')}। KP पद्धति में वक्री ग्रह पुनर्विचार, नियमों में बदलाव या अपेक्षित समय से अधिक समय लगने का संकेत देते हैं।`
        }
      });
    }

    return factors;
  }

  // -------------------------------------------------------------
  // Mixed Factors (🟡 मिश्रित संकेत)
  // -------------------------------------------------------------
  private buildMixedFactors(
    judgment: KPJudgmentOutput,
    kpResult: KPAnalysisResult,
    supportive: KPIntFactor[],
    obstacles: KPIntFactor[]
  ): KPIntFactor[] {
    const factors: KPIntFactor[] = [];

    // If both supportive and obstacle factors exist, that is an inherent mixed factor
    if (supportive.length > 0 && obstacles.length > 0) {
      factors.push({
        title: {
          en: 'Bifurcated Signals (Dual Influences)',
          hi: 'दोहरी प्रवृत्तियाँ (द्विमुखी संकेत)'
        },
        description: {
          en: `The chart exhibits dual forces: while primary houses (${judgment.targetHouses.join(', ')}) are supported, simultaneous adverse house connections (${judgment.adverseHouses.join(', ')}) prevent an effortless walkover.`,
          hi: `कुंडली में दोहरा प्रभाव दिख रहा है: एक ओर मुख्य भाव [${judgment.targetHouses.join(', ')}] अनुकूल हैं, तो दूसरी ओर विरोधी भाव [${judgment.adverseHouses.join(', ')}] भी निष्क्रिय नहीं हैं। अतः यह बिना प्रयास के तुरंत मिलने वाला फल नहीं है।`
        }
      });
    }

    // Check intermediate supporting houses (e.g. 1st, 3rd, 8th)
    if (judgment.supportingHouses.length > 0) {
      factors.push({
        title: {
          en: `Contextual Houses in Action (${judgment.supportingHouses.join(', ')})`,
          hi: `सहायक व संदर्भ भाव [${judgment.supportingHouses.join(', ')}]`
        },
        description: {
          en: `Houses ${judgment.supportingHouses.join(', ')} introduce external factors such as third-party agreements, logistical preparations, or personal resilience into the equation.`,
          hi: `सहायक भाव [${judgment.supportingHouses.join(', ')}] तीसरे पक्ष के सहयोग, कागज़ी प्रक्रिया और आपकी व्यक्तिगत सहनशीलता की भूमिका को महत्वपूर्ण बनाते हैं।`
        },
        houses: judgment.supportingHouses
      });
    }

    return factors;
  }

  // -------------------------------------------------------------
  // Contradiction Analysis / Why Section
  // Translates calculated evidence into human astrological rationale
  // -------------------------------------------------------------
  private buildContradictionAnalysis(
    category: KPQuestionCategory,
    supportive: KPIntFactor[],
    obstacles: KPIntFactor[],
    judgment: KPJudgmentOutput
  ): KPLocalizedText {
    const pCusp = judgment.primaryCusp;
    const subLord = judgment.primaryCuspSubLord?.subLord || 'मुख्य उप-स्वामी';
    const subLordHi = HINDI_PLANET_NAMES[subLord] || subLord;
    const targetStr = judgment.targetHouses.join(', ');
    const adverseStr = judgment.adverseHouses.join(', ');

    if (supportive.length > 0 && obstacles.length === 0) {
      return {
        en: `The Sub Lord of the primary cusp (${pCusp}) supports the key houses (${targetStr}) relevant to this inquiry. Instantaneous Ruling Planets also provide active corroboration in this positive direction. Therefore, from a classical KP perspective, the cosmic indicators are mutually cohesive and point toward a supportive outcome.`,
        hi: `मुख्य भाव (कस्प ${pCusp}) के Sub Lord (${subLordHi}) से जुड़े संकेत इस प्रश्न के परिणाम को support करते हैं। Ruling Planets भी इसी दिशा में corroboration (पुष्टि) दे रहे हैं। इसलिए पारंपरिक दृष्टिकोण से अनुकूल परिणाम की स्पष्ट संभावना बनती है।`
      };
    } else if (supportive.length > 0 && obstacles.length > 0) {
      return {
        en: `The primary cusp Sub Lord (${subLord}) and Ruling Planets support the key houses (${targetStr}), confirming real opportunity. However, concurrent connections to challenge houses (${adverseStr}) clarify that the journey requires navigating practical friction. In simple words: the possibility is very much active, but paperwork, patient negotiations, and realistic timing cannot be bypassed.`,
        hi: `मुख्य भाव (कस्प ${pCusp}) के Sub Lord (${subLordHi}) से जुड़े संकेत इस प्रश्न के परिणाम को support करते हैं और Ruling Planets भी इसी दिशा में corroboration दे रहे हैं। साथ ही कुछ बाधा भावों [${adverseStr}] की सक्रियता यह स्पष्ट करती है कि राह में व्यावहारिक चुनौतियाँ विद्यमान हैं। सरल शब्दों में: अवसर और संभावना पूर्णतः जीवित है, किंतु अतिरिक्त प्रयास, सतर्कता और कागज़ी औपचारिकताओं को नज़रअंदाज़ नहीं किया जा सकता।`
      };
    } else {
      return {
        en: `The primary cusp Sub Lord (${subLord}) aligns more with delay or challenging houses (${adverseStr}) than immediate fruition, and Ruling Planets offer limited corroboration at this moment. Classical KP principles therefore suggest patience, careful reassessment, and waiting for better timing.`,
        hi: `मुख्य भाव (कस्प ${pCusp}) के Sub Lord (${subLordHi}) से जुड़े संकेत अभीष्ट भावों के स्थान पर विलंब या अवरोधक भावों [${adverseStr}] से अधिक जुड़ रहे हैं, और Ruling Planets का भी सीमित सहयोग प्राप्त हो रहा है। इसलिए पारंपरिक दृष्टिकोण से इस समय जल्दबाज़ी के बजाय धैर्य, सतर्कता और उपयुक्त समय की प्रतीक्षा अधिक हितकर रहेगी।`
      };
    }
  }

  // -------------------------------------------------------------
  // Cusp Sub Lord Meaning
  // -------------------------------------------------------------
  private buildCuspInterpretation(judgment: KPJudgmentOutput): KPCuspInterpretation {
    const pCusp = judgment.primaryCusp;
    const subLord = judgment.primaryCuspSubLord?.subLord || 'N/A';
    const subLordHi = HINDI_PLANET_NAMES[subLord] || subLord;
    const signifies = judgment.primaryCuspSubLord?.subLordSignifies || [];

    const isFav = judgment.primaryCuspSubLord?.isFavourable ?? false;

    let enText = `The Sub Lord of the ${pCusp}th cusp is ${subLord}, signifying Houses [${signifies.join(', ')}]. In KP astrology, the Cusp Sub Lord is the decisive gatekeeper.`;
    let hiText = `मुख्य भाव (कस्प ${pCusp}) के Sub Lord ${subLordHi} द्वारा जिन भावों [${signifies.join(', ')}] का संकेत मिल रहा है, वे इस प्रश्न के परिणाम की दिशा समझने में सर्वाधिक निर्णायक हैं।`;

    if (isFav) {
      enText += ` Because ${subLord} connects with target houses, it opens the gateway for positive manifestation.`;
      hiText += ` चूँकि ${subLordHi} लक्षित भावों से सीधा सम्बंध बना रहा है, यह कार्य सिद्धि के लिए अनुकूल द्वार खोलता है।`;
    } else {
      enText += ` Because ${subLord} touches adverse or non-aligned houses, it demands caution and realistic expectations.`;
      hiText += ` चूँकि ${subLordHi} कुछ अवरोधक या तटस्थ भावों से सम्बंध बना रहा है, यह प्रक्रिया में अतिरिक्त समय और सावधानी की मांग करता है।`;
    }

    return {
      cusp: pCusp,
      subLord,
      subLordSignifies: signifies,
      interpretation: { en: enText, hi: hiText }
    };
  }

  // -------------------------------------------------------------
  // Ruling Planet Interpretation
  // -------------------------------------------------------------
  private buildRulingPlanetInterpretation(judgment: KPJudgmentOutput): KPRulingPlanetInterpretation {
    const rps = judgment.rulingPlanetSupport.primaryRPList;
    const rpsHi = rps.map(p => HINDI_PLANET_NAMES[p] || p);
    const agreement = judgment.rulingPlanetSupport.supportDegree;

    let enText = `Primary Ruling Planets: ${rps.join(', ')}. `;
    let hiText = `प्राथमिक रूलिंग ग्रह: ${rpsHi.join(', ')}। `;

    if (agreement === 'STRONG' || agreement === 'MODERATE') {
      enText += `These instantaneous time-rulers corroborate the chart's significator planets (${judgment.rulingPlanetSupport.matchingPlanets.join(', ')}), validating that the question carries organic traction.`;
      hiText += `ये तात्कालिक समय-स्वामी कुंडली के कार्येश ग्रहों (${judgment.rulingPlanetSupport.matchingPlanets.map(p => HINDI_PLANET_NAMES[p] || p).join(', ')}) से पूर्ण सामंजस्य रखते हैं, जो प्रश्न की प्रामाणिकता और सार्थकता की पुष्टि करते हैं।`;
    } else {
      enText += `The Ruling Planets exhibit partial or neutral agreement with target houses, suggesting that external conditions may remain fluid.`;
      hiText += `रूलिंग ग्रहों का कार्येश भावों के साथ सीमित या तटस्थ तालमेल है, जो यह दर्शाता है कि बाहरी परिस्थितियाँ अभी पूरी तरह स्थिर नहीं हैं।`;
    }

    return {
      rps,
      agreementLevel: agreement,
      interpretation: { en: enText, hi: hiText }
    };
  }

  // -------------------------------------------------------------
  // Key House Interpretations
  // -------------------------------------------------------------
  private buildKeyHouseInterpretations(
    judgment: KPJudgmentOutput,
    kpResult: KPAnalysisResult
  ): KPKeyHouseInterpretation[] {
    const houses: KPKeyHouseInterpretation[] = [];

    const allHouses = Array.from(
      new Set([
        ...judgment.targetHouses,
        ...judgment.supportingHouses,
        ...judgment.adverseHouses
      ])
    ).sort((a, b) => a - b);

    const houseMeanings: Record<number, { en: string; hi: string }> = {
      1: { en: 'Querent vitality, initiative & personal health', hi: 'प्रश्नोत्सुक का व्यक्तित्व, संकल्प व स्वास्थ्य' },
      2: { en: 'Wealth accumulation, family support & liquid assets', hi: 'धन संचय, पारिवारिक सुख व आर्थिक संसाधन' },
      3: { en: 'Courage, negotiations, communication & short travels', hi: 'साहस, दस्तावेज़, संवाद व लघु यात्रा' },
      4: { en: 'Home, property, mother, vehicles & emotional ground', hi: 'गृह, भूमि, वाहन, माता व पारिवारिक शांति' },
      5: { en: 'Intelligence, romance, children & creative spark', hi: 'बुद्धि, प्रेम सम्बंध, संतान व रचनात्मकता' },
      6: { en: 'Service, employment, competition, debts & daily duty', hi: 'नौकरी, सेवा, प्रतिस्पर्धा, रोग व ऋण' },
      7: { en: 'Spouse, business partnerships & open public dealings', hi: 'जीवनसाथी, व्यापारिक साझेदार व सामाजिक सम्बंध' },
      8: { en: 'Obstacles, unearned wealth, obligations & deep change', hi: 'आकस्मिक बाधा, पैतृक संपत्ति, तनाव व गूढ़ बदलाव' },
      9: { en: 'Higher wisdom, long journeys, luck & mentors', hi: 'भाग्य, उच्च शिक्षा, तीर्थ यात्रा व गुरु कृपा' },
      10: { en: 'Profession, career status, social prestige & public role', hi: 'कर्म, मान-सम्मान, पदोन्नति व आजीविका' },
      11: { en: 'Desire fulfillment, large gains, friendship & success', hi: 'मनोकामना सिद्धि, प्रचुर लाभ, मित्र व कार्य सिद्धि' },
      12: { en: 'Expenditure, foreign lands, separation & hidden costs', hi: 'व्यय, विदेश प्रवास, अलगाव व अप्रत्याशित खर्च' }
    };

    for (const h of allHouses) {
      let role: 'PRIMARY' | 'SUPPORTING' | 'ADVERSE' | 'CONTEXTUAL' = 'CONTEXTUAL';
      if (judgment.targetHouses.includes(h)) role = 'PRIMARY';
      else if (judgment.supportingHouses.includes(h)) role = 'SUPPORTING';
      else if (judgment.adverseHouses.includes(h)) role = 'ADVERSE';

      const sigs = kpResult.significators?.byHouse[h];
      const planetCount = sigs?.allSignificatorPlanets.length || 0;
      const planetNames = sigs?.allSignificatorPlanets.map(p => HINDI_PLANET_NAMES[p] || p).join(', ') || 'कोई नहीं';

      houses.push({
        house: h,
        role,
        meaning: houseMeanings[h] || { en: `House ${h}`, hi: `भाव ${h}` },
        status: {
          en: `${planetCount} planets active (${sigs?.allSignificatorPlanets.join(', ') || 'None'})`,
          hi: `${planetCount} कार्येश ग्रह सक्रिय (${planetNames})`
        }
      });
    }

    return houses;
  }

  // -------------------------------------------------------------
  // Practical Grounded Guidance
  // -------------------------------------------------------------
  private buildPracticalGuidance(
    category: KPQuestionCategory,
    resultType: KPResultType,
    judgment: KPJudgmentOutput
  ): KPLocalizedText[] {
    const list: KPLocalizedText[] = [];

    if (resultType === 'SUPPORTIVE') {
      list.push({
        en: 'Proactively advance your initiatives; momentum and external conditions are in traditional alignment.',
        hi: 'अपनी योजनाओं को सक्रियता से आगे बढ़ाएं; समय और परिस्थितियाँ आपके प्रयास के अनुकूल संकेत दे रही हैं।'
      });
      list.push({
        en: 'Keep documentation, communications, and legal details organized to avoid minor bureaucratic friction.',
        hi: 'कागज़ी औपचारिकताओं और स्पष्ट संवाद पर पूरा ध्यान रखें ताकि किसी छोटी चूक से रुकावट न आए।'
      });
    } else if (resultType === 'MIXED_CONDITIONAL') {
      list.push({
        en: 'Adopt a phased strategy: satisfy all prerequisites and confirm terms before taking irreversible steps.',
        hi: 'चरणबद्ध योजना बनाकर चलें: बड़े निर्णय लेने से पहले सभी आवश्यक शर्तों और लिखित नियमों की पुष्टि करें।'
      });
      list.push({
        en: 'Prepare for operational delays or negotiation rounds with patience rather than hasty emotional decisions.',
        hi: 'प्रक्रिया में कुछ समय या बातचीत के कई दौर लग सकते हैं; जल्दबाज़ी में धैर्य न खोएं।'
      });
    } else {
      list.push({
        en: 'Exercise restraint: avoid speculative commitments or major capital deployment under current indicators.',
        hi: 'संयम बरतें: वर्तमान समय में किसी बड़े वित्तीय जोखिम या अचानक बदलाव से बचना ही उचित होगा।'
      });
      list.push({
        en: 'Focus on strengthening foundational preparations and revisit the matter when cosmic timing realigns.',
        hi: 'अपनी आंतरिक तैयारी और कमियों को सुधारने पर ध्यान दें और समय के अधिक अनुकूल होने की प्रतीक्षा करें।'
      });
    }

    // Category-specific practical tip
    if (category === 'career_job') {
      list.push({
        en: 'Sharpen specific job competencies and maintain cordial relations with superiors and colleagues.',
        hi: 'अपने व्यावसायिक कौशल को तराशें और कार्यस्थल पर सभी के साथ संतुलित सम्बंध बनाए रखें।'
      });
    } else if (category === 'property' || category === 'vehicle') {
      list.push({
        en: 'Verify property titles, municipal approvals, and hidden maintenance liabilities thoroughly.',
        hi: 'संपत्ति के कानूनी दस्तावेज़ों, स्वीकृतियों और वास्तविक बाज़ार मूल्य की स्वतंत्र रूप से जांच अवश्य कराएं।'
      });
    } else if (category === 'finance_income') {
      list.push({
        en: 'Prioritize building liquid emergency reserves and avoid taking on high-interest consumer debt.',
        hi: 'आपातकालीन बचत को प्राथमिकता दें और किसी भी अनुत्पादक ऋण या दिखावे के खर्च से बचें।'
      });
    } else if (category === 'legal_matter') {
      list.push({
        en: 'Rely strictly on professional legal advice from your lawyer; astrology is purely an interpretive aid.',
        hi: 'कानूनी मामले में पूरी तरह अपने अधिवक्ता की राय पर चलें; यह ज्योतिषीय व्याख्या केवल पारम्परिक मार्गदर्शन है।'
      });
    }

    return list;
  }

  // -------------------------------------------------------------
  // Health & Financial Safety Note Detector
  // -------------------------------------------------------------
  private detectSafetyNote(question: string, category: KPQuestionCategory): KPLocalizedText | undefined {
    const qLower = question.toLowerCase();
    const isHealth =
      qLower.includes('health') ||
      qLower.includes('disease') ||
      qLower.includes('illness') ||
      qLower.includes('surgery') ||
      qLower.includes('doctor') ||
      qLower.includes('बीमारी') ||
      qLower.includes('रोग') ||
      qLower.includes('स्वास्थ्य') ||
      qLower.includes('इलाज') ||
      qLower.includes('ऑपरेशन');

    if (isHealth) {
      return {
        en: 'Health Safety Notice: This is a classical astrological interpretation and NEVER a medical diagnosis. For any health or physical concerns, always seek advice from a certified medical practitioner.',
        hi: 'स्वास्थ्य मर्यादा सूचना: यह पारंपरिक ज्योतिषीय संकेतों की व्याख्या है, चिकित्सीय निदान नहीं। किसी भी स्वास्थ्य समस्या होने पर केवल योग्य चिकित्सक (Doctor) से सलाह लें।'
      };
    }

    const isFinance =
      category === 'finance_income' ||
      qLower.includes('invest') ||
      qLower.includes('crypto') ||
      qLower.includes('share') ||
      qLower.includes('stock') ||
      qLower.includes('निवेश') ||
      qLower.includes('शेयर') ||
      qLower.includes('मुनाफा');

    if (isFinance) {
      return {
        en: 'Financial Caution Notice: These traditional KP indicators do not constitute financial advice or guaranteed investment returns. Financial markets involve risk; invest judiciously.',
        hi: 'वित्तीय मर्यादा सूचना: यह पारंपरिक KP संकेतों का सांकेतिक विश्लेषण है, कोई निश्चित लाभ या निवेश का वादा नहीं। कोई भी वित्तीय निर्णय हमेशा अपने विवेक और अधिकृत वित्तीय सलाहकार के परामर्श से लें।'
      };
    }

    return undefined;
  }

  // -------------------------------------------------------------
  // Insufficient Data Fallback
  // -------------------------------------------------------------
  private buildInsufficientDataResult(judgment: KPJudgmentOutput): KPDeepInterpretationResult {
    return {
      id: judgment.id,
      timestamp: judgment.timestamp,
      question: judgment.question,
      category: judgment.category,
      categoryLabel: judgment.categoryLabel,
      questionSummary: {
        en: 'Insufficient astronomical data to evaluate this inquiry.',
        hi: 'इस प्रश्न के मूल्यांकन के लिए आवश्यक खगोलीय डेटा अपर्याप्त है।'
      },
      directAnswer: {
        en: 'Precise KP interpretation is unavailable due to incomplete cusp or planetary significator data.',
        hi: 'कस्प अथवा ग्रह कार्येश डेटा अपूर्ण होने के कारण सटीक KP व्याख्या उपलब्ध नहीं है।'
      },
      resultType: 'INSUFFICIENT_DATA',
      overallStrength: 'INSUFFICIENT',
      overallStrengthLabel: {
        en: 'Insufficient Data',
        hi: 'अपर्याप्त डेटा'
      },
      harmonyScore: 0,
      supportiveFactors: [],
      obstacleFactors: [],
      mixedFactors: [],
      keyHouseInterpretations: [],
      cuspInterpretation: {
        cusp: judgment.primaryCusp || 1,
        subLord: '',
        subLordSignifies: [],
        interpretation: {
          en: 'Cusp data unavailable.',
          hi: 'कस्प डेटा उपलब्ध नहीं है।'
        }
      },
      rulingPlanetInterpretation: {
        rps: [],
        agreementLevel: 'NONE',
        interpretation: {
          en: 'Ruling Planets data unavailable.',
          hi: 'रूलिंग ग्रह डेटा उपलब्ध नहीं है।'
        }
      },
      contradictionAnalysis: {
        en: 'Unable to evaluate contradictions without complete data.',
        hi: 'डेटा अपूर्ण होने के कारण विश्लेषण सम्भव नहीं।'
      },
      practicalGuidance: [
        {
          en: 'Please verify the birth date, time, and coordinates to enable full KP calculation.',
          hi: 'कृपया पूर्ण KP गणना के लिए जन्म तिथि, समय और स्थान की पुनः पुष्टि करें।'
        }
      ],
      uncertaintyNote: {
        en: 'Complete birth coordinates and accurate time are necessary for Sub Lord calculations.',
        hi: 'उप-स्वामी गणना के लिए सही समय और सटीक निर्देशांक आवश्यक हैं।'
      },
      calculationEvidenceReference: {
        targetHouses: [],
        supportingHouses: [],
        adverseHouses: [],
        primaryCusp: 1,
        primaryCuspSubLord: '',
        subLordSignifies: [],
        positivePlanets: [],
        challengingPlanets: [],
        primaryRPs: [],
        confidenceScore: 0,
        outcome: 'INSUFFICIENT_DATA',
        yesNoOutcome: 'INSUFFICIENT_DATA'
      }
    };
  }
}
