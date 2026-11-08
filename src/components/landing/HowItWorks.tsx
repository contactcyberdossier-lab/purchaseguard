// ========================================================
// How It Works Section - Luxury Redesign
// ========================================================

import { MailCheck, Cpu, BellRing, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { getDictionary } from '@/lib/i18n';

interface HowItWorksProps {
  locale: string;
}

export function HowItWorks({ locale }: HowItWorksProps) {
  const dict = getDictionary(locale);

  const steps = [
    {
      icon: MailCheck,
      number: '01',
      title: dict.howItWorks.step1Title,
      description: dict.howItWorks.step1Desc,
      tag: 'One-Click Connect',
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconColor: 'text-blue-400',
    },
    {
      icon: Cpu,
      number: '02',
      title: dict.howItWorks.step2Title,
      description: dict.howItWorks.step2Desc,
      tag: 'Deep OCR Engine',
      gradient: 'from-indigo-500/10 to-purple-500/10',
      iconColor: 'text-indigo-400',
    },
    {
      icon: BellRing,
      number: '03',
      title: dict.howItWorks.step3Title,
      description: dict.howItWorks.step3Desc,
      tag: 'Automated Shield',
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden bg-background/50 dark:bg-[#070a12]/60 border-y border-white/[0.08] dark:border-white/[0.05]">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-indigo-400 font-semibold mb-3 inline-block">
            Seamless Three-Step Setup
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {dict.howItWorks.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {dict.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-white/[0.1] dark:border-white/[0.07] bg-card/60 dark:bg-white/[0.02] backdrop-blur-xl p-8 hover:border-indigo-500/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col justify-between"
              >
                {/* Step indicator header */}
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} border border-white/[0.08] ${step.iconColor} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-3xl font-black font-mono tracking-tighter text-muted-foreground/30 group-hover:text-indigo-400/60 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <span className="inline-block text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-white/[0.05] text-indigo-300 border border-white/[0.08] mb-3">
                    {step.tag}
                  </span>

                  <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium group-hover:text-foreground transition-colors">
                  <span>Learn how it works</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
