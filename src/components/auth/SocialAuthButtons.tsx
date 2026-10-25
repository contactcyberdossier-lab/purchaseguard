'use client';

// ========================================================
// Social OAuth Buttons (Google & Apple)
// ========================================================

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '../ui/Button';
import { getDictionary } from '@/lib/i18n';

interface SocialAuthButtonsProps {
  locale: string;
}

export function SocialAuthButtons({ locale }: SocialAuthButtonsProps) {
  const dict = getDictionary(locale);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(provider);
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/${locale}/api/auth/callback`,
        },
      });
    } catch {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 h-11"
        isLoading={isLoading === 'google'}
        onClick={() => handleOAuth('google')}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"
          />
        </svg>
        <span>{dict.auth.googleAuth}</span>
      </Button>

      {/* Apple Sign In */}
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 h-11"
        isLoading={isLoading === 'apple'}
        onClick={() => handleOAuth('apple')}
      >
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.65-2.82 1.46-.61.71-1.15 1.87-.99 2.98 1.07.08 2.16-.54 2.82-1.34z" />
        </svg>
        <span>{dict.auth.appleAuth}</span>
      </Button>
    </div>
  );
}
