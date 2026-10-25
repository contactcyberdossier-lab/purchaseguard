// ========================================================
// Security & Privacy Section
// ========================================================

import { KeyRound, ShieldBan, Lock, FileCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
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
    },
    {
      icon: ShieldBan,
      title: dict.security.sec2Title,
      description: dict.security.sec2Desc,
    },
    {
      icon: Lock,
      title: dict.security.sec3Title,
      description: dict.security.sec3Desc,
    },
    {
      icon: FileCheck,
      title: dict.security.sec4Title,
      description: dict.security.sec4Desc,
    },
  ];

  return (
    <section id="security" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            {dict.security.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {dict.security.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card key={idx} className="border-border bg-card">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg mb-2">{pillar.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {pillar.description}
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
