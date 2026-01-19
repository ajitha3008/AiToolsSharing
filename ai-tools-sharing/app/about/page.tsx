'use client';

import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';
import { Sparkles, Users, Search, Share2 } from 'lucide-react';

export default function AboutPage() {
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
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-zinc-100">
            About AI Tools Sharing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            A community-driven platform for discovering and sharing practical AI tool workflows
          </p>
        </section>

        {/* Purpose Section */}
        <section className="mb-16">
          <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Our Purpose
            </h2>
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                AI Tools Sharing is a platform designed to help people discover and share practical AI tool workflows. 
                With the rapid growth of AI tools and applications, it can be overwhelming to find the right tool for 
                your specific use case, let alone learn how to use it effectively.
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Our mission is to create a space where users can:
              </p>
              <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400 mb-4">
                <li>Share the AI tools they use daily with their exact use cases</li>
                <li>Discover new tools and workflows that can boost productivity</li>
                <li>Learn from real-world examples and practical tips</li>
                <li>Build a community around AI tool discovery and knowledge sharing</li>
              </ul>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Whether you're a developer, designer, researcher, or anyone looking to leverage AI tools, 
                this platform helps you find the right workflow quickly and learn from others' experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100">
            What You Can Do
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Share2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Share Workflows
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Share the AI tools you use with detailed use cases, ratings, and helpful tips for the community.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Discover Tools
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Search and browse workflows shared by others to find the perfect AI tool for your needs.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Sparkles className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Learn Best Practices
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Learn from real-world examples and practical use cases to maximize your productivity with AI tools.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Join the Community
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Connect with others who are passionate about AI tools and productivity enhancement.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              How It Works
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  1
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
                    Sign Up
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Create an account to start sharing and discovering AI tool workflows.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  2
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
                    Share or Discover
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Submit your own workflows or browse through workflows shared by the community.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  3
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
                    Apply and Learn
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Use the workflows you discover to boost your productivity and share your experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-center dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900">
          <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Ready to Get Started?
          </h2>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            Join the community and start sharing or discovering AI tool workflows today.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign Up
            </Link>
            <Link
              href="/auth/signin"
              className="rounded-lg border border-zinc-300 bg-white px-6 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign In
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
