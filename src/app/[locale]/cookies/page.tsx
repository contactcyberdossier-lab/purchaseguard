export const runtime = 'edge';

import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';

interface CookiesPageProps {
  params: {
    locale: string;
  };
}

export default function CookiesPage({ params: { locale } }: CookiesPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Back to Home</span>
        </Link>

        <div className="border-b border-border pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
              <Cookie className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Cookie Policy</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Effective Date: October 25, 2026 • Minimal, essential cookies only.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device to ensure websites function securely and remember your essential preferences across sessions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Cookies We Use</h2>
            <p>PurchaseGuard maintains a privacy-first policy. We do NOT use third-party advertising or cross-site tracking cookies.</p>

            <div className="rounded-xl border border-border overflow-hidden not-prose mt-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground uppercase border-b border-border font-semibold">
                  <tr>
                    <th className="p-3">Cookie Name</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 font-mono font-semibold">sb-*-auth-token</td>
                    <td className="p-3">Supabase Auth secure session authentication cookie</td>
                    <td className="p-3 text-primary font-semibold">Strictly Essential</td>
                    <td className="p-3">Session / 1 Year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold">NEXT_LOCALE</td>
                    <td className="p-3">Remembers your preferred language selection</td>
                    <td className="p-3 text-primary font-semibold">Strictly Essential</td>
                    <td className="p-3">1 Year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold">theme</td>
                    <td className="p-3">Remembers Dark or Light visual preference (localStorage)</td>
                    <td className="p-3 text-primary font-semibold">Preference</td>
                    <td className="p-3">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. Managing Your Cookies</h2>
            <p>
              You can block or delete cookies through your browser settings. However, disabling strictly essential authentication cookies will prevent you from signing in to your PurchaseGuard account.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
