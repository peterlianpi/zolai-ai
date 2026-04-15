import { cookies } from 'next/headers';

export type Locale = 'en' | 'my';

export const locales: Locale[] = ['en', 'my'];

export const DEFAULT_LOCALE: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  my: 'မြန်မာ',
};

export const LOCALES = {
  en: {
    code: 'en' as Locale,
    name: 'English',
    direction: 'ltr',
  },
  my: {
    code: 'my' as Locale,
    name: 'မြန်မာ',
    direction: 'ltr',
  },
};

export type LocaleCode = keyof typeof LOCALES;

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value as Locale;
  return localeCookie && locales.includes(localeCookie) ? localeCookie : 'en';
}

// Date formatting utilities for Myanmar
export function formatDateForLocale(date: Date, locale: Locale): string {
  if (locale === 'my') {
    // Myanmar date formatting
    const myanmarMonths = [
      'ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်',
      'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'
    ];
    
    const day = date.getDate();
    const month = myanmarMonths[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  }
  
  // Default English formatting
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTimeForLocale(date: Date, locale: Locale): string {
  if (locale === 'my') {
    // Myanmar time formatting (12-hour format is common)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Phone number validation for Myanmar
export function validateMyanmarPhoneNumber(phone: string): boolean {
  // Myanmar phone number patterns:
  // Mobile: +95 9xxxxxxxx or 09xxxxxxxx
  // Fixed: +95 1xxxxxxx or 01xxxxxxx
  const myanmarPhoneRegex = /^(\+?95|0)?[1-9]\d{6,9}$/;
  return myanmarPhoneRegex.test(phone.replace(/\s+/g, ''));
}

export function formatMyanmarPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('95')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('9') && cleaned.length === 9) {
    return `+959${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('0')) {
    return `+95${cleaned.substring(1)}`;
  }
  
  return phone;
}