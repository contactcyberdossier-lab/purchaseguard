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
  onError?: (errorMessage: string) => void;
}

export function SocialAuthButtons({ locale, onError }: SocialAuthButtonsProps) {
  const dict = getDictionary(locale);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleOAuth = async (provider: 'google' | 'azure') => {
    setIsLoading(provider);
    if (provider === 'google') {
      // Direct-domain OAuth: Redirects through /api/auth/google/login so Google displays purchaseguardapp.com
      window.location.href = '/api/auth/google/login';
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        setIsLoading(null);
        onError?.(
          error.message.includes('not enabled')
            ? 'Microsoft Sign-in is not enabled in Supabase yet. Please enable the Azure provider in your Supabase Authentication settings.'
            : error.message
        );
      }
    } catch (err: any) {
      setIsLoading(null);
      onError?.(err?.message || 'Authentication failed. Please try again.');
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

      {/* Microsoft Sign In */}
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 h-11"
        isLoading={isLoading === 'azure'}
        onClick={() => handleOAuth('azure')}
      >
        <svg className="h-4 w-4" viewBox="0 0 21 21">
          <rect x="1" y="1" width="9" height="9" fill="#F25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
          <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
          <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
        <span>Continue with Microsoft</span>
      </Button>
    </div>
  );
}
