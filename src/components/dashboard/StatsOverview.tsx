// ========================================================
// Dashboard Stats Overview
// ========================================================

import { ShoppingBag, Clock, AlertTriangle, ShieldCheck, Truck, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { getDictionary, formatCurrency } from '@/lib/i18n';

interface StatsOverviewProps {
  locale: string;
  stats?: {
    totalPurchases: number;
    activeReturns: number;
    reviewNeeded: number;
    upcomingWarranties: number;
    recentDeliveries: number;
    estimatedRecoverable: number;
    currency: string;
  };
}

export function StatsOverview({
  locale,
  stats = {
    totalPurchases: 0,
    activeReturns: 0,
    reviewNeeded: 0,
    upcomingWarranties: 0,
    recentDeliveries: 0,
    estimatedRecoverable: 0,
    currency: 'USD',
  },
}: StatsOverviewProps) {
  const dict = getDictionary(locale);

  const cards = [
    {
      label: dict.dashboard.statTotalPurchases,
      value: stats.totalPurchases.toString(),
      icon: ShoppingBag,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10',
    },
    {
      label: dict.dashboard.statActiveReturns,
      value: stats.activeReturns.toString(),
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    },
    {
      label: dict.dashboard.statReviewNeeded,
      value: stats.reviewNeeded.toString(),
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
    },
    {
      label: dict.dashboard.statUpcomingWarranties,
      value: stats.upcomingWarranties.toString(),
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    },
    {
      label: dict.dashboard.statRecentDeliveries,
      value: stats.recentDeliveries.toString(),
      icon: Truck,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
    },
    {
      label: dict.dashboard.statEstimatedRecoverable,
      value: formatCurrency(stats.estimatedRecoverable, stats.currency, locale),
      icon: DollarSign,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                  {card.label}
                </span>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground truncate">
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
