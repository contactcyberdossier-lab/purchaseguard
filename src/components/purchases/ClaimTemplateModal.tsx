'use client';

// ========================================================
// Return & Refund Request Generator Modal
// ========================================================

import { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Mail } from 'lucide-react';
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

type TemplateType = 'return' | 'refund' | 'warranty' | 'price_match' | 'delayed_refund';

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

  const generateEmailBody = (): string => {
    const subjectPrefix = `[Order #${purchase.order_id || 'N/A'}]`;

    switch (templateType) {
      case 'return':
        return `Subject: Return Request - ${subjectPrefix} ${purchase.product_name}

Dear ${purchase.retailer_name} Customer Support,

I am writing to initiate a return for the following item purchased on ${purchase.purchase_date}:

- Product: ${purchase.product_name}
- Order Number: ${purchase.order_id || '[Not Specified]'}
- Purchase Date: ${purchase.purchase_date}
- Amount: ${purchase.currency} ${purchase.total}
- Return Reason: ${reason}

The item remains in its original packaging and condition, well within your stated return window. Could you please provide the prepaid return shipping label and instructions for completing the return?

I have attached my proof of purchase receipt to this email.

Thank you for your prompt assistance.

Sincerely,
${userName}

---
[Notice: Generated via PurchaseGuard. PurchaseGuard helps prepare requests. The retailer or manufacturer makes the final decision.]`;

      case 'refund':
        return `Subject: Refund Request - ${subjectPrefix} ${purchase.product_name}

Dear ${purchase.retailer_name} Billing Department,

I am requesting a refund for Order #${purchase.order_id || '[Not Specified]'} (${purchase.product_name}), purchased on ${purchase.purchase_date} in the amount of ${purchase.currency} ${purchase.total}.

Reason for refund:
${reason}

Please confirm receipt of this request and let me know when I can expect the credited funds back to my original payment method.

Thank you,
${userName}

---
[Notice: Generated via PurchaseGuard. PurchaseGuard helps prepare requests. The retailer or manufacturer makes the final decision.]`;

      case 'warranty':
        return `Subject: Warranty Claim - ${subjectPrefix} ${purchase.product_name}

Dear ${purchase.retailer_name} Support & Warranty Team,

I am submitting a warranty claim for ${purchase.product_name}, purchased on ${purchase.purchase_date} under Order #${purchase.order_id || '[Not Specified]'}.

The product has experienced a defect under normal use:
${reason}

As this product is covered under the manufacturer's warranty, please provide instructions for repair, replacement, or servicing under warranty terms. Attached is the original proof of purchase.

Sincerely,
${userName}

---
[Notice: Generated via PurchaseGuard. PurchaseGuard helps prepare requests. The retailer or manufacturer makes the final decision.]`;

      case 'price_match':
        return `Subject: Price-Match Request - ${subjectPrefix} ${purchase.product_name}

Dear ${purchase.retailer_name} Support,

I recently purchased ${purchase.product_name} on ${purchase.purchase_date} (Order #${purchase.order_id || '[Not Specified]'}) for ${purchase.currency} ${purchase.total}.

I noticed a price drop on your store / authorized competitor to [Enter New Price]. In accordance with your price adjustment policy, could you please credit the difference to my original payment method?

Thank you for your assistance,
${userName}

---
[Notice: Generated via PurchaseGuard. PurchaseGuard helps prepare requests. The retailer or manufacturer makes the final decision.]`;

      case 'delayed_refund':
        return `Subject: Follow-Up: Pending Refund for Order #${purchase.order_id || 'N/A'}

Dear ${purchase.retailer_name} Support,

I am following up on the pending refund for my return of ${purchase.product_name} (Order #${purchase.order_id || '[Not Specified]'}), purchased on ${purchase.purchase_date}.

The returned merchandise was delivered to your returns center on [Enter Date of Return Delivery]. As the standard processing timeframe has passed, could you please provide an update on the disbursement of the refund?

Thank you for looking into this,
${userName}

---
[Notice: Generated via PurchaseGuard. PurchaseGuard helps prepare requests. The retailer or manufacturer makes the final decision.]`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmailBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              Prepare Claim or Request Email
            </h2>
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
            { id: 'price_match', label: 'Price-Match' },
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
            Specify Reason / Details:
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Generated Email Draft */}
        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
            Generated Email Draft:
          </label>
          <textarea
            readOnly
            rows={12}
            value={generateEmailBody()}
            className="w-full rounded-xl border border-input bg-muted/40 p-3.5 text-xs font-mono text-foreground focus:outline-none select-all leading-relaxed"
          />
        </div>

        {/* Mandatory Policy Disclaimer */}
        <div className="mt-3 p-3 rounded-lg border border-border/80 bg-background text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>
            PurchaseGuard helps prepare requests. The retailer or manufacturer makes the final decision.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Copy and paste into your email client or merchant contact form.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" onClick={copyToClipboard} className="flex items-center gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
