'use client';

// ========================================================
// Authenticated Dashboard Header
// ========================================================

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { getDictionary } from '@/lib/i18n';

interface DashboardHeaderProps {
  locale: string;
  userEmail?: string;
}

export function DashboardHeader({ locale, userEmail }: DashboardHeaderProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline">
              {dict.common.appName}
            </span>
          </Link>
          <span className="hidden md:inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground font-mono">
            MVP v1.0
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector currentLocale={locale} />
          <ThemeToggle />

          {/* User profile info & sign out */}
          <div className="flex items-center gap-2 pl-2 border-l border-border rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-2">
            <div className="hidden lg:flex flex-col text-right rtl:text-left text-xs">
              <span className="font-semibold text-foreground max-w-[140px] truncate">
                {userEmail || 'My Account'}
              </span>
              <span className="text-muted-foreground text-[10px]">Free Tier</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive flex items-center gap-1.5"
              title={dict.common.logout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">{dict.common.logout}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
