'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      // Check if profile exists, create if not
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').substring(0, 30);
          await supabase.from('profiles').insert({
            id: data.user.id,
            username: baseUsername || 'user_' + data.user.id.substring(0, 8),
            fullname: null,
          });
        }
      }

      // Redirect to the page they were trying to access, or home
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
              AI
            </div>
            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Tools Sharing
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Welcome back
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Sign in to your account to continue
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              Don't have an account?{' '}
            </span>
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign up
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
