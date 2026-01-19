'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function ClientTestPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      try {
        // Fetch tools
        const { data, error: toolsError } = await supabase
          .from('ai_tools')
          .select('*')
          .order('date_uploaded', { ascending: false })
          .limit(5);

        if (toolsError) throw toolsError;

        setTools(data || []);

        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Client-Side Supabase Test
        </h1>

        {error ? (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <h2 className="mb-2 text-xl font-semibold text-red-900 dark:text-red-100">
              Error
            </h2>
            <p className="text-red-800 dark:text-red-300">{error}</p>
            <p className="mt-2 text-sm text-red-700 dark:text-red-400">
              Make sure your .env.local file has the correct Supabase credentials.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Connection Status
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Client-side Supabase connection successful
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${user ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {user ? `Authenticated as: ${user.email}` : 'Not authenticated'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                AI Tools ({tools.length})
              </h2>
              {tools.length > 0 ? (
                <div className="space-y-3">
                  {tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {tool.tool_name}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {tool.use_case}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tool.hashtags && tool.hashtags.length > 0 && (
                          <>
                            {tool.hashtags.map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </>
                        )}
                        {tool.rating && (
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            ⭐ {tool.rating}/5
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-600 dark:text-zinc-400">
                  No tools found. Add some data through Supabase Dashboard!
                </p>
              )}
            </div>
          </>
        )}

        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
