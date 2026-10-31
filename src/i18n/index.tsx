import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, LanguageInfo, SUPPORTED_LANGUAGES, TranslationDictionary } from './types';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { ru } from './locales/ru';
import { mr } from './locales/mr';
import { gu } from './locales/gu';
import { bn } from './locales/bn';
import { ta } from './locales/ta';
import { te } from './locales/te';
import { kn } from './locales/kn';
import { ml } from './locales/ml';
import { pa } from './locales/pa';
import { or } from './locales/or';
import { as } from './locales/as';
import { sa } from './locales/sa';
import { guardianLocales } from './locales/guardianLocales';
import { meditationLocales } from './locales/meditationLocales';

export * from './types';

export const LOCALES: Record<LanguageCode, TranslationDictionary> = {
  en: { ...en, guardian: guardianLocales.en, meditation: meditationLocales.en },
  hi: { ...hi, guardian: guardianLocales.hi, meditation: meditationLocales.hi },
  es: { ...es, guardian: guardianLocales.en, meditation: meditationLocales.en },
  fr: { ...fr, guardian: guardianLocales.en, meditation: meditationLocales.en },
  de: { ...de, guardian: guardianLocales.en, meditation: meditationLocales.en },
  ru: { ...ru, guardian: guardianLocales.en, meditation: meditationLocales.en },
  mr: { ...mr, guardian: guardianLocales.mr, meditation: meditationLocales.hi },
  gu: { ...gu, guardian: guardianLocales.gu, meditation: meditationLocales.hi },
  bn: { ...bn, guardian: guardianLocales.bn, meditation: meditationLocales.hi },
  ta: { ...ta, guardian: guardianLocales.ta, meditation: meditationLocales.hi },
  te: { ...te, guardian: guardianLocales.te, meditation: meditationLocales.hi },
  kn: { ...kn, guardian: guardianLocales.kn, meditation: meditationLocales.hi },
  ml: { ...ml, guardian: guardianLocales.ml, meditation: meditationLocales.hi },
  pa: { ...pa, guardian: guardianLocales.pa, meditation: meditationLocales.hi },
  or: { ...or, guardian: guardianLocales.or, meditation: meditationLocales.hi },
  as: { ...as, guardian: guardianLocales.as, meditation: meditationLocales.hi },
  sa: { ...sa, guardian: guardianLocales.sa, meditation: meditationLocales.hi }
};

const STORAGE_KEY = 'jeevandarpan_language';
const DEFAULT_LANGUAGE: LanguageCode = 'hi'; // Hindi as default Vedic spiritual experience

export function getStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in LOCALES) {
      return stored as LanguageCode;
    }
  } catch (e) {
    console.warn('Failed to read stored language:', e);
  }
  return DEFAULT_LANGUAGE;
}

export function setStoredLanguage(code: LanguageCode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
    // Dispatch custom event so non-React components can react if needed
    window.dispatchEvent(new CustomEvent('jeevandarpan_language_changed', { detail: code }));
  } catch (e) {
    console.warn('Failed to save language:', e);
  }
}

let currentActiveLanguage: LanguageCode = getStoredLanguage();

/**
 * Universal translator function that works both inside and outside React components.
 * Supports dot notation: t('dashboard.masterProfile')
 * Interpolates variables: t('daily.greeting', { name: 'Jitendra' })
 */
const ALIAS_MAP: Record<string, string> = {
  'kundli.dashaEnds': 'kundli.endsLabel',
  'common.unavailable': 'common.notAvailable',
  'report.verifiedNotice': 'reportCenter.verifiedNotice',
  'kundli.degreeLabel': 'reportCenter.degree',
  'kundli.nakshatraLabel': 'reportCenter.nakshatra',
  'kundli.motionLabel': 'reportCenter.motion',
  'report.headerTitle': 'reportCenter.headerTitle',
  'report.section1Title': 'reportCenter.section1Title',
  'report.section2Title': 'reportCenter.section2Title',
  'report.section3Title': 'reportCenter.section3Title',
  'report.section4Title': 'reportCenter.section4Title',
  'report.section7Title': 'reportCenter.section7Title',
  'report.generatePdf': 'reportCenter.generatePdf',
  'kundli.ascendant': 'kundli.ascendantTitle',
  'kundli.nakshatraTable': 'kundli.nakshatra',
  'kundli.dasha': 'kundli.dashaTimelineTitle',
  'kundli.currentMahadasha': 'kundli.nextMahadashaTitle',
  'kundli.yogas': 'kundli.yogasTitle',
  'common.dashboard': 'nav.dashboard',
  'report.shareCancelled': 'common.shareCancelled',
  'common.copied': 'common.copiedToClipboard',
  'common.saved': 'report.savedSuccess',
  'report.sensitivityRemoved': 'report.savedSuccess',
  'common.back': 'common.goBack',
  'daily.greeting': 'dashboard.masterProfile'
};

