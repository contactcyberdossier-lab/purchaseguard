// ========================================================
// Pricing Section
// ========================================================

import Link from 'next/link';
import { Check, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { getDictionary } from '@/lib/i18n';

interface PricingProps {
  locale: string;
}

export function Pricing({ locale }: PricingProps) {
  const dict = getDictionary(locale);

  return (
    <section id="pricing" className="py-24 bg-muted/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            {dict.pricing.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {dict.pricing.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Free Tier */}
          <Card className="flex flex-col justify-between border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl">{dict.pricing.freeTitle}</CardTitle>
              <CardDescription className="text-sm min-h-[40px]">{dict.pricing.freeDesc}</CardDescription>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-foreground">
                {dict.pricing.freePrice}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ forever</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{dict.pricing.freeFeature1}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{dict.pricing.freeFeature2}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{dict.pricing.freeFeature3}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/${locale}/register`} className="w-full">
                <Button variant="outline" className="w-full">
                  {dict.pricing.freeCta}
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Plus Tier */}
          <Card className="flex flex-col justify-between border-2 border-primary bg-card shadow-lg relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle className="text-xl">{dict.pricing.plusTitle}</CardTitle>
              <CardDescription className="text-sm min-h-[40px]">{dict.pricing.plusDesc}</CardDescription>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-foreground">
                {dict.pricing.plusPrice}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{dict.pricing.plusFeature1}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{dict.pricing.plusFeature2}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{dict.pricing.plusFeature3}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{dict.pricing.plusFeature4}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/${locale}/register?plan=plus`} className="w-full">
                <Button className="w-full shadow-md">
                  {dict.pricing.plusCta}
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Annual Saver */}
          <Card className="flex flex-col justify-between border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{dict.pricing.annualTitle}</CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {dict.pricing.annualBadge}
                </span>
              </div>
              <CardDescription className="text-sm min-h-[40px]">{dict.pricing.annualDesc}</CardDescription>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold text-foreground">
                {dict.pricing.annualPrice}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ year</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{dict.pricing.plusFeature1}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{dict.pricing.plusFeature2}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>2 Months Free included</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Priority email support</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/${locale}/register?plan=annual`} className="w-full">
                <Button variant="outline" className="w-full">
                  {dict.pricing.annualCta}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 max-w-2xl mx-auto rounded-xl border border-border/80 bg-background/80 p-4 flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
          <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
          <p>{dict.pricing.guaranteeNote}</p>
        </div>
      </div>
    </section>
  );
}
