'use client';

// ========================================================
// Mobile Bottom Navigation Bar (Phone Screens with Floating Add Button)
// ========================================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Plus, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PurchaseModal } from '../purchases/PurchaseModal';

interface MobileBottomNavProps {
  locale: string;
}

export function MobileBottomNav({ locale }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isHome = pathname === `/${locale}/dashboard`;
  const isPurchases = pathname === `/${locale}/dashboard/purchases` && !pathname.includes('status=active');
  const isDeadlines = pathname.includes('status=active');
  const isSettings = pathname.includes('/dashboard/settings') || pathname.includes('/dashboard/billing');

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl safe-area-pb">
        <div className="grid grid-cols-5 h-16 items-center px-2 max-w-lg mx-auto">
          {/* 1. Home */}
          <Link
            href={`/${locale}/dashboard`}
            className={cn(
              'flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors relative',
              isHome ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isHome && <span className="absolute top-0 w-8 h-1 bg-primary rounded-full shadow-sm" />}
            <LayoutDashboard className={cn('w-5 h-5 mb-0.5', isHome ? 'text-primary stroke-[2.5]' : 'stroke-[1.75]')} />
            <span>Home</span>
          </Link>

          {/* 2. Purchases List */}
          <Link
            href={`/${locale}/dashboard/purchases`}
            className={cn(
              'flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors relative',
              isPurchases ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isPurchases && <span className="absolute top-0 w-8 h-1 bg-primary rounded-full shadow-sm" />}
            <ShoppingBag className={cn('w-5 h-5 mb-0.5', isPurchases ? 'text-primary stroke-[2.5]' : 'stroke-[1.75]')} />
            <span>Purchases</span>
          </Link>

          {/* 3. Floating Quick Add / Scan Receipt Button */}
          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              aria-label="Add Purchase / Scan Receipt"
              className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
            >
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center border-4 border-card group-hover:scale-105 group-active:scale-95 transition-all">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-[10px] font-bold text-primary mt-0.5">Scan / Add</span>
            </button>
          </div>

          {/* 4. Deadlines */}
          <Link
            href={`/${locale}/dashboard/purchases?status=active`}
            className={cn(
              'flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors relative',
              isDeadlines ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isDeadlines && <span className="absolute top-0 w-8 h-1 bg-primary rounded-full shadow-sm" />}
            <Clock className={cn('w-5 h-5 mb-0.5', isDeadlines ? 'text-primary stroke-[2.5]' : 'stroke-[1.75]')} />
            <span>Deadlines</span>
          </Link>

          {/* 5. Settings / Menu */}
          <Link
            href={`/${locale}/dashboard/settings`}
            className={cn(
              'flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors relative',
              isSettings ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isSettings && <span className="absolute top-0 w-8 h-1 bg-primary rounded-full shadow-sm" />}
            <Settings className={cn('w-5 h-5 mb-0.5', isSettings ? 'text-primary stroke-[2.5]' : 'stroke-[1.75]')} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* Floating Add Purchase Modal triggered from bottom nav */}
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
