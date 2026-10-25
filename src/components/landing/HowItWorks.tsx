// ========================================================
// How It Works Section
// ========================================================

import { MailCheck, Cpu, BellRing } from 'lucide-react';
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
      title: dict.howItWorks.step1Title,
      description: dict.howItWorks.step1Desc,
      tag: 'Step 1',
    },
    {
      icon: Cpu,
      title: dict.howItWorks.step2Title,
      description: dict.howItWorks.step2Desc,
      tag: 'Step 2',
    },
    {
      icon: BellRing,
      title: dict.howItWorks.step3Title,
      description: dict.howItWorks.step3Desc,
      tag: 'Step 3',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/40 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            {dict.howItWorks.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {dict.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={idx} className="relative overflow-hidden border-border/80 bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-mono">
                      {step.tag}
                    </span>
                  </div>
                  <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
