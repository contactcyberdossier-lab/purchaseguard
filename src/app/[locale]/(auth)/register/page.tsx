import Link from 'next/link';
import { Shield } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getDictionary } from '@/lib/i18n';

interface RegisterPageProps {
  params: {
    locale: string;
  };
}

export default function RegisterPage({ params: { locale } }: RegisterPageProps) {
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            {dict.common.appName}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector currentLocale={locale} />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Form Center */}
      <div className="my-auto py-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm max-w-md mx-auto">
          <RegisterForm locale={locale} />
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="text-center text-xs text-muted-foreground max-w-md mx-auto">
        {dict.claims.approvedStatement}
      </div>
    </div>
  );
}
