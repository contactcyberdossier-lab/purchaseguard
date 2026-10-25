import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PricingTable } from '@/components/billing/PricingTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CreditCard, CheckCircle2, History } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/i18n';

interface BillingPageProps {
  params: {
    locale: string;
  };
}

export default async function BillingPage({ params: { locale } }: BillingPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_status, stripe_customer_id, preferred_currency')
    .eq('id', user.id)
    .single();

  const currentStatus = profile?.subscription_status || 'free';

  // Fetch billing events history
  const { data: events } = await supabase
    .from('subscription_events')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Subscription & Billing
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your plan, payment methods, and invoices with automated sales tax compliance.
        </p>
      </div>

      {/* Active Subscription Banner */}
      <Card className="border-border bg-card">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground capitalize">
                  Current Tier: {currentStatus === 'annual' ? 'Plus (Annual Saver)' : currentStatus}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentStatus === 'free'
                  ? 'Limited to 5 manual purchases. Upgrade for automated Gmail & Outlook sync.'
                  : 'Enjoying unlimited purchase tracking and smart receipt extraction.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Selector */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Choose Your Plan</h2>
        <PricingTable currentPlanId={currentStatus} locale={locale} />
      </div>

      {/* Billing Invoices History */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <span>Billing & Invoice History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events && events.length > 0 ? (
            <div className="divide-y divide-border text-xs">
              {events.map((ev: any) => (
                <div key={ev.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground capitalize">
                      {ev.event_type.replace(/\./g, ' ')}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatDate(ev.created_at, locale)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">
                      {formatCurrency(ev.amount || 0, ev.currency || 'USD', locale)}
                    </span>
                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                      Paid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No previous billing events recorded. Invoices will appear here after subscription.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
