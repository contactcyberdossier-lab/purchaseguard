// ========================================================
// Security & Privacy Section - Luxury Redesign
// ========================================================

import { KeyRound, ShieldBan, Lock, FileCheck } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';

interface SecurityPrivacyProps {
  locale: string;
}

export function SecurityPrivacy({ locale }: SecurityPrivacyProps) {
  const dict = getDictionary(locale);

  const pillars = [
    {
      icon: KeyRound,
      title: dict.security.sec1Title,
      description: dict.security.sec1Desc,
      tag: 'Zero-Knowledge',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: ShieldBan,
      title: dict.security.sec2Title,
      description: dict.security.sec2Desc,
      tag: 'Strict Privacy',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: Lock,
      title: dict.security.sec3Title,
      description: dict.security.sec3Desc,
      tag: 'AES-256-GCM',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: FileCheck,
      title: dict.security.sec4Title,
      description: dict.security.sec4Desc,
      tag: 'Google Verified',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
  ];

  return (
    <section id="security" className="py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-indigo-400 font-semibold mb-3 inline-block">
            Architected for Privacy
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {dict.security.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {dict.security.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-white/[0.1] dark:border-white/[0.07] bg-card/60 dark:bg-white/[0.02] backdrop-blur-xl p-7 hover:border-indigo-500/40 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.12)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${pillar.bg} ${pillar.color} border shadow-inner`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-muted-foreground border border-white/[0.06]">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2.5 tracking-tight group-hover:text-indigo-300 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/[0.05] flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground/70">
                  <span>Audited Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
