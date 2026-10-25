import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader locale={locale} userEmail={user.email} />
      <div className="flex flex-1">
        <DashboardSidebar locale={locale} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
