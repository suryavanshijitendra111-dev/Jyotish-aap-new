import { jsPDF } from 'jspdf';
import { DailyReportCardData, DailyReportCardSection } from '../../types/dailyReportCard';
import { registerPdfFonts } from './pdfFontLoader';
import { getLocalizedSectionContent, getLocalizedSummaryHeadline, localizeCalculatedData } from './dailyReportCardLocalization';
import { t, getStoredLanguage, LanguageCode } from '../../i18n';

export interface PdfGenerationResult {
  success: boolean;
  filename: string;
  arrayBuffer: ArrayBuffer;
  blob: Blob;
  blobUrl: string;
  downloadTriggered: boolean;
}

interface PdfLabels {
  brandTitle: string;
  brandSubtitle: string;
  miniHeader: string;
  dateLabel: string;
  scoreLabel: string;
  generatedLabel: string;
  masterProfile: string;
  dobLabel: string;
  placeLabel: string;
  summaryHeadlineLabel: string;
  safetyTitle: string;
  safetyText: string;
  sensitivityTitle: string;
  sensitivityEmpty: string;
  signalLabel: string;
  whyLabel: string;
  whatToDoLabel: string;
  cautionLabel: string;
  calculatedLabel: string;
  ratingLabel: string;
  ratings: Record<string, string>;
  disclaimerTitle: string;
  disclaimerText: string;
  footerText: string;
}

