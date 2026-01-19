import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req: request, res: response })

    // This refreshes the session safely on Edge
    await supabase.auth.getUser()
  } catch (error) {
    console.error('Middleware error:', error)
  }

  console.log('Middleware running')
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
