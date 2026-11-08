// ========================================================
// Public Footer - Luxury Redesign with Policy Compliance
// ========================================================

import Link from 'next/link';
import { Shield, Sparkles } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer className="border-t border-white/[0.08] dark:border-white/[0.05] bg-background dark:bg-[#05070c] pt-20 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                {dict.common.appName}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {dict.common.tagline}
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>SOC-2 & Zero-Knowledge Architecture</span>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] font-semibold text-foreground mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
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
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] font-semibold text-foreground mb-4">
              Operations
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
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
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-5 mb-10 text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground mb-1">Notice & Disclaimer:</p>
          <p>{dict.claims.approvedStatement}</p>
          <p className="mt-1 text-muted-foreground/80">{dict.claims.decisionNotice}</p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground/75 border-t border-white/[0.06] pt-8 gap-3">
          <p>{dict.footer.copyright}</p>
          <p>Architected for luxury, consumer protection, and security.</p>
        </div>
      </div>
    </footer>
  );
}
