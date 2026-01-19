import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, just continue without auth
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            try {
              return request.cookies.getAll();
            } catch (error) {
              return [];
            }
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                request.cookies.set(name, value);
              });
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });
              cookiesToSet.forEach(({ name, value, options }) => {
                try {
                  response.cookies.set(name, value, options);
                } catch (cookieError) {
                  // Silently fail if cookie setting fails
                }
              });
            } catch (error) {
              // If cookie operations fail, continue with existing response
            }
          },
        },
      }
    );

    // Refresh session if expired (non-blocking)
    try {
      await supabase.auth.getUser();
    } catch (authError) {
      // Silently fail auth refresh - user can still access the page
      // This prevents middleware from blocking requests
    }
  } catch (error) {
    // If middleware fails completely, still continue with the request
    // This prevents the entire site from breaking if there's a Supabase issue
    // Return the response we already created
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
