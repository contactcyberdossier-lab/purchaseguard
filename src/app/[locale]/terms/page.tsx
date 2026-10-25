export const runtime = 'edge';

import Link from 'next/link';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';

interface TermsPageProps {
  params: {
    locale: string;
  };
}

export default function TermsPage({ params: { locale } }: TermsPageProps) {
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
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Effective Date: October 25, 2026 • Please read these terms carefully before using PurchaseGuard.
          </p>
        </div>

        {/* Critical Disclaimer Notice */}
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-foreground mb-1 text-sm">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <span>Important Claims Policy & Product Scope</span>
          </div>
          <p className="font-semibold text-foreground">
            “PurchaseGuard helps you track purchases and prepare return, refund, warranty, and price-match requests. The retailer or manufacturer makes the final decision.”
          </p>
          <p className="mt-1">
            PurchaseGuard is an administrative organization and deadline tracking tool. PurchaseGuard does NOT guarantee retailer refunds, recovered money, warranty approval, or price-drop adjustments. All return approvals, refund disbursements, and warranty determinations remain exclusively subject to third-party merchant and manufacturer terms.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By creating an account or accessing the PurchaseGuard platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Permitted Use & Account Responsibilities</h2>
            <p>
              You agree to provide accurate registration information and keep your credentials secure. You may only connect email inboxes that you own and are authorized to access. You agree not to misuse, reverse-engineer, or attempt unauthorized access to the application infrastructure.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. Subscriptions, Billing & Cancellation</h2>
            <p>
              PurchaseGuard offers a Free tier and paid subscription plans (Plus Monthly and Annual Saver). Paid subscriptions are billed in advance on a recurring monthly or annual basis via Stripe.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time through the in-app billing portal. Cancellation takes effect at the end of the current billing cycle.</li>
              <li><strong>14-Day Money-Back Guarantee:</strong> We offer a 14-day money-back guarantee for your PurchaseGuard subscription fee. If you are unsatisfied within 14 days of your initial paid subscription, contact support for a full refund of your subscription fee.</li>
              <li><strong>Third-Party Retailer Exclusion:</strong> The 14-day guarantee applies solely to the PurchaseGuard software subscription fee. It does not apply to any purchases made with third-party retailers, online stores, or manufacturers.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Disclaimers of Warranties & Limitation of Liability</h2>
            <p>
              PurchaseGuard provides tracking, estimates, and template generation on an "AS IS" and "AS AVAILABLE" basis. While we strive for extreme accuracy, retailer return policies and terms change without notice. We make no warranty that extracted return dates or merchant policies will be error-free.
            </p>
            <p>
              To the fullest extent permitted by applicable law, PurchaseGuard Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any lost profits, lost refunds, or denied warranty claims arising out of or related to your use of the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">5. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">6. Contact Information</h2>
            <p>
              Questions regarding these Terms of Service should be sent to:
              <br />
              <strong>PurchaseGuard Inc. Legal Department</strong>
              <br />
              Email: <a href="mailto:legal@purchaseguard.app" className="text-primary underline">legal@purchaseguard.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
