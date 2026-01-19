'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/auth/signin"
          className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Sign In
        </a>
        <a
          href="/auth/signup"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Get Started
        </a>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
          {user.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="hidden sm:inline">{user.email?.split('@')[0] || 'User'}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-lg border border-zinc-200 bg-white shadow-lg group-hover:block dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-2">
          <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
            {user.email}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
