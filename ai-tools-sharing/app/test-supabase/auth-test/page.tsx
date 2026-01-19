'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check current user on mount
  useEffect(() => {
    async function checkUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    }
    checkUser();
  }, []);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      console.log('Attempting signup with:', { email, hasPassword: !!password });

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: username || email.split('@')[0],
            fullname: username || '',
          },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback',
        },
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        throw error;
      }

      // If user was created, create profile manually
      if (data.user) {
        console.log('User created, creating profile for:', data.user.id);
        console.log('User data:', data.user);
        console.log('Session:', data.session);
        
        // Check if we have a session (required for RLS)
        if (!data.session) {
          console.warn('No session after signup - email confirmation may be required');
          setMessage({
            type: 'success',
            text: 'Sign up successful! Please check your email to verify your account. After verification, your profile will be created automatically.',
          });
          setEmail('');
          setPassword('');
          setUsername('');
          return;
        }

        // Wait a moment to ensure session is fully established
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify we still have a session
        const { data: { user: currentUser, session: currentSession } } = await supabase.auth.getUser();
        if (!currentUser || !currentSession) {
          console.warn('Session not available for profile creation');
          setMessage({
            type: 'success',
            text: 'Sign up successful! Please sign in to complete profile creation.',
          });
          return;
        }

        console.log('Session verified, creating profile...');
        
        const baseUsername = (username || email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '').substring(0, 30);
        let finalUsername = baseUsername || 'user_' + data.user.id.substring(0, 8);
        let counter = 0;
        let profileCreated = false;
        let lastError: any = null;

        // Try to create profile, handle username conflicts
        while (!profileCreated && counter < 10) {
          console.log(`Attempting to create profile with username: ${finalUsername}`);
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: finalUsername,
              fullname: username || null,
            })
            .select()
            .single();

          if (!profileError && profileData) {
            console.log('✅ Profile created successfully:', profileData);
            profileCreated = true;
            break;
          }

          // Log the full error object
          lastError = profileError;
          console.error('❌ Profile creation error (full object):', profileError);
          console.error('Error details:', {
            code: profileError?.code,
            message: profileError?.message,
            details: profileError?.details,
            hint: profileError?.hint,
            status: profileError?.status,
            statusText: profileError?.statusText,
          });

          // Check if it's a username conflict
          const isUsernameConflict = 
            profileError?.code === '23505' || 
            profileError?.code === 'PGRST116' ||
            profileError?.message?.includes('unique') || 
            profileError?.message?.includes('duplicate') ||
            profileError?.message?.includes('violates unique constraint');

          if (isUsernameConflict) {
            counter++;
            finalUsername = baseUsername + counter;
            console.log(`Username conflict, trying: ${finalUsername}`);
          } else {
            // Other error - try with UUID-based username as fallback
            console.log('Non-username error, trying UUID-based username');
            finalUsername = 'user_' + data.user.id.substring(0, 8);
            const { data: uuidProfileData, error: uuidError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                username: finalUsername,
                fullname: username || null,
              })
              .select()
              .single();
            
            if (!uuidError && uuidProfileData) {
              console.log('✅ Profile created with UUID username:', uuidProfileData);
              profileCreated = true;
            } else {
              console.error('❌ UUID username also failed:', uuidError);
              console.error('Full UUID error:', JSON.stringify(uuidError, null, 2));
            }
            break;
          }
        }

        if (!profileCreated) {
          console.error('❌ Could not create profile. Last error:', lastError);
          console.error('Full error object:', JSON.stringify(lastError, null, 2));
          
          // Show helpful error message
          const errorMsg = lastError?.message || 
                          lastError?.hint || 
                          'Unknown error. Check browser console for details.';
          
          setMessage({
            type: 'error',
            text: `User created but profile creation failed: ${errorMsg}. The user account exists but profile needs to be created manually or after email verification.`,
          });
        } else {
          console.log('✅ Profile creation successful!');
        }
      }

      setMessage({
        type: 'success',
        text: data.user 
          ? 'Sign up successful! ' + (data.session ? 'You are now signed in.' : 'Check your email to verify your account.')
          : 'Sign up initiated. Check your email to complete registration.',
      });
      
      if (data.user) {
        setUser(data.user);
      }
      
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (error: any) {
      console.error('Signup failed:', error);
      const errorMessage = error.message || error.error_description || 'An error occurred during sign up';
      setMessage({
        type: 'error',
        text: `Sign up failed: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Sign in successful!',
      });
      setUser(data.user);
      router.refresh();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred during sign in',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Signed out successfully' });
      setUser(null);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Authentication Test
        </h1>

        {/* Current User Status */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Current Status
          </h2>
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Authenticated
                </span>
              </div>
              <div className="mt-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Email: {user.email}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  User ID: {user.id}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Not authenticated
              </span>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Sign Up Form */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Sign Up
          </h2>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Username (optional)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="username"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="password (min 6 characters)"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Sign In
          </h2>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
            Testing Notes
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>Sign up creates a new user account</li>
            <li>Check browser console (F12) for detailed error messages</li>
            <li>If you see "Database error saving new user", try disabling email confirmations in Supabase Dashboard</li>
            <li>Check Supabase Dashboard → Logs → Auth Logs for detailed errors</li>
            <li>Your profile will be created automatically after signup</li>
          </ul>
        </div>

        {/* Troubleshooting Box */}
        {message?.type === 'error' && message.text.includes('Database error') && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <h3 className="mb-2 font-semibold text-red-900 dark:text-red-100">
              ⚠️ Quick Fix Required
            </h3>
            <p className="mb-3 text-sm text-red-800 dark:text-red-300">
              The database trigger is causing signup to fail. Follow these steps:
            </p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-red-800 dark:text-red-300">
              <li>
                <strong>Go to Supabase Dashboard → SQL Editor</strong>
              </li>
              <li>
                <strong>Copy and paste this SQL:</strong>
                <pre className="mt-1 overflow-x-auto rounded bg-red-100 p-2 text-xs dark:bg-red-900/30">
                  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
                </pre>
              </li>
              <li>
                <strong>Click "Run"</strong>
              </li>
              <li>
                <strong>Come back here and try signing up again</strong> - it should work now!
              </li>
            </ol>
            <p className="mt-4 text-xs text-red-700 dark:text-red-400">
              Note: After disabling the trigger, profiles will be created by the application code instead. 
              Once signup works, we can fix the trigger to work properly.
            </p>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <a
            href="/test-supabase"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Database Test
          </a>
        </div>
      </div>
    </div>
  );
}
