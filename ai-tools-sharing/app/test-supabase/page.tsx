import { createClient } from '@/lib/supabase/server';

export default async function TestSupabasePage() {
  const supabase = await createClient();

  // Test 1: Fetch AI tools
  const { data: tools, error: toolsError } = await supabase
    .from('ai_tools')
    .select('*')
    .order('date_uploaded', { ascending: false })
    .limit(5);

  // Fetch profiles for the tools separately
  let profilesMap: Record<string, any> = {};
  if (tools && tools.length > 0) {
    const userIds = [...new Set((tools as any[]).map((tool: any) => tool.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profilesData) {
      profilesMap = (profilesData as any[]).reduce((acc: Record<string, any>, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);
    }
  }

  // Test 2: Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);

  // Test 3: Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Supabase Connection Test
        </h1>

        {/* Connection Status */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Connection Status
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Supabase client initialized successfully
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${user ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user ? `Authenticated as: ${user.email}` : 'Not authenticated (this is OK for testing)'}
              </span>
            </div>
          </div>
        </div>

        {/* Test 1: AI Tools */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Test 1: Fetch AI Tools
          </h2>
          {toolsError ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-medium">Error:</p>
              <p className="text-sm">{toolsError.message}</p>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                Make sure your .env.local file has the correct Supabase credentials.
              </p>
            </div>
          ) : tools && tools.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Successfully fetched {tools.length} tool(s)
              </p>
              <div className="space-y-3">
                {(tools as any[]).map((tool: any) => (
                  <div
                    key={tool.id}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {tool.tool_name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {tool.use_case}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {tool.hashtags && tool.hashtags.length > 0 && (
                            <>
                              {(tool.hashtags as string[]).map((tag: string, idx: number) => (
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
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          Uploaded: {new Date(tool.date_uploaded).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {profilesMap[tool.user_id] && (
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        By: {profilesMap[tool.user_id].username || profilesMap[tool.user_id].fullname || 'Unknown'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              <p className="font-medium">No tools found</p>
              <p className="mt-1 text-sm">
                The connection works, but there are no AI tools in the database yet.
              </p>
            </div>
          )}
        </div>

        {/* Test 2: Profiles */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Test 2: Fetch Profiles
          </h2>
          {profilesError ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-medium">Error:</p>
              <p className="text-sm">{profilesError.message}</p>
            </div>
          ) : profiles && profiles.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ Successfully fetched {profiles.length} profile(s)
              </p>
              <div className="space-y-2">
                {(profiles as any[]).map((profile: any) => (
                  <div
                    key={profile.id}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {profile.username || profile.fullname || 'Unnamed User'}
                    </p>
                    {profile.fullname && profile.username && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {profile.fullname}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Created: {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              <p className="font-medium">No profiles found</p>
              <p className="mt-1 text-sm">
                The connection works, but there are no profiles in the database yet.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h2 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
            Next Steps
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>If you see errors, check your .env.local file has the correct Supabase credentials</li>
            <li>If you see "No tools found", that's OK - you can add data through Supabase Dashboard</li>
            <li>Once this test works, you can start building your actual features!</li>
          </ul>
        </div>

        {/* Links */}
        <div className="mt-8 flex gap-4">
          <a
            href="/test-supabase/auth-test"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            Test Authentication →
          </a>
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
