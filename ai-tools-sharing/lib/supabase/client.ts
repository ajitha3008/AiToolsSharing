import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // This function is only called in the browser
          if (typeof document === 'undefined') {
            return [];
          }
          return document.cookie.split(';').map((cookie) => {
            const [name, ...rest] = cookie.split('=');
            return { name: name.trim(), value: rest.join('=') };
          });
        },
        setAll(cookiesToSet) {
          // This function is only called in the browser
          if (typeof document === 'undefined') {
            return;
          }
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=${options?.path || '/'}; max-age=${options?.maxAge || 31536000}; SameSite=${options?.sameSite || 'Lax'}`;
          });
        },
      },
    }
  );
}
