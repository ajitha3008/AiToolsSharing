import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Middleware runs on Edge Runtime by default in Next.js
// This is correct for Supabase SSR - no need to specify runtime
export async function middleware(request: NextRequest) {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured, continue without auth
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    return NextResponse.next();
  }

  // Create a mutable response object for Edge runtime
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
              console.error('[Middleware] Error getting cookies:', error);
              return [];
            }
          },
          setAll(cookiesToSet) {
            try {
              // Update request cookies
              cookiesToSet.forEach(({ name, value }) => {
                request.cookies.set(name, value);
              });
              
              // Create a new response with updated cookies
              response = NextResponse.next({
                request,
              });
              
              // Set cookies on response
              cookiesToSet.forEach(({ name, value, options }) => {
                try {
                  response.cookies.set(name, value, options);
                } catch (cookieError: any) {
                  console.error('[Middleware] Error setting cookie:', {
                    name,
                    error: cookieError?.message || cookieError,
                  });
                }
              });
            } catch (error: any) {
              console.error('[Middleware] Error in setAll cookies:', {
                error: error?.message || error,
                stack: error?.stack,
              });
            }
          },
        },
      }
    );

    // Refresh session if expired (non-blocking)
    try {
      await supabase.auth.getUser();
    } catch (authError: any) {
      console.error('[Middleware] Auth getUser error:', {
        message: authError?.message || authError,
        code: authError?.code,
        status: authError?.status,
      });
      // Silently fail auth refresh - continue without auth
    }
  } catch (error: any) {
    // Log detailed error information - this will show in Vercel logs
    const errorDetails = {
      message: error?.message || String(error),
      name: error?.name,
      code: error?.code,
      status: error?.status,
      stack: error?.stack,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };
    
    console.error('[Middleware] Fatal error:', JSON.stringify(errorDetails, null, 2));
    
    // Add error details to response headers for debugging (visible in browser dev tools)
    response.headers.set('x-middleware-error', 'true');
    response.headers.set('x-middleware-error-message', errorDetails.message || 'Unknown error');
    
    // In development, add more details to headers
    if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development') {
      response.headers.set('x-middleware-error-details', JSON.stringify(errorDetails));
      console.error('[Middleware] Full error object:', error);
    }
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
