import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function DashboardLayout({
  children,
  params: { locale },
}: DashboardLayoutProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch role and subscription status from public.users
  const { data: profile } = await supabase
    .from('users')
    .select('role, subscription_status')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const plan = profile?.subscription_status || 'free';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader 
        locale={locale} 
        userEmail={user.email} 
        isAdmin={isAdmin}
        plan={plan}
      />
      <div className="flex flex-1">
        <DashboardSidebar locale={locale} isAdmin={isAdmin} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav locale={locale} />
    </div>
  );
}