const PDF_LABELS: Record<string, PdfLabels> = {
  hi: {
    brandTitle: 'जीवनदर्पण',
    brandSubtitle: 'निजी पारिवारिक संस्करण • दैनिक जीवन रिपोर्ट कार्ड',
    miniHeader: 'जीवनदर्पण — दैनिक जीवन रिपोर्ट कार्ड',
    dateLabel: 'दिनांक',
    scoreLabel: 'दैनिक सामंजस्य सूचकांक',
    generatedLabel: 'निर्मित समय',
    masterProfile: 'मास्टर प्रोफ़ाइल',
    dobLabel: 'जन्म',
    placeLabel: 'स्थान',
    summaryHeadlineLabel: 'आज का मुख्य संरेखण',
    safetyTitle: 'स्वास्थ्य एवं सुरक्षा निर्देश (अ-चिकित्सीय):',
    safetyText: 'जीवनदर्पण ज्योतिष, अंकशास्त्र या पंचतत्व से किसी भी बीमारी, एलर्जी या चिकित्सीय स्थिति का निदान कदापि नहीं करता है। केवल उपयोगकर्ता द्वारा स्वयं दर्ज की गई संवेदनशीलता को ही संदर्भ में लिया गया है। किसी भी स्वास्थ्य समस्या हेतु हमेशा योग्य चिकित्सक से ही परामर्श लें।',
    sensitivityTitle: 'उपयोगकर्ता द्वारा दर्ज संवेदनशीलता दैनंदिनी (अ-नैदानिक):',
    sensitivityEmpty: 'कोई संवेदनशीलता दर्ज नहीं है। आप ऐप दैनंदिनी में कभी भी अपनी संवेदनशीलता जोड़ सकते हैं।',
    signalLabel: 'संकेत',
    whyLabel: 'कारण',
    whatToDoLabel: 'क्या करें',
    cautionLabel: 'सावधानी',
    calculatedLabel: 'परिकलित',
    ratingLabel: 'मूल्यांकन',
    ratings: { High: 'अनुकूल', Moderate: 'मध्यम', Neutral: 'तटस्थ', Prudent: 'सतर्क' },
    disclaimerTitle: 'पारंपरिक मार्गदर्शन एवं वैदिक आचार संहिता अस्वीकरण:',
    disclaimerText: 'यह रिपोर्ट शास्त्रीय ज्योतिष, अंकशास्त्र, लो शू और पंचतत्त्व गणनाओं पर आधारित है और केवल आत्म-चिंतन, सांस्कृतिक और आत्म-अनुशासन के उद्देश्य से है। यह किसी भौतिक, वित्तीय, विधिक या वैवाहिक परिणाम की गारंटी नहीं देती। वास्तविक सफलता नैतिक पुरुषार्थ और व्यक्तिगत विवेक पर निर्भर है।',
    footerText: 'जीवनदर्पण निजी पारिवारिक संस्करण • गोपनीय'
  },
  mr: {
    brandTitle: 'जीवनदर्पण',
    brandSubtitle: 'खाजगी कौटुंबिक आवृत्ती • दैनिक जीवन अहवाल पत्रिका',
    miniHeader: 'जीवनदर्पण — दैनिक जीवन अहवाल पत्रिका',
    dateLabel: 'दिनांक',
    scoreLabel: 'दैनिक समरसता निर्देशांक',
    generatedLabel: 'निर्मित वेळ',
    masterProfile: 'मास्टर प्रोफाइल',
    dobLabel: 'जन्म',
    placeLabel: 'स्थान',
    summaryHeadlineLabel: 'आजचा मुख्य समन्वय',
    safetyTitle: 'आरोग्य आणि सुरक्षितता निर्देश (गैर-वैद्यकीय):',
    safetyText: 'जीवनदर्पण ज्योतिष, अंकशास्त्र किंवा पंचतत्त्वातून कोणत्याही आजाराचे किंवा वैद्यकीय स्थितीचे निदान कधीही करत नाही. केवळ आपण स्वतः नोंदवलेल्या संवेदनशीलतेचा संदर्भ दिला जातो. कोणत्याही आरोग्याच्या समस्येसाठी योग्य वैद्यकीय तज्ज्ञांचा सल्ला घ्या.',
    sensitivityTitle: 'वापरकर्त्याने नोंदवलेली संवेदनशीलता रोजनिशी (गैर-वैद्यकीय):',
    sensitivityEmpty: 'कोणतीही संवेदनशीलता नोंदवलेली नाही. आपण अॅप रोजनिशीत कधीही नोंद करू शकता.',
    signalLabel: 'संकेत',
    whyLabel: 'कारण',
    whatToDoLabel: 'काय करावे',
    cautionLabel: 'सावधगिरी',
    calculatedLabel: 'परिकलित',
    ratingLabel: 'मूल्यांकन',
    ratings: { High: 'अनुकूल', Moderate: 'मध्यम', Neutral: 'तटस्थ', Prudent: 'सावध' },
    disclaimerTitle: 'पारंपारिक मार्गदर्शन आणि वैदिक नीतिशास्त्र अस्वीकरण:',
    disclaimerText: 'हा अहवाल शास्त्रीय ज्योतिष, अंकशास्त्र, लो शू आणि पंचतत्त्व गणनांवर आधारित असून केवळ आत्म-चिंतन, सांस्कृतिक आणि स्वयं-शिस्तीच्या उद्देशाने आहे. हे कोणत्याही भौतिक किंवा आर्थिक यशाची हमी देत नाही. खरी सफलता नैतिक पुरुषार्थ आणि वैयक्तिक विवेकावर अवलंबून आहे.',
    footerText: 'जीवनदर्पण खाजगी कौटुंबिक आवृत्ती • गोपनीय'
  },
  ta: {
    brandTitle: 'ஜீவன்தர்பன்',
    brandSubtitle: 'தனியார் குடும்ப பதிப்பு • தினசரி வாழ்க்கை அறிக்கை அட்டை',
    miniHeader: 'ஜீவன்தர்பன் — தினசரி வாழ்க்கை அறிக்கை அட்டை',
    dateLabel: 'தேதி',
    scoreLabel: 'தினசரி இணக்க குறியீடு',
    generatedLabel: 'உருவாக்கப்பட்ட நேரம்',
    masterProfile: 'முதன்மை சுயவிவரம்',
    dobLabel: 'பிறந்த தேதி',
    placeLabel: 'இடம்',
    summaryHeadlineLabel: 'இன்றைய முக்கிய சீரமைப்பு',
    safetyTitle: 'சுகாதார மற்றும் பாதுகாப்பு வழிகாட்டுதல் (மருத்துவமற்றது):',
    safetyText: 'ஜீவன்தர்பன் ஜோதிடம், எண் கணிதம் அல்லது பஞ்சதத்துவத்திலிருந்து எந்தவொரு நோயையும் அல்லது மருத்துவ நிலையையும் ஒருபோதும் கண்டறியாது. நீங்கள் பதிவு செய்த தனிப்பட்ட உணர்திறன்கள் மட்டுமே குறிப்பிடப்படுகின்றன. ஏதேனும் உடல்நலக்குறைவு ஏற்பட்டால் தகுதிவாய்ந்த மருத்துவரை அணுகவும்.',
    sensitivityTitle: 'பயனர் பதிவுசெய்த உணர்திறன் குறிப்புகள் (மருத்துவமற்றது):',
    sensitivityEmpty: 'எந்த உணர்திறனும் பதிவு செய்யப்படவில்லை. பயன்பாட்டில் எப்போது வேண்டுமானாலும் சேர்க்கலாம்.',
    signalLabel: 'அடையாளம்',
    whyLabel: 'காரணம்',
    whatToDoLabel: 'செய்ய வேண்டியவை',
    cautionLabel: 'எச்சரிக்கை',
    calculatedLabel: 'கணக்கிடப்பட்டது',
    ratingLabel: 'மதிப்பீடு',
    ratings: { High: 'சாதகமானது', Moderate: 'மிதமானது', Neutral: 'நடுநிலையானது', Prudent: 'எச்சரிக்கை' },
    disclaimerTitle: 'பாரம்பரிய வழிகாட்டுதல் மற்றும் வேத நெறிமுறை மறுப்புரை:',
    disclaimerText: 'இந்த அறிக்கை பாரம்பரிய ஜோதிடம், எண் கணிதம், லோ ஷூ மற்றும் பஞ்சதத்துவ கணக்கீடுகளின் அடிப்படையில் கலாச்சார மற்றும் சுய-ஒழுக்க நோக்கங்களுக்காக மட்டுமே வழங்கப்படுகிறது. உண்மையான வெற்றி தார்மீக உழைப்பிலும் சுய விவேகத்திலும் உள்ளது.',
    footerText: 'ஜீவன்தர்பன் தனியார் குடும்ப பதிப்பு • ரகசியமானது'
  },
  en: {
    brandTitle: 'JEEVANDARPAN',
    brandSubtitle: 'PRIVATE FAMILY EDITION • DAILY JEEVAN REPORT CARD',
    miniHeader: 'JEEVANDARPAN — DAILY JEEVAN REPORT CARD',
    dateLabel: 'Date',
    scoreLabel: 'Harmonious Daily Score',
    generatedLabel: 'Generated',
    masterProfile: 'MASTER PROFILE',
    dobLabel: 'DOB',
    placeLabel: 'Place',
    summaryHeadlineLabel: 'DAILY FOCUS & HARMONY',
    safetyTitle: 'WELLNESS & HEALTH SAFETY DIRECTIVE:',
    safetyText: 'JeevanDarpan strictly NEVER diagnoses allergies, diseases, or medical conditions from astrology, numerology, or Panchatattva. Only your explicitly user-recorded sensitivities are referenced. For any illness, medical symptoms, or physical distress, always consult qualified medical healthcare professionals.',
    sensitivityTitle: 'USER-RECORDED SENSITIVITY DIARY (NON-DIAGNOSTIC):',
    sensitivityEmpty: 'None recorded. You can add your personal sensitivities in the app diary anytime.',
    signalLabel: 'SIGNAL',
    whyLabel: 'WHY',
    whatToDoLabel: 'WHAT TO DO',
    cautionLabel: 'CAUTION',
    calculatedLabel: 'CALCULATED',
    ratingLabel: 'Rating',
    ratings: { High: 'High', Moderate: 'Moderate', Neutral: 'Neutral', Prudent: 'Prudent' },
    disclaimerTitle: 'TRADITIONAL GUIDANCE & VEDIC ETHICS DISCLAIMER:',
    disclaimerText: 'This report provides classical Jyotish, Numerology, Lo Shu, and Panchatattva calculations for contemplative, cultural, and self-discipline purposes. It does not guarantee material, financial, legal, or romantic outcomes. True success resides in ethical self-effort (Purushartha) and responsible personal judgment.',
    footerText: 'JeevanDarpan Private Family Edition • Confidential'
  }
};

