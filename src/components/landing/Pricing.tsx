// ========================================================
// Pricing Section - Luxury Redesign
// ========================================================

import Link from 'next/link';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { getDictionary } from '@/lib/i18n';

interface PricingProps {
  locale: string;
}

export function Pricing({ locale }: PricingProps) {
  const dict = getDictionary(locale);

  return (
    <section id="pricing" className="py-28 relative overflow-hidden bg-background/50 dark:bg-[#070a12]/60 border-y border-white/[0.08] dark:border-white/[0.05]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-indigo-400 font-semibold mb-3 inline-block">
            Transparent Investment
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {dict.pricing.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {dict.pricing.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.1] dark:border-white/[0.07] bg-card/60 dark:bg-white/[0.02] backdrop-blur-xl p-8 hover:border-white/20 transition-all duration-300">
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground">{dict.pricing.freeTitle}</h3>
                <p className="text-xs text-muted-foreground mt-1 min-h-[36px]">{dict.pricing.freeDesc}</p>
              </div>

              <div className="mt-4 mb-8 flex items-baseline">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">{dict.pricing.freePrice}</span>
                <span className="text-xs font-mono text-muted-foreground ml-2">/ forever</span>
              </div>

              <div className="space-y-3.5 pt-6 border-t border-white/[0.06] mb-8">
                <div className="flex items-center gap-2.5 text-sm text-foreground/90">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{dict.pricing.freeFeature1}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground/90">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{dict.pricing.freeFeature2}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground/90">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{dict.pricing.freeFeature3}</span>
                </div>
              </div>
            </div>

            <Link href={`/${locale}/register`} className="w-full">
              <Button variant="outline" className="w-full h-12 rounded-xl bg-white/[0.03] border-white/[0.1] hover:bg-white/[0.08] text-foreground font-semibold">
                {dict.pricing.freeCta}
              </Button>
            </Link>
          </div>

          {/* Plus Tier (Featured Luxury Card) */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-indigo-500/60 bg-gradient-to-b from-indigo-950/20 via-card/80 to-card/60 dark:from-indigo-950/40 dark:via-[#0c101d] dark:to-[#090d16] backdrop-blur-2xl p-8 shadow-[0_0_50px_rgba(99,102,241,0.22)] md:-translate-y-2 transition-all duration-300">
            {/* Top luxury badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Most Popular</span>
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  {dict.pricing.plusTitle}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 min-h-[36px]">{dict.pricing.plusDesc}</p>
              </div>

              <div className="mt-4 mb-8 flex items-baseline">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">{dict.pricing.plusPrice}</span>
                <span className="text-xs font-mono text-muted-foreground ml-2">/ month</span>
              </div>

              <div className="space-y-3.5 pt-6 border-t border-indigo-500/20 mb-8">
                <div className="flex items-center gap-2.5 text-sm text-foreground font-medium">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>{dict.pricing.plusFeature1}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground font-medium">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>{dict.pricing.plusFeature2}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground font-medium">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>{dict.pricing.plusFeature3}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground font-medium">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>{dict.pricing.plusFeature4}</span>
                </div>
              </div>
            </div>

            <Link href={`/${locale}/register?plan=plus`} className="w-full">
              <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-[0_10px_25px_-5px_rgba(99,102,241,0.4)] border border-indigo-400/25">
                {dict.pricing.plusCta}
              </Button>
            </Link>
          </div>

          {/* Annual Saver */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.1] dark:border-white/[0.07] bg-card/60 dark:bg-white/[0.02] backdrop-blur-xl p-8 hover:border-emerald-500/40 transition-all duration-300">
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">{dict.pricing.annualTitle}</h3>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {dict.pricing.annualBadge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 min-h-[36px]">{dict.pricing.annualDesc}</p>
              </div>

              <div className="mt-4 mb-8 flex items-baseline">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">{dict.pricing.annualPrice}</span>
                <span className="text-xs font-mono text-muted-foreground ml-2">/ year</span>
              </div>

              <div className="space-y-3.5 pt-6 border-t border-white/[0.06] mb-8">
                <div className="flex items-center gap-2.5 text-sm text-foreground/90">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{dict.pricing.plusFeature1}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground/90">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{dict.pricing.plusFeature2}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground/90">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>2 Months Free Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground/90">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Priority Concierge Support</span>
                </div>
              </div>
            </div>

            <Link href={`/${locale}/register?plan=annual`} className="w-full">
              <Button variant="outline" className="w-full h-12 rounded-xl bg-white/[0.03] border-white/[0.1] hover:bg-emerald-500/10 hover:border-emerald-500/30 text-foreground font-semibold">
                {dict.pricing.annualCta}
              </Button>
            </Link>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="mt-14 max-w-2xl mx-auto rounded-2xl border border-white/[0.1] dark:border-white/[0.07] bg-white/[0.03] dark:bg-white/[0.02] backdrop-blur-xl p-5 flex items-center gap-4 text-xs sm:text-sm text-muted-foreground shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="leading-relaxed">
            <strong className="text-foreground font-semibold">14-Day Money-Back Guarantee:</strong> {dict.pricing.guaranteeNote}
          </p>
        </div>
      </div>
    </section>
  );
}
