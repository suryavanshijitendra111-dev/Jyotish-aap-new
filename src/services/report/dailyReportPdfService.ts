/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — DAILY REPORT PDF GENERATION SERVICE
 */

import { jsPDF } from 'jspdf';

export interface PdfGenerationResult {
  blobUrl?: string;
  filename: string;
  downloadTriggered: boolean;
}

export class DailyReportPdfService {
  /**
   * Generates a clean, formatted PDF for the daily report and initiates download or returns blob URL.
   */
  public static async generateAndDownloadPdf(
    reportData: any,
    language: string = 'hi'
  ): Promise<PdfGenerationResult> {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const profileName = reportData?.profile?.name || 'JeevanDarpan Profile';
      const cleanDate = reportData?.dateStr || new Date().toLocaleDateString();
      const filename = `JeevanDarpan_Report_${profileName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

      // Header Banner
      doc.setFillColor(3, 13, 8);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(212, 175, 55);
      doc.setFontSize(22);
      doc.text('JEEVANDARPAN', 105, 18, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(230, 230, 230);
      doc.text('Vedic Astrological & Personal Life Guidance Report', 105, 26, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);
      doc.text(`Profile: ${profileName}   |   Date: ${cleanDate}`, 105, 33, { align: 'center' });

      // Body Section
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(14);
      doc.text('1. Astronomical & Planetary Configuration', 15, 50);

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Ephemeris Source: Swiss Ephemeris (Deterministic Calculation)`, 15, 58);
      doc.text(`Lagna: ${reportData?.kundliData?.lagna?.rashiName || 'Standard'} | Moon: ${reportData?.kundliData?.planets?.Moon?.rashiName || 'Standard'}`, 15, 64);
      doc.text(`Vimshottari Current Mahadasha: ${reportData?.kundliData?.vimshottariDasha?.currentMahadasha || 'Active Period'}`, 15, 70);

      // Section 2: Daily Guidance
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(14);
      doc.text('2. Daily Sadhana & Guidance', 15, 85);

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`- Morning Awakening: Brahma Muhurat contemplation and Gayatri Mantra.`, 15, 93);
      doc.text(`- Auspicious Focus: Karma alignment, righteous effort, and calm decision making.`, 15, 99);
      doc.text(`- Wellness & Harmony: Balanced elemental intake, hydration, and mindful breathing.`, 15, 105);

      // Section 3: Numerology & Panchang
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(14);
      doc.text('3. Daily Panchang & Cosmic Influences', 15, 120);

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`- Day Lord: Auspicious planetary governance active today.`, 15, 128);
      doc.text(`- Recommended Direction: North / East for primary ventures.`, 15, 134);
      doc.text(`- Shastra Disclaimer: Astrological signals illuminate possibilities; purushartha shapes outcomes.`, 15, 140);

      // Footer
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 275, 210, 22, 'F');
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.text('JeevanDarpan — Zero-telemetry, offline-first private spiritual operating system.', 105, 285, { align: 'center' });

      // Create Blob URL
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      // Trigger native download
      let downloadTriggered = false;
      try {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try { document.body.removeChild(link); } catch {}
        }, 1000);
        downloadTriggered = true;
      } catch (dlErr) {
        console.warn('Native download click failed, URL available:', dlErr);
      }

      return {
        blobUrl,
        filename,
        downloadTriggered
      };
    } catch (err: any) {
      console.error('PDF creation error:', err);
      throw err;
    }
  }
}
