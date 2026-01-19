'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
            fullname: fullname || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      // If user was created and we have a session, create profile
      if (data.user && data.session) {
        const baseUsername = (username || email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '').substring(0, 30);
        let finalUsername = baseUsername || 'user_' + data.user.id.substring(0, 8);
        let counter = 0;
        let profileCreated = false;

        while (!profileCreated && counter < 10) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: finalUsername,
              fullname: fullname || null,
            });

          if (!profileError) {
            profileCreated = true;
            break;
          }

          if (profileError?.code === '23505' || profileError?.message?.includes('unique')) {
            counter++;
            finalUsername = baseUsername + counter;
          } else {
            finalUsername = 'user_' + data.user.id.substring(0, 8);
            const { error: uuidError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                username: finalUsername,
                fullname: fullname || null,
              });
            if (!uuidError) profileCreated = true;
            break;
          }
        }
      }

      if (data.user) {
        if (data.session) {
          // User is signed in immediately (email confirmation disabled)
          setSuccess(true);
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1500);
        } else {
          // Email confirmation required
          setSuccess(true);
          setError(null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  }

  if (success && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Account created!
          </h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            {supabase.auth.getSession() ? 
              'Redirecting you to the home page...' : 
              'Please check your email to verify your account.'}
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
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
            Get started
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Create your account to start sharing AI tools
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label htmlFor="fullname" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full Name (optional)
              </label>
              <input
                id="fullname"
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Username (optional)
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="johndoe"
              />
            </div>

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
                minLength={6}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="At least 6 characters"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              Already have an account?{' '}
            </span>
            <Link
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