function getLocalizedSectionTitle(sec: DailyReportCardSection, lang: string): string {
  const i18nKey = `report.sec_${sec.id}`;
  const localized = t(i18nKey, undefined, lang as LanguageCode);
  if (localized && localized !== i18nKey) {
    return localized;
  }
  if ((lang === 'hi' || lang === 'sa' || lang === 'mr') && sec.titleHindi) {
    return sec.titleHindi;
  }
  return sec.title;
}

export class DailyReportPdfService {
  /**
   * Generates and triggers a real download of the Daily Jeevan Report Card PDF
   * using jsPDF with full Unicode font embedding (Devanagari, Tamil, etc.)
   * and localized dynamic content matching the active application language.
   */
  public static async generateAndDownloadPdf(
    report: DailyReportCardData,
    language?: string
  ): Promise<PdfGenerationResult> {
    if (!report || !report.date) {
      throw new Error('Invalid or missing DailyReportCardData object provided for PDF generation.');
    }

    try {
      // Determine active language
      const targetLang = (language || getStoredLanguage() || 'hi').toLowerCase();
      const labels = PDF_LABELS[targetLang] || PDF_LABELS.hi;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Register and set appropriate Unicode TrueType font
      const { fontFamily } = await registerPdfFonts(doc, targetLang);
      doc.setFont(fontFamily, 'normal');

      const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 16) {
          doc.addPage();
          y = margin + 4;
          drawPageHeaderMini();
        }
      };

