import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── CORS helpers ─────────────────────────────────────────────────────────────
const PRODUCTION_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? ''

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin   = request.headers.get('origin') ?? ''
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/api/ping')) {
    return {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  }

  const allowedOrigin =
    origin === PRODUCTION_ORIGIN || origin === 'http://localhost:3000'
      ? origin
      : PRODUCTION_ORIGIN

  return {
    'Access-Control-Allow-Origin':      allowedOrigin,
    'Access-Control-Allow-Methods':     'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':     'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function withCors(request: NextRequest, response: NextResponse): NextResponse {
  Object.entries(getCorsHeaders(request)).forEach(([k, v]) =>
    response.headers.set(k, v)
  )
  return response
}

// ── Routes that never need auth logic ────────────────────────────────────────
// These still go through Supabase client so session cookies are refreshed,
// but we skip all redirect logic for them.
function isApiOnlyRoute(pathname: string) {
  return (
    pathname.startsWith('/api/ping') ||
    pathname.startsWith('/api/badge') ||
    pathname.startsWith('/api/webhooks/') ||
    pathname.startsWith('/api/check-monitors')
  )
}

// ── Main proxy function ───────────────────────────────────────────────────────
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Handle CORS preflight immediately — no auth needed
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) })
  }

  // Skip Supabase entirely for pure API/webhook routes (they handle their own auth)
  if (isApiOnlyRoute(pathname)) {
    return withCors(request, NextResponse.next({ request }))
  }

  // ── Always refresh the Supabase session on every request ─────────────
  // This is REQUIRED by Supabase SSR — skipping it causes logout on navigation.
  // We create the client and call getSession on ALL routes, including public ones.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Write updated cookies to both request and response
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This refreshes the session token if it's expiring — do NOT remove this call
  const { data: { user } } = await supabase.auth.getUser()

  // ── Public pages — no redirect logic, just return with refreshed session ──
  const isPublicPage =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/pricing' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' || 
    pathname.startsWith('/status')||
    pathname.startsWith('/auth/callback')
  if (isPublicPage) {
    return withCors(request, supabaseResponse)
  }

  // ── Protected routes — redirect to login if not authenticated ────────
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/monitors') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/upgrade')

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Auth pages — redirect to dashboard if already logged in ──────────
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return withCors(request, supabaseResponse)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth/callback).*)'],
}