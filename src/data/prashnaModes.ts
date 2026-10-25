import { PrashnaQuestionMode } from '../types/kundli';

export interface PrashnaModeConfig {
  id: PrashnaQuestionMode;
  number: number;
  labelHindi: string;
  labelEnglish: string;
  category: 'General' | 'Material & Wealth' | 'Life & Health' | 'Work & Enterprise' | 'Relationships' | 'Intellect & Movement' | 'Spirituality & Decision';
  icon: string;
  descriptionHindi: string;
  descriptionEnglish: string;
  primaryHouse: number;
  secondaryHouses: number[];
  primarySignificator: string;
  secondarySignificators: string[];
  quickExamples: { hindi: string; english: string }[];
  requiresSpecialFields?: 'lost_object' | 'stolen_object' | 'missing_person' | 'health_rog' | 'two_option' | 'property' | 'travel';
  disclaimer?: string;
}

export const PRASHNA_MODES: PrashnaModeConfig[] = [
  {
    id: 'general',
    number: 1,
    labelHindi: 'सामान्य प्रश्न (General)',
    labelEnglish: 'General Prashna',
    category: 'General',
    icon: 'Compass',
    descriptionHindi: 'किसी भी तात्कालिक विषय पर सामान्य वैदिक प्रश्न विचार।',
    descriptionEnglish: 'General classical horary inquiry on any pressing query.',
    primaryHouse: 1,
    secondaryHouses: [9, 11],
    primarySignificator: 'Moon',
    secondarySignificators: ['Jupiter'],
    quickExamples: [
      { hindi: 'क्या मेरा यह कार्य निर्विघ्न संपन्न होगा?', english: 'Will my endeavor be accomplished smoothly?' },
      { hindi: 'वर्तमान परिस्थिति में क्या परिणाम अपेक्षित है?', english: 'What outcome can be expected in the current scenario?' },
      { hindi: 'क्या इस दिशा में आगे बढ़ना शुभ रहेगा?', english: 'Is it auspicious to proceed in this direction?' }
    ]
  },
  {
    id: 'lost_object',
    number: 2,
    labelHindi: 'खोई वस्तु (Lost Object)',
    labelEnglish: 'Lost Object',
    category: 'Material & Wealth',
    icon: 'Search',
    descriptionHindi: 'खोई या विस्मृत वस्तु की दिशा, स्थान प्रकृति एवं प्राप्ति समय का शास्त्रीय विचार।',
    descriptionEnglish: 'Direction, environmental clues, and recovery timing for misplaced items.',
    primaryHouse: 2,
    secondaryHouses: [4, 8, 11],
    primarySignificator: 'Mercury',
    secondarySignificators: ['Moon', 'Jupiter'],
    requiresSpecialFields: 'lost_object',
    disclaimer: 'शास्त्रीय प्रश्न शास्त्र केवल दिशा, तत्व एवं प्राप्ति संभावना के संकेत देता है; यह वास्तविक जीपीएस ट्रैकिंग नहीं है। (Classical indicators only; not physical tracking).',
    quickExamples: [
      { hindi: 'मेरी खोई हुई सोने की अंगूठी या आभूषण कहाँ मिल सकते हैं?', english: 'Where can my lost jewelry or valuables be found?' },
      { hindi: 'घर में रखी महत्वपूर्ण फ़ाइल या कागज़ात कब तक मिलेंगे?', english: 'When will the misplaced official documents be recovered?' },
      { hindi: 'क्या खोया हुआ पर्स / चाबी पुनः प्राप्त होगी?', english: 'Will my lost wallet or keys be retrieved?' }
    ]
  },
  {
    id: 'stolen_object',
    number: 3,
    labelHindi: 'चोरी गई वस्तु (Stolen Object)',
    labelEnglish: 'Stolen Object',
    category: 'Material & Wealth',
    icon: 'ShieldAlert',
    descriptionHindi: 'चोरी की स्थिति, सप्तम/अष्टम भाव संबंध एवं वस्तु वापसी की ज्योतिषीय संभावना।',
    descriptionEnglish: 'Traditional theft indicators, recovery chances, and planetary relationships.',
    primaryHouse: 7,
    secondaryHouses: [8, 12, 2],
    primarySignificator: 'Mars',
    secondarySignificators: ['Rahu', 'Saturn'],
    requiresSpecialFields: 'stolen_object',
    disclaimer: 'यह विश्लेषण केवल ज्योतिषीय प्रवृत्तियों का शास्त्रीय आकलन है। किसी व्यक्ति विशेष पर आरोप न लगाएं; कानूनी व पुलिस सहायता अवश्य लें। (Astrological tendencies only; never accuse individuals).',
    quickExamples: [
      { hindi: 'क्या चोरी गया सामान अथवा धन वापस मिलने के योग हैं?', english: 'Are there planetary indications for recovery of stolen goods or money?' },
      { hindi: 'क्या चोर सामान को बेच चुका है अथवा वह अभी निकट है?', english: 'Has the stolen item been disposed of or remains nearby?' },
      { hindi: 'प्रशासनिक प्रयास से क्या खोई सामग्री बरामद होगी?', english: 'Will police investigation yield recovery?' }
    ]
  },
  {
    id: 'missing_person',
    number: 4,
    labelHindi: 'लापता व्यक्ति (Missing Person)',
    labelEnglish: 'Missing Person',
    category: 'Life & Health',
    icon: 'UserX',
    descriptionHindi: 'लापता व्यक्ति की स्थिति, दिशा एवं वापसी के शास्त्रीय चर-स्थिर संकेत।',
    descriptionEnglish: 'Traditional horary direction and return indicators for an untraced individual.',
    primaryHouse: 1,
    secondaryHouses: [7, 4, 12],
    primarySignificator: 'Moon',
    secondarySignificators: ['Jupiter', 'Mercury'],
    requiresSpecialFields: 'missing_person',
    disclaimer: 'यदि कोई सुरक्षा या आपातकालीन चिंता है तो कृपया तुरंत पुलिस व प्रशासनिक अधिकारियों से संपर्क करें। यह केवल पारंपरिक ज्योतिषीय विमर्श है। (Contact emergency authorities immediately for real-world safety).',
    quickExamples: [
      { hindi: 'घर से गया परिजन कब तक सकुशल वापस लौटेगा?', english: 'When will the departed family member return safely?' },
      { hindi: 'क्या वह व्यक्ति अपनी इच्छा से गया है अथवा किसी बाधा में है?', english: 'Did the person leave voluntarily or encounter an obstacle?' },
      { hindi: 'लापता व्यक्ति किस दिशा में होने का शास्त्रीय संकेत है?', english: 'Which cardinal direction does classical horary indicate?' }
    ]
  },
  {
    id: 'health_rog',
    number: 5,
    labelHindi: 'स्वास्थ्य व रोग विचार (Health / Rog)',
    labelEnglish: 'Health / Rog Question',
    category: 'Life & Health',
    icon: 'Activity',
    descriptionHindi: 'स्वास्थ्य सुधार, रोग निवृत्ति काल एवं आरोग्य की पारंपरिक ज्योतिषीय समीक्षा।',
    descriptionEnglish: 'Traditional astrological periods for recovery, vitality, and health trends.',
    primaryHouse: 1,
    secondaryHouses: [6, 8, 11],
    primarySignificator: 'Sun',
    secondarySignificators: ['Moon', 'Mars'],
    requiresSpecialFields: 'health_rog',
    disclaimer: 'पारंपरिक ज्योतिषीय व्याख्या — यह किसी भी रूप में चिकित्सीय निदान (Medical Diagnosis) नहीं है। कृपया योग्य चिकित्सक से ही परामर्श लें। (Traditional astrological interpretation — not medical diagnosis).',
    quickExamples: [
      { hindi: 'वर्तमान अस्वस्थता से कब तक राहत मिलने के योग हैं?', english: 'When are favorable astrological indications for health recovery expected?' },
      { hindi: 'क्या प्रस्तावित शल्य-चिकित्सा (Surgery) सफल व शुभ रहेगी?', english: 'Is the proposed medical treatment or surgery astrologically favorable?' },
      { hindi: 'क्या नई चिकित्सा पद्धति से रोगी को स्वास्थ्य लाभ होगा?', english: 'Will the newly adopted therapy provide vitality and relief?' }
    ]
  },
  {
    id: 'yes_no',
    number: 6,
    labelHindi: 'हाँ / नहीं प्रश्न (Yes / No)',
    labelEnglish: 'Yes / No Question',
    category: 'General',
    icon: 'CheckCircle2',
    descriptionHindi: 'लग्नेश-कार्येश संबंध एवं चंद्र बल पर आधारित त्वरित शास्त्रीय अनुकूलता निर्धारण।',
    descriptionEnglish: 'Structured horary assessment for binary inquiries without absolute fatalism.',
    primaryHouse: 1,
    secondaryHouses: [11, 5],
    primarySignificator: 'Moon',
    secondarySignificators: ['Jupiter'],
    disclaimer: 'प्रश्न शास्त्र संभावनाओं (Probabilities) का दर्पण है, किसी अटल अंधविश्वास का नहीं। विवेक व पुरुषार्थ सर्वोपरि है। (Reflects cosmic inclinations, not guaranteed certainty).',
    quickExamples: [
      { hindi: 'क्या यह समझौता मेरे हित में रहेगा?', english: 'Will this agreement turn out in my best favor?' },
      { hindi: 'क्या मुझे इस सप्ताह अनुमति पत्र / वीजा प्राप्त होगा?', english: 'Will I receive the expected visa or clearance this week?' },
      { hindi: 'क्या यह नया निर्णय मेरे लिए फलदायी सिद्ध होगा?', english: 'Will this new decision yield fruitful results?' }
    ]
  },
  {
    id: 'career',
    number: 7,
    labelHindi: 'करियर व आजीविका (Career)',
    labelEnglish: 'Career',
    category: 'Work & Enterprise',
    icon: 'Briefcase',
    descriptionHindi: 'कार्यक्षेत्र में पदोन्नति, सम्मान, स्थिरता एवं दीर्घकालिक विकास का विचार।',
    descriptionEnglish: 'Career advancement, reputation, leadership, and long-term vocational growth.',
    primaryHouse: 10,
    secondaryHouses: [1, 6, 11],
    primarySignificator: 'Sun',
    secondarySignificators: ['Saturn', 'Jupiter'],
    quickExamples: [
      { hindi: 'क्या इस वर्ष पदोन्नति व सम्मान के योग बन रहे हैं?', english: 'Are promotion and prestige indicated this year?' },
      { hindi: 'क्या कार्यक्षेत्र में स्थान अथवा विभाग परिवर्तन शुभ रहेगा?', english: 'Is a transfer or change in job department favorable?' },
      { hindi: 'करियर में स्थिरता व उन्नति कब से दृष्टिगोचर होगी?', english: 'When will stability and growth manifest in my career?' }
    ]
  },
  {
    id: 'job',
    number: 8,
    labelHindi: 'नौकरी / सेवा (Job)',
    labelEnglish: 'Job',
    category: 'Work & Enterprise',
    icon: 'FileText',
    descriptionHindi: 'नई नौकरी की प्राप्ति, साक्षात्कार परिणाम, वेतन वृद्धि एवं सेवा सुरक्षा।',
    descriptionEnglish: 'New employment, interview results, salary revision, and workplace dynamics.',
    primaryHouse: 6,
    secondaryHouses: [10, 11, 2],
    primarySignificator: 'Saturn',
    secondarySignificators: ['Mercury', 'Sun'],
    quickExamples: [
      { hindi: 'क्या दिए गए साक्षात्कार (Interview) में चयन की संभावना है?', english: 'Is there a favorable likelihood of selection in the recent interview?' },
      { hindi: 'वर्तमान नौकरी छोड़ना उचित है अथवा कुछ समय रुकना चाहिए?', english: 'Is it advisable to switch jobs now or wait?' },
      { hindi: 'नई नौकरी का नियुक्ति पत्र कब तक प्राप्त हो सकता है?', english: 'When can an appointment letter for the new position be expected?' }
    ]
  },
  {
    id: 'business',
    number: 9,
    labelHindi: 'व्यापार व वाणिज्य (Business)',
    labelEnglish: 'Business',
    category: 'Work & Enterprise',
    icon: 'TrendingUp',
    descriptionHindi: 'व्यापारिक विस्तार, नए सौदे, लाभ-हानि एवं व्यावसायिक रणनीति का वैदिक आकलन।',
    descriptionEnglish: 'Commercial ventures, market deals, business expansion, and profitability.',
    primaryHouse: 7,
    secondaryHouses: [10, 11, 2],
    primarySignificator: 'Mercury',
    secondarySignificators: ['Jupiter', 'Sun'],
    quickExamples: [
      { hindi: 'क्या यह नया व्यापारिक उपक्रम लाभप्रद सिद्ध होगा?', english: 'Will this new business venture prove profitable?' },
      { hindi: 'क्या बाज़ार में नया उत्पाद लॉन्च करने का यह सही समय है?', english: 'Is this the auspicious window to launch a new product in the market?' },
      { hindi: 'व्यापार में आ रहे गतिरोध कब तक दूर होंगे?', english: 'When will ongoing business bottlenecks be resolved?' }
    ]
  },
  {
    id: 'finance',
    number: 10,
    labelHindi: 'धन व वित्तीय स्थिति (Finance)',
    labelEnglish: 'Finance',
    category: 'Material & Wealth',
    icon: 'Coins',
    descriptionHindi: 'अचानक धन लाभ, ऋण मुक्ति, संचित धन एवं आर्थिक स्थिरता का विचार।',
    descriptionEnglish: 'Wealth accumulation, debt clearance, financial inflow, and monetary stability.',
    primaryHouse: 2,
    secondaryHouses: [11, 5, 9],
    primarySignificator: 'Jupiter',
    secondarySignificators: ['Mercury', 'Venus'],
    quickExamples: [
      { hindi: 'अटका हुआ या उधार दिया धन कब तक वापस मिलेगा?', english: 'When will the stuck funds or lent money be recovered?' },
      { hindi: 'क्या इस वित्तीय निवेश से संतोषजनक लाभ होगा?', english: 'Will this investment yield satisfactory returns?' },
      { hindi: 'ऋण (Loan) से मुक्ति के योग कब प्रबल होंगे?', english: 'When will planetary cycles favor liberation from debt?' }
    ]
  },
  {
    id: 'property_land',
    number: 11,
    labelHindi: 'भूमि व भवन / संपत्ति (Property / Land)',
    labelEnglish: 'Property / Land',
    category: 'Material & Wealth',
    icon: 'Home',
    descriptionHindi: 'मकान क्रय-विक्रय, पैतृक भूमि, निर्माण कार्य एवं संपत्ति विवाद की समीक्षा।',
    descriptionEnglish: 'Real estate purchase/sale, ancestral land, construction, and property deals.',
    primaryHouse: 4,
    secondaryHouses: [2, 11, 12],
    primarySignificator: 'Mars',
    secondarySignificators: ['Venus', 'Saturn'],
    requiresSpecialFields: 'property',
    quickExamples: [
      { hindi: 'क्या यह प्लॉट या मकान खरीदना मेरे लिए शुभ व मंगलकारी रहेगा?', english: 'Is purchasing this plot or house auspicious and beneficial?' },
      { hindi: 'मेरी संपत्ति का विक्रय कब तक उचित मूल्य पर संपन्न होगा?', english: 'When will my property sell at an equitable price?' },
      { hindi: 'क्या नए घर का निर्माण कार्य बिना बाधा के पूर्ण होगा?', english: 'Will home construction proceed smoothly to completion?' }
    ]
  },
  {
    id: 'vehicle',
    number: 12,
    labelHindi: 'वाहन सुख (Vehicle)',
    labelEnglish: 'Vehicle',
    category: 'Material & Wealth',
    icon: 'Car',
    descriptionHindi: 'नवीन वाहन क्रय, वाहन परिवर्तन एवं वाहन सुख की वैदिक समीक्षा।',
    descriptionEnglish: 'Automobile acquisition, upgrade, and transit auspiciousness.',
    primaryHouse: 4,
    secondaryHouses: [2, 11],
    primarySignificator: 'Venus',
    secondarySignificators: ['Mars', 'Moon'],
    quickExamples: [
      { hindi: 'क्या नया वाहन खरीदने के लिए वर्तमान समय अनुकूल है?', english: 'Is the present time auspicious for purchasing a vehicle?' },
      { hindi: 'क्या पुराना वाहन बेचकर नया मॉडल लेना फलदायी रहेगा?', english: 'Is trading in the older vehicle for a new model advantageous?' },
      { hindi: 'किस रंग अथवा प्रकार का वाहन मेरे लिए अधिक शुभ रहेगा?', english: 'Which type or class of vehicle harmonizes best with planetary indicators?' }
    ]
  },
  {
    id: 'marriage',
    number: 13,
    labelHindi: 'विवाह विचार (Marriage)',
    labelEnglish: 'Marriage',
    category: 'Relationships',
    icon: 'HeartHandshake',
    descriptionHindi: 'विवाह तय होना, दांपत्य सामंजस्य, शुभ प्रस्ताव एवं विवाह काल निर्धारण।',
    descriptionEnglish: 'Matrimonial proposals, marital harmony, union timing, and alliance fruition.',
    primaryHouse: 7,
    secondaryHouses: [2, 11, 8],
    primarySignificator: 'Venus',
    secondarySignificators: ['Jupiter', 'Moon'],
    quickExamples: [
      { hindi: 'क्या आया हुआ विवाह प्रस्ताव दोनों परिवारों के लिए शुभ सिद्ध होगा?', english: 'Will the received matrimonial alliance prove harmonious for both sides?' },
      { hindi: 'विवाह संबंध तय होने के प्रबल योग कब तक बन रहे हैं?', english: 'When are strong astrological configurations expected for solemnizing marriage?' },
      { hindi: 'दांपत्य जीवन में चल रहे तनाव कब शांत होंगे?', english: 'When will ongoing friction in married life subside?' }
    ]
  },
  {
    id: 'relationship',
    number: 14,
    labelHindi: 'प्रेम व संबंध (Relationship)',
    labelEnglish: 'Relationship',
    category: 'Relationships',
    icon: 'Heart',
    descriptionHindi: 'पारस्परिक अनुराग, मित्रता, भावनात्मक निष्ठा एवं संबंध की परिपक्वता।',
    descriptionEnglish: 'Interpersonal bonds, emotional reciprocity, trust, and future prospects.',
    primaryHouse: 5,
    secondaryHouses: [7, 11],
    primarySignificator: 'Venus',
    secondarySignificators: ['Moon', 'Mercury'],
    quickExamples: [
      { hindi: 'क्या हमारा यह संबंध विवाह अथवा स्थायी रूप में परिणत होगा?', english: 'Will this relationship culminate in permanent commitment or marriage?' },
      { hindi: 'संबंध में आई गलतफहमियां कब तक सुलझेंगी?', english: 'When will recent misunderstandings between partners be cleared?' },
      { hindi: 'क्या साथी की निष्ठा व भावनाएं मेरे प्रति सच्ची हैं?', english: 'What do classical horary significators indicate regarding mutual sincerity?' }
    ]
  },
  {
    id: 'children',
    number: 15,
    labelHindi: 'संतान सुख (Children)',
    labelEnglish: 'Children',
    category: 'Relationships',
    icon: 'Baby',
    descriptionHindi: 'संतान प्राप्ति के योग, संतान की उन्नति, शिक्षा एवं कल्याण का विचार।',
    descriptionEnglish: 'Progeny prospects, child welfare, academic progress, and family happiness.',
    primaryHouse: 5,
    secondaryHouses: [2, 11, 9],
    primarySignificator: 'Jupiter',
    secondarySignificators: ['Sun', 'Moon'],
    quickExamples: [
      { hindi: 'संतान प्राप्ति के शुभ योग कब तक दृष्टिगोचर हो रहे हैं?', english: 'When are favorable planetary transits indicated for conceiving or adopting?' },
      { hindi: 'क्या संतान की उच्च शिक्षा व करियर में सफलता मिलेगी?', english: 'Will the child achieve success in higher academics and career milestones?' },
      { hindi: 'संतान के स्वास्थ्य व जीवन में चल रही बाधा कब शांत होगी?', english: 'When will temporary challenges concerning the child resolve?' }
    ]
  },
  {
    id: 'education_exam',
    number: 16,
    labelHindi: 'शिक्षा व परीक्षा (Education / Exam)',
    labelEnglish: 'Education / Exam',
    category: 'Intellect & Movement',
    icon: 'GraduationCap',
    descriptionHindi: 'प्रतियोगी परीक्षा परिणाम, प्रवेश परीक्षा, एकाग्रता एवं उच्च अध्ययन।',
    descriptionEnglish: 'Competitive exam results, college admissions, focus, and scholarly pursuits.',
    primaryHouse: 5,
    secondaryHouses: [4, 9, 10],
    primarySignificator: 'Mercury',
    secondarySignificators: ['Jupiter', 'Sun'],
    quickExamples: [
      { hindi: 'क्या प्रतियोगी परीक्षा में वांछित सफलता व रैंक प्राप्त होगी?', english: 'Will I secure the target rank in the competitive examination?' },
      { hindi: 'क्या प्रतिष्ठित संस्थान में प्रवेश (Admission) मिलने के योग हैं?', english: 'Are there promising indications for admission to the premier institute?' },
      { hindi: 'विद्याध्ययन में एकाग्रता व स्मरण शक्ति कैसे सुदृढ़ होगी?', english: 'How can academic focus and retention be fortified according to planetary state?' }
    ]
  },
  {
    id: 'legal_dispute',
    number: 17,
    labelHindi: 'मुकदमा व विवाद (Legal Dispute)',
    labelEnglish: 'Legal Dispute',
    category: 'Work & Enterprise',
    icon: 'Scale',
    descriptionHindi: 'न्यायालयीन प्रकरण, शत्रु बाधा, समझौते की संभावना एवं निर्णय अनुकूलता।',
    descriptionEnglish: 'Litigation, adversarial conflicts, settlement prospects, and verdict outlook.',
    primaryHouse: 6,
    secondaryHouses: [1, 7, 11],
    primarySignificator: 'Mars',
    secondarySignificators: ['Saturn', 'Jupiter'],
    quickExamples: [
      { hindi: 'क्या न्यायालय में चल रहे प्रकरण में विजय प्राप्त होगी?', english: 'Will the ongoing legal proceedings culminate in a favorable verdict?' },
      { hindi: 'क्या आपसी सुलह व मध्यस्थता से मामला निपटाना लाभकारी रहेगा?', english: 'Is an out-of-court settlement via mediation astrologically advantageous?' },
      { hindi: 'शत्रु पक्ष द्वारा उत्पन्न की जा रही बाधाएं कब शांत होंगी?', english: 'When will adversarial impediments cease?' }
    ]
  },
  {
    id: 'partnership',
    number: 18,
    labelHindi: 'साझेदारी / पार्टनरशिप (Partnership)',
    labelEnglish: 'Partnership',
    category: 'Work & Enterprise',
    icon: 'Users',
    descriptionHindi: 'व्यापारिक पार्टनर का स्वभाव, निष्ठा, साझेदारी की दीर्घायु एवं लाभ विभाजन।',
    descriptionEnglish: 'Business partner compatibility, loyalty, longevity of alliance, and profit sharing.',
    primaryHouse: 7,
    secondaryHouses: [11, 2, 10],
    primarySignificator: 'Mercury',
    secondarySignificators: ['Jupiter', 'Venus'],
    quickExamples: [
      { hindi: 'क्या इस व्यक्ति के साथ नई व्यावसायिक साझेदारी करना सुरक्षित है?', english: 'Is it prudent to enter a new business partnership with this person?' },
      { hindi: 'क्या वर्तमान पार्टनर से पूर्ण सहयोग व पारदर्शिता बनी रहेगी?', english: 'Will transparency and mutual support sustain with the current associate?' },
      { hindi: 'साझेदारी विस्तार से दोनों पक्षों को यथेष्ट लाभ होगा?', english: 'Will expanding the firm benefit both partners equally?' }
    ]
  },
  {
    id: 'travel',
    number: 19,
    labelHindi: 'यात्रा व विदेश गमन (Travel)',
    labelEnglish: 'Travel',
    category: 'Intellect & Movement',
    icon: 'Plane',
    descriptionHindi: 'तीर्थ यात्रा, विदेश यात्रा, वीजा प्राप्ति, प्रवास की सुरक्षा एवं सार्थकता।',
    descriptionEnglish: 'Pilgrimages, international travel, visa approvals, journey safety, and fulfillment.',
    primaryHouse: 9,
    secondaryHouses: [3, 12, 7],
    primarySignificator: 'Moon',
    secondarySignificators: ['Rahu', 'Jupiter'],
    requiresSpecialFields: 'travel',
    quickExamples: [
      { hindi: 'क्या विदेश यात्रा / वीजा की प्रक्रिया निर्विघ्न संपन्न होगी?', english: 'Will international visa and journey procedures proceed smoothly?' },
      { hindi: 'क्या आगामी व्यावसायिक यात्रा उद्देश्य पूर्ण और लाभकारी रहेगी?', english: 'Will the upcoming business travel achieve its core mission and profit?' },
      { hindi: 'तीर्थाटन के लिए कौन सा समय अधिक पुण्यप्रद रहेगा?', english: 'Which travel window offers maximum spiritual serenity for pilgrimage?' }
    ]
  },
  {
    id: 'lost_parcel',
    number: 20,
    labelHindi: 'पार्सल व डाक वितरण (Lost Parcel / Delivery)',
    labelEnglish: 'Lost Parcel / Delivery',
    category: 'Intellect & Movement',
    icon: 'Package',
    descriptionHindi: 'रुके हुए कूरियर, शिपमेंट, पार्सल की वर्तमान स्थिति एवं प्राप्ति का समय।',
    descriptionEnglish: 'Delayed courier packages, stuck cargo shipments, and tracking delivery timelines.',
    primaryHouse: 3,
    secondaryHouses: [2, 11, 4],
    primarySignificator: 'Mercury',
    secondarySignificators: ['Mars', 'Moon'],
    quickExamples: [
      { hindi: 'अटका हुआ महत्वपूर्ण पार्सल कब तक मेरे पते पर डिलीवर होगा?', english: 'When will the delayed priority shipment arrive at my destination?' },
      { hindi: 'क्या पार्सल सुरक्षित स्थिति में है अथवा क्षतिग्रस्त हो गया है?', english: 'Is the parcel intact and safe, or has it suffered transit damage?' },
      { hindi: 'कूरियर कंपनी द्वारा गलत पते पर भेजे जाने के क्या योग हैं?', english: 'Has the consignment been routed to an incorrect hub or location?' }
    ]
  },
  {
    id: 'digital_device',
    number: 21,
    labelHindi: 'डिजिटल उपकरण व खाता (Digital Device / Account)',
    labelEnglish: 'Digital Device / Account',
    category: 'Intellect & Movement',
    icon: 'Laptop',
    descriptionHindi: 'फोन, लैपटॉप, डेटा रिकवरी, हैक किए गए खाते एवं डिजिटल सुरक्षा की समीक्षा।',
    descriptionEnglish: 'Mobile phones, laptops, data retrieval, hacked profiles, and cyber recovery.',
    primaryHouse: 3,
    secondaryHouses: [5, 8, 11],
    primarySignificator: 'Rahu',
    secondarySignificators: ['Mercury', 'Ketu'],
    quickExamples: [
      { hindi: 'खोया अथवा चोरी गया मोबाइल फोन क्या पुनः मिल पाएगा?', english: 'Can the misplaced or lost smartphone be located and recovered?' },
      { hindi: 'क्या क्रैश हुए कंप्यूटर से महत्वपूर्ण डेटा रिकवर हो सकेगा?', english: 'Will vital files and documents be retrievable from the crashed drive?' },
      { hindi: 'ब्लॉक अथवा हैक हुए डिजिटल खाते की पहुंच कब तक बहाल होगी?', english: 'When will access to the restricted or compromised online account be restored?' }
    ]
  },
  {
    id: 'spiritual_sadhana',
    number: 22,
    labelHindi: 'अध्यात्म व साधना (Spiritual / Sadhana)',
    labelEnglish: 'Spiritual / Sadhana',
    category: 'Spirituality & Decision',
    icon: 'Sparkles',
    descriptionHindi: 'मंत्र सिद्धि, गुरु कृपा, ध्यान में एकाग्रता, आत्मोन्नति एवं कुंडलिनी जागृति।',
    descriptionEnglish: 'Mantra siddhi, Guru grace, meditative focus, spiritual awakening, and inner peace.',
    primaryHouse: 9,
    secondaryHouses: [5, 12, 1],
    primarySignificator: 'Jupiter',
    secondarySignificators: ['Ketu', 'Sun'],
    quickExamples: [
      { hindi: 'क्या वर्तमान में प्रारंभ किया गया मंत्र अनुष्ठान निर्विघ्न सिद्ध होगा?', english: 'Will the newly undertaken japa anushthan attain divine fruition?' },
      { hindi: 'साधना में आ रहे विक्षेप व आलस्य कब तक दूर होंगे?', english: 'When will internal restlessness during meditation give way to stillness?' },
      { hindi: 'क्या मुझे सच्चे आध्यात्मिक गुरु का मार्गदर्शन प्राप्त होने का योग है?', english: 'Are planetary currents aligning for the arrival of an enlightened Guru?' }
    ]
  },
  {
    id: 'temple_puja',
    number: 23,
    labelHindi: 'मंदिर व पूजा अनुष्ठान (Temple / Puja)',
    labelEnglish: 'Temple / Puja',
    category: 'Spirituality & Decision',
    icon: 'Flame',
    descriptionHindi: 'देव दर्शन, धार्मिक यात्रा, महायज्ञ, कुलदेवी/देवता पूजन एवं संकल्प पूर्ति।',
    descriptionEnglish: 'Temple pilgrimages, ancestral deity veneration, yajnas, and vowed ceremonies.',
    primaryHouse: 9,
    secondaryHouses: [4, 5, 11],
    primarySignificator: 'Jupiter',
    secondarySignificators: ['Sun', 'Venus'],
    quickExamples: [
      { hindi: 'क्या प्रस्तावित महायज्ञ या मंदिर दर्शन संकल्प यथाशीघ्र पूर्ण होगा?', english: 'Will the planned temple pilgrimage or yajna be realized smoothly?' },
      { hindi: 'किस तीर्थ अथवा देवी-देवता की उपासना से वर्तमान कष्ट का निवारण होगा?', english: 'Which deity veneration does the planetary alignment point toward for solace?' },
      { hindi: 'कुलदेवता / कुलदेवी के पूजन में क्या कोई भूल-चूक तो नहीं रही?', english: 'Are traditional ancestral rites properly blessed by positive planetary gaze?' }
    ]
  },
  {
    id: 'muhurat',
    number: 24,
    labelHindi: 'मुहूर्त विचार (Muhurat)',
    labelEnglish: 'Muhurat',
    category: 'Spirituality & Decision',
    icon: 'Clock',
    descriptionHindi: 'नवीन कार्य का शुभारंभ, गृह प्रवेश, नामकरण एवं शुभ समय की तात्कालिक परीक्षा।',
    descriptionEnglish: 'Immediate assessment for commencing auspicious rites, journeys, or inaugurations.',
    primaryHouse: 1,
    secondaryHouses: [9, 10, 11],
    primarySignificator: 'Jupiter',
    secondarySignificators: ['Sun', 'Moon'],
    quickExamples: [
      { hindi: 'क्या आज इस विशेष कार्य का आरंभ करना शुभ व लाभकारी रहेगा?', english: 'Is commencing this initiative today spiritually and practically auspicious?' },
      { hindi: 'क्या वर्तमान लग्न व तिथि नए उद्यम के शिलान्यास हेतु उत्तम है?', english: 'Does the prevailing astrological window support foundation laying?' },
      { hindi: 'संभावित समय में कौन सा लग्न मुहूर्त सर्वोत्तम रहेगा?', english: 'Which upcoming ascendant window promises maximum longevity and grace?' }
    ]
  },
  {
    id: 'two_option',
    number: 25,
    labelHindi: 'द्वि-विकल्प निर्णय (Two-Option Decision)',
    labelEnglish: 'Two-Option Decision',
    category: 'Spirituality & Decision',
    icon: 'GitCompare',
    descriptionHindi: 'विकल्प A एवं विकल्प B का निष्पक्ष शास्त्रीय तुलनात्मक विश्लेषण।',
    descriptionEnglish: 'Comparative horary analysis between Option A and Option B without ranking.',
    primaryHouse: 1,
    secondaryHouses: [7, 10, 11],
    primarySignificator: 'Mercury',
    secondarySignificators: ['Jupiter', 'Moon'],
    requiresSpecialFields: 'two_option',
    disclaimer: 'यह तुलना दोनों विकल्पों के ज्योतिषीय परिप्रेक्ष्य को दर्शाती है, कोई बाध्यकारी रैंकिंग नहीं करती। अंतिम निर्णय आपके विवेक पर निर्भर है। (Comparative perspectives only; no forced ranking).',
    quickExamples: [
      { hindi: 'विकल्प A (नौकरी जारी रखना) बनाम विकल्प B (नया व्यवसाय आरंभ करना)', english: 'Option A (Continue present job) vs Option B (Launch new startup)' },
      { hindi: 'विकल्प A (शहर में फ्लैट खरीदना) बनाम विकल्प B (पैतृक गांव में जमीन लेना)', english: 'Option A (Buy apartment in metro) vs Option B (Acquire ancestral farmland)' },
      { hindi: 'विकल्प A (योजना A का चयन) बनाम विकल्प B (योजना B का चयन)', english: 'Option A (Project Alpha) vs Option B (Project Beta)' }
    ]
  }
];

export function getPrashnaModeConfig(mode: PrashnaQuestionMode): PrashnaModeConfig {
  const found = PRASHNA_MODES.find(m => m.id === mode);
  return found || PRASHNA_MODES[0];
}
