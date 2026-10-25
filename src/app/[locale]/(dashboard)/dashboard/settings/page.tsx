import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsTabs } from '@/components/settings/SettingsTabs';

interface SettingsPageProps {
  params: {
    locale: string;
  };
}

export default async function SettingsPage({ params: { locale } }: SettingsPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const userProfile = profile || {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    country: 'US',
    preferred_language: locale,
    preferred_currency: 'USD',
    timezone: 'UTC',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Account & Privacy Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your profile preferences, regional currency, deadline notifications, and data ownership.
        </p>
      </div>

      <SettingsTabs initialProfile={userProfile} locale={locale} />
    </div>
  );
}
