// ========================================================
// Frequently Asked Questions Section - Luxury Redesign
// ========================================================

'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';

interface FAQProps {
  locale: string;
}

export function FAQ({ locale }: FAQProps) {
  const dict = getDictionary(locale);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    { q: dict.faq.q1, a: dict.faq.a1 },
    { q: dict.faq.q2, a: dict.faq.a2 },
    { q: dict.faq.q3, a: dict.faq.a3 },
    { q: dict.faq.q4, a: dict.faq.a4 },
    { q: dict.faq.q5, a: dict.faq.a5 },
  ];

  return (
    <section id="faq" className="py-28 relative overflow-hidden bg-background/50 dark:bg-[#070a12]/60 border-t border-white/[0.08] dark:border-white/[0.05]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-indigo-400 font-semibold mb-3 inline-block">
            Clarity & Guidance
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {dict.faq.title}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.1] dark:border-white/[0.07] bg-card/60 dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left rtl:text-right font-medium text-foreground hover:bg-white/[0.03] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold pr-4">{item.q}</span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.08] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'text-muted-foreground'}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-muted-foreground leading-relaxed border-t border-white/[0.05]">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
