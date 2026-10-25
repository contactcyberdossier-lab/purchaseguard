// ========================================================
// Hero Section
// ========================================================

import Link from 'next/link';
import { ShieldCheck, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { getDictionary } from '@/lib/i18n';

interface HeroProps {
  locale: string;
}

export function Hero({ locale }: HeroProps) {
  const dict = getDictionary(locale);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{dict.hero.badge}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground whitespace-pre-line leading-[1.1] mb-6">
          {dict.hero.title}
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-muted-foreground leading-relaxed mb-10">
          {dict.hero.subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href={`/${locale}/register`} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 shadow-md">
              {dict.hero.ctaPrimary}
              <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180 rtl:mr-2 rtl:ml-0" />
            </Button>
          </Link>
          <Link href="#how-it-works" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
              {dict.hero.ctaSecondary}
            </Button>
          </Link>
        </div>

        {/* Reassurance text */}
        <p className="text-xs sm:text-sm text-muted-foreground mb-12">
          {dict.hero.reassurance}
        </p>

        {/* Interactive App Preview Mockup Card */}
        <div className="relative mx-auto max-w-4xl rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-2 text-xs font-mono text-muted-foreground">app.purchaseguard.app</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3 Returns Monitored</span>
            </div>
          </div>

          {/* Sample Active Return Rows */}
          <div className="space-y-3 text-left rtl:text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-background border border-border hover:border-primary/40 transition-colors gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs">
                  AMZN
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Sony WH-1000XM5 Wireless Headphones</h4>
                  <p className="text-xs text-muted-foreground">Ordered Oct 18, 2026 • Order #114-8930211</p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <div className="text-right rtl:text-left">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                    <Clock className="w-3 h-3" /> 4 days left to return
                  </span>
                </div>
                <span className="font-semibold text-sm text-foreground">$398.00</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-background border border-border hover:border-primary/40 transition-colors gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                  BBUY
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Dell 27" 4K UHD USB-C Monitor</h4>
                  <p className="text-xs text-muted-foreground">Ordered Oct 04, 2026 • Order #BBY01-78219</p>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <div className="text-right rtl:text-left">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    <ShieldCheck className="w-3 h-3" /> Warranty Active (345d)
                  </span>
                </div>
                <span className="font-semibold text-sm text-foreground">$549.99</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
