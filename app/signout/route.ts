/**
 * SAVE THIS FILE AT:
 *   app/signout/route.ts        ← the folder must be named "signout"
 *                                  and the file must be named "route.ts"
 *
 * The full path from your project root should be:
 *   <your-project>/app/signout/route.ts
 *
 * NOT:
 *   app/signout.ts              ← wrong, this is a page not a route handler
 *   app/api/signout/route.ts    ← also fine, but then links must use /api/signout
 *   pages/signout.ts            ← wrong, that is the old Pages Router
 */

import { NextResponse, type NextRequest } from 'next/server'

// Supabase @supabase/ssr  (used by most recent Next.js setups)
// If this import fails, see the alternative below.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function signOut() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:    () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // called from a Server Component — cookies are read-only there,
            // but the session deletion still goes through on the client.
          }
        },
      },
    }
  )

  await supabase.auth.signOut()
}

/** POST /signout — correct method (from a <form> or fetch POST) */
export async function POST(_req: NextRequest) {
  await signOut()
  return NextResponse.redirect(new URL('/', _req.url))
}

/**
 * GET /signout — fallback so a plain <a href="/signout"> also works
 * and the user doesn't see a 404 if they visit the URL directly.
 */
export async function GET(_req: NextRequest) {
  await signOut()
  return NextResponse.redirect(new URL('/', _req.url))
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ALTERNATIVE — if you use the older @supabase/auth-helpers-nextjs package
 * instead of @supabase/ssr, replace the import block at the top with:
 *
 *   import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
 *   import { cookies } from 'next/headers'
 *
 * And replace the signOut() function with:
 *
 *   async function signOut() {
 *     const supabase = createRouteHandlerClient({ cookies })
 *     await supabase.auth.signOut()
 *   }
 * ───────────────────────────────────────────────────────────────────────────── */