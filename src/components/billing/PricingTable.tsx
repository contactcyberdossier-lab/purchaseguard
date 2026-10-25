'use client';

// ========================================================
// In-App Pricing & Subscription Tier Selector
// ========================================================

import { useState } from 'react';
import { Check, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { PRICING_PLANS } from '@/lib/stripe';

interface PricingTableProps {
  currentPlanId: string;
  locale: string;
}

export function PricingTable({ currentPlanId, locale }: PricingTableProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, locale }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch {
      alert('An unexpected error occurred.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleOpenPortal = async () => {
    setLoadingPlan('portal');
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to open billing portal');
      }
    } catch {
      alert('An unexpected error occurred.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Free Plan */}
        <Card className="flex flex-col justify-between border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl">{PRICING_PLANS.free.name}</CardTitle>
            <CardDescription className="text-xs">
              For occasional shoppers tracking up to 5 purchases.
            </CardDescription>
            <div className="mt-4 text-3xl font-extrabold text-foreground">
              $0
              <span className="text-xs font-normal text-muted-foreground ml-1">/ forever</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 flex-1">
            {PRICING_PLANS.free.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            {currentPlanId === 'free' ? (
              <Button disabled variant="outline" className="w-full text-xs">
                Current Plan
              </Button>
            ) : (
              <Button variant="outline" className="w-full text-xs" onClick={handleOpenPortal}>
                Manage in Portal
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Plus Monthly Plan */}
        <Card className={`flex flex-col justify-between bg-card ${currentPlanId === 'plus' ? 'border-2 border-primary shadow-md' : 'border-border'}`}>
          <CardHeader>
            <CardTitle className="text-xl">{PRICING_PLANS.plus_monthly.name}</CardTitle>
            <CardDescription className="text-xs">
              Full power with unlimited tracking and automated email sync.
            </CardDescription>
            <div className="mt-4 text-3xl font-extrabold text-foreground">
              $5
              <span className="text-xs font-normal text-muted-foreground ml-1">/ month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 flex-1">
            {PRICING_PLANS.plus_monthly.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            {currentPlanId === 'plus' ? (
              <Button variant="outline" className="w-full text-xs" onClick={handleOpenPortal} isLoading={loadingPlan === 'portal'}>
                Manage Subscription
              </Button>
            ) : (
              <Button
                className="w-full text-xs"
                onClick={() => handleSubscribe('plus_monthly')}
                isLoading={loadingPlan === 'plus_monthly'}
              >
                Upgrade to Plus Monthly
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Plus Annual Plan */}
        <Card className={`flex flex-col justify-between bg-card relative ${currentPlanId === 'annual' ? 'border-2 border-emerald-500 shadow-md' : 'border-border'}`}>
          <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Save 18%
          </div>
          <CardHeader>
            <CardTitle className="text-xl">{PRICING_PLANS.plus_annual.name}</CardTitle>
            <CardDescription className="text-xs">
              Best value for frequent buyers (2 months free).
            </CardDescription>
            <div className="mt-4 text-3xl font-extrabold text-foreground">
              $49
              <span className="text-xs font-normal text-muted-foreground ml-1">/ year</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 flex-1">
            {PRICING_PLANS.plus_annual.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            {currentPlanId === 'annual' ? (
              <Button variant="outline" className="w-full text-xs" onClick={handleOpenPortal} isLoading={loadingPlan === 'portal'}>
                Manage Subscription
              </Button>
            ) : (
              <Button
                className="w-full text-xs"
                onClick={() => handleSubscribe('plus_annual')}
                isLoading={loadingPlan === 'plus_annual'}
              >
                Get Annual Saver
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* 14-day Money-back Guarantee & Third-party merchant disclaimer */}
      <div className="p-4 rounded-xl border border-border/80 bg-background/60 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">14-Day Money-Back Guarantee:</span> If you are not satisfied with your PurchaseGuard Plus subscription, cancel within 14 days for a full refund of your subscription fee.
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Please note: This guarantee applies exclusively to the PurchaseGuard software subscription fee. PurchaseGuard is an organizational tool; all retailer refunds, returns, warranties, and carrier claims remain subject to the individual merchant’s terms and approval.
          </p>
        </div>
      </div>
    </div>
  );
}
