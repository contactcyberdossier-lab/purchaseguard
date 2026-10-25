'use client';

// ========================================================
// Password Reset Request Form
// ========================================================

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { Button } from '../ui/Button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';

interface ResetPasswordFormProps {
  locale: string;
}

export function ResetPasswordForm({ locale }: ResetPasswordFormProps) {
  const dict = getDictionary(locale);
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Please provide a valid email');
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/reset-password/confirm`,
      });

      if (resetError) {
        setError(resetError.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-4 p-6 rounded-2xl border border-border bg-card">
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-2xl font-bold text-foreground">Check your inbox</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If an account exists for <strong className="text-foreground">{email}</strong>, a password reset link has been dispatched.
        </p>
        <Link href={`/${locale}/login`}>
          <Button variant="outline" className="mt-4 w-full">
            {dict.auth.backToLogin}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {dict.auth.resetTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{dict.auth.resetSubtitle}</p>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
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

        <Button type="submit" className="w-full h-11" isLoading={isLoading}>
          {dict.auth.submitReset}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <Link href={`/${locale}/login`} className="text-primary font-medium hover:underline">
          {dict.auth.backToLogin}
        </Link>
      </div>
    </div>
  );
}
