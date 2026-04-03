// app/api/upgrade/route.ts
// ── Temporarily disabled until May 28 2026 (payments launch date) ────────────
// All logic is ready — just needs LEMONSQUEEZY_CHECKOUT_URL set in env vars.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getIP } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // ── Rate limiting — 10 checkout attempts per hour per IP ─────────────
  const ip    = getIP(request)
  const limit = rateLimit(`upgrade:${ip}`, {
    limit:    10,
    windowMs: 60 * 60 * 1000,
  })

  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 }
    )
  }

  // ── Auth check ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Validate env var ──────────────────────────────────────────────────
  const checkoutUrl = process.env.LEMONSQUEEZY_CHECKOUT_URL
  if (!checkoutUrl) {
    console.error('[upgrade] LEMONSQUEEZY_CHECKOUT_URL is not set')
    return NextResponse.json(
      { error: 'Payments are not yet available. Check back soon!' },
      { status: 503 }
    )
  }

  // ── Build checkout URL with pre-filled user data ──────────────────────
  const url = new URL(checkoutUrl)
  url.searchParams.set('checkout[email]',             user.email)
  url.searchParams.set('checkout[custom][user_id]',   user.id)

  return NextResponse.json({ url: url.toString() })
}