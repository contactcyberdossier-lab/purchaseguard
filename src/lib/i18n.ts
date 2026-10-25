// ========================================================
// PurchaseGuard Internationalization Configuration & Utilities
// ========================================================

import en from '../../messages/en.json';
import es from '../../messages/es.json';
import fr from '../../messages/fr.json';
import de from '../../messages/de.json';
import pt from '../../messages/pt.json';
import it from '../../messages/it.json';
import nl from '../../messages/nl.json';
import hi from '../../messages/hi.json';
import ar from '../../messages/ar.json';

export const locales = ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'hi', 'ar'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const rtlLocales: Locale[] = ['ar'];

export function isRTL(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

export const localeNames: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
};

const dictionaries: Record<Locale, typeof en> = {
  en,
  es: es as unknown as typeof en,
  fr: fr as unknown as typeof en,
  de: de as unknown as typeof en,
  pt: pt as unknown as typeof en,
  it: it as unknown as typeof en,
  nl: nl as unknown as typeof en,
  hi: hi as unknown as typeof en,
  ar: ar as unknown as typeof en,
};

export function getDictionary(locale: string): typeof en {
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  return dictionaries[safeLocale];
}

/**
 * Format currency with international locale sensitivity
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Format dates honoring target user locale and timezone
 */
export function formatDate(
  dateString: string | Date,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(d);
  } catch {
    return String(dateString);
  }
}
