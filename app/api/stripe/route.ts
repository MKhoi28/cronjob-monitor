import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getIP } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // ---- Rate limiting ----
  // 10 checkout attempts per hour per IP
  const ip = getIP(request)
  const limit = rateLimit(`stripe:${ip}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  })

  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 }
    )
  }

  // ---- Auth check ----
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // ---- Validate env vars are present ----
  if (!process.env.STRIPE_PRICE_ID) {
    console.error('[stripe] STRIPE_PRICE_ID not set')
    return NextResponse.json(
      { error: 'Payment configuration error' },
      { status: 500 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      // Expire session after 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe] Checkout error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}