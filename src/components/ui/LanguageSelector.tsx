'use client';

// ========================================================
// International Language Selector
// ========================================================

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/lib/i18n';
import { Globe, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  currentLocale: string;
}

export function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (newLocale: Locale) => {
    setIsOpen(false);
    // Set 1-year persistent cookie for user preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Replace the current locale in pathname
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join('/') || `/${newLocale}`;
    router.push(newPath);
  };

  const activeLocaleData = localeNames[currentLocale as Locale] || localeNames.en;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select Language"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="hidden sm:inline">{activeLocaleData.nativeName}</span>
        <span className="inline sm:hidden">{activeLocaleData.flag}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            {locales.map((loc) => {
              const data = localeNames[loc];
              const isSelected = loc === currentLocale;
              return (
                <button
                  key={loc}
                  onClick={() => changeLanguage(loc)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors text-left rtl:text-right ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-accent text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{data.flag}</span>
                    <span>{data.nativeName}</span>
                  </span>
                  <span className="text-xs text-muted-foreground uppercase">{loc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