function resolveInObject(obj: any, parts: string[]): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else if (i === parts.length - 1 && current && typeof current === 'object') {
      // Try suffix variants on the leaf key
      const variants = [
        part + 'Title',
        part + 'Label',
        part + 'Badge',
        part + 'Btn',
        part + 'Desc',
        part.replace(/(Title|Label|Badge|Btn|Desc)$/, '')
      ];
      let found = false;
      for (const v of variants) {
        if (v in current) {
          current = current[v];
          found = true;
          break;
        }
      }
      if (!found) return undefined;
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

export function t(
  keyPath: string, 
  params?: Record<string, string | number>, 
  langOverride?: LanguageCode
): string {
  if (!keyPath) return '';

  if (ALIAS_MAP[keyPath]) {
    keyPath = ALIAS_MAP[keyPath];
  }

  // If keyPath is already a localized phrase or contains whitespace/punctuation, return directly
  if (keyPath.includes(' ') || /[\u0900-\u097F]/.test(keyPath) || !keyPath.includes('.')) {
    // Check if it exists as a top-level key first
    const activeLang = langOverride || currentActiveLanguage || DEFAULT_LANGUAGE;
    const directLookup = (LOCALES[activeLang] as any)?.[keyPath] || (LOCALES.hi as any)?.[keyPath];
    if (typeof directLookup === 'string') {
      keyPath = directLookup;
    } else if (keyPath.includes(' ') || /[\u0900-\u097F]/.test(keyPath)) {
      return keyPath;
    }
  }

  const activeLang = langOverride || currentActiveLanguage || DEFAULT_LANGUAGE;
  const parts = keyPath.split('.');

  // Step 1: Active Language
  let current = resolveInObject(LOCALES[activeLang], parts);

  // Step 2: Fallback to Hindi
  if (!current && activeLang !== 'hi') {
    current = resolveInObject(LOCALES.hi, parts);
  }

  // Step 3: Fallback to English
  if (!current && activeLang !== 'en') {
    current = resolveInObject(LOCALES.en, parts);
  }

  // Step 4: Graceful Humanized Fallback (CRITICAL: NEVER DISPLAY RAW TECHNICAL DOT-PATHS TO USER)
  if (typeof current !== 'string') {
    const leaf = parts[parts.length - 1];
    // Split camelCase to words
    const humanized = leaf
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/ Title| Label| Badge| Btn| Desc/g, '')
      .trim();
    return humanized || keyPath;
  }

  // Parameter replacement: {name} -> Jitendra
  if (params) {
    let result = current;
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
    return result;
  }

  return current;
}

export function getCurrentLanguage(): LanguageCode {
  return currentActiveLanguage;
}

export function getCurrentLanguageInfo(): LanguageInfo {
  return SUPPORTED_LANGUAGES.find(l => l.code === currentActiveLanguage) || SUPPORTED_LANGUAGES[0];
}

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
  languages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo;
}

const I18nContext = createContext<I18nContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (k: string) => k,
  languages: SUPPORTED_LANGUAGES,
  currentLanguageInfo: SUPPORTED_LANGUAGES[0]
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => getStoredLanguage());

  const setLanguage = (code: LanguageCode) => {
    if (code in LOCALES) {
      setLanguageState(code);
      currentActiveLanguage = code;
      setStoredLanguage(code);
    }
  };

  useEffect(() => {
    currentActiveLanguage = language;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue in LOCALES) {
        setLanguageState(e.newValue as LanguageCode);
        currentActiveLanguage = e.newValue as LanguageCode;
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [language]);

  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const translate = (keyPath: string, params?: Record<string, string | number>) => {
    return t(keyPath, params, language);
  };

  return (
    <I18nContext.Provider value={{
      language,
      setLanguage,
      t: translate,
      languages: SUPPORTED_LANGUAGES,
      currentLanguageInfo
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      language: currentActiveLanguage,
      setLanguage: (code: LanguageCode) => {
        currentActiveLanguage = code;
        setStoredLanguage(code);
      },
      t: (keyPath: string, params?: Record<string, string | number>) => t(keyPath, params, currentActiveLanguage),
      languages: SUPPORTED_LANGUAGES,
      currentLanguageInfo: getCurrentLanguageInfo()
    };
  }
  return context;
}

export const useLanguage = useTranslation;
export const useI18n = useTranslation;
