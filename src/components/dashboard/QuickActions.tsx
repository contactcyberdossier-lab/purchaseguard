'use client';

// ========================================================
// Dashboard Quick Actions Component
// ========================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Mail, UploadCloud, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PurchaseModal } from '../purchases/PurchaseModal';
import { getDictionary } from '@/lib/i18n';

interface QuickActionsProps {
  locale: string;
}

export function QuickActions({ locale }: QuickActionsProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {dict.dashboard.quickActionsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="default"
            className="flex items-center gap-2 h-11 text-xs sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{dict.dashboard.actionAddPurchase}</span>
          </Button>

          <Link href={`/${locale}/dashboard#email-sync`} className="w-full">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 h-11 text-xs sm:text-sm"
            >
              <Mail className="h-4 w-4" />
              <span>{dict.dashboard.actionConnectEmail}</span>
            </Button>
          </Link>

          <Link href={`/${locale}/dashboard/purchases`} className="w-full">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 h-11 text-xs sm:text-sm"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{dict.dashboard.actionUploadReceipt}</span>
            </Button>
          </Link>

          <Link href={`/${locale}/dashboard/purchases?status=review_needed`} className="w-full">
            <Button
              variant="secondary"
              className="w-full flex items-center gap-2 h-11 text-xs sm:text-sm"
            >
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>{dict.dashboard.actionReviewPending}</span>
            </Button>
          </Link>
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
