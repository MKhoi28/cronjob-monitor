// app/api/webhooks/lemonsqueezy/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Supabase admin client — bypasses RLS so we can write to profiles
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Verify the request actually came from Lemon Squeezy
 * using HMAC-SHA256 signature on the raw body.
 */
function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set')
    return false
  }
  const hmac    = crypto.createHmac('sha256', secret)
  const digest  = hmac.update(rawBody).digest('hex')
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature)
    )
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  // 1. Read raw body (needed for signature verification)
  const rawBody  = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  // 2. Verify signature
  if (!verifySignature(rawBody, signature)) {
    console.warn('[LS Webhook] Invalid signature — rejected')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 3. Parse payload
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName = payload?.meta?.event_name as string
  console.log(`[LS Webhook] Event received: ${eventName}`)

  // 4. Handle events
  switch (eventName) {

    // ── New subscription created / payment succeeded ──────────────────────
    case 'order_created':
    case 'subscription_created': {
      const userId = payload?.meta?.custom_data?.user_id as string | undefined

      if (!userId) {
        console.error('[LS Webhook] No user_id in custom_data — cannot upgrade')
        // Return 200 so Lemon Squeezy doesn't keep retrying
        return NextResponse.json({ received: true })
      }

      const lsCustomerId     = String(payload?.data?.attributes?.customer_id  ?? '')
      const lsSubscriptionId = String(payload?.data?.id ?? '')

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id:                     userId,
          plan:                   'pro',
          stripe_customer_id:     lsCustomerId,      // reusing the column for LS customer id
          stripe_subscription_id: lsSubscriptionId,  // reusing the column for LS subscription id
          upgraded_at:            new Date().toISOString(),
        })

      if (error) {
        console.error('[LS Webhook] Failed to upgrade profile:', error.message)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      console.log(`[LS Webhook] User ${userId} upgraded to pro ✓`)
      break
    }

    // ── Subscription cancelled / expired ─────────────────────────────────
    case 'subscription_cancelled':
    case 'subscription_expired': {
      const lsSubscriptionId = String(payload?.data?.id ?? '')

      if (!lsSubscriptionId) break

      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'free' })
        .eq('stripe_subscription_id', lsSubscriptionId)

      if (error) {
        console.error('[LS Webhook] Failed to downgrade profile:', error.message)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      console.log(`[LS Webhook] Subscription ${lsSubscriptionId} cancelled — downgraded to free ✓`)
      break
    }

    // ── Subscription resumed (user re-subscribes after cancelling) ────────
    case 'subscription_resumed':
    case 'subscription_unpaused': {
      const lsSubscriptionId = String(payload?.data?.id ?? '')

      if (!lsSubscriptionId) break

      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'pro', upgraded_at: new Date().toISOString() })
        .eq('stripe_subscription_id', lsSubscriptionId)

      if (error) {
        console.error('[LS Webhook] Failed to resume profile:', error.message)
      } else {
        console.log(`[LS Webhook] Subscription ${lsSubscriptionId} resumed ✓`)
      }
      break
    }

    default:
      // Silently acknowledge unhandled events (payment_method updates, etc.)
      console.log(`[LS Webhook] Unhandled event: ${eventName} — ignoring`)
  }

  return NextResponse.json({ received: true })
}