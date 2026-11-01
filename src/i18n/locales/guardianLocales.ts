/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — GUARDIAN LOCALES
 */

export interface GuardianTranslation {
  title: string;
  ownerControlCenter: string;
  securityStatus: string;
  safeStatus: string;
  level1: string;
  level2: string;
  level3: string;
  auditLogs: string;
  approvalRequests: string;
  backups: string;
  secretPinPrompt: string;
  pinRequired: string;
  submit: string;
  cancel: string;
}

const enGuardian: GuardianTranslation = {
  title: 'Guardian Security Monitor',
  ownerControlCenter: 'Owner Control Center',
  securityStatus: 'Security Status',
  safeStatus: 'SAFE / ACTIVE',
  level1: 'Level 1: Auto-Recover',
  level2: 'Level 2: Owner Approval',
  level3: 'Level 3: Critical Lock',
  auditLogs: 'Audit Logs',
  approvalRequests: 'Approval Requests',
  backups: 'System Backups',
  secretPinPrompt: 'Enter Owner Secret PIN',
  pinRequired: 'Secret PIN is required to authorize critical actions.',
  submit: 'Authorize',
  cancel: 'Cancel'
};

const hiGuardian: GuardianTranslation = {
  title: 'गार्जियन सुरक्षा एवं निगरानी केंद्र',
  ownerControlCenter: 'स्वामी नियंत्रण केंद्र',
  securityStatus: 'सुरक्षा स्थिति',
  safeStatus: 'सुरक्षित एवं सक्रिय',
  level1: 'स्तर 1: स्वतः सुधार',
  level2: 'स्तर 2: स्वामी अनुमोदन',
  level3: 'स्तर 3: क्रिटिकल लॉक',
  auditLogs: 'ऑडिट लॉग्स',
  approvalRequests: 'अनुमोदन अनुरोध',
  backups: 'बैकअप एवं पुनर्प्राप्ति',
  secretPinPrompt: 'स्वामी गुप्त पिन दर्ज करें',
  pinRequired: 'महत्वपूर्ण कार्यों के लिए गुप्त पिन आवश्यक है।',
  submit: 'प्रमाणित करें',
  cancel: 'रद्द करें'
};

const teGuardian: GuardianTranslation = {
  ...enGuardian,
  ownerControlCenter: 'యజమాని నియంత్రణ కేంద్రం',
  securityStatus: 'భద్రతా స్థితి',
  safeStatus: 'సురక్షితం & చురుకుగా ఉంది'
};

export const guardianLocales: Record<string, GuardianTranslation> = {
  en: enGuardian,
  hi: hiGuardian,
  mr: hiGuardian,
  gu: hiGuardian,
  bn: hiGuardian,
  ta: enGuardian,
  te: teGuardian,
  kn: enGuardian,
  ml: enGuardian,
  pa: hiGuardian,
  or: hiGuardian,
  as: hiGuardian,
  sa: hiGuardian,
  es: enGuardian,
  fr: enGuardian,
  de: enGuardian,
  ru: enGuardian
};
