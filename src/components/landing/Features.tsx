// ========================================================
// Features Section - Luxury Bento Grid Redesign
// ========================================================

import { Hourglass, ShieldAlert, Receipt, FileText, Sparkles, CheckCircle2, Send, Download } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';

interface FeaturesProps {
  locale: string;
}

export function Features({ locale }: FeaturesProps) {
  const dict = getDictionary(locale);

  return (
    <section id="features" className="py-28 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-indigo-400 font-semibold mb-3 inline-block">
            Enterprise-Grade Protection
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {dict.features.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {dict.features.subtitle}
          </p>
        </div>

        {/* Luxury Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Return Window Countdowns (Span 2 cols) */}
          <div className="md:col-span-2 group rounded-2xl border border-white/[0.1] dark:border-white/[0.07] bg-card/60 dark:bg-white/[0.02] backdrop-blur-xl p-8 hover:border-indigo-500/40 hover:shadow-[0_20px_50px_-10px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
                  <Hourglass className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Smart Deadlines
                </span>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                {dict.features.f1Title}
              </h3>

              <p className="text-base text-muted-foreground leading-relaxed max-w-xl mb-6">
                {dict.features.f1Desc}
              </p>
            </div>

            {/* Visual mini-countdown widget */}
            <div className="rounded-xl border border-white/[0.08] bg-background/80 dark:bg-white/[0.03] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold text-xs">
                  4d
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Holiday Extended Return Window</p>
                  <p className="text-xs text-muted-foreground">Amazon • Returns deadline: Dec 31, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3-Day Alert Scheduled</span>
              </div>
            </div>
          </div>

          {/* Card 2: Warranty Vault */}
          <div className="group rounded-2xl border border-white/[0.1] dark:border-white/[0.07] bg-card/60 dark:bg-white/[0.02] backdrop-blur-xl p-8 hover:border-purple-500/40 hover:shadow-[0_20px_50px_-10px_rgba(168,85,247,0.15)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Coverage Vault
                </span>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                {dict.features.f2Title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {dict.features.f2Desc}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-background/80 dark:bg-white/[0.03] p-4 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground font-medium">AppleCare+ / Manufacturer Warranty</span>
                <span className="text-indigo-400 font-bold font-mono">ACTIVE</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Card 3: Universal Receipt Organizer */}
          <div className="group rounded-2xl border border-white/[0.1] dark:border-white/[0.07] bg-card/60 dark:bg-white/[0.02] backdrop-blur-xl p-8 hover:border-blue-500/40 hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.15)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
                  <Receipt className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Cloud Archive
                </span>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                {dict.features.f3Title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {dict.features.f3Desc}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-background/80 dark:bg-white/[0.03] p-3.5 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>Receipt_Amazon_INV-8910.pdf</span>
              <span className="text-emerald-400 font-semibold">AES-256</span>
            </div>
          </div>

          {/* Card 4: One-Click Claim Preparer (Span 2 cols) */}
          <div className="md:col-span-2 group rounded-2xl border border-white/[0.1] dark:border-white/[0.07] bg-card/60 dark:bg-white/[0.02] backdrop-blur-xl p-8 hover:border-emerald-500/40 hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.15)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Dispute Generator
                </span>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                {dict.features.f4Title}
              </h3>

              <p className="text-base text-muted-foreground leading-relaxed max-w-xl mb-6">
                {dict.features.f4Desc}
              </p>
            </div>

            {/* Visual Action Toolbar */}
            <div className="rounded-xl border border-white/[0.08] bg-background/80 dark:bg-white/[0.03] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">
                Supported templates: <strong>Return, Refund, Warranty Claim, Damaged on Arrival</strong>
              </span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 font-medium">
                  <Send className="w-3.5 h-3.5" />
                  <span>Open in Email (mailto:)</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-foreground border border-white/[0.1] flex items-center gap-1.5 font-medium">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
