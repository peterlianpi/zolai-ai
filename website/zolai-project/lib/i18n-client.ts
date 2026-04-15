"use client";

import { useState } from 'react';
import enCommon from '@/locales/en/common.json';
import myCommon from '@/locales/my/common.json';

export type Locale = 'en' | 'my';

export const locales: Locale[] = ['en', 'my'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  my: 'မြန်မာ',
};

// Translation resources
const translations = {
  en: {
    common: enCommon,
  },
  my: {
    common: myCommon,
  },
};

export function setLocale(locale: Locale) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`; // 1 year
  window.location.reload();
}

// Hook for client-side locale management
export function useLocale() {
  const [locale, _setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    
    const urlLocale = window.location.pathname.startsWith('/my') ? 'my' : 'en';
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1] as Locale;

    const currentLocale = urlLocale || cookieLocale || 'en';
    return locales.includes(currentLocale) ? currentLocale : 'en';
  });

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return { locale, changeLocale };
}

// Translation function
type TranslationPath = string;

function getNestedTranslation(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce((current: unknown, key: string): unknown => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return path;
  }, obj) as string;
}

export function t(key: TranslationPath, locale: Locale = 'en'): string {
  const [namespace, ...keyParts] = key.split('.');
  const translationKey = keyParts.join('.');
  
  const namespaceTranslations = translations[locale]?.[namespace as keyof typeof translations[Locale]];
  
  if (!namespaceTranslations) {
    console.warn(`Translation namespace '${namespace}' not found for locale '${locale}'`);
    return key;
  }

  const translation = getNestedTranslation(namespaceTranslations, translationKey);
  
  if (translation === translationKey) {
    // Fallback to English if translation not found
    if (locale !== 'en') {
      return t(key, 'en');
    }
    console.warn(`Translation key '${key}' not found`);
  }
  
  return translation;
}

// Hook for translations
export function useTranslation() {
  const { locale } = useLocale();
  
  return {
    t: (key: TranslationPath) => t(key, locale),
    locale,
  };
}

// Client translation function
export function getTranslation(locale: Locale) {
  return {
    t: (key: TranslationPath) => t(key, locale),
    locale,
  };
}