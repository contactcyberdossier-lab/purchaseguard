'use client';

// ========================================================
// Public Landing Header
// ========================================================

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Menu, X } from 'lucide-react';
import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { getDictionary } from '@/lib/i18n';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const dict = getDictionary(locale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            {dict.common.appName}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href={`#features`} className="hover:text-foreground transition-colors">
            {dict.nav.features}
          </Link>
          <Link href={`#how-it-works`} className="hover:text-foreground transition-colors">
            {dict.nav.howItWorks}
          </Link>
          <Link href={`#pricing`} className="hover:text-foreground transition-colors">
            {dict.nav.pricing}
          </Link>
          <Link href={`#security`} className="hover:text-foreground transition-colors">
            {dict.nav.security}
          </Link>
          <Link href={`#faq`} className="hover:text-foreground transition-colors">
            {dict.nav.faq}
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector currentLocale={locale} />
          <ThemeToggle />
          <Link href={`/${locale}/login`}>
            <Button variant="ghost" size="sm">
              {dict.nav.signIn}
            </Button>
          </Link>
          <Link href={`/${locale}/register`}>
            <Button size="sm">
              {dict.nav.getStarted}
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector currentLocale={locale} />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2.5 text-base font-medium text-foreground">
            <Link
              href={`#features`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:bg-accent rounded-lg"
            >
              {dict.nav.features}
            </Link>
            <Link
              href={`#how-it-works`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:bg-accent rounded-lg"
            >
              {dict.nav.howItWorks}
            </Link>
            <Link
              href={`#pricing`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:bg-accent rounded-lg"
            >
              {dict.nav.pricing}
            </Link>
            <Link
              href={`#security`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:bg-accent rounded-lg"
            >
              {dict.nav.security}
            </Link>
            <Link
              href={`#faq`}
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:bg-accent rounded-lg"
            >
              {dict.nav.faq}
            </Link>
          </nav>
          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <Link href={`/${locale}/login`} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                {dict.nav.signIn}
              </Button>
            </Link>
            <Link href={`/${locale}/register`} onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">
                {dict.nav.getStarted}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
