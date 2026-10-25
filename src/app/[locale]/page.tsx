export const runtime = 'edge';

import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { SecurityPrivacy } from '@/components/landing/SecurityPrivacy';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

interface HomePageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">
        <Hero locale={locale} />
        <HowItWorks locale={locale} />
        <Features locale={locale} />
        <Pricing locale={locale} />
        <SecurityPrivacy locale={locale} />
        <FAQ locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
