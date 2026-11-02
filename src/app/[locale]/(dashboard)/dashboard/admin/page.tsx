'use client';

export const runtime = 'edge';

// ========================================================
// Admin Overview Dashboard
// ========================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, ShoppingBag, DollarSign, Crown, ArrowUpRight, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AdminStats {
  totalUsers: number;
  adminCount: number;
  freeUsers: number;
  plusUsers: number;
  annualUsers: number;
  totalPurchases: number;
  totalVolume: number;
  activeReturns: number;
  reviewNeeded: number;
}

export default function AdminOverviewPage({ params: { locale } }: { params: { locale: string } }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load admin stats');
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
        setRecentPurchases(data.recentPurchases || []);
      } catch (err: any) {
        setError(err.message || 'Error fetching admin metrics');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        Loading administrator metrics & platform KPIs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Accounts
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalUsers ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-primary">{stats?.adminCount ?? 0} Admins</span>
              <span>•</span>
              <span>{(stats?.totalUsers ?? 0) - (stats?.adminCount ?? 0)} Users</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Tracked Purchases */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tracked Purchases
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalPurchases ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {stats?.activeReturns ?? 0} active returns
              </span>
              <span>•</span>
              <span>{stats?.reviewNeeded ?? 0} pending review</span>
            </p>
          </CardContent>
        </Card>

        {/* Gross Tracked Volume */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tracked Volume
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${(stats?.totalVolume ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aggregated across all customer orders
            </p>
          </CardContent>
        </Card>

        {/* Paid Subscriptions */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Subscription Tiers
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {(stats?.plusUsers ?? 0) + (stats?.annualUsers ?? 0)} Paid
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span>{stats?.freeUsers ?? 0} Free</span>
              <span>•</span>
              <span>{stats?.plusUsers ?? 0} Plus</span>
              <span>•</span>
              <span>{stats?.annualUsers ?? 0} Annual</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2 Detail Tables: Recent Signups & Recent Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Platform Signups */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Latest Platform Signups</CardTitle>
            <Link href={`/${locale}/dashboard/admin/users`}>
              <Button variant="ghost" size="sm" className="h-8 text-xs flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground border-y border-border">
                  <tr>
                    <th className="px-4 py-2.5">User</th>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5">Plan</th>
                    <th className="px-4 py-2.5">Signed Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-accent/30">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">{u.email}</p>
                          {u.full_name && (
                            <p className="text-[10px] text-muted-foreground">{u.full_name}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.role === 'admin' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary text-secondary-foreground'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 uppercase font-mono text-[10px]">
                          {u.subscription_status || 'free'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases Across Platform */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Latest Tracked Purchases</CardTitle>
            <Link href={`/${locale}/dashboard/admin/purchases`}>
              <Button variant="ghost" size="sm" className="h-8 text-xs flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground border-y border-border">
                  <tr>
                    <th className="px-4 py-2.5">Retailer</th>
                    <th className="px-4 py-2.5">Product</th>
                    <th className="px-4 py-2.5">Total</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No purchases tracked yet.
                      </td>
                    </tr>
                  ) : (
                    recentPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-accent/30">
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                          {p.retailer_name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[150px] truncate">
                          {p.product_name}
                        </td>
                        <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">
                          ${Number(p.total).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
