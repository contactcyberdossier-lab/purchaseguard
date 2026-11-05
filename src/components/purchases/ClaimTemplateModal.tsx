'use client';

// ========================================================
// Return & Refund Request Generator Modal with Vendor Integrations
// ========================================================

import { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Mail, ExternalLink, Download, Send } from 'lucide-react';
import { Button } from '../ui/Button';

interface ClaimTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: {
    retailer_name: string;
    product_name: string;
    order_id: string | null;
    purchase_date: string;
    total: number;
    currency: string;
  };
  userName?: string;
}

type TemplateType = 'return' | 'refund' | 'warranty' | 'damaged_item' | 'delayed_refund';

interface RetailerDirectoryEntry {
  email?: string;
  portalUrl: string;
  portalLabel: string;
}

const RETAILER_DIRECTORY: Record<string, RetailerDirectoryEntry> = {
  amazon: {
    email: 'cs-reply@amazon.in',
    portalUrl: 'https://www.amazon.in/gp/css/returns/homepage.html',
    portalLabel: 'Amazon Returns Center',
  },
  flipkart: {
    email: 'support@flipkart.com',
    portalUrl: 'https://www.flipkart.com/helpcentre',
    portalLabel: 'Flipkart Help Centre',
  },
  myntra: {
    email: 'support@myntra.com',
    portalUrl: 'https://www.myntra.com/my/orders',
    portalLabel: 'Myntra Orders & Returns',
  },
  apple: {
    email: 'support@apple.com',
    portalUrl: 'https://support.apple.com',
    portalLabel: 'Apple Official Support',
  },
  croma: {
    email: 'customersupport@croma.com',
    portalUrl: 'https://www.croma.com/help-and-support',
    portalLabel: 'Croma Customer Support',
  },
  swiggy: {
    email: 'support@swiggy.in',
    portalUrl: 'https://www.swiggy.com/support',
    portalLabel: 'Swiggy Help & Grievance',
  },
  zomato: {
    email: 'order@zomato.com',
    portalUrl: 'https://www.zomato.com',
    portalLabel: 'Zomato Support Portal',
  },
  meesho: {
    email: 'query@meesho.com',
    portalUrl: 'https://www.meesho.com/help',
    portalLabel: 'Meesho Help Center',
  },
  samsung: {
    email: 'support.india@samsung.com',
    portalUrl: 'https://www.samsung.com/in/support/',
    portalLabel: 'Samsung Support',
  },
  bestbuy: {
    email: 'customerrelations@bestbuy.com',
    portalUrl: 'https://www.bestbuy.com/returns',
    portalLabel: 'Best Buy Returns Center',
  },
  walmart: {
    email: 'help@walmart.com',
    portalUrl: 'https://www.walmart.com/returns',
    portalLabel: 'Walmart Returns Portal',
  },
};

