// ========================================================
// Features Section
// ========================================================

import { Hourglass, ShieldAlert, Receipt, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { getDictionary } from '@/lib/i18n';

interface FeaturesProps {
  locale: string;
}

export function Features({ locale }: FeaturesProps) {
  const dict = getDictionary(locale);

  const features = [
    {
      icon: Hourglass,
      title: dict.features.f1Title,
      description: dict.features.f1Desc,
    },
    {
      icon: ShieldAlert,
      title: dict.features.f2Title,
      description: dict.features.f2Desc,
    },
    {
      icon: Receipt,
      title: dict.features.f3Title,
      description: dict.features.f3Desc,
    },
    {
      icon: FileText,
      title: dict.features.f4Title,
      description: dict.features.f4Desc,
    },
  ];

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            {dict.features.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {dict.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} className="border-border hover:border-primary/50 transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg mb-2">{feat.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feat.description}
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
