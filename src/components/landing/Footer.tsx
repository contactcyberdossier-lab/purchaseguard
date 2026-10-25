// ========================================================
// Public Footer with Compliance and Disclaimers
// ========================================================

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer className="border-t border-border bg-background pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                {dict.common.appName}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              {dict.common.tagline}
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors">
                  {dict.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors">
                  {dict.footer.termsOfService}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cookies`} className="hover:text-foreground transition-colors">
                  {dict.footer.cookiePolicy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Operations
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href="https://status.purchaseguard.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  {dict.footer.statusPage}
                </a>
              </li>
              <li>
                <a href="mailto:support@purchaseguard.app" className="hover:text-foreground transition-colors">
                  {dict.footer.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Policy Disclaimer Notice */}
        <div className="rounded-xl border border-border/80 bg-muted/40 p-4 mb-8 text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground mb-1">Notice & Disclaimer:</p>
          <p>{dict.claims.approvedStatement}</p>
          <p className="mt-1">{dict.claims.decisionNotice}</p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-8">
          <p>{dict.footer.copyright}</p>
          <p className="mt-2 sm:mt-0">Built for security, privacy, and consumer protection.</p>
        </div>
      </div>
    </footer>
  );
}