export function ClaimTemplateModal({
  isOpen,
  onClose,
  purchase,
  userName = 'Customer',
}: ClaimTemplateModalProps) {
  const [templateType, setTemplateType] = useState<TemplateType>('return');
  const [reason, setReason] = useState('Product did not match description / no longer needed');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Identify known vendor support links
  const normalizedRetailer = (purchase.retailer_name || '').toLowerCase();
  const matchedKey = Object.keys(RETAILER_DIRECTORY).find((k) => normalizedRetailer.includes(k));
  const vendorInfo = matchedKey ? RETAILER_DIRECTORY[matchedKey] : null;

  const subjectPrefix = `[Order #${purchase.order_id || 'N/A'}]`;

  const getSubjectLine = (): string => {
    switch (templateType) {
      case 'return':
        return `Return Request - ${subjectPrefix} ${purchase.product_name}`;
      case 'refund':
        return `Refund Request - ${subjectPrefix} ${purchase.product_name}`;
      case 'warranty':
        return `Warranty Claim - ${subjectPrefix} ${purchase.product_name}`;
      case 'damaged_item':
        return `Replacement Request: Damaged Item - ${subjectPrefix} ${purchase.product_name}`;
      case 'delayed_refund':
        return `Follow-Up: Pending Refund for Order #${purchase.order_id || 'N/A'}`;
    }
  };

  const getEmailBodyText = (): string => {
    switch (templateType) {
      case 'return':
        return `Dear ${purchase.retailer_name} Customer Support,

I am writing to initiate a formal return for the following item purchased on ${purchase.purchase_date}:

- Product: ${purchase.product_name}
- Order Number: ${purchase.order_id || '[Not Specified]'}
- Purchase Date: ${purchase.purchase_date}
- Amount: ${purchase.currency} ${purchase.total}
- Return Reason: ${reason}

The item remains in its original packaging and condition, well within your stated return window. Could you please provide the return authorization, shipping label, and instructions for completing the return?

I have attached my original proof of purchase receipt to this message.

Thank you for your prompt assistance.

Sincerely,
${userName}

---
Notice: Generated via PurchaseGuard. PurchaseGuard helps prepare return and warranty requests. The retailer or manufacturer makes the final determination.`;

      case 'refund':
        return `Dear ${purchase.retailer_name} Billing Department,

I am requesting a refund for Order #${purchase.order_id || '[Not Specified]'} (${purchase.product_name}), purchased on ${purchase.purchase_date} in the amount of ${purchase.currency} ${purchase.total}.

Reason for refund:
${reason}

Please confirm receipt of this request and let me know when I can expect the credited funds back to my original payment method.

Thank you,
${userName}

---
Notice: Generated via PurchaseGuard. PurchaseGuard helps prepare return and warranty requests. The retailer or manufacturer makes the final determination.`;

      case 'warranty':
        return `Dear ${purchase.retailer_name} Warranty & Service Team,

I am submitting a warranty claim for ${purchase.product_name}, purchased on ${purchase.purchase_date} under Order #${purchase.order_id || '[Not Specified]'}.

Defect description under normal use:
${reason}

As this product is covered under manufacturer warranty, please provide instructions for servicing, repair, or replacement. Attached is my proof of purchase receipt.

Sincerely,
${userName}

---
Notice: Generated via PurchaseGuard. PurchaseGuard helps prepare return and warranty requests. The retailer or manufacturer makes the final determination.`;

      case 'damaged_item':
        return `Dear ${purchase.retailer_name} Support Team,

I recently received Order #${purchase.order_id || '[Not Specified]'} (${purchase.product_name}) delivered on ${purchase.purchase_date}. 

Upon unboxing, I discovered the item is damaged or defective:
- Description of issue: ${reason}

Since this occurred prior to delivery, I would appreciate a prompt replacement unit or full refund. Photos of the damaged item and packaging are available upon request.

Please send instructions for processing the replacement or collection.

Thank you,
${userName}

---
Notice: Generated via PurchaseGuard. PurchaseGuard helps prepare return and warranty requests. The retailer or manufacturer makes the final determination.`;

      case 'delayed_refund':
        return `Dear ${purchase.retailer_name} Support,

I am following up on the pending refund for my return of ${purchase.product_name} (Order #${purchase.order_id || '[Not Specified]'}), originally purchased on ${purchase.purchase_date}.

The returned merchandise has been received by your returns facility. As the standard processing timeframe has passed, could you please provide an immediate update on the status of this credit?

Thank you for your prompt assistance,
${userName}

---
Notice: Generated via PurchaseGuard. PurchaseGuard helps prepare return and warranty requests. The retailer or manufacturer makes the final determination.`;
    }
  };

  const fullLetter = `Subject: ${getSubjectLine()}\n\n${getEmailBodyText()}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    const toEmail = vendorInfo?.email || '';
    const subject = encodeURIComponent(getSubjectLine());
    const body = encodeURIComponent(getEmailBodyText());
    const mailto = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    window.open(mailto, '_blank');
  };

  const handleDownloadText = () => {
    const blob = new Blob([fullLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Return_Request_${purchase.order_id || 'Order'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Prepare Vendor Return & Claim Request
              </h2>
              <p className="text-xs text-muted-foreground">
                Pre-formatted formal correspondence for {purchase.retailer_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Type Selector */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'return', label: 'Return Request' },
            { id: 'refund', label: 'Refund Request' },
            { id: 'warranty', label: 'Warranty Claim' },
            { id: 'damaged_item', label: 'Damaged / Defective' },
            { id: 'delayed_refund', label: 'Delayed Refund Follow-Up' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplateType(t.id as TemplateType)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                templateType === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Reason edit field */}
        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
            Specify Reason / Defect Details:
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. Item defective after 2 weeks of normal use"
          />
        </div>

        {/* Vendor Support Info Bar */}
        {vendorInfo && (
          <div className="mt-3 p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-foreground">Verified Retailer Helpdesk: </span>
              <span className="text-muted-foreground">
                {vendorInfo.email ? vendorInfo.email : 'Direct Online Helpdesk Portal'}
              </span>
            </div>
            <a
              href={vendorInfo.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium shrink-0"
            >
              <span>{vendorInfo.portalLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Generated Email Draft */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Generated Email & Formal Request Draft:
            </label>
            <button
              type="button"
              onClick={handleDownloadText}
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Download (.txt)</span>
            </button>
          </div>
          <textarea
            readOnly
            rows={11}
            value={fullLetter}
            className="w-full rounded-xl border border-input bg-muted/40 p-3.5 text-xs font-mono text-foreground focus:outline-none select-all leading-relaxed"
          />
        </div>

        {/* Mandatory Policy Disclaimer */}
        <div className="mt-3 p-3 rounded-lg border border-border/80 bg-background text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>
            PurchaseGuard helps you track purchases and prepare return, refund, and warranty requests. The retailer or manufacturer makes the final decision.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-border gap-3 sm:gap-0">
          <span className="text-xs text-muted-foreground">
            Copy into your email or launch directly in your email app.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendEmail}
              className="flex items-center gap-1.5"
              title="Open in your default email client (Gmail/Outlook)"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Open in Email</span>
            </Button>
            <Button size="sm" onClick={copyToClipboard} className="flex items-center gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Template'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
