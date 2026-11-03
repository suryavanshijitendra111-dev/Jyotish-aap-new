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

const esGuardian: GuardianTranslation = {
  title: 'Monitor de Seguridad Guardian',
  ownerControlCenter: 'Centro de Control del Propietario',
  securityStatus: 'Estado de Seguridad',
  safeStatus: 'SEGURO / ACTIVO',
  level1: 'Nivel 1: Autorrecuperación',
  level2: 'Nivel 2: Aprobación del Propietario',
  level3: 'Nivel 3: Bloqueo Crítico',
  auditLogs: 'Registros de Auditoría',
  approvalRequests: 'Solicitudes de Aprobación',
  backups: 'Respaldos del Sistema',
  secretPinPrompt: 'Ingrese el PIN Secreto del Propietario',
  pinRequired: 'Se requiere PIN secreto para autorizar acciones críticas.',
  submit: 'Autorizar',
  cancel: 'Cancelar'
};

const frGuardian: GuardianTranslation = {
  title: 'Moniteur de Sécurité Guardian',
  ownerControlCenter: 'Centre de Contrôle du Propriétaire',
  securityStatus: 'État de Sécurité',
  safeStatus: 'SÛR / ACTIF',
  level1: 'Niveau 1: Récupération Automatique',
  level2: 'Niveau 2: Approbation du Propriétaire',
  level3: 'Niveau 3: Verrouillage Critique',
  auditLogs: 'Journaux d’Audit',
  approvalRequests: 'Demandes d’Approbation',
  backups: 'Sauvegardes du Système',
  secretPinPrompt: 'Entrez le PIN Secret du Propriétaire',
  pinRequired: 'Un PIN secret est requis pour autoriser les actions critiques.',
  submit: 'Autoriser',
  cancel: 'Annuler'
};

const deGuardian: GuardianTranslation = {
  title: 'Guardian Sicherheitsmonitor',
  ownerControlCenter: 'Eigentümer-Kontrollzentrum',
  securityStatus: 'Sicherheitsstatus',
  safeStatus: 'SICHER / AKTIV',
  level1: 'Stufe 1: Selbstreparatur',
  level2: 'Stufe 2: Eigentümer-Freigabe',
  level3: 'Stufe 3: Kritische Sperre',
  auditLogs: 'Audit-Protokolle',
  approvalRequests: 'Freigabeanfragen',
  backups: 'System-Backups',
  secretPinPrompt: 'Geheime PIN des Eigentümers eingeben',
  pinRequired: 'Geheime PIN ist erforderlich, um kritische Aktionen zu autorisieren.',
  submit: 'Autorisieren',
  cancel: 'Abbrechen'
};

const ruGuardian: GuardianTranslation = {
  title: 'Монитор Безопасности Guardian',
  ownerControlCenter: 'Центр Управления Владельца',
  securityStatus: 'Статус Безопасности',
  safeStatus: 'БЕЗОПАСНО / АКТИВНО',
  level1: 'Уровень 1: Автовосстановление',
  level2: 'Уровень 2: Одобрение Владельца',
  level3: 'Уровень 3: Критическая Блокировка',
  auditLogs: 'Журналы Аудита',
  approvalRequests: 'Запросы на Одобрение',
  backups: 'Резервные Копии',
  secretPinPrompt: 'Введите Секретный PIN Владельца',
  pinRequired: 'Секретный PIN требуется для авторизации критических действий.',
  submit: 'Авторизовать',
  cancel: 'Отмена'
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
  es: esGuardian,
  fr: frGuardian,
  de: deGuardian,
  ru: ruGuardian
};
