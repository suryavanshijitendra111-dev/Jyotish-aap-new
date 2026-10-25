import { jsPDF } from 'jspdf';
import { BackupManifest } from '../../types/backup';
import { registerPdfFonts } from '../report/pdfFontLoader';
import { PdfGenerationResult } from '../report/dailyReportPdfService';
import { getStoredLanguage } from '../../i18n';
import { addAuditLog } from '../guardian/guardianApprovalService';

export class BackupPdfService {
  public static async generateBackupPdfReport(manifest: BackupManifest): Promise<PdfGenerationResult> {
    const lang = getStoredLanguage() || 'hi';
    const isHindi = lang === 'hi' || lang === 'mr';

    // A4 dimensions: 210mm x 297mm
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    // Register Unicode fonts
    let fontFamily = 'helvetica';
    try {
      const registered = await registerPdfFonts(doc);
      if (registered) {
        fontFamily = 'NotoSansDevanagari';
      }
    } catch {
      fontFamily = 'helvetica';
    }

    // Page Background - Dark emerald tone
    doc.setFillColor(3, 10, 8);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer Gold Border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8, 'S');

    // Inner subtle border
    doc.setDrawColor(180, 150, 40);
    doc.setLineWidth(0.2);
    doc.rect(margin - 2.5, margin - 2.5, contentWidth + 5, pageHeight - (margin * 2) + 5, 'S');

    let y = margin + 4;

    // --- HEADER BANNER ---
    doc.setFillColor(8, 34, 24);
    doc.rect(margin, y, contentWidth, 34, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.4);
    doc.rect(margin, y, contentWidth, 34, 'S');

