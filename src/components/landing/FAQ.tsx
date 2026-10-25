'use client';

// ========================================================
// Frequently Asked Questions Section
// ========================================================

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
    <section id="faq" className="py-24 bg-muted/20 border-t border-border/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            {dict.faq.title}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left rtl:text-right font-medium text-foreground hover:bg-accent/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-muted-foreground leading-relaxed border-t border-border/40">
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
