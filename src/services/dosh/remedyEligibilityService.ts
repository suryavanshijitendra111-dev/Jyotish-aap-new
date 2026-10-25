/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — REMEDY ELIGIBILITY ENGINE (उपाय पात्रता नियंत्रक)
 * PHASE 1.13H: DETERMINISTIC ELIGIBILITY RULES & BHANGA AWARENESS
 * 
 * STRICT INVARIANTS:
 * - Deterministic, pure function; ZERO side effects.
 * - NOT_PRESENT → ZERO corrective remedies.
 * - INSUFFICIENT_DATA / DATA_CONFLICT → ZERO definitive remedies.
 * - BHANGA / MITIGATION → Corrective remedies SUPPRESSED; explicit notice that remedy is not required.
 * - Kala Sarpa NOT_DETECTED → ZERO remedies.
 * - Shani INSUFFICIENT_DATA / NOT_PRESENT → ZERO remedies.
 * - ZERO severity scores, ZERO ranking, ZERO commercial priority.
 */

import { UnifiedDoshResult } from '../../types/dosh/unifiedDoshTypes';
import { DoshRemedyEvaluation, RemedyItem } from '../../types/dosh/remedyTypes';
import { RemedyCatalogService } from './remedyCatalogService';

export class RemedyEligibilityService {
  /**
   * Evaluates deterministic eligibility of traditional remedies for a given UnifiedDoshResult.
   */
  public static evaluateEligibility(result: UnifiedDoshResult): DoshRemedyEvaluation {
    const candidateRemedies = RemedyCatalogService.getRemediesByDoshId(result.doshId);
    let hasBhanga = false;
    let isRemedyRequired = false;
    let bhangaNoticeHi: string | undefined = undefined;
    let bhangaNoticeEn: string | undefined = undefined;
    let guidanceNoticeHi = '';
    let guidanceNoticeEn = '';
    let eligibleRemedies: RemedyItem[] = [];

    // 1. DATA_CONFLICT or INSUFFICIENT_DATA Guard
    if (result.status === 'INSUFFICIENT_DATA') {
      return {
        doshId: result.doshId,
        doshStatus: result.status,
        hasBhanga: false,
        isRemedyRequired: false,
        guidanceNoticeHi: 'खगोलीय गणना डेटा अपूर्ण होने के कारण इस समय कोई उपाय निर्धारित नहीं किया जा सकता।',
        guidanceNoticeEn: 'Astronomical calculation data is incomplete; no definitive remedy can be assigned.',
        eligibleRemedies: []
      };
    }

    if (result.status === 'DATA_CONFLICT') {
      return {
        doshId: result.doshId,
        doshStatus: result.status,
        hasBhanga: false,
        isRemedyRequired: false,
        guidanceNoticeHi: 'गणनाओं में विरोधाभास के कारण कोई उपाय निर्धारित नहीं किया जा सकता।',
        guidanceNoticeEn: 'Data conflict in calculations; no remedy can be safely recommended.',
        eligibleRemedies: []
      };
    }

    // 2. NOT_PRESENT Guard
    if (result.status === 'NOT_PRESENT') {
      return {
        doshId: result.doshId,
        doshStatus: result.status,
        hasBhanga: false,
        isRemedyRequired: false,
        guidanceNoticeHi: 'इस framework में दोष संकेत उपस्थित नहीं है, अतः किसी निवारक उपाय की आवश्यकता नहीं है।',
        guidanceNoticeEn: 'No traditional indication found within this framework; no corrective remedy is required.',
        eligibleRemedies: []
      };
    }

    // 3. Subsystem-specific rules & Bhanga inspection
    switch (result.doshId) {
      // -------------------------------------------------------------
      // MANGAL DOSHA
      // -------------------------------------------------------------
      case 'MANGAL_DOSHA': {
        const details = result.engineSpecificDetails as any;
        const isCancelled = Boolean(details?.isCancelled);

        if (isCancelled) {
          hasBhanga = true;
          bhangaNoticeHi = 'शास्त्रीय अपवाद/परिहार सक्रिय है; इसलिए अनिवार्य निवारक उपाय आवश्यक नहीं है।';
          bhangaNoticeEn = 'Classical cancellation/mitigation exception is active; corrective remedies are not mandatory.';
          // Only general devotional guidance allowed as optional
          eligibleRemedies = candidateRemedies.filter(
            r => r.eligibilityRule === 'ELIGIBLE_IF_STATUS_PRESENT' && r.nature === 'OPTIONAL_SPIRITUAL_PRACTICE'
          );
          guidanceNoticeHi = 'मंगल परिहार उपस्थित है। नीचे दिए गए अभ्यास केवल आत्म-संयम एवं आंतरिक शांति हेतु वैकल्पिक हैं।';
          guidanceNoticeEn = 'Mars cancellation exception present. The guidance below is purely optional for mental fortitude.';
        } else if (result.status === 'PRESENT') {
          isRemedyRequired = true;
          eligibleRemedies = candidateRemedies.filter(
            r => r.eligibilityRule === 'ELIGIBLE_IF_STATUS_PRESENT' || r.eligibilityRule === 'ELIGIBLE_IF_STATUS_PRESENT_AND_NO_BHANGA'
          );
          guidanceNoticeHi = 'पारंपरिक मांगलिक विचार उपस्थित है। इसे संतुलित दृष्टिकोण और कुंडली मिलान के संदर्भ में समझें।';
          guidanceNoticeEn = 'Traditional Mangal indication present. Review with balanced perspective and horoscope matching principles.';
        }
        break;
      }

      // -------------------------------------------------------------
      // KALA SARPA TRADITION
      // -------------------------------------------------------------
      case 'KALA_SARPA_TRADITION': {
        const details = result.engineSpecificDetails as any;
        const classification = details?.classification;

        if (classification === 'NOT_DETECTED') {
          return {
            doshId: result.doshId,
            doshStatus: result.status,
            hasBhanga: false,
            isRemedyRequired: false,
            guidanceNoticeHi: 'इस framework में कालसर्प संकेत नहीं मिला।',
            guidanceNoticeEn: 'No Kala Sarpa alignment detected within this framework.',
            eligibleRemedies: []
          };
        } else if (classification === 'PARTIAL_CONTAINMENT') {
          return {
            doshId: result.doshId,
            doshStatus: result.status,
            hasBhanga: false,
            isRemedyRequired: false,
            guidanceNoticeHi: 'आंशिक संरेखण (अपूर्ण घेराव) पाया गया है। पारंपरिक मान्यता में यह पूर्ण कालसर्प नहीं है; अतः कालसर्प निवारक अनुष्ठान लागू नहीं होता।',
            guidanceNoticeEn: 'Partial alignment detected. This does not constitute complete Kala Sarpa; specific remedial rituals are not applicable.',
            eligibleRemedies: []
          };
        } else if (classification === 'FULL_CONTAINMENT') {
          isRemedyRequired = true;
          eligibleRemedies = candidateRemedies.filter(
            r => r.eligibilityRule === 'ELIGIBLE_IF_FULL_CONTAINMENT_ONLY'
          );
          guidanceNoticeHi = 'उत्तर-मध्यकालीन/बाद की ज्योतिषीय परंपरा के अनुसार पूर्ण संरेखण उपस्थित है। इसे आध्यात्मिक साधना व जीव-दया से जोड़ें।';
          guidanceNoticeEn = 'Full containment present according to later practitioner tradition. Focus on spiritual mindfulness and kindness to living creatures.';
        }
        break;
      }

      // -------------------------------------------------------------
      // PITRISHAPA / PITRU ANALYSIS
      // -------------------------------------------------------------
      case 'PITRISHAPA_ANALYSIS': {
        if (result.status === 'PRESENT') {
          isRemedyRequired = true;
          eligibleRemedies = candidateRemedies.filter(
            r => r.eligibilityRule === 'ELIGIBLE_IF_STATUS_PRESENT'
          );
          guidanceNoticeHi = 'पाराशरी पितृशाप संकेत उपस्थित है। पूर्वजों के प्रति आदर, तर्पण, गौ-सेवा एवं वृक्षारोपण की शास्त्रीय अनुशंसा है।';
          guidanceNoticeEn = 'Parashari Pitrishapa indication present. Classical tradition recommends respectful Shraddha, care for cows, and planting trees.';
        }
        break;
      }

      // -------------------------------------------------------------
      // GURU CHANDAL ANALYSIS
      // -------------------------------------------------------------
      case 'GURU_CHANDAL_ANALYSIS': {
        if (result.status === 'PRESENT') {
          isRemedyRequired = true;
          eligibleRemedies = candidateRemedies.filter(
            r => r.eligibilityRule === 'ELIGIBLE_IF_STATUS_PRESENT'
          );
          guidanceNoticeHi = 'गुरु चांडाल योग उपस्थित है। गुरुजनों के सम्मान, बौद्धिक विनम्रता एवं स्वाध्याय का सात्विक अभ्यास अनुशंसित है।';
          guidanceNoticeEn = 'Guru Chandal yoga present. Humility toward mentors, ethical contemplation, and study (Svadhyaya) are recommended.';
        }
        break;
      }

      // -------------------------------------------------------------
      // GRAHAN VICHAR ANALYSIS
      // -------------------------------------------------------------
      case 'GRAHAN_VICHAR': {
        if (result.status === 'PRESENT') {
          isRemedyRequired = true;
          eligibleRemedies = candidateRemedies.filter(
            r => r.eligibilityRule === 'ELIGIBLE_IF_STATUS_PRESENT'
          );
          guidanceNoticeHi = 'ग्रहण योग (सूर्य/चंद्र राहु-केतु युति) उपस्थित है। मानसिक शांति हेतु गायत्री ध्यान व अन्नदान पारंपरिक रूप से मान्य हैं।';
          guidanceNoticeEn = 'Grahan yoga present. Quiet contemplation, Gayatri meditation, and food charity are traditionally observed.';
        }
        break;
      }

      // -------------------------------------------------------------
      // KEMADRUMA YOGA & BHANGA
      // -------------------------------------------------------------
      case 'KEMADRUMA_ANALYSIS': {
        const details = result.engineSpecificDetails as any;
        const bhangaPresent = Boolean(details?.bhangaPresent);

        if (bhangaPresent) {
          hasBhanga = true;
          isRemedyRequired = false;
          bhangaNoticeHi = 'भंग/शमन नियम सक्रिय है; इसलिए इस framework में अलग corrective उपाय आवश्यक नहीं माना जा रहा।';
          bhangaNoticeEn = 'Bhanga/mitigation rule is active; therefore, within this framework, a separate corrective remedy is not considered necessary.';
          // Suppress corrective remedies. Do NOT show required remedies.
          eligibleRemedies = [];
          guidanceNoticeHi = 'केमद्रुम भंग उपस्थित है। शास्त्रीय मतानुसार चंद्र केंद्र-बल या शुभ दृष्टि से दोष प्रभाव समाप्त होकर राजयोग में रूपांतरित होता है।';
          guidanceNoticeEn = 'Kemadruma Bhanga is present. According to classical tenets, planetary Kendras cancel the affliction, making corrective remedies unnecessary.';
        } else if (result.status === 'PRESENT') {
          isRemedyRequired = true;
          eligibleRemedies = candidateRemedies.filter(
            r => r.eligibilityRule === 'ELIGIBLE_ONLY_IF_BASE_PRESENT_AND_BHANGA_IS_FALSE'
          );
          guidanceNoticeHi = 'मूल केमद्रुम उपस्थित है और भंग नहीं मिला। मानसिक स्थिरता, नियमित दिनचर्या एवं शिव उपासना का पारंपरिक परामर्श है।';
          guidanceNoticeEn = 'Base Kemadruma present without Bhanga. Traditional advice encourages structured daily routine and mental centering.';
        }
        break;
      }

      // -------------------------------------------------------------
      // SHANI SADE SATI & DHAIYYA
      // -------------------------------------------------------------
      case 'SHANI_SADE_SATI_DHAIYYA_ANALYSIS': {
        const details = result.engineSpecificDetails as any;
        const classification = details?.classification;

        if (
          result.status === 'PRESENT' ||
          classification === 'SADE_SATI' ||
          classification === 'DHAIYYA_4TH' ||
          classification === 'DHAIYYA_8TH' ||
          classification === 'SADE_SATI_RISING' ||
          classification === 'SADE_SATI_PEAK' ||
          classification === 'SADE_SATI_SETTING' ||
          classification === 'KANTAKA_DHAIYYA' ||
          classification === 'ASHTAMA_DHAIYYA'
        ) {
          isRemedyRequired = true;
          eligibleRemedies = candidateRemedies.filter(
            r => r.eligibilityRule === 'ELIGIBLE_IF_SADE_SATI_OR_DHAIYYA_ACTIVE'
          );
          guidanceNoticeHi = 'शनि गोचर प्रभाव (साढ़ेसाती अथवा ढैया) सक्रिय है। श्रमिकों की सेवा, न्यायसंगत आचरण एवं दशरथकृत शनि स्तोत्र पारंपरिक रूप से अनुशंसित हैं।';
          guidanceNoticeEn = 'Saturn transit phase (Sade Sati or Dhaiyya) is active. Respect for manual laborers, fair conduct, and Dasharatha Stotra are traditionally recommended.';
        } else {
          return {
            doshId: result.doshId,
            doshStatus: result.status,
            hasBhanga: false,
            isRemedyRequired: false,
            guidanceNoticeHi: 'वर्तमान में शनि साढ़ेसाती अथवा ढैया का गोचर प्रभाव सक्रिय नहीं है।',
            guidanceNoticeEn: 'Saturn Sade Sati or Dhaiyya transit is not currently active.',
            eligibleRemedies: []
          };
        }
        break;
      }

      default:
        eligibleRemedies = [];
        break;
    }

    return {
      doshId: result.doshId,
      doshStatus: result.status,
      hasBhanga,
      isRemedyRequired,
      bhangaNoticeHi,
      bhangaNoticeEn,
      guidanceNoticeHi,
      guidanceNoticeEn,
      eligibleRemedies
    };
  }
}
