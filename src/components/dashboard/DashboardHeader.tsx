'use client';

// ========================================================
// Authenticated Dashboard Header with Mobile Navigation Drawer
// ========================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  ShoppingBag, 
  Clock, 
  Mail, 
  CreditCard, 
  Settings, 
  Activity, 
  Users as UsersIcon 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { getDictionary } from '@/lib/i18n';

interface DashboardHeaderProps {
  locale: string;
  userEmail?: string;
  isAdmin?: boolean;
  plan?: string;
}

export function DashboardHeader({ locale, userEmail, isAdmin = false, plan = 'free' }: DashboardHeaderProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  };

  const navLinks = [
    { title: dict.common.dashboard, href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { title: 'Purchases', href: `/${locale}/dashboard/purchases`, icon: ShoppingBag },
    { title: 'Deadlines', href: `/${locale}/dashboard/purchases?status=active`, icon: Clock },
    { title: 'Email Sync', href: `/${locale}/dashboard#email-sync`, icon: Mail },
    { title: 'Billing & Plans', href: `/${locale}/dashboard/billing`, icon: CreditCard },
    { title: dict.common.settings, href: `/${locale}/dashboard/settings`, icon: Settings },
  ];

  const adminLinks = [
    { title: 'Admin Overview', href: `/${locale}/dashboard/admin`, icon: ShieldCheck },
    { title: 'Users & Roles', href: `/${locale}/dashboard/admin/users`, icon: UsersIcon },
    { title: 'Global Purchases', href: `/${locale}/dashboard/admin/purchases`, icon: ShoppingBag },
    { title: 'Audit Trail', href: `/${locale}/dashboard/admin/audit-logs`, icon: Activity },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href={`/${locale}/dashboard`} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline">
                {dict.common.appName}
              </span>
            </Link>
            
            {isAdmin ? (
              <Link href={`/${locale}/dashboard/admin`}>
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary font-mono shadow-sm hover:bg-primary/20 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ADMIN PORTAL
                </span>
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase font-mono">
                {plan} Tier
              </span>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <LanguageSelector currentLocale={locale} />
            <ThemeToggle />

            {/* User profile info & sign out */}
            <div className="flex items-center gap-2 pl-2 border-l border-border rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-2">
              <div className="hidden lg:flex flex-col text-right rtl:text-left text-xs">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="font-semibold text-foreground max-w-[140px] truncate">
                    {userEmail || 'My Account'}
                  </span>
                  {isAdmin && (
                    <span className="bg-primary text-primary-foreground px-1.5 py-0.2 rounded text-[9px] font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground text-[10px] uppercase font-mono">
                  {plan} Tier
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive flex items-center gap-1.5 px-2 sm:px-3"
                title={dict.common.logout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{dict.common.logout}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-card border-r border-border p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{dict.common.appName}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">{plan} Tier</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Info Card */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Signed In As</span>
                <span className="text-xs font-semibold text-foreground truncate block mt-0.5">{userEmail}</span>
              </div>

              {/* Main Navigation Links */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground px-2 block mb-2">
                  Navigation
                </span>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Admin Links (If Admin) */}
              {isAdmin && (
                <div className="space-y-1 pt-3 border-t border-border">
                  <span className="text-[11px] font-semibold uppercase text-primary px-2 block mb-2">
                    Admin Portal
                  </span>
                  {adminLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                      >
                        <Icon className="w-4 h-4 text-primary" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-border space-y-3">
              <Button
                variant="outline"
                className="w-full text-xs justify-center text-destructive border-destructive/20 hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                <span>{dict.common.logout}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