      const drawPageHeaderMini = () => {
        doc.setFillColor(8, 34, 24); // Emerald #082218
        doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(8);
        doc.setTextColor(212, 175, 55); // Metallic Gold #d4af37
        doc.text(labels.miniHeader, margin + 3, y + 5.5);

        doc.setFont(fontFamily, 'normal');
        doc.setTextColor(220, 220, 220);
        doc.text(`${labels.dateLabel}: ${report.date}`, pageWidth - margin - 35, y + 5.5);
        y += 12;
      };

      // --- COVER / HEADER BANNER ---
      doc.setFillColor(3, 10, 8); // #030a08
      doc.rect(margin, y, contentWidth, 34, 'F');

      // Gold Border Accent
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.8);
      doc.rect(margin, y, contentWidth, 34, 'S');

      // Title & Emblem
      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(17);
      doc.setTextColor(212, 175, 55); // Gold
      doc.text(labels.brandTitle, margin + 6, y + 9.5);

      doc.setFontSize(8.5);
      doc.setTextColor(240, 240, 240);
      doc.text(labels.brandSubtitle, margin + 6, y + 15.5);

      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(180, 200, 190);
      doc.text(`${labels.dateLabel}: ${report.date}   |   ${labels.scoreLabel}: ${report.summaryScore}/100`, margin + 6, y + 21.5);
      
      const genDateStr = new Date(report.generatedTimestamp).toLocaleString(targetLang === 'hi' ? 'hi-IN' : 'en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      doc.text(`${labels.generatedLabel}: ${genDateStr}`, margin + 6, y + 26.5);

      // Master Profile Badge Box on Right
      doc.setFillColor(8, 34, 24);
      doc.rect(pageWidth - margin - 64, y + 4, 60, 26, 'F');
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.3);
      doc.rect(pageWidth - margin - 64, y + 4, 60, 26, 'S');

      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(212, 175, 55);
      doc.text(labels.masterProfile, pageWidth - margin - 61, y + 9);

      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(report.profile.name, pageWidth - margin - 61, y + 14);

      doc.setTextColor(190, 200, 190);
      doc.text(`${labels.dobLabel}: ${report.profile.dob} (${report.profile.time})`, pageWidth - margin - 61, y + 19);
      doc.text(`${labels.placeLabel}: ${report.profile.place}`, pageWidth - margin - 61, y + 24);

      y += 38;

      // --- LOCALIZED SUMMARY HEADLINE BANNER ---
      const headlineObj = getLocalizedSummaryHeadline(report, targetLang as LanguageCode);
      const localizedHeadline = headlineObj?.primary
        ? (headlineObj.secondary ? `${headlineObj.primary} — ${headlineObj.secondary}` : headlineObj.primary)
        : '';
      if (localizedHeadline) {
        checkPageBreak(16);
        doc.setFillColor(8, 34, 24);
        doc.rect(margin, y, contentWidth, 12, 'F');
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(0.4);
        doc.rect(margin, y, contentWidth, 12, 'S');

        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(212, 175, 55);
        doc.text(`${labels.summaryHeadlineLabel}:`, margin + 3, y + 4.5);

        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(240, 240, 240);
        const wrappedHeadline = doc.splitTextToSize(localizedHeadline, contentWidth - 6);
        doc.text(wrappedHeadline[0] || localizedHeadline, margin + 3, y + 8.8);

        y += 16;
      }

      // --- CRITICAL HEALTH & SAFETY NOTICE BANNER ---
      checkPageBreak(22);
      doc.setFillColor(254, 242, 242); // Soft warm alert background
      const wrappedSafety = doc.splitTextToSize(labels.safetyText, contentWidth - 6);
      const safetyBoxHeight = Math.max(16, wrappedSafety.length * 3.4 + 8.5);
      doc.rect(margin, y, contentWidth, safetyBoxHeight, 'F');
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.4);
      doc.rect(margin, y, contentWidth, safetyBoxHeight, 'S');

      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(153, 27, 27);
      doc.text(labels.safetyTitle, margin + 3, y + 4.5);

      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(7);
      doc.setTextColor(55, 65, 81);
      doc.text(wrappedSafety, margin + 3, y + 8.5);

      y += safetyBoxHeight + 4;

      // --- USER SENSITIVITY DIARY SNAPSHOT ---
      checkPageBreak(18);
      doc.setFillColor(240, 249, 245);
      const sensitivitiesStr = report.wellnessDiarySnapshot.sensitivities.length > 0
        ? report.wellnessDiarySnapshot.sensitivities.join('; ')
        : labels.sensitivityEmpty;
      const wrappedSens = doc.splitTextToSize(sensitivitiesStr, contentWidth - 6);
      const sensBoxHeight = Math.max(14, wrappedSens.length * 3.4 + 8.5);
      doc.rect(margin, y, contentWidth, sensBoxHeight, 'F');
      doc.setDrawColor(5, 150, 105);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentWidth, sensBoxHeight, 'S');

      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(6, 78, 59);
      doc.text(labels.sensitivityTitle, margin + 3, y + 4.5);

      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(7);
      doc.setTextColor(17, 24, 39);
      doc.text(wrappedSens, margin + 3, y + 8.5);

      y += sensBoxHeight + 4;

      // --- ALL 21 SECTIONS ITERATION ---
      const sectionsList = Object.values(report.sections);
      const labelColWidth = 26; // mm for label column
      const textColWidth = contentWidth - labelColWidth - 4;

      for (let i = 0; i < sectionsList.length; i++) {
        const sec = sectionsList[i];
        const content = getLocalizedSectionContent(sec, report, targetLang as LanguageCode);

        // Pre-calculate wrapped line lengths for proper dynamic box height calculation
        const wrappedSignal = doc.splitTextToSize(content.signal || '', textColWidth);
        const wrappedWhy = doc.splitTextToSize(content.why || '', textColWidth);
        const wrappedDo = doc.splitTextToSize(content.whatToDo || '', textColWidth);
        const wrappedCaution = doc.splitTextToSize(content.whatToBeCarefulAbout || '', textColWidth);
        const localizedCalc = localizeCalculatedData(sec.calculatedData || '', targetLang as LanguageCode);
        const wrappedCalc = doc.splitTextToSize(localizedCalc, textColWidth);

        const rowHeights = [
          Math.max(wrappedSignal.length * 3.3, 4.0),
          Math.max(wrappedWhy.length * 3.3, 4.0),
          Math.max(wrappedDo.length * 3.3, 4.0),
          Math.max(wrappedCaution.length * 3.3, 4.0),
          Math.max(wrappedCalc.length * 3.1, 3.8)
        ];

        const headerBarHeight = 7.5;
        const rowsSpacing = rowHeights.reduce((sum, h) => sum + h, 0) + (rowHeights.length * 1.5);
        const totalBoxHeight = headerBarHeight + 3 + rowsSpacing + 3;

        // Perform clean page break if box would overflow the page
        checkPageBreak(totalBoxHeight + 4);

        // Section Container Box
        doc.setFillColor(253, 253, 253);
        doc.rect(margin, y, contentWidth, totalBoxHeight, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.rect(margin, y, contentWidth, totalBoxHeight, 'S');

        // Section Header Bar
        doc.setFillColor(8, 34, 24); // Emerald
        doc.rect(margin, y, contentWidth, headerBarHeight, 'F');

        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(8);
        doc.setTextColor(212, 175, 55); // Gold
        const secTitleText = `${i + 1}. ${getLocalizedSectionTitle(sec, targetLang)}`;
        doc.text(secTitleText, margin + 3, y + 5.1);

        // Rating Pill on Right
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(7);
        doc.setTextColor(240, 240, 240);
        const ratingVal = labels.ratings[sec.favorableRating] || sec.favorableRating;
        const ratingStr = `${labels.ratingLabel}: ${ratingVal}`;
        const ratingWidth = doc.getTextWidth(ratingStr);
        doc.text(ratingStr, pageWidth - margin - ratingWidth - 3, y + 5.1);

        let subY = y + headerBarHeight + 3.8;

        // Field Row Renderer
        const renderRow = (
          label: string,
          labelColor: [number, number, number],
          wrappedLines: string[],
          fontSize: number = 7
        ) => {
          doc.setFont(fontFamily, 'bold');
          doc.setFontSize(fontSize);
          doc.setTextColor(...labelColor);
          doc.text(`${label}:`, margin + 3, subY);

          doc.setFont(fontFamily, 'normal');
          doc.setTextColor(30, 30, 30);
          doc.text(wrappedLines, margin + labelColWidth, subY);

          const rowH = Math.max(wrappedLines.length * (fontSize < 7 ? 3.1 : 3.3), 4.0) + 1.5;
          subY += rowH;
        };

        renderRow(labels.signalLabel, [4, 120, 87], wrappedSignal);
        renderRow(labels.whyLabel, [180, 83, 9], wrappedWhy);
        renderRow(labels.whatToDoLabel, [30, 64, 175], wrappedDo);
        renderRow(labels.cautionLabel, [185, 28, 28], wrappedCaution);
        renderRow(labels.calculatedLabel, [90, 90, 90], wrappedCalc, 6.5);

        y += totalBoxHeight + 4;
      }

      // --- TRADITIONAL GUIDANCE & VEDIC ETHICS DISCLAIMER ---
      checkPageBreak(24);
      doc.setFillColor(245, 245, 245);
      const wrappedDiscl = doc.splitTextToSize(labels.disclaimerText, contentWidth - 6);
      const disclBoxHeight = Math.max(18, wrappedDiscl.length * 3.4 + 9);
      doc.rect(margin, y, contentWidth, disclBoxHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentWidth, disclBoxHeight, 'S');

      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text(labels.disclaimerTitle, margin + 3, y + 4.8);

      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text(wrappedDiscl, margin + 3, y + 9);

      y += disclBoxHeight + 6;

      // --- FOOTER NOTE ---
      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(120, 120, 120);
      const footerStr = `${labels.footerText} • ${report.date}`;
      doc.text(footerStr, margin + 3, y);

      // Save PDF in browser client environments
      const filename = `JeevanDarpan_Daily_Report_${report.date}_${targetLang}.pdf`;
      const arrayBuffer = doc.output('arraybuffer');
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const blobUrl = typeof window !== 'undefined' && typeof window.URL !== 'undefined'
        ? window.URL.createObjectURL(blob)
        : '';

      let downloadTriggered = false;
      if (typeof window !== 'undefined') {
        try {
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            try {
              document.body.removeChild(a);
            } catch {}
          }, 2000);
          downloadTriggered = true;
        } catch (e) {
          console.warn('Direct anchor download failed, attempting doc.save fallback:', e);
          try {
            if (typeof doc.save === 'function') {
              doc.save(filename);
              downloadTriggered = true;
            }
          } catch (saveErr) {
            console.warn('doc.save also failed:', saveErr);
            downloadTriggered = false;
          }
        }
      }

      return { 
        success: true, 
        filename, 
        arrayBuffer, 
        blob, 
        blobUrl, 
        downloadTriggered 
      };
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      throw new Error(`Failed to generate PDF: ${error.message || 'Unknown PDF error'}`);
    }
  }
}
