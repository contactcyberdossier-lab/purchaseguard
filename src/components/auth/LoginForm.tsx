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
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
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
          className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
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
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {dict.auth.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
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
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Button type="submit" className="w-full h-11" isLoading={isLoading}>
          {dict.auth.submitSignIn}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {dict.auth.noAccount}{' '}
        <Link
          href={`/${locale}/register`}
          className="text-primary font-semibold hover:underline"
        >
          {dict.nav.getStarted}
        </Link>
      </div>
    </div>
  );
}
