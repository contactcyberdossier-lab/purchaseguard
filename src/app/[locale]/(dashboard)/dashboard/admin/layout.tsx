export const runtime = 'edge';

// ========================================================
// Admin Portal Layout & Privilege Protection Guard
// ========================================================

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { ShieldCheck, ShieldAlert, Users, ShoppingBag, Activity, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function AdminLayout({
  children,
  params: { locale },
}: AdminLayoutProps) {
  const supabase = createClient();
  const auth = await verifyAdminSession(supabase);

  // 1. ACCESS DENIED: User does not have admin privileges
  if (!auth.isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Administrator Access Required
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account (<span className="font-semibold text-foreground">{auth.user?.email}</span>) does not have administrative privileges to view the back-office portal.
            </p>
          </div>

          <div className="pt-2">
            <Link href={`/${locale}/dashboard`}>
              <Button variant="default" className="w-full flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to User Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACCESS GRANTED: Render Admin Portal Shell
  const navTabs = [
    { title: 'Overview', href: `/${locale}/dashboard/admin`, icon: LayoutDashboard },
    { title: 'Users & Roles', href: `/${locale}/dashboard/admin/users`, icon: Users },
    { title: 'Global Purchases', href: `/${locale}/dashboard/admin/purchases`, icon: ShoppingBag },
    { title: 'Audit Trail', href: `/${locale}/dashboard/admin/audit-logs`, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Admin Control Portal
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                  SUPERADMIN
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Manage user privileges, inspect platform purchases, monitor KPIs, and review audit logs.
              </p>
            </div>
          </div>

          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Personal Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border/60">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link key={tab.href} href={tab.href}>
                <Button variant="secondary" size="sm" className="flex items-center gap-2 h-9 text-xs font-medium">
                  <Icon className="w-4 h-4" />
                  <span>{tab.title}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content */}
      {children}
    </div>
  );
}
