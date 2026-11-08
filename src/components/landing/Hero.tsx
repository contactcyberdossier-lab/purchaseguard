// ========================================================
// Hero Section - Luxury / Premium Redesign
// ========================================================

import Link from 'next/link';
import { ShieldCheck, ArrowRight, Clock, Sparkles, CheckCircle2, Lock, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { getDictionary } from '@/lib/i18n';

interface HeroProps {
  locale: string;
}

export function Hero({ locale }: HeroProps) {
  const dict = getDictionary(locale);

  return (
    <section className="relative overflow-hidden pt-16 pb-24 md:pt-28 md:pb-36 premium-bg-mesh">
      {/* Background radial gradient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Floating Luxury Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/[0.05] dark:bg-white/[0.04] text-foreground border border-white/[0.12] dark:border-white/[0.08] backdrop-blur-xl mb-8 shadow-sm hover:border-indigo-400/30 transition-all duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wide text-xs text-muted-foreground">
            <strong className="text-foreground font-semibold">{dict.hero.badge}</strong>
          </span>
          <span className="text-xs text-indigo-400 font-mono">v2.0</span>
        </div>

        {/* Main Luxury Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight whitespace-pre-line leading-[1.08] mb-6 max-w-4xl mx-auto">
          <span className="bg-gradient-to-b from-foreground via-foreground/95 to-foreground/70 bg-clip-text text-transparent">
            {dict.hero.title}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-muted-foreground/90 font-normal leading-relaxed mb-10">
          {dict.hero.subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link href={`/${locale}/register`} className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base h-13 px-9 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-[0_10px_35px_-5px_rgba(99,102,241,0.4)] border border-indigo-400/20 hover:scale-[1.02] active:scale-[0.99] transition-all"
            >
              {dict.hero.ctaPrimary}
              <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180 rtl:mr-2 rtl:ml-0" />
            </Button>
          </Link>
          <Link href="#how-it-works" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base h-13 px-8 rounded-xl bg-white/[0.03] dark:bg-white/[0.02] border-white/[0.12] dark:border-white/[0.08] hover:bg-white/[0.08] text-foreground backdrop-blur-md transition-all"
            >
              {dict.hero.ctaSecondary}
            </Button>
          </Link>
        </div>

        {/* Reassurance text */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground mb-16">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Read-only Google & Microsoft OAuth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>1-minute setup</span>
          </div>
        </div>

        {/* Interactive App Preview Mockup Window */}
        <div className="relative mx-auto max-w-4xl">
          {/* Ambient card back-glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/10 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition duration-1000 -z-10" />

          <div className="relative rounded-2xl border border-white/[0.12] dark:border-white/[0.08] bg-card/85 dark:bg-[#0b0f19]/90 backdrop-blur-2xl p-5 sm:p-7 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.7)] text-left rtl:text-right transition-all">
            {/* Window chrome header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block shadow-sm" />
                <div className="ml-3 px-3 py-1 rounded-md bg-muted/50 border border-border/40 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>purchaseguardapp.com/dashboard/purchases</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Protection Engine Active</span>
              </div>
            </div>

            {/* Sample Monitored Rows with Luxury Products */}
            <div className="space-y-3">
              {/* Row 1: Apple MacBook Pro */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-background/60 dark:bg-white/[0.02] border border-border/70 hover:border-indigo-500/40 transition-all gap-3 hover:translate-x-1 duration-200">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-slate-900 border border-white/10 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-inner">
                    
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Apple MacBook Pro 16" (M3 Max, 64GB)
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Electronics
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground">Apple Store • Order #W104928192 • Synced via Gmail</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                    <Clock className="w-3 h-3" /> 8 days left to return
                  </span>
                  <span className="font-bold text-sm text-foreground">$3,499.00</span>
                </div>
              </div>

              {/* Row 2: Sony Camera */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-background/60 dark:bg-white/[0.02] border border-border/70 hover:border-indigo-500/40 transition-all gap-3 hover:translate-x-1 duration-200">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs">
                    SONY
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Sony Alpha 7 IV Full-Frame Mirrorless
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Camera
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground">B&H Photo • Order #BH-772910 • Synced via Outlook</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" /> 2-Yr Warranty (Active)
                  </span>
                  <span className="font-bold text-sm text-foreground">$2,498.00</span>
                </div>
              </div>

              {/* Row 3: Dyson */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-background/60 dark:bg-white/[0.02] border border-border/70 hover:border-amber-500/40 transition-all gap-3 hover:translate-x-1 duration-200">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs">
                    DYSON
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Dyson Airwrap™ Multi-Styler Complete Long
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Urgent
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground">Dyson Official • Order #DYS-441820 • Forwarded Receipt</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-lg animate-pulse">
                    <Clock className="w-3 h-3" /> Return Closes in 48h
                  </span>
                  <span className="font-bold text-sm text-foreground">$599.00</span>
                </div>
              </div>
            </div>

            {/* Bottom summary bar */}
            <div className="mt-4 pt-3.5 border-t border-border/60 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
              <div className="flex items-center gap-4">
                <span>🛡️ Total Monitored: <strong className="text-foreground">$6,596.00</strong></span>
                <span>•</span>
                <span>📋 Claim Templates Ready: <strong className="text-foreground">3 Available</strong></span>
              </div>
              <span className="text-primary hover:underline cursor-pointer flex items-center gap-1 font-medium">
                View Full Protected Vault &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Global Retailers Marquee */}
        <div className="mt-20 pt-8 border-t border-white/[0.08] dark:border-white/[0.06]">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-6">
            Intelligently Protecting Orders Across 500+ Global Retailers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-75 grayscale hover:grayscale-0 transition-all duration-300 text-sm font-semibold tracking-wider text-muted-foreground">
            <span className="hover:text-foreground transition-colors">APPLE</span>
            <span>•</span>
            <span className="hover:text-foreground transition-colors">AMAZON</span>
            <span>•</span>
            <span className="hover:text-foreground transition-colors">BEST BUY</span>
            <span>•</span>
            <span className="hover:text-foreground transition-colors">FLIPKART</span>
            <span>•</span>
            <span className="hover:text-foreground transition-colors">NIKE</span>
            <span>•</span>
            <span className="hover:text-foreground transition-colors">SEPHORA</span>
            <span>•</span>
            <span className="hover:text-foreground transition-colors">MYNTRA</span>
            <span>•</span>
            <span className="hover:text-foreground transition-colors">SWIGGY</span>
          </div>
        </div>
      </div>
    </section>
  );
}
