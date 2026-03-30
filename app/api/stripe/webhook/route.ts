import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Service role — needed to write to profiles table
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // ── Verify the event came from Stripe ─────────────────────────────────
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Handle events ──────────────────────────────────────────────────────
  try {
    switch (event.type) {

      // Payment succeeded — upgrade the user to Pro
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const email   = session.customer_email

        if (!email) {
          console.error('[webhook] No customer_email in session:', session.id)
          break
        }

        // Find the Supabase user by email
        const { data: { users }, error: userErr } = await supabase.auth.admin.listUsers()
        if (userErr) { console.error('[webhook] listUsers failed:', userErr.message); break }

        const user = users.find(u => u.email === email)
        if (!user) { console.error('[webhook] No user for email:', email); break }

        // Upsert profile — creates the row if it doesn't exist yet
        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert({
            id:                     user.id,
            plan:                   'pro',
            stripe_customer_id:     session.customer as string,
            stripe_subscription_id: session.subscription as string,
            upgraded_at:            new Date().toISOString(),
          }, { onConflict: 'id' })

        if (profileErr) {
          console.error('[webhook] Failed to update profile:', profileErr.message)
          break
        }

        console.log(`[webhook] ✓ Upgraded ${email} to Pro`)
        break
      }

      // Subscription cancelled — downgrade back to free
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { data: profile, error: findErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (findErr || !profile) {
          console.error('[webhook] No profile for subscription:', subscription.id)
          break
        }

        await supabase
          .from('profiles')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('id', profile.id)

        console.log(`[webhook] ✓ Downgraded ${subscription.id} to free`)
        break
      }

      // Payment failed — log for now, email later
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn('[webhook] Payment failed for customer:', invoice.customer)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}