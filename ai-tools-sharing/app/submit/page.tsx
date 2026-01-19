'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmitWorkflowPage() {
  const [toolName, setToolName] = useState('');
  const [useCase, setUseCase] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/auth/signin?redirect=/submit');
        return;
      }
      setUser(currentUser);
      setCheckingAuth(false);
    }
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/signin?redirect=/submit');
      } else {
        setUser(session.user);
        setCheckingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        router.push('/auth/signin?redirect=/submit');
        return;
      }

      if (!toolName.trim() || !useCase.trim()) {
        throw new Error('Tool name and use case are required');
      }

      // Parse hashtags
      const tagsArray = hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag.substring(1) : tag);

      const { data, error: insertError } = await supabase
        .from('ai_tools')
        .insert({
          user_id: user.id,
          tool_name: toolName.trim(),
          use_case: useCase.trim(),
          rating: rating || null,
          hashtags: tagsArray,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Success - redirect to home page which will refresh
      router.push('/');
      
      // Force immediate refresh
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your workflow');
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
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
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Submit Your Workflow
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Share an AI tool workflow that has helped you be more productive
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="toolName" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tool Name <span className="text-red-500">*</span>
              </label>
              <input
                id="toolName"
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="e.g., ChatGPT, Midjourney, Claude"
              />
            </div>

            <div>
              <label htmlFor="useCase" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Use Case <span className="text-red-500">*</span>
              </label>
              <textarea
                id="useCase"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                required
                rows={4}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="Describe how you use this tool and what problem it solves..."
              />
            </div>

            <div>
              <label htmlFor="rating" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Rating (optional)
              </label>
              <select
                id="rating"
                value={rating || ''}
                onChange={(e) => setRating(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">Select a rating</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>

            <div>
              <label htmlFor="hashtags" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Hashtags (optional)
              </label>
              <input
                id="hashtags"
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="productivity, automation, design (comma-separated)"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Separate multiple tags with commas
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loading ? 'Submitting...' : 'Submit Workflow'}
              </button>
              <Link
                href="/"
                className="rounded-lg border border-zinc-300 px-4 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
