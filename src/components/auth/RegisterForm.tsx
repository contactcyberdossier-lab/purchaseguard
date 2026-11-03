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
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (signUpError) {
        if (signUpError.message === 'Failed to fetch') {
          setError(
            'Cannot reach Supabase database. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set for Production in Vercel Settings > Environment Variables, and that you trigger a Redeploy.'
          );
        } else {
          setError(signUpError.message);
        }
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

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-2xl border border-border bg-card shadow-sm text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {dict.auth.checkEmailTitle}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {dict.auth.checkEmailSub}
        </p>
        <Link href={`/${locale}/login`}>
          <Button variant="outline" className="mt-4">
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
          {dict.auth.signUpTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{dict.auth.signUpSubtitle}</p>
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
      <SocialAuthButtons locale={locale} onError={(msg) => setError(msg)} />

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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            {dict.auth.fullNameLabel}
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            required
            autoComplete="name"
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
          />
        </div>

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
          <label className="block text-xs font-medium text-foreground mb-1.5">
            {dict.auth.passwordLabel}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="new-password"
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Must be at least 8 characters with 1 number and 1 special character.
          </p>
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            required
            className="h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-normal">
            I agree to the{' '}
            <Link href={`/${locale}/terms`} className="text-primary hover:underline font-medium">
              Terms of Service
            </Link>{' '}
            and acknowledge the{' '}
            <Link href={`/${locale}/privacy`} className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-sm font-semibold rounded-xl"
        >
          {isLoading ? dict.common.loading : dict.auth.submitSignUp}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        {dict.auth.haveAccount}{' '}
        <Link
          href={`/${locale}/login`}
          className="text-primary hover:underline font-semibold"
        >
          {dict.auth.submitSignIn}
        </Link>
      </p>
    </div>
  );
}
