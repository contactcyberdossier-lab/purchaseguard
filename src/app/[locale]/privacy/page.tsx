export const runtime = 'edge';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PrivacyPageProps {
  params: {
    locale: string;
  };
}

export default function PrivacyPage({ params: { locale } }: PrivacyPageProps) {
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
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Effective Date: October 25, 2026 • Compliant with GDPR, UK GDPR, CCPA/CPRA, PIPEDA, LGPD, and Australian Privacy Principles.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Our Core Privacy Commitment</h2>
            <p>
              PurchaseGuard Inc. (“PurchaseGuard”, “we”, “us”, or “our”) is designed with privacy as a foundational principle. We build tools to help you track online purchases and stay ahead of return and warranty deadlines.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>We NEVER sell your personal data</strong> or purchase information to advertisers or data brokers.</li>
              <li><strong>We NEVER scrape merchant websites</strong> or ask for your retailer passwords (Amazon, Walmart, Target, etc.).</li>
              <li><strong>We NEVER use your emails or receipts</strong> to train public or commercial third-party generative AI models.</li>
              <li><strong>We strictly utilize OAuth 2.0 with minimal read-only permissions</strong> to parse receipts you authorize.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
            <p>We only collect information strictly necessary to provide the service:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Account Information:</strong> Email address, name, preferred currency, preferred language, country, and timezone.</li>
              <li><strong>Purchase Data:</strong> Retailer name, order identifier, purchase date, item descriptions, price, currency, return deadlines, and warranty dates.</li>
              <li><strong>Uploaded Receipts & Documents:</strong> Invoices or images you upload directly, encrypted and stored in private isolated cloud storage.</li>
              <li><strong>OAuth Connection Tokens:</strong> Encrypted access and refresh tokens for Gmail or Outlook, stored using AES-256-GCM encryption.</li>
              <li><strong>Anonymized Telemetry:</strong> Hashed IP addresses and user agents for security audits, rate-limiting, and fraud prevention.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. How We Process Email Data (Gmail & Outlook)</h2>
            <p>
              When you connect your email using Google OAuth or Microsoft Graph, we request read-only access (<code>gmail.readonly</code> or <code>Mail.Read</code>). Our background pipeline only reads emails matching purchase confirmations, shipping notices, or refund receipts. We decode the minimal structured fields required and immediately discard non-purchase messages.
            </p>
            <p>
              You can disconnect your email connection at any time in your Dashboard, with an instant option to purge all synced purchase data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Your Global Privacy Rights (GDPR, CCPA, PIPEDA, LGPD)</h2>
            <p>Regardless of where you reside, you enjoy complete control over your data:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Right of Access & Portability:</strong> Download a full, machine-readable JSON export of all your data anytime in Settings.</li>
              <li><strong>Right to Erasure (Be Forgotten):</strong> Request permanent account deletion and complete erasure of all receipts and purchases with a single click.</li>
              <li><strong>Right to Rectification:</strong> Edit and correct any extracted purchase details directly in the dashboard.</li>
              <li><strong>Non-Discrimination:</strong> We never deny services or charge different rates for exercising your privacy rights.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">5. Data Retention & Security Architecture</h2>
            <p>
              All traffic is protected with TLS 1.3 encryption in transit. All user files and OAuth tokens are protected with AES-256-GCM encryption at rest. Deleted accounts are completely purged from active storage within 24 hours.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">6. Contact Our Data Protection Officer (DPO)</h2>
            <p>
              If you have any questions or wish to submit a privacy request, please contact:
              <br />
              <strong>PurchaseGuard Privacy & Data Protection Office</strong>
              <br />
              Email: <a href="mailto:privacy@purchaseguard.app" className="text-primary underline">privacy@purchaseguard.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
