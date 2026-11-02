'use client';

// ========================================================
// Authenticated Dashboard Navigation Sidebar
// ========================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Clock, 
  Mail, 
  CreditCard, 
  Settings, 
  ShieldCheck, 
  Users, 
  Activity 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDictionary } from '@/lib/i18n';

interface DashboardSidebarProps {
  locale: string;
  isAdmin?: boolean;
}

export function DashboardSidebar({ locale, isAdmin = false }: DashboardSidebarProps) {
  const dict = getDictionary(locale);
  const pathname = usePathname();

  const userNavItems = [
    {
      title: dict.common.dashboard,
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: 'Purchases',
      href: `/${locale}/dashboard/purchases`,
      icon: ShoppingBag,
    },
    {
      title: 'Deadlines',
      href: `/${locale}/dashboard/purchases?status=active`,
      icon: Clock,
    },
    {
      title: 'Email Sync',
      href: `/${locale}/dashboard#email-sync`,
      icon: Mail,
    },
    {
      title: 'Billing & Plans',
      href: `/${locale}/dashboard/billing`,
      icon: CreditCard,
    },
    {
      title: dict.common.settings,
      href: `/${locale}/dashboard/settings`,
      icon: Settings,
    },
  ];

  const adminNavItems = [
    {
      title: 'Admin Overview',
      href: `/${locale}/dashboard/admin`,
      icon: ShieldCheck,
    },
    {
      title: 'Users & Roles',
      href: `/${locale}/dashboard/admin/users`,
      icon: Users,
    },
    {
      title: 'Global Purchases',
      href: `/${locale}/dashboard/admin/purchases`,
      icon: ShoppingBag,
    },
    {
      title: 'Audit Trail',
      href: `/${locale}/dashboard/admin/audit-logs`,
      icon: Activity,
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/50 p-4 space-y-6">
      {/* User Section */}
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          My Account
        </div>
        {userNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Admin Section (Displayed only for users with admin privilege) */}
      {isAdmin && (
        <div className="space-y-1 pt-4 border-t border-border">
          <div className="px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Admin Portal
            </span>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
              PRIVILEGED
            </span>
          </div>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Consumer Notice */}
      <div className="mt-auto pt-4">
        <div className="p-3 rounded-xl border border-border/80 bg-background text-[11px] text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground mb-1">Consumer Notice:</p>
          PurchaseGuard helps you organize claims. Retailers & manufacturers make the final determination.
        </div>
      </div>
    </aside>
  );
}