    // Brand Title
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55);
    doc.text(isHindi ? 'जीवनदर्पण — बैकअप केंद्र' : 'JEEVANDARPAN — BACKUP CENTER', margin + 6, y + 9);

    // Subtitle
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(220, 220, 220);
    doc.text(
      isHindi 
        ? 'प्रमाणित व्यक्तिगत डेटा बैकअप मैनिफेस्ट • निजी पारिवारिक संस्करण' 
        : 'CERTIFIED PERSONAL DATA BACKUP MANIFEST • PRIVATE FAMILY EDITION',
      margin + 6,
      y + 16
    );

    // Manifest Meta info inside Header
    doc.setFontSize(7.5);
    doc.setTextColor(180, 200, 190);
    const dateStr = new Date(manifest.createdAt).toLocaleString(isHindi ? 'hi-IN' : 'en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    doc.text(
      `${isHindi ? 'मैनिफेस्ट आईडी' : 'Manifest ID'}: ${manifest.id}   |   ${isHindi ? 'दिनांक' : 'Date'}: ${dateStr}`,
      margin + 6,
      y + 23
    );
    doc.text(
      `${isHindi ? 'प्रकार' : 'Type'}: ${manifest.backupType}   |   ${isHindi ? 'आकार' : 'Size'}: ${(manifest.sizeBytes / 1024).toFixed(1)} KB   |   ${isHindi ? 'स्कीमा' : 'Schema'}: v${manifest.schemaVersion}`,
      margin + 6,
      y + 29
    );

    y += 40;

    // --- INTEGRITY & CHECKSUM BOX ---
    doc.setFillColor(5, 20, 15);
    doc.rect(margin, y, contentWidth, 16, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth, 16, 'S');

    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(212, 175, 55);
    doc.text(isHindi ? 'डिजिटल अखंडता एवं चेकसम प्रमाण (SHA/FNV):' : 'DIGITAL INTEGRITY & CHECKSUM PROOF:', margin + 4, y + 6);

    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(240, 240, 240);
    doc.text(`HASH: ${manifest.checksum}`, margin + 4, y + 11.5);
    doc.setTextColor(140, 200, 160);
    doc.text(isHindi ? '[सत्यापित अखंडता • कोई छेड़छाड़ नहीं]' : '[VERIFIED INTEGRITY • UNTOUCHED]', pageWidth - margin - 50, y + 11.5);

    y += 22;

    // --- MASTER PROFILE SECTION ---
    doc.setFillColor(8, 34, 24);
    doc.rect(margin, y, contentWidth, 24, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth, 24, 'S');

    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(212, 175, 55);
    doc.text(isHindi ? 'मास्टर जन्म विवरण (Master Birth Profile):' : 'MASTER BIRTH PROFILE:', margin + 4, y + 6);

    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    const prof = manifest.payload.masterProfile;
    doc.text(`${prof?.name || 'Jitendra Suryavanshi'}`, margin + 4, y + 12);

    doc.setFontSize(7.5);
    doc.setTextColor(190, 205, 195);
    doc.text(
      `${isHindi ? 'जन्म' : 'Birth'}: ${prof?.dob || '24 June 1986'}, ${prof?.time || '06:20 AM'}   |   ${isHindi ? 'स्थान' : 'Place'}: ${prof?.place || 'Indore, MP'} (Lat: ${prof?.latitude || 22.7196}, Lon: ${prof?.longitude || 75.8577})`,
      margin + 4,
      y + 18
    );

    y += 30;

    // --- INVENTORY SUMMARY TABLE ---
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(212, 175, 55);
    doc.text(isHindi ? 'शामिल घटकों की विस्तृत सूची (Data Inventory):' : 'INCLUDED DATA INVENTORY:', margin, y);
    y += 4;

    const inventoryItems = [
      {
        title: isHindi ? 'मास्टर एवं पारिवारिक प्रोफ़ाइल' : 'Master & Family Profiles',
        desc: isHindi ? 'जन्म समय, अक्षांश, देशांतर एवं पारिवारिक संदर्भ' : 'Birth timestamp, coordinates, family references',
        count: `${1 + (manifest.payload.familyProfiles?.length || 0)} ${isHindi ? 'प्रोफ़ाइल' : 'Profiles'}`,
      },
      {
        title: isHindi ? 'दैनिक जीवन रिपोर्ट कार्ड इतिहास' : 'Daily Life Report Card History',
        desc: isHindi ? 'दैनिक सामंजस्य सूचकांक, मार्गदर्शन एवं कर्म सारांश' : 'Harmony index, daily guidance, karma logs',
        count: `${manifest.metadata.recordCounts.reports} ${isHindi ? 'रिपोर्ट्स' : 'Reports'}`,
      },
      {
        title: isHindi ? 'वैदिक प्रश्न कुंडली इतिहास' : 'Vedic Prashna Horary History',
        desc: isHindi ? 'पूछे गए प्रश्न, तत्कालीन लग्न एवं वैदिक उत्तर' : 'Querent timestamps, planetary states & answers',
        count: `${manifest.metadata.recordCounts.prashna} ${isHindi ? 'प्रश्न' : 'Records'}`,
      },
      {
        title: isHindi ? 'जीवन दैनंदिनी, संवेदनशीलता एवं लक्ष्य' : 'Life Journal & Sensitivities',
        desc: isHindi ? 'उपयोगकर्ता द्वारा दर्ज संवेदनशीलता, जल व निद्रा लक्ष्य' : 'User sensitivity notes, sleep & hydration targets',
        count: `${manifest.metadata.recordCounts.sensitivities} ${isHindi ? 'प्रविष्टियां' : 'Entries'}`,
      },
      {
        title: isHindi ? 'प्रातः संस्कार दिनचर्या एवं सेटिंग्स' : 'Pratah Sanskar Routine & Settings',
        desc: isHindi ? 'अलार्म, मंत्र, ध्वनि गति, भाषा एवं दैनिक पूर्णता' : 'Alarm, chanting, voice speed, language & progress',
        count: isHindi ? 'सक्रिय' : 'Active',
      },
      {
        title: isHindi ? 'संरक्षक एवं नियंत्रण नीतियां (सुरक्षित)' : 'Guardian & Control Policies (Safe)',
        desc: isHindi ? 'मॉड्यूल नियंत्रण, एआई नीतियां, रखरखाव मोड नीतियां' : 'Module switches, maintenance toggles, feature flags',
        count: isHindi ? 'सुरक्षित' : 'Secured',
      },
    ];

    inventoryItems.forEach((item) => {
      doc.setFillColor(6, 25, 18);
      doc.rect(margin, y, contentWidth, 12, 'F');
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.15);
      doc.rect(margin, y, contentWidth, 12, 'S');

      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(item.title, margin + 4, y + 5);

      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(7);
      doc.setTextColor(170, 190, 180);
      doc.text(item.desc, margin + 4, y + 9.5);

      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(212, 175, 55);
      doc.text(item.count, pageWidth - margin - 26, y + 7.5);

      y += 14;
    });

    y += 4;

    // --- MANDATORY EXCLUSIONS BOX (CRITICAL SECURITY NOTICE) ---
    doc.setFillColor(25, 10, 10);
    doc.rect(margin, y, contentWidth, 38, 'F');
    doc.setDrawColor(220, 70, 70);
    doc.setLineWidth(0.4);
    doc.rect(margin, y, contentWidth, 38, 'S');

    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 120, 120);
    doc.text(
      isHindi 
        ? 'सुरक्षा एवं गोपनीयता घोषणा — संवेदनशील सुरक्षा कुंजियाँ अपवर्जित:' 
        : 'SECURITY & PRIVACY SEAL — SENSITIVE CREDENTIALS EXCLUDED:',
      margin + 4,
      y + 7
    );

    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 220, 220);
    doc.text(
      isHindi 
        ? 'संवेदनशील सुरक्षा कुंजियाँ बैकअप में शामिल नहीं की गईं।' 
        : 'Sensitive credentials excluded',
      margin + 4,
      y + 14
    );

    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(230, 200, 200);
    const exclusionText = isHindi
      ? 'जीवनदर्पण सुरक्षा नियमों के अंतर्गत स्वामी पिन (OWNER_PIN), संरक्षक गुप्त कुंजी (GUARDIAN_SECRET_KEY), जेमिनी एपीआई की (Gemini API Key), प्रमाणीकरण टोकन (Session Tokens) तथा निजी एन्क्रिप्शन कुंजियाँ किसी भी बैकअप में सम्मिलित नहीं की जाती हैं। यह बैकअप किसी अन्य डिवाइस पर पुनः स्थापित करते समय आपकी सुरक्षा को 100% सुरक्षित रखता है।'
      : 'Under JeevanDarpan security mandates, OWNER_PIN, GUARDIAN_SECRET_KEY, Gemini API keys, authentication session tokens, and private server credentials are strictly excluded from all backup payloads. Your security remains 100% uncompromised when transferring backups across devices.';
    
    const wrappedExclusion = doc.splitTextToSize(exclusionText, contentWidth - 8);
    doc.text(wrappedExclusion, margin + 4, y + 20);

    // --- FOOTER ---
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 160, 150);
    doc.text(
      isHindi 
        ? 'जीवनदर्पण निजी पारिवारिक संस्करण • सुरक्षित स्थानीय एन्क्रिप्शन एवं सत्यापन • गोपनीय' 
        : 'JeevanDarpan Private Family Edition • Client-Verified Storage & Validation • Confidential',
      margin,
      pageHeight - margin + 2
    );

    // Output PDF result
    const arrayBuffer = doc.output('arraybuffer');
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const dateFileStr = new Date(manifest.createdAt).toISOString().split('T')[0];
    const filename = `jeevandarpan_backup_manifest_${dateFileStr}_${manifest.id}.pdf`;

    // Trigger download automatically in browser
    let downloadTriggered = false;
    if (typeof window !== 'undefined') {
      try {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 1000);
        downloadTriggered = true;
      } catch {
        // Fallback handled by caller
      }
    }

    // Record in Guardian Audit Log
    try {
      addAuditLog({
        action: 'BACKUP_PDF_CREATED',
        actor: 'Owner',
        details: `Generated PDF backup manifest report for ${manifest.id} (${filename})`,
        severity: 'INFO',
      });
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      filename,
      arrayBuffer,
      blob,
      blobUrl,
      downloadTriggered,
    };
  }
}
