export const runtime = 'edge';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentPurchasesList, type PurchaseItem } from '@/components/dashboard/RecentPurchasesList';
import { EmailConnectionsCard } from '@/components/dashboard/EmailConnectionsCard';

interface DashboardPageProps {
  params: {
    locale: string;
  };
}

export default async function DashboardPage({ params: { locale } }: DashboardPageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch real purchases from Supabase for this user
  const { data: rawPurchases } = await supabase
    .from('purchases')
    .select('id, retailer_name, product_name, order_id, purchase_date, total, currency, return_deadline, warranty_deadline, status')
    .eq('user_id', user.id)
    .order('purchase_date', { ascending: false })
    .limit(10);

  const purchases = (rawPurchases as PurchaseItem[]) || [];

  // Compute live dashboard metrics
  const today = new Date().toISOString().split('T')[0];
  const activeReturns = purchases.filter(
    (p) => p.return_deadline && p.return_deadline >= today && p.status === 'active'
  ).length;

  const reviewNeeded = purchases.filter((p) => p.status === 'review_needed').length;

  const upcomingWarranties = purchases.filter(
    (p) => p.warranty_deadline && p.warranty_deadline >= today
  ).length;

  const estimatedRecoverable = purchases
    .filter((p) => p.return_deadline && p.return_deadline >= today && p.status === 'active')
    .reduce((sum, p) => sum + Number(p.total || 0), 0);

  const stats = {
    totalPurchases: purchases.length,
    activeReturns,
    reviewNeeded,
    upcomingWarranties,
    recentDeliveries: 0,
    estimatedRecoverable,
    currency: purchases[0]?.currency || 'USD',
  };

  return (
    <div className="space-y-6">
      {/* Welcome heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Monitor active return deadlines, organize receipts, and stay on top of warranties.
        </p>
      </div>

      {/* 6 Key Stat Cards */}
      <StatsOverview locale={locale} stats={stats} />

      {/* Quick Actions */}
      <QuickActions locale={locale} />

      {/* Recent Purchases List / Table */}
      <RecentPurchasesList locale={locale} purchases={purchases} />

      {/* Email Sync & Connection Management */}
      <EmailConnectionsCard userEmail={user.email} />
    </div>
  );
}
