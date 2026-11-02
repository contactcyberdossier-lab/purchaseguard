'use client';

// ========================================================
// Login Form Component
// ========================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/validations/auth';
import { Button } from '../ui/Button';
import { SocialAuthButtons } from './SocialAuthButtons';
import { AlertCircle } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';

interface LoginFormProps {
  locale: string;
}

export function LoginForm({ locale }: LoginFormProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Invalid input');
      return;
    }

    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === 'Failed to fetch') {
          setError(
            'Cannot reach Supabase database. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set for Production in Vercel Settings > Environment Variables, and that you trigger a Redeploy.'
          );
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (err: any) {
      if (err?.message === 'Failed to fetch') {
        setError(
          'Cannot reach Supabase database. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set for Production in Vercel Settings > Environment Variables, and that you trigger a Redeploy.'
        );
      } else {
        setError(err?.message || 'An unexpected error occurred. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {dict.auth.signInTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{dict.auth.signInSubtitle}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Social Logins */}
      <SocialAuthButtons locale={locale} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground font-medium">
            {dict.auth.orContinueWith}
          </span>
        </div>
      </div>

      {/* Email Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            {dict.auth.emailLabel}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-foreground">
              {dict.auth.passwordLabel}
            </label>
            <Link
              href={`/${locale}/forgot-password`}
              className="text-xs text-primary hover:underline font-medium"
            >
              {dict.auth.forgotPassword}
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-sm font-semibold rounded-xl"
        >
          {isLoading ? dict.common.loading : dict.auth.submitSignIn}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        {dict.auth.noAccount}{' '}
        <Link
          href={`/${locale}/register`}
          className="text-primary hover:underline font-semibold"
        >
          {dict.auth.submitSignUp}
        </Link>
      </p>
    </div>
  );
}
