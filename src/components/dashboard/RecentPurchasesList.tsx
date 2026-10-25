'use client';

// ========================================================
// Recent Purchases List / Table Component
// ========================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Clock, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { DeadlineCountdownBadge } from '../purchases/DeadlineCountdownBadge';
import { PurchaseModal } from '../purchases/PurchaseModal';
import { getDictionary, formatCurrency, formatDate } from '@/lib/i18n';

export interface PurchaseItem {
  id: string;
  retailer_name: string;
  product_name: string;
  order_id: string | null;
  purchase_date: string;
  total: number;
  currency: string;
  return_deadline: string | null;
  warranty_deadline: string | null;
  status: 'active' | 'returned' | 'refunded' | 'closed' | 'review_needed';
}

interface RecentPurchasesListProps {
  locale: string;
  purchases?: PurchaseItem[];
}

export function RecentPurchasesList({
  locale,
  purchases = [],
}: RecentPurchasesListProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (purchases.length === 0) {
    return (
      <>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">{dict.dashboard.recentPurchasesTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground text-base">
                {dict.dashboard.emptyPurchases}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                {dict.dashboard.emptyPurchasesSub}
              </p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="mt-2">
              {dict.dashboard.actionAddPurchase}
            </Button>
          </CardContent>
        </Card>

        <PurchaseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            router.push(`/${locale}/dashboard/purchases`);
            router.refresh();
          }}
        />
      </>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{dict.dashboard.recentPurchasesTitle}</CardTitle>
        <Link
          href={`/${locale}/dashboard/purchases`}
          className="text-xs text-primary font-medium hover:underline"
        >
          View all purchases →
        </Link>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right">
          <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-y border-border">
            <tr>
              <th scope="col" className="px-6 py-3">{dict.dashboard.retailer}</th>
              <th scope="col" className="px-6 py-3">{dict.dashboard.product}</th>
              <th scope="col" className="px-6 py-3">{dict.dashboard.purchaseDate}</th>
              <th scope="col" className="px-6 py-3">{dict.dashboard.returnDeadline}</th>
              <th scope="col" className="px-6 py-3">{dict.dashboard.total}</th>
              <th scope="col" className="px-6 py-3">{dict.dashboard.status}</th>
              <th scope="col" className="px-6 py-3 text-right rtl:text-left">{dict.dashboard.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {purchases.map((p) => {
              const formattedPrice = formatCurrency(p.total, p.currency, locale);
              const formattedDate = formatDate(p.purchase_date, locale);

              return (
                <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                    {p.retailer_name}
                  </td>
                  <td className="px-6 py-4 text-foreground max-w-xs truncate">
                    <Link
                      href={`/${locale}/dashboard/purchases/${p.id}`}
                      className="hover:text-primary hover:underline font-medium"
                    >
                      {p.product_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {formattedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DeadlineCountdownBadge targetDate={p.return_deadline} />
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                    {formattedPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wide ${
                        p.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : p.status === 'review_needed'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right rtl:text-left whitespace-nowrap">
                    <Link href={`/${locale}/dashboard/purchases/${p.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
