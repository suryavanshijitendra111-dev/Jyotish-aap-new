/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — UNIFIED DOSH ORCHESTRATOR
 * PHASE 1.13E: DETERMINISTIC 7-ENGINE UNIFIED EVALUATION
 */

import { MasterKundliData } from '../../types/kundli';
import { UnifiedDoshCollection, UnifiedDoshResult, UnifiedDoshStatus } from '../../types/dosh/unifiedDoshTypes';
import { MangalDoshaEngine } from './mangalDoshaEngine';
import { KalaSarpaTraditionEngine } from './kalaSarpaTraditionEngine';
import { PitrishapaEngine } from './pitrishapaEngine';
import { GuruChandalEngine } from './guruChandalEngine';
import { GrahanEngine } from './grahanEngine';
import { KemadrumaEngine } from './kemadrumaEngine';
import { ShaniSadeSatiEngine } from './shaniSadeSatiEngine';

export class DoshOrchestrator {
  public static analyzeAllDoshas(
    chart: MasterKundliData | null | undefined,
    transitOptions?: any,
    profileId?: string
  ): UnifiedDoshCollection {
    const timestamp = new Date().toISOString();
    const results: UnifiedDoshResult[] = [];

    // Helper to format disclaimer
    const defaultDisclaimer = {
      en: 'Traditional astrological analysis. Not a deterministic cause-and-effect medical or scientific prediction.',
      hi: 'पारंपरिक ज्योतिषीय विश्लेषण। इसे वैज्ञानिक या अनिवार्य चिकित्सा परिणाम न मानें।'
    };

    // 1. MANGAL_DOSHA
    try {
      if (!chart) throw new Error('No chart');
      const mangalRaw = MangalDoshaEngine.analyze(chart);
      let status: UnifiedDoshStatus = 'NOT_PRESENT';
      if (mangalRaw.status === 'INSUFFICIENT_DATA') {
        status = 'INSUFFICIENT_DATA';
      } else if (mangalRaw.primaryIndication === 'PRESENT') {
        status = mangalRaw.mitigated ? 'MITIGATED' : 'PRESENT';
      } else {
        status = 'NOT_PRESENT';
      }

      results.push({
        doshId: 'MANGAL_DOSHA',
        title: 'Mangal Dosha Analysis',
        titleHindi: 'मंगल दोष विश्लेषण',
        status,
        hasBhanga: mangalRaw.mitigated,
        primaryIndication: {
          en: mangalRaw.mitigated ? 'Present with Mitigation (Bhanga)' : (status === 'PRESENT' ? 'Present' : 'Not Present'),
          hi: mangalRaw.mitigated ? 'उपस्थित (भंग सहित)' : (status === 'PRESENT' ? 'उपस्थित' : 'अनुपस्थित')
        },
        engineSpecificDetails: mangalRaw,
        evidenceRecords: [],
        disclaimer: mangalRaw.disclaimer || defaultDisclaimer
      });
    } catch {
      results.push(this.makeInsufficientResult('MANGAL_DOSHA', 'Mangal Dosha Analysis', 'मंगल दोष विश्लेषण'));
    }

    // 2. KALA_SARPA_TRADITION
    try {
      if (!chart) throw new Error('No chart');
      const ksRaw = KalaSarpaTraditionEngine.analyze(chart);
      let status: UnifiedDoshStatus = 'NOT_PRESENT';
      if (ksRaw.status === 'INSUFFICIENT_DATA') {
        status = 'INSUFFICIENT_DATA';
      } else if (ksRaw.classification === 'PARTIAL_CONTAINMENT' || ksRaw.classification === 'BOUNDARY_CASE') {
        status = 'SPECIAL_CASE';
      } else if (ksRaw.status === 'PRESENT') {
        status = 'PRESENT';
      } else {
        status = 'NOT_PRESENT';
      }

      results.push({
        doshId: 'KALA_SARPA_TRADITION',
        title: 'Kala Sarpa Tradition Analysis',
        titleHindi: 'कालसर्प योग विश्लेषण',
        status,
        hasBhanga: false,
        primaryIndication: {
          en: status === 'SPECIAL_CASE' ? `Special Case: ${ksRaw.classification}` : (status === 'PRESENT' ? 'Present' : 'Not Present'),
          hi: status === 'SPECIAL_CASE' ? `विशेष स्थिति: ${ksRaw.classification}` : (status === 'PRESENT' ? 'उपस्थित' : 'अनुपस्थित')
        },
        engineSpecificDetails: ksRaw,
        evidenceRecords: [],
        disclaimer: ksRaw.disclaimer || defaultDisclaimer
      });
    } catch {
      results.push(this.makeInsufficientResult('KALA_SARPA_TRADITION', 'Kala Sarpa Tradition Analysis', 'कालसर्प योग विश्लेषण'));
    }

    // 3. PITRISHAPA_ANALYSIS
    try {
      if (!chart) throw new Error('No chart');
      const pitruRaw = PitrishapaEngine.analyze(chart);
      let status: UnifiedDoshStatus = 'NOT_PRESENT';
      if (pitruRaw.status === 'INSUFFICIENT_DATA') {
        status = 'INSUFFICIENT_DATA';
      } else if (pitruRaw.status === 'AFFLICTION_PRESENT') {
        status = 'PRESENT';
      } else if (pitruRaw.status === 'MITIGATED') {
        status = 'MITIGATED';
      } else if (pitruRaw.status === 'NOT_PRESENT') {
        status = 'NOT_PRESENT';
      } else {
        status = pitruRaw.status;
      }

      results.push({
        doshId: 'PITRISHAPA_ANALYSIS',
        title: 'Pitrishapa Analysis',
        titleHindi: 'पितृशाप / पूर्वजन्म शाप विचार',
        status,
        hasBhanga: pitruRaw.mitigated,
        primaryIndication: {
          en: pitruRaw.mitigated ? 'Present with Mitigation' : (status === 'PRESENT' ? 'Present' : 'Not Present'),
          hi: pitruRaw.mitigated ? 'उपस्थित (शमन/भंग सहित)' : (status === 'PRESENT' ? 'उपस्थित' : 'अनुपस्थित')
        },
        engineSpecificDetails: pitruRaw,
        evidenceRecords: [],
        disclaimer: pitruRaw.disclaimer || defaultDisclaimer
      });
    } catch {
      results.push(this.makeInsufficientResult('PITRISHAPA_ANALYSIS', 'Pitrishapa Analysis', 'पितृशाप / पूर्वजन्म शाप विचार'));
    }

    // 4. GURU_CHANDAL_ANALYSIS
    try {
      if (!chart) throw new Error('No chart');
      const gcRaw = GuruChandalEngine.analyze(chart);
      let status: UnifiedDoshStatus = 'NOT_PRESENT';
      if (gcRaw.status === 'INSUFFICIENT_DATA') {
        status = 'INSUFFICIENT_DATA';
      } else if (gcRaw.status === 'DATA_CONFLICT') {
        status = 'DATA_CONFLICT';
      } else if (gcRaw.status === 'PRESENT') {
        status = gcRaw.mitigated ? 'MITIGATED' : 'PRESENT';
      } else {
        status = 'NOT_PRESENT';
      }

      results.push({
        doshId: 'GURU_CHANDAL_ANALYSIS',
        title: 'Guru Chandal Analysis',
        titleHindi: 'गुरु चांडाल योग विश्लेषण',
        status,
        hasBhanga: gcRaw.mitigated,
        primaryIndication: {
          en: status === 'DATA_CONFLICT' ? 'Data Conflict' : (gcRaw.mitigated ? 'Present with Mitigation' : (status === 'PRESENT' ? 'Present' : 'Not Present')),
          hi: status === 'DATA_CONFLICT' ? 'डेटा विसंगति' : (gcRaw.mitigated ? 'उपस्थित (भंग सहित)' : (status === 'PRESENT' ? 'उपस्थित' : 'अनुपस्थित'))
        },
        engineSpecificDetails: gcRaw,
        evidenceRecords: [],
        disclaimer: gcRaw.disclaimer || defaultDisclaimer
      });
    } catch {
      results.push(this.makeInsufficientResult('GURU_CHANDAL_ANALYSIS', 'Guru Chandal Analysis', 'गुरु चांडाल योग विश्लेषण'));
    }

    // 5. GRAHAN_VICHAR
    try {
      if (!chart) throw new Error('No chart');
      const grRaw = GrahanEngine.analyze(chart);
      let status: UnifiedDoshStatus = 'NOT_PRESENT';
      if (grRaw.overallStatus === 'INSUFFICIENT_DATA') {
        status = 'INSUFFICIENT_DATA';
      } else if (grRaw.overallStatus === 'PRESENT') {
        status = 'PRESENT';
      } else {
        status = 'NOT_PRESENT';
      }

      results.push({
        doshId: 'GRAHAN_VICHAR',
        title: 'Grahan Vichar',
        titleHindi: 'सूर्य/चंद्र ग्रहण विचार',
        status,
        hasBhanga: false,
        primaryIndication: {
          en: status === 'PRESENT' ? 'Present' : 'Not Present',
          hi: status === 'PRESENT' ? 'उपस्थित' : 'अनुपस्थित'
        },
        engineSpecificDetails: grRaw,
        evidenceRecords: [],
        disclaimer: grRaw.disclaimer || defaultDisclaimer
      });
    } catch {
      results.push(this.makeInsufficientResult('GRAHAN_VICHAR', 'Grahan Vichar', 'सूर्य/चंद्र ग्रहण विचार'));
    }

    // 6. KEMADRUMA_ANALYSIS
    try {
      if (!chart) throw new Error('No chart');
      const kmRaw = KemadrumaEngine.analyze(chart);
      let status: UnifiedDoshStatus = 'NOT_PRESENT';
      if (kmRaw.status === 'INSUFFICIENT_DATA') {
        status = 'INSUFFICIENT_DATA';
      } else if (kmRaw.status === 'CANCELLED' || (kmRaw.baseIndication === 'PRESENT' && kmRaw.bhangaPresent)) {
        status = 'MITIGATED';
      } else if (kmRaw.status === 'FORMED' || kmRaw.baseIndication === 'PRESENT') {
        status = 'PRESENT';
      } else {
        status = 'NOT_PRESENT';
      }

      const hasBhanga = kmRaw.bhangaPresent || kmRaw.status === 'CANCELLED';
      results.push({
        doshId: 'KEMADRUMA_ANALYSIS',
        title: 'Kemadruma Analysis',
        titleHindi: 'केमद्रुम विचार',
        status,
        hasBhanga,
        primaryIndication: {
          en: hasBhanga ? 'Present with Bhanga (Cancellation)' : (status === 'PRESENT' ? 'Present' : 'Not Present'),
          hi: hasBhanga ? 'उपस्थित (भंग सहित)' : (status === 'PRESENT' ? 'उपस्थित' : 'अनुपस्थित')
        },
        engineSpecificDetails: kmRaw,
        evidenceRecords: [],
        disclaimer: kmRaw.disclaimer || defaultDisclaimer
      });
    } catch {
      results.push(this.makeInsufficientResult('KEMADRUMA_ANALYSIS', 'Kemadruma Analysis', 'केमद्रुम विचार'));
    }

    // 7. SHANI_SADE_SATI_DHAIYYA_ANALYSIS
    try {
      if (!chart) throw new Error('No chart');
      const shaniRaw = ShaniSadeSatiEngine.analyze(chart, transitOptions);
      let status: UnifiedDoshStatus = 'NOT_PRESENT';
      if (shaniRaw.status === 'INSUFFICIENT_DATA') {
        status = 'INSUFFICIENT_DATA';
      } else if (shaniRaw.status === 'PRESENT') {
        status = 'PRESENT';
      } else {
        status = 'NOT_PRESENT';
      }

      const evidenceRecords: any[] = [];
      if (transitOptions?.futureWindows && Array.isArray(transitOptions.futureWindows)) {
        for (const fw of transitOptions.futureWindows) {
          if (fw.evidenceId && fw.fingerprint) {
            evidenceRecords.push(fw);
          }
        }
      }

      results.push({
        doshId: 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS',
        title: 'Shani Sade Sati & Dhaiyya',
        titleHindi: 'शनि साढ़ेसाती एवं ढैया विचार',
        status,
        hasBhanga: false,
        primaryIndication: {
          en: status === 'PRESENT' ? `Active: ${shaniRaw.classification || 'Sade Sati'}` : 'Not Active',
          hi: status === 'PRESENT' ? `सक्रिय: ${shaniRaw.classification || 'साढ़ेसाती'}` : 'सक्रिय नहीं'
        },
        engineSpecificDetails: shaniRaw,
        evidenceRecords,
        disclaimer: shaniRaw.disclaimer || defaultDisclaimer
      });
    } catch {
      results.push(this.makeInsufficientResult('SHANI_SADE_SATI_DHAIYYA_ANALYSIS', 'Shani Sade Sati & Dhaiyya', 'शनि साढ़ेसाती एवं ढैया विचार'));
    }

    return {
      results,
      metadata: {
        totalEnginesEvaluated: 7,
        profileId,
        timestamp
      }
    };
  }

  private static makeInsufficientResult(doshId: any, title: string, titleHindi: string): UnifiedDoshResult {
    return {
      doshId,
      title,
      titleHindi,
      status: 'INSUFFICIENT_DATA',
      hasBhanga: false,
      primaryIndication: {
        en: 'Insufficient Data',
        hi: 'अपर्याप्त डेटा'
      },
      engineSpecificDetails: {
        status: 'INSUFFICIENT_DATA',
        baseIndication: 'INSUFFICIENT_DATA',
        bhangaPresent: false
      },
      evidenceRecords: [],
      disclaimer: {
        en: 'Calculation could not be completed due to missing planetary parameters.',
        hi: 'आवश्यक ग्रह स्थिति उपलब्ध न होने के कारण गणना पूर्ण नहीं हो सकी।'
      }
    };
  }
}
