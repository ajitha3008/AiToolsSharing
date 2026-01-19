'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Calendar, Hash } from 'lucide-react';

export default function DashboardPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        router.push('/auth/signin?redirect=/dashboard');
        return;
      }

      setUser(currentUser);

      // Fetch user's tools
      const { data: userTools, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('date_uploaded', { ascending: false });

      if (error) {
        console.error('Error fetching tools:', error);
      } else {
        setTools((userTools as any[]) || []);
      }

      setLoading(false);
    }

    loadData();

    // Listen for page visibility changes to refresh data
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    }

    function handleFocus() {
      loadData();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                AI
              </div>
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Tools Sharing
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Home
              </Link>
              <Link
                href="/submit"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Submit Workflow
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            My Workflows
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            View and manage all the AI tool workflows you've submitted
          </p>
        </div>

        {tools.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              You haven't submitted any workflows yet.
            </p>
            <Link
              href="/submit"
              className="inline-block rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Submit Your First Workflow
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {tool.tool_name}
                  </h3>
                  {tool.rating && (
                    <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <Star className="h-3 w-3 fill-current" />
                      {tool.rating}
                    </div>
                  )}
                </div>

                <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {tool.use_case}
                </p>

                {tool.hashtags && tool.hashtags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tool.hashtags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        <Hash className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(tool.date_uploaded).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
