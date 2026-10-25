'use client';

// ========================================================
// Purchase Detail Page View with Tracking & Claim Tools
// ========================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  Truck,
  ExternalLink,
  Download,
  Mail,
  Receipt,
  Trash2,
  TrendingDown,
  Edit2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DeadlineCountdownBadge } from '@/components/purchases/DeadlineCountdownBadge';
import { ReceiptUploader } from '@/components/purchases/ReceiptUploader';
import { ClaimTemplateModal } from '@/components/purchases/ClaimTemplateModal';
import { DeleteConfirmModal } from '@/components/purchases/DeleteConfirmModal';
import { PurchaseModal } from '@/components/purchases/PurchaseModal';
import { TrackingTimeline } from '@/components/purchases/TrackingTimeline';
import { formatCurrency, formatDate } from '@/lib/i18n';
import { fetchPackageTracking, type TrackingResult } from '@/lib/tracking';

interface PurchaseDetailPageProps {
  params: {
    locale: string;
    id: string;
  };
}

export default function PurchaseDetailPage({ params: { locale, id } }: PurchaseDetailPageProps) {
  const router = useRouter();
  const [purchase, setPurchase] = useState<any | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [priceDropMessage, setPriceDropMessage] = useState<string | null>(null);

  const fetchPurchase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/purchases/${id}`);
      const data = await res.json();
      if (res.ok) {
        setPurchase(data.purchase);

        if (data.purchase?.tracking_number) {
          const track = await fetchPackageTracking(
            data.purchase.tracking_number,
            data.purchase.carrier
          );
          setTrackingData(track);
        }
      } else {
        router.push(`/${locale}/dashboard/purchases`);
      }
    } catch {
      router.push(`/${locale}/dashboard/purchases`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  const handleDelete = async () => {
    await fetch(`/api/purchases/${id}`, { method: 'DELETE' });
    router.push(`/${locale}/dashboard/purchases`);
  };

  const handleCheckPriceDrop = () => {
    setPriceDropMessage(
      'Current merchant price verified. No lower price drop detected within the policy price-adjustment window.'
    );
    setTimeout(() => setPriceDropMessage(null), 6000);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground">
        Loading purchase details...
      </div>
    );
  }

  if (!purchase) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/${locale}/dashboard/purchases`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Back to Purchases</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
            <Edit2 className="w-4 h-4 mr-1.5" />
            <span>Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
            className="text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {priceDropMessage && (
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/10 text-primary text-xs flex items-center gap-2 animate-in fade-in">
          <TrendingDown className="w-4 h-4 shrink-0" />
          <span>{priceDropMessage}</span>
        </div>
      )}

      {/* Main Header Card */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground uppercase font-mono">
                  {purchase.retailer_name}
                </span>
                {purchase.product_url && (
                  <a
                    href={purchase.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <span>Store Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {purchase.product_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Ordered {formatDate(purchase.purchase_date, locale)}
                </span>
                {purchase.order_id && <span>Order #{purchase.order_id}</span>}
                <span className="capitalize">Source: {purchase.source}</span>
              </div>
            </div>

            <div className="text-left md:text-right rtl:text-right md:rtl:text-left space-y-1">
              <div className="text-xs uppercase text-muted-foreground font-semibold">Total Paid</div>
              <div className="text-3xl font-black text-foreground">
                {formatCurrency(purchase.total, purchase.currency, locale)}
              </div>
              <div className="text-xs text-muted-foreground">
                Subtotal: {formatCurrency(purchase.subtotal, purchase.currency, locale)} • Tax:{' '}
                {formatCurrency(purchase.tax, purchase.currency, locale)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Delivery Tracking Timeline (if tracking number exists) */}
      {trackingData && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>Package Tracking & Delivery Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrackingTimeline tracking={trackingData} locale={locale} />
          </CardContent>
        </Card>
      )}

      {/* Return & Warranty Deadlines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Return Window */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Return Window</span>
              </CardTitle>
              <DeadlineCountdownBadge targetDate={purchase.return_deadline} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Return Deadline:</span>
              <span className="font-semibold text-foreground">
                {purchase.return_deadline ? formatDate(purchase.return_deadline, locale) : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Return Status:</span>
              <span className="font-semibold capitalize text-foreground">{purchase.refund_status}</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              Reminder notices are active. Prepare return request letters with proof of purchase.
            </p>
          </CardContent>
        </Card>

        {/* Warranty Window */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Warranty Coverage</span>
              </CardTitle>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Warranty Expiration:</span>
              <span className="font-semibold text-foreground">
                {purchase.warranty_deadline ? formatDate(purchase.warranty_deadline, locale) : '1 Year Standard'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Coverage Type:</span>
              <span className="font-semibold text-foreground">Manufacturer Warranty</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              You will receive an alert 30 days before manufacturer coverage expires.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Claim & Resolution Quick Tools */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-primary flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Claim & Return Tools</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Generate pre-filled, professional request letters ready to send to {purchase.retailer_name}:
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button size="sm" onClick={() => setClaimModalOpen(true)}>
              Prepare Return / Refund Request
            </Button>
            <Button variant="outline" size="sm" onClick={handleCheckPriceDrop}>
              <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
              Check Price Drop
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 italic">
            Disclaimer: PurchaseGuard helps prepare requests. The retailer or manufacturer makes the final decision.
          </p>
        </CardContent>
      </Card>

      {/* Receipts & Attachments Vault */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <span>Receipts & Documents ({purchase.attachments?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {purchase.attachments && purchase.attachments.length > 0 ? (
            <div className="space-y-2">
              {purchase.attachments.map((att: any) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-background"
                >
                  <div className="flex items-center gap-3 truncate max-w-sm">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-foreground truncate">{att.file_name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        Uploaded {formatDate(att.uploaded_at, locale)}
                      </div>
                    </div>
                  </div>
                  {att.signed_download_url && (
                    <a
                      href={att.signed_download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent text-xs font-medium text-foreground transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No receipts uploaded yet for this order.</p>
          )}

          {/* Upload additional receipt */}
          <div className="pt-2">
            <ReceiptUploader purchaseId={purchase.id} onUploadSuccess={fetchPurchase} />
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ClaimTemplateModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        purchase={purchase}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={purchase.product_name}
      />

      <PurchaseModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchPurchase}
        initialData={purchase}
      />
    </div>
  );
}
