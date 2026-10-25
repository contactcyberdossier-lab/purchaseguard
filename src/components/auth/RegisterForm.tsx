'use client';

// ========================================================
// Register Form Component
// ========================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { registerSchema } from '@/lib/validations/auth';
import { Button } from '../ui/Button';
import { SocialAuthButtons } from './SocialAuthButtons';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getDictionary } from '@/lib/i18n';

interface RegisterFormProps {
  locale: string;
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = registerSchema.safeParse({ fullName, email, password, acceptTerms });
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Please check your inputs.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            preferred_language: locale,
          },
          emailRedirectTo: `${window.location.origin}/${locale}/api/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      // If email confirmation is required:
      if (data?.user && !data.session) {
        setIsSuccess(true);
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

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-4 p-6 rounded-2xl border border-border bg-card">
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-2xl font-bold text-foreground">Verify your email</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We’ve sent a verification link to <strong className="text-foreground">{email}</strong>.
          Please check your inbox to activate your account.
        </p>
        <Link href={`/${locale}/login`}>
          <Button variant="outline" className="mt-4 w-full">
            {dict.common.login}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {dict.auth.signUpTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{dict.auth.signUpSubtitle}</p>
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

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
            {dict.auth.fullNameLabel}
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Jane Doe"
          />
        </div>

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
            {dict.auth.passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Must be at least 8 characters with upper, lower, number, and special character.
          </p>
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 rounded border-input text-primary focus:ring-ring"
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-normal">
            I agree to the{' '}
            <Link href={`/${locale}/terms`} className="text-primary underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href={`/${locale}/privacy`} className="text-primary underline">
              Privacy Policy
            </Link>.
          </label>
        </div>

        <Button type="submit" className="w-full h-11" isLoading={isLoading}>
          {dict.auth.submitSignUp}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {dict.auth.haveAccount}{' '}
        <Link href={`/${locale}/login`} className="text-primary font-semibold hover:underline">
          {dict.common.login}
        </Link>
      </div>
    </div>
  );
}
