import { notFound } from 'next/navigation';
import { locales, isRTL, type Locale } from '@/lib/i18n';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const direction = isRTL(locale) ? 'rtl' : 'ltr';

  return (
    <div dir={direction} className="min-h-screen">
      {children}
    </div>
  );
}
