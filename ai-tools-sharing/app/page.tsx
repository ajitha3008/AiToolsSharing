'use client';

import { Search, Star, Hash, Calendar } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ToolCardProps {
  tool: {
    id: string;
    tool_name: string;
    use_case: string;
    rating: number | null;
    hashtags: string[];
    date_uploaded: string;
    profiles?: {
      username: string | null;
      fullname: string | null;
    };
  };
}

function ToolCard({ tool }: ToolCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
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
        
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {tool.use_case}
        </p>

        {tool.hashtags && tool.hashtags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {tool.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                <Hash className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
            {tool.profiles ? (
              <span>
                by {tool.profiles.username || tool.profiles.fullname || 'Unknown'}
              </span>
            ) : (
              <span>by Unknown</span>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(tool.date_uploaded).toLocaleDateString()}
            </div>
          </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  async function loadTools() {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch ALL tools (not just user's), ordered by date (newest first)
      const { data: toolsData, error: toolsError } = await supabase
        .from('ai_tools')
        .select('*')
        .order('date_uploaded', { ascending: false });

      if (toolsError) {
        console.error('Error fetching tools:', toolsError);
        setTools([]);
        setLoading(false);
        return;
      }

      if (!toolsData || toolsData.length === 0) {
        setTools([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for all unique user IDs
      const userIds = [...new Set(toolsData.map(tool => tool.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      // Create a map of user_id to profile
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }

      // Combine tools with profiles
      let filteredData = toolsData.map(tool => ({
        ...tool,
        profiles: profilesMap[tool.user_id] || null,
      }));
      
      // Apply search filter if query exists
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        filteredData = filteredData.filter(
          (tool) =>
            tool.tool_name.toLowerCase().includes(queryLower) ||
            tool.use_case.toLowerCase().includes(queryLower) ||
            (tool.hashtags && Array.isArray(tool.hashtags) && tool.hashtags.some((tag: string) => 
              tag.toLowerCase().includes(queryLower)
            ))
        );
      }
      
      setTools(filteredData);
    } catch (err) {
      console.error('Error:', err);
      setTools([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        await loadTools();
      } else {
        setLoading(false);
      }
    }

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadTools();
      } else {
        setTools([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Reload tools when search query changes (with debounce)
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(() => {
      loadTools();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);

  // Refresh tools when page becomes visible or gains focus (after navigation)
  useEffect(() => {
    if (!user) return;

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadTools();
      }
    }

    function handleFocus() {
      loadTools();
    }

    // Also refresh when page is loaded/navigated to
    const handleLoad = () => {
      loadTools();
    };
    handleLoad(); // Initial load

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

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
                href="/about"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                About
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Dashboard
                </Link>
              )}
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-16 text-center sm:py-24">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-zinc-100">
            Share & Discover
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Workflows
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 sm:text-xl dark:text-zinc-400">
            Share the AI tools you use daily, with exact use-cases and quick tips. 
            Discover practical workflows from the community.
          </p>

          {!user ? (
            <div className="mx-auto max-w-md space-y-4">
              <p className="text-zinc-600 dark:text-zinc-400">
                Sign in to start exploring AI tool workflows shared by the community.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/auth/signin"
                  className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-lg border border-zinc-300 bg-white px-6 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Get Started
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="mx-auto max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools, use cases, or tags..."
                    className="w-full rounded-xl border border-zinc-200 bg-white py-4 pl-12 pr-4 text-zinc-900 placeholder-zinc-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                {searchQuery ? (
                  <span>
                    {tools.length} {tools.length === 1 ? 'workflow' : 'workflows'} found
                  </span>
                ) : (
                  <span>{tools.length} {tools.length === 1 ? 'workflow' : 'workflows'} shared</span>
                )}
              </div>
            </>
          )}
        </section>

        {user ? (
          <>
            {/* Tools List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="text-zinc-600 dark:text-zinc-400">Loading workflows...</p>
                </div>
              </div>
            ) : tools.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                  {searchQuery ? 'No workflows found matching your search. Try different keywords.' : 'No workflows shared yet. Be the first to share!'}
                </p>
                {!searchQuery && (
                  <Link
                    href="/submit"
                    className="inline-block rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Submit Your First Workflow
                  </Link>
                )}
              </div>
            ) : (
              <section className="grid gap-6 pb-16 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </section>
            )}

            {/* CTA Section */}
            {!searchQuery && (
              <section className="mb-16 rounded-2xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-center dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900">
                <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Ready to share your workflow?
                </h2>
                <p className="mb-6 text-zinc-600 dark:text-zinc-400">
                  Join the community and share practical AI tool workflows.
                </p>
                <Link
                  href="/submit"
                  className="inline-block rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Submit Your Workflow
                </Link>
              </section>
            )}
          </>
        ) : (
          <div className="mx-auto max-w-2xl text-center py-12">
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
              Join our community to discover and share AI tool workflows that can help boost your productivity.
            </p>
            <Link
              href="/about"
              className="inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Learn more about our platform →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
